import { useEffect, useState } from 'react';
import { C, Draw, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// Zero-ETL replication, drawn from examples.py run for real on this sandbox's Postgres (wal_level = logical as the
// prerequisite gate, a 20-order full export, fraud order 21 invisible in the mirror until a pulse applies 1 change,
// order 22 and a second pulse applying 1 more) and from the FACT-CHECK's quoted AWS and Microsoft docs: the named
// sources, DynamoDB's full export then incremental replication every 15–30 minutes with PITR required, Fabric's
// mirroring into OneLake as Delta Parquet. The hook's "half an hour" is that window's worst case, 30 minutes.

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

/** A grid of `n` order cells at (x, y), 10 per row; `col(i)` picks each cell's colour, `show` how many are drawn. */
const Orders = ({ x, y, n, show = n, col }: { x: number; y: number; n: number; show?: number; col: (i: number) => string }) => (
  <g>
    {Array.from({ length: Math.min(n, show) }, (_, i) => (
      <rect key={i} x={x + (i % 10) * 15} y={y + Math.floor(i / 10) * 15} width={11} height={11} rx={1} fill={col(i)} />
    ))}
  </g>
);

// 0 · The vendor's slide: "zero ETL". Below it an hour of timeline. The team needs fraud seen in under a minute; a
// fraud order lands at minute 1, and the mirror's next pulse is the documented window's worst case, minute 30. The red
// span between them: unseen for up to half an hour.
export function Hook({ t }: StepCtx) {
  const X = (m: number) => 25 + m * 13.5;
  const span = easeInOut(seg(t, 1.4, 2.3));
  return (
    <Svg label='a vendor slide says "zero ETL." A fraud-detection team starts missing fraud for up to half an hour at a time.' h={200}>
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <rect x={25} y={14} width={190} height={56} rx={5} fill={C.panel} stroke={C.secondary} strokeWidth={1.3} />
        <T x={120} y={50} s={20} f={C.focus} a="middle">
          zero ETL
        </T>
      </g>
      <g opacity={easeOut(seg(t, 0.5, 0.8))}>
        <line x1={X(0)} y1={130} x2={X(40)} y2={130} stroke={C.line} strokeWidth={1.2} />
        {[0, 10, 20, 30, 40].map((m) => (
          <g key={m}>
            <line x1={X(m)} y1={126} x2={X(m)} y2={134} stroke={C.line} />
            <T x={X(m)} y={150} s={11} f={C.quiet} a="middle">
              {m === 0 ? '0 min' : `${m}`}
            </T>
          </g>
        ))}
        <line x1={X(0)} y1={112} x2={X(0)} y2={140} stroke={C.second} strokeWidth={2} />
      </g>
      <circle cx={X(1)} cy={130} r={5} fill={C.badText} opacity={easeOut(seg(t, 0.9, 1.1))} />
      <T x={X(1)} y={104} s={12} f={C.badText} o={easeOut(seg(t, 0.9, 1.2))}>
        fraud lands
      </T>
      <rect x={X(1)} y={124} width={(X(30) - X(1)) * span} height={12} rx={2} fill={C.badText} opacity={0.35} />
      <line x1={X(30)} y1={112} x2={X(30)} y2={140} stroke={C.second} strokeWidth={2} opacity={span >= 1 ? 1 : 0} />
      <T x={X(30)} y={104} s={12} f={C.second} a="middle" o={span >= 1 ? 1 : 0}>
        next pulse
      </T>
      <T x={575} y={36} s={12} f={C.secondary} a="end" o={easeOut(seg(t, 0.4, 0.7))}>
        needed: under a minute
      </T>
      <T x={575} y={58} s={13} f={C.badText} a="end" o={easeOut(seg(t, 2.3, 2.6))}>
        got: up to 30 minutes
      </T>
      <T x={25} y={186} s={12} f={C.secondary} o={easeOut(seg(t, 2.5, 2.9))}>
        a number nobody asked for
      </T>
    </Svg>
  );
}

// 1 · "zero = ?". After the answer the word splits into two candidates: "latency" struck, "pipeline code" ✓. Then the
// real limit lands underneath: the documented window, 15–30 minutes.
export function PredictWhatZeroMeant({ t, answer }: StepCtx) {
  const on = answer !== null;
  const s = useSinceAnswer(on);
  const sp = on ? easeOutBack(seg(s, 0.2, 0.7)) : 0;
  return (
    <Svg label="what did 'zero' actually mean, and what number was always the real limit?" h={180}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <T x={25} y={44} s={20} f={C.focus}>
          zero
        </T>
        <T x={95} y={44} s={20} f={C.focus} o={on ? 0 : 1}>
          = ?
        </T>
      </g>
      {on && (
        <g>
          <g opacity={Math.min(1, sp)}>
            <Box x={lerp(25, 200, sp)} y={18} w={150} label="latency" stroke={C.badText} f={C.secondary} />
            <Box x={lerp(25, 380, sp)} y={18} w={180} label="pipeline code" lit />
          </g>
          <Cross x={367} y={34} k={easeOut(seg(s, 0.8, 1.0))} />
          <Tick x={570} y={60} k={easeOut(seg(s, 1.0, 1.2))} />
          <g opacity={easeOut(seg(s, 1.5, 1.9))}>
            <T x={25} y={110} s={12} f={C.secondary}>
              the real limit, always
            </T>
            <rect x={25} y={124} width={550} height={30} rx={4} fill="none" stroke={C.second} strokeWidth={1.4} />
            <T x={300} y={144} s={13} f={C.second} a="middle">
              the documented window: 15–30 min
            </T>
          </g>
        </g>
      )}
    </Svg>
  );
}

// 2 · The named sources from AWS's own list arrive down the left; two targets on the right: Redshift, and Fabric's
// OneLake (mirrored as Delta Parquet). Every source's line first runs straight across, then all of them reroute
// through one box in the middle: one mechanism, log-based CDC.
export function RevealManagedCDC({ t }: StepCtx) {
  const src = ['Aurora MySQL', 'Aurora PostgreSQL', 'DynamoDB', 'RDS for MySQL', 'RDS for PostgreSQL', 'RDS for Oracle'];
  const mid = easeInOut(seg(t, 2.6, 3.3));
  return (
    <Svg label="managed CDC from operational databases straight into an analytics engine, by name." h={240}>
      {src.map((n, i) => {
        const y = 28 + i * 32;
        const o = easeOut(seg(t, 0.2 + i * 0.15, 0.5 + i * 0.15));
        const ty = i < 3 ? 52 : 160;
        const k = easeOut(seg(t, 1.6, 2.0));
        return (
          <g key={n} opacity={o}>
            <T x={25} y={y + 4} s={12} f={C.primary}>
              {n}
            </T>
            <path d={`M232 ${y} L${lerp(430, 270, mid)} ${lerp(ty, 120, mid)}`} stroke={C.line} strokeWidth={1} opacity={k} fill="none" />
          </g>
        );
      })}
      <g opacity={easeOut(seg(t, 1.5, 1.9))}>
        <Box x={430} y={36} w={145} label="Redshift" />
        <Box x={430} y={144} w={145} label="OneLake" />
        <T x={502} y={196} s={11} f={C.quiet} a="middle">
          Delta Parquet
        </T>
      </g>
      {mid > 0 && (
        <g opacity={mid}>
          <line x1={420} y1={112} x2={430} y2={52} stroke={C.second} strokeWidth={1.3} />
          <line x1={420} y1={128} x2={430} y2={160} stroke={C.second} strokeWidth={1.3} />
          <rect x={270} y={104} width={150} height={32} rx={5} fill={C.panel} stroke={C.second} strokeWidth={1.6} />
          <T x={345} y={124} s={11} f={C.second} a="middle">
            one mechanism
          </T>
        </g>
      )}
      <T x={575} y={228} s={12} f={C.focus} a="end" o={easeOut(seg(t, 3.3, 3.7))}>
        different names, one shape
      </T>
    </Svg>
  );
}

// 3 · DynamoDB's documented cadence on a timeline. Turned on: the whole table exports once, a wide block. Then the
// incremental pulses, each landing somewhere in a shaded 15–30 minute band after the last. Finally the gate in front of
// it all: point-in-time recovery must already be on.
export function RevealDynamoDBCadence({ t }: StepCtx) {
  const X = (m: number) => 160 + m * 6.5;
  const exp = easeInOut(seg(t, 0.5, 1.3));
  const band = easeOut(seg(t, 1.6, 2.1));
  const gate = easeOutBack(seg(t, 3.0, 3.5));
  return (
    <Svg label="an initial full export, then incremental replication on a fixed, documented window." h={220}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <line x1={X(0)} y1={110} x2={X(60)} y2={110} stroke={C.line} strokeWidth={1.2} />
        {[0, 15, 30, 45, 60].map((m) => (
          <g key={m}>
            <line x1={X(m)} y1={106} x2={X(m)} y2={114} stroke={C.line} />
            <T x={X(m)} y={132} s={11} f={C.quiet} a="middle">
              {`${m}`}
            </T>
          </g>
        ))}
        <T x={575} y={152} s={11} f={C.quiet} a="end">
          minutes
        </T>
      </g>
      <rect x={X(0)} y={60} width={60 * exp} height={40} rx={3} fill={C.focus} opacity={0.8} />
      <T x={X(0)} y={34} s={12} f={C.focus} o={easeOut(seg(t, 0.6, 0.9))}>
        full export, once
      </T>
      <g opacity={band}>
        <rect x={X(15)} y={70} width={X(30) - X(15)} height={36} fill={C.second} opacity={0.18} />
        <line x1={X(15)} y1={70} x2={X(15)} y2={106} stroke={C.second} strokeDasharray="3 3" />
        <line x1={X(30)} y1={70} x2={X(30)} y2={106} stroke={C.second} strokeDasharray="3 3" />
        <T x={X(22.5)} y={64} s={12} f={C.second} a="middle">
          next pulse
        </T>
      </g>
      <g opacity={easeOut(seg(t, 2.3, 2.6))}>
        <rect x={X(30)} y={80} width={X(60) - X(30)} height={26} fill={C.second} opacity={0.1} />
        <T x={X(45)} y={98} s={11} f={C.second} a="middle">
          and again
        </T>
      </g>
      <T x={575} y={186} s={12} f={C.second} a="end" o={easeOut(seg(t, 2.0, 2.4))}>
        incremental, every 15–30 min
      </T>
      <g opacity={Math.min(1, gate)}>
        <rect x={20} y={48} width={134} height={68} rx={5} fill={C.panel} stroke={C.focus} strokeWidth={1.4} />
        <T x={80} y={74} s={12} f={C.focus} a="middle">
          PITR on
        </T>
        <T x={87} y={102} s={11} f={C.secondary} a="middle">
          required first
        </T>
      </g>
      <Tick x={134} y={68} k={easeOut(seg(t, 3.5, 3.8))} />
    </Svg>
  );
}

// 4 · A sealed box labelled "zero ETL". Its fill fades and the parts inside show: a source database, its log, a
// change-data-capture reader, the target. Only the dashed border remains, now named: the vendor's managed boundary.
export function RevealWhatZeroHides({ t }: StepCtx) {
  const open = easeInOut(seg(t, 1.0, 2.0));
  const flow = seg(t, 2.2, 3.6);
  const parts = ['source', 'log', 'CDC reader', 'target'];
  return (
    <Svg label="the same log-based CDC this course already built, now running inside a vendor's managed boundary." h={180}>
      <rect x={25} y={30} width={550} height={90} rx={6} fill={C.panel} stroke={C.secondary} strokeWidth={1.3} strokeDasharray={open > 0.5 ? '5 4' : undefined} opacity={easeOut(seg(t, 0, 0.3))} />
      {parts.map((p, i) => (
        <g key={p} opacity={open}>
          <Box x={45 + i * 135} y={58} w={118} label={p} lit={i === 2} />
          {i < 3 && <line x1={163 + i * 135} y1={74} x2={180 + i * 135} y2={74} stroke={C.secondary} strokeWidth={1.3} />}
        </g>
      ))}
      {flow > 0 && flow < 1 && <circle cx={lerp(100, 505, flow)} cy={74} r={4} fill={C.second} />}
      <T x={300} y={82} s={22} f={C.focus} a="middle" o={1 - open}>
        zero ETL
      </T>
      <T x={25} y={22} s={12} f={C.secondary} o={open}>
        vendor-managed
      </T>
      <T x={300} y={160} s={12} f={C.focus} a="middle" o={easeOut(seg(t, 2.8, 3.2))}>
        log-based CDC, nothing new
      </T>
    </Svg>
  );
}

// 5 · examples.py on this sandbox's Postgres. The gate: wal_level = logical ✓. The full export copies the 20 orders to
// the mirror. Fraud order 21 lands on the source — red, and missing from the mirror. One pulse drains the slot: 1
// change applied, the mirror shows it. Order 22 arrives, a second pulse, 1 more.
export function RevealReproducingTheShape({ t }: StepCtx) {
  const exp = seg(t, 0.6, 1.4);
  const f21 = t >= 1.7;
  const p1 = t >= 2.5;
  const f22 = t >= 3.1;
  const p2 = t >= 3.6;
  const src = 20 + (f21 ? 1 : 0) + (f22 ? 1 : 0);
  const mir = Math.floor(20 * exp) + (p1 ? 1 : 0) + (p2 ? 1 : 0);
  const col = (i: number) => (i === 20 ? C.badText : i === 21 ? C.second : C.primary);
  return (
    <Svg label="the same shape, reproduced for real on this sandbox's own Postgres." h={280}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <Box x={25} y={14} w={230} label="wal_level = logical" lit />
        <Tick x={270} y={30} k={easeOut(seg(t, 0.2, 0.4))} />
      </g>
      <g opacity={easeOut(seg(t, 0.4, 0.7))}>
        <T x={25} y={82} s={12} f={C.secondary}>
          source orders
        </T>
        <Orders x={25} y={92} n={22} show={src} col={col} />
        <T x={345} y={82} s={12} f={C.secondary}>
          mirror
        </T>
        <Orders x={345} y={92} n={22} show={mir} col={col} />
        <T x={25} y={150} s={12} f={C.primary}>
          {src}
        </T>
        <T x={345} y={150} s={12} f={C.primary}>
          {mir}
        </T>
      </g>
      <T x={25} y={176} s={12} f={C.focus} o={easeOut(seg(t, 0.8, 1.1))}>
        full export: 20 orders
      </T>
      <T x={25} y={202} s={12} f={C.badText} o={easeOut(seg(t, 1.7, 2.0))}>
        order 21 lands: mirror can't see it
      </T>
      <g opacity={easeOut(seg(t, 2.3, 2.5))}>
        <circle cx={300} cy={106} r={9} fill="none" stroke={C.second} strokeWidth={1.4} />
        <path d={`M300 106 L${300 + 8 * Math.cos(t * 5)} ${106 + 8 * Math.sin(t * 5)}`} stroke={C.second} strokeWidth={1.4} />
      </g>
      <T x={25} y={228} s={12} f={C.second} o={easeOut(seg(t, 2.5, 2.8))}>
        pulse: 1 change applied
      </T>
      <T x={25} y={254} s={12} f={C.second} o={easeOut(seg(t, 3.6, 3.9))}>
        order 22, next pulse: 1 more
      </T>
      <T x={575} y={254} s={12} f={C.focus} a="end" o={easeOut(seg(t, 3.9, 4.2))}>
        as designed
      </T>
    </Svg>
  );
}

// 6 · Three things leave with the pipeline code, each with its picture: the migration date slides off the team's
// calendar onto the vendor's; the filter offers only a few of its options; the cost collapses into one line on a bill.
export function RevealThreeCosts({ t }: StepCtx) {
  const mv = easeInOut(seg(t, 0.8, 1.5));
  const fl = easeOut(seg(t, 2.0, 2.4));
  const bill = easeInOut(seg(t, 3.2, 3.8));
  return (
    <Svg label="three things a team gives up along with the pipeline code." h={260}>
      <g opacity={easeOut(seg(t, 0.4, 0.7))}>
        <T x={25} y={34} s={13} f={C.secondary}>
          schema changes
        </T>
        <T x={25} y={56} s={12} f={C.primary}>
          on the vendor's schedule
        </T>
        {[0, 1].map((j) => (
          <g key={j}>
            <rect x={360 + j * 110} y={20} width={95} height={50} rx={4} fill={C.panel} stroke={C.line} strokeWidth={1.1} />
            <T x={407 + j * 110} y={36} s={11} f={C.quiet} a="middle">
              {j === 0 ? 'yours' : "vendor's"}
            </T>
          </g>
        ))}
        <rect x={lerp(388, 498, mv)} y={46} width={40} height={14} rx={2} fill={mv > 0.5 ? C.badText : C.focus} />
      </g>
      <g opacity={easeOut(seg(t, 1.8, 2.1))}>
        <T x={25} y={116} s={13} f={C.secondary}>
          filtering
        </T>
        <T x={25} y={138} s={12} f={C.primary}>
          only what it exposes
        </T>
        {[0, 1, 2, 3, 4].map((j) => (
          <rect key={j} x={360 + j * 44} y={102} width={36} height={30} rx={3} fill={C.panel} stroke={j < 2 ? C.focus : C.line} strokeWidth={1.1} opacity={j < 2 ? 1 : 1 - 0.7 * fl} />
        ))}
      </g>
      <g opacity={easeOut(seg(t, 2.9, 3.2))}>
        <T x={25} y={196} s={13} f={C.secondary}>
          cost
        </T>
        <T x={25} y={218} s={12} f={C.primary}>
          one line on someone else's bill
        </T>
        {[0, 1, 2, 3].map((j) => (
          <rect key={j} x={360} y={lerp(176 + j * 12, 200, bill)} width={lerp(80 + j * 30, 200, bill)} height={6} rx={1} fill={bill > 0.9 ? C.badText : C.secondary} opacity={j === 0 ? 1 : 1 - bill} />
        ))}
      </g>
    </Svg>
  );
}

// 7 · Four lines with their pictures: "zero" crossing from latency to code, the CDC chain inside a dashed boundary, the
// 15–30 minute band, and the three given-up controls dimming.
export function Recap({ t }: StepCtx) {
  const L: [string, string][] = [
    ['zero', 'zero pipeline code, not latency'],
    ['underneath', 'log-based CDC, managed elsewhere'],
    ['the real limit', 'the documented window'],
    ['given up', 'schema timing, filtering, cost'],
  ];
  const k = (i: number) => easeOut(seg(t, 0.3 + i * 0.9, 0.7 + i * 0.9));
  return (
    <Svg label="zero-ETL is managed log-based CDC. The code is gone; the mechanism and its limits are not." h={300}>
      {L.map(([a, b], i) => (
        <g key={a} opacity={k(i)}>
          <T x={25} y={40 + i * 70} s={13} f={C.secondary}>
            {a}
          </T>
          <T x={25} y={62 + i * 70} s={13} f={C.primary}>
            {b}
          </T>
        </g>
      ))}
      <g opacity={k(0)}>
        <rect x={470} y={30} width={100} height={30} rx={4} fill={C.panel} stroke={C.focus} />
        <T x={520} y={50} s={12} f={C.focus} a="middle">
          code: 0
        </T>
      </g>
      <g opacity={k(1)}>
        <rect x={460} y={92} width={115} height={36} rx={4} fill="none" stroke={C.secondary} strokeDasharray="4 3" />
        {[0, 1, 2].map((j) => (
          <rect key={j} x={470 + j * 34} y={102} width={24} height={16} rx={2} fill={C.panel} stroke={j === 1 ? C.focus : C.line} />
        ))}
      </g>
      <g opacity={k(2)}>
        <line x1={460} y1={186} x2={575} y2={186} stroke={C.line} />
        <rect x={490} y={172} width={60} height={28} fill={C.second} opacity={0.25} />
      </g>
      <g opacity={k(3)}>
        {[0, 1, 2].map((j) => (
          <rect key={j} x={470 + j * 36} y={244} width={28} height={20} rx={2} fill={C.panel} stroke={C.line} opacity={1 - 0.6 * easeOut(seg(t, 3.4, 3.9))} />
        ))}
      </g>
    </Svg>
  );
}

// 8 · A minute scale. The documented window is the band from 15 to 30; the team's requirement a line at 20. "Reliably?"
// After the answer the part of the band past 20 turns red: the worst case, 30, misses. ✕ not reliably.
export function ProveIt({ t, answer }: StepCtx) {
  const on = answer !== null;
  const s = useSinceAnswer(on);
  const X = (m: number) => 40 + m * 15;
  const red = on ? easeInOut(seg(s, 0.3, 1.0)) : 0;
  return (
    <Svg label="a twenty-minute requirement, a fifteen-to-thirty-minute documented window." h={200}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <line x1={X(0)} y1={120} x2={X(35)} y2={120} stroke={C.line} strokeWidth={1.2} />
        {[0, 10, 15, 20, 30].map((m) => (
          <g key={m}>
            <line x1={X(m)} y1={116} x2={X(m)} y2={124} stroke={C.line} />
            <T x={X(m)} y={142} s={11} f={C.quiet} a="middle">
              {`${m}`}
            </T>
          </g>
        ))}
        <T x={X(35)} y={142} s={11} f={C.quiet} a="end">
          min
        </T>
      </g>
      <g opacity={easeOut(seg(t, 0.4, 0.8))}>
        <rect x={X(15)} y={90} width={X(30) - X(15)} height={26} fill={C.second} opacity={0.3} />
        <T x={X(20) + 8} y={82} s={12} f={C.second}>
          documented window
        </T>
      </g>
      <rect x={X(20)} y={90} width={(X(30) - X(20)) * red} height={26} fill={C.badText} opacity={0.55} />
      <g opacity={easeOut(seg(t, 0.9, 1.3))}>
        <line x1={X(20)} y1={60} x2={X(20)} y2={124} stroke={C.focus} strokeWidth={2} />
        <T x={X(20) - 6} y={56} s={12} f={C.focus} a="end">
          requirement
        </T>
      </g>
      <T x={575} y={180} s={13} f={C.focus} a="end" o={on ? 0 : easeOut(seg(t, 1.5, 1.9))}>
        reliably?
      </T>
      {on && (
        <g>
          <T x={X(30)} y={168} s={12} f={C.badText} a="middle" o={easeOut(seg(s, 0.9, 1.2))}>
            worst case
          </T>
          <Cross x={X(30) + 70} y={175} k={easeOut(seg(s, 1.3, 1.5))} />
          <T x={575} y={194} s={12} f={C.badText} a="end" o={easeOut(seg(s, 1.4, 1.8))}>
            not reliably
          </T>
        </g>
      )}
    </Svg>
  );
}
