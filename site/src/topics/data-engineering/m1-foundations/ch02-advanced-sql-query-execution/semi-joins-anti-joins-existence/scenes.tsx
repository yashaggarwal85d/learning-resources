import { useEffect, useState, type ReactElement } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar: caramel = the row that survives / the operator under discussion, cherryText = the unsafe or wrong path,
// crema = data, taupe = quiet structure. Left table = customers c1..c5; right table = orders (c1 x3, c3 x1).

const CUST = ['c1', 'c2', 'c3', 'c4', 'c5'];
const ORD: Record<string, number> = { c1: 3, c3: 1 };
const rowY = (i: number) => 52 + i * 52;

function Left({ x = 40, o = 1, mark }: { x?: number; o?: number; mark?: (c: string) => string }) {
  return (
    <g opacity={o}>
      {CUST.map((c, i) => (
        <g key={c}>
          <rect x={x} y={rowY(i)} width={70} height={36} rx={8} fill={C.cocoa} stroke={mark ? mark(c) : C.mocha} strokeWidth={mark && mark(c) !== C.mocha ? 2 : 1} />
          <T x={x + 35} y={rowY(i) + 24} s={14} f={C.crema} a="middle">
            {c}
          </T>
        </g>
      ))}
    </g>
  );
}
function Right({ x = 430, o = 1 }: { x?: number; o?: number }) {
  const ids = ['c1', 'c1', 'c1', 'c3'];
  return (
    <g opacity={o}>
      {ids.map((c, i) => (
        <g key={i}>
          <rect x={x} y={rowY(i) + 8} width={70} height={30} rx={8} fill={C.roast} stroke={C.mocha} />
          <T x={x + 35} y={rowY(i) + 28} s={13} f={C.latte} a="middle">{`o${i + 1} → ${c}`}</T>
        </g>
      ))}
    </g>
  );
}
// Lines from left rows to their orders; `collapse` merges each bundle into one.
function Bundles({ collapse, show }: { collapse: number; show: number }) {
  const lines: ReactElement[] = [];
  const ids = ['c1', 'c1', 'c1', 'c3'];
  ids.forEach((c, k) => {
    const li = CUST.indexOf(c);
    const y1 = rowY(li) + 18;
    const y2 = rowY(k) + 23;
    const yMid = y1 + (y2 - y1) * (1 - collapse);
    lines.push(
      <line
        key={k}
        x1={110}
        y1={y1}
        x2={430}
        y2={collapse > 0.5 && k > 0 && c === 'c1' ? y1 : y2}
        stroke={C.taupe}
        strokeWidth={2}
        opacity={clamp(show) * (collapse > 0.5 && c === 'c1' && k > 0 ? 0.15 : 1)}
      />,
    );
    void yMid;
  });
  return <g>{lines}</g>;
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

// 1 · The question.
export function Question({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.2));
  return (
    <Svg label="Two questions about existence over customers and their orders" h={300}>
      <Left o={a} />
      <Right o={a} />
      <Bundles collapse={0} show={a} />
      <T x={300} y={30} s={14} f={C.latte} a="middle" o={a}>
        customers
      </T>
      <T x={465} y={30} s={14} f={C.latte} a="middle" o={a}>
        orders
      </T>
      <T x={300} y={290} s={15} f={C.caramel} a="middle" o={easeOut(seg(t, 1.8, 2.6))}>
        who has a match? who has none?
      </T>
    </Svg>
  );
}

// 2 · Semi-join.
export function SemiJoin({ t }: StepCtx) {
  const join = easeOut(seg(t, 0.4, 1.4));
  const semi = easeOut(seg(t, 2.2, 3.2));
  return (
    <Svg label="A join returns 4 rows; a semi-join returns the 2 customers that have a match, once each" h={320}>
      <Left mark={(c) => (semi > 0.5 && ORD[c] ? C.caramel : C.mocha)} />
      <Right />
      <Bundles collapse={semi} show={1} />
      <T x={300} y={296} s={16} f={C.crema} a="middle" o={join * (1 - semi)}>
        join: 4 rows, c1 three times
      </T>
      <T x={300} y={296} s={16} f={C.caramel} a="middle" w={700} o={semi}>
        semi-join: 2 rows, once each
      </T>
    </Svg>
  );
}

// 3 · Anti-join.
export function AntiJoin({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.6, 1.6));
  return (
    <Svg label="The anti-join keeps the 3 customers with no matching order" h={350}>
      <Left mark={(c) => (!ORD[c] && a > 0.5 ? C.caramel : C.mocha)} />
      <Right />
      <Bundles collapse={0} show={1} />
      <T x={300} y={332} s={16} f={C.caramel} a="middle" w={700} o={a}>
        anti-join: 3 rows, none with an order
      </T>
    </Svg>
  );
}

