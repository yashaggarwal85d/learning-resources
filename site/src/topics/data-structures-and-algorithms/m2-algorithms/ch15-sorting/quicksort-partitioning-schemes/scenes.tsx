import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg, fmt } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (DESIGN.md, carried from this chapter's own earlier topics): crema = a key or
// value; latte = secondary labels (a count, an index); taupe = memory not yet touched; caramel
// (the focus colour) = the pivot or the pointer being compared; cinnamon (rare) = the alternative
// scheme shown beside the one in focus (Hoare beside Lomuto, random beside median-of-three);
// cherry/cherryText = the bad outcome (the quadratic blow-up).

const DECK = [7, 3, 9, 3, 1, 12, 5, 6, 8, 9, 10, 11, 4, 2, 3, 13];

function Bar({ x, y, v, w = 30, color = C.crema, highlight = false }: { x: number; y: number; v: number | string; w?: number; color?: string; highlight?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={22} rx={3} fill="none" stroke={highlight ? C.caramel : color} strokeWidth={highlight ? 1.8 : 1.1} />
      <T x={x + w / 2} y={y + 16} s={12} f={highlight ? C.caramel : color} a="middle">{v}</T>
    </g>
  );
}

// 1 · Opening: 1,024 equal keys, three partition rules, three wildly different counts.
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.4));
  const equalRow = Array.from({ length: 14 }, () => 7);
  return (
    <Svg label="A row of fourteen equal keys, with Lomuto's comparison count towering over three-way's own" h={280}>
      {equalRow.map((v, i) => <Bar key={i} x={40 + i * 36} y={40} v={v} />)}
      <T x={30} y={110} s={13} f={C.latte}>all equal: nothing to move</T>
      <rect x={40} y={140} width={520 * a} height={16} fill={C.cherry} opacity={0.9} />
      <T x={40} y={175} s={13} f={C.cherryText}>Lomuto: 523,776</T>
      <rect x={40} y={195} width={520 * a * (1024 / 523776)} height={16} fill={C.cinnamon} opacity={0.9} />
      <T x={40} y={230} s={13} f={C.cinnamon}>three-way: 1,024</T>
    </Svg>
  );
}

// 2 · PredictLomutoEqual
export function PredictLomutoEqual({ t, answer }: StepCtx) {
  const row = Array.from({ length: 16 }, () => 7);
  return (
    <Svg label="Sixteen equal keys, asking how many comparisons Lomuto partitioning spends sorting them" h={240}>
      {row.map((v, i) => <Bar key={i} x={30 + i * 34} y={60} v={v} highlight={i === row.length - 1} />)}
      <T x={30} y={120} s={13} f={C.latte}>every key equals the pivot</T>
      {answer !== null && (
        <T x={30} y={160} s={14} f={C.crema}>523,776 comparisons</T>
      )}
    </Svg>
  );
}

