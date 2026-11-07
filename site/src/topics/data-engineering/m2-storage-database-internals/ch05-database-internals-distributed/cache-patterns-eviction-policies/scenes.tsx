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

/** Application, cache and database in one row at `y`; `cf` colours the cache's edge, `co` fades it. */
function Trio({ y, o = 1, cf = C.mocha, co = 1, df = C.mocha }: { y: number; o?: number; cf?: string; co?: number; df?: string }) {
  return (
    <g opacity={o}>
      <Cell x={25} y={y} w={150} label="application" />
      <Cell x={225} y={y} w={150} label="cache" stroke={cf} o={co} />
      <Cell x={425} y={y} w={150} label="database" stroke={df} />
    </g>
  );
}

/** A dot moving from x `a` to x `b` along `y` while `p` runs 0 to 1. */
function Dot({ a, b, y, p, f = C.focus }: { a: number; b: number; y: number; p: number; f?: string }) {
  return <circle cx={lerp(a, b, p)} cy={y} r={5} fill={f} opacity={p > 0 && p < 1 ? 1 : 0} />;
}

// 1 · Hook. The write reaches the cache and is acknowledged at once; it waits in a queue; the cache node dies; the database never gets it.
export function Hook({ t }: StepCtx) {
  const dead = easeOut(seg(t, 2.6, 2.9));
  return (
    <Svg label="a write-behind cache tells the application a write succeeded, then the whole node dies before that write ever reaches the database" h={240}>
      <Trio y={60} o={easeOut(seg(t, 0.1, 0.4))} cf={dead > 0.5 ? C.cherryText : C.mocha} co={1 - 0.5 * dead} />
      <Dot a={180} b={220} y={74} p={clamp(seg(t, 0.4, 0.8))} />
      <Dot a={220} b={180} y={74} p={clamp(seg(t, 0.9, 1.2))} f={C.second} />
      <T x={100} y={112} s={11} f={C.second} a="middle" o={easeOut(seg(t, 1.1, 1.4))}>
        acknowledged
      </T>
      <rect x={285} y={100} width={30} height={12} rx={2} fill={C.second} opacity={easeOut(seg(t, 1.3, 1.6)) * (1 - dead)} />
      <T x={300} y={132} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 1.4, 1.7)) * (1 - dead)}>
        queued
      </T>
      <Cross x={300} y={74} k={dead} />
      <T x={500} y={112} s={11} f={C.cherryText} a="middle" o={easeOut(seg(t, 3.1, 3.4))}>
        never arrives
      </T>
      <Row y={205} label="acknowledged" value="but never written" valueColor={C.cherryText} k={easeOut(seg(t, 3.6, 4.1))} />
    </Svg>
  );
}

// 2 · Predict. The trio with the gap marked; after the answer the write runs on to the database before anything is acknowledged.
export function PredictWhichPattern({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const p = answer !== null ? clamp(seg(s, 0.2, 0.8)) : 0;
  return (
    <Svg label="which pattern would have prevented this loss — a better node, or a different pattern entirely?" h={200}>
      <Trio y={50} o={easeOut(seg(t, 0.1, 0.4))} />
      <path d="M380 64 H420" stroke={C.cherryText} strokeWidth={2} strokeDasharray="4 3" opacity={easeOut(seg(t, 0.6, 0.9)) * (answer !== null ? 0 : 1)} />
      <Dot a={380} b={420} y={64} p={p} />
      <MiniTick x={545} y={98} k={answer !== null ? easeOut(seg(s, 0.8, 1.1)) : 0} />
      <AnswerRow y={140} label="the fix" answer={answer} value="wait for the database" k={easeOut(seg(t, 1.2, 1.7))} />
      <Verdict answer={answer} text="a slower promise, but a true one" />
    </Svg>
  );
}

// 3 · Cache-aside. The application asks the cache and misses, reads the database, writes the result back; later the database changes and the cache never hears.
export function RevealCacheAside({ t }: StepCtx) {
  const ch = easeOut(seg(t, 3.0, 3.3));
  return (
    <Svg label="cache-aside: the application itself checks the cache, misses, reads the database, and writes the result back" h={240}>
      <Trio y={60} o={easeOut(seg(t, 0.1, 0.4))} cf={t > 2.6 ? C.focus : C.mocha} df={ch > 0.5 ? C.second : C.mocha} />
      <Dot a={180} b={220} y={74} p={clamp(seg(t, 0.4, 0.8))} />
      <Cross x={300} y={108} k={easeOut(seg(t, 0.8, 1.1))} />
      <path d={`M100 58 Q300 ${58 - 40 * easeOut(seg(t, 1.2, 1.8))} 500 58`} fill="none" stroke={C.latte} strokeWidth={1.5} strokeDasharray="4 3" opacity={easeOut(seg(t, 1.2, 1.4))} />
      <Dot a={180} b={220} y={84} p={clamp(seg(t, 2.0, 2.6))} f={C.focus} />
      <T x={300} y={140} s={11} f={C.cherryText} a="middle" o={easeOut(seg(t, 3.4, 3.7))}>
        still the old value
      </T>
      <T x={500} y={112} s={11} f={C.second} a="middle" o={ch}>
        changed
      </T>
      <Row y={205} label="who owns the miss" value="the application" k={easeOut(seg(t, 3.9, 4.4))} />
    </Svg>
  );
}

// 4 · Read-through. The same miss, one layer down: application to cache, cache to database, back to cache, back to the application.
export function RevealReadThrough({ t }: StepCtx) {
  return (
    <Svg label="read-through: the cache itself, not the application, owns the exact same miss path" h={240}>
      <Trio y={60} o={easeOut(seg(t, 0.1, 0.4))} cf={C.focus} />
      <Dot a={180} b={220} y={70} p={clamp(seg(t, 0.4, 0.8))} />
      <Dot a={380} b={420} y={70} p={clamp(seg(t, 1.0, 1.5))} f={C.second} />
      <Dot a={420} b={380} y={80} p={clamp(seg(t, 1.6, 2.1))} f={C.second} />
      <Dot a={220} b={180} y={80} p={clamp(seg(t, 2.3, 2.8))} />
      <T x={400} y={112} s={11} f={C.second} a="middle" o={easeOut(seg(t, 1.2, 1.5))}>
        the cache fetches it
      </T>
      <T x={100} y={112} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 2.8, 3.1))}>
        never sees the miss
      </T>
      <Row y={205} label="who owns the miss" value="the cache" valueColor={C.focus} k={easeOut(seg(t, 3.4, 3.9))} />
    </Svg>
  );
}

