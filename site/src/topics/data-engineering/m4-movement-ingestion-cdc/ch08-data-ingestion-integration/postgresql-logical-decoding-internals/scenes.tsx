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

/** A small upward caret under a log segment at x, with a label beneath it. */
function Mark({ x, y, k, label, f = C.focus }: { x: number; y: number; k: number; label?: string; f?: string }) {
  return (
    <g opacity={k}>
      <path d={`M${x} ${y} l-6 9 h12 z`} fill={f} />
      {label && (
        <T x={x} y={y + 24} s={11} f={f} a="middle">
          {label}
        </T>
      )}
    </g>
  );
}

/** Fourteen WAL segments in a strip at y; `stroke(i)` picks each one's outline. */
const SEG = (i: number) => 25 + i * 37;
function Wal({ y, k, stroke = () => C.mocha, dim = () => 1 }: { y: number; k: number; stroke?: (i: number) => string; dim?: (i: number) => number }) {
  return (
    <g>
      {Array.from({ length: 14 }, (_, i) => (
        <rect key={i} x={SEG(i)} y={y} width={30} height={22} rx={3} fill={C.cocoa} stroke={stroke(i)} strokeWidth={1.5} opacity={clamp(k * 14 - i, 0, 1) * dim(i)} />
      ))}
    </g>
  );
}

// 0 · Hook. The same update under three settings. Each row's before-image box fills with id and note under FULL,
// shrinks to id alone under DEFAULT, and stays empty under NOTHING; the after-image is whole every time.
export function Hook({ t }: StepCtx) {
  const sets: [string, number][] = [
    ['FULL', 2],
    ['DEFAULT', 1],
    ['NOTHING', 0],
  ];
  return (
    <Svg label="the same update, decoded three times under three REPLICA IDENTITY settings; the before row fills in, shrinks, or stays empty." h={220}>
      <T x={260} y={20} s={11} f={C.latte} a="middle">
        before
      </T>
      <T x={460} y={20} s={11} f={C.latte} a="middle">
        after
      </T>
      {sets.map(([n, c], i) => {
        const y = 32 + i * 62;
        const k = easeOut(seg(t, 0.2 + i * 1.1, 0.6 + i * 1.1));
        const f = easeOut(seg(t, 0.6 + i * 1.1, 1.1 + i * 1.1));
        return (
          <g key={i} opacity={k}>
            <Cell x={25} y={y} w={120} label={n} stroke={C.focus} />
            <Hole x={170} y={y - 4} w={180} h={36} stroke={c === 0 && f > 0 ? C.cherryText : C.mocha} />
            {c >= 1 && <Cell x={178} y={y} w={76} label="id" o={f} stroke={C.second} />}
            {c >= 2 && <Cell x={264} y={y} w={76} label="note" o={f} stroke={C.second} />}
            <Cell x={378} y={y} w={76} label="id" />
            <Cell x={464} y={y} w={76} label="note" />
          </g>
        );
      })}
    </Svg>
  );
}

// 1 · Predict. The slot and two peeks; the first returns the change, the second's result waits as an empty slot. Once
// answered, it fills with the identical change.
export function Predict({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.2, 0.8)) : 0;
  return (
    <Svg label="the same unconfirmed slot, peeked twice. Does the second peek come back empty, or identical to the first?" h={200}>
      <Cell x={25} y={70} w={120} label="slot" o={easeOut(seg(t, 0, 0.4))} />
      <Req x1={150} x2={330} y={50} k={easeOut(seg(t, 0.4, 0.9))} label="peek 1" />
      <Cell x={340} y={36} w={210} label="INSERT: the change" o={easeOut(seg(t, 0.8, 1.1))} />
      <Req x1={150} x2={330} y={110} k={easeOut(seg(t, 1.1, 1.6))} label="peek 2" />
      {v > 0 ? <Cell x={340} y={96} w={210} label="INSERT: the change" o={v} stroke={C.focus} /> : <Hole x={340} y={96} w={210} o={easeOut(seg(t, 1.4, 1.7))} />}
      <AnswerRow y={178} label="second peek" answer={answer} value="identical" k={easeOut(seg(t, 1.8, 2.4))} />
    </Svg>
  );
}

