import { useEffect, useState } from 'react';
import { C, Decode, Draw, Reticle, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// The chapter's quorum disc (CHAPTER.md, topic 9): five servers on a ring, the leader ringed, a vote request fanning
// out, a majority arc lighting. Logs are rows of small boxes, each holding the term of its entry. The Figure 8
// timeline is five lanes of those boxes, phase by phase, as examples.py's figure_8_scenario plays it: S1's term-two
// entry on S1 and S2; S5 elected for term three; S1 back, repairing S3 so the term-two entry sits on a majority but is
// not committed; S5 still able to win and erase it; S1's own term-four entry on a majority locking everything in. The
// membership change is membership_change_without_joint_consensus_can_split's old {S1, S2, S3} and new {S3, S4, S5}.

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

/** Five servers on a ring, S1 at the top, clockwise. */
const RC: Pt = [300, 160];
const RING: Pt[] = [0, 1, 2, 3, 4].map((i) => {
  const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
  return [RC[0] + 95 * Math.cos(a), RC[1] + 95 * Math.sin(a)] as Pt;
});
/** A point just outside server i on the ring, for its log box. */
const OUT = (i: number, d = 46): Pt => {
  const [x, y] = RING[i];
  const dx = x - RC[0], dy = y - RC[1], L = Math.hypot(dx, dy);
  return [x + (dx / L) * d, y + (dy / L) * d];
};

function Server({ i, leader = 0, down = 0, k = 1, f = C.focus }: { i: number; leader?: number; down?: number; k?: number; f?: string }) {
  const [x, y] = RING[i];
  return (
    <g opacity={k * (1 - down * 0.6)}>
      {leader > 0 && <circle cx={x} cy={y} r={22 + 7 * leader} fill="none" stroke={C.focus} strokeWidth={2} opacity={leader} />}
      <circle cx={x} cy={y} r={20} fill={C.panel} stroke={down > 0.5 ? C.quiet : f} strokeWidth={1.6} />
      <T x={x} y={y + 5} s={13} a="middle" f={down > 0.5 ? C.quiet : f}>
        {`S${i + 1}`}
      </T>
      {down > 0 && <path d={`M${x - 12} ${y - 12} l24 24 M${x + 12} ${y - 12} l-24 24`} stroke={C.badText} strokeWidth={2.4} opacity={down} />}
    </g>
  );
}

/** One log entry: a small box carrying its term. */
function Box({ at: [x, y], term, k = 1, f = C.focus, fill = false, w = 26 }: { at: Pt; term: number | string; k?: number; f?: string; fill?: boolean; w?: number }) {
  if (k <= 0) return null;
  return (
    <g opacity={Math.min(1, k)}>
      <rect x={x - w / 2} y={y - 12} width={w} height={24} rx={3} fill={fill ? f : C.panel} stroke={f} strokeWidth={1.4} />
      <T x={x} y={y + 5} s={13} a="middle" f={fill ? C.void : f} w={fill ? 600 : 400}>
        {String(term)}
      </T>
    </g>
  );
}

const Check = ({ at: [x, y], t, from, f = C.focus }: { at: Pt; t: number; from: number; f?: string }) => (
  <Draw pts={[[x - 8, y], [x - 2, y + 7], [x + 10, y - 8]]} t={t} from={from} to={from + 0.3} stroke={f} w={2.4} pen={false} />
);
const Cross = ({ at: [x, y], o }: { at: Pt; o: number }) => (o > 0 ? <path d={`M${x - 8} ${y - 8} l16 16 M${x + 8} ${y - 8} l-16 16`} stroke={C.badText} strokeWidth={2.4} opacity={o} /> : null);

/** A message between two ring servers, inset so it starts and ends at the circles' edges. */
function Msg({ a, b, t, from, to, f = C.secondary }: { a: number; b: number; t: number; from: number; to: number; f?: string }) {
  const [x0, y0] = RING[a], [x1, y1] = RING[b];
  const L = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / L, uy = (y1 - y0) / L;
  return <Draw pts={[[x0 + ux * 24, y0 + uy * 24], [x1 - ux * 24, y1 - uy * 24]]} t={t} from={from} to={to} stroke={f} w={1.6} />;
}

/** The majority arc: a thick stroke along the ring through the listed servers (consecutive around the ring). */
function Arc({ from: i0, to: i1, k, f = C.focus }: { from: number; to: number; k: number; f?: string }) {
  if (k <= 0) return null;
  const a0 = -Math.PI / 2 + (i0 * 2 * Math.PI) / 5, a1 = -Math.PI / 2 + (i1 * 2 * Math.PI) / 5;
  const a = lerp(a0, a1, easeInOut(k));
  const r = 128;
  const p = (ang: number) => `${(RC[0] + r * Math.cos(ang)).toFixed(1)} ${(RC[1] + r * Math.sin(ang)).toFixed(1)}`;
  const large = Math.abs(a - a0) > Math.PI ? 1 : 0;
  const sweep = a > a0 ? 1 : 0;
  return <path d={`M${p(a0)} A ${r} ${r} 0 ${large} ${sweep} ${p(a)}`} fill="none" stroke={f} strokeWidth={3} strokeLinecap="round" opacity={0.8} />;
}

// 1 · Five servers on the ring, S1 ringed as leader. A term-two entry lands in S1's log and travels to S2. S1 crosses
// out. S5 asks S3 and S4 for votes, they answer, and the leader's ring moves to S5, a server whose log never held it.
export function Hook({ t }: StepCtx) {
  const crash = easeOut(seg(t, 1.5, 1.8));
  const s5 = easeOutBack(seg(t, 3.0, 3.4));
  return (
    <Svg label="a leader writes an entry to itself and one follower, crashes before announcing it, and a server that never received it wins the next election" h={320}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Server key={i} i={i} leader={i === 0 ? 1 - crash : i === 4 ? s5 : 0} down={i === 0 ? crash : 0} k={easeOut(seg(t, i * 0.08, 0.3 + i * 0.08))} />
      ))}
      <Box at={OUT(0, 44)} term={2} k={easeOutBack(seg(t, 0.4, 0.7))} />
      <Msg a={0} b={1} t={t} from={0.7} to={1.1} f={C.focus} />
      <Box at={OUT(1, 46)} term={2} k={easeOutBack(seg(t, 1.1, 1.4))} />
      <Msg a={4} b={3} t={t} from={2.1} to={2.5} />
      <Msg a={4} b={2} t={t} from={2.1} to={2.5} />
      <Msg a={3} b={4} t={t} from={2.6} to={2.9} f={C.focus} />
      <Msg a={2} b={4} t={t} from={2.6} to={2.9} f={C.focus} />
      <T x={RING[4][0] - 40} y={RING[4][1] - 40} s={13} a="end" f={C.primary} o={easeOut(seg(t, 3.2, 3.5))}>
        new leader
      </T>
      <T x={RING[4][0] - 40} y={RING[4][1] - 22} s={13} a="end" f={C.secondary} o={easeOut(seg(t, 3.4, 3.7))}>
        never had it
      </T>
      <Decode text="written, never announced" t={t} at={3.8} x={300} y={310} s={15} a="middle" f={C.focus} w={600} />
    </Svg>
  );
}

