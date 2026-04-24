import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TransactionsScreen from '../../pages/TransactionsScreen';

const VendorTransactionsStack = createNativeStackNavigator();

/**
 * Vendor Transactions tab — native stack (matches pattern of one stack per tab).
 */
export function VendorTransactionsStackScreen() {
  return (
    <VendorTransactionsStack.Navigator screenOptions={{ headerShown: true }}>
      <VendorTransactionsStack.Screen name="VendorTransactions" 
      options={({ navigation }) => ({
        title: 'Transactions',
        // headerBackTitle: "Catalog"
      })}
      component={TransactionsScreen} />
    </VendorTransactionsStack.Navigator>
  );
}
