import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

// codegen-units and lto trade build time for runtime optimization;
// strip trades debuggability for a smaller shipped binary; panic
// strategy trades a real safety capability for a smaller one still;
// a release profile is a set of real, deliberate trades, not a
// single "faster" switch.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Does fat LTO take longer to build (predict) ──────────────────────
export function LtoPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the identical crate, one profile dial added"
        lines={['codegen-units = 1', 'lto = "fat" // does the real build take longer?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: the fat-LTO build genuinely takes longer (no takeaway) ─
export function LtoReveal({ t }: StepCtx) {
  const rows = ['default profile: the real build, timed', 'codegen-units 1, fat LTO: genuinely slower'];
  return (
    <Svg label="profile_demo, timed both ways" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 3 · Does strip=true shrink the real binary (predict) ─────────────────
export function StripPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the identical crate, strip added instead"
        lines={['strip = true', '// does the real file on disk get smaller?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: the stripped binary is genuinely smaller (takeaway) ────
export function StripReveal({ t }: StepCtx) {
  const normal = easeOut(seg(t, 0.4, 0.75));
  const stripped = easeOut(seg(t, 0.8, 1.15));
  return (
    <Svg label="profile_demo, measured both ways" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the real binary, on disk, both ways</T>
      <T x={60} y={75} s={12} f={C.latte} o={fa(t, 0.35, 0.3)}>normal binary</T>
      <rect x={60} y={82} width={normal * 260} height={16} rx={3} fill={C.caramel} />
      <T x={60} y={112} s={12} f={C.latte} o={fa(t, 0.75, 0.3)}>stripped binary</T>
      <rect x={60} y={119} width={stripped * 150} height={16} rx={3} fill={C.cherry} opacity={0.85} />
      {fa(t, 1.3, 0.4) > 0.85 && <T x={190} y={155} s={13} a="middle" f={C.mocha}>genuinely smaller, stripped</T>}
      <T x={60} y={180} s={13} f={C.latte} o={fa(t, 1.6, 0.4)}>no behavior changed, only what ships</T>
    </Svg>
  );
}

// ── 5 · Does panic=abort shrink the real binary too (predict) ────────────
export function AbortPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the identical crate, panic strategy changed"
        lines={['panic = "abort"', '// does the real file on disk get smaller too?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: the abort binary is genuinely smaller too (takeaway) ───
export function AbortReveal({ t }: StepCtx) {
  const unwind = easeOut(seg(t, 0.4, 0.75));
  const abort = easeOut(seg(t, 0.8, 1.15));
  return (
    <Svg label="profile_demo, measured both ways" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the real binary, unwind versus abort</T>
      <T x={60} y={75} s={12} f={C.latte} o={fa(t, 0.35, 0.3)}>panic = "unwind"</T>
      <rect x={60} y={82} width={unwind * 260} height={16} rx={3} fill={C.caramel} />
      <T x={60} y={112} s={12} f={C.latte} o={fa(t, 0.75, 0.3)}>panic = "abort"</T>
      <rect x={60} y={119} width={abort * 190} height={16} rx={3} fill={C.cherry} opacity={0.85} />
      {fa(t, 1.3, 0.4) > 0.85 && <T x={190} y={155} s={13} a="middle" f={C.mocha}>genuinely smaller, without unwinding</T>}
      <T x={60} y={180} s={13} f={C.latte} o={fa(t, 1.6, 0.4)}>a real capability traded for real space</T>
    </Svg>
  );
}

// ── 7 · The Cargo Book's own words on these exact rules (connecting) ────
export function DocsReveal({ t }: StepCtx) {
  const rows = ['better code, at the cost of link time', 'more units, parallel, possibly slower code'];
  return (
    <Svg label="The Cargo Book, quoted" h={180}>
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
  const rows = ['lto and codegen units: build time for speed', 'strip: debuggability for a smaller binary', 'panic strategy: a capability for less space'];
  return (
    <Svg label="recap: a profile's own real, deliberate trades" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
