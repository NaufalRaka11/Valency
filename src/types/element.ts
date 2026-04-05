export interface Element {
  name: string;
  symbol: string;
  number: number;
  atomic_mass: number;
  category: string;
  phase: 'Gas' | 'Liquid' | 'Solid' | 'Unknown';
  summary: string;
  xpos: number;
  ypos: number;

  // Discovery
  discovered_by: string | null;
  named_by: string | null;

  // Physical properties
  density: number | null;
  melt: number | null;       // Kelvin
  boil: number | null;       // Kelvin
  molar_heat: number | null;

  // Electronic properties
  electron_configuration: string;
  electron_configuration_semantic: string;
  electron_affinity: number | null;
  electronegativity_pauling: number | null;
  shells: number[];

  // Appearance
  appearance: string | null;
  color: string | null;
  spectral_img: string | null;

  // Source
  source: string;
}

export interface ElementsData {
  elements: Element[];
}