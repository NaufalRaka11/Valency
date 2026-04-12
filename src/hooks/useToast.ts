/**
 * useToast
 *
 * Minimal toast notification hook. Returns show() to trigger a toast
 * and the current toast state for rendering.
 *
 * Intentionally simple — one toast at a time, auto-dismisses after
 * the given duration. No queue, no stacking. Add those if needed later.
 */

import { useState, useCallback, useRef } from 'react';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'info' | 'error';
}

export function useToast() {
  const [toast, setToast] = useState<Toast | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((
    message: string,
    type: Toast['type'] = 'success',
    duration = 2500,
  ) => {
    // Clear any existing timer so rapid calls don't stack
    if (timerRef.current) clearTimeout(timerRef.current);

    setToast({ id: Date.now(), message, type });
    timerRef.current = setTimeout(() => setToast(null), duration);
  }, []);

  const dismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(null);
  }, []);

  return { toast, show, dismiss };
}
