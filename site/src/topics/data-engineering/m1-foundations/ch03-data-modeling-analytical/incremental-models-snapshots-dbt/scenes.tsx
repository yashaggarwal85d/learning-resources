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

/** The lab's ten existing orders' updated_at days, from 3 January to 20 February, as day numbers from 1 January. */
const DAYS = [2, 4, 9, 11, 14, 31, 33, 40, 44, 50];
const dayX = (d: number) => 25 + (d / 52) * 520;

// 1 · Hook. A fact table keeps growing; every run sweeps all of it again; the rebuild bar stretches past the frame.
export function Hook({ t }: StepCtx) {
  const g = easeInOut(seg(t, 0.6, 3.0));
  const rows = Math.round(lerp(3, 14, g));
  const sw = (t * 0.9) % 1;
  return (
    <Svg label="a full rebuild, every run — what happens once that table is far too large for it?" h={250}>
      <Row y={40} label="every run" value="drop it, rebuild it all" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="far too many rows" value="then what?" valueColor={C.cherryText} k={easeOut(seg(t, 3.0, 3.5))} />
      {Array.from({ length: 14 }, (_, i) => (
        <rect key={i} x={25 + (i % 7) * 40} y={118 + Math.floor(i / 7) * 16} width={36} height={12} rx={2} fill={C.latte} opacity={i < rows ? 0.55 : 0} />
      ))}
      {t > 0.6 && <rect x={25 + 276 * sw} y={114} width={3} height={36} fill={C.focus} />}
      <rect x={25} y={180} width={550 * g} height={14} rx={3} fill={g > 0.7 ? C.cherryText : C.latte} opacity={0.6} />
      <T x={25} y={214} s={11} f={C.latte} o={easeOut(seg(t, 0.6, 0.9))}>
        time for one full rebuild
      </T>
    </Svg>
  );
}

// 2 · is_incremental(). The table; when the macro is true, a filter lets only the newest slice through; that slice alone lights.
export function RevealIsIncrementalQuote({ t }: StepCtx) {
  const on = easeOut(seg(t, 1.4, 1.9));
  const sl = easeOut(seg(t, 2.2, 2.8));
  return (
    <Svg label="a macro, true under specific conditions — that condition is the whole mechanism" h={250}>
      <Row y={40} label="is_incremental()" value="true only sometimes" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="that one condition" value="the whole mechanism" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
      <Cell x={25} y={125} w={180} h={30} label="is_incremental()" o={easeOut(seg(t, 0.5, 0.9))} stroke={on > 0 ? C.focus : C.mocha} f={on > 0 ? C.focus : C.crema} />
      <T x={115} y={176} s={12} f={C.focus} a="middle" o={on}>
        true
      </T>
      {Array.from({ length: 10 }, (_, i) => {
        const hit = i >= 8;
        return (
          <rect
            key={i}
            x={265 + i * 31}
            y={130}
            width={27}
            height={60}
            rx={2}
            fill={hit && sl > 0 ? C.focus : C.cocoa}
            fillOpacity={hit && sl > 0 ? 0.2 + 0.4 * sl : 1}
            stroke={hit && sl > 0 ? C.focus : C.mocha}
            strokeWidth={1.2}
            opacity={easeOut(seg(t, 0.6, 1.0))}
          />
        );
      })}
      <line x1={205} y1={140} x2={lerp(205, 513, sl)} y2={140} stroke={C.focus} strokeWidth={1.5} opacity={on} />
      <T x={575} y={214} s={11} f={C.latte} a="end" o={easeOut(seg(t, 2.6, 3.0))}>
        only the newest rows touched
      </T>
    </Svg>
  );
}

