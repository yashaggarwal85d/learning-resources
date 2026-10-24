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
    <Svg label="Polars, Pydantic's validation core, the ADBC driver — this chapter called all three fast. What are they actually written in?" h={200}>
      <Row y={70} label="speed, named" value="this chapter, all along" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="what's underneath" value="not yet shown" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealNamedDirectly({ t }: StepCtx) {
  return (
    <Svg label="Polars' own documentation, Pydantic's own documentation — what do they say they're written in?" h={200}>
      <Row y={70} label="Polars' own docs" value="names Rust directly" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="Pydantic's own docs" value="names Rust directly" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealExtensionBuilds({ t }: StepCtx) {
  return (
    <Svg label="a Rust function, compiled into Python with one build tool — does the import actually work?" h={200}>
      <Row y={70} label="a Rust function" value="compiled, real build" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="import, call it" value="a real result" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealThreeWays({ t }: StepCtx) {
  return (
    <Svg label="the identical transformation, run as pure Python, as a compiled extension, and as a Polars expression — how do the real times compare?" h={260}>
      <Row y={50} label="pure Python" value="a measured time" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="the extension" value="measurably faster" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.5))} />
      <Row y={140} label="Polars" value="a measured time" o={easeOut(seg(t, 0.4, 0.7))} />
      <Row y={185} label="all three" value="the same answer" o={easeOut(seg(t, 0.6, 1))} />
    </Svg>
  );
}

export function PredictGilRelease({ t }: StepCtx) {
  return (
    <Svg label="a Rust extension explicitly releases the GIL mid-call — does a separate Python thread actually get to run, or is that just a formality?" h={200}>
      <Row y={70} label="the lock, released" value="a formality?" />
      <Row y={130} label="a separate thread" value="real progress?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealGilMeasured({ t }: StepCtx) {
  return (
    <Svg label="the identical busy work, once holding the GIL and once releasing it — how much does a separate Python thread actually get done?" h={200}>
      <Row y={70} label="GIL held" value="a small count" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="GIL released" value="a far larger count" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealAbi3({ t }: StepCtx) {
  return (
    <Svg label="the identical extension, built once per-version and once as abi3 — do the two wheel files actually differ, or is abi3 just a label?" h={200}>
      <Row y={70} label="per-version build" value="tagged, this version only" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="abi3 build" value="tagged, versions and up" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealFreeThreadingChecked({ t }: StepCtx) {
  return (
    <Svg label="this sandbox's own interpreter, checked directly — is it actually a free-threaded build, or not?" h={200}>
      <Row y={70} label="checked directly" value="a standard build" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="free-threaded" value="needs its own binary" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="two libraries naming Rust directly, a real extension built and measured, a measured GIL release, two real wheels, one checked build fact" h={260}>
      <Row y={50} label="Rust, named" value="two libraries' own docs" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="a real extension" value="built, measured faster" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="the GIL, released" value="real, measured progress" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <Row y={185} label="one flag, two wheels" value="a checked build fact" o={easeOut(seg(t, 0.5, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a team shipped a per-version wheel and now needs three more versions covered — what should they have chosen upfront, and why does it matter now?" h={220}>
      <Row y={55} label="one wheel, one version" value="shipped upfront" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="three more" value="each, its own wheel" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
      <Row y={165} label="the fix" value="abi3, from the start" valueColor={C.focus} o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}
