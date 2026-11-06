import { useEffect, useState } from 'react';
import { C, Draw, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// Drift and label-delay monitoring, drawn from examples.py's own samples (numpy seed 20261030, 3,000 values each):
// a mean shift every test flags (PSI 1.631, KS 0.499, JS 0.512), a concept flip PSI never sees (0.007) while precision
// goes 1.00 → 0.00, 354 nulls (11.8%) that mean-imputation hides (PSI 0.091), and a narrow spike PSI's deciles miss
// (0.012) and KS registers more of (0.022).

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

/** A plain box with a centred label. */
const Box = ({
  x,
  y,
  w,
  h = 32,
  label,
  lit = false,
  o = 1,
  dash,
  stroke,
  f,
  fill,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  label: string;
  lit?: boolean;
  o?: number;
  dash?: string;
  stroke?: string;
  f?: string;
  fill?: string;
}) =>
  o <= 0 ? null : (
    <g opacity={Math.min(1, o)}>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={fill ?? C.panel} stroke={stroke ?? (lit ? C.focus : C.line)} strokeWidth={lit ? 1.8 : 1.1} strokeDasharray={dash} />
      <T x={x + w / 2} y={y + h / 2 + 5} s={13} f={f ?? (lit ? C.focus : C.primary)} a="middle">
        {label}
      </T>
    </g>
  );

/** A label-left / value-right line under a drawing. */
const Line2 = ({ y, l, r, o, rc = C.focus, lc = C.secondary, lx = 30 }: { y: number; l: string; r: string; o: number; rc?: string; lc?: string; lx?: number }) =>
  o <= 0 ? null : (
    <g opacity={Math.min(1, o)}>
      <T x={lx} y={y} s={14} f={lc}>
        {l}
      </T>
      <T x={575} y={y} s={14} f={rc} a="end">
        {r}
      </T>
    </g>
  );

/** A check mark. */
const Tick = ({ x, y, k, color = C.focus }: { x: number; y: number; k: number; color?: string }) =>
  k <= 0 ? null : <path d={`M${x - 5} ${y} l4 4 l8 -9`} fill="none" stroke={color} strokeWidth={2} opacity={k} />;

/** A red ✕. */
const Cross = ({ x, y, k }: { x: number; y: number; k: number }) =>
  k <= 0 ? null : (
    <g stroke={C.badText} strokeWidth={2.4} opacity={k}>
      <line x1={x - 6} y1={y - 6} x2={x + 6} y2={y + 6} />
      <line x1={x + 6} y1={y - 6} x2={x - 6} y2={y + 6} />
    </g>
  );

// examples.py's samples (numpy seed 20261030, N = 3,000 each), counted in 24 half-unit bins of orders_last_30d from
// −1 to 11. REF/CUR: the data-drift pair (mean 4 → 6). RX/CX: the concept-drift pair (same distribution). CLEAN/IMP:
// before and after 354 nulls (11.8%) were mean-imputed at 3.96. BASE/SH: 120 values (4%) collapsed onto 4.0.
// DEC: BASE's decile edges, PSI's bins. KS's largest gap sits at 3.97.
// prettier-ignore
const REF = [4, 8, 21, 30, 68, 128, 219, 228, 383, 410, 383, 356, 289, 206, 126, 63, 46, 21, 6, 3, 0, 2, 0, 0];
// prettier-ignore
const CUR = [0, 0, 0, 0, 1, 9, 16, 34, 63, 126, 220, 277, 367, 381, 403, 345, 293, 201, 121, 77, 40, 15, 6, 5];
// prettier-ignore
const RX = [4, 9, 28, 35, 75, 143, 218, 264, 311, 398, 387, 339, 288, 219, 130, 94, 33, 16, 7, 1, 1, 0, 0, 0];
// prettier-ignore
const CX = [2, 5, 21, 39, 75, 129, 218, 306, 329, 400, 395, 336, 255, 205, 135, 70, 37, 24, 12, 6, 1, 0, 0, 0];
// prettier-ignore
const CLEAN = [1, 6, 13, 37, 58, 142, 199, 323, 380, 409, 379, 328, 268, 204, 131, 58, 30, 19, 7, 4, 3, 1, 0, 0];
// prettier-ignore
const IMP = [1, 6, 11, 32, 53, 126, 176, 285, 332, 714, 343, 301, 219, 181, 114, 48, 27, 19, 7, 4, 1, 0, 0, 0];
// prettier-ignore
const BASE = [8, 10, 22, 43, 88, 120, 216, 292, 309, 370, 395, 356, 279, 228, 130, 74, 31, 21, 5, 1, 1, 1, 0, 0];
// prettier-ignore
const SH = [8, 9, 22, 41, 85, 111, 210, 279, 294, 352, 505, 347, 263, 218, 126, 72, 30, 20, 5, 1, 1, 1, 0, 0];
const DEC = [2.02, 2.67, 3.17, 3.63, 4.04, 4.41, 4.81, 5.29, 5.87];

/** A histogram of 24 half-unit bins (−1 to 11) between x0 and x1, baseline y, `sc` px per count, drawn to fraction k. */
const Hist = ({
  d,
  x0,
  x1,
  y,
  sc,
  k = 1,
  fill,
  outline,
  color,
}: {
  d: number[];
  x0: number;
  x1: number;
  y: number;
  sc: number;
  k?: number;
  fill?: (i: number) => string;
  outline?: boolean;
  color?: string;
}) => {
  const w = (x1 - x0) / 24;
  if (outline) {
    let p = `M${x0} ${y}`;
    d.forEach((n, i) => {
      const h = n * sc * k;
      p += ` L${x0 + i * w} ${y - h} L${x0 + (i + 1) * w} ${y - h}`;
    });
    p += ` L${x1} ${y}`;
    return <path d={p} fill="none" stroke={color ?? C.focus} strokeWidth={1.4} />;
  }
  return (
    <g>
      {d.map((n, i) => (
        <rect key={i} x={x0 + i * w + 0.5} y={y - n * sc * k} width={w - 1} height={n * sc * k} fill={fill ? fill(i) : (color ?? C.second)} opacity={0.75} />
      ))}
    </g>
  );
};
/** x of a value v on a −1…11 axis between x0 and x1. */
const VX = (v: number, x0: number, x1: number) => x0 + ((v + 1) / 12) * (x1 - x0);

// 0 · Six months on one chart. A dashed line marks PSI 0.05; the PSI trace runs along the floor beneath it, flat. The
// precision trace starts high and sinks, month by month, to half its height, red. "no drift, by PSI" against
// "precision: half".
export function Hook({ t }: StepCtx) {
  const X = (m: number) => 60 + m * 95;
  const k = easeInOut(seg(t, 0.4, 2.2));
  const psi = Array.from({ length: 6 }, (_, m) => [X(m), 170 - [8, 10, 7, 9, 8, 10][m]] as Pt);
  const prec = Array.from({ length: 6 }, (_, m) => [X(m), 40 + (m / 5) * 67] as Pt);
  return (
    <Svg label="PSI stays under 0.05 for months while live precision quietly halves." h={220}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <line x1={50} y1={175} x2={545} y2={175} stroke={C.line} strokeWidth={1.2} />
        <line x1={50} y1={152} x2={545} y2={152} stroke={C.second} strokeWidth={1} strokeDasharray="4 3" />
        <T x={575} y={156} s={12} f={C.second} a="end">
          0.05
        </T>
        {[0, 1, 2, 3, 4, 5].map((m) => (
          <T key={m} x={X(m)} y={198} s={12} f={C.quiet} a="middle">
            {`m${m + 1}`}
          </T>
        ))}
      </g>
      <Draw pts={psi} t={t} from={0.4} to={2.2} stroke={C.focus} w={2} pen={false} />
      <Draw pts={prec} t={t} from={0.4} to={2.2} stroke={C.badText} w={2.4} pen={false} />
      <T x={25} y={24} s={12} f={C.badText} o={easeOut(seg(t, 0.2, 0.5))}>
        precision
      </T>
      <T x={575} y={128} s={13} f={C.badText} a="end" o={k > 0.95 ? 1 : 0}>
        half
      </T>
      <T x={300} y={140} s={12} f={C.focus} a="middle" o={easeOut(seg(t, 1.0, 1.4))}>
        PSI: no drift
      </T>
    </Svg>
  );
}

// 1 · Left: the input's histogram before (outline) and now (filled) — the same shape; ✓ same. Right: the rule the model
// learned, "orders > 5 → retained". "?" waits on what changed. After the answer the rule's arrow flips red to
// "churned": the inputs stayed put, their meaning moved — concept drift.
export function PredictWhatItMisses({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const r = on ? easeOut(seg(s, 0.2, 0.8)) : 0;
  return (
    <Svg label="what kind of drift does a per-feature distribution test structurally miss?" h={220}>
      <Hist d={CX} x0={25} x1={265} y={150} sc={0.28} k={easeOut(seg(t, 0.1, 0.7))} color={C.second} />
      <Hist d={RX} x0={25} x1={265} y={150} sc={0.28} k={easeOut(seg(t, 0.3, 0.9))} outline />
      <T x={25} y={176} s={12} f={C.secondary} o={easeOut(seg(t, 0.6, 0.9))}>
        inputs: same shape
      </T>
      <Tick x={240} y={171} k={easeOut(seg(t, 0.9, 1.2))} />
      <g opacity={easeOut(seg(t, 1.0, 1.4))}>
        <T x={320} y={70} s={13} f={C.primary}>
          orders &gt; 5
        </T>
        <line x1={320} y1={90} x2={430} y2={90} stroke={r > 0.5 ? C.badText : C.focus} strokeWidth={1.6} />
        <path d="M424 85 L430 90 L424 95" fill="none" stroke={r > 0.5 ? C.badText : C.focus} strokeWidth={1.6} />
        <T x={440} y={95} s={13} f={r > 0.5 ? C.badText : C.focus}>
          {r > 0.5 ? 'churned' : 'retained'}
        </T>
      </g>
      {!on ? (
        <T x={440} y={140} s={13} f={C.focus} o={easeOut(seg(t, 1.6, 2.0))}>
          changed: ?
        </T>
      ) : (
        <T x={320} y={140} s={13} f={C.badText} o={r}>
          concept drift
        </T>
      )}
    </Svg>
  );
}

// 2 · Two panels. Data drift: the reference histogram drawn as an outline; the current sample's bars rise one bin
// further right each beat — mean 4 → 6, the input itself moved. Concept drift: the same-shaped histogram twice, bars
// above 5 lit white as "retained" — then they flip red to "churned" while not one bar changes height.
export function RevealDataVsConceptDrift({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.3));
  const flip = seg(t, 2.6, 2.7) > 0;
  const k2 = easeOut(seg(t, 1.6, 2.3));
  const five = 12; // bin index where orders > 5 begins (−1 + 12 × 0.5)
  return (
    <Svg label="data drift: the input moves. Concept drift: the relationship to the label moves." h={240}>
      <T x={25} y={24} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        data drift
      </T>
      <Hist d={CUR} x0={25} x1={275} y={170} sc={0.3} k={a} color={C.second} />
      <Hist d={REF} x0={25} x1={275} y={170} sc={0.3} k={easeOut(seg(t, 0, 0.6))} outline />
      <T x={25} y={196} s={12} f={C.second} o={easeOut(seg(t, 1.2, 1.5))}>
        mean 4 → 6
      </T>
      <T x={325} y={24} s={13} f={C.secondary} o={easeOut(seg(t, 1.5, 1.8))}>
        concept drift
      </T>
      <Hist d={CX} x0={325} x1={575} y={170} sc={0.3} k={k2} fill={(i) => (i >= five ? (flip ? C.badText : C.focus) : C.line)} />
      <line x1={VX(5, 325, 575)} y1={44} x2={VX(5, 325, 575)} y2={176} stroke={C.secondary} strokeWidth={1} strokeDasharray="3 3" opacity={k2} />
      <T x={575} y={196} s={12} f={flip ? C.badText : C.focus} a="end" o={k2}>
        {flip ? 'over 5: churned' : 'over 5: retained'}
      </T>
      <T x={575} y={222} s={12} f={C.secondary} a="end" o={easeOut(seg(t, 3.0, 3.4))}>
        same bars, new meaning
      </T>
    </Svg>
  );
}

/** One test's verdict as a bar on a 0–1.7 scale, its flag threshold marked; value shown once the bar stops. */
const Verdict = ({ y, name, v, th, k, c }: { y: number; name: string; v: number; th: number; k: number; c: string }) => {
  const X = (x: number) => 210 + (x / 1.7) * 280;
  return (
    <g opacity={k > 0 ? 1 : 0}>
      <T x={25} y={y + 5} s={13} f={C.secondary}>
        {name}
      </T>
      <rect x={X(0)} y={y - 8} width={(X(v) - X(0)) * k} height={16} rx={2} fill={c} />
      <line x1={X(th)} y1={y - 13} x2={X(th)} y2={y + 13} stroke={C.focus} strokeWidth={1.4} strokeDasharray="2 2" />
      <T x={575} y={y + 5} s={13} f={c} a="end" o={k >= 1 ? 1 : 0}>
        {v.toFixed(3)}
      </T>
    </g>
  );
};

// 3 · The data-drift pair overlaid: reference outline, current filled, mean 4 against 6. Three verdict bars grow past
// their own flag lines: PSI 1.631, KS 0.499, Jensen-Shannon 0.512. Every one flags it.
export function RevealThreeTestsAgree({ t }: StepCtx) {
  return (
    <Svg label="PSI, KS and Jensen-Shannon, run on the same obvious shift — all three agree." h={220}>
      <Hist d={CUR} x0={25} x1={575} y={84} sc={0.16} k={easeOut(seg(t, 0.2, 0.8))} color={C.second} />
      <Hist d={REF} x0={25} x1={575} y={84} sc={0.16} k={easeOut(seg(t, 0, 0.6))} outline />
      <Verdict y={118} name="PSI" v={1.631} th={0.1} c={C.badText} k={easeOut(seg(t, 1.0, 1.8))} />
      <Verdict y={152} name="KS" v={0.499} th={0.05} c={C.badText} k={easeOut(seg(t, 1.5, 2.3))} />
      <Verdict y={186} name="Jensen-Shannon" v={0.512} th={0.1} c={C.badText} k={easeOut(seg(t, 2.0, 2.8))} />
      <T x={300} y={214} s={12} f={C.focus} a="middle" o={easeOut(seg(t, 3.0, 3.4))}>
        all three flag it
      </T>
    </Svg>
  );
}

// 4 · BASE as an outline, the shifted sample filled; 4% of values collapse onto 4.0 and one bar shoots up. PSI's nine
// decile edges drop in as dashed lines: the spike sits inside one wide bucket. KS's marker lands at 3.97, the largest
// gap. PSI 0.012, quiet; KS 0.022, more.
export function RevealDisagreementCase({ t }: StepCtx) {
  const x0 = 25;
  const x1 = 575;
  const spike = easeOut(seg(t, 0.6, 1.2));
  const sh = BASE.map((b, i) => lerp(b, SH[i], spike));
  return (
    <Svg label="a narrow, concentrated shift: PSI's coarse deciles stay quiet, KS registers more." h={220}>
      <Hist d={sh} x0={x0} x1={x1} y={130} sc={0.2} k={easeOut(seg(t, 0, 0.4))} color={C.second} />
      <Hist d={BASE} x0={x0} x1={x1} y={130} sc={0.2} k={easeOut(seg(t, 0, 0.4))} outline />
      {DEC.map((d, i) => (
        <line key={d} x1={VX(d, x0, x1)} y1={20} x2={VX(d, x0, x1)} y2={136} stroke={C.focus} strokeWidth={1} strokeDasharray="3 3" opacity={easeOut(seg(t, 1.4 + i * 0.06, 1.7 + i * 0.06))} />
      ))}
      <T x={25} y={18} s={12} f={C.secondary} o={easeOut(seg(t, 1.6, 1.9))}>
        PSI's deciles
      </T>
      <g opacity={easeOut(seg(t, 2.4, 2.8))}>
        <line x1={VX(3.97, x0, x1)} y1={136} x2={VX(3.97, x0, x1)} y2={150} stroke={C.badText} strokeWidth={2} />
        <T x={VX(3.97, x0, x1)} y={166} s={12} f={C.badText} a="middle">
          KS gap
        </T>
      </g>
      <T x={25} y={200} s={13} f={C.secondary} o={easeOut(seg(t, 2.8, 3.2))}>
        PSI 0.012, quiet
      </T>
      <T x={575} y={200} s={13} f={C.badText} a="end" o={easeOut(seg(t, 3.2, 3.6))}>
        KS 0.022, more
      </T>
    </Svg>
  );
}

// 5 · The clean column as an outline. 354 values drain out of it into a "null" bucket — 11.8%. Then mean-imputation pours
// them all back into the one bin holding 3.96: that bar jumps from 409 to 714. A distribution test reads 0.091, under
// its 0.1 flag line. The null-rate check reads 11.8%, red.
export function RevealNullRateCreep({ t }: StepCtx) {
  const drain = easeOut(seg(t, 0.6, 1.4));
  const fill = easeOut(seg(t, 1.8, 2.6));
  const now = CLEAN.map((c, i) => {
    const out = i === 9 ? CLEAN[i] - (IMP[i] - 354) : CLEAN[i] - IMP[i];
    const after = c - out * drain;
    return i === 9 ? after + 354 * fill : after;
  });
  return (
    <Svg label="mean-imputation absorbs a null-rate creep; the null-rate check still catches it." h={220}>
      <Hist d={now} x0={25} x1={400} y={150} sc={0.17} k={easeOut(seg(t, 0, 0.4))} color={C.second} />
      <Hist d={CLEAN} x0={25} x1={400} y={150} sc={0.17} k={easeOut(seg(t, 0, 0.4))} outline />
      <g opacity={easeOut(seg(t, 0.5, 0.8))}>
        <rect x={470} y={150 - 354 * 0.17 * drain * (1 - fill)} width={60} height={354 * 0.17 * drain * (1 - fill)} fill={C.badText} opacity={0.75} />
        <line x1={460} y1={150} x2={540} y2={150} stroke={C.line} strokeWidth={1.2} />
        <T x={500} y={170} s={12} f={C.badText} a="middle">
          null
        </T>
      </g>
      <T x={VX(3.96, 25, 400)} y={20} s={12} f={C.second} a="middle" o={easeOut(seg(t, 2.4, 2.8))}>
        imputed 3.96
      </T>
      <T x={25} y={196} s={13} f={C.secondary} o={easeOut(seg(t, 2.8, 3.2))}>
        PSI 0.091, under 0.1
      </T>
      <T x={575} y={196} s={13} f={C.badText} a="end" o={easeOut(seg(t, 3.2, 3.6))}>
        null rate 11.8%
      </T>
    </Svg>
  );
}

// 6 · A timeline from the prediction to the label, weeks later; a dot crawls toward the label and doesn't get there.
// In the gap, four named proxies light in turn — inputs, outputs, confidence, downstream — each tagged "proxy", none the
// label.
export function RevealProxyMetrics({ t }: StepCtx) {
  const crawl = easeInOut(seg(t, 0.3, 3.6));
  const P = ['inputs', 'outputs', 'confidence', 'downstream'];
  return (
    <Svg label="while the true label is weeks away, a team watches named proxies instead." h={220}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <line x1={60} y1={40} x2={540} y2={40} stroke={C.line} strokeWidth={1.2} />
        <line x1={60} y1={30} x2={60} y2={50} stroke={C.focus} strokeWidth={2} />
        <line x1={540} y1={30} x2={540} y2={50} stroke={C.second} strokeWidth={2} strokeDasharray="3 2" />
        <T x={60} y={70} s={12} f={C.focus} a="middle">
          prediction
        </T>
        <T x={540} y={70} s={12} f={C.second} a="middle">
          label, weeks
        </T>
      </g>
      <circle cx={lerp(60, 470, crawl)} cy={40} r={5} fill={C.focus} />
      {P.map((p, i) => {
        const x = 25 + i * 140;
        const k = easeOut(seg(t, 0.8 + i * 0.6, 1.2 + i * 0.6));
        return (
          <g key={p} opacity={k}>
            <rect x={x} y={100} width={130} height={60} rx={5} fill={C.panel} stroke={C.line} strokeWidth={1.2} />
            <T x={x + 65} y={124} s={13} f={C.primary} a="middle">
              {p}
            </T>
            <T x={x + 65} y={146} s={12} f={C.second} a="middle">
              proxy
            </T>
          </g>
        );
      })}
      <T x={300} y={200} s={13} f={C.secondary} a="middle" w={600} o={easeOut(seg(t, 3.4, 3.8))}>
        stand-ins, not the label
      </T>
    </Svg>
  );
}

// 7 · The concept-drift pair overlaid, near identical. A PSI needle sits at 0.007, flat against its 0.1 line. Beside it
// a precision bar starts full at 1.00 and drains, all the way, to 0.00: of 745 predicted "retained", none were.
export function RevealProxyDoesNotProve({ t }: StepCtx) {
  const drop = easeIn(seg(t, 1.6, 2.8));
  return (
    <Svg label="PSI on the feature stayed near zero while real precision collapsed from 1.00 to 0.00." h={220}>
      <Hist d={CX} x0={25} x1={300} y={130} sc={0.22} k={easeOut(seg(t, 0, 0.6))} color={C.second} />
      <Hist d={RX} x0={25} x1={300} y={130} sc={0.22} k={easeOut(seg(t, 0, 0.6))} outline />
      <g opacity={easeOut(seg(t, 0.7, 1.1))}>
        <T x={25} y={162} s={13} f={C.secondary}>
          PSI 0.007
        </T>
        <line x1={150} y1={158} x2={300} y2={158} stroke={C.line} strokeWidth={6} />
        <rect x={150} y={155} width={150 * (0.007 / 0.2)} height={6} fill={C.focus} />
        <line x1={225} y1={150} x2={225} y2={166} stroke={C.focus} strokeWidth={1.2} strokeDasharray="2 2" />
      </g>
      <g opacity={easeOut(seg(t, 1.0, 1.4))}>
        <T x={430} y={24} s={13} f={C.secondary} a="middle">
          precision
        </T>
        <rect x={400} y={40} width={60} height={110} fill="none" stroke={C.line} strokeWidth={1.2} />
        <rect x={400} y={40 + 110 * drop} width={60} height={110 * (1 - drop)} fill={drop > 0.5 ? C.badText : C.focus} opacity={0.8} />
        <T x={480} y={50} s={13} f={C.focus} o={1 - drop}>
          1.00
        </T>
        <T x={480} y={150} s={13} f={C.badText} o={drop >= 1 ? 1 : 0}>
          0.00
        </T>
      </g>
      <T x={575} y={200} s={12} f={C.badText} a="end" w={600} o={easeOut(seg(t, 3.0, 3.4))}>
        no warning from the proxy
      </T>
    </Svg>
  );
}

/** Quadratic ease-in. */
const easeIn = (x: number) => x * x;
type Pt = readonly [number, number];

// 8 · Four lanes draw in turn, each a tiny picture: a moved histogram beside a flipped arrow; three bars of different
// heights; a null bucket; a proxy gauge with a "?" beside it.
export function Recap({ t }: StepCtx) {
  const k = (i: number) => easeOut(seg(t, i * 1.0, i * 1.0 + 0.5));
  const ROWS = ['data vs concept', 'tests disagree', 'check the null rate', 'proxy: a hint'];
  return (
    <Svg label="data drift vs. concept drift. Three tests that disagree on purpose. A null-rate check. Proxies that only partly prove." h={270}>
      {ROWS.map((r, i) => {
        const y = 40 + i * 64;
        return (
          <g key={r} opacity={k(i)}>
            <T x={25} y={y + 5} s={13} f={C.secondary}>
              {r}
            </T>
            {i === 0 && (
              <g>
                <Hist d={CUR} x0={300} x1={420} y={y + 16} sc={0.07} color={C.second} />
                <path d={`M460 ${y} h60`} stroke={C.badText} strokeWidth={1.6} />
                <path d={`M514 ${y - 5} L520 ${y} L514 ${y + 5}`} fill="none" stroke={C.badText} strokeWidth={1.6} />
              </g>
            )}
            {i === 1 &&
              [0.9, 0.35, 0.6].map((v, j) => (
                <rect
                  key={j}
                  x={320 + j * 40}
                  y={y + 14 - 34 * v * easeOut(seg(t, 1.2 + j * 0.1, 1.6 + j * 0.1))}
                  width={26}
                  height={34 * v * easeOut(seg(t, 1.2 + j * 0.1, 1.6 + j * 0.1))}
                  fill={C.primary}
                  opacity={0.6}
                />
              ))}
            {i === 2 && (
              <g>
                <rect x={320} y={y - 14} width={50} height={28} fill={C.badText} opacity={0.75} />
                <T x={390} y={y + 5} s={12} f={C.badText}>
                  null
                </T>
              </g>
            )}
            {i === 3 && (
              <g>
                <path d={`M320 ${y + 12} A 26 26 0 0 1 372 ${y + 12}`} fill="none" stroke={C.line} strokeWidth={4} />
                <line x1={346} y1={y + 12} x2={346 + 22 * Math.cos(-Math.PI * 0.7)} y2={y + 12 + 22 * Math.sin(-Math.PI * 0.7)} stroke={C.focus} strokeWidth={2} />
                <T x={400} y={y + 8} s={14} f={C.focus}>
                  ?
                </T>
              </g>
            )}
          </g>
        );
      })}
    </Svg>
  );
}

// 9 · Three test chips, PSI, KS and JS, each "no drift" with a ✓. Beside them a precision trace falling. Before the
// answer: "trust which?". After: the three ✓ grey out — they never saw the label — and the falling trace lights red:
// look for concept drift.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const r = on ? easeOut(seg(s, 0.2, 0.8)) : 0;
  const N = ['PSI', 'KS', 'JS'];
  return (
    <Svg label="PSI, KS and JS all agree there's no drift; precision has visibly dropped anyway." h={220}>
      {N.map((n, i) => (
        <g key={n} opacity={easeOut(seg(t, i * 0.2, 0.4 + i * 0.2)) * (1 - 0.6 * r)}>
          <rect x={25} y={20 + i * 46} width={220} height={34} rx={5} fill={C.panel} stroke={C.line} strokeWidth={1.2} />
          <T x={40} y={42 + i * 46} s={13} f={C.primary}>
            {n}
          </T>
          <T x={110} y={42 + i * 46} s={12} f={C.secondary}>
            no drift
          </T>
          <Tick x={222} y={37 + i * 46} k={1} />
        </g>
      ))}
      <Draw
        pts={
          [
            [300, 40],
            [380, 60],
            [460, 100],
            [560, 140],
          ] as Pt[]
        }
        t={t}
        from={0.6}
        to={1.6}
        stroke={r > 0.5 ? C.badText : C.focus}
        w={2.4}
        pen={false}
      />
      <T x={300} y={170} s={12} f={C.secondary} o={easeOut(seg(t, 0.8, 1.1))}>
        precision
      </T>
      {!on ? (
        <T x={575} y={200} s={13} f={C.focus} a="end" o={easeOut(seg(t, 1.8, 2.2))}>
          trust which?
        </T>
      ) : (
        <T x={25} y={200} s={13} f={C.badText} w={600} o={r}>
          the tests never saw the label
        </T>
      )}
    </Svg>
  );
}
