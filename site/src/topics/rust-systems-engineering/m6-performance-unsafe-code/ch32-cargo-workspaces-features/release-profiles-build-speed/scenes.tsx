import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C, Draw, Reticle, Bar } from '../../../../../reels/kit';

// codegen-units and lto trade build time for runtime optimization;
// strip trades debuggability for a smaller shipped binary; panic
// strategy trades a real safety capability for a smaller one still;
// a release profile is a set of real, deliberate trades, not a
// single "faster" switch.
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

// ── 2 · Measured: whole-program optimization costs build time ─────────────
// Two builds race on one clock. The default profile's bar stops first; the fat-LTO, single-unit build keeps going
// well past it, and its finish is locked on: genuinely slower to build.
export function LtoReveal({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.3, 1.0));
  const b = easeOut(seg(t, 0.3, 2.0));
  return (
    <Svg label="profile_demo, timed both ways" h={230}>
      <T x={40} y={36} s={13} f={C.latte} o={ez(t, 0)}>default</T>
      <Bar x={40} y={46} w={220 * a} h={18} full={520} fill={C.latte} o={ez(t, 0)} />
      <T x={40} y={98} s={13} f={C.cherryText} o={ez(t, 0)}>fat LTO</T>
      <Bar x={40} y={108} w={480 * b} h={18} full={520} fill={C.cherryText} o={ez(t, 0)} />
      <line x1={40 + 220 * a} y1={40} x2={40 + 220 * a} y2={134} stroke={C.focus} strokeWidth={1.5} strokeDasharray="3 3" opacity={a >= 1 ? 1 : 0} />
      <Reticle x={520} y={117} w={30} h={34} t={t} at={2.0} color={C.cherryText} />
      <Line t={t} at={0.9} y={182} text="default profile: the real build, timed" />
      <Line t={t} at={1.9} y={216} text="codegen-units 1, fat LTO: genuinely slower" mf={C.cherryText} />
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

// ── 7 · The Cargo Book, quoted (connecting) ────────────────────────────────
// The quote lands; under it, the same crate is built two ways. As one unit, one long bar runs alone. Split into
// many units, several short bars run side by side and finish far sooner, the trade the book names.
export function DocsReveal({ t }: StepCtx) {
  const one = easeOut(seg(t, 1.0, 2.4));
  const many = easeOut(seg(t, 1.0, 1.6));
  return (
    <Svg label="The Cargo Book, quoted" h={250}>
      <Quote t={t} lines={['better code, at the cost of link time', 'more units, parallel, possibly slower code']} hot={1} y0={40} gap={38} beat={0.45} />
      <T x={40} y={124} s={13} f={C.latte} o={ez(t, 0.8)}>one unit</T>
      <rect x={150} y={112} width={Math.max(2, 400 * one)} height={14} rx={3} fill={C.caramel} opacity={ez(t, 0.8)} />
      <T x={40} y={180} s={13} f={C.latte} o={ez(t, 0.8)}>many units</T>
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={150} y={150 + i * 18} width={Math.max(2, 110 * many)} height={12} rx={3} fill={C.second} opacity={ez(t, 0.8 + i * 0.05)} />
      ))}
      <T x={280} y={190} s={13} f={C.second} o={ez(t, 1.7)}>done sooner</T>
    </Svg>
  );
}

// ── 8 · Recap ──────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  return (
    <RecapList
      t={t}
      label="recap: a profile's own real, deliberate trades"
      rows={['lto and codegen units: build time for speed', 'strip: debuggability for a smaller binary', 'panic strategy: a capability for less space']}
      gap={70}
      y0={60}
    />
  );
}
