import { getFirestore, doc, updateDoc } from '@react-native-firebase/firestore';
import { requestLocationPermission } from '../utils/locationHelper';

class LocationService {
  constructor() {
    this.watchId = null;
    this.currentWorkerId = null;
    this.activeBookingId = null;
    this.lastPosition = {
      latitude: 16.7050,
      longitude: 74.2433,
      address: 'Kolhapur City Center, Maharashtra',
      heading: 0,
      speed: 0,
    };
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
}

export default new LocationService();
