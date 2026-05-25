import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  AccessibilityInfo,
  Animated,
  KeyboardAvoidingView,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  PanResponder,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

import { AuthUser } from '../auth/mockAuth';
import {
  OnboardingData,
  completeOnboarding,
  emptyOnboardingData,
  getOnboardingProgress,
  saveOnboardingProgress,
} from './onboardingStorage';

const totalSteps = 4;
const experienceLevels = ['Beginner', 'Intermediate', 'Advanced'];
const ageOptions = createNumberOptions(13, 100);
const heightFtInOptions = createHeightOptions(48, 90);
const heightCmOptions = createNumberOptions(122, 229, ' cm');
const weightLbOptions = createNumberOptions(70, 450, ' lb');
const weightKgOptions = createNumberOptions(32, 204, ' kg');
const durationOptions = createNumberOptions(15, 180, ' min', 5);
const daysPerWeekOptions = createDayOptions();
const equipmentOptions = [
  'Full gym',
  'Home gym',
  'Dumbbells only',
  'Bodyweight only',
  'Track access',
  'Sprint field access',
];

type OnboardingFlowProps = {
  user: AuthUser;
  onComplete: () => void;
};

type StepProps = {
  data: OnboardingData;
  error: string;
  setData: (data: Partial<OnboardingData>) => void;
};

