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

// Every claim here traces to each cloud's own interconnect documentation, RFC 7323 on the bandwidth-delay product and
// MirrorMaker 2's own documentation (SOURCES.md); the drill's counts and the budget's milliseconds are examples.py's own.

// 0 · Plant and cloud region joined by a line, records flowing. The line is cut; records pile up at the plant. It comes
// back and the backlog drains across. Then the question: not "did we lose anything", but "can we show it, with a count".
export function LinkCutHook({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const cut = t > 1.0 && t < 2.6;
  const gap = cut ? easeOut(seg(t, 1.0, 1.3)) : t >= 2.6 ? 1 - easeOut(seg(t, 2.6, 2.9)) : 0;
  return (
    <Svg label="A WAN link between a plant and its cloud region, cut, then restored" h={250}>
      <Cell x={25} y={60} w={120} label="plant" o={k(0)} />
      <Cell x={455} y={60} w={120} label="cloud region" o={k(0.1)} />
      <line x1={150} y1={74} x2={300 - 14 * gap} y2={74} stroke={t >= 2.9 ? C.focus : cut ? C.cherryText : C.crema} strokeWidth={1.8} opacity={k(0.1)} />
      <line x1={300 + 14 * gap} y1={74} x2={450} y2={74} stroke={t >= 2.9 ? C.focus : cut ? C.cherryText : C.crema} strokeWidth={1.8} opacity={k(0.1)} />
      {[0, 1, 2].map((j) => {
        const m = seg(t, 0.2 + j * 0.25, 0.7 + j * 0.25);
        return m > 0 && m < 1 ? <Pip key={j} x={lerp(155, 445, m)} y={74} s={8} f={C.second} /> : null;
      })}
      {t > 1.2 && t < 2.8 && (
        <T x={300} y={54} s={11} f={C.cherryText} a="middle" o={k(1.2)}>
          cut, four hours
        </T>
      )}
      {[0, 1, 2, 3, 4, 5].map((j) => {
        const born = easeOut(seg(t, 1.3 + j * 0.18, 1.5 + j * 0.18));
        const up = easeInOut(seg(t, 2.9 + j * 0.1, 3.1 + j * 0.1));
        const go = easeInOut(seg(t, 3.1 + j * 0.1, 3.6 + j * 0.1));
        if (go >= 1 || born <= 0) return null;
        const x = go > 0 ? lerp(150, 445, go) : lerp(40 + j * 18, 150, up);
        const y = go > 0 ? 74 : lerp(112, 74, up);
        return <Pip key={j} x={x} y={y} s={9} f={C.caramel} o={born} />;
      })}
      {t > 3.7 && (
        <T x={25} y={170} s={12} f={C.taupe} o={k(3.7)}>
          did we lose anything?
        </T>
      )}
      <Cross x={225} y={165} k={k(4.0)} />
      {t > 4.3 && (
        <T x={25} y={210} s={13} f={C.focus} o={k(4.3)}>
          can we show it, with a count?
        </T>
      )}
    </Svg>
  );
}

// 1 · Predict. The producer keeps writing while the link is down; its records gather beside a "?". Once answered, they
// line up in a local buffer in arrival order, and an arrow shows them leaving in that order once the link returns.
export function PredictWhatHappensDuringOutage({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const w = answer !== null ? easeInOut(seg(s, 0.6, 1.1)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  return (
    <Svg label="While the link is down, what happens to the records the producer keeps writing?" h={250}>
      <Cell x={25} y={70} w={130} label="producer" o={k(0)} />
      <line x1={330} y1={84} x2={410} y2={84} stroke={C.cherryText} strokeWidth={1.8} strokeDasharray="4 4" opacity={k(0.1)} />
      <Cell x={425} y={70} w={150} label="cloud" o={k(0.1)} />
      {[0, 1, 2, 3, 4].map((j) => (
        <Pip key={j} x={lerp(175 + j * 14, 190 + j * 26, v)} y={lerp(120 + (j % 2) * 14, 84, v)} s={11} f={C.second} o={k(0.3 + j * 0.12)} />
      ))}
      {v > 0 && <Hole x={170} y={70} w={150} o={v} stroke={C.focus} />}
      {answer === null && t > 1.0 && (
        <T x={250} y={128} s={15} f={C.taupe} a="middle" o={k(1.0)}>
          ?
        </T>
      )}
      <Req x1={330} x2={418} y={124} k={w} f={C.focus} label="in order, once back" />
      <Verdict answer={answer} text="buffered locally, sent in order" y={200} />
    </Svg>
  );
}

// 2 · Two lanes. The dedicated interconnect: a reserved lane with only our records in it, moving at one steady pace. The
// VPN: the public road, other traffic crowding past, our records speeding and stalling with it.
export function InterconnectVsVpn({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const steady = (j: number) => 30 + ((t * 95 + j * 135) % 540);
  const jitter = (j: number) => 30 + ((t * 70 + 18 * Math.sin(t * 4 + j) + j * 180) % 540);
  return (
    <Svg label="A dedicated circuit, reserved for one customer, vs a VPN sharing the public internet" h={250}>
      <T x={25} y={34} s={12} f={C.second} o={k(0)}>
        dedicated interconnect: a reserved lane
      </T>
      <rect x={25} y={44} width={550} height={30} rx={6} fill="none" stroke={C.second} strokeWidth={1.5} opacity={k(0)} />
      {t > 0.4 && [0, 1, 2, 3].map((j) => <Pip key={j} x={steady(j)} y={59} s={10} f={C.focus} />)}
      {t > 1.4 && (
        <T x={25} y={96} s={11} f={C.focus} o={k(1.4)}>
          steady latency, a known tier, billed for the circuit
        </T>
      )}
      <T x={25} y={140} s={12} f={C.caramel} o={k(1.8)}>
        VPN: the public internet
      </T>
      <rect x={25} y={150} width={550} height={30} rx={6} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={k(1.8)} />
      {t > 2.0 && Array.from({ length: 9 }, (_, j) => <Pip key={j} x={30 + ((t * (60 + j * 17) + j * 61) % 540)} y={158 + (j % 3) * 7} s={7} f={C.taupe} />)}
      {t > 2.2 && [0, 1, 2].map((j) => <Pip key={j} x={jitter(j)} y={165} s={10} f={C.focus} />)}
      {t > 3.2 && (
        <T x={25} y={202} s={11} f={C.caramel} o={k(3.2)}>
          cheaper to start; shares whatever the internet does
        </T>
      )}
    </Svg>
  );
}

// 3 · One long pipe. A single stream sends a chunk across and waits for its acknowledgement to come back before sending
// the next, so most of the pipe sits empty. Then several streams at once fill it end to end.
export function BandwidthDelayProduct({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const go = easeInOut(seg(t, 0.6, 1.6));
  const ack = easeInOut(seg(t, 1.6, 2.6));
  const fill = clamp(seg(t, 3.4, 4.6));
  return (
    <Svg label="A link's capacity times its round-trip delay is how much data can be in flight at once" h={250}>
      <T x={25} y={34} s={12} f={C.crema} o={k(0)}>
        capacity × round-trip delay = data in flight
      </T>
      <rect x={25} y={70} width={550} height={44} rx={6} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={k(0.2)} />
      {t < 3.0 && go > 0 && go < 1 && <rect x={lerp(30, 530, go)} y={80} width={40} height={24} rx={3} fill={C.second} />}
      {t < 3.0 && ack > 0 && ack < 1 && <Pip x={lerp(560, 40, ack)} y={128} s={7} f={C.caramel} />}
      {t > 1.7 && t < 3.0 && (
        <T x={25} y={150} s={11} f={C.caramel} o={k(1.7)}>
          waiting for the acknowledgement
        </T>
      )}
      {t > 2.6 && t < 3.2 && (
        <T x={25} y={176} s={12} f={C.cherryText} o={k(2.6)}>
          one stream: most of the link idle
        </T>
      )}
      {t >= 3.2 &&
        Array.from({ length: 8 }, (_, j) => {
          const x = lerp(-40 + j * 66, 30 + j * 66, fill);
          return x > 25 ? <rect key={j} x={x} y={80} width={50} height={24} rx={3} fill={C.second} /> : null;
        })}
      {t > 4.6 && (
        <T x={25} y={176} s={12} f={C.focus} o={k(4.6)}>
          several streams at once fill it
        </T>
      )}
    </Svg>
  );
}

// 4 · The drill. Ten records pass straight through to the delivered tray while the link is up. The link is cut and five
// more queue in the backlog, in order. It comes back, the backlog drains first, and the count runs: 15 sent, 15 delivered.
export function WanFailureDrill({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const down = t > 1.7 && t < 3.0;
  const slot = (n: number) => [447 + (n % 5) * 26, 56 + Math.floor(n / 5) * 20];
  return (
    <Svg label="A local queue stands in for the WAN link: cut, buffered, restored, counted" h={250}>
      <Cell x={25} y={60} w={120} label="producer" o={k(0)} />
      <Cell x={210} y={60} w={160} label={down ? 'link: down' : 'link: up'} o={k(0.1)} stroke={down ? C.cherryText : C.focus} f={down ? C.cherryText : C.focus} />
      <Hole x={430} y={40} w={145} h={70} o={k(0.2)} />
      <T x={502} y={130} s={11} f={C.taupe} a="middle" o={k(0.2)}>
        delivered
      </T>
      <Hole x={210} y={124} w={160} h={30} o={k(1.8)} stroke={C.caramel} />
      <T x={290} y={172} s={11} f={C.caramel} a="middle" o={k(1.8)}>
        backlog, in order
      </T>
      {Array.from({ length: 10 }, (_, j) => {
        const m = easeInOut(seg(t, 0.3 + j * 0.1, 0.8 + j * 0.1));
        const [sx, sy] = slot(j);
        return m > 0 ? <Pip key={j} x={lerp(150, sx, m)} y={lerp(28, sy, m)} s={10} f={C.second} /> : null;
      })}
      {Array.from({ length: 5 }, (_, j) => {
        const into = easeInOut(seg(t, 1.9 + j * 0.15, 2.3 + j * 0.15));
        const out = easeInOut(seg(t, 3.1 + j * 0.12, 3.6 + j * 0.12));
        const [sx, sy] = slot(10 + j);
        const bx = 230 + j * 26;
        if (into <= 0) return null;
        const x = out > 0 ? lerp(bx, sx, out) : lerp(150, bx, into);
        const y = out > 0 ? lerp(139, sy, out) : lerp(139, 139, into);
        return <Pip key={j} x={x} y={y} s={10} f={C.caramel} />;
      })}
      {t > 4.0 && (
        <T x={25} y={214} s={12} f={C.crema} o={k(4.0)}>
          sent: 15
        </T>
      )}
      {t > 4.3 && (
        <T x={140} y={214} s={12} f={C.crema} o={k(4.3)}>
          delivered: 15
        </T>
      )}
      <MiniTick x={290} y={208} k={k(4.6)} />
      {t > 4.6 && (
        <T x={310} y={214} s={12} f={C.focus} o={k(4.6)}>
          same order, no gaps
        </T>
      )}
    </Svg>
  );
}

// 5 · The 2000 ms deadline as a bar. The WAN hop's 40 ms is spent off the front, then 160 ms of fixed overhead; what is
// left is the processing budget. Below, the 500 ms alerting deadline loses the same two slices and keeps far less.
export function LatencyBudget({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const px = 550 / 2000;
  const bar = (y: number, ms: number, d: number) => {
    const w = easeOut(seg(t, d, d + 0.5));
    const a = easeOut(seg(t, d + 0.6, d + 0.9));
    const b = easeOut(seg(t, d + 1.0, d + 1.3));
    const rest = easeOut(seg(t, d + 1.4, d + 1.8));
    return (
      <g>
        <rect x={25} y={y} width={ms * px * w} height={22} rx={3} fill="none" stroke={C.crema} strokeWidth={1.5} />
        <rect x={25} y={y} width={40 * px * a} height={22} fill={C.caramel} />
        <rect x={25 + 40 * px} y={y} width={160 * px * b} height={22} fill={C.cherryText} opacity={b > 0 ? 1 : 0} />
        <rect x={25 + 200 * px} y={y} width={(ms - 200) * px * rest} height={22} fill={C.focus} opacity={0.35} />
      </g>
    );
  };
  return (
    <Svg label="An end-to-end deadline, minus the WAN hop, minus fixed overhead, leaves the processing budget" h={250}>
      <T x={25} y={34} s={12} f={C.crema} o={k(0)}>
        deadline: 2000 ms
      </T>
      {bar(44, 2000, 0.1)}
      {t > 0.8 && (
        <T x={25} y={90} s={11} f={C.caramel} o={k(0.8)}>
          WAN hop: 40 ms
        </T>
      )}
      {t > 1.2 && (
        <T x={150} y={90} s={11} f={C.cherryText} o={k(1.2)}>
          fixed overhead: 160 ms
        </T>
      )}
      {t > 1.7 && (
        <T x={345} y={90} s={11} f={C.focus} o={k(1.7)}>
          what's left: processing
        </T>
      )}
      <T x={25} y={142} s={12} f={C.crema} o={k(2.2)}>
        alerting deadline: 500 ms
      </T>
      {bar(152, 500, 2.3)}
      {t > 4.2 && (
        <T x={25} y={200} s={12} f={C.cherryText} o={k(4.2)}>
          the same two slices, far less left
        </T>
      )}
    </Svg>
  );
}

// 6 · Four corner cards, each a decision made earlier in the chapter: the SAP extraction path, the OT edge buffer,
// workload placement by shape, the residency rule. Then the new piece in the middle, the wire, linked to all four.
export function AdrSynthesis({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const corners = [
    { x: 25, y: 30, label: 'SAP: log-based extraction' },
    { x: 325, y: 30, label: 'OT edge buffer at the DMZ' },
    { x: 25, y: 170, label: 'workload placed by shape' },
    { x: 325, y: 170, label: 'the residency rule' },
  ];
  const link = easeOut(seg(t, 4.0, 4.6));
  return (
    <Svg label="One design, pulling four earlier decisions plus this topic's own connection together" h={250}>
      {corners.map((c, i) => (
        <Cell key={c.label} x={c.x} y={c.y} w={250} label={c.label} o={k(0.3 + i * 0.6)} />
      ))}
      {t > 2.7 && (
        <T x={300} y={82} s={11} f={C.taupe} a="middle" o={k(2.7)}>
          made earlier in this chapter
        </T>
      )}
      <Fan x1={220} y1={100} x2={150} y2={62} k={link} f={C.focus} />
      <Fan x1={380} y1={100} x2={450} y2={62} k={link} f={C.focus} />
      <Fan x1={220} y1={128} x2={150} y2={166} k={link} f={C.focus} />
      <Fan x1={380} y1={128} x2={450} y2={166} k={link} f={C.focus} />
      <Cell x={150} y={100} w={300} label="the wire: sized, then drilled" o={k(3.4)} stroke={C.focus} f={C.focus} />
      {t > 5.0 && (
        <T x={300} y={236} s={12} f={C.focus} a="middle" o={k(5.0)}>
          tested against what actually breaks it
        </T>
      )}
    </Svg>
  );
}

// 7 · Recap. Five cards slide in, one per line of the summary, the last one the count: no count, no recovery claim.
export function Recap({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const pts = ['rated speed vs usable speed', 'reserved lane: steady latency', 'fill it with parallel streams', 'deadline minus what is spent', 'no count, no recovery claim'];
  return (
    <Svg label="The four-part recap of this topic's point" h={250}>
      {pts.map((p, i) => {
        const d = 0.3 + i * 0.7;
        const a = easeOut(seg(t, d, d + 0.45));
        const x = i === 4 ? 167 : 25 + (i % 2) * 285;
        const y = 36 + Math.floor(i / 2) * 58;
        return a > 0 ? <Cell key={p} x={lerp(x - 16, x, a)} y={y} w={265} label={p} o={a} stroke={i === 4 ? C.focus : C.mocha} f={i === 4 ? C.focus : C.crema} /> : null;
      })}
    </Svg>
  );
}

// 8 · Prove it. Two producers interleave into one queue; after the outage the count matches. Once answered, the sent and
// arrived sequences are drawn one above the other, and the crossing lines show a count can match while the order breaks.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.7)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const perm = [0, 2, 1, 3, 4];
  return (
    <Svg label="A matching row count after a second outage — does that alone prove order survived too?" h={250}>
      <Cell x={25} y={36} w={120} label="producer A" o={k(0)} />
      <Cell x={25} y={80} w={120} label="producer B" o={k(0.1)} stroke={C.caramel} />
      <Hole x={200} y={56} w={200} h={32} o={k(0.3)} />
      {[0, 1, 2, 3, 4].map((j) => (
        <Pip key={j} x={225 + j * 36} y={72} s={12} f={j % 2 ? C.caramel : C.focus} o={k(0.5 + j * 0.1)} />
      ))}
      <MiniTick x={420} y={68} k={k(1.3)} />
      {t > 1.4 && (
        <T x={440} y={77} s={12} f={C.focus} o={k(1.4)}>
          count matches
        </T>
      )}
      {v > 0 && (
        <g opacity={v}>
          <T x={25} y={152} s={11} f={C.taupe}>
            sent
          </T>
          <T x={25} y={202} s={11} f={C.taupe}>
            arrived
          </T>
          {perm.map((p, j) => (
            <g key={j}>
              <Pip x={225 + j * 36} y={148} s={10} f={C.crema} />
              <line x1={225 + j * 36} y1={154} x2={lerp(225 + j * 36, 225 + p * 36, v)} y2={192} stroke={p === j ? C.mocha : C.cherryText} strokeWidth={1.5} />
              <Pip x={225 + p * 36} y={198} s={10} f={p === j ? C.crema : C.cherryText} />
            </g>
          ))}
        </g>
      )}
      <Verdict answer={answer} text="no: order is a separate check" y={240} />
    </Svg>
  );
}
