import { useEffect, useState } from 'react';
import { C, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// CHAPTER.md, topic 15: a commit timeline with writer lanes (CDC merge, backfill, compaction) each ending in an
// attempt to swap the single metadata pointer; two collide on overlapping partitions (a red conflict marker, a retry
// arrow) and a re-layout to disjoint partitions makes the collisions vanish (counted down); a snapshot chain with an
// expiry line sweeping from the left and a tag pinning one snapshot that survives. examples.py's layout: the CDC merge
// on p1, p2; compaction on p2, p3 (conflicts in 4 of 4 runs), then on p4, p5 (0 of 4); maintenance 10–12 against
// ingest 11–13 collides, 10–11 is clear.

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

/** A check mark. */
const Tick = ({ x, y, k, color = C.focus }: { x: number; y: number; k: number; color?: string }) =>
  k <= 0 ? null : <path d={`M${x - 5} ${y} l4 4 l8 -9`} fill="none" stroke={color} strokeWidth={2} opacity={k} />;

/** A red ✕ conflict marker. */
const Cross = ({ x, y, k }: { x: number; y: number; k: number }) =>
  k <= 0 ? null : (
    <g stroke={C.badText} strokeWidth={2.4} opacity={k}>
      <line x1={x - 7} y1={y - 7} x2={x + 7} y2={y + 7} />
      <line x1={x + 7} y1={y - 7} x2={x - 7} y2={y + 7} />
    </g>
  );

/** The five partitions, p1…p5, along one row. */
const PX = (i: number) => 150 + i * 85;
function Partitions({ y, o, hot = -1 }: { y: number; o: number; hot?: number }) {
  return (
    <g opacity={o}>
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <rect x={PX(i)} y={y} width={70} height={28} rx={3} fill={i === hot ? C.bad : C.panel} stroke={i === hot ? C.badText : C.line} />
          <T x={PX(i) + 35} y={y + 19} s={13} f={i === hot ? C.focus : C.primary} a="middle">
            {`p${i + 1}`}
          </T>
        </g>
      ))}
    </g>
  );
}

/** A writer's bracket under the partitions it touches, from partition `a` to `b` (inclusive). */
const Bracket = ({ a, b, y, color, o = 1, dash }: { a: number; b: number; y: number; color: string; o?: number; dash?: string }) =>
  o <= 0 ? null : <path d={`M${a + 4} ${y - 6} L${a + 4} ${y} L${b - 4} ${y} L${b - 4} ${y - 6}`} fill="none" stroke={color} strokeWidth={2} strokeDasharray={dash} opacity={o} />;

