import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useActiveWorkout } from '../../src/context/WorkoutContext';
import { ResumeBanner } from '../../src/components/ResumeBanner';
import { Routine } from '../../src/types';
import { theme } from '../../src/theme';

function RoutineCard({ routine }: { routine: Routine }) {
  const { startWorkout } = useActiveWorkout();
  const exerciseList = routine.exercises.map((e) => e.name).join(', ');

  const handleStart = () => {
    startWorkout(routine);
    router.push('/active-workout');
  };

  return (
    <View style={styles.card}>
      <Text style={styles.routineName}>{routine.name}</Text>
      <Text style={styles.exerciseList} numberOfLines={2}>
        {exerciseList}
      </Text>
      <TouchableOpacity style={styles.startBtn} onPress={handleStart}>
        <Text style={styles.startBtnText}>Start Routine</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function ScheduleScreen() {
  const { routines, isActive, startWorkout } = useActiveWorkout();

  const handleEmptyWorkout = () => {
    startWorkout(null);
    router.push('/active-workout');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          isActive && { paddingBottom: 72 },
        ]}
      >
        <Text style={styles.heading}>Workout</Text>

        {/* Empty workout CTA */}
        <TouchableOpacity
          style={styles.emptyBtn}
          onPress={handleEmptyWorkout}
          activeOpacity={0.7}
        >
          <Text style={styles.emptyBtnText}>+ Start Empty Workout</Text>
        </TouchableOpacity>

        {/* Routines */}
        <Text style={styles.sectionLabel}>MY ROUTINES</Text>

        {routines.map((r) => (
          <RoutineCard key={r.id} routine={r} />
        ))}
      </ScrollView>

      {isActive && <ResumeBanner />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 32, paddingTop: 8 },

  heading: {
    color: theme.text,
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: -0.3,
    marginBottom: 16,
  },

  // Empty workout button
  emptyBtn: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 5,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 28,
  },
  emptyBtnText: {
    color: theme.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },

  sectionLabel: {
    color: theme.textTertiary,
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.8,
    marginBottom: 10,
  },

  // Routine card
  card: {
    backgroundColor: theme.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 14,
    marginBottom: 10,
  },
  routineName: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  exerciseList: {
    color: theme.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  startBtn: {
    backgroundColor: theme.surface2,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: theme.border,
    paddingVertical: 11,
    alignItems: 'center',
  },
  startBtnText: {
    color: theme.silverBright,
    fontSize: 14,
    fontWeight: '600',
  },
});
