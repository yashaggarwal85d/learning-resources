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

const KC = [C.crema, C.focus, C.second];

// 1 · Hook. The combined plan's bar grows across; the per-partition plan's stops shorter.
export function PartitionwiseHook({ t }: StepCtx) {
  const k = (i: number) => easeOut(seg(t, 0.2 + i * 1.1, 1.1 + i * 1.1));
  return (
    <Svg label="same join, same answer, same memory setting — different plan shape" h={370}>
      {timeBar(30, 90, 4619.117 / 4619.117, '4619.117 ms, combined', 'partition-wise off', C.cherryText, k(0))}
      {timeBar(30, 210, 3684.68 / 4619.117, '3684.680 ms, per-partition', 'partition-wise on', C.focus, k(1))}
      <T x={300} y={330} s={15} f={C.latte} a="middle" o={easeOut(seg(t, 2.9, 3.5))}>
        same answer, same work_mem
      </T>
    </Svg>
  );
}

// 2 · Predict: why four pieces win. The two divisions slide in; after the answer the verdict slides in.
export function PredictWhyPartitionsHelp({ t, answer }: StepCtx) {
  return (
    <Svg label="the same work, divided one way or divided another" h={210}>
      <Row y={70} label="one combined hash table" value="2,000,000 rows" valueColor={C.cherryText} k={easeOut(seg(t, 0.1, 0.6))} />
      <Row y={130} label="four separate hash tables" value="500,000 rows each" valueColor={C.focus} k={easeOut(seg(t, 0.5, 1.0))} />
      <Verdict answer={answer} text="each small table fits where the big one can't" />
    </Svg>
  );
}

// 3 · Plan shape. Off: one Hash Join over an Append of every partition. On: four Hash Joins, each over its own pair.
export function RevealPlanShape({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.5));
  const legs = easeInOut(seg(t, 0.5, 1.2));
  const b = easeOut(seg(t, 1.2, 1.7));
  const c = easeOut(seg(t, 2.3, 2.8));
  const px = (i: number) => 120 + i * 100;
  return (
    <Svg label="1 Hash Join over everything, or 4 independent ones" h={300}>
      <T x={300} y={24} s={16} f={C.crema} a="middle" o={a}>
        off: one Hash Join —
      </T>
      <g opacity={a}>
        <rect x={240} y={36} width={120} height={26} rx={4} fill={C.cocoa} stroke={C.cherryText} />
        <T x={300} y={54} s={13} f={C.cherryText} a="middle">
          Hash Join
        </T>
      </g>
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <line x1={300} y1={62} x2={lerp(300, px(i) + 40, legs)} y2={lerp(62, 88, legs)} stroke={C.mocha} />
          <rect x={px(i) + 10} y={88} width={60} height={20} rx={3} fill={C.cocoa} stroke={C.mocha} opacity={legs} />
          {legs >= 1 && (
            <T x={px(i) + 40} y={102} s={12} f={C.latte} a="middle">
              p{i + 1}
            </T>
          )}
        </g>
      ))}
      <T x={300} y={140} s={15} f={C.latte} a="middle" o={b}>
        over an Append of every partition, both sides
      </T>
      <T x={300} y={180} s={15} f={C.focus} a="middle" o={c}>
        on: an Append of 4 Hash Joins,
      </T>
      <T x={300} y={203} s={15} f={C.focus} a="middle" o={c}>
        each over just its own matching pair
      </T>
      {[0, 1, 2, 3].map((i) => {
        const k = easeOutBack(seg(t, 2.6 + i * 0.2, 3.0 + i * 0.2));
        return (
          <g key={i} opacity={clamp(k, 0, 1)} transform={`translate(0 ${((1 - k) * 10).toFixed(2)})`}>
            <rect x={px(i)} y={222} width={80} height={26} rx={4} fill={C.cocoa} stroke={C.focus} />
            <T x={px(i) + 40} y={240} s={12} f={C.focus} a="middle">
              join
            </T>
            <line x1={px(i) + 40} y1={248} x2={px(i) + 40} y2={262} stroke={C.mocha} />
            <rect x={px(i) + 22} y={262} width={16} height={14} rx={2} fill={C.crema} />
            <rect x={px(i) + 42} y={262} width={16} height={14} rx={2} fill={C.crema} />
          </g>
        );
      })}
    </Svg>
  );
}

