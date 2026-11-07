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

const RECS = ['click · 42', 'click · 7 · label buy-now', 'scroll · depth_pct 80', 'click · 99', 'click', 'click · "unknown"'];
const SHAPE = [C.mocha, C.second, C.focus, C.mocha, C.latte, C.mocha];

// 1 · Hook. Six event cards land, each stroked by its shape; then the one whose button_id is a string pulses red.
export function Hook({ t }: StepCtx) {
  const sh = easeOut(seg(t, 1.6, 2.0));
  const g = 0.5 + 0.5 * Math.sin(t * 6);
  return (
    <Svg label="6 click and scroll events, 4 distinct shapes, one field that changes type." h={225}>
      {RECS.map((r, i) => (
        <Cell
          key={r}
          x={25 + (i % 2) * 285}
          y={52 + Math.floor(i / 2) * 36}
          w={265}
          label={r}
          o={easeOut(seg(t, 0.2 + i * 0.2, 0.5 + i * 0.2))}
          stroke={i === 5 && t > 2.4 ? (g > 0.5 ? C.cherryText : C.mocha) : sh > 0 ? SHAPE[i] : C.mocha}
          f={i === 5 && t > 2.4 ? C.cherryText : C.crema}
        />
      ))}
      <T x={25} y={182} s={13} f={C.crema} o={easeOut(seg(t, 1.8, 2.2))}>
        6 events, 4 shapes
      </T>
      <T x={25} y={210} s={13} f={C.cherryText} o={easeOut(seg(t, 2.6, 3.0))}>
        button_id: an int32, then a string
      </T>
    </Svg>
  );
}

// 2 · Predict. The fixed struct's two columns; six record pips wait to drop in; the answer: three lose data.
export function PredictStruct({ t, answer }: StepCtx) {
  return (
    <Svg label="a fixed struct: event_type string, button_id int32. Can it hold all 6 events?" h={200}>
      <Cell x={25} y={52} w={265} label="event_type: string" o={easeOut(seg(t, 0.1, 0.4))} />
      <Cell x={310} y={52} w={265} label="button_id: int32" o={easeOut(seg(t, 0.3, 0.6))} />
      {Array.from({ length: 6 }, (_, i) => (
        <circle
          key={i}
          cx={60 + i * 95}
          cy={lerp(92, 104, 0.5 + 0.5 * Math.sin(t * 3 + i))}
          r={5}
          fill={SHAPE[i] === C.mocha ? C.latte : SHAPE[i]}
          opacity={easeOut(seg(t, 0.6 + i * 0.1, 0.9 + i * 0.1))}
        />
      ))}
      <AnswerRow y={150} label="holds all 6?" answer={answer} value="no, 3 lose data" k={easeOut(seg(t, 1.3, 1.8))} />
      <Verdict answer={answer} y={190} text="no column, nowhere to go" />
    </Svg>
  );
}

const ST: [string, string, string | null][] = [
  ['click', '42', null],
  ['click', '7', 'label buy-now'],
  ['scroll', 'null', 'depth_pct 80'],
  ['click', '99', null],
  ['click', 'null', null],
  ['click', 'null', '"unknown"'],
];

// 3 · Struct loss. The six records pour into the struct row by row; each value without a column flies out to a dropped
// pile and is crossed; the count of records that lost data lands.
export function RevealStructLoss({ t }: StepCtx) {
  const r = (i: number) => easeOut(seg(t, 0.3 + i * 0.35, 0.6 + i * 0.35));
  return (
    <Svg label="forced into the struct, 3 of 6 records lose a field — one of them silently." h={240}>
      <T x={25} y={42} s={12} f={C.latte}>
        event_type
      </T>
      <T x={165} y={42} s={12} f={C.latte}>
        button_id
      </T>
      <T x={330} y={42} s={12} f={C.cherryText} o={easeOut(seg(t, 0.9, 1.2))}>
        dropped
      </T>
      {ST.map(([e, b, lost], i) => {
        const fly = easeInOut(seg(t, 0.6 + i * 0.35, 1.1 + i * 0.35));
        return (
          <g key={i} opacity={r(i)}>
            <Cell x={25} y={52 + i * 24} w={130} h={20} label={e} />
            <Cell x={165} y={52 + i * 24} w={110} h={20} label={b} f={b === 'null' ? C.latte : C.crema} />
            {lost && (
              <>
                <T x={lerp(290, 330, fly)} y={66 + i * 24} s={12} f={C.cherryText} o={fly}>
                  {lost}
                </T>
                <Cross x={560} y={62 + i * 24} k={easeOut(seg(t, 1.1 + i * 0.35, 1.3 + i * 0.35))} />
              </>
            )}
          </g>
        );
      })}
      <T x={300} y={228} s={13} f={C.cherryText} a="middle" o={easeOut(seg(t, 3.0, 3.4))}>
        3 of 6 lose real data, silently
      </T>
    </Svg>
  );
}

