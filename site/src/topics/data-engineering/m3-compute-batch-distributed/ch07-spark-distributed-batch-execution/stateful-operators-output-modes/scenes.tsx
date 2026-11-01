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
    <Svg label="the watermark bounds how long state waits. This is what that state is." h={200}>
      <Row y={70} label="watermark" value="bounds the wait" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="this topic" value="what it holds" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealThreeModes({ t }: StepCtx) {
  return (
    <Svg label="three output modes: new rows only, changed rows only, or the whole table." h={260}>
      <Row y={60} label="append" value="new rows only" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={120} label="update" value="changed rows only" o={easeOut(seg(t, 0.25, 0.7))} />
      <Row y={180} label="complete" value="whole table, always" valueColor={C.focus} o={easeOut(seg(t, 0.5, 1))} />
    </Svg>
  );
}

export function PredictCompleteOnJoin({ t }: StepCtx) {
  return (
    <Svg label="a stream-stream join, asked for complete mode. Accepted, or rejected?" h={200}>
      <Row y={70} label="join" value="complete mode" />
      <Row y={130} label="accepted?" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealRejected({ t }: StepCtx) {
  return (
    <Svg label="measured: rejected before the query even starts. A real analysis error." h={200}>
      <Row y={70} label="complete on join" value="rejected" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="when" value="before query starts" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ElaborateWhyJoinsAppendOnly({ t }: StepCtx) {
  return (
    <Svg label="a join's own rows can't be revised once emitted -- only append fits that." h={200}>
      <Row y={70} label="join output" value="never revised" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="so" value="append only" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictNoWatermarkJoin({ t }: StepCtx) {
  return (
    <Svg label="the same join, with no watermark on either side. Accepted, or rejected?" h={200}>
      <Row y={70} label="join" value="no watermark" />
      <Row y={130} label="accepted?" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealAcceptedButGrowing({ t }: StepCtx) {
  return (
    <Svg label="measured: accepted, and running -- but its buffered state only grows." h={200}>
      <Row y={70} label="no watermark" value="accepted" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="state size" value="keeps climbing" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ElaborateBothSidesBuffer({ t }: StepCtx) {
  return (
    <Svg label="a join buffers both sides as state -- with no safe point to drop any of it." h={200}>
      <Row y={70} label="both sides" value="buffered as state" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="no watermark" value="nothing to drop" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealBoundedPlateau({ t }: StepCtx) {
  return (
    <Svg label="add a watermark and a time-range condition, and the growth stops." h={260}>
      <Row y={60} label="watermark" value="plus time range" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={120} label="state size" value="climbs, then holds" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.7))} />
      <Row y={180} label="measured" value="a steady plateau" valueColor={C.focus} o={easeOut(seg(t, 0.5, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="three modes decide what gets emitted; a watermark decides what gets kept." h={280}>
      <Row y={50} label="the three modes" value="append, update, complete" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="what gets rejected" value="the query's shape" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={150} label="what bounds state" value="watermark, not mode" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}
