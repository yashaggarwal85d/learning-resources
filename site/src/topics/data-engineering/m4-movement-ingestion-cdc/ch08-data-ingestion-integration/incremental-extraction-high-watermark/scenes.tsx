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

/** A dashed vertical watermark line at x, drawn down by `k`, with an optional label above it. */
function Wm({ x, y1, y2, k, label, f = C.focus }: { x: number; y1: number; y2: number; k: number; label?: string; f?: string }) {
  return (
    <g opacity={k > 0 ? 1 : 0}>
      <line x1={x} y1={y1} x2={x} y2={lerp(y1, y2, k)} stroke={f} strokeWidth={2} strokeDasharray="5 4" />
      {label && (
        <T x={x} y={y1 - 8} s={11} f={f} a="middle" o={k}>
          {label}
        </T>
      )}
    </g>
  );
}

/** A plain time axis from x 25 to 545 at y, drawn by `k`. */
function Axis({ y, k }: { y: number; k: number }) {
  return <line x1={25} y1={y} x2={25 + 520 * k} y2={y} stroke={C.mocha} strokeWidth={1.4} />;
}

/** A transaction's open span from x1 toward x2 at y, grown by `k`: a hollow bar with a begin cap. */
function TxBar({ x1, x2, y, k, f = C.latte }: { x1: number; x2: number; y: number; k: number; f?: string }) {
  if (k <= 0) return null;
  return (
    <g>
      <rect x={x1} y={y - 5} width={(x2 - x1) * k} height={10} rx={3} fill={C.cocoa} stroke={f} strokeWidth={1.5} />
      <line x1={x1} y1={y - 10} x2={x1} y2={y + 10} stroke={f} strokeWidth={2} />
    </g>
  );
}

/** A row's stamp: a dot at (x, y) grown by `k`. */
function Dot({ x, y, k, f = C.latte, r = 6 }: { x: number; y: number; k: number; f?: string; r?: number }) {
  return <circle cx={x} cy={y} r={r * k} fill={f} />;
}

