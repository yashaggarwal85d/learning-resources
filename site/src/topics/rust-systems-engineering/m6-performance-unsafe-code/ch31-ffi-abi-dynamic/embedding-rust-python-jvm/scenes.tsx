import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

// PyO3 can hand Python the same real buffer it already has, and can
// explicitly step out of the interpreter's own way while real Rust
// work runs; a data-platform deployment built this way gets both for
// free, if the code asks for them.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Does the address match on both sides (predict) ──────────────────
export function ZeroCopyPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="one real bytearray, read from the Rust side"
        lines={['buffer_address_py(buf); // reads the real address', '// does ctypes see the identical address in Python?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: the identical address (no takeaway, "from") ───────────
export function ZeroCopyReveal({ t }: StepCtx) {
  const rows = ['the real address, read from the Rust side', 'the real address, read from the Python side'];
  return (
    <Svg label="pyo3_exchanges_data_without_copying_it" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 3 · How much progress while the GIL is held (predict) ───────────────
export function HeldGilPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a real busy loop, the GIL held the whole time"
        lines={['busy_wait_holding_gil_py(200); // real CPU work', '// a separate Python thread, counting, meanwhile']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: very little progress (takeaway) ────────────────────────
export function HeldGilReveal({ t }: StepCtx) {
  return (
    <Svg label="pyo3_exchanges_data_without_copying_it" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the other thread's own real counter</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>genuinely very little progress made</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>holding it leaves almost no room to run</T>
    </Svg>
  );
}

// ── 5 · Does releasing it change that (predict) ──────────────────────────
export function ReleasedGilPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the identical real work, the GIL released now"
        lines={['busy_wait_releasing_gil_py(200); // same real work', '// does the other thread now get more done?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: dramatically more progress (takeaway) ──────────────────
export function ReleasedGilReveal({ t }: StepCtx) {
  return (
    <Svg label="pyo3_exchanges_data_without_copying_it" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the identical counter, the GIL released now</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>many times more real progress made</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>detach is the act that lets this happen</T>
    </Svg>
  );
}

// ── 7 · Both sources' own words on these exact rules (connecting) ───────
export function DocsReveal({ t }: StepCtx) {
  const rows = ['detach: other work runs while Rust runs', 'as_bytes: the buffer itself, not a copy'];
  return (
    <Svg label="PyO3 guide / PyByteArrayMethods docs, quoted" h={180}>
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
  const rows = ['the same real buffer, handed over, not copied', 'the interpreter, explicitly stepped out of', 'neither happens unless the code asks for it'];
  return (
    <Svg label="recap: PyO3 gets both, if the code asks" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
