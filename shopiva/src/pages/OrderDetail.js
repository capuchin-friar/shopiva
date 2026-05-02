import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatNaira } from '../utils/formatNaira';

const PAGE_BG = '#FFF';
const WHITE = '#FFFFFF';
const BLACK = '#111111';
const TEXT = '#1A1A1A';
const MUTED = '#8E8E93';
const HAIR = '#ECECEE';
const ACCENT = '#7C5CFC';
const ACCENT_PRESSED = '#6A48F5';

/** Pill themes */
const PAY_THEME = {
  paid: { bg: '#E0F2E9', dot: '#0D8A4A', text: '#0D5C2F', label: 'Paid' },
  unpaid: { bg: '#FFF4D6', dot: '#B58100', text: '#7A5800', label: 'Unpaid' },
  refunded: { bg: '#EFEAFF', dot: '#7C5CFC', text: '#3F2BB8', label: 'Refunded' },
  cancelled: { bg: '#FDE3E3', dot: '#C62828', text: '#9F1818', label: 'Cancelled' },
};

const STATUS_THEME = {
  delivered: { bg: '#E0F2E9', dot: '#0D8A4A', text: '#0D5C2F', label: 'Delivered' },
  pending: { bg: '#FFF4D6', dot: '#B58100', text: '#7A5800', label: 'Pending' },
  processing: { bg: '#FFF0E0', dot: '#C45C00', text: '#7A3A00', label: 'Processing' },
  shipped: { bg: '#E0EAFF', dot: '#2F5DDB', text: '#1B3FA1', label: 'Shipped' },
  cancelled: { bg: '#FDE3E3', dot: '#C62828', text: '#9F1818', label: 'Cancelled' },
};

