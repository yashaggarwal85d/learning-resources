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

const PX = 2.6; // pixels per percent of all traffic
const CELEB = 6; // the shard the celebrity's own key hashes to

/** Ten shard bars on a baseline at `y`: each carries ordinary traffic (about 6% of the total, the other 60% spread over ten
 * shards); the celebrity's shard adds its 40% on top, scaled by `c`; `salt` spreads that 40% as 4% onto every shard instead. */
function ShardBars({ x0 = 25, y, gap = 55, w = 46, k, c = 1, salt = 0, o = 1 }: { x0?: number; y: number; gap?: number; w?: number; k: number; c?: number; salt?: number; o?: number }) {
  return (
    <g opacity={o}>
      {Array.from({ length: 10 }, (_, i) => {
        const base = 6 * PX * k;
        const extra = (i === CELEB ? 40 * (1 - salt) : 0) * PX * c + 4 * salt * PX;
        return (
          <g key={i}>
            <rect x={x0 + i * gap} y={y - base} width={w} height={base} rx={2} fill={C.latte} />
            <rect x={x0 + i * gap} y={y - base - extra} width={w} height={extra} rx={2} fill={salt > 0 ? C.second : C.cherryText} />
          </g>
        );
      })}
      <line x1={x0 - 5} y1={y} x2={x0 + 9 * gap + w + 5} y2={y} stroke={C.mocha} strokeWidth={1.5} />
    </g>
  );
}

