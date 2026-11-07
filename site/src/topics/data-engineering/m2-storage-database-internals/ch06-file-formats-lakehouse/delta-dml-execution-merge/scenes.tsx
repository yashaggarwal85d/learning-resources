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

/** A 1000-row file drawn as a 50 by 20 grid of row ticks at (x, y); rows 10 to 20 (the 11 matched) can be marked red;
 * `fill` sweeps a rewrite across every row. */
function RowGrid({ x, y, o = 1, hot = 0, fill = 0, stroke = C.latte }: { x: number; y: number; o?: number; hot?: number; fill?: number; stroke?: string }) {
  return (
    <g opacity={o}>
      <rect x={x - 4} y={y - 4} width={50 * 5 + 6} height={20 * 5 + 6} rx={3} fill={C.cocoa} stroke={stroke} strokeWidth={1.4} />
      {fill > 0 && <rect x={x - 2} y={y - 2} width={(50 * 5 + 2) * fill} height={20 * 5 + 2} fill={C.second} opacity={0.35} />}
      {hot > 0 &&
        Array.from({ length: 11 }, (_, i) => {
          const r = 10 + i;
          return <rect key={r} x={x + (r % 50) * 5} y={y + Math.floor(r / 50) * 5} width={4} height={4} fill={C.cherryText} opacity={hot} />;
        })}
    </g>
  );
}

// 1 · Hook. The commit protocol from last time as a box; three DML statements arrive and each drops a commit into it.
export function Hook({ t }: StepCtx) {
  const ops = ['MERGE', 'UPDATE', 'DELETE'];
  return (
    <Svg label="a commit protocol only matters because of what produces commits. this topic: delta's own dml." h={200}>
      <Cell x={330} y={70} w={220} h={40} label="the commit protocol" stroke={C.second} o={easeOut(seg(t, 0.1, 0.4))} />
      {ops.map((o, i) => (
        <g key={o}>
          <Cell x={25} y={25 + i * 50} w={130} h={30} label={o} stroke={i === 0 ? C.focus : C.mocha} o={easeOut(seg(t, 0.8 + i * 0.4, 1.1 + i * 0.4))} />
          <line
            x1={157}
            y1={40 + i * 50}
            x2={lerp(157, 328, easeOut(seg(t, 1.1 + i * 0.4, 1.5 + i * 0.4)))}
            y2={lerp(40 + i * 50, 90, easeOut(seg(t, 1.1 + i * 0.4, 1.5 + i * 0.4)))}
            stroke={i === 0 ? C.focus : C.mocha}
            strokeWidth={1.6}
          />
        </g>
      ))}
      <T x={330} y={150} s={12} f={C.focus} o={easeOut(seg(t, 3.0, 3.4))}>
        starting with MERGE
      </T>
    </Svg>
  );
}

// 2 · Predict. A 1000-row file; eleven rows marked; the answer: the whole file.
export function PredictRewriteScope({ t, answer }: StepCtx) {
  return (
    <Svg label="merge matches 11 rows out of 1000 in one file. how much of that file gets rewritten?" h={200}>
      <RowGrid x={30} y={25} o={easeOut(seg(t, 0.1, 0.4))} hot={easeOut(seg(t, 0.8, 1.2))} />
      <T x={310} y={45} s={12} f={C.cherryText} o={easeOut(seg(t, 0.9, 1.2))}>
        11 matched, of 1000
      </T>
      <T x={310} y={80} s={14} f={C.second} o={easeOut(seg(t, 1.6, 2.0))}>
        11 rows, or all?
      </T>
      <AnswerRow y={150} label="MERGE rewrites" answer={answer} value="the whole file" k={easeOut(seg(t, 2.2, 2.7))} />
      <Verdict answer={answer} y={190} text="found by row range, rewritten whole" />
    </Svg>
  );
}

