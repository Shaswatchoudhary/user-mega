import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LocationProvider } from './src/context/LocationContext';
import AppNavigator from './src/navigation/AppNavigator';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import notificationService from './src/services/notificationService';
import permissionService from './src/services/permissionService';

import SplashScreen from './src/screens/home/SplashScreen';
import OtpLoginScreen from './src/screens/auth/OtpLoginScreen';

const navigationRef = createNavigationContainerRef();
const Stack = createNativeStackNavigator();

const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' }}>
    <ActivityIndicator size="large" color="#E84545" />
  </View>
);

function AppContent() {
  const { user, loading } = useAuth();

  React.useEffect(() => {
    notificationService.setNavigation(navigationRef);
    
    let unsubscribe;
    const initNotifications = async () => {
      try {
        if (user?.uid) {
          unsubscribe = await notificationService.setupNotifications(user.uid);
        }
      } catch (error) {
        console.error('[App] Notification setup failed:', error);
      }
    };

    initNotifications();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user?.uid]);

  React.useEffect(() => {
    // Request Initial Permissions (Notification & Location)
    permissionService.requestInitialPermissions();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        {user ? (
          <Stack.Screen name="AppNavigator" component={AppNavigator} />
        ) : (
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="OtpLogin" component={OtpLoginScreen} />
          </>
        )}
      </Stack.Navigator>
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

