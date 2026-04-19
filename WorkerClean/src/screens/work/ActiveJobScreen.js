import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Image, Linking, Platform } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import locationService from '../../services/locationService';

const ActiveJobScreen = ({ route, navigation }) => {
  const { bookingId, bookingData: initialData } = route.params || {};
  const [bookingData, setBookingData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [workerLocation, setWorkerLocation] = useState(null);
  const [workerAddress, setWorkerAddress] = useState('Detecting current address...');

  useEffect(() => {
    if (!bookingId) return;
    const unsubscribe = firestore()
      .collection('bookings')
      .doc(bookingId)
      .onSnapshot(doc => {
        if (doc.exists) {
          const data = doc.data();
          setBookingData({ id: doc.id, ...data });
          
          // resume tracking if already navigating or working
          if (['navigating', 'arrived', 'in_progress'].includes(data.status)) {
             locationService.startTracking(data.workerId, doc.id);
          }
        }
      });
    return () => {
      unsubscribe();
      locationService.stopTracking();
    };
  }, [bookingId]);

  // Track worker's own location and address from Firestore (for consistency)
  useEffect(() => {
    if (!bookingData?.workerId) return;

    const unsubscribe = firestore()
      .collection('workers')
      .doc(bookingData.workerId)
      .onSnapshot(doc => {
        if (doc.exists && doc.data().currentLocation) {
          const loc = doc.data().currentLocation;
          setWorkerLocation(loc);
          setWorkerAddress(loc.address || 'Detecting...');
        }
      });
    return () => unsubscribe();
  }, [bookingData?.workerId]);

  const updateStatus = async (newStatus) => {
    setLoading(true);
    try {
      const updateObj = { status: newStatus };
      if (newStatus === 'navigating') updateObj.startedNavigatingAt = firestore.FieldValue.serverTimestamp();
      if (newStatus === 'arrived') updateObj.arrivedAt = firestore.FieldValue.serverTimestamp();
      if (newStatus === 'in_progress') updateObj.workStartedAt = firestore.FieldValue.serverTimestamp();
      if (newStatus === 'work_completed') {
          updateObj.completedAt = firestore.FieldValue.serverTimestamp();
      }

      await firestore().collection('bookings').doc(bookingId).update(updateObj);

      // Start/Stop location tracking based on status
      if (newStatus === 'navigating') {
        const hasPermission = await locationService.requestPermission();
        if (hasPermission) {
          locationService.startTracking(bookingData?.workerId, bookingId);
        }
      } else if (newStatus === 'work_completed') {
        locationService.stopTracking();
      }

      if (newStatus === 'work_completed') {
        const workerId = bookingData?.workerId;
        if (workerId) {
          await firestore().collection('workers').doc(workerId).update({
            isAvailable: true,
            currentBookingId: null
          });
        }
        Alert.alert('Success', 'Job completed successfully!');
        navigation.navigate('MainTabs');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = () => {
    const loc = bookingData?.userLocation;
    const lat = loc?.latitude || loc?.lat || loc?.coords?.latitude;
    const lng = loc?.longitude || loc?.lng || loc?.coords?.longitude;

    if (!lat || !lng) {
        Alert.alert('Error', 'No coordinates available for navigation');
        return;
    }
    
    const address = bookingData?.userLocation?.fullAddress || bookingData?.userLocation?.address;
    
    // Build complete destination address query
    const query = encodeURIComponent(`${lat},${lng}`);
    
    // Opens Google Maps with directions
    const url = Platform.OS === 'android' 
      ? `google.navigation:q=${lat},${lng}&mode=d`
      : `maps://app?daddr=${lat},${lng}&t=m`;
      
    const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Linking.openURL(webUrl);
      }
    });

    if (bookingData?.status === 'accepted') {
        updateStatus('navigating');
    }
  };

  const renderActionButton = () => {
    const status = bookingData?.status || 'accepted';

    switch (status) {
      case 'accepted':
        return (
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: '#3B82F6' }]} 
            onPress={handleNavigate}
            disabled={loading}
          >
            <MaterialCommunityIcons name="google-maps" size={24} color="#FFF" />
            <Text style={styles.actionBtnText}>Start Navigating</Text>
          </TouchableOpacity>
        );
      case 'navigating':
        return (
          <View style={styles.actionColumn}>
             <TouchableOpacity 
               style={[styles.actionBtn, { backgroundColor: '#10B981' }]} 
               onPress={() => updateStatus('arrived')}
               disabled={loading}
             >
                <MaterialCommunityIcons name="map-marker-check" size={24} color="#FFF" />
                <Text style={styles.actionBtnText}>I have Reached Location</Text>
             </TouchableOpacity>
             <TouchableOpacity style={styles.secondaryBtn} onPress={handleNavigate}>
                <Text style={styles.secondaryBtnText}>Open Maps Again</Text>
             </TouchableOpacity>
          </View>
        );
      case 'arrived':
        return (
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: '#8B5CF6' }]} 
            onPress={() => updateStatus('in_progress')}
            disabled={loading}
          >
            <MaterialCommunityIcons name="play-circle" size={24} color="#FFF" />
            <Text style={styles.actionBtnText}>Start Working Now</Text>
          </TouchableOpacity>
        );
      case 'in_progress':
        return (
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: '#10B981' }]} 
            onPress={() => updateStatus('work_completed')}
            disabled={loading}
          >
            <MaterialCommunityIcons name="check-circle" size={24} color="#FFF" />
            <Text style={styles.actionBtnText}>Mark Job Completed</Text>
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  const getStatusStep = () => {
     const status = bookingData?.status || 'accepted';
     if (status === 'accepted') return 1;
     if (status === 'navigating') return 2;
     if (status === 'arrived') return 3;
     if (status === 'in_progress') return 4;
     return 5;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
           <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ongoing Job</Text>
        <TouchableOpacity onPress={() => Linking.openURL(`tel:${bookingData?.userPhone || '9876543210'}`)} style={styles.callButton}>
           <Ionicons name="call" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.stepIndicator}>
         {[1,2,3,4].map((step) => (
            <React.Fragment key={step}>
               <View style={[styles.stepDot, getStatusStep() >= step ? styles.stepDotActive : null]}>
                  <Text style={[styles.stepNum, getStatusStep() >= step ? styles.stepNumActive : null]}>{step}</Text>
               </View>
               {step < 4 && <View style={[styles.stepLine, getStatusStep() > step ? styles.stepLineActive : null]} />}
            </React.Fragment>
         ))}
      </View>

      <View style={styles.content}>
         <View style={styles.statusIllustration}>
            <MaterialCommunityIcons name="shield-check-outline" size={60} color="#E84545" />
            <Text style={styles.illustrationText}>Security Tracking Enabled</Text>
            <View style={styles.statusBadgeRow}>
              <View style={styles.liveBadge} />
              <Text style={styles.liveText}>Location Protection Active</Text>
            </View>
         </View>

         <View style={styles.card}>
            <View style={styles.customerRow}>
               <Image source={{ uri: 'https://avatar.iran.liara.run/public/boy' }} style={styles.customerAvatar} />
               <View>
                  <Text style={styles.customerName}>{bookingData?.userName || 'Customer'}</Text>
                  <Text style={styles.serviceTag}>{bookingData?.serviceType || 'Service'}</Text>
               </View>
            </View>
            <View style={styles.divider} />
             <View style={styles.locationInfo}>
                <MaterialCommunityIcons name="map-marker-radius" size={24} color="#E84545" />
                <View style={{ flex: 1 }}>
                   {bookingData?.userLocation?.flat ? (
                     <Text style={styles.flatText}>
                       {bookingData.userLocation.flat}
                       {bookingData.userLocation.wing ? `, Wing ${bookingData.userLocation.wing}` : ''}
                       {bookingData.userLocation.addressType ? ` (${bookingData.userLocation.addressType})` : ''}
                     </Text>
                   ) : null}
                   
                   <Text style={[styles.locationText, { fontWeight: '700', color: '#1F2937' }]}>
                     {bookingData?.userLocation?.shortAddress || 'Location provided'}
                   </Text>
                   
                   <Text style={styles.locationText}>
                     {bookingData?.userLocation?.fullAddress || bookingData?.userLocation?.address || ''}
                   </Text>
                   
                   {bookingData?.userLocation?.landmark ? (
                     <Text style={styles.landmarkText}>
                       🏛️ Near {bookingData.userLocation.landmark}
                     </Text>
                   ) : null}

                   <Text style={styles.coordsTextSmall}>
                     ({bookingData?.userLocation?.latitude?.toFixed(4)}, {bookingData?.userLocation?.longitude?.toFixed(4)})
                   </Text>
                </View>
             </View>
         </View>

         <View style={styles.statusCard}>
            <Text style={styles.statusLabel}>Current Stage</Text>
            <Text style={styles.statusValue}>
               {bookingData?.status === 'accepted' ? 'Waiting to start' : 
                bookingData?.status === 'navigating' ? 'On the way to customer' :
                bookingData?.status === 'arrived' ? 'At customer location' :
                bookingData?.status === 'in_progress' ? 'Work in progress' : 'Finishing up'}
            </Text>
         </View>
      </View>

      <View style={styles.footer}>
         {loading ? <ActivityIndicator size="large" color="#E84545" /> : renderActionButton()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6'
  },
  backButton: { padding: 8, backgroundColor: '#F3F4F6', borderRadius: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  callButton: { padding: 10, backgroundColor: '#10B981', borderRadius: 12 },
  
  stepIndicator: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#FFF'
  },
  stepDot: {
    width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center'
  },
  stepDotActive: { backgroundColor: '#E84545', borderColor: '#E84545' },
  stepNum: { fontSize: 12, fontWeight: '700', color: '#9CA3AF' },
  stepNumActive: { color: '#FFF' },
  stepLine: { width: 40, height: 2, backgroundColor: '#E5E7EB', marginHorizontal: 4 },
  stepLineActive: { backgroundColor: '#E84545' },

  content: { padding: 20 },
  card: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3
  },
  customerRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  customerAvatar: { width: 50, height: 50, borderRadius: 25 },
  customerName: { fontSize: 18, fontWeight: '700', color: '#111827' },
  serviceTag: { fontSize: 13, color: '#E84545', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 16 },
  locationInfo: { flexDirection: 'row', gap: 10 },
  locationText: { fontSize: 14, color: '#4B5563', flex: 1, lineHeight: 20 },
  flatText: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 2 },
  landmarkText: { fontSize: 13, color: '#E84545', fontWeight: '600', marginTop: 4 },
  coordsTextSmall: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  statusIllustration: {
    height: 200,
    backgroundColor: '#FFF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    elevation: 2,
  },
  illustrationText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 12,
  },
  statusBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  liveBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  liveText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },

  statusCard: {
    backgroundColor: '#111827', borderRadius: 20, padding: 20
  },
  statusLabel: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 4, letterSpacing: 0.5 },
  statusValue: { fontSize: 20, fontWeight: '700', color: '#FFF' },

  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, backgroundColor: '#FFF' },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
    paddingVertical: 18, borderRadius: 16
  },
  actionBtnText: { fontSize: 16, fontWeight: '800', color: '#FFF' },
  actionColumn: { gap: 12 },
  secondaryBtn: { alignItems: 'center', paddingVertical: 12 },
  secondaryBtnText: { fontSize: 14, fontWeight: '600', color: '#6B7280' }
});

export default ActiveJobScreen;
