import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, StatusBar, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { API_BASE_URL } from '../../constants/config';

const BookingCard = ({ item }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'booked': return '#991B1B';
      case 'accepted': return '#10B981';
      case 'completed': return '#3B82F6';
      case 'cancelled': return '#6B7280';
      default: return '#991B1B';
    }
  };

  const statusColor = getStatusColor(item.status);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.serviceName}>{item.serviceType || item.service}</Text>
          <Text style={styles.professionalName}>Professional: {item.workerName || item.professional}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Booked'}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={14} color="#A0A0A0" />
          <Text style={styles.dateText}>
            {item.bookingTime ? new Date(item.bookingTime).toLocaleString() : item.date}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={14} color="#A0A0A0" />
          <Text style={styles.addressText} numberOfLines={1}>{item.address}</Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="currency-inr" size={14} color="#A0A0A0" />
          <Text style={styles.priceText}>Total: ₹{item.totalPrice}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <TouchableOpacity style={styles.detailsButton}>
          <Text style={styles.detailsButtonText}>View details</Text>
        </TouchableOpacity>
        {item.status?.toLowerCase() !== 'completed' && item.status?.toLowerCase() !== 'cancelled' && (
          <TouchableOpacity style={styles.rescheduleButton}>
            <Text style={styles.rescheduleButtonText}>Reschedule</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const BookingScreen = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/booking`);
      const json = await response.json();
      if (json.success) {
        setBookings(json.data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const handleHelpPress = () => {
    console.log('Help pressed');
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="#991B1B" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>My bookings</Text>
          <TouchableOpacity style={styles.helpButton} onPress={handleHelpPress}>
            <Text style={styles.helpButtonText}>Help</Text>
          </TouchableOpacity>
        </View>

        {bookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="calendar-blank" size={64} color="#333" />
            <Text style={styles.emptyTitle}>No bookings yet</Text>
            <Text style={styles.emptySubtitle}>Your booked services will appear here</Text>
          </View>
        ) : (
          <FlatList
            data={bookings}
            keyExtractor={(item) => item._id || item.id}
            renderItem={({ item }) => <BookingCard item={item} />}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#991B1B" />
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
    backgroundColor: '#FFFFFF',
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
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333333',
    fontFamily: 'Poppins-SemiBold',
  },
  helpButton: {
    borderWidth: 1,
    borderColor: '#991B1B',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  helpButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#991B1B',
    fontFamily: 'Poppins-Regular',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100, // Space for tab bar
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
    marginRight: 10,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
    fontFamily: 'Poppins-SemiBold',
  },
  professionalName: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Poppins-Regular',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    fontFamily: 'Poppins-Bold',
  },
  cardBody: {
    marginBottom: 20,
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  addressText: {
    fontSize: 13,
    color: '#717171',
    flex: 1,
    fontFamily: 'Poppins-Regular',
  },
  priceText: {
    fontSize: 15,
    color: '#991B1B',
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  detailsButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#991B1B',
  },
  detailsButtonText: {
    color: '#991B1B',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
  },
  rescheduleButton: {
    flex: 1,
    backgroundColor: '#991B1B',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#991B1B',
  },
  rescheduleButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: -50,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default BookingScreen;