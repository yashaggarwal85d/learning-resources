import { useEffect, useState } from 'react';
import { Bar, C, Draw, Plot, Reticle, Svg, T } from '../../../../../reels/kit';
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

const RECS = ['{"v": 1}', '{"v": "not a number"}', '{"v": 3}'];

// 0 · Hook. The existing type chips sit on a shelf; a new one, VARIANT, slides in beside them in pale blue.
export function Hook({ t }: StepCtx) {
  const m = easeOut(seg(t, 1.4, 2.2));
  return (
    <Svg label="ANSI mode changed how existing types behave. This type never existed before." h={200}>
      <T x={25} y={30} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        types that already existed
      </T>
      {['INT', 'STRING', 'STRUCT'].map((ty, i) => (
        <Cell key={ty} x={25 + i * 110} y={44} w={96} h={32} label={ty} o={easeOut(seg(t, 0.2 + i * 0.2, 0.5 + i * 0.2))} />
      ))}
      <Cell x={lerp(465, 385, m)} y={44} w={110} h={32} label="VARIANT" stroke={C.second} o={m} />
      <T x={385} y={108} s={11} f={C.second} o={easeOut(seg(t, 2.2, 2.6))}>
        new
      </T>
      <T x={25} y={170} s={13} f={C.focus} o={easeOut(seg(t, 2.8, 3.2))}>
        for data whose shape isn't fixed
      </T>
    </Svg>
  );
}

// 1 · Two bad options. One record, two paths: kept as plain text, the engine sees an opaque grey box; forced into a
// fixed shape, a mismatched record breaks a slot, crossed in cherry.
export function RevealTwoBadOptions({ t }: StepCtx) {
  return (
    <Svg label="semi-structured data used to force a choice between two bad options." h={230}>
      <T x={25} y={30} s={12} f={C.crema} o={easeOut(seg(t, 0.1, 0.4))}>
        plain text
      </T>
      <rect x={25} y={44} width={240} height={40} rx={4} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.4} opacity={easeOut(seg(t, 0.4, 0.8))} />
      <T x={40} y={69} s={11} f={C.latte} o={easeOut(seg(t, 0.4, 0.8))}>
        {RECS[1]}
      </T>
      <T x={25} y={110} s={11} f={C.latte} o={easeOut(seg(t, 1.0, 1.4))}>
        the engine understands none of it
      </T>
      <T x={315} y={30} s={12} f={C.crema} o={easeOut(seg(t, 1.8, 2.1))}>
        a fixed shape
      </T>
      {['v: INT', 'w: STRING'].map((s, i) => (
        <Cell key={s} x={315} y={44 + i * 44} w={180} h={32} label={s} stroke={i === 0 && t > 3.0 ? C.cherryText : C.mocha} o={easeOut(seg(t, 2.0 + i * 0.2, 2.3 + i * 0.2))} />
      ))}
      <Cross x={520} y={60} k={easeOut(seg(t, 3.0, 3.3))} />
      <T x={315} y={160} s={11} f={C.cherryText} o={easeOut(seg(t, 3.2, 3.6))}>
        one record disagrees: it breaks
      </T>
    </Svg>
  );
}

/** A JSON-string column at (x, y): three text lines; a reading cursor sweeps each from its start when `scan` runs. */
function StrCol({ x, y, scan = -1 }: { x: number; y: number; scan?: number }) {
  return (
    <g>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={x} y={y + i * 34} width={220} height={26} rx={3} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.2} />
          {scan >= 0 && <rect x={x + 4} y={y + i * 34 + 21} width={212 * clamp(scan * 3 - i, 0, 1)} height={3} fill={C.cherryText} />}
        </g>
      ))}
    </g>
  );
}

/** A VARIANT column at (x, y): three rows of binary blocks; a pointer jumps straight to the field when `hit` is on. */
function VarCol({ x, y, hit = 0 }: { x: number; y: number; hit?: number }) {
  return (
    <g>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          {[0, 1, 2, 3, 4].map((b) => (
            <rect key={b} x={x + b * 44} y={y + i * 34} width={40} height={26} rx={2} fill={C.cocoa} stroke={b === 2 && hit > 0.5 ? C.second : C.mocha} strokeWidth={b === 2 && hit > 0.5 ? 2 : 1.2} />
          ))}
        </g>
      ))}
    </g>
  );
}

