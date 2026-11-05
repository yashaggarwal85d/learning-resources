import type { StepCtx } from '../../../../../reels/types';
import { easeOut, easeOutExpo, seg } from '../../../../../reels/anim';
import { C, Svg, T, Eq, Bar, Reticle } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = something that exists; latte = secondary labels; taupe =
// not yet reached or discarded; caramel (focus) = the thing to look at right now; cinnamon = the
// alternative being compared; cherry/cherryText = the bad outcome.

// 1 · Opening
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1));
  const cards = ['A', 'B', 'C'];
  return (
    <Svg label="Three cards, twenty-seven choices, six orderings" h={220}>
      {cards.map((c, i) => (
        <g key={c}>
          <rect x={60 + i * 90} y={40} width={60} height={80} rx={4} fill="none" stroke={C.caramel} strokeWidth={1.3} />
          <T x={82 + i * 90} y={88} s={16} f={C.caramel}>{c}</T>
        </g>
      ))}
      <T x={40} y={160} s={13} f={C.latte} o={a}>twenty-seven equally likely choice chains</T>
      <T x={40} y={188} s={13} f={C.cherryText} o={a}>only six orderings to land on</T>
    </Svg>
  );
}

// 2 · PredictNaiveOutcome
export function PredictNaiveOutcome({ answer }: StepCtx) {
  const opts = ['about even, uniform', 'three high, three low', 'exactly even, always', 'depends on the seed'];
  return (
    <Svg label="How do the six orderings come out" h={240}>
      {opts.map((label, i) => (
        <g key={label}>
          <rect x={30} y={30 + i * 44} width={340} height={28} rx={4} fill="none" stroke={answer !== null && i === 1 ? C.caramel : C.mocha} strokeWidth={answer !== null && i === 1 ? 1.8 : 1} />
          <T x={40} y={48 + i * 44} s={13} f={answer !== null && i === 1 ? C.caramel : C.latte}>{label}</T>
        </g>
      ))}
    </Svg>
  );
}

// 3 · FisherYatesReveal
export function FisherYatesReveal({ t }: StepCtx) {
  const positions = [0, 1, 2, 3, 4];
  return (
    <Svg label="One draw per position, from everything unplaced" h={220}>
      <line x1={40} y1={110} x2={520} y2={110} stroke={C.mocha} strokeWidth={1} />
      {positions.map((i) => (
        <rect key={i} x={60 + i * 92} y={90} width={60} height={40} rx={4} fill="none" stroke={i === 4 ? C.caramel : C.latte} strokeWidth={i === 4 ? 1.6 : 1} opacity={easeOut(seg(t, 0.1 + i * 0.12, 0.4 + i * 0.12))} />
      ))}
      <T x={40} y={170} s={13} f={C.latte}>draw from the unplaced range, then swap</T>
    </Svg>
  );
}

// 4 · CorrectnessByCounting
export function CorrectnessByCounting({ t }: StepCtx) {
  const a = easeOutExpo(seg(t, 0.3, 1));
  return (
    <Svg label="Every ordering reached by exactly one choice chain" h={220}>
      <Eq x={40} y={80}>choice chains = n times (n-1) times ... times one</Eq>
      <Bar x={40} y={110} w={440 * a} h={16} full={440} fill={C.caramel} />
      <T x={40} y={150} s={14} f={C.crema}>one chain per ordering, none shared</T>
    </Svg>
  );
}

// 5 · NaiveShuffleCounted
export function NaiveShuffleCounted({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.8));
  const b = easeOut(seg(t, 0.4, 1));
  return (
    <Svg label="More choice chains than orderings, never even" h={220}>
      <T x={40} y={40} s={13} f={C.latte}>unplaced-only draws</T>
      <Bar x={40} y={55} w={120 * a} h={16} full={440} fill={C.caramel} />
      <T x={40} y={110} s={13} f={C.cherryText}>any-position draws</T>
      <Bar x={40} y={125} w={440 * b} h={16} full={440} fill={C.cherry} />
      <T x={40} y={178} s={13} f={C.cherryText}>never divides evenly among the orderings</T>
    </Svg>
  );
}

