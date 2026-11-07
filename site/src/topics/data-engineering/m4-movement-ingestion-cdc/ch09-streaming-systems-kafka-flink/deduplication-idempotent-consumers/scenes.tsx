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

/** A small square id token at (x, y). */
function Pip({ x, y, o = 1, f = C.second }: { x: number; y: number; o?: number; f?: string }) {
  return <rect x={x - 6} y={y - 6} width={12} height={12} rx={2} fill={f} opacity={o} />;
}

/** A clock axis from 0 to 25 for the dedup store's toy run. */
const cx = (c: number) => 60 + c * 18;
function ClockAxis({ y, o }: { y: number; o: number }) {
  return (
    <g opacity={o}>
      <line x1={cx(0)} y1={y} x2={cx(25)} y2={y} stroke={C.mocha} strokeWidth={1.5} />
      {[0, 5, 10, 25].map((c) => (
        <g key={c}>
          <line x1={cx(c)} y1={y - 4} x2={cx(c)} y2={y + 4} stroke={C.mocha} strokeWidth={1.5} />
          <T x={cx(c)} y={y + 18} s={11} f={C.latte} a="middle">
            {String(c)}
          </T>
        </g>
      ))}
      <T x={25} y={y + 4} s={11} f={C.latte} a="middle">
        clock
      </T>
    </g>
  );
}

/** A bit array of sixteen cells (a stand-in for the run's 4000 bits); `lit` lists the set ones, `hit` the probed ones. */
function Bits({ x, y, lit, hit = [], o = 1, hitColor = C.focus }: { x: number; y: number; lit: number[]; hit?: number[]; o?: number; hitColor?: string }) {
  return (
    <g opacity={o}>
      {Array.from({ length: 16 }, (_, i) => (
        <rect
          key={i}
          x={x + i * 30}
          y={y}
          width={24}
          height={20}
          rx={3}
          fill={lit.includes(i) ? C.latte : C.cocoa}
          stroke={hit.includes(i) ? hitColor : C.mocha}
          strokeWidth={hit.includes(i) ? 2.2 : 1.2}
        />
      ))}
    </g>
  );
}

// 0 · Hook. Two memories fill with ids. The unbounded one climbs until it hits its ceiling and turns cherry; the
// bounded one drops its oldest ids as new ones arrive and stays flat.
export function Hook({ t }: StepCtx) {
  const grow = easeInOut(seg(t, 0.4, 3.0));
  const full = easeOut(seg(t, 3.0, 3.3));
  const n = Math.floor(grow * 14);
  return (
    <Svg label="an ever-growing id set runs out of memory; a bounded window holds it flat" h={200}>
      <T x={25} y={28} s={11} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        remember everything
      </T>
      <line x1={25} y1={44} x2={575} y2={44} stroke={C.cherryText} strokeWidth={1.2} strokeDasharray="4 3" opacity={easeOut(seg(t, 0, 0.3))} />
      {Array.from({ length: n }, (_, i) => (
        <Pip key={i} x={40 + i * 37} y={70} f={full > 0 ? C.cherryText : C.second} />
      ))}
      <rect x={25} y={84} width={530 * grow} height={8} rx={3} fill={full > 0 ? C.cherryText : C.latte} opacity={0.6} />
      <T x={25} y={112} s={11} f={C.cherryText} o={full}>
        out of room
      </T>
      <T x={25} y={142} s={11} f={C.focus} o={easeOut(seg(t, 3.4, 3.7))}>
        remember a bounded window
      </T>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const slide = (t * 1.5) % 1;
        const x = 40 + (i - slide) * 37;
        const o = i === 0 ? 1 - slide : i === 6 ? slide : 1;
        return <Pip key={i} x={x} y={166} o={o * easeOut(seg(t, 3.4, 3.8))} f={C.focus} />;
      })}
      <rect x={25} y={180} width={260} height={8} rx={3} fill={C.focus} opacity={0.6 * easeOut(seg(t, 3.6, 4.0))} />
    </Svg>
  );
}

