import { useEffect, useState } from 'react';
import { C, Decode, Draw, Reticle, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// The chapter's requirements ledger (CHAPTER.md, topic 1): the vague ask on top, question chips falling onto it one
// by one and each turning an adjective into a value, the surprising one counted up ("real-time" resolving to a
// fifteen-minute freshness SLO); the six-dimension checklist as rows ticking; four small pipeline strips under
// "correct means…". Every value on screen is examples.py's: FIVE_QUESTIONS, SIX_DIMENSIONS, FOUR_DEFINITIONS,
// SECOND_ASK, and the two percent the hook names.

type Pt = readonly [number, number];

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

const Check = ({ at: [x, y], t, from, f = C.focus }: { at: Pt; t: number; from: number; f?: string }) => (
  <Draw pts={[[x - 8, y], [x - 2, y + 7], [x + 10, y - 8]]} t={t} from={from} to={from + 0.3} stroke={f} w={2.4} pen={false} />
);
const Cross = ({ at: [x, y], o }: { at: Pt; o: number }) => (o > 0 ? <path d={`M${x - 7} ${y - 7} l14 14 M${x + 7} ${y - 7} l-14 14`} stroke={C.badText} strokeWidth={2.4} opacity={o} /> : null);

/** The ask, as a quoted card at the top of the ledger. */
function Ask({ text, k = 1, y = 34, f = C.primary, struck = 0 }: { text: string; k?: number; y?: number; f?: string; struck?: number }) {
  return (
    <g opacity={k}>
      <rect x={60} y={y - 22} width={480} height={36} rx={6} fill={C.panel} stroke={f} strokeWidth={1.4} />
      <T x={300} y={y + 1} s={14} a="middle" f={f} serif italic>
        {text}
      </T>
      {struck > 0 && <line x1={80} y1={y - 4} x2={lerp(80, 520, struck)} y2={y - 4} stroke={C.badText} strokeWidth={2.2} />}
    </g>
  );
}

/** A ledger row: a question chip that drops in at `at`, then its answer types in on the right (or a dash, if none). */
function LedgerRow({ y, q, a, t, at, empty = false }: { y: number; q: string; a?: string; t: number; at: number; empty?: boolean }) {
  const drop = easeOutBack(seg(t, at, at + 0.35));
  const ans = easeOut(seg(t, at + 0.35, at + 0.6));
  if (drop <= 0) return null;
  return (
    <g>
      <g opacity={Math.min(1, drop)} transform={`translate(0 ${((1 - Math.min(1, drop)) * -30).toFixed(1)})`}>
        <rect x={30} y={y - 15} width={170} height={28} rx={14} fill="none" stroke={C.secondary} strokeWidth={1.3} />
        <T x={115} y={y + 4} s={13} a="middle" f={C.secondary}>
          {q}
        </T>
      </g>
      <line x1={210} y1={y} x2={lerp(210, 380, ans)} y2={y} stroke={C.band} />
      {empty ? (
        <T x={570} y={y + 5} s={13} a="end" f={C.badText} o={ans}>
          no answer
        </T>
      ) : (
        <T x={570} y={y + 5} s={13} a="end" f={C.focus} o={ans}>
          {a}
        </T>
      )}
    </g>
  );
}

const Q5 = [
  { q: 'for whom', a: 'the board' },
  { q: 'measured where', a: 'the shown total' },
  { q: 'which percentile', a: 'p100 at read' },
  { q: 'which window', a: '15 minutes' },
  { q: 'what on a miss', a: 'trust erodes' },
];

// 1 · The ask types in as a quoted card. Two paths fork from it: a streaming job and a finance batch total, each
// growing a revenue bar. The bars stop at different heights at the board meeting, and the gap is bracketed red.
export function Hook({ t }: StepCtx) {
  const g1 = easeInOut(seg(t, 1.2, 2.2)), g2 = easeInOut(seg(t, 1.4, 2.6));
  const base = 250, H = 120;
  return (
    <Svg label="the shop's head of marketing wants real-time, accurate revenue on the executive dashboard — what did those two words actually specify?" h={320}>
      <Ask text='"real-time, accurate revenue on the dashboard"' k={easeOut(seg(t, 0, 0.5))} />
      <Draw pts={[[250, 52], [180, 100]]} t={t} from={0.6} to={0.9} stroke={C.secondary} w={1.4} pen={false} />
      <Draw pts={[[350, 52], [420, 100]]} t={t} from={0.7} to={1.0} stroke={C.secondary} w={1.4} pen={false} />
      <T x={180} y={base + 22} s={13} a="middle" f={C.primary} o={easeOut(seg(t, 0.8, 1.1))}>
        engineering: stream
      </T>
      <T x={420} y={base + 22} s={13} a="middle" f={C.primary} o={easeOut(seg(t, 0.9, 1.2))}>
        finance: batch
      </T>
      <rect x={150} y={base - H * 0.98 * g1} width={60} height={H * 0.98 * g1} fill={C.focus} opacity={0.8} />
      <rect x={390} y={base - H * g2} width={60} height={H * g2} fill={C.secondary} opacity={0.8} />
      <line x1={110} y1={base} x2={490} y2={base} stroke={C.line} />
      <g opacity={easeOut(seg(t, 2.8, 3.1))}>
        <line x1={215} y1={base - H} x2={450} y2={base - H} stroke={C.badText} strokeDasharray="4 4" />
        <line x1={215} y1={base - H * 0.98} x2={300} y2={base - H * 0.98} stroke={C.badText} strokeDasharray="4 4" />
      </g>
      <T x={300} y={base - H - 10} s={13} a="middle" f={C.badText} o={easeOut(seg(t, 3.0, 3.3))}>
        two percent apart
      </T>
      <T x={300} y={base + 52} s={13} a="middle" f={C.secondary} o={easeOut(seg(t, 3.4, 3.7))}>
        both met the sentence
      </T>
      <Reticle x={300} y={base - H - 14} w={160} h={30} t={t} at={3.6} color={C.badText} />
    </Svg>
  );
}

// 2 · Two lenses side by side: a clock ("how fast it arrived") and a row of order dots ("what it counted"). After the
// pick, the clock dims; the orders split into settled and not-yet-settled, the stream counts them all, the batch only
// the settled ones, and the unsettled sliver is the gap.
export function Predict1({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const settle = on ? easeOut(seg(s, 0.4, 1.0)) : 0;
  const ORD = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const unsettled = (i: number) => i === 3 || i === 8;
  return (
    <Svg label="which one unstated choice made the two teams' figures differ — how fast the number arrived, or what the number counted?" h={300}>
      <g opacity={(on ? 1 - easeOut(seg(s, 0, 0.4)) * 0.7 : 1) * easeOut(seg(t, 0, 0.4))}>
        <circle cx={110} cy={90} r={30} fill="none" stroke={C.secondary} strokeWidth={1.6} />
        <line x1={110} y1={90} x2={110 + 20 * Math.cos(t * 2)} y2={90 + 20 * Math.sin(t * 2)} stroke={C.secondary} strokeWidth={1.8} />
        <T x={110} y={146} s={13} a="middle" f={C.secondary}>
          how fast it arrived
        </T>
      </g>
      <g opacity={easeOut(seg(t, 0.3, 0.7))}>
        {ORD.map((i) => (
          <circle key={i} cx={250 + i * 30} cy={90} r={9} fill={unsettled(i) && settle > 0.5 ? C.panel : C.focus} stroke={C.focus} strokeWidth={1.6} strokeDasharray={unsettled(i) && settle > 0.5 ? '3 3' : undefined} />
        ))}
        <T x={385} y={146} s={13} a="middle" f={C.focus}>
          what it counted
        </T>
      </g>
      {!on && (
        <T x={300} y={230} s={15} a="middle" f={C.secondary} o={easeOut(seg(t, 0.8, 1.3))}>
          speed, or what counts?
        </T>
      )}
      {on && (
        <g>
          <T x={240} y={196} s={13} a="end" f={C.primary} o={easeOut(seg(s, 1.0, 1.3))}>
            stream: placed
          </T>
          <rect x={250} y={184} width={290 * easeInOut(seg(s, 1.0, 1.5))} height={14} rx={2} fill={C.focus} opacity={0.8} />
          <T x={240} y={226} s={13} a="end" f={C.primary} o={easeOut(seg(s, 1.3, 1.6))}>
            batch: settled
          </T>
          <rect x={250} y={214} width={232 * easeInOut(seg(s, 1.3, 1.8))} height={14} rx={2} fill={C.secondary} opacity={0.8} />
          <Decode text="what counts, and when it is final" t={s} at={1.9} x={300} y={274} s={15} a="middle" f={C.focus} w={600} />
          <Reticle x={385} y={90} w={330} h={36} t={s} at={0.9} />
        </g>
      )}
    </Svg>
  );
}

// 3 · The ledger: "real-time" on top, five question chips dropping onto five rows one by one, each answer typing in.
// The window row's value counts up to fifteen, and the bottom line resolves the adjective into one SLO.
export function RevealFiveQuestions({ t }: StepCtx) {
  const n = Math.round(15 * easeOut(seg(t, 2.6, 3.4)));
  return (
    <Svg label="five fixed questions turn 'real-time' into one row of the requirements ledger: for whom, measured where, which percentile, which window, what on a miss" h={320}>
      <Ask text='"real-time"' k={easeOut(seg(t, 0, 0.3))} />
      {Q5.map((r, i) => (
        <LedgerRow key={r.q} y={84 + i * 40} q={r.q} a={i === 3 ? `${n} minutes` : r.a} t={t} at={0.3 + i * 0.45} />
      ))}
      <line x1={30} y1={274} x2={570} y2={274} stroke={C.line} opacity={easeOut(seg(t, 3.4, 3.6))} />
      <Decode text="freshness: at most 15 minutes stale" t={t} at={3.6} x={300} y={302} s={15} a="middle" f={C.focus} w={600} />
      <Reticle x={490} y={204} w={170} h={32} t={t} at={3.2} />
    </Svg>
  );
}

const DIMS = [
  { n: 'freshness', v: '15 minutes', st: 'set' },
  { n: 'latency', v: '2 seconds to render', st: 'set' },
  { n: 'completeness', v: 'left silent', st: 'silent' },
  { n: 'correctness', v: 'left silent', st: 'silent' },
  { n: 'availability', v: 'not needed', st: 'nn' },
  { n: 'retention', v: 'not needed', st: 'nn' },
];

// 4 · Six rows tick down the checklist: two get a value, two come back empty and turn red, two are marked "not
// needed". A bracket closes around the two red rows: that is where engineering and finance chose differently.
export function RevealSixDimensions({ t }: StepCtx) {
  return (
    <Svg label="the six dimensions, ticked for this ask: the two the hook's sentence never specified are exactly where the teams disagreed" h={300}>
      {DIMS.map((d, i) => {
        const y = 36 + i * 40;
        const at = 0.2 + i * 0.4;
        const k = easeOut(seg(t, at, at + 0.3));
        const f = d.st === 'silent' ? C.badText : d.st === 'set' ? C.focus : C.quiet;
        return (
          <g key={d.n} opacity={k}>
            <rect x={30} y={y - 14} width={24} height={24} rx={4} fill="none" stroke={f} strokeWidth={1.4} />
            <T x={70} y={y + 3} s={14} f={C.primary}>
              {d.n}
            </T>
            <line x1={210} y1={y - 2} x2={lerp(210, 380, easeOut(seg(t, at + 0.1, at + 0.4)))} y2={y - 2} stroke={C.band} />
            <T x={570} y={y + 3} s={13} a="end" f={f}>
              {d.v}
            </T>
          </g>
        );
      })}
      {DIMS.map((d, i) => (d.st === 'set' ? <Check key={d.n} at={[42, 34 + i * 40]} t={t} from={0.4 + i * 0.4} /> : null))}
      {DIMS.map((d, i) => (d.st === 'silent' ? <Cross key={d.n} at={[42, 34 + i * 40]} o={easeOut(seg(t, 0.5 + i * 0.4, 0.7 + i * 0.4))} /> : null))}
      <Reticle x={300} y={34 + 2.5 * 40} w={560} h={80} t={t} at={2.8} color={C.badText} />
      <T x={300} y={282} s={13} a="middle" f={C.badText} o={easeOut(seg(t, 3.0, 3.3))}>
        where the two teams chose differently
      </T>
    </Svg>
  );
}

const DEFS = [
  { n: 'exactly-once effect', c: 'key check on every write' },
  { n: 'complete by T+1', c: 'a correction pass' },
  { n: 'bounded error', c: 'a sketch, not a count' },
  { n: 'at-most-once', c: 'no replay at all' },
];

/** A small pipeline strip: source → job → dashboard, with a mark that distinguishes one definition of correct. */
function Strip({ y, i, t, at }: { y: number; i: number; t: number; at: number }) {
  const k = easeOut(seg(t, at, at + 0.3));
  const run = easeInOut(seg(t, at + 0.2, at + 0.8));
  const bx = [210, 300, 390];
  return (
    <g opacity={k}>
      {bx.map((x, j) => (
        <rect key={x} x={x - 26} y={y - 12} width={52} height={24} rx={4} fill={C.panel} stroke={j === 2 ? C.focus : C.line} strokeWidth={1.2} />
      ))}
      <line x1={236} y1={y} x2={274} y2={y} stroke={C.line} />
      <line x1={326} y1={y} x2={364} y2={y} stroke={C.line} />
      <circle cx={lerp(236, 364, run)} cy={y} r={4} fill={C.focus} opacity={run > 0 && run < 1 ? 1 : 0} />
      {i === 0 && <rect x={354} y={y - 18} width={20} height={14} rx={7} fill={C.second} opacity={run} />}
      {i === 1 && <path d={`M390 ${y + 12} C 390 ${y + 30}, 300 ${y + 30}, 300 ${y + 14}`} fill="none" stroke={C.second} strokeWidth={1.4} strokeDasharray="4 3" opacity={run} />}
      {i === 2 && <rect x={364} y={y - 16} width={52} height={32} rx={4} fill="none" stroke={C.second} strokeWidth={1.2} strokeDasharray="3 3" opacity={run} />}
      {i === 3 && <Cross at={[255, y]} o={run} />}
    </g>
  );
}

// 5 · Four small pipeline strips under "correct means…", one per definition, each with its own mark: a key chip at
// the write, a correction loop back from the next morning, an error band around the output, a dropped event. Each
// definition's name sits left and its dominant cost right.
export function RevealFourDefinitions({ t }: StepCtx) {
  return (
    <Svg label="the same ask, run through four different definitions of correct, each a different system with a different one-line cost" h={380}>
      <T x={300} y={28} s={14} a="middle" f={C.primary} w={600}>
        correct means…
      </T>
      {DEFS.map((d, i) => {
        const y = 80 + i * 76;
        const at = 0.3 + i * 0.8;
        return (
          <g key={d.n}>
            <T x={20} y={y + 5} s={13} f={C.focus} o={easeOut(seg(t, at, at + 0.3))}>
              {d.n}
            </T>
            <Strip y={y} i={i} t={t} at={at} />
            <T x={300} y={y + 44} s={13} a="middle" f={C.secondary} o={easeOut(seg(t, at + 0.5, at + 0.8))}>
              {`cost: ${d.c}`}
            </T>
          </g>
        );
      })}
      <Decode text="four systems, not four phrasings" t={t} at={3.8} x={300} y={372} s={14} a="middle" f={C.focus} w={600} />
    </Svg>
  );
}

// 6 · A consequence scale runs from "a board meeting" to "a bill goes out wrong". The four definitions sit on a cost
// ladder; the dashboard's marker lands at the board-meeting end, and the cheapest definition that covers it, bounded
// error, lifts out and lights.
export function RevealChosenDefinition({ t }: StepCtx) {
  const lift = easeOutBack(seg(t, 2.6, 3.0));
  const costs = [1, 0.62, 0.34, 0.12];
  return (
    <Svg label="the dashboard's own consequence is a board meeting, not a bill — which of the four definitions does that actually select?" h={300}>
      <line x1={60} y1={60} x2={540} y2={60} stroke={C.line} strokeWidth={2} opacity={easeOut(seg(t, 0, 0.3))} />
      <T x={60} y={40} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        a board meeting
      </T>
      <T x={540} y={40} s={13} a="end" f={C.badText} o={easeOut(seg(t, 0.1, 0.4))}>
        a bill goes out wrong
      </T>
      <circle cx={lerp(300, 110, easeInOut(seg(t, 0.5, 1.2)))} cy={60} r={8} fill={C.focus} opacity={easeOut(seg(t, 0.4, 0.6))} />
      <T x={110} y={88} s={13} a="middle" f={C.focus} o={easeOut(seg(t, 1.1, 1.4))}>
        this dashboard
      </T>
      {DEFS.map((d, i) => {
        const y = 130 + i * 38;
        const chosen = i === 2;
        const k = easeOut(seg(t, 1.3 + i * 0.2, 1.6 + i * 0.2));
        const dx = chosen ? lift * 20 : 0;
        return (
          <g key={d.n} opacity={k * (chosen || t < 2.6 ? 1 : 1 - easeOut(seg(t, 2.6, 3.0)) * 0.6)} transform={`translate(${dx.toFixed(1)} 0)`}>
            <T x={200} y={y + 5} s={13} a="end" f={chosen && lift > 0.5 ? C.focus : C.primary}>
              {d.n}
            </T>
            <rect x={215} y={y - 8} width={300 * costs[i] * easeInOut(seg(t, 1.4 + i * 0.2, 2.0 + i * 0.2))} height={16} rx={2} fill={chosen && lift > 0.5 ? C.focus : C.secondary} opacity={0.75} />
          </g>
        );
      })}
      <T x={515} y={118} s={13} a="end" f={C.quiet} o={easeOut(seg(t, 1.4, 1.7))}>
        cost
      </T>
      <Decode text="the consequence picks the system" t={t} at={3.2} x={300} y={288} s={15} a="middle" f={C.focus} w={600} />
      <Reticle x={300} y={206} w={470} h={30} t={t} at={3.0} />
    </Svg>
  );
}

// 7 · "make it reliable" on the ledger. The same five chips drop onto it, and every row's answer comes back "no
// answer" in red. The ask is struck through: no indicator was ever proposed.
export function RevealReject({ t }: StepCtx) {
  return (
    <Svg label="a second ask, 'make it reliable', run through the same five questions — none of them resolves, because no indicator was even proposed" h={320}>
      <Ask text='"make it reliable"' k={easeOut(seg(t, 0, 0.3))} struck={easeInOut(seg(t, 3.0, 3.4))} />
      {Q5.map((r, i) => (
        <LedgerRow key={r.q} y={84 + i * 40} q={r.q} t={t} at={0.3 + i * 0.4} empty />
      ))}
      <Decode text="no indicator proposed: rejected" t={t} at={3.4} x={300} y={300} s={15} a="middle" f={C.badText} w={600} />
    </Svg>
  );
}

const SLO_PARTS = ['indicator', 'measured where', 'target', 'window', 'consequence'];

// 8 · A room of five people, each with a speech tick: everyone agrees on "reliable". After the pick, an SLO form
// slides in with five blanks, and the agreement fills none of them; each blank stays dashed.
export function Predict2({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  return (
    <Svg label="is 'make it reliable' already an SLO, once everyone agrees what 'reliable' means?" h={300}>
      {[0, 1, 2, 3, 4].map((i) => {
        const x = 120 + i * 90;
        return (
          <g key={i} opacity={easeOut(seg(t, i * 0.1, 0.3 + i * 0.1))}>
            <circle cx={x} cy={60} r={12} fill="none" stroke={C.secondary} strokeWidth={1.4} />
            <path d={`M${x - 18} 96 Q ${x} 70 ${x + 18} 96`} fill="none" stroke={C.secondary} strokeWidth={1.4} />
            <Check at={[x + 22, 36]} t={t} from={0.6 + i * 0.15} f={C.secondary} />
          </g>
        );
      })}
      <T x={300} y={126} s={13} a="middle" f={C.secondary} o={easeOut(seg(t, 1.3, 1.6))}>
        everyone agrees on "reliable"
      </T>
      {!on && (
        <T x={300} y={220} s={15} a="middle" f={C.secondary} o={easeOut(seg(t, 1.6, 2.1))}>
          is that an SLO yet?
        </T>
      )}
      {on &&
        SLO_PARTS.map((p, i) => {
          const k = easeOutBack(seg(s, 0.2 + i * 0.15, 0.5 + i * 0.15));
          const x = 64 + i * 118;
          return (
            <g key={p} opacity={Math.min(1, Math.max(0, k))}>
              <rect x={x - 54} y={166} width={108} height={46} rx={5} fill="none" stroke={C.badText} strokeWidth={1.3} strokeDasharray="4 4" />
              <T x={x} y={234} s={13} a="middle" f={C.secondary}>
                {p === 'measured where' ? 'where' : p}
              </T>
            </g>
          );
        })}
      {on && <Decode text="agreement fills none of them" t={s} at={1.2} x={300} y={282} s={15} a="middle" f={C.badText} w={600} />}
    </Svg>
  );
}

// 9 · Four panels build in turn: the window row's fifteen; six ticks with two red; the bounded-error bar lifted;
// the struck "reliable".
export function Recap({ t }: StepCtx) {
  const P = [[20, 14], [310, 14], [20, 140], [310, 140]] as const;
  const k = (i: number) => easeOut(seg(t, 0.2 + i * 0.7, 0.6 + i * 0.7));
  const box = (i: number, label: string) => (
    <g opacity={k(i)}>
      <rect x={P[i][0]} y={P[i][1]} width={270} height={112} rx={6} fill="none" stroke={C.line} />
      <T x={P[i][0] + 135} y={P[i][1] + 100} s={13} a="middle" f={C.primary}>
        {label}
      </T>
    </g>
  );
  return (
    <Svg label="the full ledger for the dashboard ask: five questions resolved, six dimensions valued, correct defined, and the rejected unmeasurable ask beside it" h={300}>
      {box(0, 'five questions: one number')}
      <T x={P[0][0] + 135} y={P[0][1] + 56} s={24} a="middle" f={C.focus} w={600} o={k(0)}>
        {`${Math.round(15 * easeOut(seg(t, 0.4, 1.0)))} min`}
      </T>
      {box(1, 'six dimensions, none skipped')}
      <g opacity={k(1)}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x={P[1][0] + 40 + i * 34} y={P[1][1] + 32} width={22} height={22} rx={4} fill={i < 2 ? C.focus : 'none'} stroke={i === 2 || i === 3 ? C.badText : i < 2 ? C.focus : C.quiet} strokeWidth={1.4} />
        ))}
      </g>
      {box(2, 'correct, chosen by consequence')}
      <g opacity={k(2)}>
        <rect x={P[2][0] + 40} y={P[2][1] + 26} width={190} height={10} rx={2} fill={C.secondary} opacity={0.5} />
        <rect x={P[2][0] + 40} y={P[2][1] + 46} width={70 * easeInOut(seg(t, 1.6, 2.1))} height={10} rx={2} fill={C.focus} />
      </g>
      {box(3, 'unmeasurable: rejected')}
      <g opacity={k(3)}>
        <T x={P[3][0] + 135} y={P[3][1] + 50} s={14} a="middle" f={C.secondary} serif italic>
          "make it reliable"
        </T>
        <line x1={P[3][0] + 60} y1={P[3][1] + 45} x2={lerp(P[3][0] + 60, P[3][0] + 210, easeInOut(seg(t, 2.6, 3.0)))} y2={P[3][1] + 45} stroke={C.badText} strokeWidth={2} />
      </g>
      <Reticle x={P[2][0] + 135} y={P[2][1] + 56} w={276} h={118} t={t} at={3.5} />
    </Svg>
  );
}