// 1 · Hook. 2,000 users over 10 shards: nine bars rise to an ordinary level; one keeps climbing with the celebrity's 40%.
export function Hook({ t }: StepCtx) {
  return (
    <Svg label="two thousand users, ten shards. One shard still drowns." h={240}>
      <Row y={40} label="2,000 users" value="10 shards" k={easeOut(seg(t, 0.2, 0.7))} />
      <ShardBars y={190} k={easeOut(seg(t, 0.8, 1.6))} c={easeOut(seg(t, 1.8, 3.0))} />
      <Row y={225} label="one shard" value="almost half the work" valueColor={C.cherryText} k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 2 · Predict. Forty keys land evenly, four to a shard slot; after the answer one of them swells into the celebrity.
export function PredictCardinalityAlone({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const a = answer !== null ? easeOut(seg(s, 0.2, 0.7)) : 0;
  return (
    <Svg label="thousands of distinct values, uniformly hashed. Even load?" h={200}>
      <Row y={40} label="distinct keys" value="thousands, hashed" k={easeOut(seg(t, 0.1, 0.5))} />
      {Array.from({ length: 40 }, (_, i) => {
        const celeb = i === 26;
        return (
          <circle
            key={i}
            cx={48 + (i % 10) * 55 + (Math.floor(i / 10) % 2) * 10 - 5}
            cy={66 + Math.floor(i / 10) * 11}
            r={celeb ? 3.5 + 8 * a : 3.5}
            fill={celeb && a > 0 ? C.cherryText : C.latte}
            opacity={easeOut(seg(t, 0.3 + i * 0.02, 0.5 + i * 0.02))}
          />
        );
      })}
      <AnswerRow y={140} label="even load?" answer={answer} value="no, one key can dominate" k={easeOut(seg(t, 1.4, 1.9))} />
      <Verdict answer={answer} text="cardinality counts keys, not traffic" />
    </Svg>
  );
}

// 3 · Cardinality alone, measured. The same bars against a fair-share line; the celebrity's shard is far above it.
export function RevealCardinalityMeasured({ t }: StepCtx) {
  const fair = 190 - 10 * PX;
  return (
    <Svg label="the celebrity's own shard: nearly half, alone." h={250}>
      <Row y={40} label="one user's own share" value="40% of all traffic" valueColor={C.cherryText} k={easeOut(seg(t, 0.2, 0.7))} />
      <ShardBars x0={140} gap={43} w={36} y={190} k={easeOut(seg(t, 0.6, 1.4))} c={easeOut(seg(t, 1.6, 2.6))} />
      <line x1={135} y1={fair} x2={575} y2={fair} stroke={C.focus} strokeWidth={1.5} strokeDasharray="4 3" opacity={easeOut(seg(t, 1.2, 1.5))} />
      <T x={25} y={fair + 4} s={11} f={C.focus} o={easeOut(seg(t, 1.2, 1.5))}>
        fair share
      </T>
      <Row y={230} label="the celebrity's shard" value="over 2× fair" valueColor={C.cherryText} k={easeOut(seg(t, 3.0, 3.5))} />
    </Svg>
  );
}

// 4 · Salting. The celebrity's 40% splits into 40 salted sub-keys and pours out over every shard; all bars settle near fair.
export function RevealSalting({ t }: StepCtx) {
  const sl = easeInOut(seg(t, 1.2, 2.8));
  const fair = 190 - 10 * PX;
  return (
    <Svg label="one key, several salted sub-keys. Its load spreads out." h={250}>
      <Row y={40} label="one key, salted" value="40 sub-keys" valueColor={C.second} k={easeOut(seg(t, 0.2, 0.7))} />
      <ShardBars x0={140} gap={43} w={36} y={190} k={1} c={1} salt={sl} o={easeOut(seg(t, 0.3, 0.6))} />
      <line x1={135} y1={fair} x2={575} y2={fair} stroke={C.focus} strokeWidth={1.5} strokeDasharray="4 3" opacity={easeOut(seg(t, 0.3, 0.6))} />
      <T x={25} y={fair + 4} s={11} f={C.focus} o={easeOut(seg(t, 0.3, 0.6))}>
        fair share
      </T>
      <Row y={230} label="the hottest shard" value="under 1.5× fair" valueColor={C.focus} k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 5 · Secondary indexes. A local-index query fans out to all ten shards; a global-index query reaches only a couple.
export function RevealSecondaryIndexes({ t }: StepCtx) {
  const shard = (y: number, lit: (i: number) => boolean, f: string, o: number) => (
    <g opacity={o}>
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x={150 + i * 43} y={y} width={36} height={22} rx={3} fill={C.cocoa} stroke={lit(i) ? f : C.mocha} strokeWidth={lit(i) ? 2 : 1.2} />
      ))}
    </g>
  );
  const a = clamp(seg(t, 0.8, 1.6));
  const b = clamp(seg(t, 2.8, 3.4));
  return (
    <Svg label="local: ask every shard. Global: ask only the ones that matter." h={230}>
      <T x={25} y={40} s={13} f={C.crema} o={easeOut(seg(t, 0.1, 0.4))}>
        local index
      </T>
      <Cell x={25} y={56} w={105} h={28} label="query" o={easeOut(seg(t, 0.2, 0.5))} />
      {shard(59, () => a >= 1, C.second, easeOut(seg(t, 0.3, 0.6)))}
      {Array.from({ length: 10 }, (_, i) => (
        <circle key={i} cx={lerp(132, 168 + i * 43, a)} cy={70} r={3.5} fill={C.second} opacity={a > 0 && a < 1 ? 1 : 0} />
      ))}
      <T x={150} y={102} s={11} f={C.second} o={easeOut(seg(t, 1.6, 1.9))}>
        asks every shard
      </T>
      <T x={25} y={140} s={13} f={C.crema} o={easeOut(seg(t, 2.4, 2.7))}>
        global index
      </T>
      <Cell x={25} y={156} w={105} h={28} label="query" o={easeOut(seg(t, 2.5, 2.8))} />
      {shard(159, (i) => b >= 1 && (i === 3 || i === 4), C.focus, easeOut(seg(t, 2.6, 2.9)))}
      {[3, 4].map((i) => (
        <circle key={i} cx={lerp(132, 168 + i * 43, b)} cy={170} r={3.5} fill={C.focus} opacity={b > 0 && b < 1 ? 1 : 0} />
      ))}
      <T x={150} y={202} s={11} f={C.focus} o={easeOut(seg(t, 3.5, 3.8))}>
        only the partitions that matter
      </T>
    </Svg>
  );
}

// 6 · Predict #2. A shard splits into two while writes keep coming; after the answer a few in-flight dots turn red, misrouted.
export function PredictPauseWindow({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const a = answer !== null ? easeOut(seg(s, 0.2, 0.6)) : 0;
  const p = (t * 0.6) % 1;
  return (
    <Svg label="a split happens, writes keep arriving. No pause." h={200}>
      <Cell x={25} y={60} w={250} h={28} label="shard-a" o={easeOut(seg(t, 0.1, 0.4))} />
      <Cell x={325} y={60} w={250} h={28} label="shard-b" o={easeOut(seg(t, 0.6, 0.9))} />
      <line x1={300} y1={50} x2={300} y2={98} stroke={C.focus} strokeWidth={2} strokeDasharray="4 3" opacity={easeOut(seg(t, 0.6, 0.9))} />
      <T x={300} y={116} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 0.8, 1.1))}>
        the new boundary
      </T>
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={lerp(25, 260, (p + i * 0.25) % 1)} cy={50} r={4} fill={i % 2 && a > 0.5 ? C.cherryText : C.latte} opacity={easeOut(seg(t, 1.0, 1.3))} />
      ))}
      <AnswerRow y={140} label="in-flight writes" answer={answer} value="some land wrong" k={easeOut(seg(t, 1.3, 1.8))} />
      <Verdict answer={answer} text="routed by the old boundary" />
    </Svg>
  );
}

