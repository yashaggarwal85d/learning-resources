import { useEffect, useState } from 'react';
import { Bar, C, Decode, Draw, Plot, Reticle, Svg, T } from '../../../../../reels/kit';
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

/** The id axis from x 25 to 545 at y AXY with the real shape over it: a low bump at the start and a tall narrow
 * spike at the far end, grown by `k`. */
const AXY = 170;
function Hist({ k }: { k: number }) {
  return (
    <g>
      <line x1={25} y1={AXY} x2={545} y2={AXY} stroke={C.latte} strokeWidth={1.4} />
      <rect x={28} y={AXY - 14 * k} width={22} height={14 * k} fill={C.latte} />
      <rect x={522} y={AXY - 120 * k} width={20} height={120 * k} fill={C.latte} />
      <T x={25} y={AXY + 20} s={11} f={C.latte}>
        id
      </T>
    </g>
  );
}

/** `n` equal-width slices over the axis, drawn by `k`; slice `hot` outlined cherry once `mark` is on. */
function Slices({ n, k, mark = 0, hot = -1, top = 40 }: { n: number; k: number; mark?: number; hot?: number; top?: number }) {
  const w = 520 / n;
  return (
    <g>
      {Array.from({ length: n + 1 }, (_, i) => (
        <line key={i} x1={25 + i * w} y1={AXY} x2={25 + i * w} y2={lerp(AXY, top, clamp(k * (n + 1) - i, 0, 1))} stroke={C.mocha} strokeWidth={1} />
      ))}
      {hot >= 0 && mark > 0 && <rect x={25 + hot * w} y={top} width={w} height={AXY - top} fill="none" stroke={C.cherryText} strokeWidth={2} opacity={mark} />}
    </g>
  );
}

// 0 · Hook. Sixteen partition lanes fill; fifteen finish fast, the last crawls in cherry; beside them the production
// database's dead tuples climb as a bar.
export function Hook({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.6));
  const slow = seg(t, 0.3, 4.2) * 0.35;
  const d = easeIn2(seg(t, 1.2, 4.2));
  return (
    <Svg label="sixteen lanes, fifteen finished. One still running at hour three, while dead tuples climb underneath." h={250}>
      <T x={25} y={18} s={11} f={C.latte}>
        sixteen partitions
      </T>
      {Array.from({ length: 16 }, (_, i) => (
        <g key={i}>
          <rect x={25} y={28 + i * 11} width={360} height={7} fill={C.cocoa} />
          <rect x={25} y={28 + i * 11} width={360 * (i === 15 ? slow : a)} height={7} fill={i === 15 ? C.bad : C.latte} />
        </g>
      ))}
      <T x={25} y={226} s={11} f={C.cherryText} o={easeOut(seg(t, 2.4, 2.8))}>
        one still running at hour three
      </T>
      <rect x={470} y={210 - 170 * d} width={40} height={170 * d} fill={C.bad} stroke={C.cherryText} strokeWidth={1.2} />
      <line x1={450} y1={210} x2={530} y2={210} stroke={C.mocha} strokeWidth={1.4} />
      <T x={490} y={232} s={11} f={C.cherryText} a="middle" o={easeOut(seg(t, 1.4, 1.8))}>
        dead tuples
      </T>
    </Svg>
  );
}

function easeIn2(x: number) {
  return x * x;
}

// 1 · Predict. The id axis with its real shape: a low bump, a tall spike at the end; sixteen equal slices draw over it.
export function PredictStride({ t, answer }: StepCtx) {
  return (
    <Svg label="the key is skewed. With sixteen equal-width partitions, which one does the real work?" h={230}>
      <Hist k={easeOut(seg(t, 0.2, 0.8))} />
      <Slices n={16} k={easeOut(seg(t, 0.8, 1.6))} />
      <T x={300} y={30} s={13} f={C.focus} a="middle" o={answer === null ? easeOut(seg(t, 1.6, 2.0)) : 0}>
        a fair share each?
      </T>
      <Verdict answer={answer} y={218} text="nearly all of it lands in one" />
    </Svg>
  );
}

