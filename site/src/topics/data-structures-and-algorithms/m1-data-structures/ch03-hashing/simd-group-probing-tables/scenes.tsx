import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, rng, seg } from '../../../../../reels/anim';
import { C, Decode, Draw, Reticle, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = keys; latte = control bytes and indices; taupe = empty slots;
// caramel = the one 16-wide match, landing on all sixteen control bytes in a single frame;
// cinnamon = the compared alternative (the one-slot-at-a-time walk); cherryText = cache misses and
// false matches. Every printed number is asserted in examples.py or quoted in SOURCES.md; the false-
// match count depends on Python's per-process hash seed, so it is drawn as a position, not printed.

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

const W = 32; // one lane

/** A 16-slot group: a slot row and, below it, one control-byte tag per slot. `lit` lights every tag at once. */
function Group({ x0, y, occ, lit = 0, fade = 0, match = [], tagO = 1 }: { x0: number; y: number; occ: (i: number) => boolean; lit?: number; fade?: number; match?: number[]; tagO?: number }) {
  return (
    <g>
      {Array.from({ length: 16 }, (_, i) => {
        const m = match.includes(i);
        const dim = fade > 0 && !m ? 1 - 0.75 * fade : 1;
        return (
          <g key={i} opacity={dim}>
            <rect x={x0 + i * W} y={y} width={W - 4} height={26} rx={3} fill={occ(i) ? C.mocha : C.cocoa} stroke={occ(i) ? C.crema : C.taupe} strokeWidth={1.2} />
            <rect x={x0 + i * W + 4} y={y + 34} width={W - 12} height={12} rx={2} fill={lit > 0 ? C.cocoa : C.cocoa} stroke={m && fade > 0 ? C.caramel : lit > 0 ? C.caramel : C.latte} strokeWidth={lit > 0 || (m && fade > 0) ? 2 : 1.1} opacity={tagO} />
          </g>
        );
      })}
    </g>
  );
}

const OCC = (seed: number, p: number) => {
  const r = rng(seed);
  const a = Array.from({ length: 16 }, () => r() < p);
  return (i: number) => a[i];
};

// 1 · One slot at a go vs sixteen at once. Top: a probe hops slot to slot, one compare per hop, the counter
// ticking. Bottom: the same sixteen slots, one caramel sweep lands on all of them in one frame: one instruction.
export function Opening({ t }: StepCtx) {
  const hops = Math.min(8, Math.floor(seg(t, 0.3, 2.3) * 8 + 1e-9));
  const flash = t >= 1.2 && t < 1.5 ? 1 : 0;
  const after = t >= 1.2;
  return (
    <Svg label="A probe walking one slot at a time against a single instruction testing a whole group of sixteen slots" h={300}>
      <T x={30} y={24} s={13} f={C.cinnamon}>before: one slot at a go</T>
      {Array.from({ length: 16 }, (_, i) => <rect key={i} x={44 + i * W} y={40} width={W - 4} height={26} rx={3} fill={C.cocoa} stroke={i < hops ? C.cinnamon : C.taupe} strokeWidth={i === hops - 1 ? 2 : 1.2} />)}
      {hops > 0 && <circle cx={44 + (hops - 1) * W + 14} cy={78} r={4} fill={C.cinnamon} />}
      <T x={30} y={108} s={13} f={C.latte}>compares</T>
      <T x={140} y={109} s={15} f={C.cinnamon}>{hops}</T>
      <T x={30} y={160} s={13} f={C.caramel} o={easeOut(seg(t, 0.9, 1.2))}>now: a whole group, one instruction</T>
      <Group x0={44} y={176} occ={OCC(4, 0.5)} lit={after ? 1 : 0} />
      <rect x={40} y={170} width={16 * W + 4} height={58} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} opacity={flash} />
      <T x={30} y={262} s={13} f={C.latte}>compares</T>
      <T x={140} y={263} s={15} f={C.caramel}>{after ? 1 : 0}</T>
    </Svg>
  );
}

