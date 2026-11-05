import { useEffect, useState } from 'react';
import { C, Decode, Draw, Reticle, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, fmt, lerp, rng, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// Values from examples.py: node A's clock runs one hundred ms fast, B is accurate, and B writes fifty ms after A in
// real time, so A stamps 100 and B stamps 50; quartz at Spanner's 200 ppm drifts 17.3 s a day; NTP with a true
// thirty-ms offset reads 30 ms over a symmetric path and 65 ms over an 80/10 ms asymmetric one; a linear leap smear
// and a step are 0.5 s apart at the midpoint; the bounded clocks read A as [-20, 220] ms and B as [40, 60] ms.
// Red only for the lost write, a wrong reading or a stale one; pale blue only for the second clock in a pair.

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

/** A process lane: its name left of the rule, the rule drawing itself from x0 to x1. */
function Lane({ y, name, t, from = 0, x0 = 90, x1 = 580, f = C.secondary }: { y: number; name: string; t: number; from?: number; x0?: number; x1?: number; f?: string }) {
  return (
    <g>
      <T x={x0 - 12} y={y + 5} s={13} a="end" f={f} o={easeOut(seg(t, from, from + 0.4))}>
        {name}
      </T>
      <Draw pts={[[x0, y], [x1, y]]} t={t} from={from} to={from + 0.6} stroke={C.line} w={1.5} pen={false} />
    </g>
  );
}

/** A message arrow from a to b over [from, to] with a pellet on its tip and a head when it lands. */
function Msg({ a, b, t, from, to, color = C.crema }: { a: Pt; b: Pt; t: number; from: number; to: number; color?: string }) {
  const k = easeInOut(seg(t, from, to));
  if (k <= 0) return null;
  const tip: Pt = [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const head = (s: number) => `${(b[0] - 9 * Math.cos(ang + s)).toFixed(1)} ${(b[1] - 9 * Math.sin(ang + s)).toFixed(1)}`;
  return (
    <g>
      <line x1={a[0]} y1={a[1]} x2={tip[0]} y2={tip[1]} stroke={color} strokeWidth={1.6} />
      {k < 1 ? <circle cx={tip[0]} cy={tip[1]} r={4.5} fill={C.focus} /> : <path d={`M${head(0.45)} L${b[0]} ${b[1]} L${head(-0.45)}`} fill="none" stroke={color} strokeWidth={1.6} />}
    </g>
  );
}

const Cross = ({ at: [x, y], o = 1, r = 7 }: { at: Pt; o?: number; r?: number }) => (
  <path d={`M${x - r} ${y - r} L${x + r} ${y + r} M${x + r} ${y - r} L${x - r} ${y + r}`} stroke={C.badText} strokeWidth={2.2} opacity={o} />
);

/** A timestamp tag: a small box above a write, its number decoding in. */
function Stamp({ at: [x, y], text, t, when, f = C.focus, o = 1 }: { at: Pt; text: string; t: number; when: number; f?: string; o?: number }) {
  const k = easeOut(seg(t, when - 0.2, when + 0.1)) * o;
  const w = Math.max(84, text.length * 12);
  return (
    <g opacity={k}>
      <rect x={x - w / 2} y={y - 15} width={w} height={24} rx={3} fill={C.panel} stroke={f === C.focus ? C.crema : f} strokeWidth={1.2} />
      <Decode text={text} t={t} at={when} x={x} y={y + 2} s={14} a="middle" f={f} w={600} />
    </g>
  );
}

/** The register race shared by the hook and its prediction: A writes first but stamps 100, B writes second and stamps 50. */
function Race({ t, k, sent, lost, showStamps = true }: { t: number; k: number; sent: number; lost: number; showStamps?: boolean }) {
  const AX = 200, BX = 300;
  return (
    <g>
      <Lane y={80} name="node A" t={t} x1={420} />
      <Lane y={160} name="node B" t={t} from={0.15} x1={420} />
      <g opacity={k}>
        <circle cx={AX} cy={80} r={6} fill={C.focus} />
        <circle cx={BX} cy={160} r={6} fill={lost > 0.5 ? C.badText : C.focus} opacity={1 - lost * 0.3} />
        <line x1={AX} y1={86} x2={AX} y2={238} stroke={C.line} strokeDasharray="3 4" />
        <line x1={BX} y1={166} x2={BX} y2={238} stroke={C.line} strokeDasharray="3 4" />
      </g>
      <Draw pts={[[90, 244], [420, 244]]} t={t} from={0.2} to={0.8} stroke={C.secondary} w={1.5} pen={false} />
      <T x={420} y={290} s={13} a="end" f={C.quiet} o={k}>
        real time →
      </T>
      <T x={AX} y={262} s={13} a="middle" f={C.secondary} o={k}>
        first
      </T>
      <T x={BX} y={262} s={13} a="middle" f={lost > 0.5 ? C.badText : C.primary} o={k}>
        second
      </T>
      {showStamps && <Stamp at={[AX, 50]} text="100 ms" t={t} when={1.3} />}
      {showStamps && <Stamp at={[BX, 130]} text="50 ms" t={t} when={1.6} f={lost > 0.5 ? C.badText : C.focus} />}
      <g opacity={k}>
        <rect x={470} y={95} width={110} height={50} rx={4} fill={C.panel} stroke={C.crema} strokeWidth={1.5} />
        <T x={525} y={86} s={13} a="middle" f={C.secondary}>
          store
        </T>
      </g>
      <Msg a={[AX + 8, 80]} b={[468, 112]} t={t} from={sent} to={sent + 0.6} color={C.quiet} />
      <Msg a={[BX + 8, 160]} b={[468, 130]} t={t} from={sent + 0.2} to={sent + 0.8} color={C.quiet} />
    </g>
  );
}

// 1 · Two synced nodes, writes in the right real-time order; A's fast clock stamps the earlier write 100, B stamps
// the later one 50, and the store keeps the larger number. The later write falls out.
export function Hook({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.2, 0.7));
  const lost = easeOut(seg(t, 3.0, 3.4));
  const kept = easeOut(seg(t, 2.8, 3.1));
  return (
    <Svg label="two nodes, both reporting themselves synchronised by NTP, accept a pair of writes a short moment apart in the correct real-time order — the store keeps the earlier one. Whose write just vanished, and how?" h={300}>
      <Race t={t} k={k} sent={2.0} lost={lost} />
      <Decode text="synced" t={t} at={0.7} x={20} y={104} s={13} f={C.quiet} />
      <Decode text="synced" t={t} at={0.9} x={20} y={184} s={13} f={C.quiet} />
      <T x={525} y={126} s={15} a="middle" f={C.focus} w={600} o={kept}>
        keeps A
      </T>
      <Cross at={[BX_OF_RACE, 160]} o={lost} r={11} />
      <Reticle x={BX_OF_RACE} y={160} w={44} h={40} t={t} at={4.1} color={C.badText} />
    </Svg>
  );
}
const BX_OF_RACE = 300;

// 2 · The race before the store decides: A's fast clock, B's accurate one, the store still empty. After the pick
// the larger stamp lands, and the genuinely second write is the one thrown out.
export function PredictWhichWriteLost({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const k = easeOut(seg(t, 0, 0.5));
  const lost = on ? easeOut(seg(s, 0.9, 1.3)) : 0;
  return (
    <Svg label="is the discarded write always the one from the node with the faster clock, always the write that happened later in real time, or neither?" h={300}>
      <Race t={on ? 2.4 + s : 2.4} k={k} sent={on ? 2.6 : 99} lost={lost} />
      <T x={20} y={104} s={13} f={C.quiet} o={k}>
        fast clock
      </T>
      <T x={20} y={184} s={13} f={C.quiet} o={k}>
        accurate
      </T>
      <T x={525} y={126} s={on ? 15 : 22} a="middle" f={on ? C.focus : C.quiet} w={600} o={on ? easeOut(seg(s, 0.7, 1.0)) : easeOut(seg(t, 0.8, 1.4))} serif={!on}>
        {on ? 'keeps A' : '?'}
      </T>
      <Cross at={[BX_OF_RACE, 160]} o={lost} r={11} />
      {on && <Reticle x={BX_OF_RACE} y={210} w={70} h={120} t={s} at={1.4} color={C.badText} />}
    </Svg>
  );
}

// 3 · Top: a clock's offset drifts away from true time, NTP pulls it back, and it drifts again, every cycle. Bottom: one
// NTP round trip over a slow-out, fast-back path, and the estimate that path produces against the true offset.
export function RevealDriftAndNtp({ t }: StepCtx) {
  const tooth = (x: number) => {
    const span = 520 / 3;
    const f = ((x - 60) % span) / span;
    return 100 - f * 60;
  };
  const drift: Pt[] = Array.from({ length: 121 }, (_, i) => {
    const x = 60 + (i / 120) * 520;
    return [x, i === 120 ? 40 : tooth(x)];
  });
  const est = lerp(30, 65, easeOut(seg(t, 3.4, 4.2)));
  return (
    <Svg label="a quartz oscillator's continuous drift adds up to real seconds over a day, and NTP's own correction for it is only as accurate as the network path is symmetric" h={300}>
      <line x1={60} y1={100} x2={580} y2={100} stroke={C.line} strokeWidth={1.5} />
      <T x={60} y={124} s={13} f={C.quiet} o={easeOut(seg(t, 0, 0.4))}>
        true time
      </T>
      <Draw pts={drift} t={t} from={0.2} to={2.0} stroke={C.focus} w={2} />
      <T x={580} y={26} s={14} a="end" f={C.primary} o={easeOut(seg(t, 0.6, 1.0))}>
        {`${(17.28 * easeOut(seg(t, 0.6, 2.0))).toFixed(1)} s a day`}
      </T>
      <T x={240} y={124} s={13} f={C.secondary} o={easeOut(seg(t, 1.0, 1.4))}>
        NTP pulls back
      </T>
      <Lane y={180} name="client" t={t} from={2.0} x0={110} />
      <Lane y={262} name="server" t={t} from={2.1} x0={110} />
      <Msg a={[140, 180]} b={[360, 262]} t={t} from={2.3} to={3.1} color={C.secondary} />
      <Msg a={[372, 262]} b={[410, 180]} t={t} from={3.1} to={3.3} color={C.secondary} />
      <T x={240} y={236} s={13} a="end" f={C.secondary} o={easeOut(seg(t, 2.6, 3.0))}>
        out: 80 ms
      </T>
      <T x={424} y={226} s={13} f={C.secondary} o={easeOut(seg(t, 3.1, 3.4))}>
        back: 10 ms
      </T>
      <T x={580} y={162} s={15} a="end" f={est > 31 ? C.badText : C.focus} w={600} o={easeOut(seg(t, 3.3, 3.5))}>
        {`estimate ${fmt(est)} ms`}
      </T>
      <T x={580} y={292} s={13} a="end" f={C.secondary} o={easeOut(seg(t, 3.3, 3.5))}>
        true offset 30 ms
      </T>
      <Reticle x={500} y={157} w={170} h={30} t={t} at={4.2} color={C.badText} />
    </Svg>
  );
}

// 4 · One day of a leap second, offset against time: the stepped clock takes the whole second at once, the smeared
// clock spreads it across the day. A gap marker slides along the day and settles at the midpoint, half a second apart.
export function RevealLeapSmear({ t }: StepCtx) {
  const X0 = 90, X1 = 560, Y0 = 240, Y1 = 80;
  const sweep = easeInOut(seg(t, 2.0, 3.6));
  const gx = lerp(X0 + 30, (X0 + X1) / 2, sweep);
  const gf = (gx - X0) / (X1 - X0);
  const smearY = lerp(Y0, Y1, gf);
  const gk = easeOut(seg(t, 1.9, 2.2));
  return (
    <Svg label="a clock that smears a leap second gradually over a day and a clock that steps it abruptly disagree with each other for that whole day, even though both are behaving exactly as designed" h={300}>
      <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke={C.line} strokeWidth={1.5} />
      <line x1={X0} y1={Y0} x2={X0} y2={Y1 - 20} stroke={C.line} strokeWidth={1.5} />
      <T x={X0 - 10} y={Y1 + 5} s={13} a="end" f={C.quiet}>
        +1 s
      </T>
      <T x={X1} y={Y0 + 26} s={13} a="end" f={C.quiet}>
        one day →
      </T>
      <Draw pts={[[X0, Y0], [X0, Y1], [X1, Y1]]} t={t} from={0.2} to={1.0} stroke={C.focus} w={2.5} />
      <T x={X1} y={Y1 - 12} s={13} a="end" f={C.focus} o={easeOut(seg(t, 0.8, 1.2))}>
        stepped
      </T>
      <Draw pts={[[X0, Y0], [X1, Y1]]} t={t} from={0.9} to={1.9} stroke={C.second} w={2.5} />
      <T x={X1} y={Y1 + 60} s={13} a="end" f={C.second} o={easeOut(seg(t, 1.5, 1.9))}>
        smeared
      </T>
      <g opacity={gk}>
        <line x1={gx} y1={Y1} x2={gx} y2={smearY} stroke={C.badText} strokeWidth={2.5} />
        <circle cx={gx} cy={Y1} r={4} fill={C.focus} />
        <circle cx={gx} cy={smearY} r={4} fill={C.second} />
        <T x={gx + 12} y={(Y1 + smearY) / 2 + 5} s={15} f={C.badText} w={600}>
          {`${(1 - gf).toFixed(1)} s apart`}
        </T>
      </g>
      <Reticle x={(X0 + X1) / 2} y={(Y1 + (Y0 + Y1) / 2) / 2} w={40} h={100} t={t} at={4.0} />
    </Svg>
  );
}

// 5 · Two readings against true time. The wall clock jumps back when corrected; the monotonic clock never jumps, but
// a second machine's monotonic clock starts somewhere unrelated. Then a pause freezes the process: both readings go
// stale while real time keeps moving.
export function RevealWallVsMonotonic({ t }: StepCtx) {
  const P0 = 380, P1 = 470;
  const pause = easeOut(seg(t, 2.8, 3.2));
  const wall: Pt[] = [[90, 110], [250, 60], [250, 92], [580, 0 + 20]];
  const mono: Pt[] = [[90, 230], [580, 160]];
  const lineAt = (pts: Pt[], x: number) => {
    for (let i = 1; i < pts.length; i++) if (x <= pts[i][0] && pts[i][0] > pts[i - 1][0]) return lerp(pts[i - 1][1], pts[i][1], (x - pts[i - 1][0]) / (pts[i][0] - pts[i - 1][0]));
    return pts[pts.length - 1][1];
  };
  return (
    <Svg label="a wall clock can jump when corrected; a monotonic clock never jumps but means nothing on another machine; and a paused process can hold either reading stale for an unbounded stretch" h={300}>
      <T x={20} y={40} s={13} f={C.primary} o={easeOut(seg(t, 0, 0.4))}>
        wall clock
      </T>
      <Draw pts={wall} t={t} from={0.2} to={1.4} stroke={C.focus} w={2} />
      <T x={262} y={118} s={13} f={C.badText} o={easeOut(seg(t, 0.8, 1.1))}>
        jumps back
      </T>
      <T x={20} y={160} s={13} f={C.primary} o={easeOut(seg(t, 1.2, 1.6))}>
        monotonic
      </T>
      <Draw pts={mono} t={t} from={1.3} to={2.2} stroke={C.focus} w={2} />
      <Draw pts={[[90, 290], [580, 220]]} t={t} from={1.8} to={2.6} stroke={C.second} w={1.6} dash="5 5" />
      <T x={580} y={290} s={13} a="end" f={C.second} o={easeOut(seg(t, 2.2, 2.6))}>
        other machine
      </T>
      {pause > 0 && (
        <g opacity={pause}>
          <rect x={P0} y={14} width={P1 - P0} height={262} fill={C.band} />
          <T x={(P0 + P1) / 2} y={30} s={13} a="middle" f={C.secondary}>
            paused
          </T>
          <line x1={P0} y1={lineAt(wall, P0)} x2={P1} y2={lineAt(wall, P0)} stroke={C.badText} strokeWidth={2.5} strokeDasharray="5 4" />
          <line x1={P0} y1={lineAt(mono, P0)} x2={P1} y2={lineAt(mono, P0)} stroke={C.badText} strokeWidth={2.5} strokeDasharray="5 4" />
          <circle cx={lerp(P0, P1, easeInOut(seg(t, 3.0, 4.0)))} cy={lineAt(wall, P0)} r={4.5} fill={C.badText} />
          <circle cx={lerp(P0, P1, easeInOut(seg(t, 3.0, 4.0)))} cy={lineAt(mono, P0)} r={4.5} fill={C.badText} />
        </g>
      )}
      <T x={P1 + 8} y={lineAt(mono, P0) + 22} s={13} f={C.badText} o={easeOut(seg(t, 3.6, 4.0))}>
        stale
      </T>
      <Reticle x={(P0 + P1) / 2} y={145} w={P1 - P0 + 14} h={250} t={t} at={4.2} color={C.badText} />
    </Svg>
  );
}

const MS = (ms: number) => 140 + ms * 1.6;

// 6 · The same two writes as point readings, then as bounded ranges: A's wide range swallows B's narrow one, and the
// overlap is the clock saying "cannot order". Below, a lease bar has to outlast the worst skew, not the usual one.
export function RevealBoundedClock({ t }: StepCtx) {
  const grow = easeInOut(seg(t, 1.0, 2.0));
  const ov = easeOut(seg(t, 2.1, 2.5));
  const worst = easeInOut(seg(t, 3.0, 3.5));
  const lease = easeInOut(seg(t, 3.4, 4.1));
  const bar = (ms: number, lo: number, hi: number, y: number, col: string) => (
    <g>
      <rect x={lerp(MS(ms), MS(lo), grow)} y={y - 9} width={Math.max(2, lerp(0, MS(hi) - MS(lo), grow))} height={18} rx={3} fill="none" stroke={col} strokeWidth={1.6} />
      <circle cx={MS(ms)} cy={y} r={6} fill={col} />
    </g>
  );
  return (
    <Svg label="a bounded-error clock hands back a range instead of a single instant, so two overlapping ranges honestly say the clock cannot order those two events, rather than silently guessing one" h={300}>
      <g opacity={easeOut(seg(t, 0, 0.5))}>
        <T x={20} y={66} s={13} f={C.secondary}>
          node A
        </T>
        <T x={20} y={126} s={13} f={C.secondary}>
          node B
        </T>
        {bar(100, -20, 220, 60, C.focus)}
        {bar(50, 40, 60, 120, C.second)}
      </g>
      <T x={MS(100)} y={36} s={13} a="middle" f={C.secondary} o={1 - grow}>
        100 ms
      </T>
      <T x={MS(220) + 10} y={66} s={13} f={C.secondary} o={grow}>
        ±120 ms
      </T>
      <T x={MS(60) + 10} y={126} s={13} f={C.second} o={grow}>
        ±10 ms
      </T>
      <rect x={MS(40)} y={44} width={MS(60) - MS(40)} height={90} fill={C.focus} opacity={0.12 * ov} />
      <Decode text="cannot order" t={t} at={2.2} x={MS(50)} y={160} s={15} a="middle" f={C.focus} w={600} o={ov} />
      <T x={20} y={226} s={13} f={C.secondary} o={worst > 0 ? 1 : 0}>
        worst skew
      </T>
      <rect x={160} y={214} width={260 * worst} height={14} rx={2} fill={C.mocha} />
      <T x={20} y={266} s={13} f={C.primary} o={lease > 0 ? 1 : 0}>
        lease
      </T>
      <rect x={160} y={254} width={330 * lease} height={14} rx={2} fill={C.focus} />
      <line x1={420} y1={204} x2={420} y2={276} stroke={C.secondary} strokeDasharray="3 4" opacity={easeOut(seg(t, 3.5, 3.8))} />
      <Reticle x={MS(50)} y={150} w={160} h={36} t={t} at={4.2} />
    </Svg>
  );
}

// 7 · The identical skewed pair read twice. Top: last-write-wins compares stamps and keeps A — wrong, with no alarm.
// Bottom: the bounded clock reads the same pair as two overlapping ranges and flags it.
export function RevealLabComparison({ t }: StepCtx) {
  const top = easeOut(seg(t, 0, 0.4));
  const quiet = easeOut(seg(t, 1.4, 1.8));
  const bottom = easeOut(seg(t, 2.0, 2.4));
  return (
    <Svg label="last-write-wins reads the skewed pair and confidently keeps the wrong write with no sign anything went wrong; a bounded-error clock reads the identical pair and honestly flags it as unorderable" h={300}>
      <T x={20} y={30} s={13} f={C.primary} o={top}>
        last-write-wins
      </T>
      <Stamp at={[120, 80]} text="A: 100 ms" t={t} when={0.4} />
      <Stamp at={[260, 80]} text="B: 50 ms" t={t} when={0.6} f={quiet > 0.5 ? C.taupe : C.focus} />
      <Draw pts={[[318, 80], [400, 80]]} t={t} from={0.9} to={1.3} stroke={C.quiet} w={1.5} />
      <Decode text="keeps A" t={t} at={1.3} x={420} y={86} s={16} f={C.badText} w={600} o={easeOut(seg(t, 1.2, 1.4))} />
      <T x={420} y={112} s={13} f={C.quiet} o={quiet}>
        no alarm
      </T>
      <line x1={20} y1={146} x2={580} y2={146} stroke={C.band} />
      <T x={20} y={176} s={13} f={C.primary} o={bottom}>
        bounded clock
      </T>
      <g opacity={bottom}>
        <rect x={MS(-20) - 30} y={204} width={easeInOut(seg(t, 2.2, 2.9)) * (MS(220) - MS(-20))} height={18} rx={3} fill="none" stroke={C.focus} strokeWidth={1.6} />
        <rect x={MS(40) - 30} y={236} width={easeInOut(seg(t, 2.4, 2.9)) * (MS(60) - MS(40))} height={18} rx={3} fill="none" stroke={C.second} strokeWidth={1.6} />
      </g>
      <Decode text="cannot order" t={t} at={3.2} x={300} y={286} s={16} a="middle" f={C.focus} w={600} o={easeOut(seg(t, 3.1, 3.3))} />
      <Reticle x={300} y={280} w={180} h={32} t={t} at={4.1} />
    </Svg>
  );
}

// 8 · The four ideas as four small pictures, each replaying its move: drift and its correction, a step against a
// smear, two clocks that can't be compared, and two overlapping ranges.
export function Recap({ t }: StepCtx) {
  const at = (i: number) => 0.2 + i * 0.9;
  const labels = ['drift, re-fixed', 'a day apart', 'no cross-machine order', 'admits, not guesses'];
  const cells: Pt[] = [[0, 0], [300, 0], [0, 150], [300, 150]];
  return (
    <Svg label="a crystal drifts continuously with its own error bar on the correction; a leap second is a full day of disagreement, not an instant; no clock orders events across machines; and a bounded clock admits what it doesn't know instead of guessing" h={300}>
      {labels.map((l, i) => (
        <T key={l} x={cells[i][0] + 150} y={cells[i][1] + 134} s={13} a="middle" f={i === 3 ? C.focus : C.primary} o={easeOut(seg(t, at(i), at(i) + 0.4))}>
          {l}
        </T>
      ))}
      <line x1={40} y1={90} x2={260} y2={90} stroke={C.line} />
      <Draw pts={[[40, 90], [113, 50], [113, 90], [186, 50], [186, 90], [260, 50]]} t={t} from={at(0)} to={at(0) + 0.7} stroke={C.focus} w={2} />
      <Draw pts={[[340, 100], [340, 40], [560, 40]]} t={t} from={at(1)} to={at(1) + 0.5} stroke={C.focus} w={2} />
      <Draw pts={[[340, 100], [560, 40]]} t={t} from={at(1) + 0.2} to={at(1) + 0.7} stroke={C.second} w={2} />
      <Draw pts={[[40, 240], [260, 180]]} t={t} from={at(2)} to={at(2) + 0.5} stroke={C.focus} w={2} />
      <Draw pts={[[40, 214], [260, 164]]} t={t} from={at(2) + 0.2} to={at(2) + 0.7} stroke={C.second} w={1.6} dash="5 5" />
      <rect x={330} y={180} width={lerp(0, 220, easeInOut(seg(t, at(3), at(3) + 0.5)))} height={16} rx={3} fill="none" stroke={C.focus} strokeWidth={1.6} />
      <rect x={420} y={204} width={lerp(0, 50, easeInOut(seg(t, at(3) + 0.2, at(3) + 0.6)))} height={16} rx={3} fill="none" stroke={C.second} strokeWidth={1.6} />
      <rect x={420} y={176} width={50} height={48} fill={C.focus} opacity={0.12 * easeOut(seg(t, at(3) + 0.6, at(3) + 0.9))} />
      <line x1={300} y1={14} x2={300} y2={290} stroke={C.band} />
      <line x1={14} y1={150} x2={586} y2={150} stroke={C.band} />
    </Svg>
  );
}

// 9 · A month of measured skew, one bar a day, and a lease sized to the typical bar. After the pick, one bad day's bar
// shoots straight through the lease line.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const r = rng(14);
  const days = Array.from({ length: 30 }, () => 30 + r() * 30);
  const BAD = 21;
  const base = 250, LEASE = base - 70;
  const spike = on ? easeOutBack(seg(s, 0.3, 0.9)) : 0;
  return (
    <Svg label="a lease is sized to last month's typical measured clock skew between two machines — is that length safe to rely on?" h={300}>
      <line x1={70} y1={base} x2={580} y2={base} stroke={C.line} strokeWidth={1.5} />
      <T x={70} y={base + 24} s={13} f={C.quiet}>
        last month, one bar a day
      </T>
      {days.map((h, i) => {
        const k = easeOut(seg(t, 0.1 + i * 0.03, 0.4 + i * 0.03));
        const hh = i === BAD ? lerp(h, 200, spike) : h;
        return <rect key={i} x={74 + i * 16.8} y={base - hh * k} width={10} height={hh * k} rx={1} fill={i === BAD && on ? C.badText : C.secondary} />;
      })}
      <line x1={70} y1={LEASE} x2={580} y2={LEASE} stroke={C.focus} strokeWidth={2} strokeDasharray={`${(510 * easeOut(seg(t, 1.2, 1.8))).toFixed(0)} 600`} />
      <T x={580} y={LEASE - 10} s={13} a="end" f={C.focus} o={easeOut(seg(t, 1.6, 2.0))}>
        lease
      </T>
      <T x={300} y={40} s={14} a="middle" f={on ? C.badText : C.secondary} o={on ? easeOut(seg(s, 0.8, 1.1)) : easeOut(seg(t, 2.0, 2.6))}>
        {on ? 'one bad day' : 'safe for the lease?'}
      </T>
      {on && <Reticle x={74 + BAD * 16.8 + 5} y={base - 100} w={34} h={210} t={s} at={1.2} color={C.badText} />}
    </Svg>
  );
}
