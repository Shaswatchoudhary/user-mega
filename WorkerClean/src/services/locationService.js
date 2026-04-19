import { getFirestore, doc, updateDoc } from '@react-native-firebase/firestore';

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
    return true; // Auto-grant since we aren't using real location
  }

  async startTracking(workerId, bookingId = null) {
    this.currentWorkerId = workerId;
    this.activeBookingId = bookingId;
    const db = getFirestore();

    // Stubbing the tracking update logic to run once with hardcoded values
    try {
      if (this.currentWorkerId) {
        const workerRef = doc(db, 'workers', this.currentWorkerId);
        await updateDoc(workerRef, {
          currentLocation: this.lastPosition
        });
      }
      if (this.activeBookingId) {
        const bookingRef = doc(db, 'bookings', this.activeBookingId);
        await updateDoc(bookingRef, {
          workerLocation: this.lastPosition
        });
      }
    } catch (e) {
      console.log('Location stub update failed', e);
    }
  }

  stopTracking() {
    this.watchId = null;
  }

  setActiveBooking(bookingId) {
    this.activeBookingId = bookingId;
  }
}

export default new LocationService();
