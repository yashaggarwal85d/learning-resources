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

/** An empty dashed slot. */
function Hole({ x, y, w, h = 28, o = 1, stroke = C.mocha }: { x: number; y: number; w: number; h?: number; o?: number; stroke?: string }) {
  return <rect x={x} y={y} width={w} height={h} rx={4} fill="none" stroke={stroke} strokeWidth={1.5} strokeDasharray="4 3" opacity={o} />;
}

/** A watermark flag: a vertical focus line at x from y1 to y2, drawn by `k`, its name above. */
function Flag({ x, y1, y2, k, label }: { x: number; y1: number; y2: number; k: number; label: string }) {
  if (k <= 0) return null;
  return (
    <g opacity={k}>
      <line x1={x} y1={y1} x2={x} y2={lerp(y1, y2, k)} stroke={C.focus} strokeWidth={2.5} />
      <T x={x} y={y1 - 8} s={11} f={C.focus} a="middle">
        {label}
      </T>
    </g>
  );
}

// 0 · Hook. The log runs along the top; the chunk reads orders 21-23 while a DELETE of 22 lands in the log at the same
// moment. With no marker, the output carries 22 straight back, in cherry.
export function Hook({ t }: StepCtx) {
  const lg = easeInOut(seg(t, 0.1, 2.0));
  const del = easeOut(seg(t, 1.0, 1.3));
  const out = (i: number) => easeOut(seg(t, 2.0 + i * 0.2, 2.3 + i * 0.2));
  const bad = t >= 2.8;
  return (
    <Svg label="a chunk's own row is read at the same instant a transaction deletes that order; without any marker in the log, the snapshot brings the deleted order back." h={220}>
      <T x={25} y={22} s={11} f={C.latte}>
        the log
      </T>
      <line x1={25} y1={44} x2={25 + 520 * lg} y2={44} stroke={C.mocha} strokeWidth={1.4} />
      <Cell x={260} y={30} w={130} label="DELETE 22" o={del} stroke={C.cherryText} />
      <T x={25} y={90} s={11} f={C.latte} o={easeOut(seg(t, 0.6, 0.9))}>
        the chunk reads
      </T>
      {['21', '22', '23'].map((id, i) => (
        <Cell key={i} x={25 + i * 70} y={98} w={60} label={id} o={easeOut(seg(t, 0.8 + i * 0.1, 1.1 + i * 0.1))} />
      ))}
      <T x={25} y={160} s={11} f={C.latte} o={out(0)}>
        snapshot output
      </T>
      {['21', '22', '23'].map((id, i) => (
        <Cell key={i} x={25 + i * 70} y={168} w={60} label={id} o={out(i)} stroke={i === 1 && bad ? C.cherryText : C.mocha} f={i === 1 && bad ? C.cherryText : C.crema} />
      ))}
      {bad && (
        <T x={250} y={187} s={13} f={C.cherryText} o={easeOut(seg(t, 2.8, 3.2))}>
          deleted, and back again
        </T>
      )}
    </Svg>
  );
}

// 1 · Predict. Low and high markers bracket the chunk's read on the log; DELETE 22 lands inside them. Once answered,
// the chunk's copy of 22 crosses out to an empty slot.
export function Predict({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.2, 0.8)) : 0;
  return (
    <Svg label="does the deleted order come back in this chunk's own output, or does it stay gone?" h={200}>
      <line x1={25} y1={70} x2={545} y2={70} stroke={C.mocha} strokeWidth={1.4} />
      <Flag x={100} y1={40} y2={82} k={easeOut(seg(t, 0.1, 0.4))} label="low" />
      <Flag x={440} y1={40} y2={82} k={easeOut(seg(t, 0.4, 0.7))} label="high" />
      <Cell x={210} y={86} w={130} label="DELETE 22" o={easeOut(seg(t, 0.8, 1.1))} stroke={C.cherryText} />
      {v > 0 && <Hole x={25} y={128} w={70} o={v} stroke={C.focus} />}
      <Cell x={25} y={128} w={70} label="22" o={easeOut(seg(t, 1.0, 1.3)) * (1 - v)} />
      <T x={110} y={147} s={11} f={C.latte} o={easeOut(seg(t, 1.1, 1.4))}>
        the chunk's copy
      </T>
      <AnswerRow y={184} label="order 22" answer={answer} value="stays gone" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 2 · The window. The low marker is written; four rows load into memory; an UPDATE of 15 arrives on the log between the
// markers and outranks the chunk's copy; the high marker closes the window.
export function RevealWatermarkWindow({ t }: StepCtx) {
  const up = easeOut(seg(t, 1.9, 2.2));
  const wins = t >= 2.3;
  return (
    <Svg label="a chunk opens with one marker, reads its rows, and closes with a second marker; anything touched between the two markers outranks the chunk's own copy." h={200}>
      <line x1={25} y1={70} x2={25 + 520 * easeInOut(seg(t, 0, 3.0))} y2={70} stroke={C.mocha} strokeWidth={1.4} />
      <Flag x={80} y1={44} y2={84} k={easeOut(seg(t, 0.3, 0.6))} label="low marker" />
      <Cell x={240} y={56} w={130} label="UPDATE 15" o={up} stroke={C.second} />
      <Flag x={470} y1={44} y2={84} k={easeOut(seg(t, 2.8, 3.1))} label="high marker" />
      <T x={25} y={112} s={11} f={C.latte} o={easeOut(seg(t, 0.9, 1.2))}>
        the chunk, in memory
      </T>
      {['14', '15', '16', '17'].map((id, i) => (
        <Cell key={i} x={25 + i * 70} y={120} w={60} label={id} o={easeOut(seg(t, 1.0 + i * 0.15, 1.3 + i * 0.15))} stroke={i === 1 && wins ? C.second : C.mocha} />
      ))}
      {wins && (
        <T x={325} y={139} s={11} f={C.second} o={easeOut(seg(t, 2.3, 2.6))}>
          the log's 15 wins
        </T>
      )}
      {t >= 3.3 && (
        <T x={300} y={188} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.3, 3.7))}>
          inside the window, the log outranks the chunk
        </T>
      )}
    </Svg>
  );
}

