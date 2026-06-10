import { useCallback } from 'react';
import { useAsyncStorage } from './useAsyncStorage';
import { PR } from '../types';

const uid = () => Math.random().toString(36).slice(2, 9);

const SEED: PR[] = [
  { id: uid(), exerciseName: 'Bench Press', weight: 225, reps: 1, date: '2025-05-10' },
  { id: uid(), exerciseName: 'Squat', weight: 315, reps: 1, date: '2025-05-20' },
  { id: uid(), exerciseName: 'Deadlift', weight: 365, reps: 1, date: '2025-06-01' },
  { id: uid(), exerciseName: 'Overhead Press', weight: 135, reps: 5, date: '2025-06-05' },
];

export function useProgress() {
  const [prs, setPRs, loading] = useAsyncStorage<PR[]>('@prs', SEED);

  const addPR = useCallback(
    (pr: Omit<PR, 'id'>) => {
      setPRs([...prs, { ...pr, id: uid() }]);
    },
    [prs, setPRs]
  );

  const removePR = useCallback(
    (id: string) => setPRs(prs.filter((p) => p.id !== id)),
    [prs, setPRs]
  );

  return { prs, loading, addPR, removePR };
}
