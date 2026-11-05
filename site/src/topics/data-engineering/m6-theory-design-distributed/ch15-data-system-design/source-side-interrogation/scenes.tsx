import { useEffect, useState } from 'react';
import { C, Draw, Reticle, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// CHAPTER.md, topic 10: a source box on the left, a stack of question cards on the right; each card flips to show the
// design decision its answer changes and lands on that box (resend → dedup, down → buffer, schema owner → contract);
// cards the partner can't answer turn red; an answers panel crosses out "real time" for a measured delay. Answers
// are examples.py's interview: the partner's platform team owns the schema, gives a day's notice, sends JSON events
// over a webhook, averages 1,200 and peaks at 9,000, grows 40%, resends with no new event id, pushes over HTTPS with
// a signed secret; the rate limit and residency come back unknown; "drops" was answered with an adjective.

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

/** A card that flips (squash in x) from its question to its answer at `at`. */
function Card({ x, y, w = 180, q, a, t, at, red = false, k = 1 }: { x: number; y: number; w?: number; q: string; a: string; t: number; at: number; red?: boolean; k?: number }) {
  if (k <= 0) return null;
  const p = seg(t, at, at + 0.5);
  const flipped = p >= 0.5;
  const sx = Math.abs(Math.cos(p * Math.PI));
  const cx = x + w / 2;
  return (
    <g opacity={Math.min(1, k)} transform={`translate(${cx} 0) scale(${Math.max(0.02, sx)} 1) translate(${-cx} 0)`}>
      <rect x={x} y={y} width={w} height={30} rx={4} fill={flipped && red ? C.bad : C.panel} stroke={flipped ? (red ? C.badText : C.focus) : C.line} strokeWidth={1.3} />
      <T x={cx} y={y + 20} s={13} f={flipped ? C.focus : C.primary} a="middle">
        {flipped ? a : q}
      </T>
    </g>
  );
}

/** A box on the design side. */
const DBox = ({ x, y, label, lit = false, o = 1, w = 100 }: { x: number; y: number; label: string; lit?: boolean; o?: number; w?: number }) => (
  <g opacity={o}>
    <rect x={x} y={y} width={w} height={32} rx={4} fill={C.panel} stroke={lit ? C.focus : C.line} strokeWidth={lit ? 1.8 : 1} />
    <T x={x + w / 2} y={y + 21} s={13} f={lit ? C.focus : C.primary} a="middle">
      {label}
    </T>
  </g>
);

// 1 · The partner says "real time"; three weeks pass; three cracks open in the pipeline one after another: a retry
// doubles a revenue bar, events fall through an hourly maintenance gap, and a renamed field snaps the parser.
export function Hook({ t }: StepCtx) {
  const dbl = easeOut(seg(t, 1.0, 1.4));
  const gapK = easeOut(seg(t, 1.8, 2.2));
  const snap = easeOut(seg(t, 2.6, 3.0));
  return (
    <Svg label="a payments partner's events 'arrive in real time' — three weeks on, three cracks appear" h={300}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <rect x={30} y={20} width={130} height={40} rx={4} fill={C.panel} stroke={C.line} />
        <T x={95} y={45} s={13} f={C.primary} a="middle">
          payments partner
        </T>
        <T x={190} y={45} s={15} f={C.secondary} serif italic>
          "arrive in real time"
        </T>
      </g>
      <T x={575} y={45} s={13} f={C.quiet} a="end" o={easeOut(seg(t, 0.6, 0.9))}>
        three weeks later
      </T>
      {/* crack 1: a retry doubles revenue */}
      <g opacity={easeOut(seg(t, 0.8, 1.1))}>
        <rect x={40} y={90} width={14} height={14} fill={C.primary} />
        <rect x={60} y={90} width={14} height={14} fill={C.primary} opacity={dbl} />
        <T x={84} y={102} s={13} f={C.secondary}>
          retry
        </T>
        <rect x={150} y={150 - 30 - 30 * dbl} width={30} height={30 + 30 * dbl} fill={dbl > 0.5 ? C.bad : C.primary} stroke={dbl > 0.5 ? C.badText : 'none'} />
        <T x={165} y={168} s={13} f={dbl > 0.5 ? C.badText : C.secondary} a="middle">
          ×2
        </T>
      </g>
      {/* crack 2: hourly maintenance drops events */}
      <g opacity={easeOut(seg(t, 1.6, 1.9))}>
        <line x1={230} y1={120} x2={400} y2={120} stroke={C.line} />
        <rect x={300} y={100} width={36} height={40} fill={C.band} stroke={C.badText} strokeDasharray="3 3" opacity={gapK} />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => {
          const x = 236 + i * 24;
          const inGap = x > 296 && x < 340;
          return <circle key={i} cx={x} cy={inGap ? lerp(120, 156, gapK) : 120} r={4} fill={inGap ? C.badText : C.primary} opacity={inGap ? 1 - gapK * 0.8 : 1} />;
        })}
        <T x={318} y={168} s={13} f={C.badText} a="middle" o={gapK}>
          hourly window
        </T>
      </g>
      {/* crack 3: a renamed field */}
      <g opacity={easeOut(seg(t, 2.4, 2.7))}>
        <T x={440} y={110} s={13} f={C.primary}>
          amount
        </T>
        <T x={440} y={132} s={13} f={C.badText} o={snap}>
          → amt
        </T>
        <path d={`M520 98 l-8 16 l10 6 l-8 18`} fill="none" stroke={C.badText} strokeWidth={2} opacity={snap} />
        <T x={500} y={168} s={13} f={C.badText} a="middle" o={snap}>
          parser breaks
        </T>
      </g>
      <T x={40} y={214} s={14} f={C.badText} o={easeOut(seg(t, 1.2, 1.5))}>
        retries
      </T>
      <T x={575} y={214} s={14} f={C.badText} a="end" o={easeOut(seg(t, 1.3, 1.6))}>
        revenue double-counted
      </T>
      <T x={40} y={242} s={14} f={C.badText} o={easeOut(seg(t, 2.0, 2.3))}>
        maintenance window
      </T>
      <T x={575} y={242} s={14} f={C.badText} a="end" o={easeOut(seg(t, 2.1, 2.4))}>
        events dropped
      </T>
      <T x={40} y={270} s={14} f={C.primary} o={easeOut(seg(t, 2.8, 3.1))}>
        field renamed
      </T>
      <T x={575} y={270} s={14} f={C.secondary} a="end" o={easeOut(seg(t, 2.9, 3.2))}>
        a day's notice
      </T>
    </Svg>
  );
}

