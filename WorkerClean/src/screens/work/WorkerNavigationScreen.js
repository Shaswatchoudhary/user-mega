import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  PermissionsAndroid, Platform, Alert,
  ActivityIndicator, SafeAreaView, StatusBar,
  Linking
} from 'react-native';
import MapView, {
  Marker, Polyline, PROVIDER_GOOGLE
} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../context/AuthContext';
import config from '../../constants/config';
import { LocationTracker } from '../../services/locationTracker';

const GOOGLE_MAPS_API_KEY = config.GOOGLE_MAPS_API_KEY;

const WorkerNavigationScreen = ({ route, navigation }) => {
  const { bookingId, userLocation, workerId } = route.params;
  const { workerUser } = useAuth();
  const mapRef = useRef(null);
  const trackerRef = useRef(null);

  const [workerLocation, setWorkerLocation] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [watchId, setWatchId] = useState(null);
  const [arrived, setArrived] = useState(false);

  const currentWorkerId = workerId || workerUser?.uid || auth().currentUser?.uid;

  // ━━━━━━━━━━━━━━━━━━━━━
  // FIT MAP TO BOTH LOCATIONS
  // ━━━━━━━━━━━━━━━━━━━━━
  const fitMapToBothLocations = (workerLoc, userLoc) => {
    if (!mapRef.current || !workerLoc || !userLoc) return;
    
    setTimeout(() => {
      mapRef.current.fitToCoordinates(
        [
          { latitude: workerLoc.latitude, longitude: workerLoc.longitude },
          { latitude: userLoc.latitude, longitude: userLoc.longitude }
        ],
        {
          edgePadding: { top: 120, right: 60, bottom: 320, left: 60 },
          animated: true,
        }
      );
    }, 1500); // Small delay to ensure map is ready
  };

  // Request location permission and start tracking
  useEffect(() => {
    const initTracking = async () => {
      const hasPermission = await requestPermission();
      if (hasPermission) {
        // 1. Get initial position immediately and save to Firestore
        Geolocation.getCurrentPosition(
          async (position) => {
            const location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            setWorkerLocation(location);
            setIsLoading(false);

            // Save IMMEDIATELY to Firestore
            if (currentWorkerId) {
              try {
                // Clear old location first
                await firestore()
                  .collection('workers')
                  .doc(currentWorkerId)
                  .update({
                    currentLocation: null,
                    isOnWay: false,
                  });

                // Then update with new location
                await firestore()
                  .collection('workers')
                  .doc(currentWorkerId)
                  .update({
                    currentLocation: location,
                    locationUpdatedAt: firestore.FieldValue.serverTimestamp(),
                    isOnWay: true,
                  });

                // Update booking status to on_the_way
                await firestore()
                  .collection('bookings')
                  .doc(bookingId)
                  .update({
                    status: 'on_the_way',
                    startedNavigationAt: firestore.FieldValue.serverTimestamp(),
                  });
              } catch (e) {
                console.log('Initial Firestore update error:', e);
              }
            }
            if (userLocation) {
              fetchRoute(location, userLocation);
              fitMapToBothLocations(location, userLocation);
            }
          },
          (error) => {
            console.error('Location error code:', error.code);
            console.error('Location error message:', error.message);
            setIsLoading(false);
            Alert.alert(
              'Location Error',
              'Please enable GPS location in your phone settings',
              [
                { text: 'Open Settings', onPress: () => {
                  Linking.openSettings();
                }},
                { text: 'Retry', onPress: () => initTracking() }
              ]
            );
          },
          { 
            enableHighAccuracy: false, // false works better on real devices
            timeout: 30000, 
            maximumAge: 60000 
          }
        );

        // 2. Start LocationTracker for continuous updates
        trackerRef.current = new LocationTracker(currentWorkerId, bookingId);
        trackerRef.current.start((location) => {
          setWorkerLocation(location);
          if (userLocation) {
            fetchRoute(location, userLocation);
            
            // Check if arrived
            const dist = getDistanceMeters(
              location.latitude, location.longitude,
              userLocation.latitude, userLocation.longitude
            );
            if (dist < 100 && !arrived) {
              setArrived(true);
              firestore().collection('bookings').doc(bookingId).update({
                status: 'arrived',
                arrivedAt: firestore.FieldValue.serverTimestamp(),
              });
              Alert.alert('📍 You have arrived!', 'You are at the customer location');
            }
          }
        });
      }
    };
    initTracking();
    
    return () => {
      trackerRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    if (workerLocation && userLocation) {
      fitMapToBothLocations(workerLocation, userLocation);
    }
  }, [workerLocation, userLocation]);

  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      const fineLocation = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      
      if (fineLocation) return true;
      
      const result = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      ]);
      
      return (
        result['android.permission.ACCESS_FINE_LOCATION'] === 
          PermissionsAndroid.RESULTS.GRANTED ||
        result['android.permission.ACCESS_COARSE_LOCATION'] === 
          PermissionsAndroid.RESULTS.GRANTED
      );
    }
    return true;
  };


  const fetchRoute = async (origin, destination) => {
    console.log('Fetching route from:', origin, 'to:', destination);
    try {
      const url =
        `https://maps.googleapis.com/maps/api/directions/json` +
        `?origin=${origin.latitude},${origin.longitude}` +
        `&destination=${destination.latitude},${destination.longitude}` +
        `&mode=driving` +
        `&key=${GOOGLE_MAPS_API_KEY}`;

      const res = await fetch(url);
      const data = await res.json();
      console.log('Route status:', data.status);
      console.log('Routes found:', data.routes?.length);

      if (data.routes?.[0]) {
        const leg = data.routes[0].legs[0];
        setDistance(leg.distance.text);
        setDuration(leg.duration.text);

        const points = decodePolyline(
          data.routes[0].overview_polyline.points
        );
        console.log('Polyline points:', points.length);
        setRouteCoords(points);
        fitMapToBothLocations(origin, destination);
      } else {
        console.log('No routes found, error:', data.error_message);
        setRouteCoords([origin, destination]);
        fitMapToBothLocations(origin, destination);
      }
    } catch (e) {
      console.error('Route fetch error:', e);
      setRouteCoords([origin, destination]);
      fitMapToBothLocations(origin, destination);
    }
  };

  // Decode Google polyline encoding
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
      lat += (result_val & 1) ? ~(result_val >> 1) : (result_val >> 1);
      shift = 0; result_val = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result_val |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      lng += (result_val & 1) ? ~(result_val >> 1) : (result_val >> 1);
      result.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }
    return result;
  };

  const getDistanceMeters = (lat1, lon1, lat2, lon2) => {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  const markWorkStarted = async () => {
    await firestore().collection('bookings').doc(bookingId).update({
      status: 'working',
      workStartTime: firestore.FieldValue.serverTimestamp(),
    });
    navigation.replace('ActiveJob', { bookingId });
  };

  if (isLoading || !workerLocation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E84545" />
        <Text style={styles.loadingText}>Calibrating GPS...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: userLocation?.latitude || 16.7050,
          longitude: userLocation?.longitude || 74.2433,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        }}
        showsTraffic={true}
        showsUserLocation={false}
      >
        {workerLocation && (
          <Marker
            coordinate={{
              latitude: workerLocation.latitude,
              longitude: workerLocation.longitude,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
            title="You (Worker)">
            <View style={{
              backgroundColor: '#4285F4',
              borderRadius: 25, padding: 10,
              borderWidth: 3, borderColor: '#fff',
              elevation: 8,
              shadowColor: '#4285F4',
              shadowOpacity: 0.5,
              shadowRadius: 10,
            }}>
              <MaterialCommunityIcons name="moped" size={24} color="#FFF" />
            </View>
          </Marker>
        )}

        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            title="Customer"
            description={userLocation.shortAddress || userLocation.displayAddress}>
            <View style={{
              backgroundColor: '#E84545',
              borderRadius: 25, padding: 10,
              borderWidth: 3, borderColor: '#fff',
              elevation: 8,
              shadowColor: '#E84545',
              shadowOpacity: 0.5,
              shadowRadius: 10,
            }}>
              <MaterialCommunityIcons name="home-account" size={24} color="#FFF" />
            </View>
          </Marker>
        )}

        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor="#4285F4"
            strokeWidth={6}
            lineCap="round"
            lineJoin="round"
          />
        )}
      </MapView>

      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
      </TouchableOpacity>

      <View style={styles.bottomCard}>
        <View style={styles.etaRow}>
          <View style={styles.etaBox}>
            <Text style={styles.etaValue}>{duration || '--'}</Text>
            <Text style={styles.etaLabel}>Time Left</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.etaBox}>
            <Text style={styles.etaValue}>{distance || '--'}</Text>
            <Text style={styles.etaLabel}>Distance</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.etaBox}>
             <View style={[styles.statusDot, { backgroundColor: arrived ? '#10B981' : '#F59E0B' }]} />
             <Text style={styles.etaLabel}>{arrived ? 'Arrived' : 'On the Way'}</Text>
          </View>
        </View>

        <View style={styles.addressBox}>
           <Ionicons name="location" size={20} color="#E84545" />
           <View style={{ flex: 1 }}>
              <Text style={styles.addressTitle}>Customer Address</Text>
              <Text style={styles.addressText} numberOfLines={2}>
                {userLocation.shortAddress || userLocation.fullAddress || 'Fetching...'}
              </Text>
           </View>
        </View>

        {arrived ? (
          <TouchableOpacity style={styles.actionBtn} onPress={markWorkStarted}>
            <Text style={styles.actionBtnText}>Confirm Arrival & Start Work</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.actionBtn, { flex: 1, backgroundColor: '#4285F4' }]} 
              onPress={() => {
                const url = Platform.select({
                  ios: `maps://app?saddr=${workerLocation.latitude},${workerLocation.longitude}&daddr=${userLocation.latitude},${userLocation.longitude}`,
                  android: `google.navigation:q=${userLocation.latitude},${userLocation.longitude}`
                });
                Linking.openURL(url);
              }}
            >
              <MaterialCommunityIcons name="google-maps" size={20} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.actionBtnText}>Google Maps</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionBtn, { flex: 1, backgroundColor: '#1A1A1A' }]} 
              onPress={() => mapRef.current?.fitToCoordinates([workerLocation, userLocation], { edgePadding: { top: 100, right: 50, bottom: 300, left: 50 }, animated: true })}
            >
              <Ionicons name="refresh" size={20} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.actionBtnText}>Re-center</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#6B7280', fontWeight: '600' },
  map: { flex: 1 },
  backBtn: { position: 'absolute', top: 50, left: 20, width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  workerMarker: { backgroundColor: '#1A1A1A', padding: 8, borderRadius: 20, borderWidth: 2, borderColor: '#FFF' },
  userMarker: { backgroundColor: '#E84545', padding: 8, borderRadius: 20, borderWidth: 2, borderColor: '#FFF' },
  bottomCard: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: 40, elevation: 15 },
  etaRow: { flexDirection: 'row', backgroundColor: '#F8FAFC', borderRadius: 16, padding: 16, marginBottom: 20 },
  etaBox: { flex: 1, alignItems: 'center' },
  etaValue: { fontSize: 18, fontWeight: '800', color: '#1A1A1A' },
  etaLabel: { fontSize: 12, color: '#64748B', marginTop: 2, fontWeight: '600' },
  divider: { width: 1, backgroundColor: '#E2E8F0', marginHorizontal: 10 },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginBottom: 4 },
  addressBox: { flexDirection: 'row', gap: 12, backgroundColor: '#FFF5F5', padding: 16, borderRadius: 16, marginBottom: 20 },
  addressTitle: { fontSize: 12, color: '#64748B', fontWeight: '700', textTransform: 'uppercase' },
  addressText: { fontSize: 15, color: '#1A1A1A', fontWeight: '700', marginTop: 2 },
  actionBtn: { backgroundColor: '#10B981', paddingVertical: 16, borderRadius: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  actionBtnText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  buttonRow: { flexDirection: 'row', gap: 12 },
});

export default WorkerNavigationScreen;
