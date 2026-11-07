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

/** A small square record token at (x, y). */
function Pip({ x, y, o = 1, f = C.second, s = 10 }: { x: number; y: number; o?: number; f?: string; s?: number }) {
  return <rect x={x - s / 2} y={y - s / 2} width={s} height={s} rx={2} fill={f} opacity={o} />;
}

/** A barrier marker: a tall thin bar at (x, y). */
function Barrier({ x, y, o = 1 }: { x: number; y: number; o?: number }) {
  return <rect x={x - 2} y={y - 12} width={4} height={24} rx={1} fill={C.focus} opacity={o} />;
}

/** A lightning-bolt crash mark at (x, y), drawn in by `k`. */
function Bolt({ x, y, k }: { x: number; y: number; k: number }) {
  return <path d={`M${x + 4} ${y - 12} l-8 12 h7 l-5 12 l11 -15 h-7 l5 -9 z`} fill={C.cherryText} opacity={k} />;
}

// 0 · Hook. Two lanes carry the same backlog of records. A checkpoint starts on both at once. In one mode its bar crawls
// on and on; in the other it finishes almost at once, with a tick.
export function Hook({ t }: StepCtx) {
  const rows: [string, number][] = [
    ['waiting mode', 4.2],
    ['other mode', 0.4],
  ];
  return (
    <Svg label="same backlog, two checkpoint modes, two very different completion times" h={200}>
      {rows.map(([n, d], r) => {
        const y = 40 + r * 70;
        const g = easeInOut(seg(t, 0.6, 0.6 + d));
        return (
          <g key={n}>
            <T x={25} y={y + 4} s={12} f={C.crema} o={easeOut(seg(t, 0, 0.3))}>
              {n}
            </T>
            {Array.from({ length: 8 }, (_, j) => (
              <Pip key={j} x={150 + j * 14} y={y} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))} />
            ))}
            <rect x={280} y={y - 8} width={260 * g} height={16} rx={3} fill={r === 0 ? C.cherryText : C.focus} opacity={0.55} />
            {r === 1 && <MiniTick x={548} y={y - 2} k={easeOut(seg(t, 1.0, 1.3))} />}
          </g>
        );
      })}
      <T x={25} y={190} s={12} f={C.crema} o={easeOut(seg(t, 3.6, 4.0))}>
        same backlog; only the mode changed
      </T>
    </Svg>
  );
}

// 1 · Setup. Records stream through three workers. A bolt strikes the middle one. A frame then draws around all three
// workers' state while the records keep moving: a consistent picture, taken without pausing.
export function Setup({ t }: StepCtx) {
  const crash = easeOut(seg(t, 0.9, 1.2));
  const frame = easeInOut(seg(t, 2.2, 3.2));
  return (
    <Svg label="the runtime keeps running, but a worker can still fail" h={200}>
      {[0, 1, 2].map((i) => (
        <Cell key={i} x={40 + i * 180} y={50} w={130} label="worker" o={easeOut(seg(t, 0, 0.3))} stroke={i === 1 && crash > 0 && t < 2.0 ? C.cherryText : C.mocha} />
      ))}
      {[0, 1].map((g) => [0, 1].map((j) => <Pip key={`${g}${j}`} x={175 + g * 180 + ((t * 0.8 + j * 0.5) % 1) * 40} y={64} />))}
      <Bolt x={235} y={30} k={crash * (1 - easeOut(seg(t, 1.8, 2.0)))} />
      <rect x={30} y={40} width={520 * frame} height={48} rx={8} fill="none" stroke={C.focus} strokeWidth={1.8} strokeDasharray="6 4" opacity={frame > 0 ? 1 : 0} />
      <T x={25} y={130} s={11} f={C.cherryText} o={easeOut(seg(t, 1.0, 1.3))}>
        a worker can fail mid-job
      </T>
      <T x={25} y={160} s={11} f={C.focus} o={easeOut(seg(t, 3.0, 3.3))}>
        a consistent picture of all state
      </T>
      <T x={25} y={190} s={12} f={C.crema} o={easeOut(seg(t, 3.6, 4.0))}>
        taken while everything keeps moving
      </T>
    </Svg>
  );
}

