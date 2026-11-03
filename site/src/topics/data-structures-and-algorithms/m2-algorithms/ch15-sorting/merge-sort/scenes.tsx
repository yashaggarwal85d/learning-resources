import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md style, carried from Chapter 15's own grammar): crema = a key or
// value; latte = secondary labels (a count, an index); taupe = memory not yet touched; caramel
// = the thing to look at (the pointer being compared, the array slot being filled); cinnamon
// (rare) = the alternative being compared (bottom-up beside top-down; the perfectly interleaved
// merge beside the best case); cherry/cherryText = the broken (unstable) outcome. The chapter's
// own 16-key deck (examples.py, fixed in topic 48): [7,3,9,3,1,12,5,6,8,9,10,11,4,2,3,13].

const DECK = [7, 3, 9, 3, 1, 12, 5, 6, 8, 9, 10, 11, 4, 2, 3, 13];

function KeyBar({ x, y, v, w = 28, color = C.crema, highlight = false }: { x: number; y: number; v: number | string; w?: number; color?: string; highlight?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={22} rx={3} fill="none" stroke={highlight ? C.caramel : color} strokeWidth={highlight ? 1.8 : 1.1} />
      <T x={x + w / 2} y={y + 16} s={12} f={highlight ? C.caramel : color} a="middle">{v}</T>
    </g>
  );
}

// 1 · Opening: two sorted eight-key rows, flowing toward one merged row, cost unknown yet.
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.4));
  const left = [1, 3, 5, 7, 9, 11, 13, 15];
  const right = [2, 4, 6, 8, 10, 12, 14, 16];
  return (
    <Svg label="Two sorted rows of eight keys each, flowing toward one merged row, with the comparison count left open" h={280}>
      {left.map((v, i) => <KeyBar key={`l${i}`} x={40 + i * 34} y={40} v={v} />)}
      {right.map((v, i) => <KeyBar key={`r${i}`} x={40 + i * 34} y={90} v={v} />)}
      <T x={30} y={150} s={13} f={C.latte} o={a}>how many comparisons to merge these into one row?</T>
      <T x={300} y={200} s={18} f={C.caramel} a="middle" o={0.7 + 0.3 * Math.sin(t * 3)}>?</T>
    </Svg>
  );
}

// 2 · PredictMergeBest: [1..8] and [9..16], the left list entirely smaller.
export function PredictMergeBest({ t, answer }: StepCtx) {
  const left = [1, 2, 3, 4, 5, 6, 7, 8];
  const right = [9, 10, 11, 12, 13, 14, 15, 16];
  return (
    <Svg label="Two sorted rows, one through eight and nine through sixteen, with every key of the first entirely smaller than every key of the second" h={240}>
      {left.map((v, i) => <KeyBar key={`l${i}`} x={40 + i * 34} y={60} v={v} highlight={i === 7} />)}
      {right.map((v, i) => <KeyBar key={`r${i}`} x={40 + i * 34} y={110} v={v} highlight={i === 0} />)}
      {answer !== null && (
        <T x={300} y={180} s={14} f={C.crema} a="middle">eight — the right list is never even touched</T>
      )}
    </Svg>
  );
}

