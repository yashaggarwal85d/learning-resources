import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Draw, Stack, Svg, T, C } from '../../../../../reels/kit';

// A real FFI boundary is a protocol: who frees a handle, where a
// failure's real answer is written, and what a panic crossing the
// line is actually defined to do.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Does a second free on the same handle get rejected (predict) ───
export function OwnershipPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="one real handle, freed once, then freed again"
        lines={['free_buffer_handle(handle); // first free', 'free_buffer_handle(handle); // same handle, again']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: rejected, none left outstanding (no takeaway, "from") ──
export function OwnershipReveal({ t }: StepCtx) {
  const rows = ['every correct pair: accepted once each', 'a second free: genuinely rejected'];
  return (
    <Svg label="an_ffi_boundary_is_a_protocol_not_just_layout.rs" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 3 · What happens to the out pointer on failure (predict) ────────────
export function ErrorCodePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a status code crosses back; so does an out pointer"
        lines={['checked_divide(10, 0, out); // denominator is zero', '// what happens to *out now?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: untouched on failure, written on success (takeaway) ───
export function ErrorCodeReveal({ t }: StepCtx) {
  const write = easeOut(seg(t, 0.5, 0.8));
  return (
    <Svg label="an_ffi_boundary_is_a_protocol_not_just_layout.rs" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>a real success, a real failure, compared</T>
      <T x={70} y={78} s={12} f={C.latte} o={fa(t, 0.35, 0.3)}>success: out pointer written</T>
      <Draw pts={[[260, 65], [260, 85]]} t={t} from={0.5} to={0.8} stroke={C.caramel} w={3} />
      <T x={70} y={115} s={12} f={C.latte} o={fa(t, 0.85, 0.3)}>failure: out pointer untouched</T>
      <circle cx={260} cy={111} r={5} fill="none" stroke={C.cherry} strokeWidth={1.5} opacity={fa(t, 0.85, 0.2)} />
      {fa(t, 1.2, 0.4) > 0.85 && <T x={190} y={150} s={13} a="middle" f={C.mocha}>failure: the out pointer, genuinely untouched</T>}
      <T x={60} y={178} s={13} f={C.latte} o={fa(t, 1.6, 0.3)}>a code alone is only half the protocol</T>
    </Svg>
  );
}

// ── 5 · Does the caller survive a panic crossing C-unwind (predict) ─────
export function UnwindPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a real panic, inside an extern C-unwind function"
        lines={['catch_unwind(|| run_step(true)); // it panics', '// does the caller keep running after this?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: caught, caller genuinely keeps running (takeaway) ─────
export function UnwindReveal({ t }: StepCtx) {
  const travel = easeOut(seg(t, 0.4, 0.7));
  const resume = easeOut(seg(t, 0.95, 1.2));
  return (
    <Svg label="an_ffi_boundary_is_a_protocol_not_just_layout.rs" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the real unwind, caught at the boundary</T>
      <Draw pts={[[70, 80], [200, 80]]} t={t} from={0.4} to={0.7} stroke={C.cherry} w={2} pen />
      <circle cx={70 + travel * 130} cy={80} r={5} fill={C.cherry} opacity={fa(t, 0.4, 0.2)} />
      <rect x={200} y={65} width={60} height={30} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} opacity={fa(t, 0.75, 0.2)} />
      <circle cx={200 + resume * 90} cy={80} r={5} fill={C.caramel} opacity={fa(t, 0.95, 0.2)} />
      {fa(t, 1.3, 0.4) > 0.85 && <T x={190} y={120} s={13} a="middle" f={C.mocha}>the caller: genuinely still running</T>}
      <T x={60} y={155} s={13} f={C.latte} o={fa(t, 1.6, 0.3)}>C-unwind defines exactly this crossing</T>
    </Svg>
  );
}

// ── 7 · Both sources' own words on this exact protocol (connecting) ─────
export function DocsReveal({ t }: StepCtx) {
  const rows = ['destructors release a handed-off resource', 'cleaning up the stack: a named duty'];
  return (
    <Svg label="Rustonomicon / Rust Reference, quoted" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 8 · Recap ─────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = ['who frees a handle, kept by hand, both sides', 'where a failure writes its own real answer', 'what a panic crossing the line must do'];
  return (
    <Svg label="recap: the boundary is a protocol, not just layout" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