// 3 · Supersede, measured. Top: id 15's stale copy is replaced by 'updated mid-chunk', once. Bottom: id 22 is read,
// deleted inside the window, and the output slot stays empty.
export function RevealSupersedeMeasured({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.5));
  const b = easeOut(seg(t, 2.2, 2.5));
  return (
    <Svg label="the real run: an update inside the window replaces the chunk's own stale copy; a delete inside the window removes the row outright, with no resurrection." h={220}>
      <T x={25} y={22} s={11} f={C.latte} o={a}>
        update inside the window
      </T>
      <Cell x={25} y={30} w={90} label="id 15" o={a} />
      <Cell x={130} y={30} w={160} label="stale copy" o={easeOut(seg(t, 0.4, 0.7))} />
      <Req x1={295} x2={375} y={44} k={easeOut(seg(t, 0.9, 1.3))} f={C.second} />
      <Cell x={380} y={30} w={170} label="updated mid-chunk" o={easeOut(seg(t, 1.3, 1.6))} stroke={C.second} />
      {t >= 1.7 && (
        <T x={380} y={80} s={11} f={C.focus} o={easeOut(seg(t, 1.7, 2.0))}>
          appears exactly once
        </T>
      )}
      <T x={25} y={120} s={11} f={C.latte} o={b}>
        delete inside the window
      </T>
      <Cell x={25} y={128} w={90} label="id 22" o={b} />
      <Cell x={130} y={128} w={160} label="chunk read it" o={easeOut(seg(t, 2.4, 2.7))} />
      <Req x1={295} x2={375} y={142} k={easeOut(seg(t, 2.9, 3.3))} f={C.cherryText} />
      <Hole x={380} y={128} w={170} o={easeOut(seg(t, 3.3, 3.6))} stroke={C.focus} />
      {t >= 3.6 && (
        <T x={380} y={180} s={11} f={C.focus} o={easeOut(seg(t, 3.6, 3.9))}>
          gone, no resurrection
        </T>
      )}
    </Svg>
  );
}

// 4 · No lock. The log keeps flowing left beneath its label the whole time; chunks tick through one by one, each
// writing only its two markers; the source table is never locked.
export function RevealNoLockInterleaved({ t }: StepCtx) {
  return (
    <Svg label="the only writes this algorithm makes are the two marker updates; the log keeps flowing the entire time, chunk after chunk, with no table lock anywhere." h={200}>
      <T x={25} y={36} s={11} f={C.latte}>
        the log, never paused
      </T>
      <line x1={25} y1={70} x2={545} y2={70} stroke={C.mocha} strokeWidth={1.2} />
      {Array.from({ length: 20 }, (_, i) => {
        const x = 545 - ((t * 70 + i * 26) % 520);
        const mark = i % 5 === 0;
        return <line key={i} x1={x} y1={mark ? 54 : 62} x2={x} y2={mark ? 86 : 78} stroke={mark ? C.focus : C.latte} strokeWidth={mark ? 2.5 : 1.4} />;
      })}
      {[0, 1, 2, 3].map((i) => (
        <g key={i} opacity={easeOut(seg(t, 0.4 + i * 0.7, 0.7 + i * 0.7))}>
          <Cell x={25 + i * 90} y={110} w={80} label={`chunk ${i + 1}`} />
          <MiniTick x={58 + i * 90} y={148} k={easeOut(seg(t, 0.7 + i * 0.7, 1.0 + i * 0.7))} />
        </g>
      ))}
      <T x={390} y={128} s={11} f={C.focus} o={easeOut(seg(t, 1.0, 1.3))}>
        2 marker writes each
      </T>
      {t >= 3.3 && (
        <T x={300} y={190} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.3, 3.7))}>
          no table lock, anywhere, ever
        </T>
      )}
    </Svg>
  );
}

