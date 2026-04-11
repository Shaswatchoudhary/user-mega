import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { API_BASE_URL } from '../../constants/config';
import { useLocation } from '../../context/LocationContext';

const PlumberScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { selectedLocation } = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Get category from params, default
  const category = route?.params?.category || 'Plumber';

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkers();
  }, [category, selectedLocation]);

  const fetchWorkers = async () => {
    try {
      const { latitude, longitude } = selectedLocation || { latitude: 16.7050, longitude: 74.2433 };
      const url = `${API_BASE_URL}/workers?category=${encodeURIComponent(category)}&lat=${latitude}&lng=${longitude}`;
      console.log('Fetching URL:', url);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const json = await response.json();
      if (json.success) {
        const mappedWorkers = json.data.map(worker => ({
          id: worker._id,
          name: worker.fullName || "Service Professional",
          rating: worker.rating || 4.5,
          reviewCount: worker.completedOrders || 0,
          experience: `${worker.experience || 0}+ Years`,
          rate: worker.basePrice || 299,
          distance: worker.distanceInKm || 0,
          verified: true,
          specialization: worker.category || category,
          image: worker.image
        }));
        setWorkers(mappedWorkers);
      }
    } catch (error) {
      console.error('FULL ERROR DETAILS:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOptions = [
    { id: 'all', label: 'All Professionals', icon: 'grid-outline' },
    { id: 'rating', label: 'Highest Rated', icon: 'star' },
    { id: 'price_low', label: 'Price: Low to High', icon: 'arrow-up' },
    { id: 'price_high', label: 'Price: High to Low', icon: 'arrow-down' },
    { id: 'distance', label: 'Nearest First', icon: 'location' },
    { id: 'experience', label: 'Most Experienced', icon: 'ribbon' },
  ];

  const getSortedWorkers = () => {
    let sorted = [...workers];
    switch (selectedFilter) {
      case 'rating': sorted.sort((a, b) => b.rating - a.rating); break;
      case 'price_low': sorted.sort((a, b) => a.rate - b.rate); break;
      case 'price_high': sorted.sort((a, b) => b.rate - a.rate); break;
      case 'distance': sorted.sort((a, b) => a.distance - b.distance); break;
      case 'experience':
        sorted.sort((a, b) => parseInt(b.experience) - parseInt(a.experience));
        break;
      default: break;
    }
    return sorted;
  };

  const handleBookNow = (worker) => {
    navigation.navigate('WorkerProfile', { 
      worker: worker,
      preSelectedProduct: route.params?.preSelectedProduct
    });
  };

  const renderWorkerCard = (worker) => (
    <View key={worker.id} style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarPlaceholder}>
            <MaterialCommunityIcons name="pipe-wrench" size={32} color="#9CA3AF" />
          </View>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.headerRow}>
            <View style={styles.nameSection}>
              <Text style={styles.name}>{worker.name}</Text>
              {worker.verified && <MaterialCommunityIcons name="shield-check" size={16} color="#10B981" />}
            </View>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text style={styles.ratingText}>{worker.rating}</Text>
            </View>
          </View>

          <Text style={styles.specialization}>{worker.specialization}</Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Ionicons name="briefcase-outline" size={14} color="#6B7280" />
              <Text style={styles.infoText}>{worker.experience}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={14} color="#6B7280" />
              <Text style={styles.infoText}>{worker.distance} km</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <Ionicons name="chatbox-outline" size={14} color="#6B7280" />
              <Text style={styles.infoText}>{worker.reviewCount}</Text>
            </View>
          </View>

          <View style={styles.bottomRow}>
            <View style={styles.priceSection}>
              <Text style={styles.priceLabel}>Starting at</Text>
              <Text style={styles.price}>₹{worker.rate}/hr</Text>
            </View>

            <TouchableOpacity
              style={styles.bookButton}
              onPress={() => handleBookNow(worker)}
              activeOpacity={0.8}
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
          <Text style={styles.headerTitle}>Plumbers</Text>
          <Text style={styles.headerSubtitle}>{getSortedWorkers().length} professionals nearby</Text>
        </View>

        <TouchableOpacity style={styles.filterButton} onPress={() => setFilterVisible(true)}>
          <Ionicons name="options-outline" size={24} color="#000" />
          {selectedFilter !== 'all' && <View style={styles.filterDot} />}
        </TouchableOpacity>
      </View>

      {/* Location Display Header */}
      <TouchableOpacity
        style={styles.locationDisplayRow}
        onPress={() => navigation.navigate('LocationSelection')}
      >
        <Ionicons name="location" size={16} color="#E84545" />
        <Text style={styles.locationDisplayText} numberOfLines={1}>
          {selectedLocation?.addressText || selectedLocation?.address || 'Select your location'}
        </Text>
        <Ionicons name="chevron-forward" size={14} color="#6B7280" />
      </TouchableOpacity>

      {/* Product Selection Banner */}
      {route.params?.preSelectedProduct && (
        <View style={styles.productBanner}>
          <MaterialCommunityIcons name="shopping-outline" size={18} color="#FFF" />
          <Text style={styles.productBannerText}>
            Booking for: <Text style={{ fontWeight: 'bold' }}>{route.params.preSelectedProduct}</Text>
          </Text>
          <TouchableOpacity onPress={() => navigation.setParams({ preSelectedProduct: null })}>
            <Ionicons name="close-circle" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or specialization"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.listContainer, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {getSortedWorkers().map(worker => renderWorkerCard(worker))}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={filterVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setFilterVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setFilterVisible(false)} />
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sort & Filter</Text>
              <TouchableOpacity onPress={() => setFilterVisible(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.filterOptions}>
              {filterOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[styles.filterOption, selectedFilter === option.id && styles.filterOptionSelected]}
                  onPress={() => { setSelectedFilter(option.id); setFilterVisible(false); }}
                >
                  <Text style={[styles.filterOptionText, selectedFilter === option.id && styles.filterOptionTextSelected]}>
                    {option.label}
                  </Text>
                  {selectedFilter === option.id && <Ionicons name="checkmark-circle" size={24} color="#E84545" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#000' },
  headerSubtitle: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  filterButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  filterDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#E84545' },
  locationDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  locationDisplayText: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  searchContainer: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFFFFF' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12, height: 44, paddingHorizontal: 14, gap: 10 },
  searchInput: { flex: 1, fontSize: 15, color: '#000' },
  scrollView: { flex: 1 },
  listContainer: { padding: 16 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 16 },
  cardContent: { flexDirection: 'row' },
  avatarContainer: { marginRight: 14 },
  avatarPlaceholder: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  mainContent: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 16, fontWeight: '600', color: '#000' },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF7ED', padding: 4, borderRadius: 6, gap: 4 },
  ratingText: { fontSize: 13, fontWeight: '600', color: '#000' },
  specialization: { fontSize: 13, color: '#6B7280', marginBottom: 12 },
  infoGrid: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoText: { fontSize: 13, color: '#6B7280' },
  infoDivider: { width: 1, height: 12, backgroundColor: '#E5E7EB' },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  priceLabel: { fontSize: 11, color: '#9CA3AF' },
  price: { fontSize: 16, fontWeight: '700', color: '#000' },
  bookButton: { borderRadius: 10, overflow: 'hidden' },
  bookButtonGradient: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, gap: 6 },
  bookButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  modalTitle: { fontSize: 18, fontWeight: '600' },
  filterOptions: { padding: 8 },
  filterOption: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  filterOptionSelected: { backgroundColor: '#FEF2F2' },
  filterOptionText: { fontSize: 15, color: '#374151' },
  filterOptionTextSelected: { fontWeight: '600', color: '#E84545' },
  nameSection: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  productBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  productBannerText: {
    flex: 1,
    color: '#FFF',
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
  },
});

export default PlumberScreen;