import { useEffect, useState } from 'react';
import { C, Draw, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// IT/OT boundary: requests flooding a PLC until its scan stretches, the network zones with a DMZ crossing, a read
// meter against the 500/s budget, readers swung to the historian, a buffer that drops its oldest, owners and aliases.

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

/** Quadratic ease-in. */
const easeIn = (x: number) => x * x;

/** A red ✕. */
const Cross = ({ x, y, k }: { x: number; y: number; k: number }) =>
  k <= 0 ? null : (
    <g stroke={C.badText} strokeWidth={2.4} opacity={k}>
      <line x1={x - 6} y1={y - 6} x2={x + 6} y2={y + 6} />
      <line x1={x + 6} y1={y - 6} x2={x - 6} y2={y + 6} />
    </g>
  );

/** A whole number counted up by k, with thousands separators. */
const n0 = (v: number, k: number) => Math.round(v * k).toLocaleString('en-US');

// The PLC's read meter: 0–3,000 requests a second across x 60..540, with its 500/s budget as a post.
const mx = (v: number) => 60 + v * (480 / 3000);
const CAP = 500;

/** The read budget post and the track behind a load bar. */
function Budget({ y, o }: { y: number; o: number }) {
  return o <= 0 ? null : (
    <g opacity={o}>
      <rect x={60} y={y} width={480} height={22} fill={C.band} />
      <line x1={mx(CAP)} y1={y - 12} x2={mx(CAP)} y2={y + 34} stroke={C.focus} strokeWidth={2} />
      <T x={mx(CAP)} y={y + 46} s={12} f={C.focus} a="middle">
        budget 500/s
      </T>
    </g>
  );
}

/** A load bar: white up to the budget, red past it. */
const Load = ({ y, v }: { y: number; v: number }) => (
  <g>
    <rect x={60} y={y} width={mx(Math.min(v, CAP)) - 60} height={22} fill={C.primary} />
    {v > CAP && <rect x={mx(CAP)} y={y} width={mx(v) - mx(CAP)} height={22} fill={C.badText} />}
  </g>
);

// 1 · A script fires requests at the PLC, faster and faster. The PLC's scan bar stretches past its normal mark and turns
// red; the conveyor beneath stops and faults. Not one arrow ever points back at the PLC to write.
export function Hook({ t }: StepCtx) {
  const rate = easeIn(seg(t, 0.4, 2.6));
  const stretch = easeOut(seg(t, 1.6, 3.0));
  const stop = seg(t, 3.0, 3.2) >= 1;
  const belt = stop ? 3.0 : t;
  const dots = Math.floor(lerp(2, 14, rate));
  return (
    <Svg label="an analyst polls three thousand tags once a second against a PLC; the scan time stretches and a conveyor faults, with nothing ever written to the PLC" h={200}>
      <Box x={30} y={30} w={120} h={36} label="script" o={easeOut(seg(t, 0, 0.3))} />
      <Box x={380} y={30} w={140} h={36} label="PLC" o={easeOut(seg(t, 0, 0.3))} />
      {rate > 0 &&
        Array.from({ length: dots }, (_, i) => {
          const p = (t * (0.6 + rate * 2.4) + i / dots) % 1;
          return <circle key={i} cx={lerp(156, 374, p)} cy={48} r={3} fill={C.secondary} />;
        })}
      <T x={265} y={22} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 0.4, 0.8))}>
        read, read, read
      </T>
      <g opacity={easeOut(seg(t, 0.6, 1.0))}>
        <T x={380} y={92} s={12} f={C.quiet}>
          scan time
        </T>
        <rect x={380} y={100} width={lerp(60, 160, stretch)} height={10} fill={stretch > 0.5 ? C.badText : C.primary} />
        <line x1={440} y1={96} x2={440} y2={114} stroke={C.focus} strokeWidth={1.4} />
      </g>
      <g opacity={easeOut(seg(t, 0.2, 0.5))}>
        <line x1={60} y1={168} x2={540} y2={168} stroke={C.line} strokeWidth={2} />
        {Array.from({ length: 7 }, (_, i) => {
          const x = 60 + ((i * 72 + belt * 40) % 480);
          return <rect key={i} x={x} y={150} width={18} height={18} rx={2} fill={stop ? C.quiet : C.primary} />;
        })}
      </g>
      <Cross x={300} y={140} k={easeOutBack(seg(t, 3.2, 3.6))} />
      <T x={316} y={145} s={13} f={C.badText} o={easeOut(seg(t, 3.3, 3.7))}>
        conveyor fault
      </T>
      <T x={30} y={196} s={13} f={C.focus} o={easeOut(seg(t, 4.0, 4.5))}>
        nothing was written
      </T>
    </Svg>
  );
}

