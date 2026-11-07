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

/** The price table's four rows as cells: state, city, price; `bad` marks the one row whose price breaks the range. */
function PriceRows({ x, y, prices, t, t0, bad = -1 }: { x: number; y: number; prices: number[]; t: number; t0: number; bad?: number }) {
  const cities = ['FL, Orlando', 'FL, Tampa', 'CA, San Francisco', 'CA, Los Angeles'];
  return (
    <g>
      {cities.map((c, i) => {
        const o = easeOut(seg(t, t0 + i * 0.1, t0 + i * 0.1 + 0.3));
        return (
          <g key={c} opacity={o}>
            <T x={x} y={y + i * 20} s={11} f={C.latte}>
              {c}
            </T>
            <T x={x + 190} y={y + i * 20} s={12} f={i === bad ? C.cherryText : C.crema} a="end">
              {String(prices[i])}
            </T>
          </g>
        );
      })}
    </g>
  );
}

// 1 · Hook. A tested input space drawn as a bounded patch; live inputs arrive from every direction, most of them landing outside
// it, at an edge nothing has guarded yet.
export function Hook({ t }: StepCtx) {
  return (
    <Svg label="tests prove a client correct on the inputs it was given — what checks every input nobody thought to write?" h={220}>
      <Row y={40} label="tested inputs" value="chosen ahead of time" k={easeOut(seg(t, 0.3, 0.8))} />
      <rect x={60} y={80} width={160} height={90} rx={8} fill={C.cocoa} stroke={C.focus} strokeWidth={1.5} opacity={easeOut(seg(t, 0.5, 0.9))} />
      <T x={140} y={130} s={12} f={C.focus} a="middle" o={easeOut(seg(t, 0.7, 1.0))}>
        tested
      </T>
      {Array.from({ length: 14 }, (_, i) => {
        const p = easeOut(seg(t, 1.2 + i * 0.12, 1.8 + i * 0.12));
        const x = 260 + ((i * 53) % 290);
        const y = 75 + ((i * 37) % 100);
        return <circle key={i} cx={lerp(590, x, p)} cy={y} r={5} fill={C.cherryText} opacity={p * 0.85} />;
      })}
      <Row y={205} label="live inputs" value="nobody wrote these" valueColor={C.cherryText} k={easeOut(seg(t, 3.3, 3.8))} />
    </Svg>
  );
}

// 2 · Record validation. One declared shape; the good record's string fields are coerced into int and float; the bad record's
// id is rejected, and the error points at that one field.
export function RevealRecordValidation({ t }: StepCtx) {
  return (
    <Svg label="one record, one declared shape — does it coerce cleanly, or fail with exactly where it's wrong?" h={240}>
      <Cell x={25} y={30} w={550} label="Record: id int, name str, amount float" stroke={C.second} f={C.second} o={easeOut(seg(t, 0.2, 0.6))} />
      <Cell x={25} y={76} w={260} label='"42", "widget", "19.99"' o={easeOut(seg(t, 0.7, 1.0))} />
      <path d="M290 90 H315" stroke={C.latte} strokeWidth={1.5} opacity={easeOut(seg(t, 1.0, 1.2))} />
      <Cell x={320} y={76} w={255} label="42, widget, 19.99" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 1.2, 1.6))} />
      <Cell x={25} y={122} w={260} label='"not-an-id", …' o={easeOut(seg(t, 1.9, 2.2))} />
      <Cross x={302} y={136} k={easeOut(seg(t, 2.3, 2.6))} />
      <Cell x={320} y={122} w={255} label="ValidationError: id" stroke={C.cherryText} f={C.cherryText} o={easeOut(seg(t, 2.6, 3.0))} />
      <Row y={210} label="the error names" value="the exact field" valueColor={C.focus} k={easeOut(seg(t, 3.3, 3.8))} />
    </Svg>
  );
}

// 3 · At scale. 20,000 records run through the same check, then 40,000; the second bar grows to about twice the first and no
// further.
export function RevealScale({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.6, 1.6));
  const b = easeOut(seg(t, 1.8, 3.0));
  return (
    <Svg label="twice as many records through the same record check — does the cost grow in proportion, or worse?" h={230}>
      <Row y={40} label="same record check" value="twice the records" k={easeOut(seg(t, 0.2, 0.7))} />
      <T x={25} y={86} s={12} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        20,000 records
      </T>
      <rect x={160} y={76} width={190 * a} height={14} rx={2} fill={C.second} opacity={0.85} />
      <T x={25} y={126} s={12} f={C.latte} o={easeOut(seg(t, 1.6, 1.9))}>
        40,000 records
      </T>
      <rect x={160} y={116} width={380 * b} height={14} rx={2} fill={C.focus} opacity={0.85} />
      <line x1={350} y1={70} x2={350} y2={136} stroke={C.latte} strokeWidth={1} strokeDasharray="3 3" opacity={easeOut(seg(t, 2.4, 2.7))} />
      <T x={160} y={156} s={11} f={C.latte} o={easeOut(seg(t, 2.8, 3.1))}>
        about twice the first, no steeper
      </T>
      <Row y={205} label="the cost" value="tracks record count" valueColor={C.focus} k={easeOut(seg(t, 3.3, 3.8))} />
    </Svg>
  );
}

