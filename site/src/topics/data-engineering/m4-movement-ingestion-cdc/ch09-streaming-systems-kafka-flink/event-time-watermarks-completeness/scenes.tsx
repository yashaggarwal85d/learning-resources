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

/** A small square event token at (x, y). */
function Pip({ x, y, o = 1, f = C.second }: { x: number; y: number; o?: number; f?: string }) {
  return <rect x={x - 5} y={y - 5} width={10} height={10} rx={2} fill={f} opacity={o} />;
}

/** A watermark needle: a short vertical line at x across a lane at y. */
function Needle({ x, y, f = C.focus, o = 1 }: { x: number; y: number; f?: string; o?: number }) {
  return <line x1={x} y1={y - 13} x2={x} y2={y + 13} stroke={f} strokeWidth={2.4} opacity={o} />;
}

/** Three partition lanes A, B, C with labels; lanes run from x 60 to 555. */
function Lanes({ ys, o = 1, dim = '' }: { ys: number[]; o?: number; dim?: string }) {
  return (
    <g opacity={o}>
      {['A', 'B', 'C'].slice(0, ys.length).map((n, i) => (
        <g key={n} opacity={dim === n ? 0.35 : 1}>
          <T x={25} y={ys[i] + 4} s={12} f={C.latte}>
            {n}
          </T>
          <line x1={60} y1={ys[i]} x2={555} y2={ys[i]} stroke={C.mocha} strokeWidth={1.2} />
        </g>
      ))}
    </g>
  );
}

// 0 · Hook. Three partitions, each with its own needle walking right as events stream in. B goes quiet: its events stop
// and its needle stops. The overall watermark, the lowest needle, freezes with it, and so does the window waiting on it.
export function Hook({ t }: StepCtx) {
  const ys = [40, 80, 120];
  const stop = 1.6;
  const pos = (i: number) => 90 + Math.min(t, i === 1 ? stop : 4.8) * 85;
  const g = Math.min(pos(0), pos(1), pos(2));
  return (
    <Svg label="one silent partition, and the whole pipeline's watermark simply stops" h={200}>
      <Lanes ys={ys} o={easeOut(seg(t, 0, 0.3))} />
      {ys.map((y, i) => {
        const p = Math.min(pos(i), 540);
        const n = Math.floor((p - 60) / 30);
        return (
          <g key={i}>
            {Array.from({ length: n }, (_, j) => (
              <Pip key={j} x={70 + j * 30} y={y} f={i === 1 ? C.latte : C.second} />
            ))}
            <Needle x={p} y={y} f={i === 1 && t > stop ? C.cherryText : C.focus} />
          </g>
        );
      })}
      <line x1={g} y1={22} x2={g} y2={140} stroke={C.cherryText} strokeWidth={1.4} strokeDasharray="4 3" opacity={easeOut(seg(t, 1.8, 2.2))} />
      <T x={g + 8} y={158} s={11} f={C.cherryText} o={easeOut(seg(t, 2.0, 2.4))}>
        the overall watermark, frozen
      </T>
      <T x={25} y={190} s={12} f={C.crema} o={easeOut(seg(t, 3.4, 3.8))}>
        nothing crashed; B just went quiet
      </T>
    </Svg>
  );
}