// 7 · The pause window, measured. Without a pause, red dots land on the wrong shard; with a brief pause, every dot lands right.
export function RevealPauseMeasured({ t }: StepCtx) {
  const lane = (y: number, start: number, bad: boolean) =>
    Array.from({ length: 8 }, (_, k) => {
      const q = clamp((t - start - k * 0.15) / 0.5);
      const toB = k % 2 === 1;
      const wrong = bad && k % 3 === 1;
      const tx = (toB !== wrong ? 510 : 365) + (k % 3) * 8;
      return <circle key={k} cx={lerp(25, tx, q)} cy={y + 40} r={4} fill={wrong ? C.cherryText : C.focus} opacity={q > 0 ? 1 : 0} />;
    });
  const pz = easeOut(seg(t, 2.2, 2.5));
  return (
    <Svg label="no pause: half misroute. A brief pause: zero do." h={240}>
      <T x={25} y={40} s={13} f={C.crema} o={easeOut(seg(t, 0.1, 0.4))}>
        no pause
      </T>
      <Cell x={300} y={50} w={130} label="shard-a" o={easeOut(seg(t, 0.1, 0.4))} />
      <Cell x={445} y={50} w={130} label="shard-b" o={easeOut(seg(t, 0.1, 0.4))} />
      {lane(50, 0.4, true)}
      <Row y={110} label="misrouted" value="over 30%" valueColor={C.cherryText} k={easeOut(seg(t, 1.8, 2.2))} />
      <T x={25} y={150} s={13} f={C.crema} o={pz}>
        a brief pause
      </T>
      <g opacity={pz}>
        <rect x={175} y={140} width={5} height={14} fill={C.second} />
        <rect x={185} y={140} width={5} height={14} fill={C.second} />
      </g>
      <Cell x={300} y={160} w={130} label="shard-a" o={pz} />
      <Cell x={445} y={160} w={130} label="shard-b" o={pz} />
      {lane(160, 2.8, false)}
      <Row y={225} label="misrouted" value="0" valueColor={C.focus} k={easeOut(seg(t, 4.0, 4.4))} />
    </Svg>
  );
}