const QS: [string, string, string][] = [
  ['do you resend?', 'dedup', 'retries'],
  ['when you’re down?', 'buffer', 'window'],
  ['who owns the schema?', 'contract', 'rename'],
];

// 2 · The partner's own diagram grows more boxes and stays silent. After the pick, three question cards slide out and
// each one lands on the crack it would have caught.
export function Predict1({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  return (
    <Svg label="which questions, asked in the first meeting, would have prevented each crack?" h={250}>
      <g opacity={easeOut(seg(t, 0, 0.4)) * (on ? 1 - 0.6 * easeOut(seg(s, 0, 0.4)) : 1)}>
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={40 + (i % 2) * 70} y={30 + Math.floor(i / 2) * 46} width={56} height={32} rx={3} fill={C.panel} stroke={C.line} opacity={easeOut(seg(t, i * 0.2, i * 0.2 + 0.3))} />
        ))}
        <T x={103} y={140} s={13} f={C.secondary} a="middle">
          their diagram
        </T>
      </g>
      {QS.map(([q, , crack], i) => {
        const k = on ? easeOutBack(seg(s, 0.3 + i * 0.35, 0.7 + i * 0.35)) : 0;
        return (
          <g key={q}>
            <T x={560} y={44 + i * 40} s={13} f={C.badText} a="end" o={easeOut(seg(t, 0.4 + i * 0.15, 0.7 + i * 0.15))}>
              {crack}
            </T>
            {k > 0 && (
              <g opacity={Math.min(1, k)} transform={`translate(${(1 - Math.min(1, k)) * -60} 0)`}>
                <rect x={220} y={26 + i * 40} width={210} height={26} rx={13} fill={C.ink} stroke={C.focus} />
                <T x={325} y={44 + i * 40} s={13} f={C.focus} a="middle">
                  {q}
                </T>
                <line x1={430} y1={39 + i * 40} x2={490} y2={39 + i * 40} stroke={C.focus} strokeWidth={1.2} />
              </g>
            )}
          </g>
        );
      })}
      {!on && (
        <T x={325} y={84} s={15} f={C.secondary} a="middle" o={easeOut(seg(t, 1.0, 1.4))}>
          what would have caught them?
        </T>
      )}
      <T x={40} y={192} s={14} f={C.secondary} o={easeOut(seg(t, 1.2, 1.5))}>
        a fuller diagram
      </T>
      <T x={575} y={192} s={14} f={C.secondary} a="end" o={easeOut(seg(t, 1.3, 1.6))}>
        doesn't ask
      </T>
      {on && (
        <>
          <T x={40} y={224} s={14} f={C.focus} o={easeOut(seg(s, 1.4, 1.7))}>
            resend, downtime, owner
          </T>
          <T x={575} y={224} s={14} f={C.focus} a="end" o={easeOut(seg(s, 1.5, 1.8))}>
            asks directly
          </T>
        </>
      )}
    </Svg>
  );
}

