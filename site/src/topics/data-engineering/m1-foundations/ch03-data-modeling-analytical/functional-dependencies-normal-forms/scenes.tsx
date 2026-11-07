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
const MATCHED = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

/** The worked example's four attributes, as chips across the frame. */
const ATTR = ['order_id', 'customer_id', 'amount', 'customer_email'];
const AX = [25, 160, 305, 430];
const AW = [120, 130, 110, 145];
const cx = (i: number) => AX[i] + AW[i] / 2;

/** The attribute chips at `y`; `lit(i)` (0..1) fills a chip in `f`, `ring(i)` outlines it in `rf`. */
function Chips({ y, k, lit, f = C.focus, ring, rf = C.cherryText }: { y: number; k: number; lit: (i: number) => number; f?: string; ring?: (i: number) => number; rf?: string }) {
  return (
    <g opacity={k}>
      {ATTR.map((a, i) => {
        const l = lit(i);
        const r = ring ? ring(i) : 0;
        return (
          <g key={a}>
            <rect x={AX[i]} y={y} width={AW[i]} height={32} rx={6} fill={C.cocoa} stroke={r > 0 ? rf : C.mocha} strokeWidth={r > 0 ? 2 : 1.5} />
            <rect x={AX[i]} y={y} width={AW[i]} height={32} rx={6} fill={f} opacity={0.3 * Math.min(l, 1)} />
            <T x={cx(i)} y={y + 21} s={12} f={l > 0.5 ? C.crema : C.latte} a="middle">
              {a}
            </T>
          </g>
        );
      })}
    </g>
  );
}

/** An arc from chip `a` to chip `b`, bulging above (`up`) or below the chip row edge at `y`, drawn in by `k`. */
function Arc({ a, b, y, up = true, h = 22, k, f = C.focus }: { a: number; b: number; y: number; up?: boolean; h?: number; k: number; f?: string }) {
  const x1 = cx(a);
  const x2 = cx(b);
  const my = up ? y - h : y + h;
  return (
    <g>
      <path d={`M${x1} ${y} Q ${(x1 + x2) / 2} ${my} ${x2} ${y}`} fill="none" stroke={f} strokeWidth={2} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - k} />
      {k > 0.97 && <circle cx={x2} cy={y} r={3.5} fill={f} />}
    </g>
  );
}

/** The update-anomaly picture: one customer row (normalized) beside the same customer's five order rows
 * (denormalized), each carrying the email. `n` is how far the normalized update has gone, `d(i)` each denormalized
 * row's; `miss` leaves the last row behind on the old email. */
function Anomaly({ t, n, d, miss }: { t: number; n: number; d: (i: number) => number; miss: boolean }) {
  const k = easeOut(seg(t, 0.1, 0.5));
  return (
    <g opacity={k}>
      <T x={25} y={40} s={13} f={C.latte}>
        normalized
      </T>
      <rect x={25} y={60} width={110} height={24} rx={3} fill={C.cocoa} stroke={C.mocha} />
      <rect x={140} y={60} width={130} height={24} rx={3} fill={C.cocoa} stroke={n > 0 ? C.focus : C.mocha} strokeWidth={1 + 1.5 * n} />
      <T x={205} y={77} s={11} f={n > 0.5 ? C.focus : C.crema} a="middle">
        email
      </T>
      <T x={310} y={40} s={13} f={C.latte}>
        denormalized
      </T>
      {[0, 1, 2, 3, 4].map((i) => {
        const v = d(i);
        const missed = miss && i === 4;
        return (
          <g key={i}>
            <rect x={310} y={60 + i * 30} width={120} height={24} rx={3} fill={C.cocoa} stroke={C.mocha} />
            <rect
              x={435}
              y={60 + i * 30}
              width={140}
              height={24}
              rx={3}
              fill={C.cocoa}
              stroke={missed && v > 0 ? C.cherryText : v > 0 && !missed ? C.focus : C.mocha}
              strokeWidth={missed && v > 0 ? 2 : v > 0 ? 1 + 1.5 * v : 1}
            />
            <T x={505} y={77 + i * 30} s={11} f={missed && v > 0 ? C.cherryText : C.crema} a="middle">
              email
            </T>
          </g>
        );
      })}
    </g>
  );
}

