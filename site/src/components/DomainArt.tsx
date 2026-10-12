import { useEffect, useRef, useState } from 'react';

/**
 * Four small, live illustrations, one per domain, each showing a real idea the
 * domain teaches. Every animation is a pure function of time `t` (seconds), so
 * it loops cleanly and freezes on a still frame for reduced motion.
 */
function useTime(still: number) {
  const ref = useRef<SVGSVGElement>(null);
  const [t, setT] = useState(still);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    let visible = false;
    let start = performance.now() - still * 1000;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || document.hidden) {
        start += 16;
        return;
      }
      setT((now - start) / 1000);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [still]);
  return [ref, t] as const;
}

const C = {
  espresso: '#17100c',
  roast: '#2a1d16',
  cocoa: '#3b2a21',
  mocha: '#5a4032',
  latte: '#c8ac8c',
  crema: '#e9d9bf',
  foam: '#fbf7ef',
  caramel: '#d49a57',
  cinnamon: '#b8612f',
};
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
const mono = { fontFamily: 'JetBrains Mono, ui-monospace, monospace' };

/* ---------------------------------------------------------- Data Engineering */
// Change events leave three source databases, flow through the log and a
// stream processor, and land in the lakehouse, which fills as they arrive.
function Pipeline({ t }: { t: number }) {
  const sources = [36, 90, 144];
  const bez = (p0: number[], p1: number[], p2: number[], p3: number[], u: number) => {
    const v = 1 - u;
    return [0, 1].map((k) => v * v * v * p0[k] + 3 * v * v * u * p1[k] + 3 * v * u * u * p2[k] + u * u * u * p3[k]);
  };
  const paths = sources.map((y) => [[52, y], [96, y], [104, 90], [146, 90]]);
  const out = [[186, 90], [226, 90], [232, 90], [262, 90]];
  const packets = [];
  for (let i = 0; i < 9; i++) {
    const u = (t * 0.42 + i / 9) % 1;
    const src = i % 3;
    if (u < 0.5) {
      const [x, y] = bez(paths[src][0], paths[src][1], paths[src][2], paths[src][3], u / 0.5);
      packets.push(<circle key={i} cx={x} cy={y} r={3.2} fill={C.caramel} />);
    } else {
      const [x, y] = bez(out[0], out[1], out[2], out[3], (u - 0.5) / 0.5);
      packets.push(<circle key={i} cx={x} cy={y} r={3.2} fill={C.crema} />);
    }
  }
  const fill = 0.25 + 0.55 * ((Math.sin(t * 0.7) + 1) / 2);
  return (
    <>
      {paths.map((p, i) => (
        <path key={i} d={`M${p[0]} C${p[1]} ${p[2]} ${p[3]}`} fill="none" stroke={C.mocha} strokeWidth={2} />
      ))}
      <path d="M186 90 L262 90" stroke={C.mocha} strokeWidth={2} />
      {sources.map((y, i) => (
        <g key={i}>
          <rect x={14} y={y - 13} width={40} height={26} rx={6} fill={C.roast} stroke={C.latte} strokeWidth={1.5} />
          <text x={34} y={y + 4} textAnchor="middle" fontSize={9} fill={C.latte} style={mono}>OLTP</text>
        </g>
      ))}
      <rect x={146} y={66} width={40} height={48} rx={8} fill={C.roast} stroke={C.caramel} strokeWidth={1.5} />
      {[0, 1, 2].map((k) => (
        <rect key={k} x={152} y={74 + k * 12} width={28} height={7} rx={2} fill={C.cocoa} stroke={C.caramel} strokeWidth={0.8} opacity={0.6 + 0.4 * ((Math.sin(t * 3 + k) + 1) / 2)} />
      ))}
      <text x={166} y={130} textAnchor="middle" fontSize={8} fill={C.latte} style={mono}>LOG</text>
      {/* lakehouse cylinder */}
      <g>
        <ellipse cx={288} cy={60} rx={22} ry={7} fill={C.roast} stroke={C.crema} strokeWidth={1.5} />
        <path d={`M266 60 V120 A22 7 0 0 0 310 120 V60`} fill={C.roast} stroke={C.crema} strokeWidth={1.5} />
        <path d={`M266 ${120 - 60 * fill} V120 A22 7 0 0 0 310 120 V${120 - 60 * fill} A22 7 0 0 1 266 ${120 - 60 * fill}`} fill={C.caramel} opacity={0.75} />
        <ellipse cx={288} cy={120 - 60 * fill} rx={22} ry={7} fill={C.caramel} opacity={0.9} />
        <text x={288} y={146} textAnchor="middle" fontSize={8} fill={C.latte} style={mono}>LAKEHOUSE</text>
      </g>
      {packets}
    </>
  );
}

