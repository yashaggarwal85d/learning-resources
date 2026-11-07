import { useEffect, useState } from 'react';
import { C, Draw, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// CHAPTER.md, topic 2: a lot graph drawn left to right with a raw-material lot highlighted; a forward query lights
// the downstream lots one wave at a time; a missing edge shows as a dashed red link and the lots it hides. examples.py
// (PostgreSQL, recursive CTE with CYCLE): RM9 splits into INT1 and INT2, RM7 also feeds INT1, INT1 → FIN1, INT2 →
// FIN2, FIN1 → REJ1, REJ1 reworks back into INT1, RM8 → FIN3 untouched; the true exposure of RM9 is six lots, with the
// RM9 → INT2 edge missing it is four, short INT2 and FIN2; the unprotected query capped at depth 500 yields 503 rows.

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
const Box = ({ x, y, w, h = 32, label, lit = false, o = 1, dash, stroke, f, fill }: { x: number; y: number; w: number; h?: number; label: string; lit?: boolean; o?: number; dash?: string; stroke?: string; f?: string; fill?: string }) =>
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
      <line x1={x - 7} y1={y - 7} x2={x + 7} y2={y + 7} />
      <line x1={x + 7} y1={y - 7} x2={x - 7} y2={y + 7} />
    </g>
  );

const n0 = (v: number) => Math.round(v).toLocaleString('en-US');
const easeIn = (x: number) => x * x;

// examples.py's lot graph, laid out raw → intermediate → finished → reject.
const NODE: Record<string, [number, number]> = {
  RM7: [30, 24],
  RM9: [30, 74],
  RM8: [30, 124],
  INT1: [175, 24],
  INT2: [175, 74],
  FIN1: [330, 24],
  FIN2: [330, 74],
  FIN3: [330, 124],
  REJ1: [480, 24],
};
const EDGES: [string, string][] = [
  ['RM9', 'INT1'],
  ['RM9', 'INT2'],
  ['RM7', 'INT1'],
  ['INT1', 'FIN1'],
  ['INT2', 'FIN2'],
  ['FIN1', 'REJ1'],
  ['RM8', 'FIN3'],
];
const NW = 90;
const NH = 26;
/** The rework edge REJ1 → INT1, arched over the top. */
const LOOP = `M${480 + NW / 2} 24 C${480 + NW / 2} 4, ${175 + NW / 2} 4, ${175 + NW / 2} 24`;

/** The lot graph. `lit` lots glow red (exposed), `miss` lots get a dashed red outline, `drop` is an edge drawn as missing. */
function Graph({ lit, miss = [], drop, loop = 0, o = 1, dimEdges = false }: { lit: string[]; miss?: string[]; drop?: string; loop?: number; o?: number; dimEdges?: boolean }) {
  return (
    <g opacity={o}>
      {EDGES.map(([a, b]) => {
        const [ax, ay] = NODE[a];
        const [bx, by] = NODE[b];
        const key = `${a}-${b}`;
        const gone = drop === key;
        const hot = !gone && lit.includes(a) && lit.includes(b);
        return (
          <line key={key} x1={ax + NW} y1={ay + NH / 2} x2={bx} y2={by + NH / 2} stroke={gone ? C.badText : hot ? C.badText : C.line} strokeWidth={hot ? 1.8 : 1.1} strokeDasharray={gone ? '4 4' : undefined} opacity={gone ? 0.6 : dimEdges ? 0.5 : 1} />
        );
      })}
      <path d={LOOP} fill="none" stroke={loop > 0 ? C.badText : C.line} strokeWidth={loop > 0 ? 1.8 : 1.1} strokeDasharray="5 3" />
      {Object.entries(NODE).map(([n, [x, y]]) => {
        const on = lit.includes(n);
        const ms = miss.includes(n);
        return (
          <g key={n}>
            <rect x={x} y={y} width={NW} height={NH} rx={3} fill={on ? C.bad : C.panel} stroke={on ? C.badText : ms ? C.badText : C.line} strokeDasharray={ms ? '4 3' : undefined} strokeWidth={ms ? 1.6 : 1} />
            <T x={x + NW / 2} y={y + 18} s={13} f={on ? C.focus : ms ? C.badText : C.primary} a="middle">
              {n}
            </T>
          </g>
        );
      })}
    </g>
  );
}

