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

/** An empty dashed slot. */
function Hole({ x, y, w, h = 28, o = 1, stroke = C.mocha }: { x: number; y: number; w: number; h?: number; o?: number; stroke?: string }) {
  return <rect x={x} y={y} width={w} height={h} rx={4} fill="none" stroke={stroke} strokeWidth={1.5} strokeDasharray="4 3" opacity={o} />;
}

// 0 · Hook. Two sources side by side: integer cents and Berlin local time; decimals and UTC. Summed, two cherry cells
// drop in: revenue off by ×100, time off by an hour.
export function Hook({ t }: StepCtx) {
  const cols: [string, string, string][] = [
    ['legacy', '250000 cents', 'Berlin local time'],
    ['shop', '2500.00', 'UTC'],
  ];
  return (
    <Svg
      label="the legacy system reports revenue as integer cents and local Berlin time; the shop's own system reports decimals and UTC. Summed together, one is off by a hundred, the other by an hour on the clock-change night."
      h={200}
    >
      {cols.map(([n, a, b], c) => {
        const x = 25 + c * 280;
        const k = easeOut(seg(t, 0.2 + c * 0.6, 0.6 + c * 0.6));
        return (
          <g key={n}>
            <T x={x} y={24} s={11} f={C.latte} o={k}>
              {n}
            </T>
            <Cell x={x} y={32} w={250} label={a} o={k} />
            <Cell x={x} y={68} w={250} label={b} o={k} />
          </g>
        );
      })}
      {[0, 1].map((c) => {
        const k = easeOut(seg(t, 2.0 + c * 0.7, 2.5 + c * 0.7));
        return <Cell key={c} x={25 + c * 280} y={lerp(112, 140, k)} w={250} label={c === 0 ? 'revenue: off by ×100' : 'time: off by an hour'} o={k} stroke={C.cherryText} f={C.cherryText} />;
      })}
      <T x={300} y={192} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 3.6, 4.1))}>
        the hour: only on the clock-change night
      </T>
    </Svg>
  );
}

// 1 · Predict. The two problems side by side under one dashed "one fix?" slot; on answer the slot splits into two fixes.
export function Predict({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.2, 0.8)) : 0;
  return (
    <Svg label="does fixing the currency mismatch also fix the timestamp mismatch, or are they two entirely separate problems needing two separate fixes?" h={200}>
      <Cell x={25} y={30} w={250} label="revenue: cents" o={easeOut(seg(t, 0, 0.3))} stroke={C.cherryText} />
      <Cell x={305} y={30} w={250} label="time: no zone" o={easeOut(seg(t, 0.2, 0.5))} stroke={C.cherryText} />
      {v > 0 ? (
        <g>
          <Cell x={lerp(150, 25, v)} y={90} w={250} label="a scale factor" o={v} stroke={C.focus} />
          <Cell x={lerp(180, 305, v)} y={90} w={250} label="a time zone" o={v} stroke={C.focus} />
        </g>
      ) : (
        <g opacity={easeOut(seg(t, 0.6, 0.9))}>
          <Hole x={150} y={90} w={280} />
          <T x={290} y={109} s={11} f={C.latte} a="middle">
            one fix?
          </T>
        </g>
      )}
      <AnswerRow y={178} label="one fix for both?" answer={answer} value="no, two fixes" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 2 · Schema matching. Three columns on each side; match lines draw in, thick for strong evidence, thin for weak; the
// result settles as a written transformation.
export function RevealSchemaMatching({ t }: StepCtx) {
  const rows: [string, string, number, string][] = [
    ['cust_nm', 'customer_name', 4, 'name + type + values'],
    ['amt', 'revenue', 2.5, 'type + values'],
    ['ts', 'event_time', 1.2, 'values'],
  ];
  return (
    <Svg label="two schemas get matched by name, type and sample-value evidence; thicker match lines mean stronger evidence, and the result is written as a transformation." h={200}>
      {rows.map(([a, b, w, ev], i) => {
        const y = 24 + i * 42;
        const k = easeOut(seg(t, 0.9 + i * 0.6, 1.4 + i * 0.6));
        return (
          <g key={a}>
            <Cell x={25} y={y} w={130} label={a} o={easeOut(seg(t, 0.1 + i * 0.1, 0.4 + i * 0.1))} />
            <Cell x={420} y={y} w={130} label={b} o={easeOut(seg(t, 0.3 + i * 0.1, 0.6 + i * 0.1))} />
            <line x1={155} y1={y + 14} x2={lerp(155, 420, k)} y2={y + 14} stroke={C.focus} strokeWidth={w} />
            <T x={287} y={y + 6} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 1.3 + i * 0.6, 1.6 + i * 0.6))}>
              {ev}
            </T>
          </g>
        );
      })}
      <Cell x={25} y={lerp(150, 160, easeOut(seg(t, 3.4, 3.9)))} w={525} label="written down as a transformation" o={easeOut(seg(t, 3.4, 3.9))} stroke={C.focus} />
    </Svg>
  );
}

