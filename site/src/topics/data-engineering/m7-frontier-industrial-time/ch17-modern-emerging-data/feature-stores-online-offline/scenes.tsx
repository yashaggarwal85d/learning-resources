import { useEffect, useState, type ReactElement } from 'react';
import { C, Draw, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// Feature stores and online/offline consistency, drawn from examples.py run against Postgres 16: 1,500 simulated
// requests, a five-day-earlier serving window disagreeing on 204 (0.136) and identical code on 0, a current-value
// serving join disagreeing on 347 (0.231), and a 45-minute materialization pulse breaking the 30-minute limit for 0.313
// of requests while a 15-minute pulse never does.

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

// examples.py's 1,500 simulated requests (seed 20261031 for the request draw), one bit each, in request order, as hex:
// set where the serving value disagreed with the offline as-of value. C1: a five-day-earlier window (204 set, 0.136).
// C2: the current value instead of the as-of value (347 set, 0.231).
const C1 =
  '08000000b00040004008a0000010488450022000008a02014502020084140020222500081000010100882240e0028005b0000504100402000004000091000500248d011200800000001020000020041001820000000000852000009018108396000000080001241c0020cd20000200000010140c2800130020101800892040221204020210004040480000008020000042000082391080006000203002a0100005024480b80002d4a858200090401480080010000a0080008000000';
const C2 =
  '0810148900800b285dd80097209010ac40000002104a0a8205080aa005140d215204482c410468420c0cc040a1088804210017120000320140100040502601012481211108642c1200808094402201760206112d01e50080a49051107c10020000e220109124028831800020000044c00a5a1c00a25436a081501c610924a85b100c43b0400cca0400000440800401c04080014428808000601230670380082041041c903044822ce861038cc141029006123800991006200110100';
const bit = (h: string, i: number) => (parseInt(h[i >> 2], 16) >> (3 - (i & 3))) & 1;

/** The 1,500 requests as a 75 × 20 grid; cells before `sweep` (0–1) are checked, mismatches in red. */
const Grid = ({ y, bits, sweep, ch = 5 }: { y: number; bits: string | null; sweep: number; ch?: number }) => {
  const done = Math.floor(sweep * 1500);
  return (
    <g>
      {Array.from({ length: 1500 }, (_, i) => {
        const cx = 25 + (i % 75) * 7.33;
        const cy = y + Math.floor(i / 75) * ch;
        const on = i < done;
        const bad = on && bits !== null && bit(bits, i) === 1;
        return <rect key={i} x={cx} y={cy} width={6} height={ch - 1} fill={bad ? C.badText : on ? C.line : C.band} />;
      })}
    </g>
  );
};

/** A box with a centred label, two lines optional. */
const Card = ({ x, y, w, h = 34, l, sub, c = C.primary, o = 1, dash }: { x: number; y: number; w: number; h?: number; l: string; sub?: string; c?: string; o?: number; dash?: boolean }) =>
  o <= 0 ? null : (
    <g opacity={Math.min(1, o)}>
      <rect x={x} y={y} width={w} height={h} rx={5} fill={C.panel} stroke={c === C.primary ? C.line : c} strokeWidth={1.3} strokeDasharray={dash ? '4 3' : undefined} />
      <T x={x + w / 2} y={sub ? y + h / 2 - 1 : y + h / 2 + 5} s={13} f={c} a="middle">
        {l}
      </T>
      {sub && (
        <T x={x + w / 2} y={y + h / 2 + 15} s={12} f={C.secondary} a="middle">
          {sub}
        </T>
      )}
    </g>
  );

// 0 · Two bars: offline tests long and white, the live week shorter and red. "no code change" with a tick. Below, a model
// box fed by two paths: training from the left, serving from the right. Dots run down both; the serving arrow turns red
// and dashed, and a "?" sits on it — the model didn't move, the way it reaches a value did.
export function Hook({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.7));
  const b = easeOut(seg(t, 0.3, 0.9));
  const flow = seg(t, 1.3, 2.1);
  const bad = easeOut(seg(t, 1.9, 2.3));
  return (
    <Svg label="strong offline. Worse the week it went live. No code changed." h={240}>
      <T x={25} y={34} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        offline
      </T>
      <rect x={150} y={20} width={400 * a} height={20} rx={3} fill={C.focus} />
      <T x={25} y={72} s={13} f={C.secondary} o={easeOut(seg(t, 0.2, 0.5))}>
        live week
      </T>
      <rect x={150} y={58} width={230 * b} height={20} rx={3} fill={C.badText} />
      <g opacity={easeOut(seg(t, 0.9, 1.2))}>
        <T x={575} y={112} s={12} f={C.secondary} a="end">
          no code change
        </T>
        <Tick x={385} y={107} k={1} />
      </g>
      <Card x={240} y={186} w={120} l="model" o={easeOut(seg(t, 0.9, 1.2))} />
      <Card x={25} y={136} w={180} l="training path" o={easeOut(seg(t, 1.0, 1.3))} />
      <Card x={395} y={136} w={180} l="serving path" c={bad > 0.5 ? C.badText : C.primary} o={easeOut(seg(t, 1.1, 1.4))} />
      <g opacity={easeOut(seg(t, 1.1, 1.4))}>
        <line x1={170} y1={170} x2={250} y2={196} stroke={C.line} strokeWidth={1.4} />
        <line x1={430} y1={170} x2={350} y2={196} stroke={bad > 0 ? C.badText : C.line} strokeWidth={1.4} strokeDasharray={bad > 0.5 ? '4 3' : undefined} />
      </g>
      {flow > 0 && flow < 1 && (
        <g fill={C.second}>
          <circle cx={lerp(170, 250, flow)} cy={lerp(170, 196, flow)} r={4} />
          <circle cx={lerp(430, 350, flow)} cy={lerp(170, 196, flow)} r={4} />
        </g>
      )}
      <T x={404} y={190} s={15} f={C.badText} a="middle" o={bad}>
        ?
      </T>
    </Svg>
  );
}

