import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Draw, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md, continuing ch13's grammar): crema = a stored value, a bit, a payload; latte = labels;
// taupe = an empty or unset slot; caramel = the thing to look at (a set flag, the chosen width, the measured bar);
// cinnamon (rare) = the alternative being compared; cherryText = the bad outcome (a data-dependent guess, an outlier
// forcing a block wide).
// Every printed number is examples.py's: the counting floor 13.44 bits/id over 1,048,576 ids out of 2^32 (plain 32-bit
// integers); varint 15.97 bits/id and 1.9968 branches/id; blocks of 128 at 16.93 bits/id and 0.0078 branches/id;
// patched 15.21 bits/id with 3.17% exceptions; grouped control bytes 17.57 bits/id and 0.2500 decision points/id,
// Stream VByte asserted the same size. The protobuf worked examples 1 -> 0x01 and 150 -> 0x96 0x01 are asserted there,
// so their bits print. Every other value, gap and bar height is drawn as shape only.

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

/** One byte as eight bit cells; the first cell is the continuation flag. `bits` prints the bits (asserted values only). */
function ByteCells({ x, y, bits, o = 1, cell = 22 }: { x: number; y: number; bits?: string; o?: number; cell?: number }) {
  return (
    <g opacity={o}>
      {Array.from({ length: 8 }, (_, i) => {
        const flag = i === 0;
        const on = bits ? bits[i] === '1' : false;
        const stroke = flag ? (bits && on ? C.caramel : C.taupe) : C.crema;
        return (
          <g key={i}>
            <rect x={x + i * cell} y={y} width={cell - 2} height={26} rx={2} fill={flag && on ? C.cocoa : 'none'} stroke={stroke} strokeWidth={flag ? 1.8 : 1.2} />
            {bits && <T x={x + i * cell + (cell - 2) / 2} y={y + 18} s={12} a="middle" f={flag ? (on ? C.caramel : C.taupe) : C.crema}>{bits[i]}</T>}
          </g>
        );
      })}
    </g>
  );
}

/** A byte drawn as a box with a flag sliver at its left: flag state 1 (caramel), 0 (taupe) or unknown (a question mark). */
function FlagByte({ x, y, w = 50, flag, o = 1, lit = false }: { x: number; y: number; w?: number; flag: 0 | 1 | null; o?: number; lit?: boolean }) {
  const fc = flag === 1 ? C.caramel : flag === 0 ? C.taupe : C.latte;
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={28} rx={3} fill={lit ? C.cocoa : 'none'} stroke={C.crema} strokeWidth={1.4} />
      <rect x={x + 3} y={y + 3} width={12} height={22} rx={2} fill={flag === 1 ? C.caramel : 'none'} stroke={fc} strokeWidth={1.2} />
      {flag === null && <T x={x + 9} y={y + 19} s={12} a="middle" f={C.latte}>?</T>}
      {Array.from({ length: 4 }, (_, i) => (
        <line key={i} x1={x + 21 + i * ((w - 26) / 4)} y1={y + 9} x2={x + 21 + i * ((w - 26) / 4)} y2={y + 19} stroke={C.mocha} strokeWidth={1.2} />
      ))}
    </g>
  );
}

// 1 · Is the smallest encoding also the fastest? Bits per id on one scale: plain 32-bit integers, then the counting
// floor at 13.44 drops in as a line, then varint (15.97) and blocks of 128 (16.93) grow past it. Then the question.
export function Hook({ t }: StepCtx) {
  const X0 = 170;
  const U = 12; // px per bit
  const X = (b: number) => X0 + b * U;
  const plain = easeOut(seg(t, 0.1, 0.9));
  const floor = easeOut(seg(t, 1.1, 1.8));
  const bars: [string, number, string, number][] = [
    ['varint', 15.97, C.crema, 2.0],
    ['blocks of 128', 16.93, C.cinnamon, 2.6],
  ];
  const q = easeOut(seg(t, 3.6, 4.3));
  return (
    <Svg label="Bits per id on one scale: plain 32-bit integers spend 32, the counting floor is 13.44, varint spends 15.97 and blocks of 128 spend 16.93, both past the floor" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>bits per id, 1,048,576 ids</T>
      <T x={30} y={84} s={13} f={C.crema} o={plain}>plain</T>
      <rect x={X0} y={72} width={(X(32) - X0) * plain} height={16} rx={2} fill={C.mocha} />
      <T x={X(32)} y={64} s={12} a="end" f={C.latte} o={plain}>32</T>
      {bars.map(([lab, b, c, st], i) => {
        const g = easeOut(seg(t, st, st + 0.8));
        const y = 120 + i * 46;
        return (
          <g key={lab}>
            <T x={30} y={y + 12} s={13} f={c} o={easeOut(seg(t, st - 0.2, st + 0.2))}>{lab}</T>
            <rect x={X0} y={y} width={(X(b) - X0) * g} height={16} rx={2} fill={c} opacity={0.85} />
            <rect x={X(13.44)} y={y} width={(X(b) - X(13.44)) * clamp((g - 13.44 / b) / (1 - 13.44 / b), 0, 1)} height={16} fill={C.cherryText} opacity={0.55 * g} />
            <T x={X(b) + 8} y={y + 13} s={12} f={c} o={easeOut(seg(t, st + 0.6, st + 0.9))}>{b.toFixed(2)}</T>
          </g>
        );
      })}
      <line x1={X(13.44)} y1={lerp(40, 104, floor)} x2={X(13.44)} y2={lerp(40, 220, floor)} stroke={C.caramel} strokeWidth={2} strokeDasharray="5 4" opacity={floor} />
      <T x={X(13.44)} y={240} s={12} a="middle" f={C.caramel} o={floor}>floor 13.44</T>
      <T x={300} y={280} s={14} a="middle" f={C.caramel} o={q}>is the smallest also the fastest?</T>
    </Svg>
  );
}

