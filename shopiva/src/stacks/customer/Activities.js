import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';
import Activities from '../../pages/Activities';
import OrderListScreen from '../../pages/OrdersList';
import DisputesListScreen from '../../pages/DisputesList';
import OrderDetailScreen from '../../pages/OrderDetail';
import DisputeDetailScreen from '../../pages/DisputeDetail';

const ActivitiesStack = createNativeStackNavigator();
const activityOptions = {
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
const disputeOpt = {
  headerShown: true,
  title: 'Disputes',
  headerBackVisible: true,
  headerShadowVisible: false,
}

/**
 * Orders tab: hub + nested orders and disputes stacks (customer).
 * Outer flow screens keep headers off so we do not nest two native-stack headers
 * (avoids duplicate bars and confusing back behavior with Order/Dispute stacks).
 */
export function ActivitiesStackScreen() {
  return (
    <ActivitiesStack.Navigator screenOptions={{ headerShown: false }}>
      <ActivitiesStack.Screen name="Activities" component={Activities} options={activityOptions} />
      <ActivitiesStack.Screen name="Orders" component={OrderListScreen} options={orderOpt} />
      <ActivitiesStack.Screen name="Order-list" component={OrderDetailScreen} options={orderOpt} />
      <ActivitiesStack.Screen name="Disputes" component={DisputesListScreen} options={disputeOpt} />
      <ActivitiesStack.Screen name="Dispute-list" component={DisputeDetailScreen} options={orderOpt} />
    </ActivitiesStack.Navigator>
  );
}