// 2 · The hook's end state with a counter: two of five boxes hold the entry. After the pick, a majority arc tries to
// sweep three servers and stops short at two; S5 then writes its own term-three entry where the old one sat, and
// nothing promised is taken back.
export function PredictCommitted({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const over = easeInOut(seg(s, 1.6, 2.0));
  return (
    <Svg label="the entry sits on two of five servers when the leader crashes — is it committed, and can the new leader overwrite it?" h={320}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Server key={i} i={i} leader={i === 4 ? 1 : 0} down={i === 0 ? 1 : 0} />
      ))}
      <Box at={OUT(0, 44)} term={2} k={easeOut(seg(t, 0.1, 0.4))} />
      <Box at={OUT(1, 46)} term={over > 0.5 ? 3 : 2} k={easeOut(seg(t, 0.2, 0.5))} f={over > 0.5 ? C.second : C.focus} />
      <T x={40} y={40} s={14} f={C.primary} o={easeOut(seg(t, 0.5, 0.9))}>
        on two of five
      </T>
      {!on && (
        <T x={300} y={310} s={15} a="middle" f={C.secondary} o={easeOut(seg(t, 1.0, 1.5))}>
          committed? overwrite?
        </T>
      )}
      {on && (
        <g>
          <Arc from={0} to={1} k={seg(s, 0.2, 0.7)} f={C.badText} />
          <T x={40} y={64} s={13} f={C.badText} o={easeOut(seg(s, 0.7, 1.0))}>
            majority needs three
          </T>
          <Msg a={4} b={1} t={s} from={1.2} to={1.6} f={C.second} />
          <Decode text="not committed: free to overwrite" t={s} at={2.0} x={300} y={310} s={15} a="middle" f={C.focus} w={600} />
          <Reticle x={OUT(1, 46)[0]} y={OUT(1, 46)[1]} w={44} h={40} t={s} at={2.0} color={C.second} />
        </g>
      )}
    </Svg>
  );
}

