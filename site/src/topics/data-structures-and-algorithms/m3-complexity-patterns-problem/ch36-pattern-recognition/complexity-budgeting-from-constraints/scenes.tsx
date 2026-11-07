import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = the problem statement's own text and a structure as it is;
// latte = secondary labels (n, a count, a cost); caramel = the thing to look at (the signal, the
// chosen growth rate); cinnamon (rare) = the alternative being compared (the budget line against
// the cost); cherry/cherryText = the bad outcome (a growth rate over budget, a method that misleads).
//
// Every printed number is examples.py's or Laaksonen's: 10^8 operations a second; n² at 100,000 =
// 10,000,000,000 (100 s); n log₂ n at 100,000 = 1,660,964 (0.017 s); the table's 3,628,800,
// 1,048,576, 125,000,000, 25,000,000, 19,931,569; 2^40 = 1,099,511,627,776 against two halves of
// 2^20 = 2,097,152; the signal checks' 30, 20, 20, 20 cases. The sequential and random timings are
// machine-dependent, so they are drawn as shape only (random longer, as examples.py asserts).

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

// 1 · Hook: the limit already answers before the problem is understood
export function DoubleLoopHook({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.6));
  const rows = stepIdx(t, 0.8, 2.0, 12);
  const cnt = easeOut(seg(t, 2.1, 2.5));
  const grow = easeInOut(seg(t, 2.7, 3.9));
  const end = easeOut(seg(t, 4.1, 4.6));
  const sec = 5.2; // pixels per second on the time line
  return (
    <Svg label="n is at most 100,000 and the limit is one second. Every pair, n by n, fills a square: 10,000,000,000 steps. On a time line the one-second limit is a sliver; the double loop's bar runs out to about 100 seconds" h={290}>
      <g opacity={a}>
        <T x={30} y={34} s={13} f={C.crema}>n ≤ 100,000</T>
        <T x={330} y={34} s={13} f={C.crema}>time limit: 1 second</T>
      </g>
      {Array.from({ length: 12 }).map((_, r) => (
        <rect key={r} x={30} y={62 + r * 10} width={120} height={9} fill={C.caramel} opacity={r <= rows ? 0.5 : 0} />
      ))}
      <rect x={30} y={62} width={120} height={120} fill="none" stroke={C.latte} strokeWidth={1} opacity={a} />
      <T x={170} y={92} s={12} f={C.latte} o={rows >= 0 ? 1 : 0}>every pair: n × n</T>
      <T x={170} y={118} s={13} f={C.caramel} o={cnt}>= 10,000,000,000 steps</T>
      <g opacity={easeOut(seg(t, 2.6, 2.9))}>
        <line x1={30} y1={230} x2={30 + 100 * sec} y2={230} stroke={C.mocha} strokeWidth={1} />
        <rect x={30} y={216} width={100 * sec * grow} height={14} fill={C.cherry} opacity={0.75} />
        <line x1={30 + sec} y1={204} x2={30 + sec} y2={238} stroke={C.cinnamon} strokeWidth={2} />
        <T x={30} y={198} s={11} f={C.cinnamon}>1 s limit</T>
        <T x={30 + 100 * sec} y={254} s={12} a="end" f={C.cherryText} o={grow > 0.98 ? 1 : 0}>≈ 100 s at 10⁸ a second</T>
      </g>
      <T x={300} y={282} s={12} a="middle" f={C.caramel} o={end}>the limit answered first</T>
    </Svg>
  );
}

