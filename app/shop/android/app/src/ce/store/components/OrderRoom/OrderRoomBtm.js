import React from 'react'
import { 
    Dimensions, 
    StyleSheet, 
    Text, 
    View 
} from 'react-native'

export default function OrderRoomBtm() {
  let screenHeight = Dimensions.get('window').height;

  return (
    <>
        <View style={[styles.orderRoomBtm]}>
            <Text>r</Text>
        </View>
    </>
  )
}

const styles = StyleSheet.create({
    orderRoomBtm:{
        height: '60%',
        width: '100%',
        position: 'relative',
        padding: 0,
        backgroundColor: 'green'
    }
});