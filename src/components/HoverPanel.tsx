import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wind, Layers, FlaskConical, Atom, X, Link, User,
  Weight, Thermometer, Droplets, Zap, Scale,
} from 'lucide-react';
import { Element } from '../types/element';
import { getCategoryConfig } from '../data/categoryConfig';
import { OrbitalDiagram } from './OrbitalDiagram';
import { getSpectrum, SPECTRUM_RANGE } from '../data/spectrumData';
import { wavelengthToColor } from '../lib/wavelengthToColor';

interface PanelPosition { top: number; left: number; }
const SITE_URL = 'https://valency-ntanglement.vercel.app';

interface HoverPanelProps {
  element: Element | null;
  position: PanelPosition | null;
  isTouchDevice: boolean;
  onClose: () => void;
  onShare: (message: string) => void; // triggers toast in parent
}

const SHELL_NAMES = ['K', 'L', 'M', 'N', 'O', 'P', 'Q'];

// Phase icon + label centered
function PhaseValue({ phase }: { phase: string }) {
  const icon = phase === 'Gas'
    ? <Wind size={11} className="text-sky-400 flex-shrink-0" />
    : phase === 'Liquid'
    ? <FlaskConical size={11} className="text-blue-400 flex-shrink-0" />
    : phase === 'Solid'
    ? <Layers size={11} className="text-orange-400 flex-shrink-0" />
    : <Atom size={11} className="text-white/30 flex-shrink-0" />;

  return (
    <span className="flex items-center gap-1.5">
      {icon}
      <span>{phase}</span>
    </span>
  );
}

// Data card with icon, label, value
function DataCard({
  icon, label, value, sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub?: string;
}) {
  return (
    <div
      className="p-3 rounded-md flex flex-col gap-1"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Icon + label row */}
      <div className="flex items-center gap-1.5">
        <span className="opacity-40 flex-shrink-0">{icon}</span>
        <span className="font-mono text-[8px] uppercase tracking-widest text-white/25 leading-none">
          {label}
        </span>
      </div>
      {/* Value */}
      <div className="font-mono text-[11px] font-medium text-white/70 flex items-center gap-1.5">
        {value}
      </div>
      {sub && (
        <span className="font-mono text-[8px] text-white/20">{sub}</span>
      )}
    </div>
  );
}

// Spectral emission line bar — real NIST data where available
function SpectralBar({ symbol }: { symbol: string }) {
  const lines = getSpectrum(symbol);
  const hasData = lines !== null && lines.length > 0;
  const { min, max } = SPECTRUM_RANGE; // 380–750 nm
  const rangeSpan = max - min;

  // For dense spectra (e.g. Fe with 316 lines) only render lines above
  // a minimum intensity threshold so the bar stays readable.
  const MIN_INTENSITY = hasData && lines!.length > 60 ? 0.08
    : hasData && lines!.length > 20 ? 0.03
    : 0;

  const visibleLines = hasData
    ? lines!.filter(l => l.intensity >= MIN_INTENSITY)
    : [];

  return (
    <div>
      {/* Bar */}
      <div
        className="relative w-full rounded-sm overflow-hidden"
        style={{ background: 'rgba(0,0,0,0.5)', height: 40 }}
      >
        {/* Very faint rainbow wash to set the context */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ background: 'linear-gradient(to right, #8b5cf6, #3b82f6, #22c55e, #eab308, #f97316, #ef4444)' }}
        />

        {hasData ? (
          visibleLines.map((line, i) => {
            const xPct = ((line.wavelength_nm - min) / rangeSpan) * 100;
            // Height: intensity drives 30–100% of bar height
            const heightPct = 30 + line.intensity * 70;
            // Width: brightest lines get 2px, faint lines 1px
            const width = line.intensity > 0.5 ? 2 : 1;
            const lineColor = wavelengthToColor(line.wavelength_nm);
            return (
              <div
                key={i}
                className="absolute bottom-0"
                style={{
                  left: `${xPct}%`,
                  width: `${width}px`,
                  height: `${heightPct}%`,
                  background: lineColor,
                  opacity: 0.25 + line.intensity * 0.75,
                  boxShadow: line.intensity > 0.3
                    ? `0 0 ${3 + line.intensity * 4}px ${lineColor}`
                    : 'none',
                }}
              />
            );
          })
        ) : (
          // No data — show a muted placeholder with a label
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-[8px] text-white/15 uppercase tracking-widest">
              No NIST data available
            </span>
          </div>
        )}
      </div>

      {/* nm scale labels */}
      <div className="flex justify-between px-0 mt-1">
        {[380, 450, 520, 590, 660, 750].map(nm => (
          <span key={nm} className="font-mono text-[6px] text-white/15">{nm}</span>
        ))}
      </div>

      {/* Source credit */}
      {hasData && (
        <p className="font-mono text-[6px] text-white/10 uppercase tracking-widest mt-0.5 text-right">
          Source: NIST ASD
        </p>
      )}
    </div>
  );
}