// 2 · Varint, the whole mechanism. One byte: a flag bit, then seven payload bits. The number 1 fits: one byte, flag 0
// (0x01). The number 150 spills: its first byte's flag is 1 (0x96), and a second byte follows (0x01). Both asserted.
export function VarintMechanism({ t }: StepCtx) {
  const shape = easeOut(seg(t, 0.1, 0.8));
  const one = easeOut(seg(t, 1.2, 1.8));
  const b1 = easeOut(seg(t, 2.4, 3.0));
  const b2 = easeOut(seg(t, 3.1, 3.7));
  const flagPulse = t > 3.0 ? 0.6 + 0.4 * Math.sin(t * 5) : 1;
  return (
    <Svg label="A byte is one flag bit and seven payload bits. The number 1 is a single byte, 0 then 0000001. The number 150 is two bytes: 1 then 0010110, flagged to continue, then 0 then 0000001" h={300}>
      <g opacity={shape}>
        <T x={100} y={40} s={12} f={C.caramel}>flag</T>
        <T x={160} y={40} s={12} f={C.latte}>7 payload bits</T>
        <Draw pts={[[111, 48], [111, 60]]} t={t} from={0.3} to={0.6} stroke={C.caramel} w={1.4} pen={false} />
        <Draw pts={[[124, 54], [274, 54]]} t={t} from={0.3} to={0.8} stroke={C.latte} w={1.2} pen={false} />
      </g>
      <T x={40} y={86} s={14} f={C.crema} o={shape}>1</T>
      <ByteCells x={100} y={68} bits={one > 0 ? '00000001' : undefined} o={shape} />
      <T x={290} y={86} s={12} f={C.latte} o={one}>one byte</T>
      <T x={40} y={176} s={14} f={C.crema} o={b1}>150</T>
      <g transform={`translate(${lerp(-20, 0, b1)} 0)`}>
        <ByteCells x={100} y={158} bits="10010110" o={b1} />
      </g>
      <g opacity={flagPulse * b2}>
        <Draw pts={[[111, 190], [111, 206], [306, 206], [306, 190]]} t={t} from={3.0} to={3.5} stroke={C.caramel} w={1.4} pen={false} />
      </g>
      <g transform={`translate(${lerp(30, 0, b2)} 0)`}>
        <ByteCells x={296} y={158} bits="00000001" o={b2} />
      </g>
      <T x={300} y={250} s={13} a="middle" f={C.caramel} o={easeOut(seg(t, 3.6, 4.2))}>flag 1: another byte follows</T>
    </Svg>
  );
}

// 3 · Predict. A stream of bytes, every flag unknown; the decoder's cursor sits on the first one. After answering:
// the cursor walks byte by byte, and only reading each flag tells it whether the value goes on. Lengths are shape.
const STREAM: (0 | 1)[] = [1, 0, 1, 0, 0, 1, 0, 1, 0];
export function VarintBranchPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const a = easeOut(seg(t, 0.1, 0.7));
  const cur = easeOut(seg(t, 0.6, 1.2));
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const X = (i: number) => 48 + i * 58;
  const walk = answered ? clamp((s - 0.2) / 0.3, 0, STREAM.length - 0.001) : 0; // byte index under the cursor
  const read = answered ? Math.floor(walk) + 1 : 0; // bytes whose flags have been read
  const cx = X(answered ? Math.min(walk, STREAM.length - 1) : 0) + 25;
  // value boundaries: a value ends at a byte whose flag is 0
  const ends: number[] = [];
  let start = 0;
  STREAM.forEach((f, i) => {
    if (f === 0) {
      ends.push(start * 1000 + i);
      start = i + 1;
    }
  });
  return (
    <Svg label="A stream of nine bytes, each with an unknown continuation flag and the decoder's cursor on the first; after answering, the cursor reads the flags one by one and each value's end is found only when a flag reads 0" h={280}>
      <T x={30} y={30} s={13} f={C.latte} o={a}>a varint stream, being decoded</T>
      {STREAM.map((f, i) => (
        <FlagByte key={i} x={X(i)} y={90} flag={i < read ? f : null} o={a} lit={answered && i === Math.floor(walk) && s < 3} />
      ))}
      <g opacity={cur}>
        <path d={`M${cx - 7} 70 L${cx + 7} 70 L${cx} 82 Z`} fill={C.caramel} />
      </g>
      {ends.map((code) => {
        const b0 = Math.floor(code / 1000);
        const b1 = code % 1000;
        const seen = read > b1;
        return seen ? (
          <path key={code} d={`M${X(b0) + 2} 128 L${X(b0) + 2} 136 L${X(b1) + 48} 136 L${X(b1) + 48} 128`} fill="none" stroke={C.crema} strokeWidth={1.4} opacity={easeOut(clamp((walk - b1) / 0.6, 0, 1))} />
        ) : null;
      })}
      {answered &&
        STREAM.map((_, i) =>
          i < read ? <circle key={i} cx={X(i) + 9} cy={150} r={3.5} fill={C.cherryText} opacity={easeOut(clamp(walk - i + 0.2, 0, 1))} /> : null,
        )}
      {!answered && <T x={300} y={210} s={14} a="middle" f={C.caramel} o={pulse * cur}>how many bytes is this value?</T>}
      {answered && <T x={300} y={210} s={13} a="middle" f={C.cherryText} o={easeOut(seg(s, 2.8, 3.3))}>found out byte by byte: a guess per flag</T>}
    </Svg>
  );
}

