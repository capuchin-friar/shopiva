/**
 * Helps the RN CLI and autolinking resolve the Android application id consistently.
 * Native modules (e.g. react-native-video) link via autolinking.
 */
module.exports = {
  project: {
    android: {
      packageName: 'com.thetabeam.shopiva',
    },
  },
};
