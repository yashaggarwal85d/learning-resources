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

/** A small square record token at (x, y). */
function Pip({ x, y, o = 1, f = C.second }: { x: number; y: number; o?: number; f?: string }) {
  return <rect x={x - 6} y={y - 6} width={12} height={12} rx={2} fill={f} opacity={o} />;
}

// 0 · Hook. A day-by-day metric draws in; a stretch of it turns cherry, wrong for a while. The bug is found at the far
// end, long after; an arrow loops back to the stretch's start: run it again. Two dashed slots ask where it lands.
export function Hook({ t }: StepCtx) {
  const hs = [40, 46, 42, 50, 48, 44, 52, 30, 28, 26, 31, 27, 29, 25];
  const found = easeOut(seg(t, 1.6, 1.9));
  const loop = easeInOut(seg(t, 2.1, 3.0));
  return (
    <Svg label="a two-week-old bug, replayed to a new version to diff against the original" h={200}>
      {hs.map((h, i) => {
        const k = easeOut(seg(t, 0.1 + i * 0.06, 0.4 + i * 0.06));
        const bad = i >= 7 && t >= 0.9 + (i - 7) * 0.08;
        return <rect key={i} x={40 + i * 36} y={110 - h * k} width={24} height={h * k} rx={2} fill={bad ? C.cherryText : C.latte} opacity={0.75} />;
      })}
      <T x={540} y={130} s={11} f={C.cherryText} a="end" o={found}>
        found, long after
      </T>
      <path d={`M540 18 C 470 0, 330 0, 292 28`} fill="none" stroke={C.focus} strokeWidth={1.6} strokeDasharray="300" strokeDashoffset={300 * (1 - loop)} />
      <T x={300} y={50} s={11} f={C.focus} o={easeOut(seg(t, 2.8, 3.1))}>
        run that stretch again
      </T>
      <T x={25} y={168} s={12} f={C.crema} o={easeOut(seg(t, 3.3, 3.6))}>
        lands where?
      </T>
      <Hole x={140} y={150} w={180} o={easeOut(seg(t, 3.5, 3.8))} stroke={C.focus} />
      <Hole x={340} y={150} w={180} o={easeOut(seg(t, 3.7, 4.0))} stroke={C.focus} />
    </Svg>
  );
}

// 1 · Setup. The earlier fix: one record lifted out on its own. Now a whole slice of the log is bracketed. Its start is a
// moment on the clock: hour 10 is looked up and lands on offset 110.
export function Setup({ t }: StepCtx) {
  const lift = easeOut(seg(t, 0.2, 0.7));
  const br = easeInOut(seg(t, 1.2, 1.9));
  const seek = easeInOut(seg(t, 2.8, 3.6));
  return (
    <Svg label="jump a consumer straight to the first offset at or after a given time" h={200}>
      {Array.from({ length: 14 }, (_, i) => (
        <Pip key={i} x={46 + i * 36} y={i === 2 ? lerp(60, 30, lift) : 60} f={i === 2 ? C.cherryText : C.second} />
      ))}
      <T x={130} y={20} s={11} f={C.latte} o={lift * (1 - br)}>
        one record, before
      </T>
      <rect x={180} y={44} width={355 * br} height={32} rx={5} fill="none" stroke={C.focus} strokeWidth={1.6} opacity={br > 0 ? 1 : 0} />
      <T x={180} y={98} s={11} f={C.focus} o={easeOut(seg(t, 1.8, 2.1))}>
        a whole slice of time
      </T>
      <T x={25} y={146} s={12} f={C.crema} o={easeOut(seg(t, 2.4, 2.7))}>
        hour 10
      </T>
      <Req x1={95} x2={330} y={142} k={seek} />
      <Cell x={340} y={128} w={110} label="offset 110" o={easeOut(seg(t, 3.5, 3.8))} stroke={C.focus} />
      <T x={25} y={190} s={11} f={C.latte} o={easeOut(seg(t, 3.9, 4.3))}>
        the starting point is a moment on a clock
      </T>
    </Svg>
  );
}

const tx = (ts: number) => 90 + ts * 18;
const P0: [string, number][] = [
  ['a', 0],
  ['b', 10],
  ['c', 20],
];
const P1: [string, number][] = [
  ['d', 5],
  ['e', 15],
  ['f', 25],
];

