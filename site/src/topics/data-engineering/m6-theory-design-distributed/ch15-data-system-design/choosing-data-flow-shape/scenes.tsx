import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

/** A label-left / value-right row (DESIGN.md, phone text scaling). */
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
    <Svg label="three teams propose three shapes for the shop's own fifteen-minute SLO — streaming, hourly batch, five-minute micro-batch" h={270}>
      <T x={300} y={50} s={14} f={C.taupe} a="middle" o={easeOut(seg(t, 0, 0.5))}>
        the freshness SLO
      </T>
      <T x={300} y={90} s={17} f={C.crema} a="middle" w={600} serif italic o={easeOut(seg(t, 0.15, 0.6))}>
        fifteen minutes, from fresh event to visible result
      </T>
      <Row y={150} label="streaming" value="clears easily" o={easeOut(seg(t, 0.35, 0.7))} />
      <Row y={195} label="hourly batch" value="far too slow" o={easeOut(seg(t, 0.45, 0.8))} />
      <Row y={240} label="micro-batch" value="wins on cost?" valueColor={C.focus} o={easeOut(seg(t, 0.6, 1))} />
    </Svg>
  );
}

export function Predict1({ t }: StepCtx) {
  return (
    <Svg label="which proposal clears the SLO at the lowest cost, and what reprocessing question could flip the answer?" h={210}>
      <Row y={75} label="fastest shape" value="not free" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="cheapest, clears" value="unless reprocessing flips" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealDecisionCard({ t }: StepCtx) {
  const rows: [string, string, boolean][] = [
    ['batch', 'far above line', false],
    ['micro-batch', 'just under line', true],
    ['streaming', 'far under line', true],
    ['hybrid', 'under line, costly', true],
  ];
  return (
    <Svg label="four shapes, each with its own latency floor against the fifteen-minute line — any floor above the line dims" h={330}>
      {rows.map(([label, value, clears], i) => (
        <Row
          key={label}
          y={40 + i * 70}
          label={label}
          value={value}
          valueColor={clears ? C.crema : C.taupe}
          o={easeOut(seg(t, i * 0.22, i * 0.22 + 0.4))}
        />
      ))}
    </Svg>
  );
}

export function RevealSurvivorsCompared({ t }: StepCtx) {
  return (
    <Svg label="of the shapes that clear the floor, compare operational burden and replay ease — the cheapest survivor lifts" h={230}>
      <Row y={80} label="streaming, hybrid" value="cost more" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={160} label="micro-batch" value="cheapest, wins" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealLambdaKappaUnified({ t }: StepCtx) {
  const rows: [string, string][] = [
    ['Lambda', 'two code paths'],
    ['Kappa', 'replays the log'],
    ['unified engine', 'no hand-rolled replay'],
  ];
  return (
    <Svg label="Lambda sits on the hybrid card, Kappa sits on the streaming card, a unified engine gets Kappa's shape without hand-rolling replay" h={290}>
      {rows.map(([label, value], i) => (
        <Row key={label} y={55 + i * 75} label={label} value={value} valueColor={i === 1 ? C.focus : C.crema} o={easeOut(seg(t, i * 0.3, i * 0.3 + 0.45))} />
      ))}
    </Svg>
  );
}

export function RevealRealCosts({ t }: StepCtx) {
  return (
    <Svg label="Lambda's cost is keeping two systems' logic in sync, not compute — Kappa's cost is a real, temporary doubling of output storage" h={230}>
      <Row y={80} label="Lambda's cost" value="keeping in sync" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={160} label="Kappa's cost" value="storage, doubled" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealPushPull({ t }: StepCtx) {
  return (
    <Svg label="at each source boundary, someone pushes and owns the schema, or is pulled from and the pipeline owns extraction" h={210}>
      <Row y={75} label="push" value="source owns it" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="pull" value="pipeline owns it" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Predict2({ t }: StepCtx) {
  return (
    <Svg label="a pulled source goes silent, zero new rows today — does that look different from a genuinely quiet day?" h={230}>
      <Row y={80} label="a loud error" value="tempting, wrong" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={165} label="a quiet day" value="only alert catches it" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="the decision card with the SLO line, cheapest-that-clears, Lambda and Kappa placed on it, and push versus pull's different failure visibility" h={290}>
      <Row y={45} label="decision card" value="cheapest that clears" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="Lambda, Kappa" value="placed by cost" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={155} label="push vs pull" value="owns the failure" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={210} label="silent pull" value="looks quiet" o={easeOut(seg(t, 0.55, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="the SLO tightens from fifteen minutes to thirty seconds for a fraud-review ask — which shapes survive the card now?" h={250}>
      <Row y={65} label="thirty seconds" value="far stricter line" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={140} label="micro-batch, hybrid" value="no longer clear" valueColor={C.taupe} o={easeOut(seg(t, 0.3, 0.7))} />
      <Row y={215} label="streaming only" value="no fallback left" valueColor={C.focus} o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}
