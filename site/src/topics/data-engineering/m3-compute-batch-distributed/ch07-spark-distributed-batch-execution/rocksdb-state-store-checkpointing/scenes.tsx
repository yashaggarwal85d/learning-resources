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

/** The JVM heap at (x, y), 260 x 120, holding `n` of 120 key objects as small dots; `out` (0..1) carries them right,
 * out of the heap, by `dx`; `sw` (0..1, or -1) is a GC sweep line. */
function Heap({ x, y, n, out = 0, dx = 300, sw = -1, label = 'the heap', k = 1 }: { x: number; y: number; n: number; out?: number; dx?: number; sw?: number; label?: string; k?: number }) {
  return (
    <g opacity={k}>
      <T x={x} y={y - 8} s={11} f={C.latte}>
        {label}
      </T>
      <rect x={x} y={y} width={260} height={120} rx={4} fill="none" stroke={C.latte} strokeWidth={1.4} />
      {Array.from({ length: 120 }, (_, i) => (
        <circle key={i} cx={x + 14 + (i % 15) * 16.5 + dx * out} cy={y + 14 + Math.floor(i / 15) * 13.5} r={3.5} fill={out > 0.5 ? C.second : C.latte} opacity={clamp(n - i, 0, 1)} />
      ))}
      {sw >= 0 && sw <= 1 && <line x1={x + 260 * sw} y1={y - 4} x2={x + 260 * sw} y2={y + 124} stroke={C.focus} strokeWidth={2} />}
    </g>
  );
}

// 0 · Hook. Running totals sit in a store between two trigger ticks; a restart arrow loops back to it with a question.
export function Hook({ t }: StepCtx) {
  return (
    <Svg label="exactly-once leans on the state store surviving a restart. What is that store?" h={210}>
      <line x1={25} y1={170} x2={565} y2={170} stroke={C.latte} strokeWidth={1.4} opacity={easeOut(seg(t, 0.1, 0.4))} />
      {[100, 490].map((x, i) => (
        <line key={x} x1={x} y1={160} x2={x} y2={180} stroke={C.focus} strokeWidth={2} opacity={easeOut(seg(t, 0.3 + i * 0.3, 0.6 + i * 0.3))} />
      ))}
      <Cell x={180} y={60} w={240} h={40} label="the running totals" stroke={C.second} o={easeOut(seg(t, 0.8, 1.2))} />
      <path
        d={`M490 150 C 540 60, 480 30, ${lerp(490, 424, easeOut(seg(t, 1.6, 2.4)))} 76`}
        fill="none"
        stroke={C.cherryText}
        strokeWidth={1.6}
        strokeDasharray="5 4"
        opacity={easeOut(seg(t, 1.6, 1.9))}
      />
      <T x={25} y={40} s={11} f={C.cherryText} o={easeOut(seg(t, 2.2, 2.6))}>
        after a restart: still there?
      </T>
      <T x={300} y={130} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 2.8, 3.2))}>
        where do they live?
      </T>
    </Svg>
  );
}

// 1 · Default: on the heap. A few key objects appear, then many more until the heap is crowded; the GC sweep walks it.
export function RevealDefaultOnHeap({ t }: StepCtx) {
  const n = lerp(4, 120, easeIn(seg(t, 1.0, 2.8)));
  return (
    <Svg label="the default provider keeps state as objects on the JVM's own heap." h={220}>
      <Heap x={25} y={40} n={t < 1.0 ? 4 * easeOut(seg(t, 0.2, 0.8)) : n} sw={t > 3.0 && t < 4.2 ? seg(t, 3.0, 4.2) : -1} />
      <T x={310} y={70} s={11} f={C.latte} o={easeOut(seg(t, 0.4, 0.8))}>
        one object per key
      </T>
      <T x={310} y={100} s={11} f={C.latte} o={easeOut(seg(t, 1.8, 2.2))}>
        millions of keys,
      </T>
      <T x={310} y={118} s={11} f={C.latte} o={easeOut(seg(t, 1.8, 2.2))}>
        millions of objects
      </T>
      <T x={310} y={150} s={11} f={C.focus} o={easeOut(seg(t, 3.0, 3.4))}>
        all of it walked by the GC
      </T>
    </Svg>
  );
}

