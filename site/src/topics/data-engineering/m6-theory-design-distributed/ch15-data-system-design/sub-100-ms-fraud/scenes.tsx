import { useEffect, useState } from 'react';
import { C, Draw, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// CHAPTER.md, topic 22: a hundred-millisecond bar divided into hop segments, each hop's measured p99 drawn against
// its share and overflowing in red where it does (the lookup); a histogram of the whole chain with the p99 well right of
// the average and the timeout cutting the tail; a decision card of three fallbacks with their error costs.
// examples.py (seed 7, 2,000 requests): hop p99s 40, 100, 13.2, 3.3, 4.4 ms; model inference averages 12 ms; the
// chain's p99 is 125 ms against a summed ceiling of 161 ms; 3.2 percent of requests exceed 100 ms; per-card state at
// 64 bytes a one-minute bucket for 1,000,000 cards is 320 MB at a 5-minute window, 3.84 GB at 60 minutes, 38.4 GB at
// ten times the cards; approve-on-timeout costs 450,000 against decline's 15,000 on 100,000 payments.

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
const Box = ({ x, y, w, h = 32, label, lit = false, o = 1, dash, stroke, f, fill }: { x: number; y: number; w: number; h?: number; label: string; lit?: boolean; o?: number; dash?: string; stroke?: string; f?: string; fill?: string }) =>
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

/** A red ✕. */
const Cross = ({ x, y, k }: { x: number; y: number; k: number }) =>
  k <= 0 ? null : (
    <g stroke={C.badText} strokeWidth={2.4} opacity={k}>
      <line x1={x - 7} y1={y - 7} x2={x + 7} y2={y + 7} />
      <line x1={x + 7} y1={y - 7} x2={x - 7} y2={y + 7} />
    </g>
  );

// examples.py, seed 7, 2,000 requests: the chain's latency in 5 ms bins from 0 to 170 ms.
const BINS = [0, 0, 0, 0, 0, 0, 1550, 329, 0, 9, 1, 0, 11, 25, 9, 0, 1, 0, 0, 1, 0, 0, 0, 0, 47, 11, 0, 0, 1, 0, 2, 3, 0, 0];
const HMAX = Math.sqrt(1550);

/** The chain-latency histogram on a 0-170 ms axis, square-root heights so the tail shows. */
const Histo = ({ x0, base, hmax, ppm, k, tailFrom = 999 }: { x0: number; base: number; hmax: number; ppm: number; k: number; tailFrom?: number }) => (
  <g>
    {BINS.map((c, i) => {
      if (c === 0) return null;
      const h = (Math.sqrt(c) / HMAX) * hmax * k;
      const tail = i * 5 >= tailFrom;
      return <rect key={i} x={x0 + i * 5 * ppm + 1} y={base - h} width={5 * ppm - 2} height={Math.max(0, h)} fill={tail ? C.badText : C.quiet} />;
    })}
  </g>
);

const HOPS: [string, number, number, number][] = [
  // name, budget share (ms, drawn only as a width), examples.py p99 (ms), offset
  ['network in', 42, 40, 0],
  ['lookup', 28, 100, 42],
  ['inference', 15, 13.2, 70],
  ['rules', 5, 3.3, 85],
  ['network out', 10, 4.4, 90],
];

// 1 · The model's own average sits deep inside the budget. Then the checkout's latency histogram grows on the same
// axis: its p99 lands past the 100 ms timeout. The tail beyond the timeout turns red, 3.2 percent goes to the
// "approve" fallback, and fraud dots fall into exactly that tail.
export function Hook({ t }: StepCtx) {
  const PPM = 3.18;
  const X = (ms: number) => 30 + ms * PPM;
  const avg = easeOut(seg(t, 0.2, 0.7));
  const hist = easeInOut(seg(t, 1.0, 1.9));
  const p99 = easeOut(seg(t, 2.0, 2.4));
  const tail = easeOut(seg(t, 2.8, 3.2));
  const fraud = seg(t, 3.6, 4.6);
  return (
    <Svg label="the average looked fine; the p99 blew the timeout" h={270}>
      <line x1={X(100)} y1={30} x2={X(100)} y2={200} stroke={C.secondary} strokeDasharray="5 4" opacity={easeOut(seg(t, 0, 0.3))} />
      <T x={X(100) - 6} y={22} s={13} f={C.secondary} a="end" o={easeOut(seg(t, 0, 0.3))}>
        timeout 100 ms
      </T>
      <rect x={30} y={38} width={Math.max(0, 12 * PPM * avg)} height={10} rx={2} fill={C.focus} />
      <T x={84} y={48} s={13} f={C.focus} o={avg}>
        model average 12 ms
      </T>
      {tail > 0 && <rect x={X(100)} y={70} width={X(170) - X(100)} height={130} fill={C.bad} opacity={0.35 * tail} />}
      <Histo x0={30} base={200} hmax={110} ppm={PPM} k={hist} tailFrom={tail > 0.5 ? 100 : 999} />
      <line x1={30} y1={200} x2={570} y2={200} stroke={C.line} opacity={easeOut(seg(t, 0.9, 1.1))} />
      {p99 > 0 && (
        <g opacity={p99}>
          <line x1={X(125)} y1={74} x2={X(125)} y2={200} stroke={C.badText} strokeWidth={1.6} />
          <T x={X(125) + 6} y={86} s={13} f={C.badText}>
            p99 125 ms
          </T>
        </g>
      )}
      {fraud > 0 &&
        [0, 1, 2, 3, 4, 5, 6].map((i) => {
          const k = easeOut(seg(fraud, i * 0.1, i * 0.1 + 0.35));
          const fx = X(104 + ((i * 37) % 60));
          return k > 0 ? <circle key={i} cx={fx} cy={lerp(100, 120 + ((i * 23) % 60), k)} r={4} fill={C.badText} stroke={C.focus} strokeWidth={0.8} opacity={k} /> : null;
        })}
      <T x={30} y={232} s={13} f={C.secondary} o={tail}>
        3.2% of payments time out
      </T>
      <T x={570} y={232} s={14} f={C.badText} a="end" o={tail}>
        fallback: approve
      </T>
      <T x={570} y={258} s={13} f={C.badText} a="end" o={easeOut(seg(t, 4.2, 4.6))}>
        the fraud sits in that tail
      </T>
    </Svg>
  );
}

// 2 · Five hop chips and a fallback that just says "approve". After the answer, the model chip shows its fine average,
// the lookup chip goes red with its 100 ms p99, and the default "approve" gives way to a recorded decision.
export function Predict1({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const hop = on ? easeOut(seg(s, 0.3, 0.7)) : 0;
  const fb = on ? easeOut(seg(s, 1.1, 1.5)) : 0;
  const CH = ['net in', 'lookup', 'model', 'rules', 'net out'];
  return (
    <Svg label="where did the p99 actually go?" h={210}>
      {CH.map((c, i) => {
        const x = 30 + i * 109;
        const isL = i === 1;
        return isL && hop > 0.5 ? (
          <Box key={c} x={x} y={30} w={104} h={30} label={c} fill={C.bad} stroke={C.badText} f={C.focus} />
        ) : (
          <Box key={c} x={x} y={30} w={104} h={30} label={c} o={easeOut(seg(t, i * 0.1, 0.3 + i * 0.1)) * (on && !isL && i !== 2 ? 1 - hop * 0.5 : 1)} />
        );
      })}
      {!on &&
        [0, 1, 2, 3, 4].map((i) => (
          <T key={i} x={82 + i * 109} y={86} s={14} f={C.secondary} a="middle" o={easeOut(seg(t, 0.6 + i * 0.08, 0.9 + i * 0.08))}>
            ?
          </T>
        ))}
      {hop > 0 && (
        <g opacity={hop}>
          <T x={139 + 52} y={86} s={13} f={C.badText} a="middle">
            p99 100 ms
          </T>
          <T x={248 + 52} y={106} s={13} f={C.secondary} a="middle">
            avg 12 ms
          </T>
        </g>
      )}
      <T x={30} y={150} s={14} f={C.secondary} o={easeOut(seg(t, 1.0, 1.3))}>
        fallback
      </T>
      <Box x={140} y={130} w={120} h={30} label="approve" o={easeOut(seg(t, 1.1, 1.4)) * (1 - fb * 0.6)} />
      <Cross x={200} y={145} k={fb} />
      {fb > 0 && <Box x={290} y={130} w={200} h={30} label="a recorded decision" lit o={fb} />}
      <T x={30} y={196} s={14} f={C.secondary} o={easeOut(seg(t, 1.6, 2.0)) * (on ? 0.4 : 1)}>
        the average was never the number
      </T>
    </Svg>
  );
}

// 3 · An event runs into the stream job and updates the online store. A request then reads the store, the model
// scores, and a decision returns. Last, a dashed boundary splits the stream side from the read-now side.
export function RevealPipelineStrip({ t }: StepCtx) {
  const e1 = easeInOut(seg(t, 0.4, 0.9));
  const e2 = easeInOut(seg(t, 1.0, 1.4));
  const upd = easeOut(seg(t, 1.4, 1.7));
  const read = easeOut(seg(t, 2.0, 2.3));
  const r1 = easeInOut(seg(t, 2.4, 2.8));
  const r2 = easeInOut(seg(t, 2.9, 3.3));
  const bnd = seg(t, 3.4, 3.9);
  const dot = (x: number, y: number) => <circle cx={x} cy={y} r={5} fill={C.focus} />;
  return (
    <Svg label="event, features, lookup, model, decision — one boundary line" h={210}>
      <Box x={30} y={30} w={90} h={30} label="event" o={easeOut(seg(t, 0, 0.3))} />
      <Box x={150} y={30} w={130} h={30} label="stream job" lit={e1 >= 1 && e2 < 1} o={easeOut(seg(t, 0.1, 0.4))} />
      <Box x={330} y={30} w={140} h={30} label="online store" lit={upd > 0 && upd < 1} o={easeOut(seg(t, 0.2, 0.5))} />
      <Box x={330} y={100} w={140} h={30} label="lookup" lit={read > 0 && r1 < 1} o={easeOut(seg(t, 1.7, 2.0))} />
      <Box x={485} y={100} w={90} h={30} label="model" lit={r1 >= 1 && r2 < 1} o={easeOut(seg(t, 1.8, 2.1))} />
      <Box x={485} y={150} w={90} h={28} label="decision" lit={r2 >= 1} o={easeOut(seg(t, 1.9, 2.2))} />
      <g stroke={C.line} opacity={easeOut(seg(t, 0.2, 0.5))}>
        <line x1={120} y1={45} x2={150} y2={45} />
        <line x1={280} y1={45} x2={330} y2={45} />
      </g>
      <g stroke={C.line} opacity={easeOut(seg(t, 1.8, 2.1))}>
        <line x1={400} y1={60} x2={400} y2={100} />
        <line x1={470} y1={115} x2={485} y2={115} />
        <line x1={530} y1={130} x2={530} y2={150} />
      </g>
      {e1 > 0 && e1 < 1 && dot(lerp(120, 150, e1), 45)}
      {e2 > 0 && e2 < 1 && dot(lerp(280, 330, e2), 45)}
      {upd > 0 && <rect x={478} y={38} width={14} height={14} rx={2} fill={C.focus} opacity={upd} />}
      {read > 0 && r1 <= 0 && <line x1={400} y1={60} x2={400} y2={100} stroke={C.focus} strokeWidth={2} opacity={read} />}
      {r1 > 0 && r1 < 1 && dot(lerp(470, 485, r1), 115)}
      {r2 > 0 && r2 < 1 && dot(530, lerp(130, 150, r2))}
      {bnd > 0 && <line x1={305} y1={14} x2={305} y2={lerp(14, 186, bnd)} stroke={C.second} strokeWidth={1.6} strokeDasharray="6 4" />}
      <T x={30} y={200} s={13} f={C.second} o={easeOut(seg(t, 3.9, 4.3))}>
        eventually consistent
      </T>
      <T x={316} y={200} s={13} f={C.focus} o={easeOut(seg(t, 4.0, 4.4))}>
        read as of now
      </T>
    </Svg>
  );
}

// 4 · A Gantt of the 100 ms budget: each hop's share is an outlined slot at its offset, its measured p99 grows inside
// it. The lookup's p99 runs past its share and past the deadline, in red.
export function RevealLatencyBudget({ t }: StepCtx) {
  const PPM = 2.6;
  const X = (ms: number) => 140 + ms * PPM;
  return (
    <Svg label="a budget bar, built at p99, hop by hop" h={240}>
      <line x1={X(100)} y1={30} x2={X(100)} y2={200} stroke={C.secondary} strokeDasharray="5 4" opacity={easeOut(seg(t, 0, 0.3))} />
      <T x={X(100)} y={22} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 0, 0.3))}>
        100 ms
      </T>
      {HOPS.map(([n, share, p99, off], i) => {
        const y = 50 + i * 34;
        const at = 0.6 + i * 0.55;
        const g = easeInOut(seg(t, at, at + 0.5));
        const len = p99 * g;
        const inS = Math.min(len, share);
        const over = Math.max(0, len - share);
        return (
          <g key={n} opacity={easeOut(seg(t, 0.1 + i * 0.08, 0.4 + i * 0.08))}>
            <T x={30} y={y + 5} s={13} f={over > 0 ? C.badText : C.secondary}>
              {n}
            </T>
            <rect x={X(off)} y={y - 10} width={share * PPM} height={20} rx={2} fill="none" stroke={C.primary} strokeWidth={1.2} />
            <rect x={X(off)} y={y - 4} width={Math.max(0, inS * PPM)} height={8} fill={C.focus} />
            {over > 0 && <rect x={X(off + share)} y={y - 4} width={over * PPM} height={8} fill={C.badText} />}
            {g > 0.05 && (
              <T x={575} y={y + 5} s={13} f={over > 0 ? C.badText : C.focus} a="end">
                {`${p99 >= 10 ? Math.round(len) : len.toFixed(1)} ms`}
              </T>
            )}
          </g>
        );
      })}
      <T x={30} y={226} s={13} f={C.secondary} o={easeOut(seg(t, 1.4, 1.8))}>
        outline: its share
      </T>
      <T x={575} y={226} s={13} f={C.badText} a="end" o={easeOut(seg(t, 3.9, 4.3))}>
        one hop's tail overflows
      </T>
    </Svg>
  );
}

