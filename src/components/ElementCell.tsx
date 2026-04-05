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
}

export const ElementCell: React.FC<ElementCellProps> = ({
  element,
  isActive,
  isDimmed,
  onHover,
  onLeave,
  onTap,
  isTouchDevice,
}) => {
  const ref = useRef<HTMLButtonElement>(null);
  const config = getCategoryConfig(element.category);

  return (
    <motion.button
      ref={ref}
      style={{
        gridColumn: element.xpos,
        gridRow: element.ypos,
        boxShadow: isActive
          ? `0 0 18px ${config.glowColor}, 0 0 6px ${config.glowColor}`
          : 'none',
      }}
      onHoverStart={() => !isTouchDevice && onHover(element, ref)}
      onHoverEnd={() => !isTouchDevice && onLeave()}
      onClick={() => isTouchDevice && onTap(element, ref)}
      animate={{
        opacity: isDimmed ? 0.15 : 1,
        scale: isActive ? 1.08 : 1,
      }}
      transition={{ duration: 0.15 }}
      className={cn(
        'relative aspect-square flex flex-col items-center justify-center rounded',
        'border transition-colors duration-150 cursor-default select-none',
        'group focus:outline-none',
        config.bgClass,
        isActive
          ? 'border-white/30'
          : 'border-white/5 hover:border-white/15',
      )}
    >
      <span className="absolute top-[3px] left-[4px] font-mono text-[6px] opacity-40 leading-none">
        {element.number}
      </span>

      <span
        className={cn('font-mono font-bold leading-none', config.textClass)}
        style={{ fontSize: 'clamp(8px, 1.4vw, 16px)' }}
      >
        {element.symbol}
      </span>

      <span
        className={cn(
          'font-mono leading-none text-white/30 transition-opacity duration-150',
          isActive ? 'opacity-100' : 'opacity-0',
        )}
        style={{ fontSize: 'clamp(4px, 0.7vw, 7px)' }}
      >
        {element.atomic_mass.toFixed(2)}
      </span>
    </motion.button>
  );
};