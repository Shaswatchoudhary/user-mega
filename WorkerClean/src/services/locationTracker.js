import Geolocation from '@react-native-community/geolocation';
import firestore from '@react-native-firebase/firestore';

export class LocationTracker {
  constructor(workerId, bookingId) {
    this.workerId = workerId;
    this.bookingId = bookingId;
    this.watchId = null;
    this.intervalId = null;
    this.lastLocation = null;
  }

  start(onLocationUpdate) {
    // Watch GPS continuously
    this.watchId = Geolocation.watchPosition(
      (position) => {
        this.lastLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          heading: position.coords.heading || 0,
          speed: position.coords.speed || 0,
          timestamp: Date.now(),
        };
        // Update local map immediately
        if (onLocationUpdate) {
          onLocationUpdate(this.lastLocation);
        }
      },
      (error) => console.error('GPS error:', error),
      {
        enableHighAccuracy: true,
        distanceFilter: 10,
        interval: 5000,
        fastestInterval: 3000,
      }
    );

    // Save to Firestore every 30 seconds
    this.intervalId = setInterval(async () => {
      if (this.lastLocation) {
        try {
          await firestore()
            .collection('workers')
            .doc(this.workerId)
            .update({
              currentLocation: {
                latitude: this.lastLocation.latitude,
                longitude: this.lastLocation.longitude,
                heading: this.lastLocation.heading,
                speed: this.lastLocation.speed,
              },
              locationUpdatedAt: firestore.FieldValue.serverTimestamp(),
            });

          // Also save to booking for history
          await firestore()
            .collection('bookings')
            .doc(this.bookingId)
            .update({
              workerCurrentLocation: {
                latitude: this.lastLocation.latitude,
                longitude: this.lastLocation.longitude,
              },
              locationUpdatedAt: firestore.FieldValue.serverTimestamp(),
            });
        } catch (e) {
          console.error('Firestore location update error:', e);
        }
      }
    }, 30000); // Every 30 seconds
  }

  stop() {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}