import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, rng, seg } from '../../../../../reels/anim';
import { C, Decode, Draw, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = keys; taupe = empty slots; caramel = the bucket being migrated
// and the migration pointer; cinnamon = the compared alternative (incremental migration against
// doubling; new inserts landing in the new table); cherryText = the one insert that pays for every
// move, and the sustained memory cost. Every printed number is asserted in examples.py; per-insert
// costs depend on Python's per-process hash seed, so the series are drawn as shape only.

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

/** A row of n slots; `full(i)` fills a slot; `hl(i)` outlines it in a colour. */
function Row({ x0, y, n, w = 30, full, hl, o = 1 }: { x0: number; y: number; n: number; w?: number; full: (i: number) => boolean; hl?: (i: number) => string | undefined; o?: number }) {
  return (
    <g opacity={o}>
      {Array.from({ length: n }, (_, i) => {
        const h = hl?.(i);
        return <rect key={i} x={x0 + i * w} y={y} width={w - 4} height={24} rx={3} fill={full(i) ? C.mocha : C.cocoa} stroke={h ?? (full(i) ? C.crema : C.taupe)} strokeWidth={h ? 2 : 1.2} />;
      })}
    </g>
  );
}

const HOME8 = [1, 3, 4, 6, 0, 7, 2, 5];
const HOME16 = [9, 3, 12, 6, 0, 15, 2, 5];

// 1 · Fixed size, until now. Three small tables (chained, open-addressed, a Swiss group) fill up; one more key
// arrives at each and bounces off with a red question.
export function Opening({ t }: StepCtx) {
  const fill = Math.floor(seg(t, 0.2, 1.4) * 6 + 1e-9);
  const knock = easeOut(seg(t, 1.6, 2.0));
  const bounce = Math.abs(Math.sin(clamp(seg(t, 1.6, 2.6)) * Math.PI * 2)) * 10;
  const names = ['chaining', 'open addressing', 'Swiss group'];
  return (
    <Svg label="Three fixed-size tables fill up and one more key arrives with nowhere to go" h={280}>
      <T x={30} y={26} s={13} f={C.latte}>three tables, all fixed size</T>
      {names.map((n, r) => (
        <g key={n}>
          <T x={30} y={78 + r * 56} s={13} f={C.crema}>{n}</T>
          <Row x0={210} y={62 + r * 56} n={6} w={36} full={(i) => i < fill} />
          <rect x={440 + bounce} y={64 + r * 56} width={26} height={20} rx={3} fill={C.cocoa} stroke={C.cherryText} strokeWidth={1.6} opacity={knock} />
          <T x={490} y={80 + r * 56} s={15} f={C.cherryText} o={knock * (0.6 + 0.4 * Math.sin(t * 5 + r))}>?</T>
        </g>
      ))}
      <T x={30} y={256} s={13} f={C.cherryText} o={easeOut(seg(t, 2.4, 2.8))}>one more key: what happens next?</T>
    </Svg>
  );
}

// 2 · Doubling. A full table of 8; one insert; a table of 16 appears and every entry flies across at once to
// its new slot. The cost bar for that single insert grows tall beside it.
export function DoublingCost({ t }: StepCtx) {
  const grow = easeOut(seg(t, 0.5, 0.9));
  const mv = easeInOut(seg(t, 1.0, 2.0));
  const bar = easeOut(seg(t, 1.0, 2.0));
  return (
    <Svg label="A full table doubles: a table twice the size appears and every entry is rehashed into it during one insert" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>table full: double capacity, rehash everyone, now</T>
      <Row x0={40} y={50} n={8} full={() => true} o={1 - 0.6 * mv} />
      <Row x0={40} y={150} n={16} full={() => false} o={grow} />
      {HOME8.map((h8, k) => {
        const x = lerp(40 + h8 * 30, 40 + HOME16[k] * 30, mv);
        const y = lerp(50, 150, mv);
        return mv > 0 ? <rect key={k} x={x} y={y} width={26} height={24} rx={3} fill={C.mocha} stroke={C.caramel} strokeWidth={1.6} /> : null;
      })}
      <T x={540} y={146} s={13} f={C.cherryText} a="middle" o={bar}>cost</T>
      <rect x={526} y={250 - 90 * bar} width={28} height={90 * bar} rx={2} fill={C.cherryText} />
      <T x={30} y={230} s={13} f={C.cherryText} o={easeOut(seg(t, 2.0, 2.4))}>every entry moves, in this one insert</T>
      <T x={30} y={254} s={13} f={C.latte} o={easeOut(seg(t, 2.4, 2.8))}>cheap on average; one insert sits through it</T>
    </Svg>
  );
}

// 3 · Predict: the resize insert vs its neighbours. Short cost bars stream in; one, ringed, is the resize.
// After answering, that bar shoots up, red, as tall as the whole table.
export function LatencyPredictViz({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const shown = Math.floor(seg(t, 0.1, 1.5) * 16 + 1e-9);
  const R = 10;
  const spike = answered ? easeOutBack(seg(s, 0.1, 0.5)) : 0;
  return (
    <Svg label="A row of ordinary insert costs, one of which triggers the rehash; that one insert costs as much as the whole table" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>a row of inserts: one triggers the rehash</T>
      <line x1={40} y1={220} x2={560} y2={220} stroke={C.mocha} strokeWidth={1.2} />
      {Array.from({ length: 16 }, (_, i) => {
        const h = i === R ? lerp(12, 170, clamp(spike)) : 12;
        return <rect key={i} x={50 + i * 32} y={220 - h} width={22} height={h} rx={2} fill={i === R ? (answered ? C.cherryText : C.caramel) : C.latte} opacity={i < shown || answered ? 1 : 0} />;
      })}
      {!answered && <circle cx={50 + R * 32 + 11} cy={200} r={18 + 2 * Math.sin(t * 5)} fill="none" stroke={C.caramel} strokeWidth={1.4} opacity={shown > R ? 1 : 0} />}
      {!answered && <T x={30} y={270} s={15} f={C.caramel} o={0.7 + 0.3 * Math.sin(t * 3)}>how does that one compare?</T>}
      {answered && (
        <>
          <Decode text="proportional to the table" t={s} at={0.3} dur={0.4} x={30} y={256} s={14} f={C.cherryText} />
          <T x={30} y={280} s={13} f={C.latte} o={easeOut(seg(s, 0.9, 1.3))}>far slower than its neighbours</T>
        </>
      )}
    </Svg>
  );
}

// 4 · Redis's two live tables. Old (8) and new (16) side by side; a caramel migration pointer walks the old table
// a couple of buckets at a time, moving their entries across, while new inserts land straight in the new table.
export function IncrementalIdea({ t }: StepCtx) {
  const p = seg(t, 0.8, 3.2) * 8;
  const ptr = Math.min(8, Math.floor(p / 2) * 2);
  const ins = Math.floor(seg(t, 1.2, 3.2) * 3 + 1e-9);
  const newIns = [11, 13, 7];
  return (
    <Svg label="Redis keeps the old and new tables live together and migrates a few buckets at a time while new inserts go straight into the new table" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>old table, still live</T>
      <Row x0={40} y={40} n={8} full={(i) => i >= ptr} hl={(i) => (i >= ptr && i < ptr + 2 && ptr < 8 ? C.caramel : undefined)} />
      <path d={`M ${40 + ptr * 30 + 13} 74 l -6 10 h 12 z`} fill={C.caramel} opacity={ptr < 8 ? 1 : 0.3} />
      <T x={300} y={58} s={13} f={C.caramel} o={easeOut(seg(t, 0.6, 0.9))}>migration pointer</T>
      <T x={30} y={124} s={13} f={C.cinnamon} o={easeOut(seg(t, 0.3, 0.6))}>new table, both live</T>
      <Row x0={40} y={140} n={16} full={(i) => HOME8.some((h, k) => h < ptr && HOME16[k] === i) || newIns.slice(0, ins).includes(i)} hl={(i) => (newIns.slice(0, ins).includes(i) ? C.cinnamon : undefined)} o={easeOut(seg(t, 0.3, 0.6))} />
      {HOME8.map((h, k) => {
        const f = easeInOut(clamp(p - h));
        return f > 0 && f < 1 ? <rect key={k} x={lerp(40 + h * 30, 40 + HOME16[k] * 30, f)} y={lerp(40, 140, f)} width={26} height={24} rx={3} fill={C.mocha} stroke={C.caramel} strokeWidth={1.6} /> : null;
      })}
      <T x={30} y={214} s={13} f={C.cinnamon} o={easeOut(seg(t, 1.4, 1.8))}>new inserts land in the new table</T>
      <T x={30} y={238} s={13} f={C.caramel} o={easeOut(seg(t, 2.2, 2.6))}>moved a little at a time, not all at once</T>
    </Svg>
  );
}

// 5 · Predict: who moves the pointer? Operation tokens (lookup, insert) arrive. Before answering, the pointer
// sits still with a question. After: each arriving operation nudges the pointer one bucket and carries it.
export function MigrationPredictViz({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const ops = ['get', 'set', 'get', 'set'];
  const p = answered ? seg(s, 0.1, 2.1) * 4 : 0;
  const ptr = Math.floor(p + 1e-9);
  return (
    <Svg label="Each ordinary lookup or insert that touches the table nudges the migration pointer forward; there is no background thread" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>what makes the pointer move?</T>
      <Row x0={40} y={60} n={8} full={(i) => i >= ptr} />
      <path d={`M ${40 + ptr * 30 + 13} 94 l -6 10 h 12 z`} fill={C.caramel} />
      {!answered && <T x={40 + 13} y={130} s={15} f={C.caramel} a="middle" o={0.6 + 0.4 * Math.sin(t * 4)}>?</T>}
      {ops.map((o, i) => {
        const f = answered ? easeInOut(clamp(p - i)) : 0;
        const x = lerp(470, 40 + i * 30 + 13, f);
        const vis = answered && f > 0 && f < 1 ? 1 : 0;
        return (
          <g key={i} opacity={vis}>
            <rect x={x - 18} y={150 + i * 0} width={36} height={22} rx={4} fill={C.cocoa} stroke={C.cinnamon} strokeWidth={1.4} />
            <T x={x} y={166} s={13} f={C.cinnamon} a="middle">{o}</T>
          </g>
        );
      })}
      {!answered && ['get', 'set', 'get'].map((o, i) => <T key={i} x={390 + i * 50} y={166} s={13} f={C.cinnamon} a="middle" o={0.6}>{o}</T>)}
      {!answered && <T x={30} y={262} s={15} f={C.caramel} o={0.7 + 0.3 * Math.sin(t * 3)}>who moves it forward?</T>}
      {answered && (
        <>
          <Decode text="every lookup and insert" t={s} at={0.8} dur={0.5} x={30} y={222} s={14} f={C.caramel} />
          <T x={30} y={246} s={13} f={C.latte} o={easeOut(seg(s, 1.3, 1.7))}>no thread, no idle-time trigger</T>
        </>
      )}
    </Svg>
  );
}

// 6 · The bound. Operations march along a timeline; each pays its own small cost plus a capped migration chunk
// (caramel) that never crosses the dashed cap line, while the table-size marker above keeps growing.
export function BoundedStep({ t }: StepCtx) {
  const n = Math.floor(seg(t, 0.2, 2.8) * 14 + 1e-9);
  const r = rng(3);
  const own = Array.from({ length: 14 }, () => 6 + r() * 6);
  const mig = Array.from({ length: 14 }, () => 20 + r() * 14);
  const cap = 40;
  return (
    <Svg label="Each operation pays its own cost plus a capped migration chunk that stays under the bound however large the table grows" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>each operation moves a bounded number of buckets</T>
      <line x1={40} y1={210} x2={560} y2={210} stroke={C.mocha} strokeWidth={1.2} />
      <line x1={40} y1={210 - (cap + 14)} x2={560} y2={210 - (cap + 14)} stroke={C.caramel} strokeWidth={1.4} strokeDasharray="6 4" opacity={easeOut(seg(t, 0.4, 0.8))} />
      <T x={560} y={210 - (cap + 14) - 8} s={13} f={C.caramel} a="end" o={easeOut(seg(t, 0.4, 0.8))}>cap</T>
      {Array.from({ length: n }, (_, i) => (
        <g key={i}>
          <rect x={50 + i * 36} y={210 - own[i]} width={24} height={own[i]} fill={C.latte} />
          <rect x={50 + i * 36} y={210 - own[i] - mig[i]} width={24} height={mig[i]} fill={C.caramel} opacity={0.85} />
        </g>
      ))}
      <T x={30} y={84} s={13} f={C.latte}>table size</T>
      <rect x={140} y={74} width={lerp(60, 400, clamp(seg(t, 0.2, 2.8)))} height={10} rx={2} fill={C.mocha} />
      <T x={30} y={250} s={13} f={C.caramel} o={easeOut(seg(t, 2.6, 3.0))}>bounded, every single time</T>
      <T x={30} y={274} s={13} f={C.latte} o={easeOut(seg(t, 2.9, 3.3))}>no matter how large the table grows</T>
    </Svg>
  );
}

// 7 · Memory. Two memory-over-time traces: doubling jumps to old + new for one operation and drops back;
// incremental holds old + new for a long red plateau, for every operation until the migration ends.
export function MemoryTradeoff({ t }: StepCtx) {
  const p = clamp(seg(t, 0.3, 2.6));
  const X = (u: number) => 60 + u * 480;
  const dbl = (u: number) => (u > 0.3 && u < 0.33 ? 3 : u >= 0.33 ? 2 : 1);
  const inc = (u: number) => (u > 0.3 && u < 0.8 ? 3 : u >= 0.8 ? 2 : 1);
  const path = (f: (u: number) => number, y0: number) => {
    const pts: [number, number][] = [];
    for (let k = 0; k <= 120; k++) {
      const u = (k / 120) * p;
      pts.push([X(u), y0 - f(u) * 22]);
    }
    return pts;
  };
  return (
    <Svg label="Doubling holds both tables for one operation; incremental migration holds both tables for many operations, a sustained memory cost" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>doubling: both tables live for 1 operation</T>
      <line x1={60} y1={110} x2={540} y2={110} stroke={C.mocha} strokeWidth={1} />
      <Draw pts={path(dbl, 110)} t={1} from={0} to={0.01} stroke={C.crema} w={2} pen={false} />
      <T x={30} y={150} s={13} f={C.cherryText} o={easeOut(seg(t, 1.2, 1.5))}>incremental: both tables live for many operations</T>
      <line x1={60} y1={236} x2={540} y2={236} stroke={C.mocha} strokeWidth={1} />
      {p > 0.3 && <rect x={X(0.3)} y={236 - 3 * 22} width={X(Math.min(p, 0.8)) - X(0.3)} height={3 * 22} fill={C.cherry} opacity={0.5} />}
      <Draw pts={path(inc, 236)} t={1} from={0} to={0.01} stroke={C.cherryText} w={2} pen={false} />
      <T x={30} y={278} s={13} f={C.latte} o={easeOut(seg(t, 2.8, 3.2))}>a real, sustained memory cost for smoother latency</T>
    </Svg>
  );
}

// 8 · Prove it. 4,000 inserts, the same key sequence into both tables. Top: doubling's per-insert cost is flat
// with a tall spike at every resize. Bottom: incremental's is a carpet of small bounded steps. Same total work.
export function ProveIt({ t }: StepCtx) {
  const p = clamp(seg(t, 0.3, 2.6));
  const N = 128;
  const spikes = [4, 8, 16, 32, 64, 128].map((v) => v - 1);
  const r = rng(8);
  const inc = Array.from({ length: N }, () => 4 + r() * 8);
  const cw = 520 / N;
  return (
    <Svg label="Four thousand inserts into both tables: doubling pays in tall spikes at each resize, incremental migration in many small bounded steps, for the same total work" h={300}>
      <T x={30} y={22} s={13} f={C.crema}>4,000 inserts, same keys. doubling: tall spikes</T>
      {Array.from({ length: Math.floor(p * N) }, (_, i) => {
        const sp = spikes.indexOf(i);
        const h = sp >= 0 ? 12 + (sp + 1) * 15 : 3;
        return <rect key={i} x={40 + i * cw} y={128 - h} width={Math.max(1.5, cw - 1)} height={h} fill={sp >= 0 ? C.cherryText : C.latte} />;
      })}
      <line x1={40} y1={128} x2={560} y2={128} stroke={C.mocha} strokeWidth={1} />
      <T x={30} y={160} s={13} f={C.cinnamon}>incremental: many small, bounded steps</T>
      {Array.from({ length: Math.floor(p * N) }, (_, i) => <rect key={i} x={40 + i * cw} y={230 - inc[i]} width={Math.max(1.5, cw - 1)} height={inc[i]} fill={C.cinnamon} />)}
      <line x1={40} y1={230} x2={560} y2={230} stroke={C.mocha} strokeWidth={1} />
      <T x={30} y={264} s={13} f={C.latte} o={easeOut(seg(t, 2.7, 3.1))}>same final table, same total work</T>
      <T x={30} y={288} s={13} f={C.latte} o={easeOut(seg(t, 3.0, 3.4))}>a different schedule for who pays, and when</T>
    </Svg>
  );
}
