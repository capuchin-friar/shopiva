import js_ago from 'js-ago'
import React from 'react'
import { 
    Text, 
    View 
} from 'react-native'

export default function Date({date}) {
  return (
    <>
        <View>
          <Text style={{fontSize: 10, color: '#000'}}>{date? js_ago((date)) : ''}</Text>
        </View>
    </> 
  )
}
     