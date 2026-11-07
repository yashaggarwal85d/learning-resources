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

/** A table box with a header name and an optional second line. */
function Tbl({
  x,
  y,
  w,
  h = 40,
  name,
  sub,
  o = 1,
  stroke = C.mocha,
  f = C.crema,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  name: string;
  sub?: string;
  o?: number;
  stroke?: string;
  f?: string;
}) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={h} rx={6} fill={C.cocoa} stroke={stroke} strokeWidth={1.5} />
      <T x={x + w / 2} y={sub ? y + 17 : y + h / 2 + 4.5} s={12} f={f} a="middle">
        {name}
      </T>
      {sub && (
        <T x={x + w / 2} y={y + 34} s={11} f={C.latte} a="middle">
          {sub}
        </T>
      )}
    </g>
  );
}

/** A chain of `n` small table squares joined by lines, from x0 at y; `k` draws it left to right; `f(i)` colours each. */
function Chain({ x0, y, n, k, gap = 40, f }: { x0: number; y: number; n: number; k: number; gap?: number; f?: (i: number) => string }) {
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const kk = seg(k, i / n, (i + 1) / n);
        return (
          <g key={i} opacity={kk > 0 ? 1 : 0}>
            {i > 0 && <line x1={x0 + (i - 1) * gap + 14} y1={y + 7} x2={x0 + (i - 1) * gap + 14 + (gap - 14) * kk} y2={y + 7} stroke={C.latte} strokeWidth={1.5} />}
            <rect x={x0 + i * gap} y={y} width={14} height={14} rx={2} fill={f ? f(i) : C.crema} opacity={kk} />
          </g>
        );
      })}
    </g>
  );
}

// 1 · Hook. The same question against three models: a one-join chain for 3NF and for the star; a long chain for the
// raw vault.
export function Hook({ t }: StepCtx) {
  const rows: [string, string, number][] = [
    ['3NF', 'one join', 2],
    ['star', 'one join', 2],
    ['raw Data Vault', 'several joins', 5],
  ];
  return (
    <Svg label="three models, one question, three different costs" h={240}>
      {rows.map(([label, value, n], i) => {
        const k = easeOut(seg(t, 0.4 + i * 1.0, 0.9 + i * 1.0));
        const c = easeInOut(seg(t, 0.6 + i * 1.0, 1.4 + i * 1.0 + (n > 2 ? 0.6 : 0)));
        const y = 55 + i * 70;
        return (
          <g key={label}>
            <Row y={y} label={label} value={value} valueColor={n > 2 ? C.cherryText : C.crema} k={k} />
            <Chain x0={25} y={y + 14} n={n} k={c} f={() => (n > 2 ? C.cherryText : C.crema)} />
          </g>
        );
      })}
    </Svg>
  );
}

// 2 · Predict: does a hub hold descriptions? The hub holds a key; a name hovers beside it; then the question.
export function PredictHubContents({ t, answer }: StepCtx) {
  const k = easeOut(seg(t, 0.3, 0.7));
  return (
    <Svg label="a business key — descriptive data too?" h={210}>
      <Row y={40} label="a hub holds" value="the business key" k={easeOut(seg(t, 0.1, 0.5))} />
      <Tbl x={25} y={58} w={200} h={46} name="hub: customer" sub="business key" o={k} stroke={C.focus} />
      <Tbl x={lerp(420, 300, easeOut(seg(t, 0.8, 1.3)))} y={66} w={110} h={30} name="name" o={easeOut(seg(t, 0.8, 1.1))} />
      <AnswerRow y={140} label="descriptive data too" answer={answer} value="no, kept apart" k={easeOut(seg(t, 1.3, 1.8))} />
      <Verdict answer={answer} text="descriptions live in a table of their own" />
    </Svg>
  );
}