// 4 · Predict: one schema, two libraries? One schema card on the left; a pandas table and a Polars table on the right, each
// asking whether it needs its own; then the question.
export function PredictTwoBackends({ t, answer }: StepCtx) {
  return (
    <Svg label="the same column checks, written once — does validating a different DataFrame library need a second schema?" h={210}>
      <Row y={40} label="one schema, written once" value="a second needed?" k={easeOut(seg(t, 0.1, 0.5))} />
      <Cell x={25} y={64} w={200} label="state, city, price 5–20" stroke={C.second} f={C.second} o={easeOut(seg(t, 0.2, 0.5))} />
      <Cell x={315} y={64} w={120} label="pandas" o={easeOut(seg(t, 0.4, 0.7))} />
      <Cell x={455} y={64} w={120} label="Polars" o={easeOut(seg(t, 0.6, 0.9))} />
      <AnswerRow y={140} label="a second schema" answer={answer} value="no, the same one" k={easeOut(seg(t, 1.2, 1.7))} />
      <Verdict answer={answer} text="one declaration covers both tables" />
    </Svg>
  );
}

// 5 · Two real backends. The schema checks the pandas DataFrame's four rows, then the Polars frame's same four rows; both
// come back ticked, 4 rows each.
export function RevealTwoBackends({ t }: StepCtx) {
  return (
    <Svg label="one schema definition, checked against a real pandas DataFrame and a real Polars frame — does either reject it?" h={240}>
      <Cell x={150} y={30} w={300} label="price: int, between 5 and 20" stroke={C.second} f={C.second} o={easeOut(seg(t, 0.2, 0.6))} />
      <T x={25} y={86} s={12} f={C.latte} o={easeOut(seg(t, 0.6, 0.9))}>
        pandas
      </T>
      <PriceRows x={25} y={106} prices={[8, 12, 16, 18]} t={t} t0={0.7} />
      <T x={325} y={86} s={12} f={C.latte} o={easeOut(seg(t, 1.6, 1.9))}>
        Polars
      </T>
      <PriceRows x={325} y={106} prices={[8, 12, 16, 18]} t={t} t0={1.7} />
      <MiniTick x={240} y={78} k={easeOut(seg(t, 1.3, 1.6))} />
      <MiniTick x={540} y={78} k={easeOut(seg(t, 2.4, 2.7))} />
      <Row y={210} label="both backends" value="4 rows, valid" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
    </Svg>
  );
}

