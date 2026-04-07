import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LocationProvider } from './src/context/LocationContext';
import AppNavigator from './src/navigation/AppNavigator';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import notificationService from './src/services/notificationService';
import permissionService from './src/services/permissionService';

const navigationRef = createNavigationContainerRef();

function AppContent() {
  const { user } = useAuth();

  React.useEffect(() => {
    notificationService.setNavigation(navigationRef);
    
    let unsubscribe;
    if (user?._id) {
      notificationService.setupNotifications(user._id).then(unsub => {
        unsubscribe = unsub;
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user?._id]);

  React.useEffect(() => {
    // Request Initial Permissions (Notification & Location)
    permissionService.requestInitialPermissions();
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <AppNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <LocationProvider>
          <AppContent />
        </LocationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

