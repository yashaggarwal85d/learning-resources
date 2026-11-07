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

/** A linger clock at (cx, cy): its ring empties as `p` runs 0 → 1. */
function Clock({ cx, cy, r, p, o = 1, f = C.second }: { cx: number; cy: number; r: number; p: number; o?: number; f?: string }) {
  const c = 2 * Math.PI * r;
  return (
    <g opacity={o}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.mocha} strokeWidth={1.5} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={f} strokeWidth={4} strokeDasharray={`${c * (1 - p)} ${c}`} transform={`rotate(-90 ${cx} ${cy})`} />
    </g>
  );
}

/** Two request lanes: one record per request on top, two per request below; `k` reveals them left to right. */
function Requests({ y1, y2, k1, k2 }: { y1: number; y2: number; k1: number; k2: number }) {
  return (
    <g>
      {Array.from({ length: 20 }, (_, i) => (
        <rect key={i} x={25 + i * 26} y={y1} width={20} height={14} rx={2} fill={C.latte} opacity={clamp(k1 * 20 - i, 0, 1)} />
      ))}
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x={25 + i * 52} y={y2} width={46} height={14} rx={2} fill={C.focus} opacity={clamp(k2 * 10 - i, 0, 1)} />
      ))}
    </g>
  );
}

// 0 · Hook. Two producers send the same records: one request per record on top, half as many fuller requests below.
export function Hook({ t }: StepCtx) {
  return (
    <Svg label="one thousand real records, two producers — one at linger.ms zero, one at Kafka's own default — how many requests does each send?" h={200}>
      <T x={25} y={30} s={12} f={C.crema} o={easeOut(seg(t, 0, 0.3))}>
        linger.ms zero
      </T>
      <T x={25} y={110} s={12} f={C.crema} o={easeOut(seg(t, 1.6, 1.9))}>
        linger.ms five
      </T>
      <Requests y1={40} y2={120} k1={easeOut(seg(t, 0.3, 1.5))} k2={easeOut(seg(t, 1.9, 3.1))} />
      <T x={550} y={30} s={12} f={C.crema} a="end" o={easeOut(seg(t, 1.3, 1.6))}>
        1,000 requests
      </T>
      <T x={550} y={110} s={12} f={C.focus} a="end" o={easeOut(seg(t, 2.9, 3.2))}>
        500 requests
      </T>
      <T x={300} y={185} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 3.6, 4.1))}>
        waiting a little, on purpose, halves the requests
      </T>
    </Svg>
  );
}

// 1 · Setup. One partition's buffer: records slide in toward the batch.size line while the linger clock's ring empties.
export function Setup({ t }: StepCtx) {
  return (
    <Svg label="one partition's accumulator — a byte-limit line and a linger clock, both still empty" h={200}>
      <T x={25} y={34} s={11} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        one partition's buffer, in memory
      </T>
      <rect x={25} y={44} width={320} height={40} rx={5} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={easeOut(seg(t, 0, 0.3))} />
      {[0, 1, 2].map((i) => {
        const k = easeOut(seg(t, 0.8 + i * 0.5, 1.2 + i * 0.5));
        return <rect key={i} x={lerp(15, 37 + i * 22, k)} y={57} width={16} height={14} rx={2} fill={C.latte} opacity={k} />;
      })}
      <line x1={345} y1={36} x2={345} y2={92} stroke={C.cherryText} strokeWidth={1.5} strokeDasharray="4 3" opacity={easeOut(seg(t, 0.3, 0.6))} />
      <T x={345} y={110} s={11} f={C.cherryText} a="middle" o={easeOut(seg(t, 0.3, 0.6))}>
        batch.size
      </T>
      <Clock cx={470} cy={64} r={30} p={easeInOut(seg(t, 0.6, 4.6)) * 0.8} o={easeOut(seg(t, 0.4, 0.7))} />
      <T x={470} y={118} s={11} f={C.second} a="middle" o={easeOut(seg(t, 0.4, 0.7))}>
        linger clock
      </T>
      <T x={25} y={170} s={12} f={C.crema} o={easeOut(seg(t, 2.6, 3.0))}>
        two limits, racing: a size and a clock
      </T>
    </Svg>
  );
}