/** Two partitions' records laid out by timestamp; `lit` picks the ones a replay touches. */
function Parts({ y, lit, o = 1 }: { y: number; lit: (key: string) => number; o?: number }) {
  return (
    <g opacity={o}>
      {[P0, P1].map((p, r) => (
        <g key={r}>
          <T x={25} y={y + r * 44 + 4} s={11} f={C.latte}>
            {`p${r}`}
          </T>
          <line x1={70} y1={y + r * 44} x2={560} y2={y + r * 44} stroke={C.mocha} strokeWidth={1.2} />
          {p.map(([k, ts]) => {
            const l = lit(k);
            return (
              <g key={k}>
                <rect x={tx(ts) - 13} y={y + r * 44 - 13} width={26} height={26} rx={4} fill={C.cocoa} stroke={l > 0 ? C.focus : C.mocha} strokeWidth={l > 0 ? 2 : 1.2} />
                <T x={tx(ts)} y={y + r * 44 + 4} s={12} f={l > 0 ? C.focus : C.latte} a="middle">
                  {k}
                </T>
              </g>
            );
          })}
        </g>
      ))}
    </g>
  );
}

// 2 · Predict. Two partitions; a bracket stretches over all of it, back to the very first record. On answer it
// shrinks to only the part that was wrong.
export function PredictScope({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeInOut(seg(s, 0.1, 0.7)) : 0;
  const br = easeInOut(seg(t, 0.6, 1.4));
  return (
    <Svg label="replay the whole topic, or just the part that was actually wrong?" h={200}>
      <Parts y={50} lit={() => 0} o={easeOut(seg(t, 0, 0.4))} />
      <rect
        x={lerp(70, tx(8), v)}
        y={26}
        width={lerp(490, tx(20) + 14 - tx(8), v) * br}
        height={92}
        rx={6}
        fill="none"
        stroke={v > 0 ? C.focus : C.second}
        strokeWidth={1.6}
        opacity={br > 0 ? 1 : 0}
      />
      <AnswerRow y={170} label="replay" answer={answer} value="just the wrong slice" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 3 · Scope. First one partition: p0's a, b and c light, three records. Then a time window from 8 to 20 across both:
// b, c and e light. Nothing outside the boundary moves.
export function RevealScope({ t }: StepCtx) {
  const one = easeOut(seg(t, 0.4, 0.8)) * (1 - easeOut(seg(t, 2.0, 2.3)));
  const win = easeOut(seg(t, 2.3, 2.9));
  const lit = (k: string) => (['a', 'b', 'c'].includes(k) ? one : 0) + (['b', 'c', 'e'].includes(k) ? win : 0);
  return (
    <Svg label="scoped to one partition, or a bounded time range, not the whole topic" h={200}>
      <Parts y={50} lit={lit} />
      <rect x={70} y={34} width={490} height={32} rx={6} fill="none" stroke={C.focus} strokeWidth={1.6} opacity={one} />
      <rect x={tx(8)} y={26} width={(tx(20) + 14 - tx(8)) * win} height={92} rx={6} fill="none" stroke={C.focus} strokeWidth={1.6} opacity={win > 0 ? 1 : 0} />
      <T x={tx(8)} y={136} s={11} f={C.focus} a="middle" o={win}>
        8
      </T>
      <T x={tx(20) + 14} y={136} s={11} f={C.focus} a="middle" o={win}>
        20
      </T>
      {one > 0 && (
        <T x={25} y={170} s={12} f={C.crema} o={one}>
          one partition: 3 records
        </T>
      )}
      {t >= 2.8 && (
        <T x={25} y={170} s={12} f={C.crema} o={easeOut(seg(t, 2.8, 3.1))}>
          a time window: b, c and e
        </T>
      )}
      <T x={25} y={194} s={11} f={C.latte} o={easeOut(seg(t, 3.6, 4.0))}>
        everything outside the boundary: untouched
      </T>
    </Svg>
  );
}

// 4 · Source. An age line split into three stretches: the hot log (to 3 days), tiered storage (to 30), and beyond it
// the lakehouse. Records aged 1, 14 and 90 days drop in, each onto the source it's pulled from.
export function RevealSource({ t }: StepCtx) {
  const zones: [number, number, string, string][] = [
    [25, 150, 'hot log', C.latte],
    [155, 380, 'tiered storage', C.second],
    [385, 555, 'lakehouse', C.focus],
  ];
  const ages: [number, string, number][] = [
    [88, '1 day', 0.6],
    [268, '14 days', 1.6],
    [470, '90 days: rebuilt', 2.7],
  ];
  return (
    <Svg label="still in Kafka within tiered storage's retention, otherwise rebuilt from the lakehouse" h={200}>
      {zones.map(([x1, x2, n, f], i) => {
        const k = easeOut(seg(t, i * 0.2, 0.3 + i * 0.2));
        return (
          <g key={n} opacity={k}>
            <rect x={x1} y={110} width={x2 - x1} height={30} rx={4} fill="none" stroke={f} strokeWidth={1.6} />
            <T x={(x1 + x2) / 2} y={129} s={12} f={f} a="middle">
              {n}
            </T>
          </g>
        );
      })}
      <T x={150} y={160} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 0.4, 0.7))}>
        3 days
      </T>
      <T x={380} y={160} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 0.4, 0.7))}>
        30 days
      </T>
      {ages.map(([x, n, a]) => {
        const k = easeOut(seg(t, a, a + 0.5));
        return (
          <g key={n} opacity={k}>
            <T x={x} y={28} s={11} f={C.crema} a="middle">
              {n}
            </T>
            <Pip x={x} y={lerp(40, 96, k)} f={C.crema} />
          </g>
        );
      })}
      <T x={25} y={192} s={11} f={C.latte} o={easeOut(seg(t, 3.6, 4.0))}>
        aged out of Kafka: rebuilt from downstream
      </T>
    </Svg>
  );
}

