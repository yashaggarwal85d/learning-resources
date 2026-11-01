import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T, Bar } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = an ordinary cell or thread; latte = secondary labels (a
// counter, a lap number); taupe = a stalled or claimed-but-unpublished cell/thread; caramel =
// the thing to look at (a comparison result, a legal order, a measured bar); cinnamon (rare) =
// a second design (the Disruptor) beside the first; cherry/cherryText = the bad outcome (an
// empty result, no legal order, the unpadded counters' own cost).

function cell(x: number, y: number, label: string, colour = C.crema) {
  return (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width={44} height={36} fill="none" stroke={colour} strokeWidth={1.6} />
      <T x={x + 22} y={y + 23} s={13} a="middle" f={colour}>{label}</T>
    </g>
  );
}

// 1 · A ring, many producers, many consumers
export function Hook({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.4, 2.3));
  return (
    <Svg label="A ring of cells with several producer lanes feeding in and several consumer lanes draining out" h={320}>
      <g opacity={a}>
        {[0, 1, 2, 3].map((i) => cell(140 + i * 80, 100, `cell`, C.crema))}
      </g>
      <g opacity={b}>
        <T x={120} y={60} s={12} a="middle" f={C.latte}>producers</T>
        <T x={460} y={60} s={12} a="middle" f={C.latte}>consumers</T>
        <T x={300} y={200} s={13} a="middle" f={C.caramel}>one compare-and-swap, no lock</T>
      </g>
    </Svg>
  );
}

// 2 · What does the consumer see? (predict)
export function StalledHandoffPredict({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="One cell claimed and stalled, the next cell claimed and already published, a consumer arrow pointing at the stalled one" h={300}>
      <g opacity={a}>
        {cell(140, 100, 'claimed', C.taupe)}
        {cell(220, 100, 'x', C.crema)}
      </g>
      <g opacity={b}>
        <path d="M400 150 L300 118" stroke={C.latte} strokeWidth={1.4} fill="none" />
        <T x={420} y={160} s={12} a="middle" f={C.latte}>dequeue?</T>
      </g>
      <T x={300} y={220} s={14} a="middle" f={C.caramel}>message, empty, or wait?</T>
    </Svg>
  );
}

// 3 · Empty, not the message, not a wait (takeaway)
export function EmptyNotMessage({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="Repeated dequeue attempts on the stalled cell, each one marked empty in red, while the next cell's own data sits unreached" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>every attempt, on the stalled cell only</T>
      <g opacity={a}>
        {cell(140, 80, 'claimed', C.taupe)}
        {cell(220, 80, 'x', C.crema)}
        {[0, 1, 2].map((i) => (
          <T key={i} x={162} y={140 + i * 20} s={12} a="middle" f={C.cherryText}>empty</T>
        ))}
      </g>
      <T x={300} y={220} s={12} a="middle" f={C.latte}>the data next door never helps</T>
    </Svg>
  );
}

// 4 · The ring, two counters, and a lap number
export function RingAndCounters({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="Four cells each labeled with their own sequence number, two counters below pointing at the write and read positions" h={300}>
      <g opacity={a}>
        {['0', '1', '2', '3'].map((n, i) => cell(140 + i * 80, 80, n, C.crema))}
      </g>
      <path d="M160 170 L160 140" stroke={C.caramel} strokeWidth={1.6} fill="none" />
      <T x={160} y={190} s={12} a="middle" f={C.caramel}>write pos</T>
      <path d="M160 220 L160 190" stroke={C.latte} strokeWidth={1.6} fill="none" />
      <T x={160} y={240} s={12} a="middle" f={C.latte}>read pos</T>
    </Svg>
  );
}

