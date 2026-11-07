import { useEffect, useState } from 'react';
import { C, Draw, Reticle, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// CHAPTER.md, topic 14: the pipeline strip with a dashed correctness boundary at the merge; a source-disk gauge
// beside the replication slot drawn as a growing WAL column while the connector lane goes dark; a cap line
// (max_slot_wal_keep_size) crossing it, the post-cap outcome an invalidated slot and a forced re-snapshot in red; a
// compaction backlog slowing the sink and the slot gauge rising in sympathy. Numbers are examples.py's simulation:
// WAL at 2,000 a hour against a 50,000 cap, 25 hours to the cap, 60,000 at 30 hours (invalidated); a 60-minute
// heartbeat; 40 small files from ten merges; 24,000 of WAL grown during a 12-hour stall.

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

/** A red box for a failure outcome. */
const BadBox = ({ x, y, w, h = 32, label, o = 1 }: { x: number; y: number; w: number; h?: number; label: string; o?: number }) => <Box x={x} y={y} w={w} h={h} label={label} o={o} fill={C.bad} stroke={C.badText} f={C.focus} />;

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

/** A vertical gauge filling to `k` (0..1); the top tenth turns red. */
function Gauge({ x, y, w, h, k, o = 1 }: { x: number; y: number; w: number; h: number; k: number; o?: number }) {
  const fillH = Math.max(0, h * Math.min(1, k));
  const hot = k > 0.85;
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={h} rx={3} fill={C.band} stroke={C.line} />
      <rect x={x} y={y + h - fillH} width={w} height={fillH} rx={3} fill={hot ? C.bad : C.primary} stroke={hot ? C.badText : 'none'} />
    </g>
  );
}

const DAYS = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed'];

// 1 · The connector box goes dark for the weekend upgrade. Days tick by over the disk gauge while the WAL column
// beside it climbs; Monday passes with no restart, and by Wednesday the gauge is red at the top.
export function Hook({ t }: StepCtx) {
  const dark = easeOut(seg(t, 0.5, 0.9));
  const fill = easeInOut(seg(t, 1.0, 3.8));
  const day = Math.min(4, Math.max(0, Math.floor(seg(t, 1.0, 3.9) * 5)));
  return (
    <Svg label="a CDC connector pauses for the weekend; the source disk gauge climbs through the week" h={270}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <rect x={30} y={60} width={160} height={40} rx={4} fill={C.panel} stroke={dark > 0.5 ? C.line : C.focus} strokeWidth={1.5} />
        <T x={110} y={85} s={14} f={dark > 0.5 ? C.quiet : C.focus} a="middle">
          connector
        </T>
      </g>
      {dark > 0 && (
        <g opacity={dark}>
          <rect x={98} y={112} width={7} height={20} fill={C.secondary} />
          <rect x={113} y={112} width={7} height={20} fill={C.secondary} />
          <T x={110} y={154} s={13} f={C.secondary} a="middle">
            paused for upgrade
          </T>
        </g>
      )}
      <line x1={190} y1={80} x2={290} y2={80} stroke={C.line} strokeDasharray="4 4" opacity={easeOut(seg(t, 0, 0.3))} />
      <T x={330} y={24} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 0.2, 0.5))}>
        WAL kept
      </T>
      <rect x={300} y={40} width={60} height={160} fill={C.band} stroke={C.line} opacity={easeOut(seg(t, 0.2, 0.5))} />
      {Array.from({ length: Math.floor(fill * 16) }, (_, i) => (
        <rect key={i} x={304} y={190 - i * 10} width={52} height={7} fill={C.primary} />
      ))}
      <T x={470} y={24} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 0.2, 0.5))}>
        source disk
      </T>
      <Gauge x={445} y={40} w={50} h={160} k={0.25 + 0.69 * fill} o={easeOut(seg(t, 0.2, 0.5))} />
      {t > 1.0 && (
        <T x={530} y={60} s={16} f={day === 4 ? C.badText : C.focus}>
          {DAYS[day]}
        </T>
      )}
      <Line2 y={234} l="Monday" r="nobody restarts it" o={easeOut(seg(t, 2.2, 2.6))} />
      <Line2 y={260} l="orders database" r="nearly out of disk" rc={C.badText} o={easeOut(seg(t, 3.7, 4.1))} />
    </Svg>
  );
}