// 3 · Predict: widen the window? A time line with the high-water mark and a lookback band; a correction arrives now but is
// dated far back; then the question.
export function PredictLookback({ t, answer }: StepCtx) {
  const w = easeInOut(seg(t, 0.6, 1.4));
  const c = easeOutBack(seg(t, 1.2, 1.6));
  return (
    <Svg label="an old-dated correction arrives late — does a wider lookback window catch it?" h={210}>
      <Row y={40} label="wider lookback" value="catches it always?" k={easeOut(seg(t, 0.1, 0.5))} />
      <line x1={25} y1={80} x2={575} y2={80} stroke={C.latte} strokeWidth={1.5} opacity={easeOut(seg(t, 0.1, 0.4))} />
      <rect x={lerp(520, 300, w)} y={66} width={lerp(30, 250, w)} height={28} rx={3} fill={C.focus} fillOpacity={0.15} stroke={C.focus} strokeWidth={1.2} opacity={easeOut(seg(t, 0.3, 0.6))} />
      <circle cx={80} cy={lerp(56, 80, clamp(c))} r={6} fill={C.cherryText} opacity={clamp(c * 2)} />
      <AnswerRow y={140} label="a wider window" answer={answer} value="no, it can outrun any" f={C.cherryText} k={easeOut(seg(t, 1.4, 1.9))} />
      <Verdict answer={answer} text="an old date can sit past any window" f={C.cherryText} />
    </Svg>
  );
}

// 4 · Four strategies. Four lanes, one small motion each: append stacks a duplicate; delete+insert removes a row and puts it
// back; merge updates a row in place; microbatch splits the table into time batches.
export function RevealStrategies({ t }: StepCtx) {
  const L = ['append', 'delete+insert', 'merge', 'microbatch'];
  const a = (i: number) => easeInOut(seg(t, 0.8 + i * 0.8, 1.5 + i * 0.8));
  const y = (i: number) => 74 + i * 42;
  return (
    <Svg label="the same fact table, four real strategies — appended, deleted and reinserted, merged, batched" h={250}>
      <Row y={40} label="same fact table" value="four real strategies" k={easeOut(seg(t, 0.2, 0.7))} />
      {L.map((l, i) => (
        <g key={l} opacity={easeOut(seg(t, 0.4 + i * 0.1, 0.7 + i * 0.1))}>
          <T x={25} y={y(i) + 18} s={12} f={C.crema}>
            {l}
          </T>
          {[0, 1, 2, 3].map((r) => (
            <rect key={r} x={185 + r * 52} y={y(i) + 4} width={46} height={20} rx={2} fill={C.cocoa} stroke={C.mocha} strokeWidth={1} opacity={i === 1 && r === 3 ? 1 - a(1) * (1 - a(1)) * 4 : 1} />
          ))}
        </g>
      ))}
      <rect x={185 + 4 * 52} y={y(0) + 4} width={46} height={20} rx={2} fill={C.cherryText} opacity={0.5 * a(0)} />
      <rect x={185 + 3 * 52} y={y(1) + 4} width={46} height={20} rx={2} fill={C.focus} opacity={0.5 * clamp((a(1) - 0.5) * 2)} />
      <rect x={185 + 1 * 52} y={y(2) + 4} width={46} height={20} rx={2} fill={C.focus} opacity={0.5 * a(2)} />
      {[0, 1].map((b) => (
        <rect key={b} x={183 + b * 104 + b * 12 * a(3)} y={y(3) + 2} width={100} height={24} rx={3} fill="none" stroke={C.second} strokeWidth={1.5} opacity={a(3)} />
      ))}
      <T x={575} y={y(0) + 18} s={11} f={C.cherryText} a="end" o={a(0)}>
        a duplicate
      </T>
      <T x={575} y={y(1) + 18} s={11} f={C.focus} a="end" o={a(1)}>
        out, back in
      </T>
      <T x={575} y={y(2) + 18} s={11} f={C.focus} a="end" o={a(2)}>
        updated in place
      </T>
      <T x={575} y={y(3) + 18} s={11} f={C.second} a="end" o={a(3)}>
        time batches
      </T>
    </Svg>
  );
}

