import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar: plan trees root at the top; caramel = the rewritten (cheaper) form, cherryText = the operator being removed
// or the costly dependent form, crema = data, latte = labels, taupe = structure.

function Node({
  x,
  y,
  label,
  w = 130,
  hi = false,
  bad = false,
  dashed = false,
  o = 1,
}: {
  x: number;
  y: number;
  label: string;
  w?: number;
  hi?: boolean;
  bad?: boolean;
  dashed?: boolean;
  o?: number;
}) {
  return (
    <g opacity={o}>
      <rect
        x={x - w / 2}
        y={y - 18}
        width={w}
        height={36}
        rx={8}
        fill={dashed ? 'none' : C.cocoa}
        stroke={bad ? C.cherryText : hi ? C.caramel : C.mocha}
        strokeWidth={hi || bad ? 2 : 1}
        strokeDasharray={dashed ? '5 4' : undefined}
      />
      <T x={x} y={y + 5} s={13} f={bad ? C.cherryText : C.crema} a="middle">
        {label}
      </T>
    </g>
  );
}
const Edge = ({ a, b, o = 1 }: { a: [number, number]; b: [number, number]; o?: number }) => <line x1={a[0]} y1={a[1] + 18} x2={b[0]} y2={b[1] - 18} stroke={C.taupe} strokeWidth={2} opacity={o} />;

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

// 1 · Before costs: a small plan travels from bind into rewrite, which ticks it by proof; only after that does the planner's box grow cost bars.
export function BeforeCosts({ t }: StepCtx) {
  const n = [0, 1, 2].map((i) => easeOut(seg(t, 0.1 + i * 0.2, 0.4 + i * 0.2)));
  const go1 = easeInOut(seg(t, 0.8, 1.5));
  const tick = easeOut(seg(t, 1.5, 1.9));
  const go2 = easeInOut(seg(t, 1.9, 2.4));
  const bars = easeOut(seg(t, 2.4, 2.8));
  const tx = go2 > 0 ? lerp(300, 490, go2) : lerp(110, 300, go1);
  return (
    <Svg label="Rewrites happen before the planner costs anything: they rely on proofs, not numbers" h={240}>
      <Node x={110} y={80} label="parse + bind" w={150} o={n[0]} />
      <Node x={300} y={80} label="rewrite" w={130} hi o={n[1]} />
      <Node x={490} y={80} label="plan + cost" w={150} o={n[2]} />
      {t > 0.8 && (
        <g transform={`translate(${tx - 12} 108)`}>
          <line x1={12} y1={0} x2={4} y2={12} stroke={C.caramel} strokeWidth={1.5} />
          <line x1={12} y1={0} x2={20} y2={12} stroke={C.caramel} strokeWidth={1.5} />
          <circle cx={12} cy={0} r={3.5} fill={C.caramel} />
          <circle cx={4} cy={13} r={3} fill={C.crema} />
          <circle cx={20} cy={13} r={3} fill={C.crema} />
        </g>
      )}
      <path d="M318 40 l6 6 l12 -14" fill="none" stroke={C.caramel} strokeWidth={2.5} strokeDasharray="30" strokeDashoffset={30 * (1 - tick)} />
      <T x={300} y={50} s={13} f={C.caramel} a="end" o={tick}>
        proofs, no numbers
      </T>
      {[0, 1, 2].map((i) => (
        <rect key={i} x={440 + i * 36} y={146 - [18, 30, 12][i] * bars} width={24} height={[18, 30, 12][i] * bars} rx={3} fill={C.latte} opacity={0.7} />
      ))}
      <T x={300} y={186} s={14} f={C.latte} a="middle" o={easeOut(seg(t, 2.8, 3.3))}>
        one legal plan becomes a cheaper, equally legal one
      </T>
    </Svg>
  );
}

