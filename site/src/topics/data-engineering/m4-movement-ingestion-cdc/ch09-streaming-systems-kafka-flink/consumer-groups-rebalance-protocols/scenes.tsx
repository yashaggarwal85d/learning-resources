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

/** Two pause bars on a member circle at (cx, cy), shown by `k`. */
function Pause({ cx, cy, k, f = C.cherryText }: { cx: number; cy: number; k: number; f?: string }) {
  return (
    <g opacity={k}>
      <rect x={cx - 6} y={cy - 7} width={4} height={14} fill={f} />
      <rect x={cx + 2} y={cy - 7} width={4} height={14} fill={f} />
    </g>
  );
}

/** A member circle. */
function Member({ cx, cy, o = 1, stroke = C.mocha, dashed = false }: { cx: number; cy: number; o?: number; stroke?: string; dashed?: boolean }) {
  return <circle cx={cx} cy={cy} r={16} fill={C.cocoa} stroke={stroke} strokeWidth={1.8} strokeDasharray={dashed ? '4 3' : undefined} opacity={o} />;
}

const MX = (i: number) => 50 + i * 60;
const MOVERS = [0, 1, 8];

// 0 · Hook. Eight members consuming; a ninth slides in; every one of the nine freezes, pause bars in cherry.
export function Hook({ t }: StepCtx) {
  const join = easeInOut(seg(t, 0.8, 1.6));
  const freeze = easeOut(seg(t, 1.9, 2.4));
  return (
    <Svg label="a group of consumers, all paused, after only one new member joined" h={200}>
      <rect x={25} y={50} width={540} height={70} rx={8} fill="none" stroke={C.mocha} strokeWidth={1.2} strokeDasharray="5 3" opacity={easeOut(seg(t, 0, 0.3))} />
      {Array.from({ length: 9 }, (_, i) => (
        <g key={i}>
          <Member cx={i === 8 ? lerp(560, MX(8), join) : MX(i)} cy={85} o={i === 8 ? join : easeOut(seg(t, 0.1 + i * 0.05, 0.4 + i * 0.05))} stroke={i === 8 ? C.focus : C.mocha} />
          <Pause cx={MX(i)} cy={85} k={freeze} />
        </g>
      ))}
      <T x={MX(8)} y={150} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 1.4, 1.7))}>
        new
      </T>
      <T x={300} y={185} s={12} f={C.cherryText} a="middle" o={easeOut(seg(t, 2.6, 3.1))}>
        one joined; nobody is reading
      </T>
    </Svg>
  );
}

// 1 · Setup. Offset commits land in a log as records; compaction keeps only the latest per consumer. Below, the
// topic's partitions wait to be divided among members.
export function Setup({ t }: StepCtx) {
  const recs = ['A', 'B', 'A', 'B', 'A', 'B'];
  const compact = easeOut(seg(t, 1.6, 2.2));
  return (
    <Svg label="a consumer group's committed offsets, living in the same kind of log as everything else" h={200}>
      <T x={25} y={26} s={11} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        committed offsets: records in a log
      </T>
      {recs.map((r, i) => {
        const old = i < 4;
        const k = easeOut(seg(t, 0.2 + i * 0.15, 0.4 + i * 0.15));
        return old && compact >= 1 ? null : <Cell key={i} x={25 + i * 70} y={36} w={60} label={r} o={k * (old ? 1 - compact * 0.7 : 1)} stroke={old ? C.mocha : C.focus} />;
      })}
      <T x={450} y={54} s={11} f={C.focus} o={easeOut(seg(t, 2.1, 2.5))}>
        latest per consumer
      </T>
      <T x={25} y={110} s={11} f={C.latte} o={easeOut(seg(t, 2.8, 3.1))}>
        on top: dividing partitions among members who come and go
      </T>
      {Array.from({ length: 24 }, (_, p) => (
        <rect key={p} x={25 + p * 22} y={124} width={16} height={14} rx={2} fill={C.latte} opacity={easeOut(seg(t, 3.0 + p * 0.03, 3.3 + p * 0.03))} />
      ))}
      {Array.from({ length: 3 }, (_, i) => (
        <circle key={i} cx={100 + i * 190} cy={172} r={12} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 3.6 + i * 0.2, 3.9 + i * 0.2))} />
      ))}
    </Svg>
  );
}

