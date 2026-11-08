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

// Every value here is examples.py's own: 14 teams, 60 datasets, 3 environments and their 2520 roles; the new dataset's 3 RBAC
// roles against 0 ABAC edits; the analyst rule's tiers and its four test cases.

const AXES = ['14 teams', '60 datasets', '3 environments'];

/** One layer of the role grid: 14 rows of 60 dashed cells, filled left to right by `k`. */
function Grid({ x, y, k, f = C.latte, o = 1 }: { x: number; y: number; k: number; f?: string; o?: number }) {
  return (
    <g opacity={o}>
      {Array.from({ length: 14 }, (_, r) => (
        <line key={r} x1={x} y1={y + r * 6} x2={x + 480 * clamp(k)} y2={y + r * 6} stroke={f} strokeWidth={4} strokeDasharray="6 2" />
      ))}
    </g>
  );
}

// 0 · Hook. The three axes arrive. Then the role list starts and keeps going: rows of role names stack up and scroll, too
// many to read, while the reviewer's question waits beside them.
export function Hook({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const scroll = Math.max(0, t - 1.6) * 40;
  return (
    <Svg label="14 teams, 60 datasets, 3 environments: one role per triple, for least privilege" h={250}>
      {AXES.map((n, i) => (
        <Cell key={n} x={25 + i * 175} y={26} w={160} label={n} o={k(0.2 + i * 0.4)} />
      ))}
      <clipPath id="ac-hook-clip">
        <rect x={25} y={74} width={360} height={160} />
      </clipPath>
      <g clipPath="url(#ac-hook-clip)" opacity={k(1.6)}>
        {Array.from({ length: 40 }, (_, i) => {
          const y = 80 + i * 14 - (scroll % 280);
          return (
            <g key={i}>
              <rect x={25} y={y} width={60 + ((i * 17) % 40)} height={6} rx={2} fill={C.latte} opacity={0.7} />
              <rect x={150} y={y} width={50 + ((i * 23) % 50)} height={6} rx={2} fill={C.latte} opacity={0.5} />
              <rect x={280} y={y} width={40 + ((i * 11) % 60)} height={6} rx={2} fill={C.latte} opacity={0.4} />
            </g>
          );
        })}
      </g>
      {t > 3.4 && (
        <T x={400} y={150} s={11} f={C.taupe} o={k(3.4)}>
          who reviews this?
        </T>
      )}
    </Svg>
  );
}

// 1 · RBAC's shape. Privileges, single pips, fly into two role bundles. Then a person is handed both bundles at once.
export function RevealRBACShape({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="a role holds many privileges; a user holds one or more roles" h={250}>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const m = easeInOut(seg(t, 0.8 + i * 0.15, 1.6 + i * 0.15));
        const ty = i < 3 ? 74 : 164;
        return <Pip key={i} x={lerp(40, 214 + (i % 3) * 22, m)} y={lerp(36 + i * 34, ty, m)} f={C.second} o={k(0.1 + i * 0.05)} s={9} />;
      })}
      {t > 0.3 && (
        <T x={25} y={240} s={11} f={C.taupe} o={k(0.3) * (1 - k(2.0))}>
          privileges, one at a time
        </T>
      )}
      <rect x={200} y={56} width={130} height={36} rx={5} fill="none" stroke={C.latte} strokeWidth={1.4} opacity={k(0.6)} />
      <T x={290} y={79} s={11} f={C.crema} o={k(0.6)}>
        role
      </T>
      <rect x={200} y={146} width={130} height={36} rx={5} fill="none" stroke={C.latte} strokeWidth={1.4} opacity={k(0.6)} />
      <T x={290} y={169} s={11} f={C.crema} o={k(0.6)}>
        role
      </T>
      <Cell x={440} y={105} w={135} label="a person" o={k(2.4)} stroke={t > 3.0 ? C.focus : C.mocha} />
      <Fan x1={440} y1={119} x2={334} y2={74} k={k(2.7)} f={C.focus} />
      <Fan x1={440} y1={119} x2={334} y2={164} k={k(2.9)} f={C.focus} />
      {t > 3.6 && (
        <T x={25} y={220} s={12} f={C.crema} o={k(3.6)}>
          manage the bundles, not every grant
        </T>
      )}
    </Svg>
  );
}

