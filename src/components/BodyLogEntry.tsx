import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BodyEntry } from '../types';
import { theme } from '../theme';

interface Props {
  entry: BodyEntry;
  onRemove: () => void;
}

export function BodyLogEntry({ entry, onRemove }: Props) {
  const m = entry.measurements;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.date}>{entry.date}</Text>
        <View style={styles.right}>
          <Text style={styles.weight}>{entry.weight} lbs</Text>
          <TouchableOpacity onPress={onRemove} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.remove}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
      {m && (
        <View style={styles.measurements}>
          {m.chest !== undefined && (
            <Text style={styles.meas}>Chest {m.chest}"</Text>
          )}
          {m.waist !== undefined && (
            <Text style={styles.meas}>Waist {m.waist}"</Text>
          )}
          {m.arms !== undefined && (
            <Text style={styles.meas}>Arms {m.arms}"</Text>
          )}
          {m.quads !== undefined && (
            <Text style={styles.meas}>Quads {m.quads}"</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.card,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: { color: theme.textMuted, fontSize: 13 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  weight: { color: theme.text, fontSize: 16, fontWeight: '700' },
  remove: { color: theme.textMuted, fontSize: 16 },
  measurements: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  meas: { color: theme.textMuted, fontSize: 13 },
});
