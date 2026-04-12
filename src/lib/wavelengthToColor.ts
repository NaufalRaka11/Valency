/**
 * wavelengthToColor.ts
 *
 * Converts a wavelength in nm (380–750) to an RGB color string.
 * Based on the standard CIE approximation by Dan Bruton.
 *
 * Returns colors that look correct on a dark background —
 * the extreme ends (UV, deep red) are dimmed to avoid pure black/white.
 */

export function wavelengthToColor(nm: number): string {
  let r = 0, g = 0, b = 0;

  if (nm >= 380 && nm < 440) {
    r = -(nm - 440) / (440 - 380);
    b = 1.0;
  } else if (nm >= 440 && nm < 490) {
    g = (nm - 440) / (490 - 440);
    b = 1.0;
  } else if (nm >= 490 && nm < 510) {
    g = 1.0;
    b = -(nm - 510) / (510 - 490);
  } else if (nm >= 510 && nm < 580) {
    r = (nm - 510) / (580 - 510);
    g = 1.0;
  } else if (nm >= 580 && nm < 645) {
    r = 1.0;
    g = -(nm - 645) / (645 - 580);
  } else if (nm >= 645 && nm <= 750) {
    r = 1.0;
  }

  // Intensity falloff at the edges of the visible range
  let factor = 1.0;
  if (nm >= 380 && nm < 420) {
    factor = 0.3 + 0.7 * (nm - 380) / (420 - 380);
  } else if (nm > 700 && nm <= 750) {
    factor = 0.3 + 0.7 * (750 - nm) / (750 - 700);
  }

  const ri = Math.round(255 * r * factor);
  const gi = Math.round(255 * g * factor);
  const bi = Math.round(255 * b * factor);

  return `rgb(${ri},${gi},${bi})`;
}