// 3 · Hubs. The hub holds only the key; a name and an address try to move in and bounce off, turning red.
export function RevealHubs({ t }: StepCtx) {
  const b = (i: number) => {
    const p = seg(t, 1.4 + i * 0.5, 2.4 + i * 0.5);
    return p < 0.5 ? easeOut(p * 2) : 1 - easeOut((p - 0.5) * 2) * 0.6;
  };
  return (
    <Svg label="business key only, low propensity to change" h={230}>
      <Row y={40} label="a hub holds" value="the business key" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="never holds" value="descriptive attributes" valueColor={C.cherryText} k={easeOut(seg(t, 2.6, 3.1))} />
      <Tbl x={25} y={130} w={220} h={50} name="hub: customer" sub="business key" o={easeOut(seg(t, 0.2, 0.6))} stroke={C.focus} />
      {['name', 'address'].map((l, i) => {
        const p = b(i);
        const hit = seg(t, 1.9 + i * 0.5, 2.0 + i * 0.5) > 0;
        return (
          <Tbl
            key={l}
            x={lerp(455, 260, p)}
            y={120 + i * 40}
            w={110}
            h={28}
            name={l}
            o={easeOut(seg(t, 1.2 + i * 0.5, 1.4 + i * 0.5))}
            stroke={hit ? C.cherryText : C.mocha}
            f={hit ? C.cherryText : C.crema}
          />
        );
      })}
    </Svg>
  );
}

/** The growing vault: hub customer, a link, hub order. `kh`, `kl`, `ko` bring each in. */
function Core({ y, kh, kl, ko }: { y: number; kh: number; kl: number; ko: number }) {
  return (
    <g>
      <Tbl x={25} y={y} w={150} h={34} name="hub: customer" o={kh} stroke={C.focus} />
      <line x1={175} y1={y + 17} x2={175 + 50 * kl} y2={y + 17} stroke={C.second} strokeWidth={2} />
      <Tbl x={225} y={y} w={150} h={34} name="link" o={kl} stroke={C.second} />
      <line x1={375} y1={y + 17} x2={375 + 50 * kl} y2={y + 17} stroke={C.second} strokeWidth={2} />
      <Tbl x={425} y={y} w={150} h={34} name="hub: order" o={ko} stroke={C.focus} />
    </g>
  );
}

// 4 · Links. A second hub arrives; the link is drawn between the two, and its grain is named by both keys.
export function RevealLinks({ t }: StepCtx) {
  const g = easeOut(seg(t, 2.6, 3.1));
  return (
    <Svg label="the relationship between hubs, often many-to-many" h={220}>
      <Row y={40} label="a link holds" value="the relationship itself" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="its grain" value="defined by the hub keys" valueColor={C.focus} k={easeOut(seg(t, 2.4, 2.9))} />
      <Core y={130} kh={easeOut(seg(t, 0.1, 0.4))} ko={easeOut(seg(t, 0.6, 1.0))} kl={easeInOut(seg(t, 1.1, 1.8))} />
      <T x={300} y={lerp(206, 200, g)} s={12} f={C.focus} a="middle" o={g}>
        grain: customer key + order key
      </T>
    </Svg>
  );
}

// 5 · Satellites. Under the customer hub, a satellite takes the descriptive attributes; each change appends a new row
// beside the last, and none is ever removed.
export function RevealSatellites({ t }: StepCtx) {
  const s = easeOut(seg(t, 0.5, 1.0));
  return (
    <Svg label="descriptive attributes, append-only history" h={240}>
      <Row y={40} label="a satellite holds" value="descriptive attributes" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="every change" value="appended, not overwritten" valueColor={C.focus} k={easeOut(seg(t, 2.0, 2.5))} />
      <Core y={115} kh={1} kl={1} ko={1} />
      <line x1={100} y1={149} x2={100} y2={149 + 26 * s} stroke={C.latte} strokeWidth={1.5} />
      <Tbl x={25} y={175} w={150} h={34} name="sat: address" o={s} />
      {[0, 1, 2].map((i) => {
        const k = easeOutBack(seg(t, 1.4 + i * 0.8, 1.8 + i * 0.8));
        return (
          <rect
            key={i}
            x={190 + i * 70}
            y={180}
            width={60}
            height={24}
            rx={4}
            fill={i === 2 ? C.focus : C.mocha}
            opacity={clamp(k) * (i === 2 ? 0.6 : 1)}
            transform={`translate(${((1 - clamp(k)) * 12).toFixed(1)} 0)`}
          />
        );
      })}
    </Svg>
  );
}

