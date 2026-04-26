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
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BRAND = '#E85D04';
const BG = '#F0F1F4';
const CARD = '#FFFFFF';
const TEXT = '#111827';
const MUTED = '#6B7280';
const BORDER = '#E8EAEF';

const SHOPS = ['Lexicon', 'Main store', 'Archive'];

const MOCK_ROWS = [
  {
    id: '154',
    product: 'Sports watch',
    shop: 'Lexicon',
    variantCount: 1,
    sku: 'SEED-S1-P154',
    price: '6000.00',
    currency: 'NGN',
    stock: 16,
    reserved: 0,
    low_stock: 5,
    active: 'true',
    created: '1w ago',
    updated: '1w ago',
  },
  {
    id: '161',
    product: 'Chino trousers',
    shop: 'Lexicon',
    variantCount: 80,
    sku: '—',
    price: '4811.00',
    currency: 'NGN',
    stock: 29,
    reserved: 0,
    low_stock: 5,
    active: 'true',
    created: '1w ago',
    updated: '1w ago',
  },
  {
    id: '158',
    product: 'Canvas sneakers',
    shop: 'Lexicon',
    variantCount: 12,
    sku: 'SEED-S1-P158',
    price: '3200.00',
    currency: 'NGN',
    stock: 8,
    reserved: 0,
    low_stock: 5,
    active: 'true',
    created: '1w ago',
    updated: '1w ago',
  },
];

