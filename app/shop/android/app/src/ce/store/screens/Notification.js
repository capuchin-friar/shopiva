import { useNavigation } from '@react-navigation/native';
import React from 'react'
import { 
    Dimensions,
    ScrollView,
    StyleSheet, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    View 
} from 'react-native';

export default function Notification() {
  let screenWidth = Dimensions.get('window').width;
  let screenHeight = Dimensions.get('window').height;
  let navigation = useNavigation()
 
  return (
    <>
      <ScrollView style={[styles.notificationCnt,{
            height: screenHeight - 55
        }]}>
            <TouchableOpacity style={styles.notice}>
                <View style={{height: 180, width: '100%'}}>  

                </View>
                <View style={{backgroundColor: '#f9f9f9', padding: 10, borderRadius: 15}}>
                    <Text style={{fontWeight: '1000', color: '#000', marginBottom: 5}} numberOfLines={2} ellipsizeMode="tail">Brand New Promo Set Now</Text>
                    <Text numberOfLines={4} ellipsizeMode="tail" style={{fontWeight: '1000', marginBottom: 5, color: '#101010', fontSize: 10}}>After installing the library, you might need to link it, especially if you're using an older version of React Native. For React Native 0.60 and above, autolinking should handle it automatically. After installing the library, you might need to link it, especially if you're using an older version of React Native. For React Native 0.60 and above, autolinking should handle it automatically.</Text>
                    <Text style={{fontWeight: '1000', color: '#000', fontSize: 10, width: '100%', textAlign: 'right'}}>2 day ago</Text>
                </View>
              
            </TouchableOpacity>
        
      </ScrollView> 
    </>
  )
}


const styles = StyleSheet.create({
    notificationCnt:{
        width: '100%',
        paddingTop: 2,
        paddingBottom: 8,
        paddingLeft: 8,
        paddingRight: 8,
        backgroundColor: '#efefef',
        marginTop: 5,
        marginBottom: 5
    },
    notice:{
        height: 'auto',
        width: '100%',

        borderRadius: 15,
        padding: 10,
        backgroundColor: '#fff'
    }
  });