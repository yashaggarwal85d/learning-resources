import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar: caramel = the optimization that works, cherryText = the penalty or the opaque box, crema = data,
// latte = labels, taupe = structure.

function Box({
  x,
  y,
  w,
  h = 44,
  label,
  hi = false,
  bad = false,
  dashed = false,
  o = 1,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  label: string;
  hi?: boolean;
  bad?: boolean;
  dashed?: boolean;
  o?: number;
}) {
  return (
    <g opacity={o}>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={8}
        fill={dashed ? 'none' : C.cocoa}
        stroke={bad ? C.cherryText : hi ? C.caramel : C.mocha}
        strokeWidth={hi || bad ? 2 : 1}
        strokeDasharray={dashed ? '5 4' : undefined}
      />
      <T x={x + w / 2} y={y + h / 2 + 5} s={13} f={bad ? C.cherryText : C.crema} a="middle">
        {label}
      </T>
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

// 1 · The black box. Rows travel from the query into a dark box whose inside stays hidden; all the planner gets back
// are three tags sliding out of the side: the name, the argument types and the return type.
export function BlackBox({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.7));
  const flow = t > 0.6 ? ((t - 0.6) * 0.9) % 1 : -1;
  const tags = ['name: price', 'args: numeric', 'returns: numeric'];
  return (
    <Svg label="The planner sees a function's name and types, not its body" h={290}>
      <Box x={30} y={100} w={170} label="WHERE price(x) > 10" />
      <line x1={200} y1={122} x2={260} y2={122} stroke={C.taupe} strokeWidth={2} />
      {flow >= 0 && <circle cx={lerp(200, 258, flow)} cy={122} r={4} fill={C.crema} />}
      <rect x={260} y={70} width={180} height={104} rx={10} fill={C.void} stroke={C.cherryText} strokeWidth={2} opacity={a} />
      <T x={350} y={128} s={20} f={C.cherryText} a="middle" o={a * (0.6 + 0.4 * Math.sin(t * 4))}>
        ? ? ?
      </T>
      <T x={350} y={62} s={13} f={C.latte} a="middle" o={a}>
        body hidden
      </T>
      {tags.map((tg, i) => {
        const k = easeOutBack(seg(t, 1.1 + i * 0.3, 1.5 + i * 0.3));
        return k > 0 ? (
          <g key={tg} opacity={clamp(k)} transform={`translate(${lerp(300, 30 + i * 182, clamp(k))} 210)`}>
            <rect width={172} height={28} rx={6} fill={C.roast} stroke={C.mocha} />
            <T x={86} y={19} s={13} f={C.crema} a="middle">
              {tg}
            </T>
          </g>
        ) : null;
      })}
      <T x={30} y={270} s={14} f={C.crema} o={easeOut(seg(t, 2.3, 2.8))}>
        every default is the safe one, not the fast one
      </T>
    </Svg>
  );
}

// 2 · Kinds, each with a tiny demonstration: a scalar takes one value and returns one; a table function returns a
// little stack of rows; an aggregate's state bar grows as rows feed in and one result drops out.
export function Kinds({ t }: StepCtx) {
  const items = [
    ['scalar', 'one value per call', 'f(x)'],
    ['table', 'many rows per call', 'FROM f(x)'],
    ['aggregate', 'state per row, one result', 'my_sum(x)'],
  ];
  const k = [0, 1, 2].map((i) => easeInOut(seg(t, 0.5 + i * 0.9, 1.3 + i * 0.9)));
  const X = 420;
  return (
    <Svg label="Scalar, table and aggregate user-defined functions" h={280}>
      {items.map((it, i) => (
        <g key={it[0]} opacity={easeOut(seg(t, i * 0.9, i * 0.9 + 0.5))}>
          <T x={25} y={60 + i * 74} s={18} f={C.caramel} w={700}>
            {it[0]}
          </T>
          <T x={170} y={60 + i * 74} s={15} f={C.crema}>
            {it[2]}
          </T>
          <T x={170} y={84 + i * 74} s={13} f={C.latte}>
            {it[1]}
          </T>
        </g>
      ))}
      {k[0] > 0 && (
        <g>
          <rect x={X + 40} y={40} width={40} height={30} rx={6} fill="none" stroke={C.mocha} />
          <circle cx={lerp(X, X + 120, k[0])} cy={55} r={6} fill={k[0] > 0.5 ? C.caramel : C.crema} />
        </g>
      )}
      {k[1] > 0 && (
        <g>
          <rect x={X} y={114} width={40} height={30} rx={6} fill="none" stroke={C.mocha} />
          {[0, 1, 2].map((r) => (
            <rect key={r} x={X + 60} y={106 + r * 16} width={lerp(0, 80, seg(k[1] * 3, r, r + 1))} height={11} rx={3} fill={C.caramel} />
          ))}
        </g>
      )}
      {k[2] > 0 && (
        <g>
          {[0, 1, 2, 3].map((r) => (
            <circle key={r} cx={lerp(X - 20 + r * 14, X + 40, seg(k[2] * 4, r, r + 1))} cy={204} r={4} fill={C.crema} opacity={1 - seg(k[2] * 4, r + 0.8, r + 1)} />
          ))}
          <rect x={X + 40} y={196} width={60} height={16} rx={3} fill="none" stroke={C.mocha} />
          <rect x={X + 40} y={196} width={60 * k[2]} height={16} rx={3} fill={C.cinnamon} />
          {k[2] >= 1 && <circle cx={X + 130} cy={204} r={6} fill={C.caramel} />}
        </g>
      )}
    </Svg>
  );
}

// 3 · Volatility. A volatile call fires once per row: red marks stream in while the call counter climbs to 1,000. The
// immutable call fires once, and its value is copied along the row with no new calls.
export function Volatility({ t }: StepCtx) {
  const n = 40;
  const a = seg(t, 0.4, 2.0);
  const once = easeOutBack(seg(t, 2.2, 2.6));
  const copy = seg(t, 2.6, 3.4);
  return (
    <Svg label="A volatile call is evaluated for every row, a thousand calls; an immutable one is folded once" h={300}>
      <T x={25} y={36} s={14} f={C.cherryText}>
        VOLATILE: f(5) per row
      </T>
      <T x={575} y={36} s={14} f={C.cherryText} a="end" w={700}>
        {fmtN(1000 * a)} calls
      </T>
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={25 + i * 13} y={50} width={9} height={22} rx={2} fill={C.cherry} opacity={clamp(a * n - i)} transform={`translate(0 ${(1 - clamp(a * n - i)) * -10})`} />
      ))}
      <T x={25} y={146} s={14} f={C.caramel}>
        IMMUTABLE: folded to its value
      </T>
      {once > 0 && <rect x={25} y={160} width={9} height={22} rx={2} fill={C.caramel} opacity={clamp(once)} transform={`translate(0 ${(1 - clamp(once)) * -10})`} />}
      {Array.from({ length: n - 1 }, (_, i) => (
        <circle key={i} cx={42 + i * 13} cy={171} r={2.5} fill={C.caramel} opacity={clamp(copy * (n - 1) - i) * 0.7} />
      ))}
      <T x={575} y={146} s={14} f={C.caramel} a="end" w={700} o={once > 0 ? 1 : 0}>
        1 call
      </T>
      <T x={25} y={240} s={13} f={C.latte} o={easeOut(seg(t, 3.4, 3.9))}>
        a constant argument is only folded if you say so
      </T>
    </Svg>
  );
}
const fmtN = (n: number) => Math.round(n).toLocaleString('en-US');

