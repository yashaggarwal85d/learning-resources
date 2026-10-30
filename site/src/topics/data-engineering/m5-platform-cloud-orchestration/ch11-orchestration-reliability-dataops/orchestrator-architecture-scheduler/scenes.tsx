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
    <Svg label="dag files go from a few hundred to thousands. latency does not just double." h={200}>
      <Row y={70} label="dag files" value="up sharply" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="latency" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealThreeRequiredParts({ t }: StepCtx) {
  return (
    <Svg label="scheduler, dag processor, api server, metadata database." h={260}>
      <Row y={40} label="scheduler" value="decides, submits" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={85} label="dag processor" value="always separate" o={easeOut(seg(t, 0.12, 0.42))} />
      <Row y={130} label="api server" value="ui, rest api" o={easeOut(seg(t, 0.24, 0.54))} />
      <Row y={175} label="metadata database" value="every state" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}

export function RevealExecutorsThreeShapes({ t }: StepCtx) {
  return (
    <Svg label="one process, a worker pool through a broker, or one pod per task." h={260}>
      <Row y={50} label="local" value="one process" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="celery" value="broker, worker pool" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="kubernetes" value="one pod each" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function PredictTwoSchedulers({ t }: StepCtx) {
  return (
    <Svg label="two schedulers, one shared database. does a task ever get claimed twice?" h={200}>
      <Row y={70} label="two schedulers" value="one database" />
      <Row y={130} label="one task row" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealSkipLockedMeasured({ t }: StepCtx) {
  return (
    <Svg label="two real threads, ten real rows, measured against this sandbox's own postgres." h={260}>
      <Row y={50} label="two schedulers" value="one queue table" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="ten rows" value="split between them" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="claimed twice" value="measured: none" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.7))} />
    </Svg>
  );
}

export function RevealDagParsingCostMeasured({ t }: StepCtx) {
  return (
    <Svg label="a real parse pass, measured at three scales." h={260}>
      <Row y={40} label="hundred files" value="under one second" o={easeOut(seg(t, 0, 0.25))} />
      <Row y={85} label="thousand files" value="about two seconds" o={easeOut(seg(t, 0.12, 0.37))} />
      <Row y={130} label="five thousand" value="about ten seconds" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.6))} />
      <Row y={175} label="cost per file" value="holds steady" o={easeOut(seg(t, 0.5, 0.8))} />
    </Svg>
  );
}

export function RevealMetadataDbCeiling({ t }: StepCtx) {
  return (
    <Svg label="every state change writes to the metadata database. that is usually where it strains." h={200}>
      <Row y={70} label="scheduler cpu" value="often idle" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="metadata database" value="strains first" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="four parts. three executor shapes. one lock trick. one measured cost curve." h={260}>
      <Row y={40} label="four parts" value="scheduler to database" o={easeOut(seg(t, 0, 0.25))} />
      <Row y={85} label="three executors" value="local, celery, k8s" o={easeOut(seg(t, 0.12, 0.37))} />
      <Row y={130} label="coordination" value="skip locked" o={easeOut(seg(t, 0.3, 0.55))} />
      <Row y={175} label="parsing cost" value="measured, not assumed" valueColor={C.focus} o={easeOut(seg(t, 0.45, 0.75))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="the file count jumps overnight. nothing in any one dag changed. what first?" h={200}>
      <Row y={70} label="dag files" value="jumped overnight" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="profile first" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
