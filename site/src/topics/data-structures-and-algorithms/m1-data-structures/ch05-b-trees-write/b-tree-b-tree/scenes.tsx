import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Draw, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = a page's own stored keys; latte = secondary labels (a
// fill level, a run label); taupe = an empty slot; caramel = the thing to look at (a page about
// to split or merge, a sibling-linked scan path); cinnamon = the alternative being compared
// (the pointer-tree baseline, the naive re-descending scan); cherry = the bad outcome (an
// overflowing page, a scan with no sibling link to follow).
// Pages are drawn at examples.py's order 4: at most three keys, at least one. Keys are drawn as
// marks, not values; every printed number is printed by examples.py (or is topic 24's measured 13).

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

type Pt = [number, number];
const SW = 22; // one slot's width
const PH = 26; // a page's height
const pw = (n: number) => n * SW + 6;

/** A page of n slots at top-left (x, y); keys[i] is the colour of the key in slot i (undefined = empty). */
function Page({ x, y, n = 3, keys = [], f = C.crema, o = 1, dash }: { x: number; y: number; n?: number; keys?: (string | undefined)[]; f?: string; o?: number; dash?: boolean }) {
  if (o <= 0) return null;
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={pw(n)} height={PH} rx={4} fill={C.roast} stroke={f} strokeWidth={1.6} strokeDasharray={dash ? '4 3' : undefined} />
      {Array.from({ length: n }, (_, i) => <rect key={`s${i}`} x={x + 6 + i * SW} y={y + 6} width={SW - 6} height={PH - 12} rx={2} fill="none" stroke={C.mocha} strokeWidth={1} />)}
      {keys.map((c, i) => (c ? <rect key={`k${i}`} x={x + 8 + i * SW} y={y + 8} width={SW - 10} height={PH - 16} rx={2} fill={c} /> : null))}
    </g>
  );
}

/** A key mark on its own (for keys in flight). */
function Key({ p, c, o = 1 }: { p: Pt; c: string; o?: number }) {
  return <rect x={p[0] - (SW - 10) / 2} y={p[1] - (PH - 16) / 2} width={SW - 10} height={PH - 16} rx={2} fill={c} opacity={o} />;
}
const slotC = (x: number, y: number, i: number): Pt => [x + 8 + i * SW + (SW - 10) / 2, y + PH / 2];

function Link({ a, b, f = C.mocha, o = 1, w = 1.3 }: { a: Pt; b: Pt; f?: string; o?: number; w?: number }) {
  if (o <= 0) return null;
  return <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={f} strokeWidth={w} opacity={o} />;
}

const K = C.crema;
const fill = (n: number, c: string = K) => Array.from({ length: n }, () => c);

// 1 · A comparison is not a disk trip. Down last chapter's tall pointer tree, every node visited is its own
// round trip to disk, drawn one after another. Then one wide page arrives: many keys, one trip.
export function Opening({ t }: StepCtx) {
  const N = 7;
  const nodeP = (i: number): Pt => [110 + (i % 2 ? 26 : -26), 48 + i * 30];
  const disk: Pt = [470, 250];
  const trips = clamp(seg(t, 0.4, 2.5)) * N;
  const page = easeOut(seg(t, 2.7, 3.2));
  return (
    <Svg label="Down a pointer tree, every node visited is a separate trip to disk; a disk page holds many keys and costs one trip" h={320}>
      <T x={30} y={24} s={13} f={C.cinnamon}>pointer tree: one node, one trip</T>
      {Array.from({ length: N - 1 }, (_, i) => <Link key={i} a={nodeP(i)} b={nodeP(i + 1)} />)}
      {Array.from({ length: N }, (_, i) => (
        <circle key={i} cx={nodeP(i)[0]} cy={nodeP(i)[1]} r={9} fill={C.roast} stroke={i < trips ? C.cinnamon : C.taupe} strokeWidth={1.8} />
      ))}
      {Array.from({ length: N }, (_, i) => {
        const at = 0.4 + (i / N) * 2.1;
        const k = easeInOut(seg(t, at, at + 0.28));
        if (k <= 0) return null;
        const a = nodeP(i);
        return <path key={i} d={`M ${a[0] + 10} ${a[1]} Q ${(a[0] + disk[0]) / 2} ${a[1] - 10} ${disk[0] - 40} ${disk[1] - 14}`} fill="none" stroke={C.cinnamon} strokeWidth={1.2} strokeDasharray="3 3" opacity={0.25 + 0.75 * (1 - clamp((t - at - 0.3) / 0.6))} />;
      })}
      <rect x={disk[0] - 50} y={disk[1] - 16} width={100} height={36} rx={6} fill={C.cocoa} stroke={C.latte} strokeWidth={1.4} />
      <T x={disk[0]} y={disk[1] + 7} s={13} f={C.latte} a="middle">disk</T>
      {Array.from({ length: N }, (_, i) => <rect key={i} x={250 + i * 14} y={292} width={10} height={14} rx={2} fill={C.cinnamon} opacity={i < Math.floor(trips + 1e-9) ? 1 : 0} />)}
      <T x={30} y={304} s={13} f={C.latte}>trips so far</T>
      <g opacity={page}>
        <T x={296} y={60} s={13} f={C.caramel}>one page: many keys, one trip</T>
        <rect x={330} y={74} width={240} height={30} rx={4} fill={C.roast} stroke={C.caramel} strokeWidth={1.8} />
        {Array.from({ length: 10 }, (_, i) => <rect key={i} x={338 + i * 23} y={82} width={15} height={14} rx={2} fill={C.crema} />)}
        <path d={`M 450 104 L ${disk[0]} ${disk[1] - 16}`} stroke={C.caramel} strokeWidth={1.6} strokeDasharray="3 3" />
      </g>
    </Svg>
  );
}

