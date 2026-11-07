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

/** Seconds to x on a shared time axis that starts at x = 120 and spans `span` seconds over 440 px. */
const tx = (s: number, span: number) => 120 + (440 * s) / span;

// 1 · Hook. A pool of five connections, all healthy; one call through one of them breaks, and what happens next is the open
// question.
export function Hook({ t }: StepCtx) {
  const b = easeOut(seg(t, 1.8, 2.3));
  return (
    <Svg label="a pool decides how many connections exist — what happens when one of its calls fails?" h={220}>
      <Row y={40} label="a pool of connections" value="one call fails" valueColor={C.cherryText} k={easeOut(seg(t, 0.3, 0.8))} />
      {Array.from({ length: 5 }, (_, i) => {
        const bad = i === 2;
        return (
          <g key={i} opacity={easeOut(seg(t, 0.5 + i * 0.12, 0.8 + i * 0.12))}>
            <line x1={25} y1={74 + i * 22} x2={bad ? lerp(450, 300, b) : 450} y2={74 + i * 22} stroke={bad && b > 0 ? C.cherryText : C.focus} strokeWidth={2} />
          </g>
        );
      })}
      <Cross x={315} y={118} k={b} />
      <Cell x={465} y={60} w={110} h={130} label="database" o={easeOut(seg(t, 0.4, 0.7))} />
      <T x={360} y={124} s={18} f={C.focus} o={easeOut(seg(t, 2.8, 3.2))}>
        then?
      </T>
    </Svg>
  );
}

// 2 · The timeout, measured. On one axis: the slow endpoint would take 2 s, but the call gives up at the 0.3 s line; the fast
// call returns well before that line.
export function RevealTimeout({ t }: StepCtx) {
  const span = 2.0;
  const a = easeOut(seg(t, 0.6, 1.8));
  const f = easeOut(seg(t, 2.0, 2.4));
  return (
    <Svg label="a slow endpoint vs. a fast one, called through the same client timeout — measured directly" h={230}>
      <Row y={40} label="timeout" value="0.3 s" k={easeOut(seg(t, 0.2, 0.7))} />
      <line x1={tx(0.3, span)} y1={64} x2={tx(0.3, span)} y2={150} stroke={C.focus} strokeWidth={1.5} strokeDasharray="4 4" opacity={easeOut(seg(t, 0.4, 0.7))} />
      <T x={25} y={90} s={12} f={C.latte} o={easeOut(seg(t, 0.5, 0.8))}>
        /slow, 2 s
      </T>
      <rect x={120} y={80} width={440} height={14} rx={2} fill="none" stroke={C.mocha} strokeWidth={1} strokeDasharray="4 4" opacity={easeOut(seg(t, 0.5, 0.8))} />
      <rect x={120} y={80} width={(tx(0.3, span) - 120) * a} height={14} rx={2} fill={C.cherryText} opacity={0.8} />
      <Cross x={tx(0.3, span) + 14} y={87} k={easeOut(seg(t, 1.8, 2.1))} />
      <T x={25} y={130} s={12} f={C.latte} o={easeOut(seg(t, 1.8, 2.1))}>
        /fast
      </T>
      <rect x={120} y={120} width={14 * f} height={14} rx={2} fill={C.focus} opacity={0.85} />
      <Row y={200} label="slow call" value="gave up near 0.3 s" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
    </Svg>
  );
}

