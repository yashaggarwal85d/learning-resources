import { useEffect, useState } from 'react';
import { C, Draw, Reticle, Svg, T } from '../../../../../reels/kit';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// Edge buffering and store-and-forward, drawn from examples.py: the 50-point fsynced file read back whole, 72,000 against
// 1,728,000 bytes, the faulty replay (10 resent, 20 missing, 30/31 swapped), 3,000 ÷ 15 = 200 s and the 85 /s throttle,
// the 120-point buffer's alarms under three drop policies, 72,000 raw against 240 rollups, and the 90 s clock offset.

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

// examples.py's faulty replay as sent, in order: seq 0–49 with 20 missing, 10 resent right after itself, and 30/31 swapped.
const SENT: number[] = (() => {
  const b = Array.from({ length: 50 }, (_, i) => i).filter((i) => i !== 20);
  b.splice(10, 0, 10);
  const a = b.indexOf(30);
  const c = b.indexOf(31);
  [b[a], b[c]] = [b[c], b[a]];
  return b;
})();

// 0 · The replay lands on the platform as a row of cells, in arrival order. The resent 10 sits beside the first 10, red;
// 31 arrives before 30, red; and the live readings, pale blue, wait beside the link and slide in only after the whole
// replay — late. The cells land one by one in arrival order; the bad ones jolt as they turn red.
export function Hook({ t }: StepCtx) {
  const cw = 8.6;
  const cx = (j: number) => 25 + j * cw;
  const dupAt = SENT.indexOf(10) + 1;
  const swapAt = SENT.indexOf(31);
  // the live readings show up during the replay but wait behind it, then slide into place last
  const wait = easeOut(seg(t, 1.8, 2.2));
  const enter = easeInOut(seg(t, 3.6, 4.2));
  return (
    <Svg
      label="a WAN outage ends, the gateway replays its buffer, and the platform shows some readings twice, a few out of order, and new live data arriving late because the replay saturated the link"
      h={200}
    >
      <T x={25} y={40} s={13} f={C.quiet} o={easeOut(seg(t, 0, 0.3))}>
        replay, as it arrived
      </T>
      {/* the replay lands cell by cell, in arrival order */}
      {SENT.map((s, j) => {
        const bad = j === dupAt || j === swapAt || j === swapAt + 1;
        const k = easeOut(seg(t, 0.2 + j * 0.03, 0.45 + j * 0.03));
        const jolt = bad ? Math.sin(seg(t, 2.4, 2.9) * Math.PI * 3) * 4 * (1 - seg(t, 2.4, 2.9)) : 0;
        return <rect key={j} x={cx(j) + 0.5} y={lerp(46, 70, k) + jolt} width={cw - 1.5} height={22} rx={1.5} fill={bad && t > 2.4 ? C.bad : C.secondary} opacity={k} />;
      })}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={cx(50) + 6 + i * cw + lerp(70, 0, enter)} y={lerp(100, 70, enter)} width={cw - 1.5} height={22} rx={1.5} fill={C.second} opacity={wait * (0.5 + 0.5 * enter)} />
      ))}
      <Draw pts={[[cx(dupAt) + 4, 96], [cx(dupAt) + 4, 106]]} t={t} from={2.6} to={2.8} stroke={C.badText} w={1} pen={false} />
      <T x={cx(dupAt)} y={120} s={13} f={C.badText} a="middle" o={easeOut(seg(t, 2.7, 3.0))}>
        10 twice
      </T>
      <Draw pts={[[cx(swapAt) + 8, 96], [cx(swapAt) + 8, 134]]} t={t} from={3.1} to={3.35} stroke={C.badText} w={1} pen={false} />
      <T x={cx(swapAt)} y={148} s={13} f={C.badText} a="middle" o={easeOut(seg(t, 3.2, 3.5))}>
        31 before 30
      </T>
      <T x={575} y={120} s={13} f={C.second} a="end" w={600} o={easeOut(seg(t, 4.0, 4.3))}>
        live, late
      </T>
    </Svg>
  );
}