// 2 · The shape. A three-level B+Tree builds top-down; then the rules light in turn: a dashed line runs under
// every leaf (all at one depth), every page but the root gets a check (at least half full), and one inner page
// shows its two keys routing to three children.
const ROOT: Pt = [255, 34];
const INNER: Pt[] = [[64, 108], [255, 108], [446, 108]];
const LEAF_X = (i: number) => 22 + i * 94;
const LEAF_Y = 190;
const LEAF_N = [2, 3, 1, 2, 2, 3];
const UNDER = [[0, 1], [2, 3], [4, 5]];
export function BTreeShape({ t }: StepCtx) {
  const l0 = easeOut(seg(t, 0.2, 0.5)), l1 = easeOut(seg(t, 0.5, 0.9)), l2 = easeOut(seg(t, 0.9, 1.3));
  const depth = easeInOut(seg(t, 1.5, 2.0));
  const half = t >= 2.2;
  const route = easeOut(seg(t, 2.9, 3.3));
  const mid = (p: Pt, n = 3): Pt => [p[0] + pw(n) / 2, p[1]];
  return (
    <Svg label="A three-level B+Tree: every leaf sits at the same depth, every page except the root is at least half full, and an inner page with two keys has three children" h={320}>
      {INNER.map((p, i) => <Link key={i} a={[mid(ROOT)[0], ROOT[1] + PH]} b={mid(p)} o={l1} f={route > 0 ? C.caramel : C.mocha} w={route > 0 ? 2 : 1.3} />)}
      {UNDER.map((ls, i) => ls.map((l) => <Link key={l} a={[mid(INNER[i])[0], INNER[i][1] + PH]} b={[LEAF_X(l) + pw(3) / 2, LEAF_Y]} o={l2} />))}
      <Page x={ROOT[0]} y={ROOT[1]} keys={fill(2)} o={l0} f={route > 0 ? C.caramel : C.crema} />
      {INNER.map((p, i) => <Page key={i} x={p[0]} y={p[1]} keys={fill(UNDER[i].length - 1)} o={l1} />)}
      {LEAF_N.map((n, i) => <Page key={i} x={LEAF_X(i)} y={LEAF_Y} n={3} keys={fill(n)} o={l2} />)}
      <line x1={20} y1={LEAF_Y + PH + 10} x2={lerp(20, 580, depth)} y2={LEAF_Y + PH + 10} stroke={C.caramel} strokeWidth={1.4} strokeDasharray="5 4" />
      {half && [...INNER.map((p) => [p[0] + pw(3) + 8, p[1] + 6] as Pt), ...LEAF_N.map((_, i) => [LEAF_X(i) + pw(3) - 4, LEAF_Y - 8] as Pt)].map((p, i) => (
        <Draw key={i} pts={[[p[0] - 5, p[1]], [p[0] - 1, p[1] + 4], [p[0] + 6, p[1] - 5]]} t={t} from={2.2 + i * 0.05} to={2.45 + i * 0.05} stroke={C.caramel} w={1.8} pen={false} />
      ))}
      <T x={30} y={256} s={13} f={C.crema} o={easeOut(seg(t, 1.6, 1.9))}>every leaf: the same depth</T>
      <T x={30} y={278} s={13} f={C.crema} o={easeOut(seg(t, 2.2, 2.5))}>every page but the root: at least half full</T>
      <T x={30} y={300} s={13} f={C.caramel} o={route}>an inner page: k keys, k + 1 children</T>
    </Svg>
  );
}

