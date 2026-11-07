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

/** A predict step's verdict, sliding up into place once the learner has answered. */
function Verdict({ answer, text, y = 184, f = C.focus }: { answer: number | null; text: string; y?: number; f?: string }) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  if (answer === null) return null;
  return (
    <T x={300} y={lerp(y + 8, y, v)} s={15} f={f} a="middle" o={v}>
      {text}
    </T>
  );
}

/** A Row whose "?" becomes the answer once the learner has answered, underlined as it lands. */
function AnswerRow({ y, label, answer, value, k, f = C.focus }: { y: number; label: string; answer: number | null; value: string; k: number; f?: string }) {
  const s = useSinceAnswer(answer !== null);
  const u = answer !== null ? easeOut(seg(s, 0.2, 0.7)) : 0;
  const uw = Math.min(250, value.length * 10.7);
  return (
    <g>
      <Row y={y} label={label} value={answer !== null ? value : '?'} valueColor={answer !== null ? f : C.crema} k={k} />
      {answer !== null && <rect x={575 - uw * u} y={y + 12} width={uw * u} height={3} fill={f} />}
    </g>
  );
}

/** An index's leaf level as a strip of cells; `fill(i)` colours a cell (undefined = unread). */
function Strip({ y, n, fill, o = 1, h = 16 }: { y: number; n: number; fill: (i: number) => string | undefined; o?: number; h?: number }) {
  const w = 550 / n;
  return (
    <g opacity={o}>
      {Array.from({ length: n }, (_, i) => {
        const f = fill(i);
        return <rect key={i} x={25 + i * w} y={y} width={w - 2} height={h} rx={2} fill={f ?? C.cocoa} stroke={f ? 'none' : C.mocha} strokeWidth={0.6} />;
      })}
    </g>
  );
}

// 1 · Hook. Six buffers is a sliver; 2,184 grows across the whole track.
export function Hook({ t }: StepCtx) {
  const k = (i: number) => easeOut(seg(t, 0.2 + i * 1.2, 1.1 + i * 1.2));
  return (
    <Svg label="same two columns, same query, a 364x gap" h={370}>
      {timeBar(30, 90, 6 / 2184, '6 buffers', 'index (a, b)', C.focus, k(0))}
      {timeBar(30, 210, 2184 / 2184, '2,184 buffers', 'index (b, a)', C.cherryText, k(1))}
    </Svg>
  );
}

// 2 · Predict: why do they differ. After the answer the "?" fills in and the verdict slides in.
export function PredictWhyDiffer({ t, answer }: StepCtx) {
  return (
    <Svg label="same columns indexed — different order" h={210}>
      <Row y={70} label="index (a, b)" value="6 buffers" valueColor={C.focus} k={easeOut(seg(t, 0.1, 0.6))} />
      <AnswerRow y={130} label="index (b, a)" answer={answer} value="2,184 buffers" f={C.cherryText} k={easeOut(seg(t, 0.5, 1.0))} />
      <Verdict answer={answer} text="the column order inside each index" />
    </Svg>
  );
}

// 3 · Equality leads. On (a, b) the equality match lights two neighbouring cells; on (b, a) the range sweeps a long run.
export function RevealEqualityLeads({ t }: StepCtx) {
  const s1 = easeOut(seg(t, 0.4, 0.8));
  const hit = easeOut(seg(t, 0.9, 1.4));
  const s2 = easeOut(seg(t, 1.8, 2.2));
  const sweep = seg(t, 2.4, 3.6) * 18;
  return (
    <Svg label="equality leading narrows the scan; range leading doesn't" h={170}>
      <Row y={40} label="equality column leads" value="6 buffers" valueColor={C.focus} k={easeOut(seg(t, 0.2, 0.7))} />
      <Strip y={54} n={30} o={s1} fill={(i) => (i >= 12 && i <= 13 && hit > 0 ? C.focus : undefined)} />
      <Row y={120} label="range column leads" value="2,184 buffers" valueColor={C.cherryText} k={easeOut(seg(t, 1.6, 2.1))} />
      <Strip y={134} n={30} o={s2} fill={(i) => (i >= 4 && i - 4 < sweep ? C.cherryText : undefined)} />
    </Svg>
  );
}