// 2 · Predict. A partly full buffer under its limit; the clock's ring runs out. On answer the arrow to the broker draws
// and the broker lights: sent as it stands.
export function PredictBatchClose({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  return (
    <Svg label="the linger clock just ran out, and the buffer is still under its byte limit — what happens to the batch?" h={200}>
      <rect x={25} y={40} width={240} height={40} rx={5} fill="none" stroke={v > 0 ? C.focus : C.mocha} strokeWidth={1.5} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={37 + i * 22} y={53} width={16} height={14} rx={2} fill={C.latte} />
      ))}
      <line x1={265} y1={32} x2={265} y2={88} stroke={C.cherryText} strokeWidth={1.5} strokeDasharray="4 3" />
      <Clock cx={315} cy={60} r={20} p={easeInOut(seg(t, 0.2, 1.0))} />
      <Req x1={345} x2={430} y={60} k={v} />
      <Cell x={440} y={46} w={110} label="broker" stroke={v > 0 ? C.focus : C.mocha} />
      {v > 0 && (
        <T x={25} y={112} s={11} f={C.focus} o={v}>
          sent as it stands, partly full
        </T>
      )}
      <AnswerRow y={178} label="the batch" answer={answer} value="sent, partly full" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 3 · The race, run. The same records, twice: a lane of single-record requests counts up to 1,000; a lane of fuller
// requests stops at 500.
export function RevealBatchRace({ t }: StepCtx) {
  const k1 = easeInOut(seg(t, 0.4, 2.0));
  const k2 = easeInOut(seg(t, 2.2, 3.4));
  return (
    <Svg label="the same one thousand records, run twice — fewer, larger batches at the real default linger setting" h={200}>
      <T x={25} y={30} s={12} f={C.crema} o={easeOut(seg(t, 0, 0.3))}>
        linger zero: one record each
      </T>
      <T x={25} y={110} s={12} f={C.crema} o={easeOut(seg(t, 2.0, 2.3))}>
        linger five: several each
      </T>
      <Requests y1={40} y2={120} k1={k1} k2={k2} />
      <T x={550} y={30} s={12} f={C.crema} a="end" o={easeOut(seg(t, 0.4, 0.6))}>
        {num(Math.round(k1 * 1000))}
      </T>
      <T x={550} y={110} s={12} f={C.focus} a="end" o={easeOut(seg(t, 2.2, 2.4))}>
        {num(Math.round(k2 * 500))}
      </T>
      <T x={300} y={185} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 3.7, 4.2))}>
        half as many requests, each one fuller
      </T>
    </Svg>
  );
}

// 4 · Compression. A lone record's bar barely shrinks; a full batch's long bar shrinks to a sliver.
export function RevealCompression({ t }: StepCtx) {
  const a = easeInOut(seg(t, 0.6, 1.4));
  const b = easeInOut(seg(t, 2.2, 3.4));
  return (
    <Svg label="the same compressor, run once on a lone record and once on a full batch of the same shape" h={200}>
      <T x={25} y={30} s={12} f={C.crema} o={easeOut(seg(t, 0, 0.3))}>
        one record
      </T>
      <rect x={25} y={40} width={120} height={18} rx={2} fill="none" stroke={C.second} strokeWidth={1.2} strokeDasharray="4 3" opacity={easeOut(seg(t, 0, 0.3))} />
      <rect x={25} y={40} width={lerp(120, 120 / 1.3, a)} height={18} rx={2} fill={C.latte} opacity={easeOut(seg(t, 0.1, 0.4))} />
      <T x={550} y={54} s={12} f={C.crema} a="end" o={easeOut(seg(t, 1.3, 1.6))}>
        1.3x smaller
      </T>
      <T x={25} y={100} s={12} f={C.crema} o={easeOut(seg(t, 1.7, 2.0))}>
        a full batch
      </T>
      <rect x={25} y={110} width={500} height={18} rx={2} fill="none" stroke={C.second} strokeWidth={1.2} strokeDasharray="4 3" opacity={easeOut(seg(t, 1.7, 2.0))} />
      <rect x={25} y={110} width={lerp(500, 500 / 12.8, b)} height={18} rx={2} fill={C.focus} opacity={easeOut(seg(t, 1.8, 2.1))} />
      <T x={550} y={154} s={12} f={C.focus} a="end" o={easeOut(seg(t, 3.3, 3.6))}>
        12.8x smaller
      </T>
      <T x={25} y={185} s={11} f={C.latte} o={easeOut(seg(t, 3.8, 4.2))}>
        compression is earned by batches
      </T>
    </Svg>
  );
}