// 1 · Hook. The same email change: one cell on the normalized side, five, one by one, on the denormalized side.
export function Hook({ t }: StepCtx) {
  const n = easeOut(seg(t, 0.7, 1.1));
  const a = easeOut(seg(t, 1.1, 1.5));
  const b = easeOut(seg(t, 3.0, 3.4));
  return (
    <Svg label="same data, two schemas: one update vs. several" h={250}>
      <Anomaly t={t} n={n} d={(i) => easeOut(seg(t, 1.5 + i * 0.3, 1.8 + i * 0.3))} miss={false} />
      <T x={25} y={lerp(122, 116, a)} s={13} f={C.focus} o={a}>
        one row updated
      </T>
      <T x={310} y={lerp(238, 232, b)} s={13} f={C.cherryText} o={b}>
        five rows updated
      </T>
    </Svg>
  );
}

// 2 · Predict: does splitting always cost a join? One table splits in two, a dashed join waiting between them; then
// the question.
export function PredictNormalizingCostsJoin({ t, answer }: StepCtx) {
  const sp = easeInOut(seg(t, 0.4, 1.0));
  return (
    <Svg label="does splitting always cost a join later" h={210}>
      <Row y={40} label="normalize" value="always a join cost?" k={easeOut(seg(t, 0.1, 0.5))} />
      <rect x={lerp(150, 25, sp)} y={64} width={150} height={32} rx={5} fill={C.cocoa} stroke={C.mocha} opacity={easeOut(seg(t, 0.2, 0.4))} />
      <rect x={lerp(300, 425, sp)} y={64} width={150} height={32} rx={5} fill={C.cocoa} stroke={C.mocha} opacity={easeOut(seg(t, 0.2, 0.4))} />
      <line x1={175} y1={80} x2={425} y2={80} stroke={C.latte} strokeDasharray="5 5" opacity={easeOut(seg(t, 1.0, 1.3))} />
      <AnswerRow y={140} label="depends on" answer={answer} value="how it's queried" k={easeOut(seg(t, 1.3, 1.8))} />
      <Verdict answer={answer} text="a join only costs what the queries need" />
    </Svg>
  );
}

// 3 · The rule. The four attributes; order_id's arrows reach customer_id and amount; customer_id's reaches customer_email.
export function RevealFunctionalDependency({ t }: StepCtx) {
  const a = easeInOut(seg(t, 1.6, 2.4));
  const b = easeInOut(seg(t, 2.8, 3.6));
  return (
    <Svg label="X determines Y: one X value, one Y value" h={210}>
      <Row y={40} label="order_id →" value="customer_id, amount" k={easeOut(seg(t, 1.4, 1.9))} />
      <Row y={85} label="customer_id →" value="customer_email" k={easeOut(seg(t, 2.6, 3.1))} />
      <Chips y={125} k={easeOut(seg(t, 0.2, 0.7))} lit={(i) => (i === 0 ? a : i === 1 ? b : 0)} />
      <Arc a={0} b={1} y={125} h={18} k={a} />
      <Arc a={0} b={2} y={125} h={26} k={a} />
      <Arc a={1} b={3} y={157} up={false} h={26} k={b} />
    </Svg>
  );
}

