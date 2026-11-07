import { useEffect, useState } from 'react';
import { Bar, C, Plot, Svg, T } from '../../../../../reels/kit';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';

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

/** A number counted up to its final value, with fixed decimals and thousands separators. */
function num(v: number, d = 0) {
  return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}

/** A label-left / value-right row, stacked vertically with generous gaps (DESIGN.md, phone text scaling).
 * `k` fades it in and slides it up a little; the value is whatever string the scene passes (a count in progress). */
function Row({ y, label, value, valueColor = C.crema, big = false, k = 1 }: { y: number; label: string; value: string; valueColor?: string; big?: boolean; k?: number }) {
  return (
    <g opacity={k} transform={`translate(0 ${((1 - k) * 10).toFixed(2)})`}>
      <T x={25} y={y} s={15} f={C.latte}>
        {label}
      </T>
      <T x={575} y={y} s={big ? 22 : 17} f={valueColor} a="end" w={600}>
        {value}
      </T>
    </g>
  );
}

/** A verdict tick at the right edge, drawn in by `k`. */
function Tick({ y, k, f = C.focus }: { y: number; k: number; f?: string }) {
  return <path d={`M540 ${y} l8 8 l16 -18`} fill="none" stroke={f} strokeWidth={3} strokeDasharray="40" strokeDashoffset={40 * (1 - k)} />;
}

/** A time bar that grows to its share over `k`; its figure fades in once the bar is most of the way there. */
function timeBar(x: number, y: number, frac: number, display: string, label: string, fill: string, k: number) {
  return (
    <g key={label} opacity={k > 0 ? 1 : 0}>
      <T x={x} y={y - 20} s={13} f={C.latte} o={clamp(k * 3, 0, 1)}>
        {label}
      </T>
      <Bar x={x} y={y} w={340 * frac * k} h={20} full={340} fill={fill} />
      <T x={x} y={y + 38} s={13} f={C.crema} o={seg(k, 0.6, 1)}>
        {display}
      </T>
    </g>
  );
}

/** Two timed rows that count up, each with a bar under it scaled to the slower one. */
function TwoTimes({ t, rows, max }: { t: number; rows: [string, number, number, string][]; max: number }) {
  return (
    <g>
      {rows.map(([label, ms, d, color], i) => {
        const k = easeOut(seg(t, 0.2 + i * 1.1, 0.8 + i * 1.1));
        const c = easeOut(seg(t, 0.3 + i * 1.1, 1.3 + i * 1.1));
        const y = 60 + i * 60;
        return (
          <g key={label}>
            <Row y={y} label={label} value={`${num(ms * c, d)} ms`} valueColor={color} big k={k} />
            <rect x={25} y={y + 14} width={k > 0 ? Math.max(3, 550 * (ms / max) * c) : 0} height={6} rx={3} fill={color} opacity={0.8} />
          </g>
        );
      })}
    </g>
  );
}

/** A predict step's verdict, sliding up into place once the learner has answered. */
function Verdict({ answer, text, y = 184, f = C.focus }: { answer: number | null; text: string; y?: number; f?: string }) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  if (answer === null) return null;
  return (
    <T x={300} y={lerp(y + 8, y, v)} s={15} f={f} a="middle" o={v}>
      {text}
    </T>
  );
}

/** A Row whose "?" becomes the answer once the learner has answered, underlined as it lands. */
function AnswerRow({ y, label, answer, value, k, f = C.focus }: { y: number; label: string; answer: number | null; value: string; k: number; f?: string }) {
  const s = useSinceAnswer(answer !== null);
  const u = answer !== null ? easeOut(seg(s, 0.2, 0.7)) : 0;
  const uw = Math.min(250, value.length * 10.7);
  return (
    <g>
      <Row y={y} label={label} value={answer !== null ? value : '?'} valueColor={answer !== null ? f : C.crema} k={k} />
      {answer !== null && <rect x={575 - uw * u} y={y + 12} width={uw * u} height={3} fill={f} />}
    </g>
  );
}

