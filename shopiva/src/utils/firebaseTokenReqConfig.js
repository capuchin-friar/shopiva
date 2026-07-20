import messaging from '@react-native-firebase/messaging';
import {PermissionsAndroid, Platform} from 'react-native';

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

async function getFcmToken() {
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
