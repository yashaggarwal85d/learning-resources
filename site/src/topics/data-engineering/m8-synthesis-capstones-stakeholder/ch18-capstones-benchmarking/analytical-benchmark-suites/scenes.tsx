import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="a vendor's benchmark report is independently reproducible and true, and a customer who adopts it still finds the engine slower on their own workload." h={220}>
      <T x={25} y={40} s={14} f={C.latte}>
        published report
      </T>
      <T x={25} y={65} s={16} f={C.crema}>
        every number true, independently reproducible
      </T>
      <T x={25} y={120} s={14} f={C.latte}>
        the customer's own workload
      </T>
      <T x={25} y={145} s={16} f={C.cherryText}>
        slower than the report promised
      </T>
      <T x={25} y={195} s={13} f={C.taupe}>
        true numbers. A comparison that still misleads.
      </T>
    </Svg>
  );
}

export function PredictHowCanBothBeTrue({ t }: StepCtx) {
  return (
    <Svg label="how can every published number be true and the comparison still mislead, and what licence term would stop a correction?" h={180}>
      <T x={300} y={70} s={14} f={C.latte} a="middle" o={easeOut(seg(t, 0, 0.3))}>
        true numbers, misleading comparison
      </T>
      <T x={300} y={110} s={16} f={C.focus} a="middle" o={easeOut(seg(t, 0.2, 0.5))}>
        ?
      </T>
    </Svg>
  );
}

export function RevealTpcHTpcDs({ t }: StepCtx) {
  return (
    <Svg label="TPC-H's eight tables and twenty-two queries, beside TPC-DS's larger, skewed snowflake schema and ninety-nine queries." h={240}>
      <T x={25} y={40} s={14} f={C.latte}>
        TPC-H
      </T>
      <T x={25} y={65} s={16} f={C.crema}>
        eight tables, twenty-two queries
      </T>
      <T x={25} y={120} s={14} f={C.latte}>
        TPC-DS
      </T>
      <T x={25} y={145} s={16} f={C.crema}>
        a larger, skewed snowflake schema
      </T>
      <T x={25} y={200} s={13} f={C.taupe}>
        the same skew lesson, built at industry size
      </T>
    </Svg>
  );
}

export function RevealClickBench({ t }: StepCtx) {
  return (
    <Svg label="one wide table, forty-three queries, no joins — fast and comparable, at the cost of testing nothing about join performance." h={220}>
      <T x={25} y={40} s={14} f={C.latte}>
        ClickBench
      </T>
      <T x={25} y={65} s={16} f={C.crema}>
        one wide table, no joins at all
      </T>
      <T x={25} y={120} s={14} f={C.latte}>
        its own stated trade-off
      </T>
      <T x={25} y={145} s={16} f={C.cherryText}>
        tests nothing about joins
      </T>
      <T x={25} y={195} s={13} f={C.taupe}>
        disclosed by ClickBench itself, not an outside criticism
      </T>
    </Svg>
  );
}

export function RevealJoinOrderBenchmark({ t }: StepCtx) {
  return (
    <Svg label="a real, correlated dataset, built specifically because uniformity and independence assumptions fail on real data." h={220}>
      <T x={25} y={40} s={14} f={C.latte}>
        the Join Order Benchmark
      </T>
      <T x={25} y={65} s={16} f={C.crema}>
        a real, correlated movie dataset
      </T>
      <T x={25} y={120} s={14} f={C.latte}>
        built because
      </T>
      <T x={25} y={145} s={16} f={C.cherryText}>
        uniformity and independence fail on real data
      </T>
      <T x={25} y={195} s={13} f={C.taupe}>
        this chapter's own correlated-column lesson, at scale
      </T>
    </Svg>
  );
}

export function RevealTpcDiObsolete({ t }: StepCtx) {
  return (
    <Svg label="the only TPC specification aimed at data integration, now listed by TPC itself as obsolete." h={180}>
      <T x={25} y={50} s={14} f={C.latte}>
        TPC-DI
      </T>
      <T x={25} y={80} s={16} f={C.crema}>
        the only TPC ETL specification
      </T>
      <T x={25} y={130} s={15} f={C.cherryText}>
        now listed by TPC itself as obsolete
      </T>
    </Svg>
  );
}

export function RevealBenchmarketingDewitt({ t }: StepCtx) {
  return (
    <Svg label="benchmarketing picks which true number to publish; a DeWitt clause can forbid a competitor from publishing a correction at all." h={240}>
      <T x={25} y={40} s={14} f={C.latte}>
        benchmarketing
      </T>
      <T x={25} y={65} s={16} f={C.crema}>
        true numbers, chosen to flatter
      </T>
      <T x={25} y={120} s={14} f={C.latte}>
        a DeWitt clause
      </T>
      <T x={25} y={145} s={16} f={C.cherryText}>
        can forbid publishing a correction at all
      </T>
      <T x={25} y={200} s={13} f={C.taupe}>
        a reproducible, independent harness resists both
      </T>
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="five industry suites, each with its own declared shape and its own declared blind spot, and the trap a reproducible harness resists." h={300}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <T x={25} y={36} s={14} f={C.latte}>five suites, five shapes</T>
        <T x={25} y={62} s={15} f={C.crema}>each stresses something, and skips something</T>
      </g>
      <g opacity={easeOut(seg(t, 0.15, 0.45))}>
        <T x={25} y={96} s={14} f={C.latte}>the Join Order Benchmark</T>
        <T x={25} y={122} s={15} f={C.crema}>this chapter's own lesson, at industry scale</T>
      </g>
      <g opacity={easeOut(seg(t, 0.3, 0.6))}>
        <T x={25} y={156} s={14} f={C.latte}>TPC-DI, obsolete</T>
        <T x={25} y={182} s={15} f={C.crema}>the gap a standard suite never filled</T>
      </g>
      <g opacity={easeOut(seg(t, 0.45, 0.75))}>
        <T x={25} y={216} s={14} f={C.latte}>benchmarketing and a DeWitt clause</T>
        <T x={25} y={242} s={15} f={C.crema}>the trap an independent harness resists</T>
      </g>
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="the chapter's harness, generator and this topic's own small baseline, published together as one committed bundle." h={200}>
      <T x={25} y={50} s={13} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        the chapter's own three artifacts
      </T>
      <T x={25} y={75} s={15} f={C.focus} o={easeOut(seg(t, 0, 0.3))}>
        published together, one command
      </T>
      <T x={25} y={130} s={13} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        what does this bundle actually prove
      </T>
      <T x={25} y={155} s={15} f={C.cherryText} o={easeOut(seg(t, 0.2, 0.5))}>
        ?
      </T>
    </Svg>
  );
}
