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

/** The size chart: deleted rows (0 to 6,000) across, bytes (0 to 12,000) up. */
const cx = (n: number) => 60 + n * 0.08;
const cy = (b: number) => 190 - b * (160 / 12000);

/** The chart's axes, threshold mark and axis names, drawn in by `o`. */
function SizeAxes({ o }: { o: number }) {
  return (
    <g opacity={o}>
      <line x1={60} y1={190} x2={550} y2={190} stroke={C.mocha} strokeWidth={1.5} />
      <line x1={60} y1={190} x2={60} y2={25} stroke={C.mocha} strokeWidth={1.5} />
      <line x1={cx(4096)} y1={186} x2={cx(4096)} y2={30} stroke={C.second} strokeWidth={1.2} strokeDasharray="4 4" />
      <T x={cx(4096)} y={208} s={11} f={C.second} a="middle">
        4,096
      </T>
      <T x={550} y={208} s={11} f={C.latte} a="end">
        deleted rows
      </T>
      <T x={68} y={22} s={11} f={C.latte}>
        bytes
      </T>
    </g>
  );
}

// 1 · Hook. Last topic's base file and its small log file; the log file grows into a strip of bits; three format names
// line up under it.
export function Hook({ t }: StepCtx) {
  const g = easeInOut(seg(t, 1.0, 2.0));
  return (
    <Svg label="merge-on-read's own delete files deserve their own topic -- the deletion vector, built for real." h={200}>
      <rect x={25} y={30} width={80} height={110} rx={3} fill={C.cocoa} stroke={C.latte} strokeWidth={1.4} opacity={easeOut(seg(t, 0.1, 0.4))} />
      <T x={25} y={160} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        base file
      </T>
      <rect
        x={lerp(120, 150, g)}
        y={lerp(60, 50, g)}
        width={lerp(40, 420, g)}
        height={lerp(40, 26, g)}
        rx={3}
        fill={C.cocoa}
        stroke={C.cherryText}
        strokeWidth={1.6}
        opacity={easeOut(seg(t, 0.3, 0.6))}
      />
      {Array.from({ length: 21 }, (_, i) => (
        <rect
          key={i}
          x={156 + i * 20}
          y={56}
          width={14}
          height={14}
          rx={1.5}
          fill={[3, 4, 11, 17].includes(i) ? C.cherryText : C.cocoa}
          stroke={C.mocha}
          strokeWidth={1}
          opacity={easeOut(seg(t, 2.0 + i * 0.03, 2.2 + i * 0.03))}
        />
      ))}
      <T x={150} y={40} s={12} f={C.cherryText} o={easeOut(seg(t, 2.2, 2.5))}>
        one bit per row
      </T>
      {['Delta', 'Iceberg v3', 'Hudi'].map((n, i) => (
        <Cell key={n} x={150 + i * 145} y={110} w={125} h={28} label={n} o={easeOut(seg(t, 2.9 + i * 0.3, 3.2 + i * 0.3))} />
      ))}
      <T x={150} y={175} s={13} f={C.focus} o={easeOut(seg(t, 3.9, 4.3))}>
        built for real, checked against all three
      </T>
    </Svg>
  );
}

// 2 · Predict. A file of 50,000 rows with 1,200 marked; a list or a bitmap? The answer: it depends on the count.
export function PredictArrayOrBitmap({ t, answer }: StepCtx) {
  return (
    <Svg label="1,200 of 50,000 rows need marking deleted, without rewriting the file -- cheapest way to record it?" h={200}>
      <Cell x={25} y={30} w={170} label="50,000 rows" o={easeOut(seg(t, 0.1, 0.4))} />
      <Lock x={205} y={38} k={easeOut(seg(t, 0.4, 0.7))} />
      <T x={25} y={85} s={12} f={C.cherryText} o={easeOut(seg(t, 0.7, 1.0))}>
        1,200 to mark deleted
      </T>
      <Cell x={300} y={30} w={120} label="a list?" o={easeOut(seg(t, 1.2, 1.5))} />
      <Cell x={445} y={30} w={130} label="a bitmap?" o={easeOut(seg(t, 1.5, 1.8))} />
      <AnswerRow y={140} label="the leanest record" answer={answer} value="depends on the count" k={easeOut(seg(t, 2.1, 2.6))} />
      <Verdict answer={answer} y={188} text="list and bitmap trade places" />
    </Svg>
  );
}

