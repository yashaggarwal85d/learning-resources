import { useEffect, useState } from 'react';
import { Bar, C, Decode, Plot, Reticle, Svg, T } from '../../../../../reels/kit';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, easeOutExpo, lerp, seg } from '../../../../../reels/anim';

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
function AnswerRow({ y, label, answer, value, k, f = C.focus }: { y: number; label: string; answer: number | null; value: string; k: number; f?: string }) {
  const s = useSinceAnswer(answer !== null);
  const u = answer !== null ? easeOut(seg(s, 0.2, 0.7)) : 0;
  const uw = Math.min(250, value.length * 10.7);
  return (
    <g>
      <Row y={y} label={label} value={answer !== null ? value : '?'} valueColor={answer !== null ? f : C.crema} k={k} />
      {answer !== null && <rect x={575 - uw * u} y={y + 12} width={uw * u} height={3} fill={f} />}
    </g>
  );
}

/** Twelve rows' values in physical order: one column matched to row order, one scattered across it. */
/** A cell with a centred label. */
function Cell({ x, y, w, h = 28, label, o = 1, stroke = C.mocha, f = C.crema }: { x: number; y: number; w: number; h?: number; label: string; o?: number; stroke?: string; f?: string }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={C.cocoa} stroke={stroke} strokeWidth={1.5} />
      <T x={x + w / 2} y={y + h / 2 + 4.5} s={12} f={f} a="middle">
        {label}
      </T>
    </g>
  );
}
/** A small cross drawn by `k`. */
function Cross({ x, y, k }: { x: number; y: number; k: number }) {
  return <path d={`M${x - 7} ${y - 7} l14 14 m0 -14 l-14 14`} stroke={C.cherryText} strokeWidth={2.5} opacity={k} />;
}

/** A small tick at (x, y), drawn by `k`. */
function MiniTick({ x, y, k, f = C.focus }: { x: number; y: number; k: number; f?: string }) {
  return <path d={`M${x} ${y} l4 4 l8 -9`} fill="none" stroke={f} strokeWidth={2} strokeDasharray="20" strokeDashoffset={20 * (1 - k)} />;
}
/** A small padlock at (x, y), drawn in by `k`. */
function Lock({ x, y, k, f = C.second }: { x: number; y: number; k: number; f?: string }) {
  return (
    <g opacity={k}>
      <path d={`M${x + 3} ${y} v-4 a5 5 0 0 1 10 0 v4`} fill="none" stroke={f} strokeWidth={2} />
      <rect x={x} y={y} width={16} height={12} rx={2} fill={f} />
    </g>
  );
}
/** A request arrow from (x1, y) toward x2, drawn by `k`, with a small label above it. */
function Req({ x1, x2, y, k, label, f = C.crema, back = 0 }: { x1: number; x2: number; y: number; k: number; label?: string; f?: string; back?: number }) {
  const x = lerp(x1, x2, k) - (x2 - x1) * 0.35 * back;
  return (
    <g opacity={k > 0 ? 1 : 0}>
      <line x1={x1} y1={y} x2={x} y2={y} stroke={f} strokeWidth={1.8} />
      <path d={`M${x} ${y} l${back > 0 ? 8 : -8} -5 v10 z`} fill={f} />
      {label && (
        <T x={(x1 + x2) / 2} y={y - 9} s={11} f={f} a="middle">
          {label}
        </T>
      )}
    </g>
  );
}

/** The nested hierarchy: an application box holding job boxes, each holding one stage box with `tasks` task cells. `kJ`, `kS`, `kT`
 * reveal each level. */
function Hier({
  jobs,
  t0,
  t,
  kA = 1,
  y = 14,
  h = 150,
  label = 'application',
}: {
  jobs: { tasks: number; label: string; hot?: boolean; k: number }[];
  t0?: number;
  t: number;
  kA?: number;
  y?: number;
  h?: number;
  label?: string;
}) {
  const jw = (550 - 20 - (jobs.length - 1) * 12) / jobs.length;
  return (
    <g>
      <rect x={25} y={y} width={550} height={h} rx={6} fill="none" stroke={C.latte} strokeWidth={1.4} opacity={kA} />
      <T x={37} y={y + 20} s={11} f={C.latte} o={kA}>
        {label}
      </T>
      {jobs.map((j, i) => {
        const x = 35 + i * (jw + 12);
        const tw = (jw - 30 - (j.tasks - 1) * 5) / j.tasks;
        return (
          <g key={i} opacity={j.k}>
            <rect x={x} y={y + 30} width={jw} height={h - 40} rx={5} fill="none" stroke={j.hot ? C.focus : C.mocha} strokeWidth={1.6} />
            <T x={x + 10} y={y + 48} s={11} f={j.hot ? C.focus : C.latte}>
              {j.label}
            </T>
            <rect x={x + 8} y={y + 58} width={jw - 16} height={h - 76} rx={4} fill="none" stroke={C.second} strokeWidth={1.2} />
            <T x={x + 16} y={y + 74} s={11} f={C.second}>
              stage
            </T>
            {Array.from({ length: j.tasks }, (_, k) => {
              const q = clamp((t - (t0 ?? 0) - k * 0.12) / 0.3);
              return <rect key={k} x={x + 15 + k * (tw + 5)} y={y + 84} width={tw} height={h - 112} rx={2} fill={C.cocoa} stroke={C.focus} strokeWidth={1.2} opacity={q} />;
            })}
          </g>
        );
      })}
    </g>
  );
}

