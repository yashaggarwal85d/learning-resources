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

/** Ten heap pages, each with its visibility-map bit; `bit(i)` colours the bit, `lit(i)` outlines a visited page. */
function Pages({ y, bit, lit, o = 1 }: { y: number; bit: (i: number) => string; lit?: (i: number) => boolean; o?: number }) {
  return (
    <g opacity={o}>
      {Array.from({ length: 10 }, (_, i) => (
        <g key={i}>
          <rect x={25 + i * 55} y={y} width={48} height={36} rx={3} fill={C.cocoa} stroke={lit?.(i) ? C.cherryText : C.mocha} strokeWidth={lit?.(i) ? 2 : 1} />
          <rect x={31 + i * 55} y={y + 6} width={10} height={10} rx={2} fill={bit(i)} />
        </g>
      ))}
    </g>
  );
}

// 1 · Hook. The covering index's 855 buffers is a sliver; 20,809 grows across.
export function Hook({ t }: StepCtx) {
  const k = (i: number) => easeOut(seg(t, 0.2 + i * 1.2, 1.1 + i * 1.2));
  return (
    <Svg label="same filter, same column back — one extra column indexed" h={370}>
      {timeBar(30, 90, 855 / 20809, '855 buffers', 'with INCLUDE', C.focus, k(0))}
      {timeBar(30, 210, 20809 / 20809, '20,809 buffers', 'without INCLUDE', C.cherryText, k(1))}
    </Svg>
  );
}

// 2 · Predict: why index an unfiltered column. After the answer the "?" fills in and the verdict slides in.
export function PredictWhyExtraColumn({ t, answer }: StepCtx) {
  return (
    <Svg label="amount isn't filtered on — why index it?" h={210}>
      <Row y={70} label="filter column" value="status" k={easeOut(seg(t, 0.1, 0.6))} />
      <AnswerRow y={130} label="selected column" answer={answer} value="amount, in the index" k={easeOut(seg(t, 0.5, 1.0))} />
      <Verdict answer={answer} text="now the index can answer the query alone" />
    </Svg>
  );
}

// 3 · Index-only scan. The index reaches across to the table; then the payload column lights inside the index,
// the reach is withdrawn, and the table greys out.
export function RevealIncludeScan({ t }: StepCtx) {
  const boxes = easeOut(seg(t, 0.1, 0.5));
  const reach = easeInOut(seg(t, 0.4, 1.0));
  const pay = easeOut(seg(t, 1.2, 1.6));
  const back = easeInOut(seg(t, 1.6, 2.2));
  const len = 150 * reach * (1 - back);
  return (
    <Svg label="the index alone answers the whole query" h={190}>
      <Row y={40} label="plan" value="Index Only Scan" valueColor={C.focus} k={easeOut(seg(t, 2.2, 2.7))} />
      <Row y={90} label="Heap Fetches" value="0" valueColor={C.focus} k={easeOut(seg(t, 2.6, 3.1))} />
      <g opacity={boxes}>
        <rect x={25} y={120} width={200} height={50} rx={6} fill={C.cocoa} stroke={pay > 0 ? C.focus : C.mocha} />
        <rect x={37} y={134} width={80} height={22} rx={3} fill={C.mocha} />
        <T x={77} y={150} s={12} f={C.crema} a="middle">
          status
        </T>
        <rect x={125} y={134} width={88} height={22} rx={3} fill={pay > 0 ? C.focus : C.cocoa} stroke={C.focus} opacity={pay > 0 ? 1 : 0.3} />
        <T x={169} y={150} s={12} f={pay > 0 ? C.ink : C.latte} a="middle">
          amount
        </T>
        <g opacity={1 - 0.6 * back}>
          <rect x={375} y={120} width={200} height={50} rx={6} fill={C.cocoa} stroke={C.mocha} />
          <T x={475} y={150} s={13} f={C.latte} a="middle">
            table
          </T>
        </g>
      </g>
      {len > 0 && <line x1={225} y1={145} x2={225 + len} y2={145} stroke={C.latte} strokeWidth={2} strokeDasharray="5 4" />}
    </Svg>
  );
}

