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
const MATCHED = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
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

const PROMOS = ['fall sale', 'free shipping', 'loyalty'];
const W = [0.5, 0.3, 0.2];

// 1 · Hook. One order of 70.00 joined to three promotions; the amount travels down every line; the total is a question.
export function Hook({ t }: StepCtx) {
  const tr = seg(t, 2.2, 3.0);
  const q = easeOut(seg(t, 3.4, 3.9));
  return (
    <Svg label="one order, three promo tags, one bridge" h={250}>
      <Row y={40} label="one order" value="three promo tags at once" k={easeOut(seg(t, 0.4, 0.9))} />
      <Row y={85} label="joined and summed" value="what total comes out?" k={easeOut(seg(t, 2.4, 2.9))} />
      <Cell x={25} y={146} w={150} label="order · 70.00" o={easeOut(seg(t, 0.2, 0.5))} />
      {PROMOS.map((p, i) => {
        const y = 115 + i * 36;
        const l = easeInOut(seg(t, 0.8 + i * 0.2, 1.4 + i * 0.2));
        return (
          <g key={p}>
            <line x1={175} y1={160} x2={lerp(175, 405, l)} y2={lerp(160, y + 14, l)} stroke={C.mocha} strokeWidth={1.5} />
            <Cell x={405} y={y} w={170} label={p} o={l} />
            {tr > 0 && tr < 1 && <circle cx={lerp(175, 405, tr)} cy={lerp(160, y + 14, tr)} r={5} fill={C.cherryText} />}
          </g>
        );
      })}
      <T x={300} y={lerp(236, 230, q)} s={16} f={C.cherryText} a="middle" o={q}>
        the order's own total?
      </T>
    </Svg>
  );
}

// 2 · Multivalued. The fact row carries one group key; the bridge holds one row per promotion in that group; each row
// points on into the promotion dimension.
export function RevealMultivaluedQuote({ t }: StepCtx) {
  const a = easeInOut(seg(t, 1.2, 1.8));
  return (
    <Svg label="one group key, one row per simultaneous value" h={230}>
      <Row y={40} label="multivalued" value="more than one value at once" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="attaches through" value="a bridge, by group key" valueColor={C.focus} k={easeOut(seg(t, 2.2, 2.7))} />
      <Cell x={25} y={146} w={140} label="order · group key" o={easeOut(seg(t, 0.4, 0.7))} />
      {PROMOS.map((p, i) => {
        const k = easeOut(seg(t, 1.6 + i * 0.3, 2.0 + i * 0.3));
        const y = 115 + i * 36;
        return (
          <g key={p}>
            <line x1={165} y1={160} x2={lerp(165, 215, a)} y2={lerp(160, y + 14, a)} stroke={C.focus} strokeWidth={1.5} />
            <Cell x={215} y={y} w={170} label={`group · ${p}`} o={k} stroke={C.focus} />
            <line x1={385} y1={y + 14} x2={385 + 60 * easeInOut(seg(t, 2.6 + i * 0.2, 3.0 + i * 0.2))} y2={y + 14} stroke={C.latte} strokeWidth={1.5} />
          </g>
        );
      })}
      <Cell x={445} y={115} w={130} h={100} label="promotion" o={easeOut(seg(t, 2.6, 2.9))} />
    </Svg>
  );
}

// 3 · Predict: still the real total? The 70.00 order joined to three rows; then the question.
export function PredictBridgeSum({ t, answer }: StepCtx) {
  return (
    <Svg label="join through the bridge, sum — the real total?" h={210}>
      <Row y={40} label="order's own amount" value="joined through the bridge" k={easeOut(seg(t, 0.1, 0.5))} />
      <Cell x={25} y={62} w={130} h={26} label="70.00" o={easeOut(seg(t, 0.2, 0.5))} />
      {PROMOS.map((p, i) => (
        <g key={p}>
          <line x1={155} y1={75} x2={lerp(155, 215 + i * 125, easeInOut(seg(t, 0.5 + i * 0.15, 0.9 + i * 0.15)))} y2={75} stroke={C.mocha} strokeWidth={1.5} />
          <Cell x={215 + i * 125} y={62} w={110} h={26} label={p} o={easeOut(seg(t, 0.8 + i * 0.15, 1.0 + i * 0.15))} />
        </g>
      ))}
      <AnswerRow y={140} label="summed, the real total" answer={answer} value="no, tripled" f={C.cherryText} k={easeOut(seg(t, 1.3, 1.8))} />
      <Verdict answer={answer} text="every bridge row carries the same amount" f={C.cherryText} />
    </Svg>
  );
}

