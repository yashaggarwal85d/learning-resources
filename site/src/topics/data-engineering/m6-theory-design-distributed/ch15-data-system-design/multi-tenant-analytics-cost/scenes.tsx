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
    <Svg label="one seller's query slows every other seller's dashboard" h={270}>
      <T x={300} y={50} s={14} f={C.taupe} a="middle" o={easeOut(seg(t, 0, 0.5))}>
        thousands of sellers, one warehouse
      </T>
      <T x={300} y={90} s={17} f={C.crema} a="middle" w={600} serif italic o={easeOut(seg(t, 0.15, 0.6))}>
        and a bill with no names on it
      </T>
      <Row y={150} label="one seller" value="scans everything" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={195} label="everyone else" value="slows down" o={easeOut(seg(t, 0.5, 0.8))} />
      <Row y={240} label="finance asks" value="who costs what?" o={easeOut(seg(t, 0.65, 1))} />
    </Svg>
  );
}

export function Predict1({ t }: StepCtx) {
  return (
    <Svg label="which two controls would have prevented the slowdown?" h={210}>
      <Row y={75} label="a bigger box" value="still no limit" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="a quota" value="plus a meter" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealIsolationLadder({ t }: StepCtx) {
  return (
    <Svg label="shared tables, schema per tenant, account per tenant — each priced" h={240}>
      <Row y={55} label="shared table" value="cheapest" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={105} label="schema each" value="a middle ground" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={155} label="account each" value="strongest, costliest" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
    </Svg>
  );
}

export function RevealForcedUp({ t }: StepCtx) {
  return (
    <Svg label="a regulated or noisy tenant gets pushed up one rung" h={210}>
      <Row y={75} label="the default" value="cheapest rung" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="one constraint" value="forces it up" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealNoisySimulated({ t }: StepCtx) {
  return (
    <Svg label="one lane spikes; neighbours climb without a control, flat with one" h={210}>
      <Row y={75} label="no control" value="neighbours climb" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="with a quota" value="neighbours stay flat" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealFairnessRules({ t }: StepCtx) {
  return (
    <Svg label="three fairness rules split the same spike differently" h={240}>
      <Row y={55} label="equal share" value="starves big tenant" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={105} label="weighted share" value="favors who pays" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={155} label="burst credit" value="caps the sustained" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
    </Svg>
  );
}

export function RevealErasureCoupled({ t }: StepCtx) {
  return (
    <Svg label="a tenant's own key or schema erases cheap; shared needs a rewrite" h={210}>
      <Row y={75} label="own schema" value="one drop, cheap" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="shared table" value="scan and rewrite" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealRemainderPolicy({ t }: StepCtx) {
  return (
    <Svg label="per-tenant slices, plus a grey remainder with its own policy" h={210}>
      <Row y={75} label="per tenant" value="metered, named" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="the remainder" value="a stated policy" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a priced ladder, a fairness rule, coupled erasure, a metered bill" h={290}>
      <Row y={45} label="isolation" value="priced per rung" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="noisy neighbor" value="capped, fairly" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={155} label="erasure" value="tied to isolation" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={210} label="the bill" value="named, policy stated" o={easeOut(seg(t, 0.55, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="ten times the tenants; what's the next bottleneck?" h={250}>
      <Row y={65} label="more tenants" value="cost barely moves" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={140} label="the meter itself" value="starts showing up" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
      <Row y={215} label="not" value="move everyone up" o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}
