import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Draw, Stack, Svg, T, C } from '../../../../../reels/kit';

// Five real calls, a deliberately uneven real delay pattern, one real
// checkpoint while two are still running: a counter only ever counts
// what finished, a histogram built from finished work shares that
// blind spot, and only a gauge, read as a current value, can answer
// whether anything is genuinely backed up right now.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Does the counter answer "backed up right now" (predict) ────────
export function CounterPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="five real calls, three finished, two still running"
        lines={['counter.fetch_add(1) // only on completion', '// read right now: does it say anything is stuck?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: the counter is blind to what is still running ────────
export function CounterReveal({ t }: StepCtx) {
  const rows = ['checkpoint: 3 calls finished, 2 still running', 'counter reads: 3, misses the other 2'];
  return (
    <Svg label="metric_demo, captured" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 3 · Does the histogram do any better (predict) ──────────────────────
export function HistogramPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the histogram, built from completed latencies only"
        lines={['completed_latencies_ms.push(delay_ms) // on completion too', '// same checkpoint: does it see the 2 still running?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: the histogram shares the counter's blind spot (takeaway)
export function HistogramReveal({ t }: StepCtx) {
  const calls = [0, 1, 2, 3, 4];
  return (
    <Svg label="metric_demo, captured" h={210}>
      {calls.map((i) => {
        const finished = i < 3;
        const start = 0.15 + i * 0.08;
        const travel = easeOut(seg(t, start, start + 0.3));
        const x0 = 50 + i * 55;
        const y0 = 40;
        return finished ? (
          <g key={i}>
            <Draw pts={[[x0, y0], [x0, 95]]} t={t} from={start} to={start + 0.3} stroke={C.caramel} w={2} pen />
            <circle cx={x0} cy={y0 + travel * 55} r={5} fill={C.caramel} opacity={fa(t, start, 0.2)} />
          </g>
        ) : (
          <circle key={i} cx={x0} cy={y0} r={5} fill="none" stroke={C.latte} strokeWidth={1.5} opacity={fa(t, start, 0.2)} />
        );
      })}
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={30} y={95} width={160} height={40} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={110} y={120} s={12} a="middle" f={C.mocha}>histogram length: 3</T>
      </g>
      <T x={60} y={170} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>built from finished work, blind to the rest</T>
    </Svg>
  );
}

// ── 5 · Does the gauge answer it correctly (predict) ────────────────────
export function GaugePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the gauge, read as a current value, not a total"
        lines={['gauge.fetch_add(1) on start, fetch_sub(1) on finish', '// same checkpoint: does reading it now answer correctly?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: the gauge correctly reads 2 in flight (takeaway) ──────
export function GaugeReveal({ t }: StepCtx) {
  const rise = easeOut(seg(t, 0.15, 0.45));
  const fall = easeOut(seg(t, 0.6, 0.9));
  const netUnits = 5 * rise - 3 * fall;
  const barH = Math.max(netUnits, 0) * 16;
  return (
    <Svg label="metric_demo, captured" h={210}>
      <T x={60} y={35} s={12} f={C.latte} o={fa(t, 0.1, 0.3)}>5 starts, then 3 finishes</T>
      <rect x={60} y={120 - barH} width={40} height={barH} fill={C.caramel} opacity={fa(t, 0.15, 0.2)} />
      <T x={115} y={105} s={13} f={C.crema} o={fa(t, 0.9, 0.3)}>gauge now: 2</T>
      <g opacity={fa(t, 1.1, 0.4)}>
        <rect x={30} y={135} width={160} height={40} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={110} y={160} s={12} a="middle" f={C.mocha}>gauge reads: 2, right now</T>
      </g>
      <T x={60} y={190} s={13} f={C.latte} o={fa(t, 1.6, 0.4)}>a current value, not a running total</T>
    </Svg>
  );
}

// ── 7 · Prometheus's own words on the three shapes (connecting) ─────────
export function DocsReveal({ t }: StepCtx) {
  const rows = ['counter: can only increase', 'gauge: can arbitrarily go up and down', 'histogram: counts observations into buckets'];
  return (
    <Svg label="Prometheus's own docs, quoted" h={210}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 50} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 50} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 8 · Recap ─────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = ['a counter only ever counts what finished', 'a histogram shares that identical blind spot', 'only a gauge, read right now, can answer'];
  return (
    <Svg label="recap: the right shape for the right question" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
