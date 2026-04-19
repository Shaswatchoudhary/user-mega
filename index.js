import { AppRegistry } from 'react-native';
import { getMessaging, setBackgroundMessageHandler } from '@react-native-firebase/messaging';
import appCheck, { ReactNativeFirebaseAppCheckProvider } from '@react-native-firebase/app-check';
import axios from 'axios';
import App from './App';
import { name as appName } from './app.json';

// 1. Configure Global Axios for Render's Free Tier (Cold Start)
axios.defaults.timeout = 15000;
axios.defaults.headers.common['Accept'] = 'application/json';

/**
 * 2. Background Message Handler (Modular)
 * Wrapped in try/catch to ensure app processes continue if it fails
 */
try {
  const messaging = getMessaging();
  setBackgroundMessageHandler(messaging, async remoteMessage => {
    console.log('[FCM Background] Message received:', remoteMessage);
  });
} catch (error) {
  console.warn('[FCM] Background handler setup failed:', error.message);
}

/**
 * 3. Firebase App Check (Modular/Standard)
 */
try {
  const provider = new ReactNativeFirebaseAppCheckProvider();
  provider.configure({
    android: {
      provider: 'debug',
      debugToken: 'DF33FC9B-52F9-4515-B19E-E7492108FF15',
    },
  });

  appCheck().initializeAppCheck({
    provider,
    isTokenAutoRefreshEnabled: true,
  });
  console.log('[AppCheck] Initialized successfully');
} catch (error) {
  console.warn('[AppCheck] Initialization failed:', error.message);
}

// 4. Register Component (Critical - must always run)
AppRegistry.registerComponent(appName, () => App);