// 2 · The two costs. Top: chained entries pop up at scattered addresses, each with its own allocation tag and a
// pointer. Bottom: an open-addressed probe walk lands on a new cache line every step, each a red miss.
export function ForcingProblem({ t }: StepCtx) {
  const r = rng(13);
  const pts = Array.from({ length: 5 }, (_, i) => [60 + i * 100 + r() * 30, 52 + r() * 40]);
  const misses = Math.min(5, Math.floor(seg(t, 1.6, 2.9) * 5 + 1e-9));
  return (
    <Svg label="A chained table pays a pointer and an allocation per entry; an open-addressed probe walk misses the cache on almost every step" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>chaining: a pointer + allocation per entry</T>
      {pts.map(([x, y], i) => {
        const k = easeOutBack(seg(t, 0.2 + i * 0.2, 0.45 + i * 0.2));
        return (
          <g key={i} opacity={clamp(k)}>
            <rect x={x} y={y} width={40} height={24} rx={3} fill={C.mocha} stroke={C.crema} strokeWidth={1.2} />
            <T x={x + 20} y={y + 40} s={13} f={C.taupe} a="middle">alloc</T>
            {i < 4 && <Draw pts={[[x + 40, y + 12], [pts[i + 1][0], pts[i + 1][1] + 12]]} t={t} from={0.4 + i * 0.2} to={0.6 + i * 0.2} stroke={C.cherryText} w={1.4} pen={false} />}
          </g>
        );
      })}
      <T x={30} y={170} s={13} f={C.latte} o={easeOut(seg(t, 1.3, 1.6))}>open addressing: every probe, a new cache line</T>
      {Array.from({ length: 5 }, (_, i) => (
        <g key={i} opacity={easeOut(seg(t, 1.3, 1.6))}>
          <rect x={30 + i * 110} y={186} width={96} height={26} rx={3} fill={C.cocoa} stroke={C.taupe} strokeWidth={1.1} strokeDasharray="4 3" />
          <rect x={30 + i * 110 + 36} y={190} width={22} height={18} rx={2} fill={C.cocoa} stroke={i < misses ? C.cherryText : C.taupe} strokeWidth={i < misses ? 2 : 1.1} />
          <T x={30 + i * 110 + 48} y={236} s={13} f={C.cherryText} a="middle" o={i < misses ? 1 : 0}>miss</T>
        </g>
      ))}
      <T x={30} y={284} s={13} f={C.caramel} o={easeOut(seg(t, 3.0, 3.4))}>both real costs this topic avoids</T>
    </Svg>
  );
}

// 3 · Predict: how many of 16 does one compare test? Before answering, a single compare box hovers over the
// group. After it, one caramel sweep lights all sixteen control bytes in a single frame.
export function GroupPredictViz({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const lit = answered && s >= 0.2;
  return (
    <Svg label="One group of sixteen slots with sixteen control bytes: a single SIMD compare tests every one of them at once" h={280}>
      <T x={30} y={24} s={13} f={C.latte}>one group, 16 slots, 16 control bytes</T>
      <Group x0={44} y={70} occ={OCC(4, 0.5)} lit={lit ? 1 : 0} />
      {!answered && <rect x={44 + (Math.floor(t * 2) % 16) * W - 2} y={100} width={W} height={20} rx={3} fill="none" stroke={C.caramel} strokeWidth={1.6} opacity={0.4} />}
      {lit && <rect x={40} y={64} width={16 * W + 4} height={58} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} opacity={1 - easeOut(seg(s, 0.2, 1.2)) * 0.6} />}
      {!answered && <T x={30} y={250} s={15} f={C.caramel} o={0.7 + 0.3 * Math.sin(t * 3)}>one compare: how many tested?</T>}
      {answered && (
        <>
          <Decode text="all 16, one instruction" t={s} at={0.9} dur={0.5} x={30} y={170} s={15} f={C.caramel} />
          <T x={30} y={196} s={13} f={C.latte} o={easeOut(seg(s, 1.3, 1.7))}>occupied or not: the control byte says which matter</T>
        </>
      )}
    </Svg>
  );
}