// 3 · Crosswalk. Two mapping rows for A1, each over its own validity window on a timeline split at 2026-06-01; order 1
// rises to the old row, order 2 to the new.
export function RevealCrosswalk({ t }: StepCtx) {
  const j1 = easeOut(seg(t, 2.2, 2.7));
  const j2 = easeOut(seg(t, 3.0, 3.5));
  return (
    <Svg label="a crosswalk table maps one system's own code to another's, carrying a validity window; a fact joins to the row in force at its own event time." h={220}>
      <Cell x={25} y={40} w={255} label="A1 → electronics" o={easeOut(seg(t, 0.1, 0.4))} stroke={j1 >= 1 ? C.focus : C.mocha} />
      <Cell x={295} y={40} w={255} label="A1 → consumer-electronics" o={easeOut(seg(t, 0.4, 0.7))} stroke={j2 >= 1 ? C.second : C.mocha} />
      <rect x={25} y={128} width={255 * easeOut(seg(t, 0.8, 1.3))} height={6} rx={2} fill={C.latte} />
      <rect x={295} y={128} width={255 * easeOut(seg(t, 1.1, 1.6))} height={6} rx={2} fill={C.second} />
      <T x={287} y={112} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 1.3, 1.7))}>
        2026-06-01
      </T>
      <circle cx={150} cy={131} r={6} fill={C.focus} opacity={easeOut(seg(t, 1.8, 2.1))} />
      <circle cx={420} cy={131} r={6} fill={C.focus} opacity={easeOut(seg(t, 2.6, 2.9))} />
      <line x1={150} y1={124} x2={150} y2={lerp(124, 70, j1)} stroke={C.focus} strokeWidth={1.5} />
      <line x1={420} y1={124} x2={420} y2={lerp(124, 70, j2)} stroke={C.second} strokeWidth={1.5} />
      <T x={150} y={160} s={11} f={C.crema} a="middle" o={easeOut(seg(t, 1.8, 2.1))}>
        order 1, Mar 15
      </T>
      <T x={420} y={160} s={11} f={C.crema} a="middle" o={easeOut(seg(t, 2.6, 2.9))}>
        order 2, Sep 15
      </T>
      <T x={300} y={205} s={12} f={C.latte} a="middle" o={easeOut(seg(t, 3.8, 4.3))}>
        joined to the row in force at event time
      </T>
    </Svg>
  );
}

// 4 · Units. Free text: two sources both write "ton", and the lines run to two different meanings, in cherry. A unit
// standard: one string, one line, one checkable meaning.
export function RevealUnits({ t }: StepCtx) {
  const l1 = easeOut(seg(t, 0.6, 1.1));
  const l2 = easeOut(seg(t, 1.0, 1.5));
  const l3 = easeOut(seg(t, 3.0, 3.5));
  return (
    <Svg label="a named unit standard maps every unit string to exactly one meaning a machine can check, rather than leaving units as free text." h={200}>
      <T x={25} y={22} s={11} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        free text
      </T>
      <Cell x={25} y={30} w={110} label="ton" o={easeOut(seg(t, 0.1, 0.4))} />
      <Cell x={25} y={66} w={110} label="ton" o={easeOut(seg(t, 0.3, 0.6))} />
      <line x1={135} y1={44} x2={lerp(135, 380, l1)} y2={44} stroke={C.mocha} strokeWidth={1.5} />
      <line x1={135} y1={80} x2={lerp(135, 380, l2)} y2={80} stroke={C.cherryText} strokeWidth={1.5} />
      <Cell x={380} y={30} w={170} label="metric ton" o={l1} />
      <Cell x={380} y={66} w={170} label="short ton" o={l2} stroke={C.cherryText} />
      <T x={25} y={118} s={11} f={C.cherryText} o={easeOut(seg(t, 1.7, 2.1))}>
        same text, two meanings
      </T>
      <T x={25} y={150} s={11} f={C.latte} o={easeOut(seg(t, 2.6, 2.9))}>
        unit standard
      </T>
      <Cell x={25} y={158} w={110} label="t" o={easeOut(seg(t, 2.7, 3.0))} stroke={C.focus} />
      <line x1={135} y1={172} x2={lerp(135, 380, l3)} y2={172} stroke={C.focus} strokeWidth={1.5} />
      <Cell x={380} y={158} w={170} label="metric ton" o={l3} stroke={C.focus} />
      <MiniTick x={555} y={170} k={easeOut(seg(t, 3.6, 4.0))} />
    </Svg>
  );
}

