import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

const HelpSupportScreen = ({ navigation }) => {
  const faqs = [
    { q: "How to book a service?", a: "Simply select a category from the home screen, find a professional near you, and tap 'Book Now'. Follow the steps on the booking summary to confirm." },
    { q: "How payments work?", a: "Currently, we support 'Cash on Service'. You pay the professional directly after the job is completed to your satisfaction." },
    { q: "How workers are assigned?", a: "We show professionals based on proximity to your location. You choose the one that fits your requirements best." },
    { q: "What to do if a worker is late?", a: "You can use the contact information provided in your booking details to call the professional directly for updates." },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {faqs.map((faq, index) => (
          <View key={index} style={styles.faqItem}>
            <Text style={styles.question}>{faq.q}</Text>
            <Text style={styles.answer}>{faq.a}</Text>
          </View>
        ))}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
           Workies was designed and developed with a focus on clean system design, intuitive UI, and scalable architecture.

          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
  content: { padding: 20 },
  faqItem: { marginBottom: 24 },
  question: { fontSize: 16, fontWeight: '700', color: '#000', marginBottom: 8 },
  answer: { fontSize: 14, color: '#333', lineHeight: 20 },
  footer: { marginTop: 40, borderTopWidth: 1, borderTopColor: '#DDD', paddingTop: 20 },
  footerText: { fontSize: 12, color: '#666', fontStyle: 'italic', textAlign: 'center' },
});

export default HelpSupportScreen;
