import { useEffect, useState } from "react";
import { C, Draw, Svg, T } from "../../../../../reels/kit";
import {
  easeInOut,
  easeOut,
  easeOutBack,
  lerp,
  seg,
} from "../../../../../reels/anim";
import type { StepCtx } from "../../../../../reels/types";

// Quality data and SPC: a control chart drawn from examples.py's seeded series, the control band against the
// customer's spec posts, false-alarm lanes for the WECO price, Cp/Cpk bells, and the chart split by tool.

/** Seconds since the learner answered a predict step (the player's clock has stopped by then), so reveals can animate. */
function useSinceAnswer(on: boolean) {
  const [s, setS] = useState(0);
  useEffect(() => {
    if (!on) {
      setS(0);
      return;
    }
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
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
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={4}
        fill={fill ?? C.panel}
        stroke={stroke ?? (lit ? C.focus : C.line)}
        strokeWidth={lit ? 1.8 : 1.1}
        strokeDasharray={dash}
      />
      <T
        x={x + w / 2}
        y={y + h / 2 + 5}
        s={13}
        f={f ?? (lit ? C.focus : C.primary)}
        a="middle"
      >
        {label}
      </T>
    </g>
  );

/** A label-left / value-right line under a drawing. */
const Line2 = ({
  y,
  l,
  r,
  o,
  rc = C.focus,
  lc = C.secondary,
  lx = 30,
}: {
  y: number;
  l: string;
  r: string;
  o: number;
  rc?: string;
  lc?: string;
  lx?: number;
}) =>
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
const Tick = ({
  x,
  y,
  k,
  color = C.focus,
}: {
  x: number;
  y: number;
  k: number;
  color?: string;
}) =>
  k <= 0 ? null : (
    <path
      d={`M${x - 5} ${y} l4 4 l8 -9`}
      fill="none"
      stroke={color}
      strokeWidth={2}
      opacity={k}
    />
  );

/** Quadratic ease-in, for a reading that falls onto the axis. */
const easeIn = (x: number) => x * x;

/** A red ✕. */
const Cross = ({ x, y, k }: { x: number; y: number; k: number }) =>
  k <= 0 ? null : (
    <g stroke={C.badText} strokeWidth={2.4} opacity={k}>
      <line x1={x - 7} y1={y - 7} x2={x + 7} y2={y + 7} />
      <line x1={x + 7} y1={y - 7} x2={x - 7} y2={y + 7} />
    </g>
  );

// examples.py's seeded series (rng seed 16): the 240 mixed readings in mixed-z units, then each tool on its own z.
// prettier-ignore
const MIXZ = [-1.03,-0.86,-1.1,-0.7,-1.19,-1.34,-0.62,-0.52,-0.24,-0.71,-0.8,-0.76,-0.02,-0.83,-0.95,-0.71,-1.06,-1.21,-1.17,-0.24,-0.27,-1.24,-1.02,-2.11,-0.91,-0.97,-1.52,-0.89,-1.32,-0.17,-0.83,-1.19,-1.01,-2.01,-0.78,-1.42,-0.58,-0.97,-1.38,0.27,-0.6,-1.11,-0.73,-0.9,-1.23,-1.27,-1.07,-0.22,-1.24,-0.32,-0.58,-0.75,-1.64,-1.15,-0.34,-0.23,-0.04,-0.53,-1.19,-0.51,-0.46,-0.97,-1.35,-0.88,-1.68,-0.38,-0.19,-0.4,-0.92,-0.41,-0.89,-1.37,-0.53,-1.59,0,-0.74,-0.91,-0.24,-1.42,-1.01,-0.06,-0.74,-0.94,-1.59,-0.69,-0.64,-1.56,-0.58,-1.43,-1.1,-0.31,-1.39,-0.27,-0.68,-0.9,-1.36,-0.62,-0.69,-1.1,-0.67,-1.54,-1.39,-0.66,-1.23,0.31,-0.86,-0.42,-1.46,-2.01,-1.47,-1.55,-0.96,-0.76,-1.13,-1.32,-1.53,-0.49,-0.59,-0.8,-1.17,1.01,0.94,1.08,0.88,1.96,0.44,1.28,1.39,0.48,0.22,0.8,0.93,0.95,0.19,0.68,1.17,0.88,0.22,0.66,1.14,0.55,1.57,1.57,1.43,1.04,0.33,0.62,0.53,1.09,1.16,0.84,0.9,1.74,1.23,0.94,-0.24,0.92,0.49,0.78,0.33,0.66,0.56,1.04,0.77,0.88,1.61,1.29,0.38,0.82,0.68,1.3,0.92,0.71,0.95,0.59,0.33,0.6,0.91,1.79,1.21,0.37,0.38,1.24,1.05,1.06,0.58,1.04,0.76,0.09,0.9,1.66,0.84,0.47,1.45,0.63,0.58,0.45,0.76,0.77,1.03,1.35,1.29,0.58,0.47,1.09,0.83,1.22,1.34,0.8,0.09,0.07,0.98,0.63,0.96,0.86,0.52,0.76,1.5,0.75,0.09,1.82,1.63,0.83,0.45,1.5,1.4,1.53,0.32,0.81,1.08,1.19,0.85,0.6,1.34,1.63,0.54,1.53,0.8,0.43,0.99];
// prettier-ignore
const AZ = [-0.29,0.05,-0.43,0.4,-0.63,-0.94,0.57,0.77,1.35,0.37,0.2,0.27,1.83,0.12,-0.12,0.38,-0.35,-0.67,-0.58,1.37,1.3,-0.74,-0.28,-2.57,-0.05,-0.16,-1.32,0.01,-0.91,1.51,0.12,-0.64,-0.26,-2.35,0.23,-1.12,0.65,-0.16,-1.03,2.43,0.61,-0.46,0.34,-0.03,-0.72,-0.8,-0.38,1.4,-0.73,1.2,0.64,0.3,-1.58,-0.55,1.16,1.39,1.79,0.76,-0.64,0.8,0.9,-0.17,-0.96,0.01,-1.66,1.07,1.47,1.03,-0.07,1.01,0,-1.01,0.75,-1.48,1.87,0.3,-0.03,1.36,-1.1,-0.26,1.74,0.32,-0.1,-1.47,0.42,0.53,-1.4,0.65,-1.13,-0.43,1.21,-1.04,1.3,0.45,-0.02,-0.99,0.56,0.42,-0.44,0.45,-1.37,-1.05,0.49,-0.71,2.52,0.06,0.97,-1.2,-2.35,-1.21,-1.39,-0.15,0.27,-0.5,-0.9,-1.35,0.83,0.63,0.18,-0.58];
// prettier-ignore
const BZ = [0.29,0.12,0.44,-0.02,2.48,-1.03,0.9,1.16,-0.95,-1.54,-0.2,0.1,0.13,-1.62,-0.48,0.66,-0.03,-1.56,-0.54,0.58,-0.79,1.57,1.57,1.24,0.35,-1.29,-0.61,-0.82,0.46,0.62,-0.12,0.03,1.97,0.78,0.12,-2.61,0.07,-0.92,-0.26,-1.29,-0.53,-0.77,0.34,-0.28,-0.02,1.67,0.92,-1.17,-0.17,-0.48,0.95,0.06,-0.41,0.14,-0.7,-1.29,-0.66,0.05,2.08,0.75,-1.19,-1.18,0.82,0.38,0.4,-0.71,0.36,-0.3,-1.85,0.03,1.77,-0.12,-0.96,1.29,-0.6,-0.71,-1.02,-0.29,-0.27,0.34,1.07,0.92,-0.71,-0.98,0.46,-0.15,0.76,1.03,-0.21,-1.84,-1.89,0.21,-0.6,0.17,-0.06,-0.86,-0.29,1.41,-0.32,-1.85,2.17,1.7,-0.14,-1.03,1.42,1.18,1.47,-1.33,-0.18,0.45,0.7,-0.08,-0.66,1.05,1.72,-0.82,1.48,-0.21,-1.06,0.24];
/** The mixed series' 196 trips, as index ranges [from, to] inclusive. */
const MIX_TRIPS: [number, number][] = [
  [7, 38],
  [47, 73],
  [82, 103],
  [110, 119],
  [127, 154],
  [163, 239],
];
/** Tool A's own four trips, stratified (tool B has none). */
const A_TRIPS = [13, 69, 110, 111];

const isMixTrip = (i: number) => MIX_TRIPS.some(([a, b]) => i >= a && i <= b);
const mixTripsUpTo = (n: number) =>
  MIX_TRIPS.reduce(
    (acc, [a, b]) => acc + Math.max(0, Math.min(b, n - 1) - a + 1),
    0,
  );

/** A false-alarm flag on a lane: a pole and a small pennant. */
const Flag = ({
  x,
  y,
  k,
  color = C.badText,
}: {
  x: number;
  y: number;
  k: number;
  color?: string;
}) =>
  k <= 0 ? null : (
    <g opacity={Math.min(1, k)}>
      <line
        x1={x}
        y1={y}
        x2={x}
        y2={y - 15 * Math.min(1, k)}
        stroke={color}
        strokeWidth={1.6}
      />
      <path
        d={`M${x} ${y - 15 * Math.min(1, k)} l9 3.5 l-9 3.5 z`}
        fill={color}
      />
    </g>
  );

// A false-alarm lane: 742 in-control points across x 40..560, a flag every `every` points.
const LX0 = 40;
const LX1 = 560;
const LANE_PTS = 742;
const laneX = (p: number) => LX0 + (p / LANE_PTS) * (LX1 - LX0);
const flagsAt = (every: number) => {
  const out: number[] = [];
  for (let p = every; p <= LANE_PTS + 0.5; p += every) out.push(p);
  return out;
};

/** One lane: the track, faint point ticks, flags that pop as the sweep `p` (0..1) passes them. */
function Lane({
  y,
  every,
  p,
  o = 1,
  color = C.badText,
  dim = false,
}: {
  y: number;
  every: number;
  p: number;
  o?: number;
  color?: string;
  dim?: boolean;
}) {
  if (o <= 0) return null;
  const at = p * LANE_PTS;
  return (
    <g opacity={Math.min(1, o)}>
      <line x1={LX0} y1={y} x2={LX1} y2={y} stroke={C.line} strokeWidth={1.2} />
      {Array.from({ length: 38 }, (_, i) => (
        <line
          key={i}
          x1={laneX(i * 20)}
          y1={y - 2}
          x2={laneX(i * 20)}
          y2={y + 2}
          stroke={C.line}
          strokeWidth={1}
        />
      ))}
      {p > 0 && p < 1 && (
        <line
          x1={laneX(at)}
          y1={y - 20}
          x2={laneX(at)}
          y2={y + 6}
          stroke={C.focus}
          strokeWidth={1.2}
          opacity={0.7}
        />
      )}
      {flagsAt(every).map((f) => (
        <Flag
          key={f}
          x={laneX(f)}
          y={y}
          k={easeOutBack(Math.min(1, Math.max(0, (at - f + 20) / 20)))}
          color={dim ? C.quiet : color}
        />
      ))}
    </g>
  );
}

// The coating-thickness axis shared by steps 2 and 3: 48.8 → 50.7 across x 60..560.
const cx = (v: number) => 60 + (v - 48.8) * 263;
const CTL_MEAN = 49.79;
const CTL_SD = 0.219;
const CTL_LCL = 49.13;
const CTL_UCL = 50.45;
const BELL: [number, number][] = Array.from({ length: 61 }, (_, i) => {
  const v = CTL_MEAN - 3.4 * CTL_SD + (i / 60) * 6.8 * CTL_SD;
  return [cx(v), 150 - 72 * Math.exp(-0.5 * ((v - CTL_MEAN) / CTL_SD) ** 2)];
});

/** The coating axis with its ticks. */
function CoatAxis({ o }: { o: number }) {
  return (
    <g opacity={o}>
      <line
        x1={60}
        y1={150}
        x2={560}
        y2={150}
        stroke={C.line}
        strokeWidth={1.2}
      />
      {[49.0, 49.5, 50.0, 50.5].map((v) => (
        <g key={v}>
          <line x1={cx(v)} y1={150} x2={cx(v)} y2={155} stroke={C.line} />
          <T x={cx(v)} y={170} s={12} f={C.quiet} a="middle">
            {v.toFixed(1)}
          </T>
        </g>
      ))}
    </g>
  );
}

// 1 · The mixed chart draws itself point by point and keeps tripping: every trip turns red and the counter climbs to
// 196. Then the same dots take their tool's colour, each tool gets its own narrow band, and only 4 trips stay red.
export function Hook({ t }: StepCtx) {
  const draw = seg(t, 0.2, 2.4);
  const n = Math.floor(240 * draw);
  const split = easeInOut(seg(t, 2.8, 3.6));
  const trips = mixTripsUpTo(n);
  const px = (i: number) => 40 + (i + 0.5) * (520 / 240);
  return (
    <Svg
      label="a coating-thickness chart trips a run rule four times in a week — split by tool, it's two in-control machines, not one unstable one"
      h={200}
    >
      <g opacity={easeOut(seg(t, 0, 0.3)) * (1 - 0.7 * split)}>
        <line
          x1={40}
          y1={100}
          x2={560}
          y2={100}
          stroke={C.line}
          strokeWidth={1.2}
        />
        {[40, 160].map((y) => (
          <line
            key={y}
            x1={40}
            y1={y}
            x2={560}
            y2={y}
            stroke={C.line}
            strokeDasharray="5 4"
          />
        ))}
        <T x={4} y={44} s={11} f={C.quiet}>
          UCL
        </T>
        <T x={4} y={164} s={11} f={C.quiet}>
          LCL
        </T>
      </g>
      {split > 0 && (
        <g opacity={split}>
          <rect
            x={40}
            y={117.8 - 28.6}
            width={260}
            height={57.2}
            fill={C.band}
          />
          <rect
            x={300}
            y={82.2 - 28.6}
            width={260}
            height={57.2}
            fill={C.band}
          />
          <line
            x1={40}
            y1={117.8}
            x2={300}
            y2={117.8}
            stroke={C.focus}
            strokeDasharray="4 3"
            opacity={0.6}
          />
          <line
            x1={300}
            y1={82.2}
            x2={560}
            y2={82.2}
            stroke={C.second}
            strokeDasharray="4 3"
            opacity={0.7}
          />
        </g>
      )}
      {MIXZ.slice(0, n).map((z, i) => {
        const trip = isMixTrip(i);
        const own = i < 120 ? C.focus : C.second;
        const stillRed = i < 120 && A_TRIPS.includes(i);
        const red = trip && (split < 0.5 || stillRed);
        return (
          <circle
            key={i}
            cx={px(i)}
            cy={100 - z * 20}
            r={stillRed && split > 0.5 ? 3.2 : 1.8}
            fill={red ? C.badText : split > 0.5 ? own : C.primary}
          />
        );
      })}
      {split < 0.5 ? (
        <T
          x={575}
          y={22}
          s={14}
          f={C.badText}
          a="end"
          o={easeOut(seg(t, 0.4, 0.7)) * (1 - split * 2)}
        >
          {`trips: ${trips}`}
        </T>
      ) : (
        <T x={575} y={22} s={14} f={C.focus} a="end" o={(split - 0.5) * 2}>
          split by tool: 4
        </T>
      )}
      <T x={40} y={192} s={13} f={C.secondary} o={easeOut(seg(t, 3.7, 4.2))}>
        tool A
      </T>
      <T
        x={560}
        y={192}
        s={13}
        f={C.second}
        a="end"
        o={easeOut(seg(t, 3.7, 4.2))}
      >
        tool B
      </T>
      <T
        x={300}
        y={192}
        s={13}
        f={C.focus}
        a="middle"
        o={easeOut(seg(t, 4.2, 4.7))}
      >
        two steady machines
      </T>
    </Svg>
  );
}

// 2 · The process's own history draws a bell; its control band (49.13–50.45) shades in behind it. Then the customer's
// spec limits drop in as pale-blue posts at 49.0 and 50.0 — a different pair of numbers on the same axis.
export function RevealLimits({ t }: StepCtx) {
  const band = easeOut(seg(t, 1.4, 2.0));
  const spec = easeOut(seg(t, 2.6, 3.2));
  return (
    <Svg
      label="control limits ask whether the process is stable; specification limits ask whether the product will work"
      h={200}
    >
      {band > 0 && (
        <g opacity={band}>
          <rect
            x={cx(CTL_LCL)}
            y={44}
            width={(cx(CTL_UCL) - cx(CTL_LCL)) * band}
            height={106}
            fill={C.band}
          />
          <line
            x1={cx(CTL_LCL)}
            y1={44}
            x2={cx(CTL_LCL)}
            y2={150}
            stroke={C.primary}
            strokeDasharray="4 3"
          />
          <line
            x1={cx(CTL_UCL)}
            y1={44}
            x2={cx(CTL_UCL)}
            y2={150}
            stroke={C.primary}
            strokeDasharray="4 3"
            opacity={band >= 1 ? 1 : 0}
          />
          <T x={cx(CTL_MEAN)} y={30} s={13} f={C.primary} a="middle">
            control · what it usually does
          </T>
        </g>
      )}
      <CoatAxis o={easeOut(seg(t, 0, 0.3))} />
      <Draw
        pts={BELL}
        t={t}
        from={0.2}
        to={1.3}
        stroke={C.focus}
        w={1.8}
        pen={false}
      />
      {spec > 0 && (
        <g opacity={spec}>
          {[49.0, 50.0].map((v) => (
            <line
              key={v}
              x1={cx(v)}
              y1={150 - 110 * spec}
              x2={cx(v)}
              y2={150}
              stroke={C.second}
              strokeWidth={2.2}
            />
          ))}
          <T x={cx(49.5)} y={192} s={13} f={C.second} a="middle">
            spec · what the customer needs
          </T>
        </g>
      )}
    </Svg>
  );
}

// 3 · One reading, 50.3, drops onto the axis. It lands inside the control band (tick) but past the 50.0 spec post (✕),
// and the slice of axis that is "in control, out of spec" lights red.
export function RevealInSpec({ t }: StepCtx) {
  const drop = easeIn(seg(t, 0.6, 1.4));
  const y = lerp(16, 150, drop);
  const mx = cx(50.3);
  return (
    <Svg
      label="one real coating measurement sits inside the process's own control band and outside the customer's spec limit, at the same time"
      h={200}
    >
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <rect
          x={cx(CTL_LCL)}
          y={72}
          width={cx(CTL_UCL) - cx(CTL_LCL)}
          height={78}
          fill={C.band}
        />
        <line
          x1={cx(CTL_LCL)}
          y1={72}
          x2={cx(CTL_LCL)}
          y2={150}
          stroke={C.primary}
          strokeDasharray="4 3"
        />
        <line
          x1={cx(CTL_UCL)}
          y1={72}
          x2={cx(CTL_UCL)}
          y2={150}
          stroke={C.primary}
          strokeDasharray="4 3"
        />
        {[49.0, 50.0].map((v) => (
          <line
            key={v}
            x1={cx(v)}
            y1={72}
            x2={cx(v)}
            y2={150}
            stroke={C.second}
            strokeWidth={2.2}
          />
        ))}
        <path
          d={`M${BELL.map(([a, b]) => `${a} ${b}`).join(" L")}`}
          fill="none"
          stroke={C.secondary}
          strokeWidth={1.4}
        />
      </g>
      <CoatAxis o={easeOut(seg(t, 0, 0.3))} />
      {seg(t, 2.8, 3.4) > 0 && (
        <rect
          x={cx(50.0)}
          y={147}
          width={(cx(CTL_UCL) - cx(50.0)) * easeOut(seg(t, 2.8, 3.4))}
          height={6}
          fill={C.badText}
          opacity={0.85}
        />
      )}
      {drop > 0 && (
        <g>
          <line
            x1={mx}
            y1={Math.min(y, 40)}
            x2={mx}
            y2={y}
            stroke={C.focus}
            strokeWidth={1.4}
            opacity={drop >= 1 ? 0.6 : 0}
          />
          <circle cx={mx} cy={y} r={6} fill={C.focus} />
          <T
            x={mx}
            y={30}
            s={14}
            f={C.focus}
            a="middle"
            o={easeOut(seg(t, 1.3, 1.6))}
          >
            50.3
          </T>
        </g>
      )}
      <T x={70} y={34} s={14} f={C.primary} o={easeOut(seg(t, 1.7, 2.1))}>
        in control
      </T>
      <Tick x={232} y={29} k={easeOut(seg(t, 1.9, 2.3))} />
      <T x={70} y={62} s={14} f={C.primary} o={easeOut(seg(t, 2.3, 2.7))}>
        in spec
      </T>
      <Cross x={236} y={57} k={easeOut(seg(t, 2.5, 2.9))} />
      <T
        x={300}
        y={194}
        s={13}
        f={C.focus}
        a="middle"
        o={easeOut(seg(t, 3.6, 4.1))}
      >
        stable process · bad part
      </T>
    </Svg>
  );
}

// 4 · Tool A alone (examples.py points 96–119) — a process that is genuinely in control — draws across the zone bands,
// and the three WECO rules arrive as chips. After the answer, four of five points past one sigma light red: pure noise,
// flagged by the "4 of 5" rule.
const PZ = AZ.slice(96, 120);
const ppx = (i: number) => 60 + i * 20.5;
const ppy = (z: number) => 96 - z * 17;
export function PredictRules({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const hit = on ? easeOut(seg(s, 0.2, 0.7)) : 0;
  const pts = PZ.map((z, i) => [ppx(i), ppy(z)] as [number, number]);
  const chips = ["beyond 3σ", "2 of 3 past 2σ", "4 of 5 past 1σ"];
  return (
    <Svg
      label="Western Electric's zone rules catch patterns a lone three-sigma check misses — does adding rules like these to a chart ever cost anything?"
      h={200}
    >
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <rect x={50} y={ppy(1)} width={500} height={34} fill={C.band} />
        {[1, 2, 3].map((k) => (
          <g key={k}>
            <line
              x1={50}
              y1={ppy(k)}
              x2={550}
              y2={ppy(k)}
              stroke={C.line}
              strokeDasharray={k === 3 ? undefined : "4 4"}
            />
            <line
              x1={50}
              y1={ppy(-k)}
              x2={550}
              y2={ppy(-k)}
              stroke={C.line}
              strokeDasharray={k === 3 ? undefined : "4 4"}
            />
            <T x={556} y={ppy(k) + 4} s={11} f={C.quiet}>
              {`${k}σ`}
            </T>
          </g>
        ))}
        <line
          x1={50}
          y1={96}
          x2={550}
          y2={96}
          stroke={C.mocha}
          strokeWidth={1.2}
        />
      </g>
      {hit > 0 && (
        <rect
          x={ppx(10) - 9}
          y={ppy(-0.8)}
          width={ppx(14) - ppx(10) + 18}
          height={ppy(-2.6) - ppy(-0.8)}
          rx={5}
          fill="none"
          stroke={C.badText}
          strokeWidth={1.6}
          opacity={hit}
        />
      )}
      <Draw
        pts={pts}
        t={on ? 99 : t}
        from={0.3}
        to={2.0}
        stroke={C.secondary}
        w={1.1}
        pen={false}
      />
      {PZ.map((z, i) => {
        const shown = on || t >= 0.3 + (i / 23) * 1.7;
        const red = hit > 0 && i >= 10 && i <= 14 && z < -1;
        return shown ? (
          <circle
            key={i}
            cx={ppx(i)}
            cy={ppy(z)}
            r={3}
            fill={red ? C.badText : C.focus}
          />
        ) : null;
      })}
      {chips.map((c, i) => (
        <Box
          key={c}
          x={20 + i * 195}
          y={162}
          w={175}
          h={28}
          label={c}
          o={on ? 1 : easeOutBack(seg(t, 2.0 + i * 0.35, 2.4 + i * 0.35))}
          stroke={i === 2 && hit > 0 ? C.badText : undefined}
          f={i === 2 && hit > 0 ? C.badText : undefined}
        />
      ))}
      {on ? (
        <T
          x={300}
          y={22}
          s={13}
          f={C.badText}
          a="middle"
          o={easeOut(seg(s, 0.5, 0.9))}
        >
          a steady machine, flagged anyway
        </T>
      ) : (
        <T
          x={300}
          y={22}
          s={14}
          f={C.secondary}
          a="middle"
          o={easeOut(seg(t, 3.2, 3.6))}
        >
          free, or a price?
        </T>
      )}
    </Svg>
  );
}

// 5 · Two lanes of 742 in-control points. One cursor sweeps both: the three-sigma lane raises a false-alarm flag every
// 371 points (two flags), the zone-rule lane every 91.75 points (eight).
export function RevealPrice({ t }: StepCtx) {
  const p = seg(t, 0.8, 4.0);
  return (
    <Svg
      label="simulated false-alarm gaps: about 371 points for the three-sigma rule alone, about 91.75 once the zone rules are added, matching NIST almost exactly"
      h={200}
    >
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <T x={40} y={46} s={14} f={C.primary}>
          three-sigma alone
        </T>
        <T x={560} y={46} s={14} f={C.focus} a="end">
          1 in 371
        </T>
      </g>
      <Lane y={76} every={371} p={p} o={easeOut(seg(t, 0, 0.4))} />
      <g opacity={easeOut(seg(t, 0.3, 0.7))}>
        <T x={40} y={116} s={14} f={C.primary}>
          plus the zone rules
        </T>
        <T x={560} y={116} s={14} f={C.focus} a="end">
          1 in 91.75
        </T>
      </g>
      <Lane y={146} every={91.75} p={p} o={easeOut(seg(t, 0.3, 0.7))} />
      <T
        x={300}
        y={188}
        s={12}
        f={C.secondary}
        a="middle"
        o={easeOut(seg(t, 4.2, 4.7))}
      >
        simulated: 370.3 and 91.4
      </T>
    </Svg>
  );
}

// 6 · The two lanes stay; a third arrives — the eighth rule on top — and its sweep plants a flag every 54 points.
export function RevealEighth({ t }: StepCtx) {
  const p3 = seg(t, 1.0, 3.6);
  const rows = [
    { y: 50, l: "three-sigma alone", r: "1 in 371", every: 371 },
    { y: 112, l: "rules one to three", r: "1 in 91.75", every: 91.75 },
  ];
  return (
    <Svg
      label="NIST's 91.75 belongs to exactly three zone rules; adding the eighth consecutive-points rule shortens the measured false-alarm gap again, on top of that"
      h={220}
    >
      {rows.map((r, i) => (
        <g key={r.l} opacity={easeOut(seg(t, i * 0.2, 0.4 + i * 0.2))}>
          <T x={40} y={r.y - 22} s={13} f={C.secondary}>
            {r.l}
          </T>
          <T x={560} y={r.y - 22} s={13} f={C.primary} a="end">
            {r.r}
          </T>
          <Lane y={r.y} every={r.every} p={1} />
        </g>
      ))}
      <g opacity={easeOut(seg(t, 0.6, 1.0))}>
        <T x={40} y={152} s={14} f={C.focus}>
          plus the eighth rule
        </T>
        <T
          x={560}
          y={152}
          s={14}
          f={C.badText}
          a="end"
          o={easeOut(seg(t, 3.4, 3.8))}
        >
          1 in 54
        </T>
      </g>
      <Lane y={182} every={54} p={p3} o={easeOut(seg(t, 0.6, 1.0))} />
      <rect
        x={432}
        y={74}
        width={134}
        height={22}
        rx={4}
        fill="none"
        stroke={C.focus}
        strokeWidth={1.2}
        opacity={easeOut(seg(t, 3.9, 4.3))}
      />
      <T
        x={300}
        y={212}
        s={12}
        f={C.secondary}
        a="middle"
        o={easeOut(seg(t, 4.0, 4.5))}
      >
        NIST's 91.75 covers three rules only
      </T>
    </Svg>
  );
}

// 7 · Spec posts at 32 and 48. A centred bell (white) and a same-width bell shifted to 44 (pale blue) draw in. The
// shifted bell's tail past the upper limit fills red; the table fills in: Cp close, Cpk 1.35 vs 0.66.
const kx = (v: number) => 60 + (v - 30) * 26;
const bell = (mu: number): [number, number][] =>
  Array.from({ length: 61 }, (_, i) => {
    const v = mu - 6 + (i / 60) * 12;
    return [kx(v), 130 - 78 * Math.exp(-0.5 * ((v - mu) / 2) ** 2)];
  });
const B40 = bell(40);
const B44 = bell(44);
const TAIL =
  `M${kx(48)} 130 ` +
  B44.filter(([x]) => x >= kx(48))
    .map(([x, y]) => `L${x} ${y}`)
    .join(" ") +
  ` L${kx(50)} 130 Z`;
export function RevealCpCpk({ t }: StepCtx) {
  const tail = easeOut(seg(t, 2.6, 3.2));
  const head = easeOut(seg(t, 1.8, 2.2));
  return (
    <Svg
      label="two processes of identical spread: close Cp values, but the off-centre process's Cpk trails its own Cp by a real, measured margin"
      h={220}
    >
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <line
          x1={60}
          y1={130}
          x2={580}
          y2={130}
          stroke={C.line}
          strokeWidth={1.2}
        />
        {[32, 48].map((v) => (
          <line
            key={v}
            x1={kx(v)}
            y1={34}
            x2={kx(v)}
            y2={130}
            stroke={C.primary}
            strokeDasharray="5 4"
          />
        ))}
        <T x={kx(32)} y={148} s={12} f={C.quiet} a="middle">
          LSL 32
        </T>
        <T x={kx(40)} y={148} s={12} f={C.quiet} a="middle">
          40
        </T>
        <T x={kx(48)} y={148} s={12} f={C.quiet} a="middle">
          USL 48
        </T>
      </g>
      {tail > 0 && <path d={TAIL} fill={C.bad} opacity={tail} />}
      <Draw
        pts={B40}
        t={t}
        from={0.3}
        to={1.2}
        stroke={C.focus}
        w={1.8}
        pen={false}
      />
      <Draw
        pts={B44}
        t={t}
        from={0.9}
        to={1.8}
        stroke={C.second}
        w={1.8}
        pen={false}
      />
      <T x={524} y={40} s={12} f={C.badText} a="end" o={tail}>
        past USL →
      </T>
      <g opacity={head}>
        <T x={400} y={168} s={12} f={C.quiet} a="end">
          Cp
        </T>
        <T x={560} y={168} s={12} f={C.quiet} a="end">
          Cpk
        </T>
      </g>
      <g opacity={easeOut(seg(t, 2.0, 2.4))}>
        <T x={40} y={188} s={14} f={C.primary}>
          centred
        </T>
        <T x={400} y={188} s={14} f={C.focus} a="end">
          1.35
        </T>
        <T x={560} y={188} s={14} f={C.focus} a="end">
          1.35
        </T>
      </g>
      <g opacity={easeOut(seg(t, 2.6, 3.0))}>
        <T x={40} y={212} s={14} f={C.second}>
          off-centre
        </T>
        <T x={400} y={212} s={14} f={C.second} a="end">
          1.31
        </T>
      </g>
      <T
        x={560}
        y={212}
        s={14}
        f={C.badText}
        a="end"
        o={easeOut(seg(t, 3.3, 3.7))}
      >
        0.66
      </T>
    </Svg>
  );
}

// 8 · The 240 mixed readings on one chart; the trip counter climbs to 196. Then every dot flies to its own tool's lane,
// rescaled to that tool's own limits: tool A (white) keeps 4 trips, tool B (pale blue) none.
export function RevealStratify({ t }: StepCtx) {
  const show = easeOut(seg(t, 0, 0.8));
  const count = mixTripsUpTo(Math.floor(240 * seg(t, 0.8, 1.8)));
  const k = easeInOut(seg(t, 2.4, 3.4));
  return (
    <Svg
      label="the mixed series trips several run rules; split by tool, each tool's own series trips far fewer — the same measurements, a different grouping"
      h={200}
    >
      <g opacity={show * (1 - k)}>
        <line
          x1={40}
          y1={100}
          x2={560}
          y2={100}
          stroke={C.line}
          strokeWidth={1.2}
        />
        {[40, 160].map((y) => (
          <line
            key={y}
            x1={40}
            y1={y}
            x2={560}
            y2={y}
            stroke={C.line}
            strokeDasharray="5 4"
          />
        ))}
      </g>
      {k > 0 && (
        <g opacity={k}>
          {[55, 145].map((c) => (
            <g key={c}>
              <line
                x1={40}
                y1={c}
                x2={560}
                y2={c}
                stroke={C.line}
                strokeWidth={1.2}
              />
              <line
                x1={40}
                y1={c - 27}
                x2={560}
                y2={c - 27}
                stroke={C.line}
                strokeDasharray="5 4"
              />
              <line
                x1={40}
                y1={c + 27}
                x2={560}
                y2={c + 27}
                stroke={C.line}
                strokeDasharray="5 4"
              />
            </g>
          ))}
        </g>
      )}
      {MIXZ.map((z, i) => {
        const a = i < 120;
        const j = a ? i : i - 120;
        const x0 = 40 + (i + 0.5) * (520 / 240);
        const y0 = 100 - z * 20;
        const x1 = 40 + (j + 0.5) * (520 / 120);
        const y1 = a ? 55 - AZ[j] * 9 : 145 - BZ[j] * 9;
        const tripped = i < Math.floor(240 * seg(t, 0.8, 1.8)) && isMixTrip(i);
        const red = k < 0.5 ? tripped : a && A_TRIPS.includes(j);
        const fill = red
          ? C.badText
          : k >= 0.5
            ? a
              ? C.focus
              : C.second
            : C.primary;
        return (
          <circle
            key={i}
            cx={lerp(x0, x1, k)}
            cy={lerp(y0, y1, k)}
            r={k >= 0.5 && red ? 3.2 : 1.8}
            fill={fill}
            opacity={show}
          />
        );
      })}
      <T
        x={575}
        y={22}
        s={14}
        f={C.badText}
        a="end"
        o={easeOut(seg(t, 0.8, 1.0)) * (1 - easeOut(seg(t, 2.2, 2.5)))}
      >
        {`mixed · ${count} trips`}
      </T>
      <T x={40} y={20} s={13} f={C.focus} o={easeOut(seg(t, 3.4, 3.8))}>
        tool A · 4 trips
      </T>
      <T x={40} y={110} s={13} f={C.second} o={easeOut(seg(t, 3.6, 4.0))}>
        tool B · 0 trips
      </T>
    </Svg>
  );
}

// 9 · The inspection arrives carrying its context chips (recipe-v3, tool-east, day). A non-conformance keys to it, a
// CAPA keys to that and starts with verified = 0. Last, the context chips light up: they are what makes it analysable.
export function RevealCapa({ t }: StepCtx) {
  const ctx = easeOut(seg(t, 4.4, 4.9));
  const chips: [string, number, number][] = [
    ["recipe-v3", 250, 115],
    ["tool-east", 375, 115],
    ["day", 500, 70],
  ];
  return (
    <Svg
      label="an inspection carries its recipe version, tool and shift; a non-conformance keys to the inspection; a CAPA keys to the non-conformance and starts unverified"
      h={260}
    >
      <Box
        x={30}
        y={16}
        w={200}
        h={32}
        label="inspection · 50.3"
        o={easeOut(seg(t, 0, 0.4))}
      />
      {chips.map(([l, x, w], i) => (
        <Box
          key={l}
          x={x}
          y={18}
          w={w}
          h={28}
          label={l}
          lit={ctx > 0.5}
          o={easeOutBack(seg(t, 0.4 + i * 0.2, 0.8 + i * 0.2))}
        />
      ))}
      <Draw
        pts={[
          [130, 48],
          [130, 88],
        ]}
        t={t}
        from={1.2}
        to={1.6}
        stroke={C.line}
        w={1.4}
        pen={false}
      />
      <Box
        x={30}
        y={88}
        w={200}
        h={32}
        label="non-conformance"
        o={easeOut(seg(t, 1.5, 1.9))}
      />
      <T x={250} y={109} s={13} f={C.secondary} o={easeOut(seg(t, 1.8, 2.2))}>
        above USL, keyed to it
      </T>
      <Draw
        pts={[
          [130, 120],
          [130, 160],
        ]}
        t={t}
        from={2.3}
        to={2.7}
        stroke={C.line}
        w={1.4}
        pen={false}
      />
      <Box
        x={30}
        y={160}
        w={200}
        h={32}
        label="CAPA"
        stroke={C.second}
        f={C.second}
        o={easeOut(seg(t, 2.6, 3.0))}
      />
      <T x={250} y={174} s={13} f={C.secondary} o={easeOut(seg(t, 2.9, 3.3))}>
        cause: die wear
      </T>
      <T x={250} y={214} s={13} f={C.secondary} o={easeOut(seg(t, 3.3, 3.7))}>
        due 2026-11-07
      </T>
      <T x={250} y={194} s={13} f={C.secondary} o={easeOut(seg(t, 3.1, 3.5))}>
        owner: line-4 supervisor
      </T>
      <T x={30} y={238} s={14} f={C.badText} o={easeOut(seg(t, 3.6, 4.0))}>
        verified = 0
      </T>
      {ctx > 0 && (
        <g opacity={ctx}>
          <path
            d="M310 46 L310 62 L130 62"
            fill="none"
            stroke={C.focus}
            strokeWidth={1.2}
            strokeDasharray="3 3"
          />
          <path
            d="M435 46 L435 62"
            fill="none"
            stroke={C.focus}
            strokeWidth={1.2}
            strokeDasharray="3 3"
          />
          <path
            d="M535 46 L535 62 L435 62"
            fill="none"
            stroke={C.focus}
            strokeWidth={1.2}
            strokeDasharray="3 3"
          />
        </g>
      )}
      <T
        x={575}
        y={238}
        s={13}
        f={C.focus}
        a="end"
        o={easeOut(seg(t, 4.6, 5.0))}
      >
        context makes it analysable
      </T>
    </Svg>
  );
}

// 10 · Five rows, each with its own miniature of the step it recalls, arriving one per beat.
const MINI = [
  (k: number) => (
    <g>
      <line
        x1={36}
        y1={-12}
        x2={36}
        y2={6}
        stroke={C.primary}
        strokeDasharray="3 2"
      />
      <line
        x1={104}
        y1={-12}
        x2={104}
        y2={6}
        stroke={C.primary}
        strokeDasharray="3 2"
      />
      <line
        x1={28}
        y1={-12}
        x2={28}
        y2={6}
        stroke={C.second}
        strokeWidth={2}
        opacity={k}
      />
      <line
        x1={80}
        y1={-12}
        x2={80}
        y2={6}
        stroke={C.second}
        strokeWidth={2}
        opacity={k}
      />
    </g>
  ),
  (k: number) => (
    <g>
      <line x1={30} y1={6} x2={110} y2={6} stroke={C.line} />
      {[45, 65, 85, 105].map((x, i) => (
        <Flag key={x} x={x} y={6} k={seg(k, i * 0.2, i * 0.2 + 0.3)} />
      ))}
    </g>
  ),
  (k: number) => (
    <g>
      <line x1={30} y1={6} x2={110} y2={6} stroke={C.line} />
      {[38, 50, 62, 74, 86, 98].map((x, i) => (
        <Flag key={x} x={x} y={6} k={seg(k, i * 0.12, i * 0.12 + 0.3)} />
      ))}
    </g>
  ),
  (k: number) => (
    <g>
      <path
        d={`M30 6 Q50 ${6 - 24 * k} 70 6`}
        fill="none"
        stroke={C.focus}
        strokeWidth={1.4}
      />
      <path
        d={`M60 6 Q80 ${6 - 24 * k} 100 6`}
        fill="none"
        stroke={C.second}
        strokeWidth={1.4}
      />
      <line
        x1={92}
        y1={-14}
        x2={92}
        y2={6}
        stroke={C.badText}
        strokeDasharray="3 2"
      />
    </g>
  ),
  (k: number) => (
    <g>
      {Array.from({ length: 8 }, (_, i) => (
        <circle
          key={i}
          cx={34 + i * 10}
          cy={lerp(-4, i < 4 ? -10 : 2, k)}
          r={2.2}
          fill={k > 0.5 ? (i < 4 ? C.focus : C.second) : C.primary}
        />
      ))}
    </g>
  ),
];
export function Recap({ t }: StepCtx) {
  const rows = [
    "control vs. spec: two questions",
    "zone rules: 371 → 91.75",
    "eighth rule: shorter again",
    "Cp high, Cpk low: centring",
    "split by tool: two calm charts",
  ];
  return (
    <Svg
      label="control vs. spec limits, the measured WECO price matching NIST, the eighth rule's own cost, the Cp/Cpk centring trap, and a chart split in two by tool"
      h={260}
    >
      {rows.map((r, i) => {
        const a = 0.2 + i * 0.85;
        const o = easeOut(seg(t, a, a + 0.4));
        const k = easeOut(seg(t, a + 0.2, a + 0.8));
        const y = 40 + i * 46;
        return o <= 0 ? null : (
          <g
            key={r}
            opacity={o}
            transform={`translate(${lerp(-12, 0, o)} ${y})`}
          >
            {MINI[i](k)}
            <T x={140} y={5} s={14} f={i === 3 ? C.badText : C.primary}>
              {r}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

// 11 · The three-sigma lane and the zone-rule lane, flags already planted. The zone rules' switch flips off and their
// flags grey out. After the answer the three-sigma lane's own two flags pulse in place: still one in 371.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const off = on ? 1 : easeInOut(seg(t, 1.2, 1.8));
  const pulse = on
    ? 1 + 0.25 * Math.sin(Math.min(s, 3) * 6) * (1 - seg(s, 0, 3))
    : 1;
  return (
    <Svg
      label="a supervisor turns off the extra zone rules, keeping only the three-sigma check — does that make the three-sigma rule itself any less trustworthy?"
      h={200}
    >
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <T x={40} y={46} s={14} f={C.primary}>
          three-sigma check
        </T>
        <T x={560} y={46} s={14} f={C.focus} a="end">
          {on ? "still 1 in 371" : "1 in 371"}
        </T>
        <g transform={`translate(0 ${76 * (1 - pulse)}) scale(1 ${pulse})`}>
          <Lane y={76} every={371} p={1} />
        </g>
      </g>
      <Tick x={571} y={41} k={on ? easeOut(seg(s, 0.4, 0.8)) : 0} />
      <g opacity={easeOut(seg(t, 0.2, 0.6))}>
        <T
          x={40}
          y={116}
          s={14}
          f={lerp(0, 1, off) > 0.5 ? C.quiet : C.primary}
        >
          zone rules
        </T>
        <rect
          x={500}
          y={102}
          width={60}
          height={20}
          rx={10}
          fill={off > 0.5 ? C.band : C.panel}
          stroke={C.line}
        />
        <circle
          cx={lerp(550, 510, off)}
          cy={112}
          r={7}
          fill={off > 0.5 ? C.quiet : C.focus}
        />
        <T x={490} y={117} s={12} f={C.quiet} a="end">
          {off > 0.5 ? "off" : "on"}
        </T>
        <Lane y={146} every={91.75} p={1} dim={off > 0.5} o={1 - 0.5 * off} />
      </g>
      {!on ? (
        <T
          x={300}
          y={188}
          s={14}
          f={C.secondary}
          a="middle"
          o={easeOut(seg(t, 2.2, 2.6))}
        >
          is the check left running any weaker?
        </T>
      ) : (
        <T
          x={300}
          y={188}
          s={13}
          f={C.focus}
          a="middle"
          o={easeOut(seg(s, 0.6, 1.0))}
        >
          only the other rules' alarms are gone
        </T>
      )}
    </Svg>
  );
}
