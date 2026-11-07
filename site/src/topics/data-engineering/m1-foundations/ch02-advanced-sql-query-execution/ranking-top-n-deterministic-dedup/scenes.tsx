import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar: caramel = the chosen / kept row, cherryText = the ambiguous or lost row, crema = data, latte = labels.
// Scores 90, 80, 80, 70 (the two 80s tie).

const SC = [90, 80, 80, 70];
const RN = [1, 2, 3, 4];
const RK = [1, 2, 2, 4];
const DR = [1, 2, 2, 3];

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

// 1 · Podium: the four score bars grow, the two 80s tie and outline red, and they jostle for second.
export function Podium({ t }: StepCtx) {
  const tie = easeOut(seg(t, 1.5, 1.9));
  const jostle = t > 2.2 && t < 3.1 ? Math.sin((t - 2.2) * 18) * 3 : 0;
  return (
    <Svg label="Four scores, 90, 80, 80 and 70; the two 80s tie, so who is second is a decision, not a fact" h={260}>
      {SC.map((s, i) => {
        const g = easeOut(seg(t, 0.1 + i * 0.25, 0.8 + i * 0.25));
        const tied = i === 1 || i === 2;
        return (
          <g key={i} opacity={clamp(g * 3)} transform={`translate(${tied ? (i === 1 ? jostle : -jostle) : 0} 0)`}>
            <rect x={25} y={40 + i * 46} width={(90 + s) * g} height={30} rx={7} fill={C.cocoa} stroke={tied && tie > 0 ? C.cherryText : C.mocha} strokeWidth={tied && tie > 0 ? 2 : 1} />
            <T x={35} y={60 + i * 46} s={14} f={C.crema}>
              {`score ${s}`}
            </T>
          </g>
        );
      })}
      <T x={330} y={118} s={15} f={C.cherryText} o={easeOut(seg(t, 1.8, 2.3))}>
        tied: who is second?
      </T>
    </Svg>
  );
}

// 2 · Three numberings: the columns fill one at a time; RANK leaves out 3 (marked), DENSE_RANK does not.
export function ThreeNumberings({ t }: StepCtx) {
  const cols = [
    ['ROW_NUMBER', RN],
    ['RANK', RK],
    ['DENSE_RANK', DR],
  ] as const;
  return (
    <Svg label="ROW_NUMBER gives 1, 2, 3, 4; RANK gives 1, 2, 2, 4 and skips 3; DENSE_RANK gives 1, 2, 2, 3 with no gap" h={300}>
      <T x={25} y={34} s={13} f={C.latte}>
        score
      </T>
      {SC.map((s, i) => (
        <T key={i} x={25} y={78 + i * 46} s={16} f={C.crema}>
          {String(s)}
        </T>
      ))}
      {cols.map(([name, vals], c) => {
        const t0 = 0.3 + c * 1.3;
        return (
          <g key={name} opacity={easeOut(seg(t, t0, t0 + 0.3))}>
            <T x={130 + c * 150} y={34} s={13} f={C.caramel} w={700}>
              {name}
            </T>
            {vals.map((v, i) => {
              const k = easeOutBack(seg(t, t0 + 0.2 + i * 0.18, t0 + 0.45 + i * 0.18));
              return (
                <g key={i} opacity={clamp(k)}>
                  <rect x={130 + c * 150} y={52 + i * 46} width={50} height={34} rx={8} fill={C.cocoa} stroke={i === 1 || i === 2 ? C.cherryText : C.mocha} />
                  <T x={155 + c * 150} y={76 + i * 46} s={16} f={C.crema} a="middle">
                    {String(v)}
                  </T>
                </g>
              );
            })}
          </g>
        );
      })}
      <T x={340} y={214} s={13} f={C.cherryText} o={easeOut(seg(t, 2.4, 2.8))}>
        no 3
      </T>
      <path d="M332 130 C 350 160 350 180 332 206" fill="none" stroke={C.cherryText} strokeWidth={1.5} strokeDasharray="4 4" opacity={easeOut(seg(t, 2.3, 2.7))} />
    </Svg>
  );
}

