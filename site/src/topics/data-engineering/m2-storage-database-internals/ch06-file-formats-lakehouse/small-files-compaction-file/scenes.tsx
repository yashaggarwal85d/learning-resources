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

/** A tiny file pip: one small file, at grid slot i of a 20-wide grid starting at (x, y). */
function Pip({ x, y, i, o, f = C.latte }: { x: number; y: number; i: number; o: number; f?: string }) {
  return <rect x={x + (i % 20) * 13} y={y + Math.floor(i / 20) * 13} width={9} height={9} rx={1.5} fill={C.cocoa} stroke={f} strokeWidth={1.1} opacity={o} />;
}

// 1 · Hook. A snapshot with three well-sized files under it; then each file splinters into a scatter of tiny ones.
export function Hook({ t }: StepCtx) {
  const sp = easeOut(seg(t, 1.8, 2.6));
  return (
    <Svg label="last topic was how far back a table lets you go -- this topic is what's underneath it." h={200}>
      <circle cx={70} cy={50} r={14} fill={C.cocoa} stroke={C.focus} strokeWidth={2} opacity={easeOut(seg(t, 0.1, 0.4))} />
      <T x={95} y={55} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        a snapshot
      </T>
      {[0, 1, 2].map((i) => (
        <rect key={i} x={40 + i * 70} y={90} width={50} height={70} rx={3} fill={C.cocoa} stroke={C.latte} strokeWidth={1.4} opacity={easeOut(seg(t, 0.4 + i * 0.2, 0.7 + i * 0.2)) * (1 - sp)} />
      ))}
      <T x={40} y={185} s={11} f={C.latte} o={easeOut(seg(t, 0.8, 1.1)) * (1 - sp)}>
        files of a sensible size
      </T>
      {Array.from({ length: 60 }, (_, i) => (
        <Pip key={i} x={300} y={70} i={i} o={easeOut(seg(t, 1.9 + i * 0.02, 2.1 + i * 0.02))} />
      ))}
      <T x={300} y={160} s={14} f={C.cherryText} a="middle" o={easeOut(seg(t, 3.2, 3.6))}>
        and if they are small, and many?
      </T>
    </Svg>
  );
}

// 2 · Predict. Micro-batch ticks along a line, each dropping one small file; the answer: yes, per file.
export function PredictSmallFilesCostExtra({ t, answer }: StepCtx) {
  return (
    <Svg label="a streaming job commits one small file per micro-batch -- does that cost anything beyond the bytes?" h={200}>
      <line x1={25} y1={40} x2={560} y2={40} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.1, 0.3))} />
      {Array.from({ length: 12 }, (_, i) => (
        <g key={i} opacity={easeOut(seg(t, 0.3 + i * 0.12, 0.45 + i * 0.12))}>
          <line x1={45 + i * 44} y1={34} x2={45 + i * 44} y2={46} stroke={C.second} strokeWidth={2} />
          <rect x={39 + i * 44} y={58} width={12} height={16} rx={2} fill={C.cocoa} stroke={C.latte} strokeWidth={1.2} />
        </g>
      ))}
      <T x={25} y={100} s={11} f={C.latte} o={easeOut(seg(t, 1.9, 2.2))}>
        one micro-batch, one small file
      </T>
      <AnswerRow y={140} label="cost beyond the bytes" answer={answer} value="yes, per file" k={easeOut(seg(t, 2.4, 2.9))} />
      <Verdict answer={answer} y={188} text="the count is the cost" />
    </Svg>
  );
}

// 3 · 200 files, for real. A 20-wide grid fills with 200 file pips, one commit at a time, while a count climbs; then the
// totals: 2,000 bytes each, 400,000 bytes, one partition.
export function RevealStreamingProducesManySmallFiles({ t }: StepCtx) {
  const n = Math.round(200 * easeInOut(seg(t, 0.4, 3.0)));
  return (
    <Svg label="reproduced for real: a streaming pattern writes 200 real small files for one partition." h={230}>
      {Array.from({ length: 200 }, (_, i) => (
        <Pip key={i} x={25} y={25} i={i} o={i < n ? 1 : 0} />
      ))}
      <T x={300} y={40} s={13} f={C.crema} o={easeOut(seg(t, 0.4, 0.7))}>
        {`files: ${n}`}
      </T>
      <T x={300} y={75} s={12} f={C.latte} o={easeOut(seg(t, 3.0, 3.3))}>
        2,000 bytes each
      </T>
      <T x={25} y={180} s={13} f={C.crema} o={easeOut(seg(t, 3.4, 3.7))}>
        400,000 bytes in total
      </T>
      <T x={25} y={212} s={13} f={C.second} o={easeOut(seg(t, 3.8, 4.1))}>
        all one partition
      </T>
    </Svg>
  );
}

