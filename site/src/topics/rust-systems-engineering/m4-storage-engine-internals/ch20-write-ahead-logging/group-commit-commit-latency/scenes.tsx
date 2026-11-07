import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Draw, Stack, Svg, T, C } from '../../../../../reels/kit';

// Without grouping, every transaction pays for its own flush; group
// commit trades a short wait for one flush instead of many. Inside one
// batch, commit latency is entirely about how long the shared flush
// made you wait, not about any transaction's own execution time. And
// asynchronous commit's own risk window is real: acknowledging before
// the flush can tell a client something that wasn't true yet.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · How many flushes with no grouping (predict, hook) ────────────────
export function NoGroupingPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="five transactions, ready together, no grouping"
        lines={['commit_without_grouping(&mut wal, &ready_ticks);', '// one flush, or one per transaction?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: one flush per transaction (takeaway) ───────────────────
export function NoGroupingReveal({ t }: StepCtx) {
  const rows = [
    'five transactions, ready together',
    'flushes: five, one each',
  ];
  return (
    <Svg label="leader_follower_group_commit_latency.rs, measured" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 3 · How many flushes when grouped (predict) ───────────────────────────
export function GroupedPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the same five, grouped under one leader"
        lines={['commit_with_grouping(&mut wal, &ready_ticks, delay);', '// still five flushes, or just one?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: exactly one flush (takeaway) ────────────────────────────
export function GroupedReveal({ t }: StepCtx) {
  const txns = [0, 1, 2, 3, 4];
  return (
    <Svg label="leader_follower_group_commit_latency.rs, measured" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the same five transactions, grouped</T>
      {txns.map((i) => {
        const converge = easeOut(seg(t, 0.4 + i * 0.05, 0.6 + i * 0.05));
        const x0 = 70 + i * 50;
        const x = x0 + (190 - x0) * converge;
        return <circle key={i} cx={x} cy={76} r={4} fill={C.caramel} opacity={fa(t, 0.4 + i * 0.05, 0.2)} />;
      })}
      <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      {fa(t, 1.1, 0.4) > 0.85 && <T x={190} y={112} s={13} a="middle" f={C.mocha}>flushes: exactly one, for all five</T>}
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>one wait, shared, instead of five flushes</T>
    </Svg>
  );
}

// ── 5 · Does commit latency differ though execution didn't (predict) ─────
export function LatencyPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="identical execution time, one shared batch"
        lines={['commit_latency(&txn); // ready_tick to commit_done_tick', '// identical for all, or does it differ?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: it genuinely differs (takeaway) ─────────────────────────
export function LatencyReveal({ t }: StepCtx) {
  const waits = [120, 95, 70, 45, 20];
  return (
    <Svg label="leader_follower_group_commit_latency.rs, measured" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>same execution time, five latencies</T>
      {waits.map((w, i) => {
        const grow = easeOut(seg(t, 0.4 + i * 0.1, 0.7 + i * 0.1));
        const h = w * 0.25 * grow;
        return (
          <rect
            key={i}
            x={60 + i * 50}
            y={95 - h}
            width={28}
            height={h}
            fill={C.caramel}
            opacity={fa(t, 0.4 + i * 0.1, 0.2)}
          />
        );
      })}
      <rect x={60} y={95} width={260} height={1} fill={C.taupe} />
      {fa(t, 1.2, 0.4) > 0.85 && <T x={190} y={118} s={13} a="middle" f={C.mocha}>earliest-ready: longest wait</T>}
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.6, 0.4)}>latest-ready: shortest wait, same batch</T>
    </Svg>
  );
}

// ── 7 · Does an async-acknowledged txn survive a crash in the gap (predict) ──
export function AsyncPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="acknowledged early, a crash in the gap"
        lines={['async_txn.acknowledged_tick; // before its own flush', '// survives the crash, or not?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · Measured: a false promise, only for async (takeaway) ─────────────
export function AsyncReveal({ t }: StepCtx) {
  const ack = easeOut(seg(t, 0.4, 0.6));
  const flush = easeOut(seg(t, 0.9, 1.15));
  return (
    <Svg label="leader_follower_group_commit_latency.rs, measured" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the same crash tick, two commit modes</T>
      <T x={70} y={88} s={12} f={C.latte} o={fa(t, 0.35, 0.3)}>async</T>
      <circle cx={130 + ack * 130} cy={84} r={4} fill={C.cherry} opacity={fa(t, 0.4, 0.2)} />
      <T x={70} y={118} s={12} f={C.latte} o={fa(t, 0.85, 0.3)}>sync</T>
      <Draw pts={[[130, 114], [260, 114]]} t={t} from={0.9} to={1.15} stroke={C.caramel} w={2} />
      <circle cx={130 + flush * 130} cy={114} r={4} fill={C.caramel} opacity={fa(t, 0.9, 0.2)} />
      {fa(t, 1.3, 0.4) > 0.85 && <T x={190} y={143} s={13} a="middle" f={C.mocha}>async: a false promise. sync: none</T>}
      <T x={60} y={170} s={13} f={C.latte} o={fa(t, 1.7, 0.4)}>sync never tells you before it's true</T>
    </Svg>
  );
}

// ── 9 · PostgreSQL's own words on asynchronous commit (connecting, no takeaway) ──
export function PgAsyncReveal({ t }: StepCtx) {
  const rows = [
    'async commit: faster, may lose recent txns',
    'the risk is data loss, never corruption',
  ];
  return (
    <Svg label="PostgreSQL docs, quoted" h={180}>
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
    'no grouping: one flush per transaction',
    'grouped: one flush for the whole batch',
    "latency is the wait, not execution time",
    'async commit: faster, but can lie briefly',
  ];
  return (
    <Svg label="recap: what grouping buys, what async gives up" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
