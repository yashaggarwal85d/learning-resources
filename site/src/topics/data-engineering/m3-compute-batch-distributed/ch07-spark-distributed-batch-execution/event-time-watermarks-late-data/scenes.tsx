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

/** x of an event time, `m` minutes after 12:00, on an axis running 11:55 to 12:25. */
const X = (m: number) => 25 + (m + 5) * 18;
const AX = 120;

/** The event-time axis at y AX with 12:00, 12:10 and 12:20 marked under it. */
function Axis({ k = 1 }: { k?: number }) {
  return (
    <g opacity={k}>
      <line x1={25} y1={AX} x2={565} y2={AX} stroke={C.latte} strokeWidth={1.4} />
      {[0, 10, 20].map((m) => (
        <g key={m}>
          <line x1={X(m)} y1={AX - 4} x2={X(m)} y2={AX + 4} stroke={C.latte} strokeWidth={1.4} />
          <T x={X(m)} y={AX + 22} s={11} f={C.latte} a="middle">
            {`12:${m === 0 ? '00' : m}`}
          </T>
        </g>
      ))}
    </g>
  );
}

/** An event dot at minute m, dropping onto the axis by `k`, with its word above. */
function Ev({ m, word, k, f = C.second, ko = 1 }: { m: number; word: string; k: number; f?: string; ko?: number }) {
  if (k <= 0) return null;
  return (
    <g opacity={ko}>
      <circle cx={X(m)} cy={lerp(60, AX, k)} r={6} fill={f} />
      <T x={X(m)} y={lerp(46, 104, k)} s={11} f={f} a="middle">
        {word}
      </T>
    </g>
  );
}

/** The watermark: a white vertical line at minute m with its label in the top row. */
function Wm({ m, k = 1, label = 'watermark' }: { m: number; k?: number; label?: string }) {
  return (
    <g opacity={k}>
      <line x1={X(m)} y1={34} x2={X(m)} y2={AX + 8} stroke={C.focus} strokeWidth={2} />
      <T x={X(m)} y={26} s={11} f={C.focus} a="middle">
        {label}
      </T>
    </g>
  );
}

/** A ten-minute window [a, a + 10) as a bar under the axis in lane `l`; `gone` draws it dashed in cherry. */
function Win({ a, l, k = 1, gone = false, live = false }: { a: number; l: number; k?: number; gone?: boolean; live?: boolean }) {
  return (
    <rect
      x={X(a)}
      y={AX + 34 + l * 22}
      width={180 * k}
      height={14}
      rx={2}
      fill={gone ? 'none' : C.cocoa}
      stroke={gone ? C.cherryText : live ? C.second : C.mocha}
      strokeWidth={live ? 2 : 1.4}
      strokeDasharray={gone ? '4 3' : undefined}
    />
  );
}

// 0 · Hook. The event-time axis draws in; events drop onto it; a watermark line follows behind the newest, and the
// stretch behind it dims: what may be forgotten.
export function Hook({ t }: StepCtx) {
  const w = easeInOut(seg(t, 1.8, 3.0));
  return (
    <Svg label="a schedule says when a plan reruns. This is the bound on its state." h={220}>
      <Axis k={easeOut(seg(t, 0.1, 0.5))} />
      <rect x={25} y={36} width={Math.max(0, X(lerp(0, 10, w)) - 25)} height={AX - 36} fill={C.cocoa} opacity={0.8 * easeOut(seg(t, 1.8, 2.2))} />
      <Ev m={0} word="dog" k={easeOut(seg(t, 0.4, 0.9))} />
      <Ev m={14} word="dog" k={easeOut(seg(t, 0.9, 1.4))} />
      <Ev m={20} word="dog" k={easeOut(seg(t, 1.4, 1.9))} />
      {w > 0 && <Wm m={lerp(0, 10, w)} />}
      <T x={25} y={205} s={13} f={C.focus} o={easeOut(seg(t, 3.2, 3.6))}>
        what is it allowed to forget?
      </T>
    </Svg>
  );
}

