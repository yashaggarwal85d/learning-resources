import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): caramel = the mechanism in focus (the hash box, the keyed/PRF
// tier); cinnamon = the compared alternative (the non-crypto tier, the un-keyed formula); cherry
// = the one failure/discard frame (the flooded bucket); taupe/latte = axes, quiet labels; crema =
// records/keys. At most two accents per step.

function cell(x: number, y: number, w: number, h: number, colour = C.crema, opacity = 1) {
  return <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} rx={3} fill="none" stroke={colour} strokeWidth={1.4} opacity={opacity} />;
}

// 1 · Finding a slot without scanning every record
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 1.6));
  return (
    <Svg label="A row of records scanned one at a time, then the same key turned directly into a slot by a hash function box" h={300}>
      <T x={30} y={28} s={13} f={C.latte}>find this key's record: scan every slot, one at a time</T>
      {Array.from({ length: 6 }, (_, i) => cell(30 + i * 36, 48, 28, 26, C.cinnamon, 0.6))}
      <T x={30} y={150} s={13} f={C.caramel} o={a}>h(key) &rarr; slot, directly, no comparisons</T>
      {cell(30, 170, 90, 28, C.caramel, a)}
      <T x={140} y={189} s={13} f={C.caramel} o={a}>&rarr;</T>
      {cell(170, 170, 28, 28, C.caramel, a)}
      <T x={30} y={240} s={13} f={C.latte}>every structure in this chapter needs this first</T>
    </Svg>
  );
}

// 2 · The simplest tier: fast, and no promises about who chose the keys
export function NonCryptoSpeed({ t }: StepCtx) {
  const bars = [
    { name: 'XXH3', w: 260 },
    { name: 'wyhash', w: 230 },
    { name: 'FxHash', w: 250 },
    { name: 'zlib.crc32 (measured)', w: 200 },
  ];
  return (
    <Svg label="A bar race of fast non-cryptographic hashes, all built for raw speed, none of them designed against a chosen-key attacker" h={300}>
      <T x={30} y={26} s={13} f={C.latte}>built for one thing: raw speed on ordinary keys</T>
      {bars.map((b, i) => {
        const k = easeOut(seg(t, 0.3 + i * 0.25, 1.1 + i * 0.25));
        return (
          <g key={b.name}>
            <T x={30} y={54 + i * 40} s={12} f={C.crema}>{b.name}</T>
            {cell(30, 60 + i * 40, b.w * k, 20, i === 3 ? C.caramel : C.cinnamon, Math.max(0.25, k))}
          </g>
        );
      })}
      <T x={30} y={250} s={13} f={C.cherry} o={easeOut(seg(t, 1.6, 2.4))}>none designed to resist a chosen-key opponent</T>
    </Svg>
  );
}

// 3 · Predict: an attacker chooses every key. What happens?
export function FloodPredictViz({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="The same fast-hash table, now fed a stream of keys an attacker chooses, asking what happens to its performance" h={300}>
      {!answered && (
        <>
          {cell(30, 50, 90, 28, C.cinnamon)}
          <T x={140} y={69} s={13} f={C.cherry}>?</T>
          <T x={30} y={120} s={13} f={C.latte}>a stream of attacker-chosen keys, arriving</T>
          {Array.from({ length: 5 }, (_, i) => cell(30 + i * 26, 140, 20, 20, C.cherry, 0.5))}
          <T x={30} y={270} s={15} f={C.caramel} o={0.7 + 0.3 * Math.sin(t * 3)}>what happens to the table?</T>
        </>
      )}
      {answered && (
        <>
          {cell(30, 60, 90, 28, C.cherry)}
          <T x={140} y={79} s={13} f={C.cherry}>every key, one bucket</T>
          <T x={30} y={270} s={13} f={C.latte}>performance collapses to one giant list &mdash; O(n) per lookup</T>
        </>
      )}
    </Svg>
  );
}

