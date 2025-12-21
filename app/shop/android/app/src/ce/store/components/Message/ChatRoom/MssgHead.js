import js_ago from 'js-ago';
import React, { 
    useEffect 
} from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { 
    useDispatch, 
    useSelector 
} from 'react-redux';
import { 
    setSellerNameTo 
} from '../../../../../../Redux/reducers/studio/room_name';
import { 
    setSellerDateTo 
} from '../../../../../../Redux/reducers/studio/room_date';
import PhotoImgSvg from '../../assets/image-svgrepo-com (4).svg'

export default function MssgHead({index,navigation,item}) {

    let dispatch = useDispatch()
    useEffect(() => {
        dispatch(setSellerDateTo(item?.mssg?.date))
        dispatch(setSellerNameTo(item?.buyer_data?.fname + ' ' + item?.buyer_data?.lname))
    }, [])
    
    // console.log(item)
  return (
    <>
        <TouchableOpacity activeOpacity={.8} key={index} style={styles.MessageHead}  data-screen='home' onPress={e => navigation.navigate('seller-message-room', {room: item?.room})}>
            
            <View  style={{width: '25%', height: '100%', padding: 10,  display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Text style={{fontSize: 21, height: 60, paddingTop: 12, backgroundColor: '#fff4e0', width: 60, color: 'orangered', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', textAlign: 'center', borderRadius: 50}}>
                    {item?.buyer_data?.fname?.split('')[0]}.{item?.buyer_data?.lname?.split('')[0]}
                </Text>
            </View> 

            <View  style={{width: '75%', height: '100%', display: 'flex', flexDirection: 'column'}}>

                <View style={{width: '100%', height: '100%', display: 'flex', flexDirection: 'row'}}>

                    <Text style={{position: 'absolute', top: 15, fontWeight: '800', fontFamily: 'serif', left: 5}}>{item?.buyer_data?.fname} {item?.buyer_data?.lname}</Text>
                    <Text style={{position: 'absolute', top: 18, fontSize: 10, fontFamily: 'serif', right: 25}}>{js_ago(new Date(item?.mssg?.date))}</Text>

                </View>

                <Text style={{position: 'absolute', color: '#3a3a3a', bottom: 10, fontFamily: 'serif', fontSize: 12, left: 8, display: 'flex', alignItems: 'center', flexDirection: 'row'}}>
                    {
                        item?.mssg?.mssg !== ''
                        ? 
                        item?.mssg?.mssg
                        :
                        <>
                            <PhotoImgSvg height="15" width="15" />

                            &nbsp;

                            <Text style={{fontFamily: 'serif', fontSize: 12, marginBottom: 15, left: 12, display: 'flex', alignItems: 'center', flexDirection: 'row', color: 'orangered'}}>Photo</Text>
                        </>
                    }
                </Text>

            </View>


        </TouchableOpacity>
                 
    </>
  )
}

const styles = StyleSheet.create({
    icons: {
        height: 50,
        width: 50,
        borderRadius: 50
        
    },
   
    MessageHead: {
        height: 80,
        width: '100%', 
        borderRadius: 1.5,
        backgroundColor: '#fff',
        display: 'flex', 
        fontFamily: 'serif',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        marginBottom: 0.5
    }
    
  });