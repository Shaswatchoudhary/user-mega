
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useLocation } from '../../context/LocationContext';
import { CommonActions } from '@react-navigation/native';

export default function BookingStatusScreen({ navigation, route }) {
  const [status, setStatus] = useState('searching'); // searching, accepted
  const { worker, service, date } = route.params || {};
  const { startSimulation, distance, selectedLocation } = useLocation();

  useEffect(() => {
    // Mock worker acceptance after 4 seconds
    const timer = setTimeout(() => {
      setStatus('accepted');
      startSimulation(); // Start real-time movement simulation
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Status Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'MainTabs' }],
            })
          )}
          style={styles.closeButton}
        >
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Animated Pulse or Icon */}
        <View style={styles.animationContainer}>
          {status === 'searching' ? (
            <View style={styles.pulseContainer}>
              <ActivityIndicator size="large" color="#E84545" />
              <View style={styles.pulseRing} />
            </View>
          ) : (
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={40} color="#fff" />
            </View>
          )}
        </View>

        {/* Status Text */}
        <Text style={styles.statusTitle}>
          {status === 'searching'
            ? (worker?.name ? `Waiting for ${worker.name} to accept...` : 'Searching for a worker...')
            : 'Worker accepted your request!'}
        </Text>
        <Text style={styles.statusSubtitle}>
          {status === 'searching'
            ? (worker?.name ? `Sending your request to ${worker.name}.` : 'We are looking for nearby professionals.')
            : `${worker?.name || 'Your worker'} is ${distance > 0.1 ? distance.toFixed(1) + ' km away' : 'arriving now'}.`}
        </Text>

        {status === 'accepted' && (
          <Text style={styles.destinationText}>
            📍 Destination: {selectedLocation?.address || 'Your saved location'}
          </Text>
        )}

        {/* Worker Card (Visible on Accept) */}
        {status === 'accepted' && (
          <View style={styles.workerCard}>
            <Image
              source={{ uri: worker?.image }}
              style={styles.workerImage}
            />
            <View style={styles.workerInfo}>
              <Text style={styles.workerName}>{worker?.name || 'Start Worker'}</Text>
              <Text style={styles.workerRating}>★ {worker?.rating || '4.8'} • {worker?.reviewCount || '50'} reviews</Text>
              <View style={styles.verifiedTag}>
                <Text style={styles.verifiedText}>Verified Professional</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.callButton} onPress={() => alert('Call feature coming soon')}>
              <Ionicons name="call" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Bottom Actions */}
      {status === 'accepted' && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.trackButton}
            onPress={() => navigation.navigate('Tracking')}
          >
            <Text style={styles.trackButtonText}>Track Worker</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
              })
            )}
          >
            <Text style={styles.homeButtonText}>Go to Home</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    alignItems: 'flex-end',
  },
  closeButton: {
    padding: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    justifyContent: 'center',
    marginTop: -80,
  },
  animationContainer: {
    marginBottom: 32,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseContainer: {
    padding: 24,
    backgroundColor: '#FFF0F0',
    borderRadius: 50,
  },
  successIcon: {
    width: 80,
    height: 80,
    backgroundColor: '#10B981',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#10B981',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  statusTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
  },
  statusSubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Poppins-Regular',
  },
  destinationText: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    marginBottom: 40,
    fontFamily: 'Poppins-Regular',
  },
  workerCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  workerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  workerRating: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  verifiedTag: {
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  verifiedText: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '700',
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E84545',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  trackButton: {
    backgroundColor: '#E84545',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  trackButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  homeButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  homeButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});
