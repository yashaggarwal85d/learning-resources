import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Draw, Stack, Svg, T, C, Reticle } from '../../../../../reels/kit';

// A run-based checker only ever asks about the path it actually takes;
// the identical violation on an unexercised branch sits there, real,
// and goes unasked.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));
// ── Moves shared by this topic's measured, quoted and recap figures ─────────
/** Eased 0..1 from `a` over `d` seconds. */
const ez = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

/** A caption line that slides in from the left on its beat; its marker draws itself (tick, cross) or grows (dot). */
function Line({ t, at, y, text, mark = 'dot', mf = C.caramel, f = C.crema }: { t: number; at: number; y: number; text: string; mark?: 'dot' | 'tick' | 'cross'; mf?: string; f?: string }) {
  const k = ez(t, at, 0.45);
  const m = ez(t, at + 0.2, 0.35);
  if (k <= 0) return null;
  return (
    <g opacity={k} transform={`translate(${(-28 * (1 - k)).toFixed(2)} 0)`}>
      {mark === 'dot' && <circle cx={30} cy={y - 5} r={5 * m} fill={mf} />}
      {mark === 'tick' && <path d={`M23 ${y - 5} l5 5 l10 -11`} fill="none" stroke={mf} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={24} strokeDashoffset={24 * (1 - m)} />}
      {mark === 'cross' && <path d={`M24 ${y - 11} l12 12 M36 ${y - 11} l-12 12`} fill="none" stroke={mf} strokeWidth={2.5} strokeLinecap="round" strokeDasharray={34} strokeDashoffset={34 * (1 - m)} />}
      <T x={48} y={y} s={13} f={f}>
        {text}
      </T>
    </g>
  );
}

/**
 * A quoted source: the quote panel rises into place, a rule draws down its left edge, each quoted line slides in on
 * its beat, and the line that carries the point gets an underline drawn under it once the quote has landed.
 */
function Quote({ t, lines, y0 = 40, gap = 40, hot, at = 0.25, beat = 0.55 }: { t: number; lines: string[]; y0?: number; gap?: number; hot: number; at?: number; beat?: number }) {
  const k = ez(t, 0, 0.5);
  const top = y0 - 26;
  const bottom = y0 + (lines.length - 1) * gap + 16;
  const u = at + lines.length * beat;
  return (
    <g>
      <rect x={14} y={top + (1 - k) * 14} width={572} height={bottom - top} rx={6} fill={C.roast} opacity={k} />
      <Draw pts={[[26, top + 8], [26, bottom - 8]]} t={t} from={0.15} to={0.15 + beat * lines.length} stroke={C.taupe} w={2} pen={false} />
      {lines.map((l, i) => {
        const s = ez(t, at + i * beat, 0.45);
        return (
          <g key={l} opacity={s} transform={`translate(${(-22 * (1 - s)).toFixed(2)} 0)`}>
            <T x={42} y={y0 + i * gap} s={14} f={i === hot ? C.focus : C.crema} serif italic>
              {l}
            </T>
          </g>
        );
      })}
      <Draw pts={[[42, y0 + hot * gap + 8], [42 + Math.min(520, lines[hot].length * 7.2), y0 + hot * gap + 8]]} t={t} from={u} to={u + 0.5} stroke={C.focus} w={1.5} />
    </g>
  );
}

/**
 * The recap as a payoff: a spine draws down the left, each point's tick is drawn as the spine reaches it and the
 * point slides in beside it, and the last point, the one the topic stands on, is locked on once it lands.
 */
function RecapList({ t, rows, label, y0 = 50, gap = 58, h = 300 }: { t: number; rows: string[]; label: string; y0?: number; gap?: number; h?: number }) {
  const beat = 2.2 / rows.length;
  const at = (i: number) => 0.2 + i * beat;
  const last = rows.length - 1;
  return (
    <Svg label={label} h={h}>
      <Draw pts={[[30, y0 - 5], [30, y0 - 5 + last * gap]]} t={t} from={at(0)} to={at(last)} stroke={C.mocha} w={2} pen={false} />
      {rows.map((r, i) => {
        const k = ez(t, at(i), 0.45);
        const m = ez(t, at(i) + 0.1, 0.35);
        const y = y0 + i * gap;
        const f = i === last ? C.focus : C.caramel;
        return (
          <g key={r}>
            <circle cx={30} cy={y - 5} r={11 * m} fill={C.espresso} stroke={f} strokeWidth={1.5} opacity={m} />
            <path d={`M24 ${y - 5} l4 4 l8 -9`} fill="none" stroke={f} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={20} strokeDashoffset={20 * (1 - m)} />
            <g opacity={k} transform={`translate(${(-24 * (1 - k)).toFixed(2)} 0)`}>
              <T x={52} y={y} s={13} f={i === last ? C.focus : C.crema} w={i === last ? 600 : 500}>
                {r}
              </T>
            </g>
          </g>
        );
      })}
      <Reticle x={300} y={y0 + last * gap - 5} w={576} h={38} t={t} at={at(last) + 0.45} />
    </Svg>
  );
}


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

