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

/** A compute cluster: a box with a name and a load bar along its foot that fills by `load` (red once it is pegged). */
function Cluster({ x, y, w, label, load = 0, o = 1, f = C.mocha, cache = -1 }: { x: number; y: number; w: number; label: string; load?: number; o?: number; f?: string; cache?: number }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={50} rx={5} fill={C.cocoa} stroke={f} strokeWidth={1.5} />
      <T x={x + w / 2} y={y + 22} s={12} f={C.crema} a="middle">
        {label}
      </T>
      <rect x={x + 8} y={y + 36} width={(w - 16) * load} height={6} rx={2} fill={load > 0.85 ? C.cherryText : C.latte} />
      {cache >= 0 && <rect x={x + w - 46} y={y + 8} width={38 * cache} height={10} rx={2} fill={C.second} opacity={0.8} />}
    </g>
  );
}

/** The one shared storage layer, across the foot of the picture. */
function Storage({ y, o = 1 }: { y: number; o?: number }) {
  return (
    <g opacity={o}>
      <rect x={25} y={y} width={550} height={26} rx={4} fill={C.cocoa} stroke={C.second} strokeWidth={1.5} />
      <T x={300} y={y + 17} s={12} f={C.second} a="middle">
        shared storage
      </T>
    </g>
  );
}

// 1 · Hook. Two teams' work feeds one cluster over shared storage; the batch job pegs the cluster's load and the dashboard's
// query crawls.
export function Hook({ t }: StepCtx) {
  const ld = easeInOut(seg(t, 1.6, 2.6));
  const q = seg(t, 2.6, 4.4);
  return (
    <Svg label="one cluster, two workloads, one shared storage layer underneath" h={250}>
      <Row y={40} label="two teams" value="one shared cluster" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="one runs heavy" value="the other slows?" valueColor={C.cherryText} k={easeOut(seg(t, 2.6, 3.1))} />
      <Cell x={25} y={112} w={150} h={24} label="batch job" o={easeOut(seg(t, 0.4, 0.7))} stroke={ld > 0.85 ? C.cherryText : C.mocha} />
      <Cell x={425} y={112} w={150} h={24} label="dashboard" o={easeOut(seg(t, 0.5, 0.8))} />
      <line x1={100} y1={136} x2={230} y2={156} stroke={C.latte} strokeWidth={1.2} opacity={easeOut(seg(t, 0.8, 1.1))} />
      <line x1={500} y1={136} x2={370} y2={156} stroke={C.latte} strokeWidth={1.2} opacity={easeOut(seg(t, 0.8, 1.1))} />
      <Cluster x={200} y={156} w={200} label="one cluster" load={0.15 + 0.85 * ld} o={easeOut(seg(t, 0.6, 1.0))} f={ld > 0.85 ? C.cherryText : C.mocha} />
      {q > 0 && <circle cx={lerp(500, 370, q * 0.6)} cy={lerp(136, 156, q * 0.6)} r={5} fill={C.cherryText} />}
      <Storage y={218} o={easeOut(seg(t, 0.6, 1.0))} />
    </Svg>
  );
}

// 2 · Separation. One box holding both pulls apart into a compute layer above and a storage layer below; two benefits tag on.
export function RevealSeparationQuote({ t }: StepCtx) {
  const sp = easeInOut(seg(t, 0.9, 1.7));
  return (
    <Svg label="storage and compute, separated — infrastructure and tuning get simpler" h={250}>
      <Row y={40} label="storage, compute" value="separate layers" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="already simpler" value="to manage and to tune" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
      <Cell x={25} y={lerp(140, 120, sp)} w={260} h={30} label="compute" o={easeOut(seg(t, 0.4, 0.8))} />
      <Cell x={25} y={lerp(170, 200, sp)} w={260} h={30} label="storage" o={easeOut(seg(t, 0.4, 0.8))} stroke={C.second} f={C.second} />
      <line x1={155} y1={150} x2={155} y2={200} stroke={C.latte} strokeWidth={1.5} strokeDasharray="4 3" opacity={sp} />
      <Cell x={345} y={128} w={230} h={26} label="simpler infrastructure" o={easeOut(seg(t, 2.0, 2.4))} stroke={C.focus} />
      <Cell x={345} y={170} w={230} h={26} label="simpler tuning" o={easeOut(seg(t, 2.5, 2.9))} stroke={C.focus} />
    </Svg>
  );
}