// 4 · Iceberg's words. Files appear one by one; for each, a manifest line is added and an "open" tick is charged; the
// data each file holds is drawn as a small, unremarked fill.
export function RevealMoreFilesMoreMetadata({ t }: StepCtx) {
  return (
    <Svg label="Iceberg's own words: more files means more metadata and slower file opens." h={230}>
      <T x={25} y={25} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        files
      </T>
      <T x={250} y={25} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        manifest
      </T>
      <T x={430} y={25} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        opens
      </T>
      {Array.from({ length: 6 }, (_, i) => {
        const b = 0.4 + i * 0.4;
        const y = 38 + i * 24;
        return (
          <g key={i}>
            <rect x={25} y={y} width={22} height={18} rx={2} fill={C.cocoa} stroke={C.latte} strokeWidth={1.2} opacity={easeOut(seg(t, b, b + 0.2))} />
            <rect x={250} y={y + 6} width={140 * easeOut(seg(t, b + 0.1, b + 0.35))} height={6} rx={1} fill={C.second} />
            <circle cx={440} cy={y + 9} r={5} fill={C.cherryText} opacity={easeOut(seg(t, b + 0.2, b + 0.4))} />
          </g>
        );
      })}
      <T x={25} y={210} s={13} f={C.focus} o={easeOut(seg(t, 3.4, 3.8))}>
        both grow with the count, not the bytes
      </T>
    </Svg>
  );
}

// 5 · Both costs, measured. Two rows: 200 bytes of manifest per file times 200 files is 40,000; 50 open units per file
// times 200 is 10,000; each total grows in as a bar.
export function RevealMetadataAndOpenCostMeasured({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: 200 small files cost real extra manifest bytes and real extra open overhead." h={230}>
      <T x={25} y={35} s={12} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        manifest: 200 bytes per file
      </T>
      <rect x={25} y={50} width={400 * easeInOut(seg(t, 0.8, 1.8))} height={18} rx={2} fill={C.second} />
      <T x={25} y={95} s={14} f={C.second} o={easeOut(seg(t, 1.7, 2.0))}>
        200 files: 40,000 bytes
      </T>
      <T x={25} y={135} s={12} f={C.latte} o={easeOut(seg(t, 2.1, 2.4))}>
        open cost: 50 units per file
      </T>
      <rect x={25} y={150} width={400 * easeInOut(seg(t, 2.6, 3.6))} height={18} rx={2} fill={C.cherryText} />
      <T x={25} y={195} s={14} f={C.cherryText} o={easeOut(seg(t, 3.5, 3.8))}>
        200 files: 10,000 units
      </T>
    </Svg>
  );
}

// 6 · Bin-pack. The 200 pips flow, in order, into ten target-sized bins that fill left to right; then a tick: every byte,
// same order.
export function RevealBinPackCompaction({ t }: StepCtx) {
  const f = easeInOut(seg(t, 0.8, 3.0));
  return (
    <Svg label="reproduced for real: a bin-pack compaction repacks the same 200 files' real bytes into 10." h={230}>
      {Array.from({ length: 200 }, (_, i) => (
        <Pip key={i} x={25} y={12} i={i} o={easeOut(seg(t, 0.1, 0.4)) * (i / 200 >= f ? 1 : 0.15)} />
      ))}
      {Array.from({ length: 10 }, (_, b) => {
        const k = clamp(f * 10 - b, 0, 1);
        return (
          <g key={b}>
            <rect x={25 + b * 54} y={160} width={44} height={36} rx={3} fill={C.cocoa} stroke={k >= 1 ? C.focus : C.latte} strokeWidth={1.5} opacity={easeOut(seg(t, 0.4, 0.7))} />
            <rect x={28 + b * 54} y={193 - 30 * k} width={38} height={30 * k} rx={2} fill={C.second} opacity={0.6} />
          </g>
        );
      })}
      <T x={25} y={150} s={11} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        10 files, 40,000 bytes each
      </T>
      <MiniTick x={370} y={142} k={easeOut(seg(t, 3.3, 3.6))} />
      <T x={390} y={150} s={12} f={C.focus} o={easeOut(seg(t, 3.4, 3.7))}>
        every byte, in order
      </T>
    </Svg>
  );
}

