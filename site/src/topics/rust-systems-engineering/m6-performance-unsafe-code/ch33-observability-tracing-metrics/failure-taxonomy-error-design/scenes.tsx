import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg, lerp, clamp, easeInOut, easeOutBack } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Draw, Stack, Svg, T, C, Reticle } from '../../../../../reels/kit';

// A real, typed error, matched on its own variant, correctly drives
// two different real retry decisions for a real timeout and a real
// remote error; the identical pair, read only as text, shares a
// substring and cannot tell the two failures apart at all.
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


// ── 1 · Does the typed error drive the right retry call (predict) ──────
export function TypedPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a real, typed error: Timeout or Remote"
        lines={['matches!(err, OpError::Timeout) // retry call', '// correct for both a timeout and a remote error?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: the typed variant routes correctly ───────────────────────
// Two failures arrive at one match. The timeout chip takes the retry branch and loops back round to try again;
// the remote error takes the skip branch and is set aside. Each branch is ticked as its chip arrives.
export function TypedReveal({ t }: StepCtx) {
  const a = easeInOut(seg(t, 0.3, 1.0));
  const loop = easeInOut(seg(t, 1.0, 1.6));
  const b = easeInOut(seg(t, 1.0, 1.7));
  // the loop back: an arc from the end of the retry branch over the top, back down into the match
  const arc = (u: number) => [lerp(340, 88, u), lerp(42, 82, u) - Math.sin(u * Math.PI) * 34] as const;
  const [ax, ay] = loop > 0 ? arc(loop) : ([lerp(80, 340, a), lerp(90, 50, Math.min(1, a * 2))] as const);
  return (
    <Svg label="failure_demo, captured" h={240}>
      <circle cx={80} cy={90} r={8} fill={C.caramel} opacity={ez(t, 0)} />
      <T x={80} y={122} s={13} a="middle" f={C.latte} o={ez(t, 0)}>match</T>
      <path d="M88 90 C 140 90 160 50 220 50 H 360" fill="none" stroke={C.mocha} strokeWidth={2} opacity={ez(t, 0.1)} />
      <path d="M88 90 C 140 90 160 130 220 130 H 360" fill="none" stroke={C.mocha} strokeWidth={2} opacity={ez(t, 0.1)} />
      <rect x={364} y={34} width={110} height={32} rx={6} fill="none" stroke={C.second} strokeWidth={2} opacity={ez(t, 0.2)} />
      <T x={419} y={55} s={13} a="middle" f={C.second} o={ez(t, 0.2)}>retry</T>
      <rect x={364} y={114} width={110} height={32} rx={6} fill="none" stroke={C.latte} strokeWidth={2} opacity={ez(t, 0.2)} />
      <T x={419} y={135} s={13} a="middle" f={C.latte} o={ez(t, 0.2)}>skip</T>
      {a > 0 && <rect x={ax - 9} y={ay - 9} width={18} height={18} rx={3} fill={C.second} />}
      <Draw pts={Array.from({ length: 17 }, (_, i) => arc(i / 16))} t={t} from={1.0} to={1.6} stroke={C.second} w={1.5} dash="4 3" pen={false} />
      {b > 0 && <rect x={lerp(80, 340, b) - 9} y={lerp(90, 130, Math.min(1, b * 2)) - 9} width={18} height={18} rx={3} fill={C.latte} />}
      <path d="M490 48 l5 5 l10 -11" fill="none" stroke={C.focus} strokeWidth={2.5} strokeDasharray={24} strokeDashoffset={24 * (1 - ez(t, 1.6, 0.25))} />
      <path d="M490 128 l5 5 l10 -11" fill="none" stroke={C.focus} strokeWidth={2.5} strokeDasharray={24} strokeDashoffset={24 * (1 - ez(t, 1.8, 0.25))} />
      <Line t={t} at={0.9} y={196} text="timeout, matched on its variant: retry" mf={C.second} />
      <Line t={t} at={1.7} y={230} text="remote error, matched on its variant: skip" />
    </Svg>
  );
}

// ── 3 · Can text alone tell the two failures apart (predict) ───────────
export function UntypedPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the same two errors, read only as text"
        lines={['err.contains("operation failed") // retry call', '// still correct for both failure kinds?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: the text check retries both, wrongly (takeaway) ──────
export function UntypedReveal({ t }: StepCtx) {
  const travelA = easeOut(seg(t, 0.35, 0.65));
  const travelB = easeOut(seg(t, 0.55, 0.85));
  return (
    <Svg label="failure_demo, captured" h={200}>
      <T x={60} y={40} s={12} f={C.latte} o={fa(t, 0.2, 0.3)}>timeout</T>
      <T x={60} y={78} s={12} f={C.latte} o={fa(t, 0.4, 0.3)}>remote error</T>
      <Draw pts={[[110, 36], [230, 100]]} t={t} from={0.3} to={0.65} stroke={C.caramel} w={2} pen />
      <Draw pts={[[110, 74], [230, 100]]} t={t} from={0.5} to={0.85} stroke={C.caramel} w={2} pen />
      <circle cx={110 + travelA * 120} cy={36 + travelA * 64} r={5} fill={C.caramel} opacity={fa(t, 0.3, 0.2)} />
      <circle cx={110 + travelB * 120} cy={74 + travelB * 26} r={5} fill={C.caramel} opacity={fa(t, 0.5, 0.2)} />
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={160} y={78} width={140} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={230} y={105} s={13} a="middle" f={C.mocha}>retry</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>the same words, two different real failures</T>
    </Svg>
  );
}

// ── 5 · Do the two decisions actually disagree (predict) ───────────────
export function DisagreePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the real remote error, decided two ways"
        lines={['typed: OpError::Remote(_) -> skip', '// untyped: same message -> retry. disagree?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: typed skips it, untyped wrongly retries it (takeaway) ─
export function DisagreeReveal({ t }: StepCtx) {
  const toSkip = easeOut(seg(t, 0.35, 0.7));
  const toRetry = easeOut(seg(t, 0.55, 0.9));
  return (
    <Svg label="failure_demo, captured" h={200}>
      <T x={30} y={40} s={12} f={C.latte} o={fa(t, 0.2, 0.3)}>remote error</T>
      <Draw pts={[[90, 50], [90, 100]]} t={t} from={0.25} to={0.7} stroke={C.caramel} w={2} pen />
      <Draw pts={[[90, 50], [280, 100]]} t={t} from={0.45} to={0.9} stroke={C.caramel} w={2} pen />
      <circle cx={90} cy={50 + toSkip * 50} r={5} fill={C.caramel} opacity={fa(t, 0.25, 0.2)} />
      <circle cx={90 + toRetry * 190} cy={50 + toRetry * 50} r={5} fill={C.cherry} opacity={fa(t, 0.45, 0.2)} />
      <g opacity={fa(t, 0.9, 0.3)}>
        <rect x={40} y={100} width={100} height={40} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={90} y={125} s={12} a="middle" f={C.mocha}>typed: skip</T>
        <rect x={230} y={100} width={100} height={40} rx={6} fill="none" stroke={C.cherry} strokeWidth={2} />
        <T x={280} y={125} s={12} a="middle" f={C.cherry}>untyped: retry</T>
      </g>
      <T x={60} y={170} s={13} f={C.latte} o={fa(t, 1.3, 0.4)}>a real, measured disagreement</T>
    </Svg>
  );
}

// ── 7 · thiserror and anyhow, quoted (connecting) ──────────────────────────
// The quote lands; under it, on the left, failures sort themselves into named variants of one enum, each into its
// own slot. On the right, they all drop into one dynamic error, which gathers context tags as it travels on.
export function DocsReveal({ t }: StepCtx) {
  const names = ['Timeout', 'Remote', 'Parse'];
  return (
    <Svg label="thiserror and anyhow's own docs, quoted" h={250}>
      <Quote t={t} lines={['thiserror: a derive macro for the Error trait', 'anyhow: one dynamic error type for apps']} hot={0} y0={40} gap={38} beat={0.45} />
      <T x={40} y={126} s={13} f={C.latte} o={ez(t, 0.7)}>enum</T>
      {names.map((n, i) => {
        const k = easeOutBack(seg(t, 0.9 + i * 0.2, 1.25 + i * 0.2));
        return (
          <g key={n} opacity={clamp(k)} transform={`translate(${((1 - clamp(k)) * -30).toFixed(1)} 0)`}>
            <rect x={40} y={136 + i * 34} width={150} height={26} rx={4} fill="none" stroke={C.caramel} strokeWidth={1.5} />
            <T x={115} y={154 + i * 34} s={13} a="middle" f={C.crema}>{n}</T>
          </g>
        );
      })}
      <rect x={340} y={150} width={140} height={40} rx={6} fill="none" stroke={C.second} strokeWidth={2} opacity={ez(t, 1.5)} />
      <T x={410} y={175} s={13} a="middle" f={C.second} o={ez(t, 1.5)}>anyhow::Error</T>
      {[0, 1].map((i) => {
        const k = easeOutBack(seg(t, 1.9 + i * 0.25, 2.2 + i * 0.25));
        return <rect key={i} x={490 + i * 30} y={lerp(140, 160, clamp(k))} width={24} height={20} rx={10} fill="none" stroke={C.latte} strokeWidth={1.5} opacity={clamp(k)} />;
      })}
      <T x={530} y={210} s={13} a="middle" f={C.latte} o={ez(t, 2.1)}>context</T>
    </Svg>
  );
}

// ── 8 · Recap ──────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  return (
    <RecapList
      t={t}
      label="recap: a shape that tells failures apart"
      rows={['a typed variant drives the correct retry call', 'the same pair, as text, cannot be told apart', 'a real retry loop gets one decision wrong']}
      gap={70}
      y0={60}
    />
  );
}
