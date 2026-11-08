import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Decode, Draw, Reticle, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): caramel = the policy being demonstrated, the chosen answer, the thing
// to look at; cinnamon = the alternative being compared; cherry/cherryText = the bad outcome (a
// dangling pointer, a chunk that can never be reused); taupe/latte = axes and quiet labels; crema =
// data (records, cells). At most two accents per step. Every printed number is asserted in examples.py.

const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

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

function cellRow(n: number, x0: number, y: number, w: number, filled: number, opacity = 1, colour: string = C.crema) {
  return Array.from({ length: n }, (_, i) => (
    <rect key={i} x={x0 + i * (w + 3)} y={y} width={w} height={w} rx={3} fill={i < filled ? colour : 'none'} stroke={i < filled ? colour : C.taupe} strokeWidth={1.2} opacity={opacity} />
  ));
}

/** Chapter 1's rule for a fixed factor g: 0 → 1, else ceil(g·cap), at least cap + 1 (examples.py grow_fixed). */
const growFixed = (cap: number, g: number) => (cap === 0 ? 1 : Math.max(Math.ceil(g * cap - 1e-9), cap + 1));
const capsFixed = (g: number, k: number) => {
  const out = [1];
  while (out.length < k) out.push(growFixed(out[out.length - 1], g));
  return out;
};

// The address line used by the first steps: chunks 1, 2, 4, 8, 16 side by side, as an allocator hands them out.
const U = 17; // units of the canvas per element
const CHUNKS = [1, 2, 4, 8, 16];
const chunkX = (k: number) => 30 + CHUNKS.slice(0, k).reduce((a, b) => a + b, 0) * U;

/** One chunk of `n` cells on the address line: solid while live, dashed and dim once freed. */
function Chunk({ x, y, n, live, filled, freed, f = C.crema }: { x: number; y: number; n: number; live: number; filled: number; freed?: boolean; f?: string }) {
  return (
    <g opacity={live}>
      <rect x={x} y={y} width={n * U - 2} height={22} rx={3} fill="none" stroke={freed ? C.mocha : C.latte} strokeDasharray={freed ? '3 3' : undefined} />
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={x + i * U + 2} y={y + 3} width={U - 6} height={16} rx={2} fill={f} opacity={i < filled && !freed ? 1 : 0} />
      ))}
    </g>
  );
}

// 1 · The doubling array, proved and left open. The vector fills its chunk; when it is full a chunk twice the size
// appears further along the address line, the keys copy across, and the old chunk is freed. 1 → 2 → 4 → 8 → 16.
export function Opening({ t }: StepCtx) {
  const beat = (k: number) => 0.2 + k * 0.5; // chunk k is allocated here
  return (
    <Svg label="A vector doubling from capacity 1 to 16 along the address line, each old chunk freed, and a question mark over why the factor is two" h={300}>
      <T x={30} y={30} s={13} f={C.taupe}>Chapter 1: amortized O(1) append, for any fixed growth factor</T>
      {CHUNKS.map((n, k) => {
        const live = easeOut(seg(t, beat(k), beat(k) + 0.2));
        const copied = k === 0 ? 1 : Math.floor(seg(t, beat(k), beat(k) + 0.3) * CHUNKS[k - 1] + 1e-9);
        const next = k < CHUNKS.length - 1 ? beat(k + 1) : 99;
        const filled = t < next - 0.15 ? copied + Math.floor(seg(t, beat(k) + 0.3, next - 0.15) * (n - copied) + 1e-9) : n;
        return <Chunk key={k} x={chunkX(k)} y={64} n={n} live={live} filled={k === CHUNKS.length - 1 ? Math.min(n, copied + Math.floor(seg(t, beat(k) + 0.3, 2.6) * (n - copied))) : filled} freed={t >= next + 0.3} />;
      })}
      <T x={30} y={118} s={13} f={C.latte}>address →</T>
      <T x={300} y={200} s={40} f={C.caramel} a="middle" o={easeOut(seg(t, 2.6, 3.2))}>factor = ?</T>
      <T x={300} y={250} s={14} f={C.crema} a="middle" o={easeOut(seg(t, 2.8, 3.4))}>which one, and why</T>
    </Svg>
  );
}

