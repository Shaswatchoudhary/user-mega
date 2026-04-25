import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { colors, typography } from '../theme';

const CustomModal = ({
  visible,
  type = 'info',
  title,
  message,
  primaryLabel = 'Got it',
  secondaryLabel,
  onPrimary,
  onSecondary,
}) => {
  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleValue, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return '#10B981';
      case 'info':
        return '#3B82F6';
      case 'warning':
        return '#F59E0B';
      case 'error':
        return '#EF4444';
      default:
        return colors.accent;
    }
  };

  const getIconName = () => {
    switch (type) {
      case 'success':
        return 'checkmark-outline';
      case 'info':
        return 'information-outline';
      case 'warning':
        return 'warning-outline';
      case 'error':
        return 'close-outline';
      default:
        return 'information-outline';
    }
  };

  const iconColor = getIconColor();

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.card,
            {
              opacity: opacityValue,
              transform: [{ scale: scaleValue }],
            },
          ]}
        >
          {/* Icon Ring */}
          <View style={[styles.iconRing, { borderColor: iconColor + '20' }]}>
            <View style={[styles.iconInner, { backgroundColor: iconColor }]}>
              <Ionicons name={getIconName()} size={32} color="#FFF" />
            </View>
          </View>

          {/* Text Content */}
          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
          </View>

          {/* Buttons */}
          <View style={[styles.buttonContainer, secondaryLabel ? styles.row : styles.column]}>
            {secondaryLabel && (
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.button, styles.secondaryButton]}
                onPress={onSecondary}
              >
                <Text style={styles.secondaryButtonText}>{secondaryLabel}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.button,
                { backgroundColor: colors.accent },
                !secondaryLabel && styles.fullWidth,
              ]}
              onPress={onPrimary}
            >
              <Text style={styles.primaryButtonText}>{primaryLabel}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#FFF',
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  iconRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    ...typography.h2,
    color: '#0F172A',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    ...typography.bodySmall,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  row: {
    flexDirection: 'row',
  },
  column: {
    flexDirection: 'column',
  },
  button: {
    flex: 1,
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullWidth: {
    width: '100%',
    flex: 0,
  },
  primaryButtonText: {
    ...typography.button,
    color: '#FFF',
  },
  secondaryButton: {
    backgroundColor: '#F1F5F9',
  },
  secondaryButtonText: {
    ...typography.button,
    color: '#475569',
  },
});

export default CustomModal;