// 4 · Predict: EXISTS vs JOIN + DISTINCT. Each plan emits its rows as chips: EXISTS two customers, the join one
// chip per order (c1 three times). After the answer a dedup sweep crosses out the join's two repeats, the extra pass.
export function WorkPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const sweep = answered ? seg(s, 0.3, 1.4) : 0;
  const row = (y: number, label: string, steps: string[], hi: boolean) => (
    <g>
      <T x={25} y={y} s={14} f={hi ? C.caramel : C.latte} w={700}>
        {label}
      </T>
      {steps.map((st, i) => (
        <g key={st} opacity={easeOut(seg(t, 0.2 + i * 0.4, 0.6 + i * 0.4))}>
          <rect x={25 + i * 190} y={y + 14} width={170} height={40} rx={8} fill={C.cocoa} stroke={hi ? C.caramel : C.mocha} />
          <T x={110 + i * 190} y={y + 39} s={13} f={C.crema} a="middle">
            {st}
          </T>
        </g>
      ))}
    </g>
  );
  const chip = (x: number, y: number, label: string, k: number, key: string, bad = 0) =>
    k <= 0 ? null : (
      <g key={key} opacity={clamp(k) * (1 - 0.7 * bad)} transform={`translate(0 ${(1 - clamp(k)) * -14})`}>
        <rect x={x} y={y} width={40} height={24} rx={5} fill={C.roast} stroke={bad > 0 ? C.cherryText : C.mocha} />
        <T x={x + 20} y={y + 17} s={13} f={C.crema} a="middle">
          {label}
        </T>
        {bad > 0 && <line x1={x + 4} y1={y + 20} x2={x + 4 + 32 * bad} y2={y + 4} stroke={C.cherryText} strokeWidth={2} />}
      </g>
    );
  const J = ['c1', 'c1', 'c1', 'c3'];
  return (
    <Svg label="EXISTS is one step that yields two customers; a join yields one row per order, four, and then needs a dedup pass" h={300}>
      {row(30, 'EXISTS', ['semi-join'], answered)}
      {['c1', 'c3'].map((c, i) => chip(25 + i * 48, 100, c, easeOutBack(seg(t, 0.6 + i * 0.12, 0.9 + i * 0.12)), 'e' + i))}
      {row(150, 'JOIN + DISTINCT', ['join: one row per order', 'dedup pass'], false)}
      {J.map((c, i) => {
        const x = 25 + i * 48;
        const bad = i === 1 || i === 2 ? seg(sweep * 4, i, i + 1) : 0;
        return chip(x, 220, c, easeOutBack(seg(t, 0.8 + i * 0.12, 1.1 + i * 0.12)), 'j' + i, bad);
      })}
      {sweep > 0 && sweep < 1 && <line x1={25 + sweep * 190} y1={214} x2={25 + sweep * 190} y2={250} stroke={C.cherryText} strokeWidth={2} />}
      {!answered && (
        <T x={500} y={80} s={44} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      )}
      <T x={575} y={238} s={14} f={C.cherryText} a="end" o={answered ? easeOut(seg(s, 1.3, 1.7)) : 0}>
        dedup: pure overhead
      </T>
    </Svg>
  );
}

// 5 · Five spellings. The rows arrive; then NOT IN turns red as a gap drops in beside it, and the always-safe
// spellings are ticked one by one (the LEFT JOIN with its condition, in grey).
const SPELL = [
  { q: 'EXISTS', s: 'safe', n: 'a row exists or it does not' },
  { q: 'IN', s: 'safe', n: 'a dropped UNKNOWN changes nothing' },
  { q: 'NOT EXISTS', s: 'safe', n: 'same fact, negated' },
  { q: 'LEFT JOIN … IS NULL', s: 'safe*', n: '*test a never-NULL key' },
  { q: 'NOT IN', s: 'conditional', n: 'only if no NULL is possible' },
];
export function Spellings({ t }: StepCtx) {
  const red = easeOut(seg(t, 1.9, 2.4));
  return (
    <Svg label="Five existence spellings: EXISTS, IN and NOT EXISTS always safe, LEFT JOIN safe on a never-null key, NOT IN turns red because a NULL can change its answer" h={330}>
      {SPELL.map((r, i) => {
        const a = easeOutBack(seg(t, i * 0.32, i * 0.32 + 0.5));
        const y = 34 + i * 60;
        const bad = r.s === 'conditional';
        const tick = easeOut(seg(t, 2.5 + i * 0.3, 2.8 + i * 0.3));
        const col = bad ? (red > 0.5 ? C.cherryText : C.caramel) : C.caramel;
        return (
          <g key={r.q} opacity={clamp(a)} transform={`translate(${(1 - clamp(a)) * -16} 0)`}>
            <T x={25} y={y} s={15} f={col} w={700}>
              {r.q}
            </T>
            <T x={360} y={y} s={14} f={bad ? (red > 0.5 ? C.cherryText : C.latte) : C.crema} o={bad ? red : 1}>
              {r.s}
            </T>
            <T x={25} y={y + 24} s={13} f={C.latte}>
              {r.n}
            </T>
            {!bad && tick > 0 && <path d={`M 540 ${y - 6} l 6 6 l 12 -14`} fill="none" stroke={r.s === 'safe' ? C.caramel : C.latte} strokeWidth={2.5} opacity={tick} />}
            {bad && red > 0 && <rect x={532} y={y - 16 - (1 - red) * 20} width={36} height={22} rx={5} fill="none" stroke={C.cherryText} strokeDasharray="4 3" opacity={red} />}
          </g>
        );
      })}
    </Svg>
  );
}