// 2 · Predict: does the old memory ever come back? Freed chunks 1, 2, 4, 8 lie behind the vector; the request for 16
// floats above them. After the answer the freed chunks slide together under it, and come up one cell short.
export function ReusePredict({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const slide = easeInOut(seg(s, 0.2, 1.1));
  const short = easeOut(seg(s, 1.1, 1.5));
  const a = easeOut(seg(t, 0.2, 0.8));
  const freed = [1, 2, 4, 8];
  return (
    <Svg label="Freed chunks of 1, 2, 4 and 8 cells, and a request for 16: pushed together they make 15, always one chunk short" h={300}>
      <T x={30} y={40} s={13} f={C.taupe}>next request: 16</T>
      <rect x={30} y={52} width={16 * U - 2} height={22} rx={3} fill="none" stroke={C.caramel} strokeWidth={2} opacity={a} />
      {/* below the chunks, so they never slide across it on their way up */}
      <T x={30} y={186} s={13} f={C.taupe}>freed chunks</T>
      {freed.map((n, k) => {
        const x0 = chunkX(k) + k * 10;
        const x1 = 30 + freed.slice(0, k).reduce((p, q) => p + q, 0) * U;
        return <Chunk key={k} x={lerp(x0, x1, slide)} y={lerp(140, 84, slide)} n={n} live={a} filled={n} freed={answer === null} f={C.latte} />;
      })}
      {answer !== null && <rect x={30 + 15 * U} y={84} width={U - 2} height={22} rx={3} fill={C.cherry} stroke={C.cherryText} opacity={short} />}
      {answer === null && <T x={300} y={240} s={40} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
      {answer !== null && <T x={300} y={240} s={15} f={C.cherryText} a="middle" o={short}>always one chunk short</T>}
    </Svg>
  );
}

// 3 · Doubling outgrows everything it ever freed. Round by round: the freed pile (1, 3, 7, 15, 31) rises beside the next
// request (2, 4, 8, 16, 32), and every round the pile stops exactly one short.
export function Crawl({ t }: StepCtx) {
  const k = Math.min(4, Math.floor(seg(t, 0.2, 2.7) * 5));
  const pile = 2 ** (k + 1) - 1, next = 2 ** (k + 1);
  const H = 6.6; // canvas units per element
  const g = easeOutBack(seg(t, 0.2 + k * 0.5, 0.55 + k * 0.5));
  const base = 280;
  return (
    <Svg label="Freed chunks stacked: 1, then 3, 7, 15, 31, each time one short of the next request: 2, 4, 8, 16, 32" h={330}>
      <T x={60} y={40} s={13} f={C.taupe}>freed, stacked</T>
      <T x={330} y={40} s={13} f={C.taupe}>next request</T>
      {Array.from({ length: k + 1 }, (_, j) => {
        const h = 2 ** j * H;
        const y = base - (2 ** j - 1) * H - h;
        return <rect key={j} x={60} y={y + (j === k ? (1 - g) * -20 : 0)} width={120} height={Math.max(1, h - 1)} rx={2} fill={C.cherry} stroke={C.cherryText} strokeWidth={0.6} opacity={j === k ? clamp(g) : 1} />;
      })}
      <rect x={330} y={base - next * H} width={120} height={next * H} rx={3} fill="none" stroke={C.caramel} strokeWidth={2} />
      <line x1={180} y1={base - pile * H} x2={330} y2={base - pile * H} stroke={C.cherryText} strokeDasharray="3 4" />
      <T x={120} y={base + 24} s={15} f={C.cherryText} a="middle" w={700}>{fmt(pile)}</T>
      <T x={390} y={base + 24} s={15} f={C.caramel} a="middle" w={700}>{fmt(next)}</T>
      <T x={300} y={base + 48} s={13} f={C.crema} a="middle" o={easeOut(seg(t, 2.8, 3.3))}>1 + 2 + … + 2ⁿ = 2ⁿ⁺¹ − 1, one short</T>
    </Svg>
  );
}

// 4 · A factor under two can reuse a block. Three rows of reallocations, one chunk per beat; after Folly's stated count
// an arrow loops back into the freed memory behind the vector.
export function Reuse2({ t }: StepCtx) {
  const rows = [
    { label: '1.5', after: 4 },
    { label: '1.45', after: 3 },
    { label: '1.3', after: 2 },
  ];
  return (
    <Svg label="Folly's figures: growth factor 1.5 reuses freed memory after 4 reallocations, 1.45 after 3, 1.3 after 2" h={320}>
      <T x={30} y={28} s={13} f={C.taupe}>Folly's stated figures: reallocations until reuse</T>
      {rows.map((r, i) => {
        const y = 66 + i * 86;
        const at = 0.3 + i * 1.0;
        const shown = Math.floor(seg(t, at, at + 0.6) * r.after + 1e-9);
        const x = (j: number) => 110 + j * 46;
        return (
          <g key={r.label} opacity={easeOut(seg(t, at - 0.1, at + 0.2))}>
            <T x={30} y={y + 16} s={15} f={C.cinnamon} w={700}>g = {r.label}</T>
            {Array.from({ length: r.after }, (_, j) => (
              <rect key={j} x={x(j)} y={y} width={38} height={22} rx={3} fill={j < shown ? C.cocoa : 'none'} stroke={j < shown ? C.latte : C.mocha} strokeDasharray={j < shown - 1 ? '3 3' : undefined} />
            ))}
            <Draw pts={[[x(r.after - 1) + 38, y + 11], [x(r.after - 1) + 60, y + 11], [x(r.after - 1) + 60, y + 40], [x(0) + 19, y + 40], [x(0) + 19, y + 26]]} t={t} from={at + 0.6} to={at + 0.95} stroke={C.cinnamon} w={2} />
            <T x={x(r.after - 1) + 76} y={y + 16} s={14} f={C.cinnamon} o={easeOut(seg(t, at + 0.85, at + 1.0))}>reuse after {r.after}</T>
          </g>
        );
      })}
    </Svg>
  );
}

// 5 · Four libraries, four growth policies. Each draws its capacity as a staircase over the first appends: GCC doubles,
// Folly multiplies by 1.5, CPython steps by about an eighth (its real pattern), Rust leaves the curve undocumented.
export function Libraries({ t }: StepCtx) {
  const CPY = [0, 4, 8, 16, 24, 32, 40, 52, 64, 76];
  const libs: { name: string; rate: string; caps: number[] | null; f: string }[] = [
    { name: 'GCC libstdc++', rate: 'doubles (g = 2)', caps: capsFixed(2, 8), f: C.caramel },
    { name: 'Folly fbvector', rate: 'g = 1.5', caps: capsFixed(1.5, 12), f: C.cinnamon },
    { name: 'CPython list', rate: '~1.125x + 6', caps: CPY.slice(1), f: C.crema },
    { name: 'Rust Vec', rate: 'no fixed rate documented', caps: null, f: C.taupe },
  ];
  const X0 = 300, XW = 270, MAX = 76; // appends 0..76 across, capacity 0..76 up
  return (
    <Svg label="Four libraries' capacity staircases: GCC doubling, Folly growing by 1.5, CPython's 4, 8, 16, 24, 32, 40, 52, 64, 76, and Rust undocumented" h={340}>
      {libs.map((lib, i) => {
        const at = 0.3 + i * 0.9;
        const y = 76 + i * 80;
        const a = easeOut(seg(t, at, at + 0.3));
        const sx = (v: number) => X0 + (Math.min(v, MAX) / MAX) * XW;
        const sy = (v: number) => y - (Math.min(v, MAX) / MAX) * 52;
        const pts: [number, number][] = [];
        if (lib.caps) {
          let prev = 0;
          for (const c of lib.caps) {
            if (prev >= MAX) break;
            pts.push([sx(prev), sy(prev === 0 ? lib.caps[0] : prev)], [sx(prev), sy(c)]);
            pts.push([sx(Math.min(c, MAX)), sy(c)]);
            prev = c;
          }
        }
        return (
          <g key={lib.name} opacity={a}>
            <T x={30} y={y - 30} s={14} f={lib.f} w={600}>{lib.name}</T>
            <T x={30} y={y - 8} s={13} f={C.latte}>{lib.rate}</T>
            <line x1={X0} y1={y} x2={X0 + XW} y2={y} stroke={C.mocha} />
            {lib.caps ? <Draw pts={pts} t={t} from={at + 0.1} to={at + 0.8} stroke={lib.f} w={2} pen={false} /> : <T x={X0 + XW / 2} y={y - 18} s={20} f={C.taupe} a="middle" o={0.6 + 0.4 * Math.sin(t * 3)}>?</T>}
          </g>
        );
      })}
      <T x={570} y={334} s={13} f={C.taupe} a="end">appends → · height: capacity</T>
    </Svg>
  );
}

// 6 · Predict: what does Rust actually guarantee? The vector grows at a rate nobody labels; after the answer the one
// promise decodes and locks on.
export function RustGuaranteePredict({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const fill = Math.floor(((t * 2.2) % 1) * 4 + 3);
  return (
    <Svg label="Rust's Vec growing at an unlabelled rate; what it promises is O(1) amortized push, not a rate" h={280}>
      <T x={30} y={30} s={13} f={C.taupe}>Vec does not guarantee any particular growth strategy</T>
      {cellRow(10, 30, 50, 22, answer === null ? fill : 6)}
      {answer === null && <T x={300} y={160} s={24} f={C.caramel} a="middle" o={0.7 + 0.3 * Math.sin(t * 3)}>what IS promised?</T>}
      {answer !== null && <Decode x={300} y={160} s={22} f={C.caramel} a="middle" w={700} text="O(1) amortized push" t={s} at={0.1} dur={0.6} />}
      {answer !== null && <Reticle x={300} y={153} w={300} h={44} t={s} at={0.7} />}
      <T x={300} y={220} s={13} f={C.latte} a="middle">the bound, not the mechanism</T>
    </Svg>
  );
}

// 7 · Reserve skips the early resizes. Top: appends from empty; at each doubling the row flashes and a resize tick
// lands. Bottom: reserve(16) takes one buffer, the appends just fill it, and no tick ever lands.
export function Reserve({ t }: StepCtx) {
  const n = Math.floor(seg(t, 0.2, 3.0) * 16 + 1e-9); // elements appended so far (both rows)
  const cap = n === 0 ? 0 : 2 ** Math.ceil(Math.log2(n));
  const resizes = n <= 1 ? 0 : Math.ceil(Math.log2(n));
  const flash = n > 1 && Number.isInteger(Math.log2(n - 1)); // this element just forced a resize
  return (
    <Svg label="Appending from empty resizes at every doubling; reserving the final capacity up front allocates once and never resizes" h={320}>
      <T x={30} y={28} s={13} f={C.taupe}>from empty: resize on every doubling</T>
      {Array.from({ length: 16 }, (_, i) => (
        <rect key={i} x={30 + i * 25} y={40} width={22} height={22} rx={3} fill={i < n ? C.crema : 'none'} stroke={i < cap ? (flash ? C.cherryText : C.latte) : C.mocha} strokeWidth={1.2} opacity={i < cap ? 1 : 0.35} />
      ))}
      <T x={30} y={96} s={13} f={C.latte}>resizes</T>
      {Array.from({ length: 4 }, (_, i) => <rect key={i} x={140 + i * 18} y={84} width={10} height={14} rx={2} fill={C.cherry} stroke={C.cherryText} opacity={i < resizes ? 1 : 0} />)}
      <T x={30} y={170} s={13} f={C.taupe}>reserve(16) first: one allocation, no resize</T>
      {Array.from({ length: 16 }, (_, i) => (
        <rect key={i} x={30 + i * 25} y={182} width={22} height={22} rx={3} fill={i < n ? C.caramel : 'none'} stroke={C.latte} strokeWidth={1.2} opacity={easeOut(seg(t, 0.1, 0.3))} />
      ))}
      <T x={30} y={238} s={13} f={C.latte}>resizes</T>
      <T x={140} y={238} s={13} f={C.caramel} o={easeOut(seg(t, 2.9, 3.3))}>none</T>
      <T x={30} y={290} s={13} f={C.latte}>reallocation happens iff current capacity &lt; n</T>
    </Svg>
  );
}

// 8 · Shrink is a request, not a promise. A 16-slot buffer holding 3; shrink_to_fit forks: in one branch the 3 keys
// fly into a 3-slot buffer and the big one is freed, in the other nothing moves at all. Both are correct.
export function ShrinkToFit({ t }: StepCtx) {
  const call = easeOut(seg(t, 0.4, 0.9));
  const fork = easeOut(seg(t, 1.0, 1.4));
  const fly = easeInOut(seg(t, 1.4, 2.3));
  const w = 18;
  return (
    <Svg label="shrink_to_fit as a fork: it may reallocate to a smaller buffer of capacity 3, or do nothing and keep capacity 16" h={340}>
      <T x={30} y={28} s={13} f={C.taupe}>a vector at low load factor</T>
      {cellRow(16, 30, 40, w, 3, 1 - 0.5 * fly)}
      <T x={300} y={100} s={14} f={C.crema} a="middle" o={call}>shrink_to_fit()</T>
      <g opacity={fork}>
        <path d="M300 108 V124 H44 V251 M44 172 H56 M44 251 H56" stroke={C.mocha} fill="none" />
      </g>
      <g opacity={fork}>
        <rect x={60} y={160} width={3 * (w + 3) + 3} height={w + 6} rx={4} fill="none" stroke={C.caramel} strokeWidth={1.5} />
        {[0, 1, 2].map((i) => (
          <rect key={i} x={lerp(30 + i * (w + 3), 63 + i * (w + 3), fly)} y={lerp(40, 163, fly)} width={w} height={w} rx={3} fill={C.caramel} opacity={fly > 0 ? 1 : 0} />
        ))}
        <T x={60} y={214} s={13} f={C.caramel}>may reallocate: capacity 3</T>
        {cellRow(16, 60, 244, 14, 3, 1, C.latte)}
        <T x={60} y={290} s={13} f={C.latte}>or do nothing: capacity 16</T>
      </g>
      <T x={300} y={326} s={13} f={C.latte} a="middle" o={easeOut(seg(t, 2.6, 3.2))}>non-binding: both are standards-compliant</T>
    </Svg>
  );
}

// 9 · Predict: is a pointer safe after shrink_to_fit? A pointer aims at a cell. After the answer the step forks: where the
// call reallocated, the pointer is left aiming at freed memory (red, crossed); where it did not, it is still good.
export function DanglePredict({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const fork = easeOut(seg(s, 0.1, 0.6));
  const x = easeOut(seg(s, 0.6, 1.0));
  return (
    <Svg label="A pointer into the vector before shrink_to_fit: it dangles if the call reallocated, and stays valid if it did not" h={300}>
      <T x={30} y={40} s={13} f={C.crema}>↓ a pointer here</T>
      {cellRow(6, 30, 52, 26, 4)}
      <T x={300} y={124} s={14} f={C.crema} a="middle" o={easeOut(seg(t, 0.4, 0.9))}>shrink_to_fit() called</T>
      {answer === null && <T x={300} y={200} s={26} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>safe?</T>}
      {answer !== null && (
        <g opacity={fork}>
          <T x={150} y={170} s={14} f={C.cherryText} a="middle">if it reallocated</T>
          <path d="M150 182 l0 30" stroke={C.cherryText} strokeWidth={2} />
          <path d={`M140 222 l${20 * x} ${20 * x} M160 222 l${-20 * x} ${20 * x}`} stroke={C.cherryText} strokeWidth={3} />
          <T x={150} y={268} s={13} f={C.cherryText} a="middle">dangling</T>
          <T x={450} y={170} s={14} f={C.caramel} a="middle">if it did not</T>
          <path d="M450 182 l0 30" stroke={C.caramel} strokeWidth={2} />
          <path d="M440 232 l7 8 l14 -18" stroke={C.caramel} strokeWidth={3} fill="none" strokeDasharray="40" strokeDashoffset={40 * (1 - x)} />
          <T x={450} y={268} s={13} f={C.caramel} a="middle">still valid</T>
        </g>
      )}
    </Svg>
  );
}

// 10 · Every pointer into the old buffer dies at once. Three pointers aim into the buffer (one just past the end). The
// reallocation fires: the keys fly to the new buffer below, the old one goes red, and all three pointers break together.
export function Invalidate({ t }: StepCtx) {
  const fly = easeInOut(seg(t, 1.4, 2.2));
  const dead = easeOut(seg(t, 2.2, 2.5));
  const w = 28;
  const ptrs = [0, 3, 8];
  return (
    <Svg label="Three pointers into the old buffer, including the past-the-end iterator, all become invalid the instant the buffer is reallocated" h={320}>
      <T x={30} y={30} s={13} f={dead > 0.5 ? C.cherryText : C.taupe}>{dead > 0.5 ? 'old buffer abandoned' : 'three pointers into the vector'}</T>
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={30 + i * (w + 3)} y={70} width={w} height={w} rx={3} fill={dead > 0 ? C.cherry : C.cocoa} stroke={dead > 0 ? C.cherryText : C.latte} opacity={1 - 0.4 * dead} />
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={30 + i * (w + 3) + 3} y={lerp(73, 193, fly)} width={w - 6} height={w - 6} rx={2} fill={C.crema} opacity={fly > 0 && fly < 1 ? 1 : fly >= 1 ? 1 : 0} />
      ))}
      {Array.from({ length: 16 }, (_, i) => (
        <rect key={i} x={30 + i * (w + 3)} y={190} width={w} height={w} rx={3} fill="none" stroke={C.caramel} opacity={easeOut(seg(t, 1.0, 1.4))} />
      ))}
      {ptrs.map((p, i) => {
        const x = 30 + p * (w + 3) + w / 2;
        const ok = easeOut(seg(t, 0.2 + i * 0.3, 0.5 + i * 0.3));
        return (
          <g key={i} opacity={ok}>
            <path d={`M${x} 42 L${x} 64 M${x - 5} 58 L${x} 64 L${x + 5} 58`} stroke={dead > 0.5 ? C.cherryText : C.crema} strokeWidth={2} fill="none" />
            {dead > 0 && <path d={`M${x - 7} 46 l${14 * dead} ${14 * dead} M${x + 7} 46 l${-14 * dead} ${14 * dead}`} stroke={C.cherryText} strokeWidth={2.5} />}
          </g>
        );
      })}
      <T x={300} y={140} s={14} f={C.cherryText} a="middle" o={dead}>all three now invalid</T>
      <T x={300} y={280} s={13} f={C.latte} a="middle" o={easeOut(seg(t, 2.8, 3.4))}>including the past-the-end iterator</T>
    </Svg>
  );
}

// 11 · Contiguous wins before the first cache miss. Top: a cache-line bracket sweeps the vector, eight cells per fetch.
// Bottom: the same records as scattered nodes; the walk hops node to node and every hop is its own fetch.
export function Locality({ t }: StepCtx) {
  const sweep = seg(t, 0.3, 1.5);
  const lines = Math.min(2, Math.floor(sweep * 2 + 1e-9)) + (sweep > 0 ? 1 : 0);
  const nodes: [number, number][] = [
    [60, 210], [180, 250], [110, 170], [300, 230], [250, 180], [420, 260], [380, 190], [520, 220],
  ];
  const hops = Math.floor(seg(t, 1.8, 3.2) * 8 + 1e-9);
  return (
    <Svg label="One cache line fetch brings eight contiguous cells; scattered nodes cost up to one cache line fetch each" h={320}>
      <T x={30} y={28} s={13} f={C.taupe}>contiguous: one cache line covers 8 cells</T>
      {Array.from({ length: 24 }, (_, i) => (
        <rect key={i} x={30 + i * 22} y={42} width={19} height={19} rx={2} fill={i < lines * 8 ? C.crema : 'none'} stroke={C.latte} strokeWidth={1} />
      ))}
      {sweep > 0 && <rect x={28 + Math.min(2, Math.floor(sweep * 3 - 1e-9)) * 8 * 22} y={38} width={8 * 22 - 1} height={27} rx={3} fill="none" stroke={C.caramel} strokeWidth={2} />}
      <T x={30} y={92} s={13} f={C.latte}>fetches</T>
      {Array.from({ length: lines }, (_, i) => <rect key={i} x={124 + i * 14} y={82} width={9} height={12} rx={2} fill={C.caramel} />)}
      <T x={30} y={140} s={13} f={C.taupe}>pointer-chased (next topic): scattered</T>
      <Draw pts={nodes} t={t} from={1.8} to={3.2} stroke={C.mocha} w={1.5} pen={false} />
      {nodes.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={9} fill={i < hops ? C.cinnamon : 'none'} stroke={C.latte} />
      ))}
      <T x={30} y={300} s={13} f={C.latte}>fetches</T>
      {Array.from({ length: hops }, (_, i) => <rect key={i} x={124 + i * 14} y={290} width={9} height={12} rx={2} fill={C.cinnamon} />)}
    </Svg>
  );
}