// 4 · The cost of that branch. Ids decode one after another, each dropping its branch marks (almost always two);
// then the measured mean over the whole list prints: 1.9968 branches per id.
const MARKS = [2, 2, 2, 1, 2, 2, 2, 2, 2, 2];
export function BranchCost({ t }: StepCtx) {
  const X = (i: number) => 60 + i * 54;
  const sweep = clamp((t - 0.3) / 0.22, 0, MARKS.length);
  const num = easeOut(seg(t, 2.8, 3.4));
  const guess = easeOut(seg(t, 3.6, 4.2));
  return (
    <Svg label="Ten decoded ids in a row, nearly every one dropping two red branch marks beneath it; measured over the whole list, 1.9968 data-dependent branches per id" h={300}>
      <T x={30} y={24} s={13} f={C.latte}>branches, per id decoded</T>
      {MARKS.map((m, i) => {
        const on = easeOut(clamp(sweep - i, 0, 1));
        return (
          <g key={i}>
            <circle cx={X(i)} cy={80} r={14} fill={on > 0.5 ? C.cocoa : 'none'} stroke={C.crema} strokeWidth={1.6} opacity={0.4 + 0.6 * on} />
            {Array.from({ length: m }, (_, j) => (
              <circle key={j} cx={X(i) + (m === 1 ? 0 : j === 0 ? -6 : 6)} cy={lerp(96, 120, on)} r={4} fill={C.cherryText} opacity={on} />
            ))}
          </g>
        );
      })}
      <path d={`M${X(clamp(sweep, 0, MARKS.length - 1)) - 7} 46 l14 0 l-7 12 z`} fill={C.caramel} opacity={t < 2.7 ? 1 : 0.3} />
      <g opacity={num}>
        <T x={300} y={180} s={22} a="middle" f={C.caramel}>1.9968</T>
        <T x={300} y={204} s={13} a="middle" f={C.latte}>branches per id, measured</T>
      </g>
      <T x={300} y={250} s={13} a="middle" f={C.cherryText} o={guess}>each one a guess that can miss</T>
    </Svg>
  );
}

