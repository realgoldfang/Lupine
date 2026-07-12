import { useState, useEffect, useRef, useCallback } from 'react';

export function useSleepTimer(onExpire: () => void) {
  const [minutes, setMinutes] = useState<number | null>(null);
  const [remaining, setRemaining] = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const expiryRef = useRef<number>(0);

  useEffect(() => {
    if (minutes === null) {
      setRemaining(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    expiryRef.current = Date.now() + minutes * 60 * 1000;
    setRemaining(minutes * 60);

    intervalRef.current = setInterval(() => {
      const left = Math.max(0, Math.ceil((expiryRef.current - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        onExpire();
        setMinutes(null);
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [minutes, onExpire]);

  const cancel = useCallback(() => {
    setMinutes(null);
    setRemaining(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const formatRemaining = () => {
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return { minutes, setMinutes, remaining, formatRemaining, cancel };
}