// 3 · Bitmap, not a list. A row of positions, and a strip of bits beneath it; bits flip on one by one; the file row
// strip never changes; position P is marked.
export function RevealBitmapNotList({ t }: StepCtx) {
  const on = [2, 5, 6, 13, 18];
  return (
    <Svg label="a deletion vector is a bitmap, one bit per row position -- not a list of deleted rows." h={230}>
      <T x={25} y={40} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        rows, in order
      </T>
      {Array.from({ length: 22 }, (_, i) => (
        <rect key={'r' + i} x={25 + i * 25} y={50} width={20} height={30} rx={2} fill={C.cocoa} stroke={C.latte} strokeWidth={1.2} opacity={easeOut(seg(t, 0.2 + i * 0.03, 0.4 + i * 0.03))} />
      ))}
      <T x={25} y={110} s={11} f={C.latte} o={easeOut(seg(t, 0.9, 1.2))}>
        one bit beside each
      </T>
      {Array.from({ length: 22 }, (_, i) => {
        const k = on.indexOf(i);
        const lit = k >= 0 && t > 1.8 + k * 0.35;
        return (
          <rect
            key={'b' + i}
            x={28 + i * 25}
            y={120}
            width={14}
            height={14}
            rx={1.5}
            fill={lit ? C.cherryText : C.cocoa}
            stroke={C.mocha}
            strokeWidth={1}
            opacity={easeOut(seg(t, 1.0 + i * 0.03, 1.2 + i * 0.03))}
          />
        );
      })}
      <line x1={35 + 13 * 25} y1={140} x2={35 + 13 * 25} y2={156} stroke={C.cherryText} strokeWidth={1.5} opacity={easeOut(seg(t, 3.4, 3.7))} />
      <T x={35 + 13 * 25} y={172} s={12} f={C.cherryText} a="middle" o={easeOut(seg(t, 3.4, 3.7))}>
        bit P set: row P deleted
      </T>
      <T x={25} y={215} s={13} f={C.focus} o={easeOut(seg(t, 4.0, 4.4))}>
        the file never changes; only the bits do
      </T>
    </Svg>
  );
}

// 4 · Small stays an array. The size chart; the array's line climbs two bytes per deletion to 1,200, landing at 2,400
// bytes, well left of the 4,096 threshold.
export function RevealSmallStaysArray({ t }: StepCtx) {
  const n = 1200 * easeInOut(seg(t, 1.0, 2.4));
  return (
    <Svg label="reproduced for real: 1,200 deletions stay under the threshold -- stored as a plain array." h={230}>
      <SizeAxes o={easeOut(seg(t, 0.1, 0.5))} />
      <line x1={cx(0)} y1={cy(0)} x2={cx(n)} y2={cy(2 * n)} stroke={C.focus} strokeWidth={2.5} />
      <circle cx={cx(1200)} cy={cy(2400)} r={5} fill={C.focus} opacity={easeOut(seg(t, 2.4, 2.7))} />
      <T x={cx(1200) + 12} y={cy(2400) - 8} s={12} f={C.focus} o={easeOut(seg(t, 2.6, 2.9))}>
        1,200 rows: 2,400 bytes
      </T>
      <T x={cx(1200) + 12} y={cy(2400) - 34} s={11} f={C.latte} o={easeOut(seg(t, 3.2, 3.5))}>
        an array, 2 bytes each
      </T>
    </Svg>
  );
}

// 5 · Predict. The array's line climbs toward the threshold mark; the answer: it switches to a bitset.
export function PredictArrayGrowsOrSwitches({ t, answer }: StepCtx) {
  return (
    <Svg label="what happens once the deletion count crosses that threshold?" h={200}>
      {Array.from({ length: 14 }, (_, i) => (
        <rect key={i} x={25 + i * 24} y={50} width={18} height={26} rx={2} fill={C.cocoa} stroke={C.focus} strokeWidth={1.3} opacity={easeOut(seg(t, 0.2 + i * 0.1, 0.4 + i * 0.1))} />
      ))}
      <line x1={400} y1={35} x2={400} y2={95} stroke={C.second} strokeWidth={2} strokeDasharray="4 4" opacity={easeOut(seg(t, 0.4, 0.7))} />
      <T x={410} y={68} s={12} f={C.second} o={easeOut(seg(t, 0.4, 0.7))}>
        4,096
      </T>
      <T x={470} y={68} s={18} f={C.crema} o={easeOut(seg(t, 1.8, 2.2))}>
        then?
      </T>
      <AnswerRow y={140} label="past the threshold" answer={answer} value="becomes a bitset" k={easeOut(seg(t, 2.3, 2.8))} />
      <Verdict answer={answer} y={188} text="fixed size, however many more" />
    </Svg>
  );
}

