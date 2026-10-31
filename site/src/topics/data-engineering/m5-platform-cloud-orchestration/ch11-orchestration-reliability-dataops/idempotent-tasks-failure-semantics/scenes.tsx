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
    <Svg label="a worker dies mid-task. the retry doubles the row count." h={200}>
      <Row y={70} label="worker" value="killed mid-task" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="row count" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealAtLeastOnce({ t }: StepCtx) {
  return (
    <Svg label="retried does not mean ran once. it may have already written." h={200}>
      <Row y={70} label="retried" value="may mean ran twice" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="first attempt" value="may have written" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealOverwriteVsAppend({ t }: StepCtx) {
  return (
    <Svg label="the same task, run twice. one stays correct, one doubles." h={200}>
      <Row y={70} label="overwrite, two runs" value="three rows" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="append, two runs" value="six rows" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function PredictTimeoutVsDataError({ t }: StepCtx) {
  return (
    <Svg label="a timeout, and a bad row. retried the same way?" h={200}>
      <Row y={70} label="a timeout" value="often transient" />
      <Row y={130} label="a bad row" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealTriggerRulesReal({ t }: StepCtx) {
  return (
    <Svg label="one fails. one default-rule task never runs. one runs anyway." h={260}>
      <Row y={40} label="a fails" value="failed" o={easeOut(seg(t, 0, 0.25))} />
      <Row y={85} label="b, default rule" value="upstream failed" o={easeOut(seg(t, 0.12, 0.37))} />
      <Row y={130} label="c, one failed rule" value="success" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.6))} />
    </Svg>
  );
}

export function RevealZombiesByTheBook({ t }: StepCtx) {
  return (
    <Svg label="a worker dies silently. a missed heartbeat is the only sign." h={200}>
      <Row y={70} label="worker" value="dies silently" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="heartbeat" value="missed, timeout" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealTimeoutsRetryBudget({ t }: StepCtx) {
  return (
    <Svg label="a timeout caps the run. retrying a doomed task spends the budget." h={200}>
      <Row y={70} label="timeout breached" value="task times out" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a data error" value="fails fast" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="at least once. overwrite survives. trigger rules measured. a budget." h={260}>
      <Row y={40} label="execution" value="at least once" o={easeOut(seg(t, 0, 0.25))} />
      <Row y={85} label="safe write" value="overwrite, not append" o={easeOut(seg(t, 0.12, 0.37))} />
      <Row y={130} label="trigger rules" value="measured, real" o={easeOut(seg(t, 0.3, 0.55))} />
      <Row y={175} label="retries" value="a budget to protect" valueColor={C.focus} o={easeOut(seg(t, 0.45, 0.75))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="running for hours. no log, no progress. what now?" h={200}>
      <Row y={70} label="task instance" value="running for hours" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="what to check" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
