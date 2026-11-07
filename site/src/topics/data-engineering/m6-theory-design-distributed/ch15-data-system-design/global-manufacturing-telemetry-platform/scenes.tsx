import { useEffect, useState } from 'react';
import { C, Draw, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// CHAPTER.md, topic 24: a plant box with sensors, a gateway and a local store, a WAN link, and the cloud log, hot store
// and lakehouse; the link goes dark, the gateway's buffer fills against hours times rate while the plant stays lit; on
// reconnect a throttled replay recovers smoothly against an unthrottled spike in red; a cardinality counter beside the
// hot store. examples.py: 4,000 sensors at 10 Hz is 40,000 events a second a plant, 120,000 across three plants, a
// 300,000 peak at 2.5 times; a year at 24 bytes and three copies is 272.5 TB raw, 23.3 TB at the published 16-to-1.37
// byte figure; a 4-hour outage buffers 41.5 GB and 1,728,000,000 events; the throttled catch-up peaks at 150,000 a
// second; 3 x 6 x 8 x 20 = 2,880 series, 28,800 at ten times the sensors.

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
const Box = ({ x, y, w, h = 32, label, lit = false, o = 1, dash, stroke, f, fill }: { x: number; y: number; w: number; h?: number; label: string; lit?: boolean; o?: number; dash?: string; stroke?: string; f?: string; fill?: string }) =>
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

/** A red ✕. */
const Cross = ({ x, y, k }: { x: number; y: number; k: number }) =>
  k <= 0 ? null : (
    <g stroke={C.badText} strokeWidth={2.4} opacity={k}>
      <line x1={x - 7} y1={y - 7} x2={x + 7} y2={y + 7} />
      <line x1={x + 7} y1={y - 7} x2={x - 7} y2={y + 7} />
    </g>
  );

const n0 = (v: number) => Math.round(v).toLocaleString('en-US');
const easeIn = (x: number) => x * x;

// 1 · Three plants stream into the cloud and their dashboards glow. The WAN link drops: the links go red and dashed,
// every dashboard goes dark, and the outage bar grows. On reconnect the backlog floods in as a burst, and the dashboards
// stay dark well past the moment the link came back.
export function Hook({ t }: StepCtx) {
  const down = t >= 1.0 && t < 2.6;
  const out = seg(t, 1.0, 2.6);
  const flood = seg(t, 2.6, 3.6);
  const stale = seg(t, 2.6, 4.2);
  const relit = easeOut(seg(t, 4.3, 4.6));
  const dash = t < 1.0 ? 1 : relit;
  return (
    <Svg label="a WAN outage blanks the plants, then the flood" h={270}>
      {[0, 1, 2].map((i) => {
        const y = 24 + i * 50;
        return (
          <g key={i} opacity={easeOut(seg(t, i * 0.1, 0.3 + i * 0.1))}>
            <rect x={30} y={y} width={150} height={36} rx={4} fill={C.panel} stroke={C.line} />
            <T x={42} y={y + 23} s={13} f={C.primary}>
              {`plant ${i + 1}`}
            </T>
            {[0, 1, 2].map((j) => (
              <rect key={j} x={130 + j * 14} y={y + 10 + (2 - j) * 4} width={9} height={16 - (2 - j) * 4} fill={dash > 0.5 ? C.focus : C.band} />
            ))}
            <line x1={180} y1={y + 18} x2={330} y2={90} stroke={down ? C.badText : C.line} strokeDasharray={down ? '5 4' : undefined} />
            {!down && t > 0.3 && <circle cx={lerp(180, 330, (t * 0.9 + i * 0.3) % 1)} cy={lerp(y + 18, 90, (t * 0.9 + i * 0.3) % 1)} r={3} fill={C.focus} />}
          </g>
        );
      })}
      <line x1={330} y1={90} x2={400} y2={90} stroke={down ? C.badText : C.line} strokeDasharray={down ? '5 4' : undefined} opacity={easeOut(seg(t, 0.2, 0.4))} />
      {down && <Cross x={365} y={90} k={1} />}
      <rect x={400} y={50} width={170} height={80} rx={6} fill={C.panel} stroke={flood > 0 && flood < 1 ? C.badText : C.line} strokeWidth={flood > 0 && flood < 1 ? 1.8 : 1} opacity={easeOut(seg(t, 0.2, 0.5))} />
      <T x={485} y={95} s={14} f={C.primary} a="middle" o={easeOut(seg(t, 0.2, 0.5))}>
        cloud pipeline
      </T>
      {flood > 0 &&
        flood < 1 &&
        Array.from({ length: 14 }, (_, i) => {
          const p = (flood * 3 + i / 14) % 1;
          return <rect key={i} x={lerp(330, 400, p)} y={84 + ((i * 5) % 12)} width={10} height={3} fill={C.badText} />;
        })}
      <line x1={30} y1={208} x2={570} y2={208} stroke={C.line} opacity={easeOut(seg(t, 0.4, 0.7))} />
      {out > 0 && <rect x={150} y={202} width={Math.max(0, 180 * out)} height={12} fill={C.badText} />}
      {stale > 0 && <rect x={330} y={202} width={Math.max(0, 170 * stale)} height={12} fill={C.bad} />}
      <T x={240} y={234} s={13} f={C.badText} a="middle" o={easeOut(seg(t, 1.2, 1.5))}>
        link down
      </T>
      <T x={415} y={234} s={13} f={C.badText} a="middle" o={easeOut(seg(t, 2.8, 3.1))}>
        still stale
      </T>
      <T x={30} y={186} s={13} f={C.secondary} o={easeOut(seg(t, 1.4, 1.8))}>
        every plant dark
      </T>
      <T x={570} y={186} s={13} f={C.badText} a="end" o={easeOut(seg(t, 2.8, 3.2))}>
        the backlog floods in
      </T>
    </Svg>
  );
}

// 2 · Two empty decision slots under a "?". After the answer they fill: plant-local autonomy and a throttled catch-up;
// a bigger link is struck through below them.
export function Predict1({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const a = on ? easeOut(seg(s, 0.3, 0.7)) : 0;
  const b = on ? easeOut(seg(s, 0.9, 1.3)) : 0;
  const cut = on ? easeOut(seg(s, 1.5, 1.9)) : 0;
  return (
    <Svg label="which two decisions would have kept the plants running?" h={210}>
      {[0, 1].map((i) => {
        const k = i === 0 ? a : b;
        const x = 30 + i * 280;
        return (
          <g key={i}>
            {k < 1 && <Box x={x} y={40} w={260} h={40} label="?" dash="4 3" o={easeOut(seg(t, 0.3 + i * 0.2, 0.6 + i * 0.2)) * (1 - k)} />}
            {k > 0 && <Box x={x} y={40} w={260} h={40} label={i === 0 ? 'plant-local autonomy' : 'throttled catch-up'} lit o={k} />}
          </g>
        );
      })}
      {on ? (
        <g opacity={easeOut(seg(s, 1.3, 1.6))}>
          <T x={30} y={136} s={14} f={C.quiet}>
            a bigger link
          </T>
          <T x={575} y={136} s={14} f={C.quiet} a="end">
            no help once down
          </T>
          {cut > 0 && <line x1={28} y1={131} x2={lerp(28, 150, cut)} y2={131} stroke={C.badText} strokeWidth={2} />}
        </g>
      ) : (
        <T x={300} y={136} s={14} f={C.secondary} a="middle" o={easeOut(seg(t, 1.0, 1.4))}>
          neither failure was about speed
        </T>
      )}
      <T x={300} y={186} s={13} f={on ? C.focus : C.secondary} a="middle" o={on ? easeOut(seg(s, 1.8, 2.2)) : easeOut(seg(t, 1.6, 2.0))}>
        {on ? 'a boring reconnect' : 'what did it assume was reachable?'}
      </T>
    </Svg>
  );
}

// 3 · The estimate counts up row by row: 4,000 sensors at 10 Hz is 40,000 a second a plant, 120,000 across three, a
// 300,000 peak at a shift change. A year at 24 bytes and three copies is 272 TB; the published 16-to-1.37-byte
// compression figure shrinks the bar to 23.3 TB, labelled as a reference point.
export function RevealCapacityEstimate({ t }: StepCtx) {
  const r1 = seg(t, 0.2, 0.8);
  const r2 = seg(t, 0.9, 1.4);
  const r3 = seg(t, 1.5, 2.1);
  const r4 = seg(t, 2.3, 2.9);
  const shrink = easeInOut(seg(t, 3.2, 4.0));
  const tb = lerp(272.5, 23.3, shrink);
  return (
    <Svg label="rate, peak, bytes, a year — one reference point for compression" h={240}>
      <Line2 y={30} l="4,000 sensors × 10 Hz" r={`${n0(40000 * easeOut(r1))}/s a plant`} lc={C.primary} o={easeOut(seg(t, 0, 0.3))} />
      <Line2 y={60} l="× 3 plants" r={`${n0(lerp(40000, 120000, easeOut(r2)))}/s`} lc={C.primary} o={easeOut(seg(t, 0.8, 1.0))} />
      <Line2 y={90} l="shift change × 2.5" r={`peak ${n0(lerp(120000, 300000, easeOut(r3)))}/s`} lc={C.primary} o={easeOut(seg(t, 1.4, 1.6))} />
      <Line2 y={130} l="a year, 24 B, 3 copies" r={`${tb.toFixed(1)} TB`} lc={C.primary} rc={shrink > 0 ? C.second : C.focus} o={easeOut(seg(t, 2.2, 2.4))} />
      {r4 > 0 && <rect x={30} y={140} width={Math.max(0, 540 * easeOut(r4) * (tb / 272.5))} height={10} rx={2} fill={shrink > 0 ? C.second : C.focus} />}
      {shrink > 0 && <rect x={30} y={140} width={540} height={10} rx={2} fill="none" stroke={C.line} strokeDasharray="4 3" />}
      <Line2 y={184} l="published: 16 B → 1.37 B" r="reference" lc={C.second} rc={C.second} o={easeOut(seg(t, 3.0, 3.3))} />
      <T x={30} y={214} s={13} f={C.secondary} o={easeOut(seg(t, 3.9, 4.3))}>
        a reference point, not a promise
      </T>
    </Svg>
  );
}

// 4 · The gateway's buffer fills while the outage clock runs to 4 hours; the formula rows fill in and the size counts to
// 41.5 GB. When the link returns, the buffered readings leave in order along the bottom.
export function RevealBufferSizing({ t }: StepCtx) {
  const fill = easeInOut(seg(t, 0.6, 2.6));
  const fwd = seg(t, 3.0, 4.4);
  return (
    <Svg label="outage length times rate, held durably at the edge" h={210}>
      <rect x={30} y={30} width={150} height={130} rx={6} fill={C.panel} stroke={C.line} opacity={easeOut(seg(t, 0, 0.3))} />
      <T x={105} y={24} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 0, 0.3))}>
        edge gateway
      </T>
      <rect x={60} y={44} width={90} height={104} rx={3} fill="none" stroke={C.focus} strokeDasharray="4 3" opacity={easeOut(seg(t, 0.2, 0.5))} />
      <rect x={62} y={146 - 100 * fill * (1 - 0.85 * easeIn(fwd))} width={86} height={Math.max(0, 100 * fill * (1 - 0.85 * easeIn(fwd)))} fill={C.focus} opacity={0.85} />
      <Line2 y={56} l="outage" r={`${(4 * fill).toFixed(1)} h`} lx={220} lc={C.secondary} o={easeOut(seg(t, 0.4, 0.7))} />
      <Line2 y={84} l="× rate" r="120,000/s" lx={220} lc={C.secondary} o={easeOut(seg(t, 1.0, 1.3))} />
      <Line2 y={112} l="× bytes" r="24 B" lx={220} lc={C.secondary} o={easeOut(seg(t, 1.4, 1.7))} />
      <line x1={220} y1={124} x2={575} y2={124} stroke={C.line} opacity={easeOut(seg(t, 1.8, 2.0))} />
      <Line2 y={150} l="buffer" r={`${(41.5 * fill).toFixed(1)} GB`} lx={220} lc={C.focus} o={easeOut(seg(t, 1.8, 2.0))} />
      {fwd > 0 &&
        [0, 1, 2, 3, 4, 5].map((i) => {
          const p = easeInOut(seg(fwd, i * 0.12, i * 0.12 + 0.4));
          return p > 0 && p < 1 ? <rect key={i} x={lerp(180, 560, p)} y={180} width={12} height={10} rx={2} fill={C.focus} opacity={1 - i * 0.12} /> : null;
        })}
      {fwd > 0 && <line x1={180} y1={185} x2={570} y2={185} stroke={C.line} />}
      <T x={575} y={206} s={13} f={C.secondary} a="end" o={easeOut(seg(t, 3.4, 3.8))}>
        forwarded in order
      </T>
    </Svg>
  );
}

