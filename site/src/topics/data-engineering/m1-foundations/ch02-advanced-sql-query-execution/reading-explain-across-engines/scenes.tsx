import { useEffect, useState } from 'react';
import { Bar, C, Plot, Svg, T } from '../../../../../reels/kit';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';

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

/** A number counted up to its final value, with fixed decimals and thousands separators. */
function num(v: number, d = 0) {
  return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}

/** A label-left / value-right row, stacked vertically with generous gaps (DESIGN.md, phone text scaling).
 * `k` fades it in and slides it up a little; the value is whatever string the scene passes (a count in progress). */
function Row({ y, label, value, valueColor = C.crema, big = false, k = 1 }: { y: number; label: string; value: string; valueColor?: string; big?: boolean; k?: number }) {
  return (
    <g opacity={k} transform={`translate(0 ${((1 - k) * 10).toFixed(2)})`}>
      <T x={25} y={y} s={15} f={C.latte}>
        {label}
      </T>
      <T x={575} y={y} s={big ? 22 : 17} f={valueColor} a="end" w={600}>
        {value}
      </T>
    </g>
  );
}

/** A verdict tick at the right edge, drawn in by `k`. */
function Tick({ y, k, f = C.focus }: { y: number; k: number; f?: string }) {
  return <path d={`M540 ${y} l8 8 l16 -18`} fill="none" stroke={f} strokeWidth={3} strokeDasharray="40" strokeDashoffset={40 * (1 - k)} />;
}

/** A time bar that grows to its share over `k`; its figure fades in once the bar is most of the way there. */
function timeBar(x: number, y: number, frac: number, display: string, label: string, fill: string, k: number) {
  return (
    <g key={label} opacity={k > 0 ? 1 : 0}>
      <T x={x} y={y - 20} s={13} f={C.latte} o={clamp(k * 3, 0, 1)}>
        {label}
      </T>
      <Bar x={x} y={y} w={340 * frac * k} h={20} full={340} fill={fill} />
      <T x={x} y={y + 38} s={13} f={C.crema} o={seg(k, 0.6, 1)}>
        {display}
      </T>
    </g>
  );
}

/** Two timed rows that count up, each with a bar under it scaled to the slower one. */
function TwoTimes({ t, rows, max }: { t: number; rows: [string, number, number, string][]; max: number }) {
  return (
    <g>
      {rows.map(([label, ms, d, color], i) => {
        const k = easeOut(seg(t, 0.2 + i * 1.1, 0.8 + i * 1.1));
        const c = easeOut(seg(t, 0.3 + i * 1.1, 1.3 + i * 1.1));
        const y = 60 + i * 60;
        return (
          <g key={label}>
            <Row y={y} label={label} value={`${num(ms * c, d)} ms`} valueColor={color} big k={k} />
            <rect x={25} y={y + 14} width={k > 0 ? Math.max(3, 550 * (ms / max) * c) : 0} height={6} rx={3} fill={color} opacity={0.8} />
          </g>
        );
      })}
    </g>
  );
}

/** A predict step's verdict, sliding up into place once the learner has answered. */
function Verdict({ answer, text, y = 184, f = C.focus }: { answer: number | null; text: string; y?: number; f?: string }) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  if (answer === null) return null;
  return (
    <T x={300} y={lerp(y + 8, y, v)} s={15} f={f} a="middle" o={v}>
      {text}
    </T>
  );
}

/** A Row whose "?" becomes the answer once the learner has answered, underlined as it lands. */
function AnswerRow({ y, label, answer, value, k }: { y: number; label: string; answer: number | null; value: string; k: number }) {
  const s = useSinceAnswer(answer !== null);
  const u = answer !== null ? easeOut(seg(s, 0.2, 0.7)) : 0;
  const uw = Math.min(250, value.length * 10.7);
  return (
    <g>
      <Row y={y} label={label} value={answer !== null ? value : '?'} valueColor={answer !== null ? C.focus : C.crema} k={k} />
      {answer !== null && <rect x={575 - uw * u} y={y + 12} width={uw * u} height={3} fill={C.focus} />}
    </g>
  );
}

