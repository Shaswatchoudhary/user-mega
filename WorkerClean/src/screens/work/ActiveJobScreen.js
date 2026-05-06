import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Image, Linking, Platform, ScrollView, PermissionsAndroid } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Geolocation from '@react-native-community/geolocation';
import CustomModal from '../../components/CustomModal';


const ActiveJobScreen = ({ route, navigation }) => {
  const { bookingId, bookingData: initialData } = route.params || {};
  const [bookingData, setBookingData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [workerLocation, setWorkerLocation] = useState(null);
  const [workerAddress, setWorkerAddress] = useState('Detecting current address...');
  const trackingInterval = useRef(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);


  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const startLocationTracking = (workerId, bookingId) => {
    if (trackingInterval.current) {
      clearInterval(trackingInterval.current);
    }

    const track = () => {
      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const timestamp = firestore.FieldValue.serverTimestamp();
          
          const locationData = {
            latitude,
            longitude,
            lastUpdated: timestamp
          };

          // Instant sync to both worker and booking docs
          firestore().collection('workers').doc(workerId).update({
            currentLocation: locationData,
            status: 'ON_JOB'
          }).catch(e => console.log('Worker location sync error:', e));

          firestore().collection('bookings').doc(bookingId).update({
            workerLocation: locationData,
          }).catch(e => console.log('Booking location sync error:', e));
        },
        (error) => console.log('GPS Error:', error),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    };

    track(); // Run once immediately
    trackingInterval.current = setInterval(track, 30000); // 30s for background sync as requested
  };

  const stopLocationTracking = () => {
    if (trackingInterval.current) {
      clearInterval(trackingInterval.current);
      trackingInterval.current = null;
    }
  };

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
          if (['on_the_way', 'arrived', 'working'].includes(data.status)) {
             startLocationTracking(data.workerId, doc.id);
          }
        }
      });
    return () => {
      unsubscribe();
      stopLocationTracking();
    };
  }, [bookingId]);

  useEffect(() => {
    if (!bookingData?.workerId) return;

    const unsubscribe = firestore()
      .collection('workers')
      .doc(bookingData.workerId)
      .onSnapshot(doc => {
        if (doc.exists) {
          const data = doc.data();
          // Support both old currentLocation object and new lat/lng fields
          const lat = data.lat || data.currentLocation?.latitude;
          const lng = data.lng || data.currentLocation?.longitude;
          const address = data.currentAddress || data.currentLocation?.address;

          if (lat && lng) {
            setWorkerLocation({ latitude: lat, longitude: lng });
            setWorkerAddress(address || 'Detecting...');
          }
        }
      });
    return () => unsubscribe();
  }, [bookingData?.workerId]);

  const updateStatus = async (newStatus) => {
    setLoading(true);
    try {
      const updateObj = { status: newStatus };
      if (newStatus === 'on_the_way') updateObj.startedNavigatingAt = firestore.FieldValue.serverTimestamp();
      if (newStatus === 'arrived') updateObj.arrivedAt = firestore.FieldValue.serverTimestamp();
      if (newStatus === 'working') updateObj.workStartedAt = firestore.FieldValue.serverTimestamp();
      if (newStatus === 'work_completed') {
          updateObj.completedAt = firestore.FieldValue.serverTimestamp();
          updateObj.paymentUnlocked = true;
      }

      await firestore().collection('bookings').doc(bookingId).update(updateObj);

      // Start/Stop location tracking based on status
      if (newStatus === 'on_the_way') {
        const hasPermission = await requestLocationPermission();
        if (hasPermission) {
          startLocationTracking(bookingData?.workerId, bookingId);
        }
      } else if (newStatus === 'work_completed') {
        stopLocationTracking();
      }

      if (newStatus === 'work_completed') {
        const workerId = bookingData?.workerId;
        if (workerId) {
          await firestore().collection('workers').doc(workerId).update({
            isAvailable: true,
            currentBookingId: null
          });
        }
        setShowSuccessModal(true);
      }
    } catch (error) {

      console.error(error);
      Alert.alert('Error', 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = () => {
    const loc = bookingData?.userLocation || {};
    const lat = loc.latitude || loc.lat || loc.coords?.latitude || bookingData?.userLat;
    const lng = loc.longitude || loc.lng || loc.coords?.longitude || bookingData?.userLng;

    if (bookingData?.status === 'accepted') {
        updateStatus('on_the_way');
    }

    // STEP 1 — Get worker's CURRENT GPS instantly and push to Firestore
    Geolocation.getCurrentPosition(pos => {
      const { latitude, longitude } = pos.coords;
      
      firestore().collection('bookings').doc(bookingId).update({
        workerLocation: { latitude, longitude, lastUpdated: firestore.FieldValue.serverTimestamp() },
      });

      // STEP 2 — Open Google Maps with route
      const destLat = lat;
      const destLng = lng;
      const url = `google.navigation:q=${destLat},${destLng}&mode=d`;
      const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&travelmode=driving`;
      
      Linking.canOpenURL(url).then(supported => {
        Linking.openURL(supported ? url : webUrl);
      });

      // Start the 30s background sync interval
      startLocationTracking(bookingData?.workerId, bookingId);
    }, err => {
      console.log('Immediate GPS Error:', err);
      // Fallback to just opening maps if GPS fails
      const url = `google.navigation:q=${lat},${lng}&mode=d`;
      Linking.openURL(url);
    }, { enableHighAccuracy: true, timeout: 10000 });
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
      case 'on_the_way':
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
            onPress={() => updateStatus('working')}
            disabled={loading}
          >
            <MaterialCommunityIcons name="play-circle" size={24} color="#FFF" />
            <Text style={styles.actionBtnText}>Start Working Now</Text>
          </TouchableOpacity>
        );
      case 'working':
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
     if (status === 'on_the_way') return 2;
     if (status === 'arrived') return 3;
     if (status === 'working') return 4;
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

      <ScrollView contentContainerStyle={styles.scrollContent}>
         <View style={styles.card}>
            <View style={styles.customerRow}>
               <Image source={{ uri: 'https://avatar.iran.liara.run/public/boy' }} style={styles.customerAvatar} />
               <View>
                  <Text style={styles.customerName}>{bookingData?.userName || 'Customer'}</Text>
                  <Text style={styles.serviceTag}>{bookingData?.serviceType || 'Service'}</Text>
               </View>
            </View>
            <View style={styles.divider} />
            
            {/* Address Information Section */}
            <View style={styles.locationSection}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="map-marker-radius" size={22} color="#E84545" />
                <Text style={styles.sectionTitle}>Service Address</Text>
              </View>

              <View style={styles.addressContainer}>
                {bookingData?.userLocation?.flat ? (
                  <View style={styles.flatRow}>
                    <Text style={styles.flatText}>
                      {bookingData.userLocation.flat}
                      {bookingData.userLocation.wing ? `, Wing ${bookingData.userLocation.wing}` : ''}
                      {bookingData.userLocation.addressType ? ` (${bookingData.userLocation.addressType})` : ''}
                    </Text>
                  </View>
                ) : null}
                
                <Text style={styles.addressMain}>
                  {bookingData?.userLocation?.shortAddress || 'Standard Location'}
                </Text>
                
                <Text style={styles.addressFull}>
                  {bookingData?.userLocation?.fullAddress || bookingData?.userAddress || 'Address not provided'}
                </Text>
                
                {bookingData?.userLocation?.landmark ? (
                  <View style={styles.landmarkRow}>
                    <MaterialCommunityIcons name="office-building-marker" size={16} color="#E84545" />
                    <Text style={styles.landmark}>
                      Near {bookingData.userLocation.landmark}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
         </View>

         <View style={styles.securityBanner}>
           <MaterialCommunityIcons name="shield-check" size={24} color="#10B981" />
           <Text style={styles.securityText}>Active Location Security Protocol</Text>
         </View>

         <View style={styles.newStatusCard}>
            <View style={styles.statusAccent} />
            <View style={styles.statusInfo}>
                <Text style={styles.statusLabelSmall}>CURRENT STAGE</Text>
                <Text style={styles.statusValueText}>
                   {bookingData?.status === 'accepted' ? 'Waiting to start' : 
                    bookingData?.status === 'on_the_way' ? 'On the way to customer' :
                    bookingData?.status === 'arrived' ? 'At customer location' :
                    bookingData?.status === 'working' ? 'Work in progress' : 'Finishing up'}
                </Text>
            </View>
            <MaterialCommunityIcons 
                name={bookingData?.status === 'working' ? "hammer-wrench" : "clock-check-outline"} 
                size={28} 
                color="#E84545" 
            />
         </View>
      </ScrollView>

      <View style={styles.footer}>
         {loading ? <ActivityIndicator size="large" color="#E84545" /> : renderActionButton()}
      </View>

      <CustomModal
        visible={showSuccessModal}
        type="success"
        title="Job Completed"
        message="Job marked as done. Waiting for customer confirmation."
        onPrimary={() => {
          setShowSuccessModal(false);
          navigation.navigate('MainTabs');
        }}
      />
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
    width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center'
  },
  stepDotActive: { backgroundColor: '#E84545', borderColor: '#E84545' },
  stepNum: { fontSize: 13, fontWeight: '700', color: '#9CA3AF' },
  stepNumActive: { color: '#FFF' },
  stepLine: { width: 40, height: 3, backgroundColor: '#E5E7EB', marginHorizontal: 4, borderRadius: 2 },
  stepLineActive: { backgroundColor: '#E84545' },

  scrollContent: { padding: 20 },
  card: {
    backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 4
  },
  customerRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  customerAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#F3F4F6' },
  customerName: { fontSize: 20, fontWeight: '700', color: '#111827' },
  serviceTag: { fontSize: 14, color: '#E84545', fontWeight: '600', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 20 },

  locationSection: { gap: 15 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1F2937', letterSpacing: 0.5 },
  addressContainer: { backgroundColor: '#F9FAFB', padding: 16, borderRadius: 18, borderWidth: 1, borderColor: '#F3F4F6' },
  flatRow: { marginBottom: 6 },
  flatText: { fontSize: 15, fontWeight: '800', color: '#111827' },
  addressMain: { fontSize: 16, fontWeight: '700', color: '#374151', marginBottom: 4 },
  addressFull: { fontSize: 14, color: '#6B7280', lineHeight: 22 },
  landmarkRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, backgroundColor: '#FFF', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: '#FEE2E2' },
  landmark: { fontSize: 13, color: '#E84545', fontWeight: '700' },

  securityBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#F0FDF4', padding: 12, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: '#DCFCE7' },
  securityText: { fontSize: 13, fontWeight: '700', color: '#15803D' },

  newStatusCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 20, 
    padding: 20, borderWidth: 1.5, borderColor: '#FEE2E2', shadowColor: '#E84545', 
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 2
  },
  statusAccent: { width: 4, height: 40, backgroundColor: '#E84545', borderRadius: 2, marginRight: 15 },
  statusInfo: { flex: 1 },
  statusLabelSmall: { fontSize: 11, color: '#9CA3AF', fontWeight: '700', letterSpacing: 1 },
  statusValueText: { fontSize: 18, fontWeight: '800', color: '#E84545', marginTop: 2 },

  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 18, borderRadius: 16 },
  actionBtnText: { fontSize: 16, fontWeight: '800', color: '#FFF' },
  actionColumn: { gap: 12 },
  secondaryBtn: { alignItems: 'center', paddingVertical: 12 },
  secondaryBtnText: { fontSize: 14, fontWeight: '600', color: '#6B7280' }
});

export default ActiveJobScreen;
