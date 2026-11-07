import { useEffect, useState } from 'react';
import { C, Draw, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// Communicating trade-offs to decision-makers, drawn from examples.py's restatement of the previous topic's tiers:
// daily cost = $40 base + (1,440 ÷ freshness) recomputes × $6, plus $150 streaming at 15 minutes or fresher — fast
// $1,918, medium $184, slow $46 — and its illustrative wrong-number risk per day, $0.83, $10, $240. The fast–medium
// gap, $1,734, is 100% recompute frequency. The twelve pages, five minutes and two weeks are the hook's own scenario.

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

/** A page glyph with `n` text lines; `hl` lines drawn bright. */
const Page = ({ x, y, w = 70, h = 90, n = 6, hl = 1, c = C.secondary, o = 1 }: { x: number; y: number; w?: number; h?: number; n?: number; hl?: number; c?: string; o?: number }) =>
  o <= 0 ? null : (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={h} rx={3} fill={C.panel} stroke={c} strokeWidth={1.2} />
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={x + 8} y={y + 12 + i * ((h - 20) / n)} width={i < hl ? w - 16 : (w - 16) * (i % 3 === 2 ? 0.6 : 0.9)} height={4} rx={1} fill={i < hl ? C.focus : C.line} />
      ))}
    </g>
  );

// examples.py, restating topic 1's tiers: daily cost = $40 base + (1,440 ÷ freshness) recomputes × $6, + $150
// streaming at 15 minutes or fresher. Fast: 40 + 288 × 6 + 150 = $1,918. Medium: 40 + 24 × 6 = $184. Slow: 40 + 6 = $46.
// Its illustrative wrong-number risk per day: (freshness ÷ 60) × $500 × 0.02 = $0.83, $10, $240. The fast–medium gap
// is $1,734, all of it recompute frequency (with the streaming surcharge): 100%.
const TIERS: [string, string, string, string][] = [
  ['fast', '288 runs a day, streaming', '$1,918', '$0.83'],
  ['medium', '24 runs a day', '$184', '$10'],
  ['slow', '1 run a day', '$46', '$240'],
];

// 0 · The same recommendation twice: one page, and a stack of twelve. The one page meets a five-minute clock and gets
// ✓ approved. The stack meets the same clock, runs out, and slides to "tabled for two weeks".
export function Hook({ t }: StepCtx) {
  const clock = seg(t, 1.0, 2.4);
  return (
    <Svg label="the same recommendation, the medium tier, read by two different rooms; the short one gets approved in five minutes, the long one tables the decision for two weeks." h={220}>
      <Page x={60} y={30} hl={2} o={easeOut(seg(t, 0, 0.4))} />
      {Array.from({ length: 12 }, (_, i) => (
        <Page key={i} x={360 + i * 4} y={30 + i * 3} hl={i === 11 ? 2 : 0} o={easeOut(seg(t, 0.3 + i * 0.03, 0.6 + i * 0.03))} />
      ))}
      <T x={95} y={172} s={12} f={C.secondary} a="middle" o={easeOut(seg(t, 0.2, 0.5))}>
        one page
      </T>
      <T x={420} y={172} s={12} f={C.secondary} a="middle" o={easeOut(seg(t, 0.6, 0.9))}>
        twelve pages
      </T>
      <g opacity={easeOut(seg(t, 0.8, 1.0))}>
        <circle cx={250} cy={74} r={22} fill="none" stroke={C.line} strokeWidth={1.4} />
        <path d={`M250 74 L${250 + 18 * Math.sin(clock * 6.28)} ${74 - 18 * Math.cos(clock * 6.28)}`} stroke={C.focus} strokeWidth={1.6} />
        <T x={250} y={116} s={11} f={C.quiet} a="middle">
          5 minutes
        </T>
      </g>
      <Tick x={152} y={192} k={easeOut(seg(t, 2.0, 2.3))} />
      <T x={95} y={198} s={12} f={C.focus} a="middle" o={easeOut(seg(t, 2.0, 2.3))}>
        approved
      </T>
      <T x={420} y={198} s={12} f={C.badText} a="middle" o={easeOut(seg(t, 2.5, 2.8))}>
        tabled for two weeks
      </T>
      <T x={300} y={16} s={11} f={C.secondary} a="middle" o={easeOut(seg(t, 3.0, 3.4))}>
        same decision, same facts
      </T>
    </Svg>
  );
}