/* ---------------------------------------------------------- Rust */
// A value is moved from `a` to `b`, then into `consume`; each owner it leaves
// greys out, because after a move the old binding can no longer be used.
function Ownership({ t }: { t: number }) {
  const cycle = 7;
  const u = (t % cycle) / cycle;
  const owners = [
    { x: 40, label: 'let a' },
    { x: 160, label: 'let b' },
    { x: 280, label: 'consume()' },
  ];
  const leg = u < 0.12 ? 0 : u < 0.4 ? (u - 0.12) / 0.28 : u < 0.55 ? 1 : u < 0.83 ? 1 + (u - 0.55) / 0.28 : 2;
  const seg = Math.min(1, Math.floor(leg));
  const frac = ease(leg - seg);
  const x = owners[seg].x + (owners[Math.min(2, seg + 1)].x - owners[seg].x) * (leg >= 2 ? 0 : frac);
  const arc = Math.sin(Math.PI * (leg >= 2 ? 0 : frac)) * 34;
  const fadeOut = u > 0.9 ? 1 - (u - 0.9) / 0.1 : 1;
  return (
    <>
      {owners.map((o, i) => {
        const moved = leg > i + 0.5 && i < 2;
        return (
          <g key={i} opacity={moved ? 0.4 : 1}>
            <rect x={o.x - 44} y={92} width={88} height={44} rx={10} fill={C.roast} stroke={moved ? C.mocha : C.cinnamon} strokeWidth={1.6} strokeDasharray={moved ? '4 4' : undefined} />
            <text x={o.x} y={156} textAnchor="middle" fontSize={10} fill={C.latte} style={mono}>{o.label}</text>
            {moved && (
              <text x={o.x} y={118} textAnchor="middle" fontSize={9} fill={C.mocha} style={mono}>moved</text>
            )}
          </g>
        );
      })}
      {/* the moved value */}
      <g transform={`translate(${x} ${114 - arc})`} opacity={fadeOut}>
        <rect x={-30} y={-13} width={60} height={26} rx={7} fill={C.cinnamon} />
        <text x={0} y={4} textAnchor="middle" fontSize={10} fill={C.foam} style={mono}>Vec&lt;u8&gt;</text>
      </g>
      {[0, 1].map((i) => {
        const on = leg > i + 0.05 && leg < i + 1;
        return (
          <path key={i} d={`M${owners[i].x + 20} 82 Q${owners[i].x + 60} 46 ${owners[i + 1].x - 20} 82`} fill="none" stroke={C.cinnamon} strokeWidth={1.4} strokeDasharray="3 5" opacity={on ? 0.9 : 0.15} />
        );
      })}
      <text x={160} y={34} textAnchor="middle" fontSize={11} fill={C.crema} style={mono}>
        {leg < 1 ? 'let b = a;' : leg < 2 ? 'consume(b);' : '// a, b: use after move ✗'}
      </text>
    </>
  );
}