// 5 · OPC UA and MQTT feed one gateway that translates. Two lanes leave it: safety signals on a doubled, stricter lane,
// routine readings on a thin one. Both land in the same durable log, whose cells fill, and three consumers read from it.
export function RevealProtocolDelivery({ t }: StepCtx) {
  const lanes = easeOut(seg(t, 1.2, 1.6));
  const flow = seg(t, 1.6, 4.0);
  return (
    <Svg label="a delivery level per signal, one durable log for all" h={210}>
      <Box x={30} y={30} w={110} h={30} label="OPC UA" o={easeOut(seg(t, 0, 0.3))} />
      <Box x={30} y={100} w={110} h={30} label="MQTT" o={easeOut(seg(t, 0.1, 0.4))} />
      <Draw pts={[[140, 45], [190, 72]]} t={t} from={0.4} to={0.7} stroke={C.line} w={1.2} pen={false} />
      <Draw pts={[[140, 115], [190, 88]]} t={t} from={0.4} to={0.7} stroke={C.line} w={1.2} pen={false} />
      <Box x={190} y={64} w={110} h={32} label="translate" lit={t > 0.7 && t < 1.2} o={easeOut(seg(t, 0.5, 0.8))} />
      {lanes > 0 && (
        <g opacity={lanes}>
          <line x1={300} y1={72} x2={400} y2={66} stroke={C.focus} strokeWidth={1.4} />
          <line x1={300} y1={76} x2={400} y2={70} stroke={C.focus} strokeWidth={1.4} />
          <line x1={300} y1={88} x2={400} y2={110} stroke={C.quiet} strokeWidth={1} />
          <T x={312} y={52} s={13} f={C.focus}>
            safety: stricter
          </T>
          <T x={312} y={126} s={13} f={C.secondary}>
            routine
          </T>
        </g>
      )}
      <rect x={400} y={58} width={110} height={66} rx={4} fill={C.panel} stroke={C.focus} opacity={easeOut(seg(t, 1.0, 1.3))} />
      {Array.from({ length: 10 }, (_, i) => {
        const on = flow * 10 > i;
        return <rect key={i} x={410 + (i % 5) * 19} y={68 + Math.floor(i / 5) * 24} width={14} height={18} fill={on ? (i % 3 === 0 ? C.focus : C.quiet) : C.band} opacity={easeOut(seg(t, 1.0, 1.3))} />;
      })}
      {flow > 0 && flow < 1 && (
        <g>
          <circle cx={lerp(300, 400, (flow * 4) % 1)} cy={lerp(74, 68, (flow * 4) % 1)} r={4} fill={C.focus} />
          <circle cx={lerp(300, 400, (flow * 4 + 0.5) % 1)} cy={lerp(88, 110, (flow * 4 + 0.5) % 1)} r={3} fill={C.quiet} />
        </g>
      )}
      {[0, 1, 2].map((i) => (
        <g key={i} opacity={easeOut(seg(t, 2.6 + i * 0.15, 2.9 + i * 0.15))}>
          <line x1={510} y1={91} x2={556} y2={60 + i * 31} stroke={C.line} />
          <circle cx={562} cy={60 + i * 31} r={7} fill={C.panel} stroke={C.primary} />
        </g>
      ))}
      <T x={30} y={188} s={13} f={C.secondary} o={easeOut(seg(t, 3.4, 3.8))}>
        one durable log: plants decoupled from consumers
      </T>
    </Svg>
  );
}

