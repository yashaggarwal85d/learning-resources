import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, DESIGN.md): crema = the array's own live state; latte =
// secondary labels; taupe = a slot/node not yet touched; caramel = the thing to look at
// (the nodes a query or update actually visits); cinnamon (rare) = the alternative being
// compared (a segment tree with no lazy tags, set directly against one with them); cherry/
// cherryText = the full leaf-by-leaf work a segment tree with no lazy tags pays that a
// lazy one skips.

const COUNTS = [3, 5, 2, 8, 1, 4, 6, 2, 9, 3, 5, 7, 1, 2, 4];
const N = COUNTS.length;

// one row of N slots, 0-indexed; `touched` indices light up in `colour`.
function row(x: number, y: number, w: number, touched: number[], colour = C.caramel, reveal = 1, labelAll = true) {
  const slotW = w / N;
  const items: React.ReactNode[] = [];
  for (let i = 0; i < N; i++) {
    const isTouched = touched.includes(i);
    const sx = x + i * slotW;
    items.push(
      <rect
        key={`r-${x}-${y}-${i}`}
        x={sx}
        y={y}
        width={slotW - 2}
        height={20}
        rx={2}
        fill={isTouched ? colour : 'none'}
        stroke={isTouched ? colour : C.taupe}
        strokeWidth={1.2}
        opacity={isTouched ? reveal : 0.6}
      />,
    );
    if (labelAll || isTouched) {
      items.push(
        <T key={`l-${x}-${y}-${i}`} x={sx + slotW / 2 - 1} y={y + 14} s={13} f={isTouched ? C.ink : C.latte} a="middle">
          {String(COUNTS[i])}
        </T>,
      );
    }
  }
  return items;
}

// a node of the real segment tree, drawn as a labeled box at (x, y): its own [tl, tr) range.
function node(x: number, y: number, tl: number, tr: number, status: 'idle' | 'recurse' | 'used', reveal = 1) {
  const colour = status === 'used' ? C.caramel : status === 'recurse' ? C.latte : C.taupe;
  return (
    <g opacity={status === 'idle' ? 0.45 : reveal}>
      <rect x={x - 32} y={y - 14} width={64} height={28} rx={4} fill="none" stroke={colour} strokeWidth={1.4} />
      <T x={x} y={y + 5} s={13} f={colour} a="middle">
        [{tl},{tr})
      </T>
    </g>
  );
}

function edge(x1: number, y1: number, x2: number, y2: number, lit: boolean, reveal = 1) {
  return <line x1={x1} y1={y1 + 14} x2={x2} y2={y2 - 14} stroke={lit ? C.caramel : C.mocha} strokeWidth={lit ? 1.6 : 1} opacity={lit ? reveal : 0.5} />;
}

// the real tree, three levels deep: root [0,15), its two children, and the four
// grandchildren — the exact split points _build(1,0,15) computes (tm = (tl+tr)//2 at
// every level), not a schematic stand-in.
function treeLevels(highlight: Record<string, 'recurse' | 'used'>, reveal: number) {
  const L0 = { x: 300, y: 40, tl: 0, tr: 15, key: '1' };
  const L1 = [
    { x: 160, y: 95, tl: 0, tr: 7, key: '2' },
    { x: 440, y: 95, tl: 7, tr: 15, key: '3' },
  ];
  const L2 = [
    { x: 90, y: 150, tl: 0, tr: 3, key: '4' },
    { x: 230, y: 150, tl: 3, tr: 7, key: '5' },
    { x: 370, y: 150, tl: 7, tr: 11, key: '6' },
    { x: 510, y: 150, tl: 11, tr: 15, key: '7' },
  ];
  const status = (key: string): 'idle' | 'recurse' | 'used' => highlight[key] ?? 'idle';
  const items: React.ReactNode[] = [];
  items.push(edge(L0.x, L0.y, L1[0].x, L1[0].y, status('2') !== 'idle', reveal));
  items.push(edge(L0.x, L0.y, L1[1].x, L1[1].y, status('3') !== 'idle', reveal));
  items.push(edge(L1[0].x, L1[0].y, L2[0].x, L2[0].y, status('4') !== 'idle', reveal));
  items.push(edge(L1[0].x, L1[0].y, L2[1].x, L2[1].y, status('5') !== 'idle', reveal));
  items.push(edge(L1[1].x, L1[1].y, L2[2].x, L2[2].y, status('6') !== 'idle', reveal));
  items.push(edge(L1[1].x, L1[1].y, L2[3].x, L2[3].y, status('7') !== 'idle', reveal));
  items.push(node(L0.x, L0.y, L0.tl, L0.tr, status('1'), reveal));
  for (const n of L1) items.push(node(n.x, n.y, n.tl, n.tr, status(n.key), reveal));
  for (const n of L2) items.push(node(n.x, n.y, n.tl, n.tr, status(n.key), reveal));
  return items;
}

