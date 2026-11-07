import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (chapter convention): plan trees are drawn root at the top, leaves at the bottom; caramel marks the stage or
// operator under discussion, cherryText a failure, crema data, latte labels, taupe structure.

const STAGES = ['parse', 'bind', 'rewrite', 'plan', 'execute'];

function Pipeline({ lit = -1, bad = -1, show = 5 }: { lit?: number; bad?: number; show?: number }) {
  return (
    <g>
      {STAGES.map((s, i) => (
        <g key={s} opacity={i < show ? 1 : 0.15}>
          <rect
            x={20 + i * 112}
            y={60}
            width={100}
            height={46}
            rx={8}
            fill={C.cocoa}
            stroke={i === bad ? C.cherryText : i === lit ? C.caramel : C.mocha}
            strokeWidth={i === lit || i === bad ? 3 : 1}
          />
          <T x={70 + i * 112} y={89} s={14} f={C.crema} a="middle">
            {s}
          </T>
          {i < 4 && (
            <T x={126 + i * 112} y={89} s={14} f={C.taupe} a="middle">
              →
            </T>
          )}
        </g>
      ))}
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

// 1 · Route: the SQL types itself, the five boxes appear, a token travels through them, and rows come out of the far end.
export function Route({ t }: StepCtx) {
  const sql = 'SELECT … FROM orders WHERE …';
  const n = Math.round(sql.length * seg(t, 0.2, 0.9));
  const b = easeOut(seg(t, 0.9, 1.2));
  const tok = seg(t, 1.2, 2.6) * 4;
  const out = easeOut(seg(t, 2.6, 3.0));
  return (
    <Svg label="SQL text goes in, rows come out, with a pipeline of five stages between" h={220}>
      <T x={20} y={36} s={14} f={C.latte}>
        {sql.slice(0, n)}
      </T>
      <g opacity={b}>
        <Pipeline lit={t > 1.2 && t < 2.7 ? Math.round(tok) : -1} />
      </g>
      {t > 1.2 && t < 2.7 && <rect x={58 + tok * 112} y={112} width={24} height={6} rx={3} fill={C.caramel} />}
      {[0, 1, 2].map((i) => (
        <rect key={i} x={470 + i * 10} y={130 + i * 10} width={80} height={6} rx={3} fill={C.caramel} opacity={out * easeOut(seg(t, 2.7 + i * 0.1, 2.9 + i * 0.1))} />
      ))}
      <T x={470} y={190} s={14} f={C.caramel} o={out}>
        rows
      </T>
    </Svg>
  );
}

// 2 · Five stages: each box lights in turn, its note pops under it, and a bar fills under the box as the pipeline knows more.
export function FiveStages({ t }: StepCtx) {
  const notes = ['grammar', 'catalog', 'views', 'cheapest', 'run'];
  const lit = Math.min(4, Math.floor(Math.max(0, t - 0.2) / 0.8));
  return (
    <Svg label="Parse checks grammar, bind looks up the catalog, rewrite expands views, plan picks the cheapest, execute runs it" h={260}>
      <Pipeline lit={t > 0.2 ? lit : -1} />
      {notes.map((n, i) => {
        const k = easeOut(seg(t, 0.2 + i * 0.8, 0.6 + i * 0.8));
        return (
          <g key={n}>
            <rect x={20 + i * 112} y={112} width={100 * k} height={5} rx={2} fill={C.caramel} opacity={0.4 + 0.15 * i} />
            <T x={70 + i * 112} y={146} s={13} f={C.latte} a="middle" o={k}>
              {n}
            </T>
          </g>
        );
      })}
      <T x={20} y={210} s={13} f={C.latte} o={easeOut(seg(t, 4.0, 4.4))}>
        each stage knows a little more than the last
      </T>
    </Svg>
  );
}

// 3 · Predict: the query enters the pipeline. After the answer, it passes parse, stops red at bind, and the later stages dim.
export function FailPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const go = answered ? easeInOut(seg(s, 0.1, 0.8)) : 0;
  const hit = answered && go >= 1;
  const shake = hit && s < 1.3 ? Math.sin(s * 60) * 3 : 0;
  return (
    <Svg label="A grammatically valid query on a missing table passes parse and fails at bind" h={260}>
      <T x={20} y={34} s={14} f={C.crema}>
        SELECT * FROM no_such_table WHERE x = 1
      </T>
      <g transform={`translate(${shake} 0)`}>
        <Pipeline bad={hit ? 1 : -1} show={hit ? 2 : 5} />
      </g>
      {answered && <rect x={lerp(58, 170, go)} y={112} width={24} height={6} rx={3} fill={hit ? C.cherryText : C.caramel} />}
      {answered && <path d="M60 128 l6 6 l12 -14" fill="none" stroke={C.caramel} strokeWidth={2.5} opacity={easeOut(seg(s, 0.4, 0.6))} />}
      {!answered ? (
        <T x={300} y={190} s={44} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      ) : (
        <T x={300} y={180} s={16} f={C.cherryText} a="middle" w={700} o={easeOut(seg(s, 0.9, 1.3))}>
          relation "no_such_table" does not exist
        </T>
      )}
    </Svg>
  );
}

// 4 · Bind: a probe runs from the FuncCall to the catalog, the catalog answers "aggregate", and the node becomes an Aggref.
export function Bind({ t }: StepCtx) {
  const cat = easeOut(seg(t, 0.2, 0.5));
  const p1 = seg(t, 0.5, 1.2);
  const ans = easeOut(seg(t, 1.3, 1.6));
  const p2 = seg(t, 1.8, 2.4);
  const b = easeOutBack(seg(t, 2.4, 2.8));
  return (
    <Svg label="A call named count becomes an aggregate node after the catalog lookup" h={260}>
      <rect x={25} y={50} width={170} height={44} rx={8} fill={C.cocoa} stroke={C.mocha} />
      <T x={110} y={78} s={14} f={C.crema} a="middle">
        FuncCall: count
      </T>
      <g opacity={cat}>
        <T x={355} y={40} s={13} f={C.latte} a="middle">
          catalog
        </T>
        <line x1={195} y1={72} x2={290} y2={72} stroke={C.caramel} strokeWidth={2} />
        <rect x={290} y={50} width={130} height={44} rx={8} fill={C.roast} stroke={C.caramel} />
        <T x={355} y={78} s={13} f={C.caramel} a="middle" o={ans}>
          aggregate
        </T>
      </g>
      {p1 > 0 && p1 < 1 && <circle cx={lerp(195, 290, p1)} cy={72} r={6} fill={C.crema} />}
      <line x1={420} y1={72} x2={lerp(420, 470, p2)} y2={72} stroke={C.caramel} strokeWidth={2} opacity={p2 > 0 ? 1 : 0} />
      {p2 > 0 && p2 < 1 && <circle cx={lerp(420, 470, p2)} cy={72} r={6} fill={C.caramel} />}
      <g opacity={clamp(b)} transform={`translate(525 72) scale(${0.7 + 0.3 * clamp(b)}) translate(-525 -72)`}>
        <rect x={470} y={50} width={100} height={44} rx={8} fill={C.cocoa} stroke={C.caramel} strokeWidth={2} />
        <T x={520} y={78} s={14} f={C.caramel} a="middle" w={700}>
          Aggref
        </T>
      </g>
      <T x={300} y={170} s={14} f={C.latte} a="middle" o={easeOut(seg(t, 3.0, 3.5))}>
        same name, now it has a meaning
      </T>
    </Svg>
  );
}

// 5 · View erased: the query and the view's definition both feed one merged query over the base table; the view reference is struck out.
export function ViewErased({ t }: StepCtx) {
  const ar = easeInOut(seg(t, 0.3, 1.0));
  const merged = 'FROM orders WHERE paid …';
  const n = Math.round(merged.length * seg(t, 1.0, 1.8));
  const strike = easeInOut(seg(t, 1.9, 2.4));
  return (
    <Svg label="A query over a view is rewritten into a query over the base table; the planner never sees the view" h={280}>
      <g opacity={1 - 0.5 * strike}>
        <rect x={30} y={50} width={200} height={44} rx={8} fill={C.cocoa} stroke={C.mocha} />
        <T x={130} y={78} s={14} f={C.crema} a="middle">
          FROM paid_orders
        </T>
      </g>
      <line x1={36} y1={72} x2={36 + 188 * strike} y2={72} stroke={C.cherryText} strokeWidth={2} opacity={strike > 0 ? 1 : 0} />
      <rect x={30} y={130} width={200} height={44} rx={8} fill={C.cocoa} stroke={C.mocha} />
      <T x={130} y={158} s={14} f={C.crema} a="middle">
        view: WHERE paid
      </T>
      <path d="M230 72 C 280 72 290 110 330 110" fill="none" stroke={C.caramel} strokeWidth={2.5} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - ar} />
      <path d="M230 152 C 280 152 290 110 330 110" fill="none" stroke={C.caramel} strokeWidth={2.5} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - ar} />
      <rect x={330} y={88} width={240} height={44} rx={8} fill={C.cocoa} stroke={C.caramel} strokeWidth={2} opacity={easeOut(seg(t, 0.8, 1.1))} />
      <T x={345} y={116} s={13} f={C.crema}>
        {merged.slice(0, n)}
      </T>
      <T x={300} y={230} s={14} f={C.latte} a="middle" o={easeOut(seg(t, 2.6, 3.1))}>
        the planner never sees the view
      </T>
    </Svg>
  );
}

