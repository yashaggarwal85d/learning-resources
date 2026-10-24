import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

// A real burst of requests past a real queue's own capacity is shed
// as a real suffix of arrival order, genuinely and reproducibly; an
// explicit, stated failure budget is what lets that exact rate be
// read as a saturated resource behaving correctly, not a bug.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Is every real request accounted for (predict) ──────────────────
export function BurstPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a real burst, six requests, one small queue"
        lines={['for id in requests { client.post(submit(id)) }', '// once it settles: is every one accounted for?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: three admitted, three shed, all accounted for ───────
export function BurstReveal({ t }: StepCtx) {
  const rows = ['admitted: three real requests', 'shed: three real requests, none left over'];
  return (
    <Svg label="overload_demo, captured" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 3 · Could shedding land on an arbitrary request (predict) ──────────
export function SuffixPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the three shed requests, checked against order"
        lines={['min(shed_ids) > max(admitted_ids) // real check', '// could shedding land on an earlier request too?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: shedding is a real suffix of the order (takeaway) ────
export function SuffixReveal({ t }: StepCtx) {
  return (
    <Svg label="overload_demo, captured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the shed requests, checked against order</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>shed requests come after admitted ones</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>a real suffix, never an arbitrary pick</T>
    </Svg>
  );
}

// ── 5 · Does the identical burst reproduce the split (predict) ─────────
export function ReproduciblePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the identical burst, run again, fresh instance"
        lines={['run_burst(&client, 6, 2, 150) // same real inputs', '// same real split, or does timing noise change it?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: the identical split reproduces exactly (takeaway) ────
export function ReproducibleReveal({ t }: StepCtx) {
  return (
    <Svg label="overload_demo, captured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>a fresh instance, the identical burst</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>three admitted, three shed, again</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>real, deterministic saturation</T>
    </Svg>
  );
}

// ── 7 · load_shed and the SRE book's own words (connecting) ────────────
export function DocsReveal({ t }: StepCtx) {
  const rows = ['load_shed: middleware for shedding load', 'error budget: how unreliable is allowed'];
  return (
    <Svg label="load_shed and the SRE book, quoted" h={180}>
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
  const rows = ['a queue sheds a real, reproducible suffix', 'that exact rate is a measured, real fact', 'a budget turns a rate into an expected cost'];
  return (
    <Svg label="recap: a budget that tells overload from a bug" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
