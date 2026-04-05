import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
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
              <Text>Service Total</Text>
              <Text>₹{initialAmount}</Text>
            </View>
            {discount > 0 && (
              <View style={styles.priceRow}>
                <Text style={{ color: colors.success }}>Discount</Text>
                <Text style={{ color: colors.success }}>- ₹{discount}</Text>
              </View>
            )}
            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={{ fontWeight: '700' }}>Total</Text>
              <Text style={{ fontWeight: '800', color: colors.accent, fontSize: 18 }}>₹{finalAmount}</Text>
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
    padding: spacing.md,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFEF"
  },
  headerTitle: { ...typography.h3, color: "#1A1A1A" },
  backButton: { width: 40, height: 40, justifyContent: "center" },
  scrollView: { flex: 1 },
  scrollContent: { padding: spacing.lg },
  amountCard: {
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    marginBottom: spacing.lg,
    // Soft shadow
    shadowColor: '#E84545',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  amountLabel: { ...typography.caption, color: "rgba(255,255,255,0.9)" },
  amountValue: { ...typography.display, color: "#FFF" },
  savedText: { ...typography.caption, color: "#FFF", backgroundColor: "rgba(0,0,0,0.1)", padding: 4, borderRadius: 10, marginTop: 8 },
  section: { marginBottom: spacing.lg },
  sectionTitle: { ...typography.body, fontWeight: "700", color: "#1A1A1A", marginBottom: spacing.sm },
  promoInputRow: { flexDirection: "row", gap: 10 },
  promoInput: { flex: 1, backgroundColor: "#FFF", padding: 12, borderRadius: 8, borderWidth: 1, borderColor: "#DDD" },
  applyBtn: { backgroundColor: colors.accent, paddingHorizontal: 20, justifyContent: "center", borderRadius: 8 },
  applyBtnDisabled: { opacity: 0.5 },
  applyBtnText: { color: "#FFF", fontWeight: "700" },
  methodRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#EEE",
    gap: 12,
    // Soft shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  methodSelected: { borderColor: colors.accent, backgroundColor: "#FFF5F5" },
  methodText: { ...typography.bodySmall, fontWeight: "600", flex: 1, color: "#1A1A1A" },
  whiteCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    // Soft shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  priceRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
  totalRow: { borderTopWidth: 1, borderTopColor: "#EEE", marginTop: 8, paddingTop: 8 },
  bottomBar: {
    padding: spacing.lg,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EEE"
  },
  confirmingView: { alignItems: "center" },
  confirmingText: { ...typography.h3, color: colors.accent },
  cancelLink: { color: "#666", marginTop: 8, textDecorationLine: "underline" },
  errorText: { color: colors.error, fontSize: 12, marginTop: 4 },
  successText: { color: colors.success, fontSize: 12, marginTop: 4 },
});