import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

// Which single point in a replication pipeline counts as "acknowledged"
// genuinely decides whether a write survives the node that accepted it
// being destroyed: a subset smaller than a quorum, even a durably
// recorded one, can lose it outright, while a real quorum cannot.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Does acked-by-subset survive leader destruction (predict) ────────
export function SubsetPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="acknowledged by the leader alone, then destroyed"
        lines={['replicate_to_threshold(write, 1); destroy_node(leader);', '// does the write survive?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: genuinely lost (no takeaway, the test's own "from" step) ──
export function SubsetReveal({ t }: StepCtx) {
  const rows = ['held only by the leader', 'the leader is destroyed: gone'];
  return (
    <Svg label="acknowledgement_point_durability_tradeoff.rs, measured" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 3 · Does leader-only durability survive (predict) ─────────────────────
export function LeaderOnlyPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="durably recorded by the leader alone, then destroyed"
        lines={['// a disk write on the leader -- enough on its own?', '// or still lost when that one node is gone?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: genuinely lost too (takeaway) ───────────────────────────
export function LeaderOnlyReveal({ t }: StepCtx) {
  return (
    <Svg label="acknowledgement_point_durability_tradeoff.rs, measured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>durable on the leader, still only one node</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={102} s={13} a="middle" f={C.mocha}>genuinely lost, despite durability</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>it never left the node that was destroyed</T>
    </Svg>
  );
}

// ── 5 · Does quorum-persisted survive (predict) ───────────────────────────
export function QuorumPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="persisted by a real quorum, then the leader destroyed"
        lines={['replicate_to_threshold(write, quorum_size(nodes));', '// the identical destruction -- survives this time?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: genuinely survives (takeaway) ───────────────────────────
export function QuorumReveal({ t }: StepCtx) {
  return (
    <Svg label="acknowledgement_point_durability_tradeoff.rs, measured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>a quorum held it, not just the leader</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={102} s={13} a="middle" f={C.mocha}>genuinely survives, same destruction</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>a second real copy, beyond the leader</T>
    </Svg>
  );
}

// ── 7 · Does Kafka name this exact loss (predict) ─────────────────────────
export function KafkaAcksPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="Kafka's own documentation on its weakest setting"
        lines={['// does it name the leader-alone case as a real loss?', '// or claim it is fully durable on its own?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · Measured: Kafka names the real loss (takeaway) ────────────────────
export function KafkaAcksReveal({ t }: StepCtx) {
  const rows = ['leader fails before followers replicate', 'the record: genuinely lost'];
  return (
    <Svg label="Confluent Docs: Kafka Producer Configuration Reference, quoted" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 9 · Kafka's own quorum-enforcement setting (connecting) ──────────────
export function MinInsyncReveal({ t }: StepCtx) {
  const rows = ['min.insync.replicas: the real floor', 'below it: the producer raises an exception'];
  return (
    <Svg label="Confluent Docs: Kafka Topic Configuration Reference, quoted" h={180}>
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
    'subset: lost, once that node is destroyed',
    'leader-only durable: lost too, same reason',
    'real quorum: survives the identical loss',
    'the rule: the ack point decides what survives',
  ];
  return (
    <Svg label="recap: what an acknowledgement point actually promises" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
