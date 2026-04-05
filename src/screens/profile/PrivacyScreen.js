import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

const PrivacyScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Your Privacy Matters</Text>
        <Text style={styles.paragraph}>
          Workies respects user privacy and does not misuse personal data. We collect minimal information to ensure service quality and security.
        </Text>
        <View style={styles.section}>
          <Text style={styles.subHeading}>User Data Safety</Text>
          <Text style={styles.text}>All user documents and personal identifiers are stored securely and never shared with unauthorized third parties.</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.subHeading}>Location Usage</Text>
          <Text style={styles.text}>We use your GPS data solely to find the nearest professionals and provide accurate arrival times.</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.subHeading}>Payment Data handling</Text>
          <Text style={styles.text}>We do not store sensitive payment details. Our current "Cash on Service" model ensures your financial data stays private.</Text>
        </View>
        <Text style={styles.footerNote}>
          Workies was designed with a focus on clean system design, intuitive UI, scalable architecture, and strong user data privacy.

        </Text>
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
  heading: { fontSize: 20, fontWeight: '700', color: '#000', marginBottom: 16 },
  paragraph: { fontSize: 14, color: '#333', lineHeight: 20, marginBottom: 20 },
  section: { marginBottom: 20 },
  subHeading: { fontSize: 16, fontWeight: '700', color: '#000', marginBottom: 4 },
  text: { fontSize: 14, color: '#444', lineHeight: 20 },
  footerNote: { marginTop: 30, fontSize: 12, color: '#666', fontStyle: 'italic', textAlign: 'center' },
});

export default PrivacyScreen;
