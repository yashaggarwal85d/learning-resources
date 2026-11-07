import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Draw, Stack, Svg, T, C } from '../../../../../reels/kit';

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
  const prod = easeOut(seg(t, 0.9, 1.5));
  const cons = easeOut(seg(t, 0.95, 1.55));
  return (
    <Svg label="mpsc_applies_backpressure.rs: a real, measured pace" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>20 messages, capacity 1</T>
      <rect x={60} y={85} width={prod * 220} height={16} rx={4} fill={C.caramel} opacity={0.6} />
      <rect x={60} y={108} width={cons * 220} height={16} rx={4} fill={C.taupe} opacity={0.6} />
      {prod > 0.9 && <T x={60} y={145} s={13} f={C.mocha}>290ms producer ≈ 290ms consumer</T>}
      <T x={60} y={170} s={13} f={C.latte} o={fa(t, 1.7, 0.4)}>paced, not raced</T>
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
      {[0, 1, 2, 3, 4].map((i) => {
        const dropped = i < 3;
        const fall = easeOut(seg(t, 0.5 + i * 0.1, 0.8 + i * 0.1));
        const dy = dropped ? fall * 20 : 0;
        return (
          <circle key={i} cx={70 + i * 20} cy={82 + dy} r={5} fill={dropped ? C.cherry : C.caramel} opacity={dropped ? 1 - fall * 0.5 : 1} />
        );
      })}
      <rect x={60} y={85} width={220} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      {fa(t, 1.1, 0.4) > 0.85 && <T x={170} y={120} s={13} a="middle" f={C.mocha}>Lagged: 3 dropped</T>}
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
  const sweep = easeOut(seg(t, 0.5, 1.0));
  const dotX = 60 + sweep * 220;
  return (
    <Svg label="watch_keeps_only_latest.rs: 49 gone, on purpose" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>50 values sent</T>
      <circle cx={dotX} cy={82} r={4} fill={C.caramel} opacity={fa(t, 0.5, 0.3)} />
      <rect x={60} y={85} width={220} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      {sweep > 0.9 && <T x={170} y={112} s={13} a="middle" f={C.mocha}>seen: 50 only</T>}
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
  const bounce = easeOut(seg(t, 0.5, 0.75));
  const dx = (1 - Math.abs(bounce - 0.5) * 2) * 30;
  return (
    <Svg label="try_send_sheds_load_immediately.rs: a decision, not a wait" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>channel already full</T>
      <Draw pts={[[230, 82], [260, 82]]} t={t} from={0.5} to={0.65} stroke={C.caramel} w={2} />
      <circle cx={230 + dx} cy={82} r={4} fill={C.caramel} opacity={fa(t, 0.5, 0.2)} />
      <rect x={60} y={85} width={220} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      {fa(t, 0.9, 0.4) > 0.85 && <T x={170} y={112} s={13} a="middle" f={C.mocha}>refused: under a millisecond</T>}
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
