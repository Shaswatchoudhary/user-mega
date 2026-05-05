import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Image, StatusBar, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import firestore from '@react-native-firebase/firestore';

const Womenscare = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  const category = route?.params?.category || "Women's Self Care";

  useEffect(() => {
    console.log(`[FIRESTORE DEBUG] Initializing Query for ServiceType: "${category}"`);
    
    setLoading(true);
    const unsubscribe = firestore()
      .collection('workers')
      .where('isVerified', '==', true)
      .where('isActive', '==', true)
      .where('serviceType', '==', category)
      .onSnapshot(
        (querySnapshot) => {
          console.log(`[FIRESTORE DEBUG] Snapshot received!`);
          console.log(`[FIRESTORE DEBUG] Number of documents returned: ${querySnapshot?.size || 0}`);

          const workerList = [];
          if (querySnapshot) {
            querySnapshot.forEach((doc) => {
              const data = doc.data();
              console.log(`[FIRESTORE DEBUG] Found Worker: ${data.fullName || data.name} (${doc.id})`);
              workerList.push({
                id: doc.id,
                name: data.fullName || data.name || "Service Professional",
                rating: data.rating || 4.5,
                categoryName: data.category || data.serviceType || category,
                skills: data.skills || ["Professional Service"],
                price: data.basePrice || data.rate || 249,
                image: data.profileImage || data.photo || data.image,
                ...data
              });
            });
          }
          setWorkers(workerList);
          setLoading(false);
        },
        (error) => {
          console.error(`[FIRESTORE ERROR]:`, error);
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, [category]);


  const filteredWorkers = workers.filter(w =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderWorkerCard = (worker) => (
    <View key={worker.id} style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.avatarContainer}>
          {worker.image ? (
            <Image source={{ uri: worker.image }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder} />
          )}
        </View>

        <View style={{ flex: 1 }}>
          <View style={styles.nameRow}>
            <View style={styles.nameSection}>
              <Text style={styles.name}>{String(worker.name || '')}</Text>
              <MaterialCommunityIcons name="check-decagram" size={16} color="#10B981" />
            </View>
            <View style={styles.ratingSection}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.ratingText}>{String(worker.rating || '0')}</Text>
            </View>
          </View>

          <Text style={styles.categoryLabel}>{String(worker.categoryName || '')}</Text>

          <View style={styles.skillsRow}>
            {(worker.skills || []).slice(0, 3).map((skill, index) => (
              <View key={index} style={styles.skillChip}>
                <Text style={styles.skillText}>{String(skill || '')}</Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          <View style={styles.bottomRow}>
            <View style={styles.priceContainer}>
              <Text style={styles.startingAt}>Starting at</Text>
              <Text style={styles.price}>₹{String(worker.price || '0')}/hr</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('WorkerProfile', { worker: worker })}
            >
              <LinearGradient
                colors={['#E84545', '#722F37']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.bookButton}
              >
                <Text style={styles.bookButtonText}>Book Now</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{String(category || '')}</Text>
          <Text style={styles.headerSubtitle}>{String(filteredWorkers.length || '0')} professionals active</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${category}...`}
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centered}><ActivityIndicator size="large" color="#E84545" /></View>
      ) : filteredWorkers.length > 0 ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.listContainer, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
        >
          {filteredWorkers.map(renderWorkerCard)}
        </ScrollView>
      ) : (
        <View style={styles.emptyStateContainer}>
          <MaterialCommunityIcons name="account-search-outline" size={100} color="#E2E8F0" />
          <Text style={styles.emptyStateTitle}>No Professionals Found</Text>
          <Text style={styles.emptyStateSubtitle}>We couldn't find any active {String(category || '')}. Check back soon!</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  headerSubtitle: { fontSize: 13, color: '#9CA3AF', marginTop: 2 },
  searchContainer: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    height: 50,
    paddingHorizontal: 16,
  },
  searchInput: { flex: 1, fontSize: 15, color: '#1F2937' },
  scrollView: { flex: 1 },
  listContainer: { padding: 16 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardContent: { padding: 16, flexDirection: 'row' },
  avatarContainer: { marginRight: 16 },
  avatarPlaceholder: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#F3F4F6' },
  avatar: { width: 64, height: 64, borderRadius: 32 },
  nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  nameSection: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: 17, fontWeight: '700', color: '#1F2937' },
  ratingSection: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  categoryLabel: { fontSize: 14, color: '#E84545', fontWeight: '500', marginBottom: 12 },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  skillChip: { backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginRight: 8 },
  skillText: { fontSize: 12, color: '#4B5563', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 12 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceContainer: { gap: 2 },
  startingAt: { fontSize: 11, color: '#9CA3AF' },
  price: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  bookButtonText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  emptyStateContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, marginTop: -40 },
  emptyStateTitle: { fontSize: 20, fontWeight: '700', color: '#1F2937', marginTop: 16 },
  emptyStateSubtitle: { fontSize: 15, color: '#6B7280', textAlign: 'center', marginTop: 8, lineHeight: 22 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});

export default Womenscare;