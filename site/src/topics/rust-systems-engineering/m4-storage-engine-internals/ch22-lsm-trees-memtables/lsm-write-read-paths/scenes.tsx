import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Decode, Draw, Reticle, Stack, Svg, T, C } from '../../../../../reels/kit';


/** A check mark that draws itself over `k` (0..1). */
const Tick = ({ x, y, k, f = C.focus }: { x: number; y: number; k: number; f?: string }) =>
  k > 0 ? <path d={`M${x} ${y} l6 6 l12 -14`} fill="none" stroke={f} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={30} strokeDashoffset={30 * (1 - k)} /> : null;
/** A cross that draws itself over `k`. */
const Cross = ({ x, y, k, f = C.cherryText }: { x: number; y: number; k: number; f?: string }) =>
  k > 0 ? (
    <g stroke={f} strokeWidth={2.5} strokeLinecap="round">
      <line x1={x} y1={y - 7} x2={x + 14 * Math.min(1, k * 2)} y2={y - 7 + 14 * Math.min(1, k * 2)} />
      {k > 0.5 && <line x1={x + 14} y1={y - 7} x2={x + 14 - 14 * (k - 0.5) * 2} y2={y - 7 + 14 * (k - 0.5) * 2} />}
    </g>
  ) : null;

/** Recap rows: each slides in on its beat with its verdict drawing at the right; a spine draws down the left
 * through them, and the lock-on lands on row `lock` at `lockAt` (finished 0.55 s later, inside the step). `y0` is the first row's centre. */
