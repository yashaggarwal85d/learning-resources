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

// 1 · Two totals. Each total counts up on its row, a bar under it grows to its size, and the
// gap between the two bars is the question.
export function TwoTotals({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.8));
  const ca = easeOut(seg(t, 0.4, 1.6));
  const b = easeOut(seg(t, 1.2, 1.8));
  const cb = easeOut(seg(t, 1.4, 2.4));
  const q = easeOut(seg(t, 2.8, 3.4));
  return (
    <Svg label="two totals, 23,837.70 and 1,697.40" h={230}>
      <Row y={70} label="written order, limit=1" value={num(23837.7 * ca, 2)} valueColor={C.cherryText} big k={a} />
      <rect x={25} y={84} width={550 * ca} height={6} rx={3} fill={C.cherryText} opacity={0.8} />
      <Row y={130} label="reordered, limit=20" value={num(1697.4 * cb, 2)} valueColor={C.focus} big k={b} />
      <rect x={25} y={144} width={Math.max(b > 0 ? 3 : 0, 550 * (1697.4 / 23837.7) * cb)} height={6} rx={3} fill={C.focus} />
      <T x={300} y={200} s={15} f={C.latte} a="middle" o={q}>
        same tables, same data
      </T>
    </Svg>
  );
}

// 2 · Predict: a Seq Scan. The two catalog numbers count up, the two constants arrive under them;
// after the answer the formula that joins them slides in.
export function PredictSeqScan({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const a = easeOut(seg(t, 0.1, 0.6));
  const b = easeOut(seg(t, 0.4, 0.9));
  const ca = easeOut(seg(t, 0.2, 1.0));
  const cb = easeOut(seg(t, 0.5, 1.3));
  const k = easeOut(seg(t, 1.0, 1.5));
  const f = answered ? easeOut(seg(s, 0.1, 0.7)) : 0;
  return (
    <Svg label="orders: 46,484 pages, 2,400,000 rows" h={250}>
      <Row y={60} label="pages (pg_class.relpages)" value={num(46484 * ca)} k={a} />
      <Row y={115} label="rows (pg_class.reltuples)" value={num(2400000 * cb)} k={b} />
      <T x={300} y={170} s={14} f={C.mocha} a="middle" o={k}>
        seq_page_cost 1.0 · cpu_tuple_cost 0.01
      </T>
      {answered && (
        <T x={300} y={lerp(232, 220, f)} s={15} f={C.focus} a="middle" o={f}>
          pages × 1.0 + rows × 0.01
        </T>
      )}
    </Svg>
  );
}

// 3 · Reveal: the formula. Each product counts up on its row, the rule draws, and the total
// counts up into the planner's own figure, underlined.
export function RevealSeqScan({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.7));
  const ca = easeOut(seg(t, 0.3, 1.0));
  const b = easeOut(seg(t, 0.8, 1.3));
  const cb = easeOut(seg(t, 0.9, 1.6));
  const rule = easeInOut(seg(t, 1.6, 2.0));
  const tot = easeOut(seg(t, 2.0, 2.9));
  const under = easeOut(seg(t, 2.9, 3.3));
  return (
    <Svg label="46,484 x 1.0 + 2,400,000 x 0.01 = 70,484" h={260}>
      <Row y={60} label="46,484 pages x 1.0" value={num(46484 * ca)} k={a} />
      <Row y={110} label="2,400,000 rows x 0.01" value={num(24000 * cb)} k={b} />
      <rect x={25} y={150} width={550 * rule} height={2} fill={C.mocha} />
      {tot > 0 && <Row y={210} label="total cost" value={num(70484 * tot, 2)} valueColor={C.focus} big />}
      <rect x={575 - 130 * under} y={222} width={130 * under} height={3} fill={C.focus} />
    </Svg>
  );
}

// 4 · Five constants. They slide in one per beat, the out-of-order page lights as the larger one,
// a bracket gathers all five, and the line under it says what they price.
export function FiveConstants({ t }: StepCtx) {
  const rows: [string, string][] = [
    ['seq_page_cost', '1.0'],
    ['random_page_cost', '4.0'],
    ['cpu_tuple_cost', '0.01'],
    ['cpu_index_tuple_cost', '0.005'],
    ['cpu_operator_cost', '0.0025'],
  ];
  const br = easeInOut(seg(t, 2.4, 3.1));
  const q = easeOut(seg(t, 3.1, 3.7));
  return (
    <Svg label="the five planner cost constants" h={270}>
      {rows.map(([label, value], i) => (
        <Row key={label} y={40 + i * 42} label={label} value={value} valueColor={i === 1 ? C.focus : C.crema} k={easeOut(seg(t, 0.2 + i * 0.4, 0.7 + i * 0.4))} />
      ))}
      <path d={`M14 26 v${(194 - 26) * br}`} stroke={C.focus} strokeWidth={2} fill="none" />
      <T x={300} y={252} s={14} f={C.latte} a="middle" o={q}>
        every plan is priced from these five
      </T>
    </Svg>
  );
}

