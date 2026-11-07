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

function Pip({ x, y, o = 1, f = C.second, s = 10 }: { x: number; y: number; o?: number; f?: string; s?: number }) {
  return <rect x={x - s / 2} y={y - s / 2} width={s} height={s} rx={2} fill={f} opacity={o} />;
}

// Every figure here traces to Databricks' own current documentation (SOURCES.md) or to examples.py's lifecycle-billing
// simulation. No real Databricks workspace runs in this sandbox.

// 0 · Two equal clusters, four nodes each, run the same query on the same data. Cluster A's bar finishes and ticks while
// cluster B's is still crawling; it gets there much later.
export function SameQueryFasterRun({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const a = easeInOut(seg(t, 0.4, 1.8));
  const b = easeInOut(seg(t, 0.4, 3.6));
  const rows: [string, number][] = [
    ['cluster A', a],
    ['cluster B', b],
  ];
  return (
    <Svg label="Two equally-sized clusters running the same query, one finishing noticeably faster" h={230}>
      <T x={300} y={26} s={12} f={C.latte} a="middle" o={k(0)}>
        same size · same data · same query
      </T>
      {rows.map(([name, p], i) => {
        const y = 60 + i * 64;
        return (
          <g key={name}>
            <T x={25} y={y + 14} s={12} f={C.crema} o={k(0.1)}>
              {name}
            </T>
            {[0, 1, 2, 3].map((j) => (
              <rect key={j} x={110 + j * 16} y={y + 2} width={12} height={12} rx={2} fill={C.second} opacity={k(0.2)} />
            ))}
            <rect x={200} y={y} width={340} height={16} rx={3} fill="none" stroke={C.mocha} strokeWidth={1.2} opacity={k(0.2)} />
            <rect x={200} y={y} width={340 * p} height={16} rx={3} fill={i === 0 ? C.focus : C.latte} opacity={0.85} />
            {p >= 1 && <MiniTick x={548} y={y + 4} k={1} f={i === 0 ? C.focus : C.latte} />}
            {p >= 1 && i === 0 && t < 3.6 && (
              <T x={200} y={y + 34} s={11} f={C.focus}>
                finished
              </T>
            )}
          </g>
        );
      })}
      {t > 3.6 && (
        <T x={300} y={212} s={12} f={C.latte} a="middle" o={k(3.6)}>
          the difference is how the work runs
        </T>
      )}
    </Svg>
  );
}

// 1 · Predict. Two lanes feed rows to a processor: one lane in whole batches, the other one row at a time. Once answered,
// the lanes are named, the batched one is cluster A.
export function WhatsDifferent({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const tt = answer !== null ? 1.2 + s : t;
  const batch = (tt * 0.9) % 1;
  return (
    <Svg label="Row-at-a-time execution against vectorized batch execution" h={240}>
      <T x={25} y={54} s={12} f={v > 0.5 ? C.focus : C.crema} o={k(0)}>
        {v > 0.5 ? 'A: vectorized batches' : 'cluster A'}
      </T>
      <T x={25} y={134} s={12} f={C.crema} o={k(0)}>
        {v > 0.5 ? 'B: one row at a time' : 'cluster B'}
      </T>
      <rect x={400} y={30} width={80} height={40} rx={6} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={k(0)} />
      <rect x={400} y={110} width={80} height={40} rx={6} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={k(0)} />
      {Array.from({ length: 8 }, (_, j) => (
        <Pip key={j} x={lerp(230, 410, batch) + j * 8} y={50} s={6} f={C.focus} o={k(0.2)} />
      ))}
      {[0, 1, 2].map((j) => (
        <Pip key={j} x={lerp(230, 440, (tt * 0.9 + j / 3) % 1)} y={130} s={6} f={C.latte} o={k(0.2)} />
      ))}
      <Verdict answer={answer} text="batches: what modern processors reward" y={210} />
    </Svg>
  );
}

// 2 · Four compute types, four lifecycles. A cursor runs along each row's timeline: all-purpose stays up through the gaps,
// job compute exists only while its job runs, serverless runs in the vendor's plane, the warehouse serves short queries.
export function FourComputeTypes({ t }: StepCtx) {
  const rows: [string, string][] = [
    ['All-purpose', 'autostarts after terminating; built to sit idle'],
    ['Job compute', 'terminates at job end, cannot be restarted'],
    ['Serverless', "runs in Databricks' own managed plane"],
    ['SQL warehouse', 'its own compute type, built for querying'],
  ];
  const jobs: [number, number][] = [
    [0.05, 0.25],
    [0.6, 0.8],
  ];
  const X = (f: number) => 330 + f * 245;
  return (
    <Svg label="One compute type's own start-and-billing shape at a time" h={240}>
      {rows.map(([name, trait], i) => {
        const d = 0.2 + i * 1.2;
        const y = 22 + i * 54;
        const k = easeOut(seg(t, d, d + 0.35));
        const cur = clamp(seg(t, d + 0.2, d + 1.1));
        return (
          <g key={name} opacity={k}>
            <T x={25} y={y + 14} s={12} f={C.crema}>
              {name}
            </T>
            <T x={25} y={y + 32} s={11} f={C.latte}>
              {trait}
            </T>
            <line x1={X(0)} y1={y + 10} x2={X(1)} y2={y + 10} stroke={C.mocha} strokeWidth={1} strokeDasharray="2 3" />
            {i === 0 && <rect x={X(0.05)} y={y + 4} width={Math.max(0, X(Math.min(cur, 0.95)) - X(0.05))} height={12} rx={2} fill={C.cherryText} opacity={0.35} />}
            {i === 2 && <rect x={X(0) - 4} y={y - 2} width={253} height={24} rx={4} fill="none" stroke={C.second} strokeDasharray="3 3" />}
            {i < 3 &&
              jobs.map(([a, b]) => <rect key={a} x={X(a)} y={y + 4} width={Math.max(0, X(Math.min(cur, b)) - X(a)) * (cur > a ? 1 : 0)} height={12} rx={2} fill={i === 2 ? C.second : C.focus} />)}
            {i === 3 && [0.1, 0.3, 0.45, 0.7, 0.85].map((a) => <rect key={a} x={X(a)} y={y + 4} width={cur > a ? 6 : 0} height={12} rx={1} fill={C.caramel} />)}
          </g>
        );
      })}
    </Svg>
  );
}

// 3 · The real schedule: four ten-minute jobs starting at 0, 25, 50 and 75. A cursor runs the minutes; job compute fills
// only the four blocks, all-purpose fills the whole span, and the gaps it paid for collect in red.
export function IdleMinutesBilled({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const mx = (m: number) => 140 + m * 5;
  const cur = clamp(seg(t, 0.3, 3.0)) * 85;
  const starts = [0, 25, 50, 75];
  const seen = (a: number, b: number) => Math.max(0, Math.min(cur, b) - a) * 5;
  return (
    <Svg label="Four ten-minute jobs: job compute's exact billed minutes against all-purpose's idle-inclusive total" h={250}>
      <T x={25} y={44} s={12} f={C.crema} o={k(0)}>
        job compute
      </T>
      <T x={25} y={98} s={12} f={C.crema} o={k(0)}>
        all-purpose
      </T>
      {starts.map((st) => (
        <g key={st}>
          <rect x={mx(st)} y={32} width={seen(st, st + 10)} height={16} rx={2} fill={C.focus} />
          <rect x={mx(st)} y={86} width={seen(st, st + 10)} height={16} rx={2} fill={C.focus} />
          {st > 0 && <rect x={mx(st - 15)} y={86} width={seen(st - 15, st)} height={16} fill={C.cherryText} opacity={0.6} />}
          <T x={mx(st)} y={124} s={11} f={C.latte} o={k(0.2)}>
            {String(st)}
          </T>
        </g>
      ))}
      <line x1={mx(cur)} y1={24} x2={mx(cur)} y2={108} stroke={C.latte} strokeWidth={1.2} opacity={cur < 85 ? 1 : 0} />
      {t > 3.0 && (
        <T x={25} y={164} s={12} f={C.focus} o={k(3.0)}>
          job compute: 40 minutes billed
        </T>
      )}
      {t > 3.4 && (
        <T x={25} y={190} s={12} f={C.cherryText} o={k(3.4)}>
          all-purpose: 85 minutes billed
        </T>
      )}
      {t > 3.9 && (
        <T x={25} y={226} s={12} f={C.cherryText} w={600} o={k(3.9)}>
          45 idle minutes, paid for
        </T>
      )}
    </Svg>
  );
}

// 4 · The vendor's own numbers as runtimes. The prior runtime's bar runs full; Photon's TPC-DS run stops at half of it;
// then the customer-reported range shades a band shorter still.
export function PhotonBenchmark({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const g1 = easeInOut(seg(t, 0.3, 1.3));
  const g2 = easeInOut(seg(t, 1.4, 2.2));
  const band = easeOut(seg(t, 2.8, 3.4));
  return (
    <Svg label="Photon's documented TPC-DS benchmark speedup against customer-observed speedups" h={240}>
      <T x={25} y={28} s={12} f={C.latte} o={k(0)}>
        runtime, TPC-DS 1TB
      </T>
      <T x={25} y={64} s={12} f={C.crema} o={k(0.1)}>
        prior runtime
      </T>
      <rect x={160} y={52} width={400 * g1} height={16} rx={3} fill={C.latte} opacity={0.7} />
      <T x={25} y={110} s={12} f={C.crema} o={k(1.3)}>
        Photon
      </T>
      <rect x={160} y={98} width={200 * g2} height={16} rx={3} fill={C.focus} />
      {g2 >= 1 && (
        <T x={370} y={110} s={11} f={C.focus}>
          2x faster
        </T>
      )}
      <T x={25} y={156} s={12} f={C.crema} o={k(2.6)}>
        customers
      </T>
      <rect x={160 + 50} y={144} width={83 * band} height={16} rx={3} fill={C.caramel} opacity={0.4} />
      <rect x={160} y={144} width={50 * band} height={16} rx={3} fill={C.caramel} />
      {band >= 1 && (
        <T x={305} y={156} s={11} f={C.caramel}>
          3x to 8x
        </T>
      )}
      {t > 3.6 && (
        <T x={300} y={214} s={11} f={C.latte} a="middle" o={k(3.6)}>
          the vendor's published benchmark, against its own prior runtime
        </T>
      )}
    </Svg>
  );
}

// 5 · The pool. Warm idle instances wait in the pool; a new cluster grabs three of them and starts at once. Underneath,
// the DBU meter stays flat while they idle, but the cloud provider's own meter keeps climbing.
export function PoolIdleInstances({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const grab = easeInOut(seg(t, 0.9, 1.6));
  const vm = clamp(seg(t, 0.4, 4.2));
  return (
    <Svg label="A pool's idle instances speeding up cluster start without being DBU-billed" h={250}>
      <T x={25} y={26} s={12} f={C.crema} o={k(0)}>
        pool
      </T>
      <T x={325} y={26} s={12} f={C.crema} o={k(0.6)}>
        new cluster
      </T>
      <rect x={25} y={36} width={250} height={80} rx={6} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={k(0)} />
      <rect x={325} y={36} width={250} height={80} rx={6} fill="none" stroke={grab >= 1 ? C.focus : C.mocha} strokeWidth={1.5} opacity={k(0.6)} />
      {Array.from({ length: 6 }, (_, j) => {
        const moving = j < 3;
        const x0 = 55 + j * 38;
        const x = moving ? lerp(x0, 365 + j * 40, grab) : x0;
        return <Pip key={j} x={x} y={76} s={18} f={moving && grab >= 1 ? C.focus : C.second} o={k(0.2)} />;
      })}
      {grab >= 1 && (
        <T x={325} y={136} s={11} f={C.focus}>
          started at once
        </T>
      )}
      <T x={25} y={174} s={11} f={C.latte} o={k(1.8)}>
        DBU meter, while idle in the pool
      </T>
      <rect x={300} y={164} width={4} height={12} rx={1} fill={C.second} opacity={k(1.8)} />
      <T x={25} y={212} s={11} f={C.cherryText} o={k(2.4)}>
        the cloud machine's own meter
      </T>
      <rect x={300} y={202} width={270 * vm * k(2.4)} height={12} rx={2} fill={C.cherryText} opacity={0.8} />
    </Svg>
  );
}

// 6 · An admin's policy caps what a user can ask for: the request bar grows past the cap and snaps back. Then a spot
// cluster: a worker is lost and returns, while the driver stays on-demand under its lock.
export function PolicyAndSpot({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const ask = easeInOut(seg(t, 0.3, 1.0));
  const snap = easeInOut(seg(t, 1.1, 1.5));
  const req = 80 + 200 * ask - 90 * snap;
  const lost = t > 2.8 && t < 3.5;
  return (
    <Svg label="A compute policy's limits, and the driver node staying on-demand even on a spot cluster" h={250}>
      <T x={25} y={28} s={12} f={C.crema} o={k(0)}>
        policy: caps type, count, cost
      </T>
      <rect x={25} y={40} width={req} height={16} rx={3} fill={snap > 0 ? C.focus : C.latte} opacity={0.8} />
      <line x1={215} y1={34} x2={215} y2={62} stroke={C.cherryText} strokeWidth={2} opacity={k(0)} />
      <T x={209} y={76} s={11} f={C.cherryText} o={k(0.2)}>
        cap
      </T>
      {t > 1.6 && (
        <T x={25} y={98} s={11} f={C.latte} o={k(1.6)}>
          every user inherits the limit
        </T>
      )}
      <T x={25} y={124} s={12} f={C.crema} o={k(1.8)}>
        a spot cluster
      </T>
      <Cell x={25} y={136} w={110} label="driver" o={k(1.9)} />
      <Lock x={145} y={146} k={k(2.2)} f={C.focus} />
      <T x={25} y={184} s={11} f={C.focus} o={k(2.2)}>
        on-demand, always
      </T>
      {[0, 1, 2, 3].map((j) => (
        <g key={j}>
          <Pip x={260 + j * 40} y={150} s={18} f={C.second} o={k(2.0) * (j === 2 && lost ? 0.15 : 1)} />
          {j === 2 && lost && <Cross x={340} y={128} k={1} />}
        </g>
      ))}
      <T x={240} y={184} s={11} f={C.latte} o={k(2.0)}>
        spot workers
      </T>
      {t > 3.6 && (
        <T x={300} y={230} s={12} f={C.cherryText} a="middle" o={k(3.6)}>
          lose a worker: less capacity; lose the driver: no cluster
        </T>
      )}
    </Svg>
  );
}

// 7 · One unit definition, then the price list: every SKU on every cloud lights with its own rate, one cell at a time.
export function DbuBySku({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const skus = ['Jobs compute', 'All-purpose', 'SQL warehouse', 'Serverless'];
  const clouds = ['AWS', 'Azure', 'GCP'];
  return (
    <Svg label="A single DBU definition against a published price list that varies by SKU and cloud" h={250}>
      <Cell x={150} y={20} w={300} label="DBU: a normalized unit" o={k(0)} />
      {clouds.map((c, j) => (
        <T key={c} x={300 + j * 95} y={76} s={11} f={C.latte} a="middle" o={k(0.6)}>
          {c}
        </T>
      ))}
      {skus.map((sk, i) => (
        <g key={sk}>
          <T x={25} y={102 + i * 34} s={12} f={C.crema} o={k(0.7 + i * 0.1)}>
            {sk}
          </T>
          {clouds.map((c, j) => {
            const kk = easeOutBack(seg(t, 1.0 + (i * 3 + j) * 0.2, 1.3 + (i * 3 + j) * 0.2));
            return <Cell key={c} x={262 + j * 95} y={86 + i * 34} w={76} h={24} label="own rate" o={clamp(kk)} stroke={C.caramel} f={C.caramel} />;
          })}
        </g>
      ))}
    </Svg>
  );
}

// 8 · Recap: three lines, each beside a small moving picture of its idea.
export function Recap({ t }: StepCtx) {
  const k = (i: number) => easeOut(seg(t, 0.1 + i * 0.8, 0.5 + i * 0.8));
  const items = ['four compute types, four billing shapes', 'Photon: vectorization, written in C++', 'the DBU is a price list, not one number'];
  return (
    <Svg label="The three-part recap of this topic's point" h={230}>
      {items.map((l, i) => (
        <T key={l} x={110} y={48 + i * 60} s={13} f={C.crema} o={k(i)}>
          {l}
        </T>
      ))}
      <g opacity={k(0)}>
        {[0, 1, 2, 3].map((j) => (
          <rect key={j} x={25} y={30 + j * 6} width={20 + j * 14} height={4} rx={1} fill={C.second} />
        ))}
      </g>
      <g opacity={k(1)}>
        {Array.from({ length: 6 }, (_, j) => (
          <Pip key={j} x={lerp(25, 60, (t * 0.7) % 1) + j * 6} y={104} s={5} f={C.focus} />
        ))}
      </g>
      <g opacity={k(2)}>
        {[0, 1, 2].map((j) => (
          <rect key={j} x={25 + j * 22} y={158} width={18} height={12} rx={2} fill="none" stroke={C.caramel} />
        ))}
      </g>
    </Svg>
  );
}

// 9 · Prove it. A week's timeline with one ten-minute run at an unpredictable moment. Once answered, all-purpose's bar
// fills the whole week in red; job compute is only the blip; that row is ticked.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeInOut(seg(s, 0.1, 0.9)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const dx = (d: number) => 150 + d * 60;
  const blip = dx(4.3);
  return (
    <Svg label="A ten-minute weekly job at an unpredictable time, choosing among three compute types" h={250}>
      <line x1={dx(0)} y1={40} x2={dx(7)} y2={40} stroke={C.mocha} strokeWidth={1.5} />
      {Array.from({ length: 8 }, (_, d) => (
        <line key={d} x1={dx(d)} y1={34} x2={dx(d)} y2={46} stroke={C.mocha} strokeWidth={1} />
      ))}
      <T x={25} y={44} s={11} f={C.latte}>
        one week
      </T>
      <Pip x={blip} y={40} s={10} f={C.focus} o={k(0.6)} />
      <T x={blip} y={28} s={11} f={C.focus} a="middle" o={k(0.8)}>
        ten minutes, any time
      </T>
      <T x={25} y={86} s={12} f={C.crema} o={k(0.2)}>
        all-purpose
      </T>
      <rect x={dx(0)} y={74} width={(dx(7) - dx(0)) * v} height={14} rx={2} fill={C.cherryText} opacity={0.6} />
      <T x={25} y={126} s={12} f={v > 0.5 ? C.focus : C.crema} o={k(0.3)}>
        job compute
      </T>
      <rect x={blip - 2} y={114} width={4} height={14} rx={1} fill={C.focus} opacity={k(0.9)} />
      {v > 0.5 && <MiniTick x={dx(7) - 12} y={116} k={v} />}
      <Verdict answer={answer} text="job compute: billed only for the run itself" y={190} />
    </Svg>
  );
}
