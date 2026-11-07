import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Draw, Stack, Svg, T, C } from '../../../../../reels/kit';

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
  const move = easeOut(seg(t, 0.6, 0.95));
  return (
    <Svg label="key_partitioning_order_tradeoff.rs, measured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>four partitions became six, a real resize</T>
      <T x={70} y={78} s={11} f={C.latte} o={fa(t, 0.35, 0.3)}>4 partitions</T>
      <T x={70} y={120} s={11} f={C.latte} o={fa(t, 0.95, 0.3)}>6 partitions</T>
      <Draw pts={[[140, 73], [140 + move * 80, 113]]} t={t} from={0.6} to={0.95} stroke={C.cherry} w={2} pen />
      <circle cx={140} cy={73} r={4} fill={C.caramel} opacity={fa(t, 0.4, 0.2)} />
      <circle cx={140 + move * 80} cy={113} r={4} fill={C.cherry} opacity={fa(t, 0.6, 0.2)} />
      {fa(t, 1.1, 0.4) > 0.85 && <T x={190} y={140} s={13} a="middle" f={C.mocha}>at least one key's own route changed</T>}
      <T x={60} y={170} s={13} f={C.latte} o={fa(t, 1.5, 0.3)}>growing a topic is never free for a key</T>
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
  const oldEntries = [0, 1, 2];
  const newEntries = [0, 1];
  return (
    <Svg label="key_partitioning_order_tradeoff.rs, measured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the same key, written before and after resize</T>
      <T x={60} y={75} s={11} f={C.latte} o={fa(t, 0.35, 0.3)}>old partition</T>
      {oldEntries.map((i) => {
        const land = easeOut(seg(t, 0.4 + i * 0.1, 0.6 + i * 0.1));
        return <circle key={i} cx={70 + i * 25} cy={88 - (1 - land) * 14} r={4} fill={C.caramel} opacity={fa(t, 0.4 + i * 0.1, 0.2)} />;
      })}
      <T x={60} y={115} s={11} f={C.latte} o={fa(t, 0.75, 0.3)}>new partition</T>
      {newEntries.map((i) => {
        const land = easeOut(seg(t, 0.8 + i * 0.1, 1.0 + i * 0.1));
        return <circle key={i} cx={70 + i * 25} cy={128 - (1 - land) * 14} r={4} fill={C.cherry} opacity={fa(t, 0.8 + i * 0.1, 0.2)} />;
      })}
      {fa(t, 1.3, 0.4) > 0.85 && <T x={190} y={155} s={13} a="middle" f={C.mocha}>old entries stayed in the old partition</T>}
      <T x={60} y={180} s={13} f={C.latte} o={fa(t, 1.6, 0.3)}>new writes landed in a different one</T>
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