// 3 · Predict: overflow. A leaf already holding its three keys takes a fourth, which hangs off the page's
// end in red. After the answer the leaf splits into two half-full leaves and a copy of the right half's first
// key rises into the parent.
export function SplitPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const sp = answered ? easeInOut(seg(s, 0.2, 0.9)) : 0;
  const up = answered ? easeInOut(seg(s, 0.9, 1.5)) : 0;
  const P: Pt = [250, 60];
  const L: Pt = [lerp(230, 140, sp), 180];
  const Rr: Pt = [lerp(230, 330, sp), 180];
  const pulse = 0.6 + 0.4 * Math.sin(t * 5);
  const copyFrom = slotC(Rr[0], Rr[1], 0);
  const copyTo = slotC(P[0], P[1], 1);
  return (
    <Svg label="A leaf holding its limit of three keys receives a fourth; it splits into two leaves and a copy of one key goes up to the parent" h={320}>
      <T x={30} y={24} s={13} f={C.latte}>this leaf&apos;s limit: three keys</T>
      <Page x={P[0]} y={P[1]} keys={[K, up >= 1 ? C.caramel : undefined]} />
      <Link a={[P[0] + 20, P[1] + PH]} b={[L[0] + pw(3) / 2, L[1]]} />
      {sp > 0 && <Link a={[P[0] + 50, P[1] + PH]} b={[Rr[0] + pw(3) / 2, Rr[1]]} o={sp} />}
      {sp <= 0 ? (
        <>
          <Page x={230} y={180} keys={fill(3)} f={C.cherryText} />
          <Key p={[230 + pw(3) + 14, 193]} c={C.cherryText} o={answered ? 1 : pulse} />
          <rect x={230 + pw(3) + 3} y={182} width={22} height={22} rx={3} fill="none" stroke={C.cherryText} strokeDasharray="3 3" strokeWidth={1.2} />
        </>
      ) : (
        <>
          <Page x={L[0]} y={L[1]} keys={fill(2)} f={C.caramel} />
          <Page x={Rr[0]} y={Rr[1]} keys={[C.caramel, K]} f={C.caramel} />
        </>
      )}
      {up > 0 && up < 1 && <Key p={[lerp(copyFrom[0], copyTo[0], up), lerp(copyFrom[1], copyTo[1], up)]} c={C.caramel} />}
      {!answered && <T x={30} y={290} s={15} f={C.cherryText} o={0.7 + 0.3 * Math.sin(t * 3)}>one key over the limit: what now?</T>}
      {answered && <T x={30} y={270} s={13} f={C.caramel} o={easeOut(seg(s, 1.4, 1.8))}>split in two, a key copied up</T>}
      {answered && <T x={30} y={294} s={13} f={C.latte} o={easeOut(seg(s, 1.7, 2.1))}>both halves: at least half full</T>}
    </Svg>
  );
}