// 4 · Why it works. Two tables split on the same boundaries; the boundary lines run through both; each matching
// pair lights up in turn as a self-contained join.
export function HowPartitionwiseWorks({ t }: StepCtx) {
  const bars = easeOut(seg(t, 1.0, 1.5));
  const cut = easeInOut(seg(t, 1.4, 2.0));
  const q = easeOut(seg(t, 3.4, 4.0));
  const sx = (i: number) => 25 + i * 137.5;
  const lit = (i: number) => {
    const a = 2.2 + i * 0.3;
    return t >= a;
  };
  return (
    <Svg label="same partition keys, same boundaries, on both sides" h={260}>
      <Row y={40} label="join condition covers" value="every partition key" k={easeOut(seg(t, 0.1, 0.6))} />
      <Row y={90} label="both tables share" value="the same boundaries" valueColor={C.focus} k={easeOut(seg(t, 0.5, 1.0))} />
      {[0, 1].map((r) =>
        [0, 1, 2, 3].map((i) => (
          <rect key={`${r}${i}`} x={sx(i) + 2} y={128 + r * 40} width={133.5} height={22} rx={3} fill={lit(i) ? C.focus : C.cocoa} stroke={C.mocha} opacity={bars * (lit(i) ? 0.85 : 1)} />
        )),
      )}
      {[1, 2, 3].map((i) => (
        <line key={i} x1={sx(i)} y1={120} x2={sx(i)} y2={120 + 70 * cut} stroke={C.latte} strokeWidth={1.5} strokeDasharray="4 3" />
      ))}
      <T x={300} y={235} s={15} f={C.latte} a="middle" o={q}>
        each pair is a complete join on its own
      </T>
    </Svg>
  );
}

// 5 · Memory. One combined table outgrows its budget box and spills red; four small ones each fill inside theirs.
export function RevealMemoryWin({ t }: StepCtx) {
  const big = easeInOut(seg(t, 0.6, 1.6));
  const fw = 420 * big;
  return (
    <Svg label="one hash table spills; four smaller ones don't" h={190}>
      <Row y={45} label="combined, 2,000,000 rows" value="spills to disk" valueColor={C.cherryText} k={easeOut(seg(t, 0.2, 0.7))} />
      <rect x={25} y={58} width={Math.min(fw, 130)} height={14} rx={2} fill={C.primary} />
      {fw > 130 && <rect x={155} y={58} width={fw - 130} height={14} rx={2} fill={C.cherryText} />}
      <rect x={25} y={56} width={130} height={18} rx={3} fill="none" stroke={C.latte} strokeDasharray="4 3" opacity={easeOut(seg(t, 0.4, 0.8))} />
      <Row y={130} label="per-partition, 500,000 rows" value="fits in memory" valueColor={C.focus} k={easeOut(seg(t, 1.8, 2.3))} />
      {[0, 1, 2, 3].map((i) => {
        const k = easeInOut(seg(t, 2.2 + i * 0.25, 2.8 + i * 0.25));
        return (
          <g key={i} opacity={easeOut(seg(t, 2.0, 2.4))}>
            <rect x={25 + i * 140} y={141} width={130} height={18} rx={3} fill="none" stroke={C.latte} strokeDasharray="4 3" />
            <rect x={27 + i * 140} y={143} width={105 * k} height={14} rx={2} fill={C.focus} />
          </g>
        );
      })}
    </Svg>
  );
}

// 6 · Predict: across machines. Both facts slide in; after the answer the "?" becomes the answer.
export function PredictAcrossMachines({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="two tables, several machines, not aligned the same way" h={210}>
      <Row y={70} label="one machine" value="nothing to move" valueColor={C.focus} k={easeOut(seg(t, 0.1, 0.6))} />
      <Row y={130} label="several machines" value={answered ? 'data moves first' : '?'} valueColor={answered ? C.cherryText : C.crema} k={easeOut(seg(t, 0.5, 1.0))} />
      <Verdict answer={answer} text="something has to build the alignment" />
    </Svg>
  );
}

/** Three nodes in a row at height y. */
function Nodes({ y, o, f = C.mocha }: { y: number; o: number; f?: string }) {
  return (
    <g opacity={o}>
      {[0, 1, 2].map((i) => (
        <rect key={i} x={120 + i * 160} y={y} width={60} height={18} rx={3} fill={C.cocoa} stroke={f} />
      ))}
    </g>
  );
}