// 4 · The visibility map. Each page's bit sets; then the scan checks the bits along the row without opening a page.
export function RevealVisibilityMap({ t }: StepCtx) {
  const scan = seg(t, 2.4, 3.6) * 10;
  return (
    <Svg label="one bit per heap page makes the shortcut safe" h={190}>
      <Row y={40} label="visibility map bit" value="set = all visible" valueColor={C.focus} k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={85} label="index-only scan" value="trusts that bit" k={easeOut(seg(t, 2.0, 2.5))} />
      <Pages y={120} o={easeOut(seg(t, 0.3, 0.7))} bit={(i) => (t >= 0.8 + i * 0.1 ? C.focus : C.mocha)} />
      {scan > 0 && scan < 10 && <rect x={25 + scan * 55} y={114} width={2} height={48} fill={C.focus} />}
      {Array.from({ length: 10 }, (_, i) => (scan > i + 0.5 ? <circle key={i} cx={36 + i * 55} cy={131} r={8} fill="none" stroke={C.focus} strokeWidth={1.5} /> : null))}
    </Svg>
  );
}

// 5 · Predict: does it survive an update. After the answer the "?" fills in and the verdict slides in.
export function PredictSurvivesUpdate({ t, answer }: StepCtx) {
  return (
    <Svg label="UPDATE every matching row — same index" h={210}>
      <Row y={70} label="index structure" value="unchanged" k={easeOut(seg(t, 0.1, 0.6))} />
      <AnswerRow y={130} label="index-only scan advantage" answer={answer} value="lost" f={C.cherryText} k={easeOut(seg(t, 0.5, 1.0))} />
      <Verdict answer={answer} text="the update clears the visibility bits" />
    </Svg>
  );
}

// 6 · Heap fetches jump. The update clears every bit; the after-count runs up as the scan now opens every page.
export function RevealHeapFetchesJump({ t }: StepCtx) {
  const c = easeOut(seg(t, 1.8, 3.2));
  const open = seg(t, 1.8, 3.2) * 10;
  return (
    <Svg label="same index, same query — after the update" h={190}>
      <Row y={40} label="Heap Fetches, before" value="0" valueColor={C.focus} k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={85} label="Heap Fetches, after" value={num(444014 * c)} valueColor={C.cherryText} k={easeOut(seg(t, 1.6, 2.1))} />
      <Pages y={120} bit={(i) => (t >= 0.8 + i * 0.07 ? C.cherryText : C.focus)} lit={(i) => open > i + 0.5} />
    </Svg>
  );
}

// 7 · VACUUM. A pass sweeps the pages and sets each bit again; the index is never touched.
export function RevealVacuumRestores({ t }: StepCtx) {
  const sw = seg(t, 0.6, 2.0) * 10;
  return (
    <Svg label="VACUUM — the index never moved" h={190}>
      <Row y={40} label="Heap Fetches, after VACUUM" value="0" valueColor={C.focus} k={easeOut(seg(t, 2.2, 2.7))} />
      <Row y={85} label="the index itself" value="untouched" k={easeOut(seg(t, 2.8, 3.3))} />
      <Pages y={120} bit={(i) => (sw > i + 0.5 ? C.focus : C.cherryText)} />
      {sw > 0 && sw < 10 && <rect x={25 + sw * 55} y={114} width={2} height={48} fill={C.focus} />}
    </Svg>
  );
}

// 8 · Predict: the hot subset. A hundred-cell strip fills in: 98 common, 2 rare. After the answer the verdict slides in.
export function PredictHotSubset({ t, answer }: StepCtx) {
  const n = Math.round(100 * easeInOut(seg(t, 0.6, 1.6)));
  return (
    <Svg label="98% one value, 2% what queries search for" h={230}>
      <Row y={50} label="common value" value="98% of rows" k={easeOut(seg(t, 0.1, 0.6))} />
      <Row y={100} label="rare, searched-for value" value="2% of rows" valueColor={C.focus} k={easeOut(seg(t, 0.4, 0.9))} />
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={25 + i * 5.5} y={125} width={4} height={22} fill={i >= 98 ? C.focus : C.mocha} />
      ))}
      <Verdict answer={answer} text="yes: index only the rare slice" y={200} />
    </Svg>
  );
}

