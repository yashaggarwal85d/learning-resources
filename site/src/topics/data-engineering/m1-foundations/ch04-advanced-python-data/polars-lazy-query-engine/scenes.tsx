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

/** A row of plan-step cells; each one is drawn dashed until `run` lights it. */
function Steps({ x, y, w = 100, gap = 10, labels, o, run }: { x: number; y: number; w?: number; gap?: number; labels: string[]; o: number[]; run: number[] }) {
  return (
    <g>
      {labels.map((l, i) => (
        <g key={l} opacity={o[i]}>
          <rect
            x={x + i * (w + gap)}
            y={y}
            width={w}
            height={28}
            rx={4}
            fill={C.cocoa}
            stroke={run[i] > 0.5 ? C.focus : C.mocha}
            strokeWidth={1.5}
            strokeDasharray={run[i] > 0.5 ? undefined : '5 4'}
          />
          <rect x={x + i * (w + gap)} y={y + 24} width={w * run[i]} height={4} rx={2} fill={C.focus} />
          <T x={x + i * (w + gap) + w / 2} y={y + 18} s={12} f={run[i] > 0.5 ? C.crema : C.latte} a="middle">
            {l}
          </T>
        </g>
      ))}
    </g>
  );
}

/** Three dots for one run's row order of k: 0, 1 and 2 each get their own shade. */
function Order({ x, y, ks, o }: { x: number; y: number; ks: number[]; o: number }) {
  const fills = [C.crema, C.second, C.focus];
  return (
    <g opacity={o}>
      {ks.map((k, i) => (
        <circle key={i} cx={x + i * 9} cy={y} r={3.5} fill={fills[k]} />
      ))}
    </g>
  );
}

// 1 · Hook. Two lanes of the same three steps: the eager lane runs each one the moment it appears; the lazy lane only draws
// them as a plan, and nothing in it has run yet.
export function Hook({ t }: StepCtx) {
  const e = [0, 1, 2].map((i) => easeOut(seg(t, 0.8 + i * 0.5, 1.2 + i * 0.5)));
  const l = [0, 1, 2].map((i) => easeOut(seg(t, 2.2 + i * 0.3, 2.5 + i * 0.3)));
  return (
    <Svg label="pandas adopted the buffers — does polars' own lazy label actually change what runs?" h={220}>
      <Row y={40} label="lazy, from day one" value="changes what runs?" k={easeOut(seg(t, 0.3, 0.8))} />
      <T x={25} y={92} s={12} f={C.latte} o={easeOut(seg(t, 0.6, 0.9))}>
        eager
      </T>
      <Steps x={130} y={74} labels={['read', 'filter', 'select']} o={e} run={e} />
      <T x={25} y={152} s={12} f={C.latte} o={easeOut(seg(t, 2.0, 2.3))}>
        lazy
      </T>
      <Steps x={130} y={134} labels={['scan', 'filter', 'select']} o={l} run={[0, 0, 0]} />
      <T x={130} y={190} s={12} f={C.focus} o={easeOut(seg(t, 3.3, 3.7))}>
        nothing run yet
      </T>
    </Svg>
  );
}

// 2 · Eager vs lazy. The eager chain lights each step as it is written. The lazy chain stays a dashed plan until collect()
// arrives, and then every step lights at once; the rows from both match.
export function RevealEagerVsLazy({ t }: StepCtx) {
  const e = [0, 1, 2].map((i) => easeOut(seg(t, 0.5 + i * 0.4, 0.8 + i * 0.4)));
  const l = [0, 1, 2].map((i) => easeOut(seg(t, 1.0 + i * 0.3, 1.3 + i * 0.3)));
  const c = easeOut(seg(t, 2.4, 2.8));
  const r = easeOut(seg(t, 2.8, 3.2));
  return (
    <Svg label="the same filter and select, written eager and lazy — identical rows out, one of them deferred" h={240}>
      <Row y={40} label="amount > 100" value="event, amount" k={easeOut(seg(t, 0.2, 0.7))} />
      <T x={25} y={92} s={12} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        eager
      </T>
      <Steps x={110} y={74} labels={['read_csv', 'filter', 'select']} o={e} run={e} />
      <T x={25} y={152} s={12} f={C.latte} o={easeOut(seg(t, 0.9, 1.2))}>
        lazy
      </T>
      <Steps x={110} y={134} labels={['scan_csv', 'filter', 'select']} o={l} run={[r, r, r]} />
      <Cell x={440} y={134} w={135} label="collect()" stroke={C.focus} f={C.focus} o={c} />
      <Row y={215} label="rows from both" value="identical" valueColor={C.focus} k={easeOut(seg(t, 3.4, 3.9))} />
    </Svg>
  );
}

