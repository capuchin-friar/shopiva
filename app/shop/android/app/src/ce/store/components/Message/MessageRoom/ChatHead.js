import React from 'react'
import { 
  StyleSheet, 
  TouchableOpacity, 
  View 
} from 'react-native'
import Coverphoto from './Coverphoto';
import RecipientName from './RecipientName';
import Date from './Date';
import MssgSrc from './MssgSrc';
import Mssg from './Mssg';
import { useNavigation } from '@react-navigation/native';

export default function ChatHead() {
  let navigation = useNavigation()

  return (
    <>
      <TouchableOpacity  style={styles.mssgCnt} onPress={()=>navigation.navigate('user-chat-room')}>

        <View style={styles.mssgCntLeft}>
          <Coverphoto />
        </View>

        <View style={styles.mssgCntRight}>

          <View style={styles.mssgCntRightTop}>
            <View>
              <RecipientName />
            </View>
            <View>
              <Date />
            </View>
          </View>
          
          <View style={styles.mssgCntRightBtm}>
            <View>
              <MssgSrc />
            </View>
            <View>
              <Mssg />
            </View>
          </View>

        </View>

      </TouchableOpacity>
    </>
  )
}


const styles = StyleSheet.create({
  mssgCnt:{
    height: 100,
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 5,
    backgroundColor: '#fff',
    marginBottom: 5
  },
  mssgCntLeft:{
    height: '100%',
    width: '20%',
    padding: 0,
    backgroundColor: '#fff',
    marginBottom: 5
  },
  mssgCntRight:{
    height: '100%',
    width: '80%',
    padding: 8,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 5
  },
  mssgCntRightTop:{
    height: '40%',
    width: '100%',
    padding: 0,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    marginBottom: 5
  },
  mssgCntRightBtm:{
    height: '60%',
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 0,
    backgroundColor: '#fff',
    marginBottom: 5
  }
});