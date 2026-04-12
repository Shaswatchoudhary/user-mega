import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const PrivacyScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.brandingHeader}>
          <MaterialCommunityIcons name="shield-check" size={50} color="#E84545" />
          <Text style={styles.brandingTitle}>Your Privacy Matters</Text>
        </View>

        <Text style={styles.paragraph}>
          WorkEase values your professional integrity and respects your privacy. We collect minimal data to provide you with the best experience as a service professional.
        </Text>

        <View style={styles.section}>
          <Text style={styles.subHeading}>Worker Data Safety</Text>
          <Text style={styles.text}>Your personal identifiers, professional certifications, and documents are stored securely and encrypted. We never share your data with unauthorized third parties.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subHeading}>Location Privacy</Text>
          <Text style={styles.text}>We use your GPS data solely to find the nearest service requests and provide accurate arrival times to your customers. Your location is only shared during active jobs.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subHeading}>Payment Security</Text>
          <Text style={styles.text}>WorkEase does not store sensitive financial details. Our current "Cash on Service" model ensures your payment information stays private.</Text>
        </View>

        <View style={styles.noteSection}>
          <Text style={styles.noteText}>
            WorkEase was designed with a focus on professional excellence, scalable architecture, and strong user data privacy.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  content: { padding: 24, paddingBottom: 40 },
  brandingHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  brandingTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginTop: 12,
  },
  paragraph: { fontSize: 15, color: '#4B5563', lineHeight: 22, marginBottom: 24 },
  section: { 
    marginBottom: 24,
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  subHeading: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 8 },
  text: { fontSize: 14, color: '#4B5563', lineHeight: 20 },
  noteSection: { marginTop: 32, paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  noteText: { fontSize: 13, color: '#9CA3AF', fontStyle: 'italic', textAlign: 'center' },
});

export default PrivacyScreen;
