import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';
import { cancelBooking } from '../../services/bookingService';

export default function BookingWaitingScreen({ route, navigation }) {
  const { bookingId, worker } = route.params;
  const [pulseAnim] = useState(new Animated.Value(1));
  const [timer, setTimer] = useState(120); // 2 minutes timeout
  const timerRef = useRef(null);

  useEffect(() => {
    // 1. Pulsing animation for the "Searching" effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ])
    ).start();

    // 2. Real-time listener for booking status
    const unsubscribe = firestore()
      .collection('bookings')
      .doc(bookingId)
      .onSnapshot((doc) => {
        if (doc.exists) {
          const status = doc.data().status;
          console.log('--- Booking Status Update ---:', status);

          if (status === 'accepted') {
            navigation.replace('Tracking', { bookingId, worker });
          } else if (status === 'rejected') {
            Alert.alert("Booking Rejected", "The worker is currently busy. Please try another professional.");
            navigation.goBack();
          }
        }
      });

    // 3. Timeout Timer
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(timerRef.current);
    };
  }, [bookingId]);

  const handleTimeout = async () => {
    console.log('--- Booking Timeout Reached ---');
    await cancelBooking(bookingId, worker.uid);
    Alert.alert("Timeout", "No response from worker. Releasing booking.");
    navigation.goBack();
  };

  const handleCancelManually = async () => {
    Alert.alert("Cancel Booking?", "Are you sure you want to cancel this request?", [
      { text: "No", style: "cancel" },
      { 
        text: "Yes, Cancel", 
        onPress: async () => {
          await cancelBooking(bookingId, worker.uid);
          navigation.goBack();
        } 
      }
    ]);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Sending Request...</Text>
        <Text style={styles.subtitle}>Waiting for {worker.name} to accept</Text>

        <View style={styles.animationContainer}>
          <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }] }]} />
          <View style={styles.avatarContainer}>
            <Image source={{ uri: worker.profilePhoto }} style={styles.workerAvatar} />
          </View>
        </View>

        <View style={styles.infoBox}>
          <MaterialCommunityIcons name="tools" size={24} color="#4F46E5" />
          <Text style={styles.infoText}>{worker.serviceType} Service</Text>
        </View>

        <Text style={styles.timerText}>Request expires in: {formatTime(timer)}</Text>

        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={handleCancelManually}
        >
          <Text style={styles.cancelText}>Cancel Request</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.footer}>
        <View style={styles.securityRow}>
          <Ionicons name="shield-checkmark" size={16} color="#10B981" />
          <Text style={styles.securityText}>Your payment is secure</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 50,
  },
  animationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
  },
  pulseCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    position: 'absolute',
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#4F46E5',
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  workerAvatar: {
    width: '100%',
    height: '100%',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 30,
    gap: 10,
  },
  infoText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  timerText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 40,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6B7280',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  securityText: {
    fontSize: 13,
    color: '#6B7280',
  },
});
