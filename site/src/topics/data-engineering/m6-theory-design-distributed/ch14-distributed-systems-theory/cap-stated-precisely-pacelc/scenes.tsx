import { useEffect, useState } from 'react';
import { C, Decode, Draw, Reticle, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// The chapter's space-time picture with a partition drawn as a red wall between two groups (CHAPTER.md, topic 8): the
// shop's three replicas, one isolated on the left, two together on the right. examples.py's register: the last unit of
// stock, both sides selling it; the majority's write the isolated replica never receives; a linearizable design
// refusing at the isolated replica and a causal one answering what does not depend on the other side. PACELC rows
// are PACELC_CLASSIFICATIONS; Spanner's technically-CP, effectively-CA is the last function there.

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

const A: Pt = [110, 96], B: Pt = [420, 66], Cc: Pt = [510, 146];
const WALL = 270;

/** A replica: a box with its name and its view of the stock. */
function Replica({ at: [x, y], name, stock, k = 1, f = C.focus }: { at: Pt; name: string; stock: string; k?: number; f?: string }) {
  return (
    <g opacity={k}>
      <rect x={x - 55} y={y - 26} width={110} height={52} rx={6} fill={C.panel} stroke={f} strokeWidth={1.5} />
      <T x={x} y={y - 5} s={13} a="middle" f={C.secondary}>
        {name}
      </T>
      <T x={x} y={y + 16} s={13} a="middle" f={f}>
        {stock}
      </T>
    </g>
  );
}

/** The partition: a red dashed wall that drops from the top as k runs 0..1. */
const Wall = ({ k, x = WALL, y0 = 20, y1 = 200 }: { k: number; x?: number; y0?: number; y1?: number }) =>
  k > 0 ? <line x1={x} y1={y0} x2={x} y2={lerp(y0, y1, k)} stroke={C.badText} strokeWidth={2.4} strokeDasharray="8 6" /> : null;

function Arrow({ a, b, t, from, to, f = C.secondary }: { a: Pt; b: Pt; t: number; from: number; to: number; f?: string }) {
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

function Pill({ at: [x, y], label, k = 1, w = 110, f = C.focus, solid = true, dashed = false }: { at: Pt; label: string; k?: number; w?: number; f?: string; solid?: boolean; dashed?: boolean }) {
  if (k <= 0) return null;
  return (
    <g opacity={Math.min(1, k)}>
      <rect x={x - w / 2} y={y - 13} width={w} height={26} rx={13} fill={solid ? f : 'none'} stroke={f} strokeWidth={1.4} strokeDasharray={dashed ? '4 4' : undefined} />
      <T x={x} y={y + 5} s={13} a="middle" f={solid ? C.void : f} w={solid ? 600 : 400}>
        {label}
      </T>
    </g>
  );
}

const Cross = ({ at: [x, y], o }: { at: Pt; o: number }) => (o > 0 ? <path d={`M${x - 8} ${y - 8} l16 16 M${x + 8} ${y - 8} l-16 16`} stroke={C.badText} strokeWidth={2.4} opacity={o} /> : null);

/** The three links between replicas; the two that cross the wall turn red and dashed once `cut` passes 0.5. */
function Links({ k, cut }: { k: number; cut: number }) {
  const red = cut > 0.5;
  const line = (a: Pt, b: Pt, crosses: boolean) => (
    <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={crosses && red ? C.badText : C.line} strokeWidth={1.2} strokeDasharray={crosses && red ? '3 5' : undefined} opacity={k * (crosses && red ? 0.7 : 1)} />
  );
  return (
    <g>
      {line(A, B, true)}
      {line(A, Cc, true)}
      {line(B, Cc, false)}
    </g>
  );
}

// 1 · Three replicas, all linked, stock one each. The wall drops between the left replica and the other two; the links
// across it go red. A customer buys on each side; each side's stock drops to zero and each customer gets a confirmed
// pill. Only the bottom line, in red, says what neither customer can see.
export function Hook({ t }: StepCtx) {
  const wall = easeInOut(seg(t, 0.6, 1.0));
  const soldA = t > 1.7, soldB = t > 2.3;
  return (
    <Svg label='a partition isolates one replica from the other two; a customer on each side buys the same last unit of stock, and both get "order confirmed"' h={300}>
      <Links k={easeOut(seg(t, 0.1, 0.5))} cut={wall} />
      <Replica at={A} name="replica A" stock={soldA ? 'stock 0' : 'stock 1'} k={easeOut(seg(t, 0, 0.4))} />
      <Replica at={B} name="replica B" stock={soldB ? 'stock 0' : 'stock 1'} k={easeOut(seg(t, 0.1, 0.5))} />
      <Replica at={Cc} name="replica C" stock={soldB ? 'stock 0' : 'stock 1'} k={easeOut(seg(t, 0.2, 0.6))} />
      <Wall k={wall} />
      <T x={WALL + 8} y={214} s={13} f={C.badText} o={easeOut(seg(t, 0.9, 1.2))}>
        partition
      </T>
      <Pill at={[110, 214]} label="customer one" w={120} f={C.secondary} solid={false} k={easeOut(seg(t, 1.0, 1.3))} />
      <Arrow a={[110, 200]} b={[110, 124]} t={t} from={1.2} to={1.6} />
      <Pill at={[110, 250]} label="confirmed" k={easeOutBack(seg(t, 1.8, 2.1))} />
      <Pill at={[470, 214]} label="customer two" w={120} f={C.secondary} solid={false} k={easeOut(seg(t, 1.5, 1.8))} />
      <Arrow a={[460, 200]} b={[430, 94]} t={t} from={1.8} to={2.2} />
      <Pill at={[470, 250]} label="confirmed" k={easeOutBack(seg(t, 2.4, 2.7))} />
      <Decode text="one unit, two confirmations" t={t} at={3.2} x={290} y={290} s={14} a="middle" f={C.badText} w={600} />
    </Svg>
  );
}

// 2 · The hook's end state, frozen, and the question. After the pick: "kept: available" decodes, "gave up:
// consistency" follows in red, and under replica A a dashed "refuse" appears where the confirmation is: the one road
// not taken.
export function PredictChoice({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  return (
    <Svg label="which of CAP's three words did the overselling system keep, which did it give up, and what could it have chosen instead of overselling?" h={300}>
      <Links k={1} cut={1} />
      <Replica at={A} name="replica A" stock="stock 0" />
      <Replica at={B} name="replica B" stock="stock 0" />
      <Replica at={Cc} name="replica C" stock="stock 0" />
      <Wall k={easeInOut(seg(t, 0, 0.4))} />
      <Pill at={[110, 180]} label="confirmed" k={easeOut(seg(t, 0.3, 0.6))} />
      <Pill at={[470, 220]} label="confirmed" k={easeOut(seg(t, 0.4, 0.7))} />
      {!on && (
        <T x={290} y={280} s={15} a="middle" f={C.secondary} o={easeOut(seg(t, 0.8, 1.3))}>
          kept which word?
        </T>
      )}
      {on && (
        <g>
          <Decode text="kept: available" t={s} at={0.2} x={290} y={258} s={15} a="middle" f={C.focus} w={600} />
          <Decode text="gave up: consistent" t={s} at={0.8} x={290} y={286} s={15} a="middle" f={C.badText} w={600} />
          <Draw pts={[[110, 194], [110, 222]]} t={s} from={1.4} to={1.7} stroke={C.secondary} w={1.4} pen={false} />
          <Pill at={[110, 236]} label="or refuse" w={100} f={C.secondary} solid={false} dashed k={easeOutBack(seg(s, 1.6, 2.0))} />
          <Reticle x={110} y={236} w={116} h={34} t={s} at={2.2} color={C.secondary} />
        </g>
      )}
    </Svg>
  );
}

// 3 · Three cards, each drawing its own condition: a bar whose tick slides to one instant (atomic); a request that
// always comes back (available); messages vanishing in flight (partition tolerant). Three lamps under them try to stay
// lit together; whenever the third lights, another goes dark.
export function RevealTheorem({ t }: StepCtx) {
  const cx = [100, 300, 500];
  const lit = (i: number) => {
    if (t < 2.4 + i * 0.3) return false;
    if (t < 3.4) return true;
    return Math.floor((t - 3.4) * 2) % 3 !== i;
  };
  const msg = (i: number) => {
    const p = ((t * 0.9 + i * 0.33) % 1);
    return p;
  };
  return (
    <Svg label="the theorem in its own three conditions: atomic (linearizable), available (every request to a non-failing node eventually gets a response), partition tolerant (arbitrary message loss) — not all three can hold" h={300}>
      {['atomic', 'available', 'partition tolerant'].map((n, i) => (
        <g key={n} opacity={easeOut(seg(t, 0.1 + i * 0.4, 0.5 + i * 0.4))}>
          <rect x={cx[i] - 88} y={30} width={176} height={150} rx={8} fill="none" stroke={C.line} />
          <T x={cx[i]} y={56} s={14} a="middle" f={C.primary} w={600}>
            {n}
          </T>
        </g>
      ))}
      <g opacity={easeOut(seg(t, 0.2, 0.6))}>
        <rect x={50} y={92} width={100} height={22} rx={4} fill={C.panel} stroke={C.focus} strokeWidth={1.4} />
        <rect x={lerp(54, 98, easeInOut(seg(t, 0.4, 1.2)))} y={89} width={4} height={28} rx={1} fill={C.focus} />
        <T x={100} y={154} s={13} a="middle" f={C.secondary}>
          one instant
        </T>
      </g>
      <g opacity={easeOut(seg(t, 0.6, 1.0))}>
        <circle cx={340} cy={103} r={12} fill={C.panel} stroke={C.focus} strokeWidth={1.4} />
        <Arrow a={[244, 96]} b={[324, 96]} t={t} from={0.8} to={1.2} />
        <Arrow a={[324, 112]} b={[244, 112]} t={t} from={1.3} to={1.7} f={C.focus} />
        <T x={300} y={154} s={13} a="middle" f={C.secondary}>
          always answers
        </T>
      </g>
      <g opacity={easeOut(seg(t, 1.0, 1.4))}>
        <circle cx={440} cy={103} r={9} fill="none" stroke={C.focus} strokeWidth={1.4} />
        <circle cx={560} cy={103} r={9} fill="none" stroke={C.focus} strokeWidth={1.4} />
        {[0, 1, 2].map((i) => {
          const p = msg(i);
          const lost = i === 1 && p > 0.5;
          return lost ? (
            <Cross key={i} at={[500, 103]} o={0.8} />
          ) : (
            <circle key={i} cx={lerp(452, 548, p)} cy={103} r={4} fill={C.focus} />
          );
        })}
        <T x={500} y={154} s={13} a="middle" f={C.secondary}>
          loses messages
        </T>
      </g>
      {cx.map((x, i) => (
        <circle key={x} cx={x} cy={214} r={11} fill={lit(i) ? C.focus : 'none'} stroke={lit(i) ? C.focus : C.badText} strokeWidth={1.8} opacity={easeOut(seg(t, 2.2, 2.4))} />
      ))}
      <Decode text="not all three at once" t={t} at={3.6} x={300} y={270} s={16} a="middle" f={C.focus} w={600} />
      <Reticle x={300} y={264} w={250} h={34} t={t} at={4.2} />
    </Svg>
  );
}

// 4 · The proof. The majority takes a write and passes it between themselves; the copy bound for replica A dies at
// the wall. Under A, two worlds side by side, one where B wrote and one where nothing was written: A's own state reads
// the same in both. A read arrives; its only two exits are "answer, maybe stale" and "refuse".
export function RevealProof({ t }: StepCtx) {
  const wrote = t > 0.9;
  return (
    <Svg label="splitting the chapter's three replicas into one isolated, two together: the isolated replica's state is identical whether the majority committed a write or nothing happened at all" h={300}>
      <Links k={1} cut={1} />
      <Replica at={A} name="replica A" stock="stock 1" />
      <Replica at={B} name="replica B" stock={wrote ? 'stock 0' : 'stock 1'} />
      <Replica at={Cc} name="replica C" stock={t > 1.3 ? 'stock 0' : 'stock 1'} />
      <Wall k={1} />
      <Arrow a={[560, 26]} b={[470, 52]} t={t} from={0.3} to={0.8} f={C.focus} />
      <T x={580} y={20} s={13} a="end" f={C.focus} o={easeOut(seg(t, 0.2, 0.5))}>
        write
      </T>
      <Arrow a={[440, 94]} b={[490, 120]} t={t} from={0.9} to={1.3} f={C.focus} />
      <Draw pts={[[366, 74], [WALL + 4, 82]]} t={t} from={1.3} to={1.7} stroke={C.focus} w={1.6} />
      <Cross at={[WALL, 82]} o={easeOut(seg(t, 1.7, 1.9))} />
      <g opacity={easeOut(seg(t, 2.0, 2.4))}>
        <rect x={20} y={142} width={110} height={62} rx={6} fill="none" stroke={C.line} />
        <T x={75} y={164} s={13} a="middle" f={C.secondary}>
          B wrote
        </T>
        <T x={75} y={190} s={13} a="middle" f={C.focus}>
          A: stock 1
        </T>
      </g>
      <g opacity={easeOut(seg(t, 2.2, 2.6))}>
        <rect x={150} y={142} width={110} height={62} rx={6} fill="none" stroke={C.line} />
        <T x={205} y={164} s={13} a="middle" f={C.secondary}>
          no write
        </T>
        <T x={205} y={190} s={13} a="middle" f={C.focus}>
          A: stock 1
        </T>
      </g>
      <g opacity={easeOut(seg(t, 2.6, 2.9))}>
        <line x1={133} y1={180} x2={147} y2={180} stroke={C.focus} strokeWidth={2} />
        <line x1={133} y1={187} x2={147} y2={187} stroke={C.focus} strokeWidth={2} />
      </g>
      <Reticle x={140} y={173} w={258} h={78} t={t} at={2.9} />
      <Draw pts={[[140, 206], [100, 238]]} t={t} from={3.3} to={3.6} stroke={C.secondary} w={1.4} pen={false} />
      <Draw pts={[[140, 206], [240, 238]]} t={t} from={3.3} to={3.6} stroke={C.secondary} w={1.4} pen={false} />
      <Pill at={[100, 256]} label="answer, maybe stale" w={170} f={C.secondary} solid={false} k={easeOutBack(seg(t, 3.5, 3.9))} />
      <Pill at={[245, 256]} label="refuse" w={80} f={C.secondary} solid={false} k={easeOutBack(seg(t, 3.7, 4.1))} />
      <T x={450} y={256} s={13} a="middle" f={C.quiet} o={easeOut(seg(t, 3.9, 4.3))}>
        no third exit
      </T>
    </Svg>
  );
}

// 5 · Top: the partition arrives as an event on the network lane, no hand on it. Middle: requests reach replica A
// one by one and each gets its own decision chip, answer or refuse. Bottom: a system-wide "AP" stamp lands and is
// struck through; the choice was per request.
export function RevealMisreading({ t }: StepCtx) {
  const REQ = [
    { x: 230, n: 'read', d: 'answer' },
    { x: 360, n: 'write', d: 'refuse' },
    { x: 490, n: 'read', d: 'answer' },
  ];
  const stamp = easeOutBack(seg(t, 3.0, 3.3));
  return (
    <Svg label='"pick two" misreads the theorem: a partition happens or not, it is not chosen; the real choice, consistency versus availability, is made per operation during a partition, not declared once as a system-wide label' h={300}>
      <T x={20} y={34} s={13} f={C.secondary}>
        network
      </T>
      <line x1={150} y1={29} x2={570} y2={29} stroke={C.band} />
      <rect x={170} y={23} width={380 * easeInOut(seg(t, 0.2, 0.8))} height={12} rx={2} fill={C.bad} />
      <T x={170} y={58} s={13} f={C.badText} o={easeOut(seg(t, 0.6, 1.0))}>
        partition: an event, not a choice
      </T>
      <T x={20} y={114} s={13} f={C.secondary} o={easeOut(seg(t, 0.8, 1.1))}>
        replica A
      </T>
      <line x1={150} y1={109} x2={570} y2={109} stroke={C.band} opacity={easeOut(seg(t, 0.8, 1.1))} />
      {REQ.map((r, i) => {
        const f0 = 1.1 + i * 0.5;
        const ok = r.d === 'answer';
        return (
          <g key={i}>
            <Arrow a={[r.x, 74]} b={[r.x, 101]} t={t} from={f0} to={f0 + 0.25} />
            <circle cx={r.x} cy={109} r={5} fill={C.focus} opacity={easeOut(seg(t, f0 + 0.25, f0 + 0.35))} />
            <T x={r.x} y={140} s={13} a="middle" f={C.secondary} o={easeOut(seg(t, f0 + 0.2, f0 + 0.4))}>
              {r.n}
            </T>
            <Pill at={[r.x, 172]} label={r.d} w={84} f={ok ? C.focus : C.secondary} solid={ok} dashed={!ok} k={easeOutBack(seg(t, f0 + 0.35, f0 + 0.65))} />
          </g>
        );
      })}
      <g opacity={Math.min(1, stamp)} transform={`translate(300 226) scale(${(0.6 + 0.4 * Math.min(1, stamp)).toFixed(3)})`}>
        <rect x={-70} y={-16} width={140} height={32} rx={4} fill="none" stroke={C.primary} strokeWidth={1.8} />
        <T x={0} y={5} s={14} a="middle" f={C.primary} w={600}>
          system: AP
        </T>
      </g>
      <Draw pts={[[226, 240], [374, 212]]} t={t} from={3.4} to={3.7} stroke={C.badText} w={2.4} pen={false} />
      <Decode text="decided per request" t={t} at={3.8} x={300} y={284} s={15} a="middle" f={C.focus} w={600} />
    </Svg>
  );
}

const PAC = [
  { n: 'Dynamo family', p: 0, e: 0, q: 'PA/EL' },
  { n: 'fully ACID', p: 1, e: 1, q: 'PC/EC' },
  { n: 'PNUTS', p: 1, e: 0, q: 'PC/EL' },
];

// 6 · PACELC as a tree: "partition?" branches to "A or C" and "else: L or C"; the else branch lights. Under it a write
// replicates out and back while a timer bar fills: the latency cost. Three systems then pick their path through both
// branches, a filled box for each choice, their quadrant name at the end.
export function RevealPacelc({ t }: StepCtx) {
  const elseLit = t > 1.0;
  const rowY = (i: number) => 200 + i * 42;
  const box = (x: number, y: number, label: string, on: boolean, k: number) => (
    <g opacity={k}>
      <rect x={x - 18} y={y - 14} width={36} height={28} rx={4} fill={on ? C.focus : 'none'} stroke={on ? C.focus : C.line} />
      <T x={x} y={y + 5} s={13} a="middle" f={on ? C.void : C.quiet} w={on ? 600 : 400}>
        {label}
      </T>
    </g>
  );
  return (
    <Svg label="PACELC's else-branch: with no partition, a system still chooses between latency and consistency; Dynamo-family systems are PA/EL, ACID systems PC/EC, PNUTS splits the two as PC/EL" h={330}>
      <T x={300} y={26} s={14} a="middle" f={C.primary} o={easeOut(seg(t, 0, 0.3))}>
        partition?
      </T>
      <Draw pts={[[280, 34], [200, 70]]} t={t} from={0.2} to={0.5} stroke={C.line} w={1.4} pen={false} />
      <Draw pts={[[320, 34], [420, 70]]} t={t} from={0.3} to={0.6} stroke={elseLit ? C.focus : C.line} w={elseLit ? 2.2 : 1.4} pen={false} />
      <T x={200} y={90} s={13} a="middle" f={elseLit ? C.quiet : C.primary} o={easeOut(seg(t, 0.4, 0.7))}>
        yes: A or C
      </T>
      <T x={430} y={90} s={13} a="middle" f={elseLit ? C.focus : C.primary} w={elseLit ? 600 : 400} o={easeOut(seg(t, 0.5, 0.8))}>
        else: L or C
      </T>
      <Reticle x={430} y={85} w={130} h={30} t={t} at={1.0} />
      <g opacity={easeOut(seg(t, 1.1, 1.3))}>
        <circle cx={380} cy={124} r={6} fill="none" stroke={C.focus} strokeWidth={1.4} />
        <circle cx={500} cy={124} r={6} fill="none" stroke={C.focus} strokeWidth={1.4} />
      </g>
      <Arrow a={[388, 120]} b={[492, 120]} t={t} from={1.2} to={1.5} f={C.focus} />
      <Arrow a={[492, 130]} b={[388, 130]} t={t} from={1.5} to={1.8} f={C.focus} />
      <rect x={380} y={144} width={120 * easeInOut(seg(t, 1.2, 1.8))} height={6} rx={2} fill={C.second} />
      <T x={360} y={150} s={13} a="end" f={C.second} o={easeOut(seg(t, 1.5, 1.8))}>
        replicating costs time
      </T>
      {PAC.map((r, i) => {
        const k = easeOut(seg(t, 1.9 + i * 0.6, 2.2 + i * 0.6));
        const pick = t > 2.2 + i * 0.6;
        const y = rowY(i);
        return (
          <g key={r.n}>
            <T x={20} y={y + 5} s={13} f={C.primary} o={k}>
              {r.n}
            </T>
            {box(180, y, 'A', pick && r.p === 0, k)}
            {box(226, y, 'C', pick && r.p === 1, k)}
            {box(410, y, 'L', pick && r.e === 0, k)}
            {box(456, y, 'C', pick && r.e === 1, k)}
            <T x={575} y={y + 5} s={13} a="end" f={C.focus} o={easeOut(seg(t, 2.3 + i * 0.6, 2.5 + i * 0.6))}>
              {r.q}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

// 7 · Two networks drawn as timelines, swept by a playhead: the public one riddled with red partition slivers, the
// private one with a single sliver. Spanner on the private lane refuses inside that sliver (technically CP); the rest
// of its lane glows as "effectively CA".
export function RevealSpanner({ t }: StepCtx) {
  const sweep = easeInOut(seg(t, 0.2, 2.2));
  const head = lerp(170, 570, sweep);
  const PUB = [200, 236, 262, 300, 352, 388, 436, 470, 512, 548];
  const PRIV = 404;
  return (
    <Svg label='Spanner is "technically" a CP system, "effectively" treated as CA because partitions are rare on a private network — a statement about probability, not an exception to the theorem' h={300}>
      <T x={155} y={75} s={13} a="end" f={C.secondary}>
        public network
      </T>
      <T x={155} y={165} s={13} a="end" f={C.secondary}>
        private network
      </T>
      <line x1={170} y1={70} x2={570} y2={70} stroke={C.band} />
      <line x1={170} y1={160} x2={570} y2={160} stroke={C.band} />
      {PUB.map((x) => (x < head ? <rect key={x} x={x} y={58} width={6} height={24} rx={1} fill={C.bad} /> : null))}
      {PRIV < head && <rect x={PRIV} y={148} width={6} height={24} rx={1} fill={C.bad} />}
      <rect x={170} y={156} width={Math.max(0, PRIV - 172) * easeInOut(seg(t, 3.0, 3.5))} height={8} rx={2} fill={C.focus} opacity={0.5} />
      <rect x={PRIV + 8} y={156} width={(570 - PRIV - 8) * easeInOut(seg(t, 3.3, 3.8))} height={8} rx={2} fill={C.focus} opacity={0.5} />
      {sweep < 1 && sweep > 0 && <line x1={head} y1={40} x2={head} y2={190} stroke={C.focus} strokeWidth={1.4} />}
      <T x={170} y={110} s={13} f={C.quiet} o={easeOut(seg(t, 1.8, 2.2))}>
        partitions, often
      </T>
      <T x={PRIV + 3} y={204} s={13} a="middle" f={C.badText} o={easeOut(seg(t, 2.4, 2.7))}>
        refuses here: CP
      </T>
      <Reticle x={PRIV + 3} y={160} w={40} h={40} t={t} at={2.4} color={C.badText} />
      <T x={290} y={136} s={13} a="middle" f={C.focus} o={easeOut(seg(t, 3.3, 3.7))}>
        effectively CA
      </T>
      <Decode text="rare, not never" t={t} at={3.8} x={300} y={268} s={16} a="middle" f={C.focus} w={600} />
    </Svg>
  );
}

// 8 · Four panels build in turn: three lamps, one always dark; replica A behind its wall with a question mark; the
// PACELC tree with its else branch lit; the private network's one red sliver.
export function Recap({ t }: StepCtx) {
  const P = [[20, 20], [310, 20], [20, 158], [310, 158]] as const;
  const k = (i: number) => easeOut(seg(t, 0.2 + i * 0.7, 0.6 + i * 0.7));
  const box = (i: number, label: string) => (
    <g opacity={k(i)}>
      <rect x={P[i][0]} y={P[i][1]} width={270} height={124} rx={6} fill="none" stroke={C.line} />
      <T x={P[i][0] + 135} y={P[i][1] + 112} s={13} a="middle" f={C.primary}>
        {label}
      </T>
    </g>
  );
  return (
    <Svg label="atomic, available, partition tolerant cannot all hold; the proof is one replica unable to distinguish two histories; CP/AP is per-operation; PACELC adds the no-partition trade; Spanner's effectively-CA is probability, not exemption" h={300}>
      {box(0, 'not all three')}
      <g opacity={k(0)}>
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={P[0][0] + 85 + i * 50} cy={P[0][1] + 50} r={11} fill={i === 2 && t > 0.9 ? 'none' : C.focus} stroke={i === 2 && t > 0.9 ? C.badText : C.focus} strokeWidth={1.8} />
        ))}
      </g>
      {box(1, "one replica can't tell")}
      <g opacity={k(1)}>
        <rect x={P[1][0] + 40} y={P[1][1] + 30} width={70} height={40} rx={5} fill={C.panel} stroke={C.focus} strokeWidth={1.4} />
        <T x={P[1][0] + 75} y={P[1][1] + 55} s={14} a="middle" f={C.focus} w={600}>
          {t > 1.6 ? '?' : 'A'}
        </T>
        <line x1={P[1][0] + 140} y1={P[1][1] + 22} x2={P[1][0] + 140} y2={P[1][1] + 80} stroke={C.badText} strokeWidth={2.2} strokeDasharray="6 5" />
        <rect x={P[1][0] + 170} y={P[1][1] + 30} width={70} height={40} rx={5} fill={C.panel} stroke={C.line} />
      </g>
      {box(2, 'else: latency or C')}
      <g opacity={k(2)}>
        <line x1={P[2][0] + 135} y1={P[2][1] + 20} x2={P[2][0] + 75} y2={P[2][1] + 64} stroke={C.line} strokeWidth={1.4} />
        <line x1={P[2][0] + 135} y1={P[2][1] + 20} x2={P[2][0] + 195} y2={P[2][1] + 64} stroke={t > 2.4 ? C.focus : C.line} strokeWidth={t > 2.4 ? 2.4 : 1.4} />
        <circle cx={P[2][0] + 75} cy={P[2][1] + 70} r={6} fill="none" stroke={C.line} />
        <circle cx={P[2][0] + 195} cy={P[2][1] + 70} r={6} fill={t > 2.4 ? C.focus : 'none'} stroke={C.focus} />
      </g>
      {box(3, 'rare, not never')}
      <g opacity={k(3)}>
        <line x1={P[3][0] + 20} y1={P[3][1] + 52} x2={P[3][0] + 250} y2={P[3][1] + 52} stroke={C.band} />
        <rect x={P[3][0] + 20} y={P[3][1] + 48} width={230 * easeInOut(seg(t, 2.4, 3.2))} height={8} rx={2} fill={C.focus} opacity={0.5} />
        <rect x={P[3][0] + 150} y={P[3][1] + 38} width={6} height={28} rx={1} fill={C.bad} opacity={easeOut(seg(t, 3.0, 3.2))} />
      </g>
      <Reticle x={P[1][0] + 135} y={P[1][1] + 62} w={276} h={130} t={t} at={3.6} />
    </Svg>
  );
}

// 9 · Years of uptime tick by on one lane up to "now". After the pick, the lane continues dashed into the future, a
// wall drops there, and a decision chip is already waiting at it, set before the first partition ever arrived.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const NOW = 380;
  return (
    <Svg label="a system that has run for years without a network partition argues CAP doesn't apply to it — is that right?" h={300}>
      <T x={20} y={95} s={13} f={C.secondary}>
        years up
      </T>
      <line x1={100} y1={90} x2={lerp(100, NOW, easeInOut(seg(t, 0, 1.2)))} y2={90} stroke={C.focus} strokeWidth={2} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={120 + i * 44} y={82} width={3} height={16} fill={C.focus} opacity={easeOut(seg(t, 0.2 + i * 0.15, 0.4 + i * 0.15))} />
      ))}
      <T x={NOW} y={66} s={13} a="middle" f={C.primary} o={easeOut(seg(t, 1.2, 1.5))}>
        now
      </T>
      {!on && (
        <T x={300} y={180} s={15} a="middle" f={C.secondary} o={easeOut(seg(t, 1.4, 1.9))}>
          does CAP apply?
        </T>
      )}
      {on && (
        <g>
          <Draw pts={[[NOW, 90], [570, 90]]} t={s} from={0} to={0.5} stroke={C.secondary} w={1.6} dash="5 5" />
          <Wall k={easeInOut(seg(s, 0.5, 0.9))} x={500} y0={60} y1={120} />
          <T x={500} y={144} s={13} a="middle" f={C.badText} o={easeOut(seg(s, 0.8, 1.1))}>
            if one arrives
          </T>
          <Pill at={[500, 186]} label="refuse or answer" w={140} f={C.focus} solid={false} k={easeOutBack(seg(s, 1.1, 1.5))} />
          <T x={500} y={220} s={13} a="middle" f={C.quiet} o={easeOut(seg(s, 1.4, 1.7))}>
            already designed in
          </T>
          <Decode text="a design, not a track record" t={s} at={1.8} x={290} y={270} s={16} a="middle" f={C.focus} w={600} />
          <Reticle x={500} y={186} w={156} h={34} t={s} at={2.3} />
        </g>
      )}
    </Svg>
  );
}
