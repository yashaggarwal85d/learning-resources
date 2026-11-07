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

/** A row of small value cells starting at `x`, each fading in on its own beat after `t0`. */
function Cells({
  x,
  y,
  w = 40,
  gap = 6,
  vals,
  t,
  t0,
  dt = 0.12,
  stroke = C.mocha,
  f = C.crema,
  hi = -1,
  hiF = C.focus,
}: {
  x: number;
  y: number;
  w?: number;
  gap?: number;
  vals: string[];
  t: number;
  t0: number;
  dt?: number;
  stroke?: string;
  f?: string;
  hi?: number;
  hiF?: string;
}) {
  return (
    <g>
      {vals.map((v, i) => (
        <Cell key={i} x={x + i * (w + gap)} y={y} w={w} label={v} o={easeOut(seg(t, t0 + i * dt, t0 + i * dt + 0.3))} stroke={i === hi ? hiF : stroke} f={i === hi ? hiF : f} />
      ))}
    </g>
  );
}

// 1 · Hook. An "Arrow-backed" tag drops onto the pandas 3.0 box; below sit Arrow's own buffers, and the link between the two
// is drawn dashed with an open question.
export function Hook({ t }: StepCtx) {
  const d = easeOut(seg(t, 0.8, 1.4));
  return (
    <Svg label="the first library built on arrow — do its own changes actually come from those buffers?" h={220}>
      <Row y={40} label="pandas 3.0, Arrow-backed" value="in name only?" k={easeOut(seg(t, 0.3, 0.8))} />
      <Cell x={25} y={80} w={180} label="pandas 3.0" o={easeOut(seg(t, 0.4, 0.7))} />
      <Cell x={215} y={lerp(60, 80, d)} w={140} label="Arrow-backed" stroke={C.second} f={C.second} o={d} />
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={25 + i * 42} y={160} width={36} height={18} rx={2} fill={i < 2 ? C.second : C.mocha} opacity={0.8 * easeOut(seg(t, 1.6 + i * 0.06, 1.9 + i * 0.06))} />
      ))}
      <T x={375} y={174} s={11} f={C.latte} o={easeOut(seg(t, 1.8, 2.1))}>
        Arrow buffers
      </T>
      <line x1={285} y1={110} x2={285} y2={154} stroke={C.focus} strokeWidth={1.5} strokeDasharray="4 4" opacity={easeOut(seg(t, 2.4, 2.8))} />
      <T x={300} y={138} s={18} f={C.focus} o={easeOut(seg(t, 2.8, 3.2))}>
        ?
      </T>
    </Svg>
  );
}

// 2 · A default string dtype. The same list of strings infers two different types: the old catch-all object, crossed out,
// and the new dedicated str beside it.
export function RevealDefaultStringDtype({ t }: StepCtx) {
  return (
    <Svg label="a plain list of strings now infers its own dedicated type, not the old catch-all one" h={220}>
      <Row y={40} label="a list of strings" value="its own type now" k={easeOut(seg(t, 0.3, 0.8))} />
      <Cell x={25} y={62} w={300} label='pd.Series(["a", "b", "c"])' o={easeOut(seg(t, 0.5, 0.9))} />
      <Cell x={25} y={118} w={200} label="before: object" f={C.latte} o={easeOut(seg(t, 1.2, 1.6))} />
      <Cross x={240} y={132} k={easeOut(seg(t, 1.8, 2.1))} />
      <Cell x={300} y={118} w={200} label="now: str" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 2.3, 2.7))} />
      <Row y={200} label="str is built on" value="Arrow buffers" valueColor={C.second} k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 3 · Predict: which missing marker? The strict <NA> on one side, the loose nan on the other, and str between them; then the
