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
      <View key={item.id} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.statusBadge, { backgroundColor: isPending ? '#FFF7ED' : '#EFF6FF' }]}>
            <View style={[styles.statusDot, { backgroundColor: isPending ? '#F97316' : '#3B82F6' }]} />
            <Text style={[styles.statusText, { color: isPending ? '#F97316' : '#3B82F6' }]}>
              {isPending ? 'PENDING REQUEST' : 'ACCEPTED JOB'}
            </Text>
          </View>
          <Text style={styles.priceText}>₹{item.price || item.totalPrice || 0}</Text>
        </View>

        <Text style={styles.serviceTitle}>{item.serviceType || 'General Service'}</Text>
        
        <View style={styles.infoRow}>
          <Ionicons name="person" size={16} color="#6B7280" />
          <Text style={styles.infoText}>{item.userName || 'Customer'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="location" size={16} color="#E84545" />
          <Text style={styles.addressText} numberOfLines={2}>
            {item.userLocation?.fullAddress || item.userAddress || 'Address not provided'}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.buttonRow}>
          {isPending ? (
            <>
              <TouchableOpacity 
                style={styles.rejectBtn} 
                onPress={() => handleReject(item.id)}
              >
                <Text style={styles.rejectBtnText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{ flex: 1 }} 
                onPress={() => handleAccept(item.id)}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.acceptBtn}
                >
                  <Text style={styles.acceptBtnText}>Accept Job</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity 
              style={{ flex: 1 }} 
              onPress={() => navigation.navigate('ActiveJob', { bookingId: item.id, bookingData: item })}
            >
              <LinearGradient
                colors={['#E84545', '#1A1A1A']}
                style={styles.viewBtn}
              >
                <Text style={styles.viewBtnText}>View Job Details</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </View>
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
  card: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  priceText: { fontSize: 20, fontWeight: '800', color: '#111827' },
  
  serviceTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  infoText: { fontSize: 14, fontWeight: '600', color: '#374151' },
  addressText: { fontSize: 14, color: '#6B7280', flex: 1, lineHeight: 20 },
  
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 16 },
  buttonRow: { flexDirection: 'row', gap: 12 },
  rejectBtn: { flex: 0.5, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: '#FEE2E2' },
  rejectBtnText: { color: '#EF4444', fontWeight: '700' },
  acceptBtn: { height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  acceptBtnText: { color: '#FFF', fontWeight: '700' },
  viewBtn: { height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 12, gap: 8 },
  viewBtnText: { color: '#FFF', fontWeight: '700' }
});

export default JobScreen;