// 4 · H1 and H2. One hash value's bar splits: the big share, H1, slides off to pick a group among four; the
// 7-bit share, H2, drops into a slot's control byte as its fingerprint.
export function H1H2Split({ t }: StepCtx) {
  const split = easeInOut(seg(t, 0.4, 0.9));
  const h1 = easeInOut(seg(t, 1.0, 1.7));
  const h2 = easeInOut(seg(t, 1.9, 2.6));
  const g = 2;
  return (
    <Svg label="One hash value split in two: H1 picks the group to probe, H2 becomes the slot's one-byte fingerprint in the control array" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>one hash value</T>
      <rect x={30} y={36} width={440} height={22} rx={3} fill={C.cocoa} stroke={C.caramel} strokeWidth={1.4} transform={`translate(${-6 * split} 0)`} />
      <rect x={470 + 10 * split} y={36} width={60} height={22} rx={3} fill={C.cocoa} stroke={C.cinnamon} strokeWidth={1.4} />
      <T x={250} y={52} s={13} f={C.caramel} a="middle" o={split}>H1</T>
      <T x={500 + 10 * split} y={52} s={13} f={C.cinnamon} a="middle" o={split}>H2</T>
      <T x={500} y={78} s={13} f={C.cinnamon} a="middle" o={split}>7 bits</T>
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={30 + i * 140} y={120} width={126} height={30} rx={4} fill={C.cocoa} stroke={i === g && h1 >= 1 ? C.caramel : C.taupe} strokeWidth={i === g && h1 >= 1 ? 2.2 : 1.2} />
      ))}
      <Draw pts={[[250, 60], [30 + g * 140 + 63, 116]]} t={t} from={1.0} to={1.7} stroke={C.caramel} w={1.8} />
      <T x={30} y={180} s={13} f={C.caramel} o={easeOut(seg(t, 1.5, 1.8))}>H1: picks the group to probe</T>
      <Group x0={44} y={200} occ={(i) => i === 5} tagO={0.9} />
      <rect x={lerp(500, 44 + 5 * W + 4, h2)} y={lerp(60, 234, h2)} width={lerp(60, W - 12, h2)} height={lerp(22, 12, h2)} rx={2} fill={C.cinnamon} opacity={h2 > 0 ? 0.9 : 0} />
      <T x={30} y={284} s={13} f={C.cinnamon} o={easeOut(seg(t, 2.5, 2.9))}>H2: a one-byte fingerprint, stored per slot</T>
    </Svg>
  );
}

// 5 · The group match. The query's H2 byte is copied over every lane at once; in one frame, every mismatched
// lane fades. The one match earns a real key comparison, which ticks.
export function GroupMatch({ t }: StepCtx) {
  const bcast = easeOut(seg(t, 0.3, 0.7));
  const fade = t >= 1.2 ? 1 : 0;
  const occ = OCC(9, 0.7);
  return (
    <Svg label="The query's fingerprint broadcast across all sixteen control bytes at once: every mismatched lane is ruled out in one step and only the matching lane gets a real key comparison" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>query fingerprint vs. the whole group, at once</T>
      <rect x={268} y={40} width={40} height={14} rx={2} fill={C.caramel} />
      <T x={320} y={52} s={13} f={C.caramel}>query H2</T>
      {Array.from({ length: 16 }, (_, i) => <rect key={i} x={44 + i * W + 4} y={lerp(40, 92, bcast)} width={W - 12} height={8} rx={2} fill={C.caramel} opacity={bcast * (fade && i !== 11 ? 0.15 : 0.8)} />)}
      <Group x0={44} y={110} occ={occ} fade={fade} match={[11]} />
      <Reticle x={44 + 11 * W + 14} y={133} w={40} h={62} t={t} at={1.6} />
      <Draw pts={[[44 + 11 * W + 4, 186], [44 + 11 * W + 10, 192], [44 + 11 * W + 22, 176]]} t={t} from={2.2} to={2.4} stroke={C.caramel} w={2.2} pen={false} />
      <T x={30} y={222} s={13} f={C.caramel} o={easeOut(seg(t, 1.8, 2.2))}>one lane matches: the only real candidate</T>
      <T x={30} y={246} s={13} f={C.latte} o={easeOut(seg(t, 2.4, 2.8))}>everyone else rejected by one byte, no key touched</T>
    </Svg>
  );
}

