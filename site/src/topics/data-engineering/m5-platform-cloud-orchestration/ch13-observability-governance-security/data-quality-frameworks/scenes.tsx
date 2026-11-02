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
    <Svg label="a dozen checks added, runtime doubles. Two weeks later, a bad partition still ships." h={200}>
      <Row y={70} label="a dozen checks added" value="runtime doubles" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="bad partition" value="still reached the dashboard" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealGateVsPosthoc({ t }: StepCtx) {
  return (
    <Svg label="a gate runs in the pipeline and can block; a post-hoc scan runs after and can't" h={200}>
      <Row y={70} label="gate" value="in the pipeline, can block" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="post-hoc scan" value="after landing, reports only" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictGateChecks({ t }: StepCtx) {
  return (
    <Svg label="not-null, freshness, distribution drift -- which goes in the gate?" h={240}>
      <Row y={60} label="not-null" value="gate or post-hoc?" />
      <Row y={115} label="freshness" value="gate or post-hoc?" />
      <Row y={170} label="distribution drift" value="gate or post-hoc?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealGateAnswer({ t }: StepCtx) {
  return (
    <Svg label="not-null: gate, cheap. freshness: needs a clock outside the run. drift: needs history" h={240}>
      <Row y={60} label="not-null" value="gate -- cheap" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={115} label="freshness" value="post-hoc" o={easeOut(seg(t, 0.15, 0.6))} />
      <Row y={170} label="distribution drift" value="post-hoc" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealDataVsUnitTest({ t }: StepCtx) {
  return (
    <Svg label="a data test checks built data; a unit test checks the transformation's own logic" h={200}>
      <Row y={70} label="data test" value="select, real built data" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="unit test" value="mocked inputs, before build" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ElaborateFrameworkLandscape({ t }: StepCtx) {
  return (
    <Svg label="GX Core, Soda 4, Deequ, DQX: expectations, contracts, metrics, PySpark checks" h={280}>
      <Row y={50} label="GX Core" value="open-source expectation suites" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="Soda 4" value="contracts-first, YAML checks" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={150} label="Deequ" value="metrics from a VerificationSuite" o={easeOut(seg(t, 0.3, 0.6))} />
      <Row y={200} label="Databricks DQX" value="PySpark, batch and streaming" valueColor={C.focus} o={easeOut(seg(t, 0.45, 0.75))} />
    </Svg>
  );
}

export function ElaborateGxStewardship({ t }: StepCtx) {
  return (
    <Svg label="in May 2026 FICO acquired GX Cloud -- Fivetran became steward of GX Core" h={200}>
      <Row y={70} label="GX Cloud" value="acquired by FICO" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="GX Core" value="stewarded by Fivetran, open source" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictCostLever({ t }: StepCtx) {
  return (
    <Svg label="full rescan, incremental metric, a small sample -- rank by cost, and by what each can miss" h={200}>
      <Row y={70} label="full rescan vs. incremental" value="same cost?" />
      <Row y={130} label="a small sample" value="catches everything?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealIncrementalEqualsFull({ t }: StepCtx) {
  return (
    <Svg label="measured: a metric merged partition by partition equals the full rescan, exactly" h={200}>
      <Row y={70} label="full rescan" value="scans every partition again" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="incremental metric" value="equals it, measured" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealSampleMisses({ t }: StepCtx) {
  return (
    <Svg label="measured: a small sample missed the one bad row a full scan always catches" h={200}>
      <Row y={70} label="full scan" value="always finds the bad row" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a small sample" value="missed it, measured" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="where decides if it can block; how it's computed decides what it costs and misses" h={280}>
      <Row y={50} label="gate" value="can block, before publish" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="post-hoc scan" value="reports only, after landing" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={150} label="incremental, sample" value="lower cost" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}
