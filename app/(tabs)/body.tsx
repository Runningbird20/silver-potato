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
import { useBody } from '../../src/hooks/useBody';
import { BodyLogEntry } from '../../src/components/BodyLogEntry';
import { theme } from '../../src/theme';

export default function BodyScreen() {
  const { entries, logWeight, removeEntry, latestEntry } = useBody();
  const [weight, setWeight] = useState('');
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [arms, setArms] = useState('');
  const [quads, setQuads] = useState('');

  const handleLog = () => {
    if (!weight) return;
    const hasMeasurements = chest || waist || arms || quads;
    logWeight(parseFloat(weight), hasMeasurements
      ? {
          chest: chest ? parseFloat(chest) : undefined,
          waist: waist ? parseFloat(waist) : undefined,
          arms: arms ? parseFloat(arms) : undefined,
          quads: quads ? parseFloat(quads) : undefined,
        }
      : undefined
    );
    setWeight('');
    setChest('');
    setWaist('');
    setArms('');
    setQuads('');
  };

  const weightDelta =
    entries.length >= 2
      ? (entries[0].weight - entries[1].weight).toFixed(1)
      : null;

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
          <Text style={styles.heading}>Body</Text>

          {latestEntry && (
            <View style={styles.latestCard}>
              <Text style={styles.latestLabel}>Current Weight</Text>
              <Text style={styles.latestWeight}>{latestEntry.weight} lbs</Text>
              {weightDelta !== null && (
                <Text
                  style={[
                    styles.delta,
                    {
                      color:
                        parseFloat(weightDelta) <= 0
                          ? theme.success
                          : theme.error,
                    },
                  ]}
                >
                  {parseFloat(weightDelta) > 0 ? '+' : ''}
                  {weightDelta} lbs vs prev
                </Text>
              )}
              <Text style={styles.latestDate}>{latestEntry.date}</Text>
            </View>
          )}

          <View style={styles.form}>
            <Text style={styles.formTitle}>Log Entry</Text>
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              placeholder="Bodyweight (lbs)"
              placeholderTextColor={theme.textMuted}
              keyboardType="numeric"
            />
            <Text style={styles.sectionLabel}>Measurements (inches, optional)</Text>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.flex]}
                value={chest}
                onChangeText={setChest}
                placeholder='Chest"'
                placeholderTextColor={theme.textMuted}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, styles.flex]}
                value={waist}
                onChangeText={setWaist}
                placeholder='Waist"'
                placeholderTextColor={theme.textMuted}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.flex]}
                value={arms}
                onChangeText={setArms}
                placeholder='Arms"'
                placeholderTextColor={theme.textMuted}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, styles.flex]}
                value={quads}
                onChangeText={setQuads}
                placeholder='Quads"'
                placeholderTextColor={theme.textMuted}
                keyboardType="numeric"
              />
            </View>
            <TouchableOpacity onPress={handleLog} style={styles.logBtn}>
              <Text style={styles.logBtnText}>Log Entry</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.historyTitle}>History</Text>
          {entries.map((entry) => (
            <BodyLogEntry
              key={entry.id}
              entry={entry}
              onRemove={() => removeEntry(entry.id)}
            />
          ))}
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
  heading: { color: theme.text, fontSize: 26, fontWeight: '700', marginBottom: 16 },
  latestCard: {
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
  },
  latestLabel: { color: theme.textMuted, fontSize: 12, marginBottom: 6 },
  latestWeight: { color: theme.accent, fontSize: 36, fontWeight: '700' },
  delta: { fontSize: 13, marginTop: 4, fontWeight: '600' },
  latestDate: { color: theme.textMuted, fontSize: 12, marginTop: 6 },
  form: {
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 8,
    marginBottom: 20,
  },
  formTitle: { color: theme.text, fontSize: 16, fontWeight: '600', marginBottom: 4 },
  sectionLabel: { color: theme.textMuted, fontSize: 12, marginTop: 4 },
  row: { flexDirection: 'row', gap: 8 },
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
  logBtn: {
    backgroundColor: theme.accent,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 4,
  },
  logBtnText: { color: '#000', fontWeight: '700', fontSize: 15 },
  historyTitle: {
    color: theme.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
});
