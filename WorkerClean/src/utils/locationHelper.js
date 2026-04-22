import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import config from '../constants/config';

// Request location permission
export const requestLocationPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'WorkEase Worker app needs access to your location to share with users.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
  return true;
};

// Get current GPS coordinates
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    // Try with high accuracy first
    Geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.log('[Location] High accuracy failed, trying low accuracy...', error);
        // Fallback to low accuracy
        Geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            });
          },
          (err) => {
            console.error('[Location] All attempts failed:', err);
            reject(err);
          },
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 10000 }
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
    );
  });
};

// Reverse geocode using Google Maps API
export const reverseGeocode = async (latitude, longitude) => {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${config.GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      const addr = result.address_components;
      
      let city = '';
      let suburb = '';
      let pincode = '';

      addr.forEach(component => {
        if (component.types.includes('locality')) city = component.long_name;
        if (component.types.includes('postal_code')) pincode = component.long_name;
        if (component.types.includes('sublocality') || component.types.includes('neighborhood')) suburb = component.long_name;
      });

      return {
        address: result.formatted_address,
        city: city,
        suburb: suburb,
        pincode: pincode,
      };
    }
    
    console.error('[Geocode] API Error:', data.status, data.error_message);
    return null;
  } catch (error) {
    console.error('Reverse Geocode error:', error);
    return null;
  }
};
