import { 
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View 
} from "react-native";

const Account = ({navigation}) => {
    return ( 
        <>
            <View >
                <TouchableOpacity onPress={e => navigation.navigate('seller-preference')} style={{display: 'flex', alignItems: 'center', justifyContent: 'left', padding: 20, marginBottom: 1.3, flexDirection: 'row', height: 60, width: '100%', backgroundColor: '#fff'}}>
                    <Text style={{fontFamily: 'serif', fontWeight: 500, fontSize: 15}}>Change Password</Text>
                    <Image style={styles.icons} source={require('../../assets/right-arrow.png')} />
                </TouchableOpacity>


                <TouchableOpacity onPress={e => navigation.navigate('seller-preference')} style={{display: 'flex', alignItems: 'center', justifyContent: 'left', padding: 20, marginBottom: 1.3, flexDirection: 'row', height: 60, width: '100%', backgroundColor: '#fff'}}>
                    <Text style={{fontFamily: 'serif', fontWeight: 500, fontSize: 15}}>Change Payment Method</Text>
                    <Image style={styles.icons} source={require('../../assets/right-arrow.png')} />
                </TouchableOpacity>



                <TouchableOpacity onPress={e => navigation.navigate('seller-preference')} style={{display: 'flex', alignItems: 'center', justifyContent: 'left', padding: 20, marginBottom: 1.3, marginBottom: 1, flexDirection: 'row', height: 60, width: '100%', backgroundColor: '#fff'}}>
                    <Text style={{fontFamily: 'serif', fontWeight: 500, fontSize: 15}}>Personal Data</Text>
                    <Image style={styles.icons} source={require('../../assets/right-arrow.png')} />
                </TouchableOpacity>


                <TouchableOpacity onPress={e => navigation.navigate('seller-preference')} style={{display: 'flex', alignItems: 'center', justifyContent: 'left', padding: 20, marginTop: 3, marginBottom: 1, flexDirection: 'row', height: 70, width: '100%', backgroundColor: '#fff'}}>
                    <Text style={{fontFamily: 'serif', fontWeight: 'bold', color: 'orangered', textAlign: 'center', fontSize: 15}}>Log Out</Text>
                    
                </TouchableOpacity>
                <TouchableOpacity onPress={e => navigation.navigate('seller-preference')} style={{display: 'flex', alignItems: 'center', justifyContent: 'left', padding: 20, marginBottom: 1, flexDirection: 'row', height: 70, width: '100%', backgroundColor: '#fff'}}>
                    <Text style={{fontFamily: 'serif', color: 'red', fontWeight: 'bold', textAlign: 'center', fontSize: 15}}>Delete Account</Text>
                    
                </TouchableOpacity>

            </View>
        </>
     );
}
 
export default Account;

const styles = StyleSheet.create({
    icons: {
        height: 20,
        width: 20,
        position: 'absolute',
        right: 10,
        top: 20
      },

    
   
  });