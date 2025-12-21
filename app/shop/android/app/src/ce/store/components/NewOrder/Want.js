import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export default function Want() {
  return (
    <>
      <View style={styles.wantCnt}>
            
            <Text style={{color: '#000', fontSize: 15, marginBottom: 10, fontWeight: '800'}}>Unit Setup</Text>

            <View style={{width: '100%', marginBottom: 20, display: 'flex', alignItems: 'center', flexDirection: 'row',  justifyContent: 'space-between'}}>
                <Text style={{color: '#000'}}>Units Availble</Text>
                <Text style={{color: '#000', fontSize: 20,}}>10</Text>
            </View>

            <View style={{width: '100%', marginBottom: 20, display: 'flex', alignItems: 'flex-start', flexDirection: 'column',  justifyContent: 'space-between'}}>
                <Text style={{color: '#000'}}>How Many Units Of This Item Do You Want To Buy</Text>

                <View style={{width: '100%', marginBottom: 0, display: 'flex', alignItems: 'center', flexDirection: 'row',  justifyContent: 'space-between'}}>
                    <View style={{width: '100%', marginBottom: 0, display: 'flex', alignItems: 'center', flexDirection: 'row',  justifyContent: 'space-evenly', backgroundColor: '#fff'}}>
                        <View style={[{width: '33%'}]}>
                            <TouchableOpacity style={[styles.btn, {width: 45}]}> 
                                <Text style={{color: '#fff'}}>-</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={[{width: '33%', height: 40, backgroundColor: '#fff', display: 'flex', alignItems: 'flex-end', flexDirection: 'row',  justifyContent: 'center'}]}>
                            <Text style={{color: '#000', fontSize: 20, width: '100%', }}>0</Text>
                        </View>

                        <View style={[{width: '33%'}]}>
                            <TouchableOpacity style={[styles.btn, {width: 45}]}> 
                                <Text style={{color: '#fff'}}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    

                </View>
                
            </View>

            {/* <View>
                <Text style={{color: '#000', fontSize: 14, marginBottom: 10, fontWeight: '500'}}>Unit Setup</Text>

                <View>
                    <Text>Units Availble</Text>
                    <Text>10</Text>
                </View>
                <View>
                    <Text>Units You Want To Buy</Text>
                    <Text>10</Text>
                </View>
            </View> */}
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
    delveryCard:{
      height: 'auto',
      width: '100%',
      padding: 10,
      borderColor: '#FF4500',
      backgroundColor: '#fff',
      borderWidth: 2,
      marginBottom: 25,
      borderRadius: 10 
    },
    delveryCardTop:{
      height: 'auto',
      width: '100%',
      padding: 0,
      display: 'flex',
      borderRadius: 10,
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      backgroundColor: '#fff',
    //   marginTop: 15
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