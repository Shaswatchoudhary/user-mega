import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  BackHandler,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { getFirestore, collection, query, where, onSnapshot, Timestamp } from '@react-native-firebase/firestore';
import locationService from '../../services/locationService';
import { useLocation } from '../../context/LocationContext';

export default function HomeScreen({ navigation }) {
  const { user, workerData } = useAuth();
  const { selectedLocation } = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [activeBookings, setActiveBookings] = useState([]);
  const [newRequests, setNewRequests] = useState([]);
  const db = getFirestore();

  // Start background location tracking for worker
  useEffect(() => {
    const workerId = workerData?.id || workerData?._id || user?.uid;
    if (!workerId) return;

    const initTracking = async () => {
      const hasPermission = await locationService.requestPermission();
      if (hasPermission) {
        locationService.startTracking(workerId);
      }
    };

    initTracking();

    return () => {
      locationService.stopTracking();
    };
  }, [workerData?.id, workerData?._id, user?.uid]);

  // Handle Android back button
  useEffect(() => {
    const backAction = () => {
      Alert.alert('Exit App', 'Are you sure you want to exit?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'YES', onPress: () => BackHandler.exitApp() },
      ]);
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  // Listen for real-time bookings (Modular API)
  useEffect(() => {
    const workerId = workerData?.id || workerData?._id || user?.uid;
    console.log('[WORKER HOME DEBUG] Initializing listeners for workerId:', workerId);
    if (!workerId) {
      console.log('[WORKER HOME DEBUG] No workerId found, skipping listeners.');
      return;
    }

    const bookingsCol = collection(db, 'bookings');

    // 1. Listen for Incoming (Pending) Requests - Filtered to last 24 hours to avoid "ghost" requests
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const qIncoming = query(
      bookingsCol,
      where('workerId', '==', workerId),
      where('status', '==', 'pending'),
      where('createdAt', '>=', Timestamp.fromDate(twentyFourHoursAgo))
    );

    const unsubscribeIncoming = onSnapshot(qIncoming, 
      (snapshot) => {
        console.log('[WORKER HOME DEBUG] Incoming (Pending) Snapshot received. Size:', snapshot?.size || 0);
        if (snapshot && !snapshot.empty) {
          const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          console.log('[WORKER HOME DEBUG] Pending Requst IDs:', requests.map(r => r.id));
          setNewRequests(requests);
        } else {
          setNewRequests([]);
        }
      },
      (error) => {
        console.error('ERROR: Incoming bookings listener failed:', error);
      }
    );

    // 2. Listen for Active Jobs
    const qActive = query(
      bookingsCol,
      where('workerId', '==', workerId),
      where('status', 'in', ['accepted', 'navigating', 'arrived', 'in_progress'])
    );

    const unsubscribeActive = onSnapshot(qActive, 
      (snapshot) => {
        console.log('[WORKER HOME DEBUG] Active Jobs Snapshot received. Size:', snapshot?.size || 0);
        if (snapshot && !snapshot.empty) {
          const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          console.log('[WORKER HOME DEBUG] Active Job IDs:', bookings.map(b => b.id));
          setActiveBookings(bookings);
        } else {
          setActiveBookings([]);
        }
      },
      (error) => {
        console.error('ERROR: Active bookings listener failed:', error);
      }
    );

    return () => {
      unsubscribeIncoming();
      unsubscribeActive();
    };
  }, [workerData?.id, workerData?._id, user?.uid]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#E84545" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Location Header - Zomato Style */}
        <View style={styles.locationHeader}>
          <TouchableOpacity
            style={styles.locationContainer}
            onPress={() => navigation.navigate('Location')}
          >
            <View style={styles.locationIconBox}>
              <MaterialCommunityIcons name="map-marker-radius" size={24} color="#E84545" />
            </View>
            <View style={styles.locationTextBox}>
              <View style={styles.locationTopRow}>
                <Text style={styles.locationTitle} numberOfLines={1}>
                  {selectedLocation?.name || 'Set Location'}
                </Text>
                <Ionicons name="chevron-down" size={14} color="#666" />
              </View>
              <Text style={styles.locationSubtitle} numberOfLines={1}>
                {selectedLocation?.address || 'Detect your current location'}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.notificationBtn}>
            <Ionicons name="notifications-outline" size={24} color="#1A1A1A" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>
        {/* Under Review Banner */}
        {workerData?.status === 'UNDER_REVIEW' && (
          <View style={styles.underReviewBanner}>
            <MaterialCommunityIcons name="information" size={20} color="#92400E" />
            <Text style={styles.underReviewText}>Your application is currently under review. You cannot accept bookings yet.</Text>
          </View>
        )}

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileLeft}>
            <Image
              source={{ uri: 'https://st3.depositphotos.com/15648834/17930/v/450/depositphotos_179308460-stock-illustration-unknown-person-silhouette-profile-picture.jpg' }}
              style={styles.profileImage}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{workerData?.fullName || 'Worker'}</Text>
              <Text style={styles.profileCategory}>{workerData?.category || 'Professional'}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={16} color="#F59E0B" />
                <Text style={styles.ratingText}>{workerData?.rating || '0.0'}</Text>
                <Text style={styles.ratingCount}>({workerData?.completedOrders || 0} orders)</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="chevron-forward" size={20} color="#E84545" />
          </TouchableOpacity>
        </View>

        {/* Today's Earnings - Big Card */}
        <View style={styles.earningsCard}>
          <LinearGradient
            colors={['#E84545', '#1A1A1A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.earningsGradient}
          >
            <View style={styles.earningsTop}>
              <View>
                <Text style={styles.earningsLabel}>Today's Earnings</Text>
                <Text style={styles.earningsAmount}>₹{workerData?.earningsToday || 0}</Text>
                <Text style={styles.earningsSubtext}>Next payout soon</Text>
              </View>
              <View style={styles.earningsIcon}>
                <MaterialCommunityIcons name="cash-multiple" size={32} color="#FFFFFF" />
              </View>
            </View>

            <View style={styles.earningsStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>This Week</Text>
                <Text style={styles.statValue}>₹{workerData?.earningsWeek || 0}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>This Month</Text>
                <Text style={styles.statValue}>₹{workerData?.earningsMonth || 0}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.statCard}>
            <View style={styles.statIconWrapper}>
              <MaterialCommunityIcons name="clock-outline" size={24} color="#d82319ff" />
            </View>
            <Text style={styles.statNumber}>{workerData?.hoursOnline || 0}</Text>
            <Text style={styles.statTitle}>Hours Online</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconWrapper}>
              <MaterialCommunityIcons name="bookmark-check" size={24} color="#ed2e2eff" />
            </View>
            <Text style={styles.statNumber}>{workerData?.completedOrders || 0}</Text>
            <Text style={styles.statTitle}>Jobs Done</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconWrapper}>
              <MaterialCommunityIcons name="wallet-outline" size={24} color="#cb2208ff" />
            </View>
            <Text style={styles.statNumber}>₹{workerData?.pendingEarnings || 0}</Text>
            <Text style={styles.statTitle}>Pending</Text>
          </View>
        </View>

        {newRequests && newRequests.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>New Requests</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{newRequests.length}</Text>
              </View>
            </View>

            <View style={styles.requestsContainer}>
              {newRequests.map((request, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.requestCard}
                  onPress={() => navigation.navigate('IncomingBooking', { bookingId: request.id, bookingData: request })}
                >
                  <View style={styles.requestHeader}>
                    <View style={styles.requestIcon}>
                      <MaterialCommunityIcons name="clipboard-text-play" size={24} color="#E84545" />
                    </View>
                    <View style={styles.requestInfo}>
                      <Text style={styles.requestTitle}>{request.serviceType || 'Job Request'}</Text>
                      <Text style={styles.requestSubtitle}>📍 {request.userLocation?.shortAddress || request.userLocation?.address || request.userAddress || 'Location provided'}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {activeBookings && activeBookings.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Orders</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{activeBookings.length}</Text>
              </View>
            </View>

            <View style={styles.activeOrdersContainer}>
              {activeBookings.map((order, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.activeOrderCard}
                  onPress={() => navigation.navigate('ActiveJob', { bookingId: order.id, bookingData: order })}
                >
                  <View style={styles.activeOrderHeader}>
                    <View style={styles.inProgressBadge}>
                      <View style={styles.pulseDot} />
                      <Text style={styles.inProgressText}>ACTIVE JOB</Text>
                    </View>
                    <Text style={styles.orderId}>#{order.id.slice(0, 6).toUpperCase()}</Text>
                  </View>

                  <View style={styles.activeOrderContent}>
                    <View style={styles.activeOrderInfo}>
                      <Text style={styles.activeOrderTitle}>{order.serviceType || 'Service Booked'}</Text>
                      <Text style={styles.activeOrderSubtitle}>📍 {order.userLocation?.shortAddress || order.userLocation?.address || order.userAddress || 'Location provided'}</Text>
                    </View>
                    <Text style={styles.activeOrderAmount}>
                      ₹{order.price || order.basePrice || 399}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.completeButton, { backgroundColor: '#E84545' }]}
                    onPress={() => navigation.navigate('ActiveJob', { bookingId: order.id, bookingData: order })}
                  >
                    <Text style={styles.completeButtonText}>View Job Tasks & Complete</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 100,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
  },
  locationContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIconBox: {
    paddingRight: 12,
  },
  locationTextBox: {
    flex: 1,
  },
  locationTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  locationSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 1,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F7F7F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
  },
  notificationDot: {
    position: 'absolute',
    top: 12,
    right: 13,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E84545',
    borderWidth: 2,
    borderColor: '#F7F7F7',
  },
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  underReviewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  underReviewText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    fontWeight: '600',
    lineHeight: 18,
  },

  // Profile Card
  profileCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#E84545',
  },
  profileInfo: {
    gap: 4,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  profileCategory: {
    fontSize: 13,
    color: '#E84545',
    fontWeight: '600',
    marginTop: -2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  ratingCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  profileButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Earnings Card
  earningsCard: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  earningsGradient: {
    padding: 20,
  },
  earningsTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  earningsLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  earningsAmount: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  earningsSubtext: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  earningsIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  earningsStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 16,
  },

  // Quick Stats
  quickStats: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconWrapper: {
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#6B7280',
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  badge: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Request Cards
  requestsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  requestTop: {
    marginBottom: 12,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  requestIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestInfo: {
    flex: 1,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  requestSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  urgentTag: {
    backgroundColor: '#FCE4EC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  urgentTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#C2185B',
    letterSpacing: 0.5,
  },
  requestDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 13,
    color: '#6B7280',
  },
  requestBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  priceTag: {
    gap: 2,
  },
  priceLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  priceAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10B981',
  },
  acceptButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Active Orders
  activeOrdersContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  activeOrderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  activeOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  inProgressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  inProgressText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
    letterSpacing: 0.5,
  },
  upcomingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  upcomingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E40AF',
    letterSpacing: 0.5,
  },
  orderId: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  activeOrderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  activeOrderIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeOrderInfo: {
    flex: 1,
    gap: 4,
  },
  activeOrderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  activeOrderSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  activeOrderDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  activeOrderDetailText: {
    fontSize: 12,
    color: '#6B7280',
  },
  activeOrderAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  completeButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  completeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  viewDetailsButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  viewDetailsButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  bottomSpacer: {
    height: 20,
  },
});