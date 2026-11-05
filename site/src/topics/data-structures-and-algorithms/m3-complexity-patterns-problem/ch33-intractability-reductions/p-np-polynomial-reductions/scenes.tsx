import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T, Eq, Bar } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = an instance, a graph, a certificate; latte = secondary
// labels (k, n, a count); taupe = the part of the search space not yet tried; caramel (focus) =
// the thing to look at — the certificate being checked, the arrow of a reduction; cinnamon
// (rare) = the alternative being compared, always the same side: the problem reduced from
// against the problem reduced to; cherry/cherryText = the bad outcome — a reduction pointing
// the wrong way, a verifier rejecting a certificate, a search space that explodes.

function ringPositions(n: number, cx: number, cy: number, r: number) {
  return Array.from({ length: n }, (_, i) => {
    const a = (2 * Math.PI * i) / n - Math.PI / 2;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
  });
}

// 1 · Opening
export function Opening({ t }: StepCtx) {
  const pts = ringPositions(14, 170, 110, 70);
  const ringed = [0, 2, 4, 6, 8, 10, 12];
  const a = easeOut(seg(t, 0.4, 1));
  return (
    <Svg label="Checking a candidate is fast; finding one is the hard part" h={230}>
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={5} fill={ringed.includes(i) ? C.caramel : C.crema} opacity={easeOut(seg(t, 0.03 * i, 0.03 * i + 0.3))} />
      ))}
      <T x={40} y={30} s={12} f={C.latte}>a graph, with one candidate set ringed</T>
      <T x={260} y={70} s={12} f={C.crema} o={a}>a few hundred checks</T>
      <T x={260} y={95} s={12} f={C.latte} o={a}>confirm or refuse it</T>
      <T x={260} y={150} s={12} f={C.cherryText} o={a}>finding one from scratch:</T>
      <T x={260} y={175} s={12} f={C.cherryText} o={a}>far more candidates to try</T>
    </Svg>
  );
}

// 2 · PredictSelfReduction
export function PredictSelfReduction({ answer }: StepCtx) {
  const opts = ['Exactly one call', 'One call, then one more per vertex', 'One call per candidate set', 'Cannot be done with yes or no alone'];
  return (
    <Svg label="How many oracle calls to turn yes/no into an actual witness" h={240}>
      {opts.map((label, i) => (
        <g key={label}>
          <rect x={30} y={30 + i * 44} width={360} height={28} rx={4} fill="none" stroke={answer !== null && i === 1 ? C.caramel : C.mocha} strokeWidth={answer !== null && i === 1 ? 1.8 : 1} />
          <T x={40} y={48 + i * 44} s={13} f={answer !== null && i === 1 ? C.caramel : C.latte}>{label}</T>
        </g>
      ))}
    </Svg>
  );
}

// 3 · PNPCertificateVerifier
export function PNPCertificateVerifier({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1));
  return (
    <Svg label="A verifier checks a certificate; it does not search for one" h={210}>
      <rect x={30} y={40} width={160} height={120} rx={4} fill="none" stroke={C.crema} strokeWidth={1.3} />
      <T x={40} y={60} s={12} f={C.crema}>P</T>
      <T x={40} y={85} s={11} f={C.latte}>solved quickly</T>
      <rect x={220} y={40} width={200} height={120} rx={4} fill="none" stroke={C.caramel} strokeWidth={1.3} opacity={a} />
      <T x={230} y={60} s={12} f={C.caramel} o={a}>NP</T>
      <T x={230} y={85} s={11} f={C.latte} o={a}>a yes comes with a</T>
      <T x={230} y={105} s={11} f={C.latte} o={a}>certificate; a verifier</T>
      <T x={230} y={125} s={11} f={C.latte} o={a}>checks it quickly</T>
    </Svg>
  );
}

// 4 · ConsequencesOfDefinitions
export function ConsequencesOfDefinitions({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1));
  return (
    <Svg label="P sits inside NP; whether NP sits inside P is open" h={220}>
      <circle cx={220} cy={110} r={90} fill="none" stroke={C.caramel} strokeWidth={1.3} />
      <T x={290} y={50} s={12} f={C.caramel}>NP</T>
      <circle cx={190} cy={110} r={45} fill="none" stroke={C.crema} strokeWidth={1.3} />
      <T x={170} y={110} s={12} f={C.crema}>P</T>
      <T x={40} y={30} s={12} f={C.latte}>nondeterministic polynomial time</T>
      <T x={40} y={190} s={12} f={C.latte} o={a}>P = NP: the open question</T>
    </Svg>
  );
}

