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

// Every value here is examples.py's own: the W3C traceparent's four parts, the record key order-4821, the five producer
// contexts, the default link limit of 128, run-4821 and the span's 842 ms. The million messages is words and a field of
// marks; counts computed from it (the dropped links) are drawn, never printed.

const SYSTEMS = ['database', 'Kafka', 'Spark'];

// 0 · Hook. Three systems, each filling its own log with ticked lines. A wrong order sits below. Then the seams between them
// light up with question marks: three perfect logs, and nobody sees the hops.
export function Hook({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="three systems. Each logs perfectly. None sees the others." h={250}>
      {SYSTEMS.map((n, i) => {
        const x = 25 + i * 205;
        return (
          <g key={n}>
            <Cell x={x} y={40} w={140} label={n} o={k(i * 0.15)} />
            {[0, 1, 2, 3].map((j) => (
              <g key={j}>
                <rect x={x + 8} y={92 + j * 16} width={(70 + ((i * 3 + j * 5) % 4) * 8) * k(1.0 + j * 0.3 + i * 0.1)} height={5} rx={2} fill={C.latte} opacity={0.7} />
                <MiniTick x={x + 118} y={92 + j * 16} k={k(1.2 + j * 0.3 + i * 0.1)} />
              </g>
            ))}
          </g>
        );
      })}
      {[0, 1].map((i) => {
        const x = 165 + i * 205;
        const o = k(3.0 + i * 0.3);
        return (
          <g key={i} opacity={o}>
            <line x1={x + 4} y1={54} x2={x + 61} y2={54} stroke={C.cherryText} strokeWidth={1.6} strokeDasharray="4 4" />
            <T x={x + 32} y={42} s={13} f={C.cherryText} a="middle">
              ?
            </T>
          </g>
        );
      })}
      <Pip x={33} y={210} f={C.cherryText} o={k(0.3)} />
      <T x={48} y={214} s={12} f={C.crema} o={k(0.3)}>
        one order, wrong in the warehouse
      </T>
      {t > 3.6 && (
        <T x={48} y={236} s={11} f={C.taupe} o={k(3.6)}>
          which hop broke it?
        </T>
      )}
    </Svg>
  );
}