// 1 · Partitions along the top; the CDC merge's bracket and compaction's both reach p2, which flashes red three nights
// in a row. Below, an expiry line sweeps a snapshot chain and the auditor's arrow finds an empty red slot.
export function Hook({ t }: StepCtx) {
  const flash = t > 1.1 ? (Math.sin((t - 1.1) * 9) > 0 ? 1 : 0.35) * (t < 2.6 ? 1 : 0) + (t >= 2.6 ? 1 : 0) : 0;
  const sweep = easeInOut(seg(t, 2.4, 3.4));
  const sx = lerp(150, 400, sweep);
  const audit = easeOut(seg(t, 3.4, 3.8));
  return (
    <Svg label="a recurring commit conflict on the same partitions; an audit snapshot already expired" h={270}>
      <Partitions y={20} o={easeOut(seg(t, 0, 0.3))} hot={flash > 0.5 ? 1 : -1} />
      <T x={30} y={78} s={13} f={C.primary} o={easeOut(seg(t, 0.3, 0.6))}>
        cdc merge
      </T>
      <Bracket a={PX(0)} b={PX(1) + 70} y={72} color={C.focus} o={easeOut(seg(t, 0.3, 0.6))} />
      <T x={30} y={104} s={13} f={C.second} o={easeOut(seg(t, 0.6, 0.9))}>
        compaction
      </T>
      <Bracket a={PX(1)} b={PX(2) + 70} y={98} color={C.second} o={easeOut(seg(t, 0.6, 0.9))} />
      <Cross x={PX(1) + 35} y={124} k={flash} />
      <T x={30} y={170} s={13} f={C.primary} o={easeOut(seg(t, 2.0, 2.3))}>
        snapshots
      </T>
      {Array.from({ length: 14 }, (_, i) => {
        const x = 155 + i * 30;
        const gone = x < sx;
        return <circle key={i} cx={x} cy={165} r={6} fill={C.primary} opacity={easeOut(seg(t, 2.0 + i * 0.02, 2.3 + i * 0.02)) * (gone ? 0.08 : 1)} />;
      })}
      {sweep > 0 && <line x1={sx} y1={148} x2={sx} y2={182} stroke={C.focus} strokeWidth={2} />}
      {audit > 0 && (
        <g opacity={audit}>
          <circle cx={185} cy={165} r={9} fill="none" stroke={C.badText} strokeDasharray="3 2" strokeWidth={1.6} />
          <line x1={185} y1={202} x2={185} y2={178} stroke={C.badText} strokeWidth={1.5} />
          <T x={198} y={204} s={13} f={C.badText}>
            the auditor's date
          </T>
        </g>
      )}
      <Line2 y={236} l="commit conflict" r="every few nights" rc={C.badText} o={easeOut(seg(t, 1.6, 2.0))} />
      <Line2 y={262} l="audit snapshot" r="already expired" rc={C.badText} o={easeOut(seg(t, 3.7, 4.1))} />
    </Svg>
  );
}

