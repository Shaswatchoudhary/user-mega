import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, typography, spacing, borderRadius } from '../../theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQItem = ({ question, answer }) => {
  const [expanded, setExpanded] = React.useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <TouchableOpacity style={styles.faqCard} onPress={toggle} activeOpacity={0.7}>
      <View style={styles.faqHeader}>
        <Text style={styles.question}>{question}</Text>
        <Ionicons 
          name={expanded ? "chevron-up" : "chevron-down"} 
          size={20} 
          color={expanded ? colors.accent : "#94A3B8"} 
        />
      </View>
      {expanded && <Text style={styles.answer}>{answer}</Text>}
    </TouchableOpacity>
  );
};

const HelpSupportScreen = ({ navigation }) => {
  const faqs = [
    { 
      q: "How to book a service?", 
      a: "Simply select a category from the home screen, find a professional near you, and tap 'Book Now'. Follow the steps on the booking summary to confirm your request." 
    },
    { 
      q: "How do payments work?", 
      a: "Currently, we support 'Cash on Service'. You pay the professional directly after the job is completed to your satisfaction. Digital payments are coming soon!" 
    },
    { 
      q: "Are the workers verified?", 
      a: "Yes, every professional on Workies goes through a strict multi-step verification process including identity checks and background verification." 
    },
    { 
      q: "What if I am not satisfied?", 
      a: "Your satisfaction is our priority. If you are unhappy with the service, you can raise an issue through the 'Feedback' screen or contact our support team immediately." 
    },
    { 
      q: "How to cancel a booking?", 
      a: "You can cancel a booking from the 'My Bookings' tab before the worker starts traveling to your location without any penalty." 
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Frequently Asked Questions</Text>
          <Text style={styles.heroSubtitle}>Find quick answers to your common queries below.</Text>
        </View>

        <View style={styles.faqList}>
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.q} answer={faq.a} />
          ))}
        </View>

        <TouchableOpacity 
          style={styles.contactCard}
          onPress={() => navigation.navigate('MySupport')}
        >
          <View style={styles.contactIcon}>
            <Ionicons name="chatbubbles-outline" size={24} color={colors.white} />
          </View>
          <View style={styles.contactText}>
            <Text style={styles.contactTitle}>Still have questions?</Text>
            <Text style={styles.contactSubtitle}>Talk to our support team directly</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color={colors.accent} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.black,
  },
  content: {
    padding: 24,
  },
  heroSection: {
    marginBottom: 32,
  },
  heroTitle: {
    ...typography.h2,
    color: '#0F172A',
    marginBottom: 8,
  },
  heroSubtitle: {
    ...typography.body,
    color: '#64748B',
  },
  faqList: {
    gap: 12,
    marginBottom: 32,
  },
  faqCard: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  question: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginRight: 16,
  },
  answer: {
    marginTop: 16,
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactText: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  contactSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
});

export default HelpSupportScreen;
