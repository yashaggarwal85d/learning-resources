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

/** Value 0..999 to x on the full-width axis. */
const vx = (v: number) => 25 + v * 0.55;
const SH_LO = [3, 11, 0, 7, 2, 14, 5, 1, 9, 4];
const SH_HI = [991, 999, 984, 996, 988, 993, 979, 998, 990, 995];

/** Ten row-group range bars on the 0..999 axis; `mix` 0 → sorted ranges, 1 → shuffled ranges; `col(i)` colours bar i. */
function Groups({ y0, dy, h, mix, col, o = 1 }: { y0: number; dy: number; h: number; mix: number; col: (i: number) => [string, number]; o?: number }) {
  return (
    <g opacity={o}>
      {Array.from({ length: 10 }, (_, i) => {
        const lo = lerp(i * 100, SH_LO[i], mix);
        const hi = lerp(i * 100 + 99, SH_HI[i], mix);
        const [f, op] = col(i);
        return <rect key={i} x={vx(lo)} y={y0 + i * dy} width={vx(hi) - vx(lo)} height={h} rx={2} fill={f} opacity={op} />;
      })}
    </g>
  );
}

/** The query window, 250 to 270, as a vertical band. */
function Band({ y1, y2, k }: { y1: number; y2: number; k: number }) {
  return <rect x={vx(250)} y={y1} width={(vx(270) - vx(250)) * 1} height={(y2 - y1) * k} fill={C.second} opacity={0.45} />;
}

const hit = (i: number) => i === 2;

// 1 · Hook. Ten sorted row-group ranges climb the axis; the query band drops; one range lights. Then the column is
// shuffled: every range stretches across the axis and every one lights.
export function Hook({ t }: StepCtx) {
  const b = easeOut(seg(t, 0.9, 1.4));
  const mix = easeInOut(seg(t, 2.4, 3.2));
  return (
    <Svg label="1000 rows, sorted and shuffled, 10 row groups. One query, two very different reads." h={235}>
      <Band y1={44} y2={166} k={b} />
      <Groups y0={50} dy={11} h={7} mix={mix} col={(i) => (mix > 0.5 ? [C.cherryText, 0.7] : b > 0 && hit(i) ? [C.focus, 0.9] : [C.latte, 0.55])} o={easeOut(seg(t, 0.2, 0.6))} />
      <T x={25} y={192} s={13} f={C.focus} o={easeOut(seg(t, 1.5, 1.9))}>
        sorted: 1 of 10 row groups read
      </T>
      <T x={25} y={220} s={13} f={C.cherryText} o={easeOut(seg(t, 3.3, 3.7))}>
        shuffled: 10 of 10 read
      </T>
    </Svg>
  );
}

// 2 · Predict. The sorted ranges and the query band; after the answer nine ranges dim and one lights.
export function PredictRowGroups({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.2, 0.6)) : 0;
  return (
    <Svg label="every row group carries its own min and max. How many of 10 get skipped for 250-270?" h={200}>
      <Band y1={36} y2={122} k={easeOut(seg(t, 0.7, 1.1))} />
      <Groups y0={40} dy={8} h={6} mix={0} col={(i) => (hit(i) ? [v > 0 ? C.focus : C.latte, 0.55 + 0.4 * v] : [C.latte, 0.55 - 0.35 * v])} o={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={150} label="groups skipped" answer={answer} value="9 of 10" k={easeOut(seg(t, 1.2, 1.7))} />
      <Verdict answer={answer} y={190} text="their own min and max rule them out" />
    </Svg>
  );
}