// 4 · The attack this fast hash never promised to survive
export function HashDoSReveal({ t }: StepCtx) {
  const n = Math.min(6, Math.floor(seg(t, 0.2, 1.8) * 6) + 1);
  return (
    <Svg label="Two chained tables fed the same number of keys: random keys spread evenly, crafted colliding keys pile into one chain" h={320}>
      <T x={30} y={24} s={13} f={C.latte}>random keys: chains stay short</T>
      {Array.from({ length: n }, (_, i) => (
        <g key={`r${i}`}>{cell(30 + i * 46, 38, 36, 20, C.crema, 0.7)}</g>
      ))}
      <T x={30} y={100} s={13} f={C.cherry}>crafted colliding keys: one chain, everything</T>
      {cell(30, 116, 30 + n * 42, 22, C.cherry, 0.9)}
      <T x={30} y={180} s={13} f={C.crema}>4,000 colliding keys:  428&ndash;435 ms</T>
      <T x={30} y={202} s={13} f={C.crema}>4,000 random keys:       9&ndash;10 ms</T>
      <T x={30} y={224} s={14} f={C.cherry} w={700}>flood ratio: ~45&times; slower, measured</T>
      <T x={30} y={270} s={13} f={C.latte}>1999 dnscache &middot; Crosby &amp; Wallach 2003 &middot; Klink &amp; W&auml;lde 2011</T>
      <T x={30} y={292} s={13} f={C.latte}>500 KB of POST data, one PHP5 server, a full minute of CPU</T>
    </Svg>
  );
}

// 5 · Predict: does a random seed fix it?
export function SeedPredictViz({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="The same weak hash with a small padlock labelled random per-process seed, asking whether that fixes the collision flood" h={300}>
      {cell(30, 50, 90, 28, C.cinnamon)}
      <T x={140} y={68} s={16} f={C.caramel}>&#128274;</T>
      <T x={30} y={102} s={12} f={C.crema}>a random seed, chosen once per process,</T>
      <T x={30} y={120} s={12} f={C.crema}>unknown to the attacker</T>
      {!answered && <T x={30} y={270} s={15} f={C.caramel} o={0.7 + 0.3 * Math.sin(t * 3)}>does that fix it?</T>}
      {answered && (
        <>
          <T x={30} y={180} s={13} f={C.caramel}>not by itself &mdash; if the formula is still linear,</T>
          <T x={30} y={202} s={13} f={C.caramel}>timing your server can still reveal the seed</T>
        </>
      )}
    </Svg>
  );
}

// 6 · What a random seed actually buys you
export function SeedReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.3));
  return (
    <Svg label="Top: the crafted colliding keys scatter from one bucket to 256 of 256 once a per-process seed is keyed in. Bottom: a timing side-channel, one probe at a time, narrowing a guess about a linear formula" h={380}>
      <T x={30} y={22} s={13} f={C.latte}>before the seed: 1 of 256 buckets used</T>
      {cell(30, 34, 90, 20, C.cherry)}
      <T x={30} y={80} s={13} f={C.caramel} o={a}>after a per-process seed: 256 of 256 buckets</T>
      {Array.from({ length: 12 }, (_, i) => cell(30 + i * 22, 92, 16, 16, C.caramel, a))}
      <T x={30} y={160} s={13} f={C.latte}>but: an attacker who can time queries</T>
      <T x={30} y={180} s={13} f={C.latte}>probes one key at a time, narrowing the guess</T>
      {Array.from({ length: 3 }, (_, i) => {
        const k = easeOut(seg(t, 0.6 + i * 0.5, 1.1 + i * 0.5));
        return <g key={i}>{cell(30, 196 + i * 26, 60 + i * 50, 16, C.cinnamon, Math.max(0.2, k))}</g>;
      })}
      <T x={30} y={288} s={13} f={C.cherry} o={easeOut(seg(t, 1.8, 2.4))}>linear &rArr; solvable by elimination</T>
      <T x={30} y={330} s={13} f={C.latte}>defeats a precomputed attacker,</T>
      <T x={30} y={350} s={13} f={C.latte}>not a timing attacker</T>
    </Svg>
  );
}

