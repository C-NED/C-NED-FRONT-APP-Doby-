import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Image, TextInput,
  TouchableOpacity, ScrollView, Keyboard,
  ActivityIndicator
} from 'react-native';
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
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const roadOptions = ['trafast', 'tracomfort', 'traoptimal', 'traavoidtoll', 'traavoidcaronly'];

  const formatDuration = (ms) => {
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours > 0 ? `${hours}시간 ${minutes}분` : `${minutes}분`;
  };

  const optionLabelMap = {
    trafast: "가장 빠른 길",
    tracomfort: "편한 길",
    traoptimal: "최적 경로",
    traavoidtoll: "무료 도로 우선",
    traavoidcaronly: "일반 도로 우선",
  };

  const trafficColorMap = {
    0: "#000000",
    1: "#00E676",
    2: "#FFEB3B",
    3: "#FF5722",
  };

  const fetchDestination = async () => {
    if (searchInput.trim() === '') return;
    try {
      Keyboard.dismiss();
      setLoading(true);
      const res = await axiosInstance.get(`/navigation/locationpick/search?keyword=${encodeURIComponent(searchInput)}`);
      const keyword = searchInput;
      const { mapx: lng, mapy: lat, roadAddress: rAddr } = res.data;
      return { keyword, lat, lng, rAddr };
    } catch (error) {
      console.error('❌ 목적지 요청 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestAllRoutes = async () => {
    setLoading(true);
    const Newroutes = [];
    for (let option of roadOptions) {
      try {
        const res = await axiosInstance.get(
          `/navigation/route_guide?start=${startCoords.lng}&start=${startCoords.lat}&goal=${endCoords.lng}&goal=${endCoords.lat}&road_option=${option}`
        );
        const route = res.data[option]?.[0];
        if (!route) continue;
        Newroutes.push({
          time: formatDuration(route.summary.duration),
          label: optionLabelMap[option],
          traffic: route.section.map(sec => trafficColorMap[sec.congestion]),
          realLabel: option
        });
      } catch (err) {
        console.error(`❌ ${option} 요청 실패:`, err);
      }
      await new Promise(res => setTimeout(res, 10000));
    }
    setRoutes(Newroutes);
    setLoading(false);
  };

 const selectRoute = async (start, end, option) => {
  setLoading(true); // ✅ 로딩 시작
  const attemptRoute = async (startCoords, endCoords) => {
    const payload = {
      start: [parseFloat(startCoords.lat), parseFloat(startCoords.lng)],
      goal: [parseFloat(endCoords.lat), parseFloat(endCoords.lng)],
      road_option: option,
    };

    try {
      const res = await axiosInstance.post(`/navigation/create`, payload);
      if (res.status === 200) {
        if (res.status === 200) {
          const navigationId = res.data?.navigation_id;
          console.log('📦 생성된 navigation_id:', navigationId);
          navigation.navigate('Navi', { navigationId }); // ✅ 전달
          return res.data;
        }

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
      setLoading(false); // ✅ 로딩 종료
      return result;
    }

    try {
      const matchRes = await axiosInstance.get(
        `/navigation/search_road_location?lat=${currentStart.lat}&lng=${currentStart.lng}&goal_lat=${currentEnd.lat}&goal_lng=${currentEnd.lng}`
      );
      const newCoords = matchRes.data;
      currentStart = { lat: newCoords.start_lat, lng: newCoords.start_lng };
      currentEnd = { lat: newCoords.goal_lat, lng: newCoords.goal_lng };
    } catch (err) {
      console.error('📛 좌표 보정 실패:', err);
      break;
    }
  }

  setLoading(false); // ✅ 실패해도 로딩 종료
  alert('경로를 찾을 수 없습니다. 도로 위 위치를 선택해주세요.');
  return null;
};


  const sendPlaceToWebView = (keyword, lat, lng, mode) => {
    if (webviewRef.current) {
      webviewRef.current.postMessage(JSON.stringify({
        type: 'markPlace',
        data: { keyword, lat, lng, mode },
      }));
    }
  };

  const handleLocationClick = async (type) => {
    if (searchInput.trim() === '') return alert('검색어를 입력하세요');
    setSelecting(type);
    setShowMap(true);
    setTimeout(() => setShowMap(false), 4000);
    try {
      const result = await fetchDestination(searchInput);
      if (type === 'start') {
        setStart(result?.keyword);
        setStartCoords({ lat: result?.lat, lng: result?.lng });
        setSearchInput(''); // 🔄 검색창 초기화
      } else {
        setEnd(result?.keyword);
        setEndCoords({ lat: result?.lat, lng: result?.lng });
        setSearchInput(''); // 🔄 검색창 초기화
      }
      sendPlaceToWebView(result?.keyword, result?.lat, result?.lng, type);
    } catch (error) {
      console.error('검색어 API 오류:', error);
    }
  };

  const hasRunRef = useRef(false);
  useEffect(() => {
    if (startCoords && endCoords && !hasRunRef.current) {
      callRouteApi({ from: startCoords, to: endCoords });
      hasRunRef.current = true;
      requestAllRoutes();
    }
  }, [startCoords, endCoords]);

  return (
    <ScrollView style={{ backgroundColor: '#373737' }} contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        {/* 검색창 */}
        <View style={styles.searchView}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEEEEE', borderRadius: 8 }}>
            <Image source={require('../styles/icons/search.png')} style={{ width: 25, height: 25, marginLeft: '5%' }} />
            <TextInput
              placeholder="장소를 검색하세요"
              style={[styles.searchInput, { backgroundColor: '#EEEEEE' }]}
              value={searchInput}
              onChangeText={setSearchInput}
              onSubmitEditing={fetchDestination}
              returnKeyType="search"
              blurOnSubmit={true}
              multiline={false}
            />
          </View>
        </View>

        {/* 출발지/도착지 버튼 */}
        <View style={styles.locationRow}>
          <TouchableOpacity onPress={() => handleLocationClick('start')}>
            <Text style={[styles.locationButton, selecting === 'start' && { color: '#fffda7' }]}>출발지</Text>
          </TouchableOpacity>
          <Image source={require('../styles/icons/arrow.png')} style={{ width: 25, height: 25, marginHorizontal: 10 }} />
          <TouchableOpacity onPress={() => handleLocationClick('end')}>
            <Text style={[styles.locationButton, selecting === 'end' && { color: '#fffda7' }]}>도착지</Text>
          </TouchableOpacity>
        </View>

        {/* 선택된 경로 표시 */}
        <View style={styles.selectedRow}>
          <Image source={require('../styles/icons/marker.png')} style={{ width: 25, height: 25, marginHorizontal: 10 }} />
          <Text style={styles.selectedText}>{start || '선택 안됨'}</Text>
          <Image source={require('../styles/icons/arrow.png')} style={{ width: 25, height: 25, marginHorizontal: 10 }} />
          <Text style={styles.selectedText}>{end || '선택 안됨'}</Text>
        </View>

        {/* 지도 WebView */}
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

        {/* 경로 선택 카드 */}
        {!showMap && startCoords && endCoords && (
          <View style={{ width: '83%', marginTop: 20 }}>
            {routes.map((item, index) => (
              <TouchableOpacity key={index} onPress={() => selectRoute(startCoords, endCoords, item.realLabel)} style={[styles.cardContainer, { marginBottom: 15 }]}>
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

        {/* 로딩 오버레이 */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.loadingText}>경로를 불러오는 중입니다...</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center',marginTop:'5%' },
  searchView: { marginTop: 20, width: '83%' },
  searchInput: { flex: 1, marginLeft: 10, borderRadius: 8, paddingHorizontal: 10, height: 50 },
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingText: {
    marginTop: 10,
    color: 'white',
    fontSize: 16,
  },
});
