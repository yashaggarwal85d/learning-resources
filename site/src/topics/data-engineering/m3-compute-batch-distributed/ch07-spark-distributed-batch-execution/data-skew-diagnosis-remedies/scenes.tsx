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

const OTHERS = [10, 9, 11, 10, 10, 9, 11, 10];

/** Eight tasks of one stage as bars on a baseline: the hot task (index 3) in cherry, the rest grey; `k` grows them. */
function Hist({ x, base, hs, k, hotStroke = C.cherryText, hotFill = C.bad }: { x: number; base: number; hs: number[]; k: number; hotStroke?: string; hotFill?: string }) {
  return (
    <g>
      {hs.map((h, i) => (
        <rect key={i} x={x + i * 30} y={base - h * k} width={22} height={Math.max(0, h * k)} fill={i === 3 ? hotFill : C.mocha} stroke={i === 3 ? hotStroke : C.latte} strokeWidth={1.2} />
      ))}
      <line x1={x - 4} y1={base} x2={x + 236} y2={base} stroke={C.mocha} strokeWidth={1.4} />
    </g>
  );
}

/** A dashed median line across a histogram, drawn left to right by `k`. */
function Median({ x, y, k }: { x: number; y: number; k: number }) {
  return <line x1={x - 4} y1={y} x2={x - 4 + 240 * k} y2={y} stroke={C.focus} strokeWidth={1.4} strokeDasharray="5 4" opacity={k > 0 ? 1 : 0} />;
}

// 0 · Hook. 999 keys share one bar, one key's bar is twice as long; it drops into one of the stage's task slots,
// which fills far behind the others.
export function Hook({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.8));
  const b = easeOut(seg(t, 0.9, 1.6));
  const m = easeInOut(seg(t, 1.8, 2.4));
  const p = easeOut(seg(t, 2.5, 3.5));
  return (
    <Svg label="one key holds twice the rows of the other 999 combined. What happens to the one task that gets it?" h={230}>
      <T x={25} y={40} s={11} f={C.latte} o={a}>
        999 keys: 10,000,000 rows
      </T>
      <rect x={25} y={50} width={160 * a} height={16} fill={C.mocha} stroke={C.latte} strokeWidth={1.2} />
      <T x={25} y={96} s={11} f={C.cherryText} o={b}>
        one key: 20,000,000 rows
      </T>
      {m < 1 && <rect x={lerp(25, 229, m)} y={lerp(106, 172, m)} width={lerp(320 * b, 58, m)} height={16} fill={C.bad} stroke={C.cherryText} strokeWidth={1.2} />}
      <T x={575} y={152} s={11} f={C.latte} a="end" o={easeOut(seg(t, 1.6, 2.0))}>
        the stage's tasks
      </T>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <g key={i} opacity={easeOut(seg(t, 1.6, 2.0))}>
          <rect x={25 + i * 68} y={166} width={58} height={28} rx={3} fill={C.cocoa} stroke={i === 3 && m >= 1 ? C.cherryText : C.mocha} strokeWidth={1.5} />
          <rect x={25 + i * 68} y={176} width={58 * p * (i === 3 ? 0.22 : 1)} height={8} fill={i === 3 ? C.bad : C.latte} />
        </g>
      ))}
      {[0, 1, 2, 4, 5, 6, 7].map((i) => (
        <MiniTick key={i} x={48 + i * 68} y={210} k={easeOut(seg(t, 3.4, 3.8))} />
      ))}
    </Svg>
  );
}

// 1 · Measured. Every task by shuffle-read bytes, then by duration: one bar towers on both, against a dashed median.
export function RevealBaseline({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.2));
  const b = easeOut(seg(t, 2.1, 3.0));
  return (
    <Svg label="measured: a straggler shows up as a ratio, not a look at the raw data." h={240}>
      <Hist x={25} base={170} hs={OTHERS.map((h, i) => (i === 3 ? 122 : h))} k={a} />
      <Median x={25} y={160} k={easeOut(seg(t, 1.2, 1.6))} />
      <T x={126} y={38} s={13} f={C.cherryText} a="middle" o={easeOut(seg(t, 1.5, 1.9))}>
        12.2×
      </T>
      <T x={25} y={194} s={11} f={C.latte} o={a}>
        shuffle-read bytes
      </T>
      <Hist x={330} base={170} hs={OTHERS.map((h, i) => (i === 3 ? 112 : h * 2.8))} k={b} />
      <Median x={330} y={142} k={easeOut(seg(t, 3.0, 3.3))} />
      <T x={431} y={48} s={13} f={C.cherryText} a="middle" o={easeOut(seg(t, 3.3, 3.7))}>
        ~4×
      </T>
      <T x={330} y={194} s={11} f={C.latte} o={b}>
        task duration
      </T>
      <T x={300} y={228} s={12} f={C.focus} a="middle" o={easeOut(seg(t, 3.8, 4.2))}>
        one stage, one straggler, two ratios
      </T>
    </Svg>
  );
}

