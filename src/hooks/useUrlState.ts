/**
 * useUrlState
 *
 * Syncs the selected element symbol with ?element=Au in the URL.
 * Uses replaceState (no history spam) so back button stays clean.
 * Returns { selectedSymbol, setSelectedSymbol } — same shape as useState.
 * Components never touch window.location directly.
 */

import { useState, useEffect, useCallback } from 'react';

function readSymbolFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  const val = params.get('element');
  if (!val || !/^[A-Za-z]{1,3}$/.test(val)) return null;
  return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
}

function writeSymbolToUrl(symbol: string | null): void {
  const url = new URL(window.location.href);
  if (symbol) {
    url.searchParams.set('element', symbol);
  } else {
    url.searchParams.delete('element');
  }
  window.history.replaceState(null, '', url.toString());
}

export function useUrlState(): {
  selectedSymbol: string | null;
  setSelectedSymbol: (symbol: string | null) => void;
} {
  const [selectedSymbol, setSymbolState] = useState<string | null>(readSymbolFromUrl);

  const setSelectedSymbol = useCallback((symbol: string | null) => {
    setSymbolState(symbol);
    writeSymbolToUrl(symbol);
  }, []);

  // Keep in sync if user navigates with browser back/forward
  useEffect(() => {
    const onPop = () => setSymbolState(readSymbolFromUrl());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  return { selectedSymbol, setSelectedSymbol };
}