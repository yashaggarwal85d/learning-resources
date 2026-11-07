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

// Every value here is examples.py's own: the branch named audit-branch, the bad write's amount of -999, the ten partitions
// with partition 3 bad, and the blue and green copies. Row counts and error rates are drawn as cells and pips, never printed.

/** A small pointer tag, such as "main", centred on x with its top at y. */
function Tag({ x, y, label, o = 1, f = C.focus }: { x: number; y: number; label: string; o?: number; f?: string }) {
  return <Cell x={x - 30} y={y} w={60} h={22} label={label} o={o} stroke={f} f={f} />;
}

// 0 · Hook. Top lane: a bad transform goes straight to production, and a week of day pips turns red one by one, unnoticed.
// Bottom lane: the same transform lands on an audit branch, the audit crosses it out, and production stays ticked.
export function Hook({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="straight to production vs audited first." h={250}>
      <T x={25} y={32} s={11} f={C.taupe} o={k(0)}>
        straight to production
      </T>
      <Cell x={25} y={44} w={135} label="bad transform" o={k(0)} stroke={C.cherryText} />
      <Req x1={165} x2={215} y={58} k={k(0.3)} f={C.cherryText} />
      {Array.from({ length: 7 }, (_, i) => (
        <Pip key={i} x={240 + i * 26} y={58} s={16} f={seg(t, 0.7 + i * 0.22, 0.8 + i * 0.22) > 0 ? C.cherryText : C.latte} o={k(0.4)} />
      ))}
      {t > 2.3 && (
        <T x={232} y={92} s={11} f={C.cherryText} o={k(2.3)}>
          a week corrupted, unnoticed
        </T>
      )}
      <T x={25} y={128} s={11} f={C.taupe} o={k(2.5)}>
        write-audit-publish
      </T>
      <Cell x={25} y={140} w={135} label="bad transform" o={k(2.5)} stroke={C.cherryText} />
      <Req x1={165} x2={205} y={154} k={k(2.7)} f={C.cherryText} />
      <Cell x={210} y={140} w={120} label="audit-branch" o={k(2.9)} stroke={t > 3.2 ? C.cherryText : C.mocha} />
      <Cross x={355} y={154} k={k(3.2)} />
      <Cell x={385} y={140} w={110} label="production" o={k(3.4)} stroke={C.focus} />
      <MiniTick x={505} y={153} k={k(3.6)} />
      {t > 4.1 && (
        <T x={25} y={226} s={12} f={C.crema} o={k(4.1)}>
          production is never touched
        </T>
      )}
    </Svg>
  );
}

