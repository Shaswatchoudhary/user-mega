import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import config from '../../constants/config';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

const DetailScreen = ({ navigation, route }) => {
  const [jobAccepted, setJobAccepted] = useState(false);
  const [acceptModalVisible, setAcceptModalVisible] = useState(false);
  
  // Use job data from route params
  const job = route.params?.job || {};

  const handleAcceptJob = () => {
    setAcceptModalVisible(true);
  };

  const [isAccepting, setIsAccepting] = useState(false);

  const confirmAcceptance = async () => {
    setAcceptModalVisible(false);
    setIsAccepting(true);
    
    try {
      const bookingId = job.mongoId || job.id;
      if (!bookingId) {
        throw new Error('Booking ID not found');
      }

      // 1. Call Backend API
      const response = await axios.patch(`${config.API_BASE_URL}/booking/${bookingId}/status`, {
        status: 'accepted'
      });

      if (response.data.success) {
        setJobAccepted(true);
        Alert.alert('Success', 'Job accepted successfully! You can now proceed.');
      } else {
        throw new Error(response.data.message || 'Failed to accept job');
      }
    } catch (error) {
      console.error('Job acceptance error:', error);
      Alert.alert('Error', error.message || 'Failed to connect to the server');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleStartJob = () => {
    navigation.navigate('PaymentScreen'); // Navigate to payment screen
  };

  const handleBackPress = () => {
    navigation.goBack(); // Go back to jobs list
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#E84545" />

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
              <Text style={styles.acceptModalTitle}>Accept This Job?</Text>
              <Text style={styles.acceptModalSubtitle}>Confirm that you can reach the location and fulfill the requirements.</Text>
            </View>

            <View style={styles.acceptJobDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailCardLabel}>Job Title</Text>
                <Text style={styles.detailCardValue}>{job?.title}</Text>
              </View>
              <View style={styles.detailSplitRow}>
                <View style={styles.detailSplitItem}>
                  <Text style={styles.detailCardLabel}>Budget</Text>
                  <Text style={styles.detailCardBudget}>₹{job?.budget}</Text>
                </View>
                <View style={styles.detailSplitItem}>
                  <Text style={styles.detailCardLabel}>Urgency</Text>
                  <Text style={[styles.detailCardValue, { color: job?.urgency === 'urgent' ? '#EF4444' : '#111827' }]}>{job?.urgency?.toUpperCase()}</Text>
                </View>
              </View>
            </View>

            <View style={styles.acceptModalFooter}>
              <TouchableOpacity 
                style={styles.cancelModalBtn}
                onPress={() => setAcceptModalVisible(false)}
              >
                <Text style={styles.cancelModalBtnText}>Decide Later</Text>
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
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <LinearGradient
        colors={['#E84545', '#1A1A1A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Details</Text>
        <View style={styles.headerRight} />
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Job ID & Status */}
        <View style={styles.jobIdContainer}>
          <Text style={styles.jobId}>{job?.id || '#JB-NEW'}</Text>
          <View style={styles.urgencyBadge}>
            <Ionicons name="flash" size={12} color="#FFFFFF" />
            <Text style={styles.urgencyText}>{job?.urgency?.toUpperCase() || 'NORMAL'}</Text>
          </View>
        </View>

        {/* Main Job Card */}
        <LinearGradient
          colors={['#E84545', '#1A1A1A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.mainCard}
        >
          <View style={styles.jobHeader}>
            <View style={styles.jobIcon}>
              <MaterialCommunityIcons name="wrench" size={32} color="#FFFFFF" />
            </View>
            <View style={styles.jobTitleContainer}>
              <Text style={styles.jobTitle}>{job?.title}</Text>
              <Text style={styles.jobCategory}>{job?.category}</Text>
            </View>
          </View>

          <Text style={styles.jobDescription}>{job?.description || 'No description provided.'}</Text>

          <View style={styles.jobStats}>
            <View style={styles.statItem}>
              <Ionicons name="time" size={20} color="rgba(255, 255, 255, 0.8)" />
              <Text style={styles.statValue}>{job?.timing?.duration || '2 hours'}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="cash" size={20} color="rgba(255, 255, 255, 0.8)" />
              <Text style={styles.statValue}>₹{job?.budget}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="location" size={20} color="rgba(255, 255, 255, 0.8)" />
              <Text style={styles.statValue}>{job?.distance} km</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Customer Details Card */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-circle" size={24} color="#E84545" />
            <Text style={styles.sectionTitle}>Customer Details</Text>
          </View>

          <View style={styles.customerInfo}>
            <View style={styles.customerHeader}>
              <View style={styles.customerAvatar}>
                <Text style={styles.avatarText}>
                  {job?.customer ? job.customer.split(' ').map(n => n[0]).join('') : 'C'}
                </Text>
              </View>
              <View style={styles.customerDetails}>
                <Text style={styles.customerName}>{job?.customer}</Text>
                <View style={styles.customerRating}>
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text style={styles.ratingText}>4.8</Text>
                  <Text style={styles.jobsCount}>(Verified Customer)</Text>
                </View>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="call" size={16} color="#6B7280" />
              <Text style={styles.infoText}>Contact visible after acceptance</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="location" size={16} color="#6B7280" />
              <Text style={styles.infoText}>{job?.location}</Text>
            </View>
          </View>
        </View>

        {/* Timing & Location Card */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar" size={24} color="#E84545" />
            <Text style={styles.sectionTitle}>Timing & Location</Text>
          </View>

          <View style={styles.timingGrid}>
            <View style={styles.timingItem}>
              <LinearGradient
                colors={['#E84545', '#1A1A1A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.timingIcon}
              >
                <Ionicons name="time" size={20} color="#FFFFFF" />
              </LinearGradient>
              <View style={styles.timingInfo}>
                <Text style={styles.timingLabel}>Date & Time</Text>
                <Text style={styles.timingValue}>
                  {job?.posted || 'Today, 4:00 PM'}
                </Text>
              </View>
            </View>

            <View style={styles.timingItem}>
              <LinearGradient
                colors={['#E84545', '#2B2E4A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.timingIcon}
              >
                <Ionicons name="navigate" size={20} color="#FFFFFF" />
              </LinearGradient>
              <View style={styles.timingInfo}>
                <Text style={styles.timingLabel}>Location</Text>
                <Text style={styles.timingValue}>{job?.location || 'Nearby'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Payment Details Card */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="wallet" size={24} color="#E84545" />
            <Text style={styles.sectionTitle}>Payment Details</Text>
          </View>

          <View style={styles.paymentDetails}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Service Charge</Text>
              <Text style={styles.paymentAmount}>₹{job?.budget}</Text>
            </View>
            
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Additional Charges</Text>
              <Text style={styles.additionalCharges}>As per requirements</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.paymentRow}>
              <Text style={styles.totalLabel}>Total Earning</Text>
              <Text style={styles.totalAmount}>₹{job?.budget}</Text>
            </View>

            <View style={styles.paymentMethod}>
              <Ionicons name="card" size={16} color="#6B7280" />
              <Text style={styles.paymentMethodText}>Cash on completion</Text>
            </View>
          </View>
        </View>

        {/* Requirements Card */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="toolbox" size={24} color="#E84545" />
            <Text style={styles.sectionTitle}>Requirements</Text>
          </View>

          <View style={styles.requirementsList}>
            {(job?.requirements || ['Standard professional tools', 'Punctuality', 'Safety masks']).map((item, index) => (
              <View key={index} style={styles.requirementItem}>
                <LinearGradient
                  colors={['#E84545', '#1A1A1A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.bulletPoint}
                >
                  <Text style={styles.bulletText}>{index + 1}</Text>
                </LinearGradient>
                <Text style={styles.requirementText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Special Instructions Card */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={24} color="#E84545" />
            <Text style={styles.sectionTitle}>Special Instructions</Text>
          </View>

          <View style={styles.instructions}>
            <Text style={styles.instructionsText}>
              {job?.description || 'Follow standard professional guidelines for this service.'}
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {!jobAccepted ? (
          <TouchableOpacity 
            style={[styles.acceptButton, isAccepting && { opacity: 0.8 }]} 
            onPress={handleAcceptJob}
            disabled={isAccepting}
          >
            <LinearGradient
              colors={['#E84545', '#1A1A1A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.acceptButtonGradient}
            >
              {isAccepting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <MaterialCommunityIcons name="check" size={24} color="#FFFFFF" />
                  <Text style={styles.acceptButtonText}>Accept This Job</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.startButton} onPress={handleStartJob}>
            <LinearGradient
              colors={['#E84545', '#1A1A1A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.startButtonGradient}
            >
              <MaterialCommunityIcons name="play" size={24} color="#FFFFFF" />
              <Text style={styles.startButtonText}>Start Job & Proceed to Payment</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
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
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  jobIdContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  jobId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  urgencyText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  mainCard: {
    marginHorizontal: 20,
    marginTop: 8,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  jobIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  jobTitleContainer: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  jobCategory: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  jobDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    marginBottom: 20,
  },
  jobStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  customerInfo: {
    gap: 12,
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  customerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E84545',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  customerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  jobsCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  timingGrid: {
    gap: 12,
  },
  timingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  timingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timingInfo: {
    flex: 1,
  },
  timingLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  timingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  paymentDetails: {
    gap: 12,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  paymentAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10B981',
  },
  additionalCharges: {
    fontSize: 13,
    color: '#6B7280',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10B981',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  paymentMethodText: {
    fontSize: 14,
    color: '#6B7280',
  },
  requirementsList: {
    gap: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bulletPoint: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bulletText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  requirementText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  instructions: {
    padding: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 20,
  },
  actionButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  acceptButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  acceptButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  startButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  acceptModalContent: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
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
    lineHeight: 20,
  },
  acceptJobDetails: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  detailRow: {
    marginBottom: 12,
  },
  detailSplitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  detailSplitItem: {
    flex: 1,
  },
  detailCardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  detailCardValue: {
    fontSize: 15,
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
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  cancelModalBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  confirmModalBtn: {
    flex: 1,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  confirmModalBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default DetailScreen;