// ── 2 · Measured: the taken branch is clean ────────────────────────────────
// The program forks. The checker's pen runs down the branch that is actually taken, through its three operations,
// ticking each one in bounds as it passes. The other branch stays dashed and dim, never visited.
export function SafeBranchReveal({ t }: StepCtx) {
  const ops = [210, 320, 430];
  return (
    <Svg label="a_checker_only_catches_paths_it_actually_runs.rs" h={240}>
      <circle cx={60} cy={90} r={8} fill={C.caramel} opacity={ez(t, 0)} />
      <T x={60} y={124} s={13} a="middle" f={C.latte} o={ez(t, 0)}>branch</T>
      <path d="M68 90 C 110 90 120 140 160 140 H 540" fill="none" stroke={C.mocha} strokeWidth={2} strokeDasharray="5 5" opacity={ez(t, 0.1)} />
      <T x={540} y={164} s={13} a="end" f={C.taupe} o={ez(t, 0.2)}>not taken</T>
      <Draw pts={[[68, 90], [100, 80], [140, 50], [160, 50], [540, 50]]} t={t} from={0.3} to={1.9} stroke={C.second} w={2.5} />
      {ops.map((x, i) => {
        const at = 0.3 + ((x - 68) / 472) * 1.6;
        return (
          <g key={x}>
            <rect x={x - 26} y={36} width={52} height={28} rx={4} fill={C.espresso} stroke={C.latte} strokeWidth={1.5} opacity={ez(t, 0.1 + i * 0.05)} />
            <path d={`M${x - 8} 50 l5 5 l10 -11`} fill="none" stroke={C.focus} strokeWidth={2.5} strokeDasharray={24} strokeDashoffset={24 * (1 - ez(t, at, 0.25))} />
          </g>
        );
      })}
      <Line t={t} at={1.0} y={200} text="three real operations, every one checked" mark="tick" />
      <Line t={t} at={1.9} y={232} text="none of them genuinely out of bounds" />
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

// ── 7 · Two sources agree (connecting) ─────────────────────────────────────
// The quote lands; under it, a program's possible executions fan out as a tree. One run lights up one path to its
// leaf, where the verdict lands; every other path stays dashed, with no verdict at all.
export function DocsReveal({ t }: StepCtx) {
  const leaves = [120, 150, 180, 210];
  return (
    <Svg label="Miri README / sanitizer Unstable Book, quoted" h={240}>
      <Quote t={t} lines={['one execution, one real verdict, not every one', 'a sanitizer: a different tool, a different reach']} hot={0} y0={40} gap={38} beat={0.45} />
      {leaves.map((y, i) => (
        <path key={y} d={`M80 165 C 200 165 220 ${y} 380 ${y}`} fill="none" stroke={C.mocha} strokeWidth={1.5} strokeDasharray="4 4" opacity={ez(t, 0.7 + i * 0.08)} />
      ))}
      <circle cx={80} cy={165} r={6} fill={C.caramel} opacity={ez(t, 0.7)} />
      <Draw pts={Array.from({ length: 21 }, (_, i) => {
        const u = i / 20;
        const x = 80 * (1 - u) ** 3 + 3 * 200 * u * (1 - u) ** 2 + 3 * 220 * u * u * (1 - u) + 380 * u ** 3;
        const y = 165 * (1 - u) ** 3 + 3 * 165 * u * (1 - u) ** 2 + 3 * 150 * u * u * (1 - u) + 150 * u ** 3;
        return [x, y] as const;
      })} t={t} from={1.2} to={2.0} stroke={C.second} w={2.5} />
      <path d="M392 150 l5 5 l10 -11" fill="none" stroke={C.focus} strokeWidth={2.5} strokeDasharray={24} strokeDashoffset={24 * (1 - ez(t, 2.0, 0.3))} />
      <T x={420} y={155} s={13} f={C.focus} o={ez(t, 2.0)}>this run only</T>
      {[120, 180, 210].map((y) => (
        <T key={y} x={392} y={y + 5} s={13} f={C.taupe} o={ez(t, 2.2)}>?</T>
      ))}
    </Svg>
  );
}

// ── 8 · Recap ──────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  return (
    <RecapList
      t={t}
      label="recap: a checker only asks the path it runs"
      rows={['a real checker, run on the path taken', 'the identical violation, on a path not taken', 'sits there, real, and genuinely unasked']}
      gap={70}
      y0={60}
    />
  );
}