function Tree({ nodes, edges, lit = '' }: { nodes: Record<string, [number, number, string]>; edges: [string, string][]; lit?: string }) {
  return (
    <g>
      {edges.map(([a, b]) => (
        <line key={a + b} x1={nodes[a][0]} y1={nodes[a][1] + 18} x2={nodes[b][0]} y2={nodes[b][1] - 18} stroke={C.taupe} strokeWidth={2} />
      ))}
      {Object.entries(nodes).map(([k, [x, y, l]]) => (
        <g key={k}>
          <rect x={x - 62} y={y - 18} width={124} height={36} rx={8} fill={C.cocoa} stroke={lit === k ? C.caramel : C.mocha} strokeWidth={lit === k ? 3 : 1} />
          <T x={x} y={y + 5} s={13} f={C.crema} a="middle">
            {l}
          </T>
        </g>
      ))}
    </g>
  );
}

// 6 · Logical vs physical: the algebra tree builds leaves-up; each node then gets its algorithm on the right; the leaf flips between two scans and settles.
export function LogicalPhysical({ t }: StepCtx) {
  const lg = [easeOut(seg(t, 0.2, 0.5)), easeOut(seg(t, 0.5, 0.8)), easeOut(seg(t, 0.8, 1.1))];
  const ph = [easeOutBack(seg(t, 1.5, 1.8)), easeOutBack(seg(t, 1.9, 2.2)), easeOutBack(seg(t, 2.3, 2.6))];
  const flip = t > 2.8 && t < 3.8 ? Math.floor((t - 2.8) / 0.25) % 2 === 0 : false;
  const rows: [number, string, string][] = [
    [190, 'orders', flip ? 'Seq Scan' : 'Index Scan'],
    [130, 'σ status', 'Filter'],
    [70, 'π', 'Project'],
  ];
  return (
    <Svg label="A logical algebra tree, what to compute, and the physical tree, how: the same shape with a specific algorithm in each box" h={320}>
      <T x={25} y={32} s={13} f={C.latte}>
        logical: what
      </T>
      <T x={340} y={32} s={13} f={C.caramel} o={easeOut(seg(t, 1.3, 1.6))}>
        physical: how
      </T>
      {rows.map(([y, l, p], i) => (
        <g key={l}>
          <g opacity={lg[i]}>
            {i < 2 && <line x1={120} y1={y - 18} x2={120} y2={y - 42} stroke={C.taupe} strokeWidth={2} />}
            <rect x={58} y={y - 18} width={124} height={36} rx={8} fill={C.cocoa} stroke={C.mocha} />
            <T x={120} y={y + 5} s={13} f={C.crema} a="middle">
              {l}
            </T>
          </g>
          <line x1={182} y1={y} x2={lerp(182, 378, clamp(ph[i]))} y2={y} stroke={C.caramel} strokeWidth={1.5} strokeDasharray="4 4" opacity={ph[i] > 0 ? 0.6 : 0} />
          <g opacity={clamp(ph[i])}>
            {i < 2 && <line x1={440} y1={y - 18} x2={440} y2={y - 42} stroke={C.taupe} strokeWidth={2} />}
            <rect x={378} y={y - 18} width={124} height={36} rx={8} fill={C.cocoa} stroke={i === 0 ? C.caramel : C.mocha} strokeWidth={i === 0 ? 3 : 1} />
            <T x={440} y={y + 5} s={13} f={C.crema} a="middle">
              {p}
            </T>
          </g>
        </g>
      ))}
      <T x={25} y={270} s={13} f={C.latte} o={easeOut(seg(t, 3.6, 4.0))}>
        many physical plans, one result
      </T>
    </Svg>
  );
}

