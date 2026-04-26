import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSeedMessages } from '../data/chatMocks';

const BG = '#ECE5DD';
const INCOMING = '#FFFFFF';
const OUTGOING = '#DCF8C6';
const HEADER = '#075E54';
const BLACK = '#111111';
const MUTED = '#667781';
const INPUT_BG = '#F0F0F0';
const SEND_GREEN = '#00A884';

function TodayChip() {
  return (
    <View style={styles.todayWrap}>
      <View style={styles.todayChip}>
        <Text style={styles.todayText}>Today</Text>
      </View>
    </View>
  );
}

/**
 * @param {{ item: { id: string; text: string; outgoing: boolean; timeLabel: string } }} p
 */
function Bubble({ item }) {
  const out = item.outgoing;
  return (
    <View style={[styles.bubbleRow, out ? styles.bubbleRowOut : styles.bubbleRowIn]}>
      <View style={[styles.bubble, out ? styles.bubbleOut : styles.bubbleIn]}>
        <Text style={styles.bubbleText}>{item.text}</Text>
        <View style={[styles.bubbleMetaRow, out ? styles.bubbleMetaRowOut : styles.bubbleMetaRowIn]}>
          <Text style={[styles.bubbleMeta, out && styles.bubbleMetaOut]}>{item.timeLabel}</Text>
          {out ? (
            <Icon name="checkmark-done" size={14} color="#53BDEB" style={styles.tickIcon} />
          ) : null}
        </View>
      </View>
    </View>
  );
}

