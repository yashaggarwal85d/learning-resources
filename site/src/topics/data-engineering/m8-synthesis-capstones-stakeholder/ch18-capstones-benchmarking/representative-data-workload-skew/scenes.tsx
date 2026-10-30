import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="the last benchmark reported a clean, flat latency distribution, while real traffic the same week shows one percent of customers carrying nearly a third of all lookups." h={220}>
      <T x={25} y={40} s={14} f={C.latte}>
        last topic's benchmark
      </T>
      <T x={25} y={65} s={16} f={C.crema}>
        clean and flat
      </T>
      <T x={25} y={120} s={14} f={C.latte}>
        real traffic, same week
      </T>
      <T x={25} y={145} s={16} f={C.cherryText}>
        a few customers dominate
      </T>
      <T x={25} y={195} s={13} f={C.taupe}>
        the benchmark's own data never looked like the real thing
      </T>
    </Svg>
  );
}

export function PredictWhatBroke({ t }: StepCtx) {
  return (
    <Svg label="what did the benchmark's own data get wrong, and what single change would fix it?" h={180}>
      <T x={300} y={70} s={14} f={C.latte} a="middle" o={easeOut(seg(t, 0, 0.3))}>
        what did the data get wrong
      </T>
      <T x={300} y={110} s={16} f={C.focus} a="middle" o={easeOut(seg(t, 0.2, 0.5))}>
        ?
      </T>
    </Svg>
  );
}

export function RevealUniformFlat({ t }: StepCtx) {
  return (
    <Svg label="the same query, the same load shape, a uniform random customer id — no hot-key effect anywhere." h={200}>
      <T x={25} y={45} s={14} f={C.latte}>
        every customer
      </T>
      <T x={25} y={70} s={16} f={C.crema}>
        roughly the same order count
      </T>
      <T x={25} y={130} s={14} f={C.latte}>
        the lookup query
      </T>
      <T x={25} y={155} s={16} f={C.crema}>
        equally fast for everyone
      </T>
    </Svg>
  );
}

export function RevealZipfianKeys({ t }: StepCtx) {
  return (
    <Svg label="a seeded Zipfian generator reproduces a few customers carrying a hugely disproportionate share of orders, and a measurably slower lookup for the busiest one." h={220}>
      <T x={25} y={40} s={14} f={C.latte}>
        one seeded generator
      </T>
      <T x={25} y={65} s={16} f={C.crema}>
        swapped in, nothing else changed
      </T>
      <T x={25} y={120} s={14} f={C.latte}>
        the busiest customer
      </T>
      <T x={25} y={145} s={16} f={C.cherryText}>
        far more orders, a slower lookup
      </T>
      <T x={25} y={195} s={13} f={C.taupe}>
        the hot key was always there — the uniform data just hid it
      </T>
    </Svg>
  );
}

export function RevealCorrelatedColumns({ t }: StepCtx) {
  return (
    <Svg label="a planner that assumes independent columns misestimates a join badly once two columns are correlated, same query shape, same row count." h={240}>
      <T x={25} y={40} s={14} f={C.latte}>
        country decides currency
      </T>
      <T x={25} y={65} s={15} f={C.cherryText}>
        planner's estimate way off
      </T>
      <T x={25} y={120} s={14} f={C.latte}>
        country and currency, unrelated
      </T>
      <T x={25} y={145} s={15} f={C.crema}>
        planner's estimate close
      </T>
      <T x={25} y={200} s={13} f={C.taupe}>
        independence is assumed; correlation breaks it
      </T>
    </Svg>
  );
}

export function RevealScaleFactor({ t }: StepCtx) {
  return (
    <Svg label="the dataset's own size, stated as a number, following the same convention an entire industry's own benchmark standards use." h={180}>
      <T x={25} y={60} s={14} f={C.latte}>
        dataset size
      </T>
      <T x={25} y={90} s={16} f={C.focus}>
        stated as a number, not left implicit
      </T>
      <T x={25} y={140} s={13} f={C.taupe}>
        the same convention industry benchmarks declare out loud
      </T>
    </Svg>
  );
}

export function RevealSeededGenerator({ t }: StepCtx) {
  return (
    <Svg label="the same seed, run twice, produces byte-identical data every time — a committed, reusable artifact of the benchmark." h={200}>
      <T x={25} y={50} s={14} f={C.latte}>
        same seed, two separate runs
      </T>
      <T x={25} y={80} s={16} f={C.crema}>
        byte-identical data, every time
      </T>
      <T x={25} y={140} s={13} f={C.taupe}>
        committed once, not a one-off script
      </T>
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="uniform data hides hot keys and correlation; a seeded Zipfian generator, an explicit scale factor, and a committed artifact make the benchmark honest." h={300}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <T x={25} y={36} s={14} f={C.latte}>uniform data lies</T>
        <T x={25} y={62} s={15} f={C.crema}>it hides hot keys and correlation both</T>
      </g>
      <g opacity={easeOut(seg(t, 0.15, 0.45))}>
        <T x={25} y={96} s={14} f={C.latte}>the fix</T>
        <T x={25} y={122} s={15} f={C.crema}>a seeded Zipfian key distribution</T>
      </g>
      <g opacity={easeOut(seg(t, 0.3, 0.6))}>
        <T x={25} y={156} s={14} f={C.latte}>declare the size</T>
        <T x={25} y={182} s={15} f={C.crema}>an explicit scale factor, never implicit</T>
      </g>
      <g opacity={easeOut(seg(t, 0.45, 0.75))}>
        <T x={25} y={216} s={14} f={C.latte}>commit the generator</T>
        <T x={25} y={242} s={15} f={C.crema}>the same seed, reproduced byte for byte</T>
      </g>
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a clean benchmark result on independent, uniformly random columns — should it be trusted for production?" h={200}>
      <T x={25} y={50} s={13} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        a clean result on uniform, independent data
      </T>
      <T x={25} y={75} s={15} f={C.focus} o={easeOut(seg(t, 0, 0.3))}>
        trusted for production?
      </T>
      <T x={25} y={130} s={13} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        real data is skewed and correlated
      </T>
      <T x={25} y={155} s={15} f={C.cherryText} o={easeOut(seg(t, 0.2, 0.5))}>
        ?
      </T>
    </Svg>
  );
}