/** Twelve rows' values in physical order: one column matched to row order, one scattered across it. */
/** A cell with a centred label. */
function Cell({ x, y, w, h = 28, label, o = 1, stroke = C.mocha, f = C.crema }: { x: number; y: number; w: number; h?: number; label: string; o?: number; stroke?: string; f?: string }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={C.cocoa} stroke={stroke} strokeWidth={1.5} />
      <T x={x + w / 2} y={y + h / 2 + 4.5} s={12} f={f} a="middle">
        {label}
      </T>
    </g>
  );
}
/** A small cross drawn by `k`. */
function Cross({ x, y, k }: { x: number; y: number; k: number }) {
  return <path d={`M${x - 7} ${y - 7} l14 14 m0 -14 l-14 14`} stroke={C.cherryText} strokeWidth={2.5} opacity={k} />;
}

/** A small tick at (x, y), drawn by `k`. */
function MiniTick({ x, y, k, f = C.focus }: { x: number; y: number; k: number; f?: string }) {
  return <path d={`M${x} ${y} l4 4 l8 -9`} fill="none" stroke={f} strokeWidth={2} strokeDasharray="20" strokeDashoffset={20 * (1 - k)} />;
}
/** A small padlock at (x, y), drawn in by `k`. */
function Lock({ x, y, k, f = C.second }: { x: number; y: number; k: number; f?: string }) {
  return (
    <g opacity={k}>
      <path d={`M${x + 3} ${y} v-4 a5 5 0 0 1 10 0 v4`} fill="none" stroke={f} strokeWidth={2} />
      <rect x={x} y={y} width={16} height={12} rx={2} fill={f} />
    </g>
  );
}
/** A request arrow from (x1, y) toward x2, drawn by `k`, with a small label above it. */
function Req({ x1, x2, y, k, label, f = C.crema, back = 0 }: { x1: number; x2: number; y: number; k: number; label?: string; f?: string; back?: number }) {
  const x = lerp(x1, x2, k) - (x2 - x1) * 0.35 * back;
  return (
    <g opacity={k > 0 ? 1 : 0}>
      <line x1={x1} y1={y} x2={x} y2={y} stroke={f} strokeWidth={1.8} />
      <path d={`M${x} ${y} l${back > 0 ? 8 : -8} -5 v10 z`} fill={f} />
      {label && (
        <T x={(x1 + x2) / 2} y={y - 9} s={11} f={f} a="middle">
          {label}
        </T>
      )}
    </g>
  );
}

/** A cell whose bottom edge carries a thin progress bar, `p` of the way along: the work actually running. */
function Work({ x, y, w, p, label = 'the work', o = 1, dashed = false, f = C.focus }: { x: number; y: number; w: number; p: number; label?: string; o?: number; dashed?: boolean; f?: string }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={32} rx={4} fill={C.cocoa} stroke={p > 0 && p < 1 ? f : C.mocha} strokeWidth={1.5} strokeDasharray={dashed ? '5 4' : undefined} />
      <T x={x + w / 2} y={y + 18} s={12} f={dashed ? C.latte : C.crema} a="middle">
        {label}
      </T>
      {p > 0 && <rect x={x + 4} y={y + 25} width={(w - 8) * p} height={4} fill={f} />}
    </g>
  );
}

/** A diagonal arrow from (x1, y1) to (x2, y2), drawn by `k`. */
function Diag({ x1, y1, x2, y2, k, f = C.second }: { x1: number; y1: number; x2: number; y2: number; k: number; f?: string }) {
  const x = lerp(x1, x2, k);
  const y = lerp(y1, y2, k);
  const a = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  return (
    <g opacity={k > 0 ? 1 : 0}>
      <line x1={x1} y1={y1} x2={x} y2={y} stroke={f} strokeWidth={1.8} />
      <path d="M0 0 l-8 -5 v10 z" fill={f} transform={`translate(${x} ${y}) rotate(${a})`} />
    </g>
  );
}

