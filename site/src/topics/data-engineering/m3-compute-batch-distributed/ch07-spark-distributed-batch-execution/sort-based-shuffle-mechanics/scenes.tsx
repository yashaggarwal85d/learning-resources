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

/** `n` map tasks across the top; each drops a data file (tall) and an index file (short) onto the disk shelf when `drop` runs. */
function MapFiles({ n, t, t0 = 0.6, files = true }: { n: number; t: number; t0?: number; files?: boolean }) {
  const w = (550 - (n - 1) * 10) / n;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const x = 25 + i * (w + 10);
        const k = easeOut(seg(t, 0.1 + i * 0.06, 0.4 + i * 0.06));
        const d = easeOut(seg(t, t0 + i * 0.15, t0 + 0.4 + i * 0.15));
        return (
          <g key={i}>
            <rect x={x} y={16} width={w} height={26} rx={3} fill={C.cocoa} stroke={C.latte} strokeWidth={1.2} opacity={k} />
            {files && (
              <g opacity={d}>
                <rect x={x + w * 0.12} y={lerp(46, 82, d)} width={w * 0.44} height={36} rx={2} fill={C.cocoa} stroke={C.focus} strokeWidth={1.4} />
                <rect x={x + w * 0.62} y={lerp(46, 104, d)} width={w * 0.26} height={14} rx={2} fill={C.cocoa} stroke={C.second} strokeWidth={1.4} />
              </g>
            )}
          </g>
        );
      })}
      <line x1={25} y1={122} x2={575} y2={122} stroke={C.mocha} strokeWidth={2} />
    </g>
  );
}

// 1 · Hook. Four map tasks each sort their rows (ticks fall into order); the disk shelf below waits with a "?".
export function Hook({ t }: StepCtx) {
  const s = easeInOut(seg(t, 1.0, 2.2));
  return (
    <Svg label="four map tasks write a shuffle. How many files land on disk?" h={200}>
      <T x={25} y={18} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        four map tasks, each sorting its rows
      </T>
      {[0, 1, 2, 3].map((i) => (
        <g key={i} opacity={easeOut(seg(t, 0.2 + i * 0.1, 0.5 + i * 0.1))}>
          <rect x={25 + i * 140} y={30} width={130} height={60} rx={4} fill="none" stroke={C.latte} strokeWidth={1.2} />
          {[0, 1, 2, 3, 4].map((j) => {
            const h0 = [30, 12, 40, 20, 8][(j + i) % 5];
            const h1 = [8, 12, 20, 30, 40][j];
            return <rect key={j} x={37 + i * 140 + j * 22} y={84 - lerp(h0, h1, s)} width={16} height={lerp(h0, h1, s)} fill={C.second} />;
          })}
        </g>
      ))}
      <line x1={25} y1={140} x2={575} y2={140} stroke={C.mocha} strokeWidth={2} opacity={easeOut(seg(t, 2.4, 2.7))} />
      <T x={25} y={170} s={12} f={C.latte} o={easeOut(seg(t, 2.6, 3.0))}>
        disk
      </T>
      <T x={300} y={170} s={14} f={C.second} a="middle" o={easeOut(seg(t, 3.0, 3.4))}>
        how many files?
      </T>
    </Svg>
  );
}

// 2 · Four and four. Each map task drops one data file and one smaller index file onto the shelf; the counts read off.
export function RevealFourAndFour({ t }: StepCtx) {
  return (
    <Svg label="measured: four map tasks write four data files and four index files, one pair each." h={200}>
      <MapFiles n={4} t={t} />
      <Row y={160} label="data · index files" value={t > 1.8 ? '4 · 4' : '…'} valueColor={C.focus} k={easeOut(seg(t, 1.6, 2.0))} />
      <T x={25} y={192} s={11} f={C.latte} o={easeOut(seg(t, 2.4, 2.8))}>
        one pair per map task
      </T>
    </Svg>
  );
}

// 3 · Predict. Eight map tasks over the same million rows; the shelf is empty: how many files?
export function PredictEightPartitions({ t, answer }: StepCtx) {
  return (
    <Svg label="same million rows, now split across eight map tasks instead of four. More files, or the same four?" h={200}>
      <MapFiles n={8} t={t} files={false} />
      <T x={25} y={70} s={11} f={C.latte} o={easeOut(seg(t, 0.6, 1.0))}>
        the same 1,000,000 rows
      </T>
      <AnswerRow y={160} label="files on disk" answer={answer} value="eight of each" k={easeOut(seg(t, 1.6, 2.1))} />
      <Verdict answer={answer} y={194} text="a file per task, not per row" />
    </Svg>
  );
}

// 4 · Eight and eight. The same shelf, eight pairs now.
export function RevealEightAndEight({ t }: StepCtx) {
  return (
    <Svg label="measured: eight map tasks write eight data files and eight index files — the identical data." h={200}>
      <MapFiles n={8} t={t} t0={0.4} />
      <Row y={160} label="data · index files" value={t > 2.0 ? '8 · 8' : '…'} valueColor={C.focus} k={easeOut(seg(t, 1.8, 2.2))} />
      <T x={25} y={192} s={11} f={C.latte} o={easeOut(seg(t, 2.6, 3.0))}>
        same rows: only the task count moved
      </T>
    </Svg>
  );
}

