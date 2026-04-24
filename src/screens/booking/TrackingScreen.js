import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity,
         Animated, ActivityIndicator, Linking, Alert } from 'react-native';
import MapView, { Marker, Polyline, 
                  PROVIDER_GOOGLE } from 'react-native-maps';
import firestore from '@react-native-firebase/firestore';
import { GOOGLE_MAPS_API_KEY } from "../../constants/config";

const TrackingScreen = ({ route, navigation }) => {
  const { bookingId, workerId } = route.params;
  const mapRef = useRef(null);
  const workerLocationRef = useRef(null);
  const animatedLat = useRef(new Animated.Value(0)).current;
  const animatedLng = useRef(new Animated.Value(0)).current;

  const [userLocation, setUserLocation] = useState(null);
  const [workerLocation, setWorkerLocation] = useState(null);
  const [displayLocation, setDisplayLocation] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [routeProgress, setRouteProgress] = useState(0);
  const [eta, setETA] = useState('Calculating...');
  const [distanceText, setDistanceText] = useState('');
  const [bookingStatus, setBookingStatus] = useState('accepted');
  const [workerData, setWorkerData] = useState(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [isLocatingWorker, setIsLocatingWorker] = useState(true);

  // ━━━━━━━━━━━━━━━━━━━━━
  // FETCH BOOKING DATA
  // ━━━━━━━━━━━━━━━━━━━━━
  useEffect(() => {
    const unsubscribe = firestore()
      .collection('bookings')
      .doc(bookingId)
      .onSnapshot(doc => {
        if (doc.exists) {
          const data = doc.data();
          setBookingStatus(data.status);

          if (data.userLocation) {
            setUserLocation({
              latitude: data.userLocation.latitude,
              longitude: data.userLocation.longitude,
              ...data.userLocation,
            });
          }

          if (data.workerLocation) {
             const newLoc = { latitude: data.workerLocation.latitude, longitude: data.workerLocation.longitude };
             updateWorkerPosition(newLoc);
          }

          if (data.status === 'work_completed') {
            setShowCompletionModal(true);
          }
        }
      });
    return () => unsubscribe();
  }, [bookingId]);

  // ━━━━━━━━━━━━━━━━━━━━━
  // FETCH WORKER PROFILE
  // ━━━━━━━━━━━━━━━━━━━━━
  useEffect(() => {
    if (!workerId) return;
    firestore()
      .collection('workers')
      .doc(workerId)
      .get()
      .then(doc => {
        if (doc.exists) setWorkerData(doc.data());
      });
  }, [workerId]);

  // ━━━━━━━━━━━━━━━━━━━━━
  // LIVE WORKER LOCATION - ZOMATO ALGORITHM
  // ━━━━━━━━━━━━━━━━━━━━━
  useEffect(() => {
    if (!workerId) return;

    const unsubscribe = firestore()
      .collection('workers')
      .doc(workerId)
      .onSnapshot(doc => {
        if (doc.exists) {
          const data = doc.data();
          console.log('Worker doc data:', JSON.stringify(data.currentLocation));
          
          if (data.currentLocation) {
            // Validate coordinates are reasonable
            const lat = data.currentLocation.latitude;
            const lng = data.currentLocation.longitude;
            
            // Check if coordinates are in India (rough bounds)
            const isValidIndia = lat > 8 && lat < 37 && lng > 68 && lng < 97;
            
            if (!isValidIndia) {
              console.warn('Invalid coordinates received:', lat, lng);
              return; // Skip invalid coordinates
            }

            const newLoc = { latitude: lat, longitude: lng };
            updateWorkerPosition(newLoc);
          }
        }
      });

    return () => unsubscribe();
  }, [workerId, userLocation]);

  const updateWorkerPosition = (newLoc) => {
    setIsLocatingWorker(false);
    
    // ZOMATO ALGORITHM
    if (workerLocationRef.current) {
      smoothlyMoveMarker(workerLocationRef.current, newLoc, 28000);
    } else {
      setWorkerLocation(newLoc);
      setDisplayLocation(newLoc);
    }
    
    workerLocationRef.current = newLoc;
    setWorkerLocation(newLoc);

    if (userLocation) {
      updateETA(newLoc, userLocation);
      fetchRoute(newLoc, userLocation);
    }
  };

  // ━━━━━━━━━━━━━━━━━━━━━
  // SMOOTH MARKER ANIMATION (Zomato style)
  // ━━━━━━━━━━━━━━━━━━━━━
  const animationRef = useRef(null);

  const smoothlyMoveMarker = (from, to, duration) => {
    // Cancel any existing animation
    if (animationRef.current) {
      clearInterval(animationRef.current);
    }

    const steps = 60; // 60 steps over duration
    const stepDuration = duration / steps;
    let step = 0;

    animationRef.current = setInterval(() => {
      step++;
      const progress = step / steps;
      // Ease in/out for natural movement
      const eased = progress < 0.5
        ? 2 * progress * progress
        : -1 + (4 - 2 * progress) * progress;

      const interpolatedLat =
        from.latitude + (to.latitude - from.latitude) * eased;
      const interpolatedLng =
        from.longitude + (to.longitude - from.longitude) * eased;

      setDisplayLocation({
        latitude: interpolatedLat,
        longitude: interpolatedLng,
      });

      if (step >= steps) {
        clearInterval(animationRef.current);
        setWorkerLocation(to);
        setDisplayLocation(to);
      }
    }, stepDuration);
  };

  // Cleanup animation
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, []);

  // ━━━━━━━━━━━━━━━━━━━━━
  // CALCULATE ETA
  // ━━━━━━━━━━━━━━━━━━━━━
  const updateETA = (from, to) => {
    const dist = getDistanceKm(
      from.latitude, from.longitude,
      to.latitude, to.longitude
    );
    const mins = Math.round((dist / 30) * 60);
    setDistanceText(`${dist.toFixed(1)} km`);
    if (mins <= 0) {
      setETA('Arrived!');
    } else if (mins === 1) {
      setETA('1 min away');
    } else {
      setETA(`${mins} mins away`);
    }
  };

  // ━━━━━━━━━━━━━━━━━━━━━
  // FETCH ROUTE
  // ━━━━━━━━━━━━━━━━━━━━━
  const fetchRoute = async (origin, destination) => {
    try {
      const url =
        `https://maps.googleapis.com/maps/api/directions/json` +
        `?origin=${origin.latitude},${origin.longitude}` +
        `&destination=${destination.latitude},${destination.longitude}` +
        `&mode=driving` +
        `&key=${GOOGLE_MAPS_API_KEY}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.routes?.[0]) {
        const points = decodePolyline(
          data.routes[0].overview_polyline.points
        );
        setRouteCoords(points);

        // Fit map to show worker and user
        mapRef.current?.fitToCoordinates(
          [origin, destination],
          {
            edgePadding: {
              top: 100, right: 50,
              bottom: 350, left: 50
            },
            animated: true,
          }
        );
      }
    } catch (e) {
      if (origin && destination) {
        setRouteCoords([origin, destination]);
      }
    }
  };

  // ━━━━━━━━━━━━━━━━━━━━━
  // HELPER FUNCTIONS
  // ━━━━━━━━━━━━━━━━━━━━━
  const decodePolyline = (encoded) => {
    let index = 0, lat = 0, lng = 0;
    const result = [];
    while (index < encoded.length) {
      let shift = 0, b, result_val = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result_val |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      lat += (result_val & 1)
        ? ~(result_val >> 1) : (result_val >> 1);
      shift = 0; result_val = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result_val |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      lng += (result_val & 1)
        ? ~(result_val >> 1) : (result_val >> 1);
      result.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5
      });
    }
    return result;
  };

  const getDistanceKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI/180) *
      Math.cos(lat2 * Math.PI/180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  // ━━━━━━━━━━━━━━━━━━━━━
  // FIT MAP ON LOAD
  // ━━━━━━━━━━━━━━━━━━━━━
  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 1000);
    }
  }, [userLocation]);

  // ━━━━━━━━━━━━━━━━━━━━━
  // RENDER
  // ━━━━━━━━━━━━━━━━━━━━━
  const getStatusStep = () => {
    switch(bookingStatus) {
      case 'accepted': return 0;
      case 'on_the_way': return 1;
      case 'arrived': return 2;
      case 'working': return 3;
      default: return 0;
    }
  };

  const handleCloseJob = async () => {
    try {
      // Update booking in Firestore
      await firestore()
        .collection('bookings')
        .doc(bookingId)
        .update({
          status: 'completed',
          ticketStatus: 'closed',
          workEndTime: firestore.FieldValue.serverTimestamp(),
          paymentUnlocked: true,
        });
      
      // Free up worker
      await firestore()
        .collection('workers')
        .doc(workerId)
        .update({
          isAvailable: true,
          currentBookingId: null,
          currentLocation: null,
          isOnWay: false,
        });
      
      // Close modal first
      setShowCompletionModal(false);
      
      // Navigate to feedback screen
      navigation.replace('FeedbackScreen', {
        bookingId,
        workerId,
        workerName: workerData?.name || 'Worker',
        workerService: workerData?.serviceType || 'Service',
      });
      
    } catch (error) {
      console.error('Close job error:', error);
      Alert.alert('Error', 'Could not close job. Please try again.');
    }
  };

  const handleRaiseIssue = () => {
    setShowCompletionModal(false);
    Alert.alert(
      'Raise Issue',
      'Our support team will contact you within 24 hours.',
      [{ text: 'OK', onPress: () => navigation.replace('MainTabs') }]
    );
  };

  return (
    <View style={styles.container}>
      {/* MAP - Full screen */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: userLocation?.latitude || 16.7050,
          longitude: userLocation?.longitude || 74.2433,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}>

        {/* USER HOME - fixed red pin */}
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            title="Your Location"
            anchor={{ x: 0.5, y: 1 }}>
            <View style={styles.userPin}>
              <Text style={{ fontSize: 22 }}>🏠</Text>
            </View>
          </Marker>
        )}

        {/* WORKER - animated moving pin */}
        {displayLocation && (
          <Marker
            coordinate={{
              latitude: displayLocation.latitude,
              longitude: displayLocation.longitude,
            }}
            title={workerData?.name || 'Worker'}
            anchor={{ x: 0.5, y: 0.5 }}
            flat={true}
            rotation={0}>
            <View style={styles.workerPin}>
              <View style={styles.workerPinInner}>
                <Text style={{ fontSize: 20 }}>🛵</Text>
              </View>
              <View style={styles.workerPinPulse} />
            </View>
          </Marker>
        )}

        {/* ROUTE LINE */}
        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor="#4285F4"
            strokeWidth={5}
            lineCap="round"
            lineJoin="round"
          />
        )}
      </MapView>

      {/* TOP HEADER */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Track Order</Text>
          <Text style={styles.headerStatus}>
            {bookingStatus === 'accepted' ? 'Worker Accepted' :
             bookingStatus === 'on_the_way' ? 'On the way' :
             bookingStatus === 'arrived' ? 'Worker Arrived' :
             bookingStatus === 'working' ? 'Work in Progress' :
             'Processing'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.callBtn}
          onPress={() => {
            if (workerData?.phone || workerData?.phoneNumber) {
              Linking.openURL(`tel:${workerData.phone || workerData.phoneNumber}`);
            }
          }}>
          <Text style={styles.callIcon}>📞</Text>
        </TouchableOpacity>
      </View>

      {/* LIVE TRACKING BADGE */}
      <View style={styles.liveBadge}>
        <View style={styles.liveDot} />
        <Text style={styles.liveText}>Live Tracking</Text>
      </View>

      {/* BOTTOM SHEET */}
      <View style={styles.bottomSheet}>
        {/* ETA ROW */}
        <View style={styles.etaRow}>
          {isLocatingWorker ? (
            <View style={styles.locatingRow}>
              <ActivityIndicator size="small" color="#E53935" />
              <Text style={styles.locatingText}>
                Locating worker...
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.etaItem}>
                <Text style={styles.etaValue}>{eta}</Text>
                <Text style={styles.etaLabel}>ETA</Text>
              </View>
              <View style={styles.etaDivider} />
              <View style={styles.etaItem}>
                <Text style={styles.etaValue}>{distanceText}</Text>
                <Text style={styles.etaLabel}>Distance</Text>
              </View>
              <View style={styles.etaDivider} />
              <View style={styles.etaItem}>
                <View style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      bookingStatus === 'arrived' ||
                      bookingStatus === 'working'
                      ? '#10B981' : '#F59E0B'
                  }
                ]} />
                <Text style={styles.etaLabel}>
                  {bookingStatus === 'arrived' ? 'Arrived' :
                   bookingStatus === 'working' ? 'Working' :
                   'On Way'}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* WORKER INFO */}
        <View style={styles.workerRow}>
          <View style={styles.workerAvatar}>
            <Text style={styles.workerAvatarText}>
              {(workerData?.name || workerData?.fullName || 'W')[0].toUpperCase()}
            </Text>
          </View>
          <View style={styles.workerInfo}>
            <Text style={styles.workerName}>
              {workerData?.name || workerData?.fullName || 'Worker'}
            </Text>
            <Text style={styles.workerService}>
              {workerData?.serviceType || workerData?.category || 'Professional'}
            </Text>
            <View style={styles.ratingRow}>
              <Text style={styles.star}>⭐</Text>
              <Text style={styles.ratingText}>
                {workerData?.rating || '4.5'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.callWorkerBtn}
            onPress={() => {
              if (workerData?.phone || workerData?.phoneNumber) {
                Linking.openURL(`tel:${workerData.phone || workerData.phoneNumber}`);
              }
            }}>
            <Text style={{ fontSize: 24 }}>📞</Text>
          </TouchableOpacity>
        </View>

        {/* STATUS PROGRESS BAR */}
        <View style={styles.progressContainer}>
          {['ACCEPTED', 'ON WAY', 'ARRIVED', 'WORKING'].map(
            (step, index) => (
              <React.Fragment key={step}>
                <View style={styles.stepContainer}>
                  <View style={[
                    styles.stepDot,
                    index <= getStatusStep() && styles.stepDotActive
                  ]} />
                  <Text style={[
                    styles.stepLabel,
                    index <= getStatusStep() && styles.stepLabelActive
                  ]}>
                    {step}
                  </Text>
                </View>
                {index < 3 && (
                  <View style={[
                    styles.stepLine,
                    index < getStatusStep() && styles.stepLineActive
                  ]} />
                )}
              </React.Fragment>
            )
          )}
        </View>
      </View>

      {/* WORK COMPLETION MODAL */}
      {showCompletionModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>

            {/* Drag handle */}
            <View style={styles.dragHandle} />

            {/* Success Icon - clean ring with checkmark */}
            <View style={styles.successRing}>
              <View style={styles.successTickContainer}>
                <View style={styles.tickShort} />
                <View style={styles.tickLong} />
              </View>
            </View>

            {/* Title */}
            <Text style={styles.completionTitle}>Job Completed</Text>
            <Text style={styles.completionSubtitle}>
              Please confirm to release payment
            </Text>

            {/* Worker info row */}
            <View style={styles.workerCompletedRow}>
              <View style={styles.workerCompletedAvatar}>
                <Text style={styles.workerCompletedLetter}>
                  {(workerData?.name || 'W')[0].toUpperCase()}
                </Text>
              </View>
              <View style={styles.workerCompletedDetails}>
                <Text style={styles.workerCompletedName}>
                  {workerData?.name || 'Your Worker'}
                </Text>
                <Text style={styles.workerCompletedService}>
                  {workerData?.serviceType || 'Professional'}
                </Text>
              </View>
              <View style={styles.ratingPill}>
                <Text style={styles.ratingPillValue}>
                  {workerData?.rating || '4.5'}
                </Text>
                <Text style={styles.ratingPillStar}>★</Text>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.modalHr} />

            {/* Primary CTA */}
            <TouchableOpacity
              style={styles.confirmJobBtn}
              onPress={handleCloseJob}
              activeOpacity={0.88}>
              <Text style={styles.confirmJobBtnText}>
                Confirm &amp; Rate Service
              </Text>
            </TouchableOpacity>

            {/* Secondary */}
            <TouchableOpacity
              style={styles.reportProblemBtn}
              onPress={handleRaiseIssue}
              activeOpacity={0.7}>
              <Text style={styles.reportProblemText}>
                Report a Problem
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  topHeader: {
    position: 'absolute', top: 44,
    left: 16, right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16, padding: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 8,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center', alignItems: 'center',
  },
  backIcon: { fontSize: 20, color: '#1E293B' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: {
    fontSize: 16, fontWeight: '700', color: '#1E293B'
  },
  headerStatus: {
    fontSize: 13, color: '#E53935', fontWeight: '600'
  },
  callBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center', alignItems: 'center',
  },
  callIcon: { fontSize: 18 },
  liveBadge: {
    position: 'absolute', top: 110,
    right: 16,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20, paddingHorizontal: 12,
    paddingVertical: 6, elevation: 4,
  },
  liveDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#10B981', marginRight: 6,
  },
  liveText: {
    fontSize: 12, fontWeight: '600', color: '#1E293B'
  },
  userPin: {
    backgroundColor: '#FEF2F2',
    borderRadius: 20, padding: 8,
    borderWidth: 2, borderColor: '#E53935',
    elevation: 4,
  },
  workerPin: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  workerPinInner: {
    backgroundColor: '#4285F4',
    borderRadius: 22, padding: 8,
    borderWidth: 3, borderColor: '#fff',
    elevation: 8,
    zIndex: 2,
  },
  workerPinPulse: {
    position: 'absolute',
    width: 60, height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(66, 133, 244, 0.2)',
    zIndex: 1,
  },
  bottomSheet: {
    position: 'absolute', bottom: 0,
    left: 0, right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20, paddingBottom: 30,
    elevation: 10,
  },
  etaRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 14, padding: 14,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  locatingRow: {
    flexDirection: 'row',
    alignItems: 'center', gap: 10,
    flex: 1, justifyContent: 'center',
  },
  locatingText: {
    fontSize: 14, color: '#64748B', fontWeight: '500',
  },
  etaItem: { alignItems: 'center', flex: 1 },
  etaValue: {
    fontSize: 15, fontWeight: '800', color: '#1E293B'
  },
  etaLabel: {
    fontSize: 11, color: '#94A3B8', marginTop: 2
  },
  etaDivider: {
    width: 1, height: 28, backgroundColor: '#E2E8F0'
  },
  statusDot: {
    width: 10, height: 10,
    borderRadius: 5, marginBottom: 4,
  },
  workerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  workerAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#E53935',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  workerAvatarText: {
    fontSize: 20, fontWeight: '700', color: '#fff'
  },
  workerInfo: { flex: 1 },
  workerName: {
    fontSize: 16, fontWeight: '700', color: '#1E293B'
  },
  workerService: { fontSize: 13, color: '#64748B', marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  star: { fontSize: 12 },
  ratingText: {
    fontSize: 13, color: '#1E293B',
    fontWeight: '600', marginLeft: 4
  },
  callWorkerBtn: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#10B981',
    justifyContent: 'center', alignItems: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  stepContainer: { alignItems: 'center' },
  stepDot: {
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#E2E8F0',
  },
  stepDotActive: { backgroundColor: '#E53935' },
  stepLabel: {
    fontSize: 9, color: '#94A3B8',
    marginTop: 4, fontWeight: '600',
  },
  stepLabelActive: { color: '#E53935' },
  stepLine: {
    flex: 1, height: 2,
    backgroundColor: '#E2E8F0',
    marginBottom: 18,
  },
  stepLineActive: { backgroundColor: '#E53935' },
  modalOverlay: {
    position: 'absolute', top: 0, bottom: 0,
    left: 0, right: 0,
    backgroundColor: 'rgba(26, 26, 26, 0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
    alignItems: 'center',
  },
  dragHandle: {
    width: 36, height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    marginBottom: 28,
  },
  successRing: {
    width: 72, height: 72,
    borderRadius: 36,
    borderWidth: 2.5,
    borderColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  successTickContainer: {
    width: 36, height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tickShort: {
    position: 'absolute',
    width: 10, height: 2.5,
    backgroundColor: '#22C55E',
    borderRadius: 2,
    transform: [
      { rotate: '45deg' },
      { translateX: -5 },
      { translateY: 3 }
    ],
  },
  tickLong: {
    position: 'absolute',
    width: 20, height: 2.5,
    backgroundColor: '#22C55E',
    borderRadius: 2,
    transform: [
      { rotate: '-55deg' },
      { translateX: 3 },
      { translateY: -1 }
    ],
  },
  completionTitle: {
    fontSize: 22, fontWeight: '800',
    color: '#1A1A1A', letterSpacing: -0.3,
    marginBottom: 6,
  },
  completionSubtitle: {
    fontSize: 14, color: '#64748B',
    marginBottom: 22, textAlign: 'center',
  },
  workerCompletedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  workerCompletedAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#E84545',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  workerCompletedLetter: {
    fontSize: 18, fontWeight: '700', color: '#fff',
  },
  workerCompletedDetails: { flex: 1 },
  workerCompletedName: {
    fontSize: 15, fontWeight: '700', color: '#1A1A1A',
  },
  workerCompletedService: {
    fontSize: 13, color: '#64748B', marginTop: 2,
  },
  ratingPill: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  ratingPillValue: {
    fontSize: 13, fontWeight: '700',
    color: '#92400E', marginRight: 2,
  },
  ratingPillStar: {
    fontSize: 12, color: '#F59E0B',
  },
  modalHr: {
    width: '100%', height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 20,
  },
  confirmJobBtn: {
    width: '100%',
    backgroundColor: '#E84545',
    paddingVertical: 16,
    borderRadius: 13,
    alignItems: 'center',
    marginBottom: 10,
  },
  confirmJobBtnText: {
    color: '#FFFFFF', fontSize: 15,
    fontWeight: '700', letterSpacing: 0.2,
  },
  reportProblemBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reportProblemText: {
    color: '#64748B', fontSize: 15,
    fontWeight: '600',
  },
});

export default TrackingScreen;
