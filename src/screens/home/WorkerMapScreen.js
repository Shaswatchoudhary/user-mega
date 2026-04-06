import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Circle } from 'react-native-maps';
import firestore from '@react-native-firebase/firestore';
import { useLocation } from '../../context/LocationContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

// Haversine formula to calculate distance between two points in km
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

export default function WorkerMapScreen({ navigation }) {
  const { selectedLocation } = useLocation();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const mapRef = useRef(null);

  const userCoords = selectedLocation?.coords || {
    latitude: 16.7050,
    longitude: 74.2433,
  };

  useEffect(() => {
    // 1. Real-time listener for active & available workers
    const unsubscribe = firestore()
      .collection('workers')
      .where('isActive', '==', true)
      .where('isAvailable', '==', true)
      .onSnapshot(
        (querySnapshot) => {
          const allWorkers = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            const distance = getDistance(
              userCoords.latitude,
              userCoords.longitude,
              data.location.lat,
              data.location.lng
            );

            // 2. Filter only workers within 5km radius
            if (distance <= 5) {
              allWorkers.push({
                id: doc.id,
                ...data,
                distance: distance.toFixed(1),
              });
            }
          });
          setWorkers(allWorkers);
          setLoading(false);
        },
        (error) => {
          console.error('Firestore Map Error:', error);
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, [userCoords.latitude, userCoords.longitude]);

  const handleMarkerPress = (worker) => {
    setSelectedWorker(worker);
    // Animate map to worker
    mapRef.current?.animateToRegion({
      latitude: worker.location.lat - 0.002, // Offset slightly to show card at bottom
      longitude: worker.location.lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 500);
  };

  const handleBookNow = () => {
    if (selectedWorker) {
      navigation.navigate('BookingSummary', { worker: selectedWorker });
    }
  };

  const getServiceIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'electrician': return 'lightning-bolt';
      case 'plumber': return 'pipe-wrench';
      case 'carpenter': return 'hammer-screwdriver';
      case 'cleaner': return 'broom';
      case 'ac repair': return 'air-conditioner';
      default: return 'tools';
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          ...userCoords,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {/* Radius Circle (5km) */}
        <Circle
          center={userCoords}
          radius={5000} // in meters
          fillColor="rgba(79, 70, 229, 0.05)"
          strokeColor="rgba(79, 70, 229, 0.2)"
          strokeWidth={2}
        />

        {/* Worker Markers */}
        {workers.map((worker) => (
          <Marker
            key={worker.id}
            coordinate={{
              latitude: worker.location.lat,
              longitude: worker.location.lng,
            }}
            onPress={() => handleMarkerPress(worker)}
          >
            <View style={styles.customMarker}>
              <View style={styles.markerInner}>
                <MaterialCommunityIcons 
                  name={getServiceIcon(worker.serviceType)} 
                  size={20} 
                  color="#FFF" 
                />
              </View>
              <View style={styles.markerArrow} />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Header Overlay */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Nearby Workers</Text>
          <Text style={styles.headerSubtitle}>
            {workers.length} professionals within 5km
          </Text>
        </View>
      </View>

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      )}

      {/* Worker Card (Bottom Sheet) */}
      {selectedWorker && (
        <View style={styles.workerCard}>
          <TouchableOpacity 
            style={styles.closeCard} 
            onPress={() => setSelectedWorker(null)}
          >
            <Ionicons name="close" size={20} color="#666" />
          </TouchableOpacity>

          <View style={styles.cardHeader}>
            <Image 
              source={{ uri: selectedWorker.profilePhoto }} 
              style={styles.workerImage} 
            />
            <View style={styles.workerInfo}>
              <Text style={styles.workerName}>{selectedWorker.name}</Text>
              <Text style={styles.workerService}>{selectedWorker.serviceType}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={16} color="#F59E0B" />
                <Text style={styles.ratingText}>{selectedWorker.rating}</Text>
                <Text style={styles.distanceText}> • {selectedWorker.distance} km away</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.bookButton} 
            onPress={handleBookNow}
          >
            <Text style={styles.bookButtonText}>Book Now</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  customMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#4F46E5',
    transform: [{ rotate: '180deg' }],
    marginTop: -2,
  },
  workerCard: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  closeCard: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  workerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  workerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  workerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  workerService: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginLeft: 4,
  },
  distanceText: {
    fontSize: 14,
    color: '#666',
  },
  bookButton: {
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    gap: 8,
  },
  bookButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
