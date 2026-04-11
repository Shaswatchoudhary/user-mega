import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { Platform } from 'react-native';

// Configure notification behavior
export async function registerForPushNotificationsAsync() {
  // Request Permission
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (!enabled) {
    console.log('[Notification] Failed to get push token for push notification!');
    return null;
  }

  // Get FCM Token
  try {
    const token = await messaging().getToken();
    console.log('[Notification] FCM Token:', token);
    return token;
  } catch (error) {
    console.log('[Notification] Error getting token:', error);
    return null;
  }
}

export async function sendLocalNotification(otp) {
  // Create a channel (required for Android)
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    importance: AndroidImportance.HIGH,
  });

  // Display a notification
  await notifee.displayNotification({
    title: 'Workies Verification Code',
    body: `Your verification code is ${otp}`,
    android: {
      channelId,
      pressAction: {
        id: 'default',
      },
      importance: AndroidImportance.HIGH,
    },
    data: { otp: String(otp) },
  });
}