// 1 · The two documents with their first line marked — the same recommendation in both. "What changed?" After the
// answer an = joins the two first lines (unchanged), and a length bracket lights beside each: the shape decided it.
export function PredictWhyDifferent({ t, answer }: StepCtx) {
  const on = answer !== null;
  const s = useSinceAnswer(on);
  return (
    <Svg label="why did the identical recommendation land so differently in the same room?" h={180}>
      <Page x={60} y={20} h={50} n={3} hl={1} o={easeOut(seg(t, 0, 0.3))} />
      <Page x={240} y={20} h={150} n={12} hl={1} o={easeOut(seg(t, 0.2, 0.5))} />
      <T x={575} y={60} s={14} f={C.focus} a="end" o={on ? 0 : easeOut(seg(t, 0.8, 1.2))}>
        what changed?
      </T>
      {on && (
        <g>
          <g opacity={easeOut(seg(s, 0.2, 0.5))}>
            <T x={185} y={38} s={16} f={C.focus} a="middle">
              =
            </T>
            <T x={330} y={38} s={12} f={C.focus}>
              the decision: same
            </T>
          </g>
          <g opacity={easeOut(seg(s, 0.9, 1.3))}>
            <path d="M48 20 h-6 v50 h6" fill="none" stroke={C.second} strokeWidth={1.6} />
            <path d="M228 20 h-6 v150 h6" fill="none" stroke={C.second} strokeWidth={1.6} />
            <T x={330} y={110} s={13} f={C.second}>
              the length and shape
            </T>
            <T x={330} y={134} s={13} f={C.second}>
              decided it
            </T>
          </g>
        </g>
      )}
    </Svg>
  );
}

// 2 · The three tiers in the terms that built them — 288 runs a day plus streaming, 24 runs, 1 run. Each row's
// engineering words dissolve and its business terms write in: dollars a day, and the risk of a wrong number per day.
export function RevealCostInBusinessTerms({ t }: StepCtx) {
  const sw = easeInOut(seg(t, 1.4, 2.2));
  return (
    <Svg label="the same three tiers, restated in dollars and in the risk of a wrong number reaching a plant manager, not the terms that built them." h={200}>
      <g opacity={sw}>
        <T x={300} y={24} s={11} f={C.quiet} a="end">
          per day
        </T>
        <T x={560} y={24} s={11} f={C.quiet} a="end">
          wrong-number risk
        </T>
      </g>
      {TIERS.map(([n, eng, usd, risk], i) => {
        const y = 60 + i * 44;
        return (
          <g key={n} opacity={easeOut(seg(t, 0.2 + i * 0.2, 0.5 + i * 0.2))}>
            <T x={25} y={y} s={13} f={i === 1 ? C.focus : C.primary}>
              {n}
            </T>
            <T x={120} y={y} s={12} f={C.secondary} o={1 - sw}>
              {eng}
            </T>
            <T x={300} y={y} s={13} f={C.focus} a="end" o={easeOut(seg(t, 2.0 + i * 0.3, 2.3 + i * 0.3))}>
              {usd}
            </T>
            <T x={560} y={y} s={13} f={i === 2 ? C.badText : C.primary} a="end" o={easeOut(seg(t, 2.2 + i * 0.3, 2.5 + i * 0.3))}>
              {risk}
            </T>
          </g>
        );
      })}
      <T x={25} y={190} s={11} f={C.quiet} o={easeOut(seg(t, 3.0, 3.4))}>
        examples.py's own illustrative pricing
      </T>
    </Svg>
  );
}