// 2 · Predict. A JSON-string column and a VARIANT column, side by side; the same field pulled out of each, over and over.
export function PredictExtractSpeed({ t, answer }: StepCtx) {
  return (
    <Svg label="extracting one field, over and over. JSON string, or VARIANT: which is faster?" h={230}>
      <T x={25} y={24} s={11} f={C.latte}>
        JSON string
      </T>
      <StrCol x={25} y={34} scan={seg(t, 0.4, 1.6)} />
      <T x={330} y={24} s={11} f={C.second}>
        VARIANT
      </T>
      <VarCol x={330} y={34} hit={seg(t, 0.6, 0.8)} />
      <T x={300} y={164} s={15} f={C.focus} a="middle" o={answer === null ? easeOut(seg(t, 1.6, 2.0)) : 0}>
        which pulls the field faster?
      </T>
      <Verdict answer={answer} y={205} text="VARIANT: parsed once, already" />
    </Svg>
  );
}

// 3 · Measured. The steady-state runs as bars: every JSON-string run longer than every VARIANT run.
export function RevealVariantFaster({ t }: StepCtx) {
  return (
    <Svg label="measured: the string column is slower. VARIANT was parsed once already." h={220}>
      <T x={25} y={26} s={11} f={C.latte}>
        JSON string, each run
      </T>
      {[0, 1, 2].map((i) => (
        <rect key={i} x={25} y={36 + i * 22} width={[420, 400, 410][i] * easeOut(seg(t, 0.3 + i * 0.3, 1.1 + i * 0.3))} height={14} fill={C.latte} />
      ))}
      <T x={25} y={128} s={11} f={C.second} o={easeOut(seg(t, 1.8, 2.1))}>
        VARIANT, each run
      </T>
      {[0, 1, 2].map((i) => (
        <rect key={i} x={25} y={138 + i * 22} width={[170, 160, 175][i] * easeOut(seg(t, 2.1 + i * 0.3, 2.7 + i * 0.3))} height={14} fill={C.second} />
      ))}
    </Svg>
  );
}

// 4 · Self-describing. A text cursor crawls a JSON string from its first character; beside it, a VARIANT value's
// header and the column's shared dictionary let a pointer jump straight to the field.
export function ElaborateSelfDescribing({ t }: StepCtx) {
  const c = easeInOut(seg(t, 0.4, 2.0));
  const j = easeOut(seg(t, 3.0, 3.6));
  return (
    <Svg label="VARIANT is self-describing binary, not text -- extraction is pointer arithmetic." h={230}>
      <T x={25} y={26} s={11} f={C.latte}>
        text: read from the start
      </T>
      <rect x={25} y={36} width={540} height={28} rx={3} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.2} />
      <rect x={30} y={58} width={530 * c} height={3} fill={C.cherryText} />
      <T x={25} y={106} s={11} f={C.second} o={easeOut(seg(t, 2.0, 2.3))}>
        VARIANT: a header, a shared dictionary, the values
      </T>
      <Cell x={25} y={118} w={70} h={30} label="header" stroke={C.second} o={easeOut(seg(t, 2.2, 2.5))} />
      <Cell x={105} y={118} w={150} h={30} label="names, once" stroke={C.second} o={easeOut(seg(t, 2.4, 2.7))} />
      {[0, 1, 2].map((b) => (
        <rect
          key={b}
          x={275 + b * 95}
          y={118}
          width={85}
          height={30}
          rx={3}
          fill={C.cocoa}
          stroke={b === 1 && j > 0.9 ? C.second : C.mocha}
          strokeWidth={b === 1 && j > 0.9 ? 2 : 1.2}
          opacity={easeOut(seg(t, 2.6, 2.9))}
        />
      ))}
      <path d={`M180 152 Q 280 ${200} ${lerp(180, 412, j)} ${lerp(152, 152, j)}`} fill="none" stroke={C.second} strokeWidth={1.6} opacity={j > 0 ? 1 : 0} />
      <T x={25} y={205} s={12} f={C.focus} o={easeOut(seg(t, 3.7, 4.1))}>
        follow a pointer, not the text
      </T>
    </Svg>
  );
}