// 3 · Source on the left, three cards stacked on the right. Each flips in turn to name the decision it changes, and a
// line drops from it to that box on the design strip below.
export function RevealQuestionCards({ t }: StepCtx) {
  return (
    <Svg label="a source box on the left, question cards on the right, each flipping to its design decision" h={270}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <rect x={30} y={40} width={110} height={80} rx={5} fill={C.panel} stroke={C.line} />
        <T x={85} y={86} s={13} f={C.primary} a="middle">
          source
        </T>
      </g>
      {QS.map(([q, a], i) => (
        <Card key={q} x={200} y={20 + i * 44} w={210} q={q} a={a} t={t} at={0.8 + i * 0.8} k={easeOut(seg(t, 0.1 + i * 0.1, 0.4 + i * 0.1))} />
      ))}
      {QS.map(([, a], i) => {
        const bx = 160 + i * 140;
        const at = 1.3 + i * 0.8;
        return (
          <g key={a}>
            <Draw pts={[[410, 35 + i * 44], [440 + i * 30, 35 + i * 44], [bx + 50, 160]]} t={t} from={at} to={at + 0.4} stroke={C.focus} w={1.2} pen={false} />
            <DBox x={bx} y={160} label={a} lit={t > at + 0.4} o={easeOut(seg(t, 0.2, 0.5))} />
          </g>
        );
      })}
      <T x={40} y={226} s={14} f={C.primary} o={easeOut(seg(t, 1.6, 1.9))}>
        do you resend?
      </T>
      <T x={575} y={226} s={14} f={C.primary} a="end" o={easeOut(seg(t, 1.7, 2.0))}>
        flips to dedup
      </T>
      <T x={40} y={254} s={14} f={C.focus} o={easeOut(seg(t, 2.4, 2.7))}>
        down, then what?
      </T>
      <T x={575} y={254} s={14} f={C.focus} a="end" o={easeOut(seg(t, 2.5, 2.8))}>
        flips to buffer
      </T>
    </Svg>
  );
}