// 9 · Partial index size. The partial index's bar is a sliver; the full index's bar grows across.
export function RevealPartialIndex({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 1.2));
  const b = easeOut(seg(t, 1.6, 2.6));
  return (
    <Svg label="indexing only the rare 2%" h={180}>
      <Row y={40} label="partial index" value={`${num(896 * a)} KB`} valueColor={C.focus} k={easeOut(seg(t, 0.2, 0.7))} />
      <rect x={25} y={54} width={Math.max(a > 0 ? 3 : 0, 550 * (896 / (43 * 1024)) * a)} height={10} rx={3} fill={C.focus} />
      <Row y={115} label="full index, same column" value={`${num(43 * b)} MB`} valueColor={C.cherryText} k={easeOut(seg(t, 1.4, 1.9))} />
      <rect x={25} y={129} width={550 * b} height={10} rx={3} fill={C.cherryText} opacity={0.85} />
    </Svg>
  );
}

// 10 · Writes skip it. Writes land on common rows and the partial index stays dark; a write on a rare row lights it.
export function RevealPartialWriteSaving({ t }: StepCtx) {
  const writes: [number, number][] = [
    [6, 1.0],
    [19, 1.5],
    [33, 2.0],
    [49, 2.8],
  ];
  const flash = t >= 2.8 && t < 3.6 ? 1 : 0;
  const lit = t >= 2.8;
  return (
    <Svg label="writes to the common 98% touch nothing here" h={220}>
      <Row y={40} label="write to the common 98%" value="nothing to update" valueColor={C.focus} k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={85} label="write to the rare 2%" value="index updates" k={easeOut(seg(t, 2.4, 2.9))} />
      {Array.from({ length: 50 }, (_, i) => (
        <rect key={i} x={25 + i * 11} y={125} width={9} height={20} fill={i >= 49 ? C.focus : C.mocha} opacity={easeOut(seg(t, 0.3, 0.7))} />
      ))}
      {writes.map(([i, at]) => {
        const k = easeOutBack(seg(t, at, at + 0.35));
        return <path key={i} d={`M${29.5 + i * 11 - 6} ${118 - 6 * k} l6 8 l6 -8 z`} fill={i >= 49 ? C.focus : C.latte} opacity={clamp(k, 0, 1)} />;
      })}
      <rect x={200} y={168} width={200} height={34} rx={6} fill={lit ? C.cocoa : 'none'} stroke={lit ? C.focus : C.mocha} strokeWidth={1 + flash} opacity={easeOut(seg(t, 0.5, 0.9))} />
      <T x={300} y={190} s={13} f={lit ? C.focus : C.latte} a="middle" o={easeOut(seg(t, 0.5, 0.9))}>
        partial index
      </T>
    </Svg>
  );
}

// 11 · Predict: expression match. After the answer the verdict slides in.
export function PredictExpressionMatch({ t, answer }: StepCtx) {
  return (
    <Svg label="same value, two different expressions" h={210}>
      <Row y={70} label="indexed expression" value="a || ' ' || b" k={easeOut(seg(t, 0.1, 0.6))} />
      <Row y={130} label="query expression" value="concat(a, ' ', b) — ?" k={easeOut(seg(t, 0.5, 1.0))} />
      <Verdict answer={answer} text="no: only the exact expression counts" f={C.cherryText} />
    </Svg>
  );
}

// 12 · Expression mismatch. The exact expression's time is a sliver; the concat() version's grows across.
export function RevealExpressionMismatch({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 1.2));
  const b = easeOut(seg(t, 1.6, 2.8));
  return (
    <Svg label="exact match vs. concat() instead of ||" h={180}>
      <Row y={40} label="exact expression" value={`${num(0.043 * a, 3)} ms`} valueColor={C.focus} k={easeOut(seg(t, 0.2, 0.7))} />
      <rect x={25} y={54} width={a > 0 ? 3 : 0} height={10} rx={2} fill={C.focus} />
      <Row y={115} label="concat() instead" value={`${num(399.183 * b, 3)} ms`} valueColor={C.cherryText} k={easeOut(seg(t, 1.4, 1.9))} />
      <rect x={25} y={129} width={550 * b} height={10} rx={3} fill={C.cherryText} opacity={0.85} />
    </Svg>
  );
}

