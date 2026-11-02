import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="a dashboard, fast all quarter, suddenly queues every Monday morning. The query itself never changed." h={200}>
      <T x={25} y={45} s={14} f={C.latte}>
        all quarter
      </T>
      <T x={25} y={70} s={15} f={C.crema}>
        same query, fast every time
      </T>
      <T x={25} y={125} s={14} f={C.latte}>
        every Monday morning
      </T>
      <T x={25} y={150} s={16} f={C.cherryText}>
        queued thirty seconds
      </T>
    </Svg>
  );
}

export function PredictConcurrencyVsSpeed({ t }: StepCtx) {
  return (
    <Svg label="what two numbers, outside the query, explain this, and which lever actually fixes it?" h={180}>
      <T x={300} y={70} s={14} f={C.latte} a="middle" o={easeOut(seg(t, 0, 0.3))}>
        two numbers, outside the query
      </T>
      <T x={300} y={110} s={16} f={C.focus} a="middle" o={easeOut(seg(t, 0.2, 0.5))}>
        ?
      </T>
    </Svg>
  );
}

export function RevealRollupsAndMaterializedViews({ t }: StepCtx) {
  return (
    <Svg label="compute the expensive aggregation once, on a schedule; every dashboard queries the small result instead." h={200}>
      <T x={25} y={45} s={14} f={C.latte}>
        computed once, on a schedule
      </T>
      <T x={25} y={70} s={15} f={C.crema}>
        a rollup table or a materialized view
      </T>
      <T x={25} y={125} s={14} f={C.latte}>
        every dashboard queries
      </T>
      <T x={25} y={150} s={15} f={C.focus}>
        the small result, not the large source
      </T>
    </Svg>
  );
}

export function RevealResultCaching({ t }: StepCtx) {
  return (
    <Svg label="a cached result is only as fresh as its invalidation policy accounts for." h={200}>
      <T x={25} y={45} s={14} f={C.latte}>
        caches a query's exact result
      </T>
      <T x={25} y={70} s={15} f={C.crema}>
        for reuse by a repeated query
      </T>
      <T x={25} y={125} s={14} f={C.latte}>
        invalidation tied to
      </T>
      <T x={25} y={150} s={15} f={C.cherryText}>
        the freshness SLA, not a fixed timer
      </T>
    </Svg>
  );
}

export function RevealBigQueryBIEngine({ t }: StepCtx) {
  return (
    <Svg label="a fast, in-memory analysis service that caches a reservation's preferred tables." h={264}>
      <T x={25} y={40} s={14} f={C.latte}>
        preferred tables, in memory
      </T>
      <T x={25} y={65} s={15} f={C.crema}>
        a large fact table + up to four
      </T>
      <T x={25} y={88} s={15} f={C.crema}>
        small dimension tables
      </T>
      <T x={25} y={139} s={14} f={C.latte}>
        what it can't accelerate
      </T>
      <T x={25} y={164} s={13} f={C.taupe}>
        JSON columns, wildcard tables, external tables
      </T>
      <T x={25} y={214} s={14} f={C.focus}>
        falls back to standard slots, query still runs
      </T>
    </Svg>
  );
}

export function RevealDatabricksSQL({ t }: StepCtx) {
  return (
    <Svg label="an automatic disk cache of remote reads, invalidated by Databricks itself on any file change." h={200}>
      <T x={25} y={45} s={14} f={C.latte}>
        first read: fetched, copied locally
      </T>
      <T x={25} y={70} s={15} f={C.crema}>
        later reads: run locally, significantly faster
      </T>
      <T x={25} y={125} s={14} f={C.latte}>
        no manual invalidation needed
      </T>
      <T x={25} y={150} s={15} f={C.focus}>
        stale entries evicted automatically
      </T>
    </Svg>
  );
}

export function RevealConcurrencyCeilings({ t }: StepCtx) {
  return (
    <Svg label="a reservation or capacity ceiling: past it, queries queue or fail, whatever the query's own speed." h={220}>
      <T x={300} y={40} s={14} f={C.latte} a="middle">
        a fixed number of lanes
      </T>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={60 + i * 80} y={70} width={60} height={24} fill={i < 4 ? C.crema : C.cherryText} opacity={easeOut(seg(t, 0.1 + i * 0.1, 0.3 + i * 0.1))} />
      ))}
      <T x={300} y={130} s={13} f={C.taupe} a="middle">
        four lanes full
      </T>
      <T x={300} y={160} s={15} f={C.cherryText} a="middle">
        the rest queue behind them
      </T>
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="three levers for the same data-change-vs-query-repeat trade-off; two named engines; a ceiling that queues regardless of query speed." h={300}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <T x={25} y={36} s={14} f={C.latte}>rollups, materialized views, caching</T>
        <T x={25} y={62} s={15} f={C.crema}>chosen by data-change vs. query-repeat rate</T>
      </g>
      <g opacity={easeOut(seg(t, 0.15, 0.45))}>
        <T x={25} y={96} s={14} f={C.latte}>BI Engine, Databricks SQL</T>
        <T x={25} y={122} s={15} f={C.crema}>named engines, each with documented limits</T>
      </g>
      <g opacity={easeOut(seg(t, 0.3, 0.6))}>
        <T x={25} y={156} s={14} f={C.latte}>a concurrency ceiling</T>
        <T x={25} y={182} s={15} f={C.crema}>queues regardless of query speed</T>
      </g>
      <g opacity={easeOut(seg(t, 0.45, 0.75))}>
        <T x={25} y={216} s={14} f={C.latte}>the fix</T>
        <T x={25} y={242} s={15} f={C.crema}>a bigger reservation, or spread the load</T>
      </g>
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="refresh frequency doubles; queries queue, even though each individual query runs just as fast as before." h={200}>
      <T x={25} y={50} s={13} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        each query
      </T>
      <T x={25} y={75} s={15} f={C.focus} o={easeOut(seg(t, 0, 0.3))}>
        just as fast as before
      </T>
      <T x={25} y={130} s={13} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        what actually changed
      </T>
      <T x={25} y={155} s={15} f={C.cherryText} o={easeOut(seg(t, 0.2, 0.5))}>
        ?
      </T>
    </Svg>
  );
}