// 1 · Opening: the gap left by topic 33 — a range needing a minimum, no Fenwick path for it
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.15, 0.6));
  return (
    <Svg label="Fifteen per-minute event-count slots; a range highlighted needing a minimum, no Fenwick-style path available" h={240}>
      <T x={30} y={24} s={13} f={C.latte}>
        the same fifteen per-minute counts
      </T>
      {row(30, 40, 540, [5, 6, 7, 8, 9, 10], C.crema, 1)}
      <T x={30} y={95} s={13} f={C.crema} o={a}>
        minutes 5 through 10: what's the minimum count?
      </T>
      <T x={30} y={125} s={13} f={C.cherryText} o={a}>
        a Fenwick tree has one operator — sum —
      </T>
      <T x={30} y={145} s={13} f={C.cherryText} o={a}>
        and no index-jump path answers minimum
      </T>
      <T x={30} y={175} s={13} f={C.latte} o={a}>
        this topic builds the structure that can
      </T>
    </Svg>
  );
}

// 2 · TreeReveal: the real tree built above the array, three levels, no highlight yet
export function TreeReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.15, 0.7));
  return (
    <Svg label="A small binary tree built above the array, each node's own range shown, each internal node holding the combine of its two children" h={260}>
      {treeLevels({ '1': 'recurse', '2': 'recurse', '3': 'recurse', '4': 'recurse', '5': 'recurse', '6': 'recurse', '7': 'recurse' }, a)}
      {row(30, 190, 540, [], C.crema, 1)}
    </Svg>
  );
}

// 3 · QueryPredict: the range [5,11) highlighted, candidate node-counts as options
export function QueryPredict({}: StepCtx) {
  return (
    <Svg label="Minutes five through ten highlighted; how many tree nodes does the range query actually visit?" h={240}>
      <T x={30} y={24} s={13} f={C.latte}>
        range sum, minutes 5 through 10
      </T>
      {row(30, 40, 540, [5, 6, 7, 8, 9, 10], C.caramel, 1)}
      <T x={30} y={100} s={13} f={C.crema}>
        how many tree nodes does this query touch?
      </T>
      <T x={30} y={130} s={13} f={C.latte}>
        one · a handful · eleven · all of them
      </T>
    </Svg>
  );
}

// 4 · QueryReveal: the real descent for [5,11), only the visited nodes lit
export function QueryReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.15, 0.7));
  return (
    <Svg label="The real descent for minutes five through ten: six nodes visited, two of them used directly, the rest skipped" h={260}>
      {treeLevels({ '1': 'recurse', '2': 'recurse', '5': 'used', '3': 'recurse', '6': 'used' }, a)}
      {row(30, 190, 540, [5, 6, 7, 8, 9, 10], C.caramel, a)}
    </Svg>
  );
}

// 5 · OperatorReveal: the identical shape, built twice, sum beside minimum
export function OperatorReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.15, 0.6));
  return (
    <Svg label="The identical tree shape built twice: one combining by sum, one by minimum, both over the same array" h={260}>
      <T x={30} y={24} s={13} f={C.latte}>
        sum tree
      </T>
      <T x={330} y={24} s={13} f={C.latte}>
        minimum tree
      </T>
      <g transform="translate(-130, 0)">{treeLevels({ '1': 'used', '2': 'used', '3': 'used' }, a).slice(0, 7)}</g>
      <g transform="translate(130, 0)" opacity={a}>
        <T x={430} y={40} s={13} f={C.crema} a="middle">
          min = 1
        </T>
      </g>
      {row(30, 200, 540, [], C.crema, 1)}
    </Svg>
  );
}

