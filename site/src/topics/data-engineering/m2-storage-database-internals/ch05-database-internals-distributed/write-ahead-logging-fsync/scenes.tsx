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

// 1 · Hook. A change sits only in the buffer pool; the process crashes, and the change is wiped; something that survives has to
// be written first.
export function Hook({ t }: StepCtx) {
  const c = easeOut(seg(t, 1.6, 2.0));
  return (
    <Svg label="a dirty page held only in memory disappears the instant the process crashes — what has to happen first?" h={220}>
      <Row y={40} label="a change, only in memory" value="then a crash" valueColor={C.cherryText} k={easeOut(seg(t, 0.3, 0.8))} />
      <rect x={25} y={66} width={260} height={60} rx={6} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.4, 0.7))} />
      <T x={35} y={84} s={11} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        buffer pool
      </T>
      <Cell x={45} y={92} w={150} h={24} label="dirty page" stroke={C.cherryText} o={easeOut(seg(t, 0.6, 0.9)) * (1 - c)} />
      <Cross x={155} y={104} k={c} />
      <Cell x={355} y={92} w={220} h={24} label="disk: the old version" f={C.latte} o={easeOut(seg(t, 0.8, 1.1))} />
      <Row y={180} label="written first" value="something that survives" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
    </Svg>
  );
}

// 2 · The LSN. One real write: the WAL strip advances from the before-position to the after-position, and the gap between the
// two marks is a whole number of bytes, never negative.
export function RevealLsn({ t }: StepCtx) {
  const a = easeInOut(seg(t, 1.0, 2.0));
  return (
    <Svg label="a real log position, read directly off this sandbox's own cluster — does it only move forward, by an exact amount?" h={220}>
      <Row y={40} label="one real UPDATE" value="the LSN moves" k={easeOut(seg(t, 0.2, 0.7))} />
      <rect x={25} y={82} width={550} height={16} rx={2} fill="none" stroke={C.mocha} strokeWidth={1} opacity={easeOut(seg(t, 0.4, 0.7))} />
      <rect x={25} y={82} width={260 + 120 * a} height={16} rx={2} fill={C.second} opacity={0.85 * easeOut(seg(t, 0.4, 0.7))} />
      <line x1={285} y1={74} x2={285} y2={106} stroke={C.crema} strokeWidth={2} opacity={easeOut(seg(t, 0.6, 0.9))} />
      <T x={285} y={124} s={11} f={C.crema} a="middle" o={easeOut(seg(t, 0.6, 0.9))}>
        before
      </T>
      <line x1={405} y1={74} x2={405} y2={106} stroke={C.focus} strokeWidth={2} opacity={easeOut(seg(t, 1.9, 2.2))} />
      <T x={405} y={124} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 1.9, 2.2))}>
        after
      </T>
      <path d="M290 140 H400" stroke={C.focus} strokeWidth={1.5} opacity={easeOut(seg(t, 2.4, 2.7))} />
      <T x={345} y={158} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 2.6, 2.9))}>
        an exact byte gap
      </T>
      <Row y={200} label="the LSN" value="only moves forward" valueColor={C.focus} k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 3 · Group commit. 400 commits from 8 threads arrive close together; with commit_delay set, they gather and share far fewer
// flushes, each still waiting for its own flush to finish.
export function RevealGroupCommit({ t }: StepCtx) {
  const p = clamp(seg(t, 0.6, 2.8));
  return (
    <Svg label="the log flushed before the data, and a real batch of commits sharing far fewer flushes than it has commits" h={240}>
      <Row y={40} label="8 threads × 50 commits" value="400 commits" k={easeOut(seg(t, 0.2, 0.7))} />
      {Array.from({ length: 40 }, (_, i) => {
        const at = i / 40;
        const g = Math.floor(i / 8);
        const k = clamp((p - at) * 8);
        return <circle key={i} cx={lerp(25 + (i % 8) * 14 + g * 110, 70 + g * 110, k)} cy={lerp(74 + (i % 3) * 8, 110, k)} r={3.5} fill={C.crema} opacity={k > 0 ? 0.85 : 0.2} />;
      })}
      {[0, 1, 2, 3, 4].map((g) => (
        <rect key={g} x={42 + g * 110} y={122} width={56} height={14} rx={2} fill={C.second} opacity={0.85 * clamp((p - (g * 8 + 7) / 40) * 8)} />
      ))}
      <T x={25} y={158} s={11} f={C.latte} o={easeOut(seg(t, 1.2, 1.5))}>
        one shared flush per group
      </T>
      <Row y={200} label="with commit_delay" value="fewer flushes than commits" valueColor={C.focus} k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 4 · Predict: all or nothing? One page written as several physical chunks; power fails mid-way, some chunks new, some old;
// then the question.
export function PredictTornPage({ t, answer }: StepCtx) {
  const n = Math.min(8, Math.floor(clamp(seg(t, 0.4, 1.4)) * 5));
  return (
    <Svg label="a disk writes a page as several smaller physical chunks — if power fails partway, is the result always all of it or none?" h={210}>
      <Row y={40} label="a page, in chunks" value="power fails mid-way" valueColor={C.cherryText} k={easeOut(seg(t, 0.1, 0.5))} />
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={25 + i * 69} y={62} width={64} height={22} rx={2} fill={i < n ? C.focus : C.mocha} opacity={0.8} />
      ))}
      <line x1={25 + 5 * 69 - 3} y1={56} x2={25 + 5 * 69 - 3} y2={90} stroke={C.cherryText} strokeWidth={2} opacity={easeOut(seg(t, 1.4, 1.7))} />
      <AnswerRow y={140} label="all or nothing" answer={answer} value="no, a mix" f={C.cherryText} k={easeOut(seg(t, 1.2, 1.7))} />
      <Verdict answer={answer} text="part new, part old, and nothing tells which" f={C.cherryText} />
    </Svg>
  );
}

