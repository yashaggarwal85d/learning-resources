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

const P1 = [40, 60, 75, 90, 100, 115, 130, 150, 170, 190];
const P2 = [50, 65, 80, 95, 110, 125, 140, 160, 180, 200];
const P3 = [300, 380, 460, 520, 545];
const TAILS = [185, 195, 540];
const AVG = 307;
const TRUE = 515;

/** A row of data points along a value axis. */
function Dots({ y, xs, o = 1, f = C.latte, r = 4 }: { y: number; xs: number[]; o?: number; f?: string; r?: number }) {
  return (
    <g opacity={o}>
      {xs.map((x, i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={f} />
      ))}
    </g>
  );
}

/** A vertical value marker from y1 to y2. */
function Mark({ x, y1, y2, f, k, w = 2.5 }: { x: number; y1: number; y2: number; f: string; k: number; w?: number }) {
  return <line x1={x} y1={y2 - (y2 - y1) * k} x2={x} y2={y2} stroke={f} strokeWidth={w} opacity={k > 0 ? 1 : 0} />;
}

// 1 · Hook. Three partitions of points; each gets its own tail mark and their average lands on the combined axis; then all
// the points drop onto that axis and the true tail mark lands somewhere else.
export function Hook({ t }: StepCtx) {
  const drop = easeInOut(seg(t, 3.0, 3.8));
  const rows = [P1, P2, P3];
  return (
    <Svg label="the same partitioned data, the same target percentile, two ways of computing it land on two different answers" h={240}>
      {rows.map((xs, j) => (
        <g key={j}>
          {xs.map((x, i) => (
            <circle key={i} cx={x} cy={lerp(50 + j * 28, 160, drop)} r={4} fill={j === 2 ? C.second : C.latte} opacity={easeOut(seg(t, 0.2 + j * 0.25, 0.6 + j * 0.25))} />
          ))}
          <Mark x={TAILS[j]} y1={40 + j * 28} y2={60 + j * 28} f={C.crema} k={easeOut(seg(t, 1.2 + j * 0.2, 1.5 + j * 0.2)) * (1 - drop)} w={2} />
        </g>
      ))}
      <line x1={25} y1={160} x2={575} y2={160} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 2.0, 2.3))} />
      <Mark x={AVG} y1={140} y2={172} f={C.cherryText} k={easeOut(seg(t, 2.2, 2.8))} />
      <Mark x={TRUE} y1={140} y2={172} f={C.focus} k={easeOut(seg(t, 4.0, 4.4))} />
      <T x={25} y={198} s={12} f={C.cherryText} o={easeOut(seg(t, 2.6, 3.0))}>
        the average of the parts' tails
      </T>
      <T x={25} y={220} s={12} f={C.focus} o={easeOut(seg(t, 4.2, 4.6))}>
        the tail of all the data at once
      </T>
      <T x={575} y={220} s={13} f={C.crema} a="end" o={easeOut(seg(t, 4.8, 5.2))}>
        two answers
      </T>
    </Svg>
  );
}

// 2 · Predict. Three partitions with their own tail marks and their average below; the answer: not valid.
export function PredictAveragingValid({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.2, 0.6)) : 0;
  return (
    <Svg label="is averaging several partitions' own tail percentile a valid estimate of the whole dataset's real one?" h={200}>
      {[P1, P2, P3].map((xs, j) => (
        <g key={j}>
          <Dots y={50 + j * 18} xs={xs} r={3} f={j === 2 ? C.second : C.latte} o={easeOut(seg(t, 0.2 + j * 0.15, 0.5 + j * 0.15))} />
          <Mark x={TAILS[j]} y1={43 + j * 18} y2={57 + j * 18} f={C.crema} k={easeOut(seg(t, 0.7, 1.0))} w={2} />
        </g>
      ))}
      <Mark x={AVG} y1={98} y2={118} f={C.cherryText} k={easeOut(seg(t, 1.0, 1.3))} />
      <Cross x={AVG + 18} y={108} k={v} />
      <AnswerRow y={150} label="average them?" answer={answer} value="not valid" k={easeOut(seg(t, 1.3, 1.8))} />
      <Verdict answer={answer} y={190} text="a percentile doesn't average" />
    </Svg>
  );
}

