import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const HelpSupportScreen = ({ navigation }) => {
  const faqs = [
    { q: "How do I accept a job?", a: "When a new job is requested in your area, you'll receive a notification. Go to the 'Jobs' tab to view details and accept the request." },
    { q: "How do I get paid?", a: "Currently, we support 'Cash on Service'. You collect the payment directly from the customer once the job is completed." },
    { q: "What if a customer cancels?", a: "If a customer cancels, you'll be notified immediately. Our support team can help if you've already reached the location." },
    { q: "How to update my service area?", a: "You can update your working location and service radius in the 'Manage addresses' or 'Profile' settings." },
    { q: "How to maintain a high rating?", a: "Punctuality, clear communication, and quality work are key. Always ensure the customer is satisfied before closing a job." },
  ];

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@workease.app');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.supportCard}>
          <MaterialCommunityIcons name="headset" size={40} color="#FFF" />
          <View style={styles.supportInfo}>
            <Text style={styles.supportTitle}>Need direct help?</Text>
            <Text style={styles.supportSubtitle}>Our team is available 24/7 for you.</Text>
          </View>
          <TouchableOpacity style={styles.contactButton} onPress={handleContactSupport}>
            <Text style={styles.contactText}>Email Us</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.faqHeading}>Frequently Asked Questions</Text>
        
        {faqs.map((faq, index) => (
          <View key={index} style={styles.faqItem}>
            <Text style={styles.question}>{faq.q}</Text>
            <Text style={styles.answer}>{faq.a}</Text>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerNote}>
            WorkEase was designed and developed with a focus on professional excellence, providing a seamless experience for our skilled partners.
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
  supportCard: {
    backgroundColor: '#E84545',
    padding: 24,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#E84545',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  supportInfo: {
    flex: 1,
    marginLeft: 16,
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  supportSubtitle: {
    fontSize: 13,
    color: '#FFCCCC',
    marginTop: 2,
  },
  contactButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  contactText: {
    color: '#E84545',
    fontSize: 14,
    fontWeight: '700',
  },
  faqHeading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
  },
  faqItem: { 
    marginBottom: 24,
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 16,
  },
  question: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 8 },
  answer: { fontSize: 14, color: '#4B5563', lineHeight: 22 },
  footer: { marginTop: 32, paddingTop: 24, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  footerNote: { fontSize: 12, color: '#9CA3AF', fontStyle: 'italic', textAlign: 'center' },
});

export default HelpSupportScreen;
