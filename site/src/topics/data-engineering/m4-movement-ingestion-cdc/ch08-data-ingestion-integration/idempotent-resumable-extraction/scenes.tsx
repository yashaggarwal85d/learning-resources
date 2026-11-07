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

/** An empty dashed slot the size of a Cell, for output that was never written. */
function Hole({ x, y, w, h = 28, o = 1, stroke = C.mocha }: { x: number; y: number; w: number; h?: number; o?: number; stroke?: string }) {
  return <rect x={x} y={y} width={w} height={h} rx={4} fill="none" stroke={stroke} strokeWidth={1.5} strokeDasharray="4 3" opacity={o} />;
}

/** `n` row pips from (x, y), `k` of them popped in, hollow when `hollow`. */
function Pips({ x, y, n = 5, k, f = C.latte, hollow = false, gap = 16 }: { x: number; y: number; n?: number; k: number; f?: string; hollow?: boolean; gap?: number }) {
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const p = easeOutBack(clamp(k * n - i, 0, 1));
        return hollow ? (
          <circle key={i} cx={x + i * gap} cy={y} r={5} fill="none" stroke={f} strokeWidth={1.4} strokeDasharray="2 2" opacity={p} />
        ) : (
          <circle key={i} cx={x + i * gap} cy={y} r={5 * p} fill={f} />
        );
      })}
    </g>
  );
}

// 0 · Hook. The extractor sends five rows into the warehouse; the checkpoint save is cut by a crash. The restart sends
// the same five again; each one valid, and the warehouse now holds two of each.
export function Hook({ t }: StepCtx) {
  const r1 = easeInOut(seg(t, 0.3, 1.3));
  const cut = easeOut(seg(t, 1.4, 1.9));
  const r2 = easeInOut(seg(t, 2.3, 3.3));
  return (
    <Svg label="an extractor crashes between writing rows and saving its checkpoint; the restart duplicates every row." h={220}>
      <Cell x={25} y={36} w={140} label="extractor" />
      <T x={380} y={22} s={11} f={C.latte}>
        warehouse
      </T>
      <rect x={380} y={30} width={170} height={74} rx={4} fill="none" stroke={C.mocha} strokeWidth={1.5} />
      {Array.from({ length: 5 }, (_, i) => {
        const p1 = clamp(r1 * 1.6 - i * 0.15, 0, 1);
        const p2 = clamp(r2 * 1.6 - i * 0.15, 0, 1);
        return (
          <g key={i}>
            {p1 > 0 && <circle cx={lerp(175, 400 + i * 30, p1)} cy={lerp(50, 52, p1)} r={6} fill={C.latte} />}
            {p2 > 0 && <circle cx={lerp(175, 400 + i * 30, p2)} cy={lerp(50, 82, p2)} r={6} fill={p2 >= 1 ? C.cherryText : C.latte} />}
          </g>
        );
      })}
      <Req x1={170} x2={lerp(375, 270, cut)} y={150} k={easeOut(seg(t, 1.1, 1.5))} label={cut > 0 ? undefined : 'save checkpoint'} />
      <Cross x={285} y={150} k={cut} />
      <Cell x={380} y={136} w={170} label="checkpoint: old" o={easeOut(seg(t, 0.8, 1.1))} />
      {t >= 2.0 && t < 2.4 && (
        <T x={25} y={90} s={11} f={C.latte} o={easeOut(seg(t, 2.0, 2.2))}>
          restart: run it again
        </T>
      )}
      {t >= 3.5 && (
        <T x={25} y={200} s={13} f={C.focus} o={easeOut(seg(t, 3.5, 3.8))}>
          every row valid
        </T>
      )}
      {t >= 3.9 && (
        <T x={550} y={200} s={13} f={C.cherryText} a="end" o={easeOut(seg(t, 3.9, 4.2))}>
          two of each
        </T>
      )}
    </Svg>
  );
}

