import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar: caramel = the grouping set under discussion, cherryText = the ambiguous or duplicated row, crema = data,
// latte = labels. A greyed dashed cell means "this column was not grouped on in this row" (a rollup NULL); a solid empty
// cell is a genuine data NULL: two textures for the same visual blank.

const money = (n: number) => n.toLocaleString('en-US');
const DET = [
  ['paid', 'Oct', 400],
  ['paid', 'Nov', 600],
  ['refunded', 'Oct', 50],
  ['refunded', 'Nov', 70],
] as const;

/** A report cell: value, rollup-NULL (dashed), or data-NULL (solid empty). */
function Cell({ x, y, w, v, kind = 'val', hi = false }: { x: number; y: number; w: number; v?: string; kind?: 'val' | 'rollup' | 'data'; hi?: boolean }) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={30}
        rx={6}
        fill={kind === 'data' ? C.roast : kind === 'rollup' ? 'none' : C.cocoa}
        stroke={hi ? C.cherryText : kind === 'rollup' ? C.taupe : C.mocha}
        strokeWidth={hi ? 2 : 1}
        strokeDasharray={kind === 'rollup' ? '4 3' : undefined}
      />
      {v !== undefined && (
        <T x={x + w / 2} y={y + 20} s={13} f={C.crema} a="middle">
          {v}
        </T>
      )}
    </g>
  );
}

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

// 1 · Three scans versus one. A cursor sweeps the orders table three times for the stacked queries, the counter
// climbing; then grouping sets sweep it once and all three levels pop out together.
export function ThreeScans({ t }: StepCtx) {
  const sweeps = [seg(t, 0.3, 0.8), seg(t, 0.85, 1.35), seg(t, 1.4, 1.9)];
  const done = sweeps.filter((x) => x >= 1).length;
  const one = seg(t, 2.1, 2.7);
  const out = easeOutBack(seg(t, 2.7, 3.1));
  const active = sweeps.findIndex((x) => x > 0 && x < 1);
  return (
    <Svg label="Three UNION ALL queries scan the table three times; grouping sets scan it once and produce every level" h={300}>
      <T x={25} y={36} s={14} f={C.latte}>
        UNION ALL of three GROUP BYs
      </T>
      <rect x={25} y={52} width={340} height={30} rx={6} fill={C.cocoa} stroke={C.mocha} />
      <T x={195} y={72} s={13} f={C.latte} a="middle">
        orders
      </T>
      {active >= 0 && <rect x={25 + 334 * sweeps[active]} y={48} width={6} height={38} rx={2} fill={C.cherryText} />}
      <T x={575} y={74} s={18} f={C.cherryText} a="end" w={700} o={done > 0 ? 1 : 0}>
        {done} {done === 1 ? 'scan' : 'scans'}
      </T>
      <T x={25} y={158} s={14} f={C.latte} o={easeOut(seg(t, 1.9, 2.1))}>
        GROUPING SETS
      </T>
      <g opacity={easeOut(seg(t, 1.9, 2.1))}>
        <rect x={25} y={174} width={340} height={30} rx={6} fill={C.cocoa} stroke={C.caramel} strokeWidth={2} />
        <T x={195} y={194} s={13} f={C.latte} a="middle">
          orders
        </T>
      </g>
      {one > 0 && one < 1 && <rect x={25 + 334 * one} y={170} width={6} height={38} rx={2} fill={C.caramel} />}
      {['level 1', 'level 2', 'level 3'].map((l, i) =>
        out > 0 ? (
          <g key={l} opacity={clamp(out)} transform={`translate(${lerp(365, 395 + i * 0, clamp(out))} ${i * 34 + 140})`}>
            <rect width={110} height={26} rx={5} fill={C.roast} stroke={C.caramel} />
            <T x={55} y={18} s={13} f={C.crema} a="middle">
              {l}
            </T>
          </g>
        ) : null,
      )}
      <T x={25} y={270} s={15} f={C.caramel} o={easeOut(seg(t, 2.9, 3.3))}>
        one scan, every level
      </T>
    </Svg>
  );
}

