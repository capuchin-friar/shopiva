import React from 'react'
import { 
    Text, 
    View 
} from 'react-native'

export default function OrderTitle() {
  return (
    <>
        <View>
            <Text numberOfLines={2}
            ellipsizeMode="tail" style={{fontSize: 16, color: '#000'}}>Hello world this item is hand bag at 50,000</Text>
        </View>
    </>
  )
}
