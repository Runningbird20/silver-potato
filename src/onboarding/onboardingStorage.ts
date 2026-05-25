import AsyncStorage from '@react-native-async-storage/async-storage';

export type OnboardingData = {
  displayName: string;
  age: string;
  height: string;
  heightUnit: 'ftin' | 'cm';
  weight: string;
  weightUnit: 'lb' | 'kg';
  goals: string[];
  experience: string;
  workoutDuration: string;
  daysPerWeek: string;
  equipment: string[];
  sports: string;
  restrictions: string;
  wearableInterest: boolean;
};

export type OnboardingProgress = {
  currentStep: number;
  completed: boolean;
  data: OnboardingData;
};

export const emptyOnboardingData: OnboardingData = {
  displayName: '',
  age: '',
  height: '',
  heightUnit: 'ftin',
  weight: '',
  weightUnit: 'lb',
  goals: [],
  experience: '',
  workoutDuration: '',
  daysPerWeek: '',
  equipment: [],
  sports: '',
  restrictions: '',
  wearableInterest: false,
};

function getOnboardingKey(userId: string) {
  return `silver-potato.onboarding.${userId}`;
}

export async function getOnboardingProgress(userId: string) {
  const stored = await AsyncStorage.getItem(getOnboardingKey(userId));

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as OnboardingProgress;
  } catch {
    await AsyncStorage.removeItem(getOnboardingKey(userId));
    return null;
  }
}

export async function saveOnboardingProgress(
  userId: string,
  progress: OnboardingProgress,
) {
  await AsyncStorage.setItem(getOnboardingKey(userId), JSON.stringify(progress));
}

export async function completeOnboarding(userId: string, data: OnboardingData) {
  await saveOnboardingProgress(userId, {
    completed: true,
    currentStep: 3,
    data,
  });
}
