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
    <Svg label="every mechanism this section needed now exists. this topic closes it: which format do you actually pick?" h={200}>
      <TallRow y={40} label="every mechanism §6.3 needed" value="now exists, real or sourced" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="this topic closes the section" value="which format do you actually pick?" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function PredictMoreWriters({ t }: StepCtx) {
  return (
    <Svg label="more engines can write one of these two formats today than the other. which one?" h={200}>
      <TallRow y={40} label="two formats, seven engines" value="read is common, write is not" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="more engines write one of them" value="which one?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealMatrix({ t }: StepCtx) {
  return (
    <Svg label="a real matrix, built from each engine's own current docs. most write iceberg; several only read delta." h={230}>
      <TallRow y={40} label="a real matrix" value="built from each engine's own docs" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="most engines write iceberg" value="several only read delta" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealCloudWritesReal({ t }: StepCtx) {
  return (
    <Svg label="snowflake and bigquery both genuinely write iceberg today, for real. not a read-only external table." h={230}>
      <TallRow y={40} label="two cloud warehouses" value="snowflake, bigquery" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="both genuinely write iceberg" value="not a read-only external table" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function PredictWorkloadSurvives({ t }: StepCtx) {
  return (
    <Svg label="this chapter's own table needs snowflake, bigquery, and duckdb to all write it, upsert-heavy. does delta survive?" h={230}>
      <TallRow y={40} label="this chapter's own table" value="three writers, upsert-heavy" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="does delta survive that requirement" value="in the real matrix?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealDeltaBlocked({ t }: StepCtx) {
  return (
    <Svg label="no. all three writer engines block delta here, for real -- the framework rules it out mechanically." h={230}>
      <TallRow y={40} label="no -- all three block it" value="snowflake, bigquery, duckdb" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="ruled out mechanically" value="not by preference" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealDuckdbNuance({ t }: StepCtx) {
  return (
    <Svg label="duckdb's two write paths run opposite directions: iceberg needs a catalog, delta needs none but stays append-only." h={230}>
      <TallRow y={40} label="duckdb writing iceberg" value="needs a catalog, then no limit" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="duckdb writing delta" value="no catalog needed, append-only" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealJuneTimeline({ t }: StepCtx) {
  return (
    <Svg label="three real announcements, the same month: tabular, unity catalog, polaris -- all june." h={260}>
      <TallRow y={35} label="databricks acquires tabular" value="the iceberg format's own creators" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="databricks open-sources unity catalog" value="the same month" o={easeOut(seg(t, 0.1, 0.4))} />
      <TallRow y={165} label="snowflake unveils polaris catalog" value="the same month again" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
    </Svg>
  );
}

export function RevealConvergence({ t }: StepCtx) {
  return (
    <Svg label="the market's convergence on iceberg rest isn't a trend line -- it's three named decisions, one month, plus this matrix." h={230}>
      <TallRow y={40} label="not a trend line" value="three named vendor decisions" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="one month, plus this matrix" value="the real evidence behind the convergence" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a real matrix, a real framework, applied to this chapter's own table: iceberg, over a rest catalog. next: trino." h={300}>
      <TallRow y={35} label="a real matrix, a real framework" value="applied to this chapter's own table" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="the decision" value="iceberg, over a rest catalog" o={easeOut(seg(t, 0.1, 0.4))} />
      <TallRow y={165} label="from evidence, not preference" value="the real matrix, run for real" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <g opacity={easeOut(seg(t, 0.55, 1))}>
        <T x={25} y={230} s={14} f={C.latte}>
          the handoff
        </T>
        <T x={25} y={256} s={16} f={C.focus} w={600}>
          every topic from here asks who reads --
        </T>
        <T x={25} y={280} s={16} f={C.focus} w={600}>
          trino opens the general-purpose engines
        </T>
      </g>
    </Svg>
  );
}