const FIELDS = ['button_id', 'depth_pct', 'event_type', 'label'];
const USES = [[2, 0], [2, 0, 3], [2, 1], [2, 0], [2], [2, 0]];

// 4 · Variant round trip. The metadata dictionary holds each name once; six record values land, each drawing lines up to
// the names it uses; each decodes back and is ticked.
export function RevealVariantRoundTrip({ t }: StepCtx) {
  return (
    <Svg label="a real Variant metadata dictionary and value encoding, round-tripped exactly." h={225}>
      <T x={25} y={42} s={12} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        metadata: 40 bytes, each name once
      </T>
      {FIELDS.map((f, i) => (
        <Cell key={f} x={25 + i * 138} y={52} w={128} h={24} label={f} stroke={C.second} o={easeOut(seg(t, 0.2 + i * 0.12, 0.5 + i * 0.12))} />
      ))}
      {USES.map((u, r) => {
        const k = easeOut(seg(t, 1.0 + r * 0.25, 1.3 + r * 0.25));
        return (
          <g key={r}>
            {u.map((fi) => (
              <line key={fi} x1={65 + r * 92} y1={124} x2={lerp(65 + r * 92, 89 + fi * 138, k)} y2={lerp(124, 76, k)} stroke={C.second} strokeWidth={1} opacity={k > 0 ? 0.5 : 0} />
            ))}
            <Cell x={25 + r * 92} y={124} w={80} h={24} label={`value ${r + 1}`} o={easeOut(seg(t, 0.9 + r * 0.25, 1.2 + r * 0.25))} />
            <MiniTick x={58 + r * 92} y={166} k={easeOut(seg(t, 2.6 + r * 0.15, 2.9 + r * 0.15))} />
          </g>
        );
      })}
      <T x={300} y={210} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.6, 4.0))}>
        every record decodes back exactly
      </T>
    </Svg>
  );
}

// 5 · Predict. The filter chip above six opaque binary values, each pulsing as if it must be opened; the answer: not if
// event_type is shredded.
export function PredictDecodeCost({ t, answer }: StepCtx) {
  const g = (i: number) => 0.5 + 0.5 * Math.sin(t * 5 - i * 0.6);
  return (
    <Svg label="does filtering on event_type mean decoding the whole binary value, every row?" h={200}>
      <Cell x={25} y={46} w={265} label='event_type = "click"' stroke={C.focus} f={C.focus} o={easeOut(seg(t, 0.1, 0.4))} />
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={25 + i * 92} y={88} width={80} height={24} rx={4} fill={C.cocoa} stroke={C.latte} strokeWidth={1 + g(i)} opacity={easeOut(seg(t, 0.4 + i * 0.08, 0.7 + i * 0.08))} />
      ))}
      <AnswerRow y={150} label="decode every value?" answer={answer} value="not if shredded" k={easeOut(seg(t, 1.2, 1.7))} />
      <Verdict answer={answer} y={190} text="a typed column filters directly" />
    </Svg>
  );
}

const SH: [string, string, string, string][] = [
  ['click', '42', '', C.focus],
  ['click', '7', 'label', C.second],
  ['scroll', '', 'depth_pct', C.second],
  ['click', '99', '', C.focus],
  ['click', '', '', C.focus],
  ['click', '', '"unknown"', C.cherryText],
];

// 6 · Shred breakdown. Row by row, each record splits into typed event_type and button_id cells plus a residual: empty for
// three, a real field for two, and the string button_id for one.
export function RevealShredBreakdown({ t }: StepCtx) {
  return (
    <Svg label="shredding event_type and button_id into typed columns, field by field." h={240}>
      <T x={25} y={42} s={12} f={C.latte}>
        event_type
      </T>
      <T x={165} y={42} s={12} f={C.latte}>
        button_id
      </T>
      <T x={300} y={42} s={12} f={C.latte}>
        residual
      </T>
      {SH.map(([e, b, r, f], i) => (
        <g key={i} opacity={easeOut(seg(t, 0.4 + i * 0.4, 0.7 + i * 0.4))}>
          <Cell x={25} y={52 + i * 24} w={130} h={20} label={e} stroke={C.focus} />
          {b ? (
            <Cell x={165} y={52 + i * 24} w={110} h={20} label={b} stroke={C.focus} />
          ) : (
            <rect x={165} y={52 + i * 24} width={110} height={20} rx={4} fill="none" stroke={C.mocha} strokeDasharray="4 3" />
          )}
          {r ? (
            <Cell x={300} y={52 + i * 24} w={180} h={20} label={r} stroke={f} f={f === C.cherryText ? C.cherryText : C.crema} />
          ) : (
            <rect x={300} y={52 + i * 24} width={180} height={20} rx={4} fill="none" stroke={C.mocha} strokeDasharray="4 3" />
          )}
        </g>
      ))}
      <T x={300} y={228} s={13} f={C.crema} a="middle" o={easeOut(seg(t, 3.2, 3.6))}>
        3 fully shredded · 2 residual · 1 fallback
      </T>
    </Svg>
  );
}

