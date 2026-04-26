import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DocumentPicker from 'react-native-document-picker';
import {
  fetchOwnerShops,
  fetchShopDetails,
  fetchShopOrders,
  updateVendorShop,
  uploadShopVerificationDocument,
  verifyShopBvn,
} from '../api/shop';
import { getProducts } from '../api/product';
import { useProfile } from '../context/ProfileContext';
import { isVendorRole } from '../profile/normalizeUser';
import { mapOrderRowToListItem } from '../utils/buyerUi';
import { formatNaira } from '../utils/formatNaira';
import { getCurrentCoordinates, requestLocationPermission, reverseGeocodeToPlace } from '../utils/deviceLocation';

const BRAND = '#0D4F3C';
const BRAND_LIGHT = '#1A6B52';
const PAGE_BG = '#F4F5F7';
const CARD = '#FFFFFF';
const BLACK = '#111111';
const MUTED = '#6B7280';
const BORDER = '#E8EAEF';
const GREEN_OK = '#16A34A';
const ORANGE_PENDING = '#B45309';

const DEFAULT_LOCATION = {
  address: null,
  city: null,
  state: null,
  country: null,
  zipcode: null,
  coordinates: null,
};

const DEFAULT_SOCIAL = {
  facebook: null,
  instagram: null,
  twitter: null,
  website: null,
  tiktok: null,
};

const DEFAULT_VERIFICATION = {
  businessLicense: { url: null, verified: false, submittedAt: null },
  taxId: { url: null, verified: false, submittedAt: null },
  identityProof: { url: null, verified: false, submittedAt: null },
  idCard: { url: null, verified: false, submittedAt: null },
  proofOfAddress: { url: null, verified: false, submittedAt: null },
  cacDocument: { url: null, verified: false, submittedAt: null },
};

const DAYS = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' },
];

