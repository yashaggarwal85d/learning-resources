import { useEffect, useState } from 'react';
import { C, Draw, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// Choosing a vector store, drawn from examples.py's own recommend(): six axes bucketed exactly as the function buckets
// them, the shop's corpus (10,000 vectors, simple, moderate, single tenant, 200 ms, own ops) landing on pgvector, and
// the hypothetical one (2,000,000,000 vectors, rich, high, multi-strict, 100 ms, own ops) landing on a sharded,
// multi-tenant engine. No vendor numbers are drawn; the benchmark bars in Prove it are unlabelled on purpose.

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

/** A red ✕. */
const Cross = ({ x, y, k }: { x: number; y: number; k: number }) =>
  k <= 0 ? null : (
    <g stroke={C.badText} strokeWidth={2.4} opacity={k}>
      <line x1={x - 6} y1={y - 6} x2={x + 6} y2={y + 6} />
      <line x1={x + 6} y1={y - 6} x2={x - 6} y2={y + 6} />
    </g>
  );

/** A database cylinder at (x, y), width w, height h. */
const Cyl = ({ x, y, w, h, c = C.line, o = 1 }: { x: number; y: number; w: number; h: number; c?: string; o?: number }) =>
  o <= 0 ? null : (
    <g opacity={o} fill={C.panel} stroke={c} strokeWidth={1.3}>
      <path d={`M${x} ${y + 6} v${h - 12} a${w / 2} 6 0 0 0 ${w} 0 v${-(h - 12)}`} />
      <ellipse cx={x + w / 2} cy={y + 6} rx={w / 2} ry={6} />
    </g>
  );

// examples.py's recommend() walks six axes and buckets each one; the cells below are its own buckets, in its order:
// size ≤ 5,000,000 / ≤ 200,000,000 / more; filters none / simple / rich; updates low / moderate / high; tenancy single /
// simple / multi-strict; latency comfortable / tight (< 50 ms); ownership own-ops / managed-preferred.
const AXES: { l: string; n: number }[] = [
  { l: 'corpus size', n: 3 },
  { l: 'filters', n: 3 },
  { l: 'update rate', n: 3 },
  { l: 'tenancy', n: 3 },
  { l: 'latency SLO', n: 2 },
  { l: 'ownership', n: 2 },
];
// SHOP_CORPUS: 10,000 vectors, simple, moderate, single, 200 ms, own-ops → pgvector.
const SHOP = { cell: [0, 1, 1, 0, 0, 0], v: ['10,000', 'simple', 'moderate', 'single', '200 ms', 'own ops'] };
// HYPOTHETICAL_CORPUS: 2,000,000,000 vectors, rich, high, multi-strict, 100 ms, own-ops → Milvus.
const BIG = { cell: [2, 2, 2, 2, 0, 0], v: ['2,000,000,000', 'rich', 'high', 'multi-strict', '100 ms', 'own ops'] };
const TX = 160;
const TW = 240;

/** One axis row: label, its bucket cells, and an optional marker sliding to cell `at` (fractional while moving). */
const Axis = ({ i, y, at, o = 1, hi = false, mk = 1, mc = C.focus }: { i: number; y: number; at?: number; o?: number; hi?: boolean; mk?: number; mc?: string }) => {
  const { l, n } = AXES[i];
  const cw = TW / n;
  return o <= 0 ? null : (
    <g opacity={o}>
      <T x={25} y={y + 5} s={12} f={hi ? C.focus : C.secondary}>
        {l}
      </T>
      {Array.from({ length: n }, (_, j) => (
        <rect key={j} x={TX + j * cw + 2} y={y - 7} width={cw - 4} height={14} rx={2} fill={C.band} stroke={hi ? C.secondary : C.line} strokeWidth={1} />
      ))}
      {at !== undefined && mk > 0 && <circle cx={TX + (at + 0.5) * cw} cy={y} r={5} fill={mc} opacity={mk} />}
    </g>
  );
};

// 0 · Two teams side by side. Left: a Postgres cylinder and a small block of ticket dots, "10,000 tickets". Right: a
// field of dots that keeps filling, then walls drop through it into separate tenants, "2,000,000,000 images, 1,000
// tenants". Then the bottom line: one "best" pick for both is the wrong question.
export function Hook({ t }: StepCtx) {
  const fill = easeInOut(seg(t, 0.9, 1.9));
  const walls = easeOut(seg(t, 1.7, 2.3));
  return (
    <Svg label="one team: ten thousand tickets, Postgres already. The other: two billion images, a thousand tenants." h={230}>
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <T x={25} y={22} s={12} f={C.quiet}>
          team one
        </T>
        <Cyl x={25} y={40} w={70} h={80} c={C.secondary} />
        <T x={60} y={140} s={12} f={C.secondary} a="middle">
          Postgres
        </T>
        {Array.from({ length: 20 }, (_, i) => (
          <rect key={i} x={120 + (i % 5) * 12} y={50 + Math.floor(i / 5) * 12} width={8} height={8} rx={1} fill={C.primary} opacity={easeOut(seg(t, 0.2 + i * 0.02, 0.5 + i * 0.02))} />
        ))}
        <T x={120} y={120} s={12} f={C.primary}>
          10,000 tickets
        </T>
      </g>
      <g opacity={easeOut(seg(t, 0.6, 0.9))}>
        <T x={320} y={22} s={12} f={C.quiet}>
          team two
        </T>
        <rect x={320} y={36} width={255} height={100} rx={4} fill="none" stroke={C.line} strokeWidth={1.1} />
        {Array.from({ length: 180 }, (_, i) => (i / 180 < fill ? <circle key={i} cx={327 + (i % 30) * 8.3} cy={43 + Math.floor(i / 30) * 15.5} r={2.2} fill={C.second} /> : null))}
        {[1, 2, 3, 4, 5].map((k) => (
          <line key={k} x1={320 + k * 42.5} y1={36} x2={320 + k * 42.5} y2={36 + 100 * walls} stroke={C.focus} strokeWidth={1.6} />
        ))}
        <T x={320} y={156} s={12} f={C.second} o={fill}>
          2,000,000,000 images
        </T>
        <T x={575} y={176} s={12} f={C.focus} a="end" o={walls}>
          1,000 tenants
        </T>
      </g>
      <T x={300} y={208} s={12} f={C.secondary} a="middle" o={easeOut(seg(t, 2.3, 2.7))}>
        one "best" pick for both is the wrong question
      </T>
    </Svg>
  );
}

// 1 · Both teams point at a single "best engine?" box. After the answer the box is struck and six axis tags fan out of
// it, in the narration's order: size, filters, updates, tenancy, latency, ownership.
export function PredictOneBest({ t, answer }: StepCtx) {
  const on = answer !== null;
  const s = useSinceAnswer(on);
  const k = on ? easeOut(seg(s, 0, 0.4)) : 0;
  const tags = ['size', 'filters', 'updates', 'tenancy', 'latency', 'ownership'];
  return (
    <Svg label="is there one best vector database for both teams?" h={200}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <Box x={25} y={30} w={130} label="team one" />
        <Box x={25} y={100} w={130} label="team two" stroke={C.second} />
      </g>
      <g opacity={easeOut(seg(t, 0.3, 0.7)) * (1 - 0.6 * k)}>
        <line x1={155} y1={46} x2={240} y2={76} stroke={C.line} strokeWidth={1.3} />
        <line x1={155} y1={116} x2={240} y2={88} stroke={C.line} strokeWidth={1.3} />
        <Box x={240} y={64} w={150} label={on ? 'one best' : 'one best?'} lit={!on} />
      </g>
      {on && <Cross x={398} y={80} k={k} />}
      {tags.map((g, i) => {
        const p = on ? easeOutBack(seg(s, 0.3 + i * 0.12, 0.7 + i * 0.12)) : 0;
        return p <= 0 ? null : (
          <g key={g} opacity={Math.min(1, p)}>
            <T x={lerp(315, 450, p)} y={lerp(85, 30 + i * 26, p)} s={12} f={C.focus}>
              {g}
            </T>
          </g>
        );
      })}
      <T x={575} y={185} s={12} f={C.secondary} a="end" o={on ? easeOut(seg(s, 1.2, 1.6)) : 0}>
        these decide it
      </T>
    </Svg>
  );
}

// 2 · The six axes arrive one per narrated question, each as examples.py's own buckets. Then a "Σ score" chip appears
// and is struck, and a cursor walks the rows top to bottom: questions in order, never a sum.
export function RevealSixAxes({ t }: StepCtx) {
  const walk = seg(t, 3.2, 4.1);
  const row = Math.min(5, Math.floor(walk * 6));
  return (
    <Svg label="six axes, criteria to walk through, not a score to add up." h={230}>
      {AXES.map((_, i) => (
        <Axis key={i} i={i} y={30 + i * 30} o={easeOut(seg(t, 0.4 + i * 0.3, 0.7 + i * 0.3))} hi={walk > 0 && i === row} />
      ))}
      <g opacity={easeOut(seg(t, 2.5, 2.8))}>
        <Box x={445} y={60} w={110} label="Σ score" stroke={C.badText} f={C.badText} />
      </g>
      <Cross x={566} y={76} k={easeOut(seg(t, 2.9, 3.1))} />
      {walk > 0 && <path d={`M${TX - 10} ${30 + row * 30 - 6} l6 6 l-6 6`} fill="none" stroke={C.focus} strokeWidth={1.8} />}
      <T x={575} y={140} s={12} f={C.focus} a="end" o={easeOut(seg(t, 3.3, 3.7))}>
        walk them in order
      </T>
    </Svg>
  );
}

// 3 · Postgres, already running, with its tables. An extension block slides inside the same cylinder: vectors, and the
// systems-to-operate count stays at 1. Then the index grows in a memory bar until it no longer fits, and the
// companion extension's disk-backed index takes the overflow below.
export function RevealPgvector({ t }: StepCtx) {
  const plug = easeOutBack(seg(t, 0.9, 1.6));
  const grow = easeInOut(seg(t, 2.5, 3.6));
  const over = Math.max(0, grow * 1.4 - 1);
  const disk = easeOut(seg(t, 3.4, 3.9));
  return (
    <Svg label="a Postgres extension: no new system to operate. pgvectorscale closes the scale gap." h={230}>
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <Cyl x={25} y={20} w={200} h={150} c={C.secondary} />
        <T x={125} y={50} s={13} f={C.secondary} a="middle">
          Postgres
        </T>
        <Box x={45} y={64} w={160} h={26} label="tables" />
      </g>
      {plug > 0 && <Box x={45} y={lerp(-40, 100, plug)} w={160} h={26} label="pgvector" lit o={Math.min(1, plug)} />}
      <T x={25} y={200} s={12} f={C.focus} o={easeOut(seg(t, 1.6, 2.0))}>
        systems to operate: 1
      </T>
      <g opacity={easeOut(seg(t, 2.2, 2.5))}>
        <T x={300} y={40} s={12} f={C.secondary}>
          memory
        </T>
        <rect x={300} y={50} width={250} height={26} rx={3} fill="none" stroke={C.line} strokeWidth={1.2} />
        <rect x={300} y={50} width={250 * Math.min(1, grow * 1.4)} height={26} rx={3} fill={C.second} opacity={0.6} />
        <line x1={550} y1={44} x2={550} y2={82} stroke={over > 0 ? C.badText : C.line} strokeWidth={1.6} />
      </g>
      {over > 0 && (
        <T x={575} y={100} s={12} f={C.badText} a="end">
          no longer fits
        </T>
      )}
      <g opacity={disk}>
        <line x1={425} y1={108} x2={425} y2={128} stroke={C.secondary} strokeWidth={1.3} />
        <path d="M419 122 l6 6 l6 -6" fill="none" stroke={C.secondary} strokeWidth={1.3} />
        <rect x={300} y={134} width={250} height={26} rx={3} fill={C.panel} stroke={C.focus} strokeWidth={1.4} />
        <rect x={300} y={134} width={250 * over * 2.5 > 250 ? 250 : 250 * over * 2.5} height={26} rx={3} fill={C.second} opacity={0.4} />
        <T x={250} y={180} s={12} f={C.focus}>
          pgvectorscale: index on disk
        </T>
      </g>
    </Svg>
  );
}

// 4 · Four engines, one row each, each with its own bet drawn beside it: Milvus splits into shards across nodes,
// Qdrant's filter narrows a stream, Weaviate merges a keyword lane and a vector lane, Pinecone hands the stack to a
// cloud for a bill. No shared axis, no ranking.
export function RevealDedicatedEngines({ t }: StepCtx) {
  const engines = [
    ['Milvus', 'the largest, sharded deployments'],
    ['Qdrant', 'strong filtering, simple self-hosting'],
    ['Weaviate', 'hybrid search, first-class'],
    ['Pinecone', 'managed, the bill replaces ops time'],
  ];
  const st = [0.7, 1.6, 2.5, 3.3];
  const g = (i: number) => easeInOut(seg(t, st[i] + 0.2, st[i] + 0.9));
  return (
    <Svg label="four engines, four different trade-offs — not four scores on one chart." h={230}>
      {engines.map(([name, desc], i) => (
        <g key={name} opacity={easeOut(seg(t, st[i], st[i] + 0.3))}>
          <T x={25} y={30 + i * 52} s={13} f={C.focus}>
            {name}
          </T>
          <T x={25} y={50 + i * 52} s={12} f={C.secondary}>
            {desc}
          </T>
        </g>
      ))}
      {/* Milvus: one block splits into four shard nodes */}
      <g opacity={easeOut(seg(t, st[0], st[0] + 0.3))}>
        {[0, 1, 2, 3].map((j) => (
          <rect key={j} x={lerp(500, 482 + j * 24, g(0))} y={22} width={lerp(60, 18, g(0))} height={24} rx={2} fill={C.panel} stroke={C.secondary} strokeWidth={1.1} />
        ))}
      </g>
      {/* Qdrant: a stream of dots, a filter, fewer dots through */}
      <g opacity={easeOut(seg(t, st[1], st[1] + 0.3))}>
        <path d="M512 72 h28 l-8 10 v12 h-12 v-12 z" fill="none" stroke={C.secondary} strokeWidth={1.2} />
        {[0, 1, 2, 3, 4].map((j) => {
          const x = 480 + ((g(1) * 90 + j * 18) % 90);
          const pass = j % 2 === 0;
          return x > 525 && !pass ? null : <circle key={j} cx={x} cy={84} r={2.6} fill={x > 525 ? C.focus : C.secondary} />;
        })}
      </g>
      {/* Weaviate: a keyword lane and a vector lane merge */}
      <g opacity={easeOut(seg(t, st[2], st[2] + 0.3))} fill="none" strokeWidth={1.4}>
        <path d={`M480 128 C515 128 520 140 ${lerp(520, 545, g(2))} 140`} stroke={C.secondary} />
        <path d={`M480 152 C515 152 520 140 ${lerp(520, 545, g(2))} 140`} stroke={C.second} />
        <line x1={545} y1={140} x2={lerp(545, 575, g(2))} y2={140} stroke={C.focus} />
      </g>
      {/* Pinecone: the stack lifts into a cloud, a bill drops out */}
      <g opacity={easeOut(seg(t, st[3], st[3] + 0.3))}>
        <path d="M492 196 a10 10 0 0 1 8 -16 a14 14 0 0 1 26 -2 a10 10 0 0 1 12 18 z" fill={C.panel} stroke={C.secondary} strokeWidth={1.2} />
        <rect x={505} y={lerp(208, 186, g(3))} width={22} height={10} rx={1} fill={C.primary} opacity={1 - g(3)} />
        <T x={560} y={lerp(186, 206, g(3))} s={12} f={C.focus} a="middle" o={g(3)}>
          $
        </T>
      </g>
    </Svg>
  );
}

// 5 · Top: a search engine's keyword index; a vector field slides in beside it and one query draws on both. Bottom:
// the lakehouse's own files, vectors stored right in them, no new database; the query pulse crosses noticeably slower
// than the one above.
export function RevealSearchAndLakehouse({ t }: StepCtx) {
  const add = easeOutBack(seg(t, 0.7, 1.3));
  const q1 = seg(t, 1.4, 2.0);
  const files = easeOut(seg(t, 2.2, 2.6));
  const q2 = seg(t, 2.8, 4.2);
  return (
    <Svg label="a search engine with vectors added; a lakehouse-native format with no separate database at all." h={210}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <T x={25} y={22} s={12} f={C.quiet}>
          search engine
        </T>
        <Box x={25} y={32} w={150} label="keyword index" />
      </g>
      {add > 0 && <Box x={lerp(25, 190, add)} y={32} w={120} label="vectors" lit o={Math.min(1, add)} />}
      {q1 > 0 && (
        <g>
          <line x1={100} y1={64} x2={lerp(100, 360, easeOut(q1))} y2={lerp(64, 84, easeOut(q1))} stroke={C.secondary} strokeWidth={1.2} />
          <line x1={250} y1={64} x2={lerp(250, 360, easeOut(q1))} y2={lerp(64, 84, easeOut(q1))} stroke={C.second} strokeWidth={1.2} />
          <T x={575} y={90} s={12} f={C.focus} a="end" o={easeOut(seg(t, 1.8, 2.1))}>
            one hybrid query
          </T>
        </g>
      )}
      <g opacity={files}>
        <T x={25} y={122} s={12} f={C.quiet}>
          lakehouse files
        </T>
        {[0, 1, 2, 3, 4].map((j) => (
          <g key={j}>
            <rect x={25 + j * 62} y={132} width={54} height={36} rx={2} fill={C.panel} stroke={C.line} strokeWidth={1.1} />
            <rect x={31 + j * 62} y={156} width={42} height={6} rx={1} fill={C.second} opacity={0.7} />
          </g>
        ))}
      </g>
      {q2 > 0 && <circle cx={25 + 310 * q2} cy={150} r={4} fill={C.focus} />}
      <T x={575} y={156} s={12} f={C.secondary} a="end" o={easeOut(seg(t, 3.0, 3.3))}>
        slower
      </T>
      <T x={25} y={196} s={12} f={C.focus} o={easeOut(seg(t, 3.4, 3.8))}>
        new databases to run: 0
      </T>
    </Svg>
  );
}

// 6 · The six axes again, and team one's own values from SHOP_CORPUS drop into their buckets one by one, each value
// printed on the right. The three that settle it (small size, single tenant, own ops) glow, and the answer lands.
export function RevealShopWalkthrough({ t }: StepCtx) {
  const dec = [0, 3, 5];
  const glow = easeOut(seg(t, 3.0, 3.3));
  return (
    <Svg label="the shop's own corpus, walked through all six axes, lands on pgvector." h={220}>
      {AXES.map((_, i) => {
        const p = easeOutBack(seg(t, 0.5 + i * 0.35, 0.85 + i * 0.35));
        return (
          <g key={i}>
            <Axis i={i} y={24 + i * 26} at={SHOP.cell[i]} mk={Math.min(1, p)} hi={glow > 0.5 && dec.includes(i)} o={easeOut(seg(t, 0, 0.3))} />
            <T x={575} y={29 + i * 26} s={12} f={C.focus} a="end" o={Math.min(1, p)}>
              {SHOP.v[i]}
            </T>
          </g>
        );
      })}
      <T x={575} y={200} s={13} f={C.focus} a="end" o={easeOut(seg(t, 3.5, 3.9))}>
        → pgvector, from these numbers
      </T>
    </Svg>
  );
}

// 7 · Team one's markers sit in their buckets, then all slide at once to HYPOTHETICAL_CORPUS's buckets and the
// values swap: two billion, rich, high, multi-strict, 100 ms. Size and tenancy glow, and the same procedure lands on a
// sharded, multi-tenant engine.
export function RevealDifferentCorpus({ t }: StepCtx) {
  const mv = easeInOut(seg(t, 1.0, 2.0));
  const glow = easeOut(seg(t, 2.8, 3.1));
  return (
    <Svg label="the identical six axes, walked for a billion-vector, high-update, multi-tenant corpus instead." h={220}>
      {AXES.map((_, i) => {
        const moved = SHOP.cell[i] !== BIG.cell[i];
        return (
          <g key={i}>
            <Axis i={i} y={24 + i * 26} at={lerp(SHOP.cell[i], BIG.cell[i], mv)} mc={mv > 0.5 && moved ? C.second : C.focus} hi={glow > 0.5 && (i === 0 || i === 3)} o={easeOut(seg(t, 0, 0.3))} />
            <T x={575} y={29 + i * 26} s={12} f={moved && mv > 0.5 ? C.second : C.focus} a="end" o={moved ? Math.abs(1 - 2 * mv) : 1}>
              {mv > 0.5 ? BIG.v[i] : SHOP.v[i]}
            </T>
          </g>
        );
      })}
      <T x={575} y={200} s={13} f={C.second} a="end" o={easeOut(seg(t, 3.3, 3.7))}>
        → a sharded, multi-tenant engine
      </T>
    </Svg>
  );
}

// 8 · Four lines, each with its picture: six buckets walked by a cursor, the Postgres cylinder with its extension, one
// engine glyph picked for its trade-off, and two corpora splitting to two answers.
export function Recap({ t }: StepCtx) {
  const L: [string, string][] = [
    ['six axes', 'criteria to walk, not a score'],
    ['pgvector', 'already on Postgres? stay there'],
    ['a dedicated engine', 'for its trade-off, not a chart'],
    ['the same procedure', 'two corpora, two honest answers'],
  ];
  const k = (i: number) => easeOut(seg(t, 0.4 + i * 0.9, 0.8 + i * 0.9));
  const walk = Math.min(5, Math.floor(seg(t, 0.6, 1.3) * 6));
  const split = easeInOut(seg(t, 3.3, 3.9));
  return (
    <Svg label="six axes. Four engines, four trade-offs. The same procedure, two honest answers." h={270}>
      {L.map(([a, b], i) => (
        <g key={a} opacity={k(i)}>
          <T x={25} y={34 + i * 62} s={13} f={C.secondary}>
            {a}
          </T>
          <T x={25} y={56 + i * 62} s={13} f={C.primary}>
            {b}
          </T>
        </g>
      ))}
      <g opacity={k(0)}>
        {[0, 1, 2, 3, 4, 5].map((j) => (
          <rect key={j} x={470} y={18 + j * 8} width={90} height={5} rx={1} fill={j === walk ? C.focus : C.line} />
        ))}
      </g>
      <g opacity={k(1)}>
        <Cyl x={490} y={74} w={50} h={44} c={C.secondary} />
        <rect x={500} y={94} width={30} height={8} rx={1} fill={C.focus} />
      </g>
      <g opacity={k(2)}>
        {[0, 1, 2, 3].map((j) => (
          <rect
            key={j}
            x={470 + j * 24}
            y={148}
            width={18}
            height={20}
            rx={2}
            fill={j === 0 ? C.focus : C.panel}
            stroke={C.line}
            strokeWidth={1}
            opacity={j === 0 ? 1 : 1 - 0.6 * easeOut(seg(t, 2.6, 3.0))}
          />
        ))}
      </g>
      <g opacity={k(3)} fill="none" strokeWidth={1.4}>
        <circle cx={480} cy={230} r={4} fill={C.focus} />
        <path d={`M484 230 L${lerp(484, 560, split)} ${lerp(230, 214, split)}`} stroke={C.focus} />
        <path d={`M484 230 L${lerp(484, 560, split)} ${lerp(230, 246, split)}`} stroke={C.second} />
      </g>
    </Svg>
  );
}

// 9 · A vendor's chart: their bar tallest, "at every scale?". After the answer the bar keeps a ✓ pinned to "their tested
// setup", and an arrow to "your corpus" ends in ✕ "not shown" — the gap the six axes are for.
export function ProveIt({ t, answer }: StepCtx) {
  const on = answer !== null;
  const s = useSinceAnswer(on);
  const bars = [62, 84, 70, 130];
  return (
    <Svg label="a vendor publishes a benchmark: their engine beats every competitor, at every scale." h={220}>
      {bars.map((h, i) => {
        const g = easeOut(seg(t, 0.2 + i * 0.15, 0.7 + i * 0.15));
        return <rect key={i} x={40 + i * 46} y={170 - h * g} width={32} height={h * g} rx={2} fill={i === 3 ? C.focus : C.line} />;
      })}
      <line x1={30} y1={170} x2={230} y2={170} stroke={C.line} strokeWidth={1.2} />
      <T x={194} y={190} s={12} f={C.focus} a="middle" o={easeOut(seg(t, 1.0, 1.3))}>
        theirs
      </T>
      <T x={575} y={60} s={13} f={C.focus} a="end" o={on ? 0 : easeOut(seg(t, 1.4, 1.8))}>
        at every scale?
      </T>
      {on && (
        <g>
          <g opacity={easeOut(seg(s, 0.1, 0.5))}>
            <Tick x={246} y={50} k={1} />
            <T x={262} y={55} s={13} f={C.focus}>
              real at their tested setup
            </T>
          </g>
          <g opacity={easeOut(seg(s, 0.9, 1.3))}>
            <line x1={240} y1={110} x2={lerp(240, 380, easeOut(seg(s, 0.9, 1.5)))} y2={110} stroke={C.badText} strokeWidth={1.4} strokeDasharray="4 3" />
            <T x={390} y={115} s={13} f={C.primary}>
              your corpus
            </T>
          </g>
          <Cross x={300} y={140} k={easeOut(seg(s, 1.5, 1.8))} />
          <T x={316} y={145} s={13} f={C.badText} o={easeOut(seg(s, 1.5, 1.8))}>
            transfer not shown
          </T>
          <T x={575} y={205} s={12} f={C.secondary} a="end" o={easeOut(seg(s, 2.1, 2.5))}>
            walk the six axes on yours
          </T>
        </g>
      )}
    </Svg>
  );
}
