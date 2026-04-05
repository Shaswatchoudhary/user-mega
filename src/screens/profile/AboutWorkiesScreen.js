import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

const AboutWorkiesScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Workies</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>What is Workies?</Text>
        <Text style={styles.paragraph}>
          Workies is a modern marketplace designed to simplify your quest for reliable household services. From electricians to self-care experts, we connect you with trusted professionals in your neighborhood instantly.
        </Text>
        <Text style={styles.heading}>Why Workies exists?</Text>
        <Text style={styles.paragraph}>
          In a world where convenience is key, finding trustworthy help shouldn't be a hurdle. Workies solves this by providing verified profiles, transparent pricing, and instant booking at your fingertips.
        </Text>
        <Text style={styles.heading}>Vision of Workies</Text>
        <Text style={styles.paragraph}>
          Our vision is to empower local professionals while providing households with a seamless, safe, and stress-free service experience.
        </Text>
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Workies is a service platform designed to connect users with trusted local professionals  </Text>
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
  heading: { fontSize: 18, fontWeight: '700', color: '#000', marginBottom: 8, marginTop: 12 },
  paragraph: { fontSize: 14, color: '#333', lineHeight: 22, marginBottom: 16 },
  footer: { marginTop: 40, padding: 20, backgroundColor: '#FFF', borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#E84545' },
  footerText: { fontSize: 13, color: '#555', lineHeight: 18 },
});

export default AboutWorkiesScreen;