// 2 · The grouping sets as a table. Rows slide in level by level, each with its set label; then the dashed cells (the
// columns a level ignored) are ringed.
export function SetsTable({ t }: StepCtx) {
  const rows: { s: string; m: string; amt: string; k: 'a' | 'b' | 'c' }[] = [
    { s: 'paid', m: 'Oct', amt: money(400), k: 'a' },
    { s: 'paid', m: 'Nov', amt: money(600), k: 'a' },
    { s: 'paid', m: '', amt: money(1000), k: 'b' },
    { s: '', m: '', amt: money(1120), k: 'c' },
  ];
  const ring = easeOut(seg(t, 3.0, 3.5));
  return (
    <Svg label="Rows from three grouping sets: status and month, status alone, and the grand total; the empty cells are columns the level ignored" h={300}>
      <T x={30} y={36} s={13} f={C.latte}>
        status
      </T>
      <T x={170} y={36} s={13} f={C.latte}>
        month
      </T>
      <T x={310} y={36} s={13} f={C.latte}>
        SUM(amount)
      </T>
      {rows.map((r, i) => {
        const a = easeOutBack(seg(t, 0.3 + i * 0.6, 0.8 + i * 0.6));
        const y = 48 + i * 44;
        return (
          <g key={i} opacity={clamp(a)} transform={`translate(${(1 - clamp(a)) * -30} 0)`}>
            <Cell x={25} y={y} w={120} v={r.s || undefined} kind={r.s ? 'val' : 'rollup'} />
            <Cell x={165} y={y} w={120} v={r.m || undefined} kind={r.m ? 'val' : 'rollup'} />
            <Cell x={305} y={y} w={120} v={r.amt} />
            <T x={450} y={y + 20} s={13} f={C.caramel}>
              {r.k === 'a' ? '(status, month)' : r.k === 'b' ? '(status)' : '()'}
            </T>
            {ring > 0 && !r.m && <rect x={161} y={y - 4} width={128} height={38} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} opacity={ring} />}
            {ring > 0 && !r.s && <rect x={21} y={y - 4} width={128} height={38} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} opacity={ring} />}
          </g>
        );
      })}
      <T x={25} y={250} s={14} f={C.caramel} o={ring}>
        dashed: a column this level ignored
      </T>
    </Svg>
  );
}

// 3 · ROLLUP vs CUBE. ROLLUP's sets peel columns off the right, one prefix at a time; CUBE adds every subset, with
// (b) alone lit as the set ROLLUP never makes. Then the row costs count up.
export function RollupCube({ t }: StepCtx) {
  const roll = ['(a, b)', '(a)', '()'];
  const cube = ['(a, b)', '(a)', '(b)', '()'];
  const c7 = Math.round(7 * easeOut(seg(t, 3.4, 4.0)));
  const c9 = Math.round(9 * easeOut(seg(t, 3.6, 4.2)));
  const box = (s: string, i: number, y: number, k: number, hi: boolean) =>
    k <= 0 ? null : (
      <g key={s + y} opacity={clamp(k)} transform={`translate(${lerp(i > 0 ? (i - 1) * 100 : 0, i * 100, clamp(k))} 0)`}>
        <rect x={25} y={y} width={90} height={32} rx={8} fill={C.cocoa} stroke={hi ? C.cinnamon : C.mocha} strokeWidth={hi ? 2 : 1} />
        <T x={70} y={y + 21} s={14} f={hi ? C.cinnamon : C.crema} a="middle">
          {s}
        </T>
      </g>
    );
  return (
    <Svg label="ROLLUP of two columns keeps every prefix, 3 sets and 7 rows; CUBE keeps every subset, 4 sets and 9 rows" h={300}>
      <T x={25} y={36} s={16} f={C.caramel} w={700}>
        ROLLUP(a, b)
      </T>
      {roll.map((s, i) => box(s, i, 48, easeOut(seg(t, 0.3 + i * 0.4, 0.7 + i * 0.4)), false))}
      <T x={25} y={132} s={16} f={C.caramel} w={700} o={easeOut(seg(t, 1.6, 1.9))}>
        CUBE(a, b)
      </T>
      {cube.map((s, i) => box(s, i, 144, easeOut(seg(t, 1.8 + i * 0.35, 2.2 + i * 0.35)), s === '(b)'))}
      <T x={25} y={236} s={14} f={C.latte} o={easeOut(seg(t, 3.3, 3.5))}>
        over our data:
      </T>
      <T x={200} y={236} s={16} f={C.crema} w={700} o={easeOut(seg(t, 3.3, 3.5))}>
        rollup {c7} rows
      </T>
      <T x={200} y={264} s={16} f={C.cinnamon} w={700} o={easeOut(seg(t, 3.5, 3.7))}>
        cube {c9} rows
      </T>
    </Svg>
  );
}

