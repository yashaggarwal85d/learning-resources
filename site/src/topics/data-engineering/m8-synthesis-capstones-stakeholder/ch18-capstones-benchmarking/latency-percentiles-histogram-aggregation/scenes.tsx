import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="a load test reports a mean of forty milliseconds, and a shopper waits four seconds, in the same run." h={200}>
      <T x={25} y={45} s={14} f={C.latte}>
        reported mean
      </T>
      <T x={25} y={70} s={16} f={C.crema}>
        forty milliseconds
      </T>
      <T x={25} y={130} s={14} f={C.latte}>
        one real shopper
      </T>
      <T x={25} y={155} s={16} f={C.cherryText}>
        waited four seconds
      </T>
    </Svg>
  );
}

export function PredictWhichNumbers({ t }: StepCtx) {
  return (
    <Svg label="which numbers would have shown the gap, and which load generator would have caught it?" h={180}>
      <T x={300} y={70} s={14} f={C.latte} a="middle" o={easeOut(seg(t, 0, 0.3))}>
        which numbers show the gap
      </T>
      <T x={300} y={110} s={16} f={C.focus} a="middle" o={easeOut(seg(t, 0.2, 0.5))}>
        ?
      </T>
    </Svg>
  );
}

export function RevealMeansHideTails({ t }: StepCtx) {
  return (
    <Svg label="a rare, large stall barely moves the mean while the tail percentiles move sharply." h={220}>
      <T x={25} y={40} s={14} f={C.latte}>
        the mean
      </T>
      <T x={25} y={65} s={16} f={C.crema}>
        barely moves
      </T>
      <T x={25} y={120} s={14} f={C.latte}>
        the tail percentiles
      </T>
      <T x={25} y={145} s={16} f={C.cherryText}>
        move sharply
      </T>
      <T x={25} y={195} s={13} f={C.taupe}>
        one rare request can dominate a tail unnoticed by a mean
      </T>
    </Svg>
  );
}

export function RevealPercentileLadder({ t }: StepCtx) {
  const rows = [
    'p fifty — typical',
    'p ninety five — unlucky',
    'p ninety nine — very unlucky',
    'p ninety nine point nine — rare',
    'max — the worst observed',
  ];
  return (
    <Svg label="five points on the same distribution, each answering a different real question." h={260}>
      {rows.map((r, i) => (
        <g key={r} opacity={easeOut(seg(t, 0.05 + i * 0.13, 0.3 + i * 0.13))}>
          <circle cx={40} cy={40 + i * 40} r={4} fill={C.focus} />
          <T x={55} y={45 + i * 40} s={14} f={C.crema}>
            {r}
          </T>
        </g>
      ))}
    </Svg>
  );
}

export function RevealHistogramMerge({ t }: StepCtx) {
  return (
    <Svg label="two hosts' percentiles, naively averaged, versus the true percentile of their merged histogram." h={240}>
      <T x={25} y={40} s={14} f={C.latte}>
        host A's p99, host B's p99
      </T>
      <T x={25} y={65} s={15} f={C.crema}>
        averaged together
      </T>
      <T x={25} y={100} s={16} f={C.cherryText}>
        disagrees with the truth
      </T>
      <T x={25} y={150} s={14} f={C.latte}>
        merge the histograms instead
      </T>
      <T x={25} y={175} s={15} f={C.focus}>
        read the fleet's real p99 off the merge
      </T>
      <T x={25} y={220} s={13} f={C.taupe}>
        histograms are additive; percentiles are not
      </T>
    </Svg>
  );
}

export function RevealFanoutAmplification({ t }: StepCtx) {
  return (
    <Svg label="a hundred-shard fan-out hits at least one shard's own tail far more often than any one shard's own rate suggests." h={240}>
      <T x={25} y={40} s={14} f={C.latte}>
        one shard alone
      </T>
      <T x={25} y={65} s={15} f={C.crema}>
        its own tail is rare
      </T>
      <T x={25} y={120} s={14} f={C.latte}>
        a hundred shards, in parallel
      </T>
      <T x={25} y={145} s={16} f={C.cherryText}>
        the odds flip
      </T>
      <T x={25} y={195} s={13} f={C.taupe}>
        the slowest shard sets the whole request's latency
      </T>
    </Svg>
  );
}

export function RevealClosedLoopVsConstantRate({ t }: StepCtx) {
  return (
    <Svg label="two generators, the same offered load, the same injected stall." h={260}>
      <T x={25} y={40} s={14} f={C.latte}>
        closed-loop generator
      </T>
      <T x={25} y={65} s={15} f={C.crema}>
        sends the next request only once this one answers
      </T>
      <T x={25} y={120} s={14} f={C.latte}>
        constant-rate generator
      </T>
      <T x={25} y={145} s={15} f={C.crema}>
        keeps a fixed schedule, stall or no stall
      </T>
      <T x={25} y={200} s={14} f={C.cherryText}>
        closed-loop's p99 stays low
      </T>
      <T x={25} y={225} s={14} f={C.focus}>
        constant-rate's p99 shows the backlog
      </T>
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="report the ladder, merge histograms, respect fan-out, and generate load that doesn't hide its own worst case." h={300}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <T x={25} y={36} s={14} f={C.latte}>why means lie</T>
        <T x={25} y={62} s={15} f={C.crema}>one rare sample, hidden in an average</T>
      </g>
      <g opacity={easeOut(seg(t, 0.15, 0.45))}>
        <T x={25} y={96} s={14} f={C.latte}>the ladder</T>
        <T x={25} y={122} s={15} f={C.crema}>five numbers, five real questions</T>
      </g>
      <g opacity={easeOut(seg(t, 0.3, 0.6))}>
        <T x={25} y={156} s={14} f={C.latte}>merge, don't average</T>
        <T x={25} y={182} s={15} f={C.crema}>histograms are additive</T>
      </g>
      <g opacity={easeOut(seg(t, 0.45, 0.75))}>
        <T x={25} y={216} s={14} f={C.latte}>the right generator</T>
        <T x={25} y={242} s={15} f={C.crema}>constant-rate reports what closed-loop hides</T>
      </g>
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="ten hosts, each independently reporting its own p99 of five milliseconds." h={200}>
      <T x={25} y={50} s={13} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        ten hosts, same reported p99
      </T>
      <T x={25} y={75} s={15} f={C.focus} o={easeOut(seg(t, 0, 0.3))}>
        each says five milliseconds
      </T>
      <T x={25} y={130} s={13} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        is the fleet's p99 the same
      </T>
      <T x={25} y={155} s={15} f={C.cherryText} o={easeOut(seg(t, 0.2, 0.5))}>
        ?
      </T>
    </Svg>
  );
}
