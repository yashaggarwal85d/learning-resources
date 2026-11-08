import { useEffect, useState } from 'react';
import { Bar, C, Draw, Plot, Reticle, Svg, T } from '../../../../../reels/kit';
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

/** `n` record pips in a strip from x at y; `lit(i)` gives each pip's colour, or null for unlit. */
function Strip({ x, y, n, gap, w, lit, o = 1 }: { x: number; y: number; n: number; gap: number; w: number; lit: (i: number) => string | null; o?: number }) {
  return (
    <g opacity={o}>
      {Array.from({ length: n }, (_, i) => {
        const f = lit(i);
        return <rect key={i} x={x + i * gap} y={y} width={w} height={14} rx={2} fill={f ?? C.cocoa} stroke={f ? f : C.mocha} strokeWidth={1} />;
      })}
    </g>
  );
}

/** A small downward index marker above x, at y. */
function Mark({ x, y, f = C.second, o = 1 }: { x: number; y: number; f?: string; o?: number }) {
  return <path d={`M${x - 5} ${y} h10 l-5 7 z`} fill={f} opacity={o} />;
}

// 0 · Hook. Two copies of one toy log. A naive scan lights record after record to the target; the sparse seek hops
// along index marks and walks four pips to the same target.
export function Hook({ t }: StepCtx) {
  const target = 35;
  const naive = Math.floor(easeInOut(seg(t, 0.4, 2.0)) * (target + 1));
  const hops = Math.floor(easeOut(seg(t, 2.3, 2.9)) * 5);
  const walk = Math.floor(easeOut(seg(t, 2.9, 3.4)) * 4);
  return (
    <Svg
      label="a toy partition, 400 real records in — a naive scan to the last few records scans 396 of them; a sparse-index seek for the same record scans 4. Which one is Kafka's own design?"
      h={200}
    >
      <Strip x={25} y={30} n={40} gap={13} w={10} o={easeOut(seg(t, 0, 0.3))} lit={(i) => (i === target && naive > target ? C.focus : i < naive ? C.latte : null)} />
      <T x={25} y={68} s={12} f={C.crema} o={easeOut(seg(t, 0.3, 0.6))}>
        naive scan
      </T>
      <T x={550} y={68} s={12} f={C.crema} a="end" o={easeOut(seg(t, 1.9, 2.2))}>
        396 scanned
      </T>
      {[0, 1, 2, 3, 4].map((m) => (
        <Mark key={m} x={30 + m * 8 * 13} y={98} f={m < hops ? C.second : C.mocha} o={easeOut(seg(t, 2.1, 2.3))} />
      ))}
      <Strip x={25} y={110} n={40} gap={13} w={10} o={easeOut(seg(t, 2.0, 2.3))} lit={(i) => (i >= 32 && i < 32 + walk ? (i === target ? C.focus : C.latte) : null)} />
      <T x={25} y={148} s={12} f={C.crema} o={easeOut(seg(t, 2.2, 2.5))}>
        sparse-index seek
      </T>
      <T x={550} y={148} s={12} f={C.focus} a="end" o={easeOut(seg(t, 3.4, 3.7))}>
        4 scanned
      </T>
      <T x={300} y={188} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 3.9, 4.3))}>
        the same record, found two ways
      </T>
    </Svg>
  );
}

// 1 · Setup. A partition folder holding two files: the first seals with a lock; the second keeps growing.
export function Setup({ t }: StepCtx) {
  const grow = easeInOut(seg(t, 1.8, 4.4));
  return (
    <Svg label="one partition, read directly as files on this sandbox's own disk — segment zero sealed, segment one still open" h={200}>
      <rect x={25} y={30} width={525} height={130} rx={6} fill="none" stroke={C.mocha} strokeWidth={1.5} strokeDasharray="5 3" opacity={easeOut(seg(t, 0, 0.3))} />
      <T x={37} y={50} s={11} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        partition folder, on disk
      </T>
      <Cell x={40} y={lerp(54, 62, easeOut(seg(t, 0.3, 0.7)))} w={235} label="00000000000000000000.log" o={easeOut(seg(t, 0.3, 0.7))} />
      <Cell x={290} y={lerp(54, 62, easeOut(seg(t, 0.6, 1.0)))} w={245} label="00000000000000000171.log" o={easeOut(seg(t, 0.6, 1.0))} stroke={C.focus} />
      <rect x={290} y={98} width={245 * (0.3 + 0.7 * grow)} height={6} rx={2} fill={C.focus} opacity={easeOut(seg(t, 1.6, 1.9))} />
      <Lock x={40} y={124} k={easeOut(seg(t, 1.2, 1.6))} />
      <T x={64} y={134} s={11} f={C.latte} o={easeOut(seg(t, 1.3, 1.7))}>
        sealed, never changes
      </T>
      <T x={290} y={134} s={11} f={C.focus} o={easeOut(seg(t, 1.9, 2.3))}>
        open, still growing
      </T>
    </Svg>
  );
}