// question.
export function PredictSentinelMatch({ t, answer }: StepCtx) {
  return (
    <Svg label="backed by the strict buffers — does its missing marker match the strict tools, or the old loose one?" h={210}>
      <Row y={40} label="str's missing marker" value="strict or loose?" k={easeOut(seg(t, 0.1, 0.5))} />
      <Cell x={25} y={62} w={160} label="strict: <NA>" o={easeOut(seg(t, 0.3, 0.6))} />
      <Cell x={415} y={62} w={160} label="loose: nan" o={easeOut(seg(t, 0.5, 0.8))} />
      <Cell x={240} y={62} w={120} label="str" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 0.7, 1.0))} />
      <AnswerRow y={140} label="the strict <NA>" answer={answer} value="no, the loose nan" k={easeOut(seg(t, 1.2, 1.7))} />
      <Verdict answer={answer} text="kept on purpose, so old checks still work" />
    </Svg>
  );
}

// 4 · Copy-on-write. df["a"] and a subset point at the same three cells; the subset is written to, and only then does it get
// its own copy, 999 in front, while the original keeps 1, 2, 3.
export function RevealCopyOnWrite({ t }: StepCtx) {
  const c = easeInOut(seg(t, 1.8, 2.6));
  return (
    <Svg label="a subset shares the same memory as the original, right up until it gets mutated" h={240}>
      <Row y={40} label="before a write" value="shared memory" k={easeOut(seg(t, 0.3, 0.8))} />
      <T x={25} y={92} s={12} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        df["a"]
      </T>
      <Cells x={200} y={74} vals={['1', '2', '3']} t={t} t0={0.4} />
      <T x={25} y={152} s={12} f={C.latte} o={easeOut(seg(t, 0.9, 1.2))}>
        subset
      </T>
      <path d="M90 146 L195 96" stroke={C.second} strokeWidth={1.5} fill="none" opacity={easeOut(seg(t, 1.0, 1.3)) * (1 - c)} />
      <g opacity={c} transform={`translate(0 ${lerp(-60, 0, c).toFixed(1)})`}>
        <Cells x={200} y={134} vals={['999', '2', '3']} t={t} t0={1.8} dt={0} hi={0} />
      </g>
      <path d="M90 146 H195" stroke={C.second} strokeWidth={1.5} fill="none" opacity={easeOut(seg(t, 2.5, 2.8))} />
      <T x={360} y={152} s={11} f={C.focus} o={easeOut(seg(t, 2.6, 2.9))}>
        copied on the write
      </T>
      <Row y={220} label="the original" value="still 1, 2, 3" valueColor={C.focus} k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 5 · Chained assignment. The 99s land in a temporary copy, never in df["b"], which keeps 4, 5, 6; then the old warning's name
// is crossed out and the new error stands beside it.
export function RevealChainedAssignment({ t }: StepCtx) {
  return (
    <Svg label="the two-step shortcut never silently works — measured, and a different warning replaces the old one" h={250}>
      <Row y={40} label='df[mask]["b"] = 99' value="original unchanged" k={easeOut(seg(t, 0.3, 0.8))} />
      <T x={25} y={82} s={12} f={C.latte} o={easeOut(seg(t, 0.6, 0.9))}>
        temporary copy
      </T>
      <Cells x={200} y={64} vals={['99', '99']} t={t} t0={0.8} stroke={C.latte} f={C.latte} />
      <T x={25} y={124} s={12} f={C.latte} o={easeOut(seg(t, 1.3, 1.6))}>
        df["b"]
      </T>
      <Cells x={200} y={106} vals={['4', '5', '6']} t={t} t0={1.4} stroke={C.focus} f={C.focus} />
      <Tick y={120} k={easeOut(seg(t, 1.9, 2.3))} />
      <Cell x={25} y={158} w={250} label="SettingWithCopyWarning" f={C.latte} o={easeOut(seg(t, 2.4, 2.7))} />
      <Cross x={288} y={172} k={easeOut(seg(t, 2.8, 3.1))} />
      <Cell x={310} y={158} w={265} label="ChainedAssignmentError" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 3.1, 3.5))} />
      <Row y={230} label="the old warning" value="replaced" valueColor={C.focus} k={easeOut(seg(t, 3.6, 4.1))} />
    </Svg>
  );
}

