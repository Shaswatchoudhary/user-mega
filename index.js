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
 * 3. Firebase App Check Initialization
 */
const initAppCheck = async () => {
  try {
    const rnfbProvider = appCheck().newReactNativeFirebaseAppCheckProvider();
    
    rnfbProvider.configure({
      android: {
        provider: __DEV__ ? 'debug' : 'playIntegrity',
        debugToken: 'DF33FC9B-52F9-4515-B19E-E7492108FF15',
      },
      apple: {
        provider: __DEV__ ? 'debug' : 'appAttest',
        debugToken: 'DF33FC9B-52F9-4515-B19E-E7492108FF15',
      },
    });

    await appCheck().initializeAppCheck({
      provider: rnfbProvider,
      isTokenAutoRefreshEnabled: true,
    });

    console.log('✅ App Check initialized');
  } catch (error) {
    console.warn('⚠️ App Check init failed:', error.message);
  }
};

// Initialize App Check then register
initAppCheck();
AppRegistry.registerComponent(appName, () => App);