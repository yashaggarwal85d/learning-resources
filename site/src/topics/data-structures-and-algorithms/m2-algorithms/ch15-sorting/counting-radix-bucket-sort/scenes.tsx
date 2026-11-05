import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): crema = a key/byte at rest; latte = secondary labels; taupe =
// not-yet-touched regions; caramel = the thing to look at (the digit being read, the byte
// being compared, the bucket being filled); cinnamon (rare) = the alternative algorithm being
// compared (radix against comparison); cherry/cherryText = the bad outcome (a lost stability
// guarantee, a collapsed bucket).

function cell(x: number, y: number, w: number, h: number, label: string, colour = C.crema, labelColour = C.latte) {
  return (
    <g key={`${x}-${y}-${label}`}>
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={colour} strokeWidth={1.6} />
      <T x={x + w / 2} y={y + h / 2 + 5} s={12} a="middle" f={labelColour}>{label}</T>
    </g>
  );
}

// 1 · Opening
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="A comparator loop over many columns, against one encoded byte string" h={260}>
      <g opacity={a}>
        <T x={300} y={70} s={12} a="middle" f={C.latte}>comparator: loop over columns</T>
        {Array.from({ length: 4 }).map((_, i) => cell(130 + i * 90, 90, 70, 36, `col ${i + 1}`, C.taupe))}
      </g>
      <g opacity={b}>
        <T x={300} y={190} s={12} a="middle" f={C.caramel}>one encoded byte string</T>
        {cell(130, 210, 340, 30, 'single memcmp', C.crema, C.crema)}
      </g>
    </Svg>
  );
}

