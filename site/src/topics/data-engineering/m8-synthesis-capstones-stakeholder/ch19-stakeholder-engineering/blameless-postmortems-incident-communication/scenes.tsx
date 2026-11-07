import { useEffect, useState } from 'react';
import { C, Draw, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// Blameless post-mortems and incident communication, drawn from examples.py's simulated incident: the timeline at
// minutes 0, 12, 25, 31 and 60; 40 rows a minute × 60 minutes = 2,400 stale rows and two named plant decisions; two
// contributing factors (an unwatched failure alert, no staleness check), each with an owned action item; and the
// blaming post-mortem's one factor and one action item that its own checker flags.

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

// examples.py's simulated incident: the medium tier's recompute fails at minute 0; a plant manager flags a stale number
// at 12; on-call confirms at 25; a fix deploys at 31; fresh everywhere at 60. Impact: 40 rows a minute × 60 minutes =
// 2,400 stale rows, and two named plant decisions (plant seven's shift change, plant two's maintenance window). Two
// contributing factors (the failure alert went to an unwatched channel; no staleness check on the dashboard), each
// with an owned action item (platform on-call engineer; data platform team).
const TL: [number, string][] = [
  [0, 'recompute fails, silently'],
  [12, 'a plant manager flags it'],
  [25, 'on-call confirms'],
  [31, 'fix deployed'],
  [60, 'fresh again'],
];

// 0 · Two companies, the same incident. Company A's post-mortem points at one person; a few months on, the same red
// incident fires again from someone else. Company B's points at its deploy process; the gap closes, and the months stay
// clear.
export function Hook({ t }: StepCtx) {
  const months = easeInOut(seg(t, 1.6, 2.8));
  const again = easeOut(seg(t, 2.8, 3.1));
  return (
    <Svg label="two companies suffer the identical stale-data incident; one disciplines the engineer and the mistake recurs, the other fixes the contributing factors for good." h={220}>
      {[0, 1].map((j) => {
        const y = 50 + j * 100;
        return (
          <g key={j} opacity={easeOut(seg(t, 0.1 + j * 0.2, 0.4 + j * 0.2))}>
            <T x={25} y={y - 22} s={12} f={C.secondary}>
              {j === 0 ? 'company A: blames a person' : 'company B: fixes the process'}
            </T>
            <line x1={25} y1={y + 10} x2={575} y2={y + 10} stroke={C.line} />
            <circle cx={60} cy={y + 10} r={7} fill={C.badText} />
            <path d={`M75 ${y + 10} H${lerp(75, 560, months)}`} stroke={C.secondary} strokeWidth={1.2} strokeDasharray="3 4" />
          </g>
        );
      })}
      <Person x={130} y={52} c={C.badText} o={easeOut(seg(t, 0.8, 1.1))} />
      <g opacity={easeOut(seg(t, 1.0, 1.3))}>
        <rect x={110} y={148} width={110} height={24} rx={3} fill="none" stroke={C.second} strokeWidth={1.3} />
        <T x={165} y={165} s={11} f={C.second} a="middle">
          deploy gap
        </T>
      </g>
      <Tick x={232} y={160} k={easeOut(seg(t, 1.3, 1.5))} color={C.second} />
      <circle cx={480} cy={60} r={7} fill={C.badText} opacity={again} />
      <Person x={480} y={44} c={C.badText} o={again} />
      <T x={575} y={90} s={12} f={C.badText} a="end" o={again}>
        recurs
      </T>
      <T x={575} y={190} s={12} f={C.second} a="end" o={easeOut(seg(t, 3.2, 3.6))}>
        closed for good
      </T>
    </Svg>
  );
}

// 1 · Each company's investigation as a path of questions. A's stops at the first box — "one person" — and ends at
// "don't do that again". After the answer B's keeps going past it, down to "the process let it happen", ✓.
export function PredictWhyOneHeld({ t, answer }: StepCtx) {
  const on = answer !== null;
  const s = useSinceAnswer(on);
  return (
    <Svg label="why did one company's fix hold, and the other's didn't?" h={180}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <Box x={25} y={20} w={170} label="what happened?" />
        <Box x={25} y={80} w={170} label="one person" stroke={C.badText} />
        <line x1={110} y1={52} x2={110} y2={80} stroke={C.line} />
      </g>
      <T x={25} y={140} s={12} f={C.badText} o={easeOut(seg(t, 0.8, 1.1))}>
        stops: "don't do that again"
      </T>
      <T x={575} y={60} s={14} f={C.focus} a="end" o={on ? 0 : easeOut(seg(t, 1.2, 1.6))}>
        what differed?
      </T>
      {on && (
        <g>
          <g opacity={easeOut(seg(s, 0.2, 0.5))}>
            <Box x={320} y={20} w={170} label="what happened?" />
            <line x1={405} y1={52} x2={405} y2={80} stroke={C.line} />
            <Box x={320} y={80} w={170} label="which conditions?" />
          </g>
          <g opacity={easeOut(seg(s, 0.8, 1.2))}>
            <line x1={405} y1={112} x2={405} y2={148} stroke={C.line} />
            <T x={320} y={166} s={12} f={C.second}>
              the process let it happen
            </T>
          </g>
          <Tick x={560} y={161} k={easeOut(seg(s, 1.3, 1.6))} />
        </g>
      )}
    </Svg>
  );
}

// 2 · A 60-minute axis. The five timestamps from examples.py plant on it one by one, each with its event: the silent
// failure at 0, the plant manager at 12, on-call at 25, the fix at 31, fresh again at 60. The stale span shades red.
export function RevealTimeline({ t }: StepCtx) {
  const X = (m: number) => 40 + m * 8.6;
  return (
    <Svg label="a real, timestamped timeline for the shop's own simulated incident, from first detection to resolution." h={220}>
      <line x1={X(0)} y1={60} x2={X(60)} y2={60} stroke={C.line} strokeWidth={1.2} opacity={easeOut(seg(t, 0, 0.3))} />
      <rect x={X(0)} y={54} width={(X(60) - X(0)) * easeInOut(seg(t, 0.3, 3.2))} height={12} fill={C.badText} opacity={0.25} />
      {TL.map(([m, e], i) => {
        const k = easeOutBack(seg(t, 0.4 + i * 0.55, 0.8 + i * 0.55));
        return k <= 0 ? null : (
          <g key={m} opacity={Math.min(1, k)}>
            <line x1={X(m)} y1={50} x2={X(m)} y2={70} stroke={i === 4 ? C.second : C.focus} strokeWidth={2} />
            <T x={X(m)} y={40} s={11} f={C.secondary} a={i === 4 ? 'end' : 'middle'}>
              {i === 4 ? '60 min' : `${m}`}
            </T>
            <T x={25} y={100 + i * 24} s={12} f={C.secondary}>
              {`${m}`}
            </T>
            <T x={70} y={100 + i * 24} s={12} f={i === 4 ? C.second : C.primary}>
              {e}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

// 3 · A CPU gauge and an error-rate gauge appear and are struck. In their place a stale-row counter climbs 40 a minute
// to 2,400, and the two plant decisions made on those rows are listed by name.
export function RevealImpactInDataTerms({ t }: StepCtx) {
  const n = Math.round(40 * 60 * easeInOut(seg(t, 1.2, 2.4)));
  return (
    <Svg label="not CPU or error rate; a number of stale rows, and a named list of plant decisions actually made on them." h={200}>
      <g opacity={easeOut(seg(t, 0, 0.3)) * (1 - 0.6 * easeOut(seg(t, 0.8, 1.1)))}>
        <Box x={25} y={16} w={90} label="CPU" f={C.secondary} />
        <Box x={145} y={16} w={120} label="error rate" f={C.secondary} />
      </g>
      <Cross x={128} y={32} k={easeOut(seg(t, 0.7, 0.9))} />
      <Cross x={278} y={32} k={easeOut(seg(t, 0.8, 1.0))} />
      <g opacity={easeOut(seg(t, 1.0, 1.3))}>
        <T x={575} y={30} s={12} f={C.secondary} a="end">
          stale rows
        </T>
        <T x={575} y={62} s={22} f={C.badText} a="end">
          {n.toLocaleString('en-US')}
        </T>
      </g>
      <T x={25} y={96} s={11} f={C.quiet} o={easeOut(seg(t, 2.4, 2.7))}>
        40 a minute × 60 minutes
      </T>
      {['plant seven: shift change delayed', 'plant two: maintenance approved'].map((d, i) => (
        <g key={d} opacity={easeOut(seg(t, 2.8 + i * 0.4, 3.1 + i * 0.4))}>
          <circle cx={32} cy={130 + i * 30} r={4} fill={C.badText} />
          <T x={45} y={135 + i * 30} s={13} f={C.primary}>
            {d}
          </T>
        </g>
      ))}
    </Svg>
  );
}

// 4 · A person under a spotlight: the speech bubble stays empty. The spotlight swings off them onto the conditions
// around them — an unwatched alert channel, a dashboard with no staleness check — and the bubble fills: what happened.
export function RevealContributingFactors({ t }: StepCtx) {
  const swing = easeInOut(seg(t, 1.4, 2.4));
  const talk = easeOut(seg(t, 2.6, 3.0));
  return (
    <Svg label="a person who expects to be blamed won't tell you what really happened; looking for conditions instead of a culprit gets the honest version." h={200}>
      <path d={`M${lerp(90, 380, swing)} 0 L${lerp(55, 300, swing)} 170 L${lerp(125, 560, swing)} 170 Z`} fill={C.focus} opacity={0.06 * easeOut(seg(t, 0.2, 0.6))} />
      <Person x={90} y={140} c={C.secondary} o={easeOut(seg(t, 0, 0.3))} />
      <g opacity={easeOut(seg(t, 0.4, 0.7))}>
        <rect x={90} y={60} width={210} height={34} rx={14} fill={C.panel} stroke={talk > 0.5 ? C.second : C.line} strokeWidth={1.2} />
        <T x={195} y={82} s={12} f={talk > 0.5 ? C.second : C.quiet} a="middle">
          {talk > 0.5 ? 'here is what happened' : '…'}
        </T>
      </g>
      <g opacity={easeOut(seg(t, 1.8, 2.2))}>
        <Box x={320} y={100} w={240} label="alert unwatched" />
        <Box x={320} y={140} w={240} label="no staleness check" />
      </g>
      <T x={25} y={192} s={12} f={C.focus} o={easeOut(seg(t, 3.0, 3.4))}>
        conditions, not a culprit
      </T>
    </Svg>
  );
}

// 5 · The two contributing factors on the left. From each an arrow lands an action item with its owner tag and a
// calendar glyph. Below, a vague "be more careful" note tries to slip in and is struck.
export function RevealActionItems({ t }: StepCtx) {
  const rows: [string, string, string][] = [
    ['unwatched alert', 'route it to the pager', 'platform on-call'],
    ['no staleness check', 'add one that pages', 'data platform team'],
  ];
  return (
    <Svg label="every contributing factor gets a specific, owned action item, not a vague promise to be more careful." h={200}>
      {rows.map(([f, a, o], i) => {
        const y = 20 + i * 64;
        const k = easeOut(seg(t, 0.8 + i * 0.8, 1.2 + i * 0.8));
        return (
          <g key={f}>
            <g opacity={easeOut(seg(t, 0.1 + i * 0.2, 0.4 + i * 0.2))}>
              <Box x={25} y={y} w={190} label={f} />
            </g>
            <path d={`M215 ${y + 16} H${lerp(215, 245, k)}`} stroke={C.second} strokeWidth={1.4} />
            <g opacity={k}>
              <T x={255} y={y + 14} s={12} f={C.focus}>
                {a}
              </T>
              <T x={255} y={y + 36} s={11} f={C.second}>
                {`owner: ${o}`}
              </T>
              <rect x={540} y={y + 2} width={26} height={24} rx={2} fill="none" stroke={C.secondary} strokeWidth={1.2} />
              <line x1={540} y1={y + 9} x2={566} y2={y + 9} stroke={C.secondary} />
            </g>
          </g>
        );
      })}
      <g opacity={easeOut(seg(t, 2.6, 2.9)) * (1 - 0.5 * easeOut(seg(t, 3.2, 3.5)))}>
        <T x={25} y={174} s={13} f={C.secondary} italic>
          "we'll be more careful"
        </T>
      </g>
      <line x1={22} y1={170} x2={lerp(22, 230, easeOut(seg(t, 3.0, 3.4)))} y2={170} stroke={C.badText} strokeWidth={1.8} />
    </Svg>
  );
}

// 6 · While the incident is live: a short update card goes out — broken, being done, next update — and a ticking
// "next update" ring. After resolution, a separate, longer post-mortem page appears beside it. Two documents.
export function RevealLiveUpdate({ t }: StepCtx) {
  const lines = ["what's broken", 'what we are doing', 'next update at'];
  const pm = easeOut(seg(t, 2.8, 3.3));
  return (
    <Svg label="what gets told to the stakeholder while the incident is still live is a different document from the post-mortem written after." h={200}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <rect x={25} y={20} width={260} height={130} rx={5} fill={C.panel} stroke={C.badText} strokeWidth={1.3} />
        <T x={41} y={42} s={11} f={C.badText}>
          live update
        </T>
      </g>
      {lines.map((l, i) => (
        <T key={l} x={41} y={74 + i * 26} s={13} f={C.primary} o={easeOut(seg(t, 0.5 + i * 0.45, 0.8 + i * 0.45))}>
          {l}
        </T>
      ))}
      <g opacity={easeOut(seg(t, 1.6, 1.9))}>
        <circle cx={262} cy={122} r={10} fill="none" stroke={C.line} strokeWidth={1.4} />
        <path d={`M262 122 L${262 + 8 * Math.sin(t * 2)} ${122 - 8 * Math.cos(t * 2)}`} stroke={C.focus} strokeWidth={1.4} />
      </g>
      <g opacity={pm}>
        <rect x={330} y={14} width={200} height={160} rx={4} fill={C.panel} stroke={C.secondary} strokeWidth={1.3} />
        <T x={346} y={36} s={11} f={C.quiet}>
          post-mortem, after
        </T>
        {Array.from({ length: 7 }, (_, j) => (
          <rect key={j} x={346} y={52 + j * 16} width={j % 3 === 2 ? 100 : 160} height={4} rx={1} fill={C.line} />
        ))}
      </g>
      <T x={300} y={194} s={12} f={C.secondary} a="middle" o={easeOut(seg(t, 3.4, 3.8))}>
        two documents, never one
      </T>
    </Svg>
  );
}

// 7 · The pieces tick in with their glyphs: the five-stamp timeline, the 2,400 counter, the spotlight on conditions,
// the owner tags, and the live card beside the post-mortem page.
export function Recap({ t }: StepCtx) {
  const L = ['a timestamped timeline', 'impact in data terms', 'factors, not blame', 'owned action items', 'a live update, not the post-mortem'];
  return (
    <Svg label="a timestamped timeline, impact in data terms, contributing factors instead of blame, owned action items, and a live update that isn't the post-mortem." h={300}>
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
        <line x1={490} y1={36} x2={570} y2={36} stroke={C.line} />
        {[0, 12, 25, 31, 60].map((m) => (
          <line key={m} x1={490 + m * 1.33} y1={30} x2={490 + m * 1.33} y2={42} stroke={C.focus} strokeWidth={1.4} />
        ))}
      </g>
      <T x={570} y={88} s={13} f={C.badText} a="end" o={easeOut(seg(t, 0.85, 1.15))}>
        2,400
      </T>
      <g opacity={easeOut(seg(t, 1.4, 1.7))}>
        <rect x={500} y={118} width={60} height={22} rx={3} fill="none" stroke={C.secondary} />
      </g>
      <g opacity={easeOut(seg(t, 1.95, 2.25))}>
        <rect x={490} y={170} width={80} height={16} rx={8} fill="none" stroke={C.second} />
      </g>
      <g opacity={easeOut(seg(t, 2.5, 2.8))}>
        <rect x={480} y={210} width={36} height={30} rx={3} fill="none" stroke={C.badText} />
        <rect x={526} y={206} width={40} height={38} rx={3} fill="none" stroke={C.secondary} />
      </g>
    </Svg>
  );
}

// 8 · The post-mortem under review: one factor, "the on-call engineer deployed a bad config"; one action, "retrain the
// engineer". "What's missing?" After the answer both are flagged — a person, not a condition — and the unasked question
// writes in: what let a bad config reach production unnoticed?
export function ProveIt({ t, answer }: StepCtx) {
  const on = answer !== null;
  const s = useSinceAnswer(on);
  return (
    <Svg label="a post-mortem names one contributing factor, the on-call engineer deployed a bad config, and closes with one action item: retrain the engineer. What's missing?" h={200}>
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <T x={25} y={24} s={11} f={C.quiet}>
          contributing factors: 1
        </T>
        <T x={25} y={46} s={13} f={on && s > 0.4 ? C.badText : C.primary}>
          the on-call engineer deployed it
        </T>
      </g>
      <g opacity={easeOut(seg(t, 0.8, 1.2))}>
        <T x={25} y={82} s={11} f={C.quiet}>
          action items: 1
        </T>
        <T x={25} y={104} s={13} f={on && s > 0.8 ? C.badText : C.primary}>
          retrain the engineer
        </T>
      </g>
      <T x={575} y={150} s={14} f={C.focus} a="end" o={on ? 0 : easeOut(seg(t, 1.6, 2.0))}>
        what's missing?
      </T>
      {on && (
        <g>
          <T x={575} y={46} s={12} f={C.badText} a="end" o={easeOut(seg(s, 0.4, 0.7))}>
            a person
          </T>
          <T x={575} y={104} s={12} f={C.badText} a="end" o={easeOut(seg(s, 0.8, 1.1))}>
            blames, fixes nothing
          </T>
          <T x={25} y={150} s={13} f={C.second} o={easeOut(seg(s, 1.4, 1.8))}>
            what let a bad config reach
          </T>
          <T x={25} y={176} s={13} f={C.second} o={easeOut(seg(s, 1.4, 1.8))}>
            production unnoticed?
          </T>
        </g>
      )}
    </Svg>
  );
}