// 7 · Exchange operators. HASH: every node sends to every node by key. BROADCAST: one node's side goes out to all.
export function RevealExchangeOperators({ t }: StepCtx) {
  const r1 = easeOut(seg(t, 0.2, 0.7));
  const h = easeInOut(seg(t, 0.7, 1.7));
  const r2 = easeOut(seg(t, 2.0, 2.5));
  const b = easeInOut(seg(t, 2.5, 3.4));
  const nx = (i: number) => 150 + i * 160;
  return (
    <Svg label="RemoteExchange: HASH or BROADCAST, named in the plan itself" h={240}>
      <Row y={40} label="HASH fragment" value="redistribute by key" k={r1} />
      <Nodes y={55} o={r1} />
      <Nodes y={95} o={r1} />
      {[0, 1, 2].map((i) =>
        [0, 1, 2].map((j) => <line key={`${i}${j}`} x1={nx(i)} y1={73} x2={lerp(nx(i), nx(j), h)} y2={lerp(73, 95, h)} stroke={C.crema} strokeWidth={1.2} opacity={h > 0 ? 0.8 : 0} />),
      )}
      <Row y={150} label="BROADCAST fragment" value="send to every node" valueColor={C.focus} k={r2} />
      <g opacity={r2}>
        <rect x={270} y={165} width={60} height={18} rx={3} fill={C.cocoa} stroke={C.focus} />
      </g>
      <Nodes y={205} o={r2} />
      {[0, 1, 2].map((j) => (
        <line key={j} x1={300} y1={183} x2={lerp(300, nx(j), b)} y2={lerp(183, 205, b)} stroke={C.focus} strokeWidth={1.5} opacity={b > 0 ? 1 : 0} />
      ))}
    </Svg>
  );
}

const SH: [number, number, number][] = [
  [0, 1, 0],
  [0, 2, 1],
  [0, 0, 0],
  [1, 0, 1],
  [1, 2, 0],
  [1, 1, 1],
  [2, 1, 0],
  [2, 0, 1],
  [2, 2, 1],
  [0, 1, 1],
  [1, 0, 0],
  [2, 2, 0],
];
// 8 · Shuffle. Rows of both sides (squares and circles), coloured by join key, start scattered across three nodes;
// each flies to the node that owns its key, so matches end up together.
export function HowShuffleWorks({ t }: StepCtx) {
  const head = easeOut(seg(t, 0, 0.4));
  const sub = easeOut(seg(t, 1.0, 1.5));
  const last = easeOut(seg(t, 3.0, 3.6));
  const nx = (i: number) => 60 + i * 180;
  const counts = [0, 0, 0];
  const home = [0, 0, 0];
  const pos = SH.map(([from, key]) => {
    const a = counts[from]++;
    const b = home[key]++;
    return [nx(from) + 14 + (a % 4) * 26, 112 + Math.floor(a / 4) * 26, nx(key) + 14 + (b % 4) * 26, 112 + Math.floor(b / 4) * 26];
  });
  return (
    <Svg label="both sides redistributed by the join key, across the network" h={215}>
      <T x={300} y={28} s={16} f={C.crema} a="middle" o={head}>
        hash-redistribute both sides —
      </T>
      <T x={300} y={52} s={15} f={C.latte} a="middle" o={sub}>
        by the join key, across every node
      </T>
      {[0, 1, 2].map((i) => (
        <rect key={i} x={nx(i)} y={72} width={120} height={80} rx={6} fill="none" stroke={KC[i]} opacity={head * 0.8} />
      ))}
      {SH.map(([, key, side], i) => {
        const k = easeInOut(seg(t, 1.4 + i * 0.08, 2.2 + i * 0.08));
        const [x0, y0, x1, y1] = pos[i];
        const x = lerp(x0, x1, k);
        const y = lerp(y0, y1, k) - 20 * Math.sin(Math.PI * k);
        return side === 0 ? <rect key={i} x={x - 7} y={y - 7} width={14} height={14} rx={2} fill={KC[key]} opacity={head} /> : <circle key={i} cx={x} cy={y} r={7} fill={KC[key]} opacity={head} />;
      })}
      <T x={300} y={195} s={15} f={C.focus} a="middle" o={last}>
        rebuilding what partitions already had, for free
      </T>
    </Svg>
  );
}