// 2 · The rule of thumb: a time limit becomes a budget of operations
export function RuleOfThumb({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.6));
  const p = stepIdx(t, 1.0, 2.4, 3);
  const g = easeOut(seg(t, 2.6, 3.1));
  const probe = easeInOut(seg(t, 3.1, 4.0));
  return (
    <Svg label="An ordinary machine does about 100,000,000 simple operations a second. One second times that rate is a budget of 10⁸ operations, a capacity line an algorithm is checked against before any of it is written" h={260}>
      <g opacity={a}>
        <T x={300} y={36} s={12} a="middle" f={C.latte}>an ordinary machine, one second:</T>
        <T x={300} y={64} s={15} a="middle" f={C.caramel}>≈ 100,000,000 simple operations</T>
      </g>
      {[
        [100, '1 s limit', C.crema],
        [300, '× 10⁸ a second', C.latte],
        [480, '= 10⁸ operations', C.caramel],
      ].map(([x, s, f], i) => (
        <T key={i} x={x as number} y={120} s={13} a="middle" f={f as string} o={p >= i ? 1 : 0}>{s as string}</T>
      ))}
      <g opacity={g}>
        <rect x={60} y={160} width={480} height={26} fill="none" stroke={C.latte} strokeWidth={1.2} />
        <line x1={540} y1={150} x2={540} y2={196} stroke={C.cinnamon} strokeWidth={2} />
        <T x={540} y={144} s={11} a="end" f={C.cinnamon}>the budget</T>
        <rect x={61} y={161} width={lerp(0, 300, probe)} height={24} fill={C.crema} opacity={0.35} />
        <T x={300} y={226} s={12} a="middle" f={C.crema} o={probe}>check the algorithm here, before writing it</T>
      </g>
    </Svg>
  );
}

const L = (v: number, x0: number, perDecade: number, from = 6) => x0 + (Math.log10(v) - from) * perDecade;

