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

const KS = [0, 1, 2, 3];

/** One partition folder `k=j` at x: a header and `n` file pips in rows of eight; `k` fades it in, `fresh` staggers new pips in. */
function Folder({ x, y, j, n, k = 1, f = C.latte, show = 1 }: { x: number; y: number; j: number; n: number; k?: number; f?: string; show?: number }) {
  return (
    <g opacity={k}>
      <rect x={x} y={y} width={120} height={82} rx={4} fill="none" stroke={C.mocha} strokeWidth={1.4} />
      <T x={x + 8} y={y + 16} s={11} f={C.latte}>
        {`k=${j}`}
      </T>
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={x + 6 + (i % 8) * 14} y={y + 24 + Math.floor(i / 8) * 14} width={10} height={10} rx={1.5} fill={f} opacity={clamp(show * n - i, 0, 1)} />
      ))}
    </g>
  );
}

/** A small on/off switch at (x, y) with a label to its right. */
function Switch({ x, y, on, label }: { x: number; y: number; on: number; label: string }) {
  return (
    <g>
      <rect x={x} y={y} width={44} height={22} rx={11} fill={C.cocoa} stroke={on > 0.5 ? C.focus : C.mocha} strokeWidth={1.6} />
      <circle cx={lerp(x + 11, x + 33, on)} cy={y + 11} r={7} fill={on > 0.5 ? C.focus : C.latte} />
      <T x={x + 54} y={y + 15} s={11} f={on > 0.5 ? C.crema : C.latte}>
        {label}
      </T>
    </g>
  );
}

/** A row of `n` task cells across the top, widths shrinking to fit; `k` fades them in. */
function Tasks({ y, n, k = 1 }: { y: number; n: number; k?: number }) {
  const w = Math.min(60, 540 / n - 4);
  return (
    <g opacity={k}>
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={25 + i * (w + 4)} y={y} width={w} height={18} rx={2} fill={C.cocoa} stroke={C.latte} strokeWidth={1.2} />
      ))}
    </g>
  );
}

// 0 · Hook. Same four folders, the task row stepping from two to four to eight; each folder holds a question mark.
export function Hook({ t }: StepCtx) {
  const n = t < 1.4 ? 2 : t < 2.4 ? 4 : 8;
  return (
    <Svg label="same data, same partition column. Only the task count changes. How many files?" h={230}>
      <T x={25} y={22} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        tasks
      </T>
      <Tasks y={32} n={n} k={easeOut(seg(t, 0.3, 0.6))} />
      {KS.map((j) => (
        <g key={j}>
          <Folder x={25 + j * 140} y={80} j={j} n={0} k={easeOut(seg(t, 0.6 + j * 0.1, 0.9 + j * 0.1))} />
          <T x={85 + j * 140} y={140} s={15} f={C.focus} a="middle" o={easeOut(seg(t, 2.8, 3.2))}>
            ?
          </T>
        </g>
      ))}
      <T x={25} y={205} s={13} f={C.focus} o={easeOut(seg(t, 3.3, 3.7))}>
        how many pieces land on disk?
      </T>
    </Svg>
  );
}

// 1 · Measured. Two, four, eight tasks: each task drops one file into every folder it touched, so the folders fill
// in lockstep and the count reads tasks times four.
export function RevealBaseline({ t }: StepCtx) {
  const ph = t < 1.6 ? 0 : t < 3.0 ? 1 : 2;
  const n = [2, 4, 8][ph];
  const st = [0.2, 1.6, 3.0][ph];
  const show = easeOut(seg(t, st + 0.2, st + 1.0));
  return (
    <Svg label="measured: file count always equals tasks times partitions touched." h={240}>
      <Tasks y={30} n={n} />
      {KS.map((j) => (
        <Folder key={j} x={25 + j * 140} y={80} j={j} n={n} show={show} />
      ))}
      <Row y={210} label={`${n} tasks × 4 folders`} value={`${n * 4} files`} valueColor={show > 0.99 ? C.focus : C.crema} k={easeOut(seg(t, 0.4, 0.7))} />
    </Svg>
  );
}

