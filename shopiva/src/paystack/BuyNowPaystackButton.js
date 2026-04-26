import { useCallback } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { usePaystack } from 'react-native-paystack-webview';

const styles = StyleSheet.create({
  buyNow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111111',
    paddingVertical: 16,
    borderRadius: 5,
    marginBottom: 28,
  },
  buyNowText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  buyNowIcon: {
    marginLeft: 10,
  },
});

/**
 * Buy now with Paystack — only import this module when {@link canUsePaystackCheckout} is true
 * so the tree is under PaystackProvider and WebView is linked.
 */
export default function BuyNowPaystackButton({
  navigation,
  loggedIn,
  signOut,
  userEmail,
  firstInventoryId,
  qty,
  unitPrice,
  title,
  productId,
}) {
  const { popup } = usePaystack();

  const onBuy = useCallback(() => {
    if (!loggedIn) {
      Alert.alert('Sign in required', 'Please sign in to complete payment.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign in', onPress: () => void signOut() },
      ]);
      return;
    }
    if (firstInventoryId == null) {
      Alert.alert('Unavailable', 'This product has no purchasable variant yet.');
      return;
    }
    const email = String(userEmail ?? '').trim();
    if (!email) {
      Alert.alert('Email required', 'Add an email to your account in Profile before paying with Paystack.');
      return;
    }
    const total = Math.max(1, Math.round(Number(unitPrice) * qty));
    const reference = `shopiva_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

    popup.checkout({
      email,
      // amount: total,
      amount: 100000,
      reference,
      metadata: {
        custom_fields: [
          { display_name: 'Product', variable_name: 'product_title', value: String(title).slice(0, 120) },
          { display_name: 'Quantity', variable_name: 'quantity', value: String(qty) },
          { display_name: 'Inventory ID', variable_name: 'inventory_id', value: String(firstInventoryId) },
          ...(productId != null && String(productId).trim() !== ''
            ? [{ display_name: 'Product ID', variable_name: 'product_id', value: String(productId).trim() }]
            : []),
        ],
      },
      onSuccess: (res) => {
        const ref = res && typeof res === 'object' && 'reference' in res ? String(/** @type {{ reference?: string }} */ (res).reference) : reference;
        Alert.alert('Payment successful', `Reference: ${ref}\n\nYour payment was completed. Order updates can be added when the server verifies this charge.`, [
          { text: 'OK', style: 'default' },
          { text: 'View cart', onPress: () => navigation.navigate('cart') },
        ]);
      },
      onCancel: () => {},
      onError: (err) => {
        const msg = err && typeof err === 'object' && 'message' in err ? String(/** @type {{ message?: string }} */ (err).message) : String(err || 'Something went wrong');
        Alert.alert('Payment error', msg);
      },
    });
  }, [loggedIn, signOut, firstInventoryId, userEmail, unitPrice, qty, title, productId, popup, navigation]);

  return (
    <TouchableOpacity style={styles.buyNow} activeOpacity={0.9} onPress={onBuy}>
      <Text style={styles.buyNowText}>Buy now</Text>
      <Icon name="card-outline" size={22} color="#000000" style={styles.buyNowIcon} />
    </TouchableOpacity>
  );
}
