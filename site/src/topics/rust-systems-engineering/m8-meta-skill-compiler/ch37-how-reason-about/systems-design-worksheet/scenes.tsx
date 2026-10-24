import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

// Leaving a backpressure point implicit does not avoid the decision; it
// genuinely defaults to an unbounded queue, measurably different from a
// real, explicit, bounded one under the identical real overload.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Does the bounded queue stay capped (predict) ────────────────────
export function BoundedPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a stated backpressure point, capacity two"
        lines={['tx.try_send(job) // eight real requests, fast', '// does the queue stay capped at two?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: three admitted, five rejected, queue capped ──────────
export function BoundedReveal({ t }: StepCtx) {
  const rows = ['admitted: three. rejected: five', 'queue length at the checkpoint: two'];
  return (
    <Svg label="worksheet_demo, captured" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 3 · Does leaving it implicit change anything (predict) ─────────────
export function UnboundedPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a second service, no stated backpressure point"
        lines={['mpsc::unbounded_channel() // identical burst', '// does leaving it implicit change anything?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: all eight admitted, queue grows to seven ─────────────
export function UnboundedReveal({ t }: StepCtx) {
  return (
    <Svg label="worksheet_demo, captured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the identical burst, no stated boundary</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>admitted: all eight. rejected: none</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>queue length at the checkpoint: seven</T>
    </Svg>
  );
}

// ── 5 · Which design actually protects the service (predict) ───────────
export function ComparePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="side by side, under the identical burst"
        lines={['bounded: queue stays at two', 'unbounded: queue climbs to seven. which protects it?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: capped at two vs. climbing to seven (takeaway) ───────
export function CompareReveal({ t }: StepCtx) {
  return (
    <Svg label="worksheet_demo, both instances" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the identical burst, two real designs</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>bounded: capped at two. unbounded: at seven</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>a default is still a real decision</T>
    </Svg>
  );
}

// ── 7 · mpsc's own words on both variants (connecting) ──────────────────
export function DocsReveal({ t }: StepCtx) {
  const rows = ['bounded: communicating with backpressure', 'unbounded: communicating without it'];
  return (
    <Svg label="tokio::sync::mpsc, its own docs" h={180}>
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
  const rows = ['a stated boundary sheds load on purpose', 'it still answers, just not one anyone chose', 'the worksheet is checked before the code is'];
  return (
    <Svg label="recap: a question nobody actually answered" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
