import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AuthUser } from '../auth/mockAuth';
import {
  OnboardingData,
  emptyOnboardingData,
  getOnboardingProgress,
  saveOnboardingProgress,
} from '../onboarding/onboardingStorage';
import {
  ProfileSelectorCard,
  UnitToggle,
  WheelPickerSheet,
  cmLabelToInches,
  createHeightOptions,
  createNumberOptions,
  heightLabelToInches,
  inchesToCmLabel,
  inchesToFtInLabel,
  kgToLbLabel,
  lbToKgLabel,
  weightLabelToKg,
  weightLabelToLb,
} from '../onboarding/OnboardingFlow';

const ageOptions = createNumberOptions(13, 100);
const heightFtInOptions = createHeightOptions(48, 90);
const heightCmOptions = createNumberOptions(122, 229, ' cm');
const weightLbOptions = createNumberOptions(70, 450, ' lb');
const weightKgOptions = createNumberOptions(32, 204, ' kg');
const durationOptions = createNumberOptions(15, 180, ' min', 5);
const daysPerWeekOptions = Array.from({ length: 7 }, (_item, index) => {
  const days = index + 1;
  return `${days} ${days === 1 ? 'day' : 'days'}/week`;
});
const equipmentOptions = [
  'Full gym',
  'Home gym',
  'Dumbbells only',
  'Bodyweight only',
  'Track access',
  'Sprint field access',
];

type SettingsScreenProps = {
  user: AuthUser;
  onDirtyChange?: (isDirty: boolean) => void;
};

type ActivePicker = 'age' | 'height' | 'weight' | 'duration' | 'days' | null;