// 13 · Syntax, not semantics. The two written expressions sit side by side, a red ≠ lands between them, and only
// then the shared result they both compute fades in underneath, ignored.
export function RevealSyntaxNotSemantics({ t }: StepCtx) {
  const chips = easeOut(seg(t, 1.0, 1.4));
  const ne = easeOutBack(seg(t, 1.8, 2.2));
  const res = easeOut(seg(t, 2.8, 3.4));
  return (
    <Svg label="the planner matches text, not computed value" h={230}>
      <Row y={40} label="planner compares" value="the written expression" k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={85} label="planner ignores" value="the resulting value" valueColor={C.cherryText} k={easeOut(seg(t, 2.6, 3.1))} />
      <g opacity={chips}>
        <rect x={25} y={115} width={235} height={34} rx={6} fill={C.cocoa} stroke={C.mocha} />
        <T x={142} y={137} s={13} f={C.crema} a="middle">
          a || ' ' || b
        </T>
        <rect x={340} y={115} width={235} height={34} rx={6} fill={C.cocoa} stroke={C.mocha} />
        <T x={457} y={137} s={13} f={C.crema} a="middle">
          concat(a, ' ', b)
        </T>
      </g>
      <g transform={`translate(300 132) scale(${Math.max(0, ne)}) translate(-300 -132)`} opacity={clamp(ne, 0, 1)}>
        <T x={300} y={140} s={22} f={C.cherryText} a="middle" w={700}>
          ≠
        </T>
      </g>
      <g opacity={res * 0.6}>
        <line x1={142} y1={149} x2={270} y2={182} stroke={C.mocha} />
        <line x1={457} y1={149} x2={330} y2={182} stroke={C.mocha} />
        <rect x={230} y={182} width={140} height={28} rx={6} fill="none" stroke={C.mocha} strokeDasharray="4 3" />
        <T x={300} y={201} s={12} f={C.latte} a="middle">
          same value
        </T>
      </g>
    </Svg>
  );
}

// 14 · Recap. Four lines rise in one per beat; the last is the one to remember.
export function Recap({ t }: StepCtx) {
  const lines = [
    'INCLUDE makes an index-only scan possible',
    'the visibility map decides if it pays off',
    'a partial index shrinks size and write cost',
    'an expression index matches syntax, not meaning',
  ];
  return (
    <Svg label="recap: what an index needs to visit at all" h={240}>
      {lines.map((l, i) => {
        const k = easeOut(seg(t, 0.2 + i * 0.7, 0.7 + i * 0.7));
        return (
          <T key={l} x={300} y={55 + i * 42 + (1 - k) * 8} s={14} f={i === lines.length - 1 ? C.focus : C.crema} a="middle" o={k}>
            {l}
          </T>
        );
      })}
    </Svg>
  );
}

// 15 · Prove: did the index change. After the answer the verdict slides in with rule and tick.
export function ProveHeapFetchesChange({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const k = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const tick = answer !== null ? easeOut(seg(s, 0.6, 1.0)) : 0;
  return (
    <Svg label="Heap Fetches: 0 → 50,000 — did the index change?" h={220}>
      <Row y={70} label="Monday" value="Heap Fetches: 0" valueColor={C.focus} k={easeOut(seg(t, 0.1, 0.6))} />
      <Row y={130} label="Friday, same index" value="Heap Fetches: 50,000" valueColor={C.cherryText} k={easeOut(seg(t, 0.5, 1.0))} />
      {answer !== null && (
        <>
          <T x={300} y={lerp(192, 180, k)} s={15} f={C.focus} a="middle" o={k}>
            no: the visibility map was cleared
          </T>
          <rect x={140} y={192} width={320 * tick} height={3} fill={C.focus} />
          <Tick y={165} k={tick} />
        </>
      )}
    </Svg>
  );
}