// 4 · Parallel gate. Four workers fill their slices of the scan together. Then an UNSAFE call drops into the plan:
// the workers slide back into one, and the single process fills the whole scan alone, slowly.
export function ParallelGate({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.6));
  const fill = easeInOut(seg(t, 0.5, 1.5));
  const drop = easeOutBack(seg(t, 1.8, 2.2));
  const merge = easeInOut(seg(t, 2.2, 2.8));
  const slow = seg(t, 2.8, 4.0);
  return (
    <Svg label="A parallel plan with workers collapses to one serial process when one UNSAFE function appears anywhere in the statement" h={300}>
      <T x={25} y={36} s={14} f={C.latte}>
        plan with no UDF
      </T>
      {[0, 1, 2, 3].map((i) => (
        <g key={i} opacity={a}>
          <rect x={25 + i * 60} y={48} width={50} height={32} rx={6} fill={C.cocoa} stroke={C.caramel} />
          <rect x={25 + i * 60} y={48} width={50 * fill} height={32} rx={6} fill={C.caramel} />
        </g>
      ))}
      <T x={280} y={70} s={13} f={C.crema} o={a}>
        4 workers
      </T>
      <T x={25} y={140} s={14} f={C.latte}>
        one call to an UNSAFE UDF
      </T>
      {drop > 0 && (
        <g opacity={clamp(drop)} transform={`translate(0 ${(1 - clamp(drop)) * -24})`}>
          <rect x={290} y={116} width={70} height={26} rx={6} fill="none" stroke={C.cherryText} strokeWidth={2} />
          <T x={325} y={134} s={13} f={C.cherryText} a="middle">
            udf()
          </T>
        </g>
      )}
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={lerp(25 + i * 60, 25, merge)}
          y={152}
          width={50}
          height={32}
          rx={6}
          fill={C.cocoa}
          stroke={C.cherryText}
          strokeDasharray={i === 0 ? undefined : '4 3'}
          opacity={i === 0 ? 1 : 1 - merge}
        />
      ))}
      <rect x={25} y={152} width={lerp(50, 230, merge)} height={32} rx={6} fill="none" stroke={C.cherryText} opacity={merge} />
      <rect x={25} y={152} width={230 * slow} height={32} rx={6} fill={C.cherry} />
      <T x={280} y={174} s={13} f={C.cherryText} o={merge}>
        serial: the whole statement
      </T>
    </Svg>
  );
}