// 4 · "real time" written large, struck through in red; in its place a delay histogram over a quarter draws itself,
// and a p99 marker drops onto its tail.
export function RevealMeasurementVsAdjective({ t }: StepCtx) {
  const strike = easeOut(seg(t, 0.6, 1.0));
  const BINS = [6, 18, 34, 46, 40, 28, 18, 11, 7, 4, 3, 2, 1.5, 1];
  const p99 = easeOutBack(seg(t, 2.6, 3.0));
  return (
    <Svg label="'real time' crossed out, replaced by a measured number from the last quarter" h={250}>
      <T x={150} y={60} s={22} f={C.primary} a="middle" serif italic o={easeOut(seg(t, 0, 0.3))}>
        "real time"
      </T>
      <line x1={70} y1={54} x2={lerp(70, 230, strike)} y2={54} stroke={C.badText} strokeWidth={2.4} />
      <T x={150} y={92} s={13} f={C.badText} a="middle" o={easeOut(seg(t, 0.9, 1.2))}>
        an adjective
      </T>
      <line x1={300} y1={140} x2={570} y2={140} stroke={C.line} opacity={easeOut(seg(t, 1.0, 1.3))} />
      {BINS.map((h, i) => {
        const k = easeOut(seg(t, 1.1 + i * 0.07, 1.4 + i * 0.07));
        return <rect key={i} x={304 + i * 19} y={140 - h * 2 * k} width={15} height={h * 2 * k} fill={C.primary} opacity={0.8} />;
      })}
      <T x={300} y={160} s={13} f={C.quiet} o={easeOut(seg(t, 1.2, 1.5))}>
        event delay, last quarter
      </T>
      {p99 > 0 && (
        <g opacity={Math.min(1, p99)} transform={`translate(0 ${(1 - Math.min(1, p99)) * -20})`}>
          <line x1={532} y1={44} x2={532} y2={140} stroke={C.focus} strokeWidth={2} />
          <T x={532} y={36} s={13} f={C.focus} a="middle" w={700}>
            p99
          </T>
        </g>
      )}
      <T x={40} y={204} s={14} f={C.secondary} o={easeOut(seg(t, 1.0, 1.3))}>
        real time
      </T>
      <T x={575} y={204} s={14} f={C.badText} a="end" o={easeOut(seg(t, 1.1, 1.4))}>
        crossed out
      </T>
      <T x={40} y={234} s={14} f={C.focus} o={easeOut(seg(t, 3.0, 3.3))}>
        p99 delay
      </T>
      <T x={575} y={234} s={14} f={C.focus} a="end" o={easeOut(seg(t, 3.1, 3.4))}>
        a measured number
      </T>
    </Svg>
  );
}

// 5 · A contract card fills its fields — owner, format, notice — then its status and version fields light, and the
// version ticks over with the notice shown beside it.
export function RevealSchemaOwnership({ t }: StepCtx) {
  const FIELDS: [string, string][] = [
    ['owner', "partner's platform team"],
    ['format', 'JSON events, webhook'],
    ['notice', "a day's, best effort"],
  ];
  const tick = t > 2.8;
  return (
    <Svg label="who owns the schema and the right to change it; a contract's own status and version fields" h={260}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <rect x={30} y={14} width={540} height={170} rx={5} fill={C.panel} stroke={C.line} />
        <T x={46} y={38} s={13} f={C.quiet}>
          source contract
        </T>
      </g>
      {FIELDS.map(([k, v], i) => {
        const at = 0.3 + i * 0.4;
        return (
          <g key={k} opacity={easeOut(seg(t, at, at + 0.3))}>
            <T x={46} y={66 + i * 26} s={13} f={C.secondary}>
              {k}
            </T>
            <T x={150} y={66 + i * 26} s={13} f={C.primary}>
              {v}
            </T>
          </g>
        );
      })}
      <g opacity={easeOut(seg(t, 1.8, 2.1))}>
        <rect x={40} y={140} width={240} height={32} rx={4} fill="none" stroke={C.focus} />
        <T x={52} y={161} s={13} f={C.focus}>
          status: active
        </T>
        <rect x={300} y={140} width={260} height={32} rx={4} fill="none" stroke={C.focus} />
        <T x={312} y={161} s={13} f={C.focus}>
          version: {tick ? 'v4' : 'v3'}
        </T>
        {tick && (
          <T x={548} y={161} s={13} f={C.secondary} a="end" o={easeOut(seg(t, 2.9, 3.2))}>
            checkable
          </T>
        )}
      </g>
      <T x={40} y={218} s={14} f={C.primary} o={easeOut(seg(t, 1.0, 1.3))}>
        owner
      </T>
      <T x={575} y={218} s={14} f={C.secondary} a="end" o={easeOut(seg(t, 1.1, 1.4))}>
        named, not assumed
      </T>
      <T x={40} y={246} s={14} f={C.focus} o={easeOut(seg(t, 2.4, 2.7))}>
        status, version
      </T>
      <T x={575} y={246} s={14} f={C.focus} a="end" o={easeOut(seg(t, 2.5, 2.8))}>
        checkable fields
      </T>
    </Svg>
  );
}

