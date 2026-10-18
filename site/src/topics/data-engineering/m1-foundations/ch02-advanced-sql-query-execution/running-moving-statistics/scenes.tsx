import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar: caramel = the window or the chosen value, cherryText = the misleading or costly one, crema = data,
// latte = labels, taupe = structure.

const QUIET = [1, 3, 5, 7, 9, 11, 12];
const BUSY = [100, 100, 100, 101, 101, 101, 101];

function Dots({ days, y, lo, hi, color }: { days: number[]; y: number; lo: number; hi: number; color: (i: number) => string }) {
  const x = (d: number) => 30 + ((d - lo) / (hi - lo)) * 540;
  return (
    <g>
      <line x1={25} y1={y} x2={575} y2={y} stroke={C.taupe} strokeWidth={2} />
      {days.map((d, i) => <circle key={i} cx={x(d) + (days.indexOf(d) !== i ? ((i * 5) % 12) - 6 : 0)} cy={y - (days.indexOf(d) !== i ? ((i * 7) % 18) : 0)} r={7} fill={color(i)} />)}
      <T x={x(lo)} y={y + 24} s={13} f={C.latte}>{String(lo)}</T>
      <T x={x(hi)} y={y + 24} s={13} f={C.latte} a="end">{String(hi)}</T>
    </g>
  );
}

// 1 · Overview.
export function Overview({ t }: StepCtx) {
  const items = [['running total', 'a tally is enough'], ['moving average', 'a tally, with rows leaving'], ['median, p99', 'the whole ordered set']];
  return (
    <Svg label="Running totals and moving averages need a tally; percentiles need the whole ordered set" h={280}>
      {items.map((it, i) => (
        <g key={it[0]} opacity={easeOut(seg(t, i * 0.7, i * 0.7 + 0.7))}>
          <T x={25} y={60 + i * 70} s={18} f={i === 2 ? C.cherryText : C.caramel} w={700}>{it[0]}</T>
          <T x={25} y={86 + i * 70} s={14} f={C.latte}>{it[1]}</T>
        </g>
      ))}
    </Svg>
  );
}

// 2 · Grow vs slide.
export function GrowSlide({ t }: StepCtx) {
  const cur = Math.min(13, Math.floor(seg(t, 0.4, 3.4) * 14));
  return (
    <Svg label="A cumulative frame only grows; a moving frame slides" h={260}>
      <T x={25} y={36} s={14} f={C.latte}>cumulative: start → current</T>
      {Array.from({ length: 14 }, (_, i) => <rect key={i} x={25 + i * 39} y={48} width={32} height={26} rx={5} fill={i <= cur ? C.caramel : C.cocoa} stroke={C.mocha} />)}
      <T x={25} y={130} s={14} f={C.latte}>moving: the last 7 rows</T>
      {Array.from({ length: 14 }, (_, i) => <rect key={i} x={25 + i * 39} y={142} width={32} height={26} rx={5} fill={i <= cur && i > cur - 7 ? C.caramel : C.cocoa} stroke={C.mocha} />)}
      <T x={25} y={214} s={13} f={C.cherryText} o={easeOut(seg(t, 3.0, 3.8))}>rows leaving the frame must be subtracted out</T>
    </Svg>
  );
}

