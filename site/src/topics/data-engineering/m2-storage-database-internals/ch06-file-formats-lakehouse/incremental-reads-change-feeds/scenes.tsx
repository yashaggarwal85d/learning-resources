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

/** A file as a column of `n` row slots at (x, y); `mark(i)` returns a stroke for slot i, or undefined for the plain one. */
function RowFile({
  x,
  y,
  n = 10,
  o = 1,
  name,
  mark,
  w = 46,
  rh = 13,
}: {
  x: number;
  y: number;
  n?: number;
  o?: number;
  name?: string;
  mark?: (i: number) => string | undefined;
  w?: number;
  rh?: number;
}) {
  return (
    <g opacity={o}>
      {name && (
        <T x={x} y={y - 8} s={11} f={C.latte}>
          {name}
        </T>
      )}
      {Array.from({ length: n }, (_, i) => {
        const m = mark?.(i);
        return <rect key={i} x={x} y={y + i * rh} width={w} height={rh - 3} rx={1.5} fill={C.cocoa} stroke={m ?? C.latte} strokeWidth={m ? 2 : 1} />;
      })}
    </g>
  );
}

// 1 · Hook. Three snapshot markers on a line; a bracket spans the gap between two of them, and a question rises from it.
export function Hook({ t }: StepCtx) {
  return (
    <Svg label="a well-laid-out table of snapshots is still just a sequence of point-in-time states." h={200}>
      <line x1={25} y1={90} x2={lerp(25, 560, easeInOut(seg(t, 0.1, 1.0)))} y2={90} stroke={C.mocha} strokeWidth={2} />
      {[0, 1, 2].map((i) => (
        <g key={i} opacity={easeOut(seg(t, 0.4 + i * 0.3, 0.7 + i * 0.3))}>
          <circle cx={100 + i * 190} cy={90} r={14} fill={C.cocoa} stroke={C.latte} strokeWidth={2} />
          <T x={100 + i * 190} y={125} s={11} f={C.latte} a="middle">
            full state
          </T>
        </g>
      ))}
      <path d="M100 64 v-10 h190 v10" fill="none" stroke={C.second} strokeWidth={2} strokeDasharray="230" strokeDashoffset={230 * (1 - easeInOut(seg(t, 1.8, 2.6)))} />
      <T x={195} y={40} s={14} f={C.second} a="middle" o={easeOut(seg(t, 2.6, 3.0))}>
        what changed?
      </T>
      <T x={300} y={175} s={13} f={C.crema} a="middle" o={easeOut(seg(t, 3.5, 3.9))}>
        the sequence itself is data
      </T>
    </Svg>
  );
}

// 2 · Predict. Two files' rows slide together into one merged file, values untouched; the answer: a long list.
export function PredictCompactionZeroOrSpurious({ t, answer }: StepCtx) {
  const m = easeInOut(seg(t, 0.8, 1.8));
  return (
    <Svg label="a compaction merges two files, touching no row's value -- does a changelog scan report zero changes?" h={200}>
      {[0, 1].map((f) =>
        Array.from({ length: 5 }, (_, i) => (
          <rect
            key={f * 10 + i}
            x={lerp(25 + f * 70, 250, m)}
            y={lerp(30 + i * 14, 30 + (f * 5 + i) * 10, m)}
            width={50}
            height={lerp(11, 8, m)}
            rx={1.5}
            fill={C.cocoa}
            stroke={C.latte}
            strokeWidth={1}
            opacity={easeOut(seg(t, 0.1, 0.4))}
          />
        )),
      )}
      <T x={25} y={115} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        two files
      </T>
      <T x={250} y={145} s={11} f={C.latte} o={easeOut(seg(t, 1.6, 1.9))}>
        one file, no value changed
      </T>
      <T x={430} y={80} s={16} f={C.second} o={easeOut(seg(t, 2.0, 2.3))}>
        changes?
      </T>
      <AnswerRow y={172} label="a file-diff scan reports" answer={answer} value="a long list" k={easeOut(seg(t, 2.4, 2.9))} f={C.cherryText} />
    </Svg>
  );
}

