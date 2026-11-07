import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T, Eq, Bar, Draw } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = something that exists; latte = secondary labels; taupe =
// idle or not yet reached; caramel (focus) = the thing to look at — the critical path, the task
// being stolen; cinnamon = the alternative being compared; cherry/cherryText = the bad outcome,
// an idle worker while the span is still running.

function treeLevelPositions() {
  // A full binary tree of additions over sixteen leaves: four levels, drawn bottom to top.
  const leafXs = Array.from({ length: 16 }, (_, i) => 40 + i * 32);
  const leafY = 180;
  const levels: { x: number; y: number }[][] = [leafXs.map((x) => ({ x, y: leafY }))];
  for (let lvl = 1; lvl <= 4; lvl++) {
    const prev = levels[lvl - 1];
    const next: { x: number; y: number }[] = [];
    for (let i = 0; i < prev.length; i += 2) {
      next.push({ x: (prev[i].x + prev[i + 1].x) / 2, y: leafY - lvl * 32 });
    }
    levels.push(next);
  }
  return levels;
}

// 1 · Opening
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1));
  return (
    <Svg label="One program speeds up; the same-sized loop does not" h={220}>
      <T x={40} y={36} s={13} f={C.latte}>a sum, as a tree of additions</T>
      <Bar x={40} y={50} w={30} h={16} full={460} fill={C.taupe} />
      <Bar x={40} y={75} w={430 * a} h={16} full={460} fill={C.caramel} />
      <T x={40} y={120} s={13} f={C.cherryText}>the same sum, as one long chain</T>
      <Bar x={40} y={134} w={30} h={16} full={460} fill={C.taupe} />
      <Bar x={40} y={159} w={30} h={16} full={460} fill={C.cherry} />
      <T x={40} y={198} s={12} f={C.latte}>one core → many cores</T>
    </Svg>
  );
}

// 2 · PredictSumSpeedup
export function PredictSumSpeedup({ answer }: StepCtx) {
  const opts = ['many steps, no ceiling', 'few steps, no ceiling', 'few steps, a small ceiling', 'many steps, a small ceiling'];
  return (
    <Svg label="How many steps, and what is the speed-up ceiling" h={240}>
      {opts.map((label, i) => (
        <g key={label}>
          <rect x={30} y={30 + i * 44} width={340} height={28} rx={4} fill="none" stroke={answer !== null && i === 2 ? C.caramel : C.mocha} strokeWidth={answer !== null && i === 2 ? 1.8 : 1} />
          <T x={40} y={48 + i * 44} s={13} f={answer !== null && i === 2 ? C.caramel : C.latte}>{label}</T>
        </g>
      ))}
    </Svg>
  );
}

// 3 · WorkSpanParallelism
export function WorkSpanParallelism({ t }: StepCtx) {
  const levels = treeLevelPositions();
  const a = easeOut(seg(t, 0.2, 0.9));
  const criticalPath: [number, number][] = [levels[0][0], levels[1][0], levels[2][0], levels[3][0], levels[4][0]].map((p) => [p.x, p.y]);
  return (
    <Svg label="Work, span, and their ratio, off the same tree" h={220}>
      {levels.flatMap((lvl, li) =>
        li === 0
          ? []
          : lvl.map((node, i) => {
              const c1 = levels[li - 1][i * 2];
              const c2 = levels[li - 1][i * 2 + 1];
              return (
                <g key={`${li}-${i}`}>
                  <line x1={c1.x} y1={c1.y} x2={node.x} y2={node.y} stroke={C.mocha} strokeWidth={1} />
                  <line x1={c2.x} y1={c2.y} x2={node.x} y2={node.y} stroke={C.mocha} strokeWidth={1} />
                  <circle cx={node.x} cy={node.y} r={4} fill={C.crema} />
                </g>
              );
            }),
      )}
      {levels[0].map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={3} fill={C.latte} />)}
      <Draw pts={criticalPath} t={t} from={0.1} to={0.7} stroke={C.caramel} w={2} />
      <T x={40} y={210} s={13} f={C.latte} o={a}>work: every addition — span: the longest chain</T>
    </Svg>
  );
}

// 4 · ChainRedraw
export function ChainRedraw({ t }: StepCtx) {
  const n = 8;
  const pts: [number, number][] = Array.from({ length: n }, (_, i) => [50 + i * 60, 110]);
  return (
    <Svg label="The same additions, now one long chain" h={200}>
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={5} fill={C.cherry} opacity={easeOut(seg(t, 0.08 * i, 0.08 * i + 0.3))} />
      ))}
      <Draw pts={pts} t={t} from={0.1} to={0.9} stroke={C.cherryText} w={2} />
      <T x={40} y={170} s={13} f={C.cherryText}>every addition waits on the one before it</T>
    </Svg>
  );
}

