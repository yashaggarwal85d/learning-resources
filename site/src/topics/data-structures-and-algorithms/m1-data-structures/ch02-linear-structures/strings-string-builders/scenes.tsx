import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar (CHAPTER.md): caramel = the mechanism in focus (the builder, byte indexing);
// cinnamon = the compared alternative (the naive loop, code-point indexing); cherry = the one
// failure/discard frame; taupe/latte = axes, quiet labels; crema = records/bytes. At most two
// accents per step.

function cell(x: number, y: number, w: number, h: number, colour = C.crema, opacity = 1) {
  return <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} rx={3} fill="none" stroke={colour} strokeWidth={1.4} opacity={opacity} />;
}

// 1 · The simplest-looking structure in the chapter
export function Opening({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 1.6));
  return (
    <Svg label="A row of fixed-size records, then a string drawn as bytes of uneven width" h={300}>
      <T x={30} y={28} s={13} f={C.latte}>every structure so far: fixed-size records, known offsets</T>
      {Array.from({ length: 5 }, (_, i) => cell(30 + i * 40, 50, 32, 28, C.crema))}
      <T x={30} y={140} s={13} f={C.caramel} o={a}>a string: looks the same, isn't</T>
      {[32, 20, 16, 32, 24, 16, 16, 32].map((w, i, arr) => {
        const x = 30 + arr.slice(0, i).reduce((s, v) => s + v, 0);
        return cell(x, 162, w, 26, C.caramel, a);
      })}
    </Svg>
  );
}

// 2 · Immutability: every edit is a new string
export function Immutability({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.4));
  return (
    <Svg label="A string and a second reference to it; concatenating produces a new, separate string, leaving the original untouched" h={320}>
      <T x={30} y={30} s={13} f={C.latte}>s = "hello"</T>
      {cell(30, 44, 150, 26, C.crema)}
      <T x={200} y={30} s={13} f={C.latte}>a second reference, same object</T>
      <T x={30} y={100} s={13} f={C.cinnamon}>s + " world"</T>
      {cell(30, 114 + 20 * a, 260, 26, C.caramel, a)}
      <T x={300} y={114 + 20 * a + 18} s={13} f={C.caramel} o={a}>a new object</T>
      <T x={30} y={200} s={13} f={C.latte}>the original "hello" is untouched</T>
      <T x={30} y={222} s={13} f={C.latte}>still there, still shared</T>
      <T x={30} y={254} s={13} f={C.crema}>buys: safe sharing, hashable as a dict key</T>
      <T x={30} y={276} s={13} f={C.crema}>costs: every edit copies</T>
    </Svg>
  );
}

// 3 · The real cost of building one, piece by piece
export function QuadraticCost({ t }: StepCtx) {
  const n = Math.min(5, Math.floor(seg(t, 0.2, 1.6) * 5) + 1);
  return (
    <Svg label="A stack of ever-larger discarded buffers, one per concatenation, each copying everything built so far" h={320}>
      <T x={30} y={26} s={13} f={C.latte}>s = s + piece, k times &mdash; each + copies everything so far</T>
      {Array.from({ length: n }, (_, i) => {
        const w = 40 + i * 44;
        return (
          <rect
            key={i}
            x={30}
            y={60 + i * 34}
            width={w}
            height={26}
            rx={3}
            fill="none"
            stroke={i === n - 1 ? C.caramel : C.cherry}
            strokeDasharray={i === n - 1 ? undefined : '4 3'}
            strokeWidth={1.4}
            opacity={i === n - 1 ? 1 : 0.55}
          />
        );
      })}
      <T x={30} y={280} s={13} f={C.cherry}>discarded, every time</T>
      <T x={30} y={302} s={13} f={C.cherry}>total copies grow like k squared</T>
    </Svg>
  );
}

// 4 · Predict: what actually fixes the loop?
export function FixPredictViz({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="The quadratic loop's discard pile, asking what actually fixes it" h={300}>
      {!answered && (
        <>
          {Array.from({ length: 4 }, (_, i) => cell(30, 40 + i * 32, 60 + i * 44, 26, C.cherry, 0.5))}
          <T x={30} y={270} s={15} f={C.caramel} o={0.7 + 0.3 * Math.sin(t * 3)}>what actually fixes this?</T>
        </>
      )}
      {answered && (
        <>
          {cell(30, 60, 280, 26, C.caramel)}
          <T x={30} y={44} s={13} f={C.caramel}>one mutable buffer, built once</T>
          <T x={30} y={270} s={13} f={C.latte}>convert to an immutable string only at the end</T>
        </>
      )}
    </Svg>
  );
}

// 5 · The string builder: topic 1's mechanism, applied here
export function Builder({ t }: StepCtx) {
  const n = Math.min(5, Math.floor(seg(t, 0.2, 1.6) * 5) + 1);
  const w = 40 + (n - 1) * 44;
  return (
    <Svg label="One steadily growing buffer, doubling capacity on overflow, the same mechanism as topic 1's dynamic array" h={300}>
      <T x={30} y={26} s={13} f={C.latte}>a string builder: one buffer,</T>
      <T x={30} y={44} s={13} f={C.latte}>capacity doubles on overflow</T>
      {cell(30, 70, w, 30, C.caramel)}
      <T x={30} y={120} s={13} f={C.crema}>"every string builder has a capacity...</T>
      <T x={30} y={142} s={13} f={C.crema}>the buffer is automatically made larger"</T>
      <T x={30} y={164} s={13} f={C.crema}>&mdash; Java's own StringBuilder docs</T>
      <T x={30} y={204} s={13} f={C.caramel}>topic 1's doubling array,</T>
      <T x={30} y={226} s={13} f={C.caramel}>specialized to bytes</T>
    </Svg>
  );
}

