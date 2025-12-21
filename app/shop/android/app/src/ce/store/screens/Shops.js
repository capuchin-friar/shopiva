import React from 'react'
import { ScrollView, View } from 'react-native'
import ShopCard from '../components/Home/ShopCard'

export default function Shops() {

  return (
    <>
        <ScrollView style={{padding: 10, marginBottom: 0, }}>
              <View style={{height: 'auto', marginBottom: 10}}>
                {
                    [{ name: 'Shopex', items: [{}, {}, {}, {}]},{ name: 'Shopex', items: [{}, {}, {}, {}]}].map((item, index) => 
                        <ShopCard shop={item} index={index} />
                    )   
                }
            </View>
        </ScrollView>
    </>
  )
}
