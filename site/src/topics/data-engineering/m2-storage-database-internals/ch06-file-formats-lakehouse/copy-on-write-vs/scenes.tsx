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

/** A data file drawn as a tall rectangle with row stripes; rows in `hot` are marked red; `fill` sweeps a rewrite down it. */
function DFile({
  x,
  y,
  w = 30,
  h = 60,
  rows = 6,
  hot = [],
  o = 1,
  fill = 0,
  stroke = C.latte,
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  rows?: number;
  hot?: number[];
  o?: number;
  fill?: number;
  stroke?: string;
}) {
  const rh = h / rows;
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={h} rx={2} fill={C.cocoa} stroke={stroke} strokeWidth={1.4} />
      {fill > 0 && <rect x={x + 2} y={y + 2} width={w - 4} height={(h - 4) * fill} fill={C.second} opacity={0.5} />}
      {Array.from({ length: rows - 1 }, (_, i) => (
        <line key={i} x1={x + 3} y1={y + rh * (i + 1)} x2={x + w - 3} y2={y + rh * (i + 1)} stroke={C.mocha} strokeWidth={1} />
      ))}
      {hot.map((r) => (
        <rect key={r} x={x + 4} y={y + rh * r + 2} width={w - 8} height={rh - 4} fill={C.cherryText} />
      ))}
    </g>
  );
}

// 1 · Hook. Past commits: a whole file added, a whole file swapped. Then one file whose rows show, with two rows marked:
// only some rows change.
export function Hook({ t }: StepCtx) {
  return (
    <Svg label="every commit so far touched whole files -- this topic is a commit that only changes some rows." h={200}>
      <T x={25} y={30} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        so far: whole files
      </T>
      <DFile x={25} y={50} o={easeOut(seg(t, 0.3, 0.6))} />
      <DFile x={75} y={lerp(30, 50, easeOut(seg(t, 0.7, 1.1)))} o={easeOut(seg(t, 0.7, 1.1))} stroke={C.focus} />
      <DFile x={140} y={50} o={easeOut(seg(t, 1.2, 1.5)) * (1 - easeOut(seg(t, 1.7, 2.0)))} />
      <DFile x={140} y={50} o={easeOut(seg(t, 1.7, 2.0))} stroke={C.focus} />
      <T x={25} y={140} s={11} f={C.latte} o={easeOut(seg(t, 0.8, 1.1))}>
        added, swapped
      </T>
      <DFile x={330} y={25} w={90} h={120} rows={10} hot={easeOut(seg(t, 2.8, 3.1)) > 0.5 ? [2, 7] : []} o={easeOut(seg(t, 2.3, 2.7))} />
      <T x={440} y={90} s={14} f={C.cherryText} o={easeOut(seg(t, 3.2, 3.6))}>
        a few rows
      </T>
      <T x={300} y={185} s={13} f={C.crema} a="middle" o={easeOut(seg(t, 3.8, 4.2))}>
        the rest of the file is still right
      </T>
    </Svg>
  );
}

// 2 · Predict. Twelve files, each with one scattered red row; the answer: two strategies.
export function PredictCheapestCommit({ t, answer }: StepCtx) {
  return (
    <Svg label="a 1% row update, scattered across many files -- what's the cheapest way to commit it?" h={200}>
      {Array.from({ length: 12 }, (_, i) => (
        <DFile key={i} x={25 + i * 46} y={30} w={30} h={60} hot={easeOut(seg(t, 0.9 + i * 0.05, 1.1 + i * 0.05)) > 0.5 ? [(i * 5) % 6] : []} o={easeOut(seg(t, 0.1 + i * 0.04, 0.3 + i * 0.04))} />
      ))}
      <T x={25} y={115} s={12} f={C.cherryText} o={easeOut(seg(t, 1.5, 1.8))}>
        1% of rows, in every file
      </T>
      <AnswerRow y={145} label="the cheapest commit" answer={answer} value="two strategies" k={easeOut(seg(t, 2.0, 2.5))} />
      <Verdict answer={answer} y={188} text="each moves the cost somewhere else" />
    </Svg>
  );
}

