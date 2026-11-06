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

// 1 · Two costs. The slow engine's bar grows across; the fast engine's stops at a sliver.
export function TwoCosts({ t }: StepCtx) {
  const k = (i: number) => easeOut(seg(t, 0.2 + i * 1.2, 1.2 + i * 1.2));
  return (
    <Svg label="same query, same 20,000,000-row table, same answer — very different time" h={370}>
      {timeBar(30, 90, 3956.844 / 3956.844, '3956.844 ms, single-threaded', 'PostgreSQL', C.cherryText, k(0))}
      {timeBar(30, 210, 240.726 / 3956.844, '240.726 ms, single-threaded', 'DuckDB', C.focus, k(1))}
      <T x={300} y={330} s={15} f={C.latte} a="middle" o={easeOut(seg(t, 3.0, 3.6))}>
        same answer, checked — not assumed
      </T>
    </Svg>
  );
}

// 2 · Predict: why the gap. Both facts slide in; after the answer the verdict slides in.
export function PredictWhyGap({ t, answer }: StepCtx) {
  return (
    <Svg label="same table, same SQL, same answer — 16.4x apart" h={210}>
      <Row y={70} label="query, table, answer" value="identical" k={easeOut(seg(t, 0.1, 0.6))} />
      <Row y={130} label="time to get there" value="16.4× apart" valueColor={C.cherryText} k={easeOut(seg(t, 0.5, 1.0))} />
      <Verdict answer={answer} text="how many rows move through each step at once" />
    </Svg>
  );
}

const OPS = ['Aggregate', 'Filter', 'Scan'];
// 3 · The iterator. Three operators stacked; a request runs down the left, one row climbs back up the right,
// and the cycle repeats, one row per trip.
export function RevealVolcano({ t }: StepCtx) {
  const head = easeOut(seg(t, 0, 0.4));
  const one = easeOut(seg(t, 1.0, 1.5));
  const every = easeOut(seg(t, 2.8, 3.4));
  const oy = (i: number) => 50 + i * 50;
  const cyc = (t - 0.4) / 0.9;
  const c = Math.floor(cyc);
  const ph = cyc - c;
  const active = t >= 0.4 && c < 3;
  const down = active && ph < 0.4 ? ph / 0.4 : 1;
  const up = active && ph >= 0.4 ? (ph - 0.4) / 0.6 : 0;
  const delivered = Math.max(0, Math.min(3, c + (ph >= 1 ? 1 : 0)));
  return (
    <Svg label="pull one row at a time, all the way up the plan" h={290}>
      <T x={300} y={28} s={16} f={C.crema} a="middle" o={head}>
        the top operator asks the one below it —
      </T>
      {OPS.map((o, i) => (
        <g key={o} opacity={head}>
          <rect x={230} y={oy(i)} width={140} height={30} rx={4} fill={C.cocoa} stroke={C.mocha} />
          <T x={300} y={oy(i) + 20} s={13} f={C.latte} a="middle">
            {o}
          </T>
        </g>
      ))}
      <line x1={215} y1={oy(0) + 15} x2={215} y2={oy(2) + 15} stroke={C.mocha} strokeDasharray="3 4" opacity={head} />
      <line x1={385} y1={oy(0) + 15} x2={385} y2={oy(2) + 15} stroke={C.mocha} strokeDasharray="3 4" opacity={head} />
      {active && ph < 0.4 && <path d={`M209 ${lerp(oy(0) + 10, oy(2) + 10, down)} l6 10 l6 -10 z`} fill={C.latte} />}
      {active && ph >= 0.4 && <rect x={377} y={lerp(oy(2) + 8, oy(0) + 8, easeInOut(up))} width={16} height={14} rx={2} fill={C.focus} />}
      <T x={420} y={oy(0) + 20} s={13} f={C.focus} o={head}>
        rows out: {delivered}
      </T>
      <T x={300} y={215} s={15} f={C.latte} a="middle" o={one}>
        for one row, and gets exactly one row
      </T>
      <T x={300} y={250} s={15} f={C.focus} a="middle" o={every}>
        every operator, every row,
      </T>
      <T x={300} y={273} s={15} f={C.focus} a="middle" o={every}>
        one at a time, top to bottom
      </T>
    </Svg>
  );
}

