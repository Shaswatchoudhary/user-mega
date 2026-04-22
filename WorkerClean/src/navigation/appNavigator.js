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
import IncomingBookingScreen from '../screens/home/IncomingBookingScreen';
import ActiveJobScreen from '../screens/work/ActiveJobScreen';
import LocationScreen from '../screens/location/LocationScreen';

// Profile Screens
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import ManageAddressScreen from '../screens/profile/ManageAddressScreen';
import AboutScreen from '../screens/profile/AboutScreen';
import PrivacyScreen from '../screens/profile/PrivacyScreen';
import HelpSupportScreen from '../screens/profile/HelpSupportScreen';
import ProfessionalDetailsScreen from '../screens/profile/ProfessionalDetailsScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator({ user }) {
  return (
    <Stack.Navigator
      initialRouteName={user ? "MainTabs" : "Splash"}
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

      {/* Profile Features */}
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="ManageAddress" component={ManageAddressScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <Stack.Screen name="ProfessionalDetails" component={ProfessionalDetailsScreen} />

      <Stack.Screen name="ActiveJob" component={ActiveJobScreen} />
      <Stack.Screen name="IncomingBooking" component={IncomingBookingScreen} />
      <Stack.Screen name="Location" component={LocationScreen} />

      {/* Main App with Tabs */}
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
    </Stack.Navigator>
  );
}