// 2 · The levels stack as bands from the office down to the floor, and a DMZ band slides in between them. A data path
// draws up from the floor, pauses at the DMZ — the crossing — and continues up.
const ZONES: [string, number, number, boolean][] = [
  ['enterprise', 16, 34, false],
  ['DMZ', 58, 26, true],
  ['operations', 92, 34, false],
  ['control', 134, 46, false],
];
export function RevealSegmentation({ t }: StepCtx) {
  const gate = easeOutBack(seg(t, 2.6, 3.0));
  return (
    <Svg label="the Purdue and ISA-95 levels drawn as zones with a DMZ band enforcing the boundary between the corporate network and the one running the floor" h={200}>
      {ZONES.map(([l, y, h, dmz], i) => {
        const k = easeOut(seg(t, dmz ? 1.0 : 0.1 + i * 0.25, dmz ? 1.5 : 0.5 + i * 0.25));
        return k <= 0 ? null : (
          <g key={l} opacity={k} transform={dmz ? `translate(${lerp(-40, 0, k)} 0)` : undefined}>
            <rect x={30} y={y} width={540} height={h} rx={4} fill={dmz ? 'none' : C.band} stroke={dmz ? C.focus : C.line} strokeWidth={dmz ? 1.6 : 1} strokeDasharray={dmz ? '6 4' : undefined} />
            <T x={44} y={y + h / 2 + 5} s={13} f={dmz ? C.focus : C.secondary}>
              {l}
            </T>
          </g>
        );
      })}
      <Draw
        pts={[
          [460, 172],
          [460, 92],
        ]}
        t={t}
        from={1.8}
        to={2.5}
        stroke={C.second}
        w={2}
      />
      <Draw
        pts={[
          [460, 92],
          [460, 22],
        ]}
        t={t}
        from={3.2}
        to={3.8}
        stroke={C.second}
        w={2}
      />
      {gate > 0 && <rect x={448} y={62} width={24} height={18} rx={3} fill={C.panel} stroke={C.focus} strokeWidth={1.6} opacity={Math.min(1, gate)} />}
      <T x={430} y={76} s={13} f={C.focus} a="end" o={easeOut(seg(t, 2.8, 3.2))}>
        a chosen crossing
      </T>
      <T x={475} y={160} s={13} f={C.second} o={easeOut(seg(t, 1.8, 2.2))}>
        data path
      </T>
    </Svg>
  );
}