// 9 · Broadcast. The small side is copied down into every node; the big side's blocks never move.
export function HowBroadcastWorks({ t }: StepCtx) {
  const r1 = easeOut(seg(t, 0.2, 0.7));
  const r2 = easeOut(seg(t, 0.6, 1.1));
  const nodes = easeOut(seg(t, 0.8, 1.2));
  const nx = (i: number) => 60 + i * 180;
  return (
    <Svg label="copy the small side everywhere, move nothing else" h={230}>
      <Row y={40} label="the smaller side" value="copied to every node" valueColor={C.focus} k={r1} />
      <Row y={90} label="the larger side" value="doesn't move at all" k={r2} />
      {[0, 1, 2].map((i) => (
        <g key={i} opacity={nodes}>
          <rect x={nx(i)} y={150} width={120} height={60} rx={6} fill="none" stroke={C.mocha} />
          <rect x={nx(i) + 12} y={178} width={60} height={22} rx={3} fill={C.crema} opacity={0.8} />
        </g>
      ))}
      <rect x={282} y={112} width={36} height={18} rx={3} fill={C.focus} opacity={nodes} />
      {[0, 1, 2].map((i) => {
        const k = easeInOut(seg(t, 1.4 + i * 0.3, 2.2 + i * 0.3));
        if (k <= 0) return null;
        return <rect key={i} x={lerp(282, nx(i) + 76, k)} y={lerp(112, 178, k)} width={36} height={22 - 4 * (1 - k)} rx={3} fill={C.focus} />;
      })}
    </Svg>
  );
}

// 10 · Predict: past the threshold. The broadcast side's bar grows through the limit line; after the answer the verdict slides in.
export function PredictBroadcastThreshold({ t, answer }: StepCtx) {
  const g = easeInOut(seg(t, 0.6, 1.5));
  return (
    <Svg label="a broadcast side, growing past the engine's own limit" h={230}>
      <Row y={60} label="broadcast side, growing" value="past the limit" valueColor={C.cherryText} k={easeOut(seg(t, 0.1, 0.6))} />
      <rect x={25} y={74} width={420 * g} height={10} rx={3} fill={420 * g > 300 ? C.cherryText : C.focus} />
      <line x1={325} y1={68} x2={325} y2={90} stroke={C.latte} strokeWidth={1.5} strokeDasharray="3 3" opacity={easeOut(seg(t, 0.3, 0.7))} />
      <Row y={140} label="what the engine should do" value={answer !== null ? 'shuffle instead' : '?'} valueColor={answer !== null ? C.focus : C.crema} k={easeOut(seg(t, 0.5, 1.0))} />
      <Verdict answer={answer} text="past it, copying costs more than moving once" y={200} />
    </Svg>
  );
}

// 11 · The threshold. The default limit counts up; then a size axis: a side slides along it, copied while under
// 10 MB and redistributed once past it.
export function RevealBroadcastThreshold({ t }: StepCtx) {
  const ax = easeInOut(seg(t, 1.2, 1.8));
  const m = easeInOut(seg(t, 2.0, 3.4));
  const mx = lerp(110, 490, m);
  const under = mx < 300;
  return (
    <Svg label="10 MB default threshold — switchable, even at run time" h={220}>
      <Row y={50} label="Spark's default broadcast limit" value={`${num(Math.max(1, 10 * easeOut(seg(t, 0.2, 1.0))))} MB`} valueColor={C.focus} k={easeOut(seg(t, 0.1, 0.6))} />
      <Row y={105} label="above it" value="switches to a shuffle join" k={easeOut(seg(t, 0.7, 1.2))} />
      <line x1={60} y1={170} x2={60 + 480 * ax} y2={170} stroke={C.mocha} strokeWidth={2} />
      <line x1={300} y1={158} x2={300} y2={182} stroke={C.latte} strokeWidth={2} opacity={ax} />
      <T x={300} y={202} s={12} f={C.latte} a="middle" o={ax}>
        10 MB
      </T>
      <T x={180} y={150} s={12} f={C.focus} a="middle" o={ax}>
        copy
      </T>
      <T x={420} y={150} s={12} f={C.latte} a="middle" o={ax}>
        redistribute
      </T>
      {m > 0 && <circle cx={mx} cy={170} r={8} fill={under ? C.focus : C.crema} />}
    </Svg>
  );
}

