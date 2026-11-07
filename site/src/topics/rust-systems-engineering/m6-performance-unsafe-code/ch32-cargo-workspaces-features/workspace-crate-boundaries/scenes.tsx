import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Draw, Stack, Svg, T, C } from '../../../../../reels/kit';

// A crate, not a module, is the real unit cargo rebuilds; a
// dependency's own real boundary decides what a change forces to
// recompile, and a lint declared once is enforced the identical way
// for every member that inherits it.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Does core_crate rebuild too (predict) ────────────────────────────
export function ConsumerOnlyPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="only consumer_crate's own source changes"
        lines={['// consumer/src/lib.rs edited', 'cargo build; // does core_crate rebuild too?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: only consumer rebuilds (no takeaway, "from") ──────────
export function ConsumerOnlyReveal({ t }: StepCtx) {
  const rows = ['core_crate: the identical real artifact', 'consumer_crate: a genuinely new artifact'];
  return (
    <Svg label="workspace_demo/target/debug" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 3 · Does consumer have to rebuild too (predict) ──────────────────────
export function CoreChangePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="now core_crate's own source changes instead"
        lines={['// core/src/lib.rs edited', 'cargo build; // does consumer_crate rebuild too?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: both rebuild (takeaway) ────────────────────────────────
export function CoreChangeReveal({ t }: StepCtx) {
  const ripple = easeOut(seg(t, 0.5, 0.85));
  return (
    <Svg label="workspace_demo/target/debug" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>both real artifacts, checked again</T>
      <circle cx={100} cy={80} r={6} fill={C.cherry} opacity={fa(t, 0.4, 0.2)} />
      <T x={115} y={84} s={12} f={C.latte} o={fa(t, 0.4, 0.3)}>core_crate: edited</T>
      <Draw pts={[[100, 95], [100, 125]]} t={t} from={0.5} to={0.8} stroke={C.caramel} w={2} pen />
      <circle cx={100} cy={125} r={6} fill={C.caramel} opacity={fa(t, 0.5, 0.2) * ripple} />
      <T x={115} y={129} s={12} f={C.latte} o={fa(t, 0.5, 0.3)}>consumer_crate: rebuilds too</T>
      {fa(t, 1.1, 0.4) > 0.85 && <T x={190} y={160} s={13} a="middle" f={C.mocha}>both genuinely newer than before</T>}
      <T x={60} y={185} s={13} f={C.latte} o={fa(t, 1.5, 0.3)}>the dependency edge is the real boundary</T>
    </Svg>
  );
}

// ── 5 · Does the inherited lint catch it (predict) ───────────────────────
export function LintEnforcedPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a real unsafe block, added to consumer_crate"
        lines={['unsafe { *p } // forbidden by workspace.lints', 'cargo build; // does this genuinely fail?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: the build genuinely fails, then passes (takeaway) ─────
export function LintEnforcedReveal({ t }: StepCtx) {
  const bounce = easeOut(seg(t, 0.5, 0.8));
  const dy = (1 - Math.abs(bounce - 0.5) * 2) * 12;
  return (
    <Svg label="workspace_demo/target/debug" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the real build, checked both ways</T>
      <T x={70} y={80} s={12} f={C.latte} o={fa(t, 0.4, 0.3)}>with unsafe block</T>
      <circle cx={260} cy={76 - dy} r={5} fill={C.cherry} opacity={fa(t, 0.45, 0.2)} />
      <T x={70} y={120} s={12} f={C.latte} o={fa(t, 0.85, 0.3)}>without it</T>
      <circle cx={260} cy={116} r={5} fill={C.caramel} opacity={fa(t, 0.9, 0.2)} />
      {fa(t, 1.1, 0.4) > 0.85 && <T x={190} y={150} s={13} a="middle" f={C.mocha}>fails with it, builds clean without it</T>}
      <T x={60} y={178} s={13} f={C.latte} o={fa(t, 1.5, 0.3)}>declared once, enforced every time</T>
    </Svg>
  );
}

// ── 7 · Both sources' own words on these exact rules (connecting) ───────
export function DocsReveal({ t }: StepCtx) {
  const rows = ['a crate: a real unit of compilation', 'dependencies and lints, inherited once'];
  return (
    <Svg label="Rust Reference / Cargo Book, quoted" h={180}>
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
  const rows = ['the crate, not the module, is the real unit', 'a dependency edge decides what rebuilds', 'a lint declared once, enforced everywhere'];
  return (
    <Svg label="recap: a workspace's own real boundaries" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
