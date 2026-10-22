import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): caramel = the structure/operation this step is about; cinnamon =
// the compared alternative (usually the array); cherry/cherryText = a genuinely bad outcome (the
// pointer-chasing cost blowing up); taupe/latte = axes, null/empty, quiet labels; crema = nodes and
// records. At most two accents per step.

function node(x: number, y: number, label: string, colour = C.crema, r = 16) {
  return (
    <g key={`${x}-${y}`}>
      <circle cx={x} cy={y} r={r} fill="none" stroke={colour} strokeWidth={1.6} />
      <T x={x} y={y + 4} s={12} f={colour} a="middle">{label}</T>
    </g>
  );
}

// A plain directed line: a short perpendicular tick stands in for an arrowhead, no <marker> needed.
function arrow(x1: number, y1: number, x2: number, y2: number, colour = C.caramel, opacity = 1) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len;
  const tx = x2 - ux * 7, ty = y2 - uy * 7;
  const px = -uy * 4, py = ux * 4;
  return (
    <g key={`${x1}-${y1}-${x2}-${y2}`} opacity={opacity}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={colour} strokeWidth={1.6} />
      <line x1={x2} y1={y2} x2={tx + px} y2={ty + py} stroke={colour} strokeWidth={1.6} />
      <line x1={x2} y1={y2} x2={tx - px} y2={ty - py} stroke={colour} strokeWidth={1.6} />
    </g>
  );
}

// 1 · What do you get back?
export function Opening({ t }: StepCtx) {
  const scatter = easeOut(seg(t, 0.8, 2.4));
  const xs = [30, 90, 150, 210, 270];
  return (
    <Svg label="A contiguous row of records fading as it scatters into loose, pointer-linked nodes" h={280}>
      <T x={30} y={28} s={13} f={C.taupe}>a dynamic array: contiguous, one allocation</T>
      {xs.map((x, i) => {
        const dx = x + (xs[(i * 2) % xs.length] - x) * scatter;
        const dy = 60 + (i % 2 === 0 ? 0 : 1) * 60 * scatter;
        return <rect key={i} x={dx} y={dy} width={40} height={30} rx={4} fill="none" stroke={C.crema} strokeWidth={1.4} opacity={1 - 0.3 * scatter} />;
      })}
      {scatter > 0.5 && arrow(50, 90, 120, 150, C.caramel, easeOut(seg(t, 1.6, 2.4)))}
      <T x={300} y={230} s={16} f={C.caramel} a="middle" o={easeOut(seg(t, 2.2, 3))}>what does giving that up buy back?</T>
    </Svg>
  );
}

// 2 · Predict: append without a tail pointer.
export function SinglyAppendPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const xs = [40, 120, 200, 280];
  return (
    <Svg label="A singly linked list with only a head pointer, asked to append one more node at the end" h={260}>
      <T x={30} y={28} s={13} f={C.taupe}>head &rarr;</T>
      {xs.map((x, i) => node(x, 70, `${i}`))}
      {xs.slice(0, -1).map((x, i) => arrow(x + 16, 70, xs[i + 1] - 16, 70))}
      <T x={360} y={70} s={20} f={C.taupe} a="middle">&hellip;</T>
      {!answered && <T x={300} y={180} s={22} f={C.caramel} a="middle" o={0.7 + 0.3 * Math.sin(t * 3)}>append here: cost?</T>}
      {answered && <T x={300} y={180} s={15} f={C.cherryText} a="middle">walk every node first: O(n)</T>}
    </Svg>
  );
}

// 3 · Doubly: O(1) remove given a node.
export function DoublyRemove({ t }: StepCtx) {
  const removed = seg(t, 1.6, 2.2) > 0;
  const xs = [40, 120, 200, 280];
  return (
    <Svg label="A doubly linked list removing its middle node in one frame by re-pointing its two neighbours" h={280}>
      {xs.map((x, i) => node(x, 70, `${i}`, i === 2 && removed ? C.taupe : C.crema))}
      {xs.slice(0, -1).map((x, i) => arrow(x + 16, 64, xs[i + 1] - 16, 64))}
      {xs.slice(1).map((x, i) => arrow(x - 16, 76, xs[i] + 16, 76, C.latte))}
      {removed && arrow(56, 70, 184, 70, C.caramel, easeOut(seg(t, 1.8, 2.4)))}
      <T x={30} y={140} s={13} f={C.taupe}>{removed ? 'neighbours re-point around it: O(1)' : 'remove node 2, given a pointer to it'}</T>
      <T x={30} y={200} s={13} f={C.latte}>finding the node is unchanged</T>
    </Svg>
  );
}

