import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

const PURPLE = '#00926e';

/**
 * @param {{
 *   visible: boolean;
 *   onClose: () => void;
 *   title: string;
 *   clauses: { title: string; content: string }[];
 *   emptyMessage?: string;
 *   loading?: boolean;
 * }} props
 */
export default function ShopPolicyViewerModal({ visible, onClose, title, clauses, emptyMessage, loading = false }) {
  const insets = useSafeAreaInsets();
  const has = Array.isArray(clauses) && clauses.some((c) => c.title || c.content);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close policy" />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
          <View style={styles.header}>
            <Text style={styles.headerTitle} numberOfLines={2}>
              {title}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close">
              <Icon name="close" size={28} color="#111" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator>
            {loading ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator size="large" color={PURPLE} />
                <Text style={styles.loadingText}>Loading policies…</Text>
              </View>
            ) : !has ? (
              <Text style={styles.empty}>{emptyMessage || 'This shop has not added details for this policy yet.'}</Text>
            ) : (
              clauses.map((c, i) => (
                <View key={`${i}-${c.title}`} style={styles.block}>
                  {c.title ? <Text style={styles.clauseTitle}>{c.title}</Text> : null}
                  {c.content ? <Text style={styles.clauseBody}>{c.content}</Text> : null}
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '85%',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  scroll: {
    maxHeight: 480,
  },
  empty: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    paddingVertical: 8,
  },
  loadingWrap: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#666',
  },
  block: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  clauseTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: PURPLE,
    marginBottom: 8,
  },
  clauseBody: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
});
