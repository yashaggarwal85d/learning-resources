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

/** An unlabelled file: a small rounded rect, `hl` colouring its edge. */
function File({ x, y, w = 42, h = 24, o = 1, hl = C.mocha }: { x: number; y: number; w?: number; h?: number; o?: number; hl?: string }) {
  return <rect x={x} y={y} width={w} height={h} rx={3} fill={C.cocoa} stroke={hl} strokeWidth={1.5} opacity={o} />;
}

// 1 · Hook. One sorted run lands per flush and the pile grows; then compaction gathers them into one merged run.
export function Hook({ t }: StepCtx) {
  const m = easeInOut(seg(t, 2.6, 3.5));
  return (
    <Svg label="sorted runs pile up forever unless something merges them back down. What does that cost?" h={230}>
      <Row y={40} label="sorted runs" value="one per flush" k={easeOut(seg(t, 0.2, 0.7))} />
      {Array.from({ length: 6 }, (_, i) => {
        const k = easeOut(seg(t, 0.6 + i * 0.3, 0.9 + i * 0.3));
        return <File key={i} x={lerp(25, 330, m)} y={lerp(70 + i * 18, 110, m)} w={lerp(200, 245, m)} h={12} o={k * (1 - m)} />;
      })}
      <Cell x={330} y={104} w={245} h={28} label="one merged run" stroke={C.focus} f={C.focus} o={m} />
      <T x={452} y={156} s={12} f={C.focus} a="middle" o={easeOut(seg(t, 3.2, 3.6))}>
        compaction
      </T>
      <Row y={210} label="what does it cost?" value="?" k={easeOut(seg(t, 3.8, 4.3))} />
    </Svg>
  );
}

// 2 · Two styles, the same writes. Each lane starts with a pile of files and merges down: leveled to three, tiered to four.
export function RevealCompactionStyles({ t }: StepCtx) {
  const lv = 8 - Math.floor(clamp(seg(t, 1.2, 2.2)) * 5);
  const ti = 8 - Math.floor(clamp(seg(t, 2.6, 3.4)) * 4);
  return (
    <Svg label="the identical shuffled write pattern, measured against two real compaction styles." h={250}>
      <Row y={40} label="the same shuffled writes" value="two styles" k={easeOut(seg(t, 0.2, 0.7))} />
      <T x={25} y={93} s={13} f={C.latte} o={easeOut(seg(t, 0.4, 0.7))}>
        leveled
      </T>
      {Array.from({ length: lv }, (_, i) => (
        <File key={i} x={160 + i * 50} y={76} o={easeOut(seg(t, 0.5 + i * 0.05, 0.8 + i * 0.05))} hl={lv === 3 ? C.focus : C.mocha} />
      ))}
      <T x={25} y={143} s={13} f={C.latte} o={easeOut(seg(t, 1.4, 1.7))}>
        tiered
      </T>
      {Array.from({ length: ti }, (_, i) => (
        <File key={i} x={160 + i * 50} y={126} o={easeOut(seg(t, 1.5 + i * 0.05, 1.8 + i * 0.05))} hl={ti === 4 ? C.second : C.mocha} />
      ))}
      <Row y={195} label="leveled settles to" value="3 files" valueColor={C.focus} k={easeOut(seg(t, 2.2, 2.6))} />
      <Row y={235} label="tiered (universal) to" value="4 files" valueColor={C.second} k={easeOut(seg(t, 3.5, 3.9))} />
    </Svg>
  );
}