// 2 · Predict. The open segment fills to its limit line; the next record waits below. On answer a new segment opens
// beside it and the record drops in.
export function PredictSegmentFull({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.5)) : 0;
  const m = answer !== null ? easeInOut(seg(s, 0.5, 1.1)) : 0;
  return (
    <Svg label="the open segment just crossed its size limit — what happens to the very next record appended?" h={200}>
      <rect x={25} y={40} width={300} height={28} rx={4} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} />
      <rect x={28} y={43} width={294 * easeInOut(seg(t, 0.2, 0.9))} height={22} rx={3} fill={C.latte} opacity={0.5} />
      <line x1={330} y1={30} x2={330} y2={78} stroke={C.cherryText} strokeWidth={1.5} strokeDasharray="4 3" opacity={easeOut(seg(t, 0.7, 1.0))} />
      <T x={330} y={24} s={11} f={C.cherryText} a="middle" o={easeOut(seg(t, 0.7, 1.0))}>
        size limit
      </T>
      <Cell x={345} y={40} w={150} label="new segment" o={v} stroke={C.focus} />
      <rect x={lerp(25, 413, clamp(m * 2, 0, 1))} y={lerp(110, 76, clamp(m * 2 - 1, 0, 1))} width={14} height={14} rx={2} fill={m >= 1 ? C.focus : C.latte} opacity={easeOut(seg(t, 1.0, 1.3))} />
      {answer === null && (
        <T x={48} y={122} s={11} f={C.latte} o={easeOut(seg(t, 1.1, 1.4))}>
          the next record?
        </T>
      )}
      <AnswerRow y={178} label="next record" answer={answer} value="a new segment" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 3 · Segment roll. Four segments fill one after another; each time one reaches the limit, a roll mark lands and the
// next opens (a roll mark draws). Records drop into the open file as it grows. The last stays open and is locked onto.
export function RevealSegmentRoll({ t }: StepCtx) {
  const fills = [0, 1, 2, 3].map((i) => easeInOut(seg(t, 0.4 + i * 0.85, 1.25 + i * 0.85)) * (i === 3 ? 0.6 : 1));
  // which segment is open right now, and where its fill ends: records drop in there
  const active = Math.min(3, Math.max(0, Math.floor((t - 0.4) / 0.85)));
  const tip = 25 + active * 132 + 3 + 114 * fills[active];
  const beat = ((t - 0.4) / 0.17) % 1;
  const dropping = t > 0.4 && t < 0.4 + 3 * 0.85 + 0.85 * 0.6;
  return (
    <Svg label="a real toy log, 400 records appended — the open segment rolls three separate times as it crosses its byte limit" h={200}>
      <T x={25} y={22} s={13} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        limit: 4,096 bytes per segment
      </T>
      {dropping && <rect x={tip - 4} y={lerp(28, 48, easeInOut(beat))} width={8} height={8} rx={1.5} fill={C.focus} opacity={1 - beat * 0.6} />}
      {fills.map((f, i) => {
        const x = 25 + i * 132;
        const open = easeOut(seg(t, 0.2 + i * 0.85, 0.45 + i * 0.85));
        const sw = easeOutBack(seg(t, 0.2 + i * 0.85, 0.5 + i * 0.85));
        return (
          <g key={i}>
            <g opacity={open} transform={`translate(${x + 60} 54) scale(${clamp(sw, 0, 1.1).toFixed(3)} 1) translate(${-(x + 60)} -54)`}>
              <rect x={x} y={40} width={120} height={28} rx={4} fill={C.cocoa} stroke={i === 3 ? C.focus : C.mocha} strokeWidth={1.5} />
            </g>
            <rect x={x + 3} y={43} width={114 * f} height={22} rx={3} fill={C.latte} opacity={0.5} />
            {i > 0 && (
              <>
                <Draw pts={[[x - 6, 36], [x - 6, 76]]} t={t} from={0.2 + i * 0.85} to={0.45 + i * 0.85} stroke={C.second} w={2} />
                <T x={x - 6} y={96} s={13} f={C.second} a="middle" o={open}>
                  roll
                </T>
              </>
            )}
          </g>
        );
      })}
      <g opacity={easeOut(seg(t, 3.9, 4.2))} transform={`translate(0 ${((1 - easeOut(seg(t, 3.9, 4.2))) * 8).toFixed(1)})`}>
        <T x={25} y={140} s={13} f={C.crema}>
          400 records: 3 rolls, 4 segments
        </T>
      </g>
      <Reticle x={482} y={54} w={132} h={42} t={t} at={4.2} />
    </Svg>
  );
}

