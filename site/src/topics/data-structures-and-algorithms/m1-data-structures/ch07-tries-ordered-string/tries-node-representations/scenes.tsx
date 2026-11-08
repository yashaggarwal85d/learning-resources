import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Draw, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = a trie's own live state; latte = secondary labels; taupe = an empty
// child slot; caramel = the thing to look at (the path a lookup walks, the slot actually used); cinnamon = the
// alternative being compared (whole-key comparison, the balanced tree's cost); cherryText = memory an array
// node wastes. The words are examples.py's own dictionary (its "ca" family). Byte counts come from CPython's
// sys.getsizeof, so they are drawn as lengths only; counts of nodes and slots are printed by examples.py.

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

type Pt = [number, number];

function Nd({ p, v, c = C.crema, o = 1, r = 14, end = false, ring = false }: { p: Pt; v?: string; c?: string; o?: number; r?: number; end?: boolean; ring?: boolean }) {
  return (
    <g opacity={o}>
      <circle cx={p[0]} cy={p[1]} r={r} fill={C.roast} stroke={c} strokeWidth={ring ? 2.4 : 1.4} />
      {end && <circle cx={p[0]} cy={p[1]} r={r + 4} fill="none" stroke={c} strokeWidth={1} />}
      {v !== undefined && <T x={p[0]} y={p[1] + 5} s={14} f={c} a="middle">{v}</T>}
    </g>
  );
}

function Edge({ a, b, c = C.mocha, w = 1.3, o = 1, dash }: { a: Pt; b: Pt; c?: string; w?: number; o?: number; dash?: string }) {
  return <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={c} strokeWidth={w} opacity={o} strokeDasharray={dash} />;
}

function Tick({ x, y, c = C.caramel, o = 1 }: { x: number; y: number; c?: string; o?: number }) {
  return <rect x={x} y={y} width={10} height={14} rx={2} fill={c} opacity={o} />;
}

/** A node's 26 child slots, a to z; `used` letters are filled. */
function Slots({ x, y, w = 20, used = [], hot, o = 1, show = 1, letters = true }: { x: number; y: number; w?: number; used?: string[]; hot?: string; o?: number; show?: number; letters?: boolean }) {
  return (
    <g opacity={o}>
      {'abcdefghijklmnopqrstuvwxyz'.split('').map((ch, i) => {
        const u = used.includes(ch);
        const c = ch === hot ? C.caramel : u ? C.crema : C.mocha;
        return (
          <g key={ch} opacity={u ? 1 : show}>
            <rect x={x + i * w} y={y} width={w - 2} height={22} rx={2} fill={u ? C.roast : 'none'} stroke={c} strokeWidth={ch === hot ? 2 : 1} />
            {letters && <T x={x + i * w + (w - 2) / 2} y={y + 36} s={12} f={u || ch === hot ? c : C.taupe} a="middle">{ch}</T>}
          </g>
        );
      })}
    </g>
  );
}

// The "ca" family of the dictionary: cat, car, care, cart, cards, card.
type TN = { id: string; ch: string; p: Pt; parent?: string; end?: boolean };
const TRIE: TN[] = [
  { id: '', ch: '', p: [300, 44] },
  { id: 'c', ch: 'c', p: [300, 88], parent: '' },
  { id: 'ca', ch: 'a', p: [300, 132], parent: 'c' },
  { id: 'cat', ch: 't', p: [220, 176], parent: 'ca', end: true },
  { id: 'car', ch: 'r', p: [380, 176], parent: 'ca', end: true },
  { id: 'care', ch: 'e', p: [300, 220], parent: 'car', end: true },
  { id: 'cart', ch: 't', p: [380, 220], parent: 'car', end: true },
  { id: 'card', ch: 'd', p: [460, 220], parent: 'car', end: true },
  { id: 'cards', ch: 's', p: [460, 264], parent: 'card', end: true },
];
const NP = (id: string) => TRIE.find((n) => n.id === id)!.p;
const pathOf = (w: string) => Array.from({ length: w.length + 1 }, (_, i) => w.slice(0, i));

