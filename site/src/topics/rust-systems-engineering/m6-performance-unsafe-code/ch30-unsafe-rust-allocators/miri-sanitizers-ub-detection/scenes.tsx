import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Draw, Stack, Svg, T, C } from '../../../../../reels/kit';

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
  const travel = easeOut(seg(t, 0.4, 0.7));
  return (
    <Svg label="a_checker_only_catches_paths_it_actually_runs.rs" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>two real operations, checked on this run</T>
      <Draw pts={[[70, 78], [280, 78]]} t={t} from={0.4} to={0.7} stroke={C.caramel} w={2} pen />
      <circle cx={70 + travel * 210} cy={78} r={5} fill={C.caramel} opacity={fa(t, 0.4, 0.2)} />
      <circle cx={280} cy={78} r={6} fill={C.cherry} opacity={fa(t, 0.8, 0.2)} />
      {fa(t, 1.1, 0.4) > 0.85 && <T x={190} y={120} s={13} a="middle" f={C.mocha}>the second one: genuinely out of bounds</T>}
      <T x={60} y={155} s={13} f={C.latte} o={fa(t, 1.5, 0.3)}>real and checkable, the moment it is run</T>
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
  const examined = easeOut(seg(t, 0.4, 0.75));
  return (
    <Svg label="a_checker_only_catches_paths_it_actually_runs.rs" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the safe run's own real examined count</T>
      <T x={60} y={75} s={12} f={C.latte} o={fa(t, 0.35, 0.3)}>safe branch: examined</T>
      <rect x={60} y={82} width={examined * 180} height={16} rx={3} fill={C.caramel} />
      <T x={60} y={112} s={12} f={C.latte} o={fa(t, 0.8, 0.3)}>other branch: examined</T>
      <circle cx={70} cy={122} r={4} fill="none" stroke={C.cherry} strokeWidth={1.5} opacity={fa(t, 0.8, 0.2)} />
      {fa(t, 1.2, 0.4) > 0.85 && <T x={190} y={155} s={13} a="middle" f={C.mocha}>the other branch's ops: genuinely zero</T>}
      <T x={60} y={180} s={13} f={C.latte} o={fa(t, 1.6, 0.3)}>a branch never taken is never even asked</T>
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
