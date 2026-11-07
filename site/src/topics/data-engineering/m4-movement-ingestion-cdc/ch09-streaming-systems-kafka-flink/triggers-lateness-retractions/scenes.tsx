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

/** An empty dashed slot. */
function Hole({ x, y, w, h = 28, o = 1, stroke = C.mocha }: { x: number; y: number; w: number; h?: number; o?: number; stroke?: string }) {
  return <rect x={x} y={y} width={w} height={h} rx={4} fill="none" stroke={stroke} strokeWidth={1.5} strokeDasharray="4 3" opacity={o} />;
}

/** A small value chip: a number in a rounded box, centred at x. */
function Chip({ x, y, v, o = 1, f = C.crema, stroke = C.mocha }: { x: number; y: number; v: string; o?: number; f?: string; stroke?: string }) {
  return (
    <g opacity={o}>
      <rect x={x - 22} y={y - 14} width={44} height={26} rx={4} fill={C.cocoa} stroke={stroke} strokeWidth={1.5} />
      <T x={x} y={y + 4} s={12} f={f} a="middle">
        {v}
      </T>
    </g>
  );
}

// 0 · Hook. The window sends 7, then 14, then 20, each a fresh running total. The dashboard adds every one: its total
// bar climbs past the truth line at 20 and keeps going, to 41.
export function Hook({ t }: StepCtx) {
  const sends: [string, number][] = [
    ['7', 0.3],
    ['14', 1.1],
    ['20', 1.9],
  ];
  const fill = 7 * easeOut(seg(t, 0.9, 1.1)) + 14 * easeOut(seg(t, 1.7, 1.9)) + 20 * easeOut(seg(t, 2.5, 2.7));
  const bw = (v: number) => v * 11;
  return (
    <Svg label="a dashboard assumes the wrong mode, and its total quietly runs away" h={200}>
      <T x={25} y={28} s={11} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        the window sends
      </T>
      {sends.map(([v, a]) => {
        const k = easeInOut(seg(t, a, a + 0.6));
        return k > 0 && k < 1 ? <Chip key={v} x={lerp(185, 300, k)} y={40} v={v} /> : null;
      })}
      <rect x={310} y={24} width={130} height={36} rx={6} fill="none" stroke={C.latte} strokeWidth={1.5} opacity={easeOut(seg(t, 0, 0.3))} />
      <T x={375} y={47} s={12} f={C.latte} a="middle" o={easeOut(seg(t, 0, 0.3))}>
        add them all
      </T>
      <rect x={60} y={96} width={bw(fill)} height={22} rx={3} fill={fill > 20 ? C.cherryText : C.second} opacity={0.6} />
      <line x1={60 + bw(20)} y1={86} x2={60 + bw(20)} y2={128} stroke={C.focus} strokeWidth={2} opacity={easeOut(seg(t, 0.6, 0.9))} />
      <T x={60 + bw(20)} y={146} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 0.6, 0.9))}>
        truth: 20
      </T>
      <T x={60 + bw(41)} y={146} s={11} f={C.cherryText} a="end" o={easeOut(seg(t, 2.6, 2.9))}>
        41
      </T>
      <T x={25} y={190} s={12} f={C.cherryText} o={easeOut(seg(t, 3.4, 3.8))}>
        each number replaced the last; it was added instead
      </T>
    </Svg>
  );
}

// 1 · Setup. A window with its records inside; it has a shape, but nothing goes out of it. A dashed speech slot opens
// to its right with two questions: when, and what.
export function Setup({ t }: StepCtx) {
  return (
    <Svg label="a window has a shape; now it has to say something, and say it honestly" h={200}>
      <rect x={25} y={40} width={220} height={70} rx={8} fill="none" stroke={C.latte} strokeWidth={1.6} opacity={easeOut(seg(t, 0, 0.4))} />
      {['3', '4', '5', '2'].map((v, i) => (
        <Chip key={i} x={60 + i * 50} y={75} v={v} o={easeOut(seg(t, 0.3 + i * 0.2, 0.6 + i * 0.2))} />
      ))}
      <T x={25} y={132} s={11} f={C.latte} o={easeOut(seg(t, 1.2, 1.5))}>
        a shape, a size, a boundary
      </T>
      <path d="M250 75 L300 75" stroke={C.focus} strokeWidth={1.5} strokeDasharray="4 3" opacity={easeOut(seg(t, 1.8, 2.1))} />
      <Hole x={305} y={40} w={250} h={70} stroke={C.focus} o={easeOut(seg(t, 2.0, 2.4))} />
      <T x={430} y={70} s={12} f={C.focus} a="middle" o={easeOut(seg(t, 2.6, 3.0))}>
        says it when?
      </T>
      <T x={430} y={92} s={12} f={C.focus} a="middle" o={easeOut(seg(t, 3.2, 3.6))}>
        and says what?
      </T>
    </Svg>
  );
}