// 1 · Opening. Left: the old way, two whole keys set against each other with one comparison. Right: the new
// way, one key broken into its characters, which drop one at a time down a path.
export function Opening({ t }: StepCtx) {
  const old = 1 - 0.7 * easeInOut(seg(t, 1.4, 1.9));
  const split = easeOut(seg(t, 1.8, 2.2));
  return (
    <Svg label="Earlier structures compared whole keys against each other; a trie breaks the key into characters and follows them one at a time" h={280}>
      <g opacity={old}>
        <T x={30} y={24} s={13} f={C.cinnamon}>so far: whole keys</T>
        <rect x={30} y={60} width={90} height={30} rx={3} fill={C.roast} stroke={C.crema} strokeWidth={1.3} />
        <T x={75} y={80} s={14} f={C.crema} a="middle">cart</T>
        <rect x={170} y={60} width={90} height={30} rx={3} fill={C.roast} stroke={C.crema} strokeWidth={1.3} />
        <T x={215} y={80} s={14} f={C.crema} a="middle">care</T>
        <T x={145} y={81} s={15} f={C.cinnamon} a="middle" o={easeOut(seg(t, 0.4, 0.7))}>?</T>
        <Draw pts={[[75, 98], [145, 116], [215, 98]]} t={t} from={0.5} to={1.0} stroke={C.cinnamon} w={1.6} pen={false} />
      </g>
      <T x={300} y={24} s={13} f={C.caramel} o={easeOut(seg(t, 1.6, 1.9))}>now: a character at a time</T>
      {'cart'.split('').map((ch, i) => {
        const drop = easeOutBack(seg(t, 2.2 + i * 0.35, 2.5 + i * 0.35));
        const x0 = 380 + i * 22;
        return (
          <g key={i} opacity={split}>
            {i > 0 && drop > 0.001 && <Edge a={[420, 60 + (i - 1) * 50]} b={[420, 60 + i * 50]} c={C.caramel} w={1.6} o={clamp(drop)} />}
            <T x={lerp(x0, 420, drop)} y={lerp(60, 65 + i * 50, drop)} s={15} f={drop > 0.001 ? C.caramel : C.crema} a="middle">{ch}</T>
            {drop > 0.001 && <circle cx={420} cy={60 + i * 50} r={14} fill="none" stroke={C.caramel} strokeWidth={1.4} opacity={clamp(drop)} />}
          </g>
        );
      })}
    </Svg>
  );
}

// 2 · The trie grows. Six words go in one at a time; each walks the nodes that already exist and only creates the
// ones it needs. The shared "ca" node lights each time a word passes through it.
const ORDER = ['cat', 'car', 'care', 'cart', 'cards', 'card'];
export function TrieReveal({ t }: StepCtx) {
  const at = (j: number) => 0.3 + j * 0.5;
  const cur = Math.max(-1, Math.min(5, Math.floor((t - 0.3) / 0.5)));
  const word = cur >= 0 ? ORDER[cur] : '';
  const born = (id: string) => {
    if (id === '' || id === 'c' || id === 'ca') return 0;
    const j = ORDER.findIndex((w) => w.startsWith(id));
    return at(j) + 0.06 * (id.length - 2);
  };
  const shared = easeOut(seg(t, 3.4, 3.8));
  return (
    <Svg label="The words cat, car, care, cart, cards and card go in one at a time; each reuses the nodes already there and adds only what it needs; the node for ca is shared by all of them" h={320}>
      <T x={30} y={24} s={13} f={C.latte}>insert</T>
      <T x={30} y={48} s={16} f={C.caramel}>{word}</T>
      {TRIE.filter((n) => n.parent !== undefined).map((n) => {
        const k = easeOut(seg(t, born(n.id), born(n.id) + 0.25));
        const onPath = cur >= 0 && word.startsWith(n.id) && t < 3.3;
        return <Edge key={n.id} a={NP(n.parent!)} b={n.p} c={onPath ? C.caramel : C.mocha} w={onPath ? 2.2 : 1.3} o={k} />;
      })}
      {TRIE.map((n) => {
        const k = n.id.length <= 2 ? 1 : easeOutBack(seg(t, born(n.id), born(n.id) + 0.25));
        const onPath = cur >= 0 && word.startsWith(n.id) && t < 3.3;
        const isCa = n.id === 'ca';
        const c = isCa && shared > 0 ? C.caramel : onPath ? C.caramel : C.crema;
        return k > 0.001 ? <Nd key={n.id} p={n.p} v={n.ch} c={c} o={clamp(k * 3)} r={14 * clamp(k, 0.01, 2)} end={n.end && t >= born(n.id) + 0.25} ring={isCa && shared > 0} /> : null;
      })}
      <T x={330} y={137} s={13} f={C.caramel} o={shared}>shared by every ca-</T>
      <T x={30} y={306} s={13} f={C.latte} o={easeOut(seg(t, 3.5, 3.9))}>outer ring: a word ends here</T>
    </Svg>
  );
}

