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

/** Twelve rows' values in physical order: one column matched to row order, one scattered across it. */
/** A cell with a centred label. */
function Cell({ x, y, w, h = 28, label, o = 1, stroke = C.mocha, f = C.crema }: { x: number; y: number; w: number; h?: number; label: string; o?: number; stroke?: string; f?: string }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={C.cocoa} stroke={stroke} strokeWidth={1.5} />
      <T x={x + w / 2} y={y + h / 2 + 4.5} s={12} f={f} a="middle">
        {label}
      </T>
    </g>
  );
}
/** A small cross drawn by `k`. */
function Cross({ x, y, k }: { x: number; y: number; k: number }) {
  return <path d={`M${x - 7} ${y - 7} l14 14 m0 -14 l-14 14`} stroke={C.cherryText} strokeWidth={2.5} opacity={k} />;
}

/** A small tick at (x, y), drawn by `k`. */
function MiniTick({ x, y, k, f = C.focus }: { x: number; y: number; k: number; f?: string }) {
  return <path d={`M${x} ${y} l4 4 l8 -9`} fill="none" stroke={f} strokeWidth={2} strokeDasharray="20" strokeDashoffset={20 * (1 - k)} />;
}
/** A small padlock at (x, y), drawn in by `k`. */
function Lock({ x, y, k, f = C.second }: { x: number; y: number; k: number; f?: string }) {
  return (
    <g opacity={k}>
      <path d={`M${x + 3} ${y} v-4 a5 5 0 0 1 10 0 v4`} fill="none" stroke={f} strokeWidth={2} />
      <rect x={x} y={y} width={16} height={12} rx={2} fill={f} />
    </g>
  );
}
/** A request arrow from (x1, y) toward x2, drawn by `k`, with a small label above it. */
function Req({ x1, x2, y, k, label, f = C.crema, back = 0 }: { x1: number; x2: number; y: number; k: number; label?: string; f?: string; back?: number }) {
  const x = lerp(x1, x2, k) - (x2 - x1) * 0.35 * back;
  return (
    <g opacity={k > 0 ? 1 : 0}>
      <line x1={x1} y1={y} x2={x} y2={y} stroke={f} strokeWidth={1.8} />
      <path d={`M${x} ${y} l${back > 0 ? 8 : -8} -5 v10 z`} fill={f} />
      {label && (
        <T x={(x1 + x2) / 2} y={y - 9} s={11} f={f} a="middle">
          {label}
        </T>
      )}
    </g>
  );
}

/** The two eras' files along a day axis: days 1 to 3 as one day-file each under the old spec, days 4 and 5 split into
 * four hour-files each under the new spec. `lit(day, slot)` picks a stroke; `o` fades everything. */
function Eras({ y, o, lit, tag = 0, tagN, od }: { y: number; o: number; lit?: (d: number, h: number) => string | undefined; tag?: number; tagN?: number; od?: (d: number) => number }) {
  const out = [];
  for (let d = 1; d <= 5; d++) {
    const x = 25 + (d - 1) * 110;
    const dd = o * (od ? od(d) : 1);
    if (d <= 3) {
      const s = lit?.(d, 0);
      out.push(<rect key={d} x={x} y={y} width={96} height={40} rx={3} fill={C.cocoa} stroke={s ?? C.latte} strokeWidth={s ? 2.4 : 1.3} opacity={dd} />);
    } else {
      for (let h = 0; h < 4; h++) {
        const s = lit?.(d, h);
        out.push(<rect key={`${d}-${h}`} x={x + h * 24} y={y} width={21} height={40} rx={2} fill={C.cocoa} stroke={s ?? C.second} strokeWidth={s ? 2.4 : 1.3} opacity={dd} />);
      }
    }
    out.push(
      <T key={'d' + d} x={x + 48} y={y + 58} s={11} f={C.latte} a="middle" o={dd}>
        {`day ${d}`}
      </T>,
    );
  }
  return (
    <g>
      {out}
      <T x={25} y={y - 10} s={11} f={C.latte} o={tag}>
        old spec: day(ts)
      </T>
      <T x={355} y={y - 10} s={11} f={C.second} o={tagN ?? tag}>
        new spec: hour(ts), bucket
      </T>
    </g>
  );
}