// 3 · Script → PLC: a read arrow, and a write arrow that is crossed out. The PLC's scan ring turns. After the answer
// the ring's slice for answering reads grows red, eating into the slice left for control logic.
export function PredictReadOnly({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const eat = on ? easeInOut(seg(s, 0.2, 1.4)) : 0;
  const frac = lerp(0.08, 0.55, eat);
  const cx = 440;
  const cy = 100;
  const r = 50;
  const arc = (a0: number, a1: number) => {
    const p = (a: number) => [cx + r * Math.sin(a * 2 * Math.PI), cy - r * Math.cos(a * 2 * Math.PI)];
    const [x0, y0] = p(a0);
    const [x1, y1] = p(a1);
    return `M${cx} ${cy} L${x0} ${y0} A${r} ${r} 0 ${a1 - a0 > 0.5 ? 1 : 0} 1 ${x1} ${y1} Z`;
  };
  const spin = (on ? 3 + s : t) * 0.5;
  return (
    <Svg label="a script that never writes a value to the PLC — can a read that never writes still disturb the process it reads from?" h={200}>
      <Box x={30} y={60} w={120} h={36} label="script" o={easeOut(seg(t, 0, 0.3))} />
      <Draw
        pts={[
          [150, 70],
          [370, 70],
        ]}
        t={t}
        from={0.3}
        to={0.9}
        stroke={C.secondary}
        w={1.6}
        pen={false}
      />
      <T x={260} y={62} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 0.6, 0.9))}>
        read
      </T>
      <line x1={370} y1={118} x2={150} y2={118} stroke={C.line} strokeDasharray="4 3" opacity={easeOut(seg(t, 1.0, 1.3))} />
      <T x={260} y={140} s={13} f={C.quiet} a="middle" o={easeOut(seg(t, 1.0, 1.3))}>
        write
      </T>
      <Cross x={260} y={118} k={easeOutBack(seg(t, 1.3, 1.6))} />
      <g opacity={easeOut(seg(t, 0.2, 0.6))}>
        <circle cx={cx} cy={cy} r={r} fill={C.band} stroke={C.line} />
        <path d={arc(0, 1 - frac - 0.001)} fill={C.primary} opacity={0.85} />
        <path d={arc(1 - frac, 0.999)} fill={C.badText} />
        <line x1={cx} y1={cy} x2={cx + (r + 8) * Math.sin(spin * 2 * Math.PI)} y2={cy - (r + 8) * Math.cos(spin * 2 * Math.PI)} stroke={C.focus} strokeWidth={2} />
        <T x={cx} y={40} s={13} f={C.secondary} a="middle">
          PLC scan
        </T>
      </g>
      {!on ? (
        <T x={300} y={186} s={14} f={C.secondary} a="middle" o={easeOut(seg(t, 2.0, 2.4))}>
          disturbed?
        </T>
      ) : (
        <g opacity={easeOut(seg(s, 0.6, 1.0))}>
          <T x={30} y={186} s={13} f={C.primary}>
            control logic
          </T>
          <T x={230} y={186} s={13} f={C.badText}>
            answering reads
          </T>
        </g>
      )}
    </Svg>
  );
}

// 4 · The read meter: the 500/s budget post goes up, then the polling bar races to 3,000/s — white to the post, red
// past it — and a "6×" lands.
export function RevealLoadBudget({ t }: StepCtx) {
  const k = easeInOut(seg(t, 0.8, 2.4));
  return (
    <Svg label="polling three thousand tags once a second against a PLC rated for five hundred requests a second is six times the budget, before a value has even changed" h={200}>
      <T x={60} y={40} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        3,000 tags × once a second
      </T>
      <Budget y={64} o={easeOut(seg(t, 0.2, 0.6))} />
      {k > 0 && <Load y={64} v={3000 * k} />}
      <T x={540} y={56} s={15} f={C.badText} a="end" o={easeOut(seg(t, 2.0, 2.4))}>
        {`${n0(3000, k)}/s`}
      </T>
      <T x={300} y={170} s={26} f={C.badText} a="middle" o={easeOutBack(seg(t, 2.6, 3.1))}>
        6×
      </T>
      <T x={300} y={194} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 3.2, 3.6))}>
        before any value changed
      </T>
    </Svg>
  );
}