// 3 · Predict. The trie with a lookup for "cart" waiting at the root, and a faint cloud of many more words beside
// it, pulsing. After answering: the path c-a-r-t lights and four ticks appear, one per character.
export function CostPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.35 + 0.25 * Math.sin(t * 3);
  return (
    <Svg label="A lookup for cart beside a cloud of many more stored words; after answering, the path c, a, r, t lights with one tick per character" h={320}>
      <T x={30} y={24} s={13} f={C.latte}>look up: cart</T>
      {TRIE.filter((n) => n.parent !== undefined).map((n) => <Edge key={n.id} a={NP(n.parent!)} b={n.p} />)}
      {answered && <Draw pts={pathOf('cart').map(NP)} t={s} from={0.2} to={1.0} stroke={C.caramel} w={2.6} pen={false} />}
      {TRIE.map((n) => <Nd key={n.id} p={n.p} v={n.ch} c={answered && 'cart'.startsWith(n.id) && n.id !== '' ? C.caramel : C.crema} end={n.end} />)}
      {Array.from({ length: 14 }, (_, i) => (
        <circle key={i} cx={60 + (i % 4) * 32 + (i % 3) * 6} cy={110 + Math.floor(i / 4) * 34 + (i % 2) * 8} r={8} fill="none" stroke={C.latte} strokeWidth={1} opacity={answered ? 0.25 : pulse} />
      ))}
      <T x={40} y={262} s={13} f={C.latte} o={answered ? 0.4 : 1}>many more words</T>
      {answered && [0, 1, 2, 3].map((i) => <Tick key={i} x={500 + i * 16} y={88} o={easeOut(seg(s, 0.3 + i * 0.2, 0.45 + i * 0.2))} />)}
      {answered && <T x={500} y={80} s={12} f={C.caramel} o={easeOut(seg(s, 0.2, 0.4))}>steps</T>}
      {!answered && <T x={30} y={300} s={15} f={C.cherryText} o={0.7 + 0.3 * Math.sin(t * 3)}>do more words slow this down?</T>}
      {answered && <T x={30} y={300} s={13} f={C.caramel} o={easeOut(seg(s, 1.2, 1.6))}>4 steps: the key&apos;s own length</T>}
    </Svg>
  );
}

