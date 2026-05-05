import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, typography, spacing, borderRadius } from '../../theme';

const { width } = Dimensions.get('window');

const AboutWorkiesScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Workies</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.brandHero}>
          <View style={styles.logoContainer}>
            <Ionicons name="flash" size={60} color={colors.white} />
          </View>
          <Text style={styles.brandName}>WorkEase</Text>
          <Text style={styles.brandTagline}>Premium Home Services, Simplified.</Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>v1.0.0 (Stable)</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.sectionBody}>
            WorkEase is dedicated to bridging the gap between skilled local professionals and households in Kolhapur.
            We believe that finding a reliable electrician, plumber, or beautician should be as easy as ordering a meal.
          </Text>
        </View>

        <View style={styles.featureGrid}>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: '#EEF2FF' }]}>
              <Ionicons name="shield-checkmark" size={24} color="#4F46E5" />
            </View>
            <Text style={styles.featureTitle}>Verified</Text>
            <Text style={styles.featureDesc}>Background checked professionals</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="time" size={24} color="#10B981" />
            </View>
            <Text style={styles.featureTitle}>Instant</Text>
            <Text style={styles.featureDesc}>Real-time booking and tracking</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: '#FFF7ED' }]}>
              <Ionicons name="pricetag" size={24} color="#F97316" />
            </View>
            <Text style={styles.featureTitle}>Transparent</Text>
            <Text style={styles.featureDesc}>No hidden costs, fair pricing</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: '#FEF2F2' }]}>
              <Ionicons name="heart" size={24} color="#EF4444" />
            </View>
            <Text style={styles.featureTitle}>Trusted</Text>
            <Text style={styles.featureDesc}>Rated by thousands of users</Text>
          </View>
        </View>

        <View style={styles.visionCard}>
          <Text style={styles.visionTitle}>Our Vision</Text>
          <Text style={styles.visionText}>
            "To become the most trusted community-driven marketplace for local services in Maharashtra,
            empowering small businesses and creating job opportunities for the skilled workforce."
          </Text>
        </View>

        <Text style={styles.copyright}>© 2026 WorkEase Technologies Pvt. Ltd.{"\n"}Made with ❤️ in Kolhapur</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  scrollContent: {
    paddingBottom: 40,
  },
  brandHero: {
    alignItems: 'center',
    paddingVertical: 48,
    backgroundColor: '#F8FAFC',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  brandName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -1,
  },
  brandTagline: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  versionBadge: {
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 20,
  },
  versionText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '700',
  },
  section: {
    padding: 32,
  },
  sectionTitle: {
    ...typography.h2,
    color: '#0F172A',
    marginBottom: 16,
  },
  sectionBody: {
    ...typography.body,
    color: '#334155',
    lineHeight: 26,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 16,
  },
  featureItem: {
    width: (width - 56) / 2,
    backgroundColor: '#F8FAFC',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  visionCard: {
    margin: 32,
    padding: 24,
    backgroundColor: colors.accent,
    borderRadius: 32,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  visionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFCCCC',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 12,
  },
  visionText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
    lineHeight: 28,
    fontStyle: 'italic',
  },
  copyright: {
    textAlign: 'center',
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 20,
    lineHeight: 20,
  },
});

export default AboutWorkiesScreen;