// 3 · Predict: is separation enough? Storage already apart; both teams still on one compute box; then the question.
export function PredictSeparationEnough({ t, answer }: StepCtx) {
  const ld = easeInOut(seg(t, 0.6, 1.5));
  return (
    <Svg label="storage already separated — does that alone stop the slowdown?" h={210}>
      <Row y={40} label="storage apart" value="compute still shared" k={easeOut(seg(t, 0.1, 0.5))} />
      <rect x={25} y={58} width={360} height={14} rx={3} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.2} opacity={easeOut(seg(t, 0.2, 0.5))} />
      <rect x={29} y={62} width={352 * ld} height={6} rx={2} fill={ld > 0.85 ? C.cherryText : C.latte} />
      <rect x={25} y={82} width={360} height={14} rx={3} fill={C.cocoa} stroke={C.second} strokeWidth={1.2} opacity={easeOut(seg(t, 0.3, 0.6))} />
      <T x={400} y={70} s={11} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        compute
      </T>
      <T x={400} y={94} s={11} f={C.second} o={easeOut(seg(t, 0.3, 0.6))}>
        storage
      </T>
      <AnswerRow y={140} label="stops the slowdown" answer={answer} value="no, split compute too" k={easeOut(seg(t, 1.5, 2.0))} />
      <Verdict answer={answer} text="the shared compute is where they contend" />
    </Svg>
  );
}

// 4 · Independent clusters. The one cluster splits into two; the batch job pegs its own; the dashboard's stays calm.
export function RevealIndependentClustersQuote({ t }: StepCtx) {
  const sp = easeInOut(seg(t, 0.8, 1.6));
  const ld = easeInOut(seg(t, 2.0, 3.0));
  return (
    <Svg label="each cluster independent — no shared compute, no shared effect" h={250}>
      <Row y={40} label="each cluster" value="shares no compute" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="load on one" value="no effect on another" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
      <Cluster x={lerp(200, 25, sp)} y={130} w={lerp(200, 250, sp)} label="batch cluster" load={0.15 + 0.85 * ld} o={easeOut(seg(t, 0.4, 0.8))} f={ld > 0.85 ? C.cherryText : C.mocha} />
      <Cluster x={lerp(200, 325, sp)} y={130} w={lerp(200, 250, sp)} label="dashboard cluster" load={0.2} o={sp} f={ld > 0.85 ? C.focus : C.mocha} />
      <Storage y={208} o={easeOut(seg(t, 0.4, 0.8))} />
    </Svg>
  );
}

// 5 · Elastic scaling. Queries running at once climb; a cluster is added onto the same storage for each step up.
export function RevealElasticScalingQuote({ t }: StepCtx) {
  const n = (i: number) => easeOutBack(seg(t, 1.0 + i * 0.8, 1.4 + i * 0.8));
  const qs = Math.round(lerp(2, 9, clamp(seg(t, 0.6, 3.0))));
  return (
    <Svg label="more clusters, same shared storage — added as simultaneous load rises" h={250}>
      <Row y={40} label="more clusters" value="added on the fly" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="scaling with" value="queries at once" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
      {Array.from({ length: 9 }, (_, i) => (
        <circle key={i} cx={40 + (i % 3) * 22} cy={130 + Math.floor(i / 3) * 22} r={6} fill={C.focus} opacity={i < qs ? 1 : 0} />
      ))}
      <T x={62} y={200} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 0.5, 0.8))}>
        queries at once
      </T>
      {[0, 1, 2].map((i) => (
        <g key={i} opacity={clamp(n(i))} transform={`translate(0 ${((1 - clamp(n(i))) * -16).toFixed(1)})`}>
          <Cluster x={135 + i * 150} y={130} w={140} label={`cluster ${i + 1}`} load={0.5} />
          <line x1={205 + i * 150} y1={180} x2={205 + i * 150} y2={208} stroke={C.second} strokeWidth={1.5} />
        </g>
      ))}
      <rect x={135} y={208} width={440} height={26} rx={4} fill={C.cocoa} stroke={C.second} strokeWidth={1.5} opacity={easeOut(seg(t, 0.4, 0.8))} />
      <T x={355} y={225} s={12} f={C.second} a="middle" o={easeOut(seg(t, 0.4, 0.8))}>
        the same shared storage
      </T>
    </Svg>
  );
}

