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

/** An empty dashed slot, for a state or row nobody can see any more. */
function Hole({ x, y, w, h = 28, o = 1, stroke = C.mocha }: { x: number; y: number; w: number; h?: number; o?: number; stroke?: string }) {
  return <rect x={x} y={y} width={w} height={h} rx={4} fill="none" stroke={stroke} strokeWidth={1.5} strokeDasharray="4 3" opacity={o} />;
}

/** A reply arrow from x1 back left toward x2, drawn by `k`. */
function Back({ x1, x2, y, k, f = C.crema }: { x1: number; x2: number; y: number; k: number; f?: string }) {
  if (k <= 0) return null;
  const x = lerp(x1, x2, k);
  return (
    <g>
      <line x1={x1} y1={y} x2={x} y2={y} stroke={f} strokeWidth={1.8} />
      <path d={`M${x} ${y} l8 -5 v10 z`} fill={f} />
    </g>
  );
}

const ST = ['new', 'paid', 'shipped', 'refunded'];
const SXs = [30, 155, 280, 405];

// 0 · Hook. The four states land on a time axis seconds apart; the poll samples once, at refunded; the first three fade
// to holes and the record below holds only refunded.
export function Hook({ t }: StepCtx) {
  const poll = easeOut(seg(t, 2.3, 2.7));
  const fade = easeOut(seg(t, 2.9, 3.4));
  return (
    <Svg label="order one-oh-four-two goes new, paid, shipped, refunded within seconds; a poll samples once and sees only refunded." h={220}>
      {ST.map((s, i) => {
        const k = easeOut(seg(t, 0.3 + i * 0.5, 0.6 + i * 0.5));
        return (
          <g key={i}>
            {i < 3 && fade > 0 && <Hole x={SXs[i]} y={40} w={100} o={fade} />}
            <Cell x={SXs[i]} y={40} w={100} label={s} o={k * (i < 3 ? 1 - fade : 1)} stroke={i === 3 && poll > 0 ? C.focus : C.mocha} />
          </g>
        );
      })}
      <line x1={25} y1={90} x2={25 + 520 * easeOut(seg(t, 0, 0.5))} y2={90} stroke={C.mocha} strokeWidth={1.4} />
      <path d="M455 92 l-7 12 h14 z" fill={C.focus} opacity={poll} />
      <T x={455} y={122} s={11} f={C.focus} a="middle" o={poll}>
        poll samples once
      </T>
      <T x={25} y={152} s={11} f={C.latte} o={easeOut(seg(t, 3.2, 3.5))}>
        what the record says
      </T>
      <Cell x={405} y={160} w={100} label="refunded" o={easeOut(seg(t, 3.3, 3.7))} />
      {t >= 3.8 && (
        <T x={210} y={208} s={13} f={C.cherryText} a="middle" o={easeOut(seg(t, 3.8, 4.2))}>
          no trace of paid or shipped
        </T>
      )}
    </Svg>
  );
}

