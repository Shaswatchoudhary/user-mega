import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import CustomModal from '../../components/CustomModal';

const WaitingForWorkerScreen = ({ route, navigation }) => {
  const { bookingId, workerId } = route.params;
  const [bookingStatus, setBookingStatus] = useState('pending');
  
  // Custom Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    type: 'success',
    title: '',
    message: '',
    primaryLabel: 'Got it',
    onPrimary: () => setModalVisible(false),
  });

  const showModal = (config) => {
    setModalConfig(config);
    setModalVisible(true);
  };

  useEffect(() => {
    // Listener for real-time status updates on the booking document
    const unsubscribe = firestore()
      .collection('bookings')
      .doc(bookingId)
      .onSnapshot(
        (docSnap) => {
          if (docSnap.exists) {
            const data = docSnap.data();
            setBookingStatus(data.status);

            if (data.status === 'accepted') {
              // Worker accepted!
              showModal({
                type: 'success',
                title: 'Booking Confirmed',
                message: 'Your professional has accepted the request and is on the way to your location.',
                primaryLabel: 'Track Order',
                onPrimary: () => {
                  setModalVisible(false);
                  navigation.replace('Tracking', { bookingId, workerId });
                }
              });
            } else if (data.status === 'rejected') {
              // Worker rejected
              showModal({
                type: 'error',
                title: 'Request Declined',
                message: 'The professional is unavailable. Please try another professional.',
                primaryLabel: 'Go Back',
                onPrimary: () => {
                  setModalVisible(false);
                  navigation.goBack();
                }
              });
            }
          }
        },
        (error) => {
          console.error('Firestore Monitor Error:', error);
        }
      );

    // Auto-timeout after 15 minutes if no response
    const timer = setTimeout(async () => {
      if (bookingStatus === 'pending') {
        try {
          // Set booking status to 'cancelled' in Firestore
          await firestore().collection('bookings').doc(bookingId).update({
            status: 'cancelled',
            cancelReason: 'No response from worker after 15 minutes.',
            updatedAt: firestore.FieldValue.serverTimestamp(),
          });

          // Set worker isAvailable back to true in Firestore
          await firestore().collection('workers').doc(workerId).update({
            isAvailable: true,
            updatedAt: firestore.FieldValue.serverTimestamp(),
          });

          // Show alert and navigate back to home
          showModal({
            type: 'warning',
            title: 'No Response',
            message: 'The professional did not respond in time. Please try booking again.',
            primaryLabel: 'Try Again',
            onPrimary: () => {
              setModalVisible(false);
              navigation.navigate('MainTabs');
            }
          });
        } catch (err) {
          console.error('Auto-cancel error:', err);
          navigation.navigate('MainTabs');
        }
      }
    }, 900000); // 15 minutes

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, [bookingId, workerId]);

  const handleCancel = async (reason = 'Request cancelled by user.') => {
    try {
      await firestore().collection('bookings').doc(bookingId).update({
        status: 'cancelled',
        cancelReason: reason,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

      // Make worker available again
      await firestore().collection('workers').doc(workerId).update({
        isAvailable: true,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

      navigation.goBack();
    } catch (err) {
      console.error('Cancellation error:', err);
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.pulseContainer}>
            <ActivityIndicator size={120} color="#E84545" style={styles.loader} />
            <View style={styles.centerIcon}>
              <MaterialCommunityIcons name="clock-fast" size={50} color="#E84545" />
            </View>
          </View>
        </View>

        <Text style={styles.title}>Connecting to Professional...</Text>
        <Text style={styles.subtitle}>
          The professional is reviewing your booking request. This usually takes less than a minute.
        </Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark" size={20} color="#10B981" />
            <Text style={styles.infoText}>Secured Payment Process</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="star" size={20} color="#F59E0B" />
            <Text style={styles.infoText}>Top-rated local experts</Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.cancelButton}
          onPress={() => handleCancel()}
        >
          <Text style={styles.cancelText}>Cancel Request</Text>
        </TouchableOpacity>
      </View>

      <CustomModal
        visible={modalVisible}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        primaryLabel={modalConfig.primaryLabel}
        onPrimary={modalConfig.onPrimary}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  iconContainer: {
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loader: {
    transform: [{ scale: 1.5 }],
  },
  centerIcon: {
    position: 'absolute',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    fontFamily: 'Poppins-Bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Poppins-Regular',
    marginBottom: 40,
  },
  infoCard: {
    backgroundColor: '#F9FAFB',
    width: '100%',
    padding: 20,
    borderRadius: 20,
    gap: 16,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    fontFamily: 'Poppins-Medium',
  },
  cancelButton: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    backgroundColor: '#FFF1F2',
    borderRadius: 16,
  },
  cancelText: {
    color: '#E11D48',
    fontWeight: '700',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
});

export default WaitingForWorkerScreen;