// 4 · Predict: power set. Before the answer the three columns flicker in and out. After it, the eight subsets drop in
// one at a time while the count climbs to 2 × 2 × 2 = 8.
export function PowerSet({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const subsets = ['abc', 'ab', 'ac', 'bc', 'a', 'b', 'c', '()'];
  const shown = answered ? Math.min(8, Math.floor(seg(s, 0.1, 1.7) * 8 + 0.0001)) : 0;
  return (
    <Svg label="A cube is every subset of the columns: each column in or out, two times two times two, eight sets" h={300}>
      {['a', 'b', 'c'].map((c, i) => {
        const on = answered ? true : Math.sin(t * 4 + i * 2.1) > 0;
        return (
          <g key={c}>
            <rect x={25 + i * 60} y={20} width={44} height={28} rx={6} fill={on ? C.cocoa : 'none'} stroke={on ? C.caramel : C.taupe} strokeDasharray={on ? undefined : '4 3'} />
            <T x={47 + i * 60} y={39} s={14} f={on ? C.crema : C.taupe} a="middle">
              {c}
            </T>
          </g>
        );
      })}
      <T x={220} y={39} s={13} f={C.latte}>
        each column: in or out
      </T>
      {subsets.map((sb, i) => {
        const k = answered ? easeOutBack(seg(s, 0.1 + i * 0.2, 0.4 + i * 0.2)) : 0;
        if (k <= 0) return null;
        return (
          <g key={sb} opacity={clamp(k)} transform={`translate(0 ${(1 - clamp(k)) * -14})`}>
            <rect x={25 + (i % 4) * 140} y={74 + Math.floor(i / 4) * 56} width={120} height={40} rx={8} fill={C.cocoa} stroke={C.caramel} />
            <T x={85 + (i % 4) * 140} y={100 + Math.floor(i / 4) * 56} s={14} f={C.crema} a="middle">
              {sb}
            </T>
          </g>
        );
      })}
      {!answered && (
        <T x={300} y={200} s={44} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      )}
      {answered && (
        <T x={300} y={250} s={20} f={C.caramel} a="middle" w={700}>
          {shown < 8 ? `${shown} sets` : '2 × 2 × 2 = 8 sets'}
        </T>
      )}
    </Svg>
  );
}

// 5 · The ladder of subtotals, built bottom-up: the four detail rows land at the bottom, the two status subtotals
// climb above them, the grand total lands on top; then the dashed cells pulse.
export function Ladder({ t }: StepCtx) {
  const rows = [
    ['', '', '1,120', 2],
    ['paid', '', '1,000', 1],
    ['refunded', '', '120', 1],
    ['paid', 'Oct', '400', 0],
    ['paid', 'Nov', '600', 0],
    ['refunded', 'Oct', '50', 0],
    ['refunded', 'Nov', '70', 0],
  ] as const;
  const start = [2.0, 1.2, 0.2];
  const pulse = t > 2.6 ? 0.6 + 0.4 * Math.sin((t - 2.6) * 6) : 0;
  return (
    <Svg label="A rollup as a ladder: detail rows at the bottom, status subtotals above, the grand total on top, with ignored columns drawn as dashed cells" h={340}>
      {rows.map((r, i) => {
        const lvl = r[3];
        const j = i - (lvl === 0 ? 3 : lvl === 1 ? 1 : 0);
        const a = easeOutBack(seg(t, start[lvl] + j * 0.15, start[lvl] + j * 0.15 + 0.4));
        const y = 20 + i * 44;
        if (a <= 0) return null;
        return (
          <g key={i} opacity={clamp(a)} transform={`translate(0 ${(1 - clamp(a)) * 24})`}>
            <Cell x={25} y={y} w={120} v={r[0] || undefined} kind={r[0] ? 'val' : 'rollup'} />
            <Cell x={165} y={y} w={110} v={r[1] || undefined} kind={r[1] ? 'val' : 'rollup'} />
            <Cell x={295} y={y} w={110} v={r[2]} />
            {pulse > 0 && !r[1] && <rect x={161} y={y - 4} width={118} height={38} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} opacity={pulse} />}
            {pulse > 0 && !r[0] && <rect x={21} y={y - 4} width={128} height={38} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} opacity={pulse} />}
          </g>
        );
      })}
      <T x={430} y={40} s={13} f={C.latte} o={easeOut(seg(t, 2.0, 2.3))}>
        grand total
      </T>
      <T x={430} y={84} s={13} f={C.latte} o={easeOut(seg(t, 1.2, 1.5))}>
        2 subtotals
      </T>
      <T x={430} y={172} s={13} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        4 detail
      </T>
      <T x={25} y={334} s={13} f={C.caramel} o={easeOut(seg(t, 2.8, 3.2))}>
        dashed reads as NULL: not part of this grouping
      </T>
    </Svg>
  );
}

