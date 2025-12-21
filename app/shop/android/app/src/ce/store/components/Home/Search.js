import { useNavigation } from '@react-navigation/native';
import React from 'react'
import { 
    Dimensions,
    StyleSheet, 
    TextInput, 
    TouchableOpacity, 
    View 
} from 'react-native';

export default function Search() {
  let screenWidth = Dimensions.get('window').width;
  let navigation = useNavigation()

  return (
    <>
      <View style={[styles.searchCnt, {width: screenWidth}]}>
        <TouchableOpacity style={styles.search} onPress={e => navigation.navigate('user-search')}>   
            
        </TouchableOpacity>
      </View>
    </>
  )
}


const styles = StyleSheet.create({
    searchCnt:{
        height: 'auto',
        //   width: '100%',
        paddingTop: 15,
        paddingBottom: 15,
        paddingLeft: 15,
        paddingRight: 15,
        backgroundColor: '#fff',
        marginTop: .5,
        marginBottom: .5
    },
    search:{
        height: 55,
        borderRadius: 25,
        padding: 10,
        backgroundColor: '#efefef'
    }
  });