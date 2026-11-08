import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg, lerp, clamp, easeInOut, easeOutBack } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Draw, Stack, Svg, T, C, Reticle } from '../../../../../reels/kit';

// A format check catches what a human eye would call messy; a denied
// lint catches a known, named mistake the instant it appears; a test
// catches a real behavior regression neither one can see; none of the
// three substitutes for either of the other two.
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


// ── 1 · Does fmt --check catch it (predict) ──────────────────────────────
export function FmtPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="one line, indented four extra spaces"
        lines={['// core/src/lib.rs, cargo build compiles it fine', 'cargo fmt --check // does this genuinely fail?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: build passes, format check flips ──────────────────────────
// A source file whose middle line is knocked out of indentation. Both gates check it: build ticks, the format check
// is struck out. The line then slides back into place, build ticks again and the format check now ticks too.
export function FmtReveal({ t }: StepCtx) {
  const back = easeInOut(seg(t, 1.3, 1.7));
  const gate = (x: number, label: string, ok: boolean, at: number) => (
    <g>
      <rect x={x} y={30} width={170} height={36} rx={6} fill="none" stroke={C.latte} strokeWidth={1.5} opacity={ez(t, 0.1)} />
      <T x={x + 12} y={53} s={13} f={C.crema} o={ez(t, 0.1)}>{label}</T>
      {ok ? (
        <path d={`M${x + 140} 48 l5 5 l10 -11`} fill="none" stroke={C.focus} strokeWidth={2.5} strokeDasharray={24} strokeDashoffset={24 * (1 - ez(t, at, 0.25))} />
      ) : (
        <path d={`M${x + 140} 41 l12 12 m0 -12 l-12 12`} stroke={C.cherryText} strokeWidth={2.5} strokeDasharray={34} strokeDashoffset={34 * (1 - ez(t, at, 0.25))} />
      )}
    </g>
  );
  const fixed = t >= 1.7;
  return (
    <Svg label="ci_demo, checked both ways" h={240}>
      <rect x={40} y={88} width={200} height={76} rx={6} fill={C.roast} opacity={ez(t, 0)} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={i === 1 ? lerp(92, 66, back) : 54} y={100 + i * 20} width={i === 1 ? 110 : 140} height={8} rx={2} fill={i === 1 && !fixed ? C.cherryText : C.latte} opacity={ez(t, 0.05 + i * 0.05)} />
      ))}
      {gate(300, 'cargo build', true, fixed ? 1.8 : 0.5)}
      <g transform="translate(0 50)">{fixed ? gate(300, 'fmt --check', true, 1.9) : gate(300, 'fmt --check', false, 0.7)}</g>
      <Line t={t} at={0.6} y={196} text="cargo build: genuinely clean, both versions" mark="tick" />
      <Line t={t} at={1.8} y={230} text="cargo fmt --check: fails, then passes again" />
    </Svg>
  );
}

