import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../../constants/config';
import { requestOTP, verifyOTP } from '../../utils/firebaseAuth';
import { useAuth } from '../../context/AuthContext';


const OtpLoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [step, setStep] = useState(1); // 1 for phone, 2 for OTP
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // Firebase uses 6 digits
  const [confirmation, setConfirmation] = useState(null);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const phoneInputRef = useRef(null);

  const otpInputs = useRef([]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const validatePhoneNumber = (number) => {
    const phoneRegex = /^[6-9]\d{9}$/; // Indian mobile numbers start with 6-9
    return phoneRegex.test(number);
  };

  const handlePhoneChange = (text) => {
    // Only allow numbers
    const cleaned = text.replace(/[^0-9]/g, '');
    setPhoneNumber(cleaned);

    // Clear error when user starts typing
    if (phoneError) {
      setPhoneError('');
    }
  };

  const handleGetOTP = async () => {
    // Validate phone number format
    if (phoneNumber.length !== 10 || !validatePhoneNumber(phoneNumber)) {
      setPhoneError('Enter a valid Indian mobile number');
      return;
    }

    setIsLoading(true);
    setPhoneError('');

    try {
      const fullPhoneNumber = `+91${phoneNumber}`;
      const result = await requestOTP(fullPhoneNumber);

      if (result.success) {
        setConfirmation(result.confirmation);
        setStep(2);
        setCountdown(30);
        setCanResend(false);
        setIsLoading(false);
        Keyboard.dismiss();

        // Auto-focus first OTP input
        setTimeout(() => {
          otpInputs.current[0]?.focus();
        }, 100);
      } else {
        setPhoneError(result.error || 'Failed to send OTP');
        setIsLoading(false);
        const errorCode = result.code ? ` (${result.code})` : '';
        Alert.alert('Error', (result.error || 'Failed to send OTP') + errorCode);
      }
    } catch (error) {
      setIsLoading(false);
      setPhoneError('Connection error. Please try again.');
    }
  };

  const handleResendOTP = async () => {
    if (canResend) {
      setIsLoading(true);
      try {
        const fullPhoneNumber = `+91${phoneNumber}`;
        const result = await requestOTP(fullPhoneNumber);

        if (result.success) {
          setConfirmation(result.confirmation);
          setCountdown(30);
          setCanResend(false);
          setOtp(['', '', '', '', '', '']);
          setIsLoading(false);
          setTimeout(() => otpInputs.current[0]?.focus(), 100);
          Alert.alert('OTP Resent', 'A new code has been sent.');
        } else {
          setIsLoading(false);
          Alert.alert('Error', result.error || 'Failed to resend OTP');
        }
      } catch (error) {
        setIsLoading(false);
        Alert.alert('Error', 'Failed to resend OTP');
      }
    }
  };

  const handleBackToPhone = () => {
    setStep(1);
    setOtp(['', '', '', '']);
    setCountdown(30);
    setCanResend(false);
    setPhoneError('');


    // Focus back on phone input
    setTimeout(() => {
      phoneInputRef.current?.focus();
    }, 100);
  };

  const handleOtpChange = (text, index) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = cleaned;
      setOtp(newOtp);

      // Auto-focus next input
      if (cleaned && index < 5) {
        otpInputs.current[index + 1]?.focus();
      }

      // Auto-submit when all 6 digits are filled
      if (cleaned && index === 5) {
        const finalOtp = [...newOtp];
        if (finalOtp.every(digit => digit !== '')) {
          handleVerifyOTP(finalOtp.join(''));
        }
      }
    }
  };

  const handleOtpKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (enteredOtp = null) => {
    const otpToVerify = enteredOtp || otp.join('');

    if (otpToVerify.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter all 6 digits');
      return;
    }

    setIsLoading(true);

    try {
      const result = await verifyOTP(confirmation, otpToVerify);

      if (result.success) {
        // Sync with our MongoDB backend
        try {
          const syncResponse = await axios.post(`${API_BASE_URL}/auth/firebase-login`, {
            phone: phoneNumber,
            uid: result.user.uid
          });

          if (syncResponse.data.success) {
            const mongoUser = syncResponse.data.user;
            await AsyncStorage.setItem('user', JSON.stringify(mongoUser));
            login(mongoUser);
            setIsLoading(false);
            navigation.replace('MainTabs');
          } else {
            setIsLoading(false);
            Alert.alert('Sync Error', 'Failed to sync with backend.');
          }
        } catch (syncError) {
          console.error('[Auth] Backend Sync Error:', syncError);
          // Even if sync fails, we have the Firebase user. 
          // But for this app, we need the MongoDB _id.
          setIsLoading(false);
          Alert.alert('Backend Error', 'Could not connect to the server.');
        }
      } else {
        setIsLoading(false);
        const errorCode = result.code ? ` (${result.code})` : '';
        Alert.alert('Invalid OTP', (result.error || 'Incorrect OTP') + errorCode);
      }
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };

  const formatCountdown = () => {
    const seconds = countdown % 60;
    return `0:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons name="hammer-wrench" size={36} color="#E84545" />
            <Text style={styles.logoText}>WorkEase</Text>
          </View>

          {/* Step 1: Phone Number */}
          {step === 1 && (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>Let's Get Started</Text>
              <Text style={styles.subtitle}>Enter your mobile number to continue</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Mobile Number</Text>
                <View style={[
                  styles.phoneInputWrapper,
                  phoneError ? styles.phoneInputError : null
                ]}>


                  <Text style={styles.countryCode}>+91</Text>
                  <TextInput
                    ref={phoneInputRef}
                    style={styles.phoneInput}
                    placeholder="Enter 10-digit number"
                    placeholderTextColor="#888"
                    value={phoneNumber}
                    onChangeText={handlePhoneChange}
                    keyboardType="phone-pad"
                    maxLength={10}
                    returnKeyType="done"
                    onSubmitEditing={handleGetOTP}
                    editable={!isLoading}
                    pointerEvents="auto"
                  />
                </View>
                {phoneError ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{phoneError}</Text>
                  </View>
                ) : null}


              </View>
            </View>
          )}

          {/* Step 2: OTP */}
          {step === 2 && (
            <View style={styles.stepContainer}>
              {/* Back button to change phone number */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBackToPhone}
                disabled={isLoading}
              >
                <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
                <Text style={styles.backButtonText}>Change Number</Text>
              </TouchableOpacity>

              <Text style={styles.title}>Enter OTP</Text>
              <Text style={styles.subtitle}>
                A 6-digit code has been sent to{'\n'}
                <Text style={styles.phoneNumberHighlight}>+91 {phoneNumber}</Text>
              </Text>


              {/* OTP input boxes */}
              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (otpInputs.current[index] = ref)}
                    style={[
                      styles.otpBox,
                      digit ? styles.otpBoxFilled : null,
                      isLoading && styles.otpBoxDisabled
                    ]}
                    value={digit}
                    onChangeText={(text) => handleOtpChange(text, index)}
                    onKeyPress={(e) => handleOtpKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    editable={!isLoading}
                    autoFocus={index === 0 && step === 2}
                    pointerEvents="auto"
                  />
                ))}
              </View>

              <TouchableOpacity
                onPress={handleResendOTP}
                disabled={!canResend || isLoading}
                style={styles.resendContainer}
              >
                <Text style={styles.resendText}>
                  Didn't receive code?{' '}
                  <Text style={[
                    styles.resendLink,
                    (!canResend || isLoading) && styles.resendLinkDisabled
                  ]}>
                    {canResend ? 'Resend OTP' : `Resend OTP (${formatCountdown()})`}
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* CTA Button */}
          <View style={styles.ctaContainer}>
            <TouchableOpacity
              onPress={step === 1 ? handleGetOTP : () => handleVerifyOTP()}
              activeOpacity={0.8}
              disabled={
                isLoading ||
                (step === 1 ? phoneNumber.length !== 10 : !otp.every(d => d))
              }
              style={[
                styles.ctaButton,
                (isLoading ||
                  (step === 1 && phoneNumber.length !== 10) ||
                  (step === 2 && !otp.every(d => d))
                ) && styles.ctaButtonDisabled
              ]}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.ctaText}>
                  {step === 1 ? 'Get OTP' : 'Verify OTP'}
                </Text>
              )}
            </TouchableOpacity>

            <Text style={styles.termsText}>
              By continuing, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> &{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 32,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 40,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Poppins-SemiBold',
  },
  stepContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'Poppins-Regular',
    lineHeight: 24,
  },
  phoneNumberHighlight: {
    color: '#333',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  inputContainer: {
    width: '100%',
    marginTop: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    fontFamily: 'Poppins-SemiBold',
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#EAEAEA',
    paddingHorizontal: 16,
    height: 56,
  },
  phoneInputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FFF1F1', // Light red background for error state
  },



  countryCode: {
    fontSize: 16,
    color: '#333',
    marginRight: 12,
    fontFamily: 'Poppins-Regular',
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontFamily: 'Poppins-Regular',
  },
  errorContainer: {
    marginTop: 8,
  },

  errorText: {

    fontSize: 13,
    color: '#EF4444',
    fontFamily: 'Poppins-Regular',
  },
  hintText: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
    fontFamily: 'Poppins-Regular',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 24,
  },
  otpBox: {
    borderColor: '#EAEAEA',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Poppins-SemiBold',
  },
  otpBoxFilled: {
    borderColor: '#E84545',
  },
  otpBoxDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB',
  },
  resendContainer: {

    marginTop: 24,
  },
  resendText: {
    fontSize: 14,
    color: '#888',
    fontFamily: 'Poppins-Regular',
  },
  resendLink: {
    fontWeight: '600',
    color: '#E84545',
    fontFamily: 'Poppins-SemiBold',
  },
  resendLinkDisabled: {
    color: '#9CA3AF',
  },
  ctaContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 32,
  },
  ctaButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#E84545',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E84545',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowColor: '#9CA3AF',
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    fontFamily: 'Poppins-SemiBold',
  },
  termsText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
    fontFamily: 'Poppins-Regular',
  },
  termsLink: {
    fontWeight: '600',
    color: '#333',
    textDecorationLine: 'underline',
    fontFamily: 'Poppins-SemiBold',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 16,
    gap: 4,
  },
  backButtonText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Poppins-Regular',
  },
});

export default OtpLoginScreen;
