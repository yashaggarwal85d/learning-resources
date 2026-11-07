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
/** One transaction's timeline: its name on the left and a thin line running right; events sit on it as cells. */
function Lane({ y, name, o = 1 }: { y: number; name: string; o?: number }) {
  return (
    <g opacity={o}>
      <T x={25} y={y + 5} s={13} f={C.latte}>
        {name}
      </T>
      <line x1={60} y1={y} x2={575} y2={y} stroke={C.mocha} strokeWidth={1.5} />
    </g>
  );
}

/** An event on a lane, centred on the lane's line. */
function Ev({ x, y, w = 110, label, o = 1, stroke = C.mocha, f = C.crema }: { x: number; y: number; w?: number; label: string; o?: number; stroke?: string; f?: string }) {
  return <Cell x={x} y={y - 13} w={w} h={26} label={label} o={o} stroke={stroke} f={f} />;
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

// 1 · Hook. Two checkouts race for the last unit; one lands, one loses. The open question: when, and at what cost.
export function Hook({ t }: StepCtx) {
  const p = easeInOut(seg(t, 0.8, 1.8));
  return (
    <Svg label="two checkouts, one row. One loses." h={230}>
      <Cell x={25} y={50} w={170} label="tab 1: checkout" o={easeOut(seg(t, 0.2, 0.5))} />
      <Cell x={25} y={110} w={170} label="tab 2: checkout" o={easeOut(seg(t, 0.4, 0.7))} />
      <Cell x={360} y={80} w={215} label="the last unit" stroke={C.focus} o={easeOut(seg(t, 0.5, 0.8))} />
      <circle cx={lerp(200, 352, p)} cy={lerp(64, 90, p)} r={5} fill={C.focus} opacity={p > 0 && p < 1 ? 1 : 0} />
      <circle cx={lerp(200, 352, p * 0.92)} cy={lerp(124, 104, p * 0.92)} r={5} fill={C.latte} opacity={p > 0 && p < 1 ? 1 : 0} />
      <MiniTick x={205} y={64} k={easeOut(seg(t, 2.1, 2.4))} />
      <Cross x={212} y={124} k={easeOut(seg(t, 2.4, 2.7))} />
      <Row y={200} label="when it finds out" value="and at what cost" valueColor={C.focus} k={easeOut(seg(t, 3.3, 3.8))} />
    </Svg>
  );
}

// 2 · Pessimistic. The left-hand row takes its lock at once; a possible second checkout only shows up later, maybe never.
export function RevealPessimistic({ t }: StepCtx) {
  const l = easeOut(seg(t, 0.8, 1.1));
  return (
    <Svg label="lock first, ask never. Blocks before a conflict exists." h={230}>
      <Cell x={25} y={60} w={230} h={30} label="the inventory row" stroke={l > 0.5 ? C.second : C.mocha} o={easeOut(seg(t, 0.2, 0.5))} />
      <Lock x={262} y={70} k={l} />
      <T x={25} y={118} s={12} f={C.second} o={easeOut(seg(t, 1.1, 1.4))}>
        FOR UPDATE: locked at once
      </T>
      <rect x={325} y={60} width={250} height={30} rx={4} fill="none" stroke={C.latte} strokeDasharray="5 4" opacity={0.6 * easeOut(seg(t, 2.0, 2.3))} />
      <T x={450} y={80} s={12} f={C.latte} a="middle" o={easeOut(seg(t, 2.0, 2.3))}>
        a second checkout?
      </T>
      <T x={450} y={118} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 2.4, 2.7))}>
        maybe never comes
      </T>
      <Row y={190} label="pays for protection" value="needed or not" valueColor={C.second} k={easeOut(seg(t, 3.4, 3.9))} />
    </Svg>
  );
}