// 6 · Predict: odds of a coincidental match. 128 possible fingerprints laid out as a 16×8 grid; the query's
// value is fixed; a wrong candidate's value flickers around the grid. After answering, one cell in 128 is ringed.
export function FingerprintPredictViz({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const Q = 45;
  const flick = Math.floor(t * 8 * 7919) % 128;
  return (
    <Svg label="All 128 possible seven-bit fingerprints as a grid; a wrong candidate matches the query's value by coincidence about one time in 128" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>7 bits &rarr; 128 possible fingerprint values</T>
      {Array.from({ length: 128 }, (_, i) => {
        const x = 110 + (i % 16) * 24, y = 44 + Math.floor(i / 16) * 20;
        const q = i === Q;
        const c = !answered && i === flick;
        return <rect key={i} x={x} y={y} width={20} height={16} rx={2} fill={q ? C.caramel : C.cocoa} stroke={c ? C.cherryText : C.mocha} strokeWidth={c ? 2 : 1} />;
      })}
      {!answered && <T x={30} y={250} s={15} f={C.caramel} o={0.7 + 0.3 * Math.sin(t * 3)}>odds a wrong one matches?</T>}
      {answered && (
        <>
          <Reticle x={110 + (Q % 16) * 24 + 10} y={44 + Math.floor(Q / 16) * 20 + 8} w={30} h={26} t={s} at={0.2} />
          <Decode text="about 1 in 128" t={s} at={0.8} dur={0.5} x={30} y={234} s={15} f={C.caramel} />
          <T x={30} y={258} s={13} f={C.latte} o={easeOut(seg(s, 1.2, 1.6))}>rare, but why a real comparison still runs</T>
        </>
      )}
    </Svg>
  );
}

// 7 · Measured odds. 20,000 lookups for absent keys stream past as ticks; a few flash red (false H2 matches).
// On a rate scale, the theory mark (8 occupied slots × 1/128) appears, and the measured marker slides to sit
// right beside it.
export function FingerprintOdds({ t }: StepCtx) {
  const r = rng(77);
  const ticks = Array.from({ length: 64 }, () => r() < 0.0625 * 1.6);
  const n = Math.floor(seg(t, 0.2, 1.8) * 64 + 1e-9);
  const meas = easeInOut(seg(t, 2.0, 2.8));
  const sx = (v: number) => 60 + v * 4000;
  return (
    <Svg label="Twenty thousand lookups for absent keys: the measured rate of false fingerprint matches lands right beside the theoretical odds" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>20,000 lookups for keys never inserted</T>
      {ticks.slice(0, n).map((bad, i) => <rect key={i} x={30 + i * 8.4} y={40} width={5} height={bad ? 26 : 16} rx={1} fill={bad ? C.cherryText : C.mocha} />)}
      <line x1={sx(0)} y1={140} x2={sx(0.12)} y2={140} stroke={C.mocha} strokeWidth={1.4} opacity={easeOut(seg(t, 1.6, 1.9))} />
      {[0, 0.05, 0.1].map((v) => <line key={v} x1={sx(v)} y1={134} x2={sx(v)} y2={146} stroke={C.taupe} strokeWidth={1.2} opacity={easeOut(seg(t, 1.6, 1.9))} />)}
      <g opacity={easeOut(seg(t, 1.8, 2.1))}>
        <line x1={sx(0.0625)} y1={118} x2={sx(0.0625)} y2={140} stroke={C.caramel} strokeWidth={2} />
        <T x={sx(0.0625)} y={110} s={13} f={C.caramel} a="middle">theory: 8 slots &times; 1/128</T>
      </g>
      <circle cx={lerp(sx(0.12), sx(0.0631), meas)} cy={140} r={6} fill={C.cherryText} opacity={meas > 0 ? 1 : 0} />
      <T x={sx(0.0631)} y={172} s={13} f={C.cherryText} a="middle" o={easeOut(seg(t, 2.6, 2.9))}>measured</T>
      <T x={30} y={226} s={13} f={C.latte} o={easeOut(seg(t, 2.9, 3.3))}>the fingerprint doesn&rsquo;t replace the comparison;</T>
      <T x={30} y={248} s={13} f={C.latte} o={easeOut(seg(t, 3.0, 3.4))}>it makes paying for one rare</T>
    </Svg>
  );
}

// 8 · Three adopters. A timeline draws; three cards drop onto it, each stamped with the same little group
// glyph: one design, three runtimes.
export function ThreeAdopters({ t }: StepCtx) {
  const cards: [string, string][] = [
    ['Abseil flat_hash_map', '2017/2018'],
    ['Rust std HashMap (hashbrown)', 'since 1.36'],
    ['Go built-in map', 'since Go 1.24'],
  ];
  return (
    <Svg label="Abseil, Rust's standard HashMap and Go's built-in map, three real adopters of the same group-probing design" h={300}>
      {cards.map(([name, when], i) => {
        const k = easeOutBack(seg(t, 0.3 + i * 0.6, 0.7 + i * 0.6));
        const y = 30 + i * 74 - 20 * (1 - clamp(k));
        return (
          <g key={name} opacity={clamp(k)}>
            <rect x={30} y={y} width={540} height={56} rx={6} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.2} />
            <T x={46} y={y + 24} s={13} f={C.caramel}>{name}</T>
            <T x={46} y={y + 44} s={13} f={C.latte}>{when}</T>
            {Array.from({ length: 16 }, (_, j) => <rect key={j} x={380 + j * 11} y={y + 22} width={8} height={12} rx={1} fill="none" stroke={C.caramel} strokeWidth={1} opacity={easeOut(seg(t, 0.6 + i * 0.6, 0.9 + i * 0.6))} />)}
          </g>
        );
      })}
      <T x={30} y={274} s={13} f={C.latte} o={easeOut(seg(t, 2.6, 3.0))}>three real adopters, each checked at research time</T>
    </Svg>
  );
}

