import type { StepCtx } from '../../../../../reels/types';
import { easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
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

// Without compaction, every flush is one more file a lookup might have
// to check, forever; real compaction, of either kind, genuinely beats
// that. But leveled and tiered trade real, different costs: tiered
// costs less rewritten data to run, at the price of leaving more files
// and more stale data behind than leveled does.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Flushing forever with no compaction (predict, hook) ──────────────
export function NoCompactionPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="many flushes, no compaction, ever"
        lines={['run_no_compaction(&batches);', '// does lookup cost ever stop growing?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: run count keeps growing (takeaway) ──────────────────────
export function NoCompactionReveal({ t }: StepCtx) {
  const n = 7;
  const start = 0.2, beat = 0.3;
  const landed = (i: number) => easeOut(seg(t, start + i * beat, start + i * beat + 0.28));
  return (
    <Svg label="compaction_strategies_amplification.rs, measured" h={270}>
      <rect x={60} y={14} width={160} height={26} rx={4} fill="none" stroke={C.crema} strokeWidth={1.5} strokeDasharray="5 4" />
      <T x={140} y={32} s={13} a="middle" f={C.crema}>memtable</T>
      <line x1={40} y1={240} x2={260} y2={240} stroke={C.mocha} />
      {Array.from({ length: n }, (_, i) => {
        const k = landed(i);
        if (k <= 0) return null;
        const yEnd = 240 - (i + 1) * 24;
        return <rect key={i} x={70} y={lerp(42, yEnd, k)} width={140} height={20} rx={3} fill="none" stroke={i === n - 1 ? C.caramel : C.latte} strokeWidth={1.8} />;
      })}
      <T x={140} y={262} s={13} a="middle" f={C.taupe}>runs on disk</T>
      {/* the lookup's own cost: one notch per run it may check */}
      <T x={330} y={70} s={13} f={C.latte}>a lookup checks</T>
      {Array.from({ length: n }, (_, i) => {
        const k = landed(i);
        return k > 0 ? <rect key={i} x={330 + i * 32} y={84} width={26 * k} height={22} rx={3} fill={C.caramel} /> : null;
      })}
      <Decode text="still growing" t={t} at={2.3} dur={0.4} x={330} y={140} s={15} f={C.caramel} w={700} />
      <T x={330} y={170} s={13} f={C.latte} o={seg(t, 2.4, 2.7)}>nothing ever merges</T>
    </Svg>
  );
}
// ── 9 · RocksDB's own words on write stalls (connecting) ──────────────────
// Writes stream in faster than the background work can drain them, and the
// backlog bar climbs toward its limit. When it gets there the system steps
// in: the stream thins out, and the backlog stops climbing.

// ── 3 · Do both strategies beat no compaction (predict) ──────────────────
export function BothBeatPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="same flushes, through two real compactors"
        lines={['leveled.run_count(); tiered.run_count();', '// both beat no compaction, or not?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: both beat no compaction (takeaway) ──────────────────────
export function BothBeatReveal({ t }: StepCtx) {
  const rows: [string, number, number, string][] = [
    ['none', 1, 1, C.cherryText],
    ['tiered', 0.45, 0.5, C.crema],
    ['leveled', 0.2, 0.25, C.caramel],
  ];
  return (
    <Svg label="compaction_strategies_amplification.rs, measured" h={270}>
      <T x={150} y={22} s={13} f={C.latte}>files to check</T>
      <T x={150} y={46} s={13} f={C.taupe}>stale data</T>
      {rows.map(([label, read, space, f], i) => {
        const k = easeOut(seg(t, 0.4 + i * 0.25, 1.4 + i * 0.25));
        const y = 76 + i * 62;
        return (
          <g key={label}>
            <T x={40} y={y + 16} s={13} f={f}>{label}</T>
            <rect x={150} y={y} width={Math.max(3, 400 * read * k)} height={12} rx={2} fill={f} />
            <rect x={150} y={y + 16} width={Math.max(3, 400 * space * k)} height={8} rx={2} fill={f} opacity={0.55} />
            {i > 0 && <Tick x={560 - 14} y={y + 12} k={easeOut(seg(t, 1.9 + i * 0.15, 2.2 + i * 0.15))} />}
          </g>
        );
      })}
      <Decode text="both beat none" t={t} at={2.2} dur={0.4} x={150} y={262} s={15} f={C.caramel} w={700} />
    </Svg>
  );
}
// ── 6 · Measured: tiered rewrites less (takeaway) ─────────────────────────
// Flush after flush arrives in both trees. Leveled merges after every one,
// rewriting what's already there each time; tiered waits and merges whole
// batches only now and then. The rewritten-data bars race: tiered's ends
// shorter.

// ── 5 · Same workload, same write cost (predict) ──────────────────────────
export function WriteAmpPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the same flushes, two different compactors"
        lines={['leveled.write_cost; tiered.write_cost;', '// same rewritten data, or not?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: tiered costs less to run (takeaway) ────────────────────
export function WriteAmpReveal({ t }: StepCtx) {
  const flushes = 6;
  const p = seg(t, 0.3, 2.0) * flushes;
  const done = Math.floor(p);
  let lev = 0, tier = 0;
  for (let i = 1; i <= done; i++) {
    lev += i;
    if (i % 3 === 0) tier += i;
  }
  const max = 21;
  const lane = (y: number, label: string, total: number, merges: number[], f: string) => (
    <g>
      <T x={40} y={y - 10} s={13} f={f}>{label}</T>
      {Array.from({ length: flushes }, (_, i) => (
        <g key={i}>
          <rect x={40 + i * 44} y={y} width={36} height={20} rx={2} fill={i < done ? C.latte : 'none'} stroke={C.mocha} />
          {merges.includes(i + 1) && i < done && <path d={`M${40 + i * 44 + 18} ${y + 24} q -${8 + i * 22} 20 -${16 + i * 44} 0`} fill="none" stroke={f} strokeWidth={1.5} />}
        </g>
      ))}
      <T x={320} y={y + 15} s={13} f={C.taupe}>rewritten</T>
      <rect x={430} y={y + 4} width={Math.max(3, 130 * (total / max))} height={14} rx={2} fill={f} />
    </g>
  );
  return (
    <Svg label="compaction_strategies_amplification.rs, measured" h={260}>
      {lane(50, 'leveled', lev, [1, 2, 3, 4, 5, 6], C.crema)}
      {lane(150, 'tiered', tier, [3, 6], C.caramel)}
      <Decode text="tiered: less rewriting" t={t} at={2.1} dur={0.45} x={40} y={246} s={15} f={C.caramel} w={700} />
    </Svg>
  );
}
// ── 8 · Measured: tiered leaves more to check (takeaway) ─────────────────
// What each tree looks like afterwards: leveled holds one tidy run, tiered
// several, some of it stale. The same lookup walks each: one stop in
// leveled, several in tiered. The cheaper compactor left the more
// expensive read.

// ── 7 · Does cheaper to run mean cheaper to read (predict) ───────────────
export function ReadAmpPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the same two compactors, a different measure"
        lines={['leveled.run_count(); tiered.run_count();', '// fewer files left behind too?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · Measured: tiered leaves more behind (takeaway) ────────────────────
export function ReadAmpReveal({ t }: StepCtx) {
  const lane = (x: number, label: string, runs: number, stale: number, f: string, at: number) => {
    const d = seg(t, at, at + 0.25 * runs + 0.2) * runs;
    return (
      <g>
        <T x={x + 90} y={28} s={13} a="middle" f={f}>{label}</T>
        {Array.from({ length: runs }, (_, i) => (
          <g key={i}>
            <rect x={x} y={44 + i * 40} width={180} height={28} rx={3} fill="none" stroke={d > i + 0.5 ? f : C.mocha} strokeWidth={1.5} />
            {i < stale && <rect x={x + 120} y={48 + i * 40} width={56} height={20} rx={2} fill={C.cherry} />}
          </g>
        ))}
        {d > 0 && d < runs && <circle cx={x - 12} cy={58 + Math.min(runs - 1, Math.floor(d)) * 40} r={6} fill={C.cinnamon} />}
        <T x={x + 90} y={70 + runs * 40} s={13} a="middle" f={f} o={seg(t, at + 0.25 * runs + 0.2, at + 0.25 * runs + 0.4)}>{runs > 1 ? 'more to check' : 'one stop'}</T>
      </g>
    );
  };
  return (
    <Svg label="compaction_strategies_amplification.rs, measured" h={260}>
      {lane(50, 'leveled', 1, 0, C.caramel, 0.4)}
      {lane(350, 'tiered', 4, 2, C.crema, 0.9)}
      <T x={350} y={250} s={13} f={C.cherryText} o={seg(t, 2.0, 2.3)}>stale data, still on disk</T>
    </Svg>
  );
}

// ── 9 · RocksDB's own words on write stalls (connecting) ──────────────────
export function WriteStallsReveal({ t }: StepCtx) {
  const stall = 1.3;
  const emit: number[] = [];
  for (let e = 0; e < stall; e += 0.11) emit.push(e);
  for (let e = stall; e < 3; e += 0.42) emit.push(e);
  const backlog = t < stall ? lerp(0, 1, easeInOut(seg(t, 0.1, stall))) : lerp(1, 0.86, easeOut(seg(t, stall, 2.6)));
  const slowed = t > stall;
  return (
    <Svg label="RocksDB Wiki: Write Stalls, quoted" h={270}>
      <T x={40} y={30} s={13} f={C.latte}>incoming writes</T>
      <line x1={40} y1={60} x2={290} y2={60} stroke={C.band} strokeWidth={14} strokeLinecap="round" />
      {emit.map((e, i) => {
        const x = 40 + (t - e) * 420;
        return t >= e && x <= 290 ? <circle key={i} cx={x} cy={60} r={5} fill={C.caramel} /> : null;
      })}
      {/* the throttle: a gate that narrows once the backlog hits its limit */}
      <rect x={296} y={lerp(46, 40, seg(t, stall, stall + 0.3))} width={10} height={lerp(28, 12, seg(t, stall, stall + 0.3))} rx={2} fill={slowed ? C.caramel : C.mocha} />
      <T x={40} y={120} s={13} f={C.latte}>flush and compaction backlog</T>
      <rect x={40} y={134} width={420} height={22} rx={3} fill={C.cocoa} />
      <rect x={40} y={134} width={Math.max(3, 400 * backlog)} height={22} rx={3} fill={C.latte} />
      <line x1={440} y1={126} x2={440} y2={164} stroke={C.cherryText} strokeWidth={2} />
      <T x={448} y={152} s={13} f={C.cherryText}>limit</T>
      <Decode text="writes slowed down" t={t} at={stall + 0.1} dur={0.45} x={330} y={66} s={13} f={C.caramel} />
      <T x={40} y={214} s={13} f={C.crema} o={seg(t, 1.6, 1.9)}>“slow down writes when flush or</T>
      <T x={40} y={236} s={13} f={C.crema} o={seg(t, 1.6, 1.9)}>compaction can't keep up”</T>
      <Draw pts={[[40, 244], [250, 244]]} t={t} from={1.9} to={2.4} stroke={C.caramel} w={1.5} pen={false} />
    </Svg>
  );
}
// ── 10 · Recap ──────────────────────────────────────────────────────────────
// The same seven runs, three ways: left alone they stay seven; tiered
// merges them into a few big ones; leveled merges them down to one. Then
// the lessons land.

// ── 10 · Recap ──────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const merge = easeInOut(seg(t, 0.6, 1.1));
  const pile = (x: number, to: number, label: string, f: string) => (
    <g>
      {Array.from({ length: 7 }, (_, i) => {
        const k = easeOut(seg(t, 0.1 + i * 0.05, 0.35 + i * 0.05));
        const j = Math.floor((i * to) / 7);
        const y = lerp(110 - i * 13, 110 - j * 13, merge);
        return <rect key={i} x={x} y={y} width={110} height={10} rx={2} fill="none" stroke={f} strokeWidth={1.5} opacity={k} />;
      })}
      <T x={x + 55} y={140} s={13} a="middle" f={f}>{label}</T>
    </g>
  );
  return (
    <Svg label="recap: what compacting buys, what it trades" h={360}>
      {pile(50, 7, 'none', C.cherryText)}
      {pile(245, 3, 'tiered', C.crema)}
      {pile(440, 1, 'leveled', C.caramel)}
      <RecapRows
        t={t}
        y0={184}
        gap={46}
        start={1.0}
        beat={0.3}
        lockAt={2.4}
        rows={[
          ['no compaction: files pile up forever', false],
          ['either real strategy beats that', true],
          ['tiered: cheaper to run', true],
          ['leveled: cheaper to read', true],
        ]}
        lock={1}
      />
    </Svg>
  );
}
