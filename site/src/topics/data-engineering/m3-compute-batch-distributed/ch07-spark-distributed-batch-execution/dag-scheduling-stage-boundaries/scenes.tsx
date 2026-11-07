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

/** The chapter's DAG strip: stage boxes left to right, each holding its pipelined operators, an Exchange bar drawn between stages.
 * `k(i)` reveals stage i; `kx(i)` draws the exchange after stage i. */
function Dag({ stages, y = 30, h = 90, k, kx }: { stages: string[][]; y?: number; h?: number; k: (i: number) => number; kx: (i: number) => number }) {
  const gap = 30;
  const w = (550 - (stages.length - 1) * gap) / stages.length;
  return (
    <g>
      {stages.map((ops, i) => {
        const x = 25 + i * (w + gap);
        return (
          <g key={i}>
            <g opacity={k(i)}>
              <rect x={x} y={y} width={w} height={h} rx={5} fill="none" stroke={C.latte} strokeWidth={1.6} />
              <T x={x + 10} y={y + 18} s={11} f={C.latte}>
                {`stage ${i + 1}`}
              </T>
              {ops.map((o, j) => {
                const ow = (w - 20 - (ops.length - 1) * 14) / ops.length;
                const ox = x + 10 + j * (ow + 14);
                return (
                  <g key={j}>
                    <rect x={ox} y={y + 32} width={ow} height={h - 46} rx={3} fill={C.cocoa} stroke={C.focus} strokeWidth={1.2} />
                    <T x={ox + ow / 2} y={y + 32 + (h - 46) / 2 + 4} s={11} f={C.crema} a="middle">
                      {o}
                    </T>
                    {j < ops.length - 1 && <line x1={ox + ow} y1={y + 32 + (h - 46) / 2} x2={ox + ow + 14} y2={y + 32 + (h - 46) / 2} stroke={C.focus} strokeWidth={1.6} />}
                  </g>
                );
              })}
            </g>
            {i < stages.length - 1 && <rect x={x + w + 9} y={y - 8} width={12} height={(h + 16) * kx(i)} rx={2} fill={C.second} />}
          </g>
        );
      })}
    </g>
  );
}

// 1 · Hook. Three operation chips in a chain; three dashed stage outlines hover over them, then a "?" over the count.
export function Hook({ t }: StepCtx) {
  const ops = ['filter', 'select', 'filter'];
  return (
    <Svg label="three chained operations: one stage, or three? What decides?" h={200}>
      {ops.map((o, i) => (
        <g key={i}>
          <Cell x={60 + i * 170} y={70} w={120} h={32} label={o} o={easeOut(seg(t, 0.2 + i * 0.4, 0.5 + i * 0.4))} />
          {i < 2 && <line x1={182 + i * 170} y1={86} x2={lerp(182 + i * 170, 228 + i * 170, easeOut(seg(t, 0.5 + i * 0.4, 0.8 + i * 0.4)))} y2={86} stroke={C.focus} strokeWidth={1.6} />}
          <rect
            x={50 + i * 170}
            y={50}
            width={140}
            height={72}
            rx={5}
            fill="none"
            stroke={C.second}
            strokeDasharray="5 4"
            opacity={easeOut(seg(t, 2.0 + i * 0.2, 2.3 + i * 0.2)) * (0.5 + 0.5 * Math.sin(t * 3))}
          />
        </g>
      ))}
      <T x={300} y={170} s={13} f={C.second} a="middle" o={easeOut(seg(t, 3.0, 3.4))}>
        one stage, or three?
      </T>
    </Svg>
  );
}

// 2 · Narrow, measured. The three chips pipeline inside one stage box; no Exchange bar appears anywhere.
export function RevealNarrowOneStage({ t }: StepCtx) {
  return (
    <Svg label="measured: filter, select, filter — three operations, one stage, no shuffle at all." h={200}>
      <Dag stages={[['filter', 'select', 'filter']]} k={() => easeOut(seg(t, 0.3, 0.8))} kx={() => 0} />
      <Row y={160} label="stages · Exchange" value={t > 1.6 ? '1 · none' : '…'} valueColor={C.focus} k={easeOut(seg(t, 1.4, 1.8))} />
    </Svg>
  );
}