// 4 · One call per row. The row count counts up; then call ticks pile up along a strip, one per row.
export function HowIteratorRuns({ t }: StepCtx) {
  const n = Math.round(80 * easeInOut(seg(t, 1.4, 2.8)));
  return (
    <Svg label="one function call per operator, per row, 19,587,629 times" h={220}>
      <Row y={50} label="rows pulled through the plan" value={num(19587629 * easeOut(seg(t, 0.3, 1.8)))} k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={105} label="function calls, per operator" value="one per row" valueColor={C.cherryText} k={easeOut(seg(t, 1.0, 1.5))} />
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={25 + i * 6.9} y={124} width={3} height={14} fill={C.cherryText} opacity={0.75} />
      ))}
      <T x={300} y={190} s={15} f={C.latte} a="middle" o={easeOut(seg(t, 3.0, 3.6))}>
        interpretation overhead, no room for the compiler
      </T>
    </Svg>
  );
}

// 5 · Vectors. Each engine's default vector fills in as a block of cells: twice as many for DuckDB's 2048.
export function RevealVectorization({ t }: StepCtx) {
  const cell = (n: number, y: number, start: number, f: string) =>
    Array.from({ length: n }, (_, i) => (
      <rect key={i} x={25 + (i % 16) * 11} y={y + Math.floor(i / 16) * 11} width={8} height={8} rx={1.5} fill={f} opacity={easeOut(seg(t, start + i * 0.012, start + 0.25 + i * 0.012))} />
    ));
  return (
    <Svg label="an array of rows per operator call, not one row" h={200}>
      <Row y={50} label="DuckDB's default vector" value="2048 rows" valueColor={C.focus} k={easeOut(seg(t, 0.2, 0.7))} />
      {cell(64, 64, 0.5, C.focus)}
      <Row y={140} label="the research engine's default" value="1024 rows" k={easeOut(seg(t, 1.8, 2.3))} />
      {cell(32, 154, 2.1, C.crema)}
    </Svg>
  );
}

// 6 · The vectorized loop. A batch slides into the cache box, a cursor sweeps it in one tight pass, the batch
// leaves, and the next comes in — three batches.
export function HowVectorizedRuns({ t }: StepCtx) {
  const head = easeOut(seg(t, 0, 0.4));
  const sub = easeOut(seg(t, 0.5, 0.9));
  const box = easeOut(seg(t, 0.6, 1.0));
  const bt = seg(t, 1.0, 3.0) * 3;
  const b = Math.min(2, Math.floor(bt));
  const ph = bt >= 3 ? 1 : bt - b;
  const slide = easeOut(seg(ph, 0, 0.25));
  const sweep = seg(ph, 0.25, 0.85);
  const cw = 23;
  const last = easeOut(seg(t, 2.9, 3.5));
  return (
    <Svg label="one loop over a cache-sized array, not a call per row" h={190}>
      <T x={300} y={28} s={16} f={C.crema} a="middle" o={head}>
        same filter, same multiply,
      </T>
      <T x={300} y={52} s={15} f={C.latte} a="middle" o={sub}>
        same 19,587,629 rows —
      </T>
      <g opacity={box}>
        <rect x={110} y={76} width={380} height={40} rx={6} fill="none" stroke={C.mocha} />
        <T x={110} y={132} s={12} f={C.taupe}>
          cache
        </T>
        {t >= 1.0 && (
          <T x={490} y={132} s={12} f={C.focus} a="end">
            batch {b + 1}
          </T>
        )}
      </g>
      {t >= 1.0 &&
        Array.from({ length: 16 }, (_, i) => {
          const done = sweep * 16 > i;
          return <rect key={i} x={118 + i * cw - (1 - slide) * 40} y={86} width={18} height={20} rx={2} fill={done ? C.focus : C.crema} opacity={slide * 0.9} />;
        })}
      {t >= 1.0 && sweep > 0 && sweep < 1 && <rect x={116 + sweep * 16 * cw} y={80} width={2} height={32} fill={C.focus} />}
      <T x={300} y={170} s={15} f={C.focus} a="middle" o={last}>
        looped over in batches, not summoned one at a time
      </T>
    </Svg>
  );
}

