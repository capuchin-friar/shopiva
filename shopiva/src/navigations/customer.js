import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { HomeStackScreen } from '../stacks/Home';
import { ProfileStackScreen } from '../stacks/Profile';
import { ChatStackScreen } from '../stacks/Chat';
import { CustomerOrdersStackScreen } from '../stacks/CustomerOrders';
import { ProfileProvider } from '../context/ProfileContext';
import TransactionsScreen from '../pages/TransactionsScreen';

const Tab = createBottomTabNavigator();

export default function CustomerTab() {
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

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Activities') {
              iconName = focused ? 'pulse' : 'pulse-outline';
            } else if (route.name === 'Chat') {
              iconName = focused ? 'chatbubble' : 'chatbubble-outline';
            } else if (route.name === 'Transactions') {
              iconName = focused ? 'wallet' : 'wallet-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person-circle' : 'person-circle-outline';
            }
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
        <Tab.Screen name="Home" component={HomeStackScreen} />
        <Tab.Screen name="Activities" component={CustomerOrdersStackScreen} />
        <Tab.Screen name="Chat" component={ChatStackScreen} />
        <Tab.Screen name="Transactions" component={TransactionsScreen} />
        <Tab.Screen name="Profile" component={ProfileStackScreen} />
      </Tab.Navigator>
    </ProfileProvider>
  );
}
