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

const THREE = ['deletion vectors', 'row lineage', 'Variant'];
const MORE = ['geometry, geography', 'nanosecond timestamps', 'the unknown type', 'default values', 'multi-argument transforms', 'encryption keys'];
/** Slot positions for the v3 box: three built features on the top row, the rest below in two columns. */
const slot = (i: number) => (i < 3 ? { x: 35 + i * 180, y: 45, w: 170 } : { x: 35 + ((i - 3) % 2) * 270, y: 95 + Math.floor((i - 3) / 2) * 38, w: 260 });

// 1 · Hook. The last topic's two delete files, each tagged v2; then a large v3 frame opens around a row of this chapter's
// topic pips, several of them lit.
export function Hook({ t }: StepCtx) {
  const v = easeOut(seg(t, 1.6, 2.2));
  return (
    <Svg label="both delete mechanisms from the last topic are v2 features -- v3 is a whole version bump." h={200}>
      <Cell x={25} y={30} w={180} h={28} label="position delete: v2" o={easeOut(seg(t, 0.1, 0.4))} />
      <Cell x={25} y={70} w={180} h={28} label="equality delete: v2" o={easeOut(seg(t, 0.4, 0.7))} />
      <rect x={250} y={25} width={325} height={110} rx={6} fill="none" stroke={C.second} strokeWidth={2} opacity={v} />
      <T x={262} y={48} s={16} f={C.second} o={v}>
        v3
      </T>
      {Array.from({ length: 20 }, (_, i) => (
        <circle
          key={i}
          cx={275 + (i % 10) * 29}
          cy={80 + Math.floor(i / 10) * 28}
          r={7}
          fill={[5, 13, 19].includes(i) && t > 2.8 ? C.second : C.cocoa}
          stroke={C.latte}
          strokeWidth={1.2}
          opacity={easeOut(seg(t, 2.0 + i * 0.03, 2.2 + i * 0.03))}
        />
      ))}
      <T x={25} y={180} s={13} f={C.crema} o={easeOut(seg(t, 3.4, 3.8))}>
        this chapter already met most of it, piece by piece
      </T>
    </Svg>
  );
}

// 2 · Predict. Three features from three earlier topics, set far apart; the answer: one version, v3.
export function PredictWhatTiesThemTogether({ t, answer }: StepCtx) {
  return (
    <Svg label="deletion vectors, row lineage, and variant were each taught separately. what ties them together?" h={200}>
      {THREE.map((n, i) => (
        <Cell key={n} x={25 + i * 190} y={40 + (i % 2) * 30} w={170} h={28} label={n} o={easeOut(seg(t, 0.2 + i * 0.4, 0.5 + i * 0.4))} />
      ))}
      <T x={300} y={128} s={14} f={C.second} a="middle" o={easeOut(seg(t, 1.8, 2.2))}>
        three separate tricks?
      </T>
      <AnswerRow y={160} label="what ties them" answer={answer} value="one version: v3" k={easeOut(seg(t, 2.3, 2.8))} />
    </Svg>
  );
}

// 3 · One version bump. A v3 frame opens; the three features slide into its top row, each ticked as built in this chapter;
// dashed slots below wait for more.
export function RevealOneVersionBump({ t }: StepCtx) {
  return (
    <Svg label="they're all one coherent version bump: v3." h={230}>
      <rect x={25} y={20} width={550} height={180} rx={6} fill="none" stroke={C.second} strokeWidth={2} opacity={easeOut(seg(t, 0.1, 0.5))} />
      <T x={37} y={38} s={13} f={C.second} o={easeOut(seg(t, 0.1, 0.5))}>
        v3
      </T>
      {THREE.map((n, i) => {
        const s = slot(i);
        const k = easeOut(seg(t, 0.7 + i * 0.5, 1.2 + i * 0.5));
        return (
          <g key={n}>
            <Cell x={s.x} y={lerp(s.y + 20, s.y, k)} w={s.w} h={28} label={n} stroke={C.focus} o={k} />
          </g>
        );
      })}
      {THREE.map((n, i) => (
        <MiniTick key={'k' + n} x={slot(i).x + slot(i).w - 22} y={slot(i).y - 13} k={easeOut(seg(t, 1.3 + i * 0.5, 1.6 + i * 0.5))} />
      ))}
      {MORE.map((n, i) => {
        const s = slot(i + 3);
        return (
          <rect key={n} x={s.x} y={s.y} width={s.w} height={28} rx={4} fill="none" stroke={C.mocha} strokeWidth={1.3} strokeDasharray="5 4" opacity={easeOut(seg(t, 2.8 + i * 0.1, 3.1 + i * 0.1))} />
        );
      })}
      <T x={25} y={222} s={12} f={C.latte} o={easeOut(seg(t, 3.6, 4.0))}>
        three built already; more to come
      </T>
    </Svg>
  );
}

