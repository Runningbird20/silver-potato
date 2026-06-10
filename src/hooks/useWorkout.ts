import { useCallback, useEffect, useMemo } from 'react';
import { useAsyncStorage } from './useAsyncStorage';
import { WorkoutSession, Exercise, ExerciseSet } from '../types';

const todayDate = () => new Date().toISOString().split('T')[0];
const uid = () => Math.random().toString(36).slice(2, 9);

const dateOffset = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const planned = (name: string): ExerciseSet[] => [
  { id: uid(), weight: 0, reps: 0, completed: false },
  { id: uid(), weight: 0, reps: 0, completed: false },
  { id: uid(), weight: 0, reps: 0, completed: false },
];

const FUTURE_SESSIONS: WorkoutSession[] = [
  {
    id: uid(),
    date: dateOffset(1),
    name: 'Pull Day',
    exercises: [
      { id: uid(), name: 'Deadlift', sets: planned('Deadlift') },
      { id: uid(), name: 'Barbell Row', sets: planned('Barbell Row') },
      { id: uid(), name: 'Pull-ups', sets: planned('Pull-ups') },
      { id: uid(), name: 'Face Pulls', sets: planned('Face Pulls') },
      { id: uid(), name: 'Bicep Curls', sets: planned('Bicep Curls') },
    ],
  },
  {
    id: uid(),
    date: dateOffset(2),
    name: 'Leg Day',
    exercises: [
      { id: uid(), name: 'Squat', sets: planned('Squat') },
      { id: uid(), name: 'Romanian Deadlift', sets: planned('Romanian Deadlift') },
      { id: uid(), name: 'Leg Press', sets: planned('Leg Press') },
      { id: uid(), name: 'Leg Curl', sets: planned('Leg Curl') },
      { id: uid(), name: 'Calf Raises', sets: planned('Calf Raises') },
    ],
  },
  // dateOffset(3) = rest day, intentionally omitted
  {
    id: uid(),
    date: dateOffset(4),
    name: 'Push Day',
    exercises: [
      { id: uid(), name: 'Incline Bench Press', sets: planned('Incline Bench Press') },
      { id: uid(), name: 'Overhead Press', sets: planned('Overhead Press') },
      { id: uid(), name: 'Cable Fly', sets: planned('Cable Fly') },
      { id: uid(), name: 'Lateral Raises', sets: planned('Lateral Raises') },
      { id: uid(), name: 'Tricep Pushdowns', sets: planned('Tricep Pushdowns') },
    ],
  },
  {
    id: uid(),
    date: dateOffset(5),
    name: 'Pull Day',
    exercises: [
      { id: uid(), name: 'Rack Pulls', sets: planned('Rack Pulls') },
      { id: uid(), name: 'Seated Cable Row', sets: planned('Seated Cable Row') },
      { id: uid(), name: 'Lat Pulldown', sets: planned('Lat Pulldown') },
      { id: uid(), name: 'Hammer Curls', sets: planned('Hammer Curls') },
    ],
  },
  {
    id: uid(),
    date: dateOffset(6),
    name: 'Leg Day',
    exercises: [
      { id: uid(), name: 'Front Squat', sets: planned('Front Squat') },
      { id: uid(), name: 'Walking Lunges', sets: planned('Walking Lunges') },
      { id: uid(), name: 'Hack Squat', sets: planned('Hack Squat') },
      { id: uid(), name: 'Leg Extension', sets: planned('Leg Extension') },
      { id: uid(), name: 'Standing Calf Raises', sets: planned('Standing Calf Raises') },
    ],
  },
];

const SEED: WorkoutSession[] = [
  {
    id: uid(),
    date: todayDate(),
    name: 'Push Day',
    exercises: [
      {
        id: uid(),
        name: 'Bench Press',
        sets: [
          { id: uid(), weight: 135, reps: 10, completed: true },
          { id: uid(), weight: 155, reps: 8, completed: true },
          { id: uid(), weight: 175, reps: 6, completed: false },
        ],
      },
      {
        id: uid(),
        name: 'Overhead Press',
        sets: [
          { id: uid(), weight: 95, reps: 8, completed: true },
          { id: uid(), weight: 105, reps: 6, completed: false },
          { id: uid(), weight: 105, reps: 6, completed: false },
        ],
      },
      {
        id: uid(),
        name: 'Tricep Pushdowns',
        sets: [
          { id: uid(), weight: 50, reps: 12, completed: false },
          { id: uid(), weight: 50, reps: 12, completed: false },
        ],
      },
    ],
  },
  ...FUTURE_SESSIONS,
];

export function useWorkout() {
  const [sessions, setSessions, loading] = useAsyncStorage<WorkoutSession[]>(
    '@workout_sessions',
    SEED
  );

  // After hydration, fill in future sessions if the stored data predates them
  useEffect(() => {
    if (loading) return;
    const storedFutureDates = new Set(
      sessions.filter((s) => s.date > todayDate()).map((s) => s.date)
    );
    const missing = FUTURE_SESSIONS.filter(
      (s) => !storedFutureDates.has(s.date)
    );
    if (missing.length > 0) {
      setSessions([...sessions, ...missing]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const todaySession = useMemo<WorkoutSession>(() => {
    const found = sessions.find((s) => s.date === todayDate());
    if (found) return found;
    return { id: uid(), date: todayDate(), exercises: [] };
  }, [sessions]);

  const upcomingSessions = useMemo(
    () =>
      sessions
        .filter((s) => s.date > todayDate())
        .sort((a, b) => a.date.localeCompare(b.date)),
    [sessions]
  );

  const updateSession = useCallback(
    (updated: WorkoutSession) => {
      const rest = sessions.filter(
        (s) => s.id !== updated.id && s.date !== updated.date
      );
      setSessions([...rest, updated]);
    },
    [sessions, setSessions]
  );

  const addExercise = useCallback(
    (name: string) => {
      const exercise: Exercise = { id: uid(), name, sets: [] };
      updateSession({
        ...todaySession,
        exercises: [...todaySession.exercises, exercise],
      });
    },
    [todaySession, updateSession]
  );

  const addSet = useCallback(
    (exerciseId: string) => {
      const set: ExerciseSet = { id: uid(), weight: 0, reps: 0, completed: false };
      updateSession({
        ...todaySession,
        exercises: todaySession.exercises.map((e) =>
          e.id === exerciseId ? { ...e, sets: [...e.sets, set] } : e
        ),
      });
    },
    [todaySession, updateSession]
  );

  const updateSet = useCallback(
    (exerciseId: string, setId: string, patch: Partial<ExerciseSet>) => {
      updateSession({
        ...todaySession,
        exercises: todaySession.exercises.map((e) =>
          e.id === exerciseId
            ? {
                ...e,
                sets: e.sets.map((s) =>
                  s.id === setId ? { ...s, ...patch } : s
                ),
              }
            : e
        ),
      });
    },
    [todaySession, updateSession]
  );

  const completeSet = useCallback(
    (exerciseId: string, setId: string) =>
      updateSet(exerciseId, setId, { completed: true }),
    [updateSet]
  );

  const volume = useCallback(
    (exerciseId: string) => {
      const ex = todaySession.exercises.find((e) => e.id === exerciseId);
      return ex ? ex.sets.reduce((sum, s) => sum + s.weight * s.reps, 0) : 0;
    },
    [todaySession]
  );

  return {
    session: todaySession,
    upcomingSessions,
    allSessions: sessions,
    loading,
    addExercise,
    addSet,
    updateSet,
    completeSet,
    volume,
  };
}
