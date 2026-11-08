import { useEffect, useState } from 'react';
import { C, Draw, Reticle, Svg, T } from '../../../../../reels/kit';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// OPC UA's information model, drawn from examples.py: the MachineTool/Monitoring/Spindle/Speed browse with its typed
// references, Speed's 1842.0 rpm Double read, the deadband's 25 of 199, client/server 25,000 against PubSub's 25, and the
// MessageSecurityMode table where 0 is Invalid on purpose.

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

type Pt = readonly [number, number];

// examples.py's address space: MachineTool —HasComponent→ Monitoring —Organizes→ Spindle —HasComponent→ Speed.
const PATH = [
  { n: 'MachineTool', ref: 'HasComponent' },
  { n: 'Monitoring', ref: 'Organizes' },
  { n: 'Spindle', ref: 'HasComponent' },
  { n: 'Speed', ref: '' },
];

// 0 · Two plants, one machine. Left, plant A: a raw address, PLC1.DB7.REAL12, then rows of more unlabelled addresses,
// and a spreadsheet whose cells go stale with a red "?". Right, plant B: the machine's own typed model grows as a tree —
// MachineTool, Monitoring, Spindle, Speed — and Speed arrives already carrying rpm and Double.
export function Hook({ t }: StepCtx) {
  return (
    <Svg
      label="two plants buy the same machine tool — one ends up with a tag list and an unmaintained spreadsheet, the other's machine publishes a typed model with names, units and a hierarchy already attached"
      h={200}
    >
      <line x1={300} y1={14} x2={300} y2={190} stroke={C.line} strokeWidth={1} opacity={easeOut(seg(t, 0, 0.3))} />
      <T x={25} y={26} s={12} f={C.quiet} o={easeOut(seg(t, 0, 0.3))}>
        plant A
      </T>
      <T x={25} y={56} s={13} f={C.primary} o={easeOut(seg(t, 0.3, 0.6))}>
        PLC1.DB7.REAL12
      </T>
      {[0, 1, 2].map((i) => (
        <rect key={i} x={25} y={68 + i * 14} width={140 - i * 18} height={7} rx={2} fill={C.line} opacity={easeOut(seg(t, 0.6 + i * 0.15, 0.9 + i * 0.15))} />
      ))}
      <g opacity={easeOut(seg(t, 1.4, 1.8))}>
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x={25 + (i % 4) * 44} y={125 + Math.floor(i / 4) * 18} width={42} height={16} fill="none" stroke={C.line} strokeWidth={1} />
        ))}
      </g>
      <T x={25 + 2 * 44 + 21} y={155} s={13} f={C.badText} a="middle" w={600} o={easeOut(seg(t, 2.2, 2.6))}>
        ?
      </T>
      <T x={205} y={186} s={12} f={C.badText} o={easeOut(seg(t, 2.4, 2.8))}>
        stale
      </T>

      <T x={320} y={26} s={12} f={C.quiet} o={easeOut(seg(t, 0.2, 0.5))}>
        plant B
      </T>
      {PATH.map((p, i) => {
        const a = 2.6 + i * 0.45;
        const x = 320 + i * 26;
        const y = 56 + i * 32;
        return (
          <g key={p.n} opacity={easeOut(seg(t, a, a + 0.3))}>
            {i > 0 && <path d={`M${x - 18} ${y - 26} V${y - 5} H${x - 6}`} fill="none" stroke={C.line} strokeWidth={1.2} />}
            <T x={x} y={y} s={13} f={i === 3 ? C.focus : C.primary} w={i === 3 ? 600 : 400}>
              {p.n}
            </T>
          </g>
        );
      })}
      <T x={398} y={178} s={12} f={C.second} o={easeOut(seg(t, 4.6, 5.0))}>
        rpm, Double
      </T>
    </Svg>
  );
}

