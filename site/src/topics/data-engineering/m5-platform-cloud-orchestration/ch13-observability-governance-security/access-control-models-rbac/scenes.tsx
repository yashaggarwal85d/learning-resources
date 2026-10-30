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
    <Svg label="fourteen teams, sixty datasets, three environments." h={200}>
      <Row y={70} label="a role per cell" value="least privilege, they say" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="total roles" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Predict({ t }: StepCtx) {
  return (
    <Svg label="one new dataset. One change, or fourteen?" h={200}>
      <Row y={70} label="role grid" value="one change?" />
      <Row y={130} label="tag rule" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealRoleCount({ t }: StepCtx) {
  return (
    <Svg label="teams times datasets times environments." h={260}>
      <Row y={50} label="fourteen teams" value="times sixty datasets" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="times three" value="environments" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="total roles" value="unreviewable" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealAbacRule({ t }: StepCtx) {
  return (
    <Svg label="read the tag, not the team." h={260}>
      <Row y={50} label="tier, category" value="tags on the data" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="one short rule" value="reads the tags" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="the whole grid" value="replaced" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealDecisionEnforcement({ t }: StepCtx) {
  return (
    <Svg label="ask here, decide there." h={260}>
      <Row y={50} label="enforcement point" value="in the data path" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="decision point" value="answers the question" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="many surfaces" value="one shared engine" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealPolicyEngines({ t }: StepCtx) {
  return (
    <Svg label="ask the engine. Back comes a verdict." h={260}>
      <Row y={50} label="OPA, Cedar" value="policy engines" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="ask a question" value="allow or deny" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="or narrower" value="filter rows, mask" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealIdpFederation({ t }: StepCtx) {
  return (
    <Svg label="prove it once, at the IdP." h={200}>
      <Row y={70} label="SAML, OIDC" value="prove identity once" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="every system" value="trusts that proof" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealProvisioning({ t }: StepCtx) {
  return (
    <Svg label="a second job: the account itself." h={260}>
      <Row y={50} label="proving who you are" value="one job" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="having an account" value="a separate job" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="SCIM" value="does the second" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealOffboarding({ t }: StepCtx) {
  return (
    <Svg label="remove them once. Every system follows." h={200}>
      <Row y={70} label="remove at the IdP" value="one action" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="downstream systems" value="all follow, too" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealAccessReviews({ t }: StepCtx) {
  return (
    <Svg label="a correct rule, an expired reason." h={260}>
      <Row y={50} label="rule evaluated" value="correctly, every time" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="the reason" value="can go stale anyway" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="a periodic review" value="catches it" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="roles grow, tags stay flat." h={260}>
      <Row y={50} label="roles" value="grow with every cell" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="tags" value="one rule, stays flat" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="review" value="still needed, always" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="one dataset, every team. How many changes?" h={200}>
      <Row y={70} label="role grid" value="fourteen times three" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="tag rule" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
