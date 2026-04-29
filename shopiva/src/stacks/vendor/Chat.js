import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import VendorChatRoomScreen from '../../pages/ChatRoom';
import VendorChatListScreen from '../../pages/ChatList';

const HEADER = '#075E54';

const VendorChatStack = createNativeStackNavigator();

const LIST_OPTIONS = {
//   title: 'Inbox',
//   headerShadowVisible: false,
//   headerStyle: { backgroundColor: '#FFFFFF' },
//   headerTitleStyle: { fontWeight: '700', color: '#111111' },
//   contentStyle: { backgroundColor: '#FFFFFF' },
};

const ROOM_OPTIONS = {
//   title: 'Chat',
//   headerBackTitle: 'Inbox',
//   headerShadowVisible: false,
//   headerStyle: { backgroundColor: HEADER },
//   headerTintColor: '#FFFFFF',
//   headerTitleStyle: { color: '#FFFFFF', fontWeight: '600' },
//   contentStyle: { backgroundColor: '#ECE5DD' },
};

/** Vendor-mode chat: distinct routes from customer `Chat.js`. */
export function VendorChatStackScreen() {
  return (
    <VendorChatStack.Navigator>
      <VendorChatStack.Screen name="vendor-chat-list" component={VendorChatListScreen} options={LIST_OPTIONS} />
      <VendorChatStack.Screen name="vendor-chat-room" component={VendorChatRoomScreen} options={ROOM_OPTIONS} />
    </VendorChatStack.Navigator>
  );
}
