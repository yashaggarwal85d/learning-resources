import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = a key at rest; latte = secondary labels; taupe = not-yet-touched slots;
// caramel = the thing to look at (the digit being read, the slot being filled); cinnamon (rare) = the alternative (a
// comparison sort beside radix); cherryText = the bad outcome (lost stability, the clustered bucket).
// Every printed number is examples.py's (its prints, asserts or input data): counting sort on [3, 1, 4, 1, 5, 9, 2, 6,
// 5, 3, 5, 8], 12 moves, the fives in input order; LSD on [170, 45, 75, 90, 802, 24, 2, 66], 3 passes, 24 moves; 32-bit
// keys with 8-bit digits, 4 passes against 20 comparison levels at 1,000,000; American flag sort on [53, 31, 90, 11, 72,
// 64, 20, 48], 6 swaps; the tagged deck's 3h, 2i -> 2i, 3h; DuckDB's rows NETHERLANDS 1991, NETHERLANDS 1992, GERMANY
// 1924, 'N' -> 0xB1, padding -> 0xFF, byte order [0, 1, 2]; the float samples; n = 50,000: radix 200,000 moves,
// merge sort 718,346 comparisons; bucket sort at 100,000: largest bucket 8, 36.7% empty against e^-1 = 36.8%; clustered,
// 100,000 of 100,000 in one bucket. Quotes are from SOURCES.md. The bucket scatter is drawn as shape only.

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

function Cell({ x, y, v, c = C.crema, o = 1, w = 30, fill = false }: { x: number; y: number; v: string | number; c?: string; o?: number; w?: number; fill?: boolean }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={26} rx={3} fill={fill ? C.cocoa : C.roast} stroke={c} strokeWidth={1.5} />
      <T x={x + w / 2} y={y + 18} s={12} a="middle" f={c}>{String(v)}</T>
    </g>
  );
}

/** Stable counting-sort order of `keys` by `digit`: returns, for each input index, its output slot. */
function stableSlots(keys: number[], digit: (k: number) => number, base: number) {
  const counts = Array(base).fill(0) as number[];
  keys.forEach((k) => counts[digit(k)]++);
  const starts: number[] = [];
  let acc = 0;
  for (let v = 0; v < base; v++) {
    starts.push(acc);
    acc += counts[v];
  }
  return { slots: keys.map((k) => starts[digit(k)]++), counts };
}

/** examples.py's american_flag_sort: the list of swaps (slot pairs) it makes, in order. */
function flagSwaps(keys: number[], digit: (k: number) => number) {
  const arr = [...keys.keys()];
  const counts = Array(10).fill(0) as number[];
  keys.forEach((k) => counts[digit(k)]++);
  const starts: number[] = [];
  let acc = 0;
  for (let v = 0; v < 10; v++) {
    starts.push(acc);
    acc += counts[v];
  }
  const ends = starts.map((s, v) => s + counts[v]);
  const next = [...starts];
  const frames: number[][] = [];
  let v = 0;
  while (v < 10) {
    if (next[v] >= ends[v]) {
      v++;
      continue;
    }
    const c = digit(keys[arr[next[v]]]);
    if (c === v) next[v]++;
    else {
      [arr[next[v]], arr[next[c]]] = [arr[next[c]], arr[next[v]]];
      next[c]++;
      frames.push([...arr]);
    }
  }
  return { frames, starts, ends };
}

/** Slides element ids between consecutive frames of slot orders. */
function slotOf(frames: number[][], first: number[], k: number, id: number) {
  const f0 = Math.floor(k);
  const A = f0 < 0 ? first : frames[Math.min(f0, frames.length - 1)];
  const B = frames[clamp(f0 + 1, 0, frames.length - 1)];
  const s0 = A.indexOf(id);
  const s1 = k < 0 || f0 >= frames.length - 1 ? s0 : B.indexOf(id);
  return { s0, s1, fr: easeInOut(clamp(k - f0, 0, 1)) };
}

const ROWS: [string, number][] = [
  ['NETHERLANDS', 1991],
  ['NETHERLANDS', 1992],
  ['GERMANY', 1924],
];

