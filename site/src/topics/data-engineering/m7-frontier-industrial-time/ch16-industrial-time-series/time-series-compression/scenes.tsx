import { useEffect, useState } from 'react';
import { C, Draw, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// Time-series compression, drawn as bit strips: every byte count and bit pattern on screen is computed by examples.py
// (or is the IEEE-754 pattern of the narration's own 21.37). The raw point is 16 bytes; codecs shrink the strip.

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

/** A plain box with a centred label. */
const Box = ({
  x,
  y,
  w,
  h = 32,
  label,
  lit = false,
  o = 1,
  dash,
  stroke,
  f,
  fill,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  label: string;
  lit?: boolean;
  o?: number;
  dash?: string;
  stroke?: string;
  f?: string;
  fill?: string;
}) =>
  o <= 0 ? null : (
    <g opacity={Math.min(1, o)}>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={fill ?? C.panel} stroke={stroke ?? (lit ? C.focus : C.line)} strokeWidth={lit ? 1.8 : 1.1} strokeDasharray={dash} />
      <T x={x + w / 2} y={y + h / 2 + 5} s={13} f={f ?? (lit ? C.focus : C.primary)} a="middle">
        {label}
      </T>
    </g>
  );

/** A label-left / value-right line under a drawing. */
const Line2 = ({ y, l, r, o, rc = C.focus, lc = C.secondary, lx = 30 }: { y: number; l: string; r: string; o: number; rc?: string; lc?: string; lx?: number }) =>
  o <= 0 ? null : (
    <g opacity={Math.min(1, o)}>
      <T x={lx} y={y} s={14} f={lc}>
        {l}
      </T>
      <T x={575} y={y} s={14} f={rc} a="end">
        {r}
      </T>
    </g>
  );

/** A check mark. */
const Tick = ({ x, y, k, color = C.focus }: { x: number; y: number; k: number; color?: string }) =>
  k <= 0 ? null : <path d={`M${x - 5} ${y} l4 4 l8 -9`} fill="none" stroke={color} strokeWidth={2} opacity={k} />;

/** A red ✕. */
const Cross = ({ x, y, k }: { x: number; y: number; k: number }) =>
  k <= 0 ? null : (
    <g stroke={C.badText} strokeWidth={2.4} opacity={k}>
      <line x1={x - 6} y1={y - 6} x2={x + 6} y2={y + 6} />
      <line x1={x + 6} y1={y - 6} x2={x - 6} y2={y + 6} />
    </g>
  );

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

/** A strip of bit cells that fills left to right as k goes 0 → 1. With digits when the cells are wide enough. */
const Cells = ({
  x,
  y,
  bits,
  cw,
  h = 16,
  k,
  col,
  digits = cw >= 14,
}: {
  x: number;
  y: number;
  bits: string;
  cw: number;
  h?: number;
  k: number;
  col: (i: number, b: string) => string;
  digits?: boolean;
}) => (
  <g>
    {bits.split('').map((b, i) => {
      const o = clamp01(k * bits.length - i);
      if (o <= 0) return null;
      const c = col(i, b);
      return digits ? (
        <g key={i} opacity={o}>
          <rect x={x + i * cw + 1} y={y} width={cw - 2} height={h} rx={2} fill={C.panel} stroke={c} strokeWidth={1.2} />
          <T x={x + i * cw + cw / 2} y={y + h - 4} s={12} f={c} a="middle">
            {b}
          </T>
        </g>
      ) : (
        <rect key={i} x={x + i * cw + 0.5} y={y} width={cw - 1} height={h} fill={c} opacity={o} />
      );
    })}
  </g>
);

// Byte scale shared by the bit strips: a raw point (64-bit timestamp + 64-bit float) is 16 bytes.
const RAW = 16;

// 0 · The bit strip. A raw point is 16 bytes. The colleague's promise is a dashed slot one twelfth as long. The measured
// strip, on this plant's noisy signal, shrinks from 16 bytes and stalls at 7.69 — nowhere near the slot, red.
export function Hook({ t }: StepCtx) {
  const W = 390;
  const x0 = 150;
  const grow = easeOut(seg(t, 0, 0.8));
  const shrink = easeInOut(seg(t, 2.2, 3.8));
  const mw = lerp(W, (W * 7.69) / RAW, shrink);
  const done = shrink > 0.98;
  return (
    <Svg label="a colleague's promise of a twelve-times reduction from Gorilla's encoder measures barely better than one on this plant's own data, with no bug in the code" h={200}>
      <T x={25} y={44} s={13} f={C.secondary} o={grow}>
        raw
      </T>
      <rect x={x0} y={32} width={W * grow} height={16} fill={C.quiet} />
      <T x={575} y={45} s={13} f={C.secondary} a="end" o={easeOut(seg(t, 0.6, 1.0))}>
        16 B
      </T>

      <T x={25} y={99} s={13} f={C.secondary} o={easeOut(seg(t, 1.0, 1.4))}>
        promised
      </T>
      <rect x={x0} y={87} width={W / 12} height={16} fill="none" stroke={C.focus} strokeWidth={1.4} strokeDasharray="4 3" opacity={easeOut(seg(t, 1.0, 1.6))} />
      <T x={x0 + W / 12 + 14} y={100} s={14} f={C.focus} o={easeOut(seg(t, 1.3, 1.8))}>
        ÷ 12
      </T>

      <T x={25} y={154} s={13} f={C.secondary} o={easeOut(seg(t, 2.0, 2.4))}>
        measured
      </T>
      <rect x={x0} y={142} width={W / 12} height={16} fill="none" stroke={C.focus} strokeWidth={1.2} strokeDasharray="4 3" opacity={0.6 * easeOut(seg(t, 2.0, 2.4))} />
      <rect x={x0} y={142} width={mw} height={16} fill={done ? C.bad : C.quiet} opacity={easeOut(seg(t, 2.0, 2.4))} />
      <T x={575} y={155} s={14} f={C.badText} a="end" w={600} o={easeOut(seg(t, 3.7, 4.1))}>
        7.69 B
      </T>
      <T x={300} y={190} s={12} f={C.quiet} a="middle" o={easeOut(seg(t, 4.3, 4.8))}>
        same encoder, no bug
      </T>
    </Svg>
  );
}

// 1 · Gorilla's two tricks, bit for bit. Gaps 60 60 59 61 become delta-of-deltas 0 −1 2. Then the paper's worked
// examples fill cell by cell: a delta-of-delta of −2 is the prefix 10 plus seven value bits — 9 bits; an XOR with 11
// leading zeros and 1 meaningful bit is 1, 1, five bits saying 11, six bits saying 1, then the bit — 14 bits.
export function RevealGorillaEncoders({ t }: StepCtx) {
  const gaps = [60, 60, 59, 61];
  const dods = ['0', '−1', '2'];
  const gx = (i: number) => 200 + i * 90;
  const dodBits = '10' + '1111110';
  const xorBits = '11' + '01011' + '000001' + '1';
  const xorCol = (i: number) => (i < 2 ? C.second : i < 7 ? C.secondary : i < 13 ? C.quiet : C.focus);
  const k1 = seg(t, 2.0, 3.3);
  const k2 = seg(t, 3.6, 5.0);
  return (
    <Svg label="Gorilla stores the delta of deltas between timestamps and the XOR between successive floats, and this topic's encoder reproduces the paper's own worked bit counts exactly" h={200}>
      <T x={25} y={32} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        gap (s)
      </T>
      {gaps.map((g, i) => (
        <T key={i} x={gx(i)} y={32} s={14} f={C.primary} a="middle" o={easeOut(seg(t, 0.1 + i * 0.15, 0.4 + i * 0.15))}>
          {String(g)}
        </T>
      ))}
      <T x={25} y={66} s={13} f={C.second} o={easeOut(seg(t, 0.9, 1.2))}>
        Δ of Δ
      </T>
      {dods.map((d, i) => {
        const k = easeOut(seg(t, 1.0 + i * 0.22, 1.35 + i * 0.22));
        return (
          <g key={i} opacity={k}>
            <path d={`M${gx(i) + 8} 40 L${gx(i) + 45} 50 L${gx(i + 1) - 8} 40`} fill="none" stroke={C.line} strokeWidth={1.2} />
            <T x={gx(i) + 45} y={68} s={15} f={C.second} a="middle" w={600}>
              {d}
            </T>
          </g>
        );
      })}

      <T x={25} y={113} s={13} f={C.secondary} o={easeOut(seg(t, 1.8, 2.1))}>
        Δ of Δ −2
      </T>
      <Cells x={175} y={100} bits={dodBits} cw={22} k={k1} col={(i) => (i < 2 ? C.second : C.focus)} />
      <T x={575} y={113} s={14} f={C.focus} a="end" w={600} o={easeOut(seg(t, 3.3, 3.6))}>
        9 bits
      </T>
      <Tick x={480} y={108} k={easeOutBack(seg(t, 3.4, 3.7))} />

      <T x={25} y={161} s={13} f={C.secondary} o={easeOut(seg(t, 3.4, 3.7))}>
        XOR
      </T>
      <Cells x={175} y={148} bits={xorBits} cw={22} k={k2} col={xorCol} />
      <T x={175 + 2 * 22 + 55} y={184} s={11} f={C.secondary} a="middle" o={easeOut(seg(t, 4.0, 4.4))}>
        lead 11
      </T>
      <T x={175 + 7 * 22 + 66} y={184} s={11} f={C.quiet} a="middle" o={easeOut(seg(t, 4.4, 4.8))}>
        length 1
      </T>
      <T x={575} y={161} s={14} f={C.focus} a="end" w={600} o={easeOut(seg(t, 5.0, 5.3))}>
        14 bits
      </T>
    </Svg>
  );
}

// The two signals of the prediction, drawn from examples.py's own regime builders.
const slowPts: Pt[] = Array.from({ length: 60 }, (_, i) => [30 + i * 4, 120 - (i >= 40 ? 2 : i >= 20 ? 1 : 0) * 26] as const);
const noisyVals = [211.3, 251.2, 291.1, 330.9, 370.8, 410.7, 450.5, 490.4, 530.3, 570.2, 610.0, 649.9, 689.8, 729.6, 769.5, 809.4, 849.2, 889.1, 929.0, 968.9, 8.7, 48.6, 88.5, 128.3];
const noisyPts: Pt[] = noisyVals.map((v, i) => [340 + i * 10, 140 - v * 0.09] as const);
type Pt = readonly [number, number];
// XOR of the noisy regime's first two readings: 13 leading zeros, 50 meaningful bits, 1 trailing zero.
const NOISY_XOR = '0000000000000101000011000110010010000101011100111001110101111110';

// 2 · Two signals side by side. Left: the slow, regular one — a staircase; its XOR strip is all zeros, 475 of 499
// times. Right: the noisy one — a steep, wrapping ramp, with "?" under it. After the answer its XOR strip fills: 13
// zeros, then 50 bits that must be stored, red.
export function PredictSameEncoder({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  return (
    <Svg label="the same Gorilla encoder runs on a noisy, frequently changing signal instead of a slow, regular one — does it still compress as well?" h={200}>
      <T x={30} y={28} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        slow, regular
      </T>
      <Draw pts={slowPts} t={t} from={0.2} to={1.3} stroke={C.focus} w={2} />
      <T x={340} y={28} s={13} f={C.secondary} o={easeOut(seg(t, 1.2, 1.5))}>
        noisy float
      </T>
      <Draw pts={noisyPts} t={t} from={1.4} to={2.5} stroke={C.second} w={2} />

      <Cells x={30} y={150} bits={'0'.repeat(64)} cw={3.6} h={12} k={seg(t, 2.4, 3.0)} col={() => C.quiet} digits={false} />
      <T x={145} y={186} s={12} f={C.secondary} a="middle" o={easeOut(seg(t, 2.9, 3.3))}>
        XOR = 0, 475 of 499
      </T>
      {!on ? (
        <T x={455} y={174} s={22} f={C.focus} a="middle" w={600} o={easeOut(seg(t, 3.2, 3.6))}>
          ?
        </T>
      ) : (
        <g>
          <Cells x={340} y={150} bits={NOISY_XOR} cw={3.6} h={12} k={seg(s, 0.1, 1.2)} col={(i) => (i < 13 || i === 63 ? C.quiet : C.bad)} digits={false} />
          <T x={455} y={186} s={12} f={C.badText} a="middle" o={easeOut(seg(s, 1.1, 1.5))}>
            50 of 64 bits kept
          </T>
        </g>
      )}
    </Svg>
  );
}

// 3 · Three regimes, one encoder. Every strip starts at raw's 16 bytes and shrinks to what Gorilla measured: the slow
// signal collapses to 0.57 B (÷28), the noisy one stalls at 7.69 B (÷2.1, red), the decimal one at 6.53 B (÷2.5).
export function RevealThreeRegimes({ t }: StepCtx) {
  const W = 450;
  const rows = [
    { l: 'slow, regular', v: 0.57, r: '0.57 B  ÷28', c: C.focus, a: 0.8 },
    { l: 'noisy float', v: 7.69, r: '7.69 B  ÷2.1', c: C.bad, a: 2.0 },
    { l: 'decimal signal', v: 6.53, r: '6.53 B  ÷2.5', c: C.second, a: 3.2 },
  ];
  return (
    <Svg label="the same Gorilla encoder shrinks a slow, regular signal by far while barely helping a noisy, high-precision signal — the ratio is a property of the data" h={260}>
      <T x={25} y={26} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        raw
      </T>
      <rect x={25} y={34} width={W * easeOut(seg(t, 0, 0.6))} height={14} fill={C.quiet} />
      <T x={575} y={46} s={13} f={C.secondary} a="end" o={easeOut(seg(t, 0.4, 0.7))}>
        16 B
      </T>
      {rows.map((r, i) => {
        const y = 82 + i * 54;
        const appear = easeOut(seg(t, r.a - 0.2, r.a + 0.1));
        const k = easeInOut(seg(t, r.a, r.a + 1.0));
        const done = k > 0.98;
        return (
          <g key={i} opacity={appear}>
            <T x={25} y={y} s={13} f={C.primary}>
              {r.l}
            </T>
            <rect x={25} y={y + 8} width={lerp(W, (W * r.v) / RAW, k)} height={14} fill={done ? r.c : C.quiet} />
            <T x={575} y={y + 20} s={14} f={r.c === C.bad ? C.badText : r.c} a="end" w={600} o={easeOut(seg(t, r.a + 0.9, r.a + 1.2))}>
              {r.r}
            </T>
          </g>
        );
      })}
      <T x={300} y={246} s={12} f={C.quiet} a="middle" o={easeOut(seg(t, 4.5, 5.0))}>
        same encoder, unmodified
      </T>
    </Svg>
  );
}

// The decimal regime cycles through eleven values (20.00 to 23.70 in steps of 0.37), so the 12th reading repeats the 1st.
const decVals = [20.0, 20.37, 20.74, 21.11, 21.48, 21.85, 22.22, 22.59, 22.96, 23.33, 23.7, 20.0];
const decPt = (i: number): Pt => [40 + i * 20, 182 - (decVals[i] - 20) * 12] as const;

// 4 · Top: the tail of an XOR — eight meaningful bits, then four zeros. Gorilla-style counting would spend a 6-bit
// field on those zeros; the field is crossed out and Chimp simply keeps the four zeros. Bottom: the decimal regime's
// sawtooth; the newest reading arcs back eleven readings to an identical 20.00 (XOR = 0), and the decimal-regime bars
// shrink: one-previous-value Chimp 7.80 B, Chimp128 0.43 B.
export function RevealChimp({ t }: StepCtx) {
  const tail = '101101110000';
  const keep = easeOut(seg(t, 1.9, 2.4));
  const arc = seg(t, 3.4, 4.1);
  const [ax, ay] = decPt(11);
  const [bx, by] = decPt(0);
  const arcPts: Pt[] = Array.from({ length: 21 }, (_, j) => {
    const u = j / 20;
    return [lerp(ax, bx, u), lerp(ay, by, u) - Math.sin(Math.PI * u) * 56] as const;
  });
  const bar = easeInOut(seg(t, 4.3, 5.2));
  return (
    <Svg label="Chimp spends fewer bits on a short trailing-zero run, and Chimp128's wider comparison against many earlier values wins specifically when a signal repeats" h={200}>
      <T x={25} y={31} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        XOR tail
      </T>
      <Cells x={160} y={18} bits={tail} cw={22} k={seg(t, 0.1, 0.8)} col={(i) => (i < 8 ? C.focus : keep > 0.5 ? C.focus : C.quiet)} />
      <T x={25} y={63} s={13} f={C.quiet} o={easeOut(seg(t, 0.9, 1.2))}>
        count them
      </T>
      <Cells x={160} y={50} bits={'000100'} cw={22} k={seg(t, 1.0, 1.5)} col={() => C.second} />
      <T x={300} y={63} s={13} f={C.second} o={easeOut(seg(t, 1.4, 1.7))}>
        +6 bits
      </T>
      <line x1={155} y1={58} x2={lerp(155, 365, easeOut(seg(t, 1.8, 2.1)))} y2={58} stroke={C.badText} strokeWidth={2} opacity={seg(t, 1.8, 1.85)} />
      <T x={438} y={31} s={13} f={C.focus} o={keep}>
        ≤ 6: keep
      </T>

      <Draw pts={decVals.map((_, i) => decPt(i))} t={t} from={2.6} to={3.3} stroke={C.line} w={1.4} pen={false} />
      {decVals.map((_, i) => {
        const [x, y] = decPt(i);
        const lit = (i === 0 || i === 11) && arc > 0.9;
        return <circle key={i} cx={x} cy={y} r={lit ? 5 : 3.5} fill={lit ? C.focus : C.second} opacity={easeOut(seg(t, 2.6 + i * 0.05, 2.8 + i * 0.05))} />;
      })}
      <Draw pts={arcPts} t={t} from={3.4} to={4.1} stroke={C.focus} w={1.6} dash="4 3" />
      <T x={150} y={118} s={12} f={C.focus} a="middle" o={easeOut(seg(t, 4.0, 4.3))}>
        11 back: XOR = 0
      </T>

      <T x={330} y={138} s={13} f={C.secondary} o={easeOut(seg(t, 4.2, 4.5))}>
        Chimp
      </T>
      <rect x={330} y={144} width={240} height={10} fill={C.quiet} opacity={easeOut(seg(t, 4.2, 4.5))} />
      <T x={575} y={138} s={13} f={C.secondary} a="end" o={easeOut(seg(t, 4.3, 4.6))}>
        7.80 B
      </T>
      <T x={330} y={176} s={13} f={C.focus} o={easeOut(seg(t, 4.2, 4.5))}>
        Chimp128
      </T>
      <rect x={330} y={182} width={lerp(240, (240 * 0.43) / 7.8, bar)} height={10} fill={bar > 0.98 ? C.focus : C.quiet} opacity={easeOut(seg(t, 4.2, 4.5))} />
      <T x={575} y={176} s={14} f={C.focus} a="end" w={600} o={easeOut(seg(t, 5.1, 5.4))}>
        0.43 B
      </T>
    </Svg>
  );
}

// IEEE-754 bits of 21.37: 1 sign, 11 exponent, 52 mantissa. Mantissa bits past the 11th sit below 0.01.
const BITS_2137 = '0100000000110101010111101011100001010001111010111000010100011111';

// 5 · 21.37 as a float: 64 cells fill (sign, exponent pale blue, mantissa white). A red bracket marks the 41 low bits
// below the reading's 0.01 step — noise to the meaning. Then × 100: 2137, twelve exact cells. Then ÷ 100 gives back
// 21.37 exactly, and the DuckDB default tag lands.
export function RevealALP({ t }: StepCtx) {
  const noise = easeOut(seg(t, 1.3, 2.0));
  const cx = (i: number) => 100 + i * 7.2;
  return (
    <Svg label="a decimal sensor reading's low bits are measurement noise to a bit-pattern codec; ALP encodes it as a small exact integer instead, and is DuckDB's own default float codec" h={200}>
      <T x={25} y={34} s={16} f={C.focus} w={600} o={easeOut(seg(t, 0, 0.3))}>
        21.37
      </T>
      <Cells x={100} y={21} bits={BITS_2137} cw={7.2} h={16} k={seg(t, 0.1, 1.2)} col={(i) => (i === 0 ? C.quiet : i < 12 ? C.second : i >= 23 && noise > 0.5 ? C.bad : C.focus)} digits={false} />
      <path d={`M${cx(23)} 44 L${cx(23)} 50 L${cx(64)} 50 L${cx(64)} 44`} fill="none" stroke={C.badText} strokeWidth={1.4} opacity={noise} />
      <T x={(cx(23) + cx(64)) / 2} y={68} s={12} f={C.badText} a="middle" o={noise}>
        below 0.01: noise
      </T>

      <T x={25} y={110} s={13} f={C.secondary} o={easeOut(seg(t, 2.4, 2.7))}>
        × 100
      </T>
      <T x={100} y={112} s={20} f={C.focus} w={600} o={easeOut(seg(t, 2.6, 3.0))}>
        2137
      </T>
      <Cells x={180} y={96} bits={'100001011001'} cw={16} h={18} k={seg(t, 2.9, 3.7)} col={() => C.focus} />
      <T x={575} y={110} s={13} f={C.focus} a="end" o={easeOut(seg(t, 3.6, 3.9))}>
        12 bits, exact
      </T>

      <T x={25} y={150} s={14} f={C.primary} o={easeOut(seg(t, 3.9, 4.3))}>
        2137 ÷ 100 = 21.37
      </T>
      <Tick x={300} y={145} k={easeOutBack(seg(t, 4.2, 4.6))} />
      <Box x={330} y={160} w={240} label="DuckDB's default" lit o={easeOutBack(seg(t, 4.6, 5.1))} />
    </Svg>
  );
}

// 6 · Six rows of tag names, two distinct strings. Each name is replaced by its dictionary code (0 or 1) while the
// dictionary fills in; brackets gather each run into "× 3"; then the stored-size bar's tag part shrinks to a sliver,
// leaving the values.
export function RevealDictionaryRLE({ t }: StepCtx) {
  const names = ['oven.temp', 'oven.temp', 'oven.temp', 'oven.press', 'oven.press', 'oven.press'];
  const code = easeInOut(seg(t, 1.2, 2.2));
  const runs = easeOut(seg(t, 2.6, 3.3));
  const squeeze = easeInOut(seg(t, 3.9, 4.9));
  return (
    <Svg label="a dictionary plus run-length encoding collapses the repeated equipment and signal names to almost nothing, leaving the compressed size dominated by values" h={200}>
      {names.map((n, i) => {
        const y = 30 + i * 28;
        return (
          <g key={i} opacity={easeOut(seg(t, i * 0.12, 0.3 + i * 0.12))}>
            <T x={25} y={y} s={13} f={code > 0.5 ? C.quiet : C.primary}>
              {n}
            </T>
            <T x={170} y={y} s={15} f={C.second} w={600} a="middle" o={code}>
              {i < 3 ? '0' : '1'}
            </T>
          </g>
        );
      })}
      {[0, 3].map((r) => (
        <g key={r} opacity={runs}>
          <path d={`M188 ${16 + r * 28} L196 ${16 + r * 28} L196 ${40 + (r + 2) * 28} L188 ${40 + (r + 2) * 28}`} fill="none" stroke={C.focus} strokeWidth={1.4} />
          <T x={206} y={34 + (r + 1) * 28} s={14} f={C.focus} w={600}>
            × 3
          </T>
        </g>
      ))}

      <g opacity={easeOut(seg(t, 1.2, 1.7))}>
        <rect x={330} y={14} width={245} height={64} rx={5} fill={C.panel} stroke={C.line} strokeWidth={1.1} />
        <T x={345} y={40} s={13} f={C.second}>
          0 = oven.temp
        </T>
        <T x={345} y={64} s={13} f={C.second}>
          1 = oven.press
        </T>
      </g>
      <T x={345} y={104} s={13} f={C.focus} o={runs}>
        runs: 0 × 3, 1 × 3
      </T>

      <g opacity={easeOut(seg(t, 3.6, 3.9))}>
        <rect x={330} y={140} width={lerp(120, 6, squeeze)} height={16} fill={C.second} />
        <rect x={330 + lerp(120, 6, squeeze) + 2} y={140} width={125} height={16} fill={C.focus} />
        <T x={330} y={132} s={12} f={C.second} o={1 - squeeze}>
          tags
        </T>
        <T x={575} y={180} s={13} f={C.focus} a="end" o={easeOut(seg(t, 4.8, 5.2))}>
          left over: values
        </T>
      </g>
    </Svg>
  );
}

// 7 · Four lanes, each a tiny picture of its winning case: a staircase for delta and XOR, a sawtooth with an arc back
// for the wider search, 2137 for ALP, and a line inside a band for a lossy codec that names its error.
export function Recap({ t }: StepCtx) {
  const lane = (i: number) => 40 + i * 58;
  const k = (i: number) => easeOut(seg(t, i * 1.15, i * 1.15 + 0.5));
  const stair: Pt[] = [
    [30, 50],
    [70, 50],
    [70, 40],
    [110, 40],
    [110, 30],
    [150, 30],
  ];
  const saw: Pt[] = Array.from({ length: 9 }, (_, j) => [30 + j * 15, lane(1) + 12 - (j % 4) * 7] as const);
  const wave: Pt[] = Array.from({ length: 13 }, (_, j) => [30 + j * 10, lane(3) + 4 + Math.sin(j * 0.9) * 6] as const);
  const texts = [
    { l: 'delta, XOR', r: 'slow, regular', c: C.focus },
    { l: 'wider search', r: 'repeating data', c: C.second },
    { l: 'ALP', r: 'decimal data', c: C.focus },
    { l: 'lossy codec', r: 'names its error', c: C.badText },
  ];
  return (
    <Svg
      label="delta-of-delta and XOR win on slow regular data, Chimp's wider search wins on repeating data, ALP wins on decimal data, and a lossy codec trades accuracy for a stated error band"
      h={260}
    >
      <Draw pts={stair} t={t} from={0} to={0.6} stroke={C.focus} w={2} />
      <Draw pts={saw} t={t} from={1.15} to={1.7} stroke={C.second} w={1.8} />
      <path d={`M${saw[8][0]} ${saw[8][1]} Q 90 ${lane(1) - 22} ${saw[0][0]} ${saw[0][1]}`} fill="none" stroke={C.focus} strokeWidth={1.4} strokeDasharray="4 3" opacity={easeOut(seg(t, 1.7, 2.1))} />
      <T x={30} y={lane(2) + 10} s={18} f={C.focus} w={600} o={k(2)}>
        2137
      </T>
      <rect x={30} y={lane(3) - 6} width={120} height={20} fill="none" stroke={C.badText} strokeWidth={1} strokeDasharray="3 3" opacity={k(3)} />
      <Draw pts={wave} t={t} from={3.6} to={4.2} stroke={C.focus} w={1.8} />
      {texts.map((x, i) => (
        <g key={i} opacity={k(i)}>
          <T x={180} y={lane(i) + 9} s={14} f={C.primary}>
            {x.l}
          </T>
          <T x={575} y={lane(i) + 9} s={14} f={x.c} a="end" w={600}>
            {x.r}
          </T>
        </g>
      ))}
    </Svg>
  );
}

// 8 · The measured table: three codecs × three regimes, bytes per point. Before the answer: "one winner everywhere?".
// After it, each column's best value is boxed white and its worst turns red — Gorilla is best twice and worst once,
// Chimp128 best on decimal; no row is best in every column.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const cols = ['regular', 'noisy', 'decimal'];
  const cx = (j: number) => 270 + j * 130;
  const rows = [
    { l: 'Gorilla', v: ['0.57', '7.69', '6.53'] },
    { l: 'Chimp128', v: ['0.61', '7.95', '0.43'] },
    { l: 'zstd', v: ['2.49', '8.78', '3.50'] },
  ];
  const best = [0, 0, 1];
  const worst = [2, 2, 0];
  const mark = on ? easeOut(seg(s, 0.2, 0.9)) : 0;
  return (
    <Svg label="a vendor claims one codec beats every other codec on every workload — should that claim survive contact with this plant's own data?" h={200}>
      <T x={25} y={30} s={12} f={C.quiet} o={easeOut(seg(t, 0, 0.3))}>
        bytes / point
      </T>
      {cols.map((c, j) => (
        <T key={c} x={cx(j)} y={30} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 0.1 + j * 0.1, 0.4 + j * 0.1))}>
          {c}
        </T>
      ))}
      {rows.map((r, i) => {
        const y = 68 + i * 38;
        return (
          <g key={r.l} opacity={easeOut(seg(t, 0.5 + i * 0.4, 0.9 + i * 0.4))}>
            <T x={25} y={y} s={14} f={C.primary}>
              {r.l}
            </T>
            {r.v.map((v, j) => {
              const isBest = best[j] === i;
              const isWorst = worst[j] === i;
              return (
                <g key={j}>
                  {isBest && mark > 0 && <rect x={cx(j) - 34} y={y - 19} width={68} height={27} rx={4} fill="none" stroke={C.focus} strokeWidth={1.6} opacity={mark} />}
                  <T x={cx(j)} y={y} s={14} f={isWorst && mark > 0.5 ? C.badText : isBest && mark > 0.5 ? C.focus : C.secondary} a="middle" w={isBest && mark > 0.5 ? 600 : 400}>
                    {v}
                  </T>
                </g>
              );
            })}
          </g>
        );
      })}
      {!on ? (
        <T x={300} y={188} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 2.2, 2.6))}>
          one winner everywhere?
        </T>
      ) : (
        <T x={300} y={188} s={13} f={C.focus} a="middle" o={easeOut(seg(s, 1.0, 1.4))}>
          the winner changes with the data
        </T>
      )}
    </Svg>
  );
}
