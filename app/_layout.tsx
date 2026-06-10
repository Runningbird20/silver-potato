import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActiveWorkoutProvider } from '../src/context/WorkoutContext';
import { theme } from '../src/theme';

export default function RootLayout() {
  return (
    <ActiveWorkoutProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: theme.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="active-workout"
          options={{ headerShown: false, presentation: 'fullScreenModal' }}
        />
        <Stack.Screen
          name="workout-summary"
          options={{ headerShown: false, presentation: 'fullScreenModal' }}
        />
        <Stack.Screen
          name="workout"
          options={{ title: "Today's Workout", headerBackTitle: 'Schedule' }}
        />
      </Stack>
    </ActiveWorkoutProvider>
  );
}
