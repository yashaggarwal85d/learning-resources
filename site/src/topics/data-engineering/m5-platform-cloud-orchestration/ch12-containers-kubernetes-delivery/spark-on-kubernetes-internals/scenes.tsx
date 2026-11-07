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

// Every value here is examples.py's own: the driver pod app-driver with executors exec-1 and exec-2, the wrong owner
// some-other-pod, a stage of 48 tasks and 48 shuffle blocks, shuffle tracking's infinite default timeout against a finite 300,
// and the 120-second spot warning that a 90-second migration fits and a 150-second one does not. Block counts on screen are
// drawn as pips. These steps are short, so each scene runs its own clock a little faster (t = t0 times a factor).

/** A small grid of pips, n of them in rows of `per`, from (x0, y0). */
function Pips({ n, per, x0, y0, col, o = 1, gap = 14, s = 9 }: { n: number; per: number; x0: number; y0: number; col: (i: number) => string; o?: number; gap?: number; s?: number }) {
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <Pip key={i} x={x0 + (i % per) * gap} y={y0 + Math.floor(i / per) * gap} s={s} f={col(i)} o={o} />
      ))}
    </g>
  );
}

// 0 · Hook. Three spot nodes, two executors each. Over the middle node a 120-second warning bar runs down; when it empties,
// the node is crossed out and fades: reclaimed.
export function Hook({ t: t0 }: StepCtx) {
  const t = t0 * 1.8;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const warn = easeInOut(seg(t, 1.0, 2.6));
  const gone = easeIn2(seg(t, 2.6, 3.0));
  return (
    <Svg label="A spot node is reclaimed at 02:10 with a two-minute warning" h={250}>
      <T x={25} y={32} s={11} f={C.taupe} o={k(0)}>
        spot nodes, overnight
      </T>
      {[0, 1, 2].map((n) => {
        const x = 25 + n * 190;
        const mid = n === 1;
        return (
          <g key={n} opacity={k(n * 0.15) * (mid ? 1 - 0.75 * gone : 1)}>
            <rect x={x} y={60} width={170} height={100} rx={6} fill="none" stroke={mid && t > 1.0 ? C.cherryText : C.mocha} strokeWidth={1.5} />
            {[0, 1].map((e) => (
              <Cell key={e} x={x + 15} y={75 + e * 40} w={140} label="executor" />
            ))}
          </g>
        );
      })}
      {t > 1.0 && <rect x={215} y={48} width={170 * (1 - warn)} height={6} rx={3} fill={C.cherryText} />}
      {t > 1.0 && (
        <T x={300} y={186} s={11} f={C.cherryText} a="middle" o={k(1.0)}>
          a 120-second warning
        </T>
      )}
      <Cross x={300} y={110} k={gone} />
      {t > 3.1 && (
        <T x={25} y={226} s={12} f={C.crema} o={k(3.1)}>
          reclaimed, mid-job
        </T>
      )}
    </Svg>
  );
}

