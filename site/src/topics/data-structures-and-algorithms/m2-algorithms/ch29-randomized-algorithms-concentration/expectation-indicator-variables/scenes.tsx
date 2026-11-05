import type { StepCtx } from '../../../../../reels/types';
import { easeOut, easeOutExpo, seg } from '../../../../../reels/anim';
import { C, Svg, T, Eq, Bar, Plot, Reticle } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = something that exists; latte = secondary labels; taupe =
// not yet reached; caramel (focus) = the thing to look at right now; cinnamon = the alternative
// being compared; cherry/cherryText = the bad outcome.

// 1 · Opening
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1));
  const b = easeOut(seg(t, 0.6, 1.3));
  return (
    <Svg label="Randomized quicksort's cost is different every run" h={240}>
      <T x={300} y={70} s={14} f={C.latte} a="middle">a thousand keys, pivots by coin flip</T>
      <Bar x={60} y={110} w={480 * a} h={18} full={480} fill={C.caramel} />
      <T x={60} y={150} s={13} f={C.crema} o={a}>one exact number, no recurrence</T>
      <T x={60} y={178} s={13} f={C.latte} o={b}>two hundred runs land close to it</T>
    </Svg>
  );
}

// 2 · PredictGrowthOrder
export function PredictGrowthOrder({ answer }: StepCtx) {
  const opts = ['n log base two n', 'two n times the natural log of n', 'n squared over four', 'n log base two n, plus n'];
  return (
    <Svg label="How fast does the expected comparison count grow" h={240}>
      {opts.map((label, i) => (
        <g key={label}>
          <rect x={30} y={30 + i * 44} width={420} height={28} rx={4} fill="none" stroke={answer !== null && i === 1 ? C.caramel : C.mocha} strokeWidth={answer !== null && i === 1 ? 1.8 : 1} />
          <T x={40} y={48 + i * 44} s={13} f={answer !== null && i === 1 ? C.caramel : C.latte}>{label}</T>
        </g>
      ))}
    </Svg>
  );
}

// 3 · LinearityUrn
export function LinearityUrn({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.8));
  const b = easeOut(seg(t, 0.6, 1.2));
  const balls = ['R', 'R', 'R', 'B', 'B'];
  return (
    <Svg label="Expectation adds even for dependent draws, without replacement" h={260}>
      <T x={300} y={30} s={14} f={C.latte} a="middle">an urn: red and blue, two draws, no replacement</T>
      {balls.map((color, i) => (
        <circle key={i} cx={160 + i * 70} cy={90} r={16} fill="none" stroke={color === 'R' ? C.caramel : C.taupe} strokeWidth={1.6} opacity={a} />
      ))}
      <Reticle x={160} y={90} w={44} h={44} t={t} at={0.5} color={C.focus} />
      <T x={300} y={170} s={13} f={C.crema} a="middle" o={b}>
        each draw is red with the same probability
      </T>
      <T x={300} y={198} s={13} f={C.caramel} a="middle" o={b}>
        the two expectations still add
      </T>
    </Svg>
  );
}

// 4 · IndicatorVariable
export function IndicatorVariable({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 0.9));
  return (
    <Svg label="An indicator is zero or one; its expectation is a probability" h={220}>
      <Eq x={60} y={90}>I = 1 if the event happens, else 0</Eq>
      <Eq x={60} y={130} o={a}>E[I] = Pr[the event]</Eq>
      <T x={60} y={180} s={13} f={C.latte}>a count is a sum of these — add the probabilities</T>
    </Svg>
  );
}

// 5 · FixedPointsReveal
export function FixedPointsReveal({ t }: StepCtx) {
  const pts: [number, number][] = [120, 220, 320, 420].map((x, i) => [x, 90]);
  const labels = ['1/n', '1/n', '1/n', '1/n'];
  return (
    <Svg label="n indicators, each probability one over n, summing to exactly one" h={240}>
      <T x={300} y={30} s={14} f={C.latte} a="middle">one indicator per position in the permutation</T>
      <Plot pts={pts} t={t} start={0.2} beat={0.22} r={6} fill={C.caramel} labels={labels} />
      <T x={300} y={170} s={13} f={C.crema} a="middle">summed by linearity</T>
      <T x={300} y={198} s={15} f={C.caramel} a="middle">exactly one, for every size</T>
    </Svg>
  );
}

