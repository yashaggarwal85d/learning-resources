import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

// A read checks the newest structure first, so a fresh, unflushed write
// always beats a stale, flushed one. The older a key is, the more
// structures a read has to fall through to find it, and a genuine miss
// costs checking everything that exists. Once flushed, an SSTable's own
// bytes are never modified in place.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Stale flushed value vs fresh overwrite (predict, hook) ───────────
export function OverwritePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="one key, flushed once, then overwritten"
        lines={['lsm.put(key, old_value); lsm.rotate(); lsm.flush();', 'lsm.put(key, new_value); lsm.get_with_cost(key);']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: the fresh value wins (takeaway) ─────────────────────────
export function OverwriteReveal({ t }: StepCtx) {
  return (
    <Svg label="lsm_write_read_paths_newest_first.rs, measured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>one key, old value flushed, new value not</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={102} s={13} a="middle" f={C.mocha}>read returns: the fresh value</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>the stale, flushed value never wins</T>
    </Svg>
  );
}

// ── 3 · Oldest key vs newest key lookup cost (predict) ────────────────────
export function FallThroughPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="three keys, three different ages"
        lines={['lsm.get_with_cost(oldest_key);', 'lsm.get_with_cost(newest_key); // same cost, or not?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: older costs more, a miss costs everything (takeaway) ──
export function FallThroughReveal({ t }: StepCtx) {
  const rows = ['active memtable', 'newer SSTable', 'oldest SSTable'];
  return (
    <Svg label="lsm_write_read_paths_newest_first.rs, measured" h={240}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.35, 0.4)}>
          <rect x={60} y={30 + i * 48} width={280} height={34} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
          <T x={75} y={52 + i * 48} s={12} f={C.crema}>{r}</T>
        </g>
      ))}
      <T x={60} y={200} s={13} f={C.latte} o={fa(t, 1.7, 0.4)}>a miss checks every one of these</T>
    </Svg>
  );
}

// ── 5 · Does a read ever change the SSTable's bytes (predict) ────────────
export function ImmutablePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="one SSTable, many reads against it"
        lines={['let before = sstable.content_fold();', 'for probe in probes { lsm.get_with_cost(probe); }']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: the bytes never change (takeaway) ───────────────────────
export function ImmutableReveal({ t }: StepCtx) {
  return (
    <Svg label="lsm_write_read_paths_newest_first.rs, measured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>same content fold, before and after</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={75} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={102} s={13} a="middle" f={C.mocha}>identical, across every read</T>
      </g>
      <T x={60} y={150} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>a flushed table is read-only, genuinely</T>
    </Svg>
  );
}

// ── 7 · What happens at a memtable switch (predict) ───────────────────────
export function SwitchPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the active memtable can't absorb one more write"
        lines={['lsm.rotate(); // what happens to the active memtable,', '// and to the write-ahead log, right now?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · RocksDB's own words on a memtable switch (takeaway) ──────────────
export function SwitchReveal({ t }: StepCtx) {
  const rows = [
    'the active memtable is closed',
    'turned into an immutable memtable',
    'a new log file starts right then',
  ];
  return (
    <Svg label="RocksDB Wiki: Terminology, quoted" h={210}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 9 · RocksDB's own words on an immutable memtable (connecting) ────────
export function ImmutableMemtableReveal({ t }: StepCtx) {
  const rows = [
    'a closed memtable',
    'waiting to be flushed',
  ];
  return (
    <Svg label="RocksDB Wiki: Terminology, quoted" h={180}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}

// ── 10 · Recap ─────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'newest structure wins, always',
    'older keys cost more to find',
    'a miss checks everything that exists',
    'a flushed SSTable never changes',
  ];
  return (
    <Svg label="recap: what a read checks, what never changes" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