// 1 · Predict. Three ways to find the hop. Once answered, the chain and the shared id are crossed and links light.
export function Predict({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const opts = ['one parent-child chain', 'a shared order id', "links to each hop's source"];
  return (
    <Svg label="one query, not three greps. How?" h={250}>
      {opts.map((o, i) => {
        const a = answer !== null ? easeOut(seg(s, 0.1 + i * 0.25, 0.4 + i * 0.25)) : 0;
        return (
          <g key={o}>
            <Cell x={25} y={40 + i * 46} w={300} label={o} o={k(i * 0.3)} stroke={a > 0.5 ? (i === 2 ? C.focus : C.cherryText) : C.mocha} f={a > 0.5 && i < 2 ? C.taupe : C.crema} />
            {i < 2 && <Cross x={345} y={54 + i * 46} k={a} />}
            {i === 2 && <MiniTick x={340} y={146} k={a} />}
          </g>
        );
      })}
      {answer === null && t > 1.2 && (
        <T x={460} y={110} s={15} f={C.taupe} a="middle" o={k(1.2)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="links: many producers, one span" y={214} />
    </Svg>
  );
}

const SIGNALS = ['traces', 'metrics', 'logs', 'baggage'];
const STAGES = ['receive', 'process', 'export'];

// 2 · Signals and the Collector. Four signals fan into one export line, the Collector's three stages light in turn, and it
// fans the data out to three stores.
export function RevealSignalsCollector({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="one export. The Collector decides where it goes." h={250}>
      {SIGNALS.map((n, i) => (
        <g key={n}>
          <Cell x={25} y={36 + i * 44} w={96} label={n} o={k(i * 0.15)} />
          <Fan x1={121} y1={50 + i * 44} x2={200} y2={116} k={k(0.7 + i * 0.1)} f={C.latte} />
        </g>
      ))}
      <line x1={200} y1={116} x2={200 + 50 * k(1.3)} y2={116} stroke={C.crema} strokeWidth={2.4} />
      <Cell x={250} y={102} w={120} label="Collector" o={k(1.4)} stroke={t > 1.6 ? C.focus : C.mocha} />
      {STAGES.map((n, i) => (
        <T key={n} x={260} y={158 + i * 20} s={11} f={t > 1.8 + i * 0.4 ? C.focus : C.taupe} o={k(1.6 + i * 0.4)}>
          {n}
        </T>
      ))}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Fan x1={370} y1={116} x2={460} y2={50 + i * 66} k={k(3.0 + i * 0.15)} />
          <Cell x={470} y={36 + i * 66} w={90} label="store" o={k(3.2 + i * 0.15)} />
        </g>
      ))}
      {t > 1.3 && (
        <T x={140} y={226} s={11} f={C.second} o={k(1.3)}>
          one export
        </T>
      )}
    </Svg>
  );
}

const PARTS: [string, number, string][] = [
  ['00', 30, 'version'],
  ['0af7651916cd43dd8448eb211c80319c', 300, 'trace id'],
  ['b7ad6b7169203331', 152, 'parent id'],
  ['01', 30, 'flags'],
];

// 3 · traceparent. The four fixed parts build left to right with their names. Below, the producer injects the string into the
// Kafka record's headers, and the consumer extracts the same trace id: ticked, unchanged.
export function RevealTraceparent({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  let x = 25;
  const cells = PARTS.map(([v, w, n], i) => {
    const cx = x;
    x += w + 8;
    return (
      <g key={n}>
        <Cell x={cx} y={30} w={w} label={v} o={k(i * 0.25)} stroke={i === 1 ? C.second : C.mocha} />
        <T x={cx + w / 2} y={78} s={11} f={i === 1 ? C.second : C.taupe} a="middle" o={k(0.2 + i * 0.25)}>
          {n}
        </T>
      </g>
    );
  });
  const inj = k(1.6);
  return (
    <Svg label="injected at produce. Extracted at consume." h={250}>
      {cells}
      <Cell x={25} y={150} w={100} label="producer" o={k(1.3)} />
      <rect x={190} y={128} width={220} height={72} rx={5} fill="none" stroke={C.latte} strokeWidth={1.5} opacity={k(1.4)} />
      <T x={200} y={148} s={11} f={C.taupe} o={k(1.4)}>
        record: order-4821
      </T>
      <Hole x={200} y={160} w={200} o={k(1.4) * (1 - inj)} />
      <Cell x={200} y={160} w={200} label="headers: traceparent" o={inj} stroke={C.second} />
      <Req x1={125} x2={190} y={164} k={k(1.6)} label="inject" />
      <Req x1={410} x2={475} y={164} k={k(2.6)} label="extract" />
      <Cell x={475} y={150} w={100} label="consumer" o={k(1.3)} stroke={t > 3.0 ? C.focus : C.mocha} />
      {t > 3.2 && (
        <T x={575} y={222} s={11} f={C.focus} a="end" o={k(3.2)}>
          same trace id
        </T>
      )}
      <MiniTick x={445} y={218} k={k(3.4)} />
    </Svg>
  );
}

// 4 · Links, not parent. Five producers. Top: each is forced into the single parent slot in turn, and every earlier one is
// knocked out, red; only the last stays. Bottom: the same five held as links, all five landing and staying.
export function RevealLinksNotParent({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const cur = Math.max(-1, Math.min(4, Math.floor((t - 0.6) / 0.4)));
  return (
    <Svg label="five producers, one parent field. Only the last survives." h={250}>
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <Pip x={40} y={44 + i * 40} f={C.crema} o={k(i * 0.08)} />
          {cur >= i && <Fan x1={46} y1={44 + i * 40} x2={258} y2={74} k={k(0.6 + i * 0.4) * (cur === i ? 1 : 0.6)} f={cur === i ? C.second : C.cherryText} />}
          <Fan x1={46} y1={44 + i * 40} x2={240 + i * 62} y2={170} k={k(2.9 + i * 0.12)} f={C.second} />
          <Cell x={240 + i * 62 - 22} y={170} w={44} h={24} label="" o={k(2.8)} stroke={t > 3.0 + i * 0.12 ? C.focus : C.mocha} />
        </g>
      ))}
      <Cell x={260} y={60} w={110} label="parent" o={k(0.3)} stroke={cur >= 0 ? C.second : C.mocha} />
      {t > 2.6 && (
        <T x={390} y={79} s={11} f={C.cherryText} o={k(2.6)}>
          only the last survives
        </T>
      )}
      {t > 2.8 && (
        <T x={218} y={222} s={11} f={C.taupe} o={k(2.8)}>
          links
        </T>
      )}
      {t > 3.8 && (
        <T x={270} y={222} s={11} f={C.focus} o={k(3.8)}>
          all five survive
        </T>
      )}
    </Svg>
  );
}