// 1 · Predict. A stage's 48 tasks as pips on the left, their shuffle blocks living on one executor on the right, which is
// crossed out. What is lost? Once answered, all 48 task pips turn red: the whole stage runs again.
export function PredictRedo({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="With decommissioning off, how much work does the job redo?" h={250}>
      <T x={25} y={34} s={11} f={C.taupe} o={k(0)}>
        the stage that wrote its shuffle data
      </T>
      <Pips n={48} per={12} x0={34} y0={56} col={(i) => (answer !== null && seg(s, 0.1 + i * 0.015, 0.2 + i * 0.015) > 0 ? C.cherryText : C.latte)} o={k(0.1)} />
      <Fan x1={200} y1={80} x2={378} y2={80} k={k(0.3)} f={C.mocha} />
      <Cell x={380} y={66} w={150} label="lost executor" o={k(0.3)} stroke={C.cherryText} />
      <Cross x={455} y={80} k={k(0.5)} />
      {answer === null && t > 0.8 && (
        <T x={300} y={150} s={15} f={C.taupe} a="middle" o={k(0.8)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="the whole stage that held its shuffle data" y={190} f={C.cherryText} />
    </Svg>
  );
}

// 2 · Submit. spark-submit starts a driver pod. The driver asks the API server, which creates exec-1 and exec-2; then the
// driver connects to each. A standing cluster manager, at the bottom, is crossed out: there is none.
export function SubmitFlow({ t: t0 }: StepCtx) {
  const t = t0 * 1.55;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="spark-submit against a k8s:// master starts a driver pod, which asks the API server for executors" h={250}>
      <Cell x={25} y={40} w={130} label="spark-submit" o={k(0)} />
      <Req x1={160} x2={215} y={54} k={k(0.3)} />
      <Cell x={220} y={40} w={110} label="driver" o={k(0.5)} stroke={C.focus} />
      <line x1={275} y1={68} x2={275} y2={lerp(68, 120, k(1.0))} stroke={C.crema} strokeWidth={1.8} />
      <Cell x={220} y={120} w={110} label="API server" o={k(1.1)} />
      {['exec-1', 'exec-2'].map((e, i) => (
        <g key={e}>
          <Fan x1={330} y1={134} x2={418} y2={lerp(134, 64 + i * 70, 1)} k={k(1.5 + i * 0.3)} f={C.latte} />
          <Cell x={420} y={lerp(30, 50 + i * 70, easeOutBack(seg(t, 1.7 + i * 0.3, 2.1 + i * 0.3)))} w={110} label={e} o={k(1.7 + i * 0.3)} />
          <path d={`M330 54 Q 380 ${54 + i * 30} 418 ${64 + i * 70}`} fill="none" stroke={C.second} strokeWidth={1.6} strokeDasharray="4 3" opacity={k(2.6 + i * 0.2)} />
        </g>
      ))}
      <Cross x={35} y={206} k={k(3.2)} />
      {t > 3.2 && (
        <T x={52} y={210} s={11} f={C.taupe} o={k(3.2)}>
          no standing cluster manager
        </T>
      )}
    </Svg>
  );
}

// 3 · The driver persists. Driver and two executors run to a finish line. The executors fade, cleaned up; the driver stays,
// relabelled completed, its resource bar emptying to nothing, while log lines draw under it: kept for those.
export function DriverPersists({ t: t0 }: StepCtx) {
  const t = t0 * 1.65;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const run = easeInOut(seg(t, 0.1, 1.2));
  const clean = easeIn2(seg(t, 1.4, 2.0));
  const res = 1 - easeInOut(seg(t, 1.8, 2.6));
  const done = t > 1.2;
  return (
    <Svg label='Executors terminate and are cleaned up; the driver persists, "completed," using no resources' h={250}>
      <Cell x={25} y={40} w={160} label={done ? 'driver: completed' : 'driver'} o={k(0)} stroke={C.focus} />
      {['exec-1', 'exec-2'].map((e, i) => (
        <g key={e} opacity={1 - clean}>
          <Cell x={25} y={90 + i * 46} w={160} label={e} o={k(0.1 + i * 0.1)} />
          <rect x={200} y={98 + i * 46} width={200 * run} height={12} rx={2} fill={C.latte} />
        </g>
      ))}
      <rect x={200} y={48} width={200 * run} height={12} rx={2} fill={C.latte} />
      <line x1={400} y1={36} x2={400} y2={184} stroke={C.second} strokeWidth={1.6} strokeDasharray="4 3" opacity={k(1.1)} />
      <T x={430} y={40} s={11} f={C.taupe} o={k(1.8)}>
        cpu, memory held
      </T>
      <rect x={430} y={50} width={145 * res} height={10} rx={2} fill={C.latte} opacity={k(1.8)} />
      {[0, 1, 2].map((j) => (
        <line key={j} x1={30} y1={204 + j * 10} x2={30 + [120, 150, 90][j] * k(2.6 + j * 0.15)} y2={204 + j * 10} stroke={C.focus} strokeWidth={2} />
      ))}
      {t > 3.1 && (
        <T x={210} y={218} s={11} f={C.focus} o={k(3.1)}>
          kept only so its logs survive
        </T>
      )}
    </Svg>
  );
}

// 4 · OwnerReference. Top: exec-1 and exec-2 point back at app-driver; the driver is deleted, crossed out, and both go with
// it. Bottom: exec-1 points at some-other-pod instead; the driver is deleted, and exec-1 stays, orphaned and red.
export function OwnerReference({ t: t0 }: StepCtx) {
  const t = t0 * 1.55;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const del1 = easeIn2(seg(t, 1.1, 1.6));
  return (
    <Svg label="Executors carry an OwnerReference to the driver pod; the driver's death removes them" h={250}>
      <g opacity={1 - 0.8 * del1}>
        <Cell x={25} y={50} w={130} label="app-driver" o={k(0)} />
        {['exec-1', 'exec-2'].map((e, i) => (
          <g key={e}>
            <Cell x={260} y={30 + i * 44} w={100} label={e} o={k(0.2 + i * 0.1)} />
            <Fan x1={258} y1={44 + i * 44} x2={157} y2={64} k={k(0.5 + i * 0.1)} f={C.second} />
          </g>
        ))}
      </g>
      <Cross x={90} y={64} k={k(0.9)} />
      {t > 1.6 && (
        <T x={380} y={70} s={11} f={C.focus} o={k(1.6)}>
          all removed with it
        </T>
      )}
      <Cell x={25} y={150} w={130} label="app-driver" o={k(1.9) * (1 - easeIn2(seg(t, 2.6, 3.0)))} />
      <Cross x={90} y={164} k={k(2.5)} />
      <Cell x={260} y={150} w={100} label="exec-1" o={k(2.0)} stroke={t > 3.0 ? C.cherryText : C.mocha} />
      <Fan x1={360} y1={164} x2={398} y2={164} k={k(2.2)} f={C.second} />
      <Cell x={400} y={150} w={160} label="some-other-pod" o={k(2.1)} f={C.taupe} />
      {t > 3.1 && (
        <T x={260} y={204} s={11} f={C.cherryText} o={k(3.1)}>
          orphaned, idle, billed anyway
        </T>
      )}
    </Svg>
  );
}

// 5 · Shuffle tracking. No external shuffle service sits outside the executors; its slot is crossed out. Dynamic allocation
// shrinks: the idle executor with no blocks slides away, released; the two idle ones still holding blocks are kept.
export function ShuffleTracking({ t: t0 }: StepCtx) {
  const t = t0 * 1.55;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const rel = easeIn2(seg(t, 1.6, 2.2));
  const blocks = [0, 3, 0, 3];
  return (
    <Svg label="shuffleTracking.enabled keeps an executor holding live shuffle data alive — no external shuffle service exists" h={250}>
      <Hole x={25} y={30} w={260} h={30} o={k(0)} />
      <T x={40} y={50} s={11} f={C.taupe} o={k(0)}>
        external shuffle service
      </T>
      <Cross x={270} y={45} k={k(0.4)} />
      {[0, 1, 2, 3].map((i) => {
        const x = 25 + i * 140;
        const busy = i === 0;
        const idleEmpty = i === 2;
        return (
          <g key={i} opacity={idleEmpty ? 1 - rel : 1} transform={idleEmpty ? `translate(0 ${(rel * 30).toFixed(1)})` : undefined}>
            <Cell x={x} y={90} w={120} label={busy ? 'busy' : 'idle'} o={k(0.6 + i * 0.1)} stroke={!busy && !idleEmpty && t > 2.2 ? C.focus : C.mocha} />
            {busy && <rect x={x} y={124} width={120 * easeInOut(seg(t, 0.6, 2.6))} height={6} rx={2} fill={C.latte} />}
            {Array.from({ length: blocks[i] }, (_, b) => (
              <Pip key={b} x={x + 30 + b * 30} y={140} s={12} f={C.second} o={k(0.9)} />
            ))}
          </g>
        );
      })}
      {t > 2.2 && (
        <T x={25} y={190} s={11} f={C.focus} o={k(2.2)}>
          kept: the only copy of shuffle data a later stage needs
        </T>
      )}
      {t > 3.0 && (
        <T x={25} y={226} s={11} f={C.taupe} o={k(3.0)}>
          released: idle, holding nothing
        </T>
      )}
    </Svg>
  );
}

// 6 · The infinite timeout. Two idle lanes, both holding data. With the default, infinity, the lane runs on past the edge and
// is never released. With a finite 300, it reaches its mark and is released, ticked.
export function InfiniteTimeout({ t: t0 }: StepCtx) {
  const t = t0 * 1.65;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const run = easeInOut(seg(t, 0.2, 3.0));
  return (
    <Svg label="shuffleTracking.timeout defaults to infinity — an executor may never idle out on its own" h={250}>
      <T x={25} y={62} s={11} f={C.latte} o={k(0)}>
        default: infinity
      </T>
      <rect x={160} y={50} width={415 * run} height={16} rx={2} fill="none" stroke={C.taupe} strokeWidth={1.4} strokeDasharray="4 3" />
      {run > 0.95 && <path d="M560 50 l15 8 l-15 8" fill="none" stroke={C.taupe} strokeWidth={1.8} />}
      {t > 2.6 && (
        <T x={160} y={92} s={11} f={C.cherryText} o={k(2.6)}>
          never released; held while the cluster shrinks
        </T>
      )}
      <T x={25} y={152} s={11} f={C.latte} o={k(0.4)}>
        timeout: 300
      </T>
      <rect x={160} y={140} width={Math.min(415 * run, 200)} height={16} rx={2} fill="none" stroke={C.taupe} strokeWidth={1.4} strokeDasharray="4 3" />
      <line x1={360} y1={132} x2={360} y2={164} stroke={C.focus} strokeWidth={2} opacity={k(0.4)} />
      <MiniTick x={372} y={146} k={k(1.6)} />
      {t > 1.6 && (
        <T x={392} y={152} s={11} f={C.focus} o={k(1.6)}>
          released
        </T>
      )}
      {t > 3.4 && (
        <T x={25} y={226} s={12} f={C.crema} o={k(3.4)}>
          nothing ever forces the question
        </T>
      )}
    </Svg>
  );
}

// 7 · Abrupt or graceful. Left: an executor with its blocks is crossed out, the blocks vanish, and the stage's 48 tasks turn
// red to run again. Right: a decommissioning executor's blocks fly to two neighbours first; then it goes, and nothing is lost.
export function AbruptVsGraceful({ t: t0 }: StepCtx) {
  const t = t0 * 1.55;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const kill = k(0.4);
  const mv = easeInOut(seg(t, 1.8, 2.6));
  const leave = easeIn2(seg(t, 2.7, 3.1));
  return (
    <Svg label="An abrupt kill redoes the stage that held its shuffle data; decommissioning migrates the blocks first" h={250}>
      <T x={25} y={32} s={11} f={C.cherryText} o={k(0)}>
        killed outright
      </T>
      <Cell x={25} y={44} w={130} label="executor" o={k(0)} stroke={C.cherryText} />
      {[0, 1, 2, 3].map((b) => (
        <Pip key={b} x={45 + b * 30} y={92} s={12} f={C.second} o={1 - kill} />
      ))}
      <Cross x={90} y={58} k={kill} />
      <Pips n={48} per={16} x0={30} y0={128} gap={13} s={8} col={(i) => (seg(t, 0.8 + i * 0.01, 0.9 + i * 0.01) > 0 ? C.cherryText : C.latte)} o={k(0.6)} />
      {t > 1.4 && (
        <T x={25} y={192} s={11} f={C.cherryText} o={k(1.4)}>
          all 48 tasks run again
        </T>
      )}
      <T x={320} y={32} s={11} f={C.focus} o={k(1.5)}>
        decommissioned
      </T>
      <Cell x={320} y={84} w={110} label="executor" o={k(1.5) * (1 - leave)} />
      {[0, 1].map((n) => (
        <Cell key={n} x={465} y={44 + n * 80} w={110} label="neighbour" o={k(1.6)} stroke={mv > 0.9 ? C.focus : C.mocha} />
      ))}
      {[0, 1, 2, 3].map((b) => {
        const dst = b < 2 ? 0 : 1;
        return <Pip key={b} x={lerp(340 + b * 22, 485 + (b % 2) * 30, mv)} y={lerp(126, 80 + dst * 80, mv)} s={12} f={C.second} o={k(1.6)} />;
      })}
      {t > 3.1 && (
        <T x={320} y={192} s={11} f={C.focus} o={k(3.1)}>
          downstream never notices
        </T>
      )}
    </Svg>
  );
}

// 8 · Predict. The 120-second warning as a window; two migrations grow inside it, "?". Once answered, the 90-second one ends
// inside the window, ticked, nothing redone; the 150-second one runs past the edge, red.
export function PredictResolve({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeInOut(seg(s, 0.1, 1.0)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const sc = 3;
  return (
    <Svg label="Decommissioning is on. Does the two-minute spot warning let the blocks finish migrating?" h={250}>
      <rect x={60} y={36} width={120 * sc} height={130} rx={4} fill="none" stroke={C.second} strokeWidth={1.6} opacity={k(0)} />
      <T x={60} y={28} s={11} f={C.second} o={k(0)}>
        the 120-second warning
      </T>
      <T x={25} y={82} s={11} f={C.latte} o={k(0.2)}>
        90
      </T>
      <rect x={60} y={70} width={(answer === null ? 40 * k(0.3) : 90 * v) * sc} height={16} rx={2} fill={C.latte} />
      <MiniTick x={60 + 90 * sc + 10} y={74} k={answer !== null ? easeOut(seg(s, 1.0, 1.3)) : 0} />
      <T x={25} y={132} s={11} f={C.latte} o={k(0.3)}>
        150
      </T>
      <rect x={60} y={120} width={(answer === null ? 40 * k(0.4) : 150 * v) * sc} height={16} rx={2} fill={v > 0.75 ? C.cherryText : C.latte} />
      {answer === null && t > 0.8 && (
        <T x={300} y={200} s={15} f={C.taupe} a="middle" o={k(0.8)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="nothing, if migration fits the window" y={210} />
    </Svg>
  );
}

// 9 · A remote shuffle service. Three executors send their blocks into a separate Apache Celeborn box. One executor is
// crossed out, and the blocks stay put in the service, ticked. A note: one more service to run.
export function RemoteShuffle({ t: t0 }: StepCtx) {
  const t = t0 * 1.65;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="Apache Celeborn moves shuffle data off the executors entirely — another service to run" h={250}>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Cell x={25} y={40 + i * 50} w={120} label="executor" o={k(i * 0.1) * (i === 1 ? 1 - 0.7 * k(2.2) : 1)} stroke={i === 1 && t > 2.2 ? C.cherryText : C.mocha} />
          {[0, 1].map((b) => {
            const m = easeInOut(seg(t, 0.6 + i * 0.25 + b * 0.1, 1.4 + i * 0.25 + b * 0.1));
            return <Pip key={b} x={lerp(160, 390 + i * 40 + b * 20, m)} y={lerp(54 + i * 50, 110 + b * 20, m)} s={12} f={C.second} o={k(0.5)} />;
          })}
        </g>
      ))}
      <Cross x={85} y={104} k={k(2.2)} />
      <rect x={350} y={60} width={225} height={100} rx={6} fill="none" stroke={C.focus} strokeWidth={1.5} opacity={k(0.3)} />
      <T x={362} y={80} s={11} f={C.focus} o={k(0.3)}>
        Apache Celeborn
      </T>
      <MiniTick x={540} y={140} k={k(2.6)} />
      {t > 2.6 && (
        <T x={25} y={200} s={11} f={C.focus} o={k(2.6)}>
          lose an executor, lose nothing
        </T>
      )}
      {t > 3.2 && (
        <T x={25} y={226} s={11} f={C.taupe} o={k(3.2)}>
          and one more service to keep healthy
        </T>
      )}
    </Svg>
  );
}

// 10 · Pod templates. Rows fly from the template into the pod: tolerations, a sidecar, a security context. The last row,
// a value both set, arrives from Spark's own properties, and the template's version of it is crossed out.
export function PodTemplates({ t: t0 }: StepCtx) {
  const t = t0 * 1.65;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const rows = ['tolerations', 'a sidecar', 'securityContext', 'a value both set'];
  return (
    <Svg label="podTemplateFile carries what Spark's own properties can't express — but Spark always wins where both set a value" h={250}>
      <T x={25} y={30} s={11} f={C.taupe} o={k(0)}>
        pod template
      </T>
      <T x={355} y={30} s={11} f={C.taupe} o={k(0)}>
        the pod
      </T>
      <rect x={355} y={38} width={220} height={136} rx={4} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={k(0)} />
      {rows.map((r, i) => {
        const y = 44 + i * 32;
        const mv = i < 3 ? easeInOut(seg(t, 0.4 + i * 0.4, 0.9 + i * 0.4)) : 0;
        return (
          <g key={r}>
            <Cell x={25} y={y} w={200} label={r} o={k(0.1 + i * 0.05)} f={i === 3 && t > 2.4 ? C.taupe : C.crema} />
            {i < 3 && mv > 0 && <Cell x={lerp(25, 365, mv)} y={y} w={200} label={r} o={0.9} />}
          </g>
        );
      })}
      <Cross x={125} y={154} k={k(2.4)} />
      <Cell x={25} y={198} w={200} label="Spark's own property" o={k(1.9)} stroke={C.focus} />
      {t > 2.2 && <Cell x={lerp(25, 365, easeInOut(seg(t, 2.2, 2.9)))} y={lerp(198, 140, easeInOut(seg(t, 2.2, 2.9)))} w={200} label="Spark wins" stroke={C.focus} />}
    </Svg>
  );
}

// 11 · Two operators. Two separate cards, each with its own spec and status strips and its own turning loop marker: the
// chapter's reconciliation loop, pointed at Spark, twice, by two different projects.
export function Operators({ t: t0 }: StepCtx) {
  const t = t0 * 1.65;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="Two operators turn spark-submit into a declared resource the controller reconciles" h={250}>
      {['Apache operator', 'Kubeflow operator'].map((n, i) => {
        const x = 25 + i * 290;
        const d = i * 0.8;
        const ang = t * 2.6 + i;
        return (
          <g key={n} opacity={k(d)}>
            <rect x={x} y={36} width={260} height={150} rx={6} fill="none" stroke={C.mocha} strokeWidth={1.5} />
            <T x={x + 14} y={58} s={12} f={C.crema}>
              {n}
            </T>
            <T x={x + 14} y={92} s={11} f={C.second}>
              spec
            </T>
            <rect x={x + 70} y={80} width={110} height={16} rx={2} fill="none" stroke={C.second} strokeWidth={1.4} />
            <T x={x + 14} y={142} s={11} f={C.latte}>
              status
            </T>
            <rect x={x + 70} y={130} width={110 * easeInOut(seg(t, d + 0.4, d + 1.4))} height={16} rx={2} fill={C.latte} />
            <circle cx={x + 220} cy={113} r={18} fill="none" stroke={C.mocha} strokeWidth={1.3} />
            <circle cx={x + 220 + 18 * Math.cos(ang)} cy={113 + 18 * Math.sin(ang)} r={3.5} fill={C.focus} />
          </g>
        );
      })}
      {t > 2.4 && (
        <T x={25} y={222} s={12} f={C.crema} o={k(2.4)}>
          separate projects, each its own resource
        </T>
      )}
    </Svg>
  );
}

// 12 · Managed or self-run. Two four-layer stacks. EMR on EKS: the bottom two layers stay yours, outlined in focus. The GKE
// service: only the top layer is yours, its own node pools inside. Then a balance tips: less to run, more lock-in.
export function ManagedVsSelf({ t: t0 }: StepCtx) {
  const t = t0 * 1.55;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const layers = ['your application', 'Spark, managed', 'the cluster', 'nodes'];
  const yours = [
    [true, false, true, true],
    [true, false, false, false],
  ];
  return (
    <Svg label="EMR on EKS and Managed Service for Apache Spark on GKE run Spark pods on a cluster you don't operate" h={250}>
      {['EMR on EKS', 'Spark on GKE, managed'].map((n, c) => {
        const x = 25 + c * 290;
        return (
          <g key={n}>
            <T x={x} y={30} s={11} f={C.taupe} o={k(c * 1.0)}>
              {n}
            </T>
            {layers.map((l, i) => {
              const on = t > 0.8 + c * 1.0 + i * 0.15;
              const mine = yours[c][i];
              return <Cell key={l} x={x} y={40 + i * 36} w={260} label={l} o={k(0.2 + c * 1.0 + i * 0.1)} stroke={on ? (mine ? C.focus : C.second) : C.mocha} f={on && !mine ? C.taupe : C.crema} />;
            })}
          </g>
        );
      })}
      {t > 2.6 && (
        <T x={25} y={202} s={11} f={C.focus} o={k(2.6)}>
          outlined: yours to run
        </T>
      )}
      {t > 3.0 && (
        <T x={25} y={228} s={12} f={C.crema} o={k(3.0)}>
          less to run, more lock-in: a cost comparison
        </T>
      )}
    </Svg>
  );
}

// 13 · Recap, and a bridge. An executor is crossed out and a fresh one drops into its place: disposable. Beside it, a broker
// bound to its own disk takes a lock: not everything can be thrown away.
export function Recap({ t: t0 }: StepCtx) {
  const t = t0 * 1.95;
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const swap = easeIn2(seg(t, 0.6, 1.0));
  const back = easeOutBack(seg(t, 1.1, 1.6));
  return (
    <Svg label="A Spark executor is disposable: lose one and the stage is redone. Not everything can be treated that way" h={250}>
      <Cell x={25} y={lerp(70, 110, swap)} w={150} label="executor" o={k(0) * (1 - swap)} stroke={C.cherryText} />
      <Cross x={100} y={84} k={k(0.3) * (1 - swap)} />
      {t > 1.1 && <Cell x={25} y={lerp(30, 70, back)} w={150} label="executor" stroke={C.focus} o={clamp(back)} />}
      {t > 1.6 && (
        <T x={25} y={130} s={11} f={C.focus} o={k(1.6)}>
          its work simply happens again
        </T>
      )}
      <Cell x={350} y={70} w={150} label="a broker" o={k(2.0)} />
      <line x1={425} y1={98} x2={425} y2={120} stroke={C.mocha} strokeWidth={1.4} opacity={k(2.2)} />
      <rect x={370} y={120} width={110} height={20} rx={10} fill="none" stroke={C.second} strokeWidth={1.5} opacity={k(2.2)} />
      <Lock x={515} y={84} k={k(2.6)} />
      {t > 2.8 && (
        <T x={350} y={170} s={11} f={C.second} o={k(2.8)}>
          not everything is disposable
        </T>
      )}
    </Svg>
  );
}
function easeIn2(x: number) {
  return x * x;
}