// 2 · Predict passes
export function PredictPasses({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  return (
    <Svg label="A 32-bit key split into four 8-bit digits" h={260}>
      <g opacity={a}>
        <T x={300} y={80} s={12} a="middle" f={C.latte}>one 32-bit key</T>
        {Array.from({ length: 4 }).map((_, i) => cell(130 + i * 90, 100, 70, 44, `8 bits`, C.crema))}
      </g>
      <T x={300} y={226} s={12} a="middle" f={C.caramel}>how many passes?</T>
    </Svg>
  );
}

// 3 · Counting sort
export function CountingSort({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  const vals = [3, 1, 4, 1, 5, 9, 2, 6];
  return (
    <Svg label="Keys scattered into slots by a running count" h={260}>
      <g opacity={a}>
        {vals.map((v, i) => cell(50 + i * 62, 60, 48, 36, String(v), i === 4 ? C.caramel : C.crema))}
      </g>
      <g opacity={b}>
        <T x={300} y={140} s={12} a="middle" f={C.latte}>counts to start positions</T>
        {Array.from({ length: 10 }).map((_, i) => cell(30 + i * 54, 160, 40, 28, String(i), C.taupe, C.taupe))}
      </g>
      <T x={300} y={240} s={12} a="middle" f={C.caramel}>scatter in input order</T>
    </Svg>
  );
}

// 4 · LSD radix sort
export function LSDRadix({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.2));
  const c = easeOut(seg(t, 2.3, 3.2));
  return (
    <Svg label="Three counting-sort passes, last digit first" h={260}>
      <g opacity={a}>
        <T x={120} y={70} s={12} a="middle" f={C.latte}>pass 1: ones</T>
        {[170, 45, 75].map((v, i) => cell(40 + i * 60, 90, 50, 32, String(v), C.taupe))}
      </g>
      <g opacity={b}>
        <T x={300} y={140} s={12} a="middle" f={C.latte}>pass 2: tens</T>
        {[802, 24, 2].map((v, i) => cell(220 + i * 60, 160, 50, 32, String(v), C.crema))}
      </g>
      <g opacity={c}>
        <T x={480} y={210} s={12} a="middle" f={C.caramel}>pass 3: hundreds</T>
      </g>
      <T x={300} y={244} s={11} a="middle" f={C.latte}>3 passes, 24 moves</T>
    </Svg>
  );
}

// 5 · MSD radix sort
export function MSDRadix({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  return (
    <Svg label="MSD radix sort as a tree of buckets, stopping early" h={260}>
      <g opacity={a}>
        {cell(250, 50, 100, 30, 'all keys', C.crema)}
        <path d="M280 80 L170 130 M320 80 L430 130" stroke={C.latte} strokeWidth={1.2} fill="none" />
        {cell(110, 130, 120, 30, 'digit 0-4', C.taupe)}
        {cell(370, 130, 120, 30, 'digit 5-9', C.taupe)}
        <path d="M170 160 L110 200" stroke={C.latte} strokeWidth={1.2} fill="none" />
        {cell(50, 200, 120, 30, 'small: insertion', C.caramel)}
      </g>
      <T x={300} y={240} s={12} a="middle" f={C.latte}>recurse, or stop early</T>
    </Svg>
  );
}

// 6 · American flag sort
export function AmericanFlag({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="One array, piles filled by cycle-leader swaps" h={260}>
      <g opacity={a}>
        {Array.from({ length: 8 }).map((_, i) => cell(50 + i * 62, 70, 48, 36, String(i), i < 4 ? C.taupe : C.crema))}
      </g>
      <g opacity={b}>
        <path d="M112 106 Q 300 170 360 106" stroke={C.caramel} strokeWidth={1.4} fill="none" />
        <T x={300} y={190} s={12} a="middle" f={C.caramel}>cycle-leader swap</T>
      </g>
      <T x={300} y={240} s={11} a="middle" f={C.latte}>one array, no second array</T>
    </Svg>
  );
}

// 7 · Instability
export function Instability({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="Tagged h then i go in; i then h come out" h={260}>
      <g opacity={a}>
        <T x={150} y={90} s={12} a="middle" f={C.latte}>in: h, i</T>
        {cell(100, 110, 50, 36, 'h', C.crema)}
        {cell(160, 110, 50, 36, 'i', C.crema)}
      </g>
      <g opacity={b}>
        <T x={450} y={90} s={12} a="middle" f={C.cherryText}>out: i, h</T>
        {cell(400, 110, 50, 36, 'i', C.cherry, C.cherryText)}
        {cell(460, 110, 50, 36, 'h', C.cherry, C.cherryText)}
      </g>
      <T x={300} y={240} s={12} a="middle" f={C.cherryText}>order among equals is gone</T>
    </Svg>
  );
}

// 8 · Byte encoding
export function ByteEncoding({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="A descending string and a signed year, encoded as bytes" h={260}>
      <g opacity={a}>
        <T x={300} y={70} s={12} a="middle" f={C.latte}>NETHERLANDS, descending</T>
        {cell(70, 90, 460, 30, 'all bits inverted', C.cinnamon, C.cinnamon)}
      </g>
      <g opacity={b}>
        <T x={300} y={160} s={12} a="middle" f={C.latte}>year 1991, signed</T>
        {cell(190, 180, 220, 30, 'sign bit flipped', C.crema)}
      </g>
      <T x={300} y={240} s={12} a="middle" f={C.caramel}>one memcmp, right order</T>
    </Svg>
  );
}

// 9 · Float flip
export function FloatFlip({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="Negative floats flip every bit; non-negative floats flip only the sign bit" h={260}>
      <g opacity={a}>
        <T x={150} y={90} s={12} a="middle" f={C.cherryText}>negative: flip all bits</T>
        {cell(80, 110, 140, 34, '-3.5', C.cherry, C.cherryText)}
      </g>
      <g opacity={b}>
        <T x={450} y={90} s={12} a="middle" f={C.crema}>non-negative: flip sign only</T>
        {cell(380, 110, 140, 34, '3.5', C.crema)}
      </g>
      <T x={300} y={240} s={12} a="middle" f={C.caramel}>bit order now matches value order</T>
    </Svg>
  );
}

// 10 · Predict crossover
export function PredictCrossover({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  return (
    <Svg label="A curve where radix sort's lead over comparison sort narrows" h={260}>
      <g opacity={a}>
        <path d="M60 200 L540 60" stroke={C.caramel} strokeWidth={1.6} fill="none" />
        <path d="M60 200 L540 170" stroke={C.cinnamon} strokeWidth={1.6} fill="none" />
        <T x={420} y={50} s={11} a="middle" f={C.caramel}>n log n</T>
        <T x={420} y={190} s={11} a="middle" f={C.cinnamon}>n w / log n</T>
      </g>
      <T x={300} y={236} s={12} a="middle" f={C.latte}>does the gap ever close?</T>
    </Svg>
  );
}

// 11 · Crossover measured
export function CrossoverMeasured({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.4));
  return (
    <Svg label="200,000 radix moves against 718,000 comparison-sort comparisons" h={260}>
      <g opacity={a}>
        <T x={160} y={80} s={12} a="middle" f={C.caramel}>radix: 200,000 moves</T>
        <rect x={60} y={100} width={200} height={28} fill={C.caramel} opacity={0.85} />
        <T x={440} y={150} s={12} a="middle" f={C.cinnamon}>merge sort: 718,000</T>
        <rect x={340} y={170} width={220} height={28} fill={C.cinnamon} opacity={0.85} />
      </g>
      <T x={300} y={236} s={11} a="middle" f={C.latte}>same 50,000 random keys</T>
    </Svg>
  );
}

// 12 · Bucket sort
export function BucketSort({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="Uniform keys spread across buckets; clustered keys pile into one" h={260}>
      <g opacity={a}>
        <T x={150} y={70} s={12} a="middle" f={C.latte}>uniform: spread out</T>
        {Array.from({ length: 6 }).map((_, i) => cell(40 + i * 44, 90, 34, 10 + (i % 3) * 8, '', C.crema))}
      </g>
      <g opacity={b}>
        <T x={450} y={70} s={12} a="middle" f={C.cherryText}>clustered: one giant bucket</T>
        {cell(400, 90, 34, 100, '', C.cherry, C.cherryText)}
      </g>
      <T x={300} y={240} s={11} a="middle" f={C.latte}>36.7% empty, matching e⁻¹</T>
    </Svg>
  );
}

// 13 · Handoff
export function Handoff({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.1, 1.2));
  const b = easeOut(seg(t, 1.3, 2.3));
  return (
    <Svg label="A digit read, not a comparison; then a file too big for memory" h={260}>
      <g opacity={a}>
        <T x={150} y={100} s={12} a="middle" f={C.caramel}>read one digit</T>
      </g>
      <g opacity={b}>
        <T x={450} y={100} s={12} a="middle" f={C.latte}>a file too big for memory</T>
      </g>
      <T x={300} y={240} s={12} a="middle" f={C.latte}>external merge sort, next</T>
    </Svg>
  );
}
