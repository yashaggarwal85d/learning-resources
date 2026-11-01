import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T, Bar } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = a value, a node, a bin's contents; latte = secondary
// labels (a bin index, a count); taupe = a bin or thread nobody is touching, a stalled thread;
// caramel = the thing to look at (the CAS landing, the lock marker, the measured bar);
// cinnamon (rare) = the alternative being compared (a stripe against the whole table, a tree
// against a chain); cherry/cherryText = the bad outcome (a bin that has grown too long by
// chance, a thread blocked behind a slow operation).

function bin(x: number, y: number, label: string, colour = C.crema) {
  return (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width={48} height={34} fill="none" stroke={colour} strokeWidth={1.6} />
      <T x={x + 24} y={y + 22} s={13} a="middle" f={colour}>{label}</T>
    </g>
  );
}

function chainNode(x: number, y: number, label: string, colour = C.crema) {
  return (
    <g key={`${x}-${y}-${label}`}>
      <circle cx={x} cy={y} r={15} fill="none" stroke={colour} strokeWidth={1.6} />
      <T x={x} y={y + 4} s={12} a="middle" f={colour}>{label}</T>
    </g>
  );
}

// 1 · Hook
export function Hook({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.4, 2.3));
  return (
    <Svg label="A row of bins, one holding a short chain, with a lock icon drawn on the chain's first node" h={320}>
      <g opacity={a}>
        {[0, 1, 2, 3, 4].map((i) => bin(100 + i * 70, 100, 'bin', C.taupe))}
        {chainNode(430, 160, 'id', C.crema)}
        {chainNode(465, 190, 'id', C.crema)}
      </g>
      <g opacity={b}>
        <T x={300} y={60} s={12} a="middle" f={C.latte}>a map from request id to a running count</T>
        <T x={300} y={230} s={13} a="middle" f={C.caramel}>sixteen threads, one map, growing</T>
      </g>
    </Svg>
  );
}

// 2 · Does a reader wait, look twice, or get a note? (predict)
export function ReaderDuringResizePredict({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="An old, smaller table beside a new, larger table, with a question mark over a reader arrow" h={300}>
      <g opacity={a}>
        {[0, 1, 2].map((i) => bin(90 + i * 60, 90, 'old', C.taupe))}
        {[0, 1, 2, 3, 4, 5].map((i) => bin(90 + i * 60, 180, 'new', C.taupe))}
      </g>
      <g opacity={b}>
        <path d="M120 260 L120 230" stroke={C.latte} strokeWidth={1.4} fill="none" />
        <T x={120} y={280} s={13} a="middle" f={C.caramel}>reader — wait, look twice, or a note?</T>
      </g>
    </Svg>
  );
}

// 3 · One lock, then many stripes
export function LockStripingStripes({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="One big framed lock around a whole table, then the same table split into several independently locked stripes" h={310}>
      <g opacity={a}>
        <rect x={80} y={70} width={200} height={90} fill="none" stroke={C.cherryText} strokeWidth={1.6} />
        <T x={180} y={120} s={13} a="middle" f={C.cherryText}>one lock, everyone waits</T>
      </g>
      <g opacity={b}>
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={340 + i * 55} y={70} width={48} height={90} fill="none" stroke={C.caramel} strokeWidth={1.6} />
        ))}
        <T x={470} y={185} s={12} a="middle" f={C.latte}>independent stripes</T>
      </g>
    </Svg>
  );
}

// 4 · One compare and swap, no lock
export function CasEmptyBin({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="An empty bin landing one node via a compare and swap, no lock marker anywhere" h={280}>
      <g opacity={a}>
        {bin(240, 110, 'empty', C.taupe)}
      </g>
      <g opacity={b}>
        <path d="M240 60 L240 100" stroke={C.caramel} strokeWidth={1.6} fill="none" />
        <T x={240} y={48} s={12} a="middle" f={C.caramel}>CAS</T>
        <T x={300} y={127} s={12} a="middle" f={C.latte}>first node, no lock</T>
      </g>
    </Svg>
  );
}

