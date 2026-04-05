import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wind, Layers, FlaskConical, User, Atom, X } from 'lucide-react';
import { Element } from '../types/element';
import { getCategoryConfig } from '../data/categoryConfig';

interface PanelPosition {
  top: number;
  left: number;
}

interface HoverPanelProps {
  element: Element | null;
  position: PanelPosition | null;
  isTouchDevice: boolean;
  onClose: () => void;
}

function PhaseIcon({ phase }: { phase: string }) {
  if (phase === 'Gas') return <Wind size={11} className="text-cyan-400" />;
  if (phase === 'Liquid') return <FlaskConical size={11} className="text-blue-400" />;
  if (phase === 'Solid') return <Layers size={11} className="text-orange-400" />;
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

function PanelContent({ element, config, onClose, isTouchDevice }: {
  element: Element;
  config: ReturnType<typeof getCategoryConfig>;
  onClose: () => void;
  isTouchDevice: boolean;
}) {
  const summary = element.summary ? element.summary.split('.')[0] + '.' : '—';

  return (
    <div
      className="rounded-xl border border-white/10 overflow-hidden"
      style={{
        background: 'rgba(8, 8, 8, 0.97)',
        backdropFilter: 'blur(16px)',
        boxShadow: `0 0 40px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05), 0 0 20px ${config.glowColor}`,
      }}
    >
      {/* Header */}
      <div
        className="px-4 pt-4 pb-3 border-b border-white/5"
        style={{ borderLeftColor: config.color, borderLeftWidth: 3 }}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="font-mono font-bold text-4xl leading-none" style={{ color: config.color }}>
              {element.symbol}
            </div>
            <div className="font-mono text-[9px] text-white/30 mt-1 uppercase tracking-widest">
              #{element.number}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-2">
              <div className="font-sans text-sm font-medium text-white/90 leading-tight text-right">
                {element.name}
              </div>
              {isTouchDevice && (
                <button
                  onClick={onClose}
                  className="flex-shrink-0 p-1 rounded-md bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
                >
                  <X size={13} />
                </button>
              )}
            </div>
            <div
              className="inline-block font-mono text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{
                background: `${config.color}22`,
                color: config.color,
                border: `1px solid ${config.color}44`,
              }}
            >
              {config.label}
            </div>
          </div>
        </div>
      </div>

      {/* Data rows */}
      <div className="px-4 py-3 space-y-2 border-b border-white/5">
        <DataRow label="Atomic mass" value={`${element.atomic_mass} u`} />
        <DataRow
          label="Phase (STP)"
          value={
            <span className="flex items-center gap-1 justify-end">
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
      </div>

      {/* Electron config */}
      {element.electron_configuration_semantic && (
        <div className="px-4 py-3 border-b border-white/5">
          <div className="font-mono text-[9px] uppercase tracking-widest text-white/30 mb-1.5">
            Electron config
          </div>
          <div className="font-mono text-[10px] text-white/60 break-all leading-relaxed">
            {element.electron_configuration_semantic}
          </div>
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {element.shells.map((count, i) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center gap-0.5">
                  <div
                    className="rounded-full"
                    style={{
                      width: 6 + count * 1.5,
                      height: 6 + count * 1.5,
                      background: `${config.color}33`,
                      border: `1px solid ${config.color}66`,
                    }}
                  />
                  <span className="font-mono text-[7px] text-white/25">{count}</span>
                </div>
                {i < element.shells.length - 1 && (
                  <div className="w-2 h-px bg-white/10 flex-shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="px-4 py-3 border-b border-white/5">
        <p className="font-sans text-[11px] text-white/40 leading-relaxed italic">
          "{summary}"
        </p>
      </div>

      {/* Discovery */}
      {element.discovered_by && (
        <div className="px-4 py-2.5 flex items-center gap-2">
          <User size={9} className="text-white/20 flex-shrink-0" />
          <span className="font-mono text-[9px] text-white/25 uppercase tracking-widest">
            {element.discovered_by}
          </span>
        </div>
      )}
    </div>
  );
}

export const HoverPanel: React.FC<HoverPanelProps> = ({
  element,
  position,
  isTouchDevice,
  onClose,
}) => {
  if (!element) return null;

  const config = getCategoryConfig(element.category);

  // ── MOBILE: bottom sheet ──────────────────────────────────────────────────
  if (isTouchDevice) {
    return (
      <>
        {/* Backdrop */}
        <AnimatePresence>
          {element && (
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={onClose}
            />
          )}
        </AnimatePresence>

        {/* Bottom sheet */}
        <AnimatePresence>
          {element && (
            <motion.div
              key={element.number}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[60] pointer-events-auto"
              style={{ maxHeight: '80vh' }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1"
                style={{ background: 'rgba(8,8,8,0.97)', borderRadius: '16px 16px 0 0', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="w-10 h-1 rounded-full bg-white/20" />
              </div>

              {/* Scrollable content */}
              <div
                className="overflow-y-auto overscroll-contain"
                style={{
                  maxHeight: 'calc(80vh - 24px)',
                  background: 'rgba(8,8,8,0.97)',
                  borderTop: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                {/* Header */}
                <div
                  className="px-5 pt-4 pb-3 border-b border-white/5"
                  style={{ borderLeftColor: config.color, borderLeftWidth: 3 }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-mono font-bold text-5xl leading-none" style={{ color: config.color }}>
                        {element.symbol}
                      </div>
                      <div className="font-mono text-[9px] text-white/30 mt-1 uppercase tracking-widest">
                        #{element.number}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <div className="flex items-center gap-3">
                        <div className="font-sans text-base font-medium text-white/90 leading-tight text-right">
                          {element.name}
                        </div>
                        <button
                          onClick={onClose}
                          className="flex-shrink-0 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div
                        className="inline-block font-mono text-[9px] uppercase tracking-widest px-2.5 py-0.5 rounded-full"
                        style={{
                          background: `${config.color}22`,
                          color: config.color,
                          border: `1px solid ${config.color}44`,
                        }}
                      >
                        {config.label}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Data rows */}
                <div className="px-5 py-4 space-y-3 border-b border-white/5">
                  <DataRow label="Atomic mass" value={`${element.atomic_mass} u`} />
                  <DataRow
                    label="Phase (STP)"
                    value={
                      <span className="flex items-center gap-1 justify-end">
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
                </div>

                {/* Electron config */}
                {element.electron_configuration_semantic && (
                  <div className="px-5 py-4 border-b border-white/5">
                    <div className="font-mono text-[9px] uppercase tracking-widest text-white/30 mb-2">
                      Electron config
                    </div>
                    <div className="font-mono text-[11px] text-white/60 break-all leading-relaxed">
                      {element.electron_configuration_semantic}
                    </div>
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      {element.shells.map((count, i) => (
                        <React.Fragment key={i}>
                          <div className="flex flex-col items-center gap-0.5">
                            <div
                              className="rounded-full"
                              style={{
                                width: 8 + count * 1.8,
                                height: 8 + count * 1.8,
                                background: `${config.color}33`,
                                border: `1px solid ${config.color}66`,
                              }}
                            />
                            <span className="font-mono text-[8px] text-white/25">{count}</span>
                          </div>
                          {i < element.shells.length - 1 && (
                            <div className="w-3 h-px bg-white/10 flex-shrink-0" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary */}
                <div className="px-5 py-4 border-b border-white/5">
                  <p className="font-sans text-xs text-white/40 leading-relaxed italic">
                    "{element.summary}"
                  </p>
                </div>

                {/* Discovery */}
                {element.discovered_by && (
                  <div className="px-5 py-3 flex items-center gap-2 pb-safe">
                    <User size={10} className="text-white/20 flex-shrink-0" />
                    <span className="font-mono text-[9px] text-white/25 uppercase tracking-widest">
                      Discovered by {element.discovered_by}
                    </span>
                  </div>
                )}

                {/* Safe area spacer for devices with home indicator */}
                <div className="h-6" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // ── DESKTOP: smart-positioned floating panel ──────────────────────────────
  return (
    <AnimatePresence mode="wait">
      {element && (
        <motion.div
          key={element.number}
          initial={{ opacity: 0, scale: 0.93, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 6 }}
          transition={{ duration: 0.13, ease: 'easeOut' }}
          className="fixed z-50 w-64 pointer-events-none"
          style={{
            top: position?.top ?? 0,
            left: position?.left ?? 0,
          }}
        >
          <PanelContent
            element={element}
            config={config}
            onClose={onClose}
            isTouchDevice={false}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};