import { useState, useEffect, useRef, useCallback } from 'react';

function formatSeconds(total: number): string {
  if (total < 60) return `${total}s`;
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m < 60) return `${m}m ${s.toString().padStart(2, '0')}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${(m % 60).toString().padStart(2, '0')}m`;
}

export function useElapsedTime(startTime: number | null): string {
  const [, tick] = useState(0);

  useEffect(() => {
    if (!startTime) return;
    const id = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [startTime]);

  if (!startTime) return '0s';
  return formatSeconds(Math.floor((Date.now() - startTime) / 1000));
}

export function useRestTimer() {
  const [remaining, setRemaining] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  const start = useCallback((seconds: number) => {
    clear();
    setRemaining(seconds);
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r === null || r <= 1) {
          clear();
          return null;
        }
        return r - 1;
      });
    }, 1000);
  }, []);

  const dismiss = useCallback(() => {
    clear();
    setRemaining(null);
  }, []);

  useEffect(() => () => clear(), []);

  const formatted = remaining !== null ? formatSeconds(remaining) : null;

  return { remaining, formatted, start, dismiss };
}

export { formatSeconds };