function easeIn(x: number) {
  return x * x;
}

// 2 · Predict. A crowded heap and a key-count arrow pointing toward a million; a GC-time bar marked with a question.
export function PredictGcClimbs({ t, answer }: StepCtx) {
  return (
    <Svg label="a million-key aggregation, on the default provider. GC time flat, or climbing?" h={230}>
      <Heap x={25} y={40} n={120} />
      <T x={310} y={70} s={11} f={C.latte}>
        keys, toward a million
      </T>
      <Req x1={310} x2={lerp(310, 540, easeOut(seg(t, 0.3, 1.0)))} y={84} k={1} f={C.latte} />
      <T x={310} y={130} s={15} f={C.focus} o={answer === null ? easeOut(seg(t, 1.0, 1.4)) : 0}>
        GC time?
      </T>
      <Verdict answer={answer} y={210} text="it climbs, every pass" />
    </Svg>
  );
}

// 3 · Measured. GC time against a growing key count: the default provider's line climbs in cherry; RocksDB's line on the
// identical load stays low and nearly flat.
export function RevealGcClimbed({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 2.0));
  const b = easeOut(seg(t, 2.2, 3.4));
  const pts = (f: (u: number) => number, k: number) =>
    Array.from({ length: 11 }, (_, i) => i / 10)
      .filter((u) => u <= k + 1e-6)
      .map((u) => `${60 + u * 480},${170 - f(u)}`)
      .join(' ');
  return (
    <Svg label="measured: climbs, on the default provider. The same workload on RocksDB stays flat." h={230}>
      <line x1={60} y1={170} x2={545} y2={170} stroke={C.mocha} strokeWidth={1.4} />
      <line x1={60} y1={30} x2={60} y2={170} stroke={C.mocha} strokeWidth={1.4} />
      <T x={545} y={192} s={11} f={C.latte} a="end">
        keys
      </T>
      <T x={70} y={26} s={11} f={C.latte}>
        GC time
      </T>
      {a > 0 && <polyline points={pts((u) => 120 * u * u + 10 * u, a)} fill="none" stroke={C.cherryText} strokeWidth={2.4} />}
      <T x={420} y={60} s={11} f={C.cherryText} o={easeOut(seg(t, 1.8, 2.2))}>
        default
      </T>
      {b > 0 && <polyline points={pts((u) => 14 * u, b)} fill="none" stroke={C.second} strokeWidth={2.4} />}
      <T x={420} y={142} s={11} f={C.second} o={easeOut(seg(t, 3.2, 3.6))}>
        RocksDB
      </T>
    </Svg>
  );
}

// 4 · Off the heap. The key objects drift out of the heap into a native memory and local disk box beside it; the GC
// sweep then walks a heap with almost nothing in it.
export function ElaborateNativeMemory({ t }: StepCtx) {
  const o = easeInOut(seg(t, 0.6, 2.0));
  return (
    <Svg label="RocksDB moves the state to native memory and local disk -- off the heap entirely." h={220}>
      <Heap x={25} y={40} n={120} out={o} sw={t > 2.6 && t < 3.6 ? seg(t, 2.6, 3.6) : -1} />
      <T x={315} y={32} s={11} f={C.second}>
        native memory, local disk
      </T>
      <rect x={315} y={40} width={260} height={120} rx={4} fill="none" stroke={C.second} strokeWidth={1.4} strokeDasharray="5 4" />
      <T x={25} y={196} s={12} f={C.focus} o={easeOut(seg(t, 3.6, 4.0))}>
        nothing left for the collector to look at
      </T>
    </Svg>
  );
}

const BLK = Array.from({ length: 12 }, (_, i) => i);
const CHG = [2, 7, 9];