// 6 · Three arrivals: e17 at 12:00:01, e18 at 12:00:01, then e17 resent. Keyed on the timestamp, e17 and e18 collapse
// into one (red, a real event lost). Keyed on the id, only the resend is dropped.
export function RevealDeliveryReliability({ t }: StepCtx) {
  const EV: [string, string, boolean][] = [
    ['e17', '12:00:01', false],
    ['e18', '12:00:01', false],
    ['e17', '12:00:09', true],
  ];
  const tsK = easeOut(seg(t, 1.4, 1.9));
  const idK = easeOut(seg(t, 2.6, 3.1));
  return (
    <Svg label="late, duplicate, lost, resent — a resend without a fresh id is a duplicate waiting to happen" h={270}>
      {['late', 'duplicate', 'lost', 'resent'].map((c, i) => (
        <g key={c} opacity={easeOut(seg(t, i * 0.12, i * 0.12 + 0.3))}>
          <rect x={30 + i * 138} y={8} width={124} height={24} rx={12} fill={C.ink} stroke={i === 3 ? C.focus : C.line} />
          <T x={92 + i * 138} y={25} s={13} f={i === 3 ? C.focus : C.secondary} a="middle">
            {c}
          </T>
        </g>
      ))}
      {EV.map(([id, ts, resend], i) => (
        <g key={i} opacity={easeOut(seg(t, 0.4 + i * 0.25, 0.7 + i * 0.25))}>
          <rect x={30} y={48 + i * 32} width={160} height={26} rx={3} fill={C.panel} stroke={resend ? C.second : C.line} />
          <T x={40} y={66 + i * 32} s={13} f={resend ? C.second : C.primary}>
            {id} · {ts}
          </T>
        </g>
      ))}
      {/* keyed on timestamp */}
      <g opacity={tsK}>
        <T x={230} y={60} s={13} f={C.secondary}>
          key: timestamp
        </T>
        <rect x={230} y={70} width={140} height={26} rx={3} fill={C.panel} stroke={C.line} />
        <T x={240} y={88} s={13} f={C.primary}>
          e17
        </T>
        <rect x={230} y={102} width={140} height={26} rx={3} fill={C.bad} stroke={C.badText} />
        <T x={240} y={120} s={13} f={C.focus}>
          e18 lost
        </T>
      </g>
      {/* keyed on id */}
      <g opacity={idK}>
        <T x={410} y={60} s={13} f={C.focus}>
          key: event id
        </T>
        <rect x={410} y={70} width={140} height={26} rx={3} fill={C.panel} stroke={C.focus} />
        <T x={420} y={88} s={13} f={C.primary}>
          e17
        </T>
        <rect x={410} y={102} width={140} height={26} rx={3} fill={C.panel} stroke={C.focus} />
        <T x={420} y={120} s={13} f={C.primary}>
          e18
        </T>
        <T x={420} y={152} s={13} f={C.second}>
          resend dropped
        </T>
      </g>
      <T x={40} y={210} s={14} f={C.primary} o={easeOut(seg(t, 1.0, 1.3))}>
        resend
      </T>
      <T x={575} y={210} s={14} f={C.second} a="end" o={easeOut(seg(t, 1.1, 1.4))}>
        same event id
      </T>
      <T x={40} y={240} s={14} f={C.focus} o={easeOut(seg(t, 3.0, 3.3))}>
        dedup key
      </T>
      <T x={575} y={240} s={14} f={C.focus} a="end" o={easeOut(seg(t, 3.1, 3.4))}>
        id, not timestamp
      </T>
    </Svg>
  );
}