// 2 · Two suspects beside a climbing gauge. After the pick, "connector bug" dims; "the slot" lights, a cap line drops
// across the gauge with its setting's name, and its cost appears in red.
export function Predict1({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const pick = on ? easeOut(seg(s, 0.2, 0.6)) : 0;
  const cap = on ? easeOutBack(seg(s, 0.8, 1.3)) : 0;
  const cost = on ? easeOut(seg(s, 1.6, 2.0)) : 0;
  return (
    <Svg label="what single setting bounds the slot, and what does the bound cost?" h={210}>
      <Box x={30} y={20} w={220} label="a connector bug" o={easeOut(seg(t, 0.2, 0.5)) * (1 - 0.6 * pick)} />
      <Box x={30} y={64} w={220} label="the replication slot" lit={pick > 0.5} o={easeOut(seg(t, 0.4, 0.7))} />
      <Gauge x={470} y={20} w={50} h={150} k={0.3 + 0.55 * easeInOut(seg(t, 0.4, 1.6))} o={easeOut(seg(t, 0, 0.3))} />
      {cap > 0 && (
        <g opacity={Math.min(1, cap)}>
          <line x1={440} y1={lerp(20, 50, Math.min(1, cap))} x2={550} y2={lerp(20, 50, Math.min(1, cap))} stroke={C.focus} strokeWidth={2} strokeDasharray="6 3" />
          <T x={430} y={55} s={13} f={C.focus} a="end">
            cap
          </T>
          <T x={30} y={136} s={14} f={C.focus}>
            max_slot_wal_keep_size
          </T>
        </g>
      )}
      {cost > 0 && (
        <T x={30} y={166} s={14} f={C.badText} o={cost}>
          past it: a forced re-snapshot
        </T>
      )}
      {!on && (
        <T x={30} y={150} s={14} f={C.secondary} o={easeOut(seg(t, 1.0, 1.4))}>
          not a leak in the code
        </T>
      )}
    </Svg>
  );
}

const STRIP: { label: string; x: number; y: number }[] = [
  { label: 'WAL', x: 30, y: 26 },
  { label: 'slot', x: 225, y: 26 },
  { label: 'connector', x: 420, y: 26 },
  { label: 'topic', x: 420, y: 118 },
  { label: 'merge', x: 225, y: 118 },
  { label: 'lake table', x: 30, y: 118 },
];
const HEIGHTS = [16, 6, 11];

// 3 · The six stages build in a snake. Three log-position bars arrive under the topic out of order; they pass through
// the merge, across the dashed correctness boundary, and land under the lake table sorted by position.
export function RevealPipelineStrip({ t }: StepCtx) {
  const move = easeInOut(seg(t, 2.8, 3.8));
  return (
    <Svg label="log, slot, connector, topic, merge; the correctness boundary sits at the merge" h={240}>
      <Draw pts={[[180, 43], [225, 43]]} t={t} from={0.3} to={0.5} stroke={C.line} w={1.4} pen={false} />
      <Draw pts={[[375, 43], [420, 43]]} t={t} from={0.6} to={0.8} stroke={C.line} w={1.4} pen={false} />
      <Draw pts={[[570, 43], [585, 43], [585, 135], [570, 135]]} t={t} from={0.9} to={1.1} stroke={C.line} w={1.4} pen={false} />
      <Draw pts={[[420, 135], [375, 135]]} t={t} from={1.2} to={1.4} stroke={C.line} w={1.4} pen={false} />
      <Draw pts={[[225, 135], [180, 135]]} t={t} from={1.5} to={1.7} stroke={C.line} w={1.4} pen={false} />
      {STRIP.map((b, i) => (
        <Box key={b.label} x={b.x} y={b.y} w={150} h={34} label={b.label} lit={i === 4 && t > 2.2} o={easeOut(seg(t, i * 0.3, i * 0.3 + 0.3))} />
      ))}
      <g opacity={easeOut(seg(t, 2.0, 2.4))}>
        <line x1={398} y1={110} x2={398} y2={205} stroke={C.focus} strokeDasharray="5 4" strokeWidth={1.4} />
        <T x={398} y={100} s={13} f={C.secondary} a="middle">
          correctness boundary
        </T>
      </g>
      {HEIGHTS.map((h, i) => {
        const sorted = [...HEIGHTS].sort((a, b) => a - b).indexOf(h);
        const k = easeOut(seg(t, 2.3 + i * 0.1, 2.6 + i * 0.1));
        if (k <= 0) return null;
        const x0 = 470 + i * 18;
        const x1 = 80 + sorted * 18;
        const x = lerp(x0, x1, move);
        const jig = move < 0.5 ? Math.sin((t + i) * 9) * 2 * (1 - move * 2) : 0;
        return <rect key={i} x={x} y={190 - h + jig} width={12} height={h} fill={move > 0.9 ? C.focus : C.primary} opacity={k} />;
      })}
      <T x={300} y={230} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 3.6, 4.0))}>
        merged by log position, not arrival
      </T>
    </Svg>
  );
}

