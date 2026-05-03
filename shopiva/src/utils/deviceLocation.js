import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

/**
 * @returns {Promise<boolean>}
 */
export async function requestLocationPermission() {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location permission',
          message:
            'Shopiva uses your location once to fill city and country. You can edit the fields or type them manually if you prefer.',
          buttonPositive: 'Allow',
          buttonNegative: 'Deny',
          buttonNeutral: 'Cancel',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch {
      return false;
    }
  }
  // iOS: permission prompt runs when getCurrentPosition is called (requires Info.plist string).
  return true;
}

/**
 * @returns {Promise<{ latitude: number; longitude: number }>}
 */
export function getCurrentCoordinates() {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => {
        reject(err instanceof Error ? err : new Error(String(err?.message ?? err)));
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 60000,
      },
    );
  });
}

/**
 * Reverse geocode via HTTPS API (no API key). Falls back to empty strings on failure.
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<{ city: string; state: string; country: string }>}
 */
export async function reverseGeocodeToPlace(latitude, longitude) {
  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${encodeURIComponent(
    latitude,
  )}&longitude=${encodeURIComponent(longitude)}&localityLanguage=en`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Geocoding failed (${res.status})`);
  }
  const data = await res.json();
  const city = String(data.city ?? data.locality ?? '').trim();
  const state = String(data.principalSubdivision ?? '').trim();
  const country = String(data.countryName ?? '').trim();
  return { city, state, country };
}
