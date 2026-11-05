import type { StepCtx } from '../../../../../reels/types';
import { easeOut, easeOutExpo, seg } from '../../../../../reels/anim';
import { C, Svg, T, Eq, Bar, Reticle } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = something that exists; latte = secondary labels; taupe =
// not yet reached or discarded; caramel (focus) = the thing to look at right now; cinnamon = the
// alternative being compared; cherry/cherryText = the bad outcome.

// 1 · Opening
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1));
  return (
    <Svg label="A stream of unknown length, memory for a fixed sample" h={240}>
      <line x1={20} y1={90} x2={560} y2={90} stroke={C.mocha} strokeWidth={1} />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <circle key={i} cx={40 + i * 75} cy={90} r={4} fill={i < 3 ? C.caramel : C.taupe} opacity={easeOut(seg(t, 0.1 + i * 0.08, 0.4 + i * 0.08))} />
      ))}
      <rect x={30} y={130} width={160} height={40} rx={4} fill="none" stroke={C.caramel} strokeWidth={1.4} opacity={a} />
      <T x={40} y={155} s={13} f={C.caramel} o={a}>the reservoir</T>
      <T x={20} y={200} s={13} f={C.latte}>every line, equally likely to be kept</T>
    </Svg>
  );
}

// 2 · PredictReplaceProbability
export function PredictReplaceProbability({ answer }: StepCtx) {
  const opts = ['one half, every time', 'a fixed small number', 'k over n', 'one over n'];
  return (
    <Svg label="What probability should a new item replace something" h={240}>
      {opts.map((label, i) => (
        <g key={label}>
          <rect x={30} y={30 + i * 44} width={300} height={28} rx={4} fill="none" stroke={answer !== null && i === 2 ? C.caramel : C.mocha} strokeWidth={answer !== null && i === 2 ? 1.8 : 1} />
          <T x={40} y={48 + i * 44} s={13} f={answer !== null && i === 2 ? C.caramel : C.latte}>{label}</T>
        </g>
      ))}
    </Svg>
  );
}

// 3 · AlgorithmR
export function AlgorithmR({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 1));
  return (
    <Svg label="Keep the first k; replace a slot with shrinking probability after" h={220}>
      <rect x={40} y={40} width={200} height={40} rx={4} fill="none" stroke={C.caramel} strokeWidth={1.4} />
      <T x={50} y={65} s={13} f={C.caramel}>first k items, kept</T>
      <line x1={260} y1={60} x2={340} y2={60} stroke={C.latte} strokeWidth={1.3} opacity={a} />
      <rect x={340} y={40} width={200} height={40} rx={4} fill="none" stroke={C.latte} strokeWidth={1.3} opacity={a} />
      <T x={350} y={65} s={13} f={C.latte} o={a}>item i: draw j in 1..i</T>
      <T x={20} y={160} s={13} f={C.latte}>j at or below k replaces that slot</T>
    </Svg>
  );
}

// 4 · CorrectnessInvariant
export function CorrectnessInvariant({ t }: StepCtx) {
  const a = easeOutExpo(seg(t, 0.3, 1));
  return (
    <Svg label="Survival probabilities telescope to exactly k over n" h={220}>
      <Eq x={40} y={80}>P(survive) = (k/n) times (1 minus 1/(n+1))</Eq>
      <Bar x={40} y={110} w={420 * a} h={16} full={420} fill={C.caramel} />
      <T x={40} y={150} s={14} f={C.crema}>telescopes to k over n plus one</T>
    </Svg>
  );
}

// 5 · WrongVersions
export function WrongVersions({ t }: StepCtx) {
  const rows = ['needs n in advance', 'keeps only the first k', 'replaces a random slot, probability one half'];
  return (
    <Svg label="Three tempting rules, three different ways to fail" h={220}>
      {rows.map((label, i) => {
        const a = easeOut(seg(t, 0.15 + i * 0.2, 0.5 + i * 0.2));
        return (
          <g key={label} opacity={a}>
            <rect x={40} y={40 + i * 50} width={420} height={32} rx={4} fill="none" stroke={C.cherry} strokeWidth={1.3} />
            <T x={50} y={62 + i * 50} s={13} f={C.cherryText}>{label}</T>
          </g>
        );
      })}
    </Svg>
  );
}

