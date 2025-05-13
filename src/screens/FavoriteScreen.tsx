import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import styles from '../styles/theme';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';

export default function FavoriteScreen() {
  const navigation = useNavigation();
  const [searchInput, setSearchInput] = useState('');
  const [favorites, setFavorites] = useState([
    { id: '1', name: '가천대' },
    { id: '2', name: '서울역' },
    { id: '3', name: '강남역' },

  ]);
  const screenHeight = Dimensions.get('window').height;

  
  return (
    <ScrollView style={{ backgroundColor: '#373737' }} contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
    <View style={styles.container}>
      <Image source={require('../styles/icons/star_white.png')} style={{height:70,width:70}} />
      
      <View style={{ position: 'relative',marginTop:'3%' }}>
      <Text style={styles.title1}>좋아하는 장소</Text>
      <Text style={styles.title2}>좋아하는 장소</Text>
      </View>
      
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
        
       <View style={styles.btnView}>
        <TouchableOpacity style={[styles.btn]} onPress={() => console.log('Add new favorite')}> 
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Image 
              source={require('../styles/icons/plus.png')}
              style={{ width: 25, height: 25, marginRight: 10 }} 
            />
            <Text style={styles.btnText}>새로운 장소 추가</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View
          style={[
            styles.showInfoView,
            {
              alignSelf: 'center',
              height: favorites.length === 0
                ? '28%'
                : Math.max(favorites.length * 40, 0.28 * screenHeight),
            },
          ]}
        >

    <Text style={styles.showInfoTitle}>목록</Text>

      <View style={{marginTop:5}}>
        <View style={{width:'84%',height:1,backgroundColor:'#ABABAB',opacity:0.5,alignSelf:'center'}} />
        {favorites.map(item => (
        <View key={item.id}>
          <View style={{ flexDirection: "row", alignItems: "center",height:40 }}>
            <Image
              source={require('../styles/icons/marker.png')}
              style={{ width: 25, height: 25, marginLeft: '7%' }}
            />
            <TouchableOpacity
              onPress={() => console.log(`Selected ${item.name}`)}
              style={[styles.showInfoTextView, { marginLeft: 5 }]} // 간격 확보
            >
              <Text style={styles.showInfoText}>{item.name}</Text>
            </TouchableOpacity>
          </View>
          <View style={{width:'84%',height:1,backgroundColor:'#ABABAB',opacity:0.5,alignSelf:'center'}} />
        </View>
      ))}
      </View>
    </View>

    </View>
    </ScrollView>
  );
}