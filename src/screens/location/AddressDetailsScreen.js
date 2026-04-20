import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, ScrollView, SafeAreaView, Alert
} from 'react-native';

const ADDRESS_TYPES = ['Home', 'Work', 'Other'];

const AddressDetailsScreen = ({ navigation, route }) => {
  const { location, onLocationSelected } = route.params;
  
  const [flat, setFlat] = useState('');
  const [wing, setWing] = useState('');
  const [landmark, setLandmark] = useState('');
  const [addressType, setAddressType] = useState('Home');

  const saveAddress = () => {
    if (!flat) {
      Alert.alert('Required', 'Please enter flat/house number');
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Complete Address</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Selected Location Preview */}
        <View style={styles.locationPreview}>
          <Text style={styles.locationIcon}>📍</Text>
          <View style={styles.locationText}>
            <Text style={styles.areaName}>{location.shortAddress}</Text>
            <Text style={styles.areaFull} numberOfLines={2}>
              {location.fullAddress}
            </Text>
          </View>
        </View>

        {/* Flat/House Number - REQUIRED */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            Flat / House Number *
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 101, B-205, House No. 12"
            value={flat}
            onChangeText={setFlat}
            placeholderTextColor="#475569"
          />
        </View>

        {/* Wing/Building */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            Wing / Building Name
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. A Wing, Sai Prasad, Tower B"
            value={wing}
            onChangeText={setWing}
            placeholderTextColor="#475569"
          />
        </View>

        {/* Landmark */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            Nearby Landmark
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Near Rankala Lake, Opp. Hospital"
            value={landmark}
            onChangeText={setLandmark}
            placeholderTextColor="#475569"
          />
        </View>

        {/* Address Type */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Save as</Text>
          <View style={styles.typeRow}>
            {ADDRESS_TYPES.map(type => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeChip,
                  addressType === type && styles.typeChipActive
                ]}
                onPress={() => setAddressType(type)}>
                <Text style={[
                  styles.typeText,
                  addressType === type && styles.typeTextActive
                ]}>
                  {type === 'Home' ? '🏠' : type === 'Work' ? '💼' : '📌'} {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={saveAddress}>
        <Text style={styles.saveText}>Save & Continue</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  backBtn: { fontSize: 24, color: '#1A1A1A', marginRight: 12 },
  headerTitle: {
    color: '#1A1A1A', fontSize: 18, fontWeight: '700', fontFamily: 'Poppins-Bold'
  },
  content: { flex: 1, padding: 16 },
  locationPreview: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16, borderRadius: 12,
    marginBottom: 20, alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  locationIcon: { fontSize: 24, marginRight: 12 },
  locationText: { flex: 1 },
  areaName: {
    color: '#1A1A1A', fontSize: 16, fontWeight: '700', fontFamily: 'Poppins-Bold'
  },
  areaFull: { color: '#64748B', fontSize: 13, marginTop: 4, fontFamily: 'Poppins-Regular' },
  inputGroup: { marginBottom: 20 },
  inputLabel: {
    color: '#64748B', fontSize: 13,
    fontWeight: '600', marginBottom: 8,
    textTransform: 'uppercase', letterSpacing: 0.5,
    fontFamily: 'Poppins-SemiBold'
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12, padding: 14,
    color: '#1A1A1A', fontSize: 15,
    borderWidth: 1, borderColor: '#E2E8F0',
    fontFamily: 'Poppins-Regular'
  },
  typeRow: { flexDirection: 'row', gap: 12 },
  typeChip: {
    flex: 1, padding: 12,
    borderRadius: 10, borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  typeChipActive: {
    borderColor: '#E84545',
    backgroundColor: '#FFF5F5',
  },
  typeText: { color: '#64748B', fontSize: 14, fontFamily: 'Poppins-Regular' },
  typeTextActive: { color: '#E84545', fontWeight: '600', fontFamily: 'Poppins-SemiBold' },
  saveButton: {
    backgroundColor: '#E84545',
    margin: 16, padding: 16,
    borderRadius: 12, alignItems: 'center',
    elevation: 4,
    shadowColor: '#E84545',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '700', fontFamily: 'Poppins-Bold' },
});

export default AddressDetailsScreen;
