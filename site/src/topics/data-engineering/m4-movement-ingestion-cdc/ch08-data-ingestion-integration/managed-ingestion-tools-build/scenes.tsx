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

/** An empty dashed slot, for something not loaded. */
function Hole({ x, y, w, h = 28, o = 1, stroke = C.mocha }: { x: number; y: number; w: number; h?: number; o?: number; stroke?: string }) {
  return <rect x={x} y={y} width={w} height={h} rx={4} fill="none" stroke={stroke} strokeWidth={1.5} strokeDasharray="4 3" opacity={o} />;
}

/** A grid of row squares, `cols` x `rows` from (x, y); `lit(i)` returns a fill progress for square i. */
function Grid({ x, y, cols, rows, lit, f = C.cherryText, o = 1 }: { x: number; y: number; cols: number; rows: number; lit: (i: number) => number; f?: string; o?: number }) {
  return (
    <g opacity={o}>
      {Array.from({ length: cols * rows }, (_, i) => {
        const gx = x + (i % cols) * 16;
        const gy = y + Math.floor(i / cols) * 16;
        const l = lit(i);
        return (
          <g key={i}>
            <rect x={gx} y={gy} width={12} height={12} rx={2} fill={C.cocoa} stroke={C.mocha} strokeWidth={1} />
            {l > 0 && <rect x={gx} y={gy} width={12} height={12} rx={2} fill={f} opacity={l} />}
          </g>
        );
      })}
    </g>
  );
}

// 0 · Hook. Last month's bill as a short bar; this month's grows to three times it in cherry. Underneath, the row
// count's two bars sit almost level: the count barely moved.
export function Hook({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.5));
  const b = easeInOut(seg(t, 0.8, 2.0));
  const c = easeOut(seg(t, 2.3, 2.9));
  return (
    <Svg label="a routine backfill triples a managed pipeline's bill; the row count barely moved." h={200}>
      <T x={25} y={22} s={11} f={C.latte} o={a}>
        last month's bill
      </T>
      <rect x={25} y={30} width={120 * a} height={14} fill={C.latte} />
      <T x={25} y={64} s={11} f={C.cherryText} o={easeOut(seg(t, 0.7, 1.0))}>
        this month's bill
      </T>
      <rect x={25} y={72} width={360 * b} height={14} fill={C.cherryText} />
      {c > 0 && (
        <g opacity={c}>
          <T x={25} y={116} s={11} f={C.latte}>
            row count
          </T>
          <rect x={25} y={124} width={300} height={8} fill={C.latte} />
          <rect x={25} y={136} width={303} height={8} fill={C.latte} />
        </g>
      )}
      {t >= 3.3 && (
        <T x={25} y={180} s={13} f={C.focus} o={easeOut(seg(t, 3.3, 3.7))}>
          what changed: how many rows were touched
        </T>
      )}
    </Svg>
  );
}