// 12 · Back to the problem. Four verdicts, each with its motion: GCC's chunks crawl forward, fbvector loops back into
// freed memory, CPython takes many small steps, Rust holds only the bound.
export function Verdict({ t }: StepCtx) {
  const rows = [
    { name: 'GCC', note: 'crawls forward, never reuses', colour: C.caramel },
    { name: 'fbvector', note: 'trades more copies for reuse', colour: C.cinnamon },
    { name: 'CPython', note: 'gentle growth, resizes often', colour: C.crema },
    { name: 'Rust', note: 'promises the bound, not the rate', colour: C.latte },
  ];
  return (
    <Svg label="Where the four libraries land: GCC crawls forward, fbvector reuses, CPython resizes often, Rust promises only the bound; reallocation invalidates the old buffer" h={330}>
      {rows.map((r, i) => {
        const at = 0.2 + i * 0.6;
        const a = easeOut(seg(t, at, at + 0.4));
        const y = 40 + i * 56;
        const m = seg(t, at + 0.2, at + 1.0);
        return (
          <g key={r.name} opacity={a}>
            <T x={30} y={y + 16} s={14} f={r.colour} w={600}>{r.name}</T>
            <T x={30} y={y + 38} s={13} f={C.latte}>{r.note}</T>
            {i === 0 && [1, 2, 4].map((n, k) => <rect key={k} x={360 + [0, 16, 48][k]} y={y + 2} width={n * 14} height={14} rx={2} fill="none" stroke={C.caramel} opacity={m * 3 > k ? 1 : 0} strokeDasharray={m * 3 > k + 1 ? '2 2' : undefined} />)}
            {i === 1 && <Draw pts={[[360, y + 10], [520, y + 10], [520, y + 26], [370, y + 26]]} t={m} from={0} to={1} stroke={C.cinnamon} w={2} />}
            {i === 2 && Array.from({ length: 10 }, (_, k) => <rect key={k} x={360 + k * 16} y={y + 22 - k * 2} width={12} height={4 + k * 2} rx={1} fill={C.crema} opacity={m * 10 > k ? 1 : 0} />)}
            {i === 3 && <T x={360} y={y + 18} s={15} f={C.latte} serif o={m}>O(1) amortized</T>}
          </g>
        );
      })}
      <line x1={30} y1={262} x2={570} y2={262} stroke={C.mocha} opacity={easeOut(seg(t, 2.6, 3.0))} />
      <T x={30} y={288} s={13} f={C.latte} o={easeOut(seg(t, 2.8, 3.3))}>reserve, shrink_to_fit: precise, non-binding</T>
      <T x={30} y={310} s={13} f={C.cherryText} o={easeOut(seg(t, 3.1, 3.6))}>reallocation invalidates the old buffer, always</T>
    </Svg>
  );
}

