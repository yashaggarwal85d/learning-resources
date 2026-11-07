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

const ACTIONS = [['metaData', 'protocol', 'add v0a', 'add v0b'], ['add v1'], ['remove v0a', 'add v2'], ['protocol'], ['add v4']];
const vname = (v: number) => `${'0'.repeat(19)}${v}.json`;

/** A small log file card for version v at (x, y). */
function LogFile({ x, y, v, o = 1, stroke = C.latte, w = 70 }: { x: number; y: number; v: number; o?: number; stroke?: string; w?: number }) {
  return <Cell x={x} y={y} w={w} h={26} label={`v${v}`} stroke={stroke} o={o} />;
}

// 1 · Hook. A small metadata tree on the left, Iceberg's shape; on the right, a stack of JSON lines grows one by one,
// Delta's shape.
export function Hook({ t }: StepCtx) {
  return (
    <Svg label="iceberg's transaction log is a metadata tree. this topic opens the delta arc: an ordered json log." h={200}>
      <T x={25} y={25} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        Iceberg: a tree of files
      </T>
      <rect x={95} y={40} width={60} height={22} rx={3} fill={C.cocoa} stroke={C.second} strokeWidth={1.4} opacity={easeOut(seg(t, 0.2, 0.5))} />
      {[0, 1, 2].map((i) => (
        <g key={i} opacity={easeOut(seg(t, 0.5 + i * 0.1, 0.8 + i * 0.1))}>
          <line x1={125} y1={62} x2={45 + i * 80} y2={100} stroke={C.mocha} strokeWidth={1.2} />
          <rect x={25 + i * 80} y={100} width={40} height={20} rx={3} fill={C.cocoa} stroke={C.latte} strokeWidth={1.2} />
        </g>
      ))}
      <T x={330} y={25} s={11} f={C.focus} o={easeOut(seg(t, 1.2, 1.5))}>
        Delta: an ordered JSON log
      </T>
      {[0, 1, 2, 3, 4].map((v) => (
        <rect key={v} x={330} y={40 + v * 22} width={230} height={16} rx={2} fill={C.cocoa} stroke={C.focus} strokeWidth={1.2} opacity={easeOut(seg(t, 1.5 + v * 0.3, 1.8 + v * 0.3))} />
      ))}
      <T x={25} y={185} s={13} f={C.crema} o={easeOut(seg(t, 3.6, 4.0))}>
        same job, a different shape
      </T>
    </Svg>
  );
}

// 2 · Predict. Five log files, v0 to v4, each a diff; the answer: all five, in order.
export function PredictReplayOrLatest({ t, answer }: StepCtx) {
  return (
    <Svg label="five real json commits sit in _delta_log. what do you need to read to know what files are in the table right now?" h={200}>
      {[0, 1, 2, 3, 4].map((v) => (
        <LogFile key={v} x={25 + v * 90} y={35} v={v} o={easeOut(seg(t, 0.1 + v * 0.15, 0.4 + v * 0.15))} />
      ))}
      <T x={25} y={90} s={11} f={C.latte} o={easeOut(seg(t, 1.0, 1.3))}>
        each one a diff against the last
      </T>
      <T x={470} y={52} s={14} f={C.second} o={easeOut(seg(t, 1.6, 2.0))}>
        read?
      </T>
      <AnswerRow y={140} label="you must read" answer={answer} value="all five, in order" k={easeOut(seg(t, 2.2, 2.7))} />
      <Verdict answer={answer} y={188} text="no shortcut yet" />
    </Svg>
  );
}

