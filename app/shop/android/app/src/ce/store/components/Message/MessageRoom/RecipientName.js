import React from 'react'
import { Text, View } from 'react-native'

export default function RecipientName() {
  return (
    <>
        <View>
            <Text numberOfLines={1}
            ellipsizeMode="tail" style={{fontSize: 18, fontWeight: '500', color: '#000'}}>Akpulu Chinedu</Text>
        </View>
    </>
  )
}