// 5 · The MapOutputTracker. Map tasks on executors report block locations to the driver's tracker; a reducer asks the tracker first,
// then fetches from the right executor.
export function RevealMapOutputTracker({ t }: StepCtx) {
  const rep = easeInOut(seg(t, 0.8, 1.6));
  const ask = easeInOut(seg(t, 2.2, 2.8));
  const fetch = easeInOut(seg(t, 3.2, 3.9));
  return (
    <Svg label="every reducer needs to know which executor holds which map task's block. The MapOutputTracker is that map." h={200}>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Cell x={25} y={14 + i * 44} w={130} h={30} label="executor" o={easeOut(seg(t, 0.1 + i * 0.1, 0.4 + i * 0.1))} />
          <line x1={157} y1={29 + i * 44} x2={lerp(157, 238, rep)} y2={lerp(29 + i * 44, 72, rep)} stroke={C.second} strokeWidth={1.4} opacity={rep > 0 ? 1 : 0} />
        </g>
      ))}
      <rect x={240} y={44} width={150} height={56} rx={5} fill={C.cocoa} stroke={C.focus} strokeWidth={1.8} opacity={easeOut(seg(t, 0.5, 0.9))} />
      <T x={252} y={66} s={11} f={C.latte} o={easeOut(seg(t, 0.5, 0.9))}>
        driver
      </T>
      <T x={252} y={88} s={11} f={C.focus} o={easeOut(seg(t, 0.7, 1.1))}>
        MapOutputTracker
      </T>
      <Cell x={450} y={57} w={110} h={30} label="reducer" stroke={C.second} o={easeOut(seg(t, 1.8, 2.1))} />
      <line x1={448} y1={72} x2={lerp(448, 395, ask)} y2={72} stroke={C.second} strokeWidth={1.8} opacity={ask > 0 ? 1 : 0} />
      <path d={`M${lerp(448, 395, ask)} 72 l8 -5 v10 z`} fill={C.second} opacity={ask > 0 ? 1 : 0} />
      <T x={420} y={120} s={11} f={C.second} a="middle" o={easeOut(seg(t, 2.6, 3.0))}>
        where is my block?
      </T>
      <path d={`M505 89 Q505 170 ${lerp(505, 157, fetch)} ${lerp(170, 112, fetch)}`} fill="none" stroke={C.focus} strokeWidth={1.6} opacity={fetch > 0 ? 1 : 0} />
      <T x={300} y={192} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 3.8, 4.2))}>
        then it fetches, straight from that executor
      </T>
    </Svg>
  );
}

// 6 · Predict. One map task's single sorted file, cut into a span per reduce bucket; more buckets: more blocks?
export function PredictReducePartitions({ t, answer }: StepCtx) {
  const n = Math.round(lerp(4, 12, easeInOut(seg(t, 0.9, 1.8))));
  return (
    <Svg label="instead of more map tasks, now there are more REDUCE partitions. Does the block count grow the same way?" h={200}>
      <T x={25} y={24} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        one map task's sorted file
      </T>
      <rect x={25} y={36} width={540} height={30} rx={3} fill="none" stroke={C.focus} strokeWidth={1.4} opacity={easeOut(seg(t, 0.2, 0.6))} />
      {Array.from({ length: n - 1 }, (_, i) => (
        <line key={i} x1={25 + ((i + 1) * 540) / n} y1={36} x2={25 + ((i + 1) * 540) / n} y2={66} stroke={C.second} strokeWidth={1.4} />
      ))}
      <T x={25} y={92} s={11} f={C.second} o={easeOut(seg(t, 0.8, 1.2))}>
        a span for every reduce bucket
      </T>
      <AnswerRow y={140} label="more buckets" answer={answer} value="more blocks, too" k={easeOut(seg(t, 2.0, 2.5))} />
      <Verdict answer={answer} y={184} text="the product of the two, not the sum" />
    </Svg>
  );
}

// 7 · M × R. The shuffle grid: 4 map rows by 97 bucket columns fill in; the count reads 4 × 97 = 388.
export function RevealMxR({ t }: StepCtx) {
  const f = seg(t, 0.6, 2.6);
  const cw = 540 / 97;
  return (
    <Svg label="every map task's one file still covers every bucket — so the block count is M times R, not M plus R." h={200}>
      {[0, 1, 2, 3].map((r) => (
        <g key={r}>
          {Array.from({ length: 97 }, (_, c) => (
            <rect key={c} x={25 + c * cw} y={20 + r * 22} width={cw - 1} height={18} fill={C.focus} opacity={(c + r * 97) / 388 < f ? 0.85 : 0.12} />
          ))}
        </g>
      ))}
      <T x={25} y={124} s={11} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        4 map tasks × 97 buckets
      </T>
      <Row y={170} label="logical blocks" value={num(Math.round(388 * clamp(f)))} valueColor={C.focus} big k={easeOut(seg(t, 0.6, 1.0))} />
    </Svg>
  );
}

// 8 · Recap.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="one sorted data file plus one index per map task; M times R small blocks fetched over the network; that is most of a job's real cost." h={250}>
      <Row y={40} label="per map task" value="one data, one index" k={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={100} label="where blocks live" value="MapOutputTracker" valueColor={C.second} k={easeOut(seg(t, 1.2, 1.6))} />
      <Row y={160} label="blocks fetched" value="M × R" valueColor={C.focus} big k={easeOut(seg(t, 2.2, 2.6))} />
      <T x={25} y={220} s={11} f={C.latte} o={easeOut(seg(t, 3.0, 3.4))}>
        multiplicative, not additive: most of a shuffle's cost
      </T>
    </Svg>
  );
}