function RecapRows({ t, rows, y0 = 40, gap = 56, start = 0.2, beat = 0.45, lock = 0, lockAt }: { t: number; rows: [string, boolean][]; y0?: number; gap?: number; start?: number; beat?: number; lock?: number; lockAt: number }) {
  const yEnd = y0 + (rows.length - 1) * gap;
  return (
    <g>
      <Draw pts={[[26, y0 - 6], [26, yEnd + 6]]} t={t} from={start - 0.05} to={start + (rows.length - 1) * beat + 0.3} stroke={C.mocha} w={1.5} pen={false} />
      {rows.map(([r, good], i) => {
        const a = start + i * beat;
        const k = easeOut(seg(t, a, a + 0.45));
        const y = y0 + i * gap;
        const hot = i === lock;
        return (
          <g key={r}>
            <g opacity={k} transform={`translate(${((1 - k) * -24).toFixed(1)} 0)`}>
              <circle cx={26} cy={y} r={hot ? 6 : 4.5} fill={hot ? C.caramel : C.crema} />
              <T x={44} y={y + 5} s={13} f={hot ? C.caramel : C.crema} w={hot ? 700 : 500}>{r}</T>
            </g>
            {good ? <Tick x={554} y={y} k={easeOut(seg(t, a + 0.3, a + 0.65))} /> : <Cross x={556} y={y} k={easeOut(seg(t, a + 0.3, a + 0.65))} />}
          </g>
        );
      })}
      <Reticle x={292} y={y0 + lock * gap} w={556} h={gap - 14} t={t} at={lockAt} />
    </g>
  );
}

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
  const write = easeOut(seg(t, 0.3, 0.7));
  const read = easeInOut(seg(t, 1.0, 1.5));
  return (
    <Svg label="lsm_write_read_paths_newest_first.rs, measured" h={260}>
      <rect x={60} y={40} width={220} height={60} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} strokeDasharray="5 4" />
      <T x={170} y={30} s={13} a="middle" f={C.caramel}>active memtable</T>
      <rect x={60} y={160} width={220} height={60} rx={4} fill="none" stroke={C.latte} strokeWidth={1.5} />
      <T x={170} y={242} s={13} a="middle" f={C.latte}>SSTable, flushed</T>
      <rect x={90} y={176} width={70} height={28} rx={3} fill="none" stroke={C.taupe} strokeWidth={1.5} />
      <T x={125} y={195} s={13} a="middle" f={C.taupe}>stale</T>
      {write > 0 && (
        <g transform={`translate(0 ${((1 - write) * -40).toFixed(1)})`} opacity={write}>
          <rect x={90} y={56} width={70} height={28} rx={3} fill="none" stroke={C.caramel} strokeWidth={2} />
          <T x={125} y={75} s={13} a="middle" f={C.caramel}>fresh</T>
        </g>
      )}
      {/* the read: newest first, and it stops at the first hit */}
      <T x={460} y={30} s={13} a="middle" f={C.cinnamon} o={seg(t, 0.9, 1.1)}>read</T>
      {read > 0 && <Draw pts={[[460, 40], [460, 70], [170, 70]]} t={t} from={1.0} to={1.5} stroke={C.cinnamon} w={2} />}
      <Tick x={176} y={70} k={easeOut(seg(t, 1.5, 1.8))} f={C.cinnamon} />
      <Draw pts={[[460, 80], [460, 190], [290, 190]]} t={t} from={1.9} to={2.3} stroke={C.mocha} w={1.5} dash="4 4" pen={false} />
      <T x={470} y={140} s={13} f={C.taupe} o={seg(t, 2.1, 2.4)}>never reached</T>
      <Reticle x={125} y={70} w={90} h={44} t={t} at={2.3} />
    </Svg>
  );
}
// ── 4 · Measured: older keys cost more, a missing key costs the most ─────
// Three lookups run down the same stack, newest structure first. The
// newest key stops at the first; the oldest goes deeper; the missing key
// visits every structure and comes back empty. Their probe counts race
// as bars on the right.

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
  const names = ['memtable', 'immutable', 'SST', 'SST'];
  const keys: [string, number, string][] = [['newest key', 1, C.caramel], ['oldest key', 3, C.crema], ['missing key', 4, C.cherryText]];
  return (
    <Svg label="lsm_write_read_paths_newest_first.rs, measured" h={270}>
      {names.map((n, i) => (
        <g key={i}>
          <rect x={40} y={30 + i * 52} width={130} height={36} rx={4} fill="none" stroke={C.latte} strokeWidth={1.5} strokeDasharray={i < 2 ? '5 4' : undefined} />
          <T x={105} y={53 + i * 52} s={13} a="middle" f={C.latte}>{n}</T>
        </g>
      ))}
      {keys.map(([label, depth, f], k) => {
        const a = 0.3 + k * 0.6;
        const d = seg(t, a, a + 0.15 * depth + 0.2) * depth;
        const x = 210 + k * 28;
        return (
          <g key={label}>
            <Draw pts={[[x, 30], [x, 30 + depth * 52 - 16]]} t={t} from={a} to={a + 0.15 * depth + 0.2} stroke={f} w={2.5} />
            <T x={360} y={70 + k * 50} s={13} f={f} o={seg(t, a, a + 0.2)}>{label}</T>
            <rect x={360} y={78 + k * 50} width={Math.max(3, 46 * d)} height={10} rx={2} fill={f} />
          </g>
        );
      })}
      <T x={360} y={44} s={13} f={C.taupe}>structures checked</T>
      <Reticle x={452} y={176} w={200} h={44} t={t} at={2.35} color={C.cherryText} />
    </Svg>
  );
}
// ── 6 · Measured: a flushed SSTable never changes (takeaway) ─────────────
// Read after read hits the flushed SSTable, hits and misses alike. Each one
// bounces off; its bytes' fingerprint, checked after every read, stays
// exactly the same.

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
  const n = 7;
  return (
    <Svg label="lsm_write_read_paths_newest_first.rs, measured" h={250}>
      <rect x={220} y={110} width={160} height={60} rx={4} fill="none" stroke={C.crema} strokeWidth={2} />
      <T x={300} y={145} s={14} a="middle" f={C.crema}>SSTable</T>
      {Array.from({ length: n }, (_, i) => {
        const a = 0.2 + i * 0.27;
        const k = seg(t, a, a + 0.4);
        if (k <= 0 || k >= 1) return null;
        const x = 120 + i * 60;
        const up = k < 0.5 ? lerp(20, 104, k * 2) : lerp(104, 20, (k - 0.5) * 2);
        return <circle key={i} cx={x} cy={up} r={6} fill={i % 3 === 2 ? C.latte : C.cinnamon} />;
      })}
      {Array.from({ length: n }, (_, i) => (
        <Tick key={i} x={120 + i * 60 - 9} y={206} k={easeOut(seg(t, 0.5 + i * 0.27, 0.75 + i * 0.27))} f={C.crema} />
      ))}
      <T x={40} y={186} s={13} f={C.latte} o={seg(t, 0.4, 0.6)}>bytes same, after every read</T>
      <Decode text="never changed" t={t} at={2.2} dur={0.4} x={300} y={245} s={15} a="middle" f={C.caramel} w={700} />
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
  const sw = 1.1;
  const slide = easeInOut(seg(t, sw, sw + 0.5));
  const fresh = easeOut(seg(t, sw + 0.3, sw + 0.7));
  const fillOld = clamp(seg(t, 0.15, sw) * 1.0);
  const dotsOld = Math.floor(fillOld * 6);
  const dotsNew = Math.floor(seg(t, sw + 0.8, 2.6) * 3 + 0.0001);
  const bx = lerp(40, 330, slide);
  return (
    <Svg label="RocksDB Wiki: Terminology, quoted" h={270}>
      {/* the old memtable: fills, closes, turns immutable, slides aside */}
      <rect x={bx} y={40} width={210} height={70} rx={6} fill="none" stroke={slide > 0 ? C.latte : C.crema} strokeWidth={slide > 0 ? 2.5 : 1.5} strokeDasharray={slide > 0 ? undefined : '5 4'} />
      {Array.from({ length: dotsOld }, (_, i) => <circle key={i} cx={bx + 25 + (i % 6) * 32} cy={75} r={8} fill={C.crema} />)}
      <T x={bx + 105} y={30} s={13} a="middle" f={slide > 0 ? C.latte : C.crema}>{slide > 0.5 ? 'immutable' : 'active'}</T>
      {/* the fresh memtable */}
      {fresh > 0 && (
        <g opacity={fresh} transform={`translate(0 ${((1 - fresh) * 20).toFixed(1)})`}>
          <rect x={40} y={40} width={210} height={70} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} strokeDasharray="5 4" />
          {Array.from({ length: dotsNew }, (_, i) => <circle key={i} cx={65 + i * 32} cy={75} r={8} fill={C.caramel} />)}
          <T x={145} y={30} s={13} a="middle" f={C.caramel}>new active</T>
        </g>
      )}
      {/* the write-ahead log: one file, cut at the switch, then a new file */}
      <T x={40} y={160} s={13} f={C.taupe}>write-ahead log</T>
      <rect x={40} y={172} width={lerp(0, 300, fillOld)} height={16} rx={2} fill={C.latte} />
      {t > sw && <line x1={342} y1={164} x2={342} y2={196} stroke={C.caramel} strokeWidth={2.5} />}
      {t > sw + 0.2 && <rect x={350} y={172} width={lerp(0, 200, seg(t, sw + 0.3, 2.6))} height={16} rx={2} fill={C.caramel} />}
      <Decode text="new log file" t={t} at={sw + 0.3} dur={0.45} x={350} y={222} s={13} f={C.caramel} />
      <T x={40} y={222} s={13} f={C.latte} o={seg(t, sw, sw + 0.3)}>old file, closed</T>
      <Reticle x={445} y={180} w={220} h={36} t={t} at={2.4} />
    </Svg>
  );
}
// ── 9 · RocksDB's own words on an immutable memtable (connecting) ────────
// The closed memtable sits in line, neither gone nor writable; then its
// turn comes, a flush draws down to disk, and an SSTable rises there.