// 3 · Sorted skip. A check sweeps the ranges top to bottom; each range outside the band dims as it is ruled out; row
// group 2 alone stays, lit.
export function RevealSortedSkip({ t }: StepCtx) {
  const ck = (i: number) => easeOut(seg(t, 0.5 + i * 0.18, 0.7 + i * 0.18));
  return (
    <Svg label="only row group 2 (200-299) can hold 250-270. The other 9 are provably out of range." h={235}>
      <Band y1={44} y2={166} k={easeOut(seg(t, 0.2, 0.5))} />
      <Groups y0={50} dy={11} h={7} mix={0} col={(i) => (hit(i) ? [ck(i) > 0 ? C.focus : C.latte, 0.55 + 0.4 * ck(i)] : [C.latte, 0.55 - 0.4 * ck(i)])} />
      <T x={25} y={192} s={13} f={C.focus} o={easeOut(seg(t, 2.5, 2.9))}>
        row group 2, 200 to 299: the only overlap
      </T>
      <T x={25} y={220} s={12} f={C.latte} o={easeOut(seg(t, 3.0, 3.4))}>
        9 skipped from min and max alone
      </T>
    </Svg>
  );
}

// 4 · Shuffled. The same ranges stretch out as the column is shuffled until each spans nearly everything; then every one
// crosses the band and lights red.
export function RevealShuffledNoSkip({ t }: StepCtx) {
  const mix = easeInOut(seg(t, 0.4, 1.4));
  const r = (i: number) => easeOut(seg(t, 1.7 + i * 0.08, 1.9 + i * 0.08));
  return (
    <Svg label="the same query, shuffled: every row group's min-max spans nearly the whole range." h={235}>
      <Band y1={44} y2={166} k={easeOut(seg(t, 0.2, 0.5))} />
      <Groups y0={50} dy={11} h={7} mix={mix} col={(i) => (r(i) > 0 ? [C.cherryText, 0.5 + 0.3 * r(i)] : [C.latte, 0.55])} />
      <T x={25} y={192} s={12} f={C.latte} o={easeOut(seg(t, 1.3, 1.7))}>
        every range spans nearly everything
      </T>
      <T x={25} y={220} s={13} f={C.cherryText} o={easeOut(seg(t, 2.8, 3.2))}>
        0 skipped: every group must be opened
      </T>
    </Svg>
  );
}

const PAGES = ['200–224', '225–249', '250–274', '275–299'];

// 5 · Page index. Row group 2's range bar grows to fill the width and splits into its four pages; the band drops; three
// pages dim and one lights.
export function RevealPageIndex({ t }: StepCtx) {
  const z = easeInOut(seg(t, 0.3, 1.2));
  const sp = easeOut(seg(t, 1.3, 1.9));
  const b = easeOut(seg(t, 2.1, 2.5));
  const d = easeOut(seg(t, 2.6, 3.1));
  const px = (v: number) => 25 + (v - 200) * 5.5;
  return (
    <Svg label="inside row group 2, 4 pages of 25 rows each. Only one page overlaps 250-270." h={220}>
      <T x={25} y={42} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        inside row group 2: 4 pages of 25 rows
      </T>
      <rect x={lerp(vx(200), 25, z)} y={lerp(80, 60, z)} width={lerp(vx(299) - vx(200), 550, z)} height={lerp(7, 40, z)} rx={3} fill={C.latte} opacity={0.4 * (1 - sp)} />
      {PAGES.map((p, i) => (
        <g key={p} opacity={sp * (i === 2 ? 1 : 1 - 0.65 * d)}>
          <rect x={px(200 + i * 25) + 2} y={60} width={137.5 - 4} height={40} rx={4} fill={C.cocoa} stroke={i === 2 && d > 0 ? C.focus : C.mocha} strokeWidth={1.5 + (i === 2 ? d : 0)} />
          <T x={px(200 + i * 25) + 68.75} y={85} s={12} f={C.crema} a="middle">
            {p}
          </T>
        </g>
      ))}
      <rect x={px(250)} y={52} width={px(270) - px(250)} height={56 * b} fill={C.second} opacity={0.3} />
      <T x={25} y={150} s={15} f={C.focus} o={easeOut(seg(t, 3.2, 3.6))}>
        1 page read, 3 skipped
      </T>
    </Svg>
  );
}