// 6 · Predict: separate loaders, no coordinator. Three loaders run into hub, link and satellite at once; then the question.
export function PredictParallelLoad({ t, answer }: StepCtx) {
  return (
    <Svg label="separate loaders, no coordinator" h={210}>
      <Row y={40} label="hub, link, satellite" value="loaded separately" k={easeOut(seg(t, 0.1, 0.5))} />
      {['hub', 'link', 'satellite'].map((l, i) => {
        const p = easeInOut(seg(t, 0.4, 1.3));
        return (
          <g key={l}>
            <circle cx={lerp(30, 180 + i * 150, p)} cy={68 + i * 14} r={4} fill={C.focus} opacity={p > 0 && p < 1 ? 1 : 0} />
            <Tbl x={140 + i * 150} y={58} w={120} h={26} name={l} o={easeOut(seg(t, 0.2, 0.5))} />
          </g>
        );
      })}
      <AnswerRow y={140} label="safe, no coordinator" answer={answer} value="only if keys agree" k={easeOut(seg(t, 1.3, 1.8))} />
      <Verdict answer={answer} text="each loader must derive the same key" />
    </Svg>
  );
}

// 7 · Determinism. Loader A and loader B, separately, put the same business key through MD5; both hashes come out
// identical, and a tick joins them.
export function RevealHashDeterminism({ t }: StepCtx) {
  const lane = (y: number, t0: number, label: string) => {
    const a = easeInOut(seg(t, t0, t0 + 0.4));
    const b = easeInOut(seg(t, t0 + 0.5, t0 + 0.9));
    const h = easeOut(seg(t, t0 + 0.9, t0 + 1.3));
    return (
      <g>
        <T x={25} y={y + 18} s={12} f={C.latte} o={easeOut(seg(t, t0 - 0.2, t0))}>
          {label}
        </T>
        <Tbl x={100} y={y} w={80} h={28} name="key '1'" o={easeOut(seg(t, t0 - 0.2, t0))} />
        <line x1={180} y1={y + 14} x2={180 + 30 * a} y2={y + 14} stroke={C.latte} strokeWidth={1.5} />
        <Tbl x={210} y={y} w={70} h={28} name="md5" o={a} />
        <line x1={280} y1={y + 14} x2={280 + 30 * b} y2={y + 14} stroke={C.latte} strokeWidth={1.5} />
        <T x={315} y={y + 19} s={12} f={C.focus} o={h}>
          c4ca4238a0b923…
        </T>
      </g>
    );
  };
  const eq = easeInOut(seg(t, 3.2, 3.7));
  return (
    <Svg label="two loaders, zero coordination, identical key" h={230}>
      <Row y={40} label="loader A hashes" value="the same business key" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="loader B's hash" value="identical, unprompted" valueColor={C.focus} k={easeOut(seg(t, 2.8, 3.3))} />
      {lane(115, 0.8, 'A')}
      {lane(180, 1.9, 'B')}
      <line x1={500} y1={130} x2={500} y2={130 + 63 * eq} stroke={C.focus} strokeWidth={2} />
      <Tick y={168} k={easeOut(seg(t, 3.6, 4.0))} />
    </Svg>
  );
}

