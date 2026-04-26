import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
  Alert,
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
import { fetchBuyerOrder } from '../api/buyer';
import { mapOrderRowToListItem } from '../utils/buyerUi';

const PAGE_BG = '#F5F5F5';
const WHITE = '#FFFFFF';
const BLACK = '#111111';
const MUTED = '#8E8E93';
/** Accent lime — matches reference */
const LIME = '#A4C639';
const LINE_DONE = '#C5E075';
const LINE_PENDING = '#E0E0E0';
const DOT_PENDING = '#D8D8D8';

/**
 * From order detail (nested under customer/vendor orders stack), open disputes list.
 * @param {import('@react-navigation/native').NavigationProp<Record<string, unknown>>} navigation
 */
function navigateToDisputesListFromOrder(navigation) {
  let p = navigation.getParent?.();
  for (let i = 0; i < 6 && p; i += 1) {
    const names = p.getState?.()?.routeNames;
    if (Array.isArray(names)) {
      if (names.includes('CustomerDisputeFlow')) {
        p.navigate('CustomerDisputeFlow', { screen: 'dispute-list' });
        return;
      }
      if (names.includes('VendorDisputeFlow')) {
        p.navigate('VendorDisputeFlow', { screen: 'dispute-list' });
        return;
      }
      if (names.includes('Dispute')) {
        p.navigate('Dispute', { screen: 'dispute-list' });
        return;
      }
    }
    p = p.getParent?.();
  }
}

/**
 * @typedef {{ title: string; time?: string | null; done: boolean }} TimelineStep
 */

/**
 * Customer app: show seller as `vendor`. Legacy APIs may still send `customer` for the same field.
 *
 * @typedef {{
 *   id: string;
 *   vendor?: string;
 *   customer?: string;
 *   items: number;
 *   valueRupees: number; // amount in NGN (displayed with ₦)
 *   status: string;
 *   location?: string;
 *   dateLabel?: string;
 *   timeline?: TimelineStep[];
 * }} OrderDetail
 */

/** Fallback timeline when API does not send `timeline`. */
function defaultTimeline(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'delivered') {
    return [
      { title: 'Order Placed', time: '10:30 AM', done: true },
      { title: 'Payment Confirmed', time: '10:32 AM', done: true },
      { title: 'Processing', time: '11:15 AM', done: true },
      { title: 'Shipped', time: '2:40 PM', done: true },
      { title: 'Delivered', time: '6:00 PM', done: true },
    ];
  }
  if (s === 'processing') {
    return [
      { title: 'Order Placed', time: '10:30 AM', done: true },
      { title: 'Payment Confirmed', time: '10:32 AM', done: true },
      { title: 'Processing', time: '11:15 AM', done: true },
      { title: 'Shipped', time: null, done: false },
    ];
  }
  return [
    { title: 'Order Placed', time: '10:30 AM', done: true },
    { title: 'Payment Confirmed', time: null, done: false },
    { title: 'Processing', time: null, done: false },
    { title: 'Shipped', time: null, done: false },
  ];
}

