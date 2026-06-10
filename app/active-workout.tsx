import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Pressable,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useActiveWorkout } from '../src/context/WorkoutContext';
import { ExerciseBlock } from '../src/components/ExerciseBlock';
import { useElapsedTime } from '../src/hooks/useTimer';
import { theme } from '../src/theme';

// ─── Stat column in the sticky summary bar ────────────────────────────────────

function StatCol({ label, value }: { label: string; value: string }) {
  return (
    <View style={stat.col}>
      <Text style={stat.value}>{value}</Text>
      <Text style={stat.label}>{label}</Text>
    </View>
  );
}

const stat = StyleSheet.create({
  col: { flex: 1, alignItems: 'center' },
  value: {
    color: theme.silverBright,
    fontSize: 16,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  label: {
    color: theme.textTertiary,
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 2,
  },
});

// ─── Cancel confirmation modal ────────────────────────────────────────────────

function CancelModal({
  visible,
  onDiscard,
  onKeep,
}: {
  visible: boolean;
  onDiscard: () => void;
  onKeep: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={cancelModal.overlay} onPress={onKeep}>
        <Pressable style={cancelModal.sheet} onPress={() => {}}>
          <Text style={cancelModal.title}>Discard Workout?</Text>
          <Text style={cancelModal.sub}>
            All progress will be lost.
          </Text>
          <TouchableOpacity style={cancelModal.discardBtn} onPress={onDiscard}>
            <Text style={cancelModal.discardText}>Discard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={cancelModal.keepBtn} onPress={onKeep}>
            <Text style={cancelModal.keepText}>Keep Going</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const cancelModal = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.surface,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 20,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderColor: theme.border,
    gap: 10,
  },
  title: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  sub: {
    color: theme.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 6,
  },
  discardBtn: {
    paddingVertical: 13,
    borderRadius: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.danger,
  },
  discardText: { color: theme.danger, fontSize: 14, fontWeight: '600' },
  keepBtn: {
    paddingVertical: 13,
    borderRadius: 5,
    backgroundColor: theme.surface2,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
  },
  keepText: { color: theme.silverBright, fontSize: 14, fontWeight: '600' },
});

// ─── Add exercise row ─────────────────────────────────────────────────────────

function AddExerciseRow({ onAdd }: { onAdd: (name: string) => void }) {
  const [name, setName] = useState('');

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setName('');
  };

  return (
    <View style={addEx.row}>
      <TextInput
        style={addEx.input}
        value={name}
        onChangeText={setName}
        placeholder="Exercise name..."
        placeholderTextColor={theme.textTertiary}
        onSubmitEditing={submit}
        returnKeyType="done"
      />
      <TouchableOpacity
        style={[addEx.btn, !name.trim() && addEx.btnDisabled]}
        onPress={submit}
        disabled={!name.trim()}
      >
        <Text style={addEx.btnText}>Add</Text>
      </TouchableOpacity>
    </View>
  );
}

const addEx = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, marginTop: 8 },
  input: {
    flex: 1,
    backgroundColor: theme.surface,
    color: theme.text,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
  },
  btn: {
    backgroundColor: theme.surface2,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: theme.silver,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  btnDisabled: { borderColor: theme.border },
  btnText: { color: theme.silverBright, fontSize: 14, fontWeight: '600' },
});

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function ActiveWorkoutScreen() {
  const {
    activeSession,
    startTime,
    updateSet,
    completeSet,
    addSet,
    addExercise,
    updateExerciseNotes,
    finishWorkout,
    cancelWorkout,
    getPreviousSet,
  } = useActiveWorkout();

  const elapsed = useElapsedTime(startTime);
  const [showCancel, setShowCancel] = useState(false);

  if (!activeSession) {
    router.replace('/');
    return null;
  }

  const completedSets = activeSession.exercises.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
    0
  );
  const totalVolume = activeSession.exercises.reduce(
    (sum, ex) =>
      sum +
      ex.sets
        .filter((s) => s.completed)
        .reduce((s, set) => s + set.weight * set.reps, 0),
    0
  );

  const handleFinish = () => {
    finishWorkout();
    router.replace('/workout-summary');
  };

  const handleDiscard = () => {
    cancelWorkout();
    setShowCancel(false);
    router.replace('/');
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* ── Custom header ─────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerLeft}
            onPress={() => router.replace('/')}
          >
            <Ionicons name="chevron-down" size={20} color={theme.textSecondary} />
            <Text style={styles.headerTitle}>Log Workout</Text>
          </TouchableOpacity>

          <View style={styles.headerRight}>
            <View style={styles.timerBadge}>
              <Ionicons name="timer-outline" size={13} color={theme.textSecondary} />
              <Text style={styles.timerText}>{elapsed}</Text>
            </View>
            <TouchableOpacity style={styles.finishBtn} onPress={handleFinish}>
              <Text style={styles.finishText}>Finish</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Sticky stats bar ──────────────────────────────────── */}
        <View style={styles.statsBar}>
          <StatCol label="Duration" value={elapsed} />
          <View style={styles.statDivider} />
          <StatCol
            label="Volume"
            value={`${totalVolume.toLocaleString()} lbs`}
          />
          <View style={styles.statDivider} />
          <StatCol label="Sets" value={String(completedSets)} />
        </View>

        {/* ── Scrollable exercise list ───────────────────────────── */}
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            {activeSession.exercises.map((exercise) => (
              <ExerciseBlock
                key={exercise.id}
                exercise={exercise}
                onUpdateSet={(setId, field, val) =>
                  updateSet(
                    exercise.id,
                    setId,
                    field === 'weight' ? { weight: val } : { reps: val }
                  )
                }
                onCompleteSet={(setId) => completeSet(exercise.id, setId)}
                onAddSet={() => addSet(exercise.id)}
                onNotesChange={(notes) =>
                  updateExerciseNotes(exercise.id, notes)
                }
                getPreviousSet={getPreviousSet}
              />
            ))}

            {/* Add exercise */}
            <Text style={styles.sectionLabel}>ADD EXERCISE</Text>
            <AddExerciseRow onAdd={addExercise} />

            {/* Discard / cancel */}
            <TouchableOpacity
              style={styles.discardBtn}
              onPress={() => setShowCancel(true)}
            >
              <Text style={styles.discardText}>Discard Workout</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>

        <CancelModal
          visible={showCancel}
          onDiscard={handleDiscard}
          onKeep={() => setShowCancel(false)}
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.background },
  flex: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 48 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    color: theme.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: theme.surface2,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: theme.border,
  },
  timerText: {
    color: theme.textSecondary,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  finishBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: theme.surface2,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: theme.silver,
  },
  finishText: {
    color: theme.silverBright,
    fontSize: 13,
    fontWeight: '600',
  },

  // Stats bar
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.surface,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: theme.border,
  },

  // Section label
  sectionLabel: {
    color: theme.textTertiary,
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 8,
  },

  // Discard
  discardBtn: {
    marginTop: 24,
    paddingVertical: 13,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
  },
  discardText: {
    color: theme.danger,
    fontSize: 14,
  },
});