// 3 · Predict: three tied customers and the next one. After the answer, the tied three get 1 and the count runs past them to 4.
export function GapPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  return (
    <Svg label="Three rows tie for first; the next row gets rank 4 and dense rank 2" h={280}>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={25} y={40 + i * 40} width={170} height={30} rx={7} fill={C.cocoa} stroke={C.caramel} />
          <T x={110} y={60 + i * 40} s={13} f={C.crema} a="middle">
            tied for first
          </T>
          {answered && (
            <T x={215} y={61 + i * 40} s={15} f={C.caramel} w={700} o={easeOut(seg(s, 0.2 + i * 0.2, 0.4 + i * 0.2))}>
              1
            </T>
          )}
        </g>
      ))}
      <rect x={25} y={170} width={170} height={30} rx={7} fill={C.cocoa} stroke={answered ? C.caramel : C.mocha} />
      <T x={110} y={190} s={13} f={C.crema} a="middle">
        next customer
      </T>
      {!answered ? (
        <T x={330} y={196} s={44} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      ) : (
        <>
          <path d="M240 56 C 270 100 270 150 240 186" fill="none" stroke={C.latte} strokeWidth={1.5} strokeDasharray="1" pathLength={1} strokeDashoffset={1 - easeInOut(seg(s, 0.8, 1.3))} />
          <T x={25} y={244} s={20} f={C.caramel} w={700} o={easeOut(seg(s, 1.3, 1.7))}>
            rank 4 · dense_rank 2
          </T>
        </>
      )}
    </Svg>
  );
}

// 4 · Arbitrary: the scan order flips and the two tied rows trade places under the fixed numbers 2 and 3.
export function Arbitrary({ t }: StepCtx) {
  const p = easeInOut(seg(t, 1.4, 2.0));
  const moving = p > 0 && p < 1;
  const yA = lerp(50, 100, p);
  const yB = lerp(100, 50, p);
  const dx = 200 * Math.sin(Math.PI * p);
  const box = (y: number, x: number, label: string) => (
    <g>
      <rect x={70 + x} y={y} width={180} height={34} rx={8} fill={C.cocoa} stroke={moving ? C.cherryText : C.mocha} />
      {!moving && (
        <T x={160 + x} y={y + 22} s={14} f={C.crema} a="middle">
          {label}
        </T>
      )}
    </g>
  );
  return (
    <Svg label="Between runs, the two tied rows can swap their ROW_NUMBER, because the scan order decides" h={260}>
      <T x={300} y={30} s={13} f={C.latte}>
        {p < 0.5 ? 'scan order: A, B' : 'scan order: B, A'}
      </T>
      <T x={30} y={72} s={20} f={C.cherryText} w={700}>
        2
      </T>
      <T x={30} y={122} s={20} f={C.cherryText} w={700}>
        3
      </T>
      {box(yA, dx, 'order A · score 80')}
      {box(yB, 0, 'order B · score 80')}
      <T x={300} y={200} s={14} f={C.latte} a="middle" o={easeOut(seg(t, 2.4, 2.9))}>
        nothing in SQL says which gets which
      </T>
    </Svg>
  );
}