// 5 · The adapter gap. insert_overwrite swaps one whole partition in a partitioned warehouse; pointed at this project's local
// database, which has no partitions, the line stops at a cross.
export function RevealAdapterGap({ t }: StepCtx) {
  const sw = easeInOut(seg(t, 1.0, 1.6));
  const l = easeInOut(seg(t, 2.2, 2.8));
  return (
    <Svg label="one named strategy, built for partitioned warehouses — this project's own database can't run it" h={250}>
      <Row y={40} label="insert_overwrite" value="replaces partitions" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="this project's database" value="can't run it" valueColor={C.cherryText} k={easeOut(seg(t, 3.0, 3.5))} />
      {[0, 1, 2, 3].map((p) => (
        <rect
          key={p}
          x={25 + p * 66}
          y={125}
          width={58}
          height={40}
          rx={3}
          fill={p === 2 ? C.focus : C.cocoa}
          fillOpacity={p === 2 ? 0.4 * sw : 1}
          stroke={p === 2 && sw > 0 ? C.focus : C.mocha}
          strokeWidth={1.2}
          opacity={easeOut(seg(t, 0.4, 0.8))}
        />
      ))}
      <T x={150} y={185} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 0.4, 0.8))}>
        partitioned warehouse
      </T>
      <Cell x={385} y={195} w={190} h={30} label="local database" o={easeOut(seg(t, 2.0, 2.3))} />
      <path d={`M300 210 H${lerp(300, 360, l)}`} stroke={C.latte} strokeWidth={1.5} opacity={l > 0 ? 1 : 0} />
      <Cross x={370} y={210} k={easeOut(seg(t, 2.8, 3.1))} />
    </Svg>
  );
}

// 6 · The missed correction. The ten orders on a time line; the high-water mark and its one-day lookback; order 11 lands
// inside and is caught; order 1's correction, dated back on 3 January, lands outside and is missed; a full rebuild then sweeps
// the whole line and catches it.
export function RevealMissedCorrection({ t }: StepCtx) {
  const n = easeOutBack(seg(t, 0.9, 1.3));
  const c = easeOutBack(seg(t, 1.6, 2.0));
  const fr = seg(t, 2.6, 3.6);
  const got = fr >= 0.05;
  return (
    <Svg label="an old-dated correction, missed by every lookback strategy — caught only by a full rebuild" h={250}>
      <Row y={40} label="order 1's correction" value="missed by the lookback" valueColor={C.cherryText} k={easeOut(seg(t, 1.8, 2.3))} />
      <Row y={85} label="full rebuild" value="order 1: shipped" valueColor={C.focus} k={easeOut(seg(t, 3.2, 3.7))} />
      <line x1={25} y1={170} x2={575} y2={170} stroke={C.latte} strokeWidth={1.2} opacity={easeOut(seg(t, 0.3, 0.6))} />
      {DAYS.map((d, i) => (
        <circle key={i} cx={dayX(d)} cy={170} r={4} fill={C.latte} opacity={easeOut(seg(t, 0.3 + i * 0.03, 0.5 + i * 0.03))} />
      ))}
      <rect x={dayX(49)} y={152} width={dayX(52) - dayX(49)} height={36} rx={2} fill={C.focus} fillOpacity={0.2} stroke={C.focus} strokeWidth={1.2} opacity={easeOut(seg(t, 0.5, 0.8))} />
      <T x={575} y={206} s={11} f={C.focus} a="end" o={easeOut(seg(t, 0.5, 0.8))}>
        1-day lookback
      </T>
      <circle cx={dayX(51)} cy={lerp(126, 160, clamp(n))} r={6} fill={C.focus} opacity={clamp(n * 2)} />
      <T x={dayX(51)} y={120} s={11} f={C.focus} a="middle" o={clamp(n * 2)}>
        order 11
      </T>
      <circle cx={dayX(2)} cy={lerp(126, 160, clamp(c))} r={6} fill={got ? C.focus : C.cherryText} opacity={clamp(c * 2)} />
      <T x={dayX(2) + 12} y={150} s={11} f={got ? C.focus : C.cherryText} o={clamp(c * 2)}>
        order 1, dated 3 Jan
      </T>
      {fr > 0 && fr < 1 && <rect x={lerp(575, 25, fr)} y={150} width={3} height={40} fill={C.focus} />}
      <T x={25} y={236} s={11} f={C.latte} o={easeOut(seg(t, 0.3, 0.6))}>
        3 Jan
      </T>
      <T x={575} y={236} s={11} f={C.latte} a="end" o={easeOut(seg(t, 0.3, 0.6))}>
        20 Feb
      </T>
    </Svg>
  );
}

