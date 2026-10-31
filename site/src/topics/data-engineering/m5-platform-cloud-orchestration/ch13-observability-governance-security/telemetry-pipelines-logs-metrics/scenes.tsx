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
    <Svg label="every task green. No alert. Found at nine." h={200}>
      <Row y={70} label="every task" value="succeeded" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the table" value="stale anyway" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Predict({ t }: StepCtx) {
  return (
    <Svg label="one number already existed. Which one?" h={200}>
      <Row y={70} label="tasks, rows," value="or partition age" />
      <Row y={130} label="the answer" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealStructuredFields({ t }: StepCtx) {
  return (
    <Svg label="fields every time, not a sentence." h={200}>
      <Row y={70} label="a sentence" value="free text" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="run, task," value="asset, partition" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealCorrelationCost({ t }: StepCtx) {
  return (
    <Svg label="three hundred lines. One key, ninety-three back." h={260}>
      <Row y={50} label="log lines" value="300" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="four runs" value="tangled together" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="one key" value="93 lines back" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealCounter({ t }: StepCtx) {
  return (
    <Svg label="only up, until a restart." h={200}>
      <Row y={70} label="rows processed" value="only climbs" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a restart" value="the only reset" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealGauge({ t }: StepCtx) {
  return (
    <Svg label="a real depth of seventy. A counter answers zero." h={260}>
      <Row y={50} label="queue depth" value="drains to 70" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="forced through" value="a counter" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="the only answer" value="reset to 0" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealHistogram({ t }: StepCtx) {
  return (
    <Svg label="buckets and a sum. A quantile is an estimate." h={200}>
      <Row y={70} label="task duration" value="bucketed counts" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a quantile" value="an estimate" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealGoldenSignals({ t }: StepCtx) {
  return (
    <Svg label="six hundred twenty minutes old. Still green." h={260}>
      <Row y={50} label="service four" value="latency, errors…" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="freshness" value="620 min old" valueColor={C.focus} o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="every task bar" value="still green" o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealPushPull({ t }: StepCtx) {
  return (
    <Svg label="a four second job. A fifteen second scrape." h={260}>
      <Row y={50} label="the job runs" value="4 seconds" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="the scraper" value="never sees it" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="pushed value" value="never expires" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealCardinality({ t }: StepCtx) {
  return (
    <Svg label="one series. Ten thousand customers later." h={200}>
      <Row y={70} label="no label" value="1 series" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="per-customer" value="10,000 series" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="fields and a key. Six signals. Push or pull." h={260}>
      <Row y={50} label="a record" value="fields, a key" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="six signals" value="one is new" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="push or pull" value="a real choice" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="no instrumentation yet. Which signal first?" h={200}>
      <Row y={70} label="runs faster" value="than any scrape" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="the fix" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