// 3 · Row lineage. One row card carries _row_id and _last_updated_sequence_number; it moves to a new file and both stay;
// then its value is edited and only the sequence number moves forward.
export function RevealRowLineageFields({ t }: StepCtx) {
  const mv = easeInOut(seg(t, 1.2, 2.0));
  const ed = easeOut(seg(t, 2.8, 3.3));
  return (
    <Svg label="reproduced for real: a stable _row_id and a _last_updated_sequence_number that only moves on change." h={230}>
      <rect x={25} y={30} width={150} height={150} rx={4} fill="none" stroke={C.mocha} strokeWidth={1.5} strokeDasharray="5 4" opacity={easeOut(seg(t, 0.1, 0.4))} />
      <T x={25} y={22} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        old file
      </T>
      <rect x={290} y={30} width={285} height={150} rx={4} fill="none" stroke={C.mocha} strokeWidth={1.5} strokeDasharray="5 4" opacity={easeOut(seg(t, 0.9, 1.2))} />
      <T x={290} y={22} s={11} f={C.latte} o={easeOut(seg(t, 0.9, 1.2))}>
        new file
      </T>
      <rect x={lerp(35, 300, mv)} y={70} width={110} height={34} rx={4} fill={C.cocoa} stroke={ed > 0.5 ? C.focus : C.crema} strokeWidth={1.8} opacity={easeOut(seg(t, 0.3, 0.6))} />
      <T x={lerp(45, 310, mv)} y={92} s={12} f={C.crema} o={easeOut(seg(t, 0.3, 0.6))}>
        _row_id 5
      </T>
      <T x={300} y={128} s={11} f={C.second} o={easeOut(seg(t, 2.0, 2.3))}>
        _row_id: assigned once, kept
      </T>
      <T x={300} y={150} s={11} f={C.second} o={easeOut(seg(t, 2.2, 2.5))}>
        sequence number: kept on a move
      </T>
      <path d={`M${420} 87 h${lerp(0, 120, ed)}`} stroke={C.focus} strokeWidth={2.5} />
      <path d={`M${540} 87 l-8 -5 v10 z`} fill={C.focus} opacity={ed} />
      <T x={300} y={172} s={11} f={C.focus} o={easeOut(seg(t, 3.2, 3.5))}>
        moves forward only on a real edit
      </T>
      <T x={25} y={215} s={12} f={C.latte} o={easeOut(seg(t, 3.8, 4.2))}>
        _last_updated_sequence_number
      </T>
    </Svg>
  );
}

// 4 · Naive scan on an update. A ten-row file with row 5 edited is rewritten whole; a file-diff scan strikes every old
// row as a delete and marks every new row as an insert; the counts land against the one real change.
export function RevealNaiveScanOnUpdate({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: a naive changelog scan on a real copy-on-write update." h={230}>
      <RowFile x={25} y={35} name="before" mark={(i) => (t > 1.6 ? C.cherryText : i === 5 && t > 0.6 ? C.second : undefined)} o={easeOut(seg(t, 0.1, 0.4))} />
      <RowFile x={200} y={35} name="rewritten" mark={(i) => (t > 2.2 ? C.cherryText : i === 5 ? C.second : undefined)} o={easeOut(seg(t, 0.8, 1.1))} />
      <T x={80} y={170} s={11} f={C.cherryText} o={easeOut(seg(t, 1.6, 1.9))}>
        all deleted
      </T>
      <T x={255} y={170} s={11} f={C.cherryText} o={easeOut(seg(t, 2.2, 2.5))}>
        all inserted
      </T>
      <T x={380} y={70} s={13} f={C.cherryText} o={easeOut(seg(t, 2.7, 3.0))}>
        10 deletes
      </T>
      <T x={380} y={98} s={13} f={C.cherryText} o={easeOut(seg(t, 2.9, 3.2))}>
        10 inserts
      </T>
      <T x={380} y={140} s={13} f={C.second} o={easeOut(seg(t, 3.4, 3.7))}>
        real changes: 1
      </T>
      <T x={25} y={215} s={13} f={C.latte} o={easeOut(seg(t, 3.9, 4.3))}>
        the file moved, so every row looks new
      </T>
    </Svg>
  );
}