// 6 · The collision. The referrer rollup arrives: referrer 17 (470), the real NULL referrer (650), the grand total
// (1,120). The two blanks are ringed red, then copies of both slide side by side under a "?": nothing tells them apart.
export function Collision({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 0.9));
  const b = easeOut(seg(t, 1.2, 1.8));
  const hi = t > 1.9;
  const m = easeInOut(seg(t, 2.3, 3.1));
  return (
    <Svg label="A genuine NULL referrer and the rollup grand total both show the same blank" h={300}>
      <T x={25} y={36} s={13} f={C.latte}>
        referred_by
      </T>
      <T x={320} y={36} s={13} f={C.latte}>
        SUM(amount)
      </T>
      <g opacity={a}>
        <Cell x={25} y={50} w={150} v="17" />
        <Cell x={320} y={50} w={110} v="470" />
        <Cell x={25} y={96} w={150} kind="data" hi={hi} />
        <Cell x={320} y={96} w={110} v="650" />
        <T x={450} y={116} s={13} f={C.latte}>
          real NULL
        </T>
      </g>
      <g opacity={b}>
        <Cell x={25} y={142} w={150} kind="rollup" hi={hi} />
        <Cell x={320} y={142} w={110} v="1,120" />
        <T x={450} y={162} s={13} f={C.latte}>
          grand total
        </T>
      </g>
      {m > 0 && (
        <g>
          <g transform={`translate(${lerp(0, 120, m)} ${lerp(0, 104, m)})`}>
            <rect x={25} y={96} width={150} height={30} rx={6} fill="none" stroke={C.cherryText} strokeWidth={2} />
          </g>
          <g transform={`translate(${lerp(0, 290, m)} ${lerp(0, 58, m)})`}>
            <rect x={25} y={142} width={150} height={30} rx={6} fill="none" stroke={C.cherryText} strokeWidth={2} />
          </g>
          <T x={305} y={220} s={18} f={C.cherryText} a="middle" w={700} o={easeOut(seg(t, 3.0, 3.3))}>
            =
          </T>
        </g>
      )}
      <T x={300} y={276} s={15} f={C.cherryText} a="middle" o={easeOut(seg(t, 3.1, 3.6))}>
        two different reasons, one identical blank
      </T>
    </Svg>
  );
}

// 7 · Predict: IS NULL. The two blank rows wait above a WHERE … IS NULL gate. After the answer both drop through the
// gate into the count, which reads 2 where the truth is 1.
export function IsNullPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const d1 = answered ? easeInOut(seg(s, 0.2, 0.9)) : 0;
  const d2 = answered ? easeInOut(seg(s, 0.6, 1.3)) : 0;
  const n = (d1 >= 1 ? 1 : 0) + (d2 >= 1 ? 1 : 0);
  return (
    <Svg label="A filter on IS NULL keeps both the data NULL row and the grand total row, so the count is off by one" h={300}>
      <g transform={`translate(${d1 * 150} ${d1 * 150})`}>
        <Cell x={25} y={40} w={150} kind="data" hi={answered} />
      </g>
      <T x={200} y={60} s={13} f={C.latte} o={1 - d1}>
        detail, real NULL
      </T>
      <g transform={`translate(${d2 * 150} ${d2 * 104})`}>
        <Cell x={25} y={86} w={150} kind="rollup" hi={answered} />
      </g>
      <T x={200} y={106} s={13} f={C.latte} o={1 - d2}>
        grand total
      </T>
      <line x1={140} y1={160} x2={360} y2={160} stroke={C.latte} strokeWidth={2} strokeDasharray="8 5" />
      <T x={370} y={165} s={13} f={C.latte}>
        IS NULL
      </T>
      {!answered && (
        <T x={470} y={90} s={44} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      )}
      {answered && (
        <T x={575} y={210} s={18} f={C.cherryText} a="end" w={700}>
          count: {n}
        </T>
      )}
      <T x={300} y={280} s={15} f={C.cherryText} a="middle" o={answered ? easeOut(seg(s, 1.4, 1.8)) : 0}>
        both survive: off by exactly one
      </T>
    </Svg>
  );
}