// 0 · Hook. Two counts as bars, the warehouse a little short; the gap outlines in cherry while the run log ticks green.
export function Hook({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  const b = easeOut(seg(t, 0.5, 1.5));
  const g = easeOut(seg(t, 2.6, 3.2));
  return (
    <Svg label="two counts side by side, a small gap between them, no error anywhere in the run log." h={200}>
      <T x={25} y={36} s={11} f={C.latte} o={a}>
        source count
      </T>
      <rect x={25} y={44} width={400 * a} height={16} fill={C.latte} />
      <T x={25} y={88} s={11} f={C.latte} o={b}>
        warehouse count
      </T>
      <rect x={25} y={96} width={376 * b} height={16} fill={C.latte} />
      {g > 0 && <rect x={403} y={96} width={22} height={16} fill="none" stroke={C.cherryText} strokeWidth={2} strokeDasharray="3 2" opacity={g} />}
      {g > 0 && (
        <T x={437} y={109} s={11} f={C.cherryText} o={g}>
          the gap
        </T>
      )}
      <T x={25} y={160} s={11} f={C.latte} o={easeOut(seg(t, 1.2, 1.6))}>
        run log
      </T>
      {[0, 1, 2].map((i) => (
        <MiniTick key={i} x={90 + i * 26} y={152} k={easeOut(seg(t, 1.4 + i * 0.35, 1.8 + i * 0.35))} />
      ))}
      <T x={180} y={160} s={11} f={C.focus} o={easeOut(seg(t, 2.6, 3.0))}>
        no errors, every run green
      </T>
    </Svg>
  );
}

// 1 · Predict. A watermark on a time axis; a scan picks up only the rows newer than it. Once answered, one row
// vanishes, leaving an empty ring the scan can never compare.
export function PredictMissKind({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const gone = answer !== null ? easeOut(seg(s, 0.2, 0.9)) : 0;
  const sc = easeOut(seg(t, 0.9, 1.8));
  const xs = [80, 150, 230, 370, 440, 510];
  return (
    <Svg label="an updated_at cursor only asks for rows newer than its watermark. What can it never detect?" h={200}>
      <Axis y={140} k={easeOut(seg(t, 0, 0.5))} />
      <Wm x={300} y1={40} y2={140} k={easeOut(seg(t, 0.3, 0.8))} label="watermark" />
      {xs.map((x, i) => {
        const newer = x > 300;
        const lit = newer && sc * 245 + 300 > x;
        const k = easeOutBack(seg(t, 0.1 + i * 0.08, 0.5 + i * 0.08));
        if (i === 4 && gone > 0) {
          return (
            <g key={i}>
              <circle cx={x} cy={120} r={6} fill="none" stroke={C.cherryText} strokeWidth={1.5} strokeDasharray="3 2" opacity={gone} />
              <Dot x={x} y={120} k={1 - gone} f={C.focus} />
            </g>
          );
        }
        return <Dot key={i} x={x} y={120} k={k} f={lit ? C.focus : C.latte} />;
      })}
      <Req x1={300} x2={545} y={90} k={sc} label="newer than watermark" f={C.focus} />
      <AnswerRow y={185} label="never caught" answer={answer} value="a hard delete" k={easeOut(seg(t, 1.8, 2.4))} />
    </Svg>
  );
}

// 2 · Mechanism. A slow transaction's bar grows from its begin cap; its stamp is pinned at the start. The watermark
// drops in mid-way, the bar commits past it, and the stamp turns cherry behind the line. Below, an app server's own
// stamp slides back from true time because its clock disagrees.
export function RevealMechanism({ t }: StepCtx) {
  const grow = easeInOut(seg(t, 0.4, 3.8));
  const w = easeOut(seg(t, 1.8, 2.4));
  const done = seg(t, 3.8, 4.2);
  const late = t >= 4.0;
  const app = easeOut(seg(t, 4.3, 4.7));
  const slide = easeInOut(seg(t, 4.6, 5.3));
  return (
    <Svg label="transaction_timestamp is fixed at start. A slow transaction's own stamp sits behind the line it commits past." h={220}>
      <Axis y={200} k={easeOut(seg(t, 0, 0.5))} />
      <T x={25} y={58} s={11} f={C.latte} o={easeOut(seg(t, 0.2, 0.6))}>
        slow transaction
      </T>
      <TxBar x1={120} x2={460} y={80} k={grow} />
      <Dot x={120} y={80} k={easeOutBack(seg(t, 0.4, 0.8))} f={late ? C.cherryText : C.focus} r={7} />
      <T x={100} y={108} s={11} f={late ? C.cherryText : C.focus} o={easeOut(seg(t, 0.6, 1.0))}>
        {late ? 'stamped behind the line' : 'stamp fixed at start'}
      </T>
      <Wm x={330} y1={42} y2={200} k={w} label="watermark moves" />
      <MiniTick x={454} y={58} k={easeOut(done)} />
      {done > 0 && (
        <T x={474} y={62} s={11} f={C.focus} o={easeOut(done)}>
          commits
        </T>
      )}
      {app > 0 && (
        <g opacity={app}>
          <T x={25} y={150} s={11} f={C.latte}>
            app server clock
          </T>
          <circle cx={430} cy={165} r={6} fill="none" stroke={C.latte} strokeWidth={1.5} strokeDasharray="3 2" />
          <Dot x={lerp(430, 250, slide)} y={165} k={1} f={C.cherryText} />
          {slide > 0.95 && (
            <T x={430} y={186} s={11} f={C.latte} a="middle">
              true time
            </T>
          )}
        </g>
      )}
    </Svg>
  );
}

// 3 · The real run. The cursor scans to now and finds zero; the watermark jumps anyway; the transaction commits with
// its stamp behind; every strict run after scans only to the right of it.
export function RevealReproduced({ t }: StepCtx) {
  const scan1 = easeOut(seg(t, 0.6, 1.3));
  const jump = easeInOut(seg(t, 1.5, 2.0));
  const grow = easeInOut(seg(t, 0.2, 2.8));
  const commit = easeOut(seg(t, 2.8, 3.1));
  const scan2 = easeOut(seg(t, 3.3, 4.1));
  const wx = lerp(150, 300, jump);
  return (
    <Svg label="the real run: nothing found while open, watermark advances anyway, the commit lands behind it." h={220}>
      <Axis y={195} k={easeOut(seg(t, 0, 0.4))} />
      <Wm x={wx} y1={38} y2={195} k={easeOut(seg(t, 0.1, 0.5))} label="watermark" />
      <TxBar x1={200} x2={430} y={115} k={grow} />
      <Dot x={200} y={115} k={easeOutBack(seg(t, 0.2, 0.6))} f={commit > 0 ? C.cherryText : C.latte} r={7} />
      {scan1 > 0 && jump < 1 && <Req x1={150} x2={300} y={75} k={scan1} label="found 0" />}
      <MiniTick x={424} y={92} k={commit} />
      {commit > 0 && (
        <T x={200} y={145} s={11} f={C.cherryText} a="middle" o={commit}>
          id 5555555
        </T>
      )}
      {scan2 > 0 && <Req x1={300} x2={545} y={75} k={scan2} label="strict run finds nothing" f={C.cherryText} />}
      {t >= 4.2 && (
        <T x={200} y={170} s={13} f={C.cherryText} a="middle" o={easeOut(seg(t, 4.2, 4.6))}>
          missed for good
        </T>
      )}
    </Svg>
  );
}

// 4 · Sequence gaps. Three values handed out in order; the first one's transaction rolls back and it stays spent;
// the third commits first and lands ahead of the second in commit order.
export function RevealSequenceGaps({ t }: StepCtx) {
  const shown = (i: number) => easeOutBack(seg(t, 0.2 + i * 0.25, 0.6 + i * 0.25));
  const rb = easeOut(seg(t, 1.3, 1.7));
  const m3 = easeInOut(seg(t, 1.9, 2.6));
  const m2 = easeInOut(seg(t, 2.8, 3.4));
  const end = easeOut(seg(t, 3.7, 4.2));
  const slot = (x: number) => <rect x={x} y={40} width={80} height={28} rx={4} fill="none" stroke={C.mocha} strokeWidth={1.2} strokeDasharray="4 3" />;
  return (
    <Svg label="a sequence value, once handed out, is never given back — even if its own transaction rolls back." h={200}>
      <T x={25} y={58} s={11} f={C.latte} o={shown(0)}>
        handed out
      </T>
      <Cell x={150} y={40} w={80} label="first" o={shown(0)} stroke={rb > 0 ? C.cherryText : C.mocha} f={rb > 0 ? C.cherryText : C.crema} />
      {rb > 0 && (
        <T x={190} y={30} s={11} f={C.cherryText} a="middle" o={rb}>
          rolled back, still spent
        </T>
      )}
      {m2 > 0 && slot(250)}
      <Cell x={250} y={lerp(40, 108, m2)} w={80} label="second" o={shown(1)} />
      {m3 > 0 && slot(350)}
      <Cell x={lerp(350, 150, clamp(m3 * 2 - 1, 0, 1))} y={lerp(40, 108, clamp(m3 * 2, 0, 1))} w={80} label="third" o={shown(2)} stroke={m3 > 0 ? C.focus : C.mocha} />
      <T x={25} y={126} s={11} f={C.latte} o={easeOut(seg(t, 1.8, 2.2))}>
        commit order
      </T>
      {end > 0 && (
        <T x={300} y={175} s={13} f={C.cherryText} a="middle" o={end}>
          numbers and commits disagree
        </T>
      )}
    </Svg>
  );
}

// 5 · Lookback + merge. A band reaches back two seconds behind the watermark and lights the missed row; then the
// merge runs three times and each run leaves exactly one row.
export function RevealLookbackMerge({ t }: StepCtx) {
  const band = easeInOut(seg(t, 0.5, 1.3));
  const caught = easeOut(seg(t, 1.4, 1.8));
  const runs = [0, 1, 2].map((i) => easeOut(seg(t, 2.1 + i * 0.55, 2.5 + i * 0.55)));
  return (
    <Svg label="a lookback window catches the late row; an idempotent merge, run three times, changes nothing." h={220}>
      <Axis y={120} k={easeOut(seg(t, 0, 0.4))} />
      {band > 0 && <rect x={330 - 140 * band} y={40} width={140 * band} height={80} fill={C.cocoa} stroke={C.focus} strokeWidth={1.2} strokeDasharray="4 3" />}
      {band >= 1 && (
        <T x={260} y={58} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 1.3, 1.6))}>
          2 s lookback
        </T>
      )}
      <Wm x={330} y1={34} y2={120} k={easeOut(seg(t, 0.1, 0.5))} label="watermark" />
      <Dot x={230} y={100} k={1} f={caught > 0 ? C.focus : C.cherryText} r={6 + 2 * caught * (1 - caught) * 4} />
      {runs.map((k, i) => (
        <g key={i}>
          <Cell x={25 + i * 190} y={150} w={170} label={`run ${i + 1}: 1 row`} o={k} />
          <MiniTick x={104 + i * 190} y={190} k={k} />
        </g>
      ))}
      {t >= 3.9 && (
        <T x={300} y={214} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.9, 4.3))}>
          three runs, still one row
        </T>
      )}
    </Svg>
  );
}

