import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wind, Layers, FlaskConical, User, Atom, X } from 'lucide-react';
import { Element } from '../types/element';
import { getCategoryConfig } from '../data/categoryConfig';
import { OrbitalDiagram } from './OrbitalDiagram';

interface PanelPosition { top: number; left: number; }

interface HoverPanelProps {
  element: Element | null;
  position: PanelPosition | null;
  isTouchDevice: boolean;
  onClose: () => void;
}

function PhaseIcon({ phase }: { phase: string }) {
  if (phase === 'Gas')    return <Wind size={11} className="text-cyan-400" />;
  if (phase === 'Liquid') return <FlaskConical size={11} className="text-blue-400" />;
  if (phase === 'Solid')  return <Layers size={11} className="text-orange-400" />;
  return <Atom size={11} className="text-gray-400" />;
}

function DataRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="font-mono text-[9px] uppercase tracking-widest text-white/30 whitespace-nowrap">
        {label}
      </span>
      <span className="font-mono text-[11px] text-white/70 text-right">{value}</span>
    </div>
  );
}

// ── Shared panel body (used by both mobile and desktop) ───────────────────────
function PanelBody({
  element,
  onClose,
  showClose,
  orbital,
}: {
  element: Element;
  onClose: () => void;
  showClose: boolean;
  orbital: { size: number };
}) {
  const config = getCategoryConfig(element.category);
  const summary = element.summary ? element.summary.split('.')[0] + '.' : '—';

  return (
    <>
      {/* Header */}
      <div
        className="px-5 pt-5 pb-4 border-b border-white/5"
        style={{ borderLeftColor: config.color, borderLeftWidth: 3 }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div
              className="font-mono font-bold leading-none"
              style={{ color: config.color, fontSize: 48 }}
            >
              {element.symbol}
            </div>
            <div className="font-mono text-[9px] text-white/25 mt-1 uppercase tracking-widest">
              #{element.number}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 pt-1">
            <div className="flex items-center gap-2">
              <div className="font-sans text-sm font-medium text-white/90 leading-tight text-right">
                {element.name}
              </div>
              {showClose && (
                <button
                  onClick={onClose}
                  className="flex-shrink-0 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/30 hover:text-white/70 transition-colors"
                >
                  <X size={13} />
                </button>
              )}
            </div>
            <div
              className="font-mono text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{
                background: `${config.color}18`,
                color: config.color,
                border: `1px solid ${config.color}33`,
              }}
            >
              {config.label}
            </div>
          </div>
        </div>
      </div>

      {/* Orbital diagram */}
      <div className="flex justify-center py-5 border-b border-white/5"
        style={{ background: 'rgba(0,0,0,0.2)' }}>
        <OrbitalDiagram element={element} size={orbital.size} />
      </div>

      {/* Data rows */}
      <div className="px-5 py-4 space-y-2.5 border-b border-white/5">
        <DataRow label="Atomic mass" value={`${element.atomic_mass} u`} />
        <DataRow
          label="Phase (STP)"
          value={
            <span className="flex items-center gap-1.5 justify-end">
              <PhaseIcon phase={element.phase} />
              {element.phase}
            </span>
          }
        />
        {element.melt !== null && (
          <DataRow label="Melting pt." value={`${element.melt} K`} />
        )}
        {element.boil !== null && (
          <DataRow label="Boiling pt." value={`${element.boil} K`} />
        )}
        {element.electronegativity_pauling !== null && (
          <DataRow label="Electronegativity" value={element.electronegativity_pauling} />
        )}
        {element.density !== null && (
          <DataRow label="Density" value={`${element.density} g/cm³`} />
        )}
      </div>

      {/* Electron config string */}
      {element.electron_configuration_semantic && (
        <div className="px-5 py-3.5 border-b border-white/5">
          <div className="font-mono text-[9px] uppercase tracking-widest text-white/25 mb-1.5">
            Configuration
          </div>
          <div className="font-mono text-[10px] text-white/50 break-all leading-relaxed">
            {element.electron_configuration_semantic}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="px-5 py-4 border-b border-white/5">
        <p className="font-sans text-[11px] text-white/35 leading-relaxed italic">
          "{summary}"
        </p>
      </div>

      {/* Discovery */}
      {element.discovered_by && (
        <div className="px-5 py-3 flex items-center gap-2">
          <User size={9} className="text-white/20 flex-shrink-0" />
          <span className="font-mono text-[9px] text-white/20 uppercase tracking-widest">
            Discovered by {element.discovered_by}
          </span>
        </div>
      )}

      {/* Safe area spacer */}
      <div className="h-4" />
    </>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export const HoverPanel: React.FC<HoverPanelProps> = ({
  element,
  position,
  isTouchDevice,
  onClose,
}) => {
  // ── MOBILE: bottom sheet with spring in + spring out ─────────────────────
  if (isTouchDevice) {
    return (
      <>
        {/* Backdrop — separate AnimatePresence so it fades independently */}
        <AnimatePresence>
          {element && (
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm"
              onClick={onClose}
            />
          )}
        </AnimatePresence>

        {/* Sheet — AnimatePresence must wrap the sheet so exit fires */}
        <AnimatePresence>
          {element && (
            <motion.div
              key={`sheet-${element.number}`}
              initial={{ y: '100%', opacity: 0.6 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0.6 }}
              transition={{
                y: { type: 'spring', damping: 30, stiffness: 320 },
                opacity: { duration: 0.2 },
              }}
              className="fixed bottom-0 left-0 right-0 z-[60] pointer-events-auto"
              style={{ maxHeight: '82vh' }}
            >
              {/* Drag handle bar */}
              <div
                className="flex justify-center pt-3 pb-0"
                style={{
                  background: 'rgba(10,10,10,0.98)',
                  borderRadius: '18px 18px 0 0',
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  borderLeft: '1px solid rgba(255,255,255,0.05)',
                  borderRight: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <div className="w-10 h-[3px] rounded-full bg-white/20 mb-2" />
              </div>

              {/* Scrollable body */}
              <div
                className="overflow-y-auto overscroll-contain"
                style={{
                  maxHeight: 'calc(82vh - 28px)',
                  background: 'rgba(10,10,10,0.98)',
                  borderLeft: '1px solid rgba(255,255,255,0.05)',
                  borderRight: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <PanelBody
                  element={element}
                  onClose={onClose}
                  showClose={true}
                  orbital={{ size: 200 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // ── DESKTOP: floating panel with smooth crossfade between elements ─────────
  return (
    <AnimatePresence mode="wait">
      {element && (
        <motion.div
          key={element.number}
          initial={{ opacity: 0, scale: 0.95, y: 8, filter: 'blur(4px)' }}
          animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.96, y: 4, filter: 'blur(3px)' }}
          transition={{
            opacity: { duration: 0.16 },
            scale: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
            y: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
            filter: { duration: 0.14 },
          }}
          className="fixed z-50 pointer-events-none"
          style={{
            top: position?.top ?? 0,
            left: position?.left ?? 0,
            width: 280,
          }}
        >
          <div
            className="rounded-2xl border border-white/8 overflow-hidden"
            style={{
              background: 'rgba(10,10,10,0.97)',
              backdropFilter: 'blur(20px)',
              boxShadow: `
                0 0 0 1px rgba(255,255,255,0.04),
                0 24px 48px rgba(0,0,0,0.7),
                0 0 30px ${getCategoryConfig(element.category).glowColor}
              `,
            }}
          >
            <PanelBody
              element={element}
              onClose={onClose}
              showClose={false}
              orbital={{ size: 160 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};