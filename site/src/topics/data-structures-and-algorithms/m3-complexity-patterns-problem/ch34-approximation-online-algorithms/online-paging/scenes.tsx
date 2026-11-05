import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = the algorithm's own solution (the cache contents);
// latte = secondary labels; taupe = not yet decided; caramel = the thing to look at (the
// page being evicted, the move being tried); cinnamon (rare) = the benchmark (the offline
// optimum); cherry/cherryText = the bad outcome (a fault, the cache losing every time).

// 1 · The hook: a cache that always loses
export function CyclicTrace({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="Four cache slots and a five-page request stream, every request landing on the page just evicted" h={260}>
      <g opacity={a}>
        {Array.from({ length: 4 }).map((_, i) => (
          <rect key={i} x={160 + i * 70} y={70} width={50} height={50} fill="none" stroke={C.taupe} strokeWidth={1.6} />
        ))}
        <rect x={160} y={160} width={330} height={26} fill="none" stroke={C.cherry} strokeWidth={1.4} />
        <T x={325} y={177} s={11} a="middle" f={C.cherryText}>request stream cycles through five pages</T>
      </g>
      <T x={300} y={230} s={12} a="middle" f={C.cherryText}>every request lands on the page just evicted</T>
    </Svg>
  );
}

// 2 · The online constraint named
export function OnlineConstraint({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="A split screen: one side deciding with only the past, the other seeing the whole future" h={250}>
      <g opacity={a}>
        <T x={160} y={110} s={12} a="middle" f={C.latte}>decides with only the past</T>
        <T x={440} y={110} s={12} a="middle" f={C.cinnamon}>sees the whole future</T>
        <path d="M160 130 L160 180" stroke={C.taupe} strokeWidth={2} />
        <path d="M440 130 L440 180" stroke={C.cinnamon} strokeWidth={2} />
      </g>
      <T x={300} y={225} s={13} a="middle" f={C.caramel}>the fault is made before the future is known</T>
    </Svg>
  );
}

// 3 · The adversary argument
export function AdversaryArgument({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="A hand always asking for the one page the cache just threw out" h={260}>
      <g opacity={a}>
        <rect x={180} y={80} width={240} height={60} fill="none" stroke={C.taupe} strokeWidth={1.6} />
        <T x={300} y={115} s={11} a="middle" f={C.latte}>cache holds k pages</T>
      </g>
      <g opacity={b}>
        <T x={300} y={170} s={12} a="middle" f={C.caramel}>always ask for the page just evicted</T>
        <T x={300} y={225} s={12} a="middle" f={C.cherryText}>no deterministic policy escapes this</T>
      </g>
    </Svg>
  );
}

// 4 · Predict: can randomization escape?
export function PredictEscape({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="The same adversary trap, with a question mark over whether anything at all can escape it" h={250}>
      <g opacity={a}>
        <rect x={180} y={80} width={240} height={60} fill="none" stroke={C.cherry} strokeWidth={1.6} />
        <T x={300} y={115} s={11} a="middle" f={C.cherryText}>stuck faulting every time</T>
      </g>
      <T x={300} y={220} s={13} a="middle" f={C.caramel}>can a cleverer deterministic rule escape, or does it take something else?</T>
    </Svg>
  );
}

// 5 · Bélády's offline optimum
export function BeladyOptimum({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="A cache holder with a telescope looking down the full request stream before deciding what to evict" h={250}>
      <g opacity={a}>
        <rect x={180} y={90} width={240} height={50} fill="none" stroke={C.cinnamon} strokeWidth={1.6} />
        <path d="M420 115 L480 95" stroke={C.cinnamon} strokeWidth={1.4} />
      </g>
      <T x={300} y={225} s={12} a="middle" f={C.cinnamon}>evict whichever page is needed furthest away</T>
    </Svg>
  );
}