// 5 · Frame of reference. Sixteen values as bars (heights = their bit lengths, shape only) split into two blocks; in
// each block the widest lights up, its top becomes the block's one width, and every value's box grows to it.
const BLK_A = [9, 12, 10, 13, 11, 8, 12, 10];
const BLK_B = [11, 9, 12, 10, 14, 9, 11, 10];
function Block({ x, vals, t, t0, wide, outlier = -1, o = 1 }: { x: number; vals: number[]; t: number; t0: number; wide?: number; outlier?: number; o?: number }) {
  const BASE = 220;
  const H = (b: number) => b * 9;
  const max = Math.max(...vals);
  const W = wide ?? max;
  const hi = easeOut(seg(t, t0, t0 + 0.5));
  const line = easeInOut(seg(t, t0 + 0.4, t0 + 1.0));
  const fill = easeInOut(seg(t, t0 + 1.0, t0 + 1.8));
  return (
    <g opacity={o}>
      {vals.map((v, i) => {
        const bx = x + i * 28;
        const isMax = i === (outlier >= 0 ? outlier : vals.indexOf(max));
        return (
          <g key={i}>
            <rect x={bx} y={BASE - lerp(H(v), H(W), fill)} width={20} height={lerp(H(v), H(W), fill)} fill="none" stroke={C.mocha} strokeWidth={1.2} strokeDasharray="3 3" opacity={fill} />
            <rect x={bx} y={BASE - H(v)} width={20} height={H(v)} rx={2} fill={isMax ? (outlier >= 0 ? C.cherryText : lerp(0, 1, hi) > 0.5 ? C.caramel : C.crema) : C.crema} opacity={0.85} />
          </g>
        );
      })}
      <line x1={x - 4} y1={BASE - H(W)} x2={lerp(x - 4, x + 7 * 28 + 24, line)} y2={BASE - H(W)} stroke={C.caramel} strokeWidth={2} />
    </g>
  );
}
export function FrameOfReference({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 0.8));
  const div = easeOut(seg(t, 0.9, 1.5));
  const cap = easeOut(seg(t, 3.7, 4.3));
  return (
    <Svg label="Sixteen values as bars split into two blocks; in each block the widest value sets one width and every value is packed to exactly that width, with no per-value flag" h={300}>
      <Block x={62} vals={BLK_A} t={t} t0={1.6} o={a} />
      <Block x={326} vals={BLK_B} t={t} t0={1.9} o={a} />
      <line x1={302} y1={lerp(220, 50, div)} x2={302} y2={228} stroke={C.latte} strokeWidth={1.4} opacity={div} />
      <T x={170} y={46} s={12} a="middle" f={C.latte} o={div}>block of 128</T>
      <T x={434} y={46} s={12} a="middle" f={C.latte} o={div}>block of 128</T>
      <line x1={50} y1={228} x2={560} y2={228} stroke={C.mocha} strokeWidth={1} opacity={a} />
      <T x={300} y={262} s={13} a="middle" f={C.caramel} o={easeOut(seg(t, 2.4, 2.9))}>the widest sets one width</T>
      <T x={300} y={286} s={13} a="middle" f={C.latte} o={cap}>no flag, no branch inside</T>
    </Svg>
  );
}

// 6 · Predict. A tight block of small values, then one value rises far above the rest. After answering: the block's one
// width jumps to the outlier, and every neighbour's box stretches up to it, the wasted space shaded red.
const TIGHT = [8, 7, 9, 8, 7, 8, 9, 8];
export function OutlierPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const BASE = 220;
  const H = (b: number) => b * 9;
  const a = easeOut(seg(t, 0.1, 0.6));
  const rise = easeOutBack(seg(t, 0.7, 1.3));
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  const vals = TIGHT.map((v, i) => (i === 5 ? lerp(v, 18, rise) : v));
  const line = answered ? easeInOut(seg(s, 0.2, 0.7)) : 0;
  const stretch = answered ? easeInOut(seg(s, 0.7, 1.5)) : 0;
  const X = (i: number) => 150 + i * 38;
  const W = lerp(9, 18, line);
  return (
    <Svg label="A block of small values with one value rising far above the rest; after answering, the block's single width jumps to the outlier and every other value's slot stretches to it, the wasted space shaded red" h={300}>
      <T x={30} y={30} s={13} f={C.latte} o={a}>one block, one width</T>
      {vals.map((v, i) => (
        <g key={i} opacity={a}>
          {i !== 5 && stretch > 0 && <rect x={X(i)} y={BASE - lerp(H(v), H(18), stretch)} width={26} height={lerp(0, H(18) - H(v), stretch)} fill={C.cherry} opacity={0.8} />}
          <rect x={X(i)} y={BASE - H(v)} width={26} height={H(v)} rx={2} fill={i === 5 ? C.cherryText : C.crema} opacity={0.85} />
        </g>
      ))}
      <line x1={X(0) - 6} y1={BASE - H(W)} x2={X(7) + 32} y2={BASE - H(W)} stroke={C.caramel} strokeWidth={2} opacity={a} />
      <line x1={X(0) - 10} y1={BASE + 6} x2={X(7) + 36} y2={BASE + 6} stroke={C.mocha} strokeWidth={1} opacity={a} />
      {!answered && <T x={300} y={268} s={14} a="middle" f={C.caramel} o={pulse * a}>what happens to the block's width?</T>}
      {answered && <T x={300} y={268} s={13} a="middle" f={C.cherryText} o={easeOut(seg(s, 1.5, 2.0))}>it widens: every neighbour pays</T>}
    </Svg>
  );
}