// 3 · Optimistic. Read with no lock, a second reader slips in, write only if the version held; if it moved, loop back and redo.
export function RevealOptimistic({ t }: StepCtx) {
  const loop = easeInOut(seg(t, 3.0, 3.7));
  return (
    <Svg label="no lock, read freely. Write only if nobody beat you there." h={240}>
      <Lane y={70} name="T" o={easeOut(seg(t, 0.1, 0.4))} />
      <Ev x={70} y={70} w={140} label="read, version v" o={easeOut(seg(t, 0.4, 0.7))} />
      <T x={140} y={45} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 0.8, 1.1))}>
        no lock held
      </T>
      <circle cx={lerp(575, 250, easeInOut(seg(t, 1.0, 1.6)))} cy={112} r={5} fill={C.latte} opacity={easeOut(seg(t, 1.0, 1.2)) * (1 - easeOut(seg(t, 1.6, 1.9)))} />
      <Ev x={230} y={70} w={180} label="write if still v" stroke={C.focus} o={easeOut(seg(t, 1.8, 2.1))} />
      <Cross x={420} y={70} k={easeOut(seg(t, 2.6, 2.9))} />
      <T x={430} y={50} s={11} f={C.cherryText} o={easeOut(seg(t, 2.7, 3.0))}>
        it moved
      </T>
      <path d="M420 85 Q420 150 300 150 T140 85" fill="none" stroke={C.cherryText} strokeWidth={2} strokeDasharray="420" strokeDashoffset={420 * (1 - loop)} />
      <T x={300} y={170} s={11} f={C.cherryText} a="middle" o={easeOut(seg(t, 3.4, 3.7))}>
        start over
      </T>
      <Row y={215} label="the only guard" value="the version" valueColor={C.focus} k={easeOut(seg(t, 3.9, 4.4))} />
    </Svg>
  );
}

// 4 · Predict. A row of rows, each carrying a lock; only one ever collides. After the answer the unneeded locks fade.
export function PredictLockWorthIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const a = answer !== null ? easeOut(seg(s, 0.2, 0.7)) : 0;
  return (
    <Svg label="rare conflicts, a lock paid for anyway. Worth it?" h={200}>
      <Row y={40} label="collisions" value="rare" k={easeOut(seg(t, 0.1, 0.5))} />
      {Array.from({ length: 12 }, (_, i) => (
        <g key={i} opacity={easeOut(seg(t, 0.4 + i * 0.05, 0.7 + i * 0.05))}>
          <rect x={25 + i * 47} y={84} width={40} height={20} rx={3} fill={C.cocoa} stroke={i === 7 ? C.cherryText : C.mocha} strokeWidth={1.5} />
          <Lock x={37 + i * 47} y={68} k={i === 7 ? 1 : 1 - 0.75 * a} />
        </g>
      ))}
      <AnswerRow y={140} label="pay for a lock?" answer={answer} value="no, skip it" k={easeOut(seg(t, 1.4, 1.9))} />
      <Verdict answer={answer} text="the premium is paid on every row" />
    </Svg>
  );
}

// 5 · Low conflict. 400 rows, 8 workers, 300 increments each: the optimistic bar stops short of the 0.95× line.
export function RevealLowConflict({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.8, 1.8));
  const b = easeOut(seg(t, 2.0, 3.0));
  return (
    <Svg label="the identical workload, both ways. 400 rows." h={240}>
      <Row y={40} label="400 rows, 8 workers" value="300 increments each" k={easeOut(seg(t, 0.2, 0.7))} />
      <T x={25} y={80} s={13} f={C.latte} o={easeOut(seg(t, 0.6, 0.9))}>
        pessimistic
      </T>
      <rect x={25} y={88} width={400 * a} height={18} rx={3} fill={C.latte} />
      <T x={435} y={102} s={12} f={C.latte} o={seg(a, 0.7, 1)}>
        the baseline
      </T>
      <T x={25} y={136} s={13} f={C.crema} o={easeOut(seg(t, 1.8, 2.1))}>
        optimistic
      </T>
      <rect x={25} y={144} width={370 * b} height={18} rx={3} fill={C.focus} />
      <line x1={405} y1={136} x2={405} y2={170} stroke={C.focus} strokeWidth={1.5} strokeDasharray="3 3" opacity={seg(b, 0.6, 1)} />
      <T x={415} y={158} s={12} f={C.focus} o={seg(b, 0.7, 1)}>
        under 0.95×
      </T>
      <Row y={215} label="the winner" value="optimistic" valueColor={C.focus} k={easeOut(seg(t, 3.4, 3.9))} />
    </Svg>
  );
}

