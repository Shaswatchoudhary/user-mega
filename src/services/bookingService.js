import firestore from '@react-native-firebase/firestore';
import axios from 'axios';
import { API_BASE_URL } from '../constants/config';

/**
 * Handles the dual-backend booking creation flow (Modular API).
 * 1. Creates a Firestore record for real-time tracking.
 * 2. Creates a MongoDB record for persistent history via REST.
 * 3. Updates the worker's availability status.
 */
export const createBookingRequest = async (bookingData) => {
  const { userId, workerId, serviceType, userLocation, price } = bookingData;
  const bookingId = `booking_${Date.now()}`;
  try {
    // 1. Prepare the Firestore Booking Document
    const firestoreBooking = {
      bookingId,
      userId,
      workerId,
      serviceType,
      status: "pending",
      userLocation: {
        latitude: userLocation.latitude || userLocation.lat,
        longitude: userLocation.longitude || userLocation.lng,
        address: userLocation.address || ""
      },
      workerLocation: null, // To be filled by worker on accept
      price,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    };

    // 2. Prepare the MongoDB/REST Payload
    const mongoBooking = {
      orderId: bookingId,
      userId,
      workerId,
      category: serviceType,
      amount: price,
      status: "pending",
      location: userLocation.address || ""
    };

    // a. Create in Firestore
    await firestore().collection('bookings').doc(bookingId).set(firestoreBooking);

    // b. Create in MongoDB via REST API
    try {
      await axios.post(`${API_BASE_URL}/bookings`, mongoBooking);
    } catch (mongoError) {
      console.warn('MongoDB backup failed, but Firestore is live:', mongoError.message);
    }

    // c. Update Worker Status
    await firestore().collection('workers').doc(workerId).update({
      isAvailable: false,
      currentBookingId: bookingId,
      updatedAt: firestore.FieldValue.serverTimestamp()
    });

    return { success: true, bookingId };

  } catch (error) {
    console.error('Booking Creation Flow Error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Listens to a booking status in real-time (Modular API).
 */
export const subscribeToBookingStatus = (bookingId, onStatusChange) => {
  const bookingRef = firestore().collection('bookings').doc(bookingId);
  
  return bookingRef.onSnapshot((docSnap) => {
    if (docSnap.exists) {
      onStatusChange(docSnap.data());
    }
  });
};

/**
 * Cancels a booking (on timeout or user request) (Modular API).
 */
export const cancelBooking = async (bookingId, workerId) => {
  try {
    // Update booking status
    const bookingRef = firestore().collection('bookings').doc(bookingId);
    await bookingRef.update({
      status: "rejected",
      updatedAt: firestore.FieldValue.serverTimestamp()
    });

    // Make worker available again
    const workerRef = firestore().collection('workers').doc(workerId);
    await workerRef.update({
      isAvailable: true,
      currentBookingId: null,
      updatedAt: firestore.FieldValue.serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Cancel Booking Error:', error);
    return { success: false, error: error.message };
  }
};