// 5 · SortSpanRecurrence
export function SortSpanRecurrence({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1));
  return (
    <Svg label="The span recurrence: the larger half, plus the combine" h={220}>
      <Eq x={40} y={70}>span(n) = span(n / 2) + merge(n)</Eq>
      <T x={40} y={110} s={13} f={C.latte}>two halves sort side by side</T>
      <T x={40} y={135} s={13} f={C.cherryText} o={a}>the merge at the top runs alone, in sequence</T>
      <rect x={40} y={150} width={220} height={16} rx={3} fill={C.taupe} opacity={0.5} />
      <rect x={270} y={150} width={220} height={16} rx={3} fill={C.taupe} opacity={0.5} />
      <rect x={40} y={175} width={450 * a} height={16} rx={3} fill={C.cherry} />
    </Svg>
  );
}

// 6 · SortSpanMeasured
export function SortSpanMeasured({ t }: StepCtx) {
  const sizes = [1, 2, 3, 4, 5]; // relative doublings, drawn as bars
  const spanA = easeOut(seg(t, 0.2, 0.8));
  const workA = easeOut(seg(t, 0.35, 0.95));
  return (
    <Svg label="Span doubles in step; work outgrows it" h={230}>
      <T x={40} y={34} s={13} f={C.latte}>span, each doubling of the input</T>
      {sizes.map((s, i) => (
        <rect key={i} x={40 + i * 90} y={50} width={60} height={14 * s * spanA} fill={C.cinnamon} />
      ))}
      <T x={40} y={150} s={13} f={C.latte}>work, the same doublings</T>
      {sizes.map((s, i) => (
        <rect key={i} x={40 + i * 90} y={166} width={60} height={10 * s * s * workA * 0.4} fill={C.caramel} />
      ))}
      <T x={40} y={212} s={12} f={C.latte}>parallelism (work over span) keeps climbing</T>
    </Svg>
  );
}

// 7 · TwoLaws
export function TwoLaws({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.8));
  return (
    <Svg label="The work law and the span law, both unconditional" h={210}>
      <Eq x={40} y={70}>T(p) ≥ work / p</Eq>
      <T x={40} y={95} s={12} f={C.latte}>the work law — split evenly, at best</T>
      <Eq x={40} y={150} o={a}>T(p) ≥ span</Eq>
      <T x={40} y={175} s={12} f={C.latte} o={a}>the span law — the longest chain, regardless</T>
    </Svg>
  );
}

// 8 · BrentBoundReveal
export function BrentBoundReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1));
  return (
    <Svg label="A greedy schedule's guarantee, within a factor of two" h={210}>
      <Eq x={40} y={70}>T(p) ≤ work / p + span</Eq>
      <T x={40} y={100} s={12} f={C.latte}>never idle while a ready task waits</T>
      <rect x={40} y={120} width={440} height={16} rx={3} fill={C.cocoa} />
      <rect x={40} y={120} width={220 * a} height={16} rx={3} fill={C.caramel} />
      <T x={40} y={160} s={12} f={C.latte} o={a}>within a factor of two of the best any schedule could do</T>
    </Svg>
  );
}

// 9 · BrentBoundMeasured
export function BrentBoundMeasured({ t }: StepCtx) {
  const workers = ['one', 'a few', 'more', 'many'];
  const steps = [1.0, 0.55, 0.35, 0.27]; // relative, flattening toward the span
  const a = easeOut(seg(t, 0.2, 0.9));
  return (
    <Svg label="Measured steps track the bound, then flatten" h={220}>
      {workers.map((w, i) => (
        <g key={w}>
          <T x={40} y={40 + i * 40} s={12} f={C.latte}>{w} workers</T>
          <Bar x={160} y={28 + i * 40} w={300 * steps[i] * a} h={16} full={300} fill={i === workers.length - 1 ? C.cherryText : C.caramel} />
        </g>
      ))}
      <T x={40} y={200} s={12} f={C.cherryText} o={a}>flat once the span itself is the limit</T>
    </Svg>
  );
}

// 10 · PredictIdleWorker
export function PredictIdleWorker({ answer }: StepCtx) {
  const opts = ['wait to be handed work', 'shut down and restart later', 'take from a random worker', 'always take from the first worker'];
  return (
    <Svg label="What should an idle worker do" h={240}>
      {opts.map((label, i) => (
        <g key={label}>
          <rect x={30} y={30 + i * 44} width={340} height={28} rx={4} fill="none" stroke={answer !== null && i === 2 ? C.caramel : C.mocha} strokeWidth={answer !== null && i === 2 ? 1.8 : 1} />
          <T x={40} y={48 + i * 44} s={13} f={answer !== null && i === 2 ? C.caramel : C.latte}>{label}</T>
        </g>
      ))}
    </Svg>
  );
}

