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

// Without grouping, every transaction pays for its own flush; group
// commit trades a short wait for one flush instead of many. Inside one
// batch, commit latency is entirely about how long the shared flush
// made you wait, not about any transaction's own execution time. And
// asynchronous commit's own risk window is real: acknowledging before
// the flush can tell a client something that wasn't true yet.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · How many flushes with no grouping (predict, hook) ────────────────
export function NoGroupingPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="five transactions, ready together, no grouping"
        lines={['commit_without_grouping(&mut wal, &ready_ticks);', '// one flush, or one per transaction?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: one flush per transaction (takeaway) ───────────────────
export function NoGroupingReveal({ t }: StepCtx) {
  const ys = [40, 80, 120, 160, 200];
  const start = 0.25, trip = 0.42;
  return (
    <Svg label="leader_follower_group_commit_latency.rs, measured" h={270}>
      <T x={60} y={20} s={13} f={C.taupe}>ready together</T>
      <rect x={430} y={70} width={120} height={100} rx={6} fill="none" stroke={C.crema} strokeWidth={1.5} />
      <T x={490} y={126} s={15} a="middle" f={C.crema}>disk</T>
      {ys.map((y, i) => {
        const a = start + i * trip;
        const k = easeInOut(seg(t, a, a + trip));
        const x = lerp(80, 470, k);
        const yy = lerp(y, 120, k);
        const landed = t >= a + trip;
        return (
          <g key={i}>
            {!landed && <circle cx={x} cy={yy} r={9} fill={C.caramel} opacity={easeOut(seg(t, 0, 0.2))} />}
            {landed && <circle cx={80} cy={y} r={9} fill="none" stroke={C.mocha} />}
            {/* one tally mark per flush */}
            {landed && <line x1={448 + i * 20} y1={200} x2={448 + i * 20} y2={lerp(200, 226, easeOut(seg(t, a + trip, a + trip + 0.15)))} stroke={C.caramel} strokeWidth={3} strokeLinecap="round" />}
          </g>
        );
      })}
      {/* the disk jolts on every flush */}
      {ys.map((_, i) => {
        const a = start + (i + 1) * trip;
        const pulse = seg(t, a, a + 0.2);
        return pulse > 0 && pulse < 1 ? <rect key={i} x={430 - 6 * (1 - pulse)} y={70 - 6 * (1 - pulse)} width={120 + 12 * (1 - pulse)} height={100 + 12 * (1 - pulse)} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} opacity={1 - pulse} /> : null;
      })}
      <Decode text="flushes: five, one each" t={t} at={2.45} dur={0.45} x={300} y={256} s={15} a="middle" f={C.caramel} w={700} />
    </Svg>
  );
}
// ── 9 · PostgreSQL's own words on asynchronous commit (connecting, no takeaway) ──
// A log of commits along a time line, already acknowledged. The crash
// lands before the flush: only the newest, unflushed commits drop away,
// and everything before them stays lined up and whole.

// ── 3 · How many flushes when grouped (predict) ───────────────────────────
export function GroupedPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the same five, grouped under one leader"
        lines={['commit_with_grouping(&mut wal, &ready_ticks, delay);', '// still five flushes, or just one?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: exactly one flush (takeaway) ────────────────────────────
export function GroupedReveal({ t }: StepCtx) {
  const ys = [40, 80, 120, 160, 200];
  const go = easeInOut(seg(t, 1.5, 2.0));
  return (
    <Svg label="leader_follower_group_commit_latency.rs, measured" h={270}>
      <T x={60} y={20} s={13} f={C.taupe}>ready, one by one</T>
      <rect x={430} y={70} width={120} height={100} rx={6} fill="none" stroke={C.crema} strokeWidth={1.5} />
      <T x={490} y={60} s={15} a="middle" f={C.crema}>disk</T>
      <rect x={210} y={86} width={70} height={68} rx={8} fill="none" stroke={C.latte} strokeDasharray="4 3" opacity={seg(t, 0.2, 0.4) * (1 - go)} />
      <T x={245} y={176} s={13} a="middle" f={C.latte} o={seg(t, 0.3, 0.5) * (1 - go)}>leader waits</T>
      {ys.map((y, i) => {
        const join = easeInOut(seg(t, 0.2 + i * 0.22, 0.55 + i * 0.22));
        const gx = 230 + (i % 3) * 15;
        const gy = 105 + Math.floor(i / 3) * 26;
        const x = lerp(lerp(80, gx, join), gx + 240, go);
        const yy = lerp(y, gy, join);
        return <circle key={i} cx={x} cy={yy} r={8} fill={i === 0 ? C.caramel : C.crema} />;
      })}
      {go >= 1 && <line x1={480} y1={200} x2={480} y2={lerp(200, 226, easeOut(seg(t, 2.0, 2.15)))} stroke={C.caramel} strokeWidth={3} strokeLinecap="round" />}
      <Decode text="flushes: exactly one" t={t} at={2.1} dur={0.45} x={300} y={256} s={15} a="middle" f={C.caramel} w={700} />
    </Svg>
  );
}
// ── 6 · Measured: it genuinely differs (takeaway) ─────────────────────────
// Five transactions with identical work become ready at different moments,
// and all are acknowledged by the same shared flush. Each one's latency
// draws from its own ready time to that one flush: the earliest-ready
// draws the longest line.

// ── 5 · Does commit latency differ though execution didn't (predict) ─────
export function LatencyPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="identical execution time, one shared batch"
        lines={['commit_latency(&txn); // ready_tick to commit_done_tick', '// identical for all, or does it differ?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: it genuinely differs (takeaway) ─────────────────────────
export function LatencyReveal({ t }: StepCtx) {
  const ready = [0, 0.18, 0.36, 0.54, 0.72];
  const X = (s: number) => 165 + s * 380;
  const flush = 0.9;
  return (
    <Svg label="leader_follower_group_commit_latency.rs, measured" h={260}>
      <line x1={X(flush)} y1={24} x2={X(flush)} y2={210} stroke={C.caramel} strokeWidth={2.5} opacity={seg(t, 0.2, 0.4)} />
      <T x={X(flush)} y={232} s={13} a="middle" f={C.caramel} o={seg(t, 0.2, 0.4)}>one flush</T>
      {ready.map((r, i) => {
        const y = 44 + i * 38;
        const a = 0.4 + i * 0.2;
        return (
          <g key={i}>
            <T x={40} y={y + 5} s={13} f={i === 0 ? C.crema : C.latte}>{i === 0 ? 'first ready' : i === 4 ? 'last ready' : 'txn'}</T>
            <circle cx={X(r)} cy={y} r={6} fill={i === 0 ? C.caramel : C.crema} opacity={seg(t, a - 0.2, a)} />
            <Draw pts={[[X(r), y], [X(flush), y]]} t={t} from={a} to={a + 0.5} stroke={i === 0 ? C.caramel : C.latte} w={i === 0 ? 4 : 2.5} pen={false} />
          </g>
        );
      })}
      <Reticle x={(X(0) + X(flush)) / 2} y={44} w={X(flush) - X(0) + 24} h={26} t={t} at={2.0} />
      <T x={300} y={256} s={13} a="middle" f={C.latte} o={seg(t, 2.1, 2.4)}>same work, five different waits</T>
    </Svg>
  );
}
// ── 8 · Measured: a false promise, only for async (takeaway) ─────────────
// Two commits, the same crash tick. The async one is told "committed" at
// once, before its flush; the crash lands in the gap and the promise
// breaks. The sync one waits for its flush before saying a word, so the
// same crash finds nothing false.

// ── 7 · Does an async-acknowledged txn survive a crash in the gap (predict) ──
export function AsyncPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="acknowledged early, a crash in the gap"
        lines={['async_txn.acknowledged_tick; // before its own flush', '// survives the crash, or not?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · Measured: a false promise, only for async (takeaway) ─────────────
export function AsyncReveal({ t }: StepCtx) {
  const crash = 1.1;
  const X = (s: number) => 140 + s * 380;
  const lane = (y: number, label: string, ackAt: number, sync: boolean) => (
    <g>
      <T x={40} y={y + 5} s={13} f={C.latte}>{label}</T>
      <Draw pts={[[X(0), y], [X(1), y]]} t={t} from={0.2} to={0.6} stroke={C.mocha} w={1.5} pen={false} />
      <circle cx={X(ackAt)} cy={y} r={7} fill={sync ? C.caramel : C.cinnamon} opacity={seg(t, 0.5 + ackAt, 0.7 + ackAt)} />
      <T x={X(ackAt)} y={y - 16} s={13} a="middle" f={sync ? C.caramel : C.cinnamon} o={seg(t, 0.5 + ackAt, 0.7 + ackAt)}>ack</T>
      <rect x={X(0.75) - 3} y={y - 9} width={6} height={18} fill={sync ? C.crema : C.mocha} opacity={seg(t, 0.4, 0.6)} />
      <T x={X(0.75)} y={y + 28} s={13} a="middle" f={C.taupe} o={seg(t, 0.4, 0.6)}>flush</T>
    </g>
  );
  return (
    <Svg label="leader_follower_group_commit_latency.rs, measured" h={260}>
      {lane(60, 'async', 0.1, false)}
      {lane(150, 'sync', 0.8, true)}
      <Draw pts={[[X(0.45), 24], [X(0.45), 190]]} t={t} from={crash} to={crash + 0.3} stroke={C.cherryText} w={2} />
      <T x={X(0.45)} y={210} s={13} a="middle" f={C.cherryText} o={seg(t, crash + 0.2, crash + 0.4)}>crash</T>
      <Cross x={X(0.1) - 7} y={92} k={easeOut(seg(t, 1.6, 1.9))} />
      <Decode text="a false promise" t={t} at={1.7} dur={0.4} x={40} y={118} s={13} f={C.cherryText} w={700} />
      <Tick x={X(0.8) + 16} y={150} k={easeOut(seg(t, 2.0, 2.3))} />
      <T x={300} y={248} s={13} a="middle" f={C.latte} o={seg(t, 2.2, 2.5)}>sync never tells you before it's true</T>
    </Svg>
  );
}

// ── 9 · PostgreSQL's own words on asynchronous commit (connecting, no takeaway) ──
export function PgAsyncReveal({ t }: StepCtx) {
  const n = 8;
  const crash = 1.2;
  const flushedUpTo = 5; // the commits already flushed when the crash hits
  return (
    <Svg label="PostgreSQL docs, quoted" h={260}>
      <Draw pts={[[40, 110], [560, 110]]} t={t} from={0.1} to={0.6} stroke={C.mocha} w={1.5} pen={false} />
      {Array.from({ length: n }, (_, i) => {
        const x = 60 + i * 60;
        const arrive = easeOut(seg(t, 0.15 + i * 0.1, 0.4 + i * 0.1));
        const lost = i >= flushedUpTo;
        const fall = lost ? easeInOut(seg(t, crash + 0.15, crash + 0.8)) : 0;
        return (
          <rect key={i} x={x} y={80 + (1 - arrive) * -16 + fall * 60} width={40} height={26} rx={3}
            fill={lost && fall > 0 ? 'none' : C.crema} stroke={lost && fall > 0 ? C.cherryText : 'none'} strokeWidth={2}
            opacity={arrive * (1 - fall * 0.5)} />
        );
      })}
      <Draw pts={[[352, 40], [352, 180]]} t={t} from={crash} to={crash + 0.25} stroke={C.cherryText} w={2} />
      {t > crash + 0.25 && <T x={352} y={32} s={13} a="middle" f={C.cherryText}>crash</T>}
      <Draw pts={[[60, 232], [340, 232]]} t={t} from={2.0} to={2.5} stroke={C.caramel} w={1.5} pen={false} />
      <T x={60} y={222} s={13} f={C.caramel} o={seg(t, 2.0, 2.3)}>“data loss, not data corruption”</T>
      <T x={380} y={196} s={13} f={C.cherryText} o={seg(t, 1.7, 2.0)}>most recent: lost</T>
    </Svg>
  );
}
// ── 10 · Recap ──────────────────────────────────────────────────────────────
// Five transactions collapse into one flush across the top, then the
// lessons land one per beat; the lock-on settles on the one flush.

// ── 10 · Recap ──────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const merge = easeInOut(seg(t, 0.2, 0.9));
  return (
    <Svg label="recap: what grouping buys, what async gives up" h={320}>
      {[0, 1, 2, 3, 4].map((i) => (
        <circle key={i} cx={lerp(80 + i * 50, 300, merge)} cy={40} r={8} fill={C.caramel} opacity={i === 2 ? 1 : 1 - seg(t, 0.85, 1.0)} />
      ))}
      <Draw pts={[[310, 40], [500, 40]]} t={t} from={0.9} to={1.2} stroke={C.caramel} w={2} />
      <T x={510} y={45} s={13} f={C.crema} o={seg(t, 1.1, 1.3)}>disk</T>
      <RecapRows
        t={t}
        y0={100}
        gap={56}
        start={1.0}
        beat={0.3}
        lockAt={2.4}
        rows={[
          ['no grouping: one flush per transaction', true],
          ['grouped: one flush for the whole batch', true],
          ['latency is the wait, not execution time', true],
          ['async commit: faster, but can lie briefly', false],
        ]}
        lock={1}
      />
    </Svg>
  );
}
