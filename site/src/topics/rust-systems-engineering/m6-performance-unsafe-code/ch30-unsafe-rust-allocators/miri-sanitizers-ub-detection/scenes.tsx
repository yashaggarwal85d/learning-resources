import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

// A run-based checker only ever asks about the path it actually takes;
// the identical violation on an unexercised branch sits there, real,
// and goes unasked.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Does the safe branch's own checker find a violation (predict) ───
export function SafeBranchPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="one real interpreter, one real branch, taken"
        lines={['execute(take_safe_branch: true, buffer_len);', '// a real checker, run on this branch only']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: no violation on the safe branch (no takeaway, "from") ──
export function SafeBranchReveal({ t }: StepCtx) {
  const rows = ['three real operations, every one checked', 'none of them genuinely out of bounds'];
  return (
    <Svg label="a_checker_only_catches_paths_it_actually_runs.rs" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 3 · Does the other branch's own run catch it (predict) ──────────────
export function OtherBranchPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the identical interpreter, the other branch, taken"
        lines={['execute(take_safe_branch: false, buffer_len);', '// the real out-of-bounds operation sits here']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: genuinely caught, once this run takes it (takeaway) ───
export function OtherBranchReveal({ t }: StepCtx) {
  return (
    <Svg label="a_checker_only_catches_paths_it_actually_runs.rs" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>two real operations, checked on this run</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>the second one: genuinely out of bounds</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>real and checkable, the moment it is run</T>
    </Svg>
  );
}

// ── 5 · How many of the unexercised branch's ops did it examine (predict) ─
export function UncheckedOpsPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the first run's own count of examined operations"
        lines={['run_on_safe_branch.ops_examined;', '// how many of the OTHER branch’s ops, counted in?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: genuinely none (takeaway) ──────────────────────────────
export function UncheckedOpsReveal({ t }: StepCtx) {
  return (
    <Svg label="a_checker_only_catches_paths_it_actually_runs.rs" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the safe run's own real examined count</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>the other branch's ops: genuinely zero</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>a branch never taken is never even asked</T>
    </Svg>
  );
}

// ── 7 · Both sources' own words on this exact limitation (connecting) ───
export function DocsReveal({ t }: StepCtx) {
  const rows = ['one execution, one real verdict, not every one', 'a sanitizer: a different tool, a different reach'];
  return (
    <Svg label="Miri README / sanitizer Unstable Book, quoted" h={180}>
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
  const rows = ['a real checker, run on the path taken', 'the identical violation, on a path not taken', 'sits there, real, and genuinely unasked'];
  return (
    <Svg label="recap: a checker only asks the path it runs" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
