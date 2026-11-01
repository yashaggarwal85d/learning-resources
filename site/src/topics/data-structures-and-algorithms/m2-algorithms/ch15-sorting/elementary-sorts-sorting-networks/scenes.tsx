import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = a key at rest; latte = secondary labels (index, count,
// tag letter); taupe = keys not yet touched / the unsorted region; caramel = the thing to look
// at (the keys compared this beat, the pivot, the wire lighting up); cinnamon (rare) = the
// alternative being compared; cherry/cherryText = the bad outcome (an unstable swap, a wasted
// comparison, a network that fails).

function keyBar(x: number, baseY: number, value: number, label: string, colour = C.crema) {
  const h = value * 12;
  return (
    <g key={`${x}-${label}`}>
      <rect x={x} y={baseY - h} width={22} height={h} fill="none" stroke={colour} strokeWidth={1.6} />
      <T x={x + 11} y={baseY + 16} s={11} a="middle" f={C.latte}>{label}</T>
    </g>
  );
}

function wire(x1: number, x2: number, y: number, colour = C.crema) {
  return <path key={`${x1}-${x2}-${y}`} d={`M${x1} ${y} L${x2} ${y}`} stroke={colour} strokeWidth={1.4} fill="none" />;
}

// 1 · Hook
export function Hook({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="A short range of a standard library's sort, with a branch pointing to insertion sort for short ranges" h={290}>
      <g opacity={a}>
        <rect x={150} y={70} width={300} height={60} fill="none" stroke={C.taupe} strokeWidth={1.4} />
        <T x={300} y={105} s={13} a="middle" f={C.latte}>a fast library sort</T>
      </g>
      <g opacity={b}>
        <path d="M300 130 L300 165" stroke={C.caramel} strokeWidth={1.6} fill="none" />
        <T x={300} y={185} s={13} a="middle" f={C.caramel}>short range: insertion sort</T>
        <T x={300} y={230} s={12} a="middle" f={C.latte}>the slowest algorithm, last word</T>
      </g>
    </Svg>
  );
}

// 2 · How many comparisons, how many wasted? (predict)
export function InsertionPredict({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  const vals = [5, 2, 4, 6, 1, 3];
  return (
    <Svg label="Six bars of heights five, two, four, six, one, three, with a question mark over how many comparisons sorting them takes" h={260}>
      <g opacity={a}>
        {vals.map((v, i) => keyBar(80 + i * 60, 180, v, String(v), C.taupe))}
      </g>
      <T x={300} y={230} s={13} a="middle" f={C.caramel}>comparisons? wasted ones?</T>
    </Svg>
  );
}

// 3 · Insertion sort
export function InsertionSort({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="A key lifted out of a row of bars, the larger bars sliding right, the key dropping into the gap it left" h={280}>
      <g opacity={a}>
        {[5, 2, 4, 6, 1].map((v, i) => keyBar(80 + i * 60, 180, v, String(v), i === 2 ? C.taupe : C.crema))}
      </g>
      <g opacity={b}>
        <path d="M260 60 L260 100" stroke={C.caramel} strokeWidth={1.6} fill="none" />
        <T x={260} y={48} s={12} a="middle" f={C.caramel}>lifted out</T>
        <T x={300} y={230} s={12} a="middle" f={C.latte}>moves = inversions, exactly</T>
      </g>
    </Svg>
  );
}

// 4 · Selection sort
export function SelectionSort({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="A row of bars with the unsorted part scanned for a minimum, the minimum swapped to the front" h={280}>
      <g opacity={a}>
        {[1, 5, 2, 4, 6].map((v, i) => keyBar(80 + i * 60, 180, v, String(v), i === 0 ? C.caramel : C.taupe))}
      </g>
      <g opacity={b}>
        <path d="M110 220 L320 220" stroke={C.latte} strokeWidth={1.2} strokeDasharray="4 4" fill="none" />
        <T x={300} y={240} s={12} a="middle" f={C.latte}>scan the whole unsorted part, every time</T>
      </g>
    </Svg>
  );
}

// 5 · Bubble sort, and an unstable swap (takeaway)
export function BubbleInstability({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  const b = easeOut(seg(t, 1.4, 2.4));
  return (
    <Svg label="Three bars labeled three-a, one-b, three-c, with selection sort's swap crossing the two equal threes past each other" h={290}>
      <g opacity={a}>
        {keyBar(140, 180, 3, '3a', C.crema)}
        {keyBar(220, 180, 1, '1b', C.crema)}
        {keyBar(300, 180, 3, '3c', C.crema)}
      </g>
      <g opacity={b}>
        <path d="M151 200 Q220 240 311 200" stroke={C.cherryText} strokeWidth={1.4} fill="none" />
        <T x={230} y={255} s={12} a="middle" f={C.cherryText}>3c jumps ahead of 3a</T>
      </g>
    </Svg>
  );
}

// 6 · Stable, in place, or both
export function StableInPlaceTable({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  return (
    <Svg label="A two-by-two table: stable and in place, stable and not, in place and not, neither" h={300}>
      <g opacity={a}>
        <rect x={120} y={80} width={160} height={80} fill="none" stroke={C.caramel} strokeWidth={1.4} />
        <T x={200} y={125} s={11} a="middle" f={C.latte}>stable, in place</T>
        <rect x={320} y={80} width={160} height={80} fill="none" stroke={C.taupe} strokeWidth={1.4} />
        <T x={400} y={125} s={11} a="middle" f={C.latte}>stable, not in place</T>
        <rect x={120} y={180} width={160} height={80} fill="none" stroke={C.taupe} strokeWidth={1.4} />
        <T x={200} y={225} s={11} a="middle" f={C.latte}>unstable, in place</T>
        <rect x={320} y={180} width={160} height={80} fill="none" stroke={C.cherryText} strokeWidth={1.4} />
        <T x={400} y={225} s={11} a="middle" f={C.cherryText}>unstable, not in place</T>
      </g>
    </Svg>
  );
}

// 7 · Why does a fast sort still need the slow one? (predict)
export function CutoffPredict({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="A long recursive sort narrowing down to a short range with a question mark over which algorithm takes over" h={260}>
      <g opacity={a}>
        <rect x={80} y={90} width={440} height={40} fill="none" stroke={C.taupe} strokeWidth={1.4} />
        <rect x={250} y={150} width={100} height={40} fill="none" stroke={C.caramel} strokeWidth={1.6} />
        <T x={300} y={225} s={13} a="middle" f={C.caramel}>short range: which algorithm?</T>
      </g>
    </Svg>
  );
}

// 8 · Three real libraries, one small cutoff (takeaway)
export function SmallSortCutoff({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  const b = easeOut(seg(t, 1.4, 2.4));
  return (
    <Svg label="Two library logos' worth of code, each with its own small cutoff line pointing at a short range" h={290}>
      <g opacity={a}>
        <rect x={90} y={80} width={180} height={60} fill="none" stroke={C.taupe} strokeWidth={1.4} />
        <T x={180} y={115} s={12} a="middle" f={C.latte}>libstdc++</T>
        <T x={180} y={132} s={11} a="middle" f={C.caramel}>cutoff: sixteen</T>
        <rect x={330} y={80} width={180} height={60} fill="none" stroke={C.taupe} strokeWidth={1.4} />
        <T x={420} y={115} s={12} a="middle" f={C.latte}>Rust</T>
        <T x={420} y={132} s={11} a="middle" f={C.caramel}>cutoffs: nine, thirteen</T>
      </g>
      <g opacity={b}>
        <T x={300} y={200} s={12} a="middle" f={C.latte}>no recursion, no call, sequential memory</T>
      </g>
    </Svg>
  );
}

// 9 · A fixed sequence, no branch to mispredict
export function SortingNetworkWires({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  const b = easeOut(seg(t, 1.5, 2.5));
  const ys = [80, 120, 160, 200];
  return (
    <Svg label="Four wires left to right with five compare-exchange crossings drawn at fixed points, independent of any data" h={280}>
      <g opacity={a}>
        {ys.map((y, i) => wire(60, 540, y, C.taupe))}
      </g>
      <g opacity={b}>
        <path d="M150 80 L150 120" stroke={C.caramel} strokeWidth={1.4} fill="none" />
        <path d="M150 160 L150 200" stroke={C.caramel} strokeWidth={1.4} fill="none" />
        <path d="M260 80 L260 160" stroke={C.caramel} strokeWidth={1.4} fill="none" />
        <path d="M370 120 L370 200" stroke={C.caramel} strokeWidth={1.4} fill="none" />
        <path d="M460 120 L460 160" stroke={C.caramel} strokeWidth={1.4} fill="none" />
        <T x={300} y={245} s={12} a="middle" f={C.latte}>five compare-exchanges, fixed in advance</T>
      </g>
    </Svg>
  );
}

// 10 · Checked against every input it can see (takeaway)
export function NetworkChecked({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  const b = easeOut(seg(t, 1.4, 2.4));
  return (
    <Svg label="A strip of zero-one input patterns run through the network, each one coming out sorted" h={280}>
      <g opacity={a}>
        {['0 0 0 0', '0 1 0 1', '1 0 1 0', '1 1 1 1'].map((s, i) => (
          <T key={i} x={160} y={90 + i * 30} s={12} a="start" f={C.taupe}>{s}</T>
        ))}
      </g>
      <g opacity={b}>
        <T x={400} y={90} s={12} a="middle" f={C.caramel}>all sixteen come out sorted</T>
        <T x={300} y={230} s={12} a="middle" f={C.latte}>checked, not just read off one example</T>
      </g>
    </Svg>
  );
}

// 11 · The bound, briefly
export function BoundBriefly({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  const b = easeOut(seg(t, 1.4, 2.4));
  return (
    <Svg label="A hairline marking the information-theoretic bound with the four-input network's own five compare-exchanges landing exactly on it" h={280}>
      <g opacity={a}>
        <path d="M100 150 L500 150" stroke={C.latte} strokeWidth={1.2} strokeDasharray="4 4" />
        <T x={300} y={135} s={11} a="middle" f={C.latte}>the floor no comparison sort beats</T>
      </g>
      <g opacity={b}>
        <rect x={270} y={110} width={60} height={40} fill="none" stroke={C.caramel} strokeWidth={1.6} />
        <T x={300} y={190} s={12} a="middle" f={C.caramel}>the network meets it, right here</T>
      </g>
    </Svg>
  );
}

// 12 · Recap
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  return (
    <Svg label="The three elementary sorts and a sorting network side by side, with the floor they are measured against beneath them" h={280}>
      <g opacity={a}>
        {['insertion', 'selection', 'bubble', 'network'].map((label, i) => (
          <g key={label}>
            <rect x={60 + i * 120} y={90} width={90} height={60} fill="none" stroke={C.taupe} strokeWidth={1.4} />
            <T x={105 + i * 120} y={125} s={11} a="middle" f={C.latte}>{label}</T>
          </g>
        ))}
      </g>
      <T x={300} y={200} s={12} a="middle" f={C.caramel}>the slowest sort still finishes every fast one</T>
    </Svg>
  );
}
