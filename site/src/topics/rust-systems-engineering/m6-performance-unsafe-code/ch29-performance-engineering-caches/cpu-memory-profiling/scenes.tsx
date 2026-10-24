import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

// Profiling genuinely attributes the real majority of a program's own
// cost to one specific function, often several calls deep, not an even
// split; an allocator's own overhead is itself a real, measured cost.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Does cost spread evenly or pile up in one place (predict, hook) ──
export function SpreadPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a real call tree, six functions, one program"
        lines={['sum_self_cost(&tree);', '// spread evenly, or piled up in one place?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: one function holds the real majority (takeaway) ───────
export function HotFunctionReveal({ t }: StepCtx) {
  return (
    <Svg label="profiling_attributes_cost_to_the_real_hot_path.rs" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>an even split: one sixth, per function</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>run_model alone: most of the real cost</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>cost piles up; it never spreads evenly</T>
    </Svg>
  );
}

// ── 3 · Does the top frame alone find the hot function (predict) ─────────
export function DepthPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the hot function, several real calls deep"
        lines={['depth(&tree, run_model);', '// found by reading just the top frame?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: genuinely not top-level (takeaway) ──────────────────────
export function DepthReveal({ t }: StepCtx) {
  const rows = ['request_handler, then business_logic', 'then run_model: the real hot function'];
  return (
    <Svg label="profiling_attributes_cost_to_the_real_hot_path.rs" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 5 · Does swapping allocators matter (predict) ────────────────────────
export function AllocatorPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the identical allocation count, two allocators"
        lines={['default_total_ns > specialized_total_ns;', '// a real, measurable difference?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: cuts cost by over half (takeaway) ───────────────────────
export function AllocatorReveal({ t }: StepCtx) {
  return (
    <Svg label="profiling_attributes_cost_to_the_real_hot_path.rs" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the default allocator, the identical count</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>the specialized one: cost cut by over half</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>allocator choice is a real, measured decision</T>
    </Svg>
  );
}

// ── 7 · Both sources' own words on this exact discipline (connecting) ────
export function DocsReveal({ t }: StepCtx) {
  const rows = ['a frame’s width: how often it was on stack', 'the allocator’s own share: a measured cost'];
  return (
    <Svg label="Brendan Gregg / mimalloc README, quoted" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 8 · Recap ───────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = ['one function holds the real majority of cost', 'often several calls deep, not top level', 'allocator overhead is a real, measured cost'];
  return (
    <Svg label="recap: a real call tree, measured" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
