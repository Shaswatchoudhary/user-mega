import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, borderRadius, typography } from '../../theme';

const TicketStatusCard = ({ ticketStatus, workStartTime, ticketId }) => {
  const [timer, setTimer] = useState('00:00:00');

  useEffect(() => {
    let interval;
    if (ticketStatus === 'open' && workStartTime) {
      const startTime = workStartTime.toDate ? workStartTime.toDate() : new Date(workStartTime);
      
      interval = setInterval(() => {
        const now = new Date();
        const diff = Math.floor((now - startTime) / 1000);
        
        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;
        
        setTimer(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [ticketStatus, workStartTime]);

  if (!ticketStatus) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <View style={[styles.dot, { backgroundColor: ticketStatus === 'open' ? '#10B981' : '#6B7280' }]} />
          <Text style={styles.badgeText}>
            {ticketStatus === 'open' ? 'Work in Progress' : 'Ticket Closed'}
          </Text>
        </View>
        <Text style={styles.ticketId}>{ticketId || '#WE2024001'}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.timerContainer}>
          <MaterialCommunityIcons name="timer-outline" size={20} color="#666" />
          <Text style={styles.timerText}>{timer}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Started at:</Text>
          <Text style={styles.value}>
            {workStartTime ? (workStartTime.toDate ? workStartTime.toDate() : new Date(workStartTime)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
    fontFamily: 'Poppins-SemiBold',
  },
  ticketId: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timerText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    fontFamily: 'Poppins-Bold',
  },
  infoRow: {
    alignItems: 'flex-end',
  },
  label: {
    fontSize: 10,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'Poppins-Medium',
  },
  value: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
    fontFamily: 'Poppins-SemiBold',
  },
});

export default TicketStatusCard;
