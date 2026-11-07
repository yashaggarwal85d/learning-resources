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

/** A row of bits from x0, `n` wide at `dx` spacing; `on(i)` is how lit bit i is, `st(i)` an optional stroke. */
function Bits({ x0, y, n, dx = 34, on, o = 1, st }: { x0: number; y: number; n: number; dx?: number; on: (i: number) => number; o?: number; st?: (i: number) => string | undefined }) {
  return (
    <g opacity={o}>
      {Array.from({ length: n }, (_, i) => (
        <g key={i}>
          <rect x={x0 + i * dx} y={y} width={dx - 6} height={22} rx={3} fill={C.cocoa} stroke={st?.(i) ?? C.mocha} strokeWidth={st?.(i) ? 2.5 : 1.5} />
          <rect x={x0 + i * dx + 4} y={y + 4} width={dx - 14} height={14} rx={2} fill={C.crema} opacity={0.75 * clamp(on(i))} />
        </g>
      ))}
    </g>
  );
}

const ADDED = [3, 7, 12];

// 1 · Hook. A wide cloud of set members; beneath it, a far smaller bit array; a never-stored value drops onto three bits,
// and the one question it can answer is asked.
export function Hook({ t }: StepCtx) {
  const q = easeOut(seg(t, 2.6, 3.2));
  return (
    <Svg label="a tiny bit array, far smaller than the set it describes, answers one question about a value it never stored" h={230}>
      <T x={25} y={35} s={12} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        the set
      </T>
      {Array.from({ length: 40 }, (_, i) => (
        <circle key={i} cx={35 + i * 13.5} cy={52 + (i % 2) * 14} r={4} fill={C.latte} opacity={easeOut(seg(t, 0.2 + i * 0.015, 0.6 + i * 0.015))} />
      ))}
      <T x={25} y={110} s={12} f={C.latte} o={easeOut(seg(t, 1.2, 1.5))}>
        a far smaller bit array
      </T>
      <Bits x0={230} y={92} n={10} on={(i) => (i % 3 === 0 ? easeOut(seg(t, 1.5, 1.9)) : 0)} o={easeOut(seg(t, 1.2, 1.5))} st={(i) => (q > 0 && [1, 4, 8].includes(i) ? C.second : undefined)} />
      <circle cx={300} cy={lerp(130, 150, q)} r={6} fill={C.second} opacity={q} />
      <T x={315} y={155} s={12} f={C.second} o={q}>
        never stored
      </T>
      <T x={300} y={205} s={15} f={C.focus} a="middle" o={easeOut(seg(t, 3.8, 4.2))}>
        could it possibly be in the set?
      </T>
    </Svg>
  );
}

// 2 · Predict. A value added earlier, its three bits lit; the check comes back; the answer: never absent.
export function PredictFalseNegative({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.2, 0.6)) : 0;
  return (
    <Svg label="can the filter ever wrongly say a value is absent when it was actually added?" h={200}>
      <Cell x={25} y={60} w={140} label="added earlier" o={easeOut(seg(t, 0.2, 0.5))} />
      <Bits
        x0={200}
        y={63}
        n={11}
        on={(i) => ([1, 5, 8].includes(i) ? easeOut(seg(t, 0.5, 0.9)) : 0)}
        o={easeOut(seg(t, 0.2, 0.5))}
        st={(i) => (v > 0 && [1, 5, 8].includes(i) ? C.focus : undefined)}
      />
      <AnswerRow y={145} label="can it read absent" answer={answer} value="no, never" k={easeOut(seg(t, 1.0, 1.5))} />
      <Verdict answer={answer} y={188} text="its bits stay on" />
    </Svg>
  );
}

