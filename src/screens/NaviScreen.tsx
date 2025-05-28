import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Text, Button, Image, ToastAndroid } from 'react-native';
import { useCurrentLocation } from '../common/useLocation';
import Geolocation from 'react-native-geolocation-service';
import { updateLocation } from '../common/updateLocation';
import { useQuery } from '@tanstack/react-query';
import { useRoute } from '@react-navigation/native';
import axiosInstance from '../api/axiosInstance';
import { parseWKT } from '../common/parseWTK';
import { parseInstructionForHUD } from '../common/parseInstructionForHUD';
import type { ImageSourcePropType } from 'react-native';

export default function NavigationScreen() {
  const [laneCount, setLaneCount] = useState(2);
  const [instruction, setInstruction] = useState('');
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [nextdistance, setNextDistance] = useState(0);
  const [arrow, setArrow] = useState<string | ImageSourcePropType>('');
  const [landmark,setLandmark] = useState('')
  const simIndexRef = useRef(0);
  const testGPSRef = useRef({
  lat: 37.4979521,
  lng: 127.0276242,
  speed: 0,
  });

  const route = useRoute();
  const navigationId = route.params?.navigationId ?? 3; // fallback도 넣자

  const fetchGuide = async (id: number) => {
  const res = await axiosInstance.get(`/crud/user/navigation/guide/${id}`);
    return res.data.guide;
  };

  const RegistDataRedis = async (id: number) => {
  const res = await axiosInstance.post(
      `/crud/user/navigation/${id}/preload_all`,
      { nav_id: id },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return res;
  };

  const fetchData = async (id : number) => {
    const res = await axiosInstance.get(
      `/crud/user/navigation/${id}/get_cached_all`
    )

    return res.data
  }

  const { data: guideList } = useQuery(['guide', navigationId], () => fetchGuide(navigationId), {
  enabled: !!navigationId, // navigationId 없으면 안 보내도록
  });

 const { data, isLoading } = useQuery(['navigation-all', navigationId], () => fetchData(navigationId), {
  enabled: !!navigationId,
});

  const alertList = data?.alerts ?? [];
  const pathList = data?.path ?? [];
  const laneList = data?.lane ?? [];

  //차선 변경 로직
  const updateLaneFromApi = (apiLaneCount) => {
    console.log('Lane 변경됨:', apiLaneCount);
    setLaneCount(apiLaneCount);
  };

  const fixedLanePositions = {
    2: [15, 85],
    3: [15, 50, 85],
    4: [15, 35, 65, 85],
  };

  // const { arrow, landmark } = parseInstructionForHUD(instruction,nextdistance);
  
  const lanePositions = fixedLanePositions[laneCount] || [50];
  
  const [alerts, setAlerts] = useState({
    outbreak: true,
    vsl: true,
    dinc: true,
    caution: true,
    aic:true
  });

  const [toastMsg, setToastMsg] = useState('');
  
  const handleAlert = (key, message) => {
    setAlerts((prev) => ({ ...prev, [key]: true }));
    // Tts.speak(message);
    setToastMsg(message);
    setTimeout(() => setToastMsg(''), 2000); // 2초 후 자동 사라짐
  };

  const lastInstructionRef = useRef('');

  const parsedPathList = useMemo(() => {
    if (!pathList) return [];

    return pathList
      .map((p) => {
        const coords = parseWKT(p.point); // [lng, lat]
        if (!coords) return null;
        return {
          ...p,
          coords, // 좌표 추가됨
        };
      })
      .filter(Boolean); // 좌표 파싱 실패 제거
  }, [pathList]);

  const interpolate = (start, end, t) => start + (end - start) * t;

  const generateInterpolatedPoints = (startCoords, endCoords, steps = 10) => {
    const points = [];
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      points.push([
        interpolate(startCoords[0], endCoords[0], t), // lng
        interpolate(startCoords[1], endCoords[1], t), // lat
      ]);
    }
    return points;
  };
  

  useEffect(() => {
  (async () => {
    try {
      await RegistDataRedis(navigationId);
    } catch (err) {
      console.warn("🚨 Redis 등록 실패:", err);
    }
  })();
}, [navigationId]);


// 실시간 gps 방식
// useEffect(() => {
//   if (!guideList || parsedPathList.length < 2) return;

//   const watchId = Geolocation.watchPosition(
//     (pos) => {
//       const { latitude, longitude, speed } = pos.coords;
//       const newGPS = {
//         lat: latitude,
//         lng: longitude,
//         speed: speed ?? 0,
//       };
//       testGPSRef.current = newGPS;

//       const result = updateLocation(newGPS, parsedPathList, guideList);
//       setCurrentSpeed(result.speed); // 화면 표시용 속도

//       if (result.instruction !== lastInstructionRef.current) {
//         lastInstructionRef.current = result.instruction;
//         const { arrow, landmark } = parseInstructionForHUD(result.instruction);
//         setInstruction(result.instruction);
//         setToastMsg(`${arrow} ${landmark}`);
//       }

//       console.log("📡 실시간 GPS:", newGPS);
//       console.log("➡️ 안내:", result.instruction);
//     },
//     (err) => {
//       console.warn("📡 GPS 에러:", err);
//     },
//     {
//       enableHighAccuracy: true,
//       distanceFilter: 5,
//       interval: 1000,
//       fastestInterval: 500,
//     }
//   );

//   return () => {
//     Geolocation.clearWatch(watchId);
//   };
// }, [guideList, parsedPathList]);


// 시뮬레이션 gps 방식
useEffect(() => {
  if (!guideList || parsedPathList.length < 2) return;
  console.log("laneList :",laneList)
  console.log("Alerts : ",alertList)

  let currentPathIdx = 0;
  let subStepIdx = 0;
  let subSteps = generateInterpolatedPoints(
    parsedPathList[0].coords,
    parsedPathList[1].coords,
    10
  );

  const interval = setInterval(() => {
    if (currentPathIdx >= parsedPathList.length - 1) {
      clearInterval(interval);
      return;
    }

    const [lng, lat] = subSteps[subStepIdx] || [];

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      clearInterval(interval);
      return;
    }

    const newGPS = { lat, lng, speed: 0 };
    testGPSRef.current = newGPS;

    const result = updateLocation(
      newGPS,
      parsedPathList,
      guideList,
      laneList
    );

    setCurrentSpeed(result.speed);

    console.log("📡 시뮬 GPS:", newGPS);
    console.log("➡️ 안내:", result.instruction);

    if (result.instruction !== lastInstructionRef.current) {
      lastInstructionRef.current = result.instruction;

    const { arrow, landmark } = parseInstructionForHUD(
        result.instruction,
        result.nextdistance ?? 0 // 🧩 여기서 거리 전달
      );

      setInstruction(result.instruction);
      setToastMsg(`${arrow} ${landmark}`);
      setArrow(arrow)
      setLandmark(landmark)
      setLaneCount(result.laneCount)
    }

    subStepIdx++;

    if (subStepIdx >= subSteps.length) {
      currentPathIdx++;
      subStepIdx = 0;
      if (currentPathIdx < parsedPathList.length - 1) {
        subSteps = generateInterpolatedPoints(
          parsedPathList[currentPathIdx].coords,
          parsedPathList[currentPathIdx + 1].coords,
          10
        );
      }
    }
  }, 300); // 0.3초마다 1스텝씩 이동

  return () => clearInterval(interval);
}, [guideList, parsedPathList]);



  return (
    <View style={styles.container}>
        {/* 중앙 토스트 */}
      {toastMsg !== '' && (
      <View style={styles.toast}>
        <Image style={styles.arrowIcon} source={arrow} resizeMode="contain" />
        <Text style={styles.toastText}>{landmark}</Text>
      </View>
    )}
      <View style={styles.topIcons}>
        <Image source={alerts.outbreak ? require('../styles/icons/outbreak_blue.png') : require('../styles/icons/outbreak.png')} style={{height:60,width:60}} />
        <Image source={alerts.vsl ? require('../styles/icons/vsl_red.png') : require('../styles/icons/vsl.png')} style={{height:60,width:60}} />
        <Image source={alerts.dinc ? require('../styles/icons/dincident_green.png'):require('../styles/icons/dincident.png')} style={{height:65,width:65}} />
        <Image source={alerts.caution ? require('../styles/icons/caution_yellow.png'):require('../styles/icons/caution.png')} style={{height:60,width:60}} />
      </View>

      {/* 도로 영역 */}
      <View style={styles.road}>
        {/* 차선 라인들 */}
        {lanePositions.map((pos, idx) => (
          <View
            key={idx}
            style={[
              styles.laneLine,
              { left: `${pos}%` },
            ]}
          />
        ))}
      </View>

      <View style={styles.bottomIcons}>
        <Image source={alerts.aic?require('../styles/icons/ai_danger_purple.png'):require('../styles/icons/ai_danger.png')} style={{height:120,width:120}} />
        <View style={{ width: 200, height: 120, position: 'relative' }}>
          <Image
            source={require('../styles/icons/speed.png')}
            style={{
              width: 140,
              height: 140,
              position: 'absolute',
              left: 40,
            }}
          />
          <Text style={{
            position: 'absolute',
            top: 20,
            left: 0,
            width: 200,
            textAlign: 'center',
            color: 'yellow',
            fontSize: 70,
            fontWeight: 'bold',
          }}>
            {(currentSpeed * 3.6).toFixed(1)}
          </Text>
        </View>
      </View>

      {/* <View style={styles.buttonArea}>
        <Button title="2차선" onPress={() => updateLaneFromApi(2)} />
        <Button title="3차선" onPress={() => updateLaneFromApi(3)} />
        <Button title="4차선" onPress={() => updateLaneFromApi(4)} />
      </View> */}

      {/* <View style={[styles.buttons,{scaleX:-1}]}>
        <Button title="Crash" onPress={() => handleAlert('crash', '충돌 위험 주의하세요')} />
        <Button title="Stop" onPress={() => handleAlert('stop', '정지 구간입니다')} />
        <Button title="Truck" onPress={() => handleAlert('truck', '위험물질 차량 출현')} />
        <Button title="Warning" onPress={() => handleAlert('warning', '주의운전구간입니다')} />
      </View> */}
    
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    scaleX: -1
  },
  road: {
    position: 'absolute',
    top: '-15%',
    left: 0,
    right: 0,
    bottom: '8%',
    backgroundColor: '#111',
    transform: [{ perspective: 600 }, { rotateX: '60deg' }],
    overflow: 'hidden',
  },
  laneLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#fff',
  },
  topIcons: {
    position: 'absolute',
    top: '5%',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    opacity: 0.9,
  },
  bottomIcons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  iconText: {
    color: '#fff',
    fontSize: 24,
  },
  toast: {
    position: 'absolute',
    top: '27%',
    left: '10%',
    width: '80%',
    height: 300,
    backgroundColor: 'rgba(0,0,0,0.9)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 999,
  },
  toastText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  buttonArea: {
    position: 'absolute',
    bottom: 100,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  arrowIcon: {
  width:150,
  height: 150,
  marginBottom: 10,
  color: 'white',
},
});
