import React, { useState } from 'react'
import { Button, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import RadioButton from '../../../reusables/RadioBtn'
import BottomModal from '../../../reusables/BtmModal';
import DateSetter from '../../../reusables/DateSetter';

export default function DeliverySetup() {

    const [selectedValue, setSelectedValue] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const handleSelect = (value) => {
        setSelectedValue(value);
    };

    const toggleModal = () => {
        setModalVisible(!modalVisible);
    };

    let [state, setState] = useState('')
    let [campus, setCampus] = useState('')
    let [address1, setAddress1] = useState('')
    let [address2, setAddress2] = useState('')
    let [address3, setAddress3] = useState('')
    let [address4, setAddress4] = useState('')
    let [address5, setAddress5] = useState('')

  return (
    <>
                

        <View style={styles.container}>
        
            {/* <Button title="Show Modal" onPress={toggleModal} /> */}
            <BottomModal visible={modalVisible} onClose={toggleModal}>
                
                <View style={{height: 'auto', width: '100%', borderRadius: 5, padding: 10, marginBottom: 10, display: 'flex', alignItems: 'center', flexDirection: 'column',  justifyContent: 'center'}}>
                    <Text style={{color: '#000', height: 40, display: 'flex', alignItems: 'center', flexDirection: 'row',  justifyContent: 'center'}}>Add Delivery Address</Text>
                    <ScrollView contentContainerStyle={{ display: 'flex', alignItems: 'space-between', flexDirection: 'column',  justifyContent: 'space-between'}} style={{height: 400, width: '100%'}}>
                        
                        <View style={{height: 'auto', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>

                            <View style={{ height: 80, display: 'flex', color: '#000', width: '100%', flexDirection: 'column', marginBottom: 10}}>
                                <Text style={{width: '100%', color: '#000'}}>State</Text>
                                <TextInput style={{height: 50, padding: 10, fontFamily: 'serif', borderRadius: 15, marginBottom: 2, width: '100%',  backgroundColor: '#efefef'}} onChangeText={e => setState(e)} name="state"  placeholder="State"  />
                                {/* <Text style={{color: '#000', marginBottom: 15, display: emailErr.length > 0 ? 'flex' : 'none', fontSize: 10, paddingLeft: 5, color: 'red'}}>{emailErr}</Text> */}
                            </View>


                            <View style={{ height: 'auto', display: 'flex', color: '#000', width: '100%', flexDirection: 'column', marginBottom: 18}}>
                                <Text style={{width: '100%', color: '#000'}}>Campus</Text>
                                <TextInput style={{height: 50, padding: 10, fontFamily: 'serif', borderRadius: 15, marginBottom: 2, width: '100%',  backgroundColor: '#efefef'}} onChangeText={e => setCampus(e)} name="campus"  placeholder="Campus"  />
                                {/* <Text style={{color: '#000', marginBottom: 2, display: pwdErr.length > 0 ? 'flex' : 'none', fontSize: 10, paddingLeft: 5, color: 'red'}}>{pwdErr}</Text> */}
                            </View> 

                            <View style={{ height: 'auto', display: 'flex', color: '#000', width: '100%', flexDirection: 'column', marginBottom: 18}}>
                                <Text style={{width: '100%', color: '#000'}}>Address 1 (Town)</Text>
                                <TextInput style={{height: 50, padding: 10, fontFamily: 'serif', borderRadius: 15, marginBottom: 2, width: '100%',  backgroundColor: '#efefef'}} onChangeText={e => setAddress1(e)} name="town"  placeholder="Town"  />
                                {/* <Text style={{color: '#000', marginBottom: 2, display: pwdErr.length > 0 ? 'flex' : 'none', fontSize: 10, paddingLeft: 5, color: 'red'}}>{pwdErr}</Text> */}
                            </View> 

                            <View style={{ height: 'auto', display: 'flex', color: '#000', width: '100%', flexDirection: 'column', marginBottom: 18}}>
                                <Text style={{width: '100%', color: '#000'}}>Address 2 (Street Name)</Text>
                                <TextInput style={{height: 50, padding: 10, fontFamily: 'serif', borderRadius: 15, marginBottom: 2, width: '100%',  backgroundColor: '#efefef'}} onChangeText={e => setAddress2(e)} name="street-name"  placeholder="Street Name"  />
                                {/* <Text style={{color: '#000', marginBottom: 2, display: pwdErr.length > 0 ? 'flex' : 'none', fontSize: 10, paddingLeft: 5, color: 'red'}}>{pwdErr}</Text> */}
                            </View> 

                            <View style={{ height: 'auto', display: 'flex', color: '#000', width: '100%', flexDirection: 'column', marginBottom: 18}}>
                                <Text style={{width: '100%', color: '#000'}}>Address 3 (Junction)</Text>
                                <TextInput style={{height: 50, padding: 10, fontFamily: 'serif', borderRadius: 15, marginBottom: 2, width: '100%',  backgroundColor: '#efefef'}} onChangeText={e => setAddress3(e)} name="juction"  placeholder="Juction"  />
                                {/* <Text style={{color: '#000', marginBottom: 2, display: pwdErr.length > 0 ? 'flex' : 'none', fontSize: 10, paddingLeft: 5, color: 'red'}}>{pwdErr}</Text> */}
                            </View> 

                            <View style={{ height: 'auto', display: 'flex', color: '#000', width: '100%', flexDirection: 'column', marginBottom: 18}}>
                                <Text style={{width: '100%', color: '#000'}}>Address 4 (Lodge Name)</Text>
                                <TextInput style={{height: 50, padding: 10, fontFamily: 'serif', borderRadius: 15, marginBottom: 2, width: '100%',  backgroundColor: '#efefef'}} onChangeText={e => setAddress4(e)} name="lodge-name"  placeholder="Lodge Name"  />
                                {/* <Text style={{color: '#000', marginBottom: 2, display: pwdErr.length > 0 ? 'flex' : 'none', fontSize: 10, paddingLeft: 5, color: 'red'}}>{pwdErr}</Text> */}
                            </View> 

                            <View style={{ height: 'auto', display: 'flex', color: '#000', width: '100%', flexDirection: 'column', marginBottom: 18}}>
                                <Text style={{width: '100%', color: '#000'}}>Address 5 (Flat Number)</Text>
                                <TextInput style={{height: 50, padding: 10, fontFamily: 'serif', borderRadius: 15, marginBottom: 2, width: '100%',  backgroundColor: '#efefef'}} onChangeText={e => setAddress5(e)} name="flat-number"  placeholder="Flat Number"  />
                                {/* <Text style={{color: '#000', marginBottom: 2, display: pwdErr.length > 0 ? 'flex' : 'none', fontSize: 10, paddingLeft: 5, color: 'red'}}>{pwdErr}</Text> */}
                            </View> 
                                
                        </View>
                        
                    </ScrollView> 
                </View>

                <View style={{padding: 10, display: 'flex', alignItems: 'center', flexDirection: 'row',  justifyContent: 'space-between'}}>
                    <TouchableOpacity onPress={toggleModal} style={[styles.btn, {width: '45%'}]}>
                        <Text style={{color: '#fff'}}>Add</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={toggleModal} style={[styles.btn, {width: '45%'}]}>
                        <Text style={{color: '#fff'}}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </BottomModal>   
        </View> 
        <View style={styles.delveryCnt}>
            <Text style={{color: '#000', fontSize: 15, marginBottom: 10, fontWeight: '900'}}>Delivery Details Setup</Text>
            <View style={styles.delveryCard}>
                <View style={styles.delveryCardTop}>
                    <View> 
                        <RadioButton
                            // label="Option 1"
                            value="option1"
                            selected={selectedValue === 'option1'}
                            onSelect={handleSelect}
                        />
                    </View>
                    <View>
                        <Text style={{color: '#000', fontSize: 15, marginBottom: 10, fontWeight: '500'}}>Custom Location Pickup</Text>
                    </View>
                </View>
                <View>
                    <Text>You Will Pickup The Item At The Designated Shop Provided By The You (Charges Applies)</Text>
                </View>

                <View>
                    <TouchableOpacity onPress={toggleModal} style={styles.btn}>
                        <Text style={{color: '#fff'}}>Add Address</Text>
                    </TouchableOpacity>
                </View>
                {
    null
                } 
            </View>

            <View style={styles.delveryCard}>
                <View style={styles.delveryCardTop}>
                    <View>
                        <RadioButton
                            // label="Option 2"
                            value="option2"
                            selected={selectedValue === 'option2'}
                            onSelect={handleSelect}
                        />
                    </View>
                    <View>
                        <Text style={{color: '#000', fontSize: 15, marginBottom: 10, fontWeight: '500'}}>Door Step Delivery</Text>
                    </View>
                </View>
                <View>
                    <Text >The Item Will Be Delivered At Your Door Step (Charges Applies)</Text>
                </View>

                <View>
                    <TouchableOpacity onPress={toggleModal} style={styles.btn}>
                        <Text style={{color: '#fff'}}>Add Address</Text>
                    </TouchableOpacity>
                </View>
                
                {
                    null
                }
            </View>
        </View>
    </>
  )
}


const styles = StyleSheet.create({
    delveryCnt:{
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