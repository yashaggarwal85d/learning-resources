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

// Every value here is examples.py's own: 3000 customers spread over us, eu and apac, analyst_role and the region_only_us
// policy USING (region = 'us'), the 1000 rows it leaves, the Filter node it adds to EXPLAIN, and the superuser's 3000. The row
// strips stand for the table, not for any count.

const REGIONS = ['us', 'eu', 'apac'];

/** The customers table as three region columns of ten strips each; `lit(c)` says how bright column c is. */
function Table({ x, y, lit, tag = true }: { x: number; y: number; lit: (c: number, r: number) => number; tag?: boolean }) {
  return (
    <g>
      {REGIONS.map((n, c) => (
        <g key={n}>
          {tag && (
            <T x={x + c * 70 + 28} y={y - 8} s={11} f={C.taupe} a="middle">
              {n}
            </T>
          )}
          {Array.from({ length: 10 }, (_, r) => (
            <rect key={r} x={x + c * 70} y={y + r * 13} width={56} height={9} rx={2} fill={lit(c, r) > 0.5 ? C.second : C.mocha} opacity={0.4 + 0.6 * lit(c, r)} />
          ))}
        </g>
      ))}
    </g>
  );
}

const PATHS = ['the masked table', 'a copy of the data', 'a file in storage'];

// 0 · Hook. An analyst, a masked email column, and three ways to the data: through the masked table, through a copy, straight
// to a file. Each path draws in turn and ends in an open question.
export function Hook({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="email is masked for analysts, and an analyst still recovers addresses. Which path leaked?" h={250}>
      <Cell x={25} y={110} w={110} label="analyst" o={k(0)} />
      {t > 0.4 && (
        <T x={25} y={166} s={11} f={C.taupe} o={k(0.4)}>
          email: masked
        </T>
      )}
      {PATHS.map((n, i) => (
        <g key={n}>
          <Fan x1={135} y1={124} x2={376} y2={54 + i * 70} k={k(1.6 + i * 0.8)} f={C.latte} />
          <Cell x={380} y={40 + i * 70} w={195} label={n} o={k(1.6 + i * 0.8)} />
          {t > 2.0 + i * 0.8 && (
            <T x={300} y={lerp(70, 62 + i * 70, 0.7) - 14} s={13} f={C.cherryText} a="middle" o={k(2.0 + i * 0.8)}>
              ?
            </T>
          )}
        </g>
      ))}
      {t > 4.2 && (
        <T x={25} y={240} s={11} f={C.cherryText} o={k(4.2)}>
          which path did the masking cover?
        </T>
      )}
    </Svg>
  );
}