// 4 · A log tape: the write head moves right and the slot's confirmed mark follows, so little is kept. Then the
// connector stops: the mark freezes, the kept stretch grows behind the head, and turns red as it fills the disk.
export function RevealGuaranteeIsHazard({ t }: StepCtx) {
  const head = 60 + 500 * seg(t, 0.2, 4.4);
  const stopAt = 60 + 500 * seg(2.0, 0.2, 4.4);
  const stopped = head > stopAt;
  const mark = stopped ? stopAt - 40 : Math.max(60, head - 40);
  const kept = head - mark;
  const bad = kept > 230;
  return (
    <Svg label="the slot keeps every unconfirmed byte; that guarantee is also the hazard" h={210}>
      <rect x={60} y={50} width={500} height={30} fill={C.band} stroke={C.line} opacity={easeOut(seg(t, 0, 0.3))} />
      <rect x={mark} y={50} width={Math.max(0, kept)} height={30} fill={bad ? C.bad : C.primary} stroke={bad ? C.badText : 'none'} />
      <line x1={head} y1={42} x2={head} y2={88} stroke={C.focus} strokeWidth={2} />
      <T x={head} y={36} s={13} f={C.focus} a={head > 480 ? 'end' : 'middle'}>
        writes
      </T>
      <path d={`M${mark - 6} 98 L${mark} 88 L${mark + 6} 98 Z`} fill={stopped ? C.secondary : C.focus} />
      <T x={Math.max(60, mark)} y={116} s={13} f={stopped ? C.secondary : C.focus} a="middle">
        confirmed
      </T>
      <Line2 y={160} l="connector running" r="kept: protects data" o={easeOut(seg(t, 0.6, 1.0))} />
      <Line2 y={190} l="connector stopped" r="kept: fills the disk" rc={C.badText} o={easeOut(seg(t, 3.2, 3.6))} />
    </Svg>
  );
}

const HX = (h: number) => 60 + (h / 30) * 330;
const BY = (b: number) => 170 - (b / 60000) * 140;

