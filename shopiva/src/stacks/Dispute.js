import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Image, View } from 'react-native';
import DisputesListScreen from '../pages/DisputesList';
import DisputeDetailScreen from '../pages/DisputeDetail';
import { HomeStackCartIconButton } from '../components/HomeStackCartButton';

const SHOPIVA_LOGO = require('../assets/Shopiva.png');

const styles = StyleSheet.create({
  homeHeaderBar: {
    backgroundColor: '#FFFFFF',
    elevation: 0,
    shadowOpacity: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 0,
    borderBottomWidth: 0,
  },
  vendorsHomeHeaderCart: {
    marginRight: 0,
    paddingVertical: 4,
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
    width: '100%',
    height: '100%',
  },
});

function DisputeListHeaderRight() {
  return (
    <View>
      <HomeStackCartIconButton
        size={24}
        color="#000000"
        style={styles.vendorsHomeHeaderCart}
      />
    </View>
  );
}

function DisputeListHeaderLeft() {
  return (
    <View style={styles.homeHeaderLogoCnt}>
      <Image
        source={SHOPIVA_LOGO}
        style={styles.homeHeaderLogo}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}

const DISPUTE_LIST_OPTIONS = {
  headerShown: false,
  headerBackVisible: false,
  headerShadowVisible: false,
  headerStyle: styles.homeHeaderBar,
  headerRight: () => <DisputeListHeaderRight />,
  headerLeft: () => <DisputeListHeaderLeft />,
};

const DISPUTE_DETAIL_OPTIONS = {
  title: 'Dispute details',
  headerBackTitle: 'Disputes',
  headerShadowVisible: false,
  headerStyle: { backgroundColor: '#FFFFFF' },
  contentStyle: { backgroundColor: '#F5F5F5' },
};

const DisputeStack = createNativeStackNavigator();

export function DisputeStackScreen() {
  return (
    <DisputeStack.Navigator>
      <DisputeStack.Screen
        name="dispute-list"
        component={DisputesListScreen}
        options={DISPUTE_LIST_OPTIONS}
      />
      <DisputeStack.Screen
        name="dispute-detail"
        component={DisputeDetailScreen}
        options={DISPUTE_DETAIL_OPTIONS}
      />
    </DisputeStack.Navigator>
  );
}