// 4 · The double count, real. Each of the three joined rows carries the full 70.00; summed, the bar runs to 210.00,
// three times the real 70.00 marked beside it.
export function RevealDoubleCount({ t }: StepCtx) {
  const sc = 360 / 210;
  const b = (i: number) => easeOut(seg(t, 2.0 + i * 0.4, 2.4 + i * 0.4));
  const tot = easeOut(seg(t, 3.2, 3.6));
  return (
    <Svg label="unweighted: the amount, three times over" h={250}>
      <Row y={40} label="three tags" value="amount duplicated each time" valueColor={C.cherryText} k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="summed unweighted" value="far past the real total" valueColor={C.cherryText} k={easeOut(seg(t, 2.6, 3.1))} />
      {PROMOS.map((p, i) => (
        <Cell key={p} x={25} y={115 + i * 34} w={190} h={26} label={`${p} · 70.00`} o={easeOut(seg(t, 0.6 + i * 0.3, 1.0 + i * 0.3))} stroke={C.cherryText} />
      ))}
      {[0, 1, 2].map((i) => (
        <rect key={i} x={235 + 70 * sc * i} y={160} width={70 * sc * b(i)} height={20} rx={2} fill={C.cherryText} opacity={0.75} />
      ))}
      <line x1={235 + 70 * sc} y1={150} x2={235 + 70 * sc} y2={190} stroke={C.focus} strokeWidth={2} strokeDasharray="4 3" opacity={easeOut(seg(t, 1.8, 2.1))} />
      <T x={235 + 70 * sc} y={145} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 1.8, 2.1))}>
        real 70.00
      </T>
      <T x={575} y={lerp(212, 206, tot)} s={14} f={C.cherryText} a="end" o={tot} w={600}>
        210.00
      </T>
    </Svg>
  );
}

// 5 · The weighting fix. The same three bridge rows; each gets its own weight cell slid on beside it.
export function RevealWeightingQuote({ t }: StepCtx) {
  return (
    <Svg label="an allocation factor, assigned to each row" h={230}>
      <Row y={40} label="grouping, unweighted" value="over-counts the metric" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="fix" value="a weighting factor per row" valueColor={C.focus} k={easeOut(seg(t, 2.0, 2.5))} />
      {PROMOS.map((p, i) => {
        const w = easeOut(seg(t, 2.4 + i * 0.35, 2.8 + i * 0.35));
        return (
          <g key={p}>
            <Cell x={25} y={118 + i * 36} w={300} h={28} label={`group · ${p}`} o={easeOut(seg(t, 0.4 + i * 0.15, 0.8 + i * 0.15))} />
            <g opacity={w} transform={`translate(${((1 - w) * 30).toFixed(1)} 0)`}>
              <Cell x={335} y={118 + i * 36} w={110} h={28} label={`weight ${W[i]}`} stroke={C.focus} f={C.focus} />
            </g>
          </g>
        );
      })}
    </Svg>
  );
}

// 6 · Weights, measured. 0.5, 0.3 and 0.2 of 70.00 give 35.00, 21.00 and 14.00; stacked end to end they come back to
// exactly 70.00.
export function RevealWeightingMeasured({ t }: StepCtx) {
  const sc = 400 / 70;
  const parts = W.map((w) => w * 70);
  let acc = 0;
  return (
    <Svg label="weights sum to one; the true total, back" h={250}>
      <Row y={40} label="three weights" value="sum to exactly one" k={easeOut(seg(t, 0.4, 0.9))} />
      <Row y={85} label="weighted sum" value="the order's real total" valueColor={C.focus} k={easeOut(seg(t, 2.8, 3.3))} />
      {PROMOS.map((p, i) => (
        <T key={p} x={25} y={130 + i * 26} s={13} f={C.crema} o={easeOut(seg(t, 0.8 + i * 0.4, 1.2 + i * 0.4))}>
          {`${W[i]} × 70.00 = ${parts[i].toFixed(2)}`}
        </T>
      ))}
      {parts.map((v, i) => {
        const x = 25 + acc * sc;
        acc += v;
        return <rect key={i} x={x} y={208} width={v * sc * easeOut(seg(t, 2.2 + i * 0.3, 2.6 + i * 0.3))} height={20} rx={2} fill={[C.focus, C.second, C.latte][i]} opacity={0.7} />;
      })}
      <T x={440} y={223} s={14} f={C.focus} o={easeOut(seg(t, 3.1, 3.5))}>
        70.00
      </T>
      <Tick y={208} k={easeOut(seg(t, 3.3, 3.7))} />
    </Svg>
  );
}