// 3 · MergeProcedure: the two-pointer walk, best case and worst case side by side.
export function MergeProcedure({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  const best = { left: [1, 2, 3, 4, 5, 6, 7, 8], right: [9, 10, 11, 12, 13, 14, 15, 16], cmp: 8 };
  const worst = { left: [1, 3, 5, 7, 9, 11, 13, 15], right: [2, 4, 6, 8, 10, 12, 14, 16], cmp: 15 };
  return (
    <Svg label="Two merges side by side: the best case, costing eight comparisons, and a perfect interleaving costing fifteen" h={260}>
      <T x={30} y={30} s={13} f={C.quiet}>best case</T>
      {best.left.map((v, i) => <KeyBar key={`bl${i}`} x={40 + i * 26} y={40} v={v} w={22} />)}
      {best.right.map((v, i) => <KeyBar key={`br${i}`} x={40 + i * 26} y={68} v={v} w={22} />)}
      <T x={320} y={55} s={14} f={C.caramel}>{best.cmp} comparisons</T>
      <T x={30} y={130} s={13} f={C.quiet} o={a}>worst case — a perfect interleaving</T>
      {worst.left.map((v, i) => <KeyBar key={`wl${i}`} x={40 + i * 26} y={140} v={v} w={22} color={C.cinnamon} />)}
      {worst.right.map((v, i) => <KeyBar key={`wr${i}`} x={40 + i * 26} y={168} v={v} w={22} color={C.cinnamon} />)}
      <T x={320} y={155} s={14} f={C.caramel}>{worst.cmp} comparisons</T>
      <T x={30} y={230} s={13} f={C.latte}>never fewer than the smaller list, never more than one short of both combined</T>
    </Svg>
  );
}

// 4 · TopDown: the recursion tree, a merge at every node.
export function TopDown({ t }: StepCtx) {
  const levels = [
    [DECK.slice(0, 16)],
    [DECK.slice(0, 8), DECK.slice(8, 16)],
    [DECK.slice(0, 4), DECK.slice(4, 8), DECK.slice(8, 12), DECK.slice(12, 16)],
  ];
  return (
    <Svg label="A recursion tree over the sixteen-key deck: split in half, split again, a merge drawn at every node on the way back up" h={260}>
      {levels.map((level, li) => (
        <g key={li} opacity={easeOut(seg(t, 0.2 + li * 0.3, 0.8 + li * 0.3))}>
          {level.map((group, gi) => {
            const w = 560 / level.length;
            const x = 20 + gi * w;
            return (
              <rect key={gi} x={x} y={40 + li * 60} width={w - 8} height={30} rx={3} fill="none" stroke={C.crema} strokeWidth={1.2} />
            );
          })}
          <T x={590} y={60 + li * 60} s={11} f={C.quiet} a="end">{level.length === 1 ? 'whole' : `${level.length} pieces`}</T>
        </g>
      ))}
      <T x={30} y={240} s={13} f={C.latte}>every node is a merge of two already-sorted halves</T>
    </Svg>
  );
}

// 5 · BottomUp: widths 1, 2, 4 sweeping, no recursion.
export function BottomUp({ t }: StepCtx) {
  const widths = [1, 2, 4, 8];
  return (
    <Svg label="Three sweeps across the sixteen-key deck, at widths one, two and four, merging adjacent runs with no recursion at all" h={260}>
      {widths.map((w, wi) => (
        <g key={w} opacity={easeOut(seg(t, 0.15 + wi * 0.25, 0.7 + wi * 0.25))}>
          <T x={20} y={46 + wi * 50} s={12} f={C.quiet}>width {w}</T>
          {Array.from({ length: 16 / w }, (_, i) => (
            <rect key={i} x={80 + i * w * 32} y={34 + wi * 50} width={w * 32 - 4} height={22} rx={3} fill="none" stroke={i % 2 === 0 ? C.caramel : C.crema} strokeWidth={1.2} />
          ))}
        </g>
      ))}
      <T x={30} y={235} s={13} f={C.latte}>one pass per width, doubling, until one run remains</T>
    </Svg>
  );
}

// 6 · PowerOfTwo: equal counts at sixteen, a split at some other size.
export function PowerOfTwo({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.4));
  return (
    <Svg label="Two bars of equal height at sixteen keys (top-down and bottom-up agree); two bars of different height at a non-power-of-two size" h={260}>
      <T x={30} y={30} s={13} f={C.quiet}>sixteen keys</T>
      <rect x={40} y={50} width={50} height={60} fill={C.crema} opacity={0.5 * a} />
      <rect x={100} y={50} width={50} height={60} fill={C.crema} opacity={0.5 * a} />
      <T x={65} y={125} s={11} f={C.quiet} a="middle">top-down</T>
      <T x={125} y={125} s={11} f={C.quiet} a="middle">bottom-up</T>
      <T x={30} y={170} s={13} f={C.quiet}>a non-power-of-two size</T>
      <rect x={40} y={190} width={50} height={40} fill={C.cinnamon} opacity={0.6 * a} />
      <rect x={100} y={190} width={50} height={52} fill={C.cinnamon} opacity={0.6 * a} />
      <T x={65} y={238} s={11} f={C.quiet} a="middle">top-down</T>
      <T x={125} y={238} s={11} f={C.quiet} a="middle">bottom-up</T>
    </Svg>
  );
}