// 2 · Predict: the role count. 14 × 60 × 3 = ?. Once answered, the product lands: 2520.
export function PredictRoleCount({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const k = (d: number) => easeOut(seg(t, d, d + 0.25));
  const a = answer !== null ? easeOut(seg(s, 0.2, 0.7)) : 0;
  const parts = ['14', '×', '60', '×', '3', '='];
  return (
    <Svg label="14 teams, 60 datasets, 3 environments, one role per triple. How many roles?" h={250}>
      {parts.map((p, i) => (
        <T key={i} x={70 + i * 62} y={100} s={i % 2 ? 15 : 17} f={i % 2 ? C.taupe : C.crema} a="middle" o={k(0.2 + i * 0.15)}>
          {p}
        </T>
      ))}
      {answer === null && t > 1.2 && (
        <T x={470} y={100} s={17} f={C.taupe} a="middle" o={k(1.2)}>
          ?
        </T>
      )}
      {a > 0 && (
        <T x={480} y={lerp(110, 100, a)} s={17} f={C.focus} a="middle" o={a}>
          2520
        </T>
      )}
      <Verdict answer={answer} text="every combination: over two thousand" y={184} />
    </Svg>
  );
}

// 3 · 2,520 roles. Three layers of the 14 × 60 grid, one per environment, fill one after the other; then the product.
export function RevealRoleCount({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="measured: 2,520 roles for this one shop" h={250}>
      {[2, 1, 0].map((j) => (
        <Grid key={j} x={25 + j * 24} y={36 + j * 28} k={easeInOut(seg(t, 0.4 + j * 0.8, 1.2 + j * 0.8))} f={j === 0 ? C.crema : C.latte} o={k(0.2 + j * 0.8) * (j === 0 ? 1 : 0.6)} />
      ))}
      {t > 3.0 && (
        <T x={25} y={214} s={12} f={C.crema} o={k(3.0)}>
          14 × 60 × 3 = 2520 roles
        </T>
      )}
      {t > 3.6 && (
        <T x={25} y={236} s={11} f={C.cherryText} o={k(3.6)}>
          no one can say who still needs what
        </T>
      )}
    </Svg>
  );
}

const CASES: [string, boolean][] = [
  ['confidential, financial', true],
  ['restricted', false],
  ['confidential, PII, no purpose', false],
  ['confidential, PII, a purpose', true],
];

// 4 · ABAC's one rule. The grid shrinks away into a single rule card. Then the four test cases run against it, one by one:
// allowed, denied, denied, allowed.
export function ElaborateABACRule({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const fold = easeInOut(seg(t, 0.3, 1.2));
  return (
    <Svg label="ABAC: one rule over subject, object and environment attributes" h={250}>
      <g opacity={1 - fold} transform={`translate(25 30) scale(${lerp(1, 0.1, fold).toFixed(3)} 1)`}>
        <Grid x={0} y={0} k={1} />
      </g>
      <rect x={25} y={28} width={550} height={60} rx={5} fill={C.cocoa} stroke={C.focus} strokeWidth={1.5} opacity={k(1.0)} />
      <T x={39} y={52} s={11} f={C.crema} o={k(1.2)}>
        analysts read tier confidential or below
      </T>
      <T x={39} y={74} s={11} f={C.crema} o={k(1.6)}>
        never PII without a stated purpose
      </T>
      {CASES.map(([n, ok], i) => (
        <g key={n}>
          <T x={25} y={122 + i * 30} s={11} f={C.latte} o={k(2.2 + i * 0.5)}>
            {n}
          </T>
          {ok ? <MiniTick x={400} y={116 + i * 30} k={k(2.4 + i * 0.5)} /> : <Cross x={407} y={118 + i * 30} k={k(2.4 + i * 0.5)} />}
          <T x={425} y={122 + i * 30} s={11} f={ok ? C.focus : C.cherryText} o={k(2.4 + i * 0.5)}>
            {ok ? 'allow' : 'deny'}
          </T>
        </g>
      ))}
    </Svg>
  );
}

const ENVS = ['a', 'b', 'c'];

// 5 · Predict: a new restricted dataset. Left, RBAC's three empty role slots; right, ABAC's rule card and one empty edit slot.
// Once answered, RBAC's slots fill with new roles and ABAC's slot is ticked empty: the tag already matches.
export function PredictNewDataset({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const k = (d: number) => easeOut(seg(t, d, d + 0.25));
  const a = answer !== null ? easeOut(seg(s, 0.2, 0.7)) : 0;
  return (
    <Svg label="data science gets a new restricted dataset. New RBAC roles vs new ABAC edits?" h={250}>
      <T x={25} y={30} s={12} f={C.crema} o={k(0)}>
        RBAC
      </T>
      {ENVS.map((n, i) => (a > 0.5 ? <Cell key={n} x={25} y={44 + i * 38} w={200} label="new role" stroke={C.cherryText} /> : <Hole key={n} x={25} y={44 + i * 38} w={200} o={k(0.2 + i * 0.1)} />))}
      <T x={330} y={30} s={12} f={C.crema} o={k(0.4)}>
        ABAC
      </T>
      <Cell x={330} y={44} w={245} label="the existing rule" o={k(0.5)} />
      <Hole x={330} y={82} w={245} o={k(0.6) * (1 - a)} />
      <MiniTick x={445} y={96} k={a} />
      {answer === null && t > 1.0 && (
        <T x={280} y={110} s={15} f={C.taupe} a="middle" o={k(1.0)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="a role per environment, against no edit" y={214} />
    </Svg>
  );
}

// 6 · Measured: 3 against 0. RBAC builds a new role in each of the three environments, counted up. ABAC: the new dataset
// arrives wearing its tag, the tag slides into the rule's slot and matches; edits stay 0.
export function RevealNewDatasetCost({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const slide = easeInOut(seg(t, 2.6, 3.4));
  const n = [0, 1, 2].filter((i) => t > 0.6 + i * 0.5).length;
  return (
    <Svg label="measured: 3 new roles under RBAC, 0 edits under ABAC" h={250}>
      <T x={25} y={30} s={12} f={C.crema} o={k(0)}>
        RBAC
      </T>
      {ENVS.map((e, i) => (
        <g key={e}>
          <Cell x={25} y={44 + i * 38} w={200} label="new role" o={k(0.6 + i * 0.5)} stroke={C.cherryText} />
        </g>
      ))}
      {[0, 1, 2].map((i) => (
        <Pip key={i} x={240} y={58 + i * 38} f={C.cherryText} o={k(0.8 + i * 0.5)} s={9} />
      ))}
      <T x={25} y={180} s={12} f={C.cherryText} o={k(1.8)}>
        {n === 3 ? '3 new roles' : ''}
      </T>
      <T x={330} y={30} s={12} f={C.crema} o={k(2.0)}>
        ABAC
      </T>
      <Cell x={330} y={44} w={245} label="the existing rule" o={k(2.0)} stroke={t > 3.4 ? C.focus : C.mocha} />
      <Cell x={330} y={lerp(140, 82, slide)} w={140} label="new dataset" o={k(2.2)} />
      <Cell x={480} y={lerp(140, 82, slide)} w={95} label="its tag" o={k(2.4)} stroke={C.second} />
      <MiniTick x={520} y={124} k={k(3.5)} />
      {t > 3.6 && (
        <T x={330} y={180} s={12} f={C.focus} o={k(3.6)}>
          0 edits
        </T>
      )}
    </Svg>
  );
}

const PEPS = ['warehouse', 'lake', 'BI tool', 'API'];

// 7 · Decision and enforcement. One decision point above, four enforcement points below. Requests climb from each to the one
// engine and the verdict travels back down; the enforcement point applies it.
export function ElaborateDecisionEnforcement({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="the decision point and the enforcement point are two different jobs" h={250}>
      <Cell x={210} y={36} w={180} label="decision point" o={k(0.4)} stroke={C.focus} />
      {PEPS.map((n, i) => {
        const x = 25 + i * 140;
        const d = 1.6 + i * 0.5;
        const up = easeInOut(seg(t, d, d + 0.5));
        const down = easeInOut(seg(t, d + 0.6, d + 1.1));
        const px = lerp(x + 60, 300, up - down);
        const py = lerp(164, 70, up - down);
        return (
          <g key={n}>
            <line x1={x + 60} y1={164} x2={300} y2={70} stroke={C.mocha} strokeWidth={1.2} opacity={k(1.2)} />
            <Cell x={x} y={166} w={120} label={n} o={k(1.0 + i * 0.1)} stroke={down >= 1 ? C.second : C.mocha} />
            {up > 0 && down < 1 && <Pip x={px} y={py} f={down > 0 ? C.focus : C.crema} s={8} />}
            <MiniTick x={x + 54} y={214} k={k(d + 1.1)} f={C.second} />
          </g>
        );
      })}
      {t > 0.6 && (
        <T x={400} y={55} s={11} f={C.taupe} o={k(0.6)}>
          decides
        </T>
      )}
      {t > 1.2 && (
        <T x={25} y={150} s={11} f={C.taupe} o={k(1.2)}>
          enforce
        </T>
      )}
    </Svg>
  );
}

const SYSTEMS = ['warehouse', 'lake', 'BI tool', 'notebooks'];

// 8 · Identity from outside. A person signs in once to the identity provider, ticked. Provisioning fans out and drops an
// account into every connected system. Then access is pulled in that one place, and every account goes at once.
export function RevealIdentityFederation({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const pull = easeOut(seg(t, 3.6, 4.2));
  return (
    <Svg label="identity comes from outside the policy engine: SSO authenticates, SCIM provisions" h={250}>
      <Cell x={25} y={110} w={100} label="a person" o={k(0)} />
      <Req x1={125} x2={170} y={124} k={k(0.8)} />
      <Cell x={170} y={110} w={170} label="identity provider" o={k(0.6)} stroke={pull > 0.5 ? C.cherryText : C.focus} />
      <MiniTick x={250} y={92} k={k(1.2) * (1 - pull)} />
      <Cross x={256} y={96} k={pull} />
      {t > 1.2 && (
        <T x={170} y={168} s={11} f={C.focus} o={k(1.2) * (1 - pull)}>
          signed in once
        </T>
      )}
      {SYSTEMS.map((n, i) => {
        const y = 30 + i * 52;
        return (
          <g key={n}>
            <Fan x1={340} y1={124} x2={396} y2={y + 14} k={k(2.0 + i * 0.2) * (1 - pull)} f={C.second} />
            <Cell x={420} y={y} w={155} label={n} o={k(1.8 + i * 0.1)} />
            <Pip x={404} y={y + 14} f={pull > 0.5 ? C.cherryText : C.second} o={k(2.2 + i * 0.2) * (1 - 0.8 * easeOut(seg(t, 4.0, 4.6)))} s={8} />
          </g>
        );
      })}
      {t > 4.0 && (
        <T x={25} y={232} s={11} f={C.cherryText} o={k(4.0)}>
          pulled in one place, gone everywhere
        </T>
      )}
    </Svg>
  );
}

const GRANTS: [string, number, boolean][] = [
  ['moved teams', 170, false],
  ['project ended', 260, false],
  ['still needed', 440, true],
];

// 9 · Access reviews. Three grants run along a year. Each grant's reason (pale) ends at some point, but two grants keep running
// past it, drifting red. The scheduled review line arrives: the drifted two are crossed, the needed one is signed off.
export function RevealAccessReviews({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const run = clamp((t - 0.4) / 2.6);
  return (
    <Svg label="entitlements drift over time; a periodic review is the catch policy alone misses" h={250}>
      {GRANTS.map(([n, end, ok], i) => {
        const y = 60 + i * 44;
        const x = 165 + 355 * run;
        return (
          <g key={n}>
            <T x={25} y={y + 10} s={11} f={C.latte} o={k(i * 0.1)}>
              {n}
            </T>
            <rect x={165} y={y} width={Math.max(0, Math.min(x, 165 + end) - 165)} height={6} rx={2} fill={C.latte} opacity={0.6} />
            <rect x={165} y={y + 8} width={Math.max(0, Math.min(x, 165 + (ok ? 355 : end)) - 165)} height={6} rx={2} fill={C.second} />
            {!ok && x > 165 + end && <rect x={165 + end} y={y + 8} width={Math.max(0, Math.min(x, 520) - 165 - end)} height={6} rx={2} fill={C.cherryText} />}
            {ok ? <MiniTick x={540} y={y + 4} k={k(3.6 + i * 0.2)} /> : <Cross x={548} y={y + 7} k={k(3.4 + i * 0.2)} />}
          </g>
        );
      })}
      <line x1={530} y1={40} x2={530} y2={180} stroke={C.focus} strokeWidth={1.4} strokeDasharray="4 3" opacity={k(3.2)} />
      {t > 3.2 && (
        <T x={525} y={32} s={11} f={C.focus} a="end" o={k(3.2)}>
          scheduled review
        </T>
      )}
      {t > 4.0 && (
        <T x={25} y={222} s={12} f={C.crema} o={k(4.0)}>
          an owner signs each grant that stays
        </T>
      )}
    </Svg>
  );
}

const RECAP = ['a role per combination: 2520', 'one rule over attributes', 'deciding and enforcing, apart', 'identity from outside', 'a scheduled review, signed'];

// 10 · Recap. The five lessons land in order, each ticked.
export function Recap({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="RBAC multiplies into a grid; ABAC is one rule; a policy still needs a place to run" h={250}>
      {RECAP.map((n, i) => (
        <g key={n}>
          <MiniTick x={25} y={40 + i * 42} k={k(0.4 + i * 0.85)} />
          <T x={50} y={46 + i * 42} s={12} f={C.crema} o={k(0.3 + i * 0.85)}>
            {n}
          </T>
        </g>
      ))}
    </Svg>
  );
}
