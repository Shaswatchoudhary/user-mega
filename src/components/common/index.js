import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, typography, borderRadius, spacing } from '../../theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

export const Card = ({ children, style }) => (
  <View style={[styles.card, style]}>
    {children}
  </View>
);

export const Button = ({ title, onPress, style, icon, iconPosition = 'left', loading, variant = 'primary' }) => {
  const content = (
    <>
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <View style={styles.buttonContent}>
          {icon && iconPosition === 'left' && <Ionicons name={icon} size={20} color={colors.white} style={{ marginRight: 8 }} />}
          <Text style={styles.buttonText}>{title}</Text>
          {icon && iconPosition === 'right' && <Ionicons name={icon} size={20} color={colors.white} style={{ marginLeft: 8 }} />}
        </View>
      )}
    </>
  );

  return (
    <TouchableOpacity onPress={onPress} style={[styles.button, style]} disabled={loading}>
      <LinearGradient
        colors={[colors.accent, '#1A1A1A']} // Red to Black gradient as requested
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {content}
      </LinearGradient>
    </TouchableOpacity>
  );
};

export const Input = ({ ...props }) => (
  <View style={styles.inputContainer}>
    {/* Minimal implementation */}
  </View>
);

export const Badge = ({ text, variant = 'primary', style }) => (
  <View style={[styles.badge, styles[`badge_${variant}`], style]}>
    <Text style={[styles.badgeText, styles[`badgeText_${variant}`]]}>{text}</Text>
  </View>
);

export const Rating = ({ rating, reviewCount }) => (
  <View style={styles.ratingRow}>
    <Ionicons name="star" size={16} color="#F59E0B" />
    <Text style={styles.ratingText}>{rating}</Text>
    {reviewCount !== undefined && <Text style={styles.reviewCount}>({reviewCount} reviews)</Text>}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    // Soft shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  button: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  gradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    ...typography.button,
    color: colors.white,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  badge_success: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  badgeText: {
    ...typography.caption,
    fontWeight: '600',
  },
  badgeText_success: {
    color: colors.success,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontWeight: '700',
    marginLeft: 4,
  },
  reviewCount: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: 4,
  },
});
