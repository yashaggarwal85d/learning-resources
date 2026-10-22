import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): caramel = the policy being demonstrated, the chosen answer, the thing
// to look at; cinnamon = the alternative being compared; cherry/cherryText = the bad outcome (a
// dangling pointer, a chunk that can never be reused); taupe/latte = axes and quiet labels; crema =
// data (records, cells). At most two accents per step.

const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

function cellRow(n: number, x0: number, y: number, w: number, filled: number, opacity = 1, colour = C.crema) {
  return Array.from({ length: n }, (_, i) => (
    <rect
      key={i}
      x={x0 + i * (w + 3)}
      y={y}
      width={w}
      height={w}
      rx={3}
      fill={i < filled ? colour : 'none'}
      stroke={i < filled ? colour : C.taupe}
      strokeWidth={1.2}
      opacity={opacity}
    />
  ));
}

// 1 · The doubling array, proved and left open.
export function Opening({ t }: StepCtx) {
  const caps = [1, 2, 4, 8, 16];
  const i = Math.min(caps.length - 1, Math.floor(seg(t, 0.2, 2.6) * caps.length));
  const w = 26;
  return (
    <Svg label="A vector doubling from capacity 1 to 16, with the amortized O(1) bound already proved, and a question mark over why the factor is two" h={300}>
      <T x={30} y={30} s={13} f={C.taupe}>Chapter 1: amortized O(1) append, for any fixed growth factor</T>
      {cellRow(16, 30, 60, w, caps[i])}
      <T x={30} y={110} s={13} f={C.latte}>capacity {caps[i]}</T>
      <T x={300} y={200} s={40} f={C.caramel} a="middle" o={easeOut(seg(t, 2.4, 3.2))}>factor = ?</T>
      <T x={300} y={250} s={14} f={C.crema} a="middle" o={easeOut(seg(t, 2.6, 3.4))}>which one, and why</T>
    </Svg>
  );
}

// 2 · Predict: does the old memory ever come back?
export function ReusePredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const caps = [1, 2, 4, 8];
  return (
    <Svg label="A vector doubling four times, with discarded chunks piling up beside it" h={300}>
      <T x={30} y={28} s={13} f={C.taupe}>discarded chunks</T>
      {caps.map((c, i) => (
        <rect key={i} x={30} y={40 + i * 26} width={c * 18} height={18} rx={3} fill="none" stroke={C.taupe} strokeWidth={1.2} opacity={easeOut(seg(t, 0.2 + i * 0.3, 0.8 + i * 0.3))} />
      ))}
      <T x={30} y={190} s={13} f={C.latte}>next request: capacity 16</T>
      <rect x={30} y={200} width={16 * 18} height={18} rx={3} fill="none" stroke={C.cinnamon} strokeWidth={1.5} opacity={easeOut(seg(t, 1.6, 2.2))} />
      {!answered && <T x={300} y={270} s={28} f={C.caramel} a="middle" o={0.7 + 0.3 * Math.sin(t * 3)}>?</T>}
      {answered && <T x={300} y={270} s={15} f={C.cherryText} a="middle">always one chunk short</T>}
    </Svg>
  );
}

// 3 · Doubling outgrows everything it ever freed.
export function Crawl({ t }: StepCtx) {
  const n = 5;
  const bw = 60;
  return (
    <Svg label="Each freed chunk of a doubling vector, stacked, still falls one chunk short of the next request" h={320}>
      <T x={30} y={28} s={13} f={C.taupe}>freed chunks, stacked (cherry) vs the next request (caramel)</T>
      {Array.from({ length: n }, (_, i) => {
        const h = 10 + i * 10;
        const a = easeOut(seg(t, 0.2 + i * 0.3, 0.7 + i * 0.3));
        const yTop = 260 - Array.from({ length: i }, (_, j) => 10 + j * 10).reduce((s, v) => s + v, 0);
        return <rect key={i} x={60} y={yTop - h} width={bw} height={h} fill={C.cherry} opacity={a} />;
      })}
      <rect x={160} y={260 - 10 * 32} width={bw} height={10 * 32} fill="none" stroke={C.caramel} strokeWidth={1.5} opacity={easeOut(seg(t, 1.8, 2.6))} />
      <T x={60} y={280} s={13} f={C.cherryText} a="start">1+2+4+8+16 = 31</T>
      <T x={160} y={280} s={13} f={C.caramel} a="start">next: 32</T>
      <T x={300} y={25} s={13} f={C.latte} a="end">1 + 2 + &hellip; + 2ⁿ = 2ⁿ⁺¹ &minus; 1</T>
    </Svg>
  );
}