// 5 · Equal, less, greater
export function ThreeComparisons({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  const rows: [string, string, string][] = [
    ['equal', 'free for this turn', C.caramel],
    ['less', 'still full', C.cherryText],
    ['greater', 'already taken — retry', C.latte],
  ];
  return (
    <Svg label="Three rows, equal, less and greater, each with its own meaning" h={300}>
      {rows.map(([name, meaning, colour], i) => (
        <g key={name} opacity={a}>
          <T x={80} y={80 + i * 50} s={14} f={colour}>{name}</T>
          <T x={220} y={80 + i * 50} s={12} f={C.latte}>{meaning}</T>
        </g>
      ))}
    </Svg>
  );
}

// 6 · Does it ever recover on its own? (predict)
export function RecoversOnItsOwnPredict({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  return (
    <Svg label="A stalled cell sitting unchanged across several passes of time, nothing else intervening" h={280}>
      <g opacity={a}>
        {cell(190, 100, 'claimed', C.taupe)}
        <T x={410} y={123} s={13} a="middle" f={C.taupe}>still stalled</T>
      </g>
      <T x={300} y={220} s={14} a="middle" f={C.caramel}>left alone — does it recover?</T>
    </Svg>
  );
}

// 7 · One compare-and-swap, still blocking (takeaway)
export function StillBlocking({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="A bar of many failed attempts, all red, beside a label saying no lock anywhere" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>every attempt, on this one stalled cell</T>
      <g opacity={a}>
        <Bar x={80} y={90} w={440} h={20} full={440} fill={C.cherry} />
        <T x={300} y={140} s={12} a="middle" f={C.cherryText}>every attempt: empty</T>
      </g>
      <T x={300} y={200} s={13} a="middle" f={C.caramel}>no lock — and still blocking</T>
    </Svg>
  );
}

// 8 · Checked against the definition
export function CheckedHistory({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="One history with no legal order, marked rejected, one overlapping history with a legal order, marked accepted" h={300}>
      <g opacity={a}>
        <T x={150} y={70} s={12} a="middle" f={C.cherryText}>completed, then empty</T>
        <rect x={80} y={90} width={140} height={30} fill="none" stroke={C.cherryText} strokeWidth={1.6} />
        <T x={150} y={140} s={13} a="middle" f={C.cherryText}>no legal order</T>
        <T x={450} y={70} s={12} a="middle" f={C.caramel}>overlapping</T>
        <rect x={380} y={90} width={140} height={30} fill="none" stroke={C.caramel} strokeWidth={1.6} />
        <T x={450} y={140} s={13} a="middle" f={C.caramel}>legal order found</T>
      </g>
    </Svg>
  );
}

// 9 · Does dividing the labor differently change this? (predict)
export function ClaimThenPublishPredict({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="A claim step then a publish step, with a question mark over whether skipping the second one still stalls consumers" h={300}>
      <g opacity={a}>
        <rect x={100} y={90} width={120} height={36} fill="none" stroke={C.crema} strokeWidth={1.6} />
        <T x={160} y={112} s={12} a="middle" f={C.crema}>claim</T>
        <path d="M220 108 L320 108" stroke={C.latte} strokeWidth={1.4} fill="none" />
        <rect x={320} y={90} width={140} height={36} fill="none" stroke={C.taupe} strokeWidth={1.8} />
        <T x={390} y={112} s={12} a="middle" f={C.taupe}>publish?</T>
      </g>
      <T x={300} y={180} s={13} a="middle" f={C.caramel}>skip the second step — does this still stall?</T>
    </Svg>
  );
}

// 10 · Same lap counter, different place (takeaway)
export function SameLapCounter({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="Two designs side by side, Vyukov's per-cell number and the Disruptor's per-slot bit, both padded the same way" h={300}>
      <g opacity={a}>
        <T x={150} y={70} s={12} a="middle" f={C.crema}>Vyukov</T>
        {cell(120, 90, 'seq', C.crema)}
        <T x={450} y={70} s={12} a="middle" f={C.cinnamon}>Disruptor</T>
        {cell(420, 90, 'bit', C.cinnamon)}
      </g>
      <T x={300} y={180} s={12} a="middle" f={C.latte}>one idea, held in a different place</T>
    </Svg>
  );
}

// 11 · False sharing, measured
export function FalseSharingMeasured({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="An unpadded bar much longer than a padded bar, same number of increments each" h={300}>
      <T x={30} y={24} s={12} f={C.latte}>time to finish, same work each</T>
      <g opacity={a}>
        <T x={60} y={100} s={12} f={C.cherryText}>unpadded</T>
        <Bar x={170} y={88} w={260} h={16} full={260} fill={C.cherryText} />
        <T x={60} y={160} s={12} f={C.caramel}>padded</T>
        <Bar x={170} y={148} w={50} h={16} full={260} fill={C.caramel} />
      </g>
    </Svg>
  );
}

// 12 · Recap
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.4));
  return (
    <Svg label="Correctness and progress named, beside a real honest curve and a pointer to the next topic" h={300}>
      <g opacity={a}>
        <T x={160} y={90} s={13} a="middle" f={C.caramel}>one CAS</T>
        <T x={160} y={114} s={13} a="middle" f={C.latte}>blocking, not lock-free</T>
        <T x={440} y={90} s={13} a="middle" f={C.crema}>real curve</T>
        <T x={440} y={114} s={13} a="middle" f={C.latte}>doesn't always favor it</T>
      </g>
      <T x={300} y={200} s={13} a="middle" f={C.latte}>a table that must grow while it's used, next</T>
    </Svg>
  );
}
