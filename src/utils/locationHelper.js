import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { GOOGLE_MAPS_API_KEY } from '../constants/config';

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

// Get current location using real Geolocation
export const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    // Try with high accuracy first
    Geolocation.getCurrentPosition(
      (position) => resolve(position.coords),
      (error) => {
        console.log('[Location] High accuracy failed, trying low accuracy...', error);
        // Fallback to low accuracy
        Geolocation.getCurrentPosition(
          (pos) => resolve(pos.coords),
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

// Centralized Reverse Geocoding using Google Maps API
export const reverseGeocode = async (latitude, longitude) => {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      const addressComponents = result.address_components;
      
      let city = '';
      let pincode = '';
      let area = '';

      addressComponents.forEach(component => {
        if (component.types.includes('locality')) city = component.long_name;
        if (component.types.includes('postal_code')) pincode = component.long_name;
        if (component.types.includes('sublocality') || component.types.includes('neighborhood')) area = component.long_name;
      });

      return {
        addressText: result.formatted_address,
        name: area || city || 'Detected Location',
        subtitle: `${city}${pincode ? ', ' + pincode : ''}`,
        city: city,
        pincode: pincode,
        latitude,
        longitude
      };
    }
    
    console.error('[Geocode] API Error:', data.status, data.error_message);
    return null;
  } catch (error) {
    console.error('Reverse Geocode Error:', error);
    return null;
  }
};