// 5 · Full run, measured. 240 rows in six chunks of 40 fill one by one; after each chunk an update, a delete and an
// insert pip land; at the end the target bar equals the source bar.
export function RevealFullRunMeasured({ t }: StepCtx) {
  const ch = (i: number) => easeOut(seg(t, 0.3 + i * 0.4, 0.6 + i * 0.4));
  const d = easeOut(seg(t, 3.0, 3.4));
  return (
    <Svg label="the real run: a whole table copied chunk by chunk, with real updates, deletes and inserts fired between every single chunk, diffed against the source at the end." h={220}>
      <T x={25} y={22} s={11} f={C.latte}>
        240 rows, 6 chunks of 40
      </T>
      {Array.from({ length: 6 }, (_, i) => (
        <g key={i}>
          <rect x={25 + i * 88} y={30} width={80} height={26} rx={3} fill={C.latte} opacity={ch(i)} />
          {[C.second, C.cherryText, C.focus].map((f, j) => (
            <circle key={j} cx={53 + i * 88 + j * 12} cy={72} r={4} fill={f} opacity={easeOut(seg(t, 0.6 + i * 0.4, 0.75 + i * 0.4))} />
          ))}
        </g>
      ))}
      <T x={25} y={104} s={11} f={C.latte} o={easeOut(seg(t, 0.8, 1.1))}>
        between every chunk: an update, a delete, an insert
      </T>
      <T x={25} y={140} s={11} f={C.latte} o={d}>
        target
      </T>
      <rect x={100} y={130} width={440 * d} height={12} fill={C.focus} />
      <T x={25} y={164} s={11} f={C.latte} o={d}>
        source
      </T>
      <rect x={100} y={154} width={440 * d} height={12} fill={C.latte} />
      <MiniTick x={25} y={196} k={easeOut(seg(t, 3.5, 3.9))} />
      {t >= 3.5 && (
        <T x={45} y={202} s={13} f={C.focus} o={easeOut(seg(t, 3.5, 3.8))}>
          diff: an exact match
        </T>
      )}
    </Svg>
  );
}

// 6 · Pause and resume. Chunks fill; a pause lands mid-chunk three, whose partial rows drop; a bookmark sits at the end
// of chunk two. On resume, chunk three is redone and the run carries on.
export function RevealPauseResume({ t }: StepCtx) {
  const ch = (i: number) => {
    if (i < 2) return easeOut(seg(t, 0.2 + i * 0.4, 0.5 + i * 0.4));
    if (i === 2) return t < 1.5 ? 0.5 * seg(t, 1.0, 1.4) : easeOut(seg(t, 2.6, 2.9));
    return easeOut(seg(t, 2.9 + (i - 3) * 0.3, 3.2 + (i - 3) * 0.3));
  };
  const paused = t >= 1.4 && t < 2.6;
  return (
    <Svg label="only the last finished chunk's own position is ever stored; stopping partway through and picking up from that position costs nothing extra." h={200}>
      {Array.from({ length: 6 }, (_, i) => (
        <g key={i}>
          <rect x={25 + i * 88} y={50} width={80} height={26} rx={3} fill="none" stroke={C.mocha} strokeWidth={1.2} />
          <rect x={25 + i * 88} y={50} width={80 * ch(i)} height={26} rx={3} fill={C.latte} />
        </g>
      ))}
      <path d={`M${25 + 2 * 88 - 4} 84 l-6 9 h12 z`} fill={C.focus} opacity={easeOut(seg(t, 1.0, 1.3))} />
      <T x={25} y={112} s={11} f={C.focus} o={easeOut(seg(t, 1.0, 1.3))}>
        stored: last finished chunk
      </T>
      {paused && (
        <g opacity={easeOut(seg(t, 1.4, 1.7))}>
          <rect x={290} y={96} width={6} height={20} fill={C.latte} />
          <rect x={302} y={96} width={6} height={20} fill={C.latte} />
          <T x={320} y={112} s={11} f={C.latte}>
            stopped
          </T>
        </g>
      )}
      {t >= 3.6 && (
        <T x={300} y={165} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.6, 4.0))}>
          the cost: one chunk redone
        </T>
      )}
    </Svg>
  );
}

