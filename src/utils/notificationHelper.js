import notifee, { AndroidImportance } from '@notifee/react-native';
import { Platform } from 'react-native';

/**
 * Request permissions for notifications.
 * Migrated to Notifee (Native).
 */
export async function registerForPushNotificationsAsync() {
  try {
    // Request permission (required for iOS)
    await notifee.requestPermission();

    // Create a channel (required for Android)
    if (Platform.OS === 'android') {
      await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
      });
    }

    console.log('[Notification] Permissions granted and channel created.');
    return 'local-only';
  } catch (error) {
    console.warn('[Notification] Permission request failed:', error);
    return null;
  }
}

/**
 * Send a local notification for OTP.
 * @param {string} otp 
 */
export async function sendLocalNotification(otp) {
  console.log('[Notification] Sending local OTP notification:', otp);
  
  try {
    // Display a notification
    await notifee.displayNotification({
      title: 'Workies OTP',
      body: `Your verification code is ${otp}`,
      android: {
        channelId: 'default',
        // smallIcon: 'name-of-a-small-icon', // optional, defaults to 'ic_launcher'
        pressAction: {
          id: 'default',
        },
      },
    });
  } catch (error) {
    console.error('[Notification] Error sending local notification:', error);
  }
}
