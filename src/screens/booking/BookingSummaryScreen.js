import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Card, Button, Badge } from '../../components/common';
import { useLocation } from '../../context/LocationContext';

const BookingSummaryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { worker, selectedServices } = route.params;
  const { selectedLocation } = useLocation();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateMode, setDateMode] = useState('date'); // 'date' or 'time'

  const basePrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const platformFee = 20;
  const gst = Math.round(basePrice * 0.05);
  const totalAmount = basePrice + platformFee + gst;

  const onDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      if (date < new Date()) {
        Alert.alert("Invalid Selection", "Selected date/time cannot be in the past.");
        return;
      }
      setSelectedDate(date);
    }
  };

  const handleShowPicker = (mode) => {
    setDateMode(mode);
    setShowDatePicker(true);
  };


  const address = selectedLocation?.addressText || selectedLocation?.address || "Select your location";

  const handleContinue = () => {
    navigation.navigate('Payment', {
      totalAmount: totalAmount,
      worker: worker,
      selectedDate: selectedDate.toISOString(),
      selectedServices: selectedServices
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Summary</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Worker Card - White styling as requested */}
        <Card style={styles.workerCard}>
          <View style={styles.workerInfoRow}>
            <Image source={{ uri: worker.image || worker.photo }} style={styles.workerImage} />
            <View style={styles.workerDetails}>
              <View style={styles.nameRow}>
                <Text style={styles.workerName}>{worker.name}</Text>
                {worker.verified && (
                  <Ionicons name="checkmark-circle" size={16} color={colors.success} style={{ marginLeft: 4 }} />
                )}
              </View>
              <Text style={styles.workerCategory}>{worker.specialization || worker.category}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text style={styles.ratingText}>{worker.rating} • {worker.experience} Exp • {worker.reviewCount} Reviews</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Service Details Section */}
        {route.params?.preSelectedProduct && (
          <View style={styles.section}>
            <View style={styles.productNoteCard}>
              <View style={styles.productNoteHeader}>
                <Ionicons name="information-circle" size={18} color="#B91C1C" />
                <Text style={styles.productNoteTitle}>Professional Note</Text>
              </View>
              <Text style={styles.productNoteText}>
                Service requested for: <Text style={{ fontWeight: 'bold', color: '#111827' }}>{route.params.preSelectedProduct}</Text>
              </Text>
              <Text style={styles.productNoteSubtext}>Our professional will be informed of this specific requirement.</Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Details</Text>
          <Card style={styles.whiteCard}>
            {selectedServices.map((service, index) => (
              <View key={service.id} style={[styles.serviceRow, index !== 0 && styles.serviceDivider]}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.servicePrice}>₹{service.price}</Text>
              </View>
            ))}
            <View style={styles.totalDivider} />
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Base Price</Text>
              <Text style={styles.priceValue}>₹{basePrice}</Text>
            </View>
          </Card>
        </View>

        {/* Schedule Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          <Card style={styles.whiteCard}>
            <View style={styles.scheduleButtonsRow}>
              <TouchableOpacity
                style={styles.scheduleItem}
                onPress={() => handleShowPicker('date')}
              >
                <View style={styles.iconContainer}>
                  <Ionicons name="calendar-outline" size={20} color={colors.accent} />
                </View>
                <View style={styles.scheduleInfo}>
                  <Text style={styles.scheduleLabel}>Date</Text>
                  <Text style={styles.scheduleValue}>
                    {selectedDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
              </TouchableOpacity>

              <View style={styles.verticalDivider} />

              <TouchableOpacity
                style={styles.scheduleItem}
                onPress={() => handleShowPicker('time')}
              >
                <View style={styles.scheduleInfo}>
                  <Text style={styles.scheduleLabel}>Time</Text>
                  <Text style={styles.scheduleValue}>
                    {selectedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.locationContainer}
              onPress={() => navigation.navigate('LocationSelection')}
            >
              <View style={styles.iconContainer}>
                <Ionicons name="location-outline" size={20} color={colors.accent} />
              </View>
              <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleLabel}>Service Location</Text>
                <Text style={styles.scheduleValue} numberOfLines={2}>{address}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          </Card>
        </View>


        {/* Payment Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <Card style={styles.whiteCard}>
            <View style={styles.paymentRow}>
              <Ionicons name="cash-outline" size={20} color={colors.accent} />
              <Text style={styles.paymentText}>Cash on Service</Text>
              <Badge text="Default" style={{ marginLeft: 'auto' }} />
            </View>
            <Text style={styles.paymentNote}>Pay directly to the professional after service</Text>
          </Card>
        </View>

        {/* Price Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Breakdown</Text>
          <Card style={styles.whiteCard}>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Service Total</Text>
              <Text style={styles.billValue}>₹{basePrice}</Text>
            </View>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Platform Fee</Text>
              <Text style={styles.billValue}>₹{platformFee}</Text>
            </View>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>GST (5%)</Text>
              <Text style={styles.billValue}>₹{gst}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Grand Total</Text>
              <Text style={styles.totalValue}>₹{totalAmount}</Text>
            </View>
          </Card>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode={dateMode}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            minimumDate={new Date()}
          />
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <Button
          title="Continue to Payment"
          onPress={handleContinue}
          style={styles.continueButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5', // Light grey background as requested
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: '#FFFFFF', // Header white
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h3,
    color: '#1A1A1A',
  },
  placeholder: {
    width: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  workerCard: {
    backgroundColor: '#FFFFFF', // White card
    marginBottom: spacing.lg,
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
  workerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: spacing.md,
  },
  workerDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workerName: {
    ...typography.h3,
    color: '#1A1A1A',
  },
  workerCategory: {
    ...typography.caption,
    color: '#6B7280',
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#4B5563',
    marginLeft: 4,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.body,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: spacing.sm,
  },
  whiteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    padding: 16, // Added padding for better inner alignment
    // Soft shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  serviceDivider: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  serviceName: {
    ...typography.bodySmall,
    color: '#374151',
  },
  servicePrice: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  priceLabel: {
    ...typography.bodySmall,
    color: '#6B7280',
  },
  priceValue: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.accent,
  },
  totalDivider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: spacing.xs,
  },
  scheduleButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5', // Grey background as requested
    borderRadius: 16,
    padding: 16,
  },
  scheduleItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Centered horizontally
  },
  verticalDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#EAEAEA',
    marginHorizontal: spacing.sm,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleInfo: {
    flex: 1,
    gap: 2,
  },
  scheduleLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  scheduleValue: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: spacing.md,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8, // Consistent spacing
    alignItems: 'center',
  },
  billLabel: {
    ...typography.bodySmall,
    color: '#6B7280',
  },
  billValue: {
    ...typography.bodySmall,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
  },
  totalLabel: {
    ...typography.body,
    fontWeight: '800', // Bold total
    color: '#1A1A1A',
  },
  totalValue: {
    ...typography.h3,
    color: colors.accent,
    fontWeight: '900', // Extra bold
  },
  bottomPadding: {
    height: 100,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  continueButton: {
    width: '100%',
  },
  productNoteCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  productNoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  productNoteTitle: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#B91C1C',
    textTransform: 'uppercase',
  },
  productNoteText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#4B5563',
    lineHeight: 20,
  },
  productNoteSubtext: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#991B1B',
    marginTop: 4,
    opacity: 0.8,
  },
});

export default BookingSummaryScreen;
