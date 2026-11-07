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

/** An empty dashed slot. */
function Hole({ x, y, w, h = 28, o = 1, stroke = C.mocha }: { x: number; y: number; w: number; h?: number; o?: number; stroke?: string }) {
  return <rect x={x} y={y} width={w} height={h} rx={4} fill="none" stroke={stroke} strokeWidth={1.5} strokeDasharray="4 3" opacity={o} />;
}

/** A small square token at (x, y). */
function Pip({ x, y, o = 1, f = C.second, s = 10 }: { x: number; y: number; o?: number; f?: string; s?: number }) {
  return <rect x={x - s / 2} y={y - s / 2} width={s} height={s} rx={2} fill={f} opacity={o} />;
}

/** A lightning-bolt crash mark at (x, y), drawn in by `k`. */
function Bolt({ x, y, k }: { x: number; y: number; k: number }) {
  return <path d={`M${x + 4} ${y - 12} l-8 12 h7 l-5 12 l11 -15 h-7 l5 -9 z`} fill={C.cherryText} opacity={k} />;
}

/** A sealed segment holding order-1's first value, with a padlock. */
function Sealed({ x, y, o = 1, k = 1 }: { x: number; y: number; o?: number; k?: number }) {
  return (
    <g opacity={o}>
      <Cell x={x} y={y} w={210} label="order-1: pending" />
      <Lock x={x + 218} y={y + 10} k={k} f={C.latte} />
      <T x={x} y={y + 46} s={11} f={C.latte}>
        sealed segment
      </T>
    </g>
  );
}

// 0 · Hook. A question asks for order-1's status. The sealed segment below still says pending, locked. The answer that
// comes back, delivered, is drawn from a separate overlay cell above it; the sealed piece is never touched.
export function Hook({ t }: StepCtx) {
  const q = easeInOut(seg(t, 1.6, 2.4));
  return (
    <Svg label="a sealed segment never changes — the newer value lives in a separate overlay" h={200}>
      <Sealed x={25} y={120} o={easeOut(seg(t, 0, 0.4))} />
      <Cell x={25} y={60} w={210} label="order-1: delivered" o={easeOut(seg(t, 0.6, 1.0))} stroke={C.focus} f={C.focus} />
      <T x={25} y={50} s={11} f={C.focus} o={easeOut(seg(t, 0.6, 1.0))}>
        somewhere else
      </T>
      <Cell x={350} y={60} w={200} label="order-1's status?" o={easeOut(seg(t, 1.0, 1.3))} />
      <line x1={345} y1={74} x2={lerp(345, 240, q)} y2={74} stroke={C.focus} strokeWidth={1.6} />
      <T x={350} y={122} s={12} f={C.focus} o={easeOut(seg(t, 2.6, 3.0))}>
        answer: delivered
      </T>
      <T x={350} y={150} s={11} f={C.latte} o={easeOut(seg(t, 3.2, 3.6))}>
        the sealed piece, untouched
      </T>
    </Svg>
  );
}

// 1 · Setup. Two destinations. A lakehouse table read by a batch-style engine, its answer bar long. The fast store,
// fed by records that only just arrived, its answer bar a sliver.
export function Setup({ t }: StepCtx) {
  return (
    <Svg label="a lakehouse table is one destination; this topic answers queries in milliseconds" h={200}>
      <Cell x={25} y={30} w={200} label="a lakehouse table" o={easeOut(seg(t, 0, 0.3))} />
      <T x={240} y={34} s={11} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        batch-style questions
      </T>
      <rect x={240} y={42} width={300 * easeInOut(seg(t, 0.6, 1.8))} height={12} rx={3} fill={C.latte} opacity={0.6} />
      <Cell x={25} y={100} w={200} label="the fast store" o={easeOut(seg(t, 2.0, 2.3))} stroke={C.focus} f={C.focus} />
      {[0, 1, 2].map((i) => (
        <Pip key={i} x={30 + i * 14} y={150} f={C.second} o={easeOut(seg(t, 2.2 + i * 0.1, 2.4 + i * 0.1))} />
      ))}
      <T x={80} y={154} s={11} f={C.second} o={easeOut(seg(t, 2.4, 2.7))}>
        just arrived
      </T>
      <T x={240} y={104} s={11} f={C.focus} o={easeOut(seg(t, 2.6, 2.9))}>
        a tiny fraction of a second
      </T>
      <rect x={240} y={112} width={14 * easeOut(seg(t, 2.8, 3.0))} height={12} rx={3} fill={C.focus} />
    </Svg>
  );
}

