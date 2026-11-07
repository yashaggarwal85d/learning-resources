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

/** A small square record token at (x, y). */
function Pip({ x, y, o = 1, f = C.second }: { x: number; y: number; o?: number; f?: string }) {
  return <rect x={x - 5} y={y - 5} width={10} height={10} rx={2} fill={f} opacity={o} />;
}

/** An empty dashed slot. */
function Hole({ x, y, w, h = 28, o = 1, stroke = C.mocha }: { x: number; y: number; w: number; h?: number; o?: number; stroke?: string }) {
  return <rect x={x} y={y} width={w} height={h} rx={4} fill="none" stroke={stroke} strokeWidth={1.5} strokeDasharray="4 3" opacity={o} />;
}

/** A window box from x1 to x2 at y, height h. */
function Win({ x1, x2, y, h = 24, o = 1, f = C.latte, dash = false }: { x1: number; x2: number; y: number; h?: number; o?: number; f?: string; dash?: boolean }) {
  return <rect x={x1} y={y} width={Math.max(0, x2 - x1)} height={h} rx={4} fill="none" stroke={f} strokeWidth={1.5} strokeDasharray={dash ? '4 3' : undefined} opacity={o} />;
}

/** A time axis from 0 to 40 units, x = 60 + u × 12. */
const ux = (u: number) => 60 + u * 12;

// 0 · Hook. The same records along one axis. Poured into side-by-side buckets, each sits once; the buckets change
// shape to overlapping ones and every record doubles up beneath. Then two groups below, and a late record that joins
// them into one.
export function Hook({ t }: StepCtx) {
  const xs = [4, 8, 13, 17, 22, 26, 31, 36];
  const sl = easeInOut(seg(t, 1.4, 2.2));
  const late = easeInOut(seg(t, 3.0, 3.6));
  return (
    <Svg label="same stream, same key, four different window shapes drawn under one time axis" h={200}>
      {xs.map((u) => (
        <Pip key={u} x={ux(u)} y={20} o={easeOut(seg(t, 0, 0.4))} />
      ))}
      {[0, 10, 20, 30].map((s) => (
        <Win key={s} x1={ux(s) + 2} x2={ux(s + 10) - 2} y={34} o={easeOut(seg(t, 0.4, 0.8)) * (1 - sl)} />
      ))}
      {[0, 5, 10, 15, 20, 25, 30].map((s, i) => (
        <Win key={`s${s}`} x1={ux(s) + 2} x2={Math.min(ux(s + 10), ux(40)) - 2} y={34 + (i % 2) * 28} o={sl} f={C.second} />
      ))}
      {xs.map((u) => (
        <g key={`c${u}`} opacity={sl}>
          <Pip x={ux(u)} y={46} f={C.second} />
          {u >= 5 && <Pip x={ux(u)} y={74} f={C.second} />}
        </g>
      ))}
      <T x={555} y={112} s={11} f={C.cherryText} a="end" o={easeOut(seg(t, 2.2, 2.5))}>
        far more state
      </T>
      <Win x1={ux(2)} x2={ux(14)} y={134} o={easeOut(seg(t, 2.6, 2.9)) * (1 - late)} f={C.focus} />
      <Win x1={ux(20)} x2={ux(34)} y={134} o={easeOut(seg(t, 2.6, 2.9)) * (1 - late)} f={C.focus} />
      {late > 0 && <Win x1={ux(2)} x2={ux(34)} y={134} o={late} f={C.focus} />}
      <Pip x={ux(17)} y={lerp(110, 146, late)} f={C.cherryText} o={late > 0 ? 1 : 0} />
      <T x={25} y={190} s={12} f={C.crema} o={easeOut(seg(t, 3.7, 4.1))}>
        two groups, quietly one
      </T>
    </Svg>
  );
}

// 1 · Setup. A watermark needle claims "done up to here"; a box carves out the chunk it applies to, and the records
// inside it light up. Then the four shapes that box may take, one by one.
export function Setup({ t }: StepCtx) {
  const xs = [3, 7, 11, 14, 18, 23, 27, 33];
  const box = easeOut(seg(t, 1.0, 1.5));
  return (
    <Svg label="a window is the concrete chunk of time a watermark's claim gets applied to" h={200}>
      {xs.map((u) => (
        <Pip key={u} x={ux(u)} y={60} f={box > 0 && u >= 10 && u < 20 ? C.focus : C.second} o={easeOut(seg(t, 0, 0.4))} />
      ))}
      <line x1={ux(22)} y1={30} x2={ux(22)} y2={90} stroke={C.focus} strokeWidth={2.4} opacity={easeOut(seg(t, 0.4, 0.8))} />
      <T x={ux(22) + 8} y={30} s={11} f={C.focus} o={easeOut(seg(t, 0.5, 0.8))}>
        complete up to here
      </T>
      <Win x1={ux(10)} x2={ux(20)} y={44} h={32} o={box} f={C.focus} />
      <T x={ux(10)} y={100} s={11} f={C.latte} o={box}>
        the chunk it applies to
      </T>
      {['tumbling', 'sliding', 'session', 'global'].map((n, i) => (
        <Cell key={n} x={25 + i * 135} y={140} w={125} label={n} o={easeOut(seg(t, 2.2 + i * 0.4, 2.6 + i * 0.4))} />
      ))}
    </Svg>
  );
}

