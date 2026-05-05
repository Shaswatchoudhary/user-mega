import { PermissionsAndroid, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import firestore from '@react-native-firebase/firestore';

/**
 * Unified Notification Service
 * Handles Permissions, Tokens, Topic subscription, and all lifecycle events.
 */
class NotificationService {
  constructor() {
    this.navigation = null;
    this.userId = null;
  }

  setNavigation(navigation) {
    this.navigation = navigation;
  }

  setUserId(userId) {
    this.userId = userId;
  }

  /**
   * Main setup function called on app mount
   */
  async setupNotifications(userId) {
    this.userId = userId;

    // 1. Request Permission (Android 13+)
    await this.requestPermission();

    // 2. Create Required Channels (Android 8+)
    await this.createChannels();

    // 3. Get and Save FCM Token
    const token = await this.getFCMToken();
    if (token && userId) {
      await this.saveFCMTokenToFirestore(token);
    }

    // 4. Subscribe to "all" topic (Fix for Campaigns)
    try {
      await messaging().subscribeToTopic('all');
      console.log('[NotificationService] Subscribed to topic: all');
    } catch (e) {
      console.warn('[NotificationService] Topic subscription warning:', e.message);
    }

    // 5. Setup Token Refresh Listener
    messaging().onTokenRefresh(token => {
      console.log('[NotificationService] Token refreshed:', token);
      if (this.userId) {
        this.saveFCMTokenToFirestore(token);
      }
    });

    // 6. Handle Foreground Messages (while app is open)
    const unsubscribeMessaging = messaging().onMessage(async remoteMessage => {
      console.log('[NotificationService] Foreground message received:', remoteMessage);
      await this.onForegroundMessage(remoteMessage);
    });

    // 7. Handle Notification Open from Background state
    const unsubscribeOpening = messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('[NotificationService] Notification opened from background:', remoteMessage);
      this.handleNotificationTap(remoteMessage);
    });

    // 8. Check if App was opened from a Killed state via Notification
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('[NotificationService] App opened from killed state via notification:', remoteMessage);
          this.handleNotificationTap(remoteMessage);
        }
      });

    // 9. Handle Notifee Foreground Events (tapping local notifications)
    notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {
        this.handleNotificationTap(detail.notification);
      }
    });

    return () => {
      unsubscribeMessaging();
      unsubscribeOpening();
    };
  }

  async requestPermission() {
    try {
      // 1. Android 13+ explicit permission request
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Notification Permission',
            message: 'WorkEase needs your permission to send you updates about your bookings.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
      }

      // 2. Firebase Messaging request
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      
      console.log('[NotificationService] Auth status:', authStatus);
      return enabled;
    } catch (error) {
      console.error('[NotificationService] Permission error:', error);
      return false;
    }
  }

  async createChannels() {
    await notifee.createChannel({
      id: 'default',
      name: 'WorkEase Notifications',
      importance: AndroidImportance.HIGH,
      vibration: true,
      sound: 'default',
    });
  }

  async getFCMToken() {
    try {
      const token = await messaging().getToken();
      console.log('[NotificationService] FCM Token:', token);
      return token;
    } catch (error) {
      console.error('[NotificationService] Error getting token:', error);
      return null;
    }
  }

  async saveFCMTokenToFirestore(token) {
    if (!this.userId || !token) return;
    try {
      await firestore()
        .doc(`users/${this.userId}`)
        .set({
          fcmToken: token,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
      console.log('[NotificationService] Token saved for user:', this.userId);
    } catch (error) {
      console.error('[NotificationService] Firestore save error:', error);
    }
  }

  async onForegroundMessage(remoteMessage) {
    const { notification, data } = remoteMessage;
    
    await notifee.displayNotification({
      title: notification?.title || data?.title || 'Notice',
      body: notification?.body || data?.body || '',
      android: {
        channelId: 'default',
        pressAction: {
          id: 'default',
        },
        importance: AndroidImportance.HIGH,
      },
      data: data || {},
    });

    if (this.userId) {
      this.saveNotificationHistory(remoteMessage);
    }
  }

  handleNotificationTap(remoteMessage) {
    const data = remoteMessage?.data || {};
    if (this.navigation) {
      if (data.type === 'booking' || data.type === 'booking_accepted' || data.type === 'work_completed') {
        this.navigation.navigate('Tracking', { bookingId: data.bookingId });
      } else {
        this.navigation.navigate('Notifications');
      }
    }
  }

  async saveNotificationHistory(remoteMessage) {
    const { notification, data } = remoteMessage;
    try {
      await firestore()
        .doc(`users/${this.userId}`)
        .collection('notifications')
        .add({
          title: notification?.title || data?.title || 'Notification',
          body: notification?.body || data?.body || '',
          type: data?.type || 'general',
          data: data || {},
          isRead: false,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
    } catch (e) {
      console.error('[NotificationService] History error:', e);
    }
  }
}

export default new NotificationService();
