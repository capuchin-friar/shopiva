import { useEffect, useState } from "react";
import { Dimensions, Image, Modal, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, TouchableOpacityBase, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
// import { setProfessionTo } from "../Redux/reducers/studio/Profession";


const Preference = ({navigation}) => {
    const [isEnabled, setIsEnabled] = useState(false);
    const [isStatusEnabled, setIsStatusEnabled] = useState(false);
    // let {selected_profession} = useSelector(s => s.selected_profession);
    let dispatch = useDispatch();
    const toggleSwitch1 = () => isEnabled ? setIsEnabled(false) : setIsEnabled(true);
    const toggleSwitch2 = () => isStatusEnabled ? setIsStatusEnabled(false) : setIsStatusEnabled(true);

   

    
    return ( 
        <>

            <View style={{height: '100%'}}>

                

                {
                    ['Language'].map((item,index) => 
                        <View key={index} style={{height: 60, marginBottom: .5, width: '100%', backgroundColor: '#fff', paddingLeft: 10, paddingRight: 10, display: 'flex', alignItems: 'center', flexDirection: 'row'}}>
                            <Text style={{fontSize: 15, fontWeight: '400', fontFamily: 'serif', color: '#000', position: 'absolute', left: 10}}>
                                {item}
                            </Text>
                            
                            
                        </View>    
                    )
                }

                    

                    <View style={{height: 90, width: '100%', marginBottom: 2.5, backgroundColor: '#fff', paddingLeft: 10, paddingRight: 10, display: 'flex', alignItems: 'center', flexDirection: 'row'}}>
                        <Text style={{fontSize: 16, position: 'absolute', fontWeight: 'bold', bottom: 50, fontFamily: 'serif', color: '#000', position: 'absolute', left: 10}}>
                            Online Status
                        </Text>

                        <Text style={{fontSize: 12, position: 'absolute', bottom: 15, fontFamily: 'serif', color: '#000', position: 'absolute', left: 10}}>
                            You will remain online aslong as the app is open
                        </Text>
                        
                        <View style={{fontSize: 15, fontWeight: 'bold', fontFamily: 'serif', color: '#000',  position: 'absolute', right: 10}}>


                            <Switch
                                trackColor={{false: '#efefef', true: '#ffd27f'}}
                                thumbColor={isStatusEnabled ? '#orangered' : 'orangered'}
                                ios_backgroundColor="#3e3e3e"
                                onValueChange={toggleSwitch2}
                                value={isStatusEnabled}
                            />


                        </View>
                    </View>
            
            </View>
        </>
     );
}
 
export default Preference;