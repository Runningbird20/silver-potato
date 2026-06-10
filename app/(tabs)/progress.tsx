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
import { useProgress } from '../../src/hooks/useProgress';
import { PRRow } from '../../src/components/PRRow';
import { theme } from '../../src/theme';

export default function ProgressScreen() {
  const { prs, addPR, removePR } = useProgress();
  const [exercise, setExercise] = useState('');
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');

  const handleAddPR = () => {
    if (!exercise.trim() || !weight) return;
    addPR({
      exerciseName: exercise.trim(),
      weight: parseFloat(weight),
      reps: parseInt(reps, 10) || 1,
      date: new Date().toISOString().split('T')[0],
    });
    setExercise('');
    setWeight('');
    setReps('');
  };

  const sortedPRs = [...prs].sort((a, b) => b.date.localeCompare(a.date));

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
          <Text style={styles.heading}>Personal Records</Text>
          <Text style={styles.sub}>{prs.length} lifts tracked</Text>

          {sortedPRs.map((pr) => (
            <PRRow key={pr.id} pr={pr} onRemove={() => removePR(pr.id)} />
          ))}

          <View style={styles.form}>
            <Text style={styles.formTitle}>Log New PR</Text>
            <TextInput
              style={styles.input}
              value={exercise}
              onChangeText={setExercise}
              placeholder="Exercise name"
              placeholderTextColor={theme.textMuted}
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.flex]}
                value={weight}
                onChangeText={setWeight}
                placeholder="Weight (lbs)"
                placeholderTextColor={theme.textMuted}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, styles.flex]}
                value={reps}
                onChangeText={setReps}
                placeholder="Reps"
                placeholderTextColor={theme.textMuted}
                keyboardType="numeric"
              />
            </View>
            <TouchableOpacity onPress={handleAddPR} style={styles.addBtn}>
              <Text style={styles.addBtnText}>Log PR</Text>
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
  heading: { color: theme.text, fontSize: 26, fontWeight: '700', marginBottom: 4 },
  sub: { color: theme.textMuted, fontSize: 13, marginBottom: 16 },
  form: {
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 8,
  },
  formTitle: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    backgroundColor: theme.surface,
    color: theme.text,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: theme.border,
    fontSize: 14,
  },
  row: { flexDirection: 'row', gap: 8 },
  addBtn: {
    backgroundColor: theme.accent,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 4,
  },
  addBtnText: { color: '#000', fontWeight: '700', fontSize: 15 },
});