// 4 · Sparse index. Forty pips of log; index marks land above every eighth one; a seek hops to the nearest mark and
// walks a few pips forward.
export function RevealSparseIndex({ t }: StepCtx) {
  const walk = Math.floor(easeOut(seg(t, 3.0, 3.6)) * 4);
  const hop = easeOut(seg(t, 2.6, 2.9));
  return (
    <Svg label="400 real records, one real sparse index — far fewer entries than records, and still enough to seek fast" h={200}>
      <Strip x={25} y={50} n={40} gap={13} w={10} o={easeOut(seg(t, 0, 0.4))} lit={(i) => (i >= 32 && i < 32 + walk ? (i === 35 ? C.focus : C.latte) : null)} />
      {[0, 1, 2, 3, 4].map((m) => (
        <Mark
          key={m}
          x={30 + m * 8 * 13}
          y={lerp(28, 36, easeOut(seg(t, 0.6 + m * 0.2, 0.9 + m * 0.2)))}
          o={easeOut(seg(t, 0.6 + m * 0.2, 0.9 + m * 0.2))}
          f={m === 4 && hop > 0 ? C.focus : C.second}
        />
      ))}
      <T x={25} y={110} s={12} f={C.crema} o={easeOut(seg(t, 1.6, 2.0))}>
        400 records
      </T>
      <T x={550} y={110} s={12} f={C.focus} a="end" o={easeOut(seg(t, 1.9, 2.3))}>
        50 index entries
      </T>
      <T x={25} y={160} s={11} f={C.latte} o={easeOut(seg(t, 3.4, 3.8))}>
        jump to a checkpoint, then a short walk forward
      </T>
    </Svg>
  );
}