// 2 · Commit order. Transaction 901 starts first and runs long; 902 starts later and commits sooner. The decoded strip
// fills in commit order: 902 first, then 901.
export function RevealDecodingOrder({ t }: StepCtx) {
  const a = easeInOut(seg(t, 0.3, 3.0));
  const b = easeInOut(seg(t, 0.8, 2.0));
  return (
    <Svg label="two transactions start out of order; decoding reports them in the order they committed, not the order they began." h={200}>
      <rect x={60} y={30} width={360 * a} height={22} rx={3} fill={C.cocoa} stroke={C.latte} strokeWidth={1.5} opacity={a > 0 ? 1 : 0} />
      {a > 0.45 && (
        <T x={68} y={45} s={11} f={C.crema}>
          901 started first
        </T>
      )}
      <rect x={150} y={64} width={150 * b} height={22} rx={3} fill={C.cocoa} stroke={C.latte} strokeWidth={1.5} opacity={b > 0 ? 1 : 0} />
      {b > 0.95 && (
        <T x={158} y={79} s={11} f={C.crema}>
          902 second
        </T>
      )}
      <MiniTick x={306} y={74} k={easeOut(seg(t, 2.0, 2.3))} />
      <MiniTick x={426} y={40} k={easeOut(seg(t, 3.0, 3.3))} />
      <line x1={25} y1={104} x2={545} y2={104} stroke={C.mocha} strokeWidth={1.4} />
      <T x={25} y={124} s={11} f={C.latte} o={easeOut(seg(t, 1.9, 2.2))}>
        decoded, in order
      </T>
      <Cell x={25} y={132} w={200} label="902: started-second" o={easeOut(seg(t, 2.1, 2.5))} stroke={C.focus} />
      <Cell x={240} y={132} w={200} label="901: started-first" o={easeOut(seg(t, 3.1, 3.5))} stroke={C.focus} />
      {t >= 3.7 && (
        <T x={300} y={190} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.7, 4.1))}>
          commit order, not start order
        </T>
      )}
    </Svg>
  );
}

// 3 · Measured. Three real UPDATEs of the key, one under each setting, each with what its old-key actually carried.
export function RevealBeforeImageMeasured({ t }: StepCtx) {
  const rows: [string, string, string, string][] = [
    ['DEFAULT', 'SET id = 2 WHERE id = 1', 'old-key: id only', C.crema],
    ['FULL', 'SET id = 20 WHERE id = 10', "old-key: id, note 'b'", C.focus],
    ['NOTHING', 'SET id = 200 WHERE id = 100', 'no old-key at all', C.cherryText],
  ];
  return (
    <Svg label="the real run: one row's key changed three times, once under each REPLICA IDENTITY setting, on this sandbox's own PostgreSQL." h={220}>
      {rows.map(([n, q, r, f], i) => {
        const y = 24 + i * 64;
        const k = easeOut(seg(t, 0.2 + i * 1.1, 0.6 + i * 1.1));
        const typed = Math.round(r.length * seg(t, 0.6 + i * 1.1, 1.2 + i * 1.1));
        return (
          <g key={i} opacity={k}>
            <Cell x={25} y={y} w={120} label={n} stroke={C.focus} />
            <T x={165} y={y + 10} s={11} f={C.latte}>
              {q}
            </T>
            {typed > 0 && (
              <T x={165} y={y + 32} s={13} f={f}>
                {r.slice(0, typed)}
              </T>
            )}
          </g>
        );
      })}
    </Svg>
  );
}

// 4 · The slot's promise. The slot's position races ahead in memory; on disk it sits at the last checkpoint. The gap
// between them shows cherry, until the next checkpoint pulls the disk mark up.
export function RevealSlotPromise({ t }: StepCtx) {
  const m = easeInOut(seg(t, 0.6, 2.4));
  const cp = easeInOut(seg(t, 3.3, 3.8));
  const mx = lerp(100, 440, m);
  const dx = lerp(100, 440, cp);
  return (
    <Svg label="a slot's own position is written to disk only at a checkpoint; between checkpoints it lives only in memory." h={200}>
      {[100, 460].map((x, i) => (
        <g key={i} opacity={easeOut(seg(t, i === 0 ? 0 : 2.9, i === 0 ? 0.4 : 3.3))}>
          <line x1={x} y1={34} x2={x} y2={140} stroke={C.focus} strokeWidth={2} strokeDasharray="5 4" />
          <T x={x} y={158} s={11} f={C.focus} a="middle">
            checkpoint
          </T>
        </g>
      ))}
      <T x={25} y={50} s={11} f={C.latte}>
        memory
      </T>
      <line x1={100} y1={64} x2={545} y2={64} stroke={C.mocha} strokeWidth={1} />
      {mx - dx > 2 && <rect x={dx} y={58} width={mx - dx} height={12} fill={C.bad} opacity={0.7} />}
      <circle cx={mx} cy={64} r={7} fill={C.latte} />
      <T x={25} y={108} s={11} f={C.latte}>
        on disk
      </T>
      <line x1={100} y1={122} x2={545} y2={122} stroke={C.mocha} strokeWidth={1} />
      <circle cx={dx} cy={122} r={7} fill={C.focus} />
      {t >= 2.5 && t < 3.3 && (
        <T x={300} y={190} s={13} f={C.cherryText} a="middle" o={easeOut(seg(t, 2.5, 2.8))}>
          a crash here: delivered again
        </T>
      )}
      {t >= 3.8 && (
        <T x={300} y={190} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.8, 4.1))}>
          the checkpoint makes it durable
        </T>
      )}
    </Svg>
  );
}

