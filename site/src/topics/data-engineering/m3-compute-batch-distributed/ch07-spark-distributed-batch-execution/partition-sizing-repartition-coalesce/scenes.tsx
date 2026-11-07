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

/** A row of partition cells. Each item is [x, width]; all share y and height. */
function Pieces({ cells, y, h = 26, f = C.focus, k = 1 }: { cells: [number, number][]; y: number; h?: number; f?: string; k?: number }) {
  return (
    <g opacity={k}>
      {cells.map(([x, w], i) => (
        <rect key={i} x={x} y={y} width={Math.max(2, w)} height={h} rx={2} fill={C.cocoa} stroke={f} strokeWidth={1.4} />
      ))}
    </g>
  );
}
/** `n` equal cells across [x, x + w]. */
function even(n: number, x = 25, w = 550, gap = 6): [number, number][] {
  const cw = (w - (n - 1) * gap) / n;
  return Array.from({ length: n }, (_, i) => [x + i * (cw + gap), cw]);
}
/** Morph between two cell lists of the same length. */
function morph(a: [number, number][], b: [number, number][], s: number): [number, number][] {
  return a.map(([x, w], i) => [lerp(x, b[i][0], s), lerp(w, b[i][1], s)]);
}

// 1 · Hook. One block of work; a knife line sweeps and cuts it into pieces, the count a "?".
export function Hook({ t }: StepCtx) {
  const n = Math.max(1, Math.round(lerp(1, 6, easeInOut(seg(t, 1.0, 2.6)))));
  return (
    <Svg label="the shuffle's own biggest lever: how many pieces is the work actually cut into?" h={200}>
      <Pieces cells={even(n)} y={50} h={40} f={C.latte} k={easeOut(seg(t, 0.1, 0.4))} />
      <T x={25} y={30} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        the work
      </T>
      <T x={300} y={140} s={13} f={C.second} a="middle" o={easeOut(seg(t, 2.8, 3.2))}>
        how many pieces, and who decides?
      </T>
    </Svg>
  );
}

// 2 · The config, measured. The same group-by twice: its output row shows 4 cells, the knob turns, then 17.
export function RevealShuffleConfig({ t }: StepCtx) {
  const b = t > 2.2;
  return (
    <Svg label="measured: the identical group-by produces exactly as many output partitions as one config says, every time." h={200}>
      <T x={25} y={24} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        spark.sql.shuffle.partitions
      </T>
      <T x={575} y={24} s={13} f={C.focus} a="end" o={easeOut(seg(t, 0.1, 0.4))}>
        {b ? '17' : '4'}
      </T>
      <Pieces cells={even(4)} y={44} k={easeOut(seg(t, 0.4, 0.8)) * (b ? 0.35 : 1)} />
      <T x={25} y={96} s={11} f={C.latte} o={easeOut(seg(t, 0.6, 1.0))}>
        run 1: 4 output partitions
      </T>
      <Pieces cells={even(17)} y={114} k={easeOut(seg(t, 2.4, 2.9))} />
      <T x={25} y={166} s={11} f={C.focus} o={easeOut(seg(t, 2.8, 3.2))}>
        run 2, same data: 17
      </T>
      <T x={575} y={192} s={11} f={C.latte} a="end" o={easeOut(seg(t, 3.4, 3.8))}>
        a setting, not derived from the data
      </T>
    </Svg>
  );
}

// 3 · Predict. Eight uneven pieces and a repartition(3) call: does reaching even pieces move rows?
export function PredictRepartitionShuffle({ t, answer }: StepCtx) {
  return (
    <Svg label="repartition asks for a new partition count. Does getting there require a real shuffle?" h={200}>
      <Pieces cells={even(8)} y={20} f={C.latte} k={easeOut(seg(t, 0.1, 0.4))} />
      <Cell x={25} y={64} w={160} h={28} label="repartition(3)" stroke={C.second} o={easeOut(seg(t, 0.6, 1.0))} />
      <AnswerRow y={130} label="a real shuffle?" answer={answer} value="yes: every row moves" k={easeOut(seg(t, 1.4, 1.9))} />
      <Verdict answer={answer} y={178} text="even sizes need every row moved" />
    </Svg>
  );
}

// 4 · repartition, measured. Every piece sends rows through an Exchange bar into three even pieces.
export function RevealRepartitionShuffles({ t }: StepCtx) {
  const x = easeOut(seg(t, 0.6, 1.1));
  const p = seg(t, 1.0, 2.6);
  const out = easeOut(seg(t, 2.4, 2.9));
  return (
    <Svg label="measured: repartition's own plan carries a real Exchange node. Every row gets redistributed to land evenly." h={200}>
      <Pieces cells={even(8)} y={16} f={C.latte} />
      <rect x={25} y={60} width={550} height={12 * x} rx={2} fill={C.second} />
      <T x={575} y={56} s={11} f={C.second} a="end" o={x}>
        Exchange
      </T>
      {Array.from({ length: 16 }, (_, i) => {
        const q = clamp(p * 2 - (i % 8) * 0.08);
        const sx = 25 + (i % 8) * 69 + 30;
        const tx = 25 + (i % 3) * 186 + 90;
        return <circle key={i} cx={lerp(sx, tx, q)} cy={lerp(78, 118, q)} r={3.5} fill={C.focus} opacity={q > 0 && q < 1 ? 1 : 0} />;
      })}
      <Pieces cells={even(3)} y={124} k={out} />
      <T x={25} y={176} s={12} f={C.focus} o={easeOut(seg(t, 3.0, 3.4))}>
        three pieces, close to even
      </T>
    </Svg>
  );
}

