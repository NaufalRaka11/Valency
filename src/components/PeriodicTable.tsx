import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Search, RotateCcw, Thermometer, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Element } from '../types/element';
import { ElementCell } from './ElementCell';
import { HoverPanel } from './HoverPanel';
import { CATEGORY_CONFIG, getCategoryConfig } from '../data/categoryConfig';
import { HEATMAP_MODES, getNormalised, interpolateColor, computeRange } from '../lib/heatmap';
import { useUrlState } from '../hooks/useUrlState';
import { TableStats } from './TableStats';
import { cn } from '../lib/utils';

interface PeriodicTableProps {
  /**
   * Pre-loaded elements array. If provided the component skips its internal
   * fetch — useful when a parent already has the data (e.g. to share with
   * ElementOfDay). If omitted the component fetches /elements.json itself.
   */
  elements?: Element[];
  /** Called when user copies a share link — triggers a toast in the parent. */
  onShare?: (message: string) => void;
}

interface PanelPosition { top: number; left: number; }
type ViewMode = 'category' | 'heatmap';

export const PeriodicTable: React.FC<PeriodicTableProps> = ({ elements: elementsProp, onShare }) => {
  const [elementsFetched, setElementsFetched] = useState<Element[]>([]);
  const [loading, setLoading] = useState(!elementsProp);
  const [hoveredElement, setHoveredElement] = useState<Element | null>(null);
  const [panelPosition, setPanelPosition] = useState<PanelPosition | null>(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('category');
  const [heatmapModeKey, setHeatmapModeKey] = useState(HEATMAP_MODES[0].key);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Use prop if provided, otherwise use internally fetched data
  const elements = elementsProp ?? elementsFetched;

  const { selectedSymbol, setSelectedSymbol } = useUrlState();

  // Fetch only when no prop was provided
  useEffect(() => {
    if (elementsProp) return;
    fetch('/elements.json')
      .then(r => r.json())
      .then(data => {
        setElementsFetched(data.elements);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load elements.json:', err);
        setLoading(false);
      });
  }, [elementsProp]);

  // Once elements are ready: if URL has ?element=Au, open that panel
  useEffect(() => {
    if (!selectedSymbol || elements.length === 0) return;
    const el = elements.find(e => e.symbol === selectedSymbol);
    if (!el) return;
    setHoveredElement(el);
    setPanelPosition({
      top: Math.max(80, window.innerHeight / 2 - 200),
      left: Math.max(16, window.innerWidth / 2 - 140),
    });
  }, [selectedSymbol, elements]);

  useEffect(() => {
    setIsTouchDevice(window.matchMedia('(pointer: coarse)').matches);
  }, []);

  const heatmapMode = useMemo(
    () => HEATMAP_MODES.find(m => m.key === heatmapModeKey)!,
    [heatmapModeKey]
  );

  const heatmapData = useMemo(() => {
    if (viewMode !== 'heatmap' || elements.length === 0) return null;
    const { min, max } = computeRange(elements, heatmapMode);
    return elements.reduce<Record<number, { color: string | null; valueStr: string | null }>>(
      (acc, el) => {
        const norm = getNormalised(el, heatmapMode, min, max);
        const raw = heatmapMode.getValue(el);
        acc[el.number] = {
          color: norm !== null ? interpolateColor(norm, heatmapMode.stops) : null,
          valueStr: raw !== null ? `${raw.toFixed(2)} ${heatmapMode.unit}` : null,
        };
        return acc;
      },
      {}
    );
  }, [viewMode, heatmapMode, elements]);

  const filteredNumbers = useMemo(() => {
    if (!search && !activeCategory) return null;
    return new Set(
      elements.filter(el => {
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
  }, [search, activeCategory, elements]);

  const resolvePosition = (ref: React.RefObject<HTMLButtonElement>): PanelPosition | null => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return null;
    const panelW = 280, panelH = 420, margin = 8;
    const left = rect.right + panelW + margin > window.innerWidth
      ? rect.left - panelW : rect.right + margin;
    const top = rect.bottom + panelH + margin > window.innerHeight
      ? rect.top - panelH : rect.bottom + margin;
    return { top, left };
  };

  const handleHover = useCallback((element: Element, ref: React.RefObject<HTMLButtonElement>) => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setPanelPosition(resolvePosition(ref));
    setHoveredElement(element);
    setSelectedSymbol(element.symbol);
  }, [setSelectedSymbol]);

  const handleLeave = useCallback(() => {
    leaveTimer.current = setTimeout(() => {
      setHoveredElement(null);
      setPanelPosition(null);
      setSelectedSymbol(null);
    }, 80);
  }, [setSelectedSymbol]);

  const handleTap = useCallback((element: Element, ref: React.RefObject<HTMLButtonElement>) => {
    if (hoveredElement?.number === element.number) {
      setHoveredElement(null);
      setPanelPosition(null);
      setSelectedSymbol(null);
    } else {
      setPanelPosition(resolvePosition(ref));
      setHoveredElement(element);
      setSelectedSymbol(element.symbol);
    }
  }, [hoveredElement, setSelectedSymbol]);

  const handleClose = useCallback(() => {
    setHoveredElement(null);
    setPanelPosition(null);
    setSelectedSymbol(null);
  }, [setSelectedSymbol]);

  const resetFilters = () => { setSearch(''); setActiveCategory(null); };
  const hasFilters = search || activeCategory;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3">
        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00ff9d' }} />
        <span className="font-mono text-[10px] uppercase tracking-widest text-white/30">
          Loading elements...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* ── CONTROLS ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4">

        {/* Mode toggle */}
        <div className="flex items-center gap-2">
          {([
            { mode: 'category' as ViewMode, icon: <Tag size={11} />, label: 'Category' },
            { mode: 'heatmap' as ViewMode, icon: <Thermometer size={11} />, label: 'Heatmap' },
          ] as const).map(({ mode, icon, label }) => (
            <button key={mode} onClick={() => setViewMode(mode)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-widest transition-all',
                viewMode === mode
                  ? 'text-lab-bg'
                  : 'bg-white/5 border border-white/10 text-white/40 hover:text-white/70 hover:border-white/20'
              )}
              style={viewMode === mode ? { background: '#00ff9d' } : {}}>
              {icon} {label}
            </button>
          ))}
        </div>

        {/* Heatmap controls */}
        <AnimatePresence>
          {viewMode === 'heatmap' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="flex flex-wrap gap-2">
                {HEATMAP_MODES.map(mode => (
                  <button key={mode.key} onClick={() => setHeatmapModeKey(mode.key)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-widest transition-all border',
                      heatmapModeKey === mode.key
                        ? 'bg-white/5'
                        : 'border-white/5 text-white/30 hover:text-white/60 hover:border-white/10'
                    )}
                    style={heatmapModeKey === mode.key
                      ? { borderColor: mode.stops[mode.stops.length - 1] + '88', color: mode.stops[mode.stops.length - 1] }
                      : {}}>
                    {mode.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3 mt-3">
                <span className="font-mono text-[9px] text-white/30 uppercase tracking-widest">Low</span>
                <div className="flex-1 h-2 rounded-full"
                  style={{ background: `linear-gradient(to right, ${heatmapMode.stops.join(', ')})` }} />
                <span className="font-mono text-[9px] text-white/30 uppercase tracking-widest">High</span>
                <span className="font-mono text-[9px] text-white/20 ml-1">({heatmapMode.unit})</span>
              </div>
              <p className="font-mono text-[8px] text-white/15 mt-1 uppercase tracking-widest">
                Gray cells = no data available
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category controls */}
        <AnimatePresence>
          {viewMode === 'category' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} className="overflow-hidden space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <div className="relative w-full sm:w-56">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input type="text" placeholder="Search elements..." value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg
                               font-mono text-xs text-white/70 placeholder:text-white/20
                               outline-none focus:border-lab-accent/50 focus:ring-1 focus:ring-lab-accent/30 transition-colors" />
                </div>
                <select value={activeCategory ?? ''} onChange={e => setActiveCategory(e.target.value || null)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 font-mono text-xs
                             text-white/70 outline-none focus:border-lab-accent/50 transition-colors cursor-pointer">
                  <option value="">All categories</option>
                  {Object.values(CATEGORY_CONFIG)
                    .map(c => c.label)
                    .filter((v, i, a) => a.indexOf(v) === i)
                    .map(label => <option key={label} value={label}>{label}</option>)}
                </select>
                <AnimatePresence>
                  {hasFilters && (
                    <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }} onClick={resetFilters}
                      className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10
                                 rounded-lg font-mono text-xs text-white/40 hover:text-white/70
                                 hover:border-white/20 transition-colors">
                      <RotateCcw size={11} /> Reset
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {Object.values(CATEGORY_CONFIG)
                  .filter((v, i, a) => a.findIndex(c => c.label === v.label) === i)
                  .map(config => (
                    <button key={config.label}
                      onClick={() => setActiveCategory(activeCategory === config.label ? null : config.label)}
                      className={cn(
                        'flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest transition-opacity',
                        activeCategory && activeCategory !== config.label ? 'opacity-15' : 'opacity-50 hover:opacity-100'
                      )}>
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: config.color }} />
                      {config.label}
                    </button>
                  ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── GRID ─────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 pb-2 scrollbar-hide">
        <div className="grid gap-[3px]"
          style={{ gridTemplateColumns: 'repeat(18, minmax(0, 1fr))', minWidth: 720 }}>
          {elements.map(el => {
            const hd = heatmapData?.[el.number];
            return (
              <ElementCell
                key={el.number}
                element={el}
                isActive={hoveredElement?.number === el.number}
                isDimmed={
                  viewMode === 'category' &&
                  filteredNumbers !== null &&
                  !filteredNumbers.has(el.number)
                }
                onHover={handleHover}
                onLeave={handleLeave}
                onTap={handleTap}
                isTouchDevice={isTouchDevice}
                heatmapColor={hd ? (hd.color ?? 'none') : null}
                heatmapValue={hd?.valueStr ?? null}
              />
            );
          })}
        </div>
      </div>

      <HoverPanel
        element={hoveredElement}
        position={panelPosition}
        isTouchDevice={isTouchDevice}
        onClose={handleClose}
        onShare={onShare ?? (() => {})}
      />

      {/* Stats bar — only visible in category mode */}
      {viewMode === 'category' && <TableStats elements={elements} />}
    </div>
  );
};
