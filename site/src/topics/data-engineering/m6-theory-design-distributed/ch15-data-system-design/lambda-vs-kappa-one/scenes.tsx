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
    <Svg label="streaming and batch disagree on one product's revenue for days" h={270}>
      <T x={300} y={50} s={14} f={C.taupe} a="middle" o={easeOut(seg(t, 0, 0.5))}>
        one metric, computed two ways
      </T>
      <T x={300} y={90} s={17} f={C.crema} a="middle" w={600} serif italic o={easeOut(seg(t, 0.15, 0.6))}>
        and nobody sure which answer was right
      </T>
      <Row y={150} label="streaming" value="one number" o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={195} label="batch" value="a different number" valueColor={C.focus} o={easeOut(seg(t, 0.5, 0.8))} />
      <Row y={240} label="the cause" value="a refund rule" o={easeOut(seg(t, 0.65, 1))} />
    </Svg>
  );
}

export function Predict1({ t }: StepCtx) {
  return (
    <Svg label="is ripping out the batch layer always right?" h={210}>
      <Row y={75} label="always" value="ignores retention" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="depends" value="on computed thresholds" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealTwoDesigns({ t }: StepCtx) {
  return (
    <Svg label="design A, Kappa, one path; design B, Lambda, two paths merged" h={240}>
      <Row y={55} label="kappa" value="one streaming path" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={105} label="lambda" value="stream plus batch" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={155} label="each" value="priced, estimated" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
    </Svg>
  );
}

export function RevealCrossover({ t }: StepCtx) {
  return (
    <Svg label="kappa's replay cost and lambda's batch cost cross at a computed length" h={210}>
      <Row y={75} label="kappa's cost" value="grows with retention" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="lambda's cost" value="a flatter cost" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealDriftMeasured({ t }: StepCtx) {
  return (
    <Svg label="one planted rule difference; the two paths diverge exactly there" h={210}>
      <Row y={75} label="one stream" value="through both paths" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="the gap" value="exactly the plant" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealUnifiedEngine({ t }: StepCtx) {
  return (
    <Svg label="one program, two modes, matching results — still two modes to maintain" h={210}>
      <Row y={75} label="one program" value="two modes" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="still" value="a second path" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealFourConditions({ t }: StepCtx) {
  return (
    <Svg label="four named cases, checked against this pipeline's own numbers" h={210}>
      <Row y={75} label="four cases" value="named, specific" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="each" value="a real threshold" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealDecisionCard({ t }: StepCtx) {
  return (
    <Svg label="a decision card checks each of the four conditions against this pipeline" h={210}>
      <Row y={75} label="the card" value="checks all four" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="the answer" value="number, not habit" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="two priced designs, a crossover, measured drift, a unified engine, four conditions" h={290}>
      <Row y={45} label="designs" value="two, each priced" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="crossover" value="a computed length" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={155} label="drift" value="measured, not assumed" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={210} label="batch layer" value="kept by threshold" o={easeOut(seg(t, 0.55, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a huge-dimension join; check the four conditions, don't extend retention" h={250}>
      <Row y={65} label="the request" value="a huge join" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={140} label="the fix" value="check the four" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
      <Row y={215} label="not" value="extend retention" o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}
