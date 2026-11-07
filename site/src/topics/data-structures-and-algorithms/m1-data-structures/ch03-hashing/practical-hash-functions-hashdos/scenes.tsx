import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, rng, seg } from '../../../../../reels/anim';
import { C, Decode, Draw, Reticle, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): caramel = the mechanism in focus (the hash box, the keyed/PRF
// tier); cinnamon = the compared alternative (the non-crypto tier, the un-keyed formula); cherryText
// = the flooded bucket and the attack; taupe/latte = axes, quiet labels; crema = records/keys.
// Every printed number is asserted in examples.py or quoted in SOURCES.md; timings are drawn as shape
// only, because they depend on the machine.

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

/** A plain cell. */
function Box({ x, y, w, h = 24, f = C.crema, o = 1, fill = C.cocoa, dash, sw = 1.4 }: { x: number; y: number; w: number; h?: number; f?: string; o?: number; fill?: string; dash?: string; sw?: number }) {
  return <rect x={x} y={y} width={w} height={h} rx={3} fill={fill} stroke={f} strokeWidth={sw} strokeDasharray={dash} opacity={o} />;
}

/** The hash-function box. */
function HashBox({ x, y, label = 'h(key)', f = C.caramel, o = 1 }: { x: number; y: number; label?: string; f?: string; o?: number }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={90} height={32} rx={5} fill={C.cocoa} stroke={f} strokeWidth={1.8} />
      <T x={x + 45} y={y + 21} s={13} f={f} a="middle">{label}</T>
    </g>
  );
}

/** A drawn padlock (no emoji). */
function Lock({ x, y, f = C.caramel, o = 1 }: { x: number; y: number; f?: string; o?: number }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={16} height={13} rx={2} fill="none" stroke={f} strokeWidth={1.6} />
      <path d={`M ${x + 3} ${y} v -4 a 5 5 0 0 1 10 0 v 4`} fill="none" stroke={f} strokeWidth={1.6} />
    </g>
  );
}

/** Sixteen buckets with chains hanging below; `chain(i)` is how many entries bucket i holds (drawn up to `cap`). */
function Buckets({ x0, y, chain, f = C.crema, cap = 6, o = 1, w = 30 }: { x0: number; y: number; chain: (i: number) => number; f?: string; cap?: number; o?: number; w?: number }) {
  return (
    <g opacity={o}>
      {Array.from({ length: 16 }, (_, i) => {
        const n = chain(i);
        const bad = n > 2;
        return (
          <g key={i}>
            <Box x={x0 + i * w} y={y} w={w - 6} h={16} f={n > 0 ? (bad ? C.cherryText : f) : C.taupe} sw={1.2} />
            {Array.from({ length: Math.min(cap, n) }, (_, k) => (
              <rect key={k} x={x0 + i * w + 6} y={y + 22 + k * 12} width={w - 18} height={8} rx={2} fill={bad ? C.cherryText : C.latte} opacity={0.85} />
            ))}
          </g>
        );
      })}
    </g>
  );
}

// 1 · Finding a slot. Left race lane: a scan walks the records one by one, comparing each. Right lane: the key
// goes through h(key) and lands on its slot in one hop, long before the scan is done.
export function Opening({ t }: StepCtx) {
  const scan = Math.min(11, Math.floor(seg(t, 0.3, 3.0) * 12));
  const hop = easeInOut(seg(t, 0.6, 1.1));
  const TARGET = 9;
  return (
    <Svg label="A scan touching every record one at a time loses the race to a hash function that turns the key straight into its slot" h={300}>
      <T x={30} y={28} s={13} f={C.cinnamon}>scan: touch every record</T>
      {Array.from({ length: 12 }, (_, i) => <Box key={i} x={30 + i * 44} y={44} w={36} h={28} f={i === scan ? C.cinnamon : i < scan ? C.taupe : C.crema} />)}
      <circle cx={30 + scan * 44 + 18} cy={86} r={5} fill={C.cinnamon} />
      <T x={30} y={128} s={13} f={C.cinnamon}>compared</T>
      <T x={130} y={129} s={15} f={C.cinnamon}>{scan + 1}</T>
      <T x={30} y={176} s={13} f={C.caramel}>h(key) &rarr; slot, directly</T>
      <HashBox x={30} y={192} />
      {Array.from({ length: 12 }, (_, i) => <Box key={i} x={30 + i * 44} y={250} w={36} h={28} f={i === TARGET && hop >= 1 ? C.caramel : C.crema} fill={i === TARGET && hop >= 1 ? C.mocha : C.cocoa} />)}
      <Draw pts={[[120, 208], [lerp(120, 30 + TARGET * 44 + 18, 0.5), 208], [30 + TARGET * 44 + 18, 246]]} t={t} from={0.6} to={1.1} stroke={C.caramel} w={2} />
      <T x={570} y={176} s={13} f={C.caramel} a="end" o={easeOut(seg(t, 1.1, 1.4))}>one hop, done</T>
    </Svg>
  );
}

