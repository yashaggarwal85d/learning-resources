import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { C, Draw, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, chapter 37): crema = textbook structure/in-memory data; latte =
// secondary labels; caramel = the thing to look at (the watched chain A→B→C→D); cinnamon (rare)
// = the system's modification vs the textbook, here the narrower long chain N that changes the
// story; cherry/cherryText = bad outcome (a later finish, a cycle).
//
// Every printed number is examples.py's: the durations (A 1, B C D 3; W and its five children 1;
// N 1, N1 N2 N3 4), the default weights 4, 6, 4 and the duration weights 10, 6, 13, every bar of
// every schedule (traced by examples.py's own schedule() on two workers; the lane each task is
// drawn in is the drawing's choice), D's finish at 10 and 11, both makespans 15, the critical
// path 13, Graham's 19.5, Kahn's stuck B, C, D and the depth-first search's C.

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

/** Which of n beats spread over [a, b] has started: -1 before a, then 0 to n - 1. */
const stepIdx = (x: number, a: number, b: number, n: number) => (x < a ? -1 : Math.min(n - 1, Math.floor(((x - a) / (b - a)) * n)));

type Bar = [string, number, number, number]; // task, lane, start, finish

/** examples.py's schedule() on two workers: A and W alone, default weights, then duration weights. */
const PAIR_DEFAULT: Bar[] = [['W', 0, 0, 1], ['A', 1, 0, 1], ['B', 0, 1, 4], ['W1', 1, 1, 2], ['W2', 1, 2, 3], ['W3', 1, 3, 4], ['C', 0, 4, 7], ['W4', 1, 4, 5], ['W5', 1, 5, 6], ['D', 0, 7, 10]];
const PAIR_DURATION: Bar[] = [['A', 0, 0, 1], ['W', 1, 0, 1], ['B', 0, 1, 4], ['W1', 1, 1, 2], ['W2', 1, 2, 3], ['W3', 1, 3, 4], ['C', 0, 4, 7], ['W4', 1, 4, 5], ['W5', 1, 5, 6], ['D', 0, 7, 10]];
/** The whole fourteen-task DAG on two workers, both rules. */
const ALL_DEFAULT: Bar[] = [['W', 0, 0, 1], ['A', 1, 0, 1], ['N', 0, 1, 2], ['B', 1, 1, 4], ['N1', 0, 2, 6], ['C', 1, 4, 7], ['N2', 0, 6, 10], ['D', 1, 7, 10], ['N3', 0, 10, 14], ['W1', 1, 10, 11], ['W2', 1, 11, 12], ['W3', 1, 12, 13], ['W4', 1, 13, 14], ['W5', 0, 14, 15]];
const ALL_DURATION: Bar[] = [['N', 0, 0, 1], ['A', 1, 0, 1], ['N1', 0, 1, 5], ['B', 1, 1, 4], ['C', 1, 4, 7], ['N2', 0, 5, 9], ['W', 1, 7, 8], ['D', 1, 8, 11], ['N3', 0, 9, 13], ['W1', 1, 11, 12], ['W2', 1, 12, 13], ['W3', 0, 13, 14], ['W4', 1, 13, 14], ['W5', 0, 14, 15]];

const fillOf = (task: string) => ('ABCD'.includes(task) ? C.caramel : task.startsWith('N') ? C.cinnamon : C.crema);

/** A two-lane Gantt chart, bars growing as the clock `now` passes them. */
function Gantt({ bars, x0, y0, sc, now, label, o = 1, dimOthers = false }: { bars: Bar[]; x0: number; y0: number; sc: number; now: number; label: string; o?: number; dimOthers?: boolean }) {
  return (
    <g opacity={o}>
      <T x={x0 - 8} y={y0 - 8} s={12} f={C.latte}>{label}</T>
      {[0, 1].map((l) => (
        <rect key={l} x={x0} y={y0 + l * 26} width={15 * sc} height={22} fill={C.cocoa} />
      ))}
      {bars.map(([task, lane, st, fin]) => {
        if (now <= st) return null;
        const w = (Math.min(now, fin) - st) * sc;
        const dim = dimOthers && !'ABCD'.includes(task);
        return (
          <g key={task} opacity={dim ? 0.45 : 1}>
            <rect x={x0 + st * sc + 1} y={y0 + lane * 26} width={Math.max(0, w - 2)} height={22} fill={fillOf(task)} />
            {now >= fin && (fin - st) * sc >= 22 && (
              <T x={x0 + ((st + fin) / 2) * sc} y={y0 + lane * 26 + 16} s={12} a="middle" f={C.ink}>{task}</T>
            )}
          </g>
        );
      })}
    </g>
  );
}

