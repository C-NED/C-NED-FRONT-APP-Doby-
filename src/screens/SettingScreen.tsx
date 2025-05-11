import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SettingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚙️ 설정</Text>
      <Text style={styles.text}>앱 설정 및 사용자 정보가 여기에 표시됩니다.</Text>
    </View>
  );
}