// 11 · WorkStealingReveal
export function WorkStealingReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1));
  const ownerDeque = [1, 2, 3, 4];
  return (
    <Svg label="Owner works one end; a thief steals the other" h={220}>
      <T x={40} y={36} s={13} f={C.latte}>a worker's own deque</T>
      {ownerDeque.map((v, i) => (
        <rect key={v} x={40 + i * 60} y={50} width={50} height={32} rx={4} fill="none" stroke={i === ownerDeque.length - 1 ? C.caramel : C.latte} strokeWidth={i === ownerDeque.length - 1 ? 1.6 : 1} />
      ))}
      <T x={40} y={100} s={11} f={C.latte}>owner pops here (bottom)</T>
      <T x={260} y={100} s={11} f={C.cherryText} o={a}>thief steals here (top)</T>
      <circle cx={70} cy={160} r={6} fill={C.cherryText} opacity={a} />
      <T x={90} y={165} s={12} f={C.cherryText} o={a}>idle worker, picking a victim at random</T>
    </Svg>
  );
}

// 12 · WorkStealingBound
export function WorkStealingBound({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1));
  return (
    <Svg label="The same bound shape, with no coordinator" h={200}>
      <Eq x={40} y={70}>expected T(p) = work / p + O(span)</Eq>
      <T x={40} y={100} s={12} f={C.latte}>for a fully strict computation</T>
      <T x={40} y={140} s={12} f={C.latte} o={a}>no central queue, no coordinator — just random steals</T>
    </Svg>
  );
}

// 13 · StealsSimulated
export function StealsSimulated({ t }: StepCtx) {
  const workers = ['one', 'two', 'four', 'eight', 'sixteen'];
  const stealShare = [0, 0.07, 0.12, 0.14, 0.15];
  const a = easeOut(seg(t, 0.2, 0.9));
  return (
    <Svg label="Steals rise with worker count, never dominate" h={230}>
      {workers.map((w, i) => (
        <g key={w}>
          <T x={40} y={38 + i * 36} s={12} f={C.latte}>{w} workers</T>
          <Bar x={160} y={26 + i * 36} w={300 * stealShare[i] * 5 * a} h={14} full={300} fill={C.cherryText} />
        </g>
      ))}
      <T x={40} y={212} s={12} f={C.latte}>stolen share of the total work, small even at the top</T>
    </Svg>
  );
}

// 14 · RealSystems
export function RealSystems({ t }: StepCtx) {
  const rows = ['Cilk — the original design', 'Rayon join — the same protocol in Rust', 'Tokio — steals too, for a different task shape'];
  return (
    <Svg label="One algorithm, three real systems" h={220}>
      {rows.map((label, i) => {
        const a = easeOut(seg(t, 0.15 + i * 0.22, 0.5 + i * 0.22));
        return (
          <g key={label} opacity={a}>
            <rect x={40} y={40 + i * 55} width={460} height={34} rx={4} fill="none" stroke={i === 2 ? C.cinnamon : C.latte} strokeWidth={1.3} />
            <T x={50} y={62 + i * 55} s={13} f={i === 2 ? C.cinnamon : C.crema}>{label}</T>
          </g>
        );
      })}
    </Svg>
  );
}

// 15 · WhatWasNotBuilt
export function WhatWasNotBuilt({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1));
  return (
    <Svg label="The owner-thief race, named and not built" h={200}>
      <rect x={200} y={70} width={100} height={40} rx={4} fill="none" stroke={C.cherryText} strokeWidth={1.4} />
      <T x={215} y={94} s={12} f={C.cherryText}>last task</T>
      <T x={40} y={140} s={12} f={C.latte} o={a}>owner and thief both reach for it</T>
      <T x={40} y={165} s={12} f={C.latte} o={a}>a later chapter's compare-and-swap</T>
    </Svg>
  );
}

// 16 · Recap
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1));
  return (
    <Svg label="One machine analysed — next, many machines" h={220}>
      <rect x={40} y={60} width={220} height={60} rx={4} fill="none" stroke={C.caramel} strokeWidth={1.3} />
      <T x={60} y={95} s={13} f={C.caramel}>work, span, work stealing</T>
      <T x={40} y={150} s={14} f={C.latte} o={a}>many machines, a new cost</T>
      <T x={40} y={180} s={13} f={C.latte}>one memory, shared for free — until it isn't</T>
    </Svg>
  );
}