// 1 · Engine versus application. First the filter sits in the app: the app user's route is ticked, the notebook's route skips
// it, crossed. Then the filter slides into the engine itself, and both routes are ticked.
export function RevealEngineVsApp({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const mv = easeInOut(seg(t, 2.6, 3.4));
  const inEngine = mv > 0.5;
  return (
    <Svg label="engine policy: every query. Application filter: only requests through that app" h={250}>
      <Cell x={25} y={50} w={120} label="app user" o={k(0)} />
      <Cell x={25} y={150} w={120} label="notebook" o={k(0.1)} />
      <Req x1={145} x2={210} y={64} k={k(0.3)} />
      <Cell x={210} y={50} w={110} label="app" o={k(0.3)} />
      <line x1={320} y1={64} x2={430} y2={108} stroke={C.latte} strokeWidth={1.4} opacity={k(0.5)} />
      <line x1={145} y1={164} x2={430} y2={120} stroke={C.latte} strokeWidth={1.4} opacity={k(1.4)} />
      <Cell x={430} y={100} w={145} label="engine" o={k(0.5)} stroke={inEngine ? C.focus : C.mocha} />
      <Lock x={lerp(258, 496, mv)} y={lerp(40, 92, mv)} k={k(0.8)} f={C.focus} />
      <MiniTick x={74} y={92} k={k(1.0)} />
      {inEngine ? <MiniTick x={74} y={192} k={k(3.4)} /> : <Cross x={80} y={196} k={k(1.6)} />}
      {t > 1.6 && (
        <T x={25} y={232} s={11} f={inEngine ? C.focus : C.cherryText} o={k(1.6)}>
          {inEngine ? 'in the engine: every query, any tool' : 'in the app: only requests through the app'}
        </T>
      )}
    </Svg>
  );
}

// 2 · Predict before the policy. The table, all dim; analyst_role asks. Once answered, every strip lights: all of it comes back.
export function PredictBeforePolicy({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const k = (d: number) => easeOut(seg(t, d, d + 0.25));
  const a = answer !== null ? easeOut(seg(s, 0.2, 0.9)) : 0;
  return (
    <Svg label="query as the restricted role, before any row policy exists. How many rows?" h={250}>
      <g opacity={k(0)}>
        <Table x={25} y={50} lit={(c, r) => (a * 30 > c * 10 + r ? 1 : 0)} />
      </g>
      <Cell x={300} y={60} w={150} label="analyst_role" o={k(0.4)} />
      <Hole x={300} y={110} w={150} o={k(0.6)} />
      {t > 0.8 && (
        <T x={300} y={170} s={11} f={C.taupe} o={k(0.8)}>
          row policy: none yet
        </T>
      )}
      {answer === null && t > 1.2 && (
        <T x={500} y={90} s={15} f={C.taupe} a="middle" o={k(1.2)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="all 3000 come back" y={222} />
    </Svg>
  );
}

// 3 · Measured before the policy. The count query runs as analyst_role and the strips light column by column until the whole
// table is back: 3000 of 3000.
export function RevealBeforePolicy({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const g = easeInOut(seg(t, 1.0, 3.0));
  return (
    <Svg label="measured: all 3,000 rows, nothing stops the query yet" h={250}>
      <T x={25} y={30} s={11} f={C.crema} o={k(0)}>
        SET ROLE analyst_role; SELECT count(*) FROM customers;
      </T>
      <Table x={25} y={70} lit={(c, r) => (g * 30 > c * 10 + r ? 1 : 0)} />
      {t > 3.0 && (
        <T x={300} y={130} s={17} f={C.second} o={k(3.0)}>
          3000
        </T>
      )}
      {t > 3.2 && (
        <T x={300} y={156} s={11} f={C.taupe} o={k(3.2)}>
          of 3000: nothing stopped it
        </T>
      )}
    </Svg>
  );
}

// 4 · The policy expression. Rows travel a lane under three stages: the policy checks each one first, dropping the misses,
// and only then the user's own WHERE. Below, a leakproof function may hop ahead of the policy: the one carve-out.
export function ElaboratePolicyExpression({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const regionOf = (j: number) => j % 3;
  return (
    <Svg label="a row policy is an expression, evaluated before the user's own query conditions" h={250}>
      <Cell x={110} y={50} w={200} label="policy: region = 'us'" o={k(0.4)} stroke={C.focus} />
      <Cell x={340} y={50} w={130} label="your WHERE" o={k(0.8)} />
      <T x={40} y={70} s={11} f={C.taupe} o={k(0)}>
        rows
      </T>
      <line x1={25} y1={130} x2={575} y2={130} stroke={C.mocha} strokeWidth={1.2} opacity={k(0.2)} />
      {[0, 1, 2, 3, 4, 5].map((j) => {
        const p = clamp((t - 1.2 - j * 0.35) / 1.6);
        const pass = regionOf(j) === 0;
        const x = lerp(30, pass ? 560 : 210, p);
        const drop = !pass && p >= 1 ? easeOut(seg(t, 2.8 + j * 0.35, 3.2 + j * 0.35)) : 0;
        return <Pip key={j} x={x} y={130 + drop * 30} f={pass ? C.second : C.latte} o={p > 0 ? 1 - drop : 0} s={9} />;
      })}
      <line x1={210} y1={80} x2={210} y2={120} stroke={C.focus} strokeWidth={1} strokeDasharray="3 3" opacity={k(0.4)} />
      <line x1={405} y1={80} x2={405} y2={120} stroke={C.mocha} strokeWidth={1} strokeDasharray="3 3" opacity={k(0.8)} />
      {t > 2.6 && (
        <T x={110} y={180} s={11} f={C.focus} o={k(2.6)}>
          yes or no, every row, first
        </T>
      )}
      <path d={`M60 214 C 120 214, 140 150, ${lerp(60, 180, k(3.8))} 146`} fill="none" stroke={C.second} strokeWidth={1.3} strokeDasharray="4 3" opacity={k(3.6)} />
      {t > 3.6 && (
        <T x={200} y={222} s={11} f={C.second} o={k(3.6)}>
          a leakproof function may run earlier
        </T>
      )}
    </Svg>
  );
}

// 5 · Predict after the policy. The same table, the same query, now with region_only_us in front. Once answered, only the us
// column lights; eu and apac stay dark.
export function PredictAfterPolicy({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const k = (d: number) => easeOut(seg(t, d, d + 0.25));
  const a = answer !== null ? easeOut(seg(s, 0.2, 0.9)) : 0;
  return (
    <Svg label="same query, same role, after the policy. How many rows now?" h={250}>
      <g opacity={k(0)}>
        <Table x={25} y={50} lit={(c, r) => (c === 0 && a * 10 > r ? 1 : 0)} />
      </g>
      <Cell x={300} y={60} w={150} label="analyst_role" o={k(0.3)} />
      <Cell x={300} y={110} w={200} label="region_only_us" o={k(0.6)} stroke={C.focus} />
      {answer === null && t > 1.2 && (
        <T x={540} y={90} s={15} f={C.taupe} a="middle" o={k(1.2)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="exactly what the policy allows" y={222} />
    </Svg>
  );
}

// 6 · Measured after the policy. The identical count query arrives; the policy steps in first, lighting the us column and
// crossing eu and apac: 1000 of 3000. The policy decided, not the query.
export function RevealAfterPolicy({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const g = easeInOut(seg(t, 1.2, 2.4));
  return (
    <Svg label="measured: exactly 1,000 rows -- the policy, not the query, decided" h={250}>
      <T x={25} y={30} s={11} f={C.crema} o={k(0)}>
        SET ROLE analyst_role; SELECT count(*) FROM customers;
      </T>
      <Table x={25} y={70} lit={(c, r) => (c === 0 && g * 10 > r ? 1 : 0)} />
      <Cross x={123} y={206} k={k(2.4)} />
      <Cross x={193} y={206} k={k(2.6)} />
      <Cell x={300} y={60} w={200} label="USING (region = 'us')" o={k(0.6)} stroke={C.focus} />
      {t > 2.8 && (
        <T x={300} y={140} s={17} f={C.second} o={k(2.8)}>
          1000
        </T>
      )}
      {t > 3.0 && (
        <T x={300} y={166} s={11} f={C.taupe} o={k(3.0)}>
          of 3000; the query never asked
        </T>
      )}
    </Svg>
  );
}

// 7 · The plan changes. Two EXPLAIN plans side by side. Before: one node, the scan. After: the same scan, and a Filter node
// grows in on top of it. Below: secret over fast, every time.
export function ElaboratePlanChanges({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const f = easeOutBack(seg(t, 2.4, 3.0));
  return (
    <Svg label="EXPLAIN: no Filter node before the policy, an explicit one after it" h={250}>
      <T x={25} y={30} s={11} f={C.taupe} o={k(0)}>
        before the policy
      </T>
      <Cell x={25} y={120} w={240} label="Seq Scan on customers" o={k(0.4)} />
      <T x={315} y={30} s={11} f={C.taupe} o={k(1.2)}>
        after the policy
      </T>
      <Cell x={315} y={120} w={240} label="Seq Scan on customers" o={k(1.4)} />
      <g opacity={clamp(f)} transform={`translate(0 ${((1 - clamp(f)) * 20).toFixed(1)})`}>
        <Cell x={315} y={60} w={240} label="Filter: region = 'us'" stroke={C.focus} />
        <line x1={435} y1={88} x2={435} y2={120} stroke={C.focus} strokeWidth={1.4} />
      </g>
      {t > 3.0 && (
        <T x={25} y={190} s={11} f={C.crema} o={k(3.0)}>
          fast or secret: the engine picks secret
        </T>
      )}
      {t > 3.6 && (
        <T x={25} y={212} s={11} f={C.taupe} o={k(3.6)}>
          even when it costs more
        </T>
      )}
    </Svg>
  );
}

const BYPASS: [string, number][] = [
  ['analyst_role', 1000],
  ['superuser', 3000],
  ['the file on disk', 3000],
  ['a copy, a bare view', 3000],
];

// 8 · Bypass paths. Four ways to the rows. Only the analyst's goes through the policy's lock and comes back a third as long.
// The superuser, the file and the copy all fill the full bar, red: the policy never ran for them.
export function RevealBypassPaths({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="a superuser bypasses the policy; so does anyone reading the file directly" h={250}>
      {BYPASS.map(([n, v], i) => {
        const y = 40 + i * 46;
        const d = 0.4 + i * 0.9;
        const g = easeOut(seg(t, d + 0.3, d + 0.9));
        return (
          <g key={n}>
            <T x={25} y={y + 12} s={11} f={C.crema} o={k(d)}>
              {n}
            </T>
            {i === 0 ? <Lock x={214} y={y + 2} k={k(d)} f={C.focus} /> : <path d={`M204 ${y + 18} q 16 -22 32 0`} fill="none" stroke={C.cherryText} strokeWidth={1.4} opacity={k(d)} />}
            <rect x={256} y={y + 2} width={Math.max(0, (v / 3000) * 260 * g)} height={12} rx={2} fill={i === 0 ? C.second : C.cherryText} />
            {i < 2 && t > d + 0.9 && (
              <T x={256 + (v / 3000) * 260 + 8} y={y + 12} s={11} f={i === 0 ? C.second : C.cherryText} o={k(d + 0.9)}>
                {v}
              </T>
            )}
          </g>
        );
      })}
      {t > 4.0 && (
        <T x={25} y={232} s={11} f={C.cherryText} o={k(4.0)}>
          these never asked the engine anything
        </T>
      )}
    </Svg>
  );
}

const RECAP: [string, boolean][] = [
  ['runs before the query', true],
  ['covers every caller', true],
  ['can cost something to run', true],
  ['never reaches a path around the engine', false],
];

// 9 · Recap. Three properties of an engine policy land ticked; the fourth line, the bypass gap, lands crossed.
export function Recap({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="engine policies cover every query; they don't cover a bypass around the engine" h={250}>
      {RECAP.map(([n, ok], i) => (
        <g key={n}>
          {ok ? <MiniTick x={25} y={44 + i * 46} k={k(0.6 + i * 0.9)} /> : <Cross x={32} y={46 + i * 46} k={k(0.6 + i * 0.9)} />}
          <T x={55} y={50 + i * 46} s={12} f={ok ? C.crema : C.cherryText} o={k(0.5 + i * 0.9)}>
            {n}
          </T>
        </g>
      ))}
    </Svg>
  );
}