// 3 · Predict. A groupBy chip joins the chain, with a dashed question mark where a boundary might go.
export function PredictGroupBy({ t, answer }: StepCtx) {
  return (
    <Svg label="now group the same data by a derived key instead. Still one stage, or does something change?" h={200}>
      <Cell x={25} y={30} w={160} h={32} label="4 partitions" o={easeOut(seg(t, 0.1, 0.4))} />
      <line x1={187} y1={46} x2={lerp(187, 345, easeOut(seg(t, 0.6, 1.2)))} y2={46} stroke={C.focus} strokeWidth={1.6} />
      <Cell x={350} y={30} w={200} h={32} label="groupBy(id % 10)" stroke={C.second} o={easeOut(seg(t, 0.8, 1.2))} />
      <rect x={258} y={20} width={10} height={52} rx={2} fill="none" stroke={C.second} strokeDasharray="4 3" opacity={easeOut(seg(t, 1.6, 2.0))} />
      <AnswerRow y={130} label="the stage count" answer={answer} value="more than one" k={easeOut(seg(t, 2.2, 2.7))} />
      <Verdict answer={answer} y={178} text="a group waits on every partition" />
    </Svg>
  );
}

// 4 · Wide, measured (and the setup for the second predict). Two stage boxes with a real Exchange bar between: 2 stages, 10 buckets.
// On the second predict, once answered, the verdict names the third stage.
export function RevealWideTwoStages({ t, answer }: StepCtx) {
  return (
    <Svg label="measured: the groupBy, alone, doubles the stage count and adds a real shuffle Exchange." h={200}>
      <Dag stages={[['scan'], ['groupBy']]} k={(i) => easeOut(seg(t, 0.2 + i * 1.2, 0.6 + i * 1.2))} kx={() => easeOut(seg(t, 0.9, 1.4))} />
      <T x={300} y={140} s={11} f={C.second} a="middle" o={answer !== null ? 0 : easeOut(seg(t, 1.2, 1.6))}>
        Exchange
      </T>
      <Row y={180} label="stages · buckets" value={t > 2.0 ? '2 · 10' : '…'} valueColor={C.focus} k={easeOut(seg(t, 1.8, 2.2))} />
      {answer !== null && <AnswerRow y={130} label="group it again" answer={answer} value="three stages" k={1} />}
    </Svg>
  );
}

// 5 · Why the shuffle cuts. Four input partitions on the left; every one sends a line to every output bucket on the right.
export function RevealWhyShuffleCuts({ t }: StepCtx) {
  const a = easeInOut(seg(t, 1.0, 2.4));
  return (
    <Svg label="why: any row could land in any bucket, so every output needs every input partition first." h={200}>
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <Cell x={25} y={14 + i * 40} w={110} h={28} label={`partition ${i + 1}`} o={easeOut(seg(t, 0.1 + i * 0.1, 0.4 + i * 0.1))} />
          {[0, 1, 2].map((j) => (
            <line key={j} x1={137} y1={28 + i * 40} x2={lerp(137, 438, a)} y2={lerp(28 + i * 40, 42 + j * 50, a)} stroke={C.second} strokeWidth={1.1} opacity={0.8} />
          ))}
        </g>
      ))}
      {[0, 1, 2].map((j) => (
        <Cell key={j} x={440} y={28 + j * 50} w={110} h={28} label="a bucket" stroke={C.focus} o={easeOut(seg(t, 0.6, 1.0))} />
      ))}
      <T x={300} y={196} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 2.8, 3.2))}>
        a filter waits for nothing; a group waits for all
      </T>
    </Svg>
  );
}

// 6 · The second shuffle, measured. A third stage box and a second Exchange bar extend the strip: 3 stages, 3 buckets.
export function RevealSecondShuffle({ t }: StepCtx) {
  return (
    <Svg label="measured: a second, independent groupBy on the already-grouped result adds a THIRD stage." h={200}>
      <Dag stages={[['scan'], ['groupBy'], ['groupBy']]} k={(i) => (i < 2 ? 1 : easeOut(seg(t, 1.2, 1.7)))} kx={(i) => (i === 0 ? 1 : easeOut(seg(t, 0.6, 1.2)))} />
      <Row y={180} label="stages · buckets" value={t > 2.0 ? '3 · 3' : '…'} valueColor={C.focus} k={easeOut(seg(t, 1.8, 2.2))} />
    </Svg>
  );
}

// 7 · Recap. A narrow chain pipelined in one box; every wide operator a bar.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="narrow dependencies pipeline inside a stage; a wide dependency cuts a new one, every time." h={250}>
      <Dag stages={[['filter', 'map'], ['groupBy'], ['join']]} k={(i) => easeOut(seg(t, 0.2 + i * 0.5, 0.6 + i * 0.5))} kx={(i) => easeOut(seg(t, 0.6 + i * 0.5, 1.0 + i * 0.5))} />
      <Row y={170} label="narrow" value="pipelined, free" k={easeOut(seg(t, 2.0, 2.4))} />
      <Row y={220} label="wide" value="the shuffle: a new stage" valueColor={C.second} k={easeOut(seg(t, 2.8, 3.2))} />
    </Svg>
  );
}