export function SettingsScreen({ user, onDirtyChange }: SettingsScreenProps) {
  const [draft, setDraft] = useState<OnboardingData>({
    ...emptyOnboardingData,
    displayName: user.name,
  });
  const [isDirty, setIsDirty] = useState(false);
  const [activePicker, setActivePicker] = useState<ActivePicker>(null);
  const [unitSystem, setUnitSystem] = useState<'imperial' | 'metric'>('imperial');
  const toastAnim = useRef(new Animated.Value(0)).current;
  const screenAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(screenAnim, {
      duration: 240,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [screenAnim]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    let isMounted = true;

    getOnboardingProgress(user.id).then((progress) => {
      if (!isMounted) {
        return;
      }

      const nextData = {
        ...emptyOnboardingData,
        displayName: user.name,
        ...progress?.data,
      };

      setDraft(nextData);
      setUnitSystem(nextData.heightUnit === 'cm' ? 'metric' : 'imperial');
    });

    return () => {
      isMounted = false;
    };
  }, [user.id, user.name]);

  function updateDraft(partialData: Partial<OnboardingData>) {
    setDraft((current) => ({ ...current, ...partialData }));
    setIsDirty(true);
  }

  function setUnits(nextSystem: 'imperial' | 'metric') {
    if (nextSystem === unitSystem) {
      return;
    }

    setUnitSystem(nextSystem);

    if (nextSystem === 'metric') {
      updateDraft({
        height: inchesToCmLabel(heightLabelToInches(draft.height)),
        heightUnit: 'cm',
        weight: lbToKgLabel(weightLabelToLb(draft.weight)),
        weightUnit: 'kg',
      });
      return;
    }

    updateDraft({
      height: inchesToFtInLabel(cmLabelToInches(draft.height)),
      heightUnit: 'ftin',
      weight: kgToLbLabel(weightLabelToKg(draft.weight)),
      weightUnit: 'lb',
    });
  }

  function toggleListValue(key: 'equipment', value: string) {
    const currentValues = draft[key];
    updateDraft({
      [key]: currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value],
    });
  }

  async function saveChanges() {
    await saveOnboardingProgress(user.id, {
      completed: true,
      currentStep: 3,
      data: draft,
    });

    setIsDirty(false);
    toastAnim.setValue(0);
    Animated.sequence([
      Animated.timing(toastAnim, {
        duration: 220,
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.delay(1300),
      Animated.timing(toastAnim, {
        duration: 220,
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();
  }

  return (
    <Animated.View style={[styles.screen, { opacity: screenAnim }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>Settings</Text>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.copy}>Tune your training profile and preferences.</Text>
        </View>

        <SettingsSection title="Profile">
          <EditableSettingCard label="Display name">
            <TextInput
              onChangeText={(displayName) => updateDraft({ displayName })}
              placeholder="Display name"
              placeholderTextColor="#8E939F"
              style={styles.textInput}
              value={draft.displayName}
            />
          </EditableSettingCard>

          <ProfileSelectorCard
            label="Age"
            onPress={() => setActivePicker('age')}
            value={draft.age || 'Select'}
          />
          <ProfileSelectorCard
            label="Height"
            meta={draft.heightUnit === 'ftin' ? 'ft/in' : 'cm'}
            onPress={() => setActivePicker('height')}
            value={draft.height || 'Select'}
          />
          <ProfileSelectorCard
            label="Weight"
            meta={draft.weightUnit}
            onPress={() => setActivePicker('weight')}
            value={draft.weight || 'Select'}
          />
        </SettingsSection>

        <SettingsSection title="Training">
          <ProfileSelectorCard
            label="Days/week"
            onPress={() => setActivePicker('days')}
            value={draft.daysPerWeek || 'Select'}
          />
          <ProfileSelectorCard
            label="Workout duration"
            onPress={() => setActivePicker('duration')}
            value={draft.workoutDuration || 'Select'}
          />
          <EditableSettingCard label="Equipment access">
            <ChipGrid
              options={equipmentOptions}
              selected={draft.equipment}
              onPress={(equipment) => toggleListValue('equipment', equipment)}
            />
          </EditableSettingCard>
        </SettingsSection>

        <SettingsSection title="Units & Preferences">
          <UnitToggle
            options={[
              { label: 'Imperial', value: 'imperial' },
              { label: 'Metric', value: 'metric' },
            ]}
            selected={unitSystem}
            onSelect={setUnits}
          />
        </SettingsSection>

        <SettingsSection title="Appearance">
          <EditableSettingCard label="Theme">
            <View style={styles.preferenceRow}>
              <Text style={styles.preferenceValue}>Dark mode</Text>
              <Text style={styles.preferenceMeta}>Enabled</Text>
            </View>
          </EditableSettingCard>
        </SettingsSection>

        <Pressable
          accessibilityRole="button"
          disabled={!isDirty}
          onPress={saveChanges}
          style={[styles.saveButton, !isDirty && styles.disabledButton]}
        >
          <Text style={styles.saveButtonText}>
            {isDirty ? 'Save Changes' : 'Saved'}
          </Text>
        </Pressable>
      </ScrollView>

      <SaveConfirmation animatedValue={toastAnim} />

      <WheelPickerSheet
        onCommit={(age) => updateDraft({ age })}
        onDismiss={() => setActivePicker(null)}
        options={ageOptions}
        title="Age"
        value={draft.age || '28'}
        visible={activePicker === 'age'}
      />
      <WheelPickerSheet
        convertValue={(height, _fromUnit, toUnit) =>
          toUnit === 'cm'
            ? inchesToCmLabel(heightLabelToInches(height))
            : inchesToFtInLabel(cmLabelToInches(height))
        }
        onCommit={(height, heightUnit) =>
          updateDraft({ height, heightUnit: heightUnit as 'ftin' | 'cm' })
        }
        onDismiss={() => setActivePicker(null)}
        options={draft.heightUnit === 'ftin' ? heightFtInOptions : heightCmOptions}
        optionsByUnit={{ cm: heightCmOptions, ftin: heightFtInOptions }}
        title="Height"
        unitOptions={[
          { label: 'ft/in', value: 'ftin' },
          { label: 'cm', value: 'cm' },
        ]}
        unitValue={draft.heightUnit}
        value={draft.height || (draft.heightUnit === 'ftin' ? `5'10"` : '178 cm')}
        visible={activePicker === 'height'}
      />
      <WheelPickerSheet
        convertValue={(weight, _fromUnit, toUnit) =>
          toUnit === 'kg'
            ? lbToKgLabel(weightLabelToLb(weight))
            : kgToLbLabel(weightLabelToKg(weight))
        }
        onCommit={(weight, weightUnit) =>
          updateDraft({ weight, weightUnit: weightUnit as 'lb' | 'kg' })
        }
        onDismiss={() => setActivePicker(null)}
        options={draft.weightUnit === 'lb' ? weightLbOptions : weightKgOptions}
        optionsByUnit={{ kg: weightKgOptions, lb: weightLbOptions }}
        title="Weight"
        unitOptions={[
          { label: 'lb', value: 'lb' },
          { label: 'kg', value: 'kg' },
        ]}
        unitValue={draft.weightUnit}
        value={draft.weight || (draft.weightUnit === 'lb' ? '180 lb' : '82 kg')}
        visible={activePicker === 'weight'}
      />
      <WheelPickerSheet
        onCommit={(daysPerWeek) => updateDraft({ daysPerWeek })}
        onDismiss={() => setActivePicker(null)}
        options={daysPerWeekOptions}
        title="Days per week"
        value={draft.daysPerWeek || '4 days/week'}
        visible={activePicker === 'days'}
      />
      <WheelPickerSheet
        onCommit={(workoutDuration) => updateDraft({ workoutDuration })}
        onDismiss={() => setActivePicker(null)}
        options={durationOptions}
        title="Workout duration"
        value={draft.workoutDuration || '45 min'}
        visible={activePicker === 'duration'}
      />
    </Animated.View>
  );
}

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function EditableSettingCard({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.settingCard}>
      <Text style={styles.settingLabel}>{label}</Text>
      {children}
    </View>
  );
}

function ChipGrid({
  options,
  selected,
  onPress,
  compact = false,
}: {
  options: string[];
  selected: string[];
  onPress: (value: string) => void;
  compact?: boolean;
}) {
  return (
    <View style={[styles.chipGrid, compact && styles.compactChipGrid]}>
      {options.map((option) => {
        const isSelected = selected.includes(option);

        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            key={option}
            onPress={() => onPress(option)}
            style={[styles.chip, compact && styles.compactChip, isSelected && styles.selectedChip]}
          >
            <Text style={[styles.chipText, isSelected && styles.selectedChipText]}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function SaveConfirmation({
  animatedValue,
}: {
  animatedValue: Animated.Value;
}) {
  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-16, 0],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.saveToast,
        {
          opacity: animatedValue,
          transform: [{ translateY }],
        },
      ]}
    >
      <Text style={styles.saveToastText}>Changes saved</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#07080C',
  },
  content: {
    gap: 18,
    padding: 20,
    paddingBottom: 118,
    paddingTop: 24,
  },
  header: {
    gap: 8,
  },
  kicker: {
    color: '#8F95A3',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    color: '#F7F8FB',
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 40,
  },
  copy: {
    color: '#8F95A3',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: '#F7F8FB',
    fontSize: 18,
    fontWeight: '900',
  },
  sectionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 28,
    borderWidth: 1,
    gap: 12,
    padding: 14,
  },
  settingCard: {
    gap: 10,
  },
  settingLabel: {
    color: '#F2F4F8',
    fontSize: 15,
    fontWeight: '800',
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 999,
    borderWidth: 1,
    color: '#F7F8FB',
    fontSize: 16,
    minHeight: 50,
    paddingHorizontal: 18,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  compactChipGrid: {
    flexWrap: 'nowrap',
  },
  chip: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  compactChip: {
    flex: 1,
    paddingHorizontal: 8,
  },
  selectedChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.28)',
  },
  chipText: {
    color: '#C7CCD6',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  selectedChipText: {
    color: '#FFFFFF',
  },
  preferenceRow: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 50,
    paddingHorizontal: 18,
  },
  preferenceValue: {
    color: '#F7F8FB',
    fontSize: 15,
    fontWeight: '900',
  },
  preferenceMeta: {
    color: '#8F95A3',
    fontSize: 13,
    fontWeight: '800',
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: '#E8FF1A',
    borderRadius: 999,
    justifyContent: 'center',
    minHeight: 58,
  },
  disabledButton: {
    opacity: 0.45,
  },
  saveButtonText: {
    color: '#050608',
    fontSize: 16,
    fontWeight: '900',
  },
  saveToast: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 999,
    borderWidth: 1,
    bottom: 94,
    paddingHorizontal: 18,
    paddingVertical: 12,
    position: 'absolute',
  },
  saveToastText: {
    color: '#F7F8FB',
    fontSize: 14,
    fontWeight: '900',
  },
});
