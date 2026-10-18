import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeOut, easeOutBack, seg } from '../../../../../reels/anim';
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
          <T x={x + w / 2} y={y + h / 2 + 5} s={13} f={C.crema} a="middle">{v}</T>
        </>
      )}
    </g>
  );
}

// 1 · The problem: two columns with gaps.
export function Missing({ t }: StepCtx) {
  const rows = [
    ['1001', '2026-10-01', 'c-17'],
    ['1002', undefined, undefined],
    ['1003', '2026-10-03', undefined],
    ['1004', undefined, 'c-02'],
  ];
  return (
    <Svg label="An orders table where shipped_at and referred_by are sometimes missing, drawn as empty dashed cells" h={320}>
      <T x={25} y={34} s={14} f={C.latte}>order_id</T>
      <T x={170} y={34} s={14} f={C.latte}>shipped_at</T>
      <T x={330} y={34} s={14} f={C.latte}>referred_by</T>
      {rows.map((r, i) => {
        const a = easeOut(seg(t, 0.3 + i * 0.35, 0.8 + i * 0.35));
        return (
          <g key={i} opacity={clamp(a)}>
            <Cell x={25} y={48 + i * 48} w={110} v={r[0]} />
            <Cell x={170} y={48 + i * 48} w={130} v={r[1]} />
            <Cell x={330} y={48 + i * 48} w={110} v={r[2]} />
          </g>
        );
      })}
      <T x={300} y={270} s={15} f={C.caramel} a="middle" o={easeOut(seg(t, 2.0, 2.8))}>an empty dashed cell is NULL:</T>
      <T x={300} y={292} s={15} f={C.caramel} a="middle" o={easeOut(seg(t, 2.0, 2.8))}>not zero, not blank text</T>
    </Svg>
  );
}

const TV = ['T', 'F', '?'] as const;
const AND = (a: string, b: string) => (a === 'F' || b === 'F' ? 'F' : a === '?' || b === '?' ? '?' : 'T');
const OR = (a: string, b: string) => (a === 'T' || b === 'T' ? 'T' : a === '?' || b === '?' ? '?' : 'F');
const tone = (v: string) => (v === 'T' ? C.crema : v === 'F' ? C.cherryText : C.taupe);

/** A 3 by 3 truth table. */
function Table3({ x, y, op, f, prog }: { x: number; y: number; op: string; f: (a: string, b: string) => string; prog: number }) {
  return (
    <g opacity={clamp(prog)}>
      <T x={x + 66} y={y} s={16} f={C.caramel} a="middle" w={700}>{op}</T>
      {TV.map((b, j) => <T key={b} x={x + 50 + j * 36} y={y + 28} s={14} f={tone(b)} a="middle">{b}</T>)}
      {TV.map((a, i) => (
        <g key={a}>
          <T x={x + 10} y={y + 58 + i * 34} s={14} f={tone(a)} a="middle">{a}</T>
          {TV.map((b, j) => {
            const r = f(a, b);
            return (
              <g key={b}>
                <rect x={x + 33 + j * 36} y={y + 38 + i * 34} width={32} height={28} rx={6} fill={r === '?' ? 'none' : C.cocoa} stroke={r === '?' ? C.taupe : C.mocha} strokeDasharray={r === '?' ? '4 3' : undefined} />
                <T x={x + 49 + j * 36} y={y + 58 + i * 34} s={14} f={tone(r)} a="middle" w={700}>{r}</T>
              </g>
            );
          })}
        </g>
      ))}
    </g>
  );
}

// 2 · The truth tables.
export function TruthTables({ t }: StepCtx) {
  return (
    <Svg label="AND and OR truth tables over TRUE, FALSE and UNKNOWN" h={300}>
      <Table3 x={40} y={50} op="AND" f={AND} prog={easeOut(seg(t, 0.2, 1.0))} />
      <Table3 x={330} y={50} op="OR" f={OR} prog={easeOut(seg(t, 1.2, 2.0))} />
      <T x={300} y={250} s={14} f={C.latte} a="middle" o={easeOut(seg(t, 2.6, 3.4))}>F wins an AND, T wins an OR, otherwise ? spreads</T>
      <T x={300} y={278} s={13} f={C.taupe} a="middle" o={easeOut(seg(t, 2.8, 3.6))}>T = true · F = false · ? = unknown</T>
    </Svg>
  );
}