// 7 · Predict: bigger batches. Both facts slide in; after the answer the verdict slides in.
export function PredictBiggerBatch({ t, answer }: StepCtx) {
  return (
    <Svg label="2048 rows per call beats 1 — does bigger keep winning?" h={210}>
      <Row y={70} label="1 row per call" value="slowest" valueColor={C.cherryText} k={easeOut(seg(t, 0.1, 0.6))} />
      <Row y={130} label="2048 rows per call" value="much faster" valueColor={C.focus} k={easeOut(seg(t, 0.5, 1.0))} />
      <Verdict answer={answer} text="no — there's a sweet spot" />
    </Svg>
  );
}

// 8 · The sweet spot. A time-versus-batch-size curve draws itself, dipping and rising again; each of its three
// marked points pops in with its row below.
export function RevealSweetSpot({ t }: StepCtx) {
  const rows: Array<[string, string, string]> = [
    ['1 row per call', 'as slow as a pure interpreter', C.cherryText],
    ['~1,000 rows per call', 'the best measured', C.focus],
    ['past 8,000 rows per call', 'falls off again', C.cherryText],
  ];
  const pts: [number, number][] = [
    [60, 40],
    [300, 125],
    [540, 60],
  ];
  const curve = easeInOut(seg(t, 0.3, 2.0));
  return (
    <Svg label="vector size 1: slow. ~1000: best. past 8000: worse again." h={270}>
      <line x1={50} y1={142} x2={50 + 500 * easeOut(seg(t, 0, 0.4))} y2={142} stroke={C.mocha} />
      <path d="M60 40 Q300 210 540 60" fill="none" stroke={C.latte} strokeWidth={2} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - curve} />
      {pts.map(([x, y], i) => {
        const k = easeOutBack(seg(t, 0.6 + i * 0.7, 1.0 + i * 0.7));
        return <circle key={i} cx={x} cy={y} r={6 * Math.max(0, k)} fill={rows[i][2]} />;
      })}
      {rows.map(([label, note, color], i) => {
        const k = easeOut(seg(t, 0.7 + i * 0.7, 1.2 + i * 0.7));
        return (
          <g key={label} opacity={k}>
            <T x={25} y={180 + i * 35} s={15} f={C.latte}>
              {label}
            </T>
            <T x={575} y={180 + i * 35} s={14} f={color} a="end" w={600}>
              {note}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

// 9 · Compiling. Three operator boxes slide together and fuse into one block of machine code; a value then
// travels straight through it, pushed forward.
export function HowCompilingGoesFurther({ t }: StepCtx) {
  const head = easeOut(seg(t, 0, 0.4));
  const boxes = easeOut(seg(t, 0.3, 0.8));
  const fuse = easeInOut(seg(t, 1.0, 1.8));
  const one = easeOut(seg(t, 1.6, 2.2));
  const push = easeOut(seg(t, 2.6, 3.2));
  const ops = ['scan', 'filter', 'hash build'];
  const run = seg(t, 2.4, 3.8) * 3;
  const p = run >= 3 ? 1 : run % 1;
  const running = t >= 2.4 && t < 3.8;
  return (
    <Svg label="scan + filter + build, blurred into one code fragment" h={220}>
      <T x={300} y={28} s={16} f={C.crema} a="middle" o={head}>
        scan, filter, hash build —
      </T>
      {fuse < 1 &&
        ops.map((o, i) => {
          const x = lerp(40 + i * 180, 120 + i * 120, fuse);
          return (
            <g key={o} opacity={boxes}>
              <rect x={x} y={52} width={lerp(160, 120, fuse)} height={34} rx={4} fill={C.cocoa} stroke={C.mocha} />
              {fuse === 0 && (
                <T x={x + 80} y={74} s={13} f={C.latte} a="middle">
                  {o}
                </T>
              )}
            </g>
          );
        })}
      {fuse >= 1 && (
        <g>
          <rect x={120} y={52} width={360} height={34} rx={4} fill={C.cocoa} stroke={C.focus} strokeWidth={2} />
          {!running && (
            <T x={300} y={74} s={13} f={C.focus} a="middle">
              one machine-code loop
            </T>
          )}
          {running && <circle cx={lerp(132, 468, p)} cy={69} r={6} fill={C.focus} />}
        </g>
      )}
      <T x={300} y={128} s={15} f={C.latte} a="middle" o={one}>
        compiled into one piece of machine code
      </T>
      <T x={300} y={175} s={15} f={C.focus} a="middle" o={push}>
        values stay in CPU registers —
      </T>
      <T x={300} y={198} s={15} f={C.focus} a="middle" o={push}>
        pushed forward, never pulled
      </T>
    </Svg>
  );
}

// 10 · Predict: three models. The three rows slide in; after the answer the compiled row is underlined and the verdict lands.
export function PredictThreeModels({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const u = answer !== null ? easeOut(seg(s, 0.1, 0.5)) : 0;
  return (
    <Svg label="iterator vs vectorized vs compiled — one core, same plan" h={240}>
      <Row y={60} label="pull one row at a time" value="iterator" k={easeOut(seg(t, 0.1, 0.6))} />
      <Row y={115} label="process a cache-sized batch" value="vectorized" k={easeOut(seg(t, 0.4, 0.9))} />
      <Row y={170} label="generate machine code for the plan" value="compiled" valueColor={C.focus} k={easeOut(seg(t, 0.7, 1.2))} />
      {answer !== null && <rect x={575 - 90 * u} y={180} width={90 * u} height={3} fill={C.focus} />}
      <Verdict answer={answer} text="compiled: it removes the most overhead" y={220} />
    </Svg>
  );
}

// 11 · The trade-off. The speed claims arrive; then a timeline shows the compile step sitting in front of row one.
export function RevealTradeoff({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.7));
  const b = easeOut(seg(t, 1.0, 1.5));
  const c = easeOut(seg(t, 2.2, 2.8));
  const line = easeInOut(seg(t, 2.8, 3.4));
  const comp = easeInOut(seg(t, 3.2, 3.9));
  return (
    <Svg label="fastest to run, slowest to start — and hardest to debug" h={270}>
      <T x={300} y={40} s={16} f={C.crema} a="middle" o={a}>
        hand-written C++ ≈ compiled engine —
      </T>
      <T x={300} y={78} s={15} f={C.latte} a="middle" o={b}>
        both far ahead of a classical iterator
      </T>
      <T x={300} y={128} s={15} f={C.cherryText} a="middle" o={c}>
        but every query compiles before row one —
      </T>
      <T x={300} y={151} s={15} f={C.cherryText} a="middle" o={c}>
        and a crash in generated code is harder to read
      </T>
      <line x1={100} y1={215} x2={100 + 400 * line} y2={215} stroke={C.mocha} strokeWidth={2} />
      <rect x={100} y={207} width={130 * comp} height={16} rx={3} fill={C.cherryText} opacity={0.8} />
      <T x={165} y={198} s={12} f={C.cherryText} a="middle" o={comp >= 1 ? 1 : 0}>
        compile
      </T>
      <line x1={232} y1={203} x2={232} y2={227} stroke={C.focus} strokeWidth={2} opacity={comp >= 1 ? 1 : 0} />
      <T x={240} y={245} s={12} f={C.focus} o={comp >= 1 ? 1 : 0}>
        row 1
      </T>
    </Svg>
  );
}

// 12 · Morsels. One thread's bar grows across; then four threads' bar stops at under a third.
export function MorselDriven({ t }: StepCtx) {
  const k = (i: number) => easeOut(seg(t, 0.2 + i * 1.2, 1.2 + i * 1.2));
  return (
    <Svg label="1 thread to 4, work split into morsels at run time" h={370}>
      {timeBar(30, 90, 240.726 / 240.726, '240.726 ms', '1 thread', C.cherryText, k(0))}
      {timeBar(30, 210, 72.693 / 240.726, '72.693 ms', '4 threads, same work', C.focus, k(1))}
      {[1, 2, 3].map((i) => (
        <rect key={i} x={30 + 340 * (72.693 / 240.726) * 0.25 * i - 1} y={210} width={2} height={20} fill={C.cocoa} opacity={easeOut(seg(t, 2.4 + i * 0.12, 2.7 + i * 0.12))} />
      ))}
      <T x={300} y={330} s={15} f={C.latte} a="middle" o={easeOut(seg(t, 3.2, 3.8))}>
        about 3.3× on 4 cores, split at run time
      </T>
    </Svg>
  );
}

// 13 · Recap. Four lines rise in one per beat; the last is the one to remember.
export function Recap({ t }: StepCtx) {
  const lines = [
    'pulling one row at a time costs a function call per row',
    'a batch amortizes that call, if it fits the cache',
    'compiling removes the batch too — at a compile-time cost',
    'morsels replace a fixed thread count with a run-time one',
  ];
  return (
    <Svg label="recap: pull vs push, batch size, compiling, morsels" h={240}>
      {lines.map((l, i) => {
        const k = easeOut(seg(t, 0.2 + i * 0.7, 0.7 + i * 0.7));
        return (
          <T key={l} x={300} y={55 + i * 42 + (1 - k) * 8} s={14} f={i === lines.length - 1 ? C.focus : C.crema} a="middle" o={k}>
            {l}
          </T>
        );
      })}
    </Svg>
  );
}

// 14 · Prove: the batch signal. After the answer the question's "?" becomes "batched", underlined.
export function ProveBatchSignal({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const u = answered ? easeOut(seg(s, 0.2, 0.7)) : 0;
  return (
    <Svg label="a plan reports ~4,000,000 rows for a whole stage" h={210}>
      <Row y={70} label="rows reported per plan step" value="~4,000,000" k={easeOut(seg(t, 0.1, 0.6))} />
      <Row y={130} label="pulling tuple-at-a-time, or batched?" value={answered ? 'batched' : '?'} valueColor={answered ? C.focus : C.crema} k={easeOut(seg(t, 0.5, 1.0))} />
      {answered && <rect x={575 - 80 * u} y={142} width={80 * u} height={3} fill={C.focus} />}
    </Svg>
  );
}

// 15 · Prove: scaling. The two times slide in; after the answer the verdict slides in with rule and tick.
export function ProveScaling({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const k = answered ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const tick = answered ? easeOut(seg(s, 0.6, 1.0)) : 0;
  return (
    <Svg label="240.726 ms on 1 thread, 72.693 ms on 4 — what kind of scaling?" h={220}>
      <Row y={70} label="1 thread" value="240.726 ms" k={easeOut(seg(t, 0.1, 0.6))} />
      <Row y={130} label="4 threads, same work" value="72.693 ms" valueColor={C.focus} k={easeOut(seg(t, 0.5, 1.0))} />
      {answered && (
        <>
          <T x={300} y={lerp(192, 180, k)} s={16} f={C.focus} a="middle" o={k}>
            elastic, run-time scaling
          </T>
          <rect x={185} y={192} width={230 * tick} height={3} fill={C.focus} />
          <Tick y={165} k={tick} />
        </>
      )}
    </Svg>
  );
}
