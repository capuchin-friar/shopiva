import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';
import VendorActivitiesScreen from '../../pages/vendor/Activities';
import VendorOrderScreen from '../../pages/vendor/OrdersList';
import VendorDisputeScreen from '../../pages/vendor/DisputesList';

const VendorActivitiesStack = createNativeStackNavigator();

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
export function VendorActivitiesStackScreen() {
  return (
    <VendorActivitiesStack.Navigator screenOptions={{ headerShown: false }}>
      <VendorActivitiesStack.Screen
        name="Activities"
        component={VendorActivitiesScreen}
        options={hubOptions}
      />
      <VendorActivitiesStack.Screen name="Orders" options={{
        headerShown: true,
        title: 'Orders',
        headerBackVisible: true,
        headerShadowVisible: false,
      }}  component={VendorOrderScreen} />
      <VendorActivitiesStack.Screen name="Disputes" options={{
        headerShown: true,
        title: 'Disputes',
        headerBackVisible: true,
        headerShadowVisible: false,
      }}  component={VendorDisputeScreen} /> 
    </VendorActivitiesStack.Navigator>
  );
}