// 4 · Cost is L, not n. Left: "card" is looked up, 4 ticks. Then whole other branches of the dictionary (the
// "b" and "d" words) grow around it; the walk is replayed and still costs 4. Right: cost against stored keys:
// a balanced tree's curve climbs with n; the trie's line stays flat at L.
export function CostReveal({ t }: StepCtx) {
  const P: Pt[] = [[170, 44], [170, 88], [170, 132], [170, 176], [170, 220]];
  const walk = (s0: number) => [0, 1, 2, 3].map((i) => easeOut(seg(t, s0 + i * 0.2, s0 + 0.15 + i * 0.2)));
  const w1 = walk(0.3);
  const grow = easeOut(seg(t, 1.3, 1.9));
  const w2 = walk(2.0);
  const chart = easeInOut(seg(t, 2.2, 3.2));
  const others: [Pt, Pt][] = [
    [[170, 44], [70, 88]], [[70, 88], [50, 132]], [[70, 88], [95, 132]], [[50, 132], [40, 176]], [[95, 132], [100, 176]],
    [[170, 44], [260, 88]], [[260, 88], [240, 132]], [[260, 88], [285, 132]], [[240, 132], [230, 176]], [[285, 132], [290, 176]], [[240, 132], [250, 176]],
    [[170, 132], [120, 176]], [[170, 176], [130, 220]], [[170, 176], [215, 220]],
  ];
  const curve: Pt[] = Array.from({ length: 21 }, (_, i) => [350 + i * 10, 220 - 26 * Math.log2(1 + i)]);
  return (
    <Svg label="Looking up card costs four steps; whole other branches of the dictionary grow around it and the lookup still costs four; a balanced tree's cost climbs with the number of keys while the trie's stays flat at the key's length" h={300}>
      {others.map(([a, b], i) => <Edge key={i} a={a} b={b} o={grow} />)}
      {others.map(([, b], i) => <circle key={`o${i}`} cx={b[0]} cy={b[1]} r={8} fill={C.roast} stroke={C.latte} strokeWidth={1} opacity={grow} />)}
      {[0, 1, 2, 3].map((i) => <Edge key={i} a={P[i]} b={P[i + 1]} c={C.caramel} w={2.2} o={Math.max(w1[i] * (1 - grow), w2[i])} />)}
      {['', 'c', 'a', 'r', 'd'].map((ch, i) => <Nd key={i} p={P[i]} v={ch} c={i > 0 && (w1[i - 1] > 0) ? C.caramel : C.crema} />)}
      <T x={30} y={24} s={13} f={C.latte}>look up: card</T>
      {[0, 1, 2, 3].map((i) => <Tick key={i} x={196 + i * 14} y={P[i + 1][1] - 7} o={Math.max(w1[i] * (1 - grow), w2[i])} />)}
      <T x={30} y={270} s={13} f={C.latte} o={grow}>more words; still 4 steps</T>
      <line x1={350} y1={240} x2={560} y2={240} stroke={C.mocha} strokeWidth={1.2} opacity={chart > 0 ? 1 : 0} />
      <line x1={350} y1={90} x2={350} y2={240} stroke={C.mocha} strokeWidth={1.2} opacity={chart > 0 ? 1 : 0} />
      <T x={560} y={260} s={12} f={C.latte} a="end" o={chart > 0 ? 1 : 0}>stored keys &rarr;</T>
      <T x={356} y={84} s={12} f={C.latte} o={chart > 0 ? 1 : 0}>cost &uarr;</T>
      <Draw pts={curve} t={t} from={2.2} to={3.2} stroke={C.cinnamon} w={2} pen={false} />
      <Draw pts={[[350, 200], [550, 200]]} t={t} from={2.4} to={3.2} stroke={C.caramel} w={2.4} pen={false} />
      <T x={560} y={136} s={12} f={C.cinnamon} a="end" o={easeOut(seg(t, 3.1, 3.4))}>tree: log n</T>
      <T x={560} y={222} s={12} f={C.caramel} a="end" o={easeOut(seg(t, 3.2, 3.5))}>trie: L</T>
    </Svg>
  );
}

