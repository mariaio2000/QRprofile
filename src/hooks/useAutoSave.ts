import { useEffect, useRef } from "react";

type Saver<T> = (data: T) => Promise<void> | void;

export function useAutoSave<T>(
  data: T,
  save: Saver<T>,
  delay = 600 // ms
) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const last = useRef<string>("");

  useEffect(() => {
    const s = JSON.stringify(data);
    if (s === last.current) return;

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      last.current = s;
      await save(data);
    }, delay);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [data, save, delay]);
}
