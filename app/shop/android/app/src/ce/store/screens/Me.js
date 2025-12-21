import React, { useEffect } from 'react'
import { Dimensions, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import UserSvg from '../../wallet/assets/user-rounded-svgrepo-com (1).svg'
import SupportSvg from '../../wallet/assets/support-svgrepo-com (4).svg'
import ReportSvg from '../../wallet/assets/receipt-svgrepo-com.svg'
import InviteSvg from '../../wallet/assets/diptych-folded-paper-of-stationery-svgrepo-com.svg'
import AngleSvg from '../../wallet/assets/angle-right-svgrepo-com.svg'
import LogoutSvg from '../../wallet/assets/logout-svgrepo-com.svg'
import HelpSvg from '../../wallet/assets/help1-svgrepo-com.svg'
import RatingSvg from '../../wallet/assets/star-rating-svgrepo-com (1).svg'
import { getData } from '../reusables/AsyncStore.js'
import { useDispatch, useSelector } from 'react-redux'
import { set_user } from '../../../../../redux/user.js'

export default function Me({navigation}) {
  const screenHeight = Dimensions.get('window').height;

  let dispatch= useDispatch();
  let {
    user
  } = useSelector(s=>s.user);
  
    // let [user, set_user] = React.useState('')
    React.useEffect(() => {
        async function get_user() {
            let data = await getData('user');
            // set_user(JSON.parse(data));
            dispatch(set_user(JSON.parse(data)))
            
            // console.log('data:', JSON.parse(data))
        }
        get_user() 
    }, []) 

  return (
    <>
        <ScrollView style={{
            height: screenHeight - 160,
            width: '100%',
            position: 'relative',
            padding: 0,
            // backgroundColor: '#fff',
            color: '#000',
            overflow: 'scroll',
            backgroundColor: '#efefef'
        }}>

            <View style={{marginBottom: 0, marginTop: 5}}>
              
                <View> 
                    <TouchableOpacity onPress={e => navigation.navigate('user-data')} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 20, marginBottom: 0, flexDirection: 'row', borderTopLeftRadius: 10, borderTopRightRadius: 10, height: 75, width: '100%', backgroundColor: '#fff'}}>
                        <View style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row'}}>
                            <View style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexDirection: 'row', backgroundColor: '#efefef', marginRight: 15, borderRadius: 50, padding: 5}}>
                                <UserSvg width={20} height={20} />
                            </View>
                            <Text style={{fontFamily: 'Roboto', fontWeight: 500, fontSize: 15, color: '#000'}}>Personal Details</Text>
                            
                        </View>
                        <View style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexDirection: 'row', backgroundColor: '#fff', borderRadius: 50, padding: 5}}>
                            <AngleSvg width={35} height={35} />
                        </View>
                       
                    </TouchableOpacity>

                    
                    <TouchableOpacity onPress={e => navigation.navigate('user-invite')} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 20,  flexDirection: 'row', height: 75, width: '100%', backgroundColor: '#fff'}}>
                        <View style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row'}}>
                            <View style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexDirection: 'row', backgroundColor: '#efefef', marginRight: 15, borderRadius: 50, padding: 5}}>
                                <InviteSvg width={20} height={20} />
                            </View>
                            <Text style={{fontFamily: 'Roboto', fontWeight: 500, fontSize: 15, color: '#000'}}>Invite Friends</Text>
                        </View>
                         
                        <View style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexDirection: 'row', backgroundColor: '#fff', borderRadius: 50, padding: 5}}>
                            <AngleSvg width={35} height={35} />
                        </View>
                    </TouchableOpacity>

                     <TouchableOpacity onPress={e => navigation.navigate('buyer-account')} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 20, marginBottom: 0, flexDirection: 'row', height: 75, width: '100%', backgroundColor: '#fff'}}>
                        <View style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row'}}>
                            <View style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexDirection: 'row', backgroundColor: '#efefef', marginRight: 15, borderRadius: 50, padding: 5}}>
                                <ReportSvg width={20} height={20} />
                            </View>
                            <Text style={{fontFamily: 'Roboto', fontWeight: 500, fontSize: 15, color: '#000'}}>Statement and report</Text>
                        </View>
                        <View style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexDirection: 'row', backgroundColor: '#fff', borderRadius: 50, padding: 5}}>
                            <AngleSvg width={35} height={35} />
                        </View>
                    </TouchableOpacity>
                </View>
                

            </View>

            <View style={{marginBottom: 0}}>
            
                <View> 
                    <TouchableOpacity onPress={e => navigation.navigate('buyer-support')} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 20, marginBottom: 0, borderTopLeftRadius: 10, borderTopRightRadius: 10, flexDirection: 'row', height: 75, width: '100%', backgroundColor: '#fff'}}>
                        <View style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row'}}>
                            <View style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexDirection: 'row', backgroundColor: '#efefef', marginRight: 15, borderRadius: 50, padding: 5}}>
                                <SupportSvg width={20} height={20} />
                            </View>
                            <Text style={{fontFamily: 'Roboto', fontWeight: 500, fontSize: 15, color: '#000'}}>Support</Text>
                        </View>
                        <View style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexDirection: 'row', backgroundColor: '#fff', borderRadius: 50, padding: 5}}>
                            <AngleSvg width={35} height={35} />
                        </View>
                    </TouchableOpacity>
                    
                    <TouchableOpacity onPress={e => navigation.navigate('buyer-support')} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 20, marginBottom: 0, borderTopLeftRadius: 10, borderTopRightRadius: 10, flexDirection: 'row', height: 75, width: '100%', backgroundColor: '#fff'}}>
                        <View style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row'}}>
                            <View style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexDirection: 'row', backgroundColor: '#efefef', marginRight: 15, borderRadius: 50, padding: 5}}>
                                <HelpSvg width={20} height={20} />
                            </View>
                            <Text style={{fontFamily: 'Roboto', fontWeight: 500, fontSize: 15, color: '#000'}}>Help</Text>
                        </View>
                        <View style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexDirection: 'row', backgroundColor: '#fff', borderRadius: 50, padding: 5}}>
                            <AngleSvg width={35} height={35} />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={e => navigation.navigate('buyer-community/legal')} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 20, marginBottom: 0, flexDirection: 'row', height: 75, width: '100%', backgroundColor: '#fff'}}>
                        <View style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row'}}>
                            <View style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexDirection: 'row', backgroundColor: '#efefef', marginRight: 15, borderRadius: 50, padding: 5}}>
                                <RatingSvg width={20} height={20} />
                            </View>
                            <Text style={{fontFamily: 'Roboto', fontWeight: 500, fontSize: 15, color: '#000'}}>Rate us</Text>
                        </View>
                        <View style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexDirection: 'row', backgroundColor: '#fff', borderRadius: 50, padding: 5}}>
                            <AngleSvg width={35} height={35} />
                        </View>
                    </TouchableOpacity> 

                   
                    
                </View>

            </View>

            <View>
                <TouchableOpacity onPress={e => navigation.navigate('buyer-community/legal')} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottomLeftRadius: 10, borderBottomRightRadius: 10, padding: 20, marginBottom: 0, flexDirection: 'row', height: 75, width: '100%', backgroundColor: '#fff'}}>
                    <View style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row'}}>
                        <View style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexDirection: 'row', backgroundColor: '#efefef', borderRadius: 50, marginRight: 15, padding: 5}}>
                            <LogoutSvg width={20} height={20} />
                        </View>
                        <Text style={{fontFamily: 'Roboto', fontWeight: 500, fontSize: 15, color: '#000'}}>Log out</Text>
                    </View>
                    <View style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexDirection: 'row', backgroundColor: '#fff', borderRadius: 50, padding: 5}}>
                        <AngleSvg width={35} height={35} />
                    </View>
                </TouchableOpacity>
            </View>

            <View style={{height: 75, textAlign: 'center', width: '100%', fontFamily: 'Roboto', display: 'flex', fontSize: 18, alignItems: 'center', padding: 20, justifyContent: 'space-between', flexDirection: 'row', backgroundColor: '#fff'}}>
                <Text style={{fontSize: 11, color: '#000', color: '#727272', textAlign: 'center', display: 'flex', justifyContent: 'center', fontWeight: 'bold', fontFamily: 'Roboto'}}>Paypenz   v-1.1.0</Text>

            </View>
        </ScrollView>
    </>
  )
}
