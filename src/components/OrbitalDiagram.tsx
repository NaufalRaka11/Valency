import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Element } from '../types/element';
import { getCategoryConfig } from '../data/categoryConfig';

interface OrbitalDiagramProps {
  element: Element;
  size?: number;
}

const SUBSHELL_COLORS: Record<string, string> = {
  s: '#60a5fa',
  p: '#34d399',
  d: '#f59e0b',
  f: '#f472b6',
};

interface Subshell {
  n: number;
  type: string;
  count: number;
}

function parseFullConfig(config: string): Subshell[] {
  const cleaned = config.replace(/\[[^\]]+\]/g, '').trim();
  return cleaned.split(/\s+/).filter(Boolean).flatMap(token => {
    const m = token.match(/^(\d+)([spdf])(\d+)$/);
    if (!m) return [];
    return [{ n: parseInt(m[1]), type: m[2], count: parseInt(m[3]) }];
  });
}

function groupByShell(subshells: Subshell[]): Map<number, Subshell[]> {
  const map = new Map<number, Subshell[]>();
  for (const s of subshells) {
    if (!map.has(s.n)) map.set(s.n, []);
    map.get(s.n)!.push(s);
  }
  return map;
}

interface ElectronDot {
  id: string;
  angle: number;   // fixed offset angle on the ring
  color: string;
  entryDelay: number;
}

interface OrbitRing {
  n: number;
  r: number;
  rotDur: number;
  electrons: ElectronDot[];
}