// ── Shared panel body ─────────────────────────────────────────────────────────
function PanelBody({
  element, onClose, showClose, orbitalSize, onShare,
}: {
  element: Element;
  onClose: () => void;
  showClose: boolean;
  orbitalSize: number;
  onShare: (message: string) => void;
}) {
  const config  = getCategoryConfig(element.category);
  const summary = element.summary ? element.summary.split('.').slice(0, 2).join('.') + '.' : '';

  const handleShare = () => {
    const url = `${SITE_URL}?element=${element.symbol}`;
    navigator.clipboard.writeText(url).then(() => {
      onShare(`Link copied — share ${element.name} (${element.symbol})`);
    }).catch(() => {
      // Fallback for browsers that block clipboard without HTTPS
      onShare('Copy this: ' + url);
    });
  };

  return (
    <div className="flex flex-col">

      {/* ── Header ── */}
      <div
        className="px-5 pt-5 pb-4"
        style={{
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          borderLeft: `3px solid ${config.color}`,
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div
              className="font-mono font-bold leading-none"
              style={{ fontSize: 52, color: config.color, filter: `drop-shadow(0 0 20px ${config.color}55)` }}
            >
              {element.symbol}
            </div>
            <div className="font-mono text-[9px] text-white/25 mt-0.5 uppercase tracking-widest">
              #{element.number}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="font-sans text-sm font-medium text-white/85 text-right">
                {element.name}
              </span>
              <button
                onClick={handleShare}
                title="Copy shareable link"
                className="flex items-center gap-1 px-2 py-1.5 rounded-md font-mono text-[9px] uppercase tracking-widest transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.35)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
              >
                <Link size={10} />
                Share
              </button>
              {showClose && (
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-md transition-colors"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}
                >
                  <X size={11} />
                </button>
              )}
            </div>
            <span
              className="font-mono text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-sm"
              style={{ background: `${config.color}14`, color: config.color, border: `1px solid ${config.color}30` }}
            >
              {config.label}
            </span>
          </div>
        </div>
      </div>

      {/* ── Bento data grid ── */}
      <div
        className="px-4 py-4 grid grid-cols-2 gap-2"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <DataCard
          icon={<Weight size={11} />}
          label="Atomic mass"
          value={`${element.atomic_mass} u`}
        />
        <DataCard
          icon={<Atom size={11} />}
          label="Phase (STP)"
          value={<PhaseValue phase={element.phase} />}
        />
        {element.melt !== null && (
          <DataCard
            icon={<Thermometer size={11} />}
            label="Melting pt."
            value={`${element.melt} K`}
          />
        )}
        {element.boil !== null && (
          <DataCard
            icon={<Droplets size={11} />}
            label="Boiling pt."
            value={`${element.boil} K`}
          />
        )}
        {element.electronegativity_pauling !== null && (
          <DataCard
            icon={<Zap size={11} />}
            label="Electronegativity"
            value={element.electronegativity_pauling}
            sub="Pauling scale"
          />
        )}
        {element.density !== null && (
          <DataCard
            icon={<Scale size={11} />}
            label="Density"
            value={`${element.density}`}
            sub="g/cm³"
          />
        )}
      </div>

      {/* ── Shells + orbital diagram ── */}
      <div
        className="px-4 py-4 flex gap-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex-1 flex flex-col gap-1.5 min-w-0">
          <p className="font-mono text-[8px] uppercase tracking-widest text-white/25 mb-1">
            Electron shells
          </p>
          {element.shells.map((count, i) => {
            const isValence = i === element.shells.length - 1;
            return (
              <div
                key={i}
                className="flex items-center justify-between px-2 py-1.5 rounded-sm"
                style={{
                  background: isValence ? `${config.color}10` : 'rgba(255,255,255,0.03)',
                  borderLeft: isValence ? `2px solid ${config.color}60` : '2px solid rgba(255,255,255,0.06)',
                }}
              >
                <span
                  className="font-mono text-[9px] uppercase tracking-widest"
                  style={{ color: isValence ? config.color : 'rgba(255,255,255,0.30)' }}
                >
                  {SHELL_NAMES[i] ?? `n=${i + 1}`} shell
                </span>
                <span
                  className="font-mono text-[11px] font-medium"
                  style={{ color: isValence ? config.color : 'rgba(255,255,255,0.55)' }}
                >
                  {count}
                </span>
              </div>
            );
          })}
          {element.electron_configuration_semantic && (
            <div className="mt-1.5">
              <p className="font-mono text-[8px] text-white/20 uppercase tracking-widest mb-0.5">
                Notation
              </p>
              <code
                className="font-mono text-[10px] break-all leading-relaxed"
                style={{ color: 'rgba(137,152,240,0.8)' }}
              >
                {element.electron_configuration_semantic}
              </code>
            </div>
          )}
        </div>

        <div className="flex-shrink-0">
          <OrbitalDiagram element={element} size={orbitalSize} />
        </div>
      </div>

      {/* ── Spectral bar ── */}
      <div
        className="px-4 py-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <p className="font-mono text-[8px] uppercase tracking-widest text-white/25 mb-2">
          Emission spectrum
        </p>
        <SpectralBar symbol={element.symbol} />
      </div>

      {/* ── Summary ── */}
      {summary && (
        <div
          className="px-4 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="font-sans text-[11px] text-white/35 leading-relaxed italic">
            "{summary}"
          </p>
        </div>
      )}

      {/* ── Discovery ── */}
      {element.discovered_by && (
        <div className="px-4 py-3 flex items-center gap-2">
          <User size={9} className="text-white/18 flex-shrink-0" />
          <span className="font-mono text-[9px] text-white/20 uppercase tracking-widest">
            {element.discovered_by}
          </span>
        </div>
      )}

      <div className="h-2" />
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export const HoverPanel: React.FC<HoverPanelProps> = ({
  element, position, isTouchDevice, onClose, onShare,
}) => {

  // ── MOBILE bottom sheet ───────────────────────────────────────────────────
  if (isTouchDevice) {
    return (
      <>
        <AnimatePresence>
          {element && (
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              // z-[70] — above scanline (z-40), nav (z-20), footer (z-0)
              className="fixed inset-0 z-[70] bg-black/65 backdrop-blur-sm"
              onClick={onClose}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {element && (
            <motion.div
              key={`sheet-${element.number}`}
              initial={{ y: '100%', opacity: 0.7 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0.7 }}
              transition={{
                y: { type: 'spring', damping: 30, stiffness: 320 },
                opacity: { duration: 0.18 },
              }}
              // z-[80] — above backdrop
              className="fixed bottom-0 left-0 right-0 z-[80] pointer-events-auto"
              style={{ maxHeight: '84vh' }}
            >
              <div
                className="flex justify-center pt-3 pb-0"
                style={{
                  background: 'rgba(10,10,10,0.98)',
                  borderRadius: '16px 16px 0 0',
                  borderTop: `1px solid ${getCategoryConfig(element.category).color}30`,
                }}
              >
                <div className="w-10 h-[3px] rounded-full bg-white/15 mb-2" />
              </div>
              <div
                className="overflow-y-auto overscroll-contain"
                style={{ maxHeight: 'calc(84vh - 28px)', background: 'rgba(10,10,10,0.98)' }}
              >
                <PanelBody element={element} onClose={onClose} showClose orbitalSize={130} onShare={onShare} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  // ── DESKTOP floating panel ────────────────────────────────────────────────
  return (
    <AnimatePresence mode="wait">
      {element && (
        <motion.div
          key={element.number}
          initial={{ opacity: 0, scale: 0.95, y: 8, filter: 'blur(4px)' }}
          animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.96, y: 4, filter: 'blur(3px)' }}
          transition={{
            opacity: { duration: 0.15 },
            scale: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
            y: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
            filter: { duration: 0.13 },
          }}
          // z-[60] — above scanline (z-40) and nav (z-20), below nothing
          className="fixed z-[60] pointer-events-none overflow-hidden rounded-xl"
          style={{
            top: position?.top ?? 0,
            left: position?.left ?? 0,
            width: 300,
            background: 'rgba(10,10,10,0.97)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${getCategoryConfig(element.category).color}22`,
            boxShadow: `0 0 0 1px rgba(255,255,255,0.04), 0 24px 48px rgba(0,0,0,0.8), 0 0 30px ${getCategoryConfig(element.category).glowColor}`,
          }}
        >
          <PanelBody element={element} onClose={onClose} showClose={false} orbitalSize={120} onShare={onShare} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
