import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

// A slotted page's whole point is that a record's own identity (its slot
// index) and its physical offset are two different things, deliberately:
// compacting the page moves the offset, and the slot index never has to
// know. A record too big for the page is rejected cleanly rather than
// corrupting it, exactly why a real system moves oversized values out of
// line entirely.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Does a record's identity survive compaction (predict, hook) ──────────────────────────────
export function CompactionPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a slot array: offset and length, indexed by slot"
        lines={['page.delete(slot); page.compact();', '// does the slot index survive the move?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: round trip, then compaction moved the offset (swipe test's "from" step) ────────
export function CompactionReveal({ t }: StepCtx) {
  const rows = [
    'three records: all round-trip by slot index',
    'after compaction: physical offsets changed',
  ];
  return (
    <Svg label="slot_index_outlives_physical_compaction.rs, measured" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 3 · Did the slot indices themselves change (predict) ─────────────────────────────────────────
export function IdentityPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the same two records, after compaction"
        lines={['let (slot_a, slot_c) = (0, 2);', '// did compaction renumber either one?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: slot index unchanged, offset changed (takeaway) ────────────────────────────────
export function IdentityReveal({ t }: StepCtx) {
  return (
    <Svg label="slot_index_outlives_physical_compaction.rs, measured" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>two surviving records, after compaction</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={112} s={13} a="middle" f={C.mocha}>offset: changed. slot index: unchanged</T>
      </g>
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>neither record was ever renumbered</T>
    </Svg>
  );
}

// ── 5 · Does the content still match after the move (predict) ────────────────────────────────────
export function ReadbackPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="reading by slot index, after the physical move"
        lines={['page.get(slot_a); page.get(slot_c);', '// same content as before compaction?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: content exactly matches after the move (takeaway) ──────────────────────────────
export function ReadbackReveal({ t }: StepCtx) {
  return (
    <Svg label="slot_index_outlives_physical_compaction.rs, measured" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>same slot index, read after compaction</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={112} s={13} a="middle" f={C.mocha}>content: exactly the same for both</T>
      </g>
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>the caller never had to notice the move</T>
    </Svg>
  );
}

// ── 7 · An oversized insert (predict) ─────────────────────────────────────────────────────────────
export function OverflowPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a record far too big for the free space left"
        lines={['page.insert(&oversized);', '// written anyway, or rejected cleanly?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · Measured: rejected cleanly, everything else intact (connecting step, NO takeaway) ────────
export function OverflowReveal({ t }: StepCtx) {
  const rows = [
    'oversized insert: rejected cleanly',
    'every existing record: still exactly intact',
  ];
  return (
    <Svg label="slot_index_outlives_physical_compaction.rs, measured" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 9 · A fixed page size is why TOAST exists (surprising fact, takeaway) ────────────────────────
export function FixedSizeReveal({ t }: StepCtx) {
  return (
    <Svg label="PostgreSQL docs, quoted" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>a page's own size is fixed, on purpose</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={112} s={13} a="middle" f={C.mocha}>too large: compressed, or moved elsewhere</T>
      </g>
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>it never spans onto another page</T>
    </Svg>
  );
}

// ── 10 · Recap ─────────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'a slot index is a stable name, not a place',
    'compaction moves the offset, not the identity',
    'an oversized insert is rejected, not silent',
    'a fixed size is why values move out of line',
  ];
  return (
    <Svg label="recap: identity, decoupled from location" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