// 3 · Five commits. Each version's 20-digit file name lands, and beside it its action lines, one per line.
export function RevealFiveRealCommits({ t }: StepCtx) {
  return (
    <Svg label="five real commits, written by hand to spec: 00000000000000000000.json through ...0004.json." h={230}>
      {ACTIONS.map((acts, v) => {
        const y = 25 + v * 40;
        const b = 0.2 + v * 0.65;
        return (
          <g key={v}>
            <T x={25} y={y + 12} s={11} f={C.crema} o={easeOut(seg(t, b, b + 0.3))}>
              {vname(v)}
            </T>
            <T x={250} y={y + 12} s={11} f={acts[0].startsWith('remove') ? C.cherryText : C.second} o={easeOut(seg(t, b + 0.25, b + 0.55))}>
              {acts.join(' / ')}
            </T>
          </g>
        );
      })}
      <T x={25} y={225} s={12} f={C.latte} o={easeOut(seg(t, 3.7, 4.1))}>
        newline-delimited JSON, one action per line
      </T>
    </Svg>
  );
}

// 4 · Replayed by hand. Versions are read in order; a live-files panel adds and removes as each lands; v0a goes in, then is
// struck by v2's remove; the totals land: 4 live files, 9 rows.
export function RevealReconstructedByHand({ t }: StepCtx) {
  const files = [
    { n: 'v0a', in: 0, out: 2, rows: 2 },
    { n: 'v0b', in: 0, rows: 2 },
    { n: 'v1', in: 1, rows: 2 },
    { n: 'v2', in: 2, rows: 2 },
    { n: 'v4', in: 4, rows: 3 },
  ];
  const at = (v: number) => 0.4 + v * 0.55;
  return (
    <Svg label="reconstructed by hand, from nothing but the raw log: 4 live files, 9 rows." h={230}>
      {[0, 1, 2, 3, 4].map((v) => (
        <LogFile key={v} x={25} y={20 + v * 36} v={v} w={60} stroke={t > at(v) ? C.focus : C.latte} o={easeOut(seg(t, 0.1, 0.3))} />
      ))}
      <T x={200} y={22} s={11} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        live files
      </T>
      {files.map((f, i) => {
        const gone = f.out !== undefined && t > at(f.out) + 0.2;
        return (
          <g key={f.n}>
            <Cell
              x={200 + i * 75}
              y={35}
              w={65}
              h={28}
              label={f.n}
              stroke={gone ? C.cherryText : C.focus}
              f={gone ? C.cherryText : C.crema}
              o={easeOut(seg(t, at(f.in) + 0.1, at(f.in) + 0.35)) * (gone ? 0.5 : 1)}
            />
            {gone && <line x1={205 + i * 75} y1={49} x2={260 + i * 75} y2={49} stroke={C.cherryText} strokeWidth={2} />}
          </g>
        );
      })}
      <T x={200} y={115} s={14} f={C.focus} o={easeOut(seg(t, 3.3, 3.6))}>
        4 live files, 9 rows
      </T>
      <T x={200} y={150} s={11} f={C.cherryText} o={easeOut(seg(t, 1.8, 2.1))}>
        v0a: added in v0, removed in v2
      </T>
    </Svg>
  );
}

// 5 · Predict. The log, v0 to v4, with a checkpoint pinned at v2; the answer: start at the checkpoint.
export function PredictCheckpointShortCircuit({ t, answer }: StepCtx) {
  return (
    <Svg label="a real checkpoint gets written at version 2. to get version 4's state, does a reader still replay version 0?" h={200}>
      {[0, 1, 2, 3, 4].map((v) => (
        <LogFile key={v} x={25 + v * 90} y={60} v={v} o={easeOut(seg(t, 0.1 + v * 0.1, 0.3 + v * 0.1))} stroke={v === 2 ? C.second : C.latte} />
      ))}
      <Cell x={190} y={15} w={120} h={26} label="checkpoint" stroke={C.second} f={C.second} o={easeOut(seg(t, 0.8, 1.1))} />
      <line x1={250} y1={41} x2={250} y2={58} stroke={C.second} strokeWidth={1.6} opacity={easeOut(seg(t, 0.9, 1.2))} />
      <T x={470} y={40} s={13} f={C.crema} o={easeOut(seg(t, 1.6, 2.0))}>
        still v0?
      </T>
      <AnswerRow y={140} label="to reach v4" answer={answer} value="start at v2" k={easeOut(seg(t, 2.2, 2.7))} />
      <Verdict answer={answer} y={188} text="then replay only what is newer" />
    </Svg>
  );
}

