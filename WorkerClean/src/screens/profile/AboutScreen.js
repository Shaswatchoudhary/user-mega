import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const AboutScreen = ({ navigation }) => {
  const handleVisitWebsite = () => {
    Linking.openURL('https://workease.insforge.site');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About WorkEase</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.brandingSection}>
          <MaterialCommunityIcons name="hammer-wrench" size={60} color="#E84545" />
          <Text style={styles.brandName}>WorkEase</Text>
          <Text style={styles.tagline}>Powering Local Professionals</Text>
        </View>

        <Text style={styles.heading}>What is WorkEase?</Text>
        <Text style={styles.paragraph}>
          WorkEase is a premier service platform dedicated to connecting skilled local professionals with households that need their expertise. We believe in empowering workers by providing them with a steady stream of opportunities and a professional digital presence.
        </Text>

        <Text style={styles.heading}>Our Mission</Text>
        <Text style={styles.paragraph}>
          To provide a seamless, reliable, and fair marketplace where quality work is recognized and rewarded. We aim to bridge the gap between skilled labor and modern convenience.
        </Text>

        <TouchableOpacity style={styles.websiteButton} onPress={handleVisitWebsite}>
          <MaterialCommunityIcons name="web" size={20} color="#FFF" />
          <Text style={styles.websiteButtonText}>Visit Official Website</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            WorkEase was designed and developed with a focus on professional excellence, intuitive UI, and powered by the InsForge infrastructure.
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
  brandingSection: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  brandName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 12,
  },
  tagline: {
    fontSize: 16,
    color: '#E84545',
    fontWeight: '600',
    marginTop: 4,
  },
  heading: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 12, marginTop: 24 },
  paragraph: { fontSize: 15, color: '#4B5563', lineHeight: 24, marginBottom: 8 },
  websiteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    marginTop: 32,
    gap: 10,
  },
  websiteButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: { 
    marginTop: 48, 
    padding: 24, 
    backgroundColor: '#FFF', 
    borderRadius: 16, 
    borderLeftWidth: 4, 
    borderLeftColor: '#E84545',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  footerText: { fontSize: 13, color: '#6B7280', lineHeight: 20, fontStyle: 'italic' },
});

export default AboutScreen;
