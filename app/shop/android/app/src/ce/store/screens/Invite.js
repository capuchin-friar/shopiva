import { Dimensions, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { getCategories } from "../axios/seller";
import { useEffect, useState } from "react";
import { PermissionsAndroid } from 'react-native';
import Contacts from 'react-native-contacts';
const Invite = () => {

    const screenWidth = Dimensions.get('window').width;
    const screenHeight = Dimensions.get('window').height;

    let [contactList, setContactList] = useState([])

    useEffect(() => {
        PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS, {
            title: 'Contacts',
            message: 'This app would like to view your contacts.',
            buttonPositive: 'Please accept bare mortal',
        })
        .then((res) => {
            console.log('Permission: ', res);
            Contacts.getAll()
                .then((contacts) => {
                    // work with contacts
                    console.log(contacts);
                })
                .catch((e) => {
                    console.log(e);
                });
        })
        .catch((error) => {
            console.error('Permission error: ', error);
        });

    }, [])
    return ( 
        <>

            <View style={{width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'left',  height: 100, backgroundColor: '#fff', }}>
                
                
                
                

            </View>         

            <ScrollView style={{
                height: screenHeight - 260,
                width: '100%',
                backgroundColor: '#efefef',
                color: '#000',
                overflow: 'scroll',
            }}>

                <View style={{width: '100%', display: 'flex', padding: 5, alignItems: 'center', justifyContent: 'left', flexWrap: 'wrap', flexDirection: 'row', height: 'auto', backgroundColor: '#fff', }}>
                    
                    
                    {/*
                        list.map((item, index) => 
                            <TouchableOpacity key={index} style={{height: 200, padding: 5, backgroundColor: '#fff', width: '50%'}}>
                                <View style={{backgroundColor: '#f9f9f9', height: '100%', width: '100%', borderRadius: 5}}>
                                    <Text>{item}</Text>
                                </View>
                            </TouchableOpacity>
                        )
        */}
                    

                </View>


            </ScrollView>
            
        </>
     );
}
 
export default Invite;