// 2 · Two red problem chips on the left, two dashed answer slots on the right. After the pick, the slots fill with the
// one decision's two halves, lines run to the problems, and each problem turns white with a check.
export function Predict1({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const a = on ? easeOut(seg(s, 0.3, 0.8)) : 0;
  const b = on ? easeOut(seg(s, 1.0, 1.5)) : 0;
  const PROB = ['same files', 'expired snapshot'];
  const FIX = ['disjoint partitions', 'retention class + tag'];
  return (
    <Svg label="which single decision prevents both the conflict and the lost snapshot?" h={210}>
      {PROB.map((p, i) => {
        const fixed = (i === 0 ? a : b) > 0.5;
        return (
          <g key={p}>
            <Box x={30} y={30 + i * 70} w={200} label={p} o={easeOut(seg(t, 0.2 + i * 0.2, 0.5 + i * 0.2))} stroke={fixed ? C.focus : C.badText} f={fixed ? C.focus : C.badText} />
            <Tick x={245} y={44 + i * 70} k={i === 0 ? easeOut(seg(s, 0.8, 1.0)) * (on ? 1 : 0) : easeOut(seg(s, 1.5, 1.7)) * (on ? 1 : 0)} />
          </g>
        );
      })}
      {FIX.map((f, i) => {
        const k = i === 0 ? a : b;
        return (
          <g key={f}>
            {k < 1 && <Box x={330} y={30 + i * 70} w={240} label="?" dash="4 3" o={easeOut(seg(t, 0.6, 0.9)) * (1 - k)} />}
            {k > 0 && <Box x={330} y={30 + i * 70} w={240} label={f} lit o={k} />}
            {k > 0 && <line x1={330} y1={46 + i * 70} x2={lerp(330, 262, k)} y2={46 + i * 70} stroke={C.focus} strokeWidth={1.4} />}
          </g>
        );
      })}
      <T x={300} y={196} s={14} f={C.secondary} a="middle" o={easeOut(seg(t, 1.0, 1.4))}>
        one decision, taken once
      </T>
    </Svg>
  );
}

const LANES = ['cdc merge', 'backfill', 'compaction'];

// 3 · Three writer lanes run to one pointer. The merge's swap lands and the pointer moves down a snapshot; the
// backfill's lands on a stale pointer and bounces red with a retry arrow; compaction's lands; the backfill's retry
// lands last. No partial state ever shows.
export function RevealAtomicSwap({ t }: StepCtx) {
  const EV = [
    { lane: 0, at: 0.8, ok: true },
    { lane: 1, at: 1.5, ok: false },
    { lane: 2, at: 2.2, ok: true },
    { lane: 1, at: 2.9, ok: true },
  ];
  const landed = EV.filter((e) => e.ok && t > e.at + 0.45).length;
  return (
    <Svg label="three writer lanes converge on one pointer; a swap lands, or it doesn't" h={240}>
      {LANES.map((l, i) => (
        <g key={l} opacity={easeOut(seg(t, i * 0.15, i * 0.15 + 0.3))}>
          <T x={30} y={50 + i * 55} s={13} f={C.primary}>
            {l}
          </T>
          <line x1={130} y1={45 + i * 55} x2={360} y2={100} stroke={C.line} />
        </g>
      ))}
      <Box x={370} y={84} w={100} label="pointer" lit o={easeOut(seg(t, 0.2, 0.5))} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={520} y={30 + i * 45} width={50} height={30} rx={3} fill={i === landed ? C.focus : C.panel} stroke={i <= landed ? C.focus : C.line} opacity={easeOut(seg(t, 0.3, 0.6)) * (i <= landed ? 1 : 0.4)} />
      ))}
      <line x1={470} y1={100} x2={518} y2={45 + landed * 45} stroke={C.focus} strokeWidth={1.8} opacity={easeOut(seg(t, 0.3, 0.6))} />
      {EV.map((e, i) => {
        const p = seg(t, e.at, e.at + 0.45);
        if (p <= 0 || p >= 1) {
          if (!e.ok && t > e.at + 0.45 && t < e.at + 1.2) {
            return (
              <g key={i} opacity={1 - seg(t, e.at + 0.9, e.at + 1.2)}>
                <Cross x={360} y={70} k={1} />
                <T x={330} y={60} s={13} f={C.badText} a="end">
                  retry
                </T>
              </g>
            );
          }
          return null;
        }
        const k = easeInOut(p);
        const x = lerp(130, 360, k);
        const y = lerp(45 + e.lane * 55, 100, k);
        return <circle key={i} cx={x} cy={y} r={6} fill={e.ok ? C.focus : C.badText} />;
      })}
      <T x={300} y={226} s={14} f={C.secondary} a="middle" o={easeOut(seg(t, 3.5, 3.9))}>
        a swap lands whole, or not at all
      </T>
    </Svg>
  );
}

// 4 · The merge on p1–p2 and compaction on p2–p3: p2 turns red and the conflict count reads 4 of 4. Compaction's
// bracket slides to p4–p5, the red clears, and the count runs down to 0 of 4.
export function RevealPartitionWriters({ t }: StepCtx) {
  const move = easeInOut(seg(t, 2.0, 2.8));
  const ca = lerp(PX(1), PX(3), move);
  const cb = lerp(PX(2) + 70, PX(4) + 70, move);
  const n = move > 0 ? Math.round(4 * (1 - move)) : Math.round(4 * easeOut(seg(t, 1.0, 1.6)));
  const clash = move < 0.5 && t > 1.0;
  return (
    <Svg label="overlapping partitions collide; disjoint partitions make the collision vanish" h={210}>
      <Partitions y={20} o={easeOut(seg(t, 0, 0.3))} hot={clash ? 1 : -1} />
      <T x={30} y={78} s={13} f={C.primary} o={easeOut(seg(t, 0.2, 0.5))}>
        cdc merge
      </T>
      <Bracket a={PX(0)} b={PX(1) + 70} y={72} color={C.focus} o={easeOut(seg(t, 0.2, 0.5))} />
      <T x={30} y={104} s={13} f={C.second} o={easeOut(seg(t, 0.5, 0.8))}>
        compaction
      </T>
      <Bracket a={ca} b={cb} y={98} color={C.second} o={easeOut(seg(t, 0.5, 0.8))} />
      {move > 0.95 && <Tick x={575} y={92} k={easeOut(seg(t, 2.8, 3.1))} />}
      <Line2 y={150} l="conflicts" r={`${n} of 4 runs`} rc={n > 0 ? C.badText : C.focus} o={easeOut(seg(t, 1.0, 1.3))} />
      <Line2 y={190} l="not faster retries" r="never the same files" o={easeOut(seg(t, 3.2, 3.6))} />
    </Svg>
  );
}