// 8 · GROUPING bitmask. Each row gets two bit cells (status, month); the ignored columns' bits switch on as the row
// arrives and the number counts to 0, 1, 3. Then the fix types in.
export function GroupingBits({ t }: StepCtx) {
  const rows = [
    { l: 'detail (status, month)', bits: [0, 0], v: 0 },
    { l: 'status subtotal', bits: [0, 1], v: 1 },
    { l: 'grand total', bits: [1, 1], v: 3 },
  ];
  const fix = 'GROUPING(col) = 0 AND col IS NULL';
  const typed = Math.floor(seg(t, 3.4, 4.2) * fix.length);
  return (
    <Svg label="GROUPING over two columns is 0 for detail, 1 for a subtotal, and 3 for the grand total; filter on GROUPING equal to zero and IS NULL" h={300}>
      <T x={322} y={34} s={13} f={C.latte} a="middle">
        status
      </T>
      <T x={402} y={34} s={13} f={C.latte} a="middle">
        month
      </T>
      {rows.map((r, i) => {
        const a = easeOut(seg(t, 0.3 + i * 0.8, 0.7 + i * 0.8));
        const on = seg(t, 0.7 + i * 0.8, 1.0 + i * 0.8);
        const y = 82 + i * 56;
        return (
          <g key={r.l} opacity={clamp(a)}>
            <T x={25} y={y} s={14} f={C.crema}>
              {r.l}
            </T>
            {r.bits.map((b, j) => {
              const lit = b === 1 && on > 0.5;
              return (
                <g key={j}>
                  <rect x={300 + j * 80} y={y - 22} width={44} height={30} rx={5} fill={lit ? C.caramel : C.cocoa} stroke={C.mocha} />
                  <T x={322 + j * 80} y={y - 1} s={18} f={lit ? C.espresso : C.crema} a="middle" w={700}>
                    {lit ? '1' : '0'}
                  </T>
                </g>
              );
            })}
            <T x={460} y={y} s={20} f={C.caramel} w={700} o={easeOut(seg(t, 1.0 + i * 0.8, 1.2 + i * 0.8))}>
              = {r.v}
            </T>
          </g>
        );
      })}
      <T x={25} y={268} s={14} f={C.caramel}>
        {fix.slice(0, typed)}
      </T>
    </Svg>
  );
}

// 9 · Duplicate sets. The nine products of ROLLUP(a, b) × ROLLUP(a, c) drop in; the repeats flash red; then DISTINCT
// lifts the repeats out and the five unique sets close ranks.
export function Duplicates({ t }: StepCtx) {
  const sets = ['(a,b,c)', '(a,b)', '(a,b)', '(a,c)', '(a)', '(a)', '(a,c)', '(a)', '()'];
  const red = easeOut(seg(t, 2.0, 2.4));
  const dedup = easeInOut(seg(t, 2.8, 3.5));
  let u = -1;
  return (
    <Svg label="ROLLUP(a,b) with ROLLUP(a,c) lists some grouping sets twice; GROUP BY DISTINCT removes the repeats, leaving five" h={320}>
      <T x={25} y={32} s={13} f={C.latte}>
        GROUP BY ROLLUP(a, b), ROLLUP(a, c)
      </T>
      {sets.map((s, i) => {
        const dup = sets.indexOf(s) !== i;
        if (!dup) u += 1;
        const x0 = 25 + (i % 5) * 112;
        const y0 = 60 + Math.floor(i / 5) * 56;
        const x1 = dup ? x0 : 25 + u * 112;
        const y1 = dup ? y0 - 30 : 60;
        const a = easeOutBack(seg(t, 0.2 + i * 0.18, 0.5 + i * 0.18));
        return (
          <g key={i} opacity={clamp(a) * (dup ? 1 - dedup : 1)} transform={`translate(${lerp(x0, x1, dedup)} ${lerp(y0, y1, dedup)})`}>
            <rect width={100} height={36} rx={8} fill={C.cocoa} stroke={dup && red > 0.5 ? C.cherryText : C.mocha} />
            <T x={50} y={23} s={13} f={dup && red > 0.5 ? C.cherryText : C.crema} a="middle">
              {s}
            </T>
          </g>
        );
      })}
      <T x={300} y={230} s={15} f={C.caramel} a="middle" o={easeOut(seg(t, 3.3, 3.7))}>
        GROUP BY DISTINCT keeps one of each: 5
      </T>
    </Svg>
  );
}