/** Question opacity: shown until the reveal starts, then gone at once. */
const rev = (ask: number, r: number) => (r > 0 ? 0 : ask);

// 1 · Hook: a chain and a fan-out compete for free slots
export function OrchestratorHook({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const a = easeOut(seg(t, 0.1, 0.9));
  const b = easeOut(seg(t, 1.0, 2.2));
  const ask = easeOut(seg(t, 2.6, 3.4));
  const r1 = answered ? easeOut(seg(s, 0.2, 1.0)) : 0;
  const r2 = answered ? easeOut(seg(s, 1.4, 2.2)) : 0;
  const chain = ['A', 'B', 'C', 'D'];
  const fan = ['W1', 'W2', 'W3', 'W4', 'W5'];
  // The free slots tick in; the chain grows downward one task at a time while the fan-out's five children spread out
  // from W. After the answer, W lifts off and flies into the first free slot: the default rule's pick.
  const slot = (i: number) => easeOut(seg(t, 0.1 + i * 0.02, 0.4 + i * 0.02));
  const grow = (i: number) => easeOut(seg(t, 1.0 + i * 0.3, 1.4 + i * 0.3));
  const spread = easeInOut(seg(t, 1.2, 2.2));
  const fly = answered ? easeInOut(seg(s, 0.6, 1.3)) : 0;
  const wx = lerp(420, 65.5, fly), wy = lerp(84, 41.5, fly) - Math.sin(Math.PI * fly) * 20;
  return (
    <Svg label="Four thousand tasks, two hundred ready, thirty-two free slots. Chain head A has three tasks below it, fan-out head W has five. After answering: W, weight 6 against A's 4, runs first, yet the chain's last task D finishes at 10 either way" h={290}>
      <g opacity={a}>
        <T x={300} y={24} s={12} a="middle" f={C.latte}>4,000 tasks · 200 ready · 32 free slots</T>
      </g>
      {Array.from({ length: 32 }).map((_, i) => (
        <rect key={i} x={60 + i * 15} y={36 + (1 - slot(i)) * 8} width={11} height={11} fill="none" stroke={C.mocha} opacity={slot(i)} />
      ))}
      <g opacity={b}>
        {chain.map((c, i) => {
          const k = grow(i);
          const y = lerp(84 + Math.max(0, i - 1) * 40, 84 + i * 40, k);
          return (
            <g key={c} opacity={i === 0 ? 1 : clamp(k * 2)}>
              {i > 0 && <line x1={150} y1={84 + (i - 1) * 40 + 12} x2={150} y2={Math.max(84 + (i - 1) * 40 + 12, y - 12)} stroke={C.mocha} strokeWidth={1.5} />}
              <circle cx={150} cy={y} r={12} fill={C.roast} stroke={C.caramel} strokeWidth={1.5} />
              <T x={150} y={y + 5} s={12} a="middle" f={C.caramel}>{c}</T>
            </g>
          );
        })}
        {fan.map((c, i) => {
          const x = lerp(420, 330 + i * 45, spread), y = lerp(96, 146, spread);
          return (
            <g key={c}>
              <line x1={420} y1={96} x2={x} y2={Math.max(96, y - 12)} stroke={C.mocha} strokeWidth={1.5} />
              <circle cx={x} cy={y} r={12} fill={C.roast} stroke={C.crema} strokeWidth={1.5} />
              <T x={x} y={y + 5} s={11} a="middle" f={C.crema}>{c}</T>
            </g>
          );
        })}
        {fly > 0 && <circle cx={420} cy={84} r={12} fill="none" stroke={C.mocha} strokeWidth={1} strokeDasharray="3 3" />}
        <g transform={`translate(${wx.toFixed(2)} ${wy.toFixed(2)}) scale(${lerp(1, 0.5, fly).toFixed(3)})`}>
          <circle cx={0} cy={0} r={12} fill={r1 > 0.5 ? C.caramel : C.roast} stroke={C.crema} strokeWidth={1.5} />
          <T x={0} y={5} s={12} a="middle" f={r1 > 0.5 ? C.ink : C.crema}>W</T>
        </g>
      </g>
      <T x={300} y={234} s={13} a="middle" f={C.caramel} o={rev(ask, r1)}>which runs first? which finishes sooner?</T>
      <g opacity={r1}>
        <T x={95} y={89} s={12} a="end" f={C.latte}>weight 4</T>
        <T x={480} y={89} s={12} f={C.caramel}>weight 6</T>
        <T x={420} y={196} s={12} a="middle" f={C.caramel}>W runs first</T>
      </g>
      <T x={300} y={lerp(270, 262, r2)} s={13} a="middle" f={C.crema} o={r2}>D finishes at 10 either way</T>
    </Svg>
  );
}

// 2 · Kahn's algorithm recap: in-degree counters fall to zero
export function KahnRecap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.8));
  const beat = stepIdx(t, 1.0, 4.2, 4);
  const fan = ['W1', 'W2', 'W3', 'W4', 'W5'];
  const labels = ['in-degree 0: ready', 'pop W', 'decrement its children', 'every child hit 0: push'];
  const zero = beat >= 2;
  return (
    <Svg label="W has in-degree zero, so it is ready. Pop W, decrement each child's in-degree from one to zero, and push every child that reached zero onto the ready queue" h={270}>
      <g opacity={a}>
        <circle cx={300} cy={56} r={16} fill={beat >= 1 ? C.mocha : C.roast} stroke={beat === 0 ? C.caramel : C.crema} strokeWidth={2} />
        <T x={300} y={61} s={12} a="middle" f={C.crema}>W</T>
        <T x={330} y={48} s={12} f={C.latte}>{beat >= 1 ? 'done' : 'in 0'}</T>
        {fan.map((c, i) => {
          const x = 120 + i * 90;
          return (
            <g key={c}>
              <line x1={300} y1={72} x2={x} y2={118} stroke={C.mocha} strokeWidth={1.5} opacity={zero ? 0.3 : 1} />
              <circle cx={x} cy={132} r={16} fill={C.roast} stroke={beat >= 3 ? C.caramel : C.crema} strokeWidth={2} />
              <T x={x} y={137} s={12} a="middle" f={C.crema}>{c}</T>
              <T x={x} y={172} s={12} a="middle" f={zero ? C.caramel : C.latte}>{zero ? 'in 0' : 'in 1'}</T>
            </g>
          );
        })}
      </g>
      <g opacity={a}>
        <T x={60} y={216} s={12} f={C.latte}>ready</T>
        <rect x={110} y={202} width={430} height={22} fill="none" stroke={C.mocha} />
        {beat === 0 && <rect x={114} y={206} width={40} height={14} fill={C.caramel} />}
        {beat >= 3 && fan.map((c, i) => <rect key={c} x={114 + i * 46} y={206} width={40} height={14} fill={C.caramel} opacity={easeOut(seg(t, 3.4 + i * 0.12, 3.8 + i * 0.12))} />)}
      </g>
      <T x={300} y={256} s={13} a="middle" f={C.caramel}>{beat >= 0 ? labels[beat] : ''}</T>
    </Svg>
  );
}