const MET = 'metric_2026_10_17';

// 5 · Predict. The table holds the original 42; a replay's -1 slides in on top of it. On answer the 42 is shown as
// what's gone.
export function PredictVersion({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const slide = easeInOut(seg(t, 0.8, 1.6));
  return (
    <Svg label="a buggy replay overwrites the original metric in place — what's lost?" h={200}>
      <T x={25} y={40} s={12} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        {MET}
      </T>
      {t < 1.1 && <Cell x={250} y={lerp(22, 40, easeInOut(seg(t, 0.7, 1.05)))} w={110} label="42" o={easeOut(seg(t, 0.2, 0.5)) * (1 - easeInOut(seg(t, 0.7, 1.05)))} />}
      {slide > 0 && <Cell x={lerp(470, 250, slide)} y={22} w={110} label="-1" stroke={C.cherryText} f={C.cherryText} />}
      <T x={470} y={84} s={11} f={C.cherryText} o={easeOut(seg(t, 0.6, 0.9))}>
        the replay
      </T>
      {v > 0 && (
        <T x={305} y={lerp(96, 86, v)} s={12} f={C.cherryText} a="middle" o={v}>
          42: gone
        </T>
      )}
      <AnswerRow y={160} label="what's lost" answer={answer} value="the original 42" k={easeOut(seg(t, 1.8, 2.4))} />
    </Svg>
  );
}

// 6 · Overwrite. 42 is overwritten by -1 in place. The "before" slot stays empty; the comparison arrow between before
// and after can't be drawn, and is crossed out.
export function RevealOverwrite({ t }: StepCtx) {
  const over = easeInOut(seg(t, 0.6, 1.2));
  const drop = easeInOut(seg(t, 0.3, 0.7));
  return (
    <Svg label="the original value is simply gone, with nothing left to diff the replay against" h={200}>
      <T x={25} y={40} s={12} f={C.latte}>
        {MET}
      </T>
      {drop < 1 && <Cell x={250} y={lerp(22, 40, drop)} w={110} label="42" o={1 - drop} />}
      {over > 0 && <Cell x={lerp(420, 250, over)} y={22} w={110} label="-1" stroke={C.cherryText} f={C.cherryText} o={over} />}
      <T x={25} y={110} s={11} f={C.latte} o={easeOut(seg(t, 1.6, 1.9))}>
        before
      </T>
      <Hole x={90} y={92} w={140} o={easeOut(seg(t, 1.6, 1.9))} />
      <T x={340} y={110} s={11} f={C.latte} o={easeOut(seg(t, 1.8, 2.1))}>
        after
      </T>
      <Cell x={390} y={92} w={140} label="-1" o={easeOut(seg(t, 1.8, 2.1))} stroke={C.cherryText} f={C.cherryText} />
      <line x1={240} y1={106} x2={240 + 90 * easeInOut(seg(t, 2.4, 3.0))} y2={106} stroke={C.latte} strokeWidth={1.5} strokeDasharray="4 3" />
      <Cross x={285} y={106} k={easeOut(seg(t, 3.0, 3.3))} />
      <T x={25} y={176} s={12} f={C.cherryText} o={easeOut(seg(t, 3.5, 3.9))}>
        did the fix help? nobody can say
      </T>
    </Svg>
  );
}

// 7 · Versioned. v1 keeps 42; the replay writes -1 into a new, labelled v2-replay beside it. A compare line joins them
// and a rollback arrow runs back. Then order-1: the first run sends its email; the replay is flagged, the gate locks,
// and nothing fires a second time.
export function RevealVersioned({ t }: StepCtx) {
  const v2 = easeOut(seg(t, 0.4, 0.9));
  const cmp = easeInOut(seg(t, 1.0, 1.5));
  const rb = easeInOut(seg(t, 1.6, 2.1));
  const fire = easeInOut(seg(t, 2.6, 3.1));
  const gate = easeOut(seg(t, 3.3, 3.7));
  return (
    <Svg label="a new, separately labeled version, plus a flag that suppresses the side effect" h={200}>
      <Cell x={25} y={20} w={200} label="v1: 42" stroke={C.focus} />
      <Cell x={lerp(310, 350, v2)} y={20} w={200} label="v2-replay: -1" o={v2} stroke={C.second} />
      <line x1={230} y1={30} x2={230 + 115 * cmp} y2={30} stroke={C.latte} strokeWidth={1.5} />
      <T x={287} y={62} s={11} f={C.latte} a="middle" o={cmp}>
        side by side
      </T>
      {rb > 0 && (
        <g>
          <line x1={345} y1={44} x2={lerp(345, 232, rb)} y2={44} stroke={C.focus} strokeWidth={1.8} />
          <path d={`M${lerp(345, 232, rb)} 44 l8 -5 v10 z`} fill={C.focus} />
        </g>
      )}
      <T x={25} y={70} s={11} f={C.focus} o={easeOut(seg(t, 2.0, 2.3))}>
        roll back if wrong
      </T>
      <T x={25} y={118} s={12} f={C.crema} o={easeOut(seg(t, 2.4, 2.6))}>
        order-1
      </T>
      <Req x1={90} x2={330} y={114} k={fire} label="first run: email sent" />
      <Cell x={340} y={100} w={110} label="email" o={easeOut(seg(t, 2.4, 2.7))} />
      <T x={25} y={164} s={12} f={C.second} o={easeOut(seg(t, 3.1, 3.3))}>
        order-1, replayed
      </T>
      <Req x1={160} x2={260} y={160} k={easeInOut(seg(t, 3.2, 3.6))} f={C.second} />
      <Lock x={272} y={154} k={gate} f={C.focus} />
      <T x={300} y={164} s={11} f={C.focus} o={easeOut(seg(t, 3.6, 3.9))}>
        flagged: no email
      </T>
    </Svg>
  );
}

// 8 · Prove it. The run's results, one by one.
export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="this topic's own real run, every number read straight off it" h={260}>
      <Row y={30} label="seek to hour 10" value="offset 110" valueColor={C.focus} k={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={70} label="one second later" value="offset 111" k={easeOut(seg(t, 0.7, 1.1))} />
      <Row y={110} label="window 8 to 20" value="b, c, e" k={easeOut(seg(t, 1.2, 1.6))} />
      <Row y={150} label="overwrite sink" value="-1, 42 lost" valueColor={C.cherryText} k={easeOut(seg(t, 1.8, 2.2))} />
      <Row y={190} label="versioned sink" value="42 and -1, both kept" valueColor={C.focus} k={easeOut(seg(t, 2.4, 2.8))} />
      <Row y={230} label="emails sent" value="order-1, once" k={easeOut(seg(t, 3.0, 3.4))} />
    </Svg>
  );
}

// 9 · Recap. Three lines, one by one; the land-it-somewhere-new line outlined.
export function Recap({ t }: StepCtx) {
  const rows = ['start from a time, not a raw position', 'touch only the slice that was wrong', 'land it somewhere new, side effects off'];
  return (
    <Svg label="reset by time, scope the replay, pick the source, keep it safe to repeat" h={260}>
      {rows.map((r, i) => {
        const k = easeOut(seg(t, 0.3 + i * 1.1, 0.8 + i * 1.1));
        return <Cell key={i} x={25} y={lerp(30, 40, k) + i * 60} w={530} label={r} o={k} stroke={i === 2 ? C.focus : C.mocha} />;
      })}
    </Svg>
  );
}
