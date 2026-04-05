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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useLocation } from "../../context/LocationContext";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";

const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.01;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

// MANDATORY STATIC DEMO DATA
const DEMO_REGION = {
  latitude: 16.7050,
  longitude: 74.2433,
  latitudeDelta: LATITUDE_DELTA,
  longitudeDelta: LONGITUDE_DELTA,
};

const DEMO_USER_COORDS = {
  latitude: 16.7050,
  longitude: 74.2433,
};

const DEMO_WORKER_COORDS = {
  latitude: 16.7065,
  longitude: 74.2450,
};

export default function TrackingScreen({ navigation }) {
  const mapRef = useRef(null);
  const { selectedLocation, distance } = useLocation();

  const workerData = {
    name: "Vaibhav Jain",
    rating: "4.9",
    reviews: "125",
    vehicle: "Honda Civic - ABC 123",
    image: "https://plus.unsplash.com/premium_photo-1738592736106-a17b897c0ab1?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8cHJvZmlsZSUyMGltYWdlJTIwZGVsaXZlcnl8ZW58MHx8MHx8fDA%3D",
    eta: `12 Mins`,
    progress: 30,
    address: selectedLocation?.address || "Ruikar Colony, Kolhapur"
  };

  const serviceType = "Plumbing Repair";

  const handleCallPress = () => {
    Alert.alert(
      "Call Worker",
      `Do you want to call ${workerData.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Call",
          onPress: () => {
            Linking.openURL(`tel:+919876543210`);
          },
        },
      ]
    );
  };

  const handleMessagePress = () => {
    Alert.alert(
      "Message Worker",
      `Do you want to send a message to ${workerData.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Message",
          onPress: () => {
            Alert.alert("Opening Chat...", "Connecting to messaging");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.innerContainer}>
        {/* Static Map View - FIXED REGION TO PREVENT CRASH */}
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={DEMO_REGION}
            showsUserLocation={false}
            showsMyLocationButton={false}
            showsCompass={true}
            zoomEnabled={true}
            rotateEnabled={true}
            scrollEnabled={true}
          >
            {/* Demo User Marker */}
            <Marker
              coordinate={DEMO_USER_COORDS}
              title="Your Location"
              description="Booking Destination"
              pinColor="#4F46E5"
            >
              <View style={styles.userMarker}>
                <View style={styles.userMarkerInner}>
                  <Ionicons name="home" size={20} color="#FFFFFF" />
                </View>
              </View>
            </Marker>

            {/* Demo Worker Marker */}
            <Marker
              coordinate={DEMO_WORKER_COORDS}
              title={workerData.name}
              description="Service Professional"
            >
              <View style={styles.workerMarker}>
                <View style={styles.workerMarkerInner}>
                  <MaterialCommunityIcons name="tools" size={20} color="#FFFFFF" />
                </View>
              </View>
            </Marker>
          </MapView>
        </View>

        {/* Content Overlay */}
        <View style={styles.contentOverlay}>
          {/* Top App Bar */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack?.()}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Live Tracking</Text>
            <View style={styles.headerRight} />
          </View>

          {/* Location Indicator */}
          <View style={styles.locationIndicator}>
            <Text style={styles.locationText}>
              📍 Serving {selectedLocation?.name || "Kolhapur"}
            </Text>
          </View>

          {/* ETA and Map Controls */}
          <View style={styles.middleContent}>
            {/* ETA Card */}
            <View style={styles.etaCard}>
              <Text style={styles.etaTitle}>Your Pro is on the way!</Text>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `30%` }]} />
              </View>
              <Text style={styles.etaText}>
                Arriving in <Text style={styles.etaBold}>12 Mins</Text>
              </Text>
              <Text style={styles.addressText}>
                📍 {workerData.address}
              </Text>

              {/* UX Fallback Text */}
              <View style={styles.fallbackContainer}>
                <Ionicons name="information-circle-outline" size={16} color="#6B7280" />
                <Text style={styles.fallbackText}>Live tracking will be enabled soon</Text>
              </View>
            </View>

            {/* Map Controls - STUBBED FOR STABILITY */}
            <View style={styles.mapControls}>
              <View style={styles.zoomControls}>
                <TouchableOpacity
                  style={styles.zoomButtonTop}
                  onPress={() => { }} // No-op
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={24} color="#D1D5DB" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.zoomButtonBottom}
                  onPress={() => { }} // No-op
                  activeOpacity={0.7}
                >
                  <Ionicons name="remove" size={24} color="#D1D5DB" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.locationButton}
                onPress={() => { }} // No-op
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#D1D5DB" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom Sheet Worker Info */}
          <View style={styles.bottomSheet}>
            {/* Handle */}
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>

            {/* Worker Details */}
            <View style={styles.workerDetailsContainer}>
              <Image
                source={{ uri: workerData.image }}
                style={styles.workerImage}
              />
              <View style={styles.workerInfo}>
                <Text style={styles.workerName}>{workerData.name}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={16} color="#F59E0B" />
                  <Text style={styles.ratingText}>
                    {workerData.rating}{" "}
                    <Text style={styles.reviewsText}>({workerData.reviews} reviews)</Text>
                  </Text>
                </View>
                <Text style={styles.vehicleText}>{workerData.vehicle}</Text>
                <Text style={styles.workerLocationText}>📍 Serving Kolhapur Area</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.messageButton}
                onPress={handleMessagePress}
                activeOpacity={0.7}
              >
                <Ionicons name="chatbubble" size={20} color="#4F46E5" />
                <Text style={styles.messageButtonText}>Message</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.callButton}
                onPress={handleCallPress}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={["#4F46E5", "#4338CA"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.callButtonGradient}
                >
                  <Ionicons name="call" size={20} color="#FFFFFF" />
                  <Text style={styles.callButtonText}>Call</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  innerContainer: {
    flex: 1,
    position: "relative",
  },
  mapContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  userMarker: {
    alignItems: "center",
    justifyContent: "center",
  },
  userMarkerInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  workerMarker: {
    alignItems: "center",
    justifyContent: "center",
  },
  workerMarkerInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  landmarkMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  contentOverlay: {
    flex: 1,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(249, 250, 251, 0.9)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(229, 231, 235, 0.7)",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
    textAlign: "center",
  },
  locationButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  locationIndicator: {
    alignItems: "center",
    paddingVertical: 6,
    backgroundColor: "rgba(249, 250, 251, 0.8)",
  },
  locationText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  middleContent: {
    flex: 1,
    justifyContent: "space-between",
    padding: 16,
  },
  etaCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  etaTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4F46E5",
    marginBottom: 8,
  },
  addressText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 6,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    marginVertical: 12,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#4F46E5",
    borderRadius: 4,
  },
  etaText: {
    fontSize: 14,
    color: "#6B7280",
  },
  etaBold: {
    fontWeight: "700",
    color: "#1F2937",
  },
  mapControls: {
    alignItems: "flex-end",
    gap: 12,
  },
  zoomControls: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  zoomButtonTop: {
    width: 44,
    height: 44,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  zoomButtonBottom: {
    width: 44,
    height: 44,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    borderTopWidth: 0.5,
    borderTopColor: "#E5E7EB",
  },
  bottomSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  handleContainer: {
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 6,
    backgroundColor: "#D1D5DB",
    borderRadius: 3,
  },
  workerDetailsContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 16,
  },
  workerImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "#4F46E5",
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  reviewsText: {
    fontWeight: "400",
    color: "#6B7280",
  },
  vehicleText: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  workerLocationText: {
    fontSize: 12,
    color: "#4F46E5",
    fontWeight: "500",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 16,
  },
  messageButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    backgroundColor: "rgba(79, 70, 229, 0.1)",
    borderRadius: 12,
  },
  messageButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#4F46E5",
  },
  callButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  callButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
  },
  callButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  fallbackContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  fallbackText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
});