import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Switch } from 'react-native';
import styles from '../styles/theme';
import { ScrollView } from 'react-native-gesture-handler';

export default function SettingScreen() {
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  return (
    <ScrollView style={{ backgroundColor: '#373737' }} contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
       <View style={styles.container}>
         <Image source={require('../styles/icons/setting_white.png')} style={{height:65,width:65}} />
         <View style={{ position: 'relative',marginTop:'3%' }}>
         <Text style={styles.title1}>설정</Text>
         <Text style={styles.title2}>설정</Text>
         </View>

         <View style={{width:'84%',height:1,backgroundColor:'white',opacity:0.5,alignSelf:'center'}} />

         <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 50 }}>
        <Text style={[styles.showInfoText, { color: 'white', marginRight: '25%' }]}>알림 설정</Text>
        <Switch
          trackColor={{ false: "#969E96", true: "#000000" }}
          thumbColor={isEnabled ? "#969E96" : "#FDFFFC"}
          onValueChange={toggleSwitch}
          value={isEnabled}
        />
      </View>


        <View style={{width:'84%',height:1,backgroundColor:'white',opacity:0.5,alignSelf:'center'}} />
          
          <View style={{height:50}}>
            <Text style={[styles.showInfoText,{color:'white'}]}>계정 관리</Text>
          </View>
          
          <View style={{width:'84%',height:1,backgroundColor:'white',opacity:0.5,alignSelf:'center'}} />
          
          <View style={{height:50}}>
            <Text style={[styles.showInfoText,{color:'white'}]}>약관 및 정책</Text>
        </View>

        <View style={{width:'84%',height:1,backgroundColor:'white',opacity:0.5,alignSelf:'center'}} />

        <View style={{height:50}}>
            <Text style={[styles.showInfoText,{color:'white'}]}>앱 버전</Text>
        </View>

        <View style={{width:'84%',height:1,backgroundColor:'white',opacity:0.5,alignSelf:'center'}} />

      </View>
  </ScrollView>
  );
}