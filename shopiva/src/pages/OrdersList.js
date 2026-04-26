import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import { mapOrderRowToListItem } from '../utils/buyerUi';

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
  pending: {
    pillBg: '#E8F5C8',
    pillText: '#5C6C1A',
    iconBg: '#E8F5C8',
    icon: 'time-outline',
    iconColor: '#5C6C1A',
  },
  processing: {
    pillBg: '#FFF0E0',
    pillText: '#C45C00',
    iconBg: '#FFF0E0',
    icon: 'cube-outline',
    iconColor: '#C45C00',
  },
  delivered: {
    pillBg: '#E0F2E9',
    pillText: '#0D5C2F',
    iconBg: '#E0F2E9',
    icon: 'checkmark-circle-outline',
    iconColor: '#0D5C2F',
  },
};

/**
 * @param {{ item: Record<string, unknown>; onPress: () => void }} p
 */
function OrderCard({ item, onPress }) {
  const t = STATUS_THEME[item.status] ?? STATUS_THEME.pending;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      <View style={styles.cardTop}>
        <View style={[styles.iconCircle, { backgroundColor: t.iconBg }]}>
          <Icon name={t.icon} size={22} color={t.iconColor} />
        </View>
        <View style={styles.cardTitleCol}>
          <Text style={styles.orderId}>{item.id}</Text>
          <Text style={styles.vendorLine} numberOfLines={1}>
            {item.vendor ?? item.customer}
          </Text>
        </View>
        <Icon name="chevron-forward" size={20} color={MUTED} />
      </View>

      <View style={styles.grid}>
        <View style={styles.gridCol}>
          <Text style={styles.gridLabel}>Items</Text>
          <Text style={styles.gridValue}>{item.items}</Text>
        </View>
        <View style={styles.gridCol}>
          <Text style={styles.gridLabel}>Value</Text>
          <Text style={styles.gridValue}>{formatNaira(item.valueRupees)}</Text>
        </View>
        <View style={[styles.gridCol, styles.gridColLast]}>
          <Text style={styles.gridLabel}>Status</Text>
          <View style={[styles.statusPill, { backgroundColor: t.pillBg }]}>
            <Text style={[styles.statusPillText, { color: t.pillText }]}>{item.status}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default function OrdersListScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState('all');
  const [orders, setOrders] = useState(/** @type {Record<string, unknown>[]} */ ([]));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const { orders: rows } = await fetchBuyerOrders();
        if (cancelled) return;
        const mapped = (Array.isArray(rows) ? rows : []).map((r) =>
          mapOrderRowToListItem(/** @type {Record<string, unknown>} */ (r)),
        );
        setOrders(mapped);
      } catch (e) {
        if (!cancelled) {
          setOrders([]);
          setError(e instanceof Error ? e.message : String(e));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const data = useMemo(() => {
    if (filter === 'all') return orders;
    return orders.filter((o) => o.status === filter);
  }, [filter, orders]);

  const renderItem = useCallback(
    ({ item }) => (
      <OrderCard
        item={item}
        onPress={() =>
          navigation.navigate('order-detail', {
            order: item,
            orderId: item.orderId,
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
    alignItems: 'flex-start',
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
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'lowercase',
  },
});
