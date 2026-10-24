import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

// A lightweight encoding like run-length can win hugely on repetitive
// data and lose outright on random data, in both compression ratio and
// decode work, so the real choice has to follow the real data's own
// shape, not be applied by default.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Does RLE win big on a skewed column (predict) ────────────────────
export function SkewedPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a skewed column, long runs of one value"
        lines={['rle_encode(&skewed_column);', '// a huge compression ratio, or close to even?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: a huge ratio (no takeaway, the test's own "from" step) ──
export function SkewedReveal({ t }: StepCtx) {
  const rows = ['raw column vs run-length encoded', 'ratio: a huge real win'];
  return (
    <Svg label="lightweight_encoding_decode_cost_tradeoff.rs, measured" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 3 · Does RLE lose on random data (predict) ────────────────────────────
export function RandomPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the identical length, uniformly random column"
        lines={['rle_encode(&random_column);', '// still wins, or genuinely loses?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: genuinely loses (takeaway) ──────────────────────────────
export function RandomReveal({ t }: StepCtx) {
  return (
    <Svg label="lightweight_encoding_decode_cost_tradeoff.rs, measured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>raw column vs run-length encoded</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={102} s={13} a="middle" f={C.mocha}>genuinely larger, not smaller</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>no real runs, no real win</T>
    </Svg>
  );
}

// ── 5 · Is decode work itself distribution-dependent (predict) ───────────
export function DecodeWorkPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="run-headers processed per output value"
        lines={['rle_decode(&skewed_encoded) vs rle_decode(&random_encoded);', '// far fewer headers per value on the skewed column?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: far fewer headers, correct round trip (takeaway) ───────
export function DecodeWorkReveal({ t }: StepCtx) {
  return (
    <Svg label="lightweight_encoding_decode_cost_tradeoff.rs, measured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>headers processed per value, both columns</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={102} s={13} a="middle" f={C.mocha}>skewed: far fewer; both decode exactly</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>decode cost rides on the real shape too</T>
    </Svg>
  );
}

// ── 7 · Does Parquet name a ratio/cost spectrum (predict) ────────────────
export function SpectrumPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="Apache Parquet's own compression documentation"
        lines={['// does it name several codecs on a ratio/cost spectrum?', '// or one single best codec for every case?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · Measured: a real codec spectrum (takeaway) ────────────────────────
export function SpectrumReveal({ t }: StepCtx) {
  const rows = ['several codecs, not one default', 'covering different areas of the spectrum'];
  return (
    <Svg label="Apache Parquet Docs: Compression, quoted" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 9 · Parquet's own name for RLE/bit-packing (connecting) ──────────────
export function RleDefinitionReveal({ t }: StepCtx) {
  const rows = ['RLE: bit-packing combined with run-length', "the identical trick this topic's own encoder runs"];
  return (
    <Svg label="Apache Parquet Docs: Encodings, quoted" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 10 · Recap ─────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'skewed data: RLE wins by a huge ratio',
    'random data: the identical RLE genuinely loses',
    "decode work: also rides on the data's own shape",
    'the rule: follow the real data, never a default',
  ];
  return (
    <Svg label="recap: why an encoding has to follow the data" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
