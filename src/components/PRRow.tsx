import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PR } from '../types';
import { theme } from '../theme';

interface Props {
  pr: PR;
  onRemove: () => void;
}

export function PRRow({ pr, onRemove }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={styles.name}>{pr.exerciseName}</Text>
        <Text style={styles.date}>{pr.date}</Text>
      </View>
      <Text style={styles.lift}>
        {pr.weight} lbs × {pr.reps}
      </Text>
      <TouchableOpacity onPress={onRemove} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={styles.remove}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  left: { flex: 1 },
  name: { color: theme.text, fontSize: 15, fontWeight: '600' },
  date: { color: theme.textMuted, fontSize: 12, marginTop: 2 },
  lift: {
    color: theme.accent,
    fontSize: 14,
    fontWeight: '700',
    marginRight: 14,
  },
  remove: { color: theme.textMuted, fontSize: 16 },
});