// 1 · Setup. The earlier narrow fix, one sink with a repeatable id; its idea spreads to three other receivers, and each
// gets a memory with a visible limit on it.
export function Setup({ t }: StepCtx) {
  const names = ['a database', 'a service', 'a stream job'];
  return (
    <Svg label="one sink's deterministic id generalizes to any consumer, no transaction needed" h={200}>
      <Cell x={25} y={80} w={160} label="one sink, one id" o={easeOut(seg(t, 0, 0.4))} />
      {names.map((n, i) => {
        const k = easeOut(seg(t, 1.0 + i * 0.4, 1.5 + i * 0.4));
        const m = easeOut(seg(t, 2.8 + i * 0.3, 3.3 + i * 0.3));
        return (
          <g key={n}>
            <path d={`M190 94 C 240 94, 240 ${44 + i * 60}, ${lerp(190, 290, k)} ${44 + i * 60}`} fill="none" stroke={C.latte} strokeWidth={1.4} opacity={k} />
            <Cell x={295} y={30 + i * 60} w={140} label={n} o={k} />
            <rect x={445} y={36 + i * 60} width={110} height={16} rx={3} fill="none" stroke={C.focus} strokeWidth={1.3} opacity={m} />
            <rect x={447} y={38 + i * 60} width={70 * m} height={12} rx={2} fill={C.focus} opacity={0.5} />
          </g>
        );
      })}
      <T x={445} y={196} s={11} f={C.focus} o={easeOut(seg(t, 3.8, 4.2))}>
        memory, capped
      </T>
    </Svg>
  );
}

