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

/** A row of `n` buffer slots; `fill(i)` gives each slot's colour (or null for empty), `hl` marks the slot under the hand. */
function Pool({ y, n = 20, fill, hl = -1, o = 1 }: { y: number; n?: number; fill: (i: number) => string | null; hl?: number; o?: number }) {
  return (
    <g opacity={o}>
      {Array.from({ length: n }, (_, i) => {
        const f = fill(i);
        return <rect key={i} x={25 + i * 27.5} y={y} width={24} height={24} rx={3} fill={f ?? C.cocoa} stroke={i === hl ? C.focus : C.mocha} strokeWidth={i === hl ? 2 : 1} opacity={f ? 0.85 : 1} />;
      })}
    </g>
  );
}

// 1 · Hook. A query asks for the same page again and again; each request without a cache travels the long way down to the disk,
// and a gap opens between query and disk where something must sit.
export function Hook({ t }: StepCtx) {
  return (
    <Svg label="a page sitting on disk is only useful if an engine doesn't have to read it from disk every time. What sits between a query and the disk?" h={220}>
      <Row y={40} label="the same page, again" value="from disk each time?" k={easeOut(seg(t, 0.3, 0.8))} />
      <Cell x={25} y={70} w={110} label="query" o={easeOut(seg(t, 0.4, 0.7))} />
      <Cell x={465} y={70} w={110} label="disk" o={easeOut(seg(t, 0.4, 0.7))} />
      {[0, 1, 2].map((i) => {
        const p = clamp(seg(t, 0.9 + i * 0.6, 1.4 + i * 0.6));
        return p > 0 && p < 1 ? <circle key={i} cx={lerp(140, 460, p)} cy={84} r={5} fill={C.cherryText} /> : null;
      })}
      <rect x={235} y={110} width={130} height={50} rx={6} fill="none" stroke={C.focus} strokeWidth={1.5} strokeDasharray="5 4" opacity={easeOut(seg(t, 2.8, 3.2))} />
      <T x={300} y={141} s={16} f={C.focus} a="middle" o={easeOut(seg(t, 3.1, 3.5))}>
        ?
      </T>
    </Svg>
  );
}

// 2 · The clock sweep. A hand circles a fixed pool; each buffer it passes has its counter knocked down one; the first buffer
// already at zero is the one it reuses. Each buffer's counter is drawn as pips, not a figure.
export function RevealClockSweep({ t }: StepCtx) {
  const counts = [2, 1, 3, 0, 2, 1, 2, 3];
  const pos = Math.min(3, Math.floor(clamp(seg(t, 0.8, 2.6)) * 4));
  const take = easeOut(seg(t, 2.6, 3.0));
  const cx = 300;
  const cy = 140;
  const R = 70;
  return (
    <Svg label="a buffer's own usage counter, read directly off this sandbox's cluster — what actually decides which buffer gets reused?" h={240}>
      <Row y={40} label="a fixed pool" value="a sweeping hand" k={easeOut(seg(t, 0.2, 0.7))} />
      {counts.map((c, i) => {
        const a = (i / counts.length) * Math.PI * 2 - Math.PI / 2;
        const passed = i < pos;
        const shown = passed ? Math.max(0, c - 1) : c;
        const chosen = i === 3 && take > 0;
        return (
          <g key={i} opacity={easeOut(seg(t, 0.3 + i * 0.05, 0.6 + i * 0.05))}>
            <rect x={cx + R * Math.cos(a) - 14} y={cy + R * Math.sin(a) - 12} width={28} height={24} rx={3} fill={chosen ? C.focus : C.cocoa} stroke={chosen ? C.focus : C.mocha} strokeWidth={1.5} />
            {Array.from({ length: shown }, (_, j) => (
              <rect key={j} x={cx + R * Math.cos(a) - 9 + j * 7} y={cy + R * Math.sin(a) - 3} width={5} height={6} rx={1} fill={C.crema} />
            ))}
          </g>
        );
      })}
      {(() => {
        const a = (pos / counts.length) * Math.PI * 2 - Math.PI / 2;
        return <line x1={cx} y1={cy} x2={cx + (R - 20) * Math.cos(a)} y2={cy + (R - 20) * Math.sin(a)} stroke={C.focus} strokeWidth={2.5} opacity={easeOut(seg(t, 0.6, 0.9))} />;
      })()}
      <T x={25} y={110} s={11} f={C.latte} o={easeOut(seg(t, 1.0, 1.3))}>
        each pass: count − 1
      </T>
      <T x={575} y={110} s={11} f={C.focus} a="end" o={take}>
        at zero: reused
      </T>
    </Svg>
  );
}