export default function ChatRoomScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const chat = route.params?.chat;

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(() => (chat ? getSeedMessages(chat.id) : []));
  const listRef = useRef(null);

  const headerActions = useCallback(() => {
    Alert.alert('Call', 'Voice and video calls will be available when connected.');
  }, []);

  useLayoutEffect(() => {
    if (!chat) {
      navigation.setOptions({
        title: 'Chat',
        headerStyle: { backgroundColor: HEADER },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { color: '#FFFFFF', fontWeight: '600' },
        headerShadowVisible: false,
        headerRight: undefined,
      });
      return;
    }
    navigation.setOptions({
      title: chat.name,
      headerStyle: { backgroundColor: HEADER },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: { color: '#FFFFFF', fontWeight: '600', fontSize: 18 },
      headerShadowVisible: false,
      headerBackTitle: 'Chats',
      headerRight: () => (
        <View style={styles.headerRight}>
          <Pressable
            hitSlop={12}
            onPress={headerActions}
            style={styles.headerIconBtn}
            accessibilityLabel="Video call"
          >
            <Icon name="videocam-outline" size={24} color="#FFFFFF" />
          </Pressable>
          <Pressable
            hitSlop={12}
            onPress={headerActions}
            style={styles.headerIconBtn}
            accessibilityLabel="Voice call"
          >
            <Icon name="call-outline" size={22} color="#FFFFFF" />
          </Pressable>
        </View>
      ),
    });
  }, [navigation, chat, headerActions]);

  const onSend = useCallback(() => {
    const t = input.trim();
    if (!t) return;
    const now = new Date();
    const timeLabel = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [
      ...prev,
      { id: `local-${now.getTime()}`, text: t, outgoing: true, timeLabel },
    ]);
    setInput('');
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  }, [input]);

  const renderItem = useCallback(({ item }) => <Bubble item={item} />, []);
  const keyExtractor = useCallback((m) => m.id, []);

  const listHeader = useMemo(() => <TodayChip />, []);

  const listContentStyle = useMemo(
    () => [
      styles.listPad,
      {
        flexGrow: 1,
        paddingTop: 8,
        paddingBottom: 12 + insets.bottom,
      },
    ],
    [insets.bottom],
  );

  const inputBarStyle = useMemo(
    () => [
      styles.inputBar,
      {
        paddingBottom: Math.max(insets.bottom, 8),
        paddingTop: 6,
      },
    ],
    [insets.bottom],
  );

  const canSend = input.trim().length > 0;

  if (!chat) {
    return (
      <SafeAreaView style={styles.empty} edges={['top', 'left', 'right']}>
        <Text style={styles.emptyText}>Chat not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.flex}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListHeaderComponent={listHeader}
          contentContainerStyle={listContentStyle}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />

        <View style={inputBarStyle}>
          <View style={styles.inputRow}>
            <Pressable
              style={({ pressed }) => [styles.sideBtn, pressed && styles.sideBtnPressed]}
              onPress={() => Alert.alert('Attach', 'Photos, documents and location will be available when connected.')}
              accessibilityLabel="Attach"
            >
              <Icon name="add" size={28} color={MUTED} />
            </Pressable>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder="Message"
                placeholderTextColor={MUTED}
                value={input}
                onChangeText={setInput}
                multiline
                maxLength={4000}
                accessibilityLabel="Message text"
              />
              <Pressable
                style={({ pressed }) => [styles.inlineIcon, pressed && styles.sideBtnPressed]}
                onPress={() => Alert.alert('Stickers', 'Emoji and stickers picker will open here.')}
                accessibilityLabel="Emoji"
              >
                <Icon name="happy-outline" size={24} color={MUTED} />
              </Pressable>
            </View>
            {canSend ? (
              <Pressable
                onPress={onSend}
                style={({ pressed }) => [styles.sendBtn, pressed && styles.sendBtnPressed]}
                accessibilityRole="button"
                accessibilityLabel="Send message"
              >
                <Icon name="send" size={20} color="#FFFFFF" />
              </Pressable>
            ) : (
              <Pressable
                style={({ pressed }) => [styles.sendBtn, styles.micBtn, pressed && styles.sendBtnPressed]}
                onPress={() => Alert.alert('Voice message', 'Hold to record will be available when connected.')}
                accessibilityLabel="Voice message"
              >
                <Icon name="mic" size={22} color="#FFFFFF" />
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: BG,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 4,
    gap: 2,
  },
  headerIconBtn: {
    padding: 8,
  },
  empty: {
    flex: 1,
    backgroundColor: BG,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: MUTED,
  },
  todayWrap: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  todayChip: {
    backgroundColor: 'rgba(228, 228, 228, 0.92)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 10,
  },
  todayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#54656F',
  },
  listPad: {
    paddingHorizontal: 8,
  },
  bubbleRow: {
    marginBottom: 4,
    flexDirection: 'row',
  },
  bubbleRowIn: {
    justifyContent: 'flex-start',
  },
  bubbleRowOut: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0.5 },
        shadowOpacity: 0.1,
        shadowRadius: 1.5,
      },
      android: { elevation: 1 },
    }),
  },
  bubbleIn: {
    backgroundColor: INCOMING,
    borderTopLeftRadius: 2,
  },
  bubbleOut: {
    backgroundColor: OUTGOING,
    borderTopRightRadius: 2,
  },
  bubbleText: {
    fontSize: 16,
    color: BLACK,
    lineHeight: 21,
  },
  bubbleMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  bubbleMetaRowIn: {
    justifyContent: 'flex-start',
  },
  bubbleMetaRowOut: {
    justifyContent: 'flex-end',
  },
  bubbleMeta: {
    fontSize: 11,
    color: MUTED,
  },
  bubbleMetaOut: {
    color: MUTED,
  },
  tickIcon: {
    marginBottom: -1,
  },
  inputBar: {
    backgroundColor: INPUT_BG,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#D0D0D0',
    paddingHorizontal: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  sideBtn: {
    width: 40,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  sideBtnPressed: {
    opacity: 0.65,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingLeft: 12,
    paddingRight: 4,
    paddingVertical: 4,
    minHeight: 46,
    maxHeight: 120,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: BLACK,
    maxHeight: 110,
    paddingVertical: 8,
    minHeight: 38,
  },
  inlineIcon: {
    padding: 6,
    marginBottom: 2,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: SEND_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  micBtn: {
    backgroundColor: SEND_GREEN,
  },
  sendBtnPressed: {
    opacity: 0.88,
  },
});