// 4 · More features. The v3 frame with its three built features; the dashed slots below fill one by one with the rest.
export function RevealFiveMoreFeatures({ t }: StepCtx) {
  return (
    <Svg label="v3 also adds geometry, geography, nanosecond timestamps, the unknown type, defaults, multi-argument transforms, encryption keys." h={230}>
      <rect x={25} y={20} width={550} height={200} rx={6} fill="none" stroke={C.second} strokeWidth={2} opacity={easeOut(seg(t, 0.1, 0.3))} />
      <T x={37} y={38} s={13} f={C.second} o={easeOut(seg(t, 0.1, 0.3))}>
        v3
      </T>
      {THREE.map((n, i) => (
        <Cell key={n} x={slot(i).x} y={slot(i).y} w={slot(i).w} h={28} label={n} o={easeOut(seg(t, 0.1, 0.3)) * 0.5} />
      ))}
      {MORE.map((n, i) => {
        const s = slot(i + 3);
        return <Cell key={n} x={s.x} y={s.y} w={s.w} h={28} label={n} stroke={C.second} o={easeOut(seg(t, 0.5 + i * 0.55, 0.8 + i * 0.55))} />;
      })}
    </Svg>
  );
}

// 5 · Predict. A v2 reader opens a table whose required column is filled by a v3 default; the answer: it fails when required.
export function PredictOldReaderMeetsDefault({ t, answer }: StepCtx) {
  return (
    <Svg label="a v2-only reader opens a table with a required column filled by a v3 default. what happens?" h={200}>
      <Cell x={25} y={35} w={150} h={30} label="v2 reader" o={easeOut(seg(t, 0.1, 0.4))} />
      <Req x1={177} x2={278} y={50} k={easeOut(seg(t, 0.5, 0.9))} />
      <Cell x={280} y={35} w={295} h={30} label="required column, v3 default" stroke={C.second} o={easeOut(seg(t, 0.3, 0.6))} />
      <T x={280} y={100} s={14} f={C.crema} o={easeOut(seg(t, 1.4, 1.8))}>
        right, wrong, or fail?
      </T>
      <AnswerRow y={145} label="a required default" answer={answer} value="fails" k={easeOut(seg(t, 2.2, 2.7))} f={C.cherryText} />
      <Verdict answer={answer} y={188} text="an optional one reads as empty, correctly" />
    </Svg>
  );
}

// 6 · The default, measured. Three old rows, ids 0 to 2, each gain status "pending" from the default as the column is
// added; a new row, id 99, writes "active"; the table's format version reads 2.
export function RevealDefaultFallbackMeasured({ t }: StepCtx) {
  const add = easeOut(seg(t, 1.2, 1.6));
  return (
    <Svg label="reproduced for real: an optional default reads correctly even on a v2-format table." h={230}>
      <T x={25} y={25} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        id
      </T>
      <T x={150} y={25} s={11} f={C.second} o={add}>
        status, default pending
      </T>
      {['0', '1', '2', '99'].map((id, i) => {
        const y = 35 + i * 36;
        const ro = i < 3 ? easeOut(seg(t, 0.2 + i * 0.15, 0.5 + i * 0.15)) : easeOut(seg(t, 2.6, 2.9));
        return (
          <g key={id}>
            <Cell x={25} y={y} w={100} h={28} label={id} o={ro} />
            <Cell
              x={150}
              y={y}
              w={150}
              h={28}
              label={i < 3 ? 'pending' : 'active'}
              stroke={i < 3 ? C.second : C.focus}
              f={i < 3 ? C.second : C.focus}
              o={i < 3 ? easeOut(seg(t, 1.6 + i * 0.25, 1.9 + i * 0.25)) : easeOut(seg(t, 2.9, 3.2))}
            />
          </g>
        );
      })}
      <T x={330} y={70} s={12} f={C.latte} o={easeOut(seg(t, 2.0, 2.3))}>
        old rows: the default
      </T>
      <T x={330} y={160} s={12} f={C.focus} o={easeOut(seg(t, 3.0, 3.3))}>
        new row: its own value
      </T>
      <T x={25} y={210} s={13} f={C.crema} o={easeOut(seg(t, 3.6, 4.0))}>
        format version 2, read back correctly
      </T>
    </Svg>
  );
}