// 6 · RandomComparatorSort
export function RandomComparatorSort({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1));
  const browsers = ['one', 'two', 'three', 'four', 'five'];
  const heights = [30, 32, 26, 48, 96];
  return (
    <Svg label="A random comparator is not a consistent ordering" h={220}>
      <line x1={40} y1={160} x2={540} y2={160} stroke={C.mocha} strokeWidth={1} />
      {browsers.map((b, i) => (
        <rect key={b} x={60 + i * 90} y={160 - heights[i]} width={40} height={heights[i]} fill={i === 4 ? C.cherry : C.latte} opacity={easeOut(seg(t, 0.1 + i * 0.1, 0.4 + i * 0.1))} />
      ))}
      <T x={40} y={190} s={13} f={C.cherryText} o={a}>last position, far more often than a fair share</T>
    </Svg>
  );
}

// 7 · PredictGeneratorReach
export function PredictGeneratorReach({ answer }: StepCtx) {
  const opts = ['all of them, eventually', 'at most its own states', 'depends on the shuffle only', 'half, on average'];
  return (
    <Svg label="How many orderings can the generator reach" h={240}>
      {opts.map((label, i) => (
        <g key={label}>
          <rect x={30} y={30 + i * 44} width={340} height={28} rx={4} fill="none" stroke={answer !== null && i === 1 ? C.caramel : C.mocha} strokeWidth={answer !== null && i === 1 ? 1.8 : 1} />
          <T x={40} y={48 + i * 44} s={13} f={answer !== null && i === 1 ? C.caramel : C.latte}>{label}</T>
        </g>
      ))}
    </Svg>
  );
}

// 8 · SeedModuloLimits
export function SeedModuloLimits({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1));
  return (
    <Svg label="A state ceiling, and a remainder that is rarely even" h={220}>
      <rect x={40} y={40} width={220} height={50} rx={4} fill="none" stroke={C.caramel} strokeWidth={1.3} />
      <T x={50} y={70} s={13} f={C.caramel}>generator states</T>
      <rect x={300} y={40} width={220} height={50} rx={4} fill="none" stroke={C.cinnamon} strokeWidth={1.3} opacity={a} />
      <T x={310} y={70} s={13} f={C.cinnamon} o={a}>orderings wanted</T>
      <T x={40} y={130} s={13} f={C.latte}>the ceiling caps what the shuffle can reach</T>
    </Svg>
  );
}

// 9 · DeckTooLarge
export function DeckTooLarge({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 0.9));
  return (
    <Svg label="A deck's orderings outrun a common generator's period" h={220}>
      <T x={40} y={50} s={13} f={C.latte}>generator period</T>
      <Bar x={40} y={65} w={70 * a} h={16} full={460} fill={C.taupe} />
      <T x={40} y={120} s={13} f={C.cherryText}>deck orderings</T>
      <Bar x={40} y={135} w={460 * a} h={16} full={460} fill={C.cherry} />
      <T x={40} y={178} s={13} f={C.cherryText}>far past the reachable range</T>
    </Svg>
  );
}

// 10 · SattoloReveal
export function SattoloReveal({ t }: StepCtx) {
  const n = 5;
  const cx = 300;
  const cy = 110;
  const r = 70;
  const pts = Array.from({ length: n }, (_, i) => {
    const ang = (i / n) * Math.PI * 2 - Math.PI / 2;
    return [cx + r * Math.cos(ang), cy + r * Math.sin(ang)] as const;
  });
  return (
    <Svg label="Strictly below the current position forces one cycle" h={220}>
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={6} fill={C.caramel} opacity={easeOut(seg(t, 0.1 + i * 0.12, 0.4 + i * 0.12))} />
      ))}
      {pts.map(([x, y], i) => {
        const [nx, ny] = pts[(i + 1) % n];
        const a = easeOut(seg(t, 0.2 + i * 0.12, 0.6 + i * 0.12));
        return <line key={i} x1={x} y1={y} x2={nx} y2={ny} stroke={C.latte} strokeWidth={1.2} opacity={a} />;
      })}
      <T x={40} y={200} s={13} f={C.latte}>one single cycle, every item, never in place</T>
    </Svg>
  );
}

