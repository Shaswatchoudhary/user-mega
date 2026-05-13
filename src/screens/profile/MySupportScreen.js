import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, typography, spacing, borderRadius } from '../../theme';

const MySupportScreen = ({ navigation }) => {
  const contactOptions = [
    {
      id: 'phone',
      title: 'Call Support',
      subtitle: 'Talk to our representative',
      icon: 'call-outline',
      color: '#3B82F6',
      onPress: () => Linking.openURL('tel:+919579499891'),
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp Us',
      subtitle: 'Instant chat support',
      icon: 'logo-whatsapp',
      color: '#10B981',
      onPress: () => Linking.openURL('whatsapp://send?phone=+919579499891'),
    },
    {
      id: 'email',
      title: 'Email Support',
      subtitle: 'Send us your queries',
      icon: 'mail-outline',
      color: '#E84545',
      onPress: () => Linking.openURL('mailto:support@workease.com'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="headset" size={48} color={colors.accent} />
          </View>
          <Text style={styles.heroTitle}>How can we help you?</Text>
          <Text style={styles.heroSubtitle}>
            Our support team is available from 9 AM to 9 PM to assist you with any issues.
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          {contactOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionCard}
              onPress={option.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.optionIconContainer, { backgroundColor: option.color + '15' }]}>
                <Ionicons name={option.icon} size={28} color={option.color} />
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Office Address</Text>
          <Text style={styles.infoText}>
            WorkEase, 560, E Ward, Ruikar Colony Kawala Naka,{"\n"}
            Kolhapur, Maharashtra - 416005
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.black,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.accent + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  heroTitle: {
    ...typography.h2,
    color: '#0F172A',
    marginBottom: 12,
    textAlign: 'center',
  },
  heroSubtitle: {
    ...typography.body,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  optionsContainer: {
    gap: 16,
    marginBottom: 40,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  optionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    ...typography.bodyLarge,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  optionSubtitle: {
    ...typography.caption,
    color: '#94A3B8',
  },
  infoCard: {
    backgroundColor: '#F1F5F9',
    padding: 24,
    borderRadius: 20,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  infoTitle: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoText: {
    ...typography.body,
    color: '#64748B',
    lineHeight: 22,
  },
});

export default MySupportScreen;
