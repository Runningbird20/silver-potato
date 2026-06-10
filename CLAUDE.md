# Workout App

A custom fitness tracking app built with Expo Router and React Native (TypeScript).

## Tech Stack

- **Expo** ~56 with **Expo Router** ~56.2 (file-based navigation)
- **React Native** 0.85 / **React** 19 / **TypeScript** ~6
- **AsyncStorage** — local persistence (hook-abstracted, Supabase-ready)
- **Supabase** — client configured in `utils/supabase.ts`, env vars in `.env.local`
- **Ionicons** via `@expo/vector-icons` for tab icons

## Development Commands

```bash
npm start          # Start Expo dev server (scan QR with Expo Go)
npm run ios        # Open in iOS Simulator
npm run android    # Open in Android Emulator
```

## Project Structure

```
app/
  _layout.tsx              # Root layout (StatusBar, Stack)
  (tabs)/
    _layout.tsx            # Tab navigator (Today, Progress, Nutrition, Body)
    index.tsx              # Today — log exercises, sets, weight/reps
    progress.tsx           # Progress — personal records
    nutrition.tsx          # Nutrition — meals + macro totals
    body.tsx               # Body — weight log + measurements

src/
  types/index.ts           # All shared TS interfaces
  theme.ts                 # Color tokens (no hardcoded colors in components)
  hooks/
    useAsyncStorage.ts     # Generic <T> AsyncStorage hook
    useWorkout.ts          # Today's session: addExercise, addSet, completeSet, volume
    useProgress.ts         # PRs: addPR, removePR
    useNutrition.ts        # Meals: addMeal, addFoodItem, removeMeal, dailyTotals
    useBody.ts             # Body log: logWeight, removeEntry, latestEntry
  components/
    ExerciseCard.tsx       # Exercise + set list + add-set button
    SetRow.tsx             # Weight/reps inputs + complete toggle
    MealCard.tsx           # Meal + food rows + inline add-food form
    PRRow.tsx              # Single PR row with remove
    BodyLogEntry.tsx       # Single body log entry with measurements

utils/
  supabase.ts              # Supabase client (AsyncStorage session persistence)
```

## Key Conventions

- Components never touch AsyncStorage — only hooks do
- Hook interfaces (`addExercise`, `logMeal`, `logWeight`) are stable; swap internals for Supabase by changing the hook, not the screen
- All colors come from `src/theme.ts` — never hardcode hex values in components
- Style with `StyleSheet.create` only — no inline style objects
- All number inputs use `keyboardType="numeric"`
- Screens use `KeyboardAvoidingView` + `ScrollView` so inputs stay visible
- Read versioned docs before using Expo SDK APIs: https://docs.expo.dev/versions/v56.0.0/