// 2 · Predict. One partition's records flow straight into the fast store; a dashed builder slot waits between them. On
// answer it fills: the partition's own consuming task.
export function PredictSegmentOwner({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  return (
    <Svg label="a partition feeds this store directly — who builds its queryable unit?" h={200}>
      <Cell x={25} y={40} w={130} label="a partition" o={easeOut(seg(t, 0, 0.3))} />
      {[0, 1, 2].map((i) => (
        <Pip key={i} x={165 + ((t * 0.6 + i * 0.33) % 1) * 30} y={54} />
      ))}
      {v > 0 ? <Cell x={205} y={40} w={170} label="its own task" o={v} stroke={C.focus} f={C.focus} /> : <Hole x={205} y={40} w={170} o={easeOut(seg(t, 0.3, 0.6))} />}
      <Cell x={420} y={40} w={135} label="the fast store" o={easeOut(seg(t, 0.2, 0.5))} />
      <AnswerRow y={170} label="who builds the unit" answer={answer} value="its own task" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 3 · Per-partition consumers. Four partitions, each with its own task beside it. Ten records from each fill segments
// of 4 at a time: two full and one part-full each, 3 segments per partition, all built independently.
export function RevealConsumerPerPartition({ t }: StepCtx) {
  const fill = easeInOut(seg(t, 0.8, 3.2)) * 10;
  return (
    <Svg label="one consuming task per partition, building that partition's own segment" h={200}>
      <T x={25} y={18} s={11} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        4 partitions, 10 records each, segments of 4
      </T>
      {[0, 1, 2, 3].map((p) => {
        const y = 30 + p * 36;
        return (
          <g key={p} opacity={easeOut(seg(t, 0.1 + p * 0.1, 0.4 + p * 0.1))}>
            <rect x={25} y={y} width={90} height={26} rx={4} fill="none" stroke={C.mocha} strokeWidth={1.2} />
            <T x={70} y={y + 17} s={11} f={C.latte} a="middle">
              partition
            </T>
            <Cell x={125} y={y} w={70} h={26} label="task" stroke={C.focus} />
            {[0, 1, 2].map((sg) => {
              const cap = sg < 2 ? 4 : 2;
              const n = Math.max(0, Math.min(cap, Math.floor(fill) - sg * 4));
              return (
                <g key={sg}>
                  <rect x={215 + sg * 110} y={y} width={100} height={26} rx={4} fill="none" stroke={n > 0 ? C.second : C.mocha} strokeWidth={1.3} />
                  {Array.from({ length: n }, (_, j) => (
                    <rect key={j} x={222 + sg * 110 + j * 22} y={y + 7} width={16} height={12} rx={2} fill={C.second} opacity={0.7} />
                  ))}
                </g>
              );
            })}
          </g>
        );
      })}
      <T x={25} y={190} s={11} f={C.crema} o={easeOut(seg(t, 3.6, 4.0))}>
        3 segments each, every partition on its own
      </T>
    </Svg>
  );
}

/** An offset cell and a segment-count cell side by side. */
function State({ x, y, off, segs, o = 1, f = C.crema, sf = C.crema }: { x: number; y: number; off: string; segs: string; o?: number; f?: string; sf?: string }) {
  return (
    <g opacity={o}>
      <Cell x={x} y={y} w={140} label={`offset: ${off}`} f={f} />
      <Cell x={x + 150} y={y} w={160} label={`segments: ${segs}`} f={sf} />
    </g>
  );
}

// 4 · Atomic commit. Offset and segment count sit in one locked box. A first attempt fails with a bolt and both stay
// at 0. The retry succeeds and both move together: offset 5, segments 1.
export function RevealAtomicCommit({ t }: StepCtx) {
  const fail = easeOut(seg(t, 0.8, 1.1));
  const ok = t >= 2.6;
  return (
    <Svg label="the offset and the segment commit together, in one atomic action" h={200}>
      <rect x={20} y={36} width={330} height={44} rx={6} fill="none" stroke={C.focus} strokeWidth={1.6} opacity={easeOut(seg(t, 0, 0.3))} />
      <Lock x={360} y={52} k={easeOut(seg(t, 0.2, 0.5))} f={C.focus} />
      <State x={25} y={44} off={ok ? '5' : '0'} segs={ok ? '1' : '0'} f={ok ? C.focus : C.crema} sf={ok ? C.focus : C.crema} />
      <Bolt x={410} y={58} k={fail * (1 - easeOut(seg(t, 1.8, 2.1)))} />
      <T x={430} y={63} s={11} f={C.cherryText} o={fail * (1 - easeOut(seg(t, 1.8, 2.1)))}>
        failed
      </T>
      <T x={25} y={120} s={11} f={C.latte} o={easeOut(seg(t, 1.2, 1.5))}>
        failed: neither moved
      </T>
      <T x={25} y={150} s={11} f={C.focus} o={easeOut(seg(t, 2.6, 2.9))}>
        retried: both moved, as one
      </T>
      <T x={25} y={186} s={12} f={C.crema} o={easeOut(seg(t, 3.6, 4.0))}>
        both together, or neither
      </T>
    </Svg>
  );
}

// 5 · Naive commit. The offset is written first and jumps from 0 to 5; a bolt strikes before the segment is built, so
// segments stays 0, in cherry. The offset now claims progress no segment backs up.
export function RevealNaiveMismatch({ t }: StepCtx) {
  const off = t >= 1.0;
  const bolt = easeOut(seg(t, 1.6, 1.9));
  return (
    <Svg label="commit the offset first, and a crash leaves it ahead of the segment" h={200}>
      <T x={25} y={28} s={11} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        step one: write the offset. step two: build the segment.
      </T>
      <State x={25} y={44} off={off ? '5' : '0'} segs="0" f={off ? C.cherryText : C.crema} sf={bolt > 0 ? C.cherryText : C.crema} />
      <Bolt x={170} y={110} k={bolt} />
      <T x={190} y={114} s={11} f={C.cherryText} o={easeOut(seg(t, 1.8, 2.1))}>
        crash between the two steps
      </T>
      <T x={25} y={160} s={12} f={C.cherryText} o={easeOut(seg(t, 2.8, 3.2))}>
        offset 5 claims progress that segments 0 never backs
      </T>
    </Svg>
  );
}

// 6 · Predict. The sealed segment holds order-1: pending, locked. A later update, order-1: delivered, drifts toward it.
// On answer the update veers up into a separate overlay; the lock never opens.
export function PredictUpsertRewrite({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeInOut(seg(s, 0.1, 0.8)) : 0;
  const come = easeInOut(seg(t, 0.5, 1.4));
  return (
    <Svg label="does a newer value require rewriting the sealed segment holding the old one?" h={200}>
      <Sealed x={25} y={84} o={easeOut(seg(t, 0, 0.3))} />
      <Cell x={lerp(360, 330, come)} y={lerp(84, 24, v)} w={200} label="order-1: delivered" stroke={C.focus} o={easeOut(seg(t, 0.4, 0.7))} />
      {v >= 1 && (
        <T x={330} y={70} s={11} f={C.focus}>
          an overlay
        </T>
      )}
      <AnswerRow y={176} label="reopen the sealed piece" answer={answer} value="no" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 7 · Overlay. The update lands in an overlay cell above the sealed segment. A query arrives, checks the overlay first,
// and comes back with delivered. The sealed segment below still reads pending, its lock shut.
export function RevealUpsertOverlay({ t }: StepCtx) {
  const land = easeInOut(seg(t, 0.3, 1.0));
  const q = easeInOut(seg(t, 1.6, 2.4));
  return (
    <Svg label="the sealed segment stays untouched; an overlay carries the newer value" h={200}>
      <T x={25} y={88} s={11} f={C.focus} o={easeOut(seg(t, 0.8, 1.1))}>
        overlay, checked first
      </T>
      <Cell x={25} y={lerp(4, 40, land)} w={210} label="order-1: delivered" stroke={C.focus} f={C.focus} o={land} />
      <Sealed x={25} y={110} />
      <Cell x={350} y={40} w={200} label="a query: order-1?" o={easeOut(seg(t, 1.2, 1.5))} />
      <line x1={345} y1={54} x2={lerp(345, 240, q)} y2={54} stroke={C.focus} strokeWidth={1.6} />
      <T x={350} y={104} s={12} f={C.focus} o={easeOut(seg(t, 2.6, 3.0))}>
        answer: delivered
      </T>
      <T x={350} y={130} s={11} f={C.latte} o={easeOut(seg(t, 3.2, 3.6))}>
        never reopened
      </T>
    </Svg>
  );
}

// 8 · Build vs buy. One connector cell in the middle. Left: run it yourself, in-process, with the operating chores
// listed under it. Right: a managed service runs the very same connector for you.
export function RevealBuildVsBuy({ t }: StepCtx) {
  const chores = ['deploy it', 'watch it', 'fix it'];
  return (
    <Svg label="run the consumer yourself, or pay a managed service to run it instead" h={200}>
      <Cell x={25} y={30} w={240} label="run it yourself, in-process" o={easeOut(seg(t, 0.2, 0.5))} />
      {chores.map((c, i) => (
        <g key={c} opacity={easeOut(seg(t, 0.8 + i * 0.3, 1.1 + i * 0.3))}>
          <MiniTick x={30} y={84 + i * 26} k={1} f={C.latte} />
          <T x={50} y={90 + i * 26} s={11} f={C.latte}>
            {`you ${c}`}
          </T>
        </g>
      ))}
      <Cell x={315} y={30} w={240} label="a managed service runs it" o={easeOut(seg(t, 2.0, 2.3))} stroke={C.focus} />
      <T x={327} y={90} s={11} f={C.focus} o={easeOut(seg(t, 2.4, 2.7))}>
        the same connector,
      </T>
      <T x={327} y={110} s={11} f={C.focus} o={easeOut(seg(t, 2.6, 2.9))}>
        someone else's chores
      </T>
      <T x={25} y={186} s={12} f={C.crema} o={easeOut(seg(t, 3.4, 3.8))}>
        the same build-or-buy choice as before
      </T>
    </Svg>
  );
}

// 9 · Same shape. Three stores in three rows: Druid, Pinot, ClickHouse. Each gets the same two marks, one segment per
// partition and one exactly-once commit, ticked; the narrow remaining difference sits in a small slot at the end.
export function RevealSameShape({ t }: StepCtx) {
  const stores = ['Druid', 'Pinot', 'ClickHouse'];
  return (
    <Svg label="three stores, the same per-partition segments and the same atomic commit" h={200}>
      <T x={150} y={22} s={11} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        one per partition
      </T>
      <T x={330} y={22} s={11} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        commit once
      </T>
      <T x={470} y={22} s={11} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        the rest
      </T>
      {stores.map((n, i) => {
        const y = 40 + i * 44;
        const k = easeOut(seg(t, 0.4 + i * 0.6, 0.7 + i * 0.6));
        return (
          <g key={n} opacity={k}>
            <T x={25} y={y + 18} s={12} f={C.crema}>
              {n}
            </T>
            <MiniTick x={200} y={y + 12} k={easeOut(seg(t, 0.7 + i * 0.6, 1.0 + i * 0.6))} />
            <MiniTick x={360} y={y + 12} k={easeOut(seg(t, 0.9 + i * 0.6, 1.2 + i * 0.6))} />
            <rect x={470} y={y + 4} width={50} height={18} rx={3} fill="none" stroke={C.second} strokeWidth={1.2} strokeDasharray="3 3" />
          </g>
        );
      })}
      <T x={25} y={186} s={12} f={C.crema} o={easeOut(seg(t, 3.4, 3.8))}>
        far narrower differences than they first seem
      </T>
    </Svg>
  );
}

// 10 · Prove it. The run's results, one by one.
export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="this topic's own real run, every number read straight off it" h={260}>
      <Row y={30} label="4 partitions" value="3 segments each" k={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={75} label="failed atomic commit" value="state unchanged" valueColor={C.focus} k={easeOut(seg(t, 0.8, 1.2))} />
      <Row y={120} label="retried" value="offset 5, segments 1" k={easeOut(seg(t, 1.4, 1.8))} />
      <Row y={165} label="naive, crashed" value="offset 5, segments 0" valueColor={C.cherryText} k={easeOut(seg(t, 2.0, 2.4))} />
      <Row y={210} label="sealed: pending" value="answer: delivered" valueColor={C.focus} k={easeOut(seg(t, 2.6, 3.0))} />
      <Tick y={240} k={easeOut(seg(t, 3.4, 3.9))} />
    </Svg>
  );
}

// 11 · Recap. Three lines, one by one; the closed-out line outlined.
export function Recap({ t }: StepCtx) {
  const rows = ['the same segment, the same commit-once', 'a newer value without reopening the sealed', 'every idea earned earlier; the question closed'];
  return (
    <Svg label="segments, exactly-once, upsert, build-versus-buy — all reused, none reinvented" h={260}>
      {rows.map((r, i) => {
        const k = easeOut(seg(t, 0.3 + i * 1.2, 0.8 + i * 1.2));
        return <Cell key={i} x={25} y={lerp(30, 40, k) + i * 60} w={530} label={r} o={k} stroke={i === 2 ? C.focus : C.mocha} />;
      })}
    </Svg>
  );
}
