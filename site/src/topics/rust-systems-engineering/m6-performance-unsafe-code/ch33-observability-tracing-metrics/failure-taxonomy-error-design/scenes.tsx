import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Draw, Stack, Svg, T, C } from '../../../../../reels/kit';

// A real, typed error, matched on its own variant, correctly drives
// two different real retry decisions for a real timeout and a real
// remote error; the identical pair, read only as text, shares a
// substring and cannot tell the two failures apart at all.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

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

// ── 2 · Measured: the typed match gets both decisions right ────────────
export function TypedReveal({ t }: StepCtx) {
  const rows = ['timeout, matched on its variant: retry', 'remote error, matched on its variant: skip'];
  return (
    <Svg label="failure_demo, captured" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
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

// ── 7 · thiserror and anyhow's own words (connecting) ───────────────────
export function DocsReveal({ t }: StepCtx) {
  const rows = ['thiserror: a derive macro for the Error trait', 'anyhow: one dynamic error type for apps'];
  return (
    <Svg label="thiserror and anyhow's own docs, quoted" h={180}>
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
  const rows = ['a typed variant drives the correct retry call', 'the same pair, as text, cannot be told apart', 'a real retry loop gets one decision wrong'];
  return (
    <Svg label="recap: a shape that tells failures apart" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
