import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  Platform,
  ActivityIndicator,
  Linking,
  PermissionsAndroid
} from 'react-native';
import { MapPin, Check, ChevronLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import Geolocation from 'react-native-geolocation-service';
import config from '../../constants/config';
import { useAuth } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CATEGORIES = {
  'AC Repair': ['Installation', 'Gas Refilling', 'Maintenance', 'Fault Diagnosis', 'Compressor Repair'],
  'Appliance Repair': ['Washing Machine', 'Refrigerator', 'Microwave', 'TV Repair', 'General Appliances'],
  'Carpenter': ['Furniture Making', 'Door/Window Fitting', 'Woodwork', 'Custom Designs', 'Repairs'],
  'Plumber': ['Pipe Fitting', 'Leak Repair', 'Bathroom Fitting', 'Drainage', 'Water Heater Installation'],
  'Electrician': ['Residential Wiring', 'Fault Finding', 'Appliance Installation', 'Circuit Breakers', 'LED Installation'],
  'Men\'s Self Care': ['Haircut', 'Shaving', 'Facial', 'Massage', 'Hair Treatment'],
  'Women\'s Self Care': ['Hair Styling', 'Facial', 'Makeup', 'Spa Services', 'Waxing']
};

const INDIAN_BANKS = [
  'SBI', 'HDFC', 'ICICI', 'Axis', 'PNB', 'Bank of Baroda', 'Union Bank',
  'Canara Bank', 'IDFC', 'Kotak', 'IndusInd', 'Yes Bank', 'Others'
];

const WorkForm = ({ navigation, route }) => {
  const { setWorkerData } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Step 1 - Basic Information
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState(route.params?.phone || '');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  // Step 2 - ID Verification
  const [aadhaar, setAadhaar] = useState('');
  const [pan, setPan] = useState('');

  // Step 3 - Service Profile
  const [category, setCategory] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);

  // Step 4 - Professional Details
  const [experience, setExperience] = useState('');
  const [summary, setSummary] = useState('');

  // Step 5 - Banking & Verification
  const [accountHolderName, setAccountHolderName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [upi, setUpi] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Helper: Count words in summary (FIXED)
  const getWordCount = (text) => {
    if (!text || !text.trim()) return 0;
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    return words.length;
  };

  // Helper: Format Aadhaar with spaces (XXXX XXXX XXXX)
  const formatAadhaar = (text) => {
    const cleaned = text.replace(/\s/g, '');
    const match = cleaned.match(/(\d{1,4})(\d{0,4})(\d{0,4})/);
    if (match) {
      return [match[1], match[2], match[3]].filter(Boolean).join(' ');
    }
    return text;
  };

  // Handle Aadhaar input with auto-formatting
  const handleAadhaarChange = (text) => {
    const cleaned = text.replace(/\s/g, '');
    if (cleaned.length <= 12 && /^\d*$/.test(cleaned)) {
      setAadhaar(formatAadhaar(cleaned));
    }
  };

  // Field Validations
  const isStep1Valid = fullName.length >= 3 && /^[a-zA-Z\s]+$/.test(fullName) && address.length > 5;
  const aadhaarDigits = aadhaar.replace(/\s/g, '');
  const isStep2Valid = /^\d{12}$/.test(aadhaarDigits) && /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.toUpperCase());
  const isStep3Valid = !!category && selectedSkills.length > 0;
  const isStep4Valid = experience !== '';

  // Banking validation with account number match check
  const accountsMatch = accountNumber && confirmAccountNumber && accountNumber === confirmAccountNumber;
  const isStep5Valid =
    accountHolderName.trim() === fullName.trim() &&
    !!bankName &&
    accountNumber.length >= 9 &&
    accountsMatch &&
    /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.toUpperCase()) &&
    agreeTerms;

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      // Show data loss warning
      Alert.alert(
        'Confirm Exit',
        'Are you sure you want to go back? Your entered data will be lost.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Yes, Go Back', style: 'destructive', onPress: () => navigation.goBack() }
        ]
      );
    }
  };

  const handleLocationFetch = async () => {
    setIsLocating(true);
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'WorkEase needs access to your location to find nearby jobs and verify your address.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Please allow location access to continue.');
          setIsLocating(false);
          return;
        }
      } else {
        const status = await Geolocation.requestAuthorization('whenInUse');
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Please allow location access to continue.');
          setIsLocating(false);
          return;
        }
      }

      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log('[WorkForm] Location Found:', latitude, longitude);
          setLatitude(latitude);
          setLongitude(longitude);
          
          const addr = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          setAddress(prev => prev ? `${prev} (GPS: ${addr})` : `Location: ${addr}`);
          setIsLocating(false);
        },
        (error) => {
          console.error('[LocationError] getCurrentPosition error:', error);
          let msg = 'Could not fetch location.';
          if (error.code === 1) msg = 'Location permission denied.';
          if (error.code === 2) msg = 'Location provider disabled (Check GPS settings).';
          if (error.code === 3) msg = 'Location request timed out.';
          
          Alert.alert('Location Error', msg);
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } catch (error) {
      console.error('[LocationError] Catch block:', error);
      Alert.alert('Error', 'An unexpected error occurred while fetching location.');
      setIsLocating(false);
    }
  };

  const handleSubmit = async () => {
    if (!isStep5Valid) {
      Alert.alert('Validation Error', 'Please complete all required fields correctly.');
      return;
    }

    setIsLoading(true);

    try {
      const registrationData = {
        fullName: fullName.trim(),
        phone: mobile,
        address: address,
        lat: latitude || 0,
        lng: longitude || 0,
        aadhaar: aadhaar.replace(/\s/g, ''),
        pan: pan.toUpperCase(),
        category: category,
        skills: selectedSkills,
        experience: parseInt(experience) || 0,
        summary: summary.trim(),
        bankDetails: {
          holderName: accountHolderName.trim(),
          bankName: bankName,
          accountNumber: accountNumber,
          ifsc: ifsc.toUpperCase()
        }
      };

      console.log('[WorkForm] Submitting Registration:', registrationData);

      const response = await axios.post(`${config.WORKER_API_BASE_URL}/register`, registrationData);

      if (response.data.success) {
        // Update local context with the new worker profile
        const newWorker = response.data.data;
        if (setWorkerData) {
            setWorkerData(newWorker);
            await AsyncStorage.setItem('workerData', JSON.stringify(newWorker));
        }
        
        setIsLoading(false);
        navigation.replace('UnderReviewScreen');
      } else {
        setIsLoading(false);
        Alert.alert('Registration Failed', response.data.message || 'An error occurred during registration.');
      }
    } catch (error) {
      console.error('[WorkForm] Submission Error:', error);
      setIsLoading(false);
      const errorMessage = error.response?.data?.message || 'Failed to connect to the server. Please check your internet connection.';
      Alert.alert('Error', errorMessage);
    }
  };

  const toggleSkill = (skill) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleTermsPress = () => {
    console.log('[Terms] Terms & Conditions clicked');
    Alert.alert('Terms & Conditions', 'Terms & Conditions will be displayed here.');
  };

  const handlePrivacyPress = () => {
    console.log('[Privacy] Privacy Policy clicked');
    Alert.alert('Privacy Policy', 'Privacy Policy will be displayed here.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Worker Registration</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Step Indicator */}
        <View style={styles.progressContainer}>
          {[1, 2, 3, 4, 5].map(step => (
            <View
              key={step}
              style={[
                styles.progressDot,
                currentStep >= step ? styles.progressDotActive : null
              ]}
            />
          ))}
        </View>

        {/* SECTION 1: BASIC INFORMATION */}
        {currentStep === 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full name"
                autoCapitalize="words"
              />
              <Text style={styles.hint}>Min 3 characters. Only alphabets allowed.</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mobile Number</Text>
              <TextInput
                style={[styles.input, { backgroundColor: '#F3F4F6' }]}
                value={mobile}
                editable={false}
              />
              <Text style={styles.hint}>Verified via OTP</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Current Address</Text>
              <View style={styles.addressContainer}>
                <TextInput
                  style={[styles.input, { flex: 1, height: 80, textAlignVertical: 'top' }]}
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Street, City, Landmark"
                  multiline
                />
                <TouchableOpacity
                  onPress={handleLocationFetch}
                  style={styles.locationBtn}
                  disabled={isLocating}
                >
                  {isLocating ? <ActivityIndicator size="small" color="#E84545" /> : <MapPin size={20} color="#E84545" />}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* SECTION 2: ID VERIFICATION */}
        {currentStep === 2 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ID Verification</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Aadhaar Card Number</Text>
              <TextInput
                style={styles.input}
                value={aadhaar}
                onChangeText={handleAadhaarChange}
                placeholder="1234 5678 9012"
                keyboardType="numeric"
                maxLength={14}
              />
              <Text style={styles.hint}>12 digits (auto-formatted)</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>PAN Card Number</Text>
              <TextInput
                style={styles.input}
                value={pan}
                onChangeText={setPan}
                placeholder="ABCDE1234F"
                autoCapitalize="characters"
                maxLength={10}
              />
              <Text style={styles.hint}>Format: 5 letters, 4 digits, 1 letter</Text>
            </View>
          </View>
        )}

        {/* SECTION 3: SERVICE PROFILE */}
        {currentStep === 3 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Service Profile</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Primary Category</Text>
              <View style={styles.chipContainer}>
                {Object.keys(CATEGORIES).map(cat => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => { setCategory(cat); setSelectedSkills([]); }}
                    style={[styles.chip, category === cat && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {category && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Select Skills</Text>
                <View style={styles.chipContainer}>
                  {CATEGORIES[category].map(skill => (
                    <TouchableOpacity
                      key={skill}
                      onPress={() => toggleSkill(skill)}
                      style={[styles.chip, selectedSkills.includes(skill) && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, selectedSkills.includes(skill) && styles.chipTextActive]}>{skill}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* SECTION 4: PROFESSIONAL DETAILS */}
        {currentStep === 4 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Details</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Years of Experience</Text>
              <TextInput
                style={styles.input}
                value={experience}
                onChangeText={setExperience}
                placeholder="e.g. 5"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Professional Summary</Text>
              <TextInput
                style={[styles.input, { height: 120, textAlignVertical: 'top' }]}
                value={summary}
                onChangeText={setSummary}
                placeholder="Describe your expertise..."
                multiline
              />
              <Text style={styles.hint}>
                Word count: {getWordCount(summary)} (Optional)
              </Text>
              <Text style={styles.helperText}>A detailed professional overview increases chances of getting more requests.</Text>
            </View>
          </View>
        )}

        {/* SECTION 5: BANKING & VERIFICATION */}
        {currentStep === 5 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Banking Details</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Account Holder Name</Text>
              <TextInput
                style={styles.input}
                value={accountHolderName}
                onChangeText={setAccountHolderName}
                placeholder="Must match full name"
                autoCapitalize="words"
              />
              {accountHolderName && accountHolderName !== fullName && (
                <Text style={[styles.hint, { color: '#E84545' }]}>Must exactly match your full name</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bank Name</Text>
              <View style={styles.chipContainer}>
                {INDIAN_BANKS.map(bank => (
                  <TouchableOpacity
                    key={bank}
                    onPress={() => setBankName(bank)}
                    style={[styles.chip, bankName === bank && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, bankName === bank && styles.chipTextActive]}>{bank}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Account Number</Text>
              <TextInput
                style={styles.input}
                value={accountNumber}
                onChangeText={setAccountNumber}
                placeholder="Enter account number"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Account Number</Text>
              <TextInput
                style={styles.input}
                value={confirmAccountNumber}
                onChangeText={setConfirmAccountNumber}
                placeholder="Re-enter account number"
                keyboardType="numeric"
              />
              {confirmAccountNumber && !accountsMatch && (
                <Text style={[styles.hint, { color: '#E84545' }]}>Account numbers do not match</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>IFSC Code</Text>
              <TextInput
                style={styles.input}
                value={ifsc}
                onChangeText={setIfsc}
                placeholder="ABCD0123456"
                autoCapitalize="characters"
                maxLength={11}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>UPI ID (Optional)</Text>
              <TextInput
                style={styles.input}
                value={upi}
                onChangeText={setUpi}
                placeholder="username@bank"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setAgreeTerms(!agreeTerms)}
            >
              <View style={[styles.checkbox, agreeTerms && styles.checkboxActive]}>
                {agreeTerms && <Check size={14} color="#FFF" />}
              </View>
              <Text style={styles.checkboxLabel}>
                I agree to the{' '}
                <Text style={styles.linkText} onPress={handleTermsPress}>Terms & Conditions</Text>
                {' '}and{' '}
                <Text style={styles.linkText} onPress={handlePrivacyPress}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        {currentStep < 5 ? (
          <TouchableOpacity
            style={[styles.btn, !([isStep1Valid, isStep2Valid, isStep3Valid, isStep4Valid][currentStep - 1]) && styles.btnDisabled]}
            disabled={!([isStep1Valid, isStep2Valid, isStep3Valid, isStep4Valid][currentStep - 1])}
            onPress={handleNext}
          >
            <Text style={styles.btnText}>Continue</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.btn, (!isStep5Valid || isLoading) && styles.btnDisabled]}
            disabled={!isStep5Valid || isLoading}
            onPress={handleSubmit}
          >
            {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>Submit Application</Text>}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE'
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
  backButton: { padding: 4 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20 },
  progressContainer: { flexDirection: 'row', gap: 8, marginBottom: 24, justifyContent: 'center' },
  progressDot: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB' },
  progressDotActive: { backgroundColor: '#E84545' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 24, fontWeight: '700', color: '#000', marginBottom: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827'
  },
  hint: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  helperText: { fontSize: 13, color: '#4B5563', marginTop: 8, fontStyle: 'italic' },
  addressContainer: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  locationBtn: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center'
  },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB'
  },
  chipActive: { borderColor: '#E84545', backgroundColor: '#FEE2E2' },
  chipText: { fontSize: 14, color: '#4B5563' },
  chipTextActive: { color: '#E84545', fontWeight: '600' },
  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 10 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2
  },
  checkboxActive: { backgroundColor: '#E84545', borderColor: '#E84545' },
  checkboxLabel: { fontSize: 14, color: '#4B5563', flex: 1, lineHeight: 20 },
  linkText: { color: '#E84545', fontWeight: '600', textDecorationLine: 'underline' },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#EEE' },
  btn: {
    backgroundColor: '#E84545',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  btnDisabled: { backgroundColor: '#FCA5A5' },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  centerContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  title: { fontSize: 24, fontWeight: '700', color: '#000', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#6B7280', textAlign: 'center', marginTop: 10 }
});

export default WorkForm;