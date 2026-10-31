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
    <Svg label="a handful of small registers estimates how many distinct values passed by, without storing one of them" h={200}>
      <Row y={70} label="small registers" value="count run lengths" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="estimate" value="how many distinct" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictMergeMatches({ t }: StepCtx) {
  return (
    <Svg label="does merging two sketches from separate partitions match one sketch built over all the combined data?" h={200}>
      <Row y={70} label="merged sketch" value="same as combined?" />
      <Row y={130} label="single pass" value="over everything" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealRegisterRunLength({ t }: StepCtx) {
  return (
    <Svg label="each register tracks the longest run of leading zeros it has seen" h={200}>
      <Row y={70} label="a hashed key" value="lands in slot" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="that register" value="keeps longest run" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealHarmonicMean({ t }: StepCtx) {
  return (
    <Svg label="averaging registers with a harmonic mean, not an arithmetic one, is what tames one unlucky outlier" h={200}>
      <Row y={70} label="one long run" value="would wreck average" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="harmonic mean" value="tames that outlier" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealMeasuredError({ t }: StepCtx) {
  return (
    <Svg label="a real sketch's error against an exact count shrinks as more registers get used" h={200}>
      <Row y={70} label="few registers" value="larger real error" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="many registers" value="error shrinks" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealHLLPlusPlus({ t }: StepCtx) {
  return (
    <Svg label="a measured bias correction and a sparse mode for small counts, named from the engine's own paper" h={200}>
      <Row y={70} label="small counts" value="measured, corrected" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="mostly empty" value="sparse, not dense" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealApproxCountDistinct({ t }: StepCtx) {
  return (
    <Svg label="a warehouse's own approximate count trades exactness for speed, on purpose, at huge scale" h={200}>
      <Row y={70} label="approximate count" value="trades for speed" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="set questions" value="need different sketch" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="leading zeros per register, a harmonic mean, real error shrinking with memory, bias correction and sparse mode, and set sketches for a different question" h={260}>
      <Row y={50} label="registers" value="leading zero runs" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="harmonic mean" value="tames outliers" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="more memory" value="real error shrinks" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <Row y={185} label="set questions" value="need different sketch" o={easeOut(seg(t, 0.5, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a team merges daily sketches into a rolling estimate; a teammate now needs an exact set difference — does the same sketch answer that?" h={200}>
      <Row y={70} label="rolling estimate" value="already works" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="set difference" value="needs new sketch" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}
