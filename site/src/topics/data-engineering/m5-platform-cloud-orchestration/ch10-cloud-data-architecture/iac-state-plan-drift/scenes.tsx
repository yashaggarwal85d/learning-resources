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
function Pip({ x, y, o = 1, f = C.second, s = 10 }: { x: number; y: number; o?: number; f?: string; s?: number }) {
  return <rect x={x - s / 2} y={y - s / 2} width={s} height={s} rx={2} fill={f} opacity={o} />;
}

function Hole({ x, y, w, h = 28, o = 1, stroke = C.mocha }: { x: number; y: number; w: number; h?: number; o?: number; stroke?: string }) {
  return <rect x={x} y={y} width={w} height={h} rx={4} fill="none" stroke={stroke} strokeWidth={1.5} strokeDasharray="4 3" opacity={o} />;
}

/** A fan line from (x1, y1) to (x2, y2), drawn by `k`, ending in a dot. */
function Fan({ x1, y1, x2, y2, k, f = C.crema }: { x1: number; y1: number; x2: number; y2: number; k: number; f?: string }) {
  if (k <= 0) return null;
  const x = lerp(x1, x2, k);
  const y = lerp(y1, y2, k);
  return (
    <g>
      <line x1={x1} y1={y1} x2={x} y2={y} stroke={f} strokeWidth={1.6} />
      <circle cx={x} cy={y} r={3} fill={f} />
    </g>
  );
}

/** A small chip that travels from (x1, y1) to (x2, y2) by `m`, gone once it lands. */
function Chip({ x1, y1, x2, y2, m, w, label, f = C.crema }: { x1: number; y1: number; x2: number; y2: number; m: number; w: number; label: string; f?: string }) {
  if (m <= 0 || m >= 1) return null;
  return <Cell x={lerp(x1, x2, m)} y={lerp(y1, y2, m)} w={w} h={24} label={label} stroke={f} f={f} />;
}

// Every behaviour here traces to Terraform's and OpenTofu's own documentation (SOURCES.md) or to examples.py's in-memory
// simulation of state, locking, plan, apply, drift, import and a policy gate.