// 3 · Fast and medium as stacked cost bars: the same $40 base in both, then recompute-and-streaming — $1,878 against
// $144. The base segments fade as equal; the recompute segment lights: 100% of the $1,734 gap, one lever, named.
export function RevealDominantLever({ t }: StepCtx) {
  const sc = 0.24;
  const g = easeOut(seg(t, 0.4, 1.4));
  const lit = easeOut(seg(t, 2.0, 2.4));
  const Bar = ({ y, base, rec, l }: { y: number; base: number; rec: number; l: string }) => (
    <g>
      <T x={25} y={y + 15} s={12} f={C.primary}>
        {l}
      </T>
      <rect x={100} y={y} width={base * sc * g} height={22} fill={C.line} opacity={1 - 0.5 * lit} />
      <rect x={100 + base * sc} y={y} width={rec * sc * g} height={22} fill={lit > 0.5 ? C.badText : C.secondary} />
    </g>
  );
  return (
    <Svg label="of everything that makes the fast tier expensive, one lever — how often it recomputes — drives nearly all of the gap." h={200}>
      <Bar y={30} base={40} rec={1878} l="fast" />
      <Bar y={76} base={40} rec={144} l="medium" />
      <T x={100} y={126} s={11} f={C.quiet} o={easeOut(seg(t, 1.4, 1.7))}>
        $40 base: the same in both
      </T>
      <T x={575} y={66} s={12} f={C.secondary} a="end" o={easeOut(seg(t, 1.4, 1.7))}>
        $1,918
      </T>
      <T x={186} y={92} s={12} f={C.secondary} o={easeOut(seg(t, 1.4, 1.7))}>
        $184
      </T>
      <g opacity={easeOut(seg(t, 2.4, 2.8))}>
        <T x={25} y={164} s={13} f={C.badText}>
          how often it recomputes: 100% of the gap
        </T>
      </g>
      <T x={25} y={190} s={12} f={C.secondary} o={easeOut(seg(t, 3.0, 3.4))}>
        one lever, named, not five in a list
      </T>
    </Svg>
  );
}

// 4 · Cost and wrong-number risk side by side for each tier: fast is cheapest on risk but its cost bar runs off; slow is
// cheapest but its risk bar runs off. Medium's two bars both stay short — and it lights: not the fastest, on purpose.
export function RevealBoringChoice({ t }: StepCtx) {
  const g = easeOut(seg(t, 0.4, 1.6));
  const cost = [1918, 184, 46];
  const risk = [0.83, 10, 240];
  const lit = easeOut(seg(t, 2.0, 2.4));
  return (
    <Svg label="the medium tier isn't the fastest option, and that's the argument for it, stated in terms a non-engineer weighs." h={200}>
      <T x={120} y={22} s={11} f={C.quiet} o={easeOut(seg(t, 0.2, 0.5))}>
        cost a day
      </T>
      <T x={360} y={22} s={11} f={C.quiet} o={easeOut(seg(t, 0.2, 0.5))}>
        wrong-number risk
      </T>
      {TIERS.map(([n, , usd, r], i) => {
        const y = 40 + i * 44;
        const med = i === 1;
        return (
          <g key={n} opacity={med ? 1 : 1 - 0.5 * lit}>
            <T x={25} y={y + 14} s={13} f={med && lit > 0.5 ? C.focus : C.primary}>
              {n}
            </T>
            <rect x={120} y={y} width={Math.min(150, (cost[i] / 1918) * 150) * g} height={20} fill={med && lit > 0.5 ? C.focus : C.secondary} />
            <T x={340} y={y + 14} s={11} f={C.secondary} a="end" o={g}>
              {usd}
            </T>
            <rect x={360} y={y} width={Math.min(150, (risk[i] / 240) * 150) * g} height={20} fill={med && lit > 0.5 ? C.focus : C.secondary} />
            <T x={575} y={y + 14} s={11} f={C.secondary} a="end" o={g}>
              {r}
            </T>
          </g>
        );
      })}
      <T x={25} y={188} s={13} f={C.focus} o={easeOut(seg(t, 2.4, 2.8))}>
        not the fastest, and that's the argument
      </T>
    </Svg>
  );
}

