import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import VendorOrdersHubScreen from '../../pages/vendor/VendorOrdersHubScreen';
import { OrderStackScreen } from '../Order';
import { DisputeStackScreen } from '../Dispute';

const VendorOrdersStack = createNativeStackNavigator();
const BRAND = '#00926E';
const BG = '#F4F5F7';
const CARD = '#FFFFFF';
const TEXT = '#111111';
const MUTED = '#6B7280';
const UP = '#16A34A';
function VendorOrderShell({ navigation }) {
  return (
    <View style={shellStyles.root}>
      <View style={shellStyles.stackWrap}>
        <OrderStackScreen />
      </View>
    </View>
  );
}

function VendorDisputeShell({ navigation }) {
  return (
    <View style={shellStyles.root}>
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
 * Order tab: hub + nested orders and disputes stacks (vendor-only).
 */
export function VendorOrdersStackScreen() {
  return (
    <VendorOrdersStack.Navigator screenOptions={{ headerShown: true }}>
      <VendorOrdersStack.Screen name="VendorOrdersHub" 
      options={({ navigation }) => ({
        title: "Activities",
        headerBackVisible: false,
        headerShadowVisible: false,
        
      })}
      component={VendorOrdersHubScreen} />
      <VendorOrdersStack.Screen name="VendorOrderFlow" 
      options={({ navigation }) => ({
        title: '',
        headerBackTitle: 'Activities',
        // headerRight: () => (
        //   <>
        //   </>
        // ),
      })}
      component={VendorOrderShell} />

      <VendorOrdersStack.Screen name="VendorDisputeFlow" 
      options={({ navigation }) => ({
        title: '',
        headerBackTitle: 'Activities',
        // headerRight: () => (
        //   <>

        //   </>
        // ),
      })}
      component={VendorDisputeShell} />
    </VendorOrdersStack.Navigator>
  );
}



const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: CARD,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoMark: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: BRAND,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    marginLeft: 10,
    fontSize: 20,
    fontWeight: '800',
    color: TEXT,
    letterSpacing: -0.3,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    padding: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
})