/** Three partition lanes with their labels. */
function Lanes({ x, w, o, y0 = 40, gap = 40 }: { x: number; w: number; o: number; y0?: number; gap?: number }) {
  return (
    <g opacity={o}>
      {[0, 1, 2].map((p) => (
        <rect key={p} x={x} y={y0 + p * gap} width={w} height={26} rx={4} fill="none" stroke={C.mocha} strokeWidth={1.2} />
      ))}
    </g>
  );
}

// 5 · Predict. Six keyless records spread round-robin, one per lane in turn. On answer they regroup into one lane: a
// bigger batch.
export function PredictStickyPartition({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeInOut(seg(s, 0.1, 0.8)) : 0;
  return (
    <Svg label="no key, three partitions — sticking to one partition per batch instead of round-robin: bigger batches, or smaller?" h={200}>
      {['p0', 'p1', 'p2'].map((p, i) => (
        <T key={p} x={25} y={57 + i * 40} s={12} f={C.crema} o={easeOut(seg(t, 0, 0.3))}>
          {p}
        </T>
      ))}
      <Lanes x={70} w={480} o={easeOut(seg(t, 0, 0.3))} />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const k = easeOut(seg(t, 0.3 + i * 0.12, 0.5 + i * 0.12));
        const x0 = 80 + Math.floor(i / 3) * 22;
        const y0 = 46 + (i % 3) * 40;
        return <rect key={i} x={lerp(x0, 80 + i * 22, v)} y={lerp(y0, 46, v)} width={16} height={14} rx={2} fill={v > 0 ? C.focus : C.latte} opacity={k} />;
      })}
      <AnswerRow y={185} label="batches get" answer={answer} value="bigger" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 6 · Sticky fill. The same records, two ways: round-robin lanes fill with two-record batches; sticky lanes fill one at
// a time with five-record batches.
export function RevealStickyFill({ t }: StepCtx) {
  const batch = (x: number, y: number, n: number, k: number, f: string, key: string) => (
    <g key={key} opacity={k}>
      <rect x={x} y={y} width={n * 12 + 4} height={20} rx={3} fill="none" stroke={f} strokeWidth={1.2} />
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={x + 3 + i * 12} y={y + 5} width={10} height={10} rx={2} fill={f} />
      ))}
    </g>
  );
  return (
    <Svg label="the identical nine hundred keyless records, routed two ways into the same three partitions" h={200}>
      <T x={25} y={28} s={12} f={C.crema} o={easeOut(seg(t, 0, 0.3))}>
        round-robin
      </T>
      <T x={305} y={28} s={12} f={C.crema} o={easeOut(seg(t, 2.0, 2.3))}>
        sticky
      </T>
      <Lanes x={25} w={250} o={easeOut(seg(t, 0, 0.3))} y0={36} gap={36} />
      <Lanes x={305} w={250} o={easeOut(seg(t, 2.0, 2.3))} y0={36} gap={36} />
      {Array.from({ length: 15 }, (_, i) => batch(30 + Math.floor(i / 3) * 34, 39 + (i % 3) * 36, 2, easeOut(seg(t, 0.3 + i * 0.08, 0.5 + i * 0.08)), C.latte, `r${i}`))}
      {Array.from({ length: 6 }, (_, i) => batch(310 + (i % 2) * 74, 39 + Math.floor(i / 2) * 36, 5, easeOut(seg(t, 2.3 + i * 0.2, 2.5 + i * 0.2)), C.focus, `s${i}`))}
      <T x={25} y={168} s={12} f={C.crema} o={easeOut(seg(t, 1.6, 1.9))}>
        avg batch: 2.0 records
      </T>
      <T x={305} y={168} s={12} f={C.focus} o={easeOut(seg(t, 3.6, 3.9))}>
        avg batch: 5.0 records
      </T>
    </Svg>
  );
}