// 1 · Predict. A small table whose every row is rewritten and a much larger one where two rows change. Once
// answered, cost bars grow under each: long under the small table, a sliver under the large.
export function Predict({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.2, 0.9)) : 0;
  const fill = seg(t, 0.6, 1.4);
  return (
    <Svg label="an identical backfill hits a small table and a much larger one. Which costs more under MAR pricing?" h={200}>
      <T x={25} y={28} s={11} f={C.latte}>
        small table
      </T>
      <Grid x={25} y={38} cols={5} rows={4} lit={(i) => clamp(fill * 20 - i, 0, 1)} />
      <T x={200} y={28} s={11} f={C.latte}>
        large table
      </T>
      <Grid x={200} y={38} cols={20} rows={4} lit={(i) => (i === 23 || i === 61 ? easeOut(seg(t, 1.2, 1.5)) : 0)} f={C.focus} />
      <rect x={25} y={118} width={150 * v} height={10} fill={C.cherryText} />
      <rect x={200} y={118} width={6 * v} height={10} fill={C.focus} />
      <AnswerRow y={178} label="costs more" answer={answer} value="the small one" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 2 · Billing by key. One key's touches fall across the month; the first drops a pip into the bill, every later touch
// lands with nothing added.
export function RevealKeyBilling({ t }: StepCtx) {
  const xs = [80, 160, 240, 320, 400, 480];
  const pip = easeOutBack(seg(t, 0.6, 1.0));
  return (
    <Svg label="a key is counted once it's touched this month, no matter how many more times it changes." h={200}>
      <T x={430} y={22} s={11} f={C.latte}>
        this month's bill
      </T>
      <rect x={430} y={30} width={120} height={36} rx={4} fill="none" stroke={C.mocha} strokeWidth={1.5} />
      <circle cx={452} cy={48} r={7 * pip} fill={C.focus} />
      <line x1={25} y1={130} x2={545} y2={130} stroke={C.mocha} strokeWidth={1.4} />
      <T x={25} y={150} s={11} f={C.latte}>
        one key, across the month
      </T>
      {xs.map((x, i) => {
        const k = easeOutBack(seg(t, 0.3 + i * 0.5, 0.6 + i * 0.5));
        return (
          <g key={i}>
            <line x1={x} y1={110} x2={x} y2={130} stroke={i === 0 ? C.focus : C.latte} strokeWidth={1.5} opacity={clamp(k, 0, 1)} />
            <circle cx={x} cy={104} r={6 * k} fill={i === 0 ? C.focus : C.latte} />
          </g>
        );
      })}
      <T x={80} y={88} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 0.7, 1.0))}>
        counted
      </T>
      {t >= 3.3 && (
        <T x={320} y={185} s={13} f={C.latte} a="middle" o={easeOut(seg(t, 3.3, 3.7))}>
          five more updates: nothing added
        </T>
      )}
    </Svg>
  );
}

// 3 · Measured. Each table's size bar and its touched bar: orders' touched bar is its whole size, catalog's a sliver of
// a long one. Then the two cost bars: orders' long, catalog's barely there.
export function RevealMarMeasured({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.8));
  const b = easeOut(seg(t, 0.9, 1.5));
  const c = easeInOut(seg(t, 2.2, 3.2));
  return (
    <Svg label="the real run: a small, fully reprocessed table against a huge, rarely touched one, billed by the identical rule." h={220}>
      <T x={25} y={22} s={11} f={C.latte} o={a}>
        orders · 5,000 rows, all touched
      </T>
      <rect x={25} y={30} width={52 * a} height={10} fill={C.latte} />
      <rect x={25} y={43} width={52 * a} height={10} fill={C.cherryText} />
      <T x={25} y={82} s={11} f={C.latte} o={b}>
        catalog · 50,000 rows, a sliver touched
      </T>
      <rect x={25} y={90} width={520 * b} height={10} fill={C.latte} />
      <rect x={25} y={103} width={3 * b} height={10} fill={C.cherryText} />
      <T x={25} y={146} s={11} f={C.latte} o={easeOut(seg(t, 2.0, 2.3))}>
        orders' cost
      </T>
      <rect x={130} y={137} width={400 * c} height={12} fill={C.cherryText} />
      <T x={25} y={176} s={11} f={C.latte} o={easeOut(seg(t, 2.0, 2.3))}>
        catalog's cost
      </T>
      <rect x={130} y={167} width={4 * c} height={12} fill={C.focus} />
      {t >= 3.6 && (
        <T x={300} y={210} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.6, 4.0))}>
          size was never the variable
        </T>
      )}
    </Svg>
  );
}