// 7 · A real pseudorandom function, not just a secret
export function SipHashPRF({ t }: StepCtx) {
  const n = Math.min(4, Math.floor(seg(t, 0.2, 1.6) * 4) + 1);
  return (
    <Svg label="SipHash's own round pipeline over a 128-bit key, drawn as a short sequence of labelled rounds, then named as CPython's own hash() since PEP 456" h={320}>
      <T x={30} y={26} s={13} f={C.latte}>SipHash-2-4: a few ARX rounds over a 128-bit key</T>
      {Array.from({ length: n }, (_, i) => cell(30 + i * 90, 44, 70, 26, C.caramel, 1))}
      <T x={30} y={110} s={13} f={C.crema}>PRF: indistinguishable from a random function</T>
      <T x={30} y={132} s={13} f={C.crema}>seeing output teaches nothing about any other input</T>
      <T x={30} y={190} s={13} f={C.caramel}>CPython's own hash() of str/bytes: this, since PEP 456</T>
      <T x={30} y={212} s={13} f={C.latte}>chosen specifically to fix hash-flooding attacks</T>
    </Svg>
  );
}

// 8 · A real standard library's own choice
export function RustDefault({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.1));
  const b = easeOut(seg(t, 0.4, 1.3));
  return (
    <Svg label="Rust's std HashMap defaults to SipHash 1-3 for HashDoS resistance; rustc's own FxHashMap opts out on purpose; a fixed hasher in a const loses that resistance" h={320}>
      <T x={30} y={28} s={14} f={C.caramel} serif>std::HashMap</T>
      <T x={30} y={48} s={13} f={C.crema}>SipHash 1-3, randomly seeded</T>
      {cell(30, 58, 220, 22, C.caramel, a)}
      <T x={30} y={104} s={13} f={C.latte}>"resistance against HashDoS attacks"</T>
      <T x={30} y={150} s={14} f={C.cinnamon} serif>rustc::FxHashMap</T>
      <T x={30} y={170} s={13} f={C.crema}>faster, no DoS resistance &mdash; chosen on purpose</T>
      {cell(30, 180, 180, 22, C.cinnamon, b)}
      <T x={30} y={226} s={13} f={C.latte}>"these attacks aren't a concern in the compiler"</T>
      <T x={30} y={270} s={13} f={C.cherry} o={easeOut(seg(t, 1.2, 1.8))}>a fixed hasher in a const: not HashDoS-resistant</T>
    </Svg>
  );
}

// 9 · Prove it
export function ProveIt({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.1));
  const b = easeOut(seg(t, 0.5, 1.3));
  const c = easeOut(seg(t, 0.7, 1.5));
  return (
    <Svg label="Three tiers benchmarked on the same machine, same run: the fast and keyed tiers land close together, the cryptographic tier is clearly slower" h={320}>
      <T x={30} y={26} s={13} f={C.crema}>fast tier (zlib.crc32)</T>
      {cell(30, 36, 86 * a, 20, C.cinnamon, Math.max(0.3, a))}
      <T x={30} y={84} s={13} f={C.crema}>keyed/PRF tier (hash, SipHash)</T>
      {cell(30, 94, 78 * b, 20, C.caramel, Math.max(0.3, b))}
      <T x={30} y={142} s={13} f={C.crema}>cryptographic tier (sha256)</T>
      {cell(30, 152, 300 * c, 20, C.cherry, Math.max(0.3, c))}
      <T x={30} y={210} s={13} f={C.latte}>fast and keyed: close together, ~1&times;</T>
      <T x={30} y={232} s={13} f={C.latte}>crypto: ~8&ndash;9&times; slower, every run</T>
      <T x={30} y={274} s={13} f={C.caramel}>exactly SipHash's own "competitive in speed" claim</T>
    </Svg>
  );
}