// 3 · The full rewrite, for real. The old file; a new file fills with every one of its 1000 rows; the bytes written count up
// to 17,834.
export function RevealFullRewrite({ t }: StepCtx) {
  const f = easeInOut(seg(t, 1.0, 2.8));
  return (
    <Svg label="the whole file, for real: 17834 bytes written to change 11 rows out of 1000." h={230}>
      <RowGrid x={30} y={25} o={easeOut(seg(t, 0.1, 0.4))} hot={1} />
      <T x={30} y={150} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        old file
      </T>
      <RowGrid x={320} y={25} o={easeOut(seg(t, 0.7, 1.0))} fill={f} stroke={C.second} />
      <T x={320} y={150} s={11} f={C.second} o={easeOut(seg(t, 0.7, 1.0))}>
        new file, all 1000 rows
      </T>
      <T x={30} y={190} s={14} f={C.cherryText} o={easeOut(seg(t, 1.0, 1.3))}>
        {`${num(17834 * f, 0)} bytes written`}
      </T>
      <T x={30} y={218} s={12} f={C.latte} o={easeOut(seg(t, 3.2, 3.6))}>
        to change 11 rows
      </T>
    </Svg>
  );
}

// 4 · Deletion vectors. The old file padlocked; a bitmap with its eleven bits lit; a small new-rows file; then two bars, the
// full rewrite's and the deletion vector's, and the ratio, 70.8x less.
export function RevealDeletionVectorMode({ t }: StepCtx) {
  return (
    <Svg label="deletion vectors on: a real bitmap plus a small new-rows file. 70.8x less." h={230}>
      <RowGrid x={30} y={25} o={easeOut(seg(t, 0.1, 0.4))} hot={1} />
      <Lock x={292} y={30} k={easeOut(seg(t, 0.4, 0.7))} />
      <T x={330} y={40} s={11} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        old file, untouched
      </T>
      {Array.from({ length: 11 }, (_, i) => (
        <rect key={i} x={330 + i * 14} y={60} width={10} height={10} fill={C.cherryText} opacity={easeOut(seg(t, 0.9 + i * 0.04, 1.1 + i * 0.04))} />
      ))}
      <T x={330} y={90} s={11} f={C.cherryText} o={easeOut(seg(t, 1.2, 1.5))}>
        bitmap: old rows deleted
      </T>
      <rect x={330} y={100} width={40} height={18} rx={2} fill={C.cocoa} stroke={C.focus} strokeWidth={1.5} opacity={easeOut(seg(t, 1.5, 1.8))} />
      <T x={380} y={114} s={11} f={C.focus} o={easeOut(seg(t, 1.6, 1.9))}>
        small new-rows file
      </T>
      <T x={30} y={160} s={11} f={C.latte} o={easeOut(seg(t, 2.1, 2.4))}>
        full rewrite
      </T>
      <rect x={140} y={148} width={420 * easeInOut(seg(t, 2.2, 2.9))} height={16} rx={2} fill={C.cherryText} />
      <T x={30} y={190} s={11} f={C.latte} o={easeOut(seg(t, 2.9, 3.2))}>
        deletion vector
      </T>
      <rect x={140} y={178} width={(420 / 70.8) * easeInOut(seg(t, 3.0, 3.3))} height={16} rx={2} fill={C.focus} />
      <T x={170} y={190} s={13} f={C.focus} o={easeOut(seg(t, 3.3, 3.6))}>
        70.8x less written
      </T>
    </Svg>
  );
}

