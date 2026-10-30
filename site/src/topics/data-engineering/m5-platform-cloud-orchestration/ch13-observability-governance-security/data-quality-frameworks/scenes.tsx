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
    <Svg label="twelve checks. runtime doubled. still got through." h={200}>
      <Row y={70} label="checks added" value="runtime doubled" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="bad partition" value="reached dashboard" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Predict({ t }: StepCtx) {
  return (
    <Svg label="before publish, or after?" h={200}>
      <Row y={70} label="each check" value="before or after?" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the real cost" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealGateVsPosthoc({ t }: StepCtx) {
  return (
    <Svg label="gate: cheap, can block. scan: a full read." h={200}>
      <Row y={70} label="gate" value="before, can block" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="post-hoc scan" value="after, full scan" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealDbtTests({ t }: StepCtx) {
  return (
    <Svg label="a real run: one caught, one passed." h={200}>
      <Row y={70} label="data test" value="caught a gap" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="unit test" value="logic passed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealGxSuite({ t }: StepCtx) {
  return (
    <Svg label="same gap, caught again — plus one more." h={200}>
      <Row y={70} label="missing id" value="caught again" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="negative amount" value="caught, missed before" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealLandscape({ t }: StepCtx) {
  return (
    <Svg label="named, not run: no Spark, no live platform." h={260}>
      <Row y={50} label="contracts engine" value="checks a contract" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="Spark metrics library" value="checks a metric" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="platform framework" value="checks in PySpark" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealIncremental({ t }: StepCtx) {
  return (
    <Svg label="merge each partition. same answer, less work." h={200}>
      <Row y={70} label="full rescan" value="one count" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="incremental merge" value="same count, cheaper" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealSampling({ t }: StepCtx) {
  return (
    <Svg label="the sample said zero. it wasn't zero." h={200}>
      <Row y={70} label="full rescan" value="gap found" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="one-in-ten sample" value="missed entirely" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="gate vs scan; data vs logic; merge vs sample." h={260}>
      <Row y={50} label="gate, scan" value="cheap, or costly" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="data, unit test" value="built, or logic" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="merge, sample" value="exact, or missed" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a full-table gate, growing data." h={200}>
      <Row y={70} label="table keeps growing" value="flat, or climbing?" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="the answer" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
