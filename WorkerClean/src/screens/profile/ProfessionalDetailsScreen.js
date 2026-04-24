import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import LinearGradient from 'react-native-linear-gradient';

const ProfessionalDetailsScreen = ({ navigation }) => {
  const { workerProfile } = useAuth();
  const workerData = workerProfile; // maintain local variable name for simplicity

  const maskInfo = (info, start = 0, end = 0) => {
    if (!info) return 'Not Provided';
    const str = info.toString();
    const mask = '*'.repeat(str.length - start - end);
    return str.substring(0, start) + mask + str.substring(str.length - end);
  };

  const DetailItem = ({ label, value, icon, isSensitive = false }) => (
    <View style={styles.detailCard}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name={icon} size={22} color="#E84545" />
      </View>
      <View style={styles.detailInfo}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{isSensitive ? maskInfo(value, 2, 2) : value || 'Not Provided'}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Professional Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Verification Status Banner */}
        {workerData?.status === 'ACTIVE' ? (
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.statusBanner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <MaterialCommunityIcons name="check-decagram" size={32} color="#FFF" />
            <View style={styles.statusBannerInfo}>
              <Text style={styles.statusBannerTitle}>Verified Professional</Text>
              <Text style={styles.statusBannerSub}>You are officially accepted as a WorkEase partner!</Text>
            </View>
          </LinearGradient>
        ) : (
          <View style={styles.pendingBanner}>
            <MaterialCommunityIcons name="clock-outline" size={28} color="#92400E" />
            <View style={styles.statusBannerInfo}>
              <Text style={styles.pendingBannerTitle}>Under Review</Text>
              <Text style={styles.pendingBannerSub}>Admin is currently verifying your documents.</Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Identity Verification</Text>
          <DetailItem 
            label="Aadhaar Card Number" 
            value={workerData?.aadhaar} 
            icon="card-account-details-outline" 
            isSensitive={true}
          />
          <DetailItem 
            label="PAN Card Number" 
            value={workerData?.pan} 
            icon="file-document-outline" 
            isSensitive={true}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Banking Information</Text>
          <DetailItem 
            label="Account Holder Name" 
            value={workerData?.bankDetails?.holderName} 
            icon="account-box-outline" 
          />
          <DetailItem 
            label="Bank Name" 
            value={workerData?.bankDetails?.bankName} 
            icon="bank-outline" 
          />
          <DetailItem 
            label="Account Number" 
            value={workerData?.bankDetails?.accountNumber} 
            icon="numeric" 
            isSensitive={true}
          />
           <DetailItem 
            label="IFSC Code" 
            value={workerData?.bankDetails?.ifsc} 
            icon="alphabetical" 
          />
        </View>

        <View style={styles.securityNote}>
          <MaterialCommunityIcons name="shield-lock-outline" size={20} color="#6B7280" />
          <Text style={styles.securityNoteText}>
            For your security, sensitive details are partially masked. These details are used only for payment processing and verification.
          </Text>
        </View>
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  scrollContent: {
    padding: 24,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  statusBannerInfo: {
    marginLeft: 16,
    flex: 1,
  },
  statusBannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
  },
  statusBannerSub: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  pendingBannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#92400E',
  },
  pendingBannerSub: {
    fontSize: 13,
    color: '#D97706',
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
    marginLeft: 4,
  },
  detailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  detailInfo: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  securityNote: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginTop: 8,
    gap: 12,
  },
  securityNoteText: {
    flex: 1,
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
});

export default ProfessionalDetailsScreen;