/** A leftward back-off arrow from minute m1 to m2 at height y, drawn by `k`, labelled in the middle. */
function Back({ m1, m2, y, k, label }: { m1: number; m2: number; y: number; k: number; label: string }) {
  const x = lerp(X(m1), X(m2), k);
  return (
    <g opacity={k > 0 ? 1 : 0}>
      <line x1={X(m1)} y1={y} x2={x} y2={y} stroke={C.latte} strokeWidth={1.6} />
      <path d={`M${x} ${y} l8 -5 v10 z`} fill={C.latte} />
      <T x={(X(m1) + X(m2)) / 2} y={y - 8} s={11} f={C.latte} a="middle" o={k}>
        {label}
      </T>
    </g>
  );
}

// 1 · By hand. The newest event at 12:14; a back-off arrow of ten minutes lands the watermark at 12:04. Then 12:20
// arrives and the watermark moves to 12:10.
export function RevealWatermarkByHand({ t }: StepCtx) {
  const b1 = easeOut(seg(t, 0.6, 1.4));
  const p2 = easeOut(seg(t, 2.6, 3.0));
  const b2 = easeOut(seg(t, 3.0, 3.6));
  const wm = b2 > 0.99 ? 10 : 4;
  return (
    <Svg label="measured: max event seen, minus delay -- lagging one trigger behind." h={220}>
      <Axis />
      <Ev m={0} word="dog" k={1} />
      <Ev m={14} word="dog" k={easeOut(seg(t, 0.1, 0.5))} />
      <Ev m={20} word="dog" k={p2} />
      {b2 < 0.02 && <Back m1={14} m2={4} y={78} k={b1} label="10 min" />}
      {b2 > 0 && <Back m1={20} m2={10} y={78} k={b2} label="10 min" />}
      {(b1 > 0.99 || b2 > 0.99) && <Wm m={wm} label={wm === 4 ? '12:04' : '12:10'} />}
      <T x={25} y={205} s={12} f={C.focus} o={easeOut(seg(t, 1.6, 2.0))}>
        Spark's own number matches, one trigger behind
      </T>
    </Svg>
  );
}

// 2 · Predict. Watermark at 12:04, newest at 12:14; cat (12:09) drops in late; its two windows sit under the axis. Counted?
export function PredictLateCounted({ t, answer }: StepCtx) {
  return (
    <Svg label="an event arrives late, inside the delay window. Counted, or dropped?" h={230}>
      <Axis />
      <Ev m={14} word="dog" k={1} />
      <Wm m={4} label="12:04" />
      <Ev m={9} word="cat" k={easeOut(seg(t, 0.3, 0.9))} f={C.crema} />
      <Win a={0} l={0} k={easeOut(seg(t, 0.9, 1.3))} />
      <Win a={5} l={1} k={easeOut(seg(t, 1.0, 1.4))} />
      <Verdict answer={answer} y={218} text="counted: its window is open" />
    </Svg>
  );
}

// 3 · Counted. Cat's two windows both end past the 12:04 watermark: they light pale blue and a tick lands beside cat.
export function RevealCounted({ t }: StepCtx) {
  const l = seg(t, 0.6, 0.8);
  return (
    <Svg label="measured: counted. Late, but its window hasn't been evicted yet." h={230}>
      <Axis />
      <Ev m={14} word="dog" k={1} />
      <Wm m={4} label="12:04" />
      <Ev m={9} word="cat" k={1} f={C.crema} />
      <Win a={0} l={0} live={l > 0.5} />
      <Win a={5} l={1} live={l > 0.5} />
      <MiniTick x={X(9) + 22} y={100} k={easeOut(seg(t, 1.2, 1.6))} f={C.second} />
      <T x={410} y={176} s={11} f={C.second} o={easeOut(seg(t, 1.6, 2.0))}>
        slots still open
      </T>
      <T x={25} y={222} s={12} f={C.focus} o={easeOut(seg(t, 2.6, 3.0))}>
        late against 12:14, taken in anyway
      </T>
    </Svg>
  );
}

