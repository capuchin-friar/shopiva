import { Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Button } from "react-native";
import { useEffect, useState } from "react";
import { Dropdown } from 'react-native-element-dropdown';
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { setUserAuthTo } from "../../../../../redux/reducer/auth";
// GoogleSignInSetup.js
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


const Signup = ({}) => {
    const screenHeight = Dimensions.get('window').height;

    let dispatch = useDispatch()
    let navigation = useNavigation()

    let [fname, setFname] = useState('')
    let [lname, setLname] = useState('')
    let [email, setEmail] = useState('')
    let [phone, setPhone] = useState('')
    let [pwd, setPwd] = useState('')
    let [server_err, set_server_err] = useState('')

    let [fnameErr, setFnameErr] = useState('')
    let [lnameErr, setLnameErr] = useState('')
    let [emailErr, setEmailErr] = useState('')
    let [phoneErr, setPhoneErr] = useState('')
    let [pwdErr, setPwdErr] = useState('')
    
   
    let signupHandler = async() => {
        // dispatch(setUserAuthTo(true))   
        // navigation.navigate('user-home')
        
        // singup(fname,lname,email,phone,pwd)
        // .then((result) => {
        //     console.log(result)
        //     result ? navigation.navigate('seller-login') : ''
        // })
        // .catch((err) => console.log(err))

        let response = await validateInput()

        response.map(item => {

            let name = item._j.name;
            let err = item._j.mssg;

            console.log('errs: ', name, err)


            if(name.toLowerCase() === 'firstname'){
                setFnameErr(err)
            }else if(name.toLowerCase() === 'lastname'){
                setLnameErr(err)
            }else if(name.toLowerCase() === 'email'){
                setEmailErr(err)
            }else if(name.toLowerCase() === 'phone number'){
                setPhoneErr(err)
            }else if(name.toLowerCase() === 'password'){
                setPwdErr(err)
            }
        })

        let data = response.filter((item) => item._j.mssg === '').length === 5 ? true : false;

        if(data){

            console.log(data)
            fetch('http://192.168.175.146:2222/registration', {
                method: 'post',
                headers: {
                    "Content-Type": "Application/json"
                },
                body: JSON.stringify({fname,lname,email,phone,pwd,state:'',campus:'',gender:null})
            })
            .then(async(result) => {
                let response = await result.json()
                // console.log(result)
                console.log(response)
                if(response.bool){

                }else{
                    if(response.data === 'duplicate email'){
                        setEmailErr('Email Already Exist')
                    }else if(response.data === 'duplicate phone'){
                        setPhoneErr('Phone Number Already Exist')
                    }
                    // console.log(response.data)

                }

            })
            .catch((err) => {
                // set_server_err(err)
                console.log(err)
            })
        }
        
    }

    
    async function validateInput() {

        let data = [  
            {value: fname, name: 'FirstName'},
            {value: lname, name: 'LastName'},
            {value: email, name: 'Email'},
            {value: phone, name: 'Phone Number'},
            {value: pwd, name: 'Password'}
        ];

        let result =  data.map(async(item) => {
            let test = {email: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/}

            if(item.name.toLowerCase() === 'firstname'){
                
                if(item.value === ''){
                    return ({bool: false, mssg: `${item.name} cannot be empty`, name: item.name})
                }else if(item.value.length < 3){
                    return ({bool: false, mssg: `Characters must be at least 3`, name: item.name})
                }else{
                    return ({bool: true, mssg: ``, name: item.name})
                }

            }else if(item.name.toLowerCase() === 'lastname'){

                if(item.value === ''){
                    return ({bool: false, mssg: `${item.name} cannot be empty`, name: item.name})
                }else if(item.value.length < 3){
                    return ({bool: false, mssg: `Characters must be at least 3`, name: item.name})
                }else{
                    return ({bool: true, mssg: ``, name: item.name})
                }
                
            }else if(item.name.toLowerCase() === 'email'){

                if(item.value.length < 1){
                    return ({bool: false, mssg: `${item.name} cannot be empty`, name: item.name})
                }else if(!item.value.match(test.email)){
                    return ({bool: false, mssg: `${item.name} is invalid`, name: item.name})
                }else{ 
                    return ({bool: true, mssg: ``, name: item.name})
                } 
                
            }else if(item.name.toLowerCase() === 'phone number'){

                if(item.value === ''){
                    return ({bool: false, mssg: `${item.name} cannot be empty`, name: item.name})
                }else if(item.value.length > 0 && item.value.length < 10){
                    return {bool: false, mssg: `${item.name} is invalid`, name: item.name}
                }else{
                    return ({bool: true, mssg: ``, name: item.name})
                }

            }else if(item.name.toLowerCase() === 'password'){

                if(item.value === ''){
                    return ({bool: false, mssg: `${item.name} cannot be empty`, name: item.name})
                }else if(item.value.length > 0 && item.value.length < 8){
                    return {bool: false, mssg: `${item.name} must be at least 8 characters`, name: item.name}
                }else{
                    return ({bool: true, mssg: ``, name: item.name})
                }

            }
        })

        // console.log('result1: ', result1)

        return [...result];
    } 
    return ( 
        <> 
            <View style={{
                height: 200,
                width: '100%',
                position: 'relative',
                backgroundColor: '#FF4500',
                color: '#000',
                overflow: 'scroll'
            }}>

            </View>
            <View style={{
                height: screenHeight - 200,
                width: '100%',
                position: 'relative',
                backgroundColor: '#FF4500',
                color: '#000',
                overflow: 'scroll'
            }}>
                <ScrollView contentContainerStyle={{ display: 'flex', alignItems: 'space-between', flexDirection: 'column',  justifyContent: 'center'}} style={{height: '100%', width: '100%', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20, backgroundColor: '#fff'}}>
                    <View style={{
                        height: 'auto',
                        width: '100%',
                        position: 'relative',
                        backgroundColor: '#fff',
                        color: '#000',
                        overflow: 'scroll',
                        marginBottom: 30
                    }}>
                        <TouchableOpacity onPress={e => signupHandler()} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: 15, paddingRight: 15, justifyContent: 'space-between', marginBottom: 8, flexDirection: 'row', borderRadius: 15, height: 40, width: '100%', backgroundColor: '#fff', 
                        borderWidth: .5,
                        borderColor: '#004cff'
                        // ...Platform.select({
                        //     ios: {
                        //         shadowColor: '#000',
                        //         shadowOffset: { width: 0, height: 2 },
                        //         shadowOpacity: 0.25,
                        //         shadowRadius: 3.84,
                        //     },
                        //     android: {
                        //         elevation: 5,
                        //     },
                        //     }),
                        }} >
                            <View></View>
                            <Text style={{fontFamily: 'serif', fontWeight: 'bold', borderRadius: 15, color: '#004cff', textAlign: 'center', fontSize: 13}}>Facebook</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={e => signupHandler()} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: 15, paddingRight: 15, justifyContent: 'space-between', marginBottom: 25, flexDirection: 'row', borderRadius: 15, height: 40, width: '100%', backgroundColor: '#fff', 
                        borderWidth: .5,
                        borderColor: '#FF4500'
                        // ...Platform.select({
                        //     ios: {
                        //         shadowColor: '#000',
                        //         shadowOffset: { width: 0, height: 2 },
                        //         shadowOpacity: 0.25,
                        //         shadowRadius: 3.84,
                        //     },
                        //     android: {
                        //         elevation: 5,
                        //     },
                        //     }),
                        }} >
                            <View></View>
                            <Text style={{fontFamily: 'serif', fontWeight: 'bold', borderRadius: 15, color: '#FF4500', textAlign: 'center', fontSize: 13}}>Google</Text>
                        </TouchableOpacity>

                    </View>

                    <View style={{
                        height: 'auto',
                        width: '100%',
                        position: 'relative',
                        backgroundColor: '#fff',
                        color: '#000',
                        overflow: 'scroll',
                        marginBottom: 40
                    }}>
                        
                        
                        <View style={{height: 'auto', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>

                            
                            <View style={{height: 'auto', width: '100%', display: 'flex', marginBottom: 35,  alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row'}}>

                                <View style={{display: 'flex', height: 60, color: '#000', width: '48%', flexDirection: 'column'}}>
                                    <Text style={{width: '100%', color: '#000'}}>FirstName</Text>
                                    <TextInput style={{height: 50, padding: 10, fontFamily: 'serif', borderRadius: 15, marginBottom: 2, width: '100%',  backgroundColor: '#efefef'}} onChangeText={e => setFname(e)}   placeholder="FirstName"  />
                                    <Text style={{color: '#000', marginBottom: 15, display: fnameErr.length > 0 ? 'flex' : 'none', fontSize: 10, paddingLeft: 5, color: 'red'}}>{fnameErr}</Text>
                                </View>
            

                                <View style={{display: 'flex', height: 60, color: '#000', width: '48%', flexDirection: 'column'}}>
                                    <Text style={{width: '100%', color: '#000'}}>LastName</Text>
                                    <TextInput style={{height: 50, padding: 10, fontFamily: 'serif', borderRadius: 15, marginBottom: 2, width: '100%',  backgroundColor: '#efefef'}} onChangeText={e => setLname(e)}   placeholder="LastName"  />
                                    <Text style={{color: '#000', marginBottom: 15, display: lnameErr.length > 0 ? 'flex' : 'none', fontSize: 10, paddingLeft: 5, color: 'red'}}>{lnameErr}</Text>
                                </View>

                            </View>

                        
                            <View style={{ height: 80, display: 'flex', color: '#000', width: '100%', flexDirection: 'column', marginBottom: 10}}>
                                <Text style={{width: '100%', color: '#000'}}>Email</Text>
                                <TextInput style={{height: 50, padding: 10, fontFamily: 'serif', borderRadius: 15, marginBottom: 2, width: '100%',  backgroundColor: '#efefef'}} onChangeText={e => setEmail(e)} name="email"  placeholder="Email"  />
                                <Text style={{color: '#000', marginBottom: 15, display: emailErr.length > 0 ? 'flex' : 'none', fontSize: 10, paddingLeft: 5, color: 'red'}}>{emailErr}</Text>
                            </View>

                            <View style={{height: 'auto', width: '100%', display: 'flex', marginBottom: 2,  alignItems: 'flex-start', justifyContent: 'space-between', flexDirection: 'column'}}>
                                <Text style={{width: '100%', color: '#000'}}>Phone</Text>

                                <View style={{height: 'auto', width: '100%', display: 'flex', marginBottom: 0,  alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row'}}>
                                    <View style={{display: 'flex', color: '#000', width: '18%', flexDirection: 'column'}}>
                                        <TextInput style={{height: 50, padding: 10, fontFamily: 'serif', borderRadius: 15, marginBottom: 2, width: '100%', backgroundColor: '#efefef'}} value="+234"   placeholder="NIG"  />
                                    </View>
                

                                    <View style={{display: 'flex', color: '#000', width: '80%', flexDirection: 'column'}}>
                                        <TextInput style={{height: 50, padding: 10, fontFamily: 'serif', borderRadius: 15, marginBottom: 2, width: '100%', backgroundColor: '#efefef'}} onChangeText={e => setPhone(e)} keyboardType="numeric" name="email"  placeholder="Phone Number"  />
                                    </View>
                                </View>
                                <Text style={{color: '#000', marginBottom: 15, display: phoneErr.length > 0 ? 'flex' : 'none', fontSize: 10, paddingLeft: 5, color: 'red'}}>{phoneErr}</Text>

                            </View>

                            <View style={{ height: 'auto', display: 'flex', color: '#000', width: '100%', flexDirection: 'column', marginBottom: 18}}>
                                <Text style={{width: '100%', color: '#000'}}>Password</Text>
                                <TextInput style={{height: 50, padding: 10, fontFamily: 'serif', borderRadius: 15, marginBottom: 2, width: '100%',  backgroundColor: '#efefef'}} onChangeText={e => setPwd(e)} name="Password"  placeholder="Password"  />
                                <Text style={{color: '#000', marginBottom: 2, display: pwdErr.length > 0 ? 'flex' : 'none', fontSize: 10, paddingLeft: 5, color: 'red'}}>{pwdErr}</Text>
                            </View> 
                                
                        </View>
                    </View>

                    <View style={{
                        height: 'auto',
                        width: '100%',
                        position: 'relative',
                        backgroundColor: '#fff',
                        color: '#000',
                        overflow: 'scroll'
                    }}>
                        <TouchableOpacity activeOpacity={.6} onPress={e => signupHandler()} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, marginBottom: 3, flexDirection: 'row', borderRadius: 15, height: 60, width: '100%', backgroundColor: '#FF4500'}} >
                            <Text style={{fontFamily: 'serif', fontWeight: 'bold', borderRadius: 15, color: '#fff', textAlign: 'center', fontSize: 15}}>Signup</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={e => navigation.navigate('user-login')}  style={{height: 60, width: 'auto', marginTop: 5, marginBottom: 5, display: 'flex', alignItems: 'center', backgroundColor: '#fff', justifyContent: 'center', flexDirection: 'column'}}>
                                
                            <Text style={{height: 'auto', width: 'auto', fontSize: 10, backgroundColor: '#fff', fontFamily: 'serif', color: '#FF4500'}}>Already Have An Account Login Here</Text>

                        </TouchableOpacity>

                    </View>
                </ScrollView>
            </View>
        </>
     );
}
 
export default Signup;

const styles = StyleSheet.create({
 
    icon: {
      marginRight: 5,
      
    },
    label: {
      position: 'absolute',
      backgroundColor: 'white',
      left: 22,
      top: 8,
      zIndex: 999,
      paddingHorizontal: 8,
      fontSize: 14,
    },
    placeholderStyle: {
      fontSize: 16,
    },
    selectedTextStyle: {
      fontSize: 16,
    },
    iconStyle: {
      width: 20,
      height: 20,
    },
    inputSearchStyle: {
      height: 40,
      fontSize: 16,
    },
  });