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
function Pip({ x, y, o = 1, f = C.second, s = 10 }: { x: number; y: number; o?: number; f?: string; s?: number }) {
  return <rect x={x - s / 2} y={y - s / 2} width={s} height={s} rx={2} fill={f} opacity={o} />;
}

function Hole({ x, y, w, h = 28, o = 1, stroke = C.mocha }: { x: number; y: number; w: number; h?: number; o?: number; stroke?: string }) {
  return <rect x={x} y={y} width={w} height={h} rx={4} fill="none" stroke={stroke} strokeWidth={1.5} strokeDasharray="4 3" opacity={o} />;
}
/** A fan line from (x1, y1) to (x2, y2), drawn by `k`, ending in a dot. */
/** A fan line from (x1, y1) to (x2, y2), drawn by `k`, ending in a dot. */
function Fan({ x1, y1, x2, y2, k, f = C.crema }: { x1: number; y1: number; x2: number; y2: number; k: number; f?: string }) {
  if (k <= 0) return null;
  const x = lerp(x1, x2, k);
  const y = lerp(y1, y2, k);
  return (
    <g>
      <line x1={x1} y1={y1} x2={x} y2={y} stroke={f} strokeWidth={1.6} />
      <circle cx={x} cy={y} r={3} fill={f} />
    </g>
  );
}

// Every value here is examples.py's own or its SOURCES.md's: exit code 137 as 128 plus SIGKILL's 9, the 4,096 MiB limit and
// its default 25 percent heap ceiling of 1,024 MiB, the 10 and 40 percent overheads with PySpark's 1,600 MiB on 4,000 and
// the 384 MiB floor under 2,048, and cpu.max's "max 100000" default and "20000 100000" quota throttled 0.8 of the time.
// Kill counts and the JVM job's own overhead are drawn as pips and lengths. These steps are short, so each scene runs its
// own clock a little faster (t = t0 times a factor).

/** A container: an outer box whose top edge is the limit line, red, labelled lim. */
function Box({ x, y, w, h, o = 1 }: { x: number; y: number; w: number; h: number; o?: number }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={h} rx={4} fill="none" stroke={C.mocha} strokeWidth={1.5} />
      <line x1={x - 6} y1={y} x2={x + w + 6} y2={y} stroke={C.cherryText} strokeWidth={1.6} />
      <T x={x + w + 6} y={y - 6} s={11} f={C.cherryText} a="end">
        lim
      </T>
    </g>
  );
}

/** A filled block with a label, for heap and the parts beside it. */
function Block({ x, y, w, h, label, o = 1, stroke = C.latte }: { x: number; y: number; w: number; h: number; label?: string; o?: number; stroke?: string }) {
  if (h <= 0 || w <= 0) return null;
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={h} rx={2} fill={C.cocoa} stroke={stroke} strokeWidth={1.4} />
      {label && h >= 16 && (
        <T x={x + w / 2} y={y + h / 2 + 4} s={11} f={C.crema} a="middle">
          {label}
        </T>
      )}
    </g>
  );
}

// 0 · Hook. A pod's heap sits at half its box, and two OOMKilled pips land. "More memory": a bigger box, the heap still at
// half, and the kill pips come faster, five of them.
export function Hook({ t: t0 }: StepCtx) {
  const t = t0 * 1.8;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const g1 = easeOut(seg(t, 0.1, 0.6));
  const g2 = easeOut(seg(t, 1.9, 2.4));
  return (
    <Svg label="An executor pod is OOMKilled while its JVM heap sits at about half of what it was given" h={250}>
      <Box x={25} y={70} w={200} h={120} o={k(0)} />
      <Block x={45} y={190 - 60 * g1} w={80} h={60 * g1} label="heap" />
      <T x={25} y={214} s={11} f={C.cherryText} o={k(0.6)}>
        OOMKilled
      </T>
      {[0, 1].map((i) => (
        <Pip key={i} x={115 + i * 18} y={210} f={C.cherryText} o={k(0.8 + i * 0.4)} />
      ))}
      <Req x1={240} x2={318} y={130} k={k(1.5)} label="more memory" />
      <Box x={330} y={40} w={235} h={150} o={k(1.8)} />
      <Block x={350} y={190 - 75 * g2} w={90} h={75 * g2} label="heap" />
      <T x={330} y={214} s={11} f={C.cherryText} o={k(2.4)}>
        OOMKilled
      </T>
      {[0, 1, 2, 3, 4].map((i) => (
        <Pip key={i} x={420 + i * 18} y={210} f={C.cherryText} o={k(2.6 + i * 0.25)} />
      ))}
      {t > 3.9 && (
        <T x={25} y={242} s={12} f={C.crema} o={k(3.9)}>
          killed more often, not less
        </T>
      )}
    </Svg>
  );
}