// 3 · FIFO. Rounds stream in from the right under a 100 KB window; whatever slides out on the left is dropped, never merged.
export function RevealFifoDrops({ t }: StepCtx) {
  const q = clamp(seg(t, 0.6, 3.0)) * 9;
  const w = easeOut(seg(t, 0.3, 0.6));
  return (
    <Svg label="a real FIFO-style store, written well past a 100-kilobyte cap." h={240}>
      <Row y={40} label="FIFO, a 100 KB cap" value="never merges" k={easeOut(seg(t, 0.2, 0.6))} />
      <rect x={150} y={66} width={300} height={40} rx={4} fill="none" stroke={C.latte} strokeWidth={1.5} strokeDasharray="6 4" opacity={w} />
      <T x={300} y={126} s={11} f={C.latte} a="middle" o={w}>
        the cap
      </T>
      {Array.from({ length: 13 }, (_, i) => {
        const x = 520 - (q - i) * 60;
        if (q < i || x < 30) return null;
        const out = x < 150;
        const last = i === 12 || (q < 12 && i === Math.floor(q));
        return <File key={i} x={x} y={out ? 74 + (150 - x) * 0.4 : 74} w={52} o={out ? clamp((x - 30) / 120) : 1} hl={i === 0 ? C.cherryText : last && q >= 8.9 ? C.focus : C.mocha} />;
      })}
      <Row y={175} label="oldest round's key" value="gone" valueColor={C.cherryText} k={easeOut(seg(t, 3.1, 3.5))} />
      <Row y={215} label="newest round's key" value="still there" valueColor={C.focus} k={easeOut(seg(t, 3.7, 4.1))} />
    </Svg>
  );
}

// 4 · Predict. Each style's cost lands as a cell with a red edge; the answer says no style avoids all three.
export function PredictRumTradeoff({ t, answer }: StepCtx) {
  const costs = ['leveled: writes', 'tiered: reads', 'FIFO: old data'];
  return (
    <Svg label="leveled costs more to write. Tiered costs more to read later. Is there a style with neither cost?" h={200}>
      <Row y={40} label="every style pays" value="somewhere" k={easeOut(seg(t, 0.1, 0.5))} />
      {costs.map((c, i) => (
        <Cell key={c} x={25 + i * 190} y={66} w={170} h={28} label={c} stroke={C.cherryText} o={easeOut(seg(t, 0.4 + i * 0.4, 0.8 + i * 0.4))} />
      ))}
      <AnswerRow y={140} label="a style with no cost" answer={answer} value="none, provably" k={easeOut(seg(t, 1.8, 2.3))} />
      <Verdict answer={answer} text="optimize two, the third gets worse" />
    </Svg>
  );
}

// 5 · The RUM triangle. Corners light up in the narration's order; then a design point slides to the read–write edge and the
// space corner turns red.
export function RevealRumConjecture({ t }: StepCtx) {
  const d = easeOut(seg(t, 0.2, 0.8));
  const m = easeInOut(seg(t, 3.3, 4.2));
  const R = [300, 70];
  const U = [130, 210];
  const M = [470, 210];
  return (
    <Svg label="read overhead, update overhead, memory overhead: each a ratio, minimum 1.0." h={260}>
      <path d={`M${R[0]} ${R[1]} L${U[0]} ${U[1]} L${M[0]} ${M[1]} Z`} fill="none" stroke={C.latte} strokeWidth={1.5} strokeDasharray="900" strokeDashoffset={900 * (1 - d)} />
      <circle cx={R[0]} cy={R[1]} r={6} fill={C.focus} opacity={easeOut(seg(t, 0.9, 1.2))} />
      <T x={300} y={50} s={13} f={C.crema} a="middle" o={easeOut(seg(t, 0.9, 1.2))}>
        read amplification
      </T>
      <circle cx={U[0]} cy={U[1]} r={6} fill={C.focus} opacity={easeOut(seg(t, 1.5, 1.8))} />
      <T x={25} y={240} s={13} f={C.crema} o={easeOut(seg(t, 1.5, 1.8))}>
        write amplification
      </T>
      <circle cx={M[0]} cy={M[1]} r={6 + 3 * m} fill={m > 0.5 ? C.cherryText : C.focus} opacity={easeOut(seg(t, 2.1, 2.4))} />
      <T x={575} y={240} s={13} f={m > 0.5 ? C.cherryText : C.crema} a="end" o={easeOut(seg(t, 2.1, 2.4))}>
        space amplification
      </T>
      <T x={300} y={190} s={12} f={C.latte} a="middle" o={easeOut(seg(t, 2.7, 3.0))}>
        each one at least 1.0
      </T>
      <circle cx={lerp(300, 215, m)} cy={lerp(150, 140, m)} r={7} fill={C.second} opacity={easeOut(seg(t, 3.0, 3.3))} />
    </Svg>
  );
}

