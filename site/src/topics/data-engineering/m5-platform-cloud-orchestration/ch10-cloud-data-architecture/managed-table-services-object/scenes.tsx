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

function Pip({ x, y, o = 1, f = C.second, s = 10 }: { x: number; y: number; o?: number; f?: string; s?: number }) {
  return <rect x={x - s / 2} y={y - s / 2} width={s} height={s} rx={2} fill={f} opacity={o} />;
}

function Hole({ x, y, w, h = 28, o = 1, stroke = C.mocha }: { x: number; y: number; w: number; h?: number; o?: number; stroke?: string }) {
  return <rect x={x} y={y} width={w} height={h} rx={4} fill="none" stroke={stroke} strokeWidth={1.5} strokeDasharray="4 3" opacity={o} />;
}

/** A fan line from (x1, y1) to (x2, y2), drawn by `k`, ending in a dot. */
function Fan({ x1, y1, x2, y2, k, f = C.crema }: { x1: number; y1: number; x2: number; y2: number; k: number; f?: string }) {
  if (k <= 0) return null;
  const x = lerp(x1, x2, k);
  const y = lerp(y1, y2, k);
  return (
    <g>
      <line x1={x1} y1={y1} x2={x} y2={y} stroke={f} strokeWidth={1.6} />
      <circle cx={x} cy={y} r={3} fill={f} />
    </g>
  );
}

// 0 · What was bought. Compaction and snapshot cleanup tick in; the third promise, every reader forever, is an empty
// dashed slot. On the right the table fans out to three readers, and the third is crossed out.
export function MistakeImpossible({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  return (
    <Svg label="A managed Iceberg table, read fine by most engines, with one reader now crossed out" h={250}>
      <T x={25} y={28} s={12} f={C.latte} o={k(0)}>
        what the service does
      </T>
      <Cell x={25} y={40} w={220} label="compaction" o={k(0.2)} />
      <MiniTick x={255} y={52} k={k(0.5)} />
      <Cell x={25} y={76} w={220} label="snapshot cleanup" o={k(0.5)} />
      <MiniTick x={255} y={88} k={k(0.8)} />
      <Hole x={25} y={112} w={250} stroke={C.cherryText} o={k(1.2)} />
      <T x={37} y={130} s={11} f={C.cherryText} o={k(1.4)}>
        readers forever: not on offer
      </T>
      <Cell x={330} y={76} w={110} label="the table" o={k(1.6)} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Fan x1={440} y1={90} x2={470} y2={54 + i * 36} k={k(1.9 + i * 0.15)} f={i === 2 && t > 2.6 ? C.cherryText : C.crema} />
          <Cell x={475} y={40 + i * 36} w={80} label="reader" o={k(1.9 + i * 0.15)} stroke={i === 2 && t > 2.6 ? C.cherryText : C.mocha} />
        </g>
      ))}
      <Cross x={566} y={126} k={k(2.6)} />
      {t > 3.2 && (
        <T x={300} y={220} s={12} f={C.latte} a="middle" o={k(3.2)}>
          two separate guarantees; only one was ever on offer
        </T>
      )}
    </Svg>
  );
}

