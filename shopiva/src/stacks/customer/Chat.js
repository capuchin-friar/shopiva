import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { CustomerChatListScreen, CustomerChatRoomScreen } from '../../pages/chat/roleChatScreens';
import { navigationRef } from '../../navigation';
import { Alert } from 'react-native';

const HEADER = '#075E54';

const ChatStack = createNativeStackNavigator();

const CHAT_LIST_OPTIONS = {
  title: 'Inbox',
  headerShadowVisible: false,
  headerStyle: { backgroundColor: '#FFFFFF' },
  headerTitleStyle: { fontWeight: '700', color: '#111111' },
  contentStyle: { backgroundColor: '#FFFFFF' },
};

const CHAT_ROOM_OPTIONS = {
  // title: 'Inbox',
  headerBackTitle: 'Inbox',
  headerShadowVisible: false,
  headerStyle: { backgroundColor: HEADER },
  headerTintColor: '#FFFFFF',
  headerTitleStyle: { color: '#FFFFFF', fontWeight: '600' },
  contentStyle: { backgroundColor: '#ECE5DD' },
};

/** Customer-mode chat only (`vendor` stack uses `VendorChat.js`). */
export function ChatStackScreen() {
 
  return (
    <ChatStack.Navigator>
      <ChatStack.Screen name="Chat" component={CustomerChatListScreen} options={CHAT_LIST_OPTIONS} />
      <ChatStack.Screen name="Chat-room" component={CustomerChatRoomScreen} options={CHAT_ROOM_OPTIONS} />
    </ChatStack.Navigator>
  );
}