// 6 · Predict: does one slow query speed up? One long query bar; extra clusters appear beside it; then the question.
export function PredictMoreClustersFasterQuery({ t, answer }: StepCtx) {
  return (
    <Svg label="more clusters available — does one slow query speed up?" h={210}>
      <Row y={40} label="one slow query" value="more clusters ready" k={easeOut(seg(t, 0.1, 0.5))} />
      <rect x={25} y={64} width={300 * easeOut(seg(t, 0.2, 1.0))} height={18} rx={3} fill={C.cherryText} opacity={0.5} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={355 + i * 75} y={58} width={65} height={30} rx={4} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.2} opacity={easeOut(seg(t, 0.8 + i * 0.2, 1.1 + i * 0.2))} />
      ))}
      <AnswerRow y={140} label="that query faster" answer={answer} value="no, it's the same" k={easeOut(seg(t, 1.5, 2.0))} />
      <Verdict answer={answer} text="scaling is for queries at once" />
    </Svg>
  );
}

// 7 · The vendor's own limit. Many queries spread across three clusters and clear; one slow query keeps the same length no
// matter how many clusters stand beside it.
export function RevealScalingLimitQuote({ t }: StepCtx) {
  const sp = easeInOut(seg(t, 0.8, 1.8));
  const run = seg(t, 2.4, 4.2);
  return (
    <Svg label="scaling helps concurrency; it does not speed up one slow query by itself" h={250}>
      <Row y={40} label="built for" value="more users, more queries" valueColor={C.focus} k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="one slow query" value="no faster" valueColor={C.cherryText} k={easeOut(seg(t, 2.6, 3.1))} />
      {[0, 1, 2].map((c) => (
        <rect key={c} x={25 + c * 85} y={150} width={75} height={40} rx={4} fill={C.cocoa} stroke={C.focus} strokeWidth={1.2} opacity={easeOut(seg(t, 0.4, 0.7))} />
      ))}
      {Array.from({ length: 6 }, (_, i) => {
        const c = i % 3;
        return (
          <circle
            key={i}
            cx={lerp(140, 45 + c * 85 + Math.floor(i / 3) * 34, sp)}
            cy={lerp(125, 170, sp)}
            r={6}
            fill={C.focus}
            opacity={(sp < 1 ? 1 : 1 - seg(t, 1.8, 2.2)) * easeOut(seg(t, 0.4, 0.7))}
          />
        );
      })}
      <rect x={325} y={162} width={250 * clamp(run * 0.55)} height={16} rx={3} fill={C.cherryText} opacity={0.5} />
      <rect x={325} y={162} width={250} height={16} rx={3} fill="none" stroke={C.cherryText} strokeWidth={1} strokeDasharray="4 3" opacity={easeOut(seg(t, 2.2, 2.5))} />
      <T x={325} y={150} s={11} f={C.latte} o={easeOut(seg(t, 2.2, 2.5))}>
        still its own full length
      </T>
      <T x={25} y={210} s={11} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        three clusters
      </T>
    </Svg>
  );
}