// 7 · StabilityDemo: the tagged merge, stable against unstable.
export function StabilityDemo({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.4));
  return (
    <Svg label="Two equal keys tagged a and b, merged with the ordinary rule keeping them in order, and with the one-character change reversing them" h={260}>
      <T x={30} y={30} s={13} f={C.quiet}>stable merge (&le; on a tie)</T>
      <KeyBar x={40} y={44} v="3a" />
      <KeyBar x={75} y={44} v="3b" />
      <KeyBar x={110} y={44} v="3c" />
      <T x={30} y={110} s={13} f={C.quiet} o={a}>unstable merge (&lt; on a tie)</T>
      <KeyBar x={40} y={124} v="3b" color={C.cherryText} />
      <KeyBar x={75} y={124} v="3c" color={C.cherryText} />
      <KeyBar x={110} y={124} v="3a" color={C.cherryText} />
      <T x={30} y={190} s={13} f={C.latte}>one character, `&lt;=` to `&lt;`, and a and b trade places</T>
    </Svg>
  );
}

// 8 · PredictThreeGuarantees: stable, in place, n log n — pick two.
export function PredictThreeGuarantees({ t, answer }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  const props = ['stable', 'in place', 'Θ(n log n) worst case'];
  return (
    <Svg label="Three properties in a triangle, with a question over whether any real sort achieves all three at once" h={240}>
      {props.map((p, i) => {
        const positions = [{ x: 300, y: 50 }, { x: 150, y: 170 }, { x: 450, y: 170 }];
        return (
          <g key={p} opacity={a}>
            <circle cx={positions[i].x} cy={positions[i].y} r={10} fill="none" stroke={C.crema} strokeWidth={1.4} />
            <T x={positions[i].x} y={positions[i].y - 18} s={13} f={C.crema} a="middle">{p}</T>
          </g>
        );
      })}
      {answer !== null && (
        <T x={300} y={230} s={13} f={C.crema} a="middle">no real sort keeps all three at once</T>
      )}
    </Svg>
  );
}

// 9 · BufferStrategies: full copy, half copy, min(A,B) copy.
export function BufferStrategies({ t }: StepCtx) {
  const rows = [
    { label: 'full copy', size: 16 },
    { label: 'half copy', size: 8 },
    { label: 'min(A, B) copy', size: 8 },
  ];
  const maxV = 16;
  return (
    <Svg label="Three bars showing how much spare memory each buffer strategy copies, from the whole input down to the shorter run" h={260}>
      {rows.map((r, i) => {
        const w = (r.size / maxV) * 300;
        return (
          <g key={r.label} opacity={easeOut(seg(t, 0.2 + i * 0.25, 0.8 + i * 0.25))}>
            <T x={30} y={55 + i * 60} s={13} f={C.latte}>{r.label}</T>
            <rect x={160} y={42 + i * 60} width={w} height={22} fill={C.crema} opacity={0.5} />
          </g>
        );
      })}
      <T x={30} y={230} s={13} f={C.latte}>the identical guarantee, three different amounts of spare memory</T>
    </Svg>
  );
}