// 3 · Same positions. Adding sends three lines down and lights three bits; checking sends three lines up to the very same
// bits, which glow as confirmed.
export function RevealSamePositions({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.5, 1.1));
  const c = easeOut(seg(t, 2.4, 3.0));
  const bx = (i: number) => 150 + i * 35 + 14;
  return (
    <Svg label="the guarantee comes from using the exact same hash positions for insertion and lookup" h={240}>
      <Cell x={25} y={45} w={110} label="add" o={easeOut(seg(t, 0.2, 0.5))} />
      {[1, 5, 9].map((i) => (
        <line key={i} x1={135} y1={59} x2={lerp(135, bx(i), a)} y2={lerp(59, 110, a)} stroke={C.crema} strokeWidth={1.5} opacity={a > 0 ? 0.8 : 0} />
      ))}
      <Bits
        x0={150}
        y={110}
        n={12}
        dx={35}
        on={(i) => ([1, 5, 9].includes(i) ? easeOut(seg(t, 1.1, 1.5)) : 0)}
        o={easeOut(seg(t, 0.2, 0.5))}
        st={(i) => (c >= 1 && [1, 5, 9].includes(i) ? C.focus : undefined)}
      />
      <Cell x={25} y={172} w={110} label="check" o={easeOut(seg(t, 2.2, 2.5))} />
      {[1, 5, 9].map((i) => (
        <line key={i} x1={135} y1={186} x2={lerp(135, bx(i), c)} y2={lerp(186, 132, c)} stroke={C.focus} strokeWidth={1.5} opacity={c > 0 ? 0.9 : 0} />
      ))}
      <T x={300} y={232} s={15} f={C.focus} a="middle" o={easeOut(seg(t, 3.8, 4.2))}>
        same spots in, same spots out
      </T>
    </Svg>
  );
}

const CROWD = [0, 1, 2, 4, 5, 6, 7];
const ROOM = [0, 3, 5, 9, 11, 14];

// 4 · Sizing. A short array fills up crowded, and a never-added value finds all its bits on: a false alarm. A longer array
// stays sparse, and the same kind of value hits an off bit: rightly absent. The target rate sets the room.
export function RevealSizing({ t }: StepCtx) {
  const q1 = easeOut(seg(t, 1.8, 2.2));
  const q2 = easeOut(seg(t, 3.8, 4.2));
  return (
    <Svg label="sizing is a trade a target false-positive rate dictates: fewer bits per key, more false positives" h={250}>
      <T x={25} y={40} s={12} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        fewer bits per key
      </T>
      <Bits
        x0={25}
        y={52}
        n={8}
        on={(i) => (CROWD.includes(i) ? easeOut(seg(t, 0.4 + CROWD.indexOf(i) * 0.15, 0.7 + CROWD.indexOf(i) * 0.15)) : 0)}
        o={easeOut(seg(t, 0.2, 0.5))}
        st={(i) => (q1 > 0 && [1, 4, 6].includes(i) ? C.cherryText : undefined)}
      />
      <T x={320} y={68} s={13} f={C.cherryText} o={easeOut(seg(t, 2.3, 2.7))}>
        all on: a false alarm
      </T>
      <T x={25} y={115} s={12} f={C.latte} o={easeOut(seg(t, 2.8, 3.1))}>
        more bits per key
      </T>
      <Bits
        x0={25}
        y={127}
        n={16}
        on={(i) => (ROOM.includes(i) ? easeOut(seg(t, 3.0 + ROOM.indexOf(i) * 0.1, 3.3 + ROOM.indexOf(i) * 0.1)) : 0)}
        o={easeOut(seg(t, 2.8, 3.1))}
        st={(i) => (q2 > 0 && [3, 7, 11].includes(i) ? C.second : undefined)}
      />
      <Cross x={25 + 7 * 34 + 14} y={168} k={easeOut(seg(t, 4.2, 4.5))} />
      <T x={290} y={173} s={12} f={C.latte} o={easeOut(seg(t, 4.3, 4.6))}>
        one spot off: rightly absent
      </T>
      <T x={300} y={230} s={15} f={C.focus} a="middle" o={easeOut(seg(t, 4.8, 5.2))}>
        the target rate sets the room
      </T>
    </Svg>
  );
}