// 5 · The five hop p99s stack into one bar and the counter adds them to a 161 ms ceiling. Below, the chain's own
// histogram: its measured p99, 125 ms, sits short of the ceiling line, and the gap between them shades in.
export function RevealChainP99({ t }: StepCtx) {
  const PPM = 3.0;
  const X = (ms: number) => 30 + ms * PPM;
  const sum = seg(t, 0.3, 1.8);
  const total = 160.9 * sum;
  const hist = easeInOut(seg(t, 2.0, 2.7));
  const p99 = easeOut(seg(t, 2.8, 3.2));
  const gap = easeOut(seg(t, 3.4, 3.9));
  let acc = 0;
  return (
    <Svg label="the sum of hop p99s is a ceiling, not the answer" h={210}>
      <T x={30} y={28} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        sum of hop p99s
      </T>
      {HOPS.map(([n, , p99]) => {
        const x = X(acc);
        const shown = Math.max(0, Math.min(p99, total - acc));
        acc += p99;
        return shown > 0 ? <rect key={n} x={x} y={38} width={shown * PPM} height={14} fill={C.focus} stroke={C.panel} strokeWidth={1.5} /> : null;
      })}
      <T x={575} y={28} s={14} f={C.focus} a="end" o={easeOut(seg(t, 0.3, 0.5))}>
        {`${Math.round(total)} ms`}
      </T>
      {sum >= 1 && <line x1={X(160.9)} y1={56} x2={X(160.9)} y2={166} stroke={C.focus} strokeDasharray="5 4" opacity={easeOut(seg(t, 1.8, 2.1))} />}
      {gap > 0 && <rect x={X(125)} y={90} width={(160.9 - 125) * PPM} height={70} fill={C.second} opacity={0.18 * gap} />}
      <Histo x0={30} base={160} hmax={70} ppm={PPM} k={hist} />
      <line x1={30} y1={160} x2={570} y2={160} stroke={C.line} opacity={easeOut(seg(t, 1.9, 2.1))} />
      {p99 > 0 && <line x1={X(125)} y1={84} x2={X(125)} y2={166} stroke={C.focus} strokeWidth={1.8} opacity={p99} />}
      <T x={X(125) - 6} y={188} s={13} f={C.focus} a="end" o={p99}>
        chain p99 125 ms
      </T>
      <T x={X(160.9)} y={188} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 2.0, 2.3))}>
        ceiling
      </T>
      <T x={575} y={206} s={13} f={C.second} a="end" o={easeOut(seg(t, 3.9, 4.3))}>
        below the ceiling
      </T>
    </Svg>
  );
}

