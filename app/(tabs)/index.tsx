import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWorkout } from '../../src/hooks/useWorkout';
import { ExerciseCard } from '../../src/components/ExerciseCard';
import { theme } from '../../src/theme';

export default function TodayScreen() {
  const { session, addExercise, addSet, updateSet, completeSet, volume } =
    useWorkout();
  const [newExerciseName, setNewExerciseName] = useState('');

  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const totalVolume = session.exercises.reduce(
    (sum, ex) => sum + volume(ex.id),
    0
  );
  const totalSets = session.exercises.reduce(
    (sum, ex) => sum + ex.sets.length,
    0
  );
  const completedSets = session.exercises.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
    0
  );

  const handleAddExercise = () => {
    const trimmed = newExerciseName.trim();
    if (!trimmed) return;
    addExercise(trimmed);
    setNewExerciseName('');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.dateLabel}>{dateLabel}</Text>
          <Text style={styles.heading}>Today's Workout</Text>

          {session.exercises.length > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryChip}>
                {session.exercises.length} exercises
              </Text>
              <Text style={styles.summaryChip}>
                {completedSets}/{totalSets} sets done
              </Text>
              <Text style={styles.summaryChip}>{totalVolume} lbs total</Text>
            </View>
          )}

          {session.exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              volume={volume(exercise.id)}
              onAddSet={() => addSet(exercise.id)}
              onUpdateSet={(setId, patch) =>
                updateSet(exercise.id, setId, patch)
              }
              onCompleteSet={(setId) => completeSet(exercise.id, setId)}
            />
          ))}

          <View style={styles.addRow}>
            <TextInput
              style={styles.addInput}
              value={newExerciseName}
              onChangeText={setNewExerciseName}
              placeholder="Add exercise (e.g. Deadlift)..."
              placeholderTextColor={theme.textMuted}
              onSubmitEditing={handleAddExercise}
              returnKeyType="done"
            />
            <TouchableOpacity
              onPress={handleAddExercise}
              style={styles.addBtn}
            >
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.background },
  flex: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  dateLabel: { color: theme.textMuted, fontSize: 13, marginBottom: 2 },
  heading: {
    color: theme.text,
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  summaryChip: {
    color: theme.textMuted,
    fontSize: 12,
    backgroundColor: theme.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
  },
  addRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  addInput: {
    flex: 1,
    backgroundColor: theme.surface,
    color: theme.text,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: theme.border,
    fontSize: 15,
  },
  addBtn: {
    backgroundColor: theme.accent,
    borderRadius: 10,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  addBtnText: { color: '#000', fontWeight: '700', fontSize: 15 },
});