// 5 · Predict: workers. Before the answer the three workers hum. After it the filter box turns red, a red pulse
// travels back to the scan, and the workers go dark one by one.
export function WorkersPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const pulse = answered ? seg(s, 0.1, 0.7) : 0;
  return (
    <Svg label="A scan with workers meets a filter calling an unmarked UDF: the whole statement runs without workers" h={280}>
      <Box x={30} y={70} w={130} label="scan" />
      {[0, 1, 2].map((i) => {
        const off = answered ? seg(s, 0.7 + i * 0.2, 0.9 + i * 0.2) : 0;
        const hum = answered ? 1 : 0.7 + 0.3 * Math.sin(t * 6 + i);
        return (
          <rect
            key={i}
            x={30 + i * 44}
            y={130}
            width={36}
            height={24}
            rx={5}
            fill={off > 0.5 ? 'none' : C.caramel}
            stroke={off > 0.5 ? C.cherryText : C.caramel}
            strokeDasharray={off > 0.5 ? '4 3' : undefined}
            opacity={hum}
          />
        );
      })}
      <line x1={160} y1={92} x2={230} y2={92} stroke={C.taupe} strokeWidth={2} />
      {pulse > 0 && pulse < 1 && <circle cx={lerp(230, 160, pulse)} cy={92} r={6} fill={C.cherryText} />}
      <Box x={230} y={70} w={170} label="filter: udf(x)" bad={answered} />
      {!answered && (
        <T x={480} y={104} s={48} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      )}
      <T x={300} y={230} s={15} f={C.cherryText} a="middle" o={answered ? easeOut(seg(s, 1.3, 1.7)) : 0}>
        no workers anywhere in the statement
      </T>
    </Svg>
  );
}