// 6 · Sizing. The source's transactions as bars of different lengths; a margin bracket grows too short and leaves the
// slowest one's tail uncovered in cherry, then grows to cover it exactly.
export function RevealSizing({ t }: StepCtx) {
  const lens = [140, 220, 100, 360];
  const m1 = easeOut(seg(t, 1.0, 1.7));
  const m2 = easeInOut(seg(t, 2.8, 3.6));
  const w = 220 * m1 + 140 * m2;
  const ok = m2 >= 1;
  const short = m1 >= 1 && m2 <= 0;
  return (
    <Svg label="the lookback margin has to cover the slowest transaction this source ever runs." h={200}>
      <T x={25} y={26} s={11} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        this source's transactions
      </T>
      {lens.map((L, i) => (
        <rect key={i} x={25} y={38 + i * 18} width={L * easeOut(seg(t, 0.1 + i * 0.12, 0.6 + i * 0.12))} height={10} rx={3} fill={i === 3 ? C.focus : C.latte} />
      ))}
      <T x={395} y={101} s={11} f={C.focus} o={easeOut(seg(t, 0.7, 1.0))}>
        slowest
      </T>
      {w > 0 && (
        <g>
          <line x1={25} y1={128} x2={25 + w} y2={128} stroke={ok ? C.focus : C.cherryText} strokeWidth={2.5} />
          <line x1={25} y1={120} x2={25} y2={136} stroke={ok ? C.focus : C.cherryText} strokeWidth={2} />
          <line x1={25 + w} y1={120} x2={25 + w} y2={136} stroke={ok ? C.focus : C.cherryText} strokeWidth={2} />
        </g>
      )}
      {short && <rect x={247} y={90} width={138} height={14} fill="none" stroke={C.cherryText} strokeWidth={1.8} strokeDasharray="3 2" opacity={easeOut(seg(t, 1.7, 2.0))} />}
      {short && (
        <T x={25} y={165} s={13} f={C.cherryText} o={easeOut(seg(t, 1.8, 2.2))}>
          margin too short: still misses it
        </T>
      )}
      {ok && (
        <T x={25} y={165} s={13} f={C.focus} o={easeOut(seg(t, 3.6, 4.0))}>
          covers the slowest: catches it
        </T>
      )}
      {ok && <Tick y={160} k={easeOut(seg(t, 3.8, 4.3))} />}
    </Svg>
  );
}

