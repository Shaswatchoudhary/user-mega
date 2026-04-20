import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useLocation } from '../../context/LocationContext';
import { getCurrentLocation, reverseGeocode } from '../../utils/locationHelper';

export default function LocationScreen({ navigation }) {
  const { saveLocation, selectedLocation } = useLocation();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [detectedAddress, setDetectedAddress] = useState(null);

  const handleDetectLocation = async () => {
    setLoading(true);
    try {
      const coords = await getCurrentLocation();
      const addressData = await reverseGeocode(coords.latitude, coords.longitude);
      if (addressData) {
        setDetectedAddress({
          ...addressData,
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
        setSearchQuery(addressData.address);
      }
    } catch (error) {
      console.error('Detection error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmLocation = () => {
    if (detectedAddress) {
      saveLocation({
        name: detectedAddress.city || detectedAddress.suburb || 'My Location',
        address: detectedAddress.address,
        latitude: detectedAddress.latitude,
        longitude: detectedAddress.longitude,
        shortAddress: detectedAddress.city || detectedAddress.suburb,
      });
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Your Location</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Search for area, street name..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Current Location Button */}
        <TouchableOpacity 
          style={styles.detectButton} 
          onPress={handleDetectLocation}
          disabled={loading}
        >
          <View style={styles.detectIcon}>
            {loading ? (
              <ActivityIndicator color="#E84545" size="small" />
            ) : (
              <MaterialCommunityIcons name="target" size={22} color="#E84545" />
            )}
          </View>
          <View style={styles.detectTextContainer}>
            <Text style={styles.detectTitle}>Detect My Location</Text>
            <Text style={styles.detectSub}>Using GPS for better accuracy</Text>
          </View>
        </TouchableOpacity>

        {/* Selected/Detected Address Preview */}
        {detectedAddress && (
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <MaterialCommunityIcons name="map-marker-check" size={24} color="#E84545" />
              <Text style={styles.previewTitle}>Detected Address</Text>
            </View>
            <Text style={styles.previewText}>{detectedAddress.address}</Text>
            
            <TouchableOpacity 
              style={styles.confirmButton}
              onPress={handleConfirmLocation}
            >
              <Text style={styles.confirmButtonText}>Confirm & Set Base Location</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.infoBox}>
          <MaterialCommunityIcons name="information-outline" size={20} color="#666" />
          <Text style={styles.infoText}>
            Setting your base location helps you receive requests nearby.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  scrollContent: {
    padding: 20,
  },
  searchContainer: {
    marginBottom: 24,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: '#E1E8F0',
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#1A1A1A',
  },
  detectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FED7D7',
  },
  detectIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E84545',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detectTextContainer: {
    marginLeft: 16,
  },
  detectTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E84545',
  },
  detectSub: {
    fontSize: 13,
    color: '#718096',
    marginTop: 2,
  },
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  previewText: {
    fontSize: 15,
    color: '#4A5568',
    lineHeight: 22,
    marginBottom: 20,
  },
  confirmButton: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
});
