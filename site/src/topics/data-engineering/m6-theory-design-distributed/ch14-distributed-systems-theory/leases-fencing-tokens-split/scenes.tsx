import { useEffect, useState } from 'react';
import { C, Decode, Draw, Reticle, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// The chapter's space-time diagram (CHAPTER.md, topic 10): a lock-service lane, two worker lanes and a storage lane.
// Worker one acquires with token 33, checks its lease, goes dark (the pause), the lease expires, worker two acquires
// with 34 and writes; worker one relights and its write arrives carrying 33. Without fencing it overwrites; with
// fencing the storage's "seen 34" turns it away (red). Tokens and the event order are examples.py's.

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

const LY = { lock: 46, one: 106, two: 166, store: 226 };

function Lane({ y, name, k = 1, x0 = 134 }: { y: number; name: string; k?: number; x0?: number }) {
  return (
    <g opacity={k}>
      <T x={x0 - 12} y={y + 5} s={13} a="end" f={C.secondary}>
        {name}
      </T>
      <line x1={x0} y1={y} x2={580} y2={y} stroke={C.band} strokeWidth={1.2} />
    </g>
  );
}

function Lanes({ k = 1 }: { k?: number }) {
  return (
    <g>
      <Lane y={LY.lock} name="lock service" k={k} />
      <Lane y={LY.one} name="worker one" k={k} />
      <Lane y={LY.two} name="worker two" k={k} />
      <Lane y={LY.store} name="storage" k={k} />
    </g>
  );
}

/** The pause: a dark block over a lane, growing from x0 to x1 as k runs 0..1. */
function Pause({ x0, x1, y, k, label = true }: { x0: number; x1: number; y: number; k: number; label?: boolean }) {
  if (k <= 0) return null;
  const w = Math.max(0, (x1 - x0) * k);
  return (
    <g>
      <rect x={x0} y={y - 8} width={w} height={16} rx={3} fill={C.void} stroke={C.quiet} strokeDasharray="3 3" />
      {label && (
        <T x={x0 + 8} y={y - 16} s={13} f={C.quiet} o={Math.min(1, k * 3)}>
          paused
        </T>
      )}
    </g>
  );
}

/** A vertical message between lanes, with an optional token chip riding its tip. */
function VMsg({ x, y0, y1, t, from, to, f = C.secondary, chip, chipF = C.focus }: { x: number; y0: number; y1: number; t: number; from: number; to: number; f?: string; chip?: string; chipF?: string }) {
  const k = easeInOut(seg(t, from, to));
  if (k <= 0) return null;
  const dir = y1 > y0 ? 1 : -1;
  const yy = lerp(y0, y1, k);
  return (
    <g>
      <line x1={x} y1={y0} x2={x} y2={yy} stroke={f} strokeWidth={1.6} />
      {k >= 1 && <path d={`M${x - 5} ${y1 - dir * 8} L${x} ${y1} L${x + 5} ${y1 - dir * 8}`} fill="none" stroke={f} strokeWidth={1.6} />}
      {chip && (
        <g>
          <rect x={x + 6} y={yy - (k >= 1 ? dir * 26 : 0) - 10} width={30} height={20} rx={10} fill={chipF} />
          <T x={x + 21} y={yy - (k >= 1 ? dir * 26 : 0) + 5} s={13} a="middle" f={C.void} w={600}>
            {chip}
          </T>
        </g>
      )}
    </g>
  );
}

/** A value sitting on the storage lane. */
function Val({ x, label, k = 1, f = C.focus, struck = 0, w = 92 }: { x: number; label: string; k?: number; f?: string; struck?: number; w?: number }) {
  if (k <= 0) return null;
  return (
    <g opacity={Math.min(1, k)}>
      <rect x={x - w / 2} y={LY.store - 13} width={w} height={26} rx={4} fill={C.panel} stroke={f} strokeWidth={1.4} />
      <T x={x} y={LY.store + 5} s={13} a="middle" f={f}>
        {label}
      </T>
      {struck > 0 && <line x1={x - w / 2 + 4} y1={LY.store} x2={lerp(x - w / 2 + 4, x + w / 2 - 4, struck)} y2={LY.store} stroke={C.badText} strokeWidth={2} />}
    </g>
  );
}

const Check = ({ at: [x, y], t, from, f = C.focus }: { at: Pt; t: number; from: number; f?: string }) => (
  <Draw pts={[[x - 8, y], [x - 2, y + 7], [x + 10, y - 8]]} t={t} from={from} to={from + 0.3} stroke={f} w={2.4} pen={false} />
);
const Cross = ({ at: [x, y], o }: { at: Pt; o: number }) => (o > 0 ? <path d={`M${x - 8} ${y - 8} l16 16 M${x + 8} ${y - 8} l-16 16`} stroke={C.badText} strokeWidth={2.4} opacity={o} /> : null);

/** The lease on the lock-service lane, drawn from x0 to x1 as it is granted; an expiry tick at its end. */
function Lease({ x0, x1, k, expired = 0 }: { x0: number; x1: number; k: number; expired?: number }) {
  if (k <= 0) return null;
  return (
    <g>
      <rect x={x0} y={LY.lock - 5} width={(x1 - x0) * k} height={10} rx={2} fill={C.focus} opacity={0.5} />
      {expired > 0 && <line x1={x1} y1={LY.lock - 14} x2={x1} y2={LY.lock + 14} stroke={C.badText} strokeWidth={2} opacity={expired} />}
      {expired > 0 && (
        <T x={x1} y={LY.lock - 20} s={13} a="middle" f={C.badText} o={expired}>
          lease expires
        </T>
      )}
    </g>
  );
}

// 1 · Worker one is granted the lease and checks it: held. Then it goes dark while the lease runs out. Worker two is
// granted and writes its result. Worker one relights, writes, and its result lands over worker two's, which is struck.
export function Hook({ t }: StepCtx) {
  const over = easeOut(seg(t, 3.3, 3.6));
  return (
    <Svg label="a paused worker's lease expires, a second worker takes over and writes, and the first worker wakes and overwrites it — having checked its lease just before it paused" h={300}>
      <Lanes k={easeOut(seg(t, 0, 0.4))} />
      <Lease x0={170} x1={300} k={easeInOut(seg(t, 0.5, 1.6))} expired={easeOut(seg(t, 1.6, 1.8))} />
      <VMsg x={170} y0={LY.lock + 6} y1={LY.one - 6} t={t} from={0.5} to={0.8} />
      <Check at={[200, LY.one - 20]} t={t} from={0.9} />
      <T x={200} y={LY.one + 26} s={13} a="middle" f={C.focus} o={easeOut(seg(t, 0.9, 1.1))}>
        lease held
      </T>
      <Pause x0={220} x1={400} y={LY.one} k={easeInOut(seg(t, 1.1, 2.6))} />
      <VMsg x={320} y0={LY.lock + 6} y1={LY.two - 6} t={t} from={1.8} to={2.1} />
      <VMsg x={360} y0={LY.two + 6} y1={LY.store - 14} t={t} from={2.2} to={2.5} f={C.focus} />
      <Val x={360} label="result two" k={easeOutBack(seg(t, 2.5, 2.8))} struck={over} f={over > 0.5 ? C.quiet : C.focus} />
      <VMsg x={460} y0={LY.one + 6} y1={LY.store - 14} t={t} from={2.9} to={3.3} f={C.badText} />
      <Val x={480} label="result one" k={easeOutBack(seg(t, 3.3, 3.6))} f={C.badText} />
      <Decode text="checked, paused, overwrote" t={t} at={3.7} x={300} y={284} s={15} a="middle" f={C.badText} w={600} />
    </Svg>
  );
}

// 2 · The hook's last frame, frozen, and the question. After the pick: a dimmed line notes that a longer lease or
// another check only moves where the pause lands; then a gate drops on the storage lane where worker one's write
// arrives, the write is crossed out, and worker two's result stands.
export function PredictFix({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const gate = on ? easeOut(seg(s, 1.0, 1.4)) : 0;
  return (
    <Svg label="would re-checking the lease before writing, a longer lease, or storage refusing the old write have actually prevented this?" h={300}>
      <Lanes />
      <Lease x0={170} x1={300} k={1} expired={1} />
      <VMsg x={170} y0={LY.lock + 6} y1={LY.one - 6} t={1} from={0} to={0.1} />
      <Pause x0={220} x1={400} y={LY.one} k={1} />
      <VMsg x={320} y0={LY.lock + 6} y1={LY.two - 6} t={1} from={0} to={0.1} />
      <VMsg x={360} y0={LY.two + 6} y1={LY.store - 14} t={1} from={0} to={0.1} f={C.focus} />
      <Val x={360} label="result two" struck={1 - gate} f={gate > 0.5 ? C.focus : C.quiet} />
      <VMsg x={460} y0={LY.one + 6} y1={gate > 0 ? LY.store - 40 : LY.store - 14} t={1} from={0} to={0.1} f={C.badText} />
      {gate < 0.5 && <Val x={480} label="result one" f={C.badText} k={1 - gate * 2} />}
      {!on && (
        <T x={300} y={284} s={15} a="middle" f={C.secondary} o={easeOut(seg(t, 0.6, 1.1))}>
          which fix actually holds?
        </T>
      )}
      {on && (
        <g>
          <T x={300} y={268} s={13} a="middle" f={C.quiet} o={easeOut(seg(s, 0.2, 0.6))}>
            longer lease, another check: the pause still lands
          </T>
          <rect x={440} y={LY.store - 34} width={40} height={6} rx={2} fill={C.focus} opacity={gate} />
          <Cross at={[460, LY.store - 50]} o={easeOut(seg(s, 1.3, 1.5))} />
          <Decode text="the storage refuses it" t={s} at={1.6} x={300} y={292} s={15} a="middle" f={C.focus} w={600} />
          <Reticle x={460} y={LY.store - 40} w={60} h={40} t={s} at={2.0} />
        </g>
      )}
    </Svg>
  );
}

// 3 · A leader lane and a quorum lane. The quorum's promise ("no new leader") spans to a deadline. Reads arrive at
// the leader one after another and are answered on the spot, no round trip. Then the cost: the leader's own lease bar
// stops short of the deadline by a pale-blue drift bound.
export function RevealLease({ t }: StepCtx) {
  const yL = 90, yQ = 170;
  const D = 470, BOUND = 36;
  return (
    <Svg label="a lease is a quorum's promise not to elect another leader until a deadline; while it holds, a local read stays linearizable, at the price of a bounded clock-drift assumption" h={300}>
      <Lane y={yL} name="leader" k={easeOut(seg(t, 0, 0.4))} />
      <Lane y={yQ} name="quorum" k={easeOut(seg(t, 0.1, 0.5))} />
      <rect x={160} y={yQ - 5} width={(D - 160) * easeInOut(seg(t, 0.5, 1.2))} height={10} rx={2} fill={C.focus} opacity={0.5} />
      <T x={160} y={yQ + 28} s={13} f={C.focus} o={easeOut(seg(t, 0.8, 1.1))}>
        promise: no new leader
      </T>
      <line x1={D} y1={yQ - 16} x2={D} y2={yQ + 16} stroke={C.focus} strokeWidth={2} opacity={easeOut(seg(t, 1.1, 1.3))} />
      <T x={D} y={yQ + 34} s={13} a="middle" f={C.secondary} o={easeOut(seg(t, 1.1, 1.3))}>
        deadline
      </T>
      <VMsg x={160} y0={yQ - 8} y1={yL + 8} t={t} from={0.5} to={0.8} f={C.focus} />
      <rect x={160} y={yL - 5} width={(D - BOUND - 160) * easeInOut(seg(t, 0.8, 1.4))} height={10} rx={2} fill={C.focus} opacity={0.5} />
      {[230, 300, 370].map((x, i) => (
        <g key={x}>
          <VMsg x={x} y0={30} y1={yL - 8} t={t} from={1.4 + i * 0.35} to={1.6 + i * 0.35} />
          <VMsg x={x + 12} y0={yL - 8} y1={34} t={t} from={1.6 + i * 0.35} to={1.75 + i * 0.35} f={C.focus} />
        </g>
      ))}
      <T x={300} y={24} s={13} a="middle" f={C.focus} o={easeOut(seg(t, 2.3, 2.6))}>
        reads answered locally
      </T>
      <rect x={D - BOUND} y={yL - 12} width={BOUND * easeInOut(seg(t, 3.0, 3.4))} height={24} rx={2} fill={C.second} opacity={0.35} />
      <T x={D - BOUND / 2} y={yL + 30} s={13} a="middle" f={C.second} o={easeOut(seg(t, 3.2, 3.5))}>
        drift bound
      </T>
      <Decode text="local and linearizable, if clocks behave" t={t} at={3.6} x={300} y={272} s={15} a="middle" f={C.focus} w={600} />
    </Svg>
  );
}

// 4 · Two attempts on two rows, with the lease's expiry as a red line through both. Top: check early, the pause drops
// into the gap, the write lands after expiry. Bottom: the check slides right up against the write, and the pause drops
// into the smaller gap anyway, pushing the write past expiry again.
export function RevealCheckFails({ t }: StepCtx) {
  const yA = 100, yB = 200, EXP = 420;
  const slide = easeInOut(seg(t, 1.9, 2.4));
  const cx = lerp(180, 380, slide);
  const push = easeInOut(seg(t, 2.6, 3.4));
  const wB = lerp(400, 500, push);
  return (
    <Svg label="a pause can land anywhere, including the gap between a check and the write right after it — moving the check closer doesn't close that gap, it just relocates it" h={300}>
      <Lane y={yA} name="check early" />
      <Lane y={yB} name="check late" />
      <line x1={EXP} y1={56} x2={EXP} y2={236} stroke={C.badText} strokeWidth={1.8} strokeDasharray="6 5" opacity={easeOut(seg(t, 0, 0.4))} />
      <T x={EXP} y={46} s={13} a="middle" f={C.badText} o={easeOut(seg(t, 0, 0.4))}>
        lease expires
      </T>
      <Check at={[180, yA - 20]} t={t} from={0.2} />
      <Pause x0={196} x1={480} y={yA} k={easeInOut(seg(t, 0.5, 1.5))} />
      <VMsg x={500} y0={yA - 2} y1={yA + 40} t={t} from={1.5} to={1.8} f={C.badText} />
      <T x={510} y={yA + 38} s={13} f={C.badText} o={easeOut(seg(t, 1.7, 1.9))}>
        stale
      </T>
      <g opacity={easeOut(seg(t, 1.8, 2.0))}>
        <Draw pts={[[cx - 8, yB - 20], [cx - 2, yB - 13], [cx + 10, yB - 28]]} t={1} from={0} to={0.1} stroke={C.focus} w={2.4} pen={false} />
      </g>
      <Pause x0={396} x1={wB - 6} y={yB} k={push > 0 ? 1 : 0} />
      <VMsg x={wB} y0={yB - 2} y1={yB + 40} t={t} from={3.4} to={3.7} f={C.badText} />
      <T x={wB + 10} y={yB + 38} s={13} f={C.badText} o={easeOut(seg(t, 3.6, 3.8))}>
        stale
      </T>
      <Decode text="the gap just moved" t={t} at={3.9} x={300} y={284} s={15} a="middle" f={C.focus} w={600} />
    </Svg>
  );
}

// 5 · The four lanes again, now with tokens. Worker one is granted 33, goes dark; worker two is granted 34 and writes,
// and the storage's counter reads "seen 34". Worker one wakes and its write arrives carrying 33: 33 is below 34, the
// write is crossed out red, and worker two's result stands.
export function RevealFencingToken({ t }: StepCtx) {
  const seen = t > 2.4 ? '34' : 'none';
  const rej = easeOut(seg(t, 3.3, 3.5));
  return (
    <Svg label="a fencing token only increases, travels with every write, and gets checked by the resource itself, which rejects any write carrying a token lower than one it has already seen" h={300}>
      <Lanes />
      <Lease x0={160} x1={290} k={easeInOut(seg(t, 0.2, 1.4))} expired={easeOut(seg(t, 1.4, 1.6))} />
      <VMsg x={160} y0={LY.lock + 6} y1={LY.one - 6} t={t} from={0.2} to={0.5} chip="33" />
      <Pause x0={210} x1={410} y={LY.one} k={easeInOut(seg(t, 0.9, 2.7))} />
      <VMsg x={310} y0={LY.lock + 6} y1={LY.two - 6} t={t} from={1.6} to={1.9} chip="34" />
      <VMsg x={360} y0={LY.two + 6} y1={LY.store - 14} t={t} from={2.0} to={2.4} f={C.focus} chip="34" />
      <Val x={360} label="result two" k={easeOutBack(seg(t, 2.4, 2.7))} />
      <g opacity={easeOut(seg(t, 0.4, 0.8))}>
        <rect x={486} y={LY.store - 16} width={90} height={32} rx={4} fill={C.panel} stroke={C.primary} strokeWidth={1.6} />
        <T x={531} y={LY.store + 5} s={13} a="middle" f={C.primary} w={600}>
          {`seen ${seen}`}
        </T>
      </g>
      <VMsg x={450} y0={LY.one + 6} y1={LY.store - 40} t={t} from={2.8} to={3.2} f={C.badText} chip="33" chipF={C.badText} />
      <Cross at={[450, LY.store - 30]} o={rej} />
      <T x={300} y={268} s={13} a="middle" f={C.badText} o={easeOut(seg(t, 3.4, 3.7))}>
        33 is below 34: rejected
      </T>
      <Reticle x={531} y={LY.store} w={100} h={42} t={t} at={3.5} />
      <Decode text="the resource checks" t={t} at={3.8} x={300} y={294} s={15} a="middle" f={C.focus} w={600} />
    </Svg>
  );
}

const NAMES = ['Chubby sequencer', 'Kafka epoch', 'ZooKeeper zxid', 'Raft term'];

// 6 · Four production names stack on the left; one by one each sends a line to the same token chip, whose number
// ticks upward while a guard beneath it turns a lower number away.
export function RevealFourNames({ t }: StepCtx) {
  const n = 33 + Math.min(3, Math.floor(seg(t, 1.0, 3.4) * 4));
  const chip: Pt = [430, 130];
  return (
    <Svg label="Chubby's sequencer, Kafka's producer epoch, ZooKeeper's zxid, and Raft's term are the same fencing idea under four different names" h={300}>
      {NAMES.map((name, i) => {
        const y = 54 + i * 52;
        return (
          <g key={name}>
            <T x={30} y={y + 5} s={13} f={C.primary} o={easeOut(seg(t, 0.1 + i * 0.25, 0.4 + i * 0.25))}>
              {name}
            </T>
            <Draw pts={[[210, y], [chip[0] - 76, chip[1]]]} t={t} from={0.6 + i * 0.4} to={0.9 + i * 0.4} stroke={C.secondary} w={1.4} pen={false} />
          </g>
        );
      })}
      <g opacity={easeOut(seg(t, 0.4, 0.8))}>
        <rect x={chip[0] - 70} y={chip[1] - 28} width={140} height={56} rx={28} fill={C.focus} />
        <T x={chip[0]} y={chip[1] + 8} s={20} a="middle" f={C.void} w={600}>
          {String(n)}
        </T>
      </g>
      <Draw pts={[[chip[0] + 84, chip[1] + 16], [chip[0] + 84, chip[1] - 18]]} t={t} from={1.0} to={1.3} stroke={C.focus} w={2} />
      <path d={`M${chip[0] + 78} ${chip[1] - 10} L${chip[0] + 84} ${chip[1] - 18} L${chip[0] + 90} ${chip[1] - 10}`} fill="none" stroke={C.focus} strokeWidth={2} opacity={easeOut(seg(t, 1.2, 1.4))} />
      <T x={chip[0]} y={chip[1] + 52} s={13} a="middle" f={C.secondary} o={easeOut(seg(t, 1.4, 1.8))}>
        a number that only grows
      </T>
      <Decode text="one mechanism, four names" t={t} at={3.6} x={300} y={280} s={15} a="middle" f={C.focus} w={600} />
      <Reticle x={chip[0]} y={chip[1]} w={156} h={70} t={t} at={4.0} />
    </Svg>
  );
}

// 7 · Lock, paused worker, resource. The lock tells the worker it is out; the message sinks into the dark segment and
// does nothing. A pale-blue lock-delay window holds the lock back after the apparent failure, but the pause outlasts
// it, and the woken worker's write lands on a resource that cannot check a token: red.
export function RevealLockIsHint({ t }: StepCtx) {
  const yL = 60, yW = 140, yR = 220;
  const sink = easeOut(seg(t, 1.1, 1.5));
  return (
    <Svg label="a lock coordinates well-behaved clients but cannot force a paused one to stay quiet; Chubby's lock-delay is an imperfect fallback for resources that cannot check a token" h={300}>
      <Lane y={yL} name="lock service" />
      <Lane y={yW} name="worker" />
      <Lane y={yR} name="resource" />
      <Pause x0={190} x1={470} y={yW} k={easeInOut(seg(t, 0.2, 1.0))} />
      <VMsg x={260} y0={yL + 6} y1={yW - 10} t={t} from={0.8} to={1.1} />
      <T x={268} y={yL + 30} s={13} f={C.secondary} o={easeOut(seg(t, 0.8, 1.0))}>
        you're out
      </T>
      {sink > 0 && <circle cx={260} cy={yW} r={lerp(6, 0, sink)} fill={C.secondary} />}
      <T x={330} y={yW + 32} s={13} a="middle" f={C.quiet} o={easeOut(seg(t, 1.4, 1.7))}>
        no one is listening
      </T>
      <rect x={280} y={yL - 12} width={110 * easeInOut(seg(t, 1.9, 2.5))} height={24} rx={3} fill={C.second} opacity={0.35} />
      <T x={335} y={yL - 20} s={13} a="middle" f={C.second} o={easeOut(seg(t, 2.1, 2.4))}>
        lock-delay
      </T>
      <VMsg x={490} y0={yW + 8} y1={yR - 8} t={t} from={2.8} to={3.2} f={C.badText} />
      <T x={500} y={yR + 30} s={13} a="middle" f={C.badText} o={easeOut(seg(t, 3.2, 3.5))}>
        lands anyway
      </T>
      <Decode text="safety lives in the resource" t={t} at={3.7} x={300} y={284} s={15} a="middle" f={C.focus} w={600} />
    </Svg>
  );
}

// 8 · Four panels build in turn: a lease bar ending short of its deadline; a check, a pause, a stale write; a 33
// crossed out against 34; four short lines meeting at one chip.
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
    <Svg label="a lease buys a local read at the price of a clock-drift bound; no client-side check beats a long pause; a resource-enforced fencing token does, under four production names" h={300}>
      {box(0, 'lease: local reads, clock bound')}
      <g opacity={k(0)}>
        <rect x={P[0][0] + 30} y={P[0][1] + 40} width={170} height={10} rx={2} fill={C.focus} opacity={0.5} />
        <rect x={P[0][0] + 200} y={P[0][1] + 34} width={30} height={22} rx={2} fill={C.second} opacity={0.35} />
      </g>
      {box(1, 'no check beats a pause')}
      <g opacity={k(1)}>
        <line x1={P[1][0] + 20} y1={P[1][1] + 46} x2={P[1][0] + 250} y2={P[1][1] + 46} stroke={C.band} />
        <rect x={P[1][0] + 70} y={P[1][1] + 38} width={130 * easeInOut(seg(t, 1.0, 1.6))} height={16} rx={3} fill={C.void} stroke={C.quiet} strokeDasharray="3 3" />
        <Check at={[P[1][0] + 50, P[1][1] + 30]} t={t} from={0.9} />
        <line x1={P[1][0] + 215} y1={P[1][1] + 46} x2={P[1][0] + 215} y2={P[1][1] + 74} stroke={C.badText} strokeWidth={1.6} opacity={easeOut(seg(t, 1.6, 1.8))} />
      </g>
      {box(2, 'the resource checks the token')}
      <g opacity={k(2)}>
        <rect x={P[2][0] + 70} y={P[2][1] + 30} width={44} height={24} rx={12} fill="none" stroke={C.badText} strokeWidth={1.6} strokeDasharray={t > 2.1 ? '4 3' : undefined} />
        <T x={P[2][0] + 92} y={P[2][1] + 47} s={13} a="middle" f={C.badText} w={600}>
          33
        </T>
        <Cross at={[P[2][0] + 128, P[2][1] + 42]} o={easeOut(seg(t, 2.1, 2.3))} />
        <rect x={P[2][0] + 150} y={P[2][1] + 30} width={44} height={24} rx={12} fill={C.focus} />
        <T x={P[2][0] + 172} y={P[2][1] + 47} s={13} a="middle" f={C.void} w={600}>
          34
        </T>
      </g>
      {box(3, 'four names, one number')}
      <g opacity={k(3)}>
        {[0, 1, 2, 3].map((i) => (
          <Draw key={i} pts={[[P[3][0] + 40, P[3][1] + 18 + i * 16], [P[3][0] + 150, P[3][1] + 42]]} t={t} from={2.4 + i * 0.1} to={2.7 + i * 0.1} stroke={C.secondary} w={1.2} pen={false} />
        ))}
        <rect x={P[3][0] + 150} y={P[3][1] + 30} width={70} height={24} rx={12} fill={C.focus} />
      </g>
      <Reticle x={P[2][0] + 135} y={P[2][1] + 56} w={276} h={118} t={t} at={3.4} />
    </Svg>
  );
}