// 1 · Predict. The same four states; a trigger line drops from each toward a shadow table whose slots are still empty.
// Once answered, all four slots fill.
export function Predict({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  return (
    <Svg label="the identical sequence, but a trigger copies every change to a shadow table as it happens. Does it see what the poll missed?" h={200}>
      {ST.map((st, i) => {
        const k = easeOut(seg(t, 0.1 + i * 0.2, 0.4 + i * 0.2));
        const d = easeOut(seg(t, 0.9 + i * 0.15, 1.3 + i * 0.15));
        const v = answer !== null ? easeOut(seg(s, 0.2 + i * 0.15, 0.6 + i * 0.15)) : 0;
        return (
          <g key={i}>
            <Cell x={SXs[i]} y={24} w={100} label={st} o={k} />
            {d > 0 && <line x1={SXs[i] + 50} y1={56} x2={SXs[i] + 50} y2={lerp(56, 98, d)} stroke={C.mocha} strokeWidth={1.4} strokeDasharray="3 3" />}
            {v > 0 ? <Cell x={SXs[i]} y={102} w={100} label={st} o={v} stroke={C.second} /> : <Hole x={SXs[i]} y={102} w={100} o={d} />}
          </g>
        );
      })}
      <T x={25} y={150} s={11} f={C.latte} o={easeOut(seg(t, 1.2, 1.5))}>
        shadow table
      </T>
      <AnswerRow y={184} label="shadow sees" answer={answer} value="all four" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 2 · A poll samples. Three poll lines on a timer; between the first two, the row's state climbs through three levels,
// in a shaded gap the poll never looks into. The polls mark only where they land.
export function RevealPollSample({ t }: StepCtx) {
  const polls = [100, 300, 500];
  const p = easeInOut(seg(t, 1.0, 2.6));
  const lv = [125, 100, 75, 50];
  const steps: [number, number][] = [
    [25, lv[0]],
    [150, lv[0]],
    [150, lv[1]],
    [190, lv[1]],
    [190, lv[2]],
    [240, lv[2]],
    [240, lv[3]],
    [545, lv[3]],
  ];
  const xEnd = 25 + 520 * p;
  const pts = steps.filter(([x]) => x <= xEnd).map(([x, y]) => `${x},${y}`);
  const last = steps.filter(([x]) => x <= xEnd).pop();
  if (last && p > 0) pts.push(`${xEnd},${last[1]}`);
  const sh = easeOut(seg(t, 2.8, 3.3));
  return (
    <Svg label="a poll is one query, run on a schedule; between two runs, a row can pass through any number of states." h={200}>
      {sh > 0 && <rect x={106} y={40} width={188} height={98} fill={C.cocoa} opacity={sh} />}
      <line x1={25} y1={140} x2={545} y2={140} stroke={C.mocha} strokeWidth={1.4} />
      {polls.map((x, i) => {
        const k = easeOut(seg(t, 0.2 + i * 0.25, 0.5 + i * 0.25));
        return (
          <g key={i} opacity={k}>
            <line x1={x} y1={40} x2={x} y2={140} stroke={C.focus} strokeWidth={2} strokeDasharray="5 4" />
            <T x={x} y={30} s={11} f={C.focus} a="middle">
              poll
            </T>
          </g>
        );
      })}
      {pts.length > 1 && <polyline points={pts.join(' ')} fill="none" stroke={C.latte} strokeWidth={2.5} />}
      {xEnd >= 100 && <circle cx={100} cy={lv[0]} r={5} fill={C.focus} />}
      {xEnd >= 300 && <circle cx={300} cy={lv[3]} r={5} fill={C.focus} />}
      {sh > 0 && (
        <T x={200} y={170} s={11} f={C.cherryText} a="middle" o={sh}>
          between runs: invisible
        </T>
      )}
    </Svg>
  );
}

// 3 · Measured. One poll query returns a single chip, refunded, beside three empty slots. The replication slot streams
// all four states in, in order.
export function RevealIntermediateMeasured({ t }: StepCtx) {
  return (
    <Svg label="the real run: one poll query against a real replication slot reading every change." h={220}>
      <T x={25} y={24} s={11} f={C.latte}>
        one poll query
      </T>
      {ST.map((s, i) =>
        i === 3 ? <Cell key={i} x={SXs[i]} y={32} w={100} label={s} o={easeOut(seg(t, 0.4, 0.8))} /> : <Hole key={i} x={SXs[i]} y={32} w={100} o={easeOut(seg(t, 0.4, 0.8))} stroke={C.cherryText} />,
      )}
      <T x={25} y={100} s={11} f={C.latte} o={easeOut(seg(t, 1.2, 1.5))}>
        replication slot
      </T>
      {ST.map((s, i) => (
        <Cell key={i} x={SXs[i]} y={108} w={100} label={s} o={easeOut(seg(t, 1.6 + i * 0.4, 1.9 + i * 0.4))} stroke={C.focus} />
      ))}
      {t >= 3.5 && (
        <T x={25} y={180} s={13} f={C.focus} o={easeOut(seg(t, 3.5, 3.9))}>
          all four, in the order they happened
        </T>
      )}
    </Svg>
  );
}

// 4 · The delete gap. Between the last poll and the next, a row is inserted and then deleted. The next poll asks back
// to its watermark what changed, and finds nothing left.
export function RevealDeleteGap({ t }: StepCtx) {
  const ins = easeOutBack(seg(t, 0.5, 0.9));
  const del = easeOut(seg(t, 1.6, 2.0));
  const ask = easeOut(seg(t, 2.5, 3.2));
  return (
    <Svg label="a row is inserted and deleted inside one window; a poll asking what changed finds nothing left to find." h={200}>
      <line x1={25} y1={140} x2={545} y2={140} stroke={C.mocha} strokeWidth={1.4} />
      {[
        [100, 'last poll'],
        [480, 'next poll'],
      ].map(([x, l], i) => (
        <g key={i}>
          <line x1={x as number} y1={40} x2={x as number} y2={140} stroke={C.focus} strokeWidth={2} strokeDasharray="5 4" />
          <T x={x as number} y={30} s={11} f={C.focus} a="middle">
            {l as string}
          </T>
        </g>
      ))}
      {del > 0 && <Hole x={190} y={74} w={150} o={del} stroke={C.cherryText} />}
      <Cell x={190} y={74} w={150} label="a new row" o={clamp(ins, 0, 1) * (1 - del)} />
      {del > 0 && (
        <T x={265} y={124} s={11} f={C.cherryText} a="middle" o={del}>
          deleted
        </T>
      )}
      <Back x1={470} x2={110} y={56} k={ask} />
      {t >= 3.3 && (
        <T x={300} y={175} s={13} f={C.cherryText} a="middle" o={easeOut(seg(t, 3.3, 3.7))}>
          what changed? nothing left to find
        </T>
      )}
    </Svg>
  );
}

// 5 · Delete, measured. The poll's watermark query comes back with zero rows and an empty box; the slot returns exactly
// one delete event card.
export function RevealDeleteMeasured({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 0.7));
  const b = easeOut(seg(t, 2.0, 2.4));
  return (
    <Svg label="the real run: the poll's own query against the exact delete event in the log." h={220}>
      <Row y={40} label="poll's watermark query" value="0 rows" valueColor={C.cherryText} k={a} />
      <Hole x={25} y={58} w={250} o={easeOut(seg(t, 0.8, 1.2))} />
      {t >= 1.2 && (
        <T x={290} y={77} s={11} f={C.latte} o={easeOut(seg(t, 1.2, 1.5))}>
          as if it never existed
        </T>
      )}
      <Row y={130} label="replication slot" value="1 delete event" valueColor={C.focus} k={b} />
      <Cell x={25} y={148} w={300} label="DELETE: the row, and when" o={easeOut(seg(t, 2.5, 2.9))} stroke={C.focus} />
    </Svg>
  );
}

// 6 · Trigger cost. One transaction box; the UPDATE to orders draws in, then the trigger's copy to the shadow table
// inside the same box; the box commits both.
export function RevealTriggerCost({ t }: StepCtx) {
  const box = easeOut(seg(t, 0.1, 0.5));
  const w1 = easeOut(seg(t, 0.6, 1.2));
  const w2 = easeOut(seg(t, 1.5, 2.1));
  const cm = easeOut(seg(t, 2.6, 3.0));
  return (
    <Svg label="a trigger copying a change into a shadow table runs inside the identical transaction as the write itself." h={200}>
      <T x={25} y={22} s={11} f={C.latte} o={box}>
        one transaction
      </T>
      <rect x={25} y={30} width={530} height={104} rx={6} fill="none" stroke={cm > 0 ? C.focus : C.mocha} strokeWidth={1.5} strokeDasharray="6 4" opacity={box} />
      <Cell x={45} y={46} w={170} label="UPDATE orders" o={w1} />
      <Req x1={220} x2={345} y={60} k={w1} />
      <Cell x={350} y={46} w={180} label="orders" o={w1} />
      <Cell x={45} y={90} w={170} label="trigger" o={w2} stroke={C.cherryText} />
      <Req x1={220} x2={345} y={104} k={w2} f={C.cherryText} />
      <Cell x={350} y={90} w={180} label="shadow table" o={w2} stroke={C.cherryText} />
      <MiniTick x={25} y={156} k={cm} />
      {cm > 0 && (
        <T x={45} y={162} s={11} f={C.focus} o={cm}>
          commits both, together
        </T>
      )}
      {t >= 3.3 && (
        <T x={300} y={192} s={13} f={C.cherryText} a="middle" o={easeOut(seg(t, 3.3, 3.7))}>
          every write is now two
        </T>
      )}
    </Svg>
  );
}

// 7 · Costs, measured. Four writes to orders; under each a shadow row drops in, one for one. Below, the slot reads the
// same four from the log it already had.
export function RevealCostsMeasured({ t }: StepCtx) {
  const w = (i: number) => easeOut(seg(t, 0.3 + i * 0.4, 0.6 + i * 0.4));
  const sr = (i: number) => easeOut(seg(t, 0.5 + i * 0.4, 0.8 + i * 0.4));
  return (
    <Svg label="the real run: four writes to orders producing four shadow rows, against the identical changes read for free from the log." h={220}>
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x={25 + i * 30} y={32} width={20} height={20} rx={2} fill={C.latte} opacity={w(i)} />
          {sr(i) > 0 && <line x1={35 + i * 30} y1={54} x2={35 + i * 30} y2={lerp(54, 90, sr(i))} stroke={C.cherryText} strokeWidth={1.4} />}
          <rect x={25 + i * 30} y={92} width={20} height={20} rx={2} fill={C.cherryText} opacity={sr(i)} />
          <rect x={25 + i * 30} y={160} width={20} height={20} rx={2} fill={C.focus} opacity={easeOut(seg(t, 2.6 + i * 0.1, 2.9 + i * 0.1))} />
        </g>
      ))}
      <T x={150} y={46} s={11} f={C.latte} o={w(0)}>
        writes to orders
      </T>
      <T x={150} y={106} s={11} f={C.cherryText} o={sr(0)}>
        shadow rows
      </T>
      {t >= 2.1 && (
        <T x={330} y={80} s={13} f={C.cherryText} o={easeOut(seg(t, 2.1, 2.4))}>
          4 writes, 4 shadow rows
        </T>
      )}
      <T x={150} y={174} s={11} f={C.focus} o={easeOut(seg(t, 2.6, 2.9))}>
        slot: read from the log, nothing extra
      </T>
    </Svg>
  );
}

