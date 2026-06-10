import { useCallback, useMemo } from 'react';
import { useAsyncStorage } from './useAsyncStorage';
import { WorkoutSession, Exercise, ExerciseSet } from '../types';

const todayDate = () => new Date().toISOString().split('T')[0];
const uid = () => Math.random().toString(36).slice(2, 9);

const SEED: WorkoutSession[] = [
  {
    id: uid(),
    date: todayDate(),
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
        name: 'Squat',
        sets: [
          { id: uid(), weight: 185, reps: 8, completed: true },
          { id: uid(), weight: 205, reps: 6, completed: false },
        ],
      },
    ],
  },
];

export function useWorkout() {
  const [sessions, setSessions, loading] = useAsyncStorage<WorkoutSession[]>(
    '@workout_sessions',
    SEED
  );

  const todaySession = useMemo<WorkoutSession>(() => {
    const found = sessions.find((s) => s.date === todayDate());
    if (found) return found;
    return { id: uid(), date: todayDate(), exercises: [] };
  }, [sessions]);

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
    allSessions: sessions,
    loading,
    addExercise,
    addSet,
    updateSet,
    completeSet,
    volume,
  };
}
