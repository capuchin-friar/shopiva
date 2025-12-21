import React, { useState } from 'react'
import { Dimensions, Image, ScrollView, View } from 'react-native';

export default function MssgCnt({messageList}) {


    const screenWidth = Dimensions.get('window').width;
    const screenHeight = Dimensions.get('window').height;

    // console.log(messageList)

  return (
    <>
        <ScrollView style={{
            height: screenHeight - 110,
            width: '100%',
            position: 'absolute',
            top: 0,
            padding: 8,
            backgroundColor: '#efefef',
            color: '#000',
            overflow: 'scroll',
        }}>
            <View style={{height: 'auto', marginBottom: 3,padding: 8,  width: '100%'}}> 
                {
                    messageList
                }
            </View>

        </ScrollView>
    </>
  )
}