// 2 · Safe three: a filter slides below the join, unused columns drop away, and 2 + 3 folds to 5, each beside its name.
export function Safe({ t }: StepCtx) {
  const items = [
    ['predicate pushdown', 'filter early'],
    ['projection pushdown', 'drop columns early'],
    ['constant folding', '2 + 3  →  5, once'],
  ];
  return (
    <Svg label="Predicate pushdown filters early, projection pushdown drops columns early, constant folding evaluates 2 + 3 once" h={260}>
      {items.map((it, i) => {
        const y = 30 + i * 76;
        const k = easeOut(seg(t, i * 1.2, i * 1.2 + 0.4));
        const g = easeInOut(seg(t, i * 1.2 + 0.4, i * 1.2 + 1.1));
        return (
          <g key={it[0]} opacity={k}>
            <T x={25} y={y + 20} s={18} f={C.caramel} w={700}>
              {it[0]}
            </T>
            <T x={25} y={y + 46} s={14} f={C.latte}>
              {it[1]}
            </T>
            {i === 0 && (
              <>
                <rect x={400} y={y} width={70} height={24} rx={5} fill={C.cocoa} stroke={C.mocha} />
                <T x={435} y={y + 17} s={13} f={C.crema} a="middle">
                  join
                </T>
                <line x1={435} y1={y + 24} x2={435} y2={y + 36} stroke={C.taupe} />
                <rect x={400} y={y + 36} width={70} height={24} rx={5} fill={C.cocoa} stroke={C.mocha} />
                <T x={435} y={y + 53} s={13} f={C.crema} a="middle">
                  scan
                </T>
                <rect x={490} y={lerp(y, y + 36, g)} width={36} height={24} rx={5} fill={C.roast} stroke={C.caramel} />
                <T x={508} y={lerp(y, y + 36, g) + 17} s={13} f={C.caramel} a="middle">
                  σ
                </T>
              </>
            )}
            {i === 1 &&
              Array.from({ length: 6 }, (_, j) => {
                const keep = j === 1 || j === 4;
                const h = keep ? 44 : 44 * (1 - g);
                return <rect key={j} x={400 + j * 24} y={y + 50 - h} width={16} height={h} rx={3} fill={keep && g > 0.5 ? C.caramel : C.latte} opacity={keep ? 1 : 0.6} />;
              })}
            {i === 2 && (
              <>
                {g < 0.5 && (
                  <T x={440} y={y + 30} s={18} f={C.crema} a="middle" o={1 - g * 2}>
                    2 + 3
                  </T>
                )}
                {g >= 0.5 && (
                  <T x={440} y={y + 30} s={22} f={C.caramel} a="middle" w={700} o={(g - 0.5) * 2}>
                    5
                  </T>
                )}
              </>
            )}
          </g>
        );
      })}
    </Svg>
  );
}

// 3 · Eliminate: the two conditions tick; the join and its customers branch fade out, and Scan orders rises to take the root.
export function Eliminate({ t }: StepCtx) {
  const c1 = easeOut(seg(t, 0.4, 0.8));
  const c2 = easeOut(seg(t, 1.0, 1.4));
  const fade = easeInOut(seg(t, 1.8, 2.5));
  const rise = easeInOut(seg(t, 2.6, 3.3));
  return (
    <Svg label="A LEFT JOIN that can match at most one row and whose inner columns are unused is deleted with its scan; only Scan orders remains" h={300}>
      <Node x={300} y={50} label="Left Join" hi={fade < 0.3} bad={fade >= 0.3} dashed={fade >= 0.6} o={1 - fade} />
      <Node x={lerp(180, 300, rise)} y={lerp(150, 50, rise)} label="Scan orders" hi />
      <Node x={420} y={150} label="Scan customers" bad={fade > 0} dashed={fade >= 0.6} o={1 - fade} />
      <Edge a={[300, 50]} b={[180, 150]} o={1 - fade} />
      <Edge a={[300, 50]} b={[420, 150]} o={1 - fade} />
      {[
        ['≤ 1 inner match (key)', c1],
        ['no inner column used', c2],
      ].map(([l, k], i) => (
        <g key={l as string} opacity={k as number}>
          <path d={`M25 ${206 + i * 28} l5 5 l10 -12`} fill="none" stroke={C.caramel} strokeWidth={2.5} />
          <T x={46} y={210 + i * 28} s={13} f={C.crema}>
            {l as string}
          </T>
        </g>
      ))}
      <T x={300} y={284} s={15} f={C.caramel} a="middle" o={easeOut(seg(t, 3.3, 3.8))}>
        left: just Scan orders
      </T>
    </Svg>
  );
}