// 3 · ROWS lies.
export function RowsLie({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const a = easeOut(seg(t, 0.4, 1.4));
  return (
    <Svg label="Seven rows span 2 days when busy and 12 days when quiet" h={300}>
      <T x={25} y={34} s={13} f={C.latte}>quiet: 7 rows</T>
      <g opacity={a}><Dots days={QUIET} y={80} lo={1} hi={12} color={() => C.caramel} /></g>
      <T x={25} y={150} s={13} f={C.latte}>busy: 7 rows</T>
      <g opacity={a}><Dots days={BUSY} y={196} lo={100} hi={101} color={() => C.cherryText} /></g>
      {answered && <T x={300} y={270} s={15} f={C.crema} a="middle">the same 7 rows cover 12 days, or 2</T>}
      {!answered && <T x={500} y={140} s={44} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
    </Svg>
  );
}

// 4 · RANGE interval.
export function RangeInterval({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.6, 2.2));
  return (
    <Svg label="RANGE with INTERVAL includes every row within 7 days of the current row" h={240}>
      <line x1={25} y1={110} x2={575} y2={110} stroke={C.taupe} strokeWidth={2} />
      {[20, 60, 110, 190, 230, 300, 330, 360, 420, 470].map((x, i) => <circle key={i} cx={30 + x} cy={110} r={7} fill={x >= 300 - 140 + 100 && x <= 420 ? C.caramel : C.crema} opacity={0.9} />)}
      <rect x={30 + 280 - 140 * a} y={86} width={140 * a + 140} height={48} rx={12} fill="none" stroke={C.caramel} strokeWidth={2.5} />
      <T x={300} y={180} s={15} f={C.caramel} a="middle" o={a}>every row within 7 days, however many</T>
    </Svg>
  );
}

// 5 · Ordered set.
export function OrderedSet({ t }: StepCtx) {
  const vals = [30, 10, 40, 20];
  const sorted = [10, 20, 30, 40];
  const a = easeOut(seg(t, 1.0, 2.2));
  return (
    <Svg label="A percentile sorts the whole set first" h={260}>
      {vals.map((v, i) => <g key={i} opacity={1 - a}><rect x={60 + i * 100} y={50} width={80} height={40} rx={8} fill={C.cocoa} stroke={C.mocha} /><T x={100 + i * 100} y={76} s={16} f={C.crema} a="middle">{String(v)}</T></g>)}
      {sorted.map((v, i) => <g key={i} opacity={a}><rect x={60 + i * 100} y={50} width={80} height={40} rx={8} fill={C.cocoa} stroke={C.caramel} /><T x={100 + i * 100} y={76} s={16} f={C.crema} a="middle">{String(v)}</T></g>)}
      <T x={25} y={150} s={15} f={C.caramel} w={700} o={a}>WITHIN GROUP (ORDER BY …)</T>
      <T x={25} y={178} s={13} f={C.latte} o={a}>the engine must sort first</T>
    </Svg>
  );
}

// 6 · Predict median.
export function MedianPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="The median of 10, 20, 30, 40" h={260}>
      {[10, 20, 30, 40].map((v, i) => <g key={i}><rect x={60 + i * 100} y={50} width={80} height={40} rx={8} fill={C.cocoa} stroke={(i === 1 || i === 2) ? C.caramel : C.mocha} strokeWidth={(i === 1 || i === 2) ? 3 : 1} /><T x={100 + i * 100} y={76} s={16} f={C.crema} a="middle">{String(v)}</T></g>)}
      {!answered ? <T x={300} y={180} s={48} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T> : <T x={300} y={170} s={24} f={C.caramel} a="middle" w={700}>cont 25 · disc 20</T>}
    </Svg>
  );
}

// 7 · Cont vs disc.
export function ContDisc({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 1.4));
  const b = easeOut(seg(t, 1.8, 2.8));
  const x = (v: number) => 40 + (v - 10) * 15;
  return (
    <Svg label="Continuous percentiles interpolate; discrete ones return a real value" h={300}>
      <line x1={x(10)} y1={100} x2={x(40)} y2={100} stroke={C.taupe} strokeWidth={2} />
      {[10, 20, 30, 40].map((v) => <circle key={v} cx={x(v)} cy={100} r={8} fill={C.crema} />)}
      <circle cx={x(25)} cy={100} r={8} fill="none" stroke={C.caramel} strokeWidth={3} opacity={a} />
      <T x={x(25)} y={140} s={14} f={C.caramel} a="middle" o={a}>cont 0.5 = 25</T>
      <circle cx={x(37)} cy={100} r={8} fill="none" stroke={C.caramel} strokeWidth={3} opacity={b} />
      <T x={x(37)} y={170} s={14} f={C.caramel} a="middle" o={b}>cont 0.9 = 37</T>
      <T x={x(20)} y={62} s={14} f={C.cinnamon} a="middle" o={a}>disc 0.5 = 20</T>
      <T x={x(40)} y={62} s={14} f={C.cinnamon} a="middle" o={b}>disc 0.9 = 40</T>
    </Svg>
  );
}

