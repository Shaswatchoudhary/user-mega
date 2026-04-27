import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const WorkerListScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Category comes from navigation params (e.g., 'Plumber', 'Electrician')
  // We use the exact string passed to match case-sensitive Firestore fields
  const category = route?.params?.category || 'Professional';

  useEffect(() => {
    console.log(`[FIRESTORE DEBUG] Screen mounted for category: "${category}"`);
    
    // 4. CHECK if the user is authenticated before making the Firestore query
    const authUnsubscribe = auth().onAuthStateChanged((user) => {
      if (user) {
        console.log(`[FIRESTORE DEBUG] Auth Ready: User is logged in (${user.uid})`);
        setIsAuthReady(true);
      } else {
        console.log(`[FIRESTORE DEBUG] Auth Warning: No user logged in yet.`);
        setIsAuthReady(false);
      }
    });

    return () => authUnsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthReady) return;

    setLoading(true);
    console.log(`[FIRESTORE DEBUG] Initializing Query for ServiceType: "${category}"`);
    console.log(`[FIRESTORE DEBUG] Querying collection("workers") where isVerified=true, isActive=true, isAvailable=true`);

    // 1. EXACT Firestore query as requested
    const unsubscribe = firestore()
      .collection('workers')
      .where('isVerified', '==', true)
      .where('isActive', '==', true)
      .where('isAvailable', '==', true)
      .where('serviceType', '==', category)
      .onSnapshot(
        (querySnapshot) => {
          // 3. ADD console.log debugging inside the onSnapshot callback
          console.log(`[FIRESTORE DEBUG] Snapshot received!`);
          console.log(`[FIRESTORE DEBUG] Number of documents returned: ${querySnapshot?.size || 0}`);

          const workerList = [];
          if (querySnapshot) {
            querySnapshot.forEach((doc) => {
              const data = doc.data();
              console.log(`[FIRESTORE DEBUG] Found Worker: ${data.fullName} (${doc.id})`);
              workerList.push({
                id: doc.id,
                ...data,
              });
            });
          }
          
          setWorkers(workerList);
          setLoading(false);
        },
        (error) => {
          // 3. Log any error in the error callback
          console.error(`[FIRESTORE ERROR] query failed:`, error.message);
          console.error(`[FIRESTORE ERROR] Code:`, error.code);
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, [category, isAuthReady]);

  const filteredWorkers = workers.filter((worker) =>
    worker.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    worker.skills?.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleBookNow = (worker) => {
    navigation.navigate('WorkerProfile', { 
      worker: {
        ...worker,
        name: worker.fullName,
        specialization: worker.serviceType
      }
    });
  };

  const renderWorkerCard = (worker) => (
    <View key={worker.id} style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.avatarContainer}>
          <Image 
            source={{ uri: worker.photo || worker.profilePhoto || 'https://avatar.iran.liara.run/public/job/operator/male' }} 
            style={styles.avatar} 
          />
          {worker.isAvailable && <View style={styles.onlineDot} />}
        </View>

        <View style={styles.mainContent}>
          <View style={styles.headerRow}>
            <View style={styles.nameSection}>
              <Text style={styles.name}>{worker.fullName}</Text>
              {worker.isVerified && <MaterialCommunityIcons name="shield-check" size={16} color="#10B981" />}
            </View>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text style={styles.ratingText}>{worker.rating || '4.5'}</Text>
            </View>
          </View>

          <Text style={styles.specialization}>{worker.serviceType}</Text>

          <View style={styles.skillsContainer}>
            {worker.skills?.slice(0, 3).map((skill, idx) => (
              <View key={idx} style={styles.skillBadge}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>

          <View style={styles.bottomRow}>
            <View style={styles.priceSection}>
              <Text style={styles.priceLabel}>Starting at</Text>
              <Text style={styles.price}>₹{worker.rate || '249'}/hr</Text>
            </View>

            <TouchableOpacity
              style={styles.bookButton}
              onPress={() => handleBookNow(worker)}
            >
              <LinearGradient
                colors={['#E84545', '#1A1A1A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.bookButtonGradient}
              >
                <Text style={styles.bookButtonText}>Book Now</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{category}s</Text>
          <Text style={styles.headerSubtitle}>{filteredWorkers.length} professionals active</Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${category}s...`}
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {!isAuthReady ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#E84545" />
          <Text style={styles.loaderText}>Verifying session...</Text>
        </View>
      ) : loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#E84545" />
          <Text style={styles.loaderText}>Finding experts...</Text>
        </View>
      ) : filteredWorkers.length > 0 ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.listContainer, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
        >
          {filteredWorkers.map(worker => renderWorkerCard(worker))}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="account-search-outline" size={80} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No Professionals Found</Text>
          <Text style={styles.emptySubtitle}>We couldn't find any active {category}s. Check back soon!</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', fontFamily: 'Poppins-Bold' },
  headerSubtitle: { fontSize: 12, color: '#6B7280', marginTop: 2, fontFamily: 'Poppins-Regular' },
  searchContainer: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 12, height: 48, paddingHorizontal: 14, gap: 10 },
  searchInput: { flex: 1, fontSize: 15, color: '#1A1A1A', fontFamily: 'Poppins-Regular' },
  scrollView: { flex: 1 },
  listContainer: { padding: 16 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  cardContent: { flexDirection: 'row' },
  avatarContainer: { marginRight: 14, position: 'relative' },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#F3F4F6' },
  onlineDot: { position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: '#10B981', borderWidth: 2, borderColor: '#FFFFFF' },
  mainContent: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  nameSection: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', fontFamily: 'Poppins-Bold' },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF7ED', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, gap: 4 },
  ratingText: { fontSize: 13, fontWeight: '700', color: '#92400E' },
  specialization: { fontSize: 13, color: '#E84545', fontWeight: '600', marginBottom: 8, fontFamily: 'Poppins-Medium' },
  skillsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  skillBadge: { backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  skillText: { fontSize: 11, color: '#4B5563', fontFamily: 'Poppins-Medium' },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  priceSection: { gap: 2 },
  priceLabel: { fontSize: 11, color: '#9CA3AF', fontFamily: 'Poppins-Regular' },
  price: { fontSize: 17, fontWeight: '700', color: '#1A1A1A', fontFamily: 'Poppins-Bold' },
  bookButton: { borderRadius: 10, overflow: 'hidden' },
  bookButtonGradient: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  bookButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', fontFamily: 'Poppins-Bold' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  loaderText: { marginTop: 12, fontSize: 15, color: '#6B7280', fontFamily: 'Poppins-Medium' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginTop: 16, fontFamily: 'Poppins-Bold' },
  emptySubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 8, lineHeight: 22, fontFamily: 'Poppins-Regular' },
});

export default WorkerListScreen;