// 5 · The polling bar stays as a dashed ghost at 3,000. The subscription bar builds from its three tag groups — 2,800
// slow tags (140/s), 150 medium (300/s), 50 fast (1,000/s) — and stops at 1,440: smaller, still past the post.
const GROUPS: [number, string][] = [
  [140, 'slow'],
  [300, 'medium'],
  [1000, 'fast'],
];
export function RevealSubscription({ t }: StepCtx) {
  let acc = 0;
  return (
    <Svg label="a change-of-value subscription over the same tag mix cuts the load sharply, and it is still over this plant's own tight budget" h={200}>
      <Budget y={64} o={easeOut(seg(t, 0, 0.3))} />
      <rect x={60} y={64} width={480} height={22} fill="none" stroke={C.secondary} strokeDasharray="5 3" opacity={easeOut(seg(t, 0, 0.3)) * 0.8} />
      <T x={540} y={56} s={13} f={C.quiet} a="end" o={easeOut(seg(t, 0.2, 0.5))}>
        polling: 3,000/s
      </T>
      {GROUPS.map(([v, l], i) => {
        const k = easeInOut(seg(t, 0.6 + i * 0.7, 1.2 + i * 0.7));
        const x0 = mx(acc);
        acc += v;
        const x1 = mx(acc - v + v * k);
        const over = acc > CAP;
        return k <= 0 ? null : (
          <g key={l}>
            <rect x={x0} y={64} width={x1 - x0} height={22} fill={over && i === 2 ? C.badText : C.primary} stroke={C.ink} strokeWidth={1} />
          </g>
        );
      })}
      <T x={60} y={134} s={12} f={C.secondary} o={easeOut(seg(t, 2.4, 2.8))}>
        slow 140 + medium 300 + fast 1,000
      </T>
      <T x={60} y={164} s={14} f={C.secondary} o={easeOut(seg(t, 2.8, 3.2))}>
        subscription
      </T>
      <T x={540} y={164} s={16} f={C.badText} a="end" o={easeOut(seg(t, 2.8, 3.2))}>
        1,440/s
      </T>
      <T x={300} y={194} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.4, 3.9))}>
        less than half, still over budget
      </T>
    </Svg>
  );
}

// 6 · Requests that were flowing into the PLC swing over to the historian, which already keeps its own archive from a
// single feed. The PLC's meter drains to 0/s, the whole 500/s budget left untouched.
export function RevealHistorianReplica({ t }: StepCtx) {
  const swing = easeInOut(seg(t, 1.0, 2.0));
  const drain = easeInOut(seg(t, 2.0, 3.0));
  return (
    <Svg label="the same tags read from a historian or a replica instead of the PLC — the load on the PLC drops to the full budget, untouched" h={200}>
      <Box x={30} y={20} w={120} h={34} label="readers" o={easeOut(seg(t, 0, 0.3))} />
      <Box x={420} y={20} w={140} h={34} label="PLC" o={easeOut(seg(t, 0, 0.3))} />
      <Box x={420} y={92} w={140} h={34} label="historian" lit={swing > 0.5} o={easeOut(seg(t, 0.2, 0.5))} />
      <line x1={490} y1={54} x2={490} y2={92} stroke={C.line} strokeWidth={1.4} opacity={easeOut(seg(t, 0.3, 0.6))} />
      <T x={500} y={78} s={12} f={C.quiet} o={easeOut(seg(t, 0.3, 0.6))}>
        one feed
      </T>
      {Array.from({ length: 6 }, (_, i) => {
        const p = (t * 0.9 + i / 6) % 1;
        const ty = lerp(37, 109, swing);
        const y = lerp(37, ty, Math.min(1, p * 1.4));
        return <circle key={i} cx={lerp(156, 414, p)} cy={y} r={3} fill={swing > 0.5 ? C.second : C.secondary} />;
      })}
      <Budget y={150} o={easeOut(seg(t, 0.4, 0.8))} />
      <Load y={150} v={lerp(3000, 0, drain)} />
      <T x={30} y={144} s={12} f={C.quiet} o={easeOut(seg(t, 0.4, 0.8))}>
        PLC load
      </T>
      <T x={540} y={144} s={14} f={drain >= 1 ? C.focus : C.badText} a="end" o={easeOut(seg(t, 0.4, 0.8))}>
        {`${n0(lerp(3000, 0, drain), 1)}/s`}
      </T>
    </Svg>
  );
}