// 5 · A one-page summary sits on top for the five-minute room; it slides aside and the long deep dive behind it comes
// into view for the review that checks the reasoning.
export function RevealBluf({ t }: StepCtx) {
  const slide = easeInOut(seg(t, 1.8, 2.8));
  return (
    <Svg label="a one-page summary for the room with five minutes, decoded away to reveal the much longer document behind it for the review that checks the reasoning." h={220}>
      {Array.from({ length: 8 }, (_, i) => (
        <Page key={i} x={240 + i * 5} y={30 + i * 3} w={110} h={110} n={9} hl={0} o={easeOut(seg(t, 1.6, 2.0))} />
      ))}
      <g transform={`translate(${lerp(0, -200, slide)} 0)`} opacity={easeOut(seg(t, 0, 0.4))}>
        <Page x={240} y={30} w={110} h={130} n={4} hl={1} c={C.focus} />
        <T x={295} y={180} s={12} f={C.focus} a="middle">
          conclusion first
        </T>
      </g>
      <T x={95} y={208} s={11} f={C.quiet} a="middle" o={slide}>
        the five-minute room
      </T>
      <T x={575} y={200} s={12} f={C.second} a="end" o={easeOut(seg(t, 2.8, 3.2))}>
        the deep dive, for review
      </T>
    </Svg>
  );
}

// 6 · Two documents side by side. Pieces fly into each: recommendation, cost, the one lever into the one-pager; the
// full tier comparison, every non-goal, the error-budget math into the deep dive. Neither hides anything from its reader.
export function RevealWhatBelongsWhere({ t }: StepCtx) {
  const one = ['medium tier', '$184 vs $1,918', 'lever: recompute'];
  const deep = ['all three tiers', 'every non-goal', 'error-budget math'];
  return (
    <Svg label="the one-pager carries the recommendation, the cost, and the one dominant lever; the deep dive carries the full comparison, the non-goals and the error-budget math." h={200}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <rect x={25} y={20} width={250} height={150} rx={4} fill={C.panel} stroke={C.focus} strokeWidth={1.3} />
        <T x={41} y={40} s={11} f={C.quiet}>
          one page
        </T>
        <rect x={325} y={20} width={250} height={150} rx={4} fill={C.panel} stroke={C.second} strokeWidth={1.3} />
        <T x={341} y={40} s={11} f={C.quiet}>
          deep dive
        </T>
      </g>
      {one.map((l, i) => {
        const k = easeOutBack(seg(t, 0.5 + i * 0.4, 0.9 + i * 0.4));
        return (
          <T key={l} x={lerp(150, 41, Math.min(1, k))} y={72 + i * 30} s={13} f={C.focus} o={Math.min(1, k)}>
            {l}
          </T>
        );
      })}
      {deep.map((l, i) => {
        const k = easeOutBack(seg(t, 2.0 + i * 0.4, 2.4 + i * 0.4));
        return (
          <T key={l} x={lerp(450, 341, Math.min(1, k))} y={72 + i * 30} s={13} f={C.second} o={Math.min(1, k)}>
            {l}
          </T>
        );
      })}
      <T x={300} y={192} s={12} f={C.secondary} a="middle" o={easeOut(seg(t, 3.4, 3.8))}>
        same decision, two honest documents
      </T>
    </Svg>
  );
}

