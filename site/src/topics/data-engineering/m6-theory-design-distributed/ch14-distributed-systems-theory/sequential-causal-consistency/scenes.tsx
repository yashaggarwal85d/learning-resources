import { useEffect, useState } from 'react';
import { C, Decode, Draw, Reticle, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// The chapter's model ladder (CHAPTER.md): models stacked strongest at the top, the availability line drawn across
// it — everything above the line stops answering during a partition — with this topic's rungs lit and the rest faint.
// The history strip and the chat example follow examples.py: p1 writes 1 and p2 reads the old 0 (legal under
// sequential consistency); Attiya's "lunch?" before Barbarella's "yes" and Cyrus's "no", whose order may swap between
// viewers but never ahead of the question. Red only for an anomaly or a broken guarantee; pale blue for "concurrent".

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

const RUNGS = ['linearizable', 'sequential', 'causal', 'eventual'];

/** The model ladder: rung boxes from strongest (top) down. `lit` rungs are bright; `line` (0..1) draws the
 * availability line under rung index `lineUnder`, and `lineY` lets it slide. */
function Ladder({ x, y, w = 170, gap = 46, lit = [], k = 1, line = 0, lineUnder = 1, dim = [], lineShift = 0 }: { x: number; y: number; w?: number; gap?: number; lit?: number[]; k?: number; line?: number; lineUnder?: number; dim?: number[]; lineShift?: number }) {
  const ly = y + lineUnder * gap + 34 + lineShift;
  return (
    <g opacity={k}>
      <line x1={x + 12} y1={y} x2={x + 12} y2={y + (RUNGS.length - 1) * gap + 30} stroke={C.line} strokeWidth={1.2} />
      <line x1={x + w - 12} y1={y} x2={x + w - 12} y2={y + (RUNGS.length - 1) * gap + 30} stroke={C.line} strokeWidth={1.2} />
      {RUNGS.map((r, i) => {
        const on = lit.includes(i);
        const off = dim.includes(i);
        return (
          <g key={r} opacity={off ? 0.35 : 1}>
            <rect x={x} y={y + i * gap} width={w} height={30} rx={4} fill={on ? C.focus : C.panel} stroke={on ? C.focus : C.line} strokeWidth={1.3} />
            <T x={x + w / 2} y={y + i * gap + 20} s={13} a="middle" f={on ? C.ink : C.secondary} w={on ? 700 : 500}>
              {r}
            </T>
          </g>
        );
      })}
      {line > 0 && <line x1={x - 14} y1={ly} x2={lerp(x - 14, x + w + 14, line)} y2={ly} stroke={C.badText} strokeWidth={2.2} strokeDasharray="7 5" />}
    </g>
  );
}

/** A feed card / chip. */
const Card = ({ at: [x, y], label, k = 1, f = C.focus, w = 120, dashed = false }: { at: Pt; label: string; k?: number; f?: string; w?: number; dashed?: boolean }) =>
  k > 0 ? (
    <g opacity={k} transform={`translate(0 ${((1 - k) * 8).toFixed(1)})`}>
      <rect x={x - w / 2} y={y - 14} width={w} height={28} rx={4} fill={C.panel} stroke={f} strokeWidth={1.4} strokeDasharray={dashed ? '5 4' : undefined} />
      <T x={x} y={y + 5} s={13} a="middle" f={f}>
        {label}
      </T>
    </g>
  ) : null;

function Arrow({ a, b, t, from, to, f = C.crema }: { a: Pt; b: Pt; t: number; from: number; to: number; f?: string }) {
  const k = easeInOut(seg(t, from, to));
  if (k <= 0) return null;
  const tip: Pt = [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const head = (s: number) => `${(b[0] - 9 * Math.cos(ang + s)).toFixed(1)} ${(b[1] - 9 * Math.sin(ang + s)).toFixed(1)}`;
  return (
    <g>
      <line x1={a[0]} y1={a[1]} x2={tip[0]} y2={tip[1]} stroke={f} strokeWidth={1.6} />
      {k < 1 ? <circle cx={tip[0]} cy={tip[1]} r={4.5} fill={C.focus} /> : <path d={`M${head(0.45)} L${b[0]} ${b[1]} L${head(-0.45)}`} fill="none" stroke={f} strokeWidth={1.6} />}
    </g>
  );
}

/** A refresh glyph that spins while k runs 0..1. */
const Refresh = ({ at: [x, y], k, o = 1 }: { at: Pt; k: number; o?: number }) => (
  <g opacity={o} transform={`translate(${x} ${y}) rotate(${(k * 360).toFixed(1)})`}>
    <path d="M-8 0 a8 8 0 1 1 3 6" fill="none" stroke={C.secondary} strokeWidth={1.8} />
    <path d="M-10 -3 l2 4 l4 -2" fill="none" stroke={C.secondary} strokeWidth={1.8} />
  </g>
);

const Tick = ({ at: [x, y], t, from, f = C.focus }: { at: Pt; t: number; from: number; f?: string }) => (
  <Draw pts={[[x - 8, y], [x - 2, y + 7], [x + 10, y - 8]]} t={t} from={from} to={from + 0.3} stroke={f} w={2.4} pen={false} />
);
const Cross = ({ at: [x, y], o }: { at: Pt; o: number }) => (o > 0 ? <path d={`M${x - 8} ${y - 8} l16 16 M${x + 8} ${y - 8} l-16 16`} stroke={C.badText} strokeWidth={2.4} opacity={o} /> : null);

// 1 · Your screen: the comment posts, a refresh loses it, another refresh brings it back. Your friend's screen: the
// reply lands above the comment it answers. Three anomalies, one store.
export function Hook({ t }: StepCtx) {
  const gone = easeOut(seg(t, 1.3, 1.5)) * (1 - easeOut(seg(t, 2.3, 2.5)));
  return (
    <Svg label="a user posts a comment, refreshes and it's missing, refreshes again and it's back; on a friend's screen a reply appears before the comment it answers" h={300}>
      <T x={150} y={30} s={13} a="middle" f={C.secondary} o={easeOut(seg(t, 0, 0.4))}>
        your screen
      </T>
      <rect x={30} y={44} width={240} height={190} rx={8} fill="none" stroke={C.line} opacity={easeOut(seg(t, 0, 0.4))} />
      <Card at={[150, 90]} label={gone > 0.5 ? 'missing' : 'your comment'} w={170} f={gone > 0.5 ? C.badText : C.focus} dashed={gone > 0.5} k={easeOut(seg(t, 0.3, 0.6))} />
      <Refresh at={[150, 150]} k={easeInOut(seg(t, 0.9, 1.3)) + easeInOut(seg(t, 1.9, 2.3))} o={easeOut(seg(t, 0.8, 1.0))} />
      <T x={150} y={196} s={13} a="middle" f={C.secondary} o={easeOut(seg(t, 1.3, 1.6))}>
        {t < 2.4 ? 'refresh: gone' : 'refresh: back'}
      </T>
      <T x={450} y={30} s={13} a="middle" f={C.secondary} o={easeOut(seg(t, 2.4, 2.8))}>
        a friend's screen
      </T>
      <rect x={330} y={44} width={240} height={190} rx={8} fill="none" stroke={C.line} opacity={easeOut(seg(t, 2.4, 2.8))} />
      <Card at={[450, 90]} label="reply" w={170} f={t > 3.4 ? C.badText : C.focus} k={easeOut(seg(t, 2.7, 3.0))} />
      <Card at={[450, 140]} label="the comment" w={170} k={easeOut(seg(t, 3.0, 3.3))} />
      <T x={450} y={196} s={13} a="middle" f={C.badText} o={easeOut(seg(t, 3.4, 3.8))}>
        reply above comment
      </T>
      <T x={300} y={280} s={15} a="middle" f={C.primary} o={easeOut(seg(t, 3.8, 4.2))}>
        one always-available store
      </T>
      <Reticle x={450} y={115} w={200} h={90} t={t} at={4.2} color={C.badText} />
    </Svg>
  );
}

// 2 · The ladder with three candidates. After the pick, the availability line draws across it: everything above stops
// answering in a partition, so linearizable and sequential go dark, and the lock-on lands on causal.
export function PredictModel({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const line = on ? easeInOut(seg(s, 0.2, 0.9)) : 0;
  const dim = on && s > 1.0 ? [0, 1] : [];
  return (
    <Svg label="for a store that always stays available, which is the weakest model that rules out all three anomalies: sequential, causal, or linearizable?" h={300}>
      <Ladder x={140} y={40} w={220} gap={56} k={easeOut(seg(t, 0, 0.6))} line={line} lineUnder={1} dim={dim} lit={on && s > 1.3 ? [2] : []} />
      <T x={390} y={124} s={13} f={C.badText} o={on ? easeOut(seg(s, 0.8, 1.1)) : 0}>
        stops answering
      </T>
      <T x={390} y={142} s={13} f={C.badText} o={on ? easeOut(seg(s, 0.8, 1.1)) : 0}>
        in a partition
      </T>
      <T x={300} y={290} s={15} a="middle" f={on ? C.focus : C.secondary} o={on ? easeOut(seg(s, 1.3, 1.6)) : easeOut(seg(t, 0.8, 1.4))}>
        {on ? 'causal: the ceiling' : 'always available — which rung?'}
      </T>
      {on && <Reticle x={250} y={40 + 2 * 56 + 15} w={240} h={44} t={s} at={1.6} />}
    </Svg>
  );
}

// 3 · p1 writes 1; afterwards p2 reads the old 0. Sequential consistency threads one order through them that puts the
// read first — backwards against the wall clock, and still legal. The mini ladder lights its rung.
export function RevealSequential({ t }: StepCtx) {
  const X0 = 100;
  const W: Pt = [175, 90], R: Pt = [325, 170];
  return (
    <Svg label="sequential consistency keeps a single total order respecting each process's program order, but drops linearizability's real-time rule: a read after a write may return the old value" h={300}>
      <Ladder x={430} y={30} w={150} gap={44} lit={[1]} k={0.9} />
      <T x={X0 - 12} y={W[1] + 5} s={13} a="end" f={C.secondary}>
        p1
      </T>
      <T x={X0 - 12} y={R[1] + 5} s={13} a="end" f={C.secondary}>
        p2
      </T>
      <line x1={X0} y1={W[1]} x2={410} y2={W[1]} stroke={C.band} />
      <line x1={X0} y1={R[1]} x2={410} y2={R[1]} stroke={C.band} />
      <g opacity={easeOut(seg(t, 0.2, 0.6))}>
        <rect x={120} y={W[1] - 13} width={110} height={26} rx={4} fill={C.panel} stroke={C.focus} strokeWidth={1.4} />
        <T x={130} y={W[1] + 5} s={13} f={C.focus}>
          write 1
        </T>
      </g>
      <g opacity={easeOut(seg(t, 0.6, 1.0))}>
        <rect x={270} y={R[1] - 13} width={110} height={26} rx={4} fill={C.panel} stroke={C.focus} strokeWidth={1.4} />
        <T x={280} y={R[1] + 5} s={13} f={C.focus}>
          read 0
        </T>
      </g>
      <line x1={250} y1={60} x2={250} y2={200} stroke={C.line} strokeDasharray="3 4" opacity={easeOut(seg(t, 1.0, 1.4))} />
      <T x={250} y={54} s={13} a="middle" f={C.quiet} o={easeOut(seg(t, 1.0, 1.4))}>
        wall clock: write first
      </T>
      <rect x={R[0] + 28} y={R[1] - 13} width={4} height={26} fill={C.focus} opacity={easeOut(seg(t, 1.6, 1.8))} />
      <rect x={W[0] + 38} y={W[1] - 13} width={4} height={26} fill={C.focus} opacity={easeOut(seg(t, 1.8, 2.0))} />
      <Draw pts={[[R[0] + 30, R[1]], [W[0] + 40, W[1]]]} t={t} from={2.0} to={2.8} stroke={C.focus} w={2.2} />
      <T x={R[0] + 40} y={R[1] + 40} s={13} f={C.primary} o={easeOut(seg(t, 2.2, 2.6))}>
        order: read, then write
      </T>
      <Decode text="still legal" t={t} at={3.0} x={20} y={262} s={16} f={C.focus} w={600} />
      <T x={20} y={288} s={13} f={C.secondary} o={easeOut(seg(t, 3.3, 3.7))}>
        one order, program order kept, clock dropped
      </T>
      <Reticle x={75} y={256} w={130} h={32} t={t} at={4.1} />
    </Svg>
  );
}

// 4 · The chat: Attiya asks, Barbarella and Cyrus each answer after reading the question. Below, three viewers' orders:
// two put the replies either way round (∥, legal); the third shows a reply before the question, struck red.
export function RevealCausal({ t }: StepCtx) {
  const Q: Pt = [170, 40], Y: Pt = [330, 90], N: Pt = [380, 140];
  const views = [
    { who: 'attiya sees', items: ['lunch?', 'yes', 'no'], bad: false },
    { who: 'barbarella sees', items: ['lunch?', 'no', 'yes'], bad: false },
    { who: 'not allowed', items: ['yes', 'lunch?', 'no'], bad: true },
  ];
  return (
    <Svg label="every participant sees the question before either answer — the causal link — but the two answers are concurrent, so participants may see them in either order" h={300}>
      {[['attiya', 40], ['barbarella', 90], ['cyrus', 140]].map(([n, y], i) => (
        <g key={n as string} opacity={easeOut(seg(t, i * 0.1, 0.4 + i * 0.1))}>
          <T x={118} y={(y as number) + 5} s={13} a="end" f={C.secondary}>
            {n}
          </T>
          <line x1={130} y1={y as number} x2={580} y2={y as number} stroke={C.band} />
        </g>
      ))}
      <Card at={Q} label="lunch?" w={84} k={easeOut(seg(t, 0.3, 0.6))} />
      <Arrow a={[Q[0] + 30, Q[1] + 14]} b={[Y[0] - 40, Y[1] - 12]} t={t} from={0.6} to={1.1} f={C.secondary} />
      <Arrow a={[Q[0] + 20, Q[1] + 14]} b={[N[0] - 40, N[1] - 12]} t={t} from={0.7} to={1.2} f={C.secondary} />
      <Card at={Y} label="yes" w={70} k={easeOut(seg(t, 1.1, 1.4))} />
      <Card at={N} label="no" w={70} k={easeOut(seg(t, 1.2, 1.5))} />
      <g opacity={easeOut(seg(t, 1.5, 1.8))}>
        <line x1={Y[0] + 36} y1={Y[1] + 8} x2={N[0] + 10} y2={N[1] - 14} stroke={C.second} strokeDasharray="4 4" strokeWidth={1.5} />
        <T x={Y[0] + 50} y={Y[1] + 36} s={17} f={C.second} w={700} serif>
          ∥
        </T>
      </g>
      {views.map((v, i) => {
        const x = 110 + i * 190;
        const k = easeOut(seg(t, 2.0 + i * 0.5, 2.4 + i * 0.5));
        return (
          <g key={v.who} opacity={k}>
            {v.items.map((it, j) => (
              <Card key={it} at={[x, 192 + j * 30]} label={it} w={90} f={v.bad && j < 2 ? C.badText : C.focus} />
            ))}
            <T x={x} y={292} s={13} a="middle" f={v.bad ? C.badText : C.secondary}>
              {v.who}
            </T>
          </g>
        );
      })}
      <Cross at={[490, 207]} o={easeOut(seg(t, 3.4, 3.7))} />
      <Reticle x={300} y={207} w={110} h={64} t={t} at={4.0} color={C.second} />
    </Svg>
  );
}

// 5 · The ladder with the availability line under sequential: causal is the highest rung below it. Two posts hold the
// line up — always available, one-way convergent — and pulling either one lets the line rise past causal.
export function RevealCeiling({ t }: StepCtx) {
  const pull = easeInOut(seg(t, 2.6, 3.2)) * (1 - easeInOut(seg(t, 3.8, 4.3)));
  return (
    <Svg label="a slightly stronger causal consistency is proven the strongest model obtainable in a system that is always available and one-way convergent; drop either condition and a stronger model is possible" h={300}>
      <Ladder x={60} y={30} w={200} gap={52} lit={[2]} line={easeInOut(seg(t, 0.3, 1.0))} lineUnder={1} lineShift={-52 * pull} />
      <T x={300} y={134 - 52 * pull} s={13} f={C.badText} o={easeOut(seg(t, 0.8, 1.1))}>
        the ceiling
      </T>
      {[['always available', 380, 0], ['one-way convergent', 500, 1]].map(([n, x, i]) => {
        const out = i === 0 ? pull : 0;
        return (
          <g key={n as string} opacity={easeOut(seg(t, 1.2 + (i as number) * 0.3, 1.6 + (i as number) * 0.3)) * (1 - out * 0.7)} transform={`translate(0 ${(out * 30).toFixed(1)})`}>
            <rect x={(x as number) - 8} y={150} width={16} height={100} fill={C.panel} stroke={C.secondary} strokeWidth={1.4} />
            <T x={x as number} y={274 + (i as number) * 18} s={13} a="middle" f={C.primary}>
              {n}
            </T>
          </g>
        );
      })}
      <line x1={300} y1={146} x2={560} y2={146} stroke={C.badText} strokeWidth={2.2} strokeDasharray="7 5" opacity={easeOut(seg(t, 1.0, 1.4))} transform={`translate(0 ${(-52 * pull).toFixed(1)})`} />
      <T x={20} y={290} s={13} f={C.secondary} o={easeOut(seg(t, 2.8, 3.2))}>
        drop one: a stronger model returns
      </T>
      <Reticle x={160} y={30 + 2 * 52 + 15} w={220} h={42} t={t} at={4.3} />
    </Svg>
  );
}

const SESSIONS = ['read-your-writes', 'monotonic reads', 'monotonic writes', 'writes-follow-reads'];

/** One session guarantee's tile; `fail` turns it red with a cross, otherwise it holds with a tick. */
function Tile({ i, t, fail, from }: { i: number; t: number; fail: number; from: number }) {
  const x = (i % 2) * 300, y = Math.floor(i / 2) * 140;
  const red = fail > 0.5;
  return (
    <g opacity={easeOut(seg(t, from, from + 0.4))}>
      <rect x={x + 16} y={y + 14} width={268} height={120} rx={6} fill="none" stroke={red ? C.badText : C.line} strokeWidth={red ? 1.8 : 1.2} />
      <T x={x + 30} y={y + 40} s={13} f={red ? C.badText : C.primary} w={600}>
        {SESSIONS[i]}
      </T>
      {red ? <Cross at={[x + 256, y + 36]} o={fail} /> : <Tick at={[x + 256, y + 36]} t={t} from={from + 0.3} />}
    </g>
  );
}

// 6 · The four session guarantees as four tiles, each with its own one-line failure. They fail one at a time — the
// other three keep their ticks — because each is a separate promise.
export function RevealSessionGuarantees({ t }: StepCtx) {
  const turn = Math.min(3, Math.floor(seg(t, 1.2, 4.4) * 4));
  const scenes = [
    ['your write', 'your read: missing'],
    ['read: a, b', 'next read: a'],
    ['w1 then w2', 'elsewhere: only w2'],
    ['read comment', 'reply shown first'],
  ];
  return (
    <Svg label="read-your-writes, monotonic reads, monotonic writes, writes-follow-reads: each session guarantee fails on its own, independently of the other three" h={300}>
      {SESSIONS.map((_, i) => {
        const x = (i % 2) * 300, y = Math.floor(i / 2) * 140;
        const failing = t > 1.2 && turn === i;
        return (
          <g key={i}>
            <Tile i={i} t={t} fail={failing ? 1 : 0} from={i * 0.2} />
            <T x={x + 30} y={y + 76} s={13} f={C.secondary} o={easeOut(seg(t, 0.6 + i * 0.1, 1.0 + i * 0.1))}>
              {scenes[i][0]}
            </T>
            <T x={x + 30} y={y + 106} s={13} f={failing ? C.badText : C.quiet} o={easeOut(seg(t, 0.8 + i * 0.1, 1.2 + i * 0.1))}>
              {scenes[i][1]}
            </T>
          </g>
        );
      })}
      <Reticle x={450} y={214} w={280} h={128} t={t} at={4.3} color={C.badText} />
    </Svg>
  );
}

// 7 · The hook's two anomalies fly to the tiles they break. Then the tempting equation — four guarantees add up to
// causal — appears with its sign left as a question mark: not claimed here.
export function RevealWhatIsNotClaimed({ t }: StepCtx) {
  const f1 = easeInOut(seg(t, 0.4, 1.2));
  const f2 = easeInOut(seg(t, 1.2, 2.0));
  return (
    <Svg label="the vanishing comment breaks read-your-writes, the out-of-order reply breaks writes-follow-reads; whether the four guarantees together equal causal consistency is not asserted here" h={300}>
      {SESSIONS.map((n, i) => {
        const hit = (i === 0 && f1 >= 1) || (i === 3 && f2 >= 1);
        return (
          <g key={n}>
            <rect x={16 + i * 144} y={120} width={134} height={56} rx={5} fill="none" stroke={hit ? C.badText : C.line} strokeWidth={hit ? 1.8 : 1.2} />
            <T x={83 + i * 144} y={142} s={13} a="middle" f={hit ? C.badText : C.secondary}>
              {n.slice(0, n.search(/[- ]/))}
            </T>
            <T x={83 + i * 144} y={162} s={13} a="middle" f={hit ? C.badText : C.secondary}>
              {n.slice(n.search(/[- ]/) + 1)}
            </T>
          </g>
        );
      })}
      <Card at={[lerp(120, 83, f1), lerp(40, 100, f1)]} label="missing comment" w={150} f={C.badText} k={easeOut(seg(t, 0, 0.3)) * (1 - easeOut(seg(t, 1.2, 1.5)))} />
      <Card at={[lerp(420, 515, f2), lerp(40, 100, f2)]} label="reply first" w={130} f={C.badText} k={easeOut(seg(t, 0.2, 0.5)) * (1 - easeOut(seg(t, 2.0, 2.3)))} />
      <g opacity={easeOut(seg(t, 2.4, 2.8))}>
        <T x={180} y={250} s={15} a="middle" f={C.primary}>
          all four
        </T>
        <T x={300} y={252} s={26} a="middle" f={C.quiet} serif>
          {t > 3.2 ? '?' : '='}
        </T>
        <T x={420} y={250} s={15} a="middle" f={C.primary}>
          causal
        </T>
      </g>
      <T x={300} y={290} s={13} a="middle" f={C.secondary} o={easeOut(seg(t, 3.3, 3.7))}>
        not claimed here
      </T>
      <Reticle x={300} y={244} w={50} h={44} t={t} at={3.9} />
    </Svg>
  );
}

// 8 · The ladder assembles: sequential lights (one order), causal lights (cause and effect), the availability line
// draws between them, and the four session tiles settle underneath.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="sequential: one total order, program order kept, real time dropped; causal: only cause and effect, the ceiling for an always-available one-way-convergent store; four session guarantees, each breakable alone" h={300}>
      <Ladder x={40} y={20} w={190} gap={48} lit={t > 1.6 ? [1, 2] : t > 0.6 ? [1] : []} line={easeInOut(seg(t, 2.2, 2.9))} lineUnder={1} />
      <T x={256} y={89} s={13} f={C.primary} o={easeOut(seg(t, 0.6, 1.0))}>
        one order, no clock
      </T>
      <T x={256} y={137} s={13} f={C.primary} o={easeOut(seg(t, 1.6, 2.0))}>
        cause and effect only
      </T>
      <T x={256} y={118} s={13} f={C.badText} o={easeOut(seg(t, 2.6, 3.0))}>
        available below
      </T>
      {SESSIONS.map((n, i) => (
        <g key={n} opacity={easeOut(seg(t, 3.0 + i * 0.2, 3.3 + i * 0.2))}>
          <rect x={16 + i * 144} y={232} width={134} height={30} rx={4} fill={C.panel} stroke={C.line} />
          <T x={83 + i * 144} y={252} s={13} a="middle" f={C.secondary}>
            {['your writes', 'mono reads', 'mono writes', 'follow reads'][i]}
          </T>
        </g>
      ))}
      <T x={20} y={290} s={13} f={C.quiet} o={easeOut(seg(t, 3.8, 4.2))}>
        four session guarantees, each its own promise
      </T>
      <Reticle x={135} y={20 + 2 * 48 + 15} w={210} h={42} t={t} at={4.2} />
    </Svg>
  );
}

// 9 · One client's session box holds two ticks: read-your-writes, monotonic reads. After the pick, a dependency that
// crosses from Attiya's question to Barbarella's view draws outside the box — nothing inside covers it.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  return (
    <Svg label="a store guarantees read-your-writes and monotonic reads to every client, nothing more — does that make it causally consistent?" h={300}>
      <rect x={30} y={30} width={250} height={150} rx={8} fill="none" stroke={C.line} opacity={easeOut(seg(t, 0, 0.4))} />
      <T x={46} y={56} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.4))}>
        one client's session
      </T>
      <T x={46} y={104} s={13} f={C.primary} o={easeOut(seg(t, 0.3, 0.7))}>
        read-your-writes
      </T>
      <Tick at={[250, 100]} t={t} from={0.6} />
      <T x={46} y={144} s={13} f={C.primary} o={easeOut(seg(t, 0.6, 1.0))}>
        monotonic reads
      </T>
      <Tick at={[250, 140]} t={t} from={0.9} />
      <Card at={[420, 70]} label="attiya: lunch?" w={170} k={easeOut(seg(t, 1.0, 1.4))} />
      <Card at={[420, 230]} label="barbarella's view" w={190} k={easeOut(seg(t, 1.2, 1.6))} />
      <T x={300} y={290} s={15} a="middle" f={on ? C.badText : C.secondary} o={on ? easeOut(seg(s, 1.0, 1.3)) : easeOut(seg(t, 1.6, 2.2))}>
        {on ? 'crosses clients: uncovered' : 'causally consistent, then?'}
      </T>
      {on && <Arrow a={[420, 86]} b={[420, 214]} t={s} from={0.2} to={0.9} f={C.badText} />}
      {on && <Reticle x={420} y={150} w={60} h={110} t={s} at={1.4} color={C.badText} />}
    </Svg>
  );
}
