import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

function TallRow({ y, label, value, valueColor = C.crema, o = 1 }: { y: number; label: string; value: string; valueColor?: string; o?: number }) {
  return (
    <g opacity={o}>
      <T x={25} y={y} s={14} f={C.latte}>
        {label}
      </T>
      <T x={25} y={y + 26} s={16} f={valueColor} w={600}>
        {value}
      </T>
    </g>
  );
}

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="iceberg, over a rest catalog -- decided. now: who actually runs the query?" h={200}>
      <TallRow y={40} label="§6.3 closed with a decision" value="iceberg, over a rest catalog" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="§6.4 opens with the engine" value="who actually runs the query?" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function PredictTaskFailure({ t }: StepCtx) {
  return (
    <Svg label="one worker fails mid-query, by default. does the whole query fail, or just that task?" h={200}>
      <TallRow y={40} label="one worker fails mid-query" value="trino's default behavior" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="whole query, or just that task?" value="which one fails?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealCoordinatorWorker({ t }: StepCtx) {
  return (
    <Svg label="the whole query fails, by default. coordinator plans and schedules; workers execute and exchange." h={230}>
      <TallRow y={40} label="the whole query, by default" value="must be run again manually" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="coordinator plans, schedules" value="workers execute, exchange data" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealDynamicFiltering({ t }: StepCtx) {
  return (
    <Svg label="the join's build side makes a real filter, pruning the probe scan before it reads those rows." h={230}>
      <TallRow y={40} label="the join's build side" value="produces real candidate keys" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="pushed to prune the probe scan" value="before those rows are even read" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function PredictBuildSide({ t }: StepCtx) {
  return (
    <Svg label="real row-count statistics exist for both tables. which one does trino build the join on?" h={200}>
      <TallRow y={40} label="real statistics for both tables" value="cost-based join enumeration" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="the bigger table, or the smaller one?" value="which gets built?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealCostBasedBuildSide({ t }: StepCtx) {
  return (
    <Svg label="the smaller table, by real row-count statistics. without stats, trino only eliminates cross joins." h={230}>
      <TallRow y={40} label="the smaller table" value="by its real row-count statistic" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="no stats, no real cost model" value="only cross joins get eliminated" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealTaskRetry({ t }: StepCtx) {
  return (
    <Svg label="task retry: a failed task retries alone, reusing other tasks' already-spooled output." h={230}>
      <TallRow y={40} label="task retry policy, opt-in" value="needs an external exchange manager" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="a failed task retries alone" value="other tasks' output is reused, not redone" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealPrestoHistory({ t }: StepCtx) {
  return (
    <Svg label="trino wasn't always trino: a 2019 governance split, a 2020 rename after a trademark filing." h={230}>
      <TallRow y={40} label="trino's founders left facebook, 2019" value="over governance, not technology" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="facebook trademarked presto" value="forcing the rename to trino, 2020" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealPrestissimo({ t }: StepCtx) {
  return (
    <Svg label="presto's own alternative: prestissimo, a drop-in c++ worker on meta's velox -- same java coordinator." h={230}>
      <TallRow y={40} label="prestissimo: a c++ worker" value="built on meta's velox engine" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="drop-in for the java worker" value="the coordinator stays java" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a real coordinator, a real filter, a real cost choice, a real retry -- on this chapter's table. next: clickhouse." h={300}>
      <TallRow y={35} label="a real coordinator, a real filter" value="applied to this chapter's own table" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="a real cost choice" value="a real task-retry spool" o={easeOut(seg(t, 0.1, 0.4))} />
      <TallRow y={165} label="trino owns no storage of its own" value="every byte belongs to someone else's format" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <g opacity={easeOut(seg(t, 0.55, 1))}>
        <T x={25} y={230} s={14} f={C.latte}>
          the handoff
        </T>
        <T x={25} y={256} s={16} f={C.focus} w={600}>
          what if storage and execution
        </T>
        <T x={25} y={280} s={16} f={C.focus} w={600}>
          were the same system? clickhouse
        </T>
      </g>
    </Svg>
  );
}
