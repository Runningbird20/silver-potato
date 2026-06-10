import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ExerciseSet } from '../types';
import { theme } from '../theme';

interface Props {
  set: ExerciseSet;
  index: number;
  previous: { weight: number; reps: number } | null;
  onUpdate: (field: 'weight' | 'reps', value: number) => void;
  onComplete: () => void;
}

export function SetTableRow({ set, index, previous, onUpdate, onComplete }: Props) {
  const prevText = previous ? `${previous.weight} × ${previous.reps}` : '—';

  return (
    <View style={[styles.row, set.completed && styles.rowDone]}>
      <Text style={[styles.setNum, set.completed && styles.setNumDone]}>
        {index + 1}
      </Text>

      <Text style={styles.previous}>{prevText}</Text>

      <TextInput
        style={[styles.input, set.completed && styles.inputDone]}
        value={set.weight > 0 ? String(set.weight) : ''}
        onChangeText={(v) => onUpdate('weight', parseFloat(v) || 0)}
        placeholder="0"
        placeholderTextColor={theme.textTertiary}
        keyboardType="numeric"
        editable={!set.completed}
        selectTextOnFocus
        fontVariant={['tabular-nums']}
      />

      <TextInput
        style={[styles.input, set.completed && styles.inputDone]}
        value={set.reps > 0 ? String(set.reps) : ''}
        onChangeText={(v) => onUpdate('reps', parseInt(v, 10) || 0)}
        placeholder="0"
        placeholderTextColor={theme.textTertiary}
        keyboardType="numeric"
        editable={!set.completed}
        selectTextOnFocus
        fontVariant={['tabular-nums']}
      />

      <TouchableOpacity
        onPress={onComplete}
        disabled={set.completed}
        style={[styles.check, set.completed && styles.checkDone]}
        hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
      >
        <Ionicons
          name="checkmark"
          size={15}
          color={set.completed ? theme.background : theme.textTertiary}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 5,
    paddingHorizontal: 2,
    borderRadius: 4,
  },
  rowDone: {
    backgroundColor: theme.surface2,
  },

  setNum: {
    width: 24,
    textAlign: 'center',
    color: theme.textTertiary,
    fontSize: 13,
    fontVariant: ['tabular-nums'],
  },
  setNumDone: {
    color: theme.textSecondary,
  },

  previous: {
    flex: 1.4,
    color: theme.textSecondary,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    paddingLeft: 2,
  },

  input: {
    flex: 1,
    backgroundColor: theme.surface2,
    color: theme.silverBright,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 6,
    paddingVertical: 6,
    fontSize: 14,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  inputDone: {
    borderColor: 'transparent',
    color: theme.textSecondary,
  },

  check: {
    width: 32,
    height: 32,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkDone: {
    backgroundColor: theme.success,
    borderColor: theme.success,
  },
});
