import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

// A real page's checksum genuinely catches a corrupted byte anywhere in its
// body, but a checksum alone can't catch a deliberate, consistent format
// change -- only a magic number check does. A page's own byte order has to
// be explicit and enforced, matching PostgreSQL's own self-describing header
// and its line pointers' own permanence guarantee.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Does a corrupted byte get caught (predict, hook) ─────────────────────────────────────────
export function CorruptionPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a real page, one byte flipped somewhere in its body"
        lines={['page.bytes[offset] ^= 0xFF;', '// does the page catch this, or hand back bad data?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: round-trip clean, corruption caught (swipe test's "from" step — NO takeaway) ──
export function CorruptionReveal({ t }: StepCtx) {
  const rows = [
    'untouched page: checksum validates cleanly',
    'one flipped byte: checksum genuinely invalid',
  ];
  return (
    <Svg label="self_describing_page_catches_corruption.rs, measured" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 3 · Change the magic number, recompute the checksum (predict) ────────────────────────────────
export function MagicPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a changed magic number, checksum recomputed over it"
        lines={['page.bytes[0..4] = WRONG_MAGIC; recompute_checksum();', '// does the checksum alone catch this?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: checksum valid, format invalid (takeaway) ──────────────────────────────────────
export function MagicReveal({ t }: StepCtx) {
  return (
    <Svg label="self_describing_page_catches_corruption.rs, measured" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>magic number changed, checksum recomputed</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={112} s={13} a="middle" f={C.mocha}>checksum: valid. format check: invalid</T>
      </g>
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>only the magic number check caught it</T>
    </Svg>
  );
}

// ── 5 · Read the same bytes in the opposite byte order (predict) ─────────────────────────────────
export function EndiannessPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the same raw bytes, read two different ways"
        lines={['u64::from_le_bytes(bytes); u64::from_be_bytes(bytes);', '// does the byte order actually matter?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: wrong byte order, wrong value (takeaway) ───────────────────────────────────────
export function EndiannessReveal({ t }: StepCtx) {
  return (
    <Svg label="self_describing_page_catches_corruption.rs, measured" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>same raw bytes, read in two different orders</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={112} s={13} a="middle" f={C.mocha}>chosen order: correct. reversed: wrong</T>
      </g>
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>the order itself had to be picked and kept</T>
    </Svg>
  );
}

// ── 7 · What does the header's first field track (predict) ───────────────────────────────────────
export function FieldPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="PostgreSQL's own page header, first field"
        lines={['struct PageHeaderData { pd_lsn: PageXLogRecPtr, .. }', '// what does the documentation say it tracks?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · The documentation quoted directly (connecting step — NO takeaway) ────────────────────────
export function FieldReveal({ t }: StepCtx) {
  return (
    <Svg label="PostgreSQL docs, quoted" h={180}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>first field: the most recent log entry</T>
      <T x={60} y={100} s={14} f={C.crema} o={fa(t, 0.9, 0.4)}>second field: the page checksum, when enabled</T>
    </Svg>
  );
}

// ── 9 · Item identifiers outlive being moved (surprising fact, takeaway) ─────────────────────────
export function PermanenceReveal({ t }: StepCtx) {
  return (
    <Svg label="PostgreSQL docs, quoted" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>an item identifier is never moved until freed</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={112} s={13} a="middle" f={C.mocha}>its index references an item long term</T>
      </g>
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>even while the item moves to compact space</T>
    </Svg>
  );
}

// ── 10 · Recap ─────────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'a checksum catches damage, not a format change',
    'a magic number catches what a checksum misses',
    'byte order must be explicit, never assumed',
    'line pointers let identity outlive a move',
  ];
  return (
    <Svg label="recap: a page that can tell its own story" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