// 12 · Co-located. Two tables split the same way sit side by side; the exchange step that would align them
// is struck through and fades out.
export function CoLocatedJoins({ t }: StepCtx) {
  const head = easeOut(seg(t, 0, 0.4));
  const sub = easeOut(seg(t, 1.0, 1.5));
  const ex = easeOut(seg(t, 1.2, 1.6));
  const strike = easeInOut(seg(t, 2.2, 2.7));
  const gone = easeInOut(seg(t, 2.8, 3.4));
  const last = easeOut(seg(t, 3.0, 3.6));
  return (
    <Svg label="the same alignment, one machine's partitions or a cluster's nodes" h={190}>
      <T x={300} y={28} s={16} f={C.crema} a="middle" o={head}>
        both already split the same way —
      </T>
      <T x={300} y={52} s={15} f={C.latte} a="middle" o={sub}>
        across partitions, or across nodes
      </T>
      {[0, 1].map((r) => [0, 1, 2, 3].map((i) => <rect key={`${r}${i}`} x={25 + i * 80} y={80 + r * 30} width={74} height={22} rx={3} fill={C.cocoa} stroke={KC[i % 3]} opacity={head} />))}
      <g opacity={ex * (1 - gone)}>
        <rect x={400} y={86} width={150} height={40} rx={6} fill="none" stroke={C.mocha} strokeDasharray="5 4" />
        <T x={475} y={111} s={13} f={C.latte} a="middle">
          exchange
        </T>
        <line x1={400} y1={106} x2={400 + 150 * strike} y2={106} stroke={C.cherryText} strokeWidth={2} />
      </g>
      <T x={300} y={170} s={15} f={C.focus} a="middle" o={last}>
        the exchange step just disappears
      </T>
    </Svg>
  );
}

// 13 · Recap. Four lines rise in one per beat; the last is the one to remember.
export function Recap({ t }: StepCtx) {
  const lines = [
    'matching partitions avoid redundant work on one machine',
    'across machines, an exchange moves data first',
    'shuffle moves both sides; broadcast copies one side',
    'the broadcast threshold is a real, switchable line',
  ];
  return (
    <Svg label="recap: partitions, exchanges, shuffle vs broadcast, the threshold" h={240}>
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

// 14 · Prove: exchange type. After the answer the "?" becomes the answer, underlined.
export function ProveExchangeType({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const u = answered ? easeOut(seg(s, 0.2, 0.7)) : 0;
  return (
    <Svg label="a plan fragment's exchange type reads HASH" h={210}>
      <Row y={70} label="exchange type" value="HASH" k={easeOut(seg(t, 0.1, 0.6))} />
      <Row y={130} label="copy or redistribute?" value={answered ? 'redistribute' : '?'} valueColor={answered ? C.focus : C.crema} k={easeOut(seg(t, 0.5, 1.0))} />
      {answered && <rect x={575 - 130 * u} y={142} width={130 * u} height={3} fill={C.focus} />}
    </Svg>
  );
}

// 15 · Prove: broadcast decision. The side's bar sits under the threshold line; after the answer the verdict lands with rule and tick.
export function ProveBroadcastDecision({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const k = answered ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const tick = answered ? easeOut(seg(s, 0.6, 1.0)) : 0;
  const g = easeOut(seg(t, 0.5, 1.2));
  return (
    <Svg label="6 MB join side, 10 MB broadcast threshold" h={230}>
      <Row y={60} label="join side size" value="6 MB" k={easeOut(seg(t, 0.1, 0.6))} />
      <Row y={115} label="broadcast threshold" value="10 MB" valueColor={C.focus} k={easeOut(seg(t, 0.4, 0.9))} />
      <rect x={25} y={130} width={330 * g} height={10} rx={3} fill={C.crema} />
      <line x1={575} y1={124} x2={575} y2={146} stroke={C.focus} strokeWidth={2} opacity={g} />
      {answered && (
        <>
          <T x={300} y={lerp(198, 188, k)} s={16} f={C.focus} a="middle" o={k}>
            under the limit: broadcast it
          </T>
          <rect x={175} y={200} width={250 * tick} height={3} fill={C.focus} />
          <Tick y={172} k={tick} />
        </>
      )}
    </Svg>
  );
}