// 3 · Deadline propagation. One 0.3 s budget bar; hop A takes 0.1 s, hop B 0.15 s, a 0.1 s queue takes the rest and more, and
// hop C, asking for 0.2 s, finds nothing left and is skipped.
export function RevealDeadlinePropagation({ t }: StepCtx) {
  const span = 0.6;
  const parts: [string, number, number, string][] = [
    ['A', 0, 0.1, C.second],
    ['B', 0.1, 0.25, C.second],
    ['queue', 0.25, 0.35, C.latte],
  ];
  return (
    <Svg label="one shared deadline, handed down three hops — does the last hop still do the work?" h={240}>
      <Row y={40} label="one shared deadline" value="0.3 s" k={easeOut(seg(t, 0.2, 0.7))} />
      <line x1={tx(0.3, span)} y1={62} x2={tx(0.3, span)} y2={170} stroke={C.cherryText} strokeWidth={1.5} strokeDasharray="4 4" opacity={easeOut(seg(t, 0.4, 0.7))} />
      <T x={tx(0.3, span) + 6} y={72} s={11} f={C.cherryText} o={easeOut(seg(t, 0.4, 0.7))}>
        deadline
      </T>
      {parts.map(([l, a, b, c], i) => {
        const k = easeOut(seg(t, 0.8 + i * 0.6, 1.3 + i * 0.6));
        return (
          <g key={l}>
            <T x={25} y={100 + i * 26} s={12} f={C.latte} o={k}>
              {l === 'queue' ? 'queue' : `hop ${l}`}
            </T>
            <rect x={tx(a, span)} y={90 + i * 26} width={(tx(b, span) - tx(a, span)) * k} height={14} rx={2} fill={c} opacity={0.8} />
          </g>
        );
      })}
      <T x={25} y={178} s={12} f={C.latte} o={easeOut(seg(t, 2.6, 2.9))}>
        hop C
      </T>
      <rect x={tx(0.35, span)} y={168} width={tx(0.2, span) - 120} height={14} rx={2} fill="none" stroke={C.cherryText} strokeWidth={1.2} strokeDasharray="4 3" opacity={easeOut(seg(t, 2.7, 3.0))} />
      <Cross x={tx(0.45, span)} y={175} k={easeOut(seg(t, 3.0, 3.3))} />
      <Row y={222} label="hop C" value="skipped, time's up" valueColor={C.focus} k={easeOut(seg(t, 3.4, 3.9))} />
    </Svg>
  );
}

// 4 · Predict: does jitter add anything? Five clients' retries on capped backoff alone, stacked on the same moments; then the
// question.
export function PredictJitter({ t, answer }: StepCtx) {
  return (
    <Svg label="capped exponential backoff already spreads retries out — does adding randomness actually help more?" h={210}>
      <Row y={40} label="backoff, then randomness" value="helps more?" k={easeOut(seg(t, 0.1, 0.5))} />
      {[0, 1, 2, 3].map((r) =>
        Array.from({ length: 5 }, (_, i) => (
          <circle key={`${r}-${i}`} cx={60 + [0, 40, 120, 280][r]} cy={64 + i * 9} r={3.5} fill={C.cherryText} opacity={easeOut(seg(t, 0.3 + r * 0.2, 0.5 + r * 0.2))} />
        )),
      )}
      <AnswerRow y={140} label="just noise" answer={answer} value="no, it really helps" k={easeOut(seg(t, 1.2, 1.7))} />
      <Verdict answer={answer} text="backoff alone keeps them in step" />
    </Svg>
  );
}

// 5 · Jitter, measured and simulated. Top: the real client fails four times and succeeds on attempt 5, each wait drawn from 0 up
// to its capped ceiling. Bottom: 100 clients without jitter land in one column; with it they spread out.
export function RevealJitter({ t }: StepCtx) {
  const ceil = [0.05, 0.1, 0.2, 0.4];
  const draw = [0.6, 0.3, 0.8, 0.45];
  const s = easeInOut(seg(t, 2.4, 3.2));
  return (
    <Svg label="a real client backing off with jitter, and a hundred synchronized clients with and without it" h={250}>
      <Row y={40} label="4 failures, then success" value="on attempt 5" k={easeOut(seg(t, 0.2, 0.7))} />
      {ceil.map((c, i) => {
        const k = easeOut(seg(t, 0.6 + i * 0.3, 0.9 + i * 0.3));
        const x = 25 + i * 110;
        return (
          <g key={i} opacity={k}>
            <rect x={x} y={64} width={c * 230} height={10} rx={2} fill="none" stroke={C.mocha} strokeWidth={1} />
            <rect x={x} y={64} width={c * 230 * draw[i]} height={10} rx={2} fill={C.second} />
          </g>
        );
      })}
      <Tick y={66} k={easeOut(seg(t, 1.9, 2.2))} />
      <T x={25} y={94} s={11} f={C.latte} o={easeOut(seg(t, 1.2, 1.5))}>
        each wait: random, under its capped ceiling
      </T>
      <T x={25} y={124} s={12} f={C.latte} o={easeOut(seg(t, 2.2, 2.5))}>
        100 clients
      </T>
      {Array.from({ length: 100 }, (_, i) => {
        const jx = 150 + ((i * 37) % 100) * 4.2;
        const jy = 118 + Math.floor(i / 100) * 0 + (i % 10) * 0;
        const col = i % 25;
        const row = Math.floor(i / 25);
        const x0 = 160 + row * 0;
        const y0 = 118 + col * 3;
        return <circle key={i} cx={lerp(x0, jx, s)} cy={lerp(y0, jy + ((i * 13) % 5) * 12 + row * 0, s)} r={2} fill={s > 0.5 ? C.focus : C.cherryText} opacity={easeOut(seg(t, 2.2, 2.6))} />;
      })}
      <Row y={225} label="busiest 10 ms" value="100 without, fewer with" valueColor={C.focus} k={easeOut(seg(t, 3.4, 3.9))} />
    </Svg>
  );
}

