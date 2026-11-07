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

/** A small file icon at (x, y): a page with a folded corner. */
function File({ x, y, o = 1, f = C.latte, s = 1 }: { x: number; y: number; o?: number; f?: string; s?: number }) {
  const w = 12 * s;
  const h = 16 * s;
  return <path d={`M${x} ${y} h${w - 4 * s} l${4 * s} ${4 * s} v${h - 4 * s} h${-w} z`} fill="none" stroke={f} strokeWidth={1.3} opacity={o} />;
}

/** A row of n files from x, spaced by gap, the first `shown` drawn. */
function Files({ x, y, n, shown, gap = 18, f = C.latte }: { x: number; y: number; n: number; shown: number; gap?: number; f?: string }) {
  return (
    <g>
      {Array.from({ length: Math.min(n, shown) }, (_, i) => (
        <File key={i} x={x + i * gap} y={y} f={f} />
      ))}
    </g>
  );
}

// 0 · Hook. The same flow twice. Sealing every 1,000 events, ten files appear one by one; sealing every 500, twenty
// appear in the same stretch of time.
export function Hook({ t }: StepCtx) {
  const g = easeInOut(seg(t, 0.4, 3.4));
  return (
    <Svg label="halving the commit interval roughly doubles the file count, on the same volume" h={200}>
      <T x={25} y={30} s={11} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        seal every 1,000
      </T>
      <Files x={150} y={18} n={10} shown={Math.floor(g * 10)} gap={20} />
      <T x={25} y={90} s={11} f={C.cherryText} o={easeOut(seg(t, 0.2, 0.5))}>
        seal every 500
      </T>
      <Files x={150} y={78} n={20} shown={Math.floor(g * 20)} gap={20} f={C.cherryText} />
      <T x={25} y={150} s={11} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        the same 10,000 events, the same time
      </T>
      <T x={25} y={186} s={12} f={C.crema} o={easeOut(seg(t, 3.6, 4.0))}>
        twice as often, twice the files
      </T>
    </Svg>
  );
}

// 1 · Setup. Several engines' outputs flow right and converge on a place that can be asked a question. Two slots
// there: a table, this time, and a dashed one for the destination that comes next.
export function Setup({ t }: StepCtx) {
  return (
    <Svg label="every engine's output has to land somewhere queryable, eventually" h={200}>
      {['a stream job', 'a batch job', 'a SQL query'].map((n, i) => (
        <g key={n}>
          <Cell x={25} y={20 + i * 44} w={140} label={n} o={easeOut(seg(t, 0.1 + i * 0.2, 0.4 + i * 0.2))} />
          <path
            d={`M170 ${34 + i * 44} C 230 ${34 + i * 44}, 240 78, ${lerp(170, 300, easeInOut(seg(t, 0.9, 1.6)))} 78`}
            fill="none"
            stroke={C.latte}
            strokeWidth={1.3}
            opacity={easeOut(seg(t, 0.9, 1.2))}
          />
        </g>
      ))}
      <Cell x={310} y={46} w={240} label="a table, this time" o={easeOut(seg(t, 1.8, 2.2))} stroke={C.focus} f={C.focus} />
      <Hole x={310} y={90} w={240} o={easeOut(seg(t, 2.4, 2.8))} />
      <T x={430} y={109} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 2.6, 2.9))}>
        the next destination
      </T>
      <T x={25} y={180} s={12} f={C.crema} o={easeOut(seg(t, 3.2, 3.6))}>
        somewhere a real question can be asked
      </T>
    </Svg>
  );
}

