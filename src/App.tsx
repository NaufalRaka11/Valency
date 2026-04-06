import React from 'react';
import { ExternalLink } from 'lucide-react';
import { PeriodicTable } from './components/PeriodicTable';

// Ntanglement icon inlined as JSX — preserves SVG animations
function NtanglementIcon({ size = 28 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 600 600"
      width={size}
      height={size}
      style={{ flexShrink: 0 }}
    >
      <defs>
        <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#0f2027" />
          <stop offset="100%" stopColor="#01030a" />
        </radialGradient>
        <linearGradient id="nGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00f5ff" />
          <stop offset="100%" stopColor="#0066ff" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width="600" height="600" fill="url(#bgGrad)" rx="80" />

      <text
        x="300" y="360"
        textAnchor="middle"
        fontSize="260"
        fontFamily="Orbitron, monospace"
        fill="url(#nGrad)"
        filter="url(#glow)"
      >
        N
      </text>

      <path
        id="hdrOrbit"
        d="M115 240 A220 120 -20 1 1 485 360 A220 120 -20 1 1 115 240"
        fill="none"
        stroke="#00eaff"
        strokeWidth="2.5"
        strokeDasharray="6 6"
        opacity="0.6"
        filter="url(#glow)"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="0" to="-60"
          dur="3s"
          repeatCount="indefinite"
        />
      </path>

      <circle r="18" fill="#00ffff" filter="url(#glow)">
        <animateMotion dur="6s" repeatCount="indefinite" rotate="auto">
          <mpath href="#hdrOrbit" />
        </animateMotion>
      </circle>

      <circle r="18" fill="#ff00ff" filter="url(#glow)">
        <animateMotion dur="6s" begin="3s" repeatCount="indefinite" rotate="auto">
          <mpath xlinkHref="#hdrOrbit" />
        </animateMotion>
      </circle>
    </svg>
  );
}

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
              className="flex items-center gap-2.5 group"
            >
              <NtanglementIcon size={32} />
              <div>
                <span className="block font-mono text-xs tracking-widest uppercase text-white/50 group-hover:text-white/80 transition-colors">
                  Ntanglement
                </span>
                <span className="block font-mono text-[8px] tracking-widest uppercase text-white/20">
                  Digital Laboratory
                </span>
              </div>
            </a>

            {/* Version pill */}
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

          {/* Product identity */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#00ff9d' }} />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/25">
                  Ntanglement / Product 01
                </span>
              </div>

              <div className="flex items-baseline gap-4">
                <h1
                  className="text-6xl md:text-8xl font-bold font-mono uppercase leading-none"
                  style={{ letterSpacing: '-0.04em' }}
                >
                  Valency
                </h1>
                <span className="font-mono text-sm text-white/15 hidden md:block">
                  — periodic table
                </span>
              </div>

              <p className="text-white/35 text-sm leading-relaxed font-sans max-w-md">
                An interactive reference for the 118 elements. Hover to explore
                properties, electron configurations, and physical data.
              </p>
            </div>

            {/* Stat pills */}
            <div className="flex flex-wrap gap-2 md:flex-col md:items-end">
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
            <div className="flex items-center gap-3">
              <NtanglementIcon size={22} />
              <div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-white/20">
                  Valency — an Ntanglement product
                </p>
                <p className="font-mono text-[8px] text-white/10 mt-0.5">
                  © {new Date().getFullYear()} Ntanglement. All rights reserved.
                </p>
              </div>
            </div>

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