// 1 · Hook. A file row with partition tuples; a query naming the partition column is crossed; a query naming the real
// column passes through and prunes.
export function Hook({ t }: StepCtx) {
  return (
    <Svg label="the tree already prunes by partition tuple -- but only if the query never has to name the column." h={200}>
      {[0, 1, 2, 3, 4].map((i) => (
        <rect
          key={i}
          x={25 + i * 60}
          y={40}
          width={48}
          height={60}
          rx={3}
          fill={C.cocoa}
          stroke={i === 2 && t > 3.0 ? C.focus : C.latte}
          strokeWidth={1.4}
          opacity={easeOut(seg(t, 0.1 + i * 0.1, 0.4 + i * 0.1)) * (t > 3.0 && i !== 2 ? 0.35 : 1)}
        />
      ))}
      <T x={25} y={125} s={11} f={C.latte} o={easeOut(seg(t, 0.5, 0.8))}>
        files, pruned by partition tuple
      </T>
      <Cell x={340} y={30} w={235} h={28} label="WHERE ts_day = ..." o={easeOut(seg(t, 1.0, 1.3))} />
      <Cross x={560} y={44} k={easeOut(seg(t, 1.6, 1.9))} />
      <Cell x={340} y={80} w={235} h={28} label="WHERE event_time = ..." stroke={C.focus} o={easeOut(seg(t, 2.2, 2.5))} />
      <T x={340} y={130} s={12} f={C.focus} o={easeOut(seg(t, 2.7, 3.0))}>
        name the column only
      </T>
      <T x={25} y={180} s={14} f={C.crema} o={easeOut(seg(t, 3.6, 4.0))}>
        hidden partitioning
      </T>
    </Svg>
  );
}

// 2 · Predict. event_time feeds day() to make the partition value; a query filters event_time itself; the answer: yes.
export function PredictFilterOnSourceColumn({ t, answer }: StepCtx) {
  return (
    <Svg label="a table partitioned by day(event_time) -- a query filters on event_time directly, never the partition." h={200}>
      <Cell x={25} y={30} w={140} h={30} label="event_time" o={easeOut(seg(t, 0.1, 0.4))} />
      <Req x1={167} x2={238} y={45} k={easeOut(seg(t, 0.5, 0.9))} />
      <Cell x={240} y={30} w={100} h={30} label="day()" stroke={C.second} o={easeOut(seg(t, 0.7, 1.0))} />
      <Req x1={342} x2={413} y={45} k={easeOut(seg(t, 1.0, 1.4))} />
      <Cell x={415} y={30} w={160} h={30} label="partition" o={easeOut(seg(t, 1.2, 1.5))} />
      <T x={25} y={95} s={12} f={C.focus} o={easeOut(seg(t, 1.7, 2.0))}>
        query: WHERE event_time = ...
      </T>
      <AnswerRow y={145} label="does it still prune" answer={answer} value="yes" k={easeOut(seg(t, 2.3, 2.8))} />
      <Verdict answer={answer} y={188} text="the table translates the filter itself" />
    </Svg>
  );
}

// 3 · Transforms. One source column fans out to the five transforms, each landing a derived-value pip; the query side
// shows only the column name.
export function RevealTransformsHidePartitionColumn({ t }: StepCtx) {
  const tr = ['identity', 'bucket[N]', 'truncate[W]', 'day', 'hour'];
  return (
    <Svg label="reproduced for real: Iceberg derives the partition value by a transform it tracks itself." h={230}>
      <Cell x={25} y={90} w={110} h={30} label="a column" o={easeOut(seg(t, 0.1, 0.4))} />
      {tr.map((n, i) => {
        const y = 20 + i * 40;
        const b = 0.5 + i * 0.35;
        return (
          <g key={n}>
            <line x1={137} y1={105} x2={lerp(137, 218, easeOut(seg(t, b, b + 0.3)))} y2={lerp(105, y + 14, easeOut(seg(t, b, b + 0.3)))} stroke={C.mocha} strokeWidth={1.4} />
            <Cell x={220} y={y} w={140} h={28} label={n} stroke={C.second} o={easeOut(seg(t, b + 0.2, b + 0.5))} />
            <Req x1={362} x2={405} y={y + 14} k={easeOut(seg(t, b + 0.5, b + 0.8))} f={C.second} />
            <circle cx={420} cy={y + 14} r={6} fill={C.second} opacity={easeOut(seg(t, b + 0.7, b + 0.9))} />
          </g>
        );
      })}
      <T x={445} y={95} s={11} f={C.latte} o={easeOut(seg(t, 2.5, 2.8))}>
        tracked by
      </T>
      <T x={445} y={117} s={11} f={C.latte} o={easeOut(seg(t, 2.6, 2.9))}>
        the table
      </T>
      <T x={25} y={221} s={12} f={C.focus} o={easeOut(seg(t, 3.6, 4.0))}>
        the query never repeats the rule
      </T>
    </Svg>
  );
}

