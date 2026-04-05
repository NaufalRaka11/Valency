import React from 'react';
import { Atom } from 'lucide-react';
import { PeriodicTable } from './components/PeriodicTable';

export default function App() {
  return (
    <div className="min-h-screen bg-lab-bg text-lab-ink overflow-x-hidden font-sans">
      {/* Scanline overlay */}
      <div className="scanline fixed inset-0 z-40 pointer-events-none opacity-[0.15]" />

      {/* Dot grid background */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Ambient glow blobs */}
      <div className="fixed top-1/4 -left-32 w-96 h-96 bg-lab-accent/5 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-1/4 -right-32 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none z-0" />

      <main className="relative z-10 max-w-[1400px] mx-auto px-6 py-12 md:py-20 space-y-10">
        {/* Header */}
        <header className="space-y-3 text-center">
          <div className="flex items-center justify-center gap-2 text-lab-accent font-mono text-[10px] uppercase tracking-[0.2em] opacity-70">
            <Atom size={12} />
            Interactive Reference // Module 01
          </div>
          <h1 className="text-5xl md:text-7xl font-bold font-mono tracking-tighter uppercase leading-none">
            Periodic Table
          </h1>
          <p className="text-white/40 max-w-xl mx-auto text-sm leading-relaxed font-sans">
            Hover any element to explore its properties, electron configuration,
            and physical data.
          </p>
        </header>

        {/* Table */}
        <section className="glass rounded-2xl p-4 md:p-8 border-white/5">
          <PeriodicTable />
        </section>

        {/* Footer */}
        <footer className="text-center border-t border-white/5 pt-8">
          <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/20">
            © {new Date().getFullYear()} — Valency Interactive Periodic Table // Data via Bowserinator
          </p>
        </footer>
      </main>
    </div>
  );
}