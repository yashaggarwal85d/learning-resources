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
      <Draw pts={[[30, y0 - 6], [30, yEnd + 6]]} t={t} from={start - 0.05} to={start + (rows.length - 1) * beat + 0.3} stroke={C.mocha} w={1.5} pen={false} />
      {rows.map(([r, good], i) => {
        const a = start + i * beat;
        const k = easeOut(seg(t, a, a + 0.45));
        const y = y0 + i * gap;
        const hot = i === lock;
        return (
          <g key={r}>
            <g opacity={k} transform={`translate(${((1 - k) * -24).toFixed(1)} 0)`}>
              <circle cx={30} cy={y} r={hot ? 6 : 4.5} fill={hot ? C.caramel : C.crema} />
              <T x={50} y={y + 5} s={13} f={hot ? C.caramel : C.crema} w={hot ? 700 : 500}>{r}</T>
            </g>
            {good ? <Tick x={548} y={y} k={easeOut(seg(t, a + 0.3, a + 0.65))} /> : <Cross x={548} y={y} k={easeOut(seg(t, a + 0.3, a + 0.65))} />}
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
  const txns = [0, 1, 2, 3, 4];
  return (
    <Svg label="leader_follower_group_commit_latency.rs, measured" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the same five transactions, grouped</T>
      {txns.map((i) => {
        const converge = easeOut(seg(t, 0.4 + i * 0.05, 0.6 + i * 0.05));
        const x0 = 70 + i * 50;
        const x = x0 + (190 - x0) * converge;
        return <circle key={i} cx={x} cy={76} r={4} fill={C.caramel} opacity={fa(t, 0.4 + i * 0.05, 0.2)} />;
      })}
      <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      {fa(t, 1.1, 0.4) > 0.85 && <T x={190} y={112} s={13} a="middle" f={C.mocha}>flushes: exactly one, for all five</T>}
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>one wait, shared, instead of five flushes</T>
    </Svg>
  );
}

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
  const waits = [120, 95, 70, 45, 20];
  return (
    <Svg label="leader_follower_group_commit_latency.rs, measured" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>same execution time, five latencies</T>
      {waits.map((w, i) => {
        const grow = easeOut(seg(t, 0.4 + i * 0.1, 0.7 + i * 0.1));
        const h = w * 0.25 * grow;
        return (
          <rect
            key={i}
            x={60 + i * 50}
            y={95 - h}
            width={28}
            height={h}
            fill={C.caramel}
            opacity={fa(t, 0.4 + i * 0.1, 0.2)}
          />
        );
      })}
      <rect x={60} y={95} width={260} height={1} fill={C.taupe} />
      {fa(t, 1.2, 0.4) > 0.85 && <T x={190} y={118} s={13} a="middle" f={C.mocha}>earliest-ready: longest wait</T>}
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.6, 0.4)}>latest-ready: shortest wait, same batch</T>
    </Svg>
  );
}

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
  const ack = easeOut(seg(t, 0.4, 0.6));
  const flush = easeOut(seg(t, 0.9, 1.15));
  return (
    <Svg label="leader_follower_group_commit_latency.rs, measured" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the same crash tick, two commit modes</T>
      <T x={70} y={88} s={12} f={C.latte} o={fa(t, 0.35, 0.3)}>async</T>
      <circle cx={130 + ack * 130} cy={84} r={4} fill={C.cherry} opacity={fa(t, 0.4, 0.2)} />
      <T x={70} y={118} s={12} f={C.latte} o={fa(t, 0.85, 0.3)}>sync</T>
      <Draw pts={[[130, 114], [260, 114]]} t={t} from={0.9} to={1.15} stroke={C.caramel} w={2} />
      <circle cx={130 + flush * 130} cy={114} r={4} fill={C.caramel} opacity={fa(t, 0.9, 0.2)} />
      {fa(t, 1.3, 0.4) > 0.85 && <T x={190} y={143} s={13} a="middle" f={C.mocha}>async: a false promise. sync: none</T>}
      <T x={60} y={170} s={13} f={C.latte} o={fa(t, 1.7, 0.4)}>sync never tells you before it's true</T>
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
