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
  const { workerData, user } = useAuth();
  
  const workerId = workerData?.id || workerData?._id || user?.uid;

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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
           <Ionicons name="close-circle-outline" size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Incoming Request</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
         <View style={styles.statusBadge}>
            <View style={styles.pulseDot} />
            <Text style={styles.statusText}>URGENT REQUEST</Text>
         </View>

         <View style={styles.mainInfo}>
            <Text style={styles.serviceType}>{bookingData?.serviceType || 'Service Professional'}</Text>
            <View style={styles.priceRow}>
               <Text style={styles.earningsLabel}>Potential Earnings</Text>
               <Text style={styles.earningsValue}>₹{bookingData?.price || 399}</Text>
            </View>
         </View>

         <View style={styles.card}>
            <Text style={styles.sectionLabel}>CUSTOMER INFORMATION</Text>
            <View style={styles.infoRow}>
               <View style={styles.iconCircle}>
                  <Ionicons name="person" size={20} color="#E84545" />
               </View>
               <View>
                  <Text style={styles.customerName}>{bookingData?.userName || 'Customer'}</Text>
                  <Text style={styles.customerSub}>Recent Booking User</Text>
               </View>
            </View>
         </View>

         <View style={styles.card}>
            <Text style={styles.sectionLabel}>SERVICE LOCATION</Text>
            <View style={styles.locationRow}>
               <MaterialCommunityIcons name="map-marker-radius" size={28} color="#E84545" />
               <View style={{ flex: 1 }}>
                  <Text style={styles.addressTitle}>{bookingData?.userLocation?.shortAddress || 'Main Address'}</Text>
                  <Text style={styles.addressDetail}>
                    {bookingData?.userAddress || 'Detailed location provided upon acceptance.'}
                  </Text>
               </View>
            </View>
         </View>

         <View style={styles.card}>
            <Text style={styles.sectionLabel}>NOTE FROM CUSTOMER</Text>
            <Text style={styles.noteText}>
               "Please arrive as soon as possible. {bookingData?.problemDescription || 'Everything needs careful attention.'}"
            </Text>
         </View>
      </ScrollView>

      <View style={styles.footer}>
         <TouchableOpacity style={styles.rejectBtn} onPress={handleReject}>
            <Text style={styles.rejectText}>Decline</Text>
         </TouchableOpacity>
         <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept}>
            <LinearGradient
                colors={['#E84545', '#B22222']}
                style={styles.btnGradient}
            >
                <Text style={styles.acceptText}>Accept Job</Text>
                <Ionicons name="checkmark-done-circle" size={20} color="#FFF" />
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
  backButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', fontFamily: 'Poppins-Bold' },
  scrollContent: { padding: 20, paddingBottom: 120 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    backgroundColor: '#FFE4E6', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 10, marginBottom: 20, gap: 8
  },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E11D48' },
  statusText: { fontSize: 12, fontWeight: '800', color: '#E11D48', letterSpacing: 1 },
  mainInfo: { marginBottom: 24, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  serviceType: { fontSize: 34, fontWeight: '800', color: '#0F172A', marginBottom: 10, fontFamily: 'Poppins-ExtraBold' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  earningsLabel: { fontSize: 14, color: '#64748B', fontFamily: 'Poppins-Regular' },
  earningsValue: { fontSize: 28, fontWeight: '800', color: '#10B981', fontFamily: 'Poppins-Bold' },
  card: {
    backgroundColor: '#FFF', padding: 20, borderRadius: 20, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
    borderWidth: 1, borderColor: '#F1F5F9'
  },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#94A3B8', marginBottom: 16, letterSpacing: 1.5 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF1F2', justifyContent: 'center', alignItems: 'center' },
  customerName: { fontSize: 17, fontWeight: '700', color: '#1E293B', fontFamily: 'Poppins-Bold' },
  customerSub: { fontSize: 13, color: '#64748B' },
  locationRow: { flexDirection: 'row', gap: 12 },
  addressTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  addressDetail: { fontSize: 14, color: '#64748B', lineHeight: 20 },
  noteText: { fontSize: 15, color: '#475569', fontStyle: 'italic', lineHeight: 22 },
  footer: { 
    position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF',
    padding: 20, flexDirection: 'row', gap: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9',
    paddingBottom: 34
  },
  rejectBtn: { flex: 1, height: 56, borderRadius: 16, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  acceptBtn: { flex: 2, height: 56, borderRadius: 16, overflow: 'hidden' },
  btnGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  rejectText: { color: '#64748B', fontWeight: '700', fontSize: 16 },
  acceptText: { color: '#FFF', fontWeight: '700', fontSize: 16 }
});

export default IncomingBookingScreen;
