import React from 'react'
import { Dimensions, StyleSheet, View } from 'react-native'
import OrderRoomTop from '../components/OrderRoom/OrderRoomTop'
import OrderRoomBtm from '../components/OrderRoom/OrderRoomBtm';

export default function OrderRoom() {

  let screenHeight = Dimensions.get('window').height;

  return (
    <>
      <View style={[styles.orderRoom, {height: screenHeight}]}>

        <View>
            {/* <OrderRoomTop />  */}
        </View>

        <View>
            {/* <OrderRoomBtm /> */}
        </View>

      </View>
    </>
  )
}


const styles = StyleSheet.create({
    orderRoom:{
      width: '100%',
    //   display: 'flex',
    //   flexDirection: 'column',
    //   justifyContent: 'center',
    //   alignItems: 'center',
    //   padding: 10,
      backgroundColor: '#efefef',
    }
  });