// 4 · A factor under two can reuse a block.
export function Reuse2({ t }: StepCtx) {
  const rows = [
    { g: 1.5, after: 4, colour: C.cinnamon, label: '1.5' },
    { g: 1.45, after: 3, colour: C.cinnamon, label: '1.45' },
    { g: 1.3, after: 2, colour: C.caramel, label: '1.3' },
  ];
  return (
    <Svg label="Three growth factors under two, each eventually letting the vector reuse a previously freed chunk" h={300}>
      {rows.map((r, i) => {
        const a = easeOut(seg(t, 0.2 + i * 0.5, 0.9 + i * 0.5));
        return (
          <g key={r.label} opacity={a}>
            <T x={30} y={50 + i * 70} s={16} f={r.colour} serif>g = {r.label}</T>
            {Array.from({ length: r.after }, (_, j) => (
              <rect key={j} x={110 + j * 34} y={38 + i * 70} width={26} height={26} rx={4} fill="none" stroke={C.taupe} strokeWidth={1.2} />
            ))}
            <T x={110 + r.after * 34 + 14} y={56 + i * 70} s={14} f={r.colour}>reuse after {r.after}</T>
          </g>
        );
      })}
    </Svg>
  );
}

// 5 · Four libraries, four growth policies.
export function Libraries({ t }: StepCtx) {
  const libs = [
    { name: 'GCC libstdc++', rate: 'doubles (g = 2)', colour: C.caramel, caps: [1, 2, 4, 8, 16] },
    { name: 'Folly fbvector', rate: 'g = 1.5', colour: C.cinnamon, caps: [1, 2, 3, 5, 8] },
    { name: 'CPython list', rate: '~1.125x + 6', colour: C.latte, caps: [4, 8, 16, 24, 32] },
    { name: 'Rust Vec', rate: 'no fixed rate documented', colour: C.taupe, caps: [1, 2, 3, 6, 10] },
  ];
  return (
    <Svg label="Four real libraries, four different growth policies, drawn at their real relative rates" h={340}>
      {libs.map((lib, i) => {
        const a = easeOut(seg(t, 0.2 + i * 0.3, 0.8 + i * 0.3));
        const w = 14;
        return (
          <g key={lib.name} opacity={a}>
            <T x={30} y={30 + i * 76} s={14} f={lib.colour}>{lib.name}</T>
            {cellRow(5, 30, 40 + i * 76, w, 5, 1, lib.colour)}
            <T x={30 + 5 * (w + 3) + 14} y={40 + i * 76 + 12} s={13} f={C.latte}>{lib.rate}</T>
          </g>
        );
      })}
    </Svg>
  );
}

// 6 · Predict: what does Rust actually guarantee?
export function RustGuaranteePredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="Rust's Vec growing at an unlabelled rate, with the question of what it actually promises" h={280}>
      <T x={30} y={30} s={13} f={C.taupe}>Vec does not guarantee any particular growth strategy</T>
      {cellRow(10, 30, 50, 22, 6)}
      {!answered && <T x={300} y={160} s={24} f={C.caramel} a="middle" o={0.7 + 0.3 * Math.sin(t * 3)}>what IS promised?</T>}
      {answered && <T x={300} y={160} s={16} f={C.caramel} a="middle" serif>O(1) amortized push</T>}
      <T x={300} y={200} s={13} f={C.latte} a="middle">the bound, not the mechanism</T>
    </Svg>
  );
}

