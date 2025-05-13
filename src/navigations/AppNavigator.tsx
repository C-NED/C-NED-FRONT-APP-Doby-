import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import { Image } from 'react-native';
import HistoryScreen from '../screens/HistoryScreen';
import FavoriteScreen from '../screens/FavoriteScreen';
import SettingScreen from '../screens/SettingScreen';
import PathSelectScreen from '../screens/PathSelectScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          let icon;

          if (route.name === '홈') {
            icon = focused
              ? require('../styles/icons/home_final.png')
              : require('../styles/icons/home.png');
          } else if (route.name === '기록') {
            icon = focused
              ? require('../styles/icons/history_final.png')
              : require('../styles/icons/history.png');
          } else if (route.name === '장소') {
            icon = focused
              ? require('../styles/icons/star_final.png')
              : require('../styles/icons/star.png');
          } else if (route.name === '설정') {
            icon = focused
              ? require('../styles/icons/setting_final.png')
              : require('../styles/icons/setting_green.png');
          }

          return (
            <Image
              source={icon}
              style={{
                width: 40,
                height: 40,
                resizeMode: 'cover',
                marginTop: 0,
              }}
            />
          );
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#6E8B6F',
        tabBarInactiveTintColor: '#aaa',
        tabBarStyle: {
          backgroundColor: '#E0E0E0',
          height: 65,
          position: 'absolute',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="홈" component={HomeScreen} />
      <Tab.Screen name="기록" component={HistoryScreen} />
      <Tab.Screen name="장소" component={FavoriteScreen} />
      <Tab.Screen name="설정" component={SettingScreen} />
    </Tab.Navigator>
  );
}

// ✅ AppNavigator에서 TabNavigator를 'component' prop으로 연결
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="Path" component={PathSelectScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