// 1 · Two day strips, training and serving, each with its own midnight tick a few hours apart; the same order event
// falls after midnight on one and before it on the other — "≠". Three cause chips: stale value, different join, two code
// paths. After the answer: "two code paths" lights ✓; "stale value" is struck: both ran on schedule.
export function PredictSkewCause({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const r = on ? easeOut(seg(s, 0.2, 0.7)) : 0;
  const x2 = on ? easeOut(seg(s, 0.6, 1.0)) : 0;
  const CH = ['stale value', 'different join', 'two code paths'];
  return (
    <Svg label="a timezone boundary differs between the two pipelines. Which cause is this?" h={240}>
      {[0, 1].map((i) => {
        const y = 46 + i * 52;
        const mx = i === 0 ? 300 : 370;
        const k = easeOut(seg(t, i * 0.3, 0.4 + i * 0.3));
        return (
          <g key={i} opacity={k}>
            <T x={25} y={y + 5} s={13} f={C.secondary}>
              {i === 0 ? 'training' : 'serving'}
            </T>
            <line x1={140} y1={y} x2={565} y2={y} stroke={C.line} strokeWidth={1.2} />
            <rect x={mx} y={y - 9} width={565 - mx} height={18} fill={C.second} opacity={0.14} />
            <line x1={mx} y1={y - 14} x2={mx} y2={y + 14} stroke={C.second} strokeWidth={1.8} />
            <T x={mx} y={y - 20} s={12} f={C.second} a="middle">
              00:00
            </T>
            <circle cx={335} cy={y} r={5} fill={C.focus} opacity={easeOut(seg(t, 0.8, 1.1))} />
          </g>
        );
      })}
      <T x={575} y={128} s={13} f={C.badText} a="end" o={easeOut(seg(t, 1.1, 1.4))}>
        same order, two days
      </T>
      {CH.map((c, i) => {
        const x = 25 + i * 184;
        const k = easeOut(seg(t, 1.4 + i * 0.2, 1.7 + i * 0.2));
        const lit = i === 2 && r > 0;
        return (
          <g key={c} opacity={k}>
            <rect x={x} y={156} width={182} height={32} rx={5} fill={C.panel} stroke={lit ? C.focus : C.line} strokeWidth={lit ? 1.8 : 1.2} />
            <T x={x + 91} y={177} s={12} f={lit ? C.focus : C.primary} a="middle">
              {c}
            </T>
          </g>
        );
      })}
      <Tick x={492} y={208} k={r} />
      <Cross x={116} y={208} k={x2} />
      <T x={25} y={232} s={12} f={C.secondary} o={x2}>
        both ran on schedule
      </T>
    </Svg>
  );
}

// 2 · "one definition" drops in at the top and flashes as it compiles. Two pipes draw down to an offline store and an
// online store. Values flow: the offline store stacks them as history, four slices deep; the online store keeps
// overwriting one slot. Captions: history, for training; latest only, for serving.
export function RevealOneDefinitionTwoStores({ t }: StepCtx) {
  const comp = seg(t, 0.5, 1.0);
  const flash = comp > 0 && comp < 1 ? Math.sin(comp * Math.PI) : 0;
  const pipes = easeInOut(seg(t, 0.9, 1.5));
  const n = Math.min(4, Math.floor(seg(t, 1.5, 3.1) * 4.999));
  const pulse = (seg(t, 1.5, 3.1) * 4.999) % 1;
  return (
    <Svg label="one transformation, compiled once. Offline for training, online for serving." h={240}>
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <rect x={210} y={14} width={180} height={36} rx={6} fill={C.panel} stroke={C.focus} strokeWidth={1.4 + 1.6 * flash} />
        <T x={300} y={37} s={13} f={C.focus} a="middle">
          one definition
        </T>
      </g>
      {pipes > 0 && (
        <g stroke={C.line} strokeWidth={1.4} fill="none">
          <path d={`M300 50 L ${lerp(300, 125, pipes)} ${lerp(50, 104, pipes)}`} />
          <path d={`M300 50 L ${lerp(300, 475, pipes)} ${lerp(50, 104, pipes)}`} />
        </g>
      )}
      {n > 0 && n < 5 && pulse < 0.6 && t < 3.1 && (
        <g fill={C.second}>
          <circle cx={lerp(300, 125, pulse / 0.6)} cy={lerp(50, 104, pulse / 0.6)} r={4} />
          <circle cx={lerp(300, 475, pulse / 0.6)} cy={lerp(50, 104, pulse / 0.6)} r={4} />
        </g>
      )}
      <Card x={25} y={106} w={200} h={30} l="offline store" o={easeOut(seg(t, 1.2, 1.5))} />
      <Card x={375} y={106} w={200} h={30} l="online store" o={easeOut(seg(t, 1.2, 1.5))} />
      {Array.from({ length: 4 }, (_, i) => (
        <rect key={i} x={45 + i * 42} y={146} width={36} height={22} rx={3} fill={i < n ? C.focus : C.band} opacity={i < n ? 0.35 + 0.15 * i : 1} />
      ))}
      <rect x={457} y={146} width={36} height={22} rx={3} fill={n > 0 ? C.focus : C.band} opacity={n > 0 ? (pulse < 0.7 ? 0.95 : 0.6) : 1} />
      <T x={125} y={196} s={12} f={C.secondary} a="middle" o={easeOut(seg(t, 3.2, 3.6))}>
        history, for training
      </T>
      <T x={475} y={196} s={12} f={C.secondary} a="middle" o={easeOut(seg(t, 3.3, 3.7))}>
        latest only, for serving
      </T>
    </Svg>
  );
}

// 3 · examples.py's 1,500 requests as a 75 × 20 grid. Pass one, identical code: a sweep checks every cell and none
// lights — 0.000. Pass two, a serving copy whose window ends five days earlier: the grid resets and a second sweep lights
// the 204 requests that disagree, red, where they actually fell — 0.136.
export function RevealCodePathSkew({ t }: StepCtx) {
  const p1 = seg(t, 0.4, 1.6);
  const p2 = seg(t, 2.0, 3.6);
  return (
    <Svg label="a second definition, measured: a five-day-earlier window boundary." h={220}>
      <T x={25} y={22} s={12} f={C.quiet} o={easeOut(seg(t, 0, 0.3))}>
        1,500 requests, one cell each
      </T>
      <Grid y={36} bits={p2 > 0 ? C1 : null} sweep={p2 > 0 ? p2 : p1} />
      <g opacity={easeOut(seg(t, 0.2, 0.5))}>
        <T x={25} y={164} s={13} f={p2 > 0 ? C.quiet : C.secondary}>
          identical code
        </T>
        <T x={575} y={164} s={13} f={C.focus} a="end" o={easeOut(seg(t, 1.6, 1.9))}>
          0.000
        </T>
      </g>
      <g opacity={easeOut(seg(t, 1.9, 2.2))}>
        <T x={25} y={192} s={13} f={C.secondary}>
          window 5 d earlier
        </T>
        <T x={575} y={192} s={13} f={C.badText} a="end" o={easeOut(seg(t, 3.6, 3.9))}>
          0.136
        </T>
      </g>
      <T x={25} y={216} s={12} f={C.quiet} o={easeOut(seg(t, 3.9, 4.3))}>
        mismatch rate
      </T>
    </Svg>
  );
}

// 4 · A request on a timeline with feature events either side. The as-of reach goes back, white, to the latest event
// before the request; the buggy serving path reaches forward, red, to "now". Beneath, the same 1,500-request grid
// sweeps and lights the 347 requests where current and as-of disagree — 0.231.
export function RevealJoinSkew({ t }: StepCtx) {
  const y = 64;
  const rx = 300;
  const back = easeInOut(seg(t, 0.6, 1.1));
  const fwd = easeInOut(seg(t, 1.1, 1.7));
  const sweep = seg(t, 1.9, 3.4);
  const arc = (x: number, k: number, c: string) => {
    if (k <= 0) return null;
    const xe = lerp(rx, x, k);
    return <path d={`M${rx} ${y - 14} Q ${(rx + xe) / 2} ${y - 40} ${xe} ${y - 8}`} fill="none" stroke={c} strokeWidth={1.8} />;
  };
  return (
    <Svg label="the serving path asks for current, not as-of. The same leak, at inference time." h={240}>
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <line x1={40} y1={y} x2={565} y2={y} stroke={C.line} strokeWidth={1.2} />
        {[90, 170, 250, 380, 470, 545].map((x) => (
          <circle key={x} cx={x} cy={y} r={4} fill={x > rx ? C.secondary : C.primary} />
        ))}
        <line x1={rx} y1={y - 20} x2={rx} y2={y + 14} stroke={C.focus} strokeWidth={2} />
        <T x={rx} y={y + 32} s={12} f={C.focus} a="middle">
          request
        </T>
      </g>
      {arc(250, back, C.focus)}
      {arc(545, fwd, C.badText)}
      <T x={250} y={y + 32} s={12} f={C.focus} a="end" o={back}>
        as-of
      </T>
      <T x={545} y={y + 32} s={12} f={C.badText} a="end" o={fwd}>
        current
      </T>
      <Grid y={116} bits={C2} sweep={sweep} ch={4} />
      <T x={25} y={226} s={13} f={C.secondary} o={easeOut(seg(t, 1.9, 2.2))}>
        current, not as-of
      </T>
      <T x={575} y={226} s={13} f={C.badText} a="end" o={easeOut(seg(t, 3.4, 3.7))}>
        0.231
      </T>
    </Svg>
  );
}

// 5 · A minute axis. A solid materialization tick at 0; the next scheduled one at 30, dashed — it hasn't landed. A blue
// band marks the 30-minute limit. A request drops in at 35, past the band's edge: "late?". After the answer, the request
// turns red and reads "unknown", and the band's edge lights as the limit.
export function PredictFreshnessSla({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const r = on ? easeOut(seg(s, 0.2, 0.7)) : 0;
  const X = (m: number) => 60 + m * 8;
  const y = 110;
  return (
    <Svg label="materialized every thirty minutes. A request lands thirty-five minutes later." h={220}>
      <rect x={X(0)} y={y - 30} width={X(30) - X(0)} height={44} fill={C.second} opacity={0.14 * easeOut(seg(t, 0.6, 1.0))} />
      <line x1={40} y1={y} x2={X(60)} y2={y} stroke={C.line} strokeWidth={1.2} opacity={easeOut(seg(t, 0, 0.3))} />
      <g opacity={easeOut(seg(t, 0.1, 0.4))}>
        <line x1={X(0)} y1={y - 30} x2={X(0)} y2={y + 14} stroke={C.focus} strokeWidth={2} />
        <T x={X(0)} y={y + 34} s={12} f={C.secondary} a="middle">
          0
        </T>
        <T x={X(0)} y={y - 40} s={12} f={C.focus}>
          materialized
        </T>
      </g>
      <g opacity={easeOut(seg(t, 0.4, 0.7))}>
        <line x1={X(30)} y1={y - 30} x2={X(30)} y2={y + 14} stroke={r > 0 ? C.focus : C.second} strokeWidth={r > 0 ? 2.4 : 1.4} strokeDasharray={r > 0 ? undefined : '4 3'} />
        <T x={X(30)} y={y + 34} s={12} f={C.secondary} a="middle">
          30
        </T>
      </g>
      <g opacity={easeOut(seg(t, 1.0, 1.4))}>
        <circle cx={X(35)} cy={y} r={6} fill={r > 0.5 ? C.badText : C.focus} />
        <T x={X(35) + 4} y={y + 34} s={12} f={C.secondary}>
          35 min
        </T>
      </g>
      <T x={575} y={y - 40} s={13} f={r > 0.5 ? C.badText : C.focus} a="end" w={600} o={easeOut(seg(t, 1.4, 1.7))}>
        {r > 0.5 ? 'unknown' : 'late?'}
      </T>
      <T x={25} y={200} s={12} f={C.focus} o={r}>
        the 30 min limit doesn't bend
      </T>
    </Svg>
  );
}

/** A staleness sawtooth over 0–135 min for pulses every `iv` min; age above 30 draws red. */
const Saw = ({ y0, iv, k }: { y0: number; iv: number; k: number }) => {
  const X = (m: number) => 40 + m * 3.9;
  const Y = (age: number) => y0 - age * 1.2;
  const segs: ReactElement[] = [];
  const end = 135 * k;
  for (let p = 0; p < end; p += iv) {
    const e = Math.min(p + iv, end);
    const okEnd = Math.min(e, p + 30);
    segs.push(<line key={`a${p}`} x1={X(p)} y1={Y(0)} x2={X(okEnd)} y2={Y(okEnd - p)} stroke={C.focus} strokeWidth={1.6} />);
    if (e > p + 30) segs.push(<line key={`b${p}`} x1={X(p + 30)} y1={Y(30)} x2={X(e)} y2={Y(e - p)} stroke={C.badText} strokeWidth={2.4} />);
    if (e === p + iv && e < end) segs.push(<line key={`c${p}`} x1={X(e)} y1={Y(e - p)} x2={X(e)} y2={Y(0)} stroke={C.line} strokeWidth={1} />);
  }
  return (
    <g>
      <line x1={X(0)} y1={Y(30)} x2={X(135)} y2={Y(30)} stroke={C.second} strokeWidth={1} strokeDasharray="4 3" />
      <line x1={X(0)} y1={y0} x2={X(135)} y2={y0} stroke={C.line} strokeWidth={1} />
      {segs}
    </g>
  );
};

// 6 · Two staleness sawtooths over 135 minutes, each tooth one materialization pulse, the dashed blue line the 30-minute
// limit. Every 45 min: each tooth climbs past the limit and the overage draws red — 0.313 of requests land there. Every
// 15 min: the teeth never reach it — 0.000.
export function RevealStaleValueSkew({ t }: StepCtx) {
  return (
    <Svg label="materialization measured as pulses, not a continuous flow." h={220}>
      <T x={25} y={20} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        pulse every 45 min
      </T>
      <Saw y0={88} iv={45} k={easeInOut(seg(t, 0.3, 1.9))} />
      <T x={575} y={20} s={13} f={C.badText} a="end" w={600} o={easeOut(seg(t, 1.9, 2.2))}>
        0.313 late
      </T>
      <T x={25} y={124} s={13} f={C.secondary} o={easeOut(seg(t, 2.0, 2.3))}>
        pulse every 15 min
      </T>
      <Saw y0={192} iv={15} k={easeInOut(seg(t, 2.2, 3.6))} />
      <T x={575} y={124} s={13} f={C.focus} a="end" w={600} o={easeOut(seg(t, 3.6, 3.9))}>
        0.000 late
      </T>
      <T x={575} y={214} s={12} f={C.second} a="end" o={easeOut(seg(t, 0.3, 0.6))}>
        dashed: 30 min limit
      </T>
    </Svg>
  );
}

// 7 · Four columns, each the same small glyph: a definition dot splitting into two stores. Feast (open source), Tecton
// (now Databricks), Hopsworks (independent), and a warehouse, whose two stores fold into one box. A bracket under
// all four: the same two pipes.
export function RevealNamedPlatforms({ t }: StepCtx) {
  const COLS = [
    { n: 'Feast', note: 'open source' },
    { n: 'Tecton', note: 'Databricks' },
    { n: 'Hopsworks', note: 'independent' },
    { n: 'warehouse', note: 'one system' },
  ];
  const fold = easeInOut(seg(t, 3.0, 3.6));
  return (
    <Svg label="four names, the same two pipes. What differs is who manages them." h={220}>
      {COLS.map((c, i) => {
        const x = 90 + i * 140;
        const k = easeOut(seg(t, 0.2 + i * 0.5, 0.7 + i * 0.5));
        const sp = i === 3 ? lerp(26, 0, fold) : 26;
        return (
          <g key={c.n} opacity={k}>
            <T x={x} y={34} s={13} f={C.primary} a="middle">
              {c.n}
            </T>
            <circle cx={x} cy={62} r={5} fill={C.focus} />
            <line x1={x} y1={66} x2={x - sp} y2={102} stroke={C.line} strokeWidth={1.4} />
            <line x1={x} y1={66} x2={x + sp} y2={102} stroke={C.line} strokeWidth={1.4} />
            {i === 3 && fold > 0.5 ? (
              <rect x={x - 26} y={102} width={52} height={20} rx={3} fill="none" stroke={C.second} strokeWidth={1.4} />
            ) : (
              <g>
                <rect x={x - sp - 13} y={102} width={26} height={20} rx={3} fill="none" stroke={C.primary} strokeWidth={1.2} />
                <rect x={x + sp - 13} y={102} width={26} height={20} rx={3} fill="none" stroke={C.primary} strokeWidth={1.2} />
              </g>
            )}
            <T x={x} y={i % 2 === 0 ? 182 : 204} s={12} f={C.secondary} a="middle">
              {c.note}
            </T>
          </g>
        );
      })}
      <g opacity={easeOut(seg(t, 3.7, 4.1))}>
        <path d="M40 134 v8 h520 v-8" fill="none" stroke={C.second} strokeWidth={1.2} />
        <T x={300} y={160} s={12} f={C.second} a="middle">
          the same two pipes
        </T>
      </g>
    </Svg>
  );
}

// 8 · The architecture, small: one definition, two pipes, two stores. Then three failures land one by one, each with a
// red ✕ on its line below and a mark on the drawing: a dashed second box beside the serving pipe, a red forward arrow
// out of the online store, and the online store's border going dashed — stale.
export function Recap({ t }: StepCtx) {
  const f = (i: number) => easeOut(seg(t, 1.2 + i * 1.0, 1.7 + i * 1.0));
  const FAIL = ['a second code path', 'current, not as-of', 'a stale pulse'];
  return (
    <Svg label="one definition, two stores, three ways the guarantee still breaks." h={240}>
      <g opacity={easeOut(seg(t, 0, 0.5))}>
        <rect x={220} y={10} width={160} height={30} rx={5} fill={C.panel} stroke={C.focus} strokeWidth={1.4} />
        <T x={300} y={30} s={13} f={C.focus} a="middle">
          one definition
        </T>
        <line x1={300} y1={40} x2={140} y2={92} stroke={C.line} strokeWidth={1.4} />
        <line x1={300} y1={40} x2={460} y2={92} stroke={C.line} strokeWidth={1.4} />
        <rect x={60} y={92} width={160} height={30} rx={5} fill={C.panel} stroke={C.line} strokeWidth={1.2} />
        <T x={140} y={112} s={13} f={C.primary} a="middle">
          offline
        </T>
      </g>
      <rect
        x={380}
        y={92}
        width={160}
        height={30}
        rx={5}
        fill={C.panel}
        stroke={f(2) > 0.5 ? C.badText : C.line}
        strokeWidth={1.2}
        strokeDasharray={f(2) > 0.5 ? '4 3' : undefined}
        opacity={easeOut(seg(t, 0, 0.5))}
      />
      <T x={460} y={112} s={13} f={C.primary} a="middle" o={easeOut(seg(t, 0, 0.5))}>
        online
      </T>
      <g opacity={f(0)}>
        <rect x={470} y={44} width={70} height={26} rx={4} fill={C.panel} stroke={C.badText} strokeWidth={1.2} strokeDasharray="4 3" />
        <T x={505} y={62} s={13} f={C.badText} a="middle">
          f′
        </T>
      </g>
      {f(1) > 0 && <path d={`M540 107 h${30 * f(1)}`} stroke={C.badText} strokeWidth={2} />}
      {FAIL.map((l, i) => (
        <g key={l} opacity={f(i)}>
          <Cross x={40} y={160 + i * 28} k={1} />
          <T x={60} y={165 + i * 28} s={13} f={C.secondary}>
            {l}
          </T>
        </g>
      ))}
    </Svg>
  );
}

// 9 · The feature store drawn inside a dashed boundary: one definition feeding two stores. Outside it, a dashboard box
// with its own hand-written query reaching straight to the raw tables. Before the answer: "?" on the dashboard. After it,
// the dashboard's query turns red, ✕: a second code path, outside the guarantee.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const r = on ? easeOut(seg(s, 0.2, 0.8)) : 0;
  return (
    <Svg label="a dashboard query recomputes the feature by hand. Protected?" h={220}>
      <g opacity={easeOut(seg(t, 0, 0.5))}>
        <rect x={25} y={14} width={330} height={150} rx={8} fill="none" stroke={C.second} strokeWidth={1.2} strokeDasharray="5 4" />
        <T x={40} y={36} s={12} f={C.second}>
          feature store
        </T>
        <rect x={130} y={48} width={120} height={28} rx={5} fill={C.panel} stroke={C.focus} strokeWidth={1.3} />
        <T x={190} y={67} s={13} f={C.focus} a="middle">
          definition
        </T>
        <line x1={190} y1={76} x2={110} y2={116} stroke={C.line} strokeWidth={1.3} />
        <line x1={190} y1={76} x2={270} y2={116} stroke={C.line} strokeWidth={1.3} />
        <rect x={45} y={116} width={130} height={28} rx={4} fill={C.panel} stroke={C.line} strokeWidth={1.1} />
        <T x={110} y={135} s={12} f={C.primary} a="middle">
          offline
        </T>
        <rect x={205} y={116} width={130} height={28} rx={4} fill={C.panel} stroke={C.line} strokeWidth={1.1} />
        <T x={270} y={135} s={12} f={C.primary} a="middle">
          online
        </T>
      </g>
      <g opacity={easeOut(seg(t, 0.8, 1.2))}>
        <rect x={405} y={48} width={170} height={34} rx={5} fill={C.panel} stroke={r > 0.5 ? C.badText : C.primary} strokeWidth={1.4} />
        <T x={490} y={70} s={13} f={r > 0.5 ? C.badText : C.primary} a="middle">
          dashboard
        </T>
        <rect x={405} y={130} width={170} height={34} rx={5} fill={C.panel} stroke={C.line} strokeWidth={1.1} />
        <T x={490} y={152} s={13} f={C.secondary} a="middle">
          raw tables
        </T>
      </g>
      <line x1={490} y1={130} x2={490} y2={lerp(130, 84, easeInOut(seg(t, 1.2, 1.8)))} stroke={r > 0.5 ? C.badText : C.focus} strokeWidth={1.8} strokeDasharray="4 3" />
      <T x={502} y={112} s={12} f={r > 0.5 ? C.badText : C.secondary} o={easeOut(seg(t, 1.5, 1.9))}>
        by hand
      </T>
      {!on ? (
        <T x={575} y={36} s={14} f={C.focus} a="end" o={easeOut(seg(t, 1.9, 2.3))}>
          ?
        </T>
      ) : (
        <Cross x={568} y={30} k={r} />
      )}
      <T x={25} y={200} s={13} f={C.badText} w={600} o={on ? easeOut(seg(s, 0.7, 1.2)) : 0}>
        outside the guarantee: cause one again
      </T>
    </Svg>
  );
}