// 5 · A "+ column" chip passes a two-post review gate into the schema card, which grows a fourth column. Three writers
// keep committing into it, two on the old schema; every commit lands with a check.
export function RevealSchemaPolicy({ t }: StepCtx) {
  const pass = easeInOut(seg(t, 0.4, 1.6));
  const added = pass > 0.98;
  return (
    <Svg label="a schema change passes review; old-schema writers keep running without breaking" h={210}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <line x1={215} y1={24} x2={215} y2={72} stroke={C.focus} strokeWidth={3} />
        <line x1={245} y1={24} x2={245} y2={72} stroke={C.focus} strokeWidth={3} />
        <T x={230} y={90} s={13} f={C.secondary} a="middle">
          review
        </T>
      </g>
      {!added && (
        <g transform={`translate(${lerp(0, 360, pass)} 0)`}>
          <rect x={30} y={34} width={90} height={28} rx={4} fill={C.panel} stroke={C.focus} />
          <T x={75} y={53} s={13} f={C.focus} a="middle">
            + column
          </T>
        </g>
      )}
      <g opacity={easeOut(seg(t, 0.1, 0.4))}>
        <T x={330} y={24} s={13} f={C.secondary}>
          table schema
        </T>
        {[0, 1, 2, 3].map((i) =>
          i < 3 || added ? <rect key={i} x={330 + i * 60} y={34} width={54} height={28} rx={3} fill={i === 3 ? C.focus : C.primary} opacity={i === 3 ? easeOut(seg(t, 1.6, 1.9)) : 1} /> : null
        )}
      </g>
      {['old schema', 'old schema', 'new schema'].map((w, i) => {
        const at = 2.0 + i * 0.45;
        const p = easeInOut(seg(t, at, at + 0.4));
        return (
          <g key={i} opacity={easeOut(seg(t, 1.8, 2.1))}>
            <T x={30} y={128 + i * 26} s={13} f={i === 2 ? C.focus : C.secondary}>
              {`writer · ${w}`}
            </T>
            {p > 0 && p < 1 && <circle cx={lerp(220, 440, p)} cy={lerp(123 + i * 26, 66, p)} r={4} fill={C.focus} />}
            <Tick x={240} y={123 + i * 26} k={easeOut(seg(t, at + 0.4, at + 0.6))} />
          </g>
        );
      })}
      <T x={575} y={150} s={13} f={C.focus} a="end" o={easeOut(seg(t, 3.5, 3.9))}>
        absorbed, not broken
      </T>
    </Svg>
  );
}

