import type { StepCtx } from '../../../../../reels/types';
import { easeOut, easeInOut, seg } from '../../../../../reels/anim';
import { C, Svg, T, Bar } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, this chapter's shared language): crema = an element, node or stored
// entry; latte = secondary labels (a height, a count); taupe = not yet touched; caramel = the
// thing to look at (the search path, the node being linked in); cinnamon (rare) = the alternative
// being compared, always the same side of each pair (p = 1/4 against p = 1/2); cherry (with
// cherryText) = the bad outcome (a tree rotation's several pointers changing together).

function node(x: number, y: number, colour = C.crema, opacity = 1, r = 8) {
  return <circle key={`${x}-${y}-n`} cx={x} cy={y} r={r} fill="none" stroke={colour} strokeWidth={1.6} opacity={opacity} />;
}
function link(x1: number, y1: number, x2: number, y2: number, colour = C.crema, opacity = 1, dash?: string) {
  return <line key={`${x1}-${y1}-${x2}-${y2}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={colour} strokeWidth={1.6} opacity={opacity} strokeDasharray={dash} />;
}

const BASE_X = [60, 120, 180, 240, 300, 360, 420, 480]; // eight stand in for the sixteen-key picture
const HEIGHTS = [2, 1, 4, 1, 3, 1, 2, 1]; // a real seeded draw's shape (examples.py's picture is 16-deep; this is the compressed 8-wide staging)

// 1 · A sorted buffer with no lock on reads
export function Hook({ t }: StepCtx) {
  const aRow = easeOut(seg(t, 0.1, 1.0));
  const aBad = easeOut(seg(t, 1.2, 2.2));
  return (
    <Svg label="A sorted row of keys labelled memtable, with a reader icon beside it needing no lock, next to a small tree whose rotation is shown crossed out for rewriting several pointers at once" h={340}>
      <T x={30} y={24} s={13} f={C.latte}>a write buffer: sorted, high insert rate, lock-free reads</T>
      <g opacity={aRow}>
        {BASE_X.map((x, i) => (
          <g key={i}>
            {node(x, 90, C.crema, 1, 10)}
            <line x1={x + 10} y1={90} x2={x + BASE_X[1] - BASE_X[0] - 10} y2={90} stroke={C.crema} strokeWidth={1.4} opacity={i < BASE_X.length - 1 ? 1 : 0} />
          </g>
        ))}
        <T x={30} y={130} s={12} f={C.crema}>a sorted level, one pointer to the next</T>
      </g>
      <g opacity={aBad}>
        <T x={30} y={190} s={13} f={C.latte}>a balanced tree rebalances by rotating</T>
        {node(260, 240, C.cherry, 1, 10)}
        {node(220, 280, C.cherry, 1, 10)}
        {node(300, 280, C.cherry, 1, 10)}
        {link(260, 250, 220, 271, C.cherry)}
        {link(260, 250, 300, 271, C.cherry)}
        <line x1={190} y1={300} x2={330} y2={260} stroke={C.cherryText} strokeWidth={2.2} />
        <line x1={190} y1={260} x2={330} y2={300} stroke={C.cherryText} strokeWidth={2.2} />
        <T x={340} y={280} s={12} f={C.cherryText}>several pointers, changed together</T>
      </g>
    </Svg>
  );
}

// 2 · Towers by coin flip
export function Towers({ t }: StepCtx) {
  const n = Math.min(BASE_X.length, Math.floor(seg(t, 0.1, 2.0) * BASE_X.length) + 1);
  return (
    <Svg label="A base row of eight keys, each with a tower of coin-flip height rising above it, built one key at a time" h={360}>
      <T x={30} y={24} s={13} f={C.latte}>climb one level per heads, stop on tails</T>
      {BASE_X.slice(0, n).map((x, i) => (
        <g key={i}>
          {Array.from({ length: HEIGHTS[i] }, (_, lvl) => (
            <g key={lvl}>
              {node(x, 280 - lvl * 36, lvl === HEIGHTS[i] - 1 ? C.caramel : C.crema, 1, 7)}
              {lvl > 0 && link(x, 280 - (lvl - 1) * 36 - 7, x, 280 - lvl * 36 + 7, C.crema)}
            </g>
          ))}
        </g>
      ))}
      <T x={30} y={320} s={13} f={C.latte} o={easeOut(seg(t, 1.8, 2.4))}>
        no rule ever looks at the list's size to pick a height
      </T>
    </Svg>
  );
}

// 3 · How many reach the next level up? (predict)
export function Promotion({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.4));
  const rows = [
    { y: 100, label: 'level one', w: 420 },
    { y: 160, label: 'level two', w: 210 },
    { y: 220, label: 'level three', w: 0 }, // the unknown: this predict's question
  ];
  return (
    <Svg label="Two bars shrinking by half at each level, with a third bar left blank as the predict's question" h={320}>
      <T x={30} y={24} s={13} f={C.latte}>nodes reaching each level, promotion probability one in two</T>
      {rows.map((r, i) => (
        <g key={i} opacity={a}>
          <T x={30} y={r.y - 8} s={12} f={C.crema}>{r.label}</T>
          <Bar x={140} y={r.y - 20} w={r.w} h={22} full={420} fill={i === 2 ? C.taupe : C.crema} />
        </g>
      ))}
      <T x={30} y={280} s={13} f={C.caramel} o={easeOut(seg(t, 1.2, 1.8))}>
        same question at every level: what fraction keeps climbing?
      </T>
    </Svg>
  );
}

// 4 · The geometric tower, and its price
export function GeometricPrice({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  return (
    <Svg label="Two pairs of bars: the measured promotion fraction and the measured average pointer count per node, at promotion probability one in four and one in two" h={340}>
      <T x={30} y={24} s={13} f={C.latte}>measured, not assumed</T>
      <T x={30} y={60} s={12} f={C.crema}>promoted, p = one in four</T>
      <Bar x={220} y={50} w={a * 420 * 0.251} h={20} full={420} fill={C.crema} />
      <T x={30} y={100} s={12} f={C.cinnamon}>promoted, p = one in two</T>
      <Bar x={220} y={90} w={a * 420 * 0.499} h={20} full={420} fill={C.cinnamon} />
      <T x={30} y={160} s={12} f={C.crema}>pointers per node, p = one in four</T>
      <Bar x={300} y={150} w={a * 420 * (1.336 / 2.5)} h={20} full={420} fill={C.crema} />
      <T x={30} y={200} s={12} f={C.cinnamon}>pointers per node, p = one in two</T>
      <Bar x={300} y={190} w={a * 420 * (1.997 / 2.5)} h={20} full={420} fill={C.cinnamon} />
      <T x={30} y={290} s={13} f={C.caramel} o={easeOut(seg(t, 1.0, 1.6))}>
        the same fraction, every level
      </T>
      <T x={30} y={312} s={13} f={C.caramel} o={easeOut(seg(t, 1.0, 1.6))}>
        a geometric height, never revisited
      </T>
    </Svg>
  );
}

// 5 · A search, traced
export function SearchTrace({ t }: StepCtx) {
  const target = 5; // index into BASE_X/HEIGHTS: the key this search is looking for
  const pathT = seg(t, 0.2, 2.2);
  // a simple right-then-down path across the towers, ending at the target column
  const stops: [number, number][] = [];
  for (let lvl = 3; lvl >= 0; lvl--) {
    stops.push([BASE_X[Math.min(target, BASE_X.length - 1)] - (lvl === 3 ? 420 : 0), 280 - lvl * 36]);
  }
  return (
    <Svg label="A caramel path stepping right across the towers at the top level, then dropping one level at a time, ending at the target key" h={340}>
      <T x={30} y={24} s={13} f={C.latte}>searching for one key, top level down</T>
      {BASE_X.map((x, i) => (
        <g key={i}>
          {Array.from({ length: HEIGHTS[i] }, (_, lvl) => node(x, 280 - lvl * 36, C.crema, 1, 6))}
        </g>
      ))}
      {[3, 2, 1, 0].map((lvl, i) => {
        const k = easeInOut(seg(pathT, i * 0.22, i * 0.22 + 0.2));
        const y = 280 - lvl * 36;
        const x1 = 60;
        const x2 = BASE_X[target];
        const x = x1 + (x2 - x1) * k;
        return <circle key={lvl} cx={x} cy={y} r={4} fill={C.caramel} opacity={k > 0 ? 1 : 0} />;
      })}
      <line x1={60} y1={244} x2={60} y2={280} stroke={C.caramel} strokeWidth={1.4} opacity={easeOut(seg(pathT, 0.8, 1.0))} />
      <T x={30} y={320} s={13} f={C.caramel} o={easeOut(seg(pathT, 0.85, 1.1))}>
        right while the next key is smaller, else drop a level
      </T>
    </Svg>
  );
}

// 6 · How long does a real search take? (predict)
export function SearchCount({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  return (
    <Svg label="A number line from zero to two thousand, with three candidate marks (twenty, two hundred, two thousand) and the question of which a real twenty-thousand-key search lands near" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>a list of twenty thousand keys — one real search</T>
      <line x1={60} y1={160} x2={540} y2={160} stroke={C.line} strokeWidth={1.4} />
      {[
        { x: 70, label: '~20' },
        { x: 270, label: '~200' },
        { x: 530, label: '~2,000' },
      ].map((m, i) => (
        <g key={i} opacity={a}>
          <circle cx={m.x} cy={160} r={5} fill={C.taupe} />
          <T x={m.x} y={185} s={12} a="middle" f={C.taupe}>{m.label}</T>
        </g>
      ))}
      <T x={30} y={240} s={13} f={C.caramel} o={easeOut(seg(t, 0.8, 1.4))}>
        which mark does the real list land near?
      </T>
    </Svg>
  );
}

// 7 · The bound, and why one in four
export function Bound({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  return (
    <Svg label="Two pairs of bars: the measured average search cost against the paper's bound, at promotion probability one in four and one in two, the one-in-four bar pair both shorter" h={340}>
      <T x={30} y={24} s={13} f={C.latte}>twenty thousand keys, measured against the bound</T>
      <T x={30} y={60} s={12} f={C.crema}>p = one in four: measured</T>
      <Bar x={260} y={50} w={a * 420 * (26.29 / 31)} h={20} full={420} fill={C.crema} />
      <T x={30} y={100} s={12} f={C.crema}>p = one in four: bound</T>
      <Bar x={260} y={90} w={a * 420 * (29.91 / 31)} h={20} full={420} fill={C.taupe} />
      <T x={30} y={160} s={12} f={C.cinnamon}>p = one in two: measured</T>
      <Bar x={260} y={150} w={a * 420 * (28.76 / 31)} h={20} full={420} fill={C.cinnamon} />
      <T x={30} y={200} s={12} f={C.cinnamon}>p = one in two: bound</T>
      <Bar x={260} y={190} w={a * 420 * (30.58 / 31)} h={20} full={420} fill={C.taupe} />
      <T x={30} y={300} s={13} f={C.caramel} o={easeOut(seg(t, 1.0, 1.6))}>
        both measured costs land under thirty — and under their own bound
      </T>
    </Svg>
  );
}

// 8 · Why a reader never sees a broken list
export function Splice({ t }: StepCtx) {
  const before = easeOut(seg(t, 0.1, 0.6));
  const insertAt = seg(t, 0.8, 1.8);
  const newHeight = 3;
  return (
    <Svg label="A new node being spliced into three levels one pointer store at a time, bottom to top, contrasted with the earlier rotation's several pointers moving together" h={340}>
      <T x={30} y={24} s={13} f={C.latte}>inserting one new node, one store per level</T>
      {BASE_X.slice(0, 5).map((x, i) => (
        <g key={i} opacity={before}>
          {Array.from({ length: HEIGHTS[i] }, (_, lvl) => node(x, 280 - lvl * 36, C.crema, 1, 6))}
        </g>
      ))}
      {Array.from({ length: newHeight }, (_, lvl) => {
        const k = easeOut(seg(insertAt, lvl * 0.3, lvl * 0.3 + 0.28));
        return (
          <g key={lvl} opacity={k}>
            {node(270, 280 - lvl * 36, C.caramel, 1, 7)}
            {link(240, 280 - lvl * 36, 258, 280 - lvl * 36, C.caramel, k)}
          </g>
        );
      })}
      <T x={30} y={300} s={13} f={C.caramel} o={easeOut(seg(insertAt, 0.9, 1.3))}>
        three stores for a height-three node
      </T>
      <T x={30} y={322} s={13} f={C.caramel} o={easeOut(seg(insertAt, 0.9, 1.3))}>
        never more than its own height
      </T>
    </Svg>
  );
}

// 9 · Same shape, two real systems
export function TwoSystems({ t }: StepCtx) {
  const a1 = easeOut(seg(t, 0.1, 0.9));
  const a2 = easeOut(seg(t, 1.0, 1.8));
  return (
    <Svg label="Two panels: LevelDB and RocksDB's memtable as the same tower structure, and Redis's sorted set as the same towers with a span number on each link beside a hash table" h={360}>
      <g opacity={a1}>
        <T x={30} y={30} s={13} f={C.caramel}>LevelDB / RocksDB memtable</T>
        <T x={30} y={52} s={12} f={C.latte}>the default, skiplist-based write buffer</T>
        <T x={30} y={72} s={12} f={C.crema}>reads need no lock; writes use release-stores</T>
      </g>
      <g opacity={a2}>
        <T x={30} y={140} s={13} f={C.caramel}>Redis sorted set</T>
        <T x={30} y={162} s={12} f={C.latte}>a skip list, plus a hash table for O(1) score lookup</T>
        {BASE_X.slice(0, 5).map((x, i) => (
          <g key={i}>
            {node(x, 220, C.crema, 1, 7)}
            {i > 0 && link(BASE_X[i - 1] + 7, 220, x - 7, 220, C.crema)}
            {i > 0 && (
              <T x={(BASE_X[i - 1] + x) / 2} y={210} s={11} a="middle" f={C.latte}>
                span
              </T>
            )}
          </g>
        ))}
        <T x={30} y={270} s={12} f={C.crema}>rank: sum the spans already crossed</T>
      </g>
    </Svg>
  );
}

// 10 · Recap
export function Recap({ t }: StepCtx) {
  const lines = ['coin flip at insert, never revisited', 'expected O(log n), not worst case', 'one store per level, bottom-up', 'the same shape runs two real systems'];
  return (
    <Svg label="Four lines recapping the topic: the coin flip, the expected bound, the splice property, and its two real uses" h={340}>
      {lines.map((l, i) => (
        <T key={i} x={40} y={80 + i * 50} s={15} f={C.crema} o={easeOut(seg(t, 0.15 * i, 0.15 * i + 0.6))}>
          {l}
        </T>
      ))}
      <T x={40} y={80 + lines.length * 50 + 6} s={13} f={C.latte} o={easeOut(seg(t, 0.8, 1.4))}>
        expected, not worst case —
      </T>
      <T x={40} y={80 + lines.length * 50 + 28} s={13} f={C.latte} o={easeOut(seg(t, 0.8, 1.4))}>
        what a lock-free reader needs
      </T>
    </Svg>
  );
}

// 11 · Prove it (predict)
export function ProveIt({ t }: StepCtx) {
  const aNext = easeOut(seg(t, 0.1, 0.8));
  const aPrev = easeOut(seg(t, 1.0, 2.0));
  return (
    <Svg label="Next shown as a single forward pointer step, and Prev shown as a fresh search arrow looping back from the current node instead of a stored backward pointer" h={340}>
      <T x={30} y={24} s={13} f={C.latte}>LevelDB's iterator: Next and Prev</T>
      <g opacity={aNext}>
        {node(150, 90, C.crema, 1, 8)}
        {node(230, 90, C.crema, 1, 8)}
        {link(159, 90, 221, 90, C.crema)}
        <T x={150} y={120} s={12} f={C.crema}>Next: follow the real pointer</T>
      </g>
      <g opacity={aPrev}>
        {node(150, 200, C.crema, 1, 8)}
        {node(230, 200, C.caramel, 1, 8)}
        <path d="M230 200 C 190 160, 150 160, 150 196" fill="none" stroke={C.caramel} strokeWidth={1.8} strokeDasharray="4 3" />
        <T x={30} y={240} s={12} f={C.caramel}>Prev: no pointer — search again</T>
        <T x={30} y={260} s={12} f={C.caramel}>for the last key below this one</T>
      </g>
    </Svg>
  );
}
