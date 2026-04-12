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
import axios from 'axios';
import config from '../../constants/config';

const JobScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [acceptModalVisible, setAcceptModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${config.API_BASE_URL}/booking`);
      if (response.data.success) {
        // Filter jobs that are not yet accepted or relevant for the worker
        // For now displaying all bookings as 'Available Jobs' for demo/test
        setJobs(response.data.data);
      }
    } catch (error) {
      console.error('[JobScreen] Fetch Jobs Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleAcceptJob = (job) => {
    setSelectedJob(job);
    setAcceptModalVisible(true);
  };

  const confirmAcceptance = () => {
    setAcceptModalVisible(false);
    navigation.navigate('DetailScreen', { job: selectedJob });
  };

  const filterOptions = [
    { id: 'all', label: 'All Jobs', icon: 'grid-outline' },
    { id: 'urgent', label: 'Urgent Jobs', icon: 'alert-circle' },
    { id: 'budget_high', label: 'Budget: High to Low', icon: 'cash' },
    { id: 'budget_low', label: 'Budget: Low to High', icon: 'cash-outline' },
    { id: 'distance', label: 'Nearest First', icon: 'location' },
    { id: 'recent', label: 'Recently Posted', icon: 'time' },
  ];

  const getSortedJobs = () => {
    let sorted = [...jobs];
    
    switch (selectedFilter) {
      case 'urgent':
        sorted = sorted.filter(job => job.urgency === 'urgent');
        break;
      case 'budget_high':
        sorted.sort((a, b) => b.budget - a.budget);
        break;
      case 'budget_low':
        sorted.sort((a, b) => a.budget - b.budget);
        break;
      case 'distance':
        sorted.sort((a, b) => a.distance - b.distance);
        break;
      case 'recent':
        // Already sorted by recent
        break;
      default:
        break;
    }
    
    return sorted;
  };

  const renderJobCard = (job) => (
    <View key={job.id} style={styles.card}>
      <View style={styles.cardContent}>
        {/* Urgency Badge */}
        {job.urgency === 'urgent' && (
          <View style={styles.urgentBadge}>
            <Ionicons name="flash" size={12} color="#FFFFFF" />
            <Text style={styles.urgentText}>URGENT</Text>
          </View>
        )}

        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.categoryBadge}>
            <MaterialCommunityIcons 
              name={getCategoryIcon(job.category)} 
              size={16} 
              color="#E84545" 
            />
            <Text style={styles.categoryText}>{job.category}</Text>
          </View>
          <Text style={styles.postedTime}>{job.posted}</Text>
        </View>

        {/* Title */}
        <Text style={styles.jobTitle}>{job.serviceType || job.title}</Text>

        {/* Description */}
        <Text style={styles.description} numberOfLines={2}>{job.description || 'Professional service requested.'}</Text>

        {/* Customer & Location */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="person-outline" size={16} color="#6B7280" />
            <Text style={styles.infoText}>{job.customerName || job.customer}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            <Text style={styles.infoText}>{job.address || job.location} • {job.distanceKm || job.distance || 0} km</Text>
          </View>
        </View>

        {/* Bottom Row */}
        <View style={styles.bottomRow}>
          <View style={styles.budgetSection}>
            <Text style={styles.budgetLabel}>Budget</Text>
            <Text style={styles.budget}>₹{job.totalPrice || job.budget}</Text>
          </View>

          <TouchableOpacity
            onPress={() => handleAcceptJob(job)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#E84545', '#1A1A1A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.acceptButton}
            >
              <Text style={styles.acceptButtonText}>Accept Job</Text>
              <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const getCategoryIcon = (category) => {
    const icons = {
      'Electrician': 'flash',
      'AC Technician': 'air-conditioner',
      'Plumber': 'pipe-wrench',
      'Painter': 'format-paint',
      'Carpenter': 'tools',
    };
    return icons[category] || 'wrench';
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons name="briefcase-outline" size={28} color="#E84545" />
        </View>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Available Jobs</Text>
          <Text style={styles.headerSubtitle}>{getSortedJobs().length} jobs nearby</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setFilterVisible(true)}
        >
          <Ionicons name="options-outline" size={24} color="#000" />
          {selectedFilter !== 'all' && <View style={styles.filterDot} />}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search jobs by title or category"
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

      {/* Active Filter Chip */}
      {selectedFilter !== 'all' && (
        <View style={styles.activeFilterContainer}>
          <View style={styles.filterChip}>
            <Ionicons 
              name={filterOptions.find(f => f.id === selectedFilter)?.icon} 
              size={14} 
              color="#E84545" 
            />
            <Text style={styles.filterChipText}>
              {filterOptions.find(f => f.id === selectedFilter)?.label}
            </Text>
            <TouchableOpacity onPress={() => setSelectedFilter('all')}>
              <Ionicons name="close" size={16} color="#E84545" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Jobs List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.listContainer, { paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
      >
        {getSortedJobs().map((job) => renderJobCard(job))}
      </ScrollView>

      {/* Job Acceptance Modal */}
      <Modal
        visible={acceptModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setAcceptModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.acceptModalContent}>
            <View style={styles.acceptModalHeader}>
              <View style={styles.headerIconContainer}>
                <Ionicons name="briefcase" size={30} color="#E84545" />
              </View>
              <Text style={styles.acceptModalTitle}>Accept Job Request?</Text>
              <Text style={styles.acceptModalSubtitle}>Please confirm the details before proceeding.</Text>
            </View>

            <View style={styles.acceptJobDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailCardLabel}>Job Title</Text>
                <Text style={styles.detailCardValue}>{selectedJob?.title}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailCardLabel}>Customer</Text>
                <Text style={styles.detailCardValue}>{selectedJob?.customer}</Text>
              </View>

              <View style={styles.detailSplitRow}>
                <View style={styles.detailSplitItem}>
                  <Text style={styles.detailCardLabel}>Budget</Text>
                  <Text style={styles.detailCardBudget}>₹{selectedJob?.budget}</Text>
                </View>
                <View style={styles.detailSplitItem}>
                  <Text style={styles.detailCardLabel}>Distance</Text>
                  <Text style={styles.detailCardValue}>{selectedJob?.distance} km</Text>
                </View>
              </View>
            </View>

            <View style={styles.acceptModalFooter}>
              <TouchableOpacity 
                style={styles.cancelModalBtn}
                onPress={() => setAcceptModalVisible(false)}
              >
                <Text style={styles.cancelModalBtnText}>Go Back</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={confirmAcceptance}
                activeOpacity={0.8}
                style={{ flex: 1.5 }}
              >
                <LinearGradient
                  colors={['#E84545', '#1A1A1A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.confirmModalBtn}
                >
                  <Text style={styles.confirmModalBtnText}>Confirm Acceptance</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Filter Modal */}
      <Modal
        visible={filterVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setFilterVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            activeOpacity={1}
            onPress={() => setFilterVisible(false)}
          />
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHandle} />
            
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
                  style={[
                    styles.filterOption,
                    selectedFilter === option.id && styles.filterOptionSelected
                  ]}
                  onPress={() => {
                    setSelectedFilter(option.id);
                    setFilterVisible(false);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.filterOptionLeft}>
                    <View style={[
                      styles.filterIconContainer,
                      selectedFilter === option.id && styles.filterIconContainerSelected
                    ]}>
                      <Ionicons 
                        name={option.icon} 
                        size={20} 
                        color={selectedFilter === option.id ? '#E84545' : '#6B7280'} 
                      />
                    </View>
                    <Text style={[
                      styles.filterOptionText,
                      selectedFilter === option.id && styles.filterOptionTextSelected
                    ]}>
                      {option.label}
                    </Text>
                  </View>
                  {selectedFilter === option.id && (
                    <Ionicons name="checkmark-circle" size={24} color="#E84545" />
                  )}
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
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  filterButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E84545',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#000',
  },
  activeFilterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E84545',
  },
  scrollView: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
  },
  urgentBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomLeftRadius: 12,
    gap: 4,
  },
  urgentText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E84545',
  },
  postedTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  jobTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  infoRow: {
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  requirementsContainer: {
    marginTop: 12,
    marginBottom: 16,
  },
  requirementsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  requirementsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  requirementChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  requirementText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  budgetSection: {
    gap: 2,
  },
  budgetLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  budget: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 11,
    gap: 8,
    borderRadius: 10,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  filterOptions: {
    paddingVertical: 8,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  filterOptionSelected: {
    backgroundColor: '#FEF2F2',
  },
  filterOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  filterIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIconContainerSelected: {
    backgroundColor: '#FEE2E2',
  },
  filterOptionText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  filterOptionTextSelected: {
    fontWeight: '600',
    color: '#E84545',
  },
  acceptModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  acceptModalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  acceptModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  acceptModalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  acceptJobDetails: {
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  detailRow: {
    marginBottom: 16,
  },
  detailSplitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  detailSplitItem: {
    flex: 1,
  },
  detailCardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  detailCardValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  detailCardBudget: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
  },
  acceptModalFooter: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelModalBtn: {
    flex: 1,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  cancelModalBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
  },
  confirmModalBtn: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    gap: 10,
  },
  confirmModalBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default JobScreen;