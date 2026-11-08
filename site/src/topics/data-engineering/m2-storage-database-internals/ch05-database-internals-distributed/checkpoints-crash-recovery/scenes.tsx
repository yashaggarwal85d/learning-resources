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

/** The chapter's durability timeline: a WAL strip from x 110 to 570 written up to `w`, with an optional checkpoint mark at `c`
 * and a crash mark at `x`; the stretch between them is the replay distance, drawn when `r` > 0. */
function WalStrip({ y, w, c, crash, r = 0, o = 1 }: { y: number; w: number; c?: number; crash?: number; r?: number; o?: number }) {
  const px = (f: number) => 110 + 460 * f;
  return (
    <g opacity={o}>
      <T x={25} y={y + 11} s={11} f={C.latte}>
        WAL
      </T>
      <rect x={110} y={y} width={460} height={14} rx={2} fill="none" stroke={C.mocha} strokeWidth={1} />
      <rect x={110} y={y} width={460 * w} height={14} rx={2} fill={C.second} opacity={0.7} />
      {c !== undefined && <line x1={px(c)} y1={y - 8} x2={px(c)} y2={y + 22} stroke={C.focus} strokeWidth={2.5} />}
      {crash !== undefined && <line x1={px(crash)} y1={y - 8} x2={px(crash)} y2={y + 22} stroke={C.cherryText} strokeWidth={2.5} />}
      {c !== undefined && crash !== undefined && r > 0 && <rect x={px(c)} y={y + 4} width={(px(crash) - px(c)) * r} height={6} rx={1} fill={C.cherryText} />}
    </g>
  );
}

// 1 · Hook. The WAL keeps growing; a crash at its tip would have to replay the whole length from the start, until a recent mark
// appears that recovery could begin from instead.
export function Hook({ t }: StepCtx) {
  const w = easeOut(seg(t, 0.4, 1.6));
  const r = easeInOut(seg(t, 1.8, 2.6));
  const m = easeOut(seg(t, 2.9, 3.4));
  return (
    <Svg label="a crash doesn't replay the engine's whole history — something marks where recovery starts" h={220}>
      <Row y={40} label="a log never trimmed" value="replay it all?" k={easeOut(seg(t, 0.2, 0.7))} />
      <WalStrip y={86} w={w} crash={w > 0.95 ? 1 : undefined} />
      <rect x={110} y={90} width={460 * r} height={6} rx={1} fill={C.cherryText} opacity={1 - m} />
      <line x1={110 + 460 * 0.78} y1={78} x2={110 + 460 * 0.78} y2={108} stroke={C.focus} strokeWidth={2.5} opacity={m} />
      <T x={110 + 460 * 0.78} y={128} s={11} f={C.focus} a="middle" o={m}>
        start here
      </T>
      <Row y={185} label="a recent mark" value="where recovery begins" valueColor={C.focus} k={easeOut(seg(t, 3.4, 3.9))} />
    </Svg>
  );
}

// 2 · The redo record. A real checkpoint's redo LSN lands on the WAL strip; the live distance from it to the current position
// is drawn as the replay a crash right now would need.
export function RevealRedoLsn({ t }: StepCtx) {
  const r = easeOut(seg(t, 1.6, 2.4));
  return (
    <Svg label="a checkpoint's own redo record, read directly off a real cluster — how far would a crash right now have to replay?" h={220}>
      <Row y={40} label="pg_control_checkpoint()" value="its redo LSN" k={easeOut(seg(t, 0.2, 0.7))} />
      <WalStrip y={86} w={0.8} c={easeOut(seg(t, 0.6, 1.0)) > 0 ? 0.45 : undefined} crash={r > 0 ? 0.8 : undefined} r={r} o={easeOut(seg(t, 0.3, 0.6))} />
      <T x={110 + 460 * 0.45} y={128} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 0.9, 1.2))}>
        redo LSN
      </T>
      <T x={110 + 460 * 0.8} y={128} s={11} f={C.cherryText} a="middle" o={r}>
        now
      </T>
      <Row y={185} label="the gap behind it" value="a crash's replay" valueColor={C.cherryText} k={easeOut(seg(t, 3.0, 3.5))} />
    </Svg>
  );
}

