import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Draw, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = the tree's own live state; latte = labels; caramel = the thing to look at
// (nodes a query uses, a lazy tag, the climbing update); cinnamon = the compared alternative (the Fenwick tree,
// the eager update); cherryText = what can't be done, or the cost paid. The array, the query range [5, 11), the
// tags and the workload are examples.py's own; each tree node is drawn as a bar over the slots it covers, and its
// stored value is never printed, only what examples.py prints.

/** Seconds since the learner answered a predict step (the player's clock has stopped by then), so reveals can animate. */
function useSinceAnswer(on: boolean) {
  const [s, setS] = useState(0);
  useEffect(() => {
    if (!on) {
      setS(0);
      return;
    }
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setS(99);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = () => {
      const d = (performance.now() - t0) / 1000;
      setS(d);
      if (d < 4) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [on]);
  return s;
}

const A = [3, 5, 2, 8, 1, 4, 6, 2, 9, 3, 5, 7, 1, 2, 4];
const N = 15;
const X = (i: number) => 36 + i * 35;
const CW = 31;

// The recursive tree over [0, 15): node v covers [tl, tr), at depth d (examples.py's own split, tm = (tl+tr)//2).
type Node = { v: number; tl: number; tr: number; d: number };
const NODES: Node[] = [];
(function build(v: number, tl: number, tr: number, d: number) {
  NODES.push({ v, tl, tr, d });
  if (tr - tl > 1) {
    const tm = Math.floor((tl + tr) / 2);
    build(2 * v, tl, tm, d + 1);
    build(2 * v + 1, tm, tr, d + 1);
  }
})(1, 0, N, 0);
const INTERNAL = NODES.filter((n) => n.tr - n.tl > 1);
const node = (v: number) => NODES.find((n) => n.v === v)!;
const VISIT = [1, 2, 5, 11, 3, 6]; // query [5, 11): every node it touches, in order
const USED = [11, 6]; // the two fully inside, used whole

/** A node as a bar over the slots it covers; leaves sit on the bottom row with their values. */
function Bar({ n, top = 50, dy = 38, c = C.latte, fill = false, o = 1, k = 1, leafY = 210 }: { n: Node; top?: number; dy?: number; c?: string; fill?: boolean; o?: number; k?: number; leafY?: number }) {
  const leaf = n.tr - n.tl === 1;
  const x0 = X(n.tl);
  const x1 = X(n.tr - 1) + CW;
  const y = leaf ? leafY : top + n.d * dy;
  const w = (x1 - x0) * k;
  return (
    <g opacity={o}>
      <rect x={(x0 + x1) / 2 - w / 2} y={y} width={Math.max(0, w)} height={22} rx={3} fill={fill ? c : C.roast} stroke={c} strokeWidth={fill ? 0 : 1.2} />
      {leaf && <T x={(x0 + x1) / 2} y={y + 16} s={13} f={fill ? C.espresso : C.crema} a="middle">{A[n.tl]}</T>}
    </g>
  );
}

/** A small tag badge (e.g. "+3") sitting on a node's right end. */
function Tag({ x, y, text, o = 1, c = C.caramel }: { x: number; y: number; text: string; o?: number; c?: string }) {
  return (
    <g opacity={o}>
      <rect x={x - 16} y={y - 13} width={32} height={20} rx={10} fill={C.espresso} stroke={c} strokeWidth={1.6} />
      <T x={x} y={y + 2} s={12} f={c} a="middle">{text}</T>
    </g>
  );
}
const tagAt = (v: number, top = 50, dy = 38): [number, number] => {
  const n = node(v);
  return [(X(n.tl) + X(n.tr - 1) + CW) / 2, top + n.d * dy - 4];
};

/** The query bracket under slots [l, r). */
function Bracket({ l, r, y, c = C.caramel, o = 1 }: { l: number; r: number; y: number; c?: string; o?: number }) {
  return <path d={`M ${X(l)} ${y} L ${X(l)} ${y + 8} L ${X(r - 1) + CW} ${y + 8} L ${X(r - 1) + CW} ${y}`} fill="none" stroke={c} strokeWidth={1.8} opacity={o} />;
}

// 1 · Opening. The array. A running-sum strip (the Fenwick tree's one question) draws in with a check. Then two
// asks it can't answer draw in red: the smallest value in a stretch, and +3 across a stretch at once. Then the
// promise: any combine, any range.
export function Opening({ t }: StepCtx) {
  const sum = easeInOut(seg(t, 0.3, 1.0));
  const ask1 = easeOut(seg(t, 1.4, 1.8));
  const ask2 = easeOut(seg(t, 2.2, 2.6));
  const promise = easeOut(seg(t, 3.2, 3.6));
  return (
    <Svg label="The fifteen counts; a running sum, the Fenwick tree's question, works; the smallest value in a stretch and an update across a stretch do not; this topic handles any combine over any range" h={280}>
      {A.map((v, i) => (
        <g key={i}>
          <rect x={X(i)} y={30} width={CW} height={24} rx={3} fill={C.roast} stroke={C.latte} strokeWidth={1} />
          <T x={X(i) + CW / 2} y={47} s={13} f={C.crema} a="middle">{v}</T>
        </g>
      ))}
      <rect x={X(0)} y={70} width={(X(N - 1) + CW - X(0)) * sum} height={12} rx={2} fill={C.cinnamon} />
      <T x={30} y={108} s={13} f={C.cinnamon} o={sum}>running sum</T>
      <Draw pts={[[170, 102], [176, 108], [188, 94]]} t={t} from={1.0} to={1.25} stroke={C.cinnamon} w={2} pen={false} />
      <g opacity={ask1}>
        <rect x={X(5) - 2} y={28} width={X(10) + CW - X(5) + 4} height={28} rx={4} fill="none" stroke={C.cherryText} strokeWidth={1.6} />
        <T x={30} y={148} s={13} f={C.cherryText}>smallest in a stretch?</T>
      </g>
      <Draw pts={[[262, 140], [276, 154]]} t={t} from={1.8} to={1.95} stroke={C.cherryText} w={2} pen={false} />
      <Draw pts={[[276, 140], [262, 154]]} t={t} from={1.95} to={2.1} stroke={C.cherryText} w={2} pen={false} />
      <g opacity={ask2}>
        {[5, 6, 7, 8, 9, 10].map((i) => <T key={i} x={X(i) + CW / 2} y={22} s={12} f={C.cherryText} a="middle">+3</T>)}
        <T x={30} y={182} s={13} f={C.cherryText}>+3 across a stretch?</T>
      </g>
      <Draw pts={[[262, 174], [276, 188]]} t={t} from={2.6} to={2.75} stroke={C.cherryText} w={2} pen={false} />
      <Draw pts={[[276, 174], [262, 188]]} t={t} from={2.75} to={2.9} stroke={C.cherryText} w={2} pen={false} />
      <T x={30} y={240} s={14} f={C.caramel} o={promise}>any combine, any range</T>
    </Svg>
  );
}

// 2 · The tree, built bottom-up. The 15 leaves first, then each level of internal nodes appears as a bar over the
// slots it covers, flashing as it combines its two children: deepest first, root last.
export function TreeReveal({ t }: StepCtx) {
  const leaves = easeOut(seg(t, 0.2, 0.6));
  const lv = (d: number) => easeOut(seg(t, 0.8 + (3 - d) * 0.55, 1.2 + (3 - d) * 0.55));
  const flash = (d: number) => clamp(1 - Math.abs(t - (1.1 + (3 - d) * 0.55)) / 0.3);
  return (
    <Svg label="Fifteen leaves hold the counts; each level of nodes above combines its two children, built from the bottom up to the root" h={270}>
      {NODES.filter((n) => n.tr - n.tl === 1).map((n) => <Bar key={n.v} n={n} c={C.crema} o={leaves} />)}
      {INTERNAL.map((n) => <Bar key={n.v} n={n} c={flash(n.d) > 0.2 ? C.caramel : C.latte} k={lv(n.d)} o={lv(n.d)} />)}
      <T x={30} y={262} s={13} f={C.latte} o={easeOut(seg(t, 3.2, 3.6))}>each bar: its two children, combined</T>
    </Svg>
  );
}

// 3 · Predict. The tree, with the query [5, 11) bracketed under its six leaves, pulsing. How many nodes? After
// answering: the six nodes the query touches are outlined, the two it uses whole are filled.
export function QueryPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  return (
    <Svg label="The tree with a query over slots 5 to 10 bracketed; after answering, the six nodes it touches are outlined and the two it uses whole are filled" h={290}>
      {NODES.map((n) => {
        const j = VISIT.indexOf(n.v);
        const k = answered && j >= 0 ? easeOut(seg(s, 0.2 + j * 0.15, 0.4 + j * 0.15)) : 0;
        return <Bar key={n.v} n={n} c={k > 0 ? C.caramel : C.latte} fill={k > 0 && USED.includes(n.v)} />;
      })}
      <Bracket l={5} r={11} y={240} c={answered ? C.caramel : C.cherryText} o={answered ? 1 : pulse} />
      {!answered && <T x={30} y={282} s={15} f={C.cherryText} o={pulse}>how many nodes?</T>}
      {answered && <T x={30} y={282} s={13} f={C.caramel} o={easeOut(seg(s, 1.3, 1.7))}>6 touched, 2 used whole</T>}
    </Svg>
  );
}

// 4 · The descent. In order: the root straddles the range (split), its left child straddles (split), [3, 7)
// straddles (split), [5, 7) is inside (use it), [7, 15) straddles (split), [7, 11) is inside (use it). Every
// other node dims: never visited. Then the answer: 29.
export function QueryReveal({ t }: StepCtx) {
  const at = (j: number) => 0.3 + j * 0.42;
  const seen = (v: number) => {
    const j = VISIT.indexOf(v);
    return j >= 0 && t >= at(j);
  };
  const done = t >= at(5) + 0.4;
  const ans = easeOut(seg(t, 3.0, 3.4));
  return (
    <Svg label="The query descends: nodes straddling the range are split, nodes inside it are used whole, and everything else is skipped; the six-slot sum is 29" h={300}>
      {NODES.map((n) => {
        const v = seen(n.v);
        const used = USED.includes(n.v) && v;
        return <Bar key={n.v} n={n} c={used ? C.caramel : v ? C.crema : C.latte} fill={used} o={v ? 1 : done ? 0.3 : 0.8} />;
      })}
      <Bracket l={5} r={11} y={240} />
      <T x={30} y={274} s={12} f={C.crema}>outlined: split</T>
      <T x={200} y={274} s={12} f={C.caramel}>filled: used whole</T>
      <T x={410} y={274} s={12} f={C.latte}>faded: skipped</T>
      <T x={30} y={296} s={14} f={C.caramel} o={ans}>sum over [5, 11): 29</T>
    </Svg>
  );
}

// 5 · Swap the operator. The same tree and the same two used nodes; the combine label turns from + to min, and
// the answer turns from 29 to 2, the smallest leaf in the range (ringed).
export function OperatorReveal({ t }: StepCtx) {
  const sw = easeInOut(seg(t, 1.2, 1.8));
  const ring = easeOutBack(seg(t, 2.2, 2.5));
  return (
    <Svg label="The same tree and the same descent; switching the combine from sum to minimum turns the answer from 29 to 2, the smallest leaf in the range" h={300}>
      {NODES.map((n) => {
        const used = USED.includes(n.v);
        const vis = VISIT.includes(n.v);
        return <Bar key={n.v} n={n} c={used ? C.caramel : vis ? C.crema : C.latte} fill={used} o={vis ? 1 : 0.3} />;
      })}
      <Bracket l={5} r={11} y={240} />
      {ring > 0.001 && <rect x={X(7) - 4} y={206} width={CW + 8} height={30} rx={5} fill="none" stroke={C.caramel} strokeWidth={2.2} opacity={clamp(ring)} />}
      <T x={30} y={24} s={13} f={C.latte}>combine:</T>
      <T x={124} y={24} s={14} f={C.crema} o={1 - sw}>+</T>
      <T x={124} y={24} s={14} f={C.caramel} o={sw}>min</T>
      <T x={30} y={290} s={14} f={C.crema} o={1 - sw}>[5, 11): 29</T>
      <T x={30} y={290} s={14} f={C.caramel} o={sw}>[5, 11): 2</T>
      <T x={250} y={290} s={13} f={C.latte} o={easeOut(seg(t, 2.6, 3.0))}>same tree, same descent</T>
    </Svg>
  );
}

// 6 · One flat array. Slots 1..29 in a row: internal nodes 1..14, leaves 15..29. Slot 5's leaf is position 20.
// The update climbs i -> i // 2: 20, 10, 5, 2, 1, each landing combining with its sibling (lit briefly).
export function IterativeReveal({ t }: StepCtx) {
  const SX = (i: number) => 30 + (i - 1) * 18.6;
  const path = [20, 10, 5, 2, 1];
  const at = (j: number) => 0.6 + j * 0.55;
  let dot = SX(20) + 8;
  let dy = 0;
  for (let j = 0; j < 4; j++) {
    if (t >= at(j)) {
      const k = easeInOut(seg(t, at(j), at(j) + 0.4));
      dot = lerp(SX(path[j]) + 8, SX(path[j + 1]) + 8, k);
      dy = Math.sin(Math.PI * k) * 26;
    }
  }
  const landed = (i: number) => {
    const j = path.indexOf(i);
    return j === 0 ? t >= 0.3 : j > 0 && t >= at(j - 1) + 0.4;
  };
  const sib = (i: number) => {
    const j = path.indexOf(i);
    if (j <= 0) return 0;
    return clamp(1 - Math.abs(t - (at(j - 1) + 0.5)) / 0.25);
  };
  return (
    <Svg label="One flat array: internal nodes 1 to 14, leaves 15 to 29; updating slot 5 starts at position 20 and climbs to 10, 5, 2 and 1, combining with each sibling" h={260}>
      <T x={30} y={24} s={13} f={C.latte}>one array, no pointers</T>
      {Array.from({ length: 29 }, (_, k) => k + 1).map((i) => {
        const on = path.includes(i) && landed(i);
        const sb = path.slice(1).some((p) => (p ^ 1) === i) ? Math.max(...path.slice(1).filter((p) => (p ^ 1) === i).map(sib)) : 0;
        return <rect key={i} x={SX(i)} y={110} width={16} height={26} rx={2} fill={on ? C.caramel : sb > 0 ? C.cinnamon : C.roast} stroke={i >= 15 ? C.crema : C.latte} strokeWidth={1} opacity={on || sb > 0 ? 1 : 0.85} />;
      })}
      <path d={`M ${SX(1)} 146 L ${SX(1)} 152 L ${SX(14) + 16} 152 L ${SX(14) + 16} 146`} fill="none" stroke={C.latte} strokeWidth={1.2} />
      <T x={SX(1)} y={172} s={12} f={C.latte}>internal 1-14</T>
      <path d={`M ${SX(15)} 146 L ${SX(15)} 152 L ${SX(29) + 16} 152 L ${SX(29) + 16} 146`} fill="none" stroke={C.crema} strokeWidth={1.2} />
      <T x={SX(15)} y={172} s={12} f={C.crema}>leaves 15-29</T>
      {path.map((i, j) => <T key={i} x={SX(i) + 8} y={98} s={12} f={C.caramel} a="middle" o={landed(i) ? 1 : 0}>{i}</T>)}
      <circle cx={dot} cy={74 - dy} r={6} fill={C.caramel} opacity={t >= 0.3 && t < at(3) + 0.5 ? 1 : 0} />
      <T x={30} y={214} s={13} f={C.crema} o={easeOut(seg(t, 3.0, 3.4))}>climb: i &rarr; i // 2, with its sibling</T>
      <T x={30} y={242} s={13} f={C.latte} o={easeOut(seg(t, 3.5, 3.9))}>same answers as the recursive tree</T>
    </Svg>
  );
}

// 7 · Predict. The tree with [5, 11) bracketed and "+3" over each of its six leaves, pulsing: touch them all? After
// answering: two tags, +3, appear on the two nodes that cover the range exactly; the leaves stay untouched.
export function LazyPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  return (
    <Svg label="The tree with +3 waiting over each of six leaves; after answering, the update becomes two +3 tags on the two nodes that cover the range, and no leaf is touched" h={290}>
      {NODES.map((n) => <Bar key={n.v} n={n} c={answered && USED.includes(n.v) ? C.caramel : C.latte} />)}
      {[5, 6, 7, 8, 9, 10].map((i) => <T key={i} x={X(i) + CW / 2} y={200} s={12} f={C.cherryText} a="middle" o={answered ? 0.2 : pulse}>+3</T>)}
      <Bracket l={5} r={11} y={240} c={answered ? C.caramel : C.cherryText} o={answered ? 1 : pulse} />
      {answered && USED.map((v, j) => {
        const [x, y] = tagAt(v);
        return <Tag key={v} x={x} y={y} text="+3" o={easeOut(seg(s, 0.3 + j * 0.3, 0.6 + j * 0.3))} />;
      })}
      {!answered && <T x={30} y={282} s={15} f={C.cherryText} o={pulse}>touch all six leaves?</T>}
      {answered && <T x={30} y={282} s={13} f={C.caramel} o={easeOut(seg(s, 1.1, 1.5))}>two tags; no leaf touched</T>}
    </Svg>
  );
}