const ALL = [...P1, ...P2, ...P3].sort((a, b) => a - b);

// 3 · Counterexample. Every point on one axis; a sweep counts through them to the true tail mark; the average mark lands
// apart, and the gap between them is marked.
export function RevealCounterexample({ t }: StepCtx) {
  const sw = easeInOut(seg(t, 0.8, 2.4));
  const gap = easeOut(seg(t, 3.2, 3.7));
  return (
    <Svg label="a real counterexample, computed on a real partitioned dataset, proves averaging wrong" h={230}>
      <T x={25} y={40} s={12} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        every point, looked at at once
      </T>
      <line x1={25} y1={100} x2={575} y2={100} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.2, 0.5))} />
      {ALL.map((x, i) => (
        <circle key={i} cx={x} cy={100} r={4} fill={x <= 25 + sw * (TRUE - 25) && sw > 0 ? C.crema : C.latte} opacity={easeOut(seg(t, 0.2, 0.5)) * (x <= 25 + sw * (TRUE - 25) && sw > 0 ? 1 : 0.6)} />
      ))}
      <Mark x={TRUE} y1={70} y2={130} f={C.focus} k={easeOut(seg(t, 2.4, 2.8))} />
      <T x={TRUE} y={150} s={12} f={C.focus} a="middle" o={easeOut(seg(t, 2.6, 3.0))}>
        the truth
      </T>
      <Mark x={AVG} y1={70} y2={130} f={C.cherryText} k={easeOut(seg(t, 2.8, 3.2))} />
      <T x={AVG} y={150} s={12} f={C.cherryText} a="middle" o={easeOut(seg(t, 2.9, 3.3))}>
        the average
      </T>
      <rect x={AVG} y={165} width={(TRUE - AVG) * gap} height={3} fill={C.cherryText} />
      <T x={300} y={210} s={15} f={C.cherryText} a="middle" o={easeOut(seg(t, 3.8, 4.2))}>
        they do not match
      </T>
    </Svg>
  );
}

const SORTED = [40, 60, 75, 88, 100, 112, 125, 140, 160, 190, 240, 330, 470];

// 4 · Rank vs relative. A heavy-tailed sorted row: one position off, near the tail, is a long jump in value. The same row
// under a relative bound: a short band around the value itself.
export function RevealRankVsRelative({ t }: StepCtx) {
  const r = easeOut(seg(t, 1.2, 1.8));
  const b = easeOut(seg(t, 3.4, 4.0));
  return (
    <Svg label="a rank-error guarantee bounds a different thing entirely than a relative-error guarantee" h={240}>
      <T x={25} y={40} s={12} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        rank bound: off by a position
      </T>
      <Dots y={70} xs={SORTED} o={easeOut(seg(t, 0.3, 0.7))} />
      <circle cx={330} cy={70} r={7} fill="none" stroke={C.focus} strokeWidth={2} opacity={easeOut(seg(t, 0.9, 1.2))} />
      <circle cx={470} cy={70} r={7} fill="none" stroke={C.cherryText} strokeWidth={2} opacity={r} />
      <rect x={330} y={84} width={140 * r} height={3} fill={C.cherryText} />
      <T x={25} y={104} s={13} f={C.cherryText} o={easeOut(seg(t, 2.0, 2.4))}>
        in a heavy tail, far off in value
      </T>
      <T x={25} y={145} s={12} f={C.latte} o={easeOut(seg(t, 2.8, 3.1))}>
        relative bound: off by a share of the value
      </T>
      <Dots y={175} xs={SORTED} o={easeOut(seg(t, 2.9, 3.3))} />
      <circle cx={330} cy={175} r={7} fill="none" stroke={C.focus} strokeWidth={2} opacity={easeOut(seg(t, 3.2, 3.4))} />
      <rect x={330 - 22 * b} y={189} width={44 * b} height={3} fill={C.focus} />
      <T x={25} y={215} s={13} f={C.focus} o={easeOut(seg(t, 4.2, 4.6))}>
        stays close in value
      </T>
    </Svg>
  );
}

