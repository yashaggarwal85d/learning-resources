import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

// Whether a real dependency version is actually vulnerable is a real,
// published, continuously updated fact, not something a project can
// determine by guessing or by how recently it was last updated.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Does a real lookup catch an unconfigured dependency (predict) ──
export function LookupPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a real, pinned dependency, no special config"
        lines={['cargo audit // looks up every pinned version', '// does it catch one nobody told it to look for?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: the real advisory is reported by its own real id ─────
export function LookupReveal({ t }: StepCtx) {
  const rows = ['the pinned version: a real, known advisory', 'reported by its own real id, unconfigured'];
  return (
    <Svg label="cargo audit, captured" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 3 · Does the next real release still get flagged (predict) ────────
export function PatchPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the very next real release, one version later"
        lines={['smallvec = "=1.6.1" // the advisory calls fixed', '// does the identical lookup still flag it?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: the patched version reports clean ─────────────────────
export function PatchReveal({ t }: StepCtx) {
  return (
    <Svg label="cargo audit, captured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the identical lookup, one version later</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>a real, clean result, nothing flagged</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>the lookup tracks a version, not a reputation</T>
    </Svg>
  );
}

// ── 5 · Does the database tell versions apart (predict) ────────────────
export function ComparePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the identical crate, two real pinned versions"
        lines={['one flagged, one clean, side by side', '// does the database tell them apart, or just the crate?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: only the real vulnerable version is caught ───────────
export function CompareReveal({ t }: StepCtx) {
  return (
    <Svg label="cargo audit, both lockfiles" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>one crate, two real pinned versions</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>flagged: the real one. clean: the other</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>a published fact, not a guess</T>
    </Svg>
  );
}

// ── 7 · RustSec's own words on the database and the tool (connecting) ─
export function DocsReveal({ t }: StepCtx) {
  const rows = ['a vulnerability database for the ecosystem', 'cargo-audit: checks a lockfile against it'];
  return (
    <Svg label="RustSec, its own words" h={180}>
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
  const rows = ['the same crate, one version apart', 'a genuinely different real answer', 'trust that is checked, not just assumed'];
  return (
    <Svg label="recap: asking a published list instead of guessing" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