// 3 · Copy-on-write. A base file with one touched row; a brand new base file is written beside it in full, top to
// bottom; a "log files" slot stays empty and is crossed.
export function RevealCowRewritesWhole({ t }: StepCtx) {
  return (
    <Svg label="copy-on-write: any touched file gets a brand new version, in full -- no log files at all." h={230}>
      <T x={25} y={30} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        base file
      </T>
      <DFile x={25} y={45} w={90} h={120} rows={10} hot={[4]} o={easeOut(seg(t, 0.1, 0.4))} />
      <Req x1={120} x2={215} y={105} k={easeOut(seg(t, 0.7, 1.1))} label="one row" f={C.cherryText} />
      <T x={220} y={30} s={11} f={C.focus} o={easeOut(seg(t, 1.0, 1.3))}>
        new base file, whole
      </T>
      <DFile x={220} y={45} w={90} h={120} rows={10} fill={easeInOut(seg(t, 1.2, 2.6))} o={easeOut(seg(t, 1.0, 1.3))} stroke={C.focus} />
      <rect x={400} y={70} width={150} height={60} rx={4} fill="none" stroke={C.mocha} strokeWidth={1.5} strokeDasharray="5 4" opacity={easeOut(seg(t, 2.9, 3.2))} />
      <T x={410} y={60} s={11} f={C.latte} o={easeOut(seg(t, 2.9, 3.2))}>
        log files
      </T>
      <Cross x={475} y={100} k={easeOut(seg(t, 3.3, 3.6))} />
      <T x={25} y={210} s={14} f={C.focus} o={easeOut(seg(t, 3.8, 4.2))}>
        nothing partial, no patch left behind
      </T>
    </Svg>
  );
}

// 4 · Copy-on-write, for real. Twelve files with one hot row each; a rewrite sweeps through every one in turn; a write
// cost bar grows long as they go.
export function RevealCowRealWriteCost({ t }: StepCtx) {
  return (
    <Svg label="reproduced for real: a 1% update rewrites every touched file, at a real measured cost." h={230}>
      {Array.from({ length: 12 }, (_, i) => (
        <DFile key={i} x={25 + i * 46} y={30} w={30} h={60} hot={[(i * 5) % 6]} fill={easeInOut(seg(t, 0.8 + i * 0.15, 1.1 + i * 0.15))} o={easeOut(seg(t, 0.1, 0.4))} />
      ))}
      <T x={25} y={125} s={13} f={C.crema} o={easeOut(seg(t, 2.6, 3.0))}>
        12 files rewritten, whole
      </T>
      <T x={25} y={165} s={11} f={C.latte} o={easeOut(seg(t, 0.8, 1.1))}>
        write cost
      </T>
      <rect x={120} y={153} width={430 * easeInOut(seg(t, 0.8, 2.6))} height={16} rx={2} fill={C.cherryText} />
      <T x={25} y={212} s={13} f={C.latte} o={easeOut(seg(t, 3.4, 3.8))}>
        measured on a real disk, every run
      </T>
    </Svg>
  );
}

// 5 · Predict. A reader opens rewritten files directly, with nothing beside them; the answer: reads stay cheap.
export function PredictCowReadPayoff({ t, answer }: StepCtx) {
  return (
    <Svg label="does copy-on-write's expensive rewrite buy anything back when you read?" h={200}>
      {[0, 1, 2, 3].map((i) => (
        <DFile key={i} x={25 + i * 46} y={35} stroke={C.focus} o={easeOut(seg(t, 0.1 + i * 0.1, 0.4 + i * 0.1))} />
      ))}
      <Cell x={420} y={50} w={130} h={30} label="reader" o={easeOut(seg(t, 0.6, 0.9))} />
      <Req x1={418} x2={215} y={65} k={easeOut(seg(t, 1.0, 1.5))} label="read" />
      <AnswerRow y={140} label="reads after the rewrite" answer={answer} value="cheap" k={easeOut(seg(t, 1.8, 2.3))} />
      <Verdict answer={answer} y={188} text="every file is already current" />
    </Svg>
  );
}

