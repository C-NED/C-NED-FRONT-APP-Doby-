import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { WebView } from 'react-native-webview';

const callYourRouteApi = ({ from, to }) => {
  console.log('🚀 API 호출');
  console.log('출발지:', from);
  console.log('도착지:', to);
};

// 🛑 더미 유사도 API (실제로는 네가 만든 API로 교체)
const fetchSimilarPlace = async (keyword) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        keyword: `${keyword}`,
        lat: 37.5665 + Math.random() * 0.01,
        lng: 126.9780 + Math.random() * 0.01,
      });
    }, 300);
  });
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

  const routeList = [
    { time: '1시간 32분', label: '(가장 빠른 길)', traffic: ['#00E676', '#00E676', '#FFEB3B', '#00E676'] },
    { time: '1시간 45분', label: '(혼잡 구간 있음)', traffic: ['#FFEB3B', '#FFEB3B', '#FF5722', '#FFEB3B'] },
  ];

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

    // 1. 유사도 API 호출
    try {
      const result = await fetchSimilarPlace(searchInput);

      // 2. RN state 저장
      if (type === 'start') {
        setStart(result.keyword);
        setStartCoords({ lat: result.lat, lng: result.lng });
      } else {
        setEnd(result.keyword);
        setEndCoords({ lat: result.lat, lng: result.lng });
      }

      // 3. WebView에 마커 표시 명령
      sendPlaceToWebView(result.keyword, result.lat, result.lng, type);
    } catch (error) {
      console.error('유사도 API 오류:', error);
    }
  };

  useEffect(() => {
    if (startCoords && endCoords) {
      callYourRouteApi({ from: startCoords, to: endCoords });
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
            {routeList.map((item, index) => (
              <TouchableOpacity key={index} onPress={() => console.log(`선택한 경로: ${item.label}`)} style={[styles.cardContainer, { marginBottom: 15 }]}>
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