// 2 · Predict. The same bytes histogram; AQE's skew-join switch flips on with its defaults. Does the tower shrink?
export function PredictAqeDefault({ t, answer }: StepCtx) {
  const on = easeInOut(seg(t, 0.4, 0.9));
  return (
    <Svg label="AQE already splits skewed partitions automatically. Does turning it on, with defaults, fix this?" h={230}>
      <Hist x={25} base={160} hs={OTHERS.map((h, i) => (i === 3 ? 122 : h))} k={1} />
      <T x={126} y={28} s={13} f={C.cherryText} a="middle">
        12.2×
      </T>
      <rect x={340} y={60} width={60} height={28} rx={14} fill={C.cocoa} stroke={on > 0.5 ? C.focus : C.mocha} strokeWidth={1.8} />
      <circle cx={lerp(354, 386, on)} cy={74} r={9} fill={on > 0.5 ? C.focus : C.latte} />
      <T x={415} y={72} s={12} f={C.crema}>
        AQE skew-join
      </T>
      <T x={415} y={92} s={11} f={C.latte}>
        every default
      </T>
      <T x={370} y={140} s={15} f={C.focus} a="middle" o={answer === null ? easeOut(seg(t, 1.2, 1.6)) : 0}>
        gap closes?
      </T>
      <Verdict answer={answer} y={205} text="it doesn't move at all" />
    </Svg>
  );
}

// 3 · Why. A size axis: the default threshold line at 256 MB, the skewed partition's bar grows and stops well short.
export function RevealAqeDefaultFails({ t }: StepCtx) {
  const g = easeOut(seg(t, 0.8, 2.0));
  const w = 155 * 1.733 * g;
  return (
    <Svg label="measured: unchanged. The default skew threshold never triggers at this data's scale." h={230}>
      <T x={25} y={36} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.5))}>
        threshold: 256 MB
      </T>
      <line x1={469} y1={50} x2={469} y2={lerp(50, 150, easeOut(seg(t, 0.2, 0.7)))} stroke={C.focus} strokeWidth={2} />
      <rect x={25} y={88} width={w} height={26} fill={C.bad} stroke={C.cherryText} strokeWidth={1.2} />
      {g > 0.02 && (
        <T x={35 + w} y={106} s={12} f={C.cherryText}>
          {`~${num(155 * g)} MB`}
        </T>
      )}
      <line x1={294} y1={140} x2={lerp(294, 469, easeOut(seg(t, 2.4, 3.0)))} y2={140} stroke={C.latte} strokeWidth={1.4} strokeDasharray="4 4" opacity={t > 2.4 ? 1 : 0} />
      <T x={381} y={166} s={12} f={C.latte} a="middle" o={easeOut(seg(t, 2.9, 3.3))}>
        never crosses
      </T>
      <T x={25} y={212} s={13} f={C.focus} o={easeOut(seg(t, 3.5, 3.9))}>
        by the rule's own arithmetic: not skewed
      </T>
    </Svg>
  );
}

