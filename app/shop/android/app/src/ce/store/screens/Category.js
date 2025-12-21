import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react'
import item from '../../../../../../items.json'
import { 
    Dimensions,
    ScrollView,
    StyleSheet, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    View 
} from 'react-native';
import { GetItems } from '../apis/buyer/get';
import Thumbnail from '../../reusables/Thumbnail';
import Title from '../components/Home/data/Title';
import Cost from '../components/Home/data/Cost';

export default function Category() {
    let screenWidth = Dimensions.get('window').width;
    let screenHeight = Dimensions.get('window').height;
    let navigation = useNavigation()

    let [categories, set_categories] = useState([])
    let [category, set_category] = useState('')
    let [limit, setlimit] = useState(30)
    let [items, set_items] = useState([])
    useEffect(() => {
        set_category('Food')
        set_categories(item.items.category.map(item => Object.keys(item)[0]))
    }, [])

    useEffect(() => {
        if(screenWidth > 999){
            setlimit(32)
        }else if(screenWidth > 761 && screenWidth < 1000){
            setlimit(30) 
        }else if(screenWidth < 659){
            setlimit(30)
        } 

        GetItems(category, limit)
        .then((result) => {
            if(result){ 
                set_items(result)
                console.log('result: ', result)
            }
        })
        .catch(error=>{
            console.log(error)
        })  
        
    }, [category])  
 
  return (
    <>
      <View style={[styles.categoryCnt,{
            height: screenHeight - 60
        }]}> 
            <View style={{
                width: '30%',
                padding: 0,
                height: '100%',
                backgroundColor: 'rgb(255, 244, 224)'
            }}>
                <View style={{
                    width: '100%',
                    height: 45,
                    backgroundColor: '#FF4500',
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    flexWrap: 'wrap'    
                }}>
                    {/* <TouchableOpacity>
                        <Text>Filter</Text>
                    </TouchableOpacity> */}
  
                    <TouchableOpacity style={{color: '#fff', height: '100%', fontSize: 10, display: 'flex', alignItems: 'center', flexDirection: 'row', justifyContent: 'center',}}>
                        <Text style={{color: '#fff', fontSize: 10, display: 'flex', alignItems: 'center', flexDirection: 'row', justifyContent: 'center',}}>Category Availble</Text>
                    </TouchableOpacity>  
                </View>

                <ScrollView style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgb(255, 244, 224)',
                    position: 'relative'
                    }}
                    contentContainerStyle={{display: 'flex', alignItems: 'center', flexDirection: 'row', justifyContent: 'flex-start', flexWrap: 'wrap'}}
                    >
                    {
                        categories.map(item => {
                            return(
                                <TouchableOpacity onPress={e => set_category(item)} style={{
                                    width: '100%',
                                    padding: 10,
                                    height: 'auto',
                                    backgroundColor: item === category ? 'rgb(255, 244, 224)' : '#fff'
                                }}>
                                    <View>
                                        
                                    </View>
                                    <Text style={{fontSize: 10}} >
                                        {item}
                                    </Text>
                                </TouchableOpacity>
                            )
                        })
                    }

                </ScrollView>

            </View>

            <View style={{
                width: '69%',
                height: '100%',
                backgroundColor: 'rgb(255, 244, 224)',
                position: 'relative'
            }}>
                <View style={{
                    width: '100%',
                    height: 45,
                    padding: 10,
                    backgroundColor: '#FF4500',
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap'    
                }}>
                    {/* <TouchableOpacity>
                        <Text>Filter</Text>
                    </TouchableOpacity> */}
  
                    <TouchableOpacity>
                        <Text style={{color: '#fff'}}>Total Result: {items.length}</Text>
                    </TouchableOpacity>  
                </View>
                <ScrollView style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgb(255, 244, 224)',
                    position: 'relative'
                }}
                contentContainerStyle={{display: 'flex', alignItems: 'center', flexDirection: 'row', justifyContent: 'flex-start', flexWrap: 'wrap'}}
                >

                    {
                        items.map(item => {
                            return(
                                <TouchableOpacity onPress={e=> navigation.navigate('user-product', {product_id: item.product_id})} style={{
                                    width: '33%', 
                                    padding: 5,
                                    height: 'auto',
                                    backgroundColor: 'rgb(255, 244, 224)'
                                }}>
                                    <View style={{
                                        width: '100%', 
                                        padding: 2.5,
                                        height: 150,
                                        backgroundColor: '#fff'
                                    }}>
                                        <View style={{
                                            width: '100%', 
                                            // padding: 5,
                                            height: '40%',
                                            backgroundColor: '#efefef'
                                        }}>
                                            <Thumbnail br={5} thumbnail_id={item?.thumbnail_id}  />
                                        </View>
                                        <View style={styles.cardBtm}>
                                            <Title size={10} title={item.title} />
                                            <Cost size={10} cost={item.price} />
                                        </View>
                                    </View> 
                                </TouchableOpacity>
                            )
                        })
                    }
                </ScrollView>
            </View>
        
      </View> 
    </>
  )
}


const styles = StyleSheet.create({
    categoryCnt:{
        width: '100%',
        padding: 0,
        display: 'flex',
        marginTop: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#efefef',
    },
    notice:{
        height: 'auto',
        width: '100%',

        borderRadius: 15,
        padding: 10,
        backgroundColor: '#fff'
    },
    cardBtm:{
        height: '60%',
        width: '100%',
        padding: 0,
        marginBottom: 5,
        backgroundColor: '#fff',
        borderRadius: 5,

    },
  });