// 6 · Filter order. Eight rows (an illustrative handful) flow through each pair of filters. Cost unknown: every row
// pays for the UDF first and the call counter reads 8. COST declared: the cheap, selective filter goes first and only
// one survivor reaches the UDF.
export function FilterOrder({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.6));
  const b = easeOut(seg(t, 1.9, 2.3));
  const f1 = seg(t, 0.6, 1.8);
  const f2 = seg(t, 2.3, 3.5);
  const dots = (p: number, y: number, first: number, second: number, udfFirst: boolean) =>
    Array.from({ length: 8 }, (_, i) => {
      const q = seg(p * 1.6, i * 0.08, i * 0.08 + 0.8);
      if (q <= 0) return null;
      const survives = i === 3;
      let x = lerp(0, 380, q);
      if (!survives && x > (udfFirst ? second : first)) x = udfFirst ? second : first;
      const stopped = !survives && x >= (udfFirst ? second : first) - 0.5;
      return <circle key={i} cx={x} cy={y + 22 + (i % 3) * 6 - 6} r={4} fill={stopped ? C.taupe : C.crema} opacity={stopped ? 0.4 : 1} />;
    });
  const calls1 = Math.round(8 * clamp(f1 * 1.6 - 0.25));
  const calls2 = f2 > 0.7 ? 1 : 0;
  return (
    <Svg label="Without a declared cost the expensive UDF runs on every row before the selective cheap filter; with COST declared, only the survivors pay" h={300}>
      <T x={25} y={36} s={14} f={C.cherryText} o={a}>
        cost unknown
      </T>
      <Box x={25} y={50} w={150} label="udf(x) > 10" bad o={a} />
      <Box x={200} y={50} w={150} label="status = 'rare'" o={a} />
      <g transform="translate(0 0)">{dots(f1, 50, 200, 200, false)}</g>
      <T x={575} y={78} s={14} f={C.cherryText} a="end" w={700} o={f1 > 0 ? 1 : 0}>
        udf calls: {Math.min(8, calls1)}
      </T>
      <T x={25} y={160} s={14} f={C.caramel} o={b}>
        COST declared
      </T>
      <Box x={25} y={174} w={150} label="status = 'rare'" hi o={b} />
      <Box x={200} y={174} w={150} label="udf(x) > 10" o={b} />
      {dots(f2, 174, 25, 25, true)}
      <T x={575} y={202} s={14} f={C.caramel} a="end" w={700} o={f2 > 0 ? 1 : 0}>
        udf calls: {calls2}
      </T>
      <T x={300} y={270} s={13} f={C.latte} a="middle" o={easeOut(seg(t, 3.3, 3.7))}>
        same query, same result, far less work
      </T>
    </Svg>
  );
}

// 7 · Declarations. Each declaration arrives with a padlock that springs open (the penalty lifted). Then the warning:
// a false IMMUTABLE flashes red, because the planner believes you.
const Lock = ({ x, y, open, color }: { x: number; y: number; open: number; color: string }) => (
  <g>
    <rect x={x} y={y} width={22} height={16} rx={3} fill="none" stroke={color} strokeWidth={2} />
    <path d={`M ${x + 5} ${y} L ${x + 5} ${y - 6 - 6 * open} A 6 6 0 0 1 ${x + 17} ${y - 6 - 6 * open} L ${x + 17} ${y - 6 * open}`} fill="none" stroke={color} strokeWidth={2} />
  </g>
);
export function Declarations({ t }: StepCtx) {
  const rows = [
    ['IMMUTABLE / STABLE', 'calls can be folded'],
    ['PARALLEL SAFE', 'workers return'],
    ['COST n', 'runs after cheap filters'],
  ];
  const warn = easeOut(seg(t, 2.8, 3.2));
  return (
    <Svg label="Three declarations and the penalty each lifts; a false declaration gives wrong answers" h={300}>
      {rows.map((r, i) => {
        const a = easeOut(seg(t, 0.2 + i * 0.8, 0.6 + i * 0.8));
        const open = easeOutBack(seg(t, 0.6 + i * 0.8, 1.0 + i * 0.8));
        return (
          <g key={r[0]} opacity={a}>
            <T x={25} y={56 + i * 66} s={17} f={C.caramel} w={700}>
              {r[0]}
            </T>
            <T x={25} y={82 + i * 66} s={14} f={C.latte}>
              {r[1]}
            </T>
            <Lock x={540} y={44 + i * 66} open={clamp(open)} color={open > 0.5 ? C.caramel : C.cherryText} />
          </g>
        );
      })}
      <g opacity={warn}>
        <rect x={25} y={246} width={550} height={36} rx={8} fill="none" stroke={C.cherryText} strokeWidth={warn * (1 + Math.max(0, Math.sin((t - 3.2) * 6)))} />
        <T x={300} y={270} s={14} f={C.cherryText} a="middle">
          a false IMMUTABLE returns wrong answers
        </T>
      </g>
    </Svg>
  );
}

