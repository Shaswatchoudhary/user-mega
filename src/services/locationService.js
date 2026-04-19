import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

const GOOGLE_MAPS_API_KEY = 'AIzaSyBNRN1d-V25fgE7f2RBKcXqAVAHQg_J8P0';

export const requestLocationPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location for better service delivery.',
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

export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      pos => resolve({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      }),
      err => reject(err),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  });
};

export const reverseGeocode = async (latitude, longitude) => {
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json` +
      `?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
    );
    const data = await res.json();
    
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      const components = result.address_components;
      
      // Extract parts like Swiggy does
      let sublocality = '';
      let locality = '';
      let city = '';
      let pincode = '';
      
      components.forEach(comp => {
        if (comp.types.includes('sublocality_level_1') || 
            comp.types.includes('sublocality')) {
          sublocality = comp.long_name;
        }
        if (comp.types.includes('locality')) {
          locality = comp.long_name;
        }
        if (comp.types.includes('administrative_area_level_2')) {
          city = comp.long_name;
        }
        if (comp.types.includes('postal_code')) {
          pincode = comp.long_name;
        }
      });

      return {
        shortAddress: sublocality || locality || city,
        fullAddress: result.formatted_address,
        sublocality,
        locality,
        city,
        pincode,
        latitude,
        longitude,
      };
    }
    return null;
  } catch (error) {
    console.error('Reverse geocode error:', error);
    return null;
  }
};

export const searchPlaces = async (query, lat, lng) => {
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json` +
      `?input=${encodeURIComponent(query)}` +
      `&location=${lat},${lng}&radius=50000` +
      `&components=country:in` +
      `&key=${GOOGLE_MAPS_API_KEY}`
    );
    const data = await res.json();
    return data.predictions || [];
  } catch (e) {
    return [];
  }
};

export const getPlaceDetails = async (placeId) => {
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json` +
      `?place_id=${placeId}` +
      `&fields=geometry,formatted_address,address_components,name` +
      `&key=${GOOGLE_MAPS_API_KEY}`
    );
    const data = await res.json();
    return data.result;
  } catch (e) {
    return null;
  }
};

export default {
    requestLocationPermission,
    getCurrentLocation,
    reverseGeocode,
    searchPlaces,
    getPlaceDetails
};