/** A plan-output panel: grey line stubs standing for printed plan lines. */
function Panel({ x, y, w, lines, o = 1 }: { x: number; y: number; w: number; lines: number[]; o?: number }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={22 + lines.length * 16} rx={6} fill={C.cocoa} stroke={C.mocha} />
      {lines.map((lw, i) => (
        <rect key={i} x={x + 12} y={y + 12 + i * 16} width={lw} height={7} rx={2} fill={C.mocha} />
      ))}
    </g>
  );
}

// 1 · Hook. Two plan outputs side by side; the newer version's gains a Buffers line on its own.
export function Hook({ t }: StepCtx) {
  const p = easeOut(seg(t, 1.2, 1.7));
  const extra = easeInOut(seg(t, 2.6, 3.4));
  return (
    <Svg label="same command, two versions apart" h={230}>
      <Row y={50} label="PostgreSQL 16" value="no Buffers line" valueColor={C.cherryText} k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={100} label="PostgreSQL 18" value="Buffers: shared hit=896" valueColor={C.focus} k={easeOut(seg(t, 2.2, 2.7))} />
      <Panel x={25} y={130} w={265} lines={[200, 150, 170]} o={p} />
      <Panel x={310} y={130} w={265} lines={[200, 150, 170]} o={p} />
      <rect x={322} y={190} width={190 * extra} height={7} rx={2} fill={C.focus} opacity={p} />
      <rect x={310} y={130} width={265} height={22 + 3 * 16 + 16 * extra} rx={6} fill="none" stroke={extra > 0 ? C.focus : C.mocha} opacity={p} />
    </Svg>
  );
}

// 2 · Predict: why more output. After the answer the "?" becomes the answer and the verdict slides in.
export function PredictWhyMore({ t, answer }: StepCtx) {
  return (
    <Svg label="same query, same command — why more output?" h={210}>
      <Row y={70} label="what changed in the query" value="nothing" k={easeOut(seg(t, 0.1, 0.6))} />
      <AnswerRow y={130} label="what changed in the output" answer={answer} value="the default" k={easeOut(seg(t, 0.5, 1.0))} />
      <Verdict answer={answer} text="the engine's own default changed" />
    </Svg>
  );
}

/** A small on/off switch whose knob slides by `on` (0 to 1). */
function Switch({ x, y, on, o }: { x: number; y: number; on: number; o: number }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={44} height={20} rx={10} fill={on > 0.5 ? C.focus : C.cocoa} stroke={on > 0.5 ? C.focus : C.cherryText} opacity={0.9} />
      <circle cx={x + 10 + 24 * on} cy={y + 10} r={7} fill={C.crema} />
    </g>
  );
}

// 3 · The default. Before 18 the BUFFERS switch sits off; from 18 on, the same switch flips on by itself.
export function RevealBuffersDefault({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.7));
  const b = easeOut(seg(t, 1.6, 2.1));
  const flip = easeInOut(seg(t, 2.3, 2.9));
  return (
    <Svg label="a version-dated default, not a trick of this query" h={200}>
      <Row y={70} label="ANALYZE before PG 18" value="BUFFERS off" valueColor={C.cherryText} k={a} />
      <Switch x={350} y={56} on={0} o={a} />
      <Row y={130} label="ANALYZE from PG 18 on" value="BUFFERS on" valueColor={C.focus} k={b} />
      <Switch x={350} y={116} on={flip} o={b} />
    </Svg>
  );
}

