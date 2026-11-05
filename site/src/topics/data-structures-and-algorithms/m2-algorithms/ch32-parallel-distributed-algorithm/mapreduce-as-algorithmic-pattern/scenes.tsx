import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T, Eq, Bar } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = a record that exists; latte = secondary labels; taupe =
// not yet reached; caramel (focus) = the thing to look at — the shuffle's arrows, a record
// count collapsing; cinnamon = the alternative being compared; cherry/cherryText = the bad
// outcome — a hot key converging on one reducer, a wrong answer.

// 1 · Opening
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1));
  const words = ['the', 'the', 'the', 'a', 'the', 'and', 'the'];
  return (
    <Svg label="Every occurrence crosses the network, not just the distinct words" h={220}>
      {words.map((w, i) => (
        <g key={i}>
          <rect x={40 + i * 70} y={40} width={55} height={26} rx={3} fill="none" stroke={w === 'the' ? C.cherryText : C.latte} strokeWidth={1.2} opacity={easeOut(seg(t, 0.05 * i, 0.05 * i + 0.3))} />
          <T x={48 + i * 70} y={58} s={12} f={w === 'the' ? C.cherryText : C.latte}>{w}</T>
        </g>
      ))}
      <T x={40} y={110} s={13} f={C.cherryText} o={a}>hundreds of thousands of records, just for "the"</T>
      <T x={40} y={140} s={13} f={C.latte} o={a}>the answer only needs the distinct words</T>
    </Svg>
  );
}

// 2 · PredictCombinedMean
export function PredictCombinedMean({ answer }: StepCtx) {
  const opts = ['still exactly right', 'too high, always', 'too low, always', 'wrong, unpredictably'];
  return (
    <Svg label="Does the early-combine trick survive turning a sum into a mean" h={240}>
      {opts.map((label, i) => (
        <g key={label}>
          <rect x={30} y={30 + i * 44} width={340} height={28} rx={4} fill="none" stroke={answer !== null && i === 3 ? C.caramel : C.mocha} strokeWidth={answer !== null && i === 3 ? 1.8 : 1} />
          <T x={40} y={48 + i * 44} s={13} f={answer !== null && i === 3 ? C.caramel : C.latte}>{label}</T>
        </g>
      ))}
    </Svg>
  );
}

// 3 · MapShuffleReduce
export function MapShuffleReduce({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.8));
  return (
    <Svg label="Map, shuffle, reduce — one partition function between them" h={220}>
      <rect x={30} y={40} width={140} height={120} rx={4} fill="none" stroke={C.latte} strokeWidth={1.2} />
      <T x={40} y={60} s={12} f={C.latte}>map tasks</T>
      <rect x={460} y={40} width={110} height={120} rx={4} fill="none" stroke={C.latte} strokeWidth={1.2} />
      <T x={468} y={60} s={12} f={C.latte}>reduce tasks</T>
      <line x1={170} y1={70} x2={460} y2={70} stroke={C.caramel} strokeWidth={1.3} opacity={a} />
      <line x1={170} y1={120} x2={460} y2={120} stroke={C.caramel} strokeWidth={1.3} opacity={a} />
      <T x={200} y={110} s={12} f={C.caramel} o={a}>shuffle — by hash(key) mod R</T>
    </Svg>
  );
}

// 4 · WordCountWalkthrough
export function WordCountWalkthrough({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1));
  return (
    <Svg label="Map and reduce run free; the exchange is where tasks meet" h={200}>
      <Eq x={40} y={60}>map: emit(word, one)</Eq>
      <Eq x={40} y={110} o={a}>reduce: sum(counts for word)</Eq>
      <T x={40} y={160} s={12} f={C.latte}>each phase alone has span one</T>
    </Svg>
  );
}

// 5 · WhyShuffleIsTheCost
export function WhyShuffleIsTheCost({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.9));
  return (
    <Svg label="The shuffle is the one all-to-all step" h={220}>
      <T x={40} y={34} s={12} f={C.latte}>map, reduce — each span one</T>
      <Bar x={40} y={48} w={60 * a} h={14} full={460} fill={C.taupe} />
      <T x={40} y={100} s={12} f={C.cherryText}>the shuffle — every map task to every reduce task</T>
      <Bar x={40} y={114} w={460 * a} h={14} full={460} fill={C.cherryText} />
    </Svg>
  );
}

// 6 · CombinerIntro
export function CombinerIntro({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1));
  const counts = ['the', 'the', 'the', 'the'];
  return (
    <Svg label="Merge duplicates before they cross the network" h={210}>
      {counts.map((w, i) => (
        <rect key={i} x={40 + i * 60} y={40} width={44} height={24} rx={3} fill={C.taupe} opacity={easeOut(seg(t, 0.05 * i, 0.05 * i + 0.25))} />
      ))}
      <T x={300} y={56} s={14} f={C.caramel} o={a}>→</T>
      <rect x={340} y={40} width={60} height={24} rx={3} fill="none" stroke={C.caramel} strokeWidth={1.4} opacity={a} />
      <T x={348} y={57} s={11} f={C.caramel} o={a}>(the,4)</T>
      <T x={40} y={110} s={12} f={C.latte}>combined early, on the map task's own output</T>
    </Svg>
  );
}

// 7 · CombinerMeasured
export function CombinerMeasured({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.9));
  return (
    <Svg label="Fewer records cross; the answer stays identical" h={220}>
      <T x={40} y={34} s={12} f={C.latte}>without a combiner</T>
      <Bar x={40} y={48} w={440 * a} h={16} full={440} fill={C.cherryText} />
      <T x={40} y={110} s={12} f={C.latte}>with a combiner</T>
      <Bar x={40} y={124} w={110 * a} h={16} full={440} fill={C.caramel} />
      <T x={40} y={176} s={12} f={C.crema} o={a}>same final counts, either way</T>
    </Svg>
  );
}