// 5 · ThreeFlavors
export function ThreeFlavors({ t }: StepCtx) {
  const rows = ['decision: do these items fit?', 'search: give me a packing', 'optimization: the fewest bins'];
  return (
    <Svg label="One packing problem, three questions about it" h={210}>
      {rows.map((label, i) => {
        const a = easeOut(seg(t, 0.15 + i * 0.22, 0.5 + i * 0.22));
        return (
          <g key={label} opacity={a}>
            <rect x={40} y={40 + i * 50} width={420} height={32} rx={4} fill="none" stroke={i === 0 ? C.caramel : C.latte} strokeWidth={1.3} />
            <T x={50} y={62 + i * 50} s={13} f={i === 0 ? C.caramel : C.crema}>{label}</T>
          </g>
        );
      })}
    </Svg>
  );
}

// 6 · SelfReductionWalkthrough
export function SelfReductionWalkthrough({ t }: StepCtx) {
  const pts = ringPositions(12, 160, 110, 65);
  const kept = [1, 4, 7, 10];
  return (
    <Svg label="Delete one vertex at a time; keep it only if the answer flips to no" h={230}>
      {pts.map(([x, y], i) => {
        const a = easeOut(seg(t, 0.04 * i, 0.04 * i + 0.3));
        const isKept = kept.includes(i);
        return <circle key={i} cx={x} cy={y} r={5} fill={isKept ? C.caramel : C.taupe} opacity={a} />;
      })}
      <T x={260} y={70} s={12} f={C.latte}>caramel: stays — removing it</T>
      <T x={260} y={92} s={12} f={C.latte}>flips the oracle's answer to no</T>
      <T x={260} y={140} s={12} f={C.taupe}>grey: safely dropped — the</T>
      <T x={260} y={162} s={12} f={C.taupe}>answer survives without it</T>
    </Svg>
  );
}

// 7 · KarpReductionDefinition
export function KarpReductionDefinition({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1));
  return (
    <Svg label="The function runs from a known-hard problem toward the new one" h={200}>
      <rect x={40} y={70} width={110} height={60} rx={4} fill="none" stroke={C.cinnamon} strokeWidth={1.3} />
      <T x={55} y={105} s={12} f={C.cinnamon}>known hard</T>
      <rect x={330} y={70} width={110} height={60} rx={4} fill="none" stroke={C.crema} strokeWidth={1.3} />
      <T x={355} y={105} s={12} f={C.crema}>new problem</T>
      <line x1={150} y1={100} x2={330} y2={100} stroke={C.caramel} strokeWidth={1.4} opacity={a} />
      <T x={170} y={90} s={11} f={C.caramel} o={a}>reduces to</T>
    </Svg>
  );
}

// 8 · WorkedReductionISVC
export function WorkedReductionISVC({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1));
  return (
    <Svg label="Independent set to vertex cover: the same graph, the complement" h={210}>
      <rect x={30} y={60} width={180} height={90} rx={4} fill="none" stroke={C.crema} strokeWidth={1.3} />
      <T x={45} y={85} s={12} f={C.crema}>independent set, size k</T>
      <rect x={290} y={60} width={180} height={90} rx={4} fill="none" stroke={C.caramel} strokeWidth={1.3} opacity={a} />
      <T x={305} y={85} s={12} f={C.caramel} o={a}>vertex cover, n minus k</T>
      <line x1={210} y1={105} x2={290} y2={105} stroke={C.caramel} strokeWidth={1.4} opacity={a} />
      <T x={40} y={180} s={12} f={C.latte}>checked on every graph of six vertices or fewer</T>
    </Svg>
  );
}