// 2 · Predict. Ten files from sealing every 1,000; below, a dashed row for sealing every 500. On answer the row fills:
// about twice as many.
export function PredictFileCount({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeInOut(seg(s, 0.1, 0.9)) : 0;
  return (
    <Svg label="commit twice as often, same volume — what happens to the file count?" h={200}>
      <T x={25} y={30} s={11} f={C.latte}>
        every 1,000
      </T>
      <Files x={150} y={18} n={10} shown={Math.floor(easeInOut(seg(t, 0.2, 1.0)) * 10)} gap={20} />
      <T x={25} y={90} s={11} f={C.latte}>
        every 500
      </T>
      {v > 0 ? <Files x={150} y={78} n={20} shown={Math.floor(v * 20)} gap={20} f={C.cherryText} /> : <Hole x={145} y={74} w={400} h={26} o={easeOut(seg(t, 1.0, 1.3))} />}
      <AnswerRow y={170} label="files" answer={answer} value="about double" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 3 · Cadence. A timeline of the same events: seal marks every 1,000 drop a file each, ten in all; marks every 500 drop
// twenty. Beside each row, a staleness bar: the faster row's is half as long.
export function RevealCommitCadence({ t }: StepCtx) {
  const sweep = easeInOut(seg(t, 0.3, 2.8));
  const tx = (u: number) => 60 + u * 40;
  return (
    <Svg label="twice the commit frequency, exactly twice the files, half the staleness" h={200}>
      <T x={25} y={22} s={11} f={C.latte}>
        every 1,000
      </T>
      <line x1={tx(0)} y1={50} x2={tx(10)} y2={50} stroke={C.mocha} strokeWidth={1.2} />
      {Array.from({ length: 10 }, (_, i) => (
        <g key={i} opacity={sweep * 10 > i + 1 ? 1 : 0}>
          <line x1={tx(i + 1)} y1={40} x2={tx(i + 1)} y2={60} stroke={C.latte} strokeWidth={1.5} />
          <File x={tx(i + 1) - 16} y={28} s={0.8} />
        </g>
      ))}
      <T x={25} y={92} s={11} f={C.cherryText}>
        every 500
      </T>
      <line x1={tx(0)} y1={120} x2={tx(10)} y2={120} stroke={C.mocha} strokeWidth={1.2} />
      {Array.from({ length: 20 }, (_, i) => (
        <g key={i} opacity={sweep * 20 > i + 1 ? 1 : 0}>
          <line x1={tx((i + 1) / 2)} y1={110} x2={tx((i + 1) / 2)} y2={130} stroke={C.cherryText} strokeWidth={1.5} />
          <File x={tx((i + 1) / 2) - 13} y={98} s={0.7} f={C.cherryText} />
        </g>
      ))}
      <T x={25} y={164} s={11} f={C.latte} o={easeOut(seg(t, 3.0, 3.3))}>
        stale for
      </T>
      <rect x={100} y={154} width={160 * easeOut(seg(t, 3.0, 3.5))} height={12} rx={3} fill={C.latte} opacity={0.6} />
      <rect x={300} y={154} width={80 * easeOut(seg(t, 3.3, 3.8))} height={12} rx={3} fill={C.cherryText} opacity={0.6} />
      <T x={25} y={194} s={12} f={C.crema} o={easeOut(seg(t, 3.9, 4.3))}>
        twice the files; half as stale
      </T>
    </Svg>
  );
}

// 4 · Two paths. Top: a flow turns into a table on its own, a single automatic arrow. Bottom: a hand-written job, its
// code lines drawing in, carries the same flow. Both arrows land in the same table.
export function RevealAutomatedVsHandbuilt({ t }: StepCtx) {
  return (
    <Svg label="automated materialisation or a hand-built sink, same destination either way" h={200}>
      <Cell x={25} y={30} w={110} label="a flow" o={easeOut(seg(t, 0, 0.3))} />
      <path d="M140 44 C 260 44, 300 90, 380 90" fill="none" stroke={C.focus} strokeWidth={1.6} strokeDasharray="300" strokeDashoffset={300 * (1 - easeInOut(seg(t, 0.4, 1.2)))} />
      <T x={170} y={34} s={11} f={C.focus} o={easeOut(seg(t, 0.8, 1.1))}>
        automatic, nothing built
      </T>
      <Cell x={25} y={128} w={110} label="a flow" o={easeOut(seg(t, 1.6, 1.9))} />
      <rect x={160} y={118} width={130} height={50} rx={5} fill="none" stroke={C.latte} strokeWidth={1.4} opacity={easeOut(seg(t, 1.8, 2.1))} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={172} y={128 + i * 12} width={(90 - i * 20) * easeOut(seg(t, 2.0 + i * 0.2, 2.3 + i * 0.2))} height={6} rx={2} fill={C.latte} opacity={0.6} />
      ))}
      <T x={160} y={186} s={11} f={C.latte} o={easeOut(seg(t, 2.2, 2.5))}>
        a hand-written job
      </T>
      <path d="M295 142 C 340 142, 340 104, 380 104" fill="none" stroke={C.latte} strokeWidth={1.6} strokeDasharray="120" strokeDashoffset={120 * (1 - easeInOut(seg(t, 2.8, 3.4)))} />
      <Cell x={385} y={80} w={170} h={34} label="the same table" o={easeOut(seg(t, 1.0, 1.3))} stroke={C.focus} />
    </Svg>
  );
}