function logBar(x: number, y: number, value: number, display: string, maxLog: number, label: string, k: number) {
  const track = 230;
  const frac = Math.log10(value) / maxLog;
  return (
    <g key={label} opacity={k > 0 ? 1 : 0}>
      <T x={x - 5} y={y - 8} s={13} f={C.latte} a="end">
        {label}
      </T>
      <Bar x={x} y={y - 14} w={track * frac * k} h={20} full={track} fill={C.focus} />
      <T x={x + track + 10} y={y} s={13} f={C.crema} o={seg(k, 0.6, 1)}>
        {display}
      </T>
    </g>
  );
}

// 5 · Tree counts. Each bar grows along a log track to its count; a check mark per row once the
// brute-force line lands.
export function TreeCounts({ t }: StepCtx) {
  const maxLog = Math.log10(64_764_752_532_480_000);
  const k = (i: number) => easeOut(seg(t, 0.2 + i * 0.8, 1.0 + i * 0.8));
  const q = easeOut(seg(t, 2.9, 3.5));
  return (
    <Svg label="join-order tree counts, 8 to 14 tables" h={250}>
      {logBar(120, 60, 17_297_280, '17.3 million', maxLog, '8 tables', k(0))}
      {logBar(120, 120, 28_158_588_057_600, '28.2 trillion', maxLog, '12 tables', k(1))}
      {logBar(120, 180, 64_764_752_532_480_000, '64.8 quadrillion', maxLog, '14 tables', k(2))}
      <T x={300} y={232} s={13} f={C.mocha} a="middle" o={q}>
        log scale · counts checked by brute force
      </T>
    </Svg>
  );
}

// 6 · Predict: bad order. Nine boxes drop in, the filtered one last; after the answer a bracket closes over
// the first eight (the limit) and the ninth is left outside it.
export function PredictCollapse({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const n = 9;
  const boxW = 50;
  const gap = 8;
  const totalW = n * boxW + (n - 1) * gap;
  const startX = 300 - totalW / 2;
  const cap = easeOut(seg(t, 1.0, 1.5));
  const br = answered ? easeInOut(seg(s, 0.1, 0.8)) : 0;
  const v = answered ? easeOut(seg(s, 0.8, 1.3)) : 0;
  const bx1 = startX + 8 * boxW + 7 * gap;
  return (
    <Svg label="9 tables, filter on the last one, limit 8" h={220}>
      {Array.from({ length: n }).map((_, i) => {
        const x = startX + i * (boxW + gap);
        const isFiltered = i === n - 1;
        const k = easeOutBack(seg(t, 0.1 + i * 0.08, 0.5 + i * 0.08));
        return (
          <g key={i} opacity={clamp(k * 1.5, 0, 1)} transform={`translate(0 ${((1 - k) * -14).toFixed(2)})`}>
            <rect x={x} y={60} width={boxW} height={40} rx={4} fill={C.cocoa} stroke={isFiltered ? C.cherryText : C.mocha} strokeWidth={isFiltered ? 2 : 1.5} />
            <T x={x + boxW / 2} y={85} s={13} f={isFiltered ? C.cherryText : C.latte} a="middle">
              j{i + 1}
            </T>
          </g>
        );
      })}
      {answered && <path d={`M${startX} 50 v-8 h${(bx1 - startX) * br} v${br >= 1 ? 8 : 0}`} fill="none" stroke={C.focus} strokeWidth={2} />}
      {answered && (
        <T x={(startX + bx1) / 2} y={32} s={13} f={C.focus} a="middle" o={br}>
          reorderable: 8
        </T>
      )}
      <T x={300} y={135} s={14} f={C.latte} a="middle" o={cap}>
        filter sits last, written order fixed
      </T>
      <T x={300} y={158} s={14} f={C.latte} a="middle" o={cap}>
        join_collapse_limit default: 8
      </T>
      {answered && (
        <T x={300} y={lerp(204, 196, v)} s={15} f={C.cherryText} a="middle" o={v}>
          9 &gt; 8: the written order runs
        </T>
      )}
    </Svg>
  );
}

// 7 · Reveal: 14× apart. The forced total counts up with a long bar; the free total counts up with a sliver.
export function RevealCollapse({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.8));
  const ca = easeOut(seg(t, 0.3, 1.4));
  const b = easeOut(seg(t, 1.3, 1.9));
  const cb = easeOut(seg(t, 1.4, 2.3));
  const q = easeOut(seg(t, 2.7, 3.3));
  return (
    <Svg label="23,837.70 forced vs 1,697.40 free to reorder" h={240}>
      <Row y={60} label="limit=1, literal order" value={num(23837.7 * ca, 2)} valueColor={C.cherryText} big k={a} />
      <rect x={25} y={74} width={550 * ca} height={6} rx={3} fill={C.cherryText} opacity={0.8} />
      <Row y={120} label="limit=20, reordered" value={num(1697.4 * cb, 2)} valueColor={C.focus} big k={b} />
      <rect x={25} y={134} width={Math.max(b > 0 ? 3 : 0, 550 * (1697.4 / 23837.7) * cb)} height={6} rx={3} fill={C.focus} />
      <T x={300} y={180} s={15} f={C.latte} a="middle" o={q}>
        same query, same data —
      </T>
      <T x={300} y={203} s={15} f={C.latte} a="middle" o={q}>
        14× apart on the collapse limit alone
      </T>
    </Svg>
  );
}