// 5 · Merged stays valid. Three bars on the same data: the truth, the naive average falling well short, the merged
// sketch ending almost exactly at the truth; the two gaps are marked.
export function RevealMergedStaysValid({ t }: StepCtx) {
  const B: [string, number, string][] = [
    ['the truth', 320, C.crema],
    ['naive average', 170, C.cherryText],
    ['merged sketch', 310, C.focus],
  ];
  return (
    <Svg label="a merged sketch stays a valid approximation of the true value; a naive average does not" h={230}>
      {B.map(([l, w, f], i) => (
        <g key={l}>
          <T x={25} y={55 + i * 45} s={12} f={C.latte} o={easeOut(seg(t, 0.3 + i * 0.9, 0.6 + i * 0.9))}>
            {l}
          </T>
          <rect x={170} y={44 + i * 45} width={w * easeOut(seg(t, 0.4 + i * 0.9, 1.2 + i * 0.9))} height={14} rx={2} fill={f} opacity={i === 0 ? 0.6 : 0.85} />
        </g>
      ))}
      <line x1={490} y1={36} x2={490} y2={150} stroke={C.crema} strokeWidth={1.5} strokeDasharray="4 3" opacity={easeOut(seg(t, 3.2, 3.5))} />
      <T x={500} y={110} s={12} f={C.cherryText} o={easeOut(seg(t, 3.5, 3.9))}>
        drifts
      </T>
      <T x={500} y={155} s={12} f={C.focus} o={easeOut(seg(t, 3.8, 4.2))}>
        close
      </T>
      <T x={300} y={205} s={13} f={C.latte} a="middle" o={easeOut(seg(t, 4.4, 4.8))}>
        the average drifts; the merged sketch stays close
      </T>
    </Svg>
  );
}

const CA = [
  [50, 6],
  [110, 9],
  [170, 7],
  [230, 5],
];
const CB = [
  [360, 5],
  [420, 8],
  [480, 9],
  [540, 6],
];
const JOIN = [60, 95, 135, 175, 215, 255, 300, 345];
const PAIR = [78, 78, 155, 155, 235, 235, 322, 322];

// 6 · Merge by design. Two sketches' clusters slide together onto one row, then neighbouring pairs fuse into fewer,
// larger clusters: combine, then compress.
export function RevealMergeByDesign({ t }: StepCtx) {
  const m = easeInOut(seg(t, 1.2, 2.4));
  const c = easeInOut(seg(t, 2.8, 3.8));
  const all = [...CA.map((p) => [...p, 0]), ...CB.map((p) => [...p, 1])];
  const order = all.map((_, i) => i).sort((a, b) => [0, 4, 1, 5, 2, 6, 3, 7].indexOf(a) - [0, 4, 1, 5, 2, 6, 3, 7].indexOf(b));
  return (
    <Svg label="mergeability is a real, deliberate design choice named directly in these sketches' own papers" h={230}>
      <T x={25} y={40} s={12} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        sketch one
      </T>
      <T x={330} y={40} s={12} f={C.second} o={easeOut(seg(t, 0.2, 0.5))}>
        sketch two
      </T>
      {all.map(([x, r, s], i) => {
        const slot = order.indexOf(i);
        const jx = lerp(x, JOIN[slot], m);
        const px = lerp(jx, PAIR[slot], c);
        const rr = lerp(r, Math.SQRT2 * 8, c);
        return <circle key={i} cx={px} cy={lerp(70, 140, m)} r={rr} fill={s ? C.second : C.crema} opacity={(0.7 - (slot % 2 ? 0.7 * c : 0)) * easeOut(seg(t, 0.2, 0.5))} />;
      })}
      <T x={420} y={145} s={12} f={C.latte} o={easeOut(seg(t, 2.4, 2.7))}>
        combined
      </T>
      <T x={420} y={165} s={12} f={C.focus} o={easeOut(seg(t, 3.6, 4.0))}>
        then compressed
      </T>
      <T x={300} y={215} s={15} f={C.focus} a="middle" o={easeOut(seg(t, 4.4, 4.8))}>
        built for this from the start
      </T>
    </Svg>
  );
}