// 6 · Write stall. L0 files arrive one by one past a trigger of two; once the count is past it, the write-rate bar shrinks.
export function RevealWriteStall({ t }: StepCtx) {
  const n = Math.floor(clamp(seg(t, 0.8, 2.6)) * 6.99);
  const slow = easeInOut(seg(t, 2.8, 3.6));
  return (
    <Svg label="level0_slowdown_writes_trigger set to 2; the real L0 file count, measured." h={250}>
      <Row y={40} label="L0 slowdown trigger" value="2 files" k={easeOut(seg(t, 0.2, 0.7))} />
      {Array.from({ length: n }, (_, i) => (
        <File key={i} x={25 + i * 70} y={70} w={60} h={28} hl={i >= 2 ? C.cherryText : C.mocha} />
      ))}
      <line x1={160} y1={62} x2={160} y2={106} stroke={C.focus} strokeWidth={2} strokeDasharray="4 3" opacity={easeOut(seg(t, 0.5, 0.8))} />
      <T x={166} y={124} s={11} f={C.focus} o={easeOut(seg(t, 0.5, 0.8))}>
        trigger
      </T>
      <Row y={160} label="L0 files, measured" value={`${n}`} valueColor={n > 2 ? C.cherryText : C.crema} k={easeOut(seg(t, 0.8, 1.2))} />
      <T x={25} y={201} s={12} f={C.latte} o={easeOut(seg(t, 2.6, 2.9))}>
        write rate
      </T>
      <rect x={110} y={190} width={lerp(440, 150, slow)} height={14} rx={3} fill={C.second} opacity={easeOut(seg(t, 2.6, 2.9))} />
      <T x={25} y={236} s={12} f={C.focus} o={easeOut(seg(t, 3.8, 4.2))}>
        slowed on purpose, not blocked
      </T>
    </Svg>
  );
}

// 7 · One debt, two scales. One key's tombstone over stale copies on the left; a whole pile of L0 files on the right.
export function RevealCompactionDebt({ t }: StepCtx) {
  const left = ['tombstone', 'stale copy', 'stale copy'];
  const r = easeOut(seg(t, 3.0, 3.4));
  return (
    <Svg label="a tombstone and a write stall are the same debt, at two different scales." h={250}>
      {left.map((l, i) => (
        <Cell
          key={i}
          x={25}
          y={50 + i * 34}
          w={170}
          h={26}
          label={l}
          stroke={i === 0 ? C.cherryText : C.mocha}
          f={i === 0 ? C.cherryText : C.latte}
          o={easeOut(seg(t, 0.3 + i * 0.2, 0.6 + i * 0.2))}
        />
      ))}
      <T x={110} y={176} s={12} f={C.latte} a="middle" o={easeOut(seg(t, 1.0, 1.3))}>
        one key
      </T>
      {Array.from({ length: 6 }, (_, i) => (
        <File key={i} x={330 + (i % 3) * 82} y={50 + Math.floor(i / 3) * 40} w={74} h={28} hl={r > 0.5 ? C.cherryText : C.mocha} o={easeOut(seg(t, 1.8 + i * 0.12, 2.1 + i * 0.12))} />
      ))}
      <T x={452} y={176} s={12} f={C.latte} a="middle" o={easeOut(seg(t, 2.4, 2.7))}>
        the whole system
      </T>
      <T x={262} y={112} s={22} f={C.focus} a="middle" o={r}>
        =
      </T>
      <Row y={225} label="uncollected merge work" value="two scales" valueColor={C.focus} k={easeOut(seg(t, 3.6, 4.1))} />
    </Svg>
  );
}

