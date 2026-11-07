import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Draw, Stack, Svg, T, C } from '../../../../../reels/kit';

// A recorded hypothesis is what a real result is checked against; the
// identical real measurement, without it, is just a number with nothing
// to confirm or contradict.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Is the hypothesis specific enough to be wrong (predict) ────────
export function HypothesisPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="written down before any code changes"
        lines={['hypothesis: replying only after storage finishes', '// adds roughly the worker\'s own delay. specific enough?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: reply-on-queue latency, a fraction of a millisecond ──
export function HypothesisReveal({ t }: StepCtx) {
  const rows = ['five requests, replying as each is queued', 'mean latency: a fraction of a millisecond'];
  return (
    <Svg label="evidence_demo, captured" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 3 · Does the change move latency the way predicted (predict) ───────
export function ChangePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the one real change: wait for the worker's own signal"
        lines={['done_rx.await // before replying, not after', '// does latency move the way the hypothesis said?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: latency jumps to near the worker's own delay ─────────
export function ChangeReveal({ t }: StepCtx) {
  const before = easeOut(seg(t, 0.2, 0.45));
  const after = easeOut(seg(t, 0.45, 0.8));
  return (
    <Svg label="evidence_demo, captured" h={210}>
      <T x={30} y={25} s={11} f={C.latte} o={fa(t, 0.05, 0.2)}>the identical workload, the one change made</T>
      <Draw pts={[[90, 120], [250, 120]]} t={t} from={0.1} to={0.2} stroke={C.latte} w={1.5} />
      <T x={255} y={123} s={10} f={C.latte}>worker's own delay</T>
      <rect x={60} y={120 - before * 14} width={40} height={before * 14} fill={C.caramel} opacity={fa(t, 0.2, 0.2)} />
      <T x={80} y={140} s={10} a="middle" f={C.latte}>reply-on-queue</T>
      <rect x={160} y={120 - after * 95} width={40} height={after * 95} fill={C.caramel} opacity={fa(t, 0.45, 0.2)} />
      <T x={180} y={140} s={10} a="middle" f={C.latte}>reply-on-persist</T>
      <g opacity={fa(t, 0.95, 0.3)}>
        <rect x={60} y={155} width={300} height={34} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={177} s={12} a="middle" f={C.mocha}>mean latency now near the worker's own delay</T>
      </g>
      <T x={60} y={200} s={12} f={C.latte} o={fa(t, 1.5, 0.3)}>a real number, checked against a real guess</T>
    </Svg>
  );
}

// ── 5 · Does the match hold, or is it a coincidence (predict) ──────────
export function ComparePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the hypothesis, beside the measured result"
        lines={['predicted: roughly the worker\'s own delay', '// measured: does it actually match, or just happen to?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: the match holds, confirming the hypothesis ───────────
export function CompareReveal({ t }: StepCtx) {
  const predicted = easeOut(seg(t, 0.2, 0.5));
  const measured = easeOut(seg(t, 0.45, 0.75));
  return (
    <Svg label="evidence_demo, both runs" h={210}>
      <T x={30} y={25} s={11} f={C.latte} o={fa(t, 0.05, 0.2)}>what was predicted, beside what was measured</T>
      <rect x={60} y={120 - predicted * 90} width={40} height={predicted * 90} fill="none" stroke={C.caramel} strokeWidth={2} opacity={fa(t, 0.2, 0.2)} />
      <T x={80} y={140} s={10} a="middle" f={C.latte}>predicted</T>
      <rect x={160} y={120 - measured * 92} width={40} height={measured * 92} fill={C.caramel} opacity={fa(t, 0.45, 0.2)} />
      <T x={180} y={140} s={10} a="middle" f={C.latte}>measured</T>
      <Draw pts={[[100, 32], [160, 32]]} t={t} from={0.75} to={0.9} stroke={C.caramel} w={2} pen />
      <g opacity={fa(t, 0.95, 0.3)}>
        <rect x={60} y={155} width={300} height={34} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={177} s={12} a="middle" f={C.mocha}>the added wait matches the worker's own delay</T>
      </g>
      <T x={60} y={200} s={12} f={C.latte} o={fa(t, 1.5, 0.3)}>a real result, checked against a real guess</T>
    </Svg>
  );
}

// ── 7 · The SRE book's own words on the method (connecting) ────────────
export function DocsReveal({ t }: StepCtx) {
  const rows = ['hypothesize potential causes, then test them', 'compare the real state against the theory'];
  return (
    <Svg label="Effective Troubleshooting, its own words" h={180}>
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
  const rows = ['a hypothesis, written down before the change', 'a real result, measured after it', 'checked against each other, not just felt'];
  return (
    <Svg label="recap: writing down the guess before checking it" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