// 3 · A strip of terms numbered upward across the top. Below, a stale leader still at term two sends a request to a
// follower at term three: it is refused, the reply carries three, the old leader's tag flips to three and its ring
// drops. The Lamport nod sits underneath.
export function RevealTerms({ t }: StepCtx) {
  const flip = t > 2.6;
  const ring = 1 - easeOut(seg(t, 2.7, 3.1));
  return (
    <Svg label="terms act as a logical clock: a server seeing a higher term steps down, and a request with a stale term is rejected" h={300}>
      {[1, 2, 3, 4].map((n, i) => (
        <g key={n} opacity={easeOut(seg(t, 0.1 + i * 0.25, 0.4 + i * 0.25))}>
          <rect x={60 + i * 125} y={30} width={118} height={26} rx={3} fill="none" stroke={C.line} />
          <rect x={60 + i * 125} y={30} width={18} height={26} rx={3} fill={C.second} opacity={0.6} />
          <T x={60 + i * 125 + 68} y={48} s={13} a="middle" f={C.primary}>
            {`term ${n}`}
          </T>
        </g>
      ))}
      <T x={60} y={78} s={13} f={C.second} o={easeOut(seg(t, 1.0, 1.3))}>
        each starts with an election
      </T>
      <g>
        {ring > 0 && <circle cx={150} cy={170} r={34} fill="none" stroke={C.focus} strokeWidth={2} opacity={ring} />}
        <circle cx={150} cy={170} r={26} fill={C.panel} stroke={C.focus} strokeWidth={1.6} />
        <T x={150} y={175} s={13} a="middle" f={C.focus}>
          S1
        </T>
        <T x={150} y={226} s={13} a="middle" f={flip ? C.focus : C.badText}>
          {flip ? 'term 3, steps down' : 'thinks term 2'}
        </T>
      </g>
      <g>
        <circle cx={450} cy={170} r={26} fill={C.panel} stroke={C.focus} strokeWidth={1.6} />
        <T x={450} y={175} s={13} a="middle" f={C.focus}>
          S3
        </T>
        <T x={450} y={226} s={13} a="middle" f={C.secondary}>
          term 3
        </T>
      </g>
      <Draw pts={[[184, 160], [416, 160]]} t={t} from={1.4} to={1.8} stroke={C.secondary} w={1.6} />
      <T x={300} y={150} s={13} a="middle" f={C.secondary} o={easeOut(seg(t, 1.4, 1.7))}>
        append, term 2
      </T>
      <Cross at={[404, 160]} o={easeOut(seg(t, 1.9, 2.1))} />
      <Draw pts={[[416, 184], [184, 184]]} t={t} from={2.1} to={2.5} stroke={C.focus} w={1.6} />
      <T x={300} y={202} s={13} a="middle" f={C.focus} o={easeOut(seg(t, 2.2, 2.5))}>
        rejected: term 3
      </T>
      <Decode text="a clock that rejects the past" t={t} at={3.4} x={300} y={284} s={15} a="middle" f={C.focus} w={600} />
    </Svg>
  );
}

const VOTE = [
  { c: [1, 3], why: 'later last term', ok: true },
  { c: [1, 2, 2, 2], why: 'tie, longer', ok: true },
  { c: [1, 2], why: 'behind', ok: false },
];
const VOTER = [1, 2, 2];