// 3 · Predict: NOT UNKNOWN.
export function NotUnknown({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="NOT applied to UNKNOWN" h={280}>
      <T x={150} y={90} s={30} f={C.latte} a="middle" serif>NOT</T>
      <rect x={210} y={52} width={64} height={52} rx={10} fill="none" stroke={C.latte} strokeWidth={1.5} strokeDasharray="5 4" />
      <T x={242} y={88} s={26} f={C.taupe} a="middle" w={700}>?</T>
      <T x={320} y={90} s={30} f={C.latte} a="middle" serif>=</T>
      {!answered ? (
        <T x={400} y={96} s={48} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>
      ) : (
        <>
          <rect x={366} y={52} width={64} height={52} rx={10} fill="none" stroke={C.caramel} strokeWidth={2} strokeDasharray="5 4" />
          <T x={398} y={88} s={26} f={C.caramel} a="middle" w={700}>?</T>
          <T x={300} y={170} s={16} f={C.crema} a="middle">flip &ldquo;I do not know&rdquo; and you still do not know</T>
          <T x={300} y={200} s={14} f={C.cherryText} a="middle">NOT x is never a sure answer when x is unknown</T>
        </>
      )}
    </Svg>
  );
}

// 4 · x = NULL is never true; the filter drops UNKNOWN like FALSE.
export function FilterDrop({ t }: StepCtx) {
  const rows = [
    { v: '7', r: 'T' },
    { v: '3', r: 'F' },
    { v: undefined, r: '?' },
  ];
  return (
    <Svg label="WHERE amount = 7 over rows 7, 3 and NULL: only TRUE survives" h={320}>
      <T x={25} y={34} s={14} f={C.latte}>WHERE amount = 7</T>
      {rows.map((row, i) => {
        const a = easeOut(seg(t, 0.4 + i * 0.5, 1.0 + i * 0.5));
        const drop = easeOut(seg(t, 2.4, 3.2));
        const kept = row.r === 'T';
        return (
          <g key={i} opacity={clamp(a) * (kept ? 1 : 1 - 0.65 * drop)}>
            <Cell x={25} y={60 + i * 62} w={120} v={row.v} />
            <T x={190} y={84 + i * 62} s={14} f={C.latte}>= 7 gives</T>
            <T x={300} y={86 + i * 62} s={22} f={tone(row.r)} w={700}>{row.r === 'T' ? 'TRUE' : row.r === 'F' ? 'FALSE' : 'UNKNOWN'}</T>
            <T x={450} y={84 + i * 62} s={14} f={kept ? C.caramel : C.cherryText}>{kept ? 'kept' : 'dropped'}</T>
          </g>
        );
      })}
      <T x={300} y={282} s={14} f={C.latte} a="middle" o={easeOut(seg(t, 3.0, 3.8))}>UNKNOWN is dropped exactly like FALSE</T>
    </Svg>
  );
}

// 5 · IS DISTINCT FROM.
export function DistinctFrom({ t }: StepCtx) {
  const pairs: { a?: string; b?: string; eq: string; dist: string }[] = [
    { a: '7', b: '7', eq: 'TRUE', dist: 'FALSE' },
    { a: '7', b: undefined, eq: 'UNKNOWN', dist: 'TRUE' },
    { a: undefined, b: undefined, eq: 'UNKNOWN', dist: 'FALSE' },
  ];
  return (
    <Svg label="Equality versus IS DISTINCT FROM on three pairs" h={320}>
      <T x={25} y={34} s={13} f={C.latte}>a</T>
      <T x={130} y={34} s={13} f={C.latte}>b</T>
      <T x={235} y={34} s={13} f={C.latte}>a = b</T>
      <T x={390} y={34} s={13} f={C.caramel}>IS DISTINCT FROM</T>
      {pairs.map((p, i) => {
        const a = easeOut(seg(t, 0.4 + i * 0.6, 1.0 + i * 0.6));
        return (
          <g key={i} opacity={clamp(a)}>
            <Cell x={25} y={56 + i * 62} w={70} v={p.a} />
            <Cell x={130} y={56 + i * 62} w={70} v={p.b} />
            <T x={235} y={80 + i * 62} s={14} f={p.eq === 'UNKNOWN' ? C.taupe : C.crema}>{p.eq}</T>
            <T x={390} y={80 + i * 62} s={14} f={C.caramel} w={700}>{p.dist}</T>
          </g>
        );
      })}
      <T x={300} y={282} s={14} f={C.latte} a="middle" o={easeOut(seg(t, 2.6, 3.4))}>the right-hand column is never UNKNOWN</T>
    </Svg>
  );
}