export function OnboardingFlow({ user, onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const [data, setDataState] = useState<OnboardingData>({
    ...emptyOnboardingData,
    displayName: user.name,
  });
  const [error, setError] = useState('');
  const [isReady, setIsReady] = useState(false);
  const progressAnim = useRef(new Animated.Value(1 / totalSteps)).current;
  const stepAnim = useRef(new Animated.Value(1)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  const completion = (step + 1) / totalSteps;

  useEffect(() => {
    let isMounted = true;

    getOnboardingProgress(user.id).then((progress) => {
      if (!isMounted) {
        return;
      }

      if (progress) {
        setStep(Math.min(progress.currentStep, totalSteps - 1));
        setDataState({ ...emptyOnboardingData, ...progress.data });
      }

      setIsReady(true);
    });

    return () => {
      isMounted = false;
    };
  }, [user.id]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      duration: 260,
      toValue: completion,
      useNativeDriver: false,
    }).start();

    stepAnim.setValue(0);
    Animated.timing(stepAnim, {
      duration: 220,
      toValue: 1,
      useNativeDriver: true,
    }).start();

    if (step === totalSteps - 1) {
      successAnim.setValue(0);
      Animated.spring(successAnim, {
        friction: 6,
        tension: 80,
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  }, [completion, progressAnim, step, stepAnim, successAnim]);

  async function persist(nextStep = step, nextData = data) {
    await saveOnboardingProgress(user.id, {
      completed: false,
      currentStep: nextStep,
      data: nextData,
    });
  }

  function setData(partialData: Partial<OnboardingData>) {
    const nextData = { ...data, ...partialData };
    setDataState(nextData);
    persist(step, nextData);
    setError('');
  }

  async function goBack() {
    const nextStep = Math.max(0, step - 1);
    setStep(nextStep);
    setError('');
    await persist(nextStep);
  }

  async function goNext() {
    const validationError = validateStep(step, data);

    if (validationError) {
      setError(validationError);
      return;
    }

    const nextStep = Math.min(totalSteps - 1, step + 1);
    setStep(nextStep);
    setError('');
    await persist(nextStep);
  }

  async function finish() {
    await completeOnboarding(user.id, data);
    onComplete();
  }

  if (!isReady) {
    return (
      <SafeAreaView style={styles.screen}>
        <StatusBar style="light" />
        <View style={styles.loadingShell}>
          <Text style={styles.kicker}>Preparing profile</Text>
        </View>
      </SafeAreaView>
    );
  }

  const StepComponent = stepComponents[step];
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });
  const stepOpacity = stepAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const stepTranslate = stepAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [14, 0],
  });
  const successScale = successAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.78, 1],
  });

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.progressHeader}>
            <View style={styles.progressMeta}>
              <Text style={styles.kicker}>Onboarding</Text>
              <Text style={styles.progressText}>
                Step {step + 1} of {totalSteps} / {Math.round(completion * 100)}%
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
            </View>
          </View>

          <Animated.View
            style={[
              styles.stepCard,
              {
                opacity: stepOpacity,
                transform: [{ translateY: stepTranslate }],
              },
            ]}
          >
            <StepComponent
              data={data}
              error={error}
              setData={setData}
              successScale={successScale}
            />
          </Animated.View>

          <View style={styles.actions}>
            {step > 0 ? (
              <Pressable
                accessibilityLabel="Back"
                accessibilityRole="button"
                onPress={goBack}
                style={styles.backButton}
              >
                <Text style={styles.backButtonText}>‹</Text>
              </Pressable>
            ) : null}

            {step < totalSteps - 1 ? (
              <Pressable
                accessibilityRole="button"
                onPress={goNext}
                style={[styles.primaryButton, step === 0 && styles.singleActionButton]}
              >
                <Text style={styles.primaryButtonText}>Continue</Text>
              </Pressable>
            ) : (
              <Pressable
                accessibilityRole="button"
                onPress={finish}
                style={styles.primaryButton}
              >
                <Text style={styles.primaryButtonText}>Enter App</Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ProfileStep({ data, error, setData }: StepProps) {
  const [activePicker, setActivePicker] = useState<
    'age' | 'height' | 'weight' | null
  >(null);

  return (
    <View style={styles.stepInner}>
      <StepTitle
        eyebrow="Profile"
        title="Tell us the basics."
        copy="This helps shape your first training plan."
      />
      <TextField
        compact
        label="Display name"
        onChangeText={(displayName) => setData({ displayName })}
        placeholder="Cristian"
        value={data.displayName}
      />
      <ProfileSelectorCard
        label="Age"
        value={data.age || 'Select'}
        onPress={() => setActivePicker('age')}
      />
      <ProfileSelectorCard
        label="Height"
        value={data.height || 'Select'}
        meta={data.heightUnit === 'ftin' ? 'ft/in' : 'cm'}
        onPress={() => setActivePicker('height')}
      />
      <ProfileSelectorCard
        label="Weight"
        value={data.weight}
        meta={data.weightUnit}
        onPress={() => setActivePicker('weight')}
      />
      <InlineError error={error} />

      <WheelPickerSheet
        onDismiss={() => setActivePicker(null)}
        onCommit={(age) => setData({ age })}
        options={ageOptions}
        title="Age"
        value={data.age || '28'}
        visible={activePicker === 'age'}
      />
      <WheelPickerSheet
        onDismiss={() => setActivePicker(null)}
        onCommit={(height, heightUnit) =>
          setData({ height, heightUnit: heightUnit as 'ftin' | 'cm' })
        }
        options={data.heightUnit === 'ftin' ? heightFtInOptions : heightCmOptions}
        optionsByUnit={{
          cm: heightCmOptions,
          ftin: heightFtInOptions,
        }}
        title="Height"
        unitOptions={[
          { label: 'ft/in', value: 'ftin' },
          { label: 'cm', value: 'cm' },
        ]}
        unitValue={data.heightUnit}
        convertValue={(height, fromUnit, toUnit) =>
          toUnit === 'cm'
            ? inchesToCmLabel(heightLabelToInches(height))
            : inchesToFtInLabel(cmLabelToInches(height))
        }
        value={data.height || (data.heightUnit === 'ftin' ? `5'10"` : '178 cm')}
        visible={activePicker === 'height'}
      />
      <WheelPickerSheet
        onDismiss={() => setActivePicker(null)}
        onCommit={(weight, weightUnit) =>
          setData({ weight, weightUnit: weightUnit as 'lb' | 'kg' })
        }
        options={data.weightUnit === 'lb' ? weightLbOptions : weightKgOptions}
        optionsByUnit={{
          kg: weightKgOptions,
          lb: weightLbOptions,
        }}
        title="Weight"
        unitOptions={[
          { label: 'lb', value: 'lb' },
          { label: 'kg', value: 'kg' },
        ]}
        unitValue={data.weightUnit}
        convertValue={(weight, fromUnit, toUnit) =>
          toUnit === 'kg'
            ? lbToKgLabel(weightLabelToLb(weight))
            : kgToLbLabel(weightLabelToKg(weight))
        }
        value={data.weight || (data.weightUnit === 'lb' ? '180 lb' : '82 kg')}
        visible={activePicker === 'weight'}
      />
    </View>
  );
}

function TrainingStep({ data, error, setData }: StepProps) {
  const [activePicker, setActivePicker] = useState<
    'duration' | 'daysPerWeek' | null
  >(null);

  return (
    <View style={styles.stepInner}>
      <StepTitle
        eyebrow="Training"
        title="Set your rhythm."
        copy="A realistic schedule beats a perfect one."
      />
      <Text style={styles.inputLabel}>Experience</Text>
      <ChipGrid
        options={experienceLevels}
        selected={data.experience ? [data.experience] : []}
        onToggle={(selected) => setData({ experience: selected.at(-1) ?? '' })}
        single
        compact
      />
      <ProfileSelectorCard
        label="Minutes"
        value={data.workoutDuration || 'Select'}
        onPress={() => setActivePicker('duration')}
      />
      <ProfileSelectorCard
        label="Days/week"
        value={data.daysPerWeek || 'Select'}
        onPress={() => setActivePicker('daysPerWeek')}
      />
      <InlineError error={error} />

      <WheelPickerSheet
        onCommit={(workoutDuration) => setData({ workoutDuration })}
        onDismiss={() => setActivePicker(null)}
        options={durationOptions}
        title="Workout duration"
        value={data.workoutDuration || '45 min'}
        visible={activePicker === 'duration'}
      />
      <WheelPickerSheet
        onCommit={(daysPerWeek) => setData({ daysPerWeek })}
        onDismiss={() => setActivePicker(null)}
        options={daysPerWeekOptions}
        title="Days per week"
        value={data.daysPerWeek || '4 days/week'}
        visible={activePicker === 'daysPerWeek'}
      />
    </View>
  );
}

function EquipmentStep({ data, error, setData }: StepProps) {
  return (
    <View style={styles.stepInner}>
      <StepTitle
        eyebrow="Equipment"
        title="What can you train with?"
        copy="Select everything you can access most weeks."
      />
      <ChipGrid
        options={equipmentOptions}
        selected={data.equipment}
        onToggle={(equipment) => setData({ equipment })}
      />
      <InlineError error={error} />
    </View>
  );
}

function CompleteStep({
  successScale,
}: StepProps & { successScale?: Animated.AnimatedInterpolation<string | number> }) {
  return (
    <View style={[styles.stepInner, styles.completeInner]}>
      <Animated.View
        style={[
          styles.successOrb,
          {
            opacity: successScale,
            transform: [{ scale: successScale ?? 1 }],
          },
        ]}
      >
        <Text style={styles.successMark}>OK</Text>
      </Animated.View>
      <StepTitle
        eyebrow="Ready"
        title="Your training profile is set."
        copy="We have enough to shape the first version of your app experience."
      />
    </View>
  );
}

const stepComponents = [
  ProfileStep,
  TrainingStep,
  EquipmentStep,
  CompleteStep,
];

function StepTitle({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string;
  title: string;
  copy: string;
}) {
  return (
    <View style={styles.titleBlock}>
      <Text style={styles.kicker}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.copy}>{copy}</Text>
    </View>
  );
}

function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
  compact,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'number-pad' | 'decimal-pad';
  multiline?: boolean;
  compact?: boolean;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        keyboardType={keyboardType}
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#8E939F"
        style={[
          styles.input,
          compact && styles.compactInput,
          multiline && styles.multilineInput,
        ]}
        value={value}
      />
    </View>
  );
}