// 5 · Predict. Three records, the middle one's value a string; a fixed shape declares v as INT. Every record through?
export function PredictStructDrift({ t, answer }: StepCtx) {
  return (
    <Svg label="a field whose type varies row to row, cast into a fixed struct. Every row survives?" h={230}>
      {RECS.map((r, i) => (
        <T key={r} x={25} y={40 + i * 34} s={12} f={i === 1 ? C.focus : C.crema} o={easeOut(seg(t, 0.2 + i * 0.2, 0.5 + i * 0.2))}>
          {r}
        </T>
      ))}
      <Cell x={380} y={58} w={160} h={34} label="v: INT" o={easeOut(seg(t, 0.8, 1.1))} />
      <Req x1={300} x2={375} y={75} k={easeOut(seg(t, 1.0, 1.4))} f={C.latte} />
      <Verdict answer={answer} y={205} text="one vanishes" />
    </Svg>
  );
}

// 6 · Measured. The fixed-shape column reads 1, NULL in cherry, 3; the VARIANT column beside it keeps every value.
export function RevealStructDrops({ t }: StepCtx) {
  const a = ['1', 'NULL', '3'];
  const b = ['"1"', '"not a number"', '"3"'];
  return (
    <Svg label="measured: the mismatched row quietly becomes NULL. VARIANT keeps every value." h={230}>
      <T x={25} y={26} s={11} f={C.latte}>
        as v: INT
      </T>
      {a.map((v, i) => (
        <T key={i} x={25} y={66 + i * 40} s={15} f={i === 1 ? C.cherryText : C.crema} o={easeOut(seg(t, 0.3 + i * 0.4, 0.6 + i * 0.4))}>
          {v}
        </T>
      ))}
      <T x={300} y={26} s={11} f={C.second} o={easeOut(seg(t, 1.8, 2.1))}>
        as VARIANT
      </T>
      {b.map((v, i) => (
        <T key={i} x={300} y={66 + i * 40} s={15} f={C.second} o={easeOut(seg(t, 2.0 + i * 0.4, 2.3 + i * 0.4))}>
          {v}
        </T>
      ))}
      <MiniTick x={540} y={140} k={easeOut(seg(t, 3.4, 3.8))} f={C.second} />
    </Svg>
  );
}