// 4 · Closure. Start from order_id; its rule fires and lights customer_id and amount; theirs fires and lights
// customer_email; then nothing new lights.
export function RevealClosureComputation({ t }: StepCtx) {
  const f1 = easeInOut(seg(t, 1.0, 1.6));
  const f2 = easeInOut(seg(t, 2.2, 2.8));
  const done = easeOut(seg(t, 3.2, 3.6));
  return (
    <Svg label="each firing lights up new attributes" h={250}>
      <Row y={40} label="start" value="order_id" k={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={85} label="fires order_id →" value="+ customer_id, amount" k={easeOut(seg(t, 1.0, 1.5))} />
      <Row y={130} label="fires customer_id →" value="+ customer_email" k={easeOut(seg(t, 2.2, 2.7))} />
      <Chips y={170} k={easeOut(seg(t, 0.1, 0.4))} lit={(i) => (i === 0 ? easeOut(seg(t, 0.3, 0.7)) : i === 3 ? f2 : f1)} />
      <Arc a={0} b={1} y={170} h={14} k={f1} />
      <Arc a={0} b={2} y={170} h={20} k={f1} />
      <Arc a={1} b={3} y={202} up={false} h={18} k={f2} />
      <T x={300} y={242} s={12} f={C.latte} a="middle" o={done}>
        nothing new lights up
      </T>
    </Svg>
  );
}

// 5 · Candidate key. Every attribute lit; a bracket spans the whole closure; then order_id is filled in as the key.
export function RevealCandidateKey({ t }: StepCtx) {
  const br = easeInOut(seg(t, 0.6, 1.4));
  const key = easeOut(seg(t, 2.2, 2.7));
  return (
    <Svg label="order_id's closure reaches everything" h={220}>
      <Row y={40} label="order_id's closure" value="every attribute" k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={85} label="candidate key" value="order_id alone" valueColor={C.focus} k={easeOut(seg(t, 2.0, 2.5))} />
      <Chips y={120} k={easeOut(seg(t, 0.1, 0.4))} lit={(i) => (i === 0 ? 1 + 2 * key : 1)} />
      <rect x={25} y={120} width={120} height={32} rx={6} fill="none" stroke={C.focus} strokeWidth={3} opacity={key} />
      <path d={`M25 166 l0 8 l${550 * br} 0 l0 ${-8 * (br > 0.98 ? 1 : 0)}`} fill="none" stroke={C.focus} strokeWidth={2} />
      <T x={300} y={200} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 1.3, 1.7))}>
        all four, from order_id
      </T>
    </Svg>
  );
}

// 6 · Predict: is customer_id a key too? Its arrow reaches customer_email; then the question.
export function PredictCustomerIdKey({ t, answer }: StepCtx) {
  const a = easeInOut(seg(t, 0.5, 1.1));
  return (
    <Svg label="does customer_id qualify too" h={210}>
      <Row y={40} label="customer_id →" value="customer_email" k={easeOut(seg(t, 0.1, 0.5))} />
      <Chips y={62} k={easeOut(seg(t, 0.2, 0.5))} lit={(i) => (i === 1 ? 1 : i === 3 ? a : 0)} />
      <Arc a={1} b={3} y={94} up={false} h={16} k={a} />
      <AnswerRow y={140} label="a candidate key too" answer={answer} value="no" f={C.cherryText} k={easeOut(seg(t, 1.3, 1.8))} />
      <Verdict answer={answer} text="its closure can't reach every column" f={C.cherryText} />
    </Svg>
  );
}

// 7 · Why not. customer_id fires and lights customer_email; then nothing else fires: order_id and amount stay dark
// and are ringed.
export function RevealWhyNotCandidateKey({ t }: StepCtx) {
  const a = easeInOut(seg(t, 0.6, 1.2));
  const scan = seg(t, 1.5, 2.6);
  const r = easeOut(seg(t, 2.7, 3.1));
  return (
    <Svg label="its closure stops short of the whole relation" h={210}>
      <Row y={40} label="its closure" value="itself, customer_email" k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={85} label="never reaches" value="order_id, amount" valueColor={C.cherryText} k={easeOut(seg(t, 2.8, 3.3))} />
      <Chips y={125} k={easeOut(seg(t, 0.1, 0.4))} lit={(i) => (i === 1 ? 1 : i === 3 ? a : 0)} ring={(i) => (i === 0 || i === 2 ? r : 0)} />
      <Arc a={1} b={3} y={157} up={false} h={18} k={a} />
      {scan > 0 && scan < 1 && <rect x={25 + 520 * scan} y={121} width={30} height={40} rx={4} fill="none" stroke={C.latte} strokeDasharray="3 3" />}
    </Svg>
  );
}

