import { useEffect, useState } from 'react';
import { C, Draw, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// Analytical benchmark suites, drawn from the FACT-CHECK's quoted specifications: TPC-H's 8 tables and 22 queries,
// TPC-DS's skewed snowflake and 99 queries, ClickBench's one flat table and 43 queries, the Join Order Benchmark on
// IMDB, TPC-DI listed among TPC's Obsolete Workloads with TPC-A, TPC-APP, TPC-B, TPC-D and TPC-R, and the DeWitt
// clause. The eight-query vendor report is an unnumbered illustration of benchmarketing; 686 against 2,029 is the
// previous topic's own measured planner estimate.

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

/** A plain box with a centred label. */
const Box = ({
  x,
  y,
  w,
  h = 32,
  label,
  lit = false,
  o = 1,
  dash,
  stroke,
  f,
  fill,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  label: string;
  lit?: boolean;
  o?: number;
  dash?: string;
  stroke?: string;
  f?: string;
  fill?: string;
}) =>
  o <= 0 ? null : (
    <g opacity={Math.min(1, o)}>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={fill ?? C.panel} stroke={stroke ?? (lit ? C.focus : C.line)} strokeWidth={lit ? 1.8 : 1.1} strokeDasharray={dash} />
      <T x={x + w / 2} y={y + h / 2 + 5} s={13} f={f ?? (lit ? C.focus : C.primary)} a="middle">
        {label}
      </T>
    </g>
  );

/** A label-left / value-right line under a drawing. */
const Line2 = ({ y, l, r, o, rc = C.focus, lc = C.secondary, lx = 30 }: { y: number; l: string; r: string; o: number; rc?: string; lc?: string; lx?: number }) =>
  o <= 0 ? null : (
    <g opacity={Math.min(1, o)}>
      <T x={lx} y={y} s={14} f={lc}>
        {l}
      </T>
      <T x={575} y={y} s={14} f={rc} a="end">
        {r}
      </T>
    </g>
  );

/** A check mark. */
const Tick = ({ x, y, k, color = C.focus }: { x: number; y: number; k: number; color?: string }) =>
  k <= 0 ? null : <path d={`M${x - 5} ${y} l4 4 l8 -9`} fill="none" stroke={color} strokeWidth={2} opacity={k} />;

/** A red ✕. */
const Cross = ({ x, y, k }: { x: number; y: number; k: number }) =>
  k <= 0 ? null : (
    <g stroke={C.badText} strokeWidth={2.4} opacity={k}>
      <line x1={x - 6} y1={y - 6} x2={x + 6} y2={y + 6} />
      <line x1={x + 6} y1={y - 6} x2={x - 6} y2={y + 6} />
    </g>
  );

/** A small table glyph. */
const Tb = ({ x, y, w = 34, h = 22, c = C.line, o = 1 }: { x: number; y: number; w?: number; h?: number; c?: string; o?: number }) =>
  o <= 0 ? null : (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={h} rx={2} fill={C.panel} stroke={c} strokeWidth={1.1} />
      <rect x={x} y={y} width={w} height={5} rx={1} fill={c} opacity={0.7} />
    </g>
  );

// An illustrative eight-query report (no vendor's real numbers): which engine wins each query. The vendor publishes
// only the queries it wins; every number it shows is still true.
const WINS = [true, false, true, true, false, true, false, true];

// 0 · The vendor's report: two bars per query, the vendor's shorter every time, each with ✓ "true, reproducible". Then
// the customer's own workload: the same two engines, and the vendor's bar is the longer one.
export function Hook({ t }: StepCtx) {
  const flip = easeInOut(seg(t, 2.2, 3.0));
  return (
    <Svg label="a vendor's benchmark report is independently reproducible and true, and a customer who adopts it still finds the engine slower on their own workload." h={220}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <T x={25} y={22} s={12} f={C.secondary}>
          the vendor's report
        </T>
        {[0, 1, 2].map((i) => {
          const k = easeOut(seg(t, 0.3 + i * 0.25, 0.6 + i * 0.25));
          return (
            <g key={i} opacity={k}>
              <rect x={25} y={36 + i * 40} width={70 * k} height={12} fill={C.focus} />
              <rect x={25} y={50 + i * 40} width={150 * k} height={12} fill={C.line} />
              <Tick x={196} y={50 + i * 40} k={easeOut(seg(t, 1.1 + i * 0.15, 1.3 + i * 0.15))} />
            </g>
          );
        })}
        <T x={25} y={170} s={12} f={C.focus} o={easeOut(seg(t, 1.4, 1.7))}>
          every number true
        </T>
      </g>
      <g opacity={easeOut(seg(t, 1.9, 2.2))}>
        <T x={320} y={22} s={12} f={C.secondary}>
          the customer's workload
        </T>
        <rect x={320} y={56} width={lerp(70, 210, flip)} height={16} fill={flip > 0.5 ? C.badText : C.focus} />
        <rect x={320} y={80} width={lerp(150, 120, flip)} height={16} fill={C.line} />
        <T x={320} y={120} s={12} f={flip > 0.5 ? C.badText : C.focus}>
          vendor
        </T>
        <T x={390} y={120} s={12} f={C.quiet}>
          competitor
        </T>
      </g>
      <T x={575} y={170} s={13} f={C.badText} a="end" o={easeOut(seg(t, 3.0, 3.3))}>
        slower, on their own data
      </T>
    </Svg>
  );
}

// 1 · Eight queries, each won by one engine or the other. "How?" After the answer the queries the vendor lost slide out
// to a "left out" pile: what remains is all true. Then the competitor's publish button gets a lock: a licence clause.
export function PredictHowCanBothBeTrue({ t, answer }: StepCtx) {
  const on = answer !== null;
  const s = useSinceAnswer(on);
  const cut = on ? easeInOut(seg(s, 0.2, 1.0)) : 0;
  let lost = 0;
  return (
    <Svg label="how can every published number be true and the comparison still mislead, and what licence term would stop a correction?" h={180}>
      {WINS.map((w, i) => {
        const j = w ? -1 : lost++;
        const x = w ? 25 + i * 42 : lerp(25 + i * 42, 420 + j * 42, cut);
        const y = w ? 30 : 30 + 56 * Math.sin(Math.PI * cut);
        return (
          <g key={i} opacity={easeOut(seg(t, 0.1 + i * 0.1, 0.4 + i * 0.1)) * (w ? 1 : 1 - 0.5 * cut)}>
            <rect x={x} y={y} width={34} height={40} rx={3} fill={C.panel} stroke={w ? C.focus : C.badText} strokeWidth={1.2} />
            <T x={x + 17} y={y + 26} s={11} f={w ? C.focus : C.badText} a="middle">
              {`Q${i + 1}`}
            </T>
          </g>
        );
      })}
      <T x={575} y={110} s={14} f={C.focus} a="end" o={on ? 0 : easeOut(seg(t, 1.0, 1.4))}>
        all true, still misleading: how?
      </T>
      {on && (
        <g>
          {s > 1.0 && (
            <T x={420} y={90} s={12} f={C.badText} o={easeOut(seg(s, 1.0, 1.3))}>
              left out
            </T>
          )}
          {s > 1.0 && (
            <T x={25} y={90} s={12} f={C.focus} o={easeOut(seg(s, 1.0, 1.3))}>
              published: all true
            </T>
          )}
          <g opacity={easeOut(seg(s, 1.3, 1.7))}>
            <Box x={25} y={124} w={150} label="publish a fix" f={C.secondary} />
            <rect x={190} y={134} width={18} height={14} rx={2} fill="none" stroke={C.badText} strokeWidth={1.6} />
            <path d="M193 134 v-5 a6 6 0 0 1 12 0 v5" fill="none" stroke={C.badText} strokeWidth={1.6} />
            <T x={222} y={145} s={12} f={C.badText}>
              a licence clause forbids it
            </T>
          </g>
        </g>
      )}
    </Svg>
  );
}

// 2 · TPC-H on the left: eight tables appear and 22 query ticks fill below. TPC-DS on the right: a snowflake of fact and
// dimension tables branches outward, skewed, and 99 query ticks fill below it.
export function RevealTpcHTpcDs({ t }: StepCtx) {
  const h = Math.floor(seg(t, 1.0, 1.8) * 22);
  const d = Math.floor(seg(t, 2.4, 3.6) * 99);
  const snow: [number, number][] = [
    [420, 70],
    [370, 40],
    [470, 40],
    [370, 100],
    [470, 100],
    [320, 20],
    [520, 20],
    [320, 120],
    [520, 120],
    [420, 20],
    [420, 120],
  ];
  return (
    <Svg label="TPC-H's eight tables and twenty-two queries, beside TPC-DS's larger, skewed snowflake schema and ninety-nine queries." h={240}>
      <T x={25} y={16} s={12} f={C.secondary} o={easeOut(seg(t, 0.1, 0.4))}>
        TPC-H: 8 tables
      </T>
      {Array.from({ length: 8 }, (_, i) => (
        <Tb key={i} x={25 + (i % 4) * 56} y={32 + Math.floor(i / 4) * 40} o={easeOut(seg(t, 0.2 + i * 0.08, 0.4 + i * 0.08))} />
      ))}
      {Array.from({ length: h }, (_, i) => (
        <rect key={i} x={25 + (i % 11) * 20} y={128 + Math.floor(i / 11) * 14} width={14} height={9} rx={1} fill={C.secondary} />
      ))}
      <T x={25} y={176} s={12} f={C.focus} o={h >= 22 ? 1 : 0}>
        22 queries
      </T>
      <T x={300} y={16} s={12} f={C.second} o={easeOut(seg(t, 2.0, 2.3))}>
        TPC-DS: snowflake, skewed
      </T>
      {snow.map(([x, y], i) => (
        <g key={i} opacity={easeOut(seg(t, 1.9 + i * 0.05, 2.2 + i * 0.05))}>
          {i > 0 && <line x1={437} y1={81} x2={x + 17} y2={y + 11} stroke={C.line} strokeWidth={0.8} />}
          <Tb x={x} y={y + 16} w={i === 0 ? 34 : 26} h={i === 0 ? 22 : 16} c={i === 0 ? C.second : C.line} />
        </g>
      ))}
      {Array.from({ length: d }, (_, i) => (
        <rect key={i} x={300 + (i % 25) * 11} y={160 + Math.floor(i / 25) * 11} width={8} height={8} rx={1} fill={C.second} />
      ))}
      <T x={575} y={232} s={12} f={C.second} a="end" o={d >= 99 ? 1 : 0}>
        99 queries
      </T>
    </Svg>
  );
}

// 3 · ClickBench: one wide flat table, many columns. 43 query pulses fire at it, one after another — fast, comparable.
// Then two joined tables appear beside it with a red ✕: joins, never tested.
export function RevealClickBench({ t }: StepCtx) {
  const q = Math.floor(seg(t, 0.6, 2.6) * 43);
  const j = easeOut(seg(t, 2.9, 3.3));
  return (
    <Svg label="one wide table, forty-three queries, no joins — fast and comparable, at the cost of testing nothing about join performance." h={220}>
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <rect x={25} y={40} width={550} height={40} rx={3} fill={C.panel} stroke={C.secondary} strokeWidth={1.2} />
        {Array.from({ length: 30 }, (_, i) => (
          <line key={i} x1={25 + (i + 1) * 18} y1={40} x2={25 + (i + 1) * 18} y2={80} stroke={C.line} strokeWidth={0.6} />
        ))}
        <T x={25} y={28} s={12} f={C.secondary}>
          one wide table
        </T>
      </g>
      {Array.from({ length: q }, (_, i) => (
        <rect key={i} x={25 + (i % 22) * 25} y={96 + Math.floor(i / 22) * 16} width={18} height={10} rx={1} fill={C.primary} />
      ))}
      <T x={575} y={28} s={12} f={C.focus} a="end" o={q >= 43 ? 1 : 0}>
        43 queries
      </T>
      <g opacity={j}>
        <Tb x={25} y={150} />
        <Tb x={110} y={150} />
        <line x1={59} y1={161} x2={110} y2={161} stroke={C.badText} strokeWidth={1.4} strokeDasharray="3 3" />
        <Cross x={165} y={161} k={easeOut(seg(t, 3.2, 3.5))} />
        <T x={185} y={166} s={12} f={C.badText}>
          joins: never tested
        </T>
      </g>
      <T x={575} y={206} s={12} f={C.secondary} a="end" o={easeOut(seg(t, 3.5, 3.9))}>
        said in its own docs
      </T>
    </Svg>
  );
}

// 4 · The Join Order Benchmark on IMDB's real data: correlated columns, linked. A planner's estimate under uniformity and
// independence falls well short of the real count. Then the callback: this chapter's own 686 estimated against
// 2,029 actual, the same failure at small scale.
export function RevealJoinOrderBenchmark({ t }: StepCtx) {
  const est = easeOut(seg(t, 1.2, 1.7));
  const act = easeOut(seg(t, 1.7, 2.4));
  const back = easeOut(seg(t, 3.0, 3.4));
  return (
    <Svg label="a real, correlated dataset, built specifically because uniformity and independence assumptions fail on real data." h={220}>
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <T x={25} y={22} s={12} f={C.secondary}>
          IMDB: real, correlated
        </T>
        {['movie', 'cast', 'company', 'keyword'].map((l, i) => (
          <g key={l}>
            <Box x={25 + i * 130} y={34} w={110} h={28} label={l} />
            {i < 3 && <line x1={135 + i * 130} y1={48} x2={155 + i * 130} y2={48} stroke={C.second} strokeWidth={1.4} />}
          </g>
        ))}
      </g>
      <T x={25} y={104} s={11} f={C.quiet} o={est}>
        estimate, assuming uniform and independent
      </T>
      <rect x={25} y={112} width={150 * est} height={14} fill={C.secondary} />
      <T x={25} y={146} s={11} f={C.quiet} o={act}>
        real rows
      </T>
      <rect x={25} y={154} width={400 * act} height={14} fill={C.badText} />
      <T x={575} y={166} s={12} f={C.badText} a="end" o={easeOut(seg(t, 2.3, 2.6))}>
        frequently wrong
      </T>
      <T x={25} y={204} s={12} f={C.second} o={back}>
        this chapter: 686 estimated, 2,029 actual
      </T>
    </Svg>
  );
}

// 5 · TPC's own specifications list: TPC-DI, "data integration", slides down out of the current workloads into the
// "Obsolete Workloads" table, joining TPC-A, TPC-APP, TPC-B, TPC-D and TPC-R.
export function RevealTpcDiObsolete({ t }: StepCtx) {
  const mv = easeInOut(seg(t, 1.2, 2.2));
  const old = ['TPC-A', 'TPC-APP', 'TPC-B', 'TPC-D', 'TPC-R'];
  return (
    <Svg label="the only TPC specification aimed at data integration, now listed by TPC itself as obsolete." h={180}>
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <T x={25} y={20} s={12} f={C.secondary}>
          aimed at data integration
        </T>
        <rect x={25} y={100} width={550} height={68} rx={4} fill="none" stroke={C.line} strokeWidth={1.2} />
        <T x={35} y={118} s={11} f={C.quiet}>
          Obsolete Workloads
        </T>
        {old.map((o, i) => (
          <T key={o} x={35 + i * 80} y={150} s={12} f={C.quiet}>
            {o}
          </T>
        ))}
      </g>
      <g transform={`translate(${lerp(0, 410, mv)} ${lerp(0, 102, mv)})`}>
        <rect x={25} y={30} width={110} height={30} rx={4} fill={C.panel} stroke={mv > 0.9 ? C.secondary : C.focus} strokeWidth={1.4} />
        <T x={80} y={50} s={13} f={mv > 0.9 ? C.secondary : C.focus} a="middle">
          TPC-DI
        </T>
      </g>
    </Svg>
  );
}

// 6 · Three tricks and the one thing that beats them. The eight-query report again: the lost queries fade out —
// benchmarketing. The competitor's correction gets locked — the clause. Then a harness box re-runs everything itself and
// gets ✓: neither trick can block that.
export function RevealBenchmarketingDewitt({ t }: StepCtx) {
  const cut = easeInOut(seg(t, 0.6, 1.4));
  const lock = easeOut(seg(t, 2.0, 2.4));
  const rerun = easeOut(seg(t, 3.2, 3.6));
  return (
    <Svg label="benchmarketing picks which true number to publish; a DeWitt clause can forbid a competitor from publishing a correction at all." h={240}>
      <T x={25} y={20} s={12} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        benchmarketing
      </T>
      {WINS.map((w, i) => (
        <g key={i} opacity={easeOut(seg(t, 0, 0.3)) * (w ? 1 : 1 - 0.85 * cut)}>
          <rect x={25 + i * 38} y={30} width={30} height={32} rx={3} fill={C.panel} stroke={w ? C.focus : C.badText} strokeWidth={1.2} />
          <T x={40 + i * 38} y={51} s={10} f={w ? C.focus : C.badText} a="middle">
            {`Q${i + 1}`}
          </T>
        </g>
      ))}
      <T x={340} y={51} s={12} f={C.focus} o={cut}>
        true, but chosen
      </T>
      <g opacity={easeOut(seg(t, 1.6, 1.9))}>
        <T x={25} y={100} s={12} f={C.secondary}>
          the DeWitt clause
        </T>
        <Box x={25} y={110} w={170} label="publish a result" f={C.secondary} />
        <g opacity={lock}>
          <rect x={210} y={120} width={18} height={14} rx={2} fill="none" stroke={C.badText} strokeWidth={1.6} />
          <path d="M213 120 v-5 a6 6 0 0 1 12 0 v5" fill="none" stroke={C.badText} strokeWidth={1.6} />
          <T x={240} y={131} s={12} f={C.badText}>
            needs the vendor's approval
          </T>
        </g>
      </g>
      <g opacity={easeOut(seg(t, 2.9, 3.2))}>
        <T x={25} y={176} s={12} f={C.secondary}>
          a reproducible harness
        </T>
        <rect x={25} y={186} width={170} height={32} rx={4} fill={C.panel} stroke={C.second} strokeWidth={1.4} />
        <path d={`M${110 - 8} 202 a8 8 0 1 1 8 8`} fill="none" stroke={C.second} strokeWidth={1.4} transform={`rotate(${t * 120} 110 202)`} />
        <Tick x={215} y={202} k={rerun} />
        <T x={235} y={207} s={12} f={C.focus} o={rerun}>
          re-run it yourself
        </T>
      </g>
    </Svg>
  );
}

// 7 · Four lines with pictures: the suites' schemas (8 tables, a snowflake, one wide table, linked real tables), the
// trimmed report, the lock, the re-run loop.
export function Recap({ t }: StepCtx) {
  const L: [string, string][] = [
    ['each suite', 'stresses something real'],
    ['and skips', 'something just as real'],
    ['benchmarketing, the clause', 'the trap'],
    ['a reproducible harness', 'what resists it'],
  ];
  const k = (i: number) => easeOut(seg(t, 0.3 + i * 0.9, 0.7 + i * 0.9));
  return (
    <Svg label="five industry suites, each with its own declared shape and its own declared blind spot, and the trap a reproducible harness resists." h={300}>
      {L.map(([a, b], i) => (
        <g key={a} opacity={k(i)}>
          <T x={25} y={40 + i * 70} s={13} f={C.secondary}>
            {a}
          </T>
          <T x={25} y={62 + i * 70} s={13} f={C.primary}>
            {b}
          </T>
        </g>
      ))}
      <g opacity={k(0)}>
        {[0, 1, 2, 3].map((j) => (
          <Tb key={j} x={445 + j * 33} y={30} w={26} h={18} c={C.focus} />
        ))}
      </g>
      <g opacity={k(1)}>
        <Tb x={445} y={100} w={60} h={18} />
        <line x1={505} y1={109} x2={530} y2={109} stroke={C.badText} strokeDasharray="3 3" />
        <Cross x={548} y={109} k={1} />
      </g>
      <g opacity={k(2)}>
        {WINS.map((w, j) => (
          <rect key={j} x={445 + j * 15} y={170} width={11} height={18} rx={1} fill="none" stroke={w ? C.focus : C.badText} opacity={w ? 1 : 1 - 0.8 * easeOut(seg(t, 2.6, 3.0))} />
        ))}
      </g>
      <g opacity={k(3)}>
        <path d="M498 242 a12 12 0 1 1 12 12" fill="none" stroke={C.second} strokeWidth={1.6} transform={`rotate(${t * 120} 510 242)`} />
        <Tick x={545} y={244} k={1} />
      </g>
    </Svg>
  );
}

// 8 · The chapter's bundle: load generator, data generator, small baseline, packed into one box and run by one
// command. "Proves what?" After the answer "a sixth industry suite" is struck, and four checks light under "the
// method": warmed-up target, honest load, representative data, re-runnable by anyone.
export function ProveIt({ t, answer }: StepCtx) {
  const on = answer !== null;
  const s = useSinceAnswer(on);
  const items = ['load generator', 'data generator', 'small baseline'];
  const checks = ['warmed-up target', 'honest load', 'representative data', 'anyone can re-run it'];
  return (
    <Svg label="the chapter's harness, generator and this topic's own small baseline, published together as one committed bundle." h={200}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <rect x={25} y={14} width={200} height={110} rx={6} fill="none" stroke={C.secondary} strokeWidth={1.3} />
        {items.map((it, i) => (
          <T key={it} x={40} y={42 + i * 30} s={12} f={C.primary} o={easeOut(seg(t, 0.2 + i * 0.25, 0.5 + i * 0.25))}>
            {it}
          </T>
        ))}
        <T x={25} y={146} s={12} f={C.second} o={easeOut(seg(t, 1.2, 1.5))}>
          one command
        </T>
      </g>
      <T x={575} y={70} s={14} f={C.focus} a="end" o={on ? 0 : easeOut(seg(t, 1.6, 2.0))}>
        proves what?
      </T>
      {on && (
        <g>
          <g opacity={easeOut(seg(s, 0.1, 0.4))}>
            <T x={260} y={34} s={12} f={C.secondary}>
              a sixth industry suite
            </T>
            <line x1={258} y1={30} x2={258 + 21 * 7.8 * easeOut(seg(s, 0.4, 0.7))} y2={30} stroke={C.badText} strokeWidth={1.6} />
          </g>
          <T x={260} y={66} s={13} f={C.focus} o={easeOut(seg(s, 0.8, 1.1))}>
            the method:
          </T>
          {checks.map((c, i) => (
            <g key={c} opacity={easeOut(seg(s, 1.0 + i * 0.25, 1.3 + i * 0.25))}>
              <Tick x={268} y={88 + i * 26} k={1} />
              <T x={285} y={93 + i * 26} s={12} f={C.primary}>
                {c}
              </T>
            </g>
          ))}
        </g>
      )}
    </Svg>
  );
}