// 8 · The dependency it removes. With a sequence key the child row must round-trip to the parent table before it can be
// written; with a hash key it computes its own and writes at once.
export function RevealSequenceDependency({ t }: StepCtx) {
  const go = seg(t, 0.8, 1.9);
  const dot = go < 0.5 ? lerp(145, 425, easeInOut(go * 2)) : lerp(425, 145, easeInOut((go - 0.5) * 2));
  const w1 = easeOut(seg(t, 2.0, 2.3));
  const h2 = easeInOut(seg(t, 2.6, 3.0));
  const w2 = easeOut(seg(t, 3.0, 3.3));
  return (
    <Svg label="a sequence forces a lookup. a hash key doesn't." h={230}>
      <Row y={40} label="sequence key" value="look up the parent first" valueColor={C.cherryText} k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="hash key" value="nothing to look up" valueColor={C.focus} k={easeOut(seg(t, 2.4, 2.9))} />
      <Tbl x={25} y={115} w={120} h={30} name="child row" o={easeOut(seg(t, 0.4, 0.7))} />
      <line x1={145} y1={130} x2={425} y2={130} stroke={C.mocha} strokeDasharray="4 4" opacity={easeOut(seg(t, 0.6, 0.8))} />
      <Tbl x={425} y={115} w={150} h={30} name="parent's key?" o={easeOut(seg(t, 0.6, 0.8))} stroke={C.cherryText} />
      {go > 0 && go < 1 && <circle cx={dot} cy={130} r={5} fill={C.cherryText} />}
      <T x={25} y={165} s={12} f={C.cherryText} o={w1}>
        then written
      </T>
      <Tbl x={25} y={180} w={120} h={30} name="child row" o={easeOut(seg(t, 2.4, 2.7))} />
      <line x1={145} y1={195} x2={145 + 55 * h2} y2={195} stroke={C.latte} strokeWidth={1.5} />
      <Tbl x={200} y={180} w={120} h={30} name="md5(key)" o={h2} stroke={C.focus} />
      <T x={340} y={200} s={12} f={C.focus} o={w2}>
        written at once
      </T>
    </Svg>
  );
}

// 9 · The measured join counts. 3NF and star each draw a one-join chain; the raw vault draws a four-join chain plus a
// lookup loop back on itself.
export function RevealJoinCounts({ t }: StepCtx) {
  const rows: [string, string, number][] = [
    ['3NF', 'one join', 2],
    ['star', 'one join', 2],
    ['raw Data Vault', 'four joins, one lookup', 5],
  ];
  const loop = easeInOut(seg(t, 3.6, 4.1));
  return (
    <Svg label="the same query, measured, three schemas" h={240}>
      {rows.map(([label, value, n], i) => {
        const k = easeOut(seg(t, 1.0 + i * 0.9, 1.5 + i * 0.9));
        const c = easeInOut(seg(t, 1.2 + i * 0.9, 1.8 + i * 0.9 + (n > 2 ? 0.6 : 0)));
        const y = 50 + i * 70;
        return (
          <g key={label}>
            <Row y={y} label={label} value={value} valueColor={n > 2 ? C.cherryText : C.crema} k={k} />
            <Chain x0={25} y={y + 14} n={n} k={c} f={() => (n > 2 ? C.cherryText : C.crema)} />
          </g>
        );
      })}
      <path d="M192 204 C 192 230 222 230 222 210" fill="none" stroke={C.cherryText} strokeWidth={1.5} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - loop} />
    </Svg>
  );
}

// 10 · Why it costs. One record splits into hub, link and satellite to load easily; to answer a query the three slide
// back together, each seam a join.
export function RevealWhyExpensive({ t }: StepCtx) {
  const sp = easeInOut(seg(t, 0.7, 1.5));
  const back = easeInOut(seg(t, 2.6, 3.4));
  const p = sp * (1 - back);
  const parts: [string, string][] = [
    ['hub', C.focus],
    ['link', C.second],
    ['satellite', C.latte],
  ];
  const seams = easeOut(seg(t, 3.4, 3.8));
  return (
    <Svg label="split apart to load easily, rejoined to query" h={220}>
      <Row y={40} label="easy to load" value="kept in separate tables" k={easeOut(seg(t, 0.4, 0.9))} />
      <Row y={85} label="expensive to query" value="same split, at read time" valueColor={C.cherryText} k={easeOut(seg(t, 2.4, 2.9))} />
      {parts.map(([l, f], i) => {
        const x = lerp(150 + i * 100, 25 + i * 200, p);
        return <Tbl key={l} x={x} y={140} w={i === 2 ? 100 : 100} h={34} name={l} o={easeOut(seg(t, 0.2, 0.5))} stroke={f} />;
      })}
      {[0, 1].map((i) => (
        <circle key={i} cx={250 + i * 100} cy={157} r={7 * seams} fill={C.cherryText} />
      ))}
    </Svg>
  );
}

