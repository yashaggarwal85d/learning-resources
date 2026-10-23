import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): caramel = the mechanism in focus (the group compare, the
// fingerprint match); cinnamon = the compared alternative (the naive scan, the three adopters);
// cherry = the one failure/discard frame (a false match, a missed cache line). At most two
// accents per step.

function cell(x: number, y: number, w: number, h: number, colour = C.crema, opacity = 1) {
  return <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} rx={3} fill="none" stroke={colour} strokeWidth={1.4} opacity={opacity} />;
}

function fill(x: number, y: number, w: number, h: number, colour = C.caramel, opacity = 1) {
  return <rect key={`${x}-${y}-f`} x={x} y={y} width={w} height={h} rx={3} fill={colour} opacity={opacity} />;
}

// 1 · Opening: the probe sequence dissolving into a single wide group compare
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.3));
  return (
    <Svg label="Topic 18's probe sequence hopping one slot at a time, dissolving into a single wide SIMD compare sweeping an entire group of slots at once" h={300}>
      <T x={30} y={26} s={13} f={C.latte}>before: one slot at a go</T>
      {[0, 1, 2, 3].map((i) => (
        <g key={i} opacity={1 - a}>
          {cell(30 + i * 40, 50, 32, 24, C.cherry, 0.7)}
        </g>
      ))}
      <T x={30} y={220} s={13} f={C.caramel} o={a}>now: a whole group, one instruction</T>
      {Array.from({ length: 8 }, (_, i) => fill(30 + i * 24, 230, 18, 20, C.caramel, a))}
    </Svg>
  );
}