// 5 · Predict. MERGE plans to touch file 1; compaction removes file 1 first; the answer: a conflict, then a retry.
export function PredictMergeCompactionRace({ t, answer }: StepCtx) {
  const gone = easeOut(seg(t, 1.2, 1.6));
  return (
    <Svg label="merge plans to touch file 1. a concurrent compaction removes it first. what happens to merge?" h={200}>
      <Cell x={25} y={30} w={120} h={28} label="MERGE" stroke={C.focus} o={easeOut(seg(t, 0.1, 0.4))} />
      <Req x1={147} x2={258} y={44} k={easeOut(seg(t, 0.4, 0.8))} label="plans" f={C.focus} />
      <Cell x={260} y={30} w={110} h={28} label="file 1" o={easeOut(seg(t, 0.3, 0.6)) * (1 - 0.6 * gone)} />
      <Cross x={315} y={44} k={gone} />
      <Cell x={420} y={30} w={155} h={28} label="compaction" stroke={C.second} o={easeOut(seg(t, 0.7, 1.0))} />
      <T x={420} y={85} s={11} f={C.second} o={easeOut(seg(t, 1.2, 1.5))}>
        commits first
      </T>
      <AnswerRow y={145} label="MERGE's commit" answer={answer} value="conflict, then retry" k={easeOut(seg(t, 2.0, 2.5))} />
      <Verdict answer={answer} y={188} text="rejected, never silently lost" />
    </Svg>
  );
}

