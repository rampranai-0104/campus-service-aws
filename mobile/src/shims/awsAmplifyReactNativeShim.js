'use strict';

// Safe, 100% pure-JavaScript drop-in replacement for @aws-amplify/react-native in Expo Go runtime.

const { Platform, AppState } = require('react-native');
const { Buffer } = require('buffer');
const base64 = require('base-64');

const getOperatingSystem = () => Platform.OS;

const getDeviceName = async () => 'Expo Go Android';

const getIsNativeError = (err) => {
  return (
    err instanceof Error &&
    'code' in err &&
    ('nativeStackIOS' in err || 'nativeStackAndroid' in err)
  );
};

const loadAmplifyRtnPasskeys = () => null;

const loadAmplifyPushNotification = () => null;

const loadAmplifyWebBrowser = () => {
  try {
    return require('expo-web-browser');
  } catch (_e) {
    return null;
  }
};

const loadAsyncStorage = () => {
  try {
    const mod = require('@react-native-async-storage/async-storage');
    return mod?.default || mod;
  } catch (_e) {
    return null;
  }
};

const loadNetInfo = () => {
  try {
    const mod = require('@react-native-community/netinfo');
    return mod?.default || mod;
  } catch (_e) {
    return null;
  }
};

const loadBuffer = () => Buffer;

const loadUrlPolyfill = () => {
  try {
    require('react-native-url-polyfill/auto');
  } catch (_e) {}
};

const loadGetRandomValues = () => {
  try {
    require('react-native-get-random-values');
  } catch (_e) {}
};

const loadBase64 = () => ({
  decode: base64.decode,
  encode: base64.encode,
});

const loadAppState = () => AppState;

module.exports = {
  getOperatingSystem,
  getDeviceName,
  getIsNativeError,
  loadAmplifyRtnPasskeys,
  loadAmplifyPushNotification,
  loadAmplifyWebBrowser,
  loadAsyncStorage,
  loadNetInfo,
  loadBuffer,
  loadUrlPolyfill,
  loadGetRandomValues,
  loadBase64,
  loadAppState,
};