// 1 · Setup. One time axis, two needles: when it happened, and when it was noticed. The second trails the first, the gap
// opening and closing as delay and backlog come and go.
export function Setup({ t }: StepCtx) {
  const ev = 60 + Math.min(4.6, t) * 100;
  const lag = 20 + 70 * Math.abs(Math.sin(t * 1.3)) * easeOut(seg(t, 0.6, 1.2));
  const pr = ev - lag;
  return (
    <Svg label="two needles on one axis, free to drift apart under delay and backlog" h={200}>
      <line x1={40} y1={100} x2={560} y2={100} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0, 0.3))} />
      <line x1={Math.min(ev, 540)} y1={70} x2={Math.min(ev, 540)} y2={100} stroke={C.focus} strokeWidth={2.6} />
      <T x={25} y={40} s={11} f={C.focus} o={easeOut(seg(t, 0, 0.3))}>
        when it happened
      </T>
      <line x1={Math.max(40, Math.min(pr, 540))} y1={100} x2={Math.max(40, Math.min(pr, 540))} y2={130} stroke={C.second} strokeWidth={2.6} opacity={easeOut(seg(t, 0.4, 0.7))} />
      <T x={25} y={160} s={11} f={C.second} o={easeOut(seg(t, 0.4, 0.7))}>
        when the system noticed it
      </T>
      <rect
        x={Math.max(40, Math.min(pr, 540))}
        y={96}
        width={Math.max(0, Math.min(ev, 540) - Math.max(40, Math.min(pr, 540)))}
        height={8}
        fill={C.cherryText}
        opacity={0.4 * easeOut(seg(t, 1.0, 1.4))}
      />
      <T x={25} y={192} s={12} f={C.crema} o={easeOut(seg(t, 3.4, 3.8))}>
        a little apart, or a lot; nothing ties them
      </T>
    </Svg>
  );
}

