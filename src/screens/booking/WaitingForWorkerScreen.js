import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { getFirestore, doc, onSnapshot, updateDoc, serverTimestamp } from '@react-native-firebase/firestore';

const WaitingForWorkerScreen = ({ route, navigation }) => {
  const { bookingId, workerId } = route.params;
  const [booking, setBooking] = useState(null);
  const [timeoutId, setTimeoutId] = useState(null);
  const db = getFirestore();

  useEffect(() => {
    // Real-time listener on booking document (Modular)
    const bookingRef = doc(db, 'bookings', bookingId);
    const unsubscribe = onSnapshot(bookingRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setBooking(data);

        if (data.status === 'accepted') {
          // Worker accepted! Go to tracking
          if (timeoutId) clearTimeout(timeoutId);
          navigation.replace('Tracking', { 
            bookingId,
            workerId 
          });
        } else if (data.status === 'rejected') {
          // Worker rejected
          if (timeoutId) clearTimeout(timeoutId);
          Alert.alert(
            'Booking Rejected',
            'The worker is unavailable. Please try another worker.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        }
      }
    });

    // Auto-cancel after 10 minutes if no response
    const timeout = setTimeout(async () => {
      try {
        await updateDoc(bookingRef, {
          status: 'cancelled',
          cancelReason: 'No response from worker',
          updatedAt: serverTimestamp()
        });
        
        const workerRef = doc(db, 'workers', workerId);
        await updateDoc(workerRef, {
          isAvailable: true,
          currentBookingId: null,
          updatedAt: serverTimestamp()
        });
        
        Alert.alert('Timeout', 'Worker did not respond. Please try another professional.');
        navigation.goBack();
      } catch (err) {
        console.error('Timeout handler failed:', err.message);
      }
    }, 600000); // 10 minutes

    setTimeoutId(timeout);

    return () => {
      unsubscribe();
      if (timeout) clearTimeout(timeout);
    };
  }, [bookingId, workerId]);

  const handleCancel = async () => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        status: 'cancelled',
        updatedAt: serverTimestamp()
      });
      
      const workerRef = doc(db, 'workers', workerId);
      await updateDoc(workerRef, {
        isAvailable: true,
        currentBookingId: null,
        updatedAt: serverTimestamp()
      });
      
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Could not cancel request. ' + err.message);
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text style={styles.title}>Connecting to Professional...</Text>
      <Text style={styles.subtitle}>
        The worker is reviewing your request. Please stay on this screen.
      </Text>
      <Text style={styles.timer}>Request expires in 10 minutes</Text>
      
      <TouchableOpacity 
        style={styles.cancelButton}
        onPress={handleCancel}>
        <Text style={styles.cancelText}>Cancel Request</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 24,
    color: '#1F2937',
    fontFamily: 'Poppins-Bold'
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Poppins-Regular'
  },
  timer: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 24,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 48,
    paddingVertical: 14,
    paddingHorizontal: 32,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
  },
  cancelText: {
    color: '#EF4444',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default WaitingForWorkerScreen;
