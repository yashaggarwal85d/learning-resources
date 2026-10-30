import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

/** A label-left / value-right row (DESIGN.md, phone text scaling). Keep each
 * side to 1-3 words: longer pairs overlap on phone widths. */
function Row({ y, label, value, valueColor = C.crema, o = 1 }: { y: number; label: string; value: string; valueColor?: string; o?: number }) {
  return (
    <g opacity={o}>
      <T x={25} y={y} s={15} f={C.latte}>
        {label}
      </T>
      <T x={575} y={y} s={16} f={valueColor} a="end" w={600}>
        {value}
      </T>
    </g>
  );
}

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="a payments partner's events 'arrive in real time' — three weeks on, three cracks appear" h={270}>
      <T x={300} y={50} s={14} f={C.taupe} a="middle" o={easeOut(seg(t, 0, 0.5))}>
        the partner's own words
      </T>
      <T x={300} y={90} s={17} f={C.crema} a="middle" w={600} serif italic o={easeOut(seg(t, 0.15, 0.6))}>
        "events arrive in real time"
      </T>
      <Row y={150} label="retries" value="revenue double-counted" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={195} label="maintenance window" value="events dropped" valueColor={C.focus} o={easeOut(seg(t, 0.5, 0.8))} />
      <Row y={240} label="field renamed" value="a day's notice" o={easeOut(seg(t, 0.65, 1))} />
    </Svg>
  );
}

export function Predict1({ t }: StepCtx) {
  return (
    <Svg label="which questions, asked in the first meeting, would have prevented each crack?" h={210}>
      <Row y={75} label="a fuller diagram" value="doesn't ask" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="resend, downtime, owner" value="asks directly" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealQuestionCards({ t }: StepCtx) {
  return (
    <Svg label="a source box on the left, question cards on the right, each flipping to its design decision" h={210}>
      <Row y={75} label="do you resend?" value="flips to dedup" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="down, then what?" value="flips to buffer" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealMeasurementVsAdjective({ t }: StepCtx) {
  return (
    <Svg label="'real time' crossed out, replaced by a measured number from the last quarter" h={210}>
      <Row y={75} label="real time" value="crossed out" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="p99 delay" value="a measured number" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealSchemaOwnership({ t }: StepCtx) {
  return (
    <Svg label="who owns the schema and the right to change it; a contract's own status and version fields" h={210}>
      <Row y={75} label="owner" value="named, not assumed" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="status, version" value="checkable fields" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealDeliveryReliability({ t }: StepCtx) {
  return (
    <Svg label="late, duplicate, lost, resent — a resend without a fresh id is a duplicate waiting to happen" h={210}>
      <Row y={75} label="resend" value="same event id" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="dedup key" value="id, not timestamp" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealVolumeProtocol({ t }: StepCtx) {
  return (
    <Svg label="rate, peak, growth for the estimate; protocol, auth and quota for the connection" h={240}>
      <Row y={55} label="average, peak" value="feeds the estimate" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={105} label="growth rate" value="keeps it current" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={155} label="protocol, auth" value="feeds the client" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={205} label="quota" value="a hard ceiling" o={easeOut(seg(t, 0.55, 0.85))} />
    </Svg>
  );
}

export function RevealHiddenConstraint({ t }: StepCtx) {
  return (
    <Svg label="a quota card and a residency card both flip red — the partner can't answer either" h={210}>
      <Row y={75} label="daily quota" value="unanswered, red" valueColor={C.focus} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="data residency" value="unanswered, red" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="question cards flipping to the dedup box, the buffer, the contract, the estimate, and the client" h={290}>
      <Row y={45} label="resend, down" value="dedup, buffer" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="owner, notice" value="the contract" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={155} label="rate, growth" value="the estimate" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={210} label="quota, residency" value="red if unanswered" o={easeOut(seg(t, 0.55, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a second partner's interview; two of fifteen questions come back red, unanswerable" h={250}>
      <Row y={65} label="thirteen answered" value="measured or known" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={140} label="two unanswered" value="explicit unknowns" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
      <Row y={215} label="the design" value="plans for the worst case" o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}