// 3 · Pushdown, from explain(). As written: SELECT over FILTER over a CSV scan of all 8 columns. As run: the filter slides down
// into the scan as its selection, and the scan narrows to the 2 columns used.
export function RevealPushdown({ t }: StepCtx) {
  const m = easeInOut(seg(t, 1.8, 2.8));
  const n = easeOut(seg(t, 2.8, 3.3));
  return (
    <Svg label="the plan as written vs. the plan polars actually runs — read directly from explain()" h={240}>
      <T x={25} y={40} s={12} f={C.latte} o={easeOut(seg(t, 0.3, 0.6))}>
        as written
      </T>
      <Cell x={25} y={52} w={250} label="SELECT event, amount" o={easeOut(seg(t, 0.4, 0.7))} />
      <Cell x={25} y={88} w={250} label="FILTER amount > 100" o={easeOut(seg(t, 0.6, 0.9))} />
      <Cell x={25} y={124} w={250} label="CSV SCAN, 8 columns" o={easeOut(seg(t, 0.8, 1.1))} />
      <T x={325} y={40} s={12} f={C.latte} o={easeOut(seg(t, 1.3, 1.6))}>
        as run
      </T>
      <Cell x={325} y={52} w={250} label="SELECT event, amount" o={easeOut(seg(t, 1.4, 1.7))} />
      <Cell x={325} y={lerp(88, 124, m)} w={250} h={lerp(28, 22, m)} label="selection: amount > 100" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 1.5, 1.8))} />
      <rect x={325} y={148} width={250} height={28} rx={4} fill={C.cocoa} stroke={C.focus} strokeWidth={1.5} opacity={m} />
      <T x={450} y={166} s={12} f={C.crema} a="middle" o={n}>
        CSV SCAN, 2 of 8 columns
      </T>
      <Row y={215} label="the scan reads" value="2 of 8 columns" valueColor={C.focus} k={easeOut(seg(t, 3.4, 3.9))} />
    </Svg>
  );
}

// 4 · Predict: is the order kept? Keys 2, 1, 0 go into a left join; the result's order is a question mark; then the question.
export function PredictRowOrder({ t, answer }: StepCtx) {
  return (
    <Svg label="no engine named, no ordering asked for — does the row order survive anyway?" h={210}>
      <Row y={40} label="k: 2, 1, 0, left join" value="order kept?" k={easeOut(seg(t, 0.1, 0.5))} />
      <Order x={40} y={78} ks={[2, 1, 0]} o={easeOut(seg(t, 0.3, 0.6))} />
      <path d={`M75 78 H${75 + 380 * easeOut(seg(t, 0.5, 1.1))}`} stroke={C.latte} strokeWidth={1.5} />
      <T x={480} y={84} s={16} f={C.focus} o={easeOut(seg(t, 1.0, 1.3))}>
        ? ? ?
      </T>
      <AnswerRow y={140} label="the order is kept" answer={answer} value="no, not promised" f={C.cherryText} k={easeOut(seg(t, 1.2, 1.7))} />
      <Verdict answer={answer} text="the default engine makes no promise" f={C.cherryText} />
    </Svg>
  );
}

// 5 · Thirty runs. Each run's row order appears as three dots: under the default engine the orders vary; under
// maintain_order="left" every one of the thirty reads 2, 1, 0.
export function RevealNoImplicitOrder({ t }: StepCtx) {
  const perms = [
    [2, 1, 0],
    [0, 1, 2],
    [1, 0, 2],
    [2, 0, 1],
  ];
  const pick = [0, 1, 0, 2, 0, 3, 1, 0, 0, 2, 1, 0, 3, 0, 1, 0, 2, 0, 0, 1, 3, 0, 2, 1, 0, 0, 1, 2, 0, 3];
  return (
    <Svg label="the exact same join, run thirty times — how many different row orders come back?" h={240}>
      <Row y={40} label="the same join" value="30 runs each" k={easeOut(seg(t, 0.2, 0.7))} />
      <T x={25} y={72} s={11} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        default
      </T>
      <T x={325} y={72} s={11} f={C.latte} o={easeOut(seg(t, 1.8, 2.1))}>
        maintain_order="left"
      </T>
      {pick.map((p, i) => (
        <Order key={i} x={30 + (i % 6) * 40} y={90 + Math.floor(i / 6) * 18} ks={perms[p]} o={easeOut(seg(t, 0.6 + i * 0.03, 0.8 + i * 0.03))} />
      ))}
      {pick.map((_, i) => (
        <Order key={i} x={330 + (i % 6) * 40} y={90 + Math.floor(i / 6) * 18} ks={[2, 1, 0]} o={easeOut(seg(t, 2.0 + i * 0.03, 2.2 + i * 0.03))} />
      ))}
      <Row y={215} label="maintain_order" value="2, 1, 0 every time" valueColor={C.focus} k={easeOut(seg(t, 3.3, 3.8))} />
    </Svg>
  );
}

