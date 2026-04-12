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
  const isNoData  = isHeatmap && heatmapColor === 'none';

  // Border-top color: category color in normal mode, heatmap color in heatmap mode
  const topBorderColor = isNoData
    ? 'rgba(255,255,255,0.08)'
    : isHeatmap
    ? heatmapColor!
    : config.color;

  return (
    <motion.button
      ref={ref}
      onHoverStart={() => !isTouchDevice && onHover(element, ref)}
      onHoverEnd={() => !isTouchDevice && onLeave()}
      onClick={() => isTouchDevice && onTap(element, ref)}
      animate={{
        opacity: isDimmed ? 0.1 : isNoData ? 0.22 : 1,
        scale: isActive ? 1.06 : 1,
        zIndex: isActive ? 10 : 0,
      }}
      transition={{ duration: 0.12 }}
      className={cn(
        'relative aspect-square flex flex-col items-center justify-center',
        'focus:outline-none cursor-default select-none',
        // Rounded corners intentionally small — feels more like a data grid than cards
        'rounded-[3px]',
      )}
      style={{
        gridColumn: element.xpos,
        gridRow: element.ypos,
        // Top accent border — the primary category signal
        borderTop: `2px solid ${topBorderColor}`,
        // Background: very subtle tint of category color, darker on hover
        background: isActive
          ? `${topBorderColor}18`
          : isNoData
          ? 'rgba(255,255,255,0.02)'
          : isHeatmap
          ? `${heatmapColor}14`
          : `${config.color}0a`,
        // Remaining borders: very subtle uniform
        borderRight: '1px solid rgba(255,255,255,0.04)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        borderLeft: '1px solid rgba(255,255,255,0.04)',
        // Glow only on active
        boxShadow: isActive && !isNoData
          ? `0 0 16px ${topBorderColor}44, inset 0 0 12px ${topBorderColor}08`
          : 'none',
      }}
    >
      {/* Atomic number — top left */}
      <span
        className="absolute font-mono leading-none text-white/30"
        style={{
          fontSize: 'clamp(5px, 0.55vw, 7px)',
          top: '3px',
          left: '4px',
        }}
      >
        {element.number}
      </span>

      {/* Symbol */}
      <span
        className="font-mono font-bold leading-none transition-colors duration-150"
        style={{
          fontSize: 'clamp(9px, 1.5vw, 17px)',
          color: isActive
            ? topBorderColor
            : isHeatmap && !isNoData
            ? heatmapColor!
            : config.color,
          filter: isActive ? `brightness(1.2)` : 'none',
        }}
      >
        {element.symbol}
      </span>

      {/* Name — appears on hover */}
      <span
        className="font-mono leading-none transition-opacity duration-100 text-white/40"
        style={{
          fontSize: 'clamp(4px, 0.5vw, 6px)',
          opacity: isActive ? 1 : 0,
          marginTop: '1px',
        }}
      >
        {isHeatmap
          ? (heatmapValue ?? '—')
          : element.name.length > 8
          ? element.name.slice(0, 7) + '.'
          : element.name}
      </span>
    </motion.button>
  );
};
