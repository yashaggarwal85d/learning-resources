import { useEffect, useState } from 'react';
import { C, Draw, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// Design docs, RFCs and ADRs, drawn from examples.py's own artifacts for the shop: the design doc's five sections
// (context; goals — 60-minute freshness, one shared pipeline — and non-goals — sub-minute freshness; the fast and slow
// alternatives, both rejected; 3 weeks to build, 1 to migrate; a shared pipeline as one point of failure), ADR-1's four
// parts for the medium tier, and ADR-1's status rewritten to "superseded by ADR-2" when ADR-2 reverses it. The four
// RFC reviewer teams are illustrative.

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

/** A person glyph at (x, y). */
const Person = ({ x, y, c = C.secondary, o = 1 }: { x: number; y: number; c?: string; o?: number }) =>
  o <= 0 ? null : (
    <g opacity={o} fill={c}>
      <circle cx={x} cy={y - 10} r={6} />
      <path d={`M${x - 9} ${y + 10} a9 9 0 0 1 18 0 z`} />
    </g>
  );

/** An ADR card: number, status line. */
const Adr = ({ x, y, n, status, c = C.secondary, o = 1 }: { x: number; y: number; n: number; status: string; c?: string; o?: number }) =>
  o <= 0 ? null : (
    <g opacity={o}>
      <rect x={x} y={y} width={330} height={56} rx={4} fill={C.panel} stroke={c} strokeWidth={1.3} />
      <T x={x + 14} y={y + 22} s={13} f={C.focus}>
        {`ADR-${n}`}
      </T>
      <T x={x + 14} y={y + 44} s={12} f={c}>
        {`status: ${status}`}
      </T>
    </g>
  );

// 0 · Decision day: four people around "medium tier". A six-month gap slides by; one by one they fade out. A new
// engineer arrives with "why not fast?" — and only a document left on the table can answer.
export function Hook({ t }: StepCtx) {
  const gap = easeInOut(seg(t, 0.9, 1.8));
  const newbie = easeOut(seg(t, 2.0, 2.4));
  const doc = easeOut(seg(t, 2.9, 3.3));
  return (
    <Svg label="six months after the medium tier was chosen, a new engineer asks why not the fast tier, and nobody in the room was there for the original decision." h={220}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <Box x={170} y={20} w={150} label="medium tier" lit />
        <line x1={25} y1={190} x2={575} y2={190} stroke={C.line} />
        <T x={60} y={210} s={11} f={C.quiet} a="middle">
          decision day
        </T>
      </g>
      {[0, 1, 2, 3].map((i) => (
        <Person key={i} x={120 + i * 60} y={110} o={easeOut(seg(t, 0.1, 0.4)) * (1 - easeOut(seg(t, 1.0 + i * 0.2, 1.3 + i * 0.2)))} />
      ))}
      <g opacity={gap}>
        <path d={`M60 186 H${lerp(60, 470, gap)}`} stroke={C.secondary} strokeWidth={1.4} />
        <T x={470} y={210} s={11} f={C.quiet} a="middle">
          six months later
        </T>
      </g>
      <Person x={470} y={110} c={C.second} o={newbie} />
      <g opacity={newbie}>
        <rect x={420} y={20} width={150} height={32} rx={14} fill={C.panel} stroke={C.second} strokeWidth={1.2} />
        <T x={495} y={41} s={12} f={C.second} a="middle">
          why not fast?
        </T>
      </g>
      <g opacity={doc}>
        <rect x={280} y={90} width={50} height={64} rx={3} fill={C.panel} stroke={C.focus} strokeWidth={1.4} />
        {[0, 1, 2, 3].map((j) => (
          <rect key={j} x={288} y={102 + j * 12} width={j === 3 ? 20 : 34} height={4} rx={1} fill={C.secondary} />
        ))}
        <path d="M335 122 H440" stroke={C.focus} strokeWidth={1.2} strokeDasharray="4 3" />
      </g>
      <T x={305} y={172} s={12} f={C.focus} a="middle" o={doc}>
        only this can answer
      </T>
    </Svg>
  );
}

// 1 · "What survives?" Two candidates: a slide deck for one meeting, and a design doc with a dated decision record.
// After the answer the meeting ends, its deck fades and is struck; the doc and record stay lit, ✓.
export function PredictWhatSurvives({ t, answer }: StepCtx) {
  const on = answer !== null;
  const s = useSinceAnswer(on);
  const fade = on ? easeOut(seg(s, 0.3, 0.9)) : 0;
  return (
    <Svg label="what would have survived everyone who made the decision leaving the room?" h={180}>
      <g opacity={easeOut(seg(t, 0, 0.3)) * (1 - 0.6 * fade)}>
        <rect x={25} y={30} width={150} height={90} rx={4} fill={C.panel} stroke={C.line} strokeWidth={1.2} />
        <rect x={45} y={50} width={110} height={44} rx={2} fill={C.band} />
        <T x={100} y={142} s={12} f={C.secondary} a="middle">
          a meeting's slides
        </T>
      </g>
      <Cross x={185} y={40} k={on ? easeOut(seg(s, 0.9, 1.1)) : 0} />
      <g opacity={easeOut(seg(t, 0.3, 0.6))}>
        <rect x={250} y={24} width={80} height={100} rx={3} fill={C.panel} stroke={on && s > 1.2 ? C.focus : C.secondary} strokeWidth={1.3} />
        {[0, 1, 2, 3, 4].map((j) => (
          <rect key={j} x={260} y={38 + j * 16} width={60} height={4} rx={1} fill={C.line} />
        ))}
        <rect x={345} y={50} width={90} height={60} rx={3} fill={C.panel} stroke={on && s > 1.2 ? C.focus : C.secondary} strokeWidth={1.3} />
        <T x={390} y={78} s={11} f={C.secondary} a="middle">
          ADR, dated
        </T>
        <T x={340} y={142} s={12} f={C.secondary} a="middle">
          design doc + record
        </T>
      </g>
      <T x={575} y={80} s={14} f={C.focus} a="end" o={on ? 0 : easeOut(seg(t, 0.8, 1.2))}>
        ?
      </T>
      <Tick x={455} y={76} k={on ? easeOut(seg(s, 1.2, 1.5)) : 0} />
      <T x={575} y={170} s={12} f={C.focus} a="end" o={on ? easeOut(seg(s, 1.5, 1.9)) : 0}>
        built to outlast its authors
      </T>
    </Svg>
  );
}

// 2 · The design doc's five sections fill in order with examples.py's own content for the shop: context, goals and
// non-goals (60-minute freshness; sub-minute is not a goal), alternatives (fast and slow, each rejected), estimates
// (3 weeks to build, 1 to migrate), risks (one shared pipeline, one point of failure).
export function RevealDesignDocSections({ t }: StepCtx) {
  const rows: [string, string][] = [
    ['context', 'plants asked for real-time'],
    ['goals / non-goals', '60-min freshness / not sub-minute'],
    ['alternatives', 'fast, slow: both rejected'],
    ['estimates', '3 weeks build, 1 migrate'],
    ['risks', 'one shared pipeline fails all'],
  ];
  return (
    <Svg label="a real, documented design-doc structure, filled in for the shop's own request: context, goals and non-goals, alternatives, estimates, risks." h={240}>
      <rect x={25} y={10} width={550} height={222} rx={4} fill={C.panel} stroke={C.secondary} strokeWidth={1.2} opacity={easeOut(seg(t, 0, 0.3))} />
      {rows.map(([h, v], i) => {
        const y = 40 + i * 42;
        const k = easeOut(seg(t, 0.6 + i * 0.5, 0.9 + i * 0.5));
        const w = seg(t, 0.8 + i * 0.5, 1.3 + i * 0.5);
        return (
          <g key={h} opacity={k}>
            <T x={41} y={y} s={12} f={C.secondary}>
              {h}
            </T>
            <T x={41} y={y + 20} s={12} f={C.focus}>
              {v.slice(0, Math.round(v.length * w))}
            </T>
            <Tick x={555} y={y + 6} k={w >= 1 ? 1 : 0} />
          </g>
        );
      })}
    </Svg>
  );
}

// 3 · Goals as a solid box (60-minute freshness ✓), the non-goal as a dashed one beside it (sub-minute). Not a red,
// forbidden zone: a marker drifts into the dashed box by accident and gets ✓ — allowed, while the goal stays met.
export function RevealNonGoalNotNegated({ t }: StepCtx) {
  const drift = easeInOut(seg(t, 2.0, 3.0));
  return (
    <Svg label="a non-goal is not a negated goal; it's something the team could reasonably have chosen, and chose not to." h={200}>
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <rect x={25} y={40} width={250} height={90} rx={5} fill={C.panel} stroke={C.focus} strokeWidth={1.4} />
        <T x={41} y={32} s={12} f={C.secondary}>
          goal
        </T>
        <T x={150} y={92} s={13} f={C.focus} a="middle">
          60-min freshness
        </T>
      </g>
      <g opacity={easeOut(seg(t, 0.8, 1.2))}>
        <rect x={325} y={40} width={250} height={90} rx={5} fill="none" stroke={C.secondary} strokeWidth={1.4} strokeDasharray="6 4" />
        <T x={341} y={32} s={12} f={C.secondary}>
          non-goal, by choice
        </T>
        <T x={450} y={92} s={13} f={C.secondary} a="middle">
          sub-minute
        </T>
      </g>
      <circle cx={lerp(240, 540, drift)} cy={lerp(110, 112, drift)} r={6} fill={C.second} opacity={easeOut(seg(t, 1.6, 1.9))} />
      <Tick x={150} y={115} k={easeOut(seg(t, 0.5, 0.8))} />
      <Tick x={555} y={60} k={easeOut(seg(t, 3.0, 3.3))} color={C.second} />
      <T x={25} y={170} s={12} f={C.second} o={easeOut(seg(t, 3.1, 3.5))}>
        reached by accident: fine
      </T>
      <T x={25} y={192} s={12} f={C.secondary} o={easeOut(seg(t, 3.4, 3.8))}>
        as long as no real goal pays for it
      </T>
    </Svg>
  );
}

// 4 · The doc at the centre of a ring of four teams. A review-period bar opens and drains — time-boxed. Each team's
// sign-off ✓ arrives in turn; when all four are in, the doc's border turns solid: final.
export function RevealRfcReview({ t }: StepCtx) {
  const timer = seg(t, 0.6, 3.0);
  const teams = ['plant ops', 'platform', 'analytics', 'finance'];
  const done = t > 3.0;
  return (
    <Svg label="a time-boxed, widely advertised review period every affected team has to sign off on before the decision is final." h={200}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <rect x={250} y={60} width={100} height={60} rx={4} fill={C.panel} stroke={done ? C.focus : C.secondary} strokeWidth={done ? 2 : 1.2} strokeDasharray={done ? undefined : '5 4'} />
        <T x={300} y={95} s={13} f={done ? C.focus : C.secondary} a="middle">
          RFC
        </T>
        <rect x={180} y={150} width={240} height={10} rx={2} fill="none" stroke={C.line} />
        <rect x={180} y={150} width={240 * (1 - timer)} height={10} rx={2} fill={C.second} opacity={0.7} />
        <T x={300} y={180} s={11} f={C.quiet} a="middle">
          review period, time-boxed
        </T>
      </g>
      {teams.map((n, i) => {
        const x = i < 2 ? 25 : 455;
        const y = i % 2 === 0 ? 36 : 116;
        const k = easeOut(seg(t, 0.3 + i * 0.1, 0.6 + i * 0.1));
        const sign = easeOut(seg(t, 1.2 + i * 0.4, 1.5 + i * 0.4));
        return (
          <g key={n} opacity={k}>
            <Box x={x} y={y} w={120} h={30} label={n} lit={sign > 0.5} />
            <line x1={i < 2 ? 145 : 455} y1={y + 15} x2={i < 2 ? 250 : 350} y2={90} stroke={sign > 0.5 ? C.second : C.line} strokeWidth={1} />
            <Tick x={i < 2 ? 160 : 440} y={y + 2} k={sign} />
          </g>
        );
      })}
      <T x={300} y={40} s={12} f={C.focus} a="middle" o={easeOut(seg(t, 3.0, 3.3))}>
        final
      </T>
    </Svg>
  );
}

// 5 · ADR-1 builds itself section by section — context, decision: the medium tier, status: accepted, consequences —
// then an arrow points it forward to a future developer who wasn't in the room.
export function RevealAdr({ t }: StepCtx) {
  const parts: [string, string][] = [
    ['context', 'plants asked for real-time'],
    ['decision', 'the medium tier'],
    ['status', 'accepted'],
    ['consequences', 'one shared pipeline'],
  ];
  const fut = easeOut(seg(t, 2.8, 3.3));
  return (
    <Svg label="four parts, one ADR, written for a future developer who wasn't in the room: context, decision, status, consequences." h={220}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <rect x={25} y={10} width={380} height={200} rx={4} fill={C.panel} stroke={C.secondary} strokeWidth={1.3} />
        <T x={41} y={32} s={13} f={C.focus}>
          ADR-1
        </T>
      </g>
      {parts.map(([h, v], i) => (
        <g key={h} opacity={easeOut(seg(t, 0.5 + i * 0.5, 0.8 + i * 0.5))}>
          <T x={41} y={64 + i * 38} s={11} f={C.quiet}>
            {h}
          </T>
          <T x={160} y={64 + i * 38} s={12} f={i === 1 ? C.focus : C.primary}>
            {v}
          </T>
        </g>
      ))}
      <g opacity={fut}>
        <path d={`M405 110 H${lerp(405, 490, fut)}`} stroke={C.second} strokeWidth={1.4} />
        <Person x={520} y={110} c={C.second} />
        <T x={520} y={150} s={11} f={C.second} a="middle">
          future dev
        </T>
      </g>
    </Svg>
  );
}

// 6 · The repository holds ADR-1, accepted. ADR-2 arrives and reverses it. A trash bin slides toward ADR-1 and is
// struck; instead ADR-1's status line rewrites itself to "superseded by ADR-2" — and it stays.
export function RevealSuperseded({ t }: StepCtx) {
  const two = easeOutBack(seg(t, 0.8, 1.3));
  const bin = easeOut(seg(t, 1.5, 1.9));
  const rewrite = t > 2.5;
  return (
    <Svg label="when a later decision reverses an earlier one, the old ADR stays, its status changed to superseded by, not deleted." h={200}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <rect x={20} y={10} width={500} height={150} rx={5} fill="none" stroke={C.line} strokeWidth={1.1} strokeDasharray="4 3" />
        <T x={30} y={176} s={11} f={C.quiet}>
          the repository
        </T>
        <Adr x={35} y={24} n={1} status={rewrite ? 'superseded by ADR-2' : 'accepted'} c={rewrite ? C.secondary : C.focus} />
      </g>
      <Adr x={35} y={lerp(170, 94, Math.min(1, two))} n={2} status="accepted" c={C.focus} o={Math.min(1, two)} />
      <g opacity={bin * (1 - easeOut(seg(t, 2.2, 2.5)))}>
        <path d="M400 34 h40 l-4 40 h-32 z" fill="none" stroke={C.badText} strokeWidth={1.4} />
        <line x1={396} y1={34} x2={444} y2={34} stroke={C.badText} strokeWidth={1.6} />
      </g>
      <Cross x={420} y={54} k={easeOut(seg(t, 1.9, 2.1)) * (1 - easeOut(seg(t, 2.2, 2.5)))} />
      <T x={575} y={186} s={12} f={C.focus} a="end" o={easeOut(seg(t, 2.8, 3.2))}>
        kept, never deleted
      </T>
    </Svg>
  );
}

// 7 · The five pieces tick in, each with a glyph: five section bars, a dashed non-goal box, a ring of sign-offs, a
// four-row card, a superseded card that stays.
export function Recap({ t }: StepCtx) {
  const L = ["a design doc's five sections", 'a non-goal, chosen on purpose', 'an RFC: every team signs off', 'a four-part ADR', 'superseded, never deleted'];
  return (
    <Svg label="a design doc's five sections, a non-goal that's a real choice, what an RFC's review adds, a four-part ADR, and the superseded-not-deleted convention." h={300}>
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
        {[0, 1, 2, 3, 4].map((j) => (
          <rect key={j} x={500} y={22 + j * 6} width={60} height={3} fill={C.focus} />
        ))}
      </g>
      <rect x={500} y={68} width={60} height={30} rx={3} fill="none" stroke={C.secondary} strokeDasharray="4 3" opacity={easeOut(seg(t, 0.85, 1.15))} />
      <g opacity={easeOut(seg(t, 1.4, 1.7))}>
        {[0, 1, 2, 3].map((j) => (
          <circle key={j} cx={530 + 18 * Math.cos(j * 1.57)} cy={128 + 14 * Math.sin(j * 1.57)} r={3.5} fill={C.second} />
        ))}
      </g>
      <g opacity={easeOut(seg(t, 1.95, 2.25))}>
        {[0, 1, 2, 3].map((j) => (
          <rect key={j} x={500} y={160 + j * 7} width={60} height={4} fill={C.primary} />
        ))}
      </g>
      <rect x={500} y={208} width={60} height={30} rx={3} fill={C.panel} stroke={C.secondary} opacity={easeOut(seg(t, 2.5, 2.8))} />
      <T x={300} y={284} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.2, 3.6))}>
        none of the five is optional
      </T>
    </Svg>
  );
}