// 3 · The chapter's DAG, drawn left to right by duration
export function ChapterDag({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.1));
  const b = easeOut(seg(t, 1.4, 2.4));
  const c = easeOut(seg(t, 2.8, 3.8));
  const d = easeOut(seg(t, 4.2, 5.0));
  const sc = 30;
  const x0 = 90;
  const box = (task: string, st: number, dur: number, y: number, fill: string, o: number, h = 22) => (
    <g key={task} opacity={o}>
      <rect x={x0 + st * sc + 1} y={y} width={Math.max(0, dur * sc * o - 2)} height={h} fill={fill} />
      {dur * sc >= 28 && <T x={x0 + (st + dur / 2) * sc} y={y + h / 2 + 5} s={12} a="middle" f={C.ink}>{task}</T>}
    </g>
  );
  return (
    <Svg label="The chain A, B, C, D: one plus three plus three plus three. The fan-out: W then five one-unit children side by side. The narrower chain N: one, then three tasks of four each, longer than either. Fourteen tasks, two workers" h={290}>
      <T x={20} y={46} s={12} f={C.caramel} o={a}>chain</T>
      {box('A', 0, 1, 30, C.caramel, a)}
      {box('B', 1, 3, 30, C.caramel, a)}
      {box('C', 4, 3, 30, C.caramel, a)}
      {box('D', 7, 3, 30, C.caramel, a)}
      <T x={20} y={98} s={12} f={C.crema} o={b}>fan-out</T>
      {box('W', 0, 1, 82, C.crema, b)}
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={x0 + sc + 1} y={74 + i * 14} width={(sc - 2) * b} height={10} fill={C.crema} opacity={b} />
      ))}
      <T x={x0 + 2 * sc + 8} y={110} s={12} f={C.latte} o={b}>five short tasks</T>
      <T x={20} y={174} s={12} f={C.cinnamon} o={c}>later</T>
      {box('N', 0, 1, 158, C.cinnamon, c)}
      {box('N1', 1, 4, 158, C.cinnamon, c)}
      {box('N2', 5, 4, 158, C.cinnamon, c)}
      {box('N3', 9, 4, 158, C.cinnamon, c)}
      <g opacity={a}>
        <line x1={x0} y1={200} x2={x0 + 13 * sc} y2={200} stroke={C.mocha} />
        {[0, 5, 10, 13].map((v) => (
          <T key={v} x={x0 + v * sc} y={218} s={12} a="middle" f={C.taupe}>{v}</T>
        ))}
      </g>
      <T x={300} y={256} s={13} a="middle" f={C.crema} o={d}>14 tasks, 2 workers</T>
    </Svg>
  );
}

