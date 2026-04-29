import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';
import VendorOrdersHubScreen from '../../pages/vendor/VendorOrdersHubScreen';
import { OrderStackScreen } from '../Order';
import { DisputeStackScreen } from '../Dispute';

const VendorOrdersStack = createNativeStackNavigator();

function VendorOrderShell() {
  return (
    <View style={shellStyles.root}>
      <View style={shellStyles.stackWrap}>
        <OrderStackScreen />
      </View>
    </View>
  );
}

function VendorDisputeShell() {
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
 * Activities tab: hub + nested orders and disputes stacks (vendor).
 * Outer flow screens keep headers off so we do not nest two native-stack headers.
 */
export function VendorOrdersStackScreen() {
  return (
    <VendorOrdersStack.Navigator screenOptions={{ headerShown: false }}>
      <VendorOrdersStack.Screen
        name="VendorOrdersHub"
        component={VendorOrdersHubScreen}
        options={hubOptions}
      />
      <VendorOrdersStack.Screen name="VendorOrderFlow" component={VendorOrderShell} />
      <VendorOrdersStack.Screen name="VendorDisputeFlow" component={VendorDisputeShell} />
    </VendorOrdersStack.Navigator>
  );
}
