import React from 'react'
import { Text, View } from 'react-native'

export default function Mssg() {
  return (
    <>
        <View>
            <Text numberOfLines={2}
            ellipsizeMode="tail" style={{fontSize: 10, color: '#000'}}>Hello World</Text>
        </View>
    </>
  )
}