// 4 · The split, all the way up. (a) The overflowing leaf splits and a copy of its middle key rises; the key
// stays in the leaf too. (b) That fills the root past its limit, so the root splits as well, but its middle
// key moves up and leaves the inner page. (c) There was no page above, so a new root appears: one level taller.
export function SplitReveal({ t }: StepCtx) {
  const a = easeInOut(seg(t, 0.3, 1.1));
  const aUp = easeInOut(seg(t, 0.8, 1.4));
  const b = easeInOut(seg(t, 1.8, 2.6));
  const c = easeOutBack(seg(t, 2.6, 3.1));
  const grow = easeInOut(seg(t, 3.1, 3.6));
  const rootY = 110;
  // leaves
  const leafY = 220;
  const lx = [30, 140, 260, lerp(260, 380, a), 470];
  // before the inner split: one root with up to four keys; after: two inner pages
  const rootX = 230;
  const innerL: Pt = [lerp(rootX, 110, b), rootY];
  const innerR: Pt = [lerp(rootX, 380, b), rootY];
  const pushFrom = slotC(rootX, rootY, 2);
  const pushTo: Pt = slotC(255, 30, 0);
  const copyFrom = slotC(lx[3], leafY, 0);
  const copyTo = slotC(rootX, rootY, 3);
  const rootKeys = aUp >= 1 ? [K, K, C.cinnamon, C.caramel] : [K, K, C.cinnamon];
  return (
    <Svg label="A leaf split copies its middle key up; that overfills the root, whose split pushes its middle key up into a brand-new root, making the tree one level taller" h={320}>
      <T x={30} y={24} s={13} f={C.caramel} o={easeOut(seg(t, 0.3, 0.6))}>leaf: copy up</T>
      <T x={30} y={46} s={13} f={C.cinnamon} o={easeOut(seg(t, 1.6, 1.9))}>inner: push up</T>
      <T x={570} y={24} s={13} f={C.caramel} a="end" o={easeOut(seg(t, 3.0, 3.3))}>a new root: one level taller</T>
      {/* edges root -> leaves */}
      {b <= 0 ? (
        lx.map((x, i) => (i === 3 && a <= 0 ? null : <Link key={i} a={[rootX + 10 + Math.min(i, 3) * SW, rootY + PH]} b={[x + pw(3) / 2, leafY]} />))
      ) : (
        <>
          {[0, 1, 2].map((i) => <Link key={i} a={[innerL[0] + 10 + i * SW, rootY + PH]} b={[lx[i] + pw(3) / 2, leafY]} o={b} />)}
          {[3, 4].map((i) => <Link key={i} a={[innerR[0] + 10 + (i - 3) * SW, rootY + PH]} b={[lx[i] + pw(3) / 2, leafY]} o={b} />)}
        </>
      )}
      {lx.map((x, i) => {
        if (i === 3 && a <= 0) return null;
        const keys = i === 2 ? (a > 0 ? fill(2) : fill(3)) : i === 3 ? [C.caramel, K] : fill(i % 2 ? 1 : 2);
        return <Page key={i} x={x} y={leafY} keys={keys} f={i === 2 && a <= 0 ? C.cherryText : i === 2 || i === 3 ? C.caramel : C.crema} />;
      })}
      {a <= 0 && <Key p={[260 + pw(3) + 14, leafY + 13]} c={C.cherryText} />}
      {aUp > 0 && aUp < 1 && <Key p={[lerp(copyFrom[0], copyTo[0], aUp), lerp(copyFrom[1], copyTo[1], aUp)]} c={C.caramel} />}
      {b <= 0 ? (
        <Page x={rootX} y={rootY} n={aUp >= 1 ? 4 : 3} keys={rootKeys} f={aUp >= 1 ? C.cherryText : C.crema} />
      ) : (
        <>
          <Page x={innerL[0]} y={rootY} keys={[K, K]} f={C.cinnamon} />
          <Page x={innerR[0]} y={rootY} keys={[C.caramel]} f={C.cinnamon} />
        </>
      )}
      {b > 0 && c <= 0 && <Key p={[lerp(pushFrom[0], pushTo[0], b), lerp(pushFrom[1], pushTo[1], b)]} c={C.cinnamon} />}
      {c > 0 && (
        <g opacity={clamp(c)}>
          <Link a={[262, 30 + PH]} b={[innerL[0] + pw(3) / 2, rootY]} />
          <Link a={[284, 30 + PH]} b={[innerR[0] + pw(3) / 2, rootY]} />
          <Page x={255} y={30} keys={[C.cinnamon]} f={C.caramel} />
        </g>
      )}
      <line x1={584} y1={leafY + PH} x2={584} y2={lerp(rootY, 30, grow)} stroke={C.caramel} strokeWidth={2} opacity={c > 0 ? 1 : 0} />
      <T x={30} y={300} s={13} f={C.latte} o={easeOut(seg(t, 3.5, 3.9))}>the only way this tree grows taller: at the top</T>
    </Svg>
  );
}

