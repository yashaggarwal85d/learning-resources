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
    <Svg label="order one-oh-four-two goes new, paid, shipped, refunded within seconds; a poll samples once and sees only refunded." h={220}>
      <Row y={60} label="real path" value="four states" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="poll saw" value="refunded, only" valueColor={C.badText} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={160} label="warehouse knows" value="it was ever paid" valueColor={C.badText} o={easeOut(seg(t, 0.4, 0.8))} />
    </Svg>
  );
}

export function Predict({ t }: StepCtx) {
  return (
    <Svg label="the identical sequence, but a trigger copies every change to a shadow table as it happens. Does it see what the poll missed?" h={200}>
      <Row y={70} label="trigger fires" value="on every statement" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="sees the gaps" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealPollSample({ t }: StepCtx) {
  return (
    <Svg label="a poll is one query, run on a schedule; between two runs, a row can pass through any number of states." h={200}>
      <Row y={70} label="poll" value="a single sample" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="between two polls" value="anything can happen" valueColor={C.badText} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealIntermediateMeasured({ t }: StepCtx) {
  return (
    <Svg label="the real run: one poll query against a real replication slot reading every change." h={220}>
      <Row y={60} label="poll's query" value="one state" valueColor={C.badText} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="slot's own changes" value="all four states" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
    </Svg>
  );
}

export function RevealDeleteGap({ t }: StepCtx) {
  return (
    <Svg label="a row is inserted and deleted inside one window; a poll asking what changed finds nothing left to find." h={200}>
      <Row y={70} label="row inserted" value="then deleted" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="poll finds" value="nothing at all" valueColor={C.badText} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealDeleteMeasured({ t }: StepCtx) {
  return (
    <Svg label="the real run: the poll's own query against the exact delete event in the log." h={220}>
      <Row y={60} label="poll's own query" value="zero rows found" valueColor={C.badText} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="log" value="one delete, recorded" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
    </Svg>
  );
}

export function RevealTriggerCost({ t }: StepCtx) {
  return (
    <Svg label="a trigger copying a change into a shadow table runs inside the identical transaction as the write itself." h={200}>
      <Row y={70} label="one write to orders" value="becomes two writes" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="this is" value="the mechanism working" o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealCostsMeasured({ t }: StepCtx) {
  return (
    <Svg label="the real run: four writes to orders producing four shadow rows, against the identical changes read for free from the log." h={220}>
      <Row y={60} label="trigger's shadow table" value="four rows written" valueColor={C.badText} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="log's own read" value="the identical four, free" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a poll's one sample, a trigger's doubled write, and a log's complete, ordered, low-overhead read." h={260}>
      <Row y={50} label="polling" value="one sample, misses gaps" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="triggers" value="doubles every write" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="the log" value="complete, ordered, cheap" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.55))} />
      <Row y={185} label="but it couples you to" value="the source itself" valueColor={C.badText} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="reading the log is complete and cheap. What does it cost that polling and triggers don't?" h={200}>
      <Row y={70} label="reading the log" value="complete, ordered, cheap" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the hidden cost" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}
