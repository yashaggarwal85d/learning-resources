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

/** A chain of plan steps left to right with Exchange bars wherever `ex[i]` is set before step i. */
function Chain({ steps, ex, t, y = 40, kEx = 1 }: { steps: string[]; ex: boolean[]; t: number; y?: number; kEx?: number }) {
  const w = 130;
  const gap = (550 - steps.length * w) / (steps.length - 1);
  return (
    <g>
      {steps.map((s, i) => {
        const x = 25 + i * (w + gap);
        return (
          <g key={i}>
            <Cell x={x} y={y} w={w} h={30} label={s} stroke={i === 0 ? C.latte : C.focus} o={easeOut(seg(t, 0.1 + i * 0.3, 0.4 + i * 0.3))} />
            {i > 0 && <line x1={x - gap} y1={y + 15} x2={x} y2={y + 15} stroke={C.mocha} strokeWidth={1.4} />}
            {i > 0 && ex[i] && <rect x={x - gap / 2 - 5} y={y - 10} width={10} height={50 * kEx} rx={2} fill={C.second} />}
          </g>
        );
      })}
    </g>
  );
}

// 1 · Hook. The pieces from last topic; rows hover above them: which piece does each row land in?
export function Hook({ t }: StepCtx) {
  return (
    <Svg label="sizing decided how many pieces. This decides which row actually lands in which piece." h={200}>
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={25 + i * 140} y={110} width={130} height={40} rx={3} fill={C.cocoa} stroke={C.latte} strokeWidth={1.3} opacity={easeOut(seg(t, 0.1 + i * 0.1, 0.4 + i * 0.1))} />
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <circle key={i} cx={60 + i * 66} cy={40 + 8 * Math.sin(t * 3 + i)} r={6} fill={C.second} opacity={easeOut(seg(t, 0.8 + i * 0.1, 1.1 + i * 0.1))} />
      ))}
      <T x={300} y={84} s={13} f={C.second} a="middle" o={easeOut(seg(t, 2.0, 2.4))}>
        which row goes in which piece?
      </T>
      <T x={300} y={180} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 3.0, 3.4))}>
        grouping and sorting: the same rule?
      </T>
    </Svg>
  );
}

// 2 · Two partitioners. Upper lane: hash scatters keys by hash buckets. Lower lane: range lays them into ordered bands.
export function RevealTwoPartitioners({ t }: StepCtx) {
  const a = easeInOut(seg(t, 0.6, 1.6));
  const b = easeInOut(seg(t, 2.2, 3.2));
  const keys = [7, 2, 9, 4, 1, 8, 3, 6];
  return (
    <Svg label="measured: a group-by's own shuffle is tagged one way. A sort's own shuffle is tagged entirely differently." h={200}>
      <T x={25} y={22} s={12} f={C.crema} o={easeOut(seg(t, 0.1, 0.4))}>
        groupBy: hashpartitioning
      </T>
      {[0, 1, 2].map((i) => (
        <rect key={i} x={300 + i * 92} y={10} width={84} height={30} rx={3} fill="none" stroke={C.focus} strokeWidth={1.3} />
      ))}
      {keys.map((k, i) => (
        <circle key={i} cx={lerp(30 + i * 30, 312 + (k % 3) * 92 + (i % 3) * 22, a)} cy={lerp(56, 25, a)} r={5} fill={C.focus} opacity={easeOut(seg(t, 0.3, 0.6))} />
      ))}
      <T x={25} y={112} s={12} f={C.crema} o={easeOut(seg(t, 1.8, 2.2))}>
        sort: rangepartitioning
      </T>
      {[0, 1, 2].map((i) => (
        <rect key={i} x={300 + i * 92} y={100} width={84} height={30} rx={3} fill="none" stroke={C.second} strokeWidth={1.3} />
      ))}
      {keys.map((k, i) => {
        const band = k <= 3 ? 0 : k <= 6 ? 1 : 2;
        const pos = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((x) => (x <= 3 ? 0 : x <= 6 ? 1 : 2) === band && keys.includes(x)).indexOf(k);
        return <circle key={i} cx={lerp(30 + i * 30, 312 + band * 92 + pos * 22, b)} cy={lerp(146, 115, b)} r={5} fill={C.second} opacity={easeOut(seg(t, 1.9, 2.2))} />;
      })}
      <T x={25} y={180} s={11} f={C.latte} o={easeOut(seg(t, 3.4, 3.8))}>
        two mechanisms, not one with two names
      </T>
    </Svg>
  );
}

// 3 · Predict. Two window steps on the same key, k: does the second need its own Exchange?
export function PredictSameKeyWindows({ t, answer }: StepCtx) {
  return (
    <Svg label="two window steps, back to back, partitioned by the same key. Does the second one pay for its own shuffle too?" h={200}>
      <Chain steps={['scan', 'window by k', 'window by k']} ex={[false, true, false]} t={t} y={30} />
      <T x={510} y={92} s={14} f={C.second} a="middle" o={easeOut(seg(t, 1.0, 1.4))}>
        ?
      </T>
      <AnswerRow y={140} label="shuffles needed" answer={answer} value="one, shared" k={easeOut(seg(t, 1.6, 2.1))} />
      <Verdict answer={answer} y={184} text="already split by k: nothing to add" />
    </Svg>
  );
}

