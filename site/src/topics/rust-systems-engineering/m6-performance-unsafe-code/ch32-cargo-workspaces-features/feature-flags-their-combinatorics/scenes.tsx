import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg, lerp, easeInOut } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Draw, Stack, Svg, T, C, Reticle, Decode } from '../../../../../reels/kit';

// A feature a sibling crate requests is unified into a shared
// dependency's own single build, for better or worse; staying
// additive is what keeps that unification safe, and the resolver a
// workspace declares decides whether even a dev-only request can
// leak somewhere nobody meant it to go.
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


// ── 1 · Does consumer_b's output change (predict) ────────────────────────
export function NonAdditivePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="consumer_b never asks for fast_mode itself"
        lines={['cargo build -p consumer_a -p consumer_b \\', '  --features consumer_a/fast_mode // consumer_b changes too?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: a sibling flips your output ──────────────────────────────
// consumer_b builds alone against the shared dependency and prints "plain". Then consumer_a joins the build asking
// for fast_mode: the feature chip travels into the shared dependency, and consumer_b's own output re-decodes as
// "fast", though not a line of its source moved.
export function NonAdditiveReveal({ t }: StepCtx) {
  const join = easeInOut(seg(t, 0.9, 1.3));
  const feat = easeInOut(seg(t, 1.3, 1.7));
  const flipped = t >= 1.8;
  return (
    <Svg label="feature_demo/target/debug" h={240}>
      <rect x={220} y={110} width={160} height={36} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} opacity={ez(t, 0)} />
      <T x={300} y={133} s={13} a="middle" f={C.crema} o={ez(t, 0)}>shared dep</T>
      <rect x={390} y={30} width={160} height={36} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} opacity={ez(t, 0)} />
      <T x={470} y={53} s={13} a="middle" f={C.crema} o={ez(t, 0)}>consumer_b</T>
      <line x1={420} y1={66} x2={340} y2={110} stroke={C.mocha} strokeWidth={1.5} opacity={ez(t, 0)} />
      <g transform={`translate(${lerp(-200, 0, join).toFixed(1)} 0)`} opacity={join}>
        <rect x={50} y={30} width={160} height={36} rx={6} fill="none" stroke={C.second} strokeWidth={2} />
        <T x={130} y={53} s={13} a="middle" f={C.second}>consumer_a</T>
        <line x1={180} y1={66} x2={260} y2={110} stroke={C.mocha} strokeWidth={1.5} />
      </g>
      {feat > 0 && <rect x={lerp(180, 290, feat)} y={lerp(70, 92, feat)} width={20} height={20} rx={10} fill={C.second} />}
      <T x={470} y={92} s={13} a="middle" f={C.taupe} o={ez(t, 0.2)}>prints</T>
      <Decode text={flipped ? 'fast' : 'plain'} t={t} at={flipped ? 1.8 : 0.3} dur={0.4} x={530} y={92} s={14} f={flipped ? C.cherryText : C.focus} w={600} />
      <Reticle x={546} y={87} w={60} h={28} t={t} at={2.2} color={C.cherryText} />
      <Line t={t} at={0.4} y={196} text='consumer_b alone: "plain"' />
      <Line t={t} at={1.8} y={230} text='consumer_b with consumer_a/fast_mode: "fast"' mf={C.cherryText} />
    </Svg>
  );
}