// 5 · The first node is the lock (takeaway)
export function LockFirstNode({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="A bin's chain with its first node framed as the lock, two more nodes appended behind it, other bins untouched" h={300}>
      <g opacity={a}>
        {bin(90, 200, 'bin 5', C.taupe)}
        <rect x={360} y={70} width={70} height={44} fill="none" stroke={C.caramel} strokeWidth={1.8} />
        <T x={395} y={97} s={12} a="middle" f={C.caramel}>first node: lock</T>
        {chainNode(430, 140, 'id', C.crema)}
        {chainNode(430, 180, 'id', C.crema)}
      </g>
      <T x={300} y={250} s={12} a="middle" f={C.latte}>no separate lock object, no cost for an empty bin</T>
    </Svg>
  );
}

// 6 · A reader never takes it
export function ReaderNeverLocks({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="A reader arrow passing straight through a locked bin's chain while an update is still in flight" h={280}>
      <g opacity={a}>
        <rect x={200} y={110} width={70} height={44} fill="none" stroke={C.caramel} strokeWidth={1.6} />
        <T x={235} y={137} s={12} a="middle" f={C.caramel}>locked (writer)</T>
        <path d="M100 160 L430 160" stroke={C.latte} strokeWidth={1.4} fill="none" strokeDasharray="4 4" />
        <T x={430} y={190} s={13} a="middle" f={C.latte}>reader — no block</T>
      </g>
    </Svg>
  );
}

// 7 · How long does a chain get, by chance? (predict)
export function ChainLengthPredict({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="A single bin with a growing chain of nodes and a question mark over how long it plausibly gets" h={260}>
      <g opacity={a}>
        {[0, 1, 2, 3].map((i) => chainNode(140 + i * 40, 140, 'id', C.crema))}
        <T x={330} y={140} s={16} a="middle" f={C.caramel}>?</T>
      </g>
      <T x={260} y={220} s={13} a="middle" f={C.latte}>plausible, or astronomically rare?</T>
    </Svg>
  );
}

// 8 · Nine probabilities, computed
export function PoissonBars({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.6));
  // The nine computed probabilities (bin lengths 0..8), drawn as relative bar heights.
  const probs = [0.6065, 0.3033, 0.0758, 0.0126, 0.0016, 0.00016, 0.000013, 0.0000009, 0.00000006];
  const maxH = 150;
  return (
    <Svg label="Nine bars, one per bin length, falling off sharply after the first two" h={260}>
      <g opacity={a}>
        {probs.map((p, i) => {
          const h = Math.max(2, (p / probs[0]) * maxH);
          const x = 70 + i * 38;
          const y = 200 - h;
          return <Bar key={i} x={x} y={y} w={26} h={h} fill={i <= 1 ? C.crema : i < 7 ? C.latte : C.cherryText} />;
        })}
      </g>
      <T x={300} y={225} s={12} a="middle" f={C.latte}>bin length: zero on the left, eight on the right</T>
    </Svg>
  );
}

// 9 · Eight nodes, a tree instead of a chain
export function TreeifiedBin({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="A long chain on the left turning into a small balanced tree on the right, with a branch for a table too small to treeify" h={300}>
      <g opacity={a}>
        {[0, 1, 2, 3].map((i) => chainNode(80 + i * 34, 90, 'id', C.cherryText))}
        <T x={150} y={60} s={12} a="middle" f={C.cherryText}>a long chain</T>
      </g>
      <g opacity={b}>
        <circle cx={340} cy={90} r={15} fill="none" stroke={C.caramel} strokeWidth={1.6} />
        <circle cx={310} cy={140} r={13} fill="none" stroke={C.caramel} strokeWidth={1.4} />
        <circle cx={370} cy={140} r={13} fill="none" stroke={C.caramel} strokeWidth={1.4} />
        <path d="M340 105 L310 127 M340 105 L370 127" stroke={C.caramel} strokeWidth={1.2} fill="none" />
        <T x={340} y={175} s={12} a="middle" f={C.latte}>a balanced tree, table large enough</T>
        <T x={340} y={230} s={12} a="middle" f={C.taupe}>table too small: resize instead</T>
      </g>
    </Svg>
  );
}