// 5 · Predict. Twelve state blocks; a save arrow carries all twelve to checkpoint storage. Every save, all of it?
export function PredictFullReupload({ t, answer }: StepCtx) {
  const m = easeInOut(seg(t, 0.4, 1.4));
  return (
    <Svg label="every checkpoint re-uploads the full state snapshot. True, or false?" h={230}>
      <T x={25} y={24} s={11} f={C.latte}>
        the state
      </T>
      {BLK.map((i) => (
        <rect key={i} x={25 + (i % 4) * 34} y={34 + Math.floor(i / 4) * 30} width={26} height={22} rx={2} fill={C.mocha} stroke={C.latte} strokeWidth={1.2} />
      ))}
      {BLK.map((i) => (
        <rect
          key={`c${i}`}
          x={lerp(25 + (i % 4) * 34, 400 + (i % 4) * 34, m)}
          y={34 + Math.floor(i / 4) * 30}
          width={26}
          height={22}
          rx={2}
          fill="none"
          stroke={C.focus}
          strokeWidth={1.2}
          opacity={m > 0 && m < 1 ? 1 : 0}
        />
      ))}
      <rect x={390} y={26} width={150} height={100} rx={4} fill="none" stroke={C.latte} strokeWidth={1.4} />
      <T x={390} y={146} s={11} f={C.latte}>
        checkpoint storage
      </T>
      <Verdict answer={answer} y={205} text="false: only what changed" />
    </Svg>
  );
}

// 6 · Measured. Only the three changed blocks travel this time; then two byte bars: snapshot long, changelog under half.
export function RevealChangelogSmaller({ t }: StepCtx) {
  const m = easeInOut(seg(t, 0.4, 1.4));
  return (
    <Svg label="measured: false. Changelog checkpointing uploads only what changed, not everything." h={240}>
      {BLK.map((i) => (
        <rect
          key={i}
          x={25 + (i % 4) * 34}
          y={34 + Math.floor(i / 4) * 30}
          width={26}
          height={22}
          rx={2}
          fill={C.mocha}
          stroke={CHG.includes(i) ? C.focus : C.latte}
          strokeWidth={CHG.includes(i) ? 2 : 1.2}
        />
      ))}
      {CHG.map((i) => (
        <rect
          key={`c${i}`}
          x={lerp(25 + (i % 4) * 34, 400 + (i % 4) * 34, m)}
          y={34 + Math.floor(i / 4) * 30}
          width={26}
          height={22}
          rx={2}
          fill="none"
          stroke={C.focus}
          strokeWidth={1.4}
          opacity={m > 0 ? 1 : 0}
        />
      ))}
      <rect x={390} y={26} width={150} height={100} rx={4} fill="none" stroke={C.latte} strokeWidth={1.4} />
      <T x={25} y={170} s={11} f={C.latte} o={easeOut(seg(t, 1.6, 1.9))}>
        snapshot
      </T>
      <rect x={140} y={160} width={400 * easeOut(seg(t, 1.8, 2.6))} height={12} fill={C.latte} />
      <T x={25} y={205} s={11} f={C.second} o={easeOut(seg(t, 2.6, 2.9))}>
        changelog
      </T>
      <rect x={140} y={195} width={130 * easeOut(seg(t, 2.8, 3.4))} height={12} fill={C.second} />
    </Svg>
  );
}