// 4 · Predict: two empty checkboxes pulse beside the tree. After the answer, both tick and the join and the customers scan fade away.
export function EliminatePredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const tick = (i: number) => (answered ? easeOut(seg(s, 0.1 + i * 0.3, 0.4 + i * 0.3)) : 0);
  const fade = answered ? easeInOut(seg(s, 0.8, 1.4)) : 0;
  return (
    <Svg label="An unused LEFT JOIN on a primary key: only the orders scan remains" h={280}>
      <Node x={300} y={50} label="Left Join" o={1 - fade} />
      <Node x={180} y={140} label="Scan orders" hi={answered} />
      <Node x={420} y={140} label="Scan customers" bad={answered} o={1 - fade} />
      <Edge a={[300, 50]} b={[180, 140]} o={1 - fade} />
      <Edge a={[300, 50]} b={[420, 140]} o={1 - fade} />
      {['key: ≤ 1 match', 'no customer column'].map((l, i) => (
        <g key={l}>
          <rect x={25} y={190 + i * 28} width={14} height={14} rx={3} fill="none" stroke={answered ? C.caramel : C.latte} opacity={answered ? 1 : 0.6 + 0.4 * Math.sin(t * 4 + i)} />
          <path d={`M27 ${197 + i * 28} l4 4 l8 -10`} fill="none" stroke={C.caramel} strokeWidth={2} strokeDasharray="20" strokeDashoffset={20 * (1 - tick(i))} />
          <T x={48} y={202 + i * 28} s={13} f={C.crema}>
            {l}
          </T>
        </g>
      ))}
      {!answered ? (
        <T x={420} y={235} s={44} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      ) : (
        <T x={575} y={268} s={16} f={C.caramel} a="end" w={700} o={easeOut(seg(s, 1.3, 1.7))}>
          only Scan orders remains
        </T>
      )}
    </Svg>
  );
}

// 5 · Strength reduction: a strict filter sweeps the left join's rows and strikes the null-extended one; the join then becomes inner.
export function Strength({ t }: StepCtx) {
  const rows = [
    ['a1', 'b1'],
    ['a2', 'b2'],
    ['a3', 'NULL'],
  ];
  const f = easeOut(seg(t, 0.4, 0.8));
  const sweep = seg(t, 0.9, 1.8);
  const strike = easeOut(seg(t, 1.7, 2.1));
  const a = easeOut(seg(t, 2.4, 3.0));
  return (
    <Svg label="A strict WHERE on the right side rejects every null-extended row, so the LEFT JOIN becomes an inner join" h={260}>
      <Node x={150} y={44} label="Left Join" bad={a > 0.5} />
      {rows.map((r, i) => (
        <g key={r[0]}>
          <rect x={85} y={84 + i * 30} width={60} height={24} rx={5} fill={C.cocoa} stroke={C.mocha} />
          <T x={115} y={101 + i * 30} s={13} f={C.crema} a="middle">
            {r[0]}
          </T>
          <rect x={155} y={84 + i * 30} width={60} height={24} rx={5} fill={i === 2 ? 'none' : C.cocoa} stroke={i === 2 ? C.latte : C.mocha} strokeDasharray={i === 2 ? '4 3' : undefined} />
          <T x={185} y={101 + i * 30} s={13} f={i === 2 ? C.latte : C.crema} a="middle">
            {r[1]}
          </T>
        </g>
      ))}
      <T x={230} y={161} s={13} f={C.latte}>
        null-extended
      </T>
      {sweep > 0 && sweep < 1 && <line x1={78} y1={80 + sweep * 92} x2={222} y2={80 + sweep * 92} stroke={C.cherryText} strokeWidth={2} />}
      <line x1={80} y1={156} x2={80 + 140 * strike} y2={156} stroke={C.cherryText} strokeWidth={2.5} opacity={strike > 0 ? 1 : 0} />
      <T x={300} y={210} s={14} f={C.cherryText} a="middle" o={f}>
        WHERE b.y = 42 rejects every null-extended row
      </T>
      <T x={330} y={50} s={20} f={C.caramel} a="middle" o={a}>
        →
      </T>
      <Node x={450} y={44} label="Inner Join" hi w={150} o={a} />
      <T x={450} y={90} s={13} f={C.latte} a="middle" o={easeOut(seg(t, 3.2, 3.7))}>
        freely reorderable
      </T>
    </Svg>
  );
}

