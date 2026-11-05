import { useEffect, useState } from 'react';
import { C, Decode, Draw, Reticle, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// The chapter's history strip (CHAPTER.md): one lane per client, each operation a bar from invocation to response, its
// linearization point a tick inside the bar, a legal order a thread through the ticks; a thread that can only be drawn
// by going backwards in time (or by breaking the register) is red. Histories are examples.py's: the legal one is write
// 7 [0, 1], read 7 [1.1, 2], write 9 [2.1, 3]; the hook's is write 7 [1, 2] then a read starting at 2.5 returning the
// old 9; the cost floors use d = 1 and u = 0.3.

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

/** History time to canvas x. */
const X = (h: number) => 150 + h * 135;

function Lane({ y, name, k = 1, x0 = 140 }: { y: number; name: string; k?: number; x0?: number }) {
  return (
    <g opacity={k}>
      <T x={x0 - 12} y={y + 5} s={13} a="end" f={C.secondary}>
        {name}
      </T>
      <line x1={x0} y1={y} x2={580} y2={y} stroke={C.band} strokeWidth={1.2} />
    </g>
  );
}

/** An operation bar from invocation to response; `grow` draws it left to right as it runs. */
function Op({ y, start, end, label, grow = 1, f = C.focus, x = X, above = false }: { y: number; start: number; end: number; label: string; grow?: number; f?: string; x?: (h: number) => number; above?: boolean }) {
  if (grow <= 0) return null;
  const x0 = x(start), x1 = lerp(x(start), x(end), grow);
  return (
    <g>
      <rect x={x0} y={y - 13} width={Math.max(2, x1 - x0)} height={26} rx={4} fill={C.panel} stroke={f} strokeWidth={1.4} />
      <line x1={x0} y1={y - 18} x2={x0} y2={y + 18} stroke={f} strokeWidth={1.4} />
      {grow >= 1 && <line x1={x1} y1={y - 18} x2={x1} y2={y + 18} stroke={f} strokeWidth={1.4} />}
      <T x={x0 + (above ? 0 : 8)} y={above ? y - 24 : y + 5} s={13} f={f} o={easeOut(seg(grow, 0.5, 1))}>
        {label}
      </T>
    </g>
  );
}

/** A linearization point: a short tick inside an operation's bar. */
const Tick = ({ x, y, k = 1, f = C.focus }: { x: number; y: number; k?: number; f?: string }) =>
  k > 0 ? <rect x={x - 2} y={y - 13 * k} width={4} height={26 * k} rx={1} fill={f} /> : null;

/** A thread through linearization points, drawn on [from, to]. */
const Thread = ({ pts, t, from, to, f = C.focus }: { pts: Pt[]; t: number; from: number; to: number; f?: string }) => <Draw pts={pts} t={t} from={from} to={to} stroke={f} w={2.2} />;

const Node = ({ at: [x, y], label, f = C.crema, o = 1 }: { at: Pt; label: string; f?: string; o?: number }) => (
  <g opacity={o}>
    <rect x={x - 60} y={y - 20} width={120} height={40} rx={4} fill={C.panel} stroke={f} strokeWidth={1.5} />
    <T x={x} y={y + 5} s={14} a="middle" f={f}>
      {label}
    </T>
  </g>
);

const Crown = ({ x, y, o = 1 }: { x: number; y: number; o?: number }) => <path d={`M${x - 10} ${y} L${x - 10} ${y - 10} L${x - 4} ${y - 4} L${x} ${y - 12} L${x + 4} ${y - 4} L${x + 10} ${y - 10} L${x + 10} ${y} Z`} fill={C.focus} opacity={o} />;

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

// 1 · Three nodes; a partition cuts the leader off; the crown moves to a new leader, which completes write 7. A client
// still talking to the old leader reads afterwards and gets the old 9 back.
export function Hook({ t }: StepCtx) {
  const cut = easeOut(seg(t, 0.8, 1.3));
  const crown = easeInOut(seg(t, 1.4, 2.1));
  const OLD: Pt = [120, 70], N2: Pt = [320, 70], N3: Pt = [500, 70], CLIENT: Pt = [120, 230];
  return (
    <Svg label="the stock register is read from the leader; the leader is partitioned away, a new leader accepts and completes a write, and a client still talking to the old leader reads the old value afterwards" h={300}>
      <Node at={OLD} label="old leader" o={easeOut(seg(t, 0, 0.4))} />
      <Node at={N2} label="node B" o={easeOut(seg(t, 0.1, 0.5))} />
      <Node at={N3} label="node C" o={easeOut(seg(t, 0.2, 0.6))} />
      <Crown x={lerp(OLD[0], N2[0], crown)} y={OLD[1] - 24} o={easeOut(seg(t, 0.3, 0.6))} />
      <Draw pts={[[220, 20], [220, 150]]} t={t} from={0.8} to={1.3} stroke={C.badText} w={2} dash="6 5" pen={false} />
      <T x={228} y={150} s={13} f={C.badText} o={cut}>
        partition
      </T>
      <Decode text="write 7 done" t={t} at={2.3} x={320} y={126} s={14} a="middle" f={C.focus} w={600} />
      <Node at={CLIENT} label="client" o={easeOut(seg(t, 2.4, 2.8))} />
      <Arrow a={[110, 210]} b={[110, 92]} t={t} from={2.8} to={3.3} f={C.secondary} />
      <Arrow a={[132, 92]} b={[132, 210]} t={t} from={3.4} to={3.9} f={C.badText} />
      <T x={150} y={160} s={22} f={C.badText} w={700} o={easeOut(seg(t, 3.8, 4.1))} serif>
        9
      </T>
      <T x={250} y={236} s={13} f={C.secondary} o={easeOut(seg(t, 3.9, 4.3))}>
        read after the write: old value
      </T>
      <Reticle x={156} y={153} w={36} h={36} t={t} at={4.2} color={C.badText} />
    </Svg>
  );
}

const HOOK_W = { start: 1, end: 2 };
const HOOK_R = { start: 2.5, end: 3 };

// 2 · The hook as a history: write 7 on the new leader's lane, then the client's read returning 9, starting after the
// write responded. After the pick, both possible threads are tried and both turn red; no legal order.
export function PredictLinearizable({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const yW = 90, yR = 170;
  const wx = X(1.5), rx = X(2.75);
  return (
    <Svg label="is a system whose read after a completed write returns the old value linearizable?" h={300}>
      <Lane y={yW} name="new leader" k={easeOut(seg(t, 0, 0.4))} />
      <Lane y={yR} name="client" k={easeOut(seg(t, 0.1, 0.5))} />
      <Op y={yW} {...HOOK_W} label="write 7" above grow={easeOut(seg(t, 0.4, 1.0))} />
      <Op y={yR} {...HOOK_R} label="read 9" above grow={easeOut(seg(t, 1.0, 1.5))} />
      <line x1={X(2)} y1={50} x2={X(2)} y2={200} stroke={C.line} strokeDasharray="3 4" opacity={easeOut(seg(t, 1.5, 1.9))} />
      <T x={X(2)} y={44} s={13} a="middle" f={C.quiet} o={easeOut(seg(t, 1.5, 1.9))}>
        write done
      </T>
      {on && (
        <g>
          <Tick x={wx} y={yW} k={easeOut(seg(s, 0.1, 0.3))} />
          <Tick x={rx} y={yR} k={easeOut(seg(s, 0.1, 0.3))} />
          <Thread pts={[[wx, yW], [rx, yR]]} t={s} from={0.3} to={0.8} f={C.badText} />
          <T x={rx - 10} y={yR + 38} s={13} a="end" f={C.badText} o={easeOut(seg(s, 0.7, 1.0))}>
            must read 7
          </T>
          <Thread pts={[[rx, yR - 4], [X(1.2), yW + 4]]} t={s} from={1.0} to={1.5} f={C.badText} />
          <T x={X(0.2)} y={yW + 50} s={13} f={C.badText} o={easeOut(seg(s, 1.4, 1.7))}>
            backwards in time
          </T>
        </g>
      )}
      <T x={300} y={270} s={15} a="middle" f={on ? C.badText : C.secondary} w={on ? 600 : 500} o={on ? easeOut(seg(s, 1.7, 2.0)) : easeOut(seg(t, 1.8, 2.4))}>
        {on ? 'no legal order at all' : 'linearizable?'}
      </T>
      {on && <Reticle x={300} y={264} w={240} h={32} t={s} at={2.1} color={C.badText} />}
    </Svg>
  );
}

// 3 · Each operation's instant slides inside its own bar. A responds before B starts, so B's instant can never slide
// in front of A's; C overlaps A, so their instants may cross. The thread through them always runs forward.
export function RevealInstant({ t }: StepCtx) {
  const y1 = 70, y2 = 150, y3 = 230;
  const settle = easeInOut(seg(t, 2.8, 3.6));
  const wob = (ph: number) => 0.5 + 0.45 * Math.sin(t * 2.4 + ph);
  const a = lerp(lerp(0, 1, wob(0)), 0.5, settle);
  const b = lerp(lerp(1.2, 2.2, wob(1.3)), 1.7, settle);
  const c = lerp(lerp(0.6, 1.7, wob(2.4)), 0.9, settle);
  const k = easeOut(seg(t, 0.8, 1.1));
  return (
    <Svg label="each operation takes effect at one instant between its invocation and response, and if one operation's response comes before another's invocation, the first one's instant comes first" h={300}>
      <Lane y={y1} name="A" />
      <Lane y={y2} name="C" />
      <Lane y={y3} name="B" />
      <Op y={y1} start={0} end={1} label="op A" grow={easeOut(seg(t, 0.1, 0.5))} />
      <Op y={y2} start={0.6} end={1.7} label="op C" grow={easeOut(seg(t, 0.3, 0.7))} f={C.second} />
      <Op y={y3} start={1.2} end={2.2} label="op B" grow={easeOut(seg(t, 0.5, 0.9))} />
      <Tick x={X(a)} y={y1} k={k} />
      <Tick x={X(c)} y={y2} k={k} f={C.second} />
      <Tick x={X(b)} y={y3} k={k} />
      <line x1={X(1)} y1={y1 + 20} x2={X(1)} y2={y3 + 22} stroke={C.line} strokeDasharray="3 4" opacity={easeOut(seg(t, 1.6, 2.0))} />
      <T x={X(1) + 6} y={y3 + 40} s={13} f={C.secondary} o={easeOut(seg(t, 1.6, 2.0))}>
        A responds before B starts
      </T>
      {settle >= 1 && <Thread pts={[[X(a), y1], [X(c), y2], [X(b), y3]]} t={t} from={3.6} to={4.2} />}
      <T x={X(2.2) + 14} y={y3 + 5} s={13} f={C.focus} o={easeOut(seg(t, 4.0, 4.4))}>
        forward
      </T>
      <Reticle x={X(b)} y={y3} w={30} h={40} t={t} at={4.3} />
    </Svg>
  );
}

// 4 · Object X and object Y each pass on their own (a tick each); their strips slide together into one system that
// passes with no extra check. Below, a pending operation stays open while others complete straight past it.
export function RevealLocality({ t }: StepCtx) {
  const merge = easeInOut(seg(t, 1.4, 2.4));
  const pend = easeOut(seg(t, 2.6, 3.0));
  const Xs = (h: number) => 150 + h * 110;
  const check = (x: number, y: number, k: number) => <Draw pts={[[x - 8, y], [x - 2, y + 7], [x + 10, y - 8]]} t={k} from={0} to={1} stroke={C.focus} w={2.5} pen={false} />;
  return (
    <Svg label="if every object in a system is linearizable on its own, the whole system is; and a pending operation never has to block another" h={300}>
      <g>
        <Lane y={46} name="object X" />
        <Op y={46} start={0} end={1} label="w x" x={Xs} grow={easeOut(seg(t, 0.1, 0.5))} />
        <Op y={46} start={1.3} end={2.3} label="r x" x={Xs} grow={easeOut(seg(t, 0.3, 0.7))} />
        {check(560, 46, easeOut(seg(t, 0.8, 1.1)))}
      </g>
      <g transform={`translate(0 ${lerp(60, 0, merge).toFixed(1)})`}>
        <Lane y={86} name="object Y" />
        <Op y={86} start={0.5} end={1.6} label="w y" x={Xs} grow={easeOut(seg(t, 0.4, 0.8))} f={C.second} />
        {check(560, 86, easeOut(seg(t, 1.0, 1.3)))}
      </g>
      <T x={20} y={130} s={13} f={C.primary} o={easeOut(seg(t, 2.2, 2.5))}>
        whole system: passes, nothing re-checked
      </T>
      <line x1={20} y1={160} x2={580} y2={160} stroke={C.band} opacity={pend} />
      <Lane y={200} name="pending" k={pend} />
      <g opacity={pend}>
        <rect x={Xs(0.2)} y={187} width={lerp(0, 380, easeInOut(seg(t, 2.8, 4.2)))} height={26} rx={4} fill="none" stroke={C.secondary} strokeWidth={1.4} strokeDasharray="6 5" />
        <line x1={Xs(0.2)} y1={182} x2={Xs(0.2)} y2={218} stroke={C.secondary} strokeWidth={1.4} />
      </g>
      <Lane y={256} name="others" k={pend} />
      <Op y={256} start={0.6} end={1.4} label="done" x={Xs} grow={easeOut(seg(t, 3.0, 3.4))} />
      <Op y={256} start={1.8} end={2.8} label="done" x={Xs} grow={easeOut(seg(t, 3.4, 3.8))} />
      <Reticle x={Xs(1.7)} y={256} w={290} h={40} t={t} at={4.2} />
    </Svg>
  );
}

const LEGAL = [
  { lane: 'client A', y: 80, start: 0, end: 1, label: 'write 7' },
  { lane: 'client B', y: 150, start: 1.1, end: 2, label: 'read 7' },
  { lane: 'client C', y: 220, start: 2.1, end: 3, label: 'write 9' },
];

// 5 · The legal history; the checker's candidate orderings flick past, and the first one it lands on works: ticks drop
// into each bar and a white thread runs forward through them.
export function RevealCheckerWorks({ t }: StepCtx) {
  const k = easeOut(seg(t, 1.4, 1.7));
  const pts: Pt[] = LEGAL.map((o) => [X((o.start + o.end) / 2), o.y]);
  return (
    <Svg label="a checker searching every candidate ordering for one that obeys the register and respects real time finds a linearization immediately for a correctly ordered history" h={300}>
      {LEGAL.map((o, i) => (
        <g key={o.lane}>
          <Lane y={o.y} name={o.lane} k={easeOut(seg(t, i * 0.1, 0.4 + i * 0.1))} />
          <Op y={o.y} start={o.start} end={o.end} label={o.label} grow={easeOut(seg(t, 0.2 + i * 0.3, 0.6 + i * 0.3))} />
          <Tick x={pts[i][0] + 34} y={o.y} k={k} />
        </g>
      ))}
      <T x={20} y={30} s={13} f={C.secondary} o={easeOut(seg(t, 1.0, 1.3))}>
        trying orderings
      </T>
      <Decode text="write, read, write" t={t} at={1.3} x={580} y={30} s={14} a="end" f={C.focus} w={600} />
      <Thread pts={pts.map(([x, y]) => [x + 34, y] as Pt)} t={t} from={1.8} to={2.8} />
      <Decode text="found one" t={t} at={3.0} x={300} y={280} s={16} a="middle" f={C.focus} w={600} />
      <Reticle x={300} y={274} w={150} h={34} t={t} at={4.0} />
    </Svg>
  );
}

// 6 · The hook's history fed to the same checker. Ordering one, write then read: the read would have to return 7 —
// red. Ordering two, read then write: the thread runs backwards in time — red. Nothing left: no linearization.
export function RevealCheckerFails({ t }: StepCtx) {
  const yW = 90, yR = 170;
  const wx = X(1.5), rx = X(2.75);
  return (
    <Svg label="fed the hook's history, the same checker finds that every ordering either breaks the register's rules or breaks real time: no linearization exists" h={300}>
      <Lane y={yW} name="new leader" />
      <Lane y={yR} name="client" />
      <Op y={yW} {...HOOK_W} label="write 7" above grow={easeOut(seg(t, 0, 0.4))} />
      <Op y={yR} {...HOOK_R} label="read 9" above grow={easeOut(seg(t, 0.2, 0.6))} />
      <T x={20} y={30} s={13} f={C.secondary} o={easeOut(seg(t, 0.6, 1.0))}>
        ordering one
      </T>
      <Tick x={wx} y={yW} k={easeOut(seg(t, 0.8, 1.0))} />
      <Tick x={rx} y={yR} k={easeOut(seg(t, 0.8, 1.0))} />
      <Thread pts={[[wx, yW], [rx, yR]]} t={t} from={1.0} to={1.5} f={C.badText} />
      <T x={rx - 60} y={yR + 42} s={13} a="end" f={C.badText} o={easeOut(seg(t, 1.4, 1.8))}>
        breaks the register
      </T>
      <T x={300} y={30} s={13} f={C.secondary} o={easeOut(seg(t, 2.0, 2.4))}>
        ordering two
      </T>
      <Thread pts={[[rx, yR - 4], [X(1.2), yW + 4]]} t={t} from={2.2} to={2.8} f={C.badText} />
      <T x={580} y={yW - 34} s={13} a="end" f={C.badText} o={easeOut(seg(t, 2.7, 3.1))}>
        breaks real time
      </T>
      <Decode text="no linearization" t={t} at={3.4} x={300} y={278} s={16} a="middle" f={C.badText} w={600} />
      <Reticle x={300} y={272} w={200} h={34} t={t} at={4.1} color={C.badText} />
    </Svg>
  );
}

// 7 · The fix: the old leader must hear from a quorum before it answers; behind the partition it can't, so the read
// goes where a quorum is and returns 7. Then the cost: synchronized clocks put one round trip d on one operation;
// uncertain clocks put about u on every operation.
export function RevealCost({ t }: StepCtx) {
  const OLD: Pt = [110, 56], N2: Pt = [300, 56], N3: Pt = [480, 56];
  const fail = easeOut(seg(t, 1.0, 1.3));
  const cost = easeOut(seg(t, 2.4, 2.8));
  const B = 150, D = 220;
  return (
    <Svg label="making the old leader confirm a quorum before any read removes the stale value, but it costs a round trip with synchronized clocks, and roughly the clock uncertainty on every operation once clocks are uncertain" h={300}>
      <Node at={OLD} label="old leader" />
      <Node at={N2} label="new leader" />
      <Node at={N3} label="node C" />
      <line x1={205} y1={20} x2={205} y2={100} stroke={C.badText} strokeWidth={2} strokeDasharray="6 5" />
      <Arrow a={[170, 56]} b={[200, 56]} t={t} from={0.3} to={0.8} f={C.secondary} />
      <T x={110} y={104} s={13} a="middle" f={C.badText} o={fail}>
        no quorum
      </T>
      <Decode text="quorum: read 7" t={t} at={1.6} x={390} y={110} s={14} a="middle" f={C.focus} w={600} />
      <line x1={20} y1={136} x2={580} y2={136} stroke={C.band} opacity={cost} />
      <T x={20} y={176} s={13} f={C.primary} o={cost}>
        clocks in sync
      </T>
      <rect x={B} y={186} width={D * easeInOut(seg(t, 2.6, 3.2))} height={14} rx={2} fill={C.focus} />
      <circle cx={B} cy={216} r={5} fill={C.focus} opacity={easeOut(seg(t, 2.6, 2.9))} />
      <T x={B + D + 12} y={198} s={13} f={C.focus} o={easeOut(seg(t, 3.0, 3.3))}>
        one op pays d
      </T>
      <T x={B + 12} y={221} s={13} f={C.secondary} o={easeOut(seg(t, 2.8, 3.1))}>
        the other free
      </T>
      <T x={20} y={256} s={13} f={C.primary} o={easeOut(seg(t, 3.2, 3.5))}>
        clocks uncertain
      </T>
      {[0, 1, 2].map((i) => (
        <rect key={i} x={B + 30 + i * 110} y={244} width={D * 0.3 * easeInOut(seg(t, 3.4 + i * 0.15, 3.8 + i * 0.15))} height={14} rx={2} fill={C.second} />
      ))}
      <T x={B + 30} y={286} s={13} f={C.second} o={easeOut(seg(t, 3.8, 4.1))}>
        every op pays about u
      </T>
      <Reticle x={B + 168} y={251} w={320} h={30} t={t} at={4.2} color={C.second} />
    </Svg>
  );
}

// 8 · The four pieces, each replaying its move: an instant sliding into its bar, two strips joining, the checker's
// empty result, and the cost bar.
export function Recap({ t }: StepCtx) {
  const at = (i: number) => 0.2 + i * 0.9;
  const labels = ['an instant inside', 'checked per object', 'nowhere legal', 'never free'];
  const cells: Pt[] = [[0, 0], [300, 0], [0, 150], [300, 150]];
  const sx = lerp(60, 150, easeInOut(seg(t, at(0), at(0) + 0.6)));
  return (
    <Svg label="an instant for each operation, real time respected, composable one object at a time; a stale leader read has no legal order, a quorum-confirmed read does; and neither is free" h={300}>
      {labels.map((l, i) => (
        <T key={l} x={cells[i][0] + 150} y={cells[i][1] + 136} s={13} a="middle" f={i === 2 ? C.badText : C.primary} o={easeOut(seg(t, at(i), at(i) + 0.4))}>
          {l}
        </T>
      ))}
      <rect x={50} y={52} width={200} height={26} rx={4} fill={C.panel} stroke={C.focus} strokeWidth={1.4} opacity={easeOut(seg(t, at(0), at(0) + 0.3))} />
      <Tick x={sx} y={65} k={easeOut(seg(t, at(0), at(0) + 0.3))} />
      <rect x={340} y={lerp(30, 46, easeInOut(seg(t, at(1) + 0.2, at(1) + 0.7)))} width={110} height={22} rx={4} fill={C.panel} stroke={C.focus} strokeWidth={1.4} opacity={easeOut(seg(t, at(1), at(1) + 0.3))} />
      <rect x={440} y={lerp(100, 74, easeInOut(seg(t, at(1) + 0.2, at(1) + 0.7)))} width={110} height={22} rx={4} fill={C.panel} stroke={C.second} strokeWidth={1.4} opacity={easeOut(seg(t, at(1), at(1) + 0.3))} />
      <Draw pts={[[80, 240], [200, 190], [140, 250]]} t={t} from={at(2)} to={at(2) + 0.6} stroke={C.badText} w={2} />
      <rect x={340} y={204} width={lerp(0, 200, easeInOut(seg(t, at(3), at(3) + 0.6)))} height={14} rx={2} fill={C.focus} />
      <line x1={300} y1={14} x2={300} y2={290} stroke={C.band} />
      <line x1={14} y1={150} x2={586} y2={150} stroke={C.band} />
    </Svg>
  );
}

// 9 · A long, clean uptime bar: never deposed. After the pick, the future part of the timeline opens on a partition
// that hasn't happened yet, and inside it the hook's history replays with its red thread.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const run = easeInOut(seg(t, 0.2, 1.6));
  return (
    <Svg label="a store serves every read from one leader with no quorum check, and in production that leader has never been deposed — does that make its reads linearizable?" h={300}>
      <T x={20} y={50} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.4))}>
        so far
      </T>
      <rect x={110} y={38} width={280 * run} height={16} rx={2} fill={C.secondary} />
      <T x={110} y={84} s={13} f={C.primary} o={easeOut(seg(t, 1.2, 1.6))}>
        never deposed
      </T>
      <rect x={390} y={38} width={190} height={16} rx={2} fill="none" stroke={C.line} strokeDasharray="4 4" opacity={easeOut(seg(t, 1.4, 1.8))} />
      <T x={485} y={84} s={13} a="middle" f={C.quiet} o={easeOut(seg(t, 1.4, 1.8))}>
        every future
      </T>
      <T x={300} y={280} s={15} a="middle" f={on ? C.badText : C.secondary} o={on ? easeOut(seg(s, 1.6, 1.9)) : easeOut(seg(t, 1.8, 2.4))}>
        {on ? 'the hook, waiting to happen' : 'linearizable, then?'}
      </T>
      {on && (
        <g>
          <rect x={390} y={38} width={190} height={16} rx={2} fill={C.bad} opacity={easeOut(seg(s, 0.1, 0.4))} />
          <Draw pts={[[485, 58], [300, 120]]} t={s} from={0.3} to={0.6} stroke={C.badText} w={1.5} pen={false} />
          <Op y={140} start={1} end={2} label="write 7" grow={easeOut(seg(s, 0.5, 0.9))} />
          <Op y={210} start={2.5} end={3} label="read 9" grow={easeOut(seg(s, 0.8, 1.1))} />
          <Thread pts={[[X(1.5), 140], [X(2.75), 210]]} t={s} from={1.1} to={1.5} f={C.badText} />
        </g>
      )}
      {on && <Reticle x={485} y={46} w={200} h={30} t={s} at={2.0} color={C.badText} />}
    </Svg>
  );
}
