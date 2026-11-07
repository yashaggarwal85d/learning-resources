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

/** One lane of the chapter's two-transaction timeline: a label and a line, with events placed along it. */
function Lane({ y, label, k }: { y: number; label: string; k: number }) {
  return (
    <g opacity={k}>
      <T x={25} y={y + 4} s={12} f={C.latte}>
        {label}
      </T>
      <line x1={110} y1={y} x2={570} y2={y} stroke={C.mocha} strokeWidth={1.5} />
    </g>
  );
}

/** An event on a lane: a dot and a short label above it. */
function Ev({ x, y, label, k, f = C.crema }: { x: number; y: number; label: string; k: number; f?: string }) {
  return (
    <g opacity={k}>
      <circle cx={x} cy={y} r={5} fill={f} />
      <T x={x} y={y - 11} s={11} f={f} a="middle">
        {label}
      </T>
    </g>
  );
}

// 1 · Hook. Two writers reach for the same row from either side; a reader stands between them, and what it sees is the question.
export function Hook({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.6, 1.6));
  return (
    <Svg label="two transactions reach for the same row at once — what does a reader caught in the middle see?" h={220}>
      <Row y={40} label="two writers, one row" value="a reader sees?" k={easeOut(seg(t, 0.3, 0.8))} />
      <Cell x={250} y={90} w={100} label="row 1" stroke={C.focus} o={easeOut(seg(t, 0.3, 0.6))} />
      <Cell x={lerp(25, 110, a)} y={90} w={110} label="writer A" o={easeOut(seg(t, 0.5, 0.8))} />
      <Cell x={lerp(465, 380, a)} y={90} w={110} label="writer B" o={easeOut(seg(t, 0.5, 0.8))} />
      <Cell x={250} y={140} w={100} label="reader" stroke={C.second} f={C.second} o={easeOut(seg(t, 1.8, 2.2))} />
      <T x={370} y={160} s={16} f={C.focus} o={easeOut(seg(t, 2.6, 3.0))}>
        ?
      </T>
    </Svg>
  );
}