// 7 · Real engines. ClickHouse links to the t-digest; then Datadog links to DDSketch; each picked a different sketch.
export function RevealRealEngines({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.8, 1.3));
  const b = easeOut(seg(t, 2.8, 3.3));
  return (
    <Svg label="real engines and real tools each picked a different one of these sketches, named from their own sources" h={230}>
      <Cell x={25} y={45} w={200} label="ClickHouse" o={easeOut(seg(t, 0.3, 0.7))} />
      <line x1={225} y1={59} x2={lerp(225, 330, a)} y2={59} stroke={C.focus} strokeWidth={2} opacity={a > 0 ? 1 : 0} />
      <Cell x={330} y={45} w={200} label="t-digest" o={a} stroke={C.focus} />
      <T x={25} y={95} s={11} f={C.latte} o={easeOut(seg(t, 1.4, 1.8))}>
        a warehouse engine
      </T>
      <Cell x={25} y={120} w={200} label="Datadog" o={easeOut(seg(t, 2.3, 2.7))} />
      <line x1={225} y1={134} x2={lerp(225, 330, b)} y2={134} stroke={C.second} strokeWidth={2} opacity={b > 0 ? 1 : 0} />
      <Cell x={330} y={120} w={200} label="DDSketch" o={b} stroke={C.second} />
      <T x={25} y={170} s={11} f={C.latte} o={easeOut(seg(t, 3.4, 3.8))}>
        observability, at wide scale
      </T>
      <T x={300} y={215} s={15} f={C.focus} a="middle" o={easeOut(seg(t, 4.4, 4.8))}>
        each picked a different sketch
      </T>
    </Svg>
  );
}

// 8 · Recap. Four rows, one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="averaging percentiles is wrong, rank error and relative error bound different things, mergeability is deliberate, real tools each picked one" h={250}>
      <Row y={50} label="averaging percentiles" value="measurably wrong" k={easeOut(seg(t, 0.6, 1.0))} />
      <Row y={100} label="rank vs relative" value="different bounds" k={easeOut(seg(t, 1.8, 2.2))} />
      <Row y={150} label="a merged sketch" value="stays close" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.4))} />
      <Row y={200} label="real tools" value="each picked one" k={easeOut(seg(t, 4.4, 4.8))} />
    </Svg>
  );
}

// 9 · Prove. Four instances, one with a slow tail; the averaged mark lands low and looks fine; after the answer the merged
// mark lands out in the slow tail.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.2, 0.6)) : 0;
  const rows = [P1.slice(0, 7), P2.slice(0, 7), P1.slice(1, 8), [...P2.slice(0, 4), 400, 470, 530]];
  return (
    <Svg label="a dashboard averages each instance's own tail latency; users complain while the number looks fine — what's wrong?" h={200}>
      {rows.map((xs, j) => (
        <Dots key={j} y={48 + j * 15} xs={xs} r={3} f={j === 3 ? C.cherryText : C.latte} o={easeOut(seg(t, 0.2 + j * 0.12, 0.5 + j * 0.12))} />
      ))}
      <Mark x={230} y1={38} y2={102} f={C.crema} k={easeOut(seg(t, 0.9, 1.2))} />
      <T x={240} y={118} s={11} f={C.crema} o={easeOut(seg(t, 1.0, 1.3))}>
        averaged: looks fine
      </T>
      <Mark x={500} y1={38} y2={102} f={C.focus} k={v} />
      <AnswerRow y={150} label="the fix" answer={answer} value="one merged sketch" k={easeOut(seg(t, 1.3, 1.8))} />
      <Verdict answer={answer} y={190} text="the slow instance shows up" />
    </Svg>
  );
}
