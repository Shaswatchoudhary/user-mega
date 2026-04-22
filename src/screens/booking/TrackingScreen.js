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
import Geolocation from '@react-native-community/geolocation';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useLocation } from "../../context/LocationContext";
import { colors, spacing, borderRadius, typography } from "../../theme";
import { getFirestore, doc, onSnapshot, updateDoc, addDoc, serverTimestamp, query, collection, where, orderBy, limit, getDoc } from '@react-native-firebase/firestore';
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../constants/config";
import TicketStatusCard from "../../components/booking/TicketStatusCard";
import WorkCompletionPopup from "../../components/booking/WorkCompletionPopup";

const { width, height } = Dimensions.get("window");

// ISSUE 2: REAL DISTANCE LOGIC (Haversine formula)
const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI/180) *
    Math.cos(lat2 * Math.PI/180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const getETA = (distanceKm) => {
  // Average speed 30km/h in city
  const minutes = Math.round((distanceKm / 30) * 60);
  if (minutes < 1) return 'Less than 1 min';
  if (minutes === 1) return '1 min away';
  return `${minutes} mins away`;
};

// ISSUE 3: STATUS TEXT MAPPING
const getStatusDisplay = (status) => {
  const s = status?.toLowerCase();
  switch(s) {
    case 'pending': return { text: 'Pending', color: '#94A3B8' };
    case 'accepted': return { text: 'Accepted', color: '#3B82F6' };
    case 'on_the_way': return { text: 'On the way', color: '#F59E0B' };
    case 'arrived': return { text: 'Worker Arrived', color: '#8B5CF6' };
    case 'working': return { text: 'Work in Progress', color: '#10B981' };
    case 'work_completed': return { text: 'Work Completed', color: '#10B981' };
    case 'completed': return { text: 'Completed', color: '#10B981' };
    default: return { text: 'Processing', color: '#94A3B8' };
  }
};

export default function TrackingScreen({ navigation, route }) {
  const { user } = useAuth();
  const db = getFirestore();
  const mapRef = useRef(null);
  
  const [booking, setBooking] = useState(null);
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  const [workerLoc, setWorkerLoc] = useState(null);
  const [userLoc, setUserLoc] = useState(null);
  const [distanceKm, setDistanceKm] = useState(null);
  const [workerData, setWorkerData] = useState({
    name: "Loading...",
    rating: "0.0",
    serviceType: "Specialist",
    phone: "",
    image: "https://avatar.iran.liara.run/public/job/operator/male"
  });

  // 1. ISSUE 5 & 8: Listen to the booking (Real-time update)
  useEffect(() => {
    const userId = user?._id || user?.uid;
    if (!userId) return;

    // Use bookingId from route if available, otherwise fallback to latest
    const bookingIdFromRoute = route?.params?.bookingId;
    
    if (bookingIdFromRoute) {
      const unsubscribe = onSnapshot(doc(db, 'bookings', bookingIdFromRoute), docSnap => {
        if (docSnap.exists()) {
          const data = { ...docSnap.data(), id: docSnap.id };
          setBooking(data);
          if (data.status === 'work_completed' && !data.userIssue) setShowCompletionPopup(true);
        }
      });
      return () => unsubscribe();
    } else {
      const bookingsCol = collection(db, 'bookings');
      const q = query(
        bookingsCol,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(1)
      );

      const unsubscribe = onSnapshot(q, querySnapshot => {
        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          const data = { ...docSnap.data(), id: docSnap.id };
          setBooking(data);
          if (data.status === 'work_completed' && !data.userIssue) setShowCompletionPopup(true);
        }
      });
      return () => unsubscribe();
    }
  }, [user?._id, user?.uid, route?.params?.bookingId]);

  // 2. ISSUE 4 & 7: Fetch Worker Data
  useEffect(() => {
    if (booking?.workerId) {
      const unsubscribe = onSnapshot(doc(db, 'workers', booking.workerId), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setWorkerData({
            name: data.name || "Assigned Specialist",
            rating: data.rating || "4.9",
            serviceType: data.category || data.serviceType || "Expert",
            phone: data.phone || "",
            image: data.profileImage || "https://avatar.iran.liara.run/public/job/operator/male"
          });
          
          // ISSUE 6: Real-time Worker Location
          if (data.currentLocation) {
            setWorkerLoc(data.currentLocation);
          }
        }
      });
      return () => unsubscribe();
    }
  }, [booking?.workerId]);

  // 3. Get User Location & Calculate Distance
  useEffect(() => {
    const fetchUserLoc = () => {
      Geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserLoc({ latitude, longitude });
        },
        (err) => console.log('Geolocation Error:', err),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    };

    fetchUserLoc();
    const interval = setInterval(fetchUserLoc, 10000); // Update user location every 10s
    return () => clearInterval(interval);
  }, []);

  // 4. Update distance and map bounds when locations change
  useEffect(() => {
    if (userLoc && workerLoc) {
      const dist = getDistanceKm(
        userLoc.latitude, 
        userLoc.longitude, 
        workerLoc.latitude, 
        workerLoc.longitude
      );
      setDistanceKm(dist);

      // Fit map to show both pins
      if (mapRef.current) {
        mapRef.current.fitToCoordinates([userLoc, workerLoc], {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }
    }
  }, [userLoc, workerLoc]);

  const handleCloseTicket = async () => {
    try {
      if (!booking?.id) return;
      const bookingRef = doc(db, 'bookings', booking.id);
      await updateDoc(bookingRef, {
        status: 'completed',
        ticketStatus: 'closed',
        completedAt: serverTimestamp(),
      });
      setShowCompletionPopup(false);
      navigation.navigate('MainTabs', { screen: 'Bookings' });
    } catch (error) {
      Alert.alert("Error", "Could not complete the process.");
    }
  };

  const handleRaiseIssue = async (issueText) => {
    try {
      if (!booking?.id) return;
      
      // 1. Update the booking itself in Firestore
      const bookingRef = doc(db, 'bookings', booking.id);
      await updateDoc(bookingRef, {
        userIssue: issueText,
        issueReportedAt: serverTimestamp()
      });

      // 2. Add to global 'issues' collection in Firestore
      const issuesCol = collection(db, 'issues');
      await addDoc(issuesCol, {
        bookingId: booking.id,
        userId: booking.userId,
        workerId: booking.workerId,
        userName: booking.userName || 'User',
        workerName: workerData.name || 'Worker',
        issueText: issueText,
        status: 'open',
        serviceType: booking.serviceType || 'General',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // 3. SYNC WITH ADMIN PANEL (REST API / MongoDB)
      try {
        await fetch(`${API_BASE_URL}/users/report`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bookingId: booking.id,
            userId: user?._id || user?.uid,
            workerId: booking.workerId,
            userName: booking.userName || user?.name || 'User',
            workerName: workerData.name || 'Worker',
            subject: `Issue with ${booking.serviceType || 'Booking'}`,
            description: issueText,
            priority: 'medium',
            category: booking.serviceType || 'General'
          })
        });
        console.log('[Sync] Issue synced with Admin Panel');
      } catch (syncError) {
        console.error('[Sync] Admin Panel sync failed:', syncError);
      }

      setShowCompletionPopup(false);
      Alert.alert("Issue Reported", "Our team will contact you shortly.");
    } catch (error) {
      console.error("Raise Issue Error:", error);
      Alert.alert("Error", "Could not submit your issue.");
    }
  };

  const statusInfo = getStatusDisplay(booking?.status);

  // ISSUE 7: CALL BUTTON LOGIC
  const callWorker = () => {
    if (workerData.phone) {
      Linking.openURL(`tel:${workerData.phone}`);
    } else {
      Alert.alert("Error", "Worker phone number not available.");
    }
  };

  // Timeline Step Mapping
  const getStepIndex = (status) => {
    const s = status?.toLowerCase();
    const steps = ['accepted', 'on_the_way', 'arrived', 'working', 'work_completed', 'completed'];
    return steps.indexOf(s);
  };
  const currentStep = getStepIndex(booking?.status);

  return (
    <View style={styles.container}>
      {/* Top Status Banner for Working Status */}
      {booking?.status === 'working' && (
        <SafeAreaView style={styles.bannerContainer}>
          <View style={styles.inProgressBanner}>
            <Ionicons name="construct" size={18} color="#FFF" />
            <Text style={styles.bannerText}>Worker is currently working</Text>
          </View>
        </SafeAreaView>
      )}

      {/* ISSUE 1: REAL GOOGLE MAP */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: userLoc?.latitude || 20.5937,
            longitude: userLoc?.longitude || 78.9629,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          {userLoc && (
            <Marker 
              coordinate={userLoc} 
              title="Your Location"
              pinColor="red"
            />
          )}
          {workerLoc && (
            <Marker 
              coordinate={workerLoc} 
              title="Worker"
              pinColor="green"
            />
          )}
        </MapView>
        
        {/* Live Indicator Overlay */}
        <View style={styles.activeBadgeOverlay}>
          <View style={styles.pulseDot} />
          <Text style={styles.activeLabel}>Live Updates</Text>
        </View>
      </View>

      <SafeAreaView style={styles.headerLayer} pointerEvents="box-none">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.title}>Track Order</Text>
            <Text style={[styles.statusSubtitle, { color: statusInfo.color }]}>
              {statusInfo.text}
            </Text>
          </View>
          <TouchableOpacity onPress={callWorker} style={styles.navCallBtn}>
            <Ionicons name="call" size={22} color={colors.accent} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <View style={styles.sheet}>
        <View style={styles.indicator} />
        
        {/* ISSUE 2: REAL DISTANCE / ETA */}
        <View style={styles.etaRow}>
          <View style={styles.etaCircle}>
            <MaterialCommunityIcons name="map-marker-distance" size={26} color={colors.accent} />
          </View>
          <View style={styles.etaTextContent}>
            <Text style={styles.distanceValue}>
              {booking?.status === 'arrived' ? 'Worker Arrived!' : (workerLoc ? (distanceKm < 0.1 ? 'Worker Arrived!' : getETA(distanceKm)) : "On the way...")}
            </Text>
            <Text style={styles.distanceSub}>
              {distanceKm ? `${distanceKm.toFixed(1)} km away` : 'Synchronizing location...'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* ISSUE 4: DYNAMIC WORKER PROFILE */}
        <View style={styles.workerProfile}>
          <Image source={{ uri: workerData.image }} style={styles.avatar} />
          <View style={styles.workerDetails}>
            <Text style={styles.name}>{workerData.name}</Text>
            <View style={styles.row}>
              <Ionicons name="star" size={14} color="#FBBF24" />
              <Text style={styles.rating}>{workerData.rating} ({workerData.serviceType})</Text>
            </View>
          </View>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.chatBtn} onPress={() => Alert.alert("Chat", "Connecting...")}>
              <Ionicons name="chatbubble-ellipses" size={20} color={colors.accent} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.callBtn} onPress={callWorker}>
              <Ionicons name="call" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ISSUE 5: REAL STATUS TIMELINE */}
        <View style={styles.timeline}>
           <View style={styles.timelineInner}>
              <View style={[styles.step, currentStep >= 0 ? styles.stepActive : null]} />
              <View style={[styles.line, currentStep >= 1 ? styles.lineActive : null]} />
              <View style={[styles.step, currentStep >= 1 ? styles.stepActive : null]} />
              <View style={[styles.line, currentStep >= 2 ? styles.lineActive : null]} />
              <View style={[styles.step, currentStep >= 2 ? styles.stepActive : null]} />
              <View style={[styles.line, currentStep >= 3 ? styles.lineActive : null]} />
              <View style={[styles.step, currentStep >= 3 ? styles.stepActive : null]} />
           </View>
           <View style={styles.labelRow}>
              <Text style={[styles.label, currentStep >= 0 && styles.labelActive]}>Accepted</Text>
              <Text style={[styles.label, currentStep >= 1 && styles.labelActive]}>On Way</Text>
              <Text style={[styles.label, currentStep >= 2 && styles.labelActive]}>Arrived</Text>
              <Text style={[styles.label, currentStep >= 3 && styles.labelActive]}>Working</Text>
           </View>
        </View>
      </View>

      <WorkCompletionPopup
        visible={showCompletionPopup}
        workerName={workerData.name}
        onConfirm={handleCloseTicket}
        onRaiseIssue={handleRaiseIssue}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  bannerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  inProgressBanner: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 8,
  },
  bannerText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  mapContainer: {
    height: height * 0.45,
    width: '100%',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  activeBadgeOverlay: {
    position: 'absolute',
    bottom: 60,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  activeLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  headerLayer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  backBtn: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  headerCenter: { alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '800', color: '#111827' },
  statusSubtitle: { fontSize: 12, fontWeight: '700' },
  navCallBtn: { padding: 8 },

  sheet: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    marginTop: -40,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  indicator: {
    width: 40,
    height: 5,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 24,
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  etaCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  etaTextContent: { flex: 1 },
  distanceValue: { fontSize: 22, fontWeight: '900', color: '#111827' },
  distanceSub: { fontSize: 13, color: '#9CA3AF', marginTop: 2, fontWeight: '500' },
  
  divider: { height: 1, backgroundColor: '#F9FAFB', marginVertical: 20 },
  
  workerProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: { width: 56, height: 56, borderRadius: 28 },
  workerDetails: { flex: 1, marginLeft: 16 },
  name: { fontSize: 17, fontWeight: '800', color: '#111827' },
  rating: { fontSize: 12, color: '#6B7280', marginLeft: 4, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  
  actionRow: { flexDirection: 'row', gap: 10 },
  chatBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  callBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center' },

  timeline: { marginTop: 10 },
  timelineInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10 },
  step: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#E5E7EB' },
  stepActive: { backgroundColor: colors.accent, width: 14, height: 14, borderRadius: 7 },
  line: { flex: 1, height: 2, backgroundColor: '#F3F4F6', marginHorizontal: 2 },
  lineActive: { backgroundColor: colors.accent },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  label: { fontSize: 11, color: '#9CA3AF', fontWeight: '700', textTransform: 'uppercase' },
  labelActive: { color: colors.accent }
});