// 6 · A million cards, one row of buckets per card. The window stretches from 5 to 60 minutes, the buckets grow with
// it, and the size bar runs from 320 MB to 3.84 GB, crossing the memory line. The state sits in keyed state and is
// mirrored into the online store.
export function RevealStateSize({ t }: StepCtx) {
  const g = easeInOut(seg(t, 0.6, 2.6));
  const w = Math.round(lerp(5, 60, g));
  const mb = w * 64;
  const size = mb < 1000 ? `${mb} MB` : `${(mb / 1000).toFixed(2)} GB`;
  const barW = (mb / 3840) * 440;
  const MEM = 260;
  const stores = easeOut(seg(t, 3.0, 3.4));
  const mir = easeInOut(seg(t, 3.5, 4.1));
  return (
    <Svg label="per-card aggregates, sized by window length, placed in two stores" h={210}>
      <Line2 y={24} l="1,000,000 cards" r={`window ${w} min`} o={easeOut(seg(t, 0, 0.4))} />
      {[0, 1, 2, 3, 4].map((r) =>
        Array.from({ length: w }, (_, c) => <rect key={`${r}-${c}`} x={30 + c * 7} y={40 + r * 8} width={5} height={6} fill={C.quiet} opacity={easeOut(seg(t, 0.2, 0.5))} />),
      )}
      <line x1={30 + MEM} y1={88} x2={30 + MEM} y2={128} stroke={C.second} strokeDasharray="4 3" opacity={easeOut(seg(t, 1.2, 1.5))} />
      <T x={30 + MEM} y={142} s={13} f={C.second} a="middle" o={easeOut(seg(t, 1.2, 1.5))}>
        memory
      </T>
      <rect x={30} y={102} width={Math.max(0, Math.min(barW, MEM))} height={12} rx={2} fill={C.focus} opacity={easeOut(seg(t, 0.4, 0.7))} />
      {barW > MEM && <rect x={30 + MEM} y={102} width={barW - MEM} height={12} rx={2} fill={C.second} />}
      <T x={575} y={113} s={14} f={C.focus} a="end" o={easeOut(seg(t, 0.4, 0.7))}>
        {size}
      </T>
      <Box x={30} y={160} w={150} h={30} label="keyed state" o={stores} />
      <Box x={330} y={160} w={150} h={30} label="online store" lit={mir >= 1} o={stores} />
      <Draw pts={[[180, 175], [330, 175]]} t={t} from={3.5} to={4.1} stroke={C.focus} w={1.6} pen={false} />
      <T x={255} y={168} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 3.8, 4.2))}>
        mirrored
      </T>
    </Svg>
  );
}