// 1 · Two blanks: what the replay lacked, and what should limit its speed. "?" in both before the answer; after it,
// they fill: an idempotent key per point, and a throttle — 85 points a second here.
export function PredictMissing({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const rows = [
    { l: 'replay lacked', v: 'a key per point' },
    { l: 'speed limit', v: 'a throttle: 85 /s' },
  ];
  return (
    <Svg label="the buffer held every reading through the outage — what was missing from the replay, and what should have limited its speed?" h={200}>
      <Box x={25} y={20} w={270} label="buffer: every reading" o={easeOut(seg(t, 0, 0.4))} />
      <Tick x={312} y={34} k={easeOutBack(seg(t, 0.4, 0.8))} />
      {rows.map((r, i) => {
        const y = 100 + i * 50;
        return (
          <g key={r.l} opacity={easeOut(seg(t, 0.9 + i * 0.4, 1.3 + i * 0.4))}>
            <T x={25} y={y} s={14} f={C.secondary}>
              {r.l}
            </T>
            {!on ? (
              <T x={575} y={y} s={16} f={C.focus} a="end" w={600}>
                ?
              </T>
            ) : (
              <T x={575} y={y} s={15} f={C.focus} a="end" w={600} o={easeOut(seg(s, 0.2 + i * 0.4, 0.6 + i * 0.4))}>
                {r.v}
              </T>
            )}
          </g>
        );
      })}
    </Svg>
  );
}

// 2 · Fifty records append to a file, each fsynced before its ack. The writing process is crossed out — a restart — and a
// fresh process reads the same file back: 50 of 50. Below, the sizing: a 10-minute outage at 5 points a second and 24
// bytes a point needs 72,000 bytes; four hours needs 1,728,000 — a bar 24 times as long.
export function RevealDurable({ t }: StepCtx) {
  const fill = seg(t, 0.2, 1.6);
  const read = seg(t, 2.4, 3.0);
  const W = 480;
  const grow = easeOut(seg(t, 3.6, 4.6));
  return (
    <Svg
      label="every write is fsynced to a plain append-only file before it is acknowledged, a fresh process reading it back after a restart recovers all 50 points a prior one wrote, and a four-hour outage needs 24 times the bytes a ten-minute one does"
      h={200}
    >
      <T x={25} y={24} s={12} f={C.quiet} o={easeOut(seg(t, 0, 0.3))}>
        append-only file, fsync per write
      </T>
      {Array.from({ length: 50 }, (_, i) => (
        <rect key={i} x={95 + i * 9.6} y={36} width={8} height={18} rx={1.5} fill={read > i / 50 ? C.focus : C.secondary} opacity={fill > i / 50 ? 1 : 0.12} />
      ))}
      <T x={25} y={50} s={12} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        writer
      </T>
      <Cross x={60} y={72} k={easeOutBack(seg(t, 1.7, 2.1))} />
      <T x={25} y={92} s={12} f={C.focus} o={easeOut(seg(t, 2.2, 2.5))}>
        fresh reader
      </T>
      <T x={575} y={80} s={14} f={C.focus} a="end" w={600} o={easeOut(seg(t, 2.9, 3.3))}>
        50 of 50 back
      </T>

      <T x={25} y={132} s={12} f={C.secondary} o={easeOut(seg(t, 3.3, 3.6))}>
        10 min
      </T>
      <rect x={95} y={122} width={(W / 24) * grow} height={12} fill={C.secondary} />
      <T x={95 + W / 24 + 8} y={133} s={12} f={C.secondary} o={easeOut(seg(t, 3.8, 4.1))}>
        72,000 B
      </T>
      <T x={25} y={166} s={12} f={C.second} o={easeOut(seg(t, 3.6, 3.9))}>
        4 hours
      </T>
      <rect x={95} y={156} width={W * grow} height={12} fill={C.second} />
      <T x={575} y={190} s={13} f={C.second} a="end" w={600} o={easeOut(seg(t, 4.6, 5.0))}>
        1,728,000 B: × 24
      </T>
    </Svg>
  );
}

// 3 · Left: Sparkplug's own seq counter as a ring of 256 that comes back to 0 — far too narrow for a long replay. Right:
// the 50-message replay keyed by source, device time and a counter that never wraps. The resent 10 drops out, 30 and 31
// swap back, and the empty slot before 21 is flagged: 49 delivered, 1 duplicate, 1 gap, 1 reorder.
export function RevealSequence({ t }: StepCtx) {
  const ring = seg(t, 0.2, 1.6);
  const cw = 8.4;
  const fix = easeInOut(seg(t, 2.6, 3.6));
  const dupJ = SENT.indexOf(10) + 1;
  const a = SENT.indexOf(31);
  // the duplicate leaves, everything after it closes up by one, and 31 and 30 trade places
  const posOf = (j: number) => (j > dupJ ? j - fix : j) + (j === a ? fix : j === a + 1 ? -fix : 0);
  return (
    <Svg
      label="sparkplug's own sequence number wraps after 256 messages, far too narrow to dedupe a long replay, so a per-source key wide enough not to wrap recovers every real point exactly once, flags the one gap where a point never arrived, and fixes a reordering"
      h={200}
    >
      <circle cx={70} cy={70} r={38} fill="none" stroke={C.line} strokeWidth={6} opacity={easeOut(seg(t, 0, 0.3))} />
      <path
        d={`M70 32 A38 38 0 ${ring > 0.5 ? 1 : 0} 1 ${70 + 38 * Math.sin(ring * 2 * Math.PI - 1e-3)} ${70 - 38 * Math.cos(ring * 2 * Math.PI - 1e-3)}`}
        fill="none"
        stroke={C.badText}
        strokeWidth={6}
      />
      <T x={70} y={76} s={13} f={C.primary} a="middle" w={600} o={easeOut(seg(t, 0, 0.3))}>
        0–255
      </T>
      <T x={70} y={132} s={12} f={C.badText} a="middle" o={easeOut(seg(t, 1.4, 1.8))}>
        wraps at 256
      </T>
      <T x={150} y={30} s={12} f={C.second} o={easeOut(seg(t, 1.6, 2.0))}>
        key: source, device time, counter
      </T>
      {SENT.map((s, j) => {
        const isDup = j === dupJ;
        const x = 150 + posOf(j) * cw;
        const swap = j === a || j === a + 1;
        return (
          <rect
            key={j}
            x={x}
            y={isDup ? 50 + 40 * easeIn(seg(t, 2.2, 2.8)) : 50}
            width={cw - 1.5}
            height={22}
            rx={1.5}
            fill={isDup ? C.bad : swap && fix < 1 ? C.badText : C.focus}
            opacity={isDup ? 1 - seg(t, 2.6, 2.9) : easeOut(seg(t, 1.6 + j * 0.01, 1.9 + j * 0.01))}
          />
        );
      })}
      <line x1={150 + 20 * cw - 1} y1={42} x2={150 + 20 * cw - 1} y2={82} stroke={C.badText} strokeWidth={2} opacity={easeOut(seg(t, 3.8, 4.2))} />
      <T x={150 + 20 * cw} y={100} s={12} f={C.badText} a="middle" o={easeOut(seg(t, 4.0, 4.4))}>
        gap before 21
      </T>
      <T x={150} y={150} s={13} f={C.focus} w={600} o={easeOut(seg(t, 4.4, 4.8))}>
        49 delivered
      </T>
      <T x={150} y={178} s={12} f={C.secondary} o={easeOut(seg(t, 4.7, 5.1))}>
        1 duplicate dropped, 1 reorder fixed
      </T>
    </Svg>
  );
}

// 4 · Little's law on a tank. A backlog of 3,000 points (10 minutes at 5 a second). Replay pours out at 20 a second
// while live traffic pours in at 5: the tank drains at 15 a second, empty after 200 s. Below, the throttle: of 100 points
// a second of ingest, keep 10% headroom, leave live its 5, and replay gets 85.
export function RevealCatchup({ t }: StepCtx) {
  const drain = easeInOut(seg(t, 1.2, 3.0));
  const W = 480;
  const k = easeOut(seg(t, 3.4, 4.4));
  return (
    <Svg
      label="a backlog drains at the replay rate minus the live rate, because live points keep arriving the whole time catch-up runs, and a throttle that leaves live traffic its own share of ingest capacity still drains the backlog in a bounded time"
      h={200}
    >
      <T x={25} y={24} s={12} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        backlog 3,000
      </T>
      <rect x={25} y={34} width={90} height={70} rx={4} fill="none" stroke={C.secondary} strokeWidth={1.2} opacity={easeOut(seg(t, 0, 0.3))} />
      <rect x={27} y={36 + 66 * drain} width={86} height={66 * (1 - drain)} fill={C.secondary} opacity={0.6} />
      <T x={140} y={50} s={13} f={C.focus} o={easeOut(seg(t, 0.4, 0.7))}>
        out: replay 20 /s
      </T>
      <T x={140} y={76} s={13} f={C.second} o={easeOut(seg(t, 0.6, 0.9))}>
        in: live 5 /s
      </T>
      <T x={140} y={102} s={13} f={C.primary} w={600} o={easeOut(seg(t, 0.9, 1.2))}>
        3,000 ÷ 15 = 200 s
      </T>
      <Tick x={395} y={97} k={easeOutBack(seg(t, 2.9, 3.3))} />

      <T x={25} y={140} s={12} f={C.quiet} o={easeOut(seg(t, 3.2, 3.5))}>
        ingest 100 /s
      </T>
      <rect x={95} y={150} width={W * 0.05 * k} height={16} fill={C.second} />
      <rect x={95 + W * 0.05} y={150} width={W * 0.85 * k} height={16} fill={C.focus} />
      <rect x={95 + W * 0.9} y={150} width={W * 0.1 * k} height={16} fill={C.line} />
      <T x={95} y={188} s={12} f={C.second} o={easeOut(seg(t, 4.4, 4.7))}>
        live 5
      </T>
      <T x={300} y={188} s={13} f={C.focus} a="middle" w={600} o={easeOut(seg(t, 4.6, 4.9))}>
        replay 85 /s
      </T>
      <T x={575} y={188} s={12} f={C.quiet} a="end" o={easeOut(seg(t, 4.8, 5.1))}>
        headroom 10
      </T>
    </Svg>
  );
}

// 5 · A full buffer of 120 points with room for 100; every 12th is a safety alarm (white). Three policies cut 20: drop-
// oldest shaves the front and loses alarms 0 and 12 (8 of 10); drop-newest shaves the back and loses alarm 108 (9 of 10);
// drop by priority removes 20 ordinary points and keeps all 10 alarms. Dropped points fall out of their row; the verdicts
// slide in; the 121st write slides in at the end, and brackets lock onto the priority row.
export function RevealDropPolicy({ t }: StepCtx) {
  const cw = 3.6;
  const x0 = 130;
  // drop by priority: the 20 oldest ordinary points go first; no alarm is touched
  const prioDrop = new Set(
    Array.from({ length: 120 }, (_, i) => i)
      .filter((i) => i % 12 !== 0)
      .slice(0, 20),
  );
  const rows = [
    { l: 'oldest', keep: (i: number) => i >= 20, r: '8 of 10', c: C.badText, y: 44 },
    { l: 'newest', keep: (i: number) => i < 100, r: '9 of 10', c: C.badText, y: 96 },
    { l: 'priority', keep: (i: number) => !prioDrop.has(i), r: '10 of 10', c: C.focus, y: 148 },
  ];
  // the 121st write: one more point slides into the buffer's end, whatever the policy
  const write = easeOutBack(seg(t, 4.6, 5.0));
  return (
    <Svg
      label="dropping the oldest or the newest point by age alone loses some of the buffer's own safety alarms along with everything else, dropping by priority first keeps every alarm, and the buffer's own write never blocks, whichever policy applies on read"
      h={200}
    >
      {rows.map((r, ri) => {
        const cut = easeInOut(seg(t, 1.0 + ri * 1.0, 1.6 + ri * 1.0));
        const k = easeOut(seg(t, ri * 0.2, 0.3 + ri * 0.2));
        return (
          <g key={r.l} opacity={k}>
            <T x={25} y={r.y + 12} s={13} f={C.secondary}>
              {r.l}
            </T>
            {Array.from({ length: 120 }, (_, i) => {
              const alarm = i % 12 === 0;
              const kept = r.keep(i);
              // a dropped point falls out of its row; a dropped alarm falls in red
              const fall = kept ? 0 : cut;
              return (
                <rect
                  key={i}
                  x={x0 + i * cw}
                  y={(alarm ? r.y - 2 : r.y + 2) + fall * 8}
                  width={cw - 1}
                  height={alarm ? 20 : 12}
                  fill={fall > 0.3 ? (alarm ? C.bad : C.panel) : alarm ? C.focus : C.quiet}
                  opacity={1 - fall * (alarm ? 0.3 : 0.75)}
                />
              );
            })}
            <g opacity={easeOut(seg(t, 1.6 + ri * 1.0, 2.0 + ri * 1.0))} transform={`translate(${((1 - easeOut(seg(t, 1.6 + ri * 1.0, 2.0 + ri * 1.0))) * 20).toFixed(1)} 0)`}>
              <T x={575} y={r.y + 36} s={12} f={r.c} a="end" w={600}>
                {`alarms kept: ${r.r}`}
              </T>
            </g>
          </g>
        );
      })}
      {write > 0 && <rect x={x0 + 120 * cw + 3} y={lerp(120, 150, clamp(write, 0, 1.1))} width={cw + 1} height={12} fill={C.second} opacity={clamp(write)} />}
      <T x={25} y={196} s={12} f={C.second} o={easeOut(seg(t, 4.6, 5.0))}>
        the 121st write still lands: no backpressure
      </T>
      <Reticle x={300} y={160} w={570} h={44} t={t} at={5.3} />
    </Svg>
  );
}

// 6 · The same four-hour outage two ways into one fixed buffer. Raw: 72,000 points, a bar that runs off the buffer's
// edge in red. Rolled up once a minute into mergeable records (min, max, sum, count): 240 records, a sliver.
export function RevealRollup({ t }: StepCtx) {
  const raw = easeOut(seg(t, 0.6, 1.8));
  const roll = easeOut(seg(t, 2.6, 3.2));
  return (
    <Svg
      label="a mergeable rollup records one aggregate per interval instead of every raw point, so the same four-hour outage that needs 72,000 raw points fits in 240 rolled-up records in the same fixed buffer"
      h={200}
    >
      <rect x={95} y={30} width={300} height={110} rx={5} fill="none" stroke={C.secondary} strokeWidth={1.4} strokeDasharray="5 3" opacity={easeOut(seg(t, 0, 0.3))} />
      <T x={245} y={24} s={11} f={C.secondary} a="middle" o={easeOut(seg(t, 0, 0.3))}>
        one fixed buffer
      </T>
      <T x={25} y={70} s={12} f={C.secondary} o={easeOut(seg(t, 0.4, 0.7))}>
        raw
      </T>
      <rect x={95} y={58} width={480 * raw} height={16} fill={raw * 480 > 300 ? C.bad : C.secondary} />
      <T x={575} y={96} s={13} f={C.badText} a="end" w={600} o={easeOut(seg(t, 1.8, 2.2))}>
        72,000 points
      </T>
      <T x={25} y={122} s={12} f={C.focus} o={easeOut(seg(t, 2.4, 2.7))}>
        rollup
      </T>
      <rect x={95} y={110} width={Math.max(2, (480 * 240) / 72000) * roll} height={16} fill={C.focus} />
      <T x={110} y={123} s={13} f={C.focus} w={600} o={easeOut(seg(t, 3.0, 3.4))}>
        240 records, one a minute
      </T>
      {['min', 'max', 'sum', 'count'].map((c, i) => (
        <g key={c} opacity={easeOut(seg(t, 3.6 + i * 0.2, 3.9 + i * 0.2))}>
          <rect x={95 + i * 70} y={160} width={62} height={22} rx={3} fill={C.panel} stroke={C.second} strokeWidth={1.1} />
          <T x={126 + i * 70} y={175} s={12} f={C.second} a="middle">
            {c}
          </T>
        </g>
      ))}
      <T x={575} y={175} s={12} f={C.second} a="end" o={easeOut(seg(t, 4.4, 4.8))}>
        mergeable
      </T>
    </Svg>
  );
}

// 7 · Twenty points on a shared time axis. Device stamps sit at 0–19 s; the gateway saw each one 90 s later, and lines
// join each pair. The median gap reads 90 s; the device points slide right by that offset and land exactly on the
// gateway's: matches, all 20.
export function RevealClock({ t }: StepCtx) {
  const tx = (s: number) => 40 + (s / 112) * 520;
  const slide = easeInOut(seg(t, 3.0, 4.2));
  return (
    <Svg
      label="a device clock that drifted 90 seconds behind the gateway's own shows up as a shifting gap between the two recorded times, and the estimated offset, applied to the whole drifted batch, recovers exactly what the gateway's own clock would have stamped"
      h={200}
    >
      <line x1={tx(0)} y1={150} x2={tx(112)} y2={150} stroke={C.line} strokeWidth={1.2} opacity={easeOut(seg(t, 0, 0.3))} />
      {[0, 30, 60, 90].map((s) => (
        <T key={s} x={tx(s)} y={170} s={11} f={C.quiet} a="middle" o={easeOut(seg(t, 0, 0.3))}>
          {`${s} s`}
        </T>
      ))}
      <T x={25} y={60} s={12} f={C.secondary} o={easeOut(seg(t, 0.2, 0.5))}>
        device
      </T>
      <T x={575} y={60} s={12} f={C.focus} a="end" o={easeOut(seg(t, 0.6, 0.9))}>
        gateway
      </T>
      {Array.from({ length: 20 }, (_, i) => (
        <g key={i}>
          <line x1={tx(i + 90 * slide)} y1={80} x2={tx(i + 90)} y2={120} stroke={C.line} strokeWidth={0.8} opacity={easeOut(seg(t, 1.0, 1.6)) * (1 - slide)} />
          <circle cx={tx(i + 90)} cy={120} r={3} fill={C.focus} opacity={easeOut(seg(t, 0.6 + i * 0.02, 0.8 + i * 0.02))} />
          <circle cx={tx(i + 90 * slide)} cy={lerp(80, 120, slide)} r={3} fill={C.second} opacity={easeOut(seg(t, 0.2 + i * 0.02, 0.4 + i * 0.02))} />
        </g>
      ))}
      <T x={300} y={40} s={14} f={C.second} a="middle" w={600} o={easeOut(seg(t, 1.8, 2.2))}>
        median offset: 90 s
      </T>
      <T x={575} y={194} s={13} f={C.focus} a="end" w={600} o={easeOut(seg(t, 4.3, 4.7))}>
        20 of 20 match
      </T>
      <Tick x={370} y={189} k={easeOutBack(seg(t, 4.4, 4.8))} />
    </Svg>
  );
}

// 8 · Six lanes, each with a tiny picture: a file strip, a key, a tank, a white alarm kept, a sliver bar, and two dots
// joined by an offset.
export function Recap({ t }: StepCtx) {
  const lane = (i: number) => 30 + i * 40;
  const k = (i: number) => easeOut(seg(t, i * 0.85, i * 0.85 + 0.5));
  const texts = [
    { l: 'durable buffer', r: 'fsync, sized', c: C.focus },
    { l: 'wide key', r: 'dedupes exactly', c: C.focus },
    { l: 'throttle', r: "Little's law", c: C.second },
    { l: 'full buffer', r: 'drop by priority', c: C.focus },
    { l: 'rollup', r: 'stretches it', c: C.second },
    { l: 'clock', r: 'offset fixed', c: C.focus },
  ];
  return (
    <Svg
      label="a durable, sized buffer, an idempotent key wide enough to survive its own replay, a throttle sized by Little's law, drop by priority never by backpressure, a rollup that stretches the same buffer further, and a clock correction on reconnect"
      h={260}
    >
      <g opacity={k(0)}>
        {Array.from({ length: 10 }, (_, j) => (
          <rect key={j} x={25 + j * 11} y={lane(0) - 8} width={9} height={14} rx={1} fill={C.focus} />
        ))}
      </g>
      <g opacity={k(1)}>
        <circle cx={35} cy={lane(1) - 1} r={7} fill="none" stroke={C.focus} strokeWidth={1.6} />
        <line x1={42} y1={lane(1) - 1} x2={110} y2={lane(1) - 1} stroke={C.focus} strokeWidth={1.6} />
      </g>
      <g opacity={k(2)}>
        <rect x={25} y={lane(2) - 12} width={40} height={22} fill="none" stroke={C.secondary} strokeWidth={1.2} />
        <rect x={26} y={lane(2) - 2 + 10 * seg(t, 1.9, 3.0)} width={38} height={11 - 10 * seg(t, 1.9, 3.0)} fill={C.secondary} opacity={0.6} />
      </g>
      <g opacity={k(3)}>
        {Array.from({ length: 12 }, (_, j) => (
          <rect key={j} x={25 + j * 9} y={j % 4 === 0 ? lane(3) - 10 : lane(3) - 5} width={6} height={j % 4 === 0 ? 18 : 8} fill={j % 4 === 0 ? C.focus : C.quiet} />
        ))}
      </g>
      <g opacity={k(4)}>
        <rect x={25} y={lane(4) - 6} width={110} height={10} fill="none" stroke={C.secondary} strokeWidth={1} strokeDasharray="3 2" />
        <rect x={25} y={lane(4) - 6} width={4} height={10} fill={C.focus} />
      </g>
      <g opacity={k(5)}>
        <circle cx={35} cy={lane(5) - 1} r={4} fill={C.second} />
        <circle cx={115} cy={lane(5) - 1} r={4} fill={C.focus} />
        <line x1={40} y1={lane(5) - 1} x2={110} y2={lane(5) - 1} stroke={C.line} strokeWidth={1} strokeDasharray="3 3" />
      </g>
      {texts.map((x, i) => (
        <g key={i} opacity={k(i)}>
          <T x={160} y={lane(i) + 4} s={13} f={C.primary}>
            {x.l}
          </T>
          <T x={575} y={lane(i) + 4} s={13} f={x.c} a="end" w={600}>
            {x.r}
          </T>
        </g>
      ))}
    </Svg>
  );
}

// 9 · A ten-minute outage band with the uplink crossed out. Under it, the plant's own reading loop as a row of ticks.
// Before the answer: "reads pause?". After it, the ticks run straight across the band without a break and the count
// lands: 3,000 of 3,000 local reads.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const run = on ? seg(s, 0.2, 1.4) : 0;
  return (
    <Svg label="the WAN is down for the whole outage — does the plant's own reading loop, independent of the gateway's uplink, keep running the entire time?" h={200}>
      <rect x={60} y={40} width={480} height={110} rx={4} fill={C.bad} opacity={0.14 * easeOut(seg(t, 0, 0.4))} />
      <T x={300} y={32} s={12} f={C.badText} a="middle" o={easeOut(seg(t, 0, 0.4))}>
        10-minute WAN outage
      </T>
      <T x={25} y={74} s={12} f={C.secondary} o={easeOut(seg(t, 0.4, 0.7))}>
        uplink
      </T>
      <line x1={90} y1={70} x2={540} y2={70} stroke={C.badText} strokeWidth={1.4} strokeDasharray="4 4" opacity={easeOut(seg(t, 0.4, 0.7))} />
      <Cross x={300} y={70} k={easeOutBack(seg(t, 0.8, 1.2))} />
      <T x={25} y={124} s={12} f={C.secondary} o={easeOut(seg(t, 1.2, 1.5))}>
        reads
      </T>
      {Array.from({ length: 60 }, (_, i) => (
        <line key={i} x1={70 + i * 8} y1={112} x2={70 + i * 8} y2={128} stroke={C.focus} strokeWidth={1.4} opacity={on ? (i / 60 < run ? 1 : 0.15) : i < 4 ? easeOut(seg(t, 1.4, 1.8)) : 0.15} />
      ))}
      {!on ? (
        <T x={300} y={184} s={14} f={C.focus} a="middle" o={easeOut(seg(t, 2.0, 2.4))}>
          reads pause?
        </T>
      ) : (
        <T x={300} y={184} s={14} f={C.focus} a="middle" w={600} o={easeOut(seg(s, 1.3, 1.7))}>
          3,000 of 3,000 local reads
        </T>
      )}
    </Svg>
  );
}
