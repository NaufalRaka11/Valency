import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Element } from '../types/element';
import { ElementCell } from './ElementCell';
import { HoverPanel } from './HoverPanel';
import { CATEGORY_CONFIG, getCategoryConfig } from '../data/categoryConfig';
import { cn } from '../lib/utils';
import elementsData from '../data/elements.json';

const ELEMENTS: Element[] = (elementsData as any).elements;

interface PanelPosition {
  top: number;
  left: number;
}

export const PeriodicTable: React.FC = () => {
  const [hoveredElement, setHoveredElement] = useState<Element | null>(null);
  const [panelPosition, setPanelPosition] = useState<PanelPosition | null>(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Detect touch device once on mount
  useEffect(() => {
    setIsTouchDevice(window.matchMedia('(pointer: coarse)').matches);
  }, []);

  const filteredNumbers = React.useMemo(() => {
    if (!search && !activeCategory) return null;
    return new Set(
      ELEMENTS.filter(el => {
        const matchSearch =
          !search ||
          el.name.toLowerCase().includes(search.toLowerCase()) ||
          el.symbol.toLowerCase().includes(search.toLowerCase()) ||
          String(el.number).includes(search);
        const matchCat =
          !activeCategory ||
          getCategoryConfig(el.category).label === activeCategory;
        return matchSearch && matchCat;
      }).map(el => el.number)
    );
  }, [search, activeCategory]);

  const resolvePosition = (ref: React.RefObject<HTMLButtonElement>): PanelPosition | null => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return null;

    const panelW = 272;
    const panelH = 320;
    const margin = 8;

    const left =
      rect.right + panelW + margin > window.innerWidth
        ? rect.left - panelW
        : rect.right + margin;

    const top =
      rect.bottom + panelH + margin > window.innerHeight
        ? rect.top - panelH
        : rect.bottom + margin;

    return { top, left };
  };

  // Desktop: hover
  const handleHover = useCallback(
    (element: Element, ref: React.RefObject<HTMLButtonElement>) => {
      if (leaveTimer.current) clearTimeout(leaveTimer.current);
      setPanelPosition(resolvePosition(ref));
      setHoveredElement(element);
    },
    []
  );

  const handleLeave = useCallback(() => {
    leaveTimer.current = setTimeout(() => {
      setHoveredElement(null);
      setPanelPosition(null);
    }, 80);
  }, []);

  // Mobile: tap toggle
  const handleTap = useCallback(
    (element: Element, ref: React.RefObject<HTMLButtonElement>) => {
      if (hoveredElement?.number === element.number) {
        setHoveredElement(null);
        setPanelPosition(null);
      } else {
        setPanelPosition(resolvePosition(ref));
        setHoveredElement(element);
      }
    },
    [hoveredElement]
  );

  const handleClose = useCallback(() => {
    setHoveredElement(null);
    setPanelPosition(null);
  }, []);

  const resetFilters = () => {
    setSearch('');
    setActiveCategory(null);
  };

  const hasFilters = search || activeCategory;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative w-full sm:w-56">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search elements..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg
                       font-mono text-xs text-white/70 placeholder:text-white/20
                       outline-none focus:border-lab-accent/50 focus:ring-1 focus:ring-lab-accent/30
                       transition-colors"
          />
        </div>

        <select
          value={activeCategory ?? ''}
          onChange={e => setActiveCategory(e.target.value || null)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2
                     font-mono text-xs text-white/70 outline-none
                     focus:border-lab-accent/50 transition-colors cursor-pointer"
        >
          <option value="">All categories</option>
          {Object.values(CATEGORY_CONFIG)
            .map(c => c.label)
            .filter((v, i, a) => a.indexOf(v) === i)
            .map(label => (
              <option key={label} value={label}>{label}</option>
            ))}
        </select>

        <AnimatePresence>
          {hasFilters && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={resetFilters}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10
                         rounded-lg font-mono text-xs text-white/40 hover:text-white/70
                         hover:border-white/20 transition-colors"
            >
              <RotateCcw size={11} /> Reset
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {Object.values(CATEGORY_CONFIG)
          .filter((v, i, a) => a.findIndex(c => c.label === v.label) === i)
          .map(config => (
            <button
              key={config.label}
              onClick={() =>
                setActiveCategory(activeCategory === config.label ? null : config.label)
              }
              className={cn(
                'flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest transition-opacity',
                activeCategory && activeCategory !== config.label
                  ? 'opacity-20'
                  : 'opacity-60 hover:opacity-100'
              )}
            >
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: config.color }} />
              {config.label}
            </button>
          ))}
      </div>

      {/* Grid */}
      <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 pb-2 scrollbar-hide">
        <div
          className="grid gap-[3px]"
          style={{ gridTemplateColumns: 'repeat(18, minmax(0, 1fr))', minWidth: 720 }}
        >
          {ELEMENTS.map(el => (
            <ElementCell
              key={el.number}
              element={el}
              isActive={hoveredElement?.number === el.number}
              isDimmed={filteredNumbers !== null && !filteredNumbers.has(el.number)}
              onHover={handleHover}
              onLeave={handleLeave}
              onTap={handleTap}
              isTouchDevice={isTouchDevice}
            />
          ))}
        </div>
      </div>

      <HoverPanel
        element={hoveredElement}
        position={panelPosition}
        isTouchDevice={isTouchDevice}
        onClose={handleClose}
      />
    </div>
  );
};