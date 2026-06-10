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

# Silver Potato — style guide

## Theme
Dark, minimal, serious. No decorative elements. Every visual choice
earns its place by communicating information.

## Color tokens (define in src/theme.ts)
background:     #0F0F10   — page background
surface:        #1A1A1C   — cards, inputs
surface2:       #222225   — inset elements, empty inputs
border:         #2A2A2E   — all borders
silver:         #C0C0C8   — primary accent (active states, icons, PRs)
silverDim:      #7A7A85   — secondary accent (tags, hints)
silverBright:   #E8E8F0   — key numbers, filled values
text:           #F0F0F2   — primary text
textSecondary:  #8A8A95   — labels, metadata
textTertiary:   #55555E   — column headers, placeholders
success:        #4CAF7D   — completed sets, positive deltas
danger:         #E05C5C   — negative deltas, errors

## Typography
Font: System default (San Francisco on iOS)
Page titles: 22px, weight 600, letterSpacing -0.3
Section labels: 10px, weight 500, uppercase, letterSpacing 0.8, textTertiary
Body: 13–14px, weight 400
Numbers/stats: font variant tabular-nums always
Metric values: 20px, weight 600, silverBright

## Spacing
Base unit: 8px
Screen padding: 16px horizontal
Card padding: 12px
Gap between cards: 8px
Gap between set rows: 4px
Section label margin-bottom: 8px

## Borders & radius
All borders: 1px solid border-color (not 0.5px — React Native uses density-independent pixels)
Card radius: 8px
Input/small element radius: 5px
Badge/tag radius: 3px
Never use border-radius > 8px except for the bottom tab bar pill (if added later)

## Cards
Background: surface
Border: 1px solid border
All cards are flat — no shadows, no elevation

## Inputs (set rows)
Background: surface2
Border: 1px solid border
When filled: border-color silverDim, text silverBright
Placeholder text: textTertiary
keyboardType: numeric always for weight/reps/measurements

## Buttons
Primary action: silverBright text, surface2 background, border silver
Add/create (dashed): textTertiary, border dashed border-color, full width, centered
Destructive: danger color

## Completed state (set checkmark)
Background: silver
Border: silver
Checkmark color: background (#0F0F10)
Incomplete: border only, no fill

## Tab bar
Background: background color
Top border: 1px solid border
Active tab: silver color
Inactive tab: textTertiary
Label: 9px uppercase

## Section labels
All caps, 10px, letterSpacing 0.8, textTertiary
Always 8px margin below, 14px margin above

## Data display rules
- Tabular nums on all numeric values always
- Weight deltas: green (success) for positive, red (danger) for negative
- Never use color for decoration — only for state (done/active/error)
- PRs marked with a 6px silver dot, not a badge
