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
    <Svg label="the legacy system reports revenue as integer cents and local Berlin time; the shop's own system reports decimals and UTC. Summed together, one is off by a hundred, the other by an hour on the clock-change night." h={200}>
      <Row y={70} label="legacy revenue, summed in" value="off by a hundred" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="legacy timestamp" value="off by an hour" valueColor={C.badText} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function Predict({ t }: StepCtx) {
  return (
    <Svg label="does fixing the currency mismatch also fix the timestamp mismatch, or are they two entirely separate problems needing two separate fixes?" h={200}>
      <Row y={70} label="one fix for both" value="one possibility" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="are they related" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealSchemaMatching({ t }: StepCtx) {
  return (
    <Svg label="two schemas get matched by name, type and sample-value evidence; thicker match lines mean stronger evidence, and the result is written as a transformation." h={200}>
      <Row y={70} label="match evidence" value="name, type, values" valueColor={C.focus} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the result" value="a written transformation" o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealCrosswalk({ t }: StepCtx) {
  return (
    <Svg label="a crosswalk table maps one system's own code to another's, carrying a validity window; a fact joins to the row in force at its own event time." h={220}>
      <Row y={60} label="the crosswalk" value="code, target, validity window" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="a fact joins to" value="the row valid then" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={160} label="not to" value="whichever row is current now" valueColor={C.badText} o={easeOut(seg(t, 0.4, 0.8))} />
    </Svg>
  );
}

export function RevealUnits({ t }: StepCtx) {
  return (
    <Svg label="a named unit standard maps every unit string to exactly one meaning a machine can check, rather than leaving units as free text." h={200}>
      <Row y={70} label="a unit string" value="exactly one meaning" valueColor={C.focus} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="free-text units" value="ambiguous, unchecked" valueColor={C.badText} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealCurrencyExponent({ t }: StepCtx) {
  return (
    <Svg label="each currency has its own minor-unit exponent; skipping it and converting an integer-cents figure as if it were already a decimal is off by exactly that scale." h={220}>
      <Row y={60} label="legacy figure" value="integer minor units" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="divide by exponent" value="correct decimal amount" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={160} label="skip that division" value="off by exactly the scale" valueColor={C.badText} o={easeOut(seg(t, 0.4, 0.8))} />
    </Svg>
  );
}

export function RevealTimezone({ t }: StepCtx) {
  return (
    <Svg label="storing a UTC instant plus its original zone survives a real daylight-saving transition that a fixed-offset conversion gets wrong by exactly an hour." h={200}>
      <Row y={70} label="zone-aware" value="correct through the transition" valueColor={C.focus} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a fixed offset" value="wrong by exactly an hour" valueColor={C.badText} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealVersionedTests({ t }: StepCtx) {
  return (
    <Svg label="the mapping lives as versioned, owned, tested data; a brand-new source code with no mapping fails a test immediately, instead of quietly becoming unknown." h={220}>
      <Row y={60} label="the mapping itself" value="versioned, owned, tested" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="a new unmapped code" value="fails a test, by name" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={160} label="instead of" value="quietly falling to unknown" valueColor={C.badText} o={easeOut(seg(t, 0.4, 0.8))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="matching by evidence, a slowly changing crosswalk, units and currencies reconciled explicitly, and the mapping itself owned as tested data." h={260}>
      <Row y={50} label="schema matching" value="by evidence, not guesswork" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="the crosswalk" value="joined by event time" valueColor={C.focus} o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="units, currency, zone" value="reconciled explicitly" o={easeOut(seg(t, 0.25, 0.55))} />
      <Row y={185} label="the mapping itself" value="owned, versioned, tested" valueColor={C.badText} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a new legacy order category code appears for the first time, with nobody having added it to the crosswalk yet. What happens the moment that row is loaded?" h={200}>
      <Row y={70} label="the new code" value="not yet in the crosswalk" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="what happens on load" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}
