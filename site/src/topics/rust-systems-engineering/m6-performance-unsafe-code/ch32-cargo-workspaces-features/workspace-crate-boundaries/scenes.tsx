import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg, lerp, clamp, easeInOut, easeOutBack } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Draw, Stack, Svg, T, C, Reticle } from '../../../../../reels/kit';

// A crate, not a module, is the real unit cargo rebuilds; a
// dependency's own real boundary decides what a change forces to
// recompile, and a lint declared once is enforced the identical way
// for every member that inherits it.
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

// ── 2 · Measured: only the consumer rebuilds ───────────────────────────────
// Two crates, the consumer depending on the core. An edit lands on the consumer only. The rebuild sweeps the
// consumer: its old artifact slides out and a fresh one drops in. The core's artifact never moves, locked on.
export function ConsumerOnlyReveal({ t }: StepCtx) {
  const edit = easeOutBack(seg(t, 0.4, 0.7));
  const out = easeInOut(seg(t, 1.0, 1.4));
  const fresh = easeInOut(seg(t, 1.3, 1.8));
  return (
    <Svg label="workspace_demo/target/debug" h={240}>
      <g opacity={ez(t, 0)}>
        <rect x={50} y={30} width={180} height={40} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={140} y={55} s={13} a="middle" f={C.crema}>core_crate</T>
        <rect x={370} y={30} width={180} height={40} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={460} y={55} s={13} a="middle" f={C.crema}>consumer_crate</T>
      </g>
      <Draw pts={[[366, 50], [236, 50]]} t={t} from={0.1} to={0.4} stroke={C.latte} w={2} />
      <circle cx={548} cy={30} r={7 * clamp(edit)} fill={C.cherryText} />
      <rect x={110} y={100} width={60} height={44} rx={4} fill={C.latte} opacity={ez(t, 0.2)} />
      <rect x={430 + out * 120} y={100} width={60} height={44} rx={4} fill={C.latte} opacity={ez(t, 0.2) * (1 - out)} />
      <rect x={430} y={lerp(60, 100, fresh)} width={60} height={44} rx={4} fill={C.second} opacity={fresh} />
      <Reticle x={140} y={122} w={78} h={60} t={t} at={2.0} />
      <Line t={t} at={1.6} y={196} text="core_crate: the identical real artifact" mark="tick" />
      <Line t={t} at={1.1} y={230} text="consumer_crate: a genuinely new artifact" mf={C.second} />
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

// ── 7 · Two sources agree (connecting) ─────────────────────────────────────
// The quote lands; under it, the workspace root holds the shared dependency and lint table once. From it, one line
// per member crate draws down, and a copy of the table drops into each: written once, inherited everywhere.
export function DocsReveal({ t }: StepCtx) {
  const xs = [120, 300, 480];
  return (
    <Svg label="Rust Reference / Cargo Book, quoted" h={240}>
      <Quote t={t} lines={['a crate: a real unit of compilation', 'dependencies and lints, inherited once']} hot={1} y0={40} gap={38} beat={0.45} />
      <rect x={220} y={110} width={160} height={34} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} opacity={ez(t, 0.7)} />
      <T x={300} y={132} s={13} a="middle" f={C.crema} o={ez(t, 0.7)}>workspace root</T>
      {xs.map((x, i) => {
        const a = 1.2 + i * 0.25;
        const k = easeInOut(seg(t, a + 0.25, a + 0.6));
        return (
          <g key={x}>
            <Draw pts={[[300, 144], [x, 186]]} t={t} from={a} to={a + 0.3} stroke={C.mocha} w={1.5} pen={false} />
            <rect x={x - 50} y={190} width={100} height={30} rx={6} fill="none" stroke={C.latte} strokeWidth={1.5} opacity={ez(t, 0.9)} />
            <rect x={lerp(300, x, k) - 8} y={lerp(126, 198, k)} width={16} height={14} rx={2} fill={C.second} opacity={k > 0 ? 1 : 0} />
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
      label="recap: a workspace's own real boundaries"
      rows={['the crate, not the module, is the real unit', 'a dependency edge decides what rebuilds', 'a lint declared once, enforced everywhere']}
      gap={70}
      y0={60}
    />
  );
}