// 2 · Predict. evt-1 is seen at clock 0; its window closes; it arrives again at clock 25, far past it. On answer it
// lands as new.
export function PredictWindow({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const arrive = easeInOut(seg(t, 1.2, 2.0));
  return (
    <Svg label="the same id arrives again, but only after the dedup window has already passed" h={200}>
      <ClockAxis y={90} o={easeOut(seg(t, 0, 0.3))} />
      <rect x={cx(0)} y={40} width={cx(10) - cx(0)} height={26} rx={4} fill={C.focus} opacity={0.15 * easeOut(seg(t, 0.3, 0.7))} />
      <Pip x={cx(0)} y={53} o={easeOut(seg(t, 0.2, 0.5))} />
      <T x={cx(0) + 12} y={34} s={11} f={C.latte} o={easeOut(seg(t, 0.3, 0.6))}>
        evt-1, window 10
      </T>
      <Pip x={cx(25)} y={lerp(10, 53, arrive)} o={arrive > 0 ? 1 : 0} f={v > 0 ? C.focus : C.second} />
      {v > 0 && (
        <T x={cx(25)} y={30} s={11} f={C.focus} a="middle" o={v}>
          new
        </T>
      )}
      <AnswerRow y={160} label="evt-1 at clock 25" answer={answer} value="looks new" k={easeOut(seg(t, 1.8, 2.4))} />
    </Svg>
  );
}

// 3 · Window. Clock 0: evt-1 is new and its window opens. Clock 5: it arrives inside the window, is caught, and the
// window restarts from there. The window closes and evt-1 is forgotten; clock 25: it lands as new.
export function RevealWindow({ t }: StepCtx) {
  const w1 = easeOut(seg(t, 0.3, 0.8));
  const dup = easeOut(seg(t, 1.2, 1.6));
  const ext = easeInOut(seg(t, 1.6, 2.2));
  const gone = easeOut(seg(t, 2.4, 2.9));
  const late = easeOut(seg(t, 3.2, 3.7));
  const wEnd = lerp(cx(10), cx(15), ext);
  return (
    <Svg label="an id outside the window is forgotten on purpose, a stated and accepted gap" h={200}>
      <ClockAxis y={110} o={easeOut(seg(t, 0, 0.3))} />
      <rect x={cx(0)} y={60} width={(wEnd - cx(0)) * w1} height={26} rx={4} fill={C.focus} opacity={0.18 * (1 - 0.8 * gone)} />
      <Pip x={cx(0)} y={73} o={w1} />
      <T x={cx(0)} y={50} s={11} f={C.latte} a="middle" o={w1}>
        new
      </T>
      <Pip x={cx(5)} y={73} o={dup} f={C.focus} />
      <T x={cx(5)} y={50} s={11} f={C.focus} a="middle" o={dup}>
        caught
      </T>
      <T x={cx(5) + 28} y={150} s={11} f={C.latte} o={gone * (1 - late)}>
        window over: evt-1 forgotten
      </T>
      <Pip x={lerp(570, cx(25), late)} y={73} o={late} f={C.second} />
      <T x={cx(25)} y={50} s={11} f={C.second} a="middle" o={late}>
        new
      </T>
      <T x={25} y={186} s={12} f={C.crema} o={easeOut(seg(t, 3.8, 4.2))}>
        a gap chosen on purpose, and stated
      </T>
    </Svg>
  );
}

// 4 · Two clocks. Top: a cutoff that sweeps at a steady pace, the wall clock. Bottom: a cutoff that trails the newest
// event, stepping forward only as the stream itself advances.
export function RevealBound({ t }: StepCtx) {
  const ev = [0.4, 0.7, 1.6, 1.8, 2.0, 3.1, 3.3];
  const wall = 25 + 420 * easeInOut(seg(t, 0.6, 4.4));
  const seen = ev.filter((e) => t >= e).length;
  const stream = seen > 0 ? 40 + (seen - 1) * 70 - 90 : 25;
  return (
    <Svg label="a wall-clock TTL or a stream-relative watermark — the same trade-off, different clock" h={200}>
      <T x={25} y={28} s={11} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        cutoff by the wall clock: steady
      </T>
      <line x1={25} y1={60} x2={555} y2={60} stroke={C.mocha} strokeWidth={1.2} opacity={easeOut(seg(t, 0, 0.3))} />
      <line x1={wall} y1={40} x2={wall} y2={80} stroke={C.focus} strokeWidth={2} opacity={easeOut(seg(t, 0.4, 0.7))} />
      <T x={25} y={118} s={11} f={C.latte} o={easeOut(seg(t, 0.3, 0.6))}>
        cutoff by stream progress: moves as events arrive
      </T>
      <line x1={25} y1={155} x2={555} y2={155} stroke={C.mocha} strokeWidth={1.2} opacity={easeOut(seg(t, 0.3, 0.6))} />
      {ev.map((e, i) => (
        <Pip key={i} x={40 + i * 70} y={155} o={easeOut(seg(t, e, e + 0.2))} f={40 + i * 70 < stream ? C.mocha : C.second} />
      ))}
      <line x1={Math.max(25, stream)} y1={135} x2={Math.max(25, stream)} y2={175} stroke={C.focus} strokeWidth={2} opacity={easeOut(seg(t, 0.5, 0.8))} />
    </Svg>
  );
}

// 5 · Predict. An id hashes to four bits; all four are set, so the filter answers "maybe". On answer the verdict lands:
// it can be wrong only toward yes.
export function PredictBloom({ t, answer }: StepCtx) {
  const lit = [1, 3, 4, 6, 8, 9, 11, 13, 14];
  const probe = [3, 6, 9, 13];
  const k = easeOut(seg(t, 0.6, 1.2));
  return (
    <Svg label="a Bloom filter says an id might be present — can that answer ever be wrong?" h={200}>
      <Cell x={210} y={20} w={150} label="an id: 4 hashes" o={easeOut(seg(t, 0, 0.3))} stroke={C.second} />
      {probe.map((p) => (
        <line key={p} x1={285} y1={50} x2={lerp(285, 77 + p * 30, k)} y2={lerp(50, 86, k)} stroke={C.second} strokeWidth={1.3} opacity={k} />
      ))}
      <Bits x={65} y={88} lit={lit} hit={k >= 1 ? probe : []} o={easeOut(seg(t, 0.2, 0.5))} />
      <T x={285} y={134} s={12} f={C.crema} a="middle" o={easeOut(seg(t, 1.3, 1.6))}>
        all four set: maybe
      </T>
      <AnswerRow y={172} label="can maybe be wrong?" answer={answer} value="only toward yes" k={easeOut(seg(t, 1.8, 2.4))} />
    </Svg>
  );
}

// 6 · Bloom filter. Top: an inserted id's four bits are always set, so it is always found. Bottom: a never-inserted id
// probes four bits other ids happened to set, and is flagged anyway, in cherry. Then the run's counts.
export function RevealBloom({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.7));
  const b = easeOut(seg(t, 1.6, 2.1));
  return (
    <Svg label="never a false negative — only, rarely, a false positive, measured directly" h={200}>
      <T x={25} y={22} s={11} f={C.latte} o={a}>
        stored id: its own four bits
      </T>
      <Bits x={65} y={30} lit={[2, 5, 7, 12]} hit={[2, 5, 7, 12]} o={a} />
      <MiniTick x={556} y={40} k={easeOut(seg(t, 0.9, 1.3))} />
      <T x={25} y={82} s={11} f={C.cherryText} o={b}>
        never stored: bits others set
      </T>
      <Bits x={65} y={90} lit={[0, 2, 5, 7, 10, 12, 15]} hit={[0, 5, 10, 15]} o={b} hitColor={C.cherryText} />
      <Cross x={562} y={100} k={easeOut(seg(t, 2.3, 2.7))} />
      <Row y={150} label="500 stored" value="all found" valueColor={C.focus} k={easeOut(seg(t, 3.0, 3.5))} />
      <Row y={185} label="5000 never stored" value="under 0.05 flagged" valueColor={C.cherryText} k={easeOut(seg(t, 3.6, 4.1))} />
    </Svg>
  );
}