// 5 · Predict: two runs. After the answer, run 2's tied pair swaps and a red not-equal sign appears between the runs.
export function RunTwice({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const p = answered ? easeInOut(seg(s, 0.2, 0.8)) : 0;
  const moving = p > 0 && p < 1;
  const labels = ['A:2', 'B:3'];
  const swapped = ['B:2', 'A:3'];
  return (
    <Svg label="Two runs of the same query on unchanged data; the tied rows can swap, so there is no guarantee they match" h={260}>
      <T x={25} y={48} s={14} f={C.latte}>
        run 1
      </T>
      <T x={25} y={114} s={14} f={C.latte}>
        run 2
      </T>
      {[0, 1].map((k) => (
        <g key={'r1' + k}>
          <rect x={90 + k * 120} y={26} width={100} height={34} rx={8} fill={C.cocoa} stroke={C.mocha} />
          <T x={140 + k * 120} y={48} s={14} f={C.crema} a="middle">
            {labels[k]}
          </T>
        </g>
      ))}
      {[0, 1].map((k) => {
        const x = lerp(90 + k * 120, 90 + (1 - k) * 120, p);
        const y = 92 - 18 * Math.sin(Math.PI * p) * (k === 0 ? 1 : -1);
        return (
          <g key={'r2' + k}>
            <rect x={x} y={y} width={100} height={34} rx={8} fill={C.cocoa} stroke={answered ? C.cherryText : C.mocha} />
            {!moving && (
              <T x={x + 50} y={y + 22} s={14} f={C.crema} a="middle">
                {p >= 1 ? swapped[1 - k] : labels[k]}
              </T>
            )}
          </g>
        );
      })}
      {!answered ? (
        <T x={450} y={100} s={44} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      ) : (
        <>
          <T x={380} y={88} s={32} f={C.cherryText} w={700} o={easeOut(seg(s, 0.8, 1.1))}>
            ≠
          </T>
          <T x={300} y={200} s={16} f={C.cherryText} a="middle" o={easeOut(seg(s, 1.0, 1.4))}>
            no guarantee they match
          </T>
        </>
      )}
    </Svg>
  );
}

// 6 · Tie-breaker: order_id types onto the ORDER BY, the outlines turn caramel, and three runs come out identical, each ticked.
export function TieBreaker({ t }: StepCtx) {
  const word = 'order_id';
  const n = Math.round(word.length * seg(t, 0.4, 1.0));
  const fixed = t > 1.1;
  return (
    <Svg label="A unique tie-breaker makes the numbering reproducible: A gets 2 and B gets 3 on every run" h={260}>
      <T x={25} y={44} s={15} f={C.latte}>
        ORDER BY score DESC,
      </T>
      <T x={25} y={72} s={15} f={C.caramel} w={700}>
        {word.slice(0, n)}
      </T>
      {[0, 1, 2].map((r) => {
        const k = r === 0 ? 1 : easeOut(seg(t, 1.3 + (r - 1) * 0.6, 1.7 + (r - 1) * 0.6));
        const tick = easeOut(seg(t, 1.5 + r * 0.6, 1.9 + r * 0.6));
        const x = 25 + r * 185;
        return (
          <g key={r} opacity={k}>
            <T x={x} y={106} s={13} f={C.latte}>
              {`run ${r + 1}`}
            </T>
            <rect x={x} y={116} width={170} height={64} rx={8} fill={C.cocoa} stroke={fixed ? C.caramel : C.cherryText} />
            <T x={x + 14} y={142} s={14} f={C.crema}>
              A · 80 → 2
            </T>
            <T x={x + 14} y={168} s={14} f={C.crema}>
              B · 80 → 3
            </T>
            <path d={`M${x + 140} 106 l6 6 l12 -14`} fill="none" stroke={C.caramel} strokeWidth={2.5} strokeDasharray="30" strokeDashoffset={30 * (1 - tick)} />
          </g>
        );
      })}
      <T x={300} y={224} s={14} f={C.caramel} a="middle" o={easeOut(seg(t, 3.0, 3.5))}>
        the same on every run
      </T>
    </Svg>
  );
}

// 7 · Dedup: brackets group each customer, numbers land newest first, the non-1 rows fade and are struck, three survive.
export function Dedup({ t }: StepCtx) {
  const recs = [
    ['c1', 'v1'],
    ['c1', 'v2'],
    ['c2', 'v1'],
    ['c3', 'v1'],
    ['c3', 'v2'],
  ];
  const rn = [2, 1, 1, 2, 1];
  const groups = [
    [0, 1],
    [2, 2],
    [3, 4],
  ];
  const drop = easeOut(seg(t, 2.4, 3.0));
  const a = easeOut(seg(t, 3.2, 3.7));
  return (
    <Svg label="Five records for three customers; ROW_NUMBER newest first, keep number 1: three kept, one per customer" h={300}>
      {groups.map(([g0, g1], k) => {
        const d = easeInOut(seg(t, 0.3 + k * 0.25, 0.7 + k * 0.25));
        return <path key={k} d={`M18 ${34 + g0 * 44} h-6 v${(g1 - g0) * 44 + 26} h6`} fill="none" stroke={C.latte} strokeWidth={1.5} opacity={d} />;
      })}
      {recs.map((r, i) => {
        const out = rn[i] !== 1;
        const k = easeOutBack(seg(t, 1.2 + i * 0.18, 1.5 + i * 0.18));
        return (
          <g key={i}>
            <g opacity={out ? 1 - 0.7 * drop : 1}>
              <rect x={25} y={30 + i * 44} width={150} height={34} rx={8} fill={C.cocoa} stroke={!out && a > 0 ? C.caramel : C.mocha} strokeWidth={!out && a > 0 ? 2 : 1} />
              <T x={100} y={52 + i * 44} s={13} f={C.crema} a="middle">{`${r[0]} · ${r[1]}`}</T>
              <T x={196} y={53 + i * 44} s={15} f={out ? C.cherryText : C.caramel} w={700} o={clamp(k)}>
                {String(rn[i])}
              </T>
            </g>
            {out && <line x1={30} y1={47 + i * 44} x2={30 + 185 * drop} y2={47 + i * 44} stroke={C.cherryText} strokeWidth={2} opacity={drop > 0 ? 1 : 0} />}
          </g>
        );
      })}
      <T x={300} y={90} s={20} f={C.caramel} w={700} o={a}>
        3 kept
      </T>
      <T x={300} y={116} s={13} f={C.latte} o={a}>
        one per customer
      </T>
      <T x={300} y={222} s={13} f={C.latte} o={easeOut(seg(t, 3.7, 4.2))}>
        tie: record_id wins
      </T>
    </Svg>
  );
}

// 8 · WHERE too early: a playhead walks the clause order; WHERE flashes red with nothing to filter, rn only appears at WINDOW; then the CTE fix.
export function WhereTooEarly({ t }: StepCtx) {
  const steps = ['FROM', 'WHERE', 'GROUP BY', 'HAVING', 'WINDOW'];
  const ph = seg(t, 0.6, 2.2) * 4;
  const at = Math.round(ph);
  const rn = easeOutBack(seg(t, 2.2, 2.5));
  const fix = easeOut(seg(t, 3.0, 3.4));
  return (
    <Svg label="WHERE runs before window functions are computed, so it cannot see ROW_NUMBER; compute it in a CTE and filter outside" h={300}>
      {steps.map((s, i) => {
        const bad = s === 'WHERE' && ph >= 0.8;
        return (
          <g key={s} opacity={easeOut(seg(t, i * 0.1, i * 0.1 + 0.4))}>
            <rect
              x={25 + i * 110}
              y={50}
              width={100}
              height={40}
              rx={8}
              fill={C.cocoa}
              stroke={bad ? C.cherryText : s === 'WINDOW' && ph >= 3.8 ? C.caramel : C.mocha}
              strokeWidth={bad || (s === 'WINDOW' && ph >= 3.8) ? 2 : 1}
            />
            <T x={75 + i * 110} y={75} s={13} f={C.crema} a="middle">
              {s}
            </T>
          </g>
        );
      })}
      {t > 0.6 && t < 2.3 && <circle cx={75 + ph * 110} cy={102} r={5} fill={C.crema} />}
      <T x={135} y={124} s={13} f={C.cherryText} a="middle" o={at >= 1 ? easeOut(seg(t, 1.0, 1.3)) : 0}>
        rn? not yet
      </T>
      <g opacity={clamp(rn)}>
        <rect x={485} y={104} width={80} height={28} rx={6} fill={C.roast} stroke={C.caramel} />
        <T x={525} y={123} s={13} f={C.caramel} a="middle">
          rn
        </T>
      </g>
      <T x={300} y={170} s={15} f={C.cherryText} a="middle" o={easeOut(seg(t, 2.5, 2.9))}>
        WHERE cannot see ROW_NUMBER() yet
      </T>
      <g opacity={fix}>
        <rect x={25} y={206} width={230} height={40} rx={8} fill={C.cocoa} stroke={C.caramel} />
        <T x={140} y={231} s={13} f={C.crema} a="middle">
          CTE computes rn
        </T>
        <line x1={255} y1={226} x2={lerp(255, 315, easeInOut(seg(t, 3.2, 3.6)))} y2={226} stroke={C.caramel} strokeWidth={2} />
        <rect x={315} y={206} width={250} height={40} rx={8} fill={C.cocoa} stroke={C.caramel} />
        <T x={440} y={231} s={13} f={C.crema} a="middle">
          then WHERE rn &lt;= 3
        </T>
      </g>
    </Svg>
  );
}

// 9 · QUALIFY: a QUALIFY step slides in right after WINDOW, four engines pop in, and PostgreSQL is dashed and struck.
export function Qualify({ t }: StepCtx) {
  const names = ['Snowflake', 'BigQuery', 'DuckDB', 'Databricks'];
  const q = easeInOut(seg(t, 0.3, 0.9));
  const pg = easeOut(seg(t, 2.4, 2.8));
  const strike = easeInOut(seg(t, 2.8, 3.2));
  return (
    <Svg label="QUALIFY filters on a window function right after the window step; Snowflake, BigQuery, DuckDB and Databricks have it, PostgreSQL and ISO SQL do not" h={280}>
      <rect x={25} y={24} width={110} height={36} rx={8} fill={C.cocoa} stroke={C.mocha} />
      <T x={80} y={47} s={13} f={C.crema} a="middle">
        WINDOW
      </T>
      <line x1={135} y1={42} x2={175} y2={42} stroke={C.caramel} strokeWidth={2} opacity={q} />
      <g transform={`translate(${lerp(200, 0, q)} 0)`} opacity={q}>
        <rect x={175} y={24} width={110} height={36} rx={8} fill={C.cocoa} stroke={C.caramel} strokeWidth={2} />
        <T x={230} y={47} s={13} f={C.caramel} a="middle" w={700}>
          QUALIFY
        </T>
      </g>
      {names.map((n, i) => {
        const k = easeOutBack(seg(t, 1.1 + i * 0.25, 1.4 + i * 0.25));
        return (
          <g key={n} opacity={clamp(k)} transform={`translate(${88 + i * 138} 120) scale(${0.6 + 0.4 * clamp(k)}) translate(${-(88 + i * 138)} -120)`}>
            <rect x={25 + i * 138} y={100} width={126} height={40} rx={8} fill={C.cocoa} stroke={C.caramel} />
            <T x={88 + i * 138} y={125} s={13} f={C.crema} a="middle">
              {n}
            </T>
          </g>
        );
      })}
      <rect x={25} y={176} width={126} height={40} rx={8} fill="none" stroke={C.cherryText} strokeDasharray="5 4" opacity={pg} />
      <T x={88} y={201} s={13} f={C.cherryText} a="middle" o={pg}>
        PostgreSQL
      </T>
      <line x1={30} y1={196} x2={30 + 116 * strike} y2={196} stroke={C.cherryText} strokeWidth={2} opacity={strike > 0 ? 1 : 0} />
      <T x={180} y={201} s={14} f={C.latte} o={easeOut(seg(t, 3.2, 3.6))}>
        not ISO SQL either
      </T>
    </Svg>
  );
}

// 10 · Two plans: ranking sweeps one sort over everything and keeps the top of each group; LATERAL probes each group with a short scan.
export function TwoPlans({ t }: StepCtx) {
  const sweep = seg(t, 0.3, 1.3);
  const keep = easeOut(seg(t, 1.4, 1.9));
  const b = easeOut(seg(t, 2.1, 2.4));
  return (
    <Svg label="Ranking sorts everything once and keeps the top of each group; LATERAL takes one group at a time with a short index scan" h={300}>
      <T x={25} y={40} s={15} f={C.caramel} w={700}>
        ranking: one sort of everything
      </T>
      {Array.from({ length: 15 }, (_, i) => {
        const kept = i % 5 < 3;
        const on = sweep * 15 > i;
        return <rect key={i} x={25 + i * 27} y={54} width={22} height={24} rx={4} fill={on ? C.caramel : C.cocoa} stroke={C.mocha} opacity={on && !kept ? 1 - 0.75 * keep : 1} />;
      })}
      <T x={25} y={104} s={13} f={C.latte} o={keep}>
        nearly free if the sort is shared
      </T>
      <T x={25} y={170} s={15} f={C.cinnamon} w={700} o={b}>
        LATERAL: one group at a time
      </T>
      {[0, 1, 2, 3, 4].map((i) => {
        const pr = easeOut(seg(t, 2.4 + i * 0.3, 2.7 + i * 0.3));
        return (
          <g key={i} opacity={b}>
            <rect x={25 + i * 84} y={184} width={74} height={24} rx={6} fill={C.cocoa} stroke={C.mocha} />
            <rect x={25 + i * 84} y={184} width={30 * pr} height={24} rx={6} fill={C.cinnamon} />
          </g>
        );
      })}
      <T x={25} y={234} s={13} f={C.latte} o={easeOut(seg(t, 3.8, 4.2))}>
        cheap with an index on (group, order)
      </T>
    </Svg>
  );
}

// 11 · Verdict: three habits, each underlined and ticked.
export function Verdict({ t }: StepCtx) {
  const rows = [
    ['which numbering', 'say it, and say why'],
    ['every ranking order', 'ends in a unique key'],
    ['top-N per group', 'QUALIFY or a CTE'],
  ];
  return (
    <Svg label="Three habits for rankings: say which numbering and why, end every ranking order in a unique key, QUALIFY or a CTE for top-N per group" h={280}>
      {rows.map((r, i) => {
        const k = easeOut(seg(t, i * 0.95, i * 0.95 + 0.5));
        const bar = easeInOut(seg(t, i * 0.95 + 0.3, i * 0.95 + 0.9));
        const tick = easeOut(seg(t, i * 0.95 + 0.8, i * 0.95 + 1.1));
        return (
          <g key={r[0]} opacity={k}>
            <T x={25} y={50 + i * 80} s={14} f={C.latte}>
              {r[0]}
            </T>
            <T x={25} y={82 + i * 80} s={19} f={C.caramel} w={700}>
              {r[1]}
            </T>
            <rect x={25} y={92 + i * 80} width={400 * bar} height={3} fill={C.caramel} />
            <path d={`M540 ${70 + i * 80} l8 8 l16 -18`} fill="none" stroke={C.caramel} strokeWidth={3} strokeDasharray="40" strokeDashoffset={40 * (1 - tick)} />
          </g>
        );
      })}
    </Svg>
  );
}

export function ProveStandard({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const k = answered ? easeOut(seg(s, 0.1, 0.5)) : 0;
  const x = answered ? easeOut(seg(s, 0.4, 0.9)) : 0;
  return (
    <Svg label="QUALIFY is not in the ISO SQL standard" h={240}>
      <T x={40} y={100} s={18} f={C.latte}>
        QUALIFY in ISO SQL?
      </T>
      {answered ? (
        <>
          <T x={40} y={lerp(170, 156, k)} s={24} f={C.cherryText} w={700} o={k}>
            No
          </T>
          <g stroke={C.cherryText} strokeWidth={3} opacity={x}>
            <line x1={540} y1={120} x2={540 + 22 * x} y2={120 + 22 * x} />
            <line x1={562} y1={120} x2={562 - 22 * x} y2={120 + 22 * x} />
          </g>
        </>
      ) : (
        <T x={40} y={166} s={40} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      )}
    </Svg>
  );
}
export function ProveDense({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const groups = ['90', '80', '70'];
  return (
    <Svg label="DENSE_RANK of the 70 in 90, 80, 80, 70 is 3: three distinct scores down to it" h={240}>
      <T x={40} y={70} s={18} f={C.latte}>
        90, 80, 80, 70 → the 70 is
      </T>
      {answered ? (
        <>
          {groups.map((g, i) => {
            const k = easeOutBack(seg(s, 0.1 + i * 0.3, 0.4 + i * 0.3));
            return (
              <g key={g} opacity={clamp(k)}>
                <rect x={40 + i * 90} y={100} width={70} height={40} rx={8} fill={C.cocoa} stroke={i === 2 ? C.caramel : C.mocha} strokeWidth={i === 2 ? 2 : 1} />
                <T x={75 + i * 90} y={125} s={14} f={C.crema} a="middle">
                  {g}
                </T>
                <T x={75 + i * 90} y={168} s={18} f={C.caramel} a="middle" w={700}>
                  {String(i + 1)}
                </T>
              </g>
            );
          })}
        </>
      ) : (
        <T x={40} y={150} s={40} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      )}
    </Svg>
  );
}