// 6 · High conflict. Two rows instead of 400: the optimistic bar overshoots 1.5× and the retry count climbs past 5,000.
export function RevealHighConflict({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.6, 1.4));
  const b = easeOut(seg(t, 1.6, 2.8));
  const r = Math.round(5000 * easeOut(seg(t, 1.8, 3.2)));
  return (
    <Svg label="the same workload, 2 rows instead. Reversed." h={250}>
      <Row y={40} label="8 workers, 2 rows" value="the same work" k={easeOut(seg(t, 0.2, 0.7))} />
      <T x={25} y={80} s={13} f={C.crema} o={easeOut(seg(t, 0.4, 0.7))}>
        pessimistic
      </T>
      <rect x={25} y={88} width={250 * a} height={18} rx={3} fill={C.focus} />
      <T x={285} y={102} s={12} f={C.focus} o={seg(a, 0.7, 1)}>
        the baseline
      </T>
      <T x={25} y={136} s={13} f={C.latte} o={easeOut(seg(t, 1.4, 1.7))}>
        optimistic
      </T>
      <rect x={25} y={144} width={375 * b} height={18} rx={3} fill={C.cherryText} />
      <path d={`M${405 + 10 * b} 145 l8 8 l-8 8`} fill="none" stroke={C.cherryText} strokeWidth={2} opacity={seg(b, 0.8, 1)} />
      <T x={430} y={158} s={12} f={C.cherryText} o={seg(b, 0.8, 1)}>
        over 1.5×
      </T>
      <Row y={205} label="optimistic retries" value={r >= 5000 ? 'over 5,000' : num(r)} valueColor={C.cherryText} k={easeOut(seg(t, 1.8, 2.2))} />
      <Row y={240} label="the winner" value="pessimistic" valueColor={C.focus} k={easeOut(seg(t, 3.5, 4.0))} />
    </Svg>
  );
}

// 7 · Why the crossover. A blocked session's wait keeps its place and then applies; each failed CAS attempt is crossed and redone.
export function RevealWhyCrossover({ t }: StepCtx) {
  const w = easeInOut(seg(t, 0.5, 1.6));
  return (
    <Svg label="a wait just queues. A failed retry is redone from scratch." h={220}>
      <Lane y={60} name="lock" o={easeOut(seg(t, 0.1, 0.4))} />
      <Lane y={145} name="CAS" o={easeOut(seg(t, 0.1, 0.4))} />
      <line x1={75} y1={60} x2={75 + 225 * w} y2={60} stroke={C.second} strokeWidth={3} strokeDasharray="6 4" />
      <Ev x={305} y={60} w={100} label="applies" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 1.7, 2.0))} />
      <T x={75} y={94} s={11} f={C.second} o={easeOut(seg(t, 1.0, 1.3))}>
        waiting, never wasted
      </T>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Ev x={70 + i * 125} y={145} w={110} label="read + write" stroke={i === 2 ? C.focus : C.cherryText} o={easeOut(seg(t, 2.2 + i * 0.5, 2.5 + i * 0.5))} />
          {i < 2 ? <Cross x={125 + i * 125} y={145} k={easeOut(seg(t, 2.5 + i * 0.5, 2.8 + i * 0.5))} /> : <MiniTick x={305} y={176} k={easeOut(seg(t, 3.4, 3.7))} />}
        </g>
      ))}
      <T x={75} y={185} s={11} f={C.cherryText} o={easeOut(seg(t, 2.9, 3.2))}>
        each failed try, thrown away
      </T>
    </Svg>
  );
}

// 8 · Validate at commit. A transaction's whole read set is bracketed and checked at once at commit; it passes.
export function RevealThirdFlavor({ t }: StepCtx) {
  const br = easeInOut(seg(t, 1.4, 2.2));
  return (
    <Svg label="one row's version, or a whole read set, at commit." h={240}>
      <Row y={40} label="validate at commit" value="the whole read set" k={easeOut(seg(t, 0.2, 0.7))} />
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={25 + i * 55} y={66} width={45} height={24} rx={3} fill={C.cocoa} stroke={C.latte} strokeWidth={1.5} opacity={easeOut(seg(t, 0.5 + i * 0.1, 0.8 + i * 0.1))} />
      ))}
      <path d={`M25 98 v8 h${330 * br} v-8`} fill="none" stroke={C.focus} strokeWidth={2} opacity={br > 0 ? 1 : 0} />
      <path d={`M190 106 v14 h${210 * easeOut(seg(t, 2.2, 2.6))}`} fill="none" stroke={C.focus} strokeWidth={2} opacity={br > 0.98 ? 1 : 0} />
      <Cell x={400} y={106} w={175} h={28} label="commit: check all" stroke={C.focus} o={easeOut(seg(t, 2.4, 2.7))} />
      <MiniTick x={555} y={96} k={easeOut(seg(t, 2.8, 3.1))} />
      <Row y={175} label="instead of" value="one row's version" k={easeOut(seg(t, 0.8, 1.2))} />
      <Row y={220} label="SSI" value="this, exactly" valueColor={C.focus} k={easeOut(seg(t, 3.4, 3.9))} />
    </Svg>
  );
}

