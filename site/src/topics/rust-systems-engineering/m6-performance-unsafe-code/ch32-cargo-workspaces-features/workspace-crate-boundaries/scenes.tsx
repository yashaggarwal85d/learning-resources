import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

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
  return (
    <Svg label="workspace_demo/target/debug" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>both real artifacts, checked again</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>both genuinely newer than before</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>the dependency edge is the real boundary</T>
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
  return (
    <Svg label="workspace_demo/target/debug" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the real build, checked both ways</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>fails with it, builds clean without it</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>declared once, enforced every time</T>
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
