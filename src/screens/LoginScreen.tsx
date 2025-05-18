// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import styles from '../styles/theme';
import axiosInstance from '../api/axiosInstance';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [click, setClick] = useState(false);
    const navigator = useNavigation();

   const handleLogin = async () => {
  try {
    const res = await axiosInstance.post('/auth/login', {
        email,
        password,
        type:"USER"
        }, {
        headers: {
            'Content-Type': 'application/json', // ← 이게 있어야 함
        }
        });
        console.log(res.request)

    console.log('✅ Login success:', res.data);

    if (res.status === 200) {
       console.log('Login successful'); 
       navigator.navigate('Main'); // 성공했을 때만 이동
    }
  } catch (err) {
    if (typeof err === 'object' && err !== null && 'response' in err) {
      const error = err as { response?: { data?: any }; message?: string };
      console.error('❌ Login failed:', error.response?.data || error.message);
      Alert.alert('로그인 실패', error.response?.data?.detail || '서버 오류가 발생했습니다.');
    } else {
      console.error('❌ Login failed:', String(err));
      Alert.alert('로그인 실패', '서버 오류가 발생했습니다.');
    }
  }
};

    const handleNaverLogin = () => {
      console.log('Login with Naver');
    };

    const showLoginForm = () => {
        setClick(!click);
    }


  
    return (
    <ScrollView style={{ backgroundColor: '#373737'}} 
                contentContainerStyle={{ 
                    flexGrow: 1,
                    paddingBottom: 24,
                }}
                keyboardShouldPersistTaps="handled"
>
      <View style={styles.container}>
        <View style={styles.notice}>
        <Text style={styles.noticeText}>똑똑한</Text>
        <Text style={styles.noticeText}>스마트 네비게이션</Text>
        <Text style={styles.noticeText}>doby에 오신 것을</Text>
        <Text style={styles.noticeText}>환영합니다</Text>
        </View>
        
        <View style={styles.btnView}>
        {click ? (   
            <TouchableOpacity
            onPress={() => showLoginForm()}
            style={styles.btnClicked}
        >
            <Text style={styles.btnTextClicked}>이메일로 로그인</Text>
            </TouchableOpacity>
        ) : (
            <TouchableOpacity
            onPress={() => showLoginForm()}
            style={styles.btn}
        >
            <Text style={styles.btnText}>이메일로 로그인</Text>
            </TouchableOpacity>
        )}
        </View>   
    {click && (            
        <View style={styles.loginFormView}>
            <View style={styles.loginForm}>
                <TextInput
                    placeholder="email"
                    value={email}
                    onChangeText={setEmail}
                    placeholderTextColor="#aaa"
                    style={styles.loginInput}
                />
                <TextInput
                    placeholder="password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholderTextColor="#aaa"
                    style={styles.loginInput}
                />
                <TouchableOpacity onPress={handleLogin} style={{ backgroundColor: '#576F50', borderRadius: 8, marginBottom: 12,width:'83%',alignItems:'center',height:'21%',justifyContent:'center' }}>
                    <Text style={{ color: 'white', fontWeight: 'bold',fontSize:23,textAlign:'center' }}>제출</Text>
                </TouchableOpacity>
                <Text>아이디가 없으신가요?</Text>
                <Text style={{color:'#184817',textDecorationLine: 'underline'}}>회원가입을 하려면 여기를 클릭해주세요</Text>
            </View>
        </View>
        )}
        <View style={styles.btnView}>
        <TouchableOpacity
            onPress={() => navigator.navigate('Navi')}
            style={styles.btn}
        >
            <Text style={styles.btnText}>네이버로 한 번에 로그인</Text>
        </TouchableOpacity>
        </View>
        
      </View>
      </ScrollView>
    );
}

// const styles =  StyleSheet.create({
//     constainer:{
//         backgroundColor:'#373737',
//         flex:1,
//         alignItems:'center',
//         paddingTop:'10%'
//     },
//     notice :{
//         borderColor: '#ACA6A6', borderWidth:1,width:'83%',height:'27%',justifyContent:'center',borderRadius:8
//     },
//     noticeText:{
//         color: 'white',textAlign:'center', fontSize:24 
//     },
//     btnView:{
//         marginTop: '5%',width:'83%',height:'9%'
//     },
//     btn:{
//         backgroundColor: '#97AA98',height:'100%',justifyContent:'center',borderRadius:8
//     },
//     btnClicked:{
//         backgroundColor: '#E5E5E5',height:'100%',justifyContent:'center',borderRadius:8
//     },
//     btnText:{
//         color: 'white',fontSize:23,textAlign:'center',fontWeight:'bold'
//     },
//     btnTextClicked:{
//         color:'#141414',fontSize:23,textAlign:'center',fontWeight:'bold'
//     },
//     loginFormView:{
//         marginTop: '5%', width: '83%', height: '45%',backgroundColor:'#E0E0E0',borderRadius:8
//     },
//     loginForm:{
//         alignItems:'center',marginTop:'8%'
//     },
//     loginInput:{
//         width: '83%',paddingLeft: 13,shadowColor: '#000',shadowOffset: { width: 0, height: 4 },elevation: 5,shadowOpacity: 0.25, color:'black', fontSize:23, padding: 10, marginBottom: 12, borderRadius: 6,backgroundColor:'white'
//     },
// })
