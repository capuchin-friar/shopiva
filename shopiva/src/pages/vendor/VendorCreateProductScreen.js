import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Create product flow (nested under Products tab stack).
 */
export default function VendorCreateProductScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');

  const onSaveDraft = useCallback(() => {
    Alert.alert('Save draft', 'Wire to your product API when ready.');
  }, []);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backHit}
          onPress={() => navigation.goBack()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Icon name="chevron-back" size={26} color="#111111" />
        </TouchableOpacity>
        <Text style={styles.title}>New product</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>Product name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Crossbody bag"
          placeholderTextColor="#9CA3AF"
          value={name}
          onChangeText={setName}
        />
        <Text style={styles.hint}>Photos, price, and variants can follow in the next step.</Text>

        <TouchableOpacity style={styles.primaryBtn} onPress={onSaveDraft} activeOpacity={0.88}>
          <Text style={styles.primaryBtnText}>Save as draft</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F4F5F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  backHit: {
    padding: 4,
    width: 40,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
    color: '#111111',
  },
  headerSpacer: {
    width: 40,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111111',
  },
  hint: {
    marginTop: 10,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  primaryBtn: {
    marginTop: 28,
    backgroundColor: '#111111',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