// 7 · A producer pushes into a 100-slot buffer (ten cells of ten) whose consumer has stalled (✕). It fills; after that
// every push shoves the oldest cell out of the left end. Pushes count to 250, drops to 150, and the producer's
// "waited" counter never leaves 0.
export function RevealBuffer({ t }: StepCtx) {
  const pushes = Math.floor(250 * easeInOut(seg(t, 0.6, 3.6)));
  const filled = Math.min(100, pushes);
  const dropped = Math.max(0, pushes - 100);
  const shift = dropped > 0 ? ((pushes % 10) / 10) * 26 : 0;
  return (
    <Svg label="a bounded buffer between the extractor and a stalled consumer drops its own oldest item once full, so the producer side never stalls" h={200}>
      <Box x={470} y={40} w={100} h={34} label="producer" o={easeOut(seg(t, 0, 0.3))} />
      <Box x={30} y={40} w={100} h={34} label="consumer" o={easeOut(seg(t, 0, 0.3))} />
      <Cross x={80} y={92} k={easeOutBack(seg(t, 0.3, 0.6))} />
      <T x={94} y={97} s={12} f={C.badText} o={easeOut(seg(t, 0.4, 0.7))}>
        stalled
      </T>
      <rect x={168} y={40} width={264} height={34} rx={3} fill="none" stroke={C.line} opacity={easeOut(seg(t, 0, 0.3))} />
      {Array.from({ length: Math.ceil(filled / 10) }, (_, i) => {
        const part = dropped === 0 && i === Math.ceil(filled / 10) - 1 && filled % 10 ? (filled % 10) / 10 : 1;
        const x = 172 + i * 26 - shift;
        const lead = dropped > 0 && i === 0;
        return <rect key={i} x={x} y={70 - 26 * part} width={22} height={26 * part} rx={2} fill={lead ? C.badText : C.primary} opacity={lead ? Math.max(0, 1 - shift / 26) : 1} />;
      })}
      {dropped > 0 && shift > 0 && <rect x={432 - shift} y={70 - 26 * (shift / 26)} width={22} height={26 * (shift / 26)} rx={2} fill={C.primary} />}
      <T x={300} y={30} s={12} f={C.quiet} a="middle" o={easeOut(seg(t, 0.2, 0.5))}>
        100 slots
      </T>
      <T x={30} y={138} s={14} f={C.secondary} o={easeOut(seg(t, 0.6, 0.9))}>
        pushed
      </T>
      <T x={250} y={138} s={15} f={C.primary} a="end" o={easeOut(seg(t, 0.6, 0.9))}>
        {String(pushes)}
      </T>
      <T x={330} y={138} s={14} f={C.secondary} o={easeOut(seg(t, 1.8, 2.1))}>
        oldest dropped
      </T>
      <T x={575} y={138} s={15} f={C.badText} a="end" o={easeOut(seg(t, 1.8, 2.1))}>
        {String(dropped)}
      </T>
      <T x={30} y={180} s={14} f={C.secondary} o={easeOut(seg(t, 2.6, 3.0))}>
        producer waited
      </T>
      <T x={250} y={180} s={15} f={C.focus} a="end" o={easeOut(seg(t, 2.6, 3.0))}>
        0
      </T>
      <Tick x={272} y={174} k={easeOut(seg(t, 3.8, 4.2))} />
    </Svg>
  );
}

// 8 · Three operational copies (PLC tag, historian, MES record) gather under "plant engineering"; the lakehouse row sits
// under "data platform". Then the good-count definition chip rides into the lakehouse — and its owner line stretches
// back to plant engineering instead of switching.
export function RevealOwnership({ t }: StepCtx) {
  const ride = easeInOut(seg(t, 2.8, 3.6));
  const tie = easeOut(seg(t, 3.6, 4.2));
  return (
    <Svg label="operational copies and the analytical copy each have an owner; a field's definition keeps the operational side's owner even in the analytical copy" h={220}>
      <T x={30} y={24} s={13} f={C.focus} o={easeOut(seg(t, 0, 0.3))}>
        plant engineering
      </T>
      {['PLC tag', 'historian', 'MES record'].map((l, i) => (
        <Box key={l} x={30} y={40 + i * 42} w={170} h={32} label={l} o={easeOutBack(seg(t, 0.3 + i * 0.3, 0.7 + i * 0.3))} />
      ))}
      <T x={570} y={24} s={13} f={C.second} a="end" o={easeOut(seg(t, 1.3, 1.6))}>
        data platform
      </T>
      <Box x={380} y={40} w={190} h={32} label="lakehouse row" stroke={C.second} f={C.second} o={easeOutBack(seg(t, 1.4, 1.8))} />
      <g opacity={easeOut(seg(t, 2.4, 2.8))} transform={`translate(${lerp(0, 160, ride)} ${lerp(0, -76, ride)})`}>
        <rect x={210} y={160} width={190} height={28} rx={14} fill={C.panel} stroke={C.focus} />
        <T x={305} y={179} s={13} f={C.focus} a="middle">
          good count, defined
        </T>
      </g>
      {tie > 0 && <path d={`M370 98 C 320 ${98 + 32 * tie}, 280 ${20 + 6 * tie}, 244 20`} fill="none" stroke={C.focus} strokeWidth={1.4} strokeDasharray="4 3" opacity={tie} />}
      <T x={570} y={146} s={13} f={C.focus} a="end" o={easeOut(seg(t, 4.0, 4.4))}>
        bytes move, meaning stays
      </T>
    </Svg>
  );
}