// 3 · The usage-count cap. The same small table scanned six more times: its buffer's counter climbs one notch per scan, reaches
// 5, and the last scan leaves it at 5.
export function RevealUsageCountCap({ t }: StepCtx) {
  const n = Math.floor(clamp(seg(t, 0.6, 3.0)) * 6.99);
  const count = Math.min(5, n);
  return (
    <Svg label="the same small table, scanned six more times for real — does its usage count keep climbing, or does it stop?" h={230}>
      <Row y={40} label="scanned 6 more times" value={`usage count ${count}`} valueColor={count === 5 ? C.focus : C.crema} k={easeOut(seg(t, 0.2, 0.7))} />
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={25 + i * 40} y={72} width={32} height={14} rx={2} fill={C.second} opacity={i < n ? 0.85 : 0.15} />
      ))}
      <T x={25} y={106} s={11} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        scans
      </T>
      {Array.from({ length: 5 }, (_, i) => (
        <rect key={i} x={360 + i * 40} y={170 - (i + 1) * 14} width={32} height={(i + 1) * 14} rx={2} fill={C.focus} opacity={i < count ? 0.85 : 0.12} />
      ))}
      <line x1={350} y1={100} x2={565} y2={100} stroke={C.cherryText} strokeWidth={1.5} strokeDasharray="4 4" opacity={easeOut(seg(t, 2.6, 3.0))} />
      <T x={350} y={92} s={11} f={C.cherryText} o={easeOut(seg(t, 2.6, 3.0))}>
        the cap
      </T>
      <Row y={210} label="past the cap" value="it stops at 5" valueColor={C.focus} k={easeOut(seg(t, 3.3, 3.8))} />
    </Svg>
  );
}

// 4 · Predict: does a huge scan clear the pool? A long table streams toward a pool full of useful pages; then the question.
export function PredictRingBounded({ t, answer }: StepCtx) {
  return (
    <Svg label="a sequential scan bigger than the whole buffer pool touches thousands of pages, once each — does the ordinary clock sweep evict most of the pool to make room?" h={210}>
      <Row y={40} label="a scan bigger than the pool" value="clears it?" k={easeOut(seg(t, 0.1, 0.5))} />
      <Pool y={62} fill={(i) => (i < 20 * easeOut(seg(t, 0.2, 0.8)) ? C.focus : null)} />
      {Array.from({ length: 14 }, (_, i) => (
        <rect key={i} x={25 + ((i * 40 + t * 120) % 550)} y={98} width={30} height={6} rx={1} fill={C.cherryText} opacity={0.6 * easeOut(seg(t, 0.6, 0.9))} />
      ))}
      <AnswerRow y={140} label="most of it evicted" answer={answer} value="no, a small ring" k={easeOut(seg(t, 1.2, 1.7))} />
      <Verdict answer={answer} text="the scan reuses its own few buffers" />
    </Svg>
  );
}