// ── 9 · RocksDB's own words on an immutable memtable (connecting) ────────
export function ImmutableMemtableReveal({ t }: StepCtx) {
  const wait = seg(t, 0.3, 1.3);
  const flush = easeOut(seg(t, 1.8, 2.3));
  return (
    <Svg label="RocksDB Wiki: Terminology, quoted" h={270}>
      <rect x={60} y={30} width={210} height={64} rx={6} fill="none" stroke={C.latte} strokeWidth={2.5} opacity={seg(t, 0.05, 0.3)} />
      {[0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx={85 + i * 32} cy={62} r={8} fill={C.crema} opacity={seg(t, 0.05, 0.3)} />)}
      <T x={165} y={20} s={13} a="middle" f={C.latte}>immutable memtable</T>
      {/* waiting: a clock hand sweeps while it sits in line */}
      <circle cx={340} cy={62} r={20} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={1 - flush} />
      <line x1={340} y1={62} x2={340 + 16 * Math.sin(wait * Math.PI * 2)} y2={62 - 16 * Math.cos(wait * Math.PI * 2)} stroke={C.crema} strokeWidth={2} opacity={1 - flush} />
      <T x={372} y={67} s={13} f={C.latte} o={seg(t, 0.3, 0.6) * (1 - flush)}>waiting</T>
      {/* its turn: flushed to disk */}
      <Draw pts={[[165, 96], [165, 150]]} t={t} from={1.4} to={1.8} stroke={C.caramel} w={2} />
      <T x={180} y={128} s={13} f={C.caramel} o={seg(t, 1.5, 1.8)}>flush</T>
      <line x1={40} y1={152} x2={560} y2={152} stroke={C.mocha} strokeWidth={1} />
      <T x={555} y={146} s={13} a="end" f={C.taupe}>disk</T>
      <g opacity={flush} transform={`translate(0 ${((1 - flush) * 18).toFixed(1)})`}>
        <rect x={80} y={160} width={170} height={28} rx={4} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={165} y={179} s={13} a="middle" f={C.caramel}>SSTable</T>
      </g>
      <T x={40} y={232} s={13} f={C.crema} o={seg(t, 0.4, 0.7)}>“A closed memtable that is waiting to be flushed.”</T>
      <Draw pts={[[300, 240], [520, 240]]} t={t} from={0.8} to={1.3} stroke={C.caramel} w={1.5} pen={false} />
    </Svg>
  );
}
// ── 10 · Recap ─────────────────────────────────────────────────────────────
// A lookup for a missing key walks every structure newest-first, one hop
// per beat, and comes back empty: the read path's whole cost on one line.
// Then the lessons land; the lock-on settles on "newest wins".

