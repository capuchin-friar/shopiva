import React, { useEffect, useState } from 'react'
import { Dimensions, ScrollView, StyleSheet, Text, Touchable, TouchableOpacity, View } from 'react-native';
import ChatHead from '../components/Message/MessageRoom/ChatHead';
import FavSvg from '../../icons/message-svgrepo-com.svg';
import { useSelector } from 'react-redux';
import { getData } from '../../reusables/AppStorage';

export default function Message() {
  let screenHeight = Dimensions.get('window').height;

  let [user, set_user] = useState(null)
    useEffect(() => {
      getData('user')
      .then((result) => {
        set_user(result)
      })
      .catch((err) => console.log(err))
    }, [])

  return (
    <>
     <ScrollView style={[styles.mssgCnt,{
            height: screenHeight - 55
        }]}>

        {/* <ChatHead /> */}

        <View style={{
          height: screenHeight - 55,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',

        }}>
          <FavSvg height={80} width={80} />
          <Text style={{color: '#FF4500', fontSize: 15, marginTop: 20}}>
            {
              user 
              ?
              <>You Haven't Message Any Vendor Yet</>
              :
              <>Login To View Your Message</>
            }
          </Text>

          <TouchableOpacity>
            <Text style={{color: '#FF4500', fontSize: 10, marginTop: 20}}>
              {
                user === null
                ?
                <>Click Here To Login</>
                :
                <>Click Here To Continue Shopping</>
              }
            </Text>
          </TouchableOpacity>
        </View>
 
      </ScrollView> 
    </>
  )
}


const styles = StyleSheet.create({
    mssgCnt:{
        height: 'auto',
        width: '100%',
        padding: 0,
        marginBottom: 5
    }
  });