// 5 · The ring, measured. Over 20,000 pages stream through four ring buffers that keep recycling; the rest of the pool keeps its
// pages untouched, and under 15% of the table stays resident.
export function RevealRingFootprint({ t }: StepCtx) {
  const p = clamp(seg(t, 0.6, 3.0));
  const tick = Math.floor(p * 40);
  return (
    <Svg label="a table built and scanned for real, far bigger than the whole buffer pool — how much of it actually ends up resident?" h={230}>
      <Row y={40} label="over 20,000 pages" value="one full scan" k={easeOut(seg(t, 0.2, 0.7))} />
      <Pool y={70} fill={(i) => (i < 4 ? (p > 0 ? ((i + tick) % 4 === 0 ? C.cherryText : C.second) : null) : C.focus)} />
      <path d="M25 104 h106" stroke={C.second} strokeWidth={2} opacity={easeOut(seg(t, 0.8, 1.1))} />
      <T x={25} y={122} s={11} f={C.second} o={easeOut(seg(t, 0.8, 1.1))}>
        the ring
      </T>
      <T x={575} y={122} s={11} f={C.focus} a="end" o={easeOut(seg(t, 1.6, 1.9))}>
        the rest of the pool, untouched
      </T>
      <rect x={25} y={140} width={550 * p} height={8} rx={2} fill={C.mocha} />
      <rect x={25} y={140} width={550 * 0.12 * easeOut(seg(t, 2.8, 3.2))} height={8} rx={2} fill={C.cherryText} />
      <Row y={200} label="resident after the scan" value="under 15%" valueColor={C.focus} k={easeOut(seg(t, 3.3, 3.8))} />
    </Svg>
  );
}

// 6 · Dirty, then clean. A real update marks its buffer dirty; a checkpoint writes it out, an arrow down to disk, and the same
// flag reads clean.
export function RevealDirtyCheckpoint({ t }: StepCtx) {
  const w = easeInOut(seg(t, 2.0, 2.6));
  return (
    <Svg label="a page just updated for real — is it marked dirty, and does a real checkpoint actually clean it?" h={230}>
      <Row y={40} label="UPDATE hot_demo" value="the buffer's flag" k={easeOut(seg(t, 0.2, 0.7))} />
      <Cell x={25} y={70} w={180} label="hot_demo, page 0" stroke={w > 0.5 ? C.focus : C.cherryText} o={easeOut(seg(t, 0.4, 0.7))} />
      <Cell x={225} y={70} w={150} label="dirty: true" stroke={C.cherryText} f={C.cherryText} o={easeOut(seg(t, 0.9, 1.3))} />
      <Cell x={395} y={70} w={180} label="CHECKPOINT" stroke={C.second} f={C.second} o={easeOut(seg(t, 1.6, 2.0))} />
      <path d={`M115 98 V${98 + 40 * w}`} stroke={C.second} strokeWidth={2} />
      <Cell x={25} y={140} w={180} h={24} label="disk" o={easeOut(seg(t, 2.0, 2.3))} />
      <Cell x={225} y={140} w={150} label="dirty: false" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 2.7, 3.1))} />
      <Row y={210} label="a real checkpoint" value="cleaned it" valueColor={C.focus} k={easeOut(seg(t, 3.3, 3.8))} />
    </Svg>
  );
}

// 7 · Double caching. The same page sits in the engine's buffer pool and again in the OS page cache above the disk; O_DIRECT
// takes the OS copy out, and the engine carries the caching alone.
export function RevealDoubleCaching({ t }: StepCtx) {
  const d = easeOut(seg(t, 2.0, 2.5));
  return (
    <Svg label="the same page, cached twice — once by the OS, once by the engine — what does one Linux flag trade away to stop that?" h={240}>
      <Row y={40} label="one page" value="cached twice" valueColor={C.cherryText} k={easeOut(seg(t, 0.2, 0.7))} />
      <T x={25} y={84} s={12} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        buffer pool
      </T>
      <Cell x={200} y={68} w={90} label="page" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 0.5, 0.8))} />
      <T x={25} y={124} s={12} f={C.latte} o={easeOut(seg(t, 0.9, 1.2))}>
        OS page cache
      </T>
      <Cell x={200} y={108} w={90} label="page" stroke={C.cherryText} f={C.cherryText} o={easeOut(seg(t, 1.0, 1.3)) * (1 - d * 0.75)} />
      <Cross x={310} y={122} k={d} />
      <T x={25} y={164} s={12} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        disk
      </T>
      <Cell x={360} y={108} w={215} label="O_DIRECT" stroke={C.second} f={C.second} o={easeOut(seg(t, 1.6, 2.0))} />
      <T x={360} y={156} s={11} f={C.latte} o={easeOut(seg(t, 2.6, 2.9))}>
        the engine caches alone
      </T>
      <Row y={215} label="the trade" value="all the caching work" valueColor={C.second} k={easeOut(seg(t, 3.3, 3.8))} />
    </Svg>
  );
}