// 5 · Lineage scan on the update. The same two files, now joined row to row by _row_id; nine lines stay grey as carry-overs,
// row 5's line lights as the one UPDATE.
export function RevealLineageScanOnUpdate({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: the same update, scanned by matching _row_id instead of by file." h={230}>
      <RowFile x={25} y={35} name="before" mark={(i) => (i === 5 ? C.second : undefined)} o={easeOut(seg(t, 0.1, 0.4))} />
      <RowFile x={200} y={35} name="rewritten" mark={(i) => (i === 5 && t > 2.4 ? C.focus : undefined)} o={easeOut(seg(t, 0.1, 0.4))} />
      {Array.from({ length: 10 }, (_, i) => (
        <line
          key={i}
          x1={73}
          y1={40 + i * 13}
          x2={lerp(73, 198, easeOut(seg(t, 0.6 + i * 0.12, 0.9 + i * 0.12)))}
          y2={40 + i * 13}
          stroke={i === 5 && t > 2.4 ? C.focus : C.taupe}
          strokeWidth={i === 5 ? 2.2 : 1}
        />
      ))}
      <T x={300} y={70} s={12} f={C.latte} o={easeOut(seg(t, 2.0, 2.3))}>
        9 rows: carried over
      </T>
      <T x={300} y={104} s={13} f={C.focus} o={easeOut(seg(t, 2.5, 2.8))}>
        UPDATE row 5
      </T>
      <T x={300} y={128} s={11} f={C.focus} o={easeOut(seg(t, 2.7, 3.0))}>
        a5-updated
      </T>
      <T x={25} y={210} s={13} f={C.focus} o={easeOut(seg(t, 3.6, 4.0))}>
        matched by row, exactly one real change
      </T>
    </Svg>
  );
}

// 6 · Predict. Two ten-row files compact into one twenty-row file, no value changed; the answer: it grows with the rewrite.
export function PredictCompactionScaleUp({ t, answer }: StepCtx) {
  return (
    <Svg label="scale it up: the same naive scan on a real compaction merging two ten-row files." h={200}>
      <RowFile x={25} y={30} rh={9} w={40} name="" o={easeOut(seg(t, 0.1, 0.4))} />
      <RowFile x={80} y={30} rh={9} w={40} o={easeOut(seg(t, 0.2, 0.5))} />
      <path d="M130 70 h60" stroke={C.latte} strokeWidth={1.6} opacity={easeOut(seg(t, 0.7, 1.0))} />
      <path d="M190 70 l-8 -5 v10 z" fill={C.latte} opacity={easeOut(seg(t, 0.7, 1.0))} />
      <RowFile x={205} y={20} n={20} rh={5.5} w={40} o={easeOut(seg(t, 1.0, 1.3))} />
      <T x={270} y={60} s={11} f={C.latte} o={easeOut(seg(t, 1.2, 1.5))}>
        compacted, zero values changed
      </T>
      <T x={270} y={95} s={16} f={C.second} o={easeOut(seg(t, 1.8, 2.2))}>
        naive count?
      </T>
      <AnswerRow y={145} label="the naive count" answer={answer} value="grows with it" k={easeOut(seg(t, 2.4, 2.9))} f={C.cherryText} />
      <Verdict answer={answer} y={188} text="every row counted twice" f={C.cherryText} />
    </Svg>
  );
}

// 7 · Compaction, measured. A naive bar built from 20 deletes and 20 inserts reaches 40; the row-lineage bar stays at zero.
export function RevealCompactionMeasured({ t }: StepCtx) {
  const d = easeInOut(seg(t, 0.6, 1.4));
  const i = easeInOut(seg(t, 1.4, 2.2));
  return (
    <Svg label="reproduced for real: compaction, measured by both scans." h={230}>
      <T x={25} y={40} s={12} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        file-diff scan
      </T>
      <rect x={170} y={28} width={180 * d} height={18} rx={2} fill={C.cherryText} />
      <rect x={350} y={28} width={180 * i} height={18} rx={2} fill={C.cherryText} opacity={0.6} />
      <T x={170} y={70} s={11} f={C.cherryText} o={easeOut(seg(t, 1.2, 1.5))}>
        20 deletes
      </T>
      <T x={350} y={70} s={11} f={C.cherryText} o={easeOut(seg(t, 2.0, 2.3))}>
        20 inserts
      </T>
      <T x={25} y={105} s={15} f={C.cherryText} o={easeOut(seg(t, 2.3, 2.6))}>
        40 changes, for zero real ones
      </T>
      <T x={25} y={150} s={12} f={C.latte} o={easeOut(seg(t, 2.8, 3.1))}>
        row-lineage scan
      </T>
      <line x1={170} y1={138} x2={170} y2={156} stroke={C.focus} strokeWidth={3} opacity={easeOut(seg(t, 2.9, 3.2))} />
      <T x={185} y={152} s={15} f={C.focus} o={easeOut(seg(t, 3.1, 3.4))}>
        0 changes
      </T>
      <T x={25} y={205} s={12} f={C.latte} o={easeOut(seg(t, 3.7, 4.1))}>
        every row recognized as a carry-over
      </T>
    </Svg>
  );
}