// 4 · Spec evolved. Days 1 to 3 land as one day-file each; a boundary drops; days 4 and 5 land split into hour-files under
// the new spec; nothing behind the boundary changes.
export function RevealSpecEvolvedMidLife({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: a table's partition spec evolved mid-life, from day(ts) to hour(ts) plus a bucket." h={230}>
      <Eras
        y={60}
        o={1}
        tag={easeOut(seg(t, 0.2, 0.5))}
        tagN={easeOut(seg(t, 2.0, 2.3))}
        od={(d) => (d <= 3 ? easeOut(seg(t, 0.2 + d * 0.3, 0.5 + d * 0.3)) : easeOut(seg(t, 2.1 + (d - 4) * 0.4, 2.5 + (d - 4) * 0.4)))}
      />
      <line x1={342} y1={30} x2={342} y2={lerp(30, 130, easeOut(seg(t, 1.6, 2.0)))} stroke={C.focus} strokeWidth={2.5} strokeDasharray="5 4" />
      <T x={25} y={175} s={12} f={C.crema} o={easeOut(seg(t, 3.0, 3.3))}>
        spec changed partway through the table's life
      </T>
      <T x={25} y={205} s={13} f={C.focus} o={easeOut(seg(t, 3.6, 4.0))}>
        not one existing file rewritten
      </T>
    </Svg>
  );
}

// 5 · Old data untouched. The old era's files get padlocked, each tagged with the old spec; the new era stays as it is.
export function RevealOldDataUntouched({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: the old era's files are still on disk, still tagged with the old spec id." h={230}>
      <Eras y={60} o={easeOut(seg(t, 0.1, 0.4))} tag={easeOut(seg(t, 0.1, 0.4))} lit={(d) => (d <= 3 && t > 1.0 + d * 0.3 ? C.latte : undefined)} />
      {[1, 2, 3].map((d) => (
        <Lock key={d} x={25 + (d - 1) * 110 + 40} y={150} k={easeOut(seg(t, 1.0 + d * 0.3, 1.3 + d * 0.3))} />
      ))}
      <T x={25} y={190} s={12} f={C.latte} o={easeOut(seg(t, 2.4, 2.7))}>
        still on disk, still tagged with the old spec id
      </T>
      <T x={25} y={218} s={13} f={C.focus} o={easeOut(seg(t, 3.4, 3.8))}>
        evolving the spec touched zero existing data
      </T>
    </Svg>
  );
}

// 6 · Predict. A query by id; the matching row sits in day 2, under the old spec; the answer: one file.
export function PredictOldEraPruning({ t, answer }: StepCtx) {
  return (
    <Svg label="a query by id, never naming any transform -- the match lives in the old era, under the old spec. still prunes?" h={200}>
      <Eras y={30} o={easeOut(seg(t, 0.1, 0.4))} lit={(d) => (d === 2 && t > 1.2 ? C.second : undefined)} />
      <T x={25} y={22} s={11} f={C.focus} o={easeOut(seg(t, 0.8, 1.1))}>
        WHERE id = ... (its row is in the old era)
      </T>
      <AnswerRow y={140} label="it prunes to" answer={answer} value="one file" k={easeOut(seg(t, 2.0, 2.5))} />
      <Verdict answer={answer} y={188} text="each file keeps its own spec" />
    </Svg>
  );
}

