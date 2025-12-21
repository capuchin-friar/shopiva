import React from 'react'
import OrderCard from '../components/Order/OrderCard'
import DeliverySetup from '../components/NewOrder/DeliverySetup'
import Want from '../components/NewOrder/Want'
import Specs from '../components/NewOrder/Specs'
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export default function NewOrder({data}) {
    let screenHeight = Dimensions.get('window').height;

  return (
    <>
      <View>
        <ScrollView style={{
                width: '100%',
                height: screenHeight - 120,
                backgroundColor: '#fff',
                position: 'relative'
                }}
                contentContainerStyle={{display: 'flex', alignItems: 'center', flexDirection: 'row', justifyContent: 'flex-start', flexWrap: 'wrap'}}>
            <OrderCard data={data} />
            <Want />
            <DeliverySetup />
            <Specs />
        </ScrollView>
        <View style={styles.btm}>
            <TouchableOpacity onPress={e=> navigation.navigate('user-new-order', {product_id: data?.product_id})} style={[styles.btn, {width: '100%', backgroundColor: '#FF4500'}]}>
                <Text style={{fontSize: 15, color: '#fff'}}>Create Order Now {new Intl.NumberFormat('en-us').format(0.95 * parseInt(data?.price))}</Text>
            </TouchableOpacity>    
        </View>
      </View>
    </>
  )
}


const styles = StyleSheet.create({
    btm:{
        height: 65,
        padding: 0,
        marginLeft: 5, 
        marginRight: 5,
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        padding: 10,
        marginBottom: 5,
        backgroundColor: '#fff'
    },

    btn:{
        height: '100%',
        color: '#fff',
        borderRadius: 15,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },

    
  });