// 4 · Airflow's docs: the default weight is a sum over descendants, not a longest chain
export function AirflowWeightDocs({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.9));
  const not = easeOut(seg(t, 3.9, 4.6));
  // The quoted rule lands and its key phrase is underlined. Then the rule is run: each task's own 1 slides out of the
  // task's name and stacks into its row, and the row's total counts up as the ones arrive: 4 for A, 6 for W.
  const one = (start: number, i: number) => easeOut(seg(t, start + i * 0.27, start + 0.35 + i * 0.27));
  const sumA = [0, 1, 2, 3].reduce((acc, i) => acc + (one(1.0, i) >= 1 ? 1 : 0), 0);
  const sumW = [0, 1, 2, 3, 4, 5].reduce((acc, i) => acc + (one(2.0, i) >= 1 ? 1 : 0), 0);
  return (
    <Svg label="priority_weight defaults to one. The downstream rule sums it over every descendant: A gets one plus one plus one plus one, four; W gets one plus five ones, six. A sum over descendants, not the longest chain" h={270}>
      <g opacity={a}>
        <T x={300} y={26} s={12} a="middle" f={C.latte}>priority_weight: default 1, any integer</T>
        <T x={300} y={52} s={13} a="middle" f={C.crema}>downstream: own + sum over descendants</T>
      </g>
      {/* underline under "sum over descendants"; it scales with the text on phones (--svg-text-scale) */}
      <g style={{ transform: 'scaleX(var(--svg-text-scale, 1))', transformOrigin: '300px 0px', transformBox: 'view-box' }}>
        <Draw pts={[[292, 60], [449, 60]]} t={t} from={0.7} to={1.2} stroke={C.caramel} w={1.6} />
      </g>
      <T x={40} y={104} s={13} f={C.caramel} o={a}>A</T>
      {[0, 1, 2, 3].map((i) => {
        const k = one(1.0, i);
        return k > 0 ? (
          <g key={i} opacity={clamp(k * 2)} transform={`translate(${((1 - k) * (40 - (80 + i * 44))).toFixed(2)} 0)`}>
            <rect x={80 + i * 44} y={88} width={36} height={22} fill={C.caramel} />
            <T x={98 + i * 44} y={104} s={12} a="middle" f={C.ink}>1</T>
          </g>
        ) : null;
      })}
      <T x={270} y={104} s={14} f={C.caramel} o={sumA > 0 ? 1 : 0}>{`= ${sumA}`}</T>
      <T x={40} y={154} s={13} f={C.crema} o={a}>W</T>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const k = one(2.0, i);
        return k > 0 ? (
          <g key={i} opacity={clamp(k * 2)} transform={`translate(${((1 - k) * (40 - (80 + i * 44))).toFixed(2)} 0)`}>
            <rect x={80 + i * 44} y={138} width={36} height={22} fill={C.crema} />
            <T x={98 + i * 44} y={154} s={12} a="middle" f={C.ink}>1</T>
          </g>
        ) : null;
      })}
      <T x={358} y={154} s={14} f={C.crema} o={sumW > 0 ? 1 : 0}>{`= ${sumW}`}</T>
      <g opacity={not}>
        <T x={300} y={212} s={13} a="middle" f={C.caramel}>a sum over descendants</T>
        <T x={300} y={242} s={13} a="middle" f={C.cherryText}>not the longest chain below</T>
      </g>
    </Svg>
  );
}