// 6 · QuicksortPairSetup
export function QuicksortPairSetup({ t }: StepCtx) {
  const n = 9;
  const xs = Array.from({ length: n }, (_, i) => 60 + i * 55);
  const iIdx = 2, jIdx = 6;
  const a = easeOut(seg(t, 0.4, 1));
  return (
    <Svg label="A pair is compared only if one of them is the first pivot between them" h={220}>
      <line x1={40} y1={90} x2={540} y2={90} stroke={C.mocha} strokeWidth={1} />
      {xs.map((x, i) => (
        <circle key={i} cx={x} cy={90} r={5} fill={i === iIdx || i === jIdx ? C.caramel : (i > iIdx && i < jIdx ? C.latte : C.taupe)} />
      ))}
      <Reticle x={(xs[iIdx] + xs[jIdx]) / 2} y={90} w={xs[jIdx] - xs[iIdx] + 40} h={40} t={t} at={0.5} color={C.focus} />
      <T x={300} y={150} s={13} f={C.latte} a="middle" o={a}>the elements ranked between them decide</T>
      <T x={300} y={178} s={13} f={C.caramel} a="middle" o={a}>first pivot among them must be an endpoint</T>
    </Svg>
  );
}

// 7 · QuicksortSumReveal
export function QuicksortSumReveal({ t }: StepCtx) {
  const a = easeOutExpo(seg(t, 0.3, 1.1));
  return (
    <Svg label="Summing every pair's probability gives the exact comparison count" h={240}>
      <Eq x={60} y={70}>sum of two over (rank gap plus one), over every pair</Eq>
      <Bar x={60} y={110} w={420 * a} h={16} full={420} fill={C.caramel} />
      <T x={60} y={150} s={13} f={C.crema}>the exact count, not an approximation</T>
      <T x={60} y={178} s={13} f={C.latte} o={a}>close to two n ln n, with a visible correction</T>
    </Svg>
  );
}

// 8 · SecondDerivation
export function SecondDerivation({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 1));
  return (
    <Svg label="Two routes to the same number: a recurrence, and a sum of indicators" h={220}>
      <rect x={60} y={50} width={200} height={50} rx={4} fill="none" stroke={C.latte} strokeWidth={1.3} />
      <T x={160} y={80} s={13} f={C.latte} a="middle">a recurrence on the algorithm</T>
      <rect x={340} y={50} width={200} height={50} rx={4} fill="none" stroke={C.caramel} strokeWidth={1.3} />
      <T x={440} y={80} s={13} f={C.caramel} a="middle">a probability per pair</T>
      <T x={300} y={150} s={14} f={C.crema} a="middle" o={a}>the same exact number, either way</T>
    </Svg>
  );
}

// 9 · CouponCollectorReveal
export function CouponCollectorReveal({ t }: StepCtx) {
  const phases = [0, 1, 2, 3, 4];
  return (
    <Svg label="Each new coupon is a widening geometric wait, summed by linearity" h={240}>
      <T x={300} y={30} s={14} f={C.latte} a="middle">one phase per new coupon seen</T>
      {phases.map((i) => {
        const w = (18 + i * 22) * easeOut(seg(t, 0.15 + i * 0.15, 0.5 + i * 0.15));
        return <rect key={i} x={60} y={55 + i * 24} width={w} height={14} fill={C.caramel} opacity={0.85} />;
      })}
      <T x={60} y={210} s={13} f={C.latte}>the wait widens as fewer coupons remain</T>
    </Svg>
  );
}

// 10 · WhatLinearityLacks
export function WhatLinearityLacks({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 1));
  const cloudX = [90, 150, 210, 270, 330, 390, 450];
  const cloudY = [100, 70, 110, 60, 130, 85, 95];
  return (
    <Svg label="An average over every run says nothing about any one run" h={240}>
      <line x1={40} y1={100} x2={520} y2={100} stroke={C.mocha} strokeWidth={1} />
      {cloudX.map((x, i) => (
        <circle key={i} cx={x} cy={cloudY[i]} r={4} fill={C.taupe} opacity={a} />
      ))}
      <line x1={40} y1={95} x2={520} y2={95} stroke={C.caramel} strokeWidth={1.4} />
      <T x={300} y={160} s={13} f={C.caramel} a="middle" o={a}>the average line, drawn once</T>
      <T x={300} y={188} s={13} f={C.latte} a="middle" o={a}>every dot is a run that lands elsewhere</T>
    </Svg>
  );
}

// 11 · Recap
export function Recap({ t }: StepCtx) {
  const labels = ['fixed points', 'quicksort pairs', 'coupon draws'];
  return (
    <Svg label="One rule, three counts, no independence required" h={220}>
      {labels.map((label, i) => {
        const a = easeOut(seg(t, 0.15 + i * 0.2, 0.55 + i * 0.2));
        return (
          <g key={label} opacity={a}>
            <rect x={40 + i * 170} y={60} width={140} height={60} rx={4} fill="none" stroke={C.caramel} strokeWidth={1.3} />
            <T x={60 + i * 170} y={95} s={13} f={C.caramel}>{label}</T>
          </g>
        );
      })}
      <T x={20} y={160} s={13} f={C.latte}>linearity of expectation, every time</T>
    </Svg>
  );
}
