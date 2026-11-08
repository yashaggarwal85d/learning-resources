import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { C, Reticle, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = something that exists; latte = secondary labels; taupe = not yet reached or
// discarded; caramel (focus) = the thing to look at right now; cinnamon = the alternative being compared;
// cherry/cherryText = the bad outcome.
//
// Every printed number is examples.py's or follows from its settings: k = 3 of n = 10 and its 3/10; a million items
// against a hundred-item reservoir, 999,900 draws for Algorithm R and Li's order k(1 + ln n/k) = 1,021; weights
// 1, 1, 1, 1, 10 sampling two, and the naive 10/14 × 2 = 1.43; the merge of seven against three. Seeded measurements
// (Algorithm L's draw count, the weighted inclusion frequencies) are drawn as shape only. Traces shown moving (which
// slot a draw hits, where a skip lands, the u of a key) are illustrations and print nothing.

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

/** Which of n beats spread over [a, b] has started: -1 before a, then 0 to n - 1. */
const stepIdx = (x: number, a: number, b: number, n: number) => (x < a ? -1 : Math.min(n - 1, Math.floor(((x - a) / (b - a)) * n)));

const K = 3;
const N = 10;

// 1 · Opening. Lines stream past without end; a reservoir of three slots fills as they go; then ten bars, one per
// line, rise to the same height: the promise.
export function Opening({ t }: StepCtx) {
  const fill = (i: number) => easeOut(seg(t, 0.5 + i * 0.4, 0.8 + i * 0.4));
  const bars = easeOut(seg(t, 2.4, 3.4));
  const cap = easeOut(seg(t, 3.2, 3.8));
  return (
    <Svg label="Lines stream past with no end in sight. A reservoir of three slots fills from them. Then ten bars, one per line, rise to the same height: every line equally likely to be kept" h={290}>
      <line x1={20} y1={60} x2={560} y2={60} stroke={C.mocha} />
      {Array.from({ length: 14 }, (_, i) => {
        const x = 20 + ((i * 40 + t * 70) % 560);
        return <rect key={i} x={x - 9} y={52} width={18} height={16} rx={2} fill={C.latte} opacity={0.85} />;
      })}
      <T x={560} y={36} s={12} f={C.latte} a="end">length: unknown</T>
      <rect x={210} y={100} width={180} height={44} rx={4} fill="none" stroke={C.caramel} strokeWidth={1.4} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={222 + i * 56} y={110} width={44} height={24} rx={2} fill={C.caramel} opacity={fill(i)} />
      ))}
      <T x={404} y={127} s={12} f={C.caramel}>room for k</T>
      {Array.from({ length: N }, (_, i) => (
        <rect key={i} x={86 + i * 44} y={240 - 50 * bars} width={28} height={50 * bars} fill={C.crema} opacity={0.8} />
      ))}
      <line x1={80} y1={240} x2={520} y2={240} stroke={C.line} />
      <T x={300} y={272} s={13} f={C.caramel} a="middle" o={cap}>every line, the same chance</T>
    </Svg>
  );
}