// 7 · Paths: each candidate appears with a cost bar under it; the cheapest scan and the cheapest join light caramel.
export function Paths({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 0.7));
  const b = easeOut(seg(t, 1.6, 2.0));
  const box = (x: number, y: number, label: string, cost: number, k: number, ck: number, win: boolean) => (
    <g opacity={k}>
      <rect x={x} y={y} width={150} height={34} rx={8} fill={C.cocoa} stroke={win && ck >= 1 ? C.caramel : C.mocha} strokeWidth={win && ck >= 1 ? 2 : 1} />
      <T x={x + 75} y={y + 22} s={13} f={C.crema} a="middle">
        {label}
      </T>
      <rect x={x} y={y + 42} width={cost * ck} height={6} rx={3} fill={win ? C.caramel : C.cherry} />
    </g>
  );
  return (
    <Svg label="A scan has at least two paths and a join at least three; each is costed and the cheapest is chosen" h={300}>
      <T x={25} y={36} s={14} f={C.latte}>
        scan of orders
      </T>
      {box(25, 48, 'sequential', 130, a, easeOut(seg(t, 0.8, 1.3)), false)}
      {box(190, 48, 'via an index', 40, a, easeOut(seg(t, 0.8, 1.3)), true)}
      <T x={25} y={136} s={14} f={C.latte}>
        join
      </T>
      {['nested loop', 'merge', 'hash'].map((j, i) => box(25 + i * 165, 148, j, [140, 90, 50][i], b, easeOut(seg(t, 2.1, 2.7)), i === 2))}
      <T x={300} y={240} s={14} f={C.latte} a="middle" o={easeOut(seg(t, 3.0, 3.5))}>
        each path is costed; the cheapest wins
      </T>
    </Svg>
  );
}

