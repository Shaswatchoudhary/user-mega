import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, typography, spacing, borderRadius } from '../../theme';

const PrivacyScreen = ({ navigation }) => {
  const sections = [
    {
      title: 'Data Collection',
      content: 'We collect minimal information such as your name, phone number, and service address to provide a seamless booking experience.',
      icon: 'document-text-outline'
    },
    {
      title: 'Location Services',
      content: 'Precise location data is used only when the app is in use to connect you with the nearest available service professionals.',
      icon: 'location-outline'
    },
    {
      title: 'Secure Payments',
      content: 'We use encrypted payment gateways and do not store your credit card or sensitive financial information on our servers.',
      icon: 'shield-checkmark-outline'
    },
    {
      title: 'Information Sharing',
      content: 'Your contact details are shared only with the assigned professional for the specific duration of your service booking.',
      icon: 'share-social-outline'
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <Ionicons name="lock-closed" size={40} color={colors.accent} />
          </View>
          <Text style={styles.heroTitle}>Your Privacy is our Priority</Text>
          <Text style={styles.heroSubtitle}>
            Learn how we handle your data and maintain your trust in the WorkEase ecosystem.
          </Text>
        </View>

        <View style={styles.sectionsContainer}>
          {sections.map((item, index) => (
            <View key={index} style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.iconCircle}>
                  <Ionicons name={item.icon} size={20} color={colors.accent} />
                </View>
                <Text style={styles.sectionTitle}>{item.title}</Text>
              </View>
              <Text style={styles.sectionBody}>{item.content}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footerInfo}>
          <Ionicons name="information-circle" size={20} color="#94A3B8" />
          <Text style={styles.footerText}>
            For more details or requests regarding your data, please contact our privacy officer at privacy@workies.com
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
    borderBottomColor: '#F1F5F9',
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
  content: {
    padding: 24,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 10,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: colors.accent + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroTitle: {
    ...typography.h2,
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    ...typography.body,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  sectionsContainer: {
    gap: 16,
  },
  sectionCard: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    ...typography.bodyLarge,
    fontWeight: '700',
    color: '#1E293B',
  },
  sectionBody: {
    ...typography.bodySmall,
    color: '#64748B',
    lineHeight: 22,
  },
  footerInfo: {
    flexDirection: 'row',
    marginTop: 40,
    padding: 20,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    gap: 12,
  },
  footerText: {
    flex: 1,
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
});

export default PrivacyScreen;