// 7 · v3 write blocked. create_table with format-version 3 runs at the library and comes back with its real error.
export function RevealV3WriteBlocked({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: writing an actual v3 table fails outright, with this library's own real error." h={230}>
      <Cell x={25} y={30} w={300} h={30} label="create_table(format-version 3)" o={easeOut(seg(t, 0.2, 0.5))} />
      <Req x1={327} x2={430} y={45} k={easeOut(seg(t, 0.7, 1.2))} />
      <Cell x={435} y={30} w={140} h={30} label="pyiceberg" o={easeOut(seg(t, 0.5, 0.8))} />
      <Req x1={433} x2={330} y={95} k={easeOut(seg(t, 1.6, 2.1))} f={C.cherryText} />
      <Cell x={25} y={80} w={300} h={30} label="NotImplementedError" stroke={C.cherryText} f={C.cherryText} o={easeOut(seg(t, 2.1, 2.4))} />
      <T x={25} y={140} s={12} f={C.cherryText} o={easeOut(seg(t, 2.6, 2.9))}>
        V3 ... not yet supported
      </T>
      <T x={25} y={175} s={11} f={C.latte} o={easeOut(seg(t, 3.0, 3.3))}>
        a real, open, tracked issue
      </T>
      <T x={25} y={212} s={13} f={C.crema} o={easeOut(seg(t, 3.6, 4.0))}>
        read about and borrowed from, not written yet
      </T>
    </Svg>
  );
}

// 8 · Three supported today. All of v3's features as cards; Databricks's announcement lights exactly the three built here;
// the rest dim as not mentioned.
export function RevealVendorSupportsThree({ t }: StepCtx) {
  const lit = t > 1.6;
  return (
    <Svg label="a real, dated engine announcement lists exactly three v3 features as supported today." h={230}>
      <T x={25} y={30} s={12} f={C.crema} o={easeOut(seg(t, 0.8, 1.1))}>
        Databricks: Iceberg v3 in public preview
      </T>
      {[...THREE, ...MORE].map((n, i) => {
        const s = slot(i);
        const three = i < 3;
        return (
          <Cell
            key={n}
            x={s.x - 10}
            y={s.y}
            w={s.w}
            h={28}
            label={n}
            stroke={lit && three ? C.focus : C.mocha}
            f={lit && !three ? C.taupe : C.crema}
            o={easeOut(seg(t, 0.1, 0.4)) * (lit && !three ? 0.6 : 1)}
          />
        );
      })}
      <T x={25} y={222} s={12} f={C.latte} o={easeOut(seg(t, 2.6, 3.0))}>
        three named as supported; the rest not mentioned
      </T>
    </Svg>
  );
}

// 9 · Engine lag. Two bars: the spec's, already full; engine support's, partly filled; a gate mark sits at the gap.
export function RevealEngineLagGates({ t }: StepCtx) {
  return (
    <Svg label="engine support lag, not the spec itself, is what actually gates adopting v3 today." h={230}>
      <T x={25} y={45} s={12} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        the spec
      </T>
      <rect x={170} y={32} width={380 * easeInOut(seg(t, 0.4, 1.2))} height={18} rx={2} fill={C.focus} />
      <T x={25} y={105} s={12} f={C.latte} o={easeOut(seg(t, 1.4, 1.7))}>
        engine support
      </T>
      <rect x={170} y={92} width={380} height={18} rx={2} fill="none" stroke={C.mocha} strokeWidth={1.3} strokeDasharray="5 4" opacity={easeOut(seg(t, 1.4, 1.7))} />
      <rect x={170} y={92} width={140 * easeInOut(seg(t, 1.7, 2.5))} height={18} rx={2} fill={C.second} />
      <line x1={312} y1={80} x2={312} y2={125} stroke={C.cherryText} strokeWidth={2.5} opacity={easeOut(seg(t, 2.8, 3.1))} />
      <T x={312} y={145} s={12} f={C.cherryText} a="middle" o={easeOut(seg(t, 2.9, 3.2))}>
        the real gate
      </T>
      <T x={25} y={205} s={13} f={C.crema} o={easeOut(seg(t, 3.6, 4.0))}>
        not the design, the software catching up
      </T>
    </Svg>
  );
}

// 10 · Recap.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="v3 is one coherent version bump -- partly already built here, mostly still waiting on engines to catch up." h={250}>
      <Row y={40} label="v3" value="one coordinated step" valueColor={C.second} k={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={100} label="built here" value="three of its pieces" valueColor={C.focus} k={easeOut(seg(t, 1.2, 1.6))} />
      <Row y={160} label="what is open" value="engine support" valueColor={C.cherryText} k={easeOut(seg(t, 2.2, 2.6))} />
    </Svg>
  );
}
