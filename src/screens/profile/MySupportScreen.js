import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

const MySupportScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Support</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Support & Assistance</Text>
        <Text style={styles.paragraph}>
          Workies is committed to providing a seamless experience bridging the gap between skilled workers and your household needs. We strive to maintain a high level of transparency and efficiency in every interaction.
        </Text>
        <Text style={styles.paragraph}>
          Workies was designed and developed with a focus on clean system design, intuitive UI, and scalable architecture.

        </Text>
        <View style={styles.list}>
          <Text style={styles.listItem}>• Feature planning and roadmapping</Text>
          <Text style={styles.listItem}>• Improving user interface consistency</Text>
          <Text style={styles.listItem}>• Structuring complex booking flows</Text>
          <Text style={styles.listItem}>• Solving critical technical hurdles</Text>
        </View>
        <Text style={styles.paragraph}>
          Our goal is to ensure you find the right help at the right time.
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
  heading: { fontSize: 22, fontWeight: '700', color: '#000', marginBottom: 16 },
  paragraph: { fontSize: 15, color: '#333', lineHeight: 22, marginBottom: 16 },
  list: { marginBottom: 16, paddingLeft: 8 },
  listItem: { fontSize: 15, color: '#333', marginBottom: 8 },
});

export default MySupportScreen;
