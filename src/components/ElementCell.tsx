import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { Element } from '../types/element';
import { getCategoryConfig } from '../data/categoryConfig';
import { cn } from '../lib/utils';

interface ElementCellProps {
  element: Element;
  isActive: boolean;
  isDimmed: boolean;
  onHover: (element: Element, ref: React.RefObject<HTMLButtonElement>) => void;
  onLeave: () => void;
  onTap: (element: Element, ref: React.RefObject<HTMLButtonElement>) => void;
  isTouchDevice: boolean;
  heatmapColor: string | null;
  heatmapValue: string | null;
}

export const ElementCell: React.FC<ElementCellProps> = ({
  element,
  isActive,
  isDimmed,
  onHover,
  onLeave,
  onTap,
  isTouchDevice,
  heatmapColor,
  heatmapValue,
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  const config = getCategoryConfig(element.category);

  const isHeatmap = heatmapColor !== null;
  const isNoData = isHeatmap && heatmapColor === 'none';

  return (
    <motion.button
      ref={ref}
      style={{
        gridColumn: element.xpos,
        gridRow: element.ypos,
        // Heatmap: strong solid fill so color is unmistakably readable
        background: isNoData
          ? 'rgba(255,255,255,0.025)'
          : isHeatmap
          ? `${heatmapColor}`   // use color directly as bg with opacity via rgba below
          : undefined,
        // We encode color via a layered approach: colored bg at 35% + symbol in same color at 100%
        backgroundColor: isHeatmap && !isNoData
          ? undefined
          : undefined,
        boxShadow: isActive && !isNoData
          ? isHeatmap
            ? `0 0 14px ${heatmapColor}99, 0 0 4px ${heatmapColor}55`
            : `0 0 18px ${config.glowColor}, 0 0 6px ${config.glowColor}`
          : 'none',
      }}
      onHoverStart={() => !isTouchDevice && onHover(element, ref)}
      onHoverEnd={() => !isTouchDevice && onLeave()}
      onClick={() => isTouchDevice && onTap(element, ref)}
      animate={{
        opacity: isDimmed ? 0.12 : isNoData ? 0.2 : 1,
        scale: isActive ? 1.08 : 1,
      }}
      transition={{ duration: 0.15 }}
      className={cn(
        'relative aspect-square flex flex-col items-center justify-center rounded',
        'border transition-all duration-200 cursor-default select-none focus:outline-none',
        !isHeatmap && config.bgClass,
      )}
      style={{
        gridColumn: element.xpos,
        gridRow: element.ypos,
        background: isNoData
          ? 'rgba(255,255,255,0.025)'
          : isHeatmap
          // Strong fill: the color at 40% opacity gives bold readability on near-black bg
          ? `color-mix(in srgb, ${heatmapColor} 40%, transparent)`
          : undefined,
        borderColor: isActive
          ? 'rgba(255,255,255,0.4)'
          : isNoData
          ? 'rgba(255,255,255,0.04)'
          : isHeatmap
          ? `color-mix(in srgb, ${heatmapColor} 60%, transparent)`
          : 'rgba(255,255,255,0.05)',
        boxShadow: isActive && !isNoData
          ? isHeatmap
            ? `0 0 14px ${heatmapColor}99`
            : `0 0 18px ${config.glowColor}`
          : 'none',
      }}
    >
      {/* Atomic number */}
      <span className="absolute top-[3px] left-[4px] font-mono text-[6px] opacity-40 leading-none">
        {element.number}
      </span>

      {/* Symbol — full color in heatmap for max readability */}
      <span
        className={cn(
          'font-mono font-bold leading-none transition-colors duration-200',
          !isHeatmap && config.textClass,
        )}
        style={{
          fontSize: 'clamp(8px, 1.4vw, 16px)',
          color: isHeatmap && !isNoData
            ? heatmapColor!
            : isNoData
            ? 'rgba(255,255,255,0.15)'
            : undefined,
          // Bump brightness so symbol pops on the colored fill
          filter: isHeatmap && !isNoData ? 'brightness(1.6)' : 'none',
        }}
      >
        {element.symbol}
      </span>

      {/* Value on hover */}
      <span
        className={cn(
          'font-mono leading-none transition-opacity duration-150 text-white/50',
          isActive ? 'opacity-100' : 'opacity-0',
        )}
        style={{ fontSize: 'clamp(4px, 0.65vw, 7px)' }}
      >
        {isHeatmap ? (heatmapValue ?? '—') : element.atomic_mass.toFixed(2)}
      </span>
    </motion.button>
  );
};