// 1 · Predict. The container is full to its limit while the heap block fills only the bottom half; the top half is a dashed
// "?". Once answered, it fills with three blocks: metaspace, thread stacks, native buffers.
export function PredictNonHeap({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const parts = ['metaspace', 'thread stacks', 'native buffers'];
  return (
    <Svg label="What did the kernel count that the heap didn't?" h={250}>
      <Box x={150} y={40} w={300} h={160} o={k(0)} />
      <Block x={165} y={122} w={270} h={74} label="heap: about half" o={k(0.2)} />
      {answer === null && <Hole x={165} y={46} w={270} h={70} o={k(0.5)} />}
      {answer === null && t > 0.8 && (
        <T x={300} y={86} s={15} f={C.taupe} a="middle" o={k(0.8)}>
          ?
        </T>
      )}
      {answer !== null &&
        parts.map((p, i) => {
          const a = easeOut(seg(s, 0.1 + i * 0.2, 0.4 + i * 0.2));
          return <Block key={p} x={165} y={lerp(122, 96 - i * 25, a)} w={270} h={22} label={p} o={a} stroke={C.second} />;
        })}
      <Verdict answer={answer} text="the JVM's non-heap memory" y={228} />
    </Svg>
  );
}

// 2 · The limit is a file. The memory.max file pins a red line across the drawing. A usage bar, heap below and non-heap
// above, climbs to it and through it; the OOM killer's arrow lands on it, and both parts turn the same red.
export function KernelFile({ t: t0 }: StepCtx) {
  const t = t0 * 1.95;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const heap = easeOut(seg(t, 0.6, 1.2)) * 60;
  const non = easeInOut(seg(t, 1.2, 2.4)) * 76;
  const over = t > 2.4;
  return (
    <Svg label="memory.max is a hard limit the kernel enforces; crossing it invokes the cgroup's OOM killer" h={250}>
      <Cell x={25} y={40} w={150} label="memory.max" o={k(0)} stroke={C.cherryText} />
      <path d={`M175 54 H${lerp(175, 560, k(0.2))}`} stroke={C.cherryText} strokeWidth={1.6} strokeDasharray="5 4" opacity={0.6} />
      <line x1={220} y1={70} x2={lerp(220, 560, k(0.3))} y2={70} stroke={C.cherryText} strokeWidth={1.8} />
      <Block x={300} y={200 - heap} w={80} h={heap} stroke={over ? C.cherryText : C.latte} />
      <Block x={300} y={200 - heap - non} w={80} h={non} stroke={over ? C.cherryText : C.second} />
      <T x={395} y={180} s={11} f={C.latte} o={k(0.8)}>
        heap
      </T>
      <T x={395} y={120} s={11} f={C.second} o={k(1.6)}>
        non-heap
      </T>
      <Req x1={120} x2={290} y={120} k={k(2.6)} f={C.cherryText} />
      {t > 2.6 && (
        <T x={25} y={124} s={11} f={C.cherryText} o={k(2.6)}>
          OOM killer
        </T>
      )}
      {t > 3.4 && (
        <T x={25} y={236} s={12} f={C.crema} o={k(3.4)}>
          it never asks which kind crossed the line
        </T>
      )}
    </Svg>
  );
}

// 3 · Three deaths. Left: the kernel kill crosses the whole process out, exit code 137, the oom_kill counter up. Middle: a
// JVM raises OutOfMemoryError, which drops in, and the process stays, ticked. Right: Python's RSS climbs, and nothing is raised.
export function ThreeDeaths({ t: t0 }: StepCtx) {
  const t = t0 * 1.43;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const climb = easeInOut(seg(t, 2.8, 3.8));
  const pts = Array.from({ length: 21 }, (_, i) => i / 20).filter((p) => p <= climb);
  return (
    <Svg label="Three different memory deaths, three different log lines" h={250}>
      <T x={25} y={30} s={11} f={C.taupe} o={k(0)}>
        kernel kill
      </T>
      <Cell x={25} y={46} w={160} label="process" o={k(0)} stroke={t > 0.6 ? C.cherryText : C.mocha} />
      <Cross x={105} y={60} k={k(0.6)} />
      {t > 0.9 && (
        <T x={25} y={106} s={11} f={C.cherryText} o={k(0.9)}>
          exit code 137
        </T>
      )}
      {t > 1.2 && (
        <T x={25} y={130} s={11} f={C.cherryText} o={k(1.2)}>
          oom_kill counter up
        </T>
      )}
      <T x={220} y={30} s={11} f={C.taupe} o={k(1.4)}>
        JVM heap
      </T>
      <Cell x={220} y={46} w={160} label="JVM" o={k(1.4)} />
      <Cell x={220} y={lerp(60, 90, easeOutBack(seg(t, 1.7, 2.2)))} w={160} label="OutOfMemoryError" o={k(1.7)} stroke={C.cherryText} />
      <MiniTick x={220} y={140} k={k(2.3)} />
      <T x={240} y={148} s={11} f={C.focus} o={k(2.3)}>
        caught; still alive
      </T>
      <T x={415} y={30} s={11} f={C.taupe} o={k(2.6)}>
        Python RSS
      </T>
      <line x1={415} y1={150} x2={575} y2={150} stroke={C.mocha} strokeWidth={1.4} opacity={k(2.6)} />
      <line x1={415} y1={46} x2={415} y2={150} stroke={C.mocha} strokeWidth={1.4} opacity={k(2.6)} />
      {pts.length > 1 && <path d={pts.map((p, i) => `${i ? 'L' : 'M'}${415 + p * 155} ${150 - p * p * 96}`).join(' ')} fill="none" stroke={C.latte} strokeWidth={2} />}
      {t > 3.8 && (
        <T x={415} y={174} s={11} f={C.taupe} o={k(3.8)}>
          nothing raised
        </T>
      )}
    </Svg>
  );
}

// 4 · JVM sizing. The 4,096 MiB limit as one long bar. A quarter of it fills as the heap ceiling, 1,024 MiB, then the
// remaining three quarters fill block by block with what else a JVM holds.
export function JvmSizing({ t: t0 }: StepCtx) {
  const t = t0 * 1.65;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const hw = 550 * 0.25 * easeOut(seg(t, 0.4, 1.2));
  return (
    <Svg label="The JVM reads the container limit but defaults its heap ceiling to 25 percent of it" h={250}>
      <T x={25} y={50} s={11} f={C.latte} o={k(0)}>
        container limit: 4,096 MiB
      </T>
      <rect x={25} y={62} width={550} height={30} rx={3} fill="none" stroke={C.cherryText} strokeWidth={1.6} opacity={k(0)} />
      <Block x={25} y={62} w={hw} h={30} label={hw > 120 ? 'heap' : undefined} />
      {[0, 1, 2, 3].map((i) => {
        const a = easeOut(seg(t, 1.6 + i * 0.35, 1.9 + i * 0.35));
        return <Block key={i} x={162.5 + i * 103.1} y={62} w={103.1 * a} h={30} stroke={C.second} />;
      })}
      {t > 1.2 && (
        <T x={25} y={116} s={11} f={C.crema} o={k(1.2)}>
          heap ceiling: 25%, 1,024 MiB
        </T>
      )}
      {t > 1.8 && (
        <T x={25} y={150} s={11} f={C.second} o={k(1.8)}>
          the rest: metaspace, thread stacks,
        </T>
      )}
      {t > 2.6 && (
        <T x={25} y={172} s={11} f={C.second} o={k(2.6)}>
          direct buffers, native libraries
        </T>
      )}
      {t > 3.6 && (
        <T x={25} y={226} s={12} f={C.crema} o={k(3.6)}>
          it reads the limit, and leaves room
        </T>
      )}
    </Svg>
  );
}

// 5 · Spark's overhead. Three executors as bars: heap outlined, overhead filled after it. A JVM job's 10 percent, PySpark's
// 40 percent on 4,000 MiB, 1,600 MiB, and a small 2,048 MiB JVM executor's overhead pushed up to its 384 MiB floor.
export function SparkOverhead({ t: t0 }: StepCtx) {
  const t = t0 * 1.65;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const sc = 0.07;
  const rows: [string, number, number, string, number][] = [
    ['JVM job', 4000, 400, 'overhead 10%', 0.3],
    ['PySpark', 4000, 1600, 'overhead 40%: 1,600 MiB', 1.3],
    ['small JVM job', 2048, 384, 'floored at 384 MiB', 2.3],
  ];
  return (
    <Svg label="Spark's memoryOverhead is executor memory times a factor, floored at 384 mebibytes" h={250}>
      {rows.map(([l, heap, ov, note, d], i) => {
        const y = 40 + i * 60;
        const hw = heap * sc * easeOut(seg(t, d, d + 0.4));
        const ow = ov * sc * easeOut(seg(t, d + 0.4, d + 0.8));
        return (
          <g key={l}>
            <T x={25} y={y + 13} s={11} f={C.crema} o={k(d)}>
              {l}
            </T>
            <rect x={140} y={y} width={hw} height={18} rx={2} fill={C.cocoa} stroke={C.latte} strokeWidth={1.4} opacity={hw > 0 ? 1 : 0} />
            <rect x={140 + heap * sc} y={y} width={ow} height={18} rx={2} fill={C.second} opacity={ow > 0 ? 1 : 0} />
            {t > d + 0.8 && (
              <T x={140} y={y + 36} s={11} f={C.second} o={k(d + 0.8)}>
                {note}
              </T>
            )}
          </g>
        );
      })}
      {t > 3.6 && (
        <T x={25} y={236} s={12} f={C.crema} o={k(3.6)}>
          both have to fit inside the one limit
        </T>
      )}
    </Svg>
  );
}

// 6 · CPU quota. cpu.max reads "20000 100000". A cursor runs across three periods; each period's first fifth fills as work,
// then the rest turns red, throttled, and one nr_throttled pip lands per period.
export function CpuQuota({ t: t0 }: StepCtx) {
  const t = t0 * 1.65;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const pw = 550 / 3;
  const cur = easeInOut(seg(t, 0.4, 3.4)) * 550;
  return (
    <Svg label="A hungry process burns its CPU quota early in the period and sits throttled for the rest" h={250}>
      <T x={25} y={32} s={11} f={C.crema} o={k(0)}>
        cpu.max: 20000 100000
      </T>
      <T x={575} y={32} s={11} f={C.taupe} a="end" o={k(0.2)}>
        default: max 100000
      </T>
      {[0, 1, 2].map((p) => {
        const x0 = 25 + p * pw;
        const work = clamp(cur - p * pw, 0, pw * 0.2);
        const thr = clamp(cur - p * pw - pw * 0.2, 0, pw * 0.8);
        return (
          <g key={p}>
            <rect x={x0} y={70} width={pw - 4} height={30} rx={2} fill="none" stroke={C.mocha} strokeWidth={1.3} opacity={k(0)} />
            {work > 0 && <rect x={x0} y={70} width={work} height={30} rx={2} fill={C.latte} />}
            {thr > 4 && <rect x={x0 + pw * 0.2} y={74} width={thr - 4} height={22} rx={2} fill="none" stroke={C.cherryText} strokeWidth={1.4} strokeDasharray="4 3" />}
            {cur > x0 - 25 + pw - 4 && <Pip x={160 + p * 22} y={166} f={C.cherryText} />}
          </g>
        );
      })}
      {t > 1.2 && (
        <T x={25 + pw * 0.2} y={124} s={11} f={C.cherryText} o={k(1.2)}>
          throttled: 0.8 of the period
        </T>
      )}
      <T x={25} y={170} s={11} f={C.latte} o={k(0.6)}>
        nr_throttled
      </T>
      {t > 3.6 && (
        <T x={25} y={226} s={12} f={C.crema} o={k(3.6)}>
          counted, for anyone who looks
        </T>
      )}
    </Svg>
  );
}

// 7 · Predict. A node, otherwise idle: one pod, and a row of empty cores beside it. Its lane keeps working. Once answered,
// the gaps after each burst turn red: throttled anyway.
export function PredictCpuIdle({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.8)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const pw = 340 / 3;
  return (
    <Svg label="A pod has a CPU limit; the node is otherwise idle. Is it throttled anyway?" h={250}>
      <rect x={25} y={30} width={550} height={170} rx={6} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={k(0)} />
      <T x={40} y={52} s={11} f={C.taupe} o={k(0)}>
        a node, otherwise idle
      </T>
      <Cell x={45} y={90} w={130} label="the pod" o={k(0.2)} />
      {[0, 1, 2].map((p) => (
        <g key={p}>
          <rect x={210 + p * pw} y={92} width={pw - 4} height={24} rx={2} fill="none" stroke={C.mocha} strokeWidth={1.2} opacity={k(0.4)} />
          <rect x={210 + p * pw} y={92} width={(pw - 4) * 0.2} height={24} rx={2} fill={C.latte} opacity={k(0.5)} />
          {v > 0 && <rect x={210 + p * pw + pw * 0.2} y={96} width={(pw * 0.8 - 6) * v} height={16} rx={2} fill="none" stroke={C.cherryText} strokeWidth={1.4} strokeDasharray="4 3" />}
        </g>
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={210 + i * 30} y={150} width={20} height={20} rx={3} fill="none" stroke={C.mocha} strokeWidth={1.2} opacity={k(0.6 + i * 0.05)} />
      ))}
      <T x={400} y={165} s={11} f={C.taupe} o={k(0.7)}>
        idle cores
      </T>
      {answer === null && t > 1.0 && (
        <T x={45} y={160} s={15} f={C.taupe} o={k(1.0)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="yes: its own quota throttles it" y={230} f={C.cherryText} />
    </Svg>
  );
}

// 8 · Probes. Top, no startup probe: the slow start grows, liveness checks and crosses it out, it restarts and grows again,
// crossed out again: a loop. Bottom, a startup probe first: the start runs to its end, the startup probe ticks, and only
// then do liveness and readiness begin, ticking.
export function Probes({ t: t0 }: StepCtx) {
  const t = t0 * 1.55;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const run1 = easeInOut(seg(t, 0.2, 0.9)) * (t < 1.1 ? 1 : 0);
  const run2 = easeInOut(seg(t, 1.2, 1.9));
  const top = t < 1.1 ? run1 : run2;
  const bot = easeInOut(seg(t, 2.2, 3.3));
  return (
    <Svg label="Three probes, three different actions on failure" h={250}>
      <T x={25} y={32} s={11} f={C.taupe} o={k(0)}>
        no startup probe
      </T>
      <T x={25} y={62} s={11} f={C.latte} o={k(0)}>
        starting
      </T>
      <rect x={140} y={50} width={Math.max(0, 190 * top)} height={16} rx={2} fill={C.latte} />
      <T x={25} y={90} s={11} f={C.latte} o={k(0)}>
        liveness
      </T>
      <Cross x={330} y={86} k={t > 0.9 && t < 1.2 ? 1 : k(1.9)} />
      {t > 2.0 && (
        <T x={355} y={90} s={11} f={C.cherryText} o={k(2.0)}>
          restart loop
        </T>
      )}
      <T x={25} y={128} s={11} f={C.taupe} o={k(2.1)}>
        a startup probe first
      </T>
      <T x={25} y={156} s={11} f={C.latte} o={k(2.1)}>
        starting
      </T>
      <rect x={140} y={144} width={Math.max(0, 260 * bot)} height={16} rx={2} fill={C.latte} />
      <T x={25} y={182} s={11} f={C.latte} o={k(2.1)}>
        startup
      </T>
      <MiniTick x={394} y={176} k={k(3.3)} />
      <T x={25} y={208} s={11} f={C.latte} o={k(2.1)}>
        liveness, readiness
      </T>
      <line x1={230} y1={204} x2={400} y2={204} stroke={C.mocha} strokeWidth={1.4} strokeDasharray="4 3" opacity={k(2.3)} />
      <MiniTick x={430} y={202} k={k(3.6)} />
      <MiniTick x={470} y={202} k={k(3.8)} />
    </Svg>
  );
}

// 9 · Recap. Cards slide in: the limit is a kernel file; heap plus overhead fit inside it; a startup probe for slow starts.
// An arrow then points on to the next topic: eviction order.
export function Recap({ t: t0 }: StepCtx) {
  const t = t0 * 1.95;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const pts = ['a limit is a kernel file', 'heap plus overhead fit inside it', 'a startup probe for a slow start'];
  return (
    <Svg label="Five things to keep from this topic" h={250}>
      {pts.map((p, i) => {
        const a = easeOut(seg(t, 0.3 + i * 0.7, 0.75 + i * 0.7));
        return a > 0 ? <Cell key={p} x={lerp(9, 25, a)} y={36 + i * 46} w={330} label={p} o={a} /> : null;
      })}
      <Req x1={365} x2={430} y={110} k={k(2.6)} />
      <Cell x={440} y={96} w={135} label="next: eviction" o={k(2.9)} stroke={C.second} />
    </Svg>
  );
}
function easeIn2(x: number) {
  return x * x;
}
