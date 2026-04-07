import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Linking,
  Dimensions,
  Platform,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useLocation } from "../../context/LocationContext";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { colors, spacing, borderRadius, typography } from "../../theme";

const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.01;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default function TrackingScreen({ navigation }) {
  const mapRef = useRef(null);
  const { selectedLocation, workerLocation, distance, bookingStatus } = useLocation();
  const [eta, setEta] = useState(12);

  // Animated pulse for worker marker
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.5, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Update ETA based on distance
  useEffect(() => {
    if (distance) {
      const estimatedMins = Math.max(1, Math.round(distance * 4)); // approx 4 mins per km
      setEta(estimatedMins);
    }
  }, [distance]);

  const workerData = {
    name: "Vaibhav Jain",
    rating: "4.9",
    reviews: "125",
    vehicle: "Honda Civic - ABC 123",
    image: "https://avatar.iran.liara.run/public/job/operator/male", // Generic placeholder
    status: bookingStatus === 'arrived' ? "Reached location" : "On the way",
    address: selectedLocation?.addressText || "Ruikar Colony, Kolhapur"
  };

  const handleCallPress = () => {
    Linking.openURL(`tel:+919876543210`);
  };

  const handleMessagePress = () => {
    Alert.alert("Opening Chat", "Connecting to your professional...");
  };

  return (
    <View style={styles.container}>
      {/* 📍 Map Layer */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: selectedLocation?.latitude || 16.7050,
          longitude: selectedLocation?.longitude || 74.2433,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }}
        region={{
          latitude: (workerLocation.latitude + (selectedLocation?.latitude || 16.7050)) / 2,
          longitude: (workerLocation.longitude + (selectedLocation?.longitude || 74.2433)) / 2,
          latitudeDelta: Math.abs(workerLocation.latitude - (selectedLocation?.latitude || 16.7050)) * 2,
          longitudeDelta: Math.abs(workerLocation.longitude - (selectedLocation?.longitude || 74.2433)) * 2,
        }}
      >
        {/* User Marker */}
        <Marker coordinate={{
          latitude: selectedLocation?.latitude || 16.7050,
          longitude: selectedLocation?.longitude || 74.2433
        }}>
          <View style={styles.userMarkerContainer}>
            <View style={styles.userMarker}>
              <Ionicons name="home" size={16} color="#FFF" />
            </View>
            <View style={styles.markerPointer} />
          </View>
        </Marker>

        {/* Worker Marker */}
        <Marker coordinate={workerLocation}>
          <View style={styles.workerMarkerContainer}>
            <Animated.View style={[styles.workerPulse, { transform: [{ scale: pulseAnim }] }]} />
            <View style={styles.workerMarker}>
              <MaterialCommunityIcons name="tools" size={20} color="#FFF" />
            </View>
          </View>
        </Marker>

        {/* Route Line */}
        <Polyline
          coordinates={[
            workerLocation,
            { latitude: selectedLocation?.latitude || 16.7050, longitude: selectedLocation?.longitude || 74.2433 }
          ]}
          strokeColor={colors.accent}
          strokeWidth={3}
          lineDashPattern={[5, 5]}
        />
      </MapView>

      {/* 🔝 Floating Header */}
      <SafeAreaView style={styles.headerOverlay} pointerEvents="box-none">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Live Tracking</Text>
            <Text style={styles.headerStatus}>{workerData.status}</Text>
          </View>
          <View style={{ width: 44 }} />
        </View>
      </SafeAreaView>

      {/* 📦 Swiggy/Zomato Style Tracking Card */}
      <View style={styles.bottomSheet}>
        {/* Progress Timeline */}
        <View style={styles.timelineRow}>
          <View style={styles.timelineStep}>
            <View style={[styles.timelineDot, styles.timelineDotActive]} />
            <Text style={styles.timelineLabel}>Accepted</Text>
          </View>
          <View style={[styles.timelineLine, bookingStatus === 'on_the_way' || bookingStatus === 'arrived' ? styles.timelineLineActive : null]} />
          <View style={styles.timelineStep}>
            <View style={[styles.timelineDot, bookingStatus === 'on_the_way' || bookingStatus === 'arrived' ? styles.timelineDotActive : null]} />
            <Text style={styles.timelineLabel}>On the way</Text>
          </View>
          <View style={[styles.timelineLine, bookingStatus === 'arrived' ? styles.timelineLineActive : null]} />
          <View style={styles.timelineStep}>
            <View style={[styles.timelineDot, bookingStatus === 'arrived' ? styles.timelineDotActive : null]} />
            <Text style={styles.timelineLabel}>Arrived</Text>
          </View>
        </View>

        <View style={styles.etaContainer}>
          <View style={styles.etaIconBg}>
            <MaterialCommunityIcons name="clock-time-three" size={24} color={colors.accent} />
          </View>
          <View style={styles.etaInfo}>
            <Text style={styles.etaTimeText}>{eta} mins away</Text>
            <Text style={styles.etaSubText}>Arriving at {workerData.address}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Worker Details Row */}
        <View style={styles.workerRow}>
          <Image source={{ uri: workerData.image }} style={styles.workerAvatar} />
          <View style={styles.workerInfo}>
            <Text style={styles.workerName}>{workerData.name}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.ratingText}>{workerData.rating} ({workerData.reviews} reviews)</Text>
            </View>
            <Text style={styles.vehicleText}>{workerData.vehicle}</Text>
          </View>
          <View style={styles.contactRow}>
            <TouchableOpacity onPress={handleMessagePress} style={styles.iconCircle}>
              <Ionicons name="chatbubble-ellipses" size={20} color={colors.accent} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCallPress} style={[styles.iconCircle, styles.callIcon]}>
              <Ionicons name="call" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.safetyButton}
          onPress={() => Alert.alert("24/7 Support", "Connecting to safety helpline...")}
        >
          <Ionicons name="shield-checkmark" size={18} color="#10B981" />
          <Text style={styles.safetyText}>Project Safety Policy Active</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  map: { flex: 1 },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  backButton: {
    padding: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  headerInfo: { alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', fontFamily: 'Poppins-Bold' },
  headerStatus: { fontSize: 12, color: colors.accent, fontWeight: '600' },
  
  // Custom Markers
  userMarkerContainer: { alignItems: 'center', justifyContent: 'center' },
  userMarker: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: '#4F46E5',
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFF'
  },
  markerPointer: {
    width: 0, height: 0, borderLeftWidth: 6, borderRightWidth: 6,
    borderTopWidth: 8, borderLeftColor: 'transparent',
    borderRightColor: 'transparent', borderTopColor: '#4F46E5', marginTop: -2
  },
  workerMarkerContainer: { alignItems: 'center', justifyContent: 'center' },
  workerMarker: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#FFF', elevation: 5
  },
  workerPulse: {
    position: 'absolute', width: 60, height: 60, borderRadius: 30,
    backgroundColor: 'rgba(232, 69, 69, 0.2)'
  },

  // Bottom Sheet
  bottomSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 44 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  timelineRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, justifyContent: 'center' },
  timelineStep: { alignItems: 'center' },
  timelineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#DDD', marginBottom: 6 },
  timelineDotActive: { backgroundColor: colors.accent },
  timelineLabel: { fontSize: 10, color: '#666', fontFamily: 'Poppins-Medium' },
  timelineLine: { width: width * 0.2, height: 2, backgroundColor: '#EEE', marginTop: -15, marginHorizontal: 4 },
  timelineLineActive: { backgroundColor: colors.accent },

  etaContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  etaIconBg: {
    width: 48, height: 48, borderRadius: 12, backgroundColor: '#FFF0F0',
    alignItems: 'center', justifyContent: 'center', marginRight: 16
  },
  etaInfo: { flex: 1 },
  etaTimeText: { fontSize: 20, fontWeight: '800', color: '#1A1A1A', fontFamily: 'Poppins-Bold' },
  etaSubText: { fontSize: 13, color: '#666', fontFamily: 'Poppins-Regular' },

  divider: { height: 1, backgroundColor: '#F0F0F0', marginBottom: 20 },

  workerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  workerAvatar: { width: 56, height: 56, borderRadius: 28, marginRight: 16 },
  workerInfo: { flex: 1 },
  workerName: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', fontFamily: 'Poppins-Bold' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  ratingText: { fontSize: 12, color: '#666', marginLeft: 4 },
  vehicleText: { fontSize: 11, color: '#999', marginTop: 2 },

  contactRow: { flexDirection: 'row', gap: 12 },
  iconCircle: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#F5F5F5',
    alignItems: 'center', justifyContent: 'center'
  },
  callIcon: { backgroundColor: '#10B981' },

  safetyButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F0FDF4', paddingVertical: 10, borderRadius: 12, gap: 8
  },
  safetyText: { fontSize: 12, fontWeight: '600', color: '#10B981', fontFamily: 'Poppins-Medium' },
});