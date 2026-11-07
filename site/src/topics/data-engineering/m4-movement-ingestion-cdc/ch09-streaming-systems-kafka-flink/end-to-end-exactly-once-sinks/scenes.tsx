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

/** A lightning-bolt crash mark at (x, y), drawn in by `k`. */
function Bolt({ x, y, k }: { x: number; y: number; k: number }) {
  return <path d={`M${x + 4} ${y - 12} l-8 12 h7 l-5 12 l11 -15 h-7 l5 -9 z`} fill={C.cherryText} opacity={k} />;
}

/** An empty dashed slot. */
function Hole({ x, y, w, h = 28, o = 1, stroke = C.mocha }: { x: number; y: number; w: number; h?: number; o?: number; stroke?: string }) {
  return <rect x={x} y={y} width={w} height={h} rx={4} fill="none" stroke={stroke} strokeWidth={1.5} strokeDasharray="4 3" opacity={o} />;
}

// 0 · Hook. A checkpoint interval bar and a shorter timeout bar; each staged write's timeout runs out before its
// checkpoint arrives, and it turns cherry and fades, checkpoint after checkpoint.
export function Hook({ t }: StepCtx) {
  return (
    <Svg label="a transaction timeout shorter than the checkpoint interval, staged writes expiring unseen" h={200}>
      <T x={25} y={30} s={11} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        checkpoint interval
      </T>
      <T x={25} y={100} s={11} f={C.cherryText} o={easeOut(seg(t, 0.2, 0.5))}>
        transaction timeout, shorter
      </T>
      {[0, 1, 2].map((i) => {
        const k0 = 0.4 + i * 1.2;
        const g = easeInOut(seg(t, k0, k0 + 1.0));
        const x = 25 + i * 180;
        const dead = easeOut(seg(t, k0 + 0.7, k0 + 0.9));
        return (
          <g key={i}>
            <rect x={x} y={40} width={170 * g} height={12} rx={3} fill={C.latte} opacity={0.6} />
            <line x1={x + 170} y1={34} x2={x + 170} y2={58} stroke={C.focus} strokeWidth={2} opacity={g >= 1 ? 1 : 0} />
            <rect x={x} y={110} width={110 * Math.min(1, g * 1.55)} height={12} rx={3} fill={C.cherryText} opacity={0.6} />
            <rect
              x={x + 30}
              y={lerp(140, 150, dead)}
              width={40}
              height={20}
              rx={3}
              fill="none"
              stroke={dead > 0 ? C.cherryText : C.second}
              strokeWidth={1.5}
              opacity={easeOut(seg(t, k0, k0 + 0.2)) * (1 - 0.7 * dead)}
            />
          </g>
        );
      })}
      <T x={25} y={192} s={11} f={C.cherryText} o={easeOut(seg(t, 3.8, 4.2))}>
        every staged write expires before it's finished
      </T>
    </Svg>
  );
}

// 1 · Setup. A Kafka box with its transaction inside; the boundary draws at its wall; outside, a database, a file and
// an API sit beyond it, each a dashed slot needing its own answer.
export function Setup({ t }: StepCtx) {
  return (
    <Svg label="a Kafka transaction stops at Kafka's own edge; a non-Kafka sink needs its own mechanism" h={200}>
      <rect x={25} y={30} width={230} height={110} rx={8} fill="none" stroke={C.focus} strokeWidth={1.6} opacity={easeOut(seg(t, 0, 0.4))} />
      <T x={37} y={50} s={11} f={C.focus} o={easeOut(seg(t, 0, 0.4))}>
        Kafka
      </T>
      <Cell x={45} y={70} w={190} label="transaction" o={easeOut(seg(t, 0.4, 0.8))} />
      {['a database', 'a file', 'an outside API'].map((n, i) => (
        <g key={n} opacity={easeOut(seg(t, 1.4 + i * 0.4, 1.8 + i * 0.4))}>
          <Hole x={330} y={30 + i * 40} w={220} stroke={C.second} />
          <T x={440} y={49 + i * 40} s={11} f={C.second} a="middle">
            {n}
          </T>
        </g>
      ))}
      <T x={25} y={180} s={12} f={C.crema} o={easeOut(seg(t, 3.2, 3.6))}>
        out there, each needs its own answer
      </T>
    </Svg>
  );
}