// 10 · NaturalMergeSort: runs found, then merged pairwise.
export function NaturalMergeSort({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.4));
  const runs: number[][] = [];
  let cur: number[] = [DECK[0]];
  for (let i = 1; i < DECK.length; i++) {
    if (DECK[i] >= DECK[i - 1]) cur.push(DECK[i]);
    else { runs.push(cur); cur = [DECK[i]]; }
  }
  runs.push(cur);
  return (
    <Svg label="The deck's own runs found in one pass, grouped, ready to be merged pairwise" h={240}>
      {runs.map((run, ri) => {
        const x = 30 + runs.slice(0, ri).reduce((acc, r) => acc + r.length * 26 + 10, 0);
        return (
          <g key={ri} opacity={a}>
            <rect x={x} y={60} width={run.length * 26} height={28} rx={3} fill="none" stroke={ri % 2 === 0 ? C.caramel : C.crema} strokeWidth={1.3} />
            {run.map((v, vi) => <T key={vi} x={x + 13 + vi * 26} y={79} s={11} f={ri % 2 === 0 ? C.caramel : C.crema} a="middle">{v}</T>)}
          </g>
        );
      })}
      <T x={30} y={130} s={13} f={C.latte}>seven runs, found in one linear pass — fewer than one per key</T>
      <T x={30} y={156} s={13} f={C.latte}>sorted input: one run, no merge pass needed at all</T>
    </Svg>
  );
}

// 11 · FiveShapes: random, sorted, reversed run counts.
export function FiveShapes({ t }: StepCtx) {
  const shapes = [
    { name: 'random', runs: 100, max: 200 },
    { name: 'sorted', runs: 1, max: 200 },
    { name: 'reversed', runs: 200, max: 200 },
  ];
  return (
    <Svg label="Three bars at two hundred keys: random with about a hundred runs, sorted with one, reversed with two hundred" h={260}>
      {shapes.map((s, i) => {
        const h = (s.runs / s.max) * 150;
        return (
          <g key={s.name} opacity={easeOut(seg(t, 0.2 + i * 0.25, 0.8 + i * 0.25))}>
            <rect x={60 + i * 150} y={190 - h} width={80} height={h} fill={C.crema} opacity={0.55} />
            <T x={100 + i * 150} y={210} s={13} f={C.quiet} a="middle">{s.name}</T>
          </g>
        );
      })}
      <T x={30} y={30} s={13} f={C.latte}>run count, out of two hundred keys</T>
    </Svg>
  );
}

// 12 · WorstCaseGap: the bar at 17 against the floor at 16, and the gap staying bounded.
export function WorstCaseGap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.4));
  return (
    <Svg label="A bar at seventeen against a hairline floor at sixteen, for eight keys, with a second panel showing the gap staying a small fraction of the input as it grows" h={260}>
      <T x={30} y={30} s={13} f={C.quiet}>eight keys</T>
      <rect x={60} y={50} width={40} height={17 * 8 * a} fill={C.caramel} opacity={0.6} />
      <rect x={30} y={50 + (160 - 16 * 8)} width={160} height={1.5} fill={C.cherryText} />
      <T x={200} y={120} s={12} f={C.quiet}>seventeen against a floor of sixteen</T>
      <T x={30} y={200} s={13} f={C.latte}>brute force confirms every case up to eight keys exactly</T>
      <T x={30} y={226} s={13} f={C.latte}>the gap stays a small, bounded share of the input as it grows</T>
    </Svg>
  );
}

// 13 · Recap: a guarantee, stability, a second array.
export function Recap({ t }: StepCtx) {
  const panels = [
    { l1: 'n log n', l2: 'guaranteed' },
    { l1: 'stable', l2: 'by one rule' },
    { l1: 'a second', l2: 'array, paid' },
  ];
  return (
    <Svg label="Three panels recapping the topic: a guaranteed worst case, stability from one rule, a second array paid for both" h={240}>
      {panels.map((p, i) => (
        <g key={i} opacity={easeOut(seg(t, 0.2 + i * 0.25, 0.8 + i * 0.25))}>
          <circle cx={100 + i * 200} cy={90} r={30} fill="none" stroke={C.crema} strokeWidth={1.4} />
          <T x={100 + i * 200} y={150} s={13} f={C.crema} a="middle">{p.l1}</T>
          <T x={100 + i * 200} y={175} s={13} f={C.crema} a="middle">{p.l2}</T>
        </g>
      ))}
      <T x={300} y={220} s={13} f={C.latte} a="middle">quicksort and partitioning schemes, next</T>
    </Svg>
  );
}
