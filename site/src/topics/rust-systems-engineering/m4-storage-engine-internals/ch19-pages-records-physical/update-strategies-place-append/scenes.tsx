import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

// Overwriting in place is the cheapest in space, but destroys the old
// version outright. Appending keeps every version until a real compaction
// pass discards the old ones. Copying the whole page costs the most in
// space, a page at a time, but that's exactly what buys crash safety with
// no special recovery procedure.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Does in-place overwriting leave any garbage (predict, hook) ──────────────────────────────
export function InPlacePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the same five updates, overwritten in place"
        lines={['record.update(v); record.update(v);', '// does overwriting leave any garbage behind?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: footprint flat, no garbage (swipe test's "from" step) ──────────────────────────
export function InPlaceReveal({ t }: StepCtx) {
  const rows = [
    'footprint before five updates: one record',
    'footprint after: still just one record',
  ];
  return (
    <Svg label="update_strategy_changes_the_fragmentation_cost.rs, measured" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 3 · Does the log's footprint grow with each append (predict) ─────────────────────────────────
export function AppendPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the same five updates, appended to a log"
        lines={['log.push(v); log.push(v);', '// does the log own footprint grow each time?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: footprint grows, compaction reclaims it (takeaway) ─────────────────────────────
export function AppendReveal({ t }: StepCtx) {
  return (
    <Svg label="update_strategy_changes_the_fragmentation_cost.rs, measured" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the log, after five appended updates</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={112} s={13} a="middle" f={C.mocha}>footprint grew; compaction shrank it back</T>
      </g>
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>every old version stayed until compaction ran</T>
    </Svg>
  );
}

// ── 5 · Does copying a page grow only the record's own bytes (predict) ───────────────────────────
export function CowPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the same five updates, each copying a whole page"
        lines={['let mut new_page = *pages.last().unwrap();', '// just the record own bytes, or a whole page?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: a whole page copied every time (takeaway) ──────────────────────────────────────
export function CowReveal({ t }: StepCtx) {
  return (
    <Svg label="update_strategy_changes_the_fragmentation_cost.rs, measured" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>one small update, copy-on-write</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={112} s={13} a="middle" f={C.mocha}>footprint grew by a whole page each time</T>
      </g>
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>never just the record's own few bytes</T>
    </Svg>
  );
}

// ── 7 · Which strategy leaves more garbage (predict) ─────────────────────────────────────────────
export function ComparePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="append-only garbage vs copy-on-write garbage"
        lines={['let (a, c) = (append.garbage(), cow.garbage());', '// which one leaves more behind to reclaim?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · Measured: copy-on-write leaves more garbage (connecting step, NO takeaway) ───────────────
export function CompareReveal({ t }: StepCtx) {
  const rows = [
    'append-only garbage: old record versions',
    'copy-on-write garbage: whole discarded pages',
  ];
  return (
    <Svg label="update_strategy_changes_the_fragmentation_cost.rs, measured" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 9 · LMDB's own crash-safety claim (surprising fact, takeaway) ────────────────────────────────
export function CrashSafetyReveal({ t }: StepCtx) {
  return (
    <Svg label="LMDB docs, quoted" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>a data page is copied, never overwritten</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={112} s={13} a="middle" f={C.mocha}>no page can ever be left half-written</T>
      </g>
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>no special recovery procedure needed at all</T>
    </Svg>
  );
}

// ── 10 · Recap ─────────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'in place: cheapest, old version is gone',
    'append-only: every version, until compaction',
    'copy-on-write: a whole page, every time',
    'that larger cost buys genuine crash safety',
  ];
  return (
    <Svg label="recap: three deliberate choices" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
