/**
 * spectrumData.ts
 *
 * Typed wrapper around the NIST-sourced emission spectrum dataset.
 * Each element is keyed by its chemical symbol (e.g. "Au").
 * Wavelengths are in the visible range (380–750 nm).
 * Intensity is normalised 0–1 relative to the strongest line for that element.
 *
 * 74 of 118 elements are covered. getSpectrum() returns null for the rest.
 *
 * Source: NIST Atomic Spectra Database, sorted_spectrum.json
 */

import rawData from './spectrumData.json';

export interface SpectrumLine {
  wavelength_nm: number;
  intensity: number;
}

// The JSON is keyed by symbol — cast it directly, no transformation needed.
const SPECTRUM_DATA = rawData as Record<string, SpectrumLine[]>;

/**
 * Returns the emission lines for a given element symbol,
 * or null if no data is available in the dataset.
 */
export function getSpectrum(symbol: string): SpectrumLine[] | null {
  return SPECTRUM_DATA[symbol] ?? null;
}

/** Visible spectrum range this dataset covers */
export const SPECTRUM_RANGE = { min: 380, max: 750 } as const;
