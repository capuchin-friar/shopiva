import React from 'react'
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'

export default function Specs() {
  return (
    <>
      <View style={styles.wantCnt}>
            
            <Text style={{color: '#000', fontSize: 15, marginBottom: 10, fontWeight: '800'}}>Specification Setup</Text>

            <TextInput placeholder='Write A Short Note Describing The Item You Want To Buy. e.g(Power bank must be 10,000MAh, or Cloth must be XXL)' style={styles.description} multiline  />
        </View>
    </>
  )
}



const styles = StyleSheet.create({
    wantCnt:{
      height: 'auto',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      padding: 10,
      backgroundColor: '#fff',
      marginBottom: 5
    },
    container: {
        // flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        fontSize: 18,
        textAlign: 'center',
    },
    description:{
      minHeight: 200,
      width: '100%',
      padding: 10,
      backgroundColor: '#f9f9f9',
      marginBottom: 5,
      borderRadius: 10,
      display: 'flex',
      alignItems: 'flex-start',
      textAlignVertical: 'top',
      flexDirection: 'row',
      justifyContent: 'flex-start',
    },
    btn:{
      height: 40,
      width: '50%',
      padding: 0,
      borderRadius: 10,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#FF4500',
      marginTop: 15,
      color: '#fff'
    }
  });