/** A race row: resizes tick along the bar while the copies count up to their total. */
function Race({ y, label, resizes, copies, max, t, at, f }: { y: number; label: string; resizes: number; copies: number; max: number; t: number; at: number; f: string }) {
  const k = easeInOut(seg(t, at, at + 1.6));
  const W = 540 * (copies / max);
  return (
    <g opacity={easeOut(seg(t, at - 0.2, at))}>
      <T x={30} y={y} s={14} f={f} w={600}>{label}</T>
      <T x={570} y={y} s={14} f={C.crema} a="end">{Math.round(resizes * k)} resizes · {fmt(copies * k)} copies</T>
      <rect x={30} y={y + 10} width={540} height={18} rx={4} fill={C.cocoa} />
      <rect x={30} y={y + 10} width={W * k} height={18} rx={4} fill={f} opacity={0.85} />
      {Array.from({ length: Math.round(resizes * k) }, (_, i) => <rect key={i} x={30 + (W * (i + 1)) / resizes - 1} y={y + 32} width={1.5} height={6} fill={C.latte} />)}
    </g>
  );
}

// 13 · Prove it, 1 of 2: a million appends raced under g = 2 and g = 1.5.
export function ProveIt1({ t }: StepCtx) {
  return (
    <Svg label="A million appends: g = 2 makes 20 resizes and 1,048,575 copies; g = 1.5 makes 33 resizes and 2,099,719 copies" h={300}>
      <Race y={50} label="g = 2" resizes={20} copies={1048575} max={2099719} t={t} at={0.3} f={C.caramel} />
      <Race y={140} label="g = 1.5" resizes={33} copies={2099719} max={2099719} t={t} at={1.0} f={C.cinnamon} />
      <T x={30} y={240} s={13} f={C.latte} o={easeOut(seg(t, 2.8, 3.3))}>more than twice the copying,</T>
      <T x={30} y={262} s={13} f={C.latte} o={easeOut(seg(t, 2.8, 3.3))}>for barely less final capacity</T>
    </Svg>
  );
}

// 14 · Prove it, 2 of 2: CPython's formula against the same million appends; g = 2 and g = 1.5 stay on as scale.
export function ProveIt2({ t }: StepCtx) {
  return (
    <Svg label="CPython's formula on a million appends: 85 resizes and 8,445,096 copies, against 1,048,575 for g = 2 and 2,099,719 for g = 1.5" h={320}>
      <Race y={40} label="g = 2" resizes={20} copies={1048575} max={8445096} t={t + 2} at={0} f={C.caramel} />
      <Race y={110} label="g = 1.5" resizes={33} copies={2099719} max={8445096} t={t + 2} at={0} f={C.cinnamon} />
      <Race y={180} label="CPython" resizes={85} copies={8445096} max={8445096} t={t} at={0.4} f={C.crema} />
      <T x={30} y={270} s={13} f={C.latte} o={easeOut(seg(t, 2.6, 3.1))}>gentler growth is not free:</T>
      <T x={30} y={292} s={13} f={C.latte} o={easeOut(seg(t, 2.6, 3.1))}>it pays in far more copying</T>
    </Svg>
  );
}