// 4 · Retuned. The threshold line slides down to 16 MB; the partition now clears it, cuts into pieces,
// and the pieces drop into separate task slots side by side. The bytes ratio counts down.
export function ElaborateAqeTuned({ t }: StepCtx) {
  const mv = easeInOut(seg(t, 0.3, 1.2));
  const cut = easeOut(seg(t, 1.4, 2.0));
  const drop = easeInOut(seg(t, 2.2, 3.2));
  const r = easeOut(seg(t, 3.3, 4.2));
  const lx = lerp(469, 53, mv);
  const pw = (155 * 1.733) / 10;
  return (
    <Svg label="retuned to the data's own scale, the same rule actually splits the skewed partition." h={240}>
      <T x={25} y={36} s={12} f={C.latte}>
        {mv < 0.5 ? 'threshold: 256 MB' : 'threshold: 16 MB'}
      </T>
      <line x1={lx} y1={50} x2={lx} y2={130} stroke={C.focus} strokeWidth={2} />
      {Array.from({ length: 10 }, (_, i) => {
        const x0 = 25 + i * pw + cut * (i - 4.5) * 3;
        const x1 = 25 + i * 54;
        return (
          <rect
            key={i}
            x={lerp(x0, x1, drop)}
            y={lerp(88, 150, drop)}
            width={lerp(pw, 44, drop) - 1}
            height={lerp(26, 18, drop)}
            fill={drop > 0.5 ? C.mocha : C.bad}
            stroke={drop > 0.5 ? C.latte : C.cherryText}
            strokeWidth={1.2}
          />
        );
      })}
      <Row y={215} label="max/median bytes" value={`${num(lerp(12.2, 1.1, r), 1)}×`} valueColor={r > 0.99 ? C.focus : C.crema} k={easeOut(seg(t, 3.1, 3.4))} />
    </Svg>
  );
}

// 5 · Predict. A copy of the small table flies to every task; the big table's side has nothing to shuffle. Does skew survive?
export function PredictBroadcast({ t, answer }: StepCtx) {
  return (
    <Svg label="a much blunter tool, with no AQE config involved at all. Does it fix the skew too?" h={240}>
      <Cell x={25} y={40} w={140} label="small table" o={easeOut(seg(t, 0.1, 0.4))} stroke={C.second} />
      <Cell x={25} y={140} w={140} label="big table" o={easeOut(seg(t, 0.1, 0.4))} />
      {[0, 1, 2, 3].map((i) => {
        const k = easeInOut(seg(t, 0.5 + i * 0.25, 1.2 + i * 0.25));
        return (
          <g key={i}>
            <Cell x={400} y={20 + i * 45} w={150} label="task" o={easeOut(seg(t, 0.2, 0.5))} />
            {k > 0 && <rect x={lerp(150, 410, k)} y={lerp(48, 28 + i * 45, k)} width={14} height={12} rx={2} fill={C.second} />}
          </g>
        );
      })}
      <T x={280} y={160} s={15} f={C.focus} a="middle" o={answer === null ? easeOut(seg(t, 1.9, 2.3)) : 0}>
        skew gone?
      </T>
      <Verdict answer={answer} y={225} text="yes: no shuffle on the big side" />
    </Svg>
  );
}

// 6 · Measured. The plan's three join strategies: two crossed out, broadcast hash join ticked. Beside it,
// the big side's Exchange bar fades out of the strip.
export function RevealBroadcastWorks({ t }: StepCtx) {
  const ex = easeOut(seg(t, 2.4, 3.0));
  return (
    <Svg label="measured: no shuffle join of any kind in the plan. Nothing left to be skewed." h={230}>
      <Cell x={25} y={30} w={200} label="SortMergeJoin" o={easeOut(seg(t, 0.2, 0.5))} />
      <Cross x={245} y={44} k={easeOut(seg(t, 0.6, 0.9))} />
      <Cell x={25} y={80} w={200} label="ShuffledHashJoin" o={easeOut(seg(t, 0.8, 1.1))} />
      <Cross x={245} y={94} k={easeOut(seg(t, 1.2, 1.5))} />
      <Cell x={25} y={130} w={200} label="BroadcastHashJoin" stroke={C.second} o={easeOut(seg(t, 1.4, 1.7))} />
      <MiniTick x={238} y={142} k={easeOut(seg(t, 1.8, 2.1))} f={C.second} />
      <Cell x={300} y={80} w={110} label="big side" o={easeOut(seg(t, 0.2, 0.5))} />
      <rect x={421} y={74} width={12} height={40} rx={2} fill={C.latte} opacity={easeOut(seg(t, 0.4, 0.8)) * (1 - ex)} />
      <line x1={410} y1={94} x2={466} y2={94} stroke={C.latte} strokeWidth={1.6} opacity={ex} />
      <Cell x={466} y={80} w={100} label="join" stroke={ex > 0.5 ? C.second : C.mocha} o={easeOut(seg(t, 0.2, 0.5))} />
      {ex < 0.99 && (
        <T x={427} y={64} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 0.4, 0.8)) * (1 - ex)}>
          Exchange
        </T>
      )}
      <T x={25} y={205} s={13} f={C.focus} o={easeOut(seg(t, 3.4, 3.8))}>
        no shuffle, so nothing to be uneven
      </T>
    </Svg>
  );
}

