import React from 'react'
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import SaveBtn from './buttons/saveBtn'
import Title from './data/Title';
import Cost from './data/Cost';
import ActionBtn from './buttons/actionBtn';
import Thumbnail from '../../../reusables/Thumbnail';
import { useNavigation } from '@react-navigation/native';
export default function Card({item}) {
    let screenWidth = Dimensions.get('window').width;
    let navigation = useNavigation()
  return (
    <>
        <TouchableOpacity onPress={e=> navigation.navigate('user-shops', {category: item.title})} style={[
            styles.card,
            {width: (screenWidth * 0.30) - 2}
        ]}>
            <View style={styles.cardTop}>
 
                <TouchableOpacity onPress={e=> navigation.navigate('user-product', {product_id: item.product_id})}>
                    <Thumbnail br={5}  />
                </TouchableOpacity> 
            </View>

            <View style={styles.cardBtm}>
                <Text style={{paddingLeft: 10, paddingRight: 10, fontWeight: 700, paddingBottom: 10, paddingTop: 10}}>
                    {
                        item.title
                    }
                </Text>
            </View>
        </TouchableOpacity>
    </>
  )
}

const styles = StyleSheet.create({
    card:{
        height: 180,
        padding: 0,
        marginLeft: 5, 
        borderRadius: 5,
        marginRight: 5,
        padding: 8,
        marginBottom: 10,
        backgroundColor: '#fff'
    },

    cardTop:{
        height: 100,
        width: '100%',
        backgroundColor: '#efefef',
        borderRadius: 5,
        padding: 0,
        position: 'relative',

        marginBottom: 5
    },

    cardBtm:{
        height: 'auto',
        width: '100%',
        padding: 0,
        marginBottom: 5,
        backgroundColor: '#fff',
        borderRadius: 15,

    },

    
  });