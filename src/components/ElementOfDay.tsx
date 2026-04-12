import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Atom } from 'lucide-react';
import { Element } from '../types/element';
import { getCategoryConfig } from '../data/categoryConfig';

interface ElementOfDayProps {
  element: Element;
  onExplore: () => void; // scrolls to table and opens the element
}

function DataPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-mono text-[8px] uppercase tracking-widest text-white/25">{label}</span>
      <span className="font-mono text-[11px] text-white/65">{value}</span>
    </div>
  );
}

// Format today's date as "Friday, April 10"
function todayLabel(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function ElementOfDay({ element, onExplore }: ElementOfDayProps) {
  const config = getCategoryConfig(element.category);
  const summary = element.summary
    ? element.summary.split('.').slice(0, 2).join('.') + '.'
    : '';

  return (
    <motion.section
      className="relative z-10 max-w-[1400px] mx-auto px-5 md:px-10"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div
        className="relative overflow-hidden rounded-2xl p-6 md:p-10"
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: `1px solid ${config.color}22`,
          boxShadow: `0 0 60px ${config.color}08`,
        }}
      >
        {/* Subtle color wash in top-right corner */}
        <div
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${config.color}12 0%, transparent 70%)`,
          }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8 md:gap-12">

          {/* Symbol block */}
          <div className="flex-shrink-0 flex flex-row md:flex-col items-center md:items-start gap-4 md:gap-2">
            <div
              className="font-mono font-bold leading-none select-none"
              style={{
                fontSize: 'clamp(64px, 10vw, 96px)',
                color: config.color,
                filter: `drop-shadow(0 0 24px ${config.color}55)`,
              }}
            >
              {element.symbol}
            </div>
            <div>
              <p className="font-sans font-medium text-lg text-white/80 leading-tight">
                {element.name}
              </p>
              <p className="font-mono text-[9px] uppercase tracking-widest mt-0.5"
                style={{ color: `${config.color}99` }}>
                {config.label}
              </p>
            </div>
          </div>

          {/* Divider — horizontal on mobile, vertical on desktop */}
          <div
            className="hidden md:block self-stretch w-px flex-shrink-0"
            style={{ background: `${config.color}18` }}
          />
          <div
            className="md:hidden h-px w-full"
            style={{ background: `${config.color}18` }}
          />

          {/* Info block */}
          <div className="flex-1 flex flex-col gap-5">
            {/* Label */}
            <div className="flex items-center gap-2">
              <Atom size={11} style={{ color: config.color }} />
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/25">
                Element of the day — {todayLabel()}
              </span>
            </div>

            {/* Summary */}
            {summary && (
              <p className="font-sans text-sm text-white/45 leading-relaxed max-w-2xl">
                {summary}
              </p>
            )}

            {/* Data row */}
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              <DataPill label="Atomic number" value={`#${element.number}`} />
              <DataPill label="Atomic mass" value={`${element.atomic_mass} u`} />
              <DataPill label="Phase (STP)" value={element.phase} />
              {element.electronegativity_pauling !== null && (
                <DataPill label="Electronegativity" value={String(element.electronegativity_pauling)} />
              )}
              {element.melt !== null && (
                <DataPill label="Melting point" value={`${element.melt} K`} />
              )}
              {element.electron_configuration_semantic && (
                <DataPill label="Configuration" value={element.electron_configuration_semantic} />
              )}
            </div>

            {/* CTA */}
            <div>
              <button
                onClick={onExplore}
                className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest transition-all hover:gap-3"
                style={{ color: config.color }}
              >
                Explore {element.name} in the table
                <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
