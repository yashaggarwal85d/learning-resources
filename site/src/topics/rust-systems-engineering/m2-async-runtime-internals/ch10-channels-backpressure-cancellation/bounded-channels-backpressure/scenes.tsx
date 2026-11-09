import type { StepCtx } from '../../../../../reels/types';
import { easeOut, lerp, seg } from '../../../../../reels/anim';
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
  const n = 5;
  return (
    <Svg label="mpsc_applies_backpressure.rs: a real, measured pace" h={200}>
      <T x={60} y={30} s={13} f={C.quiet}>20 messages, capacity 1</T>
      <rect x={60} y={45} width={50} height={36} rx={6} fill="none" stroke={C.taupe} strokeWidth={1.5} />
      {Array.from({ length: n }).map((_, i) => {
        const start = 0.2 + i * 0.35;
        const k = seg(t, start, start + 0.3);
        return <circle key={i} cx={85} cy={63} r={5} fill={C.caramel} opacity={k > 0 && k < 1 ? 1 : 0} />;
      })}
      <T x={60} y={120} s={13} f={C.mocha} o={fa(t, 1.0, 0.3)}>producer time ≈ consumer time</T>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.3, 0.3)}>paced, not raced</T>
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
      <T x={60} y={30} s={13} f={C.quiet}>5 sent, room for 2</T>
      <rect x={60} y={45} width={110} height={40} rx={6} fill="none" stroke={C.taupe} strokeWidth={1.5} />
      {[0, 1, 2, 3, 4].map((i) => {
        const start = 0.2 + i * 0.2;
        const k = easeOut(seg(t, start, start + 0.25));
        const dropped = i < 3;
        const fadeOut = dropped ? 1 - easeOut(seg(t, start + 0.3, start + 0.55)) : 1;
        return <circle key={i} cx={85 + (i % 2) * 40} cy={65} r={5} fill={dropped ? C.cherryText : C.caramel} opacity={k * fadeOut} />;
      })}
      <T x={60} y={120} s={13} f={C.mocha} o={fa(t, 1.1, 0.3)}>Lagged: 3 dropped</T>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.4, 0.3)}>then resumes from what's left</T>
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
  const n = 10;
  const idx = Math.min(n, Math.floor(easeOut(seg(t, 0.2, 1.0)) * n) + 1);
  return (
    <Svg label="watch_keeps_only_latest.rs: 49 gone, on purpose" h={200}>
      <T x={60} y={30} s={13} f={C.quiet}>50 values sent, one slot</T>
      <rect x={60} y={45} width={60} height={40} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      <T x={90} y={70} s={16} a="middle" f={C.crema} serif>{idx}</T>
      <T x={60} y={120} s={13} f={C.mocha} o={fa(t, 1.1, 0.3)}>seen: 50 only</T>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.4, 0.3)}>the other 49 were never meant to be kept</T>
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
  const bounceX = lerp(260, 200, easeOut(seg(t, 0.4, 0.6)));
  return (
    <Svg label="try_send_sheds_load_immediately.rs: a decision, not a wait" h={200}>
      <T x={60} y={30} s={13} f={C.quiet}>channel already full</T>
      <rect x={60} y={45} width={60} height={40} rx={6} fill="none" stroke={C.taupe} strokeWidth={1.5} />
      <circle cx={90} cy={65} r={5} fill={C.caramel} />
      <circle cx={bounceX} cy={65} r={5} fill={C.cherryText} opacity={fa(t, 0.4, 0.2)} />
      <T x={60} y={120} s={13} f={C.mocha} o={fa(t, 0.8, 0.3)}>refused: under a millisecond</T>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.1, 0.3)}>no wait, no silent drop</T>
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