// 4 · Estimate vs actual. Both counts count up; the estimate's bar stops at about half of the actual's.
export function RevealEstVsActual({ t }: StepCtx) {
  const ce = easeOut(seg(t, 0.3, 1.3));
  const ca = easeOut(seg(t, 1.6, 2.6));
  const br = easeInOut(seg(t, 2.8, 3.4));
  return (
    <Svg label="the planner's guess vs. what actually ran" h={210}>
      <Row y={50} label="estimated rows" value={num(1012 * ce)} k={easeOut(seg(t, 0.2, 0.7))} />
      <rect x={25} y={62} width={550 * (1012 / 2000) * ce} height={10} rx={3} fill="none" stroke={C.latte} strokeDasharray="4 3" />
      <Row y={115} label="actual rows" value={num(2000 * ca)} valueColor={C.focus} k={easeOut(seg(t, 1.5, 2.0))} />
      <rect x={25} y={127} width={550 * ca} height={10} rx={3} fill={C.focus} />
      <path d={`M${25 + 550 * (1012 / 2000)} 150 v8 h${(550 - 550 * (1012 / 2000)) * br} v-8`} fill="none" stroke={C.cherryText} strokeWidth={1.5} opacity={br > 0 ? 1 : 0} />
      <T x={25 + 550 * 0.75} y={180} s={13} f={C.cherryText} a="middle" o={br >= 1 ? 1 : 0}>
        the gap
      </T>
    </Svg>
  );
}

// 5 · Spill recap. The budget box fills, the overflow runs past it in red: the question every engine answers somewhere.
export function RevealSpillRecap({ t }: StepCtx) {
  const f = easeInOut(seg(t, 1.6, 2.6));
  const fw = 300 * f;
  return (
    <Svg label="did this operator run out of its memory budget?" h={200}>
      <Row y={50} label="already measured" value="Batches, spill (topic 23)" k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={105} label="every engine" value="answers this somewhere" valueColor={C.focus} k={easeOut(seg(t, 0.8, 1.3))} />
      <rect x={25} y={138} width={Math.min(fw, 200)} height={22} rx={3} fill={C.primary} />
      {fw > 200 && <rect x={225} y={138} width={fw - 200} height={22} rx={3} fill={C.cherryText} />}
      <rect x={25} y={136} width={200} height={26} rx={4} fill="none" stroke={C.latte} strokeDasharray="4 3" opacity={easeOut(seg(t, 1.3, 1.7))} />
      <T x={340} y={155} s={13} f={C.cherryText} o={f >= 1 ? 1 : 0}>
        spilled
      </T>
    </Svg>
  );
}

// 6 · Predict: what first. After the answer the "?" becomes the answer and the verdict slides in.
export function PredictWhatFirst({ t, answer }: StepCtx) {
  return (
    <Svg label="five formats, one question to start with" h={210}>
      <Row y={70} label="five engines, five vocabularies" value="all different" k={easeOut(seg(t, 0.1, 0.6))} />
      <AnswerRow y={130} label="worth checking first" answer={answer} value="the biggest gap" k={easeOut(seg(t, 0.5, 1.0))} />
      <Verdict answer={answer} text="where actual diverges furthest from expected" />
    </Svg>
  );
}

// 7 · Spark's estimate. The plan text types itself out with the row count in it.
export function RevealSparkPlanEstimate({ t }: StepCtx) {
  const code = 'Statistics(… rowCount=1.00E+6)';
  const n = Math.round(code.length * seg(t, 1.6, 2.8));
  return (
    <Svg label="printed right in the plan text itself" h={200}>
      <Row y={50} label="cost-mode plan" value="Statistics(...)" k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={105} label="rowCount" value="1.00E+6" valueColor={C.focus} k={easeOut(seg(t, 2.8, 3.3))} />
      <rect x={25} y={130} width={550} height={40} rx={6} fill={C.cocoa} stroke={C.mocha} opacity={easeOut(seg(t, 1.2, 1.6))} />
      <T x={40} y={155} s={14} f={n >= code.length ? C.focus : C.crema}>
        {code.slice(0, n)}
      </T>
    </Svg>
  );
}

// 8 · Spark UI actuals. The comfortable run stays at nothing spilled; the constrained run's bar grows across.
export function RevealSparkUiActual({ t }: StepCtx) {
  const k = (i: number) => easeOut(seg(t, 0.2 + i * 1.2, 1.1 + i * 1.2));
  return (
    <Svg label="a measured contrast: comfortable vs. constrained" h={370}>
      {timeBar(30, 90, 0, '0 MB spilled', 'comfortable run', C.focus, k(0))}
      {timeBar(30, 210, 388 / 388, '388 MB mem, 198 MB disk', 'constrained run', C.cherryText, k(1))}
    </Svg>
  );
}

