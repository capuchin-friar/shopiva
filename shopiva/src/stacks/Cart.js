import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import CartScreen from '../pages/Cart';
import CartCheckoutScreen from '../pages/CartCheckoutScreen';

const CartStack = createNativeStackNavigator();

export function CartStackScreen() {
  return (
    <CartStack.Navigator>
      <CartStack.Screen
        name="cart-main"
        component={CartScreen}
        options={{ headerShown: false }}
      />
      
      <CartStack.Screen
        name="cart-checkout"
        component={CartCheckoutScreen}
        options={{
          title: 'Checkout',
          headerShown: true,
          headerTitleStyle: { fontWeight: '700' },
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#FFFFFF' },
        }}
      />
    </CartStack.Navigator>
  );
}