// 5 · Write-through vs write-behind. Top: the write runs to the database and only then comes back acknowledged.
// Bottom: acknowledged at the cache at once, then a slow dashed trickle toward the database.
export function RevealWriteThroughBehind({ t }: StepCtx) {
  const q = easeInOut(seg(t, 3.6, 4.8));
  return (
    <Svg label="write-through waits for the database write to land; write-behind returns immediately and risks exactly the hook's own loss" h={240}>
      <T x={25} y={40} s={12} f={C.crema} o={easeOut(seg(t, 0.1, 0.4))}>
        write-through
      </T>
      <Trio y={50} o={easeOut(seg(t, 0.1, 0.4))} />
      <Dot a={180} b={220} y={64} p={clamp(seg(t, 0.4, 0.7))} />
      <Dot a={380} b={420} y={64} p={clamp(seg(t, 0.8, 1.2))} />
      <MiniTick x={545} y={88} k={easeOut(seg(t, 1.2, 1.5))} />
      <path d={`M420 92 H${lerp(420, 180, easeInOut(seg(t, 1.5, 2.3)))}`} stroke={C.focus} strokeWidth={2} opacity={easeOut(seg(t, 1.5, 1.6))} />
      <T x={100} y={110} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 2.2, 2.5))}>
        only once it lands
      </T>
      <T x={25} y={140} s={12} f={C.crema} o={easeOut(seg(t, 2.5, 2.8))}>
        write-behind
      </T>
      <Trio y={150} o={easeOut(seg(t, 2.5, 2.8))} />
      <Dot a={180} b={220} y={164} p={clamp(seg(t, 2.7, 3.0))} />
      <Dot a={220} b={180} y={172} p={clamp(seg(t, 3.0, 3.3))} f={C.second} />
      <line x1={380} y1={164} x2={380 + 40 * q} y2={164} stroke={C.cherryText} strokeWidth={2} strokeDasharray="4 3" />
      <T x={300} y={208} s={11} f={C.cherryText} a="middle" o={easeOut(seg(t, 3.5, 3.8))}>
        at once; queued until flushed
      </T>
    </Svg>
  );
}

// 6 · A TTL. The database changes; the cached copy turns stale while its time-to-live bar drains; only at expiry is it fetched again.
export function RevealTTL({ t }: StepCtx) {
  const ttl = clamp(seg(t, 0.6, 3.0));
  const re = clamp(seg(t, 3.0, 3.5));
  return (
    <Svg label="a TTL doesn't make a cached value correct — it bounds how long a wrong value can keep being served" h={240}>
      <Cell x={25} y={60} w={200} label="the cached copy" stroke={re >= 1 ? C.focus : t > 1.2 ? C.cherryText : C.mocha} o={easeOut(seg(t, 0.1, 0.4))} />
      <Cell x={375} y={60} w={200} label="the database" stroke={t > 1.0 ? C.second : C.mocha} o={easeOut(seg(t, 0.1, 0.4))} />
      <T x={475} y={108} s={11} f={C.second} a="middle" o={easeOut(seg(t, 1.0, 1.3))}>
        changed
      </T>
      <T x={125} y={50} s={11} f={C.cherryText} a="middle" o={easeOut(seg(t, 1.2, 1.5)) * (1 - re)}>
        stale, still served
      </T>
      <rect x={25} y={100} width={200 * (1 - ttl)} height={10} rx={3} fill={C.latte} opacity={easeOut(seg(t, 0.4, 0.7))} />
      <T x={25} y={130} s={11} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        time to live
      </T>
      <Dot a={370} b={230} y={74} p={re} f={C.focus} />
      <Row y={200} label="a TTL" value="bounds it, never fixes it" valueColor={C.focus} k={easeOut(seg(t, 3.7, 4.2))} />
    </Svg>
  );
}