// 1 · Predict. Rows and files are ticked unchanged; two engines read the table, Athena is crossed with a question. Once
// answered, the table's tag flips to format-version 3 and Athena's own support, versions 1 and 2, is spelled out.
export function WhatBroke({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const engines = ['EMR Spark 7.12', 'S3 Tables endpoint', v > 0.5 ? 'Athena: reads 1, 2' : 'Athena'];
  return (
    <Svg label="The same table's spec version, old and new, with the broken engine pinned to the old one" h={250}>
      {['rows unchanged', 'files unchanged'].map((c, i) => (
        <g key={c}>
          <Cell x={25 + i * 210} y={26} w={170} label={c} o={k(i * 0.15)} />
          <MiniTick x={205 + i * 210} y={38} k={k(0.3 + i * 0.15)} />
        </g>
      ))}
      <Cell x={25} y={116} w={200} label={v > 0.5 ? 'format-version 3' : 'the table'} o={k(0.3)} stroke={v > 0.5 ? C.focus : C.mocha} f={v > 0.5 ? C.focus : C.crema} />
      {engines.map((e, i) => (
        <g key={i}>
          <Fan x1={225} y1={130} x2={375} y2={94 + i * 40} k={k(0.4 + i * 0.1)} f={i === 2 ? C.cherryText : C.crema} />
          <Cell x={380} y={80 + i * 40} w={180} label={e} o={k(0.4 + i * 0.1)} stroke={i === 2 ? C.cherryText : C.mocha} f={i === 2 && v > 0.5 ? C.cherryText : C.crema} />
        </g>
      ))}
      {answer === null && (
        <T x={570} y={179} s={13} f={C.crema} a="end" o={k(0.8)}>
          ?
        </T>
      )}
      <Verdict answer={answer} text="a version it never learned, not a bug" y={232} />
    </Svg>
  );
}

// 2 · Four vendor cards fill a grid one after another, each listing exactly what it automates. Then the two extremes
// light: S3 Tables' three named operations and Unity's everything.
export function FourVendorCards({ t }: StepCtx) {
  const cards: [string, string[]][] = [
    ['S3 Tables', ['compaction', 'snapshot management', 'unreferenced-file removal']],
    ['BigLake Iceberg tables', ['compaction', 'clustering', 'time-travel GC']],
    ['Unity managed Iceberg', ['all of it: read, write,', 'storage, optimization']],
    ['Snowflake-managed Iceberg', ['managed per table', 'on by default']],
  ];
  const hi = easeOut(seg(t, 4.3, 4.7));
  return (
    <Svg label="One vendor card at a time, naming exactly what that service automates" h={240}>
      {cards.map(([name, jobs], i) => {
        const d = 0.2 + i * 1.0;
        const x = 25 + (i % 2) * 280;
        const y = 20 + Math.floor(i / 2) * 106;
        const lit = (i === 0 || i === 2) && hi > 0;
        return (
          <g key={name} opacity={easeOut(seg(t, d, d + 0.4))}>
            <rect x={x} y={y} width={270} height={96} rx={6} fill="none" stroke={lit ? C.focus : C.mocha} strokeWidth={1.5} />
            <T x={x + 12} y={y + 22} s={12} f={lit ? C.focus : C.crema}>
              {name}
            </T>
            {jobs.map((j, n) => (
              <T key={j} x={x + 24} y={y + 44 + n * 18} s={11} f={C.latte} o={easeOut(seg(t, d + 0.3 + n * 0.15, d + 0.6 + n * 0.15))}>
                {j}
              </T>
            ))}
            {jobs.map((j, n) => (
              <Pip key={j} x={x + 15} y={y + 40 + n * 18} s={5} f={C.second} o={easeOut(seg(t, d + 0.3 + n * 0.15, d + 0.6 + n * 0.15))} />
            ))}
          </g>
        );
      })}
    </Svg>
  );
}

// 3 · The premium stacks on top. The storage bar is already there; the $25 monitoring fee lands on its end, then the
// $52 compaction fee, and the $77 total sits on top of storage, never in place of it.
export function PremiumBilled({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const m = easeOut(seg(t, 1.0, 1.5));
  const c = easeOut(seg(t, 2.0, 2.6));
  return (
    <Svg label="A monitoring fee and a compaction fee adding up on top of storage, on a one-million-object table" h={250}>
      <T x={25} y={28} s={12} f={C.latte} o={k(0)}>
        1,000,000 objects; 10,000 GB compacted
      </T>
      <rect x={25} y={44} width={200 * k(0.2)} height={26} rx={3} fill={C.latte} opacity={0.6} />
      <T x={25} y={90} s={11} f={C.latte} o={k(0.4)}>
        storage, as before
      </T>
      <rect x={225} y={44} width={75 * m} height={26} rx={0} fill={C.caramel} />
      <rect x={300} y={44} width={156 * c} height={26} rx={0} fill={C.cherryText} opacity={0.85} />
      <T x={225} y={110} s={11} f={C.caramel} o={k(1.4)}>
        $25 monitoring
      </T>
      <T x={300} y={132} s={11} f={C.cherryText} o={k(2.5)}>
        $52 compaction
      </T>
      {t > 3.0 && (
        <T x={25} y={170} s={13} f={C.crema} w={600} o={k(3.0)}>
          $77 on top of storage, not instead of it
        </T>
      )}
      <T x={25} y={204} s={11} f={C.latte} o={k(1.0)}>
        $0.025 per 1,000 objects watched
      </T>
      <T x={25} y={226} s={11} f={C.latte} o={k(2.0)}>
        $0.002 per 1,000 objects + $0.005 per GB compacted
      </T>
    </Svg>
  );
}

// 4 · Who owns the job. Top: you drag your own run to the slot you choose, and the cost is yours to set. Bottom: the
// vendor's runs drop onto its own schedule under a lock, at its own price.
export function SomeoneOwnsTheJob({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const drag = easeInOut(seg(t, 0.4, 1.2));
  return (
    <Svg label="Your own job, controlled and timed by you, versus a managed job whose timing and price you don't control" h={250}>
      <T x={25} y={30} s={12} f={C.second} o={k(0)}>
        run it yourself
      </T>
      <line x1={25} y1={64} x2={575} y2={64} stroke={C.mocha} strokeWidth={1.5} opacity={k(0)} />
      <Pip x={lerp(100, 220, drag)} y={64} s={14} f={C.second} />
      {drag >= 1 && (
        <T x={240} y={68} s={11} f={C.second}>
          you choose when, and what it costs
        </T>
      )}
      <T x={25} y={130} s={12} f={C.caramel} o={k(1.5)}>
        managed
      </T>
      <Lock x={100} y={120} k={k(1.6)} f={C.caramel} />
      <line x1={25} y1={164} x2={575} y2={164} stroke={C.mocha} strokeWidth={1.5} opacity={k(1.5)} />
      {[180, 390, 520].map((x, i) => (
        <Pip key={x} x={x} y={lerp(140, 164, k(1.8 + i * 0.4))} s={14} f={C.caramel} o={k(1.8 + i * 0.4)} />
      ))}
      {t > 3.0 && (
        <T x={25} y={196} s={11} f={C.caramel} o={k(3.0)}>
          their schedule, their price
        </T>
      )}
      {t > 3.4 && (
        <T x={300} y={236} s={12} f={C.latte} a="middle" o={k(3.4)}>
          the job still runs; someone else owns it
        </T>
      )}
    </Svg>
  );
}

// 5 · AWS's own compatibility table fills in row by row: EMR Spark and the S3 Tables endpoint read V3; Athena's row
// lands crossed and lit.
export function AthenaCantRead({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const rows: [string, boolean][] = [
    ['EMR Spark 7.12+', true],
    ['S3 Tables endpoint', true],
    ['Amazon Athena', false],
  ];
  return (
    <Svg label="AWS's own compatibility table, with its own Athena row marked as unable to read the newer format" h={250}>
      <T x={25} y={30} s={11} f={C.latte} o={k(0)}>
        engine
      </T>
      <T x={470} y={30} s={11} f={C.latte} o={k(0)}>
        reads V3
      </T>
      {rows.map(([e, ok], i) => {
        const d = 0.4 + i * 0.8;
        const y = 42 + i * 42;
        return (
          <g key={e} opacity={k(d)}>
            <rect x={25} y={y} width={550} height={32} rx={4} fill={C.cocoa} stroke={ok ? C.mocha : C.cherryText} strokeWidth={1.5} />
            <T x={37} y={y + 21} s={12} f={ok ? C.crema : C.cherryText}>
              {e}
            </T>
            {ok ? <MiniTick x={480} y={y + 14} k={k(d + 0.3)} /> : <Cross x={487} y={y + 16} k={k(d + 0.3)} />}
          </g>
        );
      })}
      {t > 3.0 && (
        <T x={300} y={200} s={12} f={C.caramel} a="middle" o={k(3.0)}>
          one company's own docs, on its own two products
        </T>
      )}
    </Svg>
  );
}

// 6 · The real local run. The files column holds still; only format-version flips from 2 to 3. The result column flips
// with it: two engines still read, amazon-athena fails with the exact error the run raised.
export function SkewReproduced({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const up = t > 2.0;
  const after = (i: number) => t > 2.4 + i * 0.25;
  const engines = ['emr-spark-7.12', 's3-tables-rest-endpoint', 'amazon-athena'];
  return (
    <Svg label="Three named engines reading the same real local table, before and after its one upgrade" h={250}>
      <T x={25} y={28} s={11} f={C.latte} o={k(0)}>
        files
      </T>
      <T x={260} y={28} s={11} f={C.latte} o={k(0)}>
        result
      </T>
      <Cell x={25} y={40} w={210} label="metadata.json" o={k(0.1)} />
      <Cell x={25} y={80} w={210} label={up ? 'format-version: 3' : 'format-version: 2'} o={k(0.2)} stroke={up ? C.focus : C.mocha} f={up ? C.focus : C.crema} />
      <Cell x={25} y={120} w={210} label="snapshot 100" o={k(0.3)} />
      {engines.map((e, i) => {
        const bad = i === 2 && after(i);
        return (
          <g key={e}>
            <Cell x={260} y={40 + i * 40} w={250} label={e} o={k(0.4 + i * 0.2)} stroke={bad ? C.cherryText : C.mocha} f={bad ? C.cherryText : C.crema} />
            {bad ? <Cross x={530} y={54 + i * 40} k={k(2.4 + i * 0.25)} /> : <MiniTick x={522} y={52 + i * 40} k={after(i) ? 1 : k(0.7 + i * 0.2)} />}
          </g>
        );
      })}
      {t > 3.0 && (
        <T x={25} y={190} s={11} f={C.cherryText} o={k(3.0)}>
          amazon-athena cannot read format-version 3
        </T>
      )}
      {t > 3.6 && (
        <T x={300} y={230} s={12} f={C.latte} a="middle" o={k(3.6)}>
          nothing about the data moved, and the read still broke
        </T>
      )}
    </Svg>
  );
}

// 7 · Recap: three lines, each beside a small moving picture of its idea.
export function Recap({ t }: StepCtx) {
  const k = (i: number) => easeOut(seg(t, 0.1 + i * 0.7, 0.5 + i * 0.7));
  const lines = ["A service's name says little about its jobs", 'Check its own docs, for each of the four', 'A writer moving ahead can strand a reader'];
  return (
    <Svg label="The three-part recap of this topic's point" h={230}>
      {lines.map((l, i) => (
        <T key={l} x={110} y={48 + i * 60} s={13} f={C.crema} o={k(i)}>
          {l}
        </T>
      ))}
      <g opacity={k(0)}>
        <rect x={25} y={32} width={60} height={22} rx={4} fill="none" stroke={C.mocha} />
        <T x={55} y={48} s={11} f={C.latte} a="middle">
          ?
        </T>
      </g>
      <g opacity={k(1)}>
        {[0, 1, 2, 3].map((j) => (
          <rect key={j} x={25 + j * 16} y={96} width={12} height={12} rx={2} fill="none" stroke={C.focus} />
        ))}
        {[0, 1, 2, 3].map((j) => (
          <MiniTick key={j} x={26 + j * 16} y={100} k={easeOut(seg(t, 1.0 + j * 0.15, 1.2 + j * 0.15))} />
        ))}
      </g>
      <g opacity={k(2)}>
        <Pip x={lerp(30, 80, easeInOut(seg(t, 1.5, 2.4)))} y={162} s={9} f={C.focus} />
        <Pip x={30} y={176} s={9} f={C.cherryText} />
      </g>
    </Svg>
  );
}

// 8 · Prove it. The format's pointer marches forward past V2 and V3 while one engine stays pinned at V2 under a lock.
// Once answered, what eventually forces the move gathers at the far end and reaches back to the pin.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const p = easeInOut(seg(t, 0.2, 2.2));
  const forces = ['a V3-only feature', 'a vendor default', 'a dependency'];
  return (
    <Svg label="Pinning every engine to the old spec version forever, versus the risk actually recurring" h={250}>
      <line x1={25} y1={60} x2={575} y2={60} stroke={C.mocha} strokeWidth={1.5} />
      {[
        ['V2', 120],
        ['V3', 300],
        ['later', 480],
      ].map(([l, x]) => (
        <g key={l as string}>
          <line x1={x as number} y1={52} x2={x as number} y2={68} stroke={C.mocha} strokeWidth={1.5} />
          <T x={x as number} y={44} s={11} f={C.latte} a="middle">
            {l as string}
          </T>
        </g>
      ))}
      <path d={`M${lerp(25, 560, p)} 60 l-6 9 h12 z`} fill={C.second} />
      <Pip x={120} y={96} s={12} f={C.latte} />
      <Lock x={136} y={90} k={1} f={C.latte} />
      <T x={120} y={124} s={11} f={C.latte} a="middle">
        pinned engine
      </T>
      {forces.map((f, i) => (
        <g key={f}>
          <Cell x={380} y={84 + i * 34} w={195} h={26} label={f} o={easeOut(seg(s, 0.2 + i * 0.2, 0.5 + i * 0.2)) * (answer !== null ? 1 : 0)} stroke={C.cherryText} />
          <Fan x1={375} y1={97 + i * 34} x2={170} y2={96} k={answer !== null ? easeInOut(seg(s, 0.6 + i * 0.2, 1.1 + i * 0.2)) : 0} f={C.cherryText} />
        </g>
      ))}
      {v > 0 && (
        <T x={25} y={200} s={11} f={C.cherryText} o={v}>
          the same reckoning, later
        </T>
      )}
      <Verdict answer={answer} text="delayed, not removed" y={236} />
    </Svg>
  );
}
