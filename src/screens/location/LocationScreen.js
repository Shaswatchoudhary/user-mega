import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import { requestLocationPermission, getUserLocation, reverseGeocode } from '../../utils/locationHelper';
import { useLocation } from '../../context/LocationContext';

export default function LocationScreen({ navigation }) {
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState(null);
  const { saveLocation } = useLocation();

  const handleDetectLocation = async () => {
    setIsLoading(true);
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Please enable location permissions in settings to use this feature.');
        return;
      }

      const coords = await getUserLocation();
      const addrData = await reverseGeocode(coords.latitude, coords.longitude);
      
      if (addrData) {
        setDetectedLocation(addrData);
        setAddress(addrData.addressText);
      }
    } catch (error) {
      console.error('Detection Error:', error);
      if (Platform.OS === 'android') {
        Alert.alert(
          'Location Timeout',
          'Failed to detect location automatically.\n\nTIP: If you are using an Emulator, please set a location manually in "Extended Controls" -> "Location".'
        );
      } else {
        Alert.alert('Error', 'Failed to detect location. Please type manually.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmLocation = async () => {
    if (!address.trim()) {
      Alert.alert('Empty Address', 'Please detect location or type your address manually.');
      return;
    }

    const locationToSave = detectedLocation || {
      addressText: address,
      name: address.split(',')[0],
      subtitle: 'Manual Entry',
      latitude: detectedLocation?.latitude || 0,
      longitude: detectedLocation?.longitude || 0,
      city: '',
      pincode: ''
    };

    try {
      await saveLocation(locationToSave);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save location.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Location</Text>
        </View>

        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.main}>
            {/* Detect Location Button */}
            <TouchableOpacity 
              style={styles.detectButton} 
              onPress={handleDetectLocation}
              disabled={isLoading}
            >
              <View style={styles.iconCircle}>
                {isLoading ? (
                  <ActivityIndicator color="#E84545" size="small" />
                ) : (
                  <MaterialCommunityIcons name="crosshairs-gps" size={22} color="#E84545" />
                )}
              </View>
              <View style={styles.detectTextContainer}>
                <Text style={styles.detectTitle}>Detect My Location</Text>
                <Text style={styles.detectSubtitle}>Using GPS for faster checkout</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Manual Input */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>ENTER ADDRESS MANUALLY</Text>
              <View style={styles.inputContainer}>
                <Feather name="map-pin" size={18} color="#E84545" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="H.No, Street, Area, City..."
                  placeholderTextColor="#999"
                  value={address}
                  onChangeText={(text) => {
                    setAddress(text);
                    if (detectedLocation) setDetectedLocation(null);
                  }}
                  multiline
                />
              </View>
            </View>

            {detectedLocation && (
              <View style={styles.suggestionBox}>
                <Text style={styles.suggestionTitle}>DETECTED ADDRESS</Text>
                <View style={styles.suggestionItem}>
                  <Ionicons name="location" size={20} color="#E84545" />
                  <View style={styles.suggestionTextContainer}>
                    <Text style={styles.suggestionName}>{detectedLocation.name}</Text>
                    <Text style={styles.suggestionAddress}>{detectedLocation.addressText}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Footer Button */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.confirmButton, !address && styles.disabledButton]} 
            onPress={handleConfirmLocation}
          >
            <Text style={styles.confirmButtonText}>Confirm Location</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'Poppins-SemiBold',
  },
  content: {
    flex: 1,
  },
  main: {
    padding: 20,
  },
  detectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFEBEB',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  detectTextContainer: {
    flex: 1,
  },
  detectTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E84545',
    fontFamily: 'Poppins-SemiBold',
  },
  detectSubtitle: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'Poppins-Regular',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EEE',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#999',
    fontSize: 12,
    fontWeight: '600',
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 12,
  },
  inputIcon: {
    marginTop: 4,
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    fontFamily: 'Poppins-Regular',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  suggestionBox: {
    marginTop: 10,
  },
  suggestionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
    marginBottom: 12,
  },
  suggestionItem: {
    flexDirection: 'row',
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#E84545',
  },
  suggestionTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  suggestionAddress: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  confirmButton: {
    backgroundColor: '#E84545',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#FFAAAA',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Poppins-SemiBold',
  },
});
