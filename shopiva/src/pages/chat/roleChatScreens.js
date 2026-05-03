/**
 * Customer vs vendor chat stacks mount different route names + props so modes stay isolated.
 */
import React from 'react';
import ChatListScreen from '../ChatList';
import ChatRoomScreen from '../ChatRoom';

/** @param {object} props */
export function CustomerChatListScreen(props) {
  return (
    <ChatListScreen
      {...props}
      chatRoleVariant="customer"
      chatRoomRouteName="chat-room"
      chatListTitle="Chats"
    />
  );
}

/** @param {object} props */
export function CustomerChatRoomScreen(props) {
  return <ChatRoomScreen {...props} chatRoleVariant="customer" />;
}

/** @param {object} props */
export function VendorChatListScreen(props) {
  return (
    <ChatListScreen
      {...props}
      chatRoleVariant="vendor"
      chatRoomRouteName="vendor-chat-room"
      chatListTitle="Inbox"
    />
  );
}

/** @param {object} props */
export function VendorChatRoomScreen(props) {
  return <ChatRoomScreen {...props} chatRoleVariant="vendor" />;
}
