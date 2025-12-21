
import * as React from 'react';
import { 
    Dimensions,
    Image,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View 
} from 'react-native';

import { 
    createBottomTabNavigator 
} from "@react-navigation/bottom-tabs";
import {  
    useDispatch, 
    useSelector 
} from 'react-redux';
import StackNavigator from './Nav';
import Message from '../store/screens/Message';
import Order from '../store/screens/Order';
import Profile from '../store/screens/Profile';
import Create from '../store/screens/Create';
import { NavigationContainer, useNavigationState } from '@react-navigation/native';
import Home from '../store/screens/Home';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChatScreen from '../store/screens/Chat';
import { useRoute } from '@react-navigation/native';
import OrderRoom from '../store/screens/OrderRoom';
import Signup from '../Auth/Signup';
import Login from '../Auth/Login';
const Tab = createBottomTabNavigator();


const AuthStack = createNativeStackNavigator();
export default function AuthStackScreen() {
    return (
        <AuthStack.Navigator>
            <AuthStack.Screen  options={{
                header: ({navigation}) =>
                (
                    <View style={{ height: 55, display: 'none', flexDirection: 'row', justifyContent: 'space-between', width: '100%', backgroundColor: '#32CD32', alignItems: 'center', padding: '10px'}}>
                        
                        <TouchableOpacity style={{height: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: 'auto', padding: 8, alignItems: 'flex-end'}}>
                        <View style={{backgroundColor: '#fff', height: '100%', width: 40, borderRadius: 10}}></View>
                        <Text>&nbsp;</Text>
                        <Text>Akpulu.F</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={e => navigation.navigate('user-notification')}>
                        <View style={{height: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: 'auto', padding: 8, alignItems: 'flex-end'}}>
                            <View style={{backgroundColor: '#fff', height: '100%', width: 40, borderRadius: 10}}>

                            </View>
                        </View>
                        </TouchableOpacity>
                    </View>
                ),
            }}  name="user-signup" component={Signup} />

            <AuthStack.Screen  options={{
                header: ({navigation}) =>
                (
                    <View style={{ height: 55, display: 'none', flexDirection: 'row', justifyContent: 'space-between', width: '100%', backgroundColor: '#32CD32', alignItems: 'center', padding: '10px'}}>
                        
                        <TouchableOpacity style={{height: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: 'auto', padding: 8, alignItems: 'flex-end'}}>
                        <View style={{backgroundColor: '#fff', height: '100%', width: 40, borderRadius: 10}}></View>
                        <Text>&nbsp;</Text>
                        <Text>Akpulu.F</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={e => navigation.navigate('user-notification')}>
                        <View style={{height: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: 'auto', padding: 8, alignItems: 'flex-end'}}>
                            <View style={{backgroundColor: '#fff', height: '100%', width: 40, borderRadius: 10}}>

                            </View>
                        </View>
                        </TouchableOpacity>
                    </View>
                ),
            }}  name="user-login" component={Login} />
        {/* <AuthStack.Screen name="user-chat-room" component={ChatScreen} /> */}
        </AuthStack.Navigator>
    );
}