// 7 · Typed column only. A scan runs down the typed event_type column and lights the five clicks; the residual column
// beside it stays dim, never touched.
export function RevealTypedColumnOnly({ t }: StepCtx) {
  const sw = easeInOut(seg(t, 0.5, 2.0)) * 6;
  return (
    <Svg label="event_type is a string in all 6 records, so it's always shredded." h={235}>
      <T x={25} y={42} s={12} f={C.latte}>
        event_type, typed
      </T>
      {SH.map(([e], i) => (
        <Cell key={i} x={25} y={52 + i * 24} w={150} h={20} label={e} stroke={sw > i && e === 'click' ? C.focus : C.mocha} f={sw > i && e === 'click' ? C.focus : C.crema} />
      ))}
      <rect x={20} y={50 + Math.min(sw, 5.9) * 24} width={160} height={24} rx={4} fill="none" stroke={C.focus} strokeWidth={2} opacity={sw > 0 && sw < 6 ? 1 : 0} />
      <T x={300} y={42} s={12} f={C.second} o={easeOut(seg(t, 2.4, 2.8))}>
        residual: never touched
      </T>
      {SH.map(([, , r], i) => (
        <rect key={i} x={300} y={52 + i * 24} width={180} height={20} rx={4} fill="none" stroke={C.mocha} strokeDasharray={r ? undefined : '4 3'} opacity={0.5} />
      ))}
      <T x={25} y={218} s={13} f={C.focus} o={easeOut(seg(t, 2.2, 2.6))}>
        5 clicks found, 0 residual bytes read
      </T>
    </Svg>
  );
}

const SIZES: [string, number, string][] = [
  ['JSON strings', 250, C.latte],
  ['unshredded Variant', 155, C.crema],
  ['shredded', 126, C.focus],
];

// 8 · Measured size. Three bars grow in turn to 250, 155 and 126 bytes; a bracket marks the modest last step.
export function RevealMeasuredSize({ t }: StepCtx) {
  return (
    <Svg label="measured size: JSON strings, unshredded Variant, and shredded typed columns." h={230}>
      {SIZES.map(([l, b, f], i) => (
        <g key={l}>
          <T x={25} y={45 + i * 52} s={12} f={C.latte} o={easeOut(seg(t, 0.2 + i * 0.8, 0.5 + i * 0.8))}>
            {`${l}: ${b} bytes`}
          </T>
          <rect x={25} y={53 + i * 52} width={b * 1.8 * easeOut(seg(t, 0.3 + i * 0.8, 1.0 + i * 0.8))} height={16} rx={2} fill={f} opacity={0.75} />
        </g>
      ))}
      <rect x={25 + 126 * 1.8} y={168} width={29 * 1.8 * easeOut(seg(t, 2.8, 3.2))} height={3} fill={C.second} />
      <T x={25} y={210} s={13} f={C.latte} o={easeOut(seg(t, 3.2, 3.6))}>
        smaller, but only modestly, on 6 records
      </T>
    </Svg>
  );
}

// 9 · The real win. The modest size pair shrinks to the side; the filter's zero residual bytes lands large; the lesson.
export function RevealSynthesis({ t }: StepCtx) {
  return (
    <Svg label="shredding's real win here is pushdown, not raw size — and never at the cost of a dropped field." h={220}>
      <Row y={50} label="size" value="126 vs 155 bytes" k={easeOut(seg(t, 0.2, 0.6))} />
      <rect x={25} y={64} width={155 * 1.2 * easeOut(seg(t, 0.4, 0.9))} height={8} rx={2} fill={C.crema} opacity={0.6} />
      <rect x={25} y={76} width={126 * 1.2 * easeOut(seg(t, 0.5, 1.0))} height={8} rx={2} fill={C.focus} opacity={0.8} />
      <Row y={135} label="residual read by the filter" value="0 bytes" big valueColor={C.focus} k={easeOut(seg(t, 1.4, 1.9))} />
      <T x={300} y={195} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 2.6, 3.0))}>
        the win is pushdown and statistics
      </T>
    </Svg>
  );
}

// 10 · Recap. One row per choice, then the rule that keeps shredding safe.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="Variant keeps every record; shredding gets most of a struct's speed back, with no dropped fields." h={240}>
      <Row y={45} label="fixed struct" value="drops what it can't hold" k={easeOut(seg(t, 0.6, 1.0))} />
      <Row y={95} label="Variant" value="keeps all, opaque" k={easeOut(seg(t, 1.6, 2.0))} />
      <Row y={145} label="shredding" value="typed speed + residual" valueColor={C.focus} k={easeOut(seg(t, 2.6, 3.0))} />
      <T x={300} y={210} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.6, 4.0))}>
        shred only what is genuinely typed
      </T>
    </Svg>
  );
}
