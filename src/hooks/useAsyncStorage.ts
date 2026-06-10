import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useAsyncStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(key).then((stored) => {
      if (stored !== null) {
        setValue(JSON.parse(stored));
      }
      setLoading(false);
    });
  }, [key]);

  const persist = useCallback(
    async (newValue: T) => {
      setValue(newValue);
      await AsyncStorage.setItem(key, JSON.stringify(newValue));
    },
    [key]
  );

  return [value, persist, loading] as const;
}
