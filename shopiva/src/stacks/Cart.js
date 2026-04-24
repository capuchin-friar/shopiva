import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import CartScreen from '../pages/Cart';

const CartStack = createNativeStackNavigator();

function CartCheckout() {
  return (
    <View style={styles.placeholderRoot}>
      <Text style={styles.placeholderText}>Checkout</Text>
    </View>
  );
}

function CartCheckoutHeader({ navigation }) {
  return (
    <View style={styles.backHeader}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Icon name="chevron-back" size={25} color="#000000" />
      </TouchableOpacity>
      <Text style={styles.backHeaderTitle}>Checkout</Text>
    </View>
  );
}

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
        component={CartCheckout}
        options={{
          header: CartCheckoutHeader,
        }}
      />
    </CartStack.Navigator>
  );
}

const styles = StyleSheet.create({
  placeholderRoot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  placeholderText: { fontSize: 18, color: '#333' },
  backHeader: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingLeft: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  backButton: {
    height: 44,
    width: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backHeaderTitle: { fontSize: 16, fontWeight: 'bold', color: '#000' },
});
