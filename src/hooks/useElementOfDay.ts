/**
 * useElementOfDay
 *
 * Returns today's featured element, seeded by UTC date so:
 * - Every user sees the same element on the same day
 * - It changes at UTC midnight
 * - The sequence cycles through all 118 elements over ~4 months
 *
 * Depends on elements being loaded externally — pass them in so
 * this hook stays pure and doesn't duplicate the fetch logic.
 */

import { useMemo } from 'react';
import { Element } from '../types/element';

export function useElementOfDay(elements: Element[]): Element | null {
  return useMemo(() => {
    if (elements.length === 0) return null;
    // Days since Unix epoch (UTC) — same number for everyone today
    const dayIndex = Math.floor(Date.now() / 86_400_000);
    return elements[dayIndex % elements.length];
  }, [elements]);
}