// 8 · The first three rungs. Each lands with its guarantee and is underlined as it's climbed.
export function RevealFirstToThird({ t }: StepCtx) {
  const rows: [string, string][] = [
    ['first', 'atomic values, no repeats'],
    ['second', 'depends on the whole key'],
    ['third', 'no transitive dependence'],
  ];
  return (
    <Svg label="each form adds one more guarantee" h={220}>
      {rows.map(([label, value], i) => {
        const k = easeOut(seg(t, 0.4 + i * 1.2, 0.9 + i * 1.2));
        const u = easeInOut(seg(t, 0.8 + i * 1.2, 1.4 + i * 1.2));
        return (
          <g key={label}>
            <Row y={50 + i * 65} label={label} value={value} k={k} />
            <rect x={25} y={64 + i * 65} width={550 * u} height={2} fill={i === 2 ? C.focus : C.mocha} />
          </g>
        );
      })}
    </Svg>
  );
}

// 9 · BCNF. A determinant that points at an attribute is allowed by the third rung; the next rung demands that
// determinant be a full key, and it is outlined as one.
export function RevealBCNF({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.3, 0.7));
  const ar = easeInOut(seg(t, 0.7, 1.3));
  const key = easeOut(seg(t, 2.4, 3.0));
  return (
    <Svg label="every determinant must be a full candidate key" h={210}>
      <Row y={40} label="third form allows" value="a weak determinant" k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={85} label="stricter form needs" value="determinant is a key" valueColor={C.focus} k={easeOut(seg(t, 2.2, 2.7))} />
      <g opacity={k}>
        <rect x={25} y={130} width={170} height={36} rx={6} fill={C.cocoa} stroke={key > 0 ? C.focus : C.mocha} strokeWidth={1.5 + 1.5 * key} />
        <T x={110} y={153} s={13} f={C.crema} a="middle">
          determinant
        </T>
        <rect x={405} y={130} width={170} height={36} rx={6} fill={C.cocoa} stroke={C.mocha} />
        <T x={490} y={153} s={13} f={C.crema} a="middle">
          attribute
        </T>
      </g>
      <line x1={195} y1={148} x2={195 + 205 * ar} y2={148} stroke={C.latte} strokeWidth={2} />
      <T x={110} y={lerp(198, 192, key)} s={12} f={C.focus} a="middle" o={key}>
        must be a key
      </T>
    </Svg>
  );
}

// 10 · Multivalued dependency. One value picks out one value; then one value picks out a whole independent set.
export function RevealFourthNormalForm({ t }: StepCtx) {
  const a = easeInOut(seg(t, 0.4, 1.0));
  const b = (i: number) => easeInOut(seg(t, 2.2 + i * 0.25, 2.8 + i * 0.25));
  const chip = (x: number, y: number, l: string, o: number, f: string = C.mocha) => (
    <g opacity={o}>
      <rect x={x} y={y} width={70} height={28} rx={5} fill={C.cocoa} stroke={f} />
      <T x={x + 35} y={y + 19} s={12} f={C.crema} a="middle">
        {l}
      </T>
    </g>
  );
  return (
    <Svg label="one value, many facts, not one" h={230}>
      <Row y={40} label="functional dependency" value="one value → one value" k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={85} label="multivalued dependency" value="one value → many facts" valueColor={C.second} k={easeOut(seg(t, 2.0, 2.5))} />
      {chip(25, 150, 'X', easeOut(seg(t, 0.2, 0.5)))}
      <line x1={95} y1={164} x2={95 + 60 * a} y2={164} stroke={C.latte} strokeWidth={2} />
      {chip(155, 150, 'Y', a)}
      {chip(320, 150, 'X', easeOut(seg(t, 2.0, 2.3)), C.second)}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <path d={`M390 164 C 430 164 440 ${120 + i * 40} 480 ${120 + i * 40}`} fill="none" stroke={C.second} strokeWidth={2} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - b(i)} />
          {chip(480, 106 + i * 40, `Y${i + 1}`, b(i), C.second)}
        </g>
      ))}
    </Svg>
  );
}