// 5 · Sink and checkpoint. The processor's checkpoint ticks run along one line; the table's commits sit on a line
// below, each joined to a checkpoint above it. The checkpoint interval shortens and the commits squeeze in with it.
export function RevealSinkCheckpoint({ t }: StepCtx) {
  const sq = easeInOut(seg(t, 2.4, 3.4));
  const gap = lerp(100, 50, sq);
  const n = Math.floor(480 / gap) + 1;
  return (
    <Svg label="a sink's commit is tied to the processor's own checkpoint interval" h={200}>
      <T x={25} y={34} s={11} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        checkpoints
      </T>
      <line x1={110} y1={40} x2={555} y2={40} stroke={C.mocha} strokeWidth={1.2} />
      <T x={25} y={114} s={11} f={C.focus} o={easeOut(seg(t, 0.6, 0.9))}>
        table commits
      </T>
      <line x1={110} y1={110} x2={555} y2={110} stroke={C.mocha} strokeWidth={1.2} />
      {Array.from({ length: n }, (_, i) => {
        const x = 120 + i * gap;
        if (x > 550) return null;
        const k = easeOut(seg(t, 0.3 + i * 0.15, 0.5 + i * 0.15));
        return (
          <g key={i}>
            <line x1={x} y1={30} x2={x} y2={50} stroke={C.latte} strokeWidth={1.8} opacity={k} />
            <line x1={x} y1={52} x2={x} y2={98} stroke={C.focus} strokeWidth={1} strokeDasharray="3 3" opacity={easeOut(seg(t, 1.2, 1.6)) * k} />
            <rect x={x - 5} y={104} width={10} height={12} rx={2} fill={C.focus} opacity={k} />
          </g>
        );
      })}
      <T x={25} y={156} s={11} f={C.latte} o={easeOut(seg(t, 2.4, 2.7))}>
        shorten one, and the other shortens with it
      </T>
      <T x={25} y={186} s={12} f={C.crema} o={easeOut(seg(t, 3.6, 4.0))}>
        one setting, not two choices
      </T>
    </Svg>
  );
}