// 2 · Stride, not filter. Sixteen equal slices; the bounds only set width; the whole spike sits under the last slice,
// which outlines in cherry; the middle slices stay empty.
export function RevealStrideNotFilter({ t }: StepCtx) {
  return (
    <Svg label="sixteen equal-width slices over the id range, with the real histogram underneath." h={240}>
      <Slices n={16} k={1} mark={easeOut(seg(t, 1.6, 2.0))} hot={15} />
      <Hist k={easeOut(seg(t, 0.3, 1.3))} />
      <T x={25} y={30} s={11} f={C.latte} o={easeOut(seg(t, 2.4, 2.8))}>
        bounds set each slice's width;
      </T>
      <T x={25} y={48} s={11} f={C.latte} o={easeOut(seg(t, 2.6, 3.0))}>
        they never filter a row
      </T>
      <T x={25} y={222} s={12} f={C.focus} o={easeOut(seg(t, 3.4, 3.8))}>
        fifteen slices, nearly empty
      </T>
    </Svg>
  );
}

// 3 · Measured. Sixteen partition bars from the real run: two thousand in the first, zero in fourteen, forty-eight
// thousand in the last, in cherry.
export function RevealMeasuredSkew({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.3, 1.8));
  return (
    <Svg label="the real sixteen-partition count: two thousand rows, fourteen partitions at zero, forty-eight thousand in one." h={230}>
      {Array.from({ length: 16 }, (_, i) => {
        const h = i === 0 ? 5 : i === 15 ? 125 : 0;
        return (
          <rect
            key={i}
            x={25 + i * 33}
            y={170 - Math.max(1, h * k)}
            width={26}
            height={Math.max(1, h * k)}
            fill={i === 15 ? C.bad : C.latte}
            stroke={i === 15 ? C.cherryText : 'none'}
            strokeWidth={1.2}
          />
        );
      })}
      <line x1={22} y1={170} x2={548} y2={170} stroke={C.mocha} strokeWidth={1.4} />
      <T x={25} y={152} s={11} f={C.crema} o={easeOut(seg(t, 1.8, 2.1))}>
        2,000
      </T>
      <T x={290} y={152} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 2.2, 2.5))}>
        zero, in fourteen
      </T>
      <T x={545} y={34} s={12} f={C.cherryText} a="end" o={easeOut(seg(t, 2.6, 2.9))}>
        48,000
      </T>
      <T x={25} y={210} s={12} f={C.focus} o={easeOut(seg(t, 3.4, 3.8))}>
        one partition did nearly all the work
      </T>
    </Svg>
  );
}

// 4 · One snapshot. Three connection lanes: the exporter takes a snapshot, a separate importer opens the same one, a
// third commits a row in between; both read 50,000; a later fresh connection reads 50,001. The snapshot line draws
// down, the import arrow follows it, the new row slides in after the line, and only the later lane reaches it.
export function RevealSnapshot({ t }: StepCtx) {
  const rows: [string, string, number, string][] = [
    ['exports a snapshot', '50,000', 0.3, C.second],
    ['imports the same one', '50,000', 1.1, C.second],
    ['commits a new row', '', 1.9, C.focus],
    ['later, no snapshot', '50,001', 2.7, C.crema],
  ];
  const ly = (i: number) => 38 + i * 46;
  // the new row slides in on the commit lane, just after the snapshot line
  const ins = easeOutBack(seg(t, 2.0, 2.45));
  return (
    <Svg label="one exported snapshot, imported by a second worker, unmoved by a concurrent insert." h={230}>
      {/* the snapshot: one moment, drawn down through every lane that shares it */}
      <Draw pts={[[250, 20], [250, 205]]} t={t} from={0.4} to={1.0} stroke={C.second} w={1.6} dash="5 4" pen={false} />
      {rows.map(([l, , k0], i) => {
        const k = easeOut(seg(t, k0, k0 + 0.4));
        return (
          <g key={l} opacity={k} transform={`translate(${((1 - k) * -20).toFixed(1)} 0)`}>
            <T x={25} y={44 + i * 46} s={13} f={C.crema}>
              {l}
            </T>
          </g>
        );
      })}
      {/* the importer is handed the exporter's snapshot: an arrow down the snapshot line */}
      <Draw pts={[[262, ly(0)], [262, ly(1)]]} t={t} from={1.1} to={1.5} stroke={C.second} w={2} />
      {ins > 0 && <rect x={lerp(560, 390, clamp(ins, 0, 1.1))} y={32 + 2 * 46} width={16} height={16} rx={2} fill={C.focus} />}
      {/* only the later connection reaches the new row */}
      <Draw pts={[[398, ly(2) + 12], [398, ly(3) - 4]]} t={t} from={2.7} to={3.1} stroke={C.focus} w={2} />
      <Decode text="50,000" t={t} at={0.6} x={575} y={44} s={15} f={C.second} a="end" />
      <Decode text="50,000" t={t} at={1.4} x={575} y={44 + 46} s={15} f={C.second} a="end" />
      <Decode text="50,001" t={t} at={3.1} x={575} y={44 + 3 * 46} s={15} f={C.crema} a="end" />
      <Reticle x={548} y={176} w={74} h={34} t={t} at={3.6} />
    </Svg>
  );
}

