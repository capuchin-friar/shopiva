import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { TextInput } from 'react-native-gesture-handler';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import {
  errorCodes,
  isErrorWithCode,
  keepLocalCopy,
  pick,
  types,
} from '@react-native-documents/picker';
import { fetchBuyerOrder } from '../api';
import { getStoredUser } from '../auth/session';
import { connectChatSocket, emitSocketAck } from '../socket/chatSocket';
import { mapBuyerDisputeRow } from '../utils/buyerUi';
import { set_disputeInfo } from '../../redux/dispute';
import { set_orderInfo } from '../../redux/order';
import { set_orderList } from '../../redux/orders';

const DISPUTE_REASONS = [
  { label: 'Item not as described', value: 'not_as_described' },
  { label: 'Wrong item received', value: 'wrong_item' },
  { label: 'Item is damaged', value: 'damaged_item' },
  { label: 'Item is defective / not working', value: 'defective_item' },
  { label: 'Missing items in package', value: 'missing_items' },
  { label: 'Other', value: 'other' },
];

const RESOLUTIONS = [
  { label: 'Full refund', value: 'refund' },
  { label: 'Replacement item', value: 'replacement' },
  { label: 'Return and refund', value: 'return_refund' },
];

const MIN_EVIDENCE = 1;
const MAX_EVIDENCE = 6;
const DESCRIPTION_MIN = 15;
const DESCRIPTION_MAX = 1000;

/**
 * @param {unknown} route
 * @param {{ order?: Record<string, unknown> } | null | undefined} orderInfo
 */
function resolveNumericOrderId(route, orderInfo) {
  const params = route?.params ?? {};
  const direct = params.orderId ?? params.order_id;
  if (direct != null) {
    const n = Number(direct);
    if (Number.isFinite(n) && n > 0) return Math.trunc(n);
  }
  const fromNested = params.order?.orderId ?? params.order?.id ?? params.order?.order_id;
  if (fromNested != null) {
    const n = Number(fromNested);
    if (Number.isFinite(n) && n > 0) return Math.trunc(n);
  }
  const o = orderInfo?.order;
  if (o && typeof o === 'object') {
    for (const key of ['id', 'order_id', 'orderId']) {
      const v = /** @type {Record<string, unknown>} */ (o)[key];
      if (v != null) {
        const n = Number(v);
        if (Number.isFinite(n) && n > 0) return Math.trunc(n);
      }
    }
  }
  return null;
}

function labelForValue(options, value) {
  return options.find((o) => o.value === value)?.label ?? value ?? '—';
}

function Section({ title, subtitle, children }) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

function ConfirmCheckbox({ checked, onToggle, label }) {
  return (
    <Pressable
      onPress={() => onToggle(!checked)}
      style={({ pressed }) => [styles.checkboxRow, pressed && styles.checkboxRowPressed]}
    >
      <View style={[styles.checkboxBox, checked && styles.checkboxBoxChecked]}>
        {checked ? <Text style={styles.checkboxMark}>✓</Text> : null}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </Pressable>
  );
}