// ── 3 · Does the denied lint catch it (predict) ──────────────────────────
export function ClippyPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a real needless_return, denied by the workspace"
        lines={['return format!("Hello, {name}!"); // denied', 'cargo clippy --workspace // does this fail?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: clippy genuinely fails, names the lint (takeaway) ─────
export function ClippyReveal({ t }: StepCtx) {
  const bounce = easeOut(seg(t, 0.5, 0.8));
  const dy = (1 - Math.abs(bounce - 0.5) * 2) * 12;
  const fixed = easeOut(seg(t, 0.95, 1.2));
  return (
    <Svg label="ci_demo/core, checked both ways" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>cargo clippy, the real violation and its fix</T>
      <circle cx={100} cy={78 - dy} r={5} fill={C.cherry} opacity={fa(t, 0.4, 0.2) * (1 - fixed)} />
      <T x={115} y={82} s={12} f={C.latte} o={fa(t, 0.4, 0.3)}>needless_return: denied</T>
      <Draw pts={[[100, 95], [100, 115]]} t={t} from={0.95} to={1.1} stroke={C.caramel} w={2} pen />
      <circle cx={100} cy={115} r={5} fill={C.caramel} opacity={fa(t, 1.0, 0.2) * fixed} />
      <T x={115} y={119} s={12} f={C.latte} o={fa(t, 1.0, 0.3)}>fixed: builds clean</T>
      {fa(t, 1.3, 0.4) > 0.85 && <T x={190} y={150} s={13} a="middle" f={C.mocha}>fails and names it, then builds clean</T>}
      <T x={60} y={178} s={13} f={C.latte} o={fa(t, 1.6, 0.3)}>denied once, caught every real time</T>
    </Svg>
  );
}

// ── 5 · Which gate catches the logic regression (predict) ───────────────
export function TestPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the same return type, now always wrong"
        lines={['fn is_valid_feature_name(_n: &str) -> bool {', '    true // compiles fine; still correct? }']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: build stays green, test catches it (takeaway) ─────────
export function TestReveal({ t }: StepCtx) {
  const travel = easeOut(seg(t, 0.4, 0.7));
  return (
    <Svg label="ci_demo/core, checked both ways" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>cargo build versus cargo test, the regression</T>
      <T x={70} y={80} s={12} f={C.latte} o={fa(t, 0.35, 0.3)}>cargo build</T>
      <circle cx={190 + travel * 90} cy={76} r={5} fill={C.caramel} opacity={fa(t, 0.4, 0.2)} />
      <T x={70} y={115} s={12} f={C.latte} o={fa(t, 0.75, 0.3)}>cargo test</T>
      <circle cx={260} cy={111} r={5} fill="none" stroke={C.cherry} strokeWidth={1.5} opacity={fa(t, 0.8, 0.2)} />
      {fa(t, 1.1, 0.4) > 0.85 && <T x={190} y={150} s={13} a="middle" f={C.mocha}>build: clean · test: genuinely fails</T>}
      <T x={60} y={178} s={13} f={C.latte} o={fa(t, 1.5, 0.3)}>only the test checks what it actually does</T>
    </Svg>
  );
}

// ── 7 · The Cargo Book, quoted (connecting) ────────────────────────────────
// The quote lands; under it, one lints table written once draws a line into every crate. Then the three kinds of
// test land beside it, one per beat: unit, integration, documentation.
export function DocsReveal({ t }: StepCtx) {
  const kinds = ['unit', 'integration', 'doc'];
  return (
    <Svg label="The Cargo Book, quoted" h={230}>
      <Quote t={t} lines={['a lint level, overridden once in one table', 'unit, integration, and documentation tests']} hot={0} y0={40} gap={38} beat={0.45} />
      <rect x={30} y={120} width={120} height={34} rx={6} fill="none" stroke={C.second} strokeWidth={2} opacity={ez(t, 0.7)} />
      <T x={90} y={142} s={13} a="middle" f={C.second} o={ez(t, 0.7)}>[lints]</T>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Draw pts={[[150, 137], [200, 118 + i * 34]]} t={t} from={0.9 + i * 0.1} to={1.2 + i * 0.1} stroke={C.mocha} w={1.5} pen={false} />
          <rect x={204} y={106 + i * 34} width={60} height={24} rx={4} fill="none" stroke={C.latte} strokeWidth={1.5} opacity={ez(t, 1.1 + i * 0.1)} />
        </g>
      ))}
      {kinds.map((k, i) => {
        const s = easeOutBack(seg(t, 1.6 + i * 0.25, 1.95 + i * 0.25));
        return (
          <g key={k} opacity={clamp(s)} transform={`translate(${((1 - clamp(s)) * 30).toFixed(1)} 0)`}>
            <rect x={330} y={106 + i * 34} width={140} height={24} rx={12} fill="none" stroke={C.caramel} strokeWidth={1.5} />
            <T x={400} y={123 + i * 34} s={13} a="middle" f={C.crema}>{k}</T>
          </g>
        );
      })}
    </Svg>
  );
}

// ── 8 · Recap ──────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  return (
    <RecapList
      t={t}
      label="recap: three real, different gates"
      rows={['a format check catches what looks messy', 'a denied lint catches a known mistake', 'a test catches what only behavior reveals']}
      gap={70}
      y0={60}
    />
  );
}