// 2 · Fast, and no promises. Four fast hashes race their bars; then the design goals tick in, and the row
// "who chose the keys?" stays empty, with a pulsing red question.
export function NonCryptoSpeed({ t }: StepCtx) {
  const bars = [
    { name: 'XXH3', w: 260 },
    { name: 'wyhash', w: 230 },
    { name: 'FxHash', w: 250 },
    { name: 'zlib.crc32 (measured)', w: 200 },
  ];
  const goals = ['fast on ordinary keys', 'spreads ordinary keys'];
  return (
    <Svg label="A bar race of fast non-cryptographic hashes, all built for raw speed, with an empty row where a promise about chosen keys would go" h={300}>
      <T x={30} y={22} s={13} f={C.latte}>built for one thing: raw speed</T>
      {bars.map((b, i) => {
        const k = easeOut(seg(t, 0.2 + i * 0.12, 1.0 + i * 0.12));
        const jitter = k < 1 ? 6 * Math.sin(t * 9 + i * 2) : 0;
        return (
          <g key={b.name}>
            <T x={30} y={46 + i * 30} s={13} f={C.crema}>{b.name}</T>
            <rect x={250} y={36 + i * 30} width={Math.max(0, (b.w - 20) * k + jitter)} height={12} rx={2} fill={i === 3 ? C.caramel : C.cinnamon} />
          </g>
        );
      })}
      {goals.map((g, i) => (
        <g key={g} opacity={easeOut(seg(t, 1.3 + i * 0.3, 1.6 + i * 0.3))}>
          <Draw pts={[[30, 186 + i * 28], [36, 192 + i * 28], [46, 178 + i * 28]]} t={t} from={1.3 + i * 0.3} to={1.5 + i * 0.3} stroke={C.caramel} w={2} pen={false} />
          <T x={60} y={192 + i * 28} s={13} f={C.crema}>{g}</T>
        </g>
      ))}
      <g opacity={easeOut(seg(t, 2.0, 2.3))}>
        <rect x={30} y={234} width={18} height={18} rx={2} fill="none" stroke={C.cherryText} strokeWidth={1.4} strokeDasharray="3 3" />
        <T x={60} y={248} s={13} f={C.cherryText} o={0.65 + 0.35 * Math.sin(t * 5)}>who chose the keys? not asked</T>
      </g>
    </Svg>
  );
}

