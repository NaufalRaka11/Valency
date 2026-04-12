import { Element } from '../types/element';

export interface HeatmapMode {
  key: string;
  label: string;
  unit: string;
  getValue: (el: Element) => number | null;
  stops: string[]; // low → mid → high, all readable on dark bg
}

/**
 * Color rules for dark background readability:
 * - No stop darker than ~#1a or lower channel average < 60
 * - Low end: cool muted but still visible (deep blue, slate, teal)
 * - High end: warm vivid (yellow, orange, bright cyan)
 * - Every stop must read clearly as a cell fill at 40% opacity
 *   AND as a symbol color at full brightness
 */
export const HEATMAP_MODES: HeatmapMode[] = [
  {
    key: 'electronegativity',
    label: 'Electronegativity',
    unit: 'Pauling',
    getValue: el => el.electronegativity_pauling,
    // cool slate → sky blue → bright yellow  (low=calm, high=reactive)
    stops: ['#475569', '#38bdf8', '#fde047'],
  },
  {
    key: 'atomic_mass',
    label: 'Atomic mass',
    unit: 'u',
    getValue: el => el.atomic_mass,
    // muted teal → green → lime  (light → heavy)
    stops: ['#2dd4bf', '#4ade80', '#a3e635'],
  },
  {
    key: 'boil',
    label: 'Boiling point',
    unit: 'K',
    getValue: el => el.boil,
    // cool blue → orange → bright yellow  (cold → scorching)
    stops: ['#60a5fa', '#f97316', '#fde047'],
  },
  {
    key: 'melt',
    label: 'Melting point',
    unit: 'K',
    getValue: el => el.melt,
    // slate → violet → amber  (low → high melting)
    stops: ['#94a3b8', '#a78bfa', '#fbbf24'],
  },
  {
    key: 'density',
    label: 'Density',
    unit: 'g/cm³',
    getValue: el => el.density,
    // light cyan → purple → pink  (light → dense)
    stops: ['#67e8f9', '#8b5cf6', '#f472b6'],
  },
  {
    key: 'electron_affinity',
    label: 'Electron affinity',
    unit: 'kJ/mol',
    getValue: el => el.electron_affinity,
    // muted green → teal → bright cyan
    stops: ['#6ee7b7', '#14b8a6', '#22d3ee'],
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

export function interpolateColor(t: number, stops: string[]): string {
  if (stops.length === 1) return stops[0];
  const segments = stops.length - 1;
  const scaled = t * segments;
  const idx = Math.min(Math.floor(scaled), segments - 1);
  const local = scaled - idx;
  const a = hexToRgb(stops[idx]);
  const b = hexToRgb(stops[idx + 1]);
  return `rgb(${Math.round(a.r + (b.r - a.r) * local)},${Math.round(a.g + (b.g - a.g) * local)},${Math.round(a.b + (b.b - a.b) * local)})`;
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