/** @param {unknown} value @param {unknown} fallback */
function parseMaybeJson(value, fallback) {
  if (value == null) return fallback;
  if (typeof value === 'object' && !Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const o = JSON.parse(value);
      return typeof o === 'object' && o != null && !Array.isArray(o) ? o : fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

/** @param {Record<string, unknown>} r */
function pickStr(r, ...keys) {
  for (const k of keys) {
    const v = r[k];
    if (v != null && String(v).trim() !== '') return String(v).trim();
  }
  return '';
}

/** @param {Record<string, unknown> | null | undefined} row */
function shopIdOf(row) {
  if (!row) return 0;
  const v = row.id ?? row.shopid ?? row.shop_id;
  const n = typeof v === 'number' ? v : parseInt(String(v ?? ''), 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** @param {string | undefined} status */
function statusDisplayLabel(status) {
  const s = String(status ?? 'pending_approval').toLowerCase();
  if (s === 'pending_approval') return 'Pending approval';
  if (s === 'active') return 'Active';
  if (s === 'suspended') return 'Suspended';
  if (s === 'closed') return 'Closed';
  return s.replace(/_/g, ' ');
}

function defaultOpeningHours() {
  const o = {};
  for (const { key } of DAYS) {
    o[key] = key === 'sat' || key === 'sun' ? 'Closed' : '09:00–18:00';
  }
  return o;
}

/** @param {unknown} raw */
function parseOpeningHours(raw) {
  const base = defaultOpeningHours();
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) return base;
  const o = /** @type {Record<string, unknown>} */ (raw);
  const out = { ...base };
  for (const { key } of DAYS) {
    if (o[key] != null && String(o[key]).trim() !== '') out[key] = String(o[key]).trim();
  }
  return out;
}

/**
 * @param {Record<string, unknown>} row
 * @param {{
 *   name: string;
 *   slug: string;
 *   description: string;
 *   category: string;
 *   contactEmail: string;
 *   contactPhone: string;
 *   location: Record<string, unknown>;
 * }} form
 */
function buildUpdateBody(row, form, verificationDocumentsOverride) {
  const socialLinks = parseMaybeJson(row.socialLinks ?? row.sociallinks, DEFAULT_SOCIAL);
  const verificationDocuments =
    verificationDocumentsOverride != null
      ? verificationDocumentsOverride
      : { ...DEFAULT_VERIFICATION, ...parseMaybeJson(row.verificationDocuments ?? row.verificationdocuments, {}) };
  const tags = Array.isArray(row.tags) ? row.tags : [];
  const vendorType = String(row.vendortype ?? row.vendorType ?? 'reseller').trim() || 'reseller';
  const isActive = Boolean(row.isactive ?? row.isActive ?? true);
  const isVerified = Boolean(row.isverified ?? row.isVerified ?? false);
  const status = String(row.status ?? 'pending_approval').trim() || 'pending_approval';

  const loc = { ...DEFAULT_LOCATION, ...parseMaybeJson(row.location ?? row.Location, DEFAULT_LOCATION), ...form.location };

  return {
    name: form.name.trim(),
    slug: form.slug.trim().toLowerCase(),
    description: form.description.trim() || null,
    logo: row.logo != null ? String(row.logo) : null,
    banner: row.banner != null ? String(row.banner) : null,
    category: form.category.trim() || null,
    tags,
    contactEmail: form.contactEmail.trim() || null,
    contactPhone: form.contactPhone.trim() || null,
    vendorType,
    location: loc,
    socialLinks,
    isActive,
    isVerified,
    status,
    verificationDocuments,
  };
}

/** @param {{ url?: unknown; verified?: unknown } | null | undefined} doc */
function docVerificationStatus(doc) {
  if (!doc) return { label: 'Not submitted', passed: false, pending: false };
  const v = Boolean(doc.verified);
  const hasUrl = doc.url != null && String(doc.url).trim() !== '';
  if (v) return { label: 'Passed', passed: true, pending: false };
  if (hasUrl) return { label: 'Pending', passed: false, pending: true };
  return { label: 'Not submitted', passed: false, pending: false };
}

/** @param {unknown} bvn */
function bvnVerificationStatus(bvn) {
  if (bvn && typeof bvn === 'object') {
    const o = /** @type {{ verified?: unknown; last4?: unknown; submittedAt?: unknown }} */ (bvn);
    if (o.verified === true) return { label: 'Passed', passed: true, pending: false };
    if ((o.last4 != null && String(o.last4).trim() !== '') || o.submittedAt != null) {
      return { label: 'Pending', passed: false, pending: true };
    }
  }
  return { label: 'Not submitted', passed: false, pending: false };
}

export default function ProfileShopInfoScreen() {
  const insets = useSafeAreaInsets();
  const { user, refresh } = useProfile();
  const preferredShopIdRef = useRef(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [shopsList, setShopsList] = useState(/** @type {Record<string, unknown>[]} */ ([]));
  const [activeShopId, setActiveShopId] = useState(0);
  const [shopRow, setShopRow] = useState(/** @type {Record<string, unknown> | null} */ (null));

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [locationState, setLocationState] = useState({ ...DEFAULT_LOCATION });
  const [openingHours, setOpeningHours] = useState(() => defaultOpeningHours());

  const [metrics, setMetrics] = useState({ revenue: 0, orders: 0, products: 0 });

  const [pickerOpen, setPickerOpen] = useState(false);
  const [modalBasics, setModalBasics] = useState(false);
  const [modalDesc, setModalDesc] = useState(false);
  const [modalCategory, setModalCategory] = useState(false);
  const [modalHours, setModalHours] = useState(false);
  const [hoursDraft, setHoursDraft] = useState(() => defaultOpeningHours());

  const [verDocModal, setVerDocModal] = useState(/** @type {{ title: string; help: string; docKey: string } | null} */ (null));
  const [verPickedName, setVerPickedName] = useState('');
  const [verPickedFile, setVerPickedFile] = useState(/** @type {{ uri: string; name: string; type: string } | null} */ (null));
  const [verBusy, setVerBusy] = useState(false);
  const [modalBvn, setModalBvn] = useState(false);
  const [bvnDraft, setBvnDraft] = useState('');
  const [bvnBusy, setBvnBusy] = useState(false);

  const uid = user?.id;

  const load = useCallback(async () => {
    if (!uid || !isVendorRole(user?.roleRaw)) {
      setShopsList([]);
      setActiveShopId(0);
      setShopRow(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const shops = await fetchOwnerShops(uid);
      const list = shops.map((s) => /** @type {Record<string, unknown>} */ (s));
      setShopsList(list);
      const ids = list.map(shopIdOf).filter((id) => id > 0);
      let nextId = preferredShopIdRef.current;
      if (!nextId || !ids.includes(nextId)) nextId = ids[0] ?? 0;
      preferredShopIdRef.current = nextId;
      setActiveShopId(nextId);
      if (!nextId) {
        setShopRow(null);
        setMetrics({ revenue: 0, orders: 0, products: 0 });
        return;
      }
      const detail = await fetchShopDetails(nextId, uid);
      setShopRow(detail);
      setName(pickStr(detail, 'name', 'Name'));
      setSlug(pickStr(detail, 'slug', 'Slug'));
      setDescription(pickStr(detail, 'description', 'Description'));
      setCategory(pickStr(detail, 'category', 'Category'));
      setContactEmail(pickStr(detail, 'contactEmail', 'contactemail'));
      setContactPhone(pickStr(detail, 'contactPhone', 'contactphone'));
      const loc = { ...DEFAULT_LOCATION, ...parseMaybeJson(detail.location ?? detail.Location, DEFAULT_LOCATION) };
      const { openingHours: _drop, ...locRest } = loc;
      void _drop;
      setLocationState(locRest);
      const oh = parseOpeningHours(loc.openingHours);
      setOpeningHours(oh);
      setHoursDraft(oh);

      const [ordersRows, productsRes] = await Promise.all([
        fetchShopOrders(nextId, uid).catch(() => []),
        getProducts(nextId, uid).catch(() => ({ products: [] })),
      ]);
      const ordersArr = Array.isArray(ordersRows) ? ordersRows : [];
      const items = ordersArr.map((r) => mapOrderRowToListItem(/** @type {Record<string, unknown>} */ (r)));
      const revenue = items.reduce((sum, row) => sum + (Number(row.valueRupees) || 0), 0);
      const prods = Array.isArray(productsRes?.products) ? productsRes.products : [];
      setMetrics({ revenue, orders: ordersArr.length, products: prods.length });
    } catch (e) {
      setShopRow(null);
      Alert.alert('Could not load shop', e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [uid, user?.roleRaw]);

  useFocusEffect(
    useCallback(() => {
      load().catch(() => {});
    }, [load]),
  );

  const persist = useCallback(async () => {
    if (!uid || !shopRow || !activeShopId) {
      Alert.alert('Shop', 'No shop to update.');
      return;
    }
    if (!name.trim()) {
      Alert.alert('Shop name', 'Enter a shop name.');
      return;
    }
    if (!slug.trim()) {
      Alert.alert('Shop URL', 'Enter a shop slug.');
      return;
    }
    setSaving(true);
    try {
      const locPayload = { ...locationState, openingHours };
      const body = buildUpdateBody(shopRow, {
        name,
        slug,
        description,
        category,
        contactEmail,
        contactPhone,
        location: locPayload,
      });
      await updateVendorShop(activeShopId, uid, body);
      await refresh().catch(() => {});
      await load();
      Alert.alert('Saved', 'Your shop has been updated.');
    } catch (e) {
      Alert.alert('Could not save', e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }, [
    uid,
    shopRow,
    activeShopId,
    name,
    slug,
    description,
    category,
    contactEmail,
    contactPhone,
    locationState,
    openingHours,
    load,
    refresh,
  ]);

  const onSelectShop = useCallback(
    (id) => {
      preferredShopIdRef.current = id;
      setActiveShopId(id);
      setPickerOpen(false);
      load().catch(() => {});
    },
    [load],
  );

  const onUseMyLocation = useCallback(async () => {
    setLocating(true);
    try {
      const granted = await requestLocationPermission();
      if (!granted) {
        Alert.alert('Location', 'Permission was denied. You can still edit location fields after we add manual entry.');
        return;
      }
      const c = await getCurrentCoordinates();
      const place = await reverseGeocodeToPlace(c.latitude, c.longitude);
      setLocationState((prev) => ({
        ...prev,
        city: place.city || prev.city,
        state: place.state || prev.state,
        country: place.country || prev.country,
        coordinates: { lat: c.latitude, lng: c.longitude },
        address: [place.city, place.state, place.country].filter(Boolean).join(', ') || prev.address,
      }));
    } catch (e) {
      Alert.alert('Location', e instanceof Error ? e.message : String(e));
    } finally {
      setLocating(false);
    }
  }, []);

  const policies = shopRow?.policies;
  const deliverySet = useMemo(() => {
    if (!policies || typeof policies !== 'object') return false;
    const d = /** @type {Record<string, unknown>} */ (policies).deliverypolicy ?? (policies).deliveryPolicy;
    if (d == null) return false;
    const s = typeof d === 'string' ? d.trim() : JSON.stringify(d);
    return s.length > 2 && s !== '{}' && s !== 'null';
  }, [shopRow?.policies]);

  const locationSummary = useMemo(() => {
    const city = String(locationState.city ?? '').trim();
    const state = String(locationState.state ?? '').trim();
    const country = String(locationState.country ?? '').trim();
    const parts = [city, state, country].filter(Boolean);
    return parts.length ? parts.join(', ') : '—';
  }, [locationState.city, locationState.state, locationState.country]);

  const coordsLine = useMemo(() => {
    const c = locationState.coordinates;
    if (!c || typeof c !== 'object') return '—';
    const lat = /** @type {{ lat?: number }} */ (c).lat;
    const lng = /** @type {{ lng?: number }} */ (c).lng;
    if (typeof lat === 'number' && typeof lng === 'number') {
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
    return '—';
  }, [locationState.coordinates]);

  const verDocs = useMemo(() => {
    const parsed = parseMaybeJson(shopRow?.verificationDocuments ?? shopRow?.verificationdocuments, {});
    return { ...DEFAULT_VERIFICATION, ...parsed };
  }, [shopRow]);

  const openVerDocModal = useCallback((payload) => {
    setVerPickedFile(null);
    setVerPickedName('');
    setVerDocModal(payload);
  }, []);

  const pickVerificationFile = useCallback(async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.images, DocumentPicker.types.pdf],
        copyTo: 'cachesDirectory',
      });
      const f = Array.isArray(res) ? res[0] : res;
      const uri = f.fileCopyUri || f.uri;
      const name = f.name || 'document';
      const type = f.type || 'application/octet-stream';
      setVerPickedFile({ uri, name, type });
      setVerPickedName(name);
    } catch (e) {
      if (DocumentPicker.isCancel(e)) return;
      Alert.alert('File', e instanceof Error ? e.message : String(e));
    }
  }, []);

  const saveVerDocToShop = useCallback(async () => {
    if (!verPickedFile || !uid || !activeShopId || !shopRow || !verDocModal) {
      Alert.alert('Document', 'Choose a file first.');
      return;
    }
    setVerBusy(true);
    try {
      const { url } = await uploadShopVerificationDocument(activeShopId, verPickedFile);
      const merged = {
        ...verDocs,
        [verDocModal.docKey]: { url, verified: false, submittedAt: new Date().toISOString() },
      };
      const locPayload = { ...locationState, openingHours };
      const body = buildUpdateBody(
        shopRow,
        { name, slug, description, category, contactEmail, contactPhone, location: locPayload },
        merged,
      );
      await updateVendorShop(activeShopId, uid, body);
      await refresh().catch(() => {});
      await load();
      setVerDocModal(null);
      Alert.alert('Saved', 'Document saved to your shop.');
    } catch (e) {
      Alert.alert('Upload failed', e instanceof Error ? e.message : String(e));
    } finally {
      setVerBusy(false);
    }
  }, [
    verPickedFile,
    uid,
    activeShopId,
    shopRow,
    verDocModal,
    verDocs,
    locationState,
    openingHours,
    name,
    slug,
    description,
    category,
    contactEmail,
    contactPhone,
    load,
    refresh,
  ]);

  const submitBvn = useCallback(async () => {
    if (!uid || !activeShopId) return;
    const digits = bvnDraft.replace(/\D/g, '');
    if (digits.length !== 11) {
      Alert.alert('BVN', 'Enter exactly 11 digits.');
      return;
    }
    setBvnBusy(true);
    try {
      await verifyShopBvn(activeShopId, digits);
      await refresh().catch(() => {});
      await load();
      setModalBvn(false);
      setBvnDraft('');
      Alert.alert('Verified', 'Your BVN was recorded.');
    } catch (e) {
      Alert.alert('BVN', e instanceof Error ? e.message : String(e));
    } finally {
      setBvnBusy(false);
    }
  }, [uid, activeShopId, bvnDraft, load, refresh]);

  const idDoc = verDocs.idCard ?? verDocs.identityProof;
  const idSt = docVerificationStatus(idDoc);
  const addrSt = docVerificationStatus(verDocs.proofOfAddress);
  const cacSt = docVerificationStatus(verDocs.cacDocument ?? verDocs.businessLicense);
  const bvnSt = bvnVerificationStatus(verDocs.bvn);

  if (!isVendorRole(user?.roleRaw)) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top + 24 }]}>
        <Text style={styles.muted}>Shop info is only available for vendor accounts.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top + 24 }]}>
        <ActivityIndicator size="large" color={BRAND} />
        <Text style={[styles.muted, { marginTop: 12 }]}>Loading your shop…</Text>
      </View>
    );
  }

  if (!shopRow || !activeShopId) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top + 24, paddingHorizontal: 24 }]}>
        <Text style={styles.emptyTitle}>No shop yet</Text>
        <Text style={styles.muted}>
          Enable vendor mode in Settings and complete shop setup to manage your virtual shop here.
        </Text>
      </View>
    );
  }

  const shopStatus = pickStr(shopRow, 'status', 'Status') || 'pending_approval';

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 28) + 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.hero, { paddingTop: Math.max(insets.top, 12) + 8 }]}>
          <View style={styles.heroInner}>
            <View style={styles.avatarCircle}>
              <Icon name="storefront-outline" size={36} color={BRAND} />
            </View>
          </View>
        </View>

        <View style={styles.sheet}>
          <Text style={styles.statusText}>{statusDisplayLabel(shopStatus)}</Text>

          {shopsList.length > 1 ? (
            <Pressable style={styles.viewShopsRow} onPress={() => setPickerOpen(true)}>
              <Text style={styles.viewShopsTitle}>View shops</Text>
              <View style={styles.addCircle}>
                <Icon name="chevron-down" size={20} color={CARD} />
              </View>
            </Pressable>
          ) : (
            <Text style={styles.singleShopHint}>Your shop</Text>
          )}

          <Pressable style={styles.shopNameRow} onPress={() => setModalBasics(true)}>
            <Text style={styles.shopNameTitle} numberOfLines={1}>
              {name || 'Shop'}
            </Text>
            <View style={styles.iconCircle}>
              <Icon name="create-outline" size={18} color={BRAND} />
            </View>
          </Pressable>

          <View style={styles.metricsRow}>
            <View style={styles.metricCol}>
              <Text style={styles.metricValue}>{formatNaira(metrics.revenue)}</Text>
              <Text style={styles.metricLabel}>Revenue</Text>
            </View>
            <View style={styles.metricCol}>
              <Text style={styles.metricValue}>{String(metrics.orders)}</Text>
              <Text style={styles.metricLabel}>Orders</Text>
            </View>
            <View style={styles.metricCol}>
              <Text style={styles.metricValue}>{String(metrics.products)}</Text>
              <Text style={styles.metricLabel}>Products</Text>
            </View>
          </View>

          <View style={styles.sectionDivider} />

          <SectionHeader title="Category" onEdit={() => setModalCategory(true)} />
          <View style={styles.chipWrap}>
            {category.trim() ? (
              <View style={styles.chip}>
                <Text style={styles.chipText}>{category.trim()}</Text>
              </View>
            ) : (
              <Text style={styles.placeholderLine}>No category set</Text>
            )}
          </View>

          <View style={styles.sectionDivider} />

          <SectionHeader title="Availability" onEdit={() => { setHoursDraft({ ...openingHours }); setModalHours(true); }} />
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 1 }]}>Day</Text>
            <Text style={[styles.th, { flex: 1.2 }]}>Hours</Text>
          </View>
          {DAYS.map(({ key, label }) => (
            <View key={key} style={styles.tableRow}>
              <Text style={styles.td}>{label}</Text>
              <Text style={styles.tdMuted}>{openingHours[key] ?? '—'}</Text>
            </View>
          ))}

          <View style={styles.sectionDivider} />

          <SectionHeader title="Description" onEdit={() => setModalDesc(true)} />
          <Text style={styles.bodyText}>{description.trim() || 'Add a short description for buyers.'}</Text>

          <View style={styles.sectionDivider} />

          <Text style={styles.sectionTitlePlain}>Verification</Text>
          <VerificationRow
            label="ID Card"
            status={idSt}
            hasProgress={idSt.passed || idSt.pending}
            onPress={() =>
              openVerDocModal({
                title: 'ID Card',
                help: 'Government-issued ID (JPEG, PNG, or PDF).',
                docKey: 'idCard',
              })
            }
          />
          <VerificationRow
            label="Address"
            status={addrSt}
            hasProgress={addrSt.passed || addrSt.pending}
            onPress={() =>
              openVerDocModal({
                title: 'Address',
                help: 'Utility bill or bank statement as proof of address (image or PDF).',
                docKey: 'proofOfAddress',
              })
            }
          />
          <VerificationRow
            label="BVN"
            status={bvnSt}
            hasProgress={bvnSt.passed || bvnSt.pending}
            onPress={() => {
              setBvnDraft('');
              setModalBvn(true);
            }}
          />
          <VerificationRow
            label="CAC"
            status={cacSt}
            hasProgress={cacSt.passed || cacSt.pending}
            onPress={() =>
              openVerDocModal({
                title: 'CAC',
                help: 'CAC certificate or business registration (JPEG, PNG, or PDF).',
                docKey: 'cacDocument',
              })
            }
          />

          <View style={styles.sectionDivider} />

          <Text style={styles.sectionTitlePlain}>Shop location</Text>
          <Pressable
            style={({ pressed }) => [styles.outlineBtn, pressed && styles.outlineBtnPressed]}
            onPress={() => {
              onUseMyLocation().catch(() => {});
            }}
            disabled={locating}
          >
            {locating ? (
              <ActivityIndicator color={BRAND} />
            ) : (
              <Text style={styles.outlineBtnText}>Use my current location</Text>
            )}
          </Pressable>
          <Text style={styles.helperGrey}>
            Set where you operate. We read your device position once to suggest city and state — you can save after
            reviewing.
          </Text>
          <Text style={styles.locationBold}>{locationSummary}</Text>
          <View style={styles.kv}>
            <Text style={styles.kvMuted}>State</Text>
            <Text style={styles.kvVal}>{String(locationState.state ?? '—')}</Text>
          </View>
          <View style={styles.kv}>
            <Text style={styles.kvMuted}>City</Text>
            <Text style={styles.kvVal}>{String(locationState.city ?? '—')}</Text>
          </View>
          <View style={styles.kv}>
            <Text style={styles.kvMuted}>Country</Text>
            <Text style={styles.kvVal}>{String(locationState.country ?? '—')}</Text>
          </View>
          <View style={styles.kv}>
            <Text style={styles.kvMuted}>Coordinates</Text>
            <Text style={styles.kvVal}>{coordsLine}</Text>
          </View>

          <View style={styles.sectionDivider} />

          <SectionHeader
            title="Policies"
            onEdit={() => Alert.alert('Policies', 'Full policy editing is available from your vendor dashboard on the web.')}
          />
          <Pressable
            style={styles.policyRow}
            onPress={() => Alert.alert('Delivery policy', 'Edit delivery rules from the vendor web dashboard.')}
          >
            <Text style={styles.policyLabel}>Delivery policy</Text>
            <Text style={[styles.policyStatus, deliverySet && styles.policyStatusOk]}>{deliverySet ? 'Set' : 'Not set'}</Text>
            <View style={styles.iconCircle}>
              <Icon name="create-outline" size={18} color={BRAND} />
            </View>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.saveBtn, pressed && styles.saveBtnPressed, saving && styles.saveBtnDisabled]}
            onPress={() => {
              persist().catch(() => {});
            }}
            disabled={saving}
          >
            {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveBtnText}>Save changes</Text>}
          </Pressable>
        </View>
      </ScrollView>

      <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setPickerOpen(false)} />
        <View style={[styles.modalSheet, { paddingBottom: insets.bottom + 16 }]}>
          <Text style={styles.modalTitle}>Select shop</Text>
          {shopsList.map((s) => {
            const id = shopIdOf(s);
            const sn = pickStr(s, 'name', 'Name') || `Shop ${id}`;
            const selected = id === activeShopId;
            return (
              <Pressable
                key={String(id)}
                style={[styles.pickerItem, selected && styles.pickerItemSelected]}
                onPress={() => onSelectShop(id)}
              >
                <Text style={styles.pickerItemText}>{sn}</Text>
                {selected ? <Icon name="checkmark-circle" size={22} color={BRAND} /> : null}
              </Pressable>
            );
          })}
        </View>
      </Modal>

      <FormModal
        visible={modalBasics}
        title="Shop details"
        onClose={() => setModalBasics(false)}
        onSave={() => setModalBasics(false)}
      >
        <Text style={styles.modalLabel}>Shop name</Text>
        <TextInput value={name} onChangeText={setName} style={styles.modalInput} placeholder="Shop name" />
        <Text style={styles.modalLabel}>Slug (URL)</Text>
        <TextInput
          value={slug}
          onChangeText={(t) => setSlug(t.toLowerCase().replace(/\s+/g, '-'))}
          style={styles.modalInput}
          autoCapitalize="none"
        />
        <Text style={styles.modalLabel}>Contact email</Text>
        <TextInput value={contactEmail} onChangeText={setContactEmail} style={styles.modalInput} keyboardType="email-address" />
        <Text style={styles.modalLabel}>Contact phone</Text>
        <TextInput value={contactPhone} onChangeText={setContactPhone} style={styles.modalInput} keyboardType="phone-pad" />
      </FormModal>

      <FormModal visible={modalDesc} title="Description" onClose={() => setModalDesc(false)} onSave={() => setModalDesc(false)}>
        <TextInput
          value={description}
          onChangeText={setDescription}
          style={[styles.modalInput, styles.modalInputTall]}
          multiline
          textAlignVertical="top"
          placeholder="Tell buyers what you sell"
        />
      </FormModal>

      <FormModal
        visible={modalCategory}
        title="Category"
        onClose={() => setModalCategory(false)}
        onSave={() => setModalCategory(false)}
      >
        <TextInput value={category} onChangeText={setCategory} style={styles.modalInput} placeholder="e.g. Fashion" />
      </FormModal>

      <FormModal visible={modalHours} title="Opening hours" onClose={() => setModalHours(false)} onSave={() => { setOpeningHours({ ...hoursDraft }); setModalHours(false); }}>
        {DAYS.map(({ key, label }) => (
          <View key={key} style={styles.hourRow}>
            <Text style={styles.hourLabel}>{label}</Text>
            <TextInput
              value={hoursDraft[key] ?? ''}
              onChangeText={(t) => setHoursDraft((h) => ({ ...h, [key]: t }))}
              style={styles.hourInput}
              placeholder="09:00–18:00"
            />
          </View>
        ))}
      </FormModal>

      <Modal
        visible={Boolean(verDocModal)}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!verBusy) setVerDocModal(null);
        }}
      >
        <View style={styles.formModalRoot}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => !verBusy && setVerDocModal(null)} />
          <View style={styles.formModalCard}>
            <Text style={styles.modalTitle}>{verDocModal?.title ?? ''}</Text>
            <Text style={[styles.helperGrey, { marginBottom: 14 }]}>{verDocModal?.help ?? ''}</Text>
            <Pressable
              style={({ pressed }) => [styles.outlineBtn, pressed && styles.outlineBtnPressed]}
              onPress={() => pickVerificationFile().catch(() => {})}
              disabled={verBusy}
            >
              <Text style={styles.outlineBtnText}>{verPickedName ? 'Change file' : 'Choose file'}</Text>
            </Pressable>
            <Text style={styles.modalHint}>{verPickedName || 'No file chosen'}</Text>
            <View style={[styles.modalActions, { marginTop: 18 }]}>
              <Pressable onPress={() => !verBusy && setVerDocModal(null)} style={styles.modalGhostBtn} disabled={verBusy}>
                <Text style={styles.modalGhostText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => saveVerDocToShop().catch(() => {})}
                style={[styles.modalPrimaryBtn, verBusy && styles.saveBtnDisabled]}
                disabled={verBusy}
              >
                {verBusy ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalPrimaryText}>Save to shop</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={modalBvn}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!bvnBusy) setModalBvn(false);
        }}
      >
        <View style={styles.formModalRoot}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => !bvnBusy && setModalBvn(false)} />
          <View style={styles.formModalCard}>
            <Text style={styles.modalTitle}>BVN verification</Text>
            <Text style={[styles.helperGrey, { marginBottom: 12 }]}>
              Enter your 11-digit BVN. We only store a masked record after verification. Connect Paystack or Mono for live
              NIBSS checks when ready.
            </Text>
            {bvnSt.passed &&
            verDocs.bvn &&
            typeof verDocs.bvn === 'object' &&
            verDocs.bvn.last4 != null &&
            String(verDocs.bvn.last4).trim() !== '' ? (
              <Text style={styles.bvnOnFile}>
                On file: ••••{String(verDocs.bvn.last4)} (verified)
              </Text>
            ) : null}
            <TextInput
              value={bvnDraft}
              onChangeText={(t) => setBvnDraft(t.replace(/\D/g, '').slice(0, 11))}
              style={styles.modalInput}
              placeholder="11-digit BVN"
              keyboardType="number-pad"
              maxLength={11}
              editable={!bvnBusy}
            />
            <View style={[styles.modalActions, { marginTop: 16 }]}>
              <Pressable onPress={() => !bvnBusy && setModalBvn(false)} style={styles.modalGhostBtn} disabled={bvnBusy}>
                <Text style={styles.modalGhostText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => submitBvn().catch(() => {})}
                style={[styles.modalPrimaryBtn, bvnBusy && styles.saveBtnDisabled]}
                disabled={bvnBusy}
              >
                {bvnBusy ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalPrimaryText}>Verify</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

