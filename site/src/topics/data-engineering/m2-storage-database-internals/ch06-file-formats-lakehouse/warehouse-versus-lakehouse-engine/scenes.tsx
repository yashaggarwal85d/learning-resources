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
    <Svg label="three proprietary engines, now taught on their own terms. one question was left for all of them." h={200}>
      <TallRow y={40} label="three warehouses, taught on their own terms" value="each from its own current docs" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="one question left" value="warehouse or lakehouse, and when" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function PredictMeasureOrLookup({ t }: StepCtx) {
  return (
    <Svg label="a real local iceberg table sits in this sandbox. a real query, or a published price -- which gives a usable number today?" h={200}>
      <TallRow y={40} label="a real iceberg table, right here" value="no warehouse account in this sandbox" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="query it for real, or read a price?" value="which gives a usable number today?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealSixEngines({ t }: StepCtx) {
  return (
    <Svg label="three open engines this chapter built; three warehouses this chapter sourced. six engines, one comparison." h={230}>
      <TallRow y={40} label="trino, clickhouse, duckdb" value="three open engines, built this chapter" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="snowflake, bigquery, redshift" value="three warehouses, sourced this chapter" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealIsolationConcurrency({ t }: StepCtx) {
  return (
    <Svg label="open engines scale by adding nodes or replicas; warehouses scale concurrency with multi-cluster and slot pools." h={230}>
      <TallRow y={40} label="open engines" value="scale by adding nodes or replicas" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="warehouses" value="scale concurrency with clusters and slot pools" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealCostTuning({ t }: StepCtx) {
  return (
    <Svg label="open engines optimize the query plan only; warehouses also tune storage layout automatically, no admin needed." h={230}>
      <TallRow y={40} label="open engines" value="tune the query plan only" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="warehouses" value="also tune storage layout, automatically" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function PredictBigQueryVsRedshift({ t }: StepCtx) {
  return (
    <Svg label="duckdb scans a real iceberg table for real. which warehouse's own published rate prices that same scan higher?" h={200}>
      <TallRow y={40} label="duckdb scans the real table" value="a real bytes-scanned number comes back" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="price it at each warehouse's own rate" value="which one prices it higher?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealRealMeasurement({ t }: StepCtx) {
  return (
    <Svg label="one real duckdb scan, two sourced warehouse rates applied to it. snowflake bills compute time, not bytes, so no third figure." h={230}>
      <TallRow y={40} label="one real scan" value="duckdb's own explain analyze, real bytes" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="two sourced rates, applied to it" value="bigquery and redshift price it differently" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealGravityGovernance({ t }: StepCtx) {
  return (
    <Svg label="open engines query data where it sits, no catalog lock-in; warehouses add egress across regions and their own governance." h={230}>
      <TallRow y={40} label="open engines" value="query data where it sits, no lock-in" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="warehouses" value="egress across regions, their own governance" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealSynthesis({ t }: StepCtx) {
  return (
    <Svg label="a warehouse wins when its governance and pooled concurrency are worth paying for; a lakehouse engine wins on compute you already own." h={230}>
      <TallRow y={40} label="a warehouse wins" value="when governance and pooling are worth it" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="a lakehouse engine wins" value="on compute you already pay for" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="six engines, five dimensions, one real measurement and two sourced estimates on top of it. next: turning stored data into more stored data." h={300}>
      <TallRow y={35} label="six engines, five dimensions" value="three open, three sourced, compared" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="one real scan, two sourced rates" value="a measurement, not a guess" o={easeOut(seg(t, 0.1, 0.4))} />
      <TallRow y={165} label="chapter 6, closed" value="every engine taught on its own terms" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <g opacity={easeOut(seg(t, 0.55, 1))}>
        <T x={25} y={230} s={14} f={C.latte}>
          the handoff
        </T>
        <T x={25} y={256} s={16} f={C.focus} w={600}>
          stored data became an answer --
        </T>
        <T x={25} y={280} s={16} f={C.focus} w={600}>
          next, it becomes more stored data
        </T>
      </g>
    </Svg>
  );
}