// 2 · Predict. Two tasks' files as bars of rows, two per folder; a dashed ceiling draws across them. Can one file be capped?
export function PredictMaxRecords({ t, answer }: StepCtx) {
  const c = easeOut(seg(t, 0.6, 1.4));
  return (
    <Svg label="is there a config that caps a file's own size, leaving task count alone?" h={240}>
      <T x={25} y={28} s={11} f={C.latte}>
        rows per file, two tasks
      </T>
      {KS.map((j) => (
        <g key={j}>
          {[0, 1].map((b) => (
            <rect key={b} x={45 + j * 140 + b * 40} y={70} width={30} height={100} fill={C.mocha} stroke={C.latte} strokeWidth={1.2} />
          ))}
          <T x={85 + j * 140} y={192} s={11} f={C.latte} a="middle">
            {`k=${j}`}
          </T>
        </g>
      ))}
      <line x1={25} y1={130} x2={lerp(25, 575, c)} y2={130} stroke={C.focus} strokeWidth={1.8} strokeDasharray="6 4" opacity={c > 0 ? 1 : 0} />
      <T x={575} y={58} s={13} f={C.focus} a="end" o={answer === null ? easeOut(seg(t, 1.4, 1.8)) : 0}>
        a ceiling?
      </T>
      <Verdict answer={answer} y={228} text="yes: a cap on rows per file" />
    </Svg>
  );
}

// 3 · Capped. Each bar breaks at the ceiling into three files that stand side by side, none above the line;
// the task count stays at two while the file count climbs from 8 to 24.
export function RevealMaxRecordsWorks({ t }: StepCtx) {
  const s = easeInOut(seg(t, 0.8, 2.0));
  const files = Math.round(lerp(8, 24, s));
  const parts: [number, number][] = [
    [0, 40],
    [40, 40],
    [80, 20],
  ];
  return (
    <Svg label="measured: maxRecordsPerFile splits each task's own output, no task change." h={240}>
      <T x={25} y={28} s={11} f={C.latte}>
        tasks: 2
      </T>
      <T x={575} y={28} s={12} f={s > 0.99 ? C.focus : C.crema} a="end">
        {`files: ${files}`}
      </T>
      {KS.map((j) => (
        <g key={j}>
          {[0, 1].map((b) =>
            parts.map(([off, h], p) => {
              const x0 = 45 + j * 140 + b * 40;
              const x1 = 31 + j * 140 + (b * 3 + p) * 18;
              return <rect key={`${b}${p}`} x={lerp(x0, x1, s)} y={lerp(70 + (100 - off - h), 170 - h, s)} width={lerp(30, 14, s)} height={h} fill={C.mocha} stroke={C.latte} strokeWidth={1.2} />;
            }),
          )}
          <T x={85 + j * 140} y={192} s={11} f={C.latte} a="middle">
            {`k=${j}`}
          </T>
        </g>
      ))}
      <line x1={25} y1={130} x2={575} y2={130} stroke={C.focus} strokeWidth={1.8} strokeDasharray="6 4" />
      {s > 0.98 && (
        <T x={25} y={120} s={11} f={C.focus} o={easeOut(seg(t, 2.1, 2.5))}>
          cap: 50,000 rows
        </T>
      )}
      <T x={25} y={228} s={12} f={C.focus} o={easeOut(seg(t, 3.2, 3.6))}>
        every file read back: none over the cap
      </T>
    </Svg>
  );
}