/** The uneven category tree: top, a branch two levels below it, and a leaf directly beneath. */
const NODES: Record<string, [number, number]> = { top: [300, 125], A: [180, 162], A1: [180, 200], B: [420, 162] };

// 7 · A ragged tree. The top node; one branch grows down two more levels; the other stops after one.
export function RevealRaggedQuote({ t }: StepCtx) {
  const e = (a: string, b: string, k: number) => (
    <line x1={NODES[a][0]} y1={NODES[a][1]} x2={lerp(NODES[a][0], NODES[b][0], k)} y2={lerp(NODES[a][1], NODES[b][1], k)} stroke={C.latte} strokeWidth={1.5} />
  );
  const n = (id: string, k: number, f: string = C.crema) => <circle cx={NODES[id][0]} cy={NODES[id][1]} r={9 * k} fill={C.cocoa} stroke={f} strokeWidth={2} />;
  const a1 = easeInOut(seg(t, 0.9, 1.4));
  const a2 = easeInOut(seg(t, 1.5, 2.0));
  const b1 = easeInOut(seg(t, 2.4, 2.9));
  return (
    <Svg label="indeterminate depth, hard to model directly" h={230}>
      <Row y={40} label="one branch" value="three levels deep" k={easeOut(seg(t, 1.0, 1.5))} />
      <Row y={85} label="another branch" value="a single leaf" valueColor={C.focus} k={easeOut(seg(t, 2.4, 2.9))} />
      {e('top', 'A', a1)}
      {e('A', 'A1', a2)}
      {e('top', 'B', b1)}
      {n('top', easeOutBack(seg(t, 0.4, 0.8)))}
      {n('A', clamp(easeOutBack(seg(t, 1.3, 1.6))))}
      {n('A1', clamp(easeOutBack(seg(t, 1.9, 2.2))))}
      {n('B', clamp(easeOutBack(seg(t, 2.8, 3.1))), C.focus)}
    </Svg>
  );
}

// 8 · Predict: still recursive to read? Every path, pre-computed into rows; then the question.
export function PredictFlattenedRecursion({ t, answer }: StepCtx) {
  return (
    <Svg label="built once — still needs recursion to read?" h={210}>
      <Row y={40} label="bridge built once" value="every path, pre-computed" k={easeOut(seg(t, 0.1, 0.5))} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={25 + i * 140} y={62} width={130} height={22} rx={3} fill={C.cocoa} stroke={C.mocha} opacity={easeOut(seg(t, 0.4 + i * 0.15, 0.7 + i * 0.15))} />
      ))}
      <AnswerRow y={140} label="reading it, recursive" answer={answer} value="no, a flat filter" k={easeOut(seg(t, 1.3, 1.8))} />
      <Verdict answer={answer} text="the recursion ran once, at build time" />
    </Svg>
  );
}

// 9 · The flattened bridge. Ancestor-descendant rows; a plain filter on ancestor = top sweeps down and lights the three
// categories beneath it.
const PATHS: [string, string][] = [
  ['top', 'A'],
  ['top', 'A1'],
  ['top', 'B'],
  ['A', 'A1'],
];
export function RevealFlattenedBridge({ t }: StepCtx) {
  const f = seg(t, 2.4, 3.4);
  return (
    <Svg label="read with a flat filter, no recursion" h={250}>
      <Row y={40} label="every path" value="pre-computed, once" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="reading it" value="a flat filter, no recursion" valueColor={C.focus} k={easeOut(seg(t, 2.2, 2.7))} />
      {PATHS.map(([a, d], i) => {
        const hit = a === 'top';
        const on = f * 4 > i;
        return (
          <g key={i} opacity={easeOut(seg(t, 0.8 + i * 0.25, 1.2 + i * 0.25)) * (on && !hit ? 0.35 : 1)}>
            <Cell x={25} y={112 + i * 32} w={130} h={26} label={a} stroke={on && hit ? C.focus : C.mocha} />
            <Cell x={165} y={112 + i * 32} w={130} h={26} label={d} stroke={on && hit ? C.focus : C.mocha} f={on && hit ? C.focus : C.crema} />
          </g>
        );
      })}
      {f > 0 && f < 1 && <rect x={20} y={108 + f * 128} width={280} height={3} fill={C.focus} />}
      <T x={330} y={150} s={12} f={C.latte} o={easeOut(seg(t, 2.4, 2.8))}>
        WHERE ancestor = top
      </T>
      <T x={330} y={180} s={14} f={C.focus} o={easeOut(seg(t, 3.4, 3.8))}>
        3 categories
      </T>
    </Svg>
  );
}