// 2 · Forcing problem: the pointer/allocation cost and the cache-miss cost
export function ForcingProblem({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  const b = easeOut(seg(t, 0.4, 1.2));
  return (
    <Svg label="A chained table's per-node pointer and allocation overhead, beside a cache-miss-heavy probe walk" h={320}>
      <T x={30} y={24} s={13} f={C.latte}>chaining: a pointer + allocation per entry</T>
      {[0, 1, 2].map((i) => (
        <g key={i} opacity={a}>
          <circle cx={60} cy={56 + i * 36} r={7} fill="none" stroke={C.cherry} strokeWidth={1.4} />
          {i < 2 && <line x1={60} y1={63 + i * 36} x2={60} y2={56 + (i + 1) * 36 - 7} stroke={C.cherry} strokeWidth={1.4} />}
        </g>
      ))}
      <T x={30} y={190} s={13} f={C.latte} o={b}>open addressing: a probe walk, almost always a cache miss</T>
      {Array.from({ length: 6 }, (_, i) => cell(30 + i * 36, 210, 28, 22, C.cherry, 0.5 + 0.1 * (i % 2)))}
      <T x={30} y={270} s={13} f={C.caramel} o={b}>both real costs this topic avoids</T>
    </Svg>
  );
}

// 3 · Predict: how many slots does one SIMD compare instruction test?
export function GroupPredictViz({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="One group of 16 slots and its control-byte row; the question of how many of those 16 one SIMD compare instruction actually tests" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>one group, 16 slots, 16 control bytes</T>
      {Array.from({ length: 16 }, (_, i) => cell(30 + i * 20, 50, 14, 20, C.crema, 0.7))}
      {!answered && <T x={30} y={270} s={15} f={C.caramel} o={0.7 + 0.3 * Math.sin(t * 3)}>make your prediction</T>}
      {answered && (
        <>
          <T x={30} y={140} s={13} f={C.caramel}>all 16, in one instruction</T>
          <T x={30} y={162} s={13} f={C.latte}>occupied or not — the control byte says which matter</T>
        </>
      )}
    </Svg>
  );
}

// 4 · H1/H2 split
export function H1H2Split({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  const b = easeOut(seg(t, 0.5, 1.3));
  return (
    <Svg label="One hash value splitting into H1 (which group to probe) and H2 (a one-byte fingerprint stored in the control array)" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>one hash value</T>
      {fill(30, 36, 220, 18, C.crema, 1)}
      <T x={30} y={90} s={13} f={C.caramel} o={a}>H1: picks the group to probe</T>
      {fill(30, 100, 160 * a, 16, C.caramel, Math.max(0.3, a))}
      <T x={30} y={150} s={13} f={C.cinnamon} o={b}>H2: a one-byte fingerprint, stored per slot</T>
      {fill(30, 160, 40 * b, 16, C.cinnamon, Math.max(0.3, b))}
    </Svg>
  );
}

// 5 · Group match: the fingerprint swept across a whole group at once
export function GroupMatch({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  const matchIdx = 5;
  return (
    <Svg label="The control byte row for a group, a query's H2 fingerprint compared against all of them in one highlighted sweep, non-matching lanes fading, matching lane staying lit" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>query fingerprint vs. the whole group, at once</T>
      {Array.from({ length: 16 }, (_, i) => {
        const isMatch = i === matchIdx;
        const o = isMatch ? 1 : Math.max(0.2, 1 - a);
        return cell(30 + i * 20, 50, 14, 20, isMatch ? C.caramel : C.crema, o);
      })}
      <T x={30} y={200} s={13} f={C.caramel} o={a}>one lane matches — the only real candidate</T>
      <T x={30} y={222} s={13} f={C.latte} o={a}>everyone else rejected by one byte, no key touched</T>
    </Svg>
  );
}

// 6 · Predict: odds of a false fingerprint match
export function FingerprintPredictViz({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="A single 7-bit fingerprint byte beside a wrong candidate's own fingerprint, asking how often the two coincide by chance" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>7 bits &rarr; 128 possible fingerprint values</T>
      {fill(30, 50, 60, 24, C.caramel, 1)}
      {fill(120, 50, 60, 24, C.cinnamon, 0.8)}
      {!answered && <T x={30} y={270} s={15} f={C.caramel} o={0.7 + 0.3 * Math.sin(t * 3)}>make your prediction</T>}
      {answered && (
        <>
          <T x={30} y={140} s={13} f={C.caramel}>about 1 in 128</T>
          <T x={30} y={162} s={13} f={C.latte}>rare, but why a real comparison still has to run</T>
        </>
      )}
    </Svg>
  );
}

// 7 · Fingerprint odds, measured
export function FingerprintOdds({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  return (
    <Svg label="A 7-bit H2 fingerprint's own collision odds (1/128) drawn as a small fraction of lit candidates among many groups" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>20,000 lookups for keys never inserted</T>
      {Array.from({ length: 20 }, (_, i) => fill(30 + i * 11, 50, 8, 16, i === 1 ? C.cherry : C.crema, i === 1 ? a : 0.4))}
      <T x={30} y={100} s={13} f={C.cherry} o={a}>measured false-match rate tracks 1/128</T>
      <T x={30} y={122} s={13} f={C.latte} o={a}>the fingerprint doesn&rsquo;t replace the comparison</T>
      <T x={30} y={144} s={13} f={C.latte} o={a}>it just makes paying for one incredibly rare</T>
    </Svg>
  );
}

// 8 · Three real adopters
export function ThreeAdopters({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.15, 0.9));
  const b = easeOut(seg(t, 0.4, 1.15));
  const c = easeOut(seg(t, 0.65, 1.4));
  return (
    <Svg label="Three real logos/names side by side: Abseil's flat_hash_map, Rust's std::HashMap via hashbrown, Go's built-in map since Go 1.24, each dated and sourced" h={320}>
      <T x={30} y={30} s={13} f={C.caramel} o={a}>Abseil `flat_hash_map` — 2017/2018</T>
      <T x={30} y={110} s={13} f={C.caramel} o={b}>Rust `std::HashMap` (via `hashbrown`) — since 1.36</T>
      <T x={30} y={190} s={13} f={C.caramel} o={c}>Go&rsquo;s built-in map — since Go 1.24</T>
      <T x={30} y={270} s={13} f={C.latte} o={c}>three real adopters, each checked at research time</T>
    </Svg>
  );
}

// 9 · Prove it
export function ProveIt({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  const b = easeOut(seg(t, 0.4, 1.2));
  const c = easeOut(seg(t, 0.6, 1.4));
  return (
    <Svg label="The three adopters recapped, beside the measured group-compare-vs-byte-scan asymmetry on a packed group" h={340}>
      <T x={30} y={24} s={13} f={C.crema}>Abseil (2017/2018), Rust (1.36+), Go (1.24+)</T>
      {fill(30, 36, 220 * a, 14, C.cinnamon, Math.max(0.3, a))}
      <T x={30} y={96} s={13} f={C.crema}>one group, nearly full (15/16), one miss lookup</T>
      {fill(30, 108, 20 * b, 16, C.caramel, Math.max(0.3, b))}
      <T x={60} y={120} s={12} f={C.latte} o={b}>vectorized: 1 instruction</T>
      {fill(30, 150, 160 * c, 16, C.cherry, Math.max(0.3, c))}
      <T x={200} y={162} s={12} f={C.latte} o={c}>naive: 16 byte-compares</T>
      <T x={30} y={220} s={13} f={C.latte}>same correctness, far fewer instructions</T>
    </Svg>
  );
}
