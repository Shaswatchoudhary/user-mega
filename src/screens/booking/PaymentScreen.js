import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Platform,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../constants/config';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Card, Button } from '../../components/common';
import { useLocation } from '../../context/LocationContext';
import firestore from '@react-native-firebase/firestore';

export default function PaymentScreen({ navigation, route }) {
  const { 
    totalAmount: initialAmount, 
    worker, 
    selectedDate, 
    selectedServices,
    bookingId, // Passed from TrackingScreen if ticket system used
    workDuration: showWorkDuration 
  } = route.params;
  const { selectedLocation } = useLocation();

  const [selectedMethod, setSelectedMethod] = useState('1'); // '1' = Cash
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentUnlocked, setPaymentUnlocked] = useState(!bookingId || route.params?.isPrePayment); // Unlocked if no bookingId (standard flow) or is pre-payment flow
  const [workTimes, setWorkTimes] = useState(null);

  // Countdown logic for cash booking
  const [countdown, setCountdown] = useState(10);
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [confirmMode, setConfirmMode] = useState(false);

  // Fallback promo codes (to be removed once Firestore is populated)
  const hardcodedPromoCodes = [
    { code: 'FIRST50', discount: 50, type: 'fixed' },
    { code: 'SAVE10', discount: 10, type: 'percentage' },
  ];


  // Listen for Payment Unlock status if tracking a ticket
  useEffect(() => {
    if (!bookingId) return;

    const unsubscribe = firestore()
      .collection('bookings')
      .doc(bookingId)
      .onSnapshot(doc => {
        if (doc.exists) {
          const data = doc.data();
          setPaymentUnlocked(data.paymentStatus === 'completed' ? true : data.paymentUnlocked || false);
          if (data.workStartTime && data.workEndTime) {
            setWorkTimes({
              start: data.workStartTime.toDate(),
              end: data.workEndTime.toDate()
            });
          }
        }
      });

    return () => unsubscribe();
  }, [bookingId]);

  const calculateDuration = () => {
    if (!workTimes) return null;
    const diff = Math.floor((workTimes.end - workTimes.start) / 1000);
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  useEffect(() => {
    let interval = null;
    if (isCountdownActive && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      clearInterval(interval);
      handleConfirmBooking();
    }
    return () => clearInterval(interval);
  }, [isCountdownActive, countdown]);

  const calculateDiscount = () => {
    if (!promoApplied) return 0;
    if (promoApplied.type === 'fixed') return promoApplied.discount;
    return Math.round((initialAmount * promoApplied.discount) / 100);
  };

  const discount = calculateDiscount();
  const finalAmount = initialAmount - discount;

  const handleApplyPromo = async () => {
    if (!promoCode || promoCode.trim() === '') return;
    
    setPromoError('');
    setIsLoading(true);

    try {
      // 1. Try to fetch from Firestore coupons collection
      const couponDoc = await firestore()
        .collection('coupons')
        .where('code', '==', promoCode.trim().toUpperCase())
        .where('isActive', '==', true)
        .limit(1)
        .get();
      
      if (!couponDoc.empty) {
        const coupon = couponDoc.docs[0].data();
        
        // Check expiry if exists
        if (coupon.expiresAt && coupon.expiresAt.toDate() < new Date()) {
          setPromoError('Code has expired');
          setPromoApplied(null);
          return;
        }
        
        setPromoApplied({
          code: coupon.code,
          discount: coupon.discountPercent || coupon.discountAmount,
          type: coupon.type === 'percent' ? 'percentage' : 'fixed'
        });
        return;
      }
      
      // 2. Fallback to hardcoded if Firestore has nothing
      const found = hardcodedPromoCodes.find(p => p.code === promoCode.toUpperCase());
      if (found) {
        setPromoApplied(found);
      } else {
        setPromoError('Invalid promo code');
        setPromoApplied(null);
      }
    } catch (error) {
      console.error('Promo validation error:', error);
      setPromoError('Could not validate code');
    } finally {
      setIsLoading(false);
    }
  };


  const handleConfirmBooking = async () => {
    setIsLoading(true);
    try {
      let userId = null;
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        userId = user._id;
      }

      if (bookingId) {
        if (route.params?.isPrePayment) {
          // Pre-service payment: Update payment status and wait for worker
          await firestore().collection('bookings').doc(bookingId).update({
            paymentStatus: 'completed',
            updatedAt: firestore.FieldValue.serverTimestamp(),
          });

          navigation.replace('WaitingForWorker', {
            bookingId: bookingId,
            workerId: worker.id || worker._id || worker.uid
          });
        } else {
          // Post-service payment (ticket closure): Update both payment and booking status
          await firestore().collection('bookings').doc(bookingId).update({
            paymentStatus: 'completed',
            status: 'completed'
          });
          
          // Navigation to Rating/Status
          navigation.replace('BookingStatus', {
            worker: worker,
            service: selectedServices?.[0]?.name || "Home Service",
            date: selectedDate,
            isPaymentComplete: true
          });
        }
      } else {
        // Legacy flow: create new booking
        const payload = {
          workerId: worker._id || worker.id,
          userId: userId,
          category: worker.specialization || worker.category,
          serviceType: selectedServices?.[0]?.name || "Home Service",
          address: selectedLocation?.address || "Refer to summary",
          userLat: selectedLocation?.coords?.latitude || 16.7050,
          userLng: selectedLocation?.coords?.longitude || 74.2433,
          date: selectedDate,
          status: 'pending' // starts as pending
        };

        // Navigate to Status
        navigation.replace('BookingStatus', {
          worker: worker,
          service: payload.serviceType,
          date: selectedDate
        });

        // Background API call
        axios.post(`${API_BASE_URL}/booking`, payload).catch(console.error);
      }

    } catch (error) {
      Alert.alert("Error", "Action failed");
    } finally {
      setIsLoading(false);
    }
  };

  const duration = calculateDuration();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Worker Summary Section */}
        <View style={styles.workerSummary}>
          <View style={styles.workerAvatar}>
            <Text style={styles.workerAvatarText}>
              {(worker?.name || 'W')[0].toUpperCase()}
            </Text>
          </View>
          <View style={styles.workerDetails}>
            <Text style={styles.workerName}>{worker?.name || 'Your Professional'}</Text>
            <View style={styles.serviceTag}>
              <Text style={styles.serviceTagText}>{selectedServices?.[0]?.name || worker?.serviceType || 'Home Service'}</Text>
            </View>
          </View>
          <View style={styles.dateInfo}>
            <Text style={styles.dateLabel}>Date</Text>
            <Text style={styles.dateValue}>{selectedDate || 'Today'}</Text>
          </View>
        </View>

        {/* Ticket Lock Notice */}
        {!paymentUnlocked && (
          <View style={styles.lockNotice}>
            <View style={styles.lockIconBg}>
              <Ionicons name="lock-closed" size={18} color="#854d0e" />
            </View>
            <View style={styles.lockContent}>
              <Text style={styles.lockTitle}>Payment is Locked</Text>
              <Text style={styles.lockText}>Unlocked once the professional closes the service ticket.</Text>
            </View>
          </View>
        )}

        {/* Amount Card - Premium Gradient */}
        <LinearGradient
          colors={paymentUnlocked ? ['#E84545', '#B32D2D'] : ['#94A3B8', '#64748B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.amountCard}
        >
          <View style={styles.amountInner}>
            <View>
              <Text style={styles.amountLabel}>Total Payable</Text>
              <Text style={styles.amountValue}>₹{finalAmount}</Text>
            </View>
            <View style={styles.amountIconCircle}>
              <MaterialCommunityIcons name="wallet-outline" size={32} color="#FFF" />
            </View>
          </View>
          {discount > 0 && (
            <View style={styles.savedBadge}>
              <MaterialCommunityIcons name="check-decagram" size={14} color="#FFF" />
              <Text style={styles.savedText}>You saved ₹{discount} today</Text>
            </View>
          )}
        </LinearGradient>

        {/* Work Duration Info */}
        {duration && (
          <View style={styles.durationCard}>
            <View style={styles.durationIconBox}>
              <MaterialCommunityIcons name="clock-outline" size={22} color={colors.accent} />
            </View>
            <View style={styles.durationInfo}>
              <Text style={styles.durationLabel}>Service Duration</Text>
              <Text style={styles.durationValue}>{duration}</Text>
            </View>
          </View>
        )}

        {/* Payment Methods Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Select Payment Method</Text>
            <Text style={styles.sectionSubtitle}>Choose how you want to pay</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            style={[
              styles.methodCard,
              selectedMethod === '1' && styles.methodCardActive,
              !paymentUnlocked && styles.methodCardDisabled
            ]}
            onPress={() => paymentUnlocked && setSelectedMethod('1')}
            disabled={!paymentUnlocked}
          >
            <View style={[styles.methodIconBox, selectedMethod === '1' && styles.methodIconBoxActive]}>
              <MaterialCommunityIcons 
                name="cash-multiple" 
                size={24} 
                color={selectedMethod === '1' ? '#FFF' : colors.accent} 
              />
            </View>
            <View style={styles.methodCardInfo}>
              <View style={styles.methodTitleRow}>
                <Text style={styles.methodName}>Cash After Service</Text>
                {selectedMethod === '1' && (
                  <View style={styles.selectedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.accent} />
                  </View>
                )}
              </View>
              <Text style={styles.methodDesc}>Pay directly to the professional in person</Text>
            </View>
          </TouchableOpacity>

          <View style={[styles.methodCard, styles.methodCardDisabled, { opacity: 0.5 }]}>
            <View style={styles.methodIconBox}>
              <MaterialCommunityIcons name="credit-card-outline" size={24} color="#94A3B8" />
            </View>
            <View style={styles.methodCardInfo}>
              <Text style={[styles.methodName, { color: '#94A3B8' }]}>Online / UPI</Text>
              <Text style={styles.methodDesc}>Coming soon to your area</Text>
            </View>
          </View>
        </View>

        {/* Promo Code Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Offers & Benefits</Text>
          <View style={styles.promoContainer}>
            <MaterialCommunityIcons name="ticket-percent-outline" size={24} color={colors.accent} />
            <TextInput
              style={styles.promoTextInput}
              placeholder="Enter coupon code"
              value={promoCode}
              onChangeText={setPromoCode}
              autoCapitalize="characters"
              editable={paymentUnlocked}
              placeholderTextColor="#94A3B8"
            />
            <TouchableOpacity
              onPress={handleApplyPromo}
              disabled={!promoCode || !paymentUnlocked}
              style={[styles.applyButton, (!promoCode || !paymentUnlocked) && styles.applyButtonDisabled]}
            >
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
          {promoError ? <Text style={styles.promoError}>{promoError}</Text> : null}
          {promoApplied && <Text style={styles.promoSuccess}>✓ Coupon {promoApplied.code} applied!</Text>}
        </View>

        {/* Detailed Bill Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill Summary</Text>
          <View style={styles.billCard}>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Service Fee</Text>
              <Text style={styles.billValue}>₹{initialAmount}</Text>
            </View>
            {discount > 0 && (
              <View style={styles.billRow}>
                <Text style={[styles.billLabel, { color: '#10B981' }]}>Coupon Discount</Text>
                <Text style={[styles.billValue, { color: '#10B981' }]}>-₹{discount}</Text>
              </View>
            )}
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Convenience Fee</Text>
              <Text style={styles.billValue}>FREE</Text>
            </View>
            <View style={styles.billDivider} />
            <View style={styles.totalRow}>
              <View>
                <Text style={styles.totalLabel}>Total Payable</Text>
                <Text style={styles.inclusiveText}>Incl. all taxes</Text>
              </View>
              <Text style={styles.totalAmount}>₹{finalAmount}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        {!confirmMode ? (
          <Button
            title={selectedMethod === '1' ? "Confirm Booking" : `Pay ₹${finalAmount}`}
            disabled={!paymentUnlocked || isLoading}
            onPress={() => {
              if (selectedMethod === '1') {
                setConfirmMode(true);
                setIsCountdownActive(true);
              } else {
                handleConfirmBooking();
              }
            }}
          />
        ) : (
          <View style={styles.confirmingView}>
            <Text style={styles.confirmingText}>Confirming in {countdown}s...</Text>
            <TouchableOpacity onPress={() => { setConfirmMode(false); setIsCountdownActive(false); setCountdown(10); }}>
              <Text style={styles.cancelLink}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: '800', 
    color: "#1A1A1A",
    letterSpacing: -0.5,
  },
  backButton: { 
    width: 40, 
    height: 40, 
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    justifyContent: "center",
    alignItems: 'center',
  },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20 },
  
  // Worker Summary
  workerSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  workerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#E84545',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  workerAvatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
  },
  workerDetails: {
    flex: 1,
  },
  workerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  serviceTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  serviceTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E84545',
  },
  dateInfo: {
    alignItems: 'flex-end',
  },
  dateLabel: {
    fontSize: 10,
    color: '#94A3B8',
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },

  lockNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    padding: 14,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    gap: 12,
  },
  lockIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockContent: {
    flex: 1,
  },
  lockTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 2,
  },
  lockText: {
    fontSize: 11,
    color: '#B45309',
    lineHeight: 16,
  },

  amountCard: {
    padding: 24,
    borderRadius: 24,
    marginBottom: 24,
    elevation: 8,
    shadowColor: '#E84545',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  amountInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -1,
  },
  amountIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  savedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 16,
    gap: 6,
  },
  savedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },

  durationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 14,
  },
  durationIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationInfo: {
    flex: 1,
  },
  durationLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 2,
  },
  durationValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },

  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },

  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 18,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#F1F5F9',
  },
  methodCardActive: {
    borderColor: '#E84545',
    backgroundColor: '#FFF9F9',
  },
  methodCardDisabled: {
    backgroundColor: '#F8FAFC',
    borderColor: '#F1F5F9',
  },
  methodIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  methodIconBoxActive: {
    backgroundColor: '#E84545',
  },
  methodCardInfo: {
    flex: 1,
  },
  methodTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  methodName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  methodDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },

  promoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    gap: 12,
  },
  promoTextInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  applyButton: {
    backgroundColor: '#E84545',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  applyButtonDisabled: {
    backgroundColor: '#94A3B8',
    opacity: 0.5,
  },
  applyButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  promoError: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
    fontWeight: '600',
  },
  promoSuccess: {
    color: '#10B981',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
    fontWeight: '600',
  },

  billCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  billLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  billValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  billDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 16,
    borderStyle: 'dashed',
    borderRadius: 1,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  inclusiveText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '900',
    color: '#E84545',
    letterSpacing: -0.5,
  },

  bottomBar: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  confirmingView: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  confirmingText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#E84545',
    marginBottom: 4,
  },
  cancelLink: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});