// 6 · Common subexpression elimination. The expression is written twice; in the optimized plan the two copies close into one
// cached cell, which feeds both x and y, and both come out right.
export function RevealCommonSubexpression({ t }: StepCtx) {
  const m = easeInOut(seg(t, 1.0, 1.8));
  const f = easeOut(seg(t, 2.0, 2.5));
  return (
    <Svg label="the same expression, used by two output columns — computed once or twice?" h={240}>
      <Row y={40} label="written twice" value="computed once" valueColor={C.focus} k={easeOut(seg(t, 0.2, 0.7))} />
      <Cell x={25} y={lerp(66, 96, m)} w={200} label='col("a") + col("b")' stroke={m > 0.9 ? C.focus : C.mocha} o={easeOut(seg(t, 0.3, 0.6))} />
      <Cell x={25} y={lerp(126, 96, m)} w={200} label='col("a") + col("b")' o={easeOut(seg(t, 0.4, 0.7)) * (1 - clamp((m - 0.9) * 10))} />
      <T x={125} y={146} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 1.8, 2.1))}>
        cached once
      </T>
      <path d="M225 110 L330 80 M225 110 L330 140" stroke={C.focus} strokeWidth={1.5} fill="none" opacity={f} />
      <Cell x={330} y={66} w={245} label="x: 5, 7, 9" o={f} />
      <Cell x={330} y={126} w={245} label="y: 10, 14, 18" o={easeOut(seg(t, 2.3, 2.8))} />
      <Row y={215} label="both columns" value="still correct" valueColor={C.focus} k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 7 · Streaming memory. The full eager read fills its bar with all 8 columns; the streaming scan feeds batches of 2 columns
// through and peaks lower. Beneath, the unfinished part stays named.
export function RevealStreamingMemory({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.6, 1.6));
  const b = easeOut(seg(t, 1.6, 2.6));
  return (
    <Svg label="the same projection, read whole and read in batches — measured peak memory, not claimed" h={250}>
      <Row y={40} label="600,000 rows, 2 columns" value="peak memory" k={easeOut(seg(t, 0.2, 0.7))} />
      <T x={25} y={86} s={12} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        full read
      </T>
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={140 + i * 50 * a} y={74} width={Math.max(0, 48 * a)} height={16} fill={i === 2 || i === 3 ? C.crema : C.mocha} opacity={0.85} />
      ))}
      <T x={25} y={136} s={12} f={C.latte} o={easeOut(seg(t, 1.4, 1.7))}>
        streaming
      </T>
      <rect x={140} y={124} width={200 * b} height={16} fill={C.focus} opacity={0.8} />
      {Array.from({ length: 4 }, (_, i) => {
        const p = clamp((t - 1.6 - i * 0.4) / 1.2);
        return p > 0 && p < 1 ? <rect key={i} x={lerp(140, 330, p)} y={146} width={12} height={8} rx={1} fill={C.focus} /> : null;
      })}
      <T x={575} y={136} s={12} f={C.focus} a="end" o={easeOut(seg(t, 2.6, 2.9))}>
        peaks lower
      </T>
      <Row y={190} label="streaming peak" value="lower than eager" valueColor={C.focus} k={easeOut(seg(t, 2.9, 3.4))} />
      <Row y={235} label="out-of-core, every op" value="still in progress" valueColor={C.cherryText} k={easeOut(seg(t, 3.6, 4.1))} />
    </Svg>
  );
}

