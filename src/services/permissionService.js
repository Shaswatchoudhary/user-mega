import { PermissionsAndroid, Platform } from 'react-native';
import { getMessaging, requestPermission, AuthorizationStatus } from '@react-native-firebase/messaging';

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