/** Two lanes, run 1 above and run 2 below, each: run cell, the work, result. `p1`/`p2` drive each run's three moves. */
function Lanes({ p1, p2, w2 = 1, ys = [30, 150] }: { p1: number; p2: number; w2?: number; ys?: number[] }) {
  return (
    <g>
      {[p1, p2].map((p, i) => {
        const y = ys[i];
        return (
          <g key={i}>
            <Cell x={25} y={y} w={90} h={32} label={`run ${i + 1}`} />
            <Req x1={115} x2={168} y={y + 16} k={i === 1 ? seg(p, 0, 0.2) * w2 : seg(p, 0, 0.2)} f={C.latte} />
            <Work x={170} y={y} w={150} p={seg(p, 0.2, 0.8) * (i === 1 ? w2 : 1)} o={i === 1 ? lerp(0.5, 1, w2) : 1} dashed={i === 1 && w2 < 1} />
            <Req x1={320} x2={398} y={y + 16} k={i === 1 ? seg(p, 0.8, 1) * w2 : seg(p, 0.8, 1)} f={C.latte} />
            <Cell x={400} y={y} w={150} h={32} label="result" o={p > 0.95 || (i === 1 && w2 < 1) ? 1 : 0.5} />
          </g>
        );
      })}
    </g>
  );
}

// 0 · Hook. Two runs of the same work, one above the other. Run 1 goes through; run 2's path waits on a question.
export function Hook({ t }: StepCtx) {
  return (
    <Svg label="a reused computation runs twice. Does Spark remember, or redo it?" h={230}>
      <g opacity={easeOut(seg(t, 0.1, 0.5))}>
        <Lanes p1={easeInOut(seg(t, 0.5, 2.0))} p2={0} />
      </g>
      <T x={245} y={216} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 2.6, 3.0))}>
        remembered, or redone?
      </T>
    </Svg>
  );
}

// 1 · Uncached. Run 1 drives through the work and the UDF counter climbs to 8,000; run 2 drives through the same work
// again and the counter climbs to 16,000.
export function RevealBaselineBothRedo({ t }: StepCtx) {
  const p1 = easeInOut(seg(t, 0.3, 1.7));
  const p2 = easeInOut(seg(t, 1.9, 3.3));
  const calls = 8000 * seg(p1, 0.2, 0.8) + 8000 * seg(p2, 0.2, 0.8);
  return (
    <Svg label="measured: uncached, both runs genuinely redo the whole thing." h={240}>
      <Lanes p1={p1} p2={p2} ys={[30, 110]} />
      <Row y={215} label="UDF calls" value={num(calls)} valueColor={p2 > 0.99 ? C.cherryText : C.crema} k={easeOut(seg(t, 0.2, 0.5))} />
    </Svg>
  );
}

// 2 · Predict. Run 1 goes through and its result drops into a pale-blue cache; run 2 waits. Reuse, or redo?
export function PredictCacheReuse({ t, answer }: StepCtx) {
  const p1 = easeInOut(seg(t, 0.2, 1.4));
  return (
    <Svg label="cache that same computation. Does run two reuse it, or redo it?" h={240}>
      <Lanes p1={p1} p2={0} />
      <Cell x={400} y={90} w={150} h={28} label="cache" stroke={C.second} o={easeOut(seg(t, 1.4, 1.7))} />
      <T x={245} y={128} s={15} f={C.focus} a="middle" o={answer === null ? easeOut(seg(t, 1.7, 2.1)) : 0}>
        run 2: reuse or redo?
      </T>
      <Verdict answer={answer} y={222} text="it reuses run one's answer" />
    </Svg>
  );
}