// 8 · Recap. Poll, trigger, log, each with its pip picture and its bill. Then a pending line: the log's bill is not the
// whole story.
export function Recap({ t }: StepCtx) {
  const rows: [string, string, string][] = [
    ['poll', 'misses what is between', C.cherryText],
    ['trigger', 'sees all, doubles writes', C.latte],
    ['log', 'sees all, nothing extra', C.focus],
  ];
  return (
    <Svg label="a poll's one sample, a trigger's doubled write, and a log's complete, ordered, low-overhead read." h={260}>
      {rows.map(([n, d, f], i) => {
        const k = easeOut(seg(t, 0.2 + i * 0.8, 0.6 + i * 0.8));
        const y = 30 + i * 56;
        return (
          <g key={i} opacity={k}>
            <Cell x={25} y={y} w={130} label={n} />
            {[0, 1, 2, 3].map((j) => (
              <rect key={j} x={175 + j * 16} y={y + 4} width={12} height={12} rx={2} fill={i === 0 && j < 3 ? 'none' : f} stroke={i === 0 && j < 3 ? C.mocha : 'none'} strokeDasharray="2 2" />
            ))}
            {i === 1 && [0, 1, 2, 3].map((j) => <rect key={j} x={175 + j * 16} y={y + 18} width={12} height={8} rx={2} fill={C.cherryText} />)}
            <T x={260} y={y + 19} s={12} f={f}>
              {d}
            </T>
          </g>
        );
      })}
      {t >= 3.4 && (
        <T x={300} y={228} s={13} f={C.latte} a="middle" o={easeOut(seg(t, 3.4, 3.8))}>
          and that last bill is not the whole story
        </T>
      )}
    </Svg>
  );
}

