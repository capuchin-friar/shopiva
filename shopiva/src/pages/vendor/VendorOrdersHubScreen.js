import { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Entry for the Order tab: nested orders list and disputes (vendor-only).
 */
export default function VendorOrdersHubScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const goOrders = useCallback(() => {
    navigation.navigate('VendorOrderFlow');
  }, [navigation]);

  const goDisputes = useCallback(() => {
    navigation.navigate('VendorDisputeFlow');
  }, [navigation]);

  return (
    <View style={[styles.root, { paddingTop: 15 }]}>
      
      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.optionRow} onPress={goOrders} activeOpacity={0.85}>
          <View style={[styles.optionIcon, styles.optionIconGreen]}>
            <Icon name="receipt-outline" size={22} color="#047857" />
          </View>
          <View style={styles.optionBody}>
            <Text style={styles.optionTitle}>Orders</Text>
            <Text style={styles.optionDesc}>View and manage customer orders</Text>
          </View>
          <Icon name="chevron-forward" size={22} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionRow} onPress={goDisputes} activeOpacity={0.85}>
          <View style={[styles.optionIcon, styles.optionIconAmber]}>
            <Icon name="alert-circle-outline" size={22} color="#B45309" />
          </View>
          <View style={styles.optionBody}>
            <Text style={styles.optionTitle}>Disputes</Text>
            <Text style={styles.optionDesc}>Resolve issues and messages</Text>
          </View>
          <Icon name="chevron-forward" size={22} color="#9CA3AF" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F4F5F7',
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111111',
  },
  sub: {
    marginTop: 8,
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  list: {},
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  optionIconGreen: {
    backgroundColor: '#D1FAE5',
  },
  optionIconAmber: {
    backgroundColor: '#FEF3C7',
  },
  optionBody: {
    flex: 1,
    minWidth: 0,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111111',
  },
  optionDesc: {
    marginTop: 4,
    fontSize: 14,
    color: '#6B7280',
  },
});
