import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeOut, easeOutBack, lerp, rng, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar: caramel = the thing to look at, cherry/cherryText = a bad outcome (overflow, mismatch,
// lost precision), taupe = quiet/waiting, latte = labels, crema = data, cinnamon = the alternative compared.
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

// 1 · Four numbers, four ways to lie.
export function Problem({ t }: StepCtx) {
  const cols = [
    { k: 'order_id', d: 'integer' },
    { k: 'status', d: 'text' },
    { k: 'amount', d: 'decimal' },
    { k: 'event_time', d: 'timestamp' },
  ];
  return (
    <Svg label="The orders table: one hundred million rows, with an integer id, a status, a decimal amount and a microsecond timestamp" h={340}>
      <T x={25} y={34} s={14} f={C.latte}>orders · 100,000,000 rows</T>
      {cols.map((c, i) => {
        const a = easeOut(seg(t, 0.2 + i * 0.4, 0.9 + i * 0.4));
        const x = 25 + i * 140;
        return (
          <g key={c.k} opacity={a} transform={`translate(0 ${(1 - a) * 14})`}>
            <rect x={x} y={54} width={120} height={70} rx={10} fill={C.roast} stroke={i < 3 ? C.caramel : C.cinnamon} strokeWidth={1.5} />
            <T x={x + 60} y={88} s={13} f={C.crema} a="middle">{c.k}</T>
            <T x={x + 60} y={110} s={11} f={C.taupe} a="middle">{c.d}</T>
          </g>
        );
      })}
      <T x={300} y={176} s={15} f={C.cherryText} a="middle" o={easeOut(seg(t, 2.0, 2.8))}>a fixed-width box, each standing in</T>
      <T x={300} y={198} s={15} f={C.cherryText} a="middle" o={easeOut(seg(t, 2.0, 2.8))}>for an idea with no limit</T>
    </Svg>
  );
}

// 2 · A thirty-two-bit box runs out fast.
export function IntBox({ t }: StepCtx) {
  const fill = easeOut(seg(t, 0.3, 2.2));
  const burst = easeOut(seg(t, 2.4, 3.0));
  return (
    <Svg label="A thirty-two-bit counter fills toward two billion one hundred forty seven million and change, in under two weeks at a few thousand events a second" h={320}>
      <T x={25} y={34} s={14} f={C.latte}>order_id, 32 bits</T>
      <rect x={25} y={50} width={500} height={30} rx={8} fill={C.cocoa} />
      <rect x={25} y={50} width={500 * fill} height={30} rx={8} fill={C.caramel} />
      <T x={300} y={110} s={26} f={C.caramel} a="middle" w={700}>2,147,483,647</T>
      <T x={300} y={140} s={13} f={C.taupe} a="middle">the largest 32-bit signed value</T>
      <g opacity={burst}>
        <T x={300} y={210} s={16} f={C.cherryText} a="middle">under two weeks, at a few thousand events a second</T>
      </g>
    </Svg>
  );
}

// 3 · Predict: one past the limit.
export function OverflowPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const engines = ['PostgreSQL', 'Spark', 'NumPy', 'Python'];
  const outcome = ['raises', 'raises', 'wraps', 'never overflows'];
  return (
    <Svg label="Four engines, one overflow: PostgreSQL and Spark raise, NumPy wraps silently, Python's own integers never overflow" h={320}>
      {!answered && <T x={300} y={110} s={50} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
      {!answered && <T x={300} y={160} s={14} f={C.latte} a="middle">max + 1 = ?</T>}
      {answered &&
        engines.map((e, i) => {
          const a = easeOutBack(seg(t, i * 0.2, i * 0.2 + 0.6));
          const bad = outcome[i] === 'wraps';
          return (
            <g key={e} opacity={clamp(a)} transform={`translate(0 ${(1 - a) * 10})`}>
              <T x={25} y={60 + i * 56} s={15} f={C.crema}>{e}</T>
              <T x={575} y={60 + i * 56} s={15} f={bad ? C.cherryText : C.caramel} a="end" w={600}>{outcome[i]}</T>
            </g>
          );
        })}
    </Svg>
  );
}

// 4 · A number line with uneven spacing.
export function UlpLine({ t }: StepCtx) {
  const ticksNear = 14;
  const spread = easeOut(seg(t, 0.3, 1.8));
  const far = easeOut(seg(t, 2.0, 3.0));
  return (
    <Svg label="Near one the representable ticks are packed close; past about nine quadrillion the gap between ticks is two, so odd numbers vanish" h={340}>
      <T x={25} y={34} s={14} f={C.latte}>near 1.0: ticks packed tight</T>
      {Array.from({ length: ticksNear }, (_, i) => (
        <line key={i} x1={25 + i * 10} y1={50} x2={25 + i * 10} y2={76} stroke={C.caramel} strokeWidth={2} />
      ))}
      <T x={25} y={150} s={14} f={C.latte} o={spread}>near 2^52: ticks spread apart</T>
      {Array.from({ length: 8 }, (_, i) => (
        <line key={i} x1={25 + i * 40} y1={166 + 92} x2={25 + i * 40} y2={166 + 92 + 26} stroke={C.caramel} strokeWidth={2} opacity={spread} />
      ))}
      <T x={300} y={318} s={16} f={C.cherryText} a="middle" o={far}>past 9,007,199,254,740,992 the gap is 2:</T>
      <T x={300} y={340} s={16} f={C.cherryText} a="middle" o={far}>odd integers vanish</T>
    </Svg>
  );
}

// 5 · Predict: does grouping change the sum?
export function AssocPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const chips = ['0.1', '0.2', '0.3'];
  return (
    <Svg label="One tenth, two tenths, three tenths, grouped two different ways; the totals agree in every digit but the last" h={300}>
      {chips.map((c, i) => {
        const a = easeOutBack(seg(t, i * 0.2, i * 0.2 + 0.6));
        return (
          <g key={c} transform={`translate(${180 + i * 120} 90) scale(${a})`} opacity={clamp(a)}>
            <rect x={-45} y={-28} width={90} height={56} rx={12} fill={C.roast} stroke={C.caramel} strokeWidth={1.5} />
            <T x={0} y={8} s={20} f={C.crema} a="middle" w={600}>{c}</T>
          </g>
        );
      })}
      {!answered && <T x={300} y={200} s={46} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
      {answered && (
        <>
          <T x={300} y={200} s={18} f={C.crema} a="middle">(0.1 + 0.2) + 0.3 ≠ 0.1 + (0.2 + 0.3)</T>
          <T x={300} y={230} s={14} f={C.cherryText} a="middle">different, only in the last decimal place</T>
        </>
      )}
    </Svg>
  );
}

// 6 · A shuffle scrambles the order.
export function ShuffleSum({ t }: StepCtx) {
  const N = 24;
  const r = rng(9);
  const order = Array.from({ length: N }, (_, i) => i);
  const settle = easeOut(seg(t, 0.4, 2.4));
  return (
    <Svg label="A million amounts, summed from many machines in no fixed order; the running total absorbs small amounts differently each run" h={320}>
      <T x={25} y={34} s={14} f={C.latte}>1,000,000 amounts, arriving from many machines</T>
      {order.map((i) => {
        const a = easeOut(seg(t, (r() * 0.3) + (i / N) * 1.2, (r() * 0.3) + (i / N) * 1.2 + 0.5));
        const x = 25 + i * 23;
        const y = lerp(60, 150, a) + Math.sin(i * 1.7) * 10 * (1 - settle);
        return <circle key={i} cx={x} cy={y} r={6} fill={i % 5 === 0 ? C.cherry : C.caramel} opacity={clamp(a)} />;
      })}
      <T x={300} y={220} s={16} f={C.crema} a="middle" o={settle}>same query, different total, on different runs</T>
    </Svg>
  );
}

// 7 · Lanes and cores reorder it again.
export function SimdCores({ t }: StepCtx) {
  const lanes = 4;
  const cores = 4;
  const laneA = easeOut(seg(t, 0.3, 1.4));
  const coreA = easeOut(seg(t, 1.8, 3.0));
  return (
    <Svg label="A vectorized engine sums several lanes at once and combines them; many cores each build a partial sum merged in finishing order" h={320}>
      <T x={25} y={34} s={14} f={C.latte}>SIMD lanes, summed together</T>
      {Array.from({ length: lanes }, (_, i) => (
        <rect key={i} x={25 + i * 60} y={48} width={48} height={30} rx={6} fill={C.caramel} opacity={laneA} />
      ))}
      <T x={25} y={150} s={14} f={C.latte} o={coreA}>cores, each a partial sum</T>
      {Array.from({ length: cores }, (_, i) => (
        <rect key={i} x={25 + i * 60} y={164} width={48} height={30} rx={6} fill={C.cinnamon} opacity={coreA} />
      ))}
      <T x={300} y={250} s={16} f={C.cherryText} a="middle" o={coreA}>change the parallelism, the last digits move</T>
    </Svg>
  );
}

// 8 · A careful sum stops depending on order.
export function Compensated({ t }: StepCtx) {
  const drop = easeOut(seg(t, 0.3, 1.6));
  const recover = easeOut(seg(t, 1.8, 3.0));
  return (
    <Svg label="A compensated summation keeps a second running term for the bits that would fall off the end, so the answer no longer depends on order" h={300}>
      <T x={25} y={34} s={14} f={C.latte}>running total</T>
      <rect x={25} y={48} width={300} height={30} rx={7} fill={C.caramel} />
      <rect x={330} y={48} width={60 * drop} height={30} rx={7} fill={C.cherry} opacity={drop} />
      <T x={575} y={68} s={13} f={C.cherryText} a="end" o={drop}>bits that fall off the end</T>
      <path d="M360 90 Q 360 140 180 150" stroke={C.taupe} strokeWidth={2} fill="none" opacity={recover} />
      <rect x={25} y={150} width={300} height={30} rx={7} fill={C.caramel} opacity={recover} />
      <rect x={25} y={150} width={60 * recover} height={30} rx={7} fill={C.caramel} opacity={recover} />
      <T x={300} y={230} s={15} f={C.crema} a="middle" o={recover}>one answer, whatever the order</T>
    </Svg>
  );
}

// 9 · Multiply two decimals, precision grows.
export function DecimalPrecision({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.2));
  const b = easeOut(seg(t, 1.4, 2.2));
  const result = easeOut(seg(t, 2.4, 3.2));
  return (
    <Svg label="DECIMAL twelve two times DECIMAL five four: no rounding, but the result's scale is the sum of the input scales, six" h={320}>
      <T x={25} y={40} s={16} f={C.crema} o={a}>DECIMAL(12, 2)</T>
      <T x={200} y={40} s={16} f={C.latte} o={a}>× scale 2</T>
      <T x={25} y={90} s={16} f={C.crema} o={b}>DECIMAL(5, 4)</T>
      <T x={200} y={90} s={16} f={C.latte} o={b}>scale 4</T>
      <line x1={25} y1={120} x2={400} y2={120} stroke={C.taupe} opacity={result} />
      <T x={25} y={160} s={20} f={C.caramel} w={700} o={result}>result scale: 6</T>
      <T x={25} y={200} s={14} f={C.cherryText} o={easeOut(seg(t, 3.0, 3.6))}>chain a few more: the engine's precision</T>
      <T x={25} y={220} s={14} f={C.cherryText} o={easeOut(seg(t, 3.0, 3.6))}>ceiling, then overflow</T>
    </Svg>
  );
}

