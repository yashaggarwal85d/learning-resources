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

/** A grid of tuples, 30 to a row; `dead(i)` greys a dead tuple, `gone(i)` clears a reclaimed one. */
function Tuples({ y, n, dead, gone, o = 1 }: { y: number; n: number; dead: (i: number) => number; gone: (i: number) => number; o?: number }) {
  return (
    <g opacity={o}>
      {Array.from({ length: n }, (_, i) => {
        const d = dead(i);
        const g = gone(i);
        return (
          <rect key={i} x={25 + (i % 30) * 18.4} y={y + Math.floor(i / 30) * 14} width={14} height={10} rx={1} fill={d > 0.5 ? C.cherryText : C.focus} opacity={(d > 0.5 ? 0.5 : 0.8) * (1 - g)} />
        );
      })}
    </g>
  );
}

// 1 · Hook. Every update writes a new copy and leaves the old one behind; the old copies pile up in a growing heap, and nothing
// clears them.
export function Hook({ t }: StepCtx) {
  const n = Math.floor(clamp(seg(t, 0.6, 3.0)) * 12);
  return (
    <Svg label="every update leaves an old version behind — something has to clean it up" h={220}>
      <Row y={40} label="every update" value="an old copy left behind" k={easeOut(seg(t, 0.3, 0.8))} />
      {Array.from({ length: 12 }, (_, i) => (
        <g key={i} opacity={i < n ? 1 : 0}>
          <rect x={25 + i * 46} y={80} width={40} height={22} rx={3} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.2} />
          <rect x={27 + i * 46} y={82} width={36} height={18} rx={2} fill={i === n - 1 ? C.focus : C.cherryText} opacity={i === n - 1 ? 0.8 : 0.4} />
        </g>
      ))}
      <Row y={160} label="nothing cleans it" value="on its own" valueColor={C.cherryText} k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 2 · Dead tuples, counted. 300 rows; half are deleted and turn dead, still occupying their slots; VACUUM clears them, and the
// dead count returns to 0.
export function RevealDeadTuple({ t }: StepCtx) {
  const d = easeOut(seg(t, 0.8, 1.4));
  const v = easeOut(seg(t, 2.4, 3.0));
  const count = v > 0 ? Math.round(150 * (1 - v)) : Math.round(150 * d);
  return (
    <Svg label="delete half of 300 rows — how many dead tuples does Postgres report, and what reclaims them?" h={240}>
      <Row y={40} label="DELETE half of 300" value={`dead tuples: ${count}`} valueColor={count > 0 ? C.cherryText : C.focus} k={easeOut(seg(t, 0.2, 0.7))} />
      <Tuples y={64} n={300} dead={(i) => (i % 2 === 0 ? d : 0)} gone={(i) => (i % 2 === 0 ? v : 0)} />
      <T x={25} y={228} s={11} f={C.second} o={easeOut(seg(t, 2.2, 2.5))}>
        VACUUM
      </T>
      <rect x={90} y={220} width={480 * v} height={8} rx={2} fill={C.second} opacity={0.8} />
    </Svg>
  );
}

// 3 · HOT updates. 300 updates to a plain column leave the index bar exactly where it was; 300 updates to the indexed column make
// it grow.
export function RevealHotUpdate({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.6, 1.6));
  const b = easeOut(seg(t, 2.0, 3.0));
  return (
    <Svg label="the same 300 updates — which column changed decides whether the index grows" h={230}>
      <Row y={40} label="300 updates, twice" value="the index's size" k={easeOut(seg(t, 0.2, 0.7))} />
      <T x={25} y={86} s={12} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        plain column
      </T>
      <rect x={160} y={76} width={180} height={14} rx={2} fill={C.second} opacity={0.8 * easeOut(seg(t, 0.4, 0.7))} />
      <T x={350} y={87} s={11} f={C.focus} o={a}>
        unchanged: HOT
      </T>
      <T x={25} y={136} s={12} f={C.latte} o={easeOut(seg(t, 1.8, 2.1))}>
        indexed column
      </T>
      <rect x={160} y={126} width={180 + 180 * b} height={14} rx={2} fill={C.cherryText} opacity={0.75 * easeOut(seg(t, 1.8, 2.1))} />
      <Row y={200} label="touch no indexed column" value="the index never moves" valueColor={C.focus} k={easeOut(seg(t, 3.3, 3.8))} />
    </Svg>
  );
}