// 7 · Patching. The outlier block again, width at the outlier. The width drops to cover most values; the outlier lifts
// out into an exception list; the block decodes at the narrow width; the outlier drops back into its slot. Then the
// measured cost: blocks of 128 at 16.93 bits/id against patched at 15.21, with 3.17% of values patched.
export function Patching({ t }: StepCtx) {
  const BASE = 160;
  const H = (b: number) => b * 6;
  const X = (i: number) => 60 + i * 36;
  const a = easeOut(seg(t, 0.1, 0.6));
  const drop = easeInOut(seg(t, 0.8, 1.5));
  const lift = easeInOut(seg(t, 1.0, 1.8));
  const dec = clamp((t - 2.0) / 0.8, 0, 1);
  const back = easeInOut(seg(t, 2.9, 3.5));
  const W = lerp(18, 9, drop);
  // outlier position: in slot 5 -> exception box -> back to slot 5 (drawn at the narrow width once back)
  const ox = lerp(lerp(X(5), 442, lift), X(5), back);
  const oy = lerp(lerp(BASE - H(18), 70, lift), BASE - H(9), back);
  const oh = lerp(lerp(H(18), 26, lift), H(9), back);
  const bars = easeOut(seg(t, 3.6, 4.4));
  const BX = 200;
  const BU = 18;
  return (
    <Svg label="The outlier lifts out of the block into an exception list, the block decodes at a narrow width, then the outlier is patched back. Measured: blocks of 128 spend 16.93 bits per id, patched blocks 15.21, with 3.17 percent of values patched" h={340}>
      <g opacity={a}>
        {TIGHT.map((v, i) =>
          i === 5 ? (
            <rect key={i} x={X(i)} y={BASE - H(9)} width={24} height={H(9)} rx={2} fill="none" stroke={C.mocha} strokeDasharray="3 3" />
          ) : (
            <rect key={i} x={X(i)} y={BASE - H(v)} width={24} height={H(v)} rx={2} fill={C.crema} opacity={0.85} />
          ),
        )}
        <line x1={X(0) - 6} y1={BASE - H(W)} x2={X(7) + 30} y2={BASE - H(W)} stroke={C.caramel} strokeWidth={2} />
        <line x1={X(0) - 6} y1={BASE + 4} x2={X(7) + 30} y2={BASE + 4} stroke={C.mocha} strokeWidth={1} />
        {dec > 0 && dec < 1 && <rect x={X(0) - 4 + dec * (X(7) + 26 - X(0))} y={BASE - H(9) - 4} width={4} height={H(9) + 8} fill={C.caramel} />}
      </g>
      <g opacity={easeOut(seg(t, 1.0, 1.4))}>
        <rect x={430} y={58} width={110} height={50} rx={4} fill="none" stroke={C.latte} strokeWidth={1.2} />
        <T x={485} y={48} s={12} a="middle" f={C.latte}>exceptions</T>
      </g>
      <rect x={ox} y={oy} width={24} height={oh} rx={2} fill={back > 0.95 ? C.caramel : C.cherryText} opacity={a} />
      <T x={X(5) + 12} y={BASE + 22} s={12} a="middle" f={C.caramel} o={easeOut(seg(t, 3.3, 3.6))}>patched</T>
      <g opacity={bars}>
        <T x={30} y={244} s={13} f={C.cinnamon}>blocks of 128</T>
        <rect x={BX} y={232} width={16.93 * BU * bars} height={16} rx={2} fill={C.cinnamon} />
        <T x={BX + 16.93 * BU + 8} y={245} s={12} f={C.cinnamon}>16.93</T>
        <T x={30} y={280} s={13} f={C.caramel}>patched</T>
        <rect x={BX} y={268} width={15.21 * BU * easeOut(seg(t, 3.9, 4.6))} height={16} rx={2} fill={C.caramel} />
        <T x={BX + 15.21 * BU + 8} y={281} s={12} f={C.caramel} o={easeOut(seg(t, 4.3, 4.6))}>15.21</T>
        <T x={30} y={320} s={12} f={C.latte} o={easeOut(seg(t, 4.4, 4.8))}>bits per id · 3.17% of values patched</T>
      </g>
    </Svg>
  );
}

