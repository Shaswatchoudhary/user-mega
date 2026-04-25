import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

const IncomingBookingScreen = ({ route, navigation }) => {
  const { bookingId, bookingData } = route.params;
  const { workerUser, workerProfile } = useAuth();
  
  const workerId = workerProfile?.id || workerProfile?._id || workerUser?.uid;

  useEffect(() => {
    // Real-time listener: Close the screen if the booking gets cancelled by the user
    const unsubscribe = firestore()
      .collection('bookings')
      .doc(bookingId)
      .onSnapshot((doc) => {
        if (doc.exists) {
            const data = doc.data();
            if (data.status === 'cancelled') {
                Alert.alert('Notice', 'The customer has cancelled this booking request.');
                navigation.goBack();
            }
        } else {
            navigation.goBack();
        }
      });
    return () => unsubscribe();
  }, [bookingId]);

  const handleAccept = async () => {
    try {
      // 1. Update the booking status
      await firestore().collection('bookings').doc(bookingId).update({
        status: 'accepted',
        acceptedAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

      // 2. Keep the worker occupied (isAvailable was set to false on creation, but we ensure it)
      if (workerId) {
          await firestore().collection('workers').doc(workerId).update({
            isAvailable: false,
            updatedAt: firestore.FieldValue.serverTimestamp(),
          });
      }

      // 3. Navigate to Active Job
      navigation.replace('ActiveJob', { bookingId, bookingData });
    } catch (error) {
      console.error('Acceptance Error:', error);
      Alert.alert('Error', 'Failed to accept the booking. Please check your network.');
    }
  };

  const handleReject = async () => {
    Alert.alert(
        'Confirm Decline',
        'Are you sure you want to decline this job? This might affect your rating.',
        [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Decline',
                style: 'destructive',
                onPress: async () => {
                    try {
                        // 1. Update booking status
                        await firestore().collection('bookings').doc(bookingId).update({
                          status: 'rejected',
                          rejectedAt: firestore.FieldValue.serverTimestamp(),
                          updatedAt: firestore.FieldValue.serverTimestamp(),
                        });
                        
                        // 2. Make the worker available again
                        if (workerId) {
                          await firestore().collection('workers').doc(workerId).update({
                            isAvailable: true,
                            updatedAt: firestore.FieldValue.serverTimestamp(),
                          });
                        }
                        
                        navigation.goBack();
                    } catch (error) {
                        console.error('Rejection Error:', error);
                        Alert.alert('Error', 'Failed to decline booking.');
                    }
                }
            }
        ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
           <Ionicons name="close" size={26} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Incoming Request</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
         {/* Urgent Badge */}
         <View style={styles.urgentBadge}>
            <View style={styles.urgentDot} />
            <Text style={styles.urgentText}>URGENT REQUEST</Text>
         </View>

         {/* Title & Price */}
         <View style={styles.mainHeader}>
            <Text style={styles.serviceTitle}>{bookingData?.serviceType || 'Professional Service'}</Text>
            <View style={styles.earningsContainer}>
               <Text style={styles.earningsLabel}>Potential Earnings</Text>
               <Text style={styles.earningsValue}>₹{bookingData?.price || 249}</Text>
            </View>
         </View>

         <View style={styles.divider} />

         {/* Customer Info Card */}
         <View style={styles.infoCard}>
            <Text style={styles.cardLabel}>CUSTOMER INFORMATION</Text>
            <View style={styles.infoRow}>
               <View style={styles.userIconBg}>
                  <Ionicons name="person" size={24} color="#E84545" />
               </View>
               <View>
                  <Text style={styles.infoName}>{bookingData?.userName || 'Customer'}</Text>
                  <Text style={styles.infoSub}>Recent Booking User</Text>
               </View>
            </View>
         </View>

         {/* Service Location Card */}
         <View style={styles.infoCard}>
            <Text style={styles.cardLabel}>SERVICE LOCATION</Text>
            <View style={styles.locationRow}>
               <View style={styles.locIconBg}>
                  <Ionicons name="location" size={24} color="#E84545" />
               </View>
               <View style={{ flex: 1 }}>
                  <Text style={styles.locName}>{bookingData?.userLocation?.shortAddress || bookingData?.userLocation?.name || 'Service Site'}</Text>
                  <Text style={styles.locAddress}>
                    {bookingData?.userAddress || 'Exact location will be shared after acceptance.'}
                  </Text>
               </View>
            </View>
         </View>

         {/* Note Card */}
         <View style={styles.infoCard}>
            <Text style={styles.cardLabel}>NOTE FROM CUSTOMER</Text>
            <Text style={styles.noteText}>
               "{bookingData?.problemDescription || 'Please arrive as soon as possible. Everything needs careful attention.'}"
            </Text>
         </View>
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
         <TouchableOpacity style={styles.declineBtn} onPress={handleReject}>
            <Text style={styles.declineText}>Decline</Text>
         </TouchableOpacity>
         <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept}>
            <LinearGradient
                colors={['#EF4444', '#DC2626']}
                style={styles.acceptGradient}
            >
                <Text style={styles.acceptText}>Accept Job</Text>
                <Ionicons name="checkmark-circle" size={22} color="#FFF" />
            </LinearGradient>
         </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9'
  },
  closeButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1E293B', fontFamily: 'Poppins-Bold' },
  scrollContent: { padding: 20, paddingBottom: 120 },
  urgentBadge: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    backgroundColor: '#FFF1F2', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8, marginBottom: 20, gap: 8
  },
  urgentDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#E11D48' },
  urgentText: { fontSize: 10, fontWeight: '800', color: '#E11D48', letterSpacing: 1.5, fontFamily: 'Poppins-Bold' },
  mainHeader: { marginBottom: 24 },
  serviceTitle: { fontSize: 36, fontWeight: '800', color: '#0F172A', marginBottom: 12, fontFamily: 'Poppins-ExtraBold' },
  earningsContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  earningsLabel: { fontSize: 15, color: '#64748B', fontFamily: 'Poppins-Medium' },
  earningsValue: { fontSize: 32, fontWeight: '800', color: '#10B981', fontFamily: 'Poppins-Bold' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 24 },
  infoCard: {
    backgroundColor: '#FFF', padding: 20, borderRadius: 24, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 3,
    borderWidth: 1, borderColor: '#F1F5F9'
  },
  cardLabel: { fontSize: 10, fontWeight: '700', color: '#94A3B8', marginBottom: 16, letterSpacing: 1.5, fontFamily: 'Poppins-Bold' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  userIconBg: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFF1F2', justifyContent: 'center', alignItems: 'center' },
  infoName: { fontSize: 18, fontWeight: '700', color: '#1E293B', fontFamily: 'Poppins-Bold' },
  infoSub: { fontSize: 14, color: '#64748B', fontFamily: 'Poppins-Regular' },
  locationRow: { flexDirection: 'row', gap: 16 },
  locIconBg: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFF1F2', justifyContent: 'center', alignItems: 'center' },
  locName: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 6, fontFamily: 'Poppins-Bold' },
  locAddress: { fontSize: 14, color: '#64748B', lineHeight: 22, fontFamily: 'Poppins-Regular' },
  noteText: { fontSize: 15, color: '#475569', fontStyle: 'italic', lineHeight: 24, fontFamily: 'Poppins-Regular' },
  footer: { 
    position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF',
    padding: 20, flexDirection: 'row', gap: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9',
    paddingBottom: 34
  },
  declineBtn: { flex: 1, height: 58, borderRadius: 18, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  acceptBtn: { flex: 2, height: 58, borderRadius: 18, overflow: 'hidden' },
  acceptGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  declineText: { color: '#64748B', fontWeight: '700', fontSize: 16, fontFamily: 'Poppins-Bold' },
  acceptText: { color: '#FFF', fontWeight: '700', fontSize: 16, fontFamily: 'Poppins-Bold' }
});

export default IncomingBookingScreen;