// 7 · Three fallback cards. Each prices its own error: approve's false approves add up to 450,000, decline's false
// declines to 15,000, the slower path costs an answer later. Then an ADR card stamps the choice as decided and recorded.
export function RevealFallbackADR({ t }: StepCtx) {
  const CARDS: [string, string, number | null][] = [
    ['approve', 'false approves', 450000],
    ['decline', 'false declines', 15000],
    ['slower path', 'a later answer', null],
  ];
  const adr = easeOutBack(seg(t, 3.2, 3.6));
  return (
    <Svg label="three fallbacks, each with its own named error cost" h={240}>
      {CARDS.map(([n, e, v], i) => {
        const x = 30 + i * 190;
        const at = 0.2 + i * 0.6;
        const k = easeOut(seg(t, at, at + 0.35));
        const c = seg(t, at + 0.35, at + 1.1);
        return (
          <g key={n} opacity={k}>
            <rect x={x} y={20} width={160} height={96} rx={6} fill={C.panel} stroke={C.line} />
            <T x={x + 12} y={44} s={14} f={C.focus}>
              {n}
            </T>
            <T x={x + 12} y={70} s={13} f={C.secondary}>
              {e}
            </T>
            {v !== null ? (
              <T x={x + 12} y={100} s={14} f={i === 0 ? C.badText : C.focus}>
                {Math.round(v * c).toLocaleString('en-US')}
              </T>
            ) : (
              <T x={x + 12} y={100} s={13} f={C.second} o={c}>
                priced in time
              </T>
            )}
          </g>
        );
      })}
      {adr > 0 && (
        <g opacity={Math.min(1, adr)}>
          <rect x={30} y={140} width={540} height={44} rx={6} fill={C.panel} stroke={C.focus} strokeWidth={1.8} />
          <T x={46} y={167} s={14} f={C.focus}>
            ADR · fallback on timeout
          </T>
          <T x={556} y={167} s={13} f={C.focus} a="end">
            recorded
          </T>
        </g>
      )}
      <T x={30} y={220} s={13} f={C.secondary} o={easeOut(seg(t, 3.8, 4.2))}>
        not whichever branch is easiest to code
      </T>
    </Svg>
  );
}

