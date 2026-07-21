import { useEffect } from 'react';
import { Platform, StatusBar, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { WIPE_STORAGE_ON_LAUNCH } from './src/auth/devAuth';
import { clearAllShopivaStorage } from './src/auth/session';
import { getPaystackPublicKey, isPaystackConfigured, warnIfPaystackLiveInDev } from './src/config/paystack';
import { getPaystackProvider } from './src/paystack/paystackNativeGate';
import NavigationHandler from './src/navigation/index';
import {
  requestPermission,
  requestAndroidPermission,
  setupFcmListeners,
} from './src/utils/firebaseTokenReqConfig';
import messaging from '@react-native-firebase/messaging';
import Tools from './src/utils/gen';
import AsyncStorage from '@react-native-async-storage/async-storage';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    if (WIPE_STORAGE_ON_LAUNCH) {
      void clearAllShopivaStorage();
    }
    warnIfPaystackLiveInDev();
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (Platform.OS === 'android') {
        await requestAndroidPermission();
      }
      if (!cancelled) {
        await requestPermission();
      }
    })();

    const unsubscribe = setupFcmListeners();
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    messaging()
    .getToken()
    .then(async(token) => {
      console.log('Device FCM Token:', token);
      await AsyncStorage.setItem("fcm", (token));
      // await (await Tools.Memory()).store('fcm', token);
    });
  }, []);

  const paystackPublicKey = getPaystackPublicKey();
  const paystackReady = isPaystackConfigured();
  const PaystackProvider = paystackReady ? getPaystackProvider() : null;

  const appBody = (
    <>
      {/* <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} /> */}
      <NavigationHandler />
    </>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider style={{flex: 1}}>
        {PaystackProvider ? (
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