// 2 · A real update, inspected. The page holds 'before'; after one UPDATE a second tuple 'after' appears beside it; the old one's
// xmax and the new one's xmin light up as the same transaction ID.
export function RevealRealUpdate({ t }: StepCtx) {
  const n = easeOut(seg(t, 1.0, 1.5));
  const x = easeOut(seg(t, 2.2, 2.7));
  return (
    <Svg label="one real update, read straight off the page — how many tuples are there now?" h={230}>
      <Row y={40} label="one UPDATE" value="two tuples on the page" k={easeOut(seg(t, 0.2, 0.7))} />
      <Cell x={25} y={70} w={260} label="'before'" o={easeOut(seg(t, 0.3, 0.6))} />
      <Cell x={315} y={70} w={260} label="'after'" stroke={C.focus} f={C.focus} o={n} />
      <Cell x={25} y={110} w={260} h={24} label="xmax = the updater" stroke={C.second} f={C.second} o={x} />
      <Cell x={315} y={110} w={260} h={24} label="xmin = the updater" stroke={C.second} f={C.second} o={x} />
      <path d="M285 122 H315" stroke={C.second} strokeWidth={2} opacity={x} />
      <Row y={195} label="one transaction ID" value="closes one, opens one" valueColor={C.second} k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 3 · Visibility. A tuple passes two checks before it counts: is its creator outside the reader's snapshot of in-progress
// transactions, and did that creator actually commit.
export function RevealVisibility({ t }: StepCtx) {
  const g1 = easeOut(seg(t, 1.0, 1.5));
  const g2 = easeOut(seg(t, 2.0, 2.5));
  const p = easeInOut(seg(t, 0.4, 3.0));
  return (
    <Svg label="a tuple's header, a reader's snapshot, and a commit lookup — what decides visibility?" h={220}>
      <Row y={40} label="visible?" value="two checks, not one" k={easeOut(seg(t, 0.2, 0.7))} />
      <Cell x={25} y={80} w={100} label="tuple" o={easeOut(seg(t, 0.3, 0.6))} />
      <Cell x={170} y={80} w={180} label="snapshot: not in flight" stroke={C.second} f={C.second} o={g1} />
      <Cell x={380} y={80} w={120} label="committed?" stroke={C.second} f={C.second} o={g2} />
      <circle cx={lerp(75, 500, p)} cy={130} r={6} fill={C.focus} opacity={easeOut(seg(t, 0.4, 0.7))} />
      <MiniTick x={255} y={128} k={easeOut(seg(t, 1.6, 1.9))} />
      <MiniTick x={435} y={128} k={easeOut(seg(t, 2.6, 2.9))} />
      <T x={575} y={136} s={12} f={C.focus} a="end" o={easeOut(seg(t, 3.0, 3.3))}>
        visible
      </T>
      <Row y={190} label="the header alone" value="isn't enough" valueColor={C.cherryText} k={easeOut(seg(t, 3.4, 3.9))} />
    </Svg>
  );
}

// 4 · Predict: where does the old value come from? The one copy's 'before' is crossed out as 'after' is written beside it; a
// reader still needs the value from before; then the question.
export function PredictOtherFamily({ t, answer }: StepCtx) {
  const w = easeOut(seg(t, 0.4, 0.9));
  return (
    <Svg label="InnoDB and Oracle keep one copy, updated in place — where does a reader's older value come from?" h={210}>
      <Row y={40} label="one copy, in place" value="the old value from?" k={easeOut(seg(t, 0.1, 0.5))} />
      <Cell x={200} y={62} w={150} label="'before'" o={easeOut(seg(t, 0.2, 0.4)) * (1 - 0.6 * w)} />
      <Cross x={365} y={76} k={w} />
      <Cell x={390} y={62} w={150} label="'after'" stroke={C.focus} f={C.focus} o={w} />
      <Cell x={25} y={62} w={120} label="reader" stroke={C.second} f={C.second} o={easeOut(seg(t, 0.6, 0.9))} />
      <AnswerRow y={140} label="it waits for the writer" answer={answer} value="no, a separate log" k={easeOut(seg(t, 1.2, 1.7))} />
      <Verdict answer={answer} text="the old value is rebuilt from undo" />
    </Svg>
  );
}

// 5 · The undo-log family. The row is overwritten in place to 'after'; the value it replaced slides off to an undo log beside it,
// and a reader's older version is rebuilt from there. In InnoDB the row lives at the primary key's leaf.
export function RevealUndoLogFamily({ t }: StepCtx) {
  const m = easeInOut(seg(t, 0.8, 1.6));
  return (
    <Svg label="one row updated in place, the overwritten value pushed to a separate undo log" h={230}>
      <Row y={40} label="InnoDB and Oracle docs" value="update in place" valueColor={C.second} k={easeOut(seg(t, 0.2, 0.7))} />
      <Cell x={25} y={70} w={200} label="row: 'after'" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 0.4, 0.7))} />
      <Cell x={lerp(25, 350, m)} y={lerp(112, 70, m)} w={200} label="'before'" stroke={C.second} f={C.second} o={easeOut(seg(t, 0.6, 0.9))} />
      <T x={450} y={116} s={11} f={C.second} a="middle" o={easeOut(seg(t, 1.6, 1.9))}>
        undo log
      </T>
      <path d="M450 126 C 450 160, 125 160, 125 104" fill="none" stroke={C.latte} strokeWidth={1.2} strokeDasharray="300" strokeDashoffset={300 * (1 - easeOut(seg(t, 2.0, 2.8)))} />
      <T x={290} y={170} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 2.6, 2.9))}>
        an old reader's version, rebuilt
      </T>
      <Row y={210} label="InnoDB's row" value="at the primary-key leaf" k={easeOut(seg(t, 3.3, 3.8))} />
    </Svg>
  );
}