// 4 · Predict: what pins the cleanup? Autovacuum keeps passing over a table whose bar keeps growing; then the question.
export function PredictPinned({ t, answer }: StepCtx) {
  const g = easeOut(seg(t, 0.3, 1.6));
  return (
    <Svg label="a table keeps growing while autovacuum runs on schedule — what's holding it back?" h={210}>
      <Row y={40} label="autovacuum is running" value="still growing?" k={easeOut(seg(t, 0.1, 0.5))} />
      <rect x={25} y={64} width={200 + 300 * g} height={16} rx={2} fill={C.cherryText} opacity={0.6} />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M${70 + i * 150} 92 l8 -6 l8 6`} fill="none" stroke={C.second} strokeWidth={2} opacity={easeOut(seg(t, 0.6 + i * 0.3, 0.9 + i * 0.3))} />
      ))}
      <AnswerRow y={140} label="it's falling behind" answer={answer} value="no, a held snapshot" k={easeOut(seg(t, 1.2, 1.7))} />
      <Verdict answer={answer} text="an old view is still open somewhere" />
    </Svg>
  );
}

// 5 · The xmin horizon. Three different holders all pin the same line: a forgotten transaction, a stale prepared transaction, and
// an abandoned replication slot; vacuum can't reclaim past it.
export function RevealXminHorizon({ t }: StepCtx) {
  const holders = ['an open transaction', 'a prepared transaction', 'a replication slot'];
  return (
    <Svg label="three named things that hold the xmin horizon open" h={230}>
      <Row y={40} label="Postgres docs" value="three things pin it" k={easeOut(seg(t, 0.2, 0.7))} />
      <line x1={330} y1={62} x2={330} y2={170} stroke={C.cherryText} strokeWidth={2.5} opacity={easeOut(seg(t, 0.4, 0.8))} />
      <T x={340} y={74} s={11} f={C.cherryText} o={easeOut(seg(t, 0.4, 0.8))}>
        the xmin horizon
      </T>
      {holders.map((h, i) => (
        <g key={h} opacity={easeOut(seg(t, 0.9 + i * 0.6, 1.3 + i * 0.6))}>
          <Cell x={25} y={84 + i * 30} w={230} h={24} label={h} />
          <path d={`M255 ${96 + i * 30} H326`} stroke={C.cherryText} strokeWidth={1.2} />
        </g>
      ))}
      <Row y={205} label="to vacuum" value="all three look the same" valueColor={C.cherryText} k={easeOut(seg(t, 3.0, 3.5))} />
    </Svg>
  );
}

// 6 · Bloat, live. One transaction held open through 600 updates on 200 rows: the table's bar climbs; VACUUM runs and reclaims
// nothing; the transaction is released, VACUUM again, and the dead tuples are gone.
export function RevealBloatCharted({ t }: StepCtx) {
  const g = easeOut(seg(t, 0.4, 1.6));
  const v1 = easeOut(seg(t, 1.8, 2.2));
  const rel = easeOut(seg(t, 2.6, 2.9));
  const v2 = easeOut(seg(t, 3.0, 3.5));
  return (
    <Svg label="one transaction held open through 600 updates — what does VACUUM reclaim, before and after it's released?" h={240}>
      <Row y={40} label="600 updates, 200 rows" value="one transaction held" k={easeOut(seg(t, 0.2, 0.7))} />
      <rect x={25} y={70} width={120} height={18} rx={2} fill={C.focus} opacity={0.8} />
      <rect x={145} y={70} width={360 * g * (1 - v2)} height={18} rx={2} fill={C.cherryText} opacity={0.55} />
      <Cell x={25} y={104} w={190} h={24} label="VACUUM: nothing" stroke={C.cherryText} f={C.cherryText} o={v1} />
      <Cell x={225} y={104} w={160} h={24} label="release it" f={C.latte} o={rel} />
      <Cell x={395} y={104} w={180} h={24} label="VACUUM: all of it" stroke={C.focus} f={C.focus} o={v2} />
      <T x={25} y={160} s={11} f={C.latte} o={easeOut(seg(t, 0.6, 0.9))}>
        live rows, then dead versions piling up behind the held snapshot
      </T>
      <Row y={210} label="while it's held" value="nothing reclaimed" valueColor={C.cherryText} k={easeOut(seg(t, 3.6, 4.1))} />
    </Svg>
  );
}

// 7 · Autovacuum's trigger. The changed-tuple count climbs toward a threshold line built from a base plus a scale factor times the
// row count; it crosses, and a worker starts. No clock anywhere.
export function RevealAutovacuumKnobs({ t }: StepCtx) {
  const c = clamp(seg(t, 0.6, 2.4));
  const crossed = c > 0.75;
  return (
    <Svg label="autovacuum reacts to a threshold — a base value plus a scale factor times the row count" h={230}>
      <Row y={40} label="threshold" value="base + scale factor × rows" valueColor={C.second} k={easeOut(seg(t, 0.2, 0.7))} />
      <line x1={25} y1={150} x2={575} y2={150} stroke={C.mocha} strokeWidth={1} />
      <line x1={25} y1={100} x2={575} y2={100} stroke={C.second} strokeWidth={1.5} strokeDasharray="5 4" opacity={easeOut(seg(t, 0.4, 0.7))} />
      <path d={`M25 150 L${25 + 400 * c} ${150 - 66 * c}`} stroke={crossed ? C.cherryText : C.crema} strokeWidth={2} fill="none" />
      <T x={25} y={170} s={11} f={C.latte} o={easeOut(seg(t, 0.6, 0.9))}>
        dead tuples since the last pass
      </T>
      <Cell x={445} y={110} w={130} h={24} label="a worker starts" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 2.4, 2.8))} />
      <Row y={210} label="anti-wraparound worker" value="not interrupted" valueColor={C.focus} k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 8 · Freezing and wraparound. Transaction IDs on a clock face, the hand sweeping round; a frozen row is pinned "always in the past";
// VACUUM FREEZE drops a table's freeze age to at most 1; ignore it and writes stop, as at Sentry in 2015.
export function RevealWraparound({ t }: StepCtx) {
  const p = easeInOut(seg(t, 0.4, 2.4));
  const cx = 130;
  const cy = 125;
  const R = 62;
  const a = -Math.PI / 2 + p * Math.PI * 1.8;
  return (
    <Svg label="transaction IDs compared in a circle — freezing keeps it safe, and ignoring it stops writes" h={230}>
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={C.mocha} strokeWidth={2} opacity={easeOut(seg(t, 0.2, 0.5))} />
      <line x1={cx} y1={cy} x2={cx + (R - 8) * Math.cos(a)} y2={cy + (R - 8) * Math.sin(a)} stroke={C.second} strokeWidth={2.5} />
      <circle cx={cx} cy={cy - R} r={6} fill={C.focus} opacity={easeOut(seg(t, 1.0, 1.3))} />
      <T x={cx + 14} y={cy - R - 4} s={11} f={C.focus} o={easeOut(seg(t, 1.0, 1.3))}>
        frozen: always in the past
      </T>
      <Cell x={240} y={84} w={335} h={26} label="VACUUM FREEZE: age back to 1 or less" stroke={C.focus} f={C.focus} o={easeOut(seg(t, 2.0, 2.4))} />
      <Cell x={240} y={124} w={335} h={26} label="ignored long enough: writes refused" stroke={C.cherryText} f={C.cherryText} o={easeOut(seg(t, 2.8, 3.2))} />
      <Row y={215} label="Sentry, 2015" value="writes stopped" valueColor={C.cherryText} k={easeOut(seg(t, 3.4, 3.9))} />
    </Svg>
  );
}

// 9 · Recap. Three rows land one per beat, one scale each.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="one mechanism at three scales — a dead row, a held horizon, an unfrozen cluster" h={220}>
      <Row y={50} label="one row" value="a dead tuple" k={easeOut(seg(t, 0.8, 1.3))} />
      <Row y={110} label="one table" value="a horizon held open" valueColor={C.cherryText} k={easeOut(seg(t, 2.0, 2.5))} />
      <Row y={170} label="a whole cluster" value="an unfrozen counter" valueColor={C.cherryText} k={easeOut(seg(t, 3.2, 3.7))} />
    </Svg>
  );
}

// 10 · Prove: disable autovacuum? After the answer the "disable" cell is crossed out, and the real order lands: find the pin, let
// vacuum finish, then retune.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const k = (i: number) => (answer !== null ? easeOut(seg(s, 0.3 + i * 0.25, 0.6 + i * 0.25)) : 0);
  const v = answer !== null ? easeOut(seg(s, 1.1, 1.5)) : 0;
  return (
    <Svg label="wraparound protection hit — is disabling autovacuum the fix?" h={230}>
      <Row y={40} label="disable autovacuum?" value="the fix?" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="yes, turn it off" answer={answer} value="no, it digs you out" k={easeOut(seg(t, 0.4, 0.9))} />
      {['find the pin', 'let vacuum finish', 'then retune'].map((l, i) => (
        <Cell key={l} x={25 + i * 190} y={116} w={170} label={l} stroke={C.focus} f={C.focus} o={k(i)} />
      ))}
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, v)} s={15} f={C.focus} a="middle" o={v}>
            vacuum is the way out, not the problem
          </T>
          <rect x={150} y={202} width={300 * v} height={3} fill={C.focus} />
        </>
      )}
    </Svg>
  );
}