// 8 · Grouped control bytes. Top: four numbers as varint bytes, a flag in every byte. The flags lift out and merge into
// one control byte set ahead of the four numbers; decoding then checks it once per four: 0.2500 decision points per id.
const GROUP = [2, 2, 1, 2]; // byte lengths of four numbers, shape only
export function GroupedControl({ t }: StepCtx) {
  const CW = 40;
  const top = easeOut(seg(t, 0.1, 0.8));
  const merge = easeInOut(seg(t, 1.1, 2.2));
  const ctrl = easeOut(seg(t, 1.9, 2.4));
  const check = easeOut(seg(t, 2.6, 3.0));
  const num = easeOut(seg(t, 3.3, 3.8));
  const cells: { n: number; j: number }[] = [];
  GROUP.forEach((len, n) => {
    for (let j = 0; j < len; j++) cells.push({ n, j });
  });
  const TX = (k: number, n: number) => 70 + k * (CW + 4) + n * 10; // top row: gaps between numbers
  const BX = (k: number, n: number) => 130 + k * (CW + 4) + n * 10; // bottom row, after the control byte
  return (
    <Svg label="Four numbers stored as varint bytes with a flag in every byte; the flags lift out into one control byte ahead of the four numbers, so decoding checks one control byte per four: 0.2500 decision points per id" h={320}>
      <T x={30} y={30} s={13} f={C.latte} o={top}>a flag in every byte</T>
      {cells.map(({ n, j }, k) => (
        <FlagByte key={k} x={TX(k, n)} y={44} w={CW} flag={j === GROUP[n] - 1 ? 0 : 1} o={top * lerp(1, 0.35, merge)} />
      ))}
      {cells.map(({ n, j }, k) => {
        const fx = lerp(TX(k, n) + 3, 64 + n * 12, merge);
        const fy = lerp(47, 147, merge);
        return <rect key={k} x={fx} y={fy} width={lerp(12, 10, merge)} height={22} rx={2} fill={j === GROUP[n] - 1 ? 'none' : C.caramel} stroke={j === GROUP[n] - 1 ? C.taupe : C.caramel} strokeWidth={1.2} opacity={top * (1 - ctrl)} />;
      })}
      <T x={30} y={130} s={13} f={C.latte} o={ctrl}>one control byte, four numbers</T>
      <g opacity={ctrl}>
        <rect x={60} y={144} width={56} height={28} rx={3} fill={C.cocoa} stroke={C.caramel} strokeWidth={1.8} />
        {[0, 1, 2, 3].map((n) => (
          <line key={n} x1={60 + (n + 1) * 14} y1={148} x2={60 + (n + 1) * 14} y2={168} stroke={C.caramel} strokeWidth={n < 3 ? 1 : 0} />
        ))}
        {cells.map(({ n }, k) => (
          <rect key={k} x={BX(k, n)} y={144} width={CW} height={28} rx={3} fill="none" stroke={C.crema} strokeWidth={1.4} />
        ))}
        {GROUP.map((len, n) => {
          const first = cells.findIndex((c) => c.n === n);
          const x0 = BX(first, n);
          const x1 = BX(first + len - 1, n) + CW;
          return <path key={n} d={`M${67 + n * 14} 172 Q${67 + n * 14} 196 ${(x0 + x1) / 2} 196 L${(x0 + x1) / 2} 176`} fill="none" stroke={C.latte} strokeWidth={1} opacity={ctrl} />;
        })}
      </g>
      <circle cx={88} cy={214} r={6} fill={C.cherryText} opacity={check} />
      <T x={102} y={219} s={12} f={C.latte} o={check}>one check, then four numbers</T>
      <g opacity={num}>
        <T x={300} y={266} s={20} a="middle" f={C.caramel}>0.2500</T>
        <T x={300} y={290} s={13} a="middle" f={C.latte}>decision points per id</T>
      </g>
    </Svg>
  );
}

// 9 · Predict. Interleaved: a control byte, its data, the next control byte, its data. The control bytes slide up into
// their own stream and the data closes ranks beneath. Does that change the size? After answering: the two layouts'
// lengths match (17.57 bits per id either way) and the data row is one uninterrupted run, read wide.
const SEP = ['c', 'd', 'd', 'd', 'd', 'd', 'd', 'c', 'd', 'd', 'd', 'd', 'd', 'd'];
export function StreamSeparationPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const CW = 32;
  const a = easeOut(seg(t, 0.1, 0.6));
  const mv = easeInOut(seg(t, 0.7, 1.6));
  const pulse = 0.6 + 0.4 * Math.sin(t * 4);
  let ci = 0;
  let di = 0;
  const pos = SEP.map((k, i) => {
    const from: [number, number] = [48 + i * (CW + 4), 70];
    const to: [number, number] = k === 'c' ? [48 + ci++ * (CW + 4), 140] : [48 + di++ * (CW + 4), 190];
    return [lerp(from[0], to[0], mv), lerp(from[1], to[1], mv)] as [number, number];
  });
  const same = answered ? easeOut(seg(s, 0.2, 0.8)) : 0;
  const run = answered ? easeOut(seg(s, 1.0, 1.6)) : 0;
  const load = answered ? clamp((s - 1.6) / 1.2, 0, 1) : 0;
  const totalW = SEP.length * (CW + 4) - 4;
  return (
    <Svg label="Control bytes interleaved with their data slide out into their own stream, the data closing ranks below; after answering, both layouts hold the same bytes, 17.57 bits per id either way, and the data is one uninterrupted run read several bytes at a time" h={300}>
      <T x={30} y={30} s={13} f={C.latte} o={a}>control bytes woven into the data</T>
      <T x={30} y={58} s={12} f={C.taupe} o={a * (1 - mv)}>interleaved</T>
      {SEP.map((k, i) => (
        <rect key={i} x={pos[i][0]} y={pos[i][1]} width={CW} height={26} rx={3} fill={k === 'c' ? C.cocoa : 'none'} stroke={k === 'c' ? C.caramel : C.crema} strokeWidth={k === 'c' ? 1.8 : 1.3} opacity={a} />
      ))}
      <T x={130} y={158} s={12} f={C.caramel} o={mv}>control stream</T>
      <g opacity={same * 0.45}>
        {SEP.map((k, i) => (
          <rect key={i} x={48 + i * (CW + 4)} y={70} width={CW} height={26} rx={3} fill="none" stroke={k === 'c' ? C.caramel : C.crema} strokeWidth={1} strokeDasharray="3 3" />
        ))}
      </g>
      <g opacity={same}>
        <line x1={48} y1={104} x2={48 + totalW} y2={104} stroke={C.latte} strokeWidth={1.4} />
        <line x1={48} y1={234} x2={48 + 12 * (CW + 4) - 4} y2={234} stroke={C.crema} strokeWidth={1.4} />
        <line x1={48 + 12 * (CW + 4)} y1={234} x2={48 + totalW} y2={234} stroke={C.caramel} strokeWidth={2.4} />
        <T x={48 + totalW} y={250} s={12} a="end" f={C.latte}>data + control: same length</T>
      </g>
      {answered && (
        <rect x={44} y={186} width={(12 * (CW + 4)) * run} height={34} rx={4} fill="none" stroke={C.caramel} strokeWidth={1.6} opacity={run} />
      )}
      {answered && load > 0 && load < 1 && <rect x={48 + Math.floor(load * 3) * 4 * (CW + 4)} y={184} width={4 * (CW + 4) - 4} height={38} rx={4} fill={C.caramel} opacity={0.18} />}
      {!answered && <T x={300} y={276} s={14} a="middle" f={C.caramel} o={pulse * a}>same bits, or fewer?</T>}
      {answered && <T x={300} y={280} s={13} a="middle" f={C.caramel} o={easeOut(seg(s, 0.8, 1.2))}>17.57 bits per id either way</T>}
    </Svg>
  );
}