const TRUE = ['RM9', 'INT1', 'INT2', 'FIN1', 'FIN2', 'REJ1'];
const DEGRADED = ['RM9', 'INT1', 'FIN1', 'REJ1'];
/** The order the forward query reaches each lot, hop by hop. */
const WAVE: string[][] = [['RM9'], ['INT1', 'INT2'], ['FIN1', 'FIN2'], ['REJ1']];
const litBy = (hops: number, keep: string[]) => WAVE.slice(0, Math.max(0, Math.floor(hops))).flat().filter((l) => keep.includes(l));

// 1 · The recall query runs on the genealogy and returns four lots, each ticking in with no error. Then two dashed
// empty slots appear after them: nothing in the output says whether the list is whole.
export function Hook({ t }: StepCtx) {
  const run = seg(t, 0.4, 1.6);
  const ok = easeOut(seg(t, 1.8, 2.2));
  const ghost = easeOut(seg(t, 3.0, 3.6));
  return (
    <Svg label="a recall query over a lot's genealogy runs cleanly and returns an answer with no error — what if that answer is simply too small, with nothing in its own output to say so?" h={200}>
      <Box x={30} y={24} w={200} h={32} label="recall query · RM9" o={easeOut(seg(t, 0, 0.3))} />
      {run > 0 && run < 1 && <rect x={232} y={38} width={Math.max(0, 300 * run)} height={4} fill={C.focus} opacity={0.6} />}
      {DEGRADED.map((l, i) => (
        <Box key={l} x={30 + i * 90} y={84} w={80} h={28} label={l} o={easeOutBack(seg(t, 0.6 + i * 0.25, 0.9 + i * 0.25))} />
      ))}
      {ghost > 0 && [0, 1].map((i) => <Box key={i} x={390 + i * 90} y={84} w={80} h={28} label="?" dash="4 3" stroke={C.badText} f={C.badText} o={ghost} />)}
      <T x={30} y={150} s={14} f={C.focus} o={ok}>
        no error, no warning
      </T>
      <T x={30} y={182} s={13} f={C.badText} o={easeOut(seg(t, 3.6, 4.0))}>
        nothing says the list is whole
      </T>
    </Svg>
  );
}

// 2 · A work order hands down a run. The run reaches past "the recipe" to one frozen version: recipe v2. A second run,
// months earlier, points at v1.
export function RevealEntities({ t }: StepCtx) {
  const r1 = easeOut(seg(t, 0.8, 1.2));
  const v = easeOut(seg(t, 1.6, 2.0));
  const p1 = seg(t, 2.2, 2.8);
  const r2 = easeOut(seg(t, 3.2, 3.6));
  const p2 = seg(t, 3.6, 4.2);
  return (
    <Svg label="a work order, a run, and the one exact recipe version a run actually points to, never 'the recipe' in general" h={220}>
      <Box x={30} y={24} w={160} h={32} label="work order" o={easeOut(seg(t, 0, 0.3))} />
      <T x={30} y={74} s={13} f={C.secondary} o={easeOut(seg(t, 0.2, 0.5))}>
        what was asked for
      </T>
      <Draw pts={[[110, 80], [110, 104]]} t={t} from={0.5} to={0.8} stroke={C.line} w={1.4} pen={false} />
      <Box x={30} y={104} w={160} h={32} label="run · March" lit={p1 >= 1} o={r1} />
      <T x={30} y={154} s={13} f={C.secondary} o={r1}>
        what actually ran
      </T>
      <Box x={30} y={170} w={160} h={32} label="run · January" lit={p2 >= 1} o={r2} />
      <rect x={360} y={70} width={210} height={110} rx={6} fill="none" stroke={C.line} strokeDasharray="4 3" opacity={easeOut(seg(t, 1.2, 1.5))} />
      <T x={372} y={62} s={13} f={C.secondary} o={easeOut(seg(t, 1.2, 1.5))}>
        the recipe, versioned
      </T>
      <Box x={380} y={86} w={170} h={30} label="recipe v1" lit={p2 >= 1} o={v} />
      <Box x={380} y={134} w={170} h={30} label="recipe v2" lit={p1 >= 1} o={v} />
      <Draw pts={[[190, 120], [380, 149]]} t={t} from={2.2} to={2.8} stroke={C.focus} w={1.6} pen={false} />
      <Draw pts={[[190, 186], [300, 186], [300, 101], [380, 101]]} t={t} from={3.6} to={4.2} stroke={C.second} w={1.6} pen={false} />
    </Svg>
  );
}

