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
    <Svg label="one box, storage and compute together, sized for peak" h={200}>
      <Row y={70} label="storage, compute" value="one box" />
      <Row y={130} label="data grows" value="box can't afford it" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealFirstGenQuote({ t }: StepCtx) {
  return (
    <Svg label="first generation: compute and storage, coupled, one appliance" h={200}>
      <Row y={70} label="first generation" value="one appliance" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="compute, storage" value="coupled" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictCostOnly({ t }: StepCtx) {
  return (
    <Svg label="storage split out, far cheaper — does that settle it?" h={200}>
      <Row y={70} label="storage, split out" value="far cheaper" />
      <Row y={130} label="cost problem" value="settled?" />
    </Svg>
  );
}

export function RevealSecondGenQuote({ t }: StepCtx) {
  return (
    <Svg label="raw data, open files, schema-on-read — a warehouse still does the important BI" h={200}>
      <Row y={70} label="second generation" value="open files" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="important BI" value="still a warehouse" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealSwampQuote({ t }: StepCtx) {
  return (
    <Svg label="no transactions, no governance by default — most lakes became swamps" h={200}>
      <Row y={70} label="by default" value="no transactions" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="most real lakes" value="data swamps" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealTwoTierQuote({ t }: StepCtx) {
  return (
    <Svg label="cloud object storage takes over — lake plus warehouse, now the dominant shape" h={200}>
      <Row y={70} label="cloud storage" value="replaces HDFS" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="lake plus warehouse" value="now dominant" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictStepCount({ t }: StepCtx) {
  return (
    <Svg label="direct load versus lake-then-warehouse — more steps, or fewer?" h={200}>
      <Row y={70} label="direct load" value="one stop" />
      <Row y={130} label="lake, then warehouse" value="more, or fewer stops?" />
    </Svg>
  );
}

export function RevealStepCount({ t }: StepCtx) {
  return (
    <Svg label="one step, direct load — two steps, lake then warehouse" h={200}>
      <Row y={70} label="direct load" value="one step" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="lake, then warehouse" value="two steps" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictTableFormat({ t }: StepCtx) {
  return (
    <Svg label="transactions, without handing the files back to one owning engine — possible?" h={200}>
      <Row y={70} label="transactions" value="need one owner?" />
      <Row y={130} label="open files" value="still, many engines?" />
    </Svg>
  );
}

export function RevealLakehouseQuote({ t }: StepCtx) {
  return (
    <Svg label="Delta Lake, Apache Iceberg — transactional views over the same open files" h={200}>
      <Row y={70} label="Delta Lake, Iceberg" value="transactional views" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="files underneath" value="stay open" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealThreeStages({ t }: StepCtx) {
  return (
    <Svg label="present, then absent, then present again — never the same mechanism twice" h={260}>
      <Row y={60} label="warehouse" value="transactions: present" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={120} label="lake alone" value="transactions: absent" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={180} label="lakehouse" value="transactions: present again" o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="coupled, cheap-and-ungoverned, transactional-again-and-open — the full arc" h={260}>
      <Row y={60} label="warehouse" value="coupled, costly" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={120} label="lake" value="cheap, no governance" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={180} label="lakehouse" value="open, transactional again" o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="today's data, one dashboard, no multi-engine need — which stage fits?" h={200}>
      <Row y={70} label="one dashboard" value="no sharing need" />
      <Row y={130} label="best stage" value="which one?" />
    </Svg>
  );
}
