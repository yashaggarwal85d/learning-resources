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

/** A pip travelling from (x1, y1) to (x2, y2) while 0 < p < 1. */
function Pip({ x1, y1, x2, y2, p, f = C.latte }: { x1: number; y1: number; x2: number; y2: number; p: number; f?: string }) {
  if (p <= 0 || p >= 1) return null;
  return <rect x={lerp(x1, x2, p) - 6} y={lerp(y1, y2, p) - 6} width={12} height={12} rx={2} fill={f} />;
}

/** A lane outline with its letter at the left. */
function Lane({ y, name, o, x = 70, w = 300 }: { y: number; name: string; o: number; x?: number; w?: number }) {
  return (
    <g opacity={o}>
      <T x={25} y={y + 19} s={12} f={C.crema}>
        {name}
      </T>
      <rect x={x} y={y} width={w} height={28} rx={4} fill="none" stroke={C.mocha} strokeWidth={1.3} />
    </g>
  );
}

// 0 · Hook. A scale-out opens lane C; the order's creation sits in lane A, its cancellation lands in lane C. The
// consumer reads C first and sees the cancellation before the creation, in cherry.
export function Hook({ t }: StepCtx) {
  const pc = seg(t, 1.8, 2.3);
  const pa = seg(t, 2.6, 3.1);
  return (
    <Svg label="an event seen out of order, for any key touched by a scale-out that already happened" h={200}>
      <Lane y={40} name="A" o={easeOut(seg(t, 0, 0.3))} />
      <Lane y={80} name="B" o={easeOut(seg(t, 0.1, 0.4))} />
      <Lane y={120} name="C" o={easeOut(seg(t, 0.9, 1.2))} />
      <T x={70} y={172} s={11} f={C.second} o={easeOut(seg(t, 0.9, 1.2))}>
        C: opened by a scale-out
      </T>
      <Cell x={80} y={41} w={110} h={26} label="created" o={easeOut(seg(t, 0.3, 0.6))} />
      <Cell x={80} y={121} w={110} h={26} label="cancelled" o={easeOut(seg(t, 1.3, 1.6))} />
      <rect x={420} y={40} width={130} height={110} rx={6} fill="none" stroke={C.mocha} strokeWidth={1.3} opacity={easeOut(seg(t, 0.2, 0.5))} />
      <T x={420} y={32} s={11} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        consumer sees
      </T>
      <Pip x1={378} y1={134} x2={414} y2={70} p={pc} f={C.cherryText} />
      <Pip x1={378} y1={54} x2={414} y2={110} p={pa} />
      <Cell x={430} y={52} w={110} label="cancelled" o={easeOut(seg(t, 2.3, 2.5))} stroke={C.cherryText} f={C.cherryText} />
      <Cell x={430} y={100} w={110} label="created" o={easeOut(seg(t, 3.1, 3.3))} />
      <T x={300} y={195} s={11} f={C.cherryText} a="middle" o={easeOut(seg(t, 3.6, 4.0))}>
        nothing broken in the consumer
      </T>
    </Svg>
  );
}

// 1 · Setup. Four lanes, each with records sliding along at its own pace; a sync line tries to draw across them and is
// struck.
export function Setup({ t }: StepCtx) {
  const speeds = [1, 0.7, 1.3, 0.85];
  return (
    <Svg label="several partition lanes side by side, with no synchronizing line between them" h={200}>
      {['A', 'B', 'C', 'D'].map((n, i) => (
        <g key={n}>
          <Lane y={24 + i * 38} name={n} o={easeOut(seg(t, i * 0.1, 0.3 + i * 0.1))} w={480} />
          {[0, 1, 2].map((j) => {
            const p = clamp(((t - 0.5) * 0.25 * speeds[i] + j * 0.3) % 1, 0, 1);
            return t > 0.5 ? <rect key={j} x={lerp(76, 530, p)} y={31 + i * 38} width={14} height={14} rx={2} fill={C.latte} /> : null;
          })}
        </g>
      ))}
      <line x1={330} y1={18} x2={330} y2={lerp(18, 172, easeOut(seg(t, 2.0, 2.6)))} stroke={C.second} strokeWidth={1.5} strokeDasharray="4 3" />
      <Cross x={345} y={185} k={easeOut(seg(t, 2.8, 3.1))} />
      <T x={365} y={190} s={11} f={C.latte} o={easeOut(seg(t, 3.0, 3.4))}>
        no line between lanes
      </T>
    </Svg>
  );
}

