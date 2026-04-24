import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, SafeAreaView, Alert,
  ActivityIndicator, ScrollView, StatusBar
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

const FeedbackScreen = ({ route, navigation }) => {
  const {
    bookingId, workerId,
    workerName, workerService
  } = route.params;

  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentUser = auth().currentUser;

  const TAGS = [
    { id: 1, label: 'Professional' },
    { id: 2, label: 'On Time' },
    { id: 3, label: 'Clean Work' },
    { id: 4, label: 'Good Communication' },
    { id: 5, label: 'Would Recommend' },
    { id: 6, label: 'Fair Pricing' },
  ];

  const RATING_LABELS = [
    '', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'
  ];

  const RATING_COLORS = [
    '', '#EF4444', '#F97316', '#F59E0B', '#10B981', '#10B981'
  ];

  const toggleTag = (id) => {
    setSelectedTags(prev =>
      prev.includes(id)
        ? prev.filter(t => t !== id)
        : [...prev, id]
    );
  };

  const submitFeedback = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required',
        'Please select a rating to continue');
      return;
    }
    setIsSubmitting(true);
    try {
      const tagLabels = TAGS
        .filter(t => selectedTags.includes(t.id))
        .map(t => t.label);

      await firestore().collection('reviews').add({
        bookingId, workerId,
        userId: currentUser?.uid,
        rating, tags: tagLabels,
        review: review.trim(),
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      await firestore()
        .collection('bookings').doc(bookingId)
        .update({ userRating: rating, userReview: review });

      const workerDoc = await firestore()
        .collection('workers').doc(workerId).get();

      if (workerDoc.exists) {
        const d = workerDoc.data();
        const curr = d.rating || 4.5;
        const jobs = d.totalJobs || 0;
        const next = ((curr * jobs) + rating) / (jobs + 1);
        await firestore()
          .collection('workers').doc(workerId)
          .update({
            rating: Math.round(next * 10) / 10,
            totalJobs: jobs + 1,
          });
      }

      navigation.replace('MainTabs');
    } catch (error) {
      console.error('Feedback error:', error);
      Alert.alert('Error', 'Could not submit. Please try again.');
    }
    setIsSubmitting(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.donePill}>
            <View style={styles.donePillDot} />
            <Text style={styles.donePillText}>Service Complete</Text>
          </View>
          <Text style={styles.pageTitle}>Rate your experience</Text>
          <Text style={styles.pageSubtitle}>
            Your feedback helps us maintain quality
          </Text>
        </View>

        {/* Worker Card */}
        <View style={styles.workerCard}>
          <View style={styles.workerAvatar}>
            <Text style={styles.workerLetter}>
              {(workerName || 'W')[0].toUpperCase()}
            </Text>
          </View>
          <View style={styles.workerInfo}>
            <Text style={styles.workerNameText}>
              {workerName || 'Worker'}
            </Text>
            <Text style={styles.workerServiceText}>
              {workerService || 'Professional'}
            </Text>
          </View>
          <View style={styles.verifiedTag}>
            <Text style={styles.verifiedTagText}>Verified Pro</Text>
          </View>
        </View>

        {/* Rating */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            Overall Rating
          </Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(s => (
              <TouchableOpacity
                key={s}
                onPress={() => setRating(s)}
                activeOpacity={0.6}
                style={styles.starBtn}>
                <Text style={[
                  styles.starGlyph,
                  s <= rating
                    ? { color: '#F59E0B' }
                    : { color: '#E2E8F0' }
                ]}>★</Text>
              </TouchableOpacity>
            ))}
          </View>
          {rating > 0 && (
            <View style={[
              styles.ratingLabel,
              { borderColor: RATING_COLORS[rating] }
            ]}>
              <Text style={[
                styles.ratingLabelText,
                { color: RATING_COLORS[rating] }
              ]}>
                {RATING_LABELS[rating]}
              </Text>
            </View>
          )}
        </View>

        {/* Tags */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            What stood out? (optional)
          </Text>
          <View style={styles.tagsWrap}>
            {TAGS.map(tag => {
              const on = selectedTags.includes(tag.id);
              return (
                <TouchableOpacity
                  key={tag.id}
                  style={[styles.chip, on && styles.chipOn]}
                  onPress={() => toggleTag(tag.id)}
                  activeOpacity={0.7}>
                  <Text style={[
                    styles.chipText,
                    on && styles.chipTextOn
                  ]}>
                    {tag.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Comment */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            Add a comment (optional)
          </Text>
          <TextInput
            style={styles.commentBox}
            placeholder="Tell us more about your experience..."
            placeholderTextColor="#CBD5E1"
            value={review}
            onChangeText={setReview}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[
            styles.submitBtn,
            (rating === 0 || isSubmitting) && styles.submitBtnOff
          ]}
          onPress={submitFeedback}
          disabled={rating === 0 || isSubmitting}
          activeOpacity={0.85}>
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitBtnText}>
              Submit Review
            </Text>
          )}
        </TouchableOpacity>

        {/* Skip */}
        <TouchableOpacity
          onPress={() => navigation.replace('MainTabs')}
          style={styles.skipBtn}
          activeOpacity={0.6}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { padding: 24, paddingTop: 20, paddingBottom: 40 },

  header: { marginBottom: 28 },
  donePill: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 12,
  },
  donePillDot: {
    width: 7, height: 7, borderRadius: 3.5,
    backgroundColor: '#22C55E', marginRight: 6,
  },
  donePillText: {
    fontSize: 13, fontWeight: '600',
    color: '#22C55E', letterSpacing: 0.3,
  },
  pageTitle: {
    fontSize: 28, fontWeight: '800',
    color: '#1A1A1A', letterSpacing: -0.5,
    marginBottom: 6,
  },
  pageSubtitle: {
    fontSize: 14, color: '#94A3B8',
    lineHeight: 20,
  },

  workerCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 18, padding: 16,
    marginBottom: 32,
    borderWidth: 1, borderColor: '#F1F5F9',
  },
  workerAvatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#E84545',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 14,
  },
  workerLetter: {
    fontSize: 22, fontWeight: '800', color: '#fff',
  },
  workerInfo: { flex: 1 },
  workerNameText: {
    fontSize: 16, fontWeight: '700', color: '#1A1A1A',
  },
  workerServiceText: {
    fontSize: 13, color: '#64748B', marginTop: 3,
  },
  verifiedTag: {
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  verifiedTagText: {
    fontSize: 11, color: '#22C55E', fontWeight: '700',
  },

  section: { marginBottom: 28 },
  sectionLabel: {
    fontSize: 14, fontWeight: '700',
    color: '#334155', marginBottom: 14,
    letterSpacing: 0.1,
  },
  starsRow: { flexDirection: 'row', gap: 10 },
  starBtn: { padding: 4 },
  starGlyph: { fontSize: 42 },
  ratingLabel: {
    alignSelf: 'flex-start',
    marginTop: 12,
    borderWidth: 1.5, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  ratingLabelText: {
    fontSize: 13, fontWeight: '700',
  },

  tagsWrap: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
  },
  chip: {
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 10, borderWidth: 1.5,
    borderColor: '#E2E8F0', backgroundColor: '#F8FAFC',
  },
  chipOn: {
    borderColor: '#E84545', backgroundColor: '#E84545',
  },
  chipText: {
    fontSize: 13, color: '#64748B', fontWeight: '500',
  },
  chipTextOn: {
    color: '#FFFFFF', fontWeight: '600',
  },

  commentBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14, padding: 14,
    fontSize: 15, color: '#1A1A1A',
    borderWidth: 1.5, borderColor: '#E2E8F0',
    minHeight: 100, lineHeight: 22,
  },

  submitBtn: {
    backgroundColor: '#E84545',
    paddingVertical: 17,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 14,
  },
  submitBtnOff: { backgroundColor: '#CBD5E1' },
  submitBtnText: {
    color: '#FFFFFF', fontSize: 16,
    fontWeight: '700', letterSpacing: 0.3,
  },
  skipBtn: { alignItems: 'center', paddingVertical: 10 },
  skipText: { fontSize: 14, color: '#94A3B8' },
});

export default FeedbackScreen;
