import { PermissionsAndroid, Platform } from 'react-native';
import { getMessaging, requestPermission, AuthorizationStatus } from '@react-native-firebase/messaging';

class PermissionService {
  /**
   * Request all necessary permissions for the app startup
   */
  async requestInitialPermissions() {
    console.log('[PermissionService] Requesting initial permissions...');
    
    // 1. Notification Permission
    const notificationGranted = await this.requestNotificationPermission();
    // 2. Location Permission
    const locationGranted = await this.requestLocationPermission();
    
    return {
      notifications: notificationGranted,
      location: locationGranted,
    };
  }

  /**
   * Request Notification permission (Firebase Messaging)
   */
  async requestNotificationPermission() {
    try {
      // 1. Android 13+ explicit permission request
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Notification Permission',
            message: 'Workies needs your permission to send you updates about your bookings.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        console.log('[PermissionService] Android POST_NOTIFICATIONS status:', granted);
      }

      // 2. Firebase Messaging request (handles iOS and general FCM status)
      const messaging = getMessaging();
      const authStatus = await requestPermission(messaging);
      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;
      
      console.log('[PermissionService] Notification auth status:', authStatus);
      return enabled;
    } catch (error) {
      console.error('[PermissionService] Notification permission error:', error);
      return false;
    }
  }

  async requestLocationPermission() {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'Workies needs access to your location to help you find local workers.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('[PermissionService] Location permission error:', err);
        return false;
      }
    }
    return true;
  }

  async checkLocationPermission() {
    if (Platform.OS === 'android') {
      return await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
    }
    return true;
  }
}

export default new PermissionService();
