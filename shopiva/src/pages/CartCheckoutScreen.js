import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProfile } from '../context/ProfileContext';
import { fetchBuyerCart } from '../api/buyer';
import { formatNaira } from '../utils/formatNaira';

const PRIMARY = '#00926e';
const PAGE_BG = '#F2F2F3';
const CARD_BG = '#FFFFFF';
const BORDER = '#E0E0E0';
const MUTED = '#757575';
const ERROR = '#C62828';
const ERROR_BG = '#FFEBEE';
const EXPRESS_SHIPPING = 1000;

/**
 * @param {string} email
 */
function isValidEmail(email) {
  const t = email.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
}

/**
 * @param {string} phone
 */
function isValidPhone(phone) {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10;
}

/**
 * @param {string} street
 */
function isValidStreet(street) {
  return street.trim().length >= 5;
}

/**
 * @param {unknown} row
 * @param {number} index
 */
function normalizeCheckoutLine(row, index = 0) {
  if (!row || typeof row !== 'object') return null;
  const r = /** @type {Record<string, unknown>} */ (row);
  const keyRaw = r.key ?? r.id;
  const key = (typeof keyRaw === 'string' || typeof keyRaw === 'number' ? String(keyRaw) : '').trim() || `line-${index}`;
  const title = String(r.title ?? 'Item').trim() || 'Item';
  const unitPrice = Number(r.unitPrice) || 0;
  const qty = Math.max(1, Math.min(99, Number(r.qty) || 1));
  const image = typeof r.image === 'string' ? r.image.trim() : '';
  const cartItemId = Number(r.cartItemId);
  const inventoryId = Number(r.inventoryId);
  const variantFromLabel = typeof r.variantLabel === 'string' ? r.variantLabel.trim() : '';
  const variantFromSku = r.sku != null && String(r.sku).trim() ? String(r.sku).trim() : '';
  const variantLabel = variantFromLabel || variantFromSku;
  return {
    key,
    title,
    image,
    unitPrice,
    qty,
    variantLabel,
    cartItemId: Number.isFinite(cartItemId) && cartItemId > 0 ? cartItemId : undefined,
    inventoryId: Number.isFinite(inventoryId) && inventoryId > 0 ? inventoryId : undefined,
  };
}

/**
 * @param {import('@react-navigation/native').NavigationProp<Record<string, object | undefined>>} navigation
 */
function goToProfileTab(navigation) {
  const home = navigation.getParent();
  const tab = home?.getParent?.();
  if (tab && typeof tab.navigate === 'function') {
    tab.navigate('Profile');
  }
}

/**
 * @param {{ navigation: import('@react-navigation/native').NavigationProp<Record<string, object | undefined>> }} props
 */
