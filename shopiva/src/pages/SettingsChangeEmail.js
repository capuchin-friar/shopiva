import { useCallback, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProfile } from '../context/ProfileContext';
import { MUTED, settingsFormStyles as s } from './settingsFields';

export default function SettingsChangeEmailScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useProfile();
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');

  const onSave = useCallback(() => {
    const next = newEmail.trim();
    if (!next) {
      Alert.alert('Missing email', 'Enter your new email address.');
      return;
    }
    if (!currentPassword) {
      Alert.alert('Verify account', 'Enter your current password to change email.');
      return;
    }
    Alert.alert('Request sent', 'Check your new inbox to confirm this change.');
  }, [newEmail, currentPassword]);

  return (
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={[
          s.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* <Text style={s.intro}>
          We’ll send a confirmation link to your new address. Your current password is required.
        </Text> */}

        <View style={s.card}>
          <Field label="Current email">
            <Text style={s.readOnlyValue}>{user?.email?.trim() || '—'}</Text>
          </Field>
          <View style={s.divider} />
          <Field label="New email">
            <TextInput
              value={newEmail}
              onChangeText={setNewEmail}
              placeholder="you@example.com"
              placeholderTextColor={MUTED}
              style={s.input}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </Field>
          <View style={s.divider} />
          <Field label="Current password">
            <TextInput
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Enter password"
              placeholderTextColor={MUTED}
              style={s.inputSecure}
              secureTextEntry
            />
          </Field>
        </View>

        <Pressable style={({ pressed }) => [s.saveBtn, pressed && s.saveBtnPressed]} onPress={onSave}>
          <Text style={s.saveBtnText}>Update email</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, children }) {
  return (
    <View style={s.field}>
      <Text style={s.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}