// 8 · The lazy tag's life. The update descends and drops +3 tags on [5, 7) and [7, 11); the leaves beneath wait
// (dimmed). Later a query for slot 5 alone arrives; it must see past [5, 7), so that tag moves down one level,
// split into both children, and only then does the query continue. The other tag never moves.
export function LazyReveal({ t }: StepCtx) {
  const tag = (j: number) => easeOutBack(seg(t, 0.4 + j * 0.4, 0.7 + j * 0.4));
  const wait = easeOut(seg(t, 1.3, 1.7));
  const q = easeOut(seg(t, 2.1, 2.4));
  const push = easeInOut(seg(t, 2.8, 3.5));
  const [px, py] = tagAt(11);
  const kids = [22, 23].map((v) => {
    const n = node(v);
    return [X(n.tl) + CW / 2, 199] as [number, number];
  });
  const under = (i: number) => (i >= 5 && i < 7 ? push < 1 : i >= 7 && i < 11);
  return (
    <Svg label="Two +3 tags land on the nodes covering slots 5 to 10 and the leaves beneath wait; a later query for slot 5 forces one tag down into its two children, and the other tag stays put" h={300}>
      {NODES.map((n) => {
        const leaf = n.tr - n.tl === 1;
        const dim = leaf && under(n.tl) && wait > 0;
        return <Bar key={n.v} n={n} c={USED.includes(n.v) && tag(0) > 0.001 ? C.caramel : C.latte} o={dim ? 1 - 0.6 * wait : 1} />;
      })}
      {tag(0) > 0.001 && push < 1 && <Tag x={px} y={py} text="+3" o={clamp(tag(0))} />}
      {tag(1) > 0.001 && <Tag x={tagAt(6)[0]} y={tagAt(6)[1]} text="+3" o={clamp(tag(1))} />}
      {push > 0 && kids.map(([x, y], j) => <Tag key={j} x={lerp(px, x, push)} y={lerp(py, y, push)} text="+3" />)}
      <T x={30} y={24} s={13} f={C.latte} o={wait}>leaves below a tag: not yet touched</T>
      <g opacity={q}>
        <Bracket l={5} r={6} y={240} c={C.crema} />
        <T x={30} y={262} s={13} f={C.crema}>later: a query for slot 5 alone</T>
      </g>
      <T x={30} y={290} s={13} f={C.caramel} o={easeOut(seg(t, 3.6, 4.0))}>only then does that tag move down</T>
    </Svg>
  );
}