// 9 · PredictWrongDirection
export function PredictWrongDirection({ answer }: StepCtx) {
  const opts = ['Proves the new problem is just as hard', 'Proves nothing useful either way', 'Shows only that the new problem is no harder', 'Is not a valid reduction at all'];
  return (
    <Svg label="What does reducing the new problem to a known-hard one show" h={240}>
      {opts.map((label, i) => (
        <g key={label}>
          <rect x={30} y={30 + i * 44} width={400} height={28} rx={4} fill="none" stroke={answer !== null && i === 2 ? C.caramel : C.mocha} strokeWidth={answer !== null && i === 2 ? 1.8 : 1} />
          <T x={40} y={48 + i * 44} s={13} f={answer !== null && i === 2 ? C.caramel : C.latte}>{label}</T>
        </g>
      ))}
    </Svg>
  );
}

// 10 · WrongDirectionVacuous
export function WrongDirectionVacuous({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1));
  return (
    <Svg label="Any easy problem reduces this way to almost anything" h={210}>
      <rect x={40} y={70} width={110} height={60} rx={4} fill="none" stroke={C.crema} strokeWidth={1.3} />
      <T x={50} y={105} s={12} f={C.crema}>easy problem</T>
      <rect x={330} y={70} width={110} height={60} rx={4} fill="none" stroke={C.cherryText} strokeWidth={1.3} opacity={a} />
      <T x={345} y={95} s={11} f={C.cherryText} o={a}>one of two</T>
      <T x={345} y={115} s={11} f={C.cherryText} o={a}>fixed answers</T>
      <line x1={150} y1={100} x2={330} y2={100} stroke={C.cherryText} strokeWidth={1.4} opacity={a} strokeDasharray="4 4" />
      <T x={40} y={180} s={12} f={C.cherryText} o={a}>carries no information about the target</T>
    </Svg>
  );
}

// 11 · NPHardNPComplete
export function NPHardNPComplete({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1));
  return (
    <Svg label="NP-hard: at least as hard as everything in NP" h={200}>
      <Eq x={40} y={70}>every NP problem reduces to it</Eq>
      <T x={40} y={95} s={12} f={C.latte}>NP-hard</T>
      <Eq x={40} y={140} o={a}>NP-hard, and itself in NP</Eq>
      <T x={40} y={165} s={12} f={C.latte} o={a}>NP-complete</T>
    </Svg>
  );
}

// 12 · CookLevinProblemList
export function CookLevinProblemList({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1));
  return (
    <Svg label="One fact proven directly; everything else inherits it by reduction" h={220}>
      <rect x={40} y={50} width={180} height={50} rx={4} fill="none" stroke={C.caramel} strokeWidth={1.4} />
      <T x={55} y={80} s={12} f={C.caramel}>circuit satisfiability</T>
      <T x={40} y={130} s={12} f={C.latte} o={a}>→ twenty-one more, by reduction</T>
      <T x={40} y={175} s={12} f={C.taupe}>no known-hard problem reduces to this one</T>
    </Svg>
  );
}

// 13 · HidingInDataSystems
export function HidingInDataSystems({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.9));
  return (
    <Svg label="Bin packing, and a join order search space that explodes" h={210}>
      <T x={40} y={34} s={12} f={C.latte}>join order candidates</T>
      <Bar x={40} y={48} w={420 * a} h={16} full={420} fill={C.cherryText} />
      <T x={40} y={110} s={12} f={C.latte}>as the table count rises</T>
      <T x={40} y={160} s={12} f={C.crema} o={a}>bin packing: the running example, NP-hard</T>
    </Svg>
  );
}

// 14 · WhatThisDoesNot
export function WhatThisDoesNot({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1));
  return (
    <Svg label="One reduction built; the full gadget chain is not this reel's job" h={200}>
      <T x={40} y={60} s={12} f={C.caramel}>built: one reduction, checked by exhaustion</T>
      <T x={40} y={100} s={12} f={C.taupe} o={a}>not built: the full chain of gadgets</T>
      <T x={40} y={140} s={12} f={C.latte} o={a}>still ahead: what to do about a hard problem</T>
    </Svg>
  );
}

// 15 · Recap
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1));
  return (
    <Svg label="Direction settled; next, numbers that are not just counts" h={220}>
      <rect x={40} y={60} width={220} height={60} rx={4} fill="none" stroke={C.caramel} strokeWidth={1.3} />
      <T x={60} y={95} s={13} f={C.caramel}>P, NP, reductions, direction</T>
      <T x={40} y={150} s={14} f={C.latte} o={a}>next: a number's value against its length</T>
    </Svg>
  );
}