// 11 · Lossless. A table splits along a real dependency, the shared customer_id column going to both halves; joined
// back, the pieces close up into exactly the original, and a tick lands.
export function RevealLosslessDecomposition({ t }: StepCtx) {
  const sp = easeInOut(seg(t, 0.6, 1.4)) * (1 - easeInOut(seg(t, 2.4, 3.2)));
  const tick = easeOut(seg(t, 3.3, 3.7));
  return (
    <Svg label="split on a real dependency, join back loses nothing" h={220}>
      <Row y={40} label="split on a real FD" value="joined back exactly" k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={85} label="every decomposition" value="must clear this first" k={easeOut(seg(t, 3.4, 3.9))} />
      <g opacity={easeOut(seg(t, 0.1, 0.4))}>
        <g transform={`translate(${(-50 * sp).toFixed(1)} 0)`}>
          <rect x={75} y={120} width={300} height={70} rx={4} fill={C.cocoa} stroke={C.mocha} />
          {[0, 1, 2].map((r) => (
            <line key={r} x1={75} y1={137 + r * 18} x2={375} y2={137 + r * 18} stroke={C.mocha} />
          ))}
          <rect x={300} y={120} width={75} height={70} fill={C.focus} opacity={0.25 + 0.3 * sp} />
        </g>
        <g transform={`translate(${(50 * sp).toFixed(1)} 0)`}>
          <rect x={375} y={120} width={150} height={70} rx={4} fill={C.cocoa} stroke={C.mocha} />
          {[0, 1, 2].map((r) => (
            <line key={r} x1={375} y1={137 + r * 18} x2={525} y2={137 + r * 18} stroke={C.mocha} />
          ))}
          <rect x={375} y={120} width={75 * Math.min(1, sp * 3)} height={70} fill={C.focus} opacity={0.25 + 0.3 * sp} />
        </g>
      </g>
      <T x={300} y={212} s={12} f={C.latte} a="middle" o={easeOut(seg(t, 0.9, 1.3)) * (1 - easeOut(seg(t, 2.3, 2.6)))}>
        customer_id goes to both halves
      </T>
      <Tick y={210} k={tick} />
    </Svg>
  );
}

// 12 · Dependency preservation. Two halves, lossless; but the customer_id → customer_email rule now spans both
// tables, and checking it needs a join.
export function RevealDependencyPreservation({ t }: StepCtx) {
  const arc = easeInOut(seg(t, 2.4, 3.2));
  const n = easeOut(seg(t, 3.3, 3.8));
  return (
    <Svg label="lossless and dependency-preserving are separate" h={240}>
      <Row y={40} label="lossless" value="never optional" k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={85} label="dependency-preserving" value="sometimes sacrificed" valueColor={C.cherryText} k={easeOut(seg(t, 2.0, 2.5))} />
      {[25, 325].map((x, i) => (
        <g key={x} opacity={easeOut(seg(t, 0.3, 0.7))}>
          <rect x={x} y={130} width={250} height={44} rx={5} fill={C.cocoa} stroke={C.mocha} />
          <T x={x + 125} y={157} s={12} f={C.latte} a="middle">
            {i === 0 ? 'customer_id' : 'customer_email'}
          </T>
        </g>
      ))}
      <path d="M150 174 C 150 210 450 210 450 174" fill="none" stroke={C.cherryText} strokeWidth={2} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - arc} />
      <T x={300} y={lerp(236, 230, n)} s={13} f={C.cherryText} a="middle" o={n}>
        checking it needs a join
      </T>
    </Svg>
  );
}

// 13 · The measured anomaly. The normalized side updates one cell; the denormalized side updates four of five, one
// is missed and keeps the old email: two emails on file.
export function RevealMeasuredAnomaly({ t }: StepCtx) {
  const n = easeOut(seg(t, 0.5, 0.9));
  const a = easeOut(seg(t, 0.9, 1.3));
  const b = easeOut(seg(t, 3.3, 3.8));
  return (
    <Svg label="one update vs. several, then a real inconsistency" h={250}>
      <Anomaly t={t} n={n} d={(i) => easeOut(seg(t, 1.4 + i * 0.35, 1.7 + i * 0.35))} miss />
      <T x={25} y={lerp(122, 116, a)} s={13} f={C.focus} o={a}>
        one row updated
      </T>
      <T x={310} y={lerp(238, 232, b)} s={13} f={C.cherryText} o={b}>
        4 of 5 updated: two emails
      </T>
    </Svg>
  );
}