// 7 · LRU vs admission. A skewed stream of a few hot keys and many one-offs: plain LRU lets one-offs push the hot keys out;
// the admission gate turns one-offs away and the hot keys stay.
export function RevealLruLfuGap({ t }: StepCtx) {
  const lane = (y: number, gate: boolean, start: number) => {
    const p = clamp(seg(t, start, start + 1.6));
    return (
      <g>
        {Array.from({ length: 5 }, (_, i) => {
          const hotGone = !gate && p > 0.3 + i * 0.12 && i < 3;
          return <rect key={i} x={330 + i * 50} y={y - 13} width={42} height={26} rx={3} fill={C.cocoa} stroke={i < 3 && !hotGone ? C.focus : C.mocha} strokeWidth={1.5} />;
        })}
        {Array.from({ length: 6 }, (_, k) => {
          const q = clamp(p * 2 - k * 0.2);
          const stop = gate ? 300 : 330 + ((k + 3) % 5) * 50 + 21;
          return <circle key={k} cx={lerp(25, stop, q)} cy={y} r={4} fill={C.latte} opacity={q > 0 && (q < 1 || !gate) ? 1 : 0} />;
        })}
        {gate && <line x1={312} y1={y - 18} x2={312} y2={y + 18} stroke={C.second} strokeWidth={3} />}
      </g>
    );
  };
  return (
    <Svg label="a real, measured hit rate: plain LRU against a frequency-gated admission policy, over the identical skewed access pattern" h={250}>
      <T x={25} y={40} s={12} f={C.crema} o={easeOut(seg(t, 0.1, 0.4))}>
        plain LRU
      </T>
      <g opacity={easeOut(seg(t, 0.1, 0.4))}>{lane(70, false, 0.5)}</g>
      <T x={25} y={120} s={12} f={C.crema} o={easeOut(seg(t, 2.1, 2.4))}>
        admission gate, then LRU
      </T>
      <g opacity={easeOut(seg(t, 2.1, 2.4))}>{lane(150, true, 2.4)}</g>
      <Row y={200} label="plain LRU" value="hot keys pushed out" valueColor={C.cherryText} k={easeOut(seg(t, 2.0, 2.4))} />
      <Row y={240} label="with admission" value="a real, measured gap" valueColor={C.focus} k={easeOut(seg(t, 4.2, 4.7))} />
    </Svg>
  );
}

// 8 · Recap. Five rows, one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="cache-aside and read-through, who owns the miss; write-through and write-behind, when a write is acknowledged; a TTL that bounds staleness; a real measured admission gap" h={260}>
      <Row y={40} label="the miss path" value="who fetches it" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={90} label="a write" value="when it's acknowledged" k={easeOut(seg(t, 1.2, 1.7))} />
      <Row y={140} label="write-behind" value="speed, bought with risk" valueColor={C.cherryText} k={easeOut(seg(t, 2.1, 2.6))} />
      <Row y={190} label="a TTL" value="bounds staleness" k={easeOut(seg(t, 3.0, 3.5))} />
      <Row y={240} label="admission" value="matters like eviction" valueColor={C.focus} k={easeOut(seg(t, 3.9, 4.4))} />
    </Svg>
  );
}

// 9 · Prove. One-off keys stream through an open door; after the answer a gate closes on them.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const a = answer !== null ? easeOut(seg(s, 0.2, 0.6)) : 0;
  const v = answer !== null ? easeOut(seg(s, 0.8, 1.2)) : 0;
  const p = (t * 0.5) % 1;
  return (
    <Svg label="a team swaps its eviction policy from LRU to LFU and the hit rate barely moves — what's the likely reason?" h={220}>
      <Row y={40} label="eviction swapped" value="hit rate barely moves" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="still broken" answer={answer} value="what gets let in" k={easeOut(seg(t, 0.4, 0.9))} />
      <rect x={330} y={118} width={245} height={30} rx={4} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0.6, 0.9))} />
      <T x={452} y={138} s={12} f={C.latte} a="middle" o={easeOut(seg(t, 0.6, 0.9))}>
        the cache
      </T>
      {[0, 1, 2].map((i) => {
        const q = (p + i / 3) % 1;
        return <circle key={i} cx={lerp(25, a > 0.5 ? 300 : 330, q)} cy={133} r={4} fill={C.latte} opacity={easeOut(seg(t, 0.8, 1.1)) * (a > 0.5 && q > 0.95 ? 0 : 1)} />;
      })}
      <line x1={312} y1={114} x2={312} y2={152} stroke={C.second} strokeWidth={3} opacity={a} />
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, v)} s={15} f={C.focus} a="middle" o={v}>
            every key was still let in
          </T>
          <rect x={150} y={202} width={300 * v} height={3} fill={C.focus} />
        </>
      )}
    </Svg>
  );
}