// 5 · The formula, and why a set: a descendant reached two ways counts once
export function DownstreamFormula({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.9));
  const p1 = easeInOut(seg(t, 1.2, 2.2));
  const p2 = easeInOut(seg(t, 2.2, 3.2));
  const set = easeOut(seg(t, 3.5, 4.3));
  const once = easeOut(seg(t, 4.6, 5.4));
  const X = [130, 60], Y = [80, 130], Z = [180, 130], Q = [130, 200];
  return (
    <Svg label="weight equals own weight plus the weight of every id in get_flat_relative_ids. In a diamond, Q is reached along two routes, but the method returns a set, so Q appears once" h={270}>
      <g opacity={a}>
        <T x={420} y={60} s={13} a="middle" f={C.crema} serif>weight = own + Σ own(d)</T>
        <T x={420} y={86} s={12} a="middle" f={C.latte}>d in get_flat_relative_ids</T>
        {[[X, Y], [X, Z], [Y, Q], [Z, Q]].map(([u, v], i) => (
          <line key={i} x1={u[0]} y1={u[1]} x2={v[0]} y2={v[1]} stroke={C.mocha} strokeWidth={1.5} />
        ))}
      </g>
      <line x1={X[0]} y1={X[1]} x2={lerp(X[0], Y[0], Math.min(1, p1 * 2))} y2={lerp(X[1], Y[1], Math.min(1, p1 * 2))} stroke={C.caramel} strokeWidth={2.5} />
      {p1 > 0.5 && <line x1={Y[0]} y1={Y[1]} x2={lerp(Y[0], Q[0], (p1 - 0.5) * 2)} y2={lerp(Y[1], Q[1], (p1 - 0.5) * 2)} stroke={C.caramel} strokeWidth={2.5} />}
      <line x1={X[0]} y1={X[1]} x2={lerp(X[0], Z[0], Math.min(1, p2 * 2))} y2={lerp(X[1], Z[1], Math.min(1, p2 * 2))} stroke={C.cinnamon} strokeWidth={2.5} opacity={p2 > 0 ? 1 : 0} />
      {p2 > 0.5 && <line x1={Z[0]} y1={Z[1]} x2={lerp(Z[0], Q[0], (p2 - 0.5) * 2)} y2={lerp(Z[1], Q[1], (p2 - 0.5) * 2)} stroke={C.cinnamon} strokeWidth={2.5} />}
      {[['X', X], ['Y', Y], ['Z', Z], ['Q', Q]].map(([n, p]) => (
        <g key={n as string} opacity={a}>
          <circle cx={(p as number[])[0]} cy={(p as number[])[1]} r={14} fill={C.roast} stroke={n === 'Q' && p2 >= 1 ? C.caramel : C.crema} strokeWidth={1.5} />
          <T x={(p as number[])[0]} y={(p as number[])[1] + 5} s={12} a="middle" f={C.crema}>{n as string}</T>
        </g>
      ))}
      <g opacity={set}>
        <T x={420} y={146} s={12} a="middle" f={C.latte}>returns set[str]</T>
        <T x={420} y={176} s={15} a="middle" f={C.caramel}>{'{ Y, Z, Q }'}</T>
      </g>
      <T x={420} y={216} s={12} a="middle" f={C.crema} o={once}>Q counted once, not once per path</T>
    </Svg>
  );
}

// 6 · The prediction measured: W first by default, D finishes at 10 either way
export function PredictionMeasured({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.8));
  const now1 = lerp(0, 10, seg(t, 0.6, 3.0));
  const now2 = lerp(0, 10, seg(t, 2.6, 4.6));
  const line = easeOut(seg(t, 4.7, 5.4));
  const sc = 40;
  const x0 = 80;
  return (
    <Svg label="Two workers. Default weights, W 6 and A 4: W starts first. The other order, A first. In both schedules the chain's last task D ends at 10" h={280}>
      <Gantt bars={PAIR_DEFAULT} x0={x0} y0={40} sc={sc} now={now1} label="default: W (6) before A (4)" o={a} />
      <Gantt bars={PAIR_DURATION} x0={x0} y0={140} sc={sc} now={now2} label="the other order: A first" o={now2 > 0 ? 1 : 0} />
      <g opacity={line}>
        <line x1={x0 + 10 * sc} y1={30} x2={x0 + 10 * sc} y2={196} stroke={C.caramel} strokeWidth={2} strokeDasharray="4 3" />
        <T x={x0 + 10 * sc} y={222} s={13} a="middle" f={C.caramel}>D ends at 10, both</T>
      </g>
      <T x={300} y={260} s={12} a="middle" f={C.latte} o={line}>the order changed, the finish did not</T>
    </Svg>
  );
}

