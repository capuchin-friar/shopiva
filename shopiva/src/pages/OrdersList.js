import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatNaira } from '../utils/formatNaira';
import { fetchBuyerOrders } from '../api/buyer';
// import { fetchVendorOrders } from '../../api/vendors'
import { mapOrderRowToListItem } from '../utils/buyerUi';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStoredUser } from '../auth/session';
import { fetchOwnerShops, fetchShopOrders } from '../api';
import { set_orderList } from '../../redux/orders';

const PAGE_BG = '#F2F2F4';
const BLACK = '#111111';
const MUTED = '#8E8E93';
const WHITE = '#FFFFFF';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'processing', label: 'Processing' },
  { key: 'delivered', label: 'Delivered' },
];

const STATUS_THEME = {
  payment_received: {
    bg: '#FFF4D6',
    dot: '#B58100',
    text: '#7A5800',
    label: 'Payment received',
  },
  order_accepted: {
    bg: '#FFF4D6',
    dot: '#B58100',
    text: '#7A5800',
    label: 'Order accepted',
  },
  order_processing: {
    bg: '#FFF0E0',
    dot: '#C45C00',
    text: '#7A3A00',
    label: 'Processing',
  },
  order_shipping: {
    bg: '#E0EAFF',
    dot: '#2F5DDB',
    text: '#1B3FA1',
    label: 'Shipping',
  },
  order_out_for_delivery: {
    bg: '#E0F2E9',
    dot: '#08ccfd',
    text: '#075646',
    label: 'Out For Delivery',
  },
  order_delivered: {
    bg: '#E0F2E9',
    dot: '#0D8A4A',
    text: '#0D5C2F',
    label: 'Delivered',
  },
  order_disputed: {
    bg: '#fff3e3',
    dot: '#eb8900',
    text: '#a46000',
    label: 'Order disputed',
  },
  order_cancellation: {
    bg: '#FDE3E3',
    dot: '#C62828',
    text: '#9F1818',
    label: 'Cancelled',
  },
};

/** @param {unknown} raw */
function statusThemeFor(raw) {
  const key = String(raw ?? '').toLowerCase().trim();
  if (STATUS_THEME[key]) return STATUS_THEME[key];
  if (key.includes('cancel')) return STATUS_THEME.order_cancellation;
  if (key.includes('deliver') && !key.includes('out_for'))
    return STATUS_THEME.order_delivered;
  if (key.includes('out_for') || key.includes('out-for'))
    return STATUS_THEME.order_out_for_delivery;
  if (key.includes('ship')) return STATUS_THEME.order_shipping;
  if (key.includes('process')) return STATUS_THEME.order_processing;
  if (key.includes('accept')) return STATUS_THEME.order_accepted;
  if (key.includes('dispute')) return STATUS_THEME.order_disputed;
  if (key.includes('payment') || key.includes('pending') || key.includes('paid'))
    return STATUS_THEME.payment_received;
  return STATUS_THEME.payment_received;
}

/**
 * @param {{ item: Record<string, unknown>; onPress: () => void }} p
 */
