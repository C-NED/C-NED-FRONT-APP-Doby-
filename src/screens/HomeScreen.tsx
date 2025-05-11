import React, { useState } from 'react';
import { View, Text, Image,ScrollView, TouchableOpacity } from 'react-native';
import styles from '../styles/theme';
import { TextInput } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const navigation = useNavigation();
  const [destination, setDestination] = useState('');

  return(
   <ScrollView style={{ backgroundColor: '#373737'}} 
                  contentContainerStyle={{ 
                      flexGrow: 1,
                      paddingBottom: 150,
                  }}
                  keyboardShouldPersistTaps="handled">
    <View style={styles.container}>
    <View style={{alignItems:'center'}}>
      <Image
            source={require('../styles/icons/car.png')}
            style={{width:101,height:101}} />
      <View style={{ position: 'relative' }}>
        <Text style={styles.title1}>
            어디로 가시겠어요?
        </Text>
        <Text style={styles.title2}>
            어디로 가시겠어요?
        </Text>
      </View>
    </View>
    <View style={styles.searchView}>
    <View style={{flexDirection:'row',alignItems:'center',justifyContent:'flex-start'}}>
      <Image
            source={require('../styles/icons/search.png')}
            style={{width:25,height:25,marginLeft:'5%'}} />
    <TextInput 
          placeholder="목적지를 검색하세요"
          style={styles.searchInput}
          value={destination}
          onChangeText={setDestination} />
    </View>
    </View>

    <View style={styles.btnView}>
  <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Path')}> 
    {/* 나중에 destination도 보내서 함께 사용할 것 */}
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
      <Image 
        source={require('../styles/icons/plus.png')}
        style={{ width: 25, height: 25, marginRight: 10 }} 
      />
      <Text style={styles.btnText}>새 경로 만들기</Text>
    </View>
  </TouchableOpacity>
</View>



    <View style={styles.showInfoView}>
    <View style={styles.showInfoView2}>
    <Text
      style={styles.showInfoTitle}>
      최근 목적지
    </Text>
    <Text
      style={styles.showInfoMore}>
      모두 보기
    </Text>
  </View>

      <View style={styles.showInfoTextView}>
        <Text style={styles.showInfoText}>서울역</Text>
        <Text style={styles.showInfoText}>강남역</Text>
        <Text style={styles.showInfoText}>홍대입구역</Text>
      </View>
    </View>

    <View style={styles.showInfoView}>
    <View style={styles.showInfoView2}>
    <Text
      style={styles.showInfoTitle}>
      좋아하는 장소
    </Text>
    <Text
      style={styles.showInfoMore}>
      모두 보기
    </Text>
  </View>

      <View style={styles.showInfoTextView}>
        <Text style={styles.showInfoText}>서울역</Text>
        <Text style={styles.showInfoText}>가천대학교</Text>
        <Text style={styles.showInfoText}>부산역</Text>
      </View>
    </View>
  </View>
  </ScrollView>
  );
}

export default HomeScreen;