// 8 · At score time a record of the features and the decision drops into the log. Weeks pass and the live features
// drift. The chargeback label arrives and joins the logged record, never today's drifting values.
export function RevealScoreTimeLog({ t }: StepCtx) {
  const drop = easeInOut(seg(t, 0.4, 1.0));
  const weeks = seg(t, 1.2, 2.6);
  const label = easeOutBack(seg(t, 2.6, 3.0));
  const join = easeOut(seg(t, 3.6, 4.0));
  const drift = [0, 1, 2, 3, 4].map((i) => 6 + Math.abs(Math.sin(i * 1.7 + weeks * 9)) * 14);
  return (
    <Svg label="features and decision, logged live, read by a label weeks later" h={210}>
      <T x={30} y={24} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        score-time log
      </T>
      <rect x={30} y={32} width={210} height={36} rx={4} fill="none" stroke={C.line} strokeDasharray="4 3" opacity={easeOut(seg(t, 0, 0.3))} />
      {drop > 0 && <Box x={lerp(60, 40, drop)} y={lerp(118, 36, drop)} w={190} h={28} label="features + decision" lit={join > 0} />}
      <T x={350} y={24} s={13} f={C.secondary} o={easeOut(seg(t, 1.2, 1.5))}>
        today's features
      </T>
      {weeks > 0 &&
        drift.map((h, i) => <rect key={i} x={350 + i * 18} y={66 - h} width={12} height={h} fill={C.quiet} opacity={easeOut(seg(t, 1.2, 1.5))} />)}
      <line x1={30} y1={132} x2={570} y2={132} stroke={C.line} opacity={easeOut(seg(t, 0, 0.3))} />
      <circle cx={80} cy={132} r={5} fill={C.focus} opacity={easeOut(seg(t, 0.2, 0.4))} />
      <T x={80} y={154} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 0.2, 0.4))}>
        scored
      </T>
      {weeks > 0 && <rect x={86} y={130} width={Math.max(0, 434 * weeks)} height={4} fill={C.quiet} />}
      <T x={300} y={154} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 1.6, 2.0))}>
        weeks later
      </T>
      {label > 0 && (
        <g opacity={Math.min(1, label)}>
          <circle cx={520} cy={132} r={5} fill={C.badText} />
          <Box x={455} y={146} w={120} h={28} label="chargeback" fill={C.bad} stroke={C.badText} f={C.focus} />
        </g>
      )}
      <Draw pts={[[470, 146], [470, 90], [135, 90], [135, 64]]} t={t} from={3.0} to={3.6} stroke={C.focus} w={1.6} pen={false} />
      {join > 0 && (
        <g opacity={join}>
          <line x1={540} y1={146} x2={420} y2={70} stroke={C.badText} strokeWidth={1.2} strokeDasharray="4 3" />
          <Cross x={480} y={108} k={join} />
        </g>
      )}
      <T x={300} y={200} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 4.0, 4.4))}>
        it trains on what the model saw
      </T>
    </Svg>
  );
}

