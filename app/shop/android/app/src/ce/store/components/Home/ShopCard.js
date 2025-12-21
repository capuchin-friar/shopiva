import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

export default function ShopCard({shop,index}) {
  return (
    <>
          <View key={index} style={{
              backgroundColor: '#fff',
              height: 500,
              width: '100%',
              borderRadius: 10,
              marginBottom: 10
        }}>
            <View style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', height: 60, padding: 10}}>
                <View style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row'}}>
                    <View style={{height: 40, width: 40, borderRadius: 50, backgroundColor: '#000', marginRight: 10}}></View>
                    <View>
                        <Text style={{color: '#000'}}>{shop?.name}</Text>
                        <Text style={{color: '#000'}}>4.5 rating</Text>
                    </View>
                </View>
                <View style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row'}}>
                    <TouchableOpacity style={{
                        backgroundColor: '#efefef',
                        borderRadius: 4,
                        padding: 8,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row'
                    }}>
                          <Text style={{color: '#000'}}>Follow</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{
                        backgroundColor: '#fff',
                        borderRadius: 4,
                        padding: 8,
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row',
                          height: '100%',
                        marginLeft: 18
                    }}>
                          <Text style={{fontWeight: 800, height: '100%', fontSize: 20,color: '#000'}}>...</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', height: 60, padding: 10, flexWrap: 'wrap'}}>
                {
                      shop?.items.map((item, index) => {
                          return (
                              <View key={index} style={{backgroundColor: '#f9f9f9', height:200, width: '48%', borderRadius: 10, marginBottom: 10}}> 
                                  
                              </View>
                          )
                      })
                }
            </View>
        </View>
    </>
  )
}