// 6 · A snapshot chain; a white pin with a "legal hold" tag drops onto one. The expiry line sweeps left to right and
// every snapshot it passes is cleared, except the pinned one, which stays lit.
export function RevealRetentionTag({ t }: StepCtx) {
  const pin = easeOutBack(seg(t, 0.6, 1.1));
  const sweep = easeInOut(seg(t, 1.5, 3.5));
  const sx = lerp(40, 470, sweep);
  const PIN = 4;
  return (
    <Svg label="an expiry sweep clears snapshots; a tagged one survives it untouched" h={210}>
      <line x1={40} y1={100} x2={570} y2={100} stroke={C.line} opacity={easeOut(seg(t, 0, 0.3))} />
      {Array.from({ length: 16 }, (_, i) => {
        const x = 50 + i * 34;
        const gone = x < sx && i !== PIN;
        return <circle key={i} cx={x} cy={100} r={i === PIN ? 8 : 6} fill={i === PIN ? C.focus : C.primary} opacity={easeOut(seg(t, i * 0.02, 0.3 + i * 0.02)) * (gone ? 0.08 : 1)} />;
      })}
      {pin > 0 && (
        <g opacity={Math.min(1, pin)} transform={`translate(0 ${(1 - Math.min(1, pin)) * -14})`}>
          <line x1={50 + PIN * 34} y1={58} x2={50 + PIN * 34} y2={90} stroke={C.focus} strokeWidth={2} />
          <rect x={50 + PIN * 34 - 50} y={30} width={100} height={26} rx={4} fill={C.panel} stroke={C.focus} />
          <T x={50 + PIN * 34} y={48} s={13} f={C.focus} a="middle">
            legal hold
          </T>
        </g>
      )}
      {sweep > 0 && (
        <g>
          <line x1={sx} y1={76} x2={sx} y2={124} stroke={C.secondary} strokeWidth={2} />
          <T x={sx} y={142} s={13} f={C.secondary} a="middle">
            expiry
          </T>
        </g>
      )}
      <Line2 y={176} l="erasure" r="on schedule" o={easeOut(seg(t, 3.0, 3.4))} />
      <Line2 y={200} l="tagged snapshot" r="survives" o={easeOut(seg(t, 3.5, 3.9))} />
    </Svg>
  );
}

const MAINT = ['compaction', 'expiry', 'orphan removal'];

// 7 · An ingest lane and three maintenance lanes all run to the same pointer. Maintenance swaps land one after
// another; each time the ingest commit arrives it finds the pointer taken and bounces red: starved.
export function RevealMaintenanceWriter({ t }: StepCtx) {
  return (
    <Svg label="compaction, expiry, and orphan removal all attempt the same pointer swap" h={210}>
      <T x={30} y={34} s={13} f={C.focus} o={easeOut(seg(t, 0, 0.3))}>
        ingest
      </T>
      <line x1={150} y1={30} x2={410} y2={90} stroke={C.line} opacity={easeOut(seg(t, 0, 0.3))} />
      {MAINT.map((m, i) => (
        <g key={m} opacity={easeOut(seg(t, 0.2 + i * 0.15, 0.5 + i * 0.15))}>
          <T x={30} y={80 + i * 40} s={13} f={C.second}>
            {m}
          </T>
          <line x1={150} y1={75 + i * 40} x2={410} y2={95} stroke={C.line} />
        </g>
      ))}
      <Box x={420} y={76} w={130} label="pointer" lit o={easeOut(seg(t, 0.2, 0.5))} />
      {MAINT.map((m, i) => {
        const at = 0.8 + i * 0.8;
        const p = easeInOut(seg(t, at, at + 0.45));
        return p > 0 && p < 1 ? <circle key={m} cx={lerp(150, 410, p)} cy={lerp(75 + i * 40, 95, p)} r={6} fill={C.second} /> : null;
      })}
      {[0, 1, 2].map((i) => {
        const at = 0.9 + i * 0.8;
        const p = easeInOut(seg(t, at, at + 0.45));
        const bounce = seg(t, at + 0.45, at + 0.75);
        if (p <= 0) return null;
        if (p < 1) return <circle key={i} cx={lerp(150, 400, p)} cy={lerp(30, 88, p)} r={6} fill={C.focus} />;
        return bounce < 1 ? <Cross key={i} x={398} y={80} k={1 - bounce} /> : null;
      })}
      <T x={575} y={34} s={13} f={C.badText} a="end" o={easeOut(seg(t, 2.6, 3.0))}>
        starved
      </T>
      <T x={30} y={198} s={14} f={C.secondary} o={easeOut(seg(t, 3.2, 3.6))}>
        housekeeping is a writer too
      </T>
    </Svg>
  );
}

