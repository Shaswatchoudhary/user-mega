import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const WorkCompletionPopup = ({ visible, onConfirm, onRaiseIssue, workerName }) => {
  const [showIssueInput, setShowIssueInput] = useState(false);
  const [issueText, setIssueText] = useState('');

  const handleSubmitIssue = () => {
    if (issueText.trim()) {
      onRaiseIssue(issueText);
      setShowIssueInput(false);
      setIssueText('');
    } else {
      setShowIssueInput(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContent}
        >
          <View style={styles.handle} />
          
          <View style={styles.topIcon}>
            <MaterialCommunityIcons name="check-circle" size={50} color="#10B981" />
          </View>

          <Text style={styles.title}>Work Completed?</Text>
          <Text style={styles.subtitle}>
            Your professional {workerName || 'Expert'} has marked the job as done. Are you happy with the service?
          </Text>

          {showIssueInput ? (
            <View style={styles.issueBox}>
              <TextInput
                style={styles.input}
                placeholder="Describe the issue you're facing..."
                placeholderTextColor="#9CA3AF"
                multiline
                value={issueText}
                onChangeText={setIssueText}
              />
              <View style={styles.issueButtons}>
                <TouchableOpacity 
                  style={styles.backButton} 
                  onPress={() => setShowIssueInput(false)}
                >
                  <Text style={styles.backButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.submitIssueButton} 
                  onPress={handleSubmitIssue}
                >
                  <Text style={styles.submitIssueText}>Submit Issue</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.actionColumn}>
              <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
                <Text style={styles.confirmText}>Yes, Close Job</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.issueButton} 
                onPress={() => setShowIssueInput(true)}
              >
                <Text style={styles.issueButtonText}>Raise Issue</Text>
              </TouchableOpacity>
            </View>
          )}
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 44 : 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 20,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 20,
  },
  topIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  actionColumn: {
    width: '100%',
    gap: 12,
  },
  confirmButton: {
    backgroundColor: '#E84545',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  issueButton: {
    width: '100%',
    paddingVertical: 14,
    alignItems: 'center',
  },
  issueButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '700',
  },
  issueBox: {
    width: '100%',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 16,
    padding: 16,
    height: 120,
    textAlignVertical: 'top',
    fontSize: 14,
    color: '#111827',
    marginBottom: 20,
  },
  issueButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  backButtonText: {
    color: '#4B5563',
    fontWeight: '700',
  },
  submitIssueButton: {
    flex: 2,
    backgroundColor: '#111827',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitIssueText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default WorkCompletionPopup;
