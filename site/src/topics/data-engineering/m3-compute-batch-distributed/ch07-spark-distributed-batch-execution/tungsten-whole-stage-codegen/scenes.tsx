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
    <Svg label="Catalyst chose three operators. Does each one run as its own virtual call per row, or something else entirely?" h={200}>
      <Row y={70} label="three chosen operators" value="one loop, or three?" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="what actually runs" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealFusion({ t }: StepCtx) {
  return (
    <Svg label="measured: Range, Filter, and Project all carry the same stage marker, star one. One generated method covers all three." h={200}>
      <Row y={70} label="three plan operators" value="same marker: *(1)" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="debug.codegen() reports" value="1 subtree found" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictRowShape({ t }: StepCtx) {
  return (
    <Svg label="that generated method still has to hold a row somehow. Does it build an ordinary JVM object per row, or something else?" h={200}>
      <Row y={70} label="generated Java method" value="holds each row how?" />
      <Row y={130} label="row representation" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealUnsafeRow({ t }: StepCtx) {
  return (
    <Svg label="measured: the generated source writes every row through UnsafeRowWriter, into UnsafeRow — raw bytes, not a JVM object." h={200}>
      <Row y={70} label="generated source calls" value="UnsafeRowWriter" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="row representation" value="UnsafeRow, raw bytes" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictParquetReader({ t }: StepCtx) {
  return (
    <Svg label="the vectorised Parquet reader feeds the same fused pipeline. Does it carry the same codegen marker too?" h={200}>
      <Row y={70} label="Parquet scan" value="marker too?" />
      <Row y={130} label="its own marker" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealColumnarException({ t }: StepCtx) {
  return (
    <Svg label="measured: the Parquet scan reports batched true and carries no marker at all. A separate ColumnarToRow node bridges it in." h={200}>
      <Row y={70} label="FileScan parquet, batched" value="no *(N) marker" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="ColumnarToRow node" value="carries *(1) instead" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictForceFallback({ t }: StepCtx) {
  return (
    <Svg label="shrink the field limit to zero, forcing every stage over the cap. Does the plan show fewer stage markers, or none at all?" h={200}>
      <Row y={70} label="codegen field limit" value="dropped to zero" />
      <Row y={130} label="stage markers left" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealFallback({ t }: StepCtx) {
  return (
    <Svg label="measured: with the limit at zero, every marker disappears. debug.codegen() itself reports zero subtrees, not a smaller number." h={200}>
      <Row y={70} label="field limit normal" value="1 fused subtree" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="field limit at zero" value="0 subtrees, 0 markers" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="fusion into one generated method, UnsafeRow instead of objects, a columnar exception, and a silent fallback you can see directly." h={260}>
      <Row y={50} label="fused operators" value="one *(N) marker, shared" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="row storage" value="UnsafeRow, raw bytes" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="columnar reader" value="batched, bridges in" o={easeOut(seg(t, 0.25, 0.55))} />
      <Row y={185} label="fallback, forced" value="zero markers, visibly" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}