// 8 · Inlining.
export function Inline({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.8, 2.2));
  return (
    <Svg label="A single-expression SQL function is pasted into the calling query" h={280}>
      <Box x={30} y={80} w={170} label="price(x) = x * 1.2" />
      <g transform={`translate(${a * 230} 0)`} opacity={1 - 0.0 * a}>
        <rect x={30} y={146} width={170} height={36} rx={8} fill={C.caramel} />
        <T x={115} y={169} s={13} f={C.espresso} a="middle" w={700}>
          x * 1.2
        </T>
      </g>
      <Box x={290} y={80} w={260} h={44} label="WHERE ( … ) > 10" />
      <T x={300} y={236} s={14} f={C.crema} a="middle" o={easeOut(seg(t, 2.6, 3.4))}>
        the planner sees the expression: folds, pushes down
      </T>
    </Svg>
  );
}

// 9 · Predict: plpgsql. Before the answer the sql box's expression keeps sliding into the query. After it the
// plpgsql box tries the same, bounces off with a cross, and a padlock closes on it.
export function LanguagePredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const loop = (t * 0.7) % 1;
  const tryK = answered ? seg(s, 0.1, 0.9) : 0;
  const bounce = tryK < 0.6 ? tryK / 0.6 : 1 - (tryK - 0.6) / 0.4;
  return (
    <Svg label="The same body in LANGUAGE sql is inlined; in plpgsql it is always opaque" h={280}>
      <Box x={30} y={50} w={200} label="LANGUAGE sql" hi />
      <rect x={lerp(240, 330, easeInOut(loop))} y={62} width={40} height={20} rx={4} fill={C.caramel} opacity={1 - seg(loop, 0.85, 1)} />
      <T x={400} y={78} s={14} f={C.caramel} w={700}>
        inlined
      </T>
      <Box x={30} y={130} w={200} label="LANGUAGE plpgsql" bad={answered} />
      {answered && tryK < 1 && <rect x={lerp(240, 300, bounce)} y={142} width={40} height={20} rx={4} fill={C.cherryText} />}
      {!answered ? (
        <T x={290} y={164} s={44} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      ) : (
        <>
          <T x={330} y={158} s={20} f={C.cherryText} w={700} o={easeOut(seg(s, 0.5, 0.8))}>
            ✕
          </T>
          <T x={400} y={158} s={14} f={C.cherryText} w={700} o={easeOut(seg(s, 0.9, 1.2))}>
            opaque, always
          </T>
          <g opacity={easeOut(seg(s, 1.0, 1.3))}>
            <Lock x={196} y={118} open={0} color={C.cherryText} />
          </g>
        </>
      )}
    </Svg>
  );
}