// 6 · To anti: both spellings draw an arrow into one Anti Join; then only unmatched rows flow through it.
export function ToAnti({ t }: StepCtx) {
  const l1 = easeInOut(seg(t, 0.6, 1.3));
  const l2 = easeInOut(seg(t, 1.3, 2.0));
  const a = easeOutBack(seg(t, 1.9, 2.3));
  return (
    <Svg label="LEFT JOIN with IS NULL on the right becomes an Anti join, the same operator as NOT EXISTS" h={260}>
      <Node x={150} y={70} label="Left Join + IS NULL" w={190} />
      <Node x={150} y={170} label="NOT EXISTS" w={150} />
      <g opacity={clamp(a)}>
        <Node x={450} y={120} label="Anti Join" hi w={150} />
      </g>
      <line x1={245} y1={78} x2={lerp(245, 375, l1)} y2={lerp(78, 112, l1)} stroke={C.caramel} strokeWidth={2} opacity={l1 > 0 ? 1 : 0} />
      <line x1={225} y1={170} x2={lerp(225, 375, l2)} y2={lerp(170, 128, l2)} stroke={C.caramel} strokeWidth={2} opacity={l2 > 0 ? 1 : 0} />
      {[0, 1, 2].map((i) => {
        const p = seg(t, 2.4 + i * 0.3, 2.9 + i * 0.3);
        return p > 0 && p < 1 ? <circle key={i} cx={lerp(525, 575, p)} cy={120} r={5} fill={C.crema} /> : null;
      })}
      <T x={300} y={236} s={14} f={C.latte} a="middle" o={easeOut(seg(t, 3.3, 3.8))}>
        two spellings, one operator
      </T>
    </Svg>
  );
}

// 7 · Predict: the SQL. After the answer, an Anti chip pops in and is underlined.
export function AntiPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const k = answered ? easeOutBack(seg(s, 0.1, 0.5)) : 0;
  const bar = answered ? easeOut(seg(s, 0.5, 0.9)) : 0;
  return (
    <Svg label="LEFT JOIN with IS NULL on a right column shows as an Anti join" h={240}>
      <T x={25} y={70} s={15} f={C.crema}>
        a LEFT JOIN b ON a.x = b.y
      </T>
      <T x={25} y={100} s={15} f={C.crema}>
        WHERE b.z IS NULL
      </T>
      {!answered ? (
        <T x={430} y={96} s={44} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      ) : (
        <>
          <g opacity={clamp(k)} transform={`translate(430 92) scale(${0.6 + 0.4 * clamp(k)}) translate(-430 -92)`}>
            <rect x={370} y={70} width={120} height={40} rx={8} fill={C.cocoa} stroke={C.caramel} strokeWidth={2} />
            <T x={430} y={98} s={22} f={C.caramel} a="middle" w={700}>
              Anti
            </T>
          </g>
          <rect x={370} y={120} width={120 * bar} height={3} fill={C.caramel} />
        </>
      )}
    </Svg>
  );
}