// 2 · Predict. Nine members; the three whose partitions move are outlined. On answer pause bars land on just those
// three, under the newer protocol.
export function PredictPause({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  return (
    <Svg label="a membership change — does it pause every member, or only the ones whose partitions moved?" h={200}>
      {Array.from({ length: 9 }, (_, i) => (
        <g key={i}>
          <Member cx={MX(i)} cy={70} o={easeOut(seg(t, 0, 0.3))} stroke={MOVERS.includes(i) ? C.second : C.mocha} />
          {MOVERS.includes(i) && <Pause cx={MX(i)} cy={70} k={v} f={C.second} />}
        </g>
      ))}
      <T x={25} y={120} s={11} f={C.second} o={easeOut(seg(t, 0.5, 0.8))}>
        blue: partitions moved
      </T>
      <AnswerRow y={178} label="who pauses" answer={answer} value="newer: just the movers" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 3 · Reassignment. Twenty-four partitions over eight members, three each; a ninth column opens; two partitions lift
// out of members 0 and 1, travel over the top and settle in the new column. Everything else stays put.
export function RevealReassignment({ t }: StepCtx) {
  const cols = 9;
  const mv = [easeInOut(seg(t, 1.6, 2.6)), easeInOut(seg(t, 2.2, 3.2))];
  const pipAt = (from: number, slot: number, p: number) => {
    const x0 = MX(from) - 8;
    const x1 = MX(8) - 8;
    const y0 = 44;
    const y1 = 44 + slot * 22;
    const up = clamp(p * 3, 0, 1);
    const across = clamp(p * 3 - 1, 0, 1);
    const down = clamp(p * 3 - 2, 0, 1);
    return { x: lerp(x0, x1, across), y: lerp(lerp(y0, 22, up), y1, down) };
  };
  return (
    <Svg label="a real toy reassignment: most members' partitions never move at all" h={200}>
      {Array.from({ length: cols }, (_, m) => (
        <g key={m}>
          <rect
            x={MX(m) - 24}
            y={36}
            width={48}
            height={78}
            rx={5}
            fill="none"
            stroke={m === 8 ? C.focus : MOVERS.includes(m) && t > 3.3 ? C.second : C.mocha}
            strokeWidth={1.3}
            opacity={m === 8 ? easeOut(seg(t, 1.2, 1.5)) : easeOut(seg(t, 0, 0.3))}
          />
          <T x={MX(m)} y={132} s={11} f={C.latte} a="middle" o={m === 8 ? easeOut(seg(t, 1.2, 1.5)) : easeOut(seg(t, 0, 0.3))}>
            {m === 8 ? 'new' : `m${m}`}
          </T>
          {m < 8 &&
            [0, 1, 2].map((slot) => {
              if (slot === 0 && m < 2) return null;
              return <rect key={slot} x={MX(m) - 8} y={44 + slot * 22} width={16} height={14} rx={2} fill={C.latte} opacity={easeOut(seg(t, 0.2 + m * 0.05, 0.6 + m * 0.05))} />;
            })}
        </g>
      ))}
      {[0, 1].map((m) => {
        const q = pipAt(m, m, mv[m]);
        return <rect key={m} x={q.x} y={q.y} width={16} height={14} rx={2} fill={mv[m] > 0 ? C.focus : C.latte} opacity={easeOut(seg(t, 0.2, 0.6))} />;
      })}
      <T x={25} y={165} s={12} f={C.crema} o={easeOut(seg(t, 3.4, 3.8))}>
        24 partitions, eight to nine members
      </T>
      <T x={25} y={188} s={11} f={C.latte} o={easeOut(seg(t, 3.7, 4.1))}>
        two partitions move; the rest stay where they were
      </T>
    </Svg>
  );
}

// 4 · Pause compare. Eager: pause bars fall on all nine. Cooperative: only the three movers pause.
export function RevealPauseCompare({ t }: StepCtx) {
  return (
    <Svg label="the same membership change, measured under both protocols side by side" h={200}>
      {[0, 1].map((row) => {
        const y = 50 + row * 80;
        const k0 = row * 2.0;
        return (
          <g key={row}>
            <T x={25} y={y - 22} s={11} f={C.latte} o={easeOut(seg(t, k0, k0 + 0.3))}>
              {row === 0 ? 'eager: 9 paused' : 'cooperative: just the movers'}
            </T>
            {Array.from({ length: 9 }, (_, i) => (
              <g key={i}>
                <Member cx={MX(i)} cy={y} o={easeOut(seg(t, k0 + 0.1, k0 + 0.4))} />
                {(row === 0 || MOVERS.includes(i)) && <Pause cx={MX(i)} cy={y} k={easeOut(seg(t, k0 + 0.6 + i * 0.08, k0 + 0.9 + i * 0.08))} f={row === 0 ? C.cherryText : C.second} />}
              </g>
            ))}
          </g>
        );
      })}
      <T x={300} y={194} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 3.8, 4.2))}>
        everyone else never notices
      </T>
    </Svg>
  );
}

