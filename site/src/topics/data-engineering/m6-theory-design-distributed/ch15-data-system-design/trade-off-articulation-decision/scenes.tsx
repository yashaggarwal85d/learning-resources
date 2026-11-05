import { useEffect, useState } from 'react';
import { C, Draw, Reticle, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// CHAPTER.md, topic 9: the decision card with its alternatives, the chosen one lifting and its ADR unfolding beside
// it with the chapter's two extra fields lit; a superseded record kept beside its replacement; the 10× frame with
// every arrow thickened and the first box to overflow lit red and named; the session clock with its four blocks and
// a ghost block eating the last one. Values are examples.py's: ALTERNATIVES (do nothing 0 and fails the SLO; single
// broker queue 4, partitioned log 9, multi-region log 22 per thousand orders; the cheapest feasible one is chosen),
// the sample trigger "late data exceeds five percent of volume", COMPONENTS (ingest 1,000, partitions 2,000, one
// partition's consumer 500, warehouse load 1,500 → the consumer overflows first), SESSION_BLOCKS_MINUTES (7, 10,
// 20, 5) and a five-minute overrun that takes the wrap-up to zero.

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

type Alt = { name: string; cost: string; ok: boolean };
const ALTS: Alt[] = [
  { name: 'do nothing', cost: '0', ok: false },
  { name: 'single broker', cost: '4', ok: true },
  { name: 'partitioned', cost: '9', ok: true },
  { name: 'multi-region', cost: '22', ok: true },
];
const CHOSEN = 1;

/** One alternative card: a name, its cost per thousand orders, and whether it meets the SLO. */
function AltCard({ x, y, alt, k = 1, lift = 0, dim = 0, chosen = false, w = 128 }: { x: number; y: number; alt: Alt; k?: number; lift?: number; dim?: number; chosen?: boolean; w?: number }) {
  if (k <= 0) return null;
  return (
    <g opacity={Math.min(1, k) * (1 - 0.55 * dim)} transform={`translate(0 ${-lift + (1 - Math.min(1, k)) * 14})`}>
      <rect x={x} y={y} width={w} height={86} rx={5} fill={C.panel} stroke={chosen ? C.focus : C.line} strokeWidth={chosen ? 1.8 : 1} />
      <T x={x + w / 2} y={y + 24} s={13} f={chosen ? C.focus : C.primary} a="middle" w={600}>
        {alt.name}
      </T>
      <T x={x + w / 2} y={y + 52} s={18} f={chosen ? C.focus : C.primary} a="middle" w={700}>
        {alt.cost}
      </T>
      <T x={x + w / 2} y={y + 74} s={13} f={alt.ok ? C.secondary : C.badText} a="middle">
        {alt.ok ? 'meets SLO' : 'misses SLO'}
      </T>
    </g>
  );
}

/** A three-box diagram with an adjective tag. */
function Diagram({ x, y, k, extra = 0 }: { x: number; y: number; k: number; extra?: number }) {
  return (
    <g opacity={k}>
      {[0, 1, 2].map((i) => (
        <rect key={i} x={x + i * 64} y={y} width={48} height={30} rx={3} fill={C.panel} stroke={C.line} />
      ))}
      {[0, 1].map((i) => (
        <line key={i} x1={x + 48 + i * 64} y1={y + 15} x2={x + 64 + i * 64} y2={y + 15} stroke={C.line} />
      ))}
      {Array.from({ length: Math.floor(extra * 4) }, (_, i) => (
        <rect key={i} x={x + 12 + i * 44} y={y + 44} width={36} height={22} rx={3} fill={C.panel} stroke={C.line} />
      ))}
    </g>
  );
}

// 1 · Two engineers side by side: a diagram tagged "scalable", and a card of three priced options with a trigger
// line. Load grows; the diagram flashes a red surprise, the card's trigger was already waiting for it.
export function Hook({ t }: StepCtx) {
  const load = easeInOut(seg(t, 2.4, 3.4));
  return (
    <Svg label="one engineer shows a diagram and an adjective, the other shows three priced alternatives and a revisit trigger" h={290}>
      <Diagram x={40} y={30} k={easeOut(seg(t, 0, 0.4))} />
      <g opacity={easeOut(seg(t, 0.4, 0.7))}>
        <rect x={84} y={74} width={90} height={22} rx={11} fill={C.ink} stroke={C.secondary} />
        <T x={129} y={90} s={13} f={C.secondary} a="middle" serif italic>
          "scalable"
        </T>
      </g>
      {[1, 2, 3].map((i) => (
        <g key={i} opacity={easeOut(seg(t, 0.6 + i * 0.15, 0.9 + i * 0.15))}>
          <rect x={320 + (i - 1) * 86} y={24} width={76} height={50} rx={4} fill={C.panel} stroke={i === 1 ? C.focus : C.line} />
          <T x={358 + (i - 1) * 86} y={56} s={15} f={i === 1 ? C.focus : C.primary} a="middle" w={700}>
            {ALTS[i].cost}
          </T>
        </g>
      ))}
      <g opacity={easeOut(seg(t, 1.3, 1.6))}>
        <line x1={320} y1={96} x2={570} y2={96} stroke={C.focus} strokeDasharray="5 4" />
        <T x={320} y={116} s={13} f={C.focus}>
          revisit if crossed
        </T>
      </g>
      {/* load grows */}
      <rect x={40} y={130} width={530 * load} height={10} fill={C.secondary} opacity={0.8} />
      <T x={40} y={160} s={13} f={C.quiet} o={easeOut(seg(t, 2.4, 2.7))}>
        six months on, the load grows
      </T>
      {load > 0.95 && (
        <>
          <T x={206} y={92} s={18} f={C.badText} a="middle" w={700} o={easeOut(seg(t, 3.4, 3.6))}>
            !
          </T>
          <Draw pts={[[540, 104], [548, 112], [564, 98]]} t={t} from={3.4} to={3.7} stroke={C.focus} w={2.2} pen={false} />
        </>
      )}
      <T x={40} y={206} s={14} f={C.primary} o={easeOut(seg(t, 0.6, 0.9))}>
        engineer one
      </T>
      <T x={575} y={206} s={14} f={C.secondary} a="end" o={easeOut(seg(t, 0.7, 1.0))}>
        a diagram, 'scalable'
      </T>
      <T x={40} y={234} s={14} f={C.focus} o={easeOut(seg(t, 1.5, 1.8))}>
        engineer two
      </T>
      <T x={575} y={234} s={14} f={C.focus} a="end" o={easeOut(seg(t, 1.6, 1.9))}>
        three costs, a trigger
      </T>
      <T x={40} y={262} s={14} f={C.primary} o={easeOut(seg(t, 2.6, 2.9))}>
        six months on
      </T>
      <T x={575} y={262} s={14} f={C.secondary} a="end" o={easeOut(seg(t, 2.7, 3.0))}>
        load grows
      </T>
    </Svg>
  );
}

// 2 · The diagram grows more boxes, and it is still a diagram. After the pick, three things it never had slide in
// beside it: alternatives, their costs, and a trigger.
export function Predict1({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const FIELDS = ['alternatives', 'their costs', 'a trigger'];
  return (
    <Svg label="which fields of a record would have made the surprise predictable?" h={250}>
      <Diagram x={40} y={30} k={easeOut(seg(t, 0, 0.4))} extra={easeInOut(seg(t, 0.4, 1.6))} />
      {FIELDS.map((f, i) => {
        const k = on ? easeOutBack(seg(s, 0.3 + i * 0.3, 0.7 + i * 0.3)) : 0;
        if (k <= 0) return null;
        return (
          <g key={f} opacity={Math.min(1, k)} transform={`translate(${(1 - Math.min(1, k)) * 30} 0)`}>
            <rect x={380} y={24 + i * 34} width={180} height={26} rx={13} fill={C.ink} stroke={C.focus} />
            <T x={470} y={42 + i * 34} s={13} f={C.focus} a="middle">
              {f}
            </T>
          </g>
        );
      })}
      {!on && (
        <T x={470} y={70} s={15} f={C.secondary} a="middle" o={easeOut(seg(t, 1.2, 1.6))}>
          what's missing?
        </T>
      )}
      <T x={40} y={176} s={14} f={C.primary} o={easeOut(seg(t, 1.4, 1.7))}>
        a fuller diagram
      </T>
      <T x={575} y={176} s={14} f={C.secondary} a="end" o={easeOut(seg(t, 1.5, 1.8))}>
        more of the same
      </T>
      {on && (
        <>
          <T x={40} y={210} s={14} f={C.focus} o={easeOut(seg(s, 1.2, 1.5))}>
            costs and a trigger
          </T>
          <T x={575} y={210} s={14} f={C.focus} a="end" o={easeOut(seg(s, 1.3, 1.6))}>
            a different artifact
          </T>
        </>
      )}
    </Svg>
  );
}

// 3 · Four cards dealt onto the decision card, do nothing included, each priced per thousand orders; do nothing misses
// the SLO and dims; the single broker lifts as the cheapest that meets it; the rest stay in view.
export function RevealThreeAlternatives({ t }: StepCtx) {
  const pick = easeOutBack(seg(t, 2.4, 2.9));
  return (
    <Svg label="three alternatives, including 'do nothing' — each with its decisive cost stated in the same units" h={250}>
      <T x={575} y={20} s={13} f={C.quiet} a="end" o={easeOut(seg(t, 0, 0.3))}>
        cost per 1,000 orders
      </T>
      {ALTS.map((a, i) => (
        <AltCard key={a.name} x={20 + i * 142} y={40} alt={a} k={easeOut(seg(t, 0.2 + i * 0.3, 0.6 + i * 0.3))} chosen={i === CHOSEN && pick > 0.5} lift={i === CHOSEN ? pick * 12 : 0} dim={i === 0 ? easeOut(seg(t, 1.8, 2.2)) : 0} />
      ))}
      <T x={40} y={186} s={14} f={C.primary} o={easeOut(seg(t, 1.6, 1.9))}>
        three cards
      </T>
      <T x={575} y={186} s={14} f={C.secondary} a="end" o={easeOut(seg(t, 1.7, 2.0))}>
        costs, same units
      </T>
      <T x={40} y={218} s={14} f={C.focus} o={easeOut(seg(t, 2.8, 3.1))}>
        one chosen
      </T>
      <T x={575} y={218} s={14} f={C.focus} a="end" o={easeOut(seg(t, 2.9, 3.2))}>
        lifts, stays visible
      </T>
    </Svg>
  );
}

// 4 · A lone card on the left asserts "chosen" and its "why?" stays blank; the full card on the right draws lines from
// the chosen card to each rival with the cost gap written on it.
export function RevealOneOptionNotDecision({ t }: StepCtx) {
  return (
    <Svg label="a single-alternative 'decision' next to the three-alternative card — only one can say why it won" h={250}>
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <rect x={30} y={30} width={150} height={86} rx={5} fill={C.panel} stroke={C.line} />
        <T x={105} y={56} s={13} f={C.primary} a="middle" w={600}>
          the diagram
        </T>
        <T x={105} y={84} s={13} f={C.secondary} a="middle">
          chosen
        </T>
        <T x={105} y={140} s={13} f={C.quiet} a="middle" o={easeOut(seg(t, 0.8, 1.1))}>
          why? —
        </T>
      </g>
      <AltCard x={300} y={30} alt={ALTS[1]} k={easeOut(seg(t, 1.0, 1.4))} chosen w={120} />
      {[2, 3, 0].map((j, n) => {
        const ry = 24 + n * 40;
        const at = 1.6 + n * 0.4;
        return (
          <g key={j} opacity={easeOut(seg(t, at, at + 0.3))}>
            <Draw pts={[[420, 72], [460, ry + 12]]} t={t} from={at} to={at + 0.3} stroke={C.focus} w={1.2} pen={false} />
            <rect x={460} y={ry} width={110} height={26} rx={4} fill={C.panel} stroke={C.line} />
            <T x={515} y={ry + 18} s={13} f={j === 0 ? C.badText : C.primary} a="middle">
              {j === 0 ? 'misses SLO' : `+${Number(ALTS[j].cost) - 4} more`}
            </T>
          </g>
        );
      })}
      <T x={40} y={190} s={14} f={C.secondary} o={easeOut(seg(t, 1.0, 1.3))}>
        one option
      </T>
      <T x={575} y={190} s={14} f={C.secondary} a="end" o={easeOut(seg(t, 1.1, 1.4))}>
        can't say why
      </T>
      <T x={40} y={222} s={14} f={C.focus} o={easeOut(seg(t, 2.8, 3.1))}>
        three options
      </T>
      <T x={575} y={222} s={14} f={C.focus} a="end" o={easeOut(seg(t, 2.9, 3.2))}>
        says why it won
      </T>
    </Svg>
  );
}

const PARTS: [string, string][] = [
  ['title', 'a short noun phrase'],
  ['context', 'forces, value-neutral'],
  ['decision', 'active voice'],
  ['status', 'accepted, or superseded'],
  ['consequences', 'all of them, not just good'],
];

// 5 · The chosen card at the left; a record unfolds from it to the right, five fields written one by one.
export function RevealFiveParts({ t }: StepCtx) {
  const unfold = easeInOut(seg(t, 0.4, 1.0));
  return (
    <Svg label="title, context, decision, status, consequences — the ADR unfolds to the right of the chosen card" h={260}>
      <AltCard x={20} y={40} alt={ALTS[1]} chosen w={120} k={easeOut(seg(t, 0, 0.3))} />
      <rect x={160} y={20} width={415 * unfold} height={226} rx={5} fill={C.panel} stroke={C.focus} strokeWidth={1.2} />
      <Draw pts={[[140, 83], [160, 83]]} t={t} from={0.3} to={0.5} stroke={C.focus} w={1.4} pen={false} />
      {PARTS.map(([label, value], i) => {
        const y = 52 + i * 42;
        const at = 1.0 + i * 0.5;
        const k = easeOut(seg(t, at, at + 0.3));
        return (
          <g key={label} opacity={k}>
            <T x={176} y={y} s={13} f={i === 4 ? C.focus : C.secondary}>
              {label}
            </T>
            <T x={176} y={y + 20} s={14} f={i === 4 ? C.focus : C.primary}>
              {value}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

// 6 · The record again; two extra fields slide in at the bottom and light: the alternatives' costs as a row of
// figures, and a trigger line with a gauge needle creeping toward it.
export function RevealChangeOurMind({ t }: StepCtx) {
  const needle = easeInOut(seg(t, 2.4, 3.8));
  return (
    <Svg label="the chapter's two extra fields: alternatives' costs, and a testable observation that would reverse the choice" h={270}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <rect x={30} y={14} width={540} height={60} rx={5} fill={C.panel} stroke={C.line} />
        {PARTS.map(([label], i) => (
          <T key={label} x={50 + i * 104} y={50} s={13} f={C.quiet}>
            {label === 'consequences' ? 'conseq.' : label}
          </T>
        ))}
      </g>
      {/* extra field 1: costs */}
      <g opacity={easeOut(seg(t, 0.6, 0.9))} transform={`translate(0 ${(1 - easeOut(seg(t, 0.6, 0.9))) * -16})`}>
        <rect x={30} y={84} width={540} height={52} rx={5} fill={C.panel} stroke={C.focus} />
        <T x={46} y={106} s={13} f={C.focus}>
          costs, stated
        </T>
        {ALTS.map((a, i) => (
          <T key={a.name} x={46 + i * 70} y={126} s={13} f={i === CHOSEN ? C.focus : C.primary} o={easeOut(seg(t, 1.0 + i * 0.15, 1.3 + i * 0.15))}>
            {a.cost}
          </T>
        ))}
        <T x={556} y={126} s={13} f={C.secondary} a="end" o={easeOut(seg(t, 1.6, 1.9))}>
          per 1,000 orders
        </T>
      </g>
      {/* extra field 2: the trigger */}
      <g opacity={easeOut(seg(t, 1.8, 2.1))} transform={`translate(0 ${(1 - easeOut(seg(t, 1.8, 2.1))) * -16})`}>
        <rect x={30} y={146} width={540} height={60} rx={5} fill={C.panel} stroke={C.focus} />
        <T x={46} y={168} s={13} f={C.focus}>
          what changes our mind
        </T>
        <T x={46} y={192} s={13} f={C.primary}>
          late data &gt; 5% of volume
        </T>
        <line x1={330} y1={186} x2={540} y2={186} stroke={C.line} strokeWidth={4} />
        <line x1={500} y1={174} x2={500} y2={198} stroke={C.badText} strokeWidth={2} />
        <circle cx={lerp(340, 488, needle)} cy={186} r={6} fill={C.focus} />
      </g>
      <T x={40} y={236} s={14} f={C.primary} o={easeOut(seg(t, 1.6, 1.9))}>
        costs, stated
      </T>
      <T x={575} y={236} s={14} f={C.secondary} a="end" o={easeOut(seg(t, 1.7, 2.0))}>
        in common units
      </T>
      <T x={40} y={262} s={14} f={C.focus} o={easeOut(seg(t, 2.8, 3.1))}>
        what changes our mind
      </T>
      <T x={575} y={262} s={14} f={C.focus} a="end" o={easeOut(seg(t, 2.9, 3.2))}>
        a specific number
      </T>
    </Svg>
  );
}

// 7 · ADR 3 stands accepted; ADR 4 slides in beside it with "supersedes ADR 3"; ADR 3's status flips to superseded and
// the card stays, dimmed but whole, with a link drawn between them.
export function RevealSuperseded({ t }: StepCtx) {
  const flip = easeOut(seg(t, 2.0, 2.4));
  const k4 = easeOutBack(seg(t, 1.0, 1.5));
  return (
    <Svg label="a later ADR marked 'supersedes ADR 3' — ADR 3 stays, marked superseded, not edited away" h={250}>
      <g opacity={easeOut(seg(t, 0, 0.3)) * (1 - 0.35 * flip)}>
        <rect x={40} y={20} width={220} height={120} rx={5} fill={C.panel} stroke={C.line} />
        <T x={56} y={46} s={14} f={C.primary} w={600}>
          ADR 3
        </T>
        <T x={56} y={74} s={13} f={C.secondary}>
          partitioned log
        </T>
        <T x={56} y={120} s={13} f={flip > 0.5 ? C.secondary : C.focus}>
          status: {flip > 0.5 ? 'superseded' : 'accepted'}
        </T>
      </g>
      {k4 > 0 && (
        <g opacity={Math.min(1, k4)} transform={`translate(${(1 - Math.min(1, k4)) * 40} 0)`}>
          <rect x={340} y={20} width={220} height={120} rx={5} fill={C.panel} stroke={C.focus} strokeWidth={1.6} />
          <T x={356} y={46} s={14} f={C.focus} w={600}>
            ADR 4
          </T>
          <T x={356} y={74} s={13} f={C.primary}>
            multi-region log
          </T>
          <T x={356} y={98} s={13} f={C.focus}>
            supersedes ADR 3
          </T>
          <T x={356} y={120} s={13} f={C.focus}>
            status: accepted
          </T>
        </g>
      )}
      <Draw pts={[[340, 92], [260, 92]]} t={t} from={1.6} to={2.0} stroke={C.focus} w={1.4} pen={false} dash="5 4" />
      <T x={40} y={190} s={14} f={C.primary} o={easeOut(seg(t, 2.4, 2.7))}>
        ADR 3
      </T>
      <T x={575} y={190} s={14} f={C.secondary} a="end" o={easeOut(seg(t, 2.5, 2.8))}>
        kept, marked superseded
      </T>
      <T x={40} y={222} s={14} f={C.focus} o={easeOut(seg(t, 1.4, 1.7))}>
        ADR 4
      </T>
      <T x={575} y={222} s={14} f={C.focus} a="end" o={easeOut(seg(t, 1.5, 1.8))}>
        supersedes ADR 3
      </T>
    </Svg>
  );
}

const COMPS: [string, number][] = [
  ['ingest', 1000],
  ['partitions', 2000],
  ['consumer', 500],
  ['warehouse', 1500],
];

// 8 · The pipeline strip; every arrow thickens tenfold; each box's fill gauge rises with the load, and the one
// partition's consumer (capacity 500, the smallest) overflows first, lit red and named.
export function RevealTenX({ t }: StepCtx) {
  const thick = easeInOut(seg(t, 0.6, 1.8));
  const load = easeInOut(seg(t, 1.4, 3.0)) * 650; // load climbs past the smallest capacity, below the next
  return (
    <Svg label="the same pipeline redrawn with every arrow ten times thicker — the first box to overflow lights up, named" h={250}>
      {COMPS.map(([name, cap], i) => {
        const x = 20 + i * 148;
        const fill = Math.min(1, load / cap);
        const over = load > cap;
        return (
          <g key={name} opacity={easeOut(seg(t, i * 0.1, i * 0.1 + 0.3))}>
            <rect x={x} y={40} width={112} height={80} rx={5} fill={over ? C.bad : C.panel} stroke={over ? C.badText : C.line} strokeWidth={over ? 1.8 : 1} />
            <rect x={x + 8} y={110 - 60 * fill} width={10} height={60 * fill} fill={over ? C.badText : C.secondary} />
            <T x={x + 66} y={74} s={13} f={over ? C.focus : C.primary} a="middle">
              {name}
            </T>
            <T x={x + 66} y={98} s={13} f={over ? C.focus : C.quiet} a="middle">
              cap {cap.toLocaleString('en-US')}
            </T>
            {i < 3 && <line x1={x + 112} y1={80} x2={x + 148} y2={80} stroke={C.primary} strokeWidth={lerp(1.2, 12, thick)} />}
          </g>
        );
      })}
      <T x={300} y={24} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 0.8, 1.1))}>
        every arrow ×10
      </T>
      <T x={372} y={146} s={14} f={C.badText} a="middle" w={700} o={easeOut(seg(t, 2.6, 2.9))}>
        overflows first
      </T>
      <Reticle x={372} y={80} w={128} h={96} t={t} at={2.6} color={C.badText} />
      <T x={40} y={198} s={14} f={C.primary} o={easeOut(seg(t, 1.2, 1.5))}>
        every arrow
      </T>
      <T x={575} y={198} s={14} f={C.secondary} a="end" o={easeOut(seg(t, 1.3, 1.6))}>
        ten times thicker
      </T>
      <T x={40} y={228} s={14} f={C.badText} o={easeOut(seg(t, 3.0, 3.3))}>
        first to overflow
      </T>
      <T x={575} y={228} s={14} f={C.badText} a="end" o={easeOut(seg(t, 3.1, 3.4))}>
        lit, named
      </T>
    </Svg>
  );
}

// 9 · Captions with small marks: three cards with one lifted, a record with a lit field, two records with a link, a
// row of boxes with one red.
export function Recap({ t }: StepCtx) {
  const rows: [string, string][] = [
    ['alternatives', 'at least three, priced'],
    ['ADR', 'decision, change our mind'],
    ['reversed', 'superseded, not edited'],
    ['10x frame', 'finds the bottleneck'],
  ];
  return (
    <Svg label="three priced alternatives, an ADR with its two extra fields, superseded not edited, the 10x frame finding the next bottleneck" h={280}>
      {rows.map(([label, value], i) => {
        const y = 44 + i * 64;
        const k = easeOut(seg(t, 0.2 + i * 0.7, 0.55 + i * 0.7));
        return (
          <g key={label} opacity={k}>
            <T x={100} y={y} s={14} f={i === 2 ? C.focus : C.primary}>
              {label}
            </T>
            <T x={575} y={y} s={14} f={i === 2 ? C.focus : C.secondary} a="end">
              {value}
            </T>
          </g>
        );
      })}
      <g opacity={easeOut(seg(t, 0.2, 0.5))}>
        {[0, 1, 2].map((i) => (
          <rect key={i} x={28 + i * 16} y={i === 0 ? 28 - 4 * easeOut(seg(t, 0.4, 0.8)) : 30} width={12} height={18} fill="none" stroke={i === 0 ? C.focus : C.line} strokeWidth={1.4} />
        ))}
      </g>
      <g opacity={easeOut(seg(t, 0.9, 1.2))}>
        <rect x={28} y={88} width={44} height={30} fill="none" stroke={C.line} />
        <rect x={32} y={108} width={36 * easeInOut(seg(t, 1.0, 1.6))} height={5} fill={C.focus} />
      </g>
      <g opacity={easeOut(seg(t, 1.6, 1.9))}>
        <rect x={28} y={152} width={18} height={24} fill="none" stroke={C.line} opacity={0.6} />
        <rect x={56} y={152} width={18} height={24} fill="none" stroke={C.focus} />
        <line x1={46} y1={164} x2={56} y2={164} stroke={C.focus} strokeDasharray="2 2" />
      </g>
      <g opacity={easeOut(seg(t, 2.3, 2.6))}>
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={26 + i * 13} y={220} width={10} height={14} fill={i === 2 && t > 2.7 ? C.bad : 'none'} stroke={i === 2 && t > 2.7 ? C.badText : C.line} />
        ))}
      </g>
    </Svg>
  );
}

const BLOCKS: [string, number][] = [
  ['requirements', 7],
  ['high level', 10],
  ['deep dives', 20],
  ['wrap-up', 5],
];

// 10 · The session clock as four blocks (7, 10, 20, 5 minutes). A candidate draws a diagram first; after the pick, a
// ghost five-minute block grows inside requirements, everything slides right, and the wrap-up is squeezed to zero.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const over = on ? easeInOut(seg(s, 0.4, 1.6)) * 5 : 0;
  const PX = 12.2; // px per minute
  let x = 30;
  return (
    <Svg label="a candidate opens with a diagram before requirements — the clock shows later blocks running short as a result" h={280}>
      <Diagram x={200} y={20} k={easeOut(seg(t, 0, 0.4))} />
      <T x={170} y={40} s={13} f={C.secondary} a="end" o={easeOut(seg(t, 0.2, 0.5))}>
        drawn first
      </T>
      {BLOCKS.map(([name, mins], i) => {
        const m = i === 0 ? mins + over : i === 3 ? Math.max(0, mins - over) : mins;
        const bx = x;
        x += m * PX;
        const squeezed = i === 3 && over > 0.5;
        return (
          <g key={name} opacity={easeOut(seg(t, 0.4 + i * 0.15, 0.7 + i * 0.15))}>
            <rect x={bx} y={90} width={Math.max(0, m * PX - 3)} height={40} rx={3} fill={i === 2 ? C.focus : i === 3 ? (squeezed ? C.bad : C.second) : C.primary} opacity={0.8} />
            {i === 0 && over > 0 && <rect x={bx + mins * PX} y={90} width={Math.max(0, over * PX - 3)} height={40} rx={3} fill="none" stroke={C.focus} strokeDasharray="4 3" />}
            <T x={i === 3 ? 575 : bx} y={i % 2 ? 150 : 76} s={13} f={squeezed ? C.badText : C.secondary} a={i === 3 ? 'end' : 'start'}>
              {name} {Math.round(m)}
            </T>
          </g>
        );
      })}
      {!on && (
        <T x={300} y={196} s={15} f={C.secondary} a="middle" o={easeOut(seg(t, 1.0, 1.4))}>
          does the lost time vanish?
        </T>
      )}
      {on && (
        <>
          <T x={40} y={200} s={14} f={C.primary} o={easeOut(seg(s, 0.2, 0.5))}>
            an early diagram
          </T>
          <T x={575} y={200} s={14} f={C.secondary} a="end" o={easeOut(seg(s, 0.3, 0.6))}>
            eats the clock
          </T>
          <T x={40} y={230} s={14} f={C.focus} o={easeOut(seg(s, 1.0, 1.3))}>
            the budget
          </T>
          <T x={575} y={230} s={14} f={C.focus} a="end" o={easeOut(seg(s, 1.1, 1.4))}>
            fixed, forty-five minutes
          </T>
          <T x={40} y={260} s={14} f={C.badText} o={easeOut(seg(s, 1.7, 2.0))}>
            later blocks
          </T>
          <T x={575} y={260} s={14} f={C.badText} a="end" o={easeOut(seg(s, 1.8, 2.1))}>
            squeezed, not free
          </T>
        </>
      )}
    </Svg>
  );
}