// 7 · Hard delete. The source's rows; one is deleted and leaves only a dashed hole. The cursor scans right of the
// watermark and finds nothing; a lookback band widens back and still finds nothing.
export function RevealHardDelete({ t }: StepCtx) {
  const del = easeOut(seg(t, 0.8, 1.4));
  const scan = easeOut(seg(t, 1.8, 2.6));
  const band = easeInOut(seg(t, 2.9, 3.6));
  return (
    <Svg label="a row deleted outright leaves no updated_at behind — nothing for any cursor to find." h={220}>
      <T x={25} y={30} s={11} f={C.latte}>
        source
      </T>
      {[0, 1, 2, 3, 4].map((i) => {
        const y = 40 + i * 18;
        if (i === 2)
          return (
            <g key={i}>
              <rect x={25} y={y} width={150} height={14} rx={2} fill="none" stroke={del > 0 ? C.cherryText : C.mocha} strokeWidth={1.2} strokeDasharray={del > 0 ? '3 2' : undefined} />
              <g opacity={1 - del}>
                <rect x={25} y={y} width={150} height={14} rx={2} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.2} />
                {del < 1 && (
                  <T x={100} y={y + 11} s={11} f={C.crema} a="middle">
                    id 7777777
                  </T>
                )}
              </g>
            </g>
          );
        return <rect key={i} x={25} y={y} width={150} height={14} rx={2} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.2} />;
      })}
      {del >= 1 && (
        <T x={25} y={150} s={11} f={C.cherryText} o={easeOut(seg(t, 1.4, 1.8))}>
          count drops by one
        </T>
      )}
      <line x1={230} y1={120} x2={545} y2={120} stroke={C.mocha} strokeWidth={1.4} />
      {band > 0 && <rect x={330 - 100 * band} y={40} width={100 * band} height={80} fill={C.cocoa} stroke={C.cherryText} strokeWidth={1.2} strokeDasharray="4 3" />}
      <Wm x={330} y1={40} y2={120} k={easeOut(seg(t, 0.2, 0.6))} label="watermark" />
      {scan > 0 && <Req x1={330} x2={545} y={80} k={scan} label="next run: nothing" f={C.cherryText} />}
      {band >= 1 && (
        <T x={400} y={150} s={11} f={C.cherryText} a="middle" o={easeOut(seg(t, 3.6, 3.9))}>
          any lookback: nothing
        </T>
      )}
      {t >= 4.0 && (
        <T x={300} y={200} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 4.0, 4.4))}>
          no row, no updated_at, no signal
        </T>
      )}
    </Svg>
  );
}