// 7 · Predict: a new column just works? The select gains a channel column; then the question.
export function PredictSchemaChange({ t, answer }: StepCtx) {
  const c = easeOut(seg(t, 0.6, 1.1));
  return (
    <Svg label="a new column, added to the select — does the next run just pick it up?" h={210}>
      <Row y={40} label="channel, added" value="picked up next run?" k={easeOut(seg(t, 0.1, 0.5))} />
      {['order_id', 'updated_at', 'status'].map((col, i) => (
        <Cell key={col} x={25 + i * 135} y={60} w={125} h={26} label={col} o={easeOut(seg(t, 0.2, 0.5))} />
      ))}
      <g opacity={c} transform={`translate(${((1 - c) * 20).toFixed(1)} 0)`}>
        <Cell x={430} y={60} w={145} h={26} label="+ channel" stroke={C.focus} f={C.focus} />
      </g>
      <AnswerRow y={140} label="picked up" answer={answer} value="no, silently dropped" f={C.cherryText} k={easeOut(seg(t, 1.4, 1.9))} />
      <Verdict answer={answer} text="by default, with no error at all" f={C.cherryText} />
    </Svg>
  );
}

const STAGES: [string, string, string][] = [
  ['ignore', 'no column, build OK', C.cherryText],
  ['append new columns', '10 rows empty', C.second],
  ['full refresh', '10 rows filled', C.focus],
];