// 1 · Opening. DuckDB's three rows in two columns. The comparator ping-pongs between the columns, comparison after
// comparison. Then each row folds into one strip of bytes, and a single memcmp runs down the strips.
export function Opening({ t }: StepCtx) {
  const hop = clamp((t - 0.3) / 1.8, 0, 1) * 6;
  const fold = easeInOut(seg(t, 2.3, 3.1));
  const which = Math.floor(hop) % 2;
  return (
    <Svg label="DuckDB's three example rows in two columns, country descending and year ascending. A comparator jumps between the columns on every comparison; then each row folds into one string of bytes and a single memcmp orders them" h={280}>
      <T x={60} y={30} s={12} f={C.latte} o={1 - fold}>c_birth_country DESC</T>
      <T x={340} y={30} s={12} f={C.latte} o={1 - fold}>c_birth_year ASC</T>
      {ROWS.map(([c, y], r) => (
        <g key={r}>
          <rect x={lerp(60, 60, fold)} y={46 + r * 40} width={lerp(220, 480, fold)} height={28} rx={3} fill={C.roast} stroke={fold > 0.5 ? C.caramel : C.crema} strokeWidth={1.4} />
          <T x={74} y={65 + r * 40} s={12} f={C.crema} o={1 - fold}>{c}</T>
          <rect x={340} y={46 + r * 40} width={100} height={28} rx={3} fill={C.roast} stroke={C.crema} strokeWidth={1.4} opacity={1 - fold} />
          <T x={354} y={65 + r * 40} s={12} f={C.crema} o={1 - fold}>{y}</T>
          {Array.from({ length: 15 }, (_, b) => (
            <rect key={b} x={68 + b * 31} y={52 + r * 40} width={26} height={16} rx={2} fill={C.caramel} opacity={fold * (r === 2 && b >= 7 && b < 11 ? 0.25 : 0.55)} />
          ))}
        </g>
      ))}
      {hop < 6 && hop > 0 && <path d={`M${which ? 390 : 170} 166 l-6 -10 l12 0 z`} fill={C.cherryText} />}
      <T x={60} y={190} s={12} f={C.cherryText} o={easeOut(seg(t, 0.6, 1.0)) * (1 - fold)}>comparator: loop over columns</T>
      <T x={60} y={190} s={12} f={C.caramel} o={easeOut(seg(t, 3.0, 3.4))}>one byte string per row, one memcmp</T>
      <path d={`M${lerp(60, 540, easeInOut(seg(t, 3.2, 4.2)))} 40 L${lerp(60, 540, easeInOut(seg(t, 3.2, 4.2)))} 170`} stroke={C.caramel} strokeWidth={1.4} opacity={fold >= 1 ? 1 : 0} />
    </Svg>
  );
}

// 2 · Predict. A 32-bit key, 32 cells; a cursor waits over it. After answering: the bits group into four 8-bit
// digits, each lighting in turn from the right, pass 1 to pass 4; beside them, a comparison sort's 20 levels.
export function PredictPasses({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const grp = answered ? easeInOut(seg(s, 0.1, 0.6)) : 0;
  const lit = answered ? clamp((s - 0.6) / 1.0, 0, 1) * 4 : 0;
  const X = (b: number) => 40 + b * 15 + Math.floor(b / 8) * 14 * grp;
  return (
    <Svg label="A 32-bit key drawn as 32 bit cells. After answering, the bits group into four 8-bit digits, lit one per pass from the right: 4 passes, against 20 comparison levels at a million keys" h={260}>
      <T x={40} y={28} s={12} f={C.latte}>one 32-bit key</T>
      {Array.from({ length: 32 }, (_, b) => {
        const digit = 3 - Math.floor(b / 8);
        const on = lit > digit;
        return <rect key={b} x={X(b)} y={44} width={12} height={22} rx={2} fill={on ? C.caramel : 'none'} stroke={on ? C.caramel : C.latte} strokeWidth={1.2} opacity={on ? 0.85 : 1} />;
      })}
      {!answered && <path d={`M${40 + ((t * 120) % 470)} 80 l-6 10 l12 0 z`} fill={C.caramel} opacity={pulse} />}
      {answered &&
        [0, 1, 2, 3].map((d) => (
          <T key={d} x={40 + (3 - d) * (120 + 14) + 60} y={86} s={12} a="middle" f={C.caramel} o={clamp(lit - d, 0, 1)}>pass {d + 1}</T>
        ))}
      {answered && (
        <g opacity={easeOut(seg(s, 1.7, 2.1))}>
          <T x={40} y={140} s={12} f={C.caramel}>radix: 4 passes</T>
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={260 + i * 15} y={130} width={12} height={12} rx={2} fill={C.caramel} />
          ))}
          <T x={40} y={170} s={12} f={C.cinnamon}>comparison: 20 levels</T>
          {Array.from({ length: 20 }, (_, i) => (
            <rect key={i} x={260 + i * 15} y={160} width={12} height={12} rx={2} fill={C.cinnamon} opacity={0.8} />
          ))}
          <T x={40} y={200} s={12} f={C.latte}>at 1,000,000 keys</T>
        </g>
      )}
      {!answered && <T x={300} y={230} s={14} a="middle" f={C.caramel} o={pulse}>how many passes?</T>}
    </Svg>
  );
}

