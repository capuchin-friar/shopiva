import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AUTH } from './theme';

/**
 * Lightweight launch welcome shown before role onboarding.
 * Auto-continues after 2 seconds.
 */
export default function WelcomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const t = setTimeout(() => {
      navigation.replace('AuthPurpose');
    }, 2000);
    return () => clearTimeout(t);
  }, [navigation]);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <Text style={styles.brand}>Shopiva</Text>
      <Text style={styles.tagline}>Build. Sell. Shop.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AUTH.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  brand: {
    fontSize: 40,
    fontWeight: '900',
    color: AUTH.text,
    letterSpacing: -0.8,
  },
  tagline: {
    marginTop: 10,
    fontSize: 16,
    color: AUTH.textMuted,
    fontWeight: '500',
  },
});
