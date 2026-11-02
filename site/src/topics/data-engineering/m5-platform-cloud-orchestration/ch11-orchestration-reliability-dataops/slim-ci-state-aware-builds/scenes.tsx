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
    <Svg label="one model changed. whole project rebuilt." h={200}>
      <Row y={70} label="one model" value="actually changed" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="full rebuild" value="builds everything" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictSafetyRequiresEverything({ t }: StepCtx) {
  return (
    <Svg label="is a full rebuild the only safe option?" h={200}>
      <Row y={70} label="full rebuild" value="certainly safe" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="only option?" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealStateModifiedDefer({ t }: StepCtx) {
  return (
    <Svg label="changed, plus downstream. rest deferred." h={200}>
      <Row y={70} label="state:modified" value="changed plus downstream" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="--defer" value="rest stays production" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealVirtualEnvironment({ t }: StepCtx) {
  return (
    <Svg label="already built. point production at it." h={200}>
      <Row y={70} label="SQLMesh plan" value="previews the change" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="promotion" value="no recomputation" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictContractUnchangedMeansSafe({ t }: StepCtx) {
  return (
    <Svg label="same model. does unchanged mean safe?" h={200}>
      <Row y={70} label="model contract" value="looks unchanged" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="one column" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealColumnBreakingChange({ t }: StepCtx) {
  return (
    <Svg label="skip expand: breaking. expand first: not." h={200}>
      <Row y={70} label="straight contract" value="flagged breaking" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="expand first" value="not breaking" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealSeededSample({ t }: StepCtx) {
  return (
    <Svg label="fast and small. how much of the bug count?" h={200}>
      <Row y={70} label="full table" value="every bug caught" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="seeded sample" value="only a fraction" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealLineageSlaGate({ t }: StepCtx) {
  return (
    <Svg label="wrong value. broken lineage. breached SLO." h={260}>
      <Row y={40} label="wrong value" value="the usual gate" o={easeOut(seg(t, 0, 0.25))} />
      <Row y={85} label="broken lineage" value="an edge vanished" o={easeOut(seg(t, 0.12, 0.37))} />
      <Row y={130} label="breached SLO" value="caught pre-merge" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.6))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="state-aware. column-aware. gate-aware." h={260}>
      <Row y={40} label="state-aware build" value="only what changed" o={easeOut(seg(t, 0, 0.25))} />
      <Row y={85} label="column-aware" value="catches hidden breaks" o={easeOut(seg(t, 0.12, 0.37))} />
      <Row y={130} label="gate-aware" value="more than values" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.6))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="same change. full rebuild vs state-aware." h={200}>
      <Row y={70} label="full rebuild" value="builds every model" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="state-aware" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