// 2 · Barrier. A barrier is dropped into the stream at the source and travels down two paths with the records. When it
// has arrived on both paths into the step, the step's state is framed: everything before it, captured clean.
export function RevealBarrier({ t }: StepCtx) {
  const b1 = easeInOut(seg(t, 0.6, 2.0));
  const b2 = easeInOut(seg(t, 0.8, 2.8));
  const snap = easeOut(seg(t, 2.9, 3.3));
  return (
    <Svg label="a barrier rides the stream itself, the way Chandy and Lamport's snapshot does" h={200}>
      <Cell x={25} y={70} w={90} label="source" o={easeOut(seg(t, 0, 0.3))} />
      <path d="M115 84 C 160 84, 160 40, 200 40 H 380 C 420 40, 420 84, 440 84" fill="none" stroke={C.mocha} strokeWidth={1.3} />
      <path d="M115 84 C 160 84, 160 128, 200 128 H 380 C 420 128, 420 84, 440 84" fill="none" stroke={C.mocha} strokeWidth={1.3} />
      {[0, 1, 2].map((j) => (
        <g key={j}>
          <Pip x={200 + ((t * 0.35 + j * 0.33) % 1) * 180} y={40} />
          <Pip x={200 + ((t * 0.3 + j * 0.33 + 0.15) % 1) * 180} y={128} />
        </g>
      ))}
      {b1 > 0 && b1 < 1 && <Barrier x={lerp(200, 380, b1)} y={40} />}
      {b2 > 0 && b2 < 1 && <Barrier x={lerp(200, 380, b2)} y={128} />}
      <rect x={445} y={64} width={110} height={40} rx={6} fill={C.cocoa} stroke={snap > 0 ? C.focus : C.mocha} strokeWidth={snap > 0 ? 2.2 : 1.5} />
      <T x={500} y={89} s={12} f={snap > 0 ? C.focus : C.crema} a="middle">
        step
      </T>
      <T x={445} y={124} s={11} f={C.focus} o={snap}>
        snapshot
      </T>
      <T x={25} y={176} s={11} f={C.latte} o={easeOut(seg(t, 3.4, 3.8))}>
        Chandy and Lamport's old idea,
      </T>
      <T x={25} y={194} s={11} f={C.latte} o={easeOut(seg(t, 3.8, 4.2))}>
        carried by the data itself
      </T>
    </Svg>
  );
}

/** Two input channels into one step: the top one clear, the bottom one packed with `n` backlog records. */
function TwoInputs({ n, o = 1, snap = 0 }: { n: number; o?: number; snap?: number }) {
  return (
    <g opacity={o}>
      <T x={25} y={44} s={11} f={C.latte}>
        clear
      </T>
      <line x1={80} y1={40} x2={420} y2={40} stroke={C.mocha} strokeWidth={1.3} />
      <T x={25} y={114} s={11} f={C.cherryText}>
        clogged
      </T>
      <line x1={80} y1={110} x2={420} y2={110} stroke={C.mocha} strokeWidth={1.3} />
      {Array.from({ length: n }, (_, j) => (
        <Pip key={j} x={405 - j * 14} y={110} f={C.latte} />
      ))}
      <rect x={430} y={50} width={125} height={50} rx={6} fill={C.cocoa} stroke={snap > 0 ? C.focus : C.mocha} strokeWidth={snap > 0 ? 2.2 : 1.5} />
      <T x={492} y={80} s={12} f={snap > 0 ? C.focus : C.crema} a="middle">
        step
      </T>
    </g>
  );
}