// 4 · Mechanism. Task 1's share for one folder is a long strip; cut marks fall at every 50,000 rows and three files
// drop out. The two task cells never change.
export function ElaborateMaxRecordsMechanism({ t }: StepCtx) {
  const cut = easeOut(seg(t, 1.2, 1.8));
  const d = easeInOut(seg(t, 2.1, 2.9));
  const pieces: [number, number, number][] = [
    [25, 120, 25],
    [145, 120, 175],
    [265, 60, 325],
  ];
  return (
    <Svg label="the cap never touches parallelism — it splits a task's own share after the fact." h={240}>
      <Cell x={25} y={24} w={90} label="task 1" stroke={C.focus} o={easeOut(seg(t, 0.1, 0.4))} />
      <Cell x={125} y={24} w={90} label="task 2" o={easeOut(seg(t, 0.1, 0.4))} />
      <T x={240} y={43} s={11} f={C.latte} o={easeOut(seg(t, 0.3, 0.6))}>
        task count: unchanged
      </T>
      <T x={25} y={88} s={11} f={C.latte} o={easeOut(seg(t, 0.5, 0.8))}>
        task 1's rows for k=0
      </T>
      {pieces.map(([x0, w, x1], i) => (
        <rect key={i} x={lerp(x0, x1, d)} y={lerp(100, 160, d)} width={w} height={18} fill={C.mocha} stroke={C.latte} strokeWidth={1.2} opacity={easeOut(seg(t, 0.6, 0.9))} />
      ))}
      {[145, 265].map((x) => (
        <line key={x} x1={x} y1={94} x2={x} y2={lerp(94, 124, cut)} stroke={C.focus} strokeWidth={2} opacity={cut > 0 && d < 0.2 ? 1 : 0} />
      ))}
      {[0, 1, 2].map((i) => (
        <T key={i} x={[85, 235, 355][i]} y={196} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 2.9, 3.2))}>
          file
        </T>
      ))}
      <T x={25} y={228} s={12} f={C.focus} o={easeOut(seg(t, 3.4, 3.8))}>
        split on the way to disk, after the work
      </T>
    </Svg>
  );
}

// 5 · Predict. Thirty-two tasks fill four folders with 128 small files; a REBALANCE chip lands with AQE's switch off.
export function PredictRebalanceNoAqe({ t, answer }: StepCtx) {
  return (
    <Svg label="can a plain hint shrink the file count with AQE left off?" h={250}>
      <Tasks y={26} n={32} k={easeOut(seg(t, 0.1, 0.4))} />
      {KS.map((j) => (
        <Folder key={j} x={25 + j * 140} y={60} j={j} n={32} show={easeOut(seg(t, 0.2, 0.9))} />
      ))}
      <Cell x={25} y={160} w={140} label="REBALANCE" stroke={C.second} o={easeOut(seg(t, 1.0, 1.3))} />
      <Switch x={190} y={163} on={0} label="AQE off" />
      <T x={575} y={180} s={13} f={C.focus} a="end" o={answer === null ? easeOut(seg(t, 1.5, 1.9)) : 0}>
        fewer files?
      </T>
      <Verdict answer={answer} y={232} text="no: nothing changes" />
    </Svg>
  );
}

/** 128 file pips in a 16 x 8 block at (x, y), filled in order by `k`. */
function Block({ x, y, k }: { x: number; y: number; k: number }) {
  return (
    <g>
      {Array.from({ length: 128 }, (_, i) => (
        <rect key={i} x={x + (i % 16) * 15} y={y + Math.floor(i / 16) * 12} width={11} height={8} rx={1} fill={C.latte} opacity={clamp(k * 128 - i, 0, 1)} />
      ))}
    </g>
  );
}

// 6 · Measured. The same write with no hint and with the hint, AQE off: both blocks fill to 128 files; an equals sign.
export function RevealRebalanceNoop({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.5));
  const b = easeOut(seg(t, 1.6, 2.8));
  return (
    <Svg label="measured: the hint is silently ignored without AQE — same file count either way." h={230}>
      <T x={25} y={26} s={11} f={C.latte}>
        no hint
      </T>
      <Block x={25} y={40} k={a} />
      <T x={25} y={155} s={13} f={C.crema} o={a}>
        {num(128 * a)}
      </T>
      <T x={330} y={26} s={11} f={C.second}>
        REBALANCE, AQE off
      </T>
      <Block x={330} y={40} k={b} />
      <T x={330} y={155} s={13} f={C.crema} o={b}>
        {num(128 * b)}
      </T>
      <T x={300} y={90} s={15} f={C.focus} a="middle" o={easeOut(seg(t, 2.9, 3.2))}>
        =
      </T>
      <T x={25} y={205} s={13} f={C.focus} o={easeOut(seg(t, 3.4, 3.8))}>
        the hint had nowhere to act
      </T>
    </Svg>
  );
}

