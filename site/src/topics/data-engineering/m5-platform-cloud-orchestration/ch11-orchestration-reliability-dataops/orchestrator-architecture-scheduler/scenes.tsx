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

// Every number here is examples.py's own: the 100, 1,000 and 5,000-file parse runs against a real Airflow install, and the
// two scheduler threads splitting 10 rows through SELECT ... FOR UPDATE SKIP LOCKED on real PostgreSQL. Parse times are
// machine-dependent, so they are drawn as lengths and named in words, never printed.

// 0 · Files multiply in a box on the left. On the right, the latency a doubling would predict, dashed, and the latency
// that actually happened, shooting past it. Then the question: which part is doing the work?
export function Hook({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const curve = easeInOut(seg(t, 1.8, 3.0));
  return (
    <Svg label="dag files go from a few hundred to thousands. latency does not just double." h={250}>
      <rect x={25} y={36} width={220} height={150} rx={6} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={k(0)} />
      {Array.from({ length: 60 }, (_, j) => (
        <rect
          key={j}
          x={35 + (j % 10) * 20}
          y={46 + Math.floor(j / 10) * 22}
          width={12}
          height={15}
          rx={2}
          fill="none"
          stroke={C.crema}
          strokeWidth={1.2}
          opacity={easeOut(seg(t, 0.2 + (j < 6 ? 0 : 0.4 + j * 0.022), 0.4 + (j < 6 ? 0 : 0.4 + j * 0.022)))}
        />
      ))}
      <T x={25} y={208} s={11} f={C.taupe} o={k(0.2)}>
        workflow files, overnight
      </T>
      <line x1={300} y1={186} x2={575} y2={186} stroke={C.mocha} strokeWidth={1.5} opacity={k(0.3)} />
      <line x1={300} y1={36} x2={300} y2={186} stroke={C.mocha} strokeWidth={1.5} opacity={k(0.3)} />
      <line x1={300} y1={170} x2={lerp(300, 575, k(1.3))} y2={lerp(170, 140, k(1.3))} stroke={C.caramel} strokeWidth={1.8} strokeDasharray="5 4" />
      {t > 1.6 && (
        <T x={575} y={130} s={11} f={C.caramel} a="end" o={k(1.6)}>
          if it only doubled
        </T>
      )}
      <path d="M300 170 C 420 166, 500 150, 560 44" fill="none" stroke={C.cherryText} strokeWidth={2.2} strokeDasharray="420" strokeDashoffset={420 * (1 - curve)} />
      {t > 3.0 && (
        <T x={490} y={48} s={11} f={C.cherryText} a="end" o={k(3.0)}>
          what happened
        </T>
      )}
      {t > 3.6 && (
        <T x={300} y={238} s={12} f={C.crema} a="middle" o={k(3.6)}>
          which part is actually doing the work?
        </T>
      )}
    </Svg>
  );
}

// 1 · Four required parts: the scheduler, the dag processor in its own process, the api server, and under them the
// metadata database every one of them writes to. A fifth "executor" box appears, then slides inside the scheduler.
export function RevealThreeRequiredParts({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const into = easeInOut(seg(t, 3.3, 4.0));
  return (
    <Svg label="scheduler, dag processor, api server, metadata database." h={250}>
      <rect x={25} y={30} width={170} height={74} rx={6} fill="none" stroke={into >= 1 ? C.focus : C.mocha} strokeWidth={1.5} opacity={k(0)} />
      <T x={37} y={50} s={12} f={C.crema} o={k(0)}>
        scheduler
      </T>
      <Cell x={215} y={30} w={170} label="dag processor" o={k(0.6)} />
      <rect x={209} y={24} width={182} height={40} rx={8} fill="none" stroke={C.caramel} strokeWidth={1.2} strokeDasharray="4 3" opacity={k(1.0)} />
      {t > 1.1 && (
        <T x={215} y={84} s={11} f={C.caramel} o={k(1.1)}>
          its own process
        </T>
      )}
      <Cell x={405} y={30} w={170} label="api server" o={k(1.4)} />
      <Cell x={150} y={190} w={300} label="metadata database" o={k(1.9)} stroke={C.focus} f={C.focus} />
      {[110, 300, 490].map((x, i) => {
        const kk = k(2.3 + i * 0.15);
        const y1 = i === 0 ? 104 : 64;
        return <line key={x} x1={x} y1={y1} x2={lerp(x, 300 + (i - 1) * 100, kk)} y2={lerp(y1, 188, kk)} stroke={C.mocha} strokeWidth={1.5} opacity={kk > 0 ? 1 : 0} />;
      })}
      <Cell x={lerp(440, 45, into)} y={lerp(128, 70, into)} w={130} h={24} label="executor" o={k(2.8)} stroke={C.second} f={C.second} />
      {t > 2.9 && into <= 0 && (
        <T x={505} y={168} s={11} f={C.taupe} a="middle" o={k(2.9)}>
          a fifth part?
        </T>
      )}
      {t > 4.0 && (
        <T x={25} y={242} s={12} f={C.second} o={k(4.0)}>
          not a fifth part: it runs inside the scheduler
        </T>
      )}
    </Svg>
  );
}

// 2 · Three rows, three executor shapes. Local: the scheduler and its workers inside one process box. Celery: the scheduler
// hands tasks through a broker to a standing pool of workers. Kubernetes: a pod appears for each task and is torn down.
export function RevealExecutorsThreeShapes({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="one process, a worker pool through a broker, or one pod per task." h={250}>
      <T x={25} y={54} s={12} f={C.crema} o={k(0)}>
        local
      </T>
      <rect x={130} y={30} width={210} height={40} rx={6} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={k(0.1)} />
      <rect x={142} y={41} width={18} height={18} rx={3} fill="none" stroke={C.caramel} strokeWidth={1.5} opacity={k(0.2)} />
      {[0, 1, 2].map((j) => (
        <Pip key={j} x={190 + j * 26} y={50} s={12} f={C.second} o={k(0.4 + j * 0.12)} />
      ))}
      {t > 0.9 && (
        <T x={355} y={54} s={11} f={C.taupe} o={k(0.9)}>
          one process, one machine
        </T>
      )}
      <T x={25} y={134} s={12} f={C.crema} o={k(1.3)}>
        celery
      </T>
      <Cell x={130} y={116} w={100} h={28} label="scheduler" o={k(1.4)} />
      <Req x1={235} x2={264} y={130} k={k(1.7)} />
      <Cell x={270} y={116} w={80} h={28} label="broker" o={k(1.8)} stroke={C.caramel} />
      <Req x1={355} x2={384} y={130} k={k(2.1)} />
      {[0, 1, 2].map((j) => (
        <Pip key={j} x={400 + j * 22} y={130} s={12} f={C.second} o={k(2.2 + j * 0.1)} />
      ))}
      {t > 2.5 && (
        <T x={462} y={134} s={11} f={C.taupe} o={k(2.5)}>
          standing pool
        </T>
      )}
      <T x={25} y={214} s={12} f={C.crema} o={k(2.8)}>
        kubernetes
      </T>
      <Cell x={130} y={196} w={100} h={28} label="scheduler" o={k(2.9)} />
      {[0, 1, 2].map((j) => {
        const d = 3.1 + j * 0.45;
        const on = easeOut(seg(t, d, d + 0.15)) * (1 - easeOut(seg(t, d + 0.35, d + 0.5)));
        return (
          <g key={j} opacity={on}>
            <rect x={262 + j * 50} y={198} width={36} height={24} rx={4} fill="none" stroke={C.focus} strokeWidth={1.5} />
            <Pip x={280 + j * 50} y={210} s={8} f={C.focus} />
          </g>
        );
      })}
      {t > 3.3 && (
        <T x={430} y={214} s={11} f={C.focus} o={k(3.3)}>
          a pod per task
        </T>
      )}
    </Svg>
  );
}

// 3 · Predict. Two schedulers reach for the same first row of one shared table. Once answered, one locks it and the other's
// arrow skips down to the next free row instead of waiting.
export function PredictTwoSchedulers({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeInOut(seg(s, 0.1, 0.6)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="two schedulers, one shared database. does a task ever get claimed twice?" h={250}>
      <Cell x={25} y={40} w={150} label="scheduler A" o={k(0)} />
      <Cell x={25} y={130} w={150} label="scheduler B" o={k(0.1)} />
      {[0, 1, 2].map((j) => (
        <Cell key={j} x={380} y={50 + j * 40} w={150} label={`task row ${['one', 'two', 'three'][j]}`} o={k(0.3)} stroke={j === 0 && v > 0.5 ? C.focus : j === 1 && v > 0.5 ? C.caramel : C.mocha} />
      ))}
      <Fan x1={180} y1={54} x2={374} y2={64} k={k(0.6)} f={C.focus} />
      <Fan x1={180} y1={144} x2={374} y2={lerp(68, 104, v)} k={k(0.7)} f={C.caramel} />
      <Lock x={540} y={58} k={v} f={C.focus} />
      {answer === null && t > 1.0 && (
        <T x={300} y={196} s={15} f={C.taupe} a="middle" o={k(1.0)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="never: the locked row is skipped" y={220} />
    </Svg>
  );
}

// 4 · Measured. Ten boxes in one shared queue table; two scheduler threads claim them one at a time. Each claim flashes a
// lock that lasts only until its commit, and the box takes its claimer's colour. Every box ends claimed once.
export function RevealSkipLockedMeasured({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="two real threads, ten real rows, measured against this sandbox's own postgres." h={250}>
      <T x={200} y={24} s={11} f={C.taupe} o={k(0)}>
        one shared queue table, 10 rows
      </T>
      <Cell x={25} y={40} w={140} label="scheduler A" o={k(0)} stroke={C.focus} />
      <Cell x={25} y={150} w={140} label="scheduler B" o={k(0.1)} stroke={C.caramel} />
      {Array.from({ length: 10 }, (_, i) => {
        const d = 0.6 + i * 0.25;
        const a = i % 2 === 0;
        const claim = easeOut(seg(t, d, d + 0.12));
        const commit = t > d + 0.2;
        const x = 200 + i * 37;
        const col = a ? C.focus : C.caramel;
        return (
          <g key={i}>
            <rect x={x} y={95} width={30} height={28} rx={3} fill={C.cocoa} stroke={claim > 0 ? col : C.mocha} strokeWidth={claim > 0 ? 2.2 : 1.5} opacity={k(0.2)} />
            {claim > 0 && !commit && <line x1={165} y1={a ? 54 : 164} x2={x + 15} y2={a ? 95 : 123} stroke={col} strokeWidth={1.2} />}
            {claim > 0 && !commit && <Lock x={x + 7} y={a ? 78 : 136} k={1} f={col} />}
          </g>
        );
      })}
      {t > 3.4 && (
        <T x={200} y={156} s={12} f={C.focus} o={k(3.4)}>
          all 10 claimed; twice: none
        </T>
      )}
      {t > 3.9 && (
        <T x={25} y={226} s={11} f={C.crema} o={k(3.9)}>
          the lock lives from claim to commit, not for the whole task
        </T>
      )}
    </Svg>
  );
}

// 5 · Three runs as three bars, 100, 1,000 and 5,000 files, each bar's length its measured total and named in words. At
// each row's end the same small per-file square: the cost per file holds while the total climbs.
export function RevealDagParsingCostMeasured({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const rows = [
    { n: '100 files', w: 20, word: 'under one second', d: 0.3 },
    { n: '1,000 files', w: 76, word: 'about two seconds', d: 1.1 },
    { n: '5,000 files', w: 370, word: 'about ten seconds', d: 1.9 },
  ];
  return (
    <Svg label="a real parse pass, measured at three scales." h={250}>
      {rows.map((r, i) => {
        const y = 36 + i * 56;
        const g = easeOut(seg(t, r.d, r.d + 0.6));
        return (
          <g key={r.n}>
            <T x={25} y={y + 13} s={12} f={C.crema} o={k(r.d)}>
              {r.n}
            </T>
            <rect x={140} y={y} width={r.w * g} height={18} rx={2} fill={i === 2 ? C.cherryText : C.second} opacity={g > 0 ? 1 : 0} />
            {t > r.d + 0.6 && (
              <T x={140} y={y + 38} s={11} f={C.taupe} o={k(r.d + 0.6)}>
                {r.word}
              </T>
            )}
            <rect x={548} y={y + 3} width={12} height={12} rx={2} fill="none" stroke={C.focus} strokeWidth={1.8} opacity={k(2.9 + i * 0.15)} />
          </g>
        );
      })}
      {t > 3.4 && (
        <T x={575} y={214} s={11} f={C.focus} a="end" o={k(3.4)}>
          per file: holds steady
        </T>
      )}
      {t > 3.9 && (
        <T x={25} y={240} s={12} f={C.cherryText} o={k(3.9)}>
          the total climbs with every file, every cycle
        </T>
      )}
    </Svg>
  );
}

// 6 · A grid of task instances flipping state; every flip sends a write to the metadata database, whose backlog bar fills
// toward red. Beside it the scheduler's own gauge stays low and looks idle. Then the Airflow two end-of-life note.
export function RevealMetadataDbCeiling({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const backlog = clamp(seg(t, 0.8, 3.2));
  return (
    <Svg label="every state change writes to the metadata database. that is usually where it strains." h={250}>
      {Array.from({ length: 12 }, (_, j) => {
        const flip = Math.floor(t * 3 + j * 0.7) % 3;
        return (
          <rect
            key={j}
            x={25 + (j % 4) * 34}
            y={36 + Math.floor(j / 4) * 30}
            width={26}
            height={22}
            rx={3}
            fill="none"
            stroke={[C.mocha, C.second, C.focus][flip]}
            strokeWidth={1.8}
            opacity={k(0.1)}
          />
        );
      })}
      <T x={25} y={142} s={11} f={C.taupe} o={k(0.2)}>
        every state change
      </T>
      {Array.from({ length: 6 }, (_, j) => {
        const m = seg(t, 0.6 + j * 0.4, 1.1 + j * 0.4);
        return m > 0 && m < 1 ? <Pip key={j} x={lerp(170, 320, m)} y={lerp(50 + (j % 3) * 30, 74, m)} s={8} f={C.caramel} /> : null;
      })}
      <Cell x={330} y={60} w={245} label="metadata database" o={k(0.3)} stroke={backlog > 0.8 ? C.cherryText : C.mocha} />
      <rect x={330} y={100} width={245} height={14} rx={3} fill="none" stroke={C.mocha} strokeWidth={1.2} opacity={k(0.4)} />
      <rect x={330} y={100} width={245 * backlog} height={14} rx={3} fill={backlog > 0.8 ? C.cherryText : C.caramel} />
      {t > 2.6 && (
        <T x={330} y={136} s={11} f={C.cherryText} o={k(2.6)}>
          strains first, quietly
        </T>
      )}
      <Cell x={25} y={170} w={170} label="scheduler CPU" o={k(1.6)} />
      <rect x={210} y={177} width={30} height={14} rx={3} fill={C.focus} opacity={k(1.8)} />
      {t > 2.0 && (
        <T x={250} y={189} s={11} f={C.focus} o={k(2.0)}>
          looks idle
        </T>
      )}
      {t > 3.8 && (
        <T x={25} y={238} s={11} f={C.taupe} o={k(3.8)}>
          Airflow two: end of life, April 2026
        </T>
      )}
    </Svg>
  );
}

// 7 · Recap. Four cards slide in, one per idea: the executor inside the scheduler, three shapes, the skipping lock, and the
// cost that grows with every file.
export function Recap({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const pts = ['four parts, executor inside', 'three executor shapes', 'a lock that skips, not waits', 'parse cost grows per file'];
  return (
    <Svg label="four parts. three executor shapes. one lock trick. one measured cost curve." h={250}>
      {pts.map((p, i) => {
        const d = 0.3 + i * 0.8;
        const a = easeOut(seg(t, d, d + 0.45));
        const x = 25 + (i % 2) * 285;
        const y = 50 + Math.floor(i / 2) * 70;
        return a > 0 ? <Cell key={p} x={lerp(x - 16, x, a)} y={y} w={265} label={p} o={a} /> : null;
      })}
      {t > 3.6 && (
        <T x={300} y={226} s={12} f={C.crema} a="middle" o={k(3.6)}>
          measured, not assumed
        </T>
      )}
    </Svg>
  );
}

// 8 · Prove it. The file count jumps; no single dag changed. Three things to profile. Once answered, parsing cost and the
// metadata database's writes light, and scheduler CPU is crossed off.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const opts = ['scheduler CPU', 'parsing cost', 'metadata DB writes'];
  return (
    <Svg label="the file count jumps overnight. nothing in any one dag changed. what first?" h={250}>
      {Array.from({ length: 16 }, (_, j) => (
        <rect key={j} x={25 + (j % 8) * 20} y={40 + Math.floor(j / 8) * 22} width={12} height={15} rx={2} fill="none" stroke={C.crema} strokeWidth={1.2} opacity={k(j < 4 ? 0 : 0.4 + j * 0.03)} />
      ))}
      <T x={25} y={104} s={11} f={C.taupe} o={k(0.5)}>
        file count jumps; no dag changed
      </T>
      {opts.map((o, i) => {
        const hit = i > 0;
        return (
          <g key={o}>
            <Cell
              x={330}
              y={40 + i * 46}
              w={210}
              label={o}
              o={k(0.8 + i * 0.15) * (v > 0 && !hit ? 1 - 0.5 * v : 1)}
              stroke={hit && v > 0.5 ? C.focus : C.mocha}
              f={hit && v > 0.5 ? C.focus : C.crema}
            />
            {!hit && <Cross x={556} y={54} k={v} />}
          </g>
        );
      })}
      <Verdict answer={answer} text="both grow with file count" y={220} />
    </Svg>
  );
}
