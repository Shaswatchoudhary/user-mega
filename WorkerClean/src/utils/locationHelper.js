import { PermissionsAndroid, Platform } from 'react-native';

// Note: Geolocation is assumed to be available globally in this environment, 
// as seen in other screens like WorkForm.js

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
    Geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  });
};

// Reverse geocode using OpenStreetMap Nominatim API
export const reverseGeocode = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'WorkEase-App-Worker',
        },
      }
    );
    const data = await response.json();
    
    if (data && data.address) {
      const addr = data.address;
      return {
        address: data.display_name,
        city: addr.city || addr.town || addr.village,
        suburb: addr.suburb || addr.neighbourhood,
        pincode: addr.postcode,
      };
    }
    return null;
  } catch (error) {
    console.error('Reverse Geocode error:', error);
    return null;
  }
};