// 5 · Full-page writes. A checkpoint line; the first change to the page writes a whole page image into the WAL (wal_fpi + 1); the
// second change writes only its small record (wal_fpi + 0).
export function RevealFullPageWrite({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.9, 1.6));
  const b = easeOut(seg(t, 2.2, 2.7));
  return (
    <Svg label="a real page changed twice after a checkpoint — how many times does its full defense against tearing fire?" h={240}>
      <Row y={40} label="full_page_writes" value="on" k={easeOut(seg(t, 0.2, 0.7))} />
      <line x1={60} y1={64} x2={60} y2={124} stroke={C.second} strokeWidth={2} opacity={easeOut(seg(t, 0.4, 0.7))} />
      <T x={60} y={140} s={11} f={C.second} a="middle" o={easeOut(seg(t, 0.4, 0.7))}>
        checkpoint
      </T>
      <rect x={80} y={84} width={300 * a} height={22} rx={2} fill={C.focus} opacity={0.75} />
      <T x={90} y={99} s={11} f={C.cocoa} o={easeOut(seg(t, 1.4, 1.7))}>
        change 1: a whole page image
      </T>
      <rect x={390} y={84} width={40 * b} height={22} rx={2} fill={C.crema} opacity={0.75} />
      <T x={440} y={99} s={11} f={C.latte} o={easeOut(seg(t, 2.6, 2.9))}>
        change 2
      </T>
      <Row y={175} label="wal_fpi, change 1" value="+1" valueColor={C.focus} k={easeOut(seg(t, 1.7, 2.1))} />
      <Row y={215} label="wal_fpi, change 2" value="+0" k={easeOut(seg(t, 3.0, 3.5))} />
    </Svg>
  );
}