// 3 · Predict. The clear channel's barrier is almost at the step; the clogged one's sits behind a long backlog. On
// answer the verdict lands: it depends on the mode.
export function PredictBackpressureStall({ t, answer }: StepCtx) {
  const b = easeInOut(seg(t, 0.3, 1.2));
  return (
    <Svg label="one input channel is backed way up — what happens to the checkpoint?" h={200}>
      <TwoInputs n={18} />
      <Barrier x={lerp(90, 400, b)} y={40} />
      <Barrier x={150} y={110} o={easeOut(seg(t, 0.3, 0.6))} />
      <AnswerRow y={176} label="the stuck barrier" answer={answer} value="depends on the mode" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 4 · Aligned. The clear channel's barrier arrives and that channel is locked, waiting. The clogged channel drains a
// record at a time; only when its barrier finally reaches the step is the snapshot taken. A duration bar runs long.
export function RevealAligned({ t }: StepCtx) {
  const drained = Math.floor(easeInOut(seg(t, 0.6, 3.6)) * 18);
  const snap = easeOut(seg(t, 3.6, 3.9));
  return (
    <Svg label="aligned checkpoints wait for the barrier on every input before snapshotting" h={200}>
      <TwoInputs n={18 - drained} snap={snap} />
      <Barrier x={lerp(200, 400, easeInOut(seg(t, 0, 0.5)))} y={40} />
      <Lock x={350} y={18} k={easeOut(seg(t, 0.5, 0.8))} f={C.cherryText} />
      <T x={300} y={22} s={11} f={C.cherryText} a="end" o={easeOut(seg(t, 0.6, 0.9))}>
        waits
      </T>
      {snap < 1 && <Barrier x={405 - (18 - drained) * 14} y={110} />}
      <rect x={80} y={150} width={470 * easeInOut(seg(t, 0.3, 3.9))} height={12} rx={3} fill={C.cherryText} opacity={0.55} />
      <T x={25} y={160} s={11} f={C.latte}>
        time
      </T>
      <T x={25} y={192} s={12} f={C.crema} o={easeOut(seg(t, 4.0, 4.4))}>
        only as fast as the slowest path
      </T>
    </Svg>
  );
}

// 5 · Unaligned. The barrier arrives on the clear channel and the step snapshots at once. The clogged channel's
// backlog flies into the snapshot instead of being waited on, and the snapshot box swells to hold it.
export function RevealUnaligned({ t }: StepCtx) {
  const snap = easeOut(seg(t, 0.5, 0.8));
  const fly = easeInOut(seg(t, 1.2, 2.6));
  const left = Math.round(18 * (1 - fly));
  return (
    <Svg label="unaligned checkpoints snapshot on first sight, absorbing the backlog instead" h={200}>
      <TwoInputs n={left} snap={snap} />
      {snap < 1 && <Barrier x={lerp(200, 400, easeInOut(seg(t, 0, 0.5)))} y={40} />}
      <rect x={430} y={130} width={lerp(50, 125, fly)} height={lerp(20, 44, fly)} rx={4} fill="none" stroke={C.focus} strokeWidth={1.6} opacity={snap} />
      <T x={430} y={124} s={11} f={C.focus} o={snap}>
        snapshot
      </T>
      {fly > 0 && fly < 1 && <Pip x={lerp(300, 470, fly)} y={lerp(110, 150, fly)} f={C.latte} />}
      <rect x={80} y={176} width={60 * snap} height={12} rx={3} fill={C.focus} opacity={0.55} />
      <T x={25} y={186} s={11} f={C.latte}>
        time
      </T>
      <T x={160} y={186} s={11} f={C.crema} o={easeOut(seg(t, 3.2, 3.6))}>
        nothing waits; the picture carries more
      </T>
    </Svg>
  );
}

// 6 · Incremental. Six rounds of a state growing by 10 each. Full checkpoints' bars climb round after round;
// incremental ones stay flat at 10.
export function RevealIncremental({ t }: StepCtx) {
  return (
    <Svg label="an incremental checkpoint only ever pays for what changed since last time" h={200}>
      <T x={25} y={24} s={11} f={C.cherryText} o={easeOut(seg(t, 0, 0.3))}>
        full: copies everything so far
      </T>
      <T x={330} y={24} s={11} f={C.focus} o={easeOut(seg(t, 0, 0.3))}>
        incremental: 10 each round
      </T>
      {[1, 2, 3, 4, 5, 6].map((r, i) => {
        const k = easeOut(seg(t, 0.4 + i * 0.55, 0.8 + i * 0.55));
        return (
          <g key={r}>
            <rect x={30 + i * 40} y={160 - r * 20 * k} width={28} height={r * 20 * k} rx={2} fill={C.cherryText} opacity={0.6} />
            <rect x={335 + i * 36} y={160 - 20 * k} width={26} height={20 * k} rx={2} fill={C.focus} opacity={0.6} />
          </g>
        );
      })}
      <line x1={25} y1={160} x2={555} y2={160} stroke={C.mocha} strokeWidth={1.2} />
      <T x={25} y={190} s={12} f={C.crema} o={easeOut(seg(t, 4.0, 4.4))}>
        one grows without limit; one stays flat
      </T>
    </Svg>
  );
}

// 7 · Predict. Two cells: the stricter guarantee, costing more; the cheaper one. On answer the stricter one is
// outlined as the default.
export function PredictStricterDefault({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  return (
    <Svg label="is the strictest checkpointing mode always the right default?" h={200}>
      <Cell x={25} y={30} w={250} label="exactly-once: costs more" o={easeOut(seg(t, 0, 0.3))} stroke={v > 0 ? C.focus : C.mocha} f={v > 0 ? C.focus : C.crema} />
      <Cell x={300} y={30} w={250} label="at-least-once: cheaper" o={easeOut(seg(t, 0.4, 0.7))} />
      {v > 0 && (
        <T x={150} y={84} s={12} f={C.focus} a="middle" o={v}>
          the default
        </T>
      )}
      <AnswerRow y={170} label="the default" answer={answer} value="exactly-once" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 8 · Modes. Exactly-once: a record is counted, a bolt strikes, it replays, and the count still shows it once.
// At-least-once: the same bolt and replay, and the record is counted a second time, in cherry.
export function RevealModes({ t }: StepCtx) {
  const rows: [string, boolean, number][] = [
    ['exactly-once', true, 0.2],
    ['at-least-once', false, 2.0],
  ];
  return (
    <Svg label="exactly-once is the default; at-least-once trades a little risk for less overhead" h={200}>
      {rows.map(([n, once, a], r) => {
        const y = 40 + r * 70;
        const k1 = easeOut(seg(t, a + 0.2, a + 0.5));
        const bolt = easeOut(seg(t, a + 0.6, a + 0.9));
        const k2 = easeOut(seg(t, a + 1.1, a + 1.4));
        return (
          <g key={n}>
            <T x={25} y={y + 4} s={12} f={C.crema} o={easeOut(seg(t, a, a + 0.3))}>
              {n}
            </T>
            <Pip x={180} y={y} o={k1} s={14} />
            <Bolt x={230} y={y} k={bolt * (1 - k2 * 0.6)} />
            <T x={270} y={y + 4} s={11} f={C.latte} o={k2}>
              replay
            </T>
            {!once && <Pip x={340} y={y} o={k2} s={14} f={C.cherryText} />}
            <T x={555} y={y + 4} s={12} f={once ? C.focus : C.cherryText} a="end" o={easeOut(seg(t, a + 1.4, a + 1.7))}>
              {once ? 'counted once' : 'counted twice'}
            </T>
          </g>
        );
      })}
      <T x={25} y={186} s={11} f={C.latte} o={easeOut(seg(t, 3.8, 4.2))}>
        most work: exactly-once; only the most latency-sensitive trades it
      </T>
    </Svg>
  );
}

// 9 · Checkpoint vs savepoint. A clock ticks and the system takes checkpoint after checkpoint on its own. Then one
// savepoint, taken on purpose; the job changes shape, from two workers to three, and restores from it.
export function RevealCheckpointVsSavepoint({ t }: StepCtx) {
  const n = Math.floor(easeInOut(seg(t, 0.2, 2.0)) * 6);
  const sp = easeOut(seg(t, 2.2, 2.6));
  const grow = easeOut(seg(t, 3.2, 3.6));
  const restore = easeInOut(seg(t, 3.6, 4.2));
  return (
    <Svg label="a checkpoint is Flink's own; a savepoint is deliberate, portable, yours" h={200}>
      <T x={25} y={24} s={11} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        checkpoints: automatic, the system's own
      </T>
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={25 + i * 44} y={34} width={34} height={20} rx={3} fill="none" stroke={C.latte} strokeWidth={1.3} />
      ))}
      <T x={25} y={90} s={11} f={C.focus} o={sp}>
        a savepoint: taken on purpose, yours
      </T>
      <rect x={25} y={100} width={80} height={28} rx={4} fill={C.cocoa} stroke={C.focus} strokeWidth={2} opacity={sp} />
      {[0, 1, 2].map((i) => (
        <Cell key={i} x={330 + i * 75} y={100} w={65} label="worker" o={i < 2 ? easeOut(seg(t, 2.6, 2.9)) : grow} />
      ))}
      <T x={330} y={150} s={11} f={C.latte} o={grow}>
        the job changes shape
      </T>
      <path d="M105 114 C 200 160, 260 160, 325 120" fill="none" stroke={C.focus} strokeWidth={1.5} strokeDasharray="300" strokeDashoffset={300 * (1 - restore)} />
      <T x={25} y={186} s={12} f={C.crema} o={easeOut(seg(t, 4.0, 4.4))}>
        a savepoint survives a change made on purpose
      </T>
    </Svg>
  );
}

// 10 · Prove it. The run's results, one by one.
export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="this topic's own real run, every number read straight off it" h={260}>
      <Row y={30} label="no backlog" value="both modes equal" k={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={75} label="backlog 40, waiting" value="over 10 times longer" valueColor={C.cherryText} k={easeOut(seg(t, 0.8, 1.2))} />
      <Row y={120} label="other mode snapshot" value="grows with backlog" k={easeOut(seg(t, 1.4, 1.8))} />
      <Row y={165} label="6 rounds, full" value="keeps climbing" valueColor={C.cherryText} k={easeOut(seg(t, 2.0, 2.4))} />
      <Row y={210} label="incremental" value="flat, 10 each" valueColor={C.focus} k={easeOut(seg(t, 2.6, 3.0))} />
      <Tick y={240} k={easeOut(seg(t, 3.4, 3.9))} />
    </Svg>
  );
}

// 11 · Recap. Three lines, one by one; the two-pictures line outlined.
export function Recap({ t }: StepCtx) {
  const rows = ['a barrier that travels with the data', 'wait for the slowest, or carry more', 'checkpoints automatic; savepoints on purpose'];
  return (
    <Svg label="a barrier, a stall or none, a bounded delta, the right mode, the right snapshot" h={260}>
      {rows.map((r, i) => {
        const k = easeOut(seg(t, 0.3 + i * 1.2, 0.8 + i * 1.2));
        return <Cell key={i} x={25} y={lerp(30, 40, k) + i * 60} w={530} label={r} o={k} stroke={i === 2 ? C.focus : C.mocha} />;
      })}
    </Svg>
  );
}
