import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutSession, Exercise, ExerciseSet, Routine } from '../types';

// ─── Seed data ────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 9);

const ROUTINES: Routine[] = [
  {
    id: uid(),
    name: 'Push Day',
    exercises: [
      { name: 'Bench Press', plannedSets: 4 },
      { name: 'Overhead Press', plannedSets: 3 },
      { name: 'Incline DB Press', plannedSets: 3 },
      { name: 'Lateral Raises', plannedSets: 4 },
      { name: 'Tricep Pushdowns', plannedSets: 3 },
    ],
  },
  {
    id: uid(),
    name: 'Pull Day',
    exercises: [
      { name: 'Deadlift', plannedSets: 3 },
      { name: 'Barbell Row', plannedSets: 4 },
      { name: 'Pull-ups', plannedSets: 3 },
      { name: 'Face Pulls', plannedSets: 3 },
      { name: 'Bicep Curls', plannedSets: 3 },
    ],
  },
  {
    id: uid(),
    name: 'Leg Day',
    exercises: [
      { name: 'Squat', plannedSets: 4 },
      { name: 'Romanian Deadlift', plannedSets: 3 },
      { name: 'Leg Press', plannedSets: 4 },
      { name: 'Leg Curl', plannedSets: 3 },
      { name: 'Calf Raises', plannedSets: 4 },
    ],
  },
  {
    id: uid(),
    name: 'Upper Body',
    exercises: [
      { name: 'Bench Press', plannedSets: 3 },
      { name: 'Barbell Row', plannedSets: 3 },
      { name: 'Overhead Press', plannedSets: 3 },
      { name: 'Pull-ups', plannedSets: 3 },
      { name: 'Bicep Curls', plannedSets: 2 },
      { name: 'Tricep Pushdowns', plannedSets: 2 },
    ],
  },
];

// ─── Context types ────────────────────────────────────────────────────────────

interface ActiveWorkoutContextValue {
  routines: Routine[];

  activeSession: WorkoutSession | null;
  startTime: number | null;
  isActive: boolean;

  completedSession: WorkoutSession | null;

  pastSessions: WorkoutSession[];

  startWorkout: (routine: Routine | null) => void;
  finishWorkout: () => WorkoutSession | null;
  cancelWorkout: () => void;

  updateSet: (exerciseId: string, setId: string, patch: Partial<ExerciseSet>) => void;
  completeSet: (exerciseId: string, setId: string) => void;
  addSet: (exerciseId: string) => void;
  addExercise: (name: string) => void;
  updateExerciseNotes: (exerciseId: string, notes: string) => void;

  getPreviousSet: (
    exerciseName: string,
    setIndex: number
  ) => { weight: number; reps: number } | null;
}

