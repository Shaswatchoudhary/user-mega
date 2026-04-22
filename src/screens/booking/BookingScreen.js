import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, StatusBar, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';

const BookingCard = ({ item }) => {
  const navigation = useNavigation();

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return '#F59E0B'; // Orange
      case 'accepted':
      case 'on_the_way':
      case 'navigating':
      case 'arrived':
      case 'working':
      case 'in_progress': 
        return '#3B82F6'; // Blue
      case 'work_completed': return '#8B5CF6'; // Purple
      case 'completed': return '#10B981'; // Green
      case 'cancelled': return '#6B7280'; // Grey
      default: return '#E84545';
    }
  };

  const statusColor = getStatusColor(item.status);
  
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCardPress = () => {
    const activeStatuses = ['accepted', 'on_the_way', 'navigating', 'arrived', 'working', 'in_progress', 'work_completed'];
    if (activeStatuses.includes(item.status?.toLowerCase())) {
      navigation.navigate('Tracking', { bookingId: item.id });
    }
  };

  // Address logic as requested: fullAddress OR address OR userAddress OR fallback
  const displayAddress = item.userLocation?.fullAddress 
    || item.userLocation?.address 
    || item.userAddress 
    || 'Address saved';

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={handleCardPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.serviceName}>{item.serviceType || 'Standard Service'}</Text>
          <Text style={styles.professionalName}>Professional: {item.workerName || 'Expert'}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {item.status ? item.status.replace('_', ' ').charAt(0).toUpperCase() + item.status.replace('_', ' ').slice(1) : 'Pending'}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color="#E84545" />
          <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color="#E84545" />
          <Text style={styles.addressText} numberOfLines={2}>
            {displayAddress}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="currency-inr" size={16} color="#E84545" />
          <Text style={styles.priceText}>₹{item.price || item.totalPrice || 249}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        {item.status === 'pending' ? (
          <View style={styles.pendingContainer}>
            <ActivityIndicator size="small" color="#F59E0B" />
            <Text style={styles.pendingText}>Waiting for worker to accept...</Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={[styles.detailsButton, !['completed', 'cancelled', 'rejected', 'declined'].includes(item.status?.toLowerCase()) && styles.activeButton]} 
            onPress={handleCardPress}
            disabled={['completed', 'cancelled', 'rejected', 'declined'].includes(item.status?.toLowerCase())}
          >
            <Text style={[styles.detailsButtonText, !['completed', 'cancelled', 'rejected', 'declined'].includes(item.status?.toLowerCase()) && styles.activeButtonText]}>
              {['completed', 'cancelled', 'rejected', 'declined'].includes(item.status?.toLowerCase()) ? 'Booking Closed' : 'Track Status'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const BookingScreen = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const uid = user?.uid || user?._id;
    if (!uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = firestore()
      .collection('bookings')
      .where('userId', '==', uid)
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        (querySnapshot) => {
          const bookingList = [];
          if (querySnapshot) {
            querySnapshot.forEach((doc) => {
              bookingList.push({
                id: doc.id,
                ...doc.data(),
              });
            });
          }
          setBookings(bookingList);
          setLoading(false);
          setRefreshing(false);
        },
        (error) => {
          console.error('Firestore Error:', error);
          setLoading(false);
          setRefreshing(false);
        }
      );

    return () => unsubscribe();
  }, [user?.uid, user?._id]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E84545" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>History & Tracking</Text>
          <TouchableOpacity style={styles.helpButton}>
            <Text style={styles.helpButtonText}>Support</Text>
          </TouchableOpacity>
        </View>

        {bookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="calendar-blank-outline" size={80} color="#E5E7EB" />
            <Text style={styles.emptyTitle}>No bookings found</Text>
            <Text style={styles.emptySubtitle}>Your full booking history will appear here.</Text>
          </View>
        ) : (
          <FlatList
            data={bookings}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <BookingCard item={item} />}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E84545" />
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  helpButton: {
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  helpButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E84545',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  headerLeft: {
    flex: 1,
    paddingRight: 10,
  },
  serviceName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  professionalName: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  cardBody: {
    marginBottom: 16,
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '700',
  },
  addressText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
    lineHeight: 18,
  },
  priceText: {
    fontSize: 15,
    color: '#E84545',
    fontWeight: '900',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F9FAFB',
    paddingTop: 12,
  },
  pendingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    padding: 10,
    borderRadius: 10,
    gap: 10,
    justifyContent: 'center',
  },
  pendingText: {
    color: '#92400E',
    fontSize: 13,
    fontWeight: '600',
  },
  detailsButton: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  activeButton: {
    backgroundColor: '#E84545',
    borderColor: '#E84545',
  },
  detailsButtonText: {
    color: '#4B5563',
    fontSize: 14,
    fontWeight: '700',
  },
  activeButtonText: {
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: -40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default BookingScreen;