// 6 · AlgorithmRCost
export function AlgorithmRCost({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1));
  return (
    <Svg label="One random draw for every item after the first k" h={200}>
      <Bar x={40} y={70} w={480 * a} h={18} full={480} fill={C.caramel} />
      <T x={40} y={110} s={13} f={C.crema}>a million items, a hundred-item reservoir</T>
      <T x={40} y={138} s={13} f={C.latte}>nearly every item costs one random draw</T>
    </Svg>
  );
}

// 7 · PredictCanSkip
export function PredictCanSkip({ answer }: StepCtx) {
  const opts = ['no, every item must be examined', 'yes, by skipping ahead', 'only if the reservoir holds one item', 'only with extra memory'];
  return (
    <Svg label="Can an algorithm stay uniform while touching fewer items" h={240}>
      {opts.map((label, i) => (
        <g key={label}>
          <rect x={30} y={30 + i * 44} width={340} height={28} rx={4} fill="none" stroke={answer !== null && i === 1 ? C.caramel : C.mocha} strokeWidth={answer !== null && i === 1 ? 1.8 : 1} />
          <T x={40} y={48 + i * 44} s={13} f={answer !== null && i === 1 ? C.caramel : C.latte}>{label}</T>
        </g>
      ))}
    </Svg>
  );
}

// 8 · AlgorithmL
export function AlgorithmL({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 0.9));
  const hops = [60, 220, 340, 520];
  return (
    <Svg label="Draw the skip directly; touch only items that enter" h={220}>
      <line x1={20} y1={100} x2={560} y2={100} stroke={C.mocha} strokeWidth={1} />
      {hops.map((x, i) => (
        <circle key={i} cx={x} cy={100} r={5} fill={C.caramel} opacity={easeOut(seg(t, 0.1 + i * 0.2, 0.4 + i * 0.2))} />
      ))}
      {hops.slice(0, -1).map((x, i) => (
        <line key={i} x1={x} y1={90} x2={hops[i + 1]} y2={90} stroke={C.latte} strokeWidth={1.2} strokeDasharray="4 3" opacity={a} />
      ))}
      <T x={20} y={150} s={13} f={C.latte}>a geometric skip jumps straight to the next entry</T>
    </Svg>
  );
}

// 9 · SkipMeasured
export function SkipMeasured({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.8));
  const b = easeOut(seg(t, 0.4, 1));
  return (
    <Svg label="A few thousand draws against hundreds of thousands" h={220}>
      <T x={40} y={40} s={13} f={C.latte}>Algorithm R</T>
      <Bar x={40} y={55} w={460 * a} h={16} full={460} fill={C.taupe} />
      <T x={40} y={110} s={13} f={C.latte}>Algorithm L</T>
      <Bar x={40} y={125} w={5 * b} h={16} full={460} fill={C.caramel} />
      <T x={40} y={170} s={13} f={C.crema}>the order of k times one plus log of n over k</T>
    </Svg>
  );
}

// 10 · WhatSkipBuys
export function WhatSkipBuys({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 1));
  return (
    <Svg label="Saves random draws always; saves reads only when seekable" h={220}>
      <rect x={40} y={40} width={220} height={50} rx={4} fill="none" stroke={C.caramel} strokeWidth={1.3} />
      <T x={50} y={70} s={13} f={C.caramel}>a stream, read in order</T>
      <rect x={300} y={40} width={220} height={50} rx={4} fill="none" stroke={C.cinnamon} strokeWidth={1.3} opacity={a} />
      <T x={310} y={70} s={13} f={C.cinnamon} o={a}>an index, seekable</T>
      <T x={40} y={130} s={13} f={C.latte}>only the second lets the skip save reads too</T>
    </Svg>
  );
}