// 5 · The link limit. A field of marks stands for the million messages. The first 128 light and are kept as links; the rest
// sink and fade: dropped by design.
export function RevealLinkLimit({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const cols = 32;
  const rows = 14;
  const keep = 128;
  const drop = easeInOut(seg(t, 2.6, 3.8));
  const dots = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const n = r * cols + c;
      const kept = n < keep;
      const on = t > 1.4 + (n / keep) * 0.8;
      dots.push(
        <rect key={n} x={25 + c * 9} y={36 + r * 9 + (kept ? 0 : drop * 14)} width={5} height={5} rx={1} fill={kept && on ? C.focus : C.latte} opacity={k(r * 0.05) * (kept ? 1 : 1 - drop * 0.8)} />,
      );
    }
  }
  return (
    <Svg label="a million in. One hundred twenty-eight kept." h={250}>
      {dots}
      <T x={340} y={60} s={11} f={C.crema} o={k(0.3)}>
        a million messages
      </T>
      <T x={340} y={90} s={11} f={C.taupe} o={k(1.0)}>
        default link cap: 128
      </T>
      {t > 2.2 && (
        <T x={340} y={120} s={11} f={C.focus} o={k(2.2)}>
          kept as links
        </T>
      )}
      {t > 3.6 && (
        <T x={340} y={150} s={11} f={C.cherryText} o={k(3.6)}>
          the rest: dropped, by design
        </T>
      )}
    </Svg>
  );
}

const ATTRS = ['destination.name', 'partition.id'];

// 6 · Semantic conventions. A Kafka span and a database span drop in with the same two attribute names; matching names link
// across, and one query below fans up into both.
export function RevealSemanticConventions({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="one vocabulary. Kafka or database, queried alike." h={250}>
      {['Kafka span', 'database span'].map((n, j) => {
        const x = 25 + j * 300;
        return (
          <g key={n}>
            <rect x={x} y={30} width={250} height={110} rx={5} fill={C.cocoa} stroke={t > 2.8 ? C.focus : C.mocha} strokeWidth={1.5} opacity={k(j * 0.3)} />
            <T x={x + 12} y={52} s={12} f={C.crema} o={k(j * 0.3)}>
              {n}
            </T>
            {ATTRS.map((a, i) => (
              <T key={a} x={x + 12} y={88 + i * 30} s={11} f={t > 1.6 ? C.second : C.latte} o={k(0.6 + j * 0.3 + i * 0.2)}>
                {a}
              </T>
            ))}
          </g>
        );
      })}
      {ATTRS.map((a, i) => (
        <line key={a} x1={275} y1={84 + i * 30} x2={275 + 50 * k(1.6 + i * 0.2)} y2={84 + i * 30} stroke={C.second} strokeWidth={1.4} strokeDasharray="3 3" />
      ))}
      <Cell x={175} y={186} w={250} label="one query, same names" o={k(2.4)} stroke={C.focus} />
      <Fan x1={250} y1={186} x2={150} y2={140} k={k(2.6)} f={C.focus} />
      <Fan x1={350} y1={186} x2={450} y2={140} k={k(2.6)} f={C.focus} />
    </Svg>
  );
}

