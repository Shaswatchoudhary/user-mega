import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import SplashScreen from '../screens/splash/SplashScreen';
import OtpScreen from '../screens/otp/OtpScreen';
import WorkForm from '../screens/work/WorkForm';
import UnderReviewScreen from '../screens/work/UnderReviewScreen';
import MainTabNavigator from './mainNavigator';
import DetailScreen from '../screens/jobdetail/DetailScreen';
import PaymentScreen from '../screens/map/MapScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      {/* Onboarding/Auth Screens */}
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Otp" component={OtpScreen} />
      <Stack.Screen name="WorkForm" component={WorkForm} />
      <Stack.Screen name="UnderReviewScreen" component={UnderReviewScreen} />
      <Stack.Screen name="DetailScreen" component={DetailScreen} />
      <Stack.Screen name="PaymentScreen" component={PaymentScreen} />

      {/* Main App with Tabs */}
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
    </Stack.Navigator>
  );
}