// 2 · PredictReplaceProbability. Four candidate rules plotted as replacement probability against lines seen: one half
// (flat), a fixed small number (flat), k/n and 1/n (both shrinking). After answering, k/n lights.
const RULES = [
  { name: '1/2', f: () => 0.5 },
  { name: 'fixed', f: () => 0.1 },
  { name: 'k/n', f: (n: number) => Math.min(1, K / n) },
  { name: '1/n', f: (n: number) => 1 / n },
];
export function PredictReplaceProbability({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const X0 = 80, X1 = 520, Y0 = 230, Y1 = 40;
  const px = (n: number) => X0 + ((n - 4) / 36) * (X1 - X0);
  const py = (p: number) => Y0 - p * (Y0 - Y1);
  const cap = answered ? easeOut(seg(s, 0.3, 0.9)) : 0;
  return (
    <Svg label="Four candidate rules plotted as the chance a new line replaces something, against lines seen so far: one half and a fixed small number stay flat, k over n and one over n shrink. After answering, k over n lights" h={290}>
      <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke={C.line} />
      <line x1={X0} y1={Y0} x2={X0} y2={Y1} stroke={C.line} />
      <T x={X1} y={Y0 + 20} s={12} f={C.latte} a="end">lines seen, n</T>
      <T x={X0} y={Y1 - 10} s={12} f={C.latte}>chance to replace</T>
      {RULES.map((r, i) => {
        const d = easeInOut(seg(t, 0.2 + i * 0.3, 0.8 + i * 0.3));
        const pts = Array.from({ length: 37 }, (_, k) => 4 + k).filter((n) => n - 4 <= 36 * d + 1e-9);
        const hot = answered && i === 2;
        const col = hot ? C.caramel : answered ? C.mocha : C.latte;
        return (
          <g key={r.name}>
            <polyline points={pts.map((n) => `${px(n)},${py(r.f(n))}`).join(' ')} fill="none" stroke={col} strokeWidth={hot ? 3 : 1.6} />
            <T x={X0 - 8} y={py(r.f(4)) + 4} s={12} f={hot ? C.caramel : answered ? C.taupe : C.crema} a="end" o={d > 0 ? 1 : 0}>{r.name}</T>
          </g>
        );
      })}
      <T x={X1} y={Y1 + 4} s={13} f={C.caramel} a="end" o={cap}>shrinks as the stream grows</T>
    </Svg>
  );
}

// 3 · AlgorithmR. Ten lines in a row, three reservoir slots above. Lines 1–3 go straight in. Then lines 4 to 8 each
// draw j across everything seen so far (a strip under lines 1..i, its first k cells outlined); a j inside the first k
// replaces that slot, any other j leaves the reservoir alone. The draws are an illustration.
const R_TRACE = [2, 5, 1, 6, 7]; // j drawn by lines 4..8 (illustration)
export function AlgorithmR({ t }: StepCtx) {
  const ix = (i: number) => 40 + (i - 1) * 52;
  const slotX = (j: number) => 196 + (j - 1) * 72;
  const cur = stepIdx(t, 1.6, 4.6, R_TRACE.length);
  const curU = cur >= 0 ? seg(t, 1.6 + cur * 0.6, 2.2 + cur * 0.6) : 0;
  const slots = [1, 2, 3];
  const flying: { item: number; slot: number; u: number }[] = [];
  for (let s = 0; s < K; s++) {
    const u = easeInOut(seg(t, 0.2 + s * 0.3, 0.6 + s * 0.3));
    if (u < 1) flying.push({ item: s + 1, slot: s + 1, u });
  }
  R_TRACE.forEach((j, b) => {
    if (j > K || b > cur) return;
    const u = b < cur ? 1 : easeInOut(seg(curU, 0.6, 0.95));
    if (u >= 1) slots[j - 1] = 4 + b;
    else if (u > 0) flying.push({ item: 4 + b, slot: j, u });
  });
  const firstIn = (s: number) => seg(t, 0.2 + s * 0.3, 0.6 + s * 0.3) >= 1;
  const i = cur >= 0 ? 4 + cur : 0;
  const j = cur >= 0 ? R_TRACE[cur] : 0;
  const strip = easeOut(seg(curU, 0, 0.25));
  const drop = easeOut(seg(curU, 0.25, 0.5));
  const hit = j <= K;
  return (
    <Svg label="Ten lines in a row and three reservoir slots above. Lines one to three go straight in. Then each later line draws a number across every line seen so far; a draw landing inside the first three cells replaces that slot, any other draw leaves the reservoir alone" h={290}>
      {[1, 2, 3].map((s) => (
        <g key={s}>
          <rect x={slotX(s)} y={30} width={60} height={34} rx={3} fill="none" stroke={C.caramel} strokeWidth={1.4} />
          {firstIn(s - 1) && <T x={slotX(s) + 30} y={52} s={14} f={C.crema} a="middle">{slots[s - 1]}</T>}
        </g>
      ))}
      <T x={404} y={52} s={12} f={C.latte}>the reservoir</T>
      {Array.from({ length: N }, (_, k) => {
        const n = k + 1;
        const on = n === i;
        return (
          <g key={n}>
            <rect x={ix(n)} y={120} width={44} height={30} rx={3} fill="none" stroke={on ? C.caramel : n < Math.max(i, 4) ? C.latte : C.taupe} strokeWidth={on ? 2 : 1.2} />
            <T x={ix(n) + 22} y={140} s={13} f={on ? C.caramel : C.latte} a="middle">{n}</T>
          </g>
        );
      })}
      {flying.filter((f) => f.u > 0).map((f) => (
        <g key={`${f.item}-${f.slot}`} transform={`translate(${lerp(ix(f.item) + 2, slotX(f.slot) + 10, f.u)} ${lerp(124, 34, f.u)})`}>
          <rect width={40} height={26} rx={2} fill={C.band} stroke={C.caramel} strokeWidth={1.4} />
          <T x={20} y={18} s={13} f={C.caramel} a="middle">{f.item}</T>
        </g>
      ))}
      {cur >= 0 && (
        <g opacity={strip}>
          {Array.from({ length: i }, (_, k) => (
            <rect key={k} x={ix(k + 1)} y={176} width={44} height={16} rx={2} fill={k < K ? C.band : 'none'} stroke={k < K ? C.caramel : C.mocha} strokeWidth={1} />
          ))}
          <T x={ix(1)} y={214} s={12} f={C.latte}>draw j from 1 to {i}</T>
          <path d={`M${ix(j) + 22} ${lerp(160, 184, drop)} l-7 -10 l14 0 Z`} fill={hit ? C.caramel : C.latte} opacity={drop} />
        </g>
      )}
      <T x={300} y={262} s={13} f={C.caramel} a="middle" o={cur >= 0 && drop >= 1 ? 1 : 0}>
        {hit ? `j = ${j}: replace slot ${j}` : `j = ${j}: past k, keep the reservoir`}
      </T>
    </Svg>
  );
}

// 4 · CorrectnessInvariant. Line 4 of ten, k = 3: it enters with 3/4, then survives line 5 with 4/5, line 6 with 5/6,
// …, line 10 with 9/10. A bar of its chance shrinks factor by factor; then each numerator cancels the denominator
// before it and what is left is 3/10, the same as every other line.
export function CorrectnessInvariant({ t }: StepCtx) {
  const F = Array.from({ length: 7 }, (_, f) => ({ num: 3 + f, den: 4 + f }));
  F[0] = { num: 3, den: 4 };
  const fx = (f: number) => 56 + f * 62;
  const shown = stepIdx(t, 0.3, 2.8, F.length);
  const barP = shown < 0 ? 1 : K / (4 + shown);
  const barW = 480 * barP;
  const strike = easeOut(seg(t, 3.0, 3.8));
  const res = easeOut(seg(t, 3.7, 4.3));
  return (
    <Svg label="Line four of ten, with k three. It enters with three quarters, then survives line five with four fifths, line six with five sixths, up to nine tenths. A bar of its chance shrinks factor by factor; then every numerator cancels the denominator before it, leaving three tenths, the same as every line" h={290}>
      <T x={50} y={34} s={12} f={C.latte}>line 4's chance of being kept</T>
      <rect x={50} y={46} width={480} height={18} fill="none" stroke={C.mocha} strokeDasharray="3 3" />
      <rect x={50} y={46} width={barW} height={18} fill={C.caramel} opacity={0.9} />
      {F.map((fr, f) => {
        const o = f <= shown ? 1 : 0;
        const strikeNum = f >= 1 ? strike : 0;
        const strikeDen = f <= F.length - 2 ? strike : 0;
        return (
          <g key={f} opacity={o}>
            <T x={fx(f)} y={124} s={15} f={C.crema} a="middle">{fr.num}</T>
            <line x1={fx(f) - 14} y1={132} x2={fx(f) + 14} y2={132} stroke={C.latte} />
            <T x={fx(f)} y={152} s={15} f={C.crema} a="middle">{fr.den}</T>
            {strikeNum > 0 && <line x1={fx(f) - 10} y1={126} x2={lerp(fx(f) - 10, fx(f) + 10, strikeNum)} y2={lerp(126, 108, strikeNum)} stroke={C.cherryText} strokeWidth={1.6} />}
            {strikeDen > 0 && <line x1={fx(f) - 10} y1={154} x2={lerp(fx(f) - 10, fx(f) + 10, strikeDen)} y2={lerp(154, 136, strikeDen)} stroke={C.cherryText} strokeWidth={1.6} />}
            {f < F.length - 1 && <T x={fx(f) + 31} y={142} s={13} f={C.latte} a="middle">·</T>}
          </g>
        );
      })}
      <T x={fx(0)} y={186} s={12} f={C.latte} a="middle" o={shown >= 0 ? 1 : 0}>enters</T>
      <T x={fx(3)} y={186} s={12} f={C.latte} a="middle" o={shown >= 2 ? 1 : 0}>survives each later line</T>
      <g opacity={res}>
        <T x={fx(6) + 46} y={142} s={16} f={C.caramel}>= 3/10</T>
        <T x={300} y={240} s={13} f={C.caramel} a="middle">every line ends at k/n</T>
      </g>
    </Svg>
  );
}

// 5 · WrongVersions. Three panels, each a row of ten bars, one per line, against a dashed target at 3/10. Knowing n:
// the stream never says it, so the rule has nothing to compute. First k only: three bars at certainty, seven at
// zero. A coin of one half: the chances climb toward the late lines (exact values, drawn as shape).
const COIN = Array.from({ length: N }, (_, k) => {
  const i = k + 1;
  const q = 1 - 1 / (2 * K);
  return i <= K ? q ** (N - K) : 0.5 * q ** (N - i);
});
export function WrongVersions({ t }: StepCtx) {
  const P0 = [20, 215, 410];
  const base = 228, sc = 140;
  const panel = (p: number) => easeOut(seg(t, 0.2 + p * 1.1, 0.8 + p * 1.1));
  const grow = (p: number) => easeOut(seg(t, 0.5 + p * 1.1, 1.2 + p * 1.1));
  const vals = [null, Array.from({ length: N }, (_, k) => (k < K ? 1 : 0)), COIN];
  const titles = ['k/n needs n', 'first k only', 'coin of 1/2'];
  const caps = ['n never arrives', 'late lines: zero', 'late lines win'];
  return (
    <Svg label="Three panels of ten bars, one per line, against a dashed target at three tenths. A rule needing n has nothing to compute, since the stream never says its length. Keeping only the first k puts three lines at certainty and the rest at zero. A coin of one half makes the chances climb toward the latest lines" h={290}>
      {P0.map((x0, p) => {
        const o = panel(p);
        const g = grow(p);
        const v = vals[p];
        return (
          <g key={p} opacity={o}>
            <T x={x0} y={40} s={12} f={C.crema}>{titles[p]}</T>
            <line x1={x0} y1={base} x2={x0 + 170} y2={base} stroke={C.line} />
            <line x1={x0} y1={base - 0.3 * sc} x2={x0 + 170} y2={base - 0.3 * sc} stroke={C.latte} strokeDasharray="4 3" />
            {v
              ? v.map((h, k) => <rect key={k} x={x0 + 2 + k * 17} y={base - h * sc * g} width={13} height={Math.max(1, h * sc * g)} fill={C.cherry} stroke={C.cherryText} strokeWidth={0.8} />)
              : (
                <g>
                  {Array.from({ length: N }, (_, k) => (
                    <rect key={k} x={x0 + 2 + k * 17} y={base - 0.3 * sc} width={13} height={0.3 * sc} fill="none" stroke={C.taupe} strokeDasharray="2 2" />
                  ))}
                  <T x={x0 + 85} y={130} s={22} f={C.cherryText} a="middle" o={g}>n = ?</T>
                </g>
              )}
            <T x={x0} y={256} s={12} f={C.cherryText} o={g}>{caps[p]}</T>
          </g>
        );
      })}
      <T x={20} y={282} s={12} f={C.latte} o={panel(0)}>dashed: the 3/10 every line should get</T>
    </Svg>
  );
}

// 6 · AlgorithmRCost. A million items as one long bar; the first hundred (a sliver) are kept outright; a sweep then
// passes every other item, and a magnified window below shows each item spending its own random draw.
export function AlgorithmRCost({ t }: StepCtx) {
  const X0 = 40, W = 520;
  const sweep = easeInOut(seg(t, 0.8, 3.2));
  const done = easeOut(seg(t, 3.0, 3.6));
  const lens = easeOut(seg(t, 0.4, 0.9));
  return (
    <Svg label="A million items as one long bar. The first hundred, a sliver at the left, are kept outright. A sweep then passes every other item, and a magnified window below shows each item spending its own random draw: nine hundred ninety-nine thousand nine hundred draws" h={280}>
      <T x={X0} y={36} s={12} f={C.latte}>1,000,000 items, k = 100</T>
      <rect x={X0} y={50} width={W} height={22} fill="none" stroke={C.mocha} />
      <rect x={X0} y={50} width={2} height={22} fill={C.caramel} />
      <rect x={X0 + 2} y={50} width={(W - 2) * sweep} height={22} fill={C.caramel} opacity={0.45} />
      <line x1={X0 + 2 + (W - 2) * sweep} y1={44} x2={X0 + 2 + (W - 2) * sweep} y2={78} stroke={C.caramel} strokeWidth={2} opacity={sweep > 0 && sweep < 1 ? 1 : 0} />
      <T x={X0 + W} y={100} s={16} f={C.caramel} a="end" o={done}>999,900 draws</T>
      <g opacity={lens}>
        <T x={X0} y={140} s={12} f={C.latte}>up close: one draw per item</T>
        {Array.from({ length: 20 }, (_, k) => {
          const lit = sweep * 20 > k + 0.5 || done > 0;
          return (
            <g key={k}>
              <rect x={X0 + k * 26} y={154} width={20} height={20} rx={2} fill="none" stroke={C.latte} />
              <rect x={X0 + k * 26 + 5} y={186} width={10} height={10} rx={2} fill={lit ? C.caramel : C.band} stroke={C.mocha} strokeWidth={0.8} />
            </g>
          );
        })}
        <T x={X0} y={226} s={12} f={C.caramel}>each item, its own draw</T>
      </g>
    </Svg>
  );
}

// 7 · PredictCanSkip. Thirty items in a row, each with a draw under it; nearly every draw says no (taupe), a few say
// yes. After answering, the no-draws fade and arcs hop from one yes to the next. Positions are an illustration.
const YES = [3, 7, 12, 20, 29];
export function PredictCanSkip({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const x = (i: number) => 36 + i * 18;
  const fade = answered ? easeOut(seg(s, 0.2, 0.7)) : 0;
  const hop = answered ? easeInOut(seg(s, 0.6, 2.2)) : 0;
  return (
    <Svg label="Thirty items in a row, each with a random draw under it. Nearly every draw says no; a few say yes. After answering, the no draws fade and arcs hop straight from one yes to the next" h={260}>
      {Array.from({ length: 30 }, (_, i) => {
        const yes = YES.includes(i);
        const o = easeOut(seg(t, 0.1 + i * 0.03, 0.3 + i * 0.03));
        return (
          <g key={i} opacity={o}>
            <rect x={x(i)} y={110} width={14} height={20} rx={2} fill="none" stroke={yes ? C.caramel : C.latte} strokeWidth={yes ? 1.6 : 1} />
            <circle cx={x(i) + 7} cy={150} r={4} fill={yes ? C.caramel : C.taupe} opacity={yes ? 1 : 1 - fade} />
          </g>
        );
      })}
      {YES.slice(0, -1).map((a, k) => {
        const b = YES[k + 1];
        const u = clamp(hop * (YES.length - 1) - k, 0, 1);
        if (u <= 0) return null;
        const x1 = x(a) + 7, x2 = x(b) + 7, mx = (x1 + x2) / 2, top = 100 - (x2 - x1) * 0.3;
        return <path key={k} d={`M${x1} 104 Q${mx} ${top} ${x2} 104`} fill="none" stroke={C.caramel} strokeWidth={1.8} strokeDasharray={`${u * 300} 300`} />;
      })}
      <T x={36} y={192} s={12} f={C.latte} o={1 - fade}>a draw per item; nearly all say no</T>
      <T x={36} y={192} s={12} f={C.caramel} o={fade}>draw the gap, skip the rest</T>
    </Svg>
  );
}

// 8 · AlgorithmL. Eighty items along a line; hops land only on the items that enter, the gaps growing as the stream
// grows; each landing spends three random numbers (three dots), every item jumped over spends none.
const L_HOPS = [3, 6, 11, 19, 31, 49, 77]; // illustration
export function AlgorithmL({ t }: StepCtx) {
  const x = (i: number) => 30 + i * 6.8;
  const cur = stepIdx(t, 0.5, 4.0, L_HOPS.length - 1);
  const cap = easeOut(seg(t, 3.6, 4.2));
  return (
    <Svg label="Eighty items along a line. Hops land only on the items that enter the reservoir, the gaps growing as the stream grows. Each landing spends three random numbers; every item jumped over spends none" h={260}>
      <line x1={26} y1={150} x2={574} y2={150} stroke={C.mocha} />
      {Array.from({ length: 80 }, (_, i) => {
        const entry = L_HOPS.indexOf(i);
        const landed = entry >= 0 && entry <= cur + 1 && cur >= 0;
        return <rect key={i} x={x(i) - 2} y={142} width={4} height={16} fill={landed ? C.caramel : C.taupe} />;
      })}
      {L_HOPS.slice(0, -1).map((a, k) => {
        if (k > cur) return null;
        const u = k < cur ? 1 : easeInOut(seg(t, 0.5 + k * (3.5 / 6), 0.5 + (k + 0.8) * (3.5 / 6)));
        const b = L_HOPS[k + 1];
        const x1 = x(a), x2 = x(b), mx = (x1 + x2) / 2, top = 136 - Math.min(90, (x2 - x1) * 0.45);
        return <path key={k} d={`M${x1} 136 Q${mx} ${top} ${x2} 136`} fill="none" stroke={C.caramel} strokeWidth={1.8} strokeDasharray={`${u * 400} 400`} />;
      })}
      {L_HOPS.map((a, k) => {
        const on = cur >= 0 && k <= cur + (seg(t, 0.5 + cur * (3.5 / 6), 0.5 + (cur + 0.8) * (3.5 / 6)) >= 1 ? 1 : 0);
        return (
          <g key={a} opacity={on ? 1 : 0}>
            {[0, 1, 2].map((d) => <circle key={d} cx={x(a) - 6 + d * 6} cy={176} r={2.4} fill={C.caramel} />)}
          </g>
        );
      })}
      <T x={30} y={212} s={12} f={C.caramel} o={cur >= 0 ? 1 : 0}>three draws per item that enters</T>
      <T x={30} y={236} s={12} f={C.latte} o={cap}>none for the items jumped over</T>
    </Svg>
  );
}

// 9 · SkipMeasured. Draws on a log axis from 100 to a million: Algorithm R's bar runs to 999,900; a seeded run of
// Algorithm L stops in the low thousands (shape only), beside Li's order k(1 + ln n/k) = 1,021.
const L_SEEDED = 2841; // examples.py's seeded run, drawn as shape only
export function SkipMeasured({ t }: StepCtx) {
  const X0 = 80, X1 = 540;
  const px = (v: number) => X0 + ((Math.log10(v) - 2) / 4) * (X1 - X0);
  const r = easeInOut(seg(t, 0.4, 1.6));
  const l = easeInOut(seg(t, 1.8, 2.8));
  const b = easeOut(seg(t, 3.0, 3.6));
  return (
    <Svg label="Random draws on a log axis from a hundred to a million. Algorithm R's bar runs to 999,900. A seeded run of Algorithm L stops in the low thousands, beside Li's order of k times one plus the log of n over k, 1,021" h={280}>
      <T x={X0} y={52} s={12} f={C.latte}>Algorithm R</T>
      <rect x={X0} y={62} width={(px(999900) - X0) * r} height={20} fill={C.taupe} />
      <T x={X1} y={52} s={13} f={C.crema} a="end" o={r >= 1 ? 1 : 0}>999,900</T>
      <T x={X0} y={122} s={12} f={C.caramel}>Algorithm L, a seeded run</T>
      <rect x={X0} y={132} width={(px(L_SEEDED) - X0) * l} height={20} fill={C.caramel} />
      <g opacity={b}>
        <line x1={px(1021)} y1={124} x2={px(1021)} y2={170} stroke={C.cinnamon} strokeDasharray="4 3" strokeWidth={1.6} />
        <T x={px(1021) - 30} y={190} s={12} f={C.cinnamon}>k(1 + ln n/k) = 1,021</T>
      </g>
      <line x1={X0} y1={222} x2={X1} y2={222} stroke={C.line} />
      {['10²', '10³', '10⁴', '10⁵', '10⁶'].map((lab, i) => (
        <g key={lab}>
          <line x1={X0 + i * 115} y1={222} x2={X0 + i * 115} y2={228} stroke={C.line} />
          <T x={X0 + i * 115} y={244} s={12} f={C.latte} a="middle">{lab}</T>
        </g>
      ))}
      <T x={X1} y={268} s={12} f={C.latte} a="end">random draws, log scale</T>
    </Svg>
  );
}

// 10 · WhatSkipBuys. Two lanes of forty items with the same four entries. Above, a stream read in order: the reader
// passes every item, though draws happen only at the entries. Below, a seekable index: the reader jumps straight to
// each entry and the items between are never read.
const ENTRIES = [4, 11, 21, 36];
export function WhatSkipBuys({ t }: StepCtx) {
  const x = (i: number) => 40 + i * 13;
  const read = easeInOut(seg(t, 0.4, 3.2)) * 39;
  const jump = stepIdx(t, 0.4, 3.2, ENTRIES.length);
  const cap = easeOut(seg(t, 3.3, 3.9));
  const lane = (y: number, title: string, col: string, isRead: (i: number) => boolean, head: number) => (
    <g>
      <T x={40} y={y - 22} s={12} f={col}>{title}</T>
      {Array.from({ length: 40 }, (_, i) => {
        const entry = ENTRIES.includes(i);
        const r = isRead(i);
        return (
          <g key={i}>
            <rect x={x(i)} y={y} width={10} height={16} rx={1} fill={r ? C.latte : 'none'} stroke={entry ? C.caramel : C.mocha} strokeWidth={entry ? 1.6 : 1} opacity={r ? 0.9 : 1} />
            {entry && r && <circle cx={x(i) + 5} cy={y + 28} r={3} fill={C.caramel} />}
          </g>
        );
      })}
      <path d={`M${x(head) + 5} ${y - 4} l-5 -8 l10 0 Z`} fill={col} />
    </g>
  );
  const bHead = jump < 0 ? 0 : ENTRIES[jump];
  return (
    <Svg label="Two lanes of forty items with the same four entries. Above, a stream read in order: the reader passes every item, though random draws happen only at the entries. Below, a seekable index: the reader jumps straight to each entry, and the items between are never read" h={290}>
      {lane(60, 'a stream, read in order', C.crema, (i) => i <= read, Math.floor(read))}
      {lane(170, 'a seekable index', C.cinnamon, (i) => jump >= 0 && ENTRIES.indexOf(i) >= 0 && ENTRIES.indexOf(i) <= jump, bHead)}
      <T x={40} y={262} s={12} f={C.latte} o={cap}>draws saved in both lanes</T>
      <T x={40} y={282} s={12} f={C.cinnamon} o={cap}>reads saved only below</T>
    </Svg>
  );
}

// 11 · PredictWeightMeaning. Weights 1, 1, 1, 1, 10. Left: one draw, a bar split by weight, the heavy item taking
// 10/14 of it. Right: the final sample of two, five question marks. After answering, the per-draw reading lights.
const WTS = [1, 1, 1, 1, 10];
export function PredictWeightMeaning({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pick = answered ? easeOut(seg(s, 0.2, 0.7)) : 0;
  const a = easeOut(seg(t, 0.2, 0.9));
  const b = easeOut(seg(t, 0.8, 1.5));
  // The single-draw bar is built segment by segment, by weight; a draw needle then sweeps it. After the answer the
  // needle comes to rest in the heavy item's share (the thing the weight controls) and the lock-on lands there.
  const grow = (i: number) => easeOut(seg(t, 0.3 + i * 0.15, 0.6 + i * 0.15));
  const sweep = 30 + 250 * (0.5 - 0.5 * Math.cos(Math.max(0, t - 1.0) * 2.4));
  const heavy = 30 + (9 / 14) * 250;
  const needle = lerp(sweep, heavy, answered ? easeInOut(seg(s, 0, 0.5)) : 0);
  let acc = 0;
  return (
    <Svg label="Weights one, one, one, one and ten. Left, a single draw: a bar split by weight, the heavy item taking ten fourteenths of it. Right, the final sample of two, five question marks. After answering, the per-draw reading lights" h={260}>
      <g opacity={a}>
        <T x={30} y={50} s={12} f={answered ? C.caramel : C.crema}>at each draw</T>
        {WTS.map((w, i) => {
          const x0 = 30 + (acc / 14) * 250;
          acc += w;
          return <rect key={i} x={x0} y={70} width={Math.max(0, ((w / 14) * 250 - 2) * grow(i))} height={30} fill={i === 4 ? (answered ? C.caramel : C.latte) : C.mocha} />;
        })}
        <T x={30 + (4 / 14) * 250 + 4} y={124} s={12} f={answered ? C.caramel : C.latte} o={grow(4)}>10/14</T>
        {t > 1.0 && <path d={`M${needle.toFixed(1)} 62 V108`} stroke={C.focus} strokeWidth={2} />}
        {t > 1.0 && <path d={`M${(needle - 5).toFixed(1)} 58 L${needle.toFixed(1)} 64 L${(needle + 5).toFixed(1)} 58 Z`} fill={C.focus} />}
      </g>
      {answered && <Reticle x={30 + (4 / 14) * 250 + 89} y={85} w={190} h={44} t={s} at={0.5} />}
      <g opacity={b * (1 - 0.6 * pick)}>
        <T x={330} y={50} s={12} f={C.crema}>in the final sample of 2</T>
        {WTS.map((w, i) => (
          <g key={i} opacity={easeOut(seg(t, 0.8 + i * 0.12, 1.1 + i * 0.12))} transform={`translate(0 ${((1 - easeOut(seg(t, 0.8 + i * 0.12, 1.1 + i * 0.12))) * 12).toFixed(2)})`}>
            <rect x={330 + i * 46} y={70} width={36} height={30} rx={2} fill="none" stroke={C.latte} />
            <T x={348 + i * 46} y={91} s={14} f={C.latte} a="middle">?</T>
            <T x={348 + i * 46} y={124} s={12} f={C.latte} a="middle">w {w}</T>
          </g>
        ))}
      </g>
      <T x={30} y={200} s={13} f={C.caramel} o={pick}>weight drives each draw;</T>
      <T x={30} y={224} s={13} f={C.caramel} o={pick}>the final share differs once k {'>'} 1</T>
    </Svg>
  );
}

// 12 · WeightedKeys. Five items, weights 1, 1, 1, 1, 10, each with a uniform u (a dot); the key u^(1/w) rises from it,
// barely for weight one, far for weight ten. The two largest keys are kept; the smaller of them is the heap's minimum,
// the bar every later key must clear. The u values are an illustration.
const U = [0.62, 0.35, 0.81, 0.47, 0.3];
export function WeightedKeys({ t }: StepCtx) {
  const Y0 = 230, Y1 = 70;
  const py = (v: number) => Y0 - v * (Y0 - Y1);
  const cx = (i: number) => 110 + i * 95;
  const dots = easeOut(seg(t, 0.3, 1.0));
  const rise = easeInOut(seg(t, 1.3, 2.8));
  const keep = easeOut(seg(t, 3.0, 3.6));
  const keys = U.map((u, i) => u ** (1 / WTS[i]));
  const order = keys.map((_, i) => i).sort((a, b) => keys[b] - keys[a]);
  const kept = order.slice(0, 2);
  const minKey = keys[order[1]];
  return (
    <Svg label="Five items with weights one, one, one, one and ten, each drawing a uniform number, shown as a dot. The key, that number raised to one over the weight, rises from it: not at all for weight one, far for weight ten. The two largest keys are kept, and the smaller of them is the heap's minimum, the bar every later key must clear" h={290}>
      <T x={30} y={34} s={14} f={C.crema}>key = u^(1/w)</T>
      <line x1={60} y1={Y0} x2={560} y2={Y0} stroke={C.line} />
      <line x1={60} y1={Y1} x2={560} y2={Y1} stroke={C.line} strokeDasharray="2 4" />
      <T x={52} y={Y1 + 4} s={12} f={C.latte} a="end">1</T>
      <T x={52} y={Y0 + 4} s={12} f={C.latte} a="end">0</T>
      {U.map((u, i) => {
        const k = lerp(u, keys[i], rise);
        const isKept = kept.includes(i);
        const col = keep > 0 && isKept ? C.caramel : C.latte;
        return (
          <g key={i}>
            <rect x={cx(i) - 12} y={py(k)} width={24} height={Y0 - py(k)} fill={col} opacity={(0.3 + 0.5 * dots) * (keep > 0 && !isKept ? 1 - 0.5 * keep : 1)} />
            <circle cx={cx(i)} cy={py(u)} r={5} fill={C.crema} opacity={dots} />
            <T x={cx(i)} y={Y0 + 20} s={12} f={WTS[i] > 1 ? C.caramel : C.latte} a="middle">w {WTS[i]}</T>
          </g>
        );
      })}
      <g opacity={keep}>
        <line x1={60} y1={py(minKey)} x2={560} y2={py(minKey)} stroke={C.caramel} strokeDasharray="5 4" />
        <T x={560} y={278} s={12} f={C.caramel} a="end">dashed: the heap's minimum, the bar to clear</T>
      </g>
    </Svg>
  );
}

// 13 · WeightedExample. Inclusion chances on a scale from 0 past 1: the heavy item's bar stops just short of 1, each
// light item's near a quarter (both examples.py's seeded runs, drawn as shape only). The naive guess, 10/14 × 2 = 1.43,
// runs straight past the line at 1 in red.
const HEAVY = 0.934, LIGHT = 0.266; // examples.py's seeded frequencies, drawn as shape only
export function WeightedExample({ t }: StepCtx) {
  const X0 = 140, SC = 260;
  const a = easeOut(seg(t, 0.4, 1.4));
  const n = easeOut(seg(t, 2.2, 3.4));
  const over = easeOut(seg(t, 3.4, 4.0));
  return (
    <Svg label="Chances of being in the sample, on a scale from zero past one. The heavy item's bar stops just short of one; each light item's stops near a quarter. The naive guess, ten fourteenths times two, 1.43, runs straight past the line at one" h={280}>
      <line x1={X0 + SC} y1={40} x2={X0 + SC} y2={220} stroke={C.crema} strokeDasharray="4 3" />
      <T x={X0 + SC} y={32} s={12} f={C.crema} a="middle">1</T>
      <line x1={X0} y1={40} x2={X0} y2={220} stroke={C.line} />
      <T x={X0 - 10} y={78} s={12} f={C.caramel} a="end">heavy, w 10</T>
      <rect x={X0} y={64} width={HEAVY * SC * a} height={20} fill={C.caramel} />
      <T x={X0 - 10} y={128} s={12} f={C.latte} a="end">each light</T>
      <rect x={X0} y={114} width={LIGHT * SC * a} height={20} fill={C.latte} />
      <T x={X0 - 10} y={188} s={12} f={C.cherryText} a="end" o={n > 0 ? 1 : 0}>naive guess</T>
      <rect x={X0} y={174} width={1.43 * SC * n} height={20} fill={C.cherry} stroke={C.cherryText} strokeWidth={1} />
      <T x={X0 + 1.43 * SC + 6} y={189} s={13} f={C.cherryText} o={n >= 1 ? 1 : 0}>1.43</T>
      <T x={X0} y={250} s={12} f={C.cherryText} o={over}>10/14 × 2, past 1: not a probability</T>
    </Svg>
  );
}

// 14 · MergeAndProduction. Two reservoirs of k = 3: one from a stream of seven, one from a stream of three. Each output
// slot is decided by a split of 7 to 3; the output fills one slot at a time from the side the split picks (sequence an
// illustration). Every one of the ten items ends at 3/10. Then the production note: the sample travels with its count.
const PICKS = [0, 1, 0]; // which reservoir fills each output slot (illustration)
export function MergeAndProduction({ t }: StepCtx) {
  const resX = [40, 360];
  const outX = (j: number) => 210 + j * 62;
  const show = easeOut(seg(t, 0.2, 0.8));
  const split = easeOut(seg(t, 0.8, 1.4));
  const cur = stepIdx(t, 1.6, 3.4, 3);
  const fair = easeOut(seg(t, 3.4, 3.9));
  const prod = easeOut(seg(t, 4.0, 4.6));
  return (
    <Svg label="Two reservoirs of three: one sampled from a stream of seven, one from a stream of three. Each output slot is decided by a split of seven to three, filling one slot at a time from the side the split picks. Every one of the ten items ends at three tenths. A real range partitioner carries each sample's count alongside it" h={300}>
      <g opacity={show}>
        <T x={resX[0]} y={30} s={12} f={C.caramel}>saw 7 items</T>
        <T x={resX[1]} y={30} s={12} f={C.cinnamon}>saw 3 items</T>
        {resX.map((x0, r) => [0, 1, 2].map((s) => (
          <rect key={`${r}-${s}`} x={x0 + s * 60} y={42} width={50} height={26} rx={2} fill={r === 0 ? C.caramel : C.cinnamon} opacity={0.35 + 0.5 * (PICKS.filter((p, j) => p === r && j <= cur).length > s ? 0 : 1)} />
        )))}
      </g>
      <g opacity={split}>
        <rect x={180} y={102} width={168} height={16} fill={C.caramel} />
        <rect x={350} y={102} width={70} height={16} fill={C.cinnamon} />
        <T x={264} y={138} s={12} f={C.caramel} a="middle">7/10</T>
        <T x={385} y={138} s={12} f={C.cinnamon} a="middle">3/10</T>
      </g>
      {[0, 1, 2].map((j) => {
        const u = j < cur ? 1 : j === cur ? easeInOut(seg(t, 1.6 + j * 0.6, 2.1 + j * 0.6)) : 0;
        const r = PICKS[j];
        const sx = resX[r] + (PICKS.slice(0, j).filter((p) => p === r).length) * 60;
        return (
          <g key={j}>
            <rect x={outX(j)} y={160} width={50} height={26} rx={2} fill="none" stroke={C.crema} strokeWidth={1.2} opacity={split} />
            {u > 0 && <rect x={lerp(sx, outX(j), u)} y={lerp(42, 160, u)} width={50} height={26} rx={2} fill={r === 0 ? C.caramel : C.cinnamon} opacity={0.85} />}
          </g>
        );
      })}
      <T x={300} y={216} s={13} f={C.crema} a="middle" o={fair}>each of the 10 items: 3/10</T>
      <g opacity={prod}>
        <T x={40} y={256} s={12} f={C.caramel}>range partitioner: sample + its count</T>
        <T x={40} y={280} s={12} f={C.latte}>count-first sampler: a different problem</T>
      </g>
    </Svg>
  );
}

// 15 · Recap. The reservoir of three, each slot equally likely to hold any line; then a row of six items reorders
// itself, the next topic's question: every ordering equally likely.
const ORDER = [3, 0, 5, 1, 4, 2]; // an illustration
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.8));
  const b = easeOut(seg(t, 1.4, 2.0));
  const mv = easeInOut(seg(t, 2.2, 3.4));
  return (
    <Svg label="The reservoir of three, every line equally likely to be in it, read in one pass. Then a row of six items reorders itself: the next question, every ordering equally likely" h={260}>
      <g opacity={a}>
        <rect x={40} y={70} width={200} height={50} rx={4} fill="none" stroke={C.caramel} strokeWidth={1.4} />
        {[0, 1, 2].map((s) => <rect key={s} x={54 + s * 62} y={82} width={50} height={26} rx={2} fill={C.caramel} opacity={0.85} />)}
        <T x={40} y={150} s={13} f={C.caramel}>equally likely items</T>
        <T x={40} y={174} s={12} f={C.latte}>one pass, read once</T>
      </g>
      <g opacity={b}>
        {ORDER.map((to, i) => (
          <rect key={i} x={lerp(320 + i * 40, 320 + to * 40, mv)} y={lerp(82, 82 + (i % 2 ? -1 : 1) * 14 * Math.sin(Math.PI * mv), 1)} width={30} height={26} rx={2} fill={C.cinnamon} opacity={0.4 + i * 0.1} />
        ))}
        <T x={320} y={150} s={13} f={C.cinnamon}>equally likely orders</T>
        <T x={320} y={174} s={12} f={C.latte}>next</T>
      </g>
    </Svg>
  );
}