// 5 · Measured. Never-added values stream at a built filter; most stop there, a few slip through and stack onto the
// measured bar, which ends beside the predicted bar.
export function RevealMeasured({ t }: StepCtx) {
  const N = 28;
  const pass = (i: number) => i % 7 === 3;
  const passed = Array.from({ length: N }, (_, i) => i).filter((i) => pass(i) && t > 0.9 + i * 0.1 + 0.5).length;
  return (
    <Svg label="a real filter, built and queried, with its measured false-positive rate checked against the formula's own predicted rate" h={250}>
      <T x={25} y={40} s={12} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        values never added
      </T>
      <rect x={300} y={52} width={16} height={44} rx={3} fill={C.cocoa} stroke={C.crema} strokeWidth={1.5} opacity={easeOut(seg(t, 0.2, 0.5))} />
      <T x={308} y={112} s={11} f={C.latte} a="middle" o={easeOut(seg(t, 0.2, 0.5))}>
        filter
      </T>
      {Array.from({ length: N }, (_, i) => {
        const p = seg(t, 0.9 + i * 0.1, 0.9 + i * 0.1 + 0.5);
        if (p <= 0 || p >= 1) return null;
        const x = pass(i) ? lerp(25, 560, p) : lerp(25, 295, Math.min(p * 1.98, 1));
        const o = pass(i) ? 1 : 1 - clamp((p - 0.5) * 2);
        return <circle key={i} cx={x} cy={62 + (i % 3) * 12} r={4} fill={pass(i) ? C.cherryText : C.latte} opacity={o} />;
      })}
      <T x={25} y={150} s={12} f={C.latte} o={easeOut(seg(t, 0.6, 0.9))}>
        predicted rate
      </T>
      <rect x={200} y={140} width={300 * easeOut(seg(t, 0.6, 1.2))} height={14} rx={2} fill={C.crema} opacity={0.6} />
      <T x={25} y={185} s={12} f={C.latte} o={easeOut(seg(t, 0.9, 1.2))}>
        measured rate
      </T>
      <rect x={200} y={175} width={74 * passed} height={14} rx={2} fill={C.cherryText} opacity={0.8} />
      <T x={300} y={235} s={15} f={C.focus} a="middle" o={easeOut(seg(t, 4.8, 5.2))}>
        measured tracks predicted, closely
      </T>
    </Svg>
  );
}

const FP = ['ka', 'mo', 'ri', 'te', 'lu'];

// 6 · Cuckoo deletes. Removing one entry from a standard filter: the whole array goes dark and is rebuilt bit by bit.
// A cuckoo table of fingerprints: one fingerprint lifts out, its slot left empty.
export function RevealCuckooDeletes({ t }: StepCtx) {
  const dark = easeOut(seg(t, 0.8, 1.1));
  const lift = easeInOut(seg(t, 3.4, 4.0));
  return (
    <Svg label="a standard filter can never delete one item without rebuilding; a cuckoo filter removes a stored fingerprint directly" h={240}>
      <T x={25} y={40} s={12} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        standard filter: remove one entry
      </T>
      <Bits x0={25} y={52} n={12} on={(i) => (i % 3 !== 1 ? 1 - dark + easeOut(seg(t, 1.4 + i * 0.1, 1.6 + i * 0.1)) : 0)} o={easeOut(seg(t, 0.2, 0.5))} />
      <T x={25} y={100} s={13} f={C.cherryText} o={easeOut(seg(t, 1.2, 1.6))}>
        start the whole array over
      </T>
      <T x={25} y={140} s={12} f={C.latte} o={easeOut(seg(t, 2.6, 2.9))}>
        cuckoo filter: a fingerprint per entry
      </T>
      {FP.map((l, i) => (
        <g key={l}>
          <rect
            x={25 + i * 70}
            y={152}
            width={60}
            height={26}
            rx={4}
            fill={C.cocoa}
            stroke={C.mocha}
            strokeWidth={1.5}
            strokeDasharray={i === 2 && lift > 0 ? '4 3' : undefined}
            opacity={easeOut(seg(t, 2.6, 2.9))}
          />
          <g opacity={i === 2 ? easeOut(seg(t, 2.6, 2.9)) * (1 - lift) : easeOut(seg(t, 2.6, 2.9))} transform={i === 2 ? `translate(0 ${(-20 * lift).toFixed(1)})` : undefined}>
            <T x={55 + i * 70} y={169.5} s={12} f={i === 2 ? C.focus : C.crema} a="middle">
              {l}
            </T>
          </g>
        </g>
      ))}
      <T x={25} y={215} s={13} f={C.focus} o={easeOut(seg(t, 4.2, 4.6))}>
        removed directly, nothing rebuilt
      </T>
    </Svg>
  );
}

