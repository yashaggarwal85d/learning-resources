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
    <Svg label="a stateful query computes the right answer once. This is what survives a crash." h={200}>
      <Row y={70} label="computed once" value="correct once" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="this topic" value="survives a crash" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealRestartClean({ t }: StepCtx) {
  return (
    <Svg label="kill the batch mid-run, restart from checkpoint. Measured: no row lost or doubled." h={260}>
      <Row y={60} label="batch" value="killed mid-run" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={120} label="restart" value="from checkpoint" o={easeOut(seg(t, 0.25, 0.7))} />
      <Row y={180} label="rows" value="not lost, intact" valueColor={C.focus} o={easeOut(seg(t, 0.5, 1))} />
    </Svg>
  );
}

export function PredictAtLeastOnceSink({ t }: StepCtx) {
  return (
    <Svg label="an at-least-once sink, restarted the same way. Still exactly-once end to end?" h={200}>
      <Row y={70} label="sink" value="at-least-once" />
      <Row y={130} label="still exact?" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealDuplicateSurvives({ t }: StepCtx) {
  return (
    <Svg label="measured: no. One batch's row shows up twice in the sink's own output." h={200}>
      <Row y={70} label="sink output" value="one row, twice" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="checkpoint" value="did its job" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ElaborateSparkBoundary({ t }: StepCtx) {
  return (
    <Svg label="Spark's guarantee stops at its own boundary. The sink's replay is the sink's job." h={200}>
      <Row y={70} label="offsets, state, log" value="Spark's own job" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the replay itself" value="the sink's job" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictDedupByBatchId({ t }: StepCtx) {
  return (
    <Svg label="the same sink, now deduplicating by batchId. Exactly-once this time?" h={200}>
      <Row y={70} label="sink" value="dedupes by batchId" />
      <Row y={130} label="exact this time?" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealZeroDuplicates({ t }: StepCtx) {
  return (
    <Svg label="measured: yes. Same crash, same restart -- zero duplicates this time." h={200}>
      <Row y={70} label="same crash" value="same restart" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="duplicates" value="zero, this time" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ElaborateBatchIdDeterministic({ t }: StepCtx) {
  return (
    <Svg label="the same batch gets the same id on every replay -- exactly what dedup needs." h={200}>
      <Row y={70} label="same batch" value="same batchId" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="replayed or not" value="id never changes" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealIncompatibleChange({ t }: StepCtx) {
  return (
    <Svg label="swap the grouping keys, restart from the same checkpoint -- it fails before a row moves." h={260}>
      <Row y={60} label="grouping keys" value="changed" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={120} label="restart" value="fails immediately" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.7))} />
      <Row y={180} label="not one row" value="moved first" valueColor={C.focus} o={easeOut(seg(t, 0.5, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="Spark's guarantee has a boundary. What's past it is the source's and sink's job." h={280}>
      <Row y={50} label="offsets, state, log" value="Spark's own guarantee" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="past that boundary" value="source and sink" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={150} label="same checkpoint" value="not every change" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}