const FIELDS: [string, number, number][] = [
  ['order_id', 25, 90],
  ['amount', 125, 80],
  ['currency', 215, 90],
  ['discount_code', 315, 140],
];
// 4 · Drift modes. The incoming row's chips, the new field in pale blue. Four policies drop in beneath, each with what
// it does to that row.
export function RevealDriftModes({ t }: StepCtx) {
  const modes = [
    ['let it through', 'everything lands'],
    ['reject batch', 'nothing lands'],
    ['drop the row', 'this row is skipped'],
    ['drop the field', 'row lands, field dropped'],
  ];
  return (
    <Svg label="the identical new column, met four different ways: let it through, reject it, drop the row, drop the value." h={220}>
      {FIELDS.map(([n, x, w], i) => (
        <Cell key={i} x={x} y={20} w={w} label={n} o={easeOut(seg(t, i * 0.12, 0.3 + i * 0.12))} stroke={i === 3 ? C.second : C.mocha} />
      ))}
      {modes.map(([m, d], i) => (
        <g key={i} opacity={easeOut(seg(t, 0.8 + i * 0.7, 1.2 + i * 0.7))}>
          <Cell x={25} y={70 + i * 37} w={150} label={m} />
          <T x={195} y={88 + i * 37} s={12} f={C.latte}>
            {d}
          </T>
        </g>
      ))}
    </Svg>
  );
}

// 5 · Drift, measured. An axis from accepts-everything to accepts-nothing; the four modes land on it in turn, each with
// what actually loaded: four fields, three, none, none.
export function RevealDriftMeasured({ t }: StepCtx) {
  const marks: [string, number, number][] = [
    ['let through', 75, 4],
    ['drop field', 230, 3],
    ['drop row', 380, 0],
    ['reject', 520, 0],
  ];
  return (
    <Svg label="the real run: the identical drifted record met by all four modes in turn." h={220}>
      <T x={25} y={40} s={11} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        accepts everything
      </T>
      <T x={545} y={40} s={11} f={C.latte} a="end" o={easeOut(seg(t, 0, 0.3))}>
        accepts nothing
      </T>
      <line x1={25} y1={58} x2={25 + 520 * easeOut(seg(t, 0.1, 0.6))} y2={58} stroke={C.mocha} strokeWidth={1.4} />
      {marks.map(([m, x, n], i) => {
        const k = easeOut(seg(t, 0.6 + i * 0.7, 1.0 + i * 0.7));
        return (
          <g key={i} opacity={k}>
            <circle cx={x} cy={58} r={6} fill={i === 0 ? C.focus : i === 3 ? C.cherryText : C.latte} />
            <T x={x} y={88} s={11} f={C.latte} a="middle">
              {m}
            </T>
            {Array.from({ length: 4 }, (_, j) => {
              const sx = x - 28 + j * 15;
              return j < n ? (
                <rect key={j} x={sx} y={104} width={12} height={12} rx={2} fill={j === 3 ? C.second : C.latte} />
              ) : (
                <rect key={j} x={sx} y={104} width={12} height={12} rx={2} fill="none" stroke={C.mocha} strokeDasharray="2 2" />
              );
            })}
          </g>
        );
      })}
      {t >= 3.7 && (
        <T x={300} y={175} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.7, 4.1))}>
          in between: give up a smaller piece
        </T>
      )}
    </Svg>
  );
}

// 6 · What a tool charges for. This chapter's hand-solved problems stack up as tags, one by one; a price-tag outline
// closes around them.
export function RevealFailureModeList({ t }: StepCtx) {
  const tags = ['a cursor that lies', 'pagination dupes, drops', 'a rate limit to honor', 'a token to rotate', 'an atomic commit marker', 'a deterministic batch id'];
  const box = easeOut(seg(t, 3.0, 3.5));
  return (
    <Svg label="a dozen named problems this chapter's own topics each solved by hand — a managed tool's real price." h={200}>
      {tags.map((g, i) => (
        <Cell key={i} x={i % 2 === 0 ? 30 : 300} y={26 + Math.floor(i / 2) * 40} w={250} label={g} o={easeOut(seg(t, 0.2 + i * 0.4, 0.5 + i * 0.4))} />
      ))}
      {box > 0 && <rect x={18} y={16} width={544} height={128} rx={8} fill="none" stroke={C.focus} strokeWidth={2} strokeDasharray="6 4" opacity={box} />}
      {box > 0 && (
        <T x={300} y={176} s={13} f={C.focus} a="middle" o={box}>
          solved by hand, for this one source
        </T>
      )}
    </Svg>
  );
}