// 5 · Repeats, measured. Peek one types out the decoded change; peek two types out the identical line beneath; a tick
// joins them.
export function RevealRepeatsMeasured({ t }: StepCtx) {
  const line = 'table public.topic10_peek_t: INSERT';
  const t1 = Math.round(line.length * seg(t, 0.4, 1.4));
  const t2 = Math.round(line.length * seg(t, 1.8, 2.8));
  return (
    <Svg label="the real run: the identical unconfirmed slot, peeked twice, on this sandbox's own PostgreSQL." h={220}>
      <T x={25} y={24} s={11} f={C.latte}>
        peek 1
      </T>
      <rect x={25} y={32} width={530} height={30} rx={4} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} />
      {t1 > 0 && (
        <T x={37} y={52} s={12} f={C.crema}>
          {line.slice(0, t1)}
        </T>
      )}
      <T x={25} y={94} s={11} f={C.latte} o={easeOut(seg(t, 1.6, 1.9))}>
        peek 2, still unconfirmed
      </T>
      <rect x={25} y={102} width={530} height={30} rx={4} fill={C.cocoa} stroke={t2 >= line.length ? C.focus : C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 1.6, 1.9))} />
      {t2 > 0 && (
        <T x={37} y={122} s={12} f={C.crema}>
          {line.slice(0, t2)}
        </T>
      )}
      <MiniTick x={25} y={160} k={easeOut(seg(t, 3.0, 3.4))} />
      {t >= 3.0 && (
        <T x={45} y={166} s={13} f={C.focus} o={easeOut(seg(t, 3.0, 3.3))}>
          identical, down to the byte
        </T>
      )}
      {t >= 3.7 && (
        <T x={25} y={200} s={11} f={C.latte} o={easeOut(seg(t, 3.7, 4.0))}>
          so a consumer must handle seeing it again
        </T>
      )}
    </Svg>
  );
}

// 6 · Two positions. The WAL strip; segments before restart_lsn dim as recyclable; the restart mark and the confirmed
// mark land under their segments, each with what it protects.
export function RevealTwoPositions({ t }: StepCtx) {
  const r = easeOut(seg(t, 0.9, 1.3));
  const c = easeOut(seg(t, 2.0, 2.4));
  return (
    <Svg label="restart_lsn is the oldest WAL the server still can't discard for this slot; confirmed_flush_lsn is what the consumer has acknowledged." h={200}>
      <Wal y={30} k={easeOut(seg(t, 0, 0.7))} dim={(i) => (i < 3 ? 1 - 0.6 * r : 1)} stroke={(i) => (i >= 3 && r > 0 ? C.latte : C.mocha)} />
      <Mark x={SEG(3) + 15} y={58} k={r} label="restart_lsn" f={C.latte} />
      <Mark x={SEG(9) + 15} y={58} k={c} label="confirmed_flush_lsn" />
      <T x={SEG(3) + 15} y={112} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 1.3, 1.6))}>
        oldest WAL still kept
      </T>
      <T x={SEG(9) + 15} y={112} s={11} f={C.focus} a="middle" o={easeOut(seg(t, 2.4, 2.7))}>
        acknowledged so far
      </T>
      {t >= 3.3 && (
        <T x={300} y={170} s={13} f={C.latte} a="middle" o={easeOut(seg(t, 3.3, 3.7))}>
          a promise kept, a promise made
        </T>
      )}
    </Svg>
  );
}

