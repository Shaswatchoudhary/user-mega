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
          message: 'WorkEase needs access to your location to help you find local workers.',
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

// Centralized Reverse Geocoding with Fallback
export const reverseGeocode = async (latitude, longitude) => {
  try {
    // 1. Try Google Maps API first
    const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;
    const response = await fetch(googleUrl);
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

    console.warn('[Geocode] Google API failed (Check Key Restrictions):', data.status, data.error_message);

    // 2. Fallback to OpenStreetMap (Nominatim) - Free and no key required
    console.log('[Geocode] Falling back to OpenStreetMap...');
    const osmUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
    const osmResponse = await fetch(osmUrl, {
      headers: { 'User-Agent': 'WorkiesApp' }
    });
    const osmData = await osmResponse.json();

    if (osmData && osmData.address) {
      const addr = osmData.address;
      const city = addr.city || addr.town || addr.village || addr.suburb || '';
      const area = addr.suburb || addr.neighbourhood || addr.road || '';

      return {
        addressText: osmData.display_name,
        name: area || city || 'Detected Location',
        subtitle: `${city}${addr.postcode ? ', ' + addr.postcode : ''}`,
        city: city,
        pincode: addr.postcode || '',
        latitude,
        longitude
      };
    }

    return null;
  } catch (error) {
    console.error('Reverse Geocode Error:', error);
    return null;
  }
};
