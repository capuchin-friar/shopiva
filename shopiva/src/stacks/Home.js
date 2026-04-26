import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
// import { useSelector } from 'react-redux';
import React from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import HomeScreen from "../pages/Home";
import VendorsScreen from "../pages/Vendors";
import VendorScreen from '../pages/Vendor';
import ProductScreen from '../pages/Product';
import CartScreen from '../pages/Cart';
import CartCheckoutScreen from '../pages/CartCheckoutScreen';
import { HomeStackCartIconButton } from '../components/HomeStackCartButton';

/** Bundled logo for native stack header (do not use `{ uri: '../assets/...' }` for local files). */
const SHOPIVA_LOGO = require('../assets/Shopiva.png');
// import { set_connect_modal } from '../../redux/modal/connect';
// import { setUserAuthTo } from '../../redux/...';

const HomeStack = createNativeStackNavigator();



function SearchPlaceholder() {
  return (
    <View style={styles.placeholderRoot}>
      <Text style={styles.placeholderText}>Search</Text>
    </View>
  );
}

function SearchBar() {
  return (
    <View style={styles.searchBar}>
      <Text style={styles.searchBarText}>Search bar</Text>
    </View>
  );
}

function Offers() {
  return (
    <View style={styles.offersStrip}>
      <Text style={styles.offersText}>Offers</Text>
    </View>
  );
}

export function HomeStackScreen() {
  // const { user } = useSelector(s => s?.user ?? {});
  // const dispatch = useDispatch();

  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="home"
        component={HomeScreen}
        options={{
          title: 'Home',
          headerBackVisible: false,
          headerShadowVisible: false,
          headerStyle: styles.homeHeaderBar,
          headerRight: () => (
            <View>
              <HomeStackCartIconButton
                size={24}
                color="#000000"
                style={styles.vendorsHomeHeaderCart}
              />
            </View>
          ),
          headerLeft: () => (

            <View style={styles.homeHeaderLogoCnt}>
              <Image
                source={SHOPIVA_LOGO}
                style={styles.homeHeaderLogo}
                resizeMode="contain"
                accessibilityIgnoresInvertColors
              />
            </View>

          ),
        }}
      />

      <HomeStack.Screen
        name="vendors"
        component={VendorsScreen}
        options={({ navigation }) => ({
          title: 'Vendors',
          headerBackTitle: 'Home',
          headerRight: () => (
            <View style={styles.vendorsHeaderRight}>
              <HomeStackCartIconButton size={24} color="#000000" style={styles.vendorsHeaderCart} />
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Select location"
                onPress={() =>
                  navigation.setParams({ openVendorFilter: Date.now() })
                }
                style={styles.vendorsHeaderFilter}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="options-outline" size={22} color="#000000" />
              </TouchableOpacity>
            </View>
          ),
        })}
      />

      <HomeStack.Screen
        name="vendor"
        component={VendorScreen}
        options={{
          header: () => (
            <View style={styles.hiddenHeader} />
          ),
        }}
      />

      <HomeStack.Screen
        name="product"
        component={ProductScreen}
        options={{
          headerShown: false,
        }}
      />


{/* <View style={styles.header}>
        <View style={styles.headerSide}>
          {showBack ? (
            <Pressable
              onPress={onHeaderBack}
              style={styles.headerIconBtn}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Icon name="arrow-back-outline" size={24} color="#000000" />
            </Pressable>
          ) : (
            <View style={styles.headerIconBtn} />
          )}
        </View>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>My Cart</Text>
        </View>
        <View style={[styles.headerSide, styles.headerSideRight]}>
          <Pressable style={styles.headerIconBtn} accessibilityRole="button" accessibilityLabel="Notifications">
            <Icon name="notifications-outline" size={24} color="#000000" />
          </Pressable>
        </View>
      </View> */}

      <HomeStack.Screen
        name="cart"
        component={CartScreen}
        options={{
          title: 'Cart',
          headerShown: true,
          headerTitleStyle: { fontWeight: '700' },
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#FFFFFF' },
        }}
      />
      <HomeStack.Screen
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
    </HomeStack.Navigator>
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
    borderRadius: 10,
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
    borderRadius: 10,
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
    display: "flex"
    // marginLeft: 4,
  },
  homeHeaderLogo: {
    width: "100%",
    height: "100%",
    // marginLeft: 4,
  },
});
