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
      chatRoomRouteName="chat-list"
      chatListTitle="Inbox"
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
      chatRoomRouteName="chat-list"
      chatListTitle="Inbox"
    />
  );
}

/** @param {object} props */
export function VendorChatRoomScreen(props) {
  return <ChatRoomScreen {...props} chatRoleVariant="vendor" />;
}
