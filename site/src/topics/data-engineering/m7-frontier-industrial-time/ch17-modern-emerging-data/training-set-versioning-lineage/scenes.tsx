import { useEffect, useState } from 'react';
import { C, Draw, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// Training-set versioning and lineage, drawn from examples.py run against Postgres 16: a 1,500-row snapshot that
// survives 200 updates and 100 deletes to the live table, md5 content hashes 0f8de662… and b5050eb3…, a tracker search
// that finds churn-model-v3 by its dataset digest, and a 30 d → 45 d churn window flipping 270 of 1,500 labels.

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

/** A box with a centred label. */
const Card = ({ x, y, w, h = 30, l, c = C.primary, o = 1, dash, s = 13 }: { x: number; y: number; w: number; h?: number; l: string; c?: string; o?: number; dash?: boolean; s?: number }) =>
  o <= 0 ? null : (
    <g opacity={Math.min(1, o)}>
      <rect x={x} y={y} width={w} height={h} rx={5} fill={C.panel} stroke={c === C.primary ? C.line : c} strokeWidth={1.3} strokeDasharray={dash ? '4 3' : undefined} />
      <T x={x + w / 2} y={y + h / 2 + 5} s={s} f={c} a="middle">
        {l}
      </T>
    </g>
  );

// examples.py (seed 20261030, Postgres 16): 1,500 customers snapshotted as t17v_snapshot_v1; then the live table has
// 200 rows updated (ids 1–200) and 100 deleted (ids 1,401–1,500), leaving 1,400. md5 of the tracked file: 0f8de662…
// (and of its byte-identical copy); one byte changed: b5050eb3…. Tracker: churn-model-v3 ← 0f8de662…, git:ab12cd3,
// 0.81; churn-model-v4 ← b5050eb3…, git:ef45gh6, 0.78. H: the snapshot's days_since_last_order in 3-day bins, 0–90.
const HA = '0f8de662';
const HC = 'b5050eb3';
const H = [51, 52, 44, 51, 56, 47, 55, 43, 38, 40, 53, 46, 60, 43, 54, 68, 55, 55, 52, 48, 41, 44, 45, 58, 56, 45, 62, 44, 47, 36, 11];

/** 150 cells for 1,500 rows (ten rows a cell): `upd` cells from the left lit blue, `del` cells from the right gone. */
const Rows = ({ y, upd = 0, del = 0, o = 1 }: { y: number; upd?: number; del?: number; o?: number }) => (
  <g opacity={o}>
    {Array.from({ length: 150 }, (_, i) => {
      const gone = i >= 150 - del;
      return (
        <rect
          key={i}
          x={25 + i * 3.66}
          y={y}
          width={2.8}
          height={26}
          fill={gone ? 'none' : i < upd ? C.second : C.primary}
          stroke={gone ? C.badText : 'none'}
          strokeWidth={0.6}
          opacity={gone ? 0.5 : 0.75}
        />
      );
    })}
  </g>
);

// 0 · A time axis from six months ago to today. Then: a table and its training set, "AUC reported". Today: the same table
// compacted — fewer, wider rows. Between them a query card, dashed: never saved. A red arrow tries to rebuild from today
// back to then and stops at a ✕.
export function Hook({ t }: StepCtx) {
  const comp = easeInOut(seg(t, 0.9, 1.5));
  return (
    <Svg label="a dataset reported six months ago, and the query that can no longer rebuild it." h={220}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <line x1={60} y1={30} x2={560} y2={30} stroke={C.line} strokeWidth={1.2} />
        <line x1={120} y1={22} x2={120} y2={38} stroke={C.secondary} strokeWidth={1.4} />
        <line x1={480} y1={22} x2={480} y2={38} stroke={C.focus} strokeWidth={1.6} />
        <T x={120} y={16} s={12} f={C.secondary} a="middle">
          6 months ago
        </T>
        <T x={480} y={16} s={12} f={C.focus} a="middle">
          today
        </T>
      </g>
      <g opacity={easeOut(seg(t, 0.2, 0.6))}>
        {Array.from({ length: 6 }, (_, i) => (
          <rect key={i} x={40} y={56 + i * 14} width={160} height={10} rx={2} fill={C.primary} opacity={0.6} />
        ))}
        <T x={120} y={160} s={12} f={C.focus} a="middle">
          AUC reported
        </T>
      </g>
      <g opacity={easeOut(seg(t, 0.6, 0.9))}>
        {Array.from({ length: 6 }, (_, i) =>
          i < 3 ? (
            <rect key={i} x={400} y={56 + i * lerp(14, 28, comp)} width={160} height={lerp(10, 24, comp)} rx={2} fill={C.secondary} opacity={0.6} />
          ) : (
            <rect key={i} x={400} y={56 + i * 14} width={160} height={10} rx={2} fill={C.secondary} opacity={0.6 * (1 - comp)} />
          ),
        )}
        <T x={480} y={160} s={12} f={C.secondary} a="middle" o={comp}>
          compacted
        </T>
      </g>
      <Card x={235} y={80} w={130} l="query" c={C.badText} dash o={easeOut(seg(t, 1.3, 1.6))} />
      <T x={300} y={132} s={12} f={C.badText} a="middle" o={easeOut(seg(t, 1.5, 1.8))}>
        never saved
      </T>
      <path d={`M470 196 H${lerp(470, 140, easeInOut(seg(t, 1.8, 2.3)))}`} stroke={C.badText} strokeWidth={1.8} strokeDasharray="5 4" fill="none" />
      <Cross x={130} y={196} k={easeOut(seg(t, 2.2, 2.5))} />
    </Svg>
  );
}

// 1 · Left: a whole derived lake dataset, a wide block of partitions. Right: one small file beside train.py. Two tool
// chips float between: lakeFS branch, DVC pin, each with "?". After the answer, lakeFS connects to the lake and DVC to
// the file, each ✓: the tool follows the scale.
export function PredictWhichToolFits({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const r = on ? easeInOut(seg(s, 0.2, 0.9)) : 0;
  return (
    <Svg label="a whole derived lake dataset, or a file next to a training script — which tool fits which?" h={220}>
      <g opacity={easeOut(seg(t, 0, 0.5))}>
        {Array.from({ length: 24 }, (_, i) => (
          <rect key={i} x={25 + (i % 6) * 34} y={30 + Math.floor(i / 6) * 22} width={30} height={18} rx={2} fill={C.primary} opacity={0.5} />
        ))}
        <T x={25} y={140} s={12} f={C.secondary}>
          lake dataset
        </T>
      </g>
      <g opacity={easeOut(seg(t, 0.4, 0.8))}>
        <path d="M440 40 h26 l8 8 v34 h-34 z" fill="none" stroke={C.primary} strokeWidth={1.3} />
        <Card x={490} y={46} w={85} h={28} l="train.py" s={12} />
        <T x={575} y={140} s={12} f={C.secondary} a="end">
          one file
        </T>
      </g>
      {[0, 1].map((i) => {
        const k = easeOut(seg(t, 0.9 + i * 0.3, 1.3 + i * 0.3));
        const x = i === 0 ? 25 : 385;
        return (
          <g key={i} opacity={k}>
            <Card x={x} y={165} w={165} l={i === 0 ? 'lakeFS branch' : 'DVC pin'} c={r > 0.5 ? C.focus : C.primary} />
            {r > 0.9 ? (
              <Tick x={x + 175} y={177} k={1} />
            ) : (
              <T x={x + 172} y={185} s={13} f={C.focus} o={1 - r}>
                ?
              </T>
            )}
          </g>
        );
      })}
      {r > 0 && (
        <g stroke={C.focus} strokeWidth={1.4} strokeDasharray="4 3" opacity={r}>
          <line x1={100} y1={163} x2={100} y2={146} />
          <line x1={467} y1={163} x2={457} y2={88} />
        </g>
      )}
    </Svg>
  );
}

// 2 · Two strips of 1,500 rows, ten to a cell: the current table and snapshot_v1, identical at first. Then the live table
// moves: 200 rows change (blue) and the last 100 vanish; it now reads 1,400. The snapshot strip, tagged, doesn't
// flicker: still 1,500, unchanged.
export function RevealMovingVsPinned({ t }: StepCtx) {
  const upd = Math.round(20 * easeOut(seg(t, 1.2, 1.9)));
  const del = Math.round(10 * easeOut(seg(t, 1.9, 2.5)));
  const after = seg(t, 2.5, 2.6) > 0;
  return (
    <Svg label="the current table keeps moving. A snapshot or tag is a named, immutable reference." h={220}>
      <T x={25} y={36} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        current table
      </T>
      <T x={575} y={36} s={13} f={after ? C.badText : C.primary} a="end" o={easeOut(seg(t, 0.3, 0.6))}>
        {after ? '1,400 rows, 200 changed' : '1,500 rows'}
      </T>
      <Rows y={48} upd={upd} del={del} o={easeOut(seg(t, 0, 0.4))} />
      <g opacity={easeOut(seg(t, 0.5, 0.9))}>
        <T x={25} y={126} s={13} f={C.secondary}>
          snapshot_v1
        </T>
        <rect x={175} y={113} width={34} height={18} rx={3} fill={C.focus} />
        <T x={192} y={126} s={12} f={C.ink} a="middle">
          tag
        </T>
      </g>
      <T x={575} y={126} s={13} f={C.focus} a="end" o={easeOut(seg(t, 0.8, 1.1))}>
        1,500 rows
      </T>
      <Rows y={138} o={easeOut(seg(t, 0.5, 0.9))} />
      <T x={575} y={200} s={13} f={C.focus} a="end" w={600} o={easeOut(seg(t, 3.0, 3.4))}>
        unchanged
      </T>
      <Tick x={455} y={195} k={easeOut(seg(t, 3.2, 3.5))} />
    </Svg>
  );
}

// 3 · A commit line: c1, c2, c3 on main. A branch pointer "exp" appears and points at c3 — the data store beneath doesn't
// grow: 0 bytes copied. A dashed dot beside it: uncommitted changes. A tag flag "v1" plants itself on c2.
export function RevealLakefsBranches({ t }: StepCtx) {
  const br = easeOut(seg(t, 0.9, 1.4));
  const XS = [100, 220, 340];
  return (
    <Svg label="a branch is a pointer to a commit, not a copy. A tag names one commit." h={240}>
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <line x1={XS[0]} y1={90} x2={XS[2]} y2={90} stroke={C.line} strokeWidth={1.6} />
        {XS.map((x, i) => (
          <g key={x}>
            <circle cx={x} cy={90} r={9} fill={C.panel} stroke={C.primary} strokeWidth={1.6} />
            <T x={x} y={120} s={12} f={C.secondary} a="middle">
              {`c${i + 1}`}
            </T>
          </g>
        ))}
        <Card x={400} y={75} w={80} l="main" s={12} />
        <line x1={400} y1={90} x2={352} y2={90} stroke={C.primary} strokeWidth={1.4} />
      </g>
      <g opacity={br}>
        <Card x={400} y={140} w={80} l="exp" c={C.second} s={12} />
        <path d={`M400 155 Q 360 150 ${lerp(400, 346, br)} ${lerp(155, 99, br)}`} fill="none" stroke={C.second} strokeWidth={1.6} />
        <circle cx={505} cy={155} r={6} fill="none" stroke={C.second} strokeWidth={1.4} strokeDasharray="3 2" opacity={easeOut(seg(t, 1.8, 2.2))} />
        <T x={505} y={185} s={12} f={C.second} a="middle" o={easeOut(seg(t, 1.8, 2.2))}>
          uncommitted
        </T>
      </g>
      <g opacity={easeOut(seg(t, 2.4, 2.9))}>
        <line x1={XS[1]} y1={80} x2={XS[1]} y2={44} stroke={C.focus} strokeWidth={1.4} />
        <path d={`M${XS[1]} 44 h34 l-6 8 l6 8 h-34 z`} fill={C.focus} />
        <T x={XS[1] + 15} y={57} s={12} f={C.ink} a="middle">
          v1
        </T>
      </g>
      <g opacity={easeOut(seg(t, 0.4, 0.8))}>
        <rect x={25} y={196} width={300} height={22} rx={3} fill={C.band} stroke={C.line} strokeWidth={1} />
        <T x={35} y={212} s={12} f={C.secondary}>
          data objects
        </T>
      </g>
      <T x={575} y={212} s={13} f={C.focus} a="end" w={600} o={easeOut(seg(t, 1.4, 1.8))}>
        0 bytes copied
      </T>
    </Svg>
  );
}

// 4 · Three files: a.csv and b.csv with byte-identical contents (…2,0), c.csv with one byte changed (…2,1). Each passes
// through md5: a and b both land on 0f8de662…, c on b5050eb3…. The cache keeps two entries, not three.
export function RevealDvcPins({ t }: StepCtx) {
  const FILES: [string, string, string][] = [
    ['a.csv', '2,0', HA],
    ['b.csv', '2,0', HA],
    ['c.csv', '2,1', HC],
  ];
  return (
    <Svg label="DVC pins by content hash — identical bytes, identical hash, regardless of name." h={240}>
      {FILES.map(([n, last, h], i) => {
        const y = 30 + i * 50;
        const k = easeOut(seg(t, i * 0.3, 0.4 + i * 0.3));
        const go = easeInOut(seg(t, 1.0 + i * 0.4, 1.6 + i * 0.4));
        return (
          <g key={n} opacity={k}>
            <T x={25} y={y + 5} s={13} f={C.primary}>
              {n}
            </T>
            <T x={110} y={y + 5} s={12} f={C.secondary}>
              …1,4 /
            </T>
            <T x={192} y={y + 5} s={13} f={i === 2 ? C.badText : C.primary}>
              {last}
            </T>
            <line x1={240} y1={y} x2={lerp(240, 330, go)} y2={y} stroke={C.line} strokeWidth={1.4} />
            {go > 0.95 && <Card x={335} y={y - 14} w={110} h={28} l={`${h}…`} c={i === 2 ? C.badText : C.focus} s={12} />}
          </g>
        );
      })}
      <g opacity={easeOut(seg(t, 2.8, 3.2))}>
        <rect x={470} y={20} width={105} height={150} rx={6} fill="none" stroke={C.second} strokeWidth={1.3} />
        <T x={522} y={40} s={12} f={C.second} a="middle">
          cache
        </T>
        <T x={522} y={90} s={22} f={C.second} a="middle">
          2
        </T>
        <T x={522} y={114} s={12} f={C.secondary} a="middle">
          entries
        </T>
      </g>
      <T x={25} y={222} s={13} f={C.focus} w={600} o={easeOut(seg(t, 3.2, 3.6))}>
        same bytes, same hash, any name
      </T>
    </Svg>
  );
}

// 5 · Left half: a lake dataset of partitions; a branch peels off main, the dataset is built on it, a ✓ says validated,
// and it merges back. Right half: data.csv beside train.py; a DVC pin 0f8de662… rides along with the commit git:ab12cd3.
export function RevealDecisionByScale({ t }: StepCtx) {
  const br = easeInOut(seg(t, 0.4, 1.2));
  const val = easeOut(seg(t, 1.3, 1.7));
  const mg = easeInOut(seg(t, 1.7, 2.4));
  const pin = easeOut(seg(t, 2.6, 3.2));
  return (
    <Svg label="a whole derived lake dataset: a lakeFS branch. A file beside the training script: a DVC pin." h={220}>
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <T x={25} y={24} s={13} f={C.secondary}>
          lake dataset
        </T>
        <line x1={25} y1={60} x2={270} y2={60} stroke={C.line} strokeWidth={1.6} />
        <T x={25} y={80} s={12} f={C.quiet}>
          main
        </T>
      </g>
      {br > 0 && <path d={`M60 60 Q 80 110 ${lerp(80, 150, br)} 120`} fill="none" stroke={C.second} strokeWidth={1.6} />}
      {br > 0.9 &&
        Array.from({ length: 6 }, (_, i) => (
          <rect key={i} x={110 + (i % 3) * 22} y={128 + Math.floor(i / 3) * 16} width={18} height={12} rx={2} fill={C.second} opacity={0.5 * easeOut(seg(t, 1.0 + i * 0.05, 1.3 + i * 0.05))} />
        ))}
      <Tick x={190} y={140} k={val} />
      {mg > 0 && <path d={`M190 120 Q 230 110 ${lerp(200, 250, mg)} ${lerp(110, 62, mg)}`} fill="none" stroke={C.focus} strokeWidth={1.6} />}
      <T x={25} y={200} s={12} f={C.focus} o={easeOut(seg(t, 2.2, 2.6))}>
        branch, validate, merge
      </T>
      <line x1={300} y1={20} x2={300} y2={200} stroke={C.line} strokeWidth={1} strokeDasharray="2 4" opacity={easeOut(seg(t, 0, 0.4))} />
      <g opacity={easeOut(seg(t, 2.3, 2.7))}>
        <Card x={325} y={40} w={120} h={28} l="data.csv" s={12} />
        <Card x={455} y={40} w={120} h={28} l="train.py" s={12} />
      </g>
      <g opacity={pin}>
        <Card x={325} y={100} w={120} h={28} l={`${HA}…`} c={C.focus} s={12} />
        <line x1={445} y1={114} x2={455} y2={114} stroke={C.focus} strokeWidth={1.4} />
        <Card x={455} y={100} w={120} h={28} l="git:ab12cd3" c={C.focus} s={12} />
      </g>
      <T x={575} y={200} s={12} f={C.focus} a="end" o={easeOut(seg(t, 3.3, 3.7))}>
        pin rides the commit
      </T>
    </Svg>
  );
}

// 6 · Two tracker records draw: churn-model-v3 ← 0f8de662…, git:ab12cd3, 0.81; churn-model-v4 ← b5050eb3…, git:ef45gh6,
// 0.78. A search box fills in "dataset = 0f8de662…"; it sweeps the records, lights v3, greys v4: 1 model found.
export function RevealExperimentTracker({ t }: StepCtx) {
  const RECS: [string, string, string, string][] = [
    ['churn-model-v3', HA, 'git:ab12cd3', '0.81'],
    ['churn-model-v4', HC, 'git:ef45gh6', '0.78'],
  ];
  const q = easeOut(seg(t, 1.6, 2.0));
  const hit = easeOut(seg(t, 2.6, 3.0));
  return (
    <Svg label="an experiment tracker links a dataset digest, a code commit and a model run; models become searchable by which dataset trained them." h={220}>
      {RECS.map(([m, d, c, a], i) => {
        const y = 22 + i * 60;
        const k = easeOut(seg(t, 0.2 + i * 0.5, 0.7 + i * 0.5));
        const lit = hit > 0 && i === 0;
        return (
          <g key={m} opacity={k * (hit > 0 && i === 1 ? 1 - 0.6 * hit : 1)}>
            <rect x={25} y={y} width={550} height={46} rx={5} fill={C.panel} stroke={lit ? C.focus : C.line} strokeWidth={lit ? 1.8 : 1.2} />
            <T x={40} y={y + 19} s={13} f={C.primary}>
              {m}
            </T>
            <T x={560} y={y + 19} s={13} f={C.focus} a="end">
              {a}
            </T>
            <T x={40} y={y + 38} s={12} f={lit ? C.focus : C.secondary}>
              {`dataset ${d}…`}
            </T>
            <T x={560} y={y + 38} s={12} f={C.secondary} a="end">
              {c}
            </T>
          </g>
        );
      })}
      <g opacity={q}>
        <rect x={25} y={152} width={320} height={30} rx={5} fill="none" stroke={C.second} strokeWidth={1.3} />
        <T x={40} y={172} s={12} f={C.second}>
          {`search dataset = ${HA}…`}
        </T>
      </g>
      <T x={575} y={172} s={13} f={C.focus} a="end" o={hit}>
        1 model found
      </T>
    </Svg>
  );
}

// 7 · The snapshot's 1,500 rows as a histogram of days since last order, 0–90. A 30-day churn window: every bar past
// 30 turns red — 1,013 churned. The window slides to 45: bars past 45 stay red, 743 churned; the bars between 30 and 45
// turn blue — the same rows, the same features, 270 labels flipped (18.0%).
export function RevealLabelVersionDrift({ t }: StepCtx) {
  const X = (d: number) => 40 + d * 5.6;
  const win = lerp(30, 45, easeInOut(seg(t, 2.0, 2.8)));
  const moved = seg(t, 2.0, 2.1) > 0;
  const on30 = seg(t, 1.0, 1.1) > 0;
  return (
    <Svg label="the same feature snapshot, two label definitions, different labels for the same rows." h={220}>
      {H.map((n, i) => {
        const d0 = i * 3;
        const k = easeOut(seg(t, 0.1 + i * 0.02, 0.5 + i * 0.02));
        const h = n * 1.6 * k;
        const churn = on30 && d0 >= Math.round(win);
        const flip = moved && d0 >= 30 && d0 < Math.round(win);
        return <rect key={i} x={X(d0) + 1} y={150 - h} width={15} height={h} fill={flip ? C.second : churn ? C.badText : C.primary} opacity={0.85} />;
      })}
      <line x1={X(0)} y1={150} x2={X(93)} y2={150} stroke={C.line} strokeWidth={1.2} />
      <T x={X(0)} y={170} s={12} f={C.secondary} a="middle">
        0
      </T>
      <T x={X(90)} y={170} s={12} f={C.secondary} a="middle">
        90 d
      </T>
      {on30 && (
        <g>
          <line x1={X(win)} y1={24} x2={X(win)} y2={156} stroke={C.focus} strokeWidth={2} />
          <T x={X(win)} y={18} s={12} f={C.focus} a="middle">
            {`${Math.round(win)} d window`}
          </T>
        </g>
      )}
      <T x={575} y={194} s={13} f={C.badText} a="end" o={easeOut(seg(t, 1.2, 1.5))}>
        {moved && win > 44.9 ? 'churned: 743' : 'churned: 1,013'}
      </T>
      <T x={25} y={194} s={13} f={C.second} o={easeOut(seg(t, 2.9, 3.3))}>
        270 flipped, 18.0%
      </T>
    </Svg>
  );
}

// 8 · Four lanes draw in turn. A query arrow aimed at a tag, not the live table. A big block → branch, a small file → pin.
// One record joining dataset, code and model. A label line whose window tick slides — its own version.
export function Recap({ t }: StepCtx) {
  const k = (i: number) => easeOut(seg(t, i * 1.0, i * 1.0 + 0.5));
  const ROWS = ['snapshot, not current', 'pin by scale', 'link data, code, model', 'version the label'];
  return (
    <Svg label="query a snapshot, not the current table. Pick the pin by scale. Link dataset, code and model. Watch the label's own version." h={270}>
      {ROWS.map((r, i) => {
        const y = 40 + i * 64;
        return (
          <g key={r} opacity={k(i)}>
            <T x={25} y={y + 5} s={13} f={C.secondary}>
              {r}
            </T>
            {i === 0 && (
              <g>
                <rect x={470} y={y - 11} width={40} height={22} rx={3} fill={C.focus} />
                <T x={490} y={y + 5} s={12} f={C.ink} a="middle">
                  v1
                </T>
                <line x1={330} y1={y} x2={lerp(330, 466, easeOut(seg(t, 0.3, 0.8)))} y2={y} stroke={C.focus} strokeWidth={1.6} />
              </g>
            )}
            {i === 1 && (
              <g>
                <rect x={330} y={y - 14} width={60} height={28} rx={2} fill={C.primary} opacity={0.4} />
                <T x={400} y={y + 5} s={12} f={C.secondary}>
                  branch
                </T>
                <rect x={480} y={y - 8} width={14} height={16} rx={1} fill="none" stroke={C.primary} strokeWidth={1.2} />
                <T x={500} y={y + 5} s={12} f={C.secondary}>
                  pin
                </T>
              </g>
            )}
            {i === 2 && (
              <g>
                {[0, 1, 2].map((j) => (
                  <circle key={j} cx={350 + j * 80} cy={y} r={6} fill={C.focus} opacity={easeOut(seg(t, 2.2 + j * 0.15, 2.5 + j * 0.15))} />
                ))}
                <line x1={350} y1={y} x2={lerp(350, 510, easeOut(seg(t, 2.5, 2.9)))} y2={y} stroke={C.focus} strokeWidth={1.4} />
              </g>
            )}
            {i === 3 && (
              <g>
                <line x1={330} y1={y} x2={560} y2={y} stroke={C.line} strokeWidth={1.2} />
                <line x1={lerp(420, 480, easeInOut(seg(t, 3.4, 4.0)))} y1={y - 12} x2={lerp(420, 480, easeInOut(seg(t, 3.4, 4.0)))} y2={y + 12} stroke={C.second} strokeWidth={2} />
              </g>
            )}
          </g>
        );
      })}
    </Svg>
  );
}

// 9 · The same SQL card, twice: run one returns 1,500 rows; the live table moves underneath; run two returns 1,400 rows,
// 200 changed. Before the answer: "same dataset?" waits between them. After: a red ≠ and a ✕ — a stable query over
// unstable tables.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const r = on ? easeOut(seg(s, 0.2, 0.7)) : 0;
  return (
    <Svg label="re-running the same SQL every quarter against the live tables — the same dataset?" h={220}>
      {[0, 1].map((i) => {
        const x = i === 0 ? 25 : 335;
        const k = easeOut(seg(t, i * 0.8, 0.4 + i * 0.8));
        return (
          <g key={i} opacity={k}>
            <Card x={x} y={24} w={240} l="same SQL" />
            <T x={x} y={96} s={12} f={C.secondary}>
              {i === 0 ? 'run 1' : 'run 2'}
            </T>
            <T x={x} y={124} s={14} f={i === 1 ? C.badText : C.focus}>
              {i === 0 ? '1,500 rows' : '1,400 rows'}
            </T>
            {i === 1 && (
              <T x={x} y={148} s={12} f={C.badText}>
                200 changed
              </T>
            )}
          </g>
        );
      })}
      {!on ? (
        <T x={300} y={78} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 1.6, 2.0))}>
          same?
        </T>
      ) : (
        <g opacity={r}>
          <T x={300} y={128} s={22} f={C.badText} a="middle">
            ≠
          </T>
          <T x={25} y={200} s={13} f={C.badText} w={600}>
            a stable query over unstable tables
          </T>
        </g>
      )}
    </Svg>
  );
}
