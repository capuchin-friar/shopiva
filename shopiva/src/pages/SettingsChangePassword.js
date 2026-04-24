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
import { MUTED, settingsFormStyles as s } from './settingsFields';

export default function SettingsChangePasswordScreen() {
  const insets = useSafeAreaInsets();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const onSave = useCallback(() => {
    if (!currentPassword) {
      Alert.alert('Missing field', 'Enter your current password.');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      Alert.alert('Invalid password', 'Use at least 8 characters for your new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'New password and confirmation must match.');
      return;
    }
    Alert.alert('Password updated', 'Your password has been changed.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  }, [currentPassword, newPassword, confirmPassword]);

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
        <Text style={s.intro}>Choose a strong password you haven’t used elsewhere.</Text>

        <View style={s.card}>
          <Field label="Current password">
            <TextInput
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Current password"
              placeholderTextColor={MUTED}
              style={s.inputSecure}
              secureTextEntry
            />
          </Field>
          <View style={s.divider} />
          <Field label="New password">
            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="At least 8 characters"
              placeholderTextColor={MUTED}
              style={s.inputSecure}
              secureTextEntry
            />
          </Field>
          <View style={s.divider} />
          <Field label="Confirm new password">
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Repeat new password"
              placeholderTextColor={MUTED}
              style={s.inputSecure}
              secureTextEntry
            />
          </Field>
        </View>

        <Pressable style={({ pressed }) => [s.saveBtn, pressed && s.saveBtnPressed]} onPress={onSave}>
          <Text style={s.saveBtnText}>Update password</Text>
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