// 3 · PartitionContract
export function PartitionContract({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  return (
    <Svg label="A range split into smaller, pivot and larger bands, the contract every partition scheme satisfies" h={240}>
      <rect x={40} y={50} width={130 * a} height={30} fill="none" stroke={C.crema} strokeWidth={1.2} />
      <T x={40} y={100} s={12} f={C.latte}>smaller</T>
      <rect x={190} y={50} width={40} height={30} fill="none" stroke={C.caramel} strokeWidth={1.8} />
      <T x={185} y={100} s={12} f={C.caramel}>pivot</T>
      <rect x={250} y={50} width={130 * a} height={30} fill="none" stroke={C.crema} strokeWidth={1.2} />
      <T x={250} y={100} s={12} f={C.latte}>larger</T>
      <T x={30} y={150} s={13} f={C.quiet}>rearrange around a pivot</T>
      <T x={30} y={175} s={13} f={C.quiet}>then pick how to choose it</T>
    </Svg>
  );
}

// 4 · Lomuto: one scan, boundary index, last-element pivot.
export function Lomuto({ t }: StepCtx) {
  const a = seg(t, 0.2, 1.4);
  const bound = Math.min(DECK.length - 1, Math.floor(a * 10));
  return (
    <Svg label="Lomuto's partition: a boundary index sweeping left to right, the last key as pivot" h={260}>
      {DECK.map((v, i) => <Bar key={i} x={20 + i * 36} y={60} v={v} color={i < bound ? C.cinnamon : C.crema} highlight={i === DECK.length - 1} />)}
      <T x={20 + bound * 36} y={50} s={13} f={C.caramel}>boundary</T>
      <T x={20} y={120} s={13} f={C.latte}>one scan, one boundary</T>
      <T x={20} y={150} s={13} f={C.quiet}>about n comparisons</T>
    </Svg>
  );
}

// 5 · Hoare: two indices walking inward, middle-element pivot.
export function Hoare({ t }: StepCtx) {
  const a = seg(t, 0.2, 1.4);
  const steps = Math.floor(a * 6);
  const i = 1 + steps;
  const j = DECK.length - 2 - steps;
  const mid = Math.floor(DECK.length / 2);
  return (
    <Svg label="Hoare's partition: two indices closing in from both ends, the middle key as pivot" h={260}>
      {DECK.map((v, idx) => <Bar key={idx} x={20 + idx * 36} y={60} v={v} highlight={idx === mid} />)}
      {i < j && <T x={20 + i * 36} y={50} s={13} f={C.cinnamon}>i→</T>}
      {i < j && <T x={20 + j * 36} y={50} s={13} f={C.cinnamon}>←j</T>}
      <T x={20} y={120} s={13} f={C.latte}>stops on equal keys</T>
      <T x={20} y={150} s={13} f={C.quiet}>fewer swaps than Lomuto</T>
    </Svg>
  );
}

// 6 · StackBound: recurse on the smaller side, loop on the larger.
export function StackBound({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  const depthBound = 22;
  const measured = 0;
  return (
    <Svg label="A bar for the recursion depth bound against the depth actually measured on sorted input" h={280}>
      <rect x={60} y={40} width={24} height={depthBound * 6 * a} fill="none" stroke={C.latte} strokeWidth={1.2} />
      <T x={72} y={40 + depthBound * 6 + 20} s={12} f={C.latte} a="middle">bound: 22</T>
      <rect x={170} y={40 + (depthBound - measured) * 6 * a} width={24} height={measured * 6 * a + 2} fill={C.caramel} />
      <T x={182} y={40 + depthBound * 6 + 20} s={12} f={C.caramel} a="middle">measured: 0</T>
      <T x={20} y={250} s={13} f={C.quiet}>recurse small, loop large</T>
      <T x={20} y={275} s={13} f={C.quiet}>the stack stays bounded</T>
    </Svg>
  );
}

// 7 · RandomPivot: measured average against the formula.
export function RandomPivot({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  const formula = 10986;
  const measured = 10977;
  const scale = 240 / formula;
  return (
    <Svg label="Two bars, nearly equal: the measured average comparisons for a random pivot and the formula's own value" h={240}>
      <rect x={60} y={60} width={formula * scale * a} height={22} fill="none" stroke={C.latte} strokeWidth={1.2} />
      <T x={60} y={100} s={13} f={C.latte}>formula: {fmt(formula)}</T>
      <rect x={60} y={120} width={measured * scale * a} height={22} fill={C.caramel} opacity={0.85} />
      <T x={60} y={160} s={13} f={C.caramel}>measured: {fmt(measured)}</T>
      <T x={60} y={200} s={13} f={C.quiet}>a promise about the average</T>
    </Svg>
  );
}

// 8 · MedianOfThree: cheap on sorted and reversed input.
export function MedianOfThree({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  const sortedCmp = 1802;
  const reversedCmp = 2857;
  const ceiling = 4096;
  const scale = 260 / ceiling;
  return (
    <Svg label="Median-of-three's own measured comparison counts on sorted and reversed input, both far under a loose ceiling" h={240}>
      <rect x={60} y={50} width={ceiling * scale} height={14} fill="none" stroke={C.mocha} strokeWidth={1} />
      <T x={60} y={40} s={12} f={C.quiet}>loose ceiling: {fmt(ceiling)}</T>
      <rect x={60} y={80} width={sortedCmp * scale * a} height={18} fill={C.crema} />
      <T x={60} y={112} s={13} f={C.crema}>sorted: {fmt(sortedCmp)}</T>
      <rect x={60} y={130} width={reversedCmp * scale * a} height={18} fill={C.cinnamon} />
      <T x={60} y={162} s={13} f={C.cinnamon}>reversed: {fmt(reversedCmp)}</T>
    </Svg>
  );
}

// 9 · PredictMo3Killer
export function PredictMo3Killer({ t, answer }: StepCtx) {
  return (
    <Svg label="A sorted run and a reversed run, both already shown safe, asking whether anything defeats median-of-three" h={240}>
      <T x={20} y={60} s={14} f={C.latte}>sorted and reversed</T>
      <T x={20} y={85} s={14} f={C.latte}>both stayed cheap.</T>
      <T x={20} y={115} s={14} f={C.latte}>is anything unsafe?</T>
      {answer !== null && (
        <>
          <T x={20} y={160} s={14} f={C.crema}>yes — but it takes</T>
          <T x={20} y={185} s={14} f={C.crema}>two sorted runs, not one</T>
        </>
      )}
    </Svg>
  );
}

// 10 · Mo3Killer: two ascending runs concatenated, quadratic growth.
export function Mo3Killer({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.3));
  const low = Array.from({ length: 8 }, (_, i) => i * 2);
  const high = Array.from({ length: 8 }, (_, i) => i * 2 + 1);
  const ratios = [0.258, 0.254, 0.252, 0.251];
  const ns = [128, 256, 512, 1024];
  return (
    <Svg label="Two ascending runs placed end to end, and the measured cost divided by n squared staying flat across four sizes" h={300}>
      {low.map((v, i) => <Bar key={`l${i}`} x={20 + i * 34} y={30} v={v} w={28} />)}
      {high.map((v, i) => <Bar key={`h${i}`} x={20 + i * 34} y={60} v={v} w={28} color={C.cinnamon} />)}
      <T x={20} y={100} s={12} f={C.quiet}>two sorted runs, joined</T>
      {ns.map((n, i) => (
        <g key={n}>
          <rect x={60 + i * 120} y={140} width={30} height={ratios[i] * 300 * a} fill={C.cherry} />
          <T x={60 + i * 120 + 15} y={160 + ratios[i] * 300} s={11} f={C.cherryText} a="middle">{n}</T>
        </g>
      ))}
      <T x={20} y={280} s={12} f={C.quiet}>cost ÷ n² stays near 0.25</T>
    </Svg>
  );
}

// 11 · ThreeWay: Dutch national flag, three bands filling.
export function ThreeWay({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.3));
  const less = 4, equal = 5, greater = 7;
  const scale = 360 / DECK.length;
  return (
    <Svg label="Three coloured bands filling from both ends: less than the pivot, equal to it, and greater than it" h={240}>
      <rect x={20} y={70} width={less * scale * a} height={26} fill={C.crema} opacity={0.85} />
      <rect x={20 + less * scale} y={70} width={equal * scale * a} height={26} fill={C.caramel} opacity={0.9} />
      <rect x={20 + (less + equal) * scale} y={70} width={greater * scale * a} height={26} fill={C.cinnamon} opacity={0.75} />
      <T x={20} y={60} s={12} f={C.latte}>lt</T>
      <T x={20 + less * scale} y={60} s={12} f={C.caramel}>eq</T>
      <T x={20 + (less + equal) * scale} y={60} s={12} f={C.cinnamon}>gt</T>
      <T x={20} y={130} s={13} f={C.quiet}>four values: sharp fall</T>
      <T x={20} y={155} s={13} f={C.quiet}>no duplicates: more swaps</T>
    </Svg>
  );
}

// 12 · DualPivot: named from the JDK's own source and papers.
export function DualPivot({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  return (
    <Svg label="Two pivots splitting a range into three parts, with the JDK's own depth limit and fallback named" h={280}>
      <rect x={20} y={60} width={140 * a} height={26} fill="none" stroke={C.crema} strokeWidth={1.2} />
      <rect x={160} y={60} width={40} height={26} fill="none" stroke={C.caramel} strokeWidth={1.8} />
      <rect x={200} y={60} width={140 * a} height={26} fill="none" stroke={C.crema} strokeWidth={1.2} />
      <rect x={340} y={60} width={40} height={26} fill="none" stroke={C.caramel} strokeWidth={1.8} />
      <rect x={380} y={60} width={140 * a} height={26} fill="none" stroke={C.crema} strokeWidth={1.2} />
      <T x={20} y={120} s={12} f={C.latte}>JDK's own sort</T>
      <T x={20} y={145} s={12} f={C.latte}>depth limit, heapsort</T>
      <T x={20} y={190} s={13} f={C.quiet}>1.9n ln n vs 2.0n ln n</T>
      <T x={20} y={215} s={13} f={C.quiet}>3 pivots: 7-8% faster</T>
    </Svg>
  );
}

// 13 · BlockPartition: branchless block partitioning, named only.
export function BlockPartition({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.3));
  const blocks = Array.from({ length: 8 }, (_, i) => i);
  return (
    <Svg label="A fixed block of comparison outcomes written into a buffer before any swap happens" h={280}>
      {blocks.map((i) => (
        <rect key={i} x={30 + i * 34} y={50} width={28} height={18 * a} fill={i % 3 === 0 ? C.caramel : C.cocoa} stroke={C.mocha} />
      ))}
      <T x={30} y={100} s={12} f={C.latte}>outcomes, then swaps</T>
      <T x={30} y={125} s={13} f={C.quiet}>no branch on the result</T>
      <T x={30} y={165} s={13} f={C.quiet}>bound: ε n log n + O(n)</T>
      <T x={30} y={190} s={13} f={C.quiet}>80% faster than std::sort</T>
    </Svg>
  );
}

// 14 · Recap: the three all-equal counts on a log-scaled bar.
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.3));
  const counts = [
    { label: 'Lomuto', v: 523776, color: C.cherry, text: C.cherryText },
    { label: 'Hoare', v: 12286, color: C.cinnamon, text: C.cinnamon },
    { label: 'three-way', v: 1024, color: C.caramel, text: C.caramel },
  ];
  const maxLog = Math.log10(523776);
  return (
    <Svg label="The three all-equal-keys comparison counts on a log-scaled bar: Lomuto towering over Hoare and three-way" h={260}>
      {counts.map((c, i) => (
        <g key={c.label}>
          <rect x={60} y={50 + i * 50} width={480 * (Math.log10(c.v) / maxLog) * a} height={22} fill={c.color} opacity={0.85} />
          <T x={60} y={50 + i * 50 + 36} s={13} f={c.text}>{c.label}: {fmt(c.v)}</T>
        </g>
      ))}
      <T x={20} y={230} s={13} f={C.quiet}>no rule is free of an unlucky input</T>
    </Svg>
  );
}