// 7 · Both eras prune. Two passes: an id in the old era lights one day-file, every other file fading; an id in the new era
// lights one hour-file the same way; each planned under the spec its manifest was written with.
export function RevealBothErasPrune({ t }: StepCtx) {
  const p1 = t > 0.8 && t < 2.3;
  const p2 = t >= 2.6;
  return (
    <Svg label="reproduced for real: a source-column query prunes to one file, in either era, under its own spec." h={230}>
      <Eras y={50} o={1} tag={1} lit={(d, h) => (p1 && d === 2 ? C.focus : p2 && d === 5 && h === 1 ? C.focus : p1 || p2 ? C.mocha : undefined)} />
      <T x={25} y={150} s={12} f={C.focus} o={easeOut(seg(t, 1.0, 1.3)) * (1 - seg(t, 2.2, 2.4))}>
        old era: 1 file, by the old spec
      </T>
      <T x={25} y={180} s={12} f={C.focus} o={easeOut(seg(t, 2.8, 3.1))}>
        new era: 1 file, by the new spec
      </T>
      <T x={25} y={215} s={12} f={C.latte} o={easeOut(seg(t, 3.6, 4.0))}>
        each manifest planned under its own spec
      </T>
    </Svg>
  );
}

// 8 · v3 multi-argument. Two source columns feed one transform and one partition field; dashed, as an extension named
// here and not built.
export function RevealV3MultiArgument({ t }: StepCtx) {
  return (
    <Svg label="v3 extends this with multi-argument transforms -- more than one source column, one partition field." h={230}>
      <Cell x={25} y={40} w={130} h={30} label="column a" o={easeOut(seg(t, 0.2, 0.5))} />
      <Cell x={25} y={120} w={130} h={30} label="column b" o={easeOut(seg(t, 0.6, 0.9))} />
      <line x1={157} y1={55} x2={lerp(157, 258, easeOut(seg(t, 1.0, 1.5)))} y2={lerp(55, 95, easeOut(seg(t, 1.0, 1.5)))} stroke={C.second} strokeWidth={1.6} />
      <line x1={157} y1={135} x2={lerp(157, 258, easeOut(seg(t, 1.2, 1.7)))} y2={lerp(135, 95, easeOut(seg(t, 1.2, 1.7)))} stroke={C.second} strokeWidth={1.6} />
      <rect x={260} y={78} width={130} height={34} rx={4} fill="none" stroke={C.second} strokeWidth={2} strokeDasharray="5 4" opacity={easeOut(seg(t, 1.6, 2.0))} />
      <T x={325} y={100} s={12} f={C.second} a="middle" o={easeOut(seg(t, 1.6, 2.0))}>
        one transform
      </T>
      <Req x1={392} x2={440} y={95} k={easeOut(seg(t, 2.2, 2.6))} f={C.second} />
      <Cell x={445} y={80} w={130} h={30} label="one field" stroke={C.second} o={easeOut(seg(t, 2.4, 2.8))} />
      <T x={25} y={205} s={12} f={C.latte} o={easeOut(seg(t, 3.4, 3.8))}>
        a v3 extension, named here, not built
      </T>
    </Svg>
  );
}

// 9 · Full scan. Every file in both eras lights, day by day, left to right; a tick: every row, read correctly.
export function RevealFullScanBothEras({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: a full scan across both eras reads every row correctly." h={230}>
      <Eras y={50} o={1} tag={1} lit={(d) => (t > 0.6 + d * 0.4 ? C.focus : undefined)} />
      <MiniTick x={25} y={160} k={easeOut(seg(t, 3.0, 3.3))} />
      <T x={45} y={168} s={13} f={C.focus} o={easeOut(seg(t, 3.1, 3.4))}>
        every row, both eras, read correctly
      </T>
      <T x={25} y={210} s={12} f={C.latte} o={easeOut(seg(t, 3.7, 4.1))}>
        the retired spec still reads under its own terms
      </T>
    </Svg>
  );
}

// 10 · Recap.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="hidden partitioning: the query names a column, never a transform -- and evolution never rewrites old data." h={250}>
      <Row y={40} label="a query names" value="a column, not a rule" k={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={100} label="a spec change" value="no old file rewritten" valueColor={C.focus} k={easeOut(seg(t, 1.2, 1.6))} />
      <Row y={160} label="each manifest" value="its own spec" valueColor={C.second} k={easeOut(seg(t, 2.2, 2.6))} />
    </Svg>
  );
}
