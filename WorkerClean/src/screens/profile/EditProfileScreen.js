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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import config from '../../constants/config';
import { launchImageLibrary } from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import CustomModal from '../../components/CustomModal';


const EditProfileScreen = ({ navigation }) => {
  const { workerUser, workerProfile, refreshProfile } = useAuth();
  
  // Pre-fill from existing profile
  const [name, setName] = useState(workerProfile?.fullName || workerProfile?.name || '');
  const [email, setEmail] = useState(workerProfile?.email || workerUser?.email || '');
  const [phone, setPhone] = useState(workerProfile?.phone || workerProfile?.phoneNumber || workerUser?.phoneNumber || '');
  const [isLoading, setIsLoading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(workerProfile?.photo || workerProfile?.profilePhoto || null);
  const [uploading, setUploading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'success' });



  // IMPORTANT: Ensure form loads even if workerProfile was null at first render
  useEffect(() => {
    if (workerProfile) {
      setName(workerProfile.fullName || workerProfile.name || '');
      setEmail(workerProfile.email || workerUser?.email || '');
      setPhone(workerProfile.phone || workerProfile.phoneNumber || workerUser?.phoneNumber || '');
      setProfilePhoto(workerProfile.photo || workerProfile.profilePhoto || null);
    }
  }, [workerProfile]);


  const handlePickPhoto = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, async (response) => {
      if (!response.didCancel && response.assets?.[0]) {
        const asset = response.assets[0];
        setUploading(true);
        try {
          const uid = auth().currentUser?.uid;
          if (!uid) {
            Alert.alert('Error', 'User not authenticated');
            return;
          }
          const ref = storage().ref(`workers/${uid}/profile_photo.jpg`);
          await ref.putFile(asset.uri);
          const url = await ref.getDownloadURL();
          setProfilePhoto(url);
          // Save to Firestore immediately
          await firestore().collection('workers').doc(uid).update({ 
            photo: url,
            profilePhoto: url // Keep both for compatibility
          });
          Alert.alert('Success', 'Profile photo updated!');
        } catch (e) {
          console.error('Photo upload failed:', e);
          Alert.alert('Error', 'Failed to upload photo. Try again.');
        } finally {
          setUploading(false);
        }
      }
    });
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    const docId = auth().currentUser?.uid 
      || workerProfile?.id 
      || workerProfile?.uid 
      || workerUser?.uid;
    
    if (!docId) {
      Alert.alert('Error', 'Session expired. Please log in again.');
      return;
    }

    setIsLoading(true);

    try {
      // Only include fields that are actually in the form to avoid wiping others
      const updateData = {
        fullName: name.trim(),
        name: name.trim(), // Keep both for compatibility
        email: email.trim(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      };

      // USE UPDATE NOT SET - This preserves other fields like experience, rating, etc.
      await firestore()
        .collection('workers')
        .doc(docId)
        .update(updateData);

      if (refreshProfile) {
        await refreshProfile();
      }
      
      setIsLoading(false);
      setModalConfig({
        title: 'Success',
        message: 'Profile updated successfully',
        type: 'success'
      });
      setShowSuccessModal(true);
    } catch (error) {
      console.error('[EditProfile] Save error:', error);
      setIsLoading(false);
      
      if (error.code === 'firestore/not-found') {
        Alert.alert('Error', 'Profile document not found in Firestore. Please contact support.');
      } else {
        Alert.alert('Error', 'Failed to save profile. Please try again.');
      }
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
            <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Avatar Section */}
          <View style={styles.photoContainer}>
            <TouchableOpacity onPress={handlePickPhoto} disabled={uploading}>
              {profilePhoto ? (
                <Image source={{ uri: profilePhoto }} style={styles.profilePhoto} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Text style={styles.photoInitial}>
                    {workerProfile?.fullName?.[0]?.toUpperCase() || workerProfile?.name?.[0]?.toUpperCase() || 'W'}
                  </Text>
                </View>
              )}
              <View style={styles.cameraIcon}>
                {uploading 
                  ? <ActivityIndicator size="small" color="#FFF" />
                  : <MaterialCommunityIcons name="camera" size={18} color="#FFF" />
                }
              </View>
            </TouchableOpacity>
            <Text style={styles.photoLabel}>
              {uploading ? 'Uploading...' : 'Professional Profile Photo'}
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="account-outline" size={22} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="email-outline" size={22} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={[styles.inputWrapper, styles.disabledInput]}>
                <MaterialCommunityIcons name="phone-outline" size={22} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: '#9CA3AF' }]}
                  value={phone}
                  editable={false}
                />
                <MaterialCommunityIcons name="lock-outline" size={18} color="#9CA3AF" />
              </View>
              <Text style={styles.helperText}>Registered phone number cannot be changed</Text>
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
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <CustomModal
        visible={showSuccessModal}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        onPrimary={() => {
          setShowSuccessModal(false);
          navigation.goBack();
        }}
      />
    </SafeAreaView>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  scrollContent: {
    padding: 24,
  },
  photoContainer: { 
    alignItems: 'center', 
    marginBottom: 32 
  },
  profilePhoto: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    borderWidth: 3, 
    borderColor: '#E84545' 
  },
  photoPlaceholder: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    backgroundColor: '#1E293B', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  photoInitial: { 
    fontSize: 40, 
    fontWeight: '800', 
    color: '#FFFFFF' 
  },
  cameraIcon: { 
    position: 'absolute', 
    bottom: 0, 
    right: 0, 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    backgroundColor: '#E84545', 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF'
  },
  photoLabel: { 
    fontSize: 13, 
    color: '#64748B', 
    marginTop: 8, 
    fontWeight: '600' 
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: '#F9FAFB',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  disabledInput: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  helperText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 6,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FFF',
  },
  saveButton: {
    backgroundColor: '#E84545',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E84545',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});

export default EditProfileScreen;
