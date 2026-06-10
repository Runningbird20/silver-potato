import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Exercise, ExerciseSet } from '../types';
import { theme } from '../theme';
import { SetTableRow } from './SetTableRow';
import { useRestTimer } from '../hooks/useTimer';

// ─── Rest duration picker modal ───────────────────────────────────────────────

const REST_PRESETS = [30, 60, 90, 120, 180, 240];

function formatPreset(s: number) {
  return s < 60 ? `${s}s` : `${s / 60}m`;
}

function RestTimerModal({
  visible,
  current,
  onSelect,
  onClose,
}: {
  visible: boolean;
  current: number;
  onSelect: (s: number) => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable style={modal.overlay} onPress={onClose}>
        <Pressable style={modal.sheet} onPress={() => {}}>
          <Text style={modal.title}>Rest Timer</Text>
          <View style={modal.presets}>
            {REST_PRESETS.map((s) => (
              <TouchableOpacity
                key={s}
                style={[modal.preset, current === s && modal.presetActive]}
                onPress={() => onSelect(s)}
              >
                <Text
                  style={[
                    modal.presetText,
                    current === s && modal.presetTextActive,
                  ]}
                >
                  {formatPreset(s)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={modal.doneBtn} onPress={onClose}>
            <Text style={modal.doneText}>Done</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const modal = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.surface,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 20,
    borderTopWidth: 1,
    borderColor: theme.border,
  },
  title: {
    color: theme.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 20,
  },
  preset: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surface2,
  },
  presetActive: {
    borderColor: theme.silver,
    backgroundColor: theme.surface2,
  },
  presetText: {
    color: theme.textSecondary,
    fontSize: 14,
  },
  presetTextActive: {
    color: theme.silverBright,
    fontWeight: '600',
  },
  doneBtn: {
    paddingVertical: 13,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
  },
  doneText: {
    color: theme.text,
    fontSize: 14,
    fontWeight: '600',
  },
});

// ─── Rest timer banner ────────────────────────────────────────────────────────

function RestTimerBanner({
  formatted,
  onDismiss,
}: {
  formatted: string;
  onDismiss: () => void;
}) {
  return (
    <View style={banner.row}>
      <Ionicons name="timer-outline" size={13} color={theme.silver} />
      <Text style={banner.text}>Rest  {formatted}</Text>
      <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}>
        <Text style={banner.skip}>Skip</Text>
      </TouchableOpacity>
    </View>
  );
}

const banner = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: theme.surface2,
    borderRadius: 5,
    marginTop: 6,
    borderWidth: 1,
    borderColor: theme.border,
  },
  text: {
    flex: 1,
    color: theme.silver,
    fontSize: 13,
    fontVariant: ['tabular-nums'],
  },
  skip: {
    color: theme.textSecondary,
    fontSize: 12,
  },
});

// ─── ExerciseBlock ────────────────────────────────────────────────────────────

interface Props {
  exercise: Exercise;
  onUpdateSet: (setId: string, field: 'weight' | 'reps', value: number) => void;
  onCompleteSet: (setId: string) => void;
  onAddSet: () => void;
  onNotesChange: (notes: string) => void;
  getPreviousSet: (name: string, index: number) => { weight: number; reps: number } | null;
}

export function ExerciseBlock({
  exercise,
  onUpdateSet,
  onCompleteSet,
  onAddSet,
  onNotesChange,
  getPreviousSet,
}: Props) {
  const [restDuration, setRestDuration] = useState(90);
  const [showRestModal, setShowRestModal] = useState(false);
  const restTimer = useRestTimer();

  const handleCompleteSet = (setId: string) => {
    onCompleteSet(setId);
    restTimer.start(restDuration);
  };

  return (
    <View style={styles.block}>
      {/* Exercise name */}
      <Text style={styles.exerciseName}>{exercise.name}</Text>

      {/* Notes */}
      <TextInput
        style={styles.notes}
        value={exercise.notes ?? ''}
        onChangeText={onNotesChange}
        placeholder="Add notes here..."
        placeholderTextColor={theme.textTertiary}
        multiline
      />

      {/* Rest timer trigger row */}
      <TouchableOpacity
        style={styles.restRow}
        onPress={() => setShowRestModal(true)}
      >
        <Ionicons name="time-outline" size={12} color={theme.textTertiary} />
        <Text style={styles.restLabel}>
          Rest Timer: {formatPreset(restDuration)}
        </Text>
      </TouchableOpacity>

      {/* Column headers */}
      <View style={styles.tableHeader}>
        <Text style={[styles.colHdr, { width: 24 }]}>SET</Text>
        <Text style={[styles.colHdr, { flex: 1.4 }]}>PREVIOUS</Text>
        <Text style={[styles.colHdr, { flex: 1, textAlign: 'center' }]}>LBS</Text>
        <Text style={[styles.colHdr, { flex: 1, textAlign: 'center' }]}>REPS</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Sets */}
      {exercise.sets.map((set, i) => (
        <SetTableRow
          key={set.id}
          set={set}
          index={i}
          previous={getPreviousSet(exercise.name, i)}
          onUpdate={(field, val) => onUpdateSet(set.id, field, val)}
          onComplete={() => handleCompleteSet(set.id)}
        />
      ))}

      {/* Rest timer banner */}
      {restTimer.remaining !== null && restTimer.formatted && (
        <RestTimerBanner
          formatted={restTimer.formatted}
          onDismiss={restTimer.dismiss}
        />
      )}

      {/* Add set */}
      <TouchableOpacity style={styles.addSetBtn} onPress={onAddSet}>
        <Text style={styles.addSetText}>+ Add Set</Text>
      </TouchableOpacity>

      {/* Rest duration modal */}
      <RestTimerModal
        visible={showRestModal}
        current={restDuration}
        onSelect={(s) => {
          setRestDuration(s);
          setShowRestModal(false);
        }}
        onClose={() => setShowRestModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    marginBottom: 24,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  exerciseName: {
    color: theme.silver,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  notes: {
    color: theme.textSecondary,
    fontSize: 13,
    paddingVertical: 4,
    marginBottom: 6,
    minHeight: 20,
  },
  restRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 12,
  },
  restLabel: {
    color: theme.textTertiary,
    fontSize: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 2,
    marginBottom: 4,
  },
  colHdr: {
    color: theme.textTertiary,
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  addSetBtn: {
    marginTop: 10,
    paddingVertical: 10,
    backgroundColor: theme.surface2,
    borderRadius: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  addSetText: {
    color: theme.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
});