// 9 · Prove: shuffle vs spill. After the answer the spilled row is underlined and the verdict slides in.
export function ProveShuffleVsSpill({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const u = answer !== null ? easeOut(seg(s, 0.2, 0.7)) : 0;
  return (
    <Svg label="shuffle bytes vs. spilled bytes" h={210}>
      <Row y={70} label="shuffle-write bytes" value="normal, always present" k={easeOut(seg(t, 0.1, 0.6))} />
      <Row y={130} label="spilled bytes" value="only under pressure" valueColor={C.focus} k={easeOut(seg(t, 0.5, 1.0))} />
      {answer !== null && <rect x={575 - 200 * u} y={142} width={200 * u} height={3} fill={C.focus} />}
      <Verdict answer={answer} text="a nonzero spill is the out-of-memory signal" />
    </Svg>
  );
}

// 10 · Trino. A plan's three nodes each grow a relative-cost bar inline, beside the stage's CPU time.
export function RevealTrino({ t }: StepCtx) {
  const nodes: [string, number][] = [
    ['Aggregate', 0.2],
    ['Join', 0.55],
    ['Scan', 0.25],
  ];
  return (
    <Svg label="inline in the plan text, no separate UI needed" h={240}>
      <Row y={40} label="CPU time" value="per stage" k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={85} label="relative cost" value="per plan node" valueColor={C.focus} k={easeOut(seg(t, 1.4, 1.9))} />
      {nodes.map(([n, c], i) => {
        const k = easeOut(seg(t, 0.8 + i * 0.2, 1.2 + i * 0.2));
        const g = easeOut(seg(t, 1.8 + i * 0.3, 2.6 + i * 0.3));
        return (
          <g key={n} opacity={k}>
            <rect x={25 + i * 30} y={110 + i * 38} width={130} height={28} rx={4} fill={C.cocoa} stroke={C.mocha} />
            <T x={90 + i * 30} y={129 + i * 38} s={13} f={C.latte} a="middle">
              {n}
            </T>
            <rect x={240} y={118 + i * 38} width={300 * c * g} height={12} rx={2} fill={C.focus} />
          </g>
        );
      })}
    </Svg>
  );
}

// 11 · Snowflake. Two panes: twelve partitions where only three get scanned, and a spill split into local and remote.
export function RevealSnowflake({ t }: StepCtx) {
  const p = easeOut(seg(t, 0.6, 1.0));
  const sp = easeOut(seg(t, 2.0, 2.4));
  const lb = easeOut(seg(t, 2.4, 3.2));
  return (
    <Svg label="named panes for pruning and spilling" h={230}>
      <Row y={40} label="Pruning pane" value="scanned / total" k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={85} label="Spilling pane" value="local / remote bytes" valueColor={C.focus} k={easeOut(seg(t, 1.6, 2.1))} />
      <g opacity={p}>
        <rect x={25} y={110} width={265} height={100} rx={6} fill="none" stroke={C.mocha} />
        {Array.from({ length: 12 }, (_, i) => {
          const lit = [1, 6, 10].includes(i) && t >= 1.2 + i * 0.04;
          return <rect key={i} x={40 + (i % 6) * 40} y={126 + Math.floor(i / 6) * 40} width={30} height={30} rx={3} fill={lit ? C.focus : C.cocoa} stroke={C.mocha} />;
        })}
      </g>
      <g opacity={sp}>
        <rect x={310} y={110} width={265} height={100} rx={6} fill="none" stroke={C.mocha} />
        <T x={325} y={140} s={12} f={C.latte}>
          local
        </T>
        <rect x={385} y={130} width={160 * lb} height={12} rx={2} fill={C.focus} />
        <T x={325} y={180} s={12} f={C.latte}>
          remote
        </T>
        <rect x={385} y={170} width={90 * lb} height={12} rx={2} fill={C.second} />
      </g>
    </Svg>
  );
}

// 12 · BigQuery. Three stage boxes draw in; the edges between them draw next, and the estimate tags land on the edges.
export function RevealBigQuery({ t }: StepCtx) {
  const bx = (i: number) => 25 + i * 210;
  const edge = (i: number) => easeInOut(seg(t, 1.6 + i * 0.5, 2.2 + i * 0.5));
  return (
    <Svg label="the estimate lives on the edges, not the boxes" h={220}>
      <Row y={40} label="stages" value="drawn as boxes" k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={85} label="estimated rows exchanged" value="on the edges" valueColor={C.focus} k={easeOut(seg(t, 1.4, 1.9))} />
      {[0, 1, 2].map((i) => (
        <g key={i} opacity={easeOut(seg(t, 0.6 + i * 0.2, 1.0 + i * 0.2))}>
          <rect x={bx(i)} y={130} width={130} height={40} rx={6} fill={C.cocoa} stroke={C.mocha} />
          <T x={bx(i) + 65} y={155} s={13} f={C.latte} a="middle">
            stage {i + 1}
          </T>
        </g>
      ))}
      {[0, 1].map((i) => {
        const e = edge(i);
        return (
          <g key={i}>
            <line x1={bx(i) + 130} y1={150} x2={bx(i) + 130 + 80 * e} y2={150} stroke={C.focus} strokeWidth={2} />
            <g opacity={e >= 1 ? 1 : 0}>
              <rect x={bx(i) + 140} y={180} width={60} height={20} rx={4} fill="none" stroke={C.focus} />
              <T x={bx(i) + 170} y={194} s={11} f={C.focus} a="middle">
                rows
              </T>
              <line x1={bx(i) + 170} y1={152} x2={bx(i) + 170} y2={180} stroke={C.focus} strokeDasharray="2 2" />
            </g>
          </g>
        );
      })}
    </Svg>
  );
}

// 13 · Recap. The four checks rise in one per beat, numbered; the last is the one to remember.
export function Recap({ t }: StepCtx) {
  const lines = ['the biggest estimate-vs-actual gap first', 'then a high loop count on a small cost', 'then spill or memory pressure', 'then the single slowest operator'];
  return (
    <Svg label="recap: one fixed order, five vocabularies" h={240}>
      {lines.map((l, i) => {
        const k = easeOut(seg(t, 0.2 + i * 0.7, 0.7 + i * 0.7));
        return (
          <T key={l} x={300} y={55 + i * 42 + (1 - k) * 8} s={14} f={i === lines.length - 1 ? C.focus : C.crema} a="middle" o={k}>
            {l}
          </T>
        );
      })}
    </Svg>
  );
}

// 14 · Prove: bad estimate. The two counts count up; after the answer the verdict lands with rule and tick.
export function ProveBadEstimate({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const k = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const tick = answer !== null ? easeOut(seg(s, 0.6, 1.0)) : 0;
  return (
    <Svg label="a node's estimate, far from what ran" h={220}>
      <Row y={70} label="estimated" value={num(500 * easeOut(seg(t, 0.1, 0.8)))} k={easeOut(seg(t, 0.1, 0.5))} />
      <Row y={130} label="actual" value={num(50000 * easeOut(seg(t, 0.5, 1.4)))} valueColor={C.cherryText} k={easeOut(seg(t, 0.5, 0.9))} />
      {answer !== null && (
        <>
          <T x={300} y={lerp(192, 180, k)} s={16} f={C.focus} a="middle" o={k}>
            100× off: check it first
          </T>
          <rect x={190} y={192} width={220 * tick} height={3} fill={C.focus} />
          <Tick y={165} k={tick} />
        </>
      )}
    </Svg>
  );
}

// 15 · Prove: zero spill. After the answer the zero is underlined and the verdict slides in.
export function ProveZeroSpill({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const u = answer !== null ? easeOut(seg(s, 0.2, 0.7)) : 0;
  return (
    <Svg label="a large shuffle, a spill field at zero" h={210}>
      <Row y={70} label="bytes shuffled" value="large" k={easeOut(seg(t, 0.1, 0.6))} />
      <Row y={130} label="bytes spilled" value="0" valueColor={C.focus} k={easeOut(seg(t, 0.5, 1.0))} />
      {answer !== null && <rect x={575 - 30 * u} y={142} width={30 * u} height={3} fill={C.focus} />}
      <Verdict answer={answer} text="no: it stayed within its budget" />
    </Svg>
  );
}
