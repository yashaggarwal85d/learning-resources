import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): caramel = the mechanism in focus; cinnamon = the compared
// alternative (double hashing, the next topic's preview); cherry = the one failure/discard frame
// (clustering, the worst case). At most two accents per step.

function cell(x: number, y: number, w: number, h: number, colour = C.crema, opacity = 1) {
  return <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} rx={3} fill="none" stroke={colour} strokeWidth={1.4} opacity={opacity} />;
}

function fill(x: number, y: number, w: number, h: number, colour = C.caramel, opacity = 1) {
  return <rect key={`${x}-${y}-f`} x={x} y={y} width={w} height={h} rx={3} fill={colour} opacity={opacity} />;
}

// 1 · Chaining pays a pointer per entry. Open addressing gives that up.
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.3));
  return (
    <Svg label="A chain's pointers fading out as each entry slides directly into the array itself, no node, no pointer" h={300}>
      <T x={30} y={26} s={13} f={C.latte}>before: chaining</T>
      {[0, 1, 2].map((i) => (
        <g key={i} opacity={1 - a}>
          <circle cx={60} cy={60 + i * 40} r={8} fill="none" stroke={C.cherry} strokeWidth={1.4} />
          {i < 2 && <line x1={60} y1={69 + i * 40} x2={60} y2={60 + (i + 1) * 40 - 8} stroke={C.cherry} strokeWidth={1.4} />}
        </g>
      ))}
      <T x={30} y={220} s={13} f={C.caramel} o={a}>now: every entry lives in the table itself</T>
      {[0, 1, 2].map((i) => fill(140 + i * 60, 230, 44, 24, C.caramel, a))}
    </Svg>
  );
}

// 2 · Given an ordinary hash function, linear probing uses the next slot
export function ProbeMechanism({ t }: StepCtx) {
  const n = Math.min(3, Math.floor(seg(t, 0.2, 1.6) * 3) + 1);
  return (
    <Svg label="A key's insert walking slot to slot until it finds the first empty one" h={300}>
      <T x={30} y={26} s={13} f={C.latte}>h(k,i) = (h&rsquo;(k) + i) mod m</T>
      {Array.from({ length: 6 }, (_, i) => cell(30 + i * 44, 60, 36, 28, i < 2 ? C.cherry : C.crema, i < 2 ? 1 : 0.6))}
      {Array.from({ length: n }, (_, i) => (
        <T key={i} x={30 + (i + 2) * 44 + 4} y={200 + i * 22} s={12} f={C.caramel}>probe {i + 1}: slot full, try next</T>
      ))}
      {n >= 2 && <T x={30} y={270} s={13} f={C.caramel}>first empty slot stops the search</T>}
    </Svg>
  );
}

// 3 · Predict: after a few collisions, where does the next colliding key end up?
export function ClusterPredictViz({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="Two short runs of occupied slots already formed, a new key about to collide with one of them" h={300}>
      {Array.from({ length: 10 }, (_, i) => {
        const inRun = i === 2 || i === 3 || i === 6;
        return cell(30 + i * 30, 50, 24, 22, inRun ? C.cherry : C.crema, inRun ? 1 : 0.5);
      })}
      <T x={30} y={24} s={13} f={C.latte}>two runs already formed &mdash; where does the next collision land?</T>
      {!answered && <T x={30} y={270} s={15} f={C.caramel} o={0.7 + 0.3 * Math.sin(t * 3)}>make your prediction</T>}
      {answered && (
        <>
          <T x={30} y={140} s={13} f={C.caramel}>very likely at the end of a run</T>
          <T x={30} y={162} s={13} f={C.latte}>making that run longer</T>
        </>
      )}
    </Svg>
  );
}

// 4 · Primary clustering: runs merge into longer runs
export function ClusteringReveal({ t }: StepCtx) {
  const n = Math.min(6, Math.floor(seg(t, 0.2, 1.6) * 6) + 2);
  return (
    <Svg label="Two short runs merging into one long run as more colliding keys arrive, labelled primary clustering" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>primary clustering</T>
      {Array.from({ length: 10 }, (_, i) => cell(30 + i * 30, 50, 24, 22, i < n ? C.cherry : C.crema, i < n ? 1 : 0.5))}
      <T x={30} y={220} s={13} f={C.cherry}>&ldquo;long runs of occupied slots build up&hellip;</T>
      <T x={30} y={242} s={13} f={C.cherry}>the long runs tend to get longer&rdquo;</T>
    </Svg>
  );
}

