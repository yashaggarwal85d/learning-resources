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

/** A lightning-bolt crash mark at (x, y), drawn in by `k`. */
function Bolt({ x, y, k }: { x: number; y: number; k: number }) {
  return <path d={`M${x + 4} ${y - 12} l-8 12 h7 l-5 12 l11 -15 h-7 l5 -9 z`} fill={C.cherryText} opacity={k} />;
}

/** A pip travelling from (x1, y1) to (x2, y2) while 0 < p < 1. */
function Pip({ x1, y1, x2, y2, p, f = C.latte }: { x1: number; y1: number; x2: number; y2: number; p: number; f?: string }) {
  if (p <= 0 || p >= 1) return null;
  return <rect x={lerp(x1, x2, p) - 6} y={lerp(y1, y2, p) - 6} width={12} height={12} rx={2} fill={f} />;
}

// 0 · Hook. The same retry twice. Idempotence off: the ack is lost, the resend lands a second copy in cherry.
// Idempotence on: the resend reaches the broker and is struck: rejected, logged.
export function Hook({ t }: StepCtx) {
  return (
    <Svg label="the same crash timeline from the last topic, with the rejection now intercepting the retry before it lands" h={200}>
      {[0, 1].map((r) => {
        const y = 40 + r * 80;
        const k0 = 0.2 + r * 2.0;
        const p1 = seg(t, k0 + 0.1, k0 + 0.5);
        const p2 = seg(t, k0 + 0.9, k0 + 1.3);
        return (
          <g key={r}>
            <T x={25} y={y - 8} s={11} f={C.latte} o={easeOut(seg(t, k0, k0 + 0.2))}>
              {r === 0 ? 'idempotence off' : 'idempotence on'}
            </T>
            <Cell x={25} y={y} w={110} label="producer" o={easeOut(seg(t, k0, k0 + 0.2))} />
            <rect x={400} y={y} width={150} height={30} rx={5} fill="none" stroke={C.mocha} strokeWidth={1.3} opacity={easeOut(seg(t, k0, k0 + 0.2))} />
            <Pip x1={145} y1={y + 15} x2={405} y2={y + 15} p={p1} />
            <rect x={410} y={y + 8} width={14} height={14} rx={2} fill={C.latte} opacity={p1 >= 1 ? 1 : 0} />
            <Bolt x={270} y={y + 44} k={easeOut(seg(t, k0 + 0.6, k0 + 0.8))} />
            <Pip x1={145} y1={y + 15} x2={405} y2={y + 15} p={p2} f={r === 0 ? C.cherryText : C.second} />
            {r === 0 ? <rect x={432} y={y + 8} width={14} height={14} rx={2} fill={C.cherryText} opacity={p2 >= 1 ? 1 : 0} /> : <Cross x={388} y={y + 15} k={easeOut(seg(t, k0 + 1.3, k0 + 1.5))} />}
            <T x={550} y={y + 52} s={11} f={r === 0 ? C.cherryText : C.focus} a="end" o={easeOut(seg(t, k0 + 1.4, k0 + 1.7))}>
              {r === 0 ? 'a duplicate lands' : 'rejected, and logged'}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

// 1 · Setup. Batches leave the producer stamped p1 · epoch 0 · seq 0, 1, 2; the broker's last-seen table updates as
// each lands.
export function Setup({ t }: StepCtx) {
  const n = Math.min(3, Math.floor(seg(t, 0.8, 3.2) * 3.01));
  const p = (seg(t, 0.8, 3.2) * 3) % 1;
  return (
    <Svg label="a producer stamping each batch with an id/epoch/sequence triple; a broker holding a last-seen table" h={200}>
      <Cell x={25} y={40} w={110} label="producer" o={easeOut(seg(t, 0, 0.3))} />
      <Cell x={lerp(150, 160, easeOut(seg(t, 0.3, 0.6)))} y={90} w={210} label={`p1 · epoch 0 · seq ${Math.min(n, 2)}`} o={easeOut(seg(t, 0.3, 0.6))} stroke={C.second} />
      {n < 3 && t > 0.8 && <Pip x1={145} y1={54} x2={390} y2={54} p={p} f={C.second} />}
      <Cell x={400} y={40} w={150} label="broker" o={easeOut(seg(t, 0.1, 0.4))} />
      <Cell x={400} y={90} w={150} label={n > 0 ? `last seq: ${n - 1}` : 'last seq: none'} o={easeOut(seg(t, 0.5, 0.8))} stroke={C.focus} />
      <T x={25} y={160} s={11} f={C.second} o={easeOut(seg(t, 3.3, 3.7))}>
        who, which attempt, and a running count
      </T>
    </Svg>
  );
}

// 2 · Predict. The broker's table says last seq 2; seq 1 arrives a second time. On answer it is struck.
export function PredictDuplicate({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  return (
    <Svg label="the exact same batch, same sequence number, arrives a second time — can the broker tell?" h={200}>
      <Cell x={25} y={40} w={140} label="seq 1, again" o={easeOut(seg(t, 0, 0.3))} stroke={C.second} />
      <Req x1={175} x2={390} y={54} k={easeOut(seg(t, 0.3, 0.8))} />
      <Cell x={400} y={40} w={150} label="last seq: 2" o={easeOut(seg(t, 0.1, 0.4))} stroke={C.focus} />
      <Cross x={380} y={54} k={v} />
      {v > 0 && (
        <T x={400} y={100} s={11} f={C.cherryText} o={v}>
          a repeat, spotted
        </T>
      )}
      <AnswerRow y={178} label="can it tell?" answer={answer} value="yes, by the count" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 3 · The rule. With last seq 2, only one higher gets in: seq 1 bounces as a duplicate, seq 4 bounces as out of
// sequence, both in cherry.
export function RevealDuplicate({ t }: StepCtx) {
  const rows: [string, string, number][] = [
    ['seq 1', 'duplicate rejected', 1.0],
    ['seq 4', 'out of sequence', 2.4],
  ];
  return (
    <Svg label="the broker rejects anything that isn't exactly one greater than what it last accepted" h={200}>
      <Cell x={380} y={30} w={170} label="last seq: 2" o={easeOut(seg(t, 0, 0.3))} stroke={C.focus} />
      <T x={380} y={80} s={11} f={C.focus} o={easeOut(seg(t, 0.4, 0.8))}>
        only one higher gets in
      </T>
      {rows.map(([b, out, k0], i) => {
        const y = 100 + i * 50;
        return (
          <g key={b}>
            <Cell x={25} y={y} w={100} label={b} o={easeOut(seg(t, k0, k0 + 0.3))} stroke={C.second} />
            <Req x1={135} x2={lerp(135, 360, 0.6)} y={y + 14} k={easeOut(seg(t, k0 + 0.3, k0 + 0.7))} />
            <Cross x={290} y={y + 14} k={easeOut(seg(t, k0 + 0.7, k0 + 0.9))} />
            <T x={310} y={y + 19} s={12} f={C.cherryText} o={easeOut(seg(t, k0 + 0.8, k0 + 1.1))}>
              {out}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

// 4 · Predict. Partition 0's table says last seq 2; partition 1 has none yet; seq 0 heads to partition 1. On answer it
// lands with a tick.
export function PredictCrossPartition({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  return (
    <Svg label="the same sequence number, sent to a different partition — does the same rule reject it too?" h={200}>
      <Cell x={330} y={30} w={220} label="partition 0: last seq 2" o={easeOut(seg(t, 0, 0.3))} />
      <Cell x={330} y={90} w={220} label={v > 0 ? 'partition 1: last seq 0' : 'partition 1: none yet'} o={easeOut(seg(t, 0.1, 0.4))} stroke={v > 0 ? C.focus : C.mocha} />
      <Cell x={25} y={90} w={110} label="seq 0" o={easeOut(seg(t, 0.2, 0.5))} stroke={C.second} />
      <Req x1={145} x2={320} y={104} k={easeOut(seg(t, 0.5, 1.0))} />
      {v > 0 && <MiniTick x={300} y={132} k={v} />}
      <AnswerRow y={182} label="rejected too?" answer={answer} value="no, its own counter" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 5 · Per-lane counters. Two lanes, each with its own counter: partition 0 counts 0, 1, 2; partition 1 counts 0. Both
// writes land with ticks.
export function RevealCrossPartition({ t }: StepCtx) {
  const n0 = Math.min(3, Math.floor(seg(t, 0.4, 2.0) * 3.01));
  const n1 = t >= 2.6 ? 1 : 0;
  return (
    <Svg label="each partition keeps its own independent counter, so the same number elsewhere is a fresh, valid write" h={200}>
      {[0, 1].map((l) => {
        const y = 40 + l * 70;
        const n = l === 0 ? n0 : n1;
        return (
          <g key={l}>
            <T x={25} y={y + 19} s={12} f={C.crema} o={easeOut(seg(t, l * 0.2, 0.3 + l * 0.2))}>
              {`partition ${l}`}
            </T>
            <rect x={150} y={y} width={250} height={28} rx={4} fill="none" stroke={C.mocha} strokeWidth={1.3} opacity={easeOut(seg(t, l * 0.2, 0.3 + l * 0.2))} />
            {Array.from({ length: n }, (_, i) => (
              <Cell key={i} x={156 + i * 80} y={y + 3} w={70} h={22} label={`seq ${i}`} stroke={l === 1 ? C.focus : C.mocha} />
            ))}
            <MiniTick x={420} y={y + 10} k={l === 0 ? easeOut(seg(t, 2.0, 2.3)) : easeOut(seg(t, 2.7, 3.0))} />
          </g>
        );
      })}
      <T x={25} y={180} s={11} f={C.latte} o={easeOut(seg(t, 3.3, 3.7))}>
        the same number, two lanes: two valid writes
      </T>
    </Svg>
  );
}

// 6 · Zombie fencing. The producer restarts and its stamp becomes epoch 1; its seq 0 lands. A straggler still stamped
// epoch 0 arrives with seq 5 and is struck: fenced.
export function RevealZombieFencing({ t }: StepCtx) {
  const restart = easeOut(seg(t, 0.4, 0.8));
  return (
    <Svg label="a producer restarts, gets a new session id, and a late write from the old one is fenced off" h={200}>
      <Cell x={25} y={40} w={170} label={restart > 0.5 ? 'producer: epoch 1' : 'producer: epoch 0'} o={easeOut(seg(t, 0, 0.3))} stroke={restart > 0.5 ? C.focus : C.mocha} />
      <Req x1={205} x2={390} y={54} k={easeOut(seg(t, 1.0, 1.5))} label="epoch 1, seq 0" />
      <Cell x={400} y={40} w={150} label="broker" o={easeOut(seg(t, 0.1, 0.4))} />
      <MiniTick x={530} y={82} k={easeOut(seg(t, 1.5, 1.8))} />
      <Cell x={25} y={120} w={170} label="straggler: epoch 0" o={easeOut(seg(t, 2.0, 2.3))} stroke={C.cherryText} />
      <Req x1={205} x2={390} y={134} k={easeOut(seg(t, 2.4, 2.9))} label="epoch 0, seq 5" f={C.cherryText} />
      <Cross x={380} y={134} k={easeOut(seg(t, 2.9, 3.2))} />
      <T x={400} y={139} s={12} f={C.cherryText} o={easeOut(seg(t, 3.1, 3.4))}>
        fenced off
      </T>
      <T x={25} y={190} s={11} f={C.latte} o={easeOut(seg(t, 3.6, 4.0))}>
        an old attempt is turned away, whatever its count
      </T>
    </Svg>
  );
}

// 7 · Scope. A focus box around one producer session and one partition: covered. Outside it, dashed: a second
// producer with the same record, and a restart: not covered.
export function RevealScope({ t }: StepCtx) {
  return (
    <Svg label="one producer session, one partition — nothing wider is covered without more work" h={200}>
      <rect x={25} y={30} width={300} height={70} rx={6} fill="none" stroke={C.focus} strokeWidth={1.6} opacity={easeOut(seg(t, 0.2, 0.6))} />
      <T x={37} y={48} s={11} f={C.focus} o={easeOut(seg(t, 0.2, 0.6))}>
        covered
      </T>
      <Cell x={40} y={56} w={130} label="one session" o={easeOut(seg(t, 0.4, 0.8))} />
      <Cell x={180} y={56} w={130} label="one partition" o={easeOut(seg(t, 0.6, 1.0))} />
      <Hole x={350} y={40} w={200} o={easeOut(seg(t, 1.6, 2.0))} stroke={C.cherryText} />
      <T x={450} y={59} s={11} f={C.cherryText} a="middle" o={easeOut(seg(t, 1.6, 2.0))}>
        two producers, same record
      </T>
      <Hole x={350} y={90} w={200} o={easeOut(seg(t, 2.4, 2.8))} stroke={C.cherryText} />
      <T x={450} y={109} s={11} f={C.cherryText} a="middle" o={easeOut(seg(t, 2.4, 2.8))}>
        across a restart
      </T>
      <T x={25} y={170} s={12} f={C.crema} o={easeOut(seg(t, 3.4, 3.8))}>
        one sender, one attempt, one lane
      </T>
    </Svg>
  );
}

/** An empty dashed slot. */
function Hole({ x, y, w, h = 28, o = 1, stroke = C.mocha }: { x: number; y: number; w: number; h?: number; o?: number; stroke?: string }) {
  return <rect x={x} y={y} width={w} height={h} rx={4} fill="none" stroke={stroke} strokeWidth={1.5} strokeDasharray="4 3" opacity={o} />;
}

// 8 · Prove it. The run's results, one by one.
export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="this topic's own real run, every number read straight off it" h={260}>
      <Row y={50} label="replayed seq 1" value="rejected" valueColor={C.cherryText} k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={95} label="seq 0, partition 1" value="accepted" valueColor={C.focus} k={easeOut(seg(t, 1.0, 1.5))} />
      <Row y={140} label="epoch 0 after epoch 1" value="fenced off" valueColor={C.cherryText} k={easeOut(seg(t, 1.8, 2.3))} />
      <Tick y={176} k={easeOut(seg(t, 2.8, 3.3))} />
    </Svg>
  );
}

// 9 · Recap. Three lines, one by one; the counter line outlined.
export function Recap({ t }: StepCtx) {
  const rows = ["producer id: who's writing", 'epoch: which attempt', 'sequence: a per-lane repeat check'];
  return (
    <Svg label="an id, a session marker, and a per-lane counter — exactly scoped, nothing wider assumed" h={260}>
      {rows.map((r, i) => {
        const k = easeOut(seg(t, 0.3 + i * 1.1, 0.8 + i * 1.1));
        return <Cell key={i} x={25} y={lerp(30, 40, k) + i * 60} w={530} label={r} o={k} stroke={i === 2 ? C.focus : C.mocha} />;
      })}
    </Svg>
  );
}