// 6 · The series count multiplies out, 3 × 6 × 8 × 20 = 2,880, and fills the hot store's cardinality bar toward its
// limit; the lakehouse beside it just holds years. A reading then gets its plant-line-machine tag either at ingest or
// at read.
export function RevealHotVsLakehouse({ t }: StepCtx) {
  const card = easeInOut(seg(t, 0.6, 1.8));
  const early = easeInOut(seg(t, 2.6, 3.3));
  const late = easeInOut(seg(t, 3.5, 4.2));
  const FAC = ['3 plants', '6 lines', '8 machines', '20 sensors'];
  return (
    <Svg label="recent and fast, historical and cheap, a join priced two ways" h={240}>
      <T x={30} y={24} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.4))}>
        {FAC.join(' × ')}
      </T>
      <rect x={30} y={40} width={260} height={70} rx={6} fill={C.panel} stroke={C.focus} opacity={easeOut(seg(t, 0.2, 0.5))} />
      <T x={44} y={62} s={14} f={C.focus} o={easeOut(seg(t, 0.2, 0.5))}>
        hot store · seconds old
      </T>
      <rect x={44} y={80} width={200} height={12} rx={2} fill={C.band} opacity={easeOut(seg(t, 0.4, 0.6))} />
      <rect x={44} y={80} width={Math.max(0, 200 * 0.3 * card)} height={12} rx={2} fill={C.focus} />
      <line x1={244} y1={74} x2={244} y2={98} stroke={C.second} strokeWidth={2} opacity={easeOut(seg(t, 0.6, 0.9))} />
      <T x={244} y={106} s={13} f={C.second} a="middle" o={easeOut(seg(t, 0.6, 0.9))}>
        limit
      </T>
      <rect x={310} y={40} width={260} height={70} rx={6} fill={C.panel} stroke={C.line} opacity={easeOut(seg(t, 1.0, 1.3))} />
      <T x={324} y={62} s={14} f={C.primary} o={easeOut(seg(t, 1.0, 1.3))}>
        lakehouse · years
      </T>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((j) => (
        <rect key={j} x={324 + j * 28} y={80} width={22} height={12} fill={C.quiet} opacity={easeOut(seg(t, 1.2 + j * 0.05, 1.4 + j * 0.05))} />
      ))}
      <Line2 y={136} l="series" r={n0(2880 * card)} lc={C.secondary} o={easeOut(seg(t, 0.6, 0.9))} />
      <Line2 y={176} l="join early" r="at ingest" lc={C.primary} o={easeOut(seg(t, 2.4, 2.7))} />
      <Line2 y={214} l="join late" r="at read" lc={C.primary} rc={C.second} o={easeOut(seg(t, 3.3, 3.6))} />
      {early > 0 && (
        <g>
          <rect x={lerp(150, 330, early)} y={164} width={50} height={14} rx={2} fill={C.panel} stroke={C.primary} />
          {early > 0.3 && <rect x={lerp(150, 330, early) + 54} y={164} width={60} height={14} rx={2} fill={C.focus} opacity={easeOut(seg(early, 0.3, 0.5))} />}
        </g>
      )}
      {late > 0 && (
        <g>
          <rect x={lerp(150, 330, late)} y={202} width={50} height={14} rx={2} fill={C.panel} stroke={C.primary} />
          {late > 0.85 && <rect x={lerp(150, 330, late) + 54} y={202} width={60} height={14} rx={2} fill={C.second} opacity={easeOut(seg(late, 0.85, 1))} />}
        </g>
      )}
    </Svg>
  );
}