// 7 · When the small side won't fit. Its ghost overflows the memory box and is crossed out; only the hot keys'
// slice slides down and into memory; the rest is shuffled as before.
export function ElaborateIsolate({ t }: StepCtx) {
  const g = easeOut(seg(t, 0.7, 1.1)) * (1 - easeOut(seg(t, 1.6, 1.9)));
  const d = easeInOut(seg(t, 2.0, 2.5));
  const r = easeInOut(seg(t, 2.6, 3.3));
  return (
    <Svg label="when the small side itself won't fit whole, isolate just the hot keys' rows instead." h={230}>
      <rect x={lerp(25, 340, r)} y={lerp(40, 100, d)} width={36} height={28} rx={3} fill={C.cocoa} stroke={C.focus} strokeWidth={1.6} opacity={easeOut(seg(t, 0.1, 0.4))} />
      <Cell x={61} y={40} w={164} label="small table" o={easeOut(seg(t, 0.1, 0.4))} />
      <rect x={330} y={96} width={150} height={36} rx={4} fill="none" stroke={C.latte} strokeWidth={1.4} strokeDasharray="5 4" opacity={easeOut(seg(t, 0.3, 0.6))} />
      <T x={405} y={152} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 0.3, 0.6))}>
        memory
      </T>
      {g > 0.02 && (
        <g opacity={g}>
          <rect x={330} y={100} width={200} height={28} rx={3} fill="none" stroke={C.cherryText} strokeWidth={1.4} strokeDasharray="4 3" />
          <Cross x={545} y={114} k={easeOut(seg(t, 1.1, 1.4))} />
        </g>
      )}
      <T x={25} y={152} s={11} f={C.focus} o={easeOut(seg(t, 2.3, 2.7))}>
        hot keys' rows
      </T>
      <T x={390} y={120} s={11} f={C.second} o={easeOut(seg(t, 3.3, 3.6))}>
        broadcast
      </T>
      <T x={25} y={205} s={12} f={C.latte} o={easeOut(seg(t, 3.7, 4.1))}>
        everything else: shuffled as before
      </T>
    </Svg>
  );
}

// 8 · Salting. The tower shrinks to 3.2x but no lower than the tuned split's 1.1x; the small table is copied once per
// salt bucket; total shuffled bytes then outgrow the baseline's.
export function RevealSaltingCost({ t }: StepCtx) {
  const s = easeInOut(seg(t, 0.3, 1.3));
  const tot = easeOut(seg(t, 3.2, 4.2));
  const h = lerp(122, 32, s);
  return (
    <Svg label="measured: salting helps, but it isn't free. Replicating the small side costs real bytes." h={240}>
      <Hist x={25} base={140} hs={OTHERS.map((v, i) => (i === 3 ? h : v))} k={1} />
      <Median x={25} y={130} k={1} />
      <T x={126} y={140 - h - 8} s={13} f={C.cherryText} a="middle">
        {`${num(lerp(12.2, 3.2, s), 1)}×`}
      </T>
      <T x={320} y={40} s={12} f={C.latte} o={easeOut(seg(t, 1.3, 1.6))}>
        salted
      </T>
      <T x={575} y={40} s={13} f={C.crema} a="end" o={easeOut(seg(t, 1.3, 1.6))}>
        3.2×
      </T>
      <T x={320} y={72} s={12} f={C.latte} o={easeOut(seg(t, 1.6, 1.9))}>
        tuned split
      </T>
      <T x={575} y={72} s={13} f={C.second} a="end" o={easeOut(seg(t, 1.6, 1.9))}>
        1.1×
      </T>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <rect key={i} x={320 + i * 30} y={92} width={22} height={14} rx={2} fill="none" stroke={C.second} strokeWidth={1.4} opacity={easeOut(seg(t, 2.0 + i * 0.1, 2.3 + i * 0.1))} />
      ))}
      <T x={320} y={128} s={11} f={C.latte} o={easeOut(seg(t, 2.0, 2.4))}>
        the small table, copied
      </T>
      <T x={25} y={180} s={11} f={C.latte} o={easeOut(seg(t, 3.0, 3.3))}>
        total bytes, baseline
      </T>
      <rect x={220} y={170} width={200 * tot} height={12} fill={C.latte} />
      <T x={25} y={215} s={11} f={C.cherryText} o={easeOut(seg(t, 3.0, 3.3))}>
        total bytes, salted
      </T>
      <rect x={220} y={205} width={260 * tot} height={12} fill={C.bad} stroke={C.cherryText} strokeWidth={1.2} />
    </Svg>
  );
}

