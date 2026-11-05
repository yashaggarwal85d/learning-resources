import { useEffect, useState } from 'react';
import { C, Decode, Draw, Reticle, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// The chapter's clock tags (CHAPTER.md): a vector is a short row of numbered cells with its owners named above; two
// vectors neither of which dominates are joined by a pale-blue ∥, and the result is two sibling branches. Every vector
// shown is examples.py's: P1 Q0 against P0 Q1; Dynamo's D1..D5 (Sx1; Sx2; Sx2 Sy1; Sx2 Sz1; Sx3 Sy1 Sz1); the
// truncation pair A1 B5 C5 D5 against A1 B5 C5 D5 E1, cut to three; and two writes through coordinator b both
// reading b2. Red only for a lost write or a wrong verdict.

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

const CW = 36;

/** A vector: a row of cells starting at x, its owners' names above when `heads` is given. `hl` marks cells to light;
 * `cut` (per cell, 0..1) drops a cell away in red. */
function Vec({ x, y, vals, heads, k = 1, hl = [], cut = [], col = C.focus }: { x: number; y: number; vals: string[]; heads?: string[]; k?: number; hl?: number[]; cut?: number[]; col?: string }) {
  if (k <= 0) return null;
  return (
    <g opacity={k}>
      {vals.map((v, i) => {
        const c = cut[i] ?? 0;
        const lit = hl.includes(i);
        return (
          <g key={i} opacity={1 - c * 0.85} transform={`translate(0 ${(c * 26).toFixed(1)})`}>
            {heads && (
              <T x={x + i * CW + CW / 2} y={y - 10} s={13} a="middle" f={c > 0.3 ? C.badText : C.quiet}>
                {heads[i]}
              </T>
            )}
            <rect x={x + i * CW} y={y} width={CW - 3} height={28} rx={3} fill={lit ? C.focus : C.panel} stroke={c > 0.3 ? C.badText : col} strokeWidth={1.3} />
            <T x={x + i * CW + (CW - 3) / 2} y={y + 20} s={15} a="middle" f={lit ? C.ink : c > 0.3 ? C.badText : col} w={700}>
              {v}
            </T>
          </g>
        );
      })}
    </g>
  );
}

function Lane({ y, name, t, from = 0, x0 = 110, x1 = 580 }: { y: number; name: string; t: number; from?: number; x0?: number; x1?: number }) {
  return (
    <g>
      <T x={x0 - 12} y={y + 5} s={13} a="end" f={C.secondary} o={easeOut(seg(t, from, from + 0.4))}>
        {name}
      </T>
      <Draw pts={[[x0, y], [x1, y]]} t={t} from={from} to={from + 0.6} stroke={C.line} w={1.5} pen={false} />
    </g>
  );
}

function Arrow({ a, b, t, from, to, color = C.crema, w = 1.6 }: { a: Pt; b: Pt; t: number; from: number; to: number; color?: string; w?: number }) {
  const k = easeInOut(seg(t, from, to));
  if (k <= 0) return null;
  const tip: Pt = [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const head = (s: number) => `${(b[0] - 9 * Math.cos(ang + s)).toFixed(1)} ${(b[1] - 9 * Math.sin(ang + s)).toFixed(1)}`;
  return (
    <g>
      <line x1={a[0]} y1={a[1]} x2={tip[0]} y2={tip[1]} stroke={color} strokeWidth={w} />
      {k < 1 ? <circle cx={tip[0]} cy={tip[1]} r={4.5} fill={C.focus} /> : <path d={`M${head(0.45)} L${b[0]} ${b[1]} L${head(-0.45)}`} fill="none" stroke={color} strokeWidth={w} />}
    </g>
  );
}

/** The ∥ mark: neither dominates. */
const Par = ({ at: [x, y], k }: { at: Pt; k: number }) =>
  k > 0 ? (
    <g opacity={k} transform={`translate(${x} ${y}) scale(${(0.6 + 0.4 * easeOutBack(k)).toFixed(3)})`}>
      <circle r={15} fill={C.ink} stroke={C.second} strokeWidth={1.5} />
      <T x={0} y={7} s={19} a="middle" f={C.second} w={700} serif>
        ∥
      </T>
    </g>
  ) : null;

/** A cart chip: a small labelled box. */
const Chip = ({ at: [x, y], label, k = 1, f = C.focus, w = 92 }: { at: Pt; label: string; k?: number; f?: string; w?: number }) =>
  k > 0 ? (
    <g opacity={k} transform={`translate(0 ${((1 - k) * 8).toFixed(1)})`}>
      <rect x={x - w / 2} y={y - 14} width={w} height={28} rx={4} fill={C.panel} stroke={f} strokeWidth={1.4} />
      <T x={x} y={y + 5} s={14} a="middle" f={f}>
        {label}
      </T>
    </g>
  ) : null;

// 1 · Two replicas, a partition between them, a different item added on each side. On reconnect the store holds two
// carts; a single number would keep one and drop the other's item — the ghost of that loss flickers red. Both stay.
export function Hook({ t }: StepCtx) {
  const wall = easeOut(seg(t, 0.6, 1.0)) * (1 - easeOut(seg(t, 2.6, 3.0)));
  const ghost = easeOut(seg(t, 3.4, 3.8));
  return (
    <Svg label="two customers each add an item to the same cart on two replicas during a partition; on reconnect the store has two versions of one cart" h={300}>
      <Lane y={60} name="replica P" t={t} />
      <Lane y={160} name="replica Q" t={t} from={0.15} />
      <g opacity={wall}>
        <rect x={200} y={98} width={220} height={24} fill={C.bad} opacity={0.35} />
        <T x={310} y={115} s={13} a="middle" f={C.badText}>
          partition
        </T>
      </g>
      <Chip at={[240, 30]} label="+ book" k={easeOut(seg(t, 1.2, 1.6))} />
      <Chip at={[300, 192]} label="+ lamp" k={easeOut(seg(t, 1.5, 1.9))} />
      <Arrow a={[290, 60]} b={[440, 226]} t={t} from={2.9} to={3.3} color={C.secondary} />
      <Arrow a={[350, 160]} b={[440, 226]} t={t} from={3.0} to={3.4} color={C.secondary} />
      <T x={20} y={262} s={13} f={C.secondary} o={easeOut(seg(t, 3.0, 3.4))}>
        reconnected
      </T>
      <Chip at={[420, 266]} label="book" k={easeOut(seg(t, 3.3, 3.6))} />
      <Chip at={[530, 266]} label="lamp" k={easeOut(seg(t, 3.4, 3.7))} f={ghost > 0.5 && t < 4.2 ? C.badText : C.focus} />
      {ghost > 0 && t < 4.2 && <line x1={488} y1={266} x2={572} y2={266} stroke={C.badText} strokeWidth={2} opacity={ghost} />}
      <Reticle x={475} y={266} w={220} h={40} t={t} at={4.2} />
    </Svg>
  );
}

// 2 · The two versions with their vectors, P1 Q0 and P0 Q1. After the pick, the comparison runs column by column: P
// favours the first, Q the second, so neither dominates — ∥ — and both carts are kept.
export function PredictWhichVersion({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const c1 = on ? easeOut(seg(s, 0.2, 0.5)) : 0;
  const c2 = on ? easeOut(seg(s, 0.7, 1.0)) : 0;
  const par = on ? easeOut(seg(s, 1.2, 1.5)) : 0;
  const VX = 330;
  return (
    <Svg label="the store holds two versions of the cart — keep the one with the larger clock, both, or neither?" h={300}>
      <Chip at={[150, 90]} label="book" k={easeOut(seg(t, 0, 0.4))} />
      <Chip at={[150, 200]} label="lamp" k={easeOut(seg(t, 0.2, 0.6))} />
      <Vec x={VX} y={76} vals={['1', '0']} heads={['P', 'Q']} k={easeOut(seg(t, 0.5, 0.9))} hl={c1 > 0.5 ? [0] : []} />
      <Vec x={VX} y={186} vals={['0', '1']} k={easeOut(seg(t, 0.7, 1.1))} hl={c2 > 0.5 ? [1] : []} />
      <T x={VX + 90} y={95} s={13} f={C.quiet} o={easeOut(seg(t, 0.9, 1.3))}>
        first
      </T>
      <T x={VX + 90} y={205} s={13} f={C.quiet} o={easeOut(seg(t, 1.0, 1.4))}>
        second
      </T>
      <T x={VX + 16} y={155} s={16} a="middle" f={C.focus} o={c1} serif>
        ≥
      </T>
      <T x={VX + 52} y={155} s={16} a="middle" f={C.focus} o={c2} serif>
        ≤
      </T>
      <Par at={[VX + 140, 150]} k={par} />
      <T x={300} y={278} s={15} a="middle" f={on ? C.second : C.secondary} o={on ? easeOut(seg(s, 1.4, 1.7)) : easeOut(seg(t, 1.4, 2.0))}>
        {on ? 'keep both' : 'which one stays?'}
      </T>
      {on && <Reticle x={150} y={145} w={120} h={150} t={s} at={1.8} color={C.second} />}
    </Svg>
  );
}

// 3 · The rule, run once. P bumps its own cell twice; Q bumps its own once; Q hears P's vector and takes the larger
// value cell by cell. Then the dominance test lights: every cell at least as large, one strictly larger.
export function RevealVectorRule({ t }: StepCtx) {
  const pv = seg(t, 0.8, 0.81) ? '2' : '1';
  const merged = easeOut(seg(t, 2.2, 2.6));
  const dom = easeOut(seg(t, 3.2, 3.6));
  return (
    <Svg label="each process keeps one entry per process, bumps its own entry on every event, and on receiving a vector takes the larger value in every position; one vector dominates another when every entry is at least as large and one is strictly larger" h={300}>
      <Lane y={60} name="P" t={t} x0={70} />
      <Lane y={150} name="Q" t={t} from={0.1} x0={70} />
      <circle cx={130} cy={60} r={6} fill={C.focus} opacity={easeOut(seg(t, 0.2, 0.4))} />
      <circle cx={210} cy={60} r={6} fill={C.focus} opacity={easeOut(seg(t, 0.7, 0.9))} />
      <Vec x={110} y={6} vals={[pv, '0']} heads={undefined} k={easeOut(seg(t, 0.3, 0.6))} hl={t > 0.7 && t < 1.1 ? [0] : []} />
      <T x={20} y={26} s={13} f={C.secondary} o={easeOut(seg(t, 0.3, 0.7))}>
        bump own
      </T>
      <circle cx={150} cy={150} r={6} fill={C.focus} opacity={easeOut(seg(t, 1.0, 1.2))} />
      <Vec x={110} y={168} vals={['0', '1']} k={easeOut(seg(t, 1.0, 1.3))} />
      <Arrow a={[210, 60]} b={[330, 150]} t={t} from={1.3} to={2.0} />
      <circle cx={330} cy={150} r={6} fill={C.focus} opacity={easeOut(seg(t, 2.0, 2.2))} />
      <Vec x={300} y={168} vals={['2', '1']} k={merged} hl={t > 2.2 && t < 2.9 ? [0, 1] : []} />
      <T x={380} y={188} s={13} f={C.secondary} o={merged}>
        max, per cell
      </T>
      <g opacity={dom}>
        <Vec x={150} y={238} vals={['2', '1']} />
        <T x={240} y={258} s={16} a="middle" f={C.focus} serif>
          ≥
        </T>
        <Vec x={262} y={238} vals={['1', '0']} col={C.secondary} />
        <T x={350} y={258} s={13} f={C.primary}>
          {'all ≥, one >'}
        </T>
      </g>
      <Decode text="dominates" t={t} at={3.8} x={20} y={258} s={14} f={C.focus} w={600} />
      <Reticle x={220} y={252} w={160} h={40} t={t} at={4.2} />
    </Svg>
  );
}

// 4 · Dynamo's own trace, one version per beat: D1 and D2 through Sx, D3 through Sy and D4 through Sz from the same
// D2 (∥ between them), then the reconciling D5 through Sx dominating both.
export function RevealDynamoExample({ t }: StepCtx) {
  const nodes: { id: string; at: Pt; vals: string[]; heads: string[]; k: number }[] = [
    { id: 'D1', at: [30, 128], vals: ['1'], heads: ['Sx'], k: easeOut(seg(t, 0.2, 0.5)) },
    { id: 'D2', at: [120, 128], vals: ['2'], heads: ['Sx'], k: easeOut(seg(t, 0.8, 1.1)) },
    { id: 'D3', at: [240, 46], vals: ['2', '1'], heads: ['Sx', 'Sy'], k: easeOut(seg(t, 1.5, 1.8)) },
    { id: 'D4', at: [240, 214], vals: ['2', '1'], heads: ['Sx', 'Sz'], k: easeOut(seg(t, 1.8, 2.1)) },
    { id: 'D5', at: [450, 128], vals: ['3', '1', '1'], heads: ['Sx', 'Sy', 'Sz'], k: easeOut(seg(t, 3.0, 3.3)) },
  ];
  return (
    <Svg label="one coordinator writes the first two versions; two others each write a third from the same point, neither dominating; a client reads both and the reconciling write dominates them both" h={300}>
      {nodes.map((n) => (
        <g key={n.id}>
          <T x={n.at[0]} y={n.at[1] + 52} s={14} f={n.id === 'D5' ? C.focus : C.primary} w={600} o={n.k}>
            {n.id}
          </T>
          <Vec x={n.at[0]} y={n.at[1]} vals={n.vals} heads={n.heads} k={n.k} hl={n.id === 'D5' && t > 3.3 && t < 3.9 ? [0] : []} />
        </g>
      ))}
      <Arrow a={[68, 142]} b={[116, 142]} t={t} from={0.5} to={0.8} color={C.secondary} />
      <Arrow a={[158, 136]} b={[236, 70]} t={t} from={1.1} to={1.5} color={C.secondary} />
      <Arrow a={[158, 150]} b={[236, 222]} t={t} from={1.4} to={1.8} color={C.secondary} />
      <Par at={[276, 160]} k={easeOut(seg(t, 2.2, 2.5))} />
      <Arrow a={[316, 64]} b={[446, 136]} t={t} from={2.6} to={3.0} color={C.focus} />
      <Arrow a={[316, 228]} b={[446, 152]} t={t} from={2.6} to={3.0} color={C.focus} />
      <T x={580} y={290} s={13} a="end" f={C.secondary} o={easeOut(seg(t, 2.7, 3.0))}>
        client reconciles
      </T>
      <Decode text="dominates both" t={t} at={3.6} x={450} y={226} s={13} f={C.focus} w={600} />
      <Reticle x={503} y={140} w={130} h={58} t={t} at={4.1} />
    </Svg>
  );
}

// 5 · The same row of cells, relabelled: the owners above it decode from processes to replicas, the caption from
// "counts events" to "counts versions", and the vector drops onto a disk record next to the cart it describes.
export function RevealVersionVector({ t }: StepCtx) {
  const flip = seg(t, 1.4, 1.41);
  const heads = flip ? ['A', 'B', 'C'] : ['P', 'Q', 'R'];
  const drop = easeInOut(seg(t, 2.8, 3.6));
  const y = lerp(80, 200, drop);
  const x = lerp(220, 330, drop);
  return (
    <Svg label="a vector clock tracks events at processes; a version vector tracks versions of one data item at the replicas that coordinated writes to it — same comparison, same guarantee, the form a real store keeps on disk" h={300}>
      <Vec x={x} y={y} vals={['3', '1', '1']} heads={heads} k={easeOut(seg(t, 0, 0.4))} />
      <Decode text={flip ? 'counts versions per replica' : 'counts events per process'} t={t} at={flip ? 1.4 : 0.3} x={300} y={44} s={14} a="middle" f={flip ? C.focus : C.primary} w={600} o={1 - drop} />
      <g opacity={easeOut(seg(t, 2.4, 2.8))}>
        <ellipse cx={300} cy={176} rx={170} ry={14} fill="none" stroke={C.secondary} strokeWidth={1.4} />
        <path d="M130 176 V268 a170 14 0 0 0 340 0 V176" fill="none" stroke={C.secondary} strokeWidth={1.4} />
        <T x={160} y={224} s={14} f={C.primary}>
          cart
        </T>
      </g>
      <T x={20} y={140} s={13} f={C.quiet} o={easeOut(seg(t, 1.6, 2.0)) * (1 - drop)}>
        same comparison
      </T>
      <Reticle x={384} y={214} w={130} h={56} t={t} at={4.0} />
    </Svg>
  );
}

// 6 · Concurrent writes keep arriving as siblings. Two side by side is honest; with no client ever writing a merge
// back they pile up red, while every new coordinator adds another column to the vector.
export function RevealSiblings({ t }: StepCtx) {
  const n = Math.min(6, Math.floor(1 + seg(t, 0.4, 3.4) * 6));
  const cols = Math.min(6, 3 + Math.floor(seg(t, 2.0, 3.8) * 4));
  return (
    <Svg label="concurrent versions are kept as siblings for the application to merge; a client that never writes a merge back leaves them piling up, and every new coordinator adds another column to the vector" h={300}>
      <T x={20} y={30} s={13} f={C.secondary}>
        siblings in the store
      </T>
      {Array.from({ length: n }, (_, i) => (
        <Chip key={i} at={[80 + (i % 3) * 110, 66 + Math.floor(i / 3) * 40]} label={`cart ${String.fromCharCode(97 + i)}`} w={100} f={i < 2 ? C.focus : C.badText} k={easeOut(seg(t, 0.4 + i * 0.5, 0.7 + i * 0.5))} />
      ))}
      <T x={400} y={86} s={13} f={C.badText} o={easeOut(seg(t, 1.6, 2.0))}>
        never merged back
      </T>
      <T x={20} y={168} s={13} f={C.secondary} o={easeOut(seg(t, 1.8, 2.2))}>
        the vector
      </T>
      <Vec x={20} y={206} vals={Array.from({ length: cols }, () => '1')} heads={['A', 'B', 'C', 'D', 'E', 'F'].slice(0, cols)} k={easeOut(seg(t, 1.8, 2.2))} hl={[cols - 1]} />
      <T x={260} y={226} s={13} f={C.secondary} o={easeOut(seg(t, 2.6, 3.0))}>
        a column per coordinator
      </T>
      <Reticle x={190} y={86} w={350} h={90} t={t} at={4.1} color={C.badText} />
    </Svg>
  );
}

// 7 · Two clients write through the same coordinator b. Plain version vectors give both b2, so the second looks like
// it replaced the first, and the first write drops red. With a dot naming each event, both stay as siblings.
export function RevealDot({ t }: StepCtx) {
  const lost = easeOut(seg(t, 1.6, 2.0));
  return (
    <Svg label="two clients writing through the same coordinator can bump its entry identically and look like a single update; a dot attached to each write tells them apart" h={300}>
      <T x={20} y={26} s={13} f={C.primary}>
        plain version vector
      </T>
      <Chip at={[80, 66]} label="client 1" w={100} k={easeOut(seg(t, 0.1, 0.4))} />
      <Chip at={[80, 116]} label="client 2" w={100} k={easeOut(seg(t, 0.2, 0.5))} />
      <Arrow a={[132, 66]} b={[218, 84]} t={t} from={0.4} to={0.8} color={C.secondary} />
      <Arrow a={[132, 116]} b={[218, 100]} t={t} from={0.5} to={0.9} color={C.secondary} />
      <Vec x={226} y={78} vals={['2']} heads={['b']} k={easeOut(seg(t, 0.8, 1.1))} />
      <T x={290} y={98} s={14} a="middle" f={C.focus} serif o={easeOut(seg(t, 1.0, 1.3))}>
        =
      </T>
      <Vec x={312} y={78} vals={['2']} heads={['b']} k={easeOut(seg(t, 1.0, 1.3))} />
      <Chip at={[440, 70]} label="write 2" w={96} k={easeOut(seg(t, 1.3, 1.6))} />
      <Chip at={[440, 112]} label="write 1" w={96} f={lost > 0.5 ? C.badText : C.focus} k={easeOut(seg(t, 1.3, 1.6)) * (1 - lost * 0.5)} />
      {lost > 0 && <line x1={394} y1={112} x2={394 + 92 * lost} y2={112} stroke={C.badText} strokeWidth={2} />}
      <line x1={20} y1={150} x2={580} y2={150} stroke={C.band} />
      <T x={20} y={180} s={13} f={C.primary} o={easeOut(seg(t, 2.2, 2.5))}>
        with a dot per write
      </T>
      <Vec x={226} y={208} vals={['2']} heads={['b']} k={easeOut(seg(t, 2.4, 2.7))} />
      <Decode text="dot one" t={t} at={2.6} x={268} y={228} s={13} f={C.second} />
      <Vec x={226} y={252} vals={['2']} k={easeOut(seg(t, 2.6, 2.9))} />
      <Decode text="dot two" t={t} at={2.8} x={268} y={272} s={13} f={C.second} />
      <Chip at={[480, 222]} label="write 1" w={96} k={easeOut(seg(t, 3.2, 3.5))} />
      <Chip at={[480, 264]} label="write 2" w={96} k={easeOut(seg(t, 3.3, 3.6))} />
      <Reticle x={480} y={243} w={120} h={84} t={t} at={4.0} />
    </Svg>
  );
}

// 8 · The four pieces, each replaying its move: two vectors meeting at ∥, Dynamo's fork and reconcile, siblings kept
// side by side, and a vector cut short with its cells falling away.
export function Recap({ t }: StepCtx) {
  const at = (i: number) => 0.2 + i * 0.9;
  const labels = ['∥ detected exactly', 'fork, then reconcile', 'siblings, kept honestly', 'truncation trades it'];
  const cells: Pt[] = [[0, 0], [300, 0], [0, 150], [300, 150]];
  return (
    <Svg label="a vector detects concurrency exactly; Dynamo's example shows the mechanism end to end; siblings are the application's honest job; a dot keeps them from multiplying; truncation trades the exactness away" h={300}>
      {labels.map((l, i) => (
        <T key={l} x={cells[i][0] + 150} y={cells[i][1] + 136} s={13} a="middle" f={i === 3 ? C.badText : C.primary} o={easeOut(seg(t, at(i), at(i) + 0.4))}>
          {l}
        </T>
      ))}
      <Vec x={40} y={40} vals={['1', '0']} k={easeOut(seg(t, at(0), at(0) + 0.3))} />
      <Vec x={190} y={40} vals={['0', '1']} k={easeOut(seg(t, at(0) + 0.1, at(0) + 0.4))} />
      <Par at={[150, 54]} k={easeOut(seg(t, at(0) + 0.4, at(0) + 0.7))} />
      <Arrow a={[340, 70]} b={[410, 40]} t={t} from={at(1)} to={at(1) + 0.3} color={C.secondary} />
      <Arrow a={[340, 70]} b={[410, 100]} t={t} from={at(1)} to={at(1) + 0.3} color={C.secondary} />
      <Arrow a={[430, 40]} b={[520, 70]} t={t} from={at(1) + 0.3} to={at(1) + 0.6} color={C.focus} />
      <Arrow a={[430, 100]} b={[520, 70]} t={t} from={at(1) + 0.3} to={at(1) + 0.6} color={C.focus} />
      <Chip at={[90, 210]} label="book" w={90} k={easeOut(seg(t, at(2), at(2) + 0.3))} />
      <Chip at={[210, 210]} label="lamp" w={90} k={easeOut(seg(t, at(2) + 0.15, at(2) + 0.45))} />
      <Vec x={360} y={196} vals={['1', '5', '5', '5']} k={easeOut(seg(t, at(3), at(3) + 0.3))} cut={[easeOut(seg(t, at(3) + 0.4, at(3) + 0.7))]} />
      <line x1={300} y1={14} x2={300} y2={290} stroke={C.band} />
      <line x1={14} y1={150} x2={586} y2={150} stroke={C.band} />
    </Svg>
  );
}

// 9 · A real ancestor and its descendant: A1 B5 C5 D5 against A1 B5 C5 D5 E1, and the descendant dominates. Cut both to
// three cells. After the pick, the oldest cells fall away red, B now favours the ancestor and E the descendant, and the
// ordered pair reads ∥.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const cutA = on ? easeOut(seg(s, 0.2, 0.6)) : 0;
  const cutB = on ? easeOut(seg(s, 0.5, 0.9)) : 0;
  const par = on ? easeOut(seg(s, 1.2, 1.5)) : 0;
  const X = 120;
  return (
    <Svg label="a store truncates every vector past a fixed number of entries — can that make two versions that really were ordered look concurrent?" h={300}>
      <T x={20} y={84} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.4))}>
        ancestor
      </T>
      <Vec x={X} y={64} vals={['1', '5', '5', '5']} heads={['A', 'B', 'C', 'D']} k={easeOut(seg(t, 0.1, 0.5))} cut={[cutA]} />
      <T x={20} y={184} s={13} f={C.secondary} o={easeOut(seg(t, 0.3, 0.7))}>
        descendant
      </T>
      <Vec x={X} y={164} vals={['1', '5', '5', '5', '1']} heads={['A', 'B', 'C', 'D', 'E']} k={easeOut(seg(t, 0.3, 0.7))} cut={[cutA, cutB]} />
      <T x={X + 5 * CW + 20} y={184} s={13} f={on ? C.quiet : C.focus} o={easeOut(seg(t, 1.0, 1.4))}>
        {on ? 'was: descends' : 'descends'}
      </T>
      <T x={300} y={270} s={15} a="middle" f={on ? C.second : C.secondary} o={on ? easeOut(seg(s, 1.4, 1.7)) : easeOut(seg(t, 1.6, 2.2))}>
        {on ? 'cut to three: reads as ∥' : 'cut each to three cells?'}
      </T>
      {on && (
        <g>
          <Draw pts={[[X + CW + 16, 96], [X + CW + 16, 160]]} t={s} from={0.9} to={1.1} stroke={C.second} w={2} />
          <Draw pts={[[X + 4 * CW + 16, 160], [X + 4 * CW + 16, 96]]} t={s} from={1.0} to={1.2} stroke={C.second} w={2} />
        </g>
      )}
      <Par at={[X + 5 * CW + 60, 124]} k={par} />
      {on && <Reticle x={X + 5 * CW + 60} y={124} w={46} h={46} t={s} at={1.7} color={C.second} />}
    </Svg>
  );
}
