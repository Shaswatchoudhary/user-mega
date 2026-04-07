import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from '../../context/AuthContext';

export default function NotificationScreen({ navigation }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) {
        setLoading(false);
        return;
    }

    const subscriber = firestore()
      .doc(`users/${user._id}`)
      .collection('notifications')
      .orderBy('createdAt', 'desc')
      .onSnapshot(querySnapshot => {
        const notificationsData = [];
        querySnapshot?.forEach(documentSnapshot => {
          notificationsData.push({
            ...documentSnapshot.data(),
            id: documentSnapshot.id,
          });
        });
        setNotifications(notificationsData);
        setLoading(false);
      }, error => {
        console.error('[NotificationScreen] Error fetching notifications:', error);
        setLoading(false);
      });

    return () => subscriber();
  }, [user?._id]);

  const markAsRead = async (notificationId) => {
    try {
      await firestore()
        .doc(`users/${user._id}/notifications/${notificationId}`)
        .update({
          isRead: true,
        });
    } catch (error) {
      console.error('[NotificationScreen] Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.isRead);
    const batch = firestore().batch();

    unreadNotifications.forEach(n => {
      const docRef = firestore()
        .doc(`users/${user._id}/notifications/${n.id}`);
      batch.update(docRef, { isRead: true });
    });

    try {
      await batch.commit();
    } catch (error) {
      console.error('[NotificationScreen] Error marking all as read:', error);
    }
  };

  const renderItem = ({ item }) => {
    const getIcon = () => {
      switch (item.type) {
        case 'booking': return 'calendar-check';
        case 'message': return 'chat';
        case 'promo': return 'sale';
        default: return 'bell';
      }
    };

    const getIconColor = () => {
      switch (item.type) {
        case 'booking': return '#4CAF50';
        case 'message': return '#2196F3';
        case 'promo': return '#FF9800';
        default: return '#E84545';
      }
    };

    return (
      <TouchableOpacity 
        style={[styles.notificationItem, !item.isRead && styles.unreadItem]} 
        onPress={() => markAsRead(item.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconBox, { backgroundColor: getIconColor() + '15' }]}>
          <MaterialCommunityIcons name={getIcon()} size={24} color={getIconColor()} />
        </View>
        <View style={styles.textContainer}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, !item.isRead && styles.unreadText]}>{item.title}</Text>
            {!item.isRead && <View style={styles.unreadBadge} />}
          </View>
          <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
          <Text style={styles.time}>
            {item.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#E84545" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {notifications.some(n => !n.isRead) && (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={styles.markAll}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="bell-off-outline" size={80} color="#DDD" />
          <Text style={styles.emptyText}>No notifications yet</Text>
          <Text style={styles.emptySubtext}>We'll notify you when something important happens.</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    marginLeft: 12,
    color: '#333',
  },
  markAll: {
    color: '#E84545',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  listContainer: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  unreadItem: {
    backgroundColor: '#FFF9F9',
    borderColor: '#FFEBEB',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    flex: 1,
  },
  unreadText: {
    color: '#000',
  },
  unreadBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E84545',
    marginLeft: 8,
  },
  body: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    lineHeight: 20,
  },
  time: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#999',
    marginTop: 8,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
});