const ActiveWorkoutContext = createContext<ActiveWorkoutContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ActiveWorkoutProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [pastSessions, setPastSessions] = useState<WorkoutSession[]>([]);
  const [completedSession, setCompletedSession] = useState<WorkoutSession | null>(null);

  // Hydrate from storage on mount
  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem('@workout_sessions'),
      AsyncStorage.getItem('@active_session'),
      AsyncStorage.getItem('@workout_start_time'),
    ]).then(([sessions, active, start]) => {
      if (sessions) setPastSessions(JSON.parse(sessions));
      if (active) setActiveSession(JSON.parse(active));
      if (start) setStartTime(parseInt(start, 10));
    });
  }, []);

  // Persist active session whenever it changes
  useEffect(() => {
    if (activeSession) {
      AsyncStorage.setItem('@active_session', JSON.stringify(activeSession));
    } else {
      AsyncStorage.removeItem('@active_session');
    }
  }, [activeSession]);

  const isActive = activeSession !== null;

  // ── Mutations ──────────────────────────────────────────────────────────────

  const startWorkout = useCallback((routine: Routine | null) => {
    const now = Date.now();
    const exercises: Exercise[] = routine
      ? routine.exercises.map((re) => ({
          id: uid(),
          name: re.name,
          sets: Array.from({ length: re.plannedSets }, () => ({
            id: uid(),
            weight: 0,
            reps: 0,
            completed: false,
          })),
        }))
      : [];

    const session: WorkoutSession = {
      id: uid(),
      date: new Date().toISOString().split('T')[0],
      name: routine?.name,
      exercises,
      startTime: now,
    };

    setActiveSession(session);
    setStartTime(now);
    AsyncStorage.setItem('@workout_start_time', String(now));
  }, []);

  const updateSession = useCallback(
    (updater: (s: WorkoutSession) => WorkoutSession) => {
      setActiveSession((prev) => {
        if (!prev) return prev;
        return updater(prev);
      });
    },
    []
  );

  const updateSet = useCallback(
    (exerciseId: string, setId: string, patch: Partial<ExerciseSet>) => {
      updateSession((s) => ({
        ...s,
        exercises: s.exercises.map((e) =>
          e.id === exerciseId
            ? {
                ...e,
                sets: e.sets.map((set) =>
                  set.id === setId ? { ...set, ...patch } : set
                ),
              }
            : e
        ),
      }));
    },
    [updateSession]
  );

  const completeSet = useCallback(
    (exerciseId: string, setId: string) =>
      updateSet(exerciseId, setId, { completed: true }),
    [updateSet]
  );

  const addSet = useCallback(
    (exerciseId: string) => {
      updateSession((s) => ({
        ...s,
        exercises: s.exercises.map((e) =>
          e.id === exerciseId
            ? {
                ...e,
                sets: [
                  ...e.sets,
                  { id: uid(), weight: 0, reps: 0, completed: false },
                ],
              }
            : e
        ),
      }));
    },
    [updateSession]
  );

  const addExercise = useCallback(
    (name: string) => {
      updateSession((s) => ({
        ...s,
        exercises: [
          ...s.exercises,
          {
            id: uid(),
            name,
            sets: [{ id: uid(), weight: 0, reps: 0, completed: false }],
          },
        ],
      }));
    },
    [updateSession]
  );

  const updateExerciseNotes = useCallback(
    (exerciseId: string, notes: string) => {
      updateSession((s) => ({
        ...s,
        exercises: s.exercises.map((e) =>
          e.id === exerciseId ? { ...e, notes } : e
        ),
      }));
    },
    [updateSession]
  );

  const finishWorkout = useCallback((): WorkoutSession | null => {
    if (!activeSession) return null;
    const now = Date.now();
    const finished: WorkoutSession = { ...activeSession, endTime: now };

    // Save to history
    AsyncStorage.getItem('@workout_sessions').then((stored) => {
      const existing: WorkoutSession[] = stored ? JSON.parse(stored) : [];
      const rest = existing.filter((s) => s.date !== finished.date);
      AsyncStorage.setItem('@workout_sessions', JSON.stringify([...rest, finished]));
    });

    setPastSessions((prev) => {
      const rest = prev.filter((s) => s.date !== finished.date);
      return [...rest, finished];
    });

    setCompletedSession(finished);
    setActiveSession(null);
    setStartTime(null);
    AsyncStorage.removeItem('@workout_start_time');

    return finished;
  }, [activeSession]);

  const cancelWorkout = useCallback(() => {
    setActiveSession(null);
    setStartTime(null);
    AsyncStorage.multiRemove(['@active_session', '@workout_start_time']);
  }, []);

  // ── History lookup for PREVIOUS column ────────────────────────────────────

  const getPreviousSet = useCallback(
    (exerciseName: string, setIndex: number) => {
      const withEx = pastSessions
        .filter((s) => s.exercises.some((e) => e.name === exerciseName))
        .sort((a, b) => b.date.localeCompare(a.date));

      if (!withEx.length) return null;

      const exercise = withEx[0].exercises.find((e) => e.name === exerciseName);
      const set = exercise?.sets[setIndex];
      if (!set || (set.weight === 0 && set.reps === 0)) return null;

      return { weight: set.weight, reps: set.reps };
    },
    [pastSessions]
  );

  return (
    <ActiveWorkoutContext.Provider
      value={{
        routines: ROUTINES,
        activeSession,
        startTime,
        isActive,
        completedSession,
        pastSessions,
        startWorkout,
        finishWorkout,
        cancelWorkout,
        updateSet,
        completeSet,
        addSet,
        addExercise,
        updateExerciseNotes,
        getPreviousSet,
      }}
    >
      {children}
    </ActiveWorkoutContext.Provider>
  );
}

export function useActiveWorkout() {
  const ctx = useContext(ActiveWorkoutContext);
  if (!ctx)
    throw new Error('useActiveWorkout must be used within ActiveWorkoutProvider');
  return ctx;
}