// 7 · A rate trace with the average line at 1,200 and a burst to 9,000; a +40% growth arrow; these three drop into the
// estimate box. HTTPS and a signed secret drop into the client box; the quota is drawn as a ceiling with a "?".
export function RevealVolumeProtocol({ t }: StepCtx) {
  const pts = Array.from({ length: 41 }, (_, i) => {
    const u = i / 40;
    const v = 1200 + Math.exp(-Math.pow((u - 0.6) / 0.04, 2)) * 7800 + Math.sin(u * 30) * 150;
    return [lerp(40, 330, u), 130 - (v / 9000) * 90] as const;
  });
  return (
    <Svg label="rate, peak, growth for the estimate; protocol, auth and quota for the connection" h={290}>
      <Draw pts={pts} t={t} from={0.1} to={1.0} stroke={C.primary} w={1.6} pen={false} />
      <line x1={40} y1={130 - (1200 / 9000) * 90} x2={330} y2={130 - (1200 / 9000) * 90} stroke={C.secondary} strokeDasharray="4 3" opacity={easeOut(seg(t, 0.6, 0.9))} />
      <T x={40} y={150} s={13} f={C.secondary} o={easeOut(seg(t, 0.7, 1.0))}>
        avg 1,200
      </T>
      <T x={214} y={34} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 0.9, 1.2))}>
        peak 9,000
      </T>
      <g opacity={easeOut(seg(t, 1.1, 1.4))}>
        <path d="M250 150 l50 -24 m-12 0 l12 0 l-4 11" fill="none" stroke={C.focus} strokeWidth={1.6} />
        <T x={306} y={152} s={13} f={C.focus}>
          +40%
        </T>
      </g>
      <Draw pts={[[330, 100], [410, 100]]} t={t} from={1.4} to={1.7} stroke={C.focus} w={1.4} pen={false} />
      <DBox x={410} y={84} w={150} label="estimate" lit={t > 1.7} o={easeOut(seg(t, 0.3, 0.6))} />
      <g opacity={easeOut(seg(t, 1.8, 2.1))}>
        <T x={40} y={190} s={13} f={C.primary}>
          HTTPS · signed secret
        </T>
        <Draw pts={[[250, 186], [410, 186]]} t={t} from={2.0} to={2.3} stroke={C.focus} w={1.4} pen={false} />
      </g>
      <DBox x={410} y={170} w={150} label="client" lit={t > 2.3} o={easeOut(seg(t, 0.3, 0.6))} />
      <g opacity={easeOut(seg(t, 2.6, 2.9))}>
        <line x1={410} y1={154} x2={560} y2={154} stroke={C.badText} strokeWidth={2} />
        <T x={485} y={146} s={13} f={C.badText} a="middle">
          quota: ?
        </T>
      </g>
      <T x={40} y={234} s={14} f={C.primary} o={easeOut(seg(t, 1.6, 1.9))}>
        average, peak, growth
      </T>
      <T x={575} y={234} s={14} f={C.secondary} a="end" o={easeOut(seg(t, 1.7, 2.0))}>
        feeds the estimate
      </T>
      <T x={40} y={260} s={14} f={C.focus} o={easeOut(seg(t, 2.3, 2.6))}>
        protocol, auth
      </T>
      <T x={575} y={260} s={14} f={C.focus} a="end" o={easeOut(seg(t, 2.4, 2.7))}>
        feeds the client
      </T>
      <T x={40} y={286} s={14} f={C.badText} o={easeOut(seg(t, 3.0, 3.3))}>
        quota
      </T>
      <T x={575} y={286} s={14} f={C.badText} a="end" o={easeOut(seg(t, 3.1, 3.4))}>
        a hard ceiling
      </T>
    </Svg>
  );
}

