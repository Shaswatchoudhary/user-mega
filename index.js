import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import App from './App';
import { name as appName } from './app.json';
import appCheck from '@react-native-firebase/app-check';

/**
 * 1. Background Message Handler (MUST be top-level and first)
 */
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('[FCM Background] Message received:', remoteMessage);
  // Notifee can be used here for custom background display if desired
});

/**
 * 2. Firebase App Check (Debug)
 */
const rnfbProvider = appCheck().newReactNativeFirebaseAppCheckProvider();
rnfbProvider.configure({
  android: {
    provider: 'debug',
    debugToken: 'DF33FC9B-52F9-4515-B19E-E7492108FF15',
  },
});

appCheck().initializeAppCheck({
  provider: rnfbProvider,
  isTokenAutoRefreshEnabled: true,
});

AppRegistry.registerComponent(appName, () => App);