// 7 · Reserve skips the early resizes.
export function Reserve({ t }: StepCtx) {
  const left = Math.min(4, Math.floor(seg(t, 0.2, 2.0) * 5));
  const leftCaps = [1, 2, 4, 8, 16];
  const rightFill = Math.floor(seg(t, 2.2, 3.4) * 16);
  return (
    <Svg label="Appending from empty resizes repeatedly; reserving the final capacity up front resizes once" h={320}>
      <T x={30} y={28} s={13} f={C.taupe}>from empty: resize on every doubling</T>
      {cellRow(16, 30, 40, 22, leftCaps[left])}
      <T x={30} y={170} s={13} f={C.taupe}>reserve(16) first: one allocation, no resize</T>
      {cellRow(16, 30, 182, 22, rightFill, 1, C.caramel)}
      <T x={30} y={270} s={13} f={C.latte}>reallocation happens iff current capacity &lt; n</T>
    </Svg>
  );
}

// 8 · Shrink is a request, not a promise.
export function ShrinkToFit({ t }: StepCtx) {
  const a1 = easeOut(seg(t, 0.2, 1.2));
  const a2 = easeOut(seg(t, 1.6, 2.6));
  return (
    <Svg label="shrink_to_fit as a fork: it may reallocate to a smaller buffer, or may do nothing at all" h={320}>
      <T x={30} y={28} s={13} f={C.taupe}>a vector at low load factor</T>
      {cellRow(16, 30, 40, 18, 3)}
      <T x={300} y={110} s={14} f={C.crema} a="middle" o={a1}>shrink_to_fit()</T>
      <g opacity={a2}>
        {cellRow(3, 30, 170, 18, 3, 1, C.caramel)}
        <T x={30} y={210} s={13} f={C.caramel}>reallocated: capacity now 3</T>
        {cellRow(16, 240, 170, 18, 3, 1, C.taupe)}
        <T x={240} y={210} s={13} f={C.taupe}>or: unchanged, capacity still 16</T>
      </g>
      <T x={30} y={260} s={13} f={C.latte}>non-binding: both are standards-compliant</T>
    </Svg>
  );
}

// 9 · Predict: is a pointer safe after shrink_to_fit?
export function DanglePredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="A pointer into a cell, with the question of whether it survives a call to shrink_to_fit" h={280}>
      {cellRow(6, 30, 60, 30, 6)}
      <T x={30 + 2 * 33 + 6} y={50} s={13} f={C.caramel} a="middle">&darr; a pointer here</T>
      <T x={300} y={180} s={15} f={C.crema} a="middle" o={easeOut(seg(t, 0.4, 1.2))}>shrink_to_fit() called</T>
      {!answered && <T x={300} y={230} s={24} f={C.caramel} a="middle" o={0.7 + 0.3 * Math.sin(t * 3)}>safe?</T>}
      {answered && <T x={300} y={230} s={15} f={C.cherryText} a="middle">only if it reallocated</T>}
    </Svg>
  );
}

// 10 · Every pointer into the old buffer dies at once.
export function Invalidate({ t }: StepCtx) {
  const resized = seg(t, 1.6, 2.2) > 0;
  const flash = clamp(1 - Math.abs(seg(t, 1.6, 2.2) - 1) * 4);
  return (
    <Svg label="Three pointers into a vector, all turning invalid the instant it reallocates" h={320}>
      <T x={30} y={28} s={13} f={C.taupe}>{resized ? 'reallocated: new buffer, old one abandoned' : 'three pointers, one past-the-end iterator'}</T>
      {cellRow(8, 30, 50, 26, 8, resized ? 0.3 : 1, resized ? C.cherry : C.crema)}
      {!resized && [1, 3, 6].map((i) => <T key={i} x={30 + i * 29 + 6} y={100} s={13} f={C.caramel} a="middle">&uarr;</T>)}
      {resized && cellRow(8, 30, 140, 26, 8, 1, C.caramel)}
      {resized && [1, 3, 6].map((i) => (
        <T key={i} x={30 + i * 29 + 6} y={40} s={13} f={C.cherryText} a="middle" o={0.5 + 0.5 * flash}>invalid</T>
      ))}
      <T x={300} y={280} s={13} f={C.latte} a="middle">including the past-the-end iterator</T>
    </Svg>
  );
}