// 10 · Froid. The imperative body types in line by line; then each line flies across and lands as a node in one
// relational tree of APPLY operators, and the tree's root lights.
export function Froid({ t }: StepCtx) {
  const lines = ['DECLARE @t = (SELECT …)', 'IF @t < 500 SET @c = ’A’', 'ELSE SET @c = ’B’', 'RETURN @c'];
  const nodes = [
    { x: 450, y: 60, l: 'APPLY' },
    { x: 380, y: 120, l: 'SELECT' },
    { x: 520, y: 120, l: 'CASE' },
    { x: 450, y: 180, l: 'result' },
  ];
  const go = (i: number) => easeInOut(seg(t, 1.6 + i * 0.3, 2.2 + i * 0.3));
  const root = easeOut(seg(t, 3.0, 3.4));
  return (
    <Svg label="An imperative UDF body becomes one relational expression built from APPLY" h={300}>
      <rect x={25} y={36} width={260} height={124} rx={8} fill={C.roast} stroke={C.mocha} />
      {lines.map((l, i) => {
        const typed = Math.floor(seg(t, 0.2 + i * 0.3, 0.5 + i * 0.3) * l.length);
        return (
          <T key={l} x={40} y={64 + i * 26} s={13} f={C.crema} o={1 - 0.6 * go(i)}>
            {l.slice(0, typed)}
          </T>
        );
      })}
      {nodes.map((n, i) => {
        const g = go(i);
        if (g <= 0) return null;
        return (
          <g key={n.l} transform={`translate(${lerp(150, n.x, g)} ${lerp(60 + i * 26, n.y, g)})`}>
            <rect x={-40} y={-14} width={80} height={28} rx={6} fill={C.cocoa} stroke={i === 0 && root > 0 ? C.caramel : C.mocha} strokeWidth={i === 0 && root > 0 ? 2 : 1} opacity={g < 1 ? 0.6 : 1} />
            {g >= 1 && (
              <T x={0} y={5} s={13} f={i === 0 && root > 0 ? C.caramel : C.crema} a="middle">
                {n.l}
              </T>
            )}
          </g>
        );
      })}
      {go(3) >= 1 && (
        <g stroke={C.taupe} strokeWidth={1.5}>
          <line x1={440} y1={74} x2={390} y2={106} />
          <line x1={460} y1={74} x2={510} y2={106} />
          <line x1={510} y1={134} x2={460} y2={166} />
        </g>
      )}
      <T x={300} y={240} s={14} f={C.crema} a="middle" o={easeOut(seg(t, 3.3, 3.8))}>
        SQL Server 2019 · no equivalent for plpgsql
      </T>
    </Svg>
  );
}

// 11 · Batches. A dashed boundary splits the engine from Python. Row at a time, single rows shuttle across one by
// one and the crossing counter races to 1,000; in Arrow batches, ten crates cross and the counter stops at 10.
export function Batches({ t }: StepCtx) {
  const a = seg(t, 0.4, 3.6);
  const B = 300;
  return (
    <Svg label="Row-at-a-time Python UDF crosses the boundary every row, a thousand times; a vectorized UDF sends ten Arrow batches" h={300}>
      <line x1={B} y1={20} x2={B} y2={210} stroke={C.latte} strokeDasharray="5 4" />
      <T x={B - 10} y={226} s={13} f={C.latte} a="end">
        engine
      </T>
      <T x={B + 10} y={226} s={13} f={C.latte}>
        Python
      </T>
      <T x={25} y={36} s={14} f={C.cherryText}>
        row at a time
      </T>
      <T x={575} y={36} s={14} f={C.cherryText} a="end" w={700}>
        {fmtN(1000 * a)} crossings
      </T>
      {Array.from({ length: 6 }, (_, i) => {
        const p = (a * 40 + i / 6) % 1;
        return a > 0 && a < 1 ? <rect key={i} x={lerp(60, 520, p)} y={58} width={7} height={22} rx={2} fill={C.cherry} /> : null;
      })}
      <T x={25} y={146} s={14} f={C.caramel}>
        Arrow batches
      </T>
      <T x={575} y={146} s={14} f={C.caramel} a="end" w={700}>
        {Math.round(10 * a)} crossings
      </T>
      {a > 0 && a < 1 && <rect x={lerp(60, 500, (a * 10) % 1)} y={164} width={60} height={26} rx={4} fill={C.caramel} />}
      <T x={300} y={276} s={18} f={C.crema} a="middle" w={700} o={easeOut(seg(t, 3.6, 4.2))}>
        3× to over 100× faster (Databricks)
      </T>
    </Svg>
  );
}