// 6 · Five rules.
const RULES = [
  { k: 'WHERE / JOIN', v: 'UNKNOWN is dropped; NULL never matches' },
  { k: 'GROUP BY', v: 'all NULLs fall in one group' },
  { k: 'ORDER BY', v: 'NULLs sort as if larger than all' },
  { k: 'Aggregates', v: 'skip NULLs, except COUNT(*)' },
  { k: 'UNIQUE', v: 'any number of NULLs allowed' },
];
export function FiveRules({ t }: StepCtx) {
  return (
    <Svg label="Five clauses, five different NULL rules" h={340}>
      {RULES.map((r, i) => {
        const a = easeOutBack(seg(t, i * 0.55, i * 0.55 + 0.6));
        const y = 40 + i * 60;
        return (
          <g key={r.k} opacity={clamp(a)} transform={`translate(${(1 - clamp(a)) * -18} 0)`}>
            <T x={25} y={y} s={15} f={C.caramel} w={700}>{r.k}</T>
            <T x={25} y={y + 24} s={13} f={C.latte}>{r.v}</T>
          </g>
        );
      })}
    </Svg>
  );
}

// 7 · Predict: NOT IN with a NULL.
export function NotInPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="Customers NOT IN a list that contains a NULL" h={300}>
      <T x={25} y={36} s={14} f={C.latte}>do-not-email list</T>
      {[0, 1, 2, 3].map((i) => <Cell key={i} x={25 + i * 76} y={54} w={66} v={['c-1', 'c-2', 'c-3', '…'][i]} o={easeOut(seg(t, 0.2 + i * 0.2, 0.6 + i * 0.2))} />)}
      <Cell x={329} y={54} w={66} o={easeOut(seg(t, 1.1, 1.6))} />
      <T x={362} y={110} s={13} f={C.cherryText} a="middle" o={easeOut(seg(t, 1.4, 2.0))}>one NULL row</T>
      <T x={25} y={166} s={14} f={C.latte}>SELECT … WHERE customer_id NOT IN (list)</T>
      {!answered ? (
        <T x={300} y={250} s={46} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>
      ) : (
        <T x={300} y={240} s={24} f={C.cherryText} a="middle" w={700}>0 rows</T>
      )}
    </Svg>
  );
}

