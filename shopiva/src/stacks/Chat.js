import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import ChatListScreen from '../pages/ChatList';
import ChatRoomScreen from '../pages/ChatRoom';

const HEADER = '#075E54';

const ChatStack = createNativeStackNavigator();

const CHAT_LIST_OPTIONS = {
  title: 'Chats',
  headerShadowVisible: false,
  headerStyle: { backgroundColor: '#FFFFFF' },
  headerTitleStyle: { fontWeight: '700', color: '#111111' },
  contentStyle: { backgroundColor: '#FFFFFF' },
};

const CHAT_ROOM_OPTIONS = {
  title: 'Chat',
  headerBackTitle: 'Chats',
  headerShadowVisible: false,
  headerStyle: { backgroundColor: HEADER },
  headerTintColor: '#FFFFFF',
  headerTitleStyle: { color: '#FFFFFF', fontWeight: '600' },
  contentStyle: { backgroundColor: '#ECE5DD' },
};

export function ChatStackScreen() {
  return (
    <ChatStack.Navigator>
      <ChatStack.Screen
        name="chat-list"
        component={ChatListScreen}
        options={CHAT_LIST_OPTIONS}
      />
      <ChatStack.Screen
        name="chat-room"
        component={ChatRoomScreen}
        options={CHAT_ROOM_OPTIONS}
      />
    </ChatStack.Navigator>
  );
}