// 4 · Selectivity. Each column's value range splits into its distinct values; one of a's thousand is a real slice,
// one of b's hundred thousand is a hairline.
export function RevealSelectivity({ t }: StepCtx) {
  const a = easeInOut(seg(t, 0.5, 1.3));
  const b = easeInOut(seg(t, 1.9, 2.7));
  const pick = easeOut(seg(t, 3.0, 3.5));
  return (
    <Svg label="fewer distinct values, tighter narrowing" h={180}>
      <Row y={40} label="column a" value="1,000 distinct" valueColor={C.focus} k={easeOut(seg(t, 0.2, 0.7))} />
      {Array.from({ length: Math.round(20 * a) }, (_, i) => (
        <rect key={i} x={25 + i * 27.5} y={54} width={25.5} height={16} rx={2} fill={i === 7 && pick > 0 ? C.focus : C.cocoa} stroke={C.mocha} strokeWidth={0.6} />
      ))}
      <Row y={120} label="column b" value="100,000 distinct" k={easeOut(seg(t, 1.6, 2.1))} />
      {Array.from({ length: Math.round(100 * b) }, (_, i) => (
        <rect key={i} x={25 + i * 5.5} y={134} width={4} height={16} fill={i === 37 && pick > 0 ? C.focus : C.mocha} opacity={0.8} />
      ))}
    </Svg>
  );
}

// 5 · Predict: ORDER BY. After the answer the "?" fills in and the verdict slides in.
export function PredictOrderBy({ t, answer }: StepCtx) {
  return (
    <Svg label="one index, two possible ORDER BY requests" h={210}>
      <Row y={70} label="ORDER BY a, b" value="matches the index" k={easeOut(seg(t, 0.1, 0.6))} />
      <AnswerRow y={130} label="ORDER BY b, a" answer={answer} value="needs a sort" f={C.cherryText} k={easeOut(seg(t, 0.5, 1.0))} />
      <Verdict answer={answer} text="only the stored order comes back free" />
    </Svg>
  );
}

// 6 · Sort match. The matched order is a sliver; the mismatched one grows across.
export function RevealSortMatch({ t }: StepCtx) {
  const k = (i: number) => easeOut(seg(t, 0.2 + i * 1.2, 1.1 + i * 1.2));
  return (
    <Svg label="matched order: no sort. mismatched: a full sort." h={370}>
      {timeBar(30, 90, 0.095 / 177.6, '0.095 ms', 'ORDER BY a, b', C.focus, k(0))}
      {timeBar(30, 210, 177.6 / 177.6, '177.6 ms', 'ORDER BY b, a', C.cherryText, k(1))}
    </Svg>
  );
}

// 7 · LIMIT amplifies. Matched: the first ten cells light and that is all. Mismatched: every cell is swept by the sort
// before the first ten can be handed back.
export function RevealLimitAmplifies({ t }: StepCtx) {
  const first = seg(t, 0.6, 1.2) * 10;
  const sortS = seg(t, 1.8, 3.0) * 40;
  const pick = seg(t, 3.0, 3.4) * 10;
  return (
    <Svg label="LIMIT 10: read 10 rows, or sort 2,000,000 first" h={170}>
      <Row y={40} label="matched order" value="reads 10 rows" valueColor={C.focus} k={easeOut(seg(t, 0.2, 0.7))} />
      <Strip y={54} n={40} o={easeOut(seg(t, 0.3, 0.6))} fill={(i) => (i < first ? C.focus : undefined)} />
      <Row y={120} label="mismatched order" value="sorts everything first" valueColor={C.cherryText} k={easeOut(seg(t, 1.4, 1.9))} />
      <Strip y={134} n={40} o={easeOut(seg(t, 1.5, 1.8))} fill={(i) => (i < pick ? C.focus : i < sortS ? C.cherryText : undefined)} />
    </Svg>
  );
}

