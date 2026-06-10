import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useActiveWorkout } from '../src/context/WorkoutContext';
import { formatSeconds } from '../src/hooks/useTimer';
import { theme } from '../src/theme';

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={18} color={theme.silverDim} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function WorkoutSummaryScreen() {
  const { completedSession } = useActiveWorkout();

  const handleDone = () => router.replace('/');

  if (!completedSession) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={styles.safe}>
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No workout to display.</Text>
            <TouchableOpacity onPress={handleDone}>
              <Text style={styles.backLink}>Back to Schedule</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </>
    );
  }

  const durationSecs =
    completedSession.startTime && completedSession.endTime
      ? Math.floor((completedSession.endTime - completedSession.startTime) / 1000)
      : 0;

  const totalSets = completedSession.exercises.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
    0
  );

  const totalVolume = completedSession.exercises.reduce(
    (sum, ex) =>
      sum +
      ex.sets
        .filter((s) => s.completed)
        .reduce((s, set) => s + set.weight * set.reps, 0),
    0
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Workout Complete</Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
        >
          {/* Workout name */}
          <Text style={styles.workoutName}>
            {completedSession.name ?? 'Workout'}
          </Text>
          <Text style={styles.workoutDate}>{completedSession.date}</Text>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <StatCard
              icon="timer-outline"
              label="Duration"
              value={durationSecs > 0 ? formatSeconds(durationSecs) : '—'}
            />
            <StatCard
              icon="barbell-outline"
              label="Volume"
              value={`${totalVolume.toLocaleString()} lbs`}
            />
            <StatCard
              icon="checkmark-circle-outline"
              label="Sets"
              value={String(totalSets)}
            />
          </View>

          {/* Exercise breakdown */}
          <Text style={styles.sectionLabel}>EXERCISES</Text>

          {completedSession.exercises.map((ex) => {
            const exSets = ex.sets.filter((s) => s.completed);
            const exVolume = exSets.reduce(
              (sum, s) => sum + s.weight * s.reps,
              0
            );
            const bestSet = exSets.reduce<{ weight: number; reps: number } | null>(
              (best, s) =>
                !best || s.weight > best.weight ? s : best,
              null
            );

            return (
              <View key={ex.id} style={styles.exerciseRow}>
                <View style={styles.exerciseLeft}>
                  <Text style={styles.exerciseName}>{ex.name}</Text>
                  <Text style={styles.exerciseMeta}>
                    {exSets.length} sets
                    {bestSet
                      ? `  ·  Best ${bestSet.weight} × ${bestSet.reps}`
                      : ''}
                  </Text>
                </View>
                <Text style={styles.exerciseVolume}>
                  {exVolume > 0 ? `${exVolume.toLocaleString()} lbs` : '—'}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        {/* Done button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.doneBtn} onPress={handleDone}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.background },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24 },

  // Header
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    alignItems: 'center',
  },
  headerTitle: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '600',
  },

  // Workout identity
  workoutName: {
    color: theme.silverBright,
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: -0.3,
    marginTop: 16,
    marginBottom: 4,
  },
  workoutDate: {
    color: theme.textTertiary,
    fontSize: 12,
    marginBottom: 20,
  },

  // Stat cards
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    color: theme.silverBright,
    fontSize: 15,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    color: theme.textTertiary,
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  sectionLabel: {
    color: theme.textTertiary,
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.8,
    marginBottom: 10,
  },

  // Exercise rows
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  exerciseLeft: { flex: 1 },
  exerciseName: {
    color: theme.text,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  exerciseMeta: {
    color: theme.textSecondary,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  exerciseVolume: {
    color: theme.textSecondary,
    fontSize: 13,
    fontVariant: ['tabular-nums'],
  },

  // Footer
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  doneBtn: {
    backgroundColor: theme.surface2,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: theme.silver,
    paddingVertical: 14,
    alignItems: 'center',
  },
  doneBtnText: {
    color: theme.silverBright,
    fontSize: 15,
    fontWeight: '600',
  },

  // Empty state
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { color: theme.textSecondary, fontSize: 14 },
  backLink: { color: theme.silver, fontSize: 14 },
});