// 3 · Counting sort. The twelve keys; each drops a tally into its value's count; the counts become starting positions by
// a running sum; then each key flies, in input order, to its slot. The three 5s, tagged, land in input order.
const CS = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8];
export function CountingSort({ t }: StepCtx) {
  const X = (i: number) => 40 + i * 44;
  const V = (v: number) => 60 + v * 50;
  const { slots, counts } = stableSlots(CS, (k) => k, 10);
  const tally = clamp((t - 0.2) / 1.0, 0, 1) * 12;
  const sums = clamp((t - 1.3) / 0.8, 0, 1) * 10;
  const starts: number[] = [];
  counts.reduce((a, c, i) => ((starts[i] = a), a + c), 0);
  const fives = CS.map((v, i) => (v === 5 ? i : -1)).filter((i) => i >= 0);
  return (
    <Svg label="Twelve keys 3 1 4 1 5 9 2 6 5 3 5 8. Each drops a tally into its value's count; a running sum turns the counts into start positions; then each key goes to its slot in input order, 12 moves, and the three 5s land in their input order" h={300}>
      <T x={40} y={22} s={12} f={C.latte}>input</T>
      {CS.map((v, i) => {
        const g = easeInOut(seg(t, 2.2 + i * 0.16, 2.6 + i * 0.16));
        const five = v === 5;
        return <Cell key={i} x={lerp(X(i), X(slots[i]), g)} y={lerp(30, 220, g)} v={v} w={34} c={five ? C.caramel : C.crema} fill={five} />;
      })}
      <T x={40} y={92} s={12} f={C.latte}>count</T>
      {counts.map((c, v) => {
        const seen = CS.slice(0, Math.floor(tally)).filter((k) => k === v).length;
        return (
          <g key={v}>
            <rect x={V(v)} y={100} width={40} height={26} rx={3} fill="none" stroke={C.latte} strokeWidth={1.2} />
            {sums > v ? (
              <T x={V(v) + 20} y={118} s={12} a="middle" f={C.caramel}>{starts[v]}</T>
            ) : (
              Array.from({ length: seen }, (_, j) => <rect key={j} x={V(v) + 6 + j * 10} y={108} width={7} height={10} rx={1} fill={C.crema} />)
            )}
            <T x={V(v) + 20} y={146} s={12} a="middle" f={C.latte}>{v}</T>
          </g>
        );
      })}
      {t < 2.2 ? (
        <T x={40} y={170} s={12} f={C.caramel} o={easeOut(seg(t, 1.3, 1.6))}>running sum: start positions</T>
      ) : (
        <T x={40} y={170} s={12} f={C.caramel} o={easeOut(seg(t, 2.2, 2.5))}>scatter in input order</T>
      )}
      <T x={40} y={212} s={12} f={C.latte}>output</T>
      {fives.map((i, j) => (
        <T key={i} x={X(slots[i]) + 17} y={268} s={12} a="middle" f={C.caramel} o={easeOut(seg(t, 4.2, 4.5))}>{['1st', '2nd', '3rd'][j]}</T>
      ))}
      <T x={40} y={292} s={12} f={C.crema} o={easeOut(seg(t, 4.2, 4.5))}>12 keys, 12 moves; the 5s keep their order</T>
    </Svg>
  );
}

// 4 · LSD radix sort. Eight three-digit keys. Pass 1 reads the ones digit and the keys slide into a stable order by it;
// pass 2, the tens; pass 3, the hundreds; the row ends sorted. 3 passes, 24 moves; then 4 passes against 20 levels.
const LSD = [170, 45, 75, 90, 802, 24, 2, 66];
export function LSDRadix({ t }: StepCtx) {
  const X = (i: number) => 40 + i * 66;
  const orders: number[][] = [LSD.map((_, i) => i)];
  for (let p = 0; p < 3; p++) {
    const prev = orders[p];
    const keys = prev.map((id) => LSD[id]);
    const { slots } = stableSlots(keys, (k) => Math.floor(k / 10 ** p) % 10, 10);
    const next: number[] = Array(8);
    prev.forEach((id, j) => (next[slots[j]] = id));
    orders.push(next);
  }
  const P = (p: number) => easeInOut(seg(t, 0.5 + p * 1.1, 1.2 + p * 1.1));
  const pass = Math.min(2, Math.floor(clamp((t - 0.2) / 1.1, 0, 2.99)));
  const NAMES = ['ones', 'tens', 'hundreds'];
  return (
    <Svg label="Keys 170 045 075 090 802 024 002 066. Pass 1 orders them stably by the ones digit, pass 2 by the tens, pass 3 by the hundreds, and the row ends sorted: 3 passes, 24 moves. At a million 32-bit keys with 8-bit digits: 4 passes against 20 comparison levels" h={260}>
      <T x={40} y={28} s={12} f={C.caramel}>pass {pass + 1}: {NAMES[pass]}</T>
      {LSD.map((v, id) => {
        let x = X(orders[0].indexOf(id));
        for (let p = 0; p < 3; p++) x = lerp(x, X(orders[p + 1].indexOf(id)), P(p));
        const str = String(v).padStart(3, '0');
        return (
          <g key={id}>
            <rect x={x} y={56} width={62} height={30} rx={3} fill={C.roast} stroke={C.crema} strokeWidth={1.4} />
            {[0, 1, 2].map((d) => (
              <T key={d} x={x + 11 + d * 20} y={76} s={12} a="middle" f={2 - d === pass ? C.caramel : C.latte}>{str[d]}</T>
            ))}
          </g>
        );
      })}
      <T x={40} y={130} s={12} f={C.latte} o={easeOut(seg(t, 1.0, 1.4))}>each pass stable, so earlier passes survive</T>
      <T x={40} y={170} s={12} f={C.crema} o={easeOut(seg(t, 3.7, 4.0))}>3 passes, 24 moves</T>
      <T x={40} y={200} s={12} f={C.caramel} o={easeOut(seg(t, 3.9, 4.2))}>1,000,000 32-bit keys: 4 passes vs 20 levels</T>
    </Svg>
  );
}