// 8 · The chain goes dim; NOT EXISTS.
export function NotExists({ t }: StepCtx) {
  const links = ['≠ c-1', '≠ c-2', '≠ c-3', '≠ NULL'];
  const fall = easeOut(seg(t, 1.8, 2.6));
  return (
    <Svg label="x NOT IN (c-1, c-2, c-3, NULL) is a chain of not-equal links; the last is UNKNOWN so the chain is UNKNOWN" h={340}>
      <T x={25} y={34} s={14} f={C.latte}>x NOT IN (…) means all of these, ANDed</T>
      {links.map((l, i) => {
        const a = easeOut(seg(t, 0.3 + i * 0.35, 0.8 + i * 0.35));
        const bad = i === 3;
        return (
          <g key={l} opacity={clamp(a)}>
            <rect x={25 + i * 140} y={60} width={124} height={44} rx={8} fill={bad ? 'none' : C.cocoa} stroke={bad ? C.cherryText : C.mocha} strokeDasharray={bad ? '5 4' : undefined} />
            <T x={87 + i * 140} y={88} s={14} f={bad ? C.cherryText : C.crema} a="middle">{l}</T>
            <T x={87 + i * 140} y={124} s={13} f={bad ? C.taupe : C.crema} a="middle">{bad ? 'UNKNOWN' : 'TRUE'}</T>
          </g>
        );
      })}
      <T x={300} y={170} s={16} f={C.cherryText} a="middle" o={fall}>the whole chain is UNKNOWN: the row is dropped</T>
      <T x={25} y={228} s={14} f={C.latte} o={easeOut(seg(t, 2.8, 3.4))}>NOT EXISTS asks: is there a matching row?</T>
      <T x={25} y={262} s={20} f={C.caramel} w={700} o={easeOut(seg(t, 3.2, 3.8))}>{fmt(19_500_000)} customers returned</T>
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
      <T x={25} y={40} s={14} f={C.latte}>COUNT(*)</T>
      <rect x={25} y={52} width={full} height={26} rx={7} fill={C.cocoa} />
      <rect x={25} y={52} width={Math.max(3, full * b1)} height={26} rx={7} fill={C.crema} />
      <T x={25} y={104} s={15} f={C.crema} o={b1}>{fmt(100_000_000)}</T>
      <T x={25} y={150} s={14} f={C.latte}>COUNT(shipped_at)</T>
      <rect x={25} y={162} width={full} height={26} rx={7} fill={C.cocoa} />
      <rect x={25} y={162} width={Math.max(3, full * 0.62 * b2)} height={26} rx={7} fill={C.caramel} />
      <rect x={25 + full * 0.62} y={162} width={full * 0.38 * b2} height={26} rx={0} fill="none" stroke={C.latte} strokeDasharray="5 4" />
      <T x={25} y={214} s={15} f={C.caramel} o={b2}>{fmt(62_000_000)}</T>
      <T x={300} y={260} s={16} f={C.cherryText} a="middle" o={easeOut(seg(t, 2.6, 3.4))}>{fmt(38_000_000)} unshipped orders, silently uncounted</T>
    </Svg>
  );
}

// 10 · Summary.
export function Verdict({ t }: StepCtx) {
  const rows = [
    { l: 'a side may be missing', v: 'IS DISTINCT FROM' },
    { l: 'excluding by a nullable list', v: 'NOT EXISTS' },
    { l: 'counting rows or values', v: 'COUNT(*) vs COUNT(col)' },
  ];
  return (
    <Svg label="Three habits that keep NULL honest" h={300}>
      {rows.map((r, i) => {
        const a = easeOut(seg(t, i * 0.6, i * 0.6 + 0.7));
        return (
          <g key={r.l} opacity={clamp(a)}>
            <T x={25} y={60 + i * 80} s={14} f={C.latte}>{r.l}</T>
            <T x={25} y={92 + i * 80} s={22} f={C.caramel} w={700}>{r.v}</T>
          </g>
        );
      })}
    </Svg>
  );
}

// 11 · Prove it: NULL OR TRUE.
export function ProveOr({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="NULL OR TRUE" h={240}>
      <rect x={90} y={60} width={64} height={52} rx={10} fill="none" stroke={C.latte} strokeWidth={1.5} strokeDasharray="5 4" />
      <T x={206} y={96} s={22} f={C.latte} a="middle" serif>OR</T>
      <rect x={250} y={60} width={64} height={52} rx={10} fill={C.cocoa} stroke={C.caramel} />
      <T x={282} y={94} s={16} f={C.crema} a="middle">TRUE</T>
      <T x={350} y={96} s={22} f={C.latte}>=</T>
      {answered ? <T x={410} y={98} s={22} f={C.caramel} w={700}>TRUE</T> : <T x={410} y={102} s={36} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
    </Svg>
  );
}

// 12 · Prove it: SUM skipping NULL.
export function ProveSum({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="SUM over 10, 5 and NULL" h={240}>
      <Cell x={60} y={60} w={80} v="10" />
      <Cell x={160} y={60} w={80} v="5" />
      <Cell x={260} y={60} w={80} />
      <T x={355} y={86} s={22} f={C.latte}>SUM =</T>
      {answered ? <T x={490} y={88} s={22} f={C.caramel} w={700}>15</T> : <T x={490} y={92} s={34} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
    </Svg>
  );
}