export function ProfileSelectorCard({
  label,
  value,
  meta,
  onPress,
}: {
  label: string;
  value: string;
  meta?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityHint={`Opens ${label} picker`}
      accessibilityRole="button"
      onPress={onPress}
      style={styles.profileSelectorCard}
    >
      <View>
        <Text style={styles.inputLabel}>{label}</Text>
        {meta ? <Text style={styles.selectorMeta}>{meta}</Text> : null}
      </View>
      <View style={styles.selectorValuePill}>
        <Text style={styles.selectorValue}>{value || 'Select'}</Text>
      </View>
    </Pressable>
  );
}

export function WheelPickerSheet({
  visible,
  title,
  value,
  options,
  unitOptions,
  unitValue,
  optionsByUnit,
  convertValue,
  onCommit,
  onDismiss,
}: {
  visible: boolean;
  title: string;
  value: string;
  options: string[];
  unitOptions?: { label: string; value: string }[];
  unitValue?: string;
  optionsByUnit?: Record<string, string[]>;
  convertValue?: (value: string, fromUnit: string, toUnit: string) => string;
  onCommit: (value: string, unit?: string) => void;
  onDismiss: () => void;
}) {
  const [selectedValue, setSelectedValue] = useState(value);
  const [selectedUnit, setSelectedUnit] = useState(unitValue);
  const [reduceMotion, setReduceMotion] = useState(false);
  const hasOpenedRef = useRef(false);
  const sheetY = useRef(new Animated.Value(360)).current;
  const dragY = useRef(new Animated.Value(0)).current;
  const activeOptions = selectedUnit && optionsByUnit
    ? optionsByUnit[selectedUnit]
    : options;
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_event, gesture) =>
          Math.abs(gesture.dy) > Math.abs(gesture.dx) &&
          gesture.dy > 18 &&
          Math.abs(gesture.vy) > 0.45,
        onPanResponderMove: (_event, gesture) => {
          dragY.setValue(Math.max(0, gesture.dy));
        },
        onPanResponderRelease: (_event, gesture) => {
          if (gesture.dy > 90 || gesture.vy > 1.1) {
            commitAndDismiss();
            return;
          }

          Animated.spring(dragY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        },
      }),
    [dragY, selectedValue, selectedUnit],
  );

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  useEffect(() => {
    if (!visible || hasOpenedRef.current) {
      if (!visible) {
        hasOpenedRef.current = false;
      }

      return;
    }

    hasOpenedRef.current = true;
    const nextUnit = unitValue;
    const nextOptions = nextUnit && optionsByUnit ? optionsByUnit[nextUnit] : options;
    const nextValue = nextOptions.includes(value) ? value : nextOptions[0];
    setSelectedValue(nextValue);
    setSelectedUnit(nextUnit);
    dragY.setValue(0);

    if (reduceMotion) {
      sheetY.setValue(0);
      return;
    }

    sheetY.setValue(360);
    Animated.spring(sheetY, {
      damping: 24,
      stiffness: 220,
      toValue: 0,
      useNativeDriver: true,
    }).start();
  }, [dragY, options, optionsByUnit, reduceMotion, sheetY, unitValue, value, visible]);

  function handleSelect(nextValue: string) {
    setSelectedValue(nextValue);
  }

  function handleUnitSelect(nextUnit: string) {
    if (!selectedUnit || !convertValue || nextUnit === selectedUnit) {
      setSelectedUnit(nextUnit);
      return;
    }

    const nextOptions = optionsByUnit?.[nextUnit] ?? options;
    const convertedValue = convertValue(selectedValue, selectedUnit, nextUnit);
    const nextValue = nextOptions.includes(convertedValue)
      ? convertedValue
      : nextOptions[0];

    setSelectedUnit(nextUnit);
    setSelectedValue(nextValue);
  }

  function commitAndDismiss() {
    onCommit(selectedValue, selectedUnit);
    onDismiss();
  }

  return (
    <Modal
      animationType="fade"
      onRequestClose={commitAndDismiss}
      transparent
      visible={visible}
    >
      <View style={styles.modalRoot}>
        <Pressable
          accessibilityLabel="Dismiss picker"
          onPress={commitAndDismiss}
          style={styles.modalScrim}
        />
        <Animated.View
          style={[
            styles.pickerSheet,
            {
              transform: [
                {
                  translateY: Animated.add(sheetY, dragY),
                },
              ],
            },
          ]}
        >
          <View style={styles.sheetDragArea} {...panResponder.panHandlers}>
            <View style={styles.sheetHandle} />
          </View>
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.kicker}>Select</Text>
              <Text style={styles.sheetTitle}>{title}</Text>
            </View>
          </View>
          {unitOptions && selectedUnit ? (
            <UnitToggle
              onSelect={handleUnitSelect}
              options={unitOptions}
              selected={selectedUnit}
            />
          ) : null}
          <WheelColumn
            onSelect={handleSelect}
            options={activeOptions}
            value={selectedValue}
          />
        </Animated.View>
      </View>
    </Modal>
  );
}