// 5 · Row by row against COPY. The same fifty thousand rows: the row-by-row select's bar runs longer than the bulk
// copy's, trial after trial.
export function RevealCopyVsSelect({ t }: StepCtx) {
  return (
    <Svg label="the same fifty thousand rows, two ways: row-by-row SELECT against COPY TO, best of several trials." h={210}>
      <T x={25} y={34} s={12} f={C.latte}>
        row-by-row SELECT
      </T>
      {[0, 1, 2].map((i) => (
        <rect key={i} x={25} y={44 + i * 12} width={[460, 470, 455][i] * easeOut(seg(t, 0.3 + i * 0.3, 1.3 + i * 0.3))} height={8} fill={C.latte} />
      ))}
      <T x={25} y={114} s={12} f={C.second} o={easeOut(seg(t, 1.6, 1.9))}>
        COPY TO
      </T>
      {[0, 1, 2].map((i) => (
        <rect key={i} x={25} y={124 + i * 12} width={[330, 340, 325][i] * easeOut(seg(t, 1.9 + i * 0.3, 2.7 + i * 0.3))} height={8} fill={C.second} />
      ))}
      <T x={25} y={196} s={12} f={C.focus} o={easeOut(seg(t, 3.6, 4.0))}>
        slower row by row, every trial
      </T>
    </Svg>
  );
}

// 6 · Moved, not removed. A long query on the replica: with the setting off, it is cancelled; switched on, the query
// survives, and a cherry "cleanup held back" bar grows on the primary instead.
export function RevealReplicaCost({ t }: StepCtx) {
  const on = easeInOut(seg(t, 1.8, 2.3));
  const g = easeOut(seg(t, 2.6, 3.8));
  return (
    <Svg label="hot_standby_feedback stops the standby's own query from being cancelled — by holding back cleanup on the primary instead." h={230}>
      <Cell x={25} y={30} w={200} h={34} label="primary" />
      <Cell x={330} y={30} w={200} h={34} label="replica: long query" stroke={on > 0.5 ? C.second : C.mocha} />
      {on < 0.5 && <Cross x={545} y={47} k={easeOut(seg(t, 0.6, 0.9))} />}
      <T x={330} y={90} s={11} f={C.cherryText} o={easeOut(seg(t, 0.8, 1.1)) * (1 - on)}>
        cancelled
      </T>
      <rect x={330} y={110} width={44} height={22} rx={11} fill={C.cocoa} stroke={on > 0.5 ? C.focus : C.mocha} strokeWidth={1.6} />
      <circle cx={lerp(341, 363, on)} cy={121} r={7} fill={on > 0.5 ? C.focus : C.latte} />
      <T x={384} y={126} s={11} f={C.latte}>
        hot_standby_feedback
      </T>
      <T x={25} y={100} s={11} f={C.cherryText} o={easeOut(seg(t, 2.6, 3.0))}>
        cleanup held back
      </T>
      <rect x={25} y={110} width={200 * g} height={14} fill={C.bad} stroke={C.cherryText} strokeWidth={1.2} />
      <T x={25} y={200} s={12} f={C.focus} o={easeOut(seg(t, 3.9, 4.3))}>
        the cost moved; it didn't go away
      </T>
    </Svg>
  );
}