// 11 · Contiguous wins before the first cache miss.
export function Locality({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.6));
  return (
    <Svg label="A contiguous row where one cache line covers several cells, above a scattered preview of the same records as linked nodes" h={320}>
      <T x={30} y={28} s={13} f={C.taupe}>contiguous: one cache line covers B cells</T>
      {cellRow(16, 30, 40, 18, 16)}
      <rect x={30} y={38} width={4 * 21 - 3} height={24} fill="none" stroke={C.caramel} strokeWidth={2} opacity={a} />
      <T x={30} y={100} s={13} f={C.latte} o={a}>one line, several elements, one fetch</T>
      <T x={30} y={180} s={13} f={C.taupe} o={easeOut(seg(t, 1.6, 2.4))}>pointer-chased (next topic): scattered, up to one line per node</T>
      {Array.from({ length: 6 }, (_, i) => (
        <circle key={i} cx={60 + ((i * 97) % 480)} cy={220 + ((i * 53) % 60)} r={10} fill="none" stroke={C.taupe} strokeWidth={1.2} opacity={easeOut(seg(t, 1.8 + i * 0.1, 2.4 + i * 0.1)) * 0.6} />
      ))}
    </Svg>
  );
}

// 12 · Back to the problem.
export function Verdict({ t }: StepCtx) {
  const rows = [
    { name: 'GCC', note: 'crawls forward, never reuses', colour: C.caramel },
    { name: 'fbvector', note: 'trades more copies for reuse', colour: C.cinnamon },
    { name: 'CPython', note: 'gentle growth, resizes often', colour: C.latte },
    { name: 'Rust', note: 'promises the bound, not the rate', colour: C.taupe },
  ];
  return (
    <Svg label="The four policies, side by side, as one trade-off" h={320}>
      {rows.map((r, i) => (
        <g key={r.name} opacity={easeOut(seg(t, 0.2 + i * 0.3, 0.8 + i * 0.3))}>
          <T x={30} y={40 + i * 50} s={15} f={r.colour} serif>{r.name}</T>
          <T x={140} y={40 + i * 50} s={14} f={C.crema}>{r.note}</T>
        </g>
      ))}
      <T x={30} y={270} s={13} f={C.latte}>reserve and shrink_to_fit: precise, non-binding tools</T>
      <T x={30} y={292} s={13} f={C.latte}>reallocation invalidates everything into the old buffer, always</T>
    </Svg>
  );
}

// 13 · Prove it, 1 of 2.
export function ProveIt1({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.6));
  return (
    <Svg label="One million appends: doubling versus a factor of 1.5, resizes and total element copies" h={320}>
      <T x={30} y={40} s={14} f={C.caramel} serif>g = 2</T>
      <T x={160} y={40} s={13} f={C.crema}>20 resizes &middot; {fmt(1048575)} copies</T>
      <rect x={30} y={50} width={200} height={28} fill={C.caramel} opacity={0.25 * a} />
      <T x={30} y={110} s={14} f={C.cinnamon} serif>g = 1.5</T>
      <T x={160} y={110} s={13} f={C.crema}>33 resizes &middot; {fmt(2099719)} copies</T>
      <rect x={30} y={120} width={400} height={28} fill={C.cinnamon} opacity={0.25 * easeOut(seg(t, 0.6, 1.9))} />
      <T x={30} y={190} s={13} f={C.latte}>more than twice the copying, for barely less final capacity</T>
    </Svg>
  );
}

// 14 · Prove it, 2 of 2.
export function ProveIt2({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.6));
  return (
    <Svg label="The same million appends under CPython's own growth formula, resizing far more often" h={320}>
      <T x={30} y={40} s={14} f={C.latte} serif>CPython</T>
      <T x={160} y={40} s={13} f={C.crema}>85 resizes &middot; {fmt(8445096)} copies</T>
      <rect x={30} y={50} width={520} height={28} fill={C.latte} opacity={0.25 * a} />
      <T x={30} y={120} s={13} f={C.taupe}>vs 20 / {fmt(1048575)} for g = 2, 33 / {fmt(2099719)} for g = 1.5</T>
      <T x={30} y={200} s={14} f={C.caramel}>gentler growth is not free: it pays in far more total copying</T>
    </Svg>
  );
}