// 11 · PredictWeightMeaning
export function PredictWeightMeaning({ answer }: StepCtx) {
  const opts = ['probability in the final sample', 'probability at each draw', 'both, always the same', 'neither; only rank matters'];
  return (
    <Svg label="What does an item's weight mean in a weighted sample" h={240}>
      {opts.map((label, i) => (
        <g key={label}>
          <rect x={30} y={30 + i * 44} width={340} height={28} rx={4} fill="none" stroke={answer !== null && i === 1 ? C.caramel : C.mocha} strokeWidth={answer !== null && i === 1 ? 1.8 : 1} />
          <T x={40} y={48 + i * 44} s={13} f={answer !== null && i === 1 ? C.caramel : C.latte}>{label}</T>
        </g>
      ))}
    </Svg>
  );
}

// 12 · WeightedKeys
export function WeightedKeys({ t }: StepCtx) {
  const pts = [80, 180, 280, 380, 480];
  const heights = [40, 55, 35, 120, 60];
  return (
    <Svg label="Key equals a uniform draw to the power of one over the weight" h={220}>
      <line x1={40} y1={160} x2={540} y2={160} stroke={C.mocha} strokeWidth={1} />
      {pts.map((x, i) => (
        <rect key={i} x={x - 10} y={160 - heights[i]} width={20} height={heights[i]} fill={i === 3 ? C.caramel : C.latte} opacity={easeOut(seg(t, 0.1 + i * 0.12, 0.4 + i * 0.12))} />
      ))}
      <T x={40} y={190} s={13} f={C.latte}>keep the k largest keys, in a min-heap</T>
    </Svg>
  );
}

// 13 · WeightedExample
export function WeightedExample({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 0.9));
  return (
    <Svg label="The heavy item dominates, far past the naive weight share" h={240}>
      <T x={40} y={40} s={13} f={C.latte}>heavy item, included</T>
      <Bar x={260} y={30} w={200 * a} h={16} full={200} fill={C.caramel} />
      <T x={40} y={80} s={13} f={C.latte}>each light item, included</T>
      <Bar x={260} y={70} w={55 * a} h={16} full={200} fill={C.taupe} />
      <Reticle x={360} y={38} w={200} h={30} t={t} at={0.55} color={C.focus} />
      <T x={40} y={150} s={13} f={C.cherryText}>naive guess: weight share, doubled</T>
      <T x={40} y={178} s={13} f={C.cherryText}>not even a valid probability</T>
    </Svg>
  );
}

// 14 · MergeAndProduction
export function MergeAndProduction({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 1));
  return (
    <Svg label="Merging needs each reservoir's own stream length" h={240}>
      <rect x={40} y={40} width={180} height={50} rx={4} fill="none" stroke={C.caramel} strokeWidth={1.3} />
      <T x={50} y={62} s={13} f={C.caramel}>reservoir one</T>
      <T x={50} y={80} s={12} f={C.latte}>+ its stream count</T>
      <rect x={260} y={40} width={180} height={50} rx={4} fill="none" stroke={C.latte} strokeWidth={1.3} />
      <T x={270} y={62} s={13} f={C.latte}>reservoir two</T>
      <T x={270} y={80} s={12} f={C.latte}>+ its stream count</T>
      <T x={40} y={150} s={13} f={C.crema} o={a}>a real range partitioner carries both</T>
      <T x={40} y={178} s={13} f={C.latte} o={a}>takeSample is a different trick entirely</T>
    </Svg>
  );
}

// 15 · Recap
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1));
  return (
    <Svg label="One pass, equally likely items — next, equally likely orderings" h={220}>
      <rect x={40} y={60} width={220} height={60} rx={4} fill="none" stroke={C.caramel} strokeWidth={1.3} />
      <T x={60} y={95} s={13} f={C.caramel}>equally likely items</T>
      <T x={300} y={95} s={14} f={C.latte} o={a}>equally likely orderings</T>
      <T x={40} y={160} s={13} f={C.latte}>one item, one draw, at a time</T>
    </Svg>
  );
}
