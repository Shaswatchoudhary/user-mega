import { getFirestore, doc, updateDoc } from '@react-native-firebase/firestore';
import Geolocation from '@react-native-community/geolocation';
import { requestLocationPermission } from '../utils/locationHelper';

class LocationService {
  constructor() {
    this.watchId = null;
    this.currentWorkerId = null;
    this.activeBookingId = null;
    this.lastPosition = null;
  }

  async requestPermission() {
    return await requestLocationPermission();
  }

  async startTracking(workerId, bookingId = null) {
    this.currentWorkerId = workerId;
    this.activeBookingId = bookingId;
    const db = getFirestore();

    const updateLocation = async (lat, lng) => {
      try {
        const timestamp = new Date().toISOString();
        if (this.currentWorkerId) {
          const workerRef = doc(db, 'workers', this.currentWorkerId);
          await updateDoc(workerRef, {
            currentLocation: {
              latitude: lat,
              longitude: lng,
              lastUpdated: timestamp
            },
            status: 'ONLINE'
          });
        }
        if (this.activeBookingId) {
          const bookingRef = doc(db, 'bookings', this.activeBookingId);
          await updateDoc(bookingRef, {
            workerLocation: {
              latitude: lat,
              longitude: lng,
              lastUpdated: timestamp
            }
          });
        }
      } catch (e) {
        console.error('Location update failed', e);
      }
    };

    // Watch for location changes
    this.watchId = Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateLocation(latitude, longitude);
      },
      (error) => console.error('Tracking error:', error),
      {
        enableHighAccuracy: true,
        distanceFilter: 10,
        interval: 10000,
        fastestInterval: 5000,
      }
    );
  }

  stopTracking() {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  setActiveBooking(bookingId) {
    this.activeBookingId = bookingId;
  }

  getCurrentLocation(callback) {
    Geolocation.getCurrentPosition(
      callback,
      (error) => console.error('Get Location Error:', error),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  }

  async getAddress(lat, lng) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'User-Agent': 'WorkerCleanApp/1.0' } }
      );
      const data = await response.json();
      const parts = data.address || {};
      const short = parts.suburb || parts.neighbourhood || parts.village || parts.town || parts.city || 'Current Location';
      return {
        full: data.display_name || 'Address detected',
        short: short
      };
    } catch (e) {
      console.error('Reverse Geocode failed:', e);
      return { full: 'Address detected', short: 'Current Location' };
    }
  }
}

export default new LocationService();