// 11 · The point-in-time table. The raw five-table chain with its lookup loop; the last two tables fold into one
// point-in-time table, and the loop disappears: three joins.
export function RevealPITImprovement({ t }: StepCtx) {
  const f = easeInOut(seg(t, 1.2, 2.2));
  const loop = 1 - easeInOut(seg(t, 2.6, 3.2));
  const names = ['hub', 'sat', 'link', 'hub', 'sat'];
  return (
    <Svg label="resolved once, at load time, instead of every query" h={230}>
      <Row y={40} label="with a point-in-time table" value="three joins" k={easeOut(seg(t, 2.2, 2.7))} />
      <Row y={85} label="correlated lookup" value="gone from the query" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
      {names.map((n, i) => {
        const x = i < 3 ? 40 + i * 110 : i === 3 ? lerp(370, 395, f) : lerp(480, 395, f);
        const last = i >= 3;
        return (
          <g key={i} opacity={easeOut(seg(t, 0.2, 0.6)) * (last ? 1 - f : 1)}>
            <rect x={x} y={140} width={60} height={30} rx={4} fill={C.cocoa} stroke={C.latte} />
            <T x={x + 30} y={160} s={11} f={C.crema} a="middle">
              {n}
            </T>
          </g>
        );
      })}
      {[0, 1, 2].map((i) => (
        <line key={i} x1={100 + i * 110} y1={155} x2={150 + i * 110} y2={155} stroke={C.latte} strokeWidth={1.5} opacity={easeOut(seg(t, 0.2, 0.6))} />
      ))}
      <line x1={430} y1={155} x2={480} y2={155} stroke={C.latte} strokeWidth={1.5} opacity={easeOut(seg(t, 0.2, 0.6)) * (1 - f)} />
      <g opacity={f}>
        <rect x={395} y={140} width={80} height={30} rx={4} fill={C.cocoa} stroke={C.focus} strokeWidth={2} />
        <T x={435} y={160} s={11} f={C.focus} a="middle">
          pit
        </T>
      </g>
      <path d="M510 170 C 510 200 545 200 545 170 C 545 150 525 145 515 160" fill="none" stroke={C.cherryText} strokeWidth={1.5} opacity={easeOut(seg(t, 0.4, 0.8)) * loop} />
      <T x={528} y={212} s={11} f={C.cherryText} a="middle" o={easeOut(seg(t, 0.4, 0.8)) * loop}>
        lookup
      </T>
    </Svg>
  );
}

// 12 · Bridge tables. A point-in-time table brackets one satellite's history; a bridge sweeps across a whole path of
// hubs and links and collapses it into one row.
export function RevealBridgeTable({ t }: StepCtx) {
  const br = easeInOut(seg(t, 1.0, 1.6));
  const sw = easeInOut(seg(t, 2.6, 3.4));
  return (
    <Svg label="one satellite's history vs. several links at once" h={240}>
      <Row y={40} label="point-in-time table" value="one satellite's history" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="bridge table" value="several links at once" valueColor={C.second} k={easeOut(seg(t, 2.2, 2.7))} />
      <rect x={25} y={118} width={60} height={28} rx={4} fill={C.cocoa} stroke={C.focus} opacity={easeOut(seg(t, 0.4, 0.7))} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={100 + i * 60} y={122} width={50} height={20} rx={3} fill={C.mocha} opacity={easeOut(seg(t, 0.5 + i * 0.1, 0.8 + i * 0.1))} />
      ))}
      <path d={`M95 152 l0 6 l${180 * br} 0 l0 -6`} fill="none" stroke={C.focus} strokeWidth={2} opacity={br > 0 ? 1 : 0} />
      <T x={185} y={176} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 1.5, 1.8))}>
        pit
      </T>
      {[0, 1, 2, 3, 4].map((i) => {
        const hub = i % 2 === 0;
        const x = 25 + i * 115;
        return (
          <g key={i} opacity={easeOut(seg(t, 2.2 + i * 0.05, 2.5 + i * 0.05)) * (1 - 0.6 * sw)}>
            {i > 0 && <line x1={x - 55} y1={207} x2={x} y2={207} stroke={C.latte} strokeWidth={1.5} />}
            <rect x={x} y={195} width={60} height={24} rx={4} fill={C.cocoa} stroke={hub ? C.focus : C.second} />
            <T x={x + 30} y={211} s={11} f={C.crema} a="middle">
              {hub ? 'hub' : 'link'}
            </T>
          </g>
        );
      })}
      <rect x={25} y={192} width={545 * sw} height={30} rx={5} fill={C.second} opacity={0.25 * sw} stroke={C.second} />
      <T x={300} y={lerp(244, 238, easeOut(seg(t, 3.3, 3.7)))} s={11} f={C.second} a="middle" o={easeOut(seg(t, 3.3, 3.7))}>
        bridge: the whole path, one row
      </T>
    </Svg>
  );
}