// 10 · Predict: how far can nanoseconds reach?
export function TimestampRangePredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const range = answered ? 1 : 0.3 + 0.3 * Math.sin(t * 2);
  return (
    <Svg label="A sixty-four-bit count of nanoseconds reaches about two hundred ninety two years either side of nineteen seventy" h={300}>
      <T x={300} y={40} s={14} f={C.latte} a="middle">64-bit nanoseconds, counting from 1970</T>
      <line x1={60} y1={120} x2={540} y2={120} stroke={C.taupe} strokeWidth={2} />
      <circle cx={300} cy={120} r={6} fill={C.crema} />
      <rect x={lerp(300, 60, range)} y={112} width={Math.abs(300 - lerp(300, 60, range))} height={16} rx={6} fill={C.caramel} opacity={0.8} />
      <rect x={300} y={112} width={Math.abs(lerp(300, 540, range) - 300)} height={16} rx={6} fill={C.caramel} opacity={0.8} />
      {!answered && <T x={300} y={190} s={40} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
      {answered && (
        <>
          <T x={300} y={190} s={24} f={C.caramel} a="middle" w={700}>about 292 years</T>
          <T x={300} y={220} s={14} f={C.crema} a="middle">roughly 1677 to 2262</T>
        </>
      )}
    </Svg>
  );
}

