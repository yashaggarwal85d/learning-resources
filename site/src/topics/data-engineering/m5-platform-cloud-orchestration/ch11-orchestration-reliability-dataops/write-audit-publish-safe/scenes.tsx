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
    <Svg label="straight to production vs audited first." h={200}>
      <Row y={70} label="no audit" value="corrupted, unnoticed" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="audited first" value="blocked in minutes" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictCIMeansSafeDeploy({ t }: StepCtx) {
  return (
    <Svg label="safe to merge. is that safe to deploy?" h={200}>
      <Row y={70} label="passed CI" value="safe to merge" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="safe to deploy?" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealAuditBranch({ t }: StepCtx) {
  return (
    <Svg label="written. not yet visible downstream." h={200}>
      <Row y={70} label="audit branch" value="separate history" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="consumers" value="see only main" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealAuditGate({ t }: StepCtx) {
  return (
    <Svg label="pass: fast-forwarded. fail: never arrives." h={200}>
      <Row y={70} label="audit passes" value="fast-forwarded" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="audit fails" value="production untouched" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictTableNeedsAppSafety({ t }: StepCtx) {
  return (
    <Svg label="known for app code. true for tables?" h={200}>
      <Row y={70} label="blue-green, canary" value="known for apps" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="tables too?" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealBlueGreenCanary({ t }: StepCtx) {
  return (
    <Svg label="one pointer swap. one partition first." h={200}>
      <Row y={70} label="blue-green" value="single pointer swap" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="canary" value="one partition first" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealShadowRun({ t }: StepCtx) {
  return (
    <Svg label="runs in parallel. diffed before cutover." h={200}>
      <Row y={70} label="shadow run" value="zero live traffic" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="diffed" value="caught before cutover" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealFlagAndRollback({ t }: StepCtx) {
  return (
    <Svg label="toggled, not redeployed. one-step rollback." h={200}>
      <Row y={70} label="feature flag" value="instantly reversible" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="time travel" value="one-step rollback" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="six mechanisms. one shared idea." h={260}>
      <Row y={40} label="WAP" value="audited before merge" o={easeOut(seg(t, 0, 0.25))} />
      <Row y={85} label="blue-green, canary" value="measured rollout" o={easeOut(seg(t, 0.12, 0.37))} />
      <Row y={130} label="shared idea" value="nothing unverified lands" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.6))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="one good batch. one bad batch." h={200}>
      <Row y={70} label="good batch" value="passes the audit" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="bad batch" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