// 5 · Retained WAL climbs at 2,000 an hour toward the 50,000 cap; the hour counter runs to 25 as it meets the cap.
// Past it, the slot box turns red, invalidated, and a red re-snapshot follows. A pale-blue heartbeat sawtooth
// stays near the floor.
export function RevealCapAndCost({ t }: StepCtx) {
  const run = easeInOut(seg(t, 0.6, 2.8));
  const h = 30 * run;
  const past = h > 25;
  const inv = easeOut(seg(t, 2.8, 3.2));
  const snap = easeOut(seg(t, 3.3, 3.7));
  const saw: [number, number][] = [];
  for (let i = 0; i <= 12; i++) {
    const x = HX(i * 2.5);
    saw.push([x, 166], [x + 13, 154]);
  }
  return (
    <Svg label="a cap bounds the slot; past it, a forced re-snapshot; a heartbeat holds quiet tables short" h={210}>
      <g opacity={easeOut(seg(t, 0, 0.3))} stroke={C.line}>
        <line x1={60} y1={170} x2={390} y2={170} />
        <line x1={60} y1={24} x2={60} y2={170} />
      </g>
      <g opacity={easeOut(seg(t, 0.2, 0.5))}>
        <line x1={60} y1={BY(50000)} x2={390} y2={BY(50000)} stroke={C.focus} strokeDasharray="6 3" strokeWidth={1.6} />
        <T x={66} y={BY(50000) - 8} s={13} f={C.focus}>
          cap · 50,000
        </T>
      </g>
      {run > 0 && (
        <g>
          <line x1={HX(0)} y1={BY(0)} x2={HX(Math.min(h, 25))} y2={BY(2000 * Math.min(h, 25))} stroke={C.primary} strokeWidth={2} />
          {past && <line x1={HX(25)} y1={BY(50000)} x2={HX(h)} y2={BY(2000 * h)} stroke={C.badText} strokeWidth={2} />}
          <T x={HX(25)} y={190} s={13} f={past ? C.focus : C.primary} a="middle">
            {`${Math.min(25, Math.round(h))} h`}
          </T>
        </g>
      )}
      <Reticle x={HX(25)} y={BY(50000)} w={16} h={16} t={t} at={2.4} />
      <Draw pts={saw} t={t} from={1.0} to={2.6} stroke={C.second} w={1.3} pen={false} />
      <T x={385} y={150} s={13} f={C.second} a="end" o={easeOut(seg(t, 2.3, 2.6))}>
        heartbeat
      </T>
      <Box x={420} y={36} w={150} label="slot" o={easeOut(seg(t, 0.1, 0.4)) * (1 - inv)} />
      {inv > 0 && <BadBox x={420} y={36} w={150} label="invalidated" o={inv} />}
      {snap > 0 && (
        <g opacity={snap}>
          <line x1={495} y1={68} x2={495} y2={96} stroke={C.badText} strokeWidth={1.5} />
          <BadBox x={420} y={96} w={150} label="re-snapshot" />
        </g>
      )}
      <T x={495} y={160} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 3.6, 4.0))}>
        from scratch
      </T>
    </Svg>
  );
}

// 6 · Lane one: a snapshot block fills, a marker drops at its log position, and the stream starts exactly there.
// Lane two: table chunks and pale-blue log events interleave along one tape, no lock taken. Both seams get a check.
export function RevealSnapshotHandover({ t }: StepCtx) {
  const snap = easeInOut(seg(t, 0.3, 1.3));
  const mark = easeOut(seg(t, 1.3, 1.6));
  const stream = easeInOut(seg(t, 1.6, 2.6));
  return (
    <Svg label="snapshot then stream, or a lock-free interleaved handover; no gap, no overlap" h={210}>
      <T x={30} y={26} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        snapshot, then stream
      </T>
      <rect x={30} y={36} width={Math.max(0, 230 * snap)} height={26} fill={C.primary} />
      {mark > 0 && (
        <g opacity={mark}>
          <line x1={262} y1={30} x2={262} y2={70} stroke={C.focus} strokeWidth={2} />
          <T x={262} y={86} s={13} f={C.focus} a="middle">
            its log position
          </T>
        </g>
      )}
      {Array.from({ length: Math.floor(stream * 14) }, (_, i) => (
        <circle key={i} cx={274 + i * 21} cy={49} r={5} fill={C.focus} />
      ))}
      <T x={30} y={120} s={13} f={C.secondary} o={easeOut(seg(t, 2.4, 2.7))}>
        interleaved, no lock
      </T>
      {Array.from({ length: 9 }, (_, i) => {
        const k = easeOut(seg(t, 2.6 + i * 0.12, 2.8 + i * 0.12));
        if (k <= 0) return null;
        const x = 30 + i * 60;
        return i % 2 === 0 ? (
          <rect key={i} x={x} y={130} width={52} height={26} fill={C.primary} opacity={k} />
        ) : (
          <g key={i} opacity={k}>
            <circle cx={x + 15} cy={143} r={5} fill={C.second} />
            <circle cx={x + 35} cy={143} r={5} fill={C.second} />
          </g>
        );
      })}
      <T x={30} y={196} s={14} f={C.focus} o={easeOut(seg(t, 3.9, 4.3))}>
        no gap, no overlap
      </T>
    </Svg>
  );
}