// 6 · Checkpoint matches. The Parquet checkpoint's file list on the left; a from-scratch replay of v0 to v2 on the right;
// each matching pair is joined and ticked.
export function RevealCheckpointMatchesReplay({ t }: StepCtx) {
  const live = ['v0b', 'v1', 'v2'];
  return (
    <Svg label="a real parquet checkpoint, verified against an independent from-scratch replay." h={230}>
      <T x={25} y={25} s={11} f={C.second} o={easeOut(seg(t, 0.1, 0.4))}>
        checkpoint at v2, Parquet
      </T>
      <T x={350} y={25} s={11} f={C.latte} o={easeOut(seg(t, 1.0, 1.3))}>
        replay of v0 to v2
      </T>
      {live.map((n, i) => (
        <g key={n}>
          <Cell x={25} y={40 + i * 42} w={140} h={30} label={n} stroke={C.second} o={easeOut(seg(t, 0.3 + i * 0.2, 0.6 + i * 0.2))} />
          <Cell x={350} y={40 + i * 42} w={140} h={30} label={n} o={easeOut(seg(t, 1.2 + i * 0.2, 1.5 + i * 0.2))} />
          <line x1={167} y1={55 + i * 42} x2={lerp(167, 348, easeOut(seg(t, 2.0 + i * 0.25, 2.4 + i * 0.25)))} y2={55 + i * 42} stroke={C.focus} strokeWidth={1.4} />
          <MiniTick x={505} y={52 + i * 42} k={easeOut(seg(t, 2.4 + i * 0.25, 2.7 + i * 0.25))} />
        </g>
      ))}
      <T x={25} y={200} s={13} f={C.focus} o={easeOut(seg(t, 3.4, 3.8))}>
        equal to a full replay, just faster
      </T>
    </Svg>
  );
}

// 7 · Short-circuit. Two paths to v4: a long one replaying v0 through v4, and a short one starting at the v2 checkpoint
// and replaying v3 and v4; both arrive at the same file set; _last_checkpoint points at v2.
export function RevealShortCircuited({ t }: StepCtx) {
  return (
    <Svg label="short-circuited for real: v2 checkpoint + replaying v3-v4 gives the same answer as replaying from v0." h={230}>
      <T x={25} y={25} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        from v0
      </T>
      {[0, 1, 2, 3, 4].map((v) => (
        <LogFile key={v} x={110 + v * 75} y={10} v={v} w={60} o={easeOut(seg(t, 0.2 + v * 0.15, 0.4 + v * 0.15))} />
      ))}
      <T x={25} y={85} s={11} f={C.focus} o={easeOut(seg(t, 1.2, 1.5))}>
        from v2
      </T>
      <Cell x={110} y={70} w={135} h={26} label="checkpoint v2" stroke={C.second} o={easeOut(seg(t, 1.3, 1.6))} />
      <LogFile x={335} y={70} v={3} w={60} stroke={C.focus} o={easeOut(seg(t, 1.6, 1.9))} />
      <LogFile x={410} y={70} v={4} w={60} stroke={C.focus} o={easeOut(seg(t, 1.8, 2.1))} />
      <T x={110} y={135} s={13} f={C.focus} o={easeOut(seg(t, 2.4, 2.7))}>
        identical file set, either way
      </T>
      <Cell x={110} y={160} w={170} h={28} label="_last_checkpoint" stroke={C.second} o={easeOut(seg(t, 3.0, 3.3))} />
      <Req x1={282} x2={370} y={174} k={easeOut(seg(t, 3.2, 3.6))} f={C.second} label="version 2" />
      <T x={25} y={220} s={11} f={C.latte} o={easeOut(seg(t, 3.7, 4.1))}>
        found without listing the directory
      </T>
    </Svg>
  );
}

