import { useNavigation } from '@react-navigation/native';
import React,{useState} from 'react';
import { View, Text, StyleSheet, Image, TextInput,FlatList, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

export default function PathSelectScreen() {
    const [searchInput, setSearchInput] = useState('');
    const [start, setStart] = useState('서울역');
    const [end, setEnd] = useState('가천대학교');
    const [selecting, setSelecting] = useState(null); // 'start' or 'end'

    const routeList = [
        {
          time: '1시간 32분',
          label: '(가장 빠른 길)',
          traffic: ['#00E676', '#00E676', '#FFEB3B', '#00E676'],
        },
        {
          time: '1시간 45분',
          label: '(혼잡 구간 있음)',
          traffic: ['#FFEB3B', '#FFEB3B', '#FF5722', '#FFEB3B'],
        },
      ];

      

      const applySearchToLocation = () => {
        if (searchInput.trim() === '') return;
      
        if (selecting === 'start') {
          setStart(searchInput);
        } else if (selecting === 'end') {
          setEnd(searchInput);
        }
      
        setSearchInput('');
        setSelecting(null); // 선택 해제해서 다시 클릭 가능하게
      };

  return (
    <ScrollView style={{ backgroundColor: '#373737'}} 
                    contentContainerStyle={{ 
                        flexGrow: 1,
                        paddingBottom: 24,
                    }}
                    keyboardShouldPersistTaps="always"     >
    <View style={styles.container}>
      <View style={styles.searchView}>
          <View style={{flexDirection:'row',alignItems:'center',justifyContent:'flex-start'}}>
            <Image
                  source={require('../styles/icons/search.png')}
                  style={{width:25,height:25,marginLeft:'5%'}} />
          <TextInput
                placeholder="장소를 검색하세요"
                style={styles.searchInput}
                value={searchInput}
                onChangeText={setSearchInput}
                onSubmitEditing={applySearchToLocation}
                 />
          </View>
          </View>

          <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center', // ← 가운데 정렬
                marginTop: 20,
                width: '83%',
                backgroundColor: '#5F5F5F',
                paddingVertical: 7,
                borderRadius: 8,
                }}>
                <TouchableOpacity onPress={() => setSelecting('start')}>
                <Text style={{ fontSize: 20, color: 'white', marginHorizontal: 10 }}>출발지</Text>
                </TouchableOpacity>
                <Image source={require('../styles/icons/arrow.png')} style={{ width: 25, height: 25, marginHorizontal: 10 }} />
                <TouchableOpacity onPress={() => setSelecting('end')}>
                <Text style={{ fontSize: 20, color: 'white', marginHorizontal: 10 }}>도착지</Text>
                </TouchableOpacity>
                </View>

        <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start', // ← 왼쪽쪽 정렬
                marginTop: 10,
                width: '83%',
                paddingVertical: 10,
                borderRadius: 8,
                }}>
                <Image source={require('../styles/icons/marker.png')} style={{ width: 25, height: 25, marginHorizontal: 10 }} />
                <Text style={{ fontSize: 23, color: 'white', marginHorizontal: 10 }}>{start}</Text>
                <Image source={require('../styles/icons/arrow.png')} style={{ width: 25, height: 25, marginHorizontal: 10 }} />
                <Text style={{ fontSize: 23, color: 'white', marginHorizontal: 10 }}>{end}</Text>
                </View>
        
                <View style={{
                        height: 1,
                        backgroundColor: '#FFFFFF',
                        width: '83%',
                        marginVertical: 5,
                        opacity: 0.5
                        }} />

                <View style={{justifyContent:'flex-start',width:'83%'}}>
                    <Text style={[styles.showInfoTitle,{color:'white',marginLeft:0,marginTop:'3%'}]}>가능한 경로</Text>
                </View>

                <View style={{ width: '83%', marginTop: 10 }}>
    {routeList.map((item, index) => (
      <TouchableOpacity
        key={item.id ?? index}
        onPress={() => navigation.navigate('PathPreview', { routeId: item.id })}
        style={[styles.cardContainer,{marginBottom: 15}]}
      >
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


    </View>
    </ScrollView>
  );
}