// 4 · One voter's log on the right, three candidates' logs arriving on the left one by one. Each comparison looks only
// at the last box's term, then at length on a tie: a later term wins, a tie that is longer wins, a log that is behind
// gets no vote.
export function RevealVotingRestriction({ t }: StepCtx) {
  return (
    <Svg label="a voter grants its vote only if the candidate is at least as up to date; later term wins outright, a tie falls back to log length" h={300}>
      <T x={40} y={36} s={13} f={C.secondary}>
        candidate
      </T>
      <T x={330} y={36} s={13} f={C.secondary}>
        voter
      </T>
      {VOTE.map((v, r) => {
        const y = 80 + r * 72;
        const f0 = 0.3 + r * 1.1;
        const k = easeOut(seg(t, f0, f0 + 0.3));
        const last = v.c.length - 1;
        const cmp = t > f0 + 0.5;
        return (
          <g key={r}>
            {v.c.map((term, j) => (
              <Box key={j} at={[54 + j * 32, y]} term={term} k={k} f={cmp && j === last ? (v.ok ? C.focus : C.badText) : C.secondary} fill={cmp && j === last && v.ok} />
            ))}
            {VOTER.map((term, j) => (
              <Box key={j} at={[344 + j * 32, y]} term={term} k={easeOut(seg(t, 0.1, 0.3))} f={cmp && j === VOTER.length - 1 ? C.primary : C.secondary} fill={cmp && j === VOTER.length - 1} />
            ))}
            <T x={54} y={y + 32} s={13} f={v.ok ? C.secondary : C.badText} o={easeOut(seg(t, f0 + 0.6, f0 + 0.9))}>
              {v.why}
            </T>
            {v.ok ? <Check at={[500, y]} t={t} from={f0 + 0.7} /> : <Cross at={[500, y]} o={easeOut(seg(t, f0 + 0.7, f0 + 0.9))} />}
          </g>
        );
      })}
      <Reticle x={300} y={224} w={540} h={56} t={t} at={3.9} color={C.badText} />
    </Svg>
  );
}

const LEADER = [1, 1, 2, 3, 3];
const FOLLOWER = [1, 1, 2, 2];

// 5 · Leader and follower logs, boxes by index. The append for index five carries "previous: index four, term three";
// a bracket checks the follower's index four, finds term two, and refuses (red). The bracket backs up to index three,
// the terms match, and the follower's tail is rewritten to the leader's. A shaded span then marks everything up to the
// match as identical.
export function RevealLogMatching({ t }: StepCtx) {
  const X = (j: number) => 120 + j * 64;
  const back = easeInOut(seg(t, 1.9, 2.3));
  const fixed = t > 2.8;
  const prev = lerp(3, 2, back);
  const ok = t > 2.3;
  return (
    <Svg label="two logs sharing an entry at the same index and term are identical up through it, enforced by AppendEntries's consistency check on every append" h={300}>
      <T x={100} y={36} s={13} a="end" f={C.quiet}>
        index
      </T>
      {[1, 2, 3, 4, 5].map((n, j) => (
        <T key={n} x={X(j)} y={36} s={13} a="middle" f={C.quiet}>
          {String(n)}
        </T>
      ))}
      <T x={100} y={85} s={13} a="end" f={C.secondary}>
        leader
      </T>
      <T x={100} y={165} s={13} a="end" f={C.secondary}>
        follower
      </T>
      {LEADER.map((term, j) => (
        <Box key={j} at={[X(j), 80]} term={term} w={40} k={easeOut(seg(t, 0.1 + j * 0.08, 0.3 + j * 0.08))} />
      ))}
      {FOLLOWER.map((term, j) => {
        const replaced = j === 3 && fixed;
        return <Box key={j} at={[X(j), 160]} term={replaced ? 3 : term} w={40} f={j === 3 && t > 1.4 && !fixed ? C.badText : C.focus} k={easeOut(seg(t, 0.3 + j * 0.08, 0.5 + j * 0.08))} />;
      })}
      <Box at={[X(4), 160]} term={3} w={40} k={easeOutBack(seg(t, 3.0, 3.3))} />
      <g opacity={easeOut(seg(t, 0.8, 1.1))}>
        <rect x={X(prev) - 26} y={60} width={52} height={120} rx={6} fill="none" stroke={ok ? C.focus : C.badText} strokeWidth={1.6} strokeDasharray="5 4" />
      </g>
      <T x={X(prev)} y={206} s={13} a="middle" f={ok ? C.focus : C.badText} o={easeOut(seg(t, 1.1, 1.4))}>
        {ok ? 'match' : 'refused'}
      </T>
      <Draw pts={[[X(4), 100], [X(4), 140]]} t={t} from={2.6} to={2.9} stroke={C.focus} w={1.6} />
      <Draw pts={[[X(3), 100], [X(3), 140]]} t={t} from={2.5} to={2.8} stroke={C.focus} w={1.6} />
      <rect x={X(0) - 24} y={226} width={(X(4) - X(0) + 48) * easeInOut(seg(t, 3.4, 4.0))} height={8} rx={2} fill={C.focus} opacity={0.5} />
      <T x={X(0) - 24} y={260} s={13} f={C.focus} o={easeOut(seg(t, 3.8, 4.1))}>
        same here, so same all the way back
      </T>
    </Svg>
  );
}

