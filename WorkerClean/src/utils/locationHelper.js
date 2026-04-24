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

// Reverse geocode using OpenStreetMap Nominatim API (Free, No Key)
export const reverseGeocode = async (latitude, longitude) => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'WorkerCleanApp/1.0'
      }
    });
    const data = await response.json();
    
    if (data && data.display_name) {
      const address = data.address || {};
      
      return {
        address: data.display_name,
        city: address.city || address.town || address.village || '',
        suburb: address.suburb || address.neighbourhood || '',
        pincode: address.postcode || '',
      };
    }
    
    return null;
  } catch (error) {
    console.error('Reverse Geocode error:', error);
    return null;
  }
};