// 6 · One character, one to four bytes
export function Utf8Bytes({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.4));
  // byte widths in order: A(1) é(2) 日(3) 本(3) 語(3) 😀(4)
  const widths = [18, 26, 34, 34, 34, 42];
  const xs: number[] = [];
  let x = 30;
  for (const w of widths) {
    xs.push(x);
    x += w;
  }
  return (
    <Svg label="A byte row for a mixed string, with a second row of brackets grouping bytes into one to four byte code points" h={300}>
      <T x={30} y={30} s={13} f={C.latte}>one log line's bytes, drawn one cell per byte</T>
      {widths.map((w, i) => cell(xs[i], 50, w, 24, C.crema, 0.6 + 0.4 * a))}
      {widths.map((w, i) => (
        <g key={i} opacity={a}>
          <path d={`M ${xs[i] + 2} 84 L ${xs[i] + w / 2} 92 L ${xs[i] + w - 2} 84`} fill="none" stroke={w > 20 ? C.caramel : C.taupe} strokeWidth={1.2} />
        </g>
      ))}
      <T x={30} y={120} s={13} f={C.caramel} o={a}>one, two, three, three, three, four bytes</T>
      <T x={30} y={142} s={13} f={C.caramel} o={a}>one code point each, widths one to four</T>
      <T x={30} y={180} s={13} f={C.latte}>ASCII stays one byte; accents, CJK,</T>
      <T x={30} y={202} s={13} f={C.latte}>emoji take more</T>
    </Svg>
  );
}

// 7 · Predict: is indexing the nth character O(1)?
export function IndexPredictViz({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const widths = [18, 26, 34, 34, 34, 42];
  const xs: number[] = [];
  let x = 30;
  for (const w of widths) {
    xs.push(x);
    x += w;
  }
  return (
    <Svg label="The same byte row, asking whether indexing the nth character costs the same as indexing the nth byte" h={300}>
      {widths.map((w, i) => cell(xs[i], 50, w, 24, C.crema))}
      {!answered && <T x={30} y={270} s={15} f={C.caramel} o={0.7 + 0.3 * Math.sin(t * 3)}>bytes[i] is O(1) &mdash; is "the nth character"?</T>}
      {answered && (
        <>
          <T x={30} y={140} s={13} f={C.caramel}>depends on how many earlier characters were multi-byte</T>
          <T x={30} y={162} s={13} f={C.latte}>no way to know without walking and decoding them</T>
        </>
      )}
    </Svg>
  );
}

// 8 · Two real languages, two real trade-offs
export function TwoTradeoffs({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.2));
  return (
    <Svg label="Go indexes bytes directly and decodes one rune per loop step; Rust refuses single-character indexing and panics off a boundary" h={320}>
      <T x={30} y={30} s={14} f={C.caramel} serif>Go</T>
      <T x={30} y={50} s={13} f={C.crema}>s[i]: byte, O(1)</T>
      {cell(30, 60, 70, 20, C.caramel, a)}
      <T x={30} y={102} s={13} f={C.crema}>for range: decodes one rune per step, O(n) to walk</T>
      {Array.from({ length: 4 }, (_, i) => cell(30 + i * 36, 114, 30, 20, C.cinnamon, a))}
      <T x={30} y={180} s={14} f={C.cinnamon} serif>Rust</T>
      <T x={30} y={200} s={13} f={C.crema}>str[0]: does not compile &mdash; no character index at all</T>
      <T x={30} y={222} s={13} f={C.crema}>&amp;s[i..j]: byte indices, "to be constant-time"</T>
      {cell(30, 232, 120, 20, C.caramel, easeOut(seg(t, 0.5, 1.6)))}
      <T x={30} y={278} s={13} f={C.cherry}>panics if a boundary isn't a real character start</T>
    </Svg>
  );
}

// 9 · Prove it
export function ProveIt({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.4));
  return (
    <Svg label="A compiled benchmark showing naive concatenation's time growing far faster than a string builder's, and decode steps growing with n while byte indexing stays flat" h={300}>
      <T x={30} y={30} s={14} f={C.cinnamon} serif>naive concatenation</T>
      <T x={30} y={50} s={13} f={C.crema}>time roughly quadruples each time n doubles</T>
      {cell(30, 60, 340, 22, C.cinnamon, a)}
      <T x={30} y={118} s={14} f={C.caramel} serif>string builder</T>
      <T x={30} y={138} s={13} f={C.crema}>time roughly doubles, inputs a hundred times larger</T>
      {cell(30, 148, 60, 22, C.caramel, easeOut(seg(t, 0.5, 1.6)))}
      <T x={30} y={210} s={13} f={C.latte}>byte index: one step, any position</T>
      <T x={30} y={232} s={13} f={C.latte}>code point n: n decode steps</T>
    </Svg>
  );
}
