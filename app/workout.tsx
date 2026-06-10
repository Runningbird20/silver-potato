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
import { Stack } from 'expo-router';
import { useWorkout } from '../src/hooks/useWorkout';
import { ExerciseCard } from '../src/components/ExerciseCard';
import { theme } from '../src/theme';

export default function WorkoutScreen() {
  const { session, addExercise, addSet, updateSet, completeSet, volume } =
    useWorkout();
  const [newExerciseName, setNewExerciseName] = useState('');

  const totalVolume = session.exercises.reduce(
    (sum, ex) => sum + volume(ex.id),
    0
  );

  const handleAddExercise = () => {
    const trimmed = newExerciseName.trim();
    if (!trimmed) return;
    addExercise(trimmed);
    setNewExerciseName('');
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Today's Workout",
          headerBackTitle: 'Schedule',
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerShadowVisible: false,
        }}
      />
      <SafeAreaView style={styles.safe} edges={['bottom']}>
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
            {session.exercises.length > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryItem}>
                  {session.exercises.length} exercises
                </Text>
                <Text style={styles.summaryDot}>·</Text>
                <Text style={styles.summaryItem}>
                  {totalVolume.toLocaleString()} lbs total
                </Text>
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

            <Text style={styles.sectionLabel}>ADD EXERCISE</Text>
            <View style={styles.addRow}>
              <TextInput
                style={styles.addInput}
                value={newExerciseName}
                onChangeText={setNewExerciseName}
                placeholder="e.g. Romanian Deadlift"
                placeholderTextColor={theme.textTertiary}
                onSubmitEditing={handleAddExercise}
                returnKeyType="done"
              />
              <TouchableOpacity
                onPress={handleAddExercise}
                style={[
                  styles.addBtn,
                  !newExerciseName.trim() && styles.addBtnDisabled,
                ]}
                disabled={!newExerciseName.trim()}
              >
                <Text style={styles.addBtnText}>Add</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.background },
  flex: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 48 },

  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  summaryItem: {
    color: theme.textSecondary,
    fontSize: 13,
    fontVariant: ['tabular-nums'],
  },
  summaryDot: {
    color: theme.textTertiary,
    fontSize: 13,
  },

  sectionLabel: {
    color: theme.textTertiary,
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 14,
  },
  addRow: {
    flexDirection: 'row',
    gap: 8,
  },
  addInput: {
    flex: 1,
    backgroundColor: theme.surface,
    color: theme.text,
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: theme.border,
    fontSize: 14,
  },
  addBtn: {
    backgroundColor: theme.surface2,
    borderRadius: 5,
    paddingHorizontal: 18,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.silver,
  },
  addBtnDisabled: {
    borderColor: theme.border,
  },
  addBtnText: {
    color: theme.silverBright,
    fontWeight: '600',
    fontSize: 14,
  },
});
