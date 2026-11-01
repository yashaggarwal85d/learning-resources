import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T, Bar } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = a thread's own lane and its steps; latte = secondary
// labels (a value, a count); taupe = a stalled or suspended lane; caramel = the thing to look
// at (a linearization point, the winning CAS, the legal order); cinnamon (rare) = a second
// object or a contrasting lane; cherry/cherryText = the bad outcome (a lost update, a history
// with no legal order).

function lane(x: number, y: number, w: number, label: string, colour = C.crema) {
  return (
    <g key={`${x}-${y}`}>
      <line x1={x} y1={y} x2={x + w} y2={y} stroke={C.mocha} strokeWidth={1.2} />
      <T x={x - 10} y={y + 4} s={12} a="end" f={colour}>{label}</T>
    </g>
  );
}

function step(x: number, y: number, label: string, colour = C.crema) {
  return (
    <g key={`${x}-${y}-${label}`}>
      <circle cx={x} cy={y} r={5} fill={colour} />
      <T x={x} y={y - 12} s={13} a="middle" f={colour}>{label}</T>
    </g>
  );
}

// 1 · A counter nobody waits behind?
export function Hook({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.4, 2.3));
  return (
    <Svg label="Two threads each add one to a counter, landing on one instead of two" h={300}>
      <g opacity={a}>
        {lane(80, 90, 440, 'thread a', C.crema)}
        {lane(80, 170, 440, 'thread b', C.crema)}
        {step(160, 90, 'read 0')}
        {step(280, 90, 'write 1')}
        {step(200, 170, 'read 0')}
        {step(320, 170, 'write 1')}
      </g>
      <g opacity={b}>
        <T x={300} y={240} s={14} a="middle" f={C.cherryText}>counter ends at one, not two</T>
      </g>
    </Svg>
  );
}

// 2 · How many ways lose an update? (predict)
export function InterleavingsPredict({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  return (
    <Svg label="Twenty small marks in a row standing for every interleaving, most of them unlit" h={280}>
      <T x={30} y={24} s={13} f={C.latte}>every interleaving of two three-step runs</T>
      <g opacity={a}>
        {Array.from({ length: 20 }, (_, i) => (
          <rect key={i} x={50 + i * 25} y={100} width={16} height={16} fill="none" stroke={C.crema} strokeWidth={1.4} />
        ))}
      </g>
      <T x={300} y={200} s={14} a="middle" f={C.caramel}>how many lose the update?</T>
    </Svg>
  );
}

// 3 · The lost update, counted (takeaway)
export function LostUpdateCounted({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="Eighteen marks lit red for lost, two marks lit white for correct" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>measured: eighteen lost, two correct</T>
      <g opacity={a}>
        {Array.from({ length: 20 }, (_, i) => (
          <rect
            key={i}
            x={50 + i * 25}
            y={100}
            width={16}
            height={16}
            fill={i < 18 ? C.cherry : 'none'}
            stroke={i < 18 ? C.cherryText : C.caramel}
            strokeWidth={1.6}
          />
        ))}
      </g>
      <T x={300} y={200} s={13} a="middle" f={C.latte}>a read inside the other's read-to-write span</T>
    </Svg>
  );
}

// 4 · The lock, and its new failure
export function LockBlocks({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  return (
    <Svg label="One lane suspended mid-step, the other lane stopped and waiting behind it" h={300}>
      <g opacity={a}>
        {lane(80, 90, 440, 'holder', C.taupe)}
        <rect x={200} y={78} width={60} height={24} fill="none" stroke={C.taupe} strokeWidth={1.6} />
        <T x={230} y={94} s={11} a="middle" f={C.taupe}>suspended</T>
      </g>
      <g opacity={b}>
        {lane(80, 170, 440, 'waiter', C.cherryText)}
        <rect x={200} y={158} width={320} height={24} fill="none" stroke={C.cherryText} strokeWidth={1.6} />
        <T x={360} y={174} s={11} a="middle" f={C.cherryText}>waiting, for as long as that takes</T>
      </g>
    </Svg>
  );
}

// 5 · Compare-and-swap
export function CompareAndSwap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="Read, compute, swap if unchanged; otherwise loop back to read again" h={300}>
      <g opacity={a}>
        <rect x={60} y={70} width={110} height={36} fill="none" stroke={C.crema} strokeWidth={1.6} />
        <T x={115} y={92} s={12} a="middle" f={C.crema}>read</T>
        <rect x={210} y={70} width={110} height={36} fill="none" stroke={C.crema} strokeWidth={1.6} />
        <T x={265} y={92} s={12} a="middle" f={C.crema}>compute</T>
        <rect x={360} y={70} width={160} height={36} fill="none" stroke={C.caramel} strokeWidth={1.8} />
        <T x={440} y={92} s={12} a="middle" f={C.caramel}>swap if unchanged</T>
        <path d="M60 130 L440 130 L440 108" stroke={C.cherryText} strokeWidth={1.4} fill="none" />
        <T x={250} y={148} s={11} a="middle" f={C.cherryText}>changed — retry from read</T>
      </g>
    </Svg>
  );
}