// 8 · CombinerAlgebra
export function CombinerAlgebra({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1));
  return (
    <Svg label="Any grouping, any order — the algebra a combiner needs" h={210}>
      <Eq x={40} y={70}>(a + b) + c = a + (b + c)</Eq>
      <T x={40} y={95} s={12} f={C.latte}>associative — grouping does not matter</T>
      <Eq x={40} y={150} o={a}>a + b = b + a</Eq>
      <T x={40} y={175} s={12} f={C.latte} o={a}>commutative — order does not matter</T>
    </Svg>
  );
}

// 9 · PredictMeanCombiner
export function PredictMeanCombiner({ answer }: StepCtx) {
  const opts = ['always the same', 'different, by a fixed amount', 'different, depends on the split', 'same only if groups match size'];
  return (
    <Svg label="Combining three groups' own means" h={240}>
      {opts.map((label, i) => (
        <g key={label}>
          <rect x={30} y={30 + i * 44} width={340} height={28} rx={4} fill="none" stroke={answer !== null && i === 2 ? C.caramel : C.mocha} strokeWidth={answer !== null && i === 2 ? 1.8 : 1} />
          <T x={40} y={48 + i * 44} s={13} f={answer !== null && i === 2 ? C.caramel : C.latte}>{label}</T>
        </g>
      ))}
    </Svg>
  );
}

// 10 · BrokenMeanFix
export function BrokenMeanFix({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1));
  return (
    <Svg label="Combine sum and count, divide only at the end" h={220}>
      <T x={40} y={40} s={12} f={C.cherryText}>mean of means</T>
      <Bar x={300} y={28} w={60} h={16} full={200} fill={C.cherryText} />
      <T x={40} y={100} s={12} f={C.caramel} o={a}>true pooled mean</T>
      <Bar x={300} y={88} w={130 * a} h={16} full={200} fill={C.caramel} />
      <T x={40} y={160} s={12} f={C.latte}>combine (sum, count); divide once, at the end</T>
    </Svg>
  );
}

// 11 · MPCModelReveal
export function MPCModelReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1));
  return (
    <Svg label="Rounds and per-server load — the only two numbers counted" h={200}>
      <Eq x={40} y={70}>round = local compute + one exchange</Eq>
      <T x={40} y={100} s={12} f={C.latte}>cost = rounds, and the most any server receives</T>
      <T x={40} y={140} s={12} f={C.latte} o={a}>nothing about the framework's engineering enters</T>
    </Svg>
  );
}

// 12 · JoinShapesMeasured
export function JoinShapesMeasured({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.9));
  return (
    <Svg label="A chain join needs no replication; a triangle does" h={210}>
      <T x={40} y={36} s={12} f={C.latte}>two-relation chain join</T>
      <Bar x={40} y={50} w={60 * a} h={16} full={300} fill={C.caramel} />
      <T x={40} y={110} s={12} f={C.cherryText}>three-relation triangle query</T>
      <Bar x={40} y={124} w={180 * a} h={16} full={300} fill={C.cherryText} />
      <T x={40} y={176} s={12} f={C.latte}>replication by shape, not by size</T>
    </Svg>
  );
}

// 13 · TransitiveClosureLimit
export function TransitiveClosureLimit({ t }: StepCtx) {
  const n = 6;
  const pts = Array.from({ length: n }, (_, i) => [50 + i * 80, 100] as const);
  return (
    <Svg label="A chain outgrows any fixed round budget" h={190}>
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={5} fill={C.cherryText} opacity={easeOut(seg(t, 0.08 * i, 0.08 * i + 0.3))} />
      ))}
      {pts.slice(0, -1).map(([x, y], i) => (
        <line key={i} x1={x} y1={y} x2={pts[i + 1][0]} y2={pts[i + 1][1]} stroke={C.cherryText} strokeWidth={1.3} opacity={easeOut(seg(t, 0.1 + i * 0.08, 0.4 + i * 0.08))} />
      ))}
      <T x={40} y={150} s={12} f={C.latte}>rounds needed grow with the chain's length</T>
    </Svg>
  );
}

// 14 · JoinAsShuffle
export function JoinAsShuffle({ t }: StepCtx) {
  const rows = ['map-with-a-tag', 'shuffle on the join key', 'reduce emits matches'];
  return (
    <Svg label="A shuffle join: the same idea, a different currency" h={210}>
      {rows.map((label, i) => {
        const a = easeOut(seg(t, 0.15 + i * 0.22, 0.5 + i * 0.22));
        return (
          <g key={label} opacity={a}>
            <rect x={40} y={40 + i * 50} width={440} height={32} rx={4} fill="none" stroke={i === 1 ? C.cinnamon : C.latte} strokeWidth={1.3} />
            <T x={50} y={62 + i * 50} s={13} f={i === 1 ? C.cinnamon : C.crema}>{label}</T>
          </g>
        );
      })}
    </Svg>
  );
}

// 15 · Recap
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1));
  return (
    <Svg label="Many machines buy rounds, not an escape from exponential" h={220}>
      <rect x={40} y={60} width={220} height={60} rx={4} fill="none" stroke={C.caramel} strokeWidth={1.3} />
      <T x={60} y={95} s={13} f={C.caramel}>map, shuffle, reduce, rounds</T>
      <T x={40} y={150} s={14} f={C.latte} o={a}>next: what makes a problem</T>
      <T x={40} y={175} s={14} f={C.latte} o={a}>hard at all</T>
    </Svg>
  );
}