const HX = (h: number) => 60 + (h - 9) * 120;

// 8 · An hour axis 9 to 13. Ingest occupies 11 to 13. A maintenance window set at 10 to 12 overlaps it in red; the
// window shrinks to 10 to 11, the red overlap closes, and a check lands.
export function RevealMaintenanceSchedule({ t }: StepCtx) {
  const fit = easeInOut(seg(t, 2.2, 3.0));
  const mEnd = lerp(12, 11, fit);
  const ov = Math.max(0, mEnd - 11);
  return (
    <Svg label="a maintenance window timed clear of the ingest window beside it" h={210}>
      <line x1={60} y1={140} x2={540} y2={140} stroke={C.line} opacity={easeOut(seg(t, 0, 0.3))} />
      {[10, 11, 12, 13].map((h) => (
        <g key={h} opacity={easeOut(seg(t, 0, 0.3))}>
          <line x1={HX(h)} y1={136} x2={HX(h)} y2={144} stroke={C.secondary} />
          <T x={HX(h)} y={162} s={13} f={C.secondary} a="middle">
            {`${h}:00`}
          </T>
        </g>
      ))}
      <T x={30} y={44} s={13} f={C.focus} o={easeOut(seg(t, 0.3, 0.6))}>
        ingest
      </T>
      <rect x={HX(11)} y={30} width={Math.max(0, (HX(13) - HX(11)) * easeOut(seg(t, 0.3, 0.9)))} height={22} fill={C.focus} />
      <T x={30} y={94} s={13} f={C.second} o={easeOut(seg(t, 0.8, 1.1))}>
        maintenance
      </T>
      <rect x={HX(10)} y={80} width={Math.max(0, (HX(mEnd) - HX(10)) * easeOut(seg(t, 0.8, 1.4)))} height={22} fill={C.second} />
      {ov > 0.02 && t > 1.4 && (
        <g opacity={easeOut(seg(t, 1.4, 1.7))}>
          <rect x={HX(11)} y={28} width={Math.max(0, HX(11 + ov) - HX(11))} height={76} fill="none" stroke={C.badText} strokeWidth={1.6} />
          <T x={HX(11) + 6} y={124} s={13} f={C.badText}>
            overlap
          </T>
        </g>
      )}
      <Tick x={HX(11) - 10} y={70} k={easeOut(seg(t, 3.0, 3.3))} />
      <Line2 y={196} l="the schedule" r="is the decision" o={easeOut(seg(t, 3.3, 3.7))} />
    </Svg>
  );
}

