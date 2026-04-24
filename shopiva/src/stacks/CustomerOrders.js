import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';
import CustomerOrdersHubScreen from '../pages/CustomerOrdersHubScreen';
import { OrderStackScreen } from './Order';
import { DisputeStackScreen } from './Dispute';

const CustomerOrdersStack = createNativeStackNavigator();

function CustomerOrderShell() {
  return (
    <View style={shellStyles.root}>
      <View style={shellStyles.stackWrap}>
        <OrderStackScreen />
      </View>
    </View>
  );
}

function CustomerDisputeShell() {
  return (
    <View style={shellStyles.root}>
      <View style={shellStyles.stackWrap}>
        <DisputeStackScreen />
      </View>
    </View>
  );
}

const shellStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F4F5F7',
  },
  stackWrap: {
    flex: 1,
  },
});

const hubOptions = {
  headerShown: true,
  title: 'Activities',
  headerBackVisible: false,
  headerShadowVisible: false,
};

/**
 * Orders tab: hub + nested orders and disputes stacks (customer).
 * Outer flow screens keep headers off so we do not nest two native-stack headers
 * (avoids duplicate bars and confusing back behavior with Order/Dispute stacks).
 */
export function CustomerOrdersStackScreen() {
  return (
    <CustomerOrdersStack.Navigator screenOptions={{ headerShown: false }}>
      <CustomerOrdersStack.Screen
        name="CustomerOrdersHub"
        component={CustomerOrdersHubScreen}
        options={hubOptions}
      />
      <CustomerOrdersStack.Screen name="CustomerOrderFlow" component={CustomerOrderShell} />
      <CustomerOrdersStack.Screen name="CustomerDisputeFlow" component={CustomerDisputeShell} />
    </CustomerOrdersStack.Navigator>
  );
}
