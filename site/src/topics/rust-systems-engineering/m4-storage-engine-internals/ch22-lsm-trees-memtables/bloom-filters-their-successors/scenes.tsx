import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Draw, Stack, Svg, T, C } from '../../../../../reels/kit';

// A Bloom filter never forgets a key it was actually given, so a
// negative result is always proof of absence; a positive result only
// grants permission to go look, never a guarantee. Spending more bits
// per key genuinely lowers the real false-positive rate, though with
// diminishing returns.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Could an inserted key ever come back absent (predict, hook) ──────
export function NeverForgetsPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="one key, genuinely inserted, checked again"
        lines={['filter.insert(key); filter.might_contain(key);', '// could this ever come back false?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: zero false negatives (takeaway) ─────────────────────────
export function NeverForgetsReveal({ t }: StepCtx) {
  const rows = ['every inserted key: found', 'no budget ever changes that'];
  return (
    <Svg label="bloom_filter_false_positive_tradeoff.rs, measured" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 3 · Can a never-inserted key come back positive (predict) ────────────
export function FalsePositivesPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a tight budget, a key never inserted"
        lines={['filter.might_contain(never_inserted_key);', '// could this ever come back true?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: real false positives exist (takeaway) ───────────────────
export function FalsePositivesReveal({ t }: StepCtx) {
  const probes = [0, 1, 2, 3, 4, 5, 6, 7];
  const hit = new Set([2, 6]);
  return (
    <Svg label="bloom_filter_false_positive_tradeoff.rs, measured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>never-inserted keys, probed for real</T>
      {probes.map((i) => {
        const land = easeOut(seg(t, 0.5 + i * 0.08, 0.7 + i * 0.08));
        const dy = (1 - land) * -16;
        return (
          <circle
            key={i}
            cx={70 + i * 32}
            cy={82 + dy}
            r={5}
            fill={hit.has(i) ? C.cherry : C.taupe}
            opacity={fa(t, 0.5 + i * 0.08, 0.2)}
          />
        );
      })}
      {fa(t, 1.3, 0.4) > 0.85 && <T x={190} y={120} s={13} a="middle" f={C.mocha}>some genuinely came back maybe-present</T>}
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.6, 0.4)}>a positive is permission, not proof</T>
    </Svg>
  );
}

// ── 5 · Does more budget change the rate (predict) ────────────────────────
export function MoreBitsPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the same filter, a far larger budget"
        lines={['BloomFilter::with_bits_per_key(n, 4, hashes);', 'BloomFilter::with_bits_per_key(n, 12, hashes);']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: the rate genuinely drops (takeaway) ─────────────────────
export function MoreBitsReveal({ t }: StepCtx) {
  const low = easeOut(seg(t, 0.4, 0.75));
  const high = easeOut(seg(t, 0.8, 1.15));
  return (
    <Svg label="bloom_filter_false_positive_tradeoff.rs, measured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>same filter, two real bits-per-key budgets</T>
      <T x={60} y={75} s={12} f={C.latte} o={fa(t, 0.35, 0.3)}>4 bits/key</T>
      <rect x={60} y={82} width={low * 260} height={16} rx={3} fill={C.cherry} opacity={0.85} />
      <T x={60} y={112} s={12} f={C.latte} o={fa(t, 0.75, 0.3)}>12 bits/key</T>
      <rect x={60} y={119} width={high * 30} height={16} rx={3} fill={C.caramel} />
      {fa(t, 1.3, 0.4) > 0.85 && <T x={190} y={155} s={13} a="middle" f={C.mocha}>more bits: a genuinely lower rate</T>}
      <T x={60} y={180} s={13} f={C.latte} o={fa(t, 1.6, 0.4)}>a real cost, not a free setting</T>
    </Svg>
  );
}

// ── 7 · Does the low end of the table buy more (predict) ─────────────────
export function TablePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="RocksDB's own bits-per-key table"
        lines={['// going from 2 to 5 bits per key, versus', '// going from 10 to 13: same gain, or not?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · Measured, in RocksDB's own numbers: diminishing returns (takeaway) ──
export function TableReveal({ t }: StepCtx) {
  const rows = [
    'a small budget near the bottom',
    'buys far more than the same size higher up',
  ];
  return (
    <Svg label="RocksDB Wiki: RocksDB Bloom Filter, quoted" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 9 · RocksDB's own words on cutting disk reads (connecting) ───────────
export function DiskReadsReveal({ t }: StepCtx) {
  const rows = [
    'cuts unneeded disk reads substantially',
    'a real lookup opens far fewer files',
  ];
  return (
    <Svg label="RocksDB Wiki: Basic Operations, quoted" h={180}>
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
    'a negative is always proof of absence',
    'a positive is only permission to look',
    'more bits per key: a real, lower rate',
    'the whole point: fewer disk reads',
  ];
  return (
    <Svg label="recap: what a filter guarantees, what it budgets" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