// 7 · Counted. Twelve squares fill in a row as the count climbs to twelve, from a skewed parallel read at one end to
// raw replay metadata at the other; a bracket names them the price.
export function RevealFailureModeMeasured({ t }: StepCtx) {
  const n = 12 * easeInOut(seg(t, 0.4, 2.6));
  const br = easeOut(seg(t, 3.0, 3.5));
  return (
    <Svg label="the real count: twelve distinct problems, from parallel reads to raw-layer metadata." h={200}>
      <Row y={40} label="failure modes" value={num(n)} valueColor={C.focus} />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={25 + i * 43} y={70} width={36} height={30} rx={3} fill={C.cocoa} stroke={i < n ? C.focus : C.mocha} strokeWidth={1.5} opacity={clamp(n - i + 1, 0.25, 1)} />
      ))}
      <T x={25} y={122} s={11} f={C.latte} o={easeOut(seg(t, 0.5, 0.8))}>
        skewed parallel read
      </T>
      <T x={534} y={122} s={11} f={C.latte} a="end" o={easeOut(seg(t, 2.4, 2.7))}>
        raw replay metadata
      </T>
      {br > 0 && <path d={`M25 140 v8 h${509 * br} v-8`} fill="none" stroke={C.focus} strokeWidth={2} />}
      {br >= 1 && (
        <T x={280} y={178} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.5, 3.9))}>
          what a managed tool's price buys
        </T>
      )}
    </Svg>
  );
}

// 8 · Recap. Three measurements as cards on the left; lines converge on one decision card; it resolves to a number.
export function Recap({ t }: StepCtx) {
  const ins = ['what it bills for', 'how it meets drift', 'problems already solved'];
  const d = easeOut(seg(t, 2.4, 2.9));
  return (
    <Svg label="MAR pricing, the four drift modes, and the dozen failure modes — all feeding one decision." h={260}>
      {ins.map((g, i) => {
        const k = easeOut(seg(t, 0.2 + i * 0.5, 0.6 + i * 0.5));
        const l = easeOut(seg(t, 1.4 + i * 0.2, 2.0 + i * 0.2));
        return (
          <g key={i}>
            <Cell x={25} y={30 + i * 60} w={230} label={g} o={k} />
            {l > 0 && <line x1={260} y1={44 + i * 60} x2={lerp(260, 355, l)} y2={lerp(44 + i * 60, 104, l)} stroke={C.focus} strokeWidth={1.8} />}
          </g>
        );
      })}
      <Cell x={360} y={90} w={190} label="build or buy" o={d} stroke={C.focus} f={C.focus} />
      {t >= 3.3 && (
        <T x={300} y={235} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.3, 3.7))}>
          a number, not a feeling
        </T>
      )}
    </Svg>
  );
}

// 9 · Prove it. The banking feed with its three traits; build and buy wait on the right. Once answered, the
// sovereignty trait lights and buy is crossed out.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.2, 0.8)) : 0;
  return (
    <Svg label="a regulated, low-volume, sovereignty-constrained source shows up. Build or buy?" h={200}>
      <Cell x={25} y={30} w={200} label="core banking feed" o={easeOut(seg(t, 0, 0.4))} />
      <Cell x={25} y={76} w={110} label="regulated" o={easeOut(seg(t, 0.4, 0.7))} />
      <Cell x={145} y={76} w={110} label="low volume" o={easeOut(seg(t, 0.6, 0.9))} />
      <Cell x={265} y={76} w={140} label="must stay put" o={easeOut(seg(t, 0.8, 1.1))} stroke={v > 0 ? C.focus : C.mocha} />
      <Cell x={430} y={30} w={120} label="build" o={easeOut(seg(t, 1.0, 1.3))} stroke={v > 0 ? C.focus : C.mocha} />
      <Cell x={430} y={76} w={120} label="buy" o={easeOut(seg(t, 1.1, 1.4))} />
      <Cross x={418} y={90} k={v} />
      <AnswerRow y={178} label="decision" answer={answer} value="build" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}