// 7 · AQE on. The switch flips; each folder's 32 pips thin to 4 (REBALANCE), then to one (REBALANCE(k)).
export function ElaborateRebalanceWithAqe({ t }: StepCtx) {
  const on = easeInOut(seg(t, 0.2, 0.7));
  const a = easeInOut(seg(t, 1.0, 2.0));
  const b = easeInOut(seg(t, 2.8, 3.8));
  const n = Math.round(lerp(lerp(32, 4, a), 1, b));
  return (
    <Svg label="with AQE on, REBALANCE coalesces the shuffle; REBALANCE(col) aligns it to partitions." h={240}>
      <Switch x={25} y={20} on={on} label="AQE on" />
      <Cell x={190} y={17} w={150} label={b > 0.1 ? 'REBALANCE(k)' : 'REBALANCE'} stroke={C.second} />
      <T x={575} y={36} s={13} f={b > 0.99 ? C.second : C.crema} a="end">
        {`files: ${n * 4}`}
      </T>
      {KS.map((j) => (
        <Folder key={j} x={25 + j * 140} y={70} j={j} n={n} f={b > 0.99 ? C.second : C.latte} />
      ))}
      <T x={25} y={205} s={12} f={C.latte} o={easeOut(seg(t, 2.0, 2.4))}>
        {b > 0.99 ? 'one file per value of k' : 'the plain hint: far fewer'}
      </T>
    </Svg>
  );
}

// 8 · Side by side. Three bars of the same write's file count: no hint, REBALANCE, REBALANCE(k), each counting to its value.
export function RevealSideBySide({ t }: StepCtx) {
  const rows: [string, number, string][] = [
    ['no hint', 128, C.latte],
    ['REBALANCE, AQE on', 16, C.second],
    ['REBALANCE(k), AQE on', 4, C.second],
  ];
  return (
    <Svg label="measured: the same write, three file counts, by nothing but a hint and AQE." h={250}>
      {rows.map(([l, v, f], i) => {
        const k = easeOut(seg(t, 0.3 + i * 1.1, 1.2 + i * 1.1));
        const w = (420 * v) / 128;
        return (
          <g key={l} opacity={k > 0 ? 1 : 0}>
            <T x={25} y={40 + i * 70} s={12} f={C.latte}>
              {l}
            </T>
            <rect x={25} y={52 + i * 70} width={Math.max(3, w * k)} height={16} fill={f} />
            <T x={40 + Math.max(3, w * k)} y={66 + i * 70} s={13} f={C.crema}>
              {num(v * k)}
            </T>
          </g>
        );
      })}
      <T x={25} y={240} s={12} f={C.focus} o={easeOut(seg(t, 3.8, 4.2))}>
        same table, same job: a hint and one switch
      </T>
    </Svg>
  );
}

// 9 · Recap. The default rule on top; two lever cards beneath: a per-file cap that leaves tasks alone, and a hint
// that reshapes tasks only with AQE's switch on.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="two levers, two problem shapes: a per-file cap, and a per-job hint under AQE." h={250}>
      <T x={300} y={35} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 0.2, 0.6))}>
        files = tasks × partitions touched
      </T>
      <Cell x={25} y={70} w={260} label="maxRecordsPerFile" o={easeOut(seg(t, 1.0, 1.4))} />
      <T x={25} y={125} s={11} f={C.latte} o={easeOut(seg(t, 1.4, 1.8))}>
        caps a file, tasks alone
      </T>
      <rect x={25} y={150} width={60} height={60} fill={C.mocha} stroke={C.latte} strokeWidth={1.2} opacity={easeOut(seg(t, 1.6, 2.0))} />
      <line x1={20} y1={180} x2={lerp(20, 140, easeOut(seg(t, 2.0, 2.4)))} y2={180} stroke={C.focus} strokeWidth={1.8} strokeDasharray="6 4" opacity={t > 2.0 ? 1 : 0} />
      <Cell x={315} y={70} w={260} label="REBALANCE hint" stroke={C.second} o={easeOut(seg(t, 2.6, 3.0))} />
      <T x={315} y={125} s={11} f={C.latte} o={easeOut(seg(t, 3.0, 3.4))}>
        reshapes tasks, needs AQE
      </T>
      <g opacity={easeOut(seg(t, 3.2, 3.6))}>
        <Switch x={315} y={160} on={easeInOut(seg(t, 3.6, 4.1))} label="AQE on" />
      </g>
    </Svg>
  );
}
