import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Alert,
  Platform,
  ActivityIndicator,
  Linking,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

// Kolhapur Coordinates
const KOLHAPUR_COORDINATES = {
  cityCenter: {
    latitude: 16.7050,
    longitude: 74.2433,
  },
  mahalaxmiTemple: {
    latitude: 16.6967,
    longitude: 74.2351,
  },
  rankalaLake: {
    latitude: 16.7067,
    longitude: 74.2349,
  },
  shivajiUniversity: {
    latitude: 16.6819,
    longitude: 74.2497,
  },
};

const MapScreen = ({ navigation, route }) => {
  const mapRef = useRef(null);
  
  const [currentLocation, setCurrentLocation] = useState({
    latitude: KOLHAPUR_COORDINATES.cityCenter.latitude,
    longitude: KOLHAPUR_COORDINATES.cityCenter.longitude,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });
  
  const [customerLocation] = useState({
    latitude: KOLHAPUR_COORDINATES.mahalaxmiTemple.latitude,
    longitude: KOLHAPUR_COORDINATES.mahalaxmiTemple.longitude,
  });
  
  const [distance, setDistance] = useState('1.2 km');
  const [eta, setEta] = useState('8 min');
  const [isNavigating, setIsNavigating] = useState(false);
  const [hasReached, setHasReached] = useState(false);
  const [isTracking, setIsTracking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [showCallOptions, setShowCallOptions] = useState(false);

  const customerPhone = '+91 9579499891';
  const customerAltPhone = '+91 9579499892';

  const routeCoordinates = [
    { latitude: KOLHAPUR_COORDINATES.cityCenter.latitude, longitude: KOLHAPUR_COORDINATES.cityCenter.longitude },
    { latitude: 16.7020, longitude: 74.2410 },
    { latitude: 16.6990, longitude: 74.2390 },
    { latitude: 16.6970, longitude: 74.2370 },
    { latitude: KOLHAPUR_COORDINATES.mahalaxmiTemple.latitude, longitude: KOLHAPUR_COORDINATES.mahalaxmiTemple.longitude },
  ];

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (userLocation) {
      const dist = calculateDistance();
      const time = calculateETA();
      setDistance(dist);
      setEta(time);
    }
  }, [userLocation]);

  const requestLocationPermission = async () => {
    try {
      setLoading(true);
      
      let status;
      if (Platform.OS === 'ios') {
        status = await Geolocation.requestAuthorization('whenInUse');
      } else {
        const granted = await Geolocation.requestAuthorization('whenInUse');
        status = granted;
      }
      
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission',
          'This app needs location access to show your position on the map.',
          [
            { 
              text: 'OK', 
              onPress: () => navigation.goBack() 
            }
          ]
        );
        setLoading(false);
        return;
      }

      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          setCurrentLocation({
            latitude,
            longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          });
          setLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          Alert.alert('Error', 'Unable to get your location.');
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );

    } catch (error) {
      console.error('Error getting location permission:', error);
      Alert.alert('Error', 'Unable to get your location.');
      setLoading(false);
    }
  };

  const calculateDistance = () => {
    if (!userLocation) return '-- km';

    const lat1 = userLocation.latitude;
    const lon1 = userLocation.longitude;
    const lat2 = customerLocation.latitude;
    const lon2 = customerLocation.longitude;

    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distanceKm = R * c;
    
    return distanceKm < 1 
      ? `${Math.round(distanceKm * 1000)} m` 
      : `${distanceKm.toFixed(1)} km`;
  };

  const calculateETA = () => {
    if (!userLocation) return '-- min';

    const lat1 = userLocation.latitude;
    const lon1 = userLocation.longitude;
    const lat2 = customerLocation.latitude;
    const lon2 = customerLocation.longitude;

    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distanceKm = R * c;
    
    const averageSpeed = 20;
    const timeHours = distanceKm / averageSpeed;
    const timeMinutes = Math.max(1, Math.round(timeHours * 60));
    
    return `${timeMinutes} min`;
  };

  const handleStartNavigation = () => {
    setIsNavigating(true);
    Alert.alert('Navigation Started', 'Follow the route to reach the customer in Kolhapur.');
    
    if (userLocation && mapRef.current) {
      mapRef.current.fitToCoordinates(routeCoordinates, {
        edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
        animated: true,
      });
    }
  };

  const handleReachedLocation = () => {
    setHasReached(true);
    setIsNavigating(false);
    Alert.alert('Arrived', 'You have reached the customer location in Kolhapur.', [
      { text: 'OK', onPress: () => console.log('Arrived confirmed') }
    ]);
  };

  const handleCallCustomer = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {
      Alert.alert('Error', 'Could not make call. Please check your device.');
    });
  };

  const showCallMenu = () => {
    setShowCallOptions(!showCallOptions);
  };

  const handleStartWork = () => {
    navigation.navigate('WorkScreen');
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleFocusLocation = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: LATITUDE_DELTA * 0.5,
        longitudeDelta: LONGITUDE_DELTA * 0.5,
      }, 1000);
    }
  };

  const handleMessageCustomer = () => {
    Linking.openURL(`sms:${customerPhone}`).catch(err => {
      Alert.alert('Error', 'Could not open messaging app.');
    });
  };

  const handleWhatsAppCustomer = () => {
    Linking.openURL(`whatsapp://send?phone=${customerPhone}`).catch(err => {
      Alert.alert('Error', 'WhatsApp is not installed on your device.');
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#E84545" />
        <LinearGradient
          colors={['#E84545', '#1A1A1A']}
          style={styles.loadingGradient}
        >
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Loading Kolhapur Map...</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#E84545" />

      {/* Header */}
      <LinearGradient
        colors={['#E84545', '#1A1A1A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Navigate in Kolhapur</Text>
        <TouchableOpacity style={styles.locationButton} onPress={handleFocusLocation}>
          <Ionicons name="locate" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Map View */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={currentLocation}
          showsUserLocation={true}
          followsUserLocation={isTracking}
          showsMyLocationButton={false}
          showsCompass={true}
          zoomEnabled={true}
          rotateEnabled={true}
          scrollEnabled={true}
        >
          {/* Customer Location Marker */}
          <Marker
            coordinate={customerLocation}
            title="Customer Location"
            description="Kolhapur - Pipe Repair"
          >
            <View style={styles.customerMarker}>
              <MaterialCommunityIcons name="home-map-marker" size={24} color="#FFFFFF" />
            </View>
          </Marker>

          {/* Additional Kolhapur Landmarks */}
          <Marker
            coordinate={KOLHAPUR_COORDINATES.rankalaLake}
            title="Rankala Lake"
            description="Popular tourist spot"
          >
            <View style={styles.landmarkMarker}>
              <Ionicons name="water" size={20} color="#3B82F6" />
            </View>
          </Marker>

          <Marker
            coordinate={KOLHAPUR_COORDINATES.shivajiUniversity}
            title="Shivaji University"
            description="University Campus"
          >
            <View style={styles.landmarkMarker}>
              <Ionicons name="school" size={20} color="#8B5CF6" />
            </View>
          </Marker>

          {/* Route Line */}
          {isNavigating && (
            <Polyline
              coordinates={routeCoordinates}
              strokeWidth={4}
              strokeColor="#E84545"
              lineDashPattern={[10, 10]}
            />
          )}
        </MapView>

        {/* Distance & ETA Overlay */}
        <View style={styles.distanceOverlay}>
          <LinearGradient
            colors={['#E84545', '#1A1A1A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.distanceCard}
          >
            <View style={styles.distanceInfo}>
              <View style={styles.distanceItem}>
                <Ionicons name="navigate" size={20} color="#FFFFFF" />
                <Text style={styles.distanceLabel}>Distance</Text>
                <Text style={styles.distanceValue}>{distance}</Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.distanceItem}>
                <Ionicons name="time" size={20} color="#FFFFFF" />
                <Text style={styles.distanceLabel}>ETA</Text>
                <Text style={styles.distanceValue}>{eta}</Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.distanceItem}>
                <Ionicons name="pin" size={20} color="#FFFFFF" />
                <Text style={styles.distanceLabel}>Location</Text>
                <Text style={styles.distanceValue}>Kolhapur</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      </View>

      {/* Customer Info Card */}
      <View style={styles.customerCard}>
        <View style={styles.customerHeader}>
          <View style={styles.customerAvatar}>
            <Text style={styles.avatarText}>RS</Text>
          </View>
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>Rahul Sharma</Text>
            <Text style={styles.jobTitle}>Pipe Repair</Text>
            <View style={styles.addressRow}>
              <Ionicons name="location" size={14} color="#6B7280" />
              <Text style={styles.addressText}>Near Mahalaxmi Temple, Kolhapur</Text>
            </View>
            <View style={styles.phoneRow}>
              <Ionicons name="call" size={12} color="#6B7280" />
              <Text style={styles.phoneText}>{customerPhone}</Text>
            </View>
          </View>
          
          {/* Call Button with Options */}
          <View style={styles.communicationContainer}>
            <TouchableOpacity style={styles.callMainButton} onPress={showCallMenu}>
              <LinearGradient
                colors={['#E84545', '#1A1A1A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.callButtonGradient}
              >
                <Ionicons name="call" size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
            
            {showCallOptions && (
              <View style={styles.callOptionsMenu}>
                <TouchableOpacity 
                  style={styles.callOption} 
                  onPress={() => {
                    handleCallCustomer(customerPhone);
                    setShowCallOptions(false);
                  }}
                >
                  <Ionicons name="call" size={18} color="#E84545" />
                  <Text style={styles.callOptionText}>Call Primary</Text>
                </TouchableOpacity>
                
                <View style={styles.optionDivider} />
                
                <TouchableOpacity 
                  style={styles.callOption} 
                  onPress={() => {
                    handleCallCustomer(customerAltPhone);
                    setShowCallOptions(false);
                  }}
                >
                  <Ionicons name="call" size={18} color="#E84545" />
                  <Text style={styles.callOptionText}>Call Alternate</Text>
                </TouchableOpacity>
                
                <View style={styles.optionDivider} />
                
                <TouchableOpacity 
                  style={styles.callOption} 
                  onPress={() => {
                    handleMessageCustomer();
                    setShowCallOptions(false);
                  }}
                >
                  <Ionicons name="chatbubble" size={18} color="#E84545" />
                  <Text style={styles.callOptionText}>Send SMS</Text>
                </TouchableOpacity>
                
                <View style={styles.optionDivider} />
                
                <TouchableOpacity 
                  style={styles.callOption} 
                  onPress={() => {
                    handleWhatsAppCustomer();
                    setShowCallOptions(false);
                  }}
                >
                  <MaterialCommunityIcons name="whatsapp" size={18} color="#25D366" />
                  <Text style={styles.callOptionText}>WhatsApp</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        {!hasReached ? (
          <TouchableOpacity 
            style={styles.navigateButton} 
            onPress={isNavigating ? undefined : handleStartNavigation}
            disabled={isNavigating}
          >
            <LinearGradient
              colors={['#E84545', '#1A1A1A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.navigateButtonGradient, isNavigating && styles.disabledButton]}
            >
              <Ionicons name={isNavigating ? "navigate" : "navigate-outline"} size={24} color="#FFFFFF" />
              <Text style={styles.navigateButtonText}>
                {isNavigating ? 'Navigating...' : 'Start Navigation'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.reachedButton} onPress={handleStartWork}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.reachedButtonGradient}
            >
              <MaterialCommunityIcons name="hammer-wrench" size={24} color="#FFFFFF" />
              <Text style={styles.reachedButtonText}>Start Work</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {!hasReached && (
          <TouchableOpacity 
            style={styles.reachedButton} 
            onPress={handleReachedLocation}
            disabled={!isNavigating}
          >
            <LinearGradient
              colors={['#E84545', '#1A1A1A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.reachedButtonGradient, !isNavigating && styles.disabledButton]}
            >
              <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
              <Text style={styles.reachedButtonText}>I've Reached</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      {/* Map Controls */}
      {/* <View style={styles.mapControls}>
        <TouchableOpacity 
          style={styles.mapControlButton} 
          onPress={() => setIsTracking(!isTracking)}
        >
          <LinearGradient
            colors={isTracking ? ['#E84545', '#1A1A1A'] : ['#6B7280', '#4B5563']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.mapControlGradient}
          >
            <Ionicons name={isTracking ? "locate" : "locate-outline"} size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  locationButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  customerMarker: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E84545',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  landmarkMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E84545',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  distanceOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
  },
  distanceCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  distanceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distanceItem: {
    alignItems: 'center',
    flex: 1,
  },
  distanceLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  distanceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  customerCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    position: 'relative',
  },
  customerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E84545',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  jobTitle: {
    fontSize: 14,
    color: '#E84545',
    fontWeight: '600',
    marginBottom: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  addressText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  phoneText: {
  fontSize: 12,
  color: '#374151',
  fontWeight: '500',
},
communicationContainer: {
  alignItems: 'center',
  position: 'relative',
  zIndex: 9999, // Add this
},
callMainButton: {
  borderRadius: 20,
  overflow: 'hidden',
  zIndex: 10000, // Add this
},
callButtonGradient: {
  width: 40,
  height: 40,
  borderRadius: 20,
  justifyContent: 'center',
  alignItems: 'center',
},
callOptionsMenu: {
  position: 'absolute',
  bottom: 50, // Changed from top: 50 to bottom: 50
  right: 0,
  backgroundColor: '#FFFFFF',
  borderRadius: 12,
  paddingVertical: 8,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3, // Increased from 0.2
  shadowRadius: 12, // Increased from 8
  elevation: 10, // Increased from 5
  zIndex: 9999,
  minWidth: 180, // Increased from 160
  borderWidth: 1,
  borderColor: '#E5E7EB',
},
callOption: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
  paddingHorizontal: 16,
  paddingVertical: 14, // Increased from 12
},
callOptionText: {
  fontSize: 14,
  color: '#374151',
  fontWeight: '500',
  flex: 1,
},
  optionDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 12,
  },
  actionContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  navigateButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  navigateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  disabledButton: {
    opacity: 0.7,
  },
  navigateButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reachedButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  reachedButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  reachedButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  mapControls: {
    position: 'absolute',
    bottom: 180,
    right: 16,
  },
  mapControlButton: {
    marginBottom: 12,
  },
  mapControlGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  landmarkMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E84545',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
});

export default MapScreen;