// 7 · Pause, measured. Two lanes of six chunks of 20: one straight through, one stopped after chunk two and resumed
// from there. Both end on the same 120-row state.
export function RevealPauseResumeMeasured({ t }: StepCtx) {
  const a = (i: number) => easeOut(seg(t, 0.2 + i * 0.3, 0.45 + i * 0.3));
  const b = (i: number) => (i < 2 ? easeOut(seg(t, 0.2 + i * 0.3, 0.45 + i * 0.3)) : easeOut(seg(t, 2.3 + (i - 2) * 0.3, 2.55 + (i - 2) * 0.3)));
  return (
    <Svg label="the real run: one run finishes its chunks without stopping; a second run is stopped after its second chunk and later resumes from that exact point; both finish identical." h={220}>
      <T x={25} y={22} s={11} f={C.latte}>
        straight through
      </T>
      <T x={25} y={92} s={11} f={C.latte}>
        stopped after chunk 2, resumed
      </T>
      {Array.from({ length: 6 }, (_, i) => (
        <g key={i}>
          <rect x={25 + i * 88} y={30} width={80} height={24} rx={3} fill={C.latte} opacity={a(i)} />
          <rect x={25 + i * 88} y={100} width={80} height={24} rx={3} fill={C.latte} opacity={b(i)} />
        </g>
      ))}
      {t >= 1.0 && t < 2.3 && (
        <g opacity={easeOut(seg(t, 1.0, 1.3))}>
          <rect x={196} y={130} width={5} height={16} fill={C.latte} />
          <rect x={206} y={130} width={5} height={16} fill={C.latte} />
        </g>
      )}
      <MiniTick x={25} y={180} k={easeOut(seg(t, 3.9, 4.3))} />
      {t >= 3.9 && (
        <T x={45} y={186} s={13} f={C.focus} o={easeOut(seg(t, 3.9, 4.2))}>
          both end identical: 120 rows
        </T>
      )}
    </Svg>
  );
}

// 8 · Recap. One mechanism at the top, three jobs below it, each joined by a line.
export function Recap({ t }: StepCtx) {
  const jobs = ['log outranks chunk', 'no table lock', 'pause at any chunk'];
  const c = easeOut(seg(t, 0.2, 0.6));
  return (
    <Svg label="a window of two markers lets any chunk be superseded by the log, needs no lock, and can pause and resume at any chunk boundary." h={260}>
      <Cell x={190} y={30} w={220} label="a two-marker window" o={c} stroke={C.focus} f={C.focus} />
      {jobs.map((j, i) => {
        const l = easeOut(seg(t, 0.8 + i * 0.6, 1.2 + i * 0.6));
        const x = 25 + i * 190;
        return (
          <g key={i}>
            {l > 0 && <line x1={300} y1={60} x2={lerp(300, x + 85, l)} y2={lerp(60, 128, l)} stroke={C.focus} strokeWidth={1.6} />}
            <Cell x={x} y={130} w={170} label={j} o={easeOut(seg(t, 1.1 + i * 0.6, 1.4 + i * 0.6))} />
          </g>
        );
      })}
      {t >= 3.2 && (
        <T x={300} y={215} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.2, 3.6))}>
          one mechanism, three jobs
        </T>
      )}
    </Svg>
  );
}

// 9 · Prove it. Three tables stream with flowing ticks; a fourth sits as a dashed, empty lane. Once answered, that lane
// alone fills while the others keep flowing.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeInOut(seg(s, 0.3, 1.5)) : 0;
  const names = ['orders', 'users', 'items'];
  return (
    <Svg label="a table gets added to a running connector after the fact, and nobody wants to stop the stream to pick it up. What actually triggers that one table's own snapshot?" h={200}>
      {names.map((n, r) => (
        <g key={r}>
          <T x={25} y={34 + r * 26} s={11} f={C.latte}>
            {n}
          </T>
          <line x1={120} y1={30 + r * 26} x2={545} y2={30 + r * 26} stroke={C.mocha} strokeWidth={1} />
          {Array.from({ length: 8 }, (_, i) => {
            const x = 545 - ((t * 60 + i * 53 + r * 17) % 425);
            return <circle key={i} cx={x} cy={30 + r * 26} r={3} fill={C.latte} />;
          })}
        </g>
      ))}
      <T x={25} y={112} s={11} f={C.latte}>
        returns, new
      </T>
      <rect x={120} y={102} width={425} height={14} rx={3} fill="none" stroke={C.mocha} strokeDasharray="4 3" strokeWidth={1.2} />
      <rect x={120} y={102} width={425 * v} height={14} rx={3} fill={C.focus} />
      {v > 0 && (
        <T x={120} y={140} s={11} f={C.focus} o={clamp(v * 3, 0, 1)}>
          a signal names it; only it snapshots
        </T>
      )}
      <AnswerRow y={182} label="trigger" answer={answer} value="a signal naming it" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}
