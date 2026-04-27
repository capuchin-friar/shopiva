import { useMemo } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { formatNaira } from '../utils/formatNaira';

function normalizeAmount(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, n);
}

/**
 * @param {{ navigation: import('@react-navigation/native').NavigationProp<Record<string, object | undefined>>; route: { params?: Record<string, unknown> } }} props
 */
export default function PaymentSuccessScreen({ navigation, route }) {
  const subtotal = normalizeAmount(route?.params?.subtotal);
  const shipping = normalizeAmount(route?.params?.shipping);
  const total = normalizeAmount(route?.params?.total || subtotal + shipping);
  const itemCount = Math.max(0, Number(route?.params?.itemCount) || 0);
  const reference = String(route?.params?.reference || '').trim();

  const paidLabel = useMemo(() => formatNaira(total), [total]);
  const parentTabNav = navigation.getParent();
  const receiptText = useMemo(() => {
    const lines = [
      'SHOPIVA PAYMENT RECEIPT',
      '',
      `Status: Paid`,
      `Reference: ${reference || 'N/A'}`,
      `Items: ${itemCount}`,
      `Item price: ${formatNaira(subtotal)}`,
      `Shipping: ${shipping > 0 ? formatNaira(shipping) : 'Free'}`,
      `Grand total: ${paidLabel}`,
      '',
      `Generated: ${new Date().toLocaleString()}`,
    ];
    return lines.join('\n');
  }, [reference, itemCount, subtotal, shipping, paidLabel]);

  const onShareReceipt = async () => {
    try {
      await Share.share({
        title: 'Shopiva payment receipt',
        message: receiptText,
      });
    } catch (e) {
      Alert.alert('Share failed', e instanceof Error ? e.message : String(e));
    }
  };

  const onPrintReceipt = async () => {
    try {
      await Share.share({
        title: 'Print payment receipt',
        message: receiptText,
      });
      Alert.alert('Print receipt', 'Select the Print option from the share sheet.');
    } catch (e) {
      Alert.alert('Print unavailable', e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroWrap}>
          <View style={styles.heroGlow}>
            <View style={styles.iconCircle}>
              <Icon name="checkmark-outline" size={44} color="#FFFFFF" />
            </View>
          </View>
        </View>

        <Text style={styles.title}>Payment Successful!</Text>
        <Text style={styles.subtitle}>Successfully paid {paidLabel}</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Items</Text>
            <Text style={styles.value}>{itemCount}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Item price</Text>
            <Text style={styles.value}>{formatNaira(subtotal)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Shipping</Text>
            <Text style={styles.value}>{shipping > 0 ? formatNaira(shipping) : 'Free'}</Text>
          </View>
          <View style={[styles.row, styles.totalRow]}>
            <Text style={styles.totalLabel}>Grand total</Text>
            <Text style={styles.totalValue}>{paidLabel}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.paidPill}>
              <Text style={styles.paidPillText}>Paid</Text>
            </View>
          </View>
          {reference ? (
            <Text style={styles.referenceText} numberOfLines={2}>
              Ref: {reference}
            </Text>
          ) : null}
        </View>

        <Pressable
          style={styles.primaryBtn}
          onPress={() => parentTabNav?.navigate('Chat')}
          accessibilityRole="button"
        >
          <Text style={styles.primaryBtnText}>Continue to chat</Text>
        </Pressable>
        <Pressable
          style={styles.secondaryBtn}
          onPress={() => parentTabNav?.navigate('Activities')}
          accessibilityRole="button"
        >
          <Text style={styles.secondaryBtnText}>Continue to orders</Text>
        </Pressable>
        <View style={styles.utilityRow}>
          <Pressable style={styles.utilityBtn} onPress={() => void onPrintReceipt()} accessibilityRole="button">
            <Icon name="print-outline" size={18} color="#344054" />
            <Text style={styles.utilityBtnText}>Print receipt</Text>
          </Pressable>
          <Pressable style={styles.utilityBtn} onPress={() => void onShareReceipt()} accessibilityRole="button">
            <Icon name="share-social-outline" size={18} color="#344054" />
            <Text style={styles.utilityBtnText}>Share receipt</Text>
          </Pressable>
        </View>
        <Pressable style={styles.ghostBtn} onPress={() => navigation.navigate('home')} accessibilityRole="button">
          <Text style={styles.ghostBtnText}>Back Home</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F7F7F8',
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 28,
  },
  heroWrap: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 14,
  },
  heroGlow: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#DDF7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#00926e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    fontSize: 33,
    fontWeight: '800',
    color: '#101828',
    marginBottom: 6,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 18,
    color: '#667085',
    marginBottom: 22,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ECEDEE',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 26,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  label: {
    fontSize: 16,
    color: '#6B7280',
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  totalRow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
    marginTop: 4,
    paddingTop: 14,
  },
  totalLabel: {
    fontSize: 21,
    fontWeight: '800',
    color: '#111827',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  paidPill: {
    borderWidth: 1,
    borderColor: '#52C41A',
    backgroundColor: '#F6FFED',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  paidPillText: {
    color: '#389E0D',
    fontSize: 14,
    fontWeight: '700',
  },
  referenceText: {
    marginTop: 10,
    color: '#667085',
    fontSize: 13,
  },
  primaryBtn: {
    backgroundColor: '#00926e',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    marginBottom: 10,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    marginBottom: 8,
  },
  secondaryBtnText: {
    color: '#344054',
    fontSize: 17,
    fontWeight: '700',
  },
  utilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
    marginBottom: 8,
    gap: 10,
  },
  utilityBtn: {
    flex: 1,
    minHeight: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  utilityBtnText: {
    color: '#344054',
    fontSize: 14,
    fontWeight: '600',
  },
  ghostBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
  },
  ghostBtnText: {
    color: '#667085',
    fontSize: 15,
    fontWeight: '600',
  },
});
