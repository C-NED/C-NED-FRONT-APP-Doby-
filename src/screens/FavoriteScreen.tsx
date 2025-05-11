import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import styles from '../styles/theme';

export default function FavoriteScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title1}>⭐ 즐겨찾기</Text>
      <Text style={styles.title2}>⭐ 즐겨찾기</Text>
      <Text>여기에 즐겨찾은 장소들이 표시됩니다.</Text>
    </View>
  );
}