// 3 · Two nests built side by side: the equipment model, six levels deep, and the batch-procedure model, four levels
// deep, from a related but separate standard. A gap stays between them; neither is folded into the other.
export function RevealTwoModels({ t }: StepCtx) {
  const nest = (x0: number, w0: number, n: number, col: string, start: number) =>
    Array.from({ length: n }, (_, i) => {
      const k = easeOut(seg(t, start + i * 0.25, start + i * 0.25 + 0.3));
      const inset = i * 9;
      return k > 0 ? <rect key={i} x={x0 + inset} y={36 + inset} width={Math.max(0, w0 - inset * 2)} height={Math.max(0, 120 - inset * 2)} rx={4} fill="none" stroke={col} strokeWidth={1.4} opacity={k} /> : null;
    });
  return (
    <Svg label="one standard nests the equipment six levels deep; a separate, related standard nests how a batch gets made four levels deep" h={200}>
      <T x={30} y={24} s={13} f={C.focus} o={easeOut(seg(t, 0, 0.3))}>
        the equipment
      </T>
      {nest(30, 240, 6, C.focus, 0.2)}
      <T x={150} y={182} s={14} f={C.focus} a="middle" o={easeOut(seg(t, 1.8, 2.1))}>
        six levels
      </T>
      <T x={330} y={24} s={13} f={C.second} o={easeOut(seg(t, 2.0, 2.3))}>
        how a batch is made
      </T>
      {nest(330, 240, 4, C.second, 2.2)}
      <T x={450} y={182} s={14} f={C.second} a="middle" o={easeOut(seg(t, 3.4, 3.7))}>
        four levels
      </T>
      <line x1={300} y1={40} x2={300} y2={150} stroke={C.line} strokeDasharray="3 4" opacity={easeOut(seg(t, 3.8, 4.2))} />
    </Svg>
  );
}