// 6 · Conflict and retry, for real. A timeline: MERGE reads at v0; compaction commits, replacing file 1; MERGE's commit is
// refused with ConcurrentDeleteReadException; it re-reads, finds part-001-compacted, and commits.
export function RevealConflictAndRetry({ t }: StepCtx) {
  const steps = [
    { l: 'MERGE reads at v0', f: C.crema },
    { l: 'compaction: file 1 → part-001-compacted', f: C.second },
    { l: 'MERGE commit: ConcurrentDeleteReadException', f: C.cherryText },
    { l: 're-read the tip, find part-001-compacted', f: C.crema },
    { l: 'retry: commits', f: C.focus },
  ];
  return (
    <Svg label="a real conflict, the exact pair delta's docs name. merge re-reads and retries, for real." h={230}>
      <line x1={40} y1={20} x2={40} y2={lerp(20, 205, easeInOut(seg(t, 0.1, 3.6)))} stroke={C.mocha} strokeWidth={2} />
      {steps.map((s, i) => {
        const y = 28 + i * 42;
        const b = 0.3 + i * 0.75;
        return (
          <g key={s.l} opacity={easeOut(seg(t, b, b + 0.35))}>
            <circle cx={40} cy={y} r={6} fill={s.f} />
            <T x={60} y={y + 4.5} s={11} f={s.f}>
              {s.l}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

// 7 · Row tracking. One row in the old file at one position; it moves to a new file at a new position; its stable ID, 500,
// rides along unchanged; its fresh ID, file base plus position, is recomputed and comes out different.
export function RevealRowTrackingSplit({ t }: StepCtx) {
  const mv = easeInOut(seg(t, 1.0, 1.8));
  return (
    <Svg label="the same row, rewritten: its stable id survives exactly; its fresh id comes out different." h={230}>
      <rect x={25} y={30} width={200} height={110} rx={4} fill="none" stroke={C.latte} strokeWidth={1.4} opacity={easeOut(seg(t, 0.1, 0.4))} />
      <T x={25} y={22} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        old file
      </T>
      <rect x={350} y={30} width={200} height={110} rx={4} fill="none" stroke={C.second} strokeWidth={1.4} opacity={easeOut(seg(t, 0.6, 0.9))} />
      <T x={350} y={22} s={11} f={C.second} o={easeOut(seg(t, 0.6, 0.9))}>
        new file, new position
      </T>
      <rect x={lerp(35, 360, mv)} y={lerp(50, 100, mv)} width={180} height={26} rx={3} fill={C.cocoa} stroke={C.crema} strokeWidth={1.6} opacity={easeOut(seg(t, 0.2, 0.5))} />
      <T x={lerp(45, 370, mv)} y={lerp(67, 117, mv)} s={12} f={C.crema} o={easeOut(seg(t, 0.2, 0.5))}>
        the row
      </T>
      <T x={25} y={180} s={12} f={C.focus} o={easeOut(seg(t, 2.2, 2.5))}>
        stable Row ID: 500, before and after
      </T>
      <T x={25} y={210} s={12} f={C.cherryText} o={easeOut(seg(t, 3.0, 3.3))}>
        fresh Row ID, file + position: a new number
      </T>
    </Svg>
  );
}

// 8 · Why the split. Two columns side by side: the fresh ID, free to store and good within one version; the stable ID, a
// stored column that survives a rewrite.
export function RevealWhySplitExists({ t }: StepCtx) {
  const cols = [
    { h: 'fresh ID', a: 'computed, no storage', b: 'one version only', c: 'a self-join', f: C.second },
    { h: 'stable ID', a: 'a materialized column', b: 'survives a rewrite', c: 'the same row, later', f: C.focus },
  ];
  return (
    <Svg label="a fresh id is free but unstable; a stable id costs a column but survives a rewrite." h={230}>
      {cols.map((c, i) => {
        const x = 25 + i * 280;
        const b = 0.2 + i * 1.6;
        return (
          <g key={c.h}>
            <Cell x={x} y={25} w={250} h={32} label={c.h} stroke={c.f} f={c.f} o={easeOut(seg(t, b, b + 0.3))} />
            <T x={x + 8} y={90} s={12} f={C.crema} o={easeOut(seg(t, b + 0.4, b + 0.7))}>
              {c.a}
            </T>
            <T x={x + 8} y={120} s={12} f={C.crema} o={easeOut(seg(t, b + 0.7, b + 1.0))}>
              {c.b}
            </T>
            <T x={x + 8} y={150} s={11} f={C.latte} o={easeOut(seg(t, b + 1.0, b + 1.3))}>
              {`good for: ${c.c}`}
            </T>
          </g>
        );
      })}
      <T x={25} y={205} s={13} f={C.focus} o={easeOut(seg(t, 3.9, 4.3))}>
        Delta gives you both, separately
      </T>
    </Svg>
  );
}

// 9 · Named, not built. Low-shuffle merge as a dashed box inside a Spark engine frame; Change Data Feed as a solid box
// ticked as already built.
export function RevealNamedNotBuilt({ t }: StepCtx) {
  return (
    <Svg label="named, not rebuilt here: low-shuffle merge, inside a real engine. change data feed, already real." h={230}>
      <rect x={25} y={25} width={290} height={120} rx={6} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.2, 0.5))} />
      <T x={37} y={45} s={11} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        inside Spark's own planner
      </T>
      <rect x={45} y={65} width={250} height={36} rx={4} fill="none" stroke={C.second} strokeWidth={1.6} strokeDasharray="5 4" opacity={easeOut(seg(t, 0.6, 1.0))} />
      <T x={170} y={88} s={12} f={C.second} a="middle" o={easeOut(seg(t, 0.6, 1.0))}>
        low-shuffle merge
      </T>
      <T x={45} y={128} s={11} f={C.latte} o={easeOut(seg(t, 1.2, 1.5))}>
        keeps unmatched rows out
      </T>
      <Cell x={345} y={65} w={230} h={36} label="Change Data Feed" stroke={C.focus} o={easeOut(seg(t, 2.2, 2.6))} />
      <MiniTick x={345} y={120} k={easeOut(seg(t, 2.7, 3.0))} />
      <T x={365} y={128} s={11} f={C.focus} o={easeOut(seg(t, 2.8, 3.1))}>
        built for real, topic 20
      </T>
      <T x={25} y={200} s={12} f={C.latte} o={easeOut(seg(t, 3.5, 3.9))}>
        named here, not rebuilt
      </T>
    </Svg>
  );
}

// 10 · Recap.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="merge finds touched files, rewrites whole or in part; conflicts retry; row identity survives rewrites." h={250}>
      <Row y={40} label="MERGE" value="whole file, or a DV" k={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={100} label="a conflict" value="caught and retried" valueColor={C.second} k={easeOut(seg(t, 1.2, 1.6))} />
      <Row y={160} label="Row Tracking" value="identity survives" valueColor={C.focus} k={easeOut(seg(t, 2.2, 2.6))} />
    </Svg>
  );
}