// 5 · Predict: underflow. A leaf's only key is deleted and the page goes empty, outlined red. Its left sibling
// holds three keys, its right sibling one. After the answer, one key slides across from the full sibling and
// the parent's separator updates.
export function MergePredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const gone = easeOut(seg(t, 0.2, 0.8));
  const slide = answered ? easeInOut(seg(s, 0.2, 1.0)) : 0;
  const P: Pt = [244, 50];
  const LX = 60, MX = 244, RX = 428, Y = 170;
  const from = slotC(LX, Y, 2), to = slotC(MX, Y, 0);
  return (
    <Svg label="A delete empties a leaf below its minimum of one key; the left sibling has three keys to spare, so one key moves across" h={320}>
      <T x={30} y={24} s={13} f={C.latte}>this leaf&apos;s minimum: one key</T>
      <Page x={P[0]} y={P[1]} keys={[slide >= 1 ? C.caramel : K, K]} f={slide >= 1 ? C.caramel : C.crema} />
      {[LX, MX, RX].map((x, i) => <Link key={i} a={[P[0] + 10 + i * SW, P[1] + PH]} b={[x + pw(3) / 2, Y]} />)}
      <Page x={LX} y={Y} keys={slide > 0 ? fill(2) : fill(3)} />
      <Page x={MX} y={Y} keys={slide >= 1 ? [C.caramel] : []} f={slide >= 1 ? C.caramel : C.cherryText} dash={slide < 1} />
      {!answered && <Key p={slotC(MX, Y, 0)} c={C.cherryText} o={1 - gone} />}
      {slide > 0 && slide < 1 && <Key p={[lerp(from[0], to[0], slide), lerp(from[1], to[1], slide)]} c={C.caramel} />}
      <Page x={RX} y={Y} keys={fill(1)} />
      <T x={LX + pw(3) / 2} y={Y + 48} s={13} f={C.latte} a="middle">full sibling</T>
      <T x={MX + pw(3) / 2} y={Y + 48} s={13} f={C.cherryText} a="middle">empty</T>
      <T x={RX + pw(3) / 2} y={Y + 48} s={13} f={C.latte} a="middle">at its minimum</T>
      {!answered && <T x={30} y={290} s={15} f={C.cherryText} o={0.7 + 0.3 * Math.sin(t * 3)}>below the minimum: what now?</T>}
      {answered && <T x={30} y={290} s={13} f={C.caramel} o={easeOut(seg(s, 1.1, 1.5))}>borrow if a sibling can spare one, else merge</T>}
    </Svg>
  );
}

// 6 · Borrow, then merge. Top: a sibling with a spare key hands one across; the separator above changes and
// nothing else moves. Bottom: no sibling can spare, so the empty leaf and its sibling combine into one page,
// the parent's separator is deleted, and an emptied root disappears: the tree is one level shorter.
export function MergeReveal({ t }: StepCtx) {
  const bor = easeInOut(seg(t, 0.4, 1.3));
  const m = easeInOut(seg(t, 2.0, 2.8));
  const drop = easeInOut(seg(t, 2.9, 3.6));
  const shrink = easeInOut(seg(t, 3.6, 4.1));
  const bf = slotC(60, 90, 2), bt = slotC(220, 90, 0);
  const mergedX = lerp(330, 380, m);
  return (
    <Svg label="Borrowing moves one key from a sibling and leaves the shape alone; merging combines two leaves, deletes the parent's separator, and can remove an emptied root, making the tree shorter" h={320}>
      <T x={30} y={24} s={13} f={C.caramel}>borrow: one key moves over</T>
      <Page x={140} y={36} keys={[bor >= 1 ? C.caramel : K]} f={bor >= 1 ? C.caramel : C.crema} />
      <Link a={[150, 36 + PH]} b={[60 + pw(3) / 2, 90]} />
      <Link a={[172, 36 + PH]} b={[220 + pw(3) / 2, 90]} />
      <Page x={60} y={90} keys={bor > 0 ? fill(2) : fill(3)} />
      <Page x={220} y={90} keys={bor >= 1 ? [C.caramel] : []} f={bor >= 1 ? C.caramel : C.cherryText} dash={bor < 1} />
      {bor > 0 && bor < 1 && <Key p={[lerp(bf[0], bt[0], bor), lerp(bf[1], bt[1], bor)]} c={C.caramel} />}
      <T x={30} y={146} s={13} f={C.latte} o={easeOut(seg(t, 1.3, 1.6))}>height unchanged</T>

      <T x={330} y={24} s={13} f={C.cherryText} o={easeOut(seg(t, 1.8, 2.1))}>merge: none can spare</T>
      <g opacity={easeOut(seg(t, 1.8, 2.1))}>
        {m < 1 && <Page x={420} y={lerp(40, 40, drop)} keys={[K]} o={1 - drop} />}
        {m < 1 && <Link a={[430, 40 + PH]} b={[330 + pw(3) / 2, 100]} o={1 - m} />}
        {m < 1 && <Link a={[452, 40 + PH]} b={[480 + pw(3) / 2, 100]} o={1 - m} />}
        {m < 1 && <Page x={330} y={100} keys={[K]} />}
        {m < 1 && <Page x={lerp(480, 380, m)} y={100} keys={[]} f={C.cherryText} dash />}
        {m >= 1 && <Page x={mergedX} y={lerp(100, 60, drop)} keys={[K, C.caramel]} f={C.caramel} />}
        {m > 0 && m < 1 && <Key p={[lerp(431, 395, m), lerp(53, 113, m)]} c={C.caramel} />}
        <line x1={572} y1={40} x2={572} y2={lerp(126, 86, shrink)} stroke={C.caramel} strokeWidth={2} opacity={drop > 0 ? 1 : 0} />
      </g>
      <T x={300} y={180} s={13} f={C.latte} o={easeOut(seg(t, 2.8, 3.1))}>separator gone, root emptied</T>
      <T x={30} y={240} s={13} f={C.caramel} o={easeOut(seg(t, 3.7, 4.1))}>a merge is the only move that</T>
      <T x={30} y={262} s={13} f={C.caramel} o={easeOut(seg(t, 3.8, 4.2))}>can make the tree shorter</T>
    </Svg>
  );
}

