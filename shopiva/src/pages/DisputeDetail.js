import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatNaira } from '../utils/formatNaira';
import { fetchBuyerDispute } from '../api/buyer';
import { mapBuyerDisputeRow } from '../utils/buyerUi';

const PAGE_BG = '#F5F5F5';
const WHITE = '#FFFFFF';
const BLACK = '#111111';
const MUTED = '#8E8E93';
const LIME = '#A4C639';
const LINK = '#1565C0';
const TEAL = '#0D9488';
const LINE_DONE = '#C5E075';
const LINE_PENDING = '#E0E0E0';
const DOT_PENDING = '#D8D8D8';

const STATUS_DISPLAY = {
  open: 'Open',
  under_review: 'Under review',
  resolved: 'Resolved',
};

const STATUS_PILL = {
  open: { bg: '#FFF3E0', fg: '#C45C00' },
  under_review: { bg: '#E3F2FD', fg: '#1565C0' },
  resolved: { bg: '#E8F5E9', fg: '#2E7D32' },
};

/**
 * @param {Record<string, unknown>} dispute
 */
function normalizeDispute(dispute) {
  const buyerReceivedItem =
    dispute.buyerReceivedItem !== undefined && dispute.buyerReceivedItem !== null
      ? Boolean(dispute.buyerReceivedItem)
      : true;
  const lineItem = dispute.lineItem ?? {
    name: dispute.title ?? 'Item',
    qty: 1,
    unitPriceRupees: 0,
    totalRupees: 0,
  };
  return {
    ...dispute,
    buyerReceivedItem,
    vendorName: dispute.vendorName ?? dispute.customerName ?? '—',
    orderDateLabel: dispute.orderDateLabel ?? dispute.openedLabel ?? '—',
    deliveryDateLabel: dispute.deliveryDateLabel ?? '—',
    orderNumberDisplay: dispute.orderNumberDisplay ?? dispute.orderId ?? '—',
    lineItem,
    vendorNote:
      dispute.vendorNote ??
      dispute.customerNote ??
      dispute.summary ??
      dispute.description ??
      '',
    disputeReason: dispute.disputeReason ?? dispute.category ?? '—',
    itemCondition: dispute.itemCondition ?? '—',
    paymentEscrowRupees:
      dispute.paymentEscrowRupees ?? lineItem.totalRupees ?? 0,
    preferredResolution: dispute.preferredResolution ?? '—',
    expectationExpected: dispute.expectationExpected ?? '',
    expectationGotInstead:
      dispute.expectationGotInstead ?? dispute.description ?? '',
    evidence: Array.isArray(dispute.evidence) ? dispute.evidence : [],
  };
}

function MetaCell({ label, value, valueIsLink }) {
  return (
    <View style={styles.metaCell}>
      <Text style={styles.metaCaps}>{label}</Text>
      {valueIsLink ? (
        <Text style={styles.metaLink} numberOfLines={1}>
          {value}
        </Text>
      ) : (
        <Text style={styles.metaStrong} numberOfLines={2}>
          {value}
        </Text>
      )}
    </View>
  );
}

function AnalysisField({ label, value, highlight }) {
  return (
    <View style={styles.analysisField}>
      <Text style={styles.analysisLabel}>{label}</Text>
      <Text style={[styles.analysisValue, highlight && styles.limeText]}>{value}</Text>
    </View>
  );
}

/**
 * @param {{ steps: { title: string; dateLabel?: string | null; done: boolean }[] }} p
 */