// 9 · A sum. The hot key's rows collapse to one row inside each map task before the shuffle; then the shuffle-write
// bytes: the hot key's task writes 59, a diverse-key task 12,750.
export function RevealCombinableNotSkewed({ t }: StepCtx) {
  const c = easeInOut(seg(t, 0.4, 1.3));
  const a = easeOut(seg(t, 1.8, 2.6));
  const b = easeOut(seg(t, 2.6, 3.4));
  return (
    <Svg label="measured: a sum over the same hot key isn't skewed at the shuffle at all." h={240}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={25} y={lerp(26 + i * 12, 56, c)} width={180} height={8} fill={C.bad} stroke={C.cherryText} strokeWidth={1} opacity={i === 0 || c < 1 ? 1 : 0} />
      ))}
      <T x={230} y={64} s={12} f={C.latte} o={easeOut(seg(t, 1.1, 1.5))}>
        partial sum: one row
      </T>
      <Row y={150} label="hot key's task writes" value={`${num(59 * a)} B`} k={easeOut(seg(t, 1.6, 1.9))} />
      <rect x={25} y={162} width={Math.max(2, (400 * 59) / 12750) * a} height={8} fill={C.latte} />
      <Row y={205} label="a diverse-key task" value={`${num(12750 * b)} B`} k={easeOut(seg(t, 2.4, 2.7))} />
      <rect x={25} y={217} width={400 * b} height={8} fill={C.latte} />
      <T x={230} y={100} s={12} f={C.focus} o={easeOut(seg(t, 3.7, 4.1))}>
        the hot key is the cheap one
      </T>
    </Svg>
  );
}

// 10 · A list. Nothing collapses: one reduce task runs far past the median. The split rule's pattern match:
// sort-merge and shuffled-hash joins ticked, an aggregate crossed.
export function RevealNonCombinableSkewed({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.4));
  return (
    <Svg label="measured: a list of the same hot key's values has nowhere to hide. AQE's rule never reaches it." h={240}>
      <Hist x={25} base={175} hs={OTHERS.map((h, i) => (i === 3 ? 135 : h))} k={a} />
      <Median x={25} y={165} k={easeOut(seg(t, 1.3, 1.6))} />
      <T x={126} y={30} s={13} f={C.cherryText} a="middle" o={easeOut(seg(t, 1.5, 1.9))}>
        well over 10×
      </T>
      <T x={25} y={200} s={11} f={C.latte} o={a}>
        task duration
      </T>
      <T x={320} y={40} s={12} f={C.latte} o={easeOut(seg(t, 2.0, 2.3))}>
        the split rule matches
      </T>
      <Cell x={320} y={55} w={180} label="SortMergeJoin" o={easeOut(seg(t, 2.2, 2.5))} />
      <MiniTick x={512} y={66} k={easeOut(seg(t, 2.5, 2.8))} />
      <Cell x={320} y={95} w={180} label="ShuffledHashJoin" o={easeOut(seg(t, 2.7, 3.0))} />
      <MiniTick x={512} y={106} k={easeOut(seg(t, 3.0, 3.3))} />
      <Cell x={320} y={135} w={180} label="Aggregate" stroke={C.cherryText} o={easeOut(seg(t, 3.3, 3.6))} />
      <Cross x={520} y={149} k={easeOut(seg(t, 3.7, 4.0))} />
      <T x={320} y={200} s={12} f={C.focus} o={easeOut(seg(t, 4.1, 4.5))}>
        never reached
      </T>
    </Svg>
  );
}

