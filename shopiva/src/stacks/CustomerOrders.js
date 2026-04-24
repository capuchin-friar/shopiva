import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomerOrdersHubScreen from '../pages/CustomerOrdersHubScreen';
import { OrderStackScreen } from './Order';
import { DisputeStackScreen } from './Dispute';

const CustomerOrdersStack = createNativeStackNavigator();

function CustomerOrderShell({ navigation }) {
  return (
    <View style={shellStyles.root}>
      <SafeAreaView edges={['top']} style={shellStyles.bar}>
        <TouchableOpacity
          style={shellStyles.backRow}
          onPress={() => navigation.navigate('CustomerOrdersHub')}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Back to orders menu"
        >
          <Icon name="chevron-back" size={24} color="#111111" />
          <Text style={shellStyles.backLabel}>Orders menu</Text>
        </TouchableOpacity>
      </SafeAreaView>
      <View style={shellStyles.stackWrap}>
        <OrderStackScreen />
      </View>
    </View>
  );
}

function CustomerDisputeShell({ navigation }) {
  return (
    <View style={shellStyles.root}>
      <SafeAreaView edges={['top']} style={shellStyles.bar}>
        <TouchableOpacity
          style={shellStyles.backRow}
          onPress={() => navigation.navigate('CustomerOrdersHub')}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Back to orders menu"
        >
          <Icon name="chevron-back" size={24} color="#111111" />
          <Text style={shellStyles.backLabel}>Orders menu</Text>
        </TouchableOpacity>
      </SafeAreaView>
      <View style={shellStyles.stackWrap}>
        <DisputeStackScreen />
      </View>
    </View>
  );
}

const shellStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F4F5F7',
  },
  bar: {
    paddingBottom: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  backLabel: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: '600',
    color: '#111111',
  },
  stackWrap: {
    flex: 1,
  },
});

/**
 * Orders tab: hub + nested orders and disputes stacks (customer).
 */
export function CustomerOrdersStackScreen() {
  return (
    <CustomerOrdersStack.Navigator screenOptions={{ headerShown: false }}>
      <CustomerOrdersStack.Screen name="CustomerOrdersHub" component={CustomerOrdersHubScreen} />
      <CustomerOrdersStack.Screen name="CustomerOrderFlow" component={CustomerOrderShell} />
      <CustomerOrdersStack.Screen name="CustomerDisputeFlow" component={CustomerDisputeShell} />
    </CustomerOrdersStack.Navigator>
  );
}