// 9 · Five rows, each with the glyph of the move it names.
export function Recap({ t }: StepCtx) {
  const ROWS: [string, string, string?][] = [
    ['p99 budget', 'hop by hop'],
    ['chain p99', 'below the ceiling', C.second],
    ['feature state', 'sized to memory'],
    ['fallback', 'a recorded decision'],
    ['score-time log', 'honest training'],
  ];
  return (
    <Svg label="a p99 budget, a chain bound, sized state, a recorded fallback" h={290}>
      {ROWS.map(([l, r, c], i) => {
        const y = 40 + i * 55;
        const at = i * 0.65;
        return (
          <g key={l} opacity={easeOut(seg(t, at, at + 0.4))}>
            {i === 0 && (
              <g>
                <rect x={30} y={y - 14} width={34} height={14} fill="none" stroke={C.primary} />
                <rect x={66} y={y - 14} width={20} height={14} fill="none" stroke={C.primary} />
                <rect x={66} y={y - 10} width={42} height={6} fill={C.badText} />
              </g>
            )}
            {i === 1 && (
              <g>
                <rect x={30} y={y - 16} width={78} height={6} fill={C.focus} />
                <rect x={30} y={y - 6} width={56} height={6} fill={C.second} />
              </g>
            )}
            {i === 2 && (
              <g>
                <rect x={30} y={y - 12} width={56} height={10} fill={C.focus} />
                <rect x={86} y={y - 12} width={22} height={10} fill={C.second} />
                <line x1={86} y1={y - 18} x2={86} y2={y + 2} stroke={C.second} strokeDasharray="3 2" />
              </g>
            )}
            {i === 3 && [0, 1, 2].map((j) => <rect key={j} x={30 + j * 27} y={y - 16} width={22} height={18} rx={2} fill={C.panel} stroke={j === 1 ? C.focus : C.line} />)}
            {i === 4 && [0, 1, 2, 3].map((j) => <rect key={j} x={30 + j * 20} y={y - 14} width={16} height={14} rx={2} fill="none" stroke={j === 0 ? C.focus : C.line} strokeDasharray={j === 0 ? undefined : '3 2'} />)}
            <Line2 y={y} l={l} r={r} lx={125} lc={C.primary} rc={c ?? C.focus} o={easeOut(seg(t, at + 0.2, at + 0.5))} />
          </g>
        );
      })}
    </Svg>
  );
}

