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
    <Svg label="a root-cause query joined on equal timestamps returns almost nothing; joined with no tolerance it returns a value for every row, one of them nearly an hour old" h={200}>
      <Row y={70} label="equal timestamps" value="almost no match" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="no tolerance" value="an hour stale" valueColor={C.badText} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealAsofJoin({ t }: StepCtx) {
  return (
    <Svg label="for each dense pressure reading, the as-of join takes the last temperature reading at or before it — the same join mechanism, now matching two sensors" h={200}>
      <Row y={70} label="pressure" value="dense, fast" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="temperature" value="sparse, matched back" valueColor={C.second} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictTolerance({ t }: StepCtx) {
  return (
    <Svg label="the two sensors' clocks disagree by a known offset — setting the tolerance tighter than that offset, does the join get more accurate?" h={200}>
      <Row y={70} label="tighter tolerance" value="more accurate?" />
      <Row y={130} label="or" value="less, or none?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealBelowOffset({ t }: StepCtx) {
  return (
    <Svg label="a tolerance set under the clock offset excludes at least as many matches as one set at the offset — nothing gained, real matches lost" h={200}>
      <Row y={70} label="below the offset" value="excludes more" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="gained" value="nothing" valueColor={C.badText} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealNullRate({ t }: StepCtx) {
  return (
    <Svg label="DuckDB and pandas agree on every joined row; as tolerance shrinks past the signal's own report period, the null rate climbs from zero" h={220}>
      <Row y={55} label="DuckDB, pandas" value="identical rows" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="past report period" value="nulls climb" valueColor={C.badText} o={easeOut(seg(t, 0.25, 0.65))} />
      <Row y={170} label="within it" value="zero nulls" valueColor={C.focus} o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}

export function RevealStepVsInterpolated({ t }: StepCtx) {
  return (
    <Svg label="on a known ramp, a backward match holds a flat stale value while interpolating between the sample before and after recovers the true value, at the cost of looking ahead" h={200}>
      <Row y={70} label="backward match" value="flat, stale" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="interpolated" value="true, but ahead" valueColor={C.second} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealPartitionKey({ t }: StepCtx) {
  return (
    <Svg label="without a per-equipment partition key, one equipment's pressure reading can quietly borrow another equipment's nearest temperature value" h={200}>
      <Row y={70} label="no partition key" value="wrong equipment" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="no error" value="just wrong" valueColor={C.badText} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="an as-of join takes the last value at or before, a too-tight tolerance helps nothing, interpolation costs a look-ahead, and a partition key is required for correctness" h={260}>
      <Row y={50} label="as-of" value="last value before" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="too tight" value="helps nothing" valueColor={C.badText} o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="interpolation" value="costs look-ahead" valueColor={C.second} o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={185} label="partition key" value="required" valueColor={C.focus} o={easeOut(seg(t, 0.55, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a pipeline's as-of join has no tolerance and no partition key and has never once returned a null — is that a sign the join is working well?" h={200}>
      <Row y={70} label="no tolerance" value="no partition key" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="zero nulls" value="ever" valueColor={C.badText} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