const LANES = ['S1', 'S2', 'S3', 'S4', 'S5'];

// 6 · Figure 8 on five lanes. S1's term-two entry reaches S1 and S2; S5 wins term three and writes its own entry on
// S3, S4, S5; S1 returns and repairs S3, so the term-two entry sits on a majority, bracketed in red: "looks committed,
// is not". A ghost S5 victory erases it in dashed red, then fades; S1 instead lands a term-four entry on S1, S2, S3,
// and the bracket turns white: now everything before it is committed.
export function RevealOldTermUnsafe({ t }: StepCtx) {
  const Y = (i: number) => 46 + i * 40;
  const X = (j: number) => 110 + j * 44;
  const b = t > 1.0, c = t > 1.9, ghost = easeOut(seg(t, 2.6, 2.9)) * (1 - easeOut(seg(t, 3.4, 3.7))), e = t > 3.6;
  const term2 = (i: number) => i === 0 || i === 1 || (i === 2 && c);
  const term3 = (i: number) => b && (i === 4 || i === 3 || (i === 2 && !c));
  const phase = e ? 'S1 commits a term-four entry' : ghost > 0.3 ? 'if S1 fell now, S5 could win' : c ? 'S1 back, repairs S3' : b ? 'S5 wins term three' : 'S1 leads, term two';
  return (
    <Svg label="a term-two entry on a majority can still be erased by a later candidate with a higher last term; only a current-term entry on a majority makes everything before it safe" h={300}>
      {LANES.map((n, i) => (
        <g key={n}>
          <T x={60} y={Y(i) + 5} s={13} a="end" f={C.secondary}>
            {n}
          </T>
          <line x1={74} y1={Y(i)} x2={250} y2={Y(i)} stroke={C.band} />
          <Box at={[X(0), Y(i)]} term={1} f={C.secondary} />
          {term2(i) && <Box at={[X(1), Y(i)]} term={2} f={c && !e ? C.badText : C.focus} k={i === 2 ? easeOutBack(seg(t, 1.9, 2.2)) : easeOutBack(seg(t, 0.2 + i * 0.2, 0.5 + i * 0.2))} />}
          {term3(i) && <Box at={[X(1), Y(i)]} term={3} f={C.second} k={easeOutBack(seg(t, 1.0, 1.3))} />}
          {e && i < 3 && <Box at={[X(2), Y(i)]} term={4} f={C.focus} fill k={easeOutBack(seg(t, 3.6 + i * 0.15, 3.9 + i * 0.15))} />}
        </g>
      ))}
      {c && <rect x={X(1) - 18} y={Y(0) - 18} width={36} height={Y(2) - Y(0) + 36} rx={5} fill="none" stroke={e ? C.focus : C.badText} strokeWidth={1.8} opacity={easeOut(seg(t, 2.0, 2.3))} />}
      {ghost > 0 && (
        <g opacity={ghost}>
          {[0, 1, 2].map((i) => (
            <rect key={i} x={X(1) - 13} y={Y(i) - 12} width={26} height={24} rx={3} fill="none" stroke={C.badText} strokeWidth={1.6} strokeDasharray="4 3" />
          ))}
          <T x={X(1) + 26} y={Y(1) + 5} s={13} f={C.badText}>
            erased?
          </T>
        </g>
      )}
      <T x={282} y={Y(0) + 5} s={13} f={C.secondary}>
        {phase}
      </T>
      <T x={282} y={Y(2) + 5} s={13} f={e ? C.focus : C.badText} o={easeOut(seg(t, 2.1, 2.4))}>
        {e ? 'now committed' : 'looks committed, is not'}
      </T>
      <Decode text="count only your own term" t={t} at={4.0} x={300} y={278} s={15} a="middle" f={C.focus} w={600} />
    </Svg>
  );
}

