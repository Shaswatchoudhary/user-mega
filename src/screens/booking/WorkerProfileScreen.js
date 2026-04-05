import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { Rating, Button, Badge } from '../../components/common';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const WorkerProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { worker } = route.params;

  const [selectedServices, setSelectedServices] = useState([]);
  const [showFullBio, setShowFullBio] = useState(false);

  // Mock services if not present in worker object
  const services = worker.services || [
    { id: '1', name: 'Standard Service', price: worker.rate || 500, duration: 60 },
    { id: '2', name: 'Premium Service', price: (worker.rate || 500) + 200, duration: 90 },
  ];

  const handleServiceToggle = (service) => {
    // Single select logic: if same selected, deselect. If different, replace.
    setSelectedServices([service]);
  };

  const handleBookNow = () => {
    const finalServices = selectedServices.length > 0 ? selectedServices : [services[0]];
    navigation.navigate('BookingSummary', {
      worker: worker,
      selectedServices: finalServices
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Image source={{ uri: worker.image || worker.photo }} style={styles.heroImage} />
          {/* Subtle white fade instead of dark gradient */}
          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.7)', colors.white]}
            style={styles.heroGradient}
          />
          <SafeAreaView style={styles.heroHeader} edges={['top']}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.favoriteButton}>
              <Ionicons name="heart-outline" size={24} color={colors.white} />
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        {/* Worker Info */}
        <View style={styles.infoSection}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{worker.name}</Text>
            {worker.verified && (
              <Badge text="Verified" variant="success" style={styles.verifiedBadge} />
            )}
          </View>
          <Text style={styles.category}>{worker.specialization || worker.category}</Text>

          <View style={styles.statsRow}>
            <Rating rating={worker.rating} reviewCount={worker.reviewCount} />
          </View>

          <View style={styles.quickStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{worker.experience}</Text>
              <Text style={styles.statLabel}>Exp</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{worker.completedJobs || worker.reviewCount || 0}</Text>
              <Text style={styles.statLabel}>Jobs</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{worker.distance || '0.5'}</Text>
              <Text style={styles.statLabel}>km Away</Text>
            </View>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text
            style={styles.bioText}
            numberOfLines={showFullBio ? undefined : 3}
          >
            {worker.bio || "Professional service provider with years of experience in the field. Committed to delivering high-quality work and ensuring customer satisfaction."}
          </Text>
          {(worker.bio?.length > 150) && (
            <TouchableOpacity onPress={() => setShowFullBio(!showFullBio)}>
              <Text style={styles.readMore}>
                {showFullBio ? 'Show less' : 'Read more'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Services Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services</Text>
          {services.map((service) => {
            const isSelected = selectedServices.some((s) => s.id === service.id);
            return (
              <TouchableOpacity
                key={service.id}
                style={[
                  styles.serviceItem,
                  isSelected && styles.serviceItemSelected
                ]}
                onPress={() => handleServiceToggle(service)}
              >
                <View style={styles.serviceInfo}>
                  <Text style={[styles.serviceName, isSelected && styles.serviceNameSelected]}>
                    {service.name}
                  </Text>
                  {service.duration && (
                    <Text style={[styles.serviceDuration, isSelected && styles.serviceDurationSelected]}>
                      {service.duration} mins
                    </Text>
                  )}
                </View>
                <Text style={[styles.servicePrice, isSelected && styles.servicePriceSelected]}>
                  ₹{service.price}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Reviews Section - MOVED FROM SUMMARY */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reviews & Ratings</Text>
          {[
            { id: '1', name: 'Aakash Sharma', rating: 5, text: 'Excellent service! Very professional and punctual.' },
            { id: '2', name: 'Priya Verma', rating: 4, text: 'Great work, fixed the issue quickly. Highly recommended.' },
            { id: '3', name: 'Rahul Gupta', rating: 5, text: 'Very polite and skilled. Cleared everything after work.' }
          ].map(review => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewUser}>{review.name}</Text>
                <View style={styles.reviewStars}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Ionicons
                      key={star}
                      name={star <= review.rating ? "star" : "star-outline"}
                      size={14}
                      color="#F59E0B"
                    />
                  ))}
                </View>
              </View>
              <Text style={styles.reviewText}>{review.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Bottom Bar - Simpler as requested */}
      <View style={styles.bottomBar}>
        <Button
          title="Book Now"
          onPress={handleBookNow}
          style={styles.bookButton}
          icon="arrow-forward"
          iconPosition="right"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Pure white background
  },
  heroSection: {
    height: 300,
    position: 'relative',
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: 300,
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  heroHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF', // Clean white background as per requested "simple arrow" but arrow needs contrast
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoSection: {
    paddingHorizontal: spacing.lg,
    marginTop: -spacing.xl,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  name: {
    ...typography.h1,
    color: '#1A1A1A', // Primary text
    marginRight: spacing.sm,
  },
  verifiedBadge: {
    marginLeft: spacing.xs,
  },
  category: {
    ...typography.body,
    color: '#6B7280', // Secondary text
    marginBottom: spacing.sm,
  },
  statsRow: {
    marginBottom: spacing.md,
  },
  quickStats: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB', // Very light grey instead of dark
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.h2,
    color: colors.accent,
  },
  statLabel: {
    ...typography.caption,
    color: '#6B7280',
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: '#1A1A1A',
    marginBottom: spacing.md,
  },
  bioText: {
    ...typography.body,
    color: '#4B5563',
    lineHeight: 24,
  },
  readMore: {
    ...typography.bodySmall,
    color: colors.accent,
    marginTop: spacing.xs,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // White background for service items
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    // shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  serviceItemSelected: {
    borderColor: colors.accent,
    backgroundColor: '#FFF1F1', // Light red background as requested
    borderWidth: 2,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    ...typography.body,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  serviceNameSelected: {
    fontWeight: '700',
    color: colors.accent,
  },
  serviceDuration: {
    ...typography.caption,
    color: '#6B7280',
    marginTop: 2,
  },
  serviceDurationSelected: {
    color: colors.accent,
    opacity: 0.8,
  },
  servicePrice: {
    ...typography.body,
    color: '#1A1A1A',
    fontWeight: '700',
  },
  servicePriceSelected: {
    color: colors.accent,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    // shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  reviewUser: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewText: {
    ...typography.caption,
    color: '#6B7280',
    lineHeight: 18,
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
  },
  bookButton: {
    width: '100%',
  },
});

export default WorkerProfileScreen;
