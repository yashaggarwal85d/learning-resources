import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

// A key's own write order is only genuinely guaranteed within one partition;
// key-based routing holds that order only as long as the partition count
// itself never changes.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Does every write to the same key land in the same partition (predict) ─
export function RoutePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="several keys, one real partitioning function"
        lines={['let idx = partition_for(key, partition_count);', '// hash(key) % N -- always the same idx?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: genuinely the same partition every time (no takeaway) ────
export function RouteReveal({ t }: StepCtx) {
  const rows = ['every write to the same key, same partition', 'the identical relative order, every time'];
  return (
    <Svg label="key_partitioning_order_tradeoff.rs, measured" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 3 · Does every existing key's routing stay put on resize (predict) ─────
export function ResizePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the topic grows from four partitions to six"
        lines={['partition_for(key, 4) vs partition_for(key, 6)', '// does every existing key route the same way?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: at least one key reroutes (takeaway) ─────────────────────
export function ResizeReveal({ t }: StepCtx) {
  return (
    <Svg label="key_partitioning_order_tradeoff.rs, measured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>four partitions became six, a real resize</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>at least one key's own route changed</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>growing a topic is never free for a key</T>
    </Svg>
  );
}

// ── 5 · Does the rerouted key's history stay in one place (predict) ────────
export function SplitPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the rerouted key keeps writing after the resize"
        lines={['// its old entries sit in the old partition', '// where do the new writes land?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: the history genuinely splits (takeaway) ──────────────────
export function SplitReveal({ t }: StepCtx) {
  return (
    <Svg label="key_partitioning_order_tradeoff.rs, measured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the same key, written before and after resize</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>old entries stayed in the old partition</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>new writes landed in a different one</T>
    </Svg>
  );
}

// ── 7 · Confluent's own words on this exact rule (connecting) ──────────────
export function ConfluentReveal({ t }: StepCtx) {
  const rows = ['same key, same partition, always', "a partition's own order is read in order"];
  return (
    <Svg label="Confluent Documentation, quoted" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 8 · The design document's own words on segments (connecting) ───────────
export function DesignDocReveal({ t }: StepCtx) {
  const rows = ['the log itself: just a directory of files', 'compaction recopies whole segments'];
  return (
    <Svg label="Apache Kafka design document, quoted" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 9 · All three outcomes, measured together (takeaway) ───────────────────
export function CoherenceReveal({ t }: StepCtx) {
  const rows = ['fixed count: per-key order holds', 'resize: at least one key reroutes', "that key's history splits across both"];
  return (
    <Svg label="key_partitioning_order_tradeoff.rs, measured" h={200}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 10 · Recap ──────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'order holds only within one partition',
    'key routing holds only while count is fixed',
    "growing it can split a key's own history",
    'segments and compaction are the real files',
  ];
  return (
    <Svg label="recap: one real routing function, measured" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
