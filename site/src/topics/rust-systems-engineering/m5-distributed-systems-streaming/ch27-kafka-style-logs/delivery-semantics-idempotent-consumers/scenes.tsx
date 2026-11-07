import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Draw, Stack, Svg, T, C } from '../../../../../reels/kit';

// At-least-once delivery genuinely redelivers a message whose own effect
// may have already run; a real idempotency key removes that duplicate's
// own effect without ever stopping the redelivery itself.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Does a crash between effect and commit redeliver (predict) ────────
export function CrashPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="apply the side effect, then commit the offset"
        lines={['ledger.apply_deposit(amount);', '// crash right here -- redelivered next poll?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: genuinely redelivered (no takeaway, "from" step) ────────
export function CrashReveal({ t }: StepCtx) {
  const rows = ['the offset never committed, before the crash', 'the next poll redelivered the same message'];
  return (
    <Svg label="idempotent_consumer_removes_duplicate_effect.rs" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 3 · Does a naive consumer apply the effect twice (predict) ────────────
export function DupPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the redelivered message hits the side effect again"
        lines={['// the side effect itself has no memory of its own', 'ledger.apply_deposit(amount); // twice?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: genuinely applied twice (takeaway) ───────────────────────
export function DupReveal({ t }: StepCtx) {
  const land1 = easeOut(seg(t, 0.4, 0.65));
  const land2 = easeOut(seg(t, 0.8, 1.05));
  return (
    <Svg label="idempotent_consumer_removes_duplicate_effect.rs" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>a naive consumer, after the real redelivery</T>
      <circle cx={100} cy={80 - (1 - land1) * 20} r={5} fill={C.caramel} opacity={fa(t, 0.4, 0.2)} />
      <circle cx={100} cy={80 - (1 - land2) * 20} r={5} fill={C.cherry} opacity={fa(t, 0.8, 0.2)} />
      <T x={115} y={84} s={12} f={C.latte} o={fa(t, 0.8, 0.3)}>applied twice</T>
      {fa(t, 1.2, 0.4) > 0.85 && <T x={190} y={125} s={13} a="middle" f={C.mocha}>the side effect ran a second real time</T>}
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.6, 0.3)}>the real ledger balance is now wrong</T>
    </Svg>
  );
}

// ── 5 · Does a real idempotency key remove the duplicate (predict) ────────
export function FixPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a real idempotency key: producer id, sequence"
        lines={['if !seen.contains(&(producer_id, sequence)) {', '    ledger.apply_deposit(amount); // genuinely gone?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: genuinely removed (takeaway) ──────────────────────────────
export function FixReveal({ t }: StepCtx) {
  const land1 = easeOut(seg(t, 0.4, 0.65));
  const blocked = easeOut(seg(t, 0.8, 1.0));
  return (
    <Svg label="idempotent_consumer_removes_duplicate_effect.rs" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the identical crash, the identical redelivery</T>
      <circle cx={100} cy={80 - (1 - land1) * 20} r={5} fill={C.caramel} opacity={fa(t, 0.4, 0.2)} />
      <circle cx={100} cy={80} r={5} fill="none" stroke={C.cherry} strokeWidth={1.5} opacity={fa(t, 0.8, 0.2) * blocked} />
      <T x={115} y={84} s={12} f={C.latte} o={fa(t, 0.8, 0.3)}>seen key: skipped</T>
      {fa(t, 1.2, 0.4) > 0.85 && <T x={190} y={125} s={13} a="middle" f={C.mocha}>the real key: producer id, sequence number</T>}
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.6, 0.3)}>the real balance landed exactly right</T>
    </Svg>
  );
}

// ── 7 · Does the redelivery itself also disappear (predict) ────────────────
export function StillRedeliversPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the idempotency key stopped the effect"
        lines={['// redeliveries: measured, counted, nonzero', '// does the redelivery itself disappear too?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · Measured: redelivery still happens (takeaway) ───────────────────────
export function StillRedeliversReveal({ t }: StepCtx) {
  const travel = easeOut(seg(t, 0.4, 0.75));
  return (
    <Svg label="idempotent_consumer_removes_duplicate_effect.rs" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>a real, counted redelivery, every time</T>
      <Draw pts={[[70, 78], [290, 78]]} t={t} from={0.4} to={0.75} stroke={C.caramel} w={2} pen />
      <circle cx={70 + travel * 220} cy={78} r={5} fill={C.caramel} opacity={fa(t, 0.4, 0.2)} />
      <circle cx={290} cy={78} r={5} fill="none" stroke={C.cherry} strokeWidth={1.5} opacity={fa(t, 0.8, 0.2)} />
      {fa(t, 1.1, 0.4) > 0.85 && <T x={190} y={120} s={13} a="middle" f={C.mocha}>the message is still genuinely redelivered</T>}
      <T x={60} y={155} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>only its own effect never runs twice</T>
    </Svg>
  );
}

// ── 9 · Both sources' own words on this exact rule (connecting) ────────────
export function DocsReveal({ t }: StepCtx) {
  const rows = ['a real id per producer, from the broker', 'deduped by a real sequence number'];
  return (
    <Svg label="Confluent Docs / Apache Kafka design, quoted" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 10 · Recap ───────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'at-least-once can redeliver an applied effect',
    'a key removes the effect, not the delivery',
    'the broker never promises consumer memory',
  ];
  return (
    <Svg label="recap: a real crash, a real idempotency key" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