// 8 · Real systems. Vitess cuts over behind a pause; a CockroachDB range grows and splits in two; DynamoDB lifts a hot item onto its own partition.
export function RevealRealSystems({ t }: StepCtx) {
  const g = easeInOut(seg(t, 1.8, 2.6));
  const sp = easeInOut(seg(t, 2.7, 3.1));
  const hot = easeInOut(seg(t, 3.8, 4.5));
  return (
    <Svg label="Vitess reshards. CockroachDB splits ranges. DynamoDB isolates hot items." h={240}>
      <T x={25} y={55} s={13} f={C.crema} o={easeOut(seg(t, 0.2, 0.5))}>
        Vitess
      </T>
      <Cell x={200} y={38} w={150} h={26} label="keyspace" o={easeOut(seg(t, 0.3, 0.6))} />
      <g opacity={easeOut(seg(t, 0.7, 1.0))}>
        <rect x={366} y={44} width={5} height={14} fill={C.second} />
        <rect x={376} y={44} width={5} height={14} fill={C.second} />
      </g>
      <Cell x={400} y={38} w={175} h={26} label="resharded" stroke={C.focus} o={easeOut(seg(t, 1.0, 1.3))} />
      <T x={25} y={120} s={13} f={C.crema} o={easeOut(seg(t, 1.6, 1.9))}>
        CockroachDB
      </T>
      <rect x={200} y={104} width={lerp(250, 375, g) * (1 - sp) + 183 * sp} height={24} rx={3} fill={C.cocoa} stroke={C.second} strokeWidth={1.5} opacity={easeOut(seg(t, 1.6, 1.9))} />
      <rect x={392} y={104} width={183} height={24} rx={3} fill={C.cocoa} stroke={C.second} strokeWidth={1.5} opacity={sp} />
      <T x={200} y={148} s={11} f={C.second} o={easeOut(seg(t, 3.0, 3.3))}>
        past its size threshold: two ranges
      </T>
      <T x={25} y={190} s={13} f={C.crema} o={easeOut(seg(t, 3.4, 3.7))}>
        DynamoDB
      </T>
      <rect x={200} y={174} width={220} height={26} rx={3} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 3.4, 3.7))} />
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={225 + i * 40} cy={187} r={4} fill={C.latte} opacity={easeOut(seg(t, 3.5, 3.8))} />
      ))}
      <rect x={440} y={174} width={135} height={26} rx={3} fill={C.cocoa} stroke={C.focus} strokeWidth={1.5} opacity={hot} />
      <circle cx={lerp(385, 507, hot)} cy={187} r={6} fill={C.cherryText} opacity={easeOut(seg(t, 3.5, 3.8))} />
      <T x={440} y={222} s={11} f={C.focus} o={easeOut(seg(t, 4.4, 4.7))}>
        a hot item, isolated
      </T>
    </Svg>
  );
}

// 9 · Recap. Five rows, one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="cardinality isn't load. Salting, index scope, the pause: all matter." h={260}>
      <Row y={40} label="cardinality" value="isn't even load" valueColor={C.cherryText} k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={90} label="salting" value="fixes the one hot key" valueColor={C.focus} k={easeOut(seg(t, 1.0, 1.5))} />
      <Row y={140} label="a local index" value="needs the partition key" k={easeOut(seg(t, 1.7, 2.2))} />
      <Row y={190} label="a global index" value="doesn't" k={easeOut(seg(t, 2.3, 2.8))} />
      <Row y={240} label="moving data" value="costs a real pause" valueColor={C.second} k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 10 · Prove. Ten small shard bars; after the answer the chain's shard climbs far above the rest.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const a = answer !== null ? easeOut(seg(s, 0.2, 0.8)) : 0;
  const v = answer !== null ? easeOut(seg(s, 0.9, 1.3)) : 0;
  return (
    <Svg label="millions of customer IDs, uniformly hashed. One is a chain." h={220}>
      <Row y={40} label="millions of customers" value="uniformly hashed" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="the chain's own shard" answer={answer} value="still hot" k={easeOut(seg(t, 0.4, 0.9))} />
      {Array.from({ length: 10 }, (_, i) => {
        const h = 12 * easeOut(seg(t, 0.8, 1.3)) + (i === 4 ? 36 * a : 0);
        return <rect key={i} x={25 + i * 55} y={162 - h} width={46} height={h} rx={2} fill={i === 4 && a > 0 ? C.cherryText : C.latte} />;
      })}
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, v)} s={15} f={C.focus} a="middle" o={v}>
            salt that one key, not every key
          </T>
          <rect x={150} y={202} width={300 * v} height={3} fill={C.focus} />
        </>
      )}
    </Svg>
  );
}