// 10 · Pivot fold. The tall strip's cells travel to their places in the wide strip: the amounts slide into their
// status columns, the status labels rise to become headers, and the two cells per month merge into one.
export function PivotFold({ t }: StepCtx) {
  const f = easeInOut(seg(t, 1.0, 2.6));
  const long = [
    ['Oct', 'paid', '400'],
    ['Oct', 'refunded', '50'],
    ['Nov', 'paid', '600'],
    ['Nov', 'refunded', '70'],
  ];
  const hdr = easeOut(seg(t, 2.4, 2.8));
  return (
    <Svg label="A tall strip with one row per month and status folds into a wide strip with one row per month and one column per status" h={320}>
      <T x={40} y={22} s={13} f={C.latte} o={hdr}>
        month
      </T>
      {long.map((r, i) => {
        const mo = i < 2 ? 0 : 1;
        const st = i % 2;
        const tx = { m: [40, 40], s: [130, 140 + st * 120], v: [250, 140 + st * 120] };
        const yT = 30 + i * 40;
        const yW = 48 + mo * 44;
        return (
          <g key={i}>
            <g transform={`translate(${lerp(tx.m[0], tx.m[1], f)} ${lerp(yT, yW, f)})`} opacity={st === 1 ? 1 - f : 1}>
              <Cell x={0} y={0} w={80} v={r[0]} />
            </g>
            {i < 2 ? (
              <g transform={`translate(${lerp(tx.s[0], tx.s[1], f)} ${lerp(yT, 4, f)})`}>
                <Cell x={0} y={0} w={110} v={r[1]} />
              </g>
            ) : (
              <g opacity={1 - f} transform={`translate(${tx.s[0]} ${yT})`}>
                <Cell x={0} y={0} w={110} v={r[1]} />
              </g>
            )}
            <g transform={`translate(${lerp(tx.v[0], tx.v[1], f)} ${lerp(yT, yW, f)})`}>
              <Cell x={0} y={0} w={lerp(80, 110, f)} v={r[2]} />
            </g>
          </g>
        );
      })}
      <T x={300} y={260} s={14} f={C.latte} a="middle" o={easeOut(seg(t, 2.8, 3.3))}>
        SUM(amount) FILTER (WHERE status = …)
      </T>
      <T x={300} y={286} s={14} f={C.latte} a="middle" o={easeOut(seg(t, 3.2, 3.7))}>
        one aggregate per column
      </T>
    </Svg>
  );
}

// 11 · Dialects. Each spelling arrives with where it works; the two portable ones are ticked, the native PIVOT gets a
// red cross for PostgreSQL.
export function Dialects({ t }: StepCtx) {
  const rows = [
    ['FILTER (WHERE …)', 'standard; PostgreSQL, DuckDB', true],
    ['SUM(CASE WHEN …)', 'any engine', true],
    ['PIVOT … FOR … IN', 'Snowflake, BigQuery, SQL Server', false],
  ] as const;
  return (
    <Svg label="Three ways to pivot and where each works: FILTER and CASE everywhere we run, native PIVOT not in PostgreSQL" h={280}>
      {rows.map((r, i) => {
        const a = easeOut(seg(t, 0.2 + i * 0.7, 0.6 + i * 0.7));
        const m = easeOut(seg(t, 0.6 + i * 0.7, 0.9 + i * 0.7));
        const y = 60 + i * 70;
        return (
          <g key={r[0]} opacity={a} transform={`translate(${(1 - a) * -20} 0)`}>
            <T x={25} y={y} s={16} f={r[2] ? C.caramel : C.cherryText} w={700}>
              {r[0]}
            </T>
            <T x={25} y={y + 26} s={13} f={C.latte}>
              {r[1]}
            </T>
            {m > 0 && r[2] && <path d={`M 540 ${y - 6} l 6 6 l 12 -14`} fill="none" stroke={C.caramel} strokeWidth={2.5} opacity={m} />}
            {m > 0 && !r[2] && <path d={`M 540 ${y - 16} l 16 16 m -16 0 l 16 -16`} fill="none" stroke={C.cherryText} strokeWidth={2.5} opacity={m} />}
          </g>
        );
      })}
      <T x={575} y={262} s={13} f={C.cherryText} a="end" o={easeOut(seg(t, 2.6, 3.0))}>
        PostgreSQL: no PIVOT
      </T>
    </Svg>
  );
}