// 7 · One type, chosen early. A schema card "v: INT" lands at the left of a time line before any record; the records
// arrive later: 1 ticks, the string is crossed and thrown away, 3 ticks.
export function ElaborateOneTypeChosen({ t }: StepCtx) {
  const vals = ['1', '"not a number"', '3'];
  return (
    <Svg label="a struct picks one type per field before any data arrives." h={220}>
      <line x1={25} y1={120} x2={565} y2={120} stroke={C.latte} strokeWidth={1.4} />
      <Cell x={25} y={70} w={120} h={32} label="v: INT" stroke={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
      <T x={25} y={145} s={11} f={C.latte} o={easeOut(seg(t, 0.5, 0.9))}>
        decided first
      </T>
      {vals.map((v, i) => {
        const k = easeOut(seg(t, 1.2 + i * 0.8, 1.6 + i * 0.8));
        const x = [190, 290, 470][i];
        return (
          <g key={i}>
            <T x={x} y={lerp(60, 100, k)} s={12} f={i === 1 ? C.cherryText : C.crema} o={k}>
              {v}
            </T>
            {i === 1 ? <Cross x={x + 60} y={150} k={easeOut(seg(t, 2.3, 2.6))} /> : <MiniTick x={x} y={150} k={easeOut(seg(t, 1.7 + i * 0.8, 2.0 + i * 0.8))} />}
          </g>
        );
      })}
      <T x={25} y={200} s={12} f={C.focus} o={easeOut(seg(t, 3.8, 4.2))}>
        data disagrees later: something is thrown away
      </T>
    </Svg>
  );
}

// 8 · Shredding, sourced. A VARIANT row; its one hot field slides out into its own fast column; the rest stays tolerant.
export function RevealShreddingSourced({ t }: StepCtx) {
  const m = easeInOut(seg(t, 1.0, 2.0));
  return (
    <Svg label="shredding buys the struct's own speed back, for the fields that earn it -- a later release." h={250}>
      <T x={25} y={26} s={11} f={C.second}>
        VARIANT
      </T>
      {[0, 1, 2, 3, 4].map((b) => (
        <rect
          key={b}
          x={b === 1 ? lerp(25 + b * 64, 410, m) : 25 + b * 64}
          y={b === 1 ? lerp(36, 120, m) : 36}
          width={56}
          height={30}
          rx={3}
          fill={C.cocoa}
          stroke={b === 1 ? C.focus : C.mocha}
          strokeWidth={b === 1 ? 2 : 1.2}
        />
      ))}
      <rect x={400} y={110} width={150} height={50} rx={4} fill="none" stroke={C.focus} strokeWidth={1.4} strokeDasharray="5 4" opacity={easeOut(seg(t, 0.6, 1.0))} />
      <T x={550} y={182} s={11} f={C.focus} a="end" o={easeOut(seg(t, 2.0, 2.4))}>
        the hot field, its own column
      </T>
      <T x={25} y={110} s={11} f={C.latte} o={easeOut(seg(t, 2.4, 2.8))}>
        the rest: as tolerant as before
      </T>
      <T x={25} y={232} s={11} f={C.latte} o={easeOut(seg(t, 3.4, 3.8))}>
        a later Spark release: named from its docs, not run here
      </T>
    </Svg>
  );
}

// 9 · Recap. Three ways to hold it, each with where it pays: a read cursor sweeping again and again, two fields falling
// out of a fixed shape, one encoding pass that keeps every field.
export function Recap({ t }: StepCtx) {
  const rows: [string, string, string][] = [
    ['plain text', 'pays on every read', C.latte],
    ['a fixed shape', 'risks what it drops', C.cherryText],
    ['VARIANT', 'pays once, keeps all', C.second],
  ];
  const chips = [0, 1, 2, 3, 4];
  // plain text: every read sweeps the whole string again
  const reading = t > 0.7;
  const sweep = ((t - 0.7) / 0.7) % 1;
  // a fixed shape: the two fields it has no column for fall away
  const drop = easeInOut(seg(t, 1.7, 2.3));
  // VARIANT: encoded once (one pass), then every field stays
  const enc = easeOut(seg(t, 2.6, 3.1));
  return (
    <Svg label="one type, three shapes of cost: a string's re-parsing, a struct's early commitment, VARIANT's binary." h={250}>
      {rows.map(([a, b, f], i) => {
        const k = easeOut(seg(t, 0.3 + i * 0.9, 0.6 + i * 0.9));
        const p = easeOut(seg(t, 0.6 + i * 0.9, 0.9 + i * 0.9));
        return (
          <g key={a}>
            <g opacity={k} transform={`translate(${((1 - k) * -20).toFixed(1)} 0)`}>
              <T x={25} y={50 + i * 60} s={13} f={C.crema}>
                {a}
              </T>
            </g>
            <g opacity={p} transform={`translate(${((1 - p) * 20).toFixed(1)} 0)`}>
              <T x={575} y={50 + i * 60} s={13} f={f} a="end">
                {b}
              </T>
            </g>
          </g>
        );
      })}
      <g opacity={easeOut(seg(t, 0.3, 0.6))}>
        <rect x={190} y={34} width={170} height={22} rx={3} fill="none" stroke={C.line} />
        {reading && <rect x={192 + sweep * 160} y={36} width={6} height={18} rx={1} fill={C.latte} />}
      </g>
      <g opacity={easeOut(seg(t, 1.2, 1.5))}>
        {chips.map((j) => {
          const falls = j >= 3;
          return (
            <rect
              key={j}
              x={190 + j * 34}
              y={94 + (falls ? drop * 40 : 0)}
              width={28}
              height={22}
              rx={3}
              fill={C.cocoa}
              stroke={falls && drop > 0 ? C.cherryText : C.mocha}
              opacity={falls ? 1 - drop : 1}
            />
          );
        })}
      </g>
      <g opacity={easeOut(seg(t, 2.1, 2.4))}>
        {chips.map((j) => (
          <rect key={j} x={190 + j * 34} y={154} width={28} height={22} rx={3} fill={C.cocoa} stroke={enc > j / 5 ? C.second : C.mocha} strokeWidth={1.4} />
        ))}
      </g>
      <Draw pts={[[190, 182], [354, 182]]} t={t} from={2.6} to={3.1} stroke={C.second} w={2} />
      <Reticle x={300} y={162} w={566} h={44} t={t} at={3.6} />
    </Svg>
  );
}
