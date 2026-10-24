import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

// Processing a batch at a time instead of one row at a time cuts the
// real per-row dispatch overhead by exactly the batch size chosen,
// without changing the real result at all, and two real, independent
// vectorized query engines both name this batch-at-a-time approach
// directly in their own words.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Does batching cut dispatches (predict) ────────────────────────────
export function DispatchPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the identical filter-then-sum, two ways"
        lines={['row_at_a_time_filter_sum(&column) vs vectorized_filter_sum(&column);', '// far fewer dispatches in the batched version?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: far fewer dispatches (no takeaway, the test's own "from" step) ──
export function DispatchReveal({ t }: StepCtx) {
  const rows = ['row-at-a-time: one dispatch per row', 'batch-at-a-time: one dispatch per batch'];
  return (
    <Svg label="vectorized_vs_compiled_execution_tradeoff.rs, measured" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 3 · Does the result stay identical (predict) ──────────────────────────
export function CorrectnessPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="both paths, the identical filter and sum"
        lines={['row_sum == vec_sum?', '// still the exact same answer?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: the identical result (takeaway) ─────────────────────────
export function CorrectnessReveal({ t }: StepCtx) {
  return (
    <Svg label="vectorized_vs_compiled_execution_tradeoff.rs, measured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>row-at-a-time sum vs batch-at-a-time sum</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={102} s={13} a="middle" f={C.mocha}>exact identical result, both paths</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>batching changes cost, not correctness</T>
    </Svg>
  );
}

// ── 5 · Does the dispatch count match the arithmetic exactly (predict) ───
export function ArithmeticPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the predicted dispatch count, against the real one"
        lines={['vec_dispatches == column.len().div_ceil(batch_size)?', '// an exact match, or merely close?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: an exact match (takeaway) ───────────────────────────────
export function ArithmeticReveal({ t }: StepCtx) {
  return (
    <Svg label="vectorized_vs_compiled_execution_tradeoff.rs, measured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>predicted dispatch count vs measured count</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={102} s={13} a="middle" f={C.mocha}>an exact match, not an estimate</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>the cut follows exactly from the batch size</T>
    </Svg>
  );
}

// ── 7 · Does DataFusion name itself vectorized (predict) ──────────────────
export function DataFusionPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="Apache DataFusion's own documentation"
        lines={['// does it name itself a vectorized engine directly?', '// or a row-at-a-time engine instead?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · Measured: DataFusion names itself vectorized (takeaway) ──────────
export function DataFusionReveal({ t }: StepCtx) {
  const rows = ['blazingly fast, vectorized, multithreaded', 'a real streaming execution engine'];
  return (
    <Svg label="Apache DataFusion Docs: Introduction, quoted" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 9 · Polars's own words on batching (connecting) ───────────────────────
export function PolarsReveal({ t }: StepCtx) {
  const rows = ['Polars: not all the data at once', 'instead, executed in real batches'];
  return (
    <Svg label="Polars User Guide: Streaming, quoted" h={180}>
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
    'batching: one dispatch per batch, not per row',
    'the result: unchanged, exactly identical',
    'the cut: exact, not an estimate',
    'real engines: both name batching directly',
  ];
  return (
    <Svg label="recap: what batching buys, what it leaves unchanged" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
