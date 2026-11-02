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
    <Svg label="passed in CI. failed on a colleague's machine." h={200}>
      <Row y={70} label="in CI" value="passes every time" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="elsewhere" value="fails sometimes" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictPassingProves({ t }: StepCtx) {
  return (
    <Svg label="does a passing test prove correctness?" h={200}>
      <Row y={70} label="the test" value="kept passing" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="proof of correct?" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealUnitTests({ t }: StepCtx) {
  return (
    <Svg label="mocked input. expected output. nothing materialized." h={200}>
      <Row y={70} label="dbt unit test" value="mocked, static" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="pytest on Spark" value="a pure function" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealPropertyBased({ t }: StepCtx) {
  return (
    <Svg label="one rule. many generated inputs. a real counterexample." h={200}>
      <Row y={70} label="the invariant" value="never decreases" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="buggy merge" value="genuinely violates it" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictTomorrowRegression({ t }: StepCtx) {
  return (
    <Svg label="does today's passing test catch tomorrow's regression?" h={200}>
      <Row y={70} label="today's test" value="still passes" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="tomorrow's bug?" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealGoldenSnapshot({ t }: StepCtx) {
  return (
    <Svg label="the whole known-good output, diffed every time." h={200}>
      <Row y={70} label="narrow test" value="missed it" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="golden snapshot" value="caught it" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealTopRung({ t }: StepCtx) {
  return (
    <Svg label="inside the live pipeline, not before it." h={200}>
      <Row y={70} label="pre-merge tests" value="never saw it" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="in-pipeline check" value="catches it live" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealFlakiness({ t }: StepCtx) {
  return (
    <Svg label="ordering. time. floating point." h={260}>
      <Row y={40} label="ordering" value="unordered compare" o={easeOut(seg(t, 0, 0.25))} />
      <Row y={85} label="time" value="baked-in now" o={easeOut(seg(t, 0.12, 0.37))} />
      <Row y={130} label="floating point" value="order-dependent" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.6))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="four rungs. three real causes of flakiness." h={260}>
      <Row y={40} label="bottom rung" value="fast, narrow" o={easeOut(seg(t, 0, 0.25))} />
      <Row y={85} label="top rung" value="slow, broad" o={easeOut(seg(t, 0.12, 0.37))} />
      <Row y={130} label="flakiness" value="three real causes" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.6))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="same three numbers. does the order change the total?" h={200}>
      <Row y={70} label="three numbers" value="added, forward" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="same numbers" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