// 7 · The plant runs its own broker, store and alert rules; the link to the cloud is cut and all three stay lit. Two
// recovery bars name a tight target for the safety alarm and a looser one for the quality metric. Then the link
// returns, but only an aggregate crosses it.
export function RevealPlantAutonomy({ t }: StepCtx) {
  const cut = t >= 0.8 && t < 3.2;
  const rec = easeInOut(seg(t, 1.6, 2.4));
  const agg = seg(t, 3.4, 4.4);
  const LOC = ['local broker', 'short-retention store', 'local alert rules'];
  return (
    <Svg label="local broker, local store, local alarms, and data that stays put" h={240}>
      <rect x={30} y={20} width={290} height={140} rx={6} fill="none" stroke={C.line} opacity={easeOut(seg(t, 0, 0.3))} />
      <T x={42} y={40} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        plant
      </T>
      {LOC.map((l, i) => (
        <Box key={l} x={46} y={50 + i * 34} w={258} h={28} label={l} lit={cut} o={easeOut(seg(t, 0.1 + i * 0.1, 0.4 + i * 0.1))} />
      ))}
      <line x1={320} y1={90} x2={470} y2={90} stroke={cut ? C.badText : C.line} strokeDasharray={cut ? '5 4' : undefined} opacity={easeOut(seg(t, 0.3, 0.5))} />
      {cut && <Cross x={395} y={90} k={easeOut(seg(t, 0.8, 1.0))} />}
      <Box x={470} y={74} w={100} h={32} label="cloud" o={easeOut(seg(t, 0.3, 0.5))} />
      {agg > 0 && agg < 1 && <Box x={lerp(320, 370, agg)} y={56} w={100} h={24} label="aggregate" lit />}
      <T x={575} y={140} s={13} f={C.second} a="end" o={easeOut(seg(t, 3.6, 4.0))}>
        raw data stays local
      </T>
      <T x={30} y={190} s={13} f={C.primary} o={easeOut(seg(t, 1.5, 1.8))}>
        safety alarm
      </T>
      <rect x={200} y={181} width={Math.max(0, 60 * rec)} height={10} rx={2} fill={C.focus} />
      <T x={575} y={190} s={13} f={C.focus} a="end" o={rec}>
        tight
      </T>
      <T x={30} y={220} s={13} f={C.primary} o={easeOut(seg(t, 1.7, 2.0))}>
        quality metric
      </T>
      <rect x={200} y={211} width={Math.max(0, 240 * rec)} height={10} rx={2} fill={C.quiet} />
      <T x={575} y={220} s={13} f={C.secondary} a="end" o={rec}>
        looser
      </T>
    </Svg>
  );
}

