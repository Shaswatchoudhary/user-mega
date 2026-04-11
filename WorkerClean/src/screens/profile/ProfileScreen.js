import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet,
  StatusBar,

} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

const ProfileScreen = () => {
  const userPhone = '+91 9579499891';

  const topMenuItems = [
    { id: 1, icon: 'description', label: 'My Jobs' },
    { id: 2, icon: 'headset-mic', label: 'Help & support' },
  ];

  const mainMenuItems = [
    { id: 3, icon: 'location-on', label: 'Manage addresses' },
    { id: 4, icon: 'credit-card', label: 'Manage payment methods' },
    { id: 5, icon: 'privacy-tip', label: 'Privacy' },
    { id: 6, icon: 'info-outline', label: 'About WorkEase' },
  ];

  const handleMenuPress = (label) => {
    console.log(`${label} pressed`);
    // Add navigation logic 
  };

  const handleLogout = () => {
    console.log('Logout pressed');
    // Add logout logic 
  };

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
            <Text style={styles.verifiedTitle}>Verified Worker</Text>
            <Text style={styles.phoneNumber}>{userPhone}</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Icon name="edit" size={20} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Top Menu Cards Horizontal */}
        {/* using map function to render top menu items  from topMenuItems array*/}
        <View style={styles.topMenuContainer}>
          {topMenuItems.map((item) => ( 
            
            <TouchableOpacity
              key={item.id}
              style={styles.topMenuItem}
              onPress={() => handleMenuPress(item.label)}
              activeOpacity={0.7}
            >
              <Icon name={item.icon} size={32} color="#000" />
              <Text style={styles.topMenuLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Main Menu List */}
        <View style={styles.mainMenuContainer}>
          {mainMenuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.mainMenuItem}
              onPress={() => handleMenuPress(item.label)}
              activeOpacity={0.7}
            >
              <View style={styles.mainMenuLeft}>
                <Icon name={item.icon} size={24} color="#000" />
                <Text style={styles.mainMenuLabel}>{item.label}</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#999" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.versionText}>v2.1.0</Text>
      </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
    paddingHorizontal: 20,
    paddingVertical: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  profileInfo: {
    flex: 1,
  },
  verifiedTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  phoneNumber: {
    fontSize: 16,
    color: '#666',
    fontWeight: '400',
  },
  editButton: {
    padding: 8,
  },
  topMenuContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    gap: 12,
  },
  topMenuItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  topMenuLabel: {
    fontSize: 14,
    color: '#000',
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  mainMenuContainer: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    paddingVertical: 8,
  },
  mainMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },
  mainMenuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mainMenuLabel: {
    fontSize: 16,
    color: '#000',
    marginLeft: 16,
    fontWeight: '400',
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#999',
    marginTop: 24,
    fontWeight: '400',
  },
});

export default ProfileScreen;