// 7 · Range scan. A caramel descent goes root, inner, leaf once (three page reads, counted as ticks); then the
// scan streams right along the leaf links, one tick per leaf. A cinnamon ghost shows the alternative: climbing
// back to the root for every next key, which piles up ticks far faster.
export function SiblingScan({ t }: StepCtx) {
  const down = clamp(seg(t, 0.3, 1.2)) * 2;
  const along = clamp(seg(t, 1.4, 3.0)) * 4;
  const reads = Math.floor(down + 1e-9) + 1 * (t >= 0.3 ? 1 : 0) + Math.floor(along + 1e-9);
  const ghost = easeOut(seg(t, 3.0, 3.4));
  const mid = (p: Pt, n = 3): Pt => [p[0] + pw(n) / 2, p[1]];
  const path: Pt[] = [mid(ROOT), mid(INNER[0]), [LEAF_X(1) + pw(3) / 2, LEAF_Y]];
  const segI = Math.min(1, Math.floor(down));
  const ring: Pt = down < 2 ? [lerp(path[segI][0], path[segI + 1][0], down - segI), lerp(path[segI][1] + 13, path[segI + 1][1] + 13, down - segI)] : [LEAF_X(1 + Math.min(3, Math.floor(along))) + pw(3) / 2 + (along - Math.min(3, Math.floor(along))) * 94, LEAF_Y + 13];
  return (
    <Svg label="A range scan descends once to the first leaf, then follows sibling links from leaf to leaf instead of climbing back to the root for each key" h={320}>
      {INNER.map((p, i) => <Link key={i} a={[mid(ROOT)[0], ROOT[1] + PH]} b={mid(p)} f={i === 0 && down > 0 ? C.caramel : C.mocha} w={i === 0 && down > 0 ? 2 : 1.3} />)}
      {UNDER.map((ls, i) => ls.map((l) => <Link key={l} a={[mid(INNER[i])[0], INNER[i][1] + PH]} b={[LEAF_X(l) + pw(3) / 2, LEAF_Y]} f={i === 0 && l === 1 && down > 1 ? C.caramel : C.mocha} w={i === 0 && l === 1 && down > 1 ? 2 : 1.3} />))}
      <Page x={ROOT[0]} y={ROOT[1]} keys={fill(2)} />
      {INNER.map((p, i) => <Page key={i} x={p[0]} y={p[1]} keys={fill(UNDER[i].length - 1)} />)}
      {LEAF_N.map((n, i) => <Page key={i} x={LEAF_X(i)} y={LEAF_Y} keys={fill(n, i >= 1 && i <= 1 + Math.floor(along + 1e-9) && t >= 1.2 ? C.caramel : K)} f={i >= 1 && i <= 1 + Math.floor(along + 1e-9) && t >= 1.2 ? C.caramel : C.crema} />)}
      {LEAF_N.slice(0, 5).map((_, i) => (
        <g key={i}>
          <line x1={LEAF_X(i) + pw(3)} y1={LEAF_Y + 13} x2={LEAF_X(i + 1) - 2} y2={LEAF_Y + 13} stroke={i >= 1 && i < 1 + along ? C.caramel : C.latte} strokeWidth={i >= 1 && i < 1 + along ? 2 : 1.2} />
          <path d={`M ${LEAF_X(i + 1) - 6} ${LEAF_Y + 10} l 4 3 l -4 3`} fill="none" stroke={i >= 1 && i < 1 + along ? C.caramel : C.latte} strokeWidth={1.2} />
        </g>
      ))}
      {t >= 0.3 && t < 3.0 && <circle cx={ring[0]} cy={ring[1]} r={18} fill="none" stroke={C.caramel} strokeWidth={2} />}
      <T x={30} y={256} s={13} f={C.caramel}>page reads</T>
      {Array.from({ length: 7 }, (_, i) => <rect key={i} x={150 + i * 16} y={244} width={11} height={14} rx={2} fill={C.caramel} opacity={i < reads ? 1 : 0} />)}
      <g opacity={ghost}>
        <T x={30} y={284} s={13} f={C.cinnamon}>re-descend per key</T>
        {Array.from({ length: 22 }, (_, i) => <rect key={i} x={210 + i * 16} y={272} width={11} height={14} rx={2} fill={C.cinnamon} opacity={clamp(ghost * 22 - i)} />)}
      </g>
      <T x={30} y={312} s={13} f={C.latte} o={easeOut(seg(t, 3.4, 3.8))}>descend once, then follow the links</T>
    </Svg>
  );
}