// 12 · Verdict, with underlines and ticks; then the two prove-it checks.
export function Verdict({ t }: StepCtx) {
  const rows = [
    ['one scan', 'ROLLUP / CUBE / GROUPING SETS', 400],
    ['two kinds of NULL', 'GROUPING() = 0', 210],
    ['wide report', 'FILTER (WHERE …)', 230],
  ] as const;
  return (
    <Svg label="Three habits for multi-level reports" h={280}>
      {rows.map((r, i) => {
        const a = easeOut(seg(t, 0.1 + i * 0.6, 0.6 + i * 0.6));
        const u = easeInOut(seg(t, 0.5 + i * 0.6, 1.0 + i * 0.6));
        const y = 50 + i * 80;
        return (
          <g key={r[0]} opacity={clamp(a)} transform={`translate(${(1 - a) * -20} 0)`}>
            <T x={25} y={y} s={14} f={C.latte}>
              {r[0]}
            </T>
            <T x={25} y={y + 30} s={20} f={C.caramel} w={700}>
              {r[1]}
            </T>
            <rect x={25} y={y + 40} width={r[2] * u} height={3} rx={1.5} fill={C.caramel} />
            {u >= 1 && <path d={`M 545 ${y + 20} l 6 6 l 12 -14`} fill="none" stroke={C.caramel} strokeWidth={2.5} />}
          </g>
        );
      })}
    </Svg>
  );
}

/** Prove it 1: ROLLUP(a, b, c) peels to four prefixes after the answer. */
export function ProveRollup({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const sets = ['(a, b, c)', '(a, b)', '(a)', '()'];
  return (
    <Svg label="ROLLUP over three columns keeps four prefixes" h={240}>
      <T x={40} y={60} s={20} f={C.latte}>
        ROLLUP(a, b, c) →
      </T>
      {answered ? (
        <>
          {sets.map((st, i) => {
            const k = easeOutBack(seg(s, 0.1 + i * 0.2, 0.4 + i * 0.2));
            return k > 0 ? (
              <g key={st} opacity={clamp(k)} transform={`translate(${25 + i * 140} ${100 + (1 - clamp(k)) * -14})`}>
                <rect width={125} height={36} rx={8} fill={C.cocoa} stroke={C.caramel} />
                <T x={62} y={23} s={14} f={C.crema} a="middle">
                  {st}
                </T>
              </g>
            ) : null;
          })}
          <T x={300} y={190} s={22} f={C.caramel} a="middle" w={700} o={easeOut(seg(s, 0.9, 1.2))}>
            4 sets
          </T>
        </>
      ) : (
        <T x={420} y={70} s={40} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      )}
    </Svg>
  );
}
/** Prove it 2: the grand total's two bits switch on, 1 1, and read as 3. */
export function ProveBits({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  return (
    <Svg label="GROUPING on the grand total of two columns is binary one one, which is three" h={240}>
      <T x={40} y={70} s={20} f={C.latte}>
        grand total → GROUPING =
      </T>
      {[0, 1].map((j) => {
        const lit = answered && s > 0.3 + j * 0.3;
        return (
          <g key={j}>
            <rect x={40 + j * 60} y={110} width={44} height={36} rx={5} fill={lit ? C.caramel : C.cocoa} stroke={C.mocha} />
            <T x={62 + j * 60} y={135} s={18} f={lit ? C.espresso : C.crema} a="middle" w={700}>
              {lit ? '1' : '?'}
            </T>
          </g>
        );
      })}
      {answered ? (
        <T x={180} y={138} s={30} f={C.caramel} w={700} o={easeOut(seg(s, 0.9, 1.2))}>
          = 3
        </T>
      ) : (
        <T x={200} y={142} s={40} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      )}
    </Svg>
  );
}