// 10 · The new ask on top and six dimension chips beneath. After the pick, the correctness chip lights and the four
// definitions line up beneath it; the marker slides to the strict, exactly-once end, and "a privacy incident" lands
// in red as the consequence that forces it.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const slide = on ? easeInOut(seg(s, 0.8, 1.5)) : 0;
  return (
    <Svg label="a new ask: the warehouse must never show a customer someone else's order — which dimension, and which definition of correct, does its consequence force?" h={300}>
      <Ask text={'"never show a customer another\'s order"'} k={easeOut(seg(t, 0, 0.4))} />
      {DIMS.map((d, i) => {
        const x = 70 + i * 92;
        const lit = on && d.n === 'correctness' && s > 0.3;
        return (
          <g key={d.n} opacity={easeOut(seg(t, 0.3 + i * 0.1, 0.6 + i * 0.1))}>
            <rect x={x - 44} y={84} width={88} height={28} rx={14} fill={lit ? C.focus : 'none'} stroke={lit ? C.focus : C.line} strokeWidth={1.3} />
            <T x={x} y={103} s={13} a="middle" f={lit ? C.void : C.secondary} w={lit ? 600 : 400}>
              {d.n === 'completeness' ? 'complete' : d.n === 'availability' ? 'avail.' : d.n === 'correctness' ? 'correct' : d.n === 'freshness' ? 'fresh' : d.n === 'retention' ? 'retain' : 'latency'}
            </T>
          </g>
        );
      })}
      {!on && (
        <T x={300} y={200} s={15} a="middle" f={C.secondary} o={easeOut(seg(t, 1.0, 1.5))}>
          which dimension, which definition?
        </T>
      )}
      {on && (
        <g>
          <line x1={90} y1={180} x2={510} y2={180} stroke={C.line} strokeWidth={2} opacity={easeOut(seg(s, 0.5, 0.8))} />
          {['exactly-once', 'T+1', 'bounded', 'at-most'].map((n, i) => (
            <T key={n} x={90 + i * 140} y={210} s={13} a="middle" f={i === 0 && slide > 0.9 ? C.focus : C.secondary} o={easeOut(seg(s, 0.5 + i * 0.1, 0.8 + i * 0.1))}>
              {n}
            </T>
          ))}
          <circle cx={lerp(370, 90, slide)} cy={180} r={8} fill={C.focus} opacity={easeOut(seg(s, 0.6, 0.8))} />
          <Decode text="a privacy incident forces it" t={s} at={1.6} x={300} y={268} s={15} a="middle" f={C.badText} w={600} />
          <Reticle x={90} y={194} w={120} h={46} t={s} at={1.6} />
        </g>
      )}
    </Svg>
  );
}
