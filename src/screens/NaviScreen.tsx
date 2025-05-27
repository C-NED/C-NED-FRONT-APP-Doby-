import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Text, Button, Image, ToastAndroid } from 'react-native';
import { useCurrentLocation } from '../common/useLocation';
import Geolocation from 'react-native-geolocation-service';
import { updateLocation } from '../common/updateLocation';
import { useQuery } from '@tanstack/react-query';
import { useRoute } from '@react-navigation/native';
import axiosInstance from '../api/axiosInstance';
import { parseWKT } from '../common/parseWTK';

export default function NavigationScreen() {
  const [laneCount, setLaneCount] = useState(4);
  const [instruction, setInstruction] = useState('');
  const simIndexRef = useRef(0);
  const testGPSRef = useRef({
  lat: 37.4979521,
  lng: 127.0276242,
  speed: 3,
  });

  const route = useRoute();
  const navigationId = route.params?.navigationId ?? 3; // fallback도 넣자

  const fetchGuide = async (id: number) => {
  const res = await axiosInstance.get(`/crud/user/navigation/guide/${id}`);
    return res.data.guide;
  };

  const RegistPathRedis = async (id: number) => {
  const res = await axiosInstance.post(
      `/crud/user/navigation/${id}/preload_path`,
      { nav_id: id },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return res;
  };

  const fetchPath = async (id : number) => {
    const res = await axiosInstance.get(
      `/crud/user/navigation/${id}/get_cached_path`
    )

    return res.data
  }

  const { data: guideList } = useQuery(['guide', navigationId], () => fetchGuide(navigationId), {
  enabled: !!navigationId, // navigationId 없으면 안 보내도록
  });

  const { data: pathList } = useQuery(['path', navigationId], () => fetchPath(navigationId), {
  enabled: !!navigationId, // navigationId 없으면 안 보내도록
  });

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



  useEffect(() => {
  (async () => {
    try {
      await RegistPathRedis(navigationId);
    } catch (err) {
      console.warn("🚨 Redis 등록 실패:", err);
    }
  })();
}, [navigationId]);

// useEffect(() => {
//   if (!guideList || !pathList) return;
//   // console.log("✅ pathList:", pathList);

//   const interval = setInterval(() => {
//   const [lng, lat] = parsedPath[simIndexRef.current] || [];
//   if (!lat || !lng) {
//     clearInterval(interval);
//     return;
//   }

//   testGPSRef.current = { lat, lng, speed: 3 };

//   simIndexRef.current += 1;
// }, 3000);

//   const watchId = Geolocation.watchPosition(
//     (pos) => {
//       // console.log("📡 실시간 GPS 확인:", pos)
//       console.log("📡 실시간 GPS 확인:", testGPSRef.current,);
//       const { latitude, longitude, speed } = pos.coords;
//       const result = updateLocation(
//         testGPSRef.current, // testGPS로 대체
//         parsedPath,
//         guideList
//       );

//       if (result.instruction !== lastInstructionRef.current) {
//         setInstruction(result.instruction);
//         setToastMsg(result.instruction);
//         lastInstructionRef.current = result.instruction;
//       }
//     },
//     (err) => console.warn("GPS 에러:", err),
//     { enableHighAccuracy: true, distanceFilter: 5, interval: 3000 }
//   );

//   return () => {
//     Geolocation.clearWatch(watchId);
//   };
// }, [guideList, parsedPath]);
  useEffect(() => {
  if (!guideList || !parsedPathList.length) return;

  console.log('parsedPath:', parsedPathList);

  const interval = setInterval(() => {
    const currentPath = parsedPathList[simIndexRef.current];

    if (!currentPath || !currentPath.coords) {
      clearInterval(interval);
      return;
    }

    const [lng, lat] = currentPath.coords;

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      clearInterval(interval);
      return;
    }

    const newGPS = { lat, lng, speed: 3 };
    testGPSRef.current = newGPS;

    const result = updateLocation(
      newGPS,
      parsedPathList,
      guideList
    );

    console.log("📡 시뮬 GPS:", newGPS);
    console.log("➡️ 안내:", result.instruction);

    if (result.instruction !== lastInstructionRef.current) {
      setInstruction(result.instruction);
      setToastMsg(result.instruction);
      lastInstructionRef.current = result.instruction;
    }

    simIndexRef.current += 1;
  }, 3000);

  return () => clearInterval(interval);
}, [guideList, parsedPathList]);


  return (
    <View style={styles.container}>
        {/* 중앙 토스트 */}
      {toastMsg !== '' && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMsg}</Text>
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
        <Image source={require('../styles/icons/speed.png')} style={{height:120,width:120}} />
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
    scaleX: -1
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
});