// 8 · Properties: the index scan's order travels up to ORDER BY; requirement and provision match, and the dashed Sort node dissolves.
export function Properties({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 0.8));
  const up = seg(t, 1.2, 2.2);
  const gone = easeInOut(seg(t, 2.4, 3.0));
  const b = easeOut(seg(t, 3.0, 3.4));
  return (
    <Svg label="An index scan provides an order; ORDER BY requires one; when they match, the Sort node is not needed" h={300}>
      <Tree
        nodes={{
          o: [150, 70, 'ORDER BY event_time'],
          s: [150, 170, 'Index Scan'],
        }}
        edges={[['o', 's']]}
        lit="s"
      />
      <T x={330} y={74} s={14} f={C.cinnamon} o={a}>
        requires: event_time order
      </T>
      <T x={330} y={174} s={14} f={C.caramel} o={a}>
        provides: event_time order
      </T>
      <g opacity={1 - gone} transform={`translate(150 127) scale(${1 - 0.4 * gone}) translate(-150 -127)`}>
        <rect x={88} y={110} width={124} height={34} rx={8} fill={C.espresso} stroke={C.cherryText} strokeDasharray="5 4" />
        <T x={150} y={132} s={13} f={C.cherryText} a="middle">
          Sort
        </T>
      </g>
      {up > 0 && up < 1 && <circle cx={150} cy={lerp(150, 90, up)} r={6} fill={C.caramel} />}
      <T x={330} y={232} s={15} f={C.caramel} o={b}>
        a match:
      </T>
      <T x={330} y={254} s={15} f={C.caramel} o={b}>
        no Sort node needed
      </T>
    </Svg>
  );
}

// 9 · Predict: a dashed Sort slot between Limit and Index Scan pulses. After the answer, the slot vanishes and ordered rows flow straight up.
export function SortPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const gone = answered ? easeInOut(seg(s, 0.2, 0.7)) : 0;
  const flow = answered ? (s * 0.9) % 1 : 0;
  return (
    <Svg label="With an index on event_time, ORDER BY with a LIMIT needs no separate Sort node" h={280}>
      <Tree
        nodes={{
          l: [150, 50, 'Limit'],
          s: [150, 190, 'Index Scan'],
        }}
        edges={[['l', 's']]}
        lit="s"
      />
      <g opacity={(1 - gone) * (answered ? 1 : 0.6 + 0.4 * Math.sin(t * 4))}>
        <rect x={88} y={102} width={124} height={34} rx={8} fill={C.espresso} stroke={C.cherryText} strokeDasharray="5 4" />
        <T x={150} y={124} s={13} f={C.cherryText} a="middle">
          Sort?
        </T>
      </g>
      {answered && gone >= 1 && <circle cx={150} cy={lerp(170, 70, flow)} r={5} fill={C.caramel} />}
      {answered ? (
        <T x={330} y={124} s={16} f={C.caramel} w={700} o={easeOut(seg(s, 0.6, 1.0))}>
          no Sort node
        </T>
      ) : (
        <T x={420} y={150} s={48} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      )}
    </Svg>
  );
}

