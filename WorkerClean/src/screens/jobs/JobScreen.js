import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useAuth } from '../../context/AuthContext';

const JobScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { workerUser, workerProfile } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const uid = workerUser?.uid;
  const workerId = workerProfile?.id || workerProfile?._id || uid;

  useEffect(() => {
    if (!workerId) return;

    const unsubscribe = firestore()
      .collection('bookings')
      .where('workerId', '==', workerId)
      .where('status', 'in', ['pending', 'accepted'])
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        snapshot => {
          const fetchedJobs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setJobs(fetchedJobs);
          setIsLoading(false);
        },
        error => {
          console.error('[JobScreen] Firestore Error:', error);
          setIsLoading(false);
        }
      );

    return () => unsubscribe();
  }, []);

  const handleAccept = async (jobId) => {
    try {
      const uid = auth().currentUser?.uid;
      await firestore().collection('bookings').doc(jobId).update({
        status: 'accepted',
        updatedAt: firestore.FieldValue.serverTimestamp()
      });
      await firestore().collection('workers').doc(uid).update({
        isAvailable: false
      });
      Alert.alert('Success', 'Job accepted! You can now start navigating.');
    } catch (error) {
      console.error('Accept error:', error);
      Alert.alert('Error', 'Failed to accept job');
    }
  };

  const handleReject = async (jobId) => {
    try {
      const uid = auth().currentUser?.uid;
      await firestore().collection('bookings').doc(jobId).update({
        status: 'rejected',
        updatedAt: firestore.FieldValue.serverTimestamp()
      });
      await firestore().collection('workers').doc(uid).update({
        isAvailable: true
      });
    } catch (error) {
      console.error('Reject error:', error);
      Alert.alert('Error', 'Failed to reject job');
    }
  };

  const renderJobCard = (item) => {
    const isPending = item.status === 'pending';
    const isAccepted = item.status === 'accepted';

    return (
      <TouchableOpacity 
        key={item.id} 
        style={styles.pendingRequestCard} 
        onPress={() => {
          if (isPending) {
            navigation.navigate('IncomingBooking', { bookingId: item.id, bookingData: item });
          } else {
            navigation.navigate('ActiveJob', { bookingId: item.id, bookingData: item });
          }
        }}
        activeOpacity={0.9}
      >
        <View style={styles.pendingHeader}>
          <View style={[styles.pendingBadge, { backgroundColor: isPending ? '#FFF7ED' : '#EFF6FF' }]}>
            <View style={[styles.orangeDot, { backgroundColor: isPending ? '#F97316' : '#3B82F6' }]} />
            <Text style={[styles.pendingBadgeText, { color: isPending ? '#F97316' : '#3B82F6' }]}>
              {isPending ? 'PENDING REQUEST' : 'ACCEPTED JOB'}
            </Text>
          </View>
          <Text style={styles.pendingPrice}>₹{item.price || item.totalPrice || 249}</Text>
        </View>

        <Text style={styles.pendingServiceTitle}>{item.serviceType || 'Service Professional'}</Text>

        <View style={styles.pendingDetailRow}>
          <Ionicons name="person" size={18} color="#64748B" />
          <Text style={styles.pendingDetailLabel}>Customer</Text>
        </View>

        <View style={[styles.pendingDetailRow, { alignItems: 'flex-start' }]}>
          <Ionicons name="location" size={18} color="#EF4444" />
          <Text style={styles.pendingAddressText} numberOfLines={2}>
            {item.userLocation?.fullAddress || item.userAddress || 'Fetching address...'}
          </Text>
        </View>

        <View style={styles.viewJobBtn}>
          <Text style={styles.viewJobBtnText}>{isPending ? 'View Full Details' : 'Continue Job'}</Text>
          <Ionicons name="arrow-forward" size={16} color="#E84545" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Job Requests</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{jobs.length}</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#E84545" />
        </View>
      ) : jobs.length === 0 ? (
        <View style={styles.center}>
          <MaterialCommunityIcons name="clipboard-text-off-outline" size={80} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No active jobs</Text>
          <Text style={styles.emptySubtitle}>New job requests for you will appear here.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {jobs.map(renderJobCard)}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { 
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' 
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#111827' },
  countBadge: { backgroundColor: '#E84545', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  countText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#374151', marginTop: 20 },
  emptySubtitle: { fontSize: 15, color: '#6B7280', textAlign: 'center', marginTop: 8 },

  scrollContent: { padding: 16 },
  pendingRequestCard: { backgroundColor: '#FFF', padding: 18, borderRadius: 24, marginBottom: 16, elevation: 3, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  pendingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  pendingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF7ED', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, gap: 6 },
  orangeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#F97316' },
  pendingBadgeText: { fontSize: 10, fontWeight: '800', color: '#F97316', letterSpacing: 0.5 },
  pendingPrice: { fontSize: 22, fontWeight: '900', color: '#1E293B', fontFamily: 'Poppins-Bold' },
  pendingServiceTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 14, fontFamily: 'Poppins-Bold' },
  pendingDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  pendingDetailLabel: { fontSize: 15, color: '#1E293B', fontWeight: '700', fontFamily: 'Poppins-Bold' },
  pendingAddressText: { flex: 1, fontSize: 14, color: '#64748B', lineHeight: 20, fontWeight: '500' },
  viewJobBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16, paddingVertical: 12, backgroundColor: '#F8FAFC', borderRadius: 14, borderWidth: 1, borderColor: '#F1F5F9' },
  viewJobBtnText: { fontSize: 14, fontWeight: '700', color: '#E84545' },
});

export default JobScreen;