// 6 · Predict. Unique session ids: every range spans the whole axis; a single key probes; the answer: min-max can't, a
// bloom filter can.
export function PredictHighCardinality({ t, answer }: StepCtx) {
  return (
    <Svg label="a column of unique session ids spans the whole range in every row group. Can min-max help?" h={200}>
      <T x={25} y={38} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        unique session ids
      </T>
      <Groups y0={50} dy={7} h={5} mix={1} col={() => [C.latte, 0.55]} o={easeOut(seg(t, 0.2, 0.6))} />
      <circle cx={vx(610)} cy={lerp(40, 85, easeOut(seg(t, 0.8, 1.2)))} r={5} fill={C.second} opacity={easeOut(seg(t, 0.8, 1.0))} />
      <AnswerRow y={150} label="can min-max help?" answer={answer} value="no; a bloom filter can" k={easeOut(seg(t, 1.3, 1.8))} />
      <Verdict answer={answer} y={190} text="ask: is this exact value here?" />
    </Svg>
  );
}

// 7 · Bloom filter. Keys pour in and the blocks fill as the count runs to 26,214; one block opens up into its words, a
// checked key's bit lit in each; an inserted key checks true.
export function RevealBloomFilter({ t }: StepCtx) {
  const ins = easeInOut(seg(t, 0.4, 2.0));
  const bits = [11, 3, 25, 17, 6, 29, 14, 21];
  return (
    <Svg label="a real split-block bloom filter: 1024 blocks, 26,214 real keys inserted." h={225}>
      <T x={25} y={42} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        1,024 blocks of 256 bits
      </T>
      {Array.from({ length: 32 }, (_, i) => (
        <rect key={i} x={25 + i * 17} y={52} width={13} height={18} rx={2} fill={C.crema} opacity={0.12 + 0.55 * ins * (0.7 + (0.3 * ((i * 7) % 5)) / 4)} />
      ))}
      <Row y={100} label="keys inserted" value={num(26214 * ins)} k={easeOut(seg(t, 0.3, 0.6))} />
      <T x={25} y={135} s={12} f={C.latte} o={easeOut(seg(t, 2.1, 2.4))}>
        one block, opened: one bit per word
      </T>
      {bits.map((b, j) => (
        <g key={j} opacity={easeOut(seg(t, 2.2 + j * 0.05, 2.5 + j * 0.05))}>
          <rect x={25 + j * 69} y={145} width={62} height={16} rx={2} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} />
          <rect x={27 + j * 69 + (b / 32) * 56} y={147} width={4} height={12} fill={C.focus} opacity={easeOut(seg(t, 2.6 + j * 0.06, 2.8 + j * 0.06))} />
        </g>
      ))}
      <T x={25} y={200} s={13} f={C.focus} o={easeOut(seg(t, 3.2, 3.6))}>
        an inserted key checks true, every time
      </T>
      <MiniTick x={380} y={194} k={easeOut(seg(t, 3.5, 3.8))} />
    </Svg>
  );
}

