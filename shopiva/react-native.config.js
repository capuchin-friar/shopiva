/**
 * Helps the RN CLI and autolinking resolve the Android application id consistently.
 * react-native-video is linked via autolinking (no manual MainApplication edits).
 */
module.exports = {
  project: {
    android: {
      packageName: 'com.shopiva',
    },
  },
};