// 8 · PostgreSQL 18's async I/O. The second cluster reports io_method = worker; a real scan's bulk reads fan out through worker
// processes, and the bulkread counters climb.
export function RevealPg18Aio({ t }: StepCtx) {
  const p = clamp(seg(t, 1.4, 3.0));
  return (
    <Svg label="this sandbox's own second cluster, PostgreSQL 18 — is its io_method setting just a name in the docs, or does it show up as real, measured I/O?" h={230}>
      <Row y={40} label="PostgreSQL 18" value="io_method = worker" valueColor={C.second} k={easeOut(seg(t, 0.2, 0.7))} />
      <Cell x={25} y={80} w={120} label="a scan" o={easeOut(seg(t, 0.5, 0.8))} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <path d={`M145 94 L235 ${74 + i * 22}`} stroke={C.latte} strokeWidth={1.2} opacity={easeOut(seg(t, 0.9, 1.2))} />
          <Cell x={235} y={64 + i * 22} w={110} h={20} label="I/O worker" stroke={C.second} o={easeOut(seg(t, 0.9 + i * 0.1, 1.2 + i * 0.1))} />
        </g>
      ))}
      {Array.from({ length: 8 }, (_, i) => {
        const q = clamp(p * 8 - i);
        return q > 0 && q < 1 ? <rect key={i} x={lerp(345, 470, q)} y={70 + (i % 3) * 22} width={10} height={8} rx={1} fill={C.focus} /> : null;
      })}
      <Cell x={475} y={80} w={100} label="bulkread" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 1.2, 1.6))} />
      <Row y={200} label="reads and hits" value="real, counted" valueColor={C.focus} k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 9 · Recap. Five rows land one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a buffer's own clock sweep, a ring-bounded footprint, a dirty page cleaned by a checkpoint, and a real async I/O subsystem measured on a second cluster" h={250}>
      <Row y={35} label="a clock sweep" value="usage count, capped at 5" k={easeOut(seg(t, 0.4, 0.9))} />
      <Row y={80} label="a huge scan" value="a small ring" valueColor={C.focus} k={easeOut(seg(t, 1.1, 1.6))} />
      <Row y={125} label="a dirty page" value="cleaned by a checkpoint" k={easeOut(seg(t, 1.8, 2.3))} />
      <Row y={170} label="double caching" value="O_DIRECT skips it" valueColor={C.second} k={easeOut(seg(t, 2.5, 3.0))} />
      <Row y={215} label="PostgreSQL 18" value="async I/O, measured" k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 10 · Prove: two huge scans back to back. Each scan streams through its own small ring; after the answer the rest of the pool
// stays lit through both.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.4, 0.9)) : 0;
  return (
    <Svg label="a dashboard query's scan runs right after a reporting job's own big scan evicted the pool — does the dashboard query get slowed down by it?" h={230}>
      <Row y={40} label="two huge scans, back to back" value="slowed?" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="the pool was used up" answer={answer} value="no, each its own ring" k={easeOut(seg(t, 0.4, 0.9))} />
      <Pool y={112} fill={(i) => (i < 3 ? C.cherryText : i >= 17 ? C.second : C.focus)} o={easeOut(seg(t, 0.6, 1.0))} />
      <T x={25} y={158} s={11} f={C.cherryText} o={easeOut(seg(t, 0.8, 1.1))}>
        report's ring
      </T>
      <T x={575} y={158} s={11} f={C.second} a="end" o={easeOut(seg(t, 0.9, 1.2))}>
        dashboard's ring
      </T>
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, v)} s={15} f={C.focus} a="middle" o={v}>
            neither evicts the pool
          </T>
          <rect x={150} y={202} width={300 * v} height={3} fill={C.focus} />
        </>
      )}
    </Svg>
  );
}