// 5 · MSD radix sort. The same keys split by their first digit into buckets 0, 1 and 8; the big bucket splits again by
// its next digit into singletons, and the singletons stop: no further digits read. Small buckets fall to insertion sort.
export function MSDRadix({ t }: StepCtx) {
  const top = easeInOut(seg(t, 0.4, 1.2));
  const sub = easeInOut(seg(t, 1.6, 2.4));
  const pad = (v: number) => String(v).padStart(3, '0');
  const B0 = LSD.filter((v) => v < 100);
  const B0sorted = [...B0].sort((a, b) => Math.floor(a / 10) - Math.floor(b / 10));
  const X = (i: number) => 40 + i * 66;
  return (
    <Svg label="The same eight keys split by the first digit into buckets 0, 1 and 8. Bucket 0 splits again by its next digit, into single keys, and stops there; bucket sizes shrink fast, and small ones fall to insertion sort" h={280}>
      {LSD.map((v, i) => {
        const b = Math.floor(v / 100);
        const j = b === 0 ? B0.indexOf(v) : 0;
        const bx = b === 0 ? 40 + j * 62 : b === 1 ? 430 : 500;
        const sx = b === 0 ? 40 + B0sorted.indexOf(v) * 62 : bx;
        const x = lerp(lerp(X(i), bx, top), sx, sub);
        const y = lerp(lerp(30, 120, top), b === 0 ? 210 : 120, sub);
        return <Cell key={v} x={x} y={y} v={pad(v)} w={50} c={sub > 0.5 && b === 0 ? C.caramel : b === 0 ? C.crema : C.latte} />;
      })}
      <g opacity={top}>
        <T x={40} y={110} s={12} f={C.latte}>bucket 0</T>
        <T x={430} y={110} s={12} f={C.latte}>1</T>
        <T x={500} y={110} s={12} f={C.latte}>8</T>
      </g>
      <T x={40} y={190} s={12} f={C.caramel} o={sub}>bucket 0 by the next digit</T>
      <T x={40} y={262} s={12} f={C.latte} o={easeOut(seg(t, 2.8, 3.2))}>one key each: stop reading</T>
    </Svg>
  );
}

// 6 · American flag sort. Eight keys, one digit (the tens). The counts turn into slot ranges, drawn under the array;
// then the cycle-leader swaps play one by one, each key thrown straight into its own range's next free slot: 6 swaps,
// one array.
const AF = [53, 31, 90, 11, 72, 64, 20, 48];
export function AmericanFlag({ t }: StepCtx) {
  const d = (k: number) => Math.floor(k / 10);
  const { frames, starts, ends } = flagSwaps(AF, d);
  const X = (i: number) => 40 + i * 66;
  const k = clamp((t - 1.3) / 0.45, -1, frames.length - 1);
  const ranges = easeOut(seg(t, 0.4, 1.0));
  return (
    <Svg label="Eight keys 53 31 90 11 72 64 20 48 sorted by the tens digit in place: the counts become each digit's slot range, then cycle-leader swaps throw each key straight into its range, 6 swaps, with no second array" h={260}>
      {AF.map((v, id) => {
        const { s0, s1, fr } = slotOf(frames, AF.map((_, i) => i), k, id);
        const moving = s0 !== s1;
        const placed = d(v) === [...Array(10).keys()].find((dv) => s0 >= starts[dv] && s0 < ends[dv]);
        const y = 50 - (moving ? Math.sin(fr * Math.PI) * 26 * (s1 > s0 ? 1 : -1) : 0);
        return <Cell key={id} x={lerp(X(s0), X(s1), fr)} y={y} v={v} w={50} c={placed ? C.caramel : C.crema} fill={placed} />;
      })}
      {[...Array(10).keys()]
        .filter((v) => ends[v] > starts[v])
        .map((v) => (
          <g key={v} opacity={ranges}>
            <path d={`M${X(starts[v])} 98 L${X(starts[v])} 104 L${X(ends[v] - 1) + 50} 104 L${X(ends[v] - 1) + 50} 98`} fill="none" stroke={C.latte} strokeWidth={1.2} />
            <T x={(X(starts[v]) + X(ends[v] - 1) + 50) / 2} y={122} s={12} a="middle" f={C.latte}>{v}</T>
          </g>
        ))}
      <T x={40} y={160} s={12} f={C.latte} o={ranges}>tens digit: each value's own slot range</T>
      <T x={40} y={196} s={12} f={C.caramel} o={easeOut(seg(t, 1.3, 1.6))}>cycle-leader swaps, straight into place</T>
      <T x={40} y={214} s={12} f={C.caramel} o={easeOut(seg(t, 4.0, 4.3))}>6 swaps</T>
      <T x={40} y={244} s={12} f={C.crema} o={easeOut(seg(t, 4.2, 4.6))}>one array, no second array</T>
    </Svg>
  );
}