// 8 · The two limits. Both rows slide in; the pinning command types itself out; a chain of four tables
// is locked into the written order by a bar drawn through it.
export function CollapseLimitMechanism({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.7));
  const b = easeOut(seg(t, 0.6, 1.1));
  const cmd = 'set join_collapse_limit = 1';
  const typed = Math.round(cmd.length * seg(t, 1.3, 2.3));
  const q = easeOut(seg(t, 2.3, 2.9));
  const lock = easeInOut(seg(t, 2.9, 3.6));
  return (
    <Svg label="from_collapse_limit and join_collapse_limit, default 8" h={260}>
      <Row y={60} label="from_collapse_limit (default)" value="8" k={a} />
      <Row y={110} label="join_collapse_limit (default)" value="8" k={b} />
      <T x={300} y={165} s={14} f={C.latte} a="middle">
        {cmd.slice(0, typed)}
      </T>
      <T x={300} y={188} s={14} f={C.latte} a="middle" o={q}>
        to pin the order you wrote
      </T>
      <g opacity={q}>
        <rect x={160} y={226} width={280 * lock} height={2} fill={C.focus} />
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <rect x={160 + i * 80} y={212} width={40} height={30} rx={4} fill={C.cocoa} stroke={lock >= 1 ? C.focus : C.mocha} />
            <T x={180 + i * 80} y={232} s={13} f={C.latte} a="middle">
              {String.fromCharCode(97 + i)}
            </T>
          </g>
        ))}
      </g>
    </Svg>
  );
}

