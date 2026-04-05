import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

export default function SelectPaymentMethodScreen({ navigation, route }) {
  const [method, setMethod] = useState(route.params?.currentMethod || 'UPI');

  const methods = [
    { 
      id: 'UPI', 
      label: 'UPI', 
      icon: 'qr-code-sharp',
      subtitle: 'Google Pay, PhonePe, Paytm',
      iconType: 'Ionicons'
    },
    { 
      id: 'Card', 
      label: 'Credit/Debit Card', 
      icon: 'card',
      subtitle: 'Visa, Mastercard, Rupay',
      iconType: 'Ionicons'
    },
    { 
      id: 'Netbanking', 
      label: 'Netbanking', 
      icon: 'bank',
      subtitle: 'All major banks supported',
      iconType: 'MaterialCommunityIcons'
    },
    { 
      id: 'Cash', 
      label: 'Cash on Service', 
      icon: 'cash',
      subtitle: 'Pay after service completion',
      iconType: 'Ionicons'
    },
  ];

  const selectMethod = (m) => {
    setMethod(m.id);
    if (route.params?.setPaymentMethod) {
      route.params.setPaymentMethod(m.label);
    }
    setTimeout(() => {
      navigation.goBack();
    }, 150);
  };

  const getIcon = (item) => {
    if (item.iconType === 'MaterialCommunityIcons') {
      return <MaterialCommunityIcons name={item.icon} size={24} color="#666" />;
    }
    return <Ionicons name={item.icon} size={24} color="#666" />;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Payment Method</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Payment Options */}
      <View style={styles.optionsContainer}>
        {methods.map((m, index) => {
          const isSelected = method === m.id;
          return (
            <TouchableOpacity
              key={m.id}
              style={[
                styles.option,
                index === methods.length - 1 && styles.optionLast
              ]}
              onPress={() => selectMethod(m)}
              activeOpacity={0.7}
            >
              <View style={styles.optionLeft}>
                <View style={[
                  styles.iconContainer,
                  isSelected && styles.iconContainerSelected
                ]}>
                  {getIcon(m)}
                </View>
                
                <View style={styles.optionInfo}>
                  <Text style={styles.optionLabel}>{m.label}</Text>
                  <Text style={styles.optionSubtitle}>{m.subtitle}</Text>
                </View>
              </View>

              {isSelected ? (
                <View style={styles.checkmarkWrapper}>
                  <LinearGradient
                    colors={["#E84545", "#1A1A1A"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.checkmarkGradient}
                  >
                    <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                  </LinearGradient>
                </View>
              ) : (
                <View style={styles.uncheckedCircle} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.infoIconWrapper}>
          <LinearGradient
            colors={["#E84545", "#1A1A1A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.infoIconGradient}
          >
            <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" />
          </LinearGradient>
        </View>
        <View style={styles.infoTextContainer}>
          <Text style={styles.infoTitle}>Safe & Secure Payments</Text>
          <Text style={styles.infoText}>
            All transactions are encrypted and secure
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  title: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#000',
  },

  optionsContainer: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  optionLast: {
    borderBottomWidth: 0,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  iconContainerSelected: {
    backgroundColor: '#FFF3F3',
  },
  optionInfo: {
    flex: 1,
  },
  optionLabel: { 
    fontSize: 16, 
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  checkmarkWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
  },
  checkmarkGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uncheckedCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#D0D0D0',
  },

  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  infoIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 12,
  },
  infoIconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
  },
});