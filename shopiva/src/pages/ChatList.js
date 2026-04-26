import { useCallback, useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MOCK_CHATS } from '../data/chatMocks';

const PAGE_BG = '#FFFFFF';
const BLACK = '#111111';
const MUTED = '#8E8E93';
const WA_GREEN = '#25D366';
const ROW_SEP = '#ECECEC';
const HEADER_TINT = '#075E54';

/**
 * @param {{ name: string; avatarHue: number }} p
 */
function Avatar({ name, avatarHue }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
  return (
    <View style={[styles.avatar, { backgroundColor: `hsl(${avatarHue}, 42%, 46%)` }]}>
      <Text style={styles.avatarText}>{initials || '?'}</Text>
    </View>
  );
}

/**
 * @param {{ item: Record<string, unknown>; onPress: () => void }} p
 */
function ChatRow({ item, onPress }) {
  const unread = item.unreadCount > 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <Avatar name={item.name} avatarHue={item.avatarHue} />
      <View style={styles.rowBody}>
        <View style={styles.rowTop}>
          <Text style={[styles.name, unread && styles.nameUnread]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.time, unread && styles.timeUnread]}>{item.lastAtLabel}</Text>
        </View>
        <View style={styles.rowBottom}>
          <Text style={[styles.preview, unread && styles.previewUnread]} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          {unread ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {item.unreadCount > 9 ? '9+' : String(item.unreadCount)}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

function ListSeparator() {
  return <View style={styles.fullSep} />;
}

export default function ChatListScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const listHeader = useMemo(
    () => (
      <View style={styles.headerBlock}>
        <Pressable style={styles.searchPill} accessibilityRole="button">
          <Icon name="search-outline" size={18} color={MUTED} />
          <Text style={styles.searchPillText}>Search</Text>
        </Pressable>
        <View style={styles.archivedRow}>
          <View style={styles.archivedIconWrap}>
            <Icon name="archive-outline" size={22} color={HEADER_TINT} />
          </View>
          <View style={styles.archivedTextCol}>
            <Text style={styles.archivedTitle}>Archived</Text>
            <Text style={styles.archivedSub}>Tap to view archived chats</Text>
          </View>
        </View>
      </View>
    ),
    [],
  );

  const renderItem = useCallback(
    ({ item }) => (
      <ChatRow item={item} onPress={() => navigation.navigate('chat-room', { chat: item })} />
    ),
    [navigation],
  );

  const listContentStyle = useMemo(
    () => [styles.listContent, { paddingBottom: Math.max(insets.bottom, 16) + 8 }],
    [insets.bottom],
  );

  return (
    <View style={styles.root}>
      <FlatList
        data={MOCK_CHATS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={ListSeparator}
        contentContainerStyle={listContentStyle}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={listHeader}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  headerBlock: {
    marginBottom: 4,
  },
  listContent: {
    paddingHorizontal: 0,
  },
  searchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 12,
    marginBottom: 6,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 5,
    backgroundColor: '#F3F4F6',
  },
  searchPillText: {
    fontSize: 15,
    color: MUTED,
    flex: 1,
  },
  archivedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  archivedIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 5,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  archivedTextCol: {
    flex: 1,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: ROW_SEP,
    paddingBottom: 12,
  },
  archivedTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: BLACK,
  },
  archivedSub: {
    fontSize: 14,
    color: MUTED,
    marginTop: 2,
  },
  fullSep: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: ROW_SEP,
    marginLeft: 82,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: PAGE_BG,
  },
  rowPressed: {
    backgroundColor: '#F5F5F5',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
    paddingBottom: 10,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    flex: 1,
    fontSize: 17,
    fontWeight: '500',
    color: BLACK,
    paddingRight: 12,
  },
  nameUnread: {
    fontWeight: '700',
  },
  time: {
    fontSize: 13,
    color: MUTED,
  },
  timeUnread: {
    color: WA_GREEN,
    fontWeight: '600',
  },
  rowBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  preview: {
    flex: 1,
    fontSize: 15,
    color: MUTED,
    minWidth: 0,
  },
  previewUnread: {
    color: BLACK,
    fontWeight: '600',
  },
  badge: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 5,
    backgroundColor: WA_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