function Gate({ t, certificate, label }: { t: number; certificate: boolean; label: string }) {
  const move = easeOut(seg(t, 0.6, 2.0));
  return (
    <g>
      <rect x={250} y={50} width={100} height={170} rx={10} fill={C.roast} stroke={C.taupe} />
      <T x={300} y={44} s={13} f={C.latte} a="middle">
        planner
      </T>
      <rect x={40 + move * 140} y={110} width={90} height={42} rx={8} fill={C.cocoa} stroke={C.caramel} strokeWidth={2} />
      <T x={85 + move * 140} y={136} s={14} f={C.crema} a="middle">
        {label}
      </T>
      {certificate && (
        <g opacity={easeOut(seg(t, 0.2, 0.8))}>
          <rect x={30} y={170} width={110} height={34} rx={6} fill="none" stroke={C.latte} strokeDasharray="5 4" />
          <T x={85} y={192} s={13} f={C.latte} a="middle">
            NOT NULL?
          </T>
        </g>
      )}
    </g>
  );
}

// 6 · EXISTS gate.
export function GateExists({ t }: StepCtx) {
  const out = easeOut(seg(t, 2.0, 2.8));
  return (
    <Svg label="EXISTS passes the planner gate with no certificate and becomes a semi-join" h={300}>
      <Gate t={t} certificate={false} label="EXISTS" />
      <rect x={430} y={110} width={140} height={42} rx={8} fill={C.cocoa} stroke={C.caramel} strokeWidth={2} opacity={out} />
      <T x={500} y={136} s={14} f={C.caramel} a="middle" o={out}>
        semi-join
      </T>
      <T x={300} y={268} s={14} f={C.latte} a="middle" o={easeOut(seg(t, 2.6, 3.2))}>
        no nullability check at all
      </T>
    </Svg>
  );
}

// 7 · NOT IN gate.
export function GateNotIn({ t }: StepCtx) {
  const ok = easeOut(seg(t, 2.0, 2.8));
  const bad = easeOut(seg(t, 3.2, 4.0));
  return (
    <Svg label="NOT IN must present a NOT NULL certificate to become an anti-join; otherwise it takes the subplan side path" h={340}>
      <Gate t={t} certificate label="NOT IN" />
      <rect x={430} y={80} width={140} height={42} rx={8} fill={C.cocoa} stroke={C.caramel} strokeWidth={2} opacity={ok} />
      <T x={500} y={106} s={14} f={C.caramel} a="middle" o={ok}>
        anti-join
      </T>
      <T x={500} y={142} s={13} f={C.latte} a="middle" o={ok}>
        with the proof: fast
      </T>
      <rect x={430} y={190} width={140} height={42} rx={8} fill="none" stroke={C.cherryText} strokeDasharray="5 4" opacity={bad} />
      <T x={500} y={216} s={14} f={C.cherryText} a="middle" o={bad}>
        SubPlan
      </T>
      <T x={500} y={252} s={13} f={C.latte} a="middle" o={bad}>
        without it:
      </T>
      <T x={500} y={270} s={13} f={C.latte} a="middle" o={bad}>
        correct, slower
      </T>
    </Svg>
  );
}