// 8 · Fanout from page size. A 8,192-byte page fills with key-plus-pointer cells: fanout 341. Under it, the
// tree for a billion keys is drawn as fans: four levels. A 65,536-byte page widens the fan to 2,730 and the
// same billion keys need only three. All four numbers are examples.py's.
export function FanoutHeight({ t }: StepCtx) {
  const cells = clamp(seg(t, 0.3, 1.3));
  const lv4 = clamp(seg(t, 1.4, 2.2)) * 4;
  const big = easeInOut(seg(t, 2.5, 3.2));
  const lv3 = clamp(seg(t, 2.8, 3.4)) * 3;
  const fan = (cx: number, top: number, levels: number, shown: number, f: string) =>
    Array.from({ length: levels }, (_, i) => {
      const k = clamp(shown - i);
      const y = top + i * 34;
      const w = 30 + (i * 220) / Math.max(1, levels - 1);
      return k > 0 ? <rect key={i} x={cx - (w * k) / 2} y={y} width={w * k} height={22} rx={4} fill="none" stroke={f} strokeWidth={1.6} /> : null;
    });
  return (
    <Svg label="An 8 KB page fits 341 keys and pointers, so a billion keys need four levels; a 64 KB page fits 2,730 and needs three" h={320}>
      <T x={30} y={24} s={13} f={C.crema}>fanout = page / (key + pointer)</T>
      <rect x={30} y={36} width={260} height={26} rx={4} fill={C.roast} stroke={C.caramel} strokeWidth={1.6} />
      {Array.from({ length: 40 }, (_, i) => <rect key={i} x={34 + i * 6.4} y={42} width={4.4} height={14} fill={C.crema} opacity={i < cells * 40 ? 1 : 0} />)}
      <T x={30} y={84} s={13} f={C.latte}>8,192 B page, 16 B key</T>
      <T x={30} y={104} s={13} f={C.caramel} o={easeOut(seg(t, 1.2, 1.5))}>fanout 341</T>
      {fan(160, 124, 4, lv4, C.caramel)}
      <T x={30} y={290} s={13} f={C.caramel} o={easeOut(seg(t, 2.1, 2.4))}>a billion keys: height 4</T>
      <g opacity={easeOut(seg(t, 2.4, 2.7))}>
        <rect x={320} y={36} width={lerp(130, 250, big)} height={26} rx={4} fill={C.roast} stroke={C.cinnamon} strokeWidth={1.6} />
        <T x={320} y={84} s={13} f={C.latte}>65,536 B page, 16 B key</T>
        <T x={320} y={104} s={13} f={C.cinnamon} o={easeOut(seg(t, 3.0, 3.3))}>fanout 2,730</T>
        {fan(450, 124, 3, lv3, C.cinnamon)}
        <T x={320} y={290} s={13} f={C.cinnamon} o={easeOut(seg(t, 3.3, 3.6))}>height 3</T>
      </g>
      <T x={30} y={314} s={13} f={C.latte} o={easeOut(seg(t, 3.5, 3.9))}>height: log of the keys, base fanout</T>
    </Svg>
  );
}