// 5 · Predict. The same eight pieces and coalesce(3): the same shuffle?
export function PredictCoalesceShuffle({ t, answer }: StepCtx) {
  return (
    <Svg label="coalesce asks for the same lower count. Does it shuffle the exact same way repartition just did?" h={200}>
      <Pieces cells={even(8)} y={20} f={C.latte} k={easeOut(seg(t, 0.1, 0.4))} />
      <Cell x={25} y={64} w={160} h={28} label="coalesce(3)" stroke={C.second} o={easeOut(seg(t, 0.6, 1.0))} />
      <AnswerRow y={130} label="a shuffle?" answer={answer} value="no: it merges" k={easeOut(seg(t, 1.4, 1.9))} />
      <Verdict answer={answer} y={178} text="neighbours glued where they sit" />
    </Svg>
  );
}

// 6 · coalesce, measured. Neighbouring cells slide together into three merged pieces, no Exchange bar; then coalesce(20) leaves 8 as 8.
export function RevealCoalesceNoShuffle({ t }: StepCtx) {
  const s = easeInOut(seg(t, 0.6, 1.6));
  const groups = [0, 0, 0, 1, 1, 1, 2, 2];
  const e8 = even(8);
  const e3 = even(3);
  const tgt: [number, number][] = e8.map((_, i) => {
    const g = groups[i];
    const members = groups.filter((x) => x === g).length;
    const j = groups.slice(0, i).filter((x) => x === g).length;
    const [gx, gw] = e3[g];
    return [gx + (j * gw) / members, gw / members];
  });
  return (
    <Svg label="measured: coalesce reaches the same count with no Exchange at all, by merging pieces, not redistributing rows." h={200}>
      <Pieces cells={morph(e8, tgt, s)} y={20} f={s > 0.95 ? C.focus : C.latte} />
      <T x={25} y={72} s={12} f={C.focus} o={easeOut(seg(t, 1.6, 2.0))}>
        3 pieces, no Exchange
      </T>
      <T x={25} y={116} s={11} f={C.latte} o={easeOut(seg(t, 2.4, 2.8))}>
        coalesce(20) on 8 pieces
      </T>
      <Pieces cells={even(8)} y={128} f={C.second} k={easeOut(seg(t, 2.6, 3.0))} />
      <T x={575} y={176} s={12} f={C.second} a="end" o={easeOut(seg(t, 3.2, 3.6))}>
        stays at 8: it only merges down
      </T>
    </Svg>
  );
}

// 7 · Predict. coalesce(1) at the end of an eight-piece read: does only the output shrink?
export function PredictCoalesceOneTrap({ t, answer }: StepCtx) {
  return (
    <Svg label="coalesce(1) merges everything into one final piece. Does it only shrink that final output, or something upstream too?" h={200}>
      <T x={25} y={22} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        the read: 8 pieces
      </T>
      <Pieces cells={even(8)} y={30} f={C.latte} k={easeOut(seg(t, 0.1, 0.4))} />
      <Cell x={25} y={70} w={160} h={28} label="coalesce(1)" stroke={C.second} o={easeOut(seg(t, 0.6, 1.0))} />
      <AnswerRow y={140} label="what shrinks?" answer={answer} value="the read, too" k={easeOut(seg(t, 1.4, 1.9))} />
      <Verdict answer={answer} y={184} text="no new boundary: it folds backward" />
    </Svg>
  );
}

// 8 · The collapse. All eight read cells squeeze into one; the task counter drops from 8 to 1; the row count fills to 2,000,000.
export function RevealCoalesceOneCollapse({ t }: StepCtx) {
  const s = easeInOut(seg(t, 0.6, 1.8));
  const e8 = even(8);
  const one: [number, number][] = e8.map((_, i) => [25 + (i * 550) / 8, 550 / 8]);
  const n = Math.round(lerp(0, 2000000, easeOut(seg(t, 1.8, 3.0))));
  return (
    <Svg label="measured: all eight upstream partitions merge into that one task too. Every single row lands in one place." h={200}>
      <Pieces cells={morph(e8, one, s)} y={24} f={s > 0.95 ? C.cherryText : C.latte} />
      {s > 0.95 && <rect x={25} y={24} width={550} height={26} rx={2} fill="none" stroke={C.cherryText} strokeWidth={2} />}
      <Row y={96} label="tasks that ran the read" value={s > 0.95 ? '1' : '8'} valueColor={s > 0.95 ? C.cherryText : C.crema} k={easeOut(seg(t, 0.4, 0.8))} />
      <Row y={150} label="rows in that one piece" value={num(n)} valueColor={C.cherryText} k={easeOut(seg(t, 1.8, 2.2))} />
    </Svg>
  );
}

// 9 · Recap.
export function Recap({ t }: StepCtx) {
  const r: [string, string, string][] = [
    ['the count', 'a direct setting', C.crema],
    ['repartition', 'a real shuffle', C.second],
    ['coalesce', 'merges, only down', C.focus],
    ['coalesce(1)', 'can collapse upstream', C.cherryText],
  ];
  return (
    <Svg label="one config sets the count, one call shuffles to get there, one call merges instead, and one number can collapse everything upstream." h={250}>
      {r.map(([a, b, f], i) => (
        <Row key={a} y={35 + i * 55} label={a} value={b} valueColor={f} k={easeOut(seg(t, 0.2 + i * 0.7, 0.6 + i * 0.7))} />
      ))}
    </Svg>
  );
}