// 8 · Recap. Four miss modes as cards; a bracket marked lookback + merge ticks the first three; the hard delete gets a
// cross and an arrow handing it to the change log.
export function Recap({ t }: StepCtx) {
  const modes = ['late commit', 'clock skew', 'sequence order', 'hard delete'];
  const br = easeOut(seg(t, 1.3, 1.9));
  const x4 = easeOut(seg(t, 2.4, 2.8));
  const hand = easeOut(seg(t, 3.0, 3.6));
  return (
    <Svg label="four miss modes. Lookback plus merge fixes three. One it cannot touch." h={260}>
      {modes.map((m, i) => (
        <Cell key={i} x={25} y={30 + i * 40} w={200} label={m} o={easeOut(seg(t, 0.1 + i * 0.25, 0.5 + i * 0.25))} stroke={i === 3 && x4 > 0 ? C.cherryText : C.mocha} />
      ))}
      {br > 0 && <line x1={242} y1={30} x2={242} y2={30 + 108 * br} stroke={C.focus} strokeWidth={2.5} />}
      {br > 0 && (
        <T x={258} y={89} s={13} f={C.focus} o={br}>
          lookback + merge
        </T>
      )}
      {[0, 1, 2].map((i) => (
        <MiniTick key={i} x={436} y={40 + i * 40} k={easeOut(seg(t, 1.8 + i * 0.15, 2.2 + i * 0.15))} />
      ))}
      <Cross x={245} y={164} k={x4} />
      <Req x1={262} x2={400} y={164} k={hand} label="handoff" f={C.focus} />
      <Cell x={410} y={150} w={150} label="the change log" o={easeOut(seg(t, 3.4, 3.8))} stroke={C.focus} f={C.focus} />
      {t >= 3.8 && (
        <T x={300} y={226} s={13} f={C.latte} a="middle" o={easeOut(seg(t, 3.8, 4.3))}>
          fixes three of four; the log covers the rest
        </T>
      )}
    </Svg>
  );
}

// 9 · Prove it. A small table: a bulk UPDATE flips every status cell, but the updated_at column keeps its old
// stamps. Once answered, the cursor's card crosses out.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const no = answer !== null ? easeOut(seg(s, 0.3, 0.8)) : 0;
  return (
    <Svg label="a bulk UPDATE run directly against the database, never touching updated_at at all." h={200}>
      <T x={25} y={30} s={11} f={C.latte}>
        status
      </T>
      <T x={215} y={30} s={11} f={C.latte}>
        updated_at
      </T>
      {[0, 1, 2].map((i) => {
        const flip = t >= 0.6 + i * 0.3;
        const k = easeOut(seg(t, i * 0.1, 0.3 + i * 0.1));
        return (
          <g key={i}>
            <Cell x={25} y={40 + i * 34} w={170} label={flip ? 'shipped' : 'pending'} o={k} stroke={flip ? C.second : C.mocha} />
            <Cell x={215} y={40 + i * 34} w={170} label="old stamp" o={k} />
          </g>
        );
      })}
      <Cell x={420} y={74} w={130} label="cursor" o={easeOut(seg(t, 1.4, 1.8))} stroke={no > 0 ? C.cherryText : C.mocha} />
      <Cross x={485} y={124} k={no} />
      <AnswerRow y={180} label="cursor catches it?" answer={answer} value="no" f={C.cherryText} k={easeOut(seg(t, 1.8, 2.4))} />
    </Svg>
  );
}
