import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

// An idempotency key's own scope, TTL, stored response, and conflict check
// are four genuinely separate real rules, and together they are what lets
// a client safely retry a request it cannot otherwise prove ever arrived.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Does scope keep identical keys from colliding (predict) ───────────
export function ScopePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="two resources, one identical key string"
        lines={['store.begin("charge", key, now, ttl);', 'store.begin("refund", key, now, ttl); // collide?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: genuinely distinct (no takeaway, "from" step) ───────────
export function ScopeReveal({ t }: StepCtx) {
  const rows = ['both resources ran their own real side effect', 'each stored response is genuinely distinct'];
  return (
    <Svg label="idempotency_key_scope_ttl_and_replay.rs" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 3 · Does a duplicate replay or rerun (predict) ─────────────────────────
export function ReplayPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the identical key, a duplicate, within TTL"
        lines={['store.begin("charge", key, now_plus_100, ttl);', '// replays, or runs the side effect again?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: genuinely replays (takeaway) ──────────────────────────────
export function ReplayReveal({ t }: StepCtx) {
  return (
    <Svg label="idempotency_key_scope_ttl_and_replay.rs" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>a duplicate, well within the real TTL</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>the stored response, replayed exactly</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>the side effect never ran a second time</T>
    </Svg>
  );
}

// ── 5 · Does a genuine race double-run the side effect (predict) ──────────
export function RacePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the identical key, two requests, close together"
        lines={['store.begin("charge", key, now, ttl); // still running', 'store.begin("charge", key, now_plus_1, ttl); // races?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: genuinely caught (takeaway) ───────────────────────────────
export function RaceReveal({ t }: StepCtx) {
  return (
    <Svg label="idempotency_key_scope_ttl_and_replay.rs" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the first still running, a second arrives</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>the second request: a real conflict, caught</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>the side effect ran exactly once, not twice</T>
    </Svg>
  );
}

// ── 7 · Does an expired key run fresh again (predict) ──────────────────────
export function TtlPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the identical key, now past its own real TTL"
        lines={['store.begin("charge", key, after_ttl, ttl);', '// rejected outright, or treated as brand new?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · Measured: genuinely runs fresh again (takeaway) ─────────────────────
export function TtlReveal({ t }: StepCtx) {
  return (
    <Svg label="idempotency_key_scope_ttl_and_replay.rs" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the identical key, past its own real TTL</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>the expired key treated as brand new</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>the side effect genuinely ran again</T>
    </Svg>
  );
}

// ── 9 · Both sources' own words on this exact rule (connecting) ───────────
export function DocsReveal({ t }: StepCtx) {
  const rows = ['a finished retry: replays the saved response', 'a concurrent one: a real conflict instead'];
  return (
    <Svg label="Stripe Docs / IETF draft, quoted" h={180}>
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
  const rows = ['a key scope keeps keys from colliding', 'TTL bounds how long a response is replayed', 'a race is caught, never run twice'];
  return (
    <Svg label="recap: a real idempotency-key store" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
