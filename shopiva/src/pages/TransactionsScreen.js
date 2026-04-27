import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BRAND = '#E85D04';
const BG = '#F0F1F4';
const CARD = '#FFFFFF';
const TEXT = '#111827';
const MUTED = '#6B7280';
const BORDER = '#E8EAEF';

const SHOPS = ['Lexicon', 'Main store', 'Archive'];

const SUMMARY = {
  spent: '₦40,900.00',
  escrow: '₦5,000.00',
  refund: '₦67,400.00',
  // withdrawal: '₦15,000.00',
};

const MOCK_ROWS = [
  {
    id: '1',
    shop: 'Lexicon',
    date: '2026-03-30',
    type: 'Sale',
    reference: 'ORD-50001',
    amount: '+₦5,000.00',
    positive: true,
    status: 'completed',
  },
  {
    id: '2',
    shop: 'Lexicon',
    date: '2026-03-29',
    type: 'Payout',
    reference: 'PAYOUT-30001',
    amount: '-₦15,000.00',
    positive: false,
    status: 'completed',
  },
  {
    id: '3',
    shop: 'Lexicon',
    date: '2026-03-28',
    type: 'Refund',
    reference: 'REFUND-20001',
    amount: '-₦1,200.00',
    positive: false,
    status: 'pending',
  },
  {
    id: '4',
    shop: 'Lexicon',
    date: '2026-03-27',
    type: 'Sale',
    reference: 'ORD-49988',
    amount: '+₦12,400.00',
    positive: true,
    status: 'completed',
  },
  {
    id: '5',
    shop: 'Lexicon',
    date: '2026-03-26',
    type: 'Sale',
    reference: 'ORD-49970',
    amount: '+₦3,250.00',
    positive: true,
    status: 'pending',
  },
];