// 2 · Predict. Key one in lane A, key two in lane B; a dashed question link between them. On answer it is struck.
export function PredictCrossPartition({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  return (
    <Svg label="two records, two different keys, two different partitions — any guaranteed order between them?" h={200}>
      <Lane y={40} name="A" o={easeOut(seg(t, 0, 0.3))} />
      <Lane y={100} name="B" o={easeOut(seg(t, 0.1, 0.4))} />
      <Cell x={80} y={41} w={120} h={26} label="key one" o={easeOut(seg(t, 0.3, 0.6))} />
      <Cell x={240} y={101} w={120} h={26} label="key two" o={easeOut(seg(t, 0.5, 0.8))} />
      <line x1={200} y1={60} x2={240} y2={108} stroke={v > 0 ? C.cherryText : C.second} strokeWidth={1.5} strokeDasharray="4 3" opacity={easeOut(seg(t, 0.8, 1.1))} />
      <Cross x={220} y={84} k={v} />
      <AnswerRow y={178} label="order between them?" answer={answer} value="none at all" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 3 · Scope. Lane A's records tick in order one after another; lane B's too; the links between the two lanes are
// struck: the promise stops at the lane wall.
export function RevealScope({ t }: StepCtx) {
  return (
    <Svg label="one partition, totally ordered; a second partition, totally ordered — and nothing linking the two" h={200}>
      {[0, 1].map((l) => (
        <g key={l}>
          <Lane y={40 + l * 70} name={l === 0 ? 'A' : 'B'} o={easeOut(seg(t, l * 0.2, 0.3 + l * 0.2))} w={480} />
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <rect x={90 + i * 90} y={47 + l * 70} width={14} height={14} rx={2} fill={l === 0 ? C.focus : C.second} opacity={easeOut(seg(t, 0.4 + l * 1.2 + i * 0.15, 0.6 + l * 1.2 + i * 0.15))} />
              {i < 4 && (
                <line
                  x1={108 + i * 90}
                  y1={54 + l * 70}
                  x2={lerp(108 + i * 90, 176 + i * 90, easeOut(seg(t, 0.6 + l * 1.2 + i * 0.15, 0.8 + l * 1.2 + i * 0.15)))}
                  y2={54 + l * 70}
                  stroke={l === 0 ? C.focus : C.second}
                  strokeWidth={1.5}
                />
              )}
            </g>
          ))}
        </g>
      ))}
      {[0, 1].map((i) => (
        <g key={i}>
          <line x1={140 + i * 180} y1={72} x2={140 + i * 180} y2={106} stroke={C.mocha} strokeWidth={1.2} strokeDasharray="3 3" opacity={easeOut(seg(t, 2.9, 3.2))} />
          <Cross x={140 + i * 180} y={89} k={easeOut(seg(t, 3.3 + i * 0.15, 3.6 + i * 0.15))} />
        </g>
      ))}
      <T x={25} y={175} s={12} f={C.crema} o={easeOut(seg(t, 3.7, 4.1))}>
        the lane draws the boundary, not the topic
      </T>
    </Svg>
  );
}

