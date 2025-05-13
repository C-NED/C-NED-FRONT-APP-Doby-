import { StyleSheet } from 'react-native';

export default styles =  StyleSheet.create({
  container:{
      backgroundColor:'#373737',
      flex:1,
      alignItems:'center',
      paddingTop:'10%'
  },
  notice :{
      borderColor: '#ACA6A6', borderWidth:1,width:'83%',height:'27%',justifyContent:'center',borderRadius:8
  },
  noticeText:{
      color: 'white',textAlign:'center', fontSize:24 
  },
  btnView:{
      marginTop: '5%',width:'83%',height:'8.5%'
  },
  btn:{
      backgroundColor: '#97AA98',height:'100%',justifyContent:'center',borderRadius:8
  },
  btnClicked:{
      backgroundColor: '#E5E5E5',height:'100%',justifyContent:'center',borderRadius:8
  },
  btnText:{
      color: 'white',fontSize:23,textAlign:'center',fontWeight:'bold'
  },
  btnTextClicked:{
      color:'#141414',fontSize:23,textAlign:'center',fontWeight:'bold'
  },
  loginFormView:{
      marginTop: '5%', width: '83%', height: '45%',backgroundColor:'#E0E0E0',borderRadius:8
  },
  loginForm:{
      alignItems:'center',marginTop:'8%'
  },
  loginInput:{
      width: '83%',paddingLeft: 13,shadowColor: '#000',shadowOffset: { width: 0, height: 4 },elevation: 5,shadowOpacity: 0.25, color:'black', fontSize:23, padding: 10, marginBottom: 12, borderRadius: 6,backgroundColor:'white'
  },
  title1:{
    position: 'absolute',
    left: 5,
    top: 5,
    color: 'black',
    fontSize: 33,
    fontWeight: 'bold',
    opacity: 0.25,
  },
  title2:{
    color: 'white',
    fontSize: 33,
    fontWeight: 'bold',
  },
  searchView:{
    borderRadius:8,backgroundColor:'#F0F0F0',width:'83%',marginTop:'5%',height:'8.5%'
  },
  searchInput:{
    fontSize:23,borderRadius:8
  },
 showInfoView:{
    backgroundColor:'#F0F0F0',width:'83%',height:'28%', marginTop:'5%',borderRadius:8
 },
 showInfoView2:{
    flexDirection: 'row', justifyContent: 'space-between',marginRight:'5%'
 },
 showInfoTitle:{
    marginLeft: '7%',
        marginTop: '5%',
        fontWeight: 'bold',
        fontSize: 24,
        color:'black'
 },
 showInfoMore:{
    marginRight: '5%',
        marginTop: '5%',
        fontSize: 16,
        alignSelf: 'flex-start',
        color:'#6E8B6F',
        fontWeight: 'bold',
 },
 showInfoTextView:{
    marginLeft:'7%'
 },
 showInfoText:{
    fontSize:20,
    marginTop:'2%'
 },
 cardContainer: {
    backgroundColor: '#F0F0F0',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignSelf: 'center',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#333',
  },
  dotRow: {
    flexDirection: 'row',
  },
  dot: {
    width: 15,
    height: 15,
    borderRadius: 10,
    marginHorizontal: 2,
  },
  subText: {
    marginTop: 5,
    fontSize: 16,
    color: '#888',
  },
  separator:{
    width: '84%',
    height: 1,
    backgroundColor: '#ABABAB',
    opacity: 0.5,
    alignSelf: 'center',
  }
})
