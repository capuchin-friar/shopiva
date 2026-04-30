

import React, { useCallback, useEffect } from 'react';
import RootNavigator from './authentication';
import {
  Alert,
  Linking,
  SafeAreaView,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { parseOAuthCallbackUrl, oauthErrorMessage } from '../api/oauth';
import AuthBootstrap from '../auth/AuthBootstrap';
import { useAuth } from '../hooks/useAuth';
import { Provider, useDispatch } from 'react-redux';
import store from "../../redux/store"
import Tools from "../utils/gen"
import { set_nested_nav } from '../../redux/nested_nav';
import { navigationRef } from './root';

export { navigationRef, navigate } from './root';

/** Renders inside `<Provider>` so `useDispatch` and navigation share one Redux context. */
function NavigationTree() {
  const dispatch = useDispatch();
  const { signIn } = useAuth();

  const handleOAuthUrl = useCallback(
    async (url) => {
      if (!url || !String(url).includes('shopiva://oauth')) {
        return;
      }
      const parsed = parseOAuthCallbackUrl(String(url));
      if (!parsed) {
        return;
      }
      if (parsed.error) {
        Alert.alert('Sign-in', oauthErrorMessage(parsed.error));
        return;
      }
      if (!parsed.token) {
        return;
      }
      try {
        await signIn(parsed.token, null);
      } catch (e) {
        Alert.alert('Sign-in', e instanceof Error ? e.message : String(e));
      }
    },
    [signIn],
  );

  useEffect(() => {
    const sub = Linking.addEventListener('url', ({ url }) => {
      void handleOAuthUrl(url);
    });
    Linking.getInitialURL().then((url) => {
      if (url) void handleOAuthUrl(url);
    });
    return () => sub.remove();
  }, [handleOAuthUrl]);

  return (
    <NavigationContainer
      // ref={navigationRef}
      // onStateChange={async () => {
      //   const currentRoute = navigationRef.current?.getCurrentRoute();
      //   const name = currentRoute?.name;
      //   console.log(name);

      //   if (name) {
      //     console.log('📍 Current screen:', name);
      //     const rootTabRoutes = new Set([
            
      //     ]);

      //     if (rootTabRoutes.has(name)) {
      //       dispatch(set_nested_nav({ boolean: true, id: Tools.generateId() }));
      //     } else {
      //       dispatch(set_nested_nav({ boolean: false, id: Tools.generateId() }));
      //     }
      //   }
      // }}
    >
      <RootNavigator />
    </NavigationContainer>
  );
}

function NavigationHandler() {
  return (
    <>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />
        <Provider store={store}>
          <AuthBootstrap />
          <NavigationTree />
        </Provider>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default NavigationHandler;