// 8 · Two cards flip red with no answer on the back; then the design draws the constraint anyway: a ceiling under the
// client, a fence around the store's region.
export function RevealHiddenConstraint({ t }: StepCtx) {
  const plan = easeOut(seg(t, 2.4, 2.8));
  return (
    <Svg label="a quota card and a residency card both flip red — the partner can't answer either" h={250}>
      <Card x={40} y={30} w={230} q="what's your daily quota?" a="no answer" t={t} at={0.5} red />
      <Card x={320} y={30} w={240} q="where must this data stay?" a="no answer" t={t} at={1.2} red />
      <g opacity={plan}>
        <DBox x={60} y={100} w={190} label="client" />
        <line x1={60} y1={146} x2={250} y2={146} stroke={C.focus} strokeWidth={2} strokeDasharray="6 4" />
        <T x={155} y={166} s={13} f={C.focus} a="middle">
          assume a tight quota
        </T>
        <rect x={326} y={94} width={226} height={50} rx={10} fill="none" stroke={C.focus} strokeWidth={1.6} strokeDasharray="6 4" />
        <DBox x={364} y={103} w={150} label="store" />
        <T x={439} y={166} s={13} f={C.focus} a="middle">
          assume one region
        </T>
      </g>
      <T x={40} y={208} s={14} f={C.badText} o={easeOut(seg(t, 0.9, 1.2))}>
        daily quota
      </T>
      <T x={575} y={208} s={14} f={C.badText} a="end" o={easeOut(seg(t, 1.0, 1.3))}>
        unanswered, red
      </T>
      <T x={40} y={236} s={14} f={C.badText} o={easeOut(seg(t, 1.6, 1.9))}>
        data residency
      </T>
      <T x={575} y={236} s={14} f={C.badText} a="end" o={easeOut(seg(t, 1.7, 2.0))}>
        unanswered, red
      </T>
    </Svg>
  );
}