// 3 · Predict: which growth rate fits at n = 100,000?
export function PredictBudgetFit({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const a = easeOut(seg(t, 0.1, 0.6));
  const b = easeOut(seg(t, 0.8, 1.4));
  const ask = easeOut(seg(t, 1.8, 2.3));
  const g1 = answered ? easeInOut(seg(s, 0.2, 1.0)) : 0;
  const g2 = answered ? easeInOut(seg(s, 0.8, 2.0)) : 0;
  const x = (v: number) => L(v, 140, 105);
  return (
    <Svg label="A log-scale axis from 10⁶ to 10¹⁰ operations with the budget, 10⁸, marked. After answering, n log n's bar stops at 1,660,964, inside the budget; n squared's runs to 10,000,000,000, about 100 seconds" h={270}>
      <g opacity={a}>
        <line x1={140} y1={200} x2={x(1e10)} y2={200} stroke={C.mocha} strokeWidth={1} />
        {[6, 7, 8, 9, 10].map((e) => (
          <g key={e}>
            <line x1={x(10 ** e)} y1={196} x2={x(10 ** e)} y2={204} stroke={C.mocha} strokeWidth={1} />
            <T x={x(10 ** e)} y={220} s={11} a="middle" f={C.latte}>{`10${['⁶', '⁷', '⁸', '⁹', '¹⁰'][e - 6]}`}</T>
          </g>
        ))}
        <line x1={x(1e8)} y1={50} x2={x(1e8)} y2={200} stroke={C.cinnamon} strokeWidth={2} />
        <T x={x(1e8)} y={40} s={11} a="middle" f={C.cinnamon}>budget, 1 s</T>
      </g>
      <g opacity={b}>
        <T x={30} y={94} s={13} f={C.crema}>n log n</T>
        <T x={30} y={154} s={13} f={C.crema}>n²</T>
        <rect x={140} y={78} width={Math.max(2, (x(1660964) - 140) * g1)} height={22} fill={C.crema} opacity={0.6 * g1} />
        <rect x={140} y={138} width={(x(1e10) - 140) * g2} height={22} fill={C.cherry} opacity={0.75 * (g2 > 0 ? 1 : 0)} />
      </g>
      <T x={362} y={94} s={12} f={C.crema} o={g1}>1,660,964: 0.017 s</T>
      <T x={362} y={130} s={11} f={C.cherryText} o={g2 > 0.98 ? 1 : 0}>10,000,000,000: 100 s</T>
      <T x={300} y={256} s={12} a="middle" f={C.caramel} o={g1 > 0 ? 0 : ask}>which one fits inside the line?</T>
      <T x={300} y={256} s={11} a="middle" f={C.latte} o={g1}>log scale: each tick is ten times the last</T>
    </Svg>
  );
}

// 4 · The budget table, derived row by row
export function BudgetTableDerived({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.5));
  const r = stepIdx(t, 0.5, 4.3, 6);
  const end = easeOut(seg(t, 4.6, 5.1));
  const rows: [string, string, string, number | null][] = [
    ['10', 'n!', '3,628,800', 3628800],
    ['20', '2ⁿ', '1,048,576', 1048576],
    ['500', 'n³', '125,000,000', 125000000],
    ['5,000', 'n²', '25,000,000', 25000000],
    ['1,000,000', 'n log n', '19,931,569', 19931569],
    ['larger', 'log n, 1', '', null],
  ];
  const x = (v: number) => L(v, 430, 35, 5);
  return (
    <Svg label="A table derived by dividing the budget by each growth rate: n = 10 allows n!, 3,628,800; 20 allows 2ⁿ, 1,048,576; 500 allows n³, 125,000,000; 5,000 allows n², 25,000,000; a million allows n log n, 19,931,569; past that only log n or constant work. Each row's bar sits at or under the budget line" h={300}>
      <g opacity={a}>
        <T x={30} y={26} s={11} f={C.latte}>n up to</T>
        <T x={140} y={26} s={11} f={C.latte}>allows</T>
        <T x={240} y={26} s={11} f={C.latte}>operations</T>
        <line x1={x(1e8)} y1={36} x2={x(1e8)} y2={262} stroke={C.cinnamon} strokeWidth={1.6} />
        <T x={x(1e8)} y={278} s={11} a="middle" f={C.cinnamon}>10⁸</T>
      </g>
      {rows.map(([n, rate, ops, v], i) => {
        const y = 58 + i * 38;
        return (
          <g key={n} opacity={i <= r ? 1 : 0}>
            <T x={30} y={y} s={12} f={C.crema}>{n}</T>
            <T x={140} y={y} s={13} f={C.caramel}>{rate}</T>
            <T x={240} y={y} s={12} f={C.latte}>{ops}</T>
            {v !== null && <rect x={430} y={y - 12} width={x(v) - 430} height={14} fill={C.crema} opacity={0.45} />}
          </g>
        );
      })}
      <T x={30} y={296} s={11} f={C.latte} o={end}>one division per row: budget ÷ growth</T>
    </Svg>
  );
}

// 5 · Meet in the middle: n = 40 is hopeless whole, fine in halves
export function MeetInTheMiddle({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.6));
  const whole = easeOut(seg(t, 0.8, 1.4));
  const split = easeInOut(seg(t, 1.8, 2.6));
  const halves = easeOut(seg(t, 2.8, 3.4));
  const end = easeOut(seg(t, 3.8, 4.4));
  return (
    <Svg label="Forty choices in a row. Trying all of them is 2^40, 1,099,511,627,776. Split into two halves of twenty, each half is 2^20, 1,048,576, and the two together 2,097,152, then combined" h={280}>
      <T x={30} y={30} s={12} f={C.latte} o={a}>40 choices</T>
      {Array.from({ length: 40 }).map((_, i) => {
        const left = i < 20;
        const dx = (left ? -8 : 8) * split;
        return (
          <rect key={i} x={36 + i * 13.2 + dx} y={46} width={9} height={18} fill="none" stroke={split > 0.5 ? C.caramel : C.crema} strokeWidth={1.2} opacity={a} />
        );
      })}
      <g opacity={whole * (1 - 0.6 * halves)}>
        <T x={300} y={104} s={13} a="middle" f={C.cherryText}>try them all: 2⁴⁰ = 1,099,511,627,776</T>
      </g>
      <g opacity={halves}>
        <T x={160} y={150} s={12} a="middle" f={C.crema}>2²⁰ = 1,048,576</T>
        <T x={440} y={150} s={12} a="middle" f={C.crema}>2²⁰ = 1,048,576</T>
        <path d="M160 160 L300 196 M440 160 L300 196" stroke={C.latte} strokeWidth={1.2} fill="none" />
      </g>
      <g opacity={end}>
        <T x={300} y={222} s={14} a="middle" f={C.caramel}>2,097,152, then combine</T>
        <T x={300} y={256} s={12} a="middle" f={C.latte}>a few million, not a trillion</T>
      </g>
    </Svg>
  );
}