function StatBlock({ label, value }) {
  return (
    <View style={styles.statBlock}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function stockPill(row) {
  const low = Number(row.stock) <= Number(row.low_stock);
  if (low) {
    return { label: 'Low stock', bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' };
  }
  return { label: 'In stock', bg: '#DCFCE7', text: '#166534', border: '#BBF7D0' };
}

function activePill(active) {
  const on = String(active).toLowerCase() === 'true';
  if (on) {
    return { label: 'Active', bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' };
  }
  return { label: 'Inactive', bg: '#F3F4F6', text: '#4B5563', border: '#E5E7EB' };
}

/**
 * Vendor inventory — card layout + row actions (nested under Products tab stack).
 */
export default function VendorInventoryScreen() {
  const navigation = useNavigation();
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

  const onEdit = useCallback(() => {
    if (!actionRow) return;
    const row = actionRow;
    closeActions();
    navigation.navigate('VendorCreateProduct', {
      productId: row.id,
      productTitle: row.product,
      fromInventory: true,
    });
  }, [actionRow, closeActions, navigation]);

  const onDelete = useCallback(() => {
    if (!actionRow) return;
    const row = actionRow;
    closeActions();
    Alert.alert(
      'Remove inventory row',
      `Remove stock row for “${row.product}”?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => Alert.alert('Deleted', 'Wire this action to your inventory API when ready.'),
        },
      ],
    );
  }, [actionRow, closeActions]);

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* <Pressable
          style={({ pressed }) => [styles.shopFilterRow, pressed && styles.cardPressed]}
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

        {filteredRows.length === 0 ? (
          <View style={styles.emptyCard}>
            <Icon name="layers-outline" size={40} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No inventory in this shop</Text>
            <Text style={styles.emptySub}>Switch shop or sync when your API is connected.</Text>
          </View>
        ) : (
          <>
            <Text style={styles.listMetaOnly}>
              {filteredRows.length} {filteredRows.length === 1 ? 'SKU' : 'SKUs'} · {selectedShop}
            </Text>
            {filteredRows.map((row) => {
              const sPill = stockPill(row);
              const aPill = activePill(row.active);
              const priceLabel = `${row.currency} ${row.price}`;
              const openCard = () =>
                Alert.alert(row.product, 'Open inventory detail when wired to API.');
              return (
                <View key={row.id} style={styles.card}>
                  <View style={styles.cardTop}>
                    <Pressable
                      style={({ pressed }) => [styles.cardMainPress, pressed && styles.cardPressed]}
                      onPress={openCard}
                      android_ripple={{ color: '#F3F4F6' }}
                    >
                      <View style={styles.thumb}>
                        <Icon name="cube-outline" size={22} color="#9CA3AF" />
                      </View>
                      <View style={styles.cardTitleBlock}>
                        <Text style={styles.cardTitle} numberOfLines={2}>
                          {row.product}
                        </Text>
                        <Text style={styles.cardSubtitle} numberOfLines={1}>
                          SKU {row.sku} · {row.variantCount} variant{row.variantCount !== 1 ? 's' : ''} ·{' '}
                          {row.shop}
                        </Text>
                      </View>
                    </Pressable>
                    {/* <TouchableOpacity
                      style={styles.cardMenuBtn}
                      onPress={() => onRowMenu(row)}
                      hitSlop={10}
                      accessibilityLabel="Inventory actions"
                    >
                      <Icon name="ellipsis-horizontal" size={22} color="#6B7280" />
                    </TouchableOpacity> */}
                  </View>

                  <Pressable
                    style={({ pressed }) => [styles.cardLowerPress, pressed && styles.cardPressed]}
                    onPress={openCard}
                    android_ripple={{ color: '#F3F4F6' }}
                  >
                    <View style={styles.pillRow}>
                      <View style={[styles.statusPill, { backgroundColor: sPill.bg, borderColor: sPill.border }]}>
                        <Text style={[styles.statusPillText, { color: sPill.text }]}>{sPill.label}</Text>
                      </View>
                      <View style={[styles.statusPill, styles.pillSpacer, { backgroundColor: aPill.bg, borderColor: aPill.border }]}>
                        <Text style={[styles.statusPillText, { color: aPill.text }]}>{aPill.label}</Text>
                      </View>
                    </View>

                    <View style={styles.statsRow}>
                      <StatBlock label="On hand" value={String(row.stock)} />
                      <View style={styles.statDivider} />
                      <StatBlock label="Reserved" value={String(row.reserved)} />
                      <View style={styles.statDivider} />
                      <StatBlock label="Price" value={priceLabel} />
                    </View>
                    <View style={styles.statsRowSecond}>
                      <StatBlock label="Low at" value={String(row.low_stock)} />
                      <View style={styles.statDivider} />
                      <StatBlock label="Updated" value={row.updated} />
                      <View style={styles.statDivider} />
                      <StatBlock label="Created" value={row.created} />
                    </View>
                  </Pressable>
                </View>
              );
            })}
          </>
        )}
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
            <Text style={styles.modalHint}>Show inventory for</Text>
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
              {actionRow?.product ?? 'Item'}
            </Text>
            <Text style={styles.actionSheetSub} numberOfLines={1}>
              SKU {actionRow?.sku ?? '—'}
            </Text>
            <Pressable
              style={({ pressed }) => [styles.actionSheetRow, pressed && styles.modalRowPressed]}
              onPress={onEdit}
              accessibilityRole="button"
              accessibilityLabel="Edit"
            >
              <Icon name="create-outline" size={22} color={TEXT} style={styles.actionSheetRowIcon} />
              <Text style={styles.actionSheetRowLabel}>Edit</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.actionSheetRow, pressed && styles.modalRowPressed]}
              onPress={onDelete}
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
  },
  android: { elevation: 3 },
  default: {},
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 12 },
  shopFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 14,
    backgroundColor: CARD,
    borderRadius: 5,
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
  listMetaOnly: {
    fontSize: 13,
    fontWeight: '600',
    color: MUTED,
    marginBottom: 14,
  },
  card: {
    backgroundColor: CARD,
    borderRadius: 5,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ECEEF2',
    ...cardShadow,
  },
  cardPressed: { opacity: 0.94 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start' },
  cardMainPress: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    minWidth: 0,
    marginRight: 4,
    borderRadius: 5,
    paddingVertical: 2,
    paddingRight: 4,
  },
  cardLowerPress: { borderRadius: 5, marginHorizontal: -4, paddingHorizontal: 4 },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 5,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardTitleBlock: { flex: 1, minWidth: 0, paddingRight: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: TEXT, lineHeight: 22 },
  cardSubtitle: { marginTop: 4, fontSize: 13, color: MUTED, fontWeight: '500' },
  cardMenuBtn: { padding: 4, marginTop: -2, marginRight: -4 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, marginLeft: 66, gap: 8 },
  pillSpacer: { marginLeft: 0 },
  statusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 5,
    borderWidth: 1,
  },
  statusPillText: { fontSize: 12, fontWeight: '700' },
  statsRow: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F1F4',
  },
  statsRowSecond: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F1F4',
  },
  statBlock: { flex: 1, minWidth: 0 },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  statValue: { fontSize: 14, fontWeight: '700', color: TEXT },
  statDivider: { width: 1, backgroundColor: '#ECEEF2', marginHorizontal: 4 },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
    backgroundColor: CARD,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: BORDER,
  },
  emptyTitle: { marginTop: 16, fontSize: 17, fontWeight: '700', color: TEXT, textAlign: 'center' },
  emptySub: { marginTop: 8, fontSize: 14, color: MUTED, textAlign: 'center', lineHeight: 20 },
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
    borderRadius: 5,
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
    borderRadius: 5,
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
    borderRadius: 5,
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