/* ---------------------------------------------------------- DSA */
// Dijkstra's algorithm: nodes settle in order of distance from the source,
// relaxing the edges they reach; the shortest-path tree lights up.
const NODES = [
  [36, 92], [96, 42], [102, 136], [168, 84], [218, 34], [228, 140], [286, 88],
];
const EDGES: [number, number, number][] = [
  [0, 1, 4], [0, 2, 2], [1, 3, 5], [2, 3, 1], [1, 4, 6], [3, 4, 2], [3, 5, 4], [2, 5, 7], [4, 6, 3], [5, 6, 1],
];
const DIJKSTRA = (() => {
  const n = NODES.length;
  const dist = Array(n).fill(Infinity);
  const prev = Array(n).fill(-1);
  const done: number[] = [];
  dist[0] = 0;
  const settled = new Set<number>();
  while (settled.size < n) {
    let u = -1;
    for (let i = 0; i < n; i++) if (!settled.has(i) && (u < 0 || dist[i] < dist[u])) u = i;
    settled.add(u);
    done.push(u);
    for (const [a, b, w] of EDGES) {
      const v = a === u ? b : b === u ? a : -1;
      if (v >= 0 && !settled.has(v) && dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        prev[v] = u;
      }
    }
  }
  return { dist, prev, order: done };
})();

function Dijkstra({ t }: { t: number }) {
  const cycle = 8;
  const step = ((t % cycle) / cycle) * (NODES.length + 2);
  const settledAt = (i: number) => DIJKSTRA.order.indexOf(i);
  return (
    <>
      {EDGES.map(([a, b, w], i) => {
        const [x1, y1] = NODES[a];
        const [x2, y2] = NODES[b];
        const tree = (DIJKSTRA.prev[b] === a && settledAt(b) < step) || (DIJKSTRA.prev[a] === b && settledAt(a) < step);
        return (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={tree ? C.crema : C.mocha} strokeWidth={tree ? 2.4 : 1.4} />
            <text x={(x1 + x2) / 2 + 4} y={(y1 + y2) / 2 - 4} fontSize={9} fill={C.latte} style={mono} opacity={0.8}>
              {w}
            </text>
          </g>
        );
      })}
      {NODES.map(([x, y], i) => {
        const k = settledAt(i);
        const on = k < step;
        const pulse = on && step - k < 1 ? 1 - (step - k) : 0;
        return (
          <g key={i}>
            {pulse > 0 && <circle cx={x} cy={y} r={13 + 14 * (1 - pulse)} fill="none" stroke={C.crema} opacity={pulse} />}
            <circle cx={x} cy={y} r={13} fill={on ? C.crema : C.roast} stroke={C.crema} strokeWidth={1.5} />
            <text x={x} y={y + 4} textAnchor="middle" fontSize={10} fill={on ? C.espresso : C.latte} style={mono}>
              {on ? DIJKSTRA.dist[i] : '∞'}
            </text>
          </g>
        );
      })}
      <text x={160} y={172} textAnchor="middle" fontSize={9} fill={C.latte} style={mono}>
        settled {Math.min(NODES.length, Math.floor(step))}/{NODES.length}
      </text>
    </>
  );
}

const ART: Record<string, { C: (p: { t: number }) => React.ReactNode; still: number; label: string }> = {
  'data-engineering': { C: Pipeline, still: 1.3, label: 'Change events flowing from databases through a log into the lakehouse' },
  'rust-systems-engineering': { C: Ownership, still: 2.2, label: 'A value moved between owners in Rust' },
  'data-structures-and-algorithms': { C: Dijkstra, still: 5.2, label: "Dijkstra's algorithm settling nodes in order of distance" },
};

export default function DomainArt({ id }: { id: string }) {
  const art = ART[id];
  const [ref, t] = useTime(art.still);
  const Art = art.C;
  return (
    <svg ref={ref} viewBox="0 0 320 180" className="h-full w-full" role="img" aria-label={art.label}>
      <Art t={t} />
    </svg>
  );
}