// 8 · Three stages. The same ten rows under each setting: ignore shows no channel column at all; append adds the column but
// every cell empty; full refresh fills all ten.
export function RevealSchemaStages({ t }: StepCtx) {
  return (
    <Svg label="ignore drops it silently; append adds it but leaves old rows empty; only a full rebuild backfills everything" h={250}>
      <Row y={40} label="a new column" value="three real stages" k={easeOut(seg(t, 0.2, 0.7))} />
      {STAGES.map(([l, r, f], i) => {
        const x = 25 + i * 190;
        const k = easeOut(seg(t, 0.8 + i * 0.9, 1.2 + i * 0.9));
        const fill = i === 2 ? easeOut(seg(t, 2.8, 3.6)) : 0;
        return (
          <g key={l} opacity={k}>
            <T x={x + 85} y={78} s={12} f={C.crema} a="middle">
              {l}
            </T>
            {Array.from({ length: 10 }, (_, j) => (
              <g key={j}>
                <rect x={x + 20} y={90 + j * 11} width={80} height={9} rx={1} fill={C.latte} opacity={0.45} />
                {i > 0 && <rect x={x + 106} y={90 + j * 11} width={44} height={9} rx={1} fill={i === 2 && fill * 10 > j ? C.focus : 'none'} stroke={f} strokeWidth={1} opacity={0.8} />}
              </g>
            ))}
            <T x={x + 85} y={222} s={11} f={f} a="middle">
              {r}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

// 9 · Two snapshot strategies. One region change; a time line; the timestamp strategy pins valid-from at the data's own
// change time; the check strategy pins it months later, at the moment the snapshot ran.
export function RevealSnapshotStrategies({ t }: StepCtx) {
  const a = easeOutBack(seg(t, 1.2, 1.7));
  const b = easeOutBack(seg(t, 2.4, 2.9));
  return (
    <Svg label="the same real change, two snapshot strategies — one stamps the data's time, one stamps the run's own time" h={250}>
      <Row y={40} label="timestamp strategy" value="the data's change time" k={easeOut(seg(t, 1.2, 1.7))} />
      <Row y={85} label="check strategy" value="the run's own time" valueColor={C.second} k={easeOut(seg(t, 2.4, 2.9))} />
      <line x1={25} y1={170} x2={575} y2={170} stroke={C.latte} strokeWidth={1.5} opacity={easeOut(seg(t, 0.3, 0.6))} />
      <circle cx={100} cy={lerp(140, 170, clamp(a))} r={7} fill={C.focus} opacity={clamp(a * 2)} />
      <T x={100} y={196} s={11} f={C.focus} a="middle" o={clamp(a * 2)}>
        2026-03-01 10:00
      </T>
      <circle cx={480} cy={lerp(140, 170, clamp(b))} r={7} fill={C.second} opacity={clamp(b * 2)} />
      <T x={480} y={196} s={11} f={C.second} a="middle" o={clamp(b * 2)}>
        2026-10-23 02:40
      </T>
      <T x={300} y={232} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 3.2, 3.6))}>
        one change, two different valid-from values
      </T>
    </Svg>
  );
}

// 10 · Why timestamp is preferred. The check strategy watches a named list of columns; a new column joins the table unwatched,
// red; the timestamp strategy watches one column; both write the valid-from, valid-to pair an earlier topic built by hand.
export function RevealTimestampPreferred({ t }: StepCtx) {
  const nc = easeOut(seg(t, 1.0, 1.4));
  const ts = easeOut(seg(t, 1.8, 2.2));
  const p = easeOut(seg(t, 2.8, 3.3));
  return (
    <Svg label="valid-from, valid-to — the exact columns an earlier topic in this chapter built by hand" h={250}>
      <Row y={40} label="check strategy" value="misses new columns" valueColor={C.cherryText} k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="timestamp strategy" value="watches one column" valueColor={C.focus} k={easeOut(seg(t, 1.8, 2.3))} />
      {['region', 'tier', 'email'].map((c, i) => (
        <Node key={c} x={25 + i * 90} y={118} w={82} label={c} o={easeOut(seg(t, 0.4 + i * 0.1, 0.7 + i * 0.1))} />
      ))}
      <Node x={295} y={118} w={82} label="new col" o={nc} stroke={C.cherryText} f={C.cherryText} dash />
      <Node x={425} y={118} w={150} label="updated_at" o={ts} stroke={C.focus} f={C.focus} />
      <Node x={25} y={190} w={160} label="valid_from" o={p} stroke={C.focus} />
      <Node x={195} y={190} w={160} label="valid_to" o={p} stroke={C.focus} />
      <T x={575} y={207} s={11} f={C.latte} a="end" o={easeOut(seg(t, 3.3, 3.7))}>
        SCD type 2, automated
      </T>
    </Svg>
  );
}

/** A small graph node with an 11px label. */
function Node({
  x,
  y,
  w = 125,
  label,
  o = 1,
  stroke = C.mocha,
  f = C.crema,
  dash = false,
}: {
  x: number;
  y: number;
  w?: number;
  label: string;
  o?: number;
  stroke?: string;
  f?: string;
  dash?: boolean;
}) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={26} rx={4} fill={C.cocoa} stroke={stroke} strokeWidth={1.5} strokeDasharray={dash ? '4 3' : undefined} />
      <T x={x + w / 2} y={y + 17} s={11} f={f} a="middle">
        {label}
      </T>
    </g>
  );
}

// 11 · Recap. Three rows land one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="lookback catches recent corrections only; schema change is silent by default; a snapshot strategy decides what valid-from means" h={220}>
      <Row y={50} label="lookback" value="recent corrections only" k={easeOut(seg(t, 0.8, 1.3))} />
      <Row y={110} label="schema change" value="silent by default" valueColor={C.cherryText} k={easeOut(seg(t, 2.0, 2.5))} />
      <Row y={170} label="snapshot strategy" value="decides valid-from" valueColor={C.focus} k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 12 · Prove: append-only, with old corrections. A time line with rows appended at the end and one correction far back;
// after the answer a key merge takes the new rows and a scheduled full refresh sweeps for the old one, with a tick.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const fr = answer !== null ? seg(s, 0.2, 0.9) : 0;
  const k = answer !== null ? easeOut(seg(s, 0.5, 0.9)) : 0;
  const tick = answer !== null ? easeOut(seg(s, 0.9, 1.3)) : 0;
  return (
    <Svg label="append-only by nature, but occasional months-old corrections — which strategy actually handles both?" h={230}>
      <Row y={40} label="append-only, old fixes" value="which strategy?" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="handles both" answer={answer} value="merge + full refresh" k={easeOut(seg(t, 0.4, 0.9))} />
      <line x1={25} y1={135} x2={575} y2={135} stroke={C.latte} strokeWidth={1.2} opacity={easeOut(seg(t, 0.3, 0.6))} />
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={480 + i * 25} cy={135} r={5} fill={C.crema} opacity={easeOut(seg(t, 0.5 + i * 0.1, 0.7 + i * 0.1))} />
      ))}
      <circle cx={80} cy={135} r={6} fill={fr >= 1 ? C.focus : C.cherryText} opacity={easeOut(seg(t, 0.9, 1.2))} />
      {fr > 0 && fr < 1 && <rect x={lerp(575, 25, fr)} y={120} width={3} height={30} fill={C.focus} />}
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, k)} s={15} f={C.focus} a="middle" o={k}>
            by key, plus a scheduled full refresh
          </T>
          <rect x={150} y={202} width={300 * tick} height={3} fill={C.focus} />
          <Tick y={162} k={tick} />
        </>
      )}
    </Svg>
  );
}
