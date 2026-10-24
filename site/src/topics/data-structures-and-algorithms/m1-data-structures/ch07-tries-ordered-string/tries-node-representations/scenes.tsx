import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = a trie's own live state; latte = secondary labels;
// taupe = an empty/unallocated child slot; caramel = the thing to look at (the path a lookup
// walks); cinnamon = the alternative being compared (one representation's memory set against
// another's); cherry/cherryText = the bad outcome (memory an array node wastes).

function node(cx: number, cy: number, r: number, colour = C.crema, opacity = 1, label?: string) {
  return (
    <g key={`${cx}-${cy}-n`} opacity={opacity}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={colour} strokeWidth={1.4} />
      {label !== undefined && (
        <T x={cx} y={cy + 4} s={13} f={colour} a="middle">
          {label}
        </T>
      )}
    </g>
  );
}

function edge(x1: number, y1: number, x2: number, y2: number, colour = C.latte, opacity = 1) {
  return <line key={`${x1}-${y1}-${x2}-${y2}-e`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={colour} strokeWidth={1.2} opacity={opacity} />;
}

function fill(x: number, y: number, w: number, h: number, colour = C.caramel, opacity = 1) {
  return <rect key={`${x}-${y}-f`} x={x} y={y} width={w} height={h} rx={3} fill={colour} opacity={opacity} />;
}

function slots(x: number, y: number, w: number, count: number, filled: number[], colour = C.crema) {
  const slotW = w / count;
  const items = [] as React.ReactNode[];
  items.push(<rect key={`${x}-${y}-box`} x={x} y={y} width={w} height={16} rx={2} fill="none" stroke={colour} strokeWidth={1.2} />);
  for (let i = 0; i < count; i++) {
    const sx = x + i * slotW + slotW / 2;
    const isFilled = filled.includes(i);
    items.push(
      <circle key={`${x}-${y}-s${i}`} cx={sx} cy={y + 8} r={2.2} fill={isFilled ? colour : 'none'} stroke={isFilled ? 'none' : C.taupe} strokeWidth={1} />
    );
  }
  return items;
}

// 1 · Opening: a few words first as hash entries, then redrawn as a shared-prefix tree
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  return (
    <Svg label="A handful of words shown first as hash table entries, then as a tree of shared prefixes" h={260}>
      <T x={30} y={24} s={13} f={C.latte}>cat, car, care, cart — compared whole, against each other</T>
      {['cat', 'car', 'care', 'cart'].map((w, i) => (
        <g key={`w-${i}`}>
          <rect x={30} y={44 + i * 26} width={120} height={18} rx={2} fill="none" stroke={C.crema} strokeWidth={1.2} opacity={Math.max(0.3, 1 - a)} />
          <T x={38} y={58 + i * 26} s={13} f={C.crema} o={Math.max(0.2, 1 - a)}>{w}</T>
        </g>
      ))}
      <path d="M 220 90 L 300 90" stroke={C.caramel} strokeWidth={1.4} opacity={a} markerEnd="url(#arrow)" />
      {node(360, 60, 16, C.crema, a)}
      {edge(360, 60, 330, 110, C.caramel, a)}
      {edge(360, 60, 390, 110, C.caramel, a)}
      {node(330, 110, 13, C.crema, a)}
      {node(390, 110, 13, C.crema, a)}
      <T x={30} y={200} s={13} f={C.crema} o={a}>one character walked at a time, instead</T>
    </Svg>
  );
}

// 2 · TrieReveal: the shared-prefix tree over the word list, edges labeled by character
export function TrieReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.15, 0.6));
  const b = easeOut(seg(t, 0.5, 1));
  return (
    <Svg label="A trie over cat, car, care, cart: shared nodes for every shared prefix" h={260}>
      <T x={30} y={24} s={13} f={C.latte}>characters live in the nodes, not the keys</T>
      {node(220, 50, 14, C.crema)}
      {edge(220, 50, 220, 100, C.caramel, a)}
      {node(220, 100, 13, C.crema, a, 'c')}
      {edge(220, 100, 220, 150, C.caramel, a)}
      {node(220, 150, 13, C.crema, a, 'a')}
      {edge(220, 150, 170, 200, C.caramel, b)}
      {edge(220, 150, 270, 200, C.caramel, b)}
      {node(170, 200, 12, C.crema, b, 't')}
      {node(270, 200, 12, C.crema, b, 'r')}
      {edge(270, 200, 270, 240, C.cinnamon, b)}
      {node(270, 240, 11, C.cinnamon, b, 'e')}
      <T x={30} y={225} s={13} f={C.crema} o={b}>"ca" is shared by cat, car, care and cart alike</T>
    </Svg>
  );
}

