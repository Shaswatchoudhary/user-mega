import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, FlatList, ActivityIndicator,
  SafeAreaView, Platform
} from 'react-native';
import {
  getUserLocation,
  reverseGeocode
} from '../../utils/locationHelper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

const LocationPickerScreen = ({ navigation, route }) => {
  const { onLocationSelected } = route.params;
  
  const [address, setAddress] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  useEffect(() => {
    detectCurrentLocation();
  }, []);

  const detectCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const loc = await getUserLocation();
      const addr = await reverseGeocode(loc.latitude, loc.longitude);
      setAddress({
        ...addr,
        latitude: loc.latitude,
        longitude: loc.longitude,
        shortAddress: addr.name || "Kolhapur",
        fullAddress: addr.addressText
      });
    } catch (error) {
      console.error('Location detection failed:', error);
    }
    setIsLoadingLocation(false);
  };

  const confirmLocation = () => {
    if (address) {
      navigation.navigate('AddressDetails', {
        location: address,
        onLocationSelected,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Location</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.infoCard}>
          <LinearGradient
            colors={['#4F46E5', '#312E81']}
            style={styles.cardGradient}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="location" size={40} color="#FFF" />
            </View>
            <Text style={styles.cardTitle}>Default Service Location</Text>
            <Text style={styles.cardSubtitle}>
              We are currently serving only in Kolhapur city.
            </Text>
          </LinearGradient>
        </View>

        <View style={styles.addressBox}>
          {isLoadingLocation ? (
            <ActivityIndicator size="large" color="#4F46E5" />
          ) : (
            <>
              <View style={styles.addressDisplay}>
                <View style={styles.pinIcon}>
                   <Ionicons name="pin" size={20} color="#EF4444" />
                </View>
                <View style={styles.addressTextContainer}>
                  <Text style={styles.shortAddr}>{address?.shortAddress}</Text>
                  <Text style={styles.fullAddr}>{address?.fullAddress}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={confirmLocation}
                disabled={!address}
              >
                <Text style={styles.confirmText}>Confirm & Provide Details</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFF" />
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.noticeBox}>
           <Ionicons name="information-circle" size={20} color="#64748B" />
           <Text style={styles.noticeText}>
             Manual map selection is temporarily disabled for better app stability.
           </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    backgroundColor: '#4F46E5',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#FFF', fontFamily: 'Poppins-Bold' },
  content: { flex: 1, padding: 20 },
  infoCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  cardGradient: {
    padding: 30,
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: { fontSize: 20, fontWeight: '800', color: '#FFF', marginBottom: 10, fontFamily: 'Poppins-Bold' },
  cardSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', textAlign: 'center', fontFamily: 'Poppins-Regular' },
  addressBox: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  addressDisplay: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 25,
  },
  pinIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  addressTextContainer: { flex: 1 },
  shortAddr: { fontSize: 17, fontWeight: '700', color: '#1E293B', marginBottom: 4, fontFamily: 'Poppins-Bold' },
  fullAddr: { fontSize: 14, color: '#64748B', lineHeight: 20, fontFamily: 'Poppins-Regular' },
  confirmButton: {
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 15,
    gap: 10,
  },
  confirmText: { color: '#FFF', fontSize: 16, fontWeight: '700', fontFamily: 'Poppins-Bold' },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: '#F1F5F9',
    padding: 15,
    borderRadius: 12,
    gap: 10,
  },
  noticeText: { flex: 1, fontSize: 12, color: '#64748B', fontFamily: 'Poppins-Regular' },
});

export default LocationPickerScreen;