// 11 · AccidentalBug
export function AccidentalBug({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1));
  return (
    <Svg label="The accidental version never leaves an item in place" h={220}>
      <T x={40} y={50} s={13} f={C.latte}>a true shuffle, fixed points</T>
      <Bar x={300} y={40} w={60 * a} h={16} full={200} fill={C.taupe} />
      <T x={40} y={110} s={13} f={C.cherryText}>the accidental version, fixed points</T>
      <Bar x={300} y={100} w={0} h={16} full={200} fill={C.cherry} />
      <Reticle x={300} y={92} w={20} h={32} t={t} at={0.55} color={C.cherryText} />
      <T x={40} y={178} s={13} f={C.cherryText}>zero, every single run</T>
    </Svg>
  );
}

// 12 · PredictTooLargeForMemory
export function PredictTooLargeForMemory({ answer }: StepCtx) {
  const opts = ['key it, sort externally', 'no uniform way exists', 'always a small buffer', 'skip shuffling entirely'];
  return (
    <Svg label="The honest way when memory runs out" h={240}>
      {opts.map((label, i) => (
        <g key={label}>
          <rect x={30} y={30 + i * 44} width={340} height={28} rx={4} fill="none" stroke={answer !== null && i === 0 ? C.caramel : C.mocha} strokeWidth={answer !== null && i === 0 ? 1.8 : 1} />
          <T x={40} y={48 + i * 44} s={13} f={answer !== null && i === 0 ? C.caramel : C.latte}>{label}</T>
        </g>
      ))}
    </Svg>
  );
}

// 13 · ThreeMemoryOptions
export function ThreeMemoryOptions({ t }: StepCtx) {
  const rows = ['key, then external sort', 'bucket, then shuffle in memory', 'buffer, trading off uniformity'];
  return (
    <Svg label="Three honest options once memory runs out" h={220}>
      {rows.map((label, i) => {
        const a = easeOut(seg(t, 0.15 + i * 0.2, 0.5 + i * 0.2));
        return (
          <g key={label} opacity={a}>
            <rect x={40} y={40 + i * 50} width={440} height={32} rx={4} fill="none" stroke={i === 2 ? C.cinnamon : C.latte} strokeWidth={1.3} />
            <T x={50} y={62 + i * 50} s={13} f={i === 2 ? C.cinnamon : C.crema}>{label}</T>
          </g>
        );
      })}
    </Svg>
  );
}

// 14 · BufferedShuffleMeasured
export function BufferedShuffleMeasured({ t }: StepCtx) {
  const early = [0, 50, 25, 12, 6, 6];
  const a = easeOut(seg(t, 0.2, 0.9));
  return (
    <Svg label="Early departure capped; late departure trails off" h={240}>
      <T x={40} y={36} s={13} f={C.latte}>first item, by output slot</T>
      <line x1={40} y1={150} x2={540} y2={150} stroke={C.mocha} strokeWidth={1} />
      {early.map((v, i) => (
        <rect key={i} x={60 + i * 80} y={150 - v} width={40} height={v * a} fill={i < 2 ? C.caramel : C.taupe} opacity={easeOut(seg(t, 0.1 + i * 0.1, 0.4 + i * 0.1))} />
      ))}
      <T x={40} y={190} s={13} f={C.cherryText}>never earlier than the buffer allows</T>
      <T x={40} y={216} s={13} f={C.latte}>later, with slowly shrinking odds</T>
    </Svg>
  );
}

// 15 · Recap
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1));
  return (
    <Svg label="One proof over arrangements — next, a single pass" h={220}>
      <rect x={40} y={60} width={220} height={60} rx={4} fill="none" stroke={C.caramel} strokeWidth={1.3} />
      <T x={60} y={95} s={13} f={C.caramel}>every ordering, equal</T>
      <T x={300} y={95} s={14} f={C.latte} o={a}>a pass with no looking back</T>
      <T x={40} y={160} s={13} f={C.latte}>one item, one draw, at a time</T>
    </Svg>
  );
}