// 6 · A real violation. The same four rows, but Los Angeles' price is now 999; the range check stops on that one value and the
// error names the price column.
export function RevealCatchesViolation({ t }: StepCtx) {
  const h = easeOut(seg(t, 1.6, 2.0));
  return (
    <Svg label="one column value outside the declared range — does the schema catch it, or quietly let it through?" h={240}>
      <Row y={40} label="price range" value="5 to 20" k={easeOut(seg(t, 0.2, 0.7))} />
      <PriceRows x={25} y={80} prices={[8, 12, 16, 999]} t={t} t0={0.5} bad={3} />
      <rect x={20} y={128} width={205} height={18} rx={3} fill="none" stroke={C.cherryText} strokeWidth={1.5} opacity={h} />
      <Cross x={245} y={137} k={easeOut(seg(t, 2.0, 2.3))} />
      <Cell x={300} y={124} w={275} label="SchemaError: price" stroke={C.cherryText} f={C.cherryText} o={easeOut(seg(t, 2.4, 2.8))} />
      <Row y={205} label="the row" value="rejected, column named" valueColor={C.focus} k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 7 · Row versus batch. 50,000 values: the loop checks one at a time, its bar crawling the whole way; the vectorized check runs
// once over the column and stops at a fraction of that.
export function RevealRowVsBatch({ t }: StepCtx) {
  const a = easeInOut(seg(t, 0.6, 2.6));
  const b = easeOut(seg(t, 2.8, 3.2));
  return (
    <Svg label="the same range check, once per value in a loop vs. once across the whole column — how much does that cost, measured?" h={230}>
      <Row y={40} label="50,000 values" value="the same range check" k={easeOut(seg(t, 0.2, 0.7))} />
      <T x={25} y={86} s={12} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        a loop
      </T>
      <rect x={200} y={76} width={360 * a} height={14} rx={2} fill={C.cherryText} opacity={0.75} />
      {Array.from({ length: 20 }, (_, i) => (
        <rect key={i} x={200 + i * 18} y={94} width={2} height={6} fill={C.latte} opacity={a * 20 > i ? 0.8 : 0} />
      ))}
      <T x={25} y={126} s={12} f={C.latte} o={easeOut(seg(t, 2.6, 2.9))}>
        one vectorized pass
      </T>
      <rect x={200} y={116} width={60 * b} height={14} rx={2} fill={C.focus} opacity={0.85} />
      <Row y={200} label="the loop" value="several times the cost" valueColor={C.cherryText} k={easeOut(seg(t, 3.4, 3.9))} />
    </Svg>
  );
}

// 8 · Named, not run. Two sourced frameworks in dashed boxes: declared checks with a Checkpoint, and a YAML scan against a
// live source. Both sit downstream, after the data has landed.
export function RevealNamedNotRun({ t }: StepCtx) {
  return (
    <Svg label="a framework built around checks and a Checkpoint vs. one built around a YAML scan — which actually runs here?" h={230}>
      <Row y={40} label="two production tools" value="named, not run" valueColor={C.latte} k={easeOut(seg(t, 0.2, 0.7))} />
      {[
        ['Great Expectations', 'checks + a Checkpoint'],
        ['Soda', 'a YAML scan of a source'],
      ].map(([n, d], i) => (
        <g key={n} opacity={easeOut(seg(t, 0.8 + i * 0.9, 1.2 + i * 0.9))}>
          <rect x={25 + i * 285} y={66} width={265} height={66} rx={6} fill="none" stroke={C.second} strokeWidth={1.5} strokeDasharray="5 4" />
          <T x={157 + i * 285} y={92} s={13} f={C.second} a="middle">
            {n}
          </T>
          <T x={157 + i * 285} y={116} s={11} f={C.latte} a="middle">
            {d}
          </T>
        </g>
      ))}
      <path d={`M25 152 H${25 + 550 * easeOut(seg(t, 2.6, 3.2))}`} stroke={C.latte} strokeWidth={1.5} />
      <T x={25} y={172} s={11} f={C.latte} o={easeOut(seg(t, 2.8, 3.1))}>
        on data that has already landed
      </T>
      <Row y={210} label="this sandbox" value="sources, not runs" k={easeOut(seg(t, 3.4, 3.9))} />
    </Svg>
  );
}

// 9 · Recap. Five rows land one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a coerced record, a scaled check, one schema on two backends, a measured cost gap, and a named production scan" h={250}>
      <Row y={35} label="a record check" value="coerces or rejects" k={easeOut(seg(t, 0.4, 0.9))} />
      <Row y={80} label="its cost" value="tracks record count" k={easeOut(seg(t, 1.1, 1.6))} />
      <Row y={125} label="one table schema" value="two backends" valueColor={C.focus} k={easeOut(seg(t, 1.8, 2.3))} />
      <Row y={170} label="row by row" value="costs more than batch" valueColor={C.cherryText} k={easeOut(seg(t, 2.5, 3.0))} />
      <Row y={215} label="a production scan" value="named, not run" valueColor={C.latte} k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 10 · Prove: what's misplaced? A per-record loop at the boundary and a second check right behind it; after the answer the
// loop becomes one batch check, and the governance tool moves downstream.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const k = (i: number) => (answer !== null ? easeOut(seg(s, 0.1 + i * 0.3, 0.5 + i * 0.3)) : 0);
  const v = answer !== null ? easeOut(seg(s, 0.9, 1.3)) : 0;
  return (
    <Svg label="a record-by-record loop over a whole batch, plus a downstream governance re-check — what's misplaced, and where should each check sit?" h={230}>
      <Row y={40} label="a loop, then a re-check" value="what's misplaced?" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="more checks, safer" answer={answer} value="no, both misplaced" f={C.cherryText} k={easeOut(seg(t, 0.4, 0.9))} />
      <Cell x={25} y={110} w={260} label="record check in a loop" stroke={C.cherryText} o={easeOut(seg(t, 0.6, 0.9))} />
      <Cell x={315} y={110} w={260} label="the same check, again" stroke={C.cherryText} o={easeOut(seg(t, 0.8, 1.1))} />
      {['one batch schema check', 'governance, downstream'].map((l, i) => (
        <T key={l} x={155 + i * 290} y={lerp(168, 160, k(i))} s={12} f={C.focus} a="middle" o={k(i)}>
          {l}
        </T>
      ))}
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, v)} s={15} f={C.focus} a="middle" o={v}>
            each check in its own place
          </T>
          <rect x={150} y={202} width={300 * v} height={3} fill={C.focus} />
        </>
      )}
    </Svg>
  );
}