// 7 · Five servers in a row, the old configuration bracketed above S1 to S3 and the new below S3 to S5. Switched
// piecemeal, each side crowns its own leader (red, two leaders). Under joint consensus a decision needs a majority of
// both: S2 and S3 tick the old, S3 and S4 tick the new, and one leader stands. A long log folds into a snapshot.
export function RevealJointConsensus({ t }: StepCtx) {
  const X = (i: number) => 90 + i * 100;
  const y = 130;
  const split = easeOut(seg(t, 0.8, 1.1)) * (1 - easeOut(seg(t, 2.0, 2.3)));
  const joint = t > 2.3;
  const fold = easeInOut(seg(t, 3.8, 4.3));
  return (
    <Svg label="membership changes route through joint consensus, needing overlapping majorities of both the old and new configurations; snapshots let a server discard a log grown too long" h={300}>
      <path d={`M${X(0) - 26} 84 L${X(0) - 26} 76 L${X(2) + 26} 76 L${X(2) + 26} 84`} fill="none" stroke={C.primary} strokeWidth={1.4} opacity={easeOut(seg(t, 0.1, 0.4))} />
      <T x={X(1)} y={66} s={13} a="middle" f={C.primary} o={easeOut(seg(t, 0.1, 0.4))}>
        old
      </T>
      <path d={`M${X(2) - 26} 176 L${X(2) - 26} 184 L${X(4) + 26} 184 L${X(4) + 26} 176`} fill="none" stroke={C.second} strokeWidth={1.4} opacity={easeOut(seg(t, 0.3, 0.6))} />
      <T x={X(3)} y={204} s={13} a="middle" f={C.second} o={easeOut(seg(t, 0.3, 0.6))}>
        new
      </T>
      {[0, 1, 2, 3, 4].map((i) => {
        const crown = (i === 0 || i === 4) ? split : i === 2 && joint ? easeOutBack(seg(t, 3.2, 3.5)) : 0;
        const tick = joint && ((i === 1 || i === 2) ? t > 2.5 : i === 3 ? t > 2.8 : false);
        return (
          <g key={i}>
            {crown > 0 && <circle cx={X(i)} cy={y} r={30} fill="none" stroke={i === 2 ? C.focus : C.badText} strokeWidth={2} opacity={Math.min(1, crown)} />}
            <circle cx={X(i)} cy={y} r={22} fill={tick ? C.focus : C.panel} stroke={C.focus} strokeWidth={1.6} />
            <T x={X(i)} y={y + 5} s={13} a="middle" f={tick ? C.void : C.focus} w={tick ? 600 : 400}>
              {LANES[i]}
            </T>
          </g>
        );
      })}
      {split > 0 && (
        <T x={300} y={236} s={14} a="middle" f={C.badText} o={split}>
          two leaders, one term
        </T>
      )}
      {joint && (
        <T x={300} y={236} s={14} a="middle" f={C.focus} o={easeOut(seg(t, 2.4, 2.7))}>
          needs old and new majorities
        </T>
      )}
      <g opacity={easeOut(seg(t, 3.6, 3.8))}>
        {[0, 1, 2, 3, 4, 5].map((j) => (
          <rect key={j} x={lerp(360 + j * 30, 470, fold)} y={262} width={lerp(24, 0, fold)} height={20} rx={2} fill="none" stroke={C.secondary} opacity={1 - fold} />
        ))}
        <rect x={lerp(470, 440, fold)} y={262} width={lerp(0, 100, fold)} height={20} rx={3} fill={C.panel} stroke={C.focus} opacity={fold} />
        <T x={490} y={277} s={13} a="middle" f={C.focus} o={fold}>
          snapshot
        </T>
        <T x={340} y={277} s={13} a="end" f={C.secondary}>
          long log
        </T>
      </g>
    </Svg>
  );
}

