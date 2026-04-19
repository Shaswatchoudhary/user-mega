import React, { useState, useEffect } from 'react';
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

const { width } = Dimensions.get('window');

const MapScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [hasReached, setHasReached] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const customerPhone = '+91 9579499891';
  const customerLocation = "Near Mahalaxmi Temple, Kolhapur";

  const handleStartNavigation = () => {
    setIsNavigating(true);
    // Open External Maps (Google Maps / Apple Maps)
    const lat = 16.6967;
    const lng = 74.2351;
    const url = Platform.OS === 'android' 
      ? `google.navigation:q=${lat},${lng}&mode=d`
      : `maps://app?daddr=${lat},${lng}&t=m`;
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
      }
    });
  };

  const handleReachedLocation = () => {
    setHasReached(true);
    setIsNavigating(false);
    Alert.alert('Arrived', 'You have marked yourself as arrived at the customer location.');
  };

  const handleStartWork = () => {
     navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#E84545" />

      <LinearGradient
        colors={['#E84545', '#1A1A1A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Navigation</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.statusIllustration}>
          <LinearGradient
            colors={['#F8FAFC', '#F1F5F9']}
            style={styles.illustrationGradient}
          >
            <MaterialCommunityIcons name="map-marker-off" size={80} color="#E84545" />
            <Text style={styles.illustrationTitle}>Navigation Mode</Text>
            <Text style={styles.illustrationSubtitle}>
              Interactive Map is disabled for stability. Please use external maps for precise turns.
            </Text>
          </LinearGradient>
        </View>

        <View style={styles.customerCard}>
          <View style={styles.cardHeaderRow}>
             <Text style={styles.sectionTitle}>Customer Details</Text>
             <View style={styles.liveBadgeRow}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>Location Secure</Text>
             </View>
          </View>
          <View style={styles.customerHeader}>
             <View style={styles.avatar}>
               <Text style={styles.avatarText}>RS</Text>
             </View>
             <View style={styles.customerInfo}>
               <Text style={styles.customerName}>Rahul Sharma</Text>
               <Text style={styles.jobType}>Pipe Repair</Text>
             </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.detailRow}>
            <View style={styles.iconBox}>
               <Ionicons name="location" size={18} color="#E84545" />
            </View>
            <Text style={styles.detailText}>{customerLocation}</Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.iconBox}>
               <Ionicons name="call" size={18} color="#10B981" />
            </View>
            <Text style={styles.detailText}>{customerPhone}</Text>
          </View>
        </View>

        <View style={styles.actionContainer}>
           <TouchableOpacity style={styles.primaryBtn} onPress={handleStartNavigation}>
             <LinearGradient colors={['#E84545', '#1A1A1A']} style={styles.btnGradient}>
               <Ionicons name="navigate" size={24} color="#FFF" />
               <Text style={styles.btnText}>{isNavigating ? 'Open External Navigation' : 'Start Navigation'}</Text>
             </LinearGradient>
           </TouchableOpacity>

           {isNavigating && !hasReached && (
             <TouchableOpacity style={styles.secondaryBtn} onPress={handleReachedLocation}>
               <Text style={styles.secondaryBtnText}>Mark as Arrived</Text>
             </TouchableOpacity>
           )}

           {hasReached && (
             <TouchableOpacity style={[styles.primaryBtn, { marginTop: 10 }]} onPress={handleStartWork}>
               <LinearGradient colors={['#10B981', '#059669']} style={styles.btnGradient}>
                 <MaterialCommunityIcons name="hammer-wrench" size={24} color="#FFF" />
                 <Text style={styles.btnText}>Proceed to Work</Text>
               </LinearGradient>
             </TouchableOpacity>
           )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 15
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' },
  content: { flex: 1, padding: 20 },
  statusIllustration: {
    height: 220, borderRadius: 24, overflow: 'hidden', marginBottom: 20,
    borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFF',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10
  },
  illustrationGradient: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  illustrationTitle: { fontSize: 20, fontWeight: '800', color: '#1F2937', marginTop: 15 },
  illustrationSubtitle: { fontSize: 13, color: '#6B7280', textAlign: 'center', marginTop: 8, lineHeight: 18 },
  customerCard: {
    backgroundColor: '#FFF', borderRadius: 24, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 5,
    marginBottom: 25
  },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: '#9CA3AF', textTransform: 'uppercase' },
  liveBadgeRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginRight: 6 },
  liveText: { fontSize: 10, color: '#166534', fontWeight: '700' },
  customerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E84545', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFF', fontWeight: '800', fontSize: 18 },
  customerInfo: { marginLeft: 15 },
  customerName: { fontSize: 18, fontWeight: '800', color: '#1F2937' },
  jobType: { fontSize: 14, color: '#E84545', fontWeight: '700', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 15 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  iconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  detailText: { fontSize: 14, color: '#4B5563', flex: 1, fontWeight: '500' },
  actionContainer: { gap: 15 },
  primaryBtn: { borderRadius: 18, overflow: 'hidden', elevation: 3, shadowColor: '#E84545', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  btnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 12 },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  secondaryBtn: { alignItems: 'center', paddingVertical: 15, borderRadius: 18, borderWidth: 1.5, borderColor: '#E2E8F0', backgroundColor: '#FFF' },
  secondaryBtnText: { color: '#444', fontWeight: '800', fontSize: 14 }
});

export default MapScreen;