// 11 · Two clocks, two tick sizes, a silent miss.
export function TimestampMismatch({ t }: StepCtx) {
  const write = easeOut(seg(t, 0.2, 1.0));
  const read = easeOut(seg(t, 1.4, 2.2));
  const join = easeOut(seg(t, 2.6, 3.4));
  return (
    <Svg label="A microsecond timestamp written to a file is read back rounded to milliseconds; the two counts no longer match, and a join on them drops rows" h={320}>
      <T x={25} y={40} s={14} f={C.latte} o={write}>written: microseconds</T>
      <rect x={25} y={54} width={220} height={30} rx={7} fill={C.caramel} opacity={write} />
      <T x={300} y={40} s={14} f={C.latte} o={read}>read back: milliseconds</T>
      <rect x={300} y={54} width={180} height={30} rx={7} fill={C.cinnamon} opacity={read} />
      <T x={300} y={130} s={16} f={C.cherryText} a="middle" o={join}>no longer equal: the join silently drops the row</T>
      <T x={300} y={170} s={13} f={C.taupe} a="middle" o={join}>pin the same tick size on both sides</T>
    </Svg>
  );
}

// 12 · Back to the shop: one rule for money.
export function Verdict({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.0));
  const b = easeOut(seg(t, 1.1, 1.9));
  const rows = [
    { label: 'as a binary float', value: 'two totals, two runs', color: C.cherry, o: a },
    { label: 'as a DECIMAL', value: 'one total, every run', color: C.caramel, o: b },
  ];
  return (
    <Svg label="The same amount column, summed as a float, gives two totals across two orders; summed as a decimal, gives one" h={280}>
      {rows.map((r, i) => (
        <g key={r.label} opacity={r.o} transform={`translate(0 ${(1 - r.o) * 10})`}>
          <T x={25} y={70 + i * 90} s={15} f={C.latte}>{r.label}</T>
          <T x={25} y={104 + i * 90} s={24} f={r.color} w={700}>{r.value}</T>
        </g>
      ))}
    </Svg>
  );
}