// 5 · Predict. The node for "ca" as an array of 26 child slots, a to z, all outlined and pulsing. After answering:
// the two slots it uses (r and t) light; the other 24 fade to empty.
export function ArrayPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const fade = answered ? 1 - 0.7 * easeOut(seg(s, 0.3, 0.9)) : pulse;
  return (
    <Svg label="The node for ca as 26 child slots, a to z; after answering, only r and t are used and the other 24 sit empty" h={260}>
      <T x={30} y={24} s={13} f={C.latte}>node &quot;ca&quot;: one slot per letter</T>
      <Nd p={[300, 70]} v="a" c={C.crema} />
      <Slots x={40} y={110} used={answered ? ['r', 't'] : []} show={fade} />
      {answered && ['r', 't'].map((ch) => {
        const i = ch.charCodeAt(0) - 97;
        return <Draw key={ch} pts={[[300, 84], [40 + i * 20 + 9, 108]]} t={s} from={0.4} to={0.8} stroke={C.caramel} w={1.6} pen={false} />;
      })}
      {!answered && <T x={30} y={220} s={15} f={C.cherryText} o={0.7 + 0.3 * Math.sin(t * 3)}>how many get used?</T>}
      {answered && <T x={30} y={220} s={13} f={C.caramel} o={easeOut(seg(s, 0.9, 1.3))}>here, 2 of 26; the rest sit empty</T>}
    </Svg>
  );
}

// 6 · Array children, measured. Top: looking up "r" in that node is one direct jump to slot r, no comparison.
// Below: every node of the whole 21-word dictionary as a row of 26 slots, 31 rows, the 30 used slots lit; then
// examples.py's count: 806 slots, 30 used, 776 empty, 96.3 percent wasted.
const USED_ROWS: number[][] = (() => {
  // Which slots each of the 31 array nodes uses: rebuilt here from examples.py's dictionary.
  const WORDS = ['cat', 'car', 'care', 'cart', 'cards', 'card', 'dog', 'do', 'does', 'dot', 'dote', 'data', 'date', 'dad', 'dab', 'dare', 'bat', 'bath', 'bar', 'ban', 'band'];
  const prefixes = new Set<string>(['']);
  WORDS.forEach((w) => pathOf(w).forEach((p) => prefixes.add(p)));
  const nodes = [...prefixes].sort();
  return nodes.map((p) => [...new Set(WORDS.filter((w) => w.startsWith(p) && w.length > p.length).map((w) => w.charCodeAt(p.length) - 97))]);
})();
export function ArrayReveal({ t }: StepCtx) {
  const jump = easeInOut(seg(t, 0.3, 0.8));
  const grid = (r: number) => easeOut(seg(t, 1.2 + r * 0.03, 1.4 + r * 0.03));
  const nums = easeOut(seg(t, 2.6, 3.0));
  const pct = easeOut(seg(t, 3.2, 3.6));
  const ri = 'r'.charCodeAt(0) - 97;
  return (
    <Svg label="Looking up r is one direct jump to slot r; all 31 nodes of the dictionary drawn as rows of 26 slots light only 30 used slots: 806 slots, 776 empty, 96.3 percent wasted" h={340}>
      <T x={30} y={24} s={13} f={C.latte}>lookup &quot;r&quot;: jump straight to its slot</T>
      <Slots x={40} y={40} used={['r', 't']} hot={jump > 0.5 ? 'r' : undefined} letters={false} />
      <path d={`M ${40 + ri * 20 + 9} 92 L ${40 + ri * 20 + 9} ${lerp(92, 66, jump)}`} stroke={C.caramel} strokeWidth={2} opacity={jump > 0 ? 1 : 0} />
      <T x={40 + ri * 20 + 9} y={108} s={13} f={C.caramel} a="middle" o={jump}>r</T>
      <T x={30} y={108} s={13} f={C.caramel} o={easeOut(seg(t, 0.8, 1.1))}>one step, no compare</T>
      {USED_ROWS.map((used, r) => (
        <g key={r} opacity={grid(r)}>
          {Array.from({ length: 26 }, (_, i) => {
            const u = used.includes(i);
            return <rect key={i} x={40 + i * 7} y={126 + r * 6} width={5.5} height={4.5} fill={u ? C.caramel : 'none'} stroke={u ? C.caramel : C.mocha} strokeWidth={0.6} />;
          })}
        </g>
      ))}
      <T x={250} y={150} s={13} f={C.latte} o={nums}>31 nodes x 26</T>
      <T x={250} y={176} s={13} f={C.crema} o={nums}>806 slots</T>
      <T x={250} y={202} s={13} f={C.caramel} o={nums}>30 used</T>
      <T x={250} y={228} s={13} f={C.cherryText} o={nums}>776 empty</T>
      <T x={250} y={280} s={20} f={C.cherryText} o={pct}>96.3% wasted</T>
    </Svg>
  );
}