function WheelColumn({
  options,
  value,
  onSelect,
}: {
  options: string[];
  value: string;
  onSelect: (value: string) => void;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const lastIndexRef = useRef(-1);
  const itemHeight = 62;
  const visibleWheelHeight = 326;
  const pickerPadding = (visibleWheelHeight - itemHeight) / 2;
  const selectedIndex = Math.max(0, options.indexOf(value));

  useEffect(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        animated: false,
        y: selectedIndex * itemHeight,
      });
    });
    lastIndexRef.current = selectedIndex;
  }, [selectedIndex]);

  function selectFromOffset(offsetY: number) {
    const index = Math.min(
      options.length - 1,
      Math.max(0, Math.round(offsetY / itemHeight)),
    );

    if (index === lastIndexRef.current) {
      return;
    }

    lastIndexRef.current = index;
    onSelect(options[index]);
    Haptics.selectionAsync().catch(() => undefined);
  }

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    selectFromOffset(event.nativeEvent.contentOffset.y);
  }

  return (
    <View style={styles.wheelShell}>
      <View pointerEvents="none" style={styles.wheelSelectionBar} />
      <ScrollView
        contentContainerStyle={{ paddingVertical: pickerPadding }}
        decelerationRate="fast"
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        onScrollEndDrag={handleScroll}
        onMomentumScrollEnd={handleScroll}
        ref={scrollRef}
        scrollEventThrottle={32}
        showsVerticalScrollIndicator={false}
        snapToAlignment="start"
        snapToInterval={itemHeight}
      >
        {options.map((option) => {
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: option === value }}
              key={option}
              onPress={() => onSelect(option)}
              style={[styles.wheelRow, { height: itemHeight }]}
            >
              <Text style={styles.wheelRowText}>
                {option}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <LinearGradient
        colors={['rgba(18, 20, 28, 0.96)', 'rgba(18, 20, 28, 0.48)', 'rgba(18, 20, 28, 0)']}
        pointerEvents="none"
        style={styles.topWheelFade}
      />
      <LinearGradient
        colors={['rgba(18, 20, 28, 0)', 'rgba(18, 20, 28, 0.48)', 'rgba(18, 20, 28, 0.96)']}
        pointerEvents="none"
        style={styles.bottomWheelFade}
      />
    </View>
  );
}

