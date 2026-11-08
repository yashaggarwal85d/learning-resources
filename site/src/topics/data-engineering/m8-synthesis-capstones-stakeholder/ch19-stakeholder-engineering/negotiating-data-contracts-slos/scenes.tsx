import { useEffect, useState } from 'react';
import { C, Decode, Draw, Reticle, Svg, T } from '../../../../../reels/kit';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// Negotiating data contracts and SLOs, drawn from examples.py: its three disclosed, illustrative tiers (fast 5 min at
// $1,918 a day, medium 60 min at $184, slow 1,440 min at $46), each with its own non-goal and named breach owner, and
// the fast tier's 99.9% quarterly error budget, 90 × 1,440 = 129,600 minutes × 0.001 = 129.6 minutes, of which a
// 20-minute breach spends 15.4%. The hook's drained budget is the step's own scenario, drawn without a figure.

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

// examples.py's three tiers (its own illustrative, disclosed pricing): fast 5-minute freshness at $1,918 a day, owned
// by the platform on-call engineer; medium 60 minutes at $184, the data platform team; slow 1,440 minutes at $46, the
// nightly batch pipeline owner. Fast tier SLO 99.9% over a 90-day quarter: 129,600 minutes × 0.001 = 129.6 minutes of
// budget; a 20-minute breach spends 20 ÷ 129.6 = 15.4% of it.
const TIERS: [string, string, string, string][] = [
  ['fast', '5 min', '$1,918/day', 'platform on-call engineer'],
  ['medium', '60 min', '$184/day', 'data platform team'],
  ['slow', '1,440 min', '$46/day', 'nightly batch pipeline owner'],
];

// 0 · A request card, "real-time, every plant". Engineering ships it: five plant feeds stream live. Beside them the
// quarter's infrastructure budget drains to nothing, red. Then a blame arrow swings back onto engineering.
export function Hook({ t }: StepCtx) {
  const drain = easeInOut(seg(t, 1.4, 2.6));
  const blame = easeOut(seg(t, 2.8, 3.3));
  return (
    <Svg label="a stakeholder asks for real-time dashboards for all plants; engineering ships exactly that, at a cost that consumes the whole quarter's budget." h={220}>
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <Box x={25} y={20} w={240} label="real-time, every plant" />
      </g>
      <g opacity={easeOut(seg(t, 0.5, 0.9))}>
        <T x={25} y={84} s={12} f={C.secondary}>
          shipped, to the letter
        </T>
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <rect x={25 + i * 48} y={96} width={38} height={30} rx={3} fill={C.panel} stroke={C.line} strokeWidth={1.1} />
            <circle cx={44 + i * 48} cy={111} r={3 + 2 * Math.abs(Math.sin(t * 5 + i))} fill={C.second} />
          </g>
        ))}
      </g>
      <g opacity={easeOut(seg(t, 1.1, 1.4))}>
        <T x={330} y={36} s={12} f={C.secondary}>
          the quarter's budget
        </T>
        <rect x={330} y={46} width={245} height={24} rx={3} fill="none" stroke={C.line} strokeWidth={1.2} />
        <rect x={330 + 245 * drain} y={46} width={245 * (1 - drain)} height={24} rx={3} fill={C.focus} opacity={0.7} />
        <rect x={330} y={46} width={245 * drain} height={24} rx={3} fill={C.badText} opacity={0.35} />
      </g>
      <T x={575} y={94} s={13} f={C.badText} a="end" o={easeOut(seg(t, 2.5, 2.8))}>
        all of it, spent
      </T>
      <g opacity={blame}>
        <path d="M450 110 C450 170 200 180 140 140" fill="none" stroke={C.badText} strokeWidth={1.4} />
        <path d="M148 134 l-8 6 l10 3" fill="none" stroke={C.badText} strokeWidth={1.4} />
        <T x={300} y={200} s={12} f={C.badText} a="middle">
          and engineering takes the blame
        </T>
      </g>
    </Svg>
  );
}