// 6 · Merge-on-read. The base file is padlocked; the change drops into a small log file beside it; at read time both
// feed one merge point on the way to the reader.
export function RevealMorDefersToLog({ t }: StepCtx) {
  const m = easeOut(seg(t, 2.6, 3.2));
  return (
    <Svg label="merge-on-read: the change goes to a small log file, merged with the base only when you read." h={230}>
      <DFile x={25} y={30} w={90} h={120} rows={10} o={easeOut(seg(t, 0.1, 0.4))} />
      <Lock x={62} y={165} k={easeOut(seg(t, 0.5, 0.8))} />
      <T x={130} y={45} s={11} f={C.latte} o={easeOut(seg(t, 0.3, 0.6))}>
        base file, untouched
      </T>
      <DFile x={160} y={lerp(70, 100, easeOut(seg(t, 1.0, 1.5)))} w={40} h={40} rows={2} hot={[0, 1]} o={easeOut(seg(t, 1.0, 1.5))} stroke={C.cherryText} />
      <T x={210} y={128} s={11} f={C.cherryText} o={easeOut(seg(t, 1.5, 1.8))}>
        small log file
      </T>
      <line x1={115} y1={90} x2={lerp(115, 380, m)} y2={lerp(90, 120, m)} stroke={C.latte} strokeWidth={1.6} opacity={m > 0 ? 1 : 0} />
      <line x1={200} y1={120} x2={lerp(200, 380, m)} y2={120} stroke={C.cherryText} strokeWidth={1.6} opacity={m > 0 ? 1 : 0} />
      <circle cx={386} cy={120} r={9} fill={C.cocoa} stroke={C.focus} strokeWidth={2} opacity={easeOut(seg(t, 3.0, 3.3))} />
      <Cell x={430} y={105} w={120} h={30} label="reader" o={easeOut(seg(t, 2.4, 2.7))} />
      <T x={360} y={160} s={12} f={C.focus} o={easeOut(seg(t, 3.2, 3.5))}>
        merged at query time
      </T>
      <T x={25} y={215} s={13} f={C.latte} o={easeOut(seg(t, 3.8, 4.2))}>
        Delta's deletion vectors: the same move
      </T>
    </Svg>
  );
}

// 7 · Merge-on-read, for real. A long copy-on-write write bar beside a sliver for the log write; then five read bars,
// one per round of logs, each longer than the last.
export function RevealMorRealCostGrows({ t }: StepCtx) {
  const ws = easeInOut(seg(t, 0.3, 1.0));
  return (
    <Svg label="reproduced for real: the write is nearly free, but every read now pays a cost that keeps growing." h={230}>
      <T x={25} y={35} s={11} f={C.latte} o={easeOut(seg(t, 0.1, 0.4))}>
        write: copy-on-write
      </T>
      <rect x={200} y={23} width={350 * ws} height={14} rx={2} fill={C.taupe} />
      <T x={25} y={65} s={11} f={C.latte} o={easeOut(seg(t, 0.6, 0.9))}>
        write: merge-on-read
      </T>
      <rect x={200} y={53} width={22 * easeInOut(seg(t, 0.9, 1.3))} height={14} rx={2} fill={C.focus} />
      <T x={25} y={105} s={11} f={C.latte} o={easeOut(seg(t, 1.6, 1.9))}>
        read, round by round
      </T>
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={200} y={92 + i * 20} width={(60 + i * 70) * easeInOut(seg(t, 1.8 + i * 0.4, 2.3 + i * 0.4))} height={14} rx={2} fill={C.cherryText} />
      ))}
      <T x={25} y={215} s={13} f={C.cherryText} o={easeOut(seg(t, 4.0, 4.4))}>
        each unmerged log adds to every read
      </T>
    </Svg>
  );
}

