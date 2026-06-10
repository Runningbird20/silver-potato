import { useCallback } from 'react';
import { useAsyncStorage } from './useAsyncStorage';
import { BodyEntry, Measurements } from '../types';

const uid = () => Math.random().toString(36).slice(2, 9);

const SEED: BodyEntry[] = [
  {
    id: uid(),
    date: '2025-05-01',
    weight: 185,
    measurements: { chest: 42, waist: 34, arms: 15, quads: 24 },
  },
  {
    id: uid(),
    date: '2025-05-15',
    weight: 183,
    measurements: { chest: 42, waist: 33, arms: 15.2, quads: 24.5 },
  },
  {
    id: uid(),
    date: '2025-06-01',
    weight: 181,
    measurements: { chest: 43, waist: 32, arms: 15.5, quads: 25 },
  },
];

export function useBody() {
  const [entries, setEntries, loading] = useAsyncStorage<BodyEntry[]>(
    '@body_entries',
    SEED
  );

  const logWeight = useCallback(
    (weight: number, measurements?: Measurements) => {
      const entry: BodyEntry = {
        id: uid(),
        date: new Date().toISOString().split('T')[0],
        weight,
        measurements,
      };
      setEntries([entry, ...entries]);
    },
    [entries, setEntries]
  );

  const removeEntry = useCallback(
    (id: string) => setEntries(entries.filter((e) => e.id !== id)),
    [entries, setEntries]
  );

  const latestEntry = entries[0] ?? null;

  return { entries, loading, logWeight, removeEntry, latestEntry };
}
