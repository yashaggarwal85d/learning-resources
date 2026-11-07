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

// 1 · Two queries. Both times count up with a bar each; the gap between the bars is the hook.
export function TwoQueries({ t }: StepCtx) {
  const q = easeOut(seg(t, 2.8, 3.4));
  return (
    <Svg label="9.681ms vs 383.6ms, same two tables" h={220}>
      <TwoTimes
        t={t}
        max={383.6}
        rows={[
          ["one customer's orders", 9.681, 3, C.focus],
          ['every order, every customer', 383.6, 1, C.focus],
        ]}
      />
      <T x={300} y={190} s={15} f={C.latte} a="middle" o={q}>
        same two tables, different algorithms
      </T>
    </Svg>
  );
}

// 2 · Predict: one row against a big indexed table. After the answer the single row reaches through the index once.
export function PredictFiltered({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const v = answered ? easeOut(seg(s, 0.1, 0.6)) : 0;
  return (
    <Svg label="1 of 100,000 customers, orders2 indexed on customer_id" h={210}>
      <Row y={70} label="customers matching the filter" value="1 of 100,000" k={easeOut(seg(t, 0.1, 0.6))} />
      <Row y={130} label="orders2.customer_id" value="indexed" valueColor={C.focus} k={easeOut(seg(t, 0.5, 1.0))} />
      {answered && (
        <T x={300} y={lerp(192, 184, v)} s={15} f={C.focus} a="middle" o={v}>
          one row → one index lookup
        </T>
      )}
    </Svg>
  );
}

// 3 · Reveal: the filtered join. The planner's time counts up short; the forced hash join counts up long.
export function RevealFiltered({ t }: StepCtx) {
  const q = easeOut(seg(t, 2.8, 3.4));
  return (
    <Svg label="9.681ms nested loop vs 141.187ms forced hash join" h={240}>
      <TwoTimes
        t={t}
        max={141.187}
        rows={[
          ['default: Nested Loop', 9.681, 3, C.focus],
          ['forced: Hash Join', 141.187, 3, C.cherryText],
        ]}
      />
      <T x={300} y={185} s={15} f={C.latte} a="middle" o={q}>
        about 14.6× slower, same query, same data
      </T>
    </Svg>
  );
}

const INNER = 8;
// 4 · Nested loop. Each outer row in turn sends a scan sweeping the whole inner table; then the index
// replaces each sweep with one direct line to the matching inner row.
export function NestedLoopMechanism({ t }: StepCtx) {
  const head = easeOut(seg(t, 0, 0.4));
  const sweepT = seg(t, 0.4, 2.2) * 3;
  const j = Math.min(2, Math.floor(sweepT));
  const p = sweepT >= 3 ? 1 : sweepT - j;
  const sweeping = t > 0.4 && t < 2.2;
  const sweepK = easeOut(seg(t, 1.0, 1.5));
  const hits = [1, 4, 6];
  const look = (i: number) => easeInOut(seg(t, 2.4 + i * 0.4, 2.8 + i * 0.4));
  const idx = easeOut(seg(t, 2.4, 2.9));
  const iy = (r: number) => 52 + r * 20;
  return (
    <Svg label="nested loop: outer drives an inner index lookup, once per row" h={300}>
      <T x={300} y={28} s={16} f={C.crema} a="middle" o={head}>
        for each outer row —
      </T>
      {[0, 1, 2].map((i) => {
        const on = (sweeping && j === i) || (t >= 2.4 && look(i) > 0 && look(i) < 1);
        return (
          <g key={i} opacity={head}>
            <rect x={60} y={70 + i * 44} width={120} height={28} rx={4} fill={C.cocoa} stroke={on ? C.focus : C.mocha} strokeWidth={on ? 2 : 1} />
            <T x={120} y={89 + i * 44} s={13} f={C.latte} a="middle">
              outer {i + 1}
            </T>
          </g>
        );
      })}
      {Array.from({ length: INNER }, (_, r) => {
        const hit = t >= 2.4 && hits.some((h, i) => h === r && look(i) >= 1);
        return <rect key={r} x={380} y={iy(r)} width={150} height={16} rx={2} fill={hit ? C.focus : C.cocoa} stroke={C.mocha} opacity={head} />;
      })}
      {sweeping && (
        <>
          <line x1={180} y1={84 + j * 44} x2={380} y2={iy(p * (INNER - 1)) + 8} stroke={C.cherryText} strokeWidth={1.5} />
          <rect x={376} y={iy(p * (INNER - 1)) - 2} width={158} height={20} rx={3} fill="none" stroke={C.cherryText} strokeWidth={2} />
        </>
      )}
      {[0, 1, 2].map((i) => {
        const k = look(i);
        if (k <= 0) return null;
        const x1 = 180,
          y1 = 84 + i * 44,
          x2 = 380,
          y2 = iy(hits[i]) + 8;
        return <line key={i} x1={x1} y1={y1} x2={lerp(x1, x2, k)} y2={lerp(y1, y2, k)} stroke={C.focus} strokeWidth={2} />;
      })}
      <T x={300} y={232} s={15} f={C.latte} a="middle" o={sweepK}>
        run the inner scan again
      </T>
      <T x={300} y={260} s={15} f={C.focus} a="middle" o={idx}>
        an index on the inner side
      </T>
      <T x={300} y={283} s={15} f={C.focus} a="middle" o={idx}>
        turns that into one lookup
      </T>
    </Svg>
  );
}

// 5 · Hash join. The build rows fly into their buckets; then each probe row lights its bucket with one line.
const BUILD = [0, 2, 1, 3, 0];
const PROBE = [1, 3, 0, 2, 0];
export function HashJoinMechanism({ t }: StepCtx) {
  const head = easeOut(seg(t, 0, 0.4));
  const tbl = easeOut(seg(t, 0.2, 0.6));
  const probeHead = easeOut(seg(t, 1.7, 2.1));
  const cav = easeOut(seg(t, 3.0, 3.6));
  const by = (i: number) => 60 + i * 28;
  const ky = (b: number) => 64 + b * 34;
  const counts = [0, 0, 0, 0];
  const slot = BUILD.map((b) => counts[b]++);
  return (
    <Svg label="hash join: build a hash table on one side, probe with the other" h={300}>
      <T x={300} y={28} s={16} f={C.crema} a="middle" o={head}>
        build: one side → hash table
      </T>
      {[0, 1, 2, 3].map((b) => (
        <rect key={b} x={250} y={ky(b)} width={100} height={26} rx={4} fill={C.cocoa} stroke={C.mocha} opacity={tbl} />
      ))}
      {BUILD.map((b, i) => {
        const k = easeInOut(seg(t, 0.5 + i * 0.2, 1.0 + i * 0.2));
        const x = lerp(30, 256 + slot[i] * 22, k);
        const y = lerp(by(i), ky(b) + 5, k);
        const w = lerp(80, 18, k);
        const h = lerp(20, 16, k);
        return <rect key={i} x={x} y={y} width={w} height={h} rx={3} fill={C.primary} opacity={head} />;
      })}
      {PROBE.map((b, i) => {
        const k = easeOut(seg(t, 1.9 + i * 0.2, 2.3 + i * 0.2));
        const lit = k > 0 && k < 1;
        return (
          <g key={i} opacity={probeHead}>
            <rect x={470} y={by(i)} width={80} height={20} rx={3} fill={C.cocoa} stroke={lit ? C.focus : C.mocha} strokeWidth={lit ? 2 : 1} />
            {k > 0 && <line x1={470} y1={by(i) + 10} x2={lerp(470, 350, k)} y2={lerp(by(i) + 10, ky(b) + 13, k)} stroke={C.focus} strokeWidth={1.5} opacity={lit ? 1 : 0.5} />}
          </g>
        );
      })}
      <T x={300} y={228} s={15} f={C.latte} a="middle" o={probeHead}>
        probe: scan the other side once
      </T>
      <T x={300} y={258} s={15} f={C.latte} a="middle" o={cav}>
        needs an equality condition,
      </T>
      <T x={300} y={281} s={15} f={C.latte} a="middle" o={cav}>
        and the table has to fit (work_mem)
      </T>
    </Svg>
  );
}

// 6 · Predict: no filter. After the answer the verdict slides in.
export function PredictFull({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const v = answered ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const c = easeOut(seg(t, 0.2, 1.1));
  return (
    <Svg label="every row of orders2, no filter" h={210}>
      <Row y={70} label="orders2 rows joined" value={num(2000000 * c)} k={easeOut(seg(t, 0.1, 0.6))} />
      <Row y={130} label="filter applied" value="none" valueColor={C.cherryText} k={easeOut(seg(t, 0.6, 1.1))} />
      {answered && (
        <T x={300} y={lerp(192, 184, v)} s={15} f={C.focus} a="middle" o={v}>
          nothing small: one hash table, one pass each
        </T>
      )}
    </Svg>
  );
}

// 7 · Reveal: the full join. The three time bars grow one after another to their measured lengths.
export function RevealFull({ t }: StepCtx) {
  const maxMs = 543.876;
  const k = (i: number) => easeOut(seg(t, 0.2 + i * 0.8, 1.0 + i * 0.8));
  const q = easeOut(seg(t, 3.0, 3.6));
  return (
    <Svg label="hash 339.6-383.6ms, nested loop 431.269ms, merge join 543.876ms" h={370}>
      {timeBar(130, 60, 383.6 / maxMs, '339.6-383.6 ms', 'Hash Join (default)', C.focus, k(0))}
      {timeBar(130, 150, 431.269 / maxMs, '431.269 ms', 'Nested Loop (forced)', C.cherryText, k(1))}
      {timeBar(130, 240, 543.876 / maxMs, '543.876 ms', 'Merge Join (forced)', C.cherryText, k(2))}
      <T x={300} y={330} s={14} f={C.latte} a="middle" o={q}>
        hash wins here — no sort to pay for,
      </T>
      <T x={300} y={352} s={14} f={C.latte} a="middle" o={q}>
        no repeated inner scans
      </T>
    </Svg>
  );
}

// 8 · Merge join. Two sorted lists; a pointer on each walks down, the smaller side steps, and every equal pair is linked.
const LEFT = [1, 3, 4, 7, 9];
const RIGHT = [1, 2, 4, 4, 9];
const WALK: [number, number, boolean][] = [
  [0, 0, true],
  [0, 1, false],
  [1, 1, false],
  [1, 2, false],
  [2, 2, true],
  [2, 3, true],
  [2, 4, false],
  [3, 4, false],
  [4, 4, true],
];
export function MergeJoinMechanism({ t }: StepCtx) {
  const head = easeOut(seg(t, 0, 0.4));
  const sub = easeOut(seg(t, 0.5, 0.9));
  const walkT = seg(t, 1.0, 2.98);
  const n = t >= 2.98 ? WALK.length - 1 : Math.min(WALK.length - 1, Math.floor(walkT * WALK.length));
  const walking = t >= 1.0;
  const [pi, pj] = WALK[n];
  const cav = easeOut(seg(t, 3.0, 3.6));
  const ry = (i: number) => 76 + i * 26;
  return (
    <Svg label="merge join: both inputs already sorted on the join key" h={290}>
      <T x={300} y={28} s={16} f={C.crema} a="middle" o={head}>
        both sides sorted on the join key —
      </T>
      <T x={300} y={54} s={15} f={C.latte} a="middle" o={sub}>
        by an index, or an explicit sort
      </T>
      {LEFT.map((v, i) => (
        <g key={`l${i}`} opacity={head}>
          <rect x={160} y={ry(i)} width={70} height={22} rx={3} fill={C.cocoa} stroke={walking && pi === i ? C.focus : C.mocha} />
          <T x={195} y={ry(i) + 16} s={13} f={C.crema} a="middle">
            {v}
          </T>
        </g>
      ))}
      {RIGHT.map((v, i) => (
        <g key={`r${i}`} opacity={head}>
          <rect x={370} y={ry(i)} width={70} height={22} rx={3} fill={C.cocoa} stroke={walking && pj === i ? C.focus : C.mocha} />
          <T x={405} y={ry(i) + 16} s={13} f={C.crema} a="middle">
            {v}
          </T>
        </g>
      ))}
      {walking && (
        <>
          <path d={`M140 ${ry(pi) + 5} l12 6 l-12 6 z`} fill={C.focus} />
          <path d={`M460 ${ry(pj) + 5} l-12 6 l12 6 z`} fill={C.focus} />
        </>
      )}
      {WALK.map(([i, j, m], s) => (walking && m && s <= n ? <line key={s} x1={230} y1={ry(i) + 11} x2={370} y2={ry(j) + 11} stroke={C.focus} strokeWidth={2} /> : null))}
      <T x={300} y={248} s={15} f={C.latte} a="middle" o={cav}>
        no hash table, no repeated scans —
      </T>
      <T x={300} y={271} s={15} f={C.latte} a="middle" o={cav}>
        but someone has to pay for the sort
      </T>
    </Svg>
  );
}

// 9 · Decision factors. The four factors slide in one per beat; the last, equality, gets a red mark
// because only one approach can do without it.
export function DecisionFactors({ t }: StepCtx) {
  const rows: [string, string][] = [
    ['cardinality / selectivity', 'tiny outer + index → nested loop'],
    ['existing sort order', 'already sorted → merge join'],
    ['memory', 'hash table has to fit'],
    ['predicate type', 'hash & merge need equality'],
  ];
  const mark = easeInOut(seg(t, 3.0, 3.6));
  return (
    <Svg label="four factors that decide the join algorithm" h={300}>
      {rows.map(([label, value], i) => {
        const y = 40 + i * 65;
        const k = easeOut(seg(t, 0.2 + i * 0.6, 0.8 + i * 0.6));
        return (
          <g key={label} opacity={k} transform={`translate(${((1 - k) * 16).toFixed(2)} 0)`}>
            <T x={25} y={y} s={15} f={C.crema}>
              {label}
            </T>
            <T x={25} y={y + 24} s={14} f={C.latte}>
              {value}
            </T>
          </g>
        );
      })}
      <rect x={12} y={40 + 3 * 65 - 14} width={3} height={44 * mark} fill={C.cherryText} />
    </Svg>
  );
}

// 10 · Predict: work_mem cut. The budget bar shrinks from 4 MB to 64 kB; after the answer the table splits
// into a row of small batches.
export function PredictWorkMem({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const shrink = easeInOut(seg(t, 0.8, 1.5));
  return (
    <Svg label="work_mem cut from 4MB default to 64kB, same forced hash join" h={230}>
      <Row y={60} label="work_mem (default)" value="4 MB" k={easeOut(seg(t, 0.1, 0.6))} />
      <Row y={115} label="work_mem (reduced)" value="64 kB" valueColor={C.cherryText} k={easeOut(seg(t, 0.4, 0.9))} />
      <rect x={25} y={135} width={lerp(300, Math.max(3, 300 * (64 / 4096)), shrink)} height={8} rx={3} fill={shrink > 0 ? C.cherryText : C.primary} opacity={easeOut(seg(t, 0.4, 0.9))} />
      {answered &&
        Array.from({ length: 8 }, (_, i) => {
          const k = easeOutBack(seg(s, 0.1 + i * 0.06, 0.4 + i * 0.06));
          return <rect key={i} x={25 + i * 26} y={168} width={20 * Math.max(0, k)} height={20} rx={3} fill={C.focus} opacity={clamp(k, 0, 1)} />;
        })}
      {answered && (
        <T x={250} y={183} s={14} f={C.focus} o={easeOut(seg(s, 0.6, 1.0))}>
          smaller batches, same strategy
        </T>
      )}
    </Svg>
  );
}

// 11 · Reveal: batches. Both times count up; under them one solid block, then 64 small batches filling in.
export function RevealWorkMem({ t }: StepCtx) {
  const one = easeOut(seg(t, 0.6, 1.1));
  const q = easeOut(seg(t, 3.0, 3.6));
  return (
    <Svg label="1 batch at 383.577ms, 64 batches at 413.237ms" h={250}>
      <TwoTimes
        t={t}
        max={413.237}
        rows={[
          ['work_mem=4MB: 1 batch', 383.577, 3, C.focus],
          ['work_mem=64kB: 64 batches', 413.237, 3, C.cherryText],
        ]}
      />
      <rect x={25} y={158} width={60} height={23} rx={3} fill={C.focus} opacity={one} />
      {Array.from({ length: 64 }, (_, i) => {
        const k = easeOut(seg(t, 1.6 + i * 0.015, 1.9 + i * 0.015));
        return <rect key={i} x={110 + (i % 32) * 14} y={158 + Math.floor(i / 32) * 13} width={10} height={10} rx={2} fill={C.cherryText} opacity={k} />;
      })}
      <T x={300} y={225} s={15} f={C.latte} a="middle" o={q}>
        about 7.7% slower — spilling, not a cliff
      </T>
    </Svg>
  );
}

// 12 · work_mem. The hash table outgrows the budget outline; the overflow turns red and drops away as batches;
// then the outline stretches for hash_mem_multiplier.
export function WorkMemMechanism({ t }: StepCtx) {
  const box = easeOut(seg(t, 0.2, 0.6));
  const fill = easeInOut(seg(t, 0.6, 1.4));
  const drop = easeInOut(seg(t, 1.4, 2.0));
  const txt = easeOut(seg(t, 1.6, 2.2));
  const ext = easeInOut(seg(t, 2.6, 3.2));
  const txt2 = easeOut(seg(t, 3.0, 3.6));
  const fw = 300 * fill;
  return (
    <Svg label="work_mem: the budget before a hash table spills to disk" h={250}>
      <Row y={50} label="work_mem (default)" value="4 MB" k={box} />
      <rect x={25} y={76} width={Math.min(fw, 200)} height={24} rx={3} fill={C.primary} />
      {fw > 200 && drop < 1 && <rect x={225} y={76} width={fw - 200} height={24} rx={3} fill={C.cherryText} opacity={1 - drop} />}
      {[0, 1, 2].map((i) => (drop > 0 ? <rect key={i} x={228 + i * 34} y={lerp(80, 114, drop)} width={28} height={14} rx={2} fill={C.cherryText} opacity={drop} /> : null))}
      <rect x={25} y={74} width={200} height={28} rx={4} fill="none" stroke={C.latte} strokeWidth={1.5} opacity={box} />
      {ext > 0 && <rect x={225} y={74} width={200 * ext} height={28} rx={4} fill="none" stroke={C.second} strokeWidth={1.5} strokeDasharray="5 4" />}
      <T x={300} y={160} s={14} f={C.latte} a="middle" o={txt}>
        too small to fit → spill to disk,
      </T>
      <T x={300} y={183} s={14} f={C.latte} a="middle" o={txt}>
        as more batches instead of one
      </T>
      <T x={300} y={225} s={14} f={C.second} a="middle" o={txt2}>
        hash_mem_multiplier gives hash ops extra room
      </T>
    </Svg>
  );
}

// 13 · Predict: a range with nested loops switched off. After the answer the verdict slides in.
export function PredictInequality({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const v = answered ? easeOut(seg(s, 0.1, 0.6)) : 0;
  return (
    <Svg label="a range predicate, enable_nestloop = off" h={210}>
      <Row y={70} label="join condition" value="a range, not equality" valueColor={C.cherryText} k={easeOut(seg(t, 0.1, 0.6))} />
      <Row y={130} label="enable_nestloop" value="off" k={easeOut(seg(t, 0.5, 1.0))} />
      {answered && (
        <T x={300} y={lerp(192, 184, v)} s={15} f={C.focus} a="middle" o={v}>
          only a nested loop can join on a range
        </T>
      )}
    </Svg>
  );
}

// 14 · Reveal: still a nested loop. The plan lands; the alternatives' price bar runs off the edge.
export function RevealInequality({ t }: StepCtx) {
  const price = easeInOut(seg(t, 1.2, 2.0));
  const q = easeOut(seg(t, 2.2, 2.8));
  return (
    <Svg label="still a Nested Loop — the alternatives were priced near 1e10" h={240}>
      <Row y={60} label="plan chosen anyway" value="Nested Loop" valueColor={C.focus} big k={easeOut(seg(t, 0.2, 0.8))} />
      <Row y={120} label="alternative paths priced at" value="~1e10" valueColor={C.cherryText} k={easeOut(seg(t, 0.8, 1.3))} />
      <rect x={25} y={134} width={550 * price} height={6} rx={3} fill={C.cherryText} opacity={0.8} />
      <T x={300} y={185} s={15} f={C.latte} a="middle" o={q}>
        discouraged, not disallowed — it can't be turned off
      </T>
    </Svg>
  );
}

// 15 · Recap. Each question arrives as a pair of lines, rising in, with a short rule drawn after each pair.
export function Recap({ t }: StepCtx) {
  const lines = ['does one side have an index', 'the other side can drive into?', 'is either side already sorted', 'on the join key?', 'is this even an equality', 'condition at all?'];
  return (
    <Svg label="three questions before trusting a join algorithm" h={270}>
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

// 16 · Prove: filtered. The two facts slide in; after the answer the verdict slides in with rule and tick.
export function ProveFiltered({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const k = answered ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const tick = answered ? easeOut(seg(s, 0.6, 1.0)) : 0;
  return (
    <Svg label="1 of a million rows, indexed join column" h={220}>
      <Row y={70} label="outer side rows" value="1" k={easeOut(seg(t, 0.1, 0.6))} />
      <Row y={130} label="inner join column" value="indexed" k={easeOut(seg(t, 0.4, 0.9))} />
      {answered && (
        <>
          <T x={300} y={lerp(192, 180, k)} s={16} f={C.focus} a="middle" o={k}>
            one outer row → one indexed lookup
          </T>
          <rect x={140} y={192} width={320 * tick} height={3} fill={C.focus} />
          <Tick y={165} k={tick} />
        </>
      )}
    </Svg>
  );
}

// 17 · Prove: batches. The batch count counts up to 12; after the answer the verdict slides in with rule and tick.
export function ProveBatches({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const k = answered ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const tick = answered ? easeOut(seg(s, 0.6, 1.0)) : 0;
  return (
    <Svg label="EXPLAIN (ANALYZE) reports 12 batches" h={220}>
      <Row y={70} label="Hash Batches" value={num(Math.max(1, 12 * easeOut(seg(t, 0.1, 0.8))))} k={easeOut(seg(t, 0.1, 0.5))} />
      <Row y={130} label="hash table fit in work_mem?" value="no" valueColor={C.cherryText} k={easeOut(seg(t, 0.5, 1.0))} />
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
