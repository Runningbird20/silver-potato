import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Exercise, ExerciseSet } from '../types';
import { theme } from '../theme';
import { SetRow } from './SetRow';

interface Props {
  exercise: Exercise;
  volume: number;
  onAddSet: () => void;
  onUpdateSet: (setId: string, patch: Partial<ExerciseSet>) => void;
  onCompleteSet: (setId: string) => void;
}

export function ExerciseCard({
  exercise,
  volume,
  onAddSet,
  onUpdateSet,
  onCompleteSet,
}: Props) {
  const completedSets = exercise.sets.filter((s) => s.completed).length;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{exercise.name}</Text>
        <Text style={styles.meta}>
          {completedSets}/{exercise.sets.length} sets · {volume} lbs vol
        </Text>
      </View>

      {exercise.sets.length > 0 && (
        <View style={styles.columnLabels}>
          <Text style={styles.colLabel}>SET</Text>
          <Text style={[styles.colLabel, styles.colCenter]}>LBS</Text>
          <Text style={[styles.colLabel, styles.colCenter]}>REPS</Text>
          <Text style={[styles.colLabel, { width: 36 }]} />
        </View>
      )}

      {exercise.sets.map((set, i) => (
        <SetRow
          key={set.id}
          set={set}
          index={i}
          onUpdate={(patch) => onUpdateSet(set.id, patch)}
          onComplete={() => onCompleteSet(set.id)}
        />
      ))}

      <TouchableOpacity onPress={onAddSet} style={styles.addSetBtn}>
        <Text style={styles.addSetText}>+ Add Set</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  name: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '600',
  },
  meta: {
    color: theme.textMuted,
    fontSize: 12,
  },
  columnLabels: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  colLabel: {
    color: theme.textMuted,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    width: 20,
    textAlign: 'center',
  },
  colCenter: {
    flex: 1,
    textAlign: 'left',
  },
  addSetBtn: {
    marginTop: 10,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  addSetText: {
    color: theme.accent,
    fontSize: 13,
    fontWeight: '600',
  },
});