// 7 · Instability. The tagged deck: 3h and 2i share the tens digit 0, h first. The in-place swaps play; 2i lands
// before 3h. Order among the equal digits is gone.
const TAGGED: [number, string][] = [
  [57, 'a'],
  [34, 'b'],
  [92, 'c'],
  [29, 'd'],
  [75, 'e'],
  [13, 'f'],
  [40, 'g'],
  [3, 'h'],
  [2, 'i'],
];
export function Instability({ t }: StepCtx) {
  const keys = TAGGED.map(([v]) => v);
  const { frames } = flagSwaps(keys, (k) => Math.floor(k / 10));
  const X = (i: number) => 30 + i * 60;
  const k = clamp((t - 0.6) / 0.3, -1, frames.length - 1);
  return (
    <Svg label="The tagged keys 57a 34b 92c 29d 75e 13f 40g 3h 2i, sorted in place by the tens digit: 3h and 2i share digit 0 and go in h then i; they come out i then h" h={220}>
      <T x={30} y={28} s={12} f={C.latte}>in: h, i (both tens digit 0)</T>
      {TAGGED.map(([v, tag], id) => {
        const { s0, s1, fr } = slotOf(frames, keys.map((_, i) => i), k, id);
        const moving = s0 !== s1;
        const y = 70 - (moving ? Math.sin(fr * Math.PI) * 24 * (s1 > s0 ? 1 : -1) : 0);
        const hot = tag === 'h' || tag === 'i';
        return <Cell key={id} x={lerp(X(s0), X(s1), fr)} y={y} v={`${v}${tag}`} w={50} c={hot ? C.caramel : C.latte} fill={hot} />;
      })}
      <T x={30} y={150} s={13} f={C.cherryText} o={easeOut(seg(t, 2.6, 3.0))}>out: i, h</T>
      <T x={30} y={184} s={12} f={C.latte} o={easeOut(seg(t, 2.9, 3.3))}>order among equal digits is gone</T>
    </Svg>
  );
}