// 1 · Predict. The two orderings as lanes with a crash between their steps. Once answered, checkpoint-first's write
// turns into an empty cherry hole; write-first's redo is marked safe.
export function Predict({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.2, 0.8)) : 0;
  const a = easeOut(seg(t, 0, 0.4));
  const b = easeOut(seg(t, 0.4, 0.8));
  return (
    <Svg label="the output write and the checkpoint advance can happen in either order. Which order loses data?" h={200}>
      <Cell x={25} y={30} w={140} label="checkpoint" o={a} />
      <Cross x={195} y={44} k={easeOut(seg(t, 0.9, 1.2))} />
      {v > 0 ? <Hole x={225} y={30} w={140} stroke={C.cherryText} o={v} /> : <Cell x={225} y={30} w={140} label="write" o={a} />}
      <Cell x={25} y={90} w={140} label="write" o={b} />
      <Cross x={195} y={104} k={easeOut(seg(t, 1.1, 1.4))} />
      <Cell x={225} y={90} w={140} label="checkpoint" o={b} />
      {v > 0 && (
        <T x={385} y={49} s={11} f={C.cherryText} o={v}>
          batch lost
        </T>
      )}
      {v > 0 && (
        <T x={385} y={109} s={11} f={C.focus} o={v}>
          redo, rows safe
        </T>
      )}
      <AnswerRow y={178} label="loses data" answer={answer} value="checkpoint first" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 2 · Checkpoint first. The checkpoint flips to done with a tick; the crash lands; the output slot stays an empty hole.
// Downstream readers check the checkpoint and each ticks: as far as they know, it succeeded.
export function RevealCheckpointFirst({ t }: StepCtx) {
  const done = t >= 0.8;
  const crash = easeOut(seg(t, 1.4, 1.8));
  const readers = ['dashboard', 'report', 'next job'];
  return (
    <Svg label="the checkpoint is marked done, then the crash happens before the output is ever written." h={200}>
      <Cell x={25} y={40} w={170} label={done ? 'checkpoint: done' : 'checkpoint'} stroke={done ? C.focus : C.mocha} />
      <MiniTick x={203} y={50} k={easeOut(seg(t, 0.8, 1.2))} />
      <Cross x={250} y={54} k={crash} />
      <Hole x={290} y={40} w={170} o={easeOut(seg(t, 0.1, 0.4))} stroke={t >= 3.9 ? C.cherryText : C.mocha} />
      <T x={375} y={90} s={11} f={t >= 3.9 ? C.cherryText : C.latte} a="middle" o={easeOut(seg(t, 0.2, 0.5))}>
        {t >= 3.9 ? 'output: never written' : 'output'}
      </T>
      <T x={25} y={122} s={11} f={C.latte} o={easeOut(seg(t, 2.0, 2.3))}>
        downstream
      </T>
      {readers.map((r, i) => (
        <g key={i}>
          <Cell x={25 + i * 125} y={130} w={110} label={r} o={easeOut(seg(t, 2.1 + i * 0.2, 2.4 + i * 0.2))} />
          <MiniTick x={74 + i * 125} y={172} k={easeOut(seg(t, 2.6 + i * 0.3, 3.0 + i * 0.3))} />
        </g>
      ))}
      {t >= 3.6 && (
        <T x={400} y={150} s={11} f={C.focus} o={easeOut(seg(t, 3.6, 3.9))}>
          all see: success
        </T>
      )}
    </Svg>
  );
}

// 3 · All three orderings, measured. Checkpoint first: five hollow rows, lost. Output first: five rows, then the same
// five again in cherry. Atomic: five rows under a lock, consistent.
export function RevealOrderingsMeasured({ t }: StepCtx) {
  const row = (i: number) => easeOut(seg(t, 0.2 + i * 1.2, 0.6 + i * 1.2));
  const res = (i: number) => easeOut(seg(t, 0.6 + i * 1.2, 1.3 + i * 1.2));
  return (
    <Svg label="the real run of all three orderings: checkpoint-first loses data, output-first duplicates, atomic is consistent." h={240}>
      <Cell x={25} y={30} w={190} label="checkpoint first" o={row(0)} />
      <Pips x={260} y={44} k={res(0)} f={C.cherryText} hollow />
      {res(0) >= 1 && (
        <T x={460} y={49} s={13} f={C.cherryText}>
          lost
        </T>
      )}
      <Cell x={25} y={100} w={190} label="output first" o={row(1)} />
      <Pips x={260} y={114} k={res(1)} />
      <Pips x={350} y={114} k={easeOut(seg(t, 1.6, 2.4))} f={C.cherryText} />
      {t >= 2.4 && (
        <T x={440} y={119} s={13} f={C.cherryText} o={easeOut(seg(t, 2.4, 2.7))}>
          lands twice
        </T>
      )}
      <Cell x={25} y={170} w={190} label="atomic commit" o={row(2)} stroke={C.focus} />
      <Pips x={260} y={184} k={res(2)} f={C.focus} />
      <Lock x={340} y={180} k={easeOut(seg(t, 3.0, 3.3))} f={C.focus} />
      {t >= 3.3 && (
        <T x={370} y={189} s={13} f={C.focus} o={easeOut(seg(t, 3.3, 3.6))}>
          always consistent
        </T>
      )}
    </Svg>
  );
}

// 4 · Batch id. An input range on top computes its id; computed again it comes out identical. Below, a counter's id
// ticks from run-1 to run-2 on the very same input.
export function RevealBatchIdConcept({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.6));
  const id1 = easeOut(seg(t, 0.7, 1.2));
  const again = seg(t, 1.8, 2.2);
  const c = easeOut(seg(t, 2.6, 3.0));
  const moved = t >= 3.4;
  return (
    <Svg label="a batch id derived from the input range itself, not a counter or the wall clock." h={200}>
      <T x={25} y={30} s={11} f={C.latte} o={a}>
        2026-10-27
      </T>
      <T x={245} y={30} s={11} f={C.latte} a="end" o={a}>
        2026-10-28
      </T>
      <path d={`M25 40 v10 h${220 * a} v-10`} fill="none" stroke={C.latte} strokeWidth={2} />
      <Req x1={250} x2={295} y={50} k={id1} />
      <Cell x={300} y={36} w={260} label="orders:2026-10-27/2026-10-28" o={id1} stroke={again > 0 ? C.focus : C.mocha} />
      {again > 0 && (
        <T x={430} y={90} s={11} f={C.focus} a="middle" o={easeOut(again)}>
          same value every run
        </T>
      )}
      <Cell x={25} y={130} w={140} label="counter" o={c} />
      <Req x1={170} x2={295} y={144} k={easeOut(seg(t, 2.8, 3.2))} />
      <Cell x={300} y={130} w={260} label={moved ? 'orders:run-2' : 'orders:run-1'} o={easeOut(seg(t, 3.0, 3.3))} stroke={moved ? C.cherryText : C.mocha} />
      {moved && (
        <T x={430} y={185} s={11} f={C.cherryText} a="middle" o={easeOut(seg(t, 3.4, 3.8))}>
          a new value every run
        </T>
      )}
    </Svg>
  );
}