// 9 · Prove it. A nearly full group (15 of 16), one miss lookup. Top: the naive scan compares byte by byte,
// its counter running to 16. Bottom: the vectorized compare lights the whole group once: 1.
export function ProveIt({ t }: StepCtx) {
  const occ = (i: number) => i !== 13;
  const naive = Math.min(16, Math.floor(seg(t, 0.4, 2.6) * 16 + 1e-9));
  const vec = t >= 0.6;
  return (
    <Svg label="On a nearly full group, a miss lookup costs a naive scan sixteen byte compares and the vectorized compare one instruction" h={300}>
      <T x={30} y={24} s={13} f={C.crema}>one group, nearly full (15/16), one miss lookup</T>
      <T x={30} y={60} s={13} f={C.cinnamon}>naive scan</T>
      {Array.from({ length: 16 }, (_, i) => <rect key={i} x={44 + i * W} y={72} width={W - 4} height={22} rx={3} fill={occ(i) ? C.mocha : C.cocoa} stroke={i < naive ? C.cinnamon : C.taupe} strokeWidth={i === naive - 1 ? 2.2 : 1.1} />)}
      <T x={30} y={124} s={13} f={C.latte}>byte compares</T>
      <T x={200} y={125} s={15} f={C.cinnamon}>{naive}</T>
      <T x={30} y={170} s={13} f={C.caramel}>vectorized</T>
      {Array.from({ length: 16 }, (_, i) => <rect key={i} x={44 + i * W} y={182} width={W - 4} height={22} rx={3} fill={occ(i) ? C.mocha : C.cocoa} stroke={vec ? C.caramel : C.taupe} strokeWidth={vec ? 2 : 1.1} />)}
      <T x={30} y={234} s={13} f={C.latte}>instructions</T>
      <T x={200} y={235} s={15} f={C.caramel}>{vec ? 1 : 0}</T>
      <T x={30} y={278} s={13} f={C.latte} o={easeOut(seg(t, 2.8, 3.2))}>same correctness, sixteen times fewer instructions</T>
    </Svg>
  );
}