export default function CartCheckoutScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useProfile();
  const route = useRoute();

  const [cartLoading, setCartLoading] = useState(true);
  const [checkoutLines, setCheckoutLines] = useState(
    /** @type {Array<{ key: string; title: string; image: string; unitPrice: number; qty: number; variantLabel: string; cartItemId?: number; inventoryId?: number }>} */ ([]),
  );

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [country] = useState('Nigeria');
  const [delivery, setDelivery] = useState(/** @type {'standard' | 'express'} */ ('standard'));

  const [touchedSubmit, setTouchedSubmit] = useState(false);
  const [formBanner, setFormBanner] = useState('');

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      const rawNav = route.params?.checkoutLines;
      const hasNavLines = Array.isArray(rawNav) && rawNav.length > 0;

      if (hasNavLines) {
        setCartLoading(true);
        const normalized = rawNav
          .map((row, i) => normalizeCheckoutLine(row, i))
          .filter((x) => x != null);
        if (!cancelled) {
          setCheckoutLines(/** @type {typeof checkoutLines} */ (normalized));
          setCartLoading(false);
        }
        return () => {
          cancelled = true;
        };
      }

      (async () => {
        setCartLoading(true);
        try {
          const { lines: raw } = await fetchBuyerCart();
          if (cancelled) return;
          const lines = Array.isArray(raw) ? raw : [];
          const mapped = lines
            .map((l, i) => {
              const row = l && typeof l === 'object' ? /** @type {Record<string, unknown>} */ (l) : {};
              return normalizeCheckoutLine(
                {
                  key: String(row.id ?? ''),
                  cartItemId: row.cartItemId,
                  title: row.title,
                  image: row.image,
                  unitPrice: row.unitPrice,
                  qty: row.qty,
                  sku: row.sku,
                  inventoryId: row.inventoryId ?? row.inventory_id,
                },
                i,
              );
            })
            .filter((x) => x != null);
          if (!cancelled) setCheckoutLines(/** @type {typeof checkoutLines} */ (mapped));
        } catch {
          if (!cancelled) setCheckoutLines([]);
        } finally {
          if (!cancelled) setCartLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [route.params]),
  );

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      setFullName((prev) => (prev.trim() ? prev : user.displayName || ''));
      setEmail((prev) => (prev.trim() ? prev : user.email || ''));
      setPhone((prev) => (prev.trim() ? prev : user.phone || ''));
      setCity((prev) => (prev.trim() ? prev : user.locationObj?.city || ''));
    }, [user]),
  );

  const subtotal = useMemo(
    () => checkoutLines.reduce((s, l) => s + l.unitPrice * l.qty, 0),
    [checkoutLines],
  );

  const shippingCost = delivery === 'express' ? EXPRESS_SHIPPING : 0;
  const shippingLabel = delivery === 'express' ? formatNaira(EXPRESS_SHIPPING) : 'Free';
  const total = Math.max(0, subtotal + shippingCost);

  const errors = useMemo(() => {
    const e = /** @type {Record<string, string>} */ ({});
    if (!fullName.trim()) e.fullName = 'Full name is required.';
    if (!email.trim()) e.email = 'Email is required.';
    else if (!isValidEmail(email)) e.email = 'Enter a valid email address.';
    if (!phone.trim()) e.phone = 'Phone number is required.';
    else if (!isValidPhone(phone)) e.phone = 'Enter a valid phone number.';
    if (!street.trim()) e.street = 'Street address is required.';
    else if (!isValidStreet(street)) e.street = 'Enter a complete street address.';
    if (!city.trim()) e.city = 'Enter your city.';
    if (!zip.trim()) e.zip = 'Enter a ZIP or postal code.';
    return e;
  }, [fullName, email, phone, street, city, zip]);

  const showErrors = touchedSubmit;
  const hasBlockingErrors = Object.keys(errors).length > 0;

  const onContinue = useCallback(() => {
    setTouchedSubmit(true);
    setFormBanner('');
    if (subtotal <= 0) {
      setFormBanner('Your cart is empty. Add items before paying.');
      return;
    }
    if (hasBlockingErrors) {
      setFormBanner('Please complete all fields correctly before paying.');
      return;
    }
    setFormBanner('');
    Alert.alert(
      'Continue to payment',
      `Total ${formatNaira(total)} (including shipping). Hook Paystack or your server checkout here when ready.`,
    );
  }, [hasBlockingErrors, subtotal, total]);

  const inputStyle = (key) => [
    styles.input,
    showErrors && errors[key] ? styles.inputError : null,
  ];

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
    >
      <View style={[styles.root, { paddingTop: 5 }]}>
        <StatusBar barStyle="dark-content" backgroundColor={CARD_BG} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollInner, { paddingBottom: insets.bottom + 200 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {cartLoading ? (
            <Text style={styles.loadingText}>Loading your order…</Text>
          ) : subtotal <= 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Nothing to check out</Text>
              <Text style={styles.emptyBody}>Your cart is empty. Go back and add products first.</Text>
              <Pressable style={styles.primaryBtn} onPress={() => navigation.navigate('cart-main')}>
                <Text style={styles.primaryBtnText}>Return to cart</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Order items</Text>
                {checkoutLines.map((line, idx) => {
                  const lineTotal = line.unitPrice * line.qty;
                  const last = idx === checkoutLines.length - 1;
                  return (
                    <View key={line.key} style={[styles.orderLine, last ? styles.orderLineLast : null]}>
                      {line.image ? (
                        <Image source={{ uri: line.image }} style={styles.orderThumb} resizeMode="cover" />
                      ) : (
                        <View style={[styles.orderThumb, styles.orderThumbPh]}>
                          <Icon name="image-outline" size={22} color="#BDBDBD" />
                        </View>
                      )}
                      <View style={styles.orderLineBody}>
                        <Text style={styles.orderTitle} numberOfLines={2}>
                          {line.title}
                        </Text>
                        {line.variantLabel ? (
                          <Text style={styles.orderVariant} numberOfLines={1}>
                            {line.variantLabel}
                          </Text>
                        ) : null}
                        <Text style={styles.orderMeta}>
                          {formatNaira(line.unitPrice)} × {line.qty}
                        </Text>
                      </View>
                      <Text style={styles.orderLineTotal}>{formatNaira(lineTotal)}</Text>
                    </View>
                  );
                })}
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>Contact information</Text>
                {formBanner ? (
                  <View style={styles.formBanner}>
                    <Text style={styles.formBannerText}>{formBanner}</Text>
                  </View>
                ) : null}

                <Text style={styles.label}>Full name</Text>
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Full name"
                  placeholderTextColor="#AAA"
                  style={inputStyle('fullName')}
                  autoCapitalize="words"
                  accessibilityLabel="Full name"
                />
                {showErrors && errors.fullName ? <Text style={styles.errorText}>{errors.fullName}</Text> : null}

                <Text style={styles.label}>Email</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email"
                  placeholderTextColor="#AAA"
                  style={inputStyle('email')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  accessibilityLabel="Email"
                />
                {showErrors && errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

                <Text style={styles.label}>Phone</Text>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Phone"
                  placeholderTextColor="#AAA"
                  style={inputStyle('phone')}
                  keyboardType="phone-pad"
                  accessibilityLabel="Phone"
                />
                {showErrors && errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>Shipping address</Text>

                <Text style={styles.label}>Street address</Text>
                <TextInput
                  value={street}
                  onChangeText={setStreet}
                  placeholder="123 Main Street"
                  placeholderTextColor="#AAA"
                  style={inputStyle('street')}
                  accessibilityLabel="Street address"
                />
                {showErrors && errors.street ? <Text style={styles.errorText}>{errors.street}</Text> : null}

                <Text style={styles.label}>City</Text>
                <TextInput
                  value={city}
                  onChangeText={setCity}
                  placeholder="City"
                  placeholderTextColor="#AAA"
                  style={inputStyle('city')}
                  accessibilityLabel="City"
                />
                {showErrors && errors.city ? <Text style={styles.errorText}>{errors.city}</Text> : null}

                <Text style={styles.label}>ZIP / Postal code</Text>
                <TextInput
                  value={zip}
                  onChangeText={setZip}
                  placeholder="101241"
                  placeholderTextColor="#AAA"
                  style={inputStyle('zip')}
                  keyboardType="default"
                  accessibilityLabel="ZIP or postal code"
                />
                {showErrors && errors.zip ? <Text style={styles.errorText}>{errors.zip}</Text> : null}

                <Text style={styles.label}>Country</Text>
                <View style={styles.countryBox}>
                  <Text style={styles.countryText}>{country}</Text>
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.sectionHeading}>Delivery options</Text>
                <Pressable
                  onPress={() => setDelivery('standard')}
                  style={[styles.deliveryCard, delivery === 'standard' ? styles.deliveryCardSelected : styles.deliveryCardIdle]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: delivery === 'standard' }}
                >
                  <View style={styles.deliveryTextCol}>
                    <Text style={styles.deliveryTitle}>Standard shipping</Text>
                    <Text style={styles.deliverySub}>Delivered in 5–7 days</Text>
                  </View>
                  <Text style={styles.deliveryPrice}>Free</Text>
                </Pressable>
                <Pressable
                  onPress={() => setDelivery('express')}
                  style={[styles.deliveryCard, delivery === 'express' ? styles.deliveryCardSelected : styles.deliveryCardIdle]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: delivery === 'express' }}
                >
                  <View style={styles.deliveryTextCol}>
                    <Text style={styles.deliveryTitle}>Express shipping</Text>
                    <Text style={styles.deliverySub}>Delivered in 2–3 days</Text>
                  </View>
                  <Text style={styles.deliveryPrice}>{formatNaira(EXPRESS_SHIPPING)}</Text>
                </Pressable>
              </View>

              {/* <Text style={styles.sectionHeading}>Payment method</Text> */}
              {/* <View style={styles.payRow}>
                <Text style={styles.payLabel}>Paystack</Text>
              </View> */}
            </>
          )}
        </ScrollView>

        {subtotal > 0 && !cartLoading ? (
          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 14) }]}>
            <View style={styles.footerRow}>
              <Text style={styles.footerMuted}>Shipping</Text>
              <Text style={styles.footerMuted}>{shippingLabel}</Text>
            </View>
            <View style={styles.footerRowTotal}>
              <Text style={styles.totalWord}>Total</Text>
              <Text style={styles.totalAmount}>{formatNaira(total)}</Text>
            </View>
            <Pressable style={styles.continueBtn} onPress={onContinue} accessibilityRole="button">
              <Text style={styles.continueBtnText}>Continue to payment</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingVertical: 10,
    backgroundColor: CARD_BG,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  headerIconBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 22,
    fontWeight: '800',
    color: PRIMARY,
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scroll: { flex: 1 },
  scrollInner: {
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  loadingText: {
    textAlign: 'center',
    color: MUTED,
    marginTop: 24,
    fontSize: 15,
  },
  emptyCard: {
    backgroundColor: CARD_BG,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 20,
    alignItems: 'center',
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#111', marginBottom: 8 },
  emptyBody: { fontSize: 14, color: MUTED, textAlign: 'center', marginBottom: 16 },
  primaryBtn: {
    backgroundColor: PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  primaryBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111',
    marginBottom: 12,
  },
  orderLine: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  orderLineLast: {
    borderBottomWidth: 0,
  },
  orderThumb: {
    width: 56,
    height: 56,
    borderRadius: 5,
    backgroundColor: '#F5F5F5',
  },
  orderThumbPh: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BORDER,
  },
  orderLineBody: { flex: 1, marginLeft: 12, marginRight: 8, minWidth: 0 },
  orderTitle: { fontSize: 15, fontWeight: '600', color: '#111' },
  orderVariant: { fontSize: 13, color: MUTED, marginTop: 2 },
  orderMeta: { fontSize: 13, color: MUTED, marginTop: 4 },
  orderLineTotal: { fontSize: 15, fontWeight: '700', color: '#111' },
  formBanner: {
    backgroundColor: ERROR_BG,
    borderRadius: 5,
    padding: 10,
    marginBottom: 12,
  },
  formBannerText: {
    color: ERROR,
    fontSize: 14,
    lineHeight: 20,
  },
  label: {
    fontSize: 12,
    color: MUTED,
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 16,
    color: '#111',
  },
  inputError: {
    borderColor: ERROR,
    backgroundColor: '#FFF8F8',
  },
  errorText: {
    color: ERROR,
    fontSize: 13,
    marginTop: 4,
    marginBottom: 4,
  },
  countryBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  countryText: { fontSize: 16, color: '#111' },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111',
    marginBottom: 10,
    marginTop: 4,
  },
  deliveryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 5,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  deliveryCardSelected: {
    borderColor: PRIMARY,
    backgroundColor: 'rgba(0, 146, 110, 0.06)',
  },
  deliveryCardIdle: {
    borderColor: BORDER,
    backgroundColor: CARD_BG,
  },
  deliveryTextCol: { flex: 1, paddingRight: 12 },
  deliveryTitle: { fontSize: 16, fontWeight: '700', color: '#111' },
  deliverySub: { fontSize: 13, color: MUTED, marginTop: 4 },
  deliveryPrice: { fontSize: 16, fontWeight: '700', color: '#111' },
  payRow: {
    backgroundColor: CARD_BG,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 16,
    paddingHorizontal: 14,
    marginBottom: 24,
  },
  payLabel: { fontSize: 16, fontWeight: '600', color: '#111', textAlign: 'center' },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: CARD_BG,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER,
    paddingHorizontal: 16,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  footerRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  footerMuted: { fontSize: 15, color: '#444' },
  totalWord: { fontSize: 17, fontWeight: '800', color: '#111' },
  totalAmount: { fontSize: 18, fontWeight: '800', color: '#111' },
  continueBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 5,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
