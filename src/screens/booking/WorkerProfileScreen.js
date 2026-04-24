import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { Rating, Button, Badge } from '../../components/common';
import { colors, typography, spacing, borderRadius } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const WorkerProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { worker } = route.params;
  const { user } = useAuth();
  const { selectedLocation } = useLocation();

  const [selectedServices, setSelectedServices] = useState([]);
  const [showFullBio, setShowFullBio] = useState(false);

  // Use services from worker or defaults
  const services = useMemo(() => worker.services || [
    { id: '1', name: worker.serviceType || 'Standard Service', price: worker.rate || 249, duration: 60 },
    { id: '2', name: `${worker.serviceType || 'Service'} - Premium`, price: (worker.rate || 249) + 150, duration: 90 },
  ], [worker]);

  const handleServiceToggle = (service) => {
    setSelectedServices([service]);
  };

  const handleBookNow = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to book a service.');
      return;
    }

    if (!selectedLocation || (!selectedLocation.latitude && !selectedLocation.coords?.latitude)) {
      Alert.alert('Location Required', 'Please select your service address first.');
      return;
    }

    const selectedService = selectedServices.length > 0 ? selectedServices[0] : services[0];

    try {
      // Create a booking document in Firestore
      const bookingData = {
        userId: user?.uid || user?._id || 'unknown',
        workerId: worker?.id || worker?._id || 'unknown',
        workerName: worker?.fullName || worker?.name || 'Professional',
        serviceType: worker?.serviceType || 'Service',
        selectedServiceName: selectedService?.name || 'Standard Service',
        price: selectedService?.price || 249,
        status: 'pending',
        userName: user?.displayName || user?.name || 'Customer',
        userLocation: {
          flat: selectedLocation?.flat || '',
          wing: selectedLocation?.wing || '',
          landmark: selectedLocation?.landmark || '',
          addressType: selectedLocation?.addressType || 'Home',
          shortAddress: selectedLocation?.shortAddress || selectedLocation?.name || '',
          fullAddress: selectedLocation?.fullAddress || selectedLocation?.addressText || selectedLocation?.address || '',
          displayAddress: selectedLocation?.displayAddress || selectedLocation?.addressText || '',
          latitude: selectedLocation?.latitude || selectedLocation?.coords?.latitude || null,
          longitude: selectedLocation?.longitude || selectedLocation?.coords?.longitude || null,
        },
        userAddress: selectedLocation?.displayAddress || selectedLocation?.fullAddress || selectedLocation?.address || '',
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };

      // Remove undefined/null fields before saving
      const cleanBookingData = Object.fromEntries(
        Object.entries(bookingData).filter(([_, v]) => v !== undefined && v !== null)
      );

      const bookingRef = await firestore().collection('bookings').add(cleanBookingData);

      // Temporary update to worker's availability if needed
      await firestore().collection('workers').doc(worker.id || worker._id).update({
        isAvailable: false,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

      // Navigate to the payment screen
      navigation.navigate('Payment', {
        bookingId: bookingRef.id,
        worker: worker,
        totalAmount: selectedService?.price || 249,
        selectedServices: [selectedService],
        selectedDate: new Date().toLocaleDateString(),
        isPrePayment: true
      });

    } catch (error) {
      console.error('Booking creation error:', error);
      Alert.alert('Booking Failed', 'Something went wrong. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Image 
            source={{ uri: worker.photo || worker.image || 'https://avatar.iran.liara.run/public/job/operator/male' }} 
            style={styles.heroImage} 
          />
          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.7)', '#FFFFFF']}
            style={styles.heroGradient}
          />
          <SafeAreaView style={styles.heroHeader} edges={['top']}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        {/* Worker Info */}
        <View style={styles.infoSection}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{worker.fullName || worker.name}</Text>
            <Badge text="Verified" variant="success" style={styles.verifiedBadge} />
          </View>
          <Text style={styles.category}>{worker.serviceType || worker.category}</Text>

          <View style={styles.statsRow}>
            <Rating rating={worker.rating || 4.5} reviewCount={worker.completedOrders || 0} />
          </View>

          <View style={styles.quickStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{worker.experience || '3+'}</Text>
              <Text style={styles.statLabel}>Exp (Yrs)</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{worker.completedOrders || '50+'}</Text>
              <Text style={styles.statLabel}>Jobs Done</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0.5</Text>
              <Text style={styles.statLabel}>km Away</Text>
            </View>
          </View>
        </View>

        {/* Skills Section */}
        {worker.skills && worker.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills & Expertise</Text>
            <View style={styles.skillsList}>
              {worker.skills?.map((skill, idx) => (
                <View key={idx} style={styles.skillItem}>
                  <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Professional</Text>
          <Text
            style={styles.bioText}
            numberOfLines={showFullBio ? undefined : 3}
          >
            {worker.bio || "An expert professional with high skills in their field, dedicated to providing top-notch service and ensuring customer satisfaction through quality work."}
          </Text>
          <TouchableOpacity onPress={() => setShowFullBio(!showFullBio)}>
            <Text style={styles.readMore}>
              {showFullBio ? 'Show less' : 'Read more'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Services Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Service</Text>
          {services.map((service) => {
            const isSelected = selectedServices.some((s) => s.id === service.id);
            return (
              <TouchableOpacity
                key={service.id}
                style={[
                  styles.serviceItem,
                  isSelected && styles.serviceItemSelected
                ]}
                onPress={() => handleServiceToggle(service)}
              >
                <View style={styles.serviceInfo}>
                  <Text style={[styles.serviceName, isSelected && styles.serviceNameSelected]}>
                    {service.name}
                  </Text>
                  <Text style={[styles.serviceDuration, isSelected && styles.serviceDurationSelected]}>
                    {service.duration} mins
                  </Text>
                </View>
                <Text style={[styles.servicePrice, isSelected && styles.servicePriceSelected]}>
                  ₹{service.price}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <Button
          title="Book Appointment"
          onPress={handleBookNow}
          style={styles.bookButton}
          icon="calendar-outline"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  heroSection: { height: 300, position: 'relative' },
  heroImage: { width: SCREEN_WIDTH, height: 300 },
  heroGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 150 },
  heroHeader: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 10 },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  infoSection: { paddingHorizontal: 24, marginTop: -30 },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  name: { fontSize: 24, fontWeight: '700', color: '#1A1A1A', marginRight: 10, fontFamily: 'Poppins-Bold' },
  verifiedBadge: { marginLeft: 0 },
  category: { fontSize: 15, color: '#E84545', fontWeight: '600', marginBottom: 12, fontFamily: 'Poppins-Medium' },
  statsRow: { marginBottom: 20 },
  quickStats: { flexDirection: 'row', backgroundColor: '#F9FAFB', borderRadius: 16, padding: 20, justifyContent: 'space-around', borderWidth: 1, borderColor: '#F3F4F6' },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '700', color: '#E84545', fontFamily: 'Poppins-Bold' },
  statLabel: { fontSize: 12, color: '#6B7280', marginTop: 4, fontFamily: 'Poppins-Medium' },
  statDivider: { width: 1, backgroundColor: '#E5E7EB' },
  section: { paddingHorizontal: 24, marginTop: 28 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: 16, fontFamily: 'Poppins-Bold' },
  skillsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  skillItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, gap: 8, borderWidth: 1, borderColor: '#DCFCE7' },
  skillText: { fontSize: 14, color: '#166534', fontWeight: '500', fontFamily: 'Poppins-Medium' },
  bioText: { fontSize: 15, color: '#4B5563', lineHeight: 24, fontFamily: 'Poppins-Regular' },
  readMore: { fontSize: 14, color: '#E84545', marginTop: 8, fontWeight: '600', fontFamily: 'Poppins-SemiBold' },
  serviceItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  serviceItemSelected: { borderColor: '#E84545', backgroundColor: '#FFF5F5' },
  serviceInfo: { flex: 1 },
  serviceName: { fontSize: 15, color: '#1A1A1A', fontWeight: '600', fontFamily: 'Poppins-SemiBold' },
  serviceNameSelected: { color: '#E84545' },
  serviceDuration: { fontSize: 13, color: '#6B7280', marginTop: 4, fontFamily: 'Poppins-Regular' },
  serviceDurationSelected: { color: '#E84545', opacity: 0.8 },
  servicePrice: { fontSize: 17, color: '#1A1A1A', fontWeight: '700', fontFamily: 'Poppins-Bold' },
  servicePriceSelected: { color: '#E84545' },
  bottomPadding: { height: 120 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', paddingHorizontal: 24, paddingVertical: 20, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  bookButton: { width: '100%' },
});

export default WorkerProfileScreen;
