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

// 0 · Hook. Four stages in a row with records flowing between them. The last one slows, turning cherry; the gaps
// behind it fill and stop, one by one, back to the source. A throughput bar collapses. The log panel stays empty.
export function Hook({ t }: StepCtx) {
  const slow = easeOut(seg(t, 0.8, 1.1));
  const stopAt = (gap: number) => 1.4 + (2 - gap) * 0.6;
  const thr = 1 - easeInOut(seg(t, 1.4, 3.2)) * 0.85;
  return (
    <Svg label="throughput collapses, nothing in the logs says why, and credits explain it" h={200}>
      {[0, 1, 2, 3].map((i) => (
        <Cell
          key={i}
          x={25 + i * 140}
          y={30}
          w={100}
          label={i === 3 ? 'slow step' : `step`}
          o={easeOut(seg(t, 0, 0.3))}
          stroke={i === 3 && slow > 0 ? C.cherryText : C.mocha}
          f={i === 3 && slow > 0 ? C.cherryText : C.crema}
        />
      ))}
      {[0, 1, 2].map((g) => {
        const moving = t < stopAt(g);
        return [0, 1].map((j) => {
          const ph = moving ? (t * 0.9 + j * 0.5) % 1 : 0.15 + j * 0.45;
          return <Pip key={`${g}${j}`} x={130 + g * 140 + ph * 30} y={44} f={moving ? C.second : C.cherryText} />;
        });
      })}
      <T x={25} y={98} s={11} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        throughput
      </T>
      <rect x={110} y={88} width={300 * thr} height={14} rx={3} fill={thr < 0.5 ? C.cherryText : C.focus} opacity={0.6} />
      <rect x={25} y={124} width={530} height={44} rx={6} fill="none" stroke={C.mocha} strokeWidth={1.3} opacity={easeOut(seg(t, 2.2, 2.5))} />
      <T x={37} y={150} s={11} f={C.latte} o={easeOut(seg(t, 2.4, 2.7))}>
        logs: nothing. alerts: nothing.
      </T>
      <T x={25} y={194} s={12} f={C.crema} o={easeOut(seg(t, 3.6, 4.0))}>
        one slow step, and everything collapses
      </T>
    </Svg>
  );
}

// 1 · Setup. One step, ticked: its logic already right. Then underneath it, the machine: a planner box and a row of
// worker boxes, drawn in one by one.
export function Setup({ t }: StepCtx) {
  const m = easeOut(seg(t, 1.6, 2.0));
  return (
    <Svg label="correctness inside a step is one thing; the machine that runs it is another" h={200}>
      <Cell x={200} y={16} w={180} label="one step, correct" o={easeOut(seg(t, 0, 0.3))} />
      <MiniTick x={390} y={30} k={easeOut(seg(t, 0.4, 0.8))} />
      <line x1={25} y1={64} x2={555} y2={64} stroke={C.mocha} strokeWidth={1} strokeDasharray="4 3" opacity={easeOut(seg(t, 1.2, 1.5))} />
      <T x={25} y={84} s={11} f={C.latte} o={easeOut(seg(t, 1.2, 1.5))}>
        what actually runs it?
      </T>
      <Cell x={200} y={96} w={180} label="planner" o={m} stroke={C.focus} />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <line x1={290} y1={124} x2={85 + i * 136} y2={150} stroke={C.latte} strokeWidth={1.2} opacity={easeOut(seg(t, 2.4 + i * 0.3, 2.7 + i * 0.3))} />
          <Cell x={25 + i * 136} y={150} w={120} label="worker" o={easeOut(seg(t, 2.4 + i * 0.3, 2.7 + i * 0.3))} />
        </g>
      ))}
    </Svg>
  );
}

/** Four TaskManager boxes of three slots each; `filled` counts slots taken, left to right. */
function SlotGrid({ y, filled, o = 1 }: { y: number; filled: number; o?: number }) {
  return (
    <g opacity={o}>
      {[0, 1, 2, 3].map((tm) => (
        <g key={tm}>
          <rect x={25 + tm * 136} y={y} width={124} height={44} rx={6} fill="none" stroke={C.latte} strokeWidth={1.4} />
          {[0, 1, 2].map((s) => {
            const n = tm * 3 + s;
            return <rect key={s} x={35 + tm * 136 + s * 37} y={y + 10} width={30} height={24} rx={3} fill={n < filled ? C.second : C.cocoa} stroke={C.mocha} strokeWidth={1.2} />;
          })}
        </g>
      ))}
    </g>
  );
}