// 8 · Compaction and checksum. A compaction file for [3, 4] beside reading v3 and v4 directly, ticked equal; a checksum card
// whose two numbers are computed from the live files: numFiles 4, tableSizeBytes 3,293.
export function RevealCompactionAndChecksum({ t }: StepCtx) {
  return (
    <Svg label="a real log compaction file, and a real version checksum, both computed from real state." h={230}>
      <Cell x={25} y={25} w={170} h={30} label="compaction [3, 4]" stroke={C.second} o={easeOut(seg(t, 0.2, 0.5))} />
      <T x={215} y={45} s={13} f={C.latte} o={easeOut(seg(t, 0.6, 0.9))}>
        =
      </T>
      <LogFile x={245} y={27} v={3} w={60} o={easeOut(seg(t, 0.7, 1.0))} />
      <LogFile x={315} y={27} v={4} w={60} o={easeOut(seg(t, 0.8, 1.1))} />
      <MiniTick x={395} y={36} k={easeOut(seg(t, 1.3, 1.6))} />
      <T x={25} y={100} s={11} f={C.latte} o={easeOut(seg(t, 1.8, 2.1))}>
        version checksum, from the live files
      </T>
      <Row y={140} label="numFiles" value="4" k={easeOut(seg(t, 2.2, 2.6))} />
      <Row y={190} label="tableSizeBytes" value={num(3293 * easeOut(seg(t, 2.8, 3.6)), 0)} valueColor={C.focus} k={easeOut(seg(t, 2.8, 3.1))} />
    </Svg>
  );
}

// 9 · Two vocabularies. v0's protocol in bare numbers on the left; v3's in named features on the right, with the
// upgrade arrow between.
export function RevealProtocolVsFeatures({ t }: StepCtx) {
  return (
    <Svg label="the same protocol, two vocabularies: numeric versions at v0, named table features after a real upgrade at v3." h={230}>
      <T x={25} y={25} s={12} f={C.crema} o={easeOut(seg(t, 0.1, 0.4))}>
        v0 protocol
      </T>
      <T x={25} y={55} s={11} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        minReaderVersion: 1
      </T>
      <T x={25} y={80} s={11} f={C.latte} o={easeOut(seg(t, 0.6, 0.9))}>
        minWriterVersion: 2
      </T>
      <Req x1={190} x2={290} y={65} k={easeOut(seg(t, 1.2, 1.7))} f={C.focus} />
      <T x={240} y={100} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 1.4, 1.7))}>
        upgrade at v3
      </T>
      <T x={300} y={25} s={12} f={C.focus} o={easeOut(seg(t, 1.6, 1.9))}>
        v3 protocol
      </T>
      <T x={300} y={55} s={11} f={C.latte} o={easeOut(seg(t, 1.9, 2.2))}>
        minReaderVersion: 3
      </T>
      <T x={300} y={80} s={11} f={C.latte} o={easeOut(seg(t, 2.0, 2.3))}>
        minWriterVersion: 7
      </T>
      <T x={300} y={115} s={11} f={C.focus} o={easeOut(seg(t, 2.5, 2.8))}>
        readerFeatures: deletionVectors
      </T>
      <T x={300} y={140} s={11} f={C.focus} o={easeOut(seg(t, 2.8, 3.1))}>
        writerFeatures: deletionVectors
      </T>
      <T x={25} y={200} s={13} f={C.crema} o={easeOut(seg(t, 3.6, 4.0))}>
        from a bare number to a named list
      </T>
    </Svg>
  );
}

// 10 · Recap.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="an ordered json log, a reconciled checkpoint on top, and protocol versions giving way to named features." h={250}>
      <Row y={40} label="_delta_log" value="an ordered JSON log" k={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={100} label="a checkpoint" value="the log, folded" valueColor={C.second} k={easeOut(seg(t, 1.2, 1.6))} />
      <Row y={160} label="compaction, checksum" value="optional, checked" k={easeOut(seg(t, 2.2, 2.6))} />
      <Row y={220} label="the protocol" value="named features" valueColor={C.focus} k={easeOut(seg(t, 3.2, 3.6))} />
    </Svg>
  );
}