// ── 10 · Recap ─────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const names = ['memtable', 'immutable', 'SST', 'SST'];
  const hop = seg(t, 0.25, 1.15) * names.length;
  return (
    <Svg label="recap: what a read checks, what never changes" h={330}>
      {names.map((n, i) => {
        const x = 40 + i * 132;
        const visited = hop > i + 0.5;
        return (
          <g key={i}>
            <rect x={x} y={20} width={116} height={34} rx={4} fill="none" stroke={visited ? C.caramel : C.mocha} strokeWidth={visited ? 2 : 1.5} strokeDasharray={i >= 2 ? undefined : '5 4'} />
            <T x={x + 58} y={42} s={13} a="middle" f={visited ? C.crema : C.taupe}>{n}</T>
          </g>
        );
      })}
      {hop > 0 && hop < names.length && <circle cx={40 + 58 + Math.min(hop - 0.5, names.length - 1) * 132} cy={70} r={6} fill={C.caramel} />}
      <Decode text="newest first, every one checked" t={t} at={1.15} dur={0.4} x={300} y={84} s={13} a="middle" f={C.latte} />
      <RecapRows
        t={t}
        y0={124}
        gap={52}
        start={1.0}
        beat={0.3}
        lockAt={2.4}
        rows={[
          ['newest structure wins, always', true],
          ['older keys cost more to find', true],
          ['a miss checks everything that exists', true],
          ['a flushed SSTable never changes', true],
        ]}
        lock={0}
      />
    </Svg>
  );
}
