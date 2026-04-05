import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import appCheck from '@react-native-firebase/app-check';

// FORCE DEBUG PROVIDER WITH YOUR NEW TOKEN
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