// 2 · Predict. A tumbling row and a sliding row, both of size 10. One record drops into each: one copy in the tumbling
// row; the sliding row holds a question. On answer it lands in both overlapping windows.
export function PredictStateCost({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const drop = easeOut(seg(t, 0.8, 1.3));
  return (
    <Svg label="same stream, same window size — does the shape change the cost?" h={200}>
      <T x={25} y={38} s={11} f={C.latte}>
        tumbling
      </T>
      {[0, 10, 20, 30].map((s0) => (
        <Win key={s0} x1={ux(s0) + 2} x2={ux(s0 + 10) - 2} y={22} o={easeOut(seg(t, 0, 0.3))} />
      ))}
      <Pip x={ux(13)} y={lerp(14, 34, drop)} o={drop} />
      <T x={25} y={98} s={11} f={C.latte}>
        sliding
      </T>
      {[0, 5, 10, 15, 20, 25, 30].map((s0, i) => (
        <Win key={s0} x1={ux(s0) + 2} x2={Math.min(ux(s0 + 10), ux(40)) - 2} y={74 + (i % 2) * 28} o={easeOut(seg(t, 0.2, 0.5))} f={C.second} />
      ))}
      {v > 0 && <Pip x={ux(13)} y={86} o={v} f={C.focus} />}
      {v > 0 && <Pip x={ux(13)} y={114} o={v} f={C.focus} />}
      <AnswerRow y={170} label="sliding copies" answer={answer} value="one per overlap" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 3 · State cost. A record drops into the tumbling row: one home. The same record drops into the sliding row and
// splits into both overlapping windows: two homes. Then the run's ratio of copies.
export function RevealStateCost({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 0.9));
  const b = easeOut(seg(t, 1.6, 2.1));
  const split = easeInOut(seg(t, 2.1, 2.6));
  return (
    <Svg label="tumbling assigns once; sliding duplicates into every window it overlaps" h={200}>
      <T x={25} y={38} s={11} f={C.latte}>
        tumbling
      </T>
      {[0, 10, 20, 30].map((s0) => (
        <Win key={s0} x1={ux(s0) + 2} x2={ux(s0 + 10) - 2} y={22} f={s0 === 10 && a > 0.5 ? C.focus : C.latte} />
      ))}
      <Pip x={ux(13)} y={lerp(10, 34, a)} o={a} f={C.focus} />
      <T x={25} y={98} s={11} f={C.latte}>
        sliding
      </T>
      {[0, 5, 10, 15, 20, 25, 30].map((s0, i) => (
        <Win key={s0} x1={ux(s0) + 2} x2={Math.min(ux(s0 + 10), ux(40)) - 2} y={74 + (i % 2) * 28} f={(s0 === 5 || s0 === 10) && split > 0.5 ? C.focus : C.second} o={easeOut(seg(t, 1.2, 1.5))} />
      ))}
      <Pip x={ux(13)} y={lerp(62, 86, b)} o={b} f={C.focus} />
      {split > 0 && <Pip x={ux(13)} y={lerp(86, 114, split)} f={C.focus} />}
      <T x={25} y={160} s={12} f={C.crema} o={easeOut(seg(t, 2.8, 3.2))}>
        sliding copies: 1.8 to 2.2 times tumbling's
      </T>
      <T x={25} y={190} s={11} f={C.latte} o={easeOut(seg(t, 3.6, 4.0))}>
        more overlap, more copies in memory
      </T>
    </Svg>
  );
}

/** Session axis from 0 to 12 units, x = 60 + u × 38. */
const sx = (u: number) => 60 + u * 38;

// 4 · Sessions. a1 and a2 arrive and their session stretches to 5; b1 and b2 arrive and theirs stretches from 6 to
// 11: two sessions with a gap between. A late record lands at 3; its window bridges the gap and the two snap into one.
export function RevealSessionMerge({ t }: StepCtx) {
  const recs: [string, number, number][] = [
    ['a1', 0, 0.2],
    ['a2', 1, 0.6],
    ['b1', 6, 1.0],
    ['b2', 7, 1.4],
  ];
  const aEnd = lerp(4, 5, easeInOut(seg(t, 0.6, 0.9)));
  const bEnd = lerp(10, 11, easeInOut(seg(t, 1.4, 1.7)));
  const late = easeInOut(seg(t, 2.4, 3.0));
  const m = easeInOut(seg(t, 3.0, 3.5));
  return (
    <Svg label="no fixed shape — a late record inside the gap pulls two sessions into one" h={200}>
      {recs.map(([n, u, a]) => (
        <g key={n} opacity={easeOut(seg(t, a, a + 0.3))}>
          <Pip x={sx(u)} y={70} />
          <T x={sx(u)} y={46} s={11} f={C.latte} a="middle">
            {n}
          </T>
        </g>
      ))}
      {m < 1 && <Win x1={sx(0) - 8} x2={sx(aEnd)} y={58} o={easeOut(seg(t, 0.2, 0.5)) * (1 - m)} f={C.focus} />}
      {m < 1 && <Win x1={sx(6) - 8} x2={sx(bEnd)} y={58} o={easeOut(seg(t, 1.0, 1.3)) * (1 - m)} f={C.focus} />}
      {m > 0 && <Win x1={sx(0) - 8} x2={sx(11)} y={58} o={m} f={C.focus} />}
      {late <= 0 && (
        <T x={sx(5) + 4} y={110} s={11} f={C.latte} o={easeOut(seg(t, 1.8, 2.1))}>
          gap 4: kept apart
        </T>
      )}
      <Pip x={sx(3)} y={lerp(100, 70, late)} f={C.cherryText} o={late > 0 ? 1 : 0} />
      <Win x1={sx(3) - 8} x2={sx(7)} y={90} h={16} o={late * (1 - m)} f={C.cherryText} dash />
      {late > 0.5 && (
        <T x={sx(3)} y={136} s={11} f={C.cherryText} a="middle" o={late}>
          late, at 3
        </T>
      )}
      {m <= 0 && (
        <T x={25} y={176} s={12} f={C.crema} o={easeOut(seg(t, 1.8, 2.1))}>
          2 sessions
        </T>
      )}
      {m > 0 && (
        <T x={25} y={176} s={12} f={C.focus} o={m}>
          1 session
        </T>
      )}
    </Svg>
  );
}

// 5 · Predict. One window spans the whole stream, its right edge dashed off past the frame; records pile in. The
// default rule waits for the end. On answer: it never comes.
export function PredictGlobalFires({ t, answer }: StepCtx) {
  const n = Math.floor(easeInOut(seg(t, 0.4, 2.4)) * 16);
  return (
    <Svg label="one window, the whole stream, no end at all — does the default trigger ever fire?" h={200}>
      <path d="M40 30 H560 M40 30 V90 H560" fill="none" stroke={C.latte} strokeWidth={1.5} opacity={easeOut(seg(t, 0, 0.3))} />
      <line x1={540} y1={30} x2={575} y2={30} stroke={C.latte} strokeWidth={1.5} strokeDasharray="4 3" />
      {Array.from({ length: n }, (_, i) => (
        <Pip key={i} x={60 + i * 30} y={60} />
      ))}
      <T x={40} y={118} s={11} f={C.latte} o={easeOut(seg(t, 0.6, 0.9))}>
        default rule: speak once the end has passed
      </T>
      <AnswerRow y={170} label="ever speaks?" answer={answer} value="never, on its own" k={easeOut(seg(t, 1.8, 2.4))} />
    </Svg>
  );
}

// 6 · Inert global window. The watermark needle walks right, but the window has no right edge to pass, and the output
// slot stays empty. Then a count trigger of 25: a bar fills over 60 records and speaks at 25 and 50.
export function RevealGlobalInert({ t }: StepCtx) {
  const wm = 60 + 300 * easeInOut(seg(t, 0.2, 2.0));
  const cnt = Math.round(60 * easeInOut(seg(t, 2.4, 4.2)));
  return (
    <Svg label="the default trigger waits for the watermark to pass the window's end, which never comes" h={200}>
      <path d="M40 20 H560 M40 20 V64 H560" fill="none" stroke={C.latte} strokeWidth={1.5} />
      <line x1={wm} y1={14} x2={wm} y2={70} stroke={C.focus} strokeWidth={2.4} />
      <T x={25} y={90} s={11} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        default rule: output
      </T>
      <Hole x={190} y={76} w={110} h={22} o={easeOut(seg(t, 0.4, 0.7))} />
      <T x={315} y={90} s={11} f={C.cherryText} o={easeOut(seg(t, 1.6, 1.9))}>
        never fires
      </T>
      <T x={25} y={128} s={12} f={C.crema} o={easeOut(seg(t, 2.2, 2.5))}>
        a count trigger of 25, over 60 records
      </T>
      <rect x={260} y={154} width={290} height={14} rx={3} fill="none" stroke={C.mocha} strokeWidth={1.2} opacity={easeOut(seg(t, 2.2, 2.5))} />
      <rect x={262} y={156} width={286 * (cnt / 60)} height={10} rx={2} fill={C.second} opacity={0.7} />
      <Cell x={25} y={152} w={100} label="fired: 25" o={cnt >= 25 ? 1 : 0} stroke={C.focus} />
      <Cell x={135} y={152} w={100} label="fired: 50" o={cnt >= 50 ? 1 : 0} stroke={C.focus} />
    </Svg>
  );
}

// 7 · Pane cleanup. Records arrive left to right; a pane opens for each new window of 10. The watermark trails by 18,
// and a pane closes once it passes the window's end plus 5 of lateness, so live panes rise and hold. The source goes
// idle, the watermark runs to the end, and every pane closes: zero live.
export function RevealPaneCleanup({ t }: StepCtx) {
  const px = (u: number) => 60 + u * 6;
  const cur = 80 * easeInOut(seg(t, 0.2, 3.0));
  const idle = easeInOut(seg(t, 3.2, 3.8));
  const wm = lerp(cur - 18, 120, idle);
  const panes = [0, 1, 2, 3, 4, 5, 6, 7].filter((w) => cur >= w * 10 && !(wm > w * 10 + 9 + 5));
  return (
    <Svg label="every pane closes once the watermark, plus lateness, passes its window's end" h={200}>
      <line x1={px(0)} y1={70} x2={px(80)} y2={70} stroke={C.mocha} strokeWidth={1.2} />
      {panes.map((w) => (
        <Win key={w} x1={px(w * 10) + 2} x2={px(w * 10 + 10) - 2} y={44} h={40} f={C.second} />
      ))}
      <line x1={px(Math.min(cur, 80))} y1={36} x2={px(Math.min(cur, 80))} y2={92} stroke={C.latte} strokeWidth={1.5} opacity={1 - idle} />
      {wm > 0 && <line x1={px(Math.min(wm, 80))} y1={36} x2={px(Math.min(wm, 80))} y2={92} stroke={C.focus} strokeWidth={2.4} />}
      <T x={25} y={22} s={11} f={C.focus} o={easeOut(seg(t, 0.6, 0.9))}>
        watermark trails by 18; a pane closes 5 past its end
      </T>
      <T x={25} y={124} s={11} f={C.latte}>
        live panes
      </T>
      {panes.map((w, i) => (
        <rect key={w} x={110 + i * 18} y={114} width={12} height={12} rx={2} fill={C.second} />
      ))}
      <T x={25} y={160} s={11} f={C.latte} o={easeOut(seg(t, 3.1, 3.4))}>
        source goes idle: the watermark runs to the end
      </T>
      <T x={25} y={190} s={12} f={C.focus} o={easeOut(seg(t, 3.9, 4.2))}>
        live panes: 0
      </T>
    </Svg>
  );
}

// 8 · Prove it. The run's results, one by one.
export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="this topic's own real run, every number read straight off it" h={260}>
      <Row y={30} label="tumbling, 200 records" value="one copy each" k={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={70} label="sliding, 10 by 5" value="1.8 to 2.2 times" valueColor={C.cherryText} k={easeOut(seg(t, 0.7, 1.1))} />
      <Row y={110} label="sessions, gap 4" value="2, then 1" valueColor={C.focus} k={easeOut(seg(t, 1.2, 1.6))} />
      <Row y={150} label="default trigger" value="never fired" valueColor={C.cherryText} k={easeOut(seg(t, 1.8, 2.2))} />
      <Row y={190} label="count trigger" value="fired at 25, 50" k={easeOut(seg(t, 2.4, 2.8))} />
      <Row y={230} label="live panes, idle" value="0" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.4))} />
    </Svg>
  );
}

// 9 · Recap. Three lines, one by one; the state-must-go line outlined.
export function Recap({ t }: StepCtx) {
  const rows = ['four shapes, four ideas of done', 'more overlap, more state held', 'every pile of state eventually goes'];
  return (
    <Svg label="four shapes, four notions of an end, a cost that scales, state that must die" h={260}>
      {rows.map((r, i) => {
        const k = easeOut(seg(t, 0.3 + i * 1.1, 0.8 + i * 1.1));
        return <Cell key={i} x={25} y={lerp(30, 40, k) + i * 60} w={530} label={r} o={k} stroke={i === 2 ? C.focus : C.mocha} />;
      })}
    </Svg>
  );
}
