import { useEffect, useState } from 'react';
import { C, Draw, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// MQTT, Sparkplug B and the Unified Namespace, drawn from examples.py and its recorded Mosquitto run (FACT-CHECK.md):
// QoS 0 lost 3 of 5 with no duplicates, QoS 1 lost none with 1 duplicate; retained 211 and the Will DEAD; NBIRTH seq 0
// with bdSeq, NDATA 1 and 2, the 255 → 0 wrap; the 0 1 2 3 _ 5 gap; and the acme/plantA/area1 topic tree.

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

/** Quadratic ease-in. */
const easeIn = (x: number) => x * x;

/** A message dot travelling from (x1, y) to (x2, y) between two times. */
const Msg = ({ t, from, to, x1, x2, y, c = C.focus }: { t: number; from: number; to: number; x1: number; x2: number; y: number; c?: string }) => {
  const u = seg(t, from, to);
  if (u <= 0 || u >= 1) return null;
  return <circle cx={lerp(x1, x2, easeInOut(u))} cy={y} r={4} fill={c} />;
};

// 0 · Edge node → broker → dashboard. Readings flow. The node loses power: it goes dark with a red ✕, but the dashboard
// keeps its last value, 842.0, under a "20 min" clock. The node returns and republishes, and in the record strip below
// every metric lands twice, the second copy red.
export function Hook({ t }: StepCtx) {
  const dead = seg(t, 1.4, 1.5) > 0 && seg(t, 3.2, 3.3) === 0;
  const back = seg(t, 3.2, 3.3) > 0;
  const metrics = ['temp', 'speed', 'status'];
  return (
    <Svg label="an edge node loses power mid-shift, the dashboard keeps showing the same stale reading for twenty minutes, then the node comes back and every metric is recorded twice" h={200}>
      <Box x={25} y={34} w={120} label="edge node" lit={!dead} stroke={dead ? C.badText : undefined} f={dead ? C.badText : undefined} o={easeOut(seg(t, 0, 0.3))} />
      <Box x={245} y={34} w={110} label="broker" o={easeOut(seg(t, 0.1, 0.4))} />
      <rect x={460} y={14} width={115} height={68} rx={5} fill={C.panel} stroke={C.line} strokeWidth={1.1} opacity={easeOut(seg(t, 0.2, 0.5))} />
      <T x={517} y={34} s={11} f={C.quiet} a="middle" o={easeOut(seg(t, 0.2, 0.5))}>
        dashboard
      </T>
      <T x={517} y={72} s={15} f={dead ? C.badText : C.focus} a="middle" w={600} o={easeOut(seg(t, 0.2, 0.5))}>
        842.0
      </T>
      <line x1={145} y1={50} x2={245} y2={50} stroke={C.line} strokeWidth={1.2} />
      <line x1={355} y1={50} x2={460} y2={50} stroke={C.line} strokeWidth={1.2} />
      {[0, 1].map((i) => (
        <g key={i}>
          <Msg t={t} from={0.2 + i * 0.5} to={0.6 + i * 0.5} x1={145} x2={245} y={50} />
          <Msg t={t} from={0.5 + i * 0.5} to={0.9 + i * 0.5} x1={355} x2={460} y={50} />
        </g>
      ))}
      <Cross x={80} y={96} k={dead ? easeOutBack(seg(t, 1.4, 1.8)) : 0} />
      <T x={575} y={98} s={12} f={C.badText} a="end" o={dead ? easeOut(seg(t, 1.9, 2.3)) : 0}>
        still 842.0, 20 min
      </T>
      <T x={25} y={134} s={12} f={C.quiet} o={easeOut(seg(t, 0.3, 0.6))}>
        record
      </T>
      {metrics.map((m, i) => (
        <g key={m} opacity={easeOut(seg(t, 0.4 + i * 0.15, 0.7 + i * 0.15))}>
          <rect x={100 + i * 80} y={124} width={70} height={16} rx={3} fill="none" stroke={C.secondary} strokeWidth={1} />
          <T x={135 + i * 80} y={136} s={11} f={C.secondary} a="middle">
            {m}
          </T>
        </g>
      ))}
      {back &&
        metrics.map((m, i) => (
          <g key={m} opacity={easeOut(seg(t, 3.6 + i * 0.25, 3.9 + i * 0.25))}>
            <rect x={100 + i * 80} y={150} width={70} height={16} rx={3} fill="none" stroke={C.badText} strokeWidth={1.2} />
            <T x={135 + i * 80} y={162} s={11} f={C.badText} a="middle">
              {m}
            </T>
          </g>
        ))}
      <T x={575} y={162} s={14} f={C.badText} a="end" w={600} o={easeOut(seg(t, 4.5, 4.9))}>
        × 2
      </T>
      <T x={25} y={190} s={12} f={C.focus} o={back ? easeOut(seg(t, 3.2, 3.6)) : 0}>
        node back, republishes
      </T>
    </Svg>
  );
}

// 1 · The dead node and the trusting dashboard, then two blank field cards. Before the answer: "?" in each. After it,
// they fill: the Will, published by the broker as the death certificate; and bdSeq with seq back at 0, marking a
// restart rather than a replay.
export function PredictFields({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const cards = [
    { h: 'field 1', v: 'the Will', d: 'death certificate' },
    { h: 'field 2', v: 'bdSeq, seq 0', d: 'restart, not replay' },
  ];
  return (
    <Svg label="the dashboard trusted a dead node for twenty minutes — what two Sparkplug fields tell a consumer that the node died, and that this is a restart rather than a duplicate?" h={200}>
      <Box x={25} y={20} w={120} label="edge node" stroke={C.badText} f={C.badText} o={easeOut(seg(t, 0, 0.3))} />
      <Cross x={162} y={36} k={easeOutBack(seg(t, 0.3, 0.7))} />
      <Box x={395} y={20} w={180} label="842.0, trusted" o={easeOut(seg(t, 0.5, 0.8))} />
      {cards.map((c, i) => {
        const x = 25 + i * 285;
        const k = on ? easeOut(seg(s, 0.2 + i * 0.4, 0.6 + i * 0.4)) : 0;
        return (
          <g key={c.h} opacity={easeOut(seg(t, 1.2 + i * 0.4, 1.6 + i * 0.4))}>
            <rect x={x} y={80} width={265} height={96} rx={6} fill={C.panel} stroke={on ? C.focus : C.line} strokeWidth={on ? 1.6 : 1.1} />
            <T x={x + 14} y={102} s={11} f={C.quiet}>
              {c.h}
            </T>
            {!on ? (
              <T x={x + 132} y={146} s={22} f={C.focus} a="middle" w={600}>
                ?
              </T>
            ) : (
              <g opacity={k}>
                <T x={x + 14} y={134} s={16} f={C.focus} w={600}>
                  {c.v}
                </T>
                <T x={x + 14} y={160} s={12} f={C.second}>
                  {c.d}
                </T>
              </g>
            )}
          </g>
        );
      })}
    </Svg>
  );
}

// 2 · Two lanes, QoS 0 and QoS 1, each with five messages leaving the publisher. The first one reaches the subscriber and
// the connection is cut — red ✕ — before it is acknowledged; the rest are published while it is down. The tallies from
// the real Mosquitto run land: QoS 0, 2 arrived and 3 lost, no duplicates; QoS 1, 6 arrived — the first one twice — and
// none lost.
export function RevealQos({ t }: StepCtx) {
  const lanes = [
    { q: 'QoS 0', y: 50, got: 2, lost: 3, dup: 0 },
    { q: 'QoS 1', y: 140, got: 6, lost: 0, dup: 1 },
  ];
  return (
    <Svg label="killing a real connection to a real Mosquitto broker mid-stream — QoS 0 loses messages with zero duplicates, QoS 1 loses nothing but redelivers one unacknowledged message" h={200}>
      {lanes.map((l, li) => {
        const o = li * 0.3;
        return (
          <g key={l.q} opacity={easeOut(seg(t, o, o + 0.3))}>
            <T x={25} y={l.y + 5} s={14} f={C.primary} w={600}>
              {l.q}
            </T>
            <line x1={110} y1={l.y} x2={300} y2={l.y} stroke={C.line} strokeWidth={1.2} />
            {[0, 1, 2, 3, 4].map((i) => (
              <Msg key={i} t={t} from={0.4 + o + i * 0.3} to={1.0 + o + i * 0.3} x1={110} x2={i === 0 ? 300 : 250} y={l.y} />
            ))}
            <rect x={300} y={l.y - 12} width={14} height={24} rx={3} fill={C.panel} stroke={C.secondary} strokeWidth={1.1} />
            <Cross x={330} y={l.y} k={easeOutBack(seg(t, 1.1 + o, 1.4 + o))} />
            {Array.from({ length: l.got }, (_, i) => {
              const dup = l.dup > 0 && i === l.got - 1;
              return (
                <rect
                  key={i}
                  x={360 + i * 22}
                  y={l.y - 9}
                  width={18}
                  height={18}
                  rx={3}
                  fill={dup ? 'none' : C.focus}
                  stroke={dup ? C.second : C.focus}
                  strokeWidth={1.6}
                  opacity={easeOut(seg(t, 3.0 + o + i * 0.12, 3.3 + o + i * 0.12))}
                />
              );
            })}
            {Array.from({ length: l.lost }, (_, i) => (
              <Cross key={i} x={410 + i * 22} y={l.y} k={easeOutBack(seg(t, 3.6 + o + i * 0.12, 3.9 + o + i * 0.12))} />
            ))}
            <T x={360} y={l.y + 32} s={12} f={l.lost ? C.badText : C.second} o={easeOut(seg(t, 4.3 + o, 4.7 + o))}>
              {l.lost ? `${l.lost} lost, 0 dupes` : '0 lost, 1 dupe'}
            </T>
          </g>
        );
      })}
      <T x={110} y={186} s={11} f={C.quiet} o={easeOut(seg(t, 0.4, 0.8))}>
        5 published each, real broker
      </T>
    </Svg>
  );
}

// 3 · Left: a publisher sets the retained value 211 on plant/furnace1/status and leaves; long after, a late subscriber
// joins and is handed 211 at once. Right: the edge node's socket is killed with no goodbye, and only then does the broker
// publish its registered Will, DEAD, to the host.
export function RevealRetainedWill({ t }: StepCtx) {
  const kill = seg(t, 3.4, 3.5) > 0;
  return (
    <Svg label="a retained message is the broker's own stored last value, handed to anyone who asks; the Will is the death certificate the broker publishes only on an ungraceful disconnect" h={200}>
      <Box x={235} y={70} w={130} h={40} label="broker" o={easeOut(seg(t, 0, 0.3))} />
      <T x={300} y={130} s={12} f={C.second} a="middle" o={easeOut(seg(t, 0.8, 1.1))}>
        retained: 211
      </T>
      <T x={25} y={44} s={12} f={C.secondary} o={easeOut(seg(t, 0.2, 0.5))}>
        publisher
      </T>
      <Msg t={t} from={0.4} to={0.9} x1={110} x2={235} y={60} c={C.second} />
      <T x={25} y={150} s={12} f={C.secondary} o={easeOut(seg(t, 1.4, 1.7))}>
        late subscriber
      </T>
      <Msg t={t} from={1.8} to={2.3} x1={235} x2={205} y={146} c={C.second} />
      <T x={25} y={174} s={14} f={C.second} w={600} o={easeOut(seg(t, 2.3, 2.7))}>
        gets 211 at once
      </T>

      <Box x={460} y={20} w={115} label="edge node" stroke={kill ? C.badText : undefined} f={kill ? C.badText : undefined} o={easeOut(seg(t, 2.6, 2.9))} />
      <line x1={460} y1={36} x2={365} y2={80} stroke={kill ? C.badText : C.line} strokeWidth={1.2} strokeDasharray={kill ? '3 3' : undefined} opacity={easeOut(seg(t, 2.6, 2.9))} />
      <Cross x={412} y={58} k={easeOutBack(seg(t, 3.4, 3.8))} />
      <T x={575} y={74} s={11} f={C.badText} a="end" o={easeOut(seg(t, 3.5, 3.9))}>
        no goodbye
      </T>
      <Box x={460} y={130} w={115} label="host" o={easeOut(seg(t, 2.7, 3.0))} />
      <Msg t={t} from={4.0} to={4.6} x1={365} x2={460} y={146} c={C.badText} />
      <T x={575} y={190} s={14} f={C.badText} a="end" w={600} o={easeOut(seg(t, 4.5, 4.9))}>
        Will: DEAD
      </T>
    </Svg>
  );
}

// 4 · Sparkplug's own messages built as real Protobuf: an NBIRTH card with seq 0, Temperature 842.0 and bdSeq 0. NDATA
// cards follow, seq 1 (843.0) and seq 2 (844.0). Then the counter jumps to 255 (845.0) and wraps back to 0. Below, the
// topic every death is published on.
export function RevealSparkplug({ t }: StepCtx) {
  const cards = [
    { h: 'NBIRTH', seq: '0', rows: ['Temperature', '842.0', 'bdSeq 0'], a: 0 },
    { h: 'NDATA', seq: '1', rows: ['Temperature', '843.0'], a: 1.4 },
    { h: 'NDATA', seq: '2', rows: ['Temperature', '844.0'], a: 2.0 },
  ];
  const wrap = seg(t, 3.6, 4.6);
  const shown = wrap < 0.5 ? '255' : '0';
  return (
    <Svg label="NBIRTH includes every metric the node will ever report, sequence 0, and a bdSeq; NDATA's sequence number increments by one and wraps from 255 back to 0" h={260}>
      {cards.map((c, i) => {
        const x = 25 + i * 185;
        return (
          <g key={i} opacity={easeOut(seg(t, c.a, c.a + 0.4))} transform={`translate(${(1 - easeOut(seg(t, c.a, c.a + 0.4))) * 20} 0)`}>
            <rect x={x} y={20} width={180} height={112} rx={6} fill={C.panel} stroke={i === 0 ? C.focus : C.line} strokeWidth={i === 0 ? 1.6 : 1.1} />
            <T x={x + 12} y={42} s={13} f={i === 0 ? C.focus : C.primary} w={600}>
              {c.h}
            </T>
            <T x={x + 12} y={66} s={12} f={C.second}>
              {`seq ${c.seq}`}
            </T>
            {c.rows.map((r, j) => (
              <T key={r} x={x + 12} y={88 + j * 19} s={12} f={j === 1 ? C.focus : C.primary}>
                {r}
              </T>
            ))}
          </g>
        );
      })}
      <g opacity={easeOut(seg(t, 3.0, 3.4))}>
        <T x={25} y={172} s={13} f={C.secondary}>
          seq counter
        </T>
        <T x={200} y={174} s={20} f={wrap >= 0.5 ? C.second : C.focus} w={600}>
          {shown}
        </T>
        <path d="M260 166 h50" stroke={C.line} strokeWidth={1.4} />
        <T x={325} y={172} s={12} f={C.quiet} o={easeOut(seg(t, 4.0, 4.4))}>
          255 → 0, it wraps
        </T>
      </g>
      <T x={25} y={232} s={12} f={C.quiet} o={easeOut(seg(t, 4.8, 5.2))}>
        spBv1.0/AcmeGroup/NDEATH/Line1Furnace1
      </T>
    </Svg>
  );
}

// 5 · A host watches seq numbers arrive as cells: 0, 1, 2, 3, then 5 — the empty slot for 4 flashes red, gap 1, and a
// "rebirth" arrow fires back toward the node. Below, an unbroken 0–4 stream arrives and nothing is raised: gap 0.
export function RevealGap({ t }: StepCtx) {
  const seqA = [0, 1, 2, 3, null, 5];
  const seqB = [0, 1, 2, 3, 4];
  const gap = seg(t, 2.2, 2.3) > 0;
  return (
    <Svg label="a host watching the sequence stream 0, 1, 2, 3, _, 5 detects the gap at 4 and asks for a rebirth; an unbroken stream raises nothing" h={200}>
      {seqA.map((v, i) => (
        <g key={i} opacity={easeOut(seg(t, 0.2 + i * 0.3, 0.5 + i * 0.3))}>
          <rect
            x={60 + i * 50}
            y={30}
            width={40}
            height={32}
            rx={4}
            fill={C.panel}
            stroke={v === null ? (gap ? C.badText : C.line) : C.secondary}
            strokeWidth={v === null ? 1.8 : 1.1}
            strokeDasharray={v === null ? '4 3' : undefined}
          />
          <T x={80 + i * 50} y={52} s={15} f={v === null ? C.badText : C.primary} a="middle" w={600}>
            {v === null ? '_' : String(v)}
          </T>
        </g>
      ))}
      <T x={575} y={52} s={14} f={C.badText} a="end" w={600} o={easeOut(seg(t, 2.3, 2.7))}>
        gap: 1
      </T>
      <Draw
        pts={[
          [280, 70],
          [180, 92],
          [60, 92],
        ]}
        t={t}
        from={2.8}
        to={3.4}
        stroke={C.second}
        w={1.6}
      />
      <T x={60} y={112} s={13} f={C.second} w={600} o={easeOut(seg(t, 3.3, 3.7))}>
        rebirth requested
      </T>
      {seqB.map((v, i) => (
        <g key={i} opacity={easeOut(seg(t, 3.6 + i * 0.2, 3.9 + i * 0.2))}>
          <rect x={60 + i * 50} y={140} width={40} height={32} rx={4} fill={C.panel} stroke={C.secondary} strokeWidth={1.1} />
          <T x={80 + i * 50} y={162} s={15} f={C.primary} a="middle" w={600}>
            {String(v)}
          </T>
        </g>
      ))}
      <T x={575} y={162} s={14} f={C.quiet} a="end" o={easeOut(seg(t, 4.7, 5.1))}>
        gap: 0
      </T>
    </Svg>
  );
}

// 6 · Four systems wired point to point — six tangled lines. The lines fade and every system instead connects to one
// topic tree: acme/plantA/area1 branching to line1's furnace1 (842.0) and spindle1 (1842.0) and line2's furnace2 (790.0).
export function RevealUns({ t }: StepCtx) {
  const sys = [
    { n: 'MES', x: 25, y: 30 },
    { n: 'SCADA', x: 25, y: 90 },
    { n: 'historian', x: 25, y: 150 },
    { n: 'dashboard', x: 165, y: 150 },
  ];
  const pairs: [number, number][] = [
    [0, 1],
    [0, 2],
    [0, 3],
    [1, 2],
    [1, 3],
    [2, 3],
  ];
  const tangle = easeOut(seg(t, 0.4, 1.0)) * (1 - easeOut(seg(t, 1.8, 2.4)));
  const hub = easeOut(seg(t, 2.2, 2.8));
  const c = (i: number) => [sys[i].x + 60, sys[i].y + 16] as const;
  const leaves = [
    { n: 'line1/furnace1', v: '842.0', y: 70 },
    { n: 'line1/spindle1', v: '1842.0', y: 110 },
    { n: 'line2/furnace2', v: '790.0', y: 150 },
  ];
  return (
    <Svg label="one broker's topic tree mirrors the equipment hierarchy — every system publishes its state to one place, every consumer reads it from one place" h={200}>
      {pairs.map(([a, b], i) => (
        <line key={i} x1={c(a)[0]} y1={c(a)[1]} x2={c(b)[0]} y2={c(b)[1]} stroke={C.badText} strokeWidth={1.1} opacity={tangle} />
      ))}
      {sys.map((s2, i) => (
        <g key={s2.n}>
          <line x1={s2.x + 120} y1={s2.y + 16} x2={300} y2={30} stroke={C.second} strokeWidth={1.1} opacity={hub} />
          <Box x={s2.x} y={s2.y} w={120} label={s2.n} o={easeOut(seg(t, i * 0.1, 0.3 + i * 0.1))} />
        </g>
      ))}
      <g opacity={hub}>
        <T x={300} y={34} s={12} f={C.second} w={600}>
          acme/plantA/area1
        </T>
        {leaves.map((l, i) => (
          <g key={l.n} opacity={easeOut(seg(t, 2.8 + i * 0.4, 3.2 + i * 0.4))}>
            <path d={`M310 42 V${l.y - 5} H322`} fill="none" stroke={C.line} strokeWidth={1.2} />
            <T x={328} y={l.y} s={12} f={C.primary}>
              {l.n}
            </T>
            <T x={575} y={l.y} s={13} f={C.focus} a="end" w={600}>
              {l.v}
            </T>
          </g>
        ))}
      </g>
      <T x={575} y={190} s={13} f={C.second} a="end" w={600} o={easeOut(seg(t, 4.4, 4.8))}>
        one place
      </T>
    </Svg>
  );
}

// 7 · furnace1's retained slot takes 842.0, 843.0, 844.0, 845.0 in turn; each new value pushes the old one out to fade
// grey — gone. Then a durable log box slides in behind the broker and the same four values land there in a row: the
// history and replay the broker never kept.
export function RevealLimits({ t }: StepCtx) {
  const vals = ['842.0', '843.0', '844.0', '845.0'];
  const step = Math.min(3, Math.floor(seg(t, 0.4, 2.8) * 4));
  const logK = easeOut(seg(t, 3.2, 3.7));
  return (
    <Svg label="a UNS node's retained value is the current state and nothing before it — no history, no replay, so a durable log has to sit behind the broker" h={200}>
      <T x={25} y={34} s={12} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        furnace1, retained
      </T>
      <rect x={25} y={44} width={120} height={36} rx={5} fill={C.panel} stroke={C.focus} strokeWidth={1.6} opacity={easeOut(seg(t, 0, 0.3))} />
      <T x={85} y={68} s={16} f={C.focus} a="middle" w={600} o={easeOut(seg(t, 0.4, 0.6))}>
        {vals[step]}
      </T>
      {vals.slice(0, step).map((v, i) => (
        <T key={v} x={190 + i * 80} y={68} s={13} f={C.quiet} o={0.6}>
          {v}
        </T>
      ))}
      {step > 0 && <Cross x={190 + step * 80 - 18} y={62} k={0.8} />}
      <T x={190} y={100} s={12} f={C.badText} o={easeOut(seg(t, 2.6, 3.0))}>
        overwritten, gone
      </T>
      <g opacity={logK}>
        <rect x={25} y={128} width={550} height={40} rx={5} fill={C.panel} stroke={C.second} strokeWidth={1.4} />
        <T x={40} y={153} s={12} f={C.second} w={600}>
          durable log
        </T>
        {vals.map((v, i) => (
          <T key={v} x={190 + i * 95} y={153} s={13} f={C.second} o={easeOut(seg(t, 3.7 + i * 0.25, 4.0 + i * 0.25))}>
            {v}
          </T>
        ))}
      </g>
      <T x={575} y={192} s={12} f={C.second} a="end" o={easeOut(seg(t, 4.9, 5.3))}>
        history and replay live here
      </T>
    </Svg>
  );
}

// 8 · Five lanes with tiny pictures: dots with a cross for QoS 0, a doubled square for QoS 1, a stored value for
// retained, a red DEAD for the Will, a counter with a gap, and a log under the broker.
export function Recap({ t }: StepCtx) {
  const lane = (i: number) => 32 + i * 50;
  const k = (i: number) => easeOut(seg(t, i * 1.05, i * 1.05 + 0.5));
  const texts = [
    { l: 'QoS 0', r: 'loses, no dupes', c: C.badText },
    { l: 'QoS 1', r: 'no loss, dupes', c: C.second },
    { l: 'retained + Will', r: 'stale dashboard', c: C.focus },
    { l: 'seq + bdSeq', r: 'gap → rebirth', c: C.second },
    { l: 'broker', r: 'present only', c: C.focus },
  ];
  return (
    <Svg
      label="QoS's three delivery guarantees, a retained value and a Will that explain the dead-node dashboard, a real Sparkplug birth/death cycle with sequence numbers, and a broker that needs a log behind it for anything but the present"
      h={260}
    >
      <g opacity={k(0)}>
        <circle cx={35} cy={lane(0)} r={4} fill={C.focus} />
        <Cross x={60} y={lane(0)} k={1} />
        <Cross x={85} y={lane(0)} k={1} />
      </g>
      <g opacity={k(1)}>
        <rect x={28} y={lane(1) - 7} width={14} height={14} rx={2} fill={C.focus} />
        <rect x={48} y={lane(1) - 7} width={14} height={14} rx={2} fill="none" stroke={C.second} strokeWidth={1.4} />
      </g>
      <g opacity={k(2)}>
        <rect x={25} y={lane(2) - 10} width={50} height={20} rx={3} fill="none" stroke={C.focus} strokeWidth={1.2} />
        <T x={85} y={lane(2) + 4} s={11} f={C.badText} w={600}>
          DEAD
        </T>
      </g>
      <g opacity={k(3)}>
        {[0, 1, 2, null, 4].map((v, j) => (
          <rect
            key={j}
            x={25 + j * 22}
            y={lane(3) - 8}
            width={18}
            height={16}
            rx={2}
            fill="none"
            stroke={v === null ? C.badText : C.secondary}
            strokeWidth={1.1}
            strokeDasharray={v === null ? '3 2' : undefined}
          />
        ))}
      </g>
      <g opacity={k(4)}>
        <rect x={25} y={lane(4) - 12} width={50} height={10} rx={2} fill="none" stroke={C.focus} strokeWidth={1.2} />
        <rect x={25} y={lane(4) + 2} width={110} height={10} rx={2} fill="none" stroke={C.second} strokeWidth={1.2} />
      </g>
      {texts.map((x, i) => (
        <g key={i} opacity={k(i)}>
          <T x={160} y={lane(i) + 5} s={14} f={C.primary}>
            {x.l}
          </T>
          <T x={575} y={lane(i) + 5} s={14} f={x.c} a="end" w={600}>
            {x.r}
          </T>
        </g>
      ))}
    </Svg>
  );
}

// 9 · A timeline with a ten-minute outage band. Dots published during it pile up at the broker; a consumer joins at the
// end. Before the answer: "recover it all?". After it, only the last dot — the retained value — reaches the consumer;
// every other dot is crossed out: gone without a log.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const dots = [180, 230, 280, 330, 380];
  return (
    <Svg label="a consumer joins right after a ten-minute outage, with only the retained values and no durable log behind the broker — can it recover what it missed during the outage?" h={200}>
      <line x1={40} y1={110} x2={560} y2={110} stroke={C.line} strokeWidth={1.2} opacity={easeOut(seg(t, 0, 0.3))} />
      <rect x={150} y={80} width={260} height={60} rx={4} fill={C.bad} opacity={0.18 * easeOut(seg(t, 0.3, 0.7))} />
      <T x={280} y={66} s={12} f={C.badText} a="middle" o={easeOut(seg(t, 0.3, 0.7))}>
        10-minute outage
      </T>
      {dots.map((x, i) => {
        const last = i === dots.length - 1;
        return (
          <g key={x}>
            <circle cx={x} cy={110} r={5} fill={on && !last ? C.quiet : C.focus} opacity={easeOut(seg(t, 0.8 + i * 0.25, 1.1 + i * 0.25))} />
            {on && !last && <Cross x={x} y={92} k={easeOutBack(seg(s, 0.6 + i * 0.12, 0.9 + i * 0.12))} />}
          </g>
        );
      })}
      <Box x={450} y={94} w={110} label="consumer" lit o={easeOut(seg(t, 2.2, 2.6))} />
      {on && <Msg t={s} from={0.2} to={0.6} x1={380} x2={450} y={110} />}
      {!on ? (
        <T x={300} y={182} s={14} f={C.focus} a="middle" o={easeOut(seg(t, 2.6, 3.0))}>
          recover it all?
        </T>
      ) : (
        <g>
          <T x={505} y={160} s={12} f={C.focus} a="middle" o={easeOut(seg(s, 0.6, 1.0))}>
            retained only
          </T>
          <T x={280} y={182} s={14} f={C.badText} a="middle" w={600} o={easeOut(seg(s, 1.2, 1.6))}>
            the rest is gone
          </T>
        </g>
      )}
    </Svg>
  );
}