// 5 · Batch id, measured. Left: the range id's re-run lands in the same partition and the box flashes; still five rows.
// Right: the counter id's re-run opens a second partition beside the first; ten rows.
export function RevealBatchIdMeasured({ t }: StepCtx) {
  const p1 = easeOut(seg(t, 0.3, 1.0));
  const rerun = easeOut(seg(t, 1.6, 2.3));
  const flash = seg(t, 1.6, 2.3) > 0 && seg(t, 1.6, 2.3) < 1;
  return (
    <Svg label="the real run: a range-derived id overwrites on a re-run; a counter-derived id piles up beside it." h={220}>
      <T x={25} y={24} s={11} f={C.latte}>
        range-derived id
      </T>
      <rect x={25} y={36} width={230} height={40} rx={4} fill="none" stroke={flash || t >= 2.3 ? C.focus : C.mocha} strokeWidth={flash ? 2.5 : 1.5} />
      <Pips x={50} y={56} k={p1} gap={40} f={flash ? C.focus : C.latte} />
      <T x={310} y={24} s={11} f={C.latte}>
        counter-derived id
      </T>
      <rect x={310} y={36} width={240} height={40} rx={4} fill="none" stroke={C.mocha} strokeWidth={1.5} />
      <Pips x={335} y={56} k={p1} gap={40} />
      {rerun > 0 && <rect x={310} y={88} width={240} height={40} rx={4} fill="none" stroke={C.cherryText} strokeWidth={1.5} opacity={rerun} />}
      <Pips x={335} y={108} k={rerun} gap={40} f={C.cherryText} />
      {t >= 2.6 && (
        <g opacity={easeOut(seg(t, 2.6, 3.0))}>
          <T x={25} y={170} s={13} f={C.focus}>
            1 partition
          </T>
          <T x={25} y={195} s={13} f={C.focus}>
            5 rows
          </T>
        </g>
      )}
      {t >= 3.2 && (
        <g opacity={easeOut(seg(t, 3.2, 3.6))}>
          <T x={310} y={170} s={13} f={C.cherryText}>
            2 partitions
          </T>
          <T x={310} y={195} s={13} f={C.cherryText}>
            10 rows
          </T>
        </g>
      )}
    </Svg>
  );
}

