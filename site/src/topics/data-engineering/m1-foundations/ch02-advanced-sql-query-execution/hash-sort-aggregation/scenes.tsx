import { useEffect, useState } from 'react';
import { Bar, C, Plot, Svg, T } from '../../../../../reels/kit';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';

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

/** A number counted up to its final value, with fixed decimals and thousands separators. */
function num(v: number, d = 0) {
  return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}

/** A label-left / value-right row, stacked vertically with generous gaps (DESIGN.md, phone text scaling).
 * `k` fades it in and slides it up a little; the value is whatever string the scene passes (a count in progress). */
function Row({ y, label, value, valueColor = C.crema, big = false, k = 1 }: { y: number; label: string; value: string; valueColor?: string; big?: boolean; k?: number }) {
  return (
    <g opacity={k} transform={`translate(0 ${((1 - k) * 10).toFixed(2)})`}>
      <T x={25} y={y} s={15} f={C.latte}>
        {label}
      </T>
      <T x={575} y={y} s={big ? 22 : 17} f={valueColor} a="end" w={600}>
        {value}
      </T>
    </g>
  );
}

/** A verdict tick at the right edge, drawn in by `k`. */
function Tick({ y, k, f = C.focus }: { y: number; k: number; f?: string }) {
  return <path d={`M540 ${y} l8 8 l16 -18`} fill="none" stroke={f} strokeWidth={3} strokeDasharray="40" strokeDashoffset={40 * (1 - k)} />;
}

/** A time bar that grows to its share over `k`; its figure fades in once the bar is most of the way there. */
function timeBar(x: number, y: number, frac: number, display: string, label: string, fill: string, k: number) {
  return (
    <g key={label} opacity={k > 0 ? 1 : 0}>
      <T x={x} y={y - 20} s={13} f={C.latte} o={clamp(k * 3, 0, 1)}>
        {label}
      </T>
      <Bar x={x} y={y} w={340 * frac * k} h={20} full={340} fill={fill} />
      <T x={x} y={y + 38} s={13} f={C.crema} o={seg(k, 0.6, 1)}>
        {display}
      </T>
    </g>
  );
}

/** Two timed rows that count up, each with a bar under it scaled to the slower one. */
function TwoTimes({ t, rows, max }: { t: number; rows: [string, number, number, string][]; max: number }) {
  return (
    <g>
      {rows.map(([label, ms, d, color], i) => {
        const k = easeOut(seg(t, 0.2 + i * 1.1, 0.8 + i * 1.1));
        const c = easeOut(seg(t, 0.3 + i * 1.1, 1.3 + i * 1.1));
        const y = 60 + i * 60;
        return (
          <g key={label}>
            <Row y={y} label={label} value={`${num(ms * c, d)} ms`} valueColor={color} big k={k} />
            <rect x={25} y={y + 14} width={k > 0 ? Math.max(3, 550 * (ms / max) * c) : 0} height={6} rx={3} fill={color} opacity={0.8} />
          </g>
        );
      })}
    </g>
  );
}

const GC = [C.crema, C.focus, C.second];
const GL = ['A', 'B', 'C'];

// 1 · Two aggregates. The two verdicts slide in one after the other; the line under them says nothing else moved.
export function TwoAggregates({ t }: StepCtx) {
  const q = easeOut(seg(t, 2.6, 3.2));
  return (
    <Svg label="100 groups, hash wins; 1,500,000 groups, hash is not the faster plan" h={220}>
      <Row y={70} label="100 groups" value="HashAggregate wins" valueColor={C.focus} k={easeOut(seg(t, 0.2, 0.8))} />
      <Row y={130} label="1,500,000 groups" value="not HashAggregate" valueColor={C.cherryText} k={easeOut(seg(t, 1.3, 1.9))} />
      <T x={300} y={185} s={15} f={C.latte} a="middle" o={q}>
        same table, same row count, same shape of query
      </T>
    </Svg>
  );
}