// 8 · The fix. Batch job and dashboard each get their own cluster; both read the one storage below; the contention mark
// between them is crossed out.
export function RevealNoisyNeighborFix({ t }: StepCtx) {
  const x = easeOut(seg(t, 2.6, 3.1));
  return (
    <Svg label="one cluster per workload, one shared storage layer — nothing left to contend over" h={250}>
      <Row y={40} label="one cluster each" value="one shared storage" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="left to contend over" value="nothing" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
      <Cluster x={25} y={128} w={220} label="batch job's cluster" load={0.9} o={easeOut(seg(t, 0.6, 1.0))} />
      <Cluster x={355} y={128} w={220} label="dashboard's cluster" load={0.2} o={easeOut(seg(t, 1.0, 1.4))} />
      {[135, 465].map((cx, i) => (
        <line key={cx} x1={cx} y1={178} x2={cx} y2={lerp(178, 208, easeInOut(seg(t, 1.6 + i * 0.3, 2.0 + i * 0.3)))} stroke={C.second} strokeWidth={2} />
      ))}
      <Storage y={208} o={easeOut(seg(t, 1.4, 1.8))} />
      <path d="M285 140 l30 26 m0 -26 l-30 26" stroke={C.focus} strokeWidth={3} opacity={x} />
    </Svg>
  );
}

// 9 · Predict: a free lunch? A cluster with its cache strip filled; then the question.
export function PredictCacheFreeLunch({ t, answer }: StepCtx) {
  return (
    <Svg label="a cache, seemingly all upside — any real cost worth naming?" h={210}>
      <Row y={40} label="a cluster's cache" value="only ever faster?" k={easeOut(seg(t, 0.1, 0.5))} />
      <rect x={25} y={58} width={360} height={34} rx={5} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.2, 0.5))} />
      <rect x={35} y={68} width={200 * easeOut(seg(t, 0.6, 1.4))} height={14} rx={2} fill={C.second} opacity={0.8} />
      <T x={400} y={80} s={11} f={C.second} o={easeOut(seg(t, 0.6, 0.9))}>
        cache
      </T>
      <AnswerRow y={140} label="any real cost" answer={answer} value="yes, a real trade" k={easeOut(seg(t, 1.5, 2.0))} />
      <Verdict answer={answer} text="re-coupled on purpose, and it can go cold" />
    </Svg>
  );
}

// 10 · The cache. The first query travels all the way down to storage and fills the cache on its way back; the next query
// stops at the cache.
export function RevealCacheQuote({ t }: StepCtx) {
  const q1 = seg(t, 0.8, 2.0);
  const fill = easeOut(seg(t, 1.6, 2.2));
  const q2 = seg(t, 2.6, 3.2);
  const y1 = q1 < 0.5 ? lerp(120, 222, q1 * 2) : lerp(222, 120, q1 * 2 - 1);
  return (
    <Svg label="running cluster, caching touched data — later queries skip rereading storage" h={250}>
      <Row y={40} label="running cluster" value="keeps what it touched" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="the next query" value="skips storage" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
      <Cluster x={200} y={118} w={200} label="cluster" load={0.4} cache={fill} o={easeOut(seg(t, 0.4, 0.8))} />
      <Storage y={210} o={easeOut(seg(t, 0.4, 0.8))} />
      {q1 > 0 && q1 < 1 && <circle cx={160} cy={y1} r={6} fill={C.crema} />}
      <line x1={160} y1={120} x2={160} y2={222} stroke={C.latte} strokeWidth={1} strokeDasharray="3 3" opacity={easeOut(seg(t, 0.8, 1.0))} />
      {q2 > 0 && <circle cx={lerp(480, 395, q2)} cy={131} r={6} fill={C.focus} opacity={q2 < 1 ? 1 : 0.6} />}
      <T x={480} y={112} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 2.5, 2.8))}>
        next query
      </T>
      <T x={150} y={112} s={11} f={C.latte} a="end" o={easeOut(seg(t, 0.8, 1.1))}>
        first query
      </T>
    </Svg>
  );
}