// 8 · Dependent join: each outer row lights in turn and its own copy of the inner subquery runs again from empty, linked to it.
export function Dependent({ t }: StepCtx) {
  return (
    <Svg label="A dependent join evaluates the inner query once for each outer row: 1,000 outer rows, 1,000 evaluations" h={300}>
      <T x={25} y={34} s={13} f={C.latte}>
        outer rows
      </T>
      <T x={25} y={110} s={13} f={C.latte}>
        inner subquery, rerun each time
      </T>
      {Array.from({ length: 8 }, (_, i) => {
        const on = seg(t, 0.3 + i * 0.42, 0.45 + i * 0.42);
        const run = seg(t, 0.4 + i * 0.42, 0.75 + i * 0.42);
        return (
          <g key={i}>
            <rect x={25 + i * 40} y={46} width={32} height={26} rx={5} fill={on > 0 ? C.cherry : C.cocoa} stroke={C.mocha} />
            <line x1={41 + i * 40} y1={72} x2={41 + i * 40} y2={lerp(72, 122, run)} stroke={C.cinnamon} strokeWidth={1.5} opacity={run > 0 ? 1 : 0} />
            <rect x={25 + i * 40} y={122} width={32} height={26} rx={5} fill="none" stroke={C.mocha} />
            <rect x={25 + i * 40} y={122} width={32 * run} height={26} rx={5} fill={C.cinnamon} />
          </g>
        );
      })}
      <T x={25} y={190} s={16} f={C.cherryText} w={700} o={easeOut(seg(t, 3.6, 4.1))}>
        1,000 outer rows → 1,000 evaluations
      </T>
    </Svg>
  );
}

// 9 · Pull up: the correlated predicate slides out of the dependent EXISTS and attaches under a plain semi-join.
export function PullUp({ t }: StepCtx) {
  const lab = easeOut(seg(t, 0.4, 0.8));
  const mv = easeInOut(seg(t, 0.8, 1.8));
  const semi = easeOutBack(seg(t, 1.6, 2.0));
  return (
    <Svg label="Pulling the dependent predicate up turns the dependent EXISTS into a semi-join: one pass instead of 1,000 evaluations" h={260}>
      <Node x={150} y={70} label="Dependent EXISTS" w={170} bad={mv < 0.6} o={1 - 0.5 * mv} />
      <g opacity={clamp(semi)}>
        <Node x={450} y={70} label="Semi-join" hi w={150} />
      </g>
      <line x1={235} y1={70} x2={lerp(235, 375, mv)} y2={70} stroke={C.caramel} strokeWidth={3} opacity={mv > 0 ? 1 : 0} />
      <T x={300} y={44} s={13} f={C.caramel} a="middle" o={lab}>
        pull the predicate up
      </T>
      <g transform={`translate(${lerp(0, 300, mv)} ${30 * Math.sin(Math.PI * mv)})`}>
        <rect x={80} y={104} width={140} height={28} rx={6} fill={C.roast} stroke={C.caramel} />
        <T x={150} y={123} s={13} f={C.caramel} a="middle">
          o.cid = c.cid
        </T>
      </g>
      <T x={300} y={200} s={16} f={C.caramel} a="middle" w={700} o={easeOut(seg(t, 2.6, 3.2))}>
        one pass instead of 1,000 evaluations
      </T>
    </Svg>
  );
}