/** A fixed visiting order for the random pass (illustration only: the measured pass shuffles two million). */
const JUMPS = [17, 3, 21, 9, 14, 0, 11, 23, 6, 19, 2, 12];

// 6 · The budget assumed cache hits: in order against at random
export function CacheFriendlyMeasured({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.5));
  const sq = stepIdx(t, 0.4, 1.9, 24);
  const rd = stepIdx(t, 2.0, 3.6, JUMPS.length);
  const bars = easeInOut(seg(t, 3.8, 4.6));
  const cx = (i: number) => 42 + i * 22;
  const cur = rd >= 0 ? JUMPS[rd] : sq;
  const isRand = rd >= 0;
  return (
    <Svg label="One array of cells. A pointer sweeps it in order, each read next to the last. Then it jumps about at random, each jump a cache miss. Measured on the same count of reads, the random pass's bar comes out longer than the in-order one" h={280}>
      <T x={30} y={98} s={12} f={C.latte} o={a}>one array in memory</T>
      {Array.from({ length: 24 }).map((_, i) => (
        <rect key={i} x={cx(i) - 9} y={48} width={18} height={22} fill={i === cur && sq >= 0 ? (isRand ? C.cherry : C.caramel) : 'none'} fillOpacity={0.7} stroke={C.mocha} strokeWidth={1} opacity={a} />
      ))}
      {isRand && rd > 0 && (
        <path d={`M${cx(JUMPS[rd - 1])} 46 Q${(cx(JUMPS[rd - 1]) + cx(JUMPS[rd])) / 2} 10 ${cx(JUMPS[rd])} 46`} fill="none" stroke={C.cherry} strokeWidth={1.4} />
      )}
      <T x={30} y={124} s={12} f={C.crema} o={sq >= 0 ? 1 : 0}>in order: the next read is already cached</T>
      <T x={30} y={148} s={12} f={C.cherryText} o={isRand ? 1 : 0}>at random: a cache miss per read</T>
      <g opacity={bars > 0 ? 1 : 0}>
        <T x={30} y={186} s={12} f={C.latte}>in order</T>
        <rect x={140} y={174} width={140 * bars} height={16} fill={C.crema} opacity={0.6} />
        <T x={30} y={220} s={12} f={C.latte}>at random</T>
        <rect x={140} y={208} width={360 * bars} height={16} fill={C.cherry} opacity={0.75} />
        <T x={300} y={262} s={12} a="middle" f={C.cherryText} o={bars > 0.98 ? 1 : 0}>same reads, measured: random is slower</T>
      </g>
    </Svg>
  );
}