// 9 · The same 200 keys, counted in disk trips. Each block is one page read for a single search: the red-black
// tree of topic 24 reads one node per level, 13 blocks; this topic's order-4 B+Tree, 5. A realistic page
// shortens it again (drawn, not counted).
export function IOComparison({ t }: StepCtx) {
  const a = clamp(seg(t, 0.3, 1.7)) * 13;
  const b = clamp(seg(t, 1.9, 2.6)) * 5;
  const c = easeOut(seg(t, 2.9, 3.3));
  const row = (y: number, n: number, shown: number, f: string) => Array.from({ length: n }, (_, i) => <rect key={i} x={30 + i * 30} y={y} width={24} height={24} rx={3} fill={f} opacity={i < Math.floor(shown + 1e-9) ? 1 : 0} />);
  return (
    <Svg label="One search over the same 200 keys: 13 disk reads through a red-black tree, 5 through an order-4 B+Tree, fewer still with a realistic page" h={320}>
      <T x={30} y={30} s={13} f={C.cinnamon}>red-black tree (topic 24): a read per level</T>
      {row(42, 13, a, C.cinnamon)}
      <T x={430} y={90} s={14} f={C.cinnamon} o={easeOut(seg(t, 1.6, 1.9))}>13 reads</T>
      <T x={30} y={126} s={13} f={C.caramel} o={easeOut(seg(t, 1.8, 2.1))}>B+Tree, order 4: a read per page</T>
      {row(138, 5, b, C.caramel)}
      <T x={190} y={156} s={14} f={C.caramel} o={easeOut(seg(t, 2.5, 2.8))}>5 reads</T>
      <T x={30} y={216} s={13} f={C.crema} o={c}>a realistic page: fewer still</T>
      <rect x={30} y={228} width={24} height={24} rx={3} fill={C.crema} opacity={c} />
      <rect x={60} y={228} width={24} height={24} rx={3} fill="none" stroke={C.crema} strokeDasharray="3 3" opacity={c} />
      <T x={30} y={300} s={13} f={C.latte} o={easeOut(seg(t, 3.3, 3.7))}>same keys, same order, a fraction of the trips</T>
    </Svg>
  );
}

// 10 · Prove it: examples.py's own counts. Build: 200 keys at order 4, height 5, 120 splits. Delete 60: 4
// borrows, 2 merges, invariants checked after each. Scan of 21 keys: 15 page reads against 105 re-descending,
// bars to scale. A billion keys on an 8 KB page: fanout 341, height 4.
export function ProveIt({ t }: StepCtx) {
  const sc = easeInOut(seg(t, 1.6, 2.6));
  const o = (a: number) => easeOut(seg(t, a, a + 0.3));
  return (
    <Svg label="Measured: 200 keys at order 4 reach height 5 with 120 splits; 60 deletes needed 4 borrows and 2 merges; a 21-key range scan read 15 pages versus 105 re-descending; a billion keys on 8 KB pages: fanout 341, height 4" h={320}>
      <T x={30} y={26} s={13} f={C.crema} o={o(0.2)}>200 keys, order 4: height 5</T>
      <T x={30} y={48} s={13} f={C.latte} o={o(0.4)}>120 splits while building</T>
      <T x={330} y={26} s={13} f={C.crema} o={o(0.7)}>60 deletes</T>
      <T x={330} y={48} s={13} f={C.caramel} o={o(0.9)}>4 borrows, 2 merges</T>
      <T x={330} y={70} s={13} f={C.latte} o={o(1.1)}>rules held after each</T>
      <T x={30} y={112} s={13} f={C.crema} o={o(1.4)}>range scan, 21 keys</T>
      <rect x={30} y={124} width={(15 / 105) * 520 * sc} height={18} rx={2} fill={C.caramel} />
      <T x={30 + (15 / 105) * 520 + 8} y={138} s={13} f={C.caramel} o={o(2.4)}>15 reads, linked</T>
      <rect x={30} y={150} width={520 * sc} height={18} rx={2} fill={C.cinnamon} />
      <T x={30} y={190} s={13} f={C.cinnamon} o={o(2.5)}>105 reads, re-descending per key</T>
      <T x={30} y={236} s={13} f={C.crema} o={o(2.9)}>a billion keys, 8,192 B pages</T>
      <T x={30} y={258} s={13} f={C.caramel} o={o(3.1)}>fanout 341, height 4</T>
      <T x={30} y={300} s={13} f={C.latte} o={o(3.5)}>every count from one run of examples.py</T>
    </Svg>
  );
}