// 1 · Hook. Four words zoom in as nested boxes, each label decoding, then a "?" pops beside each for what fixes its
// count, and brackets lock onto the task.
export function Hook({ t }: StepCtx) {
  const words = ['application', 'job', 'stage', 'task'];
  const box = (i: number): [number, number, number, number] => [25 + i * 30, 14 + i * 26, 550 - i * 60, 170 - i * 40];
  return (
    <Svg label="one click: 'application', 'job', 'stage', 'task'. Which number does each actually fix?" h={200}>
      {words.map((w, i) => {
        // each level zooms in out of the one around it
        const k = easeOutExpo(seg(t, 0.3 + i * 0.5, 0.8 + i * 0.5));
        if (k <= 0) return null;
        const [x, y, bw, bh] = box(i);
        const [px, py, pw, ph] = i === 0 ? [300 - 20, 99 - 10, 40, 20] : box(i - 1);
        const q = easeOutBack(seg(t, 2.6 + i * 0.3, 2.95 + i * 0.3));
        return (
          <g key={w}>
            <rect x={lerp(px, x, k)} y={lerp(py, y, k)} width={lerp(pw, bw, k)} height={lerp(ph, bh, k)} rx={5} fill="none" stroke={i === 3 ? C.focus : C.mocha} strokeWidth={1.4} />
            <Decode text={w} t={t} at={0.45 + i * 0.5} x={37 + i * 30} y={32 + i * 26} s={13} f={C.crema} />
            {q > 0 && (
              <g transform={`translate(${563 - i * 30} ${27 + i * 26}) scale(${clamp(q, 0, 1.3).toFixed(3)})`}>
                <T x={0} y={5} s={13} f={C.second} a="end">
                  ?
                </T>
              </g>
            )}
          </g>
        );
      })}
      <Reticle x={300} y={117} w={382} h={62} t={t} at={3.9} />
    </Svg>
  );
}

// 2 · One job. A count over four partitions: one job box, one stage, four task cells filling one by one.
export function RevealOneJob({ t }: StepCtx) {
  return (
    <Svg label="one action, four partitions, no shuffle: one job, one stage, four tasks." h={200}>
      <Hier t={t} t0={1.6} jobs={[{ tasks: 4, label: 'job · count()', hot: true, k: easeOut(seg(t, 0.6, 1.0)) }]} kA={easeOut(seg(t, 0.1, 0.4))} h={140} />
      <T x={25} y={188} s={12} f={C.focus} o={easeOut(seg(t, 2.6, 3.0))}>
        four partitions, four tasks: one each
      </T>
    </Svg>
  );
}

// 3 · Predict. The same job box, and a second count() arriving: reuse it, or a new one?
export function PredictSecondAction({ t, answer }: StepCtx) {
  return (
    <Svg label="the same DataFrame, a second count(). Same job again, or a new one?" h={200}>
      <Cell x={25} y={20} w={200} h={30} label="job · count()" stroke={C.focus} o={easeOut(seg(t, 0.1, 0.4))} />
      <Cell x={360} y={20} w={200} h={30} label="count(), again" stroke={C.second} o={easeOut(seg(t, 0.8, 1.2))} />
      <T x={292} y={40} s={14} f={C.latte} a="middle" o={easeOut(seg(t, 1.4, 1.8))}>
        ?
      </T>
      <T x={25} y={84} s={11} f={C.latte} o={easeOut(seg(t, 1.6, 2.0))}>
        same data, same four partitions
      </T>
      <AnswerRow y={130} label="the second count()" answer={answer} value="a new job" k={easeOut(seg(t, 2.2, 2.7))} />
      <Verdict answer={answer} y={178} text="a job is what one action spawns" />
    </Svg>
  );
}

