import messaging from '@react-native-firebase/messaging';
import {Alert, PermissionsAndroid, Platform} from 'react-native';
import {navigate, navigationRef} from '../navigation/root';

/**
 * Wait until APNs has handed iOS a device token (required before a usable FCM token).
 * @param {number} [timeoutMs]
 * @returns {Promise<string|null>}
 */
async function waitForApnsToken(timeoutMs = 15000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const apnsToken = await messaging().getAPNSToken();
    if (apnsToken) return apnsToken;
    await new Promise((r) => setTimeout(r, 500));
  }
  return null;
}

/**
 * @param {import('@react-native-firebase/messaging').FirebaseMessagingTypes.RemoteMessage | null | undefined} remoteMessage
 */
export function parseFcmMessage(remoteMessage) {
  const data =
    remoteMessage?.data && typeof remoteMessage.data === 'object'
      ? remoteMessage.data
      : {};

  let meta = data.meta;
  if (typeof meta === 'string') {
    try {
      meta = JSON.parse(meta);
    } catch {
      meta = {};
    }
  } else if (!meta || typeof meta !== 'object') {
    meta = {};
  }

  let media = data.media;
  if (typeof media === 'string') {
    try {
      media = JSON.parse(media);
    } catch {
      /* keep string */
    }
  }

  const title =
    remoteMessage?.notification?.title ||
    (typeof data.title === 'string' ? data.title : '') ||
    'Shopiva';
  const body =
    remoteMessage?.notification?.body ||
    (typeof data.body === 'string' ? data.body : '') ||
    '';

  return {title, body, data, meta, media};
}

/**
 * Handle tap / open from a notification (background or quit).
 * Supports optional meta.screen / meta.route for navigation.
 * @param {import('@react-native-firebase/messaging').FirebaseMessagingTypes.RemoteMessage | null | undefined} remoteMessage
 */
export function handleNotificationOpen(remoteMessage) {
  if (!remoteMessage) return;
  const parsed = parseFcmMessage(remoteMessage);
  console.log('[fcm] notification opened:', parsed);

  const routeName =
    typeof parsed.meta.screen === 'string'
      ? parsed.meta.screen
      : typeof parsed.meta.route === 'string'
        ? parsed.meta.route
        : null;
  if (routeName) {
    const params =
      parsed.meta.params && typeof parsed.meta.params === 'object'
        ? parsed.meta.params
        : undefined;
    const tryNavigate = (attempt = 0) => {
      if (navigationRef.isReady()) {
        navigate(routeName, params);
        return;
      }
      if (attempt < 20) {
        setTimeout(() => tryNavigate(attempt + 1), 250);
      } else {
        console.warn('[fcm] navigation not ready; skipped route', routeName);
      }
    };
    setTimeout(() => tryNavigate(), 300);
  }
}

/**
 * Foreground message — no system banner for data-only payloads; show an Alert.
 * @param {import('@react-native-firebase/messaging').FirebaseMessagingTypes.RemoteMessage} remoteMessage
 */
export function handleForegroundMessage(remoteMessage) {
  const parsed = parseFcmMessage(remoteMessage);
  console.log('[fcm] foreground message:', parsed);

  if (!parsed.title && !parsed.body) return;

  Alert.alert(parsed.title || 'Shopiva', parsed.body || '', [
    {text: 'Dismiss', style: 'cancel'},
    {
      text: 'Open',
      onPress: () => handleNotificationOpen(remoteMessage),
    },
  ]);
}

/**
 * Register all in-app FCM listeners. Call once from App root.
 * @returns {() => void} unsubscribe
 */
export function setupFcmListeners() {
  const unsubOnMessage = messaging().onMessage(async (remoteMessage) => {
    handleForegroundMessage(remoteMessage);
  });

  const unsubOpened = messaging().onNotificationOpenedApp((remoteMessage) => {
    handleNotificationOpen(remoteMessage);
  });

  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage) {
        handleNotificationOpen(remoteMessage);
      }
    })
    .catch((e) => {
      console.warn('[fcm] getInitialNotification failed:', e);
    });

  const unsubTokenRefresh = messaging().onTokenRefresh((token) => {
    console.log('[fcm] token refreshed:', token);
  });

  return () => {
    unsubOnMessage();
    unsubOpened();
    unsubTokenRefresh();
  };
}

/**
 * Must be registered early in index.js (outside React tree).
 */
export function registerFcmBackgroundHandler() {
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('[fcm] background message:', parseFcmMessage(remoteMessage));
  });
}

export async function requestPermission() {
  const authStatus = await messaging().requestPermission();

  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (!enabled) {
    console.warn('[fcm] notification permission not granted:', authStatus);
    return null;
  }

  if (Platform.OS === 'ios') {
    const apnsToken = await waitForApnsToken();
    console.log('APNs Token:', apnsToken);
    if (!apnsToken) {
      console.warn(
        '[fcm] No APNs token yet. Use a real device, enable Push Notifications capability, and confirm Bundle ID matches Firebase (com.thetabeam.shopiva).',
      );
      return null;
    }
  }

  const fcmToken = await messaging().getToken();
  console.log('FCM Token:', fcmToken);
  return fcmToken;
}

export async function requestAndroidPermission() {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
  }
}

export async function getFcmToken() {
  if (Platform.OS === 'ios') {
    const apnsToken = await messaging().getAPNSToken();
    if (!apnsToken) {
      console.warn('[fcm] getFcmToken called before APNs token is available');
      return null;
    }
  }
  const token = await messaging().getToken();
  console.log('FCM Token:', token);
  return token;
}
