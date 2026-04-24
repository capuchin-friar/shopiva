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

const MOCK_ROWS = [
  {
    id: '1',
    title: 'Crossbody bag',
    shop: 'Lexicon',
    variantCount: 2,
    status: 'draft',
    sales: 0,
    revenue: '₦0',
    created: '15 Apr 2026',
  },
  {
    id: '2',
    title: 'Polo top',
    shop: 'Lexicon',
    variantCount: 6,
    status: 'active',
    sales: 24,
    revenue: '₦182,400',
    created: '12 Apr 2026',
  },
  {
    id: '3',
    title: 'UV sunglasses',
    shop: 'Lexicon',
    variantCount: 4,
    status: 'draft',
    sales: 0,
    revenue: '₦0',
    created: '10 Apr 2026',
  },
];

const SHOPS = ['Lexicon', 'Main store', 'Archive'];

/** @param {string} status */
function statusPillStyle(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'active' || s === 'published') {
    return { bg: '#DCFCE7', text: '#166534', border: '#BBF7D0' };
  }
  if (s === 'archived' || s === 'paused') {
    return { bg: '#F3F4F6', text: '#4B5563', border: '#E5E7EB' };
  }
  return { bg: '#FFF7ED', text: '#9A3412', border: '#FED7AA' };
}

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

/**
 * Vendor product catalog (nested under Products tab stack).
 * Card layout reads clearly on phones; avoids cramped horizontal tables.
 */