// 7 · Weight set to duration: the same formula now ranks the chain first
export function DurationWeighted({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.9));
  const flip = easeInOut(seg(t, 1.4, 2.6));
  const swap = easeInOut(seg(t, 2.9, 3.9));
  const note = easeOut(seg(t, 4.3, 5.1));
  const aW = flip > 0.5 ? '1+3+3+3 = 10' : '1+1+1+1 = 4';
  const wW = '1+1+1+1+1+1 = 6';
  return (
    <Svg label="Own weight becomes own duration. A's weight goes from four to one plus three plus three plus three, ten. W's stays six, its tasks all last one. The ready queue reorders: A now ahead of W" h={270}>
      <T x={300} y={26} s={12} a="middle" f={C.latte} o={a}>own weight: 1 → own duration</T>
      <g opacity={a}>
        <T x={60} y={78} s={13} f={C.caramel}>A</T>
        <T x={100} y={78} s={13} f={flip > 0.5 ? C.caramel : C.crema}>{aW}</T>
        <T x={60} y={112} s={13} f={C.crema}>W</T>
        <T x={100} y={112} s={13} f={C.crema}>{wW}</T>
      </g>
      <g opacity={a}>
        <T x={60} y={164} s={12} f={C.latte}>ready queue</T>
        <rect x={180} y={150} width={60} height={24} fill={C.roast} stroke={C.mocha} />
        <rect x={250} y={150} width={60} height={24} fill={C.roast} stroke={C.mocha} />
        <T x={lerp(270, 210, swap)} y={167 - 22 * Math.sin(Math.PI * swap)} s={13} a="middle" f={C.caramel}>A</T>
        <T x={lerp(210, 270, swap)} y={167 + 22 * Math.sin(Math.PI * swap)} s={13} a="middle" f={C.crema}>W</T>
        <T x={340} y={167} s={12} f={C.latte}>{swap > 0.5 ? 'A runs first' : 'W runs first'}</T>
      </g>
      <g opacity={note}>
        <T x={300} y={222} s={13} a="middle" f={C.crema}>what a user must set by hand</T>
        <T x={300} y={250} s={12} a="middle" f={C.latte}>Airflow has no critical-path rule</T>
      </g>
    </Svg>
  );
}

// 8 · The third branch: the two rules diverge, and duration-weighting finishes D later
export function ThreeWayDivergence({ t }: StepCtx) {
  const now1 = lerp(0, 15, seg(t, 0.3, 2.6));
  const now2 = lerp(0, 15, seg(t, 2.4, 4.7));
  const mark = easeOut(seg(t, 4.9, 5.6));
  const sc = 30;
  const x0 = 80;
  return (
    <Svg label="The whole DAG on two workers. Default weights: D ends at 10. Duration weights start N first, and D ends at 11, later. Both schedules end at 15" h={290}>
      <Gantt bars={ALL_DEFAULT} x0={x0} y0={36} sc={sc} now={now1} label="default rule" dimOthers={mark > 0} />
      <Gantt bars={ALL_DURATION} x0={x0} y0={136} sc={sc} now={now2} label="duration rule" o={now2 > 0 ? 1 : 0} dimOthers={mark > 0} />
      <g opacity={mark}>
        <line x1={x0 + 10 * sc} y1={30} x2={x0 + 10 * sc} y2={88} stroke={C.caramel} strokeWidth={2} />
        <T x={x0 + 10 * sc} y={110} s={12} a="middle" f={C.caramel}>D at 10</T>
        <line x1={x0 + 11 * sc} y1={130} x2={x0 + 11 * sc} y2={188} stroke={C.cherryText} strokeWidth={2} />
        <T x={x0 + 11 * sc} y={210} s={12} a="middle" f={C.cherryText}>D at 11</T>
        <T x={300} y={248} s={13} a="middle" f={C.cherryText}>duration-weighting: later, here</T>
        <T x={300} y={274} s={12} a="middle" f={C.latte}>one measured DAG, not a general claim</T>
      </g>
    </Svg>
  );
}

// 9 · Unlimited workers: the makespan is the longest chain by duration, N's at 13
export function UnlimitedCriticalPath({ t }: StepCtx) {
  const now = lerp(0, 13, seg(t, 0.4, 3.4));
  const mark = easeOut(seg(t, 3.6, 4.4));
  const sc = 30;
  const x0 = 90;
  const rows: [string, number, number, number][] = [
    ['A', 0, 0, 1], ['B', 0, 1, 4], ['C', 0, 4, 7], ['D', 0, 7, 10],
    ['W', 1, 0, 1], ['W1', 1, 1, 2],
    ['N', 2, 0, 1], ['N1', 2, 1, 5], ['N2', 2, 5, 9], ['N3', 2, 9, 13],
  ];
  return (
    <Svg label="With no worker limit every chain starts at once. The watched chain ends at 10; the narrower chain N, one plus four plus four plus four, ends at 13: the makespan is that longest chain" h={270}>
      <T x={300} y={24} s={12} a="middle" f={C.latte}>no worker limit: every ready task starts</T>
      {['chain', 'fan-out', 'N'].map((l, i) => (
        <T key={l} x={x0 - 10} y={58 + i * 40} s={12} a="end" f={i === 2 ? C.cinnamon : i === 0 ? C.caramel : C.crema}>{l}</T>
      ))}
      {rows.map(([task, row, st, fin]) => {
        if (now <= st) return null;
        const w = (Math.min(now, fin) - st) * sc;
        return (
          <g key={task}>
            <rect x={x0 + st * sc + 1} y={42 + row * 40} width={Math.max(0, w - 2)} height={22} fill={fillOf(task)} />
            {now >= fin && (fin - st) * sc >= 28 && <T x={x0 + ((st + fin) / 2) * sc} y={58 + row * 40} s={12} a="middle" f={C.ink}>{task}</T>}
          </g>
        );
      })}
      <T x={x0 + 2 * sc + 6} y={98} s={12} f={C.latte} o={now >= 2 ? 1 : 0}>×5</T>
      <g opacity={mark}>
        <line x1={x0 + 10 * sc} y1={36} x2={x0 + 10 * sc} y2={150} stroke={C.caramel} strokeWidth={1.5} strokeDasharray="4 3" />
        <T x={x0 + 10 * sc} y={172} s={12} a="middle" f={C.caramel}>10</T>
        <line x1={x0 + 13 * sc} y1={36} x2={x0 + 13 * sc} y2={150} stroke={C.cinnamon} strokeWidth={2} />
        <T x={x0 + 13 * sc} y={172} s={12} a="middle" f={C.cinnamon}>13</T>
        <T x={300} y={214} s={13} a="middle" f={C.cinnamon}>makespan = longest chain = 13</T>
        <T x={300} y={242} s={12} a="middle" f={C.latte}>N's chain, not the watched one</T>
      </g>
    </Svg>
  );
}