// 8 · Predict: schema decides. The NOT NULL badge is peeled off the column while its rows stay exactly the same.
// After the answer the Anti Join box drops to the side path and turns into a dashed SubPlan.
export function SchemaPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const peel = easeInOut(seg(t, 0.4, 1.2));
  const m = answered ? easeInOut(seg(s, 0.2, 1.0)) : 0;
  const by = lerp(52, 154, m);
  return (
    <Svg label="Dropping NOT NULL changes the plan from an anti-join to a SubPlan though the stored rows are unchanged" h={300}>
      <T x={25} y={40} s={14} f={C.latte}>
        today’s plan
      </T>
      <rect x={25} y={by} width={170} height={40} rx={8} fill={m > 0.5 ? 'none' : C.cocoa} stroke={m > 0.5 ? C.cherryText : C.caramel} strokeDasharray={m > 0.5 ? '5 4' : undefined} />
      {(m === 0 || m >= 1) && (
        <T x={110} y={by + 26} s={14} f={m >= 1 ? C.cherryText : C.crema} a="middle">
          {m >= 1 ? 'SubPlan' : 'Anti Join'}
        </T>
      )}
      <T x={25} y={142} s={14} f={C.latte}>
        tomorrow’s plan
      </T>
      {!answered && (
        <T x={110} y={210} s={44} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      )}
      <T x={350} y={40} s={14} f={C.latte}>
        customer_id
      </T>
      {['c1', 'c3', 'c4'].map((v, i) => (
        <g key={v}>
          <rect x={350} y={56 + i * 40} width={110} height={32} rx={6} fill={C.cocoa} stroke={C.mocha} />
          <T x={405} y={77 + i * 40} s={13} f={C.crema} a="middle">
            {v}
          </T>
        </g>
      ))}
      <g opacity={1 - peel} transform={`translate(${peel * 60} ${peel * -20})`}>
        <rect x={470} y={56} width={100} height={28} rx={14} fill="none" stroke={C.caramel} strokeWidth={1.6} />
        <T x={520} y={75} s={13} f={C.caramel} a="middle">
          NOT NULL
        </T>
      </g>
      <T x={405} y={200} s={13} f={C.latte} a="middle" o={easeOut(seg(t, 1.1, 1.4))}>
        same rows
      </T>
      <T x={25} y={260} s={15} f={C.crema} o={answered ? easeOut(seg(s, 1.0, 1.4)) : 0}>
        the planner reads the schema, not the data
      </T>
    </Svg>
  );
}