// 9 · Predict. A node with a pending "= 7" (assign) tag; a new "+3" arrives above it. Combine, or one wins? After
// answering: the +3 folds into the assign, which now reads "= 10": 15 slots of 10, sum 150. The other order
// (pending +3, then assign 7) drops the add: sum 105.
export function ComposePredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const fold = answered ? easeInOut(seg(s, 0.3, 0.9)) : 0;
  const other = answered ? easeOut(seg(s, 1.6, 2.0)) : 0;
  return (
    <Svg label="A node with a pending assign-7 tag receives an add of 3; after answering, the add folds into the assign, which becomes assign-10 and sums to 150; in the other order, the assign discards the pending add and sums to 105" h={290}>
      <rect x={60} y={110} width={(X(N - 1) + CW - X(0)) * 0.55} height={24} rx={3} fill={C.roast} stroke={C.latte} strokeWidth={1.2} />
      <T x={60} y={100} s={12} f={C.latte}>node, all 15 slots</T>
      <rect x={200} y={142} width={70} height={26} rx={13} fill={C.espresso} stroke={C.crema} strokeWidth={1.6} />
      {fold < 0.5 ? <T x={235} y={160} s={14} f={C.crema} a="middle" o={1 - 2 * fold}>= 7</T> : <T x={235} y={160} s={14} f={C.caramel} a="middle" o={2 * fold - 1}>= 10</T>}
      <T x={290} y={160} s={12} f={C.latte}>pending assign</T>
      <rect x={200} y={44} width={70} height={26} rx={13} fill={C.espresso} stroke={C.caramel} strokeWidth={1.6} opacity={(answered ? 1 - fold : 1) * (answered ? 1 : pulse)} />
      <T x={235} y={62} s={14} f={C.caramel} a="middle" o={answered ? 1 - fold : pulse}>+3</T>
      <T x={290} y={62} s={12} f={C.latte} o={answered ? 1 - fold : 1}>arriving add</T>
      {answered && <Draw pts={[[235, 74], [235, 138]]} t={s} from={0.1} to={0.4} stroke={C.caramel} w={1.6} pen={false} />}
      {!answered && <T x={30} y={230} s={15} f={C.cherryText} o={pulse}>combine, or one wins?</T>}
      {answered && <T x={30} y={222} s={13} f={C.caramel} o={easeOut(seg(s, 0.9, 1.3))}>add folds in: assign 10, sum = 150</T>}
      {answered && <T x={30} y={250} s={13} f={C.latte} o={other}>other order, add then assign 7: sum = 105</T>}
    </Svg>
  );
}

