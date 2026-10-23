import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

// mpsc backpressure, broadcast lagging receivers, watch's latest-value-only guarantee, and
// try_send's immediate refusal, each measured directly against a real Tokio channel.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Fast producer, slow consumer (predict, hook) ────────────────────────────────────────────
export function MpscPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="one slot, a producer, a slower consumer"
        lines={['let (tx, rx) = mpsc::channel(1);', 'for i in 0..20 { tx.send(i).await?; }', '// consumer: sleep(15ms) between reads']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: paced (this is the swipe test's "from" step — NO takeaway) ────────────────────
export function MpscReveal({ t }: StepCtx) {
  return (
    <Svg label="mpsc_applies_backpressure.rs: a real, measured pace" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>20 messages, capacity 1</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={85} width={220} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={170} y={112} s={13} a="middle" f={C.mocha}>producer time ≈ consumer time</T>
      </g>
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>paced, not raced</T>
    </Svg>
  );
}

// ── 3 · 5 sends, room for 2, no reader (predict) ────────────────────────────────────────────────
export function BroadcastPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="room for 2, but 5 values are sent"
        lines={['let (tx, mut rx) = broadcast::channel(2);', 'for v in 0..5 { tx.send(v)?; }', '// rx hasn\'t read anything yet']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: Lagged, named (takeaway) ──────────────────────────────────────────────────────
export function BroadcastReveal({ t }: StepCtx) {
  return (
    <Svg label="broadcast_lagging_receiver_drops.rs: a named loss" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>5 sent, 2 kept</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={85} width={220} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={170} y={112} s={13} a="middle" f={C.mocha}>Lagged: 3 dropped</T>
      </g>
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>then resumes from what's left</T>
    </Svg>
  );
}

// ── 5 · 50 sends, one late reader (predict) ─────────────────────────────────────────────────────
export function WatchPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="50 sends, nobody checking in until the end"
        lines={['let (tx, mut rx) = watch::channel(0);', 'for v in 1..=50 { tx.send(v)?; }', 'let seen = *rx.borrow_and_update();']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[2]}
      />
    </Stack>
  );
}

// ── 6 · Measured: only the latest (takeaway) ────────────────────────────────────────────────────
export function WatchReveal({ t }: StepCtx) {
  return (
    <Svg label="watch_keeps_only_latest.rs: 49 gone, on purpose" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>50 values sent</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={85} width={220} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={170} y={112} s={13} a="middle" f={C.mocha}>seen: 50 only</T>
      </g>
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>the other 49 were never meant to be kept</T>
    </Svg>
  );
}

// ── 7 · try_send on a full channel (predict) ────────────────────────────────────────────────────
export function TrySendPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the channel is already full"
        lines={['tx.try_send(1)?;', 'let second = tx.try_send(2); // ?']}
        t={t}
        start={0.1}
        end={2.2}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · Measured: refused instantly (no takeaway, naming step) ─────────────────────────────────
export function TrySendReveal({ t }: StepCtx) {
  return (
    <Svg label="try_send_sheds_load_immediately.rs: a decision, not a wait" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>channel already full</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={85} width={220} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={170} y={112} s={13} a="middle" f={C.mocha}>refused: under a millisecond</T>
      </g>
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>no wait, no silent drop</T>
    </Svg>
  );
}

// ── 9 · Four channels, four promises (takeaway) ─────────────────────────────────────────────────
export function ComparisonReveal({ t }: StepCtx) {
  const rows = [
    'mpsc — waits for room',
    'broadcast — drops oldest, reports it',
    'watch — keeps only the latest',
    'oneshot — exactly one reply',
  ];
  return (
    <Svg label="four channels, four different promises" h={260}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.35, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 10 · Recap ───────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'mpsc genuinely paces a fast producer',
    'broadcast reports exactly what a receiver missed',
    'watch keeps only the latest value, by design',
    'try_send refuses a full channel outright',
  ];
  return (
    <Svg label="recap: four real promises, each measured" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
