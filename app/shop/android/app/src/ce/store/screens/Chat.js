import { 
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View 
  } from "react-native";
import React, { 
    useEffect, 
    useState
  } from "react";
import { 
    useRoute 
  } from "@react-navigation/native";
import js_ago from "js-ago";
import MssgCnt from "../components/Message/ChatRoom/MssgCnt";
import MssgPanel from "../components/Message/ChatRoom/MssgPanel";
  
const ChatScreen = () => {
    const [messageList, setmessageList] = useState([]);
    const [message, setmessage] = useState('');
    let [data, set_data] = useState([])
  
    const screenWidth = Dimensions.get('window').width;
    const screenHeight = Dimensions.get('window').height;
  
    const route = useRoute()
    const room = route?.params?.room;
  
    useEffect(() => { 
    //   let storeChat = appStorage.getString(room)
    //   if(storeChat !== undefined){
    //     console.log('appStorage: ',storeChat)
    //     set_data(JSON.parse(storeChat))
    //   }
  
    //   async function data() {
    //     // alert('')
    //     let res = await get_chat(room)
    //     set_data('')
    //     set_data(res.data)
    //     // console.log(res?.data)
    //     appStorage.set(room, JSON.stringify(res.data));
    //   }
    //   data();
  
    },[])
  
    let sendMssg = (message) => {
      // console.log(message)
      let mssg = 
      <View style={{ alignItems: 'center', width: '100%', padding: 5, marginBottom: 2.5, maxHeight: 'auto', backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'flex-end', justifyContent: 'right'}}>
        <Text style={{maxWidth: '85%', padding: 10,  alignItems: 'center',borderTopLeftRadius: 12, borderTopRightRadius: 12, borderBottomLeftRadius: 12, borderBottomRightRadius: .5, position: 'relative', right: 5, fontFamily: 'serif',   maxHeight: 'auto', color: '#fff', backgroundColor: 'orangered'}}>
          {message}
        </Text> 
        <Text style={{fontSize: 7, marginRight: 5}}>{js_ago(new Date())}</Text>
      </View> ;
      if(message.length > 0 ){
        setmessageList(item => [...item, mssg])
        setTextInput('')
        
        ws_request('/send-chat', message)
      }
      
  
    }
  
    function setTextInput(data) {
      setmessage(data)
    }
   
    return ( 
        <>
  
            <View  style={{position: 'absolute', bottom: 0, width: '100%', height: screenHeight - 60, backgroundColor: 'orangered'}}>
                
                <MssgCnt messageList={messageList} />
  
                <MssgPanel message={message} setTextInput={setTextInput} imageLoader={'imageLoader'} sendMssg={sendMssg}/>
                
            </View>
        
        </>
    );
  }
   
  export default ChatScreen;
  
  
  const styles = StyleSheet.create({
    icons: {
      height: 250,
      width: 150,
      borderRadius: 50,
      padding: 3,
      alignItems: 'center',
      borderTopLeftRadius: 5,
      borderTopRightRadius: 5,
      borderBottomLeftRadius: 5,
      borderBottomRightRadius: .5,
      position: 'relative',
      right: 5,
      maxHeight: 'auto',
      backgroundColor: 'orangered'
        
    },
  
   
    MessageHead: {
      height: 80,
      width: '100%', 
      borderRadius: 5,
      backgroundColor: '#fff',
      display: 'flex', 
      fontFamily: 'serif',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      marginBottom: 5
    }
    
  });