// 1 · A blank page, "the missing document: ?". After the answer it writes itself line by line — real-time priced
// against its alternatives, an owner if it breaks — and is stamped "before the build".
export function PredictWhatWentWrong({ t, answer }: StepCtx) {
  const on = answer !== null;
  const s = useSinceAnswer(on);
  const lines = ['tiers, each priced', 'who owns a breach'];
  return (
    <Svg label="what went wrong, and what single document would have prevented it?" h={180}>
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <rect x={25} y={14} width={240} height={150} rx={4} fill={C.panel} stroke={C.secondary} strokeWidth={1.3} />
        <T x={41} y={38} s={12} f={C.quiet}>
          {on ? 'data contract' : 'the missing document'}
        </T>
      </g>
      <T x={575} y={90} s={14} f={C.focus} a="end" o={on ? 0 : easeOut(seg(t, 0.8, 1.2))}>
        what would it say?
      </T>
      {on &&
        lines.map((l, i) => {
          const w = seg(s, 0.3 + i * 0.6, 0.9 + i * 0.6);
          return (
            <g key={l}>
              <T x={41} y={74 + i * 32} s={13} f={C.focus}>
                {l.slice(0, Math.round(l.length * w))}
              </T>
              <Tick x={248} y={70 + i * 32} k={w >= 1 ? 1 : 0} />
            </g>
          );
        })}
      {on && (
        <g opacity={easeOut(seg(s, 1.7, 2.1))}>
          <rect x={300} y={120} width={180} height={34} rx={4} fill="none" stroke={C.second} strokeWidth={1.6} transform="rotate(-4 390 137)" />
          <T x={390} y={142} s={13} f={C.second} a="middle">
            before the build
          </T>
        </g>
      )}
    </Svg>
  );
}

// 2 · Producer and consumer. A speech bubble "we'll keep it fresh" floats between them and is struck. In its place a
// written page slides across with two lines: the dataset's shape, its freshness.
export function RevealWhatAContractIs({ t }: StepCtx) {
  const doc = easeInOut(seg(t, 1.8, 2.6));
  return (
    <Svg label="a written set of guarantees a producer makes to a consumer, not a verbal promise either side quietly assumes." h={200}>
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <Box x={25} y={70} w={120} label="producer" />
        <Box x={455} y={70} w={120} label="consumer" />
      </g>
      <g opacity={easeOut(seg(t, 0.5, 0.8)) * (1 - doc)}>
        <rect x={210} y={20} width={180} height={34} rx={14} fill={C.panel} stroke={C.line} strokeWidth={1.2} />
        <T x={300} y={42} s={12} f={C.secondary} a="middle">
          "we'll keep it fresh"
        </T>
      </g>
      <Cross x={400} y={37} k={easeOut(seg(t, 1.2, 1.4)) * (1 - doc)} />
      <g transform={`translate(${lerp(-150, 0, doc)} 0)`} opacity={doc}>
        <rect x={195} y={50} width={210} height={100} rx={4} fill={C.panel} stroke={C.focus} strokeWidth={1.4} />
        <T x={211} y={72} s={11} f={C.quiet}>
          in writing, upfront
        </T>
        <T x={211} y={104} s={13} f={C.focus}>
          shape: its columns
        </T>
        <T x={211} y={132} s={13} f={C.focus}>
          freshness: stated
        </T>
      </g>
      <T x={300} y={186} s={12} f={C.secondary} a="middle" o={easeOut(seg(t, 2.8, 3.2))}>
        never assumed by either side
      </T>
    </Svg>
  );
}