// 11 · Two phases. The hot key fans out into one cell per salt value (phase one, partial lists), which fan back in
// to the real key (phase two). Beside it, the slowest task's bar drops toward the median.
export function ElaborateTwoPhase({ t }: StepCtx) {
  const sh = easeInOut(seg(t, 3.0, 4.0));
  const bh = lerp(150, 34, sh);
  return (
    <Svg label="salt the key, aggregate partially, then re-aggregate by the real key alone." h={250}>
      <Cell x={25} y={110} w={90} label="hot key" stroke={C.cherryText} o={easeOut(seg(t, 0.1, 0.4))} />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const k = easeOut(seg(t, 0.5 + i * 0.1, 1.0 + i * 0.1));
        const m = easeOut(seg(t, 1.9 + i * 0.08, 2.4 + i * 0.08));
        const y = 18 + i * 25;
        return (
          <g key={i}>
            <line x1={115} y1={124} x2={lerp(115, 170, k)} y2={lerp(124, y + 9, k)} stroke={C.latte} strokeWidth={1.1} opacity={k > 0 ? 1 : 0} />
            <Cell x={170} y={y} w={60} h={18} label={`k·${i}`} o={k} />
            <line x1={230} y1={y + 9} x2={lerp(230, 300, m)} y2={lerp(y + 9, 124, m)} stroke={C.latte} strokeWidth={1.1} opacity={m > 0 ? 1 : 0} />
          </g>
        );
      })}
      <Cell x={300} y={110} w={100} label="hot key" stroke={C.second} o={easeOut(seg(t, 2.4, 2.8))} />
      <T x={200} y={236} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 1.2, 1.6))}>
        phase one
      </T>
      <T x={350} y={236} s={11} f={C.second} a="middle" o={easeOut(seg(t, 2.6, 3.0))}>
        phase two
      </T>
      <g opacity={easeOut(seg(t, 0.2, 0.6))}>
        <line x1={466} y1={200} x2={560} y2={200} stroke={C.mocha} strokeWidth={1.4} />
        <rect x={500} y={200 - bh} width={24} height={bh} fill={sh > 0.5 ? C.mocha : C.bad} stroke={sh > 0.5 ? C.latte : C.cherryText} strokeWidth={1.2} />
        <line x1={466} y1={185} x2={560} y2={185} stroke={C.focus} strokeWidth={1.4} strokeDasharray="5 4" />
        <T x={512} y={236} s={11} f={C.latte} a="middle">
          slowest task
        </T>
      </g>
    </Svg>
  );
}

// 12 · Recap. Two ratios on top; the join ladder's four rungs drawn in order; beside it, an aggregation the ladder
// never reaches.
export function Recap({ t }: StepCtx) {
  const rungs = ['split rule (AQE)', 'broadcast', 'isolate hot keys', 'salt, last'];
  return (
    <Svg label="diagnose from the ratios first, then reach for the ladder in order — and remember what it was built for." h={250}>
      <T x={25} y={30} s={12} f={C.focus} o={easeOut(seg(t, 0.2, 0.6))}>
        first: max/median bytes and duration
      </T>
      {rungs.map((r, i) => (
        <g key={r}>
          <Cell x={25} y={55 + i * 44} w={220} label={r} stroke={i === 3 ? C.latte : C.second} o={easeOut(seg(t, 0.8 + i * 0.6, 1.2 + i * 0.6))} />
          {i < 3 && <path d={`M135 ${85 + i * 44} v10 l-5 -5 m5 5 l5 -5`} fill="none" stroke={C.latte} strokeWidth={1.4} opacity={easeOut(seg(t, 1.1 + i * 0.6, 1.4 + i * 0.6))} />}
        </g>
      ))}
      <Cell x={330} y={120} w={220} label="an aggregation" stroke={C.cherryText} o={easeOut(seg(t, 3.4, 3.8))} />
      <line x1={250} y1={134} x2={lerp(250, 326, easeOut(seg(t, 3.8, 4.2)))} y2={134} stroke={C.latte} strokeWidth={1.4} strokeDasharray="4 4" opacity={t > 3.8 ? 1 : 0} />
      <T x={330} y={175} s={11} f={C.latte} o={easeOut(seg(t, 4.1, 4.5))}>
        the ladder was never for it
      </T>
    </Svg>
  );
}
