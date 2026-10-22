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
    <Svg label="a fact, a dangling key — no dimension row to join to" h={200}>
      <Row y={70} label="order arrives" value="customer not found" />
      <Row y={130} label="reject it?" value="the sale vanishes" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealInferredQuote({ t }: StepCtx) {
  return (
    <Svg label="a placeholder row, unresolved key, unknown values — enough to post the fact" h={200}>
      <Row y={70} label="placeholder row" value="unresolved key" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="values" value="generic, unknown" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealInferredMeasured({ t }: StepCtx) {
  return (
    <Svg label="one placeholder row, one fact loaded against it, right away" h={200}>
      <Row y={70} label="dim row" value="inserted" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="fact row" value="loaded, right away" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictResolve({ t }: StepCtx) {
  return (
    <Svg label="the real data arrives — a new row, or the same one, filled in?" h={200}>
      <Row y={70} label="real data arrives" value="new row?" />
      <Row y={130} label="or" value="same row, filled in?" />
    </Svg>
  );
}

export function RevealResolveMeasured({ t }: StepCtx) {
  return (
    <Svg label="same row, overwritten in place — the row count never moves" h={200}>
      <Row y={70} label="same row" value="overwritten" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="row count" value="unchanged" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealRetroactiveQuote({ t }: StepCtx) {
  return (
    <Svg label="a retroactive correction: a real new row, and facts restated to match" h={200}>
      <Row y={70} label="retroactive change" value="new row" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="facts touched" value="restated" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictBackdated({ t }: StepCtx) {
  return (
    <Svg label="a sale from before the most recent move — which address attaches?" h={200}>
      <Row y={70} label="old sale" value="which address?" />
      <Row y={130} label="current, or" value="back then?" />
    </Svg>
  );
}

export function RevealLateFactQuote({ t }: StepCtx) {
  return (
    <Svg label="search the dimension for the keys effective back then, not now" h={200}>
      <Row y={70} label="search" value="keys effective then" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="not" value="keys effective now" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealAsOfMeasured({ t }: StepCtx) {
  return (
    <Svg label="same fact row, two joins, two different versions — only one is right" h={200}>
      <Row y={70} label="join to current" value="wrong version" valueColor={C.focus} o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="join to event date" value="right version" o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictWindow({ t }: StepCtx) {
  return (
    <Svg label="always search all of history — is that the real answer?" h={200}>
      <Row y={70} label="search all history" value="every time?" />
      <Row y={130} label="cost" value="unbounded?" />
    </Svg>
  );
}

export function RevealWindow({ t }: StepCtx) {
  return (
    <Svg label="a named horizon, past which a late event is handled another way" h={200}>
      <Row y={70} label="allowed lateness" value="a named horizon" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="past it" value="handled another way" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="placeholder, resolved in place; as-of join; a named limit on all of it" h={260}>
      <Row y={60} label="missing row" value="placeholder, then resolved" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={120} label="backdated fact" value="joined on its own date" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={180} label="lateness" value="needs a named limit" o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a correction, older than the window itself — what happens?" h={200}>
      <Row y={70} label="old correction" value="past the window" />
      <Row y={130} label="what happens" value="to it?" />
    </Svg>
  );
}
