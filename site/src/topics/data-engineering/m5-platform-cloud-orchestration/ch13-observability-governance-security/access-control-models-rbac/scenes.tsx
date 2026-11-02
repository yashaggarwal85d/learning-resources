import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

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
    <Svg label="14 teams, 60 datasets, 3 environments: one role per triple, for least privilege" h={200}>
      <Row y={70} label="teams x datasets x envs" value="one role each" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="new dataset" value="one change, or many?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealRBACShape({ t }: StepCtx) {
  return (
    <Svg label="a role holds many privileges; a user holds one or more roles" h={200}>
      <Row y={70} label="role" value="holds privileges" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="user" value="assigned roles" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictRoleCount({ t }: StepCtx) {
  return (
    <Svg label="14 teams, 60 datasets, 3 environments, one role per triple. How many roles?" h={200}>
      <Row y={70} label="14 x 60 x 3" value="one role per triple" />
      <Row y={130} label="total roles?" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealRoleCount({ t }: StepCtx) {
  return (
    <Svg label="measured: 2,520 roles for this one shop" h={200}>
      <Row y={70} label="14 x 60 x 3" value="2,520 roles" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="reviewable?" value="no longer, measured" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ElaborateABACRule({ t }: StepCtx) {
  return (
    <Svg label="ABAC: one rule over subject, object and environment attributes" h={200}>
      <Row y={70} label="subject, object, env" value="attributes, not names" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="one rule" value="replaces the grid" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictNewDataset({ t }: StepCtx) {
  return (
    <Svg label="data science gets a new restricted dataset. New RBAC roles vs new ABAC edits?" h={200}>
      <Row y={70} label="new restricted dataset" value="access for 1 team" />
      <Row y={130} label="RBAC vs ABAC changes?" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealNewDatasetCost({ t }: StepCtx) {
  return (
    <Svg label="measured: 3 new roles under RBAC, 0 edits under ABAC" h={200}>
      <Row y={70} label="RBAC" value="3 new roles" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="ABAC" value="0 edits, tag already matches" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ElaborateDecisionEnforcement({ t }: StepCtx) {
  return (
    <Svg label="the decision point and the enforcement point are two different jobs" h={200}>
      <Row y={70} label="decision point" value="one engine, many askers" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="enforcement point" value="applies the verdict" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealIdentityFederation({ t }: StepCtx) {
  return (
    <Svg label="identity comes from outside the policy engine: SSO authenticates, SCIM provisions" h={200}>
      <Row y={70} label="SSO (SAML, OIDC)" value="authenticates once" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="SCIM" value="removes access everywhere" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealAccessReviews({ t }: StepCtx) {
  return (
    <Svg label="entitlements drift over time; a periodic review is the catch policy alone misses" h={200}>
      <Row y={70} label="entitlements" value="drift, silently" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="periodic review" value="an owner attests" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="RBAC multiplies into a grid; ABAC is one rule; a policy still needs a place to run" h={280}>
      <Row y={50} label="RBAC" value="2,520 roles, measured" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="ABAC" value="one rule, 0 new edits" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={150} label="decision vs enforcement" value="two separate jobs" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}
