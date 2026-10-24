import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

// A bounded pipeline that moves each batch forward keeps its own
// memory capped under a slow sink; an unbounded, cloning pipeline
// does not, however identically slow that sink stays underneath it.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Does bounded memory keep growing (predict) ──────────────────────
export function BoundedPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a bounded pipeline, moved batches, slow sink"
        lines={['channel capacity: 4 batches, moved forward', '// does memory keep growing ahead of the sink?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: bounded memory stays capped ───────────────────────────
export function BoundedReveal({ t }: StepCtx) {
  return (
    <Svg label="pipeline_demo, captured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>fifty batches, a slow sink underneath</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>peak held: 6,000 bytes</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>a few batches' worth, the whole run</T>
    </Svg>
  );
}

// ── 3 · Does unbounded memory stay close (predict) ──────────────────────
export function UnboundedPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="an unbounded pipeline, cloned batches"
        lines={['channel capacity: none, each batch cloned', '// does peak memory stay close to bounded?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: unbounded memory grows toward the full run ───────────
export function UnboundedReveal({ t }: StepCtx) {
  return (
    <Svg label="pipeline_demo, captured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the identical producer, the identical sink</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>peak held: 51,000 bytes</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>almost the entire run's own bytes</T>
    </Svg>
  );
}

// ── 5 · Is the gap small or structural (predict) ────────────────────────
export function ComparePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="6,000 bytes against 51,000 bytes"
        lines={['the identical fifty batches, either way', '// incidental, or a structural gap?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: the gap holds, over eight times larger ───────────────
export function CompareReveal({ t }: StepCtx) {
  const rows = ['bounded peak: 6,000 bytes', 'unbounded peak: 51,000 bytes'];
  return (
    <Svg label="pipeline_demo, captured" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 7 · tokio's own words on backpressure ───────────────────────────────
export function DocsReveal({ t }: StepCtx) {
  const rows = ['bounded, full: rejected until capacity frees', 'unbounded: a send always completes at once'];
  return (
    <Svg label="tokio::sync::mpsc, its own words" h={180}>
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
  const rows = ['moved batches, a channel that can say no', 'cloned batches, a channel that never does', 'the identical sink, a structural gap'];
  return (
    <Svg label="recap: a limit that is actually enforced" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