// 4 · Circular: no null at the ends.
export function Circular({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 1.8));
  const cx = 300, cy = 120, r = 90;
  const n = 6;
  const pts = Array.from({ length: n }, (_, i) => {
    const ang = (i / n) * 2 * Math.PI - Math.PI / 2;
    return [cx + r * Math.cos(ang), cy + r * Math.sin(ang)];
  });
  return (
    <Svg label="A circular doubly linked list with a sentinel node, closed into a ring with no null pointer anywhere" h={280}>
      {pts.map(([x, y], i) => node(x, y, i === 0 ? 'S' : `${i}`, i === 0 ? C.caramel : C.crema))}
      {pts.map(([x, y], i) => {
        const [nx, ny] = pts[(i + 1) % n];
        return arrow(x, y, nx, ny, C.caramel, a);
      })}
      <T x={300} y={240} s={13} f={C.latte} a="middle">S: sentinel &mdash; no end, no null check</T>
    </Svg>
  );
}

// 5 · Same records, scattered in memory.
export function Scatter({ t }: StepCtx) {
  const seqXs = [30, 80, 130, 180, 230, 280];
  const randXs = [30, 240, 90, 300, 150, 60];
  return (
    <Svg label="The same six records, laid out in traversal order on one strip and scattered on another" h={280}>
      <T x={30} y={28} s={13} f={C.taupe}>allocation order matches traversal order</T>
      {seqXs.map((x, i) => (
        <rect key={i} x={x} y={44} width={34} height={26} rx={3} fill="none" stroke={C.caramel} strokeWidth={1.4} opacity={easeOut(seg(t, 0.2 + i * 0.1, 0.6 + i * 0.1))} />
      ))}
      <T x={30} y={150} s={13} f={C.taupe}>allocation order defeats traversal order</T>
      {randXs.map((x, i) => (
        <rect key={i} x={x} y={166} width={34} height={26} rx={3} fill="none" stroke={C.cinnamon} strokeWidth={1.4} opacity={easeOut(seg(t, 0.6 + i * 0.1, 1.0 + i * 0.1))} />
      ))}
      <T x={30} y={240} s={13} f={C.latte}>same six nodes, same next-pointers, different addresses</T>
    </Svg>
  );
}

// 6 · Predict: is walking a list always slower than an array?
export function ChasePredictViz({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="Two traversals, one in allocation order and one against it, with the question of which is slower" h={260}>
      <T x={30} y={40} s={14} f={C.caramel}>in order</T>
      <T x={200} y={40} s={14} f={C.cinnamon}>shuffled</T>
      {!answered && <T x={300} y={160} s={22} f={C.caramel} a="middle" o={0.7 + 0.3 * Math.sin(t * 3)}>always slower?</T>}
      {answered && <T x={300} y={160} s={15} f={C.caramel} a="middle">only when order disagrees with memory</T>}
    </Svg>
  );
}

// 7 · Nine cycles versus four hundred fifty.
export function ChaseMeasured({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.4));
  const b = easeOut(seg(t, 0.8, 2));
  return (
    <Svg label="Sequential pointer-chasing at about nine cycles per element against random at about four hundred fifty" h={300}>
      <T x={30} y={40} s={14} f={C.caramel} serif>in memory order</T>
      <rect x={30} y={50} width={30} height={26} fill={C.caramel} opacity={0.3 * a} />
      <T x={30} y={96} s={13} f={C.crema}>about 9 cycles / element</T>
      <T x={30} y={150} s={14} f={C.cinnamon} serif>shuffled</T>
      <rect x={30} y={160} width={420} height={26} fill={C.cinnamon} opacity={0.3 * b} />
      <T x={30} y={206} s={13} f={C.crema}>about 450+ cycles / element</T>
      <T x={30} y={250} s={14} f={C.latte}>roughly a fiftyfold gap, from allocation order alone</T>
    </Svg>
  );
}