// 7 · Deferred. Small changelog uploads at every save tick; in a lane below marked background, a full snapshot block
// still lands every few ticks.
export function ElaborateSnapshotDeferred({ t }: StepCtx) {
  return (
    <Svg label="a full snapshot still happens -- changelog checkpointing just defers it, never skips it." h={220}>
      <T x={25} y={30} s={11} f={C.second}>
        each save: what changed
      </T>
      <line x1={25} y1={80} x2={565} y2={80} stroke={C.latte} strokeWidth={1.4} />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <rect key={i} x={40 + i * 66} y={54} width={18} height={18} rx={2} fill={C.second} opacity={easeOut(seg(t, 0.3 + i * 0.3, 0.5 + i * 0.3))} />
      ))}
      <T x={25} y={122} s={11} f={C.latte} o={easeOut(seg(t, 1.0, 1.4))}>
        in the background: the full snapshot
      </T>
      <line x1={25} y1={170} x2={565} y2={170} stroke={C.mocha} strokeWidth={1.4} />
      {[0, 1].map((i) => (
        <rect key={i} x={170 + i * 264} y={140} width={110 * easeOut(seg(t, 1.4 + i * 1.2, 2.0 + i * 1.2))} height={22} rx={2} fill={C.mocha} stroke={C.latte} strokeWidth={1.2} />
      ))}
      <T x={25} y={208} s={12} f={C.focus} o={easeOut(seg(t, 3.6, 4.0))}>
        put off, never skipped
      </T>
    </Svg>
  );
}

// 8 · Scale. One long key-count axis: this chapter's examples sit at the left end; where any of this matters sits far
// to the right, millions of keys away.
export function RevealChapterNeverNeeded({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.0));
  return (
    <Svg label="this chapter's own examples never needed any of this -- the scale here is millions of keys." h={240}>
      <line x1={25} y1={110} x2={lerp(25, 565, a)} y2={110} stroke={C.latte} strokeWidth={1.4} />
      <T x={565} y={136} s={11} f={C.latte} a="end" o={a}>
        key count
      </T>
      <circle cx={50} cy={110} r={7} fill={C.second} opacity={easeOut(seg(t, 1.0, 1.4))} />
      <T x={25} y={80} s={11} f={C.second} o={easeOut(seg(t, 1.2, 1.6))}>
        this chapter's examples
      </T>
      <rect x={420} y={98} width={140} height={24} fill={C.bad} stroke={C.cherryText} strokeWidth={1.2} opacity={easeOut(seg(t, 2.0, 2.4))} />
      <T x={560} y={80} s={11} f={C.cherryText} a="end" o={easeOut(seg(t, 2.2, 2.6))}>
        where it starts to matter
      </T>
      <path d={`M70 160 h${340 * easeOut(seg(t, 2.8, 3.6))}`} stroke={C.focus} strokeWidth={1.6} strokeDasharray="5 4" />
      <T x={25} y={200} s={12} f={C.focus} o={easeOut(seg(t, 3.6, 4.0))}>
        nowhere near it, every run
      </T>
    </Svg>
  );
}

// 9 · Recap. A switch between the two providers: objects on the heap, or off it; and a save that writes only what changed.
export function Recap({ t }: StepCtx) {
  const s = easeInOut(seg(t, 1.2, 1.8));
  return (
    <Svg label="two providers, one switch: where the state lives, and what a checkpoint costs." h={250}>
      <Cell x={25} y={40} w={250} h={34} label="default: on the heap" stroke={s < 0.5 ? C.focus : C.mocha} o={easeOut(seg(t, 0.2, 0.5))} />
      <Cell x={315} y={40} w={250} h={34} label="RocksDB: off the heap" stroke={s > 0.5 ? C.second : C.mocha} o={easeOut(seg(t, 0.5, 0.8))} />
      <rect x={270} y={100} width={60} height={26} rx={13} fill={C.cocoa} stroke={C.focus} strokeWidth={1.6} opacity={easeOut(seg(t, 0.8, 1.1))} />
      <circle cx={lerp(283, 317, s)} cy={113} r={9} fill={C.focus} opacity={easeOut(seg(t, 0.8, 1.1))} />
      <T x={300} y={180} s={12} f={C.crema} a="middle" o={easeOut(seg(t, 2.4, 2.8))}>
        does the key count ever reach the collector?
      </T>
      <T x={300} y={215} s={11} f={C.second} a="middle" o={easeOut(seg(t, 3.2, 3.6))}>
        and a save that writes only what changed
      </T>
    </Svg>
  );
}