// 0 · Two operators read the same state, public: false. Each computes a plan from it. A's lands first and adds versioning;
// eight seconds later B's lands and writes public: true over it. No error on either screen; B's plan was stale already.
export function RaceHook({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const ma = easeInOut(seg(t, 1.7, 2.2));
  const mb = easeInOut(seg(t, 2.9, 3.4));
  const bucket = mb >= 1 ? 'public: true' : ma >= 1 ? '+ versioning' : 'public: false';
  return (
    <Svg label="Two applies against the same unlocked state, eight seconds apart" h={250}>
      <Cell x={205} y={22} w={190} label="state: public: false" o={k(0)} />
      <Fan x1={260} y1={50} x2={110} y2={88} k={easeOut(seg(t, 0.3, 0.7))} />
      <Fan x1={340} y1={50} x2={490} y2={88} k={easeOut(seg(t, 0.4, 0.8))} />
      <Cell x={25} y={90} w={170} label="operator_a" o={k(0.3)} />
      <Cell x={405} y={90} w={170} label="operator_b" o={k(0.4)} />
      <Cell x={25} y={136} w={170} h={24} label="plan: + versioning" o={k(0.9) * (ma > 0 ? 0.4 : 1)} />
      <Cell x={405} y={136} w={170} h={24} label="plan: public: true" o={k(1.1) * (mb > 0 ? 0.4 : 1)} stroke={t > 4.1 ? C.cherryText : C.mocha} />
      <Chip x1={25} y1={136} x2={225} y2={202} m={ma} w={150} label="+ versioning" />
      <Chip x1={405} y1={136} x2={225} y2={202} m={mb} w={150} label="public: true" />
      <Cell x={225} y={200} w={150} label={bucket} o={k(1.4)} stroke={mb >= 1 ? C.cherryText : C.mocha} f={mb >= 1 ? C.cherryText : C.crema} />
      {t > 2.5 && (
        <T x={575} y={30} s={11} f={C.caramel} a="end" o={k(2.5)}>
          eight seconds later
        </T>
      )}
      {t > 3.5 && (
        <T x={25} y={232} s={11} f={C.cherryText} o={k(3.5)}>
          versioning: gone
        </T>
      )}
      <MiniTick x={170} y={101} k={k(3.7)} />
      <MiniTick x={550} y={101} k={k(3.8)} />
      {t > 4.1 && (
        <T x={575} y={184} s={11} f={C.cherryText} a="end" o={k(4.1)}>
          stale when computed
        </T>
      )}
    </Svg>
  );
}

// 1 · Predict. The configuration on the left, a plan in the middle, and two things it might be diffed against. Once
// answered, the plan's line runs to the state file; the live cloud is crossed off.
export function PredictDiffTarget({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="A plan compares desired configuration against something — but what?" h={250}>
      <Cell x={25} y={80} w={150} label="what you want" o={k(0)} />
      <Req x1={180} x2={232} y={94} k={k(0.2)} />
      <Cell x={240} y={80} w={110} label="plan" o={k(0.3)} stroke={C.caramel} f={C.caramel} />
      <Cell x={420} y={40} w={155} label="live cloud" o={k(0.5) * (v > 0 ? 1 - 0.5 * v : 1)} />
      <Cell x={420} y={120} w={155} label="state file" o={k(0.6)} stroke={v > 0.5 ? C.focus : C.mocha} f={v > 0.5 ? C.focus : C.crema} />
      {answer === null && t > 0.8 && (
        <T x={385} y={98} s={15} f={C.taupe} a="middle" o={k(0.8)}>
          ?
        </T>
      )}
      <Fan x1={355} y1={100} x2={414} y2={132} k={v} f={C.focus} />
      <Cross x={400} y={54} k={v} />
      <Verdict answer={answer} text="its own last-known record" y={210} />
    </Svg>
  );
}

// 2 · The state record: rows written at the last apply. Its line to the live cloud is dashed and crossed, never a live
// connection. Three plans in turn read from it and trust it; the cloud beside it moves on.
export function StateIsTheRecord({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const moved = easeInOut(seg(t, 3.6, 4.1));
  return (
    <Svg label="State as a record of the past, compared against a live system that may have moved on" h={250}>
      <rect x={25} y={30} width={200} height={96} rx={6} fill="none" stroke={C.caramel} strokeWidth={1.5} opacity={k(0)} />
      <T x={37} y={50} s={12} f={C.caramel} o={k(0)}>
        state: a record
      </T>
      {[0, 1, 2].map((j) => (
        <line key={j} x1={37} y1={70 + j * 18} x2={lerp(37, 200, easeOut(seg(t, 0.3 + j * 0.2, 0.6 + j * 0.2)))} y2={70 + j * 18} stroke={C.crema} strokeWidth={2} />
      ))}
      <Cell x={400} y={62} w={175} label="live cloud" o={k(0.9)} stroke={moved > 0.5 ? C.caramel : C.mocha} />
      <line x1={230} y1={76} x2={lerp(230, 392, k(1.1))} y2={76} stroke={C.mocha} strokeWidth={1.5} strokeDasharray="4 3" />
      <Cross x={312} y={76} k={k(1.5)} />
      {t > 1.6 && (
        <T x={312} y={104} s={11} f={C.cherryText} a="middle" o={k(1.6)}>
          not a live link
        </T>
      )}
      {['plan', 'plan', 'plan'].map((p, i) => {
        const d = 2.0 + i * 0.5;
        const x = 25 + i * 72;
        return (
          <g key={i}>
            <Fan x1={x + 32} y1={128} x2={x + 32} y2={168} k={easeOut(seg(t, d, d + 0.3))} f={C.caramel} />
            <Cell x={x} y={172} w={64} h={24} label={p} o={k(d + 0.2)} />
            <MiniTick x={x + 26} y={210} k={k(d + 0.4)} />
          </g>
        );
      })}
      {t > 3.4 && (
        <T x={250} y={190} s={11} f={C.focus} o={k(3.4)}>
          every plan trusts it
        </T>
      )}
      {t > 4.1 && (
        <T x={400} y={112} s={11} f={C.caramel} o={k(4.1)}>
          may have moved on
        </T>
      )}
    </Svg>
  );
}

// 3 · operator_a takes the lock. operator_b's request hits it and bounces: False, no queue, no retry. Only when A releases
// does the lock move, and B's request returns True.
export function LockingGuard({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const take = easeInOut(seg(t, 0.4, 0.9));
  const bounce = easeOut(seg(t, 1.8, 2.2));
  const release = easeInOut(seg(t, 3.0, 3.5));
  return (
    <Svg label="A second lock request failing outright while the first holder still holds it" h={250}>
      <Cell x={225} y={100} w={150} label="state file" o={k(0)} />
      <Cell x={25} y={100} w={150} label="operator_a" o={k(0.1)} />
      <Cell x={425} y={100} w={150} label="operator_b" o={k(0.2)} />
      <Req x1={180} x2={222} y={114} k={easeInOut(seg(t, 0.2, 0.5))} f={C.second} />
      <Lock x={lerp(160, 292, take)} y={84} k={k(0.3) * (1 - release)} f={C.second} />
      {release >= 1 && <Lock x={292} y={84} k={k(3.8)} f={C.focus} />}
      <Req x1={420} x2={382} y={114} k={easeInOut(seg(t, 1.3, 1.8))} back={bounce} f={C.cherryText} />
      {t > 2.0 && (
        <T x={420} y={160} s={11} f={C.cherryText} o={k(2.0)}>
          acquire_lock: False
        </T>
      )}
      {t > 2.4 && (
        <T x={420} y={182} s={11} f={C.taupe} o={k(2.4)}>
          no queue, no retry
        </T>
      )}
      {t > 3.0 && (
        <T x={25} y={90} s={11} f={C.taupe} o={k(3.0)}>
          released
        </T>
      )}
      {t > 3.8 && (
        <T x={300} y={222} s={12} f={C.focus} a="middle" o={k(3.8)}>
          then B: True
        </T>
      )}
    </Svg>
  );
}

// 4 · The plan opens as a dashed, reviewable box holding its one change, and a review tick lands. The remote system and the
// state beside it sit untouched. Only apply's line writes to both at once.
export function PlanThenApply({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const applyK = easeOut(seg(t, 2.5, 3.0));
  const done = applyK >= 1;
  return (
    <Svg label="A reviewable plan, then the separate step that actually commits it" h={250}>
      <Hole x={25} y={40} w={220} h={80} o={k(0)} stroke={C.caramel} />
      <T x={37} y={60} s={12} f={C.caramel} o={k(0)}>
        plan
      </T>
      {t > 0.5 && (
        <T x={37} y={94} s={12} f={C.crema} o={k(0.5)}>
          + versioning: true
        </T>
      )}
      <MiniTick x={215} y={88} k={k(1.1)} />
      {t > 1.3 && (
        <T x={25} y={146} s={11} f={C.focus} o={k(1.3)}>
          reviewed here
        </T>
      )}
      <Cell x={400} y={40} w={175} label={done ? 'remote: versioning' : 'remote'} o={k(0.2)} stroke={done ? C.focus : C.mocha} />
      <Cell x={400} y={100} w={175} label={done ? 'state: versioning' : 'state'} o={k(0.3)} stroke={done ? C.focus : C.mocha} />
      {t > 1.7 && t < 2.5 && (
        <T x={400} y={160} s={11} f={C.taupe} o={k(1.7)}>
          nothing changed yet
        </T>
      )}
      <Cell x={25} y={190} w={140} label="apply" o={k(2.2)} stroke={C.second} f={C.second} />
      <Fan x1={170} y1={198} x2={395} y2={56} k={applyK} f={C.second} />
      <Fan x1={170} y1={208} x2={395} y2={116} k={applyK} f={C.second} />
      {t > 3.3 && (
        <T x={575} y={222} s={11} f={C.second} a="end" o={k(3.3)}>
          the only step that touches anything
        </T>
      )}
    </Svg>
  );
}

// 5 · State and the live rule both read port 443. A console click flips the live one to 8080; the plan's diff line shows
// the drift. Then import runs the other way: state adopts 8080, nothing is torn down.
export function DriftAndImport({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const click = easeInOut(seg(t, 0.5, 1.0));
  const live = t > 1.0 ? 'live: port 8080' : 'live: port 443';
  const imp = easeInOut(seg(t, 2.8, 3.3));
  return (
    <Svg label="A console click causing drift, then import closing the same gap" h={250}>
      <Cell x={25} y={60} w={180} label={imp >= 1 ? 'state: port 8080' : 'state: port 443'} o={k(0)} stroke={imp >= 1 ? C.focus : C.mocha} />
      <Cell x={395} y={60} w={180} label={live} o={k(0.1)} stroke={t > 1.0 ? C.caramel : C.mocha} />
      <path d={`M${lerp(575, 520, click)} ${lerp(140, 96, click)} l-6 14 l5 -3 l5 6 l3 -2 l-5 -6 l6 -1 z`} fill={C.crema} opacity={click > 0 && t < 1.6 ? 1 : 0} />
      {t > 0.6 && t < 2.6 && (
        <T x={395} y={128} s={11} f={C.taupe} o={k(0.6)}>
          a console click
        </T>
      )}
      <line x1={210} y1={74} x2={lerp(210, 390, easeInOut(seg(t, 1.5, 2.0)))} y2={74} stroke={C.cherryText} strokeWidth={1.5} strokeDasharray="4 3" opacity={imp > 0 ? 1 - imp : 1} />
      {t > 2.0 && imp < 1 && (
        <T x={300} y={48} s={12} f={C.cherryText} a="middle" o={k(2.0) * (1 - imp)}>
          drift: 443 vs 8080
        </T>
      )}
      <Back x1={390} x2={214} y={104} k={imp} f={C.focus} />
      {t > 3.3 && (
        <T x={300} y={48} s={12} f={C.focus} a="middle" o={k(3.3)}>
          import: adopt it
        </T>
      )}
      {t > 3.7 && (
        <T x={25} y={170} s={12} f={C.focus} o={k(3.7)}>
          nothing torn down, nothing recreated
        </T>
      )}
      {t > 4.1 && (
        <T x={25} y={210} s={11} f={C.taupe} o={k(4.1)}>
          one gap: drift notices it, import closes it
        </T>
      )}
    </Svg>
  );
}
/** A pointer from (x1, y) back toward x2 < x1, drawn by `k`. */
function Back({ x1, x2, y, k, f = C.crema }: { x1: number; x2: number; y: number; k: number; f?: string }) {
  const x = lerp(x1, x2, k);
  return (
    <g opacity={k > 0 ? 1 : 0}>
      <line x1={x1} y1={y} x2={x} y2={y} stroke={f} strokeWidth={1.8} />
      <path d={`M${x} ${y} l8 -5 v10 z`} fill={f} />
    </g>
  );
}

// 6 · A bucket, its catalog entry and its IAM role; a module boundary draws round all three: one unit, one review. Then
// the boundary splits into three, the role changes on its own, and the bucket it protects goes unreviewed.
export function ModuleBoundary({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const one = easeInOut(seg(t, 1.0, 1.6));
  const split = easeInOut(seg(t, 2.6, 3.0));
  const parts = ['bucket', 'catalog entry', 'IAM role'];
  return (
    <Svg label="One reviewable module, three parts shown one at a time" h={250}>
      {parts.map((p, i) => {
        const role = i === 2 && t > 3.0;
        const bucket = i === 0 && t > 3.4;
        return (
          <Cell
            key={p}
            x={40 + i * 180}
            y={80}
            w={160}
            label={role ? 'IAM role: changed' : p}
            o={k(i * 0.25)}
            stroke={role ? C.caramel : bucket ? C.cherryText : C.mocha}
            f={role ? C.caramel : C.crema}
          />
        );
      })}
      <rect x={30} y={66} width={540} height={56} rx={8} fill="none" stroke={C.focus} strokeWidth={1.8} strokeDasharray="1200" strokeDashoffset={1200 * (1 - one)} opacity={1 - split} />
      {t > 1.6 && split < 1 && (
        <T x={300} y={52} s={12} f={C.focus} a="middle" o={k(1.6) * (1 - split)}>
          one module, one review
        </T>
      )}
      {split > 0 && [0, 1, 2].map((i) => <Hole key={i} x={32 + i * 180} y={72} w={176} h={44} o={split} />)}
      {t > 3.0 && (
        <T x={300} y={52} s={12} f={C.caramel} a="middle" o={k(3.0)}>
          three units, three reviews
        </T>
      )}
      {t > 3.4 && (
        <T x={40} y={150} s={11} f={C.cherryText} o={k(3.4)}>
          bucket: never reviewed
        </T>
      )}
      {t > 3.9 && (
        <T x={300} y={210} s={12} f={C.crema} a="middle" o={k(3.9)}>
          a decision, not a requirement
        </T>
      )}
    </Svg>
  );
}

// 7 · Two layers on one timeline: what the tool does, and the license under it. At 2023 the behaviour line runs on
// unchanged; the license line turns from open source to the Business Source License, and OpenTofu forks off it.
export function LicenseFork({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const run = easeInOut(seg(t, 0.2, 2.0));
  const xr = lerp(120, 575, run);
  const fork = easeInOut(seg(t, 3.0, 3.6));
  return (
    <Svg label="A license change in 2023, and the fork that followed" h={250}>
      <T x={25} y={74} s={11} f={C.taupe} o={k(0)}>
        behaviour
      </T>
      <T x={25} y={154} s={11} f={C.taupe} o={k(0)}>
        license
      </T>
      <line x1={120} y1={70} x2={xr} y2={70} stroke={C.crema} strokeWidth={2} />
      <line x1={120} y1={150} x2={Math.min(xr, 300)} y2={150} stroke={C.focus} strokeWidth={2} />
      {xr > 300 && <line x1={300} y1={150} x2={xr} y2={150} stroke={C.caramel} strokeWidth={2} />}
      <line x1={300} y1={44} x2={300} y2={176} stroke={C.mocha} strokeWidth={1.2} strokeDasharray="3 3" opacity={k(1.0)} />
      <T x={300} y={36} s={12} f={C.crema} a="middle" o={k(1.0)}>
        2023
      </T>
      {t > 0.6 && (
        <T x={130} y={140} s={11} f={C.focus} o={k(0.6)}>
          open source
        </T>
      )}
      {t > 1.5 && (
        <T x={312} y={140} s={11} f={C.caramel} o={k(1.5)}>
          Business Source License
        </T>
      )}
      {t > 2.1 && (
        <T x={312} y={60} s={11} f={C.crema} o={k(2.1)}>
          unchanged that day
        </T>
      )}
      <MiniTick x={472} y={54} k={k(2.3)} />
      <path d={`M300 150 C 330 150, 340 ${lerp(150, 206, fork)}, ${lerp(300, 410, fork)} ${lerp(150, 206, fork)}`} fill="none" stroke={C.second} strokeWidth={2} opacity={fork > 0 ? 1 : 0} />
      <Cell x={415} y={192} w={160} label="OpenTofu" o={k(3.6)} stroke={C.second} f={C.second} />
      {t > 4.0 && (
        <T x={575} y={240} s={11} f={C.second} a="end" o={k(4.0)}>
          under the Linux Foundation
        </T>
      )}
    </Svg>
  );
}

// 8 · Three lines of real code, a loop with a conditional, stamping out buckets one by one. Then the cost: an imperative
// call arcs round the plan straight to the cloud, and the plan is crossed off as the whole story.
export function GeneralPurposeIac({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const arc = easeInOut(seg(t, 2.8, 3.5));
  return (
    <Svg label="Real language power, and the real risk that comes with it" h={250}>
      <T x={25} y={40} s={12} f={C.crema} o={k(0)}>
        for env in envs:
      </T>
      <T x={45} y={62} s={12} f={C.crema} o={k(0.15)}>
        if env == prod:
      </T>
      <T x={65} y={84} s={12} f={C.crema} o={k(0.3)}>
        bucket(env)
      </T>
      {[0, 1, 2, 3].map((j) => (
        <Pip key={j} x={330 + j * 30} y={58} s={14} f={C.second} o={k(0.6 + j * 0.2)} />
      ))}
      <Pip x={450} y={58} s={14} f={C.caramel} o={k(1.5)} />
      {t > 1.9 && (
        <T x={330} y={96} s={11} f={C.second} o={k(1.9)}>
          real loops, real conditionals
        </T>
      )}
      <Req x1={180} x2={219} y={164} k={k(2.2)} />
      <Cell x={225} y={150} w={120} label="plan" o={k(2.2)} stroke={C.caramel} f={C.caramel} />
      <Req x1={350} x2={419} y={164} k={k(2.4)} />
      <Cell x={425} y={150} w={150} label="cloud" o={k(2.4)} />
      <path d="M120 100 C 120 230, 480 230, 500 182" fill="none" stroke={C.cherryText} strokeWidth={1.8} strokeDasharray="520" strokeDashoffset={520 * (1 - arc)} />
      <Cross x={356} y={140} k={k(3.5)} />
      {t > 3.6 && (
        <T x={300} y={242} s={11} f={C.cherryText} a="middle" o={k(3.6)}>
          imperative logic, round the plan
        </T>
      )}
    </Svg>
  );
}

// 9 · A plan holding public_bucket_policy runs into the gate and stops dead: allowed: False, apply never reached. The same
// plan without it finds the gate open and goes straight through to apply.
export function PolicyGate({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const a = easeOut(seg(t, 0.3, 1.0));
  const open = easeInOut(seg(t, 2.4, 2.8));
  const b = easeInOut(seg(t, 2.8, 3.5));
  return (
    <Svg label="A plan containing a forbidden resource, blocked before apply can run" h={250}>
      <Cell x={lerp(25, 104, a)} y={70} w={190} label="public_bucket_policy" o={k(0)} stroke={a >= 1 ? C.cherryText : C.mocha} />
      <rect x={300} y={52} width={8} height={64} rx={2} fill={C.crema} opacity={k(0)} />
      {t > 1.0 && <Cross x={330} y={84} k={k(1.0)} />}
      {t > 1.2 && (
        <T x={104} y={128} s={12} f={C.cherryText} o={k(1.2)}>
          allowed: False
        </T>
      )}
      <Hole x={420} y={70} w={155} o={k(0.2)} />
      {t > 1.6 && (
        <T x={497} y={88} s={11} f={C.taupe} a="middle" o={k(1.6)}>
          never reached
        </T>
      )}
      <rect x={300} y={lerp(150, 110, open)} width={8} height={64} rx={2} fill={C.crema} opacity={k(1.8) * (1 - open)} />
      <Cell x={b > 0 ? lerp(104, 425, b) : 104} y={166} w={150} label="bucket_policy" o={k(1.9)} stroke={b >= 1 ? C.focus : C.mocha} />
      {t > 3.6 && (
        <T x={425} y={214} s={12} f={C.focus} o={k(3.6)}>
          allowed: True
        </T>
      )}
      <MiniTick x={552} y={210} k={k(3.7)} />
      {t > 4.0 && (
        <T x={25} y={242} s={11} f={C.crema} o={k(4.0)}>
          not a comment thread: a block
        </T>
      )}
    </Svg>
  );
}

// 10 · Recap. Seven ideas as seven chips; state lights first, it can go stale; the lock guards it; the policy gate lights
// last, the one that reads the plan itself. One story underneath: trusting a record instead of reality.
export function Recap({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const ideas = [
    { x: 25, y: 50, w: 120, label: 'state' },
    { x: 165, y: 50, w: 120, label: 'lock' },
    { x: 305, y: 50, w: 120, label: 'plan' },
    { x: 445, y: 50, w: 120, label: 'apply' },
    { x: 25, y: 130, w: 120, label: 'drift' },
    { x: 165, y: 130, w: 120, label: 'import' },
    { x: 305, y: 130, w: 150, label: 'policy gate' },
  ];
  const lit = [2.0, 2.5, 99, 99, 99, 99, 3.0];
  return (
    <Svg label="The three-part recap of this topic's point" h={250}>
      {ideas.map((c, i) => {
        const on = t > lit[i];
        const col = i === 0 ? C.caramel : C.focus;
        return <Cell key={c.label} x={c.x} y={c.y} w={c.w} label={c.label} o={k(0.1 + i * 0.22)} stroke={on ? col : C.mocha} f={on ? col : C.crema} />;
      })}
      {t > 2.1 && (
        <T x={25} y={100} s={11} f={C.caramel} o={k(2.1)}>
          can go stale
        </T>
      )}
      {t > 2.6 && (
        <T x={165} y={100} s={11} f={C.focus} o={k(2.6)}>
          guards it
        </T>
      )}
      {t > 3.1 && (
        <T x={305} y={180} s={11} f={C.focus} o={k(3.1)}>
          reads the plan itself
        </T>
      )}
      {t > 3.6 && (
        <T x={300} y={230} s={13} f={C.crema} a="middle" o={k(3.6)}>
          trusting a record instead of reality
        </T>
      )}
    </Svg>
  );
}

// 11 · Prove it. A bad plan, public: true, and four mechanisms between it and apply. Once answered, only the policy gate
// reads it and refuses it; the lock dims, it only ever stopped collisions.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const mech = ['state locking', 'policy gate', 'OpenTofu', 'import first'];
  return (
    <Svg label="A plan that made a bucket public, shipped with no human review" h={250}>
      <Cell x={25} y={94} w={170} label="plan: public: true" o={k(0)} stroke={C.cherryText} f={C.cherryText} />
      {mech.map((m, i) => {
        const gate = i === 1;
        return (
          <Cell
            key={m}
            x={215}
            y={34 + i * 40}
            w={160}
            label={m}
            o={k(0.3 + i * 0.15) * (v > 0 && !gate ? 1 - 0.5 * v : 1)}
            stroke={gate && v > 0.5 ? C.focus : C.mocha}
            f={gate && v > 0.5 ? C.focus : C.crema}
          />
        );
      })}
      <Cell x={445} y={94} w={130} label="apply" o={k(1.0)} />
      <Fan x1={190} y1={106} x2={210} y2={88} k={v} f={C.focus} />
      <Cross x={410} y={88} k={v} />
      {v > 0.5 && (
        <T x={215} y={208} s={11} f={C.taupe} o={v}>
          a lock only stops collisions
        </T>
      )}
      <Verdict answer={answer} text="the policy gate reads the plan" y={238} />
    </Svg>
  );
}