// 2 · Predict. A watermark line claims nothing older is coming; events land to its right. On answer one older event
// arrives behind the line anyway, in cherry.
export function PredictGuarantee({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeInOut(seg(s, 0.1, 0.8)) : 0;
  return (
    <Svg label="would a real system's watermark ever actually be wrong?" h={200}>
      <line x1={40} y1={80} x2={560} y2={80} stroke={C.mocha} strokeWidth={1.5} />
      <line x1={260} y1={30} x2={260} y2={110} stroke={C.focus} strokeWidth={2.4} opacity={easeOut(seg(t, 0, 0.4))} />
      <T x={270} y={30} s={11} f={C.focus} o={easeOut(seg(t, 0.2, 0.5))}>
        nothing older still coming
      </T>
      {[300, 350, 410, 470].map((x, i) => (
        <Pip key={x} x={x} y={lerp(40, 80, easeOut(seg(t, 0.6 + i * 0.25, 0.9 + i * 0.25)))} o={easeOut(seg(t, 0.6 + i * 0.25, 0.8 + i * 0.25))} />
      ))}
      {v > 0 && <Pip x={180} y={lerp(40, 80, v)} f={C.cherryText} />}
      {v > 0 && (
        <T x={180} y={130} s={11} f={C.cherryText} a="middle" o={v}>
          older, late
        </T>
      )}
      <AnswerRow y={176} label="a promise?" answer={answer} value="no: a guess" k={easeOut(seg(t, 1.8, 2.4))} />
    </Svg>
  );
}

// 3 · Heuristic. Each of three partitions sets its own needle. The overall watermark is a dashed line that snaps to
// whichever needle is furthest behind, and only moves when that one does.
export function RevealHeuristic({ t }: StepCtx) {
  const ys = [40, 85, 130];
  const p = [100 + 90 * easeInOut(seg(t, 0.5, 4.4)) * 4, 100 + 60 * easeInOut(seg(t, 0.5, 4.4)) * 4, 100 + 75 * easeInOut(seg(t, 0.5, 4.4)) * 4];
  const g = Math.min(...p);
  return (
    <Svg label="a claim, almost always heuristic, generated separately per partition" h={200}>
      <Lanes ys={ys} o={easeOut(seg(t, 0, 0.3))} />
      {ys.map((y, i) => (
        <Needle key={i} x={Math.min(p[i], 540)} y={y} o={easeOut(seg(t, 0.2 + i * 0.15, 0.5 + i * 0.15))} f={p[i] === g ? C.cherryText : C.focus} />
      ))}
      <line x1={g} y1={22} x2={g} y2={150} stroke={C.cherryText} strokeWidth={1.4} strokeDasharray="4 3" opacity={easeOut(seg(t, 1.2, 1.6))} />
      <T x={25} y={176} s={11} f={C.focus} o={easeOut(seg(t, 0.6, 0.9))}>
        each partition: its own guess
      </T>
      <T x={25} y={196} s={11} f={C.cherryText} o={easeOut(seg(t, 1.8, 2.2))}>
        overall: only as far as the slowest
      </T>
    </Svg>
  );
}

// 4 · Predict. A keeps advancing; B froze at 5; the overall watermark sits on B's 5. On answer: it never moves.
export function PredictSelfFix({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const ys = [50, 100];
  const a = 150 + 330 * easeInOut(seg(t, 0.2, 2.6));
  return (
    <Svg label="without an explicit timeout, does the stalled watermark ever recover?" h={200}>
      <Lanes ys={ys} />
      <Needle x={a} y={50} />
      <Needle x={150} y={100} f={C.cherryText} />
      <T x={150} y={132} s={11} f={C.cherryText} a="middle">
        5
      </T>
      <line x1={150} y1={30} x2={150} y2={118} stroke={C.cherryText} strokeWidth={1.4} strokeDasharray="4 3" />
      {v > 0 && (
        <T x={170} y={80} s={12} f={C.cherryText} o={v}>
          still 5, forever
        </T>
      )}
      <AnswerRow y={176} label="moves on alone?" answer={answer} value="no: waits forever" k={easeOut(seg(t, 1.8, 2.4))} />
    </Svg>
  );
}

// 5 · Idle fix. A timer fills beside silent B. When it runs out B greys out, written off, and the overall watermark
// jumps from B's 5 up to A's needle and walks on with it.
export function RevealIdleFix({ t }: StepCtx) {
  const ys = [50, 100];
  const a = 260 + 260 * easeInOut(seg(t, 0, 4.6));
  const timer = easeInOut(seg(t, 0.3, 1.8));
  const off = easeOut(seg(t, 1.8, 2.2));
  const jump = easeInOut(seg(t, 2.2, 2.8));
  const g = lerp(150, a, jump);
  return (
    <Svg label="a timeout excludes the silent partition, and the global watermark moves again" h={200}>
      <Lanes ys={ys} dim={off > 0.5 ? 'B' : ''} />
      <Needle x={a} y={50} />
      <Needle x={150} y={100} f={C.cherryText} o={1 - 0.65 * off} />
      <rect x={300} y={92} width={180} height={16} rx={3} fill="none" stroke={C.latte} strokeWidth={1.2} opacity={1 - off} />
      <rect x={302} y={94} width={176 * timer} height={12} rx={2} fill={C.latte} opacity={0.6 * (1 - off)} />
      {off < 1 && (
        <T x={300} y={132} s={11} f={C.latte} o={1 - off}>
          silent for how long?
        </T>
      )}
      {off > 0 && (
        <T x={300} y={132} s={11} f={C.latte} o={off}>
          idle: left out
        </T>
      )}
      <line x1={g} y1={30} x2={g} y2={118} stroke={jump > 0 ? C.focus : C.cherryText} strokeWidth={1.4} strokeDasharray="4 3" />
      <T x={25} y={170} s={11} f={C.cherryText} o={easeOut(seg(t, 0.2, 0.5))}>
        naive: stuck at 5
      </T>
      <T x={25} y={194} s={12} f={C.focus} o={easeOut(seg(t, 2.8, 3.2))}>
        idle-aware: follows A again
      </T>
    </Svg>
  );
}

// 6 · Alignment. On one axis the slow partition sits at 10 and the fast one races to 100; the buffer between them, what
// a join downstream must hold, shades in wide. Then the fast one is capped at 10 + 20 and the buffer shrinks to match.
export function RevealAlignment({ t }: StepCtx) {
  const ax = (v: number) => 60 + v * 4.8;
  const run = easeInOut(seg(t, 0.4, 1.6));
  const cap = easeInOut(seg(t, 2.4, 3.2));
  const fast = lerp(ax(10), lerp(ax(100), ax(30), cap), run);
  return (
    <Svg label="a fast partition's watermark is capped, bounding the buffer it forces downstream" h={200}>
      <line x1={ax(0)} y1={90} x2={ax(100)} y2={90} stroke={C.mocha} strokeWidth={1.5} />
      <Needle x={ax(10)} y={90} f={C.second} />
      <T x={ax(10)} y={124} s={11} f={C.second} a="middle">
        slow: 10
      </T>
      <Needle x={fast} y={90} />
      <T x={ax(100)} y={124} s={11} f={C.focus} a="end" o={run * (1 - cap)}>
        fast: 100
      </T>
      <rect x={ax(10)} y={50} width={Math.max(0, fast - ax(10))} height={20} rx={3} fill={C.cherryText} opacity={0.35 * easeOut(seg(t, 1.0, 1.4)) * (1 - cap) + 0.35 * cap} />
      <T x={ax(10)} y={40} s={11} f={C.latte} o={easeOut(seg(t, 1.2, 1.6))}>
        what downstream must hold
      </T>
      {cap > 0 && (
        <T x={ax(30)} y={124} s={11} f={C.focus} a="start" o={cap}>
          capped: 10 + 20
        </T>
      )}
      <T x={25} y={180} s={12} f={C.crema} o={easeOut(seg(t, 3.6, 4.0))}>
        rein in the fast one; hoard far less
      </T>
    </Svg>
  );
}

// 7 · Trade-off. A dial of bounds 2, 10 and 30. For each, a wait bar grows with the bound and the late events, in cherry,
// thin out: sooner but rougher, later but righter.
export function RevealTradeoff({ t }: StepCtx) {
  const cols: [string, number, number][] = [
    ['bound 2', 60, 3],
    ['bound 10', 150, 2],
    ['bound 30', 260, 1],
  ];
  return (
    <Svg label="tighter means faster but less complete; looser means slower but more complete" h={200}>
      <T x={180} y={22} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 0, 0.3))}>
        wait before answering
      </T>
      <T x={470} y={22} s={11} f={C.cherryText} a="middle" o={easeOut(seg(t, 0, 0.3))}>
        marked late
      </T>
      {cols.map(([n, w, late], i) => {
        const k0 = 0.4 + i * 1.0;
        const g = easeInOut(seg(t, k0, k0 + 0.7));
        return (
          <g key={n} opacity={easeOut(seg(t, k0 - 0.2, k0))}>
            <T x={25} y={58 + i * 44} s={12} f={C.crema}>
              {n}
            </T>
            <rect x={110} y={46 + i * 44} width={w * g} height={14} rx={3} fill={C.latte} opacity={0.6} />
            {Array.from({ length: late }, (_, j) => (
              <Pip key={j} x={440 + j * 22} y={53 + i * 44} f={C.cherryText} o={easeOut(seg(t, k0 + 0.5 + j * 0.1, k0 + 0.7 + j * 0.1))} />
            ))}
          </g>
        );
      })}
      <T x={25} y={194} s={12} f={C.crema} o={easeOut(seg(t, 3.7, 4.1))}>
        neither is better; it depends on the need
      </T>
    </Svg>
  );
}