// 9 · Two readings on a timeline: 41.8 under T3_thickness_raw, then a firmware rename, then 42.1 under
// coating_thickness_um. The naive reader (old name only) catches the first and ✕ the second; the contract reader
// (name + alias) ticks both.
export function RevealRename({ t }: StepCtx) {
  const rn = easeOut(seg(t, 1.0, 1.4));
  return (
    <Svg label="a tag renamed after a firmware re-scale: a reader keyed only on the new name misses the old readings, an alias-contract reader catches both" h={200}>
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <rect x={175} y={14} width={160} height={56} rx={4} fill={C.panel} stroke={C.line} />
        <T x={255} y={34} s={12} f={C.secondary} a="middle">
          T3_thickness_raw
        </T>
        <T x={255} y={60} s={14} f={C.primary} a="middle">
          41.8
        </T>
      </g>
      <line x1={354} y1={8} x2={355} y2={180} stroke={C.focus} strokeDasharray="5 4" opacity={rn} />
      <g opacity={easeOut(seg(t, 1.3, 1.7))}>
        <rect x={372} y={14} width={206} height={56} rx={4} fill={C.panel} stroke={C.second} />
        <T x={475} y={34} s={12} f={C.second} a="middle">
          coating_thickness_um
        </T>
        <T x={475} y={60} s={14} f={C.second} a="middle">
          42.1
        </T>
      </g>
      <T x={30} y={36} s={12} f={C.quiet} o={rn}>
        firmware
      </T>
      <T x={30} y={62} s={12} f={C.quiet} o={rn}>
        rename →
      </T>
      <T x={30} y={118} s={14} f={C.secondary} o={easeOut(seg(t, 1.8, 2.1))}>
        naive
      </T>
      <Tick x={255} y={112} k={easeOut(seg(t, 2.1, 2.4))} />
      <Cross x={475} y={113} k={easeOutBack(seg(t, 2.5, 2.9))} />
      <T x={30} y={164} s={14} f={C.secondary} o={easeOut(seg(t, 3.0, 3.3))}>
        contract
      </T>
      <Tick x={255} y={158} k={easeOut(seg(t, 3.3, 3.6))} />
      <Tick x={475} y={158} k={easeOut(seg(t, 3.6, 3.9))} />
      <T x={30} y={192} s={12} f={C.quiet} o={easeOut(seg(t, 3.9, 4.3))}>
        alias: T3_thickness_raw
      </T>
    </Svg>
  );
}

