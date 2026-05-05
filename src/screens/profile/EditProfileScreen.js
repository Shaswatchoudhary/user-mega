import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../../constants/config';
import { useAuth } from '../../context/AuthContext';
import { colors, typography, spacing, borderRadius } from '../../theme';
import CustomModal from '../../components/CustomModal';

const EditProfileScreen = ({ navigation }) => {
  const { user, login } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phoneNumber || user?.phone || '');
  const [mongoId, setMongoId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    visible: false,
    type: 'success',
    title: '',
    message: '',
    onPrimary: () => {},
  });

  useEffect(() => {
    const loadFromStorage = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setMongoId(parsed._id || parsed.id || null);
          if (!name && parsed.name) setName(parsed.name);
          if (!phone && (parsed.phone || parsed.phoneNumber)) {
            setPhone(parsed.phone || parsed.phoneNumber);
          }
        }
      } catch (e) {
        console.error('Error loading user from storage:', e);
      }
    };
    loadFromStorage();
  }, []);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phoneNumber || user.phone || '');
    }
  }, [user]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/users/update`, {
        userId: mongoId || user?.uid || user?._id || user?.id,
        name: name.trim(),
        email: email.trim(),
      });

      if (response.data.success) {
        const updatedUser = response.data.user;
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        login(updatedUser);
        
        setModalConfig({
          visible: true,
          type: 'success',
          title: 'Success',
          message: 'Profile updated successfully',
          onPrimary: () => {
            setModalConfig(prev => ({ ...prev, visible: false }));
            navigation.goBack();
          }
        });
      } else {
        setModalConfig({
          visible: true,
          type: 'error',
          title: 'Update Failed',
          message: response.data.message || 'Failed to update profile',
          onPrimary: () => setModalConfig(prev => ({ ...prev, visible: false }))
        });
      }
    } catch (error) {
      console.error('[EditProfile] Error:', error);
      setModalConfig({
        visible: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to connect to the server. Please check your connection.',
        onPrimary: () => setModalConfig(prev => ({ ...prev, visible: false }))
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {name ? name.charAt(0).toUpperCase() : 'U'}
                </Text>
              </View>
              <TouchableOpacity style={styles.editAvatarButton}>
                <MaterialCommunityIcons name="camera-outline" size={20} color={colors.white} />
              </TouchableOpacity>
            </View>
            <Text style={styles.avatarSubtext}>Tap icon to change photo</Text>
          </View>

          {/* Form Section */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color={colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color={colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={[styles.inputWrapper, styles.disabledInput]}>
                <Ionicons name="call-outline" size={20} color={colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.textSecondary }]}
                  value={phone}
                  editable={false}
                />
                <Ionicons name="lock-closed-outline" size={16} color={colors.textTertiary} />
              </View>
              <Text style={styles.helperText}>Phone number cannot be changed</Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.disabledButton]}
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <CustomModal
        visible={modalConfig.visible}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        onPrimary={modalConfig.onPrimary}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.black,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: 40,
    fontWeight: 'bold',
  },
  editAvatarButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: colors.accent,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  avatarSubtext: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.sm,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 56,
    backgroundColor: colors.secondary,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
  },
  disabledInput: {
    backgroundColor: '#F9FAFB',
  },
  helperText: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveButton: {
    backgroundColor: colors.accent,
    height: 56,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  saveButtonText: {
    ...typography.button,
    color: colors.white,
  },
});

export default EditProfileScreen;