// 3 · CostPredict: the same trie, redrawn sparse and then with many more words, path lit both times
export function CostPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const pulse = 0.7 + 0.3 * Math.sin(t * 3);
  return (
    <Svg label="The same lookup path highlighted on a small trie and a much larger one" h={240}>
      {node(120, 70, 14, C.crema)}
      {edge(120, 70, 120, 120, C.caramel, 1)}
      {node(120, 120, 12, C.caramel, Math.max(0.5, pulse))}
      <T x={60} y={160} s={13} f={C.latte}>sparse dictionary</T>
      {Array.from({ length: 9 }).map((_, i) => (
        <circle key={`many-${i}`} cx={300 + (i % 3) * 30} cy={60 + Math.floor(i / 3) * 30} r={9} fill="none" stroke={C.crema} strokeWidth={1} />
      ))}
      {edge(300, 60, 300, 150, C.caramel, 1)}
      {node(300, 150, 12, C.caramel, Math.max(0.5, pulse))}
      <T x={260} y={190} s={13} f={C.latte}>many more words added</T>
      <T x={30} y={220} s={13} f={answered ? C.crema : C.cherryText} o={1}>
        {answered ? "no — cost depends only on the key's own length" : 'does the lookup cost depend on how many keys share the trie?'}
      </T>
    </Svg>
  );
}

// 4 · CostReveal: the lookup path lit identically across both trie sizes, a step counter
export function CostReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.15, 0.7));
  return (
    <Svg label="A step counter ticking exactly to the key's length, on a small trie and a large one alike" h={240}>
      <T x={30} y={24} s={13} f={C.latte}>one step per character — c, a, r, t</T>
      {['c', 'a', 'r', 't'].map((ch, i) => (
        <g key={`step-${i}`}>
          {node(90 + i * 90, 100, 15, C.caramel, Math.max(0.3, easeOut(seg(t, 0.1 + i * 0.15, 0.4 + i * 0.15))), ch)}
          {i > 0 && edge(90 + i * 90 - 90, 100, 90 + i * 90, 100, C.caramel, a)}
        </g>
      ))}
      <T x={30} y={180} s={13} f={C.crema} o={a}>four steps for a four-letter key — never more, never fewer</T>
      <T x={30} y={205} s={13} f={C.crema} o={a}>add a million more words: this lookup's cost doesn't move</T>
    </Svg>
  );
}

// 5 · ArrayPredict: one node's own 26-slot array, most slots hollow
export function ArrayPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="One trie node's own 26 child slots, most of them empty" h={220}>
      <T x={30} y={24} s={13} f={C.latte}>one node, one slot per possible next character</T>
      {slots(30, 50, 340, 26, [2, 0], C.crema)}
      <T x={30} y={100} s={13} f={answered ? C.crema : C.cherryText} o={1}>
        {answered ? 'most stay empty — a sparse dictionary rarely fills 26 real children' : 'what happens to most of these 26 slots?'}
      </T>
    </Svg>
  );
}

// 6 · ArrayReveal: every node's array drawn at once, the vast majority of slots hollow
export function ArrayReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.15, 0.75));
  const filledRows = [[2], [0, 17], [], [19], []];
  return (
    <Svg label="Every node's own 26-slot array, almost all slots empty, the few filled ones highlighted" h={260}>
      <T x={30} y={24} s={13} f={C.latte}>one step, no comparison — and almost every slot unused</T>
      {filledRows.map((filled, i) => (
        <g key={`row-${i}`} opacity={Math.max(0.3, a)}>
          {slots(30, 44 + i * 26, 300, 26, filled, C.crema)}
        </g>
      ))}
      <T x={30} y={210} s={13} f={C.cherryText} o={a}>measured on this dictionary: 96.3 percent of slots sit empty</T>
    </Svg>
  );
}

