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

/** A chain of versions along a time line: the live one white at the end, dead ones grey, each `k` its arrival. */
function Chain({ t, x0, y, n, start, beat, shrink }: { t: number; x0: number; y: number; n: number; start: number; beat: number; shrink?: (i: number) => number }) {
  return (
    <g>
      {Array.from({ length: n + 1 }, (_, i) => {
        const k = i === 0 ? 1 : easeOut(seg(t, start + (i - 1) * beat, start + (i - 1) * beat + 0.3));
        if (k <= 0) return null;
        const newest = i === n || easeOut(seg(t, start + i * beat, start + i * beat + 0.3)) <= 0;
        const s = shrink && !newest && i > 0 ? 1 - shrink(i) : 1;
        if (s <= 0) return null;
        const cx = x0 + i * 82 + 30;
        return (
          <g key={i} transform={`translate(${cx} ${y}) scale(${(k * s).toFixed(3)})`}>
            <rect x={-30} y={-18} width={60} height={36} rx={4} fill="none" stroke={newest ? C.caramel : C.taupe} strokeWidth={newest ? 2.2 : 1.5} strokeDasharray={newest || i === 0 ? undefined : '4 3'} />
          </g>
        );
      })}
    </g>
  );
}

// A version becomes reclaimable only once no open snapshot could still
// need it, so one long-running reader genuinely blocks every reclaim
// newer than it, turning into a real, measurable storage-growth
// problem that ending the transaction, not a smarter VACUUM, actually
// fixes.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · Do dead versions reclaim while a reader stays open (predict) ─────
export function BlockedPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="one open reader, four further updates"
        lines={['chain.gc(horizon(&open_readers));', '// any of the four dead versions freed?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: none freed (no takeaway, the test's own "from" step) ───
export function BlockedReveal({ t }: StepCtx) {
  const sweep = easeInOut(seg(t, 1.5, 2.1));
  const hx = 120;
  return (
    <Svg label="version_gc_coupled_to_snapshot_lifetime.rs, measured" h={260}>
      <Chain t={t} x0={40} y={110} n={4} start={0.35} beat={0.22} />
      {/* the open reader's pin */}
      <Draw pts={[[hx, 40], [hx, 160]]} t={t} from={0.1} to={0.35} stroke={C.cinnamon} w={2.5} />
      <T x={hx} y={30} s={13} a="middle" f={C.cinnamon}>open reader</T>
      <T x={300} y={180} s={13} a="middle" f={C.taupe} o={seg(t, 1.1, 1.4)}>four dead versions, newer than the pin</T>
      {/* the cleanup pass: it can't sweep past the pin */}
      {sweep > 0 && <rect x={lerp(560, hx + 6, sweep) - 4} y={66} width={8} height={88} rx={3} fill={C.latte} opacity={1 - seg(t, 2.2, 2.4)} />}
      {sweep > 0 && <T x={560} y={58} s={13} a="end" f={C.latte} o={1 - seg(t, 2.2, 2.4)}>cleanup</T>}
      <Decode text="reclaimed: none" t={t} at={2.2} dur={0.45} x={300} y={226} s={17} a="middle" f={C.cherryText} w={700} />
      <Reticle x={hx} y={100} w={44} h={120} t={t} at={2.35} color={C.cinnamon} />
    </Svg>
  );
}
// ── 4 · Measured: all four freed (takeaway) ───────────────────────────────
// The same chain and the same pin. The reader closes: its pin lifts away,
// the cleanup pass runs the whole chain this time, and each dead version
// collapses as it passes, a tally mark per one freed.

// ── 3 · Does closing the reader free them (predict) ───────────────────────
export function FreedPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the reader closes, the identical updates stand"
        lines={['open_readers.clear(); chain.gc(horizon(&open_readers));', '// freed now, or still pinned?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: all four freed (takeaway) ───────────────────────────────
export function FreedReveal({ t }: StepCtx) {
  const lift = easeInOut(seg(t, 0.3, 0.7));
  const sweep = easeInOut(seg(t, 0.8, 1.9));
  const hx = 120;
  const sx = lerp(80, 560, sweep);
  const freed = (i: number) => easeOut(seg(sx, 40 + i * 82 + 10, 40 + i * 82 + 60));
  return (
    <Svg label="version_gc_coupled_to_snapshot_lifetime.rs, measured" h={260}>
      <Chain t={99} x0={40} y={110} n={4} start={0} beat={0} shrink={(i) => (i < 4 ? freed(i) : 0)} />
      <g opacity={1 - lift} transform={`translate(0 ${(-40 * lift).toFixed(1)})`}>
        <line x1={hx} y1={40} x2={hx} y2={160} stroke={C.cinnamon} strokeWidth={2.5} />
        <T x={hx} y={30} s={13} a="middle" f={C.cinnamon}>reader closes</T>
      </g>
      {sweep > 0 && sweep < 1 && <rect x={sx - 4} y={66} width={8} height={88} rx={3} fill={C.latte} />}
      <T x={40} y={200} s={13} f={C.latte} o={seg(t, 0.9, 1.1)}>freed</T>
      {[0, 1, 2, 3].map((i) => {
        const k = freed(i + 1);
        return k > 0 ? <line key={i} x1={110 + i * 20} y1={206} x2={110 + i * 20} y2={206 - 24 * k} stroke={C.caramel} strokeWidth={3} strokeLinecap="round" /> : null;
      })}
      <Decode text="all four reclaimed" t={t} at={2.0} dur={0.45} x={300} y={240} s={17} a="middle" f={C.caramel} w={700} />
    </Svg>
  );
}
// ── 8 · End long-running open transactions directly (takeaway) ───────────
// A view of open backends, each with its transaction's age as a bar. Most
// stay short; one keeps growing. The check finds it, it is ended, and its
// bar drops away: that's the fix, not another vacuum pass.

// ── 5 · Does the long-lived run retain more (predict) ─────────────────────
export function ComparePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the identical workload, two reader lifetimes"
        lines={['retained_short vs retained_long, same workload', '// the same count, or genuinely different?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: the long-lived run retains far more (takeaway) ─────────
export function CompareReveal({ t }: StepCtx) {
  const steps = 12;
  const p = seg(t, 0.3, 2.1) * steps;
  const n = Math.floor(p);
  const shortKept = (k: number) => (k < 3 ? k : 1 + (k % 2));
  const lane = (y: number, long: boolean, label: string) => {
    const kept = long ? n : shortKept(n);
    return (
      <g>
        <T x={40} y={y - 12} s={13} f={long ? C.cherryText : C.latte}>{label}</T>
        {Array.from({ length: kept }, (_, i) => (
          <rect key={i} x={40 + i * 42} y={y} width={36} height={26} rx={3} fill="none" stroke={long ? C.cherryText : C.latte} strokeWidth={1.5} strokeDasharray="4 3" />
        ))}
        <rect x={40 + kept * 42} y={y} width={36} height={26} rx={3} fill="none" stroke={C.caramel} strokeWidth={2.2} opacity={seg(t, 0.1, 0.3)} />
      </g>
    );
  };
  return (
    <Svg label="version_gc_coupled_to_snapshot_lifetime.rs, measured" h={260}>
      {lane(56, false, 'short-lived reader')}
      {lane(146, true, 'long-lived reader')}
      <Decode text="far more retained" t={t} at={2.1} dur={0.45} x={300} y={228} s={15} a="middle" f={C.cherryText} w={700} />
    </Svg>
  );
}

// ── 7 · Does ending the transaction free space VACUUM can't (predict) ────
export function EndTransactionsPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="PostgreSQL's own guidance on long-running transactions"
        lines={['// does ending one free space VACUUM alone cannot?', '// or does VACUUM handle it regardless?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · End long-running open transactions directly (takeaway) ───────────
export function EndTransactionsReveal({ t }: StepCtx) {
  const ages = [0.16, 0.24, 1, 0.12];
  const grow = easeInOut(seg(t, 0.2, 1.3));
  const end = easeInOut(seg(t, 1.9, 2.3));
  return (
    <Svg label="PostgreSQL Docs: 24.1. Routine Vacuuming, quoted" h={270}>
      <T x={40} y={22} s={13} f={C.taupe}>pg_stat_activity</T>
      <T x={180} y={46} s={13} f={C.taupe}>age(backend_xmin)</T>
      {ages.map((a, i) => {
        const y = 60 + i * 38;
        const long = a === 1;
        const w = 360 * a * grow * (long ? 1 - end : 1);
        return (
          <g key={i}>
            <T x={40} y={y + 17} s={13} f={long ? C.cherryText : C.latte}>backend</T>
            <rect x={180} y={y} width={Math.max(3, w)} height={24} rx={3} fill={long ? C.cherryText : C.latte} />
            {long && end > 0 && <line x1={36} y1={y + 12} x2={lerp(36, 112, end)} y2={y + 12} stroke={C.cherryText} strokeWidth={2} />}
          </g>
        );
      })}
      <Reticle x={360} y={148} w={380} h={36} t={t} at={1.35} color={C.cherryText} />
      <Decode text="ended" t={t} at={2.2} dur={0.35} x={200} y={153} s={15} f={C.caramel} w={700} />
      <T x={40} y={234} s={13} f={C.crema} o={seg(t, 1.7, 2.0)}>“End long-running open transactions.”</T>
      <Draw pts={[[40, 242], [340, 242]]} t={t} from={2.0} to={2.5} stroke={C.caramel} w={1.5} pen={false} />
    </Svg>
  );
}
// ── 9 · PostgreSQL's own words on the xmin horizon (connecting) ──────────
// Each backend's own xmin lands as a marker on the transaction axis. The
// horizon slides in from the newest end and settles on the oldest of them:
// nothing newer than that line can be reclaimed.

// ── 9 · PostgreSQL's own words on the xmin horizon (connecting) ──────────
export function HorizonReveal({ t }: StepCtx) {
  const marks = [430, 180, 360, 510];
  const minX = Math.min(...marks);
  const slide = easeInOut(seg(t, 1.1, 1.8));
  const hx = lerp(570, minX, slide);
  return (
    <Svg label="PostgreSQL Docs: 27.2.3. pg_stat_activity, quoted" h={260}>
      <Draw pts={[[40, 150], [570, 150]]} t={t} from={0.05} to={0.4} stroke={C.mocha} w={1.5} pen={false} />
      <T x={570} y={174} s={13} a="end" f={C.taupe}>newer →</T>
      {marks.map((x, i) => {
        const k = easeOut(seg(t, 0.3 + i * 0.15, 0.6 + i * 0.15));
        return (
          <g key={i} opacity={k} transform={`translate(0 ${((1 - k) * -30).toFixed(1)})`}>
            <line x1={x} y1={110 - i * 18} x2={x} y2={150} stroke={x === minX ? C.crema : C.latte} strokeWidth={1.5} />
            <circle cx={x} cy={110 - i * 18} r={6} fill={x === minX ? C.crema : C.latte} />
          </g>
        );
      })}
      <T x={40} y={34} s={13} f={C.latte} o={seg(t, 0.4, 0.7)}>each backend's own backend_xmin</T>
      {slide > 0 && <rect x={hx - 2} y={40} width={4} height={124} rx={2} fill={C.caramel} />}
      <Decode text="xmin horizon" t={t} at={1.8} dur={0.4} x={minX + 12} y={60} s={15} f={C.caramel} w={700} />
      <T x={40} y={226} s={13} f={C.crema} o={seg(t, 1.9, 2.2)}>“The current backend's xmin horizon.”</T>
      <Draw pts={[[40, 234], [340, 234]]} t={t} from={2.1} to={2.55} stroke={C.caramel} w={1.5} pen={false} />
    </Svg>
  );
}
// ── 10 · Recap ─────────────────────────────────────────────────────────────
// A pin holds the chain; dead versions pile up behind it. The pin lifts,
// and they all collapse. Then the lessons land.

// ── 10 · Recap ─────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const lift = easeInOut(seg(t, 0.8, 1.1));
  const free = (i: number) => easeOut(seg(t, 1.0 + i * 0.08, 1.3 + i * 0.08));
  return (
    <Svg label="recap: what pins a version, what frees it" h={340}>
      <Chain t={t} x0={60} y={50} n={4} start={0.15} beat={0.12} shrink={(i) => (i < 4 ? free(i) : 0)} />
      <g opacity={1 - lift} transform={`translate(0 ${(-30 * lift).toFixed(1)})`}>
        <line x1={140} y1={14} x2={140} y2={86} stroke={C.cinnamon} strokeWidth={2.5} />
      </g>
      <RecapRows
        t={t}
        y0={130}
        gap={54}
        start={1.0}
        beat={0.3}
        lockAt={2.4}
        rows={[
          ['reclaimable: only once no open snapshot needs it', true],
          ['one long reader: blocks everything newer', false],
          ['the result: real, measurable storage growth', false],
          ['the fix: end the transaction, not a smarter VACUUM', true],
        ]}
        lock={3}
      />
    </Svg>
  );
}
