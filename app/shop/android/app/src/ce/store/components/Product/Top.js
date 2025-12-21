import React from 'react'
import { StyleSheet, Text, View } from 'react-native';

export default function Top({size, title, cost}) {
    return (
        <>
            
            <View style={styles.card}>
                <Text style={{fontSize: 16, color: '#000'}}>&#8358;&nbsp;</Text>
            
                <Text style={{fontSize: size ? size :  25, textDecorationStyle: 'dashed', color: '#000'}} 
                    numberOfLines={2}
                    ellipsizeMode="tail">
                    {new Intl.NumberFormat('en-us').format(cost)}
                </Text> 
            </View>

            <View style={styles.card}>
                <Text style={{fontSize: size ? size :  18, color: '#000'}} 
                    numberOfLines={2}
                    ellipsizeMode="tail">
                    {title}
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
            padding: 8,
            // marginBottom: 2.5,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
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
    