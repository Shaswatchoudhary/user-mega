import { PermissionsAndroid, Platform } from 'react-native';

// Request location permission
export const requestLocationPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'Workies needs access to your location to help you find local workers.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
          ...PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Location permission granted');
        return true;
      } else {
        console.log('Location permission denied');
        return false;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
  return true; 
};

// Get current location
export const getUserLocation = () => {
  return new Promise((resolve) => {
    // FALLBACK FOR EMULATOR: 
    // Native Geolocation package is not linked and causes crashes on emulator.
    // We default to Kolhapur city coordinates to ensure the app stays stable.
    console.log('Using Default Emulator Location (Kolhapur)');
    resolve({
      latitude: 16.7050,
      longitude: 74.2433,
      accuracy: 0,
      isDefault: true
    });
  });
};

// Centralized Reverse Geocoding using free Nominatim API
export const reverseGeocode = async (latitude, longitude) => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'WorkiesApp_LocationService', // Required by Nominatim policy
      },
    });

    const data = await response.json();
    
    if (data && data.address) {
      const address = data.address;
      const city = address.city || address.town || address.village || address.suburb || '';
      const pincode = address.postcode || '';
      const area = address.suburb || address.neighbourhood || address.road || '';
      
      return {
        addressText: data.display_name,
        name: area || city || 'Detected Location',
        subtitle: `${city}${pincode ? ', ' + pincode : ''}`,
        city: city,
        pincode: pincode,
        latitude,
        longitude
      };
    }
    
    return {
      addressText: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      name: "Detected Location",
      subtitle: "Coordinates only",
      city: "",
      pincode: "",
      latitude,
      longitude
    };
  } catch (error) {
    console.error('Reverse Geocode Error:', error);
    return null;
  }
};