// 6 · The retry budget. Five tokens; each attempt against the always-down server spends one and the server's counter ticks;
// with the tokens gone, the client stops, and the counter stays at 5.
export function RevealRetryBudget({ t }: StepCtx) {
  const n = Math.min(5, Math.floor(clamp(seg(t, 0.8, 3.0)) * 5.99));
  return (
    <Svg label="a fixed number of retry tokens against a server that never recovers — what happens once they run out?" h={220}>
      <Row y={40} label="retry budget" value="5 tokens" k={easeOut(seg(t, 0.2, 0.7))} />
      {Array.from({ length: 5 }, (_, i) => (
        <circle key={i} cx={45 + i * 34} cy={90} r={11} fill={i < n ? 'none' : C.focus} stroke={C.focus} strokeWidth={1.5} opacity={easeOut(seg(t, 0.4, 0.7)) * (i < n ? 0.4 : 1)} />
      ))}
      <T x={420} y={86} s={12} f={C.latte} a="end" o={easeOut(seg(t, 0.6, 0.9))}>
        server calls
      </T>
      <T x={575} y={92} s={22} f={C.cherryText} a="end" o={easeOut(seg(t, 0.6, 0.9))}>
        {String(n)}
      </T>
      <Cell x={25} y={124} w={250} label="tokens gone: fail fast" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 3.0, 3.4))} />
      <Row y={195} label="server calls" value="exactly 5" valueColor={C.focus} k={easeOut(seg(t, 3.4, 3.9))} />
    </Svg>
  );
}

// 7 · The circuit breaker. Three closed calls each run out to their 0.2 s timeout and fail; the breaker trips open; the fourth
// call is refused at once, a sliver of a bar, and never reaches the network.
export function RevealCircuitBreaker({ t }: StepCtx) {
  const span = 0.3;
  const o = easeOut(seg(t, 2.6, 3.0));
  return (
    <Svg label="the same failing call, before and after the breaker trips open — measured elapsed time" h={240}>
      <Row y={40} label="3 failures" value="the breaker opens" k={easeOut(seg(t, 0.2, 0.7))} />
      {[0, 1, 2].map((i) => {
        const k = easeOut(seg(t, 0.5 + i * 0.6, 1.0 + i * 0.6));
        return (
          <g key={i}>
            <T x={25} y={82 + i * 26} s={12} f={C.latte} o={k}>
              {`closed, call ${i + 1}`}
            </T>
            <rect x={150} y={72 + i * 26} width={((440 * 0.2) / span) * k} height={14} rx={2} fill={C.cherryText} opacity={0.75} />
          </g>
        );
      })}
      <T x={25} y={160} s={12} f={C.focus} o={o}>
        open, call 4
      </T>
      <rect x={150} y={150} width={4 * o} height={14} rx={1} fill={C.focus} />
      <T x={170} y={161} s={11} f={C.focus} o={easeOut(seg(t, 3.0, 3.3))}>
        refused, no network
      </T>
      <Row y={215} label="once open" value="under half the time" valueColor={C.focus} k={easeOut(seg(t, 3.5, 4.0))} />
    </Svg>
  );
}