// 6 · IterativeReveal: the flat array layout, a leaf climbing to the root
export function IterativeReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.15, 0.8));
  const path = [20, 10, 5, 2, 1];
  return (
    <Svg label="One flat array of leaves and internal nodes; minute five's own leaf climbs straight up to the root, combining with its sibling at each level" h={260}>
      <T x={30} y={24} s={13} f={C.latte}>
        leaf at position 20 (minute 5), climbing up
      </T>
      {path.map((p, i) => {
        const k = easeOut(seg(t, 0.1 + i * 0.15, 0.1 + i * 0.15 + 0.3));
        return (
          <g key={`climb-${i}`} opacity={Math.max(0.3, k)}>
            <rect x={300 - 30} y={190 - i * 35 - 14} width={60} height={28} rx={4} fill="none" stroke={i === 0 ? C.crema : C.caramel} strokeWidth={1.4} />
            <T x={300} y={190 - i * 35 + 5} s={13} f={i === 0 ? C.crema : C.caramel} a="middle">
              array[{p}]
            </T>
          </g>
        );
      })}
      {row(30, 210, 540, [5], C.crema, a)}
    </Svg>
  );
}

// 7 · LazyPredict: a range-wide update, two candidate costs sketched
export function LazyPredict({}: StepCtx) {
  return (
    <Svg label="Minutes five through ten, all updated at once by the same amount; does it cost touching every slot, or one tag?" h={240}>
      <T x={30} y={24} s={13} f={C.latte}>
        add the same amount to minutes 5 through 10
      </T>
      {row(30, 40, 540, [5, 6, 7, 8, 9, 10], C.cherryText, 1)}
      <T x={30} y={100} s={13} f={C.crema}>
        six leaf-touches, one at a time —
      </T>
      <T x={30} y={120} s={13} f={C.crema}>
        or one tag, at one node?
      </T>
    </Svg>
  );
}

// 8 · LazyReveal: a tag sitting on a node, pushed down one level
export function LazyReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.45));
  const pushed = easeOut(seg(t, 0.55, 1));
  return (
    <Svg label="A lazy add tag sitting on one internal node, marked without visiting its leaves, then pushed down one level as a later query descends past it" h={260}>
      <g opacity={a}>
        {node(230, 150, 3, 7, 'used', 1)}
        <T x={230} y={120} s={13} f={C.caramel} a="middle">
          +3, tagged here
        </T>
      </g>
      <g opacity={pushed}>
        <T x={90} y={200} s={13} f={C.latte} a="middle">
          pushed to [0,3)
        </T>
        <T x={370} y={200} s={13} f={C.latte} a="middle">
          pushed to [7,11)
        </T>
      </g>
      {row(30, 220, 540, [3, 4, 5, 6], C.caramel, pushed)}
    </Svg>
  );
}

// 9 · ComposePredict: an assign tag already on a node, a new add arriving
export function ComposePredict({}: StepCtx) {
  return (
    <Svg label="A node already carries a pending assign tag (set to 7); a new add tag (3) arrives at the same node" h={240}>
      {node(300, 70, 3, 7, 'used', 1)}
      <T x={300} y={40} s={13} f={C.caramel} a="middle">
        pending: assign 7
      </T>
      <T x={300} y={110} s={13} f={C.crema} a="middle">
        a new add 3 arrives — which wins?
      </T>
      <T x={30} y={160} s={13} f={C.latte}>
        combine · fold into the assign · get dropped
      </T>
    </Svg>
  );
}

// 10 · ProveIt: the real measured workload, eager leaf-touches against lazy node-touches
export function ProveIt({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.15, 0.6));
  const eager = 85;
  const lazy = 24;
  const scale = 440 / eager;
  return (
    <Svg label="Ten range-add updates: a segment tree with no lazy tags touched eighty-five leaves in total; the same updates through lazy tags touched twenty-four nodes" h={220}>
      <T x={30} y={24} s={13} f={C.latte}>
        ten range-add updates, same array
      </T>
      <rect x={30} y={50} width={eager * scale * a} height={20} rx={3} fill={C.cherry} />
      <T x={30} y={90} s={13} f={C.cherryText}>
        no lazy tags: {eager} leaf-touches
      </T>
      <rect x={30} y={110} width={lazy * scale * a} height={20} rx={3} fill={C.caramel} />
      <T x={30} y={150} s={13} f={C.crema}>
        lazy tags: {lazy} node-touches
      </T>
    </Svg>
  );
}
