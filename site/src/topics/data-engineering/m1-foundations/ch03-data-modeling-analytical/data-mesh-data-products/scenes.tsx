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
    <Svg label="one central team, every domain — does it still own the pipeline it understands least?" h={200}>
      <Row y={70} label="one central team" value="every domain" />
      <Row y={130} label="understands least" value="still owns it?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealDomainOwnershipQuote({ t }: StepCtx) {
  return (
    <Svg label="each domain hosts, serves its own data — not a centrally owned lake" h={200}>
      <Row y={70} label="each domain" value="hosts its own data" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="not" value="a centrally owned lake" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictOwnershipEqualsTrust({ t }: StepCtx) {
  return (
    <Svg label="a domain hosting its own data — trustworthy to everyone else, just by owning it?" h={200}>
      <Row y={70} label="domain hosts" value="its own data" />
      <Row y={130} label="trustworthy" value="just by owning it?" />
    </Svg>
  );
}

export function RevealDataAsProductQuote({ t }: StepCtx) {
  return (
    <Svg label="domain data, treated as a product — its consumers treated as customers" h={200}>
      <Row y={70} label="domain data" value="treated as a product" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="consumers" value="treated as customers" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealFourQualitiesQuote({ t }: StepCtx) {
  return (
    <Svg label="discoverable, addressable, trustworthy, inter-operable — a checklist, not a slogan" h={200}>
      <Row y={70} label="discoverable" value="addressable" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="trustworthy" value="inter-operable" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictOwnershipIsFree({ t }: StepCtx) {
  return (
    <Svg label="a domain, already operational — its own data pipeline too, free of extra cost?" h={200}>
      <Row y={70} label="domain" value="already operational" />
      <Row y={130} label="own pipeline" value="free of extra cost?" />
    </Svg>
  );
}

export function RevealOwnershipCostQuote({ t }: StepCtx) {
  return (
    <Svg label="ownership, distributed — specialized effort, duplicated in every domain's own pipeline" h={200}>
      <Row y={70} label="ownership" value="distributed" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="specialized effort" value="duplicated, per domain" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealFourPrinciplesQuote({ t }: StepCtx) {
  return (
    <Svg label="four named principles, together — collectively necessary and sufficient, Dehghani's own claim" h={200}>
      <Row y={70} label="four principles" value="named, together" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="claim" value="necessary, sufficient" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictMeshWithoutPlatform({ t }: StepCtx) {
  return (
    <Svg label="ownership, product standard adopted — platform still missing: does the mesh still work?" h={200}>
      <Row y={70} label="ownership, standard" value="adopted" />
      <Row y={130} label="platform missing" value="still works?" />
    </Svg>
  );
}

export function RevealSelfServePlatformQuote({ t }: StepCtx) {
  return (
    <Svg label="specialized infrastructure skill, hard to replicate per domain — the platform's own reason to exist" h={200}>
      <Row y={70} label="specialized skill" value="hard to replicate" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="platform" value="exists to remove it" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealFederatedGovernanceQuote({ t }: StepCtx) {
  return (
    <Svg label="domain-local autonomy, global rules — enforced by the platform, automatically" h={200}>
      <Row y={70} label="domain-local" value="autonomy" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="global rules" value="enforced by platform" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="ownership reversed; a real checklist; a shared platform; governance that keeps it together" h={260}>
      <Row y={60} label="ownership" value="reversed, by domain" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={120} label="data as a product" value="a real checklist" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={180} label="platform, governance" value="keep it together" o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="ownership and the standard, rolled out now — the shared platform, still far from ready" h={200}>
      <Row y={70} label="ownership, standard" value="rolled out now" />
      <Row y={130} label="platform" value="still far off" />
    </Svg>
  );
}