export function UnitToggle<TValue extends string>({
  options,
  selected,
  onSelect,
}: {
  options: { label: string; value: TValue }[];
  selected: TValue;
  onSelect: (value: TValue) => void;
}) {
  return (
    <View style={styles.unitToggle}>
      {options.map((option) => {
        const isSelected = option.value === selected;

        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            key={option.value}
            onPress={() => onSelect(option.value)}
            style={[styles.unitOption, isSelected && styles.selectedUnitOption]}
          >
            <Text
              style={[
                styles.unitOptionText,
                isSelected && styles.selectedUnitOptionText,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function ChipGrid({
  options,
  selected,
  onToggle,
  single = false,
  compact = false,
}: {
  options: string[];
  selected: string[];
  onToggle: (selected: string[]) => void;
  single?: boolean;
  compact?: boolean;
}) {
  function toggle(option: string) {
    if (single) {
      onToggle(selected.includes(option) ? [] : [option]);
      return;
    }

    onToggle(
      selected.includes(option)
        ? selected.filter((item) => item !== option)
        : [...selected, option],
    );
  }

  return (
    <View style={[styles.chipGrid, compact && styles.compactChipGrid]}>
      {options.map((option) => {
        const isSelected = selected.includes(option);

        return (
          <Pressable
            accessibilityRole={single ? 'radio' : 'checkbox'}
            accessibilityState={{ checked: isSelected }}
            key={option}
            onPress={() => toggle(option)}
            style={[
              styles.chip,
              compact && styles.compactChip,
              isSelected && styles.selectedChip,
            ]}
          >
            <Text
              style={[
                styles.chipText,
                compact && styles.compactChipText,
                isSelected && styles.selectedChipText,
              ]}
            >
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function InlineError({ error }: { error: string }) {
  if (!error) {
    return null;
  }

  return (
    <View accessibilityLiveRegion="polite" style={styles.errorBox}>
      <Text style={styles.errorText}>{error}</Text>
    </View>
  );
}

function validateStep(step: number, data: OnboardingData) {
  if (step === 0) {
    if (!data.displayName.trim()) {
      return 'Display name is required.';
    }

    if (!data.age.trim() || !data.height.trim() || !data.weight.trim()) {
      return 'Age, height, and weight are required.';
    }
  }

  if (step === 1) {
    if (!data.experience) {
      return 'Choose your training experience.';
    }

    if (!data.workoutDuration.trim() || !data.daysPerWeek.trim()) {
      return 'Workout duration and days per week are required.';
    }
  }

  if (step === 2 && data.equipment.length === 0) {
    return 'Select at least one equipment option.';
  }

  return '';
}

export function createNumberOptions(
  start: number,
  end: number,
  suffix = '',
  increment = 1,
) {
  const options = [];

  for (let value = start; value <= end; value += increment) {
    options.push(`${value}${suffix}`);
  }

  return options;
}

function createDayOptions() {
  return Array.from({ length: 7 }, (_item, index) => {
    const days = index + 1;
    return `${days} ${days === 1 ? 'day' : 'days'}/week`;
  });
}

export function createHeightOptions(startInches: number, endInches: number) {
  const options = [];

  for (let inches = startInches; inches <= endInches; inches += 1) {
    const feet = Math.floor(inches / 12);
    const remainingInches = inches % 12;
    options.push(`${feet}'${remainingInches}"`);
  }

  return options;
}

export function heightLabelToInches(height: string) {
  const match = height.match(/(\d+)'(\d+)"/);

  if (!match) {
    return 70;
  }

  return Number(match[1]) * 12 + Number(match[2]);
}

export function cmLabelToInches(height: string) {
  const cm = Number(height.replace(/[^\d.]/g, '')) || 178;
  return Math.round(cm / 2.54);
}

export function inchesToFtInLabel(inches: number) {
  const boundedInches = Math.min(90, Math.max(48, Math.round(inches)));
  const feet = Math.floor(boundedInches / 12);
  const remainingInches = boundedInches % 12;

  return `${feet}'${remainingInches}"`;
}

export function inchesToCmLabel(inches: number) {
  const cm = Math.min(229, Math.max(122, Math.round(inches * 2.54)));
  return `${cm} cm`;
}

export function weightLabelToLb(weight: string) {
  return Number(weight.replace(/[^\d.]/g, '')) || 180;
}

export function weightLabelToKg(weight: string) {
  return Number(weight.replace(/[^\d.]/g, '')) || 82;
}

export function lbToKgLabel(lb: number) {
  const kg = Math.min(204, Math.max(32, Math.round(lb / 2.20462)));
  return `${kg} kg`;
}

export function kgToLbLabel(kg: number) {
  const lb = Math.min(450, Math.max(70, Math.round(kg * 2.20462)));
  return `${lb} lb`;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#07080C',
  },
  keyboardView: {
    flex: 1,
  },
  loadingShell: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    flexGrow: 1,
    gap: 22,
    justifyContent: 'center',
    padding: 22,
    paddingBottom: 34,
    paddingTop: 28,
  },
  progressHeader: {
    gap: 12,
  },
  progressMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  kicker: {
    color: '#8F95A3',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  progressText: {
    color: '#C7CCD6',
    fontSize: 13,
    fontWeight: '800',
  },
  progressTrack: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 999,
    borderWidth: 1,
    height: 12,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: '#E8FF1A',
    borderRadius: 999,
    height: '100%',
  },
  stepCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 30,
    borderWidth: 1,
    padding: 18,
  },
  stepInner: {
    gap: 18,
  },
  completeInner: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  titleBlock: {
    gap: 8,
  },
  title: {
    color: '#F7F8FB',
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 34,
  },
  copy: {
    color: '#8F95A3',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  fieldGroup: {
    flex: 1,
    gap: 10,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputLabel: {
    color: '#F2F4F8',
    fontSize: 15,
    fontWeight: '800',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 999,
    borderWidth: 1,
    color: '#F7F8FB',
    fontSize: 16,
    minHeight: 50,
    paddingHorizontal: 18,
  },
  compactInput: {
    minHeight: 48,
  },
  profileSelectorCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 52,
    paddingLeft: 18,
    paddingRight: 8,
  },
  selectorMeta: {
    color: '#8E939F',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  selectorValue: {
    color: '#F7F8FB',
    fontSize: 16,
    fontWeight: '900',
  },
  selectorValuePill: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.11)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 38,
    minWidth: 92,
    paddingHorizontal: 14,
  },
  multilineInput: {
    borderRadius: 24,
    minHeight: 104,
    paddingTop: 16,
    textAlignVertical: 'top',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  compactChipGrid: {
    flexWrap: 'nowrap',
    gap: 6,
  },
  chip: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 48,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  compactChip: {
    flex: 1,
    minHeight: 42,
    paddingHorizontal: 8,
  },
  selectedChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.28)',
  },
  chipText: {
    color: '#C7CCD6',
    fontSize: 14,
    fontWeight: '800',
  },
  compactChipText: {
    fontSize: 12,
    textAlign: 'center',
  },
  selectedChipText: {
    color: '#FFFFFF',
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.54)',
  },
  pickerSheet: {
    backgroundColor: 'rgba(18, 20, 28, 0.98)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    gap: 18,
    padding: 20,
    paddingBottom: 28,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -18 },
    shadowOpacity: 0.28,
    shadowRadius: 34,
  },
  sheetDragArea: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 28,
    width: '100%',
  },
  sheetHandle: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: 999,
    height: 5,
    width: 44,
  },
  sheetHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sheetTitle: {
    color: '#F7F8FB',
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 32,
  },
  unitToggle: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    padding: 5,
  },
  unitOption: {
    alignItems: 'center',
    borderRadius: 999,
    flex: 1,
    justifyContent: 'center',
    minHeight: 42,
  },
  selectedUnitOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  unitOptionText: {
    color: '#B9BFCA',
    fontSize: 14,
    fontWeight: '900',
  },
  selectedUnitOptionText: {
    color: '#FFFFFF',
  },
  wheelShell: {
    height: 326,
    justifyContent: 'center',
    marginHorizontal: -8,
  },
  wheelSelectionBar: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 999,
    borderWidth: 1,
    height: 58,
    left: 26,
    position: 'absolute',
    right: 26,
    top: 134,
    zIndex: 1,
  },
  wheelRow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelRowText: {
    color: '#F7F8FB',
    fontSize: 30,
    fontWeight: '800',
  },
  topWheelFade: {
    height: 118,
    left: -8,
    position: 'absolute',
    right: -8,
    top: 0,
  },
  bottomWheelFade: {
    bottom: 0,
    height: 118,
    left: -8,
    position: 'absolute',
    right: -8,
  },
  toggleRow: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 56,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  errorBox: {
    backgroundColor: 'rgba(255, 92, 92, 0.14)',
    borderColor: 'rgba(255, 139, 139, 0.32)',
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
  },
  errorText: {
    color: '#FFB7B7',
    fontSize: 14,
    fontWeight: '800',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#E8FF1A',
    borderRadius: 999,
    flex: 1,
    justifyContent: 'center',
    minHeight: 58,
  },
  singleActionButton: {
    flex: 1,
  },
  primaryButtonText: {
    color: '#050608',
    fontSize: 16,
    fontWeight: '900',
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    flex: 0,
    justifyContent: 'center',
    minHeight: 58,
    width: 54,
  },
  backButtonText: {
    color: 'rgba(247, 248, 251, 0.68)',
    fontSize: 48,
    fontWeight: '200',
    lineHeight: 52,
  },
  successOrb: {
    alignItems: 'center',
    backgroundColor: '#E8FF1A',
    borderRadius: 999,
    height: 104,
    justifyContent: 'center',
    shadowColor: '#E8FF1A',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.32,
    shadowRadius: 26,
    width: 104,
  },
  successMark: {
    color: '#050608',
    fontSize: 22,
    fontWeight: '900',
  },
});
