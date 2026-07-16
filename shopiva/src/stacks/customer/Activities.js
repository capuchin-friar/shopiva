import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Alert, StyleSheet, View } from 'react-native';
import Activities from '../../pages/Activities';
import OrderListScreen from '../../pages/OrdersList';
import OpenDispute from '../../pages/OpenDispute';
import DisputesListScreen from '../../pages/DisputesList';
import OrderDetailScreen from '../../pages/OrderDetail';
import OrderActionScreen from '../../pages/OrderAction';
import DisputeDetailScreen from '../../pages/DisputeDetail';
import ReturnListScreen from '../../pages/ReturnList';
import ReturnDetailScreen from '../../pages/ReturnDetail';
import ReturnActionScreen from '../../pages/ReturnAction';
import ReviewSubmissionScreen from '../../pages/Review'
import { CustomerChatRoomScreen } from '../../pages/chat/roleChatScreens';
import { navigationRef } from '../../navigation';
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
};
const orderStatusUpdateOpt = {
  headerShown: true,
  title: 'Order-action',
  headerBackVisible: true,
  headerShadowVisible: false,
};
const orderDetailOpt = {
  headerShown: true,
  title: 'Order detail',
  headerBackVisible: true,
  headerShadowVisible: false,
}
const returnOpt = {
  headerShown: true,
  title: 'Returns',
  headerBackVisible: true,
  headerShadowVisible: false,
}
const returnDetailOpt = {
  headerShown: true,
  title: 'Return detail',
  headerBackVisible: true,
  headerShadowVisible: false,
}
const returnStatusUpdateOpt = {
  headerShown: true,
  title: 'Return-action',
  headerBackVisible: true,
  headerShadowVisible: false,
};
const reviewOpt = {
  headerShown: true,
  title: 'Review Screen',
  headerBackVisible: false,
  headerShadowVisible: false,
}
const HEADER = '#075E54';
const CHAT_ROOM_OPTIONS = {
  // title: 'Inbox',
  headerBackTitle: 'Order',
  headerShadowVisible: false,
  headerStyle: { backgroundColor: HEADER },
  headerTintColor: '#FFFFFF',
  headerTitleStyle: { color: '#FFFFFF', fontWeight: '600' },
  contentStyle: { backgroundColor: '#ECE5DD' },
};
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
      <ActivitiesStack.Screen name="Order-detail" component={OrderDetailScreen} options={orderDetailOpt}  />
      <ActivitiesStack.Screen name="Order-list" component={OrderDetailScreen} options={orderOpt} />
      <ActivitiesStack.Screen name="Order-action" component={OrderActionScreen} options={orderStatusUpdateOpt} />
      
      <ActivitiesStack.Screen
        name="Open-dispute"
        component={OpenDispute}
        options={{ ...disputeOpt, title: 'Open dispute' }}
      />
      <ActivitiesStack.Screen name="Review" options={reviewOpt} component={ReviewSubmissionScreen} />
      
      <ActivitiesStack.Screen name="Disputes" component={DisputesListScreen} options={disputeOpt} />
      <ActivitiesStack.Screen name="Dispute-detail" component={DisputeDetailScreen} options={{ headerShown: true, title: 'Dispute detail', headerBackVisible: true, headerShadowVisible: false}}  />
      
      <ActivitiesStack.Screen name="Returns" component={ReturnListScreen} options={returnOpt} />
      <ActivitiesStack.Screen name="Return-detail" component={ReturnDetailScreen} options={returnDetailOpt} />
      <ActivitiesStack.Screen name="Return-action" component={ReturnActionScreen} options={returnStatusUpdateOpt} />

      <ActivitiesStack.Screen name="Inbox" component={CustomerChatRoomScreen} options={CHAT_ROOM_OPTIONS} />

    </ActivitiesStack.Navigator>
  );
}