// 5 · Predict. The strip, its marks, a hop to the last mark; the target pip waits. On answer the walk reaches it and a
// tick lands: never wrong.
export function PredictIndexCorrectness({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const walk = answer !== null ? Math.floor(easeOut(seg(s, 0.1, 0.6)) * 4) : 0;
  return (
    <Svg label="the index checks in only every so often — can a seek that relies on it ever come back with the wrong record?" h={200}>
      <Strip x={25} y={50} n={40} gap={13} w={10} o={easeOut(seg(t, 0, 0.3))} lit={(i) => (i >= 32 && i < 32 + walk ? (i === 35 ? C.focus : C.latte) : null)} />
      {[0, 1, 2, 3, 4].map((m) => (
        <Mark key={m} x={30 + m * 8 * 13} y={36} o={easeOut(seg(t, 0.2, 0.5))} f={m === 4 ? C.focus : C.second} />
      ))}
      <rect x={479} y={70} width={12} height={4} rx={1} fill={C.cherryText} opacity={answer === null ? easeOut(seg(t, 0.7, 1.0)) : 0} />
      {walk >= 4 && <MiniTick x={480} y={84} k={1} />}
      <AnswerRow y={178} label="ever wrong?" answer={answer} value="never" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 6 · Zero copy. Naive: data lights five boxes in turn, a cherry copy pip under each of four gaps. Sendfile: page cache
// straight to the NIC, one pip.
export function RevealZeroCopy({ t }: StepCtx) {
  const boxes = ['disk', 'page cache', 'app', 'socket', 'NIC'];
  const step = easeInOut(seg(t, 0.4, 2.4)) * 4;
  const direct = easeOut(seg(t, 2.9, 3.6));
  return (
    <Svg label="two data paths from disk to a consumer's socket: a naive one with four copies, Kafka's own with effectively one" h={200}>
      <T x={25} y={28} s={11} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        naive: four copies
      </T>
      {boxes.map((b, i) => (
        <Cell key={b} x={25 + i * 108} y={36} w={96} label={b} o={easeOut(seg(t, 0.1 + i * 0.05, 0.4 + i * 0.05))} stroke={step >= i ? C.focus : C.mocha} />
      ))}
      {[0, 1, 2, 3].map((g) => (
        <rect key={g} x={121 + g * 108 - 1} y={74} width={10} height={10} rx={2} fill={C.cherryText} opacity={step >= g + 1 ? 1 : 0} />
      ))}
      <T x={25} y={118} s={11} f={C.focus} o={easeOut(seg(t, 2.6, 2.9))}>
        sendfile: one copy
      </T>
      <Cell x={25} y={126} w={96} label="disk" o={easeOut(seg(t, 2.6, 2.9))} />
      <Cell x={133} y={126} w={96} label="page cache" o={easeOut(seg(t, 2.6, 2.9))} stroke={C.focus} />
      <Req x1={239} x2={449} y={140} k={direct} label="one call" f={C.focus} />
      <Cell x={457} y={126} w={96} label="NIC" o={easeOut(seg(t, 2.7, 3.0))} stroke={direct >= 1 ? C.focus : C.mocha} />
      <rect x={339} y={164} width={10} height={10} rx={2} fill={C.focus} opacity={direct >= 1 ? 1 : 0} />
    </Svg>
  );
}

// 7 · Offset ownership. The consumer's cursor reads forward to 5, rewinds to 0 and reads again; the segments beside it
// stay locked, identical byte for byte.
export function RevealOffsetOwnership({ t }: StepCtx) {
  const fwd = easeInOut(seg(t, 0.3, 1.5));
  const back = easeInOut(seg(t, 1.9, 2.5));
  const again = easeInOut(seg(t, 2.8, 3.8));
  const pos = t < 1.9 ? 5 * fwd : t < 2.8 ? 5 * (1 - back) : 5 * again;
  const label = t < 1.7 ? 'consumer: offset 5' : t < 2.2 ? 'consumer: offset 5' : t < 3.3 ? 'consumer: offset 0' : 'consumer: re-reads';
  return (
    <Svg label="a consumer rewinds its own stored offset from 5 back to 0 and re-reads — the partition's segments and index are measured identical, byte for byte, before and after" h={200}>
      <Strip x={25} y={50} n={10} gap={30} w={22} o={easeOut(seg(t, 0, 0.3))} lit={(i) => (i < Math.floor(pos + 0.01) ? C.latte : null)} />
      <path d={`M${31 + pos * 30} 92 l6 -8 l6 8 z`} fill={C.focus} opacity={easeOut(seg(t, 0.2, 0.4))} />
      <Cell x={25} y={110} w={200} label={label} o={easeOut(seg(t, 0.2, 0.5))} stroke={C.focus} />
      <Cell x={360} y={50} w={190} label="segments + index" o={easeOut(seg(t, 0.4, 0.7))} />
      <Lock x={530} y={102} k={easeOut(seg(t, 1.0, 1.4))} />
      <T x={360} y={112} s={11} f={C.latte} o={easeOut(seg(t, 1.0, 1.4))}>
        never touched
      </T>
      <T x={360} y={170} s={11} f={C.focus} o={easeOut(seg(t, 3.9, 4.3))}>
        identical, byte for byte
      </T>
    </Svg>
  );
}

// 8 · Prove it. The run's numbers, one by one; under them two scan bars, 396 against 4.
export function ProveIt({ t }: StepCtx) {
  const g = easeInOut(seg(t, 2.6, 3.6));
  return (
    <Svg label="every number from this reel, read straight off the real run of examples.py just now" h={260}>
      <Row y={40} label="segment roll trigger" value="4,096 bytes" k={easeOut(seg(t, 0.1, 0.5))} />
      <Row y={80} label="records vs index entries" value="400 vs 50" k={easeOut(seg(t, 0.6, 1.0))} />
      <Row y={120} label="scanned, naive vs sparse" value="396 vs 4" valueColor={C.focus} k={easeOut(seg(t, 1.1, 1.5))} />
      <Row y={160} label="rewind and re-read" value="no state changed" k={easeOut(seg(t, 1.6, 2.0))} />
      <rect x={25} y={196} width={525 * (396 / 400) * g} height={12} rx={2} fill={C.latte} />
      <rect x={25} y={222} width={Math.max(2, 525 * (4 / 400) * g)} height={12} rx={2} fill={C.focus} opacity={g > 0 ? 1 : 0} />
      <T x={60} y={233} s={11} f={C.focus} o={easeOut(seg(t, 3.4, 3.8))}>
        the sparse seek
      </T>
    </Svg>
  );
}

// 9 · Recap. Four lines, one by one; the consumer's own offset outlined.
export function Recap({ t }: StepCtx) {
  const rows = ['a partition: segment files on disk', 'a sparse index: few entries, fast seeks', 'zero-copy: page cache to the NIC', "an offset: the consumer's own number"];
  return (
    <Svg label="a segment that rolls at a size limit, a sparse index that still seeks fast, a zero-copy read path, and an offset the consumer owns, not the broker" h={260}>
      {rows.map((r, i) => {
        const k = easeOut(seg(t, 0.2 + i * 0.9, 0.6 + i * 0.9));
        return <Cell key={i} x={25} y={lerp(22, 30, k) + i * 50} w={530} label={r} o={k} stroke={i === 3 ? C.focus : C.mocha} />;
      })}
    </Svg>
  );
}
