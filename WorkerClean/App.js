import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LocationProvider } from './src/context/LocationContext';
import AppNavigator from './src/navigation/appNavigator';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import notificationService from './src/services/notificationService';
import permissionService from './src/services/permissionService';

const navigationRef = createNavigationContainerRef();

function AppContent() {
  const { workerUser, loading } = useAuth();

  React.useEffect(() => {
    notificationService.setNavigation(navigationRef);
    
    let unsubscribe;
    if (workerUser?.uid) {
      notificationService.setupNotifications(workerUser.uid).then(unsub => {
        unsubscribe = unsub;
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [workerUser?.uid]);

  React.useEffect(() => {
    // Request Initial Permissions (Notification & Location)
    permissionService.requestInitialPermissions();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#E84545" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <AppNavigator user={workerUser} />
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