// 2 · Predict. A write sits staged; a bolt strikes before the checkpoint confirms. On answer recovery finds it and the
// write turns visible, once.
export function PredictCrash({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  return (
    <Svg label="a crash lands right after pre-commit, before the checkpoint is confirmed complete" h={200}>
      <Cell x={25} y={40} w={170} label="order-42: staged" o={easeOut(seg(t, 0, 0.3))} stroke={C.second} />
      <Bolt x={240} y={54} k={easeOut(seg(t, 0.4, 0.7))} />
      <Hole x={300} y={40} w={250} o={easeOut(seg(t, 0.2, 0.5))} />
      <T x={425} y={59} s={11} f={C.latte} a="middle" o={answer === null ? easeOut(seg(t, 0.2, 0.5)) : 0}>
        checkpoint confirmed?
      </T>
      {v > 0 && <Cell x={300} y={40} w={250} label="order-42: visible, once" o={v} stroke={C.focus} />}
      <AnswerRow y={178} label="the staged write" answer={answer} value="finished on recovery" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 3 · Two-phase sink. order-42 is staged, durable and dark; a bolt; recovery finds the stage and commits it; then
// order-43 goes the same way. The visible list ends with one copy of each.
export function RevealCrash({ t }: StepCtx) {
  const commit = easeOut(seg(t, 1.8, 2.3));
  const second = easeOut(seg(t, 2.8, 3.4));
  return (
    <Svg label="the staged write survives the crash and commits once recovery confirms the checkpoint" h={200}>
      <T x={25} y={28} s={11} f={C.second} o={easeOut(seg(t, 0, 0.3))}>
        staged: durable, not yet visible
      </T>
      <Cell x={25} y={38} w={160} label="order-42" o={easeOut(seg(t, 0.1, 0.4)) * (1 - 0.7 * commit)} stroke={C.second} />
      <Bolt x={215} y={52} k={easeOut(seg(t, 0.6, 0.9)) * (1 - commit)} />
      <T x={250} y={56} s={11} f={C.latte} o={easeOut(seg(t, 1.2, 1.5))}>
        recovery finds the stage
      </T>
      <T x={300} y={108} s={11} f={C.focus} o={easeOut(seg(t, 1.8, 2.1))}>
        visible
      </T>
      <Cell x={300} y={lerp(110, 118, commit)} w={120} label="order-42" o={commit} stroke={C.focus} />
      <Cell x={430} y={lerp(110, 118, second)} w={120} label="order-43" o={second} stroke={C.focus} />
      <T x={300} y={180} s={12} f={C.crema} o={easeOut(seg(t, 3.6, 4.0))}>
        one copy of each
      </T>
    </Svg>
  );
}

// 4 · Upsert. A write keyed by an id computed from its contents lands as one row; the identical retry lands on top of
// it, not beside it: still one row. A different id makes a second row.
export function RevealUpsert({ t }: StepCtx) {
  const retry = easeInOut(seg(t, 1.4, 2.2));
  const other = easeOut(seg(t, 3.0, 3.5));
  return (
    <Svg label="a retried write lands on the same row instead of a new one, keyed by a deterministic id" h={200}>
      <Cell x={25} y={40} w={170} label="id from contents" o={easeOut(seg(t, 0, 0.3))} stroke={C.second} />
      <Req x1={205} x2={345} y={54} k={easeOut(seg(t, 0.4, 0.9))} />
      <Cell x={355} y={40} w={195} label="row" o={easeOut(seg(t, 0.8, 1.1))} stroke={retry >= 1 ? C.focus : C.mocha} />
      {retry > 0 && retry < 1 && <rect x={lerp(205, 330, retry)} y={84} width={14} height={14} rx={2} fill={C.second} />}
      <T x={205} y={120} s={11} f={C.second} o={easeOut(seg(t, 1.3, 1.6))}>
        the same write, again
      </T>
      <T x={355} y={96} s={12} f={C.focus} o={easeOut(seg(t, 2.2, 2.5))}>
        row count: 1
      </T>
      <Cell x={355} y={140} w={195} label="a different id: row 2" o={other} />
      <T x={25} y={190} s={11} f={C.latte} o={easeOut(seg(t, 3.6, 4.0))}>
        lands on itself, not beside itself
      </T>
    </Svg>
  );
}

// 5 · Offset atomicity. Offset stored separately: a bolt between the write and the offset save, the gap in cherry.
// Offset stored with the write in one unit: a lock around both, no gap.
export function RevealOffsetAtomicity({ t }: StepCtx) {
  return (
    <Svg label="an offset stored separately from the output reopens a crash window at the sink boundary" h={200}>
      <T x={25} y={28} s={11} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        saved separately
      </T>
      <Cell x={25} y={38} w={180} label="output write" o={easeOut(seg(t, 0.1, 0.4))} />
      <Cell x={370} y={38} w={180} label="offset" o={easeOut(seg(t, 0.4, 0.7))} />
      <rect x={210} y={46} width={155} height={12} rx={3} fill={C.cherryText} opacity={easeOut(seg(t, 0.8, 1.2)) * 0.5} />
      <Bolt x={287} y={52} k={easeOut(seg(t, 1.2, 1.5))} />
      <T x={287} y={86} s={11} f={C.cherryText} a="middle" o={easeOut(seg(t, 1.4, 1.7))}>
        a gap opens
      </T>
      <T x={25} y={120} s={11} f={C.latte} o={easeOut(seg(t, 2.2, 2.5))}>
        saved in the same unit
      </T>
      <rect x={20} y={126} width={535} height={40} rx={6} fill="none" stroke={C.focus} strokeWidth={1.5} opacity={easeOut(seg(t, 2.8, 3.2))} />
      <Cell x={25} y={132} w={180} label="output write" o={easeOut(seg(t, 2.3, 2.6))} />
      <Cell x={lerp(390, 215, easeInOut(seg(t, 2.5, 3.0)))} y={132} w={180} label="offset" o={easeOut(seg(t, 2.4, 2.7))} />
      <Lock x={520} y={144} k={easeOut(seg(t, 3.2, 3.6))} f={C.focus} />
      <T x={25} y={190} s={11} f={C.focus} o={easeOut(seg(t, 3.6, 4.0))}>
        no gap
      </T>
    </Svg>
  );
}

// 6 · Predict. Three dashed slots for the three ways it breaks; on answer they fill in.
export function PredictBreaks({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const names = ['a retry that differs', 'an outside side effect', 'a timeout set too tight'];
  return (
    <Svg label="three real ways this guarantee quietly stops being true" h={200}>
      {names.map((n, i) => {
        const v = answer !== null ? easeOut(seg(s, 0.1 + i * 0.2, 0.5 + i * 0.2)) : 0;
        return (
          <g key={n}>
            {v > 0 ? (
              <Cell x={25} y={20 + i * 40} w={300} label={n} o={v} stroke={C.cherryText} />
            ) : (
              <Hole x={25} y={20 + i * 40} w={300} o={easeOut(seg(t, 0.2 + i * 0.15, 0.5 + i * 0.15))} stroke={C.cherryText} />
            )}
          </g>
        );
      })}
      <T x={345} y={84} s={11} f={C.latte} o={easeOut(seg(t, 0.8, 1.1))}>
        everything else working
      </T>
      <AnswerRow y={182} label="one way it breaks" answer={answer} value="any of three" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 7 · Breaks. A retry computes a different row from the first: two rows where one was meant, in cherry. A side effect
// leaves the database and can't be pulled back. A tight timeout expires a staged write before it lands.
export function RevealBreaks({ t }: StepCtx) {
  return (
    <Svg label="non-determinism, a side effect, and a short transaction timeout each break it a different way" h={260}>
      <T x={25} y={28} s={12} f={C.crema} o={easeOut(seg(t, 0, 0.3))}>
        non-determinism
      </T>
      <Cell x={25} y={38} w={150} label="first try: row A" o={easeOut(seg(t, 0.2, 0.5))} />
      <Cell x={lerp(165, 185, easeOut(seg(t, 0.7, 1.1)))} y={38} w={150} label="retry: row B" o={easeOut(seg(t, 0.7, 1.1))} stroke={C.cherryText} />
      <T x={350} y={57} s={11} f={C.cherryText} o={easeOut(seg(t, 1.1, 1.4))}>
        two where one was meant
      </T>
      <T x={25} y={108} s={12} f={C.crema} o={easeOut(seg(t, 1.6, 1.9))}>
        a side effect
      </T>
      <rect x={25} y={118} width={240} height={34} rx={5} fill="none" stroke={C.mocha} strokeWidth={1.3} opacity={easeOut(seg(t, 1.6, 1.9))} />
      <T x={37} y={140} s={11} f={C.latte} o={easeOut(seg(t, 1.6, 1.9))}>
        database: can roll back
      </T>
      <Req x1={275} x2={420} y={135} k={easeOut(seg(t, 2.0, 2.5))} label="an email goes out" f={C.cherryText} />
      <Cross x={440} y={135} k={easeOut(seg(t, 2.5, 2.8))} />
      <T x={460} y={140} s={11} f={C.cherryText} o={easeOut(seg(t, 2.6, 2.9))}>
        no undo
      </T>
      <T x={25} y={190} s={12} f={C.crema} o={easeOut(seg(t, 3.0, 3.3))}>
        a short timeout
      </T>
      <rect x={25} y={200} width={300 * easeInOut(seg(t, 3.2, 4.0))} height={10} rx={3} fill={C.latte} opacity={0.6} />
      <rect x={25} y={216} width={Math.min(170, 300 * easeInOut(seg(t, 3.2, 4.0)) * 1.3)} height={10} rx={3} fill={C.cherryText} opacity={0.6} />
      <T x={345} y={226} s={11} f={C.cherryText} o={easeOut(seg(t, 3.9, 4.3))}>
        the write expires first
      </T>
    </Svg>
  );
}

// 8 · Prove it. The run's results, one by one.
export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="this topic's own real run, every number read straight off it" h={260}>
      <Row y={50} label="2PC sink" value="order-42, order-43" valueColor={C.focus} k={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={95} label="upsert retry" value="1 row" k={easeOut(seg(t, 1.0, 1.5))} />
      <Row y={140} label="a different id" value="2 rows" k={easeOut(seg(t, 1.8, 2.3))} />
      <Row y={185} label="mismatched timeout" value="every write lost" valueColor={C.cherryText} k={easeOut(seg(t, 2.6, 3.1))} />
      <Tick y={222} k={easeOut(seg(t, 3.5, 4.0))} />
    </Svg>
  );
}

// 9 · Recap. Three lines, one by one; the ways-it-breaks line outlined.
export function Recap({ t }: StepCtx) {
  const rows = ['stage, then finish: or upsert by a repeatable id', 'keep the offset glued to the write', 'three ordinary ways it still breaks'];
  return (
    <Svg label="two-phase commit, idempotent upsert, atomic offsets, and three ways the guarantee breaks" h={260}>
      {rows.map((r, i) => {
        const k = easeOut(seg(t, 0.3 + i * 1.1, 0.8 + i * 1.1));
        return <Cell key={i} x={25} y={lerp(30, 40, k) + i * 60} w={530} label={r} o={k} stroke={i === 2 ? C.cherryText : C.mocha} />;
      })}
    </Svg>
  );
}