// 1 · Four fields down the side — name, unit, type, parent. The raw address column answers each with a grey dash. The
// typed node column shows "?" before the answer; after it, the four values are carried in from the right in turn:
// Speed, rpm, Double, Spindle, and brackets lock onto the typed column.
export function PredictModel({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const fields = [
    { f: 'name', v: 'Speed' },
    { f: 'unit', v: 'rpm' },
    { f: 'type', v: 'Double' },
    { f: 'parent', v: 'Spindle' },
  ];
  return (
    <Svg label="one plant onboards the machine in days, the other in months — what exactly did the typed model carry that a raw address never could?" h={200}>
      <T x={150} y={30} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        PLC1.DB7.REAL12
      </T>
      <T x={430} y={30} s={13} f={C.focus} w={600} o={easeOut(seg(t, 0.2, 0.5))}>
        typed node
      </T>
      <Draw pts={[[25, 42], [575, 42]]} t={t} from={0.2} to={0.7} stroke={C.line} w={1} pen={false} />
      {fields.map((r, i) => {
        const y = 72 + i * 32;
        const a = 0.6 + i * 0.35;
        const row = easeOut(seg(t, a, a + 0.3));
        // after the answer each value is carried in from the right, one field at a time
        const k = on ? easeOutBack(seg(s, 0.2 + i * 0.25, 0.55 + i * 0.25)) : 0;
        return (
          <g key={r.f}>
            <g opacity={row} transform={`translate(${((1 - row) * -20).toFixed(1)} 0)`}>
              <T x={25} y={y} s={13} f={C.quiet}>
                {r.f}
              </T>
              <T x={150} y={y} s={14} f={C.quiet}>
                —
              </T>
              {!on && (
                <T x={430} y={y} s={14} f={C.focus} o={0.75 + 0.25 * Math.sin(t * 3 + i)}>
                  ?
                </T>
              )}
            </g>
            {on && k > 0 && (
              <g opacity={clamp(k)} transform={`translate(${((1 - clamp(k, 0, 1.1)) * 80).toFixed(1)} 0)`}>
                <T x={430} y={y} s={14} f={C.focus} w={600}>
                  {r.v}
                </T>
              </g>
            )}
          </g>
        );
      })}
      {on && <Reticle x={470} y={108} w={130} h={128} t={s} at={1.3} />}
    </Svg>
  );
}

// 2 · The browse. Four nodes stack down the left, joined by their typed references — HasComponent, Organizes,
// HasComponent — while a cursor walks from MachineTool to Speed. Speed is a Variable; its read opens on the right:
// 1842.0, rpm, Double, status Good, and two timestamps from two clocks, 1000.0 and 1000.05.
export function RevealAddressSpace({ t }: StepCtx) {
  const by = (i: number) => 14 + i * 60;
  const cur = Math.min(3, Math.floor(seg(t, 0.6, 3.4) * 4));
  const walked = seg(t, 0.6, 0.65) > 0;
  const detail = [
    { l: 'value', v: '1842.0' },
    { l: 'unit', v: 'rpm' },
    { l: 'type', v: 'Double' },
    { l: 'status', v: 'Good' },
    { l: 'source time', v: '1000.0' },
    { l: 'server time', v: '1000.05' },
  ];
  return (
    <Svg
      label="nodes are joined by typed references, and browsing from the machine down through its monitoring and spindle objects reaches one variable, already carrying its own unit and data type"
      h={260}
    >
      {PATH.map((p, i) => {
        const lit = walked && i === cur;
        const isVar = i === 3;
        return (
          <g key={p.n} opacity={easeOut(seg(t, i * 0.12, 0.3 + i * 0.12))}>
            <rect x={25} y={by(i)} width={150} height={30} rx={isVar ? 15 : 4} fill={C.panel} stroke={lit ? C.focus : isVar ? C.second : C.line} strokeWidth={lit ? 1.8 : 1.1} />
            <T x={100} y={by(i) + 20} s={13} f={lit ? C.focus : C.primary} a="middle" w={lit ? 600 : 400}>
              {p.n}
            </T>
            {p.ref && (
              <g>
                <line x1={100} y1={by(i) + 30} x2={100} y2={by(i + 1)} stroke={walked && cur > i ? C.focus : C.line} strokeWidth={1.4} />
                <T x={112} y={by(i) + 49} s={11} f={C.second}>
                  {p.ref}
                </T>
              </g>
            )}
          </g>
        );
      })}
      <T x={190} y={by(3) + 20} s={11} f={C.quiet} o={easeOut(seg(t, 3.2, 3.5))}>
        Variable
      </T>
      <path d={`M285 ${by(3) + 15} H318`} stroke={C.focus} strokeWidth={1.2} opacity={easeOut(seg(t, 3.4, 3.7))} />
      {detail.map((d, i) => {
        const y = 112 + i * 25;
        return (
          <g key={d.l} opacity={easeOut(seg(t, 3.6 + i * 0.3, 3.9 + i * 0.3))}>
            <T x={330} y={y} s={12} f={C.quiet}>
              {d.l}
            </T>
            <T x={575} y={y} s={13} f={i < 3 ? C.focus : C.second} a="end" w={600}>
              {d.v}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

// 3 · Three vendors' machines, three different raw names for the same spindle speed. The companion specification
// slides across as a band; each row's name rewrites itself to the same path, Monitoring/Spindle/Speed, and three lines
// run to one client that needs one map, not three.
export function RevealCompanionSpec({ t }: StepCtx) {
  const rows = [
    { v: 'vendor A', raw: 'spdl_rpm' },
    { v: 'vendor B', raw: 'S1_SPEED' },
    { v: 'vendor C', raw: 'SpindleRev' },
  ];
  const band = easeInOut(seg(t, 1.6, 2.8));
  const same = band > 0.6;
  return (
    <Svg
      label="a companion specification standardizes that exact path for a domain, so any machine tool built to it exposes the same object types and a client never needs a per-vendor tag map"
      h={200}
    >
      {rows.map((r, i) => {
        const y = 46 + i * 50;
        return (
          <g key={r.v} opacity={easeOut(seg(t, i * 0.3, 0.3 + i * 0.3))}>
            <T x={25} y={y} s={13} f={C.secondary}>
              {r.v}
            </T>
            <T x={140} y={y} s={13} f={same ? C.focus : C.badText} w={same ? 600 : 400}>
              {same ? 'Monitoring/Spindle/Speed' : r.raw}
            </T>
            <Draw
              pts={[
                [455, y - 5],
                [478, 100],
              ]}
              t={t}
              from={3.2 + i * 0.2}
              to={3.6 + i * 0.2}
              stroke={C.focus}
              w={1.2}
              pen={false}
            />
          </g>
        );
      })}
      <rect x={lerp(-180, 130, band)} y={20} width={300} height={140} rx={6} fill={C.second} opacity={0.12 * (1 - seg(t, 2.8, 3.2))} stroke={C.second} strokeWidth={1} />
      <T x={lerp(-30, 280, band)} y={186} s={12} f={C.second} a="middle" o={easeOut(seg(t, 1.6, 2.0))}>
        companion specification
      </T>
      <Box x={480} y={84} w={95} label="client" lit o={easeOut(seg(t, 3.4, 3.8))} />
      <T x={575} y={146} s={12} f={C.focus} a="end" o={easeOut(seg(t, 4.0, 4.4))}>
        one map
      </T>
    </Svg>
  );
}

// examples.py's spindle signal: 1800 + 8 sin(i / 5), 200 samples, and the 25 sample indices where the absolute deadband
// of 5 fires (|last reported − current| > 5).
const DB_FIRES = [4, 16, 20, 31, 35, 47, 51, 63, 67, 78, 82, 95, 99, 110, 114, 126, 130, 141, 145, 157, 161, 173, 177, 188, 192];
const sig = (i: number) => 1800 + 8 * Math.sin(i / 5);

// 4 · The spindle speed draws across 200 samples. Polling ticks every sample: 199 grey ticks. Then the deadband: a
// ±5 band hangs on the last reported value; each time the line leaves it, a white tick fires and the band jumps to the
// new value. 25 ticks against 199.
export function RevealDeadband({ t }: StepCtx) {
  const sx = (i: number) => 40 + i * 2.6;
  const sy = (v: number) => 70 - (v - 1800) * 5;
  const pts: Pt[] = Array.from({ length: 200 }, (_, i) => [sx(i), sy(sig(i))] as const);
  const poll = seg(t, 1.2, 2.4);
  const db = seg(t, 2.6, 4.8);
  const upto = db * 199;
  const fired = DB_FIRES.filter((i) => i <= upto);
  const last = fired.length ? fired[fired.length - 1] : 0;
  return (
    <Svg label="a monitored item's absolute deadband only reports a change past a stated threshold, and measured against polling every sample it sends a small fraction of the messages" h={200}>
      {db > 0 && db < 1 && <rect x={sx(last)} y={sy(sig(last) + 5)} width={sx(Math.min(199, upto)) - sx(last)} height={sy(sig(last) - 5) - sy(sig(last) + 5)} fill={C.second} opacity={0.18} />}
      <Draw pts={pts} t={t} from={0} to={1.2} stroke={C.focus} w={1.6} />
      <T x={25} y={132} s={12} f={C.secondary} o={easeOut(seg(t, 1.2, 1.5))}>
        poll
      </T>
      {Array.from({ length: 199 }, (_, j) => (j / 199 < poll ? <line key={j} x1={sx(j + 1)} y1={138} x2={sx(j + 1)} y2={150} stroke={C.quiet} strokeWidth={0.8} /> : null))}
      <T x={575} y={132} s={13} f={C.secondary} a="end" w={600} o={easeOut(seg(t, 2.3, 2.6))}>
        199
      </T>
      <T x={25} y={166} s={12} f={C.second} o={easeOut(seg(t, 2.5, 2.8))}>
        ±5
      </T>
      {fired.map((i) => (
        <g key={i}>
          <line x1={sx(i)} y1={172} x2={sx(i)} y2={186} stroke={C.focus} strokeWidth={1.6} />
          <circle cx={sx(i)} cy={sy(sig(i))} r={3} fill={C.focus} />
        </g>
      ))}
      <T x={575} y={166} s={14} f={C.focus} a="end" w={600} o={easeOut(seg(t, 4.8, 5.2))}>
        25
      </T>
    </Svg>
  );
}

// 5 · Left: client/server, one server with a separate session line to every subscriber. Right: PubSub, one publisher,
// one message onto a shared line that every subscriber taps. Below, the counts for 25 notifications as subscribers go
// 1 → 10 → 1,000: client/server 25, 250, 25,000; PubSub 25, 25, 25.
export function RevealPubSub({ t }: StepCtx) {
  const ns = [1, 10, 1000];
  const step = Math.min(2, Math.floor(seg(t, 2.4, 4.8) * 3));
  const started = seg(t, 2.4, 2.45) > 0;
  const cs = ['25', '250', '25,000'];
  const fan = Math.min(8, [1, 4, 8][step]);
  return (
    <Svg
      label="client/server gives every subscriber its own session so its notification traffic scales with how many are listening, but PubSub decouples publisher from subscriber so its own message count doesn't"
      h={200}
    >
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <rect x={25} y={40} width={60} height={30} rx={4} fill={C.panel} stroke={C.secondary} strokeWidth={1.2} />
        <T x={55} y={60} s={11} f={C.secondary} a="middle">
          server
        </T>
        {Array.from({ length: started ? fan : 1 }, (_, i) => (
          <g key={i}>
            <line x1={85} y1={55} x2={230} y2={20 + i * 10} stroke={C.badText} strokeWidth={1} />
            <circle cx={234} cy={20 + i * 10} r={3} fill={C.secondary} />
          </g>
        ))}
        <T x={25} y={110} s={12} f={C.secondary}>
          client/server
        </T>
      </g>
      <g opacity={easeOut(seg(t, 0.8, 1.2))}>
        <rect x={320} y={40} width={70} height={30} rx={4} fill={C.panel} stroke={C.second} strokeWidth={1.2} />
        <T x={355} y={60} s={11} f={C.second} a="middle">
          publisher
        </T>
        <line x1={390} y1={55} x2={430} y2={55} stroke={C.second} strokeWidth={2} />
        <line x1={430} y1={18} x2={430} y2={92} stroke={C.second} strokeWidth={2} />
        {Array.from({ length: started ? fan : 1 }, (_, i) => (
          <g key={i}>
            <line x1={430} y1={20 + i * 10} x2={530} y2={20 + i * 10} stroke={C.line} strokeWidth={1} />
            <circle cx={534} cy={20 + i * 10} r={3} fill={C.secondary} />
          </g>
        ))}
        <T x={320} y={110} s={12} f={C.second}>
          PubSub
        </T>
      </g>
      <g opacity={easeOut(seg(t, 1.8, 2.2))}>
        <T x={25} y={150} s={12} f={C.quiet}>
          subscribers
        </T>
        <T x={300} y={150} s={12} f={C.quiet} a="middle">
          client/server
        </T>
        <T x={575} y={150} s={12} f={C.quiet} a="end">
          PubSub
        </T>
        <T x={25} y={182} s={16} f={C.primary} w={600}>
          {ns[started ? step : 0].toLocaleString('en-US')}
        </T>
        <T x={300} y={182} s={16} f={step > 0 ? C.badText : C.primary} a="middle" w={600}>
          {cs[started ? step : 0]}
        </T>
        <T x={575} y={182} s={16} f={C.second} a="end" w={600}>
          25
        </T>
      </g>
    </Svg>
  );
}

// 6 · The MessageSecurityMode enumeration as four rows: 0 Invalid, 1 None, 2 Sign, 3 SignAndEncrypt. A pointer rests on
// 0 — the specification's default, invalid on purpose so nothing is chosen by accident. Then a plant server's setting
// slides to 1, None, and the row turns red: a finding to raise.
export function RevealSecurity({ t }: StepCtx) {
  const modes = ['Invalid', 'None', 'Sign', 'SignAndEncrypt'];
  const ry = (i: number) => 40 + i * 40;
  const move = easeInOut(seg(t, 2.8, 3.6));
  const py = lerp(ry(0), ry(1), move);
  const found = move > 0.98;
  return (
    <Svg
      label="the specification's own default isn't None, it's an invalid value specifically so no security is never chosen by accident — finding it set to None in a plant is a finding to raise"
      h={200}
    >
      {modes.map((m, i) => (
        <g key={m} opacity={easeOut(seg(t, i * 0.25, 0.3 + i * 0.25))}>
          <T x={70} y={ry(i)} s={14} f={C.quiet}>
            {String(i)}
          </T>
          <T x={100} y={ry(i)} s={14} f={i === 1 && found ? C.badText : C.primary} w={i === 1 && found ? 600 : 400}>
            {m}
          </T>
        </g>
      ))}
      <path d={`M30 ${py - 10} l14 5 l-14 5 z`} fill={found ? C.badText : C.second} opacity={easeOut(seg(t, 1.0, 1.4))} />
      <T x={575} y={ry(0)} s={13} f={C.second} a="end" o={easeOut(seg(t, 1.3, 1.7))}>
        the spec default
      </T>
      <T x={575} y={ry(0) + 20} s={11} f={C.quiet} a="end" o={easeOut(seg(t, 1.8, 2.2))}>
        invalid on purpose
      </T>
      <T x={575} y={ry(1) + 6} s={14} f={C.badText} a="end" w={600} o={easeOut(seg(t, 3.7, 4.1))}>
        a finding
      </T>
      <Cross x={430} y={ry(1) + 1} k={easeOutBack(seg(t, 3.8, 4.2))} />
      <T x={575} y={ry(1) + 26} s={11} f={C.quiet} a="end" o={easeOut(seg(t, 2.6, 3.0))}>
        a plant server's setting
      </T>
    </Svg>
  );
}

// 7 · Five lanes with tiny pictures: a node tree, three rows collapsing to one path, sparse deadband ticks against dense
// polling, one publisher line, and a pointer resting on Invalid — each picture builds as its lane lands.
export function Recap({ t }: StepCtx) {
  const lane = (i: number) => 32 + i * 50;
  const k = (i: number) => easeOut(seg(t, i * 1.0, i * 1.0 + 0.5));
  const texts = [
    { l: 'typed nodes', r: 'names, units, place', c: C.focus },
    { l: 'companion spec', r: 'same path', c: C.second },
    { l: 'deadband', r: '25 of 199', c: C.focus },
    { l: 'PubSub', r: 'flat in subscribers', c: C.second },
    { l: 'security', r: 'None is a finding', c: C.badText },
  ];
  const poll = seg(t, 2.1, 2.7);
  const rest = easeOutBack(seg(t, 4.2, 4.8));
  return (
    <Svg
      label="typed nodes and references, a companion specification that standardizes a path across vendors, a deadband that cuts notification volume, PubSub that decouples cost from subscriber count, and a security default built to never be an accident"
      h={260}
    >
      {/* typed nodes: each node steps down into its place under its parent */}
      {[0, 1, 2].map((j) => {
        const d = easeOutBack(seg(t, 0.1 + j * 0.15, 0.4 + j * 0.15));
        return <rect key={j} x={25 + j * 22} y={lane(0) - 12 + j * 8 * clamp(d, 0, 1.2)} width={14} height={8} fill={j === 2 ? C.focus : C.secondary} opacity={clamp(d)} />;
      })}
      {/* companion spec: three vendors' paths converge on one */}
      {[0, 1, 2].map((j) => (
        <Draw key={j} pts={[[25, lane(1) - 10 + j * 8], [80, lane(1) - 2]]} t={t} from={1.1} to={1.4} stroke={C.line} w={1.2} pen={false} />
      ))}
      <Draw pts={[[80, lane(1) - 2], [135, lane(1) - 2]]} t={t} from={1.4} to={1.7} stroke={C.second} w={2} />
      {/* deadband: the polling ticks sweep in densely, then only three notifications rise */}
      {Array.from({ length: 22 }, (_, j) =>
        j / 22 < poll ? <line key={j} x1={25 + j * 5} y1={lane(2) - 12} x2={25 + j * 5} y2={lane(2) - 6} stroke={C.quiet} strokeWidth={0.8} /> : null,
      )}
      {[2, 9, 17].map((j, n) => {
        const r = easeOutBack(seg(t, 2.6 + n * 0.12, 2.9 + n * 0.12));
        return <line key={j} x1={25 + j * 5} y1={lane(2) + 8 - 10 * clamp(r, 0, 1.2)} x2={25 + j * 5} y2={lane(2) + 8} stroke={C.focus} strokeWidth={1.6} opacity={clamp(r)} />;
      })}
      {/* PubSub: one publisher line, subscribers hanging off it cost the publisher nothing more */}
      <Draw pts={[[25, lane(3) - 2], [135, lane(3) - 2]]} t={t} from={3.0} to={3.35} stroke={C.second} w={2} pen={false} />
      {[0, 1, 2, 3].map((j) => (
        <Draw key={j} pts={[[55 + j * 22, lane(3) - 2], [55 + j * 22, lane(3) + 10]]} t={t} from={3.3 + j * 0.08} to={3.45 + j * 0.08} stroke={C.line} w={1} pen={false} />
      ))}
      {/* security: the pointer swings in and rests on Invalid */}
      <g opacity={k(4)}>
        <path d={`M25 ${lane(4) - 11} l12 5 l-12 5 z`} fill={C.second} transform={`translate(${((1 - clamp(rest, 0, 1.2)) * 90).toFixed(1)} 0)`} />
        <T x={45} y={lane(4) + 2} s={13} f={C.primary}>
          Invalid
        </T>
      </g>
      {texts.map((x, i) => (
        <g key={i} opacity={k(i)} transform={`translate(${((1 - k(i)) * -20).toFixed(1)} 0)`}>
          <T x={160} y={lane(i) + 5} s={14} f={C.primary}>
            {x.l}
          </T>
          <T x={575} y={lane(i) + 5} s={14} f={x.c} a="end" w={600}>
            {x.r}
          </T>
        </g>
      ))}
      <Reticle x={300} y={lane(4)} w={566} h={34} t={t} at={5.0} color={C.badText} />
    </Svg>
  );
}

// 8 · One browsed node, Speed, with its fields. Before the answer: "the whole hierarchy?". After it, its references are
// followed upward one by one — Spindle, Monitoring, MachineTool — and the tree rebuilds above it, ticked.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  return (
    <Svg label="given only the fields a browsed variable node carries, can the plant's whole equipment hierarchy be rebuilt from the model alone?" h={200}>
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <rect x={25} y={140} width={150} height={30} rx={15} fill={C.panel} stroke={C.focus} strokeWidth={1.6} />
        <T x={100} y={160} s={13} f={C.focus} a="middle" w={600}>
          Speed
        </T>
      </g>
      <T x={200} y={160} s={12} f={C.secondary} o={easeOut(seg(t, 0.5, 0.9))}>
        rpm, Double, parent refs
      </T>
      {!on ? (
        <T x={300} y={70} s={14} f={C.focus} a="middle" o={easeOut(seg(t, 1.4, 1.8))}>
          the whole hierarchy?
        </T>
      ) : (
        <g>
          {[2, 1, 0].map((p, j) => {
            const k = easeOut(seg(s, 0.2 + j * 0.4, 0.6 + j * 0.4));
            const y = 100 - j * 40;
            const x = 25 + (2 - j) * 0;
            return (
              <g key={p} opacity={k}>
                <line x1={100} y1={y + 18} x2={100} y2={y + 40} stroke={C.focus} strokeWidth={1.4} />
                <T x={x + 75} y={y + 12} s={13} f={C.primary} a="middle">
                  {PATH[p].n}
                </T>
                <T x={200} y={y + 32} s={11} f={C.second}>
                  {PATH[p].ref}
                </T>
              </g>
            );
          })}
          <Tick x={560} y={30} k={easeOutBack(seg(s, 1.4, 1.8))} />
          <T x={545} y={35} s={13} f={C.focus} a="end" w={600} o={easeOut(seg(s, 1.4, 1.8))}>
            rebuilt
          </T>
        </g>
      )}
    </Svg>
  );
}