// 8 · O(1) splice versus an array's shift.
export function Splice({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.2));
  const xs = [30, 90, 150, 210, 270, 330];
  return (
    <Svg label="A run of nodes spliced into another list with four pointer rewrites, beside an array shifting every element after the cut" h={320}>
      <T x={30} y={28} s={13} f={C.taupe}>list: splice a run &mdash; 4 pointer rewrites, any length</T>
      {xs.map((x, i) => node(x, 70, `${i}`, i >= 2 && i <= 3 ? C.caramel : C.crema, 14))}
      {[0, 1, 4].map((i) => arrow(xs[i] + 14, 70, xs[i + 1] - 14, 70, C.latte))}
      {arrow(xs[1] + 14, 60, xs[4] - 14, 60, C.caramel, a)}
      <T x={30} y={170} s={13} f={C.taupe}>array: removing the same run shifts every element after it</T>
      {xs.map((x, i) => (
        <rect key={i} x={x - 14 + (i >= 4 ? -60 * a : 0)} y={200} width={28} height={24} rx={3} fill="none" stroke={i >= 2 && i <= 3 ? C.cinnamon : C.crema} strokeWidth={1.4} opacity={i >= 2 && i <= 3 ? 1 - a : 1} />
      ))}
      <T x={30} y={270} s={13} f={C.latte}>cost scales with how much lies between the two ends</T>
    </Svg>
  );
}

// 9 · An address that never moves.
export function StableAddress({ t }: StepCtx) {
  const a = easeOut(seg(t, 1, 2));
  return (
    <Svg label="A pointer into a list node surviving other inserts and removes, unlike a vector pointer that dies on reallocation" h={280}>
      <T x={30} y={28} s={13} f={C.taupe}>list node, address fixed for its lifetime</T>
      {node(100, 70, 'x')}
      <T x={100} y={110} s={13} f={C.caramel} a="middle">&uarr; a long-lived pointer</T>
      <T x={30} y={160} s={13} f={C.taupe} o={a}>other inserts and removes happen elsewhere&hellip;</T>
      <T x={100} y={200} s={14} f={C.caramel} a="middle" o={a}>still valid</T>
      <T x={30} y={250} s={13} f={C.cherryText}>a vector pointer: dead the instant push_back reallocates</T>
    </Svg>
  );
}

// 10 · The intrusive idea.
export function Intrusive({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 1.4));
  return (
    <Svg label="A payload struct with list_head embedded inside it directly, versus a separate node allocation pointing at the payload" h={320}>
      <T x={30} y={28} s={13} f={C.taupe}>generic: a separate node allocation per element</T>
      <rect x={30} y={40} width={70} height={30} rx={4} fill="none" stroke={C.taupe} strokeWidth={1.4} />
      <T x={65} y={60} s={11} f={C.taupe} a="middle">node</T>
      <rect x={130} y={40} width={70} height={30} rx={4} fill="none" stroke={C.crema} strokeWidth={1.4} />
      <T x={165} y={60} s={11} f={C.crema} a="middle">payload</T>
      <T x={30} y={130} s={13} f={C.taupe} o={a}>intrusive: list_head lives inside the payload struct</T>
      <rect x={30} y={150} width={180} height={50} rx={4} fill="none" stroke={C.caramel} strokeWidth={1.6} opacity={a} />
      <T x={120} y={168} s={11} f={C.caramel} a="middle" o={a}>payload struct</T>
      <rect x={45} y={178} width={60} height={16} rx={3} fill={C.caramel} opacity={0.3 * a} />
      <T x={75} y={190} s={10} f={C.caramel} a="middle" o={a}>list_head</T>
      <T x={30} y={240} s={13} f={C.latte}>no second allocation; two embedded fields, two lists</T>
    </Svg>
  );
}

