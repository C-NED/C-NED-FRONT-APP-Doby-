import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import styles from '../styles/theme';

export default function HistoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title1}>🕘 기록</Text>
      <Text>최근 경로 기록이 여기에 표시됩니다.</Text>
    </View>
  );
}