// 6 · The sync method. Three real wal_sync_method options in three cells; this sandbox's setting, read directly, lights
// fdatasync.
export function RevealSyncMethod({ t }: StepCtx) {
  const s = easeOut(seg(t, 2.2, 2.7));
  return (
    <Svg label="three real ways to force a write out to disk — which one does this sandbox's own cluster actually use?" h={220}>
      <Row y={40} label="wal_sync_method" value="read directly" k={easeOut(seg(t, 0.2, 0.7))} />
      {['fsync', 'fdatasync', 'open_datasync'].map((m, i) => (
        <Cell
          key={m}
          x={25 + i * 190}
          y={72}
          w={170}
          label={m}
          stroke={i === 1 && s > 0 ? C.focus : C.mocha}
          f={i === 1 && s > 0 ? C.focus : C.crema}
          o={easeOut(seg(t, 0.6 + i * 0.4, 1.0 + i * 0.4))}
        />
      ))}
      <MiniTick x={250} y={118} k={easeOut(seg(t, 2.6, 2.9))} />
      <T x={405} y={124} s={11} f={C.latte} o={easeOut(seg(t, 1.6, 1.9))}>
        built on O_DSYNC
      </T>
      <Row y={190} label="this sandbox" value="fdatasync" valueColor={C.focus} k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 7 · InnoDB's doublewrite buffer, sourced. A page goes first to the doublewrite area, then to its real place; at recovery a torn
// home copy is repaired from the doublewrite copy.
export function RevealInnodbDoublewrite({ t }: StepCtx) {
  const a = easeInOut(seg(t, 0.8, 1.4));
  const b = easeInOut(seg(t, 1.6, 2.2));
  const r = easeOut(seg(t, 2.6, 3.1));
  return (
    <Svg label="InnoDB's own documentation, on the identical torn-page problem — the same defense, or a different one?" h={230}>
      <Row y={40} label="InnoDB, from its docs" value="the doublewrite buffer" valueColor={C.second} k={easeOut(seg(t, 0.2, 0.7))} />
      <Cell x={25} y={80} w={120} label="page" o={easeOut(seg(t, 0.4, 0.7))} />
      <path d={`M145 94 H${145 + 85 * a}`} stroke={C.latte} strokeWidth={1.5} />
      <Cell x={230} y={80} w={150} label="doublewrite copy" stroke={C.second} f={C.second} o={a} />
      <path d={`M380 94 H${380 + 75 * b}`} stroke={C.latte} strokeWidth={1.5} />
      <Cell x={455} y={80} w={120} label="its real place" o={b} />
      <path d={`M515 108 C 515 150, 305 150, 305 108`} fill="none" stroke={C.focus} strokeWidth={1.5} strokeDasharray="200" strokeDashoffset={200 * (1 - r)} />
      <T x={410} y={160} s={11} f={C.focus} a="middle" o={r}>
        torn? repaired from the copy
      </T>
      <Row y={205} label="the same problem" value="a different defense" valueColor={C.focus} k={easeOut(seg(t, 3.4, 3.9))} />
    </Svg>
  );
}

// 8 · fsyncgate, sourced. In 2018 an fsync failed, the kernel marked the page clean anyway, and a later retry "succeeded" on
// nothing; PostgreSQL's fix: PANIC, then replay from the last good point.
export function RevealFsyncgate({ t }: StepCtx) {
  return (
    <Svg label="a real, documented failure: an fsync that failed, then lied — what's the only safe response?" h={230}>
      <Row y={40} label="2018, Linux" value="a failed fsync, misreported" valueColor={C.cherryText} k={easeOut(seg(t, 0.2, 0.7))} />
      <Cell x={25} y={70} w={170} label="fsync fails" stroke={C.cherryText} f={C.cherryText} o={easeOut(seg(t, 0.6, 1.0))} />
      <Cell x={215} y={70} w={170} label="page marked clean" f={C.latte} o={easeOut(seg(t, 1.2, 1.6))} />
      <Cell x={405} y={70} w={170} label="retry: “success”" f={C.latte} o={easeOut(seg(t, 1.8, 2.2))} />
      <Cross x={490} y={118} k={easeOut(seg(t, 2.2, 2.5))} />
      <Cell x={25} y={136} w={170} label="PANIC" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 2.6, 3.0))} />
      <path d="M195 150 H215" stroke={C.focus} strokeWidth={1.5} opacity={easeOut(seg(t, 2.9, 3.1))} />
      <Cell x={215} y={136} w={360} label="replay from the last good point" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 3.0, 3.4))} />
      <Row y={210} label="a failed fsync" value="never retried" valueColor={C.focus} k={easeOut(seg(t, 3.5, 4.0))} />
    </Svg>
  );
}

// 9 · Recap. Six rows land one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="an LSN that only moves forward, a group commit, a torn-page defense, a chosen sync method, a different engine's answer, and a hard lesson" h={260}>
      <Row y={30} label="the LSN" value="only moves forward" k={easeOut(seg(t, 0.4, 0.9))} />
      <Row y={70} label="group commit" value="fewer flushes, same rule" valueColor={C.focus} k={easeOut(seg(t, 1.0, 1.5))} />
      <Row y={110} label="full-page writes" value="once per checkpoint" k={easeOut(seg(t, 1.6, 2.1))} />
      <Row y={150} label="this sandbox" value="fdatasync" k={easeOut(seg(t, 2.2, 2.7))} />
      <Row y={190} label="InnoDB" value="a doublewrite buffer" valueColor={C.second} k={easeOut(seg(t, 2.8, 3.3))} />
      <Row y={230} label="a failed fsync" value="PANIC, then replay" valueColor={C.cherryText} k={easeOut(seg(t, 3.4, 3.9))} />
    </Svg>
  );
}

// 10 · Prove: warn and keep running? The script's warning lands; after the answer it is crossed out, and the safe path draws in:
// stop, replay from the last good point.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const c = answer !== null ? easeOut(seg(s, 0.1, 0.4)) : 0;
  const v = answer !== null ? easeOut(seg(s, 0.6, 1.0)) : 0;
  return (
    <Svg label="a monitoring script sees one fsync fail, logs a warning and keeps running — is that safe?" h={230}>
      <Row y={40} label="one fsync fails" value="warn, keep going?" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="that's safe" answer={answer} value="no, crash and replay" f={C.cherryText} k={easeOut(seg(t, 0.4, 0.9))} />
      <Cell x={25} y={112} w={250} label="log a warning, continue" o={easeOut(seg(t, 0.6, 0.9))} />
      <Cross x={290} y={126} k={c} />
      <Cell x={325} y={112} w={250} label="stop, replay" stroke={C.focus} f={C.focus} o={v} />
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, v)} s={15} f={C.focus} a="middle" o={v}>
            what landed can't be trusted
          </T>
          <rect x={150} y={202} width={300 * v} height={3} fill={C.focus} />
        </>
      )}
    </Svg>
  );
}
