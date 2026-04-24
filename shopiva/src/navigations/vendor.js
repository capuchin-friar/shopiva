import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { ProfileProvider } from '../context/ProfileContext';
import {
  VendorHomeStackScreen,
  VendorChatStackScreen,
  VendorOrdersStackScreen,
  VendorProductsStackScreen,
  VendorTransactionsStackScreen,
  VendorProfileStackScreen,
} from '../stacks/vendor';

const Tab = createBottomTabNavigator();

export default function VendorTabs() {
  const { nested_nav } = useSelector((s) => s?.nested_nav);
  const [tabBarStyle, setTabBarStyle] = React.useState('flex');

  React.useEffect(() => {
    if (nested_nav?.boolean) {
      setTabBarStyle('flex');
    } else {
      setTabBarStyle('none');
    }
  }, [nested_nav]);

  return (
    <ProfileProvider>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, size, color }) => {
            let iconName = 'ellipse-outline';
            if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
            else if (route.name === 'Activities') iconName = focused ? 'pulse' : 'pulse-outline';
            else if (route.name === 'Chat') iconName = focused ? 'chatbubble' : 'chatbubble-outline';
            else if (route.name === 'Dispute') iconName = focused ? 'alert-circle' : 'alert-circle-outline';
            else if (route.name === 'Profile') iconName = focused ? 'person-circle' : 'person-circle-outline';
            else if (route.name === 'Products') iconName = focused ? 'pricetags' : 'pricetags-outline';
            else if (route.name === 'Transactions') iconName = focused ? 'wallet' : 'wallet-outline';
            else if (route.name === 'Inventory') iconName = focused ? 'cube' : 'cube-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#00926E',
          tabBarInactiveTintColor: '#000000',
          headerShown: false,
          tabBarStyle: {
            display: tabBarStyle,
          },
        })}
      >
        <Tab.Screen name="Home" component={VendorHomeStackScreen} />
        <Tab.Screen name="Chat" component={VendorChatStackScreen} />
        <Tab.Screen name="Activities" component={VendorOrdersStackScreen} />
        <Tab.Screen name="Products" component={VendorProductsStackScreen} />
        <Tab.Screen name="Transactions" component={VendorTransactionsStackScreen} />
        <Tab.Screen name="Profile" component={VendorProfileStackScreen} />
      </Tab.Navigator>
    </ProfileProvider>
  );
}