// 7 · Four lines with their pictures: dollars replacing runs, the one red lever segment, medium's two short bars, the
// one page in front of the stack.
export function Recap({ t }: StepCtx) {
  const L: [string, string][] = [
    ['business terms', 'dollars and risk, not runs'],
    ['one lever', 'named: how often it recomputes'],
    ['the boring choice', 'defended out loud'],
    ['one page + deep dive', 'neither one lies by omission'],
  ];
  const k = (i: number) => easeOut(seg(t, 0.3 + i * 0.8, 0.7 + i * 0.8));
  return (
    <Svg label="the same decision, restated in business terms, its one dominant lever named, a boring choice defended, and a one-page summary paired with the deep dive behind it." h={300}>
      {L.map(([a, b], i) => (
        <g key={a} opacity={k(i)}>
          <T x={25} y={40 + i * 70} s={13} f={C.secondary}>
            {a}
          </T>
          <T x={25} y={62 + i * 70} s={13} f={C.primary}>
            {b}
          </T>
        </g>
      ))}
      <g opacity={k(0)}>
        <T x={575} y={50} s={14} f={C.focus} a="end">
          $184
        </T>
      </g>
      <g opacity={k(1)}>
        <rect x={470} y={104} width={10} height={16} fill={C.line} />
        <rect x={480} y={104} width={90} height={16} fill={C.badText} />
      </g>
      <g opacity={k(2)}>
        <rect x={470} y={172} width={30} height={10} fill={C.focus} />
        <rect x={520} y={172} width={14} height={10} fill={C.focus} />
      </g>
      <g opacity={k(3)}>
        <Page x={520} y={226} w={40} h={52} n={6} hl={0} />
        <Page x={500} y={232} w={40} h={52} n={3} hl={1} c={C.focus} />
      </g>
    </Svg>
  );
}

// 8 · A one-pager whose bottom line lists the three tiers; the reader's eye stops at the first — fast — and approves it.
// "What's missing?" After the answer two lines write in above everything else: "recommended: medium" and "lever:
// recompute, 100% of the gap". The fast approval is struck.
export function ProveIt({ t, answer }: StepCtx) {
  const on = answer !== null;
  const s = useSinceAnswer(on);
  const eye = easeOut(seg(t, 0.8, 1.4));
  return (
    <Svg label="a stakeholder reads only the one-pager's bottom line and approves the fastest tier because faster sounds strictly better. What's missing from the one-pager itself?" h={200}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <rect x={25} y={14} width={300} height={176} rx={4} fill={C.panel} stroke={C.secondary} strokeWidth={1.3} />
        {['fast: 5 min, $1,918', 'medium: 60 min, $184', 'slow: 1 day, $46'].map((l, i) => (
          <T key={l} x={41} y={110 + i * 26} s={12} f={i === 0 && eye > 0.5 ? C.focus : C.secondary}>
            {l}
          </T>
        ))}
      </g>
      <rect x={35} y={96} width={270} height={20} rx={3} fill="none" stroke={C.focus} strokeWidth={1.4} opacity={eye} />
      <g opacity={easeOut(seg(t, 1.6, 1.9))}>
        <T x={350} y={110} s={13} f={on ? C.badText : C.focus}>
          approved: fast
        </T>
        <Cross x={500} y={106} k={on ? easeOut(seg(s, 1.6, 1.8)) : 0} />
      </g>
      <T x={575} y={50} s={14} f={C.focus} a="end" o={on ? 0 : easeOut(seg(t, 2.0, 2.4))}>
        what's missing?
      </T>
      {on &&
        ['recommended: medium', 'lever: recompute, 100%'].map((l, i) => {
          const w = seg(s, 0.3 + i * 0.6, 0.9 + i * 0.6);
          return (
            <T key={l} x={41} y={40 + i * 26} s={13} f={C.second}>
              {l.slice(0, Math.round(l.length * w))}
            </T>
          );
        })}
    </Svg>
  );
}