// 13 · Worth it. History rows keep appending and none is ever deleted; then a new source arrives as new tables of its
// own beside the old ones, which stay untouched.
export function RevealWorthIt({ t }: StepCtx) {
  const ns = easeOut(seg(t, 2.6, 3.2));
  return (
    <Svg label="auditability and source agility, measured against the cost" h={240}>
      <Row y={40} label="every change" value="preserved, nothing deleted" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={85} label="a new source" value="adds tables, not a redesign" valueColor={C.focus} k={easeOut(seg(t, 2.4, 2.9))} />
      <Tbl x={25} y={120} w={150} h={30} name="hub: customer" o={easeOut(seg(t, 0.2, 0.5))} stroke={C.focus} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={25} y={160 + i * 16} width={150} height={12} rx={3} fill={C.mocha} opacity={easeOut(seg(t, 0.6 + i * 0.35, 0.9 + i * 0.35))} />
      ))}
      <g opacity={ns} transform={`translate(${((1 - ns) * 30).toFixed(1)} 0)`}>
        <line x1={175} y1={135} x2={330} y2={135} stroke={C.focus} strokeWidth={1.5} strokeDasharray="4 3" />
        <Tbl x={330} y={120} w={245} h={30} name="sat: new source" stroke={C.focus} />
        {[0, 1].map((i) => (
          <rect key={i} x={330} y={160 + i * 16} width={245} height={12} rx={3} fill={C.focus} opacity={0.5} />
        ))}
      </g>
    </Svg>
  );
}

// 14 · Recap. Three rows land one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="hub, link, satellite; hash keys; a measured join cost" h={220}>
      <Row y={50} label="hub, link, satellite" value="key, relation, history" k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={110} label="hash keys" value="no coordinator needed" k={easeOut(seg(t, 1.4, 1.9))} />
      <Row y={170} label="the tradeoff" value="auditability vs. a counted cost" valueColor={C.focus} k={easeOut(seg(t, 2.6, 3.1))} />
    </Svg>
  );
}

// 15 · Prove: least redesign. The vault's core; after the answer a new satellite for the new source attaches beside it,
// nothing else moves, and the verdict lands with a tick.
export function ProveDataVaultChoice({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const ns = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const k = answer !== null ? easeOut(seg(s, 0.6, 1.0)) : 0;
  const tick = answer !== null ? easeOut(seg(s, 1.0, 1.4)) : 0;
  return (
    <Svg label="a new source, a different key — least redesign?" h={230}>
      <Row y={40} label="a new source" value="a different key definition" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="least redesign" answer={answer} value="the Data Vault" k={easeOut(seg(t, 0.4, 0.9))} />
      <Core y={112} kh={easeOut(seg(t, 0.5, 0.9))} kl={easeOut(seg(t, 0.6, 1.0))} ko={easeOut(seg(t, 0.7, 1.1))} />
      <g opacity={ns}>
        <line x1={100} y1={146} x2={100} y2={152} stroke={C.focus} strokeWidth={1.5} />
        <Tbl x={25} y={152} w={150} h={22} name="sat: new source" stroke={C.focus} />
      </g>
      {answer !== null && (
        <>
          <T x={300} y={lerp(206, 198, k)} s={15} f={C.focus} a="middle" o={k}>
            new tables beside, nothing rebuilt
          </T>
          <rect x={160} y={210} width={280 * tick} height={3} fill={C.focus} />
          <Tick y={186} k={tick} />
        </>
      )}
    </Svg>
  );
}