// 5 · Two real fixes: quadratic probing vs. double hashing
export function TwoFixes({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  const b = easeOut(seg(t, 0.4, 1.2));
  return (
    <Svg label="Quadratic probing's offsets scattering away from a run, beside double hashing's probes diverging immediately for two colliding keys" h={320}>
      <T x={30} y={24} s={13} f={C.latte}>quadratic probing: offsets 1, 4, 9&hellip;</T>
      {[1, 4, 9].map((off, i) => fill(30 + off * 10, 44, 20, 20, C.caramel, a))}
      <T x={30} y={150} s={13} f={C.latte}>double hashing: step = h2(key)</T>
      {[0, 1, 2].map((i) => fill(30 + i * 70, 170, 20, 20, C.cinnamon, b))}
      {[0, 1, 2].map((i) => fill(220 + i * 40, 170, 20, 20, C.caramel, b * 0.8))}
      <T x={30} y={270} s={13} f={C.latte}>two colliding keys, two different steps</T>
      <T x={30} y={292} s={13} f={C.latte}>they diverge at once</T>
    </Svg>
  );
}

// 6 · Quadratic probing's caveat and secondary clustering
export function QuadraticCaveat({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.1));
  return (
    <Svg label="Quadratic probing's guarantee stated with its conditions, beside two keys from the same starting slot following the identical sequence" h={320}>
      <T x={30} y={24} s={13} f={C.caramel}>prime table size, &alpha; &lt; 0.5:</T>
      <T x={30} y={46} s={13} f={C.latte}>first m/2 probes guaranteed distinct</T>
      {Array.from({ length: 6 }, (_, i) => cell(30 + i * 36, 64, 28, 22, C.caramel, 0.8))}
      <T x={30} y={150} s={13} f={C.cherry} o={a}>same starting slot &rarr; same sequence after that</T>
      <T x={30} y={172} s={13} f={C.cherry} o={a}>secondary clustering</T>
      {Array.from({ length: 4 }, (_, i) => fill(30 + [0, 1, 4, 9][i] * 8, 190, 18, 18, C.cherry, a))}
    </Svg>
  );
}

// 7 · Predict: when you delete an entry, can you just empty its slot?
export function DeletionPredictViz({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="One run of occupied slots with the middle entry marked for deletion, asking whether its slot can simply be emptied" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>deleting the middle of a run</T>
      {[0, 1, 2, 3].map((i) => cell(30 + i * 40, 50, 32, 24, i === 1 ? C.cherry : C.crema, i === 1 ? 1 : 0.7))}
      {!answered && <T x={30} y={260} s={15} f={C.caramel} o={0.7 + 0.3 * Math.sin(t * 3)}>can you just empty it?</T>}
      {answered && (
        <>
          <T x={30} y={150} s={13} f={C.cherry}>no &mdash; a later search would stop there</T>
          <T x={30} y={172} s={13} f={C.latte}>and miss entries placed beyond it</T>
        </>
      )}
    </Svg>
  );
}

// 8 · Tombstone vs. cluster-rehash deletion
export function DeletionTwoWays({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  const b = easeOut(seg(t, 0.5, 1.3));
  return (
    <Svg label="One run with a deletion shown two ways: a tombstone left in place, versus the rest of the cluster rehashed back into place" h={340}>
      <T x={30} y={24} s={13} f={C.latte}>tombstone: slot stays occupied, forever</T>
      {[0, 1, 2, 3].map((i) => cell(30 + i * 40, 40, 32, 24, i === 1 ? C.cherry : C.crema, i === 1 ? a : 0.7))}
      {1 === 1 && <T x={34} y={58} s={11} f={C.cherry} o={a}>&dagger;</T>}
      <T x={30} y={190} s={13} f={C.caramel} o={b}>cluster-rehash: later entries shift back</T>
      {[0, 1, 2].map((i) => fill(30 + i * 40, 206, 32, 24, C.caramel, b))}
      <T x={30} y={290} s={13} f={C.latte}>both keep every surviving key findable</T>
    </Svg>
  );
}

// 8 · Prove it
export function ProveIt({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  const b = easeOut(seg(t, 0.4, 1.2));
  const c = easeOut(seg(t, 0.6, 1.4));
  return (
    <Svg label="Three load factors, linear probing's average probes climbing fastest beside double hashing's flatter line" h={340}>
      <T x={30} y={24} s={13} f={C.crema}>&alpha; = 0.50: linear 1.47 vs double 1.34</T>
      {fill(30, 34, 90 * a, 16, C.cherry, Math.max(0.3, a))}
      {fill(30, 54, 80 * a, 16, C.cinnamon, Math.max(0.3, a))}
      <T x={30} y={96} s={13} f={C.crema}>&alpha; = 0.75: linear 2.37 vs double 1.84</T>
      {fill(30, 106, 140 * b, 16, C.cherry, Math.max(0.3, b))}
      {fill(30, 126, 110 * b, 16, C.cinnamon, Math.max(0.3, b))}
      <T x={30} y={168} s={13} f={C.crema}>&alpha; = 0.90: linear 4.08 vs double 2.62</T>
      {fill(30, 178, 240 * c, 16, C.cherry, Math.max(0.3, c))}
      {fill(30, 198, 155 * c, 16, C.cinnamon, Math.max(0.3, c))}
      <T x={30} y={240} s={13} f={C.latte}>linear probing's gap widens as &alpha; rises</T>
      <T x={30} y={262} s={13} f={C.latte}>primary clustering, measured</T>
    </Svg>
  );
}