// 6 · The append cost. 2,000 updates to one indexed row with no vacuum: each leaves a dead tuple and a new index entry, and both
// the table's and the index's page counts climb.
export function RevealAppendCost({ t }: StepCtx) {
  const g = clamp(seg(t, 0.6, 3.0));
  const n = Math.floor(g * 12);
  return (
    <Svg label="repeated updates to one indexed row, no vacuum — how much do the table and its index grow?" h={230}>
      <Row y={40} label="2,000 updates, one row" value="no vacuum" k={easeOut(seg(t, 0.2, 0.7))} />
      <T x={25} y={86} s={12} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        table
      </T>
      {Array.from({ length: 1 + n }, (_, i) => (
        <rect key={i} x={110 + i * 38} y={72} width={32} height={20} rx={3} fill={i === n ? C.focus : C.mocha} opacity={0.85} />
      ))}
      <T x={25} y={126} s={12} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        index
      </T>
      {Array.from({ length: 1 + Math.floor(n / 2) }, (_, i) => (
        <rect key={i} x={110 + i * 38} y={112} width={32} height={20} rx={3} fill={C.second} opacity={0.7} />
      ))}
      <T x={110} y={158} s={11} f={C.latte} o={easeOut(seg(t, 1.0, 1.3))}>
        dead tuples, still there
      </T>
      <Row y={205} label="table + index" value="grew by real pages" valueColor={C.cherryText} k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 7 · A reader that never blocks. Two lanes: A opens and reads 'first'; B updates to 'second' and commits; A reads again and still
// sees 'first', unblocked; only a fresh snapshot sees 'second'.
export function RevealNoBlock({ t }: StepCtx) {
  return (
    <Svg label="an open transaction keeps reading the same value while another connection commits an update" h={230}>
      <Lane y={80} label="reader A" k={easeOut(seg(t, 0.2, 0.5))} />
      <Lane y={150} label="writer B" k={easeOut(seg(t, 0.2, 0.5))} />
      <Ev x={150} y={80} label="'first'" k={easeOut(seg(t, 0.6, 0.9))} f={C.focus} />
      <Ev x={250} y={150} label="UPDATE 'second'" k={easeOut(seg(t, 1.2, 1.5))} />
      <Ev x={390} y={150} label="COMMIT" k={easeOut(seg(t, 1.6, 1.9))} f={C.second} />
      <Ev x={420} y={80} label="'first'" k={easeOut(seg(t, 2.2, 2.5))} f={C.focus} />
      <Ev x={530} y={80} label="'second'" k={easeOut(seg(t, 3.0, 3.3))} f={C.second} />
      <T x={575} y={104} s={11} f={C.second} a="end" o={easeOut(seg(t, 3.0, 3.3))}>
        a new snapshot
      </T>
      <Row y={205} label="the reader" value="never blocked" valueColor={C.focus} k={easeOut(seg(t, 3.4, 3.9))} />
    </Svg>
  );
}

// 8 · Snapshot too old. The undo log is a ring; a writer's head laps around it, overwriting the oldest undo, and catches the record
// a long reader still needs.
export function RevealSnapshotTooOld({ t }: StepCtx) {
  const p = easeInOut(seg(t, 0.6, 3.0));
  const cx = 160;
  const cy = 130;
  const R = 60;
  const head = -Math.PI / 2 + p * Math.PI * 1.9;
  const hit = p > 0.95;
  return (
    <Svg label="a bounded undo log reused in a circle — what happens to a reader that outlives its own undo?" h={230}>
      <Row y={40} label="Oracle's docs" value="the undo log is a ring" valueColor={C.second} k={easeOut(seg(t, 0.2, 0.7))} />
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={C.mocha} strokeWidth={10} opacity={easeOut(seg(t, 0.3, 0.6))} />
      <path d={`M${cx} ${cy - R} A ${R} ${R} 0 ${p > 0.5 ? 1 : 0} 1 ${cx + R * Math.cos(head)} ${cy + R * Math.sin(head)}`} fill="none" stroke={C.second} strokeWidth={10} opacity={p > 0 ? 0.8 : 0} />
      <circle cx={cx + R * Math.cos(-Math.PI / 2 - 0.25)} cy={cy + R * Math.sin(-Math.PI / 2 - 0.25)} r={7} fill={hit ? C.cherryText : C.focus} />
      <T x={260} y={100} s={12} f={C.focus} o={easeOut(seg(t, 0.6, 0.9))}>
        the undo a long reader needs
      </T>
      <T x={260} y={130} s={12} f={C.second} o={easeOut(seg(t, 1.0, 1.3))}>
        new undo, overwriting the oldest
      </T>
      <T x={260} y={160} s={13} f={C.cherryText} o={easeOut(seg(t, 3.0, 3.3))}>
        snapshot too old
      </T>
      <Row y={215} label="the reader" value="gets no answer" valueColor={C.cherryText} k={easeOut(seg(t, 3.4, 3.9))} />
    </Svg>
  );
}

// 9 · Recap. Three rows land one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="Postgres appends and cleans up later; InnoDB and Oracle update in place and keep a bounded undo log" h={220}>
      <Row y={50} label="Postgres" value="append, clean up later" k={easeOut(seg(t, 0.8, 1.3))} />
      <Row y={110} label="InnoDB, Oracle" value="in place, plus undo" valueColor={C.second} k={easeOut(seg(t, 2.0, 2.5))} />
      <Row y={170} label="a bounded undo" value="can fail a reader" valueColor={C.cherryText} k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 10 · Prove: raise undo_retention? The ring grows larger after the answer, but a longer report's head still laps it; the failure
// is delayed, not removed.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const g = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const v = answer !== null ? easeOut(seg(s, 0.7, 1.1)) : 0;
  return (
    <Svg label="raising undo_retention to stop snapshot-too-old — removed, or only delayed?" h={230}>
      <Row y={40} label="raise undo_retention" value="fixed for good?" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="removes the risk" answer={answer} value="no, only delays it" f={C.cherryText} k={easeOut(seg(t, 0.4, 0.9))} />
      <rect x={25} y={118} width={lerp(200, 380, g)} height={14} rx={2} fill="none" stroke={C.second} strokeWidth={1.5} opacity={easeOut(seg(t, 0.6, 0.9))} />
      <T x={25} y={152} s={11} f={C.latte} o={easeOut(seg(t, 0.6, 0.9))}>
        retention, a target, not a promise
      </T>
      <rect x={25} y={121} width={lerp(200, 380, g) + 40 * g} height={8} rx={1} fill={C.cherryText} opacity={0.6 * easeOut(seg(t, 0.8, 1.1))} />
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, v)} s={15} f={C.focus} a="middle" o={v}>
            a longer report still outruns it
          </T>
          <rect x={150} y={202} width={300 * v} height={3} fill={C.focus} />
        </>
      )}
    </Svg>
  );
}