// 10 · A note at the old bin's head
export function ForwardingNode({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.4));
  return (
    <Svg label="An old table with one bin replaced by a forwarding marker, a reader following it into the new, larger table, a second thread migrating a different range" h={300}>
      <g opacity={a}>
        {bin(90, 80, 'moved →', C.caramel)}
        {bin(90, 150, 'bin', C.taupe)}
      </g>
      <g opacity={b}>
        {[0, 1, 2, 3].map((i) => bin(280 + i * 55, 80, 'new', C.taupe))}
        <path d="M140 97 L280 97" stroke={C.caramel} strokeWidth={1.4} fill="none" />
        <T x={210} y={85} s={11} a="middle" f={C.caramel}>reader follows the note</T>
        <T x={460} y={170} s={12} a="middle" f={C.latte}>a second thread migrates the next range</T>
      </g>
    </Svg>
  );
}

// 11 · One list, in bit-reversed order
export function SplitOrderedList({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.4));
  return (
    <Svg label="One sorted line of nodes with dummy markers at bucket starts, then four new dummy markers added without moving any real item" h={300}>
      <g opacity={a}>
        <path d="M60 110 L540 110" stroke={C.taupe} strokeWidth={1.2} fill="none" />
        {['D', 'id', 'id', 'D', 'id', 'D', 'id', 'id'].map((lbl, i) => (
          <circle key={i} cx={80 + i * 60} cy={110} r={13} fill="none" stroke={lbl === 'D' ? C.caramel : C.crema} strokeWidth={1.5} />
        ))}
      </g>
      <g opacity={b}>
        <T x={300} y={70} s={12} a="middle" f={C.latte}>D = dummy, marks a bucket's start</T>
        <T x={300} y={160} s={12} a="middle" f={C.caramel}>doubling: four new dummies, zero real items moved</T>
      </g>
    </Svg>
  );
}

// 12 · Eight shards, two locks
export function Shards({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  const b = easeOut(seg(t, 1.5, 2.4));
  return (
    <Svg label="Eight framed shards in a row, two threads landing on different shards in parallel, two more landing on the same shard in sequence" h={290}>
      <g opacity={a}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <rect key={i} x={60 + i * 55} y={90} width={42} height={60} fill="none" stroke={C.taupe} strokeWidth={1.4} />
        ))}
      </g>
      <g opacity={b}>
        <rect x={60} y={90} width={42} height={60} fill="none" stroke={C.caramel} strokeWidth={1.8} />
        <rect x={280} y={90} width={42} height={60} fill="none" stroke={C.cinnamon} strokeWidth={1.8} />
        <T x={300} y={180} s={12} a="middle" f={C.latte}>different shards: parallel. same shard: in turn.</T>
      </g>
    </Svg>
  );
}

// 13 · Recap: three structures, three rungs
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  return (
    <Svg label="Three small pictures side by side — stripes, a bin array with CAS and locks, a split-ordered line — each on its own rung of the progress ladder" h={300}>
      <g opacity={a}>
        <rect x={60} y={90} width={110} height={70} fill="none" stroke={C.taupe} strokeWidth={1.4} />
        <T x={115} y={180} s={11} a="middle" f={C.latte}>lock striping — blocking</T>
        <rect x={220} y={90} width={110} height={70} fill="none" stroke={C.caramel} strokeWidth={1.4} />
        <T x={275} y={180} s={11} a="middle" f={C.latte}>CAS on bins — lock-free on the fast path</T>
        <rect x={380} y={90} width={110} height={70} fill="none" stroke={C.cinnamon} strokeWidth={1.4} />
        <T x={435} y={180} s={11} a="middle" f={C.latte}>split-ordered — lock-free throughout</T>
      </g>
    </Svg>
  );
}