// 10 · Six rows, each with a glyph of its picture, arriving one per beat.
const GLYPH = [
  (k: number) => (
    <g>
      {[0, 1, 2].map((i) => (
        <rect key={i} x={30} y={-14 + i * 8} width={70} height={6} fill={i === 1 ? 'none' : C.band} stroke={i === 1 ? C.focus : 'none'} strokeDasharray="3 2" opacity={k} />
      ))}
    </g>
  ),
  (k: number) => (
    <g>
      <rect x={30} y={-10} width={70} height={10} fill={C.band} />
      <rect x={30} y={-10} width={70 * k} height={10} fill={C.badText} />
      <line x1={42} y1={-14} x2={42} y2={4} stroke={C.focus} strokeWidth={1.6} />
    </g>
  ),
  (k: number) => (
    <g>
      <rect x={30} y={-10} width={70} height={10} fill={C.band} />
      <rect x={30} y={-10} width={70 * (1 - k)} height={10} fill={C.badText} />
      <line x1={42} y1={-14} x2={42} y2={4} stroke={C.focus} strokeWidth={1.6} />
    </g>
  ),
  (k: number) => (
    <g>
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={40 + i * 14 - 14 * k} y={-10} width={10} height={10} fill={i === 0 ? C.badText : C.primary} opacity={i === 0 ? 1 - k : 1} />
      ))}
    </g>
  ),
  (k: number) => (
    <g>
      <rect x={30} y={-12} width={30} height={12} fill="none" stroke={C.focus} />
      <rect x={70} y={-12} width={30} height={12} fill="none" stroke={C.second} />
      <path d={`M85 -12 C 80 ${-22 * k}, 50 ${-22 * k}, 45 -12`} fill="none" stroke={C.focus} strokeDasharray="2 2" />
    </g>
  ),
  (k: number) => (
    <g>
      <rect x={30} y={-12} width={30} height={12} fill="none" stroke={C.line} />
      <rect x={70} y={-12} width={30} height={12} fill="none" stroke={C.second} opacity={k} />
    </g>
  ),
];
export function Recap({ t }: StepCtx) {
  const rows = ['segmented on purpose', 'a read can blow the budget', 'read the historian instead', 'the buffer drops, never blocks', 'ownership vs definition', 'a rename breaks the unwarned'];
  return (
    <Svg label="a segmented floor, a load budget, a buffer protecting the producer, assigned ownership, and a rename only the naive reader did not survive" h={260}>
      {rows.map((r, i) => {
        const a = 0.2 + i * 0.8;
        const o = easeOut(seg(t, a, a + 0.4));
        const k = easeOut(seg(t, a + 0.2, a + 0.8));
        return o <= 0 ? null : (
          <g key={r} opacity={o} transform={`translate(${lerp(-12, 0, o)} ${34 + i * 40})`}>
            {GLYPH[i](k)}
            <T x={130} y={0} s={14} f={C.primary}>
              {r}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

// 11 · A subscriber plugs straight into the PLC. Inside, the PLC still checks every tag every scan to see what changed
// (a sweep over a row of tag cells). After the answer, the meter fills to 1,440/s against the 500/s post: the same
// question, a smaller number.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const sweep = ((on ? s : t) * 0.8) % 1;
  const fill = on ? easeInOut(seg(s, 0.3, 1.3)) : 0;
  return (
    <Svg label="a new consumer subscribes straight to the PLC's own OPC UA server for live tag values — is that the same risk as the script that polled it?" h={200}>
      <Box x={30} y={20} w={130} h={34} label="subscriber" o={easeOut(seg(t, 0, 0.3))} />
      <Draw
        pts={[
          [160, 37],
          [240, 37],
        ]}
        t={t}
        from={0.3}
        to={0.7}
        stroke={C.second}
        w={1.6}
        pen={false}
      />
      <g opacity={easeOut(seg(t, 0.2, 0.6))}>
        <rect x={240} y={14} width={330} height={60} rx={5} fill={C.panel} stroke={C.line} />
        <T x={252} y={32} s={12} f={C.quiet}>
          PLC: changed?
        </T>
        {Array.from({ length: 14 }, (_, i) => {
          const hot = Math.abs(sweep * 14 - i) < 1;
          return <rect key={i} x={254 + i * 22} y={44} width={16} height={16} rx={2} fill={hot ? C.focus : C.band} stroke={C.line} />;
        })}
      </g>
      {on ? (
        <g>
          <Budget y={104} o={1} />
          <Load y={104} v={1440 * fill} />
          <T x={540} y={96} s={14} f={C.badText} a="end" o={fill}>
            {`${n0(1440, fill)}/s`}
          </T>
          <T x={300} y={192} s={13} f={C.focus} a="middle" o={easeOut(seg(s, 1.2, 1.6))}>
            same question, smaller number
          </T>
        </g>
      ) : (
        <T x={300} y={130} s={16} f={C.secondary} a="middle" o={easeOut(seg(t, 1.6, 2.0))}>
          lighter, but safe?
        </T>
      )}
    </Svg>
  );
}