// 10 · Read the tree: leaves light first, rows flow up their edges into the join, then the join's output flows into the aggregate.
export function ReadTree({ t }: StepCtx) {
  const k = Math.min(3, Math.floor(Math.max(0, t - 0.2) / 0.9));
  const nodes: Record<string, [number, number, string]> = {
    r: [300, 50, 'Aggregate'],
    j: [300, 120, 'Hash Join'],
    a: [170, 200, 'Scan orders'],
    b: [430, 200, 'Scan customers'],
  };
  const order = ['a', 'b', 'j', 'r'];
  const f1 = seg(t, 1.9, 2.6);
  const f2 = seg(t, 2.8, 3.4);
  return (
    <Svg label="Read the plan from the leaves up: the scans first, then the join, then the aggregate at the root" h={300}>
      <Tree
        nodes={nodes}
        edges={[
          ['r', 'j'],
          ['j', 'a'],
          ['j', 'b'],
        ]}
        lit={t > 0.2 ? order[k] : ''}
      />
      {f1 > 0 && f1 < 1 && (
        <>
          <circle cx={lerp(170, 300, f1)} cy={lerp(182, 138, f1)} r={5} fill={C.caramel} />
          <circle cx={lerp(430, 300, f1)} cy={lerp(182, 138, f1)} r={5} fill={C.caramel} />
        </>
      )}
      {f2 > 0 && f2 < 1 && <circle cx={300} cy={lerp(102, 68, f2)} r={5} fill={C.caramel} />}
      <T x={300} y={270} s={13} f={C.latte} a="middle" o={easeOut(seg(t, 3.4, 3.8))}>
        leaves first, root last
      </T>
    </Svg>
  );
}

// 11 · Verdict: three things to keep, each underlined and ticked.
export function Verdict({ t }: StepCtx) {
  const rows = [
    ['meaning is fixed', 'by the end of rewrite'],
    ['choices are made', 'in the planner'],
    ['read plans', 'from the leaves up'],
  ];
  return (
    <Svg label="Three things about the pipeline: meaning is fixed by the end of rewrite, choices are made in the planner, read plans from the leaves up" h={280}>
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

export function ProveRewrite({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const k = answered ? easeOut(seg(s, 0.1, 0.5)) : 0;
  return (
    <Svg label="The rewrite stage expands views into base tables" h={240}>
      <T x={40} y={84} s={18} f={C.latte}>
        view → base tables:
      </T>
      {answered ? (
        <>
          <T x={40} y={lerp(150, 136, k)} s={24} f={C.caramel} w={700} o={k}>
            rewrite
          </T>
          {STAGES.map((st, i) => (
            <rect
              key={st}
              x={40 + i * 64}
              y={170}
              width={56}
              height={20}
              rx={4}
              fill={i === 2 && s > 0.6 ? C.caramel : C.cocoa}
              stroke={C.mocha}
              opacity={easeOut(seg(s, 0.2 + i * 0.08, 0.5 + i * 0.08))}
            />
          ))}
        </>
      ) : (
        <T x={40} y={150} s={40} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      )}
    </Svg>
  );
}
export function ProvePath({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const k = answered ? easeOut(seg(s, 0.1, 0.5)) : 0;
  const fork = answered ? easeInOut(seg(s, 0.5, 1.0)) : 0;
  return (
    <Svg label="PostgreSQL calls a candidate implementation of an operator a path" h={240}>
      <T x={40} y={84} s={18} f={C.latte}>
        a candidate implementation →
      </T>
      {answered ? (
        <>
          <T x={40} y={lerp(150, 136, k)} s={24} f={C.caramel} w={700} o={k}>
            a path
          </T>
          <path d="M220 190 C 260 190 270 160 320 160" fill="none" stroke={C.caramel} strokeWidth={2} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - fork} />
          <path d="M220 190 C 260 190 270 220 320 220" fill="none" stroke={C.taupe} strokeWidth={2} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - fork} />
          <circle cx={220} cy={190} r={6} fill={C.crema} />
        </>
      ) : (
        <T x={40} y={150} s={40} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      )}
    </Svg>
  );
}