// 7 · Left: a tombstone chip flies in and the row it names is deleted from the table. Right: a new column expands in
// beside the old one while readers keep working, then the old column contracts away; a same-day rename is struck red.
export function RevealDeleteSchema({ t }: StepCtx) {
  const fly = easeInOut(seg(t, 0.4, 1.2));
  const del = easeOut(seg(t, 1.2, 1.6));
  const expand = easeOutBack(seg(t, 2.0, 2.5));
  const contract = easeInOut(seg(t, 3.0, 3.5));
  const rename = easeOut(seg(t, 3.7, 4.1));
  return (
    <Svg label="a tombstone applied as a delete; a column rolled out as expand, then contract" h={210}>
      <T x={30} y={22} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        delete · a tombstone
      </T>
      {[0, 1, 2].map((i) => {
        const isDel = i === 1;
        if (isDel && del >= 1) return null;
        return <rect key={i} x={30} y={70 + i * 30} width={200} height={22} rx={3} fill={C.primary} opacity={easeOut(seg(t, 0.1, 0.4)) * (isDel ? 1 - del : 1)} />;
      })}
      {fly > 0 && del < 1 && (
        <g opacity={1 - del}>
          <rect x={lerp(30, 120, fly)} y={lerp(30, 98, fly)} width={110} height={24} rx={3} fill={C.panel} stroke={C.focus} />
          <T x={lerp(30, 120, fly) + 55} y={lerp(30, 98, fly) + 17} s={13} f={C.focus} a="middle">
            tombstone
          </T>
        </g>
      )}
      <T x={30} y={180} s={13} f={C.focus} o={easeOut(seg(t, 1.5, 1.9))}>
        applied, not inferred
      </T>
      <T x={320} y={22} s={13} f={C.secondary} o={easeOut(seg(t, 1.6, 1.9))}>
        schema change
      </T>
      <g opacity={easeOut(seg(t, 1.6, 1.9))}>
        {contract < 1 && <Box x={320} y={36} w={120} h={28} label="old column" o={1 - contract} />}
        {expand > 0 && <Box x={lerp(450, 320, contract)} y={36} w={120} h={28} label="new column" lit o={Math.min(1, expand)} />}
      </g>
      <T x={320} y={90} s={13} f={contract > 0.5 ? C.focus : C.primary} o={easeOut(seg(t, 2.3, 2.6))}>
        {contract > 0.5 ? 'then contract' : 'expand first'}
      </T>
      {rename > 0 && (
        <g opacity={rename}>
          <T x={320} y={130} s={14} f={C.primary}>
            same-day rename
          </T>
          <line x1={316} y1={125} x2={lerp(316, 456, rename)} y2={125} stroke={C.badText} strokeWidth={2} />
          <T x={320} y={154} s={13} f={C.badText}>
            breaks old readers
          </T>
        </g>
      )}
    </Svg>
  );
}