// 6 · Large becomes a bitset. The same chart: the array's line runs to 4,096, then the container flips to a flat line at
// 8,192 bytes out to 5,000; the list's would-be climb is drawn dashed above it.
export function RevealLargeBecomesBitset({ t }: StepCtx) {
  const a = 4096 * easeInOut(seg(t, 0.6, 1.6));
  const f = easeInOut(seg(t, 1.9, 2.7));
  return (
    <Svg label="reproduced for real: past the threshold, the same container becomes a fixed-size bitset." h={230}>
      <SizeAxes o={easeOut(seg(t, 0.1, 0.4))} />
      <line x1={cx(0)} y1={cy(0)} x2={cx(a)} y2={cy(2 * a)} stroke={C.focus} strokeWidth={2.5} />
      <line
        x1={cx(4096)}
        y1={cy(8192)}
        x2={cx(lerp(4096, 6000, easeInOut(seg(t, 3.2, 3.8))))}
        y2={cy(2 * lerp(4096, 6000, easeInOut(seg(t, 3.2, 3.8))))}
        stroke={C.taupe}
        strokeWidth={1.5}
        strokeDasharray="5 4"
      />
      <line x1={cx(4096)} y1={cy(8192)} x2={cx(lerp(4096, 6000, f))} y2={cy(8192)} stroke={C.second} strokeWidth={2.5} />
      <circle cx={cx(5000)} cy={cy(8192)} r={5} fill={C.second} opacity={easeOut(seg(t, 2.6, 2.9))} />
      <T x={110} y={cy(8192) - 10} s={12} f={C.second} o={easeOut(seg(t, 2.7, 3.0))}>
        5,000 rows: 8,192 bytes, a bitset
      </T>
      <T x={cx(6000)} y={112} s={11} f={C.taupe} a="end" o={easeOut(seg(t, 3.7, 4.0))}>
        a list would keep growing
      </T>
    </Svg>
  );
}

// 7 · The read cost. A scan head moves along the rows and checks the bit strip under each one as it goes; below, a plain
// scan bar and a longer bar for the scan that applies the bits.
export function RevealRealReadCost({ t }: StepCtx) {
  const h = easeInOut(seg(t, 0.8, 2.6));
  const on = [2, 5, 6, 13, 18];
  return (
    <Svg label="reproduced for real: applying the deletion vector at read time costs measurably more." h={230}>
      {Array.from({ length: 22 }, (_, i) => (
        <g key={i} opacity={easeOut(seg(t, 0.1 + i * 0.02, 0.3 + i * 0.02))}>
          <rect x={25 + i * 25} y={30} width={20} height={26} rx={2} fill={C.cocoa} stroke={C.latte} strokeWidth={1.2} />
          <rect x={28 + i * 25} y={64} width={14} height={14} rx={1.5} fill={on.includes(i) ? C.cherryText : C.cocoa} stroke={C.mocha} strokeWidth={1} />
        </g>
      ))}
      <rect x={lerp(22, 547, h)} y={24} width={3} height={60} fill={C.second} opacity={t > 0.8 && t < 2.7 ? 1 : 0} />
      <T x={25} y={108} s={11} f={C.latte} o={easeOut(seg(t, 0.8, 1.1))}>
        every read checks every row's bit
      </T>
      <T x={25} y={148} s={11} f={C.latte} o={easeOut(seg(t, 2.8, 3.1))}>
        plain scan
      </T>
      <rect x={160} y={136} width={200 * easeInOut(seg(t, 2.9, 3.4))} height={16} rx={2} fill={C.taupe} />
      <T x={25} y={178} s={11} f={C.latte} o={easeOut(seg(t, 3.3, 3.6))}>
        with the bits
      </T>
      <rect x={160} y={166} width={300 * easeInOut(seg(t, 3.4, 4.0))} height={16} rx={2} fill={C.cherryText} />
      <T x={25} y={218} s={13} f={C.cherryText} o={easeOut(seg(t, 4.1, 4.5))}>
        cheap to write, never free to read
      </T>
    </Svg>
  );
}

