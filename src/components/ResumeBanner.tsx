import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { theme } from '../theme';
import { useElapsedTime } from '../hooks/useTimer';
import { useActiveWorkout } from '../context/WorkoutContext';

export function ResumeBanner() {
  const { activeSession, startTime } = useActiveWorkout();
  const elapsed = useElapsedTime(startTime);

  if (!activeSession) return null;

  return (
    <TouchableOpacity
      style={styles.banner}
      onPress={() => router.push('/active-workout')}
      activeOpacity={0.85}
    >
      <View style={styles.left}>
        <View style={styles.dot} />
        <View>
          <Text style={styles.title}>{activeSession.name ?? 'Workout in progress'}</Text>
          <Text style={styles.sub}>{elapsed}</Text>
        </View>
      </View>
      <View style={styles.resumeBtn}>
        <Text style={styles.resumeText}>Resume</Text>
        <Ionicons name="chevron-forward" size={13} color={theme.background} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.silver,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.background,
  },
  title: {
    color: theme.background,
    fontSize: 13,
    fontWeight: '600',
  },
  sub: {
    color: theme.background,
    fontSize: 11,
    opacity: 0.7,
    marginTop: 1,
    fontVariant: ['tabular-nums'],
  },
  resumeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  resumeText: {
    color: theme.background,
    fontSize: 13,
    fontWeight: '600',
  },
});
