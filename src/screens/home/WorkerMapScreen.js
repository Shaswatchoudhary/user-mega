import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Platform,
  Alert,
  FlatList,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useLocation } from '../../context/LocationContext';
import { useAuth } from '../../context/AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

export default function WorkerMapScreen({ navigation }) {
  const { selectedLocation } = useLocation();
  const { user } = useAuth();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Real-time listener for active & available & verified workers
    const unsubscribe = firestore()
      .collection('workers')
      .where('isActive', '==', true)
      .where('isAvailable', '==', true)
      .where('isVerified', '==', true)
      .onSnapshot(
        (querySnapshot) => {
          const allWorkers = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            allWorkers.push({
              id: doc.id,
              ...data,
              distance: (Math.random() * 2 + 0.5).toFixed(1), // Mock distance for UI
            });
          });
          setWorkers(allWorkers);
          setLoading(false);
        },
        (error) => {
          console.error('Firestore List Error:', error);
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, []);

  const handleBookNow = async (worker) => {
    try {
      const userCoords = { latitude: 16.7050, longitude: 74.2433 };
      const bookingRef = await firestore().collection('bookings').add({
        userId: user?.uid || user?._id,
        workerId: worker.id,
        serviceType: worker.serviceType || 'Service',
        status: 'pending',
        userLocation: {
          latitude: userCoords.latitude,
          longitude: userCoords.longitude,
          address: "Kolhapur City Center",
        },
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
        paymentStatus: 'pending',
        ticketStatus: null,
      });

      await firestore().collection('workers').doc(worker.id).update({
        isAvailable: false,
        currentBookingId: bookingRef.id,
      });

      navigation.navigate('WaitingForWorker', { 
        bookingId: bookingRef.id,
        workerId: worker.id
      });

    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert('Error', 'Could not create booking. Try again.');
    }
  };

  const renderWorkerItem = ({ item }) => (
    <View style={styles.workerCard}>
      <Image 
        source={{ uri: String(item.profilePhoto || 'https://avatar.iran.liara.run/public/job/operator/male') }} 
        style={styles.workerImage} 
      />
      <View style={styles.workerInfo}>
        <Text style={styles.workerName}>{item.name}</Text>
        <Text style={styles.workerService}>{item.serviceType}</Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color="#F59E0B" />
          <Text style={styles.ratingText}>{item.rating || '4.8'}</Text>
          <Text style={styles.distanceText}> • {item.distance} km away</Text>
        </View>
        <Text style={styles.statusBadge}>Available Now</Text>
      </View>
      <TouchableOpacity 
        style={styles.bookButton} 
        onPress={() => handleBookNow(item)}
      >
        <Text style={styles.bookButtonText}>Book</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#4F46E5', '#312E81']} style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Nearby Professionals</Text>
          <Text style={styles.headerSubtitle}>
            {workers.length} experts available in Kolhapur
          </Text>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Finding best workers for you...</Text>
        </View>
      ) : workers.length === 0 ? (
        <View style={styles.centerBox}>
          <MaterialCommunityIcons name="account-search-outline" size={64} color="#CBD5E1" />
          <Text style={styles.emptyText}>No workers available right now</Text>
        </View>
      ) : (
        <FlatList
          data={workers}
          renderItem={renderWorkerItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    marginRight: 15,
  },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#FFF', fontFamily: 'Poppins-Bold' },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontFamily: 'Poppins-Regular' },
  listContent: { padding: 20, paddingBottom: 40 },
  workerCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  workerImage: { width: 60, height: 60, borderRadius: 30, marginRight: 16 },
  workerInfo: { flex: 1 },
  workerName: { fontSize: 17, fontWeight: '700', color: '#1E293B', fontFamily: 'Poppins-Bold' },
  workerService: { fontSize: 13, color: '#64748B', marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  ratingText: { fontSize: 13, fontWeight: '600', color: '#1E293B', marginLeft: 4 },
  distanceText: { fontSize: 13, color: '#94A3B8' },
  statusBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  bookButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  bookButtonText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loadingText: { marginTop: 15, color: '#64748B', fontSize: 15 },
  emptyText: { marginTop: 15, color: '#94A3B8', fontSize: 16, textAlign: 'center' },
});