// 1 · Predict. A timeline: merge, ticked by slim CI, then the later moment the change writes to production, marked "?".
// Once answered, that moment turns red: a different failure, at a different moment.
export function PredictCIMeansSafeDeploy({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const line = easeInOut(seg(t, 0, 0.9));
  return (
    <Svg label="safe to merge. is that safe to deploy?" h={250}>
      <line x1={25} y1={110} x2={lerp(25, 575, line)} y2={110} stroke={C.mocha} strokeWidth={1.6} />
      <circle cx={150} cy={110} r={6} fill={C.focus} opacity={k(0.4)} />
      <T x={150} y={84} s={11} f={C.focus} a="middle" o={k(0.5)}>
        merge
      </T>
      <MiniTick x={144} y={140} k={k(0.7)} />
      <T x={150} y={168} s={11} f={C.taupe} a="middle" o={k(0.7)}>
        slim CI passed
      </T>
      <circle cx={430} cy={110} r={6} fill={v > 0.5 ? C.cherryText : C.latte} opacity={k(1.0)} />
      <T x={430} y={84} s={11} f={v > 0.5 ? C.cherryText : C.latte} a="middle" o={k(1.0)}>
        the write
      </T>
      {answer === null && t > 1.4 && (
        <T x={430} y={156} s={15} f={C.taupe} a="middle" o={k(1.4)}>
          ?
        </T>
      )}
      {answer !== null && (
        <T x={430} y={156} s={11} f={C.cherryText} a="middle" o={v}>
          a different moment
        </T>
      )}
      <Verdict answer={answer} text="a write can still corrupt production" y={222} f={C.cherryText} />
    </Svg>
  );
}

/** A snapshot dot. */
function Snap({ x, y, o = 1, f = C.latte }: { x: number; y: number; o?: number; f?: string }) {
  return <circle cx={x} cy={y} r={7} fill={f} opacity={o} />;
}

// 2 · The audit branch. main's snapshot chain draws, and a downstream consumer points at its head. A branch forks off the
// head and its new write lands there, with nothing reading it.
export function RevealAuditBranch({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const xs = [90, 160, 230, 300];
  const fork = easeInOut(seg(t, 1.3, 2.1));
  return (
    <Svg label="written. not yet visible downstream." h={250}>
      <T x={25} y={74} s={11} f={C.taupe} o={k(0)}>
        main
      </T>
      <line x1={90} y1={70} x2={lerp(90, 300, k(0))} y2={70} stroke={C.mocha} strokeWidth={1.6} />
      {xs.map((x, i) => (
        <Snap key={x} x={x} y={70} o={k(i * 0.15)} />
      ))}
      <Cell x={455} y={56} w={120} label="reads main" o={k(0.8)} />
      <Fan x1={455} y1={70} x2={310} y2={70} k={k(1.0)} f={C.latte} />
      {fork > 0 && <path d={`M300 70 C 330 70, 340 140, ${lerp(300, 420, fork)} 140`} fill="none" stroke={C.second} strokeWidth={1.6} />}
      <Snap x={420} y={140} o={k(2.2)} f={C.second} />
      <T x={440} y={145} s={11} f={C.second} o={k(2.2)}>
        audit-branch
      </T>
      {t > 2.8 && (
        <T x={330} y={182} s={11} f={C.taupe} o={k(2.8)}>
          not a copy; nothing reads it
        </T>
      )}
      {t > 3.6 && (
        <T x={25} y={226} s={12} f={C.crema} o={k(3.6)}>
          independent of main's own history
        </T>
      )}
    </Svg>
  );
}

// 3 · The audit gate. Pass lane: the main tag slides from its old head to the branch's head, one step. Fail lane: the link
// is crossed out and main stays where it was.
export function RevealAuditGate({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const ff = easeInOut(seg(t, 1.4, 2.0));
  return (
    <Svg label="pass: fast-forwarded. fail: never arrives." h={250}>
      <T x={25} y={30} s={11} f={C.taupe} o={k(0)}>
        audit: the same diff and tolerance checks
      </T>
      <T x={25} y={74} s={12} f={C.focus} o={k(0.3)}>
        pass
      </T>
      <line x1={120} y1={70} x2={260} y2={70} stroke={C.mocha} strokeWidth={1.6} opacity={k(0.3)} />
      <Snap x={120} y={70} o={k(0.3)} />
      <Snap x={260} y={70} o={k(0.4)} f={C.focus} />
      <MiniTick x={250} y={44} k={k(1.1)} />
      <Tag x={lerp(120, 260, ff)} y={84} label="main" o={k(0.5)} />
      {t > 2.0 && (
        <T x={330} y={74} s={11} f={C.focus} o={k(2.0)}>
          fast-forward, one step
        </T>
      )}
      <T x={25} y={158} s={12} f={C.cherryText} o={k(2.3)}>
        fail
      </T>
      <line x1={120} y1={154} x2={260} y2={154} stroke={C.mocha} strokeWidth={1.6} strokeDasharray={t > 2.7 ? '4 4' : undefined} opacity={k(2.3)} />
      <Snap x={120} y={154} o={k(2.3)} />
      <Snap x={260} y={154} o={k(2.4)} f={C.cherryText} />
      <Cross x={190} y={154} k={k(2.7)} />
      <Tag x={120} y={168} label="main" o={k(2.5)} />
      {t > 3.1 && (
        <T x={330} y={158} s={11} f={C.cherryText} o={k(3.1)}>
          production exactly as it was
        </T>
      )}
      {t > 3.8 && (
        <T x={25} y={232} s={12} f={C.crema} o={k(3.8)}>
          the bad write never arrives
        </T>
      )}
    </Svg>
  );
}

// 4 · Predict. Application code: blue-green and canary, each ticked. A table: two "?" boxes. Once answered they become a
// table swap and a partition-by-partition rollout, and tick too.
export function PredictTableNeedsAppSafety({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const app = ['blue-green', 'canary'];
  const tab = ['a table swap', 'by partition'];
  return (
    <Svg label="known for app code. true for tables?" h={250}>
      <T x={25} y={36} s={11} f={C.taupe} o={k(0)}>
        application code
      </T>
      <T x={320} y={36} s={11} f={C.taupe} o={k(0.4)}>
        a table of data
      </T>
      {app.map((a, i) => (
        <g key={a}>
          <Cell x={25} y={52 + i * 46} w={200} label={a} o={k(0.1 + i * 0.15)} />
          <MiniTick x={240} y={66 + i * 46} k={k(0.5 + i * 0.15)} />
          <Cell x={320} y={52 + i * 46} w={200} label={v > 0.5 ? tab[i] : '?'} o={k(0.5 + i * 0.15)} stroke={v > 0.5 ? C.focus : C.mocha} f={v > 0.5 ? C.crema : C.taupe} />
          <MiniTick x={535} y={66 + i * 46} k={v} />
        </g>
      ))}
      <Verdict answer={answer} text="the same patterns apply to tables" y={222} />
    </Svg>
  );
}

// 5 · Blue-green and canary for a table. Left: traffic points at blue while green rebuilds, then the pointer swings to
// green. Right: ten partition pips; the canary lights first, the next two follow, partition 3 turns red and the rest wait.
export function RevealBlueGreenCanary({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const sw = easeInOut(seg(t, 1.4, 1.9));
  const state = (p: number) => {
    if (p === 0) return t > 2.4 ? C.focus : null;
    if (p === 1) return t > 2.9 ? C.focus : null;
    if (p === 2) return t > 3.2 ? C.focus : null;
    if (p === 3) return t > 3.5 ? C.cherryText : null;
    return null;
  };
  return (
    <Svg label="one pointer swap. one partition first." h={250}>
      <T x={25} y={34} s={11} f={C.taupe} o={k(0)}>
        blue-green
      </T>
      <Cell x={25} y={50} w={110} label="blue" o={k(0.1)} stroke={sw < 0.5 ? C.focus : C.mocha} />
      <Cell x={25} y={110} w={110} label="green" o={k(0.2)} stroke={sw > 0.5 ? C.focus : C.second} />
      <T x={200} y={98} s={11} f={C.latte} a="middle" o={k(0.3)}>
        traffic
      </T>
      <Fan x1={170} y1={92} x2={140} y2={lerp(64, 124, sw)} k={k(0.5)} f={C.latte} />
      {t > 1.9 && (
        <T x={25} y={170} s={11} f={C.focus} o={k(1.9)}>
          one pointer update
        </T>
      )}
      <T x={300} y={34} s={11} f={C.taupe} o={k(2.0)}>
        canary, by partition
      </T>
      {Array.from({ length: 10 }, (_, p) => {
        const c = state(p);
        const x = 310 + p * 26;
        return c ? <Pip key={p} x={x} y={74} s={16} f={c} /> : <rect key={p} x={x - 8} y={66} width={16} height={16} rx={2} fill="none" stroke={C.mocha} strokeWidth={1.3} opacity={k(2.1)} />;
      })}
      {t > 2.4 && (
        <T x={300} y={116} s={11} f={C.focus} o={k(2.4)}>
          one partition first
        </T>
      )}
      {t > 3.0 && (
        <T x={300} y={140} s={11} f={C.focus} o={k(3.0)}>
          expands while healthy
        </T>
      )}
      {t > 3.6 && (
        <T x={300} y={164} s={11} f={C.cherryText} o={k(3.6)}>
          halts at partition 3
        </T>
      )}
      {t > 4.1 && (
        <T x={25} y={226} s={12} f={C.crema} o={k(4.1)}>
          the same measured safety, for a table
        </T>
      )}
    </Svg>
  );
}

// 6 · The shadow run. The old version's output strip serves traffic; the new version's strip runs beside it with none. A
// diff line sweeps both, and every fifth cell of the shadow strip turns red as it passes: a regression, caught.
export function RevealShadowRun({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const sw = easeInOut(seg(t, 1.6, 2.8));
  const sx = lerp(20, 580, sw);
  const cx = (i: number) => 25 + i * 27.5;
  return (
    <Svg label="runs in parallel. diffed before cutover." h={250}>
      <T x={25} y={38} s={11} f={C.taupe} o={k(0)}>
        old version: serves traffic
      </T>
      {Array.from({ length: 20 }, (_, i) => (
        <rect key={i} x={cx(i)} y={50} width={22} height={18} rx={2} fill="none" stroke={C.latte} strokeWidth={1.2} opacity={k(0.1 + i * 0.02)} />
      ))}
      <T x={25} y={108} s={11} f={C.second} o={k(0.6)}>
        new version: a shadow, no traffic
      </T>
      {Array.from({ length: 20 }, (_, i) => {
        const bad = i % 5 === 0 && sx > cx(i) + 11;
        return <rect key={i} x={cx(i)} y={120} width={22} height={18} rx={2} fill="none" stroke={bad ? C.cherryText : C.second} strokeWidth={bad ? 2 : 1.2} opacity={k(0.7 + i * 0.02)} />;
      })}
      {sw > 0 && sw < 1 && <line x1={sx} y1={44} x2={sx} y2={144} stroke={C.focus} strokeWidth={1.5} />}
      {t > 1.6 && (
        <T x={25} y={172} s={11} f={C.taupe} o={k(1.6)}>
          diffed against the old output
        </T>
      )}
      {t > 2.9 && (
        <T x={25} y={196} s={11} f={C.cherryText} o={k(2.9)}>
          a regression, caught before cutover
        </T>
      )}
      {t > 3.8 && (
        <T x={25} y={232} s={12} f={C.crema} o={k(3.8)}>
          zero production traffic at risk
        </T>
      )}
    </Svg>
  );
}

// 7 · Flag and rollback. Left: a flag switch slides on, then straight back off, no redeploy. Right: main's tag sits on a
// bad snapshot, then steps back to the exact good one before it.
export function RevealFlagAndRollback({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const on = easeInOut(seg(t, 0.5, 0.8)) * (1 - easeInOut(seg(t, 1.7, 2.0)));
  const back = easeInOut(seg(t, 3.0, 3.6));
  return (
    <Svg label="toggled, not redeployed. one-step rollback." h={250}>
      <T x={25} y={34} s={11} f={C.taupe} o={k(0)}>
        a feature flag
      </T>
      <rect x={25} y={52} width={50} height={24} rx={12} fill="none" stroke={on > 0.5 ? C.focus : C.mocha} strokeWidth={1.6} opacity={k(0)} />
      <circle cx={lerp(37, 63, on)} cy={64} r={8} fill={on > 0.5 ? C.focus : C.latte} opacity={k(0)} />
      <T x={90} y={69} s={12} f={on > 0.5 ? C.focus : C.crema} o={k(0.1)}>
        {on > 0.5 ? 'new logic' : 'old logic'}
      </T>
      {t > 1.0 && (
        <T x={25} y={110} s={11} f={C.taupe} o={k(1.0)}>
          toggled, no redeploy
        </T>
      )}
      {t > 2.0 && (
        <T x={25} y={134} s={11} f={C.focus} o={k(2.0)}>
          and instantly back off
        </T>
      )}
      <T x={320} y={34} s={11} f={C.taupe} o={k(2.3)}>
        a one-step rollback
      </T>
      <line x1={360} y1={70} x2={500} y2={70} stroke={C.mocha} strokeWidth={1.6} opacity={k(2.4)} />
      <Snap x={360} y={70} o={k(2.4)} f={C.focus} />
      <Snap x={500} y={70} o={k(2.5)} f={C.cherryText} />
      <Tag x={lerp(500, 360, back)} y={84} label="main" o={k(2.6)} />
      {t > 3.6 && (
        <T x={320} y={140} s={11} f={C.focus} o={k(3.6)}>
          the exact prior snapshot
        </T>
      )}
      {t > 4.1 && (
        <T x={25} y={226} s={12} f={C.crema} o={k(4.1)}>
          undone in one operation, not row by row
        </T>
      )}
    </Svg>
  );
}

// 8 · Recap. Six cards slide in, one per mechanism.
export function Recap({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const pts = ['an audited branch write', 'a blue-green swap', 'a canary rollout', 'a shadow run', 'a feature flag', 'a one-step rollback'];
  return (
    <Svg label="six mechanisms. one shared idea." h={250}>
      {pts.map((p, i) => {
        const d = 0.3 + i * 0.5;
        const a = easeOut(seg(t, d, d + 0.45));
        const x = 25 + (i % 2) * 285;
        const y = 36 + Math.floor(i / 2) * 50;
        return a > 0 ? <Cell key={p} x={lerp(x - 16, x, a)} y={y} w={265} label={p} o={a} /> : null;
      })}
      {t > 3.6 && (
        <T x={300} y={226} s={12} f={C.crema} a="middle" o={k(3.6)}>
          nothing unverified reaches a consumer
        </T>
      )}
    </Svg>
  );
}

// 9 · Prove it. A good batch and a bad one (an amount of -999) both arrive at the same audit. Once answered, the good batch's
// line runs on into production with a tick, and the bad one is crossed out at the gate.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const g = answer !== null ? easeOut(seg(s, 0.1, 0.7)) : 0;
  const b = answer !== null ? easeOut(seg(s, 0.5, 0.9)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="one good batch. one bad batch." h={250}>
      <Cell x={25} y={60} w={140} label="good batch" o={k(0)} />
      <Cell x={25} y={130} w={140} label="amount -999" o={k(0.2)} stroke={C.cherryText} />
      <Req x1={170} x2={250} y={74} k={k(0.4)} />
      <Req x1={170} x2={250} y={144} k={k(0.5)} f={C.cherryText} />
      <line x1={262} y1={50} x2={262} y2={170} stroke={C.second} strokeWidth={2} opacity={k(0.3)} />
      <T x={262} y={40} s={11} f={C.second} a="middle" o={k(0.3)}>
        audit
      </T>
      <Cell x={420} y={95} w={155} label="production" o={k(0.7)} />
      {answer === null && t > 1.2 && (
        <T x={340} y={124} s={15} f={C.taupe} a="middle" o={k(1.2)}>
          ?
        </T>
      )}
      <Fan x1={272} y1={74} x2={415} y2={104} k={g} f={C.focus} />
      <MiniTick x={490} y={140} k={g} />
      <Cross x={262} y={144} k={b} />
      <Verdict answer={answer} text="only the passing batch gets there" y={222} />
    </Svg>
  );
}
