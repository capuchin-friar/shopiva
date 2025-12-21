import React from 'react'
import { 
    StyleSheet, 
    Text, 
    View 
} from 'react-native'

export default function OrderRoomTop() {
  return (
    <>
        <View style={styles.orderRoomTop}>
            <Text>h</Text>
        </View>
    </>
  )
}

const styles = StyleSheet.create({
    orderRoomTop:{
        height: '60%',
        width: '100%',
        position: 'relative',
        padding: 0,
        backgroundColor: 'green'
    }
});