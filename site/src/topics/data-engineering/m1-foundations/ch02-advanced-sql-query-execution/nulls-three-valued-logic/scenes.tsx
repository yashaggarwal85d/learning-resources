import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar: crema = a known value, caramel = what to look at, cherryText = the thing that goes wrong, taupe = quiet.
// NULL is always drawn as an empty cell with a dashed border (never the word), UNKNOWN as a dim "?" marker.
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

/** A table cell: a value, or the dashed empty cell that means NULL. */
function Cell({ x, y, w = 110, h = 34, v, o = 1 }: { x: number; y: number; w?: number; h?: number; v?: string; o?: number }) {
  return (
    <g opacity={o}>
      {v === undefined ? (
        <rect x={x} y={y} width={w} height={h} rx={6} fill="none" stroke={C.latte} strokeWidth={1.5} strokeDasharray="5 4" />
      ) : (
        <>
          <rect x={x} y={y} width={w} height={h} rx={6} fill={C.cocoa} stroke={C.mocha} />
          <T x={x + w / 2} y={y + h / 2 + 5} s={13} f={C.crema} a="middle">
            {v}
          </T>
        </>
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

// 1 · The problem: two columns with gaps. Rows slide in; then the eye is walked to the dashed cells: first order
// 1002's missing ship date, then the missing referrers.
export function Missing({ t }: StepCtx) {
  const rows = [
    ['1001', '2026-10-01', 'c-17'],
    ['1002', undefined, undefined],
    ['1003', '2026-10-03', undefined],
    ['1004', undefined, 'c-02'],
  ];
  const ship = easeOut(seg(t, 1.6, 2.0));
  const ref = easeOut(seg(t, 2.1, 2.5));
  const ring = (x: number, y: number, w: number, k: number, key: string) =>
    k <= 0 ? null : <rect key={key} x={x - 4} y={y - 4} width={w + 8} height={42} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} opacity={k} />;
  return (
    <Svg label="An orders table where shipped_at and referred_by are sometimes missing, drawn as empty dashed cells" h={320}>
      <T x={25} y={34} s={14} f={C.latte}>
        order_id
      </T>
      <T x={170} y={34} s={14} f={C.latte}>
        shipped_at
      </T>
      <T x={330} y={34} s={14} f={C.latte}>
        referred_by
      </T>
      {rows.map((r, i) => {
        const a = easeOut(seg(t, 0.2 + i * 0.3, 0.7 + i * 0.3));
        return (
          <g key={i} opacity={clamp(a)} transform={`translate(${(1 - a) * -30} 0)`}>
            <Cell x={25} y={48 + i * 48} w={110} v={r[0]} />
            <Cell x={170} y={48 + i * 48} w={130} v={r[1]} />
            <Cell x={330} y={48 + i * 48} w={110} v={r[2]} />
          </g>
        );
      })}
      {ring(170, 96, 130, ship, 's1')}
      {ring(170, 192, 130, ship * 0.6, 's2')}
      {ring(330, 96, 110, ref, 'r1')}
      {ring(330, 144, 110, ref, 'r2')}
      <T x={300} y={270} s={15} f={C.caramel} a="middle" o={easeOut(seg(t, 2.5, 3.0))}>
        an empty dashed cell is NULL:
      </T>
      <T x={300} y={294} s={15} f={C.caramel} a="middle" o={easeOut(seg(t, 2.5, 3.0))}>
        not zero, not blank text
      </T>
    </Svg>
  );
}

const TV = ['T', 'F', '?'] as const;
const AND = (a: string, b: string) => (a === 'F' || b === 'F' ? 'F' : a === '?' || b === '?' ? '?' : 'T');
const OR = (a: string, b: string) => (a === 'T' || b === 'T' ? 'T' : a === '?' || b === '?' ? '?' : 'F');
const tone = (v: string) => (v === 'T' ? C.crema : v === 'F' ? C.cherryText : C.taupe);

// 2 · The truth tables.
export function TruthTables({ t }: StepCtx) {
  return (
    <Svg label="AND and OR truth tables over TRUE, FALSE and UNKNOWN" h={300}>
      <Table3 x={40} y={50} op="AND" f={AND} prog={easeOut(seg(t, 0.2, 1.0))} />
      <Table3 x={330} y={50} op="OR" f={OR} prog={easeOut(seg(t, 1.2, 2.0))} />
      <T x={300} y={250} s={14} f={C.latte} a="middle" o={easeOut(seg(t, 2.6, 3.4))}>
        F wins an AND, T wins an OR, otherwise ? spreads
      </T>
      <T x={300} y={278} s={13} f={C.taupe} a="middle" o={easeOut(seg(t, 2.8, 3.6))}>
        T = true · F = false · ? = unknown
      </T>
    </Svg>
  );
}

/** A 3 by 3 truth table. */
function Table3({ x, y, op, f, prog }: { x: number; y: number; op: string; f: (a: string, b: string) => string; prog: number }) {
  return (
    <g opacity={clamp(prog)}>
      <T x={x + 66} y={y} s={16} f={C.caramel} a="middle" w={700}>
        {op}
      </T>
      {TV.map((b, j) => (
        <T key={b} x={x + 50 + j * 36} y={y + 28} s={14} f={tone(b)} a="middle">
          {b}
        </T>
      ))}
      {TV.map((a, i) => (
        <g key={a}>
          <T x={x + 10} y={y + 58 + i * 34} s={14} f={tone(a)} a="middle">
            {a}
          </T>
          {TV.map((b, j) => {
            const r = f(a, b);
            return (
              <g key={b}>
                <rect
                  x={x + 33 + j * 36}
                  y={y + 38 + i * 34}
                  width={32}
                  height={28}
                  rx={6}
                  fill={r === '?' ? 'none' : C.cocoa}
                  stroke={r === '?' ? C.taupe : C.mocha}
                  strokeDasharray={r === '?' ? '4 3' : undefined}
                />
                <T x={x + 49 + j * 36} y={y + 58 + i * 34} s={14} f={tone(r)} a="middle" w={700}>
                  {r}
                </T>
              </g>
            );
          })}
        </g>
      ))}
    </g>
  );
}

// 3 · Predict: NOT UNKNOWN. First the two known flips play (NOT T gives F, NOT F gives T). After the answer the
// unknown box goes through NOT, turning over, and comes out the other side still unknown.
export function NotUnknown({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const f1 = easeOut(seg(t, 0.1, 0.5));
  const f2 = easeOut(seg(t, 0.4, 0.8));
  const move = answered ? easeInOut(seg(s, 0.2, 1.4)) : 0;
  const flip = answered ? Math.cos(Math.PI * 2 * seg(s, 0.5, 1.1)) : 1;
  const bx = lerp(210, 366, move);
  return (
    <Svg label="NOT applied to UNKNOWN: true flips to false and false to true, but unknown stays unknown" h={280}>
      <T x={25} y={30} s={14} f={C.latte} o={f1}>
        NOT T → F
      </T>
      <T x={170} y={30} s={14} f={C.latte} o={f2}>
        NOT F → T
      </T>
      <T x={150} y={120} s={30} f={C.latte} a="middle" serif>
        NOT
      </T>
      <T x={320} y={120} s={30} f={C.latte} a="middle" serif>
        =
      </T>
      <g transform={`translate(${bx + 32} ${108 - 40 * Math.sin(Math.PI * move)}) scale(${Math.max(0.08, Math.abs(flip))} 1)`}>
        <rect x={-32} y={-26} width={64} height={52} rx={10} fill="none" stroke={answered && move >= 1 ? C.caramel : C.latte} strokeWidth={1.5} strokeDasharray="5 4" />
        <T x={0} y={10} s={26} f={answered && move >= 1 ? C.caramel : C.taupe} a="middle" w={700}>
          ?
        </T>
      </g>
      {!answered && (
        <T x={400} y={126} s={48} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      )}
      <g opacity={answered ? easeOut(seg(s, 1.4, 1.8)) : 0}>
        <T x={300} y={200} s={16} f={C.crema} a="middle">
          flip “I do not know”: still unknown
        </T>
        <T x={300} y={230} s={14} f={C.cherryText} a="middle">
          negation cannot create knowledge
        </T>
      </g>
    </Svg>
  );
}

// 4 · x = NULL is never true. Four rows are compared with 7 one by one (the last is a gap against a gap). Then the
// WHERE filter acts: the TRUE row slides into the result, the FALSE and UNKNOWN rows drop out the same way.
export function FilterDrop({ t }: StepCtx) {
  const rows: { v?: string; rhs: string; r: string }[] = [
    { v: '7', rhs: '= 7', r: 'T' },
    { v: '3', rhs: '= 7', r: 'F' },
    { v: undefined, rhs: '= 7', r: '?' },
    { v: undefined, rhs: '= gap', r: '?' },
  ];
  const drop = easeIn2(seg(t, 2.6, 3.3));
  return (
    <Svg label="WHERE amount = 7 over rows 7, 3 and NULL, and NULL compared with NULL: only TRUE survives, UNKNOWN is dropped like FALSE" h={330}>
      <T x={25} y={30} s={14} f={C.latte}>
        WHERE amount = 7
      </T>
      {rows.map((row, i) => {
        const a = easeOut(seg(t, 0.3 + i * 0.5, 0.7 + i * 0.5));
        const res = easeOut(seg(t, 0.6 + i * 0.5, 0.9 + i * 0.5));
        const kept = row.r === 'T';
        const y = 50 + i * 54;
        return (
          <g key={i} opacity={clamp(a) * (kept ? 1 : 1 - 0.8 * drop)} transform={`translate(${kept ? 0 : 0} ${kept ? 0 : drop * 24})`}>
            <Cell x={25} y={y} w={100} v={row.v} />
            <T x={145} y={y + 22} s={14} f={C.latte}>
              {row.rhs}
            </T>
            <T x={250} y={y + 23} s={18} f={tone(row.r)} w={700} o={res}>
              {row.r === 'T' ? 'TRUE' : row.r === 'F' ? 'FALSE' : 'UNKNOWN'}
            </T>
            <T x={460} y={y + 22} s={14} f={kept ? C.caramel : C.cherryText} o={easeOut(seg(t, 2.5, 2.8))}>
              {kept ? 'kept' : 'dropped'}
            </T>
          </g>
        );
      })}
      <T x={300} y={312} s={14} f={C.latte} a="middle" o={easeOut(seg(t, 3.1, 3.6))}>
        UNKNOWN is dropped exactly like FALSE
      </T>
    </Svg>
  );
}

const easeIn2 = (x: number) => x * x;

// 5 · IS DISTINCT FROM.
export function DistinctFrom({ t }: StepCtx) {
  const pairs: { a?: string; b?: string; eq: string; dist: string }[] = [
    { a: '7', b: '7', eq: 'TRUE', dist: 'FALSE' },
    { a: '7', b: undefined, eq: 'UNKNOWN', dist: 'TRUE' },
    { a: undefined, b: undefined, eq: 'UNKNOWN', dist: 'FALSE' },
  ];
  return (
    <Svg label="Equality versus IS DISTINCT FROM on three pairs" h={320}>
      <T x={25} y={34} s={13} f={C.latte}>
        a
      </T>
      <T x={130} y={34} s={13} f={C.latte}>
        b
      </T>
      <T x={235} y={34} s={13} f={C.latte}>
        a = b
      </T>
      <T x={390} y={34} s={13} f={C.caramel}>
        IS DISTINCT FROM
      </T>
      {pairs.map((p, i) => {
        const a = easeOut(seg(t, 0.4 + i * 0.6, 1.0 + i * 0.6));
        return (
          <g key={i} opacity={clamp(a)}>
            <Cell x={25} y={56 + i * 62} w={70} v={p.a} />
            <Cell x={130} y={56 + i * 62} w={70} v={p.b} />
            <T x={235} y={80 + i * 62} s={14} f={p.eq === 'UNKNOWN' ? C.taupe : C.crema}>
              {p.eq}
            </T>
            <T x={390} y={80 + i * 62} s={14} f={C.caramel} w={700}>
              {p.dist}
            </T>
          </g>
        );
      })}
      <T x={300} y={282} s={14} f={C.latte} a="middle" o={easeOut(seg(t, 2.6, 3.4))}>
        the right-hand column is never UNKNOWN
      </T>
    </Svg>
  );
}

// 6 · Five rules, in the order the narration names them, each with a tiny demonstration beside it: gaps pile into
// one group, the gap sorts to the end, the gap is skipped by SUM, many gaps pass UNIQUE, and a join line between two
// gaps never connects.
const RULES = [
  { k: 'GROUP BY', v: 'all NULLs fall in one group' },
  { k: 'ORDER BY', v: 'NULLs sort as if larger than all' },
  { k: 'Aggregates', v: 'skip NULLs, except COUNT(*)' },
  { k: 'UNIQUE', v: 'any number of NULLs allowed' },
  { k: 'WHERE / JOIN', v: 'UNKNOWN dropped; NULL never matches' },
];
function Mini({ i, k, y }: { i: number; k: number; y: number }) {
  const X = 400;
  const gap = (x: number, yy: number, key: string, o = 1, stroke: string = C.latte) => (
    <rect key={key} x={x} y={yy} width={30} height={18} rx={4} fill="none" stroke={stroke} strokeDasharray="4 3" opacity={o} />
  );
  const val = (x: number, yy: number, v: string, key: string, o = 1) => (
    <g key={key} opacity={o}>
      <rect x={x} y={yy} width={30} height={18} rx={4} fill={C.cocoa} stroke={C.mocha} />
      <T x={x + 15} y={yy + 14} s={13} f={C.crema} a="middle">
        {v}
      </T>
    </g>
  );
  const top = y - 18;
  if (i === 0) return <g>{[0, 1, 2].map((j) => gap(lerp(X + j * 50, X + 50 + j * 5, k), top + lerp(0, j * 3 - 3, k), 'g' + j))}</g>;
  if (i === 1) {
    // positions: the gap starts first and slides to the end
    return (
      <g>
        {gap(lerp(X, X + 100, k), top, 'g')}
        {val(lerp(X + 50, X, k), top, '9', 'a')}
        {val(lerp(X + 100, X + 50, k), top, '2', 'b')}
      </g>
    );
  }
  if (i === 2)
    return (
      <g>
        {val(X, top, '10', 'a')}
        {val(X + 40, top, '5', 'b')}
        {gap(X + 80, top, 'g', 1 - 0.8 * k)}
        <T x={575} y={top + 14} s={13} f={C.caramel} a="end" o={k}>
          15
        </T>
      </g>
    );
  if (i === 3) return <g>{[0, 1, 2, 3].map((j) => gap(X + j * 40, top, 'g' + j, j < 1 + k * 3 ? 1 : 0, C.caramel))}</g>;
  return (
    <g>
      {gap(X, top, 'a')}
      {gap(X + 130, top, 'b')}
      <line x1={X + 30} y1={top + 9} x2={lerp(X + 30, X + 92, k)} y2={top + 9} stroke={C.cherryText} strokeWidth={2} />
      {k >= 1 && <path d={`M ${X + 94} ${top + 3} l 10 12 M ${X + 104} ${top + 3} l -10 12`} stroke={C.cherryText} strokeWidth={2} />}
    </g>
  );
}
export function FiveRules({ t }: StepCtx) {
  return (
    <Svg label="Five clauses, five different NULL rules: one group, sorted last, skipped by aggregates, many allowed by UNIQUE, never matched by a join" h={330}>
      {RULES.map((r, i) => {
        const a = easeOutBack(seg(t, 0.1 + i * 0.85, 0.6 + i * 0.85));
        const k = easeInOut(seg(t, 0.5 + i * 0.85, 1.1 + i * 0.85));
        const y = 34 + i * 60;
        return (
          <g key={r.k} opacity={clamp(a)} transform={`translate(${(1 - clamp(a)) * -18} 0)`}>
            <T x={25} y={y} s={15} f={C.caramel} w={700}>
              {r.k}
            </T>
            <T x={25} y={y + 24} s={13} f={C.latte}>
              {r.v}
            </T>
            <Mini i={i} k={k} y={y} />
          </g>
        );
      })}
    </Svg>
  );
}

// 7 · Predict: NOT IN with a NULL. The list builds with one gap at the end. After the answer a bar for the
// 19,500,000 customers a correct query returns appears and drains to nothing: 0 rows.
export function NotInPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const show = answered ? easeOut(seg(s, 0.2, 0.6)) : 0;
  const drain = answered ? easeInOut(seg(s, 0.9, 2.0)) : 0;
  return (
    <Svg label="Customers NOT IN a list that contains a NULL: zero rows come back instead of nineteen and a half million" h={300}>
      <T x={25} y={36} s={14} f={C.latte}>
        do-not-email list
      </T>
      {[0, 1, 2, 3].map((i) => (
        <Cell key={i} x={25 + i * 76} y={54} w={66} v={['c-1', 'c-2', 'c-3', '…'][i]} o={easeOut(seg(t, 0.2 + i * 0.2, 0.6 + i * 0.2))} />
      ))}
      <g transform={`translate(0 ${(1 - easeOutBack(seg(t, 1.1, 1.5))) * -30})`}>
        <Cell x={329} y={54} w={66} o={easeOut(seg(t, 1.1, 1.4))} />
      </g>
      <T x={362} y={110} s={13} f={C.cherryText} a="middle" o={easeOut(seg(t, 1.4, 1.8))}>
        one NULL row
      </T>
      <T x={25} y={156} s={14} f={C.latte}>
        WHERE customer_id NOT IN (list)
      </T>
      {!answered && (
        <T x={300} y={250} s={46} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      )}
      <g opacity={show}>
        <T x={25} y={190} s={13} f={C.latte}>
          a correct query: 19,500,000
        </T>
        <rect x={25} y={200} width={500} height={20} rx={4} fill={C.cocoa} />
        <rect x={25} y={200} width={500 * (1 - drain)} height={20} rx={4} fill={C.crema} />
      </g>
      {answered && (
        <T x={575} y={270} s={24} f={C.cherryText} a="end" w={700}>
          {fmt(19_500_000 * (1 - drain))} rows
        </T>
      )}
    </Svg>
  );
}

// 8 · The chain goes dim. Three links light TRUE, the last one goes dim, and the dimness spreads back along the whole
// chain: the row is dropped. Then NOT EXISTS: a probe walks the list looking for a match, finds none, and the
// customer comes back; the count climbs to 19,500,000.
export function NotExists({ t }: StepCtx) {
  const links = ['≠ c-1', '≠ c-2', '≠ c-3', '≠ gap'];
  const spread = seg(t, 1.6, 2.2);
  const fall = easeOut(seg(t, 2.1, 2.5));
  const probe = seg(t, 2.7, 3.5);
  const found = easeOut(seg(t, 3.5, 3.9));
  return (
    <Svg
      label="x NOT IN a list with a NULL is a chain of not-equal links; the last is UNKNOWN so the whole chain is UNKNOWN; NOT EXISTS asks whether any row matches and returns the customers"
      h={340}
    >
      <T x={25} y={30} s={14} f={C.latte}>
        x NOT IN (…) means all of these, ANDed
      </T>
      {links.map((l, i) => {
        const a = easeOut(seg(t, 0.2 + i * 0.3, 0.6 + i * 0.3));
        const bad = i === 3;
        const dim = bad ? 1 : seg(spread * 3, 2 - i, 3 - i);
        return (
          <g key={l} opacity={clamp(a)}>
            {i > 0 && <line x1={i * 140 + 9} y1={78} x2={i * 140 + 25} y2={78} stroke={dim > 0.5 ? C.taupe : C.mocha} strokeWidth={3} />}
            <rect
              x={25 + i * 140}
              y={56}
              width={124}
              height={44}
              rx={8}
              fill={bad || dim > 0.5 ? 'none' : C.cocoa}
              stroke={bad ? C.cherryText : dim > 0.5 ? C.taupe : C.mocha}
              strokeDasharray={bad || dim > 0.5 ? '5 4' : undefined}
            />
            <T x={87 + i * 140} y={84} s={14} f={bad ? C.cherryText : C.crema} a="middle" o={1 - 0.5 * dim}>
              {l}
            </T>
            <T x={87 + i * 140} y={122} s={13} f={dim > 0.5 ? C.taupe : C.crema} a="middle">
              {dim > 0.5 ? 'UNKNOWN' : 'TRUE'}
            </T>
          </g>
        );
      })}
      <T x={300} y={160} s={15} f={C.cherryText} a="middle" o={fall}>
        the chain is UNKNOWN: the row is dropped
      </T>
      <T x={25} y={208} s={14} f={C.latte} o={easeOut(seg(t, 2.5, 2.8))}>
        NOT EXISTS: is there a matching row?
      </T>
      {[0, 1, 2, 3].map((i) => (
        <Cell key={i} x={25 + i * 76} y={222} w={66} v={i < 3 ? `c-${i + 1}` : undefined} o={easeOut(seg(t, 2.5, 2.8))} />
      ))}
      {probe > 0 && probe < 1 && <rect x={21 + probe * 304} y={218} width={74} height={42} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />}
      <T x={350} y={246} s={13} f={C.latte} o={found}>
        no match
      </T>
      <T x={25} y={306} s={20} f={C.caramel} w={700} o={found}>
        {fmt(19_500_000 * found)} customers returned
      </T>
    </Svg>
  );
}

// 9 · COUNT(*) vs COUNT(column).
export function CountGap({ t }: StepCtx) {
  const full = 460;
  const b1 = easeOut(seg(t, 0.4, 1.4));
  const b2 = easeOut(seg(t, 1.4, 2.4));
  return (
    <Svg label="COUNT(*) is 100,000,000 and COUNT(shipped_at) is 62,000,000" h={300}>
      <T x={25} y={40} s={14} f={C.latte}>
        COUNT(*)
      </T>
      <rect x={25} y={52} width={full} height={26} rx={7} fill={C.cocoa} />
      <rect x={25} y={52} width={Math.max(3, full * b1)} height={26} rx={7} fill={C.crema} />
      <T x={25} y={104} s={15} f={C.crema} o={b1}>
        {fmt(100_000_000)}
      </T>
      <T x={25} y={150} s={14} f={C.latte}>
        COUNT(shipped_at)
      </T>
      <rect x={25} y={162} width={full} height={26} rx={7} fill={C.cocoa} />
      <rect x={25} y={162} width={Math.max(3, full * 0.62 * b2)} height={26} rx={7} fill={C.caramel} />
      <rect x={25 + full * 0.62} y={162} width={full * 0.38 * b2} height={26} rx={0} fill="none" stroke={C.latte} strokeDasharray="5 4" />
      <T x={25} y={214} s={15} f={C.caramel} o={b2}>
        {fmt(62_000_000)}
      </T>
      <T x={300} y={260} s={16} f={C.cherryText} a="middle" o={easeOut(seg(t, 2.6, 3.4))}>
        {fmt(38_000_000)} unshipped orders, silently uncounted
      </T>
    </Svg>
  );
}

// 10 · Summary: each habit arrives with its fix underlined and checked off.
export function Verdict({ t }: StepCtx) {
  const rows = [
    { l: 'a side may be missing', v: 'IS DISTINCT FROM', w: 230 },
    { l: 'excluding by a nullable list', v: 'NOT EXISTS', w: 150 },
    { l: 'counting rows or values', v: 'COUNT(*) vs COUNT(col)', w: 320 },
  ];
  return (
    <Svg label="Three habits that keep NULL honest" h={300}>
      {rows.map((r, i) => {
        const a = easeOut(seg(t, 0.2 + i * 0.7, 0.7 + i * 0.7));
        const u = easeInOut(seg(t, 0.6 + i * 0.7, 1.1 + i * 0.7));
        const y = 50 + i * 84;
        return (
          <g key={r.l} opacity={clamp(a)} transform={`translate(${(1 - a) * -20} 0)`}>
            <T x={25} y={y} s={14} f={C.latte}>
              {r.l}
            </T>
            <T x={25} y={y + 32} s={22} f={C.caramel} w={700}>
              {r.v}
            </T>
            <rect x={25} y={y + 42} width={r.w * u} height={3} rx={1.5} fill={C.caramel} />
            {u >= 1 && <path d={`M 540 ${y + 22} l 6 6 l 12 -14`} fill="none" stroke={C.caramel} strokeWidth={2.5} />}
          </g>
        );
      })}
    </Svg>
  );
}

// 11 · Prove it: NULL OR TRUE. After the answer the gap dims, the TRUE side lights, and TRUE drops into the result.
export function ProveOr({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const k = answered ? easeOut(seg(s, 0.1, 0.5)) : 0;
  const land = answered ? easeOutBack(seg(s, 0.5, 1.0)) : 0;
  return (
    <Svg label="NULL OR TRUE is TRUE: one sure true settles an OR" h={240}>
      <rect x={90} y={60} width={64} height={52} rx={10} fill="none" stroke={C.latte} strokeWidth={1.5} strokeDasharray="5 4" opacity={1 - 0.6 * k} />
      <T x={206} y={96} s={22} f={C.latte} a="middle" serif>
        OR
      </T>
      <rect x={250} y={60} width={64} height={52} rx={10} fill={C.cocoa} stroke={C.caramel} strokeWidth={1 + 1.5 * k} />
      <T x={282} y={94} s={16} f={C.crema} a="middle">
        TRUE
      </T>
      <T x={350} y={96} s={22} f={C.latte}>
        =
      </T>
      {answered ? (
        <g opacity={clamp(land)} transform={`translate(0 ${(1 - clamp(land)) * -24})`}>
          <T x={410} y={98} s={22} f={C.caramel} w={700}>
            TRUE
          </T>
        </g>
      ) : (
        <T x={410} y={102} s={36} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      )}
      <T x={300} y={180} s={14} f={C.latte} a="middle" o={answered ? easeOut(seg(s, 1.0, 1.4)) : 0}>
        one sure true settles an OR
      </T>
    </Svg>
  );
}

// 12 · Prove it: SUM skipping NULL. After the answer the gap fades out (skipped) and the total counts 0 → 10 → 15
// as each value is added.
export function ProveSum({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const a1 = answered ? easeOut(seg(s, 0.2, 0.6)) : 0;
  const a2 = answered ? easeOut(seg(s, 0.7, 1.1)) : 0;
  const skip = answered ? easeOut(seg(s, 1.2, 1.6)) : 0;
  const total = Math.round(10 * a1 + 5 * a2);
  return (
    <Svg label="SUM over 10, 5 and NULL is 15: the aggregate skips the missing value" h={240}>
      <Cell x={60} y={60} w={80} v="10" o={1 - 0.5 * a1} />
      <Cell x={160} y={60} w={80} v="5" o={1 - 0.5 * a2} />
      <g transform={`translate(0 ${skip * 30})`}>
        <Cell x={260} y={60} w={80} o={1 - 0.8 * skip} />
      </g>
      <T x={300} y={170} s={13} f={C.latte} a="middle" o={skip}>
        skipped
      </T>
      <T x={355} y={86} s={22} f={C.latte}>
        SUM =
      </T>
      {answered ? (
        <T x={490} y={88} s={22} f={C.caramel} w={700}>
          {total}
        </T>
      ) : (
        <T x={490} y={92} s={34} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      )}
    </Svg>
  );
}