// 8 · Small files pile up to 40 on the left. The compaction box turns red, stalled; the merge's pulse slows to a stop;
// and the slot gauge on the right rises by 24,000 over 12 hours.
export function RevealCompactionStall({ t }: StepCtx) {
  const files = Math.floor(easeInOut(seg(t, 0.2, 1.4)) * 40);
  const stall = easeOut(seg(t, 1.6, 2.0));
  const slow = easeOut(seg(t, 2.2, 2.8));
  const grow = easeInOut(seg(t, 2.8, 3.8));
  const pulse = (t * (1 - slow) * 2) % 1;
  return (
    <Svg label="small files pile up; a stalled compaction stalls the merge, and the slot grows" h={210}>
      {Array.from({ length: files }, (_, i) => (
        <rect key={i} x={30 + (i % 8) * 17} y={40 + Math.floor(i / 8) * 17} width={13} height={13} fill={C.primary} />
      ))}
      <T x={98} y={150} s={13} f={C.primary} a="middle" o={easeOut(seg(t, 1.2, 1.5))}>
        40 small files
      </T>
      {stall < 0.5 ? (
        <Box x={210} y={40} w={150} label="compaction" o={easeOut(seg(t, 0.4, 0.7))} />
      ) : (
        <BadBox x={210} y={40} w={150} label="compaction stalled" o={1} />
      )}
      <g opacity={easeOut(seg(t, 0.6, 0.9))}>
        <rect x={210} y={100} width={150} height={32} rx={4} fill={C.panel} stroke={slow > 0.5 ? C.badText : C.focus} />
        <T x={285} y={121} s={13} f={slow > 0.5 ? C.badText : C.focus} a="middle">
          {slow > 0.9 ? 'merge stalls' : 'merge'}
        </T>
        {slow < 0.95 && <circle cx={220 + pulse * 130} cy={140} r={3} fill={C.focus} />}
      </g>
      <line x1={168} y1={72} x2={208} y2={60} stroke={C.line} opacity={easeOut(seg(t, 0.6, 0.9))} />
      <line x1={285} y1={72} x2={285} y2={100} stroke={C.line} opacity={easeOut(seg(t, 0.6, 0.9))} />
      <line x1={360} y1={116} x2={455} y2={116} stroke={C.line} opacity={easeOut(seg(t, 0.6, 0.9))} />
      <T x={480} y={24} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 0.6, 0.9))}>
        slot
      </T>
      <Gauge x={455} y={34} w={50} h={130} k={0.2 + 0.68 * grow} o={easeOut(seg(t, 0.6, 0.9))} />
      <T x={575} y={190} s={13} f={C.badText} a="end" o={easeOut(seg(t, 3.6, 4.0))}>
        +24,000 in 12 h
      </T>
      <T x={30} y={190} s={13} f={C.secondary} o={easeOut(seg(t, 3.8, 4.2))}>
        the sink stalls the source
      </T>
    </Svg>
  );
}

// 9 · Five glyph rows, each drawing its picture and then its line.
export function Recap({ t }: StepCtx) {
  const ROWS: [string, string, string?][] = [
    ['boundary', 'at the merge'],
    ['slot cap', 'availability for completeness', C.badText],
    ['handover', 'no gap, no overlap'],
    ['deletes, schema', 'applied on purpose'],
    ['compaction', 'tied to the slot'],
  ];
  return (
    <Svg label="the strip, the slot-and-cap trade, the handover, deletes and schema, compaction and slot" h={290}>
      {ROWS.map(([l, r, c], i) => {
        const y = 40 + i * 55;
        const at = i * 0.65;
        return (
          <g key={l} opacity={easeOut(seg(t, at, at + 0.4))}>
            {i === 0 && (
              <g>
                {[0, 1, 2, 3].map((j) => (
                  <rect key={j} x={30 + j * 20} y={y - 12} width={14} height={12} fill={C.primary} />
                ))}
                <line x1={87} y1={y - 18} x2={87} y2={y + 4} stroke={C.focus} strokeDasharray="2 2" />
              </g>
            )}
            {i === 1 && (
              <g>
                <rect x={30} y={y - 14} width={30} height={16} fill={C.primary} />
                <rect x={60} y={y - 14} width={20} height={16} fill={C.bad} stroke={C.badText} />
                <line x1={60} y1={y - 20} x2={60} y2={y + 6} stroke={C.focus} strokeDasharray="3 2" />
              </g>
            )}
            {i === 2 && (
              <g>
                <rect x={30} y={y - 12} width={44} height={12} fill={C.primary} />
                {[82, 94, 106].map((x) => (
                  <circle key={x} cx={x} cy={y - 6} r={3.5} fill={C.focus} />
                ))}
              </g>
            )}
            {i === 3 && (
              <g>
                <rect x={30} y={y - 14} width={36} height={16} rx={2} fill="none" stroke={C.line} strokeDasharray="3 2" />
                <rect x={72} y={y - 14} width={36} height={16} rx={2} fill="none" stroke={C.focus} />
              </g>
            )}
            {i === 4 && (
              <g>
                {[0, 1, 2, 3, 4, 5].map((j) => (
                  <rect key={j} x={30 + (j % 3) * 10} y={y - 14 + Math.floor(j / 3) * 10} width={7} height={7} fill={C.primary} />
                ))}
                <rect x={92} y={y - 16} width={14} height={18} fill={C.band} stroke={C.line} />
                <rect x={92} y={y - 10} width={14} height={12} fill={C.primary} />
              </g>
            )}
            <Line2 y={y} l={l} r={r} lx={125} lc={C.primary} rc={c ?? C.focus} o={easeOut(seg(t, at + 0.2, at + 0.5))} />
          </g>
        );
      })}
    </Svg>
  );
}