// 8 · Four panels build in turn: a stale term crossed; a vote with a tick; two log rows joined by a match bracket; a
// filled current-term box on a majority. One line underneath names the goal all four serve.
export function Recap({ t }: StepCtx) {
  const P = [[20, 14], [310, 14], [20, 136], [310, 136]] as const;
  const k = (i: number) => easeOut(seg(t, 0.2 + i * 0.6, 0.6 + i * 0.6));
  const box = (i: number, label: string) => (
    <g opacity={k(i)}>
      <rect x={P[i][0]} y={P[i][1]} width={270} height={110} rx={6} fill="none" stroke={C.line} />
      <T x={P[i][0] + 135} y={P[i][1] + 98} s={13} a="middle" f={C.primary}>
        {label}
      </T>
    </g>
  );
  return (
    <Svg label="terms reject stale leaders; voting restriction forces leader completeness; log matching forces agreement backward; only current-term entries are safely committed by counting; joint consensus carries this through membership change" h={300}>
      {box(0, 'terms reject the past')}
      <g opacity={k(0)}>
        <Box at={[P[0][0] + 100, P[0][1] + 40]} term={2} f={C.badText} />
        <Cross at={[P[0][0] + 100, P[0][1] + 40]} o={easeOut(seg(t, 0.6, 0.8))} />
        <Box at={[P[0][0] + 170, P[0][1] + 40]} term={3} />
      </g>
      {box(1, 'votes need complete logs')}
      <g opacity={k(1)}>
        {[1, 2, 2].map((n, j) => (
          <Box key={j} at={[P[1][0] + 80 + j * 30, P[1][1] + 40]} term={n} f={C.secondary} />
        ))}
        <Check at={[P[1][0] + 200, P[1][1] + 40]} t={t} from={1.2} />
      </g>
      {box(2, 'logs agree backward')}
      <g opacity={k(2)}>
        {[0, 1, 2].map((j) => (
          <g key={j}>
            <Box at={[P[2][0] + 90 + j * 30, P[2][1] + 28]} term={j + 1} f={C.secondary} />
            <Box at={[P[2][0] + 90 + j * 30, P[2][1] + 58]} term={j + 1} f={C.secondary} />
          </g>
        ))}
        <rect x={P[2][0] + 72} y={P[2][1] + 12} width={lerp(0, 96, easeInOut(seg(t, 1.8, 2.3)))} height={62} rx={4} fill="none" stroke={C.focus} strokeWidth={1.6} />
      </g>
      {box(3, 'commit by your own term')}
      <g opacity={k(3)}>
        {[0, 1, 2].map((j) => (
          <Box key={j} at={[P[3][0] + 100 + j * 34, P[3][1] + 40]} term={4} fill={t > 2.6} />
        ))}
      </g>
      <Decode text="same commands, same order, everywhere" t={t} at={3.2} x={300} y={284} s={15} a="middle" f={C.focus} w={600} />
      <Reticle x={300} y={278} w={380} h={32} t={t} at={4.0} />
    </Svg>
  );
}

// 9 · S1 leads term four; its entry reaches S2 and S3, a majority arc lights, and S1 crosses out. After the pick, S5,
// lacking the entry, asks everyone for votes: S2 and S3 refuse (they hold a newer log), S4 agrees, and S5 stops at
// two votes of five.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const crash = easeOut(seg(t, 1.6, 1.9));
  return (
    <Svg label="a leader's own current-term entry reaches a majority, then it crashes — is the entry committed, and can the next leader erase it?" h={320}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Server key={i} i={i} leader={i === 0 ? 1 - crash : 0} down={i === 0 ? crash : 0} />
      ))}
      {[0, 1, 2].map((i) => (
        <Box key={i} at={OUT(i, 46)} term={4} k={easeOutBack(seg(t, 0.2 + i * 0.3, 0.5 + i * 0.3))} />
      ))}
      <Arc from={0} to={2} k={seg(t, 1.0, 1.5)} />
      {!on && (
        <T x={300} y={310} s={15} a="middle" f={C.secondary} o={easeOut(seg(t, 1.9, 2.4))}>
          can the next leader erase it?
        </T>
      )}
      {on && (
        <g>
          <Msg a={4} b={1} t={s} from={0.2} to={0.6} />
          <Msg a={4} b={2} t={s} from={0.2} to={0.6} />
          <Msg a={4} b={3} t={s} from={0.2} to={0.6} />
          <Cross at={[lerp(RING[4][0], RING[1][0], 0.72), lerp(RING[4][1], RING[1][1], 0.72)]} o={easeOut(seg(s, 0.7, 0.9))} />
          <Cross at={[lerp(RING[4][0], RING[2][0], 0.68), lerp(RING[4][1], RING[2][1], 0.68)]} o={easeOut(seg(s, 0.8, 1.0))} />
          <Msg a={3} b={4} t={s} from={0.9} to={1.2} f={C.focus} />
          <T x={40} y={40} s={13} f={C.secondary} o={easeOut(seg(s, 1.2, 1.5))}>
            S5: two votes of five
          </T>
          <Decode text="committed: no one can erase it" t={s} at={1.6} x={300} y={310} s={15} a="middle" f={C.focus} w={600} />
        </g>
      )}
    </Svg>
  );
}