// 7 · Derived id. order-42 shipped goes through the same formula twice and gives the same id both times; order-43
// gives a different one. Downstream, the first copy is new and the recomputed one is caught.
export function RevealDerived({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 0.6));
  const f1 = easeInOut(seg(t, 0.6, 1.2));
  const r = easeOut(seg(t, 1.4, 1.8));
  const f2 = easeInOut(seg(t, 1.8, 2.4));
  const c = easeOut(seg(t, 2.6, 3.0));
  const down = easeOut(seg(t, 3.4, 3.9));
  return (
    <Svg label="a derived event's id, recomputed identically, lets the next stage dedup the same way" h={200}>
      <Cell x={25} y={20} w={170} label="order-42, shipped" o={a} />
      <Cell x={25} y={60} w={170} label="order-42, shipped" o={r} stroke={C.second} />
      <Cell x={25} y={100} w={170} label="order-43, shipped" o={c} />
      <line x1={200} y1={34} x2={338} y2={34} stroke={C.focus} strokeWidth={1.2} opacity={a * 0.6} />
      <line x1={200} y1={74} x2={338} y2={74} stroke={C.focus} strokeWidth={1.2} opacity={r * 0.6} />
      <line x1={200} y1={114} x2={338} y2={114} stroke={C.focus} strokeWidth={1.2} opacity={c * 0.6} />
      <T x={270} y={146} s={11} f={C.focus} a="middle" o={a}>
        one formula
      </T>
      {f1 > 0 && f1 < 1 && <rect x={lerp(200, 330, f1)} y={28} width={12} height={12} rx={2} fill={C.second} />}
      {f2 > 0 && f2 < 1 && <rect x={lerp(200, 330, f2)} y={68} width={12} height={12} rx={2} fill={C.second} />}
      <Cell x={345} y={20} w={80} label="id A" o={f1 >= 1 ? 1 : 0} stroke={C.focus} />
      <Cell x={345} y={60} w={80} label="id A" o={f2 >= 1 ? 1 : 0} stroke={C.focus} />
      <Cell x={345} y={100} w={80} label="id B" o={c} />
      <T x={445} y={34} s={11} f={C.latte} o={down}>
        next hop:
      </T>
      <T x={445} y={52} s={11} f={C.crema} o={down}>
        A: new
      </T>
      <T x={445} y={78} s={11} f={C.focus} o={easeOut(seg(t, 3.9, 4.3))}>
        A again: caught
      </T>
      <T x={25} y={180} s={12} f={C.crema} o={easeOut(seg(t, 4.1, 4.5))}>
        same inputs, same id, every time
      </T>
    </Svg>
  );
}

// 8 · Prove it. The run's results, one by one.
export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="this topic's own real run, every number read straight off it" h={260}>
      <Row y={40} label="evt-1 at clock 5" value="duplicate" valueColor={C.focus} k={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={82} label="evt-1 at clock 25" value="new again" k={easeOut(seg(t, 0.8, 1.2))} />
      <Row y={124} label="500 stored ids" value="all found" valueColor={C.focus} k={easeOut(seg(t, 1.5, 1.9))} />
      <Row y={166} label="5000 unseen ids" value="under 0.05 flagged" valueColor={C.cherryText} k={easeOut(seg(t, 2.2, 2.6))} />
      <Row y={208} label="recomputed id" value="caught downstream" valueColor={C.focus} k={easeOut(seg(t, 2.9, 3.3))} />
      <Tick y={240} k={easeOut(seg(t, 3.7, 4.2))} />
    </Svg>
  );
}

// 9 · Recap. Three lines, one by one; the bounded-memory line outlined.
export function Recap({ t }: StepCtx) {
  const rows = ['give each id out once, at the start', 'bound the memory, and state its cost', 'derive new ids that land the same twice'];
  return (
    <Svg label="source ids, a bounded window, a one-directional filter error, and ids that propagate" h={260}>
      {rows.map((r, i) => {
        const k = easeOut(seg(t, 0.3 + i * 1.1, 0.8 + i * 1.1));
        return <Cell key={i} x={25} y={lerp(30, 40, k) + i * 60} w={530} label={r} o={k} stroke={i === 1 ? C.focus : C.mocha} />;
      })}
    </Svg>
  );
}