// 3 · The trade-off. Two strips: frequent checkpoints chop the log into short replay stretches but each opens with a full page
// image; rare checkpoints leave a long stretch and few images.
export function RevealFrequencyTradeoff({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.6, 1.6));
  const b = easeOut(seg(t, 1.8, 2.8));
  return (
    <Svg label="checkpoint more often for less to redo — but a real cost on the other side" h={230}>
      <T x={25} y={46} s={12} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        often
      </T>
      <rect x={110} y={36} width={460} height={14} rx={2} fill="none" stroke={C.mocha} strokeWidth={1} />
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i} opacity={clamp(a * 8 - i)}>
          <line x1={110 + i * 57.5} y1={30} x2={110 + i * 57.5} y2={56} stroke={C.focus} strokeWidth={2} />
          <rect x={112 + i * 57.5} y={38} width={16} height={10} rx={1} fill={C.focus} opacity={0.7} />
        </g>
      ))}
      <T x={25} y={106} s={12} f={C.latte} o={easeOut(seg(t, 1.6, 1.9))}>
        rarely
      </T>
      <rect x={110} y={96} width={460} height={14} rx={2} fill="none" stroke={C.mocha} strokeWidth={1} />
      <g opacity={b}>
        <line x1={110} y1={90} x2={110} y2={116} stroke={C.focus} strokeWidth={2} />
        <rect x={112} y={98} width={16} height={10} rx={1} fill={C.focus} opacity={0.7} />
        <rect x={130} y={100} width={440 * b} height={6} rx={1} fill={C.cherryText} />
      </g>
      <T x={25} y={146} s={11} f={C.focus} o={easeOut(seg(t, 1.2, 1.5))}>
        each block: a full page image after a checkpoint
      </T>
      <Row y={180} label="more often" value="less to redo" valueColor={C.focus} k={easeOut(seg(t, 2.8, 3.3))} />
      <Row y={215} label="the cost" value="more full-page images" valueColor={C.cherryText} k={easeOut(seg(t, 3.4, 3.9))} />
    </Svg>
  );
}

// 4 · Predict: why log the whole page? A page lands in pieces; a crash leaves it half new; applying a small change on top of that
// is the question.
export function PredictTornPage({ t, answer }: StepCtx) {
  const n = Math.floor(clamp(seg(t, 0.3, 1.1)) * 4);
  return (
    <Svg label="a crash mid-write — why log the whole page, not just the change?" h={210}>
      <Row y={40} label="a crash mid-write" value="why the whole page?" k={easeOut(seg(t, 0.1, 0.5))} />
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={25 + i * 69} y={62} width={64} height={22} rx={2} fill={i < n ? C.focus : C.mocha} opacity={0.8} />
      ))}
      <line x1={25 + 4 * 69 - 3} y1={56} x2={25 + 4 * 69 - 3} y2={90} stroke={C.cherryText} strokeWidth={2} opacity={easeOut(seg(t, 1.1, 1.4))} />
      <AnswerRow y={140} label="a format limit" answer={answer} value="no, a torn page" f={C.cherryText} k={easeOut(seg(t, 1.2, 1.7))} />
      <Verdict answer={answer} text="only a whole, known-good copy repairs it" />
    </Svg>
  );
}