// 4 · A query token walks RM9 → INT1 → FIN1 → REJ1 and the rework arc carries it back to INT1. Before the answer it
// stops at a "?"; after it, the token keeps lapping the loop and the lap counter keeps climbing.
export function PredictLoop({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const walk = seg(t, 0.6, 2.6);
  const PATH: [number, number][] = [
    [75, 66],
    [220, 16],
    [375, 16],
    [525, 16],
  ];
  const at = (p: number): [number, number] => {
    const f = p * 3;
    const i = Math.min(2, Math.floor(f));
    const r = f - i;
    return [lerp(PATH[i][0], PATH[i + 1][0], r), lerp(PATH[i][1], PATH[i + 1][1], r)];
  };
  const lap = on ? (s * 1.4) % 1 : 0;
  const laps = on ? Math.floor(s * 1.4) + 1 : 0;
  const [tx, ty] = on ? (lap < 0.4 ? [lerp(525, 220, lap / 0.4), 6] : at(1 / 3 + ((lap - 0.4) / 0.6) * (2 / 3))) : at(walk);
  return (
    <Svg label="a rejected lot's material gets reworked back into an earlier stage, putting a real loop in the data — does a recursive query with no memory of visited lots ever finish on its own?" h={200}>
      <Graph lit={[]} loop={on ? 1 : 0} o={easeOut(seg(t, 0, 0.4))} />
      {(walk > 0 || on) && <circle cx={tx} cy={ty} r={5} fill={C.focus} />}
      {!on ? (
        <T x={300} y={186} s={16} f={C.secondary} a="middle" o={easeOut(seg(t, 2.6, 3.0))}>
          ?
        </T>
      ) : (
        <g>
          <T x={30} y={186} s={14} f={C.badText}>
            {`lap ${laps}, and counting`}
          </T>
          <T x={575} y={186} s={13} f={C.secondary} a="end" o={easeOut(seg(s, 1.0, 1.4))}>
            no memory of visited lots
          </T>
        </g>
      )}
    </Svg>
  );
}

// 5 · The unprotected query runs against a cap of depth 500. Its row counter climbs straight through without slowing
// and the bar hits the cap at 503 rows. Then the CYCLE clause draws a stop on the rework arc: no cap needed.
export function RevealCycleClause({ t }: StepCtx) {
  const run = easeIn(seg(t, 0.4, 2.6));
  const rows = Math.round(503 * run);
  const hit = easeOut(seg(t, 2.6, 3.0));
  const guard = easeOutBack(seg(t, 3.4, 3.9));
  return (
    <Svg label="the unprotected query, run for real with a hard depth cap, fills the entire cap rather than stopping short of it — exactly what never-converging looks like from the outside" h={220}>
      <T x={30} y={30} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        no cycle protection, depth capped at 500
      </T>
      <rect x={30} y={44} width={500} height={16} rx={2} fill={C.band} opacity={easeOut(seg(t, 0, 0.3))} />
      <rect x={30} y={44} width={Math.max(0, 500 * run)} height={16} rx={2} fill={hit > 0.5 ? C.badText : C.focus} />
      <line x1={530} y1={36} x2={530} y2={68} stroke={C.badText} strokeWidth={2} opacity={easeOut(seg(t, 0, 0.3))} />
      <T x={530} y={86} s={13} f={C.badText} a="middle" o={easeOut(seg(t, 0, 0.3))}>
        cap
      </T>
      <Line2 y={112} l="rows produced" r={n0(rows)} rc={hit > 0.5 ? C.badText : C.focus} o={easeOut(seg(t, 0.4, 0.7))} />
      <T x={30} y={140} s={13} f={C.badText} o={hit}>
        it ran to the cap, never short of it
      </T>
      {guard > 0 && (
        <g opacity={Math.min(1, guard)}>
          <rect x={30} y={166} width={540} height={36} rx={4} fill={C.panel} stroke={C.focus} strokeWidth={1.8} />
          <T x={46} y={189} s={14} f={C.focus}>
            CYCLE lot SET is_cycle
          </T>
          <T x={556} y={189} s={13} f={C.focus} a="end">
            stops itself
          </T>
        </g>
      )}
    </Svg>
  );
}

// 6 · From contaminated RM9, exposure spreads one hop at a time: INT1 and INT2, then FIN1 and FIN2, then REJ1; the
// rework arc back to INT1 lights once and stops, INT1 already counted. RM8 and FIN3 stay clear. Six lots.
export function RevealForward({ t }: StepCtx) {
  const hops = seg(t, 0.4, 2.8) * 4 + (t > 0.4 ? 0.01 : 0);
  const loop = easeOut(seg(t, 2.9, 3.3));
  const done = easeOut(seg(t, 3.5, 3.9));
  return (
    <Svg label="the cycle-protected query, run for real from one contaminated raw lot, returns every downstream lot, including the ones reached through the rework loop" h={200}>
      <Graph lit={litBy(hops, TRUE)} loop={loop} />
      {loop > 0 && <Tick x={240} y={14} k={loop} />}
      <Line2 y={184} l="recall list" r={done > 0 ? '6 lots' : `${litBy(hops, TRUE).length} lots`} rc={C.badText} o={easeOut(seg(t, 0.4, 0.7))} />
    </Svg>
  );
}

// 7 · The RM9 → INT2 split edge fades to a dashed red gap. The same query re-runs: exposure stops at INT1's branch, and
// INT2 and FIN2 are left with dashed red outlines. Four lots, and no error.
export function RevealMissingEdge({ t }: StepCtx) {
  const cut = easeOut(seg(t, 0.4, 0.9));
  const hops = seg(t, 1.2, 3.0) * 4 + (t > 1.2 ? 0.01 : 0);
  const miss = easeOut(seg(t, 3.2, 3.6));
  return (
    <Svg label="one real split edge deleted, the identical query run again — a smaller set returned, with two specific lots a recall would now miss, no warning and no error" h={220}>
      <Graph lit={t < 1.2 ? [] : litBy(hops, DEGRADED)} drop={cut > 0.5 ? 'RM9-INT2' : undefined} miss={miss > 0.5 ? ['INT2', 'FIN2'] : []} loop={hops >= 4 ? 1 : 0} />
      <Cross x={152} y={74} k={cut} />
      <Line2 y={184} l="recall list" r={`${t < 1.2 ? 0 : litBy(hops, DEGRADED).length} of 6 lots`} rc={C.badText} o={easeOut(seg(t, 1.2, 1.5))} />
      <T x={30} y={210} s={13} f={C.badText} o={miss}>
        INT2 and FIN2 missed, no error raised
      </T>
    </Svg>
  );
}

// 8 · Four rows, each with the glyph of the move it names.
export function Recap({ t }: StepCtx) {
  const ROWS: [string, string, string?][] = [
    ['a run', 'one recipe version'],
    ['two standards', 'named separately', C.second],
    ['no cycle guard', 'never stops', C.badText],
    ['one missing edge', 'two lots short', C.badText],
  ];
  return (
    <Svg label="one recipe version per run, two standards named separately, an unprotected loop that never stops, and a recall silently short two lots when one edge is missing" h={260}>
      {ROWS.map(([l, r, c], i) => {
        const y = 44 + i * 60;
        const at = i * 0.9;
        return (
          <g key={l} opacity={easeOut(seg(t, at, at + 0.4))}>
            {i === 0 && (
              <g>
                <rect x={30} y={y - 14} width={30} height={14} rx={2} fill="none" stroke={C.primary} />
                <line x1={60} y1={y - 7} x2={76} y2={y - 7} stroke={C.focus} />
                <rect x={76} y={y - 14} width={32} height={14} rx={2} fill="none" stroke={C.focus} />
              </g>
            )}
            {i === 1 && (
              <g fill="none">
                <rect x={30} y={y - 20} width={34} height={22} rx={2} stroke={C.focus} />
                <rect x={36} y={y - 14} width={22} height={10} rx={2} stroke={C.focus} />
                <rect x={74} y={y - 20} width={34} height={22} rx={2} stroke={C.second} />
              </g>
            )}
            {i === 2 && <path d={`M40 ${y - 4} C40 ${y - 24}, 98 ${y - 24}, 98 ${y - 4}`} fill="none" stroke={C.badText} strokeWidth={1.6} strokeDasharray="4 3" />}
            {i === 3 && (
              <g>
                <rect x={30} y={y - 14} width={22} height={14} rx={2} fill={C.bad} stroke={C.badText} />
                <line x1={52} y1={y - 7} x2={80} y2={y - 7} stroke={C.badText} strokeDasharray="3 3" />
                <rect x={82} y={y - 14} width={26} height={14} rx={2} fill="none" stroke={C.badText} strokeDasharray="3 2" />
              </g>
            )}
            <Line2 y={y} l={l} r={r} lx={125} lc={C.primary} rc={c ?? C.focus} o={easeOut(seg(t, at + 0.2, at + 0.5))} />
          </g>
        );
      })}
    </Svg>
  );
}

// 9 · Two answers stacked: the first run's four lots, the re-run's six. After the answer, the two lots only the second
// run found turn red with "never recalled while trusted" beneath them.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const red = on ? easeOut(seg(s, 0.3, 0.8)) : 0;
  return (
    <Svg label="a recall query re-run after someone manually adds a missing edge returns a bigger answer the second time — does the bigger answer mean the first one was merely incomplete but safe?" h={220}>
      <T x={30} y={24} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        first run
      </T>
      {DEGRADED.map((l, i) => (
        <Box key={l} x={30 + i * 90} y={34} w={80} h={28} label={l} o={easeOut(seg(t, 0.1 + i * 0.1, 0.4 + i * 0.1))} />
      ))}
      <T x={30} y={92} s={13} f={C.secondary} o={easeOut(seg(t, 0.8, 1.1))}>
        after the edge is restored
      </T>
      {[...DEGRADED, 'INT2', 'FIN2'].map((l, i) => {
        const extra = i >= 4;
        return <Box key={l} x={30 + i * 90} y={102} w={80} h={28} label={l} fill={extra && red > 0.5 ? C.bad : undefined} stroke={extra && red > 0.5 ? C.badText : undefined} f={extra && red > 0.5 ? C.focus : undefined} o={easeOut(seg(t, 1.0 + i * 0.1, 1.3 + i * 0.1))} />;
      })}
      {on ? (
        <T x={575} y={162} s={14} f={C.badText} a="end" o={red}>
          never recalled while trusted
        </T>
      ) : (
        <T x={300} y={168} s={16} f={C.secondary} a="middle" o={easeOut(seg(t, 1.8, 2.2))}>
          ?
        </T>
      )}
      {on && (
        <T x={30} y={204} s={13} f={C.focus} o={easeOut(seg(s, 1.0, 1.4))}>
          the fix: never ship an edge table with a hole
        </T>
      )}
    </Svg>
  );
}
