import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Draw, Stack, Svg, T, C } from '../../../../../reels/kit';

// A documented safety contract plus a real guard that genuinely
// enforces it is what makes unsafe code sound: no safe caller can ever
// reach undefined behavior through it.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Does a real guard keep a contract sound (predict, hook) ─────────
export function GuardPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="an unsafe function, a documented contract, a guard"
        lines={['buf.get_guarded(index);', '// a real guard in front -- still unsound?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: every in-contract call is correct (no takeaway, "from") ─
export function InContractReveal({ t }: StepCtx) {
  const rows = ['three real indices: every value correct', 'the guard let every one of them through'];
  return (
    <Svg label="safety_contracts_bound_what_a_caller_can_trigger.rs" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 3 · Does the guard still let bad requests through (predict) ─────────
export function RejectPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="three real requests, outside the real contract"
        lines={['buf.get_guarded(8); buf.get_guarded(9); buf.get_guarded(100);', '// any of them reach the unsafe code?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: every bad request rejected (takeaway) ─────────────────
export function RejectReveal({ t }: StepCtx) {
  const reqs = [0, 1, 2];
  return (
    <Svg label="safety_contracts_bound_what_a_caller_can_trigger.rs" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>three real requests, outside the contract</T>
      <rect x={230} y={65} width={70} height={30} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} opacity={fa(t, 0.35, 0.3)} />
      <T x={238} y={84} s={11} f={C.crema} o={fa(t, 0.35, 0.3)}>guard</T>
      {reqs.map((i) => {
        const travel = easeOut(seg(t, 0.5 + i * 0.15, 0.75 + i * 0.15));
        return <circle key={i} cx={90 + travel * 140} cy={80} r={4} fill={C.cherry} opacity={fa(t, 0.5 + i * 0.15, 0.2) * (1 - travel * 0.3)} />;
      })}
      {fa(t, 1.2, 0.4) > 0.85 && <T x={190} y={120} s={13} a="middle" f={C.mocha}>the unsafe call counter: unmoved, genuinely</T>}
      <T x={60} y={155} s={13} f={C.latte} o={fa(t, 1.5, 0.3)}>a sound guard rejects all of it, not most</T>
    </Svg>
  );
}

// ── 5 · Would an unguarded caller violate the contract (predict) ────────
export function UnguardedPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the identical inputs, no real guard this time"
        lines={['8 >= buf.data.len(); 9 >= buf.data.len(); 100 >= buf.data.len();', '// genuinely outside the contract?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: genuinely violates it (takeaway) ───────────────────────
export function UnguardedReveal({ t }: StepCtx) {
  const reqs = [0, 1, 2];
  return (
    <Svg label="safety_contracts_bound_what_a_caller_can_trigger.rs" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the identical inputs, checked directly</T>
      {reqs.map((i) => {
        const travel = easeOut(seg(t, 0.5 + i * 0.15, 0.85 + i * 0.15));
        return (
          <Draw
            key={i}
            pts={[[90 + i * 10, 80], [90 + i * 10 + travel * 150, 80]]}
            t={t}
            from={0.5 + i * 0.15}
            to={0.85 + i * 0.15}
            stroke={C.cherry}
            w={2}
            pen
          />
        );
      })}
      {fa(t, 1.3, 0.4) > 0.85 && <T x={190} y={120} s={13} a="middle" f={C.mocha}>every one: genuinely outside the contract</T>}
      <T x={60} y={155} s={13} f={C.latte} o={fa(t, 1.6, 0.3)}>"my callers don't" is weaker than a guard</T>
    </Svg>
  );
}

// ── 7 · Both sources' own words on this exact rule (connecting, takeaway) ─
export function DocsReveal({ t }: StepCtx) {
  const rows = ['sound: no safe caller can trigger real UB', 'a Safety section writes down the contract'];
  return (
    <Svg label="Rust Reference / API Guidelines, quoted" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 8 · Recap ───────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = ['a documented contract names the real rule', 'a real guard enforces it, before any call', 'no safe caller can ever trigger real UB'];
  return (
    <Svg label="recap: a real contract, a real guard, measured" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