export default function VendorProductListScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [shopModalOpen, setShopModalOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState(SHOPS[0]);
  const [actionSheetProduct, setActionSheetProduct] = useState(
    /** @type {(typeof MOCK_ROWS)[number] | null} */ (null),
  );

  const filteredRows = useMemo(
    () => MOCK_ROWS.filter((r) => r.shop === selectedShop),
    [selectedShop],
  );

  const onAddProduct = useCallback(() => {
    navigation.navigate('VendorCreateProduct');
  }, [navigation]);

  const closeProductActions = useCallback(() => {
    setActionSheetProduct(null);
  }, []);

  const onRowMenu = useCallback((row) => {
    setActionSheetProduct(row);
  }, []);

  const onEditProduct = useCallback(() => {
    if (!actionSheetProduct) return;
    const row = actionSheetProduct;
    closeProductActions();
    navigation.navigate('VendorCreateProduct', {
      productId: row.id,
      productTitle: row.title,
    });
  }, [actionSheetProduct, closeProductActions, navigation]);

  const onDeleteProduct = useCallback(() => {
    if (!actionSheetProduct) return;
    const row = actionSheetProduct;
    closeProductActions();
    Alert.alert(
      'Delete product',
      `Remove “${row.title}”? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Deleted', 'Wire this action to your product API when ready.');
          },
        },
      ],
    );
  }, [actionSheetProduct, closeProductActions]);

  return (
    <View style={styles.root}>
      {/* <View style={styles.toolbar}>
        <Pressable
          style={({ pressed }) => [styles.shopPill, pressed && styles.shopPillPressed]}
          onPress={() => setShopModalOpen(true)}
        >
          <Icon name="storefront-outline" size={18} color={MUTED} />
          <Text style={styles.shopPillText} numberOfLines={1}>
            {selectedShop}
          </Text>
          <Icon name="chevron-down" size={16} color={MUTED} />
        </Pressable>
        <TouchableOpacity style={styles.primaryBtn} onPress={onAddProduct} activeOpacity={0.88}>
          <Icon name="add-circle-outline" size={20} color="#FFFFFF" style={styles.primaryBtnIcon} />
          <Text style={styles.primaryBtnText}>Add product</Text>
        </TouchableOpacity>
      </View> */}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
      >
        {filteredRows.length === 0 ? (
          <View style={styles.emptyCard}>
            <Icon name="cube-outline" size={40} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No products in this shop</Text>
            <Text style={styles.emptySub}>Switch shop or add your first product.</Text>
            <TouchableOpacity style={styles.emptyCta} onPress={onAddProduct} activeOpacity={0.88}>
              <Text style={styles.emptyCtaText}>Add product</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.listMetaOnly}>
              {filteredRows.length} {filteredRows.length === 1 ? 'item' : 'items'} · {selectedShop}
            </Text>
            {filteredRows.map((row) => {
            const pill = statusPillStyle(row.status);
            const openCard = () =>
              Alert.alert(row.title, 'Open product editor when wired to API.');
            return (
              <View key={row.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <Pressable
                    style={({ pressed }) => [styles.cardMainPress, pressed && styles.cardPressed]}
                    onPress={openCard}
                    android_ripple={{ color: '#F3F4F6' }}
                  >
                    <View style={styles.thumb}>
                      <Icon name="image-outline" size={22} color="#9CA3AF" />
                    </View>
                    <View style={styles.cardTitleBlock}>
                      <Text style={styles.cardTitle} numberOfLines={2}>
                        {row.title}
                      </Text>
                      <Text style={styles.cardSubtitle} numberOfLines={1}>
                        {row.variantCount} variant{row.variantCount !== 1 ? 's' : ''} · {row.shop}
                      </Text>
                    </View>
                  </Pressable>
                  <TouchableOpacity
                    style={styles.cardMenuBtn}
                    onPress={() => onRowMenu(row)}
                    hitSlop={10}
                    accessibilityLabel="Product actions"
                  >
                    <Icon name="ellipsis-horizontal" size={22} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                <Pressable
                  style={({ pressed }) => [styles.cardLowerPress, pressed && styles.cardPressed]}
                  onPress={openCard}
                  android_ripple={{ color: '#F3F4F6' }}
                >
                  <View style={styles.pillRow}>
                    <View style={[styles.statusPill, { backgroundColor: pill.bg, borderColor: pill.border }]}>
                      <Text style={[styles.statusPillText, { color: pill.text }]}>{String(row.status)}</Text>
                    </View>
                  </View>

                  <View style={styles.statsRow}>
                    <StatBlock label="Sales" value={String(row.sales)} />
                    <View style={styles.statDivider} />
                    <StatBlock label="Revenue" value={row.revenue} />
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
            <Text style={styles.modalHint}>Show catalog for</Text>
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
                  <Icon
                    name="storefront-outline"
                    size={20}
                    color={selected ? BRAND : MUTED}
                    style={styles.modalRowIcon}
                  />
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

      <Modal
        visible={actionSheetProduct != null}
        transparent
        animationType="slide"
        onRequestClose={closeProductActions}
      >
        <View style={styles.actionSheetModalRoot}>
          <Pressable
            style={styles.actionSheetBackdrop}
            onPress={closeProductActions}
            accessibilityRole="button"
            accessibilityLabel="Dismiss"
          />
          <View style={[styles.actionSheet, { paddingBottom: Math.max(insets.bottom, 20) + 12 }]}>
            <View style={styles.actionSheetHandle} />
            <Text style={styles.actionSheetTitle} numberOfLines={2}>
              {actionSheetProduct?.title ?? 'Product'}
            </Text>
            <Pressable
              style={({ pressed }) => [styles.actionSheetRow, pressed && styles.modalRowPressed]}
              onPress={onEditProduct}
              accessibilityRole="button"
              accessibilityLabel="Edit product"
            >
              <Icon name="create-outline" size={22} color={TEXT} style={styles.actionSheetRowIcon} />
              <Text style={styles.actionSheetRowLabel}>Edit</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.actionSheetRow, pressed && styles.modalRowPressed]}
              onPress={onDeleteProduct}
              accessibilityRole="button"
              accessibilityLabel="Delete product"
            >
              <Icon name="trash-outline" size={22} color="#B91C1C" style={styles.actionSheetRowIcon} />
              <Text style={styles.actionSheetRowLabelDanger}>Delete</Text>
            </Pressable>
            <TouchableOpacity style={styles.actionSheetCancel} onPress={closeProductActions} activeOpacity={0.85}>
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
  root: {
    flex: 1,
    backgroundColor: BG,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: CARD,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  shopPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: '58%',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#FAFBFC',
  },
  shopPillPressed: {
    backgroundColor: '#F3F4F6',
  },
  shopPillText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: TEXT,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRAND,
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  primaryBtnIcon: {
    marginRight: 6,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
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
  cardPressed: {
    opacity: 0.94,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardMainPress: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    minWidth: 0,
    marginRight: 4,
    borderRadius: 12,
    paddingVertical: 2,
    paddingRight: 4,
  },
  cardLowerPress: {
    borderRadius: 12,
    marginHorizontal: -4,
    paddingHorizontal: 4,
  },
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
  cardTitleBlock: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT,
    lineHeight: 22,
  },
  cardSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: MUTED,
    fontWeight: '500',
  },
  cardMenuBtn: {
    padding: 4,
    marginTop: -2,
    marginRight: -4,
  },
  pillRow: {
    flexDirection: 'row',
    marginTop: 12,
    marginLeft: 66,
  },
  statusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F1F4',
  },
  statBlock: {
    flex: 1,
    minWidth: 0,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: TEXT,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#ECEEF2',
    marginHorizontal: 4,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
    backgroundColor: CARD,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: BORDER,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 17,
    fontWeight: '700',
    color: TEXT,
    textAlign: 'center',
  },
  emptySub: {
    marginTop: 8,
    fontSize: 14,
    color: MUTED,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyCta: {
    marginTop: 20,
    backgroundColor: BRAND,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  emptyCtaText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
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
  modalHint: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 16,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  modalRowPressed: {
    backgroundColor: '#F9FAFB',
  },
  modalRowSelected: {
    backgroundColor: '#FFF7ED',
  },
  modalRowIcon: {
    marginRight: 12,
  },
  modalRowText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: TEXT,
  },
  modalRowTextSelected: {
    color: BRAND,
  },
  modalCheckSpacer: {
    width: 22,
    height: 22,
  },
  modalClose: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 4,
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '700',
    color: MUTED,
  },
  actionSheetModalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
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
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    marginBottom: 16,
  },
  actionSheetTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: TEXT,
    marginBottom: 8,
    lineHeight: 24,
  },
  actionSheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  actionSheetRowIcon: {
    marginRight: 14,
  },
  actionSheetRowLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: TEXT,
  },
  actionSheetRowLabelDanger: {
    fontSize: 17,
    fontWeight: '600',
    color: '#B91C1C',
  },
  actionSheetCancel: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER,
  },
  actionSheetCancelText: {
    fontSize: 17,
    fontWeight: '700',
    color: MUTED,
  },
});
