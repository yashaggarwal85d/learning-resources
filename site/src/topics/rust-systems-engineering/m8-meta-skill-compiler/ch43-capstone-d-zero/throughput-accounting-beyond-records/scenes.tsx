import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

// Two implementations can run at the identical real speed while one
// allocates a dramatically larger real cost underneath it, a gap
// records per second, measured alone, never once reveals.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Does cloning show up in records per second (predict) ───────────
export function ThroughputPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="borrow each record, or clone it first"
        lines={['the identical checksum, the identical records', '// does cloning show up in records per second?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: throughput lands close either way ─────────────────────
export function ThroughputReveal({ t }: StepCtx) {
  return (
    <Svg label="alloc_demo, captured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the identical twenty thousand records</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>millions of records per second, either way</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>a modest band, not a structural gap</T>
    </Svg>
  );
}

// ── 3 · Does allocation look as close (predict) ─────────────────────────
export function AllocationPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the identical workload, a different question now"
        lines={['a real counting allocator, bytes per record', '// does that number look as close as speed did?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: allocation is a different story ──────────────────────
export function AllocationReveal({ t }: StepCtx) {
  const rows = ['borrowing: a handful of bytes per record', 'cloning: right around each record own size'];
  return (
    <Svg label="alloc_demo, captured" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 5 · Modest difference or structural (predict) ───────────────────────
export function GapPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="eight bytes against two hundred eight bytes"
        lines={['the identical, indistinguishable throughput', '// modest, or a real structural gap?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: over twenty times larger ──────────────────────────────
export function GapReveal({ t }: StepCtx) {
  return (
    <Svg label="alloc_demo, captured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the identical speed, a hidden cost</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={300} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={102} s={13} a="middle" f={C.mocha}>over twenty times the bytes, per record</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>a gap speed alone never showed</T>
    </Svg>
  );
}

// ── 7 · the standard library's own words on a global allocator ─────────
export function DocsReveal({ t }: StepCtx) {
  const rows = ['registered once, behind every allocation', 'invoked through functions, never by hand'];
  return (
    <Svg label="std::alloc::GlobalAlloc, its own words" h={180}>
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
  const rows = ['indistinguishable speed, two real records', 'twenty times the bytes, hidden underneath', 'one number alone never tells the whole cost'];
  return (
    <Svg label="recap: the cost a single number hides" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
