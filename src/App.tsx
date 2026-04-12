import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink, ArrowDown } from 'lucide-react';
import { motion } from 'motion/react';
import { Element } from './types/element';
import { PeriodicTable } from './components/PeriodicTable';
import { ElementOfDay } from './components/ElementOfDay';
import { useElementOfDay } from './hooks/useElementOfDay';
import { Toast } from './components/Toast';
import { useToast } from './hooks/useToast';
import { useUrlState } from './hooks/useUrlState';

// ── Ntanglement icon ─────────────────────────────────────────────────────────
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
        <filter id="iconGlow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width="600" height="600" fill="url(#bgGrad)" rx="80" />
      <text x="300" y="360" textAnchor="middle" fontSize="260"
        fontFamily="Orbitron, monospace" fill="url(#nGrad)" filter="url(#iconGlow)">N</text>
      <path id="hdrOrbit"
        d="M115 240 A220 120 -20 1 1 485 360 A220 120 -20 1 1 115 240"
        fill="none" stroke="#00eaff" strokeWidth="2.5"
        strokeDasharray="6 6" opacity="0.6" filter="url(#iconGlow)">
        <animate attributeName="stroke-dashoffset" from="0" to="-60" dur="3s" repeatCount="indefinite" />
      </path>
      <circle r="18" fill="#00ffff" filter="url(#iconGlow)">
        <animateMotion dur="6s" repeatCount="indefinite" rotate="auto">
          <mpath href="#hdrOrbit" />
        </animateMotion>
      </circle>
      <circle r="18" fill="#ff00ff" filter="url(#iconGlow)">
        <animateMotion dur="6s" begin="3s" repeatCount="indefinite" rotate="auto">
          <mpath xlinkHref="#hdrOrbit" />
        </animateMotion>
      </circle>
    </svg>
  );
}

