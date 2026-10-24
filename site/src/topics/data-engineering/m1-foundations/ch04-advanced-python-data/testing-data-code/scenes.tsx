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
    <Svg label="a retry client that looks correct — which test actually catches the bug that isn't on the happy path?" h={200}>
      <Row y={70} label="one client" value="five test layers" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="which one" value="catches a replay bug" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealUnitTest({ t }: StepCtx) {
  return (
    <Svg label="one minimal input, not a full dataset — does the function do the one thing it claims?" h={200}>
      <Row y={70} label="one dict, one call" value="one assertion" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a full dataset" value="not needed here" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealPropertyTest({ t }: StepCtx) {
  return (
    <Svg label="one generated sequence of write attempts, a hundred times — does the invariant hold every time?" h={200}>
      <Row y={70} label="a hundred cases" value="one rule, holds" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="one example" value="proves itself only" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictGenerated({ t }: StepCtx) {
  return (
    <Svg label="a handwritten replay test with three retries — does a generated test find anything it misses?" h={200}>
      <Row y={70} label="hand-picked retries" value="covers one sequence" />
      <Row y={130} label="a generated test" value="finds more?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealContractTest({ t }: StepCtx) {
  return (
    <Svg label="a consumer client, calling a mock provider that was built from the exact interaction it's expected to send" h={200}>
      <Row y={70} label="one interaction" value="builds a real mock server" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the real client call" value="checked against it" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealIntegrationTest({ t }: StepCtx) {
  return (
    <Svg label="the same insert-then-read, run against an in-memory stub vs. a real running database" h={200}>
      <Row y={70} label="a stub" value="always agrees with itself" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a real cluster" value="the thing that can disagree" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealGoldenMaster({ t }: StepCtx) {
  return (
    <Svg label="the same deterministic report, generated twice — does it still match the file recorded the first time?" h={200}>
      <Row y={70} label="first run" value="output recorded to a file" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="every later run" value="diffed against that file" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealFiveLayers({ t }: StepCtx) {
  return (
    <Svg label="the same client from five angles — unit, property, contract, integration, golden — run end to end" h={260}>
      <Row y={50} label="unit" value="passed" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="property" value="passed" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="contract" value="passed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <Row y={185} label="integration, golden" value="passed" valueColor={C.focus} o={easeOut(seg(t, 0.5, 0.85))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="five layers: a minimal fixture, a hundred generated cases, a real mock provider, a real dependency, a recorded diff" h={260}>
      <Row y={50} label="unit, property" value="a fixture, a hundred cases" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="contract" value="a real mock provider" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="integration" value="a real dependency" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <Row y={185} label="golden-output" value="a recorded diff" o={easeOut(seg(t, 0.5, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a team ships on all-green unit tests and still ships a dedup bug a property test would have caught — what was missing?" h={220}>
      <Row y={55} label="unit tests only" value="all green" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="ships anyway" value="dedup bug, real replay" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
      <Row y={165} label="the fix" value="a generated property test" valueColor={C.focus} o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}