// 10 · Push down: a dependency marker descends past each operator; the levels it passes dim, and at the bottom it turns into a regular join.
export function PushDown({ t }: StepCtx) {
  const levels = ['top', 'through a join', 'through a group-by', 'through an outer join'];
  let p = 0;
  for (let j = 1; j < 4; j++) p += easeInOut(seg(t, 0.4 + (j - 1) * 0.9, 0.9 + (j - 1) * 0.9));
  const k = Math.round(p);
  const done = easeOut(seg(t, 3.2, 3.6));
  return (
    <Svg label="The dependent join is pushed down through a join, a group-by and an outer join until it becomes a regular join" h={300}>
      {levels.map((l, i) => (
        <g key={l}>
          <Node x={250} y={50 + i * 66} label={l} w={200} hi={i === k} bad={i < k} dashed={i < k} />
          {i < 3 && <Edge a={[250, 50 + i * 66]} b={[250, 50 + (i + 1) * 66]} />}
        </g>
      ))}
      <circle cx={380} cy={50 + p * 66} r={10} fill={done > 0 ? C.caramel : C.cherry} />
      <T x={400} y={55 + p * 66} s={13} f={done > 0 ? C.caramel : C.cherryText}>
        {done > 0 ? 'regular join' : 'dependent'}
      </T>
      <T x={300} y={288} s={13} f={C.latte} a="middle" o={easeOut(seg(t, 3.5, 4.0))}>
        until the values it needs are already local
      </T>
    </Svg>
  );
}

// 11 · Verdict: three habits, each underlined and ticked.
export function Verdict({ t }: StepCtx) {
  const rows = [
    ['redundant join', 'trust the planner first'],
    ['equivalent spellings', 'choose for readability'],
    ['SubPlan that stays', 'a shape the heuristics miss'],
  ];
  return (
    <Svg label="Three habits about rewrites: trust the planner with redundant joins, choose equivalent spellings for readability, a SubPlan that stays is a shape the heuristics miss" h={280}>
      {rows.map((r, i) => {
        const k = easeOut(seg(t, i * 0.9, i * 0.9 + 0.5));
        const bar = easeInOut(seg(t, i * 0.9 + 0.3, i * 0.9 + 0.9));
        const tick = easeOut(seg(t, i * 0.9 + 0.8, i * 0.9 + 1.1));
        return (
          <g key={r[0]} opacity={k}>
            <T x={25} y={50 + i * 80} s={14} f={C.latte}>
              {r[0]}
            </T>
            <T x={25} y={82 + i * 80} s={20} f={C.caramel} w={700}>
              {r[1]}
            </T>
            <rect x={25} y={92 + i * 80} width={360 * bar} height={3} fill={C.caramel} />
            <path d={`M540 ${70 + i * 80} l8 8 l16 -18`} fill="none" stroke={C.caramel} strokeWidth={3} strokeDasharray="40" strokeDashoffset={40 * (1 - tick)} />
          </g>
        );
      })}
    </Svg>
  );
}

export function ProveRemove({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  return (
    <Svg label="A LEFT JOIN can be deleted when it has at most one inner match and no inner column is used" h={240}>
      <T x={40} y={90} s={16} f={C.latte}>
        LEFT JOIN deletable if…
      </T>
      {answered ? (
        ['≤ 1 inner match', 'no inner column used'].map((l, i) => {
          const k = easeOut(seg(s, 0.1 + i * 0.35, 0.4 + i * 0.35));
          return (
            <g key={l} opacity={k}>
              <path d={`M40 ${122 + i * 30} l5 5 l10 -12`} fill="none" stroke={C.caramel} strokeWidth={2.5} />
              <T x={62} y={130 + i * 30} s={15} f={C.caramel}>
                {l}
              </T>
            </g>
          );
        })
      ) : (
        <T x={400} y={120} s={40} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      )}
    </Svg>
  );
}
export function ProveDependent({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const k = answered ? easeOut(seg(s, 0.1, 0.5)) : 0;
  const loop = answered ? easeInOut(seg(s, 0.5, 1.1)) : 0;
  return (
    <Svg label="A subquery that needs the outer row is a dependent join" h={240}>
      <T x={40} y={84} s={18} f={C.latte}>
        needs the outer row →
      </T>
      {answered ? (
        <>
          <T x={40} y={lerp(150, 136, k)} s={24} f={C.caramel} w={700} o={k}>
            dependent join
          </T>
          <path d="M400 150 a24 24 0 1 1 -1 0" fill="none" stroke={C.cinnamon} strokeWidth={2.5} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - loop} />
        </>
      ) : (
        <T x={40} y={150} s={40} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      )}
    </Svg>
  );
}
