import { useState, useEffect, useRef } from 'react';

export function useTimer(initialDuration = 30, onFinish = null) {
  const [remaining, setRemaining] = useState(initialDuration);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            if (onFinish) onFinish();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, onFinish]);

  const start = () => setIsRunning(true);
  const pause = () => setIsRunning(false);
  const reset = (dur = initialDuration) => {
    setIsRunning(false);
    setRemaining(dur);
  };

  return { remaining, isRunning, start, pause, reset };
}