// 8 · Platform load after reconnect. The unthrottled replay spikes off the top in red, the whole backlog at once. The
// throttled replay holds a plateau of 150,000 a second over the normal 120,000 while the 1.728-billion-event backlog
// drains to zero through the same idempotent ingest.
export function RevealThrottledCatchUp({ t }: StepCtx) {
  const Y = (r: number) => 160 - (r / 300000) * 120;
  const spike = easeOut(seg(t, 0.6, 1.0));
  const fade = easeOut(seg(t, 1.6, 2.0));
  const thr = seg(t, 2.0, 3.8);
  const XR = 90;
  const XE = 470;
  const thrPts: [number, number][] = [
    [30, Y(120000)],
    [XR, Y(120000)],
    [XR, Y(150000)],
    [XE, Y(150000)],
    [XE, Y(120000)],
    [570, Y(120000)],
  ];
  const upTo = 30 + thr * 540;
  const vis = thrPts.filter(([x]) => x <= upTo);
  const last = vis[vis.length - 1];
  const nextI = vis.length < thrPts.length ? thrPts[vis.length] : null;
  const tip: [number, number] = nextI && last ? [Math.min(upTo, nextI[0]), nextI[0] === last[0] ? nextI[1] : last[1]] : last;
  const left = thr <= 0 ? 1 : Math.max(0, 1 - (upTo - XR) / (XE - XR));
  return (
    <Svg label="the backlog replays, capped, through the same idempotent ingest" h={210}>
      <line x1={30} y1={160} x2={570} y2={160} stroke={C.line} opacity={easeOut(seg(t, 0, 0.3))} />
      <line x1={30} y1={Y(120000)} x2={570} y2={Y(120000)} stroke={C.line} strokeDasharray="4 3" opacity={easeOut(seg(t, 0, 0.3))} />
      <T x={575} y={Y(120000) + 16} s={13} f={C.secondary} a="end" o={easeOut(seg(t, 0, 0.3))}>
        normal 120,000/s
      </T>
      {spike > 0 && (
        <g opacity={1 - fade * 0.7}>
          <path d={`M${XR - 8} ${Y(120000)} L${XR} ${lerp(Y(120000), 14, spike)} L${XR + 8} ${Y(120000)}`} fill={C.bad} stroke={C.badText} strokeWidth={1.6} />
          <T x={XR + 16} y={30} s={13} f={C.badText} o={spike}>
            unthrottled: the whole backlog at once
          </T>
        </g>
      )}
      {thr > 0 && <polyline points={[...vis, tip].map(([x, y]) => `${x},${y}`).join(' ')} fill="none" stroke={C.focus} strokeWidth={2} />}
      <T x={XR + 10} y={Y(150000) - 8} s={13} f={C.focus} o={easeOut(seg(t, 2.3, 2.6))}>
        throttled 150,000/s
      </T>
      <T x={30} y={196} s={13} f={C.secondary} o={easeOut(seg(t, 2.0, 2.3))}>
        same idempotent ingest
      </T>
      <T x={575} y={196} s={14} f={C.focus} a="end" o={easeOut(seg(t, 2.0, 2.3))}>
        {`backlog ${n0(1728000000 * left)}`}
      </T>
    </Svg>
  );
}

