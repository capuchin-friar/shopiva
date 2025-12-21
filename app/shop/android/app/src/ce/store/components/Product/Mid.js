import React from 'react'
import { StyleSheet, Text, View } from 'react-native';

export default function Mid({size, description}) {
    return (
        <>
         
            
            <View style={styles.card}>
                <Text style={{marginBottom: 10, fontSize: 17, color: '#000'}}>Description</Text>
                <Text style={{fontSize: size ? size :  12, color: '#000', padding: 5}}>
                    {description}
                </Text>
            </View>

            <View style={styles.card}>
                <Text style={{marginBottom: 10, fontSize: 17, color: '#000', fontWeight: '900'}}>Campus Express Assurance</Text>
                <View style={{marginBottaom: 10, fontSize: 17, color: '#000'}}>
                    <View>
                        <View></View>
                        <Text style={{marginBottom: 0, fontSize: 14, color: '#000', fontWeight: '600'}}>Secured Payments</Text>
                    </View>
                    <Text style={{fontSize: size ? size :  12, color: '#1f1f1f', padding: 5}}>
                        Payments is secured with Escrow Services
                    </Text>
                </View>
                <View style={{marginBottom: 10, fontSize: 17, color: '#000'}}>
                    <View>
                        <View></View>
                        <Text style={{marginBottom: 0, fontSize: 14, color: '#000', fontWeight: '600'}}>Security And Privacy</Text>
                    </View>
                    <Text style={{fontSize: size ? size :  12, color: '#1f1f1f', padding: 5}}>
                        We respect your privacy so your personsla details are safe
                    </Text>
                </View>
                <View style={{marginBottom: 10, fontSize: 17, color: '#000'}}>
                    <View>
                        <View></View>
                        <Text style={{marginBottom: 0, fontSize: 14, color: '#000', fontWeight: '600'}}>Buyer Protection</Text>
                    </View>
                    <Text style={{fontSize: size ? size :  12, color: '#1f1f1f', padding: 5}}>
                        Get your money back if your order is'nt delivered by estimated date or if you are not satisfied with your order
                    </Text>
                </View>
            </View>

        </>
      )
    }
    
    
    const styles = StyleSheet.create({
        card:{
            height: 'auto',
            width: '100%',
            padding: 0,
            padding: 8,
            // marginBottom: 2.5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
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
    