// 8 · The lab. Postgres's two bars grow first, then RocksDB's beside them; the read caveat lands last.
export function RevealRumLab({ t }: StepCtx) {
  const pg = easeOut(seg(t, 0.6, 1.6));
  const rk = easeOut(seg(t, 1.9, 2.9));
  const sc = 296 / 3;
  const bars: [string, number, number, number, string][] = [
    ['Postgres', 2.61, 84, pg, C.latte],
    ['RocksDB', 1.85, 106, rk, C.focus],
    ['Postgres', 1.89, 164, pg, C.latte],
    ['RocksDB', 1.11, 186, rk, C.focus],
  ];
  return (
    <Svg label="the chapter's own lab: the identical workload, against a real Postgres cluster and a real RocksDB instance." h={250}>
      <T x={25} y={72} s={13} f={C.crema} o={easeOut(seg(t, 0.2, 0.5))}>
        write amplification
      </T>
      <T x={25} y={152} s={13} f={C.crema} o={easeOut(seg(t, 0.2, 0.5))}>
        space amplification
      </T>
      {bars.map(([l, v, y, k, f]) => (
        <g key={l + y} opacity={k > 0 ? 1 : 0}>
          <T x={25} y={y + 12} s={12} f={C.latte}>
            {l}
          </T>
          <rect x={120} y={y} width={v * sc * k} height={16} rx={3} fill={f} />
          <T x={128 + v * sc} y={y + 12} s={12} f={f} o={seg(k, 0.7, 1)}>
            {`${v.toFixed(2)}×`}
          </T>
        </g>
      ))}
      <T x={25} y={236} s={12} f={C.second} o={easeOut(seg(t, 3.4, 3.8))}>
        RocksDB's read: faster, not a clean comparison
      </T>
    </Svg>
  );
}

// 9 · Recap. Five rows, one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="three compaction styles, one triangle, one conjecture, two real engines measured." h={260}>
      <Row y={40} label="leveled" value="pays to write" k={easeOut(seg(t, 0.3, 0.8))} />
      <Row y={90} label="tiered" value="pays to read later" k={easeOut(seg(t, 1.0, 1.5))} />
      <Row y={140} label="FIFO" value="drops old data" valueColor={C.cherryText} k={easeOut(seg(t, 1.7, 2.2))} />
      <Row y={190} label="the RUM conjecture" value="none escapes" valueColor={C.focus} k={easeOut(seg(t, 2.5, 3.0))} />
      <Row y={240} label="the lab" value="a price on each" k={easeOut(seg(t, 3.3, 3.8))} />
    </Svg>
  );
}

// 10 · Prove. Two engines side by side; after the answer the LSM tree's cell lights and the B-tree's is crossed.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const a = answer !== null ? easeOut(seg(s, 0.2, 0.7)) : 0;
  const v = answer !== null ? easeOut(seg(s, 0.8, 1.2)) : 0;
  return (
    <Svg label="almost all writes, rarely read, disk space is cheap. Which engine actually fits?" h={220}>
      <Row y={40} label="almost all writes" value="space is cheap" k={easeOut(seg(t, 0.1, 0.5))} />
      <AnswerRow y={90} label="the engine that fits" answer={answer} value="the LSM tree" k={easeOut(seg(t, 0.4, 0.9))} />
      <Cell x={25} y={118} w={250} h={28} label="B-tree, Postgres" o={easeOut(seg(t, 0.8, 1.1))} stroke={a > 0.5 ? C.cherryText : C.mocha} />
      <Cross x={255} y={132} k={a} />
      <Cell x={325} y={118} w={250} h={28} label="LSM tree, RocksDB" o={easeOut(seg(t, 1.0, 1.3))} stroke={a > 0.5 ? C.focus : C.mocha} f={a > 0.5 ? C.focus : C.crema} />
      {answer !== null && (
        <>
          <T x={300} y={lerp(198, 190, v)} s={15} f={C.focus} a="middle" o={v}>
            it writes for less: 1.85× against 2.61×
          </T>
          <rect x={150} y={202} width={300 * v} height={3} fill={C.focus} />
        </>
      )}
    </Svg>
  );
}