// 6 · Two string dtypes. Side by side, the default and string[pyarrow] hold the same a, b and a missing value; their type names
// differ, and their third cells show nan against <NA>.
export function RevealTwoStringDtypes({ t }: StepCtx) {
  return (
    <Svg label="two similarly-named string types, measured side by side — different names, different markers" h={220}>
      <T x={25} y={40} s={12} f={C.latte} o={easeOut(seg(t, 0.3, 0.6))}>
        the default
      </T>
      <T x={325} y={40} s={12} f={C.latte} o={easeOut(seg(t, 0.3, 0.6))}>
        string[pyarrow]
      </T>
      <Cell x={25} y={54} w={200} label="dtype: str" stroke={C.second} f={C.second} o={easeOut(seg(t, 0.7, 1.0))} />
      <Cell x={325} y={54} w={200} label="dtype: string" stroke={C.second} f={C.second} o={easeOut(seg(t, 1.0, 1.3))} />
      <Cells x={25} y={104} w={60} vals={['a', 'b', 'nan']} t={t} t0={1.5} hi={2} />
      <Cells x={325} y={104} w={60} vals={['a', 'b', '<NA>']} t={t} t0={1.8} hi={2} hiF={C.second} />
      <Row y={190} label="two Arrow strings" value="different markers" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
    </Svg>
  );
}

// 7 · Numeric sentinels match. Int64 on NumPy storage and int64[pyarrow] on Arrow buffers; both third cells show <NA>, joined by
// an equals sign and a tick.
export function RevealNumericSentinelMatch({ t }: StepCtx) {
  return (
    <Svg label="old storage, new buffers — the same missing-value marker either way, measured identical" h={220}>
      <T x={25} y={40} s={12} f={C.latte} o={easeOut(seg(t, 0.3, 0.6))}>
        Int64, NumPy storage
      </T>
      <T x={325} y={40} s={12} f={C.latte} o={easeOut(seg(t, 0.3, 0.6))}>
        int64[pyarrow]
      </T>
      <Cells x={25} y={54} w={60} vals={['1', '2', '<NA>']} t={t} t0={0.8} hi={2} />
      <Cells x={325} y={54} w={60} vals={['1', '2', '<NA>']} t={t} t0={1.2} hi={2} />
      <T x={279} y={74} s={18} f={C.focus} a="middle" o={easeOut(seg(t, 2.0, 2.4))}>
        =
      </T>
      <Tick y={66} k={easeOut(seg(t, 2.4, 2.8))} />
      <Row y={140} label="missing marker" value="<NA> on both" valueColor={C.focus} k={easeOut(seg(t, 2.8, 3.3))} />
      <Row y={190} label="what decides it" value="strictly nullable" k={easeOut(seg(t, 3.5, 4.0))} />
    </Svg>
  );
}

// 8 · Datetime resolution. The old rule, always nanoseconds, is crossed out; then two real inputs get their own resolutions: a
// date string to microseconds, whole seconds to seconds.
export function RevealMicrosecondResolution({ t }: StepCtx) {
  return (
    <Svg label="resolution now follows what the input actually carries, instead of always assuming the finest one" h={230}>
      <Cell x={25} y={30} w={220} label="before: always ns" f={C.latte} o={easeOut(seg(t, 0.3, 0.7))} />
      <Cross x={262} y={44} k={easeOut(seg(t, 0.9, 1.2))} />
      <Cell x={25} y={86} w={250} label='"2024-03-22 11:36"' o={easeOut(seg(t, 1.3, 1.7))} />
      <path d="M280 100 H330" stroke={C.latte} strokeWidth={1.5} opacity={easeOut(seg(t, 1.7, 2.0))} />
      <Cell x={335} y={86} w={200} label="datetime64[us]" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 2.0, 2.4))} />
      <Cell x={25} y={136} w={250} label="0, unit='s'" o={easeOut(seg(t, 2.4, 2.8))} />
      <path d="M280 150 H330" stroke={C.latte} strokeWidth={1.5} opacity={easeOut(seg(t, 2.8, 3.1))} />
      <Cell x={335} y={136} w={200} label="datetime64[s]" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 3.1, 3.5))} />
      <Row y={210} label="resolution" value="follows the input" valueColor={C.focus} k={easeOut(seg(t, 3.6, 4.1))} />
    </Svg>
  );
}