// 7 · Costs collapse. Four rows, before and after: files, manifest bytes and open units shrink their bars by the same
// factor; the data row's bar stays exactly where it was.
export function RevealCostsCollapse({ t }: StepCtx) {
  const s = easeInOut(seg(t, 1.6, 2.8));
  const rows = [
    { l: 'files', a: '200', b: '10', shrink: true },
    { l: 'manifest bytes', a: '40,000', b: '2,000', shrink: true },
    { l: 'open units', a: '10,000', b: '500', shrink: true },
    { l: 'data bytes', a: '400,000', b: '400,000', shrink: false },
  ];
  return (
    <Svg label="reproduced for real: manifest bytes and open overhead collapse together -- the data never changes." h={230}>
      <T x={300} y={22} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        before
      </T>
      <T x={450} y={22} s={11} f={C.focus} o={easeOut(seg(t, 2.6, 2.9))}>
        after
      </T>
      {rows.map((r, i) => {
        const y = 45 + i * 40;
        return (
          <g key={r.l}>
            <T x={25} y={y + 12} s={12} f={C.crema} o={easeOut(seg(t, 0.2 + i * 0.2, 0.5 + i * 0.2))}>
              {r.l}
            </T>
            <rect x={170} y={y} width={r.shrink ? lerp(110, 5.5, s) : 110} height={16} rx={2} fill={r.shrink ? C.second : C.focus} opacity={easeOut(seg(t, 0.3 + i * 0.2, 0.6 + i * 0.2))} />
            <T x={300} y={y + 12} s={12} f={C.latte} o={easeOut(seg(t, 0.4 + i * 0.2, 0.7 + i * 0.2))}>
              {r.a}
            </T>
            <T x={450} y={y + 12} s={12} f={C.focus} o={easeOut(seg(t, 2.6 + i * 0.2, 2.9 + i * 0.2))}>
              {r.b}
            </T>
          </g>
        );
      })}
      <T x={25} y={218} s={13} f={C.focus} o={easeOut(seg(t, 3.8, 4.2))}>
        same factor down; the data untouched
      </T>
    </Svg>
  );
}

// 8 · Predict. A streaming writer still dropping files into a partition while a compaction box closes over the same
// files; the answer: a real conflict.
export function PredictCompactingLivePartition({ t, answer }: StepCtx) {
  return (
    <Svg label="a streaming job is still actively writing to a partition -- is compacting it right now a free action?" h={200}>
      <Cell x={25} y={40} w={110} h={30} label="stream" o={easeOut(seg(t, 0.1, 0.4))} />
      <Req x1={137} x2={218} y={55} k={easeOut(seg(t, 0.4, 0.8))} />
      {Array.from({ length: 16 }, (_, i) => (
        <rect
          key={i}
          x={225 + (i % 8) * 20}
          y={38 + Math.floor(i / 8) * 20}
          width={12}
          height={14}
          rx={2}
          fill={C.cocoa}
          stroke={C.latte}
          strokeWidth={1.1}
          opacity={easeOut(seg(t, 0.5 + i * 0.08, 0.6 + i * 0.08))}
        />
      ))}
      <rect x={218} y={30} width={170} height={52} rx={4} fill="none" stroke={C.second} strokeWidth={2} strokeDasharray="5 4" opacity={easeOut(seg(t, 1.6, 2.0))} />
      <T x={400} y={60} s={12} f={C.second} o={easeOut(seg(t, 1.7, 2.0))}>
        compaction
      </T>
      <AnswerRow y={140} label="compacting it now" answer={answer} value="a real conflict" k={easeOut(seg(t, 2.3, 2.8))} f={C.cherryText} />
      <Verdict answer={answer} y={188} text="a compaction is a commit too" f={C.cherryText} />
    </Svg>
  );
}