// 7 · AlternativesReveal: the same node redrawn three more ways
export function AlternativesReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.45));
  const b = easeOut(seg(t, 0.4, 0.75));
  const c = easeOut(seg(t, 0.7, 1.05));
  return (
    <Svg label="The same node's children stored as a hash table, a sorted list, and a tiny three-child comparison structure" h={260}>
      <T x={30} y={24} s={13} f={C.latte}>same tree underneath — only the per-node storage changes</T>
      <T x={30} y={54} s={13} f={C.cinnamon} o={a}>hash table, keyed by character</T>
      {[0, 1].map((i) => (
        <circle key={`h-${i}`} cx={60 + i * 30} cy={80} r={9} fill="none" stroke={C.cinnamon} strokeWidth={1.2} opacity={a} />
      ))}
      <T x={30} y={120} s={13} f={C.cinnamon} o={b}>sorted list, searched by binary search</T>
      {['a', 'r', 't'].map((ch, i) => (
        <g key={`sl-${i}`}>
          <rect x={30 + i * 40} y={135} width={32} height={18} fill="none" stroke={C.cinnamon} strokeWidth={1.2} opacity={b} />
          <T x={46 + i * 40} y={148} s={13} f={C.cinnamon} a="middle" o={b}>{ch}</T>
        </g>
      ))}
      <T x={30} y={188} s={13} f={C.caramel} o={c}>ternary search tree: one character, three children</T>
      {node(90, 220, 14, C.caramel, c, 'r')}
      {edge(90, 220, 60, 240, C.caramel, c)}
      {edge(90, 220, 120, 240, C.caramel, c)}
      {node(60, 240, 10, C.caramel, c)}
      {node(120, 240, 10, C.caramel, c)}
    </Svg>
  );
}

// 8 · TSTPredict: one TST node's three fields beside the array's 26 slots
export function TSTPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="A ternary search tree node's own three fields, set beside an array node's 26 slots" h={240}>
      {slots(30, 40, 300, 26, [2], C.crema)}
      <T x={30} y={80} s={13} f={C.latte}>array: 26 slots</T>
      {node(260, 140, 16, C.caramel, 1, 'r')}
      {edge(260, 140, 220, 180, C.caramel, 1)}
      {edge(260, 140, 300, 180, C.caramel, 1)}
      {node(220, 180, 11, C.caramel, 1)}
      {node(300, 180, 11, C.caramel, 1)}
      <T x={200} y={210} s={13} f={C.latte}>TST: one character, three children</T>
      <T x={30} y={200} s={13} f={answered ? C.crema : C.cherryText} o={1}>
        {answered ? 'yes — comparing one character needs far less memory' : 'can three references beat 26 slots without extra steps?'}
      </T>
    </Svg>
  );
}

// 9 · TSTReveal: the full dictionary's TST beside the array trie's mostly-hollow nodes
export function TSTReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.15, 0.75));
  return (
    <Svg label="The dictionary's own ternary search tree, three-way branches throughout, beside the array trie's mostly-hollow nodes" h={260}>
      <T x={30} y={24} s={13} f={C.latte}>lo and hi compare a position; equal advances to the next one</T>
      {node(120, 60, 14, C.caramel, 1, 'c')}
      {edge(120, 60, 120, 110, C.caramel, 1)}
      {node(120, 110, 13, C.caramel, 1, 'a')}
      {edge(120, 110, 90, 150, C.caramel, a)}
      {edge(120, 110, 150, 150, C.caramel, a)}
      {node(90, 150, 11, C.caramel, a, 't')}
      {node(150, 150, 11, C.caramel, a, 'r')}
      <T x={30} y={200} s={13} f={C.crema} o={a}>measured least memory of all four representations</T>
    </Svg>
  );
}

// 10 · ProveIt: four memory bars, populated with examples.py's own measured bytes
export function ProveIt({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.5));
  const b = easeOut(seg(t, 0.4, 0.8));
  const c = easeOut(seg(t, 0.7, 1.1));
  const d = easeOut(seg(t, 1.0, 1.4));
  return (
    <Svg label="Four memory bars: array, hash, sorted-list, and ternary search tree, on the identical dictionary" h={280}>
      <T x={30} y={24} s={13} f={C.crema}>real bytes per representation, identical dictionary</T>
      {fill(30, 36, 300 * a, 18, C.cherry, Math.max(0.3, a))}
      <T x={30} y={78} s={13} f={C.cherryText} o={a}>array</T>
      {fill(30, 96, 167 * b, 18, C.cinnamon, Math.max(0.3, b))}
      <T x={30} y={138} s={13} f={C.cinnamon} o={b}>hash</T>
      {fill(30, 156, 193 * c, 18, C.latte, Math.max(0.3, c))}
      <T x={30} y={198} s={13} f={C.latte} o={c}>sorted-list</T>
      {fill(30, 216, 67 * d, 18, C.caramel, Math.max(0.3, d))}
      <T x={30} y={258} s={13} f={C.caramel} o={d}>ternary search tree</T>
    </Svg>
  );
}