const STATUS_OPTIONS = [
  { key: 'pending', label: 'Pending' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
];

/** @param {string | null | undefined} name */
function initialsOf(name) {
  const parts = String(name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '—';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Pull a non-empty string from an object trying multiple key aliases.
 * @param {Record<string, unknown> | null | undefined} obj
 * @param {string[]} keys
 */
function pickStr(obj, keys) {
  if (!obj || typeof obj !== 'object') return '';
  for (const k of keys) {
    const v = /** @type {Record<string, unknown>} */ (obj)[k];
    if (v == null) continue;
    const s = String(v).trim();
    if (s) return s;
  }
  return '';
}

/**
 * Normalize a shipping address that may arrive as:
 *  - a plain string
 *  - a JSON-stringified object (jsonb cast to text from the API)
 *  - a parsed object with various key aliases
 * @param {unknown} input
 * @returns {{
 *   recipient: string;
 *   phone: string;
 *   email: string;
 *   street: string;
 *   street2: string;
 *   city: string;
 *   state: string;
 *   zip: string;
 *   country: string;
 *   text: string;
 * }}
 */
function parseShippingAddress(input) {
  /** @type {Record<string, unknown> | null} */
  let obj = null;

  if (input && typeof input === 'object') {
    obj = /** @type {Record<string, unknown>} */ (input);
  } else if (typeof input === 'string') {
    const s = input.trim();
    if (!s || s === '—') {
      return emptyAddress();
    }
    if (s.startsWith('{') || s.startsWith('[')) {
      try {
        const parsed = JSON.parse(s);
        if (parsed && typeof parsed === 'object') {
          obj = /** @type {Record<string, unknown>} */ (parsed);
        }
      } catch {
        /* fall through to plain string */
      }
    }
    if (!obj) {
      return { ...emptyAddress(), text: s };
    }
  } else {
    return emptyAddress();
  }

  // Some payloads wrap a flat string: { address: "..." }
  const flat = pickStr(obj, ['address', 'summary']);
  const recipient = pickStr(obj, ['fullName', 'name', 'recipient', 'receiver']);
  const phone = pickStr(obj, ['phone', 'phoneNumber', 'mobile']);
  const email = pickStr(obj, ['email']);
  const street = pickStr(obj, ['street', 'address1', 'addressLine1', 'line1', 'street1']);
  const street2 = pickStr(obj, ['address2', 'addressLine2', 'line2', 'apartment', 'suite']);
  const city = pickStr(obj, ['city', 'town', 'locality']);
  const state = pickStr(obj, ['state', 'region', 'province', 'stateName']);
  const zip = pickStr(obj, ['zip', 'postalCode', 'postcode', 'zipcode', 'postal_code']);
  const country = pickStr(obj, ['country', 'countryName']);

  const cityStateZip = [city, state, zip].filter(Boolean).join(', ');
  const lines = [street, street2, cityStateZip, country].filter(Boolean);
  const text = lines.length > 0 ? lines.join('\n') : flat || '—';

  return { recipient, phone, email, street, street2, city, state, zip, country, text };
}

function emptyAddress() {
  return {
    recipient: '',
    phone: '',
    email: '',
    street: '',
    street2: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    text: '—',
  };
}

function StatusPill({ theme, label }) {
  return (
    <View style={[styles.pill, { backgroundColor: theme.bg }]}>
      <View style={[styles.pillDot, { backgroundColor: theme.dot }]} />
      <Text style={[styles.pillText, { color: theme.text }]}>{label ?? theme.label}</Text>
    </View>
  );
}

function SectionLabel({ children }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

/** @param {{ icon: string; label: string; value?: React.ReactNode; last?: boolean }} p */
function SummaryRow({ icon, label, value, last }) {
  return (
    <View style={[styles.summaryRow, last && styles.summaryRowLast]}>
      <Icon name={icon} size={18} color={MUTED} style={styles.summaryIcon} />
      <Text style={styles.summaryLabel}>{label}</Text>
      <View style={styles.summaryValue}>
        {typeof value === 'string' || typeof value === 'number' ? (
          <Text style={styles.summaryValueText} numberOfLines={1}>
            {String(value)}
          </Text>
        ) : (
          value
        )}
      </View>
    </View>
  );
}

/** @param {{ label: string; value: string; bold?: boolean; muted?: boolean }} p */
function MoneyRow({ label, value, bold, muted }) {
  return (
    <View style={styles.moneyRow}>
      <Text style={[styles.moneyLabel, muted && styles.moneyLabelMuted]}>{label}</Text>
      <Text style={[styles.moneyValue, bold && styles.moneyValueBold]}>{value}</Text>
    </View>
  );
}

/**
 * @param {{ title: string; dateLabel: string; subtitle?: string | null; done: boolean; isLast: boolean }} p
 */
function TimelineStep({ title, dateLabel, subtitle, done, isLast }) {
  return (
    <View style={styles.tlRow}>
      <View style={styles.tlTrack}>
        <View style={[styles.tlDot, done ? styles.tlDotDone : styles.tlDotPending]}>
          {done ? <Icon name="checkmark" size={12} color={WHITE} /> : null}
        </View>
        {!isLast ? <View style={[styles.tlLine, done && styles.tlLineDone]} /> : null}
      </View>
      <View style={styles.tlBody}>
        <View style={styles.tlHeadRow}>
          <Text style={[styles.tlTitle, !done && styles.tlTitleMuted]} numberOfLines={1}>
            {title}
          </Text>
          {dateLabel ? (
            <View style={styles.tlDateRow}>
              <Icon name="calendar-outline" size={13} color={MUTED} />
              <Text style={styles.tlDate}>{dateLabel}</Text>
            </View>
          ) : null}
        </View>
        {subtitle ? <Text style={styles.tlSubtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

export default function OrderDetailScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const order = /** @type {Record<string, unknown> | undefined} */ (route.params?.order);
  const [statusKey, setStatusKey] = useState(
    String(order?.status ?? 'delivered').toLowerCase(),
  );
  const [statusOpen, setStatusOpen] = useState(false);

  const orderNumber = useMemo(() => {
    const n = order?.orderId ?? order?.order_id ?? '1928';
    return String(n).replace(/^ORD-/i, '');
  }, [order]);
  

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => ( 
        <View >
          <Text style={{fontWeight: 700}}>Order #{orderNumber}</Text>
          <StatusPill theme={payTheme} />
        </View>
      ),
    });
  }, [navigation]);

  const headerDate = String(order?.dateLabel ?? 'Jan 12, 2025');
  const payKey = String(order?.paymentStatus ?? 'paid').toLowerCase();
  const payTheme = PAY_THEME[payKey] ?? PAY_THEME.paid;
  const statusTheme = STATUS_THEME[statusKey] ?? STATUS_THEME.delivered;

  const shipping = useMemo(() => {
    const raw =
      (order && (order.shipping_address ?? order.location)) ??
      '{"street":"221B Baker Street","city":"London","zip":"NW1 6XE","country":"United Kingdom"}';
    return parseShippingAddress(raw);
  }, [order]);

  const customer = useMemo(
    () => ({
      name:
        String(
          (order && (order.customer || order.buyer_name || order.vendor)) || '',
        ) ||
        shipping.recipient ||
        'Emma Brown',
      email:
        String((order && (order.email || order.buyer_email)) || '') ||
        shipping.email ||
        'emma23@gmail.com',
      phone:
        String((order && (order.phone || order.buyer_phone)) || '') ||
        shipping.phone ||
        '+44 20 7946 0958',
    }),
    [order, shipping],
  );

  const items = useMemo(() => {
    if (Array.isArray(order?.items_list) && order.items_list.length > 0) {
      return order.items_list;
    }
    return [
      {
        id: 'p-1',
        name: 'Iphone 15 Pro Max',
        variant: '256 GB - Silver Gray',
        qty: 1,
        price: 1230,
        image: null,
      },
    ];
  }, [order]);

  const isNaira = order && 'valueRupees' in order;
  const fmt = useCallback(
    (n) => {
      if (typeof n === 'string') return n;
      if (!Number.isFinite(Number(n))) return '—';
      if (isNaira) return formatNaira(Number(n));
      return `$${Number(n).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    },
    [isNaira],
  );

  const payment = useMemo(() => {
    const subtotal = Number(order?.subtotal ?? items.reduce((s, it) => s + Number(it.price ?? 0) * Number(it.qty ?? 1), 0));
    const discount = Number(order?.discount ?? 0);
    const shipping = Number(order?.shippingCost ?? 10);
    const tax = Number(order?.tax ?? 1);
    const total = Number(order?.total ?? subtotal - discount + shipping + tax);
    return { subtotal, discount, shipping, tax, total };
  }, [items, order]);

  const timeline = useMemo(() => {
    if (Array.isArray(order?.timelineSteps) && order.timelineSteps.length > 0) {
      return order.timelineSteps;
    }
    return [
      {
        title: 'Order Confirmed',
        dateLabel: '12 Jan 2025, 09:12 AM',
        subtitle: 'Order placed and confirmed',
        done: true,
      },
      {
        title: 'Payment Received',
        dateLabel: '12 Jan 2025, 09:14 AM',
        subtitle: 'Paid via card ending 4242',
        done: true,
      },
      {
        title: 'Processing',
        dateLabel: '12 Jan 2025, 11:02 AM',
        subtitle: 'Picked, packed, and labelled',
        done: true,
      },
      {
        title: 'Shipped',
        dateLabel: '13 Jan 2025, 08:30 AM',
        subtitle: 'Handed to carrier — UPS Express',
        done: true,
      },
      {
        title: 'Delivered',
        dateLabel: '14 Jan 2025, 02:48 PM',
        subtitle: 'Signed by recipient',
        done: statusKey === 'delivered',
      },
    ];
  }, [order, statusKey]);

  const onClose = () => {
    if (navigation.canGoBack()) navigation.goBack();
  };

  const onMail = () => {
    Linking.openURL(`mailto:${customer.email}`).catch(() => {});
  };

  const onCall = () => {
    Linking.openURL(`tel:${customer.phone.replace(/\s+/g, '')}`).catch(() => {});
  };

  const onAddProduct = () => {
    Alert.alert('Add product', 'Product picker will open here.');
  };

  const onDownloadInvoice = () => {
    Alert.alert('Download invoice', 'Invoice will be generated and downloaded.');
  };

  const onRefund = () => {
    Alert.alert('Refund order', `Refund order #${orderNumber}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Refund', style: 'destructive', onPress: () => {} },
    ]);
  };

  const onResendInvoice = () => {
    Alert.alert('Resend invoice', `Email invoice to ${customer.email}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Send', onPress: () => {} },
    ]);
  };

  const onUpdateStatus = () => setStatusOpen(true);

  return (
    <View style={[styles.root, { paddingTop: 0 }]}>
      {/* <View style={styles.headerBar}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>Order ID #{orderNumber}</Text>
          <StatusPill theme={payTheme} />
        </View>
        <Pressable
          onPress={onClose}
          hitSlop={12}
          style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Icon name="close" size={20} color={TEXT} />
        </Pressable>
      </View>
      <Text style={styles.headerDate}>{headerDate}</Text>
      <View style={styles.headerDivider} /> */}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 110 + Math.max(insets.bottom, 16) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeadRow}>
          <SectionLabel>Order Summary</SectionLabel>
          {/* <Pressable
            hitSlop={6}
            onPress={onAddProduct}
            style={({ pressed }) => [styles.linkRow, pressed && styles.pressed]}
          >
            <Text style={styles.linkText}>Add Product</Text>
            <Icon name="arrow-up-outline" size={14} color={ACCENT} style={styles.linkArrow} />
          </Pressable> */}
        </View>
        <View style={styles.card}>
          <SummaryRow
            icon="checkmark-circle-outline"
            label="Order Status"
            value={<StatusPill theme={statusTheme} />}
          />
          <SummaryRow
            icon="cube-outline"
            label="Shipping Method"
            value={String(order?.shippingMethod ?? 'UPS Express')}
          />
          <SummaryRow
            icon="pricetag-outline"
            label="Tracking Number"
            value={String(order?.trackingNumber ?? '1Z7A3F76Y2045')}
            last
          />
        </View>

        <SectionLabel>Customer Info</SectionLabel>
        <View style={styles.card}>
          <View style={styles.customerHead}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initialsOf(customer.name)}</Text>
            </View>
            <View style={styles.customerNameCol}>
              <Text style={styles.customerName} numberOfLines={1}>
                {customer.name}
              </Text>
              <Text style={styles.customerEmail} numberOfLines={1}>
                {customer.email}
              </Text>
            </View>
            <Pressable
              onPress={onMail}
              hitSlop={10}
              style={({ pressed }) => [styles.headIcon, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel="Email customer"
            >
              <Icon name="mail-outline" size={20} color={TEXT} />
              <View style={styles.headIconDot} />
            </Pressable>
            <Pressable
              hitSlop={10}
              style={({ pressed }) => [styles.headIcon, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel="More actions"
            >
              <Icon name="ellipsis-vertical" size={18} color={TEXT} />
            </Pressable>
          </View>

          {/* <View style={styles.kvRow}>
            <Text style={styles.kvLabel}>Phone Number</Text>
            <Pressable onPress={onCall} hitSlop={6} style={styles.kvValueWrap}>
              <Text style={styles.kvValue}>{customer.phone}</Text>
            </Pressable>
          </View> */}

          <View style={styles.shippingBlock}>
            <Text style={styles.shippingHeader}>Shipping Address</Text>
            {shipping.recipient ? (
              <View style={styles.kvRow}>
                <Text style={styles.kvLabel}>Recipient</Text>
                <Text style={styles.kvValue} numberOfLines={1}>
                  {shipping.recipient}
                </Text>
              </View>
            ) : null}
            {shipping.street ? (
              <View style={[styles.kvRow, styles.kvRowAlignTop]}>
                <Text style={styles.kvLabel}>Street</Text>
                <Text style={[styles.kvValue, styles.kvAddress]}>
                  {[shipping.street, shipping.street2].filter(Boolean).join('\n')}
                </Text>
              </View>
            ) : null}
            {shipping.city ? (
              <View style={styles.kvRow}>
                <Text style={styles.kvLabel}>City</Text>
                <Text style={styles.kvValue} numberOfLines={1}>
                  {shipping.city}
                </Text>
              </View>
            ) : null}
            {shipping.state ? (
              <View style={styles.kvRow}>
                <Text style={styles.kvLabel}>State</Text>
                <Text style={styles.kvValue} numberOfLines={1}>
                  {shipping.state}
                </Text>
              </View>
            ) : null}
            {shipping.zip ? (
              <View style={styles.kvRow}>
                <Text style={styles.kvLabel}>ZIP / Postal</Text>
                <Text style={styles.kvValue} numberOfLines={1}>
                  {shipping.zip}
                </Text>
              </View>
            ) : null}
            {shipping.country ? (
              <View style={styles.kvRow}>
                <Text style={styles.kvLabel}>Country</Text>
                <Text style={styles.kvValue} numberOfLines={1}>
                  {shipping.country}
                </Text>
              </View>
            ) : null}
            {!shipping.street && !shipping.city && !shipping.state && !shipping.country ? (
              <View style={[styles.kvRow, styles.kvRowAlignTop]}>
                <Text style={styles.kvLabel}>Address</Text>
                <Text style={[styles.kvValue, styles.kvAddress]}>{shipping.text}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <SectionLabel>Items</SectionLabel>
        <View style={styles.card}>
          {items.map((it, i) => (
            <View
              key={String(it.id ?? i)}
              style={[styles.itemRow, i === items.length - 1 && styles.itemRowLast]}
            >
              <View style={styles.itemThumb}>
                {it.image ? (
                  <Image source={{ uri: String(it.image) }} style={styles.itemImg} />
                ) : (
                  <Icon name="phone-portrait-outline" size={26} color="#5C5C66" />
                )}
              </View>
              <View style={styles.itemBody}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {String(it.name ?? '—')}
                </Text>
                {it.variant ? (
                  <Text style={styles.itemVariant} numberOfLines={1}>
                    {String(it.variant)}
                  </Text>
                ) : null}
              </View>
              <View style={styles.itemRight}>
                <View style={styles.qtyChip}>
                  <Text style={styles.qtyChipLabel}>Quantity</Text>
                  <Text style={styles.qtyChipValue}>{Number(it.qty ?? 1)}</Text>
                </View>
                <Text style={styles.itemPrice}>{fmt(Number(it.price ?? 0) * Number(it.qty ?? 1))}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeadRow}>
          <SectionLabel>Payment</SectionLabel>
          <Pressable
            hitSlop={6}
            onPress={onDownloadInvoice}
            style={({ pressed }) => [styles.linkRow, pressed && styles.pressed]}
          >
            <Text style={styles.linkText}>Download Invoice</Text>
            <Icon name="download-outline" size={16} color={ACCENT} />
          </Pressable>
        </View>
        <View style={styles.card}>
          <MoneyRow label="Subtotal" value={fmt(payment.subtotal)} muted />
          <MoneyRow label="Discount" value={fmt(payment.discount)} muted />
          <MoneyRow label="Shipping Cost" value={fmt(payment.shipping)} muted />
          <MoneyRow label="Tax" value={fmt(payment.tax)} muted />
          <View style={styles.moneyDivider} />
          <MoneyRow label="Total" value={fmt(payment.total)} bold />
        </View>

        <SectionLabel>Timelane</SectionLabel>
        <View style={styles.card}>
          {timeline.map((s, i) => (
            <TimelineStep
              key={`${s.title}-${i}`}
              title={String(s.title)}
              dateLabel={String(s.dateLabel ?? '')}
              subtitle={s.subtitle ? String(s.subtitle) : null}
              done={Boolean(s.done)}
              isLast={i === timeline.length - 1}
            />
          ))}
        </View>
      </ScrollView>

      <View
        style={[
          styles.actionBar,
          { paddingBottom: Math.max(insets.bottom, 12) },
        ]}
      >
        {/* <Pressable
          onPress={onRefund}
          style={({ pressed }) => [styles.btnGhost, pressed && styles.pressed]}
        >
          <Text style={styles.btnGhostText}>Refund</Text>
        </Pressable> */}
        {/* <Pressable
          onPress={onResendInvoice}
          style={({ pressed }) => [styles.btnGhost, pressed && styles.pressed]}
        >
          <Text style={styles.btnGhostText}>Resend Invoice</Text>
        </Pressable> */}
        <Pressable
          onPress={onUpdateStatus}
          style={({ pressed }) => [styles.btnPrimary, pressed && styles.btnPrimaryPressed]}
        >
          <Text style={styles.btnPrimaryText}>Update Status</Text>
        </Pressable>
      </View>

      <Modal
        visible={statusOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setStatusOpen(false)}
      >
        <View style={styles.sheetRoot}>
          <Pressable style={styles.sheetDismiss} onPress={() => setStatusOpen(false)} />
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Update order status</Text>
            {STATUS_OPTIONS.map((opt) => {
              const selected = opt.key === statusKey;
              const t = STATUS_THEME[opt.key];
              return (
                <Pressable
                  key={opt.key}
                  onPress={() => {
                    setStatusKey(opt.key);
                    setStatusOpen(false);
                  }}
                  style={({ pressed }) => [styles.sheetRow, pressed && styles.sheetRowPressed]}
                >
                  <View style={[styles.sheetDot, { backgroundColor: t.dot }]} />
                  <Text style={styles.sheetRowText}>{opt.label}</Text>
                  {selected ? <Icon name="checkmark" size={18} color={ACCENT} /> : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: BLACK,
    letterSpacing: -0.4,
  },
  headerDate: {
    fontSize: 13,
    color: MUTED,
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 12,
  },
  headerDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E2E2E6',
    marginHorizontal: 0,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WHITE,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E2E2E6',
  },
  pressed: {
    opacity: 0.85,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: BLACK,
    marginTop: 16,
    marginBottom: 10,
  },
  sectionHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    marginBottom: 10,
  },
  linkText: {
    fontSize: 13,
    fontWeight: '700',
    color: ACCENT,
  },
  linkArrow: {
    transform: [{ rotate: '45deg' }],
  },
  card: {
    backgroundColor: WHITE,
    borderRadius: 5,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E8E8EC',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: { elevation: 1 },
    }),
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HAIR,
  },
  summaryRowLast: {
    borderBottomWidth: 0,
  },
  summaryIcon: {
    width: 22,
    marginRight: 8,
  },
  summaryLabel: {
    flex: 1,
    fontSize: 13,
    color: TEXT,
  },
  summaryValue: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  summaryValueText: {
    fontSize: 13,
    fontWeight: '700',
    color: BLACK,
  },
  customerHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 12,
    marginBottom: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HAIR,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 5,
    backgroundColor: '#EAEAEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#5C5C66',
  },
  customerNameCol: {
    flex: 1,
    minWidth: 0,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '700',
    color: BLACK,
  },
  customerEmail: {
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
  },
  headIcon: {
    width: 32,
    height: 32,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headIconDot: {
    position: 'absolute',
    top: 6,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#E5484D',
    borderWidth: 1,
    borderColor: WHITE,
  },
  kvRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  kvRowAlignTop: {
    alignItems: 'flex-start',
  },
  kvLabel: {
    flex: 1,
    fontSize: 13,
    color: MUTED,
  },
  kvValueWrap: {
    flex: 1.4,
    alignItems: 'flex-end',
  },
  kvValue: {
    flex: 1.4,
    fontSize: 13,
    fontWeight: '600',
    color: TEXT,
    textAlign: 'right',
  },
  kvAddress: {
    lineHeight: 18,
  },
  shippingBlock: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: HAIR,
  },
  shippingHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: 6,
    marginBottom: 2,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: HAIR,
  },
  itemRowLast: {
    borderBottomWidth: 0,
  },
  itemThumb: {
    width: 56,
    height: 56,
    borderRadius: 5,
    backgroundColor: '#F4F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  itemImg: {
    width: '100%',
    height: '100%',
  },
  itemBody: {
    flex: 1,
    minWidth: 0,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: BLACK,
  },
  itemVariant: {
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
  },
  itemRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  qtyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F4F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  qtyChipLabel: {
    fontSize: 11,
    color: MUTED,
    fontWeight: '600',
  },
  qtyChipValue: {
    fontSize: 12,
    fontWeight: '700',
    color: BLACK,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: BLACK,
  },
  moneyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 7,
  },
  moneyLabel: {
    fontSize: 13,
    color: TEXT,
  },
  moneyLabelMuted: {
    color: MUTED,
  },
  moneyValue: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT,
  },
  moneyValueBold: {
    fontSize: 15,
    fontWeight: '800',
    color: BLACK,
  },
  moneyDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E2E2E6',
    marginVertical: 6,
  },
  tlRow: {
    flexDirection: 'row',
    minHeight: 56,
  },
  tlTrack: {
    width: 22,
    alignItems: 'center',
    marginRight: 10,
  },
  tlDot: {
    width: 22,
    height: 22,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  tlDotDone: {
    backgroundColor: '#0D8A4A',
  },
  tlDotPending: {
    backgroundColor: WHITE,
    borderWidth: 2,
    borderColor: '#D6D6DC',
  },
  tlLine: {
    width: 2,
    flex: 1,
    minHeight: 22,
    marginTop: 2,
    backgroundColor: '#E2E2E6',
  },
  tlLineDone: {
    backgroundColor: '#BFE6CD',
  },
  tlBody: {
    flex: 1,
    paddingBottom: 14,
  },
  tlHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  tlTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: BLACK,
    flexShrink: 1,
  },
  tlTitleMuted: {
    color: MUTED,
    fontWeight: '600',
  },
  tlDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tlDate: {
    fontSize: 12,
    color: MUTED,
  },
  tlSubtitle: {
    fontSize: 12,
    color: MUTED,
    marginTop: 4,
  },
  actionBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: WHITE,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E2E6',
  },
  btnGhost: {
    flex: 1,
    height: 44,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WHITE,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D6D6DC',
  },
  btnGhostText: {
    fontSize: 13,
    fontWeight: '700',
    color: TEXT,
  },
  btnPrimary: {
    flex: 1.2,
    height: 44,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ACCENT,
  },
  btnPrimaryPressed: {
    backgroundColor: ACCENT_PRESSED,
  },
  btnPrimaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: WHITE,
  },
  sheetRoot: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheetDismiss: {
    flex: 1,
  },
  sheet: {
    backgroundColor: WHITE,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 5,
    backgroundColor: '#D6D6DC',
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    paddingHorizontal: 8,
    marginBottom: 6,
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  sheetRowPressed: {
    backgroundColor: '#F5F5F7',
  },
  sheetDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  sheetRowText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: TEXT,
  },
});