// 8 · Measured rate. Never-inserted keys stream at the filter; most stop, a few slip through; then the spec's figure and
// the measured one grow side by side and end together.
export function RevealMeasuredFpr({ t }: StepCtx) {
  const N = 26;
  const pass = (i: number) => i === 9 || i === 21;
  return (
    <Svg label="the spec states around 1.26% false positives for this size. This filter measures 1.25%." h={235}>
      <T x={25} y={42} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        50,000 keys never inserted
      </T>
      <rect x={300} y={52} width={14} height={40} rx={3} fill={C.cocoa} stroke={C.crema} strokeWidth={1.5} opacity={easeOut(seg(t, 0.1, 0.4))} />
      {Array.from({ length: N }, (_, i) => {
        const p = seg(t, 0.4 + i * 0.06, 0.9 + i * 0.06);
        if (p <= 0 || p >= 1) return null;
        const x = pass(i) ? lerp(25, 565, p) : lerp(25, 295, Math.min(p * 1.98, 1));
        return <circle key={i} cx={x} cy={60 + (i % 3) * 12} r={4} fill={pass(i) ? C.cherryText : C.latte} opacity={pass(i) ? 1 : 1 - clamp((p - 0.5) * 2)} />;
      })}
      <T x={25} y={130} s={12} f={C.latte} o={easeOut(seg(t, 2.2, 2.5))}>
        the spec: around 1.26%
      </T>
      <rect x={25} y={138} width={400 * easeOut(seg(t, 2.3, 3.0))} height={14} rx={2} fill={C.crema} opacity={0.6} />
      <T x={25} y={180} s={12} f={C.latte} o={easeOut(seg(t, 2.5, 2.8))}>
        measured here: 1.25%
      </T>
      <rect x={25} y={188} width={397 * easeOut(seg(t, 2.6, 3.3))} height={14} rx={2} fill={C.focus} />
      <T x={575} y={225} s={13} f={C.focus} a="end" o={easeOut(seg(t, 3.5, 3.9))}>
        almost exactly the spec's number
      </T>
    </Svg>
  );
}

// 9 · Truncation bug. Strings ordered on a line: B, Bl, the real value, C; the query band starts at Bl; the correct
// truncated max reaches C and keeps the group; the buggy one stops at B and the group is skipped.
export function RevealTruncationBug({ t }: StepCtx) {
  const q = easeOut(seg(t, 0.8, 1.2));
  const c = easeOut(seg(t, 1.6, 2.2));
  const g = easeOut(seg(t, 2.6, 3.2));
  const P: [string, number][] = [
    ['B', 110],
    ['Bl', 220],
    ['Blart…', 340],
    ['C', 480],
  ];
  return (
    <Svg label="shortening the max to 'B' instead of 'C' makes a real matching row invisible." h={240}>
      <T x={25} y={40} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        the real value: Blart Versenwald III
      </T>
      <rect x={220} y={58} width={355 * q} height={30} fill={C.second} opacity={0.3} />
      <T x={570} y={76} s={12} f={C.second} a="end" o={q}>
        query: name ≥ Bl
      </T>
      <line x1={25} y1={90} x2={575} y2={90} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.2, 0.5))} />
      {P.map(([l, x]) => (
        <g key={l} opacity={easeOut(seg(t, 0.3, 0.6))}>
          <line x1={x} y1={84} x2={x} y2={96} stroke={C.crema} strokeWidth={2} />
          <T x={x} y={114} s={12} f={l === 'Blart…' ? C.crema : C.latte} a="middle">
            {l}
          </T>
        </g>
      ))}
      <T x={25} y={145} s={12} f={C.focus} o={c}>
        correct max, rounded up to C: kept
      </T>
      <rect x={25} y={153} width={455 * c} height={8} rx={2} fill={C.focus} />
      <T x={25} y={185} s={12} f={C.cherryText} o={g}>
        buggy max, cut to B: skipped
      </T>
      <rect x={25} y={193} width={85 * g} height={8} rx={2} fill={C.cherryText} />
      <T x={300} y={232} s={13} f={C.cherryText} a="middle" o={easeOut(seg(t, 3.4, 3.8))}>
        a real matching row goes missing
      </T>
    </Svg>
  );
}

// 10 · Recap. One row per skipping layer, then the condition all of them share.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="statistics, the page index, and bloom filters all prune by proof, not guesswork." h={240}>
      <Row y={45} label="row-group stats" value="skip by min and max" k={easeOut(seg(t, 0.6, 1.0))} />
      <Row y={95} label="page index" value="the same, one level down" k={easeOut(seg(t, 1.8, 2.2))} />
      <Row y={145} label="bloom filter" value="is this exact value here?" k={easeOut(seg(t, 3.0, 3.4))} />
      <Row y={195} label="all of it" value="only if bounds are true" valueColor={C.focus} k={easeOut(seg(t, 4.0, 4.4))} />
    </Svg>
  );
}