// 10 · Prove it. examples.py's ten range-adds. Top row (cinnamon): with no lazy tags, each update touches every slot
// in its range, drawn as ten segments end to end: 85 in all. Bottom row (caramel): with lazy tags, each update's own
// touches, drawn the same way: 24.
export function ProveIt({ t }: StepCtx) {
  const eager = [15, 9, 6, 7, 7, 5, 13, 3, 9, 11];
  const lazy = [1, 3, 2, 3, 3, 2, 3, 2, 2, 3];
  const S = 4.4;
  const row = (vals: number[], y: number, c: string, t0: number) => {
    let x = 140;
    return vals.map((v, j) => {
      const k = easeOut(seg(t, t0 + j * 0.12, t0 + 0.12 + j * 0.12));
      const el = <rect key={j} x={x} y={y} width={Math.max(0, v * S * k - 2)} height={20} rx={2} fill={c} opacity={j % 2 ? 0.7 : 1} />;
      x += v * S;
      return el;
    });
  };
  return (
    <Svg label="Ten range-adds: with no lazy tags they touch 85 slots in all, every slot of every range; with lazy tags they touch 24 nodes" h={240}>
      <T x={30} y={24} s={13} f={C.crema}>10 range-adds, 15 slots</T>
      <T x={30} y={70} s={13} f={C.cinnamon}>no tags</T>
      {row(eager, 55, C.cinnamon, 0.3)}
      <T x={140 + 85 * S + 10} y={70} s={13} f={C.cinnamon} o={easeOut(seg(t, 1.5, 1.8))}>85</T>
      <T x={30} y={120} s={13} f={C.caramel}>lazy tags</T>
      {row(lazy, 105, C.caramel, 1.9)}
      <T x={140 + 24 * S + 10} y={120} s={13} f={C.caramel} o={easeOut(seg(t, 3.1, 3.4))}>24</T>
      <T x={30} y={180} s={13} f={C.latte} o={easeOut(seg(t, 3.4, 3.8))}>one segment per update</T>
    </Svg>
  );
}
