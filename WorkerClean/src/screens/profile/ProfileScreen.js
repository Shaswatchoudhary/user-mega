import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import CustomModal from '../../components/CustomModal';

// THEME COLORS
const THEME_COLOR = '#E84545'; // Primary Red for specific accents
const TEXT_PRIMARY = '#111827';
const TEXT_MUTED = '#6B7280';
const BG_COLOR = '#F9FAFB';

const ProfileScreen = ({ navigation }) => {
  const { workerUser, workerProfile, logout, loading } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });
  const [stats, setStats] = useState({
    completed: 0,
    monthEarnings: 0
  });

  const workerId = workerProfile?.id || workerProfile?._id || workerUser?.uid;

  useEffect(() => {
    if (!workerId) return;

    // Real-time stats listener
    const unsubscribe = firestore()
      .collection('bookings')
      .where('workerId', '==', workerId)
      .onSnapshot(snap => {
        if (!snap) return;
        const all = snap.docs.map(d => d.data());
        const completed = all.filter(b => b.status === 'completed' || b.status === 'work_completed');

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const monthEarnings = completed
          .filter(b => {
            const date = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
            return date >= startOfMonth;
          })
          .reduce((sum, b) => sum + (Number(b.price) || 0), 0);

        setStats({
          completed: completed.length,
          monthEarnings: monthEarnings
        });
      }, err => console.log('[ProfileScreen] Stats error:', err));

    return () => unsubscribe();
  }, [workerId]);

  const topMenuItems = [
    { id: 1, icon: 'description', label: 'My Jobs', screen: 'Job' },
    { id: 2, icon: 'verified-user', label: 'Professional Details', screen: 'ProfessionalDetails' },
  ];

  const mainMenuItems = [
    { id: 3, icon: 'headset-mic', label: 'Help & support', url: 'https://workease.insforge.site/contact' },
    { id: 4, icon: 'location-on', label: 'Manage addresses', screen: 'Location' },
    { id: 5, icon: 'credit-card', label: 'Manage payment methods' },
    { id: 6, icon: 'privacy-tip', label: 'Privacy', screen: 'Privacy' },
    { id: 7, icon: 'info-outline', label: 'About WorkEase', screen: 'About' },
    { id: 8, icon: 'language', label: 'Connect with WorkEase', url: 'https://workease.insforge.site' },
  ];

  const handleMenuPress = (item) => {
    if (item.screen) {
      navigation.navigate(item.screen);
    } else if (item.url) {
      Linking.openURL(item.url);
    } else {
      setModalContent({
        title: item.label,
        message: `${item.label} feature coming soon!`,
      });
      setShowInfoModal(true);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME_COLOR} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.profileInfo}>
              <Text style={styles.fullName}>{workerProfile?.fullName || workerProfile?.name || workerUser?.displayName || 'Worker'}</Text>
              <View style={styles.statusBadge}>
                <View style={[styles.statusDot, { backgroundColor: workerProfile?.status === 'ACTIVE' ? '#10B981' : '#F59E0B' }]} />
                <Text style={styles.statusText}>{workerProfile?.status || 'UNDER_REVIEW'}</Text>
              </View>
              <Text style={styles.categoryTitle}>{workerProfile?.serviceType || workerProfile?.category || 'Professional'}</Text>
              <Text style={styles.experienceText}>{workerProfile?.experience ? `${workerProfile.experience} Years` : 'Not set'}</Text>
              <Text style={styles.phoneNumber}>
                {workerProfile?.phone || auth().currentUser?.phoneNumber || 'No phone'}
              </Text>
            </View>
            <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditProfile')}>
              <Icon name="edit" size={24} color={THEME_COLOR} />
            </TouchableOpacity>
          </View>

          {/* Stats Summary */}
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{workerProfile?.rating || 0}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{stats.completed || 0}</Text>
              <Text style={styles.statLabel}>Jobs Done</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>₹{stats.monthEarnings || 0}</Text>
              <Text style={styles.statLabel}>This Month</Text>
            </View>
          </View>

          {/* Top Menu Cards */}
          <View style={styles.topMenuContainer}>
            {topMenuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.topMenuItem}
                onPress={() => handleMenuPress(item)}
                activeOpacity={0.7}
              >
                <Icon name={item.icon} size={32} color={THEME_COLOR} />
                <Text style={styles.topMenuLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Main Menu List */}
          <View style={styles.mainMenuContainer}>
            <Text style={styles.sectionHeading}>General Settings</Text>
            {mainMenuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.mainMenuItem}
                onPress={() => handleMenuPress(item)}
                activeOpacity={0.7}
              >
                <View style={styles.mainMenuLeft}>
                  <Icon name={item.icon} size={26} color="#1A1A1A" />
                  <Text style={styles.mainMenuLabel}>{item.label}</Text>
                </View>
                <Icon name="chevron-right" size={24} color="#CCC" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="logout" size={20} color="#FF3B30" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

          {/* App Version */}
          <Text style={styles.versionText}>v2.1.5 • Powered by InsForge</Text>
        </ScrollView>
      </SafeAreaView>

      <CustomModal
        visible={showLogoutModal}
        type="logout"
        title="Logout"
        message="Are you sure you want to logout?"
        primaryLabel="Logout"
        secondaryLabel="Cancel"
        onPrimary={async () => {
          setShowLogoutModal(false);
          await logout();
          navigation.replace('Otp');
        }}
        onSecondary={() => setShowLogoutModal(false)}
      />

      <CustomModal
        visible={showInfoModal}
        type="info"
        title={modalContent.title}
        message={modalContent.message}
        onPrimary={() => setShowInfoModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  fullName: {
    fontSize: 28,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: TEXT_MUTED,
    textTransform: 'uppercase',
  },
  phoneNumber: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
    marginTop: 4,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME_COLOR,
    marginTop: 8,
  },
  experienceText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
    marginTop: 2,
  },
  editButton: {
    padding: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 16,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: TEXT_MUTED,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 35,
    backgroundColor: '#F3F4F6',
    alignSelf: 'center',
  },
  topMenuContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 16,
  },
  topMenuItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F9FAFB',
  },
  topMenuLabel: {
    fontSize: 14,
    color: TEXT_PRIMARY,
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '700',
  },
  mainMenuContainer: {
    backgroundColor: '#FFFFFF',
    marginTop: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A1A1A', // BLACK as requested
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  mainMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  mainMenuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mainMenuLabel: {
    fontSize: 16,
    color: '#1A1A1A',
    marginLeft: 16,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 32,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '700',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 32,
    fontWeight: '500',
  },
});

export default ProfileScreen;