// 3 · Cached. Run 1 pays the work (counter to 8,000) and fills the cache; run 2's arrow goes straight to the cache and
// down to its result, the work box dashed and idle; the counter holds at 8,000.
export function RevealCachedReuses({ t }: StepCtx) {
  const p1 = easeInOut(seg(t, 0.3, 1.7));
  const c = easeOut(seg(t, 1.7, 2.0));
  const r = easeOut(seg(t, 2.2, 2.8));
  const dn = easeOut(seg(t, 2.8, 3.2));
  return (
    <Svg label="measured: run one pays once; run two reuses it, immediately." h={250}>
      <Lanes p1={p1} p2={dn > 0.9 ? 1 : 0} w2={0} />
      <Cell x={400} y={90} w={150} h={28} label="cache" stroke={C.second} o={c} />
      <Diag x1={115} y1={150} x2={396} y2={112} k={r} />
      <Down x={475} y1={118} y2={148} k={dn} f={C.second} />
      <Row y={225} label="UDF calls" value={num(8000 * seg(p1, 0.2, 0.8))} valueColor={dn > 0.99 ? C.second : C.crema} k={easeOut(seg(t, 0.2, 0.5))} />
      <MiniTick x={330} y={218} k={easeOut(seg(t, 3.4, 3.8))} f={C.second} />
    </Svg>
  );
}

/** A downward arrow from (x, y1) to (x, y2), drawn by `k`. */
function Down({ x, y1, y2, k, f = C.latte }: { x: number; y1: number; y2: number; k: number; f?: string }) {
  const y = lerp(y1, y2, k);
  return (
    <g opacity={k > 0 ? 1 : 0}>
      <line x1={x} y1={y1} x2={x} y2={y} stroke={f} strokeWidth={1.8} />
      <path d={`M${x} ${y} l-5 -8 h10 z`} fill={f} />
    </g>
  );
}

// 4 · Sits ready. The cache hands its result out to three reuses in turn; the work box beside it stays dashed and idle.
export function ElaborateCacheSitsReady({ t }: StepCtx) {
  return (
    <Svg label="the cached data sits ready; the computation behind it goes unused." h={230}>
      <Work x={25} y={60} w={170} p={0} dashed />
      <T x={25} y={122} s={11} f={C.latte} o={easeOut(seg(t, 2.8, 3.2))}>
        never runs again
      </T>
      <Cell x={240} y={60} w={150} h={32} label="cache" stroke={C.second} o={easeOut(seg(t, 0.1, 0.4))} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Req x1={392} x2={540} y={30 + i * 46} k={easeOut(seg(t, 0.6 + i * 0.6, 1.0 + i * 0.6))} f={C.second} />
        </g>
      ))}
      <T x={392} y={170} s={11} f={C.second} o={easeOut(seg(t, 2.4, 2.8))}>
        handed back as-is
      </T>
      <Row y={210} label="UDF calls" value="8,000" valueColor={C.second} k={easeOut(seg(t, 3.2, 3.6))} />
    </Svg>
  );
}

const BLOCKS = [0, 1, 2, 3, 4, 5, 6, 7];
const LOST = [5, 6, 7];

// 5 · Predict. Eight cached blocks fill a memory bar; something else pushes in from the right and three blocks fall out.
export function PredictEvictionChoice({ t, answer }: StepCtx) {
  const p = easeInOut(seg(t, 0.4, 1.3));
  return (
    <Svg label="memory pressure forces eviction. Does a memory-only cache survive?" h={230}>
      <T x={25} y={24} s={11} f={C.second}>
        MEMORY_ONLY cache
      </T>
      <rect x={25} y={36} width={540} height={36} rx={3} fill="none" stroke={C.latte} strokeWidth={1.4} />
      {BLOCKS.map((i) => {
        const lost = LOST.includes(i);
        return <rect key={i} x={31 + i * 40} y={lost ? lerp(42, 100, p) : 42} width={32} height={24} fill={C.mocha} stroke={C.second} strokeWidth={1.4} opacity={lost ? 1 - p : 1} />;
      })}
      <rect x={lerp(565, 231, p)} y={42} width={lerp(0, 328, p)} height={24} fill={C.mocha} stroke={C.focus} strokeWidth={1.4} />
      <T x={300} y={140} s={15} f={C.focus} a="middle" o={answer === null ? easeOut(seg(t, 1.5, 1.9)) : 0}>
        do the lost blocks survive?
      </T>
      <Verdict answer={answer} y={200} text="gone: redone from the work" />
    </Svg>
  );
}

