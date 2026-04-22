import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, ScrollView, SafeAreaView, Alert, StatusBar, KeyboardAvoidingView, Platform
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const ADDRESS_TYPES = [
  { id: 'Home', icon: 'home-outline', activeIcon: 'home' },
  { id: 'Work', icon: 'briefcase-outline', activeIcon: 'briefcase' },
  { id: 'Other', icon: 'location-outline', activeIcon: 'location' }
];

const AddressDetailsScreen = ({ navigation, route }) => {
  const { location, onLocationSelected } = route.params;
  
  const [flat, setFlat] = useState('');
  const [wing, setWing] = useState('');
  const [landmark, setLandmark] = useState('');
  const [addressType, setAddressType] = useState('Home');
  const [focusedField, setFocusedField] = useState(null);

  const saveAddress = () => {
    if (!flat) {
      Alert.alert('Required', 'Please enter flat/house number to proceed.');
      return;
    }

    const completeAddress = {
      ...location,
      flat,
      wing,
      landmark,
      addressType,
      displayAddress: `${flat}${wing ? ', Wing ' + wing : ''}, ${location.shortAddress}`,
      fullAddress: `${flat}${wing ? ', Wing ' + wing : ''}${landmark ? ', Near ' + landmark : ''}, ${location.fullAddress}`,
    };

    onLocationSelected(completeAddress);
    navigation.popToTop();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Premium Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backBtnContainer}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#E84545" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complete Address</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Location Illustration & Preview */}
          <View style={styles.illustrationSection}>
            <View style={styles.pinCircle}>
              <MaterialCommunityIcons name="map-marker-radius" size={40} color="#E84545" />
            </View>
            <View style={styles.locationPreview}>
              <Text style={styles.areaName}>{location.shortAddress || 'Your Location'}</Text>
              <Text style={styles.areaFull} numberOfLines={2}>
                {location.fullAddress}
              </Text>
            </View>
          </View>

          <View style={styles.formContainer}>
            {/* Flat/House Number */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, focusedField === 'flat' && styles.activeLabel]}>
                FLAT / HOUSE / OFFICE NUMBER *
              </Text>
              <View style={[styles.inputWrapper, focusedField === 'flat' && styles.activeInputWrapper]}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 101, B-205, House No. 12"
                  value={flat}
                  onChangeText={setFlat}
                  onFocus={() => setFocusedField('flat')}
                  onBlur={() => setFocusedField(null)}
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            {/* Wing/Building */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, focusedField === 'wing' && styles.activeLabel]}>
                WING / BUILDING NAME
              </Text>
              <View style={[styles.inputWrapper, focusedField === 'wing' && styles.activeInputWrapper]}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. A Wing, Sai Prasad, Tower B"
                  value={wing}
                  onChangeText={setWing}
                  onFocus={() => setFocusedField('wing')}
                  onBlur={() => setFocusedField(null)}
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            {/* Landmark */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, focusedField === 'landmark' && styles.activeLabel]}>
                NEARBY LANDMARK (OPTIONAL)
              </Text>
              <View style={[styles.inputWrapper, focusedField === 'landmark' && styles.activeInputWrapper]}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Near Rankala Lake, Opp. Hospital"
                  value={landmark}
                  onChangeText={setLandmark}
                  onFocus={() => setFocusedField('landmark')}
                  onBlur={() => setFocusedField(null)}
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            {/* Address Type */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>SAVE AS</Text>
              <View style={styles.typeRow}>
                {ADDRESS_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.typeChip,
                      addressType === type.id && styles.typeChipActive
                    ]}
                    onPress={() => setAddressType(type.id)}
                    activeOpacity={0.8}
                  >
                    <Ionicons 
                      name={addressType === type.id ? type.activeIcon : type.icon} 
                      size={18} 
                      color={addressType === type.id ? '#FFFFFF' : '#64748B'} 
                    />
                    <Text style={[
                      styles.typeText,
                      addressType === type.id && styles.typeTextActive
                    ]}>
                      {type.id}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveAddress}
          activeOpacity={0.9}
        >
          <Text style={styles.saveText}>Save Address & Continue</Text>
          <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtnContainer: { 
    width: 40, 
    height: 40, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    color: '#1E293B', 
    fontSize: 18, 
    fontWeight: '800', 
    fontFamily: 'Poppins-Bold'
  },
  content: { flex: 1, backgroundColor: '#F8FAFC' },
  illustrationSection: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  pinCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  locationPreview: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  areaName: {
    color: '#1E293B', 
    fontSize: 20, 
    fontWeight: '800', 
    fontFamily: 'Poppins-Bold',
    textAlign: 'center'
  },
  areaFull: { 
    color: '#64748B', 
    fontSize: 14, 
    marginTop: 6, 
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    lineHeight: 20
  },
  formContainer: {
    padding: 24,
  },
  inputGroup: { marginBottom: 24 },
  inputLabel: {
    color: '#94A3B8', 
    fontSize: 11,
    fontWeight: '800', 
    marginBottom: 10,
    letterSpacing: 1,
    fontFamily: 'Poppins-Bold'
  },
  activeLabel: {
    color: '#E84545',
  },
  inputWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  activeInputWrapper: {
    borderColor: '#E84545',
    backgroundColor: '#FFFBFB',
    elevation: 4,
    shadowOpacity: 0.1,
  },
  input: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    color: '#1E293B', 
    fontSize: 15,
    fontFamily: 'Poppins-Medium'
  },
  typeRow: { flexDirection: 'row', gap: 12 },
  typeChip: {
    flex: 1, 
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 14, 
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  typeChipActive: {
    borderColor: '#E84545',
    backgroundColor: '#E84545',
  },
  typeText: { 
    color: '#64748B', 
    fontSize: 14, 
    fontWeight: '700',
    fontFamily: 'Poppins-Bold' 
  },
  typeTextActive: { 
    color: '#FFFFFF',
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  saveButton: {
    backgroundColor: '#E84545',
    paddingVertical: 18,
    borderRadius: 18, 
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    elevation: 8,
    shadowColor: '#E84545',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  saveText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: '800', 
    fontFamily: 'Poppins-Bold' 
  },
});

export default AddressDetailsScreen;