// 10 · Payments grow tenfold. The hop p99 bars only jitter; the feature state runs from 3.84 to 38.4 GB and the store's
// load bar climbs with it. After the answer, those two rows are boxed as the next bottleneck and "raise the timeout" is
// struck out.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const g = easeInOut(seg(t, 0.6, 2.4));
  const k = Math.round(lerp(1, 10, g));
  const gb = lerp(3.84, 38.4, g);
  const box = on ? easeOut(seg(s, 0.3, 0.8)) : 0;
  const cut = on ? easeOut(seg(s, 1.0, 1.4)) : 0;
  return (
    <Svg label="ten times the payments; what actually moves?" h={250}>
      <Line2 y={34} l="payments" r={`×${k}`} lc={C.primary} o={easeOut(seg(t, 0, 0.4))} />
      <rect x={190} y={24} width={Math.max(0, 220 * (k / 10))} height={10} rx={2} fill={C.focus} opacity={easeOut(seg(t, 0, 0.4))} />
      <Line2 y={82} l="hop p99s" r="barely move" lc={C.primary} rc={C.secondary} o={easeOut(seg(t, 0.3, 0.7))} />
      {[0, 1, 2, 3, 4].map((i) => {
        const h = [8, 20, 6, 3, 4][i] + Math.sin(t * 6 + i) * 1.2;
        return <rect key={i} x={190 + i * 22} y={86 - h} width={14} height={h} fill={C.quiet} opacity={easeOut(seg(t, 0.3, 0.7))} />;
      })}
      <Line2 y={130} l="feature state" r={`${gb >= 10 ? gb.toFixed(1) : gb.toFixed(2)} GB`} lc={C.primary} o={easeOut(seg(t, 0.5, 0.9))} />
      <rect x={190} y={120} width={Math.max(0, 220 * (gb / 38.4))} height={10} rx={2} fill={C.focus} opacity={easeOut(seg(t, 0.5, 0.9))} />
      <Line2 y={170} l="store load" r="grows with it" lc={C.primary} o={easeOut(seg(t, 0.7, 1.1))} />
      <rect x={190} y={160} width={Math.max(0, 220 * lerp(0.1, 1, g))} height={10} rx={2} fill={C.focus} opacity={easeOut(seg(t, 0.7, 1.1))} />
      {box > 0 && <rect x={20} y={106} width={560} height={78} rx={6} fill="none" stroke={C.focus} strokeWidth={1.8} opacity={box} />}
      {on ? (
        <g>
          <T x={30} y={222} s={14} f={C.focus} o={box}>
            next bottleneck
          </T>
          <T x={575} y={222} s={13} f={C.secondary} a="end" o={cut}>
            raise the timeout
          </T>
          {cut > 0 && <line x1={420} y1={217} x2={lerp(420, 577, cut)} y2={217} stroke={C.badText} strokeWidth={2} />}
        </g>
      ) : (
        <T x={300} y={222} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 2.0, 2.4))}>
          what grows with the payment rate?
        </T>
      )}
    </Svg>
  );
}
