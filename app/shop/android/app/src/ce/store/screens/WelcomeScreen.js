import React from 'react'
import { Dimensions, Image, Text, View } from 'react-native'
import FavSvg from '../../icons/20240610_160824_0000 (1).png';

export default function WelcomeScreen() {
  let screenHeight = Dimensions.get('window').height;

  return (
    <>
      <View style={{
            height: screenHeight,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#FF4500',
            justifyContent: 'center',
        }}>
            <Text style={{color: '#fff', fontSize: 25}}>Campus Express</Text>
            
            <Image height={100} width={100} source={FavSvg} />
      </View>
    </>
  )
}