// 11 · The cost. The cluster suspends and its cache empties; on resume the next query goes all the way back to storage, slow
// and red, while the cache refills from nothing.
export function RevealCacheCostQuote({ t }: StepCtx) {
  const sus = easeInOut(seg(t, 0.8, 1.4));
  const res = easeInOut(seg(t, 1.8, 2.2));
  const q = seg(t, 2.4, 3.8);
  const fill = res > 0 ? easeInOut(seg(t, 2.8, 4.4)) : 1 - sus;
  const y = q < 0.5 ? lerp(120, 222, q * 2) : lerp(222, 120, q * 2 - 1);
  return (
    <Svg label="suspend the cluster, lose the cache — the next queries pay for it, until it rebuilds" h={250}>
      <Row y={40} label="suspend it" value="the cache is gone" valueColor={C.cherryText} k={easeOut(seg(t, 0.8, 1.3))} />
      <Row y={85} label="next queries" value="slower, until rebuilt" valueColor={C.cherryText} k={easeOut(seg(t, 2.6, 3.1))} />
      <Cluster x={200} y={118} w={200} label="cluster" load={0.4 * (1 - sus) + 0.4 * res} cache={fill} o={1 - 0.6 * sus + 0.6 * res} />
      <T x={300} y={110} s={11} f={C.latte} a="middle" o={sus * (1 - res)}>
        suspended
      </T>
      <Storage y={210} />
      {q > 0 && q < 1 && <circle cx={160} cy={y} r={6} fill={C.cherryText} />}
      <line x1={160} y1={120} x2={160} y2={222} stroke={C.cherryText} strokeWidth={1} strokeDasharray="3 3" opacity={easeOut(seg(t, 2.4, 2.6))} />
    </Svg>
  );
}

// 12 · Recap. Three rows land one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="separation, then isolation; a cache re-coupled on purpose, paid for on suspend" h={220}>
      <Row y={50} label="step one" value="storage out of compute" k={easeOut(seg(t, 0.8, 1.3))} />
      <Row y={110} label="step two" value="a cluster per workload" k={easeOut(seg(t, 2.0, 2.5))} />
      <Row y={170} label="the cache" value="re-coupled, while running" valueColor={C.focus} k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 13 · Prove: suspend the instant it idles. Idle, suspend, resume, slow, repeating marks along a time line; after the answer
// the verdict lands with a tick.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const k = answer !== null ? easeOut(seg(s, 0.4, 0.8)) : 0;
  const tick = answer !== null ? easeOut(seg(s, 0.8, 1.2)) : 0;
  const red = answer !== null ? easeOut(seg(s, 0.1, 0.5)) : 0;
  return (
    <Svg label="suspend the moment it goes idle — what gets traded away?" h={230}>
      <Row y={40} label="suspend the instant idle" value="what's given up?" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="it gives up" answer={answer} value="its cache" f={C.cherryText} k={easeOut(seg(t, 0.4, 0.9))} />
      {[0, 1, 2, 3].map((i) => (
        <g key={i} opacity={easeOut(seg(t, 0.5 + i * 0.2, 0.8 + i * 0.2))}>
          <rect x={25 + i * 140} y={118} width={60} height={20} rx={3} fill={C.cocoa} stroke={C.mocha} strokeWidth={1} />
          <rect
            x={90 + i * 140}
            y={118}
            width={60}
            height={20}
            rx={3}
            fill={red > 0 ? C.cherryText : C.cocoa}
            fillOpacity={red > 0 ? 0.2 + 0.4 * red : 1}
            stroke={red > 0 ? C.cherryText : C.mocha}
            strokeWidth={1}
          />
        </g>
      ))}
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, k)} s={15} f={C.focus} a="middle" o={k}>
            slower queries after every resume
          </T>
          <rect x={150} y={202} width={300 * tick} height={3} fill={C.focus} />
          <Tick y={162} k={tick} />
        </>
      )}
    </Svg>
  );
}
