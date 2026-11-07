import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, rng, seg } from '../../../../../reels/anim';
import { C, Decode, Draw, Reticle, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = keys and entries; latte = bucket indices; taupe = empty
// slots; caramel = the thing to look at (the bucket a key lands in, the average line); cinnamon =
// the compared alternative (open addressing, previewed); cherryText = the collision and the
// one-bucket worst case. Every printed number is asserted in examples.py. The longest-chain values
// depend on Python's per-process hash seed, so they are drawn as shape, not printed.

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

/** A short arrow that draws itself. */
function Arrow({ a, b, t, from, to, f = C.latte, w = 1.4 }: { a: [number, number]; b: [number, number]; t: number; from: number; to: number; f?: string; w?: number }) {
  const k = easeInOut(seg(t, from, to));
  if (k <= 0) return null;
  const tip = [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const h = (da: number) => `${tip[0] - 6 * Math.cos(ang + da)} ${tip[1] - 6 * Math.sin(ang + da)}`;
  return (
    <g>
      <line x1={a[0]} y1={a[1]} x2={tip[0]} y2={tip[1]} stroke={f} strokeWidth={w} />
      <path d={`M${tip[0]} ${tip[1]} L${h(0.45)} M${tip[0]} ${tip[1]} L${h(-0.45)}`} stroke={f} strokeWidth={w} fill="none" />
    </g>
  );
}

/** Deterministic bucket counts for n keys over m buckets (a stand-in for a well-spread hash; shape only). */
function spread(n: number, m: number, seed: number) {
  const r = rng(seed);
  const c = Array(m).fill(0);
  for (let i = 0; i < n; i++) c[Math.floor(r() * m)]++;
  return c;
}

/** A histogram of chain lengths: one thin column per bucket, height per entry, with an average line. */
function Hist({ x0, y, counts, unit, cw, f = C.crema, avg, avgO = 1, k = 1 }: { x0: number; y: number; counts: number[]; unit: number; cw: number; f?: string; avg: number; avgO?: number; k?: number }) {
  const mx = Math.max(...counts);
  return (
    <g>
      <line x1={x0 - 4} y1={y} x2={x0 + counts.length * cw + 4} y2={y} stroke={C.mocha} strokeWidth={1.2} />
      {counts.map((c, i) => <rect key={i} x={x0 + i * cw} y={y - c * unit * k} width={cw - 1} height={c * unit * k} fill={c === mx && mx > 6 ? C.cherryText : f} opacity={0.85} />)}
      <line x1={x0 - 4} y1={y - avg * unit} x2={x0 + counts.length * cw + 4} y2={y - avg * unit} stroke={C.caramel} strokeWidth={1.6} strokeDasharray="5 4" opacity={avgO} />
    </g>
  );
}

// 1 · Collisions. Key A goes through h and lands in slot 5; key B goes through h and lands on slot 5 too. The
// slot flashes red with a question: the hash did its job and promised nothing about this.
export function Opening({ t }: StepCtx) {
  const a = easeInOut(seg(t, 0.2, 0.8));
  const b = easeInOut(seg(t, 1.0, 1.6));
  const clash = easeOut(seg(t, 1.6, 1.9));
  const sx = (i: number) => 60 + i * 60;
  return (
    <Svg label="Two keys hashed into the same slot, a collision the hash function never promised to avoid" h={260}>
      <T x={30} y={28} s={13} f={C.latte}>h(key) &rarr; slot, as before</T>
      <T x={60} y={64} s={13} f={C.crema}>key A</T>
      <T x={420} y={64} s={13} f={C.crema}>key B</T>
      <rect x={250} y={46} width={100} height={28} rx={5} fill={C.cocoa} stroke={C.caramel} strokeWidth={1.6} />
      <T x={300} y={65} s={13} f={C.caramel} a="middle">h(key)</T>
      {Array.from({ length: 8 }, (_, i) => <Box key={i} x={sx(i) - 20} y={140} w={40} h={30} f={i === 5 && clash > 0 ? C.cherryText : C.taupe} />)}
      {Array.from({ length: 8 }, (_, i) => <T key={i} x={sx(i)} y={192} s={13} f={C.latte} a="middle">{i}</T>)}
      <Draw pts={[[110, 60], [250, 60]]} t={t} from={0.2} to={0.4} stroke={C.crema} w={1.4} pen={false} />
      <Draw pts={[[300, 74], [sx(5), 136]]} t={t} from={0.4} to={0.8} stroke={C.caramel} w={1.6} />
      <rect x={sx(5) - 14} y={lerp(80, 144, a)} width={28} height={10} rx={2} fill={C.crema} opacity={a > 0 ? 1 : 0} />
      <Draw pts={[[416, 60], [350, 60]]} t={t} from={1.0} to={1.2} stroke={C.crema} w={1.4} pen={false} />
      <Draw pts={[[300, 74], [sx(5) + 6, 136]]} t={t} from={1.2} to={1.6} stroke={C.cherryText} w={1.6} />
      <rect x={sx(5) - 14} y={lerp(80, 156, b)} width={28} height={10} rx={2} fill={C.cherryText} opacity={b > 0 ? 1 : 0} />
      <T x={sx(5) + 34} y={164} s={18} f={C.cherryText} o={clash * (0.6 + 0.4 * Math.sin(t * 6))}>?</T>
      <T x={30} y={238} s={13} f={C.latte} o={easeOut(seg(t, 2.1, 2.5))}>a hash function says nothing about this</T>
    </Svg>
  );
}

// 2 · The chain. A bucket becomes the head of a list: each new key that lands there drops in and is linked on
// below the last, with Chapter 2's own arrow.
export function ChainMechanism({ t }: StepCtx) {
  const n = Math.min(4, Math.floor(seg(t, 0.4, 2.4) * 4 + 1e-9));
  const f = easeOutBack(clamp(seg(t, 0.4, 2.4) * 4 - n));
  return (
    <Svg label="A bucket becomes the head of a singly linked list; every new key landing there is linked on" h={320}>
      <T x={30} y={26} s={13} f={C.latte}>bucket 3 becomes a list head</T>
      {Array.from({ length: 8 }, (_, i) => <Box key={i} x={40 + i * 64} y={44} w={52} h={28} f={i === 3 ? C.caramel : C.taupe} sw={i === 3 ? 2 : 1.2} />)}
      {Array.from({ length: Math.min(4, n + 1) }, (_, k) => {
        const landed = k < n;
        const y = 96 + k * 50;
        const yy = landed ? y : lerp(y - 40, y, clamp(f));
        const o = landed ? 1 : clamp(f);
        return (
          <g key={k} opacity={o}>
            <Box x={234} y={yy} w={70} h={28} f={C.crema} />
            <T x={269} y={yy + 19} s={13} f={C.crema} a="middle">entry {k + 1}</T>
            <rect x={306} y={yy + 4} width={14} height={20} rx={2} fill="none" stroke={C.latte} strokeWidth={1.2} />
          </g>
        );
      })}
      {Array.from({ length: Math.min(4, n + 1) }, (_, k) => (
        <Arrow key={k} a={k === 0 ? [270, 74] : [313, 96 + (k - 1) * 50 + 26]} b={k === 0 ? [270, 94] : [280, 96 + k * 50 - 2]} t={seg(t, 0.4, 2.4) * 4} from={k + 0.3} to={k + 0.8} f={k === 0 ? C.caramel : C.latte} />
      ))}
      <Decode text="Chapter 2's linked list" t={t} at={2.5} dur={0.5} x={360} y={160} s={13} f={C.caramel} />
      <T x={360} y={182} s={13} f={C.caramel} o={easeOut(seg(t, 2.7, 3.0))}>reused, nothing new</T>
    </Svg>
  );
}

// 3 · Java's HashMap. Its own comment types out; buckets fill with chains; a load meter crosses 0.75 and the
// table doubles; then one overgrown bin reshapes from a list into a small balanced tree.
export function RealLibrary({ t }: StepCtx) {
  const quote = '"a binned (bucketed) hash table"';
  const typed = quote.slice(0, Math.floor(seg(t, 0.2, 1.0) * quote.length));
  const load = clamp(seg(t, 1.0, 1.9)) * 0.8;
  const dbl = easeInOut(seg(t, 1.9, 2.3));
  const tree = easeInOut(seg(t, 2.7, 3.3));
  const nb = dbl > 0.5 ? 16 : 8;
  // overgrown bin: 5 nodes, list -> tree positions
  const listPos = (k: number): [number, number] => [470, 70 + k * 30];
  const treePos: [number, number][] = [[470, 70], [430, 110], [510, 110], [410, 150], [450, 150]];
  return (
    <Svg label="Java's HashMap from its own source comment: chained buckets, a rehash once the load factor passes 0.75, and an overgrown bin turned into a balanced tree" h={320}>
      <T x={30} y={26} s={14} f={C.caramel} serif>java.util.HashMap</T>
      <T x={30} y={48} s={13} f={C.crema}>{typed}</T>
      {Array.from({ length: nb }, (_, i) => <Box key={`${nb}-${i}`} x={30 + i * (nb === 8 ? 44 : 22)} y={70} w={nb === 8 ? 38 : 18} h={18} f={C.taupe} o={nb === 16 ? dbl : 1} sw={1.1} />)}
      <T x={30} y={128} s={13} f={C.latte}>load factor</T>
      <rect x={140} y={118} width={200} height={10} rx={2} fill={C.cocoa} />
      <rect x={140} y={118} width={200 * (dbl > 0.5 ? 0.4 : load)} height={10} rx={2} fill={load > 0.75 && dbl < 0.5 ? C.cherryText : C.crema} />
      <line x1={140 + 200 * 0.75} y1={112} x2={140 + 200 * 0.75} y2={134} stroke={C.caramel} strokeWidth={1.6} />
      <T x={140 + 200 * 0.75} y={154} s={13} f={C.caramel} a="middle">0.75</T>
      <T x={30} y={186} s={13} f={C.latte} o={dbl}>past 0.75: rehash into twice the buckets</T>
      <g opacity={easeOut(seg(t, 2.5, 2.8))}>
        {treePos.map((tp, k) => {
          const p = [lerp(listPos(k)[0], tp[0], tree), lerp(listPos(k)[1], tp[1], tree)];
          return <circle key={k} cx={p[0]} cy={p[1]} r={9} fill={C.cocoa} stroke={C.cinnamon} strokeWidth={1.6} />;
        })}
        {[[0, 1], [0, 2], [1, 3], [1, 4]].map(([a, b], k) => (
          <line key={k} x1={treePos[a][0]} y1={treePos[a][1]} x2={treePos[b][0]} y2={treePos[b][1]} stroke={C.cinnamon} strokeWidth={1.2} opacity={tree} />
        ))}
        {[0, 1, 2, 3].map((k) => <line key={`l${k}`} x1={470} y1={listPos(k)[1] + 9} x2={470} y2={listPos(k + 1)[1] - 9} stroke={C.cinnamon} strokeWidth={1.2} opacity={1 - tree} />)}
      </g>
      <T x={30} y={240} s={13} f={C.cinnamon} o={easeOut(seg(t, 2.8, 3.2))}>footnote: an overgrown bin becomes</T>
      <T x={30} y={262} s={13} f={C.cinnamon} o={easeOut(seg(t, 2.9, 3.3))}>a balanced tree, not pure chaining</T>
    </Svg>
  );
}

// 4 · Predict: α ≈ 1.5. Twenty-four keys rain into sixteen buckets. Before answering, one key is ringed with a
// question; after, the chains are measured against a dashed line at α = 1.5, the average.
export function ChainPredictViz({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const landed = Math.floor(seg(t, 0.1, 1.5) * 24 + 1e-9);
  // incremental counts by landing order
  const r = rng(3);
  const order = Array.from({ length: 24 }, () => Math.floor(r() * 16));
  const now = Array(16).fill(0);
  order.slice(0, answered ? 24 : landed).forEach((b) => now[b]++);
  const unit = 22, base = 210, cw = 32, x0 = 44;
  const line = answered ? easeOut(seg(s, 0.3, 0.9)) : 0;
  return (
    <Svg label="Twenty-four keys hashed into sixteen buckets, a load factor of one and a half; the chain a typical key lands in is about that long" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>&alpha; &asymp; 1.5 (more keys than buckets)</T>
      {Array.from({ length: 16 }, (_, i) => <Box key={i} x={x0 + i * cw} y={base + 4} w={cw - 4} h={14} f={now[i] ? C.crema : C.taupe} sw={1.1} />)}
      {now.map((c, i) => Array.from({ length: c }, (_, k) => <rect key={`${i}-${k}`} x={x0 + i * cw + 4} y={base - (k + 1) * unit + 4} width={cw - 12} height={unit - 6} rx={2} fill={i === 9 && !answered ? C.caramel : C.latte} opacity={0.85} />))}
      {!answered && <circle cx={x0 + 9 * cw + 14} cy={base - 30} r={18 + 2 * Math.sin(t * 5)} fill="none" stroke={C.caramel} strokeWidth={1.4} opacity={landed >= 24 ? 1 : 0} />}
      {!answered && <T x={30} y={284} s={15} f={C.caramel} o={0.7 + 0.3 * Math.sin(t * 3)}>how long is a random key&apos;s chain?</T>}
      {answered && (
        <>
          <line x1={x0 - 6} y1={base - 1.5 * unit} x2={lerp(x0 - 6, x0 + 16 * cw, line)} y2={base - 1.5 * unit} stroke={C.caramel} strokeWidth={2} strokeDasharray="6 4" />
          <T x={30} y={base - 1.5 * unit - 8} s={13} f={C.caramel} o={line}>&alpha;</T>
          <Decode text="about α itself" t={s} at={1.0} dur={0.5} x={30} y={262} s={15} f={C.caramel} />
          <T x={30} y={286} s={13} f={C.latte} o={easeOut(seg(s, 1.4, 1.8))}>n / m, by definition</T>
        </>
      )}
    </Svg>
  );
}

// 5 · The worst case. Every key lands in bucket 0; its chain grows down and wraps into columns; a lookup walker
// crawls the whole chain. A tick: no bucket ever overflows; it only gets slow.
export function WorstCase({ t }: StepCtx) {
  const n = Math.floor(seg(t, 0.2, 2.0) * 40 + 1e-9);
  const pos = (k: number): [number, number] => [70 + Math.floor(k / 8) * 34, 74 + (k % 8) * 22];
  const walk = seg(t, 2.0, 3.2) * 40;
  const wp = pos(Math.min(39, Math.floor(walk)));
  return (
    <Svg label="Every key forced into the same bucket: the chain keeps growing and a lookup has to walk all of it, but nothing overflows" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>every key &rarr; the same bucket</T>
      {Array.from({ length: 12 }, (_, i) => <Box key={i} x={40 + i * 44} y={38} w={36} h={18} f={i === 0 ? C.cherryText : C.taupe} sw={1.1} />)}
      {Array.from({ length: n }, (_, k) => {
        const [x, y] = pos(k);
        return <rect key={k} x={x - 12} y={y} width={24} height={14} rx={2} fill={C.cocoa} stroke={C.cherryText} strokeWidth={1.1} />;
      })}
      {walk > 0 && <circle cx={wp[0] + 18} cy={wp[1] + 7} r={4} fill={C.caramel} />}
      <T x={30} y={262} s={13} f={C.cherryText} o={easeOut(seg(t, 2.2, 2.6))}>access degrades to &Theta;(n)</T>
      <Draw pts={[[300, 256], [306, 262], [318, 246]]} t={t} from={2.8} to={3.0} stroke={C.caramel} w={2.2} pen={false} />
      <T x={330} y={262} s={13} f={C.caramel} o={easeOut(seg(t, 2.9, 3.2))}>but never fails</T>
    </Svg>
  );
}

// 6 · The average is always α. The cited Θ(1 + α) decodes in. Two histograms over the same n and m: a well-
// spread hash (short columns) and a constant hash (one red spike). The same dashed average line sits at α in
// both, by counting. Then the longest column is ringed in each: close to α on the left, all of n on the right.
export function ChainLengthReveal({ t }: StepCtx) {
  const good = spread(48, 24, 9);
  const bad = Array(24).fill(0);
  bad[6] = 48;
  const grow = easeInOut(seg(t, 0.6, 1.6));
  const avg = easeOut(seg(t, 1.8, 2.3));
  const ring = easeOut(seg(t, 3.0, 3.4));
  const gmx = good.indexOf(Math.max(...good));
  return (
    <Svg label="A well-spread hash and a constant hash over the same keys: both have the same average chain length, but only the spread one keeps its longest chain near it" h={320}>
      <Decode text="expected cost Θ(1 + α)" t={t} at={0.1} dur={0.5} x={30} y={24} s={14} f={C.crema} />
      <T x={30} y={50} s={13} f={C.taupe}>cited</T>
      <Hist x0={30} y={250} counts={good} unit={14} cw={10} avg={2} avgO={avg} k={grow} />
      <g>
        <line x1={310} y1={250} x2={560} y2={250} stroke={C.mocha} strokeWidth={1.2} />
        <rect x={310 + 6 * 10} y={250 - 170 * grow} width={9} height={170 * grow} fill={C.cherryText} opacity={0.85} />
        <line x1={306} y1={250 - 2 * 14} x2={554} y2={250 - 2 * 14} stroke={C.caramel} strokeWidth={1.6} strokeDasharray="5 4" opacity={avg} />
      </g>
      <T x={30} y={276} s={13} f={C.crema}>well-spread hash</T>
      <T x={310} y={276} s={13} f={C.cherryText}>constant hash</T>
      <T x={300} y={208} s={13} f={C.caramel} a="middle" o={avg}>avg = &alpha;</T>
      <T x={30} y={304} s={13} f={C.latte} o={easeOut(seg(t, 2.3, 2.7))}>the same average, by counting</T>
      <g opacity={ring}>
        <Reticle x={30 + gmx * 10 + 5} y={250 - good[gmx] * 14 / 2} w={22} h={good[gmx] * 14 + 12} t={t} at={3.0} />
        <Reticle x={310 + 6 * 10 + 5} y={165} w={24} h={180} t={t} at={3.2} color={C.cherryText} />
      </g>
    </Svg>
  );
}

// 7 · The pointer per entry. A chain's nodes split into key | next; every next field flashes red and a memory
// bar shows its share. Then the preview: the keys slide up into table slots and the pointers fall away.
export function PointerCost({ t }: StepCtx) {
  const split = easeOut(seg(t, 0.3, 0.8));
  const pack = easeInOut(seg(t, 2.1, 2.9));
  const nodes = [0, 1, 2, 3];
  return (
    <Svg label="Each chain node carries a key and a next pointer; open addressing, previewed, stores the entries in the table with no pointer" h={300}>
      <T x={30} y={26} s={13} f={C.latte}>chaining: every entry pays for a pointer</T>
      {nodes.map((k) => {
        const x = lerp(40 + k * 130, 40 + k * 60, pack);
        const y = lerp(70, 196, pack);
        return (
          <g key={k}>
            <Box x={x} y={y} w={54} h={28} f={pack > 0.5 ? C.cinnamon : C.crema} />
            <T x={x + 27} y={y + 19} s={13} f={pack > 0.5 ? C.cinnamon : C.crema} a="middle">key</T>
            <g opacity={split * (1 - pack)}>
              <rect x={x + 58} y={y} width={30} height={28} rx={3} fill={C.cocoa} stroke={C.cherryText} strokeWidth={1.4} opacity={0.6 + 0.4 * Math.sin(t * 6 + k)} />
              {k < 3 && <Arrow a={[x + 88, y + 14]} b={[x + 128, y + 14]} t={t} from={0.6 + k * 0.15} to={0.8 + k * 0.15} f={C.cherryText} />}
            </g>
          </g>
        );
      })}
      <T x={30} y={128} s={13} f={C.cherryText} o={split * (1 - pack)}>next: bookkeeping, not data</T>
      <g opacity={easeOut(seg(t, 1.2, 1.5)) * (1 - pack)}>
        <rect x={30} y={146} width={300} height={12} fill={C.crema} opacity={0.7} />
        <rect x={330} y={146} width={160} height={12} fill={C.cherryText} />
      </g>
      {Array.from({ length: 8 }, (_, i) => <Box key={i} x={36 + i * 60} y={192} w={62} h={36} f={C.taupe} fill="none" o={pack} sw={1} />)}
      <T x={30} y={262} s={13} f={C.cinnamon} o={easeOut(seg(t, 2.8, 3.2))}>next topic: entries live in the table, no pointer</T>
    </Svg>
  );
}

// 8 · Prove it. Three real load factors over m = 2,000 buckets: each histogram grows, the average line lands on
// α, and the tallest column stays short. Then the worst case: 500 keys, one bucket, one column that owns them all.
export function ProveIt({ t }: StepCtx) {
  const rows: [string, string, number][] = [
    ['0.50', '1,000', 0.5],
    ['0.75', '1,500', 0.75],
    ['1.50', '3,000', 1.5],
  ];
  const worst = easeInOut(seg(t, 2.6, 3.4));
  return (
    <Svg label="Three load factors on a real table of two thousand buckets: the average tracks alpha and the longest chain stays short; the worst case puts all five hundred keys in one chain" h={320}>
      <T x={30} y={20} s={13} f={C.taupe}>m = 2,000 buckets</T>
      {rows.map(([a, n, v], r) => {
        const y = 82 + r * 70;
        const k = easeInOut(seg(t, 0.3 + r * 0.5, 0.9 + r * 0.5));
        const counts = spread(Math.round(v * 60), 60, 21 + r);
        return (
          <g key={a} opacity={easeOut(seg(t, 0.3 + r * 0.5, 0.5 + r * 0.5))}>
            <T x={30} y={y - 30} s={13} f={C.crema}>&alpha; = {a}</T>
            <T x={30} y={y - 12} s={13} f={C.taupe}>n = {n}</T>
            <Hist x0={150} y={y} counts={counts} unit={9} cw={4} avg={v} avgO={k} k={k} />
          </g>
        );
      })}
      <g opacity={easeOut(seg(t, 2.4, 2.7))}>
        <T x={420} y={52} s={13} f={C.cherryText}>worst case</T>
        <line x1={420} y1={250} x2={560} y2={250} stroke={C.mocha} strokeWidth={1.2} />
        <rect x={470} y={250 - 180 * worst} width={14} height={180 * worst} fill={C.cherryText} />
        <T x={420} y={274} s={13} f={C.cherryText}>500 keys,</T>
        <T x={420} y={294} s={13} f={C.cherryText}>one chain</T>
      </g>
      <T x={30} y={300} s={13} f={C.latte} o={easeOut(seg(t, 3.4, 3.8))}>longest chain: a small fraction</T>
    </Svg>
  );
}