// 3 · Cost against freshness on a log axis: a curve, with real-time at its expensive top. Three tiers drop onto it from
// examples.py's own disclosed, illustrative pricing: fast 5 min $1,918/day, medium 60 min $184, slow 1,440 min $46.
export function RevealPricingTiers({ t }: StepCtx) {
  const X = (min: number) => 80 + (Math.log10(min) / Math.log10(1440)) * 420;
  const Y = (usd: number) => 180 - (Math.log10(usd / 30) / Math.log10(2000 / 30)) * 150;
  const pts: [number, number][] = [
    [5, 1918],
    [60, 184],
    [1440, 46],
  ];
  const curve = easeInOut(seg(t, 0.4, 1.4));
  return (
    <Svg label="real-time is the top of a curve, not the only option; three priced tiers for the same request." h={220}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <line x1={60} y1={190} x2={560} y2={190} stroke={C.line} />
        <line x1={60} y1={20} x2={60} y2={190} stroke={C.line} />
        <T x={560} y={208} s={11} f={C.quiet} a="end">
          staler →
        </T>
        <T x={66} y={28} s={11} f={C.quiet}>
          cost
        </T>
      </g>
      <path d={`M${X(1.5)} ${Y(4000)} Q ${X(20)} ${Y(250)} ${X(1440)} ${Y(46)}`} fill="none" stroke={C.line} strokeWidth={1.4} strokeDasharray="600" strokeDashoffset={600 * (1 - curve)} />
      {pts.map(([m, c], i) => {
        const k = easeOutBack(seg(t, 1.6 + i * 0.6, 2.0 + i * 0.6));
        const [name, fr, cost] = TIERS[i];
        return k <= 0 ? null : (
          <g key={name} opacity={Math.min(1, k)}>
            <circle cx={X(m)} cy={Y(c)} r={6 * Math.min(1, k)} fill={i === 0 ? C.badText : C.focus} />
            <T x={X(m) + (i === 2 ? -10 : 12)} y={Y(c) - 16} s={12} f={i === 0 ? C.badText : C.focus} a={i === 2 ? 'end' : 'start'}>
              {`${name}: ${fr}`}
            </T>
            <T x={X(m) + (i === 2 ? -10 : 12)} y={Y(c) + 8} s={12} f={C.secondary} a={i === 2 ? 'end' : 'start'}>
              {cost}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

// 4 · The fast tier as a card: its promise ✓ on top. Below it an open slot, outlined red: what a guarantees-only
// contract leaves out. Then the non-goal writes itself into the slot and the outline closes.
export function RevealNonGoal({ t }: StepCtx) {
  const w = seg(t, 1.6, 2.6);
  const ng = 'not guaranteed at 5 min during';
  const ng2 = "a plant's own shift change";
  return (
    <Svg label="stating what a tier does not promise is as much a part of the agreement as what it does promise." h={200}>
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <rect x={25} y={14} width={400} height={170} rx={5} fill={C.panel} stroke={C.secondary} strokeWidth={1.3} />
        <T x={41} y={38} s={12} f={C.quiet}>
          fast tier
        </T>
        <T x={41} y={66} s={13} f={C.focus}>
          promises: 5-minute freshness
        </T>
        <Tick x={440} y={62} k={easeOut(seg(t, 0.4, 0.7))} />
      </g>
      <rect
        x={37}
        y={90}
        width={376}
        height={82}
        rx={4}
        fill="none"
        stroke={w >= 1 ? C.second : C.badText}
        strokeWidth={1.4}
        strokeDasharray={w >= 1 ? undefined : '5 4'}
        opacity={easeOut(seg(t, 0.8, 1.1))}
      />
      <T x={575} y={130} s={12} f={C.badText} a="end" o={easeOut(seg(t, 0.9, 1.2)) * (1 - easeOut(seg(t, 1.6, 1.9)))}>
        the open gap
      </T>
      <T x={49} y={112} s={11} f={C.quiet} o={w > 0 ? 1 : 0}>
        does not promise
      </T>
      <T x={49} y={138} s={12} f={C.second}>
        {ng.slice(0, Math.round(ng.length * Math.min(1, w * 2)))}
      </T>
      <T x={49} y={162} s={12} f={C.second}>
        {ng2.slice(0, Math.round(ng2.length * Math.max(0, w * 2 - 1)))}
      </T>
    </Svg>
  );
}

// 5 · The quarter as a bar: 90 days × 1,440 minutes. Both sides' hands meet on the 99.9% target, and the tiny slice
// that's left lights up — 129.6 minutes, one agreed number. A 20-minute breach then eats 15.4% of that slice.
export function RevealErrorBudget({ t }: StepCtx) {
  const zoom = easeInOut(seg(t, 1.2, 2.0));
  const eat = easeOut(seg(t, 2.6, 3.2));
  return (
    <Svg label="a jointly defined quarterly error budget turns how unreliable can this be from an argument into one agreed number." h={200}>
      <g opacity={easeOut(seg(t, 0, 0.4)) * (1 - zoom)}>
        <T x={25} y={24} s={12} f={C.secondary}>
          one quarter: 90 days × 1,440 min = 129,600 min
        </T>
        <rect x={25} y={36} width={550} height={22} fill={C.secondary} opacity={0.5} />
        <rect x={574} y={36} width={1} height={22} fill={C.badText} />
      </g>
      <T x={25} y={84} s={12} f={C.focus} o={easeOut(seg(t, 0.6, 0.9))}>
        target, agreed by both: 99.9%
      </T>
      <g opacity={zoom}>
        <T x={25} y={116} s={12} f={C.secondary}>
          the 0.1% left: the error budget
        </T>
        <rect x={25} y={128} width={550} height={26} rx={3} fill="none" stroke={C.focus} strokeWidth={1.4} />
        <rect x={25} y={128} width={550 * 0.154 * eat} height={26} rx={3} fill={C.badText} opacity={0.6} />
        <T x={575} y={176} s={14} f={C.focus} a="end">
          129.6 min
        </T>
      </g>
      <T x={25} y={176} s={12} f={C.badText} o={eat}>
        a 20-min breach: 15.4% spent
      </T>
    </Svg>
  );
}

// 6 · The budget bar, a breach chunk in it. A timeline under it: the contract signed on the left, the incident on the
// right. The owner's tag — "platform on-call engineer" — drops onto its pin at the signing; time then runs the length of
// the line to the incident, which only then burns the budget; brackets lock onto the owner.
export function RevealBreachOwner({ t }: StepCtx) {
  const tag = easeOutBack(seg(t, 1.0, 1.5));
  // time runs from the signing to the incident; the breach only eats the budget when the incident lands
  const run = easeInOut(seg(t, 1.6, 2.4));
  const inc = easeOutBack(seg(t, 2.3, 2.7));
  const burn = easeOut(seg(t, 2.4, 3.0));
  return (
    <Svg label="an error budget only works if spending it is somebody's specific, named responsibility, agreed before the breach happens." h={200}>
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <rect x={25} y={20} width={550} height={22} rx={3} fill="none" stroke={C.focus} strokeWidth={1.3} />
        <line x1={25} y1={120} x2={575} y2={120} stroke={C.line} />
        <T x={60} y={146} s={13} f={C.secondary} a="middle">
          signed
        </T>
      </g>
      <rect x={25} y={20} width={Math.max(0, 550 * 0.154 * burn)} height={22} rx={3} fill={C.badText} opacity={0.6} />
      <circle cx={60} cy={120} r={6 * easeOutBack(seg(t, 0.2, 0.6))} fill={C.focus} />
      {/* the owner is pinned at the signing: the tag drops onto its stem */}
      <Draw pts={[[60, 114], [60, 86]]} t={t} from={0.8} to={1.05} stroke={C.second} w={1.3} pen={false} />
      {tag > 0 && (
        <g opacity={clamp(tag)} transform={`translate(0 ${((1 - clamp(tag, 0, 1.1)) * -30).toFixed(1)})`}>
          <rect x={40} y={60} width={380} height={26} rx={13} fill={C.panel} stroke={C.second} strokeWidth={1.4} />
          <T x={230} y={78} s={13} f={C.second} a="middle">
            owner: platform on-call engineer
          </T>
        </g>
      )}
      <Draw pts={[[66, 120], [494, 120]]} t={t} from={1.6} to={2.4} stroke={C.focus} w={2} pen={false} />
      {run > 0 && run < 1 && <circle cx={lerp(66, 494, run)} cy={120} r={4} fill={C.focus} />}
      {inc > 0 && (
        <g transform={`translate(0 ${((1 - clamp(inc, 0, 1.1)) * -24).toFixed(1)})`} opacity={clamp(inc)}>
          <path d="M500 104 l10 16 l-20 0 z" fill={C.badText} />
          <T x={500} y={146} s={13} f={C.badText} a="middle">
            incident
          </T>
        </g>
      )}
      <Decode text="named before, not during" t={t} at={2.8} x={300} y={184} s={13} f={C.focus} a="middle" />
      <Reticle x={230} y={73} w={392} h={34} t={t} at={3.2} />
    </Svg>
  );
}

// 7 · The five pieces, each ticking in with its glyph: the written page, three priced dots, the non-goal slot, the
// budget slice, the owner tag. "None optional."
export function Recap({ t }: StepCtx) {
  const L = ['written guarantees', 'priced tiers', 'a stated non-goal', 'a jointly agreed error budget', 'a named owner for the breach'];
  return (
    <Svg label="a contract is written guarantees, priced tiers, a stated non-goal, a jointly agreed budget, and a named owner for the day it breaks." h={300}>
      {L.map((l, i) => {
        const k = easeOut(seg(t, 0.3 + i * 0.55, 0.6 + i * 0.55));
        return (
          <g key={l} opacity={k}>
            <Tick x={34} y={36 + i * 46} k={1} />
            <T x={52} y={41 + i * 46} s={13} f={C.primary}>
              {l}
            </T>
          </g>
        );
      })}
      <g opacity={easeOut(seg(t, 0.3, 0.6))}>
        <rect x={500} y={22} width={30} height={34} rx={2} fill={C.panel} stroke={C.focus} />
      </g>
      <g opacity={easeOut(seg(t, 0.85, 1.15))}>
        {[0, 1, 2].map((j) => (
          <circle key={j} cx={490 + j * 22} cy={82 - j * 6 + j * j * 2} r={4} fill={j === 0 ? C.badText : C.focus} />
        ))}
      </g>
      <g opacity={easeOut(seg(t, 1.4, 1.7))}>
        <rect x={490} y={116} width={60} height={22} rx={3} fill="none" stroke={C.second} strokeWidth={1.3} />
      </g>
      <g opacity={easeOut(seg(t, 1.95, 2.25))}>
        <rect x={470} y={166} width={100} height={16} rx={2} fill="none" stroke={C.focus} />
        <rect x={470} y={166} width={15.4} height={16} rx={2} fill={C.badText} opacity={0.6} />
      </g>
      <g opacity={easeOut(seg(t, 2.5, 2.8))}>
        <rect x={480} y={210} width={80} height={20} rx={10} fill="none" stroke={C.second} />
      </g>
      <T x={300} y={284} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.3, 3.7))}>
        none of the five is optional
      </T>
    </Svg>
  );
}

// 8 · The three tier cards; the stakeholder's pick lands on fast. "What's missing?" After the answer the fast card
// flips to its terms: non-goal, unread; breach owner, unasked — both red. "Priced, not yet agreed."
export function ProveIt({ t, answer }: StepCtx) {
  const on = answer !== null;
  const s = useSinceAnswer(on);
  const pick = easeOut(seg(t, 1.0, 1.4));
  return (
    <Svg label="a stakeholder picks the fastest tier without reading the non-goals or asking who owns a breach. What's missing?" h={200}>
      {TIERS.map(([n, fr, c], i) => (
        <g key={n} opacity={easeOut(seg(t, 0.1 + i * 0.2, 0.4 + i * 0.2)) * (i > 0 ? 1 - 0.5 * pick : 1)}>
          <rect x={25 + i * 185} y={20} width={170} height={64} rx={5} fill={C.panel} stroke={i === 0 && pick > 0.5 ? C.focus : C.line} strokeWidth={i === 0 && pick > 0.5 ? 2 : 1.1} />
          <T x={110 + i * 185} y={44} s={12} f={C.primary} a="middle">
            {`${n}, ${fr}`}
          </T>
          <T x={110 + i * 185} y={68} s={12} f={C.secondary} a="middle">
            {c}
          </T>
        </g>
      ))}
      <T x={575} y={130} s={14} f={C.focus} a="end" o={on ? 0 : easeOut(seg(t, 1.6, 2.0))}>
        what's missing?
      </T>
      {on && (
        <g>
          {['non-goal: unread', 'breach owner: unasked'].map((l, i) => (
            <g key={l} opacity={easeOut(seg(s, 0.3 + i * 0.4, 0.6 + i * 0.4))}>
              <Cross x={36} y={116 + i * 28} k={1} />
              <T x={52} y={121 + i * 28} s={13} f={C.badText}>
                {l}
              </T>
            </g>
          ))}
          <T x={575} y={186} s={13} f={C.focus} a="end" o={easeOut(seg(s, 1.3, 1.7))}>
            priced, not yet agreed
          </T>
        </g>
      )}
    </Svg>
  );
}