// 10 · A second slot's bar, past half its cap and creeping. Before the pick, a dashed "raise the cap?" chip. After,
// a ghost cap slides right and the same cliff follows it ("the same cliff, later"); the chip dims; a dashed run from
// the bar's end to the cap reads "time left = room ÷ growth rate", and the restart chip lights.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const creep = 0.58 + 0.06 * easeInOut(seg(t, 0.2, 1.6));
  const ghost = on ? easeInOut(seg(s, 0.2, 0.9)) : 0;
  const ghostOut = on ? easeOut(seg(s, 1.3, 1.6)) : 0;
  const run = on ? easeInOut(seg(s, 1.6, 2.3)) : 0;
  const fx = 60 + 440 * creep;
  return (
    <Svg label="a second slot, well past half its cap, still climbing" h={250}>
      <T x={30} y={30} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        second slot
      </T>
      <rect x={60} y={50} width={440} height={30} fill={C.band} stroke={C.line} opacity={easeOut(seg(t, 0, 0.3))} />
      <rect x={60} y={50} width={Math.max(0, fx - 60)} height={30} fill={C.primary} />
      <line x1={500} y1={40} x2={500} y2={90} stroke={C.focus} strokeWidth={2} strokeDasharray="5 3" opacity={easeOut(seg(t, 0.2, 0.5))} />
      <T x={500} y={34} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 0.2, 0.5))}>
        cap
      </T>
      {ghost > 0 && ghostOut < 1 && (
        <g opacity={(1 - ghostOut) * 0.7}>
          <line x1={lerp(500, 560, ghost)} y1={40} x2={lerp(500, 560, ghost)} y2={90} stroke={C.secondary} strokeDasharray="3 3" />
          <T x={540} y={108} s={13} f={C.secondary} a="end">
            the same cliff, later
          </T>
        </g>
      )}
      {run > 0 && (
        <g>
          <line x1={fx} y1={65} x2={lerp(fx, 500, run)} y2={65} stroke={C.focus} strokeWidth={2} strokeDasharray="4 3" />
          <T x={300} y={124} s={14} f={C.focus} a="middle" o={easeOut(seg(s, 2.1, 2.5))}>
            time left = room ÷ growth rate
          </T>
        </g>
      )}
      <Box x={30} y={170} w={250} label="raise the cap?" dash="4 3" o={easeOut(seg(t, 0.8, 1.2)) * (1 - 0.6 * ghostOut)} />
      <Box x={320} y={170} w={250} label="restart before it's forced" lit o={on ? easeOut(seg(s, 2.5, 2.9)) : 0} />
      <T x={300} y={236} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 1.0, 1.4))}>
        past half, and climbing
      </T>
    </Svg>
  );
}