// 4 · Predict. b1 leaves first and fails; b2 leaves second and lands. On answer b1's retry lands behind b2 in the
// broker's log.
export function PredictRetry({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  return (
    <Svg label="a failed batch retried, racing a later batch that succeeded immediately — which lands first?" h={200}>
      <Cell x={25} y={40} w={70} label="b1" o={easeOut(seg(t, 0, 0.3))} />
      <Cell x={25} y={90} w={70} label="b2" o={easeOut(seg(t, 0.1, 0.4))} />
      <Req x1={105} x2={lerp(105, 330, 0.5)} y={54} k={easeOut(seg(t, 0.3, 0.6))} />
      <Cross x={230} y={54} k={easeOut(seg(t, 0.6, 0.9))} />
      <T x={250} y={44} s={11} f={C.cherryText} o={easeOut(seg(t, 0.7, 1.0))}>
        fails, retried
      </T>
      <Req x1={105} x2={330} y={104} k={easeOut(seg(t, 0.5, 0.9))} />
      <rect x={340} y={70} width={210} height={40} rx={5} fill="none" stroke={C.mocha} strokeWidth={1.3} opacity={easeOut(seg(t, 0.2, 0.5))} />
      <T x={340} y={130} s={11} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        broker log
      </T>
      <Cell x={350} y={76} w={90} label="b2" o={easeOut(seg(t, 0.9, 1.2))} />
      <Cell x={450} y={76} w={90} label="b1" o={v} stroke={C.cherryText} />
      <AnswerRow y={182} label="b2 lands first?" answer={answer} value="yes, unless idempotent" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 5 · Idempotence, measured. Sent b1, b2. Without idempotence the log reads b2, b1, the resend out of turn in cherry.
// With it, the broker pins the resend back: b1, b2.
export function RevealIdempotence({ t }: StepCtx) {
  const rows: [string, string[], number, boolean][] = [
    ['without idempotence', ['b2', 'b1'], 0.4, false],
    ['with idempotence', ['b1', 'b2'], 2.3, true],
  ];
  return (
    <Svg label="the same two batches, delivered order measured with and without idempotence" h={200}>
      <T x={25} y={26} s={11} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        sent: b1, then b2
      </T>
      {rows.map(([name, order, k0, ok], r) => {
        const y = 50 + r * 70;
        return (
          <g key={name}>
            <T x={25} y={y + 19} s={12} f={C.crema} o={easeOut(seg(t, k0, k0 + 0.3))}>
              {name}
            </T>
            {order.map((b, i) => {
              const k = easeOut(seg(t, k0 + 0.4 + i * 0.5, k0 + 0.8 + i * 0.5));
              const bad = !ok && b === 'b1';
              return <Cell key={b} x={lerp(240, 270, k) + i * 100} y={y} w={90} label={b} o={k} stroke={bad ? C.cherryText : ok ? C.focus : C.mocha} f={bad ? C.cherryText : C.crema} />;
            })}
            {ok ? <MiniTick x={490} y={y + 10} k={easeOut(seg(t, k0 + 1.6, k0 + 1.9))} /> : <Cross x={500} y={y + 14} k={easeOut(seg(t, k0 + 1.4, k0 + 1.7))} />}
          </g>
        );
      })}
    </Svg>
  );
}

// 6 · Five in flight. Five request slots between producer and broker fill one by one; a sixth dashed slot is struck:
// past five, the guarantee isn't tracked.
export function RevealFiveLimit({ t }: StepCtx) {
  return (
    <Svg label="the documented ceiling on in-flight requests for the ordering guarantee to hold" h={200}>
      <Cell x={25} y={60} w={100} label="producer" o={easeOut(seg(t, 0, 0.3))} />
      <Cell x={450} y={60} w={100} label="broker" o={easeOut(seg(t, 0.1, 0.4))} />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <rect x={145 + i * 50} y={62} width={40} height={24} rx={4} fill="none" stroke={C.focus} strokeWidth={1.3} opacity={easeOut(seg(t, 0.3, 0.6))} />
          <rect x={158 + i * 50} y={67} width={14} height={14} rx={2} fill={C.focus} opacity={easeOut(seg(t, 0.7 + i * 0.3, 0.9 + i * 0.3))} />
        </g>
      ))}
      <rect x={145} y={110} width={40} height={24} rx={4} fill="none" stroke={C.cherryText} strokeWidth={1.3} strokeDasharray="4 3" opacity={easeOut(seg(t, 2.4, 2.7))} />
      <Cross x={165} y={122} k={easeOut(seg(t, 2.8, 3.1))} />
      <T x={200} y={127} s={11} f={C.cherryText} o={easeOut(seg(t, 2.9, 3.2))}>
        a sixth: beyond what's tracked
      </T>
      <T x={145} y={44} s={11} f={C.focus} o={easeOut(seg(t, 2.2, 2.5))}>
        up to five in flight
      </T>
      <T x={25} y={180} s={12} f={C.crema} o={easeOut(seg(t, 3.5, 3.9))}>
        order holds up to five outstanding requests
      </T>
    </Svg>
  );
}