// 8 · Idempotency. The same charge is sent three times with one key, and the server's effect counter rises once; a different
// key, then two calls with no key, each add their own effect.
export function RevealIdempotency({ t }: StepCtx) {
  const sends: [string, boolean, number][] = [
    ['key K', true, 0.4],
    ['key K', false, 0.9],
    ['key K', false, 1.4],
    ['new key', true, 2.1],
    ['no key', true, 2.6],
    ['no key', true, 3.0],
  ];
  const count = sends.filter(([, adds, at]) => adds && t >= at + 0.3).length;
  return (
    <Svg label="the identical write, sent three times with one key — one server-side effect, or three?" h={240}>
      <Row y={40} label="POST /charge, amount 500" value="effects counted" k={easeOut(seg(t, 0.2, 0.6))} />
      {sends.map(([l, adds, at], i) => (
        <Cell key={i} x={25 + i * 72} y={70} w={66} label={l} stroke={adds ? C.focus : C.mocha} f={adds ? C.crema : C.latte} o={easeOut(seg(t, at, at + 0.3))} />
      ))}
      <T x={25} y={128} s={12} f={C.latte} o={easeOut(seg(t, 0.5, 0.8))}>
        server's own effect count
      </T>
      <T x={575} y={132} s={26} f={C.focus} a="end" o={easeOut(seg(t, 0.5, 0.8))}>
        {String(count)}
      </T>
      <Row y={180} label="key K, sent 3 times" value="1 effect" valueColor={C.focus} k={easeOut(seg(t, 1.8, 2.3))} />
      <Row y={222} label="all six sends" value="4 effects" k={easeOut(seg(t, 3.5, 4.0))} />
    </Svg>
  );
}

// 9 · Recap. Five rows land one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a measured timeout, a shared deadline, jitter that actually spreads retries, a budget, a breaker, and one real effect" h={250}>
      <Row y={35} label="a timeout" value="bounds one call" k={easeOut(seg(t, 0.4, 0.9))} />
      <Row y={80} label="a shared deadline" value="lets later hops skip" k={easeOut(seg(t, 1.1, 1.6))} />
      <Row y={125} label="jitter" value="spreads retries out" valueColor={C.focus} k={easeOut(seg(t, 1.8, 2.3))} />
      <Row y={170} label="budget, breaker" value="two different fixes" k={easeOut(seg(t, 2.5, 3.0))} />
      <Row y={215} label="an idempotency key" value="one real effect" valueColor={C.focus} k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 10 · Prove: a double charge. The retried payment, sent with no key, counts two charges; each hop starts its own fresh
// deadline. After the answer the two fixes land beside the two faults.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const k = (i: number) => (answer !== null ? easeOut(seg(s, 0.1 + i * 0.3, 0.5 + i * 0.3)) : 0);
  const v = answer !== null ? easeOut(seg(s, 0.9, 1.3)) : 0;
  return (
    <Svg label="a retried payment with no idempotency key and a reset deadline at every hop — what breaks, and why?" h={230}>
      <Row y={40} label="charged twice, hops run on" value="what's wrong?" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="retries are safe" answer={answer} value="no, two faults" f={C.cherryText} k={easeOut(seg(t, 0.4, 0.9))} />
      <Cell x={25} y={110} w={260} label="no key: 2 charges" stroke={C.cherryText} o={easeOut(seg(t, 0.6, 0.9))} />
      <Cell x={315} y={110} w={260} label="a fresh deadline per hop" stroke={C.cherryText} o={easeOut(seg(t, 0.8, 1.1))} />
      {['send an idempotency key', 'pass one deadline down'].map((l, i) => (
        <T key={l} x={155 + i * 290} y={lerp(168, 160, k(i))} s={12} f={C.focus} a="middle" o={k(i)}>
          {l}
        </T>
      ))}
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, v)} s={15} f={C.focus} a="middle" o={v}>
            two faults, two fixes
          </T>
          <rect x={150} y={202} width={300 * v} height={3} fill={C.focus} />
        </>
      )}
    </Svg>
  );
}