// 9 · The design strip with four boxes; each caption's cards land on its box in turn; the last pair lands red.
export function Recap({ t }: StepCtx) {
  const rows: [string, string, string][] = [
    ['resend, down', 'dedup, buffer', C.primary],
    ['owner, notice', 'the contract', C.primary],
    ['rate, growth', 'the estimate', C.focus],
    ['quota, residency', 'red if unanswered', C.badText],
  ];
  return (
    <Svg label="question cards flipping to the dedup box, the buffer, the contract, the estimate, and the client" h={280}>
      {rows.map(([label, value, f], i) => {
        const y = 44 + i * 64;
        const at = 0.2 + i * 0.7;
        const k = easeOut(seg(t, at, at + 0.35));
        const land = easeOutBack(seg(t, at, at + 0.5));
        return (
          <g key={label} opacity={k}>
            <g transform={`translate(${(1 - Math.min(1, land)) * 40} 0)`}>
              <rect x={30} y={y - 18} width={180} height={26} rx={13} fill={f === C.badText ? C.bad : C.ink} stroke={f === C.badText ? C.badText : C.line} />
              <T x={120} y={y} s={13} f={f === C.badText ? C.focus : C.primary} a="middle">
                {label}
              </T>
            </g>
            <Draw pts={[[214, y - 5], [370, y - 5]]} t={t} from={at + 0.2} to={at + 0.5} stroke={f} w={1.2} pen={false} />
            <T x={575} y={y} s={14} f={f} a="end">
              {value}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

// 10 · Fifteen cards; thirteen flip to answers, two flip red. After the pick, the two red cards travel into an
// "explicit unknowns" box and a worst-case shield draws over the design.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const RED = [6, 13];
  const move = on ? easeInOut(seg(s, 0.4, 1.2)) : 0;
  return (
    <Svg label="a second partner's interview; two of fifteen questions come back red, unanswerable" h={290}>
      {Array.from({ length: 15 }, (_, i) => {
        const col = i % 5, row = Math.floor(i / 5);
        const x0 = 40 + col * 70, y0 = 20 + row * 44;
        const red = RED.includes(i);
        const flip = seg(t, 0.3 + i * 0.12, 0.6 + i * 0.12);
        const tx = red ? lerp(x0, 430 + RED.indexOf(i) * 64, move) : x0;
        const ty = red ? lerp(y0, 60, move) : y0;
        return (
          <g key={i} transform={`translate(${tx + 28} 0) scale(${Math.max(0.02, Math.abs(Math.cos(flip * Math.PI)))} 1) translate(${-tx - 28} 0)`}>
            <rect x={tx} y={ty} width={56} height={34} rx={4} fill={flip >= 0.5 && red ? C.bad : C.panel} stroke={flip >= 0.5 ? (red ? C.badText : C.focus) : C.line} />
            {flip >= 0.5 && !red && <path d={`M${tx + 20} ${ty + 17} l6 6 l12 -12`} fill="none" stroke={C.focus} strokeWidth={2} />}
            {flip >= 0.5 && red && (
              <T x={tx + 28} y={ty + 23} s={13} f={C.focus} a="middle">
                ?
              </T>
            )}
          </g>
        );
      })}
      {on && (
        <g opacity={easeOut(seg(s, 1.0, 1.3))}>
          <rect x={410} y={40} width={150} height={78} rx={5} fill="none" stroke={C.focus} strokeDasharray="5 4" />
          <T x={485} y={136} s={13} f={C.focus} a="middle">
            explicit unknowns
          </T>
        </g>
      )}
      {on && (
        <g opacity={easeOut(seg(s, 1.6, 2.0))}>
          <path d="M485 148 l22 8 v14 c0 12 -10 20 -22 24 c-12 -4 -22 -12 -22 -24 v-14 z" fill="none" stroke={C.focus} strokeWidth={1.6} transform="translate(0 0)" />
        </g>
      )}
      {!on && (
        <T x={485} y={84} s={15} f={C.secondary} a="middle" o={easeOut(seg(t, 2.0, 2.4))}>
          skip the two?
        </T>
      )}
      <T x={40} y={220} s={14} f={C.primary} o={easeOut(seg(t, 1.6, 1.9))}>
        thirteen answered
      </T>
      <T x={575} y={220} s={14} f={C.secondary} a="end" o={easeOut(seg(t, 1.7, 2.0))}>
        measured or known
      </T>
      {on && (
        <>
          <T x={40} y={248} s={14} f={C.badText} o={easeOut(seg(s, 0.6, 0.9))}>
            two unanswered
          </T>
          <T x={575} y={248} s={14} f={C.badText} a="end" o={easeOut(seg(s, 0.7, 1.0))}>
            explicit unknowns
          </T>
          <T x={40} y={276} s={14} f={C.focus} o={easeOut(seg(s, 1.8, 2.1))}>
            the design
          </T>
          <T x={575} y={276} s={14} f={C.focus} a="end" o={easeOut(seg(s, 1.9, 2.2))}>
            plans for the worst case
          </T>
        </>
      )}
      <Reticle x={485} y={79} w={170} h={96} t={on ? 1 + s : 0} at={2.4} />
    </Svg>
  );
}