// 4 · A new job, measured. A second job box slides in beside the first inside the application, with its own new id tag.
export function RevealNewJob({ t }: StepCtx) {
  const k2 = easeOut(seg(t, 0.8, 1.4));
  return (
    <Svg label="measured: the second count() got a brand new job id, not the first one again." h={200}>
      <Hier
        t={t + 5}
        jobs={[
          { tasks: 4, label: 'job · 1st count()', k: 1 },
          { tasks: 4, label: 'job · 2nd count()', hot: true, k: k2 },
        ]}
        h={140}
      />
      <T x={25} y={188} s={12} f={C.focus} o={easeOut(seg(t, 2.0, 2.4))}>
        status tracker: a job id the first never had
      </T>
    </Svg>
  );
}

// 5 · repartition(8). The stage's four task cells split into eight; the label counts with them.
export function RevealRepartitionTasks({ t }: StepCtx) {
  const s = easeInOut(seg(t, 1.0, 2.2));
  const n = s > 0.5 ? 8 : 4;
  return (
    <Svg label="repartition(8), then count(): the task count followed the partition count, to eight." h={200}>
      <T x={25} y={24} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        1,000,000 rows · repartition(8)
      </T>
      {Array.from({ length: 8 }, (_, i) => {
        const four = Math.floor(i / 2);
        const x4 = 25 + four * 140;
        const w4 = 130;
        const x8 = 25 + i * 70;
        const w8 = 62;
        const half = i % 2;
        const x = lerp(x4 + (half ? w4 / 2 : 0), x8, s);
        const w = lerp(w4 / 2 - 2, w8, s);
        return (
          <g key={i}>
            {!half && <rect x={x4} y={40} width={w4} height={50} rx={2} fill={C.cocoa} stroke={C.focus} strokeWidth={1.4} opacity={1 - s} />}
            <rect x={x} y={40} width={w} height={50} rx={2} fill={C.cocoa} stroke={C.focus} strokeWidth={1.4} opacity={s} />
          </g>
        );
      })}
      <Row y={140} label="tasks in the stage" value={String(n)} valueColor={C.focus} big k={easeOut(seg(t, 0.4, 0.8))} />
      <T x={25} y={186} s={12} f={C.crema} o={easeOut(seg(t, 2.6, 3.0))}>
        not rows, not bytes: partitions only
      </T>
    </Svg>
  );
}

// 6 · Driver and executors. The driver box (main(), SparkContext) sends task arrows to a separate set of executor processes.
export function RevealDriverExecutor({ t }: StepCtx) {
  const a = easeInOut(seg(t, 2.0, 2.8));
  return (
    <Svg label="Spark's own glossary: the driver runs main() and owns SparkContext; executors run the tasks." h={200}>
      <rect x={25} y={30} width={180} height={80} rx={5} fill={C.cocoa} stroke={C.focus} strokeWidth={1.8} opacity={easeOut(seg(t, 0.1, 0.5))} />
      <T x={40} y={56} s={13} f={C.crema} o={easeOut(seg(t, 0.1, 0.5))}>
        driver
      </T>
      <T x={40} y={78} s={11} f={C.latte} o={easeOut(seg(t, 0.6, 1.0))}>
        runs main()
      </T>
      <T x={40} y={98} s={11} f={C.latte} o={easeOut(seg(t, 1.0, 1.4))}>
        owns SparkContext
      </T>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Cell x={400} y={20 + i * 44} w={150} h={30} label="executor" stroke={C.second} o={easeOut(seg(t, 1.4 + i * 0.2, 1.7 + i * 0.2))} />
          <Req x1={207} x2={395} y={35 + i * 44} k={a} f={C.focus} label={i === 0 ? 'tasks' : undefined} />
        </g>
      ))}
      <T x={400} y={178} s={11} f={C.latte} o={easeOut(seg(t, 3.0, 3.4))}>
        separate processes
      </T>
    </Svg>
  );
}

// 7 · Recap. The full hierarchy, each level's count rule beside it.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="application holds jobs, a job holds stages cut at a shuffle, a stage holds one task per partition." h={250}>
      <Row y={40} label="a job" value="one per action" k={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={100} label="a stage" value="cut at each shuffle" valueColor={C.second} k={easeOut(seg(t, 1.2, 1.6))} />
      <Row y={160} label="a task" value="one per partition" valueColor={C.focus} k={easeOut(seg(t, 2.2, 2.6))} />
      <T x={25} y={220} s={11} f={C.latte} o={easeOut(seg(t, 3.0, 3.4))}>
        each one measured, none guessed
      </T>
    </Svg>
  );
}