// 7 · Same children, four ways. The node for "ca" again, its two children r and t, stored four ways, one row each:
// array (26 slots, 2 used), hash (a small table, 2 buckets filled), sorted list (r, t, found by binary search),
// ternary tree (r with t as its hi child). The trie shape above them never changes.
export function AlternativesReveal({ t }: StepCtx) {
  const row = (i: number) => easeOut(seg(t, 0.4 + i * 0.7, 0.8 + i * 0.7));
  const Y = (i: number) => 86 + i * 58;
  const bs = easeInOut(seg(t, 1.9, 2.4));
  return (
    <Svg label="The children r and t of node ca stored four ways: an array of 26 slots, a hash table, a sorted list searched by binary search, and a ternary search tree node with a hi child" h={320}>
      <T x={30} y={24} s={13} f={C.latte}>node &quot;ca&quot;, children r and t</T>
      <Nd p={[540, 30]} v="a" />
      <T x={30} y={Y(0) - 8} s={13} f={C.crema} o={row(0)}>array</T>
      <g opacity={row(0)}><Slots x={150} y={Y(0) - 26} w={16} used={['r', 't']} letters={false} /></g>
      <T x={30} y={Y(1) - 8} s={13} f={C.crema} o={row(1)}>hash</T>
      <g opacity={row(1)}>
        {Array.from({ length: 8 }, (_, i) => {
          const hit = i === 2 || i === 5;
          return (
            <g key={i}>
              <rect x={150 + i * 30} y={Y(1) - 26} width={26} height={22} rx={2} fill={hit ? C.roast : 'none'} stroke={hit ? C.crema : C.mocha} strokeWidth={1} />
              {hit && <T x={163 + i * 30} y={Y(1) - 10} s={13} f={C.crema} a="middle">{i === 2 ? 't' : 'r'}</T>}
            </g>
          );
        })}
      </g>
      <T x={30} y={Y(2) - 8} s={13} f={C.crema} o={row(2)}>sorted list</T>
      <g opacity={row(2)}>
        {['r', 't'].map((ch, i) => (
          <g key={ch}>
            <rect x={150 + i * 30} y={Y(2) - 26} width={26} height={22} rx={2} fill={C.roast} stroke={C.crema} strokeWidth={1} />
            <T x={163 + i * 30} y={Y(2) - 10} s={13} f={C.crema} a="middle">{ch}</T>
          </g>
        ))}
        <path d={`M ${lerp(163, 193, bs)} ${Y(2) + 4} l -5 8 l 10 0 z`} fill={C.caramel} />
        <T x={230} y={Y(2) - 9} s={12} f={C.caramel} o={bs}>binary search</T>
      </g>
      <T x={30} y={Y(3) - 8} s={13} f={C.crema} o={row(3)}>ternary tree</T>
      <g opacity={row(3)}>
        {/* set right of the label's phone width (the label scales up on phones) */}
        <Nd p={[190, Y(3) - 15]} v="r" r={12} />
        <Edge a={[200, Y(3) - 8]} b={[235, Y(3) + 10]} c={C.latte} />
        <Nd p={[245, Y(3) + 14]} v="t" r={12} />
        <T x={221} y={Y(3) - 14} s={12} f={C.latte}>hi</T>
      </g>
      <T x={30} y={310} s={13} f={C.caramel} o={easeOut(seg(t, 3.4, 3.8))}>same tree; only the node&apos;s storage changes</T>
    </Svg>
  );
}

