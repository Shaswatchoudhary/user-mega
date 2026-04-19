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
import { colors, spacing, borderRadius, typography } from "../../theme";
import { getFirestore, doc, onSnapshot, updateDoc, serverTimestamp, query, collection, where, orderBy, limit } from '@react-native-firebase/firestore';
import { useAuth } from "../../context/AuthContext";
import { getUserLocation } from "../../utils/locationHelper";
import TicketStatusCard from "../../components/booking/TicketStatusCard";
import WorkCompletionPopup from "../../components/booking/WorkCompletionPopup";

const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.01;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default function TrackingScreen({ navigation, route }) {
  const mapRef = useRef(null);
  const { selectedLocation, workerLocation: initialWorkerLoc, distance, bookingStatus: localStatus } = useLocation();
  const { user } = useAuth();
  const [eta, setEta] = useState(12);
  const [booking, setBooking] = useState(null);
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  const [workerLoc, setWorkerLoc] = useState(initialWorkerLoc);
  const [userLoc, setUserLocation] = useState(selectedLocation);
  const db = getFirestore();

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

  // Listen to the specific booking and worker location
  useEffect(() => {
    const userId = user?._id || user?.uid;
    if (!userId) return;

    // 1. Get user's own location for the map
    getUserLocation().then(loc => {
      if (loc) setUserLocation(loc);
    });

    // 2. Listen to booking (Modular Query)
    const bookingsCol = collection(db, 'bookings');
    const q = query(
      bookingsCol,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubscribeBooking = onSnapshot(q, querySnapshot => {
      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        const currentBooking = { ...docSnap.data(), id: docSnap.id };
        setBooking(currentBooking);

        // Check for work completion
        if (currentBooking.status === 'work_completed' && currentBooking.ticketStatus === 'open') {
          setShowCompletionPopup(true);
        }

        // 3. Listen to booking document directly for worker location updates
        if (currentBooking.id && currentBooking.status !== 'completed') {
          const bookingRef = doc(db, 'bookings', currentBooking.id);
          const unsubLoc = onSnapshot(bookingRef, (locSnap) => {
            if (locSnap.exists() && locSnap.data().workerLocation) {
              setWorkerLoc(locSnap.data().workerLocation);
            }
          });
          return () => unsubLoc();
        }
      }
    }, error => {
      console.error("Firestore Tracking Error:", error.message);
    });

    return () => unsubscribeBooking();
  }, [user?._id, user?.uid]);

  // Update ETA based on distance
  useEffect(() => {
    if (distance) {
      const estimatedMins = Math.max(1, Math.round(distance * 4));
      setEta(estimatedMins);
    }
  }, [distance]);

  const workerData = {
    name: booking?.workerName || "Assigned Worker",
    rating: booking?.workerRating || "4.8",
    reviews: "100+",
    vehicle: booking?.workerVehicle || "Service Partner",
    image: String(booking?.workerImage || "https://avatar.iran.liara.run/public/job/operator/male"),
    status: booking?.status === 'accepted' ? "Order accepted" :
      booking?.status === 'navigating' ? "On the way" :
        booking?.status === 'arrived' ? "Reached location" :
          booking?.status === 'in_progress' ? "Work in progress" :
            booking?.status === 'work_completed' ? "Work completed" : "Checking status",
    address: booking?.userLocation?.address || "Delivery Location"
  };

  const handleCallPress = () => {
    Linking.openURL(`tel:+919876543210`);
  };

  const handleMessagePress = () => {
    Alert.alert("Opening Chat", "Connecting to your professional...");
  };

  const handleCloseTicket = async () => {
    try {
      if (!booking?.id) return;
      const bookingRef = doc(db, 'bookings', booking.id);

      await updateDoc(bookingRef, {
        ticketStatus: 'closed',
        status: 'completed',
        workEndTime: serverTimestamp(),
        paymentUnlocked: true,
      });

      setShowCompletionPopup(false);

      navigation.replace('Payment', {
        totalAmount: booking.price || 299,
        worker: {
          name: workerData.name,
          image: workerData.image,
          _id: booking.workerId
        },
        bookingId: booking.id,
      });
    } catch (error) {
      Alert.alert("Error", "Could not close ticket. Try again.");
    }
  };

  const handleRaiseIssue = async (issue) => {
    try {
      if (!booking?.id) return;
      const bookingRef = doc(db, 'bookings', booking.id);
      await updateDoc(bookingRef, {
        issue: issue,
        issueReportedAt: serverTimestamp()
      });
      Alert.alert("Issue Reported", "Our team will contact you shortly.");
    } catch (error) {
      Alert.alert("Error", "Could not report issue.");
    }
  };

  const ts = {
    isAccepted: booking?.status === 'accepted' || booking?.status === 'navigating' || booking?.status === 'arrived' || booking?.status === 'in_progress' || booking?.status === 'work_completed',
    isOnTheWay: booking?.status === 'navigating' || booking?.status === 'arrived' || booking?.status === 'in_progress' || booking?.status === 'work_completed',
    isArrived: booking?.status === 'arrived' || booking?.status === 'in_progress' || booking?.status === 'work_completed',
    isInProgress: booking?.status === 'in_progress' || booking?.status === 'work_completed',
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapPlaceholder}>
        <LinearGradient
          colors={[colors.accent + '20', '#FFF']}
          style={styles.placeholderGradient}
        >
          <MaterialCommunityIcons name="map-marker-radius" size={80} color={colors.accent} />
          <Text style={styles.placeholderText}>Worker is on the way to your location</Text>
          <View style={styles.locationBadge}>
            <Ionicons name="location" size={16} color={colors.accent} />
            <Text style={styles.locationBadgeText}>Live Tracking Active</Text>
          </View>
        </LinearGradient>
      </View>

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

      <View style={styles.bottomSheet}>
        <View style={styles.timelineRow}>
          <View style={styles.timelineStep}>
            <View style={[styles.timelineDot, ts.isAccepted ? styles.timelineDotActive : null]} />
            <Text style={styles.timelineLabel}>Accepted</Text>
          </View>
          <View style={[styles.timelineLine, ts.isOnTheWay ? styles.timelineLineActive : null]} />
          <View style={styles.timelineStep}>
            <View style={[styles.timelineDot, ts.isOnTheWay ? styles.timelineDotActive : null]} />
            <Text style={styles.timelineLabel}>On way</Text>
          </View>
          <View style={[styles.timelineLine, ts.isArrived ? styles.timelineLineActive : null]} />
          <View style={styles.timelineStep}>
            <View style={[styles.timelineDot, ts.isArrived ? styles.timelineDotActive : null]} />
            <Text style={styles.timelineLabel}>Arrived</Text>
          </View>
          <View style={[styles.timelineLine, ts.isInProgress ? styles.timelineLineActive : null]} />
          <View style={styles.timelineStep}>
            <View style={[styles.timelineDot, ts.isInProgress ? styles.timelineDotActive : null]} />
            <Text style={styles.timelineLabel}>Working</Text>
          </View>
        </View>

        {booking?.ticketStatus && (
          <TicketStatusCard
            ticketStatus={booking.ticketStatus}
            workStartTime={booking.workStartTime}
            ticketId={booking.ticketId || `#WE${booking.id?.substring(0, 6).toUpperCase()}`}
          />
        )}

        <View style={styles.etaContainer}>
          <View style={styles.etaIconBg}>
            <MaterialCommunityIcons name="clock-time-three" size={24} color={colors.accent} />
          </View>
          <View style={styles.etaInfo}>
            <Text style={styles.etaTimeText}>{eta} mins away</Text>
            <Text style={styles.etaSubText} numberOfLines={2}>
              Professional is moving towards your location
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

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
          onPress={() => Alert.alert("Project Safety", "Our partners are verified and trained.")}
        >
          <Ionicons name="shield-checkmark" size={18} color="#10B981" />
          <Text style={styles.safetyText}>Safety Policy Active</Text>
        </TouchableOpacity>
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
  mapPlaceholder: {
    height: height * 0.45,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'Poppins-Bold',
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 15,
    borderWidth: 1,
    borderColor: colors.accent + '30',
  },
  locationBadgeText: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '600',
    marginLeft: 6,
    fontFamily: 'Poppins-Medium',
  },
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
  timelineLine: { width: width * 0.12, height: 2, backgroundColor: '#EEE', marginTop: -15, marginHorizontal: 2 },
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