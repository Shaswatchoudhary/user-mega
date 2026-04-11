import { PermissionsAndroid, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';

class PermissionService {
  /**
   * Request all necessary permissions for the app startup
   */
  async requestInitialPermissions() {
    console.log('[PermissionService] Requesting initial permissions...');
    
    // 1. Notification Permission (Android 13+)
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

  /**
   * Request Location permission using PermissionsAndroid or Geolocation (iOS)
   */
  async requestLocationPermission() {
    if (Platform.OS === 'ios') {
      try {
        const { default: Geolocation } = require('react-native-geolocation-service');
        const auth = await Geolocation.requestAuthorization('whenInUse');
        return auth === 'granted';
      } catch (err) {
        console.warn('[PermissionService] iOS Location error:', err);
        return false;
      }
    }

    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      ]);

      const isFineSelected = granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED;
      const isCoarseSelected = granted['android.permission.ACCESS_COARSE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED;

      console.log('[PermissionService] Location status:', { isFineSelected, isCoarseSelected });
      
      return isFineSelected || isCoarseSelected;
    } catch (err) {
      console.warn('[PermissionService] Location permission error:', err);
      return false;
    }
  }

  /**
   * Check if location permission is already granted
   */
  async checkLocationPermission() {
    if (Platform.OS === 'ios') return true;

    try {
      const hasFine = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      const hasCoarse = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION);
      return hasFine || hasCoarse;
    } catch (err) {
      return false;
    }
  }
}

export default new PermissionService();