// 2 · Predict. Four workers of three slots; a request for more than 12 waits at the edge. On answer: refused, a cross.
export function PredictSlots({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  return (
    <Svg label="ask for more parallelism than there are slots — what happens?" h={200}>
      <SlotGrid y={20} filled={Math.floor(easeInOut(seg(t, 0.2, 1.2)) * 12)} />
      <T x={25} y={90} s={11} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        4 workers, 3 slots each: 12
      </T>
      <Cell x={330} y={100} w={180} label="a request for more" o={easeOut(seg(t, 1.2, 1.5))} stroke={C.cherryText} />
      <Cross x={528} y={114} k={v} />
      <AnswerRow y={176} label="more than 12" answer={answer} value="refused outright" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 3 · Slots. The planner sends tasks down to the workers' slots, filling all 12. One more task arrives with nowhere to
// go and is crossed out: the sum of every worker's room is the ceiling.
export function RevealSlots({ t }: StepCtx) {
  const fill = Math.floor(easeInOut(seg(t, 0.6, 2.6)) * 12);
  const extra = easeInOut(seg(t, 2.8, 3.4));
  return (
    <Svg label="a coordinator, a set of workers, and a hard ceiling on parallelism" h={200}>
      <Cell x={200} y={14} w={180} label="planner: tracks it all" stroke={C.focus} o={easeOut(seg(t, 0, 0.3))} />
      <SlotGrid y={70} filled={fill} />
      {extra > 0 && <Pip x={lerp(290, 500, extra)} y={lerp(48, 140, extra)} f={C.cherryText} s={12} />}
      <Cross x={520} y={150} k={easeOut(seg(t, 3.4, 3.7))} />
      <T x={25} y={150} s={11} f={C.latte} o={easeOut(seg(t, 2.6, 2.9))}>
        all 12 slots taken
      </T>
      <T x={25} y={190} s={12} f={C.crema} o={easeOut(seg(t, 3.7, 4.1))}>
        every worker's room, added up: the ceiling
      </T>
    </Svg>
  );
}

// 4 · Chaining. Top: three operators fused in one box; a record passes straight through. Bottom: the same three apart,
// and the record stops at every hop to be handed off, the hops lit in cherry. Then the run's costs.
export function RevealChaining({ t }: StepCtx) {
  const a = (t * 0.6) % 1;
  const hop = (u: number) => {
    const seg3 = Math.floor(u * 3);
    const local = u * 3 - seg3;
    return seg3 + Math.min(1, local * 1.6);
  };
  const b = hop(((t - 0.6) * 0.3 + 1) % 1);
  return (
    <Svg label="fused operators skip the hop entirely; separate ones pay for it, every record" h={200}>
      <T x={25} y={24} s={11} f={C.focus} o={easeOut(seg(t, 0, 0.3))}>
        fused into one piece
      </T>
      <rect x={25} y={32} width={420} height={36} rx={6} fill="none" stroke={C.focus} strokeWidth={1.6} opacity={easeOut(seg(t, 0, 0.3))} />
      {['map', 'filter', 'map'].map((n, i) => (
        <T key={i} x={95 + i * 140} y={55} s={12} f={C.crema} a="middle" o={easeOut(seg(t, 0.1, 0.4))}>
          {n}
        </T>
      ))}
      <Pip x={40 + a * 390} y={38} f={C.second} s={8} />
      <T x={25} y={100} s={11} f={C.latte} o={easeOut(seg(t, 0.6, 0.9))}>
        kept apart
      </T>
      {['map', 'filter', 'map'].map((n, i) => (
        <Cell key={i} x={25 + i * 150} y={108} w={110} label={n} o={easeOut(seg(t, 0.6, 0.9))} />
      ))}
      {[0, 1].map((h) => (
        <rect key={h} x={140 + h * 150} y={118} width={30} height={8} rx={2} fill={C.cherryText} opacity={0.5 * easeOut(seg(t, 0.9, 1.2))} />
      ))}
      {t > 0.6 && <Pip x={80 + b * 100} y={148} f={C.second} />}
      <T x={25} y={180} s={11} f={C.focus} o={easeOut(seg(t, 2.6, 2.9))}>
        fused: 1000 units for 1000 records
      </T>
      <T x={25} y={198} s={11} f={C.cherryText} o={easeOut(seg(t, 3.3, 3.6))}>
        apart: 6.5 to 7.5 times as much
      </T>
    </Svg>
  );
}

// 5 · Backpressure. Four stages joined by three channels, each holding five credits as pips. The last stage grants
// nothing back. Its channel's credits drain to zero first, then the channel before it, then the first: the stall walks
// backward, and no message is ever sent.
export function RevealBackpressure({ t }: StepCtx) {
  const left = (ch: number) => {
    const start = 0.6 + (2 - ch) * 1.1;
    return Math.round(5 * (1 - easeInOut(seg(t, start, start + 0.9))));
  };
  return (
    <Svg label="a receiver grants credits; run out, and the slowdown ripples backward" h={200}>
      {[0, 1, 2, 3].map((i) => (
        <Cell key={i} x={25 + i * 140} y={30} w={100} label={i === 3 ? 'slow' : 'stage'} o={easeOut(seg(t, 0, 0.3))} stroke={i === 3 ? C.cherryText : C.mocha} />
      ))}
      {[0, 1, 2].map((ch) => {
        const n = left(ch);
        return (
          <g key={ch}>
            {Array.from({ length: 5 }, (_, j) => (
              <rect
                key={j}
                x={128 + ch * 140 + (j % 3) * 12}
                y={72 + Math.floor(j / 3) * 12}
                width={9}
                height={9}
                rx={2}
                fill={j < n ? C.focus : 'none'}
                stroke={j < n ? C.focus : C.mocha}
                strokeWidth={1}
              />
            ))}
            {n === 0 && (
              <T x={145 + ch * 140} y={118} s={11} f={C.cherryText} a="middle">
                stalled
              </T>
            )}
          </g>
        );
      })}
      <T x={25} y={150} s={11} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        5 credits per channel; the slow one grants 0 back
      </T>
      <T x={25} y={190} s={12} f={C.crema} o={easeOut(seg(t, 3.9, 4.3))}>
        no message sent; it just spreads backward
      </T>
    </Svg>
  );
}

// 6 · Predict. "per-job mode" sits crossed out. On answer the slot beside it fills: application mode.
export function PredictPerJobMode({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  return (
    <Svg label="per-job mode is gone — what runs a job's own code now?" h={200}>
      <Cell x={25} y={40} w={200} label="per-job mode" o={easeOut(seg(t, 0, 0.3))} stroke={C.cherryText} f={C.cherryText} />
      <Cross x={240} y={54} k={easeOut(seg(t, 0.5, 0.8))} />
      <T x={25} y={96} s={11} f={C.cherryText} o={easeOut(seg(t, 0.8, 1.1))}>
        removed for good
      </T>
      {v > 0 ? <Cell x={300} y={40} w={250} label="application mode" o={v} stroke={C.focus} f={C.focus} /> : <Hole x={300} y={40} w={250} o={easeOut(seg(t, 1.0, 1.3))} />}
      <AnswerRow y={170} label="runs a job now" answer={answer} value="application mode" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 7 · Application mode. Three jobs, each dropped into its own cluster box, its code running inside on the cluster.
// The old side setup, crossed out, stays at the bottom.
export function RevealApplicationMode({ t }: StepCtx) {
  return (
    <Svg label="one job's own code, run on the cluster itself, not shared with others" h={200}>
      {['job A', 'job B', 'job C'].map((n, i) => {
        const k = easeOut(seg(t, 0.3 + i * 0.6, 0.7 + i * 0.6));
        const d = easeInOut(seg(t, 0.6 + i * 0.6, 1.2 + i * 0.6));
        return (
          <g key={n}>
            <rect x={25 + i * 180} y={20} width={165} height={90} rx={8} fill="none" stroke={C.latte} strokeWidth={1.5} opacity={k} />
            <T x={37 + i * 180} y={38} s={11} f={C.latte} o={k}>
              its own cluster
            </T>
            <Cell x={45 + i * 180} y={lerp(74, 62, d)} w={125} label={`${n}'s code`} o={d} stroke={C.focus} />
          </g>
        );
      })}
      <T x={25} y={136} s={11} f={C.focus} o={easeOut(seg(t, 2.4, 2.7))}>
        one cluster, one job, nothing shared
      </T>
      <Cell x={25} y={156} w={220} label="per-job mode" o={easeOut(seg(t, 3.0, 3.3))} stroke={C.cherryText} f={C.cherryText} />
      <Cross x={262} y={170} k={easeOut(seg(t, 3.3, 3.6))} />
      <T x={285} y={175} s={11} f={C.cherryText} o={easeOut(seg(t, 3.5, 3.8))}>
        gone outright
      </T>
    </Svg>
  );
}

// 8 · Adaptive batch. One runtime box holds two lanes: a stream with no end, its arrow running off the frame, and a
// batch with a start and an end. For the batch, 200 bytes upstream gets 2 tasks; 6400 bytes gets 64, its cap.
export function RevealAdaptiveBatch({ t }: StepCtx) {
  const sm = easeOut(seg(t, 1.8, 2.2));
  const lg = Math.floor(easeInOut(seg(t, 2.8, 3.8)) * 64);
  return (
    <Svg label="the same runtime runs both kinds of job; one of them sizes itself" h={200}>
      <T x={25} y={22} s={11} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        one engine
      </T>
      <T x={25} y={46} s={11} f={C.crema} o={easeOut(seg(t, 0.2, 0.5))}>
        never ends
      </T>
      <line x1={110} y1={42} x2={110 + 440 * easeInOut(seg(t, 0.3, 1.0))} y2={42} stroke={C.second} strokeWidth={2} strokeDasharray="6 4" />
      <T x={25} y={76} s={11} f={C.crema} o={easeOut(seg(t, 0.9, 1.2))}>
        start, end
      </T>
      <line x1={110} y1={72} x2={110 + 240 * easeInOut(seg(t, 1.0, 1.5))} y2={72} stroke={C.focus} strokeWidth={2} />
      <line x1={110} y1={64} x2={110} y2={80} stroke={C.focus} strokeWidth={2} opacity={easeOut(seg(t, 1.0, 1.2))} />
      <line x1={350} y1={64} x2={350} y2={80} stroke={C.focus} strokeWidth={2} opacity={easeOut(seg(t, 1.4, 1.6))} />
      <T x={25} y={116} s={11} f={C.latte} o={sm}>
        200 bytes: 2 tasks
      </T>
      {[0, 1].map((i) => (
        <Pip key={i} x={200 + i * 16} y={112} f={C.focus} o={sm} />
      ))}
      <T x={25} y={150} s={11} f={C.latte} o={easeOut(seg(t, 2.6, 2.9))}>
        6400 bytes: 64 tasks
      </T>
      {Array.from({ length: lg }, (_, i) => (
        <Pip key={i} x={200 + (i % 22) * 16} y={146 + Math.floor(i / 22) * 16} f={C.focus} s={9} />
      ))}
      <T x={25} y={196} s={11} f={C.focus} o={easeOut(seg(t, 3.9, 4.2))}>
        sized from the data that showed up
      </T>
    </Svg>
  );
}

// 9 · Prove it. The run's results, one by one.
export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="this topic's own real run, every number read straight off it" h={260}>
      <Row y={30} label="4 workers, 3 slots" value="ceiling 12" valueColor={C.focus} k={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={70} label="fused, 1000 records" value="1000 units" k={easeOut(seg(t, 0.7, 1.1))} />
      <Row y={110} label="kept apart" value="6.5 to 7.5 times" valueColor={C.cherryText} k={easeOut(seg(t, 1.2, 1.6))} />
      <Row y={150} label="credits, 4 stages" value="starve back to front" k={easeOut(seg(t, 1.8, 2.2))} />
      <Row y={190} label="200 bytes upstream" value="parallelism 2" k={easeOut(seg(t, 2.4, 2.8))} />
      <Row y={230} label="6400 bytes upstream" value="parallelism 64" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.4))} />
    </Svg>
  );
}

// 10 · Recap. Three lines, one by one; the ceiling line outlined.
export function Recap({ t }: StepCtx) {
  const rows = ['a planner, fixed workers, a hard ceiling', 'fuse neighbours, and the hop cost vanishes', 'silent backpressure, one job shape, one engine'];
  return (
    <Svg label="a coordinator, a ceiling, a fused hop, a silent slowdown, one runtime" h={260}>
      {rows.map((r, i) => {
        const k = easeOut(seg(t, 0.3 + i * 1.1, 0.8 + i * 1.1));
        return <Cell key={i} x={25} y={lerp(30, 40, k) + i * 60} w={530} label={r} o={k} stroke={i === 0 ? C.focus : C.mocha} />;
      })}
    </Svg>
  );
}
