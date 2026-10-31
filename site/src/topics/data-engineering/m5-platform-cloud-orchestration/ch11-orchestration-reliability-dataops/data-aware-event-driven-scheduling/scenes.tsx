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
    <Svg label="one asset updates. eleven downstream dags fire at once." h={200}>
      <Row y={70} label="asset updates" value="once" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="downstream dags" value="eleven, same second" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealFanoutMeasured({ t }: StepCtx) {
  return (
    <Svg label="one update, six dags scheduled on it. measured for real." h={200}>
      <Row y={70} label="consumer dags" value="six, same asset" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="runs created" value="microseconds apart" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictStaggering({ t }: StepCtx) {
  return (
    <Svg label="does airflow space the six runs out, or fire them together?" h={200}>
      <Row y={70} label="six consumer dags" value="same trigger" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="created" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealAssetModel({ t }: StepCtx) {
  return (
    <Svg label="renamed from dataset to asset. watchers pull from queues." h={200}>
      <Row y={70} label="dataset, through 2.x" value="renamed asset in 3.0" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="assetwatcher" value="pulls from a queue" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictGranularityMismatch({ t }: StepCtx) {
  return (
    <Svg label="upstream hourly, downstream daily. what happens to the key?" h={200}>
      <Row y={70} label="upstream" value="hourly partitions" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="downstream key" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealPartitionMapper({ t }: StepCtx) {
  return (
    <Svg label="a real partition mapper, run live on four real timestamps." h={200}>
      <Row y={70} label="three same-hour keys" value="collapse to one" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the fourth key" value="maps to a different one" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealDagsterComparison({ t }: StepCtx) {
  return (
    <Svg label="dagster's version: state the condition, not the trigger." h={200}>
      <Row y={70} label="automation condition" value="stated declaratively" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="freshness policy" value="fails loudly when stale" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="data-driven reacts fast. time-based is predictable. both have a cost." h={260}>
      <Row y={40} label="data-driven" value="fast, needs reliable events" o={easeOut(seg(t, 0, 0.25))} />
      <Row y={85} label="time-based" value="predictable, can run stale" o={easeOut(seg(t, 0.12, 0.37))} />
      <Row y={130} label="sharp edges" value="herds and missed events" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.6))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="back to the eleven dags. does a fairness fix change the herd?" h={200}>
      <Row y={70} label="eleven dags" value="same asset, again" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="fired together" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
