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
    <Svg label="a regulator wants every table holding restricted data, with its owner, by tomorrow" h={200}>
      <Row y={70} label="central team, by hand" value="weeks, and wrong" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="no central rules" value="every domain, different" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealMeshShape({ t }: StepCtx) {
  return (
    <Svg label="domains own data products; a platform self-serves; policy is central and automated" h={240}>
      <Row y={60} label="domain teams" value="own their own data products" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={115} label="platform team" value="self-serve tooling" o={easeOut(seg(t, 0.15, 0.6))} />
      <Row y={170} label="central policy" value="applied by the platform" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictSplit({ t }: StepCtx) {
  return (
    <Svg label="policy, ownership, tooling -- central, domain-local, or split which way?" h={240}>
      <Row y={60} label="policy" value="central or local?" />
      <Row y={115} label="ownership" value="central or local?" />
      <Row y={170} label="tooling" value="central or local?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealSplitAnswer({ t }: StepCtx) {
  return (
    <Svg label="policy: central. ownership: stays local. tooling: central, enforces the policy" h={240}>
      <Row y={60} label="policy" value="central" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={115} label="ownership" value="stays with the domain" o={easeOut(seg(t, 0.15, 0.6))} />
      <Row y={170} label="tooling" value="central, enforces the rule" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ElaborateConway({ t }: StepCtx) {
  return (
    <Svg label="Conway, 1968: a design copies the org's own communication structure, reversed" h={200}>
      <Row y={70} label="Conway's thesis" value="design copies the org chart" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="reversed" value="choose the structure you want" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictStewardship({ t }: StepCtx) {
  return (
    <Svg label="a mask, an ownerless table, a retention exception -- automate, or human?" h={240}>
      <Row y={60} label="a rule over a tag" value="automate, or human?" />
      <Row y={115} label="a retention exception" value="automate, or human?" />
      <Row y={170} label="an ambiguous column" value="automate, or human?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealStewardshipAnswer({ t }: StepCtx) {
  return (
    <Svg label="a rule over a tag: automate. a legal reason, an ambiguous call: a named steward" h={240}>
      <Row y={60} label="a rule over a tag" value="automated, by the platform" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={115} label="a legal reason" value="a named steward decides" o={easeOut(seg(t, 0.15, 0.6))} />
      <Row y={170} label="an ambiguous column" value="a named steward decides" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealGateRuns({ t }: StepCtx) {
  return (
    <Svg label="measured: a compliant table is admitted; one missing its tag is rejected, by name" h={200}>
      <Row y={70} label="schema, contract, tag ok" value="admitted, measured" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="missing its tag" value="rejected, rule named" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="policy central, ownership local, tooling automates; judgment keeps a named steward" h={280}>
      <Row y={50} label="policy" value="central, written once" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="ownership" value="stays with the domain" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={150} label="judgment" value="a named steward, not a rule" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}