// 8 · The GPU engine, sourced. The plan goes to the GPU drawn dashed (not run here); an unsupported operation drops down to
// the CPU engine, and both sides meet the same Arrow format.
export function RevealGpuEngine({ t }: StepCtx) {
  const f = easeOut(seg(t, 1.8, 2.4));
  return (
    <Svg label="the same query plan, dispatched to an nvidia gpu instead — sourced, not run here" h={240}>
      <Row y={40} label='engine="gpu"' value="sourced, not run here" valueColor={C.latte} k={easeOut(seg(t, 0.2, 0.7))} />
      <Cell x={25} y={80} w={140} label="query plan" o={easeOut(seg(t, 0.5, 0.8))} />
      <path d={`M165 94 H${165 + 40 * easeOut(seg(t, 0.8, 1.1))}`} stroke={C.latte} strokeWidth={1.5} />
      <g opacity={easeOut(seg(t, 1.0, 1.4))}>
        <rect x={210} y={80} width={190} height={28} rx={4} fill={C.cocoa} stroke={C.second} strokeWidth={1.5} strokeDasharray="5 4" />
        <T x={305} y={98} s={12} f={C.second} a="middle">
          NVIDIA GPU, cuDF
        </T>
      </g>
      <path d={`M305 108 V${108 + 32 * f}`} stroke={C.focus} strokeWidth={1.5} />
      <T x={315} y={128} s={11} f={C.latte} o={f}>
        unsupported op
      </T>
      <Cell x={210} y={142} w={190} label="CPU engine" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 2.2, 2.6))} />
      <rect x={430} y={80} width={145} height={90} rx={4} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 2.8, 3.2))} />
      <T x={502} y={130} s={12} f={C.crema} a="middle" o={easeOut(seg(t, 2.8, 3.2))}>
        Arrow format
      </T>
      <Row y={215} label="unsupported op" value="falls back to CPU" valueColor={C.focus} k={easeOut(seg(t, 3.4, 3.9))} />
    </Svg>
  );
}

// 9 · Recap. Five rows land one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="deferred execution, a plan that proves its own optimizations, no promise on row order, real memory gains short of the full story" h={250}>
      <Row y={35} label="eager and lazy" value="same rows" k={easeOut(seg(t, 0.4, 0.9))} />
      <Row y={80} label="the printed plan" value="proves its optimizations" valueColor={C.focus} k={easeOut(seg(t, 1.1, 1.6))} />
      <Row y={125} label="row order" value="only if asked" valueColor={C.cherryText} k={easeOut(seg(t, 1.8, 2.3))} />
      <Row y={170} label="streaming" value="less memory today" k={easeOut(seg(t, 2.5, 3.0))} />
      <Row y={215} label="the GPU engine" value="documented, not run" valueColor={C.latte} k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 10 · Prove: a report read by position. Three report rows point at three records; after the answer the links cross over,
// and the one-keyword fix lands under them.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const d = answer !== null ? easeInOut(seg(s, 0.1, 0.7)) : 0;
  const v = answer !== null ? easeOut(seg(s, 0.8, 1.2)) : 0;
  return (
    <Svg label="a nightly job joins two lazyframes and writes a report read by row position — what breaks?" h={230}>
      <Row y={40} label="report read by position" value="what breaks?" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="nothing breaks" answer={answer} value="the order drifts" f={C.cherryText} k={easeOut(seg(t, 0.4, 0.9))} />
      {[0, 1, 2].map((i) => (
        <g key={i} opacity={easeOut(seg(t, 0.6 + i * 0.1, 0.9 + i * 0.1))}>
          <T x={25} y={124 + i * 22} s={11} f={C.latte}>
            {`row ${i + 1}`}
          </T>
          <path d={`M80 ${120 + i * 22} L230 ${lerp(120 + i * 22, 120 + ((i + 1) % 3) * 22, d)}`} stroke={d > 0 ? C.cherryText : C.mocha} strokeWidth={1.5} fill="none" />
          <circle cx={236} cy={120 + i * 22} r={4} fill={C.crema} />
        </g>
      ))}
      <T x={575} y={140} s={13} f={C.focus} a="end" o={v}>
        maintain_order="left"
      </T>
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, v)} s={15} f={C.focus} a="middle" o={v}>
            one keyword keeps the order
          </T>
          <rect x={150} y={202} width={300 * v} height={3} fill={C.focus} />
        </>
      )}
    </Svg>
  );
}
