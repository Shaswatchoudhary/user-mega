import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import Geolocation from 'react-native-geolocation-service';
import { useLocation } from '../../context/LocationContext';


// Simple Fetch-based Geocoding bridge (React Native CLI version)
const reverseGeocode = async (latitude, longitude) => {
  try {
    // Note: You should eventually add your Google Maps API Key here
    // For now, we will use an open-source fallback or simple coordinates
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
    const data = await response.json();

    if (data && data.address) {
      return [{
        name: data.display_name.split(',')[0],
        street: data.address.road || '',
        district: data.address.suburb || data.address.neighbourhood || '',
        city: data.address.city || data.address.town || data.address.village || '',
        region: data.address.state || '',
        subregion: data.address.county || ''
      }];
    }
    return [];
  } catch (error) {
    console.log('Geocoding Error:', error);
    return [];
  }
};

export default function LocationSelectionScreen({ navigation }) {
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const { saveLocation } = useLocation();

  const requestPermission = async () => {
    if (Platform.OS === 'ios') {
      const auth = await Geolocation.requestAuthorization('whenInUse');
      return auth === 'granted';
    }

    if (Platform.OS === 'android') {
      const { PermissionsAndroid } = require('react-native');
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return false;
  };

  const handleUseCurrentLocation = async () => {
    setIsLoading(true);
    try {
      // 1. Permission check
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Denied',
          'We need location access to show you services nearby. Please enable it in settings.'
        );
        setIsLoading(false);
        return;
      }

      // 2. Fetch current position
      Geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          // 3. Reverse Geocode for readable address
          const addressResults = await reverseGeocode(latitude, longitude);

          if (addressResults && addressResults.length > 0) {
            const addr = addressResults[0];
            const mainName = addr.name || addr.street || addr.subregion || 'Current Location';
            const locality = addr.district || addr.city || '';
            const city = addr.city || addr.subregion || '';
            const state = addr.region || '';

            const addressText = [mainName, locality, city].filter(Boolean).join(', ');
            const subtitle = [city, state].filter(Boolean).join(', ');

            const standardizedLocation = {
              name: mainName,
              addressText: addressText,
              subtitle: subtitle,
              latitude,
              longitude
            };

            saveAndNavigate(standardizedLocation);
          } else {
            console.log('No geocode results');
            const standardizedLocation = {
              name: 'Current Location',
              addressText: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
              subtitle: 'Precision Location',
              latitude,
              longitude
            };
            saveAndNavigate(standardizedLocation);
          }
          setIsLoading(false);
        },
        (error) => {
          console.log('Location Error:', error);
          Alert.alert('Location Error', 'Unable to fetch current location.');
          setIsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } catch (error) {
      console.log('Execution Error:', error);
      setIsLoading(false);
    }
  };

  const saveAndNavigate = async (locationData) => {
    try {
      await saveLocation(locationData);
      await saveLocation(locationData);
      navigation.goBack();
    } catch (e) {
      console.log('Storage Error:', e);
    }
  };

  const handleSelectLocation = (loc) => {
    const locationData = {
      name: loc.name.split(',')[0],
      addressText: loc.name,
      subtitle: 'Kolhapur, India',
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude
    };
    saveAndNavigate(locationData);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Location</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#E84545" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder="Search for area, street name..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
          autoFocus={false}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {/* Auto Detect Option */}
        <TouchableOpacity
          style={styles.autoDetectRow}
          onPress={handleUseCurrentLocation}
          disabled={isLoading}
        >
          <View style={styles.iconCircle}>
            {isLoading ? (
              <ActivityIndicator color="#E84545" size="small" />
            ) : (
              <MaterialCommunityIcons name="crosshairs-gps" size={22} color="#E84545" />
            )}
          </View>
          <View style={styles.autoDetectTextContainer}>
            <Text style={styles.autoDetectTitle}>Use Current Location</Text>
            <Text style={styles.autoDetectSubtitle}>Using GPS</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Search Results */}
        {searchResults.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SEARCH RESULTS</Text>
            {searchResults.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.locationItem}
                onPress={() => handleSelectLocation(item)}
              >
                <View style={styles.locationIconContainer}>
                  <Ionicons name="location-outline" size={20} color="#666" />
                </View>
                <View style={styles.locationTextContainer}>
                  <Text style={styles.locationName}>{item.name.split(',')[0]}</Text>
                  <Text style={styles.locationAddress}>{item.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          /* Recent / Saved Locations */
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SAVED ADDRESSES</Text>
            {MOCK_LOCATIONS.map((loc) => (
              <TouchableOpacity
                key={loc.id}
                style={styles.locationItem}
                onPress={() => handleSelectLocation(loc)}
              >
                <View style={styles.locationIconContainer}>
                  <Ionicons
                    name={loc.type === 'home' ? 'home-outline' : loc.type === 'work' ? 'briefcase-outline' : 'location-outline'}
                    size={20}
                    color="#666"
                  />
                </View>
                <View style={styles.locationTextContainer}>
                  <Text style={styles.locationName}>{loc.name}</Text>
                  <Text style={styles.locationAddress}>{loc.address}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Placeholder for "Popular Cities" or other UI elements could go here */}
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
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'Poppins-SemiBold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontFamily: 'Poppins-Regular',
  },
  content: {
    flex: 1,
  },
  autoDetectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF0F0', // Light red bg
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  autoDetectTextContainer: {
    flex: 1,
  },
  autoDetectTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E84545',
    fontFamily: 'Poppins-SemiBold',
  },
  autoDetectSubtitle: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'Poppins-Regular',
  },
  divider: {
    height: 8,
    backgroundColor: '#F9F9F9',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#999',
    marginBottom: 16,
    letterSpacing: 1,
    fontFamily: 'Poppins-SemiBold',
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  locationTextContainer: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 16,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
    fontFamily: 'Poppins-SemiBold',
  },
  locationAddress: {
    fontSize: 13,
    color: '#888',
    fontFamily: 'Poppins-Regular',
  },
});