// 8 · Compaction. Five log files slide into the base file and vanish; the read cost bar shrinks back to a sliver.
export function RevealCompactionResetsCost({ t }: StepCtx) {
  const fold = easeInOut(seg(t, 1.2, 2.4));
  const shrink = easeInOut(seg(t, 2.8, 3.6));
  return (
    <Svg label="reproduced for real: folding the logs into the base files resets the read cost right back down." h={230}>
      <DFile x={25} y={30} w={90} h={120} rows={10} fill={easeInOut(seg(t, 2.2, 2.8))} o={easeOut(seg(t, 0.1, 0.4))} />
      {[0, 1, 2, 3, 4].map((i) => (
        <DFile
          key={i}
          x={lerp(160 + i * 50, 50, fold)}
          y={lerp(60, 80, fold)}
          w={36}
          h={36}
          rows={2}
          hot={[0]}
          stroke={C.cherryText}
          o={easeOut(seg(t, 0.2 + i * 0.1, 0.5 + i * 0.1)) * (1 - seg(t, 2.2, 2.4))}
        />
      ))}
      <T x={160} y={125} s={11} f={C.cherryText} o={easeOut(seg(t, 0.4, 0.7)) * (1 - seg(t, 1.2, 1.4))}>
        five rounds of logs
      </T>
      <T x={160} y={45} s={12} f={C.focus} o={easeOut(seg(t, 1.0, 1.3))}>
        OPTIMIZE / REORG ... PURGE
      </T>
      <T x={25} y={185} s={11} f={C.latte} o={easeOut(seg(t, 2.6, 2.9))}>
        read cost
      </T>
      <rect x={120} y={173} width={lerp(410, 22, shrink)} height={16} rx={2} fill={shrink > 0.5 ? C.focus : C.cherryText} opacity={easeOut(seg(t, 2.6, 2.9))} />
      <T x={25} y={220} s={13} f={C.focus} o={easeOut(seg(t, 3.8, 4.2))}>
        back toward zero
      </T>
    </Svg>
  );
}

// 9 · Every format. Two pans, write time and read time; each format's name for its move drops in under the pan it pays on.
export function RevealSameChoiceEveryFormat({ t }: StepCtx) {
  const right = ['Iceberg: delete files, DVs', 'Delta: deletion vectors', 'Hudi: merge-on-read'];
  return (
    <Svg label="Iceberg, Delta and Hudi all name the identical trade, under different words for it." h={230}>
      <Cell x={25} y={25} w={220} h={32} label="pay at write time" stroke={C.second} o={easeOut(seg(t, 0.1, 0.4))} />
      <Cell x={300} y={25} w={275} h={32} label="defer to read time" stroke={C.cherryText} o={easeOut(seg(t, 0.2, 0.5))} />
      <T x={25} y={lerp(70, 85, easeOut(seg(t, 0.7, 1.1)))} s={11} f={C.crema} o={easeOut(seg(t, 0.7, 1.1))}>
        Hudi: copy-on-write
      </T>
      {right.map((r, i) => (
        <T key={r} x={300} y={lerp(70 + i * 30, 85 + i * 30, easeOut(seg(t, 1.4 + i * 0.6, 1.8 + i * 0.6)))} s={11} f={C.crema} o={easeOut(seg(t, 1.4 + i * 0.6, 1.8 + i * 0.6))}>
          {r}
        </T>
      ))}
      <T x={300} y={210} s={14} f={C.focus} a="middle" o={easeOut(seg(t, 3.7, 4.1))}>
        one trade, three vocabularies
      </T>
    </Svg>
  );
}

// 10 · Recap.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="copy-on-write pays once at write time; merge-on-read defers that cost until you compact." h={250}>
      <Row y={40} label="copy-on-write" value="pay once, at write" valueColor={C.second} k={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={100} label="merge-on-read" value="defer to reads" valueColor={C.cherryText} k={easeOut(seg(t, 1.2, 1.6))} />
      <Row y={160} label="compaction" value="clears the debt" k={easeOut(seg(t, 2.2, 2.6))} />
      <Row y={220} label="decide by" value="rate, scatter, freshness" valueColor={C.focus} k={easeOut(seg(t, 3.2, 3.6))} />
    </Svg>
  );
}
