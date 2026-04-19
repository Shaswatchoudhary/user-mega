import { Platform } from 'react-native';

// Request location permission - Always return true as permissions are no longer needed
export const requestLocationPermission = async () => {
  return true;
};

// Get current location - Return hardcoded Kolhapur coordinates
export const getUserLocation = async () => {
  return {
    latitude: 16.7050,
    longitude: 74.2433,
    accuracy: 5,
  };
};

// Centralized Reverse Geocoding - Return a hardcoded address
export const reverseGeocode = async (latitude, longitude) => {
  return {
    addressText: "Kolhapur City Center, Maharashtra, India",
    name: "Kolhapur",
    subtitle: "Maharashtra, India"
  };
};
