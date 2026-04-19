import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const IncomingBookingScreen = ({ route, navigation }) => {
  const { bookingId, bookingData } = route.params;
  const { workerData } = useAuth();
  
  const workerId = workerData?.id || workerData?._id;

  useEffect(() => {
    // If the booking gets cancelled by user, close this screen
    const unsubscribe = firestore()
      .collection('bookings')
      .doc(bookingId)
      .onSnapshot((doc) => {
        if (doc.exists && doc.data().status === 'cancelled') {
          Alert.alert('Notice', 'User has cancelled this request.');
          navigation.goBack();
        }
      });
    return () => unsubscribe();
  }, [bookingId]);

  const handleAccept = async () => {
    try {
      await firestore().collection('bookings').doc(bookingId).update({
        status: 'accepted',
        acceptedAt: firestore.FieldValue.serverTimestamp(),
      });
      // Navigate to ActiveJob
      navigation.replace('ActiveJob', { bookingId, bookingData });
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to accept booking');
    }
  };

  const handleReject = async () => {
    try {
      await firestore().collection('bookings').doc(bookingId).update({
        status: 'rejected',
        rejectedAt: firestore.FieldValue.serverTimestamp(),
      });
      
      // Make worker available again
      if (workerId) {
        await firestore().collection('workers').doc(workerId).update({
          isAvailable: true,
          currentBookingId: null,
        });
      }
      
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to reject booking');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
           <Ionicons name="close" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
         <View style={styles.statusBadge}>
            <Text style={styles.statusText}>NEW REQUEST</Text>
         </View>

         <View style={styles.mainInfo}>
            <Text style={styles.serviceType}>{bookingData?.serviceType || 'Service'}</Text>
            <View style={styles.priceRow}>
               <Text style={styles.priceLabel}>Estimated Earnings</Text>
               <Text style={styles.priceValue}>₹{bookingData?.price || bookingData?.basePrice || 399}</Text>
            </View>
         </View>

         <View style={styles.card}>
            <Text style={styles.sectionLabel}>CUSTOMER & LOCATION</Text>
            <View style={styles.infoItem}>
               <MaterialCommunityIcons name="account-circle" size={20} color="#6B7280" />
               <Text style={styles.infoText}>{bookingData?.userName || 'Customer'}</Text>
            </View>
            <View style={styles.infoItem}>
               <MaterialCommunityIcons name="map-marker-radius" size={24} color="#E84545" />
               <View style={{ flex: 1 }}>
                  {bookingData?.userLocation?.shortAddress ? (
                    <Text style={{ fontWeight: '700', color: '#111827', fontSize: 16 }}>
                      {bookingData.userLocation.shortAddress}
                    </Text>
                  ) : null}
                  <Text style={styles.infoText}>
                    {bookingData?.userLocation?.flat ? `${bookingData.userLocation.flat}, ` : ''}
                    {bookingData?.userLocation?.wing ? `Wing ${bookingData.userLocation.wing}, ` : ''}
                    {bookingData?.userLocation?.fullAddress || bookingData?.userLocation?.address || 'Location provided'}
                  </Text>
                  {bookingData?.userLocation?.landmark ? (
                    <Text style={{ color: '#E84545', fontWeight: '600', fontSize: 13, marginTop: 4 }}>
                      🏛️ Near {bookingData.userLocation.landmark}
                    </Text>
                  ) : null}
               </View>
            </View>
         </View>

         <View style={styles.card}>
            <Text style={styles.sectionLabel}>PROBLEM DESCRIPTION</Text>
            <Text style={styles.descriptionText}>
               {bookingData?.problemDescription || 'No description provided.'}
            </Text>
         </View>
      </ScrollView>

      <View style={styles.footer}>
         <TouchableOpacity style={styles.rejectBtn} onPress={handleReject}>
            <Text style={styles.rejectText}>Decline</Text>
         </TouchableOpacity>
         <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept}>
            <Text style={styles.acceptText}>Accept Job</Text>
         </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6'
  },
  backButton: {
    padding: 8, backgroundColor: '#F3F4F6', borderRadius: 12
  },
  headerTitle: {
    fontSize: 18, fontWeight: '700', color: '#1F2937'
  },
  scrollContent: {
    padding: 20, paddingBottom: 100
  },
  statusBadge: {
    alignSelf: 'flex-start', backgroundColor: '#E0F2FE', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 8, marginBottom: 16
  },
  statusText: {
    fontSize: 12, fontWeight: '800', color: '#0369A1', letterSpacing: 0.5
  },
  mainInfo: {
    marginBottom: 24, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: '#E5E7EB'
  },
  serviceType: {
    fontSize: 32, fontWeight: '800', color: '#111827', marginBottom: 8
  },
  priceRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
  },
  priceLabel: {
    fontSize: 14, color: '#6B7280'
  },
  priceValue: {
    fontSize: 24, fontWeight: '700', color: '#10B981'
  },
  card: {
    backgroundColor: '#FFF', padding: 20, borderRadius: 16, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
  },
  sectionLabel: {
    fontSize: 12, fontWeight: '700', color: '#9CA3AF', marginBottom: 12, letterSpacing: 1
  },
  infoItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12
  },
  infoText: {
    fontSize: 15, color: '#374151', lineHeight: 22
  },
  descriptionText: {
    fontSize: 15, color: '#4B5563', lineHeight: 24
  },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF',
    padding: 20, flexDirection: 'row', gap: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6'
  },
  rejectBtn: {
    flex: 1, paddingVertical: 16, borderRadius: 12, backgroundColor: '#F3F4F6', alignItems: 'center'
  },
  acceptBtn: {
    flex: 2, paddingVertical: 16, borderRadius: 12, backgroundColor: '#E84545', alignItems: 'center'
  },
  rejectText: { color: '#6B7280', fontWeight: '700', fontSize: 16 },
  acceptText: { color: '#FFF', fontWeight: '700', fontSize: 16 }
});

export default IncomingBookingScreen;