// 8 · DuckDB's byte encoding. Three rows. The country bytes invert (N becomes 0xB1); GERMANY's padding bytes 00 invert to
// FF; the year's sign bit flips and its bytes swap to big-endian. Then a memcmp cursor runs down the strips: the byte
// order is rows 0, 1, 2, the post's own order.
export function ByteEncoding({ t }: StepCtx) {
  const X = (b: number) => 40 + b * 34;
  const inv = easeInOut(seg(t, 0.6, 1.3));
  const pad = easeOut(seg(t, 1.5, 1.9));
  const yr = easeOut(seg(t, 2.1, 2.5));
  const scan = clamp((t - 3.0) / 1.2, 0, 1);
  return (
    <Svg label="DuckDB's three rows encoded: every country byte inverted for descending order, so N becomes 0xB1; GERMANY's zero padding inverts to 0xFF; the year's sign bit flipped and its bytes big-endian. One memcmp gives the rows in order 0, 1, 2" h={290}>
      {ROWS.map(([c, y], r) => {
        const yy = 40 + r * 70;
        return (
          <g key={r}>
            <T x={40} y={yy - 8} s={12} f={C.latte}>row {r}: {c} {y}</T>
            {Array.from({ length: 11 }, (_, b) => {
              const isPad = b >= c.length;
              const ch = isPad ? '00' : c[b];
              const after = isPad ? 'FF' : b === 0 && c[0] === 'N' ? 'B1' : '';
              return (
                <g key={b} opacity={isPad ? pad : 1}>
                  <rect x={X(b)} y={yy} width={30} height={24} rx={2} fill={inv > 0.5 ? C.cocoa : C.roast} stroke={isPad ? C.cinnamon : C.crema} strokeWidth={1.2} />
                  <T x={X(b) + 15} y={yy + 16} s={12} a="middle" f={isPad ? C.cinnamon : C.crema} o={inv > 0.5 && after ? 0 : inv > 0.5 ? 0.35 : 1}>{ch}</T>
                  {after && <T x={X(b) + 15} y={yy + 16} s={12} a="middle" f={isPad ? C.cinnamon : C.caramel} o={inv > 0.5 ? 1 : 0}>{after}</T>}
                </g>
              );
            })}
            {[0, 1, 2, 3].map((b) => (
              <rect key={b} x={X(11) + 6 + b * 30} y={yy} width={26} height={24} rx={2} fill={b === 0 ? C.caramel : C.roast} fillOpacity={b === 0 ? 0.6 * yr : 1} stroke={C.latte} strokeWidth={1.2} opacity={yr} />
            ))}
          </g>
        );
      })}
      <T x={X(11) + 6} y={22} s={12} f={C.latte} o={yr}>year, sign flipped</T>
      <path d={`M${lerp(40, 540, scan)} 30 L${lerp(40, 540, scan)} 190`} stroke={C.caramel} strokeWidth={1.4} opacity={scan > 0 ? 1 : 0} />
      <T x={40} y={240} s={12} f={C.caramel} o={easeOut(seg(t, 4.0, 4.4))}>one memcmp: rows 0, 1, 2, the right order</T>
      <T x={40} y={270} s={12} f={C.latte} o={easeOut(seg(t, 4.2, 4.6))}>no per-column loop</T>
    </Svg>
  );
}

// 9 · Floats. The quote first: memcmp order is radix order. Then seven floats laid out in raw-bit order: positives
// ascending, then the negatives, reversed. The transform runs: always flip the sign bit; negatives flip every bit; the
// dots slide into value order.
const FL = [-3.5, -0.001, 0.0, 0.001, 3.5, 100.25, -100.25];
export function FloatFlip({ t }: StepCtx) {
  const raw = [0.0, 0.001, 3.5, 100.25, -0.001, -3.5, -100.25];
  const val = [...FL].sort((a, b) => a - b);
  const X = (i: number) => 50 + i * 76;
  const flip = easeInOut(seg(t, 2.2, 3.2));
  return (
    <Svg label="Byte strings in memcmp order are in radix order too. Seven floats in raw bit order: the positives ascending, then the negatives in reverse. Flip the sign bit always, and every other bit when it was set: the floats slide into value order" h={260}>
      <T x={40} y={24} s={12} f={C.crema} o={easeOut(seg(t, 0.2, 0.6))}>memcmp order = byte-by-byte radix order</T>
      {flip < 0.5 ? (
        <T x={40} y={70} s={12} f={C.latte} o={easeOut(seg(t, 0.9, 1.2))}>raw bits: negatives look biggest</T>
      ) : (
        <T x={40} y={70} s={12} f={C.caramel}>flipped: bit order = value order</T>
      )}
      <path d="M40 130 L560 130" stroke={C.mocha} strokeWidth={1.2} />
      {FL.map((f) => {
        const x = lerp(X(raw.indexOf(f)), X(val.indexOf(f)), flip);
        const neg = f < 0;
        return (
          <g key={f} opacity={easeOut(seg(t, 0.9, 1.3))}>
            <circle cx={x} cy={130} r={6} fill={neg ? (flip > 0.5 ? C.caramel : C.cherryText) : C.crema} />
            <T x={x} y={156} s={12} a="middle" f={neg ? C.cherryText : C.crema}>{String(f)}</T>
          </g>
        );
      })}
      <g opacity={easeOut(seg(t, 1.8, 2.2))}>
        <T x={40} y={200} s={12} f={C.caramel}>"Always flip the sign bit."</T>
        <T x={40} y={226} s={12} f={C.caramel}>"If the sign bit was set, flip the other bits too."</T>
      </g>
    </Svg>
  );
}

