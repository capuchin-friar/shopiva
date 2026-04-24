import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { ShopOverflowMenu } from '../components/ShopOverflowMenu';
import { getStorefrontProduct } from '../api/storefront';
import { addBuyerCartLine } from '../api/buyer';
import { formatNaira } from '../utils/formatNaira';

const { width: WINDOW_W } = Dimensions.get('window');
const PURPLE = '#6236FF';
const PAD = 16;
const IMG_RADIUS = 14;

/**
 * @param {{ route: { params?: { product?: object; vendor?: { id: number; name?: string; slug?: string }; category?: string } }; navigation: import('@react-navigation/native').NavigationProp<Record<string, object | undefined>> }} props
 */
export default function ProductScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { isAuthenticated, signOut } = useAuth();
  const loggedIn = isAuthenticated;
  const vendor = route.params?.vendor;
  const category = route.params?.category ?? 'fashion';
  const routeProduct = route.params?.product;
  const routeProductId = route.params?.productId;

  const [qty, setQty] = useState(1);
  const [overflowMenuOpen, setOverflowMenuOpen] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [fetched, setFetched] = useState(/** @type {Record<string, unknown> | null} */ (null));
  const [fetchedInventory, setFetchedInventory] = useState(/** @type {unknown[]} */ ([]));
  /* MVP: wishlist / save-for-later disabled
  const [saved, setSaved] = useState(false);
  */

  const shopName = vendor?.name?.trim() || 'Shop';
  const productIdParam = routeProductId ?? routeProduct?.id ?? routeProduct?.key;

  useEffect(() => {
    const pid = productIdParam != null ? String(productIdParam).trim() : '';
    if (!pid || Number.isNaN(Number(pid))) {
      setFetched(null);
      setFetchedInventory([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setDetailLoading(true);
      setDetailError('');
      try {
        const data = await getStorefrontProduct(parseInt(pid, 10));
        if (cancelled) return;
        setFetched(data.product && typeof data.product === 'object' ? data.product : null);
        setFetchedInventory(Array.isArray(data.inventory) ? data.inventory : []);
      } catch (e) {
        if (!cancelled) {
          setDetailError(e instanceof Error ? e.message : String(e));
          setFetched(null);
          setFetchedInventory([]);
        }
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productIdParam]);

  const mergedProduct = useMemo(() => {
    const p = routeProduct || {};
    const d = fetched || {};
    const name = String(d.name ?? p.title ?? 'Product').trim() || 'Product';
    const imgs = Array.isArray(d.images) ? d.images : [];
    const uri =
      (typeof p.uri === 'string' && p.uri.trim() ? p.uri : null) ||
      (typeof imgs[0] === 'string' ? imgs[0] : '') ||
      '';
    const inv0 =
      fetchedInventory[0] && typeof fetchedInventory[0] === 'object'
        ? /** @type {Record<string, unknown>} */ (fetchedInventory[0])
        : null;
    const price =
      inv0 && inv0.price != null
        ? Number(inv0.price)
        : typeof p.priceUsd === 'number'
          ? p.priceUsd
          : 0;
    const currency = String(inv0?.currency ?? p.currency ?? 'NGN').toUpperCase();
    return {
      ...p,
      title: name,
      uri,
      priceUsd: price,
      currency,
      description: typeof d.description === 'string' ? d.description : p.description,
    };
  }, [routeProduct, fetched, fetchedInventory]);

  const product = mergedProduct;
  const firstInventoryId = useMemo(() => {
    const inv0 = fetchedInventory[0];
    if (inv0 && typeof inv0 === 'object' && inv0.id != null) return Number(inv0.id);
    return null;
  }, [fetchedInventory]);

  const title = product?.title || 'Product';
  const priceAmount = typeof product?.priceUsd === 'number' ? product.priceUsd : 0;
  const priceCurrency = String(product?.currency ?? 'NGN').toUpperCase();
  const priceLabel =
    priceCurrency === 'NGN' ? formatNaira(priceAmount) : `US$${priceAmount.toFixed(2)}`;

  const galleryUrls = useMemo(() => {
    const d = fetched || {};
    const imgs = Array.isArray(d.images) ? d.images.filter((x) => typeof x === 'string' && x.trim()) : [];
    if (imgs.length) return imgs.map((x) => String(x).trim());
    const u = typeof product?.uri === 'string' ? product.uri.trim() : '';
    return u ? [u] : [];
  }, [fetched, product?.uri]);

  useEffect(() => {
    setImgIndex(0);
  }, [galleryUrls.length, productIdParam]);

  const bumpQty = useCallback((delta) => {
    setQty((q) => Math.min(99, Math.max(1, q + delta)));
  }, []);

  if (!vendor) {
    return (
      <View style={[styles.fallback, { paddingTop: insets.top + 24 }]}>
        <Text style={styles.fallbackText}>Product unavailable.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.fallbackBtn}>
          <Text style={styles.fallbackBtnText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (detailLoading && !routeProduct?.title) {
    return (
      <View style={[styles.fallback, { paddingTop: insets.top + 24 }]}>
        <ActivityIndicator size="large" color={PURPLE} />
        <Text style={styles.fallbackText}>Loading product…</Text>
      </View>
    );
  }

  if (detailError && !routeProduct?.title) {
    return (
      <View style={[styles.fallback, { paddingTop: insets.top + 24 }]}>
        <Text style={styles.fallbackText}>{detailError}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.fallbackBtn}>
          <Text style={styles.fallbackBtnText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollInner, { paddingBottom: insets.bottom + 88 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.vendorHeader, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerBack}
            hitSlop={{ top: 8, bottom: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Icon name="chevron-back" size={26} color="#000000" />
          </TouchableOpacity>
          <View style={styles.vendorLeft}>
            <View style={styles.vendorAvatar}>
              <Text style={styles.vendorAvatarLetter}>{shopName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.vendorTextCol}>
              <Text style={styles.vendorName} numberOfLines={1}>
                {shopName}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={[styles.headerCartHit, !loggedIn && styles.headerLoginHit]}
            onPress={() => {
              if (loggedIn) {
                navigation.navigate('cart');
              } else {
                void signOut();
              }
            }}
            accessibilityRole="button"
            accessibilityLabel={loggedIn ? 'Open cart' : 'Login'}
          >
            {loggedIn ? (
              <Icon name="cart-outline" size={24} color="#000000" />
            ) : (
              <Text style={styles.headerLoginText}>Login</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.moreHit}
            onPress={() => setOverflowMenuOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Product options"
          >
            <Icon name="ellipsis-vertical" size={22} color="#000000" />
          </TouchableOpacity>
        </View>

        <View style={styles.heroWrap}>
          {galleryUrls.length > 0 ? (
            <>
              <Image
                source={{ uri: galleryUrls[imgIndex % galleryUrls.length] }}
                style={styles.heroImg}
                resizeMode="cover"
              />
              {galleryUrls.length > 1 ? (
                <>
                  <TouchableOpacity
                    style={[styles.heroChevron, styles.heroChevronLeft]}
                    onPress={() =>
                      setImgIndex((i) => (i - 1 + galleryUrls.length) % galleryUrls.length)
                    }
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  >
                    <Icon name="chevron-back" size={28} color="#000000" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.heroChevron, styles.heroChevronRight]}
                    onPress={() => setImgIndex((i) => (i + 1) % galleryUrls.length)}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  >
                    <Icon name="chevron-forward" size={28} color="#000000" />
                  </TouchableOpacity>
                </>
              ) : null}
            </>
          ) : (
            <View style={[styles.heroImg, styles.heroImgPlaceholder]}>
              <Icon name="image-outline" size={56} color="#BDBDBD" />
            </View>
          )}
        </View>

        <View style={styles.titleBlock}>
          <View style={styles.titleRow}>
            <Text style={styles.productTitle} numberOfLines={2}>
              {title}
            </Text>
            <View style={styles.titleActions}>
              {/* MVP: wishlist — disabled
              <TouchableOpacity
                style={styles.iconCircle}
                onPress={() => setSaved((s) => !s)}
                accessibilityLabel={saved ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Icon name={saved ? 'heart' : 'heart-outline'} size={22} color="#000000" />
              </TouchableOpacity>
              */}
              <TouchableOpacity style={styles.iconCircle} accessibilityLabel="Share">
                <Icon name="share-outline" size={22} color="#000000" />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.price}>{priceLabel}</Text>
        </View>

        <Text style={styles.quantityLabel}>Quantity</Text>
        <View style={styles.qtyPill}>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => bumpQty(-1)} hitSlop={{ top: 8, bottom: 8 }}>
            <Icon name="remove" size={22} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.qtyValue}>{qty}</Text>
          <TouchableOpacity style={styles.qtyBtn} onPress={() => bumpQty(1)} hitSlop={{ top: 8, bottom: 8 }}>
            <Icon name="add" size={22} color="#000000" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.addCart}
          activeOpacity={0.9}
          onPress={async () => {
            if (firstInventoryId == null) {
              Alert.alert('Cart', 'This product has no purchasable variant in stock yet.');
              return;
            }
            try {
              await addBuyerCartLine(firstInventoryId, qty);
              Alert.alert('Cart', 'Added to your cart.', [
                { text: 'Continue', style: 'cancel' },
                { text: 'View cart', onPress: () => navigation.navigate('cart') },
              ]);
            } catch (e) {
              const msg = e instanceof Error ? e.message : String(e);
              if (msg.toLowerCase().includes('unauthorized') || msg.includes('401')) {
                Alert.alert('Sign in required', 'Please sign in to add items to your cart.');
              } else {
                Alert.alert('Cart', msg);
              }
            }
          }}
        >
          <Text style={styles.addCartText}>Add to cart</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buyNow} activeOpacity={0.9}>
          <Text style={styles.buyNowText}>Buy now</Text>
          <Icon name="open-outline" size={22} color="#000000" style={styles.buyNowIcon} />
        </TouchableOpacity>

        <Text style={styles.sectionHeading}>Description</Text>
        <Text style={styles.descriptionBody}>
          {typeof product?.description === 'string' && product.description.trim()
            ? product.description.trim()
            : 'No description provided for this product.'}
        </Text>
        <TouchableOpacity style={styles.visitPill} activeOpacity={0.88}>
          <Icon name="link-outline" size={18} color="#000000" />
          <Text style={styles.visitPillText}>{`Visit ${shopName}`}</Text>
        </TouchableOpacity>

        <Text style={[styles.sectionHeading, styles.sectionSpacer]}>Delivery & Returns</Text>
        <View style={styles.policyRow}>
          <TouchableOpacity style={styles.policyHalf} activeOpacity={0.88}>
            <Text style={styles.policyHalfText}>Return Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.policyHalf} activeOpacity={0.88}>
            <Text style={styles.policyHalfText}>Shipping policy</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ShopOverflowMenu
        visible={overflowMenuOpen}
        onClose={() => setOverflowMenuOpen(false)}
        title={title}
        subtitle={`${priceLabel} · ${shopName}`}
        headerImageUri={galleryUrls[0] || (typeof product?.uri === 'string' ? product.uri.trim() : '')}
        fallbackLetter={title.charAt(0).toUpperCase() || 'P'}
        onVisitShop={() => {
          setOverflowMenuOpen(false);
          navigation.navigate('vendor', { vendor, category });
        }}
        onFollow={() => {
          setOverflowMenuOpen(false);
          Alert.alert('Shopiva', 'Following shops will be available in a future update.');
        }}
        onNotInterested={() => {
          setOverflowMenuOpen(false);
          Alert.alert('Thanks', 'We will tune your recommendations over time.');
        }}
        onReport={() => {
          setOverflowMenuOpen(false);
          Alert.alert('Report product', 'Thanks for the report. Our team will review it.');
        }}
        reportLabel="Report product"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  scrollInner: {
    paddingHorizontal: PAD,
  },
  vendorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerBack: {
    width: 40,
    height: 44,
    justifyContent: 'center',
    marginRight: 4,
    marginLeft: -4,
  },
  vendorLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },
  vendorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFEFEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vendorAvatarLetter: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  vendorTextCol: {
    flex: 1,
    marginLeft: 12,
  },
  vendorName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111',
  },
  vendorRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  vendorRatingNum: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
  },
  vendorStar: {
    marginLeft: 4,
  },
  vendorRatingParen: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  headerCartHit: {
    padding: 4,
    marginRight: 4,
  },
  headerLoginHit: {
    borderRadius: 16,
    backgroundColor: '#00926e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  headerLoginText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  moreHit: {
    padding: 4,
  },
  heroWrap: {
    width: WINDOW_W - PAD * 2,
    alignSelf: 'center',
    borderRadius: IMG_RADIUS,
    overflow: 'hidden',
    aspectRatio: 1,
    backgroundColor: '#F5F5F5',
    marginBottom: 16,
  },
  heroImg: {
    width: '100%',
    height: '100%',
  },
  heroImgPlaceholder: {
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroChevron: {
    position: 'absolute',
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroChevronLeft: {
    left: 8,
  },
  heroChevronRight: {
    right: 8,
  },
  titleBlock: {
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  productTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    lineHeight: 26,
    paddingRight: 8,
  },
  titleActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 2,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#D8D8D8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleGap: {
    marginLeft: 10,
  },
  ratingLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingsLabel: {
    marginLeft: 10,
    fontSize: 14,
    color: '#555',
  },
  socialPill: {
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#EFEFEF',
  },
  socialPillText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  price: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111',
    marginTop: 14,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginTop: 20,
    marginBottom: 10,
  },
  qtyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 28,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginBottom: 16,
    backgroundColor: '#FAFAFA',
  },
  qtyBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    minWidth: 32,
    textAlign: 'center',
  },
  addCart: {
    backgroundColor: PURPLE,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    marginBottom: 12,
  },
  addCartText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  buyNow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111111',
    paddingVertical: 16,
    borderRadius: 28,
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
  sectionHeading: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111',
    marginBottom: 10,
  },
  sectionSpacer: {
    marginTop: 8,
  },
  descriptionBody: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
    marginBottom: 14,
  },
  visitPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#F2F2F2',
    marginBottom: 8,
  },
  visitPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginLeft: 8,
  },
  reviewsSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  bigRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bigRating: {
    fontSize: 36,
    fontWeight: '800',
    color: '#111',
  },
  bigRatingStarIcon: {
    marginLeft: 6,
    marginTop: 2,
  },
  reviewCountMuted: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  histoWrap: {
    flex: 1,
    maxWidth: WINDOW_W * 0.48,
    marginLeft: 8,
  },
  histoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  histoLabel: {
    width: 14,
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginRight: 6,
  },
  histoTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EEEEEE',
    overflow: 'hidden',
  },
  histoFill: {
    height: '100%',
    backgroundColor: '#C4C4C4',
    borderRadius: 4,
  },
  reviewCard: {
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#FAFAFA',
    marginBottom: 12,
  },
  reviewCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  reviewCardBody: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 10,
  },
  reviewMeta: {
    fontSize: 13,
    color: '#999',
    marginTop: 8,
  },
  viewAllPill: {
    backgroundColor: '#F2F2F2',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  viewAllText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  policyRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  policyHalf: {
    flex: 1,
    backgroundColor: '#F2F2F2',
    paddingVertical: 14,
    borderRadius: 22,
    alignItems: 'center',
  },
  policyHalfText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  fallback: {
    flex: 1,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  fallbackText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  fallbackBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: PURPLE,
  },
  fallbackBtnText: {
    color: '#FFF',
    fontWeight: '700',
  },
});
