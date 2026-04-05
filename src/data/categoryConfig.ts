export interface CategoryConfig {
  label: string;
  color: string;        // hex — used for glow, border, badge
  bgClass: string;      // tailwind bg utility for the cell fill
  textClass: string;    // tailwind text utility for cell symbol
  glowColor: string;    // rgba for box-shadow glow on hover
}

export const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  'alkali metal': {
    label: 'Alkali Metal',
    color: '#ef4444',
    bgClass: 'bg-red-500/10',
    textClass: 'text-red-300',
    glowColor: 'rgba(239,68,68,0.35)',
  },
  'alkaline earth metal': {
    label: 'Alkaline Earth',
    color: '#f97316',
    bgClass: 'bg-orange-500/10',
    textClass: 'text-orange-300',
    glowColor: 'rgba(249,115,22,0.35)',
  },
  'transition metal': {
    label: 'Transition Metal',
    color: '#eab308',
    bgClass: 'bg-yellow-500/10',
    textClass: 'text-yellow-300',
    glowColor: 'rgba(234,179,8,0.35)',
  },
  'post-transition metal': {
    label: 'Post-transition Metal',
    color: '#84cc16',
    bgClass: 'bg-lime-500/10',
    textClass: 'text-lime-300',
    glowColor: 'rgba(132,204,22,0.35)',
  },
  'metalloid': {
    label: 'Metalloid',
    color: '#22c55e',
    bgClass: 'bg-green-500/10',
    textClass: 'text-green-300',
    glowColor: 'rgba(34,197,94,0.35)',
  },
  'diatomic nonmetal': {
    label: 'Nonmetal',
    color: '#06b6d4',
    bgClass: 'bg-cyan-500/10',
    textClass: 'text-cyan-300',
    glowColor: 'rgba(6,182,212,0.35)',
  },
  'polyatomic nonmetal': {
    label: 'Nonmetal',
    color: '#06b6d4',
    bgClass: 'bg-cyan-500/10',
    textClass: 'text-cyan-300',
    glowColor: 'rgba(6,182,212,0.35)',
  },
  'halogen': {
    label: 'Halogen',
    color: '#3b82f6',
    bgClass: 'bg-blue-500/10',
    textClass: 'text-blue-300',
    glowColor: 'rgba(59,130,246,0.35)',
  },
  'noble gas': {
    label: 'Noble Gas',
    color: '#8b5cf6',
    bgClass: 'bg-violet-500/10',
    textClass: 'text-violet-300',
    glowColor: 'rgba(139,92,246,0.35)',
  },
  'lanthanide': {
    label: 'Lanthanide',
    color: '#ec4899',
    bgClass: 'bg-pink-500/10',
    textClass: 'text-pink-300',
    glowColor: 'rgba(236,72,153,0.35)',
  },
  'actinide': {
    label: 'Actinide',
    color: '#14b8a6',
    bgClass: 'bg-teal-500/10',
    textClass: 'text-teal-300',
    glowColor: 'rgba(20,184,166,0.35)',
  },
  'unknown': {
    label: 'Unknown',
    color: '#6b7280',
    bgClass: 'bg-gray-500/10',
    textClass: 'text-gray-400',
    glowColor: 'rgba(107,114,128,0.25)',
  },
};

export function getCategoryConfig(category: string): CategoryConfig {
  const key = category.toLowerCase();
  return CATEGORY_CONFIG[key] ?? CATEGORY_CONFIG['unknown'];
}

export const ALL_CATEGORIES = Object.values(CATEGORY_CONFIG)
  .map(c => c.label)
  .filter((v, i, a) => a.indexOf(v) === i); // dedupe Nonmetal