// 7 · Repartition. Two lanes grow to three; key X's arrow swings to the new lane while its history stays behind,
// dashed; key Y's arrow stays put with a tick.
export function RevealRepartition({ t }: StepCtx) {
  const grow = easeOut(seg(t, 1.0, 1.4));
  const swing = easeInOut(seg(t, 1.8, 2.6));
  return (
    <Svg label="the same two keys, one moved and one unmoved, measured across a real partition-count change" h={200}>
      <Cell x={25} y={40} w={90} label="key X" o={easeOut(seg(t, 0, 0.3))} stroke={C.second} />
      <Cell x={25} y={120} w={90} label="key Y" o={easeOut(seg(t, 0.1, 0.4))} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={260} y={30 + i * 50} width={290} height={28} rx={4} fill="none" stroke={i === 2 ? C.focus : C.mocha} strokeWidth={1.3} opacity={i === 2 ? grow : easeOut(seg(t, 0.2, 0.5))} />
      ))}
      <T x={555} y={150} s={11} f={C.focus} a="end" o={grow}>
        new
      </T>
      {[0, 1].map((i) => (
        <rect key={i} x={270 + i * 22} y={37} width={14} height={14} rx={2} fill="none" stroke={C.second} strokeWidth={1.5} strokeDasharray="3 2" opacity={easeOut(seg(t, 0.4, 0.7))} />
      ))}
      <line x1={115} y1={54} x2={255} y2={lerp(44, 144, swing)} stroke={C.second} strokeWidth={1.5} opacity={easeOut(seg(t, 0.4, 0.7))} />
      <line x1={115} y1={134} x2={255} y2={94} stroke={C.latte} strokeWidth={1.5} opacity={easeOut(seg(t, 0.5, 0.8))} />
      <MiniTick x={130} y={106} k={easeOut(seg(t, 2.8, 3.1))} />
      <T x={330} y={50} s={11} f={C.second} o={easeOut(seg(t, 2.8, 3.2))}>
        its history stays here
      </T>
      <T x={25} y={190} s={11} f={C.latte} o={easeOut(seg(t, 3.4, 3.8))}>
        X moved, Y stayed: nothing carries X's history over
      </T>
    </Svg>
  );
}

// 8 · Prove it. The run's results, one by one.
export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="this topic's own real run, every number read straight off it" h={260}>
      <Row y={50} label="without idempotence" value="reorders" valueColor={C.cherryText} k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={95} label="with idempotence" value="preserved" valueColor={C.focus} k={easeOut(seg(t, 1.0, 1.5))} />
      <Row y={140} label="repartition" value="one key moved" k={easeOut(seg(t, 1.8, 2.3))} />
      <Row y={185} label="repartition" value="one key stayed" k={easeOut(seg(t, 2.6, 3.1))} />
      <Tick y={222} k={easeOut(seg(t, 3.5, 4.0))} />
    </Svg>
  );
}

// 9 · Recap. Three lines, one by one; the moving mapping outlined.
export function Recap({ t }: StepCtx) {
  const rows = ['within a partition: total order', 'across partitions: no order at all', 'the key-to-partition mapping can move'];
  return (
    <Svg label="order within a partition, none across partitions, and a key-to-partition mapping that can quietly move" h={260}>
      {rows.map((r, i) => {
        const k = easeOut(seg(t, 0.3 + i * 1.1, 0.8 + i * 1.1));
        return <Cell key={i} x={25} y={lerp(30, 40, k) + i * 60} w={530} label={r} o={k} stroke={i === 2 ? C.focus : C.mocha} />;
      })}
    </Svg>
  );
}