// 8 · Predict. Left: an array node, 26 slots wide. Right: a ternary-tree node, one character and three arrows
// (lo, eq, hi). After answering: a size bar under each (lengths only: the array node far longer), and the eq
// arrow lights: that is the one that moves to the next character.
export function TSTPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const bars = answered ? easeInOut(seg(s, 0.3, 1.0)) : 0;
  return (
    <Svg label="An array node of 26 slots beside a ternary-tree node of one character and three arrows; after answering, the ternary node's size bar is far shorter and its eq arrow advances a character" h={280}>
      <T x={30} y={24} s={13} f={C.latte}>array node</T>
      <Slots x={30} y={40} w={10} used={['r', 't']} letters={false} />
      <T x={330} y={24} s={13} f={C.latte}>ternary node</T>
      <Nd p={[420, 60]} v="r" />
      {[[-1, 'lo'], [0, 'eq'], [1, 'hi']].map(([d, l]) => (
        <g key={l as string}>
          <Edge a={[420, 74]} b={[420 + (d as number) * 50, 116]} c={l === 'eq' && answered ? C.caramel : C.latte} w={l === 'eq' && answered ? 2.2 : 1.3} />
          <T x={420 + (d as number) * 50} y={134} s={12} f={l === 'eq' && answered ? C.caramel : C.latte} a="middle">{l as string}</T>
        </g>
      ))}
      <rect x={30} y={164} width={250 * bars} height={14} rx={2} fill={C.cherryText} />
      <rect x={330} y={164} width={250 * (72 / 312) * bars} height={14} rx={2} fill={C.caramel} />
      <T x={30} y={198} s={12} f={C.latte} o={bars}>bytes per node</T>
      {!answered && <T x={30} y={260} s={15} f={C.cherryText} o={pulse}>smaller, still a char a step?</T>}
      {answered && <T x={30} y={260} s={13} f={C.caramel} o={easeOut(seg(s, 1.1, 1.5))}>yes: eq moves to the next character</T>}
    </Svg>
  );
}

// 9 · The ternary search tree, walked. examples.py's insert order (cat, car, care, cart, cards, card) builds this
// tree. Looking up "card": c eq, a eq; at t, r is smaller: lo, same character; at r, equal: eq, next character;
// at e, d is smaller: lo; at d, equal: found. The caret on the key only moves on eq.
const TST: { id: string; ch: string; p: Pt; from?: string; kind?: 'lo' | 'eq' | 'hi' }[] = [
  { id: 'c', ch: 'c', p: [270, 44] },
  { id: 'a', ch: 'a', p: [270, 90], from: 'c', kind: 'eq' },
  { id: 't', ch: 't', p: [270, 136], from: 'a', kind: 'eq' },
  { id: 'r', ch: 'r', p: [190, 182], from: 't', kind: 'lo' },
  { id: 'e', ch: 'e', p: [190, 228], from: 'r', kind: 'eq' },
  { id: 'd', ch: 'd', p: [120, 274], from: 'e', kind: 'lo' },
  { id: 't2', ch: 't', p: [260, 274], from: 'e', kind: 'hi' },
  { id: 's', ch: 's', p: [120, 320], from: 'd', kind: 'eq' },
];
const TP = (id: string) => TST.find((n) => n.id === id)!.p;
export function TSTReveal({ t }: StepCtx) {
  const visits = ['c', 'a', 't', 'r', 'e', 'd'];
  const moves: ('eq' | 'lo')[] = ['eq', 'eq', 'lo', 'eq', 'lo', 'eq'];
  const at = (i: number) => 0.4 + i * 0.45;
  const reached = visits.filter((_, i) => t >= at(i)).length;
  const caret = moves.slice(0, Math.max(0, reached - 1)).filter((m) => m === 'eq').length;
  const found = easeOut(seg(t, at(5) + 0.3, at(5) + 0.6));
  return (
    <Svg label="A ternary search tree built from cat, car, care, cart, cards and card; looking up card follows eq, eq, lo, eq, lo, then finds d; the key's caret advances only on eq" h={350}>
      {TST.filter((n) => n.from).map((n) => {
        const idx = visits.indexOf(n.id);
        const lit = idx > 0 && reached > idx;
        return (
          <g key={n.id}>
            <Edge a={TP(n.from!)} b={n.p} c={lit ? (n.kind === 'eq' ? C.caramel : C.cinnamon) : C.mocha} w={lit ? 2.4 : 1.3} dash={n.kind === 'eq' ? undefined : '4 3'} />
            <T x={(TP(n.from!)[0] + n.p[0]) / 2 + (n.kind === 'eq' ? 8 : n.kind === 'lo' ? -24 : 8)} y={(TP(n.from!)[1] + n.p[1]) / 2 + 4} s={12} f={C.latte}>{n.kind}</T>
          </g>
        );
      })}
      {TST.map((n) => {
        const idx = visits.indexOf(n.id);
        const on = idx >= 0 && reached > idx;
        return <Nd key={n.id} p={n.p} v={n.ch} c={on ? (n.id === 'd' && found > 0 ? C.caramel : C.crema) : C.latte} ring={on && idx === reached - 1} end={['t', 'r', 'e', 't2', 'd', 's'].includes(n.id)} />;
      })}
      <T x={380} y={60} s={13} f={C.latte}>look up</T>
      {'card'.split('').map((ch, i) => (
        <T key={i} x={390 + i * 24} y={96} s={18} f={i < caret ? C.caramel : i === caret ? C.crema : C.latte} a="middle">{ch}</T>
      ))}
      <path d={`M ${lerp(390, 390 + 24 * 3, Math.min(caret, 3) / 3)} 106 l -6 10 l 12 0 z`} fill={C.crema} opacity={found > 0 ? 0 : 1} />
      <T x={380} y={160} s={12} f={C.cinnamon}>lo / hi: same char</T>
      <T x={380} y={182} s={12} f={C.caramel}>eq: next char</T>
      <T x={380} y={240} s={13} f={C.caramel} o={found}>found: card</T>
    </Svg>
  );
}

