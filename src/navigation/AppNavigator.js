import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/home/SplashScreen';
import OtpLoginScreen from '../screens/auth/OtpLoginScreen';
import MainTabNavigator from './MainNavigator';
import ElectricianScreen from '../screens/services/ElectricianScreen';
import PlumberScreen from '../screens/services/PlumberScreen';
import CarpenterScreen from '../screens/services/CarpenterScreen';
import Menscare from '../screens/services/Menscare';
import Womenscare from '../screens/services/Womenscare';
import PaymentScreen from '../screens/booking/PaymentScreen';
import SelectPaymentMethodScreen from '../screens/booking/SelectPaymentMethodScreen';
import ApplianceScreen from '../screens/services/ApplianceScreen';
import LocationSelectionScreen from '../screens/location/LocationSelectionScreen';
import BookingStatusScreen from '../screens/booking/BookingStatusScreen';
import TrackingScreen from '../screens/booking/TrackingScreen';
import AcRepair from '../screens/services/AcRepair';
import MySupportScreen from '../screens/profile/MySupportScreen';
import HelpSupportScreen from '../screens/profile/HelpSupportScreen';
import PrivacyScreen from '../screens/profile/PrivacyScreen';
import AboutWorkiesScreen from '../screens/profile/AboutWorkiesScreen';
import ManageAddressScreen from '../screens/profile/ManageAddressScreen';
import ManagePaymentMethodsScreen from '../screens/profile/ManagePaymentMethodsScreen';
import WorkerProfileScreen from '../screens/booking/WorkerProfileScreen';
import BookingSummaryScreen from '../screens/booking/BookingSummaryScreen';
import NotificationScreen from '../screens/notifications/NotificationScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';


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
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="OtpLogin" component={OtpLoginScreen} />
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen name="Notifications" component={NotificationScreen} />
      <Stack.Screen name="Electrician" component={ElectricianScreen} />
      <Stack.Screen name="Plumber" component={PlumberScreen} />
      <Stack.Screen name="Carpenter" component={CarpenterScreen} />
      <Stack.Screen name="Menscare" component={Menscare} />
      <Stack.Screen name="Womenscare" component={Womenscare} />
      <Stack.Screen name="Appliance" component={ApplianceScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SelectPaymentMethod" component={SelectPaymentMethodScreen} />
      <Stack.Screen name="Tracking" component={TrackingScreen} />
      <Stack.Screen name="AcRepair" component={AcRepair} />
      <Stack.Screen name="LocationSelection" component={LocationSelectionScreen} options={{ headerShown: false }} />
      <Stack.Screen name="BookingStatus" component={BookingStatusScreen} options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="MySupport" component={MySupportScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
      <Stack.Screen name="AboutWorkies" component={AboutWorkiesScreen} />
      <Stack.Screen name="ManageAddress" component={ManageAddressScreen} />
      <Stack.Screen name="ManagePaymentMethods" component={ManagePaymentMethodsScreen} />
      <Stack.Screen name="WorkerProfile" component={WorkerProfileScreen} />
      <Stack.Screen name="BookingSummary" component={BookingSummaryScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />

    </Stack.Navigator>
  );
}