// 5 · Currency exponent. Correct: 250000 cents ÷ 100 = 2500.00 EUR, then × 1.08 to USD. The bug: × 1.08 straight on
// the cents, landing ×100 too high, in cherry.
export function RevealCurrencyExponent({ t }: StepCtx) {
  return (
    <Svg label="each currency has its own minor-unit exponent; skipping it and converting an integer-cents figure as if it were already a decimal is off by exactly that scale." h={220}>
      <T x={25} y={14} s={11} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        correct: scale first, then the dated rate
      </T>
      <Cell x={25} y={36} w={150} label="250000 cents" o={easeOut(seg(t, 0.1, 0.4))} />
      <Req x1={185} x2={245} y={50} k={easeOut(seg(t, 0.5, 1.0))} label="÷ 100" />
      <Cell x={255} y={36} w={130} label="2500.00 EUR" o={easeOut(seg(t, 0.9, 1.2))} />
      <Req x1={395} x2={445} y={50} k={easeOut(seg(t, 1.3, 1.8))} label="× 1.08" />
      <Cell x={455} y={36} w={95} label="USD" o={easeOut(seg(t, 1.7, 2.0))} stroke={C.focus} />
      <T x={25} y={116} s={11} f={C.cherryText} o={easeOut(seg(t, 2.3, 2.6))}>
        the bug: no scaling
      </T>
      <Cell x={25} y={126} w={150} label="250000 cents" o={easeOut(seg(t, 2.4, 2.7))} />
      <Req x1={185} x2={445} y={140} k={easeOut(seg(t, 2.8, 3.4))} label="× 1.08" f={C.cherryText} />
      <Cell x={455} y={lerp(118, 126, easeOut(seg(t, 3.3, 3.7)))} w={95} label="USD ×100" o={easeOut(seg(t, 3.3, 3.7))} stroke={C.cherryText} f={C.cherryText} />
      <T x={25} y={200} s={11} f={C.latte} o={easeOut(seg(t, 3.9, 4.3))}>
        EUR exponent 2; rate dated 2026-05-01 for a May 15 order
      </T>
    </Svg>
  );
}

// 6 · Time zone. 10:30 local in Berlin. The day before the transition, both conversions land on one instant; on the
// transition day, the fixed offset lands an hour away, in cherry.
export function RevealTimezone({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 1.2));
  const b = easeOut(seg(t, 1.8, 2.8));
  const gap = easeOut(seg(t, 2.9, 3.4));
  return (
    <Svg label="storing a UTC instant plus its original zone survives a real daylight-saving transition that a fixed-offset conversion gets wrong by exactly an hour." h={200}>
      <T x={25} y={22} s={11} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        10:30 local, Europe/Berlin, as UTC
      </T>
      <T x={25} y={58} s={12} f={C.crema} o={easeOut(seg(t, 0.2, 0.5))}>
        day before
      </T>
      <line x1={180} y1={54} x2={550} y2={54} stroke={C.mocha} strokeWidth={1.2} opacity={easeOut(seg(t, 0.2, 0.5))} />
      <circle cx={lerp(190, 360, a)} cy={54} r={7} fill={C.focus} opacity={a} />
      <circle cx={lerp(190, 360, a)} cy={54} r={11} fill="none" stroke={C.cherryText} strokeWidth={1.5} opacity={a} />
      <T x={380} y={40} s={11} f={C.latte} o={easeOut(seg(t, 1.2, 1.5))}>
        both agree
      </T>
      <T x={25} y={118} s={12} f={C.crema} o={easeOut(seg(t, 1.5, 1.8))}>
        transition day
      </T>
      <line x1={180} y1={114} x2={550} y2={114} stroke={C.mocha} strokeWidth={1.2} opacity={easeOut(seg(t, 1.5, 1.8))} />
      <circle cx={lerp(190, 320, b)} cy={114} r={7} fill={C.focus} opacity={b} />
      <circle cx={lerp(190, 420, b)} cy={114} r={11} fill="none" stroke={C.cherryText} strokeWidth={1.5} opacity={b} />
      <path d={`M320 134 v6 h${100 * gap} v-6`} fill="none" stroke={C.cherryText} strokeWidth={1.5} />
      <T x={370} y={158} s={11} f={C.cherryText} a="middle" o={gap}>
        3600 s apart
      </T>
      <circle cx={190} cy={185} r={5} fill={C.focus} opacity={easeOut(seg(t, 3.6, 3.9))} />
      <T x={202} y={189} s={11} f={C.latte} o={easeOut(seg(t, 3.6, 3.9))}>
        zone-aware
      </T>
      <circle cx={340} cy={185} r={7} fill="none" stroke={C.cherryText} strokeWidth={1.5} opacity={easeOut(seg(t, 3.8, 4.1))} />
      <T x={354} y={189} s={11} f={C.latte} o={easeOut(seg(t, 3.8, 4.1))}>
        fixed offset
      </T>
    </Svg>
  );
}

