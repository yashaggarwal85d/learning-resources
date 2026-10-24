import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

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
  return (
    <Svg label="idempotent_consumer_removes_duplicate_effect.rs" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>a naive consumer, after the real redelivery</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>the side effect ran a second real time</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>the real ledger balance is now wrong</T>
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
  return (
    <Svg label="idempotent_consumer_removes_duplicate_effect.rs" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the identical crash, the identical redelivery</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>the real key: producer id, sequence number</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>the real balance landed exactly right</T>
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
  return (
    <Svg label="idempotent_consumer_removes_duplicate_effect.rs" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>a real, counted redelivery, every time</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>the message is still genuinely redelivered</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>only its own effect never runs twice</T>
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