// 5 · Frequent, measured. Ten rounds over 2,000 rows, a checkpoint after every round: a full-page image lands each round, and the
// replay stretch after the last checkpoint is short.
export function RevealFrequentMeasurement({ t }: StepCtx) {
  const n = Math.floor(clamp(seg(t, 0.6, 2.6)) * 10.99);
  const r = easeOut(seg(t, 2.8, 3.2));
  return (
    <Svg label="checkpointing every round of ten — how many full-page images, and how short a replay?" h={230}>
      <Row y={40} label="10 rounds, 2,000 rows" value="checkpoint each round" k={easeOut(seg(t, 0.2, 0.7))} />
      <rect x={25} y={76} width={550} height={14} rx={2} fill="none" stroke={C.mocha} strokeWidth={1} />
      {Array.from({ length: 10 }, (_, i) => (
        <g key={i} opacity={i < n ? 1 : 0}>
          <line x1={25 + i * 55} y1={70} x2={25 + i * 55} y2={96} stroke={C.focus} strokeWidth={2} />
          <rect x={27 + i * 55} y={78} width={20} height={10} rx={1} fill={C.focus} opacity={0.75} />
        </g>
      ))}
      <rect x={549} y={80} width={24 * r} height={6} rx={1} fill={C.cherryText} />
      <Row y={140} label="full-page images" value="many" valueColor={C.cherryText} k={easeOut(seg(t, 2.6, 3.0))} />
      <Row y={190} label="replay distance" value="kept small" valueColor={C.focus} k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 6 · Infrequent, measured. The same ten rounds with one checkpoint before them: a single block of images, then a replay stretch
// that runs the whole length; each side differs from the frequent run by at least 5×.
export function RevealInfrequentMeasurement({ t }: StepCtx) {
  const r = easeInOut(seg(t, 1.0, 2.6));
  return (
    <Svg label="the same ten rounds, checkpointed once — fewer full-page images, but how much more to replay?" h={230}>
      <Row y={40} label="the same 10 rounds" value="one checkpoint first" k={easeOut(seg(t, 0.2, 0.7))} />
      <rect x={25} y={76} width={550} height={14} rx={2} fill="none" stroke={C.mocha} strokeWidth={1} />
      <line x1={25} y1={70} x2={25} y2={96} stroke={C.focus} strokeWidth={2} opacity={easeOut(seg(t, 0.4, 0.7))} />
      <rect x={27} y={78} width={34} height={10} rx={1} fill={C.focus} opacity={0.75 * easeOut(seg(t, 0.5, 0.8))} />
      <rect x={63} y={80} width={510 * r} height={6} rx={1} fill={C.cherryText} />
      <Row y={140} label="full-page images" value="at least 5× fewer" valueColor={C.focus} k={easeOut(seg(t, 2.6, 3.0))} />
      <Row y={190} label="replay distance" value="at least 5× longer" valueColor={C.cherryText} k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 7 · Redo-only versus ARIES. ARIES' three passes draw in a row: analysis, redo, undo. Postgres keeps only the redo pass; the
// undo cell is crossed out, a row's own transaction status deciding visibility instead.
export function RevealRedoVsUndo({ t }: StepCtx) {
  const passes = ['analysis', 'redo', 'undo'];
  return (
    <Svg label="Postgres redoes once; ARIES adds a separate pass to undo unfinished transactions" h={230}>
      <T x={25} y={58} s={12} f={C.latte} o={easeOut(seg(t, 0.3, 0.6))}>
        ARIES
      </T>
      {passes.map((p, i) => (
        <Cell key={p} x={130 + i * 150} y={40} w={140} label={p} stroke={C.second} f={C.second} o={easeOut(seg(t, 0.5 + i * 0.4, 0.9 + i * 0.4))} />
      ))}
      <T x={25} y={118} s={12} f={C.latte} o={easeOut(seg(t, 1.9, 2.2))}>
        Postgres
      </T>
      <Cell x={280} y={100} w={140} label="redo" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 2.1, 2.5))} />
      <rect x={430} y={100} width={140} height={28} rx={4} fill="none" stroke={C.mocha} strokeWidth={1.5} strokeDasharray="4 4" opacity={easeOut(seg(t, 2.4, 2.7))} />
      <Cross x={500} y={114} k={easeOut(seg(t, 2.7, 3.0))} />
      <Row y={185} label="visibility" value="a row's own status" valueColor={C.focus} k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 8 · One WAL, three more jobs. The WAL strip stays; one branch stops replay early (point-in-time recovery), one ships the bytes
// to a replica, one decodes them into row changes.
export function RevealSubstrate({ t }: StepCtx) {
  const jobs = ['stop early: PITR', 'ship: replication', 'decode: row changes'];
  return (
    <Svg label="the same WAL, reused for point-in-time recovery, physical replication, and logical decoding" h={230}>
      <WalStrip y={36} w={easeOut(seg(t, 0.2, 0.8))} />
      {jobs.map((j, i) => {
        const k = easeOut(seg(t, 1.0 + i * 0.7, 1.5 + i * 0.7));
        return (
          <g key={j}>
            <path d={`M${200 + i * 150} 50 L${110 + i * 185} ${lerp(50, 96, k)}`} stroke={C.latte} strokeWidth={1.2} opacity={k > 0 ? 1 : 0} />
            <Cell x={25 + i * 185} y={98} w={175} label={j} stroke={C.focus} o={k} />
          </g>
        );
      })}
      <Row y={185} label="one log" value="three more jobs" valueColor={C.focus} k={easeOut(seg(t, 3.3, 3.8))} />
    </Svg>
  );
}

// 9 · Recap. Four rows land one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a redo record, a measured trade-off, a redo-only engine, and one WAL reused three ways" h={240}>
      <Row y={40} label="a checkpoint's redo record" value="recovery's start" k={easeOut(seg(t, 0.4, 0.9))} />
      <Row y={95} label="the trade-off" value="images vs replay, 5×+ each" valueColor={C.focus} k={easeOut(seg(t, 1.3, 1.8))} />
      <Row y={150} label="Postgres" value="redo only" k={easeOut(seg(t, 2.2, 2.7))} />
      <Row y={205} label="the same WAL" value="three more jobs" valueColor={C.focus} k={easeOut(seg(t, 3.1, 3.6))} />
    </Svg>
  );
}

// 10 · Prove: instant recovery, forever? A WAL strip grows with uptime; after the answer a checkpoint mark appears near its tip,
// bounding the replay no matter how long the strip gets.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const m = answer !== null ? easeOut(seg(s, 0.1, 0.5)) : 0;
  const v = answer !== null ? easeOut(seg(s, 0.6, 1.0)) : 0;
  return (
    <Svg label="instant crash recovery, no checkpoint mentioned — what would have to be true?" h={230}>
      <Row y={40} label="instant recovery, always" value="believe it?" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="no bound needed" answer={answer} value="no, it bounds replay" k={easeOut(seg(t, 0.4, 0.9))} />
      <WalStrip y={124} w={easeOut(seg(t, 0.6, 1.4))} c={m > 0 ? 0.85 : undefined} crash={m > 0 ? 1 : undefined} r={m} />
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, v)} s={15} f={C.focus} a="middle" o={v}>
            a checkpoint, by another name
          </T>
          <rect x={150} y={202} width={300 * v} height={3} fill={C.focus} />
        </>
      )}
    </Svg>
  );
}
