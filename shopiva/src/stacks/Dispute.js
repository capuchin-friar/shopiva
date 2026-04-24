import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DisputesListScreen from '../pages/DisputesList';
import DisputeDetailScreen from '../pages/DisputeDetail';
import { HomeStackCartIconButton } from '../components/HomeStackCartButton';

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
  disputesListBackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Platform.OS === 'ios' ? 4 : 0,
  },
  disputesListBackLabel: {
    marginLeft: 2,
    fontSize: 17,
    fontWeight: '400',
    color: '#111111',
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

function DisputesListHeaderLeft({ navigation }) {
  return (
    <TouchableOpacity
      style={styles.disputesListBackRow}
      onPress={() => {
        const parent = navigation.getParent();
        if (parent?.canGoBack()) parent.goBack();
      }}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel="Back to activities"
    >
      <Icon name="chevron-back" size={24} color="#111111" />
      <Text style={styles.disputesListBackLabel}>Activities</Text>
    </TouchableOpacity>
  );
}

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
        options={({ navigation }) => ({
          title: 'Disputes',
          headerShown: true,
          headerShadowVisible: false,
          headerStyle: styles.homeHeaderBar,
          headerLeft: () => <DisputesListHeaderLeft navigation={navigation} />,
          headerRight: () => <DisputeListHeaderRight />,
        })}
      />
      <DisputeStack.Screen
        name="dispute-detail"
        component={DisputeDetailScreen}
        options={DISPUTE_DETAIL_OPTIONS}
      />
    </DisputeStack.Navigator>
  );
}