// 9 · Two writes arrive at the storage carrying random tokens; it holds them side by side under a question mark.
// After the pick, the question mark turns red ("no order"), and an increasing pair, 33 and 34, slides in beneath and
// resolves at once.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const chip = (x: number, y: number, label: string, f: string, k: number) =>
    k > 0 ? (
      <g opacity={Math.min(1, k)}>
        <rect x={x - 32} y={y - 13} width={64} height={26} rx={13} fill={f} />
        <T x={x} y={y + 5} s={13} a="middle" f={C.void} w={600}>
          {label}
        </T>
      </g>
    ) : null;
  return (
    <Svg label="a lock service switches to a unique random token instead of an increasing counter — does uniqueness alone fix the zombie-leader problem?" h={300}>
      <rect x={180} y={40} width={240} height={90} rx={8} fill="none" stroke={C.line} opacity={easeOut(seg(t, 0, 0.3))} />
      <T x={300} y={30} s={13} a="middle" f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        storage
      </T>
      {chip(lerp(60, 240, easeInOut(seg(t, 0.3, 0.9))), 85, 'k7f', C.focus, easeOut(seg(t, 0.3, 0.5)))}
      {chip(lerp(540, 360, easeInOut(seg(t, 0.6, 1.2))), 85, 'q2a', C.focus, easeOut(seg(t, 0.6, 0.8)))}
      <T x={300} y={92} s={20} a="middle" f={on ? C.badText : C.primary} w={600} o={easeOut(seg(t, 1.2, 1.5))}>
        ?
      </T>
      {!on && (
        <T x={300} y={200} s={15} a="middle" f={C.secondary} o={easeOut(seg(t, 1.4, 1.9))}>
          which write is newer?
        </T>
      )}
      {on && (
        <g>
          <T x={300} y={156} s={13} a="middle" f={C.badText} o={easeOut(seg(s, 0.2, 0.5))}>
            different, but no order
          </T>
          {chip(lerp(60, 240, easeInOut(seg(s, 0.8, 1.3))), 206, '33', C.secondary, easeOut(seg(s, 0.8, 1.0)))}
          {chip(lerp(540, 360, easeInOut(seg(s, 1.0, 1.5))), 206, '34', C.focus, easeOut(seg(s, 1.0, 1.2)))}
          <T x={300} y={212} s={15} a="middle" f={C.focus} w={600} o={easeOut(seg(s, 1.5, 1.8))}>
            {'<'}
          </T>
          <Check at={[450, 206]} t={s} from={1.8} />
          <Decode text="unique is not ordered" t={s} at={2.0} x={300} y={274} s={15} a="middle" f={C.focus} w={600} />
        </g>
      )}
    </Svg>
  );
}
