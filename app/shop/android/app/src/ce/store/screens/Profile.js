import { 
  useEffect,
  useState 
} from "react";
import { 
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  TouchableOpacityBase,
  View 
} from "react-native";
import { 
  useDispatch,
} from "react-redux";
import { setUserModeTo } from "../../../../../../redux/reducer/mode";

const ProfileCnt = ({navigation}) => {
  // let {selected_profession} = useSelector(s => s.selected_profession);
  let dispatch = useDispatch();
  const screenHeight = Dimensions.get('window').height;

  const [modalVisible, setModalVisible] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);
 
  
  return ( 
      <>

        <ScrollView style={{
            height: screenHeight - 50,
            width: '100%',
            position: 'relative',
            backgroundColor: '#f9f9f9',
            color: '#000',
            overflow: 'scroll'
            
        }}>

            <View>
                <View style={{height: 50, width: '100%', fontFamily: 'serif', display: 'flex', fontSize: 18, alignItems: 'center', justifyContent: 'left', paddingLeft: 20, flexDirection: 'row', backgroundColor: '#f9f9f9'}}>
                    <Text style={{fontSize: 15, fontWeight: 'bold', fontFamily: 'serif'}}>Campus Express</Text>

                </View>

                <View> 
                    <TouchableOpacity onPress={e => navigation.navigate('user-product-management')} style={{display: 'flex', alignItems: 'center', justifyContent: 'left', padding: 20, marginBottom: 3, flexDirection: 'row', height: 60, width: '100%', backgroundColor: '#fff'}}>
                        <Text style={{fontFamily: 'serif', fontWeight: 500, fontSize: 15}}>Become A Seller</Text>
                        {/* <Image style={styles.icons} source={require('../../assets/right-arrow.png')} /> */}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={e => navigation.navigate('user-product-management')} style={{display: 'flex', alignItems: 'center', justifyContent: 'left', padding: 20, marginBottom: 3, flexDirection: 'row', height: 60, width: '100%', backgroundColor: '#fff'}}>
                        <Text style={{fontFamily: 'serif', fontWeight: 500, fontSize: 15}}>History</Text>
                        {/* <Image style={styles.icons} source={require('../../assets/right-arrow.png')} /> */}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={e => navigation.navigate('user-product-management')} style={{display: 'flex', alignItems: 'center', justifyContent: 'left', padding: 20, marginBottom: 3, flexDirection: 'row', height: 60, width: '100%', backgroundColor: '#fff'}}>
                        <Text style={{fontFamily: 'serif', fontWeight: 500, fontSize: 15}}>Invite Friends</Text>
                        {/* <Image style={styles.icons} source={require('../../assets/right-arrow.png')} /> */}
                    </TouchableOpacity>

                </View>

            </View>

            <View>

                <View style={{height: 50, width: '100%', fontFamily: 'serif', display: 'flex', fontSize: 18, alignItems: 'center', justifyContent: 'left', paddingLeft: 20, flexDirection: 'row', backgroundColor: '#f9f9f9'}}>
                    <Text style={{fontSize: 15, fontWeight: 'bold', fontFamily: 'serif'}}>Settings</Text>

                </View>

                <View> 
                    <TouchableOpacity onPress={e => navigation.navigate('user-preference')} style={{display: 'flex', alignItems: 'center', justifyContent: 'left', padding: 20, marginBottom: 3, flexDirection: 'row', height: 60, width: '100%', backgroundColor: '#fff'}}>
                        <Text style={{fontFamily: 'serif', fontWeight: 500, fontSize: 15}}>Preference</Text>
                        {/* <Image style={styles.icons} source={require('../../assets/right-arrow.png')} /> */}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={e => navigation.navigate('user-account')}  style={{display: 'flex', alignItems: 'center', justifyContent: 'left', padding: 20, flexDirection: 'row', height: 60, width: '100%', backgroundColor: '#fff'}}>
                        <Text style={{fontFamily: 'serif', fontWeight: 500, fontSize: 15}}>Acccount</Text>
                        {/* <Image style={styles.icons} source={require('../../assets/right-arrow.png')} /> */}
                    </TouchableOpacity>
                    
                </View>

            </View>

            <View>
            
                <View style={{height: 50, width: '100%', fontFamily: 'serif', display: 'flex', fontSize: 18, alignItems: 'center', justifyContent: 'left', paddingLeft: 20, flexDirection: 'row', backgroundColor: '#f9f9f9'}}>
                    <Text style={{fontSize: 15, fontWeight: 'bold', fontFamily: 'serif'}}>Community and Legal</Text>

                </View>

                <View> 
                    <TouchableOpacity style={{display: 'flex', alignItems: 'center', justifyContent: 'left', padding: 20, marginBottom: 3, flexDirection: 'row', height: 60, width: '100%', backgroundColor: '#fff'}}>
                        <Text style={{fontFamily: 'serif', fontWeight: 400, fontSize: 15}}>Terms Of Service</Text>
                        {/* <Image style={styles.icons} source={require('../../assets/right-arrow.png')} /> */}
                    </TouchableOpacity>
                    <TouchableOpacity style={{display: 'flex', alignItems: 'center', justifyContent: 'left', padding: 20, marginBottom: 3, flexDirection: 'row', height: 60, width: '100%', backgroundColor: '#fff'}}>
                        <Text style={{fontFamily: 'serif', fontWeight: 400, fontSize: 15}}>Privacy Policy</Text>
                        {/* <Image style={styles.icons} source={require('../../assets/right-arrow.png')} /> */}
                    </TouchableOpacity>
                    <TouchableOpacity style={{display: 'flex', alignItems: 'center', justifyContent: 'left', padding: 20, marginBottom: 3, flexDirection: 'row', height: 60, width: '100%', backgroundColor: '#fff'}}>
                        <Text style={{fontFamily: 'serif', fontWeight: 400, fontSize: 15}}>Blogs</Text>
                        {/* <Image style={styles.icons} source={require('../../assets/right-arrow.png')} /> */}
                    </TouchableOpacity>
                    <TouchableOpacity style={{display: 'flex', alignItems: 'center', justifyContent: 'left', padding: 20, marginBottom: 3, flexDirection: 'row', height: 60, width: '100%', backgroundColor: '#fff'}}>
                        <Text style={{fontFamily: 'serif', fontWeight: 400, fontSize: 15}}>Community Standard</Text>
                        {/* <Image style={styles.icons} source={require('../../assets/right-arrow.png')} /> */}
                    </TouchableOpacity>
                    <TouchableOpacity style={{display: 'flex', alignItems: 'center', justifyContent: 'left', padding: 20, marginBottom: 3, flexDirection: 'row', height: 60, width: '100%', backgroundColor: '#fff'}}>
                        <Text style={{fontFamily: 'serif', fontWeight: 400, fontSize: 15}}>Forum</Text>
                        {/* <Image style={styles.icons} source={require('../../assets/right-arrow.png')} /> */}
                    </TouchableOpacity>
                    
                </View>

            </View>

            <View style={{height: 50, textAlign: 'center', width: '100%', fontFamily: 'serif', display: 'flex', fontSize: 18, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', backgroundColor: '#f9f9f9'}}>
                <Text style={{fontSize: 15, color: '#727272', textAlign: 'center', display: 'flex', justifyContent: 'center', fontWeight: 'bold', fontFamily: 'serif'}}>V 1.1.0</Text>

            </View>
            <View style={{height: 50, textAlign: 'center', width: '100%', fontFamily: 'serif', display: 'flex', fontSize: 18, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', backgroundColor: '#f9f9f9'}}>

            </View>
            
        </ScrollView>
      </>
   );
}

export default ProfileCnt;



const styles = StyleSheet.create({
  icons: {
      height: 20,
      width: 20,
      position: 'absolute',
      right: 10,
      top: 20
    },

  
 
});