// 9 · The same bet elsewhere. A table pointer swings to one new snapshot and the rival's is crossed; then a cluster rings up.
export function RevealSamePatternElsewhere({ t }: StepCtx) {
  const sw = easeOut(seg(t, 0.9, 1.5));
  const ring = easeOut(seg(t, 2.6, 3.4));
  const nodes = [200, 290, 380, 470];
  return (
    <Svg label="a table pointer, or a whole cluster — same bet." h={250}>
      <T x={25} y={40} s={13} f={C.crema} o={easeOut(seg(t, 0.2, 0.5))}>
        an object-store table
      </T>
      <Cell x={25} y={56} w={170} label="the table pointer" o={easeOut(seg(t, 0.3, 0.6))} />
      <line x1={195} y1={70} x2={lerp(195, 300, sw)} y2={lerp(70, 64, sw)} stroke={C.focus} strokeWidth={2} />
      <Cell x={300} y={50} w={180} label="new snapshot" stroke={C.focus} o={easeOut(seg(t, 0.5, 0.8))} />
      <Cell x={300} y={88} w={180} label="a rival's snapshot" o={easeOut(seg(t, 1.2, 1.5))} />
      <Cross x={500} y={102} k={easeOut(seg(t, 1.8, 2.1))} />
      <T x={25} y={150} s={13} f={C.crema} o={easeOut(seg(t, 2.3, 2.6))}>
        a distributed SQL cluster
      </T>
      <path d={`M${nodes[0]} 182 H${nodes[3]}`} stroke={C.second} strokeWidth={1.5} strokeDasharray="300" strokeDashoffset={300 * (1 - ring)} />
      {nodes.map((x, i) => (
        <circle key={x} cx={x} cy={182} r={13} fill={C.cocoa} stroke={C.second} strokeWidth={2} opacity={easeOut(seg(t, 2.5 + i * 0.1, 2.8 + i * 0.1))} />
      ))}
      <Row y={235} label="the same bet" value="a different altitude" valueColor={C.focus} k={easeOut(seg(t, 3.6, 4.1))} />
    </Svg>
  );
}

// 10 · Recap. Three rows, one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="block first, or bet first — conflict rate decides." h={200}>
      <Row y={40} label="pessimistic" value="blocks before it knows" valueColor={C.second} k={easeOut(seg(t, 0.4, 0.9))} />
      <Row y={100} label="optimistic" value="bets it won't need to" k={easeOut(seg(t, 1.6, 2.1))} />
      <Row y={160} label="the winner" value="set by conflict rate" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
    </Svg>
  );
}

// 11 · Prove. A day's traffic bar with one sharp spike; after the answer the calm stretch is coloured optimistic, the spike locked.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const a = answer !== null ? easeOut(seg(s, 0.2, 0.7)) : 0;
  const v = answer !== null ? easeOut(seg(s, 0.8, 1.2)) : 0;
  const k = easeOut(seg(t, 0.8, 1.4));
  return (
    <Svg label="light traffic, then a ninety-second spike. Which one?" h={220}>
      <Row y={40} label="most of the day" value="light traffic" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="one fixed strategy?" answer={answer} value="no, it flips" k={easeOut(seg(t, 0.4, 0.9))} />
      <path d={`M25 150 H400 L410 ${150 - 30 * k} L430 ${150 - 30 * k} L440 150 H575`} fill="none" stroke={C.latte} strokeWidth={2} opacity={easeOut(seg(t, 0.6, 0.9))} />
      <rect x={25} y={156} width={375 * a} height={6} fill={C.focus} />
      <rect x={400} y={156} width={40 * a} height={6} fill={C.second} />
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, v)} s={15} f={C.focus} a="middle" o={v}>
            optimistic all day, lock in the spike
          </T>
          <rect x={150} y={202} width={300 * v} height={3} fill={C.focus} />
        </>
      )}
    </Svg>
  );
}