// 6 · The recipe. At-least-once delivery plus an idempotent keyed write: under the first a redo appears, under the
// second it changes nothing; they add to an exactly-once effect. Exactly-once delivery is crossed off.
export function RevealRecipeNamed({ t }: StepCtx) {
  return (
    <Svg label="at-least-once delivery plus an idempotent, keyed write is the recipe for an exactly-once effect." h={200}>
      <Cell x={25} y={24} w={230} label="at-least-once delivery" o={easeOut(seg(t, 0.2, 0.6))} />
      <T x={277} y={44} s={17} f={C.latte} a="middle" o={easeOut(seg(t, 0.7, 1.0))}>
        +
      </T>
      <Cell x={300} y={24} w={250} label="idempotent, keyed write" o={easeOut(seg(t, 0.8, 1.2))} />
      <Pips x={60} y={70} n={2} k={easeOut(seg(t, 1.2, 1.7))} gap={18} />
      <T x={100} y={75} s={11} f={C.latte} o={easeOut(seg(t, 1.4, 1.7))}>
        a redo may happen
      </T>
      <Pips x={335} y={70} n={1} k={easeOut(seg(t, 1.8, 2.1))} f={C.focus} />
      <T x={350} y={75} s={11} f={C.focus} o={easeOut(seg(t, 2.0, 2.3))}>
        twice changes nothing
      </T>
      <Cell x={150} y={100} w={300} label="exactly-once effect" o={easeOut(seg(t, 2.5, 2.9))} stroke={C.focus} f={C.focus} />
      <Cross x={160} y={164} k={easeOut(seg(t, 3.3, 3.7))} />
      {t >= 3.2 && (
        <T x={180} y={169} s={13} f={C.cherryText} o={easeOut(seg(t, 3.2, 3.5))}>
          not exactly-once delivery
        </T>
      )}
    </Svg>
  );
}