// 10 · Predict. Two cost curves over n: n log n and n w / log n, for a short key. A slider for w waits. After answering:
// w grows, and the radix curve climbs past the comparison curve.
export function PredictCrossover({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const w = answered ? lerp(1, 4, easeInOut(seg(s, 0.2, 1.6))) : 1 + 0.15 * Math.sin(t * 2);
  const P = (f: (x: number) => number) =>
    Array.from({ length: 30 }, (_, i) => {
      const x = (i + 1) / 30;
      return `${i ? 'L' : 'M'}${60 + x * 480} ${210 - f(x) * 150}`;
    }).join(' ');
  const nlogn = (x: number) => x * (0.4 + 0.6 * x);
  const radix = (x: number) => clamp((x * 0.55 * w) / (0.8 + 0.4 * x), 0, 1.05);
  return (
    <Svg label="Two cost curves over n: n log n for a comparison sort and n w / log n for radix sort. After answering, the key width w grows and the radix curve climbs past the comparison curve" h={270}>
      <path d="M60 210 L560 210 M60 210 L60 40" stroke={C.mocha} strokeWidth={1.2} />
      <path d={P(nlogn)} fill="none" stroke={C.cinnamon} strokeWidth={2} />
      <path d={P(radix)} fill="none" stroke={answered && w > 2.2 ? C.cherryText : C.caramel} strokeWidth={2} />
      <T x={540} y={210 - nlogn(1) * 150 - 8} s={12} a="end" f={C.cinnamon}>n log n</T>
      <T x={540} y={Math.max(30, 210 - radix(1) * 150 + 18)} s={12} a="end" f={answered && w > 2.2 ? C.cherryText : C.caramel}>n w / log n</T>
      <T x={560} y={228} s={12} a="end" f={C.latte}>n</T>
      {answered && <T x={80} y={60} s={12} f={C.cherryText} o={easeOut(seg(s, 1.4, 1.8))}>long keys: radix loses</T>}
      {!answered && <T x={300} y={252} s={14} a="middle" f={C.caramel} o={pulse}>does the gap ever close?</T>}
      {answered && <T x={300} y={252} s={13} a="middle" f={C.crema} o={easeOut(seg(s, 1.6, 2.0))}>yes: w large against log² n</T>}
    </Svg>
  );
}

// 11 · The crossover, measured. 50,000 random 32-bit keys: radix's moves stack up pass by pass, four blocks of 50,000
// to 200,000; merge sort's comparisons run on to 718,346. Then an already-sorted input: the four blocks again, unchanged.
export function CrossoverMeasured({ t }: StepCtx) {
  const W = (v: number) => (v / 718346) * 400;
  const merge = easeOut(seg(t, 1.6, 2.4));
  const again = clamp((t - 3.0) / 0.8, 0, 1) * 4;
  return (
    <Svg label="50,000 random 32-bit keys: LSD radix sort makes 4 passes of 50,000 moves, 200,000 in all; merge sort makes 718,346 comparisons on the same keys. On already-sorted keys radix still makes all 4 passes" h={260}>
      <T x={40} y={24} s={12} f={C.latte}>same 50,000 random keys</T>
      <T x={40} y={60} s={12} f={C.caramel}>radix</T>
      {[0, 1, 2, 3].map((p) => (
        <rect key={p} x={140 + p * W(50000)} y={48} width={Math.max(0, W(50000) - 2) * easeOut(seg(t, 0.3 + p * 0.3, 0.6 + p * 0.3))} height={14} rx={2} fill={C.caramel} opacity={0.85} />
      ))}
      <T x={146 + W(200000)} y={60} s={12} f={C.caramel} o={easeOut(seg(t, 1.3, 1.6))}>200,000 moves</T>
      <T x={40} y={96} s={12} f={C.cinnamon}>merge sort</T>
      <rect x={140} y={84} width={W(718346) * merge} height={14} rx={2} fill={C.cinnamon} opacity={0.85} />
      <T x={540} y={118} s={12} a="end" f={C.cinnamon} o={merge}>718,346 comparisons</T>
      <T x={40} y={170} s={12} f={C.latte} o={easeOut(seg(t, 2.8, 3.1))}>already sorted:</T>
      {[0, 1, 2, 3].map((p) => (
        <rect key={p} x={140 + p * W(50000)} y={180} width={Math.max(0, W(50000) - 2) * clamp(again - p, 0, 1)} height={14} rx={2} fill={C.caramel} opacity={0.85} />
      ))}
      <T x={40} y={230} s={12} f={C.crema} o={easeOut(seg(t, 3.8, 4.2))}>still all 4 passes: not adaptive</T>
    </Svg>
  );
}

// 12 · Bucket sort. Uniform keys fall into a row of buckets: most hold one or two, about a third stay empty (shape
// only); then the measured numbers at 100,000: largest bucket 8, 36.7% empty against e^-1 = 36.8%. Then clustered keys
// all pour into one bucket: 100,000 of 100,000.
export function BucketSort({ t }: StepCtx) {
  const NB = 30;
  const X = (b: number) => 40 + b * 17.5;
  // A fixed pseudo-random fill, drawn as shape only.
  const fill: number[] = [];
  let x = 7;
  for (let i = 0; i < NB; i++) {
    x = (x * 1103515245 + 12345) % 2147483648;
    fill.push(Math.floor(x / 2147483648 * 1000) % 37 < 13 ? 0 : 1 + (Math.floor(x / 65536) % 3 === 0 ? 1 : 0) + (i === 17 ? 1 : 0));
  }
  const drop = clamp((t - 0.3) / 1.2, 0, 1);
  const clus = easeInOut(seg(t, 3.0, 3.8));
  return (
    <Svg label="Uniform keys fall into a row of buckets: most hold one or two and about a third stay empty. At 100,000 keys the largest bucket held 8 and 36.7 percent were empty, against e to the minus one, 36.8 percent. Clustered keys pour into one bucket: 100,000 of 100,000" h={300}>
      <T x={40} y={24} s={12} f={C.crema}>uniform</T>
      {fill.map((n, b) => (
        <g key={b}>
          <path d={`M${X(b)} 60 L${X(b)} 100 L${X(b) + 14} 100 L${X(b) + 14} 60`} fill="none" stroke={n === 0 && drop >= 1 ? C.caramel : C.mocha} strokeWidth={1.2} />
          {Array.from({ length: n }, (_, j) => (
            <rect key={j} x={X(b) + 2} y={lerp(40, 88 - j * 12, clamp(drop * 3 - (b % 3) * 0.6, 0, 1))} width={10} height={10} rx={2} fill={C.crema} opacity={clamp(drop * 3 - (b % 3) * 0.6, 0, 1)} />
          ))}
        </g>
      ))}
      <g opacity={easeOut(seg(t, 1.7, 2.1))}>
        <T x={40} y={128} s={12} f={C.caramel}>100,000 keys: 36.7% empty, e⁻¹ = 36.8%</T>
        <T x={40} y={150} s={12} f={C.crema}>largest bucket: 8</T>
      </g>
      <T x={40} y={190} s={12} f={C.cherryText} o={easeOut(seg(t, 2.8, 3.1))}>clustered</T>
      {Array.from({ length: NB }, (_, b) => (
        <path key={b} d={`M${X(b)} 216 L${X(b)} 256 L${X(b) + 14} 256 L${X(b) + 14} 216`} fill="none" stroke={b === 15 ? C.cherryText : C.mocha} strokeWidth={1.2} opacity={easeOut(seg(t, 2.8, 3.1))} />
      ))}
      {Array.from({ length: 12 }, (_, j) => (
        <rect key={j} x={lerp(X(j * 2.5) + 2, X(15) + 2, clus)} y={lerp(200, 244 - j * 3.2, clus)} width={10} height={lerp(10, 3, clus)} rx={1} fill={C.cherryText} opacity={easeOut(seg(t, 2.9, 3.1))} />
      ))}
      <T x={40} y={284} s={12} f={C.cherryText} o={easeOut(seg(t, 3.8, 4.2))}>one bucket: 100,000 of 100,000</T>
    </Svg>
  );
}

// 13 · Handoff. A key read digit by digit, no comparison; then a file ten times the size of memory: a small memory box
// beside a long disk bar, and chunks shuttling between them. External merge sort, next.
export function Handoff({ t }: StepCtx) {
  const dig = clamp((t - 0.2) / 1.0, 0, 1) * 3;
  const go = easeOut(seg(t, 1.6, 2.2));
  const shuttle = (t * 1.2) % 1;
  return (
    <Svg label="A key read one digit at a time, no comparisons; then a file ten times the size of memory, chunks travelling between the small memory and the disk. External merge sort, next" h={240}>
      {['8', '0', '2'].map((c, i) => (
        <g key={i}>
          <rect x={40 + i * 34} y={30} width={30} height={30} rx={3} fill={C.roast} stroke={dig > i ? C.caramel : C.latte} strokeWidth={1.4} />
          <T x={55 + i * 34} y={50} s={13} a="middle" f={dig > i ? C.caramel : C.latte}>{c}</T>
        </g>
      ))}
      <T x={160} y={50} s={12} f={C.caramel} o={easeOut(seg(t, 0.6, 1.0))}>one digit at a time</T>
      <g opacity={go}>
        <rect x={40} y={110} width={50} height={40} rx={3} fill="none" stroke={C.crema} strokeWidth={1.4} />
        <T x={65} y={170} s={12} a="middle" f={C.crema}>memory</T>
        <rect x={150} y={110} width={410 * go} height={40} rx={3} fill="none" stroke={C.cinnamon} strokeWidth={1.4} />
        <T x={355} y={170} s={12} a="middle" f={C.cinnamon}>data: ten times memory</T>
        <rect x={lerp(160, 70, shuttle)} y={124} width={14} height={12} rx={2} fill={C.caramel} opacity={t > 2.2 ? 1 : 0} />
      </g>
      <T x={300} y={220} s={13} a="middle" f={C.caramel} o={easeOut(seg(t, 2.8, 3.2))}>external merge sort, next</T>
    </Svg>
  );
}