export const OrbitalDiagram: React.FC<OrbitalDiagramProps> = ({
  element,
  size = 200,
}) => {
  const config = getCategoryConfig(element.category);
  const subshells = parseFullConfig(element.electron_configuration ?? '');
  if (subshells.length === 0) return null;

  const shellMap = groupByShell(subshells);
  const shellNs = Array.from(shellMap.keys()).sort((a, b) => a - b);
  const numShells = shellNs.length;
  const totalElectrons = subshells.reduce((a, s) => a + s.count, 0);

  const cx = size / 2;
  const cy = size / 2;

  // ── Sizing ────────────────────────────────────────────────────────────────
  const nucleusR = Math.max(
    size * 0.04,
    size * 0.075 - numShells * size * 0.005
  );

  const dotR = Math.max(2.5, Math.min(5.5, size * 0.032 - totalElectrons * 0.035));

  // Evenly spaced concentric rings
  const innerPad = nucleusR + dotR * 3.5;
  const outerPad = dotR * 2.5 + size * 0.02;
  const trackLen  = cx - innerPad - outerPad;

  const getR = (idx: number) =>
    numShells === 1
      ? innerPad + trackLen * 0.55
      : innerPad + (idx / (numShells - 1)) * trackLen;

  // Inner shells spin faster
  const getRevDur = (idx: number) => 7 + idx * 5;

  // ── Build rings ───────────────────────────────────────────────────────────
  let globalIdx = 0;
  const totalDots = totalElectrons;

  const orbits: OrbitRing[] = shellNs.map((n, shellIdx) => {
    const subs = shellMap.get(n)!;
    const electronsInShell = subs.reduce((a, s) => a + s.count, 0);
    const r = getR(shellIdx);

    // ── Key fix: place ALL electrons on this ring with EQUAL angular spacing ──
    // Step = 360° / total electrons on ring, starting at -90° (top of circle)
    const step = (2 * Math.PI) / electronsInShell;

    // Build a flat list of (color) per electron in subshell order
    const colorList: string[] = [];
    subs.forEach(sub => {
      for (let i = 0; i < sub.count; i++) {
        colorList.push(SUBSHELL_COLORS[sub.type] ?? '#aaa');
      }
    });

    const electrons: ElectronDot[] = colorList.map((color, i) => {
      // Start from top (-π/2) so first electron sits at 12 o'clock
      const angle = -Math.PI / 2 + i * step;
      const entryDelay = 0.25 + (globalIdx++ / Math.max(totalDots - 1, 1)) * 0.65;
      return {
        id: `e-${shellIdx}-${i}`,
        angle,
        color,
        entryDelay,
      };
    });

    return { n, r, rotDur: getRevDur(shellIdx), electrons };
  });

  // ── rAF revolution ────────────────────────────────────────────────────────
  const svgRef   = useRef<SVGSVGElement>(null);
  const rafRef   = useRef<number>(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = null;

    const tick = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = (ts - startRef.current) / 1000;
      const svg = svgRef.current;
      if (!svg) return;

      orbits.forEach(orbit => {
        const offset = elapsed * (2 * Math.PI) / orbit.rotDur;
        orbit.electrons.forEach(e => {
          const dot = svg.querySelector(`#${e.id}`) as SVGCircleElement | null;
          if (!dot) return;
          const a = e.angle + offset;
          dot.setAttribute('cx', String(+(cx + orbit.r * Math.cos(a)).toFixed(3)));
          dot.setAttribute('cy', String(+(cy + orbit.r * Math.sin(a)).toFixed(3)));
        });
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      startRef.current = null;
    };
  }, [element.number, size]);

  // ── Render ────────────────────────────────────────────────────────────────
  const usedTypes = [...new Set(subshells.map(s => s.type))];

  return (
    <div style={{ width: size }} className="flex flex-col items-center gap-2">
      <svg
        ref={svgRef}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Orbit circles */}
        {orbits.map((orbit, oi) => (
          <motion.circle
            key={`ring-${oi}`}
            cx={cx} cy={cy}
            r={orbit.r}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="0.7"
            strokeDasharray="3 4"
            initial={{ opacity: 0, scale: 0.2 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.04 + oi * 0.07,
              duration: 0.4,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />
        ))}

        {/* Nucleus */}
        <motion.circle
          cx={cx} cy={cy} r={nucleusR}
          fill={`${config.color}18`}
          stroke={config.color}
          strokeWidth="1"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35, ease: 'backOut' }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />
        <motion.text
          x={cx} y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={Math.max(6, Math.min(nucleusR * 1.05, 12))}
          fontFamily="monospace"
          fontWeight="bold"
          fill={config.color}
          fillOpacity={0.9}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {element.number}
        </motion.text>

        {/* Electron dots */}
        {orbits.map(orbit =>
          orbit.electrons.map(e => {
            const initX = cx + orbit.r * Math.cos(e.angle);
            const initY = cy + orbit.r * Math.sin(e.angle);
            return (
              <motion.circle
                key={e.id}
                id={e.id}
                cx={initX}
                cy={initY}
                r={dotR}
                fill={`${e.color}cc`}
                stroke={e.color}
                strokeWidth="0.5"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  delay: e.entryDelay,
                  duration: 0.18,
                  ease: 'backOut',
                }}
                style={{ transformOrigin: `${initX}px ${initY}px` }}
              />
            );
          })
        )}
      </svg>

      {/* Shell summary */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        {shellNs.map((n, i) => {
          const count = shellMap.get(n)!.reduce((a, s) => a + s.count, 0);
          return (
            <React.Fragment key={n}>
              <div className="flex items-center gap-1">
                <span className="font-mono text-[8px] text-white/20">n={n}</span>
                <span className="font-mono text-[9px] text-white/50">{count}e⁻</span>
              </div>
              {i < shellNs.length - 1 && (
                <span className="text-white/10 text-[8px]">·</span>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Subshell legend */}
      <div className="flex items-center justify-center gap-3">
        {usedTypes.map(type => (
          <div key={type} className="flex items-center gap-1.5">
            <div
              className="rounded-full flex-shrink-0"
              style={{
                width: Math.max(4, dotR * 1.3),
                height: Math.max(4, dotR * 1.3),
                background: SUBSHELL_COLORS[type],
              }}
            />
            <span
              className="font-mono uppercase"
              style={{ fontSize: 8, color: `${SUBSHELL_COLORS[type]}90` }}
            >
              {type}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};