import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useAuth } from '../../context/AuthContext';
import locationService from '../../services/locationService';
import { useLocation } from '../../context/LocationContext';
import Geolocation from '@react-native-community/geolocation';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  // 1. ALL HOOKS
  const { workerUser, workerProfile, loading } = useAuth();
  const { selectedLocation, saveLocation } = useLocation();

  const [activeBookings, setActiveBookings] = useState([]);
  const [newRequests, setNewRequests] = useState([]);
  const [workerAddress, setWorkerAddress] = useState('Detecting location...');
  const [stats, setStats] = useState({
    today: 0,
    week: 0,
    completed: 0,
    pending: 0,
    hours: 0
  });
  const [unreadCount, setUnreadCount] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // CRITICAL: Use workerProfile.id or _id (Business ID) if available, fallback to fb uid
  const uid = workerUser?.uid;
  const workerId = workerProfile?.id || workerProfile?._id || uid;

  // 2. Initial Fade In
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

  // 3. Android Back Button
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

  // 3.5. Load Persistent Location from Profile
  useEffect(() => {
    const persistedLoc = workerProfile?.lastUsedAddress || workerProfile?.baseLocation;
    if (persistedLoc && !selectedLocation) {
      console.log('[WorkerHome] Loading persisted location from profile');
      saveLocation(persistedLoc);
    }
  }, [workerProfile?.lastUsedAddress, workerProfile?.baseLocation, !!selectedLocation]);

  // 4. Location Tracking
  useEffect(() => {
    if (!uid || !workerId) return;
    const track = async () => {
      // Check if we already have a location (from context or profile)
      const locAvailable = !!selectedLocation || !!workerProfile?.lastUsedAddress || !!workerProfile?.baseLocation;
      
      const hasPermission = await locationService.requestPermission();
      if (hasPermission) {
        locationService.startTracking(workerId);
        
        // ONLY call getCurrentLocation if no address exists yet (as requested)
        if (!locAvailable) {
          console.log('[WorkerHome] No persisted location found, detecting via GPS...');
          locationService.getCurrentLocation(async (pos) => {
            if (!pos?.coords) return;
            const { latitude, longitude } = pos.coords;
            const addressObj = await locationService.getAddress(latitude, longitude);
            setWorkerAddress(addressObj.short || 'Detected Location');
            
            const timestamp = firestore.FieldValue.serverTimestamp();
            const locationData = {
              currentLocation: { latitude, longitude, address: addressObj.full, lastUpdated: timestamp },
              lastUsedAddress: { 
                latitude, longitude, 
                address: addressObj.full, 
                shortAddress: addressObj.short,
                name: addressObj.short
              },
              status: 'ONLINE',
              lastSeen: timestamp
            };

            firestore().collection('workers').doc(workerId).update(locationData).catch(() => {});
          });
        }
      }
    };
    track();
    return () => locationService.stopTracking();
  }, [uid, workerId, !!selectedLocation, !!workerProfile?.lastUsedAddress, !!workerProfile?.baseLocation]);

  // 5. REAL-TIME BOOKING LISTENERS
  useEffect(() => {
    if (!workerId) return;

    console.log('[WORKER DEBUG] Starting booking listeners for Business ID:', workerId);

    // A. Pending Requests Listener (Last 24h)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const unsubPending = firestore()
      .collection('bookings')
      .where('workerId', '==', workerId)
      .where('status', '==', 'pending')
      .where('createdAt', '>=', twentyFourHoursAgo)
      .onSnapshot(snap => {
        if (snap) {
          const requests = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          console.log('[WORKER DEBUG] Pending Requests for', workerId, ':', requests.length);
          setNewRequests(requests);
        }
      }, err => console.error('Pending listener error:', err));

    // B. Active Jobs Listener
    const unsubActive = firestore()
      .collection('bookings')
      .where('workerId', '==', workerId)
      .where('status', 'in', ['accepted', 'on_the_way', 'arrived', 'working'])
      .onSnapshot(snap => {
        if (snap) {
          const active = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          console.log('[WORKER DEBUG] Active Jobs for', workerId, ':', active.length);
          setActiveBookings(active);
        }
      }, err => console.error('Active listener error:', err));

    // C. Stats Aggregation
    const unsubStats = firestore()
      .collection('bookings')
      .where('workerId', '==', workerId)
      .onSnapshot(snap => {
        if (!snap) return;
        const all = snap.docs.map(d => d.data());
        const completed = all.filter(b => b.status === 'completed' || b.status === 'work_completed');
        
        const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
        const todayEarnings = completed
          .filter(b => (b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt)) >= startOfToday)
          .reduce((sum, b) => sum + (Number(b.price) || 0), 0);

        const startOfWeek = new Date(); startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const weekEarnings = completed
          .filter(b => (b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt)) >= startOfWeek)
          .reduce((sum, b) => sum + (Number(b.price) || 0), 0);

        setStats({
          today: todayEarnings,
          week: weekEarnings,
          completed: completed.length,
          pending: all.filter(b => b.status === 'pending').length,
          hours: Math.round(completed.length * 1.5)
        });
      });

    // D. Unread Notifications Listener
    const unsubUnread = firestore()
      .collection('workers')
      .doc(workerId)
      .collection('notifications')
      .where('isRead', '==', false)
      .onSnapshot(snap => {
        if (snap) setUnreadCount(snap.size);
      }, err => console.log('Unread listener error:', err));

    return () => {
      unsubPending();
      unsubActive();
      unsubStats();
      unsubUnread();
    };
  }, [workerId]);

  if (loading || !workerProfile) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' }}>
        <ActivityIndicator size="large" color="#E84545" />
        <Text style={{ marginTop: 12, color: '#666', fontWeight: '600' }}>Initializing...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* --- LOCATION HEADER --- */}
      <TouchableOpacity 
        style={styles.locationHeader}
        onPress={() => navigation.navigate('Location')}
        activeOpacity={0.8}
      >
        <View style={styles.locationLeft}>
          <MaterialCommunityIcons name="map-marker-radius" size={24} color="#E84545" />
          <View style={styles.locationTexts}>
            <Text style={styles.locationLabel}>Your Location</Text>
            <Text style={styles.locationValue} numberOfLines={1}>
              {selectedLocation?.shortAddress || selectedLocation?.name || workerAddress || 'Detecting...'}
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.notificationBtn} 
          onPress={() => navigation.navigate('Notifications')}
        >
          <Ionicons name="notifications-outline" size={24} color="#1A1A1A" />
          {unreadCount > 0 && <View style={styles.notificationDot} />}
        </TouchableOpacity>
      </TouchableOpacity>

      <Animated.ScrollView
        style={[styles.scrollView, { opacity: fadeAnim }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileLeft}>
            <Image
              source={{ uri: workerProfile?.photo || workerProfile?.profilePhoto || 'https://avatar.iran.liara.run/public/job/operator/male' }}
              style={styles.profileImage}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{workerProfile?.name || workerProfile?.fullName || 'Worker'}</Text>
              <Text style={styles.profileCategory}>{workerProfile?.serviceType || workerProfile?.category || 'Professional'}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={16} color="#F59E0B" />
                <Text style={styles.ratingText}>{workerProfile?.rating || '5.0'}</Text>
                <Text style={styles.ratingCount}>({stats.completed} jobs)</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Ionicons name="chevron-forward" size={20} color="#E84545" />
          </TouchableOpacity>
        </View>

        {/* Today's Earnings */}
        <View style={styles.earningsCard}>
          <LinearGradient colors={['#E84545', '#1A1A1A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.earningsGradient}>
            <View style={styles.earningsTop}>
              <View>
                <Text style={styles.earningsLabel}>Today's Earnings</Text>
                <Text style={styles.earningsAmount}>₹{stats.today.toLocaleString()}</Text>
                <Text style={styles.earningsSubtext}>Target: ₹1,000</Text>
              </View>
              <MaterialCommunityIcons name="wallet-outline" size={32} color="#FFFFFF" />
            </View>
            <View style={styles.earningsStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>This Week</Text>
                <Text style={styles.statValue}>₹{stats.week.toLocaleString()}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Jobs Done</Text>
                <Text style={styles.statValue}>{stats.completed}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Stats Grid */}
        <View style={styles.quickStats}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="clock-outline" size={24} color="#E84545" />
            <Text style={styles.statNumber}>{stats.hours}h</Text>
            <Text style={styles.statTitle}>Hours Online</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="star-outline" size={24} color="#E84545" />
            <Text style={styles.statNumber}>100%</Text>
            <Text style={styles.statTitle}>Success Rate</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="alert-circle-outline" size={24} color="#E84545" />
            <Text style={styles.statNumber}>{stats.pending}</Text>
            <Text style={styles.statTitle}>Pending</Text>
          </View>
        </View>

        {/* New Requests Section */}
        {newRequests.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>New Requests</Text>
              <View style={styles.badge}><Text style={styles.badgeText}>{newRequests.length}</Text></View>
            </View>
            {newRequests.map((req) => (
              <TouchableOpacity key={req.id} style={styles.requestCard} onPress={() => navigation.navigate('IncomingBooking', { bookingId: req.id, bookingData: req })}>
                <View style={styles.cardIcon}><MaterialCommunityIcons name="briefcase-plus" size={24} color="#E84545" /></View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{req.serviceType}</Text>
                  <Text style={styles.cardSub} numberOfLines={1}>📍 {req.userLocation?.address || req.userAddress || 'Location provided'}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Active Jobs Section */}
        {activeBookings.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Jobs</Text>
              <View style={[styles.badge, { backgroundColor: '#10B981' }]}><Text style={styles.badgeText}>{activeBookings.length}</Text></View>
            </View>
            {activeBookings.map((job) => (
              <TouchableOpacity key={job.id} style={styles.activeCard} onPress={() => navigation.navigate('ActiveJob', { bookingId: job.id, bookingData: job })}>
                <View style={styles.activeCardTop}>
                  <View style={styles.pulseDot} />
                  <Text style={styles.activeStatusText}>{job.status?.replace('_', ' ').toUpperCase()}</Text>
                </View>
                <Text style={styles.cardTitle}>{job.serviceType}</Text>
                <Text style={styles.cardSub} numberOfLines={1}>📍 {job.userLocation?.address || job.userAddress || 'Location provided'}</Text>
                <LinearGradient colors={['#E84545', '#1A1A1A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.actionBtn}>
                  <Text style={styles.actionBtnText}>Continue Tracking</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFF" />
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  locationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 18, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05 },
  locationLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  locationTexts: { flex: 1 },
  locationLabel: { fontSize: 11, color: '#E84545', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  locationValue: { fontSize: 17, color: '#1E293B', fontWeight: '800', marginTop: 2 },
  notificationBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  notificationDot: { position: 'absolute', top: 14, right: 15, width: 10, height: 10, borderRadius: 5, backgroundColor: '#E84545', borderWidth: 2, borderColor: '#FFF' },
  profileCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', margin: 20, padding: 16, borderRadius: 16, elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  profileLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  profileImage: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: '#E84545' },
  profileName: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  profileCategory: { fontSize: 13, color: '#E84545', fontWeight: '600' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 14, fontWeight: '700', color: '#1F2937' },
  ratingCount: { fontSize: 12, color: '#6B7280' },
  earningsCard: { marginHorizontal: 20, borderRadius: 20, overflow: 'hidden', elevation: 5 },
  earningsGradient: { padding: 20 },
  earningsTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  earningsLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  earningsAmount: { fontSize: 36, fontWeight: '800', color: '#FFF' },
  earningsSubtext: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  earningsStats: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 12 },
  statItem: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 2 },
  statValue: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 10 },
  quickStats: { flexDirection: 'row', marginHorizontal: 20, gap: 12, marginTop: 16 },
  statCard: { flex: 1, backgroundColor: '#FFF', padding: 16, borderRadius: 16, alignItems: 'center', elevation: 2 },
  statNumber: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginTop: 8 },
  statTitle: { fontSize: 11, color: '#6B7280' },
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  badge: { backgroundColor: '#1A1A1A', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  badgeText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  requestCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 16, borderRadius: 16, marginBottom: 12, elevation: 1 },
  cardIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  cardSub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  activeCard: { backgroundColor: '#FFF', padding: 16, borderRadius: 16, marginBottom: 12, elevation: 3 },
  activeCardTop: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  activeStatusText: { fontSize: 11, fontWeight: '800', color: '#047857', letterSpacing: 0.5 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 8, borderRadius: 12, marginTop: 12 },
  actionBtnText: { color: '#FFF', fontWeight: '800', fontSize: 14 }
});