// 5 · Predict. A member with a persistent id steps out of the group box and back. On answer the group stays as it was:
// no rebalance.
export function PredictStatic({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const away = easeInOut(seg(t, 0.5, 0.9)) * (1 - easeInOut(seg(t, 1.1, 1.5)));
  return (
    <Svg label="a brief restart under a persistent configured identity — does it still force a rebalance?" h={200}>
      <rect x={25} y={40} width={300} height={60} rx={8} fill="none" stroke={v > 0 ? C.focus : C.mocha} strokeWidth={1.3} strokeDasharray="5 3" opacity={easeOut(seg(t, 0, 0.3))} />
      {[0, 1, 2].map((i) => (
        <Member key={i} cx={80 + i * 70} cy={70} o={easeOut(seg(t, 0, 0.3))} />
      ))}
      <Member cx={lerp(290, 420, away)} cy={70} o={easeOut(seg(t, 0, 0.3))} stroke={C.second} />
      <T x={290} y={122} s={11} f={C.second} a="middle" o={easeOut(seg(t, 0.2, 0.5))}>
        persistent id
      </T>
      {v > 0 && <MiniTick x={340} y={64} k={v} />}
      {v > 0 && (
        <T x={360} y={74} s={11} f={C.focus} o={v}>
          membership unchanged
        </T>
      )}
      <AnswerRow y={178} label="rebalance?" answer={answer} value="not if it's quick" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 6 · Static, measured. Three restarts against a dashed session timeout: no id rebalances even when quick; a quick
// restart with an id doesn't; a slow one with an id runs past the line and does.
export function RevealStatic({ t }: StepCtx) {
  const rows: [string, number, boolean][] = [
    ['no identity', 0.3, true],
    ['fast, with identity', 0.3, false],
    ['slow, with identity', 0.85, true],
  ];
  return (
    <Svg label="three restarts, measured: no identity, a fast restart with one, and a slow restart with one" h={260}>
      <line x1={390} y1={30} x2={390} y2={190} stroke={C.cherryText} strokeWidth={1.5} strokeDasharray="4 3" opacity={easeOut(seg(t, 0.1, 0.4))} />
      <T x={390} y={210} s={11} f={C.cherryText} a="middle" o={easeOut(seg(t, 0.1, 0.4))}>
        session timeout
      </T>
      {rows.map(([name, frac, reb], i) => {
        const y = 40 + i * 55;
        const k0 = 0.4 + i * 1.1;
        const g = easeInOut(seg(t, k0 + 0.2, k0 + 0.8));
        return (
          <g key={name}>
            <T x={25} y={y + 14} s={12} f={C.crema} o={easeOut(seg(t, k0, k0 + 0.3))}>
              {name}
            </T>
            <rect x={200} y={y} width={300 * frac * g} height={18} rx={3} fill={reb ? C.cherryText : C.focus} opacity={0.55} />
            <T x={25} y={y + 34} s={11} f={reb ? C.cherryText : C.focus} o={easeOut(seg(t, k0 + 0.8, k0 + 1.1))}>
              {reb ? 'rebalanced' : 'no rebalance'}
            </T>
          </g>
        );
      })}
      <T x={300} y={245} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 4.0, 4.4))}>
        each restart's length, against the timeout
      </T>
    </Svg>
  );
}