// 6 · LRU is a marking algorithm; FIFO is not
export function MarkingAlgorithm({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="Pages lighting up as marked when first requested in a phase, one policy respecting the marks and one not" h={260}>
      <g opacity={a}>
        {Array.from({ length: 5 }).map((_, i) => (
          <rect key={i} x={100 + i * 80} y={80} width={50} height={50} fill="none" stroke={i < 3 ? C.crema : C.taupe} strokeWidth={1.6} />
        ))}
      </g>
      <g opacity={b}>
        <T x={300} y={170} s={12} a="middle" f={C.crema}>LRU never evicts a marked page</T>
        <T x={300} y={225} s={12} a="middle" f={C.cherryText}>FIFO can, and does</T>
      </g>
    </Svg>
  );
}

// 6b · Predict: does more memory always help?
export function PredictAnomaly({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="A cache growing a frame larger, with a question mark over whether its fault count can only ever fall" h={250}>
      <g opacity={a}>
        <rect x={160} y={90} width={150} height={50} fill="none" stroke={C.taupe} strokeWidth={1.4} />
        <rect x={340} y={85} width={190} height={60} fill="none" stroke={C.taupe} strokeWidth={1.4} />
        <T x={235} y={80} s={10} a="middle" f={C.latte}>smaller cache</T>
        <T x={435} y={75} s={10} a="middle" f={C.latte}>larger cache</T>
      </g>
      <T x={300} y={220} s={13} a="middle" f={C.caramel}>can more memory ever cause more faults, not fewer?</T>
    </Svg>
  );
}

// 7 · Bélády's anomaly
export function BeladyAnomaly({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  return (
    <Svg label="FIFO's fault bar growing taller with more frames while LRU's and the optimum's bars both shrink" h={260}>
      <g opacity={a}>
        <rect x={100} y={100} width={30} height={90} fill="none" stroke={C.cherry} strokeWidth={1.6} />
        <rect x={150} y={85} width={30} height={105} fill="none" stroke={C.cherry} strokeWidth={1.6} />
        <rect x={260} y={100} width={30} height={90} fill="none" stroke={C.crema} strokeWidth={1.6} />
        <rect x={310} y={115} width={30} height={75} fill="none" stroke={C.crema} strokeWidth={1.6} />
        <rect x={420} y={120} width={30} height={70} fill="none" stroke={C.cinnamon} strokeWidth={1.6} />
        <rect x={470} y={130} width={30} height={60} fill="none" stroke={C.cinnamon} strokeWidth={1.6} />
      </g>
      <T x={300} y={230} s={11} a="middle" f={C.cherryText}>FIFO rises with more memory; LRU and the optimum never do</T>
    </Svg>
  );
}

// 8 · Connecting to Chapter 11's real policies
export function ConnectingToPractice({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="A worst-case ceiling drawn far above a real trace's own much lower line" h={250}>
      <g opacity={a}>
        <path d="M100 90 L500 90" stroke={C.cherry} strokeWidth={1.4} strokeDasharray="4 4" />
        <T x={300} y={75} s={11} a="middle" f={C.cherryText}>worst case: ratio of k</T>
        <path d="M100 170 Q300 150 500 165" fill="none" stroke={C.crema} strokeWidth={1.8} />
        <T x={300} y={195} s={11} a="middle" f={C.crema}>a real trace, far below it</T>
      </g>
    </Svg>
  );
}

// 9 · Recap
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  return (
    <Svg label="A ceiling no deterministic policy can beat, with the next topic's reading of a problem's own shape waiting" h={240}>
      <g opacity={a}>
        <T x={160} y={90} s={13} a="start" f={C.crema}>a competitive ratio of k</T>
        <T x={440} y={90} s={12} a="end" f={C.caramel}>what can't be fixed by a cleverer policy</T>
      </g>
      <T x={300} y={200} s={12} a="middle" f={C.caramel}>next: reading a problem's shape before any algorithm</T>
    </Svg>
  );
}
