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
    <Svg label="tests prove a client correct on the inputs it was given — what checks every input nobody thought to write?" h={200}>
      <Row y={70} label="every test" value="checked, generated inputs" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="a real input, live" value="not yet checked" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealRecordValidation({ t }: StepCtx) {
  return (
    <Svg label="one record, one declared shape — does it coerce cleanly, or fail with exactly where it's wrong?" h={200}>
      <Row y={70} label="a good record" value="coerced, accepted" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a bad record" value="rejected, field named" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealScale({ t }: StepCtx) {
  return (
    <Svg label="twice as many records through the same record check — does the cost grow in proportion, or worse?" h={200}>
      <Row y={70} label="one batch" value="a measured time" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="twice as many" value="roughly twice the time" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictTwoBackends({ t }: StepCtx) {
  return (
    <Svg label="the same column checks, written once — does validating a different DataFrame library need a second schema?" h={200}>
      <Row y={70} label="one schema, written once" value="checks declared" />
      <Row y={130} label="a second library" value="needs its own?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealTwoBackends({ t }: StepCtx) {
  return (
    <Svg label="one schema definition, checked against a real pandas DataFrame and a real Polars frame — does either reject it?" h={200}>
      <Row y={70} label="a pandas DataFrame" value="validated, same schema" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a Polars frame" value="validated, same schema" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealCatchesViolation({ t }: StepCtx) {
  return (
    <Svg label="one column value outside the declared range — does the schema catch it, or quietly let it through?" h={200}>
      <Row y={70} label="every value in range" value="passes" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="one out of range" value="rejected, column named" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealRowVsBatch({ t }: StepCtx) {
  return (
    <Svg label="the same range check, once per value in a loop vs. once across the whole column — how much does that cost, measured?" h={200}>
      <Row y={70} label="row-level, a loop" value="a measured time" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="batch-level, vectorized" value="measurably faster" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealNamedNotRun({ t }: StepCtx) {
  return (
    <Svg label="a framework built around checks and a Checkpoint vs. one built around a YAML scan — which actually runs here?" h={200}>
      <Row y={70} label="checks, a Checkpoint" value="named and sourced" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a YAML scan" value="named and sourced" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a coerced record, a scaled check, one schema on two backends, a measured cost gap, and a named production scan" h={260}>
      <Row y={50} label="record check" value="coerced, scales linearly" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="one schema" value="two real backends" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="row vs. batch" value="measured cost gap" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <Row y={185} label="production scan" value="named, not run" o={easeOut(seg(t, 0.5, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a record-by-record loop over a whole batch, plus a downstream governance re-check — what's misplaced, and where should each check sit?" h={220}>
      <Row y={55} label="per-record loop" value="row-level cost, misplaced" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="governance, re-checks" value="duplicates the boundary" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
      <Row y={165} label="the fix" value="a batch schema, then governance" valueColor={C.focus} o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}