// 8 · ADR-1 slides toward the bin. "What's lost?" After the answer it slides back, its status reading "superseded by
// ADR-2", and a later engineer's question resolves against it: tried and rejected, not never considered.
export function ProveIt({ t, answer }: StepCtx) {
  const on = answer !== null;
  const s = useSinceAnswer(on);
  const toBin = easeInOut(seg(t, 0.6, 1.6));
  const back = on ? easeInOut(seg(s, 0.2, 0.9)) : 0;
  const x = lerp(lerp(25, 145, toBin), 25, back);
  return (
    <Svg label="a team deletes an old ADR after a decision changes, reasoning that the wrong decision shouldn't confuse anyone. What's lost by deleting it?" h={200}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <path d="M480 40 h56 l-6 60 h-44 z" fill="none" stroke={C.badText} strokeWidth={1.4} />
        <line x1={474} y1={40} x2={542} y2={40} stroke={C.badText} strokeWidth={1.6} />
      </g>
      <Adr x={x} y={24} n={1} status={on && back > 0.5 ? 'superseded by ADR-2' : 'accepted'} c={on && back > 0.5 ? C.secondary : C.focus} o={on ? 1 : 1 - 0.5 * toBin} />
      <T x={575} y={140} s={14} f={C.focus} a="end" o={on ? 0 : easeOut(seg(t, 1.6, 2.0))}>
        what's lost?
      </T>
      {on && (
        <g>
          <T x={25} y={120} s={13} f={C.primary} o={easeOut(seg(s, 1.0, 1.4))}>
            next time: tried and rejected,
          </T>
          <T x={25} y={146} s={13} f={C.primary} o={easeOut(seg(s, 1.0, 1.4))}>
            or never considered?
          </T>
          <T x={25} y={184} s={12} f={C.second} o={easeOut(seg(s, 1.7, 2.1))}>
            the record answers it; the bin can't
          </T>
        </g>
      )}
    </Svg>
  );
}
