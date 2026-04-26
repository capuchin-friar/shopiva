/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaystackProvider } from 'react-native-paystack-webview';
import { WIPE_STORAGE_ON_LAUNCH } from './src/auth/devAuth';
import { clearAllShopivaStorage } from './src/auth/session';
import { getPaystackPublicKey, isPaystackConfigured } from './src/config/paystack';
import NavigationHandler from './src/navigations/index';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    if (WIPE_STORAGE_ON_LAUNCH) {
      void clearAllShopivaStorage();
    }
  }, []);

  const paystackPublicKey = getPaystackPublicKey();
  const paystackReady = isPaystackConfigured();

  const appBody = (
    <>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <NavigationHandler />
    </>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        {paystackReady ? (
          <PaystackProvider
            publicKey={paystackPublicKey}
            currency="NGN"
            defaultChannels={['card', 'ussd', 'bank']}
            debug={__DEV__}
          >
            {appBody}
          </PaystackProvider>
        ) : (
          appBody
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}


export default App;