function DisputeActivityTimeline({ steps }) {
  return (
    <View style={styles.tlWrap}>
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
              {step.dateLabel ? (
                <Text style={styles.tlTime}>{step.dateLabel}</Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

/**
 * @param {{ uri?: string; kind?: string }} p
 */
function EvidenceThumb({ uri, kind }) {
  const isVideo = kind === 'video';
  if (uri) {
    return (
      <View style={styles.thumbOuter}>
        <Image source={{ uri }} style={styles.thumbImage} resizeMode="cover" />
        <View style={styles.thumbBadge}>
          <Text style={styles.thumbBadgeText}>{isVideo ? 'VIDEO' : 'IMAGE'}</Text>
        </View>
      </View>
    );
  }
  return (
    <View style={[styles.thumbOuter, styles.thumbPlaceholder]}>
      <Icon name="image-outline" size={28} color={MUTED} />
      <Text style={styles.thumbPhLabel}>Add file</Text>
    </View>
  );
}

/**
 * @param {{ onOpenActions: () => void }} p
 */
function DisputeDetailHeaderRight({ onOpenActions }) {
  return (
    <View style={styles.headerTools}>
      <Pressable
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        style={styles.headerEllipsis}
        onPress={onOpenActions}
        accessibilityRole="button"
        accessibilityLabel="More dispute actions"
      >
        <Icon name="ellipsis-horizontal" size={22} color={BLACK} />
      </Pressable>
    </View>
  );
}

export default function DisputeDetailScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const raw = route.params?.dispute;
  const disputeIdParam = route.params?.disputeId;
  const [disputeRow, setDisputeRow] = useState(raw);
  const dispute = useMemo(() => (disputeRow ? normalizeDispute(disputeRow) : null), [disputeRow]);
  const [actionsOpen, setActionsOpen] = useState(false);

  useEffect(() => {
    if (raw) setDisputeRow(raw);
  }, [raw]);

  useEffect(() => {
    const id = disputeIdParam != null ? String(disputeIdParam).trim() : '';
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const { dispute: row } = await fetchBuyerDispute(id);
        if (cancelled) return;
        setDisputeRow(mapBuyerDisputeRow(/** @type {Record<string, unknown>} */ (row)));
      } catch {
        /* keep list snapshot */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [disputeIdParam]);

  const showEvidence =
    dispute != null && dispute.buyerReceivedItem === false;

  const openActions = useCallback(() => {
    setActionsOpen(true);
  }, []);

  const renderHeaderRight = useCallback(
    () => <DisputeDetailHeaderRight onOpenActions={openActions} />,
    [openActions],
  );

  useLayoutEffect(() => {
    if (!dispute) {
      navigation.setOptions({ headerRight: undefined });
      return undefined;
    }
    navigation.setOptions({
      headerRight: renderHeaderRight,
    });
    return () => navigation.setOptions({ headerRight: undefined });
  }, [navigation, dispute, renderHeaderRight]);

  const statusKey = dispute?.status ?? 'open';
  const pill = STATUS_PILL[statusKey] ?? STATUS_PILL.open;
  const statusText = STATUS_DISPLAY[statusKey] ?? statusKey;
  const isResolved = statusKey === 'resolved';

  const timeline = useMemo(() => {
    if (!dispute?.timeline?.length) {
      return [
        { title: 'Dispute opened', dateLabel: dispute?.openedLabel ?? '—', done: true },
        { title: 'Awaiting update', dateLabel: null, done: false },
      ];
    }
    return dispute.timeline;
  }, [dispute]);

  const evidenceSlots = useMemo(() => {
    if (!dispute || !showEvidence) return [];
    const list = dispute.evidence.slice(0, 6).map((e) => ({ uri: e.uri, kind: e.kind ?? 'image' }));
    const padded = [...list];
    while (padded.length < 3) {
      padded.push({ uri: null, kind: 'image' });
    }
    return padded;
  }, [dispute, showEvidence]);

  const closeActions = () => setActionsOpen(false);

  const onAcceptOffer = () => {
    Alert.alert(
      'Accept',
      'Accept the proposed resolution for this dispute?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Accept', onPress: () => Alert.alert('Confirmed', 'Resolution accepted.') },
      ],
    );
  };

  const onSubmitEvidenceFab = () => {
    Alert.alert('Submit evidence', 'Upload photos or documents from your library or camera.');
  };

  const onEscalate = () => {
    closeActions();
    if (isResolved) {
      Alert.alert('Escalate', 'This dispute is already resolved.');
      return;
    }
    Alert.alert(
      'Escalate dispute',
      'Request a senior reviewer for this case?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Escalate',
          onPress: () =>
            Alert.alert('Request sent', 'Our team will prioritise your case.'),
        },
      ],
    );
  };

  const onAddEvidence = () => {
    closeActions();
    if (isResolved) {
      Alert.alert('Add evidence', 'Evidence cannot be added to a resolved dispute.');
      return;
    }
    if (!showEvidence) {
      Alert.alert(
        'Evidence',
        'Extra evidence is only required when the item was not received. Use “Contact support” for other issues.',
      );
      return;
    }
    onSubmitEvidenceFab();
  };

  const onMessageVendor = () => {
    closeActions();
    Alert.alert('Message vendor', 'Chat with the seller will open here when connected.');
  };

  /** Platform / Shopiva support (Material Icons `support-agent` — closest to “customer care” in this bundle). */
  const onContactSupport = () => {
    closeActions();
    Alert.alert('Contact support', 'Shopiva support will open here when connected.');
  };

  const onWithdraw = () => {
    closeActions();
    if (isResolved) {
      Alert.alert('Withdraw', 'This dispute is already closed.');
      return;
    }
    Alert.alert(
      'Withdraw dispute',
      `Withdraw ${dispute?.id ?? 'this dispute'}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Withdraw',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Withdrawn', 'Your dispute has been withdrawn.');
            navigation.goBack();
          },
        },
      ],
    );
  };

  const onDownloadSummary = () => {
    closeActions();
    Alert.alert('Summary', 'PDF download will be available when connected.');
  };

  if (!dispute) {
    return (
      <View style={[styles.empty, { paddingTop: insets.top + 24 }]}>
        <Text style={styles.muted}>Dispute not found.</Text>
      </View>
    );
  }

  const fabBottom = Math.max(insets.bottom, 12) + 8;
  const scrollBottomPad = fabBottom + 72;

  return (
    <View style={styles.root}>
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
            <Text style={styles.actionSheetTitle}>Dispute actions</Text>

            {!isResolved ? (
              <>
                <Pressable
                  style={({ pressed }) => [styles.actionRow, pressed && styles.actionRowPressed]}
                  onPress={onEscalate}
                >
                  <Icon name="trending-up-outline" size={22} color={BLACK} />
                  <Text style={styles.actionRowLabel}>Escalate dispute</Text>
                </Pressable>

                {showEvidence ? (
                  <Pressable
                    style={({ pressed }) => [styles.actionRow, pressed && styles.actionRowPressed]}
                    onPress={onAddEvidence}
                  >
                    <Icon name="images-outline" size={22} color={BLACK} />
                    <Text style={styles.actionRowLabel}>Add evidence</Text>
                  </Pressable>
                ) : null}

                <Pressable
                  style={({ pressed }) => [styles.actionRow, pressed && styles.actionRowPressed]}
                  onPress={onMessageVendor}
                >
                  <Icon name="chatbubbles-outline" size={22} color={BLACK} />
                  <Text style={styles.actionRowLabel}>Message vendor</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [styles.actionRow, pressed && styles.actionRowPressed]}
                  onPress={onContactSupport}
                >
                  <MaterialIcons name="support-agent" size={22} color={BLACK} />
                  <Text style={styles.actionRowLabel}>Contact support</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [styles.actionRow, pressed && styles.actionRowPressed]}
                  onPress={onWithdraw}
                >
                  <Icon name="remove-circle-outline" size={22} color="#C62828" />
                  <Text style={styles.actionRowLabelDestructive}>Withdraw dispute</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Pressable
                  style={({ pressed }) => [styles.actionRow, pressed && styles.actionRowPressed]}
                  onPress={onDownloadSummary}
                >
                  <Icon name="download-outline" size={22} color={BLACK} />
                  <Text style={styles.actionRowLabel}>Download summary</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [styles.actionRow, pressed && styles.actionRowPressed]}
                  onPress={onContactSupport}
                >
                  <MaterialIcons name="support-agent" size={22} color={BLACK} />
                  <Text style={styles.actionRowLabel}>Contact support</Text>
                </Pressable>
              </>
            )}

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
          styles.scrollContentTop,
          { paddingBottom: scrollBottomPad },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statusRow}>
          <Text style={styles.disputeId}>{dispute.id}</Text>
          <View style={[styles.statusPill, { backgroundColor: pill.bg }]}>
            <Text style={[styles.statusPillText, { color: pill.fg }]}>{statusText}</Text>
          </View>
        </View>
        <Text style={styles.pageHeadline}>{dispute.title}</Text>

        <View style={styles.card}>
          <View style={styles.metaGrid}>
            <MetaCell label="Vendor" value={dispute.vendorName} />
            <MetaCell label="Order date" value={dispute.orderDateLabel} />
            <MetaCell label="Delivery date" value={dispute.deliveryDateLabel} />
            <MetaCell label="Order no." value={dispute.orderNumberDisplay} valueIsLink />
          </View>

          <View style={styles.tableHeader}>
            <Text style={[styles.tableHCell, styles.tableHName]}>Item name</Text>
            <Text style={styles.tableHCell}>Qty</Text>
            <Text style={styles.tableHCell}>Unit</Text>
            <Text style={styles.tableHCell}>Total</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.tableHName]} numberOfLines={2}>
              {dispute.lineItem.name}
            </Text>
            <Text style={styles.tableCell}>{String(dispute.lineItem.qty)}</Text>
            <Text style={styles.tableCell}>
              {formatNaira(dispute.lineItem.unitPriceRupees)}
            </Text>
            <Text style={styles.tableCellStrong}>
              {formatNaira(dispute.lineItem.totalRupees)}
            </Text>
          </View>
        </View>

        <View style={[styles.card, styles.cardSpaced]}>
          <View style={styles.noteHeader}>
            <Icon name="storefront-outline" size={18} color={MUTED} />
            <Text style={styles.noteTitle}>Your summary</Text>
          </View>
          <Text style={styles.noteBody}>{dispute.vendorNote}</Text>
        </View>

        <View style={[styles.card, styles.cardSpaced]}>
          <View style={styles.cardTitleRow}>
            <Icon name="shield-checkmark-outline" size={22} color={BLACK} />
            <Text style={styles.cardTitle}>Dispute details</Text>
          </View>
          <AnalysisField
            label="Dispute reason"
            value={dispute.disputeReason}
            highlight
          />
          <AnalysisField label="Item condition" value={dispute.itemCondition} highlight />
          <AnalysisField
            label="Payment held in escrow"
            value={formatNaira(dispute.paymentEscrowRupees)}
            highlight={false}
          />
          <AnalysisField
            label="Preferred resolution"
            value={dispute.preferredResolution}
            highlight={false}
          />
        </View>

        {showEvidence ? (
          <View style={[styles.card, styles.cardSpaced]}>
            <View style={styles.cardTitleRow}>
              <Icon name="document-text-outline" size={22} color={BLACK} />
              <View style={styles.evidenceTitleBlock}>
                <Text style={styles.cardTitle}>Evidence</Text>
                <Text style={styles.evidenceSubtitle}>Your photos & documents</Text>
              </View>
            </View>
            <Text style={styles.evidenceHint}>
              Shown when you reported that you did not receive the item. For other dispute types,
              evidence is optional and may be omitted.
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.evidenceRow}
            >
              {evidenceSlots.map((ev, idx) => (
                <EvidenceThumb
                  key={ev.uri ?? `ev-slot-${idx}`}
                  uri={ev.uri}
                  kind={ev.kind}
                />
              ))}
            </ScrollView>
          </View>
        ) : null}

        <View style={[styles.card, styles.cardSpaced]}>
          <View style={styles.cardTitleRow}>
            <Icon name="person-outline" size={22} color={BLACK} />
            <Text style={styles.cardTitle}>Expectation mismatch</Text>
          </View>
          <Text style={styles.subSectionLabel}>What you expected</Text>
          <Text style={styles.bodyText}>{dispute.expectationExpected}</Text>
          <Text style={[styles.subSectionLabel, styles.subSectionSpaced]}>
            What you received instead
          </Text>
          <Text style={styles.bodyText}>{dispute.expectationGotInstead}</Text>
        </View>

        {dispute.resolution ? (
          <View style={[styles.card, styles.cardSpaced]}>
            <Text style={styles.sectionTitle}>Resolution</Text>
            <Text style={[styles.bodyText, styles.resolutionText]}>{dispute.resolution}</Text>
          </View>
        ) : null}

        <View style={[styles.card, styles.cardSpaced]}>
          <Text style={styles.sectionTitle}>Activity</Text>
          <DisputeActivityTimeline steps={timeline} />
        </View>
      </ScrollView>

      {/* {!isResolved ? (
        <View style={[styles.fabBar, { bottom: fabBottom, paddingBottom: 4 }]}>
          <Pressable
            style={({ pressed }) => [styles.fabAccept, pressed && styles.fabPressed]}
            onPress={onAcceptOffer}
          >
            <Icon name="checkmark-circle" size={20} color={WHITE} />
            <Text style={styles.fabAcceptText}>Accept</Text>
          </Pressable>
          {showEvidence ? (
            <Pressable
              style={({ pressed }) => [styles.fabSecondary, pressed && styles.fabPressed]}
              onPress={onSubmitEvidenceFab}
            >
              <Text style={styles.fabSecondaryText}>Submit evidence</Text>
              <Icon name="chevron-forward" size={18} color={BLACK} />
            </Pressable>
          ) : null}
          <Pressable
            style={({ pressed }) => [styles.fabMore, pressed && styles.fabPressed]}
            onPress={openActions}
          >
            <Text style={styles.fabSecondaryText}>More</Text>
            <Icon name="chevron-down" size={18} color={BLACK} />
          </Pressable>
        </View>
      ) : null} */}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: PAGE_BG,
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
    borderRadius: 2,
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
  scrollContentTop: {
    paddingTop: 12,
  },
  empty: {
    flex: 1,
    backgroundColor: PAGE_BG,
    paddingHorizontal: 20,
  },
  muted: {
    color: MUTED,
    fontSize: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 12,
  },
  disputeId: {
    fontSize: 18,
    fontWeight: '700',
    color: BLACK,
    flex: 1,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  pageHeadline: {
    fontSize: 17,
    fontWeight: '700',
    color: BLACK,
    marginBottom: 14,
    lineHeight: 24,
  },
  card: {
    backgroundColor: WHITE,
    borderRadius: 5,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E8E8E8',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  cardSpaced: {
    marginTop: 12,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 14,
    gap: 12,
  },
  metaCell: {
    width: '47%',
    minWidth: '45%',
  },
  metaCaps: {
    fontSize: 11,
    fontWeight: '600',
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metaStrong: {
    fontSize: 15,
    fontWeight: '600',
    color: BLACK,
  },
  metaLink: {
    fontSize: 15,
    fontWeight: '700',
    color: LINK,
  },
  tableHeader: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#EEEEEE',
    paddingTop: 12,
    paddingBottom: 8,
  },
  tableHCell: {
    fontSize: 10,
    fontWeight: '700',
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    width: '18%',
    textAlign: 'right',
  },
  tableHName: {
    width: '46%',
    textAlign: 'left',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 4,
  },
  tableCell: {
    fontSize: 14,
    color: BLACK,
    width: '18%',
    textAlign: 'right',
  },
  tableCellStrong: {
    fontSize: 14,
    fontWeight: '700',
    color: BLACK,
    width: '18%',
    textAlign: 'right',
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: BLACK,
  },
  noteBody: {
    fontSize: 15,
    color: BLACK,
    lineHeight: 22,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: BLACK,
  },
  evidenceTitleBlock: {
    flex: 1,
  },
  evidenceSubtitle: {
    fontSize: 13,
    color: MUTED,
    marginTop: 2,
  },
  evidenceHint: {
    fontSize: 12,
    color: MUTED,
    lineHeight: 17,
    marginBottom: 12,
  },
  evidenceRow: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 8,
  },
  thumbOuter: {
    width: 96,
    height: 96,
    borderRadius: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#111',
    backgroundColor: '#F0F0F0',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.72)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  thumbBadgeText: {
    color: WHITE,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  thumbPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#C8C8C8',
    borderStyle: 'dashed',
  },
  thumbPhLabel: {
    fontSize: 11,
    color: MUTED,
    marginTop: 4,
    fontWeight: '600',
  },
  analysisField: {
    marginBottom: 14,
  },
  analysisLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  analysisValue: {
    fontSize: 15,
    fontWeight: '600',
    color: BLACK,
    lineHeight: 21,
  },
  limeText: {
    color: LIME,
    fontWeight: '700',
  },
  subSectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  subSectionSpaced: {
    marginTop: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: BLACK,
    marginBottom: 12,
  },
  bodyText: {
    fontSize: 15,
    color: BLACK,
    lineHeight: 22,
  },
  resolutionText: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  fabBar: {
    position: 'absolute',
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: WHITE,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E4E4E4',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
  fabAccept: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: TEAL,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    flexGrow: 1,
    flexShrink: 1,
  },
  fabAcceptText: {
    color: WHITE,
    fontSize: 15,
    fontWeight: '700',
  },
  fabSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F0F0',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 999,
    flexShrink: 0,
  },
  fabSecondaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: BLACK,
  },
  fabMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#F0F0F0',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 999,
    flexShrink: 0,
  },
  fabPressed: {
    opacity: 0.88,
  },
  tlWrap: {
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
    borderRadius: 2.5,
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
