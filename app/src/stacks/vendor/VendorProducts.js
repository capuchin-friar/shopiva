import { createNativeStackNavigator } from '@react-navigation/native-stack';
import VendorProductsHubScreen from '../../pages/vendor/VendorProductsHubScreen';
import VendorProductListScreen from '../../pages/vendor/VendorProductListScreen';
import VendorInventoryScreen from '../../pages/vendor/VendorInventoryScreen';
import VendorCreateProductScreen from '../../pages/vendor/VendorCreateProductScreen';
import { StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const VendorProductsStack = createNativeStackNavigator();
const BRAND = '#00926E';
const BG = '#F4F5F7';
const CARD = '#FFFFFF';
const TEXT = '#111111';
const MUTED = '#6B7280';
const UP = '#16A34A';
/**
 * Products tab: hub + nested catalog, inventory, and create product (vendor-only).
 */
export function VendorProductsStackScreen() {
  return (
    <VendorProductsStack.Navigator screenOptions={{ headerShown: true }}>
      <VendorProductsStack.Screen name="VendorProductsHub" 
        options={({ navigation }) => ({
          title: 'Catalog',
          headerBackVisible: false,
        })}
      component={VendorProductsHubScreen} />
      <VendorProductsStack.Screen name="VendorProductList" 
         options={({ navigation }) => ({
          title: 'Products',
          headerBackTitle: "Catalog"
        })}
      component={VendorProductListScreen} />
      <VendorProductsStack.Screen name="VendorInventory" 
        options={({ navigation }) => ({
          title: 'Inventory',
          headerBackTitle: "Catalog"
        })}
      component={VendorInventoryScreen} />
      <VendorProductsStack.Screen name="VendorCreateProduct" 
        options={({ navigation }) => ({
          title: 'Add New Product',
          headerBackTitle: "Catalog"
        })}
      component={VendorCreateProductScreen} />
    </VendorProductsStack.Navigator>
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
    borderRadius: 10,
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