// 7 · Broker side. The assignment is computed inside the broker and sent to consumers and to Kafka Streams; the
// Streams box is dashed: its own rough edges for now.
export function RevealBrokerSide({ t }: StepCtx) {
  return (
    <Svg label="assignment computed on the broker, for ordinary consumers and for Kafka Streams alike" h={200}>
      <rect x={25} y={40} width={200} height={90} rx={6} fill="none" stroke={C.focus} strokeWidth={1.5} opacity={easeOut(seg(t, 0, 0.3))} />
      <T x={37} y={58} s={11} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        broker
      </T>
      <Cell x={40} y={lerp(64, 76, easeOut(seg(t, 0.4, 0.9)))} w={170} label="computes assignment" o={easeOut(seg(t, 0.4, 0.9))} stroke={C.focus} />
      <line x1={225} y1={85} x2={lerp(225, 340, easeOut(seg(t, 1.2, 1.7)))} y2={lerp(85, 54, easeOut(seg(t, 1.2, 1.7)))} stroke={C.mocha} strokeWidth={1.5} />
      <line x1={225} y1={85} x2={lerp(225, 340, easeOut(seg(t, 2.2, 2.7)))} y2={lerp(85, 124, easeOut(seg(t, 2.2, 2.7)))} stroke={C.mocha} strokeWidth={1.5} />
      <Cell x={345} y={40} w={205} label="consumers" o={easeOut(seg(t, 1.6, 1.9))} />
      <Cell x={345} y={110} w={205} label="Kafka Streams" o={easeOut(seg(t, 2.6, 2.9))} stroke={C.second} />
      <rect x={340} y={105} width={215} height={38} rx={6} fill="none" stroke={C.second} strokeWidth={1.2} strokeDasharray="4 3" opacity={easeOut(seg(t, 3.3, 3.7))} />
      <T x={345} y={164} s={11} f={C.second} o={easeOut(seg(t, 3.4, 3.8))}>
        its own, rough edges
      </T>
    </Svg>
  );
}

// 8 · Prove it. The run's results, one by one.
export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="this topic's own real run, every number read straight off it" h={260}>
      <Row y={50} label="affected members" value="a few of nine" k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={95} label="eager pause" value="all 9" valueColor={C.cherryText} k={easeOut(seg(t, 1.0, 1.5))} />
      <Row y={140} label="cooperative pause" value="just the movers" valueColor={C.focus} k={easeOut(seg(t, 1.8, 2.3))} />
      <Row y={185} label="fast restart" value="no rebalance" k={easeOut(seg(t, 2.6, 3.1))} />
      <Tick y={222} k={easeOut(seg(t, 3.5, 4.0))} />
    </Svg>
  );
}

// 9 · Recap. Three lines, one by one; the shape reaching Streams outlined.
export function Recap({ t }: StepCtx) {
  const rows = ['offsets: records in a compacted log', 'a rebalance pauses only the movers', 'a persistent id skips the pause; Streams too'];
  return (
    <Svg label="offsets as a log, a rebalance that no longer stalls everyone, and one shape reaching Streams too" h={260}>
      {rows.map((r, i) => {
        const k = easeOut(seg(t, 0.3 + i * 1.1, 0.8 + i * 1.1));
        return <Cell key={i} x={25} y={lerp(30, 40, k) + i * 60} w={530} label={r} o={k} stroke={i === 2 ? C.focus : C.mocha} />;
      })}
    </Svg>
  );
}
