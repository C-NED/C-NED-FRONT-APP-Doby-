import React, { useState } from 'react';
import { View, StyleSheet, Text, Button, Image, ToastAndroid } from 'react-native';

export default function NavigationScreen() {
  const [laneCount, setLaneCount] = useState(4);

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
    ainc:false
  });

  const [toastMsg, setToastMsg] = useState('');
  
  const handleAlert = (key, message) => {
    setAlerts((prev) => ({ ...prev, [key]: true }));
    // Tts.speak(message);
    setToastMsg(message);
    setTimeout(() => setToastMsg(''), 20000); // 2초 후 자동 사라짐
  };

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
        <Image source={alerts.dinc ? require('../styles/icons/dincident_green.png'):require('../styles/icons/dincident.png')} style={{height:60,width:60}} />
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
        <Image source={alerts.ainc?require('../styles/icons/ai_danger_purple.png'):require('../styles/icons/ai_danger.png')} style={{height:120,width:120}} />
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
    transform: [{ perspective: 800 }, { rotateX: '60deg' }],
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
    top: '40%',
    left: '10%',
    width: '80%',
    height: 150,
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