// 7 · Versioned tests. The mapping rows, versioned and owned; the test passes with no orphans. Order 3 arrives with
// code C3; the test turns cherry and names it, and the UNKNOWN bucket is struck.
export function RevealVersionedTests({ t }: StepCtx) {
  const bad = t >= 2.9;
  return (
    <Svg label="the mapping lives as versioned, owned, tested data; a brand-new source code with no mapping fails a test immediately, instead of quietly becoming unknown." h={220}>
      <Cell x={25} y={30} w={200} label="A1 → electronics" o={easeOut(seg(t, 0.1, 0.4))} />
      <Cell x={25} y={66} w={200} label="B2 → furniture" o={easeOut(seg(t, 0.3, 0.6))} />
      <T x={25} y={116} s={11} f={C.second} o={easeOut(seg(t, 0.7, 1.0))}>
        versioned, owned, tested
      </T>
      <Req x1={235} x2={370} y={62} k={easeOut(seg(t, 1.1, 1.6))} label="anti-join" />
      <Cell x={380} y={48} w={170} label={bad ? 'fails: C3' : 'orphans: none'} o={easeOut(seg(t, 1.5, 1.8))} stroke={bad ? C.cherryText : C.focus} f={bad ? C.cherryText : C.crema} />
      <Cell x={25} y={lerp(132, 140, easeOut(seg(t, 2.2, 2.6)))} w={200} label="order 3: C3" o={easeOut(seg(t, 2.2, 2.6))} stroke={C.cherryText} />
      <Hole x={380} y={140} w={170} o={easeOut(seg(t, 3.3, 3.6))} />
      <T x={465} y={159} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 3.3, 3.6))}>
        UNKNOWN
      </T>
      <Cross x={530} y={154} k={easeOut(seg(t, 3.7, 4.0))} />
      <T x={380} y={200} s={11} f={C.latte} o={easeOut(seg(t, 3.9, 4.3))}>
        a named failure instead
      </T>
    </Svg>
  );
}

// 8 · Recap. Five lines, one by one; the idea that ties them outlined.
export function Recap({ t }: StepCtx) {
  const rows = ['match columns by evidence', 'a crosswalk with validity windows', 'units, currencies, zones: explicit', 'the mapping: versioned, owned, tested', 'meaning, reconciled like identity'];
  return (
    <Svg label="matching by evidence, a slowly changing crosswalk, units and currencies reconciled explicitly, and the mapping itself owned as tested data." h={260}>
      {rows.map((r, i) => {
        const k = easeOut(seg(t, 0.2 + i * 0.75, 0.6 + i * 0.75));
        return <Cell key={i} x={25} y={lerp(20, 28, k) + i * 46} w={530} label={r} o={k} stroke={i === 4 ? C.focus : C.mocha} />;
      })}
    </Svg>
  );
}

// 9 · Prove it. A new code flows into the mapping test; on answer the test turns cherry and names it, and the UNKNOWN
// slot is struck.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.2, 0.8)) : 0;
  return (
    <Svg label="a new legacy order category code appears for the first time, with nobody having added it to the crosswalk yet. What happens the moment that row is loaded?" h={200}>
      <Cell x={25} y={40} w={150} label="new code" o={easeOut(seg(t, 0, 0.3))} stroke={C.second} />
      <Req x1={185} x2={370} y={54} k={easeOut(seg(t, 0.3, 0.8))} label="load" />
      <Cell x={380} y={40} w={170} label={v > 0 ? 'fails, names it' : 'mapping test'} o={easeOut(seg(t, 0.6, 0.9))} stroke={v > 0 ? C.cherryText : C.mocha} f={v > 0 ? C.cherryText : C.crema} />
      <Hole x={380} y={95} w={170} o={easeOut(seg(t, 0.9, 1.2))} />
      <T x={465} y={114} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 0.9, 1.2))}>
        UNKNOWN
      </T>
      <Cross x={530} y={109} k={v} />
      <AnswerRow y={178} label="on load" answer={answer} value="the test fails" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}
