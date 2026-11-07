import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Draw, Stack, Svg, T, C } from '../../../../../reels/kit';

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
  const ids = [0, 1, 2, 3, 4, 5, 6, 7];
  const grow = easeOut(seg(t, 0.9, 1.15));
  return (
    <Svg label="worksheet_demo, captured" h={210}>
      <T x={30} y={25} s={11} f={C.latte} o={fa(t, 0.05, 0.2)}>the identical burst, no stated boundary</T>
      {ids.map((i) => {
        const start = 0.15 + i * 0.07;
        const travel = easeOut(seg(t, start, start + 0.25));
        return <circle key={i} cx={30 + i * 42} cy={40 + travel * 45} r={5} fill={C.caramel} opacity={fa(t, start, 0.15)} />;
      })}
      <rect x={30} y={120 - grow * 55} width={310} height={grow * 55} fill="none" stroke={C.caramel} strokeWidth={1.5} opacity={fa(t, 0.9, 0.2)} />
      <T x={185} y={135} s={11} a="middle" f={C.latte} o={fa(t, 1.0, 0.2)}>queue length at the checkpoint: seven</T>
      <g opacity={fa(t, 1.3, 0.3)}>
        <rect x={60} y={155} width={290} height={34} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={205} y={177} s={12} a="middle" f={C.mocha}>admitted: all eight. rejected: none</T>
      </g>
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
  const bounded = easeOut(seg(t, 0.2, 0.45));
  const unbounded = easeOut(seg(t, 0.45, 0.8));
  return (
    <Svg label="worksheet_demo, both instances" h={210}>
      <T x={30} y={25} s={11} f={C.latte} o={fa(t, 0.05, 0.2)}>the identical burst, two real designs</T>
      <rect x={60} y={120 - bounded * 14} width={40} height={bounded * 14} fill={C.caramel} opacity={fa(t, 0.2, 0.2)} />
      <T x={80} y={140} s={10} a="middle" f={C.latte}>bounded</T>
      <rect x={160} y={120 - unbounded * 49} width={40} height={unbounded * 49} fill={C.cherry} opacity={fa(t, 0.45, 0.2)} />
      <T x={180} y={140} s={10} a="middle" f={C.latte}>unbounded</T>
      <g opacity={fa(t, 0.95, 0.3)}>
        <rect x={60} y={155} width={300} height={34} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={177} s={12} a="middle" f={C.mocha}>bounded: capped at two. unbounded: at seven</T>
      </g>
      <T x={60} y={200} s={12} f={C.latte} o={fa(t, 1.5, 0.3)}>a default is still a real decision</T>
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
