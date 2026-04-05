import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { LocationProvider } from './src/context/LocationContext';
import AppNavigator from './src/navigation/AppNavigator';
import { registerForPushNotificationsAsync } from './src/utils/notificationHelper';

export default function App() {
  React.useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <LocationProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </LocationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

