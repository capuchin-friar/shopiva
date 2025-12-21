import React from 'react'
import { StyleSheet, Text, View } from 'react-native';

export default function Cost({cost,size}) {
  return (
    <>
      <View style={styles.card}>
        <Text style={{fontSize: 16}}>&#8358;&nbsp;</Text>
       
        <Text style={{fontSize: size ? size :  15, textDecorationStyle: 'dashed'}} 
            numberOfLines={2}
            ellipsizeMode="tail">
            {new Intl.NumberFormat('en-us').format(cost)}
        </Text> 
      </View>
    </>
  )
}


const styles = StyleSheet.create({
    card:{ 
        height: 'auto',
        width: '100%',
        padding: 0,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        padding: 8,
        // marginBottom: 5,
        backgroundColor: '#fff'
    },

    cardTop:{
        height: 100,
        width: '100%',
        backgroundColor: '#efefef',
        borderRadius: 15,
        padding: 0,
        position: 'relative',

        marginBottom: 5
    },

    
  });
