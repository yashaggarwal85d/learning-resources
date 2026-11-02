import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="two engineers benchmark the same query and report numbers twice as far apart as a good day versus a bad one." h={200}>
      <T x={25} y={45} s={14} f={C.latte}>
        engineer one
      </T>
      <T x={25} y={70} s={15} f={C.cherryText}>
        measured from the instant it started
      </T>
      <T x={25} y={130} s={14} f={C.latte}>
        engineer two
      </T>
      <T x={25} y={155} s={15} f={C.focus}>
        waited five minutes first
      </T>
    </Svg>
  );
}

export function PredictWhoseNumber({ t }: StepCtx) {
  return (
    <Svg label="whose number is closer to a real, long-running deployment?" h={180}>
      <T x={300} y={70} s={14} f={C.latte} a="middle" o={easeOut(seg(t, 0, 0.3))}>
        whose number is closer to real
      </T>
      <T x={300} y={110} s={16} f={C.focus} a="middle" o={easeOut(seg(t, 0.2, 0.5))}>
        ?
      </T>
    </Svg>
  );
}

export function RevealWarmupCauses({ t }: StepCtx) {
  const causes = [
    'JIT / code-gen warm-up',
    'cold page cache and buffer pool',
    'empty result caches',
    'LSM compaction debt',
    'table-format small files',
  ];
  return (
    <Svg label="five named causes of why the first minutes of a benchmark lie." h={260}>
      {causes.map((c, i) => (
        <g key={c} opacity={easeOut(seg(t, 0.05 + i * 0.13, 0.3 + i * 0.13))}>
          <circle cx={40} cy={40 + i * 40} r={4} fill={i < 2 ? C.focus : C.taupe} />
          <T x={55} y={45 + i * 40} s={14} f={i < 2 ? C.crema : C.taupe}>
            {c}
          </T>
        </g>
      ))}
      <T x={25} y={240} s={13} f={C.latte}>
        this sandbox's Postgres reproduces the first two
      </T>
    </Svg>
  );
}

export function RevealColdCacheReproduced({ t }: StepCtx) {
  return (
    <Svg label="the shop's order-lookup query, measured from a cold Postgres restart." h={220}>
      <T x={25} y={40} s={14} f={C.latte}>
        restart Postgres
      </T>
      <T x={25} y={65} s={15} f={C.crema}>
        shared_buffers and the OS page cache start empty
      </T>
      <T x={25} y={120} s={14} f={C.latte}>
        first requests
      </T>
      <T x={25} y={145} s={16} f={C.cherryText}>
        measurably slower
      </T>
      <T x={25} y={190} s={13} f={C.taupe}>
        every page paid for with a disk round trip
      </T>
    </Svg>
  );
}

export function RevealSteadyStateDetection({ t }: StepCtx) {
  return (
    <Svg label="a sliding window of recent latency, marking where it stops moving." h={240}>
      <T x={25} y={40} s={14} f={C.latte}>
        compare each window's mean
      </T>
      <T x={25} y={65} s={15} f={C.crema}>
        to the window right before it
      </T>
      <T x={25} y={120} s={14} f={C.latte}>
        once the change stays small
      </T>
      <T x={25} y={145} s={15} f={C.focus}>
        steady state is declared
      </T>
      <T x={25} y={200} s={13} f={C.taupe}>
        adapted from a coefficient-of-variation threshold
      </T>
      <T x={25} y={220} s={13} f={C.taupe}>
        at wall-clock-latency scale, not iteration counts
      </T>
    </Svg>
  );
}

export function RevealConfidenceIntervals({ t }: StepCtx) {
  return (
    <Svg label="the same steady-state run, repeated, reported as an interval." h={220}>
      <T x={25} y={40} s={14} f={C.latte}>
        one run
      </T>
      <T x={25} y={65} s={15} f={C.cherryText}>
        a single number, no way to judge it
      </T>
      <T x={25} y={125} s={14} f={C.latte}>
        several independent runs
      </T>
      <T x={25} y={150} s={15} f={C.focus}>
        a mean, plus a confidence interval
      </T>
      <T x={25} y={195} s={13} f={C.taupe}>
        now a reader can tell signal from noise
      </T>
    </Svg>
  );
}

export function RevealColdHotTwoNumbers({ t }: StepCtx) {
  return (
    <Svg label="cold-cache and hot-cache, reported side by side, never blended." h={220}>
      <T x={25} y={40} s={14} f={C.latte}>
        cold-cache number
      </T>
      <T x={25} y={65} s={15} f={C.crema}>
        what a service that restarts often sees
      </T>
      <T x={25} y={125} s={14} f={C.latte}>
        hot-cache number
      </T>
      <T x={25} y={150} s={15} f={C.crema}>
        what a service that runs for days sees
      </T>
      <T x={25} y={200} s={13} f={C.cherryText}>
        averaging the two answers neither question
      </T>
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="the first minutes lie. Discard them, detect steady state, repeat, and report both numbers honestly." h={300}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <T x={25} y={36} s={14} f={C.latte}>why the first minutes lie</T>
        <T x={25} y={62} s={15} f={C.crema}>empty caches, an empty buffer pool</T>
      </g>
      <g opacity={easeOut(seg(t, 0.15, 0.45))}>
        <T x={25} y={96} s={14} f={C.latte}>steady state</T>
        <T x={25} y={122} s={15} f={C.crema}>detected, not assumed</T>
      </g>
      <g opacity={easeOut(seg(t, 0.3, 0.6))}>
        <T x={25} y={156} s={14} f={C.latte}>repeated trials</T>
        <T x={25} y={182} s={15} f={C.crema}>a confidence interval, not one number</T>
      </g>
      <g opacity={easeOut(seg(t, 0.45, 0.75))}>
        <T x={25} y={216} s={14} f={C.latte}>cold vs. hot</T>
        <T x={25} y={242} s={15} f={C.crema}>two honest results, never one blend</T>
      </g>
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a vendor reports one number, no mention of warm-up or trial count." h={200}>
      <T x={25} y={50} s={13} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        the vendor's claim
      </T>
      <T x={25} y={75} s={15} f={C.focus} o={easeOut(seg(t, 0, 0.3))}>
        one number, no warm-up, no trial count
      </T>
      <T x={25} y={130} s={13} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        what would you ask first
      </T>
      <T x={25} y={155} s={15} f={C.cherryText} o={easeOut(seg(t, 0.2, 0.5))}>
        ?
      </T>
    </Svg>
  );
}
