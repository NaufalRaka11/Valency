import React from 'react';
import { ExternalLink } from 'lucide-react';
import { PeriodicTable } from './components/PeriodicTable';

export default function App() {
  return (
    <div className="min-h-screen bg-lab-bg text-lab-ink overflow-x-hidden font-sans">
      {/* Scanline overlay */}
      <div className="scanline fixed inset-0 z-40 pointer-events-none opacity-[0.12]" />

      {/* Dot grid background */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.035) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Ambient glow blobs */}
      <div className="fixed top-1/4 -left-32 w-96 h-96 bg-lab-accent/5 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-1/4 -right-32 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none z-0" />

      <main className="relative z-10 max-w-[1400px] mx-auto px-6 py-10 md:py-16 space-y-10">

        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <header>
          {/* Top bar: parent brand */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
            <a
              href="https://ntanglement.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 group"
            >
              {/* N-mark logo */}
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,255,157,0.15), rgba(0,255,157,0.05))',
                  border: '1px solid rgba(0,255,157,0.25)',
                }}
              >
                <span
                  className="font-mono font-bold text-sm leading-none"
                  style={{ color: '#00ff9d' }}
                >
                  N
                </span>
              </div>
              <span className="font-mono text-xs tracking-widest uppercase text-white/40 group-hover:text-white/70 transition-colors">
                Ntanglement
              </span>
            </a>

            {/* Right: version pill */}
            <div className="flex items-center gap-3">
              <span
                className="font-mono text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{
                  background: 'rgba(0,255,157,0.08)',
                  border: '1px solid rgba(0,255,157,0.2)',
                  color: 'rgba(0,255,157,0.7)',
                }}
              >
                v0.1.0 — beta
              </span>
            </div>
          </div>

          {/* Product identity */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="space-y-3">
              {/* Product label */}
              <div className="flex items-center gap-2">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: '#00ff9d' }}
                />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">
                  Ntanglement / Product
                </span>
              </div>

              {/* Product name */}
              <div className="flex items-baseline gap-4">
                <h1
                  className="text-6xl md:text-8xl font-bold font-mono tracking-tighter uppercase leading-none"
                  style={{ letterSpacing: '-0.04em' }}
                >
                  Valency
                </h1>
                <span className="font-mono text-sm text-white/20 hidden md:block">
                  — periodic table
                </span>
              </div>

              {/* Tagline */}
              <p className="text-white/35 text-sm leading-relaxed font-sans max-w-md">
                An interactive reference for the elements. Hover to explore
                properties, configurations, and physical data.
              </p>
            </div>

            {/* Right: stat pills */}
            <div className="flex flex-wrap gap-2 md:flex-col md:items-end md:gap-2">
              {[
                { label: 'Elements', value: '118' },
                { label: 'Properties', value: '12+' },
                { label: 'Categories', value: '11' },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <span className="font-mono font-bold text-sm" style={{ color: '#00ff9d' }}>
                    {value}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-white/30">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </header>

        {/* ── TABLE ──────────────────────────────────────────────────────── */}
        <section className="glass rounded-2xl p-4 md:p-8 border-white/5">
          <PeriodicTable />
        </section>

        {/* ── FOOTER ─────────────────────────────────────────────────────── */}
        <footer className="border-t border-white/5 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">

            {/* Left: brand signature */}
            <div className="flex items-center gap-3">
              <div
                className="w-6 h-6 rounded flex items-center justify-center"
                style={{
                  background: 'rgba(0,255,157,0.08)',
                  border: '1px solid rgba(0,255,157,0.15)',
                }}
              >
                <span className="font-mono font-bold text-xs" style={{ color: '#00ff9d' }}>N</span>
              </div>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-white/20">
                  Valency — an Ntanglement product
                </p>
                <p className="font-mono text-[8px] text-white/10 mt-0.5">
                  © {new Date().getFullYear()} Ntanglement. All rights reserved.
                </p>
              </div>
            </div>

            {/* Right: links */}
            <div className="flex items-center gap-5">
              {[
                { label: 'Ntanglement', href: 'https://ntanglement.dev' },
                { label: 'Data source', href: 'https://github.com/Bowserinator/Periodic-Table-JSON' },
              ].map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest text-white/20 hover:text-white/50 transition-colors"
                >
                  {label}
                  <ExternalLink size={8} />
                </a>
              ))}
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
}