// 3 · Predict: an attacker chooses the keys. Before the answer, crafted keys stream toward the hash box with a
// question at the far side. After it, every key exits into the same bucket and its chain grows long and red.
export function FloodPredictViz({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const n = answered ? Math.floor(seg(s, 0.2, 1.8) * 12 + 1e-9) : 0;
  return (
    <Svg label="A fast-hash table fed a stream of attacker-chosen keys: every key lands in the same bucket and its chain grows into one long list" h={300}>
      <T x={30} y={26} s={13} f={C.latte}>attacker-chosen keys, arriving</T>
      {Array.from({ length: 6 }, (_, i) => {
        const x = 30 + (((t * 60 + i * 30) % 180) + 180) % 180;
        return <rect key={i} x={x} y={44} width={18} height={18} rx={2} fill="none" stroke={C.cherryText} strokeWidth={1.4} opacity={answered ? 0.3 : 0.8} />;
      })}
      <HashBox x={230} y={38} f={C.cinnamon} label="fast h()" />
      {!answered && <T x={360} y={60} s={18} f={C.cherryText} o={0.6 + 0.4 * Math.sin(t * 4)}>?</T>}
      <Buckets x0={60} y={100} chain={(i) => (answered && i === 5 ? n : 0)} cap={12} />
      {answered && <Draw pts={[[320, 72], [60 + 5 * 30 + 12, 98]]} t={s} from={0.1} to={0.3} stroke={C.cherryText} w={1.6} pen={false} />}
      {!answered && <T x={30} y={280} s={15} f={C.caramel} o={0.7 + 0.3 * Math.sin(t * 3)}>what happens to the table?</T>}
      {answered && (
        <>
          <Decode text="every key, one bucket" t={s} at={1.2} dur={0.5} x={260} y={180} s={14} f={C.cherryText} />
          <T x={260} y={204} s={13} f={C.latte} o={easeOut(seg(s, 1.6, 2.0))}>one giant list: O(n) per lookup</T>
        </>
      )}
    </Svg>
  );
}

// 4 · HashDoS, revealed. Same 4,000 keys twice: random keys spread over the buckets with short chains; crafted
// keys pile into one chain, and the time bar for the crafted run stretches far past the random one (shape
// only). The three disclosures arrive on a timeline.
export function HashDoSReveal({ t }: StepCtx) {
  const r = rng(7);
  const spread = Array.from({ length: 16 }, () => 1 + Math.floor(r() * 2));
  const fill = clamp(seg(t, 0.2, 1.4));
  const flood = Math.floor(clamp(seg(t, 0.4, 1.6)) * 7);
  const bar = easeInOut(seg(t, 1.5, 2.4));
  const dates: [string, string][] = [
    ['1999', 'dnscache'],
    ['2003', 'Crosby & Wallach'],
    ['2011', 'Klink & Wälde'],
  ];
  return (
    <Svg label="The same number of keys twice: random keys spread with short chains, crafted colliding keys pile into one chain and take far longer; then the three disclosures in 1999, 2003 and 2011" h={330}>
      <T x={30} y={22} s={13} f={C.latte}>4,000 random</T>
      <Buckets x0={210} y={10} chain={(i) => Math.round(spread[i] * fill)} w={22} cap={2} />
      <T x={30} y={76} s={13} f={C.cherryText}>4,000 colliding</T>
      <Buckets x0={210} y={64} chain={(i) => (i === 3 ? flood : 0)} w={22} cap={7} />
      <T x={30} y={176} s={13} f={C.latte} o={easeOut(seg(t, 1.4, 1.6))}>time</T>
      <rect x={110} y={166} width={30 * bar} height={10} rx={2} fill={C.latte} />
      <rect x={110} y={182} width={440 * bar} height={10} rx={2} fill={C.cherryText} />
      <T x={570} y={210} s={13} f={C.cherryText} a="end" o={easeOut(seg(t, 2.2, 2.5))}>many times slower, measured</T>
      <line x1={50} y1={250} x2={550} y2={250} stroke={C.mocha} strokeWidth={1.4} opacity={easeOut(seg(t, 2.4, 2.7))} />
      {dates.map(([y, who], i) => {
        const k = easeOutBack(seg(t, 2.6 + i * 0.3, 2.9 + i * 0.3));
        const x = 90 + i * 190;
        return (
          <g key={y} opacity={clamp(k)}>
            <circle cx={x} cy={250} r={5 * clamp(k)} fill={C.caramel} />
            <T x={x} y={238} s={13} f={C.caramel} a="middle">{y}</T>
            <T x={x} y={272} s={13} f={C.latte} a="middle">{who}</T>
          </g>
        );
      })}
      <T x={30} y={314} s={12} f={C.latte} o={easeOut(seg(t, 3.6, 4.0))}>500 KB of POST data, one PHP5 server, a full minute of CPU</T>
    </Svg>
  );
}

// 5 · Predict: does a random per-process seed fix it? A padlock clicks onto the weak hash. After the answer,
// two attackers: the offline precomputer's keys now scatter (tick); the online timer sends one probe at a
// time, and its stopwatch narrows in on the formula (red).
export function SeedPredictViz({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const lock = easeOutBack(seg(t, 0.2, 0.6));
  const r = rng(11);
  const scatter = Array.from({ length: 10 }, () => r());
  const sc = answered ? easeInOut(seg(s, 0.2, 1.0)) : 0;
  const probes = answered ? Math.floor(seg(s, 1.2, 2.6) * 5 + 1e-9) : 0;
  const width = 360 / Math.pow(2, probes);
  return (
    <Svg label="The weak hash with a random per-process seed: it scatters an offline attacker's precomputed keys but not a timing attacker probing one key at a time" h={300}>
      <HashBox x={30} y={40} f={C.cinnamon} label="weak h()" />
      <Lock x={130} y={50 - 14 * (1 - clamp(lock))} o={clamp(lock)} />
      <T x={170} y={54} s={13} f={C.crema}>a random seed per process,</T>
      <T x={170} y={74} s={13} f={C.crema}>unknown to the attacker</T>
      {!answered && <T x={30} y={270} s={15} f={C.caramel} o={0.7 + 0.3 * Math.sin(t * 3)}>does that fix it?</T>}
      {answered && (
        <>
          <T x={30} y={124} s={13} f={C.latte}>offline</T>
          {scatter.map((v, i) => <rect key={i} x={lerp(140 + i * 2, 140 + v * 320, sc)} y={112} width={10} height={14} rx={2} fill="none" stroke={C.caramel} strokeWidth={1.4} />)}
          <Draw pts={[[490, 120], [496, 126], [508, 110]]} t={s} from={1.0} to={1.2} stroke={C.caramel} w={2.2} pen={false} />
          <T x={30} y={170} s={13} f={C.latte}>timing</T>
          {Array.from({ length: probes }, (_, i) => <circle key={i} cx={150 + i * 18} cy={165} r={4} fill={C.cherryText} />)}
          <rect x={140 + (360 - width) * 0.62} y={180} width={width} height={10} rx={2} fill={C.cherryText} opacity={0.8} />
          <T x={30} y={234} s={13} f={C.caramel} o={easeOut(seg(s, 2.4, 2.8))}>not by itself: if the formula is still linear,</T>
          <T x={30} y={256} s={13} f={C.caramel} o={easeOut(seg(s, 2.6, 3.0))}>timing your server can still reveal the seed</T>
        </>
      )}
    </Svg>
  );
}

// 6 · What a seed buys. Top: the 4,000 crafted keys sit in 1 of 256 buckets (one tall spike); the seed is
// keyed in and they rain out across 256 of 256. Bottom: the timing attack, drawn as the paper's argument:
// each probe removes candidates for a linear formula's coefficients until one remains.
export function SeedReveal({ t }: StepCtx) {
  const spread = easeInOut(seg(t, 0.6, 1.8));
  const used = spread >= 1 ? 256 : Math.max(1, Math.round(1 + 255 * spread * spread));
  const r = rng(5);
  const hs = Array.from({ length: 256 }, () => 8 + r() * 14);
  const probes = Math.floor(seg(t, 2.3, 3.8) * 6 + 1e-9);
  return (
    <Svg label="The crafted keys scatter from one bucket to all 256 once a per-process seed is keyed in; a timing attacker eliminates candidates for a linear formula probe by probe" h={330}>
      <T x={30} y={22} s={13} f={spread > 0.5 ? C.caramel : C.cherryText}>buckets used: {used} of 256</T>
      <Lock x={540} y={14} o={easeOut(seg(t, 0.4, 0.7))} />
      <line x1={40} y1={130} x2={552} y2={130} stroke={C.mocha} strokeWidth={1.2} />
      {hs.map((h, i) => {
        const spike = i === 77;
        const height = spike ? lerp(90, h, spread) : h * spread;
        return <rect key={i} x={40 + i * 2} y={130 - height} width={1.6} height={height} fill={spike && spread < 0.5 ? C.cherryText : C.caramel} />;
      })}
      <T x={30} y={176} s={13} f={C.latte} o={easeOut(seg(t, 2.0, 2.3))}>but a timing attacker, one probe at a time:</T>
      {Array.from({ length: 24 }, (_, i) => {
        const keep = i === 14;
        const dead = !keep && i % 6 < probes;
        return <rect key={i} x={30 + i * 22} y={194} width={16} height={16} rx={2} fill={keep && probes >= 6 ? C.cherryText : C.cocoa} stroke={dead ? C.mocha : C.latte} strokeWidth={1.2} opacity={easeOut(seg(t, 2.1, 2.3)) * (dead ? 0.3 : 1)} />;
      })}
      <T x={30} y={244} s={13} f={C.cherryText} o={easeOut(seg(t, 3.5, 3.9))}>linear &rArr; solvable by elimination</T>
      <T x={30} y={270} s={13} f={C.taupe} o={easeOut(seg(t, 3.6, 4.0))}>the paper&apos;s argument, not built here</T>
      <T x={30} y={302} s={13} f={C.latte} o={easeOut(seg(t, 3.9, 4.3))}>defeats a precomputed attacker, not a timing one</T>
    </Svg>
  );
}

// 7 · A real PRF. A message block enters SipHash-2-4: two compression rounds and four finalization rounds
// light in sequence over the 128-bit key, and the reference test vector decodes out.
export function SipHashPRF({ t }: StepCtx) {
  const rounds = ['c', 'c', 'd', 'd', 'd', 'd'];
  const lit = Math.floor(seg(t, 0.3, 1.8) * 6 + 1e-9);
  return (
    <Svg label="SipHash-2-4's rounds lighting in sequence over a 128-bit key, then its output; named as CPython's own hash() since PEP 456" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>SipHash-2-4: ARX rounds over a 128-bit key</T>
      <Box x={30} y={40} w={60} h={30} f={C.crema} />
      <T x={60} y={60} s={13} f={C.crema} a="middle">msg</T>
      <Lock x={52} y={96} />
      <T x={30} y={136} s={13} f={C.caramel}>key</T>
      {rounds.map((r, i) => (
        <g key={i}>
          <Box x={110 + i * 58} y={40} w={46} h={30} f={i < lit ? C.caramel : C.taupe} fill={i < lit ? C.mocha : C.cocoa} />
          <T x={133 + i * 58} y={60} s={13} f={i < lit ? C.caramel : C.taupe} a="middle">{r}</T>
          <Draw pts={[[60, 108], [133 + i * 58, 74]]} t={t} from={0.3 + i * 0.25} to={0.45 + i * 0.25} stroke={C.taupe} w={0.8} pen={false} />
        </g>
      ))}
      <Decode text="0x726FDB47DD0E0E31" t={t} at={1.9} dur={0.6} x={290} y={124} s={14} f={C.caramel} />
      <T x={290} y={146} s={13} f={C.taupe} o={easeOut(seg(t, 2.2, 2.5))}>reference test vector</T>
      <T x={30} y={190} s={13} f={C.crema} o={easeOut(seg(t, 2.3, 2.7))}>PRF: indistinguishable from a random function</T>
      <T x={30} y={240} s={13} f={C.caramel} o={easeOut(seg(t, 2.9, 3.3))}>CPython&apos;s own hash() of str/bytes:</T>
      <T x={30} y={262} s={13} f={C.caramel} o={easeOut(seg(t, 3.0, 3.4))}>this, since PEP 456</T>
      <Reticle x={240} y={250} w={440} h={60} t={t} at={3.2} />
    </Svg>
  );
}

// 8 · Two choices, one language. Top lane: untrusted input feeds std::HashMap (SipHash 1-3, seeded) and spreads
// evenly. Bottom lane: the compiler's own keys feed FxHashMap, which runs faster. A fixed hasher is crossed red.
export function RustDefault({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.6));
  const b = easeOut(seg(t, 1.4, 1.8));
  const flowA = (t * 90) % 160;
  const flowB = (t * 160) % 160;
  return (
    <Svg label="Rust's std HashMap defaults to seeded SipHash 1-3 for HashDoS resistance; rustc's own FxHashMap opts out on purpose; a fixed hasher loses that resistance" h={320}>
      <g opacity={a}>
        <T x={30} y={28} s={14} f={C.caramel} serif>std::HashMap</T>
        <T x={30} y={48} s={13} f={C.crema}>SipHash 1-3, randomly seeded</T>
        <T x={30} y={78} s={13} f={C.latte}>untrusted keys</T>
        {[0, 1, 2].map((i) => <circle key={i} cx={170 + ((flowA + i * 53) % 160)} cy={74} r={4} fill={C.crema} />)}
        <HashBox x={340} y={58} label="SipHash" />
        <Lock x={436} y={68} />
        <T x={30} y={110} s={13} f={C.latte}>&quot;resistance against HashDoS attacks&quot;</T>
      </g>
      <g opacity={b}>
        <T x={30} y={156} s={14} f={C.cinnamon} serif>rustc::FxHashMap</T>
        <T x={30} y={176} s={13} f={C.crema}>faster, no DoS resistance, on purpose</T>
        <T x={30} y={206} s={13} f={C.latte}>own keys</T>
        {[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={170 + ((flowB + i * 32) % 160)} cy={202} r={4} fill={C.cinnamon} />)}
        <HashBox x={340} y={186} label="FxHash" f={C.cinnamon} />
        <T x={30} y={238} s={13} f={C.latte}>&quot;these attacks aren&apos;t a concern in the compiler&quot;</T>
      </g>
      <T x={30} y={290} s={13} f={C.cherryText} o={easeOut(seg(t, 2.8, 3.2))}>a fixed hasher in a const: not HashDoS-resistant</T>
    </Svg>
  );
}

// 9 · Prove it. Three tiers on one machine, one run: the fast and keyed bars grow to nearly the same length,
// then the cryptographic bar keeps on going (shape only; the ns/key figures depend on the machine).
export function ProveIt({ t }: StepCtx) {
  const tiers = [
    { name: 'fast tier (zlib.crc32)', w: 70, f: C.cinnamon },
    { name: 'keyed/PRF tier (hash, SipHash)', w: 60, f: C.caramel },
    { name: 'cryptographic tier (sha256)', w: 400, f: C.cherryText },
  ];
  return (
    <Svg label="Three tiers benchmarked on the same machine, same run: the fast and keyed tiers land close together, the cryptographic tier is clearly slower" h={320}>
      {tiers.map((x, i) => {
        const k = easeInOut(seg(t, 0.3 + i * 0.4, i === 2 ? 2.6 : 1.0 + i * 0.4));
        return (
          <g key={x.name} opacity={easeOut(seg(t, 0.2 + i * 0.4, 0.4 + i * 0.4))}>
            <T x={30} y={30 + i * 58} s={13} f={C.crema}>{x.name}</T>
            <rect x={30} y={40 + i * 58} width={x.w * k} height={16} rx={2} fill={x.f} />
          </g>
        );
      })}
      <path d="M 100 50 v 20 H 400" fill="none" stroke={C.latte} strokeWidth={1} strokeDasharray="3 3" opacity={easeOut(seg(t, 1.6, 2.0))} />
      <T x={570} y={74} s={13} f={C.latte} a="end" o={easeOut(seg(t, 1.7, 2.1))}>close together</T>
      <T x={30} y={220} s={13} f={C.latte} o={easeOut(seg(t, 2.7, 3.1))}>crypto: several times slower, every run</T>
      <T x={30} y={270} s={13} f={C.caramel} o={easeOut(seg(t, 3.2, 3.6))}>exactly SipHash&apos;s own &quot;competitive in speed&quot; claim</T>
    </Svg>
  );
}