// 8 · Compaction. The marked rows drop out of the file as REORG ... PURGE rewrites it; the bits vanish; a third bar,
// for the compacted read, comes in shorter than the bar with the bits.
export function RevealCompactionPaysItBack({ t }: StepCtx) {
  const on = [2, 5, 6, 13, 18];
  const drop = easeInOut(seg(t, 1.4, 2.2));
  return (
    <Svg label="reproduced for real: compaction purges the deleted rows -- the read cost drops back down." h={230}>
      <T x={25} y={22} s={12} f={C.focus} o={easeOut(seg(t, 0.9, 1.2))}>
        REORG TABLE ... APPLY (PURGE)
      </T>
      {Array.from({ length: 22 }, (_, i) => {
        const gone = on.includes(i);
        return (
          <g key={i} opacity={easeOut(seg(t, 0.1, 0.4)) * (gone ? 1 - drop : 1)}>
            <rect x={25 + i * 25} y={gone ? lerp(34, 70, drop) : 34} width={20} height={26} rx={2} fill={C.cocoa} stroke={gone ? C.cherryText : C.latte} strokeWidth={1.2} />
          </g>
        );
      })}
      <T x={25} y={100} s={11} f={C.latte} o={easeOut(seg(t, 2.3, 2.6))}>
        rewritten, marked rows dropped for good
      </T>
      {[
        { l: 'with the bits', w: 300, f: C.cherryText },
        { l: 'compacted', w: 190, f: C.focus },
      ].map((r, i) => (
        <g key={r.l}>
          <T x={25} y={148 + i * 30} s={11} f={C.latte} o={easeOut(seg(t, 0.3 + i * 2.5, 0.6 + i * 2.5))}>
            {r.l}
          </T>
          <rect x={160} y={136 + i * 30} width={r.w * easeInOut(seg(t, 0.4 + i * 2.5, 1.0 + i * 2.5))} height={16} rx={2} fill={r.f} />
        </g>
      ))}
      <T x={25} y={218} s={13} f={C.focus} o={easeOut(seg(t, 3.8, 4.2))}>
        reads speed right back up
      </T>
    </Svg>
  );
}

// 9 · Three formats. Delta and Iceberg v3 each draw an arrow into one shared bitmap box with big-endian framing; Hudi's
// arrow goes elsewhere, into a log file of delete records, with the bitmap crossed for it.
export function RevealThreeFormatsOneDifference({ t }: StepCtx) {
  return (
    <Svg label="Delta and Iceberg v3 share the bitmap; Hudi answers the same question a different way." h={230}>
      <Cell x={25} y={30} w={130} h={30} label="Delta" o={easeOut(seg(t, 0.1, 0.4))} />
      <Cell x={25} y={80} w={130} h={30} label="Iceberg v3" o={easeOut(seg(t, 0.3, 0.6))} />
      <Cell x={25} y={160} w={130} h={30} label="Hudi" o={easeOut(seg(t, 2.4, 2.7))} />
      <Cell x={300} y={50} w={240} h={40} label="one bitmap, big-endian" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 1.0, 1.4))} />
      <line x1={157} y1={45} x2={lerp(157, 298, easeOut(seg(t, 0.6, 1.0)))} y2={lerp(45, 65, easeOut(seg(t, 0.6, 1.0)))} stroke={C.focus} strokeWidth={1.8} />
      <line x1={157} y1={95} x2={lerp(157, 298, easeOut(seg(t, 0.8, 1.2)))} y2={lerp(95, 75, easeOut(seg(t, 0.8, 1.2)))} stroke={C.focus} strokeWidth={1.8} />
      <T x={300} y={112} s={11} f={C.latte} o={easeOut(seg(t, 1.6, 1.9))}>
        same format, on purpose
      </T>
      <Cell x={300} y={155} w={270} h={40} label="delete records in log files" stroke={C.cherryText} o={easeOut(seg(t, 3.0, 3.4))} />
      <Req x1={157} x2={298} y={175} k={easeOut(seg(t, 2.7, 3.1))} f={C.cherryText} />
      <T x={300} y={218} s={11} f={C.cherryText} o={easeOut(seg(t, 3.6, 3.9))}>
        no bitmap at all
      </T>
    </Svg>
  );
}

// 10 · Recap.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a deletion vector is a real bitmap with a real size tradeoff and a real cost compaction pays back." h={250}>
      <Row y={40} label="a deletion vector" value="bits by position" k={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={95} label="up to 4,096" value="array, 2 bytes each" valueColor={C.focus} k={easeOut(seg(t, 1.0, 1.4))} />
      <Row y={150} label="past it" value="bitset, 8,192 bytes" valueColor={C.second} k={easeOut(seg(t, 1.8, 2.2))} />
      <Row y={210} label="every read" value="pays until compaction" valueColor={C.cherryText} k={easeOut(seg(t, 2.8, 3.2))} />
    </Svg>
  );
}
