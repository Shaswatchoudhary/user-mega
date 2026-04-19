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
    
    return {
      notifications: notificationGranted,
      location: true, // Auto-granted now that maps are removed
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
   * Stubbed for compatibility
   */
  async requestLocationPermission() {
    return true;
  }

  /**
   * Stubbed for compatibility
   */
  async checkLocationPermission() {
    return true;
  }
}

export default new PermissionService();
