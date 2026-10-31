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
    <Svg label="every test green. three dashboards broke anyway." h={200}>
      <Row y={70} label="producer's own CI" value="all green" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="with a contract" value="rejected in CI" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictCIProtectsConsumers({ t }: StepCtx) {
  return (
    <Svg label="safe to deploy. safe for who reads it?" h={200}>
      <Row y={70} label="WAP" value="protects the publish" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="consumers too?" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealContractAsCode({ t }: StepCtx) {
  return (
    <Svg label="schema, quality, SLAs, ownership. one file." h={260}>
      <Row y={40} label="schema" value="columns, types" o={easeOut(seg(t, 0, 0.25))} />
      <Row y={85} label="quality rules" value="checks on data" o={easeOut(seg(t, 0.12, 0.37))} />
      <Row y={130} label="SLAs" value="freshness, retention" o={easeOut(seg(t, 0.24, 0.49))} />
      <Row y={175} label="ownership" value="named team" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.65))} />
    </Svg>
  );
}

export function RevealBreakingChangeGate({ t }: StepCtx) {
  return (
    <Svg label="no path: blocked. expand first: allowed." h={200}>
      <Row y={70} label="straight rename" value="merge blocked" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="expand first" value="merge allowed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictGateCatchesEverything({ t }: StepCtx) {
  return (
    <Svg label="caught before the merge. caught every time?" h={200}>
      <Row y={70} label="CI gate" value="checks a merge" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="no merge ever?" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealRuntimeEnforcement({ t }: StepCtx) {
  return (
    <Svg label="never went through CI. caught anyway." h={200}>
      <Row y={70} label="out-of-band write" value="skipped CI entirely" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="runtime check" value="catches it anyway" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealLineageNotification({ t }: StepCtx) {
  return (
    <Svg label="one change. three owners found." h={200}>
      <Row y={70} label="approved change" value="three tables touched" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="owners" value="notified automatically" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="four mechanisms. one closed gap." h={260}>
      <Row y={40} label="contract as code" value="one versioned file" o={easeOut(seg(t, 0, 0.25))} />
      <Row y={85} label="CI gate, runtime" value="two checkpoints" o={easeOut(seg(t, 0.12, 0.37))} />
      <Row y={130} label="closed gap" value="consumer protected too" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.6))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="one rename blocked. one rename allowed." h={200}>
      <Row y={70} label="no migration path" value="gate blocks it" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="migration path" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
