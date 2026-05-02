import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';
import VendorActivitiesScreen from '../../pages/Activities';
import VendorOrderScreen from '../../pages/OrdersList';
import VendorOrderDetailScreen from '../../pages/OrderDetail';
import VendorDisputeScreen from '../../pages/DisputesList';
import DisputeDetailScreen from '../../pages/DisputeDetail';

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

const activitiesOptions = {
  headerShown: true,
  title: 'Activities',
  headerBackVisible: false,
  headerShadowVisible: false,
};
const orderOpt = {
  headerShown: true,
  title: 'Orders',
  headerBackVisible: true,
  headerShadowVisible: false,
}
const orderDetailOpt = {
  headerShown: true,
  title: 'Order detail',
  headerBackVisible: true,
  headerShadowVisible: false,
}

/**
 * Activities tab: hub + nested orders and disputes stacks (vendor).
 * Outer flow screens keep headers off so we do not nest two native-stack headers.
 */
export function VendorActivitiesStackScreen() {
  return (
    <VendorActivitiesStack.Navigator>
      <VendorActivitiesStack.Screen name="Activities" component={VendorActivitiesScreen} options={activitiesOptions} />
      <VendorActivitiesStack.Screen name="Orders" options={orderOpt} component={VendorOrderScreen} />
      <VendorActivitiesStack.Screen name="Order-detail"  options={orderDetailOpt} component={VendorOrderDetailScreen} />

      <VendorActivitiesStack.Screen name="Disputes" options={{
        headerShown: true,
        title: 'Disputes',
        headerBackVisible: true,
        headerShadowVisible: false,
      }}  component={VendorDisputeScreen} /> 
      <VendorActivitiesStack.Screen name="Dispute-detail" options={{
        headerShown: true,
        title: 'Dispute detail',
        headerBackVisible: true,
        headerShadowVisible: false,
      }}  component={DisputeDetailScreen} /> 
    </VendorActivitiesStack.Navigator>
  );
}