const HOPS = ['CDC write', 'Kafka', 'Spark', 'warehouse'];

// 7 · The honest break. Four hops. The three after the database write are bracketed "automatic"; the CDC write is dashed red,
// "only if passed". Run A's trace id rides all four, ticked at each. Run B's is crossed at the CDC write and the rest of its lane
// stays empty: gone.
export function RevealCdcBreak({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const hx = (i: number) => 150 + i * 108;
  const a = easeInOut(seg(t, 1.6, 3.0));
  return (
    <Svg label="three hops automatic. One hop, only if you pass it." h={250}>
      {HOPS.map((n, i) => (
        <Cell key={n} x={hx(i)} y={44} w={96} label={n} o={k(i * 0.12)} stroke={i === 0 && t > 0.9 ? C.cherryText : C.mocha} />
      ))}
      <path d={`M${hx(1)} 34 v-6 H${hx(3) + 96} v6`} fill="none" stroke={C.focus} strokeWidth={1.4} opacity={k(0.8)} />
      {t > 0.8 && (
        <T x={hx(2) + 48} y={22} s={11} f={C.focus} a="middle" o={k(0.8)}>
          automatic
        </T>
      )}
      {t > 1.0 && (
        <T x={hx(0) + 48} y={92} s={11} f={C.cherryText} a="middle" o={k(1.0)}>
          only if passed
        </T>
      )}
      <T x={25} y={134} s={11} f={C.latte} o={k(1.4)}>
        passed
      </T>
      <line x1={140} y1={130} x2={570} y2={130} stroke={C.mocha} strokeWidth={1.2} opacity={k(1.4)} />
      <Pip x={lerp(198, 522, a)} y={130} f={C.second} o={k(1.6)} />
      {HOPS.map((n, i) => (
        <MiniTick key={n} x={hx(i) + 42} y={112} k={k(1.7 + i * 0.4)} />
      ))}
      <T x={25} y={190} s={11} f={C.latte} o={k(3.1)}>
        not passed
      </T>
      <line x1={140} y1={186} x2={570} y2={186} stroke={C.mocha} strokeWidth={1.2} strokeDasharray="4 4" opacity={k(3.1) * (1 - 0.6 * k(3.6))} />
      <Pip x={198} y={186} f={C.second} o={k(3.1) * (1 - k(3.5))} />
      <Cross x={198} y={186} k={k(3.4)} />
      {t > 3.9 && (
        <T x={250} y={226} s={11} f={C.cherryText} o={k(3.9)}>
          trace id gone from here on
        </T>
      )}
    </Svg>
  );
}

const OTEL = ['run_id', 'trace_id', 'span_id', 'duration_ms', 'status'];
const OL = ['run_id', 'eventType', 'job', 'inputs', 'outputs'];

// 8 · OTel vs OpenLineage. Two records for the same run drop in field by field. Only run_id lights in both and a line joins
// them; every other field dims.
export function RevealOtelVsOpenLineage({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const dim = k(3.2);
  const card = (x: number, title: string, sub: string, keys: string[], d: number) => (
    <g>
      <T x={x} y={34} s={12} f={C.crema} o={k(d)}>
        {title}
      </T>
      <T x={x} y={54} s={11} f={C.taupe} o={k(d + 0.2)}>
        {sub}
      </T>
      <rect x={x} y={66} width={250} height={140} rx={5} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.4} opacity={k(d)} />
      {keys.map((n, i) => (
        <T key={n} x={x + 14} y={90 + i * 26} s={11} f={i === 0 && t > 3.0 ? C.focus : C.latte} o={k(d + 0.4 + i * 0.15) * (i === 0 ? 1 : 1 - 0.6 * dim)}>
          {n}
        </T>
      ))}
    </g>
  );
  return (
    <Svg label="two questions, two shapes. A run id is all they share." h={250}>
      {card(25, 'OpenTelemetry span', 'what ran, how long', OTEL, 0)}
      {card(325, 'OpenLineage RunEvent', 'what it read and wrote', OL, 1.2)}
      <T x={150} y={90} s={11} f={C.taupe} o={k(0.6)}>
        run-4821
      </T>
      <line x1={275} y1={86} x2={275 + 50 * k(3.0)} y2={86} stroke={C.focus} strokeWidth={2} />
      {t > 3.6 && (
        <T x={300} y={232} s={11} f={C.focus} a="middle" o={k(3.6)}>
          run_id: all they share
        </T>
      )}
    </Svg>
  );
}

// 9 · Recap. Four lines land in order, each with its glyph: a header slot, a fan of links into one span, a dashed seam with
// its cross, two boxes joined by one line.
export function Recap({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const items = ['a header across the hop', 'links where one parent cannot be', 'one seam, named honestly', 'two standards, two questions'];
  return (
    <Svg label="a header, a link, one honest seam, two standards." h={250}>
      {items.map((n, i) => {
        const y = 40 + i * 52;
        const o = k(i * 0.9);
        return (
          <g key={n} opacity={o}>
            {i === 0 && (
              <g>
                <rect x={25} y={y} width={60} height={28} rx={4} fill="none" stroke={C.latte} strokeWidth={1.4} />
                <rect x={31} y={y + 15} width={48 * k(0.2)} height={8} rx={2} fill={C.second} />
              </g>
            )}
            {i === 1 && [0, 1, 2].map((j) => <Fan key={j} x1={25} y1={y + j * 14} x2={80} y2={y + 14} k={k(0.9 + j * 0.15)} f={C.second} />)}
            {i === 2 && (
              <g>
                <line x1={25} y1={y + 14} x2={85} y2={y + 14} stroke={C.cherryText} strokeWidth={1.6} strokeDasharray="4 4" />
                <Cross x={55} y={y + 14} k={k(2.0)} />
              </g>
            )}
            {i === 3 && (
              <g>
                <rect x={25} y={y + 4} width={20} height={20} rx={3} fill="none" stroke={C.latte} strokeWidth={1.4} />
                <rect x={65} y={y + 4} width={20} height={20} rx={3} fill="none" stroke={C.latte} strokeWidth={1.4} />
                <line x1={45} y1={y + 14} x2={45 + 20 * k(2.9)} y2={y + 14} stroke={C.focus} strokeWidth={1.6} />
              </g>
            )}
            <T x={110} y={y + 19} s={12} f={C.crema}>
              {n}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

// 10 · Prove it. Top lane: a field of records folds into the aggregate and one row. Bottom: the consumer span holding its 128
// links. Once answered, the data lane is ticked and the links are labelled what they are: the trace's record, incomplete.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const a = answer !== null ? easeOut(seg(s, 0.2, 0.7)) : 0;
  const field = [];
  for (let r = 0; r < 5; r++) for (let c = 0; c < 12; c++) field.push(<rect key={r * 12 + c} x={25 + c * 9} y={34 + r * 9} width={5} height={5} rx={1} fill={C.latte} opacity={k(r * 0.1)} />);
  const links = [];
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 16; c++) links.push(<rect key={r * 16 + c} x={360 + c * 8} y={104 + r * 8} width={4} height={4} rx={1} fill={C.second} opacity={k(1.0 + r * 0.08) * (1 - 0.4 * a)} />);
  return (
    <Svg label="a million in, one row out. 128 links shown." h={250}>
      {field}
      <Req x1={140} x2={200} y={52} k={k(0.5)} />
      <Cell x={200} y={38} w={110} label="aggregate" o={k(0.5)} stroke={a > 0.5 ? C.focus : C.mocha} />
      <Req x1={310} x2={370} y={52} k={k(0.7)} />
      <Cell x={370} y={38} w={90} label="one row" o={k(0.7)} stroke={a > 0.5 ? C.focus : C.mocha} />
      <MiniTick x={475} y={50} k={a} />
      <Cell x={200} y={120} w={140} label="consumer span" o={k(0.9)} />
      {a > 0 && (
        <T x={360} y={190} s={11} f={C.taupe} o={a}>
          the trace, incomplete
        </T>
      )}
      <Verdict answer={answer} text="the data is whole; only the trace is not" y={224} />
    </Svg>
  );
}