// 9 · Prove it. Log segments pile up; a slot parks early and every segment from it on is pinned. Once answered, what the
// held position costs appears beneath.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = (i: number) => (answer !== null ? easeOut(seg(s, 0.2 + i * 0.2, 0.6 + i * 0.2)) : 0);
  const pin = t >= 1.4;
  return (
    <Svg label="reading the log is complete and cheap. What does it cost that polling and triggers don't?" h={200}>
      {Array.from({ length: 14 }, (_, i) => (
        <rect
          key={i}
          x={25 + i * 37}
          y={30}
          width={30}
          height={26}
          rx={3}
          fill={C.cocoa}
          stroke={pin && i >= 3 ? C.cherryText : C.mocha}
          strokeWidth={1.5}
          opacity={easeOut(seg(t, i * 0.06, 0.3 + i * 0.06))}
        />
      ))}
      <path d={`M${25 + 3 * 37 + 15} 62 l-6 9 h12 z`} fill={C.focus} opacity={easeOut(seg(t, 1.0, 1.3))} />
      <T x={25 + 3 * 37 + 15} y={88} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 1.0, 1.3))}>
        slot
      </T>
      {['pins storage', 'needs privileges', 'lost on failover'].map((g, i) => (
        <T key={i} x={[25, 210, 400][i]} y={128} s={11} f={C.cherryText} o={v(i)}>
          {g}
        </T>
      ))}
      <AnswerRow y={182} label="it costs" answer={answer} value="a held position" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}