// 14 · The trade. A scan over the normalized shape pays a join on every row; over the denormalized shape it sweeps
// through without one, carrying one marked risk.
export function RevealDenormalizationTrade({ t }: StepCtx) {
  const s1 = seg(t, 0.6, 2.2);
  const s2 = seg(t, 2.8, 3.4);
  return (
    <Svg label="a trade made on purpose, not a mistake" h={220}>
      <Row y={40} label="scan-heavy workload" value="pays for joins every row" k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={85} label="denormalize on purpose" value="fewer joins, more risk" valueColor={C.second} k={easeOut(seg(t, 2.6, 3.1))} />
      <T x={25} y={140} s={12} f={C.latte} o={easeOut(seg(t, 0.3, 0.6))}>
        normalized
      </T>
      <T x={25} y={190} s={12} f={C.latte} o={easeOut(seg(t, 2.5, 2.8))}>
        denormalized
      </T>
      {Array.from({ length: 18 }, (_, i) => {
        const x = 150 + i * 23.6;
        const on1 = s1 * 18 > i;
        const on2 = s2 * 18 > i;
        return (
          <g key={i}>
            <rect x={x} y={124} width={20} height={22} rx={2} fill={on1 ? C.mocha : C.cocoa} opacity={easeOut(seg(t, 0.3, 0.6))} />
            {on1 && <circle cx={x + 10} cy={135} r={4} fill={C.cherryText} />}
            <rect x={x} y={174} width={20} height={22} rx={2} fill={on2 ? C.mocha : C.cocoa} stroke={i === 11 && on2 ? C.second : 'none'} strokeWidth={2} opacity={easeOut(seg(t, 2.5, 2.8))} />
          </g>
        );
      })}
    </Svg>
  );
}

// 15 · Recap. Three rows land one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="FD, closure, key; four rungs; two separate guarantees" h={220}>
      <Row y={50} label="FD, closure, key" value="one value at a time" k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={110} label="four rungs" value="each adds one guarantee" k={easeOut(seg(t, 1.4, 1.9))} />
      <Row y={170} label="lossless" value="mandatory, unlike preserving" valueColor={C.focus} k={easeOut(seg(t, 2.6, 3.1))} />
    </Svg>
  );
}

// 16 · Prove: what's the key? order_id's arrows reach every other attribute; after the answer it fills in as the key
// and the verdict lands with a tick.
export function ProveCandidateKey({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const key = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const k = answer !== null ? easeOut(seg(s, 0.6, 1.0)) : 0;
  const tick = answer !== null ? easeOut(seg(s, 1.0, 1.4)) : 0;
  const a = easeInOut(seg(t, 0.5, 1.2));
  return (
    <Svg label="order_id determines everything directly" h={230}>
      <Row y={40} label="order_id →" value="every other attribute" k={easeOut(seg(t, 0.1, 0.5))} />
      <Chips y={62} k={easeOut(seg(t, 0.2, 0.5))} lit={(i) => (i === 0 ? 1 + 2 * key : a)} />
      <rect x={25} y={62} width={120} height={32} rx={6} fill="none" stroke={C.focus} strokeWidth={3} opacity={key} />
      {[1, 2, 3].map((b) => (
        <Arc key={b} a={0} b={b} y={94} up={false} h={10 + b * 6} k={a} />
      ))}
      <AnswerRow y={145} label="the candidate key is" answer={answer} value="order_id alone" k={easeOut(seg(t, 1.2, 1.7))} />
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, k)} s={15} f={C.focus} a="middle" o={k}>
            one column reaches every other
          </T>
          <rect x={160} y={202} width={280 * tick} height={3} fill={C.focus} />
          <Tick y={176} k={tick} />
        </>
      )}
    </Svg>
  );
}
