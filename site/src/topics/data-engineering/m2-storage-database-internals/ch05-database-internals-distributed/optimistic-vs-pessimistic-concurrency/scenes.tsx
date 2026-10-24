import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

/** A label-left / value-right row, stacked vertically with generous gaps (DESIGN.md, phone text scaling). */
function Row({ y, label, value, valueColor = C.crema, o = 1 }: { y: number; label: string; value: string; valueColor?: string; o?: number }) {
  return (
    <g opacity={o}>
      <T x={25} y={y} s={15} f={C.latte}>
        {label}
      </T>
      <T x={575} y={y} s={17} f={valueColor} a="end" w={600}>
        {value}
      </T>
    </g>
  );
}

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="two checkouts, one row. One loses." h={200}>
      <Row y={70} label="checkout one" value="same inventory row" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="checkout two" value="one of them must lose" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealPessimistic({ t }: StepCtx) {
  return (
    <Svg label="lock first, ask never. Blocks before a conflict exists." h={200}>
      <Row y={70} label="SELECT ... FOR UPDATE" value="locks, no conflict yet" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the other checkout" value="waits, blocked" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealOptimistic({ t }: StepCtx) {
  return (
    <Svg label="no lock, read freely. Write only if nobody beat you there." h={200}>
      <Row y={70} label="a version column" value="read with no lock at all" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="version moved?" value="retry, read fresh" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictLockWorthIt({ t }: StepCtx) {
  return (
    <Svg label="rare conflicts, a lock paid for anyway. Worth it?" h={200}>
      <Row y={70} label="almost nobody collides" value="most of the time" />
      <Row y={130} label="is the lock worth it" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealLowConflict({ t }: StepCtx) {
  return (
    <Svg label="the identical workload, both ways. 400 rows." h={260}>
      <Row y={50} label="400 rows, 8 workers" value="identical workload" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="SELECT ... FOR UPDATE" value="finishes second" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="version-column compare-and-set" value="finishes first" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealHighConflict({ t }: StepCtx) {
  return (
    <Svg label="the same workload, 2 rows instead. Reversed." h={260}>
      <Row y={50} label="2 rows, same 8 workers" value="workload, reversed" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="SELECT ... FOR UPDATE" value="finishes first" valueColor={C.focus} o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="the compare-and-set" value="5,000+ retries wasted" o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealWhyCrossover({ t }: StepCtx) {
  return (
    <Svg label="a wait just queues. A failed retry is redone from scratch." h={200}>
      <Row y={70} label="a blocked, pessimistic wait" value="never wasted" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a failed optimistic retry" value="redone, from scratch" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealThirdFlavor({ t }: StepCtx) {
  return (
    <Svg label="one row's version, or a whole read set, at commit." h={200}>
      <Row y={70} label="a version column" value="validates one row" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="validate-at-commit OCC" value="the whole read set" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealSamePatternElsewhere({ t }: StepCtx) {
  return (
    <Svg label="a table pointer, or a whole cluster — same bet." h={200}>
      <Row y={70} label="an object-store commit" value="swap one pointer" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a distributed SQL commit" value="same bet, wider" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="block first, or bet first — conflict rate decides." h={260}>
      <Row y={50} label="pessimistic" value="blocks before it knows" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="optimistic" value="bets it won't need to" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="which one wins" value="conflict rate decides" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="light traffic, then a ninety-second spike. Which one?" h={200}>
      <Row y={70} label="claim this seat" value="lock, or compare-and-set" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="the right answer" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
