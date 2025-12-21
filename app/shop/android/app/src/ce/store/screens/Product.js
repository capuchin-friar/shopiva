import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react'
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { GetItem } from '../apis/buyer/get';
import Images from '../components/Product/Images';
import Thumbnail from '../../reusables/Thumbnail';
import Top from '../components/Product/Top';
import Mid from '../components/Product/Mid';
import Btm from '../components/Product/Btm';
import ShowCase from '../components/Home/ShowCase';

export default function Product() {
    let screenWidth = Dimensions.get('window').width;
    let screenHeight = Dimensions.get('window').height;
    let [data, setData] = useState('')

    let {product_id} = useRoute()?.params
    GetItem([product_id])
    .then((result) => {
        if(result){ 
            setData(result[0])
        console.log(result)

        }
    })
    .catch(error=>{
        console.log(error)
    })  
    let navigation = useNavigation()

  return (
    <>    
        <View>
            <ScrollView style={{
                width: '100%',
                height: screenHeight - 120,
                backgroundColor: '#fff',
                position: 'relative'
                }}
                contentContainerStyle={{display: 'flex', alignItems: 'center', flexDirection: 'row', justifyContent: 'flex-start', flexWrap: 'wrap'}}
                >

            <View style={{
                width: '100%',
                height: 220,
                backgroundColor: '#fff',
                position: 'relative'
                }}>
                <Thumbnail thumbnail_id={data?.thumbnail_id} br={5}  />
            </View>

            <Top title={data?.title} cost={data?.price} />
            <Mid description={data?.description} />
            <View>
                <Text style={{marginLeft: -2.5, fontSize: 18, color: '#000', borderRadius: 10, width: 'fit-content', padding: 10}}>Recommended For You</Text>
                
                <ShowCase limit={8} category={data?.category} bg={'#f9f9f9'}/>
            </View>
            <Btm />
            
            
            </ScrollView>

            <View style={styles.btm}>
                <TouchableOpacity onPress={e=> navigation.navigate('user-new-order', {data: data})} style={[styles.btn, {width: '78%', backgroundColor: '#FF4500'}]}>
                    <Text style={{fontSize: 15, color: '#fff'}}>Buy Now For {new Intl.NumberFormat('en-us').format(0.95 * parseInt(data?.price))}</Text>
                </TouchableOpacity>    
                
                <TouchableOpacity  style={[styles.btn, {width: '18%', backgroundColor: 'rgb(255, 244, 224)'}]}>
                    <Text style={{fontSize: 10, color: '#fff'}}>Cart</Text>
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