// 10 · Graham's bound: any ready-queue order stays within (2 - 1/m) times the optimum
export function GrahamBound({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.9));
  const lo = easeOut(seg(t, 1.0, 1.8));
  const bound = easeOut(seg(t, 2.0, 2.9));
  const runs = easeOut(seg(t, 3.2, 4.0));
  const x = (v: number) => 60 + v * 24;
  return (
    <Svg label="Makespan at most two minus one over m, times the optimum. The critical path, 13, is a floor on the optimum; at m equal 2 the bound is 19.5. Both measured schedules end at 15, inside it" h={260}>
      <T x={300} y={30} s={14} a="middle" f={C.crema} serif o={a}>makespan ≤ (2 − 1/m) · optimal</T>
      <g opacity={a}>
        <line x1={x(0)} y1={130} x2={x(20)} y2={130} stroke={C.mocha} strokeWidth={1.5} />
        {[0, 5, 10, 15, 20].map((v) => (
          <g key={v}>
            <line x1={x(v)} y1={126} x2={x(v)} y2={134} stroke={C.mocha} />
            <T x={x(v)} y={152} s={12} a="middle" f={C.taupe}>{v}</T>
          </g>
        ))}
      </g>
      <g opacity={lo}>
        <line x1={x(13)} y1={96} x2={x(13)} y2={130} stroke={C.cinnamon} strokeWidth={2} />
        <T x={x(13)} y={88} s={12} a="end" f={C.cinnamon}>critical path 13</T>
      </g>
      <g opacity={bound}>
        <rect x={x(13)} y={120} width={(x(19.5) - x(13)) * bound} height={20} fill={C.cocoa} />
        <line x1={x(19.5)} y1={96} x2={x(19.5)} y2={130} stroke={C.caramel} strokeWidth={2} />
        <T x={x(19.5)} y={88} s={12} a="middle" f={C.caramel}>19.5</T>
        <T x={300} y={204} s={12} a="middle" f={C.latte}>m = 2: (2 − 1/2) · 13 = 19.5</T>
      </g>
      <g opacity={runs}>
        <circle cx={x(15)} cy={124} r={6} fill={C.crema} />
        <circle cx={x(15)} cy={138} r={6} fill={C.crema} />
        <T x={x(15)} y={172} s={12} a="middle" f={C.crema}>both runs: 15</T>
        <T x={300} y={240} s={13} a="middle" f={C.caramel}>any order lands inside the bound</T>
      </g>
    </Svg>
  );
}