export default function OpenDispute() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const auth = useSelector((s) => s.auth);
  const { orderInfo } = useSelector((s) => s.orderInfo);
  const isCustomer = auth.activeRole === 'customer';

  const orderId = useMemo(
    () => resolveNumericOrderId(route, orderInfo),
    [route, orderInfo]
  );

  const [orderLabel, setOrderLabel] = useState(
    orderId != null ? `Order #${orderId}` : 'Order'
  );
  const [submitting, setSubmitting] = useState(false);

  const [reasonCode, setReasonCode] = useState(null);
  /** @type {{ id: string; uri: string; name: string; type: string }[]} */
  const [evidence, setEvidence] = useState([]);
  const [description, setDescription] = useState('');
  const [resolution, setResolution] = useState(null);
  const [confirmedAccurate, setConfirmedAccurate] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: 'Open dispute' });
  }, [navigation]);

  useEffect(() => {
    connectChatSocket();
  }, []);

  useLayoutEffect(() => {
    if (orderId == null) return;
    let cancelled = false;
    fetchBuyerOrder(orderId)
      .then(({ order }) => {
        if (cancelled || !order || typeof order !== 'object') return;
        const ref =
          order.order_id != null
            ? String(order.order_id)
            : order.id != null
              ? String(order.id)
              : String(orderId);
        const shop =
          order.shop && typeof order.shop === 'object'
            ? String(/** @type {{ name?: string }} */ (order.shop).name ?? '').trim()
            : '';
        setOrderLabel(shop ? `${shop} · #${ref}` : `Order #${ref}`);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const reasonLabel = labelForValue(DISPUTE_REASONS, reasonCode);

  const addEvidence = useCallback(async () => {
    if (evidence.length >= MAX_EVIDENCE) {
      Alert.alert('Limit reached', `You can add up to ${MAX_EVIDENCE} photos.`);
      return;
    }
    try {
      const picked = await pick({
        type: [types.images],
        allowMultiSelection: true,
      });
      const remaining = MAX_EVIDENCE - evidence.length;
      const slice = picked.slice(0, remaining);
      const copies = await keepLocalCopy({
        files: slice.map((f) => ({
          uri: f.uri,
          fileName: f.name || 'photo.jpg',
          ...(f.isVirtual && f.convertibleToMimeTypes?.[0]?.mimeType
            ? { convertVirtualFileToType: f.convertibleToMimeTypes[0].mimeType }
            : {}),
        })),
        destination: 'cachesDirectory',
      });
      const uriBySource = Object.fromEntries(
        copies.map((c) => [
          c.sourceUri,
          c.status === 'success' ? c.localUri : c.sourceUri,
        ])
      );
      const next = slice.map((f, i) => ({
        id: `dsp_${Date.now()}_${i}`,
        uri: uriBySource[f.uri] || f.uri,
        name: f.name || 'photo.jpg',
        type: f.type || 'image/jpeg',
      }));
      setEvidence((prev) => [...prev, ...next]);
    } catch (e) {
      if (isErrorWithCode(e) && e.code === errorCodes.OPERATION_CANCELED) return;
      Alert.alert('Photos', e instanceof Error ? e.message : String(e));
    }
  }, [evidence.length]);

  const removeEvidence = (id) => {
    setEvidence((prev) => prev.filter((x) => x.id !== id));
  };

  const validate = () => {
    if (!isCustomer) {
      Alert.alert(
        'Buyers only',
        'Disputes are submitted by the buyer who received the order.'
      );
      return false;
    }
    if (orderId == null) {
      Alert.alert('Order required', 'Open this screen from an order to link your dispute.');
      return false;
    }
    if (!reasonCode) {
      Alert.alert('Reason required', 'Select what is wrong with your order.');
      return false;
    }
    if (evidence.length < MIN_EVIDENCE) {
      Alert.alert(
        'Photos required',
        `Add at least ${MIN_EVIDENCE} photo showing the issue.`
      );
      return false;
    }
    const desc = description.trim();
    if (desc.length < DESCRIPTION_MIN) {
      Alert.alert(
        'Description required',
        `Describe the issue in at least ${DESCRIPTION_MIN} characters.`
      );
      return false;
    }
    if (desc.length > DESCRIPTION_MAX) {
      Alert.alert('Too long', `Keep your description under ${DESCRIPTION_MAX} characters.`);
      return false;
    }
    if (!resolution) {
      Alert.alert('Required', 'What resolution do you want?');
      return false;
    }
    if (!confirmedAccurate) {
      Alert.alert(
        'Confirmation required',
        'Confirm that your information and evidence are accurate.'
      );
      return false;
    }
    return true;
  };

  const submit = async () => {
    if (!validate() || orderId == null) return;
    setSubmitting(true);
    try {
      const u = await getStoredUser();
      if (!u?.id) {
        Alert.alert('Sign in required', 'Please sign in to submit a dispute.');
        return;
      }
      const customerId = Number(u.id);
      const dispute_ref = `DSP-${customerId}-${Date.now()}`;
      const metadata = {
        reason_code: reasonCode,
        preferred_resolution: resolution,
        preferred_resolution_label: labelForValue(RESOLUTIONS, resolution),
        confirmed_accurate: confirmedAccurate,
        submitted_at: new Date().toISOString(),
        form_version: 'mvp',
        evidence: evidence.map((e) => ({
          file_name: e.name,
          mime_type: e.type,
          uri: e.uri,
        })),
        shop_id:  
          orderInfo?.shop?.id != null ? String(orderInfo.shop.id) : undefined,
      };

      /** @type {Record<string, unknown>} */
      const payload = {
        dispute_ref,
        customer_id: customerId,
        order_id: orderId,
        status: 'open',
        reason: reasonLabel,
        description: description.trim(),
        source: 'customer',
        metadata,
      };

      const response = await emitSocketAck('raise_dispute', payload);
      if (!response.success) {
        throw new Error(response.error || response.message || 'Dispute failed');
      }

      const row =
        response.result && typeof response.result === 'object'
          ? /** @type {Record<string, unknown>} */ ({
              ...response.result,
              metadata,
              reason: reasonLabel,
              description: description.trim(),
            })
          : { dispute_ref, ...payload };
      const mapped = mapBuyerDisputeRow(row);
      dispatch(set_disputeInfo(mapped));
      if(auth.activeRole === "vendor"){
        dispatch(set_orderInfo(response.others.voi))
        dispatch(set_orderList(response.others.vol))
      }else{
        dispatch(set_orderInfo(response.others.coi))
        dispatch(set_orderList(response.others.col))
      }
      
  
      // Alert.alert(
      //   'Dispute submitted',
      //   'We have received your dispute. Our team will review your evidence and contact you.',
      //   [
      //     {
      //       text: 'View dispute',
      //       onPress: () =>
      //         navigation.replace('Dispute-detail', {
      //           dispute: mapped,
      //           disputeId: mapped.id,
      //         }),
      //     },
      //   ]
      // );
    } catch (e) {
      Alert.alert(
        'Could not submit',
        e instanceof Error ? e.message : String(e)
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isCustomer) {
    return (
      <View style={styles.centered}>
        <Text style={styles.centeredTitle}>Buyer dispute</Text>
        <Text style={styles.centeredSub}>
          Only the buyer can open a post-delivery dispute. Switch to your customer
          account if you purchased this order.
        </Text>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.btnPrimary, pressed && styles.btnPrimaryPressed]}
        >
          <Text style={styles.btnPrimaryText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 100 },
        ]}
      >
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Raise a dispute</Text>
          <Text style={styles.heroSub}>
            Funds for {orderLabel} are in escrow. Tell us what went wrong, add a
            photo, and choose how you would like this resolved.
          </Text>
          {orderId == null ? (
            <Text style={styles.heroWarning}>
              No order linked — open this screen from order details.
            </Text>
          ) : null}
        </View>

        <Section title="What is the issue with your order?">
          <Dropdown
            style={styles.dropdown}
            containerStyle={styles.dropdownContainer}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            itemTextStyle={styles.itemTextStyle}
            data={DISPUTE_REASONS}
            labelField="label"
            valueField="value"
            placeholder="Select a reason"
            value={reasonCode}
            onChange={(item) => setReasonCode(item.value)}
          />
        </Section>

        <Section
          title="Describe the issue"
          subtitle={`At least ${DESCRIPTION_MIN} characters.`}
        >
          <TextInput
            style={[styles.textInput, styles.textInputMultiline]}
            placeholder="e.g. I ordered a black iPhone 13 but received a blue iPhone 11."
            placeholderTextColor="#999"
            multiline
            maxLength={DESCRIPTION_MAX}
            value={description}
            onChangeText={setDescription}
          />
          <Text style={styles.charCount}>
            {description.trim().length} / {DESCRIPTION_MAX}
          </Text>
        </Section>

        <Section
          title="Add photos"
          subtitle="Clear photos of the item and packaging help us review faster."
        >
          <ScrollView
            horizontal
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.evidenceRow}
          >
            {evidence.map((item) => (
              <View key={item.id} style={styles.evidenceTile}>
                <Image
                  source={{ uri: item.uri }}
                  style={styles.evidenceImage}
                  resizeMode="cover"
                />
                <Pressable
                  onPress={() => removeEvidence(item.id)}
                  style={styles.evidenceRemove}
                  hitSlop={8}
                >
                  <Text style={styles.evidenceRemoveText}>×</Text>
                </Pressable>
              </View>
            ))}
            {evidence.length < MAX_EVIDENCE ? (
              <Pressable
                onPress={addEvidence}
                style={({ pressed }) => [
                  styles.evidenceAdd,
                  pressed && styles.evidenceAddPressed,
                ]}
              >
                <Text style={styles.evidenceAddPlus}>+</Text>
                <Text style={styles.evidenceAddLabel}>Add photo</Text>
              </Pressable>
            ) : null}
          </ScrollView>
          <Text style={styles.hint}>
            {evidence.length} / {MAX_EVIDENCE} photos
          </Text>
        </Section>

        <Section title="What resolution do you want?">
          <Dropdown
            style={styles.dropdown}
            containerStyle={styles.dropdownContainer}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            itemTextStyle={styles.itemTextStyle}
            data={RESOLUTIONS}
            labelField="label"
            valueField="value"
            placeholder="Select resolution"
            value={resolution}
            onChange={(item) => setResolution(item.value)}
          />
        </Section>

        <Section title="Confirmation">
          <ConfirmCheckbox
            checked={confirmedAccurate}
            onToggle={setConfirmedAccurate}
            label="I confirm that the information and evidence provided are accurate. I understand that false disputes may lead to account restrictions."
          />
        </Section>
      </ScrollView>

      <View style={[styles.actionBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          disabled={submitting}
          style={({ pressed }) => [
            styles.btnSecondary,
            pressed && styles.btnSecondaryPressed,
          ]}
        >
          <Text style={styles.btnSecondaryText}>Cancel</Text>
        </Pressable>
        <Pressable
          onPress={submit}
          disabled={submitting}
          style={({ pressed }) => [
            styles.btnPrimary,
            pressed && styles.btnPrimaryPressed,
            submitting && styles.btnDisabled,
          ]}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnPrimaryText}>Submit dispute</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F4F5F7',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  centered: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#F4F5F7',
  },
  centeredTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  centeredSub: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    marginBottom: 24,
  },
  heroCard: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E2E2E6',
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 14,
    color: '#555',
    lineHeight: 21,
  },
  heroWarning: {
    marginTop: 10,
    fontSize: 13,
    fontWeight: '600',
    color: '#C62828',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E2E2E6',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#666',
    lineHeight: 19,
    marginBottom: 12,
  },
  dropdown: {
    minHeight: 52,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 14,
    backgroundColor: '#FAFAFA',
  },
  dropdownContainer: {
    borderRadius: 5,
    borderColor: '#E0E0E0',
    borderWidth: 1,
  },
  placeholderStyle: {
    fontSize: 14,
    color: '#999',
  },
  selectedTextStyle: {
    fontSize: 14,
    color: '#111',
    fontWeight: '600',
  },
  itemTextStyle: {
    fontSize: 14,
    color: '#111',
  },
  textInput: {
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111',
    backgroundColor: '#FAFAFA',
  },
  textInputMultiline: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    marginTop: 6,
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
  },
  hint: {
    marginTop: 8,
    fontSize: 12,
    color: '#888',
  },
  evidenceRow: {
    gap: 10,
    paddingVertical: 8,
  },
  evidenceTile: {
    width: 96,
    position: 'relative',
  },
  evidenceImage: {
    width: 96,
    height: 96,
    borderRadius: 5,
    backgroundColor: '#EEE',
  },
  evidenceRemove: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  evidenceRemoveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 18,
  },
  evidenceAdd: {
    width: 96,
    height: 96,
    borderRadius: 5,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CCC',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
  },
  evidenceAddPressed: {
    backgroundColor: '#F0F0F0',
  },
  evidenceAddPlus: {
    fontSize: 28,
    color: '#888',
    lineHeight: 30,
  },
  evidenceAddLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 8,
  },
  checkboxRowPressed: {
    opacity: 0.8,
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxBoxChecked: {
    backgroundColor: '#0D8A4A',
    borderColor: '#0D8A4A',
  },
  checkboxMark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#111',
    lineHeight: 21,
  },
  actionBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E2E6',
  },
  btnPrimary: {
    flex: 1,
    height: 48,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D8A4A',
  },
  btnPrimaryPressed: {
    backgroundColor: '#0A6B3A',
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnPrimaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  btnSecondary: {
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  btnSecondaryPressed: {
    backgroundColor: '#EBEBEB',
  },
  btnSecondaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
  },
});