// 2 · Predict: few groups. Both counts count up; after the answer the verdict slides in.
export function PredictLowCard({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const v = answered ? easeOut(seg(s, 0.1, 0.6)) : 0;
  return (
    <Svg label="100 distinct groups out of 2,000,000 rows" h={210}>
      <Row y={70} label="distinct groups" value={num(100 * easeOut(seg(t, 0.2, 0.9)))} k={easeOut(seg(t, 0.1, 0.6))} />
      <Row y={130} label="total rows" value={num(2000000 * easeOut(seg(t, 0.5, 1.3)))} k={easeOut(seg(t, 0.4, 0.9))} />
      {answered && (
        <T x={300} y={lerp(192, 184, v)} s={15} f={C.focus} a="middle" o={v}>
          a tiny table: one slot per group
        </T>
      )}
    </Svg>
  );
}

// 3 · Reveal: few groups. The hash time counts up short; the forced sort counts up past twice as long.
export function RevealLowCard({ t }: StepCtx) {
  const q = easeOut(seg(t, 2.8, 3.4));
  return (
    <Svg label="558.673ms hash vs 1174.777ms forced sort" h={240}>
      <TwoTimes
        t={t}
        max={1174.777}
        rows={[
          ['default: HashAggregate', 558.673, 3, C.focus],
          ['forced: sort, then group', 1174.777, 3, C.cherryText],
        ]}
      />
      <T x={300} y={185} s={15} f={C.latte} a="middle" o={q}>
        about 2.1× slower, same table, same data
      </T>
    </Svg>
  );
}

const ROWS_G = [0, 1, 0, 2, 1, 0, 2, 0, 1, 2, 0, 1];
// 4 · Hash aggregate. A column of rows streams once into a three-slot table; each row drops straight into its
// group's slot and that slot's count ticks up.
export function HashAggMechanism({ t }: StepCtx) {
  const head = easeOut(seg(t, 0, 0.4));
  const k = (i: number) => easeInOut(seg(t, 0.4 + i * 0.18, 0.75 + i * 0.18));
  const one = easeOut(seg(t, 1.0, 1.5));
  const cost = easeOut(seg(t, 2.9, 3.5));
  const sy = (g: number) => 64 + g * 46;
  const counts = [0, 0, 0];
  ROWS_G.forEach((g, i) => {
    if (k(i) >= 1) counts[g]++;
  });
  return (
    <Svg label="one hash table entry per distinct group" h={300}>
      <T x={300} y={28} s={16} f={C.crema} a="middle" o={head}>
        one scan, one hash table —
      </T>
      {[0, 1, 2].map((g) => (
        <g key={g} opacity={head}>
          <rect x={380} y={sy(g)} width={170} height={32} rx={4} fill={C.cocoa} stroke={C.mocha} />
          <rect x={390} y={sy(g) + 9} width={14} height={14} rx={2} fill={GC[g]} />
          <T x={415} y={sy(g) + 21} s={13} f={C.latte}>
            group {GL[g]}
          </T>
          <T x={540} y={sy(g) + 21} s={14} f={C.crema} a="end" w={700}>
            {counts[g]}
          </T>
        </g>
      ))}
      {ROWS_G.map((g, i) => {
        const kk = k(i);
        if (kk >= 1) return null;
        const x = lerp(40, 390, kk);
        const y = lerp(52 + i * 13, sy(g) + 9, kk);
        return <rect key={i} x={x} y={y} width={lerp(60, 14, kk)} height={lerp(10, 14, kk)} rx={2} fill={GC[g]} opacity={head} />;
      })}
      <T x={300} y={232} s={15} f={C.latte} a="middle" o={one}>
        one entry per distinct group
      </T>
      <T x={300} y={260} s={15} f={C.focus} a="middle" o={cost}>
        cost scales with group count,
      </T>
      <T x={300} y={283} s={15} f={C.focus} a="middle" o={cost}>
        not with row count
      </T>
    </Svg>
  );
}

const UNSORTED = [1, 0, 2, 0, 1, 0, 2, 0, 1, 2, 0, 1];
// 5 · Sort aggregate. Every row moves to its sorted place first; then a cursor walks the sorted run and closes each
// group with a bracket the moment the key changes.
export function SortAggMechanism({ t }: StepCtx) {
  const head = easeOut(seg(t, 0, 0.4));
  const sort = easeInOut(seg(t, 0.4, 1.4));
  const walk = seg(t, 1.6, 3.0);
  const sub = easeOut(seg(t, 1.6, 2.1));
  const cav = easeOut(seg(t, 3.0, 3.6));
  const order = UNSORTED.map((g, i) => [g, i] as [number, number]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const target = new Array(UNSORTED.length).fill(0);
  order.forEach(([, i], pos) => (target[i] = pos));
  const cx = (p: number) => 30 + p * 45;
  const bounds: [number, number, number][] = [];
  order.forEach(([g], p) => {
    const last = bounds[bounds.length - 1];
    if (last && last[0] === g) last[2] = p;
    else bounds.push([g, p, p]);
  });
  const cur = walk * UNSORTED.length;
  return (
    <Svg label="sort rows on the group key, then walk the sorted stream" h={290}>
      <T x={300} y={28} s={16} f={C.crema} a="middle" o={head}>
        sort every row on the group key —
      </T>
      {UNSORTED.map((g, i) => {
        const x = lerp(cx(i), cx(target[i]), sort);
        const moving = sort > 0 && sort < 1;
        return (
          <g key={i} opacity={head}>
            <rect x={x} y={60} width={38} height={26} rx={3} fill={C.cocoa} stroke={GC[g]} strokeWidth={1.5} />
            {!moving && (
              <T x={x + 19} y={78} s={13} f={GC[g]} a="middle">
                {GL[g]}
              </T>
            )}
          </g>
        );
      })}
      {walk > 0 && walk < 1 && <path d={`M${cx(Math.min(cur, 11.99)) + 19} 96 l-6 10 h12 z`} fill={C.focus} />}
      {bounds.map(([g, a, b]) => {
        const k = easeOut(seg(cur, b + 0.2, b + 1));
        if (k <= 0) return null;
        const x0 = cx(a),
          x1 = cx(b) + 38;
        return (
          <g key={g}>
            <path d={`M${x0} 112 v6 h${(x1 - x0) * k} v${k >= 1 ? -6 : 0}`} fill="none" stroke={GC[g]} strokeWidth={1.5} />
            <T x={(x0 + x1) / 2} y={138} s={13} f={GC[g]} a="middle" o={k}>
              {GL[g]}: {b - a + 1}
            </T>
          </g>
        );
      })}
      <T x={300} y={185} s={15} f={C.latte} a="middle" o={sub}>
        then walk the sorted stream
      </T>
      <T x={300} y={240} s={15} f={C.latte} a="middle" o={cav}>
        no hash table — but the sort
      </T>
      <T x={300} y={263} s={15} f={C.latte} a="middle" o={cav}>
        gets paid for no matter the group count
      </T>
    </Svg>
  );
}

// 6 · Predict: many groups. The group count climbs almost to the row count; after the answer the verdict slides in.
export function PredictHighCard({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const v = answered ? easeOut(seg(s, 0.1, 0.6)) : 0;
  return (
    <Svg label="1,500,000 distinct groups out of 2,000,000 rows" h={210}>
      <Row y={70} label="distinct groups" value={num(1500000 * easeOut(seg(t, 0.2, 1.2)))} valueColor={C.cherryText} k={easeOut(seg(t, 0.1, 0.6))} />
      <Row y={130} label="total rows" value="2,000,000" k={easeOut(seg(t, 0.4, 0.9))} />
      {answered && (
        <T x={300} y={lerp(192, 184, v)} s={15} f={C.cherryText} a="middle" o={v}>
          the table overflows; the sort costs the same
        </T>
      )}
    </Svg>
  );
}

// 7 · Reveal: many groups. The spilling hash bar grows the whole width, its partitions note arrives, then the sort bar stops short.
export function RevealHighCard({ t }: StepCtx) {
  const maxMs = 2479.537;
  const a = easeOut(seg(t, 0.2, 1.1));
  const b = easeOut(seg(t, 1.4, 2.3));
  const q = easeOut(seg(t, 2.8, 3.4));
  return (
    <Svg label="2479.537ms spilling hash (64 partitions, 321 batches) vs 1737.653ms forced sort" h={340}>
      {timeBar(130, 60, maxMs / maxMs, '2479.537 ms', 'HashAggregate (default, spills)', C.cherryText, a)}
      <T x={130} y={118} s={13} f={C.cherryText} o={easeOut(seg(t, 1.0, 1.4))}>
        64 partitions, 321 batches
      </T>
      {timeBar(130, 180, 1737.653 / maxMs, '1737.653 ms', 'GroupAggregate (forced)', C.focus, b)}
      <T x={300} y={300} s={14} f={C.latte} a="middle" o={q}>
        sort wins here — about 1.43× faster,
      </T>
      <T x={300} y={322} s={14} f={C.latte} a="middle" o={q}>
        the opposite of the 100-group case
      </T>
    </Svg>
  );
}

// 8 · Crossover. The two cost rows slide in; then a sketch: the sort line stays flat as groups grow, the hash line
// climbs through it, and the crossing is marked.
export function CrossoverMechanism({ t }: StepCtx) {
  const sortL = easeInOut(seg(t, 1.2, 2.0));
  const hashL = easeInOut(seg(t, 1.8, 2.8));
  const cross = easeOutBack(seg(t, 2.6, 3.0));
  const q = easeOut(seg(t, 3.0, 3.6));
  const hy = (x: number) => 225 - ((x - 60) / 480) * 90;
  return (
    <Svg label="sort tracks rows; hash tracks groups under memory pressure" h={300}>
      <Row y={50} label="sort-based cost" value="tracks rows (fixed)" valueColor={C.latte} k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={100} label="hash-based cost" value="tracks groups ÷ memory" valueColor={C.cherryText} k={easeOut(seg(t, 0.6, 1.1))} />
      <line x1={60} y1={235} x2={60 + 480 * sortL} y2={235} stroke={C.mocha} opacity={sortL > 0 ? 1 : 0} />
      <line x1={60} y1={180} x2={60 + 480 * sortL} y2={180} stroke={C.latte} strokeWidth={2} />
      <line x1={60} y1={hy(60)} x2={60 + 480 * hashL} y2={hy(60 + 480 * hashL)} stroke={C.cherryText} strokeWidth={2} />
      <T x={540} y={172} s={12} f={C.latte} a="end" o={sortL}>
        sort
      </T>
      <T x={540} y={127} s={12} f={C.cherryText} a="end" o={hashL >= 1 ? 1 : 0}>
        hash
      </T>
      <circle cx={60 + ((225 - 180) / 90) * 480} cy={180} r={6 * Math.max(0, cross)} fill="none" stroke={C.focus} strokeWidth={2} />
      <T x={300} y={275} s={15} f={C.latte} a="middle" o={q}>
        more groups: hash keeps paying, sort doesn't
      </T>
    </Svg>
  );
}

// 9 · Parallel aggregate. Two workers each fill a partial table; both feed the leader's Finalize box,
// and the measured time counts up.
export function ParallelAggMechanism({ t }: StepCtx) {
  const w = easeOut(seg(t, 0.2, 0.7));
  const p = (i: number) => easeOut(seg(t, 0.6 + i * 0.3, 1.4 + i * 0.3));
  const lead = easeOut(seg(t, 1.6, 2.0));
  const m = easeInOut(seg(t, 1.9, 2.5));
  const cap = easeOut(seg(t, 2.2, 2.7));
  const r = easeOut(seg(t, 2.7, 3.2));
  const c = easeOut(seg(t, 2.8, 3.8));
  const bars = [
    [36, 22, 30],
    [28, 34, 18],
  ];
  return (
    <Svg label="2 workers, partial aggregates merged by a finalize step" h={230}>
      {[0, 1].map((i) => (
        <g key={i} opacity={w}>
          <rect x={25} y={40 + i * 54} width={130} height={36} rx={4} fill={C.cocoa} stroke={C.mocha} />
          <T x={90} y={63 + i * 54} s={13} f={C.latte} a="middle">
            worker {i + 1}
          </T>
          {bars[i].map((b, j) => (
            <rect key={j} x={175} y={44 + i * 54 + j * 10} width={b * 2 * p(i)} height={7} rx={2} fill={C.primary} />
          ))}
          <line x1={255} y1={58 + i * 54} x2={lerp(255, 405, m)} y2={lerp(58 + i * 54, 85, m)} stroke={C.focus} strokeWidth={1.5} opacity={m > 0 ? 1 : 0} />
        </g>
      ))}
      <g opacity={lead}>
        <rect x={405} y={64} width={150} height={42} rx={6} fill={C.cocoa} stroke={m >= 1 ? C.focus : C.mocha} strokeWidth={m >= 1 ? 2 : 1} />
        <T x={480} y={90} s={13} f={C.crema} a="middle">
          Finalize
        </T>
      </g>
      <T x={300} y={150} s={14} f={C.latte} a="middle" o={cap}>
        leader merges both partials
      </T>
      <Row y={200} label="2 workers, 100 groups" value={`${num(260.757 * c, 3)} ms`} valueColor={C.focus} big k={r} />
    </Svg>
  );
}

// 10 · Predict: DISTINCT. Both facts slide in; after the answer the verdict slides in.
export function PredictDistinct({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const v = answered ? easeOut(seg(s, 0.1, 0.6)) : 0;
  return (
    <Svg label="COUNT(DISTINCT low_card), no parallel workers" h={210}>
      <Row y={70} label="aggregate" value="COUNT(DISTINCT ...)" k={easeOut(seg(t, 0.1, 0.6))} />
      <Row y={130} label="parallel aggregation" value="not supported" valueColor={C.cherryText} k={easeOut(seg(t, 0.5, 1.0))} />
      {answered && (
        <T x={300} y={lerp(192, 184, v)} s={15} f={C.focus} a="middle" o={v}>
          a sort drops duplicates for free
        </T>
      )}
    </Svg>
  );
}

// 11 · Reveal: DISTINCT. The plan shape and the time arrive; the plan chain draws as Sort then Aggregate.
export function RevealDistinct({ t }: StepCtx) {
  const q = easeOut(seg(t, 2.6, 3.2));
  const c = easeOut(seg(t, 0.9, 1.9));
  return (
    <Svg label="a plain Aggregate over a Sort, 651.016ms" h={220}>
      <Row y={60} label="plan shape" value="Sort, then Aggregate" valueColor={C.focus} k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={120} label="execution time" value={`${num(651.016 * c, 3)} ms`} valueColor={C.crema} big k={easeOut(seg(t, 0.8, 1.3))} />
      <rect x={25} y={134} width={550 * c} height={4} rx={2} fill={C.crema} opacity={0.5} />
      <T x={300} y={180} s={15} f={C.latte} a="middle" o={q}>
        no hash table anywhere in this plan
      </T>
    </Svg>
  );
}

const DUP = [0, 1, 0, 2, 1, 0];
// 12 · DISTINCT mechanism. Six values sort so equal ones sit together; the repeats slide onto the first of
// their run and vanish; what is left is counted.
export function DistinctMechanism({ t }: StepCtx) {
  const head = easeOut(seg(t, 0, 0.4));
  const sub = easeOut(seg(t, 0.5, 0.9));
  const sort = easeInOut(seg(t, 1.0, 1.8));
  const col = easeInOut(seg(t, 2.0, 2.6));
  const cnt = easeOutBack(seg(t, 2.6, 3.0));
  const cav = easeOut(seg(t, 3.0, 3.6));
  const order = DUP.map((g, i) => [g, i] as [number, number]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const pos = new Array(DUP.length).fill(0);
  order.forEach(([, i], p) => (pos[i] = p));
  const first = [0, 1, 2].map((g) => order.findIndex(([h]) => h === g));
  const cx = (p: number) => 120 + p * 62;
  return (
    <Svg label="DISTINCT needs rows deduplicated before the aggregate runs" h={250}>
      <T x={300} y={28} s={16} f={C.crema} a="middle" o={head}>
        DISTINCT needs rows deduplicated —
      </T>
      <T x={300} y={52} s={15} f={C.latte} a="middle" o={sub}>
        before the aggregate runs at all
      </T>
      {DUP.map((g, i) => {
        const p = pos[i];
        const dup = p !== first[g];
        const sx = lerp(cx(i), cx(p), sort);
        const x = dup ? lerp(sx, cx(first[g]), col) : sx;
        const o = dup ? 1 - col : 1;
        const still = (sort === 0 || sort >= 1) && (col === 0 || !dup);
        return (
          <g key={i} opacity={head * o}>
            <rect x={x} y={76} width={50} height={26} rx={3} fill={C.cocoa} stroke={GC[g]} strokeWidth={1.5} />
            {still && (
              <T x={x + 25} y={94} s={13} f={GC[g]} a="middle">
                {GL[g]}
              </T>
            )}
          </g>
        );
      })}
      <g opacity={clamp(cnt, 0, 1)} transform={`translate(300 140) scale(${Math.max(0, cnt)}) translate(-300 -140)`}>
        <T x={300} y={145} s={16} f={C.focus} a="middle" w={700}>
          count = 3
        </T>
      </g>
      <T x={300} y={200} s={15} f={C.latte} a="middle" o={cav}>
        sorting does that for free —
      </T>
      <T x={300} y={223} s={15} f={C.latte} a="middle" o={cav}>
        the same role work_mem assigns sorts
      </T>
    </Svg>
  );
}

// 13 · Recap. Each question arrives as a pair of lines, rising in, with a short rule drawn after each pair.
export function Recap({ t }: StepCtx) {
  const lines = ['how many groups, relative', 'to how many rows?', 'is the query running', 'in parallel at all?', 'does any aggregate carry', 'a DISTINCT?'];
  return (
    <Svg label="three questions before trusting an aggregate plan" h={270}>
      {lines.map((line, i) => {
        const k = easeOut(seg(t, 0.2 + i * 0.45, 0.7 + i * 0.45));
        return (
          <T key={i} x={300} y={40 + i * 36 + Math.floor(i / 2) * 6 + (1 - k) * 8} s={15} f={i % 2 === 0 ? C.crema : C.latte} a="middle" o={k}>
            {line}
          </T>
        );
      })}
      {[0, 1].map((j) => {
        const r = easeInOut(seg(t, 1.1 + j * 0.9, 1.6 + j * 0.9));
        const y = 40 + (2 * j + 1) * 36 + j * 6 + 14;
        return <rect key={j} x={300 - 40 * r} y={y} width={80 * r} height={1.5} fill={C.mocha} />;
      })}
    </Svg>
  );
}

// 14 · Prove: few groups. The two counts slide in; after the answer the verdict slides in with rule and tick.
export function ProveLowCard({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const k = answered ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const tick = answered ? easeOut(seg(s, 0.6, 1.0)) : 0;
  return (
    <Svg label="10,000,000 rows, 20 distinct groups" h={220}>
      <Row y={70} label="total rows" value="10,000,000" k={easeOut(seg(t, 0.1, 0.6))} />
      <Row y={130} label="distinct groups" value="20" k={easeOut(seg(t, 0.4, 0.9))} />
      {answered && (
        <>
          <T x={300} y={lerp(192, 180, k)} s={16} f={C.focus} a="middle" o={k}>
            tiny hash table, no matter the row count
          </T>
          <rect x={120} y={192} width={360 * tick} height={3} fill={C.focus} />
        </>
      )}
    </Svg>
  );
}

// 15 · Prove: batches. The batch count counts up to 9; after the answer the verdict slides in with rule and tick.
export function ProveBatches({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const k = answered ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const tick = answered ? easeOut(seg(s, 0.6, 1.0)) : 0;
  return (
    <Svg label="HashAggregate reports 9 batches" h={220}>
      <Row y={70} label="HashAggregate batches" value={num(Math.max(1, 9 * easeOut(seg(t, 0.1, 0.8))))} k={easeOut(seg(t, 0.1, 0.5))} />
      <Row y={130} label="hash table fit in memory?" value="no" valueColor={C.cherryText} k={easeOut(seg(t, 0.5, 1.0))} />
      {answered && (
        <>
          <T x={300} y={lerp(192, 180, k)} s={15} f={C.focus} a="middle" o={k}>
            more than 1 batch = spilled to disk
          </T>
          <rect x={140} y={192} width={320 * tick} height={3} fill={C.focus} />
          <Tick y={165} k={tick} />
        </>
      )}
    </Svg>
  );
}