// 10 · Branches against bits, together. Four schemes as rows, two measured bars each: bits per id (15.97, 17.57,
// 16.93, 15.21) and branches per id (1.9968, 0.2500, 0.0078, 0.0078). Frame of reference is flagged for spending more
// bits than varint with almost no branches; then patched lights up: fewest bits, same few branches.
const BVB: [string, number, number, string][] = [
  ['varint', 15.97, 1.9968, '1.9968'],
  ['grouped', 17.57, 0.25, '0.2500'],
  ['blocks of 128', 16.93, 0.0078, '0.0078'],
  ['patched', 15.21, 0.0078, '0.0078'],
];
export function BitsVsBranches({ t }: StepCtx) {
  const BX = 180;
  const BU = 7.6;
  const RX = 390;
  const RU = 55;
  const head = easeOut(seg(t, 0.1, 0.5));
  const flagFor = easeOut(seg(t, 2.6, 3.1));
  const pat = easeOut(seg(t, 3.9, 4.4));
  return (
    <Svg label="Four schemes, two measured bars each. Bits per id: varint 15.97, grouped 17.57, blocks of 128 16.93, patched 15.21. Branches per id: 1.9968, 0.2500, 0.0078, 0.0078. Blocks of 128 spend more bits than varint with almost no branches; patched spends the fewest bits with the same few branches" h={340}>
      <T x={BX} y={30} s={12} f={C.latte} o={head}>bits per id</T>
      <T x={RX} y={30} s={12} f={C.latte} o={head}>branches per id</T>
      {BVB.map(([name, bits, br, brLab], i) => {
        const y = 56 + i * 50;
        const g = easeOut(seg(t, 0.4 + i * 0.45, 1.0 + i * 0.45));
        const isFor = i === 2;
        const isPat = i === 3;
        const c = isPat && pat > 0.5 ? C.caramel : C.crema;
        return (
          <g key={name} opacity={easeOut(seg(t, 0.3 + i * 0.45, 0.6 + i * 0.45))}>
            <T x={30} y={y + 13} s={13} f={c}>{name}</T>
            <rect x={BX} y={y} width={bits * BU * g} height={16} rx={2} fill={isPat ? lerp(0, 1, pat) > 0.5 ? C.caramel : C.mocha : C.mocha} />
            <T x={BX + bits * BU + 6} y={y + 13} s={12} f={c} o={g}>{bits.toFixed(2)}</T>
            <rect x={RX} y={y} width={Math.max(2, br * RU) * g} height={16} rx={2} fill={i === 0 ? C.cherryText : isPat && pat > 0.5 ? C.caramel : C.mocha} />
            <T x={RX + Math.max(2, br * RU) + 6} y={y + 13} s={12} f={c} o={g}>{brLab}</T>
            {isFor && <rect x={24} y={y - 8} width={552} height={32} rx={4} fill="none" stroke={C.cinnamon} strokeWidth={1.4} opacity={flagFor * (1 - pat)} />}
            {isPat && <rect x={24} y={y - 8} width={552} height={32} rx={4} fill="none" stroke={C.caramel} strokeWidth={1.6} opacity={pat} />}
          </g>
        );
      })}
      <T x={300} y={290} s={13} a="middle" f={C.cinnamon} o={flagFor}>more bits than varint, almost no guesses</T>
      <T x={300} y={318} s={13} a="middle" f={C.caramel} o={pat}>patched: fewest bits, same few guesses</T>
    </Svg>
  );
}