// 9 · Five glyph rows, each drawing its picture and then its line.
export function Recap({ t }: StepCtx) {
  const ROWS: [string, string, string?][] = [
    ['atomic swap', 'whole, or not at all'],
    ['partitions', 'disjoint', C.second],
    ['schema', 'a written policy'],
    ['hold and expiry', 'coexist'],
    ['maintenance', 'timed clear of ingest'],
  ];
  return (
    <Svg label="one atomic swap, disjoint partitions, a schema policy, a tag, a maintenance schedule" h={290}>
      {ROWS.map(([l, r, c], i) => {
        const y = 40 + i * 55;
        const at = i * 0.65;
        return (
          <g key={l} opacity={easeOut(seg(t, at, at + 0.4))}>
            {i === 0 && (
              <g>
                <rect x={30} y={y - 14} width={30} height={16} rx={2} fill="none" stroke={C.focus} />
                <line x1={60} y1={y - 6} x2={84} y2={y - 6} stroke={C.focus} strokeWidth={1.6} />
                <rect x={86} y={y - 14} width={22} height={16} rx={2} fill={C.focus} />
              </g>
            )}
            {i === 1 && (
              <g>
                <path d={`M30 ${y - 10} L30 ${y - 4} L64 ${y - 4} L64 ${y - 10}`} fill="none" stroke={C.focus} strokeWidth={2} />
                <path d={`M74 ${y - 10} L74 ${y - 4} L108 ${y - 4} L108 ${y - 10}`} fill="none" stroke={C.second} strokeWidth={2} />
              </g>
            )}
            {i === 2 && [0, 1, 2, 3].map((j) => <rect key={j} x={30 + j * 20} y={y - 14} width={16} height={16} rx={2} fill={j === 3 ? C.focus : C.primary} />)}
            {i === 3 && (
              <g>
                {[0, 1, 2, 3, 4].map((j) => (
                  <circle key={j} cx={36 + j * 17} cy={y - 6} r={j === 2 ? 5 : 4} fill={j === 2 ? C.focus : C.primary} opacity={j < 2 ? 0.15 : 1} />
                ))}
              </g>
            )}
            {i === 4 && (
              <g>
                <rect x={30} y={y - 14} width={34} height={7} fill={C.second} />
                <rect x={66} y={y - 5} width={42} height={7} fill={C.focus} />
              </g>
            )}
            <Line2 y={y} l={l} r={r} lx={125} lc={C.primary} rc={c ?? C.focus} o={easeOut(seg(t, at + 0.2, at + 0.5))} />
          </g>
        );
      })}
    </Svg>
  );
}

// 10 · The merge on p1–p2 and compaction on p4–p5; a new backfill writer hovers dashed over p4–p5. After the pick, an
// overlap check runs against each existing writer: clear against the merge, red against compaction; the new writer
// moves to the free p3 and gets its check before it ships.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const c1 = on ? easeOut(seg(s, 0.3, 0.6)) : 0;
  const c2 = on ? easeOut(seg(s, 0.9, 1.2)) : 0;
  const mv = on ? easeInOut(seg(s, 1.6, 2.3)) : 0;
  const na = lerp(PX(3), PX(2), mv);
  const nb = lerp(PX(4) + 70, PX(2) + 70, mv);
  return (
    <Svg label="a new writer about to share partitions with compaction; check overlap first" h={250}>
      <Partitions y={20} o={easeOut(seg(t, 0, 0.3))} hot={c2 > 0.5 && mv < 0.5 ? 3 : -1} />
      <T x={30} y={78} s={13} f={C.primary} o={easeOut(seg(t, 0.2, 0.5))}>
        cdc merge
      </T>
      <Bracket a={PX(0)} b={PX(1) + 70} y={72} color={C.focus} o={easeOut(seg(t, 0.2, 0.5))} />
      <T x={30} y={104} s={13} f={C.second} o={easeOut(seg(t, 0.3, 0.6))}>
        compaction
      </T>
      <Bracket a={PX(3)} b={PX(4) + 70} y={98} color={C.second} o={easeOut(seg(t, 0.3, 0.6))} />
      <T x={30} y={130} s={13} f={mv > 0.9 ? C.focus : C.secondary} o={easeOut(seg(t, 0.6, 0.9))}>
        new backfill
      </T>
      <Bracket a={na} b={nb} y={124} color={mv > 0.9 ? C.focus : C.secondary} dash={mv > 0.9 ? undefined : '4 3'} o={easeOut(seg(t, 0.6, 0.9))} />
      {on && (
        <g>
          <Line2 y={170} l="against cdc merge" r="no overlap" o={c1} />
          <Line2 y={194} l="against compaction" r={mv > 0.5 ? 'moved to p3' : 'overlap on p4, p5'} rc={mv > 0.5 ? C.focus : C.badText} o={c2} />
        </g>
      )}
      <T x={300} y={234} s={14} f={on && mv > 0.9 ? C.focus : C.secondary} a="middle" o={easeOut(seg(t, 1.0, 1.4))}>
        {on && mv > 0.9 ? 'checked before it ships' : 'ship it and see?'}
      </T>
    </Svg>
  );
}
