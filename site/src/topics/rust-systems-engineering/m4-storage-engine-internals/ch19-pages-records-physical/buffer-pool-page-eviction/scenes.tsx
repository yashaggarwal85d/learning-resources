import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

// A pinned frame is never evicted, a dirty frame is always written back
// before its frame is reused, and a real CLOCK sweep genuinely favors the
// frame touched more recently. Unlike mmap, which hands control of when a
// dirty page is flushed to the OS, an explicit buffer pool decides that
// for itself.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Can a fully pinned pool evict anything (predict, hook) ───────────────────────────────────
export function PinPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="every frame pinned, one more page arriving"
        lines={['pool.load_and_pin(new_page);', '// genuinely rejected, or something gets evicted?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: rejected outright (swipe test's "from" step) ───────────────────────────────────
export function PinReveal({ t }: StepCtx) {
  const rows = [
    'every frame: pinned',
    'one more page: genuinely rejected',
  ];
  return (
    <Svg label="pin_dirty_and_clock_decide_eviction.rs, measured" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 3 · Is a dirty frame written back before reuse (predict) ─────────────────────────────────────
export function DirtyPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a dirty frame, about to be evicted"
        lines={['if frame.dirty { write_back(frame); }', '// written back first, or simply discarded?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: written back before reuse (takeaway) ───────────────────────────────────────────
export function DirtyReveal({ t }: StepCtx) {
  return (
    <Svg label="pin_dirty_and_clock_decide_eviction.rs, measured" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>a dirty frame, evicted and reused</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={112} s={13} a="middle" f={C.mocha}>written back first, then the frame reused</T>
      </g>
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>nothing dirty was ever simply discarded</T>
    </Svg>
  );
}

// ── 5 · Which frame does CLOCK evict (predict) ────────────────────────────────────────────────────
export function ClockPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="one frame touched again, one left alone"
        lines={['pool.pin(touched); pool.unpin(touched, false);', '// does CLOCK evict the touched one, or the other?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: the untouched frame is evicted (takeaway) ──────────────────────────────────────
export function ClockReveal({ t }: StepCtx) {
  return (
    <Svg label="pin_dirty_and_clock_decide_eviction.rs, measured" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>one frame touched again, one left alone</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={112} s={13} a="middle" f={C.mocha}>evicted: the untouched, not the touched</T>
      </g>
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>being touched again bought a second chance</T>
    </Svg>
  );
}

// ── 7 · What is pinning_backends actually for (predict) ───────────────────────────────────────────
export function PgBufferPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="pg_buffercache's own real fields"
        lines={['isdirty, usagecount, pinning_backends', '// what does pinning_backends actually protect?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · PostgreSQL's own words on pinning (connecting step, NO takeaway) ─────────────────────────
export function PgBufferReveal({ t }: StepCtx) {
  const rows = [
    'pinning_backends: how many backends pin it',
    'eviction: only ever an unpinned buffer',
  ];
  return (
    <Svg label="PostgreSQL docs, quoted" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 9 · mmap hands this decision to the OS instead (surprising fact, takeaway) ───────────────────
export function MmapContrastReveal({ t }: StepCtx) {
  return (
    <Svg label="CIDR 2022 paper, quoted" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>a buffer pool's own dirty bit, explicit</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={112} s={13} a="middle" f={C.mocha}>mmap: the OS flushes dirty pages anytime</T>
      </g>
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>with mmap, the DBMS gets no say in when</T>
    </Svg>
  );
}

// ── 10 · Recap ─────────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'a pinned frame is never a candidate',
    'a dirty frame is written back before reuse',
    "CLOCK's reference bit buys a second chance",
    'a buffer pool decides when; mmap lets the OS',
  ];
  return (
    <Svg label="recap: who decides, and when" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
