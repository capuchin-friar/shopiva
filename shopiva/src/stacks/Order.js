import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import OrdersListScreen from '../pages/OrdersList';
import OrderDetailScreen from '../pages/OrderDetail';
import { StyleSheet, Image, Platform, View } from 'react-native';
import { HomeStackCartIconButton } from '../components/HomeStackCartButton';
const SHOPIVA_LOGO = require('../assets/Shopiva.png');

const OrderStack = createNativeStackNavigator();

export function OrderStackScreen() {
  return (
    <OrderStack.Navigator>
      <OrderStack.Screen
        name="order-list"
        component={OrdersListScreen}
        options={{
          title: 'Orders',
          headerShown: false,
          headerBackVisible: false,
          headerShadowVisible: false,
          headerStyle: styles.homeHeaderBar,
        }}
      />
      <OrderStack.Screen
        name="order-detail"
        component={OrderDetailScreen}
        options={{
          title: 'Order details',
          headerBackTitle: 'Orders',
          /** `headerRight` (ellipsis + cart + action sheet) is set from `OrderDetailScreen`. */
        }}
      />
    </OrderStack.Navigator>
  );
}



const styles = StyleSheet.create({
  placeholderRoot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  placeholderText: {
    fontSize: 18,
    color: '#333',
  },
  searchBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchBarText: {
    color: '#999',
    fontSize: 14,
  },
  offersStrip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fff6f2',
  },
  offersText: {
    color: '#00926e',
    fontWeight: '600',
  },
  headerContainer: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 5,
    ...Platform.select({
      ios: { paddingTop: 10 },
    }),
  },
  logoContainer: { flex: 1 },
  logo: { width: 50, height: 40 },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00926e',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    gap: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#00926e',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: { elevation: 3 },
    }),
  },
  loginText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  hiddenHeader: {
    height: 0,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  backHeader: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingLeft: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  backButton: {
    height: 44,
    width: 44,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backHeaderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  /** Flat header bar: no shadow / elevation (matches full-bleed home hero). */
  homeHeaderBar: {
    backgroundColor: '#FFFFFF',
    elevation: 0,
    shadowOpacity: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 0,
    borderBottomWidth: 0,
  },

  homeHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 4,
  },
  vendorsHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 4,
  },
  vendorsHeaderCart: {
    marginRight: 10,
    paddingVertical: 6,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },

  vendorsHomeHeaderCart: {
    marginRight: 0,
    paddingVertical: 4,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },

  vendorsHeaderFilter: {
    marginRight: 4,
    paddingVertical: 6,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },

  homeHeaderLogoCnt: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeHeaderLogo: {
    width: "100%",
    height: "100%",
    // marginLeft: 4,
  },
});
