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
    <Svg label="one regulator ask. weeks late, and wrong." h={200}>
      <Row y={70} label="central list" value="weeks, and wrong" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="no central rule" value="every domain differs" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Predict({ t }: StepCtx) {
  return (
    <Svg label="policy, ownership, tooling. which stays central?" h={200}>
      <Row y={70} label="what's central" value="not yet revealed" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="what's bypassed" value="the real risk" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealMeshShape({ t }: StepCtx) {
  return (
    <Svg label="domain owns data. platform enforces policy." h={260}>
      <Row y={50} label="domain" value="owns its data" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="platform" value="supplies tooling" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="central body" value="writes the policy" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealReverseConway({ t }: StepCtx) {
  return (
    <Svg label="a team's shape becomes the design's shape." h={200}>
      <Row y={70} label="Conway, forward" value="shape, by accident" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="reversed, on purpose" value="shape chosen first" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealAutomateVsHuman({ t }: StepCtx) {
  return (
    <Svg label="a rule runs itself. a judgement needs a person." h={200}>
      <Row y={70} label="a rule" value="runs itself" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a judgement call" value="needs a steward" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealGateSchemaContract({ t }: StepCtx) {
  return (
    <Svg label="gate one, gate two. one table bounced." h={200}>
      <Row y={70} label="gate one" value="names and types" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="gate two" value="missing a version" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealGateClassification({ t }: StepCtx) {
  return (
    <Svg label="gate three. an untagged column, bounced." h={200}>
      <Row y={70} label="gate three" value="every column tagged" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="untagged column" value="bounced, named reason" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealStewardship({ t }: StepCtx) {
  return (
    <Svg label="no gate can decide these three." h={260}>
      <Row y={50} label="criticality" value="a domain lead" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="an exception" value="a legal reason" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="untagged column" value="a domain owner" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="central policy; reversed shape; three named gates." h={260}>
      <Row y={50} label="policy, ownership" value="central, or domain" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="Conway, reversed" value="shape chosen first" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="rule, judgement" value="itself, or steward" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="inside the stated limit. a rule, or a person?" h={200}>
      <Row y={70} label="inside the limit" value="rule, or person?" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="the answer" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