// 6 · Measured. MEMORY_ONLY: three blocks vanish; on the next touch the work reruns and the counter climbs from
// 150,000 to 300,000. MEMORY_AND_DISK: three blocks drop into disk, then rise back; the counter holds.
export function RevealRecomputeVsDisk({ t }: StepCtx) {
  const ev = easeInOut(seg(t, 0.3, 1.0));
  const re = easeInOut(seg(t, 1.4, 2.4));
  const back = easeInOut(seg(t, 2.8, 3.6));
  return (
    <Svg label="measured: memory-only recomputes; memory-and-disk reads back." h={250}>
      <T x={25} y={22} s={11} f={C.latte}>
        MEMORY_ONLY
      </T>
      {BLOCKS.map((i) => (
        <rect
          key={i}
          x={25 + i * 36}
          y={34}
          width={30}
          height={22}
          fill={C.mocha}
          stroke={LOST.includes(i) && re > 0 ? C.cherryText : C.second}
          strokeWidth={1.4}
          opacity={LOST.includes(i) ? Math.max(1 - ev, re) : 1}
        />
      ))}
      <Work x={330} y={30} w={110} p={re > 0 && re < 1 ? re : 0} f={C.cherryText} />
      <T x={575} y={30} s={11} f={C.latte} a="end">
        UDF calls
      </T>
      <T x={575} y={54} s={13} f={re > 0.99 ? C.cherryText : C.crema} a="end">
        {num(150000 + 150000 * re)}
      </T>
      <T x={25} y={120} s={11} f={C.latte}>
        MEMORY_AND_DISK
      </T>
      {BLOCKS.map((i) => {
        const lost = LOST.includes(i);
        const y = lost ? lerp(132, 196, ev * (1 - back)) : 132;
        return <rect key={i} x={25 + i * 36} y={y} width={30} height={22} fill={C.mocha} stroke={C.second} strokeWidth={1.4} />;
      })}
      <rect x={199} y={190} width={110} height={34} rx={4} fill="none" stroke={C.latte} strokeWidth={1.4} />
      <T x={185} y={212} s={11} f={C.latte} a="end">
        disk
      </T>
      <T x={575} y={128} s={11} f={C.latte} a="end">
        UDF calls
      </T>
      <T x={575} y={152} s={13} f={back > 0.99 ? C.second : C.crema} a="end">
        150,000
      </T>
      <MiniTick x={480} y={176} k={easeOut(seg(t, 3.7, 4.1))} f={C.second} />
    </Svg>
  );
}

// 7 · The level decides. "Out of room" forks: forgotten (a long cherry cost bar: redo the work) or written to disk
// (a short pale-blue bar: read back).
export function ElaborateStorageLevelDecides({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.6, 1.1));
  return (
    <Svg label="the storage level decides what losing a cached piece actually costs." h={240}>
      <Cell x={25} y={92} w={150} h={32} label="out of room" o={easeOut(seg(t, 0.1, 0.4))} />
      <Diag x1={175} y1={100} x2={226} y2={56} k={a} f={C.latte} />
      <Diag x1={175} y1={116} x2={226} y2={160} k={a} f={C.latte} />
      <T x={235} y={50} s={11} f={C.cherryText} o={easeOut(seg(t, 1.1, 1.5))}>
        forgotten: redo from scratch
      </T>
      <rect x={235} y={62} width={320 * easeOut(seg(t, 1.5, 2.5))} height={12} fill={C.bad} stroke={C.cherryText} strokeWidth={1} />
      <T x={235} y={160} s={11} f={C.second} o={easeOut(seg(t, 2.6, 3.0))}>
        on disk: read back
      </T>
      <rect x={235} y={172} width={70 * easeOut(seg(t, 3.0, 3.4))} height={12} fill={C.second} />
      <T x={25} y={226} s={12} f={C.focus} o={easeOut(seg(t, 3.7, 4.1))}>
        that one choice is the whole difference
      </T>
    </Svg>
  );
}