// 9 · Predict: past the threshold. The axis draws, the marks pop on, the threshold line drops at 12;
// after the answer the region past it shades as the quicker, uncertain search.
export function PredictGeqo({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const marks = [
    { n: 11, x: 150 },
    { n: 12, x: 300 },
    { n: 14, x: 480 },
  ];
  const ax = easeInOut(seg(t, 0.1, 0.7));
  const th = easeOut(seg(t, 0.9, 1.4));
  const sh = answered ? easeInOut(seg(s, 0.1, 0.8)) : 0;
  const v = answered ? easeOut(seg(s, 0.7, 1.2)) : 0;
  return (
    <Svg label="geqo_threshold = 12 FROM items" h={200}>
      {answered && <rect x={300} y={84} width={260 * sh} height={32} fill={C.cherryText} opacity={0.15} />}
      <line x1={60} y1={100} x2={60 + 500 * ax} y2={100} stroke={C.mocha} strokeWidth={2} />
      <line x1={300} y1={74} x2={300} y2={74 + 52 * th} stroke={C.cherryText} strokeWidth={1.5} strokeDasharray="4 3" />
      {marks.map((m, i) => {
        const k = easeOutBack(seg(t, 0.4 + i * 0.2, 0.8 + i * 0.2));
        return (
          <g key={m.n}>
            <circle cx={m.x} cy={100} r={5 * Math.max(0, k)} fill={m.n >= 12 ? C.cherryText : C.focus} />
            <T x={m.x} y={140} s={14} f={C.latte} a="middle" o={clamp(k, 0, 1)}>
              {m.n} tables
            </T>
          </g>
        );
      })}
      <T x={300} y={60} s={14} f={C.latte} a="middle" o={th}>
        geqo_threshold = 12
      </T>
      {answered && (
        <T x={430} y={lerp(184, 176, v)} s={13} f={C.cherryText} a="middle" o={v}>
          quicker, no guarantee
        </T>
      )}
    </Svg>
  );
}

// 10 · Reveal: the planning-time curve. The exhaustive points climb one per beat; then the quick-search
// points land low at 12 and 13 tables.
export function RevealGeqo({ t }: StepCtx) {
  const pts: [number, number][] = [
    [90, 180],
    [180, 165],
    [330, 130],
    [400, 90],
    [470, 40],
  ];
  const labels = ['8: 36ms', '10: 224ms', '12: 1.74s', '13: 5.14s', '14: 36.1s'];
  const g = (i: number) => easeOutBack(seg(t, 2.6 + i * 0.25, 3.0 + i * 0.25));
  const q = easeOut(seg(t, 3.1, 3.7));
  return (
    <Svg label="planning time, 36ms to 36.1s, then GEQO at ~130ms" h={260}>
      <line x1={60} y1={200} x2={60 + 480 * easeInOut(seg(t, 0, 0.5))} y2={200} stroke={C.mocha} />
      <Plot pts={pts} t={t} start={0.3} beat={0.45} base={200} labels={labels} fill={C.cherryText} />
      {[330, 400].map((x, i) => (
        <rect key={x} x={x - 5} y={187} width={10} height={10} fill={C.focus} transform={`rotate(45 ${x} 192) translate(${x} 192) scale(${Math.max(0, g(i))}) translate(${-x} -192)`} />
      ))}
      <T x={300} y={235} s={14} f={C.focus} a="middle" o={q}>
        GEQO: 132ms / 125ms, same cost
      </T>
    </Svg>
  );
}

// 11 · How GEQO searches. One string is a join order; a population of them gets cost bars; the costliest
// is discarded and a new string bred from the survivors slides into its place.
export function GeqoMechanism({ t }: StepCtx) {
  const pop = ['4-1-3-2', '2-4-1-3', '3-2-4-1', '1-3-2-4'];
  const cost = [0.35, 0.55, 1, 0.45];
  const head = easeOut(seg(t, 0.1, 0.6));
  const chips = (i: number) => easeOut(seg(t, 0.4 + i * 0.12, 0.8 + i * 0.12));
  const bars = easeInOut(seg(t, 1.1, 1.8));
  const fit = easeOut(seg(t, 1.4, 2.0));
  const cull = easeInOut(seg(t, 2.2, 2.8));
  const bred = easeOutBack(seg(t, 2.9, 3.5));
  const q = easeOut(seg(t, 2.2, 2.8));
  return (
    <Svg label="join orders as integer strings, bred and culled" h={250}>
      <T x={300} y={36} s={16} f={C.crema} a="middle" o={head}>
        '4-1-3-2' = join order, one string
      </T>
      {pop.map((p, i) => {
        const x = 25 + i * 140;
        const worst = i === 2;
        const k = chips(i);
        const gone = worst ? cull : 0;
        return (
          <g key={p}>
            <g opacity={k * (1 - gone)} transform={`translate(0 ${(gone * 18).toFixed(2)})`}>
              <rect x={x} y={58} width={110} height={30} rx={4} fill={C.cocoa} stroke={worst && bars >= 1 ? C.cherryText : C.mocha} />
              <T x={x + 55} y={78} s={14} f={C.crema} a="middle">
                {p}
              </T>
              <rect x={x} y={96} width={110 * cost[i] * bars} height={6} rx={2} fill={worst ? C.cherryText : C.focus} />
            </g>
            {worst && bred > 0 && (
              <g opacity={clamp(bred, 0, 1)} transform={`translate(0 ${((1 - bred) * -16).toFixed(2)})`}>
                <rect x={x} y={58} width={110} height={30} rx={4} fill={C.cocoa} stroke={C.focus} strokeWidth={2} />
                <T x={x + 55} y={78} s={14} f={C.focus} a="middle">
                  4-1-2-3
                </T>
              </g>
            )}
          </g>
        );
      })}
      <T x={300} y={140} s={15} f={C.latte} a="middle" o={fit}>
        lower estimated cost = more fit
      </T>
      <T x={300} y={195} s={15} f={C.latte} a="middle" o={q}>
        least fit discarded; new strings bred
      </T>
      <T x={300} y={218} s={15} f={C.latte} a="middle" o={q}>
        from the fittest survivors
      </T>
    </Svg>
  );
}

// 12 · Interesting orders. Both totals count up; under them the plan scan → Sort → result loses its Sort box,
// which turns red, folds away, and lets the result slide up against the scan.
export function InterestingOrders({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.8));
  const ca = easeOut(seg(t, 0.3, 1.3));
  const chain = easeOut(seg(t, 0.6, 1.1));
  const b = easeOut(seg(t, 1.5, 2.0));
  const cb = easeOut(seg(t, 1.6, 2.4));
  const fold = easeInOut(seg(t, 2.0, 2.7));
  const q = easeOut(seg(t, 3.0, 3.6));
  const sortW = 90 * (1 - fold);
  const resX = lerp(420, 300, fold);
  return (
    <Svg label="60,084.45 with a Sort node, 53.19 without" h={250}>
      <Row y={50} label="no index: scan + Sort" value={num(60084.45 * ca, 2)} valueColor={C.cherryText} big k={a} />
      <Row y={100} label="indexed: scan already sorted" value={num(53.19 * cb, 2)} valueColor={C.focus} big k={b} />
      <g opacity={chain}>
        <rect x={150} y={130} width={120} height={30} rx={4} fill={C.cocoa} stroke={C.mocha} />
        <T x={210} y={150} s={13} f={C.latte} a="middle">
          scan
        </T>
        <line x1={270} y1={145} x2={resX} y2={145} stroke={C.mocha} />
        {fold < 1 && <rect x={300} y={130} width={sortW} height={30} rx={4} fill={C.cocoa} stroke={fold > 0 ? C.cherryText : C.mocha} opacity={1 - fold} />}
        {fold === 0 && (
          <T x={345} y={150} s={13} f={C.cherryText} a="middle">
            Sort
          </T>
        )}
        <rect x={resX} y={130} width={90} height={30} rx={4} fill={C.cocoa} stroke={fold >= 1 ? C.focus : C.mocha} />
        {(fold === 0 || fold >= 1) && (
          <T x={resX + 45} y={150} s={13} f={C.latte} a="middle">
            result
          </T>
        )}
      </g>
      <T x={300} y={205} s={15} f={C.latte} a="middle" o={q}>
        same query, same table —
      </T>
      <T x={300} y={228} s={15} f={C.latte} a="middle" o={q}>
        the Sort step just isn't there anymore
      </T>
    </Svg>
  );
}