// 7 · Xor and ribbon. Every key gathers up front; a slow build bar fills; a padlock closes on it; two footprint bars
// grow, the xor-or-ribbon bar shorter; the engine that ships one is named.
export function RevealXorRibbon({ t }: StepCtx) {
  return (
    <Svg label="xor and ribbon filters need the whole set known up front, trading that build cost for an even smaller footprint" h={240}>
      <T x={25} y={40} s={12} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        every key, known up front
      </T>
      {Array.from({ length: 16 }, (_, i) => (
        <circle key={i} cx={lerp(40 + ((i * 37) % 520), 260 + i * 14, easeInOut(seg(t, 0.4, 1.1)))} cy={58} r={4} fill={C.latte} opacity={easeOut(seg(t, 0.2, 0.5))} />
      ))}
      <T x={25} y={95} s={12} f={C.latte} o={easeOut(seg(t, 1.2, 1.5))}>
        a costlier build
      </T>
      <rect x={200} y={84} width={280 * easeInOut(seg(t, 1.3, 2.9))} height={12} rx={2} fill={C.latte} opacity={0.7} />
      <Lock x={500} y={84} k={easeOut(seg(t, 2.9, 3.2))} />
      <T x={524} y={95} s={11} f={C.second} o={easeOut(seg(t, 2.9, 3.2))}>
        fixed
      </T>
      <T x={25} y={140} s={12} f={C.latte} o={easeOut(seg(t, 3.3, 3.6))}>
        standard or cuckoo
      </T>
      <rect x={200} y={129} width={320 * easeOut(seg(t, 3.4, 4.0))} height={14} rx={2} fill={C.crema} opacity={0.6} />
      <T x={25} y={172} s={12} f={C.latte} o={easeOut(seg(t, 3.6, 3.9))}>
        xor or ribbon
      </T>
      <rect x={200} y={161} width={230 * easeOut(seg(t, 3.7, 4.3))} height={14} rx={2} fill={C.focus} />
      <T x={300} y={220} s={13} f={C.latte} a="middle" o={easeOut(seg(t, 4.6, 5.0))}>
        RocksDB ships ribbon, naming this trade
      </T>
    </Svg>
  );
}

// 8 · Recap. Four rows, one per beat.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="no false negatives ever, sizing driven by a target rate, cuckoo adds real deletes, xor and ribbon trade build cost for space" h={250}>
      <Row y={50} label="an added value" value="never missed" k={easeOut(seg(t, 0.6, 1.0))} />
      <Row y={100} label="target rate" value="sets the size" k={easeOut(seg(t, 1.6, 2.0))} />
      <Row y={150} label="cuckoo" value="real deletes" k={easeOut(seg(t, 3.0, 3.4))} />
      <Row y={200} label="xor, ribbon" value="smaller, costlier build" valueColor={C.focus} k={easeOut(seg(t, 4.0, 4.4))} />
    </Svg>
  );
}

// 9 · Prove. Three files, each carrying its filter; one file is dropped whole, its filter with it; the answer: a cuckoo
// filter's deletes buy nothing here.
export function ProveIt({ t, answer }: StepCtx) {
  const drop = easeOut(seg(t, 0.9, 1.3));
  return (
    <Svg label="an existing per-file filter already skips files that can't hold a key — would switching it to a cuckoo filter help?" h={200}>
      {[0, 1, 2].map((i) => (
        <g key={i} opacity={easeOut(seg(t, 0.2 + i * 0.15, 0.5 + i * 0.15)) * (i === 2 ? 1 - 0.7 * drop : 1)}>
          <Cell x={25 + i * 187} y={52} w={175} label="file + filter" stroke={i === 2 && drop > 0 ? C.cherryText : C.mocha} />
        </g>
      ))}
      <T x={487} y={102} s={11} f={C.cherryText} a="middle" o={drop}>
        dropped whole
      </T>
      <AnswerRow y={145} label="cuckoo adds here" answer={answer} value="nothing needed" k={easeOut(seg(t, 1.3, 1.8))} />
      <Verdict answer={answer} y={188} text="a filter only goes with its file" />
    </Svg>
  );
}
