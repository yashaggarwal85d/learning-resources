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

// Every number here is examples.py's own: the in-memory sensor's 12 pokes with its counter stuck at 1 against the 3 it
// needed, and the durable-fact sensor's 9 pokes with the scheduler restarted after poke 4. The five-day wait is counted in
// words and drawn as day boxes.

// 0 · Five day boxes and a waiting sensor's progress creeping along them. A routine deploy restarts the scheduler mid-wait;
// the progress bar collapses and the state is gone.
export function Hook({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const wait = easeInOut(seg(t, 0.4, 2.0));
  const gone = easeIn2(seg(t, 2.5, 2.9));
  return (
    <Svg label="restart mid-wait. the approval state is gone." h={250}>
      <T x={25} y={36} s={11} f={C.taupe} o={k(0)}>
        vendor approval: up to five days
      </T>
      {Array.from({ length: 5 }, (_, i) => (
        <rect key={i} x={25 + i * 110} y={50} width={100} height={24} rx={3} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={k(0.1 + i * 0.08)} />
      ))}
      <rect x={25} y={84} width={275 * wait * (1 - gone)} height={8} rx={3} fill={C.caramel} />
      <line x1={300} y1={42} x2={300} y2={lerp(42, 100, k(2.2))} stroke={C.cherryText} strokeWidth={1.8} strokeDasharray="4 3" opacity={k(2.2)} />
      {t > 2.2 && (
        <T x={300} y={120} s={11} f={C.cherryText} a="middle" o={k(2.2)}>
          a routine deploy restarts it
        </T>
      )}
      {t > 2.9 && (
        <T x={25} y={156} s={12} f={C.cherryText} o={k(2.9)}>
          the approval state: gone
        </T>
      )}
      {t > 3.6 && (
        <T x={25} y={222} s={12} f={C.crema} o={k(3.6)}>
          someone notices, and redoes the wait by hand
        </T>
      )}
    </Svg>
  );
}

// 1 · Three cards, three shapes: a batch graph of linked boxes, an asset graph of linked data nodes, and a long durable
// timeline with a pip crawling along it.
export function RevealShapes({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const crawl = clamp(seg(t, 2.4, 4.8));
  return (
    <Svg label="three shapes already taught. now: which one, when." h={250}>
      <Cell x={25} y={40} w={180} label="batch task graph" o={k(0.2)} />
      {[0, 1, 2].map((i) => (
        <g key={i} opacity={k(0.5 + i * 0.12)}>
          <rect x={40 + i * 55} y={100} width={36} height={18} rx={3} fill="none" stroke={C.crema} strokeWidth={1.4} />
          {i < 2 && <line x1={76 + i * 55} y1={109} x2={95 + i * 55} y2={109} stroke={C.crema} strokeWidth={1.4} />}
        </g>
      ))}
      <T x={25} y={176} s={11} f={C.taupe} o={k(0.8)}>
        minutes or hours
      </T>
      <Cell x={210} y={40} w={180} label="asset graph" o={k(1.0)} />
      {[0, 1, 2].map((i) => (
        <g key={i} opacity={k(1.3 + i * 0.12)}>
          <circle cx={240 + i * 60} cy={109} r={10} fill="none" stroke={C.focus} strokeWidth={1.5} />
          {i < 2 && <line x1={250 + i * 60} y1={109} x2={290 + i * 60} y2={109} stroke={C.focus} strokeWidth={1.4} />}
        </g>
      ))}
      <T x={210} y={176} s={11} f={C.taupe} o={k(1.6)}>
        a data product
      </T>
      <Cell x={395} y={40} w={180} label="durable execution" o={k(1.8)} />
      <line x1={405} y1={109} x2={565} y2={109} stroke={C.second} strokeWidth={1.5} opacity={k(2.0)} />
      {Array.from({ length: 8 }, (_, i) => (
        <line key={i} x1={405 + i * 22.8} y1={104} x2={405 + i * 22.8} y2={114} stroke={C.second} strokeWidth={1.2} opacity={k(2.1)} />
      ))}
      {crawl > 0 && <Pip x={lerp(405, 565, crawl)} y={109} s={9} f={C.second} />}
      <T x={395} y={176} s={11} f={C.taupe} o={k(2.2)}>
        days or months
      </T>
      {t > 3.8 && (
        <T x={300} y={226} s={12} f={C.crema} a="middle" o={k(3.8)}>
          this topic: choosing among the three
        </T>
      )}
    </Svg>
  );
}

// 2 · Predict. Two candidate properties as cards, the vendor approval beneath them. Once answered, the duration-and-human
// card lights and the task-count card dims.
export function PredictProperty({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="what property actually decides?" h={250}>
      <Cell x={25} y={60} w={265} label="how many tasks" o={k(0) * (1 - 0.6 * v)} />
      <Cell x={310} y={60} w={265} label="how long, and who waits" o={k(0.15)} stroke={v > 0.5 ? C.focus : C.mocha} f={v > 0.5 ? C.focus : C.crema} />
      <T x={25} y={130} s={11} f={C.taupe} o={k(0.4)}>
        the vendor approval: five days, waiting on a person
      </T>
      {answer === null && t > 1.0 && (
        <T x={300} y={184} s={15} f={C.taupe} a="middle" o={k(1.0)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="how long it runs, and who it waits on" y={222} />
    </Svg>
  );
}

// 3 · The rule, row by row: four questions, each fanning to the model it points at.
export function RevealDecisionRule({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const rows = [
    ['how long: hours, or days?', 'days: durable', C.second],
    ['a human in the wait?', 'yes: durable', C.second],
    ['a data product?', 'yes: asset graph', C.focus],
    ['a multi-system saga?', 'yes: durable', C.second],
  ];
  return (
    <Svg label="duration. human-in-the-loop. data product. saga." h={250}>
      {rows.map(([q, a, c], i) => {
        const y = 44 + i * 46;
        const d = 0.3 + i * 0.8;
        return (
          <g key={q}>
            <T x={25} y={y} s={12} f={C.crema} o={k(d)}>
              {q}
            </T>
            <Fan x1={255} y1={y - 4} x2={374} y2={y - 4} k={k(d + 0.3)} f={c} />
            <Cell x={380} y={y - 18} w={195} h={26} label={a} o={k(d + 0.45)} stroke={c} />
          </g>
        );
      })}
      {t > 4.0 && (
        <T x={25} y={236} s={11} f={C.taupe} o={k(4.0)}>
          one explicit rule, not a vibe
        </T>
      )}
    </Svg>
  );
}

// 4 · Predict. A pipeline of short boxes with one long, human-paced box in the middle, a dashed outline around all of it.
// Once answered, only the long box drops into its own lane and the outline shrinks to fit just that box.
export function PredictHybrid({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeInOut(seg(s, 0.1, 0.8)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const boxes = [
    [25, 70],
    [105, 70],
    [395, 70],
    [475, 70],
  ];
  return (
    <Svg label="does the whole pipeline have to move?" h={250}>
      {boxes.map(([x, w]) => (
        <rect key={x} x={x} y={70} width={w} height={24} rx={3} fill="none" stroke={C.crema} strokeWidth={1.4} opacity={k(0.1)} />
      ))}
      <rect x={185} y={lerp(70, 140, v)} width={200} height={24} rx={3} fill="none" stroke={C.caramel} strokeWidth={2} opacity={k(0.2)} />
      <rect
        x={lerp(15, 175, v)}
        y={lerp(58, 128, v)}
        width={lerp(540, 220, v)}
        height={48}
        rx={6}
        fill="none"
        stroke={v > 0.5 ? C.focus : C.taupe}
        strokeWidth={1.4}
        strokeDasharray="5 4"
        opacity={k(0.5)}
      />
      {v < 0.5 && (
        <T x={285} y={128} s={11} f={C.taupe} a="middle" o={k(0.6) * (1 - 2 * v)}>
          move it all?
        </T>
      )}
      {v > 0.8 && (
        <T x={185} y={196} s={11} f={C.focus} o={v}>
          a durable workflow, for this step only
        </T>
      )}
      {answer === null && t > 1.0 && (
        <T x={300} y={196} s={15} f={C.taupe} a="middle" o={k(1.0)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="no: hand off just the long step" y={228} />
    </Svg>
  );
}

// 5 · The batch lane runs its short tasks, reaches the long step, and hands it down to a durable workflow whose bar runs
// long while the batch side polls. When it finishes, control comes back up and the last tasks run.
export function RevealHybridHandoff({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const run = easeInOut(seg(t, 1.3, 3.2));
  const top = [25, 95, 165, 375, 445];
  const lit = [0.2, 0.5, 0.8, 3.4, 3.6];
  return (
    <Svg label="the dag hands off the long step. it does not model the wait." h={250}>
      <T x={25} y={36} s={11} f={C.taupe} o={k(0)}>
        batch DAG or asset
      </T>
      {top.map((x, i) => (
        <rect key={x} x={x} y={46} width={60} height={24} rx={3} fill="none" stroke={t > lit[i] ? C.focus : C.mocha} strokeWidth={1.5} opacity={k(0.05)} />
      ))}
      <rect x={235} y={46} width={130} height={24} rx={3} fill="none" stroke={C.caramel} strokeWidth={1.5} strokeDasharray="4 3" opacity={k(0.1)} />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={280 + i * 20} cy={58} r={3} fill={C.caramel} opacity={t > 1.3 && t < 3.3 && Math.floor(t * 4) % 3 === i ? 1 : 0.2} />
      ))}
      <Fan x1={300} y1={72} x2={300} y2={142} k={k(1.1)} f={C.second} />
      <T x={25} y={150} s={11} f={C.second} o={k(1.2)}>
        durable workflow
      </T>
      <rect x={235} y={146} width={300 * run} height={16} rx={2} fill={C.second} opacity={run > 0 ? 1 : 0} />
      {t > 2.0 && (
        <T x={235} y={186} s={11} f={C.taupe} o={k(2.0)}>
          the long, human-paced step
        </T>
      )}
      <Fan x1={540} y1={144} x2={385} y2={74} k={k(3.2)} f={C.focus} />
      {t > 4.0 && (
        <T x={25} y={230} s={12} f={C.crema} o={k(4.0)}>
          each shape of work on the model that fits
        </T>
      )}
    </Svg>
  );
}

// 6 · A worker holds state in memory beside a durably stored, ordered event history. The worker crashes and its memory
// blanks; the history replays row by row into it and the state is rebuilt.
export function RevealDurableSurvival({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const crashed = t > 1.4 && t < 2.0;
  const wipe = easeOut(seg(t, 1.5, 1.8));
  return (
    <Svg label="state lives in a durable history, not a process." h={250}>
      <Cell x={25} y={40} w={150} label="worker" o={k(0)} stroke={crashed ? C.cherryText : t >= 2.0 ? C.focus : C.mocha} />
      <Cross x={160} y={54} k={crashed ? 1 : 0} />
      <rect x={25} y={80} width={150} height={60} rx={4} fill="none" stroke={C.mocha} strokeWidth={1.4} opacity={k(0.1)} />
      {[0, 1, 2].map((i) => {
        const back = easeOut(seg(t, 2.5 + i * 0.4, 2.8 + i * 0.4));
        const o = t < 2.4 ? k(0.2) * (1 - wipe) : back;
        return <rect key={i} x={35} y={88 + i * 16} width={90 + i * 15} height={8} rx={2} fill={t >= 2.4 ? C.focus : C.crema} opacity={o} />;
      })}
      <T x={330} y={36} s={11} f={C.crema} o={k(0.2)}>
        event history, stored durably
      </T>
      {Array.from({ length: 5 }, (_, i) => {
        const flash = t > 2.2 + i * 0.25 && t < 2.5 + i * 0.25;
        return <rect key={i} x={330} y={46 + i * 24} width={245} height={18} rx={2} fill="none" stroke={flash ? C.focus : C.second} strokeWidth={flash ? 2.2 : 1.3} opacity={k(0.2 + i * 0.1)} />;
      })}
      {Array.from({ length: 5 }, (_, i) => {
        const m = easeInOut(seg(t, 2.2 + i * 0.25, 2.6 + i * 0.25));
        return m > 0 && m < 1 ? <Pip key={i} x={lerp(325, 180, m)} y={lerp(55 + i * 24, 110, m)} s={8} f={C.focus} /> : null;
      })}
      {t > 3.5 && (
        <T x={25} y={166} s={11} f={C.focus} o={k(3.5)}>
          rebuilt from the history alone
        </T>
      )}
      {t > 4.0 && (
        <T x={25} y={226} s={12} f={C.crema} o={k(4.0)}>
          no single process trusted to remember
        </T>
      )}
    </Svg>
  );
}

// 7 · Recap. The three models, the one rule, and the hybrid hand-off, card by card.
export function Recap({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const models = ['batch task graph', 'asset graph', 'durable execution'];
  return (
    <Svg label="three models. one rule. hand off the long step." h={250}>
      {models.map((m, i) => (
        <Cell key={m} x={lerp(25 + i * 190 - 16, 25 + i * 190, k(0.3 + i * 0.3))} y={40} w={170} label={m} o={k(0.3 + i * 0.3)} />
      ))}
      <Cell x={25} y={100} w={550} label="one rule: how long, a human, a data product, a saga" o={k(1.6)} stroke={C.focus} />
      <Cell x={25} y={160} w={550} label="hybrid: hand off only the long step" o={k(2.6)} stroke={C.second} />
      {t > 3.6 && (
        <T x={300} y={226} s={12} f={C.crema} a="middle" o={k(3.6)}>
          the wrong model for a wait that long
        </T>
      )}
    </Svg>
  );
}

// 8 · Prove it. Two sensors in the same reschedule mode: one polls an in-memory counter, the other a durable fact, with
// the real restart after poke 4. Once answered, the first ends failed and the second success.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="same reschedule mode. does either survive a real restart?" h={250}>
      <T x={25} y={44} s={12} f={C.crema} o={k(0)}>
        in memory
      </T>
      {Array.from({ length: 12 }, (_, i) => (
        <line key={i} x1={140 + i * 20} y1={30} x2={140 + i * 20} y2={46} stroke={C.caramel} strokeWidth={1.6} opacity={k(0.1 + i * 0.05)} />
      ))}
      <T x={140} y={68} s={11} f={C.taupe} o={k(0.8)}>
        counter stuck at 1, needs 3
      </T>
      <T x={25} y={114} s={12} f={C.crema} o={k(0.2)}>
        durable fact
      </T>
      {Array.from({ length: 9 }, (_, i) => (
        <line key={i} x1={140 + i * 20} y1={100} x2={140 + i * 20} y2={116} stroke={C.second} strokeWidth={1.6} opacity={k(0.3 + i * 0.05)} />
      ))}
      <line x1={210} y1={94} x2={210} y2={122} stroke={C.cherryText} strokeWidth={1.6} strokeDasharray="3 2" opacity={k(0.9)} />
      <T x={210} y={140} s={11} f={C.cherryText} a="middle" o={k(0.9)}>
        scheduler restarted
      </T>
      {v > 0.5 && (
        <T x={400} y={44} s={12} f={C.cherryText} o={v}>
          failed
        </T>
      )}
      {v > 0.5 && (
        <T x={330} y={114} s={12} f={C.focus} o={v}>
          success
        </T>
      )}
      {answer === null && t > 1.2 && (
        <T x={300} y={190} s={15} f={C.taupe} a="middle" o={k(1.2)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="only the durable fact survives" y={222} />
    </Svg>
  );
}

function easeIn2(x: number) {
  return x * x;
}