// 11 · Recovering the struct from the link field.
export function ContainerOf({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.6, 1.8));
  return (
    <Svg label="A pointer to an embedded link field walking backward by its fixed offset to the struct's own address" h={300}>
      <rect x={120} y={60} width={180} height={60} rx={4} fill="none" stroke={C.caramel} strokeWidth={1.6} />
      <T x={210} y={50} s={12} f={C.caramel} a="middle">struct address</T>
      <rect x={200} y={78} width={80} height={24} rx={3} fill={C.crema} opacity={0.3} />
      <T x={240} y={94} s={11} f={C.crema} a="middle">link field</T>
      <T x={240} y={130} s={12} f={C.latte} a="middle">pointer here</T>
      {a > 0.1 && arrow(240, 110, 210, 75, C.caramel, a)}
      <T x={30} y={250} s={13} f={C.latte}>subtract the field's fixed, compile-time offset</T>
    </Svg>
  );
}

// 12 · Predict: does container_of check the type?
export function ContainerOfPredictViz({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="container_of called with a mismatched struct type, asking whether anything catches it" h={240}>
      <T x={30} y={40} s={14} f={C.crema}>container_of(ptr, WrongType, member)</T>
      {!answered && <T x={300} y={140} s={22} f={C.caramel} a="middle" o={0.7 + 0.3 * Math.sin(t * 3)}>caught?</T>}
      {answered && <T x={300} y={140} s={15} f={C.caramel} a="middle">yes &mdash; a compile-time type check</T>}
    </Svg>
  );
}

// 13 · Back to the problem.
export function Verdict({ t }: StepCtx) {
  const rows = [
    { name: 'Splice', note: '4 pointer rewrites, any run length', colour: C.caramel },
    { name: 'Stable addresses', note: 'a node never moves while it lives', colour: C.caramel },
    { name: 'Intrusive linking', note: 'no second allocation, several lists', colour: C.caramel },
    { name: 'The cost', note: 'about a fiftyfold gap when order disagrees', colour: C.cherryText },
  ];
  return (
    <Svg label="Three things a linked list buys back, against the one real cost of giving up contiguity" h={300}>
      {rows.map((r, i) => (
        <g key={r.name} opacity={easeOut(seg(t, 0.2 + i * 0.3, 0.8 + i * 0.3))}>
          <T x={30} y={40 + i * 50} s={15} f={r.colour} serif>{r.name}</T>
          <T x={190} y={40 + i * 50} s={13} f={C.crema}>{r.note}</T>
        </g>
      ))}
    </Svg>
  );
}

// 14 · Prove it, 1 of 2.
export function ProveIt1({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.6));
  return (
    <Svg label="Splicing a run out of a 10,000-node list costs 4 pointer rewrites at every run length tested; the array moves thousands" h={300}>
      <T x={30} y={40} s={14} f={C.caramel} serif>list splice</T>
      <T x={160} y={40} s={13} f={C.crema}>4 rewrites, every run length (1, 37, 5,000)</T>
      <rect x={30} y={50} width={40} height={26} fill={C.caramel} opacity={0.3 * a} />
      <T x={30} y={120} s={14} f={C.cinnamon} serif>array shift</T>
      <T x={160} y={120} s={13} f={C.crema}>9,000+ elements moved, same runs</T>
      <rect x={30} y={130} width={480} height={26} fill={C.cinnamon} opacity={0.3 * easeOut(seg(t, 0.6, 1.9))} />
      <T x={30} y={200} s={13} f={C.latte}>the list's cost never changes;</T>
      <T x={30} y={220} s={13} f={C.latte}>the array's always dwarfs it</T>
    </Svg>
  );
}

// 15 · Prove it, 2 of 2.
export function ProveIt2({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.6));
  return (
    <Svg label="A real C struct built with ctypes: the recovered address from subtracting the link field's real offset matches the struct's own address exactly" h={280}>
      <T x={30} y={40} s={14} f={C.caramel} serif>ctypes struct</T>
      <T x={160} y={40} s={13} f={C.crema}>link field address &minus; its real offset</T>
      <T x={30} y={90} s={16} f={C.caramel} o={a}>= struct's own address, exactly</T>
      <T x={30} y={160} s={13} f={C.latte}>a real, working container_of</T>
      <T x={30} y={200} s={13} f={C.taupe}>sourced: about 9 vs about 450 cycles/element (step 7)</T>
    </Svg>
  );
}