// 11 · Where this is used. Lucene 9.11's postings format: blocks of 128, the frequency block patched and the doc-delta
// block not (its own documentation). Parquet's Encodings.md: DELTA_BINARY_PACKED, and the RLE / bit-packing hybrid.
export function Adoption({ t }: StepCtx) {
  const l = easeOut(seg(t, 0.4, 1.0));
  const l1 = easeOut(seg(t, 1.0, 1.6));
  const l2 = easeOut(seg(t, 1.6, 2.2));
  const p = easeOut(seg(t, 2.6, 3.2));
  const p1 = easeOut(seg(t, 3.1, 3.7));
  const p2 = easeOut(seg(t, 3.6, 4.2));
  const strip = (x: number, y: number, k: number, patched: boolean) => (
    <g>
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={x + i * 26} y={y} width={22} height={18} rx={2} fill="none" stroke={C.crema} strokeWidth={1.2} opacity={clamp(k * 8 - i, 0, 1)} />
      ))}
      {patched && <rect x={x + 5 * 26 + 4} y={y - 14} width={14} height={10} rx={2} fill={C.caramel} opacity={clamp(k * 2 - 1, 0, 1)} />}
    </g>
  );
  return (
    <Svg label="Lucene's postings format packs blocks of 128: the doc-delta block does not use patching, the frequency block does. Parquet names DELTA_BINARY_PACKED and an RLE and bit-packing hybrid" h={320}>
      <g opacity={l}>
        <T x={30} y={30} s={14} f={C.caramel}>Lucene 9.11 postings</T>
        <T x={30} y={50} s={12} f={C.latte}>blocks of 128</T>
      </g>
      <T x={30} y={84} s={12} f={C.crema} o={l1}>doc deltas: no patching</T>
      <g opacity={l1}>{strip(250, 70, l1, false)}</g>
      <T x={30} y={124} s={12} f={C.crema} o={l2}>freqs: patching</T>
      <g opacity={l2}>{strip(250, 110, l2, true)}</g>
      <line x1={30} y1={160} x2={570} y2={160} stroke={C.mocha} strokeWidth={1} opacity={p} />
      <g opacity={p}>
        <T x={30} y={192} s={14} f={C.caramel}>Parquet encodings</T>
      </g>
      <g opacity={p1}>
        <T x={30} y={228} s={12} f={C.crema}>DELTA_BINARY_PACKED</T>
        <T x={250} y={228} s={12} f={C.latte}>gaps, bit-packed blocks</T>
      </g>
      <g opacity={p2}>
        <T x={30} y={264} s={12} f={C.crema}>RLE / bit-packing</T>
        <T x={250} y={264} s={12} f={C.latte}>runs, or packed values</T>
      </g>
    </Svg>
  );
}

// 12 · Recap. A varint row with its guess under every byte; the guesses go out one by one as the row becomes one packed
// block. Then the previous topic's array container (a plain sorted list) feeds its gaps into that block: the start.
export function Recap({ t }: StepCtx) {
  const X = (i: number) => 60 + i * 56;
  const off = clamp((t - 0.4) / 0.18, 0, 8);
  const pack = easeInOut(seg(t, 1.6, 2.2));
  const arr = easeOut(seg(t, 2.5, 3.1));
  const flow = easeOut(seg(t, 3.0, 3.6));
  return (
    <Svg label="A row of varint bytes, each with a red guess beneath it; the guesses go out one by one and the row becomes one packed block. Then the previous topic's array container, a plain sorted list, feeds its gaps into that block" h={320}>
      <T x={30} y={28} s={13} f={C.latte}>fewest decisions, not fewest bits</T>
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i}>
          <rect x={lerp(X(i), 120 + i * 46, pack)} y={56} width={lerp(48, 44, pack)} height={28} rx={3} fill="none" stroke={pack > 0.5 ? C.caramel : C.crema} strokeWidth={1.4} />
          <circle cx={X(i) + 24} cy={100} r={4} fill={C.cherryText} opacity={1 - clamp(off - i, 0, 1)} />
        </g>
      ))}
      <T x={300} y={124} s={12} a="middle" f={C.caramel} o={pack}>one packed block</T>
      <g opacity={arr}>
        <rect x={60} y={196} width={240} height={30} rx={3} fill={C.roast} stroke={C.crema} strokeWidth={1.2} />
        {Array.from({ length: 10 }, (_, i) => (
          <line key={i} x1={72 + i * 22} y1={202} x2={72 + i * 22} y2={220} stroke={C.crema} strokeWidth={1.4} />
        ))}
        <T x={60} y={250} s={12} f={C.latte}>array container (previous topic)</T>
      </g>
      <Draw pts={[[300, 211], [380, 211], [380, 140]]} t={t} from={3.0} to={3.6} stroke={C.caramel} w={1.6} />
      <T x={392} y={190} s={12} f={C.caramel} o={flow}>its gaps</T>
      <T x={300} y={296} s={13} a="middle" f={C.crema} o={easeOut(seg(t, 3.5, 4.0))}>the plain sorted list was the start</T>
    </Svg>
  );
}
