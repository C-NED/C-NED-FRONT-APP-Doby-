import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, ScrollView, Keyboard } from 'react-native';
import { WebView } from 'react-native-webview';
import axiosInstance from '../api/axiosInstance';
import { useNavigation } from '@react-navigation/native';

const callRouteApi = ({ from, to }) => {
  console.log('🚀 API 호출');
  console.log('출발지:', from);
  console.log('도착지:', to);
};

export default function PathSelectScreen() {
  const webviewRef = useRef();
  const [searchInput, setSearchInput] = useState('');
  const [selecting, setSelecting] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [startCoords, setStartCoords] = useState(null);
  const [endCoords, setEndCoords] = useState(null);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const roadOptions = ['trafast', 'tracomfort', 'traoptimal', 'traavoidtoll', 'traavoidcaronly'];
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const formatDuration = (ms: number): string => {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) return `${hours}시간 ${minutes}분`;
  return `${minutes}분`;
};

const optionLabelMap: Record<string, string> = {
  trafast: "가장 빠른 길",
  tracomfort: "편한 길",
  traoptimal: "최적 경로",
  traavoidtoll: "무료 도로 우선",
  traavoidcaronly: "일반 도로 우선",
};

const trafficColorMap = {
  0: "#000000", // 신호없음
  1: "#00E676", // 원활
  2: "#FFEB3B", // 서행
  3: "#FF5722", // 정체
};

  const fetchDestination = async () => {
    if (searchInput.trim() === '') return;

    try {
      Keyboard.dismiss(); // 키보드 닫기 (UX 개선)
      const res = await axiosInstance.get(
        `/navigation/locationpick/search?keyword=${encodeURIComponent(searchInput)}`,
      );
      console.log('📍 목적지 검색 결과:', res.data);
      const keyword = searchInput;
      const lng = res.data.mapx;
      const lat = res.data.mapy;
      const rAddr = res.data.roadAddress;
      console.log('📍 검색된 목적지:', keyword, lat, lng, rAddr);
      return { keyword, lat, lng, rAddr };
    } catch (error) {
      console.error('❌ 목적지 요청 실패:', error);
    }
  };

  const requestAllRoutes = async () => {
  setLoading(true); // ✅ 로딩 시작
  const Newroutes = [];

  for (let i = 0; i < roadOptions.length; i++) {
    const option = roadOptions[i];

    try {
     const res = await axiosInstance.get(
        `/navigation/route_guide?start=${startCoords.lng}&start=${startCoords.lat}&goal=${endCoords.lng}&goal=${endCoords.lat}&road_option=${option}`,
      );

      console.log(`📦 ${option} 응답 수신:`, res.data);

      const extractRouteSummary = (resData, option) => {
        const route = resData[option]?.[0];
        if (!route) return null;

        return {
          time: formatDuration(route.summary.duration),
          label: optionLabelMap[option] || '경로',
          traffic: route.section.map(sec => trafficColorMap[sec.congestion]),
          realLabel:option
        };
      };

      // ✅ 여기서 res.data를 파싱하여 Newroutes에 추가
      const routeSummary = extractRouteSummary(res.data, option);
      console.log('🚀 Newroutes:', routeSummary);
      Newroutes.push(routeSummary);

      // Newroutes.push({
      //   option,
      //   ...res.data, // ← 이미 파싱 완료 상태로 들어간다고 가정
      // });

    } catch (err) {
      console.error(`❌ ${option} 요청 실패:`, err);
    }

    await new Promise(resolve => setTimeout(resolve, 10000));
  }

  setRoutes(Newroutes); // ✅ 한 번에 상태 업데이트
  setLoading(false); // ✅ 로딩 종료
};

  
 const selectRoute = async (start, end, option: roadOptions) => {
  const attemptRoute = async (startCoords, endCoords) => {
    const payload = {
      start: [parseFloat(startCoords.lat), parseFloat(startCoords.lng)],
      goal: [parseFloat(endCoords.lat), parseFloat(endCoords.lng)],
      road_option: option,
    };

    try {
      const res = await axiosInstance.post(`/navigation/create`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.status === 200) {
        console.log('🧾 받은 응답:', JSON.stringify(res.data, null, 2));
        console.log('📦 경로 선택 응답 수신:', res.data);
        return res.data;
      }

      return null;
    } catch (err) {
      console.error('❌ 경로 선택 요청 실패:', err);
      return null;
    }
  };

  let currentStart = start;
  let currentEnd = end;

  for (let i = 0; i < 3; i++) {
    const result = await attemptRoute(currentStart, currentEnd);
    if (result) {
      navigation.navigate('Navi');
      return result;
    }

    try {
      const matchRes = await axiosInstance.get(
        `/navigation/search_road_location?lat=${currentStart.lat}&lng=${currentStart.lng}&goal_lat=${currentEnd.lat}&goal_lng=${currentEnd.lng}`
      );
      const newCoords = matchRes.data;
      console.log('🧭 좌표 보정됨:', JSON.stringify(newCoords, null, 2));

      currentStart = {
        lat: newCoords.start_lat,
        lng: newCoords.start_lng,
      };
      currentEnd = {
        lat: newCoords.goal_lat,
        lng: newCoords.goal_lng,
      };
    } catch (err) {
      console.error('📛 좌표 보정 실패:', err);
      break;
    }
  }

  console.log('경로 요청 실패', '경로를 찾을 수 없습니다. 도로 위 위치를 선택해주세요.');
  return null;
};


  // const routeList = [
  //   { time: '1시간 32분', label: '(가장 빠른 길)', traffic: ['#00E676', '#00E676', '#FFEB3B', '#00E676'] },
  //   { time: '1시간 45분', label: '(혼잡 구간 있음)', traffic: ['#FFEB3B', '#FFEB3B', '#FF5722', '#FFEB3B'] },
  // ];

  // ✅ RN → WebView : 마커 표시 명령만
  const sendPlaceToWebView = (keyword, lat, lng, mode) => {
    if (webviewRef.current) {
      console.log('RN → WebView 마커 표시:', keyword, lat, lng, mode);
      webviewRef.current.postMessage(JSON.stringify({
        type: 'markPlace',
        data: { keyword, lat, lng, mode },
      }));
    }
  };

  const handleLocationClick = async (type) => {
    if (searchInput.trim() === '') {
      alert('검색어를 입력하세요');
      return;
    }

    setSelecting(type);
    setShowMap(true);

    // 3초 뒤에 자동으로 숨기기
    setTimeout(() => {
      setShowMap(false); // ✅ WebView 숨기기
    }, 4000);

    // 1. 유사도 API 호출
    try {
      const result = await fetchDestination(searchInput);

      // 2. RN state 저장
      if (type === 'start') {
        setStart(result?.keyword);
        setStartCoords({ lat: result?.lat, lng: result?.lng });
      } else {
        setEnd(result?.keyword);
        setEndCoords({ lat: result?.lat, lng: result?.lng });
      }

      // 3. WebView에 마커 표시 명령
      sendPlaceToWebView(result?.keyword, result?.lat, result?.lng, type);
    } catch (error) {
      console.error('검색어 API 오류:', error);
    }
  };

    const hasRunRef = useRef(false);

  useEffect(() => {
    if (startCoords && endCoords && !hasRunRef.current) {
      callRouteApi({ from: startCoords, to: endCoords });
      hasRunRef.current = true; // ✅ 중복 실행 방지
      requestAllRoutes();
    }
  }, [startCoords, endCoords]);

  return (
    <ScrollView style={{ backgroundColor: '#373737' }} contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <View style={styles.searchView}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEEEEE', borderRadius: 8 }}>
            <Image source={require('../styles/icons/search.png')} style={{ width: 25, height: 25, marginLeft: '5%' }} />
            <TextInput
              placeholder="장소를 검색하세요"
              style={[styles.searchInput, { backgroundColor: '#EEEEEE' }]}
              value={searchInput}
              onChangeText={setSearchInput}
              onSubmitEditing={fetchDestination} // ✅ 엔터 키 누를 때만 실행
              returnKeyType="search"
              blurOnSubmit={true} // 안드에서 submit 후 키보드 내려가도록
              multiline={false} // 꼭 false여야 엔터가 "완료"로 동작함
            />
          </View>
        </View>

        <View style={styles.locationRow}>
          <TouchableOpacity onPress={() => handleLocationClick('start')}>
            <Text style={[styles.locationButton, selecting === 'start' && { color: '#fffda7' }]}>출발지</Text>
          </TouchableOpacity>
          <Image source={require('../styles/icons/arrow.png')} style={{ width: 25, height: 25, marginHorizontal: 10 }} />
          <TouchableOpacity onPress={() => handleLocationClick('end')}>
            <Text style={[styles.locationButton, selecting === 'end' && { color: '#fffda7' }]}>도착지</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.selectedRow}>
          <Image source={require('../styles/icons/marker.png')} style={{ width: 25, height: 25, marginHorizontal: 10 }} />
          <Text style={styles.selectedText}>{start || '선택 안됨'}</Text>
          <Image source={require('../styles/icons/arrow.png')} style={{ width: 25, height: 25, marginHorizontal: 10 }} />
          <Text style={styles.selectedText}>{end || '선택 안됨'}</Text>
        </View>

        {showMap && (
          <View style={{ height: '66%', width: '83%', marginTop: 20 }}>
            <WebView
              ref={webviewRef}
              source={{ uri: 'http://lynnkrealm.me/' }}
              onMessage={(event) => console.log('📲 WebView 메시지 수신:', event.nativeEvent.data)}
              originWhitelist={['*']}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              style={{ width: '100%', height: '100%' }}
            />
          </View>
        )}

        {!showMap && startCoords && endCoords && (
          <View style={{ width: '83%', marginTop: 20 }}>
            {routes.map((item, index) => (
              <TouchableOpacity key={index} onPress={() => selectRoute(startCoords,endCoords,item.realLabel)} style={[styles.cardContainer, { marginBottom: 15 }]}>
                <View style={styles.topRow}>
                  <Text style={styles.timeText}>{item.time}</Text>
                  <View style={styles.dotRow}>
                    {item.traffic.map((color, i) => (
                      <View key={i} style={[styles.dot, { backgroundColor: color }]} />
                    ))}
                  </View>
                </View>
                <Text style={styles.subText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  searchView: { marginTop: 20, width: '83%' },
  searchInput: { flex: 1, marginLeft: 10, borderRadius: 8, paddingHorizontal: 10, height: 40 },
  locationRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20, width: '83%', backgroundColor: '#5F5F5F', paddingVertical: 7, borderRadius: 8 },
  locationButton: { fontSize: 20, color: 'white', marginHorizontal: 10 },
  selectedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', marginTop: 10, width: '83%', paddingVertical: 10, borderRadius: 8 },
  selectedText: { fontSize: 23, color: 'white', marginHorizontal: 10 },
  cardContainer: { backgroundColor: '#4B4B4B', padding: 15, borderRadius: 10 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timeText: { color: 'white', fontSize: 18 },
  dotRow: { flexDirection: 'row', marginLeft: 10 },
  dot: { width: 10, height: 10, borderRadius: 5, marginHorizontal: 2 },
  subText: { color: 'white', marginTop: 5, fontSize: 14 },
});