// 6 · Does the system still move? (predict)
export function CasStarvationPredict({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  return (
    <Svg label="One lane with many retry marks and no finish, one lane finishing on its first try" h={300}>
      <g opacity={a}>
        {lane(80, 90, 440, 'loser', C.taupe)}
        {Array.from({ length: 6 }, (_, i) => step(130 + i * 60, 90, 'retry', C.taupe))}
        {lane(80, 180, 440, 'winner', C.crema)}
        {step(140, 180, 'cas', C.caramel)}
      </g>
      <T x={300} y={240} s={14} a="middle" f={C.caramel}>does the whole system still move?</T>
    </Svg>
  );
}

// 7 · Lock-free, not wait-free (takeaway)
export function ProgressLadder({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  const rungs: [string, boolean][] = [['wait-free', true], ['lock-free', true], ['obstruction-free', true], ['blocking', true]];
  return (
    <Svg label="Four rungs lit in order from the bottom, wait-free at the top" h={320}>
      <T x={30} y={24} s={13} f={C.latte}>the progress ladder, all four lit</T>
      {rungs.map(([name], i) => (
        <g key={name} opacity={a}>
          <rect x={160} y={60 + i * 55} width={280} height={34} fill="none" stroke={i === 0 ? C.caramel : C.crema} strokeWidth={1.6} />
          <T x={300} y={60 + i * 55 + 22} s={13} a="middle" f={i === 0 ? C.caramel : C.crema}>{name}</T>
        </g>
      ))}
    </Svg>
  );
}

// 8 · What does "correct" mean, overlapping?
export function HistoryIntervals({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="Two interval bars overlapping in time, one per thread" h={280}>
      <g opacity={a}>
        {lane(80, 90, 440, 'a', C.crema)}
        <rect x={140} y={78} width={160} height={24} fill="none" stroke={C.crema} strokeWidth={1.6} />
        {lane(80, 170, 440, 'b', C.cinnamon)}
        <rect x={240} y={158} width={160} height={24} fill="none" stroke={C.cinnamon} strokeWidth={1.6} />
      </g>
      <T x={300} y={230} s={13} a="middle" f={C.latte}>overlapping — real time alone decides nothing</T>
    </Svg>
  );
}

// 9 · Could a sequential queue do this? (predict)
export function EmptyAfterEnqueuePredict({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  return (
    <Svg label="An enqueue interval that finishes completely, then a dequeue interval after it returning empty" h={280}>
      <g opacity={a}>
        {lane(80, 90, 440, 'enqueue', C.crema)}
        <rect x={120} y={78} width={120} height={24} fill="none" stroke={C.crema} strokeWidth={1.6} />
        {lane(80, 170, 440, 'dequeue', C.cherryText)}
        <rect x={280} y={158} width={120} height={24} fill="none" stroke={C.cherryText} strokeWidth={1.6} />
        <T x={340} y={210} s={11} a="middle" f={C.cherryText}>returns empty</T>
      </g>
      <T x={300} y={250} s={13} a="middle" f={C.caramel}>could a sequential queue do this?</T>
    </Svg>
  );
}

// 10 · Linearizable, and not (takeaway)
export function Linearizability({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="One history marked with a legal order found, one marked with no legal order at all" h={300}>
      <g opacity={a}>
        <T x={150} y={70} s={12} a="middle" f={C.caramel}>legal order found</T>
        {lane(60, 100, 180, 'a', C.crema)}
        {lane(60, 150, 180, 'b', C.cinnamon)}
        <T x={450} y={70} s={12} a="middle" f={C.cherryText}>no legal order</T>
        {lane(360, 100, 180, 'a', C.crema)}
        {lane(360, 150, 180, 'b', C.cherryText)}
      </g>
      <T x={300} y={210} s={13} a="middle" f={C.latte}>a legal sequential order respecting real time</T>
    </Svg>
  );
}

// 11 · Why it composes
export function Locality({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.3));
  return (
    <Svg label="Two separate objects each checked alone, both feeding into one whole-system check mark" h={300}>
      <g opacity={a}>
        <rect x={100} y={70} width={120} height={50} fill="none" stroke={C.crema} strokeWidth={1.6} />
        <T x={160} y={100} s={12} a="middle" f={C.crema}>queue</T>
        <rect x={340} y={70} width={120} height={50} fill="none" stroke={C.cinnamon} strokeWidth={1.6} />
        <T x={400} y={100} s={12} a="middle" f={C.cinnamon}>map</T>
        <path d="M160 120 L300 180 L440 120" stroke={C.caramel} strokeWidth={1.4} fill="none" />
        <T x={300} y={205} s={12} a="middle" f={C.caramel}>each alone, whole system too</T>
      </g>
    </Svg>
  );
}

// 12 · Recap
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.4));
  return (
    <Svg label="Two short labels, correctness named and progress ranked, beside a pointer to the next topic" h={300}>
      <g opacity={a}>
        <T x={180} y={90} s={13} a="middle" f={C.caramel}>correctness</T>
        <T x={180} y={114} s={11} a="middle" f={C.latte}>linearizability</T>
        <T x={420} y={90} s={13} a="middle" f={C.crema}>progress</T>
        <T x={420} y={114} s={11} a="middle" f={C.latte}>the four-rung ladder</T>
      </g>
      <T x={300} y={200} s={13} a="middle" f={C.latte}>nothing built yet — a ring queue, next</T>
    </Svg>
  );
}
