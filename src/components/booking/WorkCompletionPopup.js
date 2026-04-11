import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { Button } from '../common';

const WorkCompletionPopup = ({ visible, onConfirm, onRaiseIssue, workerName }) => {
  const [showIssueInput, setShowIssueInput] = useState(false);
  const [issueText, setIssueText] = useState('');

  const handleRaiseIssue = () => {
    if (showIssueInput) {
      onRaiseIssue(issueText);
      setShowIssueInput(false);
      setIssueText('');
    } else {
      setShowIssueInput(true);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="check-decagram" size={60} color="#10B981" />
            </View>
            
            <Text style={styles.title}>Work Completed!</Text>
            <Text style={styles.subtitle}>
              {workerName} has marked the job as done. Are you satisfied with the work?
            </Text>

            {showIssueInput ? (
              <View style={styles.issueContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Tell us what went wrong..."
                  multiline
                  numberOfLines={4}
                  value={issueText}
                  onChangeText={setIssueText}
                />
                <View style={styles.btnRow}>
                  <TouchableOpacity 
                    style={styles.cancelLink} 
                    onPress={() => setShowIssueInput(false)}
                  >
                    <Text style={styles.cancelText}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.submitBtn} 
                    onPress={handleRaiseIssue}
                  >
                    <Text style={styles.submitBtnText}>Submit Issue</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.actions}>
                <Button 
                  title="Yes, Close Ticket" 
                  onPress={onConfirm}
                  style={styles.confirmBtn}
                />
                <TouchableOpacity 
                  style={styles.issueLink} 
                  onPress={() => setShowIssueInput(true)}
                >
                  <Text style={styles.issueText}>Raise an Issue</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    overflow: 'hidden',
  },
  content: {
    padding: 30,
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    fontFamily: 'Poppins-Bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'Poppins-Regular',
    marginBottom: 24,
  },
  actions: {
    width: '100%',
    gap: 16,
  },
  confirmBtn: {
    backgroundColor: '#10B981',
  },
  issueLink: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  issueText: {
    color: '#EF4444',
    fontWeight: '600',
    fontFamily: 'Poppins-Medium',
  },
  issueContainer: {
    width: '100%',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
    fontFamily: 'Poppins-Regular',
    marginBottom: 16,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cancelLink: {
    padding: 10,
  },
  cancelText: {
    color: '#666',
    fontFamily: 'Poppins-Medium',
  },
  submitBtn: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  submitBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
  },
});

export default WorkCompletionPopup;