// 12 · Verdict with underlines and ticks; then the two prove-it checks.
export function Verdict({ t }: StepCtx) {
  const rows = [
    ['declare', 'volatility, parallel safety, cost', 420],
    ['small helpers', 'single-expression LANGUAGE sql', 400],
    ['still slow?', "look for the engine's way in", 370],
  ] as const;
  return (
    <Svg label="Three habits for user-defined functions" h={280}>
      {rows.map((r, i) => {
        const a = easeOut(seg(t, 0.1 + i * 0.6, 0.6 + i * 0.6));
        const u = easeInOut(seg(t, 0.5 + i * 0.6, 1.0 + i * 0.6));
        const y = 50 + i * 80;
        return (
          <g key={r[0]} opacity={clamp(a)} transform={`translate(${(1 - a) * -20} 0)`}>
            <T x={25} y={y} s={14} f={C.latte}>
              {r[0]}
            </T>
            <T x={25} y={y + 30} s={18} f={C.caramel} w={700}>
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

/** Prove it 1: three options; after the answer UNSAFE lights red and the padlock closes. */
export function ProveDefault({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const k = answered ? easeOutBack(seg(s, 0.1, 0.6)) : 0;
  const opts = ['SAFE', 'RESTRICTED', 'UNSAFE'];
  return (
    <Svg label="Default parallel safety: UNSAFE" h={240}>
      <T x={40} y={60} s={18} f={C.latte}>
        no PARALLEL clause →
      </T>
      {opts.map((o, i) => {
        const hit = i === 2;
        return (
          <g key={o} opacity={answered && !hit ? 1 - 0.6 * clamp(k) : 1} transform={`translate(0 ${hit ? -14 * clamp(k) : 0})`}>
            <rect x={40 + i * 170} y={100} width={150} height={40} rx={8} fill={C.cocoa} stroke={hit && k > 0 ? C.cherryText : C.mocha} strokeWidth={hit && k > 0 ? 2.5 : 1} />
            <T x={115 + i * 170} y={125} s={14} f={hit && k > 0 ? C.cherryText : C.crema} a="middle" w={hit ? 700 : 400}>
              {o}
            </T>
          </g>
        );
      })}
      {!answered && (
        <T x={300} y={200} s={36} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      )}
      <T x={300} y={200} s={14} f={C.latte} a="middle" o={answered ? easeOut(seg(s, 0.6, 1.0)) : 0}>
        the cautious default
      </T>
    </Svg>
  );
}
/** Prove it 2: sql and plpgsql chips; after the answer sql lifts and lights, plpgsql gets a closed lock. */
export function ProveLanguage({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const k = answered ? easeOutBack(seg(s, 0.1, 0.6)) : 0;
  return (
    <Svg label="The only language PostgreSQL inlines: sql" h={240}>
      <T x={40} y={60} s={18} f={C.latte}>
        inlined if LANGUAGE
      </T>
      <g transform={`translate(0 ${-14 * clamp(k)})`}>
        <rect x={40} y={100} width={150} height={40} rx={8} fill={C.cocoa} stroke={k > 0 ? C.caramel : C.mocha} strokeWidth={k > 0 ? 2.5 : 1} />
        <T x={115} y={125} s={16} f={k > 0 ? C.caramel : C.crema} a="middle" w={700}>
          sql
        </T>
      </g>
      <g opacity={answered ? 1 - 0.5 * clamp(k) : 1}>
        <rect x={230} y={100} width={150} height={40} rx={8} fill={C.cocoa} stroke={C.mocha} />
        <T x={305} y={125} s={14} f={C.crema} a="middle">
          plpgsql
        </T>
      </g>
      {answered && <Lock x={390} y={112} open={0} color={C.cherryText} />}
      {!answered && (
        <T x={480} y={130} s={36} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      )}
    </Svg>
  );
}