// ── Particle canvas ───────────────────────────────────────────────────────────
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const COLORS = ['#00ff9d', '#00eaff', '#60a5fa', '#a78bfa', '#f472b6'];
    interface Atom {
      x: number; y: number; vx: number; vy: number;
      r: number; color: string; opacity: number;
      rings: { r: number; speed: number; angle: number; eR: number }[];
    }
    const W = () => canvas.offsetWidth;
    const H = () => canvas.offsetHeight;

    const makeAtom = (): Atom => {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      return {
        x: Math.random() * W(), y: Math.random() * H(),
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: 2.5 + Math.random() * 2,
        color,
        opacity: 0.1 + Math.random() * 0.15,
        rings: Array.from({ length: Math.random() < 0.4 ? 2 : 1 }, (_, i) => ({
          r: 14 + i * 12 + Math.random() * 6,
          speed: (Math.random() * 0.4 + 0.2) * (Math.random() < 0.5 ? 1 : -1),
          angle: Math.random() * Math.PI * 2,
          eR: 2 + Math.random() * 1.5,
        })),
      };
    };

    const atoms: Atom[] = Array.from(
      { length: Math.min(20, Math.floor((W() * H()) / 20000)) },
      makeAtom
    );

    let last = 0;
    const tick = (ts: number) => {
      const dt = Math.min(ts - last, 32);
      last = ts;
      const w = W(), h = H();
      ctx.clearRect(0, 0, w, h);

      for (const atom of atoms) {
        atom.x += atom.vx * dt * 0.1;
        atom.y += atom.vy * dt * 0.1;
        if (atom.x < -60) atom.x = w + 60;
        if (atom.x > w + 60) atom.x = -60;
        if (atom.y < -60) atom.y = h + 60;
        if (atom.y > h + 60) atom.y = -60;

        ctx.save();
        ctx.globalAlpha = atom.opacity;
        const hex = atom.color.replace('#', '');
        const rC = parseInt(hex.slice(0, 2), 16);
        const gC = parseInt(hex.slice(2, 4), 16);
        const bC = parseInt(hex.slice(4, 6), 16);

        for (const ring of atom.rings) {
          ring.angle += ring.speed * dt * 0.001;
          ctx.beginPath();
          ctx.arc(atom.x, atom.y, ring.r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${rC},${gC},${bC},0.22)`;
          ctx.lineWidth = 0.6;
          ctx.setLineDash([3, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
          const ex = atom.x + ring.r * Math.cos(ring.angle);
          const ey = atom.y + ring.r * Math.sin(ring.angle);
          ctx.beginPath();
          ctx.arc(ex, ey, ring.eR, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rC},${gC},${bC},0.85)`;
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(atom.x, atom.y, atom.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rC},${gC},${bC},0.65)`;
        ctx.fill();
        ctx.restore();
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function App() {
  const tableRef = useRef<HTMLDivElement>(null);
  const { toast, show: showToast, dismiss: dismissToast } = useToast();
  const { selectedSymbol } = useUrlState();

  // Fetch elements once here — shared between ElementOfDay and PeriodicTable
  const [elements, setElements] = useState<Element[]>([]);
  useEffect(() => {
    fetch('/elements.json')
      .then(r => r.json())
      .then(data => setElements(data.elements))
      .catch(err => console.error('Failed to load elements.json:', err));
  }, []);

  const elementOfDay = useElementOfDay(elements);

  const scrollToTable = () =>
    tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Scroll to table AND set the URL param so the panel auto-opens
  const handleExploreElementOfDay = (element: Element) => {
    scrollToTable();
    const params = new URLSearchParams(window.location.search);
    params.set('element', element.symbol);
    window.history.replaceState(null, '', `?${params}`);
    // Small delay so the table has scrolled into view before the panel opens
    setTimeout(() => window.dispatchEvent(new PopStateEvent('popstate')), 350);
  };

  return (
    <div className="min-h-screen bg-lab-bg text-lab-ink overflow-x-hidden font-sans">
      {/* Scanline */}
      <div className="scanline fixed inset-0 z-[30] pointer-events-none opacity-[0.10]" />

      {/* Dot grid */}
      <div className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Ambient blobs */}
      <div className="fixed top-1/4 -left-32 w-80 h-80 md:w-96 md:h-96 bg-lab-accent/[0.04] blur-[130px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-1/3 -right-32 w-80 h-80 md:w-96 md:h-96 bg-blue-500/[0.04] blur-[130px] rounded-full pointer-events-none z-0" />

      {/* ── NAV ───────────────────────────────────────────────────────────── */}
      <nav className="relative z-20 flex items-center justify-between px-5 md:px-10 py-4 border-b border-white/[0.05]">
        <a href="https://ntanglement.dev" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2.5 group">
          <NtanglementIcon size={30} />
          <div>
            <span className="block font-mono text-[11px] tracking-widest uppercase text-white/45 group-hover:text-white/75 transition-colors">
              Ntanglement
            </span>
            <span className="block font-mono text-[8px] tracking-widest uppercase text-white/18">
              Digital Laboratory
            </span>
          </div>
        </a>
        <div className="flex items-center gap-2.5">
          <span className="hidden sm:block font-mono text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(0,255,157,0.08)', border: '1px solid rgba(0,255,157,0.18)', color: 'rgba(0,255,157,0.65)' }}>
            v0.1 — beta
          </span>
          <button onClick={scrollToTable}
            className="font-mono text-[10px] uppercase tracking-widest px-4 py-2 rounded-lg text-white/55 hover:text-white/85 transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            Open table
          </button>
        </div>
      </nav>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative z-10 min-h-[90vh] flex flex-col items-center justify-center px-5 text-center overflow-hidden">
        <ParticleCanvas />
        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center gap-7">

          <motion.div className="flex items-center gap-2"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#00ff9d' }} />
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/28">
              Ntanglement / Valency
            </span>
          </motion.div>

          <motion.h1
            className="font-mono font-bold uppercase leading-[0.9] tracking-tighter"
            style={{ fontSize: 'clamp(42px, 9.5vw, 108px)' }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}>
            118 elements.<br />
            <span style={{ color: '#00ff9d' }}>Infinite</span> curiosity.
          </motion.h1>

          <motion.p
            className="font-sans text-sm md:text-base text-white/38 max-w-lg leading-relaxed"
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.38 }}>
            The periodic table — rebuilt for people who want to actually
            understand what they're looking at. Explore properties, electron
            configurations, and physical data for every element.
          </motion.p>

          <motion.div className="flex flex-wrap justify-center gap-2"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.55 }}>
            {['Interactive heatmaps', 'Orbital diagrams', 'Physical data', '118 elements', 'Mobile friendly']
              .map(f => (
                <div key={f}
                  className="px-3 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-widest text-white/35"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  {f}
                </div>
              ))}
          </motion.div>

          <motion.div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}>
            <button onClick={scrollToTable}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3 rounded-xl font-mono text-sm uppercase tracking-widest font-bold transition-all hover:brightness-110 active:scale-[0.98]"
              style={{ background: '#00ff9d', color: '#060606' }}>
              Start exploring
            </button>
            <a href="https://ntanglement.dev" target="_blank" rel="noopener noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-6 py-3 rounded-xl font-mono text-sm uppercase tracking-widest text-white/38 hover:text-white/65 transition-colors"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              About Ntanglement
              <ExternalLink size={11} />
            </a>
          </motion.div>
        </div>

        {/* Scroll nudge */}
        <motion.div className="absolute bottom-9 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/18"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}>
          <span className="font-mono text-[9px] uppercase tracking-[0.2em]">Scroll</span>
          <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}>
            <ArrowDown size={11} />
          </motion.div>
        </motion.div>

        <div className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none z-10"
          style={{ background: 'linear-gradient(to bottom, transparent, #060606)' }} />
      </section>

      {/* ── ELEMENT OF THE DAY ────────────────────────────────────────────── */}
      {elementOfDay && (
        <ElementOfDay
          element={elementOfDay}
          onExplore={() => handleExploreElementOfDay(elementOfDay)}
        />
      )}

      {/* ── FEATURE STRIP ─────────────────────────────────────────────────── */}
      <section className="relative z-10 border-y border-white/[0.04] py-10 md:py-12 px-5 md:px-10 mt-10">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-10">
          {[
            { n: '01', label: 'Hover any element', desc: 'Get instant access to atomic mass, phase, boiling point, electronegativity and more — no clicking around.' },
            { n: '02', label: 'See orbital diagrams', desc: 'Watch electrons populate their shells in real time. Understand the Bohr model visually, not just on paper.' },
            { n: '03', label: 'Compare with heatmaps', desc: 'Switch to heatmap mode and see which elements are densest, most reactive, or hardest to melt — at a glance.' },
          ].map(({ n, label, desc }, i) => (
            <motion.div key={label} className="flex gap-4 items-start"
              initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.45 }}>
              <div className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center font-mono font-bold text-[11px]"
                style={{ background: 'rgba(0,255,157,0.08)', border: '1px solid rgba(0,255,157,0.14)', color: '#00ff9d' }}>
                {n}
              </div>
              <div>
                <p className="font-sans font-medium text-sm text-white/75 mb-1">{label}</p>
                <p className="font-sans text-xs text-white/32 leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TABLE ─────────────────────────────────────────────────────────── */}
      <div ref={tableRef} />
      <section className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-6 py-10 md:py-14">
        <div className="flex items-center justify-between gap-3 mb-5 px-1">
          <div className="flex items-center gap-3">
            <div className="w-1 h-4 rounded-full" style={{ background: '#00ff9d' }} />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/22">
              Interactive table
            </span>
          </div>
          {/* Shared element badge — appears when someone lands via a shared link */}
          {selectedSymbol && (
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-[9px] uppercase tracking-widest"
              style={{ background: 'rgba(0,255,157,0.07)', border: '1px solid rgba(0,255,157,0.18)', color: 'rgba(0,255,157,0.7)' }}
            >
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00ff9d' }} />
              Viewing {selectedSymbol}
            </div>
          )}
        </div>
        <div className="glass rounded-2xl p-4 md:p-8"
          style={{ border: '1px solid rgba(255,255,255,0.04)' }}>
          <PeriodicTable
            elements={elements.length > 0 ? elements : undefined}
            onShare={showToast}
          />
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="relative z-0 border-t border-white/[0.05] mt-6">
        <div className="max-w-[1400px] mx-auto px-5 md:px-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 py-10">
            <a href="https://ntanglement.dev" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 group w-fit">
              <NtanglementIcon size={34} />
              <div>
                <span className="block font-mono text-[12px] uppercase tracking-widest text-white/45 group-hover:text-white/70 transition-colors">
                  Ntanglement
                </span>
                <span className="block font-mono text-[8px] uppercase tracking-widest text-white/18 mt-0.5">
                  Digital Laboratory
                </span>
              </div>
            </a>
            <div className="flex flex-wrap gap-x-7 gap-y-3">
              {[
                { label: 'Ntanglement', href: 'https://ntanglement.dev' },
                { label: 'GitHub', href: 'https://github.com' },
                { label: 'Data source', href: 'https://github.com/Bowserinator/Periodic-Table-JSON' },
              ].map(({ label, href }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest text-white/22 hover:text-white/50 transition-colors">
                  {label}
                  <ExternalLink size={8} />
                </a>
              ))}
            </div>
          </div>
          <div className="border-t border-white/[0.04] py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="font-mono text-[9px] uppercase tracking-widest text-white/20">
              Valency &nbsp;·&nbsp; An Ntanglement product
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="font-mono text-[8px] uppercase tracking-widest text-white/12">
                React · Vite · Tailwind · Framer Motion
              </span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-white/18">
                © {new Date().getFullYear()} Ntanglement
              </span>
            </div>
          </div>
        </div>
      </footer>
      {/* ── TOAST ─────────────────────────────────────────────────────────── */}
      <Toast toast={toast} onDismiss={dismissToast} />
    </div>
  );
}