// 9 · Compression. The same bytes compressed two ways: as 200 separate streams, a longer bar; as one stream, a shorter
// one; the gap between them is marked as the lost cross-file patterns.
export function RevealCompressionWorse({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: the same bytes compress worse split into 200 files than as one stream." h={230}>
      <T x={25} y={40} s={12} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        compressed as 200 streams
      </T>
      <rect x={25} y={52} width={460 * easeInOut(seg(t, 0.6, 1.6))} height={20} rx={2} fill={C.cherryText} />
      <T x={25} y={115} s={12} f={C.latte} o={easeOut(seg(t, 1.8, 2.1))}>
        compressed as one stream
      </T>
      <rect x={25} y={127} width={340 * easeInOut(seg(t, 2.2, 3.0))} height={20} rx={2} fill={C.focus} />
      <line x1={365} y1={120} x2={365} y2={80} stroke={C.taupe} strokeWidth={1.2} strokeDasharray="3 3" opacity={easeOut(seg(t, 3.1, 3.4))} />
      <rect x={365} y={150} width={120} height={3} fill={C.second} opacity={easeOut(seg(t, 3.2, 3.5))} />
      <T x={365} y={172} s={11} f={C.second} o={easeOut(seg(t, 3.3, 3.6))}>
        lost across file edges
      </T>
      <T x={25} y={215} s={13} f={C.latte} o={easeOut(seg(t, 3.9, 4.3))}>
        same bytes in, more bytes out
      </T>
    </Svg>
  );
}

// 10 · Who runs it. Two managed offerings that compact on their own, then the other answer, a job you schedule; under
// them a timeline of a writer's commits, where a compaction slot has to be placed among them.
export function RevealSchedulingAndManagedOfferings({ t }: StepCtx) {
  const slot = lerp(150, 330, easeInOut(seg(t, 3.0, 3.8)));
  return (
    <Svg label="AWS's and Databricks' own words: compaction runs itself today, or it's a job someone schedules." h={230}>
      <Cell x={25} y={20} w={260} h={30} label="S3 Tables: automatic" stroke={C.focus} o={easeOut(seg(t, 0.2, 0.5))} />
      <Cell x={300} y={20} w={275} h={30} label="predictive optimization" stroke={C.focus} o={easeOut(seg(t, 0.8, 1.1))} />
      <T x={300} y={70} s={11} f={C.latte} o={easeOut(seg(t, 1.0, 1.3))}>
        Databricks runs OPTIMIZE itself
      </T>
      <Cell x={25} y={60} w={260} h={30} label="or: a job you schedule" o={easeOut(seg(t, 1.6, 1.9))} />
      <line x1={25} y1={150} x2={560} y2={150} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 2.0, 2.3))} />
      {Array.from({ length: 10 }, (_, i) => (
        <line key={i} x1={50 + i * 55} y1={142} x2={50 + i * 55} y2={158} stroke={C.latte} strokeWidth={2} opacity={easeOut(seg(t, 2.1 + i * 0.06, 2.3 + i * 0.06))} />
      ))}
      <T x={25} y={130} s={11} f={C.latte} o={easeOut(seg(t, 2.2, 2.5))}>
        the writer's commits
      </T>
      <rect x={slot} y={140} width={40} height={20} rx={3} fill="none" stroke={C.second} strokeWidth={2.2} opacity={easeOut(seg(t, 2.8, 3.1))} />
      <T x={25} y={210} s={13} f={C.second} o={easeOut(seg(t, 3.9, 4.3))}>
        when it runs is a real decision
      </T>
    </Svg>
  );
}

// 11 · Recap.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="file count alone drives metadata and open cost; compaction collapses both without touching the data." h={250}>
      <Row y={40} label="the cost" value="the file count" valueColor={C.cherryText} k={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={100} label="bin-pack" value="collapses both" valueColor={C.focus} k={easeOut(seg(t, 1.2, 1.6))} />
      <Row y={160} label="the data" value="untouched" k={easeOut(seg(t, 2.2, 2.6))} />
      <Row y={220} label="who runs it" value="itself, or a schedule" valueColor={C.second} k={easeOut(seg(t, 3.2, 3.6))} />
    </Svg>
  );
}