/** Watermark axis for the firings demo: 0 to 20, x = 60 + w × 23. */
const wx = (w: number) => 60 + w * 23;

// 2 · Three firings. A watermark needle walks along its axis; the window ends at 10 and closes at 10 + 5. Records 3 and
// 4 arrive and the early firing says 7; 5 and 2 arrive as it reaches 10 and the on-time firing says 14; 6 arrives late,
// before the close, and the late firing says 20.
export function RevealThreeFirings({ t }: StepCtx) {
  const wm = easeInOut(seg(t, 0.3, 3.4)) * 14;
  const outs: [string, string, number][] = [
    ['early', '7', 0.9],
    ['on time', '14', 2.2],
    ['late', '20', 3.3],
  ];
  return (
    <Svg label="the same window, speaking at three different moments, each a real total" h={200}>
      <line x1={wx(0)} y1={60} x2={wx(20)} y2={60} stroke={C.mocha} strokeWidth={1.5} />
      <line x1={wx(10)} y1={44} x2={wx(10)} y2={76} stroke={C.latte} strokeWidth={1.5} />
      <T x={wx(10)} y={36} s={11} f={C.latte} a="middle">
        end: 10
      </T>
      <line x1={wx(15)} y1={44} x2={wx(15)} y2={76} stroke={C.cherryText} strokeWidth={1.5} strokeDasharray="4 3" />
      <T x={wx(15)} y={36} s={11} f={C.cherryText} a="middle">
        close: 10 + 5
      </T>
      <line x1={wx(wm)} y1={50} x2={wx(wm)} y2={70} stroke={C.focus} strokeWidth={2.6} />
      <T x={25} y={100} s={11} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        speaks
      </T>
      {outs.map(([k, v, a], i) => {
        const o = easeOut(seg(t, a, a + 0.3));
        return (
          <g key={k} opacity={o}>
            <Cell x={90 + i * 160} y={lerp(96, 88, o)} w={140} label={`${k}: ${v}`} stroke={i === 1 ? C.focus : C.second} />
          </g>
        );
      })}
      <T x={25} y={150} s={11} f={C.latte} o={easeOut(seg(t, 1.0, 1.3))}>
        rough, then sure, then corrected
      </T>
    </Svg>
  );
}