// 6 · Predict. Many small files keep falling; below them a dashed layer with a question. On answer it fills: a storage
// layer that merges them.
export function PredictAbsorb({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  return (
    <Svg label="shorter intervals always cost more files — what could absorb that without slowing down?" h={200}>
      {Array.from({ length: 12 }, (_, i) => {
        const ph = (t * 0.8 + i * 0.37) % 1;
        return <File key={i} x={40 + i * 42} y={lerp(10, 80, ph)} f={C.cherryText} o={easeOut(seg(t, 0, 0.3))} />;
      })}
      {v > 0 ? <Cell x={25} y={104} w={530} label="a layer that buffers and merges them" o={v} stroke={C.focus} f={C.focus} /> : <Hole x={25} y={104} w={530} o={easeOut(seg(t, 0.4, 0.7))} />}
      <AnswerRow y={170} label="what absorbs them" answer={answer} value="a merging layer" k={easeOut(seg(t, 1.6, 2.2))} />
    </Svg>
  );
}

// 7 · LSM buffer. The same cadence: twenty small files drop into a buffer layer. Every 5 gather and merge into one
// larger file below, so four land on disk: a fifth as many. The visible line, when each write first shows, is unchanged.
export function RevealLSMBuffer({ t }: StepCtx) {
  const drop = Math.floor(easeInOut(seg(t, 0.2, 1.8)) * 20);
  return (
    <Svg label="the same cadence, run through a buffer, lands far fewer files" h={200}>
      <T x={25} y={22} s={11} f={C.cherryText} o={easeOut(seg(t, 0, 0.3))}>
        the same sealing rhythm
      </T>
      <rect x={25} y={34} width={530} height={50} rx={6} fill="none" stroke={C.second} strokeWidth={1.4} strokeDasharray="6 4" opacity={easeOut(seg(t, 0, 0.3))} />
      <T x={545} y={22} s={11} f={C.second} a="end" o={easeOut(seg(t, 0.2, 0.5))}>
        buffer
      </T>
      {Array.from({ length: 4 }, (_, g) => {
        const m = easeInOut(seg(t, 2.0 + g * 0.4, 2.5 + g * 0.4));
        return (
          <g key={g}>
            {Array.from({ length: 5 }, (_, j) => {
              const i = g * 5 + j;
              if (i >= drop) return null;
              const x0 = 40 + g * 130 + j * 22;
              return <File key={j} x={lerp(x0, 40 + g * 130 + 40, m)} y={lerp(50, 130, m)} f={C.cherryText} o={1 - m} />;
            })}
            <File x={40 + g * 130 + 36} y={126} s={1.6} f={C.focus} o={m} />
          </g>
        );
      })}
      <T x={25} y={176} s={11} f={C.focus} o={easeOut(seg(t, 3.6, 3.9))}>
        merged in groups of 5: a fifth as many files
      </T>
      <T x={25} y={196} s={11} f={C.latte} o={easeOut(seg(t, 4.0, 4.3))}>
        when a write first shows: unchanged
      </T>
    </Svg>
  );
}

// 8 · Storage-side answers. Two stores draw in: one with its own internal layers built for frequent small updates, one
// sitting directly in front of the stream processor. Both arrows point at the same question.
export function RevealStreamingFirstStorage({ t }: StepCtx) {
  return (
    <Svg label="paimon's lsm layer and fluss both answer the same trade-off from storage" h={200}>
      <rect x={25} y={20} width={240} height={90} rx={8} fill="none" stroke={C.second} strokeWidth={1.5} opacity={easeOut(seg(t, 0.2, 0.5))} />
      <T x={37} y={40} s={12} f={C.second} o={easeOut(seg(t, 0.2, 0.5))}>
        Paimon
      </T>
      {[0, 1, 2].map((l) => (
        <rect key={l} x={40} y={52 + l * 16} width={(60 + l * 60) * easeOut(seg(t, 0.5 + l * 0.3, 0.8 + l * 0.3))} height={10} rx={2} fill={C.second} opacity={0.6} />
      ))}
      <T x={25} y={128} s={11} f={C.latte} o={easeOut(seg(t, 1.2, 1.5))}>
        layers built for small updates
      </T>
      <rect x={315} y={20} width={240} height={90} rx={8} fill="none" stroke={C.second} strokeWidth={1.5} opacity={easeOut(seg(t, 1.8, 2.1))} />
      <T x={327} y={40} s={12} f={C.second} o={easeOut(seg(t, 1.8, 2.1))}>
        Fluss
      </T>
      <Cell x={330} y={60} w={210} h={26} label="in front of the processor" o={easeOut(seg(t, 2.1, 2.4))} />
      <T x={315} y={128} s={11} f={C.latte} o={easeOut(seg(t, 2.4, 2.7))}>
        storage meets the stream
      </T>
      <path d="M145 136 C 160 170, 270 170, 290 176 M435 136 C 420 170, 310 170, 290 176" fill="none" stroke={C.focus} strokeWidth={1.4} opacity={easeOut(seg(t, 3.0, 3.4))} />
      <T x={290} y={196} s={12} f={C.focus} a="middle" o={easeOut(seg(t, 3.4, 3.8))}>
        the same question, from the storage side
      </T>
    </Svg>
  );
}

// 9 · No free setting. Three paths, automatic, hand-built and storage-side, each carry the same cherry weight. The
// weight moves along each path but never disappears: it is set down at the far end every time.
export function RevealNoFreeSetting({ t }: StepCtx) {
  const ps = ['automatic', 'hand-built', 'storage-side'];
  return (
    <Svg label="automated, hand-built, or streaming-first — the same trade-off gets paid somewhere" h={200}>
      {ps.map((n, i) => {
        const y = 36 + i * 44;
        const k = easeOut(seg(t, 0.2 + i * 0.5, 0.5 + i * 0.5));
        const m = easeInOut(seg(t, 0.5 + i * 0.5, 1.6 + i * 0.5));
        return (
          <g key={n} opacity={k}>
            <T x={25} y={y + 4} s={12} f={C.crema}>
              {n}
            </T>
            <line x1={150} y1={y} x2={520} y2={y} stroke={C.mocha} strokeWidth={1.2} />
            <rect x={lerp(150, 500, m)} y={y - 9} width={20} height={18} rx={3} fill={C.cherryText} opacity={0.75} />
          </g>
        );
      })}
      <T x={25} y={180} s={12} f={C.crema} o={easeOut(seg(t, 3.4, 3.8))}>
        the cost moves; it never disappears
      </T>
    </Svg>
  );
}

// 10 · Prove it. The run's results, one by one.
export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="this topic's own real run, every number read straight off it" h={260}>
      <Row y={30} label="10,000 events" value="one flow, sealed two ways" k={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={75} label="every 500 vs 1,000" value="twice the files" valueColor={C.cherryText} k={easeOut(seg(t, 0.8, 1.2))} />
      <Row y={120} label="staleness" value="halved" valueColor={C.focus} k={easeOut(seg(t, 1.4, 1.8))} />
      <Row y={165} label="merged in groups of 5" value="a fifth the files" valueColor={C.focus} k={easeOut(seg(t, 2.0, 2.4))} />
      <Row y={210} label="first visible" value="unchanged" k={easeOut(seg(t, 2.6, 3.0))} />
      <Tick y={240} k={easeOut(seg(t, 3.4, 3.9))} />
    </Svg>
  );
}

// 11 · Recap. Three lines, one by one; the never-removed line outlined.
export function Recap({ t }: StepCtx) {
  const rows = ['seal more often: fresher, and more small files', 'automatic, hand-built, or storage-side carry it', 'none of them removes the cost'];
  return (
    <Svg label="commit cadence sets freshness and file count together, three places to pay the cost" h={260}>
      {rows.map((r, i) => {
        const k = easeOut(seg(t, 0.3 + i * 1.2, 0.8 + i * 1.2));
        return <Cell key={i} x={25} y={lerp(30, 40, k) + i * 60} w={530} label={r} o={k} stroke={i === 2 ? C.cherryText : C.mocha} />;
      })}
    </Svg>
  );
}