// 7 · Proof. Top: twelve rows fill, a crash after seven, the restart finishes. Bottom: one clean run of the same
// twelve. A tick drops between every column pair: byte for byte identical.
export function RevealDiffMeasured({ t }: StepCtx) {
  const a = 7 * easeInOut(seg(t, 0.3, 1.4));
  const resumed = 5 * easeInOut(seg(t, 2.0, 2.7));
  const b = 12 * easeInOut(seg(t, 0.5, 2.5));
  const top = a + resumed;
  return (
    <Svg label="a batch crashes partway, is re-run in full, and is checked byte for byte against one clean run." h={220}>
      <T x={25} y={30} s={11} f={C.latte}>
        crashed after 7, then resumed
      </T>
      {Array.from({ length: 12 }, (_, i) => (
        <g key={i}>
          <rect x={25 + i * 40} y={40} width={30} height={22} rx={3} fill={C.latte} opacity={clamp(top - i, 0, 1)} />
          <rect x={25 + i * 40} y={120} width={30} height={22} rx={3} fill={C.latte} opacity={clamp(b - i, 0, 1)} />
          <MiniTick x={34 + i * 40} y={92} k={easeOut(seg(t, 3.0 + i * 0.05, 3.3 + i * 0.05))} />
        </g>
      ))}
      <Cross x={300} y={51} k={easeOut(seg(t, 1.4, 1.7)) * (1 - easeOut(seg(t, 1.9, 2.1)))} />
      <T x={25} y={112} s={11} f={C.latte} o={easeOut(seg(t, 0.3, 0.6))}>
        one clean run
      </T>
      {t >= 3.7 && (
        <T x={300} y={190} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.7, 4.1))}>
          byte for byte identical
        </T>
      )}
    </Svg>
  );
}

// 8 · Recap. Three questions, each with an arrow to its answer; a brace gathers them into the one property: repeat
// the run, get the same answer.
export function Recap({ t }: StepCtx) {
  const qs = ['where a crash lands', 'redo: on top or beside', 'applying it again'];
  const fixes = ['atomic commit', 'stable batch id', 'idempotent write'];
  const br = easeOut(seg(t, 2.5, 3.1));
  return (
    <Svg label="three commit orderings, one batch-id choice, one recipe — the property every source in this chapter needed." h={260}>
      {qs.map((p, i) => (
        <g key={i}>
          <Cell x={25} y={20 + i * 48} w={210} label={p} o={easeOut(seg(t, 0.2 + i * 0.6, 0.6 + i * 0.6))} />
          <Req x1={240} x2={338} y={34 + i * 48} k={easeOut(seg(t, 0.4 + i * 0.6, 0.8 + i * 0.6))} />
          <Cell x={345} y={20 + i * 48} w={210} label={fixes[i]} o={easeOut(seg(t, 0.6 + i * 0.6, 0.9 + i * 0.6))} stroke={C.focus} />
        </g>
      ))}
      {br > 0 && <path d={`M25 172 v8 h${530 * br} v-8`} fill="none" stroke={C.focus} strokeWidth={2} />}
      {br >= 1 && <line x1={290} y1={180} x2={290} y2={196} stroke={C.focus} strokeWidth={2} />}
      <Cell x={175} y={198} w={230} label="repeat it, same answer" o={easeOut(seg(t, 3.2, 3.6))} stroke={C.focus} f={C.focus} />
    </Svg>
  );
}

// 9 · Prove it. The broker delivers the same message twice to the consumer, which writes once to its table. Once
// answered, delivery is marked twice in cherry, effect once in focus.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.2, 0.8)) : 0;
  return (
    <Svg label="a broker redelivers the identical message twice. Does that violate exactly-once delivery, effect, both, or neither?" h={200}>
      <Cell x={25} y={40} w={120} label="broker" o={easeOut(seg(t, 0, 0.3))} />
      <Req x1={150} x2={295} y={48} k={easeOut(seg(t, 0.4, 0.9))} />
      <Req x1={150} x2={295} y={62} k={easeOut(seg(t, 0.9, 1.4))} />
      <Cell x={300} y={40} w={120} label="consumer" o={easeOut(seg(t, 0.2, 0.5))} />
      <Req x1={425} x2={455} y={54} k={easeOut(seg(t, 1.1, 1.4))} />
      <Cell x={460} y={40} w={100} label="table" o={easeOut(seg(t, 0.3, 0.6))} />
      {v > 0 && (
        <T x={25} y={115} s={13} f={C.cherryText} o={v}>
          delivery: twice
        </T>
      )}
      {v > 0 && (
        <T x={300} y={115} s={13} f={C.focus} o={v}>
          effect: once
        </T>
      )}
      <AnswerRow y={178} label="it breaks" answer={answer} value="delivery only" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}