const SHADES = [C.mocha, C.taupe, C.latte, C.crema];
function shade(i: number, seed: number) {
  return SHADES[(i * 7 + seed * 5 + ((i * seed) % 3)) % 4];
}

/** Forty rows' random values as a strip of small squares at y, shaded by `seed`; `k` reveals them left to right. */
function Strip({ y, seed, k }: { y: number; seed: number; k: number }) {
  return (
    <g>
      {Array.from({ length: 40 }, (_, i) => (
        <rect key={i} x={25 + i * 13} y={y} width={10} height={12} fill={shade(i, seed)} opacity={clamp(k * 40 - i, 0, 1)} />
      ))}
    </g>
  );
}

// 8 · Frozen. Uncached: two strips of forty random values, every column different, the count reads 40.
// Cached: the second strip copies the first exactly, the count reads 0.
export function RevealNondeterministicFrozen({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.8));
  const b = easeOut(seg(t, 0.8, 1.4));
  const c = easeOut(seg(t, 2.2, 2.8));
  const d = easeOut(seg(t, 2.8, 3.4));
  return (
    <Svg label="measured: uncached, every row disagrees; cached, every row matches." h={250}>
      <T x={25} y={22} s={11} f={C.latte}>
        uncached: two runs
      </T>
      <Strip y={32} seed={1} k={a} />
      <Strip y={48} seed={2} k={b} />
      <T x={25} y={88} s={12} f={C.cherryText} o={easeOut(seg(t, 1.5, 1.9))}>
        rows that differ: 40
      </T>
      <T x={25} y={132} s={11} f={C.second} o={easeOut(seg(t, 2.0, 2.3))}>
        cached: two runs
      </T>
      <Strip y={142} seed={1} k={c} />
      <Strip y={158} seed={1} k={d} />
      <T x={25} y={198} s={12} f={C.second} o={easeOut(seg(t, 3.5, 3.9))}>
        rows that differ: 0
      </T>
      <T x={25} y={238} s={12} f={C.focus} o={easeOut(seg(t, 4.0, 4.4))}>
        remembered once, agreed every time
      </T>
    </Svg>
  );
}

// 9 · Recap. Three lines, each with its small picture: work traded for a cached result, two cost bars, two matching strips.
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 0.7));
  const b = easeOut(seg(t, 1.6, 2.0));
  const c = easeOut(seg(t, 3.0, 3.4));
  return (
    <Svg label="caching trades the computation for the data; what's lost depends on the level." h={250}>
      <T x={25} y={46} s={12} f={C.crema} o={a}>
        trade the work for its result
      </T>
      <Work x={360} y={26} w={90} p={0} dashed o={a} label="work" />
      <Req x1={450} x2={478} y={42} k={easeOut(seg(t, 0.7, 1.1))} f={C.second} />
      <Cell x={480} y={26} w={90} h={32} label="cache" stroke={C.second} o={easeOut(seg(t, 1.0, 1.3))} />
      <T x={25} y={122} s={12} f={C.crema} o={b}>
        the level decides the cost
      </T>
      <rect x={360} y={100} width={200 * easeOut(seg(t, 2.0, 2.6))} height={10} fill={C.bad} stroke={C.cherryText} strokeWidth={1} />
      <rect x={360} y={122} width={50 * easeOut(seg(t, 2.3, 2.8))} height={10} fill={C.second} />
      <T x={25} y={198} s={12} f={C.crema} o={c}>
        it locks in one answer
      </T>
      {[0, 1].map((r) => (
        <g key={r}>
          {Array.from({ length: 14 }, (_, i) => (
            <rect key={i} x={360 + i * 15} y={176 + r * 16} width={11} height={11} fill={shade(i, 1)} opacity={easeOut(seg(t, 3.3 + r * 0.3, 3.7 + r * 0.3))} />
          ))}
        </g>
      ))}
    </Svg>
  );
}