// 7 · Acks crash. Two runs: the leader writes ahead of its caught-up follower. With acks=1 the ahead records were
// already called safe; the crash takes them, in cherry. With acks=all only the caught-up records were ever called safe;
// the crash takes nothing.
export function RevealAcksCrash({ t }: StepCtx) {
  const runs: [string, number, boolean][] = [
    ['acks=1', 0.2, false],
    ['acks=all', 2.2, true],
  ];
  return (
    <Svg label="a toy leader crash — how many records each acks level believed were safe, and how many it actually kept" h={200}>
      {runs.map(([name, k0, all], r) => {
        const y = 30 + r * 80;
        const crash = easeOut(seg(t, k0 + 1.0, k0 + 1.3));
        return (
          <g key={name}>
            <T x={25} y={y + 12} s={12} f={C.crema} o={easeOut(seg(t, k0, k0 + 0.3))}>
              {name}
            </T>
            {Array.from({ length: 12 }, (_, i) => {
              const k = easeOut(seg(t, k0 + 0.1 + i * 0.05, k0 + 0.3 + i * 0.05));
              const ahead = i >= 10;
              const safe = !ahead || !all;
              const lost = ahead && !all && crash > 0;
              const f = lost ? C.cherryText : safe ? (all ? C.focus : C.latte) : null;
              return <rect key={i} x={110 + i * 22} y={y} width={16} height={14} rx={2} fill={f ?? C.cocoa} stroke={f ?? C.mocha} strokeWidth={1} opacity={k} />;
            })}
            <rect x={110} y={y + 20} width={214 * easeOut(seg(t, k0 + 0.6, k0 + 0.9))} height={4} rx={1} fill={C.second} />
            <Cross x={390} y={y + 7} k={crash} />
            <T x={550} y={y + 12} s={12} f={all ? C.focus : C.cherryText} a="end" o={easeOut(seg(t, k0 + 1.4, k0 + 1.7))}>
              {all ? '0 of 193 lost' : '8 of 201 lost'}
            </T>
          </g>
        );
      })}
      <T x={25} y={190} s={11} f={C.second} o={easeOut(seg(t, 0.8, 1.1))}>
        blue: what the caught-up replica has
      </T>
    </Svg>
  );
}

// 8 · Prove it. The run's numbers, one by one; under them the two request counts as bars.
export function ProveIt({ t }: StepCtx) {
  const g = easeInOut(seg(t, 2.6, 3.6));
  return (
    <Svg label="every number from this reel, read straight off the real run of examples.py just now" h={260}>
      <Row y={40} label="requests, linger 0 vs 5" value="1,000 vs 500" k={easeOut(seg(t, 0.1, 0.5))} />
      <Row y={80} label="zstd, record vs batch" value="1.3x vs 12.8x" k={easeOut(seg(t, 0.6, 1.0))} />
      <Row y={120} label="avg batch, rr vs sticky" value="2.0 vs 5.0" valueColor={C.focus} k={easeOut(seg(t, 1.1, 1.5))} />
      <Row y={160} label="lost, acks=1 vs all" value="8 vs 0" k={easeOut(seg(t, 1.6, 2.0))} />
      <rect x={25} y={196} width={500 * g} height={12} rx={2} fill={C.latte} />
      <rect x={25} y={222} width={250 * g} height={12} rx={2} fill={C.focus} />
      <T x={290} y={233} s={11} f={C.focus} o={easeOut(seg(t, 3.4, 3.8))}>
        half the requests
      </T>
    </Svg>
  );
}

// 9 · Recap. Four lines, one by one; the acks line outlined.
export function Recap({ t }: StepCtx) {
  const rows = ['a batch races a size and a clock', 'compression rewards bigger batches', 'sticky partitioning: fuller batches', "acks decide what 'safe' means"];
  return (
    <Svg label="an accumulator that races a byte limit against a clock, compression that rewards batching, a sticky partitioner, and an acks level that decides what durable means" h={260}>
      {rows.map((r, i) => {
        const k = easeOut(seg(t, 0.2 + i * 0.9, 0.6 + i * 0.9));
        return <Cell key={i} x={25} y={lerp(22, 30, k) + i * 50} w={530} label={r} o={k} stroke={i === 3 ? C.focus : C.mocha} />;
      })}
    </Svg>
  );
}