// 4 · Not lateness. Two brackets for cat: its lateness (from cat to the newest event) is crossed out as the test; its
// window's end against the watermark is ticked.
export function ElaborateNotLatenessAlone({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 1.0));
  const b = easeOut(seg(t, 2.0, 2.6));
  return (
    <Svg label="lateness alone isn't the test -- whether the window's state is alive is." h={230}>
      <Axis />
      <Ev m={14} word="dog" k={1} />
      <Wm m={4} label="12:04" />
      <Ev m={9} word="cat" k={1} f={C.crema} />
      <path d={`M${X(9)} 70 v-6 h${(X(14) - X(9)) * a} v6`} fill="none" stroke={C.latte} strokeWidth={1.4} opacity={a > 0 ? 1 : 0} />
      <T x={X(11.5)} y={56} s={11} f={C.latte} a="middle" o={a}>
        lateness
      </T>
      <Cross x={X(17.5)} y={60} k={easeOut(seg(t, 1.2, 1.5))} />
      <Win a={0} l={0} live />
      <line x1={X(4)} y1={AX + 41} x2={lerp(X(4), X(10), b)} y2={AX + 41} stroke={C.focus} strokeWidth={2} strokeDasharray="4 3" opacity={b > 0 ? 1 : 0} />
      <T x={X(10) + 12} y={AX + 46} s={11} f={C.second} o={easeOut(seg(t, 2.6, 3.0))}>
        ends after the watermark
      </T>
      <MiniTick x={X(10) + 12} y={AX + 70} k={easeOut(seg(t, 3.0, 3.4))} f={C.second} />
    </Svg>
  );
}

// 5 · Predict. Watermark now 12:10; zebra (12:02) drops in; both its windows end at or before the line. Counted?
export function PredictSameLatenessLater({ t, answer }: StepCtx) {
  return (
    <Svg label="same lateness, one trigger later, past that window's own end. Counted?" h={230}>
      <Axis />
      <Ev m={20} word="dog" k={1} />
      <Wm m={10} label="12:10" />
      <Ev m={2} word="zebra" k={easeOut(seg(t, 0.3, 0.9))} f={C.crema} />
      <Win a={-5} l={0} k={easeOut(seg(t, 0.9, 1.3))} />
      <Win a={0} l={1} k={easeOut(seg(t, 1.0, 1.4))} />
      <Verdict answer={answer} y={218} text="refused: the cutoff moved past" />
    </Svg>
  );
}

// 6 · Dropped. Zebra's windows turn to dashed cherry outlines: gone; zebra falls through the axis and fades.
export function RevealDropped({ t }: StepCtx) {
  const g = seg(t, 0.5, 0.7) > 0.5;
  const f = easeIn2(seg(t, 1.2, 2.0));
  return (
    <Svg label="measured: dropped. Never counted, in no window, anywhere." h={230}>
      <Axis />
      <Ev m={20} word="dog" k={1} />
      <Wm m={10} label="12:10" />
      <Win a={-5} l={0} gone={g} />
      <Win a={0} l={1} gone={g} />
      {f < 1 && <circle cx={X(2)} cy={lerp(AX, 200, f)} r={6} fill={C.cherryText} opacity={1 - f} />}
      <T x={X(2)} y={104} s={11} f={C.cherryText} a="middle">
        zebra
      </T>
      <T x={410} y={176} s={11} f={C.cherryText} o={easeOut(seg(t, 2.0, 2.4))}>
        never counted
      </T>
      <T x={25} y={222} s={12} f={C.focus} o={easeOut(seg(t, 2.8, 3.2))}>
        the event didn't change; the cutoff did
      </T>
    </Svg>
  );
}

function easeIn2(x: number) {
  return x * x;
}