// 9 · EXPLAIN. Each plan line types out in turn; the fast-path lines get a white marker, the last line hangs
// indented under a NOT IN filter and is flagged red as the fallback.
export function ExplainRead({ t }: StepCtx) {
  const lines = [
    { s: 'Hash Semi Join', k: 'EXISTS / IN', c: C.caramel },
    { s: 'Hash Anti Join', k: 'NOT EXISTS, or proven NOT IN', c: C.caramel },
    { s: 'Hash Right Semi Join', k: 'new in PostgreSQL 18', c: C.latte },
    { s: 'Filter: NOT (hashed SubPlan 1)', k: 'NOT IN, no proof: the fallback', c: C.cherryText },
  ];
  return (
    <Svg label="EXPLAIN node labels for the fast paths and for the NOT IN fallback" h={300}>
      {lines.map((l, i) => {
        const a0 = 0.2 + i * 0.75;
        const typed = Math.floor(seg(t, a0, a0 + 0.45) * l.s.length);
        const sub = easeOut(seg(t, a0 + 0.4, a0 + 0.7));
        const y = 46 + i * 64;
        const x = i === 3 ? 60 : 40;
        if (t < a0) return null;
        return (
          <g key={l.s}>
            <rect x={25} y={y - 15} width={4} height={40} rx={2} fill={l.c} opacity={sub} />
            {i === 3 && <path d={`M 40 ${y - 30} L 40 ${y - 5} L 52 ${y - 5}`} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={sub} />}
            <T x={x} y={y} s={15} f={l.c} w={700}>
              {l.s.slice(0, typed)}
            </T>
            <T x={x} y={y + 22} s={13} f={C.latte} o={sub}>
              {l.k}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

// 10 · Verdict: each rule arrives with its fix underlined and checked off.
export function Verdict({ t }: StepCtx) {
  const rows = [
    ['existence questions', 'EXISTS / NOT EXISTS', 300],
    ['NOT IN', 'only with NOT NULL', 285],
    ['slow NOT IN', 'look for SubPlan', 250],
  ] as const;
  return (
    <Svg label="Three rules for existence questions" h={280}>
      {rows.map((r, i) => {
        const a = easeOut(seg(t, 0.1 + i * 0.6, 0.6 + i * 0.6));
        const u = easeInOut(seg(t, 0.5 + i * 0.6, 1.0 + i * 0.6));
        const y = 50 + i * 80;
        return (
          <g key={r[0]} opacity={clamp(a)} transform={`translate(${(1 - a) * -20} 0)`}>
            <T x={25} y={y} s={14} f={C.latte}>
              {r[0]}
            </T>
            <T x={25} y={y + 32} s={22} f={C.caramel} w={700}>
              {r[1]}
            </T>
            <rect x={25} y={y + 42} width={r[2] * u} height={3} rx={1.5} fill={C.caramel} />
            {u >= 1 && <path d={`M 540 ${y + 22} l 6 6 l 12 -14`} fill="none" stroke={C.caramel} strokeWidth={2.5} />}
          </g>
        );
      })}
    </Svg>
  );
}

// 11 · Prove it: spelling. Four spellings sit under a subquery column holding a gap. After the answer three are
// ticked and NOT IN turns red and drops to nothing.
export function ProveSpelling({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const k = answered ? easeOut(seg(s, 0.2, 0.8)) : 0;
  const names = ['EXISTS', 'IN', 'NOT EXISTS', 'NOT IN'];
  return (
    <Svg label="Which spelling returns nothing over a nullable subquery column: NOT IN" h={240}>
      <rect x={225} y={20} width={150} height={40} rx={8} fill="none" stroke={C.latte} strokeDasharray="5 4" opacity={0.6 + 0.4 * Math.sin(t * 3) ** 2} />
      <T x={300} y={46} s={13} f={C.latte} a="middle">
        a gap in the list
      </T>
      {names.map((n, i) => {
        const bad = i === 3;
        const x = 25 + i * 140;
        const a = easeOutBack(seg(t, 0.2 + i * 0.12, 0.5 + i * 0.12));
        return (
          <g key={n} opacity={clamp(a)} transform={`translate(0 ${bad ? k * 30 : 0})`}>
            <rect x={x} y={100} width={125} height={40} rx={8} fill={C.cocoa} stroke={bad && k > 0 ? C.cherryText : C.mocha} strokeWidth={bad && k > 0 ? 2 : 1} />
            <T x={x + 62} y={125} s={14} f={bad && k > 0 ? C.cherryText : C.crema} a="middle">
              {n}
            </T>
            {!bad && k > 0 && <path d={`M ${x + 56} ${160} l 5 5 l 10 -12`} fill="none" stroke={C.caramel} strokeWidth={2.5} opacity={k} />}
          </g>
        );
      })}
      {!answered && (
        <T x={300} y={212} s={36} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      )}
      <T x={300} y={222} s={15} f={C.cherryText} a="middle" o={answered ? easeOut(seg(s, 0.8, 1.2)) : 0}>
        NOT IN: the chain goes UNKNOWN
      </T>
    </Svg>
  );
}

// 12 · Prove it: once. c1 has three lines to its three orders. After the answer the three lines fold into one and
// a single c1 row lands in the result.
export function ProveOnce({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const fold = answered ? easeInOut(seg(s, 0.2, 0.9)) : 0;
  const land = answered ? easeOutBack(seg(s, 0.9, 1.4)) : 0;
  return (
    <Svg label="A customer with three matching orders appears once in a semi-join" h={240}>
      <rect x={60} y={80} width={70} height={36} rx={8} fill={C.cocoa} stroke={C.caramel} strokeWidth={2} />
      <T x={95} y={104} s={14} f={C.crema} a="middle">
        c1
      </T>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <line x1={130} y1={98} x2={300} y2={lerp(56 + i * 42, 98, fold)} stroke={C.taupe} strokeWidth={2} opacity={i === 1 ? 1 : 1 - 0.8 * fold} />
          <rect x={300} y={42 + i * 42} width={56} height={28} rx={6} fill={C.roast} stroke={C.mocha} opacity={1 - 0.6 * fold} />
          <T x={328} y={61 + i * 42} s={13} f={C.latte} a="middle" o={1 - 0.6 * fold}>
            {`o${i + 1}`}
          </T>
        </g>
      ))}
      {answered ? (
        <g opacity={clamp(land)} transform={`translate(0 ${(1 - clamp(land)) * -20})`}>
          <rect x={430} y={80} width={70} height={36} rx={8} fill={C.cocoa} stroke={C.caramel} strokeWidth={2} />
          <T x={465} y={104} s={14} f={C.crema} a="middle">
            c1
          </T>
          <T x={465} y={150} s={18} f={C.caramel} a="middle" w={700}>
            1 row
          </T>
        </g>
      ) : (
        <T x={465} y={112} s={40} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      )}
    </Svg>
  );
}