// 7 · Measured. Dead tuples: zero, then 10,000 after the updates; a vacuum while the extract's snapshot is open leaves
// all 10,000 (a horizon line pinned); the extract commits, the next vacuum takes the bar to zero.
export function RevealVacuumMeasured({ t }: StepCtx) {
  const up = easeOut(seg(t, 0.3, 1.0));
  const down = easeInOut(seg(t, 3.0, 3.6));
  const h = 150 * up * (1 - down);
  const val = down > 0.99 ? '0' : up > 0.99 ? '10,000' : up > 0 ? '…' : '0';
  return (
    <Svg label="a long extract's open snapshot, measured directly: VACUUM reclaims nothing while it's open." h={250}>
      <rect x={60} y={200 - h} width={60} height={h} fill={C.bad} stroke={C.cherryText} strokeWidth={1.2} />
      <line x1={40} y1={200} x2={140} y2={200} stroke={C.mocha} strokeWidth={1.4} />
      <T x={90} y={226} s={13} f={C.crema} a="middle">
        {val}
      </T>
      <T x={180} y={60} s={11} f={C.latte} o={easeOut(seg(t, 0.6, 1.0))}>
        10,000 rows updated, extract still open
      </T>
      <T x={180} y={100} s={11} f={C.cherryText} o={easeOut(seg(t, 1.4, 1.8))}>
        VACUUM: reclaims none of them
      </T>
      <line x1={50} y1={50} x2={150} y2={50} stroke={C.second} strokeWidth={2} strokeDasharray="5 3" opacity={easeOut(seg(t, 1.6, 2.0)) * (1 - down)} />
      <T x={180} y={140} s={11} f={C.second} o={easeOut(seg(t, 2.6, 3.0))}>
        the extract commits; VACUUM again
      </T>
      <T x={180} y={180} s={12} f={C.focus} o={easeOut(seg(t, 3.6, 4.0))}>
        all reclaimed
      </T>
    </Svg>
  );
}

// 8 · Recap. Four choices, each sliding in; a leader draws out to the currency it spends; brackets lock onto the long
// extract, the one that costs the primary.
export function Recap({ t }: StepCtx) {
  const cards: [string, string][] = [
    ['parallel read', 'a stride, not a filter'],
    ['shared snapshot', "one transaction's lifetime"],
    ['bulk COPY', 'nothing extra: faster'],
    ['long extract', "the primary's cleanup"],
  ];
  return (
    <Svg label="stride not filter. One shared snapshot. COPY ahead. A vacuum cost, measured." h={250}>
      {cards.map(([a, b], i) => {
        const k0 = 0.3 + i * 0.8;
        const k = easeOut(seg(t, k0, k0 + 0.4));
        const price = easeOut(seg(t, k0 + 0.45, k0 + 0.8));
        const col = i === 3 ? C.cherryText : C.second;
        return (
          <g key={a}>
            <g opacity={k} transform={`translate(${((1 - k) * -24).toFixed(1)} 0)`}>
              <T x={25} y={44 + i * 52} s={13} f={C.crema}>
                {a}
              </T>
            </g>
            {/* each choice pays: a leader runs from the choice out to the currency it spends */}
            <Draw pts={[[25, 54 + i * 52], [575, 54 + i * 52]]} t={t} from={k0 + 0.2} to={k0 + 0.6} stroke={C.line} w={1.2} />
            <g opacity={price} transform={`translate(${((1 - price) * 24).toFixed(1)} 0)`}>
              <T x={575} y={44 + i * 52} s={13} f={col} a="end">
                {b}
              </T>
            </g>
          </g>
        );
      })}
      <Reticle x={300} y={195} w={566} h={36} t={t} at={3.9} color={C.cherryText} />
    </Svg>
  );
}

// 9 · Prove it. The same axis and spike, now sixty-four slices. Once answered: the busiest slice still holds over
// sixteen thousand of the forty-eight thousand.
export function ProveIt({ t, answer }: StepCtx) {
  return (
    <Svg label="the same skewed key, now with sixty-four partitions instead of sixteen." h={240}>
      <Hist k={1} />
      <Slices n={64} k={easeOut(seg(t, 0.2, 1.2))} mark={answer !== null ? 1 : 0} hot={63} />
      {answer !== null && (
        <T x={545} y={32} s={12} f={C.cherryText} a="end">
          busiest: over 16,000
        </T>
      )}
      <Verdict answer={answer} y={224} text="barely: the skew lives in the data" />
    </Svg>
  );
}
