import { Element } from '../types/element';

export interface HeatmapMode {
  key: string;
  label: string;
  unit: string;
  getValue: (el: Element) => number | null;
  stops: string[]; // 2–3 color stops, dark → vivid
}

export const HEATMAP_MODES: HeatmapMode[] = [
  {
    key: 'electronegativity',
    label: 'Electronegativity',
    unit: 'Pauling',
    getValue: el => el.electronegativity_pauling,
    stops: ['#1e3a5f', '#38bdf8', '#f0f9ff'],
  },
  {
    key: 'atomic_mass',
    label: 'Atomic mass',
    unit: 'u',
    getValue: el => el.atomic_mass,
    stops: ['#052e16', '#16a34a', '#bbf7d0'],
  },
  {
    key: 'boil',
    label: 'Boiling point',
    unit: 'K',
    getValue: el => el.boil,
    stops: ['#1c1917', '#dc2626', '#fef08a'],
  },
  {
    key: 'melt',
    label: 'Melting point',
    unit: 'K',
    getValue: el => el.melt,
    stops: ['#1e1b4b', '#7c3aed', '#fbbf24'],
  },
  {
    key: 'density',
    label: 'Density',
    unit: 'g/cm³',
    getValue: el => el.density,
    stops: ['#0c0a09', '#9333ea', '#e879f9'],
  },
  {
    key: 'electron_affinity',
    label: 'Electron affinity',
    unit: 'kJ/mol',
    getValue: el => el.electron_affinity,
    stops: ['#042f2e', '#0d9488', '#99f6e4'],
  },
];

export function getNormalised(
  element: Element,
  mode: HeatmapMode,
  min: number,
  max: number
): number | null {
  const val = mode.getValue(element);
  if (val === null || val === undefined) return null;
  if (max === min) return 0.5;
  return (val - min) / (max - min);
}

function hexToRgb(hex: string) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

// Interpolate across N stops
export function interpolateColor(t: number, stops: string[]): string {
  if (stops.length === 1) return stops[0];
  const segments = stops.length - 1;
  const scaled = t * segments;
  const idx = Math.min(Math.floor(scaled), segments - 1);
  const local = scaled - idx;
  const a = hexToRgb(stops[idx]);
  const b = hexToRgb(stops[idx + 1]);
  const r = Math.round(a.r + (b.r - a.r) * local);
  const g = Math.round(a.g + (b.g - a.g) * local);
  const bl = Math.round(a.b + (b.b - a.b) * local);
  return `rgb(${r},${g},${bl})`;
}

export function computeRange(
  elements: Element[],
  mode: HeatmapMode
): { min: number; max: number } {
  const vals = elements
    .map(el => mode.getValue(el))
    .filter((v): v is number => v !== null && v !== undefined);
  return { min: Math.min(...vals), max: Math.max(...vals) };
}