// 3 · Predict. The window closed at 10 + 5. Record 9 arrives with the watermark already at 20. On answer it is dropped:
// a cross, and it fades.
export function PredictLateness({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const come = easeInOut(seg(t, 0.6, 1.4));
  return (
    <Svg label="once the allowed window closes, what happens to a record that shows up after?" h={200}>
      <line x1={wx(0)} y1={60} x2={wx(20)} y2={60} stroke={C.mocha} strokeWidth={1.5} />
      <line x1={wx(15)} y1={44} x2={wx(15)} y2={76} stroke={C.cherryText} strokeWidth={1.5} strokeDasharray="4 3" />
      <T x={wx(15)} y={36} s={11} f={C.cherryText} a="middle">
        closed: 10 + 5
      </T>
      <line x1={wx(20)} y1={50} x2={wx(20)} y2={70} stroke={C.focus} strokeWidth={2.6} />
      <T x={wx(20)} y={92} s={11} f={C.focus} a="end">
        watermark: 20
      </T>
      <Chip x={lerp(540, 420, come)} y={124} v="9" o={come * (1 - 0.7 * v)} f={C.cherryText} stroke={C.cherryText} />
      <Cross x={460} y={124} k={v} />
      <AnswerRow y={176} label="record 9" answer={answer} value="dropped" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 4 · Dropped. The pane holds its total of 20. The watermark crosses the close line and the pane dissolves. Record 9
// arrives where the pane was and has nothing to land in: a cross. The total stays 20.
export function RevealDropped({ t }: StepCtx) {
  const gone = easeOut(seg(t, 1.0, 1.6));
  const come = easeInOut(seg(t, 1.8, 2.6));
  return (
    <Svg label="not queued, not retried — the pane's state is simply gone" h={200}>
      <rect x={25} y={30} width={200} height={60} rx={8} fill="none" stroke={C.second} strokeWidth={1.6} strokeDasharray={gone > 0 ? '4 3' : undefined} opacity={1 - 0.7 * gone} />
      <T x={125} y={66} s={12} f={C.crema} a="middle" o={1 - gone}>
        pane total: 20
      </T>
      <T x={25} y={110} s={11} f={C.cherryText} o={gone}>
        closed: state let go
      </T>
      <Chip x={lerp(520, 270, come)} y={60} v="9" o={come} f={C.cherryText} stroke={C.cherryText} />
      <Cross x={270} y={92} k={easeOut(seg(t, 2.6, 2.9))} />
      <T x={300} y={100} s={11} f={C.cherryText} o={easeOut(seg(t, 2.7, 3.0))}>
        nothing to attach to
      </T>
      <T x={25} y={150} s={12} f={C.crema} o={easeOut(seg(t, 3.2, 3.5))}>
        not queued, not retried: final total 20
      </T>
      <T x={25} y={186} s={11} f={C.latte} o={easeOut(seg(t, 3.8, 4.2))}>
        a line drawn on purpose
      </T>
    </Svg>
  );
}

// 5 · Predict. 7, 14 and 20 flow into a plus box. On answer the verdict: it depends on which kind of number arrives.
export function PredictSumOfSums({ t, answer }: StepCtx) {
  const vals = ['7', '14', '20'];
  return (
    <Svg label="sum up every value a window emits — does that always work?" h={200}>
      {vals.map((v, i) => {
        const k = easeInOut(seg(t, 0.3 + i * 0.4, 0.9 + i * 0.4));
        return k > 0 && k < 1 ? <Chip key={v} x={lerp(60, 330, k)} y={60} v={v} /> : null;
      })}
      <rect x={360} y={36} width={120} height={48} rx={6} fill="none" stroke={C.latte} strokeWidth={1.5} />
      <T x={420} y={66} s={14} f={C.latte} a="middle">
        +
      </T>
      <AnswerRow y={170} label="always right?" answer={answer} value="depends on the mode" k={easeOut(seg(t, 1.8, 2.4))} />
    </Svg>
  );
}

// 6 · Modes. Discarding sends 7, 7, 6: what's new each time; the sum lands on 20, ticked. Accumulating sends 7, 14, 20:
// the whole total each time; the same sum lands on 41, crossed.
export function RevealDiscardingVsAccumulating({ t }: StepCtx) {
  const rows: [string, string[], string, boolean, number][] = [
    ['discarding', ['7', '7', '6'], 'sum: 20', true, 0.2],
    ['accumulating', ['7', '14', '20'], 'sum: 41', false, 2.2],
  ];
  return (
    <Svg label="discarding reports a delta each time; accumulating reports the whole total again" h={200}>
      {rows.map(([n, vs, sum, ok, a], r) => {
        const y = 50 + r * 80;
        return (
          <g key={n} opacity={easeOut(seg(t, a, a + 0.3))}>
            <T x={25} y={y + 4} s={12} f={C.crema}>
              {n}
            </T>
            {vs.map((v, i) => (
              <Chip key={i} x={lerp(170 + i * 60, 190 + i * 60, easeOut(seg(t, a + 0.2 + i * 0.3, a + 0.5 + i * 0.3)))} y={y} v={v} o={easeOut(seg(t, a + 0.2 + i * 0.3, a + 0.5 + i * 0.3))} />
            ))}
            <Cell x={370} y={y - 14} w={130} label={sum} o={easeOut(seg(t, a + 1.2, a + 1.5))} stroke={ok ? C.focus : C.cherryText} f={ok ? C.focus : C.cherryText} />
            {ok ? <MiniTick x={512} y={y} k={easeOut(seg(t, a + 1.5, a + 1.8))} /> : <Cross x={522} y={y} k={easeOut(seg(t, a + 1.5, a + 1.8))} />}
          </g>
        );
      })}
      <T x={25} y={192} s={11} f={C.latte} o={easeOut(seg(t, 4.0, 4.3))}>
        the truth is 20
      </T>
    </Svg>
  );
}

// 7 · Retraction. The stream goes 7, then -7 and 14, then -14 and 20. Each negative entry pairs with the number it
// undoes and the two fade together; the blind sum lands on 20 again, ticked.
export function RevealRetraction({ t }: StepCtx) {
  const vals = ['7', '-7', '14', '-14', '20'];
  const cancel1 = easeOut(seg(t, 1.6, 2.0));
  const cancel2 = easeOut(seg(t, 2.8, 3.2));
  const fade = (i: number) => (i < 2 ? cancel1 : i < 4 ? cancel2 : 0);
  return (
    <Svg label="a retraction cancels the old value first, so the same naive sum works again" h={200}>
      <T x={25} y={34} s={11} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        accumulating, with retractions
      </T>
      {vals.map((v, i) => {
        const k = easeOut(seg(t, 0.3 + i * 0.35, 0.6 + i * 0.35));
        return <Chip key={i} x={60 + i * 70} y={70} v={v} o={k * (1 - 0.75 * fade(i))} f={v.startsWith('-') ? C.cherryText : C.crema} stroke={v.startsWith('-') ? C.cherryText : C.mocha} />;
      })}
      <path d="M60 90 v10 h70 v-10" fill="none" stroke={C.latte} strokeWidth={1.3} opacity={cancel1} />
      <path d="M200 90 v10 h70 v-10" fill="none" stroke={C.latte} strokeWidth={1.3} opacity={cancel2} />
      <T x={165} y={124} s={11} f={C.latte} a="middle" o={cancel2}>
        each pair cancels
      </T>
      <Cell x={380} y={56} w={130} label="sum: 20" o={easeOut(seg(t, 3.4, 3.7))} stroke={C.focus} f={C.focus} />
      <MiniTick x={522} y={70} k={easeOut(seg(t, 3.7, 4.0))} />
      <T x={25} y={176} s={12} f={C.crema} o={easeOut(seg(t, 4.0, 4.4))}>
        the same blind addition works again
      </T>
    </Svg>
  );
}

// 8 · Prove it. The run's results, one by one.
export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="this topic's own real run, every number read straight off it" h={260}>
      <Row y={30} label="early, on time" value="7, then 14" k={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={70} label="late" value="20" k={easeOut(seg(t, 0.7, 1.1))} />
      <Row y={110} label="record 9 at 20" value="dropped" valueColor={C.cherryText} k={easeOut(seg(t, 1.2, 1.6))} />
      <Row y={150} label="discarding sum" value="20, right" valueColor={C.focus} k={easeOut(seg(t, 1.8, 2.2))} />
      <Row y={190} label="accumulating sum" value="41, wrong" valueColor={C.cherryText} k={easeOut(seg(t, 2.4, 2.8))} />
      <Row y={230} label="retracting sum" value="20, right" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.4))} />
    </Svg>
  );
}

// 9 · Recap. Three lines, one by one; the know-your-numbers line outlined.
export function Recap({ t }: StepCtx) {
  const rows = ['three moments to speak: early, on time, late', 'a deadline on corrections, on purpose', 'always know which kind of number you got'];
  return (
    <Svg label="three moments to speak, a bounded trade-off, and a mode that must be known" h={260}>
      {rows.map((r, i) => {
        const k = easeOut(seg(t, 0.3 + i * 1.1, 0.8 + i * 1.1));
        return <Cell key={i} x={25} y={lerp(30, 40, k) + i * 60} w={530} label={r} o={k} stroke={i === 2 ? C.focus : C.mocha} />;
      })}
    </Svg>
  );
}
