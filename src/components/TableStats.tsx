import React from 'react';
import { motion } from 'motion/react';
import { Element } from '../types/element';

interface TableStatsProps {
  elements: Element[];
}

export function TableStats({ elements }: TableStatsProps) {
  if (elements.length === 0) return null;

  const solids  = elements.filter(e => e.phase === 'Solid').length;
  const gases   = elements.filter(e => e.phase === 'Gas').length;
  const liquids = elements.filter(e => e.phase === 'Liquid').length;

  const enVals = elements
    .map(e => e.electronegativity_pauling)
    .filter((v): v is number => v !== null);
  const enMin  = Math.min(...enVals).toFixed(2);
  const enMax  = Math.max(...enVals).toFixed(2);

  const densityVals = elements
    .map(e => e.density)
    .filter((v): v is number => v !== null);
  const densMax = Math.max(...densityVals).toFixed(1);

  // Most recently confirmed synthetic element
  const synthetic = elements.filter(e => e.number >= 104);
  const newest    = synthetic[synthetic.length - 1];

  return (
    <motion.div
      className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      {/* Phase at STP */}
      <div
        className="p-5 rounded-lg"
        style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/30 mb-3">
          Phase at STP
        </p>
        <div className="space-y-2">
          {[
            { label: 'Solid', count: solids, pct: (solids / 118) * 100, color: '#f97316' },
            { label: 'Gas', count: gases, pct: (gases / 118) * 100, color: '#38bdf8' },
            { label: 'Liquid', count: liquids, pct: (liquids / 118) * 100, color: '#60a5fa' },
          ].map(({ label, count, pct, color }) => (
            <div key={label}>
              <div className="flex justify-between font-mono text-[9px] mb-1">
                <span className="text-white/35">{label}</span>
                <span className="text-white/55">{count}</span>
              </div>
              <div className="h-[3px] rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: color }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${pct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Electronegativity */}
      <div
        className="p-5 rounded-lg relative overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/30 mb-3">
          Electronegativity
        </p>
        <p className="font-mono font-bold text-xl text-white/80 leading-none">
          {enMin}
          <span className="text-white/25 text-sm mx-1">–</span>
          {enMax}
        </p>
        <p className="font-mono text-[9px] text-white/25 mt-1.5 uppercase tracking-widest">
          Pauling scale
        </p>
        {/* Mini gradient bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px]"
          style={{ background: 'linear-gradient(to right, #1e3a5f, #38bdf8, #fde047)' }} />
      </div>

      {/* Density range */}
      <div
        className="p-5 rounded-lg relative overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/30 mb-3">
          Densest element
        </p>
        <p className="font-mono font-bold text-xl text-white/80 leading-none">
          {densMax}
        </p>
        <p className="font-mono text-[9px] text-white/25 mt-1.5 uppercase tracking-widest">
          g/cm³ · Osmium
        </p>
        <div className="absolute bottom-0 left-0 right-0 h-[2px]"
          style={{ background: 'linear-gradient(to right, #0891b2, #8b5cf6, #e879f9)' }} />
      </div>

      {/* Latest element */}
      {newest && (
        <div
          className="p-5 rounded-lg relative overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/30 mb-3">
            Latest element
          </p>
          <p className="font-mono font-bold text-xl text-white/80 leading-none">
            {newest.symbol}
          </p>
          <p className="font-mono text-[9px] text-white/25 mt-1.5 uppercase tracking-widest">
            #{newest.number} · {newest.name}
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-[2px]"
            style={{ background: 'linear-gradient(to right, #14b8a6, #6ee7b7)' }} />
        </div>
      )}
    </motion.div>
  );
}
