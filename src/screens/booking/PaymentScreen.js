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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../constants/config';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Card, Button } from '../../components/common';
import { useLocation } from '../../context/LocationContext';

export default function PaymentScreen({ navigation, route }) {
  const { totalAmount: initialAmount, worker, selectedDate, selectedServices } = route.params;
  const { selectedLocation } = useLocation();

  const [selectedMethod, setSelectedMethod] = useState('1'); // '1' = Cash
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Countdown logic for cash booking as per original code behavior
  const [countdown, setCountdown] = useState(10);
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [confirmMode, setConfirmMode] = useState(false);

  const promoCodes = [
    { code: 'FIRST50', discount: 50, type: 'fixed' },
    { code: 'SAVE10', discount: 10, type: 'percentage' },
  ];

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

  const handleApplyPromo = () => {
    setPromoError('');
    const found = promoCodes.find(p => p.code === promoCode.toUpperCase());
    if (found) {
      setPromoApplied(found);
    } else {
      setPromoError('Invalid promo code');
      setPromoApplied(null);
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

      const payload = {
        workerId: worker._id || worker.id,
        userId: userId,
        category: worker.specialization || worker.category,
        serviceType: selectedServices?.[0]?.name || "Home Service",
        address: selectedLocation?.address || "Refer to summary",
        userLat: selectedLocation?.coords?.latitude || 16.7050,
        userLng: selectedLocation?.coords?.longitude || 74.2433,
        date: selectedDate
      };

      // Navigate to Status/Confirmation screen
      navigation.replace('BookingStatus', {
        worker: worker,
        service: payload.serviceType,
        date: selectedDate
      });

      // Background API call
      axios.post(`${API_BASE_URL}/booking`, payload).catch(console.error);

    } catch (error) {
      Alert.alert("Error", "Booking failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Amount Card */}
        <LinearGradient
          colors={[colors.accent, '#8B0D16']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.amountCard}
        >
          <Text style={styles.amountLabel}>Amount to Pay</Text>
          <Text style={styles.amountValue}>₹{finalAmount}</Text>
          {discount > 0 && <Text style={styles.savedText}>You saved ₹{discount}!</Text>}
        </LinearGradient>

        {/* Promo Code */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Promo Code</Text>
          <View style={styles.promoInputRow}>
            <TextInput
              style={styles.promoInput}
              placeholder="Enter promo code"
              value={promoCode}
              onChangeText={setPromoCode}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={[styles.applyBtn, !promoCode && styles.applyBtnDisabled]}
              onPress={handleApplyPromo}
              disabled={!promoCode}
            >
              <Text style={styles.applyBtnText}>Apply</Text>
            </TouchableOpacity>
          </View>
          {promoError ? <Text style={styles.errorText}>{promoError}</Text> : null}
          {promoApplied && <Text style={styles.successText}>Code {promoApplied.code} applied!</Text>}
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <TouchableOpacity
            style={[styles.methodRow, selectedMethod === '1' && styles.methodSelected]}
            onPress={() => setSelectedMethod('1')}
          >
            <Ionicons name="cash-outline" size={24} color={colors.accent} />
            <Text style={styles.methodText}>Cash on Service</Text>
            {selectedMethod === '1' && <Ionicons name="checkmark-circle" size={24} color={colors.accent} />}
          </TouchableOpacity>

          <TouchableOpacity style={styles.methodRow} disabled={true}>
            <Ionicons name="card-outline" size={24} color="#999" />
            <Text style={[styles.methodText, { color: '#999' }]}>Online Payment (Disabled)</Text>
          </TouchableOpacity>
        </View>

        {/* Price Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Breakdown</Text>
          <Card style={styles.whiteCard}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Service Total</Text>
              <Text style={styles.priceValue}>₹{initialAmount}</Text>
            </View>
            {discount > 0 && (
              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, { color: colors.success }]}>Discount</Text>
                <Text style={[styles.priceValue, { color: colors.success }]}>- ₹{discount}</Text>
              </View>
            )}
            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹{finalAmount}</Text>
            </View>
          </Card>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        {!confirmMode ? (
          <Button
            title={selectedMethod === '1' ? "Confirm Booking" : `Pay ₹${finalAmount}`}
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
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF"
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: "#1A1A1A", fontFamily: 'Poppins-Bold' },
  backButton: { width: 40, height: 40, justifyContent: "center" },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20 },
  amountCard: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: '#E84545',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  amountLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    fontFamily: 'Poppins-Medium',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 42,
    fontWeight: "800",
    color: "#FFF",
    fontFamily: 'Poppins-Bold',
  },
  savedText: {
    fontSize: 12,
    color: "#FFF",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 12,
    overflow: 'hidden',
    fontFamily: 'Poppins-Medium',
  },
  section: { 
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  sectionTitle: { 
    fontSize: 16,
    fontWeight: "700", 
    color: "#1A1A1A", 
    marginBottom: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  promoInputRow: { 
    flexDirection: "row", 
    alignItems: 'center',
    gap: 12 
  },
  promoInput: { 
    flex: 1, 
    backgroundColor: "#FFF", 
    padding: 14, 
    borderRadius: 12, 
    borderWidth: 1.5, 
    borderColor: "#EEE",
    fontSize: 15,
    color: '#000',
    fontFamily: 'Poppins-Regular',
  },
  applyBtn: { 
    backgroundColor: colors.accent, 
    paddingHorizontal: 24, 
    height: 54,
    justifyContent: "center", 
    borderRadius: 12,
  },
  applyBtnDisabled: { opacity: 0.5 },
  applyBtnText: { 
    color: "#FFF", 
    fontWeight: "700",
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
  methodRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: "#F0F0F0",
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  methodSelected: { 
    borderColor: colors.accent, 
    backgroundColor: "#FFF9F9",
  },
  methodText: { 
    fontSize: 15,
    fontWeight: "600", 
    flex: 1, 
    color: "#1A1A1A",
    fontFamily: 'Poppins-Medium',
  },
  whiteCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  priceRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: 'center',
    paddingVertical: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  priceValue: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
  totalRow: { 
    borderTopWidth: 1, 
    borderTopColor: "#F0F0F0", 
    marginTop: 12, 
    paddingTop: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'Poppins-Bold',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.accent,
    fontFamily: 'Poppins-Bold',
  },
  bottomBar: {
    padding: 24,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  confirmingView: { 
    alignItems: "center",
    paddingVertical: 10,
  },
  confirmingText: { 
    fontSize: 18,
    fontWeight: '700',
    color: colors.accent,
    fontFamily: 'Poppins-Bold',
  },
  cancelLink: { 
    color: "#666", 
    marginTop: 8, 
    textDecorationLine: "underline",
    fontFamily: 'Poppins-Medium',
  },
  errorText: { 
    color: colors.error, 
    fontSize: 12, 
    marginTop: 6,
    marginLeft: 4,
    fontFamily: 'Poppins-Regular',
  },
  successText: { 
    color: colors.success, 
    fontSize: 12, 
    marginTop: 6,
    marginLeft: 4,
    fontFamily: 'Poppins-Regular',
  },
});