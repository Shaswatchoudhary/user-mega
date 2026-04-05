import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import appCheck, { ReactNativeFirebaseAppCheckProvider } from '@react-native-firebase/app-check';

// Initialize Firebase App Check
const provider = new ReactNativeFirebaseAppCheckProvider();
provider.configure({
  android: {
    provider: __DEV__ ? 'debug' : 'playIntegrity',
  },
});

appCheck().initializeAppCheck({
  provider,
  isTokenAutoRefreshEnabled: true,
}).then(() => {
  console.log('✅ Firebase App Check Initialized');
}).catch((error) => {
  console.error('[App Check] Initialization Error:', error);
});

AppRegistry.registerComponent(appName, () => App);
