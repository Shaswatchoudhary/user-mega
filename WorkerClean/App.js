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
  const { user, loading } = useAuth();

  React.useEffect(() => {
    notificationService.setNavigation(navigationRef);
    
    let unsubscribe;
    if (user?.uid || user?._id) {
      notificationService.setupNotifications(user.uid || user._id).then(unsub => {
        unsubscribe = unsub;
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user?.uid, user?._id]);

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
      <AppNavigator user={user} />
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