// 13 · Recap. Each question arrives as a pair of lines, rising in, with a short rule drawn after each pair.
export function Recap({ t }: StepCtx) {
  const lines = ['what do the constants assume', 'about this hardware?', 'would a smaller limit have', 'blocked a better order?', 'is this past where GEQO', 'took over already?'];
  return (
    <Svg label="three questions before trusting a plan" h={270}>
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

// 14 · Prove: the formula. The two numbers slide in; after the answer the formula slides in, then the rule and tick.
export function ProveFormula({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const k = answered ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const tick = answered ? easeOut(seg(s, 0.6, 1.0)) : 0;
  return (
    <Svg label="2,000 pages, 50,000 rows" h={220}>
      <Row y={70} label="pages" value="2,000" k={easeOut(seg(t, 0.1, 0.6))} />
      <Row y={130} label="rows" value="50,000" k={easeOut(seg(t, 0.4, 0.9))} />
      {answered && (
        <>
          <T x={300} y={lerp(192, 180, k)} s={16} f={C.focus} a="middle" o={k}>
            (2,000 × 1.0) + (50,000 × 0.01)
          </T>
          <rect x={160} y={192} width={280 * tick} height={3} fill={C.focus} />
          <Tick y={165} k={tick} />
        </>
      )}
    </Svg>
  );
}

// 15 · Prove: collapse. Seven small boxes fill under an eight-wide bracket; after the answer the verdict slides in with rule and tick.
export function ProveCollapse({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const k = answered ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const tick = answered ? easeOut(seg(s, 0.6, 1.0)) : 0;
  return (
    <Svg label="7 tables, bad order, limit 8" h={220}>
      <Row y={70} label="FROM items" value="7" k={easeOut(seg(t, 0.1, 0.6))} />
      <Row y={130} label="join_collapse_limit" value="8 (default)" k={easeOut(seg(t, 0.4, 0.9))} />
      {answered && (
        <>
          <T x={300} y={lerp(192, 180, k)} s={15} f={C.focus} a="middle" o={k}>
            7 fits under 8 — the planner can reorder
          </T>
          <rect x={120} y={192} width={360 * tick} height={3} fill={C.focus} />
        </>
      )}
    </Svg>
  );
}