// 8 · Predict: leading column missing. After the answer the "?" fills in and the verdict slides in.
export function PredictLeadingMissing({ t, answer }: StepCtx) {
  return (
    <Svg label="index on (x, y), nothing on x" h={210}>
      <Row y={70} label="predicate on x" value="none" k={easeOut(seg(t, 0.1, 0.6))} />
      <AnswerRow y={130} label="can the index help?" answer={answer} value="yes, badly" k={easeOut(seg(t, 0.5, 1.0))} />
      <Verdict answer={answer} text="the whole index still gets walked" />
    </Svg>
  );
}

// 9 · PostgreSQL 16. Both numbers count up while a scan sweeps the entire index strip.
export function RevealPg16FullScan({ t }: StepCtx) {
  const sw = seg(t, 0.6, 2.6) * 40;
  return (
    <Svg label="PostgreSQL 16: the whole index, regardless" h={190}>
      <Row y={40} label="buffers read" value={num(5468 * easeOut(seg(t, 0.6, 2.6)))} valueColor={C.cherryText} k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={95} label="execution time" value={`${num(40.896 * easeOut(seg(t, 0.8, 2.6)), 3)} ms`} valueColor={C.cherryText} k={easeOut(seg(t, 0.4, 0.9))} />
      <Strip y={125} n={40} o={easeOut(seg(t, 0.3, 0.6))} fill={(i) => (i < sw ? C.cherryText : undefined)} h={22} />
    </Svg>
  );
}

const HOPS = [1, 4, 7, 11, 14, 18, 21, 25, 28, 31, 35, 38];
// 10 · Skip scan. The numbers count up small; a cursor hops along the index, landing twelve targeted searches.
export function RevealSkipScan({ t }: StepCtx) {
  const hop = seg(t, 0.8, 3.2) * HOPS.length;
  const cur = Math.min(HOPS.length - 1, Math.floor(hop));
  const p = hop - Math.floor(hop);
  const x = (i: number) => 25 + (i + 0.5) * (550 / 40);
  const prev = cur > 0 ? HOPS[cur - 1] : HOPS[0];
  const cx = hop >= HOPS.length ? x(HOPS[HOPS.length - 1]) : lerp(x(prev), x(HOPS[cur]), easeInOut(p));
  return (
    <Svg label="same query, same index — PostgreSQL 18" h={200}>
      <Row y={40} label="buffers read" value={num(40 * easeOut(seg(t, 0.8, 3.2)))} valueColor={C.focus} k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={95} label="Index Searches" value={num(Math.min(12, Math.ceil(hop)))} valueColor={C.focus} k={easeOut(seg(t, 0.4, 0.9))} />
      <Strip y={140} n={40} o={easeOut(seg(t, 0.3, 0.6))} fill={(i) => (HOPS.indexOf(i) >= 0 && HOPS.indexOf(i) < hop - 0.5 ? C.focus : undefined)} h={22} />
      {t >= 0.8 && <path d={`M${cx - 6} ${126 - 10 * Math.sin(Math.PI * (hop >= HOPS.length ? 1 : p))} l6 10 l6 -10 z`} fill={C.focus} />}
    </Svg>
  );
}

// 11 · Why it paid off. The index splits into its ten leading values; one search lands in each.
export function RevealSkipScanLimit({ t }: StepCtx) {
  const groups = easeInOut(seg(t, 0.6, 1.4));
  return (
    <Svg label="few leading values made the re-searches pay off" h={200}>
      <Row y={40} label="distinct leading values" value="10" k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={95} label="re-searches, roughly one each" value="12" valueColor={C.focus} k={easeOut(seg(t, 1.6, 2.1))} />
      {Array.from({ length: 10 }, (_, i) => {
        const k = easeOutBack(seg(t, 2.0 + i * 0.15, 2.4 + i * 0.15));
        return (
          <g key={i} opacity={groups}>
            <rect x={25 + i * 55} y={130} width={51} height={30} rx={3} fill={C.cocoa} stroke={C.mocha} />
            <circle cx={50.5 + i * 55} cy={145} r={6 * Math.max(0, k)} fill={C.focus} />
          </g>
        );
      })}
    </Svg>
  );
}