// 8 · Prove it. The run's results, one by one.
export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="this topic's own real run, every number read straight off it" h={260}>
      <Row y={30} label="stream" value="200 events, 2 dups" k={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={70} label="B silent, naive" value="stuck at 5" valueColor={C.cherryText} k={easeOut(seg(t, 0.7, 1.1))} />
      <Row y={110} label="idle-aware" value="follows A" valueColor={C.focus} k={easeOut(seg(t, 1.2, 1.6))} />
      <Row y={150} label="aligned drift" value="capped at 20" k={easeOut(seg(t, 1.8, 2.2))} />
      <Row y={190} label="bound 2 vs 30" value="tighter: more late" valueColor={C.cherryText} k={easeOut(seg(t, 2.4, 2.8))} />
      <Row y={230} label="bounds 2, 10, 30" value="never less complete" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.4))} />
    </Svg>
  );
}

// 9 · Recap. Three lines, one by one; the dial line outlined.
export function Recap({ t }: StepCtx) {
  const rows = ['two clocks, free to drift apart', 'completeness: an honest guess, not a promise', 'a dial: sooner, or more complete'];
  return (
    <Svg label="two needles, a heuristic claim, two necessary fixes, and a measured trade-off" h={260}>
      {rows.map((r, i) => {
        const k = easeOut(seg(t, 0.3 + i * 1.1, 0.8 + i * 1.1));
        return <Cell key={i} x={25} y={lerp(30, 40, k) + i * 60} w={530} label={r} o={k} stroke={i === 2 ? C.focus : C.mocha} />;
      })}
    </Svg>
  );
}