function SectionHeader({ title, onEdit }) {
  return (
    <View style={styles.sectionHeaderRow}>
      <Text style={styles.sectionTitlePlain}>{title}</Text>
      <TouchableOpacity onPress={onEdit} hitSlop={12} style={styles.iconCircle} accessibilityLabel={`Edit ${title}`}>
        <Icon name="create-outline" size={18} color={BRAND} />
      </TouchableOpacity>
    </View>
  );
}

/** @param {{ label: string; status: { label: string; passed: boolean; pending: boolean }; hasProgress: boolean; onPress: () => void }} props */
function VerificationRow({ label, status, hasProgress, onPress }) {
  return (
    <Pressable style={styles.verRow} onPress={onPress}>
      <View style={styles.verLeft}>
        <Text style={styles.verLabel}>{label}</Text>
        <Text
          style={[
            styles.verStatus,
            status.passed && styles.verStatusOk,
            status.pending && styles.verStatusPending,
          ]}
        >
          {status.label}
        </Text>
      </View>
      <View style={styles.iconCircle}>
        <Icon name={hasProgress ? 'create-outline' : 'add'} size={18} color={BRAND} />
      </View>
    </Pressable>
  );
}

/** @param {{ visible: boolean; title: string; children: unknown; onClose: () => void; onSave: () => void }} props */
function FormModal({ visible, title, children, onClose, onSave }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.formModalRoot}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.formModalCard}>
          <Text style={styles.modalTitle}>{title}</Text>
          {children}
          <View style={styles.modalActions}>
            <Pressable onPress={onClose} style={styles.modalGhostBtn}>
              <Text style={styles.modalGhostText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={onSave} style={styles.modalPrimaryBtn}>
              <Text style={styles.modalPrimaryText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: PAGE_BG },
  scroll: { flex: 1, backgroundColor: PAGE_BG },
  hero: {
    backgroundColor: BRAND,
    paddingBottom: 48,
  },
  heroInner: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: CARD,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.35)',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  sheet: {
    marginTop: -36,
    backgroundColor: CARD,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 18,
    paddingTop: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: BLACK,
    textAlign: 'center',
    marginBottom: 16,
  },
  viewShopsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  viewShopsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: BLACK,
  },
  addCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BRAND_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  singleShopHint: {
    fontSize: 13,
    color: MUTED,
    marginBottom: 8,
  },
  shopNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  shopNameTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: BLACK,
    flex: 1,
    marginRight: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(13,79,60,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(13,79,60,0.06)',
  },
  metricsRow: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
    paddingVertical: 14,
    marginBottom: 8,
  },
  metricCol: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: BLACK,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: MUTED,
  },
  sectionDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BORDER,
    marginVertical: 16,
    marginHorizontal: -4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitlePlain: {
    fontSize: 16,
    fontWeight: '700',
    color: BLACK,
  },
  chipWrap: { marginBottom: 4 },
  chip: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: BORDER,
  },
  chipText: { fontSize: 14, fontWeight: '600', color: BLACK },
  placeholderLine: { fontSize: 14, color: MUTED },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    marginBottom: 4,
  },
  th: { fontSize: 12, fontWeight: '700', color: MUTED },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0',
  },
  td: { fontSize: 14, color: BLACK, flex: 1 },
  tdMuted: { fontSize: 14, color: MUTED, flex: 1.2, textAlign: 'right' },
  bodyText: {
    fontSize: 15,
    lineHeight: 22,
    color: BLACK,
  },
  verRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0',
  },
  verLeft: { flex: 1 },
  verLabel: { fontSize: 15, fontWeight: '500', color: BLACK },
  verStatus: { fontSize: 13, color: MUTED, marginTop: 2 },
  verStatusOk: { color: GREEN_OK, fontWeight: '600' },
  verStatusPending: { color: ORANGE_PENDING, fontWeight: '600' },
  modalHint: { fontSize: 13, color: MUTED, marginTop: 8 },
  bvnOnFile: { fontSize: 13, color: GREEN_OK, fontWeight: '600', marginBottom: 8 },
  outlineBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: BRAND,
    marginBottom: 10,
  },
  outlineBtnPressed: { opacity: 0.85 },
  outlineBtnText: { color: BRAND, fontWeight: '700', fontSize: 14 },
  helperGrey: {
    fontSize: 13,
    color: MUTED,
    lineHeight: 18,
    marginBottom: 14,
  },
  locationBold: {
    fontSize: 16,
    fontWeight: '700',
    color: BLACK,
    marginBottom: 12,
  },
  kv: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  kvMuted: { fontSize: 14, color: MUTED },
  kvVal: { fontSize: 14, fontWeight: '500', color: BLACK, maxWidth: '62%', textAlign: 'right' },
  policyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 10,
  },
  policyLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: BLACK },
  policyStatus: { fontSize: 14, color: MUTED, marginRight: 4 },
  policyStatusOk: { color: GREEN_OK, fontWeight: '600' },
  saveBtn: {
    marginTop: 20,
    backgroundColor: BRAND,
    borderRadius: 5,
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveBtnPressed: { opacity: 0.9 },
  saveBtnDisabled: { opacity: 0.65 },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  centered: { flex: 1, backgroundColor: PAGE_BG, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  muted: { fontSize: 14, color: MUTED, textAlign: 'center', lineHeight: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: BLACK, marginBottom: 8 },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  modalSheet: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: '22%',
    backgroundColor: CARD,
    borderRadius: 12,
    padding: 16,
    maxHeight: '70%',
  },
  modalTitle: { fontSize: 17, fontWeight: '700', marginBottom: 12, color: BLACK },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  pickerItemSelected: { backgroundColor: 'rgba(13,79,60,0.05)' },
  pickerItemText: { fontSize: 16, color: BLACK },
  formModalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  formModalCard: {
    backgroundColor: CARD,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingBottom: 28,
  },
  modalLabel: { fontSize: 12, fontWeight: '600', color: MUTED, marginTop: 10, marginBottom: 6 },
  modalInput: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 16,
    color: BLACK,
  },
  modalInputTall: { minHeight: 120, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16, marginTop: 20 },
  modalGhostBtn: { paddingVertical: 10, paddingHorizontal: 12 },
  modalGhostText: { fontSize: 16, color: MUTED, fontWeight: '600' },
  modalPrimaryBtn: {
    backgroundColor: BRAND,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  modalPrimaryText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  hourRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  hourLabel: { width: 100, fontSize: 14, color: BLACK },
  hourInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
});