// ── 3 · Does the additive feature change it too (predict) ───────────────
export function AdditivePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="now consumer_a requests fancy instead, purely additive"
        lines={['cargo build -p consumer_a -p consumer_b \\', '  --features consumer_a/fancy // consumer_b changes too?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: consumer_b stays untouched (takeaway) ──────────────────
export function AdditiveReveal({ t }: StepCtx) {
  return (
    <Svg label="feature_demo/target/debug" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>consumer_b, checked both ways again</T>
      <T x={70} y={80} s={12} f={C.latte} o={fa(t, 0.4, 0.3)}>consumer_b alone: "plain"</T>
      <circle cx={280} cy={76} r={5} fill={C.caramel} opacity={fa(t, 0.45, 0.2)} />
      <T x={70} y={115} s={12} f={C.latte} o={fa(t, 0.6, 0.3)}>consumer_b with fancy: "plain"</T>
      <circle cx={280} cy={111} r={5} fill={C.caramel} opacity={fa(t, 0.65, 0.2)} />
      <Draw pts={[[280, 86], [280, 101]]} t={t} from={0.8} to={1.0} stroke={C.taupe} w={2} />
      {fa(t, 1.2, 0.4) > 0.85 && <T x={190} y={140} s={13} a="middle" f={C.mocha}>"plain" alone, "plain" together</T>}
      <T x={60} y={170} s={13} f={C.latte} o={fa(t, 1.5, 0.3)}>additive means nothing already there moves</T>
    </Svg>
  );
}

// ── 5 · Does the dev-dependency leak (predict) ───────────────────────────
export function DevDepPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="consumer_b's own dev-dependency requests fast_mode"
        lines={['[dev-dependencies]', 'core_crate = { path = "../core", features = ["fast_mode"] }']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: leaks under the old resolver, not the new (takeaway) ──
export function DevDepReveal({ t }: StepCtx) {
  const leak = easeOut(seg(t, 0.5, 0.8));
  return (
    <Svg label="feature_demo vs feature_demo_legacy" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the identical declaration, two resolvers</T>
      <T x={70} y={80} s={12} f={C.latte} o={fa(t, 0.4, 0.3)}>legacy resolver</T>
      <circle cx={190 + leak * 90} cy={76} r={5} fill={C.cherry} opacity={fa(t, 0.45, 0.2)} />
      <T x={70} y={115} s={12} f={C.latte} o={fa(t, 0.85, 0.3)}>resolver 3</T>
      <circle cx={280} cy={111} r={5} fill="none" stroke={C.caramel} strokeWidth={1.5} opacity={fa(t, 0.9, 0.2)} />
      {fa(t, 1.1, 0.4) > 0.85 && <T x={190} y={150} s={13} a="middle" f={C.mocha}>legacy: "fast" · resolver 3: "plain"</T>}
      <T x={60} y={178} s={13} f={C.latte} o={fa(t, 1.5, 0.3)}>the resolver decides what can leak through</T>
    </Svg>
  );
}

// ── 7 · The Cargo Book, quoted (connecting) ────────────────────────────────
// The quote lands; under it, two requesters each bring their own features for one shared dependency. Both sets
// slide into it and merge into one union, built once. The feature both asked for lands once.
export function DocsReveal({ t }: StepCtx) {
  const m = easeInOut(seg(t, 1.0, 1.6));
  return (
    <Svg label="The Cargo Book, quoted" h={230}>
      <Quote t={t} lines={['features unify to their union, every build', 'a feature should stay additive, always']} hot={1} y0={40} gap={38} beat={0.45} />
      <rect x={250} y={150} width={100} height={50} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} opacity={ez(t, 0.7)} />
      <T x={300} y={218} s={13} a="middle" f={C.latte} o={ez(t, 0.7)}>union</T>
      {[0, 1].map((i) => (
        <rect key={`a${i}`} x={lerp(60 + i * 26, 262 + i * 26, m)} y={lerp(120, 165, m)} width={20} height={20} rx={10} fill={C.second} opacity={ez(t, 0.8)} />
      ))}
      {[288, 314].map((x1, i) => (
        <rect key={`b${i}`} x={lerp(500 + i * 26, x1, m)} y={lerp(120, 165, m)} width={20} height={20} rx={10} fill={i === 0 ? C.second : C.latte} opacity={ez(t, 0.8) * (i === 0 ? 1 - m : 1)} />
      ))}
      <T x={40} y={114} s={13} f={C.latte} o={ez(t, 0.7)}>requester a</T>
      <T x={560} y={114} s={13} a="end" f={C.latte} o={ez(t, 0.7)}>requester b</T>
    </Svg>
  );
}

// ── 8 · Recap ──────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  return (
    <RecapList
      t={t}
      label="recap: a feature's own real combinatorics"
      rows={["a sibling's requested feature reaches you", 'additive is what keeps that reach safe', 'the resolver decides what can leak through']}
      gap={70}
      y0={60}
    />
  );
}