// 9 · Six rows, each with the glyph of the move it names.
export function Recap({ t }: StepCtx) {
  const ROWS: [string, string, string?][] = [
    ['estimate', 'a cited reference', C.second],
    ['edge buffer', 'outage × rate'],
    ['one durable log', 'delivery per signal'],
    ['hot vs lakehouse', 'split by query'],
    ['plant autonomy', 'a degraded mode'],
    ['catch-up', 'throttled, idempotent'],
  ];
  return (
    <Svg label="an estimate, a buffer, a delivery choice, autonomy, a throttle" h={290}>
      {ROWS.map(([l, r, c], i) => {
        const y = 34 + i * 47;
        const at = i * 0.55;
        return (
          <g key={l} opacity={easeOut(seg(t, at, at + 0.4))}>
            {i === 0 && (
              <g>
                <rect x={30} y={y - 16} width={78} height={6} fill="none" stroke={C.line} strokeDasharray="3 2" />
                <rect x={30} y={y - 6} width={20} height={6} fill={C.second} />
              </g>
            )}
            {i === 1 && (
              <g>
                <rect x={50} y={y - 20} width={30} height={22} rx={2} fill="none" stroke={C.focus} />
                <rect x={52} y={y - 10} width={26} height={10} fill={C.focus} />
              </g>
            )}
            {i === 2 && [0, 1, 2, 3, 4].map((j) => <rect key={j} x={30 + j * 16} y={y - 14} width={12} height={14} fill={j < 3 ? C.focus : C.band} />)}
            {i === 3 && (
              <g>
                <rect x={30} y={y - 16} width={34} height={16} rx={2} fill="none" stroke={C.focus} />
                <rect x={70} y={y - 16} width={38} height={16} rx={2} fill="none" stroke={C.line} />
              </g>
            )}
            {i === 4 && (
              <g>
                <rect x={30} y={y - 18} width={44} height={20} rx={2} fill="none" stroke={C.focus} />
                <line x1={74} y1={y - 8} x2={108} y2={y - 8} stroke={C.badText} strokeDasharray="3 2" />
              </g>
            )}
            {i === 5 && <path d={`M30 ${y - 4} L44 ${y - 4} L44 ${y - 12} L94 ${y - 12} L94 ${y - 4} L108 ${y - 4}`} fill="none" stroke={C.focus} strokeWidth={1.6} />}
            <Line2 y={y} l={l} r={r} lx={125} lc={C.primary} rc={c ?? C.focus} o={easeOut(seg(t, at + 0.2, at + 0.5))} />
          </g>
        );
      })}
    </Svg>
  );
}