// 10 · Prove it. examples.py's measured bytes for the identical 21-word dictionary, drawn as lengths (CPython
// sizes): array longest, then sorted list, hash, and the ternary tree shortest. Then its exact counts: 806 array
// slots, 776 empty, 96.3 percent wasted.
export function ProveIt({ t }: StepCtx) {
  const rows: [string, number, string][] = [
    ['array', 9672, C.cherryText],
    ['sorted list', 6232, C.crema],
    ['hash', 5392, C.crema],
    ['ternary tree', 2160, C.caramel],
  ];
  const S = 360 / 9672;
  const tail = easeOut(seg(t, 2.6, 3.0));
  return (
    <Svg label="Measured memory on the identical 21-word dictionary, drawn as lengths: the array representation the largest, then sorted list, then hash, and the ternary search tree the smallest; 806 array slots, 776 empty, 96.3 percent wasted" h={300}>
      <T x={30} y={24} s={13} f={C.crema}>21 words, measured bytes</T>
      {rows.map(([name, b, c], i) => {
        const g = easeInOut(seg(t, 0.3 + i * 0.45, 0.9 + i * 0.45));
        const y = 50 + i * 38;
        return (
          <g key={name}>
            <T x={30} y={y + 14} s={13} f={c}>{name}</T>
            <rect x={160} y={y} width={b * S * g} height={18} rx={2} fill={c} />
          </g>
        );
      })}
      <Draw pts={[[160 + 2160 * S + 12, 172], [160 + 2160 * S + 18, 178], [160 + 2160 * S + 30, 164]]} t={t} from={2.2} to={2.45} stroke={C.caramel} w={2} pen={false} />
      <T x={30} y={232} s={13} f={C.latte} o={tail}>array: 806 slots, 776 empty</T>
      <T x={30} y={266} s={18} f={C.cherryText} o={easeOut(seg(t, 3.0, 3.4))}>96.3% wasted</T>
    </Svg>
  );
}