// 9 · The 2.3 rehearsal switches. Each switch is flipped on this release: copy_on_write = "warn" answers with Pandas4Warning;
// infer_string = True answers with nothing at all.
export function RevealMigrationFlags({ t }: StepCtx) {
  return (
    <Svg label="two rehearsal switches from the release before — one still warns here, one goes quiet" h={220}>
      <Row y={40} label="two 2.3 switches" value="flipped on 3.0" k={easeOut(seg(t, 0.3, 0.8))} />
      <Cell x={25} y={66} w={300} label='mode.copy_on_write = "warn"' o={easeOut(seg(t, 0.8, 1.2))} />
      <path d="M330 80 H370" stroke={C.latte} strokeWidth={1.5} opacity={easeOut(seg(t, 1.3, 1.6))} />
      <Cell x={375} y={66} w={200} label="Pandas4Warning" stroke={C.cherryText} f={C.cherryText} o={easeOut(seg(t, 1.6, 2.0))} />
      <Cell x={25} y={120} w={300} label="future.infer_string = True" o={easeOut(seg(t, 2.2, 2.6))} />
      <path d="M330 134 H370" stroke={C.latte} strokeWidth={1.5} opacity={easeOut(seg(t, 2.7, 3.0))} />
      <Cell x={375} y={120} w={200} label="no warning" f={C.latte} o={easeOut(seg(t, 3.0, 3.4))} />
      <Row y={200} label="one warns" value="one stays silent" valueColor={C.focus} k={easeOut(seg(t, 3.6, 4.1))} />
    </Svg>
  );
}

// 10 · Recap. Six rows land one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a new string type, lazy copies, a shortcut gone for good, real differences in one place and none in another" h={260}>
      <Row y={30} label="text" value="its own str type" k={easeOut(seg(t, 0.4, 0.9))} />
      <Row y={70} label="subsets" value="copies, lazily" k={easeOut(seg(t, 1.0, 1.5))} />
      <Row y={110} label="two-step update" value="gone for good" valueColor={C.cherryText} k={easeOut(seg(t, 1.6, 2.1))} />
      <Row y={150} label="two string types" value="differ" valueColor={C.focus} k={easeOut(seg(t, 2.2, 2.7))} />
      <Row y={190} label="two number types" value="match" valueColor={C.focus} k={easeOut(seg(t, 2.8, 3.3))} />
      <Row y={230} label="pandas 2.3" value="rehearsed it first" k={easeOut(seg(t, 3.4, 3.9))} />
    </Svg>
  );
}

// 11 · Prove: what breaks, and the fix. Two habits in two cells; after the answer each gets its one-line fix beneath it.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const k = (i: number) => (answer !== null ? easeOut(seg(s, 0.1 + i * 0.3, 0.5 + i * 0.3)) : 0);
  const v = answer !== null ? easeOut(seg(s, 0.9, 1.3)) : 0;
  return (
    <Svg label="an old type check and a two-step shortcut, both quietly broken — what's the one-line fix for each?" h={230}>
      <Row y={40} label="two old habits" value="still safe?" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="both still work" answer={answer} value="no, both break" f={C.cherryText} k={easeOut(seg(t, 0.4, 0.9))} />
      <Cell x={25} y={110} w={260} label="dtype == object" o={easeOut(seg(t, 0.6, 0.9))} />
      <Cell x={315} y={110} w={260} label="chain + .copy()" o={easeOut(seg(t, 0.8, 1.1))} />
      {['check for str', 'one .loc update'].map((l, i) => (
        <T key={l} x={155 + i * 290} y={lerp(168, 160, k(i))} s={12} f={C.focus} a="middle" o={k(i)}>
          {l}
        </T>
      ))}
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, v)} s={15} f={C.focus} a="middle" o={v}>
            a one-line fix for each
          </T>
          <rect x={150} y={202} width={300 * v} height={3} fill={C.focus} />
        </>
      )}
    </Svg>
  );
}
