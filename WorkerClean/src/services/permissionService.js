import { PermissionsAndroid, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';

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
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      
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
            message: 'WorkEase Worker app needs access to your location to help users track your arrival.',
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
