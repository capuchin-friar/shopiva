import React from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function Btm({size, description}) {
    return (
        <>
         
            
            <View style={styles.top}>
                <Text style={{marginBottom: 10, fontSize: 17, color: '#000'}}>Reviews (0)</Text>
                <Text style={{fontSize: size ? size :  12, color: '#000', padding: 5}}>
                    {null}
                </Text>
            </View>

            <View style={styles.filter}>
                <Text style={{margin: 10, fontSize: 14, color: '#000', borderRadius: 10, backgroundColor: 'rgb(255, 244, 224)', width: 'fit-content', padding: 10}}>Poor (25)</Text>
                <Text style={{margin: 10, fontSize: 14, color: '#000', borderRadius: 10, backgroundColor: 'rgb(255, 244, 224)', width: 'fit-content', padding: 10}}>Good (5)</Text>
                <Text style={{margin: 10, fontSize: 14, color: '#000', borderRadius: 10, backgroundColor: 'rgb(255, 244, 224)', width: 'fit-content', padding: 10}}>Best (135)</Text>
            </View>

            <View style={styles.cardCnt}>
                <ScrollView horizontal contentContainerStyle={{display: 'flex', alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'flex-start'}}>  
                    <View style={styles.card}>
                        <View>
                            <View></View>
                            <Text style={{marginBottom: 0, fontSize: 14, color: '#000', fontWeight: '600'}}>Buyer Protection</Text>
                        </View>
                        <Text style={{fontSize: size ? size :  12, color: '#1f1f1f', padding: 5}}>
                            Get your money back if your order is'nt delivered by estimated date or if you are not satisfied with your order
                        </Text>
                    </View>
                    <View style={styles.card}>
                        <View>
                            <View></View>
                            <Text style={{marginBottom: 0, fontSize: 14, color: '#000', fontWeight: '600'}}>Buyer Protection</Text>
                        </View>
                        <Text style={{fontSize: size ? size :  12, color: '#1f1f1f', padding: 5}}>
                            Get your money back if your order is'nt delivered by estimated date or if you are not satisfied with your order
                        </Text>
                    </View>
                </ScrollView> 
            </View>

        </>
      )
    }
    
    
    const styles = StyleSheet.create({
        top:{
            height: 'auto',
            width: '100%',
            padding: 0,
            padding: 8,
            // marginBottom: 2.5,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            backgroundColor: '#fff'
        },
    
        cardCnt:{
            height: 180,
            width: '100%', 
            padding: 5,
            // display: 'flex',
            // flexDirection: 'row',
            // alignItems: 'flex-start',
            // justifyContent: 'flex-start',
            backgroundColor: '#fff'
        },

        card:{
            height: '100%',
            width: 300, 
            padding: 8,
            borderRadius: 5,
            margin: 2.5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            backgroundColor: 'rgb(255, 244, 224)'
        },

        filter:{
            // height: 'auto',
            width: '100%',
            backgroundColor: '#fff',
            // borderRadius: 15,
            // paddingTop: 10,
            // paddingBottom: 10,
            position: 'relative',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            flexWrap: 'wrap',
        },
    
        
      });
    