function SummaryCard({ label, value }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

function StatusBadge({ status }) {
  const pending = status === 'pending';
  return (
    <View style={[styles.badge, pending ? styles.badgePending : styles.badgeCompleted]}>
      <Text style={[styles.badgeText, pending ? styles.badgeTextPending : styles.badgeTextCompleted]}>
        {pending ? 'Pending' : 'Completed'}
      </Text>
    </View>
  );
}

function typeIcon(type) {
  const t = String(type || '').toLowerCase();
  if (t === 'payout') return { name: 'arrow-up-circle-outline', color: '#7C3AED' };
  if (t === 'refund') return { name: 'return-down-back-outline', color: '#DC2626' };
  return { name: 'cart-outline', color: '#059669' };
}

/**
 * Transactions — summary cards + activity cards (vendor & customer tabs).
 */
export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const [shopModalOpen, setShopModalOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState(SHOPS[0]);
  const [actionRow, setActionRow] = useState(/** @type {(typeof MOCK_ROWS)[number] | null} */ (null));

  const filteredRows = useMemo(
    () => MOCK_ROWS.filter((r) => r.shop === selectedShop),
    [selectedShop],
  );

  const closeActions = useCallback(() => setActionRow(null), []);

  const onRowMenu = useCallback((row) => setActionRow(row), []);

  const onEditTransaction = useCallback(() => {
    if (!actionRow) return;
    const row = actionRow;
    closeActions();
    Alert.alert(row.reference, 'Open transaction detail or edit memo when your API is ready.');
  }, [actionRow, closeActions]);

  const onDeleteTransaction = useCallback(() => {
    if (!actionRow) return;
    const row = actionRow;
    closeActions();
    Alert.alert(
      'Remove from list',
      `Hide “${row.reference}” from this view?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => Alert.alert('Removed', 'Wire to your ledger API when ready.'),
        },
      ],
    );
  }, [actionRow, closeActions]);

  return (
    <View style={[styles.root, { paddingTop: 0 }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 28 }]}
      >
        {/* <Text style={styles.pageIntro}>Track your sales, payouts and refunds in one place.</Text> */}

        {/* <Pressable
          style={({ pressed }) => [styles.shopFilterRow, pressed && styles.pressedOpacity]}
          onPress={() => setShopModalOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Change shop"
        >
          <Icon name="storefront-outline" size={18} color={MUTED} />
          <Text style={styles.shopFilterText} numberOfLines={1}>
            Shop: {selectedShop}
          </Text>
          <Icon name="chevron-down" size={18} color={MUTED} />
        </Pressable> */}

        <Text style={styles.sectionLabel}>Overview</Text>
        <View style={styles.summaryGrid}>
          <SummaryCard label="Total spent" value={SUMMARY.spent} />
          <SummaryCard label="Pending escrow" value={SUMMARY.escrow} />
          <SummaryCard label="Total refunds" value={SUMMARY.refund} />
          {/* <SummaryCard label="Total withdrawal" value={SUMMARY.withdrawal} /> */}
        </View>

        <Text style={styles.sectionLabel}>Activity</Text>
        <Text style={styles.listMetaOnly}>
          {filteredRows.length} {filteredRows.length === 1 ? 'entry' : 'entries'} · {selectedShop}
        </Text>

        {filteredRows.map((row) => {
          const icon = typeIcon(row.type);
          const openCard = () =>
            Alert.alert(row.reference, `${row.type} · ${row.date}\n${row.amount}`);
          return (
            <View key={row.id} style={styles.txCard}>
              <View style={styles.txTop}>
                <Pressable
                  style={({ pressed }) => [styles.txMainPress, pressed && styles.pressedOpacity]}
                  onPress={openCard}
                  android_ripple={{ color: '#F3F4F6' }}
                >
                  <View style={[styles.txIconWrap, { backgroundColor: `${icon.color}18` }]}>
                    <Icon name={icon.name} size={22} color={icon.color} />
                  </View>
                  <View style={styles.txBody}>
                    <Text style={styles.txType}>{row.type}</Text>
                    <Text style={styles.txRef} numberOfLines={1}>
                      {row.reference}
                    </Text>
                    <Text style={styles.txDate}>{row.date}</Text>
                  </View>
                </Pressable>
                {/* <TouchableOpacity
                  style={styles.txMenuBtn}
                  onPress={() => onRowMenu(row)}
                  hitSlop={10}
                  accessibilityLabel="Transaction actions"
                >
                  <Icon name="ellipsis-horizontal" size={22} color="#6B7280" />
                </TouchableOpacity> */}
              </View>

              <Pressable
                style={({ pressed }) => [styles.txFooterPress, pressed && styles.pressedOpacity]}
                onPress={openCard}
                android_ripple={{ color: '#F3F4F6' }}
              >
                <Text style={[styles.txAmount, row.positive ? styles.amountPos : styles.amountNeg]}>{row.amount}</Text>
                <StatusBadge status={row.status} />
              </Pressable>
            </View>
          );
        })}
      </ScrollView>

      <Modal
        visible={shopModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setShopModalOpen(false)}
      >
        <Pressable style={styles.modalRoot} onPress={() => setShopModalOpen(false)}>
          <View style={[styles.modalSheet, { paddingBottom: Math.max(insets.bottom, 20) + 8 }]}>
            <Text style={styles.modalTitle}>Shop</Text>
            <Text style={styles.modalHint}>Show transactions for</Text>
            {SHOPS.map((name) => {
              const selected = name === selectedShop;
              return (
                <Pressable
                  key={name}
                  style={({ pressed }) => [
                    styles.modalRow,
                    selected && styles.modalRowSelected,
                    pressed && styles.modalRowPressed,
                  ]}
                  onPress={() => {
                    setSelectedShop(name);
                    setShopModalOpen(false);
                  }}
                >
                  <Icon name="storefront-outline" size={20} color={selected ? BRAND : MUTED} style={styles.modalRowIcon} />
                  <Text style={[styles.modalRowText, selected && styles.modalRowTextSelected]}>{name}</Text>
                  {selected ? <Icon name="checkmark-circle" size={22} color={BRAND} /> : <View style={styles.modalCheckSpacer} />}
                </Pressable>
              );
            })}
            <TouchableOpacity style={styles.modalClose} onPress={() => setShopModalOpen(false)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <Modal visible={actionRow != null} transparent animationType="slide" onRequestClose={closeActions}>
        <View style={styles.actionSheetModalRoot}>
          <Pressable style={styles.actionSheetBackdrop} onPress={closeActions} accessibilityLabel="Dismiss" />
          <View style={[styles.actionSheet, { paddingBottom: Math.max(insets.bottom, 20) + 12 }]}>
            <View style={styles.actionSheetHandle} />
            <Text style={styles.actionSheetTitle} numberOfLines={2}>
              {actionRow?.type ?? 'Transaction'}
            </Text>
            <Text style={styles.actionSheetSub} numberOfLines={1}>
              {actionRow?.reference ?? '—'}
            </Text>
            <Pressable
              style={({ pressed }) => [styles.actionSheetRow, pressed && styles.modalRowPressed]}
              onPress={onEditTransaction}
              accessibilityRole="button"
              accessibilityLabel="Edit"
            >
              <Icon name="create-outline" size={22} color={TEXT} style={styles.actionSheetRowIcon} />
              <Text style={styles.actionSheetRowLabel}>Edit</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.actionSheetRow, pressed && styles.modalRowPressed]}
              onPress={onDeleteTransaction}
              accessibilityRole="button"
              accessibilityLabel="Delete"
            >
              <Icon name="trash-outline" size={22} color="#B91C1C" style={styles.actionSheetRowIcon} />
              <Text style={styles.actionSheetRowLabelDanger}>Delete</Text>
            </Pressable>
            <TouchableOpacity style={styles.actionSheetCancel} onPress={closeActions} activeOpacity={0.85}>
              <Text style={styles.actionSheetCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const cardShadow = Platform.select({
  ios: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  android: { elevation: 2 },
  default: {},
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  pageIntro: {
    fontSize: 15,
    color: MUTED,
    lineHeight: 22,
    marginBottom: 16,
  },
  shopFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 20,
    backgroundColor: CARD,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    maxWidth: '100%',
  },
  shopFilterText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: TEXT,
    minWidth: 0,
  },
  pressedOpacity: { opacity: 0.92 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 10,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 0,
  },
  summaryCard: {
    width: '48%',
    marginBottom: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: CARD,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ECEEF2',
    ...cardShadow,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '800',
    color: TEXT,
    letterSpacing: -0.2,
  },
  listMetaOnly: {
    fontSize: 13,
    fontWeight: '600',
    color: MUTED,
    marginBottom: 14,
  },
  txCard: {
    backgroundColor: CARD,
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ECEEF2',
    ...cardShadow,
  },
  txTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  txMainPress: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    minWidth: 0,
    marginRight: 4,
    borderRadius: 10,
    paddingVertical: 2,
    paddingRight: 4,
  },
  txIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txBody: { flex: 1, minWidth: 0 },
  txType: { fontSize: 16, fontWeight: '800', color: TEXT },
  txRef: { marginTop: 4, fontSize: 14, fontWeight: '600', color: MUTED },
  txDate: { marginTop: 2, fontSize: 12, fontWeight: '600', color: '#9CA3AF' },
  txMenuBtn: { padding: 4, marginTop: -2, marginRight: -4 },
  txFooterPress: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F0F1F4',
    marginHorizontal: -4,
    paddingHorizontal: 4,
    borderRadius: 10,
  },
  txAmount: {
    fontSize: 17,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  amountPos: { color: '#16A34A' },
  amountNeg: { color: '#DC2626' },
  badge: {
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  badgeCompleted: { backgroundColor: '#ECFDF5' },
  badgePending: { backgroundColor: '#FFFBEB' },
  badgeText: { fontSize: 12, fontWeight: '700' },
  badgeTextCompleted: { color: '#166534' },
  badgeTextPending: { color: '#B45309' },
  modalRoot: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: CARD,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  modalTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  modalHint: { fontSize: 15, fontWeight: '700', color: TEXT, marginBottom: 16 },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderRadius: 10,
    marginBottom: 4,
  },
  modalRowPressed: { backgroundColor: '#F9FAFB' },
  modalRowSelected: { backgroundColor: '#FFF7ED' },
  modalRowIcon: { marginRight: 12 },
  modalRowText: { flex: 1, fontSize: 16, fontWeight: '600', color: TEXT },
  modalRowTextSelected: { color: BRAND },
  modalCheckSpacer: { width: 22, height: 22 },
  modalClose: { alignItems: 'center', paddingVertical: 14, marginTop: 4 },
  modalCloseText: { fontSize: 16, fontWeight: '700', color: MUTED },
  actionSheetModalRoot: { flex: 1, justifyContent: 'flex-end' },
  actionSheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  actionSheet: {
    backgroundColor: CARD,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  actionSheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 10,
    backgroundColor: '#D1D5DB',
    marginBottom: 12,
  },
  actionSheetTitle: { fontSize: 17, fontWeight: '800', color: TEXT, marginBottom: 4, lineHeight: 24 },
  actionSheetSub: { fontSize: 13, color: MUTED, fontWeight: '600', marginBottom: 8 },
  actionSheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderRadius: 10,
    marginBottom: 4,
  },
  actionSheetRowIcon: { marginRight: 14 },
  actionSheetRowLabel: { fontSize: 17, fontWeight: '600', color: TEXT },
  actionSheetRowLabelDanger: { fontSize: 17, fontWeight: '600', color: '#B91C1C' },
  actionSheetCancel: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER,
  },
  actionSheetCancelText: { fontSize: 17, fontWeight: '700', color: MUTED },
});