function OrderCard({ item, onPress }) {
  const t = statusThemeFor(item.status);
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      <View style={styles.cardTop}>
        <View style={[styles.iconCircle, { backgroundColor: t.bg }]}>
          <View style={[styles.statusDot, { backgroundColor: t.dot }]} />
        </View>
        <View style={styles.cardTitleCol}>
          <Text style={styles.orderId}>{item.order_id}</Text>
          <Text style={styles.vendorLine} numberOfLines={1}>
            {item.vendor ?? item.customer}
          </Text>
        </View>
        <Icon name="chevron-forward" size={20} color={MUTED} />
      </View>

      <View style={styles.grid}>
        <View style={styles.gridCol}>
          <Text style={styles.gridLabel}>Items</Text>
          <Text style={styles.gridValue}>{item.qty}</Text>
        </View>
        <View style={styles.gridCol}>
          <Text style={styles.gridLabel}>Value</Text>
          <Text style={styles.gridValue}>{formatNaira(item.amount)}</Text>
        </View>
        <View style={[styles.gridCol, styles.gridColLast]}>
          <Text style={styles.gridLabel}>Status</Text>
          <View style={[styles.statusPill, { backgroundColor: t.bg }]}>
            <View style={[styles.statusDot, { backgroundColor: t.dot }]} />
            <Text style={[styles.statusPillText, { color: t.text }]}>{t.label}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default function OrderListScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const auth = useSelector(s => s.auth)
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { orderList } = useSelector(s => s.orderList);

  /** @param {Record<string, unknown>} row */
  function shopIdOf(row) {
    const v = row.id ?? row.shopid ?? row.shop_id;
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : 0;
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        let { id: userId } = await getStoredUser();

        let shopId;

        if (auth.activeRole !== "customer") {
          let shop = await fetchOwnerShops(userId);
          if (!shop) {
            Alert.alert("no shops")
            return;
          }
          shopId = shop[0].id;
        }
        const data = auth.activeRole === "customer" ? await fetchBuyerOrders() : await fetchShopOrders(shopId, userId);
        if (cancelled) return;

        dispatch(set_orderList(Array.isArray(data) ? data : data.orders))
      } catch (e) {
        if (!cancelled) {
          dispatch(set_orderList([]))
          setError(e instanceof Error ? e.message : String(e));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [auth.activeRole, dispatch]);

  const data = useMemo(() => {
    if (filter === 'all') return orderList;
    return orderList.filter((o) => o.status === filter);
  }, [filter, orderList]);

  const renderItem = useCallback(
    ({ item }) => (
      <OrderCard
        item={item}
        onPress={() =>
          navigation.navigate('Order-detail', {
            order: item,
          })
        }
      />
    ),
    [navigation],
  );

  const listHeader = useMemo(
    () => (
      <View style={styles.headerBlock}>
        {/* <Text style={styles.pageTitle}>Orders</Text> */}
        {/* <Text style={styles.pageSubtitle}>Manage all your orders</Text> */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {FILTERS.map((f) => {
            const selected = filter === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={[styles.chip, selected ? styles.chipSelected : styles.chipIdle]}
              >
                <Text style={[styles.chipText, selected ? styles.chipTextSelected : styles.chipTextIdle]}>
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    ),
    [filter],
  );

  if (loading) {
    return (
      <View style={[styles.root, styles.centered, { paddingTop: 15 }]}>
        <ActivityIndicator size="large" color="#00926e" />
        <Text style={styles.loadingText}>Loading orders…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.root, styles.centered, { paddingTop: 15, paddingHorizontal: 24 }]}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.loadingText}>Sign in and ensure the API is running to see your orders.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, {paddingTop: 15}]}>
      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Math.max(insets.bottom, 20) + 16 },
        ]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.loadingText}>No orders in this filter yet.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: MUTED,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#c62828',
    textAlign: 'center',
    marginBottom: 8,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  headerBlock: {
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: BLACK,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 14,
    color: MUTED,
    marginTop: 4,
    marginBottom: 18,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingRight: 8,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  chipIdle: {
    backgroundColor: '#E8E8EA',
  },
  chipSelected: {
    backgroundColor: '#1A1A1A',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chipTextIdle: {
    color: BLACK,
  },
  chipTextSelected: {
    color: WHITE,
  },
  separator: {
    height: 12,
  },
  card: {
    backgroundColor: WHITE,
    borderRadius: 10,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  cardPressed: {
    opacity: 0.96,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardTitleCol: {
    flex: 1,
    minWidth: 0,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700',
    color: BLACK,
  },
  vendorLine: {
    fontSize: 13,
    color: MUTED,
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ECECEC',
    paddingTop: 14,
  },
  gridCol: {
    flex: 1,
  },
  gridColLast: {
    alignItems: 'flex-start'
  },
  gridLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  gridValue: {
    fontSize: 15,
    fontWeight: '600',
    color: BLACK,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
    flexShrink: 0,
  },
});