// 10 · Ten times the sensors. The WAN keeps buffering fine; the hot store's series count climbs from 2,880 to 28,800
// and its bar runs past the limit line. After the answer that row is boxed as the next bottleneck and "a bigger link"
// is struck.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const g = easeInOut(seg(t, 0.6, 2.4));
  const k = Math.round(lerp(1, 10, g));
  const series = lerp(2880, 28800, g);
  const box = on ? easeOut(seg(s, 0.3, 0.8)) : 0;
  const cut = on ? easeOut(seg(s, 1.0, 1.4)) : 0;
  const LIM = 340;
  const bw = (series / 28800) * 380;
  return (
    <Svg label="ten times the sensors; what actually moves?" h={250}>
      <Line2 y={34} l="sensors" r={`×${k}`} lc={C.primary} o={easeOut(seg(t, 0, 0.4))} />
      <Line2 y={82} l="WAN, buffered" r="still fine" lc={C.primary} o={easeOut(seg(t, 0.2, 0.6))} />
      <Line2 y={130} l="hot-store series" r={n0(series)} lc={C.primary} rc={bw > LIM - 30 ? C.badText : C.focus} o={easeOut(seg(t, 0.4, 0.8))} />
      <rect x={30} y={142} width={Math.max(0, Math.min(bw, LIM - 30))} height={12} rx={2} fill={C.focus} opacity={easeOut(seg(t, 0.4, 0.8))} />
      {bw > LIM - 30 && <rect x={LIM} y={142} width={bw - (LIM - 30)} height={12} rx={2} fill={C.badText} />}
      <line x1={LIM} y1={136} x2={LIM} y2={162} stroke={C.second} strokeWidth={2} opacity={easeOut(seg(t, 0.6, 0.9))} />
      <T x={LIM} y={180} s={13} f={C.second} a="middle" o={easeOut(seg(t, 0.6, 0.9))}>
        label limit
      </T>
      {box > 0 && <rect x={20} y={110} width={560} height={80} rx={6} fill="none" stroke={C.focus} strokeWidth={1.8} opacity={box} />}
      {on ? (
        <g>
          <T x={30} y={226} s={14} f={C.focus} o={box}>
            next bottleneck
          </T>
          <T x={575} y={226} s={13} f={C.secondary} a="end" o={cut}>
            a bigger link
          </T>
          {cut > 0 && <line x1={455} y1={221} x2={lerp(455, 577, cut)} y2={221} stroke={C.badText} strokeWidth={2} />}
        </g>
      ) : (
        <T x={300} y={226} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 2.0, 2.4))}>
          what grows with the sensor count?
        </T>
      )}
    </Svg>
  );
}