// 7 · Four signal words, each checked against brute force
export function SignalWords({ t }: StepCtx) {
  const r = stepIdx(t, 0.2, 3.4, 4);
  const since = (i: number) => t - (0.2 + i * 0.8);
  const rows: [string, string, string][] = [
    ['"sorted"', 'binary search', '30'],
    ['"k-th"', 'a size-k heap', '20'],
    ['"all pairs"', 'is n² affordable?', '20'],
    ['"min max"', 'search the answer', '20'],
  ];
  // mini animations, one per row, at x 430..570
  const halving = (s: number) => {
    const k = Math.min(3, Math.max(0, Math.floor(s / 0.5)));
    const w = 128 / 2 ** k;
    return <rect x={436 + (128 - w) / 2} y={-14} width={w} height={20} fill={C.caramel} opacity={0.3} />;
  };
  return (
    <Svg label="Four rows. 'sorted' points to binary search, an interval halving; 'k-th' to a size-k heap keeping the k smallest; 'all pairs' to the question of whether n squared fits, a triangle of pairs; 'minimum maximum' to binary search over the answer, a predicate false then true. Each checked against brute force on 30, 20, 20 and 20 cases" h={300}>
      {rows.map(([w, tech, n], i) => {
        const y = 50 + i * 66;
        const s = since(i);
        return (
          <g key={w} opacity={i <= r ? 1 : 0}>
            <T x={30} y={y} s={13} f={C.caramel}>{w}</T>
            <T x={196} y={y} s={12} f={C.crema}>{tech}</T>
            <T x={196} y={y + 20} s={12} f={C.latte}>{`checked: ${n} cases`}</T>
            <g transform={`translate(0 ${y})`}>
              {i === 0 && (
                <g>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <rect key={j} x={436 + j * 16} y={-12} width={14} height={16} fill="none" stroke={C.mocha} strokeWidth={1} />
                  ))}
                  {halving(s)}
                </g>
              )}
              {i === 1 &&
                [5, 2, 8, 1, 9, 3, 7].map((v, j) => (
                  <circle key={j} cx={442 + j * 19} cy={-4} r={6} fill={s > 0.5 && v <= 3 ? C.caramel : 'none'} stroke={C.latte} strokeWidth={1} />
                ))}
              {i === 2 &&
                Array.from({ length: 6 }).map((_, p) =>
                  Array.from({ length: 6 }).map((__, q) =>
                    q > p ? <rect key={`${p}${q}`} x={460 + q * 12} y={-20 + p * 6} width={10} height={5} fill={C.crema} opacity={s > (p * 6 + q) * 0.03 ? 0.6 : 0} /> : null,
                  ),
                )}
              {i === 3 && (
                <g>
                  {['F', 'F', 'F', 'F', 'T', 'T', 'T'].map((v, j) => (
                    <T key={j} x={444 + j * 18} y={0} s={12} a="middle" f={v === 'T' ? C.caramel : C.latte}>{v}</T>
                  ))}
                  <path d={`M${444 + 18 * (s > 1.2 ? 4 : s > 0.6 ? 5 : 3)} 8 l-4 8 l8 0 Z`} fill={C.caramel} opacity={s > 0 ? 1 : 0} />
                </g>
              )}
            </g>
          </g>
        );
      })}
    </Svg>
  );
}