// 8 · Array form.
export function ArrayForm({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 1.4));
  return (
    <Svg label="One call with an array of fractions sorts once" h={260}>
      <T x={25} y={44} s={15} f={C.cherryText}>three calls: three sorts</T>
      {[0, 1, 2].map((i) => <rect key={i} x={25 + i * 110} y={58} width={96} height={28} rx={6} fill={C.cherry} opacity={a} />)}
      <T x={25} y={146} s={15} f={C.caramel} w={700}>percentile_cont(ARRAY[0.5, 0.9, 0.99])</T>
      <rect x={25} y={160} width={96} height={28} rx={6} fill={C.caramel} opacity={easeOut(seg(t, 1.8, 2.6))} />
      <T x={140} y={180} s={13} f={C.latte} o={easeOut(seg(t, 2.0, 2.8))}>one sort, three answers</T>
    </Svg>
  );
}

// 9 · Buckets.
export function Buckets({ t }: StepCtx) {
  const sizes = [3, 3, 2, 2];
  const cols = [C.caramel, C.cinnamon, C.latte, C.taupe];
  let n = 0;
  return (
    <Svg label="NTILE(4) over 10 rows gives buckets of 3, 3, 2 and 2" h={260}>
      {sizes.flatMap((s, b) => Array.from({ length: s }, (_, k) => {
        const i = n++;
        return <rect key={`${b}-${k}`} x={25 + i * 54} y={70} width={46} height={46} rx={8} fill={cols[b]} opacity={easeOut(seg(t, 0.2 + i * 0.15, 0.6 + i * 0.15))} />;
      }))}
      <T x={25} y={160} s={15} f={C.crema} o={easeOut(seg(t, 2.0, 2.8))}>sizes 3, 3, 2, 2: remainder rows go first</T>
      <T x={25} y={196} s={13} f={C.latte} o={easeOut(seg(t, 2.6, 3.4))}>CUME_DIST: rows at or below this one ÷ all rows</T>
    </Svg>
  );
}

// 10 · Scale.
export function Scale({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 1.8));
  return (
    <Svg label="Exact percentiles sort everything each time; sketches use one pass and bounded memory" h={260}>
      <T x={25} y={40} s={15} f={C.cherryText} w={700}>exact: full sort per refresh</T>
      <rect x={25} y={54} width={500 * a} height={24} rx={6} fill={C.cherry} />
      <T x={25} y={130} s={15} f={C.caramel} w={700}>approximate sketch: one pass</T>
      <rect x={25} y={144} width={90 * a} height={24} rx={6} fill={C.caramel} />
      <T x={25} y={206} s={13} f={C.latte} o={easeOut(seg(t, 2.2, 3.0))}>an engineering trade-off, covered in full later</T>
    </Svg>
  );
}

// 11 · Verdict.
export function Verdict({ t }: StepCtx) {
  const rows = [['calendar window', 'RANGE with INTERVAL'], ['percentile', 'say CONT or DISC'], ['many percentiles', 'one call, an array']];
  return (
    <Svg label="Three habits for running statistics" h={280}>
      {rows.map((r, i) => (
        <g key={r[0]} opacity={easeOut(seg(t, i * 0.6, i * 0.6 + 0.7))}>
          <T x={25} y={60 + i * 76} s={14} f={C.latte}>{r[0]}</T>
          <T x={25} y={92 + i * 76} s={20} f={C.caramel} w={700}>{r[1]}</T>
        </g>
      ))}
    </Svg>
  );
}

export function ProveDisc({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="The percentile that returns a real value" h={240}>
      <T x={40} y={84} s={18} f={C.latte}>always in the data →</T>
      {answered ? <T x={40} y={140} s={24} f={C.caramel} w={700}>percentile_disc</T> : <T x={40} y={150} s={40} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
    </Svg>
  );
}
export function ProveNtile({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="First bucket of NTILE(4) over 10 rows" h={240}>
      <T x={40} y={84} s={18} f={C.latte}>first bucket →</T>
      {answered ? <T x={40} y={140} s={24} f={C.caramel} w={700}>3 rows</T> : <T x={40} y={150} s={40} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
    </Svg>
  );
}