// 10 · Independent check. Real recursion walks the tree again from the top, visiting A, then A1, then B; the result
// matches the bridge's three categories, and a tick lands.
export function RevealRecursiveCheck({ t }: StepCtx) {
  const N: Record<string, [number, number]> = { top: [155, 125], A: [95, 165], A1: [95, 205], B: [215, 165] };
  const vis = ['A', 'A1', 'B'];
  const v = (i: number) => easeOut(seg(t, 0.9 + i * 0.6, 1.3 + i * 0.6));
  return (
    <Svg label="walked independently, same categories back" h={240}>
      <Row y={40} label="raw tree, walked" value="a fresh recursive query" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="result" value="matches the bridge exactly" valueColor={C.focus} k={easeOut(seg(t, 2.8, 3.3))} />
      {[
        ['top', 'A'],
        ['A', 'A1'],
        ['top', 'B'],
      ].map(([a, b]) => (
        <line key={b} x1={N[a][0]} y1={N[a][1]} x2={N[b][0]} y2={N[b][1]} stroke={C.latte} strokeWidth={1.5} opacity={easeOut(seg(t, 0.3, 0.6))} />
      ))}
      {Object.entries(N).map(([id, [x, y]]) => {
        const i = vis.indexOf(id);
        const on = i >= 0 && v(i) > 0;
        return <circle key={id} cx={x} cy={y} r={9} fill={on ? C.focus : C.cocoa} stroke={id === 'top' ? C.crema : C.latte} strokeWidth={2} opacity={easeOut(seg(t, 0.3, 0.6))} />;
      })}
      <T x={330} y={132} s={11} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        bridge
      </T>
      <T x={330} y={187} s={11} f={C.latte} o={easeOut(seg(t, 0.8, 1.1))}>
        recursive
      </T>
      {vis.map((id, i) => (
        <g key={id}>
          <Cell x={400 + i * 60} y={115} w={52} h={26} label={id} o={easeOut(seg(t, 0.4, 0.7))} stroke={C.focus} />
          <Cell x={400 + i * 60} y={170} w={52} h={26} label={id} o={v(i)} stroke={C.focus} />
        </g>
      ))}
      <Tick y={218} k={easeOut(seg(t, 3.0, 3.4))} />
    </Svg>
  );
}

// 11 · Recap. Three rows land one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="bridge, weighted, flattened — measured" h={220}>
      <Row y={50} label="multivalued" value="one row per value" k={easeOut(seg(t, 1.0, 1.5))} />
      <Row y={110} label="weights" value="sum to one, fix the total" k={easeOut(seg(t, 2.0, 2.5))} />
      <Row y={170} label="ragged bridge" value="recursion paid once" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
    </Svg>
  );
}

// 12 · Prove: two overlapping tags. After the answer each tag row gets a weight and the verdict lands with a tick.
export function ProveProductTags({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const w = answer !== null ? easeOut(seg(s, 0.1, 0.5)) : 0;
  const k = answer !== null ? easeOut(seg(s, 0.6, 1.0)) : 0;
  const tick = answer !== null ? easeOut(seg(s, 1.0, 1.4)) : 0;
  return (
    <Svg label="two overlapping tags, an unweighted sum" h={230}>
      <Row y={40} label="product, two tags" value="unweighted revenue sum" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="trust it" answer={answer} value="fix it first" k={easeOut(seg(t, 0.4, 0.9))} />
      {['tag one', 'tag two'].map((l, i) => (
        <g key={l}>
          <Cell x={25 + i * 290} y={112} w={170} h={26} label={l} o={easeOut(seg(t, 0.6 + i * 0.1, 0.9 + i * 0.1))} />
          <Cell x={205 + i * 290} y={112} w={80} h={26} label="weight" o={w} stroke={C.focus} f={C.focus} />
        </g>
      ))}
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, k)} s={15} f={C.focus} a="middle" o={k}>
            two rows duplicate it just like three
          </T>
          <rect x={150} y={202} width={300 * tick} height={3} fill={C.focus} />
          <Tick y={176} k={tick} />
        </>
      )}
    </Svg>
  );
}
