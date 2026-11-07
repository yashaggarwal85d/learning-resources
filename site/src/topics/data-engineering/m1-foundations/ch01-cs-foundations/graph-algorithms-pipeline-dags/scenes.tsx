import { useEffect, useState } from 'react';
import { C, Draw, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// Graph algorithms for pipeline DAGs, drawn from examples.py: the shop's 7 tasks and 7 arrows with their durations
// (ingest 20, load_cust 5, clean 15, orders 10, metrics 25, revenue 8, publish 2 minutes); clean's 4 downstream tasks,
// revenue's 4 upstream ones; 5 waves; finish 62 on the metrics branch against 55 on the revenue branch; halving orders
// leaves the finish at 62. 85 is the sum of the seven durations. backup → audit is an illustrative second pipeline.

/** Seconds since the learner answered a predict step (the player's clock has stopped by then), so reveals can animate. */
function useSinceAnswer(on: boolean) {
  const [s, setS] = useState(0);
  useEffect(() => {
    if (!on) {
      setS(0);
      return;
    }
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setS(99);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = () => {
      const d = (performance.now() - t0) / 1000;
      setS(d);
      if (d < 4) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [on]);
  return s;
}

/** A plain box with a centred label. */
const Box = ({
  x,
  y,
  w,
  h = 32,
  label,
  lit = false,
  o = 1,
  dash,
  stroke,
  f,
  fill,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  label: string;
  lit?: boolean;
  o?: number;
  dash?: string;
  stroke?: string;
  f?: string;
  fill?: string;
}) =>
  o <= 0 ? null : (
    <g opacity={Math.min(1, o)}>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={fill ?? C.panel} stroke={stroke ?? (lit ? C.focus : C.line)} strokeWidth={lit ? 1.8 : 1.1} strokeDasharray={dash} />
      <T x={x + w / 2} y={y + h / 2 + 5} s={13} f={f ?? (lit ? C.focus : C.primary)} a="middle">
        {label}
      </T>
    </g>
  );

/** A label-left / value-right line under a drawing. */
const Line2 = ({ y, l, r, o, rc = C.focus, lc = C.secondary, lx = 30 }: { y: number; l: string; r: string; o: number; rc?: string; lc?: string; lx?: number }) =>
  o <= 0 ? null : (
    <g opacity={Math.min(1, o)}>
      <T x={lx} y={y} s={14} f={lc}>
        {l}
      </T>
      <T x={575} y={y} s={14} f={rc} a="end">
        {r}
      </T>
    </g>
  );

/** A check mark. */
const Tick = ({ x, y, k, color = C.focus }: { x: number; y: number; k: number; color?: string }) =>
  k <= 0 ? null : <path d={`M${x - 5} ${y} l4 4 l8 -9`} fill="none" stroke={color} strokeWidth={2} opacity={k} />;

const fade = (t: number, a: number, b: number) => easeOut(seg(t, a, b));

// The shop pipeline, laid out top to bottom in its five waves.
const N = {
  ingest: { x: 140, y: 40, label: 'ingest', d: 20 },
  cust: { x: 420, y: 40, label: 'load_cust', d: 5 },
  clean: { x: 140, y: 100, label: 'clean', d: 15 },
  metrics: { x: 90, y: 160, label: 'metrics', d: 25 },
  orders: { x: 300, y: 160, label: 'orders', d: 10 },
  revenue: { x: 380, y: 220, label: 'revenue', d: 8 },
  publish: { x: 240, y: 280, label: 'publish', d: 2 },
};
type K = keyof typeof N;
const KEYS = Object.keys(N) as K[];
const E: [K, K][] = [
  ['ingest', 'clean'],
  ['clean', 'orders'],
  ['clean', 'metrics'],
  ['orders', 'revenue'],
  ['cust', 'revenue'],
  ['revenue', 'publish'],
  ['metrics', 'publish'],
];
const NW = 140;
const NH = 28;
/** Edge end points, from the bottom edge of one box to the top edge of the next. */
const ends = (a: K, b: K) => {
  const A = N[a];
  const B = N[b];
  return [A.x, A.y + NH / 2, B.x, B.y - NH / 2] as const;
};

/** The pipeline. Per-node colour and opacity, per-edge colour and draw progress, all optional. */
function Dag({
  node,
  edge,
  o = 1,
  text,
}: {
  node?: (k: K) => { c?: string; o?: number; fill?: string } | null;
  edge?: (a: K, b: K, i: number) => { c?: string; k?: number; w?: number } | null;
  o?: number;
  text?: (k: K) => string;
}) {
  return (
    <g opacity={o}>
      {E.map(([a, b], i) => {
        const e = edge?.(a, b, i) ?? {};
        const [x1, y1, x2, y2] = ends(a, b);
        const k = e.k ?? 1;
        if (k <= 0) return null;
        const xe = lerp(x1, x2, k);
        const ye = lerp(y1, y2, k);
        const ang = Math.atan2(y2 - y1, x2 - x1);
        return (
          <g key={i}>
            <line x1={x1} y1={y1} x2={xe} y2={ye} stroke={e.c ?? C.line} strokeWidth={e.w ?? 1.5} />
            {k >= 1 && (
              <path
                d={`M ${x2} ${y2} l ${-8 * Math.cos(ang - 0.4)} ${-8 * Math.sin(ang - 0.4)} M ${x2} ${y2} l ${-8 * Math.cos(ang + 0.4)} ${-8 * Math.sin(ang + 0.4)}`}
                stroke={e.c ?? C.line}
                strokeWidth={e.w ?? 1.5}
              />
            )}
          </g>
        );
      })}
      {KEYS.map((k) => {
        const n = N[k];
        const st = node?.(k) ?? {};
        const no = st.o ?? 1;
        if (no <= 0) return null;
        return (
          <g key={k} opacity={no}>
            <rect x={n.x - NW / 2} y={n.y - NH / 2} width={NW} height={NH} rx={6} fill={st.fill ?? C.panel} stroke={st.c ?? C.secondary} strokeWidth={st.c ? 1.8 : 1.1} />
            <T x={n.x} y={n.y + 5} s={13} a="middle" f={st.c ?? C.primary}>
              {text ? text(k) : n.label}
            </T>
          </g>
        );
      })}
    </g>
  );
}

const TOPO: K[] = ['ingest', 'cust', 'clean', 'metrics', 'orders', 'revenue', 'publish'];

// 1 · The pipeline appears the way an engineer draws it: each task a box, in dependency order, and each arrow drawn as
// the task it feeds appears. Then the two counts.
export function Problem({ t }: StepCtx) {
  const p = seg(t, 0.3, 2.3) * 7;
  return (
    <Svg label="The shop pipeline drawn as a graph: seven tasks and seven dependencies, from ingest through to publish" h={340}>
      <Dag node={(k) => ({ o: easeOutBack(seg(p, TOPO.indexOf(k), TOPO.indexOf(k) + 0.6)) })} edge={(a, b) => ({ k: easeInOut(seg(p, TOPO.indexOf(b) - 0.2, TOPO.indexOf(b) + 0.4)) })} />
      <T x={575} y={330} s={13} f={C.secondary} a="end" o={fade(t, 2.4, 2.8)}>
        7 tasks, 7 arrows
      </T>
    </Svg>
  );
}

// 2 · Directed: pulses run down every arrow, one way only. Acyclic: a walker follows a chain from ingest to publish and
// never comes back. A back arrow from publish to ingest is drawn in red and struck out.
const CHAIN: K[] = ['ingest', 'clean', 'orders', 'revenue', 'publish'];
export function DagDefinition({ t }: StepCtx) {
  const pulse = t > 0.4 ? ((t - 0.4) * 0.9) % 1 : -1;
  const walk = seg(t, 1.6, 2.8) * (CHAIN.length - 1);
  const wi = Math.min(CHAIN.length - 2, Math.floor(walk));
  const wk = walk - wi;
  const A = N[CHAIN[wi]];
  const B = N[CHAIN[wi + 1]];
  const back = fade(t, 2.9, 3.2);
  return (
    <Svg label="Edges point one way, and no path loops back on itself: a directed acyclic graph" h={340}>
      <Dag node={(k) => (walk > 0 && CHAIN.indexOf(k) >= 0 && CHAIN.indexOf(k) <= walk ? { c: C.focus } : null)} />
      {pulse >= 0 &&
        t < 1.6 &&
        E.map(([a, b], i) => {
          const [x1, y1, x2, y2] = ends(a, b);
          return <circle key={i} cx={lerp(x1, x2, pulse)} cy={lerp(y1, y2, pulse)} r={4} fill={C.focus} opacity={Math.sin(Math.PI * pulse)} />;
        })}
      {walk > 0 && walk < CHAIN.length - 1 && <circle cx={lerp(A.x, B.x, wk)} cy={lerp(A.y, B.y, wk)} r={7} fill={C.second} />}
      {back > 0 && (
        <g opacity={back}>
          <path d="M 170 280 C 0 280, 0 40, 70 40" fill="none" stroke={C.badText} strokeWidth={1.6} strokeDasharray="5 4" />
          <path d="M 54 232 l 12 12 M 66 232 l -12 12" stroke={C.badText} strokeWidth={2.4} />
          <T x={575} y={330} s={13} f={C.badText} a="end">
            no arrow back: acyclic
          </T>
        </g>
      )}
    </Svg>
  );
}

// 3 · Predict. clean is marked changed (it pulses). After the answer the change ripples down the arrows: orders and
// metrics, then revenue, then publish. ingest and load_cust stay dark: upstream, untouched.
const DOWN: Partial<Record<K, number>> = { orders: 1, metrics: 1, revenue: 2, publish: 3 };
export function DownstreamPredict({ t, answer }: StepCtx) {
  const on = answer !== null;
  const s = useSinceAnswer(on);
  const reach = on ? seg(s, 0.2, 2.0) * 3 : 0;
  return (
    <Svg label="The shop pipeline with clean marked as changed: which tasks downstream must rerun?" h={340}>
      <Dag
        node={(k) => (k === 'clean' ? { c: C.second } : DOWN[k] && reach >= DOWN[k]! ? { c: C.focus } : on && (k === 'ingest' || k === 'cust') ? { o: 1 - 0.6 * fade(s, 1.8, 2.2) } : null)}
        edge={(a, b) => (DOWN[b] && (a === 'clean' || DOWN[a]) ? { c: reach >= DOWN[b]! - 0.5 ? C.focus : C.line, w: reach >= DOWN[b]! - 0.5 ? 2.2 : 1.5 } : null)}
      />
      <circle cx={N.clean.x} cy={N.clean.y} r={16 + 10 * ((t * 1.2) % 1)} fill="none" stroke={C.second} strokeWidth={1.2} opacity={1 - ((t * 1.2) % 1)} />
      {!on && (
        <T x={575} y={330} s={14} f={C.focus} a="end" o={fade(t, 0.8, 1.2)}>
          what reruns?
        </T>
      )}
      {on && (
        <T x={575} y={330} s={13} f={C.focus} a="end" o={fade(s, 2.0, 2.4)}>
          4 tasks rerun; 2 untouched
        </T>
      )}
    </Svg>
  );
}

// 4 · The mirror walk: from revenue, back up the arrows, lighting what it depends on (blue). Then the bill: every task
// and every arrow visited once, 7 + 7.
const UP: Partial<Record<K, number>> = { orders: 1, cust: 1, clean: 2, ingest: 3 };
export function ReachabilityTraversal({ t }: StepCtx) {
  const r = seg(t, 0.5, 2.0) * 3;
  const visits = Math.round(14 * easeInOut(seg(t, 2.6, 3.4)));
  return (
    <Svg label="Walking the arrows backwards from daily revenue finds everything it depends on; one traversal visits every task and arrow once" h={340}>
      <Dag
        node={(k) => (k === 'revenue' ? { c: C.focus } : UP[k] && r >= UP[k]! ? { c: C.second } : null)}
        edge={(a, b) => {
          const lvl = b === 'revenue' ? 1 : UP[b] ? UP[b]! + 1 : 0;
          return lvl && (UP[a] || a === 'revenue') && r >= lvl - 0.5 ? { c: C.second, w: 2.2 } : null;
        }}
      />
      <T x={575} y={300} s={13} f={C.second} a="end" o={fade(t, 2.0, 2.3)}>
        a backfill needs these 4
      </T>
      <T x={575} y={330} s={13} f={C.secondary} a="end" o={fade(t, 2.6, 2.9)}>
        {`visits: ${visits} (7 tasks + 7 arrows)`}
      </T>
    </Svg>
  );
}

// 5 · Kahn's algorithm. Every task wears its count of unfinished dependencies. Tasks finish in order; each finish
// decrements the counts of the tasks it feeds, and a task whose count hits zero drops into the ready queue.
const INDEG: Record<K, number> = { ingest: 0, cust: 0, clean: 1, metrics: 1, orders: 1, revenue: 2, publish: 2 };
const KAHN: K[] = ['ingest', 'cust', 'clean', 'metrics', 'orders', 'revenue', 'publish'];
export function KahnAlgorithm({ t }: StepCtx) {
  const done = Math.floor(seg(t, 1.2, 3.6) * 7.999);
  const fin = KAHN.slice(0, done);
  const count = (k: K) => INDEG[k] - E.filter(([a, b]) => b === k && fin.includes(a)).length;
  const ready = KAHN.filter((k) => count(k) === 0 && !fin.includes(k));
  return (
    <Svg label="Kahn's algorithm: each task's count of unfinished dependencies falls as its inputs finish; at zero it joins the ready queue" h={380}>
      <Dag node={(k) => (fin.includes(k) ? { o: 0.35 } : count(k) === 0 && t > 0.9 ? { c: C.focus } : null)} />
      {KEYS.map((k) => {
        const n = N[k];
        const c = count(k);
        return (
          <g key={k} opacity={fade(t, 0.3, 0.7) * (fin.includes(k) ? 0 : 1)}>
            <circle cx={n.x + NW / 2} cy={n.y - NH / 2} r={11} fill={c === 0 ? C.focus : C.panel} stroke={C.secondary} />
            <T x={n.x + NW / 2} y={n.y - NH / 2 + 5} s={13} a="middle" f={c === 0 ? C.ink : C.primary}>
              {`${c}`}
            </T>
          </g>
        );
      })}
      <T x={25} y={330} s={13} f={C.secondary} o={fade(t, 0.9, 1.2)}>
        ready:
      </T>
      {ready.map((k, i) => (
        <g key={k} opacity={fade(t, 0.9, 1.2)}>
          <rect x={95 + i * 120} y={314} width={112} height={26} rx={4} fill={C.panel} stroke={C.focus} />
          <T x={151 + i * 120} y={332} s={13} a="middle" f={C.focus}>
            {N[k].label}
          </T>
        </g>
      ))}
    </Svg>
  );
}

// 6 · Predict. The two roots light as wave 1; the rest wait under a "?". After the answer each wave lights in turn, its
// number beside it: 1, 2, 3, 4, 5.
const WAVE: Record<K, number> = { ingest: 1, cust: 1, clean: 2, metrics: 3, orders: 3, revenue: 4, publish: 5 };
export function WavesPredict({ t, answer }: StepCtx) {
  const on = answer !== null;
  const s = useSinceAnswer(on);
  const w = on ? 1 + seg(s, 0.2, 2.2) * 4 : 1;
  return (
    <Svg label="The shop pipeline batched into waves of tasks that can run together" h={340}>
      <Dag node={(k) => (WAVE[k] <= Math.floor(w) && fade(t, 0.3, 0.6) > 0 ? { c: WAVE[k] === 1 ? C.second : C.focus } : null)} />
      {[1, 2, 3, 4, 5].map((v) => {
        const y = [40, 100, 160, 220, 280][v - 1];
        return (
          <T
            key={v}
            x={575}
            y={y + 5}
            s={13}
            f={v === 1 ? C.second : C.focus}
            a="end"
            o={v <= Math.floor(w) ? fade(v === 1 ? t : s, v === 1 ? 0.3 : 0.2 + (v - 1) * 0.5, v === 1 ? 0.6 : 0.5 + (v - 1) * 0.5) : 0}
          >
            {`wave ${v}`}
          </T>
        );
      })}
      {!on && (
        <T x={575} y={330} s={14} f={C.focus} a="end" o={fade(t, 0.9, 1.3)}>
          how many waves?
        </T>
      )}
    </Svg>
  );
}

// 7 · A loop is wired by mistake: publish → clean (red). Kahn's counts in the loop can never reach zero (they stay red).
// A depth-first walker steps along its path and lands back on clean, a task already on that path: caught.
const LOOP: K[] = ['clean', 'orders', 'revenue', 'publish'];
export function CycleDetection({ t }: StepCtx) {
  const wire = fade(t, 0.2, 0.7);
  const stuck = fade(t, 1.0, 1.4);
  const walk = seg(t, 2.0, 3.2) * 4;
  const wi = Math.min(3, Math.floor(walk));
  const A = N[LOOP[wi]];
  const B = N[LOOP[(wi + 1) % 4]];
  const caught = walk >= 4;
  return (
    <Svg
      label="A dependency loop leaves its tasks waiting on each other forever; Kahn's algorithm sees counts stuck above zero, and a depth-first walk sees itself step back onto its own path"
      h={360}
    >
      <Dag node={(k) => (LOOP.includes(k) && stuck > 0 ? { c: C.badText } : null)} />
      <path d="M 170 280 C 20 280, 20 100, 70 100" fill="none" stroke={C.badText} strokeWidth={2} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - wire} />
      {stuck > 0 &&
        LOOP.map((k) => (
          <g key={k} opacity={stuck}>
            <circle cx={N[k].x + NW / 2} cy={N[k].y - NH / 2} r={11} fill={C.panel} stroke={C.badText} />
            <T x={N[k].x + NW / 2} y={N[k].y - NH / 2 + 5} s={13} a="middle" f={C.badText}>
              {k === 'publish' ? '2' : '1'}
            </T>
          </g>
        ))}
      {walk > 0 &&
        !caught &&
        (() => {
          const k = walk - wi;
          const back = wi === 3;
          const x = back ? lerp(A.x, B.x, k) - 120 * Math.sin(Math.PI * k) : lerp(A.x, B.x, k);
          return <circle cx={x} cy={lerp(A.y, B.y, k)} r={7} fill={C.second} />;
        })()}
      {caught && <circle cx={N.clean.x} cy={N.clean.y} r={22} fill="none" stroke={C.badText} strokeWidth={2.4} />}
      <T x={575} y={320} s={13} f={C.badText} a="end" o={fade(t, 1.3, 1.6)}>
        counts stuck above zero
      </T>
      <T x={575} y={348} s={13} f={C.focus} a="end" o={caught ? fade(t, 3.2, 3.5) : 0}>
        caught at import, not at 3 a.m.
      </T>
    </Svg>
  );
}

// 8 · The schedule with unlimited workers, as bars on a minute axis. A sweep in dependency order fills each bar from its
// latest input's finish. Not the sum (85 minutes, struck), not the most tasks (the 5-task revenue chain, 55): the
// heaviest path, 62, lights up.
const START: Record<K, number> = { ingest: 0, cust: 0, clean: 20, metrics: 35, orders: 35, revenue: 45, publish: 60 };
const ROW: K[] = ['ingest', 'cust', 'clean', 'orders', 'metrics', 'revenue', 'publish'];
const MX = (m: number) => 150 + (m / 62) * 410;
const CRIT: K[] = ['ingest', 'clean', 'metrics', 'publish'];
function Gantt({ fill, lit, dur, shift, o = 1 }: { fill: (k: K) => number; lit?: (k: K) => string | null; dur?: (k: K) => number; shift?: (k: K) => number; o?: number }) {
  return (
    <g opacity={o}>
      {[0, 20, 40, 60].map((m) => (
        <g key={m}>
          <line x1={MX(m)} y1={20} x2={MX(m)} y2={196} stroke={C.line} strokeWidth={0.8} />
          <T x={MX(m)} y={214} s={13} a="middle" f={C.quiet}>
            {`${m}`}
          </T>
        </g>
      ))}
      {ROW.map((k, i) => {
        const d = dur ? dur(k) : N[k].d;
        const c = lit?.(k) ?? C.secondary;
        return (
          <g key={k}>
            <T x={25} y={36 + i * 24} s={13} f={c === C.secondary ? C.primary : c}>
              {N[k].label}
            </T>
            <rect x={MX(START[k] + (shift ? shift(k) : 0))} y={24 + i * 24} width={(d / 62) * 410 * fill(k)} height={16} rx={3} fill={c} opacity={0.85} />
          </g>
        );
      })}
    </g>
  );
}
export function CriticalPathIntro({ t }: StepCtx) {
  const sweep = seg(t, 0.4, 1.8) * 7;
  const crit = fade(t, 2.6, 3.0);
  return (
    <Svg label="With unlimited workers the pipeline finishes at the end of its heaviest path, found in one sweep in dependency order" h={330}>
      <Gantt fill={(k) => easeInOut(seg(sweep, TOPO.indexOf(k), TOPO.indexOf(k) + 0.8))} lit={(k) => (crit > 0 && CRIT.includes(k) ? C.focus : null)} />
      <T x={25} y={250} s={13} f={C.quiet} o={fade(t, 1.9, 2.2)}>
        sum of all tasks: 85 min, no
      </T>
      <T x={25} y={276} s={13} f={C.quiet} o={fade(t, 2.2, 2.5)}>
        most tasks in a chain: 55 min, no
      </T>
      <T x={25} y={312} s={15} f={C.focus} o={crit}>
        heaviest path: 62 min, the critical path
      </T>
    </Svg>
  );
}

// 9 · Predict. Revenue branch ends at 55, metrics at 62: the gap is slack. orders shrinks to half its bar before the
// answer. After: the revenue branch slides 5 minutes earlier, and publish does not move.
export function SlackPredict({ t, answer }: StepCtx) {
  const on = answer !== null;
  const s = useSinceAnswer(on);
  const half = easeInOut(seg(t, 1.2, 1.8));
  const shift = on ? easeInOut(seg(s, 0.3, 1.1)) : 0;
  return (
    <Svg label="The revenue branch finishes at 55 minutes, the metrics branch at 62; halving load orders leaves the finish at 62" h={330}>
      <Gantt
        fill={() => 1}
        dur={(k) => (k === 'orders' ? 10 - 5 * half : N[k].d)}
        shift={(k) => (k === 'revenue' ? -5 * shift : 0)}
        lit={(k) => (CRIT.includes(k) ? C.focus : k === 'orders' || k === 'revenue' ? C.second : null)}
      />
      <line x1={MX(55 - 5 * shift)} y1={140} x2={MX(55 - 5 * shift)} y2={196} stroke={C.second} strokeDasharray="3 3" opacity={fade(t, 0.3, 0.6)} />
      <line x1={MX(62)} y1={20} x2={MX(62)} y2={196} stroke={C.focus} strokeWidth={1.5} opacity={fade(t, 0.5, 0.8)} />
      <T x={25} y={250} s={13} f={C.second} o={fade(t, 0.3, 0.6)}>
        revenue branch: 55 · metrics branch: 62
      </T>
      {!on && (
        <T x={25} y={290} s={14} f={C.focus} o={fade(t, 1.6, 2.0)}>
          orders twice as fast: how much sooner?
        </T>
      )}
      {on && (
        <T x={25} y={290} s={14} f={C.focus} o={fade(s, 1.0, 1.4)}>
          finish still 62: not one minute sooner
        </T>
      )}
    </Svg>
  );
}

// 10 · Components: next to the shop pipeline, a second pipeline that shares nothing with it gets its own outline. Then
// the topic's four questions, each one walk over the graph.
export function Verdict({ t }: StepCtx) {
  const ops = ['order the tasks', 'catch the cycle', 'trace what reruns', 'find what sets the clock'];
  return (
    <Svg label="Tasks with no shared dependency form separate components; every question in this topic is one linear walk over the graph" h={340}>
      <g opacity={fade(t, 0.1, 0.4)}>
        {E.map(([a, b], i) => (
          <line key={i} x1={20 + N[a].x * 0.55} y1={14 + N[a].y * 0.55} x2={20 + N[b].x * 0.55} y2={14 + N[b].y * 0.55} stroke={C.line} strokeWidth={1.4} />
        ))}
        {KEYS.map((k) => (
          <circle key={k} cx={20 + N[k].x * 0.55} cy={14 + N[k].y * 0.55} r={7} fill={C.panel} stroke={C.secondary} strokeWidth={1.3} />
        ))}
      </g>
      <rect x={10} y={8} width={300} height={172} rx={8} fill="none" stroke={C.focus} strokeWidth={1.4} strokeDasharray="5 4" pathLength={1} opacity={fade(t, 0.5, 0.8)} />
      <g opacity={fade(t, 0.8, 1.1)}>
        <rect x={360} y={40} width={120} height={28} rx={6} fill={C.panel} stroke={C.secondary} />
        <T x={420} y={59} s={13} a="middle" f={C.primary}>
          backup
        </T>
        <line x1={420} y1={68} x2={420} y2={100} stroke={C.line} strokeWidth={1.5} />
        <rect x={360} y={100} width={120} height={28} rx={6} fill={C.panel} stroke={C.secondary} />
        <T x={420} y={119} s={13} a="middle" f={C.primary}>
          audit
        </T>
      </g>
      <rect x={340} y={26} width={160} height={116} rx={8} fill="none" stroke={C.second} strokeWidth={1.4} strokeDasharray="5 4" opacity={fade(t, 1.1, 1.4)} />
      {ops.map((o, i) => {
        const k = fade(t, 1.6 + i * 0.35, 1.9 + i * 0.35);
        return (
          <g key={o} opacity={k} transform={`translate(${20 * (1 - k)} 0)`}>
            <Tick x={32} y={214 + i * 30} k={k} />
            <T x={50} y={218 + i * 30} s={13} f={C.primary}>
              {o}
            </T>
          </g>
        );
      })}
      <T x={575} y={332} s={13} f={C.focus} a="end" o={fade(t, 3.0, 3.4)}>
        each one linear in tasks + arrows
      </T>
    </Svg>
  );
}