// 11 · Predict: a planted cycle, Kahn's stuck set against the depth-first search's named edge
export function CycleRejection({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const a = easeOut(seg(t, 0.1, 0.9));
  const plant = easeOut(seg(t, 1.0, 2.0));
  const ask = easeOut(seg(t, 2.4, 3.2));
  const kahn = answered ? easeOut(seg(s, 0.2, 1.1)) : 0;
  const dfs = answered ? seg(s, 1.3, 2.6) : 0;
  const named = answered ? easeOut(seg(s, 2.6, 3.2)) : 0;
  const nodes = ['A', 'B', 'C', 'D'];
  const nx = (i: number) => 120 + i * 120;
  const ny = 80;
  const pathLen = stepIdx(dfs, 0, 1, 3);
  return (
    <Svg label="The chain A to B to C to D with a planted edge from C back to B. After answering: Kahn's algorithm leaves B, C and D stuck as a group; the depth-first search follows A, B, C and names C, whose edge to B closes the cycle" h={290}>
      {nodes.map((n, i) => (
        <g key={n} opacity={a}>
          {i > 0 && <line x1={nx(i - 1) + 18} y1={ny} x2={nx(i) - 18} y2={ny} stroke={C.mocha} strokeWidth={1.5} />}
          <circle cx={nx(i)} cy={ny} r={18} fill={kahn > 0.5 && i > 0 ? C.cherry : C.roast} stroke={i <= pathLen ? C.caramel : C.crema} strokeWidth={i <= pathLen ? 3 : 1.5} />
          <T x={nx(i)} y={ny + 5} s={13} a="middle" f={C.crema}>{n}</T>
        </g>
      ))}
      <path d={`M ${nx(2)} ${ny + 18} C ${nx(2) - 20} ${ny + 60}, ${nx(1) + 20} ${ny + 60}, ${nx(1)} ${ny + 18}`} fill="none" stroke={named > 0 ? C.caramel : C.cherryText} strokeWidth={named > 0 ? 3 : 2} strokeDasharray="5 3" opacity={plant} />
      <T x={(nx(1) + nx(2)) / 2} y={ny + 70} s={12} a="middle" f={C.cherryText} o={plant * (1 - named)}>planted C → B</T>
      <T x={300} y={236} s={13} a="middle" f={C.caramel} o={rev(ask, kahn)}>which names the edge? which shows the group?</T>
      <g opacity={kahn}>
        <rect x={nx(1) - 30} y={ny - 32} width={nx(3) - nx(1) + 60} height={64} fill="none" stroke={C.cherryText} strokeWidth={1.5} />
        <T x={nx(2)} y={ny - 40} s={12} a="middle" f={C.cherryText}>Kahn: B, C, D stuck, in-degree never 0</T>
      </g>
      <T x={300} y={200} s={12} a="middle" f={C.latte} o={dfs > 0 ? 1 : 0}>DFS path: {['A', 'A → B', 'A → B → C'][Math.max(0, pathLen)]}</T>
      <g opacity={named}>
        <T x={(nx(1) + nx(2)) / 2} y={ny + 70} s={12} a="middle" f={C.caramel}>C → B closes it</T>
        <T x={300} y={236} s={13} a="middle" f={C.caramel}>DFS names C; Kahn shows the group</T>
        <T x={300} y={264} s={12} a="middle" f={C.latte}>rejected before any task starts</T>
      </g>
    </Svg>
  );
}

// 12 · Recap: an acyclic graph by construction, then a graph built one edge at a time
export function Recap({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.9));
  const ok = easeOut(seg(t, 0.9, 1.6));
  const e = stepIdx(t, 2.0, 3.8, 3);
  const next = easeOut(seg(t, 3.9, 4.6));
  const dots: [number, number][] = [
    [340, 60], [400, 100], [460, 60], [520, 110], [380, 160], [470, 170],
  ];
  const edges: [number, number][] = [
    [0, 1],
    [2, 3],
    [1, 4],
  ];
  return (
    <Svg label="Left: the scheduler's graph, a cycle rejected before the first task. Right: records, with matching edges arriving one at a time, joining them into groups nobody knew in advance" h={260}>
      <g opacity={a}>
        {['A', 'B', 'C', 'D'].map((n, i) => (
          <g key={n}>
            {i > 0 && <line x1={40 + (i - 1) * 60 + 14} y1={90} x2={40 + i * 60 - 14} y2={90} stroke={C.mocha} strokeWidth={1.5} />}
            <circle cx={40 + i * 60} cy={90} r={14} fill={C.roast} stroke={C.caramel} strokeWidth={1.5} />
            <T x={40 + i * 60} y={95} s={12} a="middle" f={C.crema}>{n}</T>
          </g>
        ))}
        <T x={130} y={140} s={12} a="middle" f={C.latte} o={ok}>acyclic by construction</T>
      </g>
      {edges.map(([u, v], i) => (
        <line key={i} x1={dots[u][0]} y1={dots[u][1]} x2={lerp(dots[u][0], dots[v][0], i <= e ? 1 : 0)} y2={lerp(dots[u][1], dots[v][1], i <= e ? 1 : 0)} stroke={C.cinnamon} strokeWidth={2} />
      ))}
      {dots.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={9} fill={C.crema} opacity={a} />
      ))}
      <T x={430} y={210} s={12} a="middle" f={C.cinnamon} o={e >= 0 ? 1 : 0}>edges arrive one at a time</T>
      <T x={300} y={246} s={13} a="middle" f={C.caramel} o={next}>next: union-find inside entity resolution</T>
    </Svg>
  );
}