// 8 · Predict: an exact algorithm misses the budget at a small n
export function PredictBudgetExit({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const a = easeOut(seg(t, 0.1, 0.6));
  const grow = easeInOut(seg(t, 0.7, 1.8));
  const ask = easeOut(seg(t, 2.2, 2.7));
  const rev = answered ? easeOut(seg(s, 0.2, 1.0)) : 0;
  const rev2 = answered ? easeOut(seg(s, 1.0, 1.8)) : 0;
  return (
    <Svg label="A small n kept small on purpose, and an exact algorithm's bar still running past the budget line. After answering, a faster exact algorithm is struck through; the way out is an approximation or a heuristic, because the problem itself may be hard" h={260}>
      <g opacity={a}>
        <T x={30} y={36} s={13} f={C.crema}>n kept small, on purpose</T>
        <line x1={340} y1={60} x2={340} y2={130} stroke={C.cinnamon} strokeWidth={2} />
        <T x={340} y={150} s={11} a="middle" f={C.cinnamon}>budget</T>
        <T x={30} y={100} s={12} f={C.latte}>exact</T>
        <rect x={100} y={86} width={lerp(0, 420, grow)} height={20} fill={C.cherry} opacity={0.75} />
      </g>
      <T x={300} y={200} s={12} a="middle" f={C.caramel} o={rev > 0 ? 0 : ask}>only about speed?</T>
      <g opacity={rev}>
        <T x={30} y={190} s={12} f={C.taupe}>a faster exact algorithm</T>
        <line x1={28} y1={186} x2={276} y2={186} stroke={C.cherry} strokeWidth={1.4} />
      </g>
      <T x={330} y={190} s={12} f={C.cinnamon} o={rev2}>approximate, or a heuristic</T>
      <T x={300} y={238} s={12} a="middle" f={C.caramel} o={rev2}>a tell: the problem itself may be hard</T>
    </Svg>
  );
}

// 9 · Necessary, not sufficient
export function NecessaryNotSufficient({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.6));
  const pass = easeInOut(seg(t, 0.8, 2.0));
  const verdict = easeOut(seg(t, 2.3, 2.9));
  const end = easeOut(seg(t, 3.2, 3.7));
  const algos: [string, boolean, boolean][] = [
    ['n³', false, false],
    ['n log n', true, true],
    ['2ⁿ', false, false],
    ['n', true, false],
    ['n²', false, false],
    ['n log n', true, true],
  ];
  return (
    <Svg label="Six candidate algorithms meet the budget gate. The three over budget stop at it; three pass. Of those three, two compute the right answer and one computes a wrong answer quickly" h={260}>
      <g opacity={a}>
        <line x1={300} y1={40} x2={300} y2={210} stroke={C.cinnamon} strokeWidth={2} />
        <T x={300} y={30} s={11} a="middle" f={C.cinnamon}>fits the budget?</T>
      </g>
      {algos.map(([lab, fits, right], i) => {
        const y = 50 + i * 28;
        const x = fits ? lerp(60, 340, pass) : lerp(60, 200, pass);
        return (
          <g key={i} opacity={a}>
            <rect x={x} y={y} width={84} height={22} fill="none" stroke={fits ? C.crema : C.taupe} strokeWidth={1.2} />
            <T x={x + 42} y={y + 16} s={12} a="middle" f={fits ? C.crema : C.taupe}>{lab}</T>
            {fits && (
              <T x={440} y={y + 16} s={12} f={right ? C.cinnamon : C.cherryText} o={verdict}>{right ? 'right answer' : 'wrong, quickly'}</T>
            )}
          </g>
        );
      })}
      <T x={300} y={246} s={12} a="middle" f={C.caramel} o={end}>fits the budget: necessary, never sufficient</T>
    </Svg>
  );
}

// 10 · Recap: three questions, then the data's organisation
export function Recap({ t }: StepCtx) {
  const q = stepIdx(t, 0.2, 2.6, 3);
  const b = easeOut(seg(t, 3.0, 3.5));
  const c = easeOut(seg(t, 3.9, 4.4));
  const qs = ['what is n, and what are the values?', 'what does the limit allow?', 'what do the signal words point at?'];
  return (
    <Svg label="Three questions, one after another: what is n and what are the values, what does the limit allow, what do the signal words point at. The budget says how much work; next, how to organise the data to do it" h={260}>
      {qs.map((s, i) => (
        <g key={i} opacity={i <= q ? 1 : 0}>
          <T x={30} y={44 + i * 36} s={12} f={C.latte}>{`${i + 1}.`}</T>
          <T x={60} y={44 + i * 36} s={13} f={C.crema}>{s}</T>
        </g>
      ))}
      <T x={30} y={184} s={12} f={C.latte} o={b}>the budget: how much work is allowed</T>
      <T x={30} y={218} s={13} f={C.caramel} o={c}>next: how to organise the data to do it</T>
    </Svg>
  );
}