// 4 · Shared, measured. One Exchange bar before the first window; the second window's requirement ticks off with no bar.
export function RevealSharedExchange({ t }: StepCtx) {
  return (
    <Svg label="measured: one shuffle covers both steps. The second step's own requirement was already satisfied." h={200}>
      <Chain steps={['scan', 'window by k', 'window by k']} ex={[false, true, false]} t={t + 1} y={30} kEx={easeOut(seg(t, 0.4, 0.9))} />
      <MiniTick x={504} y={88} k={easeOut(seg(t, 1.4, 1.8))} />
      <T x={510} y={118} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 1.6, 2.0))}>
        already met
      </T>
      <Row y={170} label="Exchange nodes" value="1" valueColor={C.focus} k={easeOut(seg(t, 2.2, 2.6))} />
    </Svg>
  );
}

// 5 · Predict. The second window now on a different key, j: still one shared Exchange?
export function PredictDifferentKeyWindows({ t, answer }: StepCtx) {
  return (
    <Svg label="the same two steps, but now partitioned by two different keys. Still just the one shared shuffle?" h={200}>
      <Chain steps={['scan', 'window by k', 'window by j']} ex={[false, true, false]} t={t} y={30} />
      <T x={510} y={92} s={14} f={C.second} a="middle" o={easeOut(seg(t, 1.0, 1.4))}>
        ?
      </T>
      <AnswerRow y={140} label="still shared?" answer={answer} value="no: two shuffles" k={easeOut(seg(t, 1.6, 2.1))} />
      <Verdict answer={answer} y={184} text="a different key, a different requirement" />
    </Svg>
  );
}

// 6 · Two exchanges, measured. A second bar rises before the j window.
export function RevealTwoExchanges({ t }: StepCtx) {
  return (
    <Svg label="measured: two genuinely separate shuffles this time. Sharing only happens when the requirement is already met." h={200}>
      <Chain steps={['scan', 'window by k', 'window by j']} ex={[false, true, false]} t={t + 1} y={30} />
      <rect x={25 + 2 * (130 + 80) - 45} y={20} width={10} height={50 * easeOut(seg(t, 0.6, 1.2))} rx={2} fill={C.second} />
      <Row y={130} label="Exchange nodes" value={t > 1.2 ? '2' : '1'} valueColor={C.focus} k={easeOut(seg(t, 0.2, 0.6))} />
      <T x={25} y={180} s={11} f={C.latte} o={easeOut(seg(t, 2.0, 2.4))}>
        sharing was conditional all along
      </T>
    </Svg>
  );
}

// 7 · Predict. Ten Hive-style directories, day=0 to day=9; a filter on day = 3: skip directories, or read and filter?
export function PredictDirectoryPruning({ t, answer }: StepCtx) {
  return (
    <Svg label="data is laid out in Hive-style directories, one per value. Does filtering on that value skip entire directories, or just rows after reading them?" h={200}>
      {Array.from({ length: 10 }, (_, i) => (
        <Cell key={i} x={25 + i * 55} y={20} w={50} h={28} label={`day=${i}`} o={easeOut(seg(t, 0.1 + i * 0.05, 0.4 + i * 0.05))} />
      ))}
      <T x={25} y={78} s={12} f={C.second} o={easeOut(seg(t, 0.8, 1.2))}>
        filter: day = 3
      </T>
      <AnswerRow y={130} label="what gets skipped" answer={answer} value="whole directories" k={easeOut(seg(t, 1.6, 2.1))} />
      <Verdict answer={answer} y={178} text="the names rule them out unopened" />
    </Svg>
  );
}

// 8 · PartitionFilters, measured. Nine directories dim; day=3 lights; the scan line names the filter. A flat layout's line is empty.
export function RevealPartitionFilters({ t }: StepCtx) {
  const d = easeOut(seg(t, 0.6, 1.2));
  return (
    <Svg label="measured: the scan's own plan names the exact directory filter. The same filter on a flat layout has nothing to name." h={200}>
      {Array.from({ length: 10 }, (_, i) => (
        <Cell key={i} x={25 + i * 55} y={20} w={50} h={28} label={`day=${i}`} stroke={i === 3 ? C.focus : C.mocha} o={i === 3 ? 1 : 1 - 0.7 * d} />
      ))}
      <T x={25} y={80} s={11} f={C.latte} o={easeOut(seg(t, 1.2, 1.6))}>
        partitioned scan:
      </T>
      <T x={25} y={104} s={12} f={C.focus} o={easeOut(seg(t, 1.4, 1.8))}>
        PartitionFilters: [isnotnull(day), day = 3]
      </T>
      <T x={25} y={146} s={11} f={C.latte} o={easeOut(seg(t, 2.4, 2.8))}>
        flat layout, same filter:
      </T>
      <T x={25} y={170} s={12} f={C.cherryText} o={easeOut(seg(t, 2.6, 3.0))}>
        PartitionFilters: []
      </T>
    </Svg>
  );
}

// 9 · Recap.
export function Recap({ t }: StepCtx) {
  const r: [string, string, string][] = [
    ['grouping', 'hash split', C.focus],
    ['sorting', 'a range split', C.second],
    ['a later step', 'reuses, if already met', C.crema],
    ['Hive layout', 'prunes directories', C.focus],
  ];
  return (
    <Svg label="which partitioner, whether a shuffle is skipped, and whether a filter prunes whole directories — all readable directly." h={250}>
      {r.map(([a, b, f], i) => (
        <Row key={a} y={35 + i * 55} label={a} value={b} valueColor={f} k={easeOut(seg(t, 0.2 + i * 0.7, 0.6 + i * 0.7))} />
      ))}
    </Svg>
  );
}
