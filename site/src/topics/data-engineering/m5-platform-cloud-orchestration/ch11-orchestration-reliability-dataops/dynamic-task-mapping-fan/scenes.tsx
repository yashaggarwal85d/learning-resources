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

// Every number here is examples.py's own: the run that mapped 5 files, the 1024 and 1025-file runs on either side of the
// limit with Airflow's real rejection reason and message, and the 10, 100, 500 and 1024-file timings. Those timings are
// machine-dependent, so they are drawn as bar lengths, never printed. Files and task instances are drawn as pips.

// 0 · A task written for one file. The drop folder fills with tiny files; their task instances stream into the shared
// scheduler, and the other Dags' progress bars slow to a crawl.
export function Hook({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const before = clamp(t / 1.8);
  return (
    <Svg label="one file, eleven thousand files. the cluster slows down." h={250}>
      <Cell x={25} y={30} w={200} label="a task for one file" o={k(0)} />
      <rect x={25} y={70} width={200} height={110} rx={6} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={k(0.3)} />
      {Array.from({ length: 70 }, (_, j) => (
        <rect
          key={j}
          x={33 + (j % 10) * 19}
          y={78 + Math.floor(j / 10) * 14}
          width={12}
          height={9}
          rx={1}
          fill="none"
          stroke={C.crema}
          strokeWidth={1}
          opacity={easeOut(seg(t, 0.6 + j * 0.017, 0.8 + j * 0.017))}
        />
      ))}
      <T x={25} y={200} s={11} f={C.taupe} o={k(0.6)}>
        the drop folder, eleven thousand files
      </T>
      {Array.from({ length: 10 }, (_, j) => {
        const m = seg(t, 1.8 + j * 0.12, 2.3 + j * 0.12);
        return m > 0 && m < 1 ? <Pip key={j} x={lerp(232, 330, m)} y={lerp(120, 50, m)} s={8} f={C.caramel} /> : null;
      })}
      <Cell x={335} y={30} w={240} label="the shared scheduler" o={k(0.1)} stroke={t > 2.2 ? C.cherryText : C.mocha} />
      <T x={335} y={82} s={11} f={C.taupe} o={k(0.2)}>
        other Dags
      </T>
      {[0, 1, 2].map((i) => {
        const p = 0.35 * before + 0.06 * clamp(seg(t, 1.8, 4.8)) + i * 0.05;
        return (
          <g key={i} opacity={k(0.2)}>
            <rect x={335} y={92 + i * 24} width={240} height={10} rx={3} fill="none" stroke={C.mocha} strokeWidth={1.2} />
            <rect x={335} y={92 + i * 24} width={240 * p} height={10} rx={3} fill={t > 2.4 ? C.cherryText : C.focus} />
          </g>
        );
      })}
      {t > 3.0 && (
        <T x={335} y={180} s={11} f={C.cherryText} o={k(3.0)}>
          slowed to a crawl
        </T>
      )}
      {t > 3.9 && (
        <T x={25} y={236} s={12} f={C.crema} o={k(3.9)}>
          and nobody wrote code asking for that
        </T>
      )}
    </Svg>
  );
}

// 1 · A for loop's count is stamped when it's written. Expand's count is decided when the run discovers its files: five
// file pips appear, and five task instances fan out from them.
export function RevealExpandPartial({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="fan-out count decided at run time, not write time." h={250}>
      <T x={25} y={36} s={12} f={C.taupe} o={k(0)}>
        a for loop: the count is fixed when written
      </T>
      {[0, 1, 2].map((i) => (
        <rect key={i} x={25 + i * 40} y={50} width={30} height={20} rx={3} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={k(0.4 + i * 0.1)} />
      ))}
      <Lock x={150} y={64} k={k(0.9)} f={C.taupe} />
      <T x={25} y={110} s={12} f={C.crema} o={k(1.6)}>
        expand: decided at run time
      </T>
      <Cell x={25} y={124} w={170} label="discover_files()" o={k(1.8)} stroke={C.focus} />
      {[0, 1, 2, 3, 4].map((i) => (
        <Pip key={i} x={226 + i * 24} y={138} s={12} f={C.second} o={easeOutBack(seg(t, 2.3 + i * 0.12, 2.6 + i * 0.12))} />
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <Fan x1={340} y1={138} x2={396} y2={105 + i * 22} k={easeOut(seg(t, 3.0 + i * 0.08, 3.3 + i * 0.08))} f={C.second} />
          <rect x={402} y={97 + i * 22} width={120} height={16} rx={3} fill="none" stroke={C.second} strokeWidth={1.5} opacity={easeOut(seg(t, 3.2 + i * 0.08, 3.5 + i * 0.08))} />
        </g>
      ))}
      {t > 3.8 && (
        <T x={25} y={232} s={12} f={C.focus} o={k(3.8)}>
          five files, five instances, nobody wrote five
        </T>
      )}
    </Svg>
  );
}

// 2 · Predict. A pile of files heads for the limit. Clipped, or refused? Once answered, the gate crosses and the whole run
// turns failed; nothing passes.
export function PredictTruncateOrFail({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="too many files. clipped, or refused outright?" h={250}>
      {Array.from({ length: 48 }, (_, j) => (
        <Pip key={j} x={35 + (j % 8) * 20} y={56 + Math.floor(j / 8) * 18} s={10} f={C.crema} o={k(0.1 + j * 0.008)} />
      ))}
      <line x1={260} y1={40} x2={260} y2={170} stroke={v > 0.5 ? C.cherryText : C.caramel} strokeWidth={1.8} strokeDasharray="5 4" opacity={k(0.5)} />
      <T x={260} y={30} s={11} f={C.caramel} a="middle" o={k(0.5)}>
        the limit
      </T>
      <Cross x={260} y={105} k={v} />
      {v <= 0.5 && <Cell x={380} y={90} w={175} label="the run" o={k(0.7)} />}
      {v > 0.5 && <Cell x={380} y={90} w={175} label="run failed" stroke={C.cherryText} f={C.cherryText} />}
      {answer === null && t > 1.1 && (
        <T x={300} y={206} s={15} f={C.taupe} a="middle" o={k(1.1)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="refused outright, nothing clipped" y={222} />
    </Svg>
  );
}

// 3 · Two nearly equal bars: 1024 files, success; 1025, the same bar plus one red pip, and the whole run fails with
// Airflow's real reason and message.
export function RevealExactBoundary({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const g1 = easeInOut(seg(t, 0.3, 1.2));
  const g2 = easeInOut(seg(t, 1.5, 2.4));
  return (
    <Svg label="one more file than the limit. the run fails." h={250}>
      <T x={25} y={51} s={12} f={C.crema} o={k(0)}>
        1024 files
      </T>
      <rect x={140} y={38} width={360 * g1} height={16} rx={2} fill={C.second} opacity={g1 > 0 ? 1 : 0} />
      {t > 1.2 && (
        <T x={140} y={76} s={11} f={C.focus} o={k(1.2)}>
          success, every one
        </T>
      )}
      <T x={25} y={121} s={12} f={C.crema} o={k(1.3)}>
        1025 files
      </T>
      <rect x={140} y={108} width={360 * g2} height={16} rx={2} fill={C.second} opacity={g2 > 0 ? 1 : 0} />
      <Pip x={510} y={116} s={12} f={C.cherryText} o={easeOutBack(seg(t, 2.4, 2.7))} />
      {t > 2.8 && (
        <T x={140} y={146} s={11} f={C.cherryText} o={k(2.8)}>
          the whole run failed
        </T>
      )}
      {t > 3.3 && (
        <T x={25} y={188} s={11} f={C.cherryText} o={k(3.3)}>
          unmappable_return_value_length
        </T>
      )}
      {t > 3.6 && (
        <T x={25} y={210} s={11} f={C.taupe} o={k(3.6)}>
          pushed value is too large to map as a downstream's dependency
        </T>
      )}
      {t > 4.1 && (
        <T x={25} y={238} s={12} f={C.focus} o={k(4.1)}>
          one single file decides it
        </T>
      )}
    </Svg>
  );
}

// 4 · Four timed runs as four bars, each bar's length its measured wall time: 10, 100, 500 and 1024 files. The last one
// stretches far past the first.
export function RevealOverheadScaling({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const rows = [
    { n: '10 files', w: 38, d: 0.3 },
    { n: '100 files', w: 74, d: 0.9 },
    { n: '500 files', w: 213, d: 1.5 },
    { n: '1024 files', w: 400, d: 2.1 },
  ];
  return (
    <Svg label="ten, a hundred, five hundred, a thousand files. timed." h={250}>
      {rows.map((r, i) => {
        const y = 36 + i * 40;
        const g = easeOut(seg(t, r.d, r.d + 0.7));
        return (
          <g key={r.n}>
            <T x={25} y={y + 13} s={12} f={C.crema} o={k(r.d)}>
              {r.n}
            </T>
            <rect x={140} y={y} width={r.w * g} height={18} rx={2} fill={i === 3 ? C.cherryText : C.second} opacity={g > 0 ? 1 : 0} />
          </g>
        );
      })}
      {t > 3.0 && (
        <T x={140} y={208} s={11} f={C.taupe} o={k(3.0)}>
          wall time, end to end, each longer than the last
        </T>
      )}
      {t > 3.8 && (
        <T x={25} y={236} s={12} f={C.crema} o={k(3.8)}>
          all scheduling, none of it the files' own work
        </T>
      )}
    </Svg>
  );
}

// 5 · Top: one task instance per file, pips stamping out and a long scheduler-overhead bar. Bottom: one task hands the pile
// to one engine job that splits it into partitions inside, and its overhead bar barely starts.
export function RevealEngineContrast({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const top = easeOut(seg(t, 0.4, 1.8));
  return (
    <Svg label="one instance per file, or one job with partitions." h={250}>
      <T x={25} y={32} s={12} f={C.crema} o={k(0)}>
        one task instance per file
      </T>
      {Array.from({ length: 40 }, (_, j) => (
        <Pip key={j} x={32 + (j % 20) * 14} y={52 + Math.floor(j / 20) * 16} s={9} f={C.caramel} o={easeOut(seg(t, 0.3 + j * 0.03, 0.45 + j * 0.03))} />
      ))}
      <rect x={345} y={46} width={230 * top} height={12} rx={3} fill={C.caramel} opacity={top > 0 ? 1 : 0} />
      <T x={345} y={84} s={11} f={C.caramel} o={k(0.6)}>
        scheduler overhead
      </T>
      <T x={25} y={122} s={12} f={C.crema} o={k(2.0)}>
        one engine job, partitions inside
      </T>
      <Cell x={25} y={138} w={110} label="one task" o={k(2.2)} stroke={C.focus} />
      <rect x={155} y={132} width={175} height={40} rx={6} fill="none" stroke={C.second} strokeWidth={1.5} opacity={k(2.4)} />
      {Array.from({ length: 20 }, (_, j) => (
        <rect
          key={j}
          x={163 + (j % 10) * 16}
          y={138 + Math.floor(j / 10) * 15}
          width={12}
          height={10}
          rx={1}
          fill="none"
          stroke={C.second}
          strokeWidth={1.2}
          opacity={easeOut(seg(t, 2.6 + j * 0.03, 2.8 + j * 0.03))}
        />
      ))}
      <rect x={345} y={146} width={10 * k(2.4)} height={12} rx={3} fill={C.focus} />
      {t > 2.8 && (
        <T x={345} y={186} s={11} f={C.focus} o={k(2.8)}>
          scheduled once
        </T>
      )}
      {t > 3.8 && (
        <T x={25} y={232} s={12} f={C.crema} o={k(3.8)}>
          the orchestrator no longer does the splitting
        </T>
      )}
    </Svg>
  );
}

// 6 · Recap. Four cards slide in, one per idea.
export function Recap({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const pts = ['the count: decided at run time', 'past the limit: refused', 'thousands of tasks cost', 'one engine job splits cheaper'];
  return (
    <Svg label="decided at run time. a hard limit. engine is cheaper." h={250}>
      {pts.map((p, i) => {
        const d = 0.3 + i * 0.8;
        const a = easeOut(seg(t, d, d + 0.45));
        const x = 25 + (i % 2) * 285;
        const y = 50 + Math.floor(i / 2) * 70;
        return a > 0 ? <Cell key={p} x={lerp(x - 16, x, a)} y={y} w={265} label={p} o={a} /> : null;
      })}
      {t > 3.6 && (
        <T x={300} y={226} s={12} f={C.crema} a="middle" o={k(3.6)}>
          pick which layer pays the cost
        </T>
      )}
    </Svg>
  );
}

// 7 · Predict. An empty drop folder feeds the mapped task. Once answered, no instance slots fill and the task reads
// skipped.
export function PredictZeroLength({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="zero files discovered. mapped over nothing." h={250}>
      <T x={25} y={36} s={11} f={C.taupe} o={k(0)}>
        drop folder, empty
      </T>
      <Hole x={25} y={46} w={170} h={90} o={k(0.1)} />
      <Fan x1={200} y1={91} x2={334} y2={91} k={k(0.4)} />
      {v <= 0.5 && <Cell x={340} y={77} w={200} label="process_file" o={k(0.6)} />}
      {v > 0.5 && <Cell x={340} y={77} w={200} label="skipped" stroke={C.taupe} f={C.taupe} />}
      {[0, 1, 2].map((i) => (
        <Hole key={i} x={340 + i * 70} y={124} w={60} h={20} o={v * 0.8} />
      ))}
      {v > 0.5 && (
        <T x={340} y={168} s={11} f={C.taupe} o={v}>
          zero instances
        </T>
      )}
      {answer === null && t > 1.1 && (
        <T x={300} y={206} s={15} f={C.taupe} a="middle" o={k(1.1)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="skipped: no instances made" y={222} />
    </Svg>
  );
}

// 8 · Prove it. Thousands of instances face the scheduler at once. Once answered, only the first row is let through and
// the rest dim: something has to bound it.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.7)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="thousands want to run. how many actually do?" h={250}>
      {Array.from({ length: 72 }, (_, j) => (
        <Pip key={j} x={32 + (j % 12) * 18} y={52 + Math.floor(j / 12) * 18} s={10} f={C.caramel} o={k(0.1 + j * 0.008) * (j < 12 ? 1 : 1 - 0.7 * v)} />
      ))}
      <Fan x1={240} y1={52} x2={374} y2={64} k={k(0.8)} f={v > 0.5 ? C.focus : C.caramel} />
      <Cell x={380} y={50} w={195} label="the scheduler" o={k(0.5)} stroke={v > 0.5 ? C.focus : C.mocha} />
      <Cell x={380} y={110} w={195} label="other Dags" o={k(0.6)} />
      {answer === null && t > 1.2 && (
        <T x={300} y={206} s={15} f={C.taupe} a="middle" o={k(1.2)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="no: something has to bound it" y={222} />
    </Svg>
  );
}