// 7 · Positions, measured. Before and after a confirmed read: the confirmed mark slides right, the restart mark stays,
// and the gap between them outlines cherry as log kept for nothing yet.
export function RevealPositionsMeasured({ t }: StepCtx) {
  const mv = easeInOut(seg(t, 1.6, 2.4));
  const cx = lerp(SEG(5), SEG(10), mv) + 15;
  const gap = easeOut(seg(t, 3.0, 3.4));
  return (
    <Svg label="the real run: both positions read from pg_replication_slots, before and after a confirmed read, on this sandbox's own PostgreSQL." h={220}>
      <T x={25} y={22} s={11} f={C.latte}>
        before
      </T>
      <Wal y={30} k={easeOut(seg(t, 0, 0.6))} />
      <Mark x={SEG(3) + 15} y={56} k={easeOut(seg(t, 0.4, 0.7))} f={C.latte} />
      <Mark x={SEG(5) + 15} y={56} k={easeOut(seg(t, 0.5, 0.8))} />
      <T x={25} y={102} s={11} f={C.latte} o={easeOut(seg(t, 1.0, 1.3))}>
        after a confirmed read
      </T>
      <Wal y={110} k={easeOut(seg(t, 1.0, 1.5))} />
      {gap > 0 && <rect x={SEG(3) + 15} y={106} width={cx - SEG(3) - 15} height={30} rx={3} fill="none" stroke={C.cherryText} strokeWidth={2} opacity={gap} />}
      <Mark x={SEG(3) + 15} y={140} k={easeOut(seg(t, 1.2, 1.5))} label="restart" f={C.latte} />
      <Mark x={cx} y={140} k={easeOut(seg(t, 1.4, 1.7))} label="confirmed" />
      {gap > 0 && (
        <T x={300} y={205} s={11} f={C.cherryText} a="middle" o={gap}>
          the gap: log kept on this slot's behalf
        </T>
      )}
    </Svg>
  );
}

// 8 · Recap. One server's box holds the three pieces of bookkeeping; an arrow tries to leave the box and is crossed
// out: none of it travels on its own.
export function Recap({ t }: StepCtx) {
  const items = ['what the before-image logs', 'whether a read repeats', 'where the two positions sit'];
  const out = easeOut(seg(t, 2.4, 3.0));
  return (
    <Svg label="the before-image REPLICA IDENTITY allows, a slot's tolerance for repeats, and its two separate positions." h={260}>
      <T x={25} y={22} s={11} f={C.latte}>
        one PostgreSQL server
      </T>
      <rect x={25} y={30} width={360} height={164} rx={6} fill="none" stroke={C.mocha} strokeWidth={1.5} strokeDasharray="6 4" />
      {items.map((g, i) => (
        <Cell key={i} x={45} y={48 + i * 48} w={320} label={g} o={easeOut(seg(t, 0.3 + i * 0.6, 0.7 + i * 0.6))} />
      ))}
      <Req x1={390} x2={545} y={112} k={out} f={C.cherryText} />
      <Cross x={468} y={112} k={easeOut(seg(t, 3.0, 3.3))} />
      {t >= 3.4 && (
        <T x={300} y={234} s={13} f={C.latte} a="middle" o={easeOut(seg(t, 3.4, 3.8))}>
          none of it travels on its own
        </T>
      )}
    </Svg>
  );
}

// 9 · Prove it. A primary with its slot; a standby with an empty slot where the slot would need to be. Once answered,
// the standby's slot fills in, synced.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.2, 0.8)) : 0;
  return (
    <Svg label="one slot on one server is what's been shown. What does a consumer need to survive a real failover?" h={200}>
      <Cell x={25} y={30} w={160} label="primary" o={easeOut(seg(t, 0, 0.3))} />
      <Cell x={25} y={70} w={160} label="slot" o={easeOut(seg(t, 0.2, 0.5))} stroke={C.focus} />
      <Cell x={390} y={30} w={160} label="standby" o={easeOut(seg(t, 0.3, 0.6))} />
      {v > 0 ? <Cell x={390} y={70} w={160} label="slot, synced" o={v} stroke={C.second} /> : <Hole x={390} y={70} w={160} o={easeOut(seg(t, 0.5, 0.8))} />}
      <Req x1={190} x2={385} y={44} k={easeOut(seg(t, 0.9, 1.5))} label="failover" f={C.cherryText} />
      <AnswerRow y={178} label="it needs" answer={answer} value="slot on the standby" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}