// 12 · Predict: is an index free? After the answer the "?" fills in and the verdict slides in.
export function ProveIndexFree({ t, answer }: StepCtx) {
  return (
    <Svg label="every index sped up some query — is one ever free?" h={210}>
      <Row y={70} label="every index so far" value="made a query faster" k={easeOut(seg(t, 0.1, 0.6))} />
      <AnswerRow y={130} label="is adding one free?" answer={answer} value="no" f={C.cherryText} k={easeOut(seg(t, 0.5, 1.0))} />
      <Verdict answer={answer} text="every write has to keep it in step" />
    </Svg>
  );
}

// 13 · Write cost. The bare load's bar stops at about a fifth; the three-index load grows across.
export function RevealWriteCost({ t }: StepCtx) {
  const k = (i: number) => easeOut(seg(t, 0.2 + i * 1.2, 1.1 + i * 1.2));
  return (
    <Svg label="0 indexes vs. 3 — same 500,000-row load" h={370}>
      {timeBar(30, 90, 1084 / 5190, '1,084 ms', '0 indexes', C.focus, k(0))}
      {timeBar(30, 210, 5190 / 5190, '5,190 ms, +13 MB', '3 indexes', C.cherryText, k(1))}
    </Svg>
  );
}

// 14 · Recap. Four lines rise in one per beat; the last is the one to remember.
export function Recap({ t }: StepCtx) {
  const lines = [
    'lead with the most selective, equality-matched column',
    'match the index to ORDER BY, or pay for a sort',
    'skip scan helps, but only with few leading values',
    'every index costs writes and disk — use sparingly',
  ];
  return (
    <Svg label="recap: column order, selectivity, and what it costs" h={240}>
      {lines.map((l, i) => {
        const k = easeOut(seg(t, 0.2 + i * 0.7, 0.7 + i * 0.7));
        return (
          <T key={l} x={300} y={55 + i * 42 + (1 - k) * 8} s={14} f={i === lines.length - 1 ? C.focus : C.crema} a="middle" o={k}>
            {l}
          </T>
        );
      })}
    </Svg>
  );
}

// 15 · Prove: column order. The index's columns in their built order: the range leads. After the answer the
// two rows swap so the equality column leads, and the verdict lands.
export function ProveOrderMatch({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const sw = answer !== null ? easeInOut(seg(s, 0.2, 0.9)) : 0;
  const moving = sw > 0 && sw < 1;
  return (
    <Svg label="index (order_date, region): range first, equality second" h={220}>
      {!moving && (
        <>
          <Row y={lerp(70, 130, sw)} label={sw >= 1 ? '2nd: order_date' : '1st: order_date'} value="range" valueColor={C.cherryText} k={easeOut(seg(t, 0.1, 0.6))} />
          <Row y={lerp(130, 70, sw)} label={sw >= 1 ? '1st: region' : '2nd: region'} value="equality" valueColor={sw >= 1 ? C.focus : C.crema} k={easeOut(seg(t, 0.5, 1.0))} />
        </>
      )}
      {moving && (
        <>
          <rect x={25} y={lerp(58, 118, sw)} width={550} height={16} rx={3} fill={C.cherryText} opacity={0.3} />
          <rect x={25} y={lerp(118, 58, sw)} width={550} height={16} rx={3} fill={C.focus} opacity={0.3} />
        </>
      )}
      <Verdict answer={answer} text="no: the equality column should lead" y={190} />
    </Svg>
  );
}