function SummaryRow({ label, value }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

/**
 * @param {{ steps: TimelineStep[] }} p
 */
function OrderTimeline({ steps }) {
  return (
    <View style={styles.timelineWrap}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const lineActive = step.done && !isLast;
        return (
          <View key={`${step.title}-${index}`} style={styles.tlRow}>
            <View style={styles.tlTrack}>
              <View
                style={[
                  styles.tlDotOuter,
                  step.done ? styles.tlDotOuterDone : styles.tlDotOuterPending,
                ]}
              >
                {step.done ? <View style={styles.tlDotInner} /> : null}
              </View>
              {!isLast ? (
                <View
                  style={[
                    styles.tlConnector,
                    lineActive ? styles.tlConnectorDone : styles.tlConnectorPending,
                  ]}
                />
              ) : null}
            </View>
            <View style={styles.tlBody}>
              <Text style={styles.tlTitle}>{step.title}</Text>
              {step.time ? <Text style={styles.tlTime}>{step.time}</Text> : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

/**
 * @param {{ onOpenActions: () => void }} p
 */
function OrderDetailHeaderRight({ onOpenActions }) {
  return (
    <View style={styles.headerTools}>
      <Pressable
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        style={styles.headerEllipsis}
        onPress={onOpenActions}
        accessibilityRole="button"
        accessibilityLabel="More order actions"
      >
        <Icon name="ellipsis-horizontal" size={22} color={BLACK} />
      </Pressable>
    </View>
  );
}

export default function OrderDetailScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const raw = route.params?.order;
  const orderIdParam = route.params?.orderId;
  const [actionsOpen, setActionsOpen] = useState(false);
  const [order, setOrder] = useState(raw);

  useEffect(() => {
    if (raw) setOrder(raw);
  }, [raw]);

  useEffect(() => {
    const oid = orderIdParam != null ? String(orderIdParam).trim() : '';
    if (!oid) return;
    let cancelled = false;
    (async () => {
      try {
        const { order: row } = await fetchBuyerOrder(oid);
        if (cancelled) return;
        setOrder(mapOrderRowToListItem(/** @type {Record<string, unknown>} */ (row)));
      } catch {
        /* keep navigation param snapshot */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orderIdParam]);

  const openActions = useCallback(() => {
    setActionsOpen(true);
  }, []);

  const renderHeaderRight = useCallback(
    () => <OrderDetailHeaderRight onOpenActions={openActions} />,
    [openActions],
  );

  useLayoutEffect(() => {
    if (!order) {
      navigation.setOptions({ headerRight: undefined });
      return undefined;
    }
    navigation.setOptions({
      headerRight: renderHeaderRight,
    });
    return () => navigation.setOptions({ headerRight: undefined });
  }, [navigation, order, renderHeaderRight]);

  const timeline = useMemo(() => {
    if (!order) return [];
    if (order.timeline && order.timeline.length > 0) return order.timeline;
    return defaultTimeline(order.status);
  }, [order]);

  if (!order) {
    return (
      <View style={[styles.empty, { paddingTop: insets.top + 24 }]}>
        <Text style={styles.muted}>Order not found.</Text>
        <Pressable style={styles.backPill} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={18} color={BLACK} />
          <Text style={styles.backPillText}>Back to Orders</Text>
        </Pressable>
      </View>
    );
  }

  const location = order.location ?? '—';
  const dateLabel = order.dateLabel ?? '—';
  const vendorName = order.vendor ?? order.customer ?? '—';

  const closeActions = () => setActionsOpen(false);

  const onCancelOrder = () => {
    closeActions();
    Alert.alert(
      'Cancel order',
      `Request cancellation for ${order.id}?`,
      [
        { text: 'Not now', style: 'cancel' },
        {
          text: 'Request cancel',
          style: 'destructive',
          onPress: () =>
            Alert.alert('Request sent', 'We will notify you when this is processed.'),
        },
      ],
    );
  };

  const onCreateDispute = () => {
    closeActions();
    Alert.alert(
      'Create dispute',
      'Open a dispute for this order?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            navigateToDisputesListFromOrder(navigation);
          },
        },
      ],
    );
  };

  const onChatVendor = () => {
    closeActions();
    Alert.alert('Chat vendor', 'Messaging will open here when connected.');
  };

  return (
    <View style={[styles.root, styles.rootContentPad]}>
      <Modal
        visible={actionsOpen}
        transparent
        animationType="slide"
        onRequestClose={closeActions}
      >
        <View style={styles.actionModalRoot}>
          <Pressable
            style={styles.actionModalDismiss}
            onPress={closeActions}
            accessibilityRole="button"
            accessibilityLabel="Dismiss"
          />
          <View
            style={[
              styles.actionSheet,
              { paddingBottom: Math.max(insets.bottom, 16) + 8 },
            ]}
          >
            <View style={styles.actionSheetHandle} />
            <Text style={styles.actionSheetTitle}>Order actions</Text>

            <Pressable
              style={({ pressed }) => [styles.actionRow, pressed && styles.actionRowPressed]}
              onPress={onCancelOrder}
            >
              <Icon name="close-circle-outline" size={22} color="#C62828" />
              <Text style={styles.actionRowLabelDestructive}>Cancel order</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.actionRow, pressed && styles.actionRowPressed]}
              onPress={onCreateDispute}
            >
              <Icon name="alert-circle-outline" size={22} color={BLACK} />
              <Text style={styles.actionRowLabel}>Create dispute</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.actionRow, pressed && styles.actionRowPressed]}
              onPress={onChatVendor}
            >
              <Icon name="chatbubble-ellipses-outline" size={22} color={BLACK} />
              <Text style={styles.actionRowLabel}>Chat vendor</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.actionDismissRow, pressed && styles.actionRowPressed]}
              onPress={closeActions}
            >
              <Text style={styles.actionDismissText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* <Pressable
          style={({ pressed }) => [styles.backPill, pressed && styles.backPillPressed]}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Back to orders"
        >
          <Icon name="chevron-back" size={18} color={BLACK} />
          <Text style={styles.backPillText}>Back to Orders</Text>
        </Pressable> */}

        <View style={styles.card}>
          <Text style={styles.orderId}>{order.id}</Text>

          <SummaryRow label="Vendor" value={vendorName} />
          <SummaryRow label="Location" value={location} />
          <SummaryRow label="Date" value={dateLabel} />
          <SummaryRow label="Total Items" value={String(order.items)} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Value</Text>
            <Text style={styles.totalValue}>{formatNaira(order.valueRupees)}</Text>
          </View>
        </View>

        <View style={[styles.card, styles.cardSpaced]}>
          <Text style={styles.timelineHeading}>Order Timeline</Text>
          <OrderTimeline steps={timeline} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  rootContentPad: {
    paddingTop: 15,
  },
  headerTools: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 4,
  },
  headerEllipsis: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionModalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  actionModalDismiss: {
    flex: 1,
  },
  actionSheet: {
    backgroundColor: WHITE,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 8,
    paddingTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: { elevation: 16 },
    }),
  },
  actionSheetHandle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 5,
    backgroundColor: '#D8D8D8',
    marginBottom: 12,
  },
  actionSheetTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 5,
  },
  actionRowPressed: {
    backgroundColor: '#F5F5F5',
  },
  actionRowLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: BLACK,
  },
  actionRowLabelDestructive: {
    fontSize: 16,
    fontWeight: '600',
    color: '#C62828',
  },
  actionDismissRow: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 4,
  },
  actionDismissText: {
    fontSize: 16,
    fontWeight: '600',
    color: MUTED,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  empty: {
    flex: 1,
    backgroundColor: PAGE_BG,
    paddingHorizontal: 20,
    alignItems: 'flex-start',
  },
  muted: {
    color: MUTED,
    fontSize: 16,
    marginBottom: 16,
  },
  backPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: WHITE,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 5,
    marginBottom: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E8E8E8',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
      },
      android: { elevation: 1 },
    }),
  },
  backPillPressed: {
    opacity: 0.88,
  },
  backPillText: {
    fontSize: 15,
    fontWeight: '600',
    color: BLACK,
  },
  card: {
    backgroundColor: WHITE,
    borderRadius: 5,
    padding: 18,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: { elevation: 2 },
    }),
  },
  cardSpaced: {
    marginTop: 14,
  },
  orderId: {
    fontSize: 22,
    fontWeight: '700',
    color: BLACK,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEEEEE',
  },
  summaryLabel: {
    fontSize: 15,
    color: MUTED,
    flex: 1,
    paddingRight: 12,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '500',
    color: BLACK,
    flexShrink: 0,
    textAlign: 'right',
    maxWidth: '58%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: BLACK,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: LIME,
  },
  timelineHeading: {
    fontSize: 17,
    fontWeight: '700',
    color: BLACK,
    marginBottom: 14,
  },
  timelineWrap: {
    paddingTop: 4,
  },
  tlRow: {
    flexDirection: 'row',
    minHeight: 56,
  },
  tlTrack: {
    width: 28,
    alignItems: 'center',
    marginRight: 12,
  },
  tlDotOuter: {
    width: 16,
    height: 16,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  tlDotOuterDone: {
    backgroundColor: LIME,
  },
  tlDotOuterPending: {
    backgroundColor: DOT_PENDING,
    borderWidth: 2,
    borderColor: '#C8C8C8',
  },
  tlDotInner: {
    width: 5,
    height: 5,
    borderRadius: 5,
    backgroundColor: WHITE,
  },
  tlConnector: {
    width: 2,
    flex: 1,
    minHeight: 28,
    marginTop: 2,
    marginBottom: -2,
  },
  tlConnectorDone: {
    backgroundColor: LINE_DONE,
  },
  tlConnectorPending: {
    backgroundColor: LINE_PENDING,
  },
  tlBody: {
    flex: 1,
    paddingBottom: 8,
  },
  tlTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: BLACK,
  },
  tlTime: {
    fontSize: 13,
    color: MUTED,
    marginTop: 4,
  },
});
