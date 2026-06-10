import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { ExerciseSet } from '../types';
import { theme } from '../theme';

interface Props {
  set: ExerciseSet;
  index: number;
  onUpdate: (patch: Partial<ExerciseSet>) => void;
  onComplete: () => void;
}

export function SetRow({ set, index, onUpdate, onComplete }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.setNum}>{index + 1}</Text>
      <TextInput
        style={styles.input}
        value={set.weight > 0 ? String(set.weight) : ''}
        onChangeText={(v) => onUpdate({ weight: parseFloat(v) || 0 })}
        placeholder="lbs"
        placeholderTextColor={theme.textMuted}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        value={set.reps > 0 ? String(set.reps) : ''}
        onChangeText={(v) => onUpdate({ reps: parseInt(v, 10) || 0 })}
        placeholder="reps"
        placeholderTextColor={theme.textMuted}
        keyboardType="numeric"
      />
      <TouchableOpacity
        onPress={onComplete}
        style={[styles.checkBtn, set.completed && styles.checkBtnDone]}
        disabled={set.completed}
      >
        <Text style={[styles.checkText, set.completed && styles.checkTextDone]}>
          {set.completed ? '✓' : '○'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  setNum: {
    color: theme.textMuted,
    width: 20,
    textAlign: 'center',
    fontSize: 13,
  },
  input: {
    flex: 1,
    backgroundColor: theme.surface,
    color: theme.text,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: theme.border,
    fontSize: 14,
  },
  checkBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBtnDone: {
    backgroundColor: theme.success,
    borderColor: theme.success,
  },
  checkText: {
    color: theme.textMuted,
    fontSize: 16,
  },
  checkTextDone: {
    color: '#000',
    fontWeight: '700',
  },
});