// 8 · Delta and Hudi. Delta's four change tags drop in one by one, with its forward-only note; Hudi's two modes sit
// beside each other, the cheaper one marked.
export function RevealDeltaHudiSameIdea({ t }: StepCtx) {
  const tags = ['insert', 'update_preimage', 'update_postimage', 'delete'];
  return (
    <Svg label="Delta's Change Data Feed and Hudi's incremental queries: the same idea, their own vocabulary." h={230}>
      <T x={25} y={25} s={12} f={C.crema} o={easeOut(seg(t, 0.1, 0.4))}>
        Delta Change Data Feed
      </T>
      {tags.map((g, i) => (
        <Cell key={g} x={25 + (i % 2) * 210} y={38 + Math.floor(i / 2) * 36} w={195} h={28} label={g} stroke={i === 3 ? C.cherryText : C.second} o={easeOut(seg(t, 0.5 + i * 0.3, 0.8 + i * 0.3))} />
      ))}
      <T x={450} y={60} s={11} f={C.latte} o={easeOut(seg(t, 1.8, 2.1))}>
        from when
      </T>
      <T x={450} y={84} s={11} f={C.latte} o={easeOut(seg(t, 1.9, 2.2))}>
        it was enabled
      </T>
      <T x={25} y={140} s={12} f={C.crema} o={easeOut(seg(t, 2.4, 2.7))}>
        Hudi hudi_table_changes
      </T>
      <Cell x={25} y={152} w={250} h={28} label="cdc: before and after" o={easeOut(seg(t, 2.7, 3.0))} />
      <Cell x={290} y={152} w={250} h={28} label="latest_state: cheaper" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 3.2, 3.5))} />
      <T x={290} y={205} s={11} f={C.latte} o={easeOut(seg(t, 3.6, 3.9))}>
        compactions already folded in
      </T>
    </Svg>
  );
}

// 9 · Incremental scan. Snapshots s1, s2, s3 on a line, s3 a compaction; a range bracket from after s1 through s2 returns
// the five appended rows; a second bracket reaching s3 is refused.
export function RevealIncrementalScanAppendOnly({ t }: StepCtx) {
  const xs = [90, 270, 450];
  const lbl = ['s1: 10 rows', 's2: +5 rows', 's3: compaction'];
  return (
    <Svg label="reproduced for real: Iceberg's own plain incremental scan, appends only." h={230}>
      <line x1={25} y1={60} x2={560} y2={60} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.1, 0.3))} />
      {xs.map((x, i) => (
        <g key={x} opacity={easeOut(seg(t, 0.2 + i * 0.2, 0.5 + i * 0.2))}>
          <circle cx={x} cy={60} r={11} fill={C.cocoa} stroke={i === 2 ? C.second : C.latte} strokeWidth={2} />
          <T x={x} y={35} s={11} f={C.latte} a="middle">
            {lbl[i]}
          </T>
        </g>
      ))}
      <path d={`M${xs[0] + 14} 85 v8 H${lerp(xs[0] + 14, xs[1], easeInOut(seg(t, 0.9, 1.5)))}`} fill="none" stroke={C.focus} strokeWidth={2} />
      <T x={110} y={115} s={12} f={C.focus} o={easeOut(seg(t, 1.5, 1.8))}>
        after s1, through s2: the 5 appended rows
      </T>
      <path d={`M${xs[0] + 14} 140 v8 H${lerp(xs[0] + 14, xs[2], easeInOut(seg(t, 2.3, 3.0)))}`} fill="none" stroke={C.cherryText} strokeWidth={2} />
      <Cross x={xs[2] + 22} y={146} k={easeOut(seg(t, 3.0, 3.3))} />
      <T x={110} y={172} s={12} f={C.cherryText} o={easeOut(seg(t, 3.2, 3.5))}>
        through s3: refused, not an append
      </T>
      <T x={25} y={215} s={12} f={C.latte} o={easeOut(seg(t, 3.8, 4.2))}>
        start exclusive, end inclusive, appends only
      </T>
    </Svg>
  );
}

// 10 · Recap.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a naive scan sees every rewritten row as changed; row identity tells a rewrite from a real change." h={250}>
      <Row y={40} label="a file-diff scan" value="every moved row" valueColor={C.cherryText} k={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={100} label="row identity" value="tells move from edit" valueColor={C.focus} k={easeOut(seg(t, 1.2, 1.6))} />
      <Row y={160} label="Delta, Hudi" value="the same idea" k={easeOut(seg(t, 2.2, 2.6))} />
      <Row y={220} label="downstream CDC" value="needs row identity" valueColor={C.second} k={easeOut(seg(t, 3.2, 3.6))} />
    </Svg>
  );
}