// 7 · The instant. The 12:00 to 12:10 slot sits under the axis; the watermark slides right, slowing as it nears the
// slot's far edge; the moment it touches, the slot is gone, no fade.
export function ElaborateStateDies({ t }: StepCtx) {
  const w = easeOut(seg(t, 0.5, 2.6));
  const m = lerp(2, 10, w);
  const alive = m < 9.99;
  return (
    <Svg label="a window's state dies exactly when the watermark passes its own end." h={250}>
      <Axis />
      <Wm m={m} />
      {alive ? <Win a={0} l={0} live /> : <Win a={0} l={0} gone />}
      <T x={X(0)} y={AX + 80} s={11} f={alive ? C.second : C.cherryText}>
        {alive ? 'slot open' : 'slot closed, for good'}
      </T>
      <T x={25} y={238} s={12} f={C.focus} o={easeOut(seg(t, 3.2, 3.6))}>
        no partial credit for almost in time
      </T>
    </Svg>
  );
}

// 8 · Several sources. A fast and a slow source, each with its own watermark line. The default global watermark sits
// at the slower one; the other choice sits at the faster one and the slow source's events behind it turn cherry.
export function RevealGlobalWatermark({ t }: StepCtx) {
  const c = easeInOut(seg(t, 2.4, 3.2));
  const gx = lerp(250, 420, c);
  return (
    <Svg label="multiple inputs: the minimum by default; configurable to the maximum." h={250}>
      <T x={25} y={46} s={11} f={C.latte}>
        fast source
      </T>
      <line x1={130} y1={42} x2={565} y2={42} stroke={C.mocha} strokeWidth={1.2} />
      <line x1={420} y1={30} x2={420} y2={54} stroke={C.focus} strokeWidth={2} opacity={easeOut(seg(t, 0.2, 0.5))} />
      <T x={25} y={106} s={11} f={C.latte}>
        slow source
      </T>
      <line x1={130} y1={102} x2={565} y2={102} stroke={C.mocha} strokeWidth={1.2} />
      <line x1={250} y1={90} x2={250} y2={114} stroke={C.focus} strokeWidth={2} opacity={easeOut(seg(t, 0.4, 0.7))} />
      {[290, 330, 370].map((x, i) => (
        <circle key={x} cx={x} cy={102} r={5} fill={gx > x ? C.cherryText : C.second} opacity={easeOut(seg(t, 0.8 + i * 0.15, 1.1 + i * 0.15))} />
      ))}
      <line x1={gx} y1={22} x2={gx} y2={170} stroke={C.second} strokeWidth={2.4} strokeDasharray="6 4" opacity={easeOut(seg(t, 1.4, 1.8))} />
      <T x={25} y={200} s={12} f={c > 0.5 ? C.cherryText : C.second} o={easeOut(seg(t, 1.6, 2.0))}>
        {c > 0.5 ? 'fastest sets it: slow data given up' : 'default: the slowest sets the pace'}
      </T>
    </Svg>
  );
}

// 9 · Recap. The rule as a line, then the one window bar crossed by the watermark and gone.
export function Recap({ t }: StepCtx) {
  const w = easeInOut(seg(t, 2.0, 3.2));
  const m = lerp(4, 11, w);
  return (
    <Svg label="a watermark bounds state by a window's own end, not by raw lateness." h={250}>
      <T x={300} y={30} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 0.2, 0.6))}>
        watermark = newest seen − delay
      </T>
      <g opacity={easeOut(seg(t, 1.0, 1.4))}>
        <Axis />
        <line x1={X(m)} y1={50} x2={X(m)} y2={AX + 8} stroke={C.focus} strokeWidth={2} />
        {m < 10 ? <Win a={0} l={0} live /> : <Win a={0} l={0} gone />}
      </g>
      <T x={25} y={225} s={12} f={C.latte} o={easeOut(seg(t, 3.4, 3.8))}